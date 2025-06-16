import React, { useState, useEffect } from 'react';
import PieChart from './Components/PieChart';
import BarChart from './Components/BarChart';
import Report from './Components/Report';
import SentenceItem from './Components/SentenceItem';
import FilterDropdown from './Components/FilterDropdown';

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(() => {
  const savedResults = localStorage.getItem("analysisResults");
  return savedResults ? JSON.parse(savedResults) : [];
  });
  useEffect(() => {
  localStorage.setItem("analysisResults", JSON.stringify(results));
  }, [results]);
  const [showChart, setShowChart] = useState("bar"); // bar / pie / none
  const [view, setView] = useState("analysis"); // analysis / report

  const [classificationFilter, setClassificationFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence: input })
      });

      if (!res.ok) throw new Error("API error");

      const backendData = await res.json();

      const resultEntry = {
        id: Date.now(),
        text: input,
        confidence: backendData.confidence || 0,
        summary: backendData.topic || "No topic found",
        label: backendData.label === "POSITIVE" ? "Good" : "Bad",
        category: backendData.category || "general"
      };

      setResults([resultEntry, ...results]);
      setInput("");

    } catch (err) {
      alert("Failed to classify sentence.");
      console.error(err);
    }
  };

  const getFilteredResults = () => {
    return results
      .filter(item => classificationFilter === "All" || item.label === classificationFilter)
      .filter(item => categoryFilter === "All" || item.category === categoryFilter);
  };

  const filteredResults = getFilteredResults();
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const currentResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-16 px-4">
      {/* Main Card */}
      <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-300 hover:shadow-3xl">

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setView("analysis")}
            className={`px-6 py-3 rounded-full font-medium transition-all transform duration-300 ${
              view === "analysis"
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setView("report")}
            className={`px-6 py-3 rounded-full font-medium transition-all transform duration-300 ${
              view === "report"
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
            }`}
          >
            Report
          </button>
        </div>

        {/* Views */}
        {view === "analysis" && (
          <>
            {/* Heading */}
            <h1 className="text-5xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Sentiment Analysis
            </h1>

            {/* Input Form */}
            <div className="flex flex-col items-center space-y-6 mb-12">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a sentence..."
                className="w-full max-w-xs px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-sm"
              />
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300"
              >
                Analyze
              </button>
            </div>

            {/* Visualization Toggle */}
            <div className="mt-8 flex justify-center gap-4 mb-12">
              {["bar", "pie", "none"].map((type) => (
                <button
                  key={type}
                  onClick={() => setShowChart(type)}
                  className={`px-6 py-3 rounded-full font-medium transition-all transform duration-300 ${
                    showChart === type
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </button>
              ))}
            </div>

            {/* Chart Section */}
            <div className="mb-16 overflow-hidden">
              {showChart === 'pie' && (
                <PieChart results={filteredResults} show={showChart === 'pie'} />
              )}
              {showChart === 'bar' && (
                <BarChart results={filteredResults} show={showChart === 'bar'} />
              )}
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto mt-10 rounded-xl shadow-sm">
              <table className="min-w-full bg-white/95 backdrop-blur-md rounded-xl overflow-hidden shadow-inner">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white uppercase text-xs md:text-sm leading-normal">
                  <tr>
                    {/* Summary / Topic */}
                    <th className="py-4 px-6 text-left">Summary / Topic</th>

                    {/* Classification with Filter */}
                    <th className="py-4 px-6 text-left relative">
                      <div className="flex items-center space-x-2 group">
                        <span>Classification</span>
                        <FilterDropdown
                          options={["All", "Good", "Bad"]}
                          selected={classificationFilter}
                          onSelect={(value) => setClassificationFilter(value)}
                        />
                      </div>
                    </th>

                    {/* Category with Filter */}
                    <th className="py-4 px-6 text-left relative">
                      <div className="flex items-center space-x-2 group">
                        <span>Category</span>
                        <FilterDropdown
                          options={["All", ...new Set(results.map((r) => r.category || "general"))]}
                          selected={categoryFilter}
                          onSelect={(value) => setCategoryFilter(value)}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-xs md:text-sm font-light">
                  {currentResults.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-10 px-6 text-center italic text-gray-400">
                        No sentences match the current filters.
                      </td>
                    </tr>
                  ) : (
                    currentResults.map((item) => (
                      <SentenceItem key={item.id} item={item} />
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-4 py-3 bg-white rounded-b-xl border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{currentResults.length}</span> of{" "}
                    <span className="font-semibold">{filteredResults.length}</span> results
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      Previous
                    </button>

                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold">{currentPage}</span> of{" "}
                      <span className="font-semibold">{totalPages}</span>
                    </span>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {view === "report" && (
          <Report results={results} />
        )}

      </div>
    </div>
  );
}

export default App;