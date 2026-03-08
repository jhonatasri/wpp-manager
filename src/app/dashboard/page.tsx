"use client";

import Link from "next/link";
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { useInstances, useRefreshInstances } from "@/hooks/useInstances";
import { useAuthStore } from "@/store/authStore";
import { formatPhoneNumber } from "@/utils/format";
import { InstanceStats } from "@/types/instance";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { isConfigured } = useAuthStore();
  const { data: instances = [], isLoading, error } = useInstances();
  const refresh = useRefreshInstances();

  const stats: InstanceStats = {
    total: instances.length,
    connected: instances.filter((i) => i.status === "CONNECTED").length,
    disconnected: instances.filter(
      (i) => i.status === "DISCONNECTED" || i.status === "CLOSED"
    ).length,
    connecting: instances.filter(
      (i) =>
        i.status === "QRCODE" ||
        i.status === "INITIALIZING" ||
        i.status === "LOADING" ||
        i.status === "PAIRING"
    ).length,
  };

  if (!isConfigured) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">API não configurada</h2>
          <p className="text-muted-foreground text-sm">
            Configure as credenciais da API WPPConnect usando o botão
            &quot;Configurar API&quot; no cabeçalho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral das suas instâncias WPPConnect
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Instâncias"
          value={stats.total}
          icon={Smartphone}
          color="text-blue-500"
          description="Todas as instâncias cadastradas"
          loading={isLoading}
        />
        <StatCard
          title="Conectadas"
          value={stats.connected}
          icon={CheckCircle2}
          color="text-green-500"
          description="Instâncias ativas e funcionando"
          loading={isLoading}
        />
        <StatCard
          title="Desconectadas"
          value={stats.disconnected}
          icon={XCircle}
          color="text-red-500"
          description="Instâncias offline ou fechadas"
          loading={isLoading}
        />
        <StatCard
          title="Conectando"
          value={stats.connecting}
          icon={Clock}
          color="text-yellow-500"
          description="Aguardando QR Code ou inicializando"
          loading={isLoading}
        />
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                Erro ao carregar instâncias: {(error as Error).message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Instances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Instâncias Recentes</CardTitle>
            <CardDescription>
              As últimas {Math.min(5, instances.length)} instâncias registradas
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instances" className="gap-1.5">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : instances.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Smartphone className="h-10 w-10 opacity-30" />
              <p className="text-sm">Nenhuma instância encontrada.</p>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/dashboard/instances">Criar primeira instância</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {instances.slice(0, 5).map((instance) => (
                <div
                  key={instance.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                    <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{instance.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPhoneNumber(instance.phoneNumber)}
                    </p>
                  </div>
                  <StatusBadge status={instance.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
