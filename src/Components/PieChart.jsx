import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import ChartJS from 'chart.js/auto';

const colorPalette = [
  'rgba(75, 192, 192, 0.8)',   // Teal
  'rgba(255, 99, 132, 0.8)',   // Red
  'rgba(255, 206, 86, 0.8)',   // Yellow
  'rgba(54, 162, 235, 0.8)',   // Blue
  'rgba(153, 102, 255, 0.8)',  // Purple
  'rgba(255, 159, 64, 0.8)',   // Orange
  'rgba(100, 149, 237, 0.8)',  // CornflowerBlue
  'rgba(32, 178, 170, 0.8)',   // LightSeaGreen
  'rgba(220, 20, 60, 0.8)',    // Crimson
  'rgba(128, 0, 128, 0.8)',    // Maroon
];

function PieChart({ results, show }) {
  const [view, setView] = useState("Good");

  if (!show || !results || results.length === 0) return null;

  const categoryCounts = {};

  results.forEach((item) => {
    const label = item.label;
    const category = item.category || "general";

    if (!categoryCounts[category]) {
      categoryCounts[category] = { Good: 0, Bad: 0 };
    }

    categoryCounts[category][label]++;
  });

  const labels = Object.keys(categoryCounts);
  const data = labels.map((cat) => categoryCounts[cat][view]);

  const backgroundColors = labels.map((_, i) => colorPalette[i % colorPalette.length]);
  const borderColors = backgroundColors.map(c => c.replace('0.8', '1'));

  const chartData = {
    labels: labels,
    datasets: [{
      label: `${view} Sentiment Distribution`,
      data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = data.reduce((sum, val) => sum + val, 0);
            const percent = ((ctx.raw / total) * 100).toFixed(1);
            return `${ctx.label}: ${ctx.raw} sentence(s) (${percent}%)`;
          }
        }
      },
      title: {
        display: true,
        text: `${view} Sentences Distribution by Category`,
        font: { size: 16 }
      }
    }
  };

  return (
    <div className="mt-6 p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Sentiment Distribution</h2>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("Good")}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
            view === "Good"
              ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          View Good Sentences
        </button>
        <button
          onClick={() => setView("Bad")}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
            view === "Bad"
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          View Bad Sentences
        </button>
      </div>

      <div className="h-72 w-full relative overflow-hidden rounded-lg shadow-md border border-gray-200">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

export default PieChart;