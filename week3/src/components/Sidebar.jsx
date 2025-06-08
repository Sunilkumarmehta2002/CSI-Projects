import React from "react";
import { NavLink } from "react-router-dom";
import { FaChartPie, FaCalendarAlt, FaTasks, FaCog } from "react-icons/fa";

const Sidebar = () => (
  <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-md flex flex-col">
    <div className="text-2xl font-bold p-6 text-center text-indigo-600 dark:text-white">
      Admin
    </div>
    <nav className="flex-1 px-4 space-y-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-indigo-600 font-semibold" : "text-gray-700 dark:text-white"
        }
      >
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaChartPie /> <span>Dashboard</span>
        </div>
      </NavLink>
      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          isActive ? "text-indigo-600 font-semibold" : "text-gray-700 dark:text-white"
        }
      >
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaCalendarAlt /> <span>Calendar</span>
        </div>
      </NavLink>
      <NavLink
        to="/kanban"
        className={({ isActive }) =>
          isActive ? "text-indigo-600 font-semibold" : "text-gray-700 dark:text-white"
        }
      >
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaTasks /> <span>Kanban</span>
        </div>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? "text-indigo-600 font-semibold" : "text-gray-700 dark:text-white"
        }
      >
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaCog /> <span>Settings</span>
        </div>
      </NavLink>
    </nav>
  </div>
);

export default Sidebar;
