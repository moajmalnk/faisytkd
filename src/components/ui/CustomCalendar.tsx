import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomCalendarProps = {
  /** Selected date value */
  selected?: Date | undefined;
  /** Callback when a date is selected */
  onSelect?: (date: Date | undefined) => void;
  /** Optional className for root */
  className?: string;
  /** Disable dates before this date (inclusive) */
  minDate?: Date;
  /** Disable dates after this date (inclusive) */
  maxDate?: Date;
  /** Render a custom header title (current month/year) */
  renderTitle?: (currentMonth: Date) => React.ReactNode;
  /** Start of week: 0=Sun, 1=Mon, ... */
  weekStartsOn?: number;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clampDate(date: Date, min?: Date, max?: Date) {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selected,
  onSelect,
  className,
  minDate,
  maxDate,
  renderTitle,
  weekStartsOn = 0,
}) => {
  const initialMonth = React.useMemo(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [selected]);

  const [currentMonth, setCurrentMonth] = React.useState<Date>(initialMonth);

  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selected]);

  const goPrev = React.useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }, []);
  const goNext = React.useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }, []);

  const handleSelect = React.useCallback(
    (date: Date) => {
      const clamped = clampDate(date, minDate, maxDate);
      onSelect?.(clamped);
    },
    [minDate, maxDate, onSelect]
  );

  const monthLabel = React.useMemo(() => {
    return currentMonth.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const startDay = (startOfMonth.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = endOfMonth.getDate();
  const days: Array<Date | null> = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7).map((dow) =>
    new Date(2020, 5, 7 + dow).toLocaleDateString(undefined, { weekday: "short" })
  );

  const isDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent p-0 opacity-70 hover:opacity-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {renderTitle ? renderTitle(currentMonth) : monthLabel}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent p-0 opacity-70 hover:opacity-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full border-collapse space-y-1">
        <div className="flex">
          {weekdayLabels.map((label) => (
            <div key={label} className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center">
              {label}
            </div>
          ))}
        </div>

        {/* Weeks grid */}
        <div className="flex flex-col mt-2">
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex w-full mt-2">
              {days.slice(rowIdx * 7, rowIdx * 7 + 7).map((date, colIdx) => {
                if (!date) {
                  return <div key={`empty-${rowIdx}-${colIdx}`} className="h-9 w-9" />;
                }
                const selectedDay = selected && isSameDay(date, selected);
                const disabled = isDisabled(date);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(date)}
                    className={cn(
                      "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md",
                      selectedDay
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                      disabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                    aria-current={isSameDay(date, new Date()) ? "date" : undefined}
                    aria-pressed={selectedDay || undefined}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CustomCalendar.displayName = "CustomCalendar";

export default CustomCalendar;


