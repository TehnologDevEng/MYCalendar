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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
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
        className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-[#0E0E0F] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#26262C] shadow-2xl overflow-hidden"
      >
        {/* Mobile sheet drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#33333A]" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 sm:py-4 border-b border-[#222226] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h3
              id="day-modal-title"
              className="text-lg font-bold text-[#F7F8F8] leading-tight truncate"
            >
              {day} {MONTHS_GEN[month]} {year}
            </h3>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              {dowLabel} · код в табеле:{' '}
              <span className="font-mono font-semibold text-[#F7F8F8]">{shiftMeta.shortCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onNavigateDay(-1);
              }}
              aria-label="Предыдущий день"
              className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onNavigateDay(1);
              }}
              aria-label="Следующий день"
              className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleNoteBlur();
                onClose();
              }}
              aria-label="Закрыть"
              className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
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
          <div className="border-t border-b border-[#1D1D21] py-3.5 text-sm space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#8A8F98]">{blockTitle}</span>
              <span className="font-mono tabular-nums font-semibold text-[#F7F8F8]">
                День {blockContext.dayInBlock} из {blockContext.totalDaysInBlock}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#8A8F98]">
              <span>Период блока</span>
              <span className="font-mono tabular-nums text-[#C8CCD4]">
                {formatRuDate(blockContext.startDate)} — {formatRuDate(blockContext.endDate)} (
                {blockContext.totalDaysInBlock} {pluralizeDays(blockContext.totalDaysInBlock)})
              </span>
            </div>
            {blockContext.blockHours > 0 && (
              <div className="flex items-center justify-between gap-2 text-xs text-[#8A8F98]">
                <span>Часов за эту вахту</span>
                <span className="font-mono tabular-nums font-medium text-[#00BCC5]">
                  {blockContext.blockHours} ч
                </span>
              </div>
            )}
          </div>

          {/* Manual override */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[#C8CCD4]">
                Изменить статус дня вручную
              </span>
              {isOverridden && (
                <button
                  type="button"
                  onClick={() => onResetOverride(isoDate)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#00BCC5] hover:underline cursor-pointer"
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
                    className={`min-h-[50px] py-2 px-1 rounded-lg border text-center transition-all active:scale-95 cursor-pointer ${
                      st.cell
                    } ${
                      isSelected
                        ? 'ring-2 ring-[#00BCC5] border-[#00BCC5] font-bold'
                        : 'opacity-70 hover:opacity-100'
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
              className="block text-xs font-semibold text-[#C8CCD4] mb-1.5"
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
              className="w-full px-3 py-2.5 rounded-lg border border-[#2A2A30] bg-[#141416] text-base sm:text-sm text-[#F7F8F8] placeholder:text-[#5C616B] focus:outline-none focus:border-[#00BCC5] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-3.5 bg-[#121214] border-t border-[#222226] shrink-0">
          <button
            type="button"
            onClick={() => {
              handleNoteBlur();
              onClose();
            }}
            className="w-full sm:w-auto sm:ml-auto sm:flex px-5 min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-xl sm:rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] text-black text-sm font-semibold transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
