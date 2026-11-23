import React from 'react';
import { Download } from 'lucide-react';
import {
  DayOverrideMap,
  MonthStats,
  ScheduleYear,
  VacationRange,
  YEARS,
  getYearStats,
} from '../data/scheduleData';

interface SummaryTableViewProps {
  year: ScheduleYear;
  monthlyBreakdown: MonthStats[];
  vacations: VacationRange[];
  overrides: DayOverrideMap;
  onSelectYear: (y: ScheduleYear) => void;
  onDownloadMonthlyCsv: () => void;
}

export const SummaryTableView: React.FC<SummaryTableViewProps> = ({
  year,
  monthlyBreakdown,
  vacations,
  overrides,
  onSelectYear,
  onDownloadMonthlyCsv,
}) => {
  const yearTotals = monthlyBreakdown.reduce(
    (acc, m) => ({
      y: acc.y + m.counts.y,
      n: acc.n + m.counts.n,
      d: acc.d + m.counts.d,
      o: acc.o + m.counts.o,
      v: acc.v + m.counts.v,
      workDays: acc.workDays + m.workDays,
      totalHours: acc.totalHours + m.totalHours,
    }),
    { y: 0, n: 0, d: 0, o: 0, v: 0, workDays: 0, totalHours: 0 }
  );

  const multiYearStats = YEARS.map((y) => ({
    year: y,
    stats: getYearStats(y, vacations, overrides),
  }));

  const fourYearHours = multiYearStats.reduce((acc, item) => acc + item.stats.totalHours, 0);
  const fourYearWorkDays = multiYearStats.reduce((acc, item) => acc + item.stats.workDays, 0);

  return (
    <div className="space-y-6">
      {/* Monthly table for active year */}
      <section className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Помесячный баланс рабочего времени · {year}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Дневные и ночные смены по 11 часов, дни в дороге по 8 часов
            </p>
          </div>
          <button
            type="button"
            onClick={onDownloadMonthlyCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Скачать таблицу (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
                <th className="py-3 px-4">Месяц</th>
                <th className="py-3 px-4 text-right">Дневные (Я)</th>
                <th className="py-3 px-4 text-right">Ночные (Н)</th>
                <th className="py-3 px-4 text-right">Дорога (Д)</th>
                <th className="py-3 px-4 text-right">Отпуск (О)</th>
                <th className="py-3 px-4 text-right">Выходные (В)</th>
                <th className="py-3 px-4 text-right">Раб. дней</th>
                <th className="py-3 px-4 text-right">Часов</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {monthlyBreakdown.map((m) => (
                <tr
                  key={m.monthIndex}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/35 transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {m.monthName}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-800 dark:text-amber-300">
                    {m.counts.y}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-indigo-800 dark:text-indigo-300">
                    {m.counts.n}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-orange-800 dark:text-orange-300">
                    {m.counts.d}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-700 dark:text-rose-300">
                    {m.counts.o > 0 ? m.counts.o : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-800 dark:text-emerald-300">
                    {m.counts.v}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {m.workDays}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {m.totalHours}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/70 text-sm font-semibold">
                <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                  Итого за {year}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-800 dark:text-amber-300">
                  {yearTotals.y}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-indigo-800 dark:text-indigo-300">
                  {yearTotals.n}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-orange-800 dark:text-orange-300">
                  {yearTotals.d}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-700 dark:text-rose-300">
                  {yearTotals.o}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-800 dark:text-emerald-300">
                  {yearTotals.v}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {yearTotals.workDays}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700 dark:text-blue-400">
                  {yearTotals.totalHours}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 4-year comparison table */}
      <section className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Сравнение по годам · 2027–2030
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Нажмите на строку года для переключения активного календаря · Всего за 4 года:{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {fourYearHours} ч ({fourYearWorkDays} раб. дней)
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
                <th className="py-3 px-4">Год</th>
                <th className="py-3 px-4 text-right">Дней в году</th>
                <th className="py-3 px-4 text-right">Дневные</th>
                <th className="py-3 px-4 text-right">Ночные</th>
                <th className="py-3 px-4 text-right">Дорога</th>
                <th className="py-3 px-4 text-right">Отпуск</th>
                <th className="py-3 px-4 text-right">Выходные</th>
                <th className="py-3 px-4 text-right">Часов за год</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {multiYearStats.map(({ year: y, stats }) => {
                const isActive = y === year;
                return (
                  <tr
                    key={y}
                    onClick={() => onSelectYear(y)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50/60 dark:bg-blue-950/35 font-medium'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/35'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {y}
                      {y === 2028 && (
                        <span className="ml-2 text-xs font-sans font-normal text-slate-500 dark:text-slate-400">
                          високосный
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {stats.totalDays}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {stats.counts.y}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {stats.counts.n}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {stats.counts.d}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-700 dark:text-rose-300">
                      {stats.counts.o > 0 ? stats.counts.o : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {stats.counts.v}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                      {stats.totalHours} ч
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
