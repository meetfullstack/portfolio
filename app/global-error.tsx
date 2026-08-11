"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#000000",
          color: "#f5f5f7",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#a1a1a6", marginBottom: "2rem" }}>
          A critical error occurred. Please try reloading the page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "12px 24px",
            border: "1px solid #a855f7",
            background: "transparent",
            color: "#f5f5f7",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
