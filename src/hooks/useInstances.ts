import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  showAllSessions,
  getSessionStatus,
  getPhoneNumber,
  checkHealth,
  generateAndStoreToken,
} from "@/services/instances.service";
import { Instance } from "@/types/instance";
import { parseStatusFromApi } from "@/utils/format";

export const INSTANCES_QUERY_KEY = ["instances"];
export const HEALTH_QUERY_KEY = ["health"];

/**
 * Ensures a session has a stored token, generating one automatically if missing.
 */
async function ensureToken(session: string): Promise<void> {
  const { sessionTokens } = useAuthStore.getState();
  if (!sessionTokens[session]) {
    await generateAndStoreToken(session);
  }
}

/**
 * Fetches all instances and enriches them with status + phone number.
 * Tokens are auto-generated per session if not yet stored.
 */
export function useInstances() {
  const { secretKey, isConfigured } = useAuthStore();

  return useQuery({
    queryKey: INSTANCES_QUERY_KEY,
    queryFn: async (): Promise<Instance[]> => {
      const sessions = await showAllSessions(secretKey);

      const enriched = await Promise.allSettled(
        sessions.map(async (name): Promise<Instance> => {
          // Auto-generate and store token for this session if missing
          await ensureToken(name);

          let status: Instance["status"] = "UNKNOWN";
          let phoneNumber: string | undefined;
          let isConnected = false;

          try {
            const statusRes = await getSessionStatus(name);
            status = parseStatusFromApi(
              statusRes?.status ?? statusRes?.message
            );
            isConnected = status === "CONNECTED";
          } catch {
            status = "DISCONNECTED";
          }

          if (isConnected) {
            try {
              const phoneRes = await getPhoneNumber(name);
              phoneNumber =
                phoneRes?.response?.phone ??
                phoneRes?.response?.number ??
                phoneRes?.response?.wid?.replace(/@.*/, "");
            } catch {
              // phone unavailable — not fatal
            }
          }

          return { id: name, name, status, phoneNumber, isConnected };
        })
      );

      return enriched
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<Instance>).value);
    },
    enabled: isConfigured,
    refetchInterval: 10_000,
    staleTime: 8_000,
    retry: 1,
  });
}

/**
 * Fetches a single instance by session name.
 */
export function useInstance(sessionName: string) {
  const { isConfigured } = useAuthStore();

  return useQuery({
    queryKey: ["instance", sessionName],
    queryFn: async (): Promise<Instance> => {
      await ensureToken(sessionName);

      let status: Instance["status"] = "UNKNOWN";
      let phoneNumber: string | undefined;
      let isConnected = false;

      try {
        const statusRes = await getSessionStatus(sessionName);
        status = parseStatusFromApi(statusRes?.status ?? statusRes?.message);
        isConnected = status === "CONNECTED";
      } catch {
        status = "DISCONNECTED";
      }

      if (isConnected) {
        try {
          const phoneRes = await getPhoneNumber(sessionName);
          phoneNumber =
            phoneRes?.response?.phone ??
            phoneRes?.response?.number ??
            phoneRes?.response?.wid?.replace(/@.*/, "");
        } catch {
          // ignore
        }
      }

      return { id: sessionName, name: sessionName, status, phoneNumber, isConnected };
    },
    enabled: isConfigured && !!sessionName,
    refetchInterval: 10_000,
  });
}

export function useRefreshInstances() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: INSTANCES_QUERY_KEY });
}

export function useApiHealth() {
  const { isConfigured } = useAuthStore();

  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: checkHealth,
    enabled: isConfigured,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
