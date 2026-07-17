"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePickerShell } from "@/components/ui/date-picker-shell";
import {
  formatDateBr,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/date-format";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  id?: string;
};

export function DatePicker({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Selecione a data",
  "aria-label": ariaLabel,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateOnly(value);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(toDateOnlyString(date));
    setOpen(false);
  }

  return (
    <DatePickerShell
      open={open}
      onOpenChange={setOpen}
      id={id}
      disabled={disabled}
      ariaLabel={ariaLabel}
      className={className}
      triggerText={selected ? formatDateBr(selected) : placeholder}
      hasValue={Boolean(value)}
      selected={selected}
      onSelectDate={handleSelect}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange(toDateOnlyString(new Date()));
              setOpen(false);
            }}
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Limpar
          </Button>
        </>
      }
    />
  );
}
