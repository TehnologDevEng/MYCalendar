import React, { useState } from 'react';
import { Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import {
  DayNotesMap,
  DayOverrideMap,
  MONTHS,
  ROTATION_RULE_OPTIONS,
  RotationRuleType,
  RotationRulesMap,
  SHIFT_TYPES,
  VacationRange,
  countDaysInclusive,
  formatNumericDate,
  formatRuDate,
  pluralizeDays,
  toYearMonthKey,
} from '../data/scheduleData';

interface VacationsAndEditsViewProps {
  year: number;
  vacations: VacationRange[];
  rotationRules: RotationRulesMap;
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  onAddVacation: (vac: Omit<VacationRange, 'id'>) => void;
  onDeleteVacation: (id: string) => void;
  onResetVacations: () => void;
  onSetRotationRule: (ymKey: string, rule: RotationRuleType) => void;
  onDeleteRotationRule: (ymKey: string) => void;
  onResetRotationRules: () => void;
  onRemoveOverride: (isoDate: string) => void;
  onClearAllOverrides: () => void;
  onDeleteNote: (isoDate: string) => void;
  onJumpToDate: (isoDate: string) => void;
}

const ADJUSTABLE_YEARS = [2028, 2029, 2030] as const;

export const VacationsAndEditsView: React.FC<VacationsAndEditsViewProps> = ({
  year,
  vacations,
  rotationRules,
  overrides,
  notes,
  onAddVacation,
  onDeleteVacation,
  onResetVacations,
  onSetRotationRule,
  onDeleteRotationRule,
  onResetRotationRules,
  onRemoveOverride,
  onClearAllOverrides,
  onDeleteNote,
  onJumpToDate,
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(`${year === 2027 ? 2028 : year}-09-15`);
  const [endDate, setEndDate] = useState(`${year === 2027 ? 2028 : year}-10-08`);
  const [error, setError] = useState<string | null>(null);

  // Перевахтовка form state
  const [ruleYear, setRuleYear] = useState<number>(year >= 2028 ? year : 2028);
  const [ruleMonth, setRuleMonth] = useState<number>(8); // Сентябрь (0-indexed)
  const [ruleType, setRuleType] = useState<RotationRuleType>('short_exit');

  const sortedVacations = [...vacations].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
  const sortedRules = Object.entries(rotationRules).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const overrideEntries = Object.entries(overrides).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const noteEntries = Object.entries(notes)
    .filter(([, text]) => text.trim().length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const handleVacationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Укажите дату начала и окончания отпуска.');
      return;
    }
    if (endDate < startDate) {
      setError('Дата окончания не может быть раньше даты начала.');
      return;
    }
    if (startDate < '2027-01-01' || endDate > '2030-12-31') {
      setError('Допустимый диапазон дат: 2027–2030 годы.');
      return;
    }

    onAddVacation({
      title: title.trim() || 'Запланированный отпуск',
      startDate,
      endDate,
    });
    setTitle('');
  };

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ymKey = toYearMonthKey(ruleYear, ruleMonth);
    onSetRotationRule(ymKey, ruleType);
  };

  const formatYmLabel = (ymKey: string) => {
    const [y, m] = ymKey.split('-').map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Перевахтовки и сдвиги цикла (2028–2030) */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00BCC5]" />
              <h2 className="text-base font-semibold text-[#F7F8F8]">
                Перевахтовки и сдвиг цикла (2028–2030)
              </h2>
            </div>
            <p className="text-xs text-[#8A8F98] mt-1">
              2028–2030 рассчитываются непрерывно от декабря 2027 (без разрыва на Новый год).
              Любая перевахтовка автоматически пересчитывает все последующие месяцы.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetRotationRules}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-medium rounded-lg border border-[#2A2A30] bg-[#141416] text-[#C8CCD4] hover:text-[#F7F8F8] hover:border-[#3A3A42] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            По умолчанию (сен 2028)
          </button>
        </div>

        <form
          onSubmit={handleRuleSubmit}
          className="p-4 sm:p-5 bg-[#121214] border-b border-[#222226] space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-2">
              <label
                htmlFor="rule-year"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Год
              </label>
              <select
                id="rule-year"
                value={ruleYear}
                onChange={(e) => setRuleYear(Number(e.target.value))}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              >
                {ADJUSTABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="rule-month"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Месяц перевахтовки
              </label>
              <select
                id="rule-month"
                value={ruleMonth}
                onChange={(e) => setRuleMonth(Number(e.target.value))}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              >
                {MONTHS.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-5">
              <label
                htmlFor="rule-type"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Вариант перевахтовки
              </label>
              <select
                id="rule-type"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as RotationRuleType)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              >
                {ROTATION_RULE_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
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
                Применить
              </button>
            </div>
          </div>

          <p className="text-xs text-[#8A8F98]">
            {ROTATION_RULE_OPTIONS.find((o) => o.type === ruleType)?.description}
          </p>
        </form>

        {sortedRules.length === 0 ? (
          <div className="p-6 text-sm text-[#8A8F98]">
            Перевахтовки на 2028–2030 не заданы — идёт ровное чередование 30/30 от декабря 2027.
          </div>
        ) : (
          <div className="divide-y divide-[#1D1D21]">
            {sortedRules.map(([ymKey, activeType]) => {
              const meta = ROTATION_RULE_OPTIONS.find((o) => o.type === activeType);
              return (
                <div
                  key={ymKey}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A1A1C] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold text-[#F7F8F8]">
                        {formatYmLabel(ymKey)}
                      </span>
                      <span className="text-xs font-medium text-[#00BCC5]">
                        {meta?.label ?? activeType}
                      </span>
                    </div>
                    {meta && (
                      <p className="text-xs text-[#8A8F98] mt-0.5">{meta.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(`${ymKey}-01`)}
                      className="text-xs font-medium text-[#00BCC5] hover:underline whitespace-nowrap cursor-pointer px-2 py-1"
                    >
                      В календарь
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRotationRule(ymKey)}
                      aria-label={`Удалить перевахтовку ${ymKey}`}
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

      {/* Vacations manager */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#F7F8F8]">
              График отпусков (2027–2030)
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Отпускные даты автоматически перекрывают цикл и пересчитывают годовые часы
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
              <label
                htmlFor="vac-title"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Название периода
              </label>
              <input
                id="vac-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Отпуск сентябрь 2028"
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-base sm:text-sm text-[#F7F8F8] placeholder:text-[#5C616B] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="vac-start"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Начало
              </label>
              <input
                id="vac-start"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-[#2A2A30] bg-[#0B0B0C] text-sm font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="vac-end"
                className="block text-xs font-medium text-[#8A8F98] mb-1.5"
              >
                Окончание
              </label>
              <input
                id="vac-end"
                type="date"
                min="2027-01-01"
                max="2030-12-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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

          {error && (
            <p className="mt-2.5 text-xs font-medium text-rose-400">{error}</p>
          )}
        </form>

        {sortedVacations.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8A8F98]">
            Отпуска не заданы. Добавьте даты выше, чтобы они отобразились на календаре.
          </div>
        ) : (
          <div className="divide-y divide-[#1D1D21]">
            {sortedVacations.map((vac) => {
              const days = countDaysInclusive(vac.startDate, vac.endDate);
              return (
                <div
                  key={vac.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A1A1C] transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#F7F8F8]">
                      {vac.title}
                    </div>
                    <div className="text-xs text-[#8A8F98] mt-0.5 font-mono tabular-nums">
                      {formatNumericDate(vac.startDate)} — {formatNumericDate(vac.endDate)} ·{' '}
                      {days} {pluralizeDays(days)}
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
                Ручные правки смен ({overrideEntries.length})
              </h3>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                Нажмите на любой день в календаре, чтобы изменить тип смены
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
              Ручных замен пока нет — календарь работает строго по графику с учётом перевахтовок.
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D21] max-h-80 overflow-y-auto">
              {overrideEntries.map(([iso, code]) => (
                <div
                  key={iso}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
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
                <div
                  key={iso}
                  className="px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(iso)}
                      className="text-xs font-mono tabular-nums font-semibold text-[#00BCC5] hover:underline cursor-pointer"
                    >
                      {formatRuDate(iso, true)}
                    </button>
                    <p className="text-sm text-[#D2D6DC] mt-0.5 break-words">
                      {text}
                    </p>
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
