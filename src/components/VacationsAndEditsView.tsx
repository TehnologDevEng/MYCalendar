import React, { useMemo, useState } from 'react';
import { CalendarDays, Plus, RefreshCw, RotateCcw, SlidersHorizontal, Trash2 } from 'lucide-react';
import {
  ComputedMonthPattern,
  DayNotesMap,
  DayOverrideMap,
  MONTHS,
  MonthConfigsMap,
  PerevakhtovkaRange,
  ROAD_PLACEMENT_OPTIONS,
  RoadPlacement,
  SHIFT_TYPES,
  VacationRange,
  buildWorkSequence,
  countDaysInclusive,
  formatNumericDate,
  formatRuDate,
  getVacationWorkOverlapDays,
  pluralizeDays,
  toYearMonthKey,
} from '../data/scheduleData';

interface VacationsAndEditsViewProps {
  year: number;
  vacations: VacationRange[];
  perevakhtovki: PerevakhtovkaRange[];
  monthConfigs: MonthConfigsMap;
  baseSchedule: Record<number, Record<number, ComputedMonthPattern>>;
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  onAddVacation: (vac: Omit<VacationRange, 'id'>) => void;
  onDeleteVacation: (id: string) => void;
  onResetVacations: () => void;
  onAddPerevakhtovka: (pv: Omit<PerevakhtovkaRange, 'id'>) => void;
  onDeletePerevakhtovka: (id: string) => void;
  onResetPerevakhtovki: () => void;
  onOpenMonthConfig: (monthIndex: number) => void;
  onResetAllMonthConfigs: () => void;
  onRemoveOverride: (isoDate: string) => void;
  onClearAllOverrides: () => void;
  onDeleteNote: (isoDate: string) => void;
  onJumpToDate: (isoDate: string) => void;
}

