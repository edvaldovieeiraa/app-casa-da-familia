"use client";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "colored";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
}

const variantColors: Record<Exclude<BadgeVariant, "colored">, { text: string; border: string; bg: string }> = {
  default: {
    text: "rgba(240,240,255,0.75)",
    border: "rgba(255,255,255,0.15)",
    bg: "rgba(255,255,255,0.07)",
  },
  success: {
    text: "#4CAF50",
    border: "rgba(76,175,80,0.35)",
    bg: "rgba(76,175,80,0.12)",
  },
  warning: {
    text: "#F5C842",
    border: "rgba(245,200,66,0.35)",
    bg: "rgba(245,200,66,0.12)",
  },
  danger: {
    text: "#F87171",
    border: "rgba(239,68,68,0.35)",
    bg: "rgba(239,68,68,0.12)",
  },
  info: {
    text: "#60A5FA",
    border: "rgba(96,165,250,0.35)",
    bg: "rgba(96,165,250,0.12)",
  },
};

export function Badge({ children, variant = "default", color, className = "" }: BadgeProps) {
  const styles =
    variant === "colored" && color
      ? { text: color, border: `${color}55`, bg: `${color}18` }
      : variantColors[variant as Exclude<BadgeVariant, "colored">];

  return (
    <span
      className={["inline-flex items-center font-500", className].filter(Boolean).join(" ")}
      style={{
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: styles.text,
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 20,
        padding: "3px 10px",
        lineHeight: "1.4",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {children}
    </span>
  );
}
