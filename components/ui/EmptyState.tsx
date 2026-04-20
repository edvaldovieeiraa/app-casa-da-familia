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
  color = "#E53935",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={36} style={{ color }} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-700 text-[#333333]">{title}</h3>
        <p className="text-sm text-[#666666] leading-relaxed">{description}</p>
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
