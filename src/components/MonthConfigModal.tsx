import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import {
  MONTHS,
  MonthWorkConfig,
  ROAD_PLACEMENT_OPTIONS,
  RoadPlacement,
  SHIFT_TYPES,
  buildMonthDaysFromConfig,
  getDaysInMonth,
} from '../data/scheduleData';

interface MonthConfigModalProps {
  year: number;
  monthIndex: number;
  initialConfig: MonthWorkConfig;
  isCustom: boolean;
  hasPerevakhtovka: boolean;
  onSave: (config: MonthWorkConfig) => void;
  onReset: () => void;
  onClose: () => void;
}

export const MonthConfigModal: React.FC<MonthConfigModalProps> = ({
  year,
  monthIndex,
  initialConfig,
  isCustom,
  hasPerevakhtovka,
  onSave,
  onReset,
  onClose,
}) => {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const [isAllRest, setIsAllRest] = useState(initialConfig.workStart === 0);
  const [workStart, setWorkStart] = useState(
    initialConfig.workStart > 0 ? initialConfig.workStart : 1
  );
  const [workEnd, setWorkEnd] = useState(
    initialConfig.workEnd > 0 ? Math.min(daysInMonth, initialConfig.workEnd) : Math.min(15, daysInMonth)
  );
  const [road, setRoad] = useState<RoadPlacement>(initialConfig.road);
  const [useAutoSplit, setUseAutoSplit] = useState(initialConfig.dayShiftsCount === undefined);
  const [dayShiftsCount, setDayShiftsCount] = useState<number>(
    initialConfig.dayShiftsCount ?? 7
  );
  const [cascadeAfter, setCascadeAfter] = useState<boolean>(initialConfig.cascadeAfter);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const draftConfig: MonthWorkConfig = useMemo(() => {
    if (isAllRest) {
      return {
        workStart: 0,
        workEnd: 0,
        road: 'none',
        cascadeAfter,
      };
    }
    const safeStart = Math.max(1, Math.min(daysInMonth, workStart));
    const safeEnd = Math.max(safeStart, Math.min(daysInMonth, workEnd));
    return {
      workStart: safeStart,
      workEnd: safeEnd,
      road,
      dayShiftsCount: useAutoSplit ? undefined : dayShiftsCount,
      cascadeAfter,
    };
  }, [isAllRest, workStart, workEnd, daysInMonth, road, useAutoSplit, dayShiftsCount, cascadeAfter]);

  const previewStats = useMemo(() => {
    const days = buildMonthDaysFromConfig(year, monthIndex, draftConfig);
    let y = 0;
    let n = 0;
    let d = 0;
    let v = 0;
    let hours = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const code = days[i];
      if (code === 'y') y++;
      else if (code === 'n') n++;
      else if (code === 'd') d++;
      else v++;
      hours += SHIFT_TYPES[code].hours;
    }
    return { y, n, d, v, hours };
  }, [year, monthIndex, draftConfig, daysInMonth]);

  const innerWorkDays = useMemo(() => {
    if (isAllRest) return 0;
    const total = Math.max(0, Math.min(daysInMonth, workEnd) - Math.max(1, workStart) + 1);
    const roadCount =
      road === 'both' ? Math.min(2, total) : road === 'none' ? 0 : Math.min(1, total);
    return Math.max(0, total - roadCount);
  }, [isAllRest, workStart, workEnd, daysInMonth, road]);

  const applyPreset = (preset: 'first_half' | 'second_half' | 'short_14') => {
    setIsAllRest(false);
    setUseAutoSplit(true);
    if (preset === 'first_half') {
      const end = monthIndex === 1 ? 15 : 17;
      setWorkStart(1);
      setWorkEnd(Math.min(daysInMonth, end));
      setRoad('end');
    } else if (preset === 'second_half') {
      const start = monthIndex === 1 ? 15 : 16;
      setWorkStart(start);
      setWorkEnd(daysInMonth);
      setRoad('start');
    } else {
      setWorkStart(1);
      setWorkEnd(14);
      setRoad('none');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-config-title"
        className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-[#0E0E0F] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#26262C] shadow-2xl overflow-hidden"
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#33333A]" aria-hidden="true" />
        </div>

        <div className="px-5 py-3.5 sm:py-4 border-b border-[#222226] flex items-center justify-between gap-2 shrink-0">
          <div>
            <h3
              id="month-config-title"
              className="text-base font-bold text-[#F7F8F8]"
            >
              {MONTHS[monthIndex]} {year} · рабочие дни
            </h3>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              В месяце {daysInMonth} дней · точная настройка смен
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {hasPerevakhtovka && (
            <div className="px-3.5 py-2.5 rounded-lg bg-[#131D1F] border border-[#00BCC5]/35 text-xs text-[#C8CCD4]">
              На этот месяц сейчас действует диапазон перевахтовки. Чтобы задать дни вручную
              здесь, удалите перевахтовку на этот месяц в разделе «Перевахтовки и отпуска».
            </div>
          )}

          {/* Quick presets */}
          <div>
            <div className="text-xs font-medium text-[#8A8F98] mb-2">Быстрые шаблоны</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('first_half')}
                className="min-h-[38px] px-2 rounded-lg border border-[#2A2A30] bg-[#141416] hover:border-[#00BCC5]/60 text-xs text-[#F7F8F8] cursor-pointer"
              >
                1–{monthIndex === 1 ? 15 : 17} (выезд)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('second_half')}
                className="min-h-[38px] px-2 rounded-lg border border-[#2A2A30] bg-[#141416] hover:border-[#00BCC5]/60 text-xs text-[#F7F8F8] cursor-pointer"
              >
                {monthIndex === 1 ? 15 : 16}–{daysInMonth} (заезд)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('short_14')}
                className="min-h-[38px] px-2 rounded-lg border border-[#2A2A30] bg-[#141416] hover:border-[#00BCC5]/60 text-xs text-[#F7F8F8] cursor-pointer"
              >
                1–14 (короткая)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#F7F8F8] cursor-pointer">
            <input
              type="checkbox"
              checked={isAllRest}
              onChange={(e) => setIsAllRest(e.target.checked)}
              className="w-4 h-4 accent-[#00BCC5]"
            />
            <span>Весь месяц — отдыхающая вахта (В)</span>
          </label>

          {!isAllRest && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="mc-start"
                    className="block text-xs font-medium text-[#8A8F98] mb-1.5"
                  >
                    С какого числа
                  </label>
                  <input
                    id="mc-start"
                    type="number"
                    min={1}
                    max={daysInMonth}
                    value={workStart}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(daysInMonth, Number(e.target.value) || 1));
                      setWorkStart(val);
                      if (val > workEnd) setWorkEnd(val);
                    }}
                    className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#141416] font-mono tabular-nums text-base sm:text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mc-end"
                    className="block text-xs font-medium text-[#8A8F98] mb-1.5"
                  >
                    По какое число
                  </label>
                  <input
                    id="mc-end"
                    type="number"
                    min={workStart}
                    max={daysInMonth}
                    value={workEnd}
                    onChange={(e) => {
                      const val = Math.max(
                        workStart,
                        Math.min(daysInMonth, Number(e.target.value) || workStart)
                      );
                      setWorkEnd(val);
                    }}
                    className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#141416] font-mono tabular-nums text-base sm:text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mc-road"
                  className="block text-xs font-medium text-[#8A8F98] mb-1.5"
                >
                  День дороги (Д, 8 ч)
                </label>
                <select
                  id="mc-road"
                  value={road}
                  onChange={(e) => setRoad(e.target.value as RoadPlacement)}
                  className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#141416] text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
                >
                  {ROAD_PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-[#C8CCD4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAutoSplit}
                    onChange={(e) => {
                      setUseAutoSplit(e.target.checked);
                      if (!e.target.checked) {
                        setDayShiftsCount(Math.ceil(innerWorkDays / 2));
                      }
                    }}
                    className="w-4 h-4 accent-[#00BCC5]"
                  />
                  <span>Делить дневные (Я) и ночные (Н) пополам автоматически</span>
                </label>

                {!useAutoSplit && (
                  <div className="flex items-center justify-between gap-3 pl-6">
                    <label htmlFor="mc-dayshifts" className="text-xs text-[#8A8F98]">
                      Количество дневных смен (из {innerWorkDays}):
                    </label>
                    <input
                      id="mc-dayshifts"
                      type="number"
                      min={0}
                      max={innerWorkDays}
                      value={Math.min(innerWorkDays, dayShiftsCount)}
                      onChange={(e) =>
                        setDayShiftsCount(
                          Math.max(0, Math.min(innerWorkDays, Number(e.target.value) || 0))
                        )
                      }
                      className="w-20 h-9 px-2.5 rounded-lg border border-[#2A2A30] bg-[#141416] font-mono tabular-nums text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <label className="flex items-start gap-2.5 text-xs text-[#C8CCD4] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={cascadeAfter}
              onChange={(e) => setCascadeAfter(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#00BCC5]"
            />
            <span>
              Перестроить следующие месяцы автоматически от окончания этого месяца
            </span>
          </label>

          {/* Live breakdown preview */}
          <div className="p-3.5 rounded-xl bg-[#141416] border border-[#222226] flex items-center justify-between gap-2 text-xs">
            <div className="font-mono tabular-nums space-x-2">
              <span className="text-amber-300">Я: {previewStats.y}</span>
              <span className="text-indigo-300">Н: {previewStats.n}</span>
              <span className="text-orange-400">Д: {previewStats.d}</span>
              <span className="text-emerald-400">В: {previewStats.v}</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-[#00BCC5]">
              {previewStats.hours} ч
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-3.5 bg-[#121214] border-t border-[#222226] flex items-center justify-between gap-3 shrink-0">
          {isCustom ? (
            <button
              type="button"
              onClick={() => {
                onReset();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8F98] hover:text-rose-400 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить авто
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 min-h-[42px] sm:min-h-[38px] rounded-lg border border-[#2A2A30] text-xs font-medium text-[#C8CCD4] hover:text-[#F7F8F8] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(draftConfig);
                onClose();
              }}
              className="px-4 min-h-[42px] sm:min-h-[38px] rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] text-black text-sm font-semibold transition-colors cursor-pointer"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
