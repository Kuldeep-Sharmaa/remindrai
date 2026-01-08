// src/components/ErrorBoundary/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Save the error info for debugging (replace with Sentry/LogRocket in prod)
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Something went wrong.
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The page failed to load — we captured the error for debugging. Try
              refreshing. If the issue persists, contact support.
            </p>

            {process.env.NODE_ENV === "development" && (
              <details className="text-xs text-gray-500 whitespace-pre-wrap">
                <summary className="cursor-pointer">View debug info</summary>
                <div className="mt-2">
                  <strong>Error:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                    {String(this.state.error)}
                  </pre>
                  <strong>Info:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                    {String(this.state.info?.componentStack || "")}
                  </pre>
                </div>
              </details>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
