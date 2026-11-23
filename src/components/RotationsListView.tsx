import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import {
  BlockCategory,
  RotationBlock,
  formatRuDate,
  pluralizeDays,
} from '../data/scheduleData';

interface RotationsListViewProps {
  year: number;
  blocks: RotationBlock[];
  onJumpToDate: (isoDate: string) => void;
}

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  work: 'Рабочая вахта',
  rest: 'Межвахтовый отдых',
  vacation: 'Ежегодный отпуск',
};

export const RotationsListView: React.FC<RotationsListViewProps> = ({
  year,
  blocks,
  onJumpToDate,
}) => {
  const [filter, setFilter] = useState<'all' | BlockCategory>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return blocks;
    return blocks.filter((b) => b.category === filter);
  }, [blocks, filter]);

  const workBlocksCount = blocks.filter((b) => b.category === 'work').length;
  const restBlocksCount = blocks.filter((b) => b.category === 'rest').length;
  const vacBlocksCount = blocks.filter((b) => b.category === 'vacation').length;

  return (
    <div className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#F7F8F8]">
            Хронология вахт и отдыха · {year}
          </h2>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Непрерывные периоды работы, перевахтовки и отпусков за год
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#141416] border border-[#222226] rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all' as const, label: `Все (${blocks.length})` },
            { id: 'work' as const, label: `Вахты (${workBlocksCount})` },
            { id: 'rest' as const, label: `Отдых (${restBlocksCount})` },
            ...(vacBlocksCount > 0
              ? [{ id: 'vacation' as const, label: `Отпуск (${vacBlocksCount})` }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[34px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#00BCC5] text-black font-semibold'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-[#8A8F98]">
          В выбранной категории периодов за {year} год нет.
        </div>
      ) : (
        <>
          {/* Mobile tap list */}
          <div className="md:hidden divide-y divide-[#1D1D21]">
            {filtered.map((block) => {
              const title =
                block.category === 'work'
                  ? `Вахта №${block.index}`
                  : block.category === 'vacation'
                  ? `Отпуск №${block.index}`
                  : `Отдых №${block.index}`;

              const typeColor =
                block.category === 'work'
                  ? 'text-indigo-300'
                  : block.category === 'vacation'
                  ? 'text-rose-400'
                  : 'text-emerald-400';

              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onJumpToDate(block.startDate)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 active:bg-[#1A1A1C] transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-[#F7F8F8]">
                        {title}
                      </span>
                      <span className={`text-xs ${typeColor}`}>
                        {CATEGORY_LABELS[block.category]}
                      </span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#C8CCD4] mt-1">
                      {formatRuDate(block.startDate)} — {formatRuDate(block.endDate)} ·{' '}
                      {block.days} {pluralizeDays(block.days)}
                    </div>
                    {block.category === 'work' && (
                      <div className="text-[11px] font-mono tabular-nums text-[#8A8F98] mt-0.5">
                        Дн: {block.dayShifts} · Ноч: {block.nightShifts} · Дор: {block.roadDays}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="font-mono tabular-nums text-sm font-semibold text-[#F7F8F8]">
                      {block.hours > 0 ? `${block.hours} ч` : '0 ч'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5C616B]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop data table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222226] text-xs font-medium text-[#8A8F98] bg-[#141416]">
                  <th className="py-3 px-4">Период</th>
                  <th className="py-3 px-4">Даты</th>
                  <th className="py-3 px-4 text-right">Длительность</th>
                  <th className="py-3 px-4 text-right">Дневные</th>
                  <th className="py-3 px-4 text-right">Ночные</th>
                  <th className="py-3 px-4 text-right">Дорога</th>
                  <th className="py-3 px-4 text-right">Часы</th>
                  <th className="py-3 px-4 text-right">Календарь</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D21] text-sm">
                {filtered.map((block) => {
                  const title =
                    block.category === 'work'
                      ? `Вахта №${block.index}`
                      : block.category === 'vacation'
                      ? `Отпуск №${block.index}`
                      : `Отдых №${block.index}`;

                  const typeColor =
                    block.category === 'work'
                      ? 'text-indigo-300'
                      : block.category === 'vacation'
                      ? 'text-rose-400'
                      : 'text-emerald-400';

                  return (
                    <tr
                      key={block.id}
                      className="hover:bg-[#1A1A1C] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#F7F8F8]">{title}</div>
                        <div className={`text-xs ${typeColor}`}>
                          {CATEGORY_LABELS[block.category]}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-xs sm:text-sm text-[#D2D6DC] whitespace-nowrap">
                        {formatRuDate(block.startDate)} — {formatRuDate(block.endDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#F7F8F8] whitespace-nowrap">
                        {block.days} {pluralizeDays(block.days)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#8A8F98]">
                        {block.dayShifts > 0 ? block.dayShifts : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#8A8F98]">
                        {block.nightShifts > 0 ? block.nightShifts : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#8A8F98]">
                        {block.roadDays > 0 ? block.roadDays : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#F7F8F8] whitespace-nowrap">
                        {block.hours > 0 ? `${block.hours} ч` : '0 ч'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onJumpToDate(block.startDate)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#00BCC5] hover:text-[#33D1D8] cursor-pointer"
                        >
                          Открыть
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
