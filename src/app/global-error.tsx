"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "2rem",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0F",
          color: "#F7F7FA",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            textAlign: "center",
            padding: "2rem",
            borderRadius: "1rem",
            background: "#1A1A2E",
            border: "1px solid #2D2D44",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "#F7F7FA" }}>
            Application Error
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#A1A1B5", marginBottom: "1.5rem" }}>
            A critical error occurred while loading the application.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#7B2CBF",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
