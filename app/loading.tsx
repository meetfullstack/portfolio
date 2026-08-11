export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        aria-label="Loading"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid rgba(168, 85, 247, 0.2)",
          borderTopColor: "#a855f7",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
