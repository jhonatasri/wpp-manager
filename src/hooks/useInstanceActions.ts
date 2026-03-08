import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  startSession,
  logoutSession,
  closeSession,
  clearSessionData,
  generateAndStoreToken,
  getQrCode,
} from "@/services/instances.service";
import { INSTANCES_QUERY_KEY } from "./useInstances";
import { CreateInstancePayload } from "@/types/instance";

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: INSTANCES_QUERY_KEY });
}

/**
 * Creates a new instance:
 * 1. Generates and stores a token for the session
 * 2. Starts the session (returns QR code if needed)
 */
export function useCreateInstance() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: async (payload: CreateInstancePayload) => {
      const token = await generateAndStoreToken(payload.name);
      const sessionRes = await startSession(payload.name, {
        webhook: payload.webhook ?? "",
        waitQrCode: true,
      });
      return { token, session: sessionRes };
    },
    onSuccess: (_, variables) => {
      toast.success(`Instância "${variables.name}" criada!`);
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar instância: ${error.message}`);
    },
  });
}

/**
 * Restarts a session (close → start).
 */
export function useRestartInstance() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: async (session: string) => {
      await closeSession(session);
      await new Promise((r) => setTimeout(r, 1500));
      await startSession(session, { waitQrCode: false });
    },
    onSuccess: (_, session) => {
      toast.success(`Instância "${session}" reiniciada!`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao reiniciar "${session}": ${error.message}`);
    },
  });
}

/**
 * Logs out (disconnects) a session.
 * Removes the stored token since it becomes invalid after logout.
 */
export function useLogoutInstance() {
  const invalidate = useInvalidate();
  const { removeSessionToken } = useAuthStore.getState();

  return useMutation({
    mutationFn: async (session: string) => {
      await logoutSession(session);
      removeSessionToken(session);
    },
    onSuccess: (_, session) => {
      toast.success(`Instância "${session}" desconectada!`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao desconectar "${session}": ${error.message}`);
    },
  });
}

/**
 * Closes a session (without deleting data or token).
 */
export function useCloseInstance() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: async (session: string) => {
      await closeSession(session);
    },
    onSuccess: (_, session) => {
      toast.success(`Instância "${session}" fechada!`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao fechar "${session}": ${error.message}`);
    },
  });
}

/**
 * Deletes all session data and removes its token from the store.
 */
export function useDeleteInstance() {
  const invalidate = useInvalidate();
  const { secretKey, removeSessionToken } = useAuthStore.getState();

  return useMutation({
    mutationFn: async (session: string) => {
      await clearSessionData(session, secretKey);
      removeSessionToken(session);
    },
    onSuccess: (_, session) => {
      toast.success(`Instância "${session}" deletada!`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao deletar "${session}": ${error.message}`);
    },
  });
}

/**
 * Connects (starts) an existing session.
 * Auto-generates a token first if not yet stored.
 */
export function useConnectInstance() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: async (session: string) => {
      const { sessionTokens } = useAuthStore.getState();
      if (!sessionTokens[session]) {
        await generateAndStoreToken(session);
      }
      return startSession(session, { waitQrCode: false });
    },
    onSuccess: (_, session) => {
      toast.success(`Conectando instância "${session}"...`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao conectar "${session}": ${error.message}`);
    },
  });
}

/**
 * Fetches the QR Code for a session.
 */
export function useGetQrCode() {
  return useMutation({
    mutationFn: async (session: string) => {
      return getQrCode(session);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao obter QR Code: ${error.message}`);
    },
  });
}

/**
 * Manually regenerates the token for a session.
 */
export function useRegenerateToken() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: async (session: string) => {
      return generateAndStoreToken(session);
    },
    onSuccess: (_, session) => {
      toast.success(`Token de "${session}" renovado!`);
      invalidate();
    },
    onError: (error: Error, session) => {
      toast.error(`Erro ao renovar token de "${session}": ${error.message}`);
    },
  });
}
