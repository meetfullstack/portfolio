export default function SectionDivider() {
  return (
    <div
      className="container"
      aria-hidden="true"
    >
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(to right, transparent 0%, rgba(168,85,247,0.15) 20%, rgba(168,85,247,0.6) 50%, rgba(168,85,247,0.15) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}
