"use client";

import { Smartphone, Phone, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { InstanceActions } from "@/components/InstanceActions";
import { Instance } from "@/types/instance";
import { formatPhoneNumber } from "@/utils/format";

interface InstanceCardProps {
  instance: Instance;
}

export function InstanceCard({ instance }: InstanceCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-none truncate">
                {instance.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                ID: {instance.id}
              </p>
            </div>
          </div>
          <StatusBadge status={instance.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Phone Number */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Número:</span>
          <span className="font-medium truncate">
            {formatPhoneNumber(instance.phoneNumber)}
          </span>
        </div>

        {/* Platform */}
        {instance.platform && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Plataforma:</span>
            <span className="font-medium">{instance.platform}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t">
          <InstanceActions instance={instance} layout="card" />
        </div>
      </CardContent>
    </Card>
  );
}
