"use client";

import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  variant?: "default" | "search";
  accentColor?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  variant = "default",
  accentColor,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const focusColor = accentColor ?? "rgba(255,255,255,0.35)";
  const focusRing = accentColor
    ? `${accentColor}22`
    : "rgba(255,255,255,0.06)";

  const baseStyle: React.CSSProperties = {
    background: variant === "search" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.07)",
    border: `1.5px solid ${error ? "#E53935" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 14,
    color: "#F0F0FF",
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    minHeight: 52,
    padding: "14px 16px",
    paddingLeft: LeftIcon ? 44 : 16,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="label-premium">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(240,240,255,0.4)" }}>
            <LeftIcon size={18} />
          </span>
        )}
        <input
          id={inputId}
          style={baseStyle}
          className={className}
          placeholder={props.placeholder}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "#E53935" : focusColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`;
            e.currentTarget.style.background = "rgba(255,255,255,0.10)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#E53935" : "rgba(255,255,255,0.12)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = variant === "search"
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.07)";
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-600" style={{ color: "#F87171" }}>{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: "rgba(240,240,255,0.45)" }}>{hint}</p>
      )}
    </div>
  );
}
