'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Optional fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    logger.error("ErrorBoundary caught an error:", error, errorInfo);
    // Optionally, set global error store if display needs to match global system
    // import { setGlobalError } from '@/store/globalErrorStore';
    // setGlobalError({ message: "A critical client-side error occurred.", type: "error", details: error.message });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="text-gray-700 mb-2">
              We're sorry for the inconvenience. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md text-left">
                <h2 className="text-lg font-semibold text-gray-800">Error Details:</h2>
                <p className="font-mono text-sm text-red-800 break-words">
                  <strong>Message:</strong> {this.state.error.message}
                </p>
                <p className="font-mono text-sm text-red-800 break-words mt-1">
                  <strong>Stack:</strong> {this.state.error.stack}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
