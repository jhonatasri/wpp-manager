"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Trash2,
  Key,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Wifi,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { generateAndStoreToken } from "@/services/instances.service";
import { resetApiClient } from "@/services/api";
import { toast } from "sonner";

const GLOBAL_SESSION = "_MANAGER_";

export default function SettingsPage() {
  const {
    baseUrl,
    secretKey,
    globalToken,
    sessionTokens,
    isConfigured,
    setCredentials,
    setGlobalToken,
    clearConfig,
  } = useAuthStore();

  const [form, setForm] = useState({
    baseUrl: baseUrl || "http://localhost:21465",
    secretKey: secretKey || "",
  });
  const [connecting, setConnecting] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const userSessions = Object.entries(sessionTokens).filter(
    ([k]) => k !== GLOBAL_SESSION
  );

  const handleSave = async () => {
    if (!form.baseUrl || !form.secretKey) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setConnecting(true);
    try {
      resetApiClient();
      setCredentials(form.baseUrl, form.secretKey);
      await generateAndStoreToken(GLOBAL_SESSION);
      toast.success("Configurações salvas e token global gerado!");
    } catch (err) {
      toast.error(
        `Erro ao conectar: ${err instanceof Error ? err.message : "Verifique a URL e Secret Key."}`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleRegenerateToken = async (session: string) => {
    setRegenerating(session);
    try {
      await generateAndStoreToken(session);
      toast.success(`Token de "${session}" renovado!`);
    } catch (err) {
      toast.error(
        `Erro: ${err instanceof Error ? err.message : "Falha ao gerar token."}`
      );
    } finally {
      setRegenerating(null);
    }
  };

  const handleRegenerateAll = async () => {
    setRegenerating("__all__");
    try {
      await generateAndStoreToken(GLOBAL_SESSION);
      for (const [session] of userSessions) {
        await generateAndStoreToken(session);
      }
      toast.success("Todos os tokens foram renovados!");
    } catch (err) {
      toast.error(
        `Erro: ${err instanceof Error ? err.message : "Falha ao renovar tokens."}`
      );
    } finally {
      setRegenerating(null);
    }
  };

  const handleClear = () => {
    clearConfig();
    resetApiClient();
    setForm({ baseUrl: "http://localhost:21465", secretKey: "" });
    toast.info("Configurações removidas.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie a conexão e os tokens das suas instâncias WPPConnect.
        </p>
      </div>

      {/* API Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4" />
            Conexão com a API
          </CardTitle>
          <CardDescription>
            URL do servidor e chave secreta. Os tokens são gerados
            automaticamente — sem necessidade de inserção manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL do Servidor *</Label>
            <Input
              id="baseUrl"
              placeholder="http://localhost:21465"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key *</Label>
            <Input
              id="secretKey"
              placeholder="THISISMYSECURETOKEN"
              value={form.secretKey}
              onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Variável{" "}
              <code className="bg-muted px-1 rounded text-xs">SECRET_KEY</code>{" "}
              configurada no servidor WPPConnect.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={connecting || !form.baseUrl || !form.secretKey}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar e Conectar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Token Manager */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-4 w-4" />
                  Tokens por Sessão
                </CardTitle>
                <CardDescription>
                  Cada instância possui um token Bearer único gerado
                  automaticamente e armazenado no navegador.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateAll}
                disabled={regenerating !== null}
                className="gap-2 shrink-0"
              >
                {regenerating === "__all__" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Renovar Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Global token */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Token Global</p>
                    <Badge variant="secondary" className="text-xs">sistema</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-64">
                    {globalToken
                      ? `${globalToken.slice(0, 20)}...`
                      : "Não gerado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {globalToken && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRegenerateToken(GLOBAL_SESSION)}
                  disabled={regenerating !== null}
                  className="h-8 px-2"
                >
                  {regenerating === GLOBAL_SESSION ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Per-session tokens */}
            {userSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-2">
                Nenhuma sessão encontrada ainda. Os tokens aparecem aqui
                automaticamente ao acessar as instâncias.
              </p>
            ) : (
              userSessions.map(([session, token]) => (
                <div
                  key={session}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                      <Key className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-64">
                        {`${token.slice(0, 20)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateToken(session)}
                      disabled={regenerating !== null}
                      className="h-8 px-2"
                      title="Renovar token"
                    >
                      {regenerating === session ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {isConfigured && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
              <Trash2 className="h-4 w-4" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Remove todas as credenciais e tokens salvos localmente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Limpar tudo</p>
                <p className="text-xs text-muted-foreground">
                  Remove URL, Secret Key e todos os tokens armazenados.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