export const VacationsAndEditsView: React.FC<VacationsAndEditsViewProps> = ({
  year,
  vacations,
  perevakhtovki,
  monthConfigs,
  baseSchedule,
  overrides,
  notes,
  onAddVacation,
  onDeleteVacation,
  onResetVacations,
  onAddPerevakhtovka,
  onDeletePerevakhtovka,
  onResetPerevakhtovki,
  onOpenMonthConfig,
  onResetAllMonthConfigs,
  onRemoveOverride,
  onClearAllOverrides,
  onDeleteNote,
  onJumpToDate,
}) => {
  // Perevakhtovka date-range form
  const defaultPvYear = year >= 2028 ? year : 2028;
  const [pvTitle, setPvTitle] = useState('');
  const [pvStart, setPvStart] = useState(`${defaultPvYear}-09-01`);
  const [pvEnd, setPvEnd] = useState(`${defaultPvYear}-09-14`);
  const [pvRoad, setPvRoad] = useState<RoadPlacement>('none');
  const [pvInvert, setPvInvert] = useState(false);
  const [pvError, setPvError] = useState<string | null>(null);

  // Vacation form
  const [vacTitle, setVacTitle] = useState('');
  const [vacStart, setVacStart] = useState(`${defaultPvYear}-09-15`);
  const [vacEnd, setVacEnd] = useState(`${defaultPvYear}-10-08`);
  const [vacError, setVacError] = useState<string | null>(null);

  const sortedPvs = [...perevakhtovki].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const sortedVacations = [...vacations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const overrideEntries = Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b));
  const noteEntries = Object.entries(notes)
    .filter(([, text]) => text.trim().length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const customMonthsCount = Object.keys(monthConfigs).length;

  const pvPreview = useMemo(() => {
    if (!pvStart || !pvEnd || pvEnd < pvStart) return null;
    const total = countDaysInclusive(pvStart, pvEnd);
    if (total <= 0 || total > 45) return null;
    const seq = buildWorkSequence(total, pvRoad);
    let y = 0;
    let n = 0;
    let d = 0;
    for (const c of seq) {
      if (c === 'y') y++;
      else if (c === 'n') n++;
      else if (c === 'd') d++;
    }
    return { total, y, n, d, hours: y * 11 + n * 11 + d * 8 };
  }, [pvStart, pvEnd, pvRoad]);

  const handlePvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPvError(null);

    if (!pvStart || !pvEnd) {
      setPvError('Укажите даты начала и окончания перевахтовки.');
      return;
    }
    if (pvEnd < pvStart) {
      setPvError('Дата окончания не может быть раньше даты начала.');
      return;
    }
    if (pvStart < '2027-01-01' || pvEnd > '2030-12-31') {
      setPvError('Допустимый диапазон дат: 2027–2030 годы.');
      return;
    }
    if (countDaysInclusive(pvStart, pvEnd) > 45) {
      setPvError('Перевахтовка не может быть длиннее 45 дней.');
      return;
    }

    onAddPerevakhtovka({
      title: pvTitle.trim() || `Перевахтовка ${formatNumericDate(pvStart).slice(0, 5)}–${formatNumericDate(pvEnd).slice(0, 5)}`,
      startDate: pvStart,
      endDate: pvEnd,
      road: pvRoad,
      invertNextPhase: pvInvert,
    });
    setPvTitle('');
  };

  const handleVacationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVacError(null);

    if (!vacStart || !vacEnd) {
      setVacError('Укажите дату начала и окончания отпуска.');
      return;
    }
    if (vacEnd < vacStart) {
      setVacError('Дата окончания не может быть раньше даты начала.');
      return;
    }
    if (vacStart < '2027-01-01' || vacEnd > '2030-12-31') {
      setVacError('Допустимый диапазон дат: 2027–2030 годы.');
      return;
    }

    onAddVacation({
      title: vacTitle.trim() || 'Отпуск',
      startDate: vacStart,
      endDate: vacEnd,
    });
    setVacTitle('');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Date-range Перевахтовки with automatic cascade */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00BCC5]" />
              <h2 className="text-base font-semibold text-[#F7F8F8]">
                Перевахтовки (с даты по дату)
              </h2>
            </div>
            <p className="text-xs text-[#8A8F98] mt-1">
              Укажите точные даты перевахтовки в любом году (сентябрь, октябрь или стык месяцев) —
              весь дальнейший график перестроится сам.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetPerevakhtovki}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium rounded-lg border border-[#2A2A30] bg-[#141416] text-[#C8CCD4] hover:text-[#F7F8F8] hover:border-[#3A3A42] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            По умолчанию
          </button>
        </div>

        <form
          onSubmit={handlePvSubmit}
          className="p-4 sm:p-5 bg-[#121214] border-b border-[#222226] space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-3">
              <label htmlFor="pv-start" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                С какого числа
              </label>
              <input
                id="pv-start"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={pvStart}
                onChange={(e) => setPvStart(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="pv-end" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                По какое число
              </label>
              <input
                id="pv-end"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={pvEnd}
                onChange={(e) => setPvEnd(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-4">
              <label htmlFor="pv-road" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Дорога (Д, 8 ч)
              </label>
              <select
                id="pv-road"
                value={pvRoad}
                onChange={(e) => setPvRoad(e.target.value as RoadPlacement)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              >
                {ROAD_PLACEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-11 sm:h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] text-black text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
            <input
              type="text"
              value={pvTitle}
              onChange={(e) => setPvTitle(e.target.value)}
              placeholder="Название (необязательно), напр. Перевахтовка октябрь 2029"
              className="w-full h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm text-[#F7F8F8] placeholder:text-[#5C616B] focus:outline-none focus:border-[#00BCC5]"
            />

            <label className="flex items-center gap-2.5 text-xs text-[#C8CCD4] cursor-pointer">
              <input
                type="checkbox"
                checked={pvInvert}
                onChange={(e) => setPvInvert(e.target.checked)}
                className="w-4 h-4 accent-[#00BCC5]"
              />
              <span>Инвертировать фазу следующего месяца после перевахтовки</span>
            </label>
          </div>

          {pvPreview && (
            <div className="text-xs font-mono tabular-nums text-[#8A8F98] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Длительность: <strong className="text-[#F7F8F8]">{pvPreview.total} {pluralizeDays(pvPreview.total)}</strong>
              </span>
              <span className="text-amber-300">Я: {pvPreview.y}</span>
              <span className="text-indigo-300">Н: {pvPreview.n}</span>
              {pvPreview.d > 0 && <span className="text-orange-400">Д: {pvPreview.d}</span>}
              <span className="text-[#00BCC5]">{pvPreview.hours} ч</span>
            </div>
          )}

          {pvError && <p className="text-xs font-medium text-rose-400">{pvError}</p>}
        </form>

        {sortedPvs.length === 0 ? (
          <div className="p-6 text-sm text-[#8A8F98]">
            Перевахтовки не заданы — график идёт ровным циклом от декабря 2027 года.
          </div>
        ) : (
          <div className="divide-y divide-[#1D1D21]">
            {sortedPvs.map((pv) => {
              const days = countDaysInclusive(pv.startDate, pv.endDate);
              const roadLabel =
                ROAD_PLACEMENT_OPTIONS.find((r) => r.value === pv.road)?.shortLabel ?? '';
              return (
                <div
                  key={pv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A1A1C] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#F7F8F8]">{pv.title}</div>
                    <div className="text-xs text-[#8A8F98] mt-0.5 font-mono tabular-nums">
                      {formatNumericDate(pv.startDate)} — {formatNumericDate(pv.endDate)} ·{' '}
                      {days} {pluralizeDays(days)} · {roadLabel}
                      {pv.invertNextPhase ? ' · со сменой фазы' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(pv.startDate)}
                      className="text-xs font-medium text-[#00BCC5] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      В календарь
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePerevakhtovka(pv.id)}
                      aria-label={`Удалить ${pv.title}`}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Per-month work days configurator (ideal for short February and any month) */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#00BCC5]" />
              <h2 className="text-base font-semibold text-[#F7F8F8]">
                Дни работы по месяцам · {year}
              </h2>
            </div>
            <p className="text-xs text-[#8A8F98] mt-1">
              Нажмите на любой месяц (например, короткий Февраль), чтобы задать точные рабочие
              числа, день дороги и число дневных смен.
            </p>
          </div>
          {customMonthsCount > 0 && (
            <button
              type="button"
              onClick={onResetAllMonthConfigs}
              className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium rounded-lg border border-[#2A2A30] bg-[#141416] text-[#C8CCD4] hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить ручные месяцы ({customMonthsCount})
            </button>
          )}
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {MONTHS.map((mName, mIdx) => {
            const pattern = baseSchedule[year]?.[mIdx];
            const ymKey = toYearMonthKey(year, mIdx);
            const isCustom = Boolean(monthConfigs[ymKey]);
            const isPv = pattern?.hasPerevakhtovka;

            return (
              <button
                key={ymKey}
                type="button"
                onClick={() => onOpenMonthConfig(mIdx)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer group ${
                  isCustom || isPv
                    ? 'bg-[#131D1F] border-[#00BCC5]/45'
                    : 'bg-[#141416] border-[#222226] hover:border-[#3A3A42]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold text-[#F7F8F8] truncate">
                    {mName}
                  </span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#666] group-hover:text-[#00BCC5] shrink-0" />
                </div>
                <div className="text-xs font-mono tabular-nums text-[#C8CCD4] mt-1">
                  Работа: {pattern?.workRangeLabel ?? '—'}
                </div>
                <div className="text-[11px] text-[#8A8F98] mt-0.5 truncate">
                  {isPv
                    ? 'Перевахтовка'
                    : isCustom
                    ? 'Задано вручную'
                    : year === 2027
                    ? 'Базовый 2027'
                    : 'Авто-цикл'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Vacations manager (taken during resting вахта) */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#F7F8F8]">
              Отпуска (в отдыхающую вахту)
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Отмечайте даты отпуска на календаре — сразу видно, попадают ли они полностью в
              межвахтовый отдых
            </p>
          </div>
          <button
            type="button"
            onClick={onResetVacations}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium rounded-lg border border-[#2A2A30] bg-[#141416] text-[#C8CCD4] hover:text-[#F7F8F8] hover:border-[#3A3A42] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Вернуть отпуска 2027
          </button>
        </div>

        <form
          onSubmit={handleVacationSubmit}
          className="p-4 sm:p-5 bg-[#121214] border-b border-[#222226]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-4">
              <label htmlFor="vac-title" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Название отпуска
              </label>
              <input
                id="vac-title"
                type="text"
                value={vacTitle}
                onChange={(e) => setVacTitle(e.target.value)}
                placeholder="Например: Отпуск сентябрь 2028"
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-base sm:text-sm text-[#F7F8F8] placeholder:text-[#5C616B] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="vac-start" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Начало
              </label>
              <input
                id="vac-start"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={vacStart}
                onChange={(e) => setVacStart(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="vac-end" className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Окончание
              </label>
              <input
                id="vac-end"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={vacEnd}
                onChange={(e) => setVacEnd(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-11 sm:h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] text-black text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          {vacError && <p className="mt-2.5 text-xs font-medium text-rose-400">{vacError}</p>}
        </form>

        {sortedVacations.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8A8F98]">
            Отпуска не заданы. Добавьте даты выше, чтобы видеть их в календаре.
          </div>
        ) : (
          <div className="divide-y divide-[#1D1D21]">
            {sortedVacations.map((vac) => {
              const check = getVacationWorkOverlapDays(vac, baseSchedule);
              return (
                <div
                  key={vac.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A1A1C] transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#F7F8F8]">{vac.title}</div>
                    <div className="text-xs text-[#8A8F98] mt-0.5 font-mono tabular-nums flex flex-wrap items-center gap-x-2">
                      <span>
                        {formatNumericDate(vac.startDate)} — {formatNumericDate(vac.endDate)} ·{' '}
                        {check.totalDays} {pluralizeDays(check.totalDays)}
                      </span>
                      <span>·</span>
                      {check.workOverlapDays === 0 ? (
                        <span className="font-sans text-emerald-400">
                          Полностью в отдыхающую вахту
                        </span>
                      ) : (
                        <span className="font-sans text-amber-300">
                          Пересекает рабочих дней: {check.workOverlapDays}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(vac.startDate)}
                      className="text-xs font-medium text-[#00BCC5] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      В календарь
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVacation(vac.id)}
                      aria-label={`Удалить ${vac.title}`}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Manual day overrides & personal notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
          <div className="p-4 border-b border-[#222226] flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#F7F8F8]">
                Точечные правки дней ({overrideEntries.length})
              </h3>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                Нажмите на любой день в календаре, чтобы заменить один день
              </p>
            </div>
            {overrideEntries.length > 0 && (
              <button
                type="button"
                onClick={onClearAllOverrides}
                className="text-xs font-medium text-rose-400 hover:underline whitespace-nowrap cursor-pointer"
              >
                Сбросить все
              </button>
            )}
          </div>

          {overrideEntries.length === 0 ? (
            <div className="p-6 text-sm text-[#8A8F98]">
              Точечных замен пока нет.
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D21] max-h-80 overflow-y-auto">
              {overrideEntries.map(([iso, code]) => (
                <div key={iso} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => onJumpToDate(iso)}
                      className="text-sm font-medium text-[#F7F8F8] hover:text-[#00BCC5] cursor-pointer"
                    >
                      {formatRuDate(iso, true)}
                    </button>
                    <div className="text-xs text-[#8A8F98]">
                      Заменено на: {SHIFT_TYPES[code].label} ({SHIFT_TYPES[code].hours} ч)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveOverride(iso)}
                    className="text-xs font-medium text-[#8A8F98] hover:text-rose-400 cursor-pointer whitespace-nowrap"
                  >
                    Вернуть
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
          <div className="p-4 border-b border-[#222226]">
            <h3 className="text-sm font-semibold text-[#F7F8F8]">
              Личные заметки к датам ({noteEntries.length})
            </h3>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Билеты, медкомиссии, перевахтовки и напоминания
            </p>
          </div>

          {noteEntries.length === 0 ? (
            <div className="p-6 text-sm text-[#8A8F98]">
              Заметок пока нет. Откройте любой день в календаре, чтобы оставить пометку.
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D21] max-h-80 overflow-y-auto">
              {noteEntries.map(([iso, text]) => (
                <div key={iso} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(iso)}
                      className="text-xs font-mono tabular-nums font-semibold text-[#00BCC5] hover:underline cursor-pointer"
                    >
                      {formatRuDate(iso, true)}
                    </button>
                    <p className="text-sm text-[#D2D6DC] mt-0.5 break-words">{text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(iso)}
                    aria-label="Удалить заметку"
                    className="p-1.5 rounded-md text-[#8A8F98] hover:text-rose-400 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
