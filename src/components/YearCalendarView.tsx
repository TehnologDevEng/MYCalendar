import React from 'react';
import {
  DOW_SHORT,
  DayNotesMap,
  DayOverrideMap,
  MONTHS,
  SHIFT_TYPES,
  ShiftCode,
  getDayOfWeekIndex,
  getDaysInMonth,
  toIsoDate,
} from '../data/scheduleData';
import { SHIFT_STYLES } from '../data/shiftStyles';

interface YearCalendarViewProps {
  year: number;
  scheduleByMonth: Record<number, Record<number, ShiftCode>>;
  activeFilter: ShiftCode | 'all';
  showCellCodes: boolean;
  selectedDate: string | null;
  highlightedMonth: number | null;
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  onSelectDay: (isoDate: string) => void;
}

export const YearCalendarView: React.FC<YearCalendarViewProps> = ({
  year,
  scheduleByMonth,
  activeFilter,
  showCellCodes,
  selectedDate,
  highlightedMonth,
  overrides,
  notes,
  onSelectDay,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {MONTHS.map((monthName, monthIndex) => {
        const daysCount = getDaysInMonth(year, monthIndex);
        const startOffset = getDayOfWeekIndex(year, monthIndex, 1);
        const monthSchedule = scheduleByMonth[monthIndex];

        let monthHours = 0;
        let monthWorkDays = 0;
        for (let d = 1; d <= daysCount; d++) {
          const code = monthSchedule[d];
          monthHours += SHIFT_TYPES[code].hours;
          if (SHIFT_TYPES[code].isWork) monthWorkDays++;
        }

        const isFocusedMonth = highlightedMonth === monthIndex;

        return (
          <section
            key={`${year}-${monthIndex}`}
            id={`month-card-${monthIndex}`}
            className={`bg-white dark:bg-[#111927] rounded-xl border p-4 transition-colors ${
              isFocusedMonth
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {monthName}
              </h2>
              <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {monthHours} ч · {monthWorkDays} смен
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DOW_SHORT.map((dow, idx) => (
                <div
                  key={dow}
                  className={`text-center text-[11px] font-medium py-1 ${
                    idx >= 5
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {dow}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, emptyIdx) => (
                <div key={`empty-${emptyIdx}`} className="aspect-square" aria-hidden="true" />
              ))}

              {Array.from({ length: daysCount }).map((_, idx) => {
                const day = idx + 1;
                const code = monthSchedule[day];
                const iso = toIsoDate(year, monthIndex, day);
                const meta = SHIFT_TYPES[code];
                const style = SHIFT_STYLES[code];
                const isDimmed = activeFilter !== 'all' && activeFilter !== code;
                const isSelected = selectedDate === iso;
                const hasOverride = Boolean(overrides[iso]);
                const hasNote = Boolean(notes[iso]?.trim());

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelectDay(iso)}
                    title={`${day} ${monthName} ${year} · ${meta.label}${meta.hours ? ` (${meta.hours} ч)` : ''}${hasNote ? ` · ${notes[iso]}` : ''}`}
                    className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 select-none cursor-pointer ${
                      style.cell
                    } ${
                      isDimmed ? 'opacity-20 grayscale-[45%]' : 'opacity-100'
                    } ${
                      isSelected
                        ? 'ring-2 ring-blue-600 dark:ring-blue-400 z-10 font-bold'
                        : ''
                    }`}
                  >
                    <span className="font-mono tabular-nums text-[12px] leading-none font-semibold">
                      {day}
                    </span>
                    {showCellCodes && (
                      <span className="text-[9px] leading-none mt-0.5 opacity-80 font-medium">
                        {meta.shortCode}
                      </span>
                    )}
                    {(hasOverride || hasNote) && (
                      <span
                        className="absolute top-0.5 right-0.5 flex items-center gap-0.5"
                        aria-hidden="true"
                      >
                        {hasOverride && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                        {hasNote && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-200" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
