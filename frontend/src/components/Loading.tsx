import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Spinner */}
      <div className="w-20 h-20 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

      {/* Loading text */}
      <h1 className="mt-6 text-2xl font-semibold text-gray-700">Loading...</h1>
    </div>
  );
}