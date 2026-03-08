import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Returns true once Zustand has finished rehydrating from localStorage.
 *
 * During SSR (or the first client render before hydration) the store
 * contains only its default empty values. Reading from the store before
 * hydration completes leads to the dialog incorrectly opening even when
 * valid credentials are already saved.
 *
 * Usage:
 *   const hydrated = useHasHydrated();
 *   if (!hydrated) return <Skeleton />;
 */
export function useHasHydrated(): boolean {
  // Primary: use the flag set by onRehydrateStorage in the store
  const storeHydrated = useAuthStore((s) => s._hasHydrated);

  // Fallback: a simple mounted flag catches edge cases where
  // onRehydrateStorage fires before React subscribes
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return storeHydrated || mounted;
}
