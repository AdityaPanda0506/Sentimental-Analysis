import React from 'react';

function InputForm({ input, setInput, handleSubmit }) {
  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      {/* Main Container */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200 transition-all duration-300 transform hover:scale-[1.01]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Square Input Field */}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a sentence..."
              required
              className="block w-64 h-16 mx-auto text-lg text-center bg-transparent border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 peer transition-all duration-300 shadow-sm"
            />
            <label className="absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-1/2 -translate-x-1/2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white/80 px-1 backdrop-blur-sm transition-all">
              Type a sentence...
            </label>
          </div>

          {/* Analyze Button */}
          <button
            type="submit"
            className="group relative inline-flex items-center justify-center w-64 h-16 mx-auto overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95"
          >
            {/* Shine Effect */}
            <span className="absolute w-32 h-32 rounded-full -top-8 -left-8 bg-white opacity-30 transform rotate-12 group-hover:scale-150 transition-all duration-700 ease-out"></span>
            <span className="relative z-10">Analyze</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default InputForm;