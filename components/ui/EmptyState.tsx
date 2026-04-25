import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = "#9C27B0",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-5">
      {/* Glass icon circle */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 4px 24px ${color}20`,
        }}
      >
        <Icon size={36} style={{ color }} />
      </div>

      <div className="flex flex-col gap-2">
        <h3
          className="font-600"
          style={{ fontSize: 20, color: "#F0F0FF", letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(240,240,255,0.55)" }}
        >
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          style={{ backgroundColor: color }}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
