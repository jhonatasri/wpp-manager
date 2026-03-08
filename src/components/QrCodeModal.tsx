"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetQrCode } from "@/hooks/useInstanceActions";

const QR_REFRESH_SECONDS = 20;

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  sessionName: string;
  qrCode?: any;
}

export function QrCodeModal({ open, onClose, sessionName }: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(QR_REFRESH_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const getQr = useGetQrCode();

  const fetchQr = async () => {
    setErrorMsg(undefined);
    try {
      const res = await getQr.mutateAsync(sessionName);
      if (res.dataUrl) {
        setDataUrl(res.dataUrl);
        setCountdown(QR_REFRESH_SECONDS);
      } else {
        setDataUrl(undefined);
        setErrorMsg(res.message ?? "QR Code não disponível.");
      }
    } catch (err) {
      setDataUrl(undefined);
      setErrorMsg(err instanceof Error ? err.message : "Erro ao buscar QR Code.");
    }
  };

  // Auto-fetch when modal opens
  useEffect(() => {
    if (!open) return;
    setDataUrl(undefined);
    setErrorMsg(undefined);
    fetchQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionName]);

  // Countdown — auto-refresh when it hits 0
  useEffect(() => {
    if (!open) return;
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQr();
          return QR_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionName]);

  const loading = getQr.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — {sessionName}</DialogTitle>
          <DialogDescription>
            Escaneie com o WhatsApp para conectar esta instância. Atualizado
            automaticamente a cada {QR_REFRESH_SECONDS} segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border bg-muted">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : dataUrl ? (
            <div className="rounded-xl border-4 border-green-500 p-2 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="QR Code WhatsApp"
                className="h-60 w-60 object-contain"
              />
            </div>
          ) : (
            <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-lg border bg-muted px-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <p className="text-xs text-muted-foreground">
                {errorMsg ?? "QR Code não disponível. Tente iniciar a sessão primeiro."}
              </p>
            </div>
          )}

          {!loading && dataUrl && (
            <p className="text-xs text-muted-foreground text-center">
              Atualizando em <strong>{countdown}s</strong>
            </p>
          )}

          <Button
            variant="outline"
            onClick={fetchQr}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
