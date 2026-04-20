import type { LucideIcon } from "lucide-react";

export interface ModuleConfig {
  id: string;
  label: string;
  color: string;
  gradient?: string;
  textColor: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
