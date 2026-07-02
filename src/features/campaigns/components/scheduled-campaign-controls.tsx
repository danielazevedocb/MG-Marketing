"use client";

import { CalendarClock, X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  cancelScheduledCampaignAction,
  rescheduleCampaignAction,
  type CampaignDto,
} from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Label } from "@/components/ui/label";

type ScheduledCampaignControlsProps = {
  campaign: CampaignDto;
  disabled?: boolean;
  onChanged: () => void;
};

function formatScheduledAt(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function ScheduledCampaignControls({
  campaign,
  disabled,
  onChanged,
}: ScheduledCampaignControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAt, setRescheduleAt] = useState(campaign.scheduledAt ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (!confirm("Cancelar o agendamento desta campanha?")) return;

    startTransition(async () => {
      setError(null);
      const result = await cancelScheduledCampaignAction(campaign.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  function handleReschedule() {
    if (!rescheduleAt) {
      setError("Informe data e hora para reagendar");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await rescheduleCampaignAction(campaign.id, rescheduleAt);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRescheduleOpen(false);
      onChanged();
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <CalendarClock className="size-4 shrink-0" />
        Envio em {formatScheduledAt(campaign.scheduledAt)}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
          onClick={() => {
            setError(null);
            setRescheduleAt(campaign.scheduledAt ?? "");
            setRescheduleOpen(true);
          }}
        >
          <CalendarClock className="size-4" />
          Reagendar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
          onClick={handleCancel}
        >
          <X className="size-4" />
          Cancelar
        </Button>
      </div>

      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : null}

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar campanha</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e hora futura para o envio automático.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`reschedule-${campaign.id}`}>Data e hora</Label>
            <DateTimePicker
              id={`reschedule-${campaign.id}`}
              value={rescheduleAt}
              disabled={isPending}
              onChange={setRescheduleAt}
            />
          </div>

          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setRescheduleOpen(false)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={handleReschedule}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { formatScheduledAt };
