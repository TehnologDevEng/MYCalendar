import React, { useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  DayNotesMap,
  DayOverrideMap,
  SHIFT_TYPES,
  VacationRange,
  countDaysInclusive,
  formatNumericDate,
  formatRuDate,
  pluralizeDays,
} from '../data/scheduleData';

interface VacationsAndEditsViewProps {
  year: number;
  vacations: VacationRange[];
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  onAddVacation: (vac: Omit<VacationRange, 'id'>) => void;
  onDeleteVacation: (id: string) => void;
  onResetVacations: () => void;
  onRemoveOverride: (isoDate: string) => void;
  onClearAllOverrides: () => void;
  onDeleteNote: (isoDate: string) => void;
  onJumpToDate: (isoDate: string) => void;
}

export const VacationsAndEditsView: React.FC<VacationsAndEditsViewProps> = ({
  year,
  vacations,
  overrides,
  notes,
  onAddVacation,
  onDeleteVacation,
  onResetVacations,
  onRemoveOverride,
  onClearAllOverrides,
  onDeleteNote,
  onJumpToDate,
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(`${year}-07-01`);
  const [endDate, setEndDate] = useState(`${year}-07-14`);
  const [error, setError] = useState<string | null>(null);

  const sortedVacations = [...vacations].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
  const overrideEntries = Object.entries(overrides).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const noteEntries = Object.entries(notes)
    .filter(([, text]) => text.trim().length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-6">
      {/* Vacations manager */}
      <section className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              График отпусков (2027–2030)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Отпускные даты автоматически перекрывают эталонный цикл и пересчитывают годовые часы
            </p>
          </div>
          <button
            type="button"
            onClick={onResetVacations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Вернуть отпуска 2027 по умолчанию
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-4">
              <label
                htmlFor="vac-title"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
              >
                Название периода
              </label>
              <input
                id="vac-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Отпуск летом 2028"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="vac-start"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
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
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="vac-end"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
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
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </form>

        {sortedVacations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Отпуска не заданы. Добавьте даты выше, чтобы они отобразились на календаре.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedVacations.map((vac) => {
              const days = countDaysInclusive(vac.startDate, vac.endDate);
              return (
                <div
                  key={vac.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {vac.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                      {formatNumericDate(vac.startDate)} — {formatNumericDate(vac.endDate)} ·{' '}
                      {days} {pluralizeDays(days)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(vac.startDate)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Показать в календаре
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVacation(vac.id)}
                      aria-label={`Удалить ${vac.title}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Ручные правки смен ({overrideEntries.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Нажмите на любой день в календаре, чтобы изменить тип смены
              </p>
            </div>
            {overrideEntries.length > 0 && (
              <button
                type="button"
                onClick={onClearAllOverrides}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap cursor-pointer"
              >
                Сбросить все
              </button>
            )}
          </div>

          {overrideEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Ручных замен пока нет — календарь работает строго по эталонному графику.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
              {overrideEntries.map(([iso, code]) => (
                <div
                  key={iso}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onJumpToDate(iso)}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      {formatRuDate(iso, true)}
                    </button>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Заменено на: {SHIFT_TYPES[code].label} ({SHIFT_TYPES[code].hours} ч)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveOverride(iso)}
                    className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer whitespace-nowrap"
                  >
                    Вернуть
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Личные заметки к датам ({noteEntries.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Билеты, медкомиссии, перевахтовки и напоминания
            </p>
          </div>

          {noteEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Заметок пока нет. Откройте любой день в календаре, чтобы оставить пометку.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
              {noteEntries.map(([iso, text]) => (
                <div
                  key={iso}
                  className="px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDate(iso)}
                      className="text-xs font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {formatRuDate(iso, true)}
                    </button>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 break-words">
                      {text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(iso)}
                    aria-label="Удалить заметку"
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer shrink-0"
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
