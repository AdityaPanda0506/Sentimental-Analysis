from collections import Counter
from heapq import nlargest
from string import punctuation

# Transformers and NLP models
from transformers import pipeline
import spacy
from spacy.lang.en.stop_words import STOP_WORDS

# OpenAI-compatible API setup
import openai
from dotenv import load_dotenv
import os

load_dotenv()  # This loads the .env file

API_KEY = os.getenv("OPENROUTER_API_KEY")

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",    
    api_key=API_KEY
)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load Transformers pipelines
classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
summarizer = pipeline('summarization', model='t5-base', tokenizer='t5-base', framework='pt')

# 🚀 Custom topic filters
TOPIC_FILTERS = {
    "roads": ["road", "street", "highway", "pothole", "traffic", "bridge"],
    "electricity": ["electricity", "power", "current", "voltage", "blackout"],
    "water": ["water", "supply", "pipe", "tanker", "leak", "drinking water"],
    "healthcare": ["hospital", "clinic", "doctor", "nurse", "ambulance"],
    "education": ["school", "college", "teacher", "student", "exam"],
}

def detect_category(sentence):
    sentence_lower = sentence.lower()
    for category, keywords in TOPIC_FILTERS.items():
        if any(word in sentence_lower for word in keywords):
            return category
    return "general"

def extract_main_topic(text):
    doc = nlp(text)

    tokens = [token.text.lower() for token in doc if not token.is_stop and not token.is_punct]
    word_freq = Counter(tokens)

    if word_freq:
        max_freq = max(word_freq.values())
        for word in tokens:
            word_freq[word] = word_freq[word] / max_freq

    sent_token = [sent.text for sent in doc.sents]
    sent_score = {}

    for sent in sent_token:
        for word in sent.split():
            word_lower = word.lower()
            if word_lower in word_freq:
                sent_score[sent] = sent_score.get(sent, 0) + word_freq[word_lower]

    num_sentences = min(2, len(sent_token))
    top_sentences = nlargest(num_sentences, sent_score, key=sent_score.get)
    summarized_text = " ".join(top_sentences)

    # Truncate to avoid T5 error
    summarized_text = " ".join(summarized_text.split()[:100])

    # Final summary using T5
    try:
        summary = summarizer("summarize: " + summarized_text, max_length=25, min_length=10, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        print("Summarization failed:", str(e))
        for chunk in doc.noun_chunks:
            return chunk.text
        return "general issue"


def classify_sentence(sentence):
    sentence_lower = sentence.lower()

    # Strong positive words
    if any(word in sentence_lower for word in ["love", "amazing", "excellent", "great"]):
        return {
            "label": "POSITIVE",
            "confidence": 0.95,
            "topic": extract_main_topic(sentence),
            "category": detect_category(sentence)
        }

    # Strong negative words
    if any(word in sentence_lower for word in ["hate", "terrible", "awful", "worst"]):
        return {
            "label": "NEGATIVE",
            "confidence": 0.95,
            "topic": extract_main_topic(sentence),
            "category": detect_category(sentence)
        }

    # Run transformer model only if unsure
    result = classifier(sentence)[0]
    topic = extract_main_topic(sentence)
    category = detect_category(sentence)

    return {
        "label": result["label"],
        "confidence": round(result["score"], 4),
        "topic": topic,
        "category": category
    } 

def generate_category_summary(category, sentences):
    """Generate an abstractive summary using extractive + T5 logic."""
    if not sentences:
        return "No feedback available for this category."

    # Step 1: Combine all sentences into one large text block
    full_text = " ".join(sentences)

    # Step 2: Use spaCy for extractive summarization
    doc = nlp(full_text)

    tokens = [token.text.lower() for token in doc if not token.is_stop and not token.is_punct]
    word_freq = Counter(tokens)

    if word_freq:
        max_freq = max(word_freq.values())
        for word in tokens:
            word_freq[word] = word_freq[word] / max_freq

    sent_token = [sent.text for sent in doc.sents]
    sent_score = {}

    for sent in sent_token:
        for word in sent.split():
            word_lower = word.lower()
            if word_lower in word_freq:
                sent_score[sent] = sent_score.get(sent, 0) + word_freq[word_lower]

    num_sentences = min(2, len(sent_token))
    top_sentences = nlargest(num_sentences, sent_score, key=sent_score.get)
    summarized_text = " ".join(top_sentences)

    # Truncate to avoid T5 error
    summarized_text = " ".join(summarized_text.split()[:100])

    # Step 3: Final abstractive summary using T5
    try:
        summary = summarizer("summarize: " + summarized_text, max_length=25, min_length=10, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        print("Summarization failed:", str(e))
        for chunk in doc.noun_chunks:
            return chunk.text
        return "general issue"


def generate_category_report(sentences):
    category_data = {cat: {"total": 0, "positive": 0, "negative": 0} for cat in TOPIC_FILTERS}
    category_sentences = {cat: [] for cat in TOPIC_FILTERS}

    for sentence in sentences:
        result = classify_sentence(sentence)
        category = result["category"]
        sentiment = result["label"]

        if category in category_data:
            category_data[category]["total"] += 1
            if sentiment == "POSITIVE":
                category_sentences[category].append({"type": "positive", "text": sentence})
            elif sentiment == "NEGATIVE":
                category_sentences[category].append({"type": "negative", "text": sentence})

    report = {}

    for category in TOPIC_FILTERS:
        entries = category_sentences.get(category, [])
        total = len(entries)

        if total == 0:
            continue

        pos_count = sum(1 for e in entries if e['type'] == 'positive')
        neg_count = total - pos_count

        pos_percent = round((pos_count / total) * 100, 2)
        neg_percent = round((neg_count / total) * 100, 2)

        sample_sentences = [e['text'] for e in entries[:3]]
        full_sentences = [e['text'] for e in entries]

        # Generate summary using extractive + T5 logic
        summary = generate_category_summary(category, full_sentences)

        report[category] = {
            "total_sentences": total,
            "positive_count": pos_count,
            "negative_count": neg_count,
            "positive_percentage": pos_percent,
            "negative_percentage": neg_percent,
            "sample_sentences": sample_sentences,
            "paragraph": summary
        }

    return {
        "report": report
    }


def generate_gpt_report(report_data):
    """
    Send category report data to GPT via OpenRouter and get a formatted summary.
    """
    gpt_enhanced = {}

    for category, data in report_data["report"].items():
        prompt = f"""
Analyze the following feedback about '{category}':
"{'. '.join(data['sample_sentences'])}"

Summarize the sentiment and key issues clearly.
Include:
- A short heading
- Summary paragraph
- Percentage of positive/negative feedback
"""

        try:
            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a report generator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            gpt_summary = response.choices[0].message.content.strip()
            gpt_enhanced[category] = {
                "summary": gpt_summary,
                "positive_percentage": data["positive_percentage"],
                "negative_percentage": data["negative_percentage"],
                "total_sentences": data["total_sentences"]
            }
        except Exception as e:
            print("GPT error:", str(e))
            gpt_enhanced[category] = {
                "summary": "Error generating summary.",
                "positive_percentage": 0,
                "negative_percentage": 0,
                "total_sentences": 0
            }

    return {
        "report": gpt_enhanced
    }


def generate_full_report(feedback_sentences):
    raw_report = generate_category_report(feedback_sentences)
    gpt_enhanced_report = generate_gpt_report(raw_report)
    return gpt_enhanced_report