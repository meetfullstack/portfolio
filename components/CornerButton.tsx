type CornerButtonProps = {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
  external?: boolean;
};

export default function CornerButton({
  href,
  variant,
  children,
  external = false,
}: CornerButtonProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a href={href} className="btn-frame" {...externalProps}>
      <span className={`btn btn--${variant}`}>{children}</span>
      <span className="btn-corner btn-corner--tl" aria-hidden="true" />
      <span className="btn-corner btn-corner--tr" aria-hidden="true" />
      <span className="btn-corner btn-corner--bl" aria-hidden="true" />
      <span className="btn-corner btn-corner--br" aria-hidden="true" />
    </a>
  );
}
