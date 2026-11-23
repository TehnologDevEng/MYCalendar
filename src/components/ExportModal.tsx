import React, { useEffect, useState } from 'react';
import { Calendar, Download, FileSpreadsheet, Printer, X } from 'lucide-react';
import {
  DayNotesMap,
  DayOverrideMap,
  RotationRulesMap,
  SHIFT_ORDER,
  SHIFT_TYPES,
  ShiftCode,
  VacationRange,
} from '../data/scheduleData';
import {
  buildDailyCsv,
  buildIcsCalendar,
  buildMonthlyCsv,
  triggerFileDownload,
} from '../utils/exportUtils';

interface ExportModalProps {
  year: number;
  vacations: VacationRange[];
  overrides: DayOverrideMap;
  notes: DayNotesMap;
  rotationRules: RotationRulesMap;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  year,
  vacations,
  overrides,
  notes,
  rotationRules,
  onClose,
}) => {
  const [includeTypes, setIncludeTypes] = useState<Record<ShiftCode, boolean>>({
    y: true,
    n: true,
    d: true,
    o: true,
    v: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const toggleType = (code: ShiftCode) => {
    setIncludeTypes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const anySelected = Object.values(includeTypes).some(Boolean);

  const handleDownloadIcs = () => {
    if (!anySelected) return;
    const ics = buildIcsCalendar({
      year,
      includeTypes,
      vacations,
      overrides,
      notes,
      rotationRules,
    });
    triggerFileDownload(
      ics,
      `vakhta_${year}_nosar.ics`,
      'text/calendar;charset=utf-8'
    );
  };

  const handleDownloadMonthlyCsv = () => {
    const csv = buildMonthlyCsv(year, vacations, overrides, rotationRules);
    triggerFileDownload(
      csv,
      `vakhta_svodka_${year}.csv`,
      'text/csv;charset=utf-8'
    );
  };

  const handleDownloadDailyCsv = () => {
    const csv = buildDailyCsv(year, vacations, overrides, notes, rotationRules);
    triggerFileDownload(
      csv,
      `vakhta_dnevnik_${year}.csv`,
      'text/csv;charset=utf-8'
    );
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 120);
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
        aria-labelledby="export-modal-title"
        className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-[#0E0E0F] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#26262C] shadow-2xl overflow-hidden"
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#33333A]" aria-hidden="true" />
        </div>

        <div className="px-5 py-3.5 sm:py-4 border-b border-[#222226] flex items-center justify-between gap-2 shrink-0">
          <div>
            <h3
              id="export-modal-title"
              className="text-base font-bold text-[#F7F8F8]"
            >
              Экспорт графика · {year}
            </h3>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Для Google Календаря, Apple Calendar, Яндекс Календаря и Excel
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5 space-y-5 overflow-y-auto flex-1">
          {/* ICS export */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F7F8F8] mb-2">
              <Calendar className="w-4 h-4 text-[#00BCC5]" />
              Файл календаря (.ics)
            </div>
            <p className="text-xs text-[#8A8F98] mb-3">
              Выберите типы дней, которые нужно добавить событиями в календарь телефона:
            </p>
            <div className="space-y-1.5 mb-3.5">
              {SHIFT_ORDER.map((code) => {
                const meta = SHIFT_TYPES[code];
                return (
                  <label
                    key={code}
                    className="flex items-center justify-between gap-2 px-3 min-h-[44px] rounded-lg border border-[#222226] bg-[#141416] hover:border-[#33333A] cursor-pointer text-sm"
                  >
                    <span className="flex items-center gap-2.5 text-[#F7F8F8]">
                      <input
                        type="checkbox"
                        checked={includeTypes[code]}
                        onChange={() => toggleType(code)}
                        className="w-4 h-4 rounded accent-[#00BCC5]"
                      />
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-mono text-xs text-[#8A8F98]">
                      {meta.hours > 0 ? `${meta.hours} ч` : '0 ч'}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!anySelected}
              onClick={handleDownloadIcs}
              className="w-full min-h-[44px] py-2.5 px-4 inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] disabled:opacity-45 text-black text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Скачать vakhta_{year}.ics
            </button>
          </div>

          {/* CSV & Print */}
          <div className="pt-4 border-t border-[#222226] space-y-2">
            <div className="text-xs font-semibold text-[#8A8F98] mb-2">
              Таблицы и печать
            </div>
            <button
              type="button"
              onClick={handleDownloadMonthlyCsv}
              className="w-full min-h-[44px] py-2 px-3.5 inline-flex items-center justify-between rounded-lg border border-[#222226] bg-[#141416] hover:border-[#33333A] text-sm text-[#F7F8F8] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#8A8F98]" />
                Помесячная сводка часов (CSV)
              </span>
              <span className="text-xs font-mono text-[#666]">Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDailyCsv}
              className="w-full min-h-[44px] py-2 px-3.5 inline-flex items-center justify-between rounded-lg border border-[#222226] bg-[#141416] hover:border-[#33333A] text-sm text-[#F7F8F8] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#8A8F98]" />
                Посуточный табель с заметками (CSV)
              </span>
              <span className="text-xs font-mono text-[#666]">365 дн.</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full min-h-[44px] py-2 px-3.5 inline-flex items-center justify-between rounded-lg border border-[#222226] bg-[#141416] hover:border-[#33333A] text-sm text-[#F7F8F8] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#8A8F98]" />
                Распечатать календарь / PDF
              </span>
              <span className="text-xs font-mono text-[#666]">A4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
