import {
  DayNotesMap,
  DayOverrideMap,
  OWNER_INFO,
  SHIFT_TYPES,
  ShiftCode,
  VacationRange,
  getDaysInMonth,
  getEffectiveShift,
  getMonthlyBreakdown,
  toIsoDate,
} from '../data/scheduleData';

function formatIcsDate(year: number, monthIndex: number, day: number): string {
  return `${year}${String(monthIndex + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

function nextIcsDate(year: number, monthIndex: number, day: number): string {
  const dt = new Date(Date.UTC(year, monthIndex, day + 1));
  return formatIcsDate(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export interface IcsExportOptions {
  year: number;
  includeTypes: Record<ShiftCode, boolean>;
  vacations: VacationRange[];
  overrides: DayOverrideMap;
  notes: DayNotesMap;
}

export function buildIcsCalendar(options: IcsExportOptions): string {
  const { year, includeTypes, vacations, overrides, notes } = options;
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vakhta Schedule//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`Вахта ${year} · ${OWNER_INFO.shortName}`)}`,
  ];

  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (let m = 0; m < 12; m++) {
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      const code = getEffectiveShift(year, m, d, vacations, overrides);
      if (!includeTypes[code]) continue;

      const meta = SHIFT_TYPES[code];
      const iso = toIsoDate(year, m, d);
      const note = notes[iso]?.trim();
      const summary =
        meta.hours > 0
          ? `${meta.shortLabel} (${meta.hours} ч)`
          : meta.shortLabel;
      const descParts = [meta.desc, `График: ${OWNER_INFO.fullName}`];
      if (note) descParts.push(`Заметка: ${note}`);

      lines.push(
        'BEGIN:VEVENT',
        `UID:vakhta-${iso}-${code}@schedule.local`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${formatIcsDate(year, m, d)}`,
        `DTEND;VALUE=DATE:${nextIcsDate(year, m, d)}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(descParts.join(' · '))}`,
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function buildMonthlyCsv(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): string {
  const breakdown = getMonthlyBreakdown(year, vacations, overrides);
  const header = [
    'Месяц',
    'Дневные (11 ч)',
    'Ночные (11 ч)',
    'Дорога (8 ч)',
    'Отпуск',
    'Выходные',
    'Рабочих дней',
    'Всего часов',
  ];

  const rows = breakdown.map((m) => [
    `${m.monthName} ${year}`,
    String(m.counts.y),
    String(m.counts.n),
    String(m.counts.d),
    String(m.counts.o),
    String(m.counts.v),
    String(m.workDays),
    String(m.totalHours),
  ]);

  const totalRow = [
    `Итого за ${year}`,
    String(breakdown.reduce((acc, m) => acc + m.counts.y, 0)),
    String(breakdown.reduce((acc, m) => acc + m.counts.n, 0)),
    String(breakdown.reduce((acc, m) => acc + m.counts.d, 0)),
    String(breakdown.reduce((acc, m) => acc + m.counts.o, 0)),
    String(breakdown.reduce((acc, m) => acc + m.counts.v, 0)),
    String(breakdown.reduce((acc, m) => acc + m.workDays, 0)),
    String(breakdown.reduce((acc, m) => acc + m.totalHours, 0)),
  ];

  return '\uFEFF' + [header, ...rows, totalRow].map((r) => r.join(';')).join('\r\n');
}

export function buildDailyCsv(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap,
  notes: DayNotesMap
): string {
  const header = ['Дата', 'Код', 'Тип дня', 'Часы', 'Заметка'];
  const rows: string[][] = [];

  for (let m = 0; m < 12; m++) {
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      const iso = toIsoDate(year, m, d);
      const code = getEffectiveShift(year, m, d, vacations, overrides);
      const meta = SHIFT_TYPES[code];
      const note = (notes[iso] ?? '').replace(/;/g, ',').replace(/\r?\n/g, ' ');
      rows.push([iso, meta.shortCode, meta.label, String(meta.hours), note]);
    }
  }

  return '\uFEFF' + [header, ...rows].map((r) => r.join(';')).join('\r\n');
}

export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
