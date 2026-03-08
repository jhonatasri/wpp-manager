"use client";

import { Smartphone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { InstanceActions } from "@/components/InstanceActions";
import { Instance } from "@/types/instance";
import { formatPhoneNumber } from "@/utils/format";

interface InstanceTableProps {
  instances: Instance[];
  isLoading?: boolean;
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function InstanceTable({ instances, isLoading }: InstanceTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">Instância</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Número</TableHead>
            <TableHead className="font-semibold">Conexão</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : instances.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">Nenhuma instância encontrada</p>
                  <p className="text-xs">
                    Crie uma nova instância usando o botão acima.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            instances.map((instance) => (
              <TableRow key={instance.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                      <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{instance.name}</p>
                      <p className="text-xs text-muted-foreground">{instance.id}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge status={instance.status} />
                </TableCell>

                <TableCell>
                  <span className="text-sm font-mono">
                    {formatPhoneNumber(instance.phoneNumber)}
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      instance.isConnected
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        instance.isConnected
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    {instance.isConnected ? "Online" : "Offline"}
                  </span>
                </TableCell>

                <TableCell>
                  <InstanceActions instance={instance} layout="table" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
