import React from "react";

const Kanban = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
    {["To Do", "In Progress", "Done"].map((stage) => (
      <div
        key={stage}
        className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col"
      >
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
          {stage}
        </h3>
        <div className="space-y-2 flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">Sample Task 1</div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">Sample Task 2</div>
        </div>
      </div>
    ))}
  </div>
);

export default Kanban;
