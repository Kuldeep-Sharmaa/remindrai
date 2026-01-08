import React from "react";
import { format } from "date-fns";

const executedReminders = [
  {
    id: 1,
    type: "Daily",
    content: " Morning motivation post for Instagram",
    sentAt: "2025-08-06T08:00:00Z",
    platform: "Instagram",
  },
  {
    id: 2,
    type: "Weekly",
    content: "Weekly progress report for LinkedIn",
    sentAt: "2025-08-05T10:00:00Z",
    platform: "LinkedIn",
  },
];

export default function ReminderHistory() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6"> Executed Tasks</h1>

      {executedReminders.length === 0 ? (
        <p className="text-gray-500">No task have been executed yet.</p>
      ) : (
        executedReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="bg-white dark:bg-gray-800 shadow p-4 rounded mb-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {reminder.platform} • {format(new Date(reminder.sentAt), "PPpp")}{" "}
              • {reminder.type}
            </div>
            <p className="mb-2 text-gray-800 dark:text-white">
              {reminder.content}
            </p>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
              <button className="hover:underline">Copy</button>
              <button className="hover:underline">Regenerate</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
