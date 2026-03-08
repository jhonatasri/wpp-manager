import { SessionStatus } from "@/types/instance";
import { formatStatus } from "@/utils/format";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: SessionStatus;
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<
  SessionStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  CONNECTED: {
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    label: "Conectada",
  },
  DISCONNECTED: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    label: "Desconectada",
  },
  QRCODE: {
    dot: "bg-blue-500 animate-pulse",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    label: "Aguardando QR",
  },
  INITIALIZING: {
    dot: "bg-yellow-500 animate-pulse",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
    label: "Iniciando",
  },
  LOADING: {
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-600 dark:text-yellow-300",
    label: "Carregando",
  },
  CLOSED: {
    dot: "bg-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    text: "text-gray-700 dark:text-gray-400",
    label: "Fechada",
  },
  PAIRING: {
    dot: "bg-purple-500 animate-pulse",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    label: "Emparelhando",
  },
  UNKNOWN: {
    dot: "bg-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/30",
    text: "text-gray-500 dark:text-gray-400",
    label: "Desconhecida",
  },
};

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.UNKNOWN;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      )}
      {config.label}
    </span>
  );
}
