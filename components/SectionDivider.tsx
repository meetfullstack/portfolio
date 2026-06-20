export default function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 3,
        background:
          "linear-gradient(to right, transparent 0%, rgba(168,85,247,0.15) 20%, rgba(168,85,247,0.6) 50%, rgba(168,85,247,0.15) 80%, transparent 100%)",
      }}
    />
  );
}
