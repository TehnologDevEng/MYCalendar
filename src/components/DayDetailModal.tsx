import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import {
  DOW_FULL,
  DayBlockContext,
  MONTHS_GEN,
  SHIFT_ORDER,
  SHIFT_TYPES,
  ShiftCode,
  formatRuDate,
  getDayOfWeekIndex,
  parseIsoDate,
  pluralizeDays,
  pluralizeHours,
} from '../data/scheduleData';
import { SHIFT_STYLES } from '../data/shiftStyles';

interface DayDetailModalProps {
  isoDate: string;
  effectiveCode: ShiftCode;
  baseCode: ShiftCode;
  isOverridden: boolean;
  blockContext: DayBlockContext;
  note: string;
  onClose: () => void;
  onNavigateDay: (delta: number) => void;
  onSetOverride: (isoDate: string, code: ShiftCode) => void;
  onResetOverride: (isoDate: string) => void;
  onSaveNote: (isoDate: string, text: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isoDate,
  effectiveCode,
  baseCode,
  isOverridden,
  blockContext,
  note,
  onClose,
  onNavigateDay,
  onSetOverride,
  onResetOverride,
  onSaveNote,
}) => {
  const [draftNote, setDraftNote] = useState(note);

  useEffect(() => {
    setDraftNote(note);
  }, [isoDate, note]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const { year, month, day } = parseIsoDate(isoDate);
  const dowLabel = DOW_FULL[getDayOfWeekIndex(year, month, day)];
  const shiftMeta = SHIFT_TYPES[effectiveCode];
  const shiftStyle = SHIFT_STYLES[effectiveCode];

  const blockTitle =
    blockContext.category === 'work'
      ? 'Рабочая вахта'
      : blockContext.category === 'vacation'
      ? 'Ежегодный отпуск'
      : 'Межвахтовый отдых';

  const handleNoteBlur = () => {
    if (draftNote !== note) {
      onSaveNote(isoDate, draftNote);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleNoteBlur();
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-modal-title"
        className="w-full max-w-md bg-white dark:bg-[#111927] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h3
              id="day-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight"
            >
              {day} {MONTHS_GEN[month]} {year}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dowLabel} · код в табеле: <span className="font-mono font-semibold">{shiftMeta.shortCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onNavigateDay(-1);
              }}
              aria-label="Предыдущий день"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onNavigateDay(1);
              }}
              aria-label="Следующий день"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onClose();
              }}
              aria-label="Закрыть"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Current shift summary */}
          <div className={`p-4 rounded-xl border ${shiftStyle.surface}`}>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-base font-bold">{shiftMeta.label}</div>
              <div className="font-mono tabular-nums text-sm font-semibold whitespace-nowrap">
                {shiftMeta.hours} {pluralizeHours(shiftMeta.hours)}
              </div>
            </div>
            <p className="text-xs opacity-85 mt-1">{shiftMeta.desc}</p>
          </div>

          {/* Continuous cycle context */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800/90 py-3.5 text-sm space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">{blockTitle}</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                День {blockContext.dayInBlock} из {blockContext.totalDaysInBlock}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Период блока</span>
              <span className="font-mono tabular-nums">
                {formatRuDate(blockContext.startDate)} — {formatRuDate(blockContext.endDate)} (
                {blockContext.totalDaysInBlock} {pluralizeDays(blockContext.totalDaysInBlock)})
              </span>
            </div>
            {blockContext.blockHours > 0 && (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Часов за эту вахту</span>
                <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {blockContext.blockHours} ч
                </span>
              </div>
            )}
          </div>

          {/* Manual override */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Изменить статус дня вручную
              </span>
              {isOverridden && (
                <button
                  type="button"
                  onClick={() => onResetOverride(isoDate)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  По графику ({SHIFT_TYPES[baseCode].shortLabel})
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {SHIFT_ORDER.map((code) => {
                const m = SHIFT_TYPES[code];
                const isSelected = effectiveCode === code;
                const st = SHIFT_STYLES[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      if (code === baseCode) {
                        onResetOverride(isoDate);
                      } else {
                        onSetOverride(isoDate, code);
                      }
                    }}
                    className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      st.cell
                    } ${
                      isSelected
                        ? 'ring-2 ring-blue-600 dark:ring-blue-400 font-bold'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold leading-none">{m.shortCode}</div>
                    <div className="text-[10px] mt-1 truncate">{m.shortLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal note */}
          <div>
            <label
              htmlFor="day-note-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Заметка к этой дате
            </label>
            <textarea
              id="day-note-input"
              rows={2}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Билеты, поезд, перевахтовка, медосмотр..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              handleNoteBlur();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
