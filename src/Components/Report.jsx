import React, { useEffect, useState } from 'react';

const categories = ["roads", "electricity", "water", "healthcare", "education", "general"];

function Report({ results }) {
  const [gptReports, setGptReports] = useState({});
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  // Fetch GPT-enhanced reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      if (!results || results.length === 0) return;

      setLoadingReport(true);
      try {
        const response = await fetch("http://localhost:5000/generate-full-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            feedback: results.map(r => r.text)
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.report) {
          setGptReports(result.report);
        } else {
          setError("No report data received from server.");
        }
      } catch (err) {
        setError("Failed to load enhanced reports. Check console for details.");
        console.error("Error fetching reports:", err);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchReports();
  }, [results]);

  if (loadingReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="text-xl font-medium text-gray-600">Generating report, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold p-8">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-16 max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Feedback Analysis Report
      </h1>

      {categories.map(category => {
        const report = gptReports[category];
        if (!report) return null;

        return (
          <div
            key={category}
            className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500 transition-all duration-300 hover:shadow-xl"
          >
            {/* Category Heading */}
            <h2 className="text-3xl font-bold capitalize text-gray-900 mb-4">{category}</h2>

            {/* GPT Generated Paragraph */}
            <div className="text-gray-700 leading-relaxed mb-6 text-lg whitespace-pre-wrap">
              {report.summary || "No detailed analysis available."}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-700 font-semibold">
                  Positive Feedback:{" "}
                  {((report.positive_percentage / 100) * report.total_sentences).toFixed(0)}{" "}
                  ({report.positive_percentage}%)
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold">
                  Negative Feedback:{" "}
                  {((report.negative_percentage / 100) * report.total_sentences).toFixed(0)}{" "}
                  ({report.negative_percentage}%)
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Report;