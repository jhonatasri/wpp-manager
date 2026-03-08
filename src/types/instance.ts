export type SessionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "QRCODE"
  | "INITIALIZING"
  | "CLOSED"
  | "PAIRING"
  | "LOADING"
  | "UNKNOWN";

export interface Instance {
  id: string;
  name: string;
  status: SessionStatus;
  phoneNumber?: string;
  hostDevice?: string;
  platform?: string;
  qrcode?: string;
  isConnected: boolean;
  lastSeen?: string;
}

export interface CreateInstancePayload {
  name: string;
  webhook?: string;
  waitQrCode?: boolean;
}

export interface InstanceStats {
  total: number;
  connected: number;
  disconnected: number;
  connecting: number;
}
