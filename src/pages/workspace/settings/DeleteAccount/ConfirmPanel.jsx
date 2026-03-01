// src/components/settings/DeleteConfirmPanel.jsx

import React from "react";

const DeleteConfirmPanel = ({ onCancel, onConfirm, loading }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
          Are you absolutely sure?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          This will permanently delete your account and all associated data.
          There is no way to recover it after deletion.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Cancel deletion"
          className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          aria-label="Confirm deletion"
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            "Yes, Delete Permanently"
          )}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmPanel;
