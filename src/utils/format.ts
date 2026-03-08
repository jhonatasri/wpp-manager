import { SessionStatus } from "@/types/instance";

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return "—";
  const clean = phone.replace(/\D/g, "").replace(/@.*/, "");
  if (clean.length === 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 12) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  return `+${clean}`;
}

export function formatStatus(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    CONNECTED: "Conectada",
    DISCONNECTED: "Desconectada",
    QRCODE: "Aguardando QR",
    INITIALIZING: "Iniciando",
    CLOSED: "Fechada",
    PAIRING: "Emparelhando",
    LOADING: "Carregando",
    UNKNOWN: "Desconhecida",
  };
  return map[status] ?? status;
}

export function parseStatusFromApi(raw?: string): SessionStatus {
  if (!raw) return "UNKNOWN";
  const upper = raw.toUpperCase();
  const validStatuses: SessionStatus[] = [
    "CONNECTED",
    "DISCONNECTED",
    "QRCODE",
    "INITIALIZING",
    "CLOSED",
    "PAIRING",
    "LOADING",
  ];
  if (validStatuses.includes(upper as SessionStatus)) {
    return upper as SessionStatus;
  }
  if (upper.includes("CONNECT")) return "CONNECTED";
  if (upper.includes("QRCODE") || upper.includes("QR")) return "QRCODE";
  if (upper.includes("INIT") || upper.includes("LOADING")) return "INITIALIZING";
  if (upper.includes("CLOSE")) return "CLOSED";
  return "UNKNOWN";
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}
