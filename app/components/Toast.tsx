"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  isDakar?: boolean;
}

export default function Toast({ message, onClose, isDakar = false }: ToastProps) {
  useEffect(() => {
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div
        className={`relative px-8 py-5 rounded-2xl shadow-2xl backdrop-blur-md border-2 flex items-center gap-4 min-w-[320px] max-w-[90vw] ${
          isDakar
            ? "bg-beige/95 border-bronze/30 shadow-bronze/20"
            : "bg-pink/95 border-blue/30 shadow-pink/20"
        }`}
      >
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isDakar ? "bg-bronze/20" : "bg-blue/20"
          }`}
        >
          <svg
            className={`w-6 h-6 ${isDakar ? "text-bronze" : "text-blue"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Message */}
        <p
          className={`flex-1 font-semibold text-lg ${
            isDakar ? "text-bronze" : "text-blue"
          }`}
        >
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-full transition-all hover:scale-110 ${
            isDakar
              ? "text-bronze/60 hover:text-bronze hover:bg-bronze/10"
              : "text-blue/60 hover:text-blue hover:bg-blue/10"
          }`}
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Animated progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${
            isDakar ? "bg-bronze/40" : "bg-blue/40"
          }`}
          style={{
            width: "100%",
            animation: "shrink 4s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
