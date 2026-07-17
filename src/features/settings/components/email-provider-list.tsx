"use client";

import { CheckCircle2, Loader2, Pencil, Trash2, Zap } from "lucide-react";
import { useState, useTransition } from "react";

import {
  deleteEmailProviderAction,
  setActiveEmailProviderAction,
  testEmailProviderConnectionAction,
} from "@/actions/email-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EmailProviderDto } from "@/services/email-providers";
import { ProviderType } from "@/generated/prisma/enums";

type EmailProviderListProps = {
  canWrite: boolean;
  providers: EmailProviderDto[];
  isLoading: boolean;
  error?: string;
  onEdit: (provider: EmailProviderDto) => void;
  onChanged: () => void;
};

const providerLabels: Record<ProviderType, string> = {
  [ProviderType.SMTP]: "SMTP",
  [ProviderType.Resend]: "Resend",
  [ProviderType.SendGrid]: "SendGrid",
  [ProviderType.SES]: "Amazon SES",
  [ProviderType.Mailgun]: "Mailgun",
  [ProviderType.Postmark]: "Postmark",
};

export function EmailProviderList({
  canWrite,
  providers,
  isLoading,
  error,
  onEdit,
  onChanged,
}: EmailProviderListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<EmailProviderDto | null>(
    null,
  );

  function handleActivate(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setActiveEmailProviderAction(id);
      setPendingId(null);
      if (result.success) {
        onChanged();
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);

    setPendingId(id);
    startTransition(async () => {
      const result = await deleteEmailProviderAction(id);
      setPendingId(null);
      if (result.success) {
        onChanged();
      }
    });
  }

  function handleTest(id: string) {
    setPendingId(id);
    setTestFeedback((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    startTransition(async () => {
      const result = await testEmailProviderConnectionAction({
        mode: "saved",
        providerId: id,
      });
      setPendingId(null);

      if (result.success) {
        setTestFeedback((current) => ({
          ...current,
          [id]: result.data,
        }));
      } else {
        setTestFeedback((current) => ({
          ...current,
          [id]: {
            success: false,
            message: result.error,
          },
        }));
      }
    });
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Carregando provedores...
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        Não foi possível carregar os provedores: {error}
      </p>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-8 text-center">
        <p className="font-medium">Nenhum provedor cadastrado</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Adicione um provedor SMTP ou transacional para habilitar envios por
          email.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => {
        const feedback = testFeedback[provider.id];
        const busy = isPending && pendingId === provider.id;

        return (
          <article
            key={provider.id}
            className="border-border bg-card rounded-lg border p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-medium">{provider.name}</h2>
                  <Badge variant="outline">
                    {providerLabels[provider.provider]}
                  </Badge>
                  {provider.active ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Ativo
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {provider.fromName} &lt;{provider.fromEmail}&gt;
                </p>
                {provider.credentialsMeta.hasCredentials ? (
                  <p className="text-muted-foreground text-xs">
                    Credenciais configuradas
                    {provider.credentialsMeta.host
                      ? ` · ${provider.credentialsMeta.host}:${provider.credentialsMeta.port}`
                      : ""}
                    {provider.credentialsMeta.region
                      ? ` · região ${provider.credentialsMeta.region}`
                      : ""}
                    {provider.credentialsMeta.domain
                      ? ` · ${provider.credentialsMeta.domain}`
                      : ""}
                  </p>
                ) : (
                  <p className="text-destructive text-xs">
                    Credenciais ausentes
                  </p>
                )}
              </div>

              {canWrite ? (
                <div className="flex flex-wrap gap-2">
                  {!provider.active ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => handleActivate(provider.id)}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Ativar
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => handleTest(provider.id)}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Zap className="size-4" />
                    )}
                    Testar conexão
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onEdit(provider)}
                  >
                    <Pencil className="size-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setDeleteTarget(provider)}
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                </div>
              ) : null}
            </div>

            {feedback ? (
              <p
                role={feedback.success ? "status" : "alert"}
                className={
                  feedback.success
                    ? "mt-3 text-sm text-emerald-600"
                    : "text-destructive mt-3 text-sm"
                }
              >
                {feedback.message}
              </p>
            ) : null}
          </article>
        );
      })}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir provedor de email</DialogTitle>
            <DialogDescription className="wrap-anywhere">
              Excluir{" "}
              <span className="text-foreground font-medium">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              ? Campanhas que usam este provedor deixarão de enviar até que
              outro seja ativado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
