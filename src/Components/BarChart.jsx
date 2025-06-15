import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartJS from "chart.js/auto";

function BarChart({ results, show }) {
  const [colorTheme, setColorTheme] = useState({
    name: "Ocean",
    colors: ["#3498db", "#2ecc71"],
    gradient: "from-blue-100 to-blue-200",
  });
  const [showAxisLabels, setShowAxisLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!show || !results || results.length === 0) return null;

  // Count sentiments by category
  const categoryCounts = {};

  results.forEach((item) => {
    const category = item.category || "general";
    const label = item.label;

    if (!categoryCounts[category]) {
      categoryCounts[category] = { Good: 0, Bad: 0 };
    }

    categoryCounts[category][label]++;
  });

  const labels = Object.keys(categoryCounts);
  const goodData = labels.map((cat) => categoryCounts[cat].Good);
  const badData = labels.map((cat) => categoryCounts[cat].Bad);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Good",
        data: goodData,
        backgroundColor: colorTheme.colors[0],
        borderRadius: 4,
      },
      {
        label: "Bad",
        data: badData,
        backgroundColor: colorTheme.colors[1],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Disable default legend (we'll add a custom one)
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
            const percent = ((ctx.raw / total) * 100).toFixed(1);
            return `${ctx.label}: ${ctx.raw} sentence(s) (${percent}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Sentiment Distribution by Category",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: showGrid,
        },
        ticks: {
          font: {
            size: 12,
            weight: "bold",
          },
          color: colorTheme.colors[0],
        },
        title: {
          display: showAxisLabels,
          text: "Category",
          font: {
            size: 14,
            weight: "bold",
          },
          color: colorTheme.colors[0],
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          display: showGrid,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: "bold",
          },
          color: colorTheme.colors[0],
        },
        title: {
          display: showAxisLabels,
          text: "Sentence Count",
          font: {
            size: 14,
            weight: "bold",
          },
          color: colorTheme.colors[0],
        },
      },
    },
  };

  return (
    <div className="mt-6 p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
        Sentiment by Category
      </h2>

      {/* Color Theme Selector */}
      <div className="flex justify-between items-center mb-6">
        <select
          value={colorTheme.name}
          onChange={(e) =>
            setColorTheme(
              {
                Ocean: {
                  name: "Ocean",
                  colors: ["#3498db", "#2ecc71"],
                  gradient: "from-blue-100 to-blue-200",
                },
                Pastel: {
                  name: "Pastel",
                  colors: ["#FFD1DC", "#FFEBCD"],
                  gradient: "from-pink-50 to-purple-50",
                },
                Vibrant: {
                  name: "Vibrant",
                  colors: ["#FF6B6B", "#4ECDC4"],
                  gradient: "from-red-100 to-purple-100",
                },
              }[e.target.value]
            )
          }
          className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <option value="Ocean">Ocean Theme</option>
          <option value="Pastel">Pastel Theme</option>
          <option value="Vibrant">Vibrant Theme</option>
        </select>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAxisLabels(!showAxisLabels)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          ⚙️ Advanced Settings
        </button>
      </div>

      {/* Advanced Settings */}
      {showAxisLabels && (
        <div className={`overflow-hidden bg-gradient-to-r ${colorTheme.gradient} p-4 rounded-lg backdrop-blur-sm shadow-inner border border-white/10 mb-6`}>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAxisLabels}
                onChange={() => setShowAxisLabels(!showAxisLabels)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition"
              />
              <span className="text-gray-700 font-medium">Show Axis Labels</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={() => setShowGrid(!showGrid)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition"
              />
              <span className="text-gray-700 font-medium">Show Grid Lines</span>
            </label>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      )}

      {/* Chart Container */}
      {isLoading ? (
        <div className="h-30 w-full bg-gray-200 rounded-lg animate-pulse"></div>
      ) : (
        <div className="p-4 bg-red rounded-lg shadow-md border border-gray-200 w-full">
          <div className="h-96">
            <Bar data={chartData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BarChart;