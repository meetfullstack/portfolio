import CornerButton from "@/components/CornerButton";

export default function NotFound() {
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
      <p className="section-tag mb-3">404 // not.found</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        Page not found
      </h1>
      <p
        className="max-w-md text-base leading-relaxed mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <CornerButton href="/" variant="primary">
        Back to home
      </CornerButton>
    </section>
  );
}
