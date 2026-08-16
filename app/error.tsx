"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      className="container"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <p className="section-tag mb-3">error // unexpected</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        Something went wrong
      </h1>
      <p
        className="max-w-md text-base leading-relaxed mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        An unexpected error occurred while loading this page. You can try again.
      </p>
      <button onClick={() => reset()} className="btn">
        Try again
      </button>
    </section>
  );
}
