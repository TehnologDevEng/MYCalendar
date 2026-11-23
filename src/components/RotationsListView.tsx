import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Хронология вахт и отдыха · {year}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Непрерывные периоды работы, перевахтовки и отпусков за год
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
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
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          В выбранной категории периодов за {year} год нет.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {filtered.map((block) => {
                const title =
                  block.category === 'work'
                    ? `Вахта №${block.index}`
                    : block.category === 'vacation'
                    ? `Отпуск №${block.index}`
                    : `Отдых №${block.index}`;

                const typeColor =
                  block.category === 'work'
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : block.category === 'vacation'
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-emerald-700 dark:text-emerald-300';

                return (
                  <tr
                    key={block.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/35 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                      </div>
                      <div className={`text-xs ${typeColor}`}>
                        {CATEGORY_LABELS[block.category]}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatRuDate(block.startDate)} — {formatRuDate(block.endDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {block.days} {pluralizeDays(block.days)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {block.dayShifts > 0 ? block.dayShifts : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {block.nightShifts > 0 ? block.nightShifts : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {block.roadDays > 0 ? block.roadDays : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {block.hours > 0 ? `${block.hours} ч` : '0 ч'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onJumpToDate(block.startDate)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
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
      )}
    </div>
  );
};
