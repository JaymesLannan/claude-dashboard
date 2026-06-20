"use client";

import * as React from "react";
import { addDays, format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Preset = "today" | "yesterday" | "7d" | "30d" | "mtd" | "custom";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "mtd", label: "Month to date" },
  { value: "custom", label: "Custom range" },
];

function presetToRange(preset: Preset): DateRange {
  const now = new Date();
  const today = startOfDay(now);
  switch (preset) {
    case "today":
      return { from: today, to: now };
    case "yesterday": {
      const y = subDays(today, 1);
      return { from: y, to: addDays(y, 1) };
    }
    case "7d":
      return { from: subDays(today, 6), to: now };
    case "30d":
      return { from: subDays(today, 29), to: now };
    case "mtd":
      return { from: startOfMonth(now), to: now };
    default:
      return { from: subDays(today, 6), to: now };
  }
}

interface Props {
  onChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ onChange }: Props) {
  const [preset, setPreset] = React.useState<Preset>("7d");
  const [range, setRange] = React.useState<DateRange>(presetToRange("7d"));
  const [open, setOpen] = React.useState(false);

  function handlePreset(value: string) {
    const p = value as Preset;
    setPreset(p);
    if (p !== "custom") {
      const r = presetToRange(p);
      setRange(r);
      if (r.from && r.to) onChange({ from: r.from, to: r.to });
    }
  }

  function handleCalendar(r: DateRange | undefined) {
    if (!r) return;
    setRange(r);
    setPreset("custom");
    if (r.from && r.to) {
      onChange({ from: r.from, to: r.to });
      setOpen(false);
    }
  }

  const label =
    preset !== "custom"
      ? PRESETS.find((p) => p.value === preset)?.label
      : range.from && range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
      : "Pick range";

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePreset}>
        <SelectTrigger className="w-40 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal",
                !range.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={range.from}
              selected={range}
              onSelect={handleCalendar}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
