import React from 'react';

function SentenceItem({ item }) {
  return (
    <tr
      key={item.id}
      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
    >
      {/* Summary / Topic */}
      <td className="py-5 px-6">
        <div className="space-y-1">
          <p className="font-semibold text-gray-800 text-sm md:text-base">{item.summary}</p>
          <p className="text-xs text-gray-500 italic truncate max-w-xs">"{item.text}"</p>
        </div>
      </td>

      {/* Classification Badge */}
      <td className="py-5 px-6">
        <span
          className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-1.5 rounded-full text-xs font-medium tracking-wide ${
            item.label === "Good"
              ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200"
              : "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200"
          }`}
        >
          {item.label}
        </span>
      </td>

      {/* Category Pill */}
      <td className="py-5 px-6">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">
          {item.category || "general"}
        </span>
      </td>
    </tr>
  );
}

export default SentenceItem;