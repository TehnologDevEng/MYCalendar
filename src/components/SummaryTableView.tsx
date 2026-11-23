import React from 'react';
import { Download } from 'lucide-react';
import {
  ComputedMonthPattern,
  DayOverrideMap,
  MonthStats,
  RotationRulesMap,
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
  rotationRules: RotationRulesMap;
  baseSchedule: Record<number, Record<number, ComputedMonthPattern>>;
  onSelectYear: (y: ScheduleYear) => void;
  onDownloadMonthlyCsv: () => void;
}

export const SummaryTableView: React.FC<SummaryTableViewProps> = ({
  year,
  monthlyBreakdown,
  vacations,
  overrides,
  rotationRules,
  baseSchedule,
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
    stats: getYearStats(y, vacations, overrides, rotationRules, baseSchedule),
  }));

  const fourYearHours = multiYearStats.reduce((acc, item) => acc + item.stats.totalHours, 0);
  const fourYearWorkDays = multiYearStats.reduce((acc, item) => acc + item.stats.workDays, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Monthly table for active year */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#F7F8F8]">
              Помесячный баланс рабочего времени · {year}
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Дневные и ночные смены по 11 часов, дни в дороге по 8 часов
            </p>
          </div>
          <button
            type="button"
            onClick={onDownloadMonthlyCsv}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[38px] text-xs font-medium rounded-lg border border-[#2A2A30] bg-[#141416] text-[#F7F8F8] hover:border-[#00BCC5]/60 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00BCC5]" />
            Скачать таблицу (CSV)
          </button>
        </div>

        {/* Mobile compact month list */}
        <div className="md:hidden divide-y divide-[#1D1D21]">
          {monthlyBreakdown.map((m) => (
            <div key={m.monthIndex} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#F7F8F8]">
                  {m.monthName}
                </div>
                <div className="text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5 flex flex-wrap gap-x-2">
                  <span className="text-amber-300">Я:{m.counts.y}</span>
                  <span className="text-indigo-300">Н:{m.counts.n}</span>
                  <span className="text-orange-400">Д:{m.counts.d}</span>
                  {m.counts.o > 0 && (
                    <span className="text-rose-400">О:{m.counts.o}</span>
                  )}
                  <span className="text-emerald-400">В:{m.counts.v}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono tabular-nums text-sm font-bold text-[#F7F8F8]">
                  {m.totalHours} ч
                </div>
                <div className="font-mono tabular-nums text-[11px] text-[#8A8F98]">
                  {m.workDays} раб. дн.
                </div>
              </div>
            </div>
          ))}
          <div className="px-4 py-3.5 bg-[#141416] flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-[#F7F8F8]">Итого за {year}</div>
              <div className="text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
                Я:{yearTotals.y} · Н:{yearTotals.n} · Д:{yearTotals.d}
                {yearTotals.o > 0 ? ` · О:${yearTotals.o}` : ''} · В:{yearTotals.v}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono tabular-nums text-base font-bold text-[#00BCC5]">
                {yearTotals.totalHours} ч
              </div>
              <div className="font-mono tabular-nums text-[11px] text-[#8A8F98]">
                {yearTotals.workDays} раб. дн.
              </div>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222226] text-xs font-medium text-[#8A8F98] bg-[#141416]">
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
            <tbody className="divide-y divide-[#1D1D21] text-sm">
              {monthlyBreakdown.map((m) => (
                <tr
                  key={m.monthIndex}
                  className="hover:bg-[#1A1A1C] transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-[#F7F8F8] whitespace-nowrap">
                    {m.monthName}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-300">
                    {m.counts.y}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-indigo-300">
                    {m.counts.n}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-orange-400">
                    {m.counts.d}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-400">
                    {m.counts.o > 0 ? m.counts.o : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-400">
                    {m.counts.v}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#C8CCD4]">
                    {m.workDays}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-[#F7F8F8]">
                    {m.totalHours}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#2E2E34] bg-[#141416] text-sm font-semibold">
                <td className="py-3 px-4 text-[#F7F8F8]">Итого за {year}</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-300">
                  {yearTotals.y}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-indigo-300">
                  {yearTotals.n}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-orange-400">
                  {yearTotals.d}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400">
                  {yearTotals.o}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                  {yearTotals.v}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-[#F7F8F8]">
                  {yearTotals.workDays}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-[#00BCC5]">
                  {yearTotals.totalHours}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 4-year comparison */}
      <section className="bg-[#0E0E0F] rounded-xl border border-[#222226] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#222226]">
          <h2 className="text-base font-semibold text-[#F7F8F8]">
            Сравнение по годам · 2027–2030
          </h2>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Нажмите на год для переключения · Всего за 4 года:{' '}
            <span className="font-mono tabular-nums font-medium text-[#F7F8F8]">
              {fourYearHours} ч ({fourYearWorkDays} раб. дней)
            </span>
          </p>
        </div>

        {/* Mobile 4-year list */}
        <div className="md:hidden divide-y divide-[#1D1D21]">
          {multiYearStats.map(({ year: y, stats }) => {
            const isActive = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onSelectYear(y)}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isActive ? 'bg-[#131D1F]' : 'active:bg-[#1A1A1C]'
                }`}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono tabular-nums text-base font-bold text-[#F7F8F8]">
                      {y}
                    </span>
                    <span className="text-xs text-[#8A8F98]">
                      {stats.totalDays} дн.{y === 2028 ? ' · високосный' : ''}
                    </span>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
                    Я:{stats.counts.y} · Н:{stats.counts.n} · Д:{stats.counts.d}
                    {stats.counts.o > 0 ? ` · О:${stats.counts.o}` : ''} · В:{stats.counts.v}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono tabular-nums text-sm font-bold text-[#00BCC5]">
                    {stats.totalHours} ч
                  </div>
                  <div className="font-mono tabular-nums text-[11px] text-[#8A8F98]">
                    {stats.workDays} смен
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop 4-year table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222226] text-xs font-medium text-[#8A8F98] bg-[#141416]">
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
            <tbody className="divide-y divide-[#1D1D21] text-sm">
              {multiYearStats.map(({ year: y, stats }) => {
                const isActive = y === year;
                return (
                  <tr
                    key={y}
                    onClick={() => onSelectYear(y)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#131D1F] font-medium'
                        : 'hover:bg-[#1A1A1C]'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#F7F8F8] whitespace-nowrap">
                      {y}
                      {y === 2028 && (
                        <span className="ml-2 text-xs font-sans font-normal text-[#8A8F98]">
                          високосный
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#8A8F98]">
                      {stats.totalDays}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#D2D6DC]">
                      {stats.counts.y}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#D2D6DC]">
                      {stats.counts.n}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#D2D6DC]">
                      {stats.counts.d}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400">
                      {stats.counts.o > 0 ? stats.counts.o : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#D2D6DC]">
                      {stats.counts.v}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#00BCC5]">
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
