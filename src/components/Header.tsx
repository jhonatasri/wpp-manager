"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useApiHealth } from "@/hooks/useInstances";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { generateAndStoreToken } from "@/services/instances.service";
import { resetApiClient } from "@/services/api";
import { toast } from "sonner";

const GLOBAL_SESSION = "_MANAGER_";

export function Header() {
  const {
    baseUrl,
    secretKey,
    isConfigured,
    globalToken,
    sessionTokens,
    setCredentials,
    clearConfig,
  } = useAuthStore();

  const { data: isHealthy, isLoading: healthLoading } = useApiHealth();
  const hydrated = useHasHydrated();

  // Form is initialised empty; synced with persisted store values after hydration
  const [form, setForm] = useState({ baseUrl: "", secretKey: "" });

  // Dialog starts closed; only opens after hydration if truly not configured
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // After Zustand rehydrates from localStorage, sync form + open state
  useEffect(() => {
    if (!hydrated) return;
    setForm({
      baseUrl: baseUrl || "http://localhost:21465",
      secretKey: secretKey || "",
    });
    if (!isConfigured) setOpen(true);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const sessionCount = Object.keys(sessionTokens).filter(
    (k) => k !== GLOBAL_SESSION
  ).length;

  const handleConnect = async () => {
    if (!form.baseUrl || !form.secretKey) {
      toast.error("Preencha a URL do servidor e a Secret Key.");
      return;
    }
    setConnecting(true);
    try {
      resetApiClient();
      setCredentials(form.baseUrl, form.secretKey);
      await generateAndStoreToken(GLOBAL_SESSION);
      toast.success("Conectado com sucesso!");
      setOpen(false);
    } catch (err) {
      toast.error(
        `Erro ao conectar: ${err instanceof Error ? err.message : "Verifique a URL e a Secret Key."}`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearConfig();
    resetApiClient();
    setForm({ baseUrl: "http://localhost:21465", secretKey: "" });
    toast.info("Desconectado.");
  };

  const handleOpenSettings = () => {
    setForm({
      baseUrl: baseUrl || "http://localhost:21465",
      secretKey: secretKey || "",
    });
    setOpen(true);
  };

  // While waiting for hydration, render a lightweight skeleton
  if (!hydrated) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
      </header>
    );
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        {/* API status */}
        <div className="flex items-center gap-2">
          {!isConfigured ? (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          ) : healthLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isHealthy ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}

          <span className="text-sm text-muted-foreground">
            {!isConfigured
              ? "Não configurado"
              : healthLoading
              ? "Verificando..."
              : isHealthy
              ? "API Online"
              : "API Offline"}
          </span>

          {isConfigured && (
            <span className="hidden text-xs text-muted-foreground sm:block truncate max-w-48">
              {baseUrl}
            </span>
          )}

          {isConfigured && globalToken && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              <Key className="h-3 w-3" />
              {sessionCount} token{sessionCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenSettings}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurar API</span>
          </Button>

          {isConfigured && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Desconectar</span>
            </Button>
          )}
        </div>
      </header>

      {/* Config dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!connecting && !o && isConfigured) setOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              Conectar ao WPPConnect
            </DialogTitle>
            <DialogDescription>
              Insira a URL do servidor e a Secret Key. Os tokens de cada sessão
              serão gerados e salvos automaticamente no navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL do Servidor *</Label>
              <Input
                id="baseUrl"
                placeholder="http://localhost:21465"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                disabled={connecting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key *</Label>
              <Input
                id="secretKey"
                placeholder="THISISMYSECURETOKEN"
                value={form.secretKey}
                onChange={(e) =>
                  setForm({ ...form, secretKey: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                disabled={connecting}
              />
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-3">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Os tokens Bearer são gerados{" "}
                  <strong>automaticamente por sessão</strong> e ficam salvos no
                  navegador. Seus dados são recuperados automaticamente ao
                  reabrir a página.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            {isConfigured && (
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={connecting}
              >
                Cancelar
              </Button>
            )}
            <Button
              onClick={handleConnect}
              disabled={!form.baseUrl || !form.secretKey || connecting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Conectar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
