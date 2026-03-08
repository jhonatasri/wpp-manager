import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Each WPPConnect session has its own Bearer token generated via:
// POST /api/{session}/{secretkey}/generate-token  (no auth required)
interface AuthState {
  baseUrl: string;
  secretKey: string;
  /** Global token used for non-session endpoints (show-all-sessions, etc).
   *  Auto-generated from a "_MANAGER_" helper session on first connect. */
  globalToken: string;
  /** Per-session tokens: { [sessionName]: bearerToken } */
  sessionTokens: Record<string, string>;
  isConfigured: boolean;
  /**
   * True after Zustand has finished rehydrating from localStorage.
   * Use this to avoid showing stale/empty state during the SSR → client handoff.
   * NOT persisted.
   */
  _hasHydrated: boolean;

  // Actions
  setCredentials: (baseUrl: string, secretKey: string) => void;
  setGlobalToken: (token: string) => void;
  setSessionToken: (session: string, token: string) => void;
  removeSessionToken: (session: string) => void;
  /** Returns the token for a session, falling back to the global token. */
  getToken: (session?: string) => string;
  clearConfig: () => void;
  _setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      baseUrl: "",
      secretKey: "",
      globalToken: "",
      sessionTokens: {},
      isConfigured: false,
      _hasHydrated: false,

      setCredentials: (baseUrl, secretKey) =>
        set({
          baseUrl: baseUrl.replace(/\/$/, ""),
          secretKey,
          isConfigured: !!(baseUrl && secretKey),
        }),

      setGlobalToken: (token) => set({ globalToken: token }),

      setSessionToken: (session, token) =>
        set((state) => ({
          sessionTokens: { ...state.sessionTokens, [session]: token },
        })),

      removeSessionToken: (session) =>
        set((state) => {
          const copy = { ...state.sessionTokens };
          delete copy[session];
          return { sessionTokens: copy };
        }),

      getToken: (session) => {
        const { sessionTokens, globalToken } = get();
        if (session && sessionTokens[session]) return sessionTokens[session];
        return globalToken;
      },

      clearConfig: () =>
        set({
          baseUrl: "",
          secretKey: "",
          globalToken: "",
          sessionTokens: {},
          isConfigured: false,
        }),

      _setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "wpp-manager-auth",
      // localStorage: best choice here — no size limit issues for config/tokens,
      // never sent to the server (unlike cookies), survives tab/browser close.
      storage: createJSONStorage(() => localStorage),
      // _hasHydrated must NOT be persisted — it's runtime-only state
      partialize: (state) => ({
        baseUrl: state.baseUrl,
        secretKey: state.secretKey,
        globalToken: state.globalToken,
        sessionTokens: state.sessionTokens,
        isConfigured: state.isConfigured,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when localStorage data has been loaded into the store
        state?._setHasHydrated(true);
      },
    }
  )
);
