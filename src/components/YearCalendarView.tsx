import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  ComputedMonthPattern,
  DOW_SHORT,
  DayNotesMap,
  DayOverrideMap,
  MONTHS,
  MONTHS_SHORT,
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
  monthPatterns: Record<number, ComputedMonthPattern>;
  activeFilter: ShiftCode | 'all';
  showCellCodes: boolean;
  selectedDate: string | null;
  highlightedMonth: number | null;
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  onSelectDay: (isoDate: string) => void;
  onEditMonth: (monthIndex: number) => void;
}

export const YearCalendarView: React.FC<YearCalendarViewProps> = ({
  year,
  scheduleByMonth,
  monthPatterns,
  activeFilter,
  showCellCodes,
  selectedDate,
  highlightedMonth,
  overrides,
  notes,
  onSelectDay,
  onEditMonth,
}) => {
  const scrollToMonth = (monthIndex: number) => {
    const el = document.getElementById(`month-card-${monthIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Quick horizontal month jumper for phones */}
      <div className="md:hidden -mx-3 px-3 overflow-x-auto no-print">
        <div className="inline-flex items-center gap-1.5 py-0.5">
          {MONTHS_SHORT.map((shortName, mIdx) => {
            const p = monthPatterns[mIdx];
            const isHighlighted = p?.hasPerevakhtovka || p?.isCustomMonth;
            return (
              <button
                key={shortName}
                type="button"
                onClick={() => scrollToMonth(mIdx)}
                className={`min-h-[38px] px-3 rounded-lg bg-[#0E0E0F] border text-xs font-medium active:bg-[#00BCC5] active:text-black active:border-[#00BCC5] capitalize whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'border-[#00BCC5]/50 text-[#00BCC5]'
                    : 'border-[#222226] text-[#8A8F98]'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {MONTHS.map((monthName, monthIndex) => {
          const daysCount = getDaysInMonth(year, monthIndex);
          const startOffset = getDayOfWeekIndex(year, monthIndex, 1);
          const monthSchedule = scheduleByMonth[monthIndex];
          const pattern = monthPatterns[monthIndex];

          let monthHours = 0;
          let monthWorkDays = 0;
          for (let d = 1; d <= daysCount; d++) {
            const code = monthSchedule[d];
            monthHours += SHIFT_TYPES[code].hours;
            if (SHIFT_TYPES[code].isWork) monthWorkDays++;
          }

          const isFocusedMonth = highlightedMonth === monthIndex;
          const hasAccentBorder = pattern?.hasPerevakhtovka || pattern?.isCustomMonth;

          return (
            <section
              key={`${year}-${monthIndex}`}
              id={`month-card-${monthIndex}`}
              className={`scroll-mt-16 bg-[#0E0E0F] rounded-xl border p-3 sm:p-4 transition-colors ${
                isFocusedMonth
                  ? 'border-[#00BCC5] ring-1 ring-[#00BCC5]/40'
                  : hasAccentBorder
                  ? 'border-[#00BCC5]/45'
                  : 'border-[#222226] hover:border-[#2E2E34]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 pb-2.5 border-b border-[#1D1D21]">
                <div className="flex items-baseline gap-2 min-w-0">
                  <h2 className="text-[15px] font-semibold text-[#F7F8F8] truncate">
                    {monthName}
                  </h2>
                  {pattern?.badgeText && (
                    <span className="text-[11px] font-medium text-[#00BCC5] truncate">
                      {pattern.badgeText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono tabular-nums text-[#8A8F98] whitespace-nowrap">
                    {monthHours} ч · {monthWorkDays} смен
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditMonth(monthIndex)}
                    title={`Настроить рабочие дни: ${monthName} ${year}`}
                    aria-label={`Настроить рабочие дни за ${monthName} ${year}`}
                    className="no-print w-7 h-7 flex items-center justify-center rounded-md text-[#666] hover:text-[#00BCC5] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DOW_SHORT.map((dow, idx) => (
                  <div
                    key={dow}
                    className={`text-center text-[11px] font-medium py-1 ${
                      idx >= 5 ? 'text-[#5C616B]' : 'text-[#8A8F98]'
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
                      className={`relative aspect-square min-h-[40px] sm:min-h-0 rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BCC5] select-none cursor-pointer ${
                        style.cell
                      } ${
                        isDimmed ? 'opacity-20 grayscale-[55%]' : 'opacity-100'
                      } ${
                        isSelected
                          ? 'ring-2 ring-[#00BCC5] border-[#00BCC5] z-10 font-bold'
                          : ''
                      }`}
                    >
                      <span className="font-mono tabular-nums text-[13px] sm:text-[12px] leading-none font-semibold">
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
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00BCC5]" />
                          )}
                          {hasNote && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F7F8F8]" />
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
    </div>
  );
};
