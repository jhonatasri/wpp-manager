import { apiFor, apiPublic } from "./api";
import {
  AllSessionsResponse,
  ConnectionStateResponse,
  GenerateTokenResponse,
  HostDeviceResponse,
  PhoneNumberResponse,
  QrCodeResponse,
  SessionStatusResponse,
  StartSessionRequest,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

// ─── Auth / Token ─────────────────────────────────────────────────────────────

/**
 * Generates a Bearer token for a session.
 * This endpoint requires NO authentication — uses the public (no-auth) client.
 * POST /api/{session}/{secretkey}/generate-token
 */
export async function generateToken(
  session: string,
  secretKey: string
): Promise<GenerateTokenResponse> {
  const { data } = await apiPublic().post<GenerateTokenResponse>(
    `/api/${session}/${secretKey}/generate-token`
  );
  return data;
}

/**
 * Generates a token and automatically persists it in the store.
 * Returns the token string.
 */
export async function generateAndStoreToken(session: string): Promise<string> {
  const { secretKey, setSessionToken, globalToken, setGlobalToken } =
    useAuthStore.getState();
  const res = await generateToken(session, secretKey);
  const token =
    res.token ??
    (res as unknown as Record<string, string>).full ??
    "";
  if (!token) throw new Error(`Token vazio para a sessão "${session}"`);

  setSessionToken(session, token);

  // Use the first generated token as the global fallback
  if (!globalToken) setGlobalToken(token);

  return token;
}

// ─── Sessions / Instances ─────────────────────────────────────────────────────

/**
 * Lists all registered sessions.
 * GET /api/{secretkey}/show-all-sessions
 * Uses the global token (not session-specific).
 */
export async function showAllSessions(secretKey: string): Promise<string[]> {
  const { data } = await apiFor().get<AllSessionsResponse>(
    `/api/${secretKey}/show-all-sessions`
  );
  if (Array.isArray(data)) return data as unknown as string[];
  if (data?.response && Array.isArray(data.response)) return data.response;
  return [];
}

/**
 * Starts all sessions.
 * POST /api/{secretkey}/start-all
 */
export async function startAllSessions(secretKey: string): Promise<void> {
  await apiFor().post(`/api/${secretKey}/start-all`);
}

/**
 * Gets the session status.
 * GET /api/{session}/status-session
 */
export async function getSessionStatus(
  session: string
): Promise<SessionStatusResponse> {
  const { data } = await apiFor(session).get<SessionStatusResponse>(
    `/api/${session}/status-session`
  );
  return data;
}

/**
 * Checks the connection state of a session.
 * GET /api/{session}/check-connection-session
 */
export async function checkConnectionSession(
  session: string
): Promise<ConnectionStateResponse> {
  const { data } = await apiFor(session).get<ConnectionStateResponse>(
    `/api/${session}/check-connection-session`
  );
  return data;
}

/**
 * Gets the QR Code for a session.
 * GET /api/{session}/qrcode-session
 *
 * The server returns a raw PNG binary (Content-Type: image/png) when the QR
 * is available, or a JSON error object when it is not. We handle both cases
 * and always resolve to { dataUrl } or { message }.
 */
export async function getQrCode(session: string): Promise<QrCodeResponse> {
  const response = await apiFor(session).get(`/api/${session}/qrcode-session`, {
    responseType: "blob",
    // Don't let axios throw on non-2xx so we can inspect the body ourselves
    validateStatus: () => true,
  });

  const contentType: string = response.headers["content-type"] ?? "";

  if (contentType.startsWith("image/")) {
    // Convert binary blob to a base64 data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(response.data as Blob);
    });
    return { dataUrl };
  }

  // JSON response — QR not available or error
  const text = await (response.data as Blob).text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // ignore parse errors
  }
  const message =
    (parsed.message as string) ?? "QR Code não disponível para esta sessão.";
  return { message };
}

/**
 * Starts (creates/authenticates) a session.
 * POST /api/{session}/start-session
 */
export async function startSession(
  session: string,
  options?: StartSessionRequest
): Promise<SessionStatusResponse> {
  const { data } = await apiFor(session).post<SessionStatusResponse>(
    `/api/${session}/start-session`,
    options ?? { waitQrCode: false }
  );
  return data;
}

/**
 * Logs out and deletes session data.
 * POST /api/{session}/logout-session
 */
export async function logoutSession(session: string): Promise<void> {
  await apiFor(session).post(`/api/${session}/logout-session`);
}

/**
 * Closes the session without deleting data.
 * POST /api/{session}/close-session
 */
export async function closeSession(session: string): Promise<void> {
  await apiFor(session).post(`/api/${session}/close-session`);
}

/**
 * Clears all session data (delete).
 * POST /api/{session}/{secretkey}/clear-session-data
 */
export async function clearSessionData(
  session: string,
  secretKey: string
): Promise<void> {
  await apiFor(session).post(`/api/${session}/${secretKey}/clear-session-data`);
}

/**
 * Gets the phone number connected to a session.
 * GET /api/{session}/get-phone-number
 */
export async function getPhoneNumber(
  session: string
): Promise<PhoneNumberResponse> {
  const { data } = await apiFor(session).get<PhoneNumberResponse>(
    `/api/${session}/get-phone-number`
  );
  return data;
}

/**
 * Gets information about the connected device.
 * GET /api/{session}/host-device
 */
export async function getHostDevice(
  session: string
): Promise<HostDeviceResponse> {
  const { data } = await apiFor(session).get<HostDeviceResponse>(
    `/api/${session}/host-device`
  );
  return data;
}

/**
 * Checks API health.
 * GET /healthz
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await apiFor().get("/healthz");
    return true;
  } catch {
    return false;
  }
}
