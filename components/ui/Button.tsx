"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#E53935] text-white border-transparent hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-white text-[#333333] border-[#E0E0E0] hover:bg-[#F0F0F0] disabled:opacity-50",
  danger:
    "bg-white text-[#E53935] border-[#E53935] hover:bg-red-50 disabled:opacity-50",
  ghost:
    "bg-transparent text-[#333333] border-transparent hover:bg-[#F0F0F0] disabled:opacity-50",
};

const sizeStyles: Record<Size, string> = {
  sm: "min-h-[40px] px-4 text-sm gap-1.5",
  md: "min-h-[48px] px-5 text-base gap-2",
  lg: "min-h-[56px] px-6 text-lg gap-2",
};

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
  return (
    <motion.button
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-bold rounded-[12px] border transition-colors cursor-pointer select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
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
