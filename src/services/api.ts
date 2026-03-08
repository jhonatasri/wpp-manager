import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Creates a one-off Axios instance for a specific token and base URL.
 * Each call to a session endpoint should use the session's own token.
 */
function buildClient(token: string): AxiosInstance {
  const { baseUrl } = useAuthStore.getState();

  const client = axios.create({
    baseURL: baseUrl || "http://localhost:21465",
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro desconhecido";
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

/**
 * Returns an Axios client configured with the token for a given session.
 * If no session is provided, falls back to the global token.
 */
export function apiFor(session?: string) {
  const { getToken } = useAuthStore.getState();
  const token = getToken(session);
  return buildClient(token);
}

/**
 * Returns an Axios client with NO Authorization header.
 * Used for endpoints that don't require auth (e.g. generate-token).
 */
export function apiPublic() {
  return buildClient("");
}

export function resetApiClient() {
  // No-op: kept for backwards compatibility – clients are now ephemeral.
}
