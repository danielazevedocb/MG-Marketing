"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateBr,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/date-format";
import { cn } from "@/lib/utils";

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4" />
          {selected ? formatDateBr(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
        />
        <div className="flex gap-2 border-t p-3">
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
