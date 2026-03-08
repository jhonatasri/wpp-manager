"use client";

import { useState } from "react";
import {
  Play,
  RotateCcw,
  LogOut,
  Trash2,
  QrCode,
  Loader2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Instance } from "@/types/instance";
import {
  useConnectInstance,
  useRestartInstance,
  useLogoutInstance,
  useDeleteInstance,
} from "@/hooks/useInstanceActions";
import { QrCodeModal } from "@/components/QrCodeModal";

interface InstanceActionsProps {
  instance: Instance;
  layout?: "table" | "card";
}

export function InstanceActions({
  instance,
  layout = "table",
}: InstanceActionsProps) {
  const [qrOpen, setQrOpen] = useState(false);

  const connect = useConnectInstance();
  const restart = useRestartInstance();
  const logout = useLogoutInstance();
  const deleteInst = useDeleteInstance();

  const isConnected = instance.status === "CONNECTED";
  const isDisconnected =
    instance.status === "DISCONNECTED" || instance.status === "CLOSED";

  const isLoading =
    connect.isPending ||
    restart.isPending ||
    logout.isPending ||
    deleteInst.isPending;

  const buttonSize = layout === "card" ? "sm" : "sm";

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex items-center gap-1.5 flex-wrap ${layout === "card" ? "w-full" : ""}`}>
        {/* Connect / Show QR */}
        {!isConnected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={buttonSize}
                variant="outline"
                onClick={() => connect.mutate(instance.name)}
                disabled={isLoading}
                className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950/20"
              >
                {connect.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Conectar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Iniciar instância</TooltipContent>
          </Tooltip>
        )}

        {/* QR Code — visible for any non-connected state */}
        {!isConnected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={buttonSize}
                variant="outline"
                onClick={() => setQrOpen(true)}
                disabled={isLoading}
                className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visualizar QR Code</TooltipContent>
          </Tooltip>
        )}

        {/* Restart */}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  size={buttonSize}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-1.5 text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-950/20"
                >
                  {restart.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Reiniciar
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Reiniciar instância</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reiniciar instância?</AlertDialogTitle>
              <AlertDialogDescription>
                A instância <strong>{instance.name}</strong> será fechada e
                reiniciada. Isso pode causar uma breve interrupção.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => restart.mutate(instance.name)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Reiniciar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Disconnect */}
        {isConnected && (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size={buttonSize}
                    variant="outline"
                    disabled={isLoading}
                    className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20"
                  >
                    {logout.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5" />
                    )}
                    Desconectar
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Fazer logout da instância</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desconectar instância?</AlertDialogTitle>
                <AlertDialogDescription>
                  A instância <strong>{instance.name}</strong> será desconectada
                  e precisará ser autenticada novamente via QR Code.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => logout.mutate(instance.name)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Desconectar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete */}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  size={buttonSize}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                >
                  {deleteInst.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Deletar
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Deletar dados da instância</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar instância?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>apagar permanentemente</strong> todos os
                dados da instância <strong>{instance.name}</strong>. Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteInst.mutate(instance.name)}
                className="bg-red-600 hover:bg-red-700"
              >
                Deletar Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        sessionName={instance.name}
      />
    </TooltipProvider>
  );
}
