from flask import Flask, request, jsonify
from flask_cors import CORS
import model


app = Flask(__name__)
CORS(app)

@app.route("/classify", methods=["POST"])
def classify():
    """Classify a single sentence."""
    data = request.get_json()
    sentence = data.get("sentence", "")
    
    if not sentence:
        return jsonify({"error": "No sentence provided"}), 400

    result = model.classify_sentence(sentence)
    return jsonify(result)


@app.route("/analyze", methods=["POST"])
def analyze():
    """Analyze multiple sentences and return a category-wise report."""
    data = request.get_json()
    sentences = data.get("sentences", [])
    
    if not sentences:
        return jsonify({"error": "No sentences provided"}), 400

    result = model.generate_category_report(sentences)
    return jsonify(result)


@app.route("/generate-full-report", methods=["POST"])
def generate_full_report():
    data = request.get_json()
    sentences = data.get("feedback", [])
    
    if not sentences:
        return jsonify({"error": "No feedback provided"}), 400

    try:
        enhanced_report = model.generate_full_report(sentences)
        return jsonify(enhanced_report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)