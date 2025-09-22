import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // ISO yyyy-mm-dd
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Pick a date", className, minDate, maxDate }) => {
  const selectedDate = React.useMemo(() => (value ? new Date(value) : undefined), [value]);
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = toISODate(date);
    onChange?.(iso);
    setOpen(false);
  };

  const label = selectedDate
    ? selectedDate.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal h-11", !selectedDate && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar selected={selectedDate} onSelect={handleSelect} minDate={minDate} maxDate={maxDate} />
      </PopoverContent>
    </Popover>
  );
};

DatePicker.displayName = "DatePicker";

export default DatePicker;


