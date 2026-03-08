"use client";

import { useState } from "react";
import { Plus, Loader2, QrCode } from "lucide-react";
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
import { useCreateInstance } from "@/hooks/useInstanceActions";
import { QrCodeModal } from "@/components/QrCodeModal";

interface CreateInstanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateInstanceModal({ open, onClose }: CreateInstanceModalProps) {
  const [name, setName] = useState("");
  const [webhook, setWebhook] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<string | undefined>();
  const [createdSession, setCreatedSession] = useState("");

  const createInstance = useCreateInstance();

  const handleCreate = async () => {
    if (!name.trim()) return;

    const sessionName = name.trim().replace(/\s+/g, "_").toUpperCase();

    const result = await createInstance.mutateAsync({
      name: sessionName,
      webhook: webhook || undefined,
    });

    setCreatedSession(sessionName);

    // Extract QR code from response if available
    const qr =
      (result?.session as { qrcode?: string })?.qrcode ??
      (result?.session as { urlCode?: string })?.urlCode;

    if (qr) {
      setQrData(qr);
      setQrOpen(true);
    }

    onClose();
    setName("");
    setWebhook("");
  };

  const handleClose = () => {
    if (!createInstance.isPending) {
      onClose();
      setName("");
      setWebhook("");
    }
  };

  const sessionPreview = name.trim()
    ? name.trim().replace(/\s+/g, "_").toUpperCase()
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Nova Instância
            </DialogTitle>
            <DialogDescription>
              Crie uma nova instância do WhatsApp. Após criar, você precisará
              escanear o QR Code para autenticar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="instanceName">Nome da Instância *</Label>
              <Input
                id="instanceName"
                placeholder="ex: minha_empresa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                disabled={createInstance.isPending}
              />
              {sessionPreview && (
                <p className="text-xs text-muted-foreground">
                  ID da sessão:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {sessionPreview}
                  </code>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">
                Webhook URL{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="webhook"
                placeholder="https://meu-servidor.com/webhook"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                disabled={createInstance.isPending}
              />
              <p className="text-xs text-muted-foreground">
                URL que receberá os eventos do WhatsApp (mensagens, status, etc.)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-3">
              <div className="flex items-start gap-2">
                <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Próximo passo
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                    Após criar a instância, um QR Code será gerado para você
                    escanear com o WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={createInstance.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || createInstance.isPending}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {createInstance.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Instância
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        sessionName={createdSession}
        qrCode={qrData}
      />
    </>
  );
}
