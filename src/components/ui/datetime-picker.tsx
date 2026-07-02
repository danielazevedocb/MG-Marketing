"use client";

import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import {
  formatDateTimeBr,
  padTimeUnit,
  parseIsoDateTime,
  setTimeOnDate,
} from "@/lib/date-format";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

type DateTimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  id?: string;
};

function getTimeParts(date: Date | undefined) {
  if (!date) {
    return { hours: DEFAULT_HOUR, minutes: DEFAULT_MINUTE };
  }

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
}

export function DateTimePicker({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Selecione data e hora",
  "aria-label": ariaLabel,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDateTime(value);
  const [hours, setHours] = useState(() => getTimeParts(selected).hours);
  const [minutes, setMinutes] = useState(() => getTimeParts(selected).minutes);

  useEffect(() => {
    const next = getTimeParts(selected);
    setHours(next.hours);
    setMinutes(next.minutes);
  }, [value]);

  function emitChange(date: Date | undefined, nextHours: number, nextMinutes: number) {
    if (!date) {
      onChange("");
      return;
    }

    onChange(setTimeOnDate(date, nextHours, nextMinutes).toISOString());
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;

    const nextHours = selected ? hours : DEFAULT_HOUR;
    const nextMinutes = selected ? minutes : DEFAULT_MINUTE;

    setHours(nextHours);
    setMinutes(nextMinutes);
    emitChange(date, nextHours, nextMinutes);
  }

  function handleHoursChange(nextHours: number) {
    setHours(nextHours);

    if (selected) {
      emitChange(selected, nextHours, minutes);
    }
  }

  function handleMinutesChange(nextMinutes: number) {
    setMinutes(nextMinutes);

    if (selected) {
      emitChange(selected, hours, nextMinutes);
    }
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
          {selected ? formatDateTimeBr(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          defaultMonth={selected}
        />
        <div className="space-y-3 border-t p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label
                htmlFor={id ? `${id}-hour` : undefined}
                className="text-muted-foreground text-xs"
              >
                Hora
              </label>
              <Select
                id={id ? `${id}-hour` : undefined}
                value={String(hours)}
                disabled={disabled}
                onChange={(event) =>
                  handleHoursChange(Number(event.target.value))
                }
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {padTimeUnit(hour)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor={id ? `${id}-minute` : undefined}
                className="text-muted-foreground text-xs"
              >
                Minuto
              </label>
              <Select
                id={id ? `${id}-minute` : undefined}
                value={String(minutes)}
                disabled={disabled}
                onChange={(event) =>
                  handleMinutesChange(Number(event.target.value))
                }
              >
                {MINUTES.map((minute) => (
                  <option key={minute} value={minute}>
                    {padTimeUnit(minute)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const now = new Date();
                setHours(now.getHours());
                setMinutes(now.getMinutes());
                onChange(now.toISOString());
                setOpen(false);
              }}
            >
              Agora
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
