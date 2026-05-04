"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h2 className="font-serif text-3xl text-text-primary mb-4">
              Something unexpected occurred.
            </h2>
            <p className="font-sans text-sm text-accent-olive mb-8 leading-relaxed">
              We encountered an issue while preparing your experience.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#3B2F2F] text-[#F4EFEA] px-8 py-4 font-sans text-xs uppercase tracking-[0.2em] hover:bg-accent-olive transition-colors duration-300"
              style={{ minHeight: 48 }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
