import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const data = [
    { name: "Jan", uv: 400 },
    { name: "Feb", uv: 300 },
    { name: "Mar", uv: 500 },
    { name: "Apr", uv: 700 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          Sales Chart
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="uv" stroke="#6366f1" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          Recent Users
        </h2>
        <table className="w-full text-sm text-left text-gray-700 dark:text-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2">Alice</td>
              <td className="px-4 py-2">alice@example.com</td>
              <td className="px-4 py-2">Active</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Bob</td>
              <td className="px-4 py-2">bob@example.com</td>
              <td className="px-4 py-2">Inactive</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
