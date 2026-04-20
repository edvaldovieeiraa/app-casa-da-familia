"use client";

import { motion } from "framer-motion";

type CardVariant = "elevated" | "outlined" | "filled";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  color?: string;
  pressable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-transparent",
  outlined: "bg-white border border-[#E0E0E0]",
  filled: "border border-transparent",
};

export function Card({
  variant = "elevated",
  color,
  pressable = false,
  children,
  className = "",
  style,
  ...props
}: CardProps) {
  const baseStyle = {
    ...(variant === "filled" && color ? { backgroundColor: color } : {}),
    ...style,
  };

  if (pressable) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={[
          "rounded-[16px] p-5 cursor-pointer",
          variantStyles[variant],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={baseStyle}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={[
        "rounded-[16px] p-5",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={baseStyle}
      {...props}
    >
      {children}
    </div>
  );
}
