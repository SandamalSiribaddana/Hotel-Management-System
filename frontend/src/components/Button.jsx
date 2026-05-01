export default function Button({ variant = "default", className = "", ...props }) {
  const base = "btn";
  const v =
    variant === "primary"
      ? "btnPrimary"
      : variant === "danger"
        ? "btnDanger"
        : "";

  return <button className={[base, v, className].filter(Boolean).join(" ")} {...props} />;
}

