export interface ApiResponse<T = unknown> {
  status: "success" | "error" | string;
  message?: string;
  response?: T;
}

export interface GenerateTokenResponse {
  status: string;
  token: string;
  session: string;
  full: string;
}

export interface SessionStatusResponse {
  status: string;
  message?: string;
  qrcode?: string;
  urlcode?: string;
  version?: string;
}

export interface ConnectionStateResponse {
  status: string;
  state?: string;
  connected?: boolean;
}

export interface PhoneNumberResponse {
  status: string;
  response?: {
    phone?: string;
    number?: string;
    wid?: string;
  };
}

export interface HostDeviceResponse {
  status: string;
  response?: {
    wid?: {
      user?: string;
      server?: string;
      _serialized?: string;
    };
    connected?: boolean;
    platform?: string;
  };
}

/**
 * The /qrcode-session endpoint returns a raw PNG image (Content-Type: image/png)
 * when a QR code is available. When the QR is not available it returns JSON.
 * We normalise both cases into this shape.
 */
export interface QrCodeResponse {
  /** PNG data URL ready for use in <img src="..."> */
  dataUrl?: string;
  /** Human-readable message when QR is not available */
  message?: string;
}

export interface StartSessionRequest {
  webhook?: string;
  waitQrCode?: boolean;
  proxy?: {
    url: string;
    username?: string;
    password?: string;
  };
}

export interface AllSessionsResponse {
  status: string;
  response?: string[];
}
