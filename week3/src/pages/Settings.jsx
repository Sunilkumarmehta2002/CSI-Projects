import React, { useState, useEffect } from "react";

const Settings = () => {
  // Use local state for dark mode toggle to sync with html class
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  // Toggle dark mode class on <html>
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  };

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // On mount, read saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" && !darkMode) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-6 shadow text-gray-800 dark:text-white min-h-[400px] max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Theme</h3>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span className="ml-2 select-none">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Here you can add more user preferences like notifications,
          language selection, account settings, etc.
        </p>
      </div>
    </div>
  );
};

export default Settings;
