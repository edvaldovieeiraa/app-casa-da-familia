"use client";

import { motion } from "framer-motion";

type CardVariant = "glass" | "glass-strong" | "colored" | "outlined";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  color?: string;
  pressable?: boolean;
  hoverable?: boolean;
}

function buildCardStyle(variant: CardVariant, color?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 20,
    padding: 20,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  switch (variant) {
    case "glass":
      return {
        ...base,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      };
    case "glass-strong":
      return {
        ...base,
        background: "rgba(255,255,255,0.09)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
      };
    case "colored":
      if (color) {
        return {
          ...base,
          background: `linear-gradient(135deg, ${color}22 0%, ${color}0A 100%)`,
          border: `1px solid ${color}44`,
          boxShadow: `0 4px 24px ${color}1A`,
        };
      }
      return { ...base, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" };
    case "outlined":
      return {
        ...base,
        background: "transparent",
        border: "1.5px solid rgba(255,255,255,0.12)",
      };
    default:
      return base;
  }
}

export function Card({
  variant = "glass",
  color,
  pressable = false,
  hoverable = false,
  children,
  className = "",
  style,
  ...props
}: CardProps) {
  const cardStyle: React.CSSProperties = {
    ...buildCardStyle(variant, color),
    ...style,
  };

  const hoverProps = hoverable
    ? { whileHover: { y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" } }
    : {};

  if (pressable) {
    return (
      <motion.div
        {...hoverProps}
        whileTap={{ scale: 0.97 }}
        className={["cursor-pointer", className].filter(Boolean).join(" ")}
        style={cardStyle}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  if (hoverable) {
    return (
      <motion.div
        {...hoverProps}
        className={className}
        style={cardStyle}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} style={cardStyle} {...props}>
      {children}
    </div>
  );
}
