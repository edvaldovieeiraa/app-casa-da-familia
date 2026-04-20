import {
  Building2,
  FileText,
  Users,
  Users2,
  ShoppingCart,
  Wallet,
  Settings,
  PawPrint,
} from "lucide-react";
import type { ModuleConfig } from "@/types/ui";

export const MODULES: ModuleConfig[] = [
  {
    id: "imoveis",
    label: "Imóveis",
    color: "#E53935",
    textColor: "#FFFFFF",
    icon: Building2,
    href: "/imoveis",
    description: "Gerencie seus imóveis",
  },
  {
    id: "documentos",
    label: "Documentos",
    color: "#F5C842",
    textColor: "#333333",
    icon: FileText,
    href: "/documentos",
    description: "Documentos da família",
  },
  {
    id: "contatos",
    label: "Contatos",
    color: "#4CAF50",
    textColor: "#FFFFFF",
    icon: Users,
    href: "/contatos",
    description: "Contatos importantes",
  },
  {
    id: "feiras",
    label: "Feiras",
    color: "#2196F3",
    textColor: "#FFFFFF",
    icon: ShoppingCart,
    href: "/feiras",
    description: "Feiras e compras",
  },
  {
    id: "contas",
    label: "Contas",
    color: "#E53935",
    gradient: "linear-gradient(135deg, #E53935, #F5C842)",
    textColor: "#FFFFFF",
    icon: Wallet,
    href: "/contas",
    description: "Contas a pagar",
  },
  {
    id: "familia",
    label: "Família",
    color: "#9C27B0",
    textColor: "#FFFFFF",
    icon: Users2,
    href: "/familia",
    description: "Membros da família",
  },
  {
    id: "pets",
    label: "Pets",
    color: "#FF6F00",
    textColor: "#FFFFFF",
    icon: PawPrint,
    href: "/pets",
    description: "Seus animais de estimação",
  },
  {
    id: "config",
    label: "Configurações",
    color: "#1A1A2E",
    textColor: "#FFFFFF",
    icon: Settings,
    href: "/config",
    description: "Configurações do app",
  },
];

export function getModule(id: string): ModuleConfig | undefined {
  return MODULES.find((m) => m.id === id);
}
