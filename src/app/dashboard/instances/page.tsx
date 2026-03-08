"use client";

import { useState } from "react";
import {
  Plus,
  RefreshCw,
  Loader2,
  LayoutGrid,
  List,
  Smartphone,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstanceTable } from "@/components/InstanceTable";
import { InstanceCard } from "@/components/InstanceCard";
import { CreateInstanceModal } from "@/components/CreateInstanceModal";
import { useInstances, useRefreshInstances } from "@/hooks/useInstances";
import { useAuthStore } from "@/store/authStore";
import { Instance } from "@/types/instance";

type ViewMode = "table" | "grid";

export default function InstancesPage() {
  const { isConfigured } = useAuthStore();
  const { data: instances = [], isLoading, error, isFetching } = useInstances();
  const refresh = useRefreshInstances();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");

  const filtered: Instance[] = instances.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.phoneNumber ?? "").includes(search)
  );

  const connectedCount = instances.filter((i) => i.isConnected).length;
  const disconnectedCount = instances.filter((i) => !i.isConnected).length;

  if (!isConfigured) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">API não configurada</h2>
          <p className="text-muted-foreground text-sm">
            Configure as credenciais da API WPPConnect no cabeçalho para
            começar a gerenciar instâncias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instâncias</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie todas as suas instâncias WPPConnect
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="gap-2"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Nova Instância
          </Button>
        </div>
      </div>

      {/* Summary Chips */}
      {!isLoading && instances.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
            <Smartphone className="h-3 w-3" />
            Total: {instances.length}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Conectadas: {connectedCount}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Offline: {disconnectedCount}
          </div>
          {isFetching && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Atualizando...
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/10 p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">
              Erro ao carregar instâncias: {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar: Search + View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 px-2.5"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 px-2.5"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <InstanceTable instances={filtered} isLoading={isLoading} />
      ) : (
        <div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-6 space-y-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-8 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Smartphone className="h-12 w-12 opacity-30" />
              <p className="text-sm font-medium">
                {search ? "Nenhuma instância encontrada para sua busca." : "Nenhuma instância cadastrada."}
              </p>
              {!search && (
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeira instância
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((instance) => (
                <InstanceCard key={instance.id} instance={instance} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreateInstanceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
