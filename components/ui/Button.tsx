"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "glass" | "ghost" | "danger" | "secondary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const sizeStyles: Record<Size, string> = {
  sm: "min-h-[40px] px-4 text-sm gap-1.5",
  md: "min-h-[52px] px-6 text-[15px] gap-2",
  lg: "min-h-[56px] px-7 text-base gap-2",
};

function buildStyle(variant: Variant, style?: React.CSSProperties): React.CSSProperties {
  const customBg = typeof style?.backgroundColor === "string" ? style.backgroundColor : undefined;

  const base: React.CSSProperties = {
    fontWeight: 600,
    letterSpacing: "0.02em",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
  };

  if (customBg) {
    return {
      ...base,
      background: `linear-gradient(135deg, ${customBg} 0%, ${customBg}CC 100%)`,
      boxShadow: `0 4px 20px ${customBg}55`,
      color: style?.color ?? "#FFFFFF",
      ...style,
      backgroundColor: undefined,
    };
  }

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #E53935 0%, #C62828 100%)",
      boxShadow: "0 4px 20px rgba(229,57,53,0.4)",
      color: "#FFFFFF",
    },
    glass: {
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "#F0F0FF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    },
    ghost: {
      background: "transparent",
      border: "1.5px solid rgba(255,255,255,0.2)",
      color: "rgba(240,240,255,0.85)",
    },
    danger: {
      background: "linear-gradient(135deg, #E53935 0%, #C62828 100%)",
      boxShadow: "0 4px 20px rgba(229,57,53,0.4)",
      color: "#FFFFFF",
    },
    secondary: {
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(240,240,255,0.85)",
      boxShadow: "none",
    },
  };

  return { ...base, ...variants[variant], ...style };
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  children,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const mergedStyle = buildStyle(variant, style);

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.96, y: 0 }}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center select-none",
        disabled || loading ? "opacity-50 cursor-not-allowed" : "",
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 16 : 20} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 16 : 20} />}
        </>
      )}
    </motion.button>
  );
}
