"use client";

import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  variant?: "default" | "search";
}

export function Input({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  variant = "default",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-600 text-[#333333]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none">
            <LeftIcon size={18} />
          </span>
        )}
        <input
          id={inputId}
          className={[
            "w-full min-h-[48px] rounded-[10px] border font-[inherit] text-base text-[#333333] bg-white outline-none transition-colors placeholder:text-[#999999]",
            LeftIcon ? "pl-10 pr-4" : "px-4",
            error
              ? "border-[#E53935] focus:border-[#E53935]"
              : "border-[#E0E0E0] focus:border-[#333333]",
            variant === "search" ? "bg-[#F8F9FA]" : "bg-white",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#E53935] font-600">{error}</p>}
      {hint && !error && <p className="text-xs text-[#666666]">{hint}</p>}
    </div>
  );
}
