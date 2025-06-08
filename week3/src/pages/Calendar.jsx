import React from "react";

const Calendar = () => (
  <div className="bg-white dark:bg-gray-800 rounded p-4 shadow text-gray-800 dark:text-white min-h-[400px]">
    <h2 className="text-xl font-semibold mb-2">Calendar</h2>
    <p>
      You can integrate a calendar library here like{" "}
      <a
        href="https://fullcalendar.io/"
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 underline"
      >
        FullCalendar
      </a>
      .
    </p>
  </div>
);

export default Calendar;
