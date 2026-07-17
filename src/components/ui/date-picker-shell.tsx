"use client";

// Estrutura compartilhada entre `DatePicker` e `DateTimePicker`: botão de
// disparo (com valor formatado ou placeholder) + Popover + Calendar + rodapé
// de ações. Cada picker injeta seu próprio `footer` (ex.: seletor de hora) e
// `actions` (ex.: "Hoje"/"Agora" e "Limpar").
import { CalendarIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DatePickerShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  triggerText: string;
  hasValue: boolean;
  selected: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  /** Conteúdo extra entre o calendário e as ações (ex.: seletores de hora/minuto). */
  footer?: ReactNode;
  /** Botões de ação rápida (ex.: "Hoje"/"Agora", "Limpar"). */
  actions: ReactNode;
};

export function DatePickerShell({
  open,
  onOpenChange,
  id,
  disabled = false,
  ariaLabel,
  className,
  triggerText,
  hasValue,
  selected,
  onSelectDate,
  footer,
  actions,
}: DatePickerShellProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !hasValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelectDate}
          defaultMonth={selected}
        />
        <div className="space-y-3 border-t p-3">
          {footer}
          <div className="flex gap-2">{actions}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
