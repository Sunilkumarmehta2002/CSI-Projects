import React from "react";

const Navbar = () => (
  <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
    <button
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
      onClick={() => document.documentElement.classList.toggle("dark")}
      aria-label="Toggle Dark Mode"
    >
      Toggle Theme
    </button>
  </header>
);

export default Navbar;
