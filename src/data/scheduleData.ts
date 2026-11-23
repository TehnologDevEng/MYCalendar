export type ShiftCode = 'v' | 'd' | 'y' | 'n' | 'o';

export interface ShiftMeta {
  code: ShiftCode;
  shortCode: string;
  label: string;
  shortLabel: string;
  desc: string;
  hours: number;
  isWork: boolean;
}

export interface VacationRange {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  title: string;
}

export interface DayOverrideMap {
  [isoDate: string]: ShiftCode;
}

export interface DayNotesMap {
  [isoDate: string]: string;
}

export interface YearStats {
  counts: Record<ShiftCode, number>;
  totalHours: number;
  workDays: number;
  totalDays: number;
}

export interface MonthStats {
  monthIndex: number;
  monthName: string;
  counts: Record<ShiftCode, number>;
  workDays: number;
  totalHours: number;
  daysInMonth: number;
}

export type BlockCategory = 'work' | 'rest' | 'vacation';

export interface RotationBlock {
  id: string;
  index: number;
  category: BlockCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  days: number;
  dayShifts: number;
  nightShifts: number;
  roadDays: number;
  hours: number;
}

export interface DayBlockContext {
  category: BlockCategory;
  dayInBlock: number;
  totalDaysInBlock: number;
  startDate: string;
  endDate: string;
  blockHours: number;
}

export const OWNER_INFO = {
  fullName: 'Носар Андрей Иосифович',
  shortName: 'Носар Андрей',
  role: 'Ведущий инженер-технолог',
  department: 'Цех проката УЭЦН №1',
};

export const YEARS = [2027, 2028, 2029, 2030] as const;
export type ScheduleYear = (typeof YEARS)[number];

export const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

export const MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

export const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
] as const;

export const DOW_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export const DOW_FULL = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
] as const;

export const SHIFT_ORDER: ShiftCode[] = ['y', 'n', 'd', 'v', 'o'];

export const SHIFT_TYPES: Record<ShiftCode, ShiftMeta> = {
  v: {
    code: 'v',
    shortCode: 'В',
    label: 'Выходной / отдыхающая вахта',
    shortLabel: 'Выходной',
    desc: 'Нерабочий день, межвахтовый отдых',
    hours: 0,
    isWork: false,
  },
  d: {
    code: 'd',
    shortCode: 'Д',
    label: 'Дорога',
    shortLabel: 'Дорога',
    desc: 'Время в пути на вахту или с вахты',
    hours: 8,
    isWork: true,
  },
  y: {
    code: 'y',
    shortCode: 'Я',
    label: 'Дневная смена',
    shortLabel: 'Дневная',
    desc: 'Работа в дневное время',
    hours: 11,
    isWork: true,
  },
  n: {
    code: 'n',
    shortCode: 'Н',
    label: 'Ночная смена',
    shortLabel: 'Ночная',
    desc: 'Работа в ночное время',
    hours: 11,
    isWork: true,
  },
  o: {
    code: 'o',
    shortCode: 'О',
    label: 'Отпуск',
    shortLabel: 'Отпуск',
    desc: 'Ежегодный оплачиваемый отпуск',
    hours: 0,
    isWork: false,
  },
};

// Эталонный паттерн смен из исходного графика 2027 (для Носар А.И.)
export const TEMPLATE: Record<number, Record<number, ShiftCode>> = {
  0: {
    1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v', 10: 'v',
    11: 'v', 12: 'v', 13: 'v', 14: 'v', 15: 'v', 16: 'd', 17: 'y', 18: 'y', 19: 'y',
    20: 'y', 21: 'y', 22: 'y', 23: 'y', 24: 'n', 25: 'n', 26: 'n', 27: 'n', 28: 'n',
    29: 'n', 30: 'n', 31: 'n',
  },
  1: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'n', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'd', 16: 'v', 17: 'v', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
  },
  2: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'n', 16: 'n', 17: 'd', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v', 31: 'v',
  },
  3: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'n', 16: 'n', 17: 'd', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v',
  },
  4: {
    1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v', 10: 'v',
    11: 'v', 12: 'v', 13: 'v', 14: 'v', 15: 'v', 16: 'd', 17: 'y', 18: 'y', 19: 'y',
    20: 'y', 21: 'y', 22: 'y', 23: 'y', 24: 'n', 25: 'n', 26: 'n', 27: 'n', 28: 'n',
    29: 'n', 30: 'n', 31: 'n',
  },
  5: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'n', 16: 'n', 17: 'd', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v',
  },
  6: {
    1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v', 10: 'v',
    11: 'v', 12: 'v', 13: 'v', 14: 'v', 15: 'v', 16: 'd', 17: 'y', 18: 'y', 19: 'y',
    20: 'y', 21: 'y', 22: 'y', 23: 'y', 24: 'n', 25: 'n', 26: 'n', 27: 'n', 28: 'n',
    29: 'n', 30: 'n', 31: 'n',
  },
  7: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'n', 16: 'n', 17: 'd', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v', 31: 'v',
  },
  8: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'v', 16: 'v', 17: 'v', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v',
  },
  9: {
    1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v', 10: 'v',
    11: 'v', 12: 'v', 13: 'v', 14: 'v', 15: 'v', 16: 'd', 17: 'y', 18: 'y', 19: 'y',
    20: 'y', 21: 'y', 22: 'y', 23: 'y', 24: 'n', 25: 'n', 26: 'n', 27: 'n', 28: 'n',
    29: 'n', 30: 'n', 31: 'n',
  },
  10: {
    1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y', 8: 'y', 9: 'n', 10: 'n',
    11: 'n', 12: 'n', 13: 'n', 14: 'n', 15: 'n', 16: 'n', 17: 'd', 18: 'v', 19: 'v',
    20: 'v', 21: 'v', 22: 'v', 23: 'v', 24: 'v', 25: 'v', 26: 'v', 27: 'v', 28: 'v',
    29: 'v', 30: 'v',
  },
  11: {
    1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v', 10: 'v',
    11: 'v', 12: 'v', 13: 'v', 14: 'v', 15: 'v', 16: 'd', 17: 'y', 18: 'y', 19: 'y',
    20: 'y', 21: 'y', 22: 'y', 23: 'y', 24: 'n', 25: 'n', 26: 'n', 27: 'n', 28: 'n',
    29: 'n', 30: 'n', 31: 'n',
  },
};

export const DEFAULT_VACATIONS: VacationRange[] = [
  {
    id: 'vac-2027-summer',
    startDate: '2027-06-18',
    endDate: '2027-07-11',
    title: 'Летний отпуск',
  },
  {
    id: 'vac-2027-autumn',
    startDate: '2027-09-20',
    endDate: '2027-10-13',
    title: 'Осенний отпуск',
  },
];

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function formatRuDate(iso: string, includeYear = false): string {
  const { year, month, day } = parseIsoDate(iso);
  return includeYear
    ? `${day} ${MONTHS_GEN[month]} ${year}`
    : `${day} ${MONTHS_SHORT[month]}`;
}

export function formatNumericDate(iso: string): string {
  const { year, month, day } = parseIsoDate(iso);
  return `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDayOfWeekIndex(year: number, monthIndex: number, day: number): number {
  return (new Date(year, monthIndex, day).getDay() + 6) % 7; // 0 = Пн ... 6 = Вс
}

export function countDaysInclusive(startIso: string, endIso: string): number {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  const startUtc = Date.UTC(s.year, s.month, s.day);
  const endUtc = Date.UTC(e.year, e.month, e.day);
  if (endUtc < startUtc) return 0;
  return Math.round((endUtc - startUtc) / 86_400_000) + 1;
}

export function getTemplateShift(monthIndex: number, day: number): ShiftCode {
  return TEMPLATE[monthIndex]?.[day] ?? 'v';
}

export function isDateInVacations(iso: string, vacations: VacationRange[]): boolean {
  for (const vac of vacations) {
    if (iso >= vac.startDate && iso <= vac.endDate) {
      return true;
    }
  }
  return false;
}

export function getBaseShift(
  year: number,
  monthIndex: number,
  day: number,
  vacations: VacationRange[]
): ShiftCode {
  const iso = toIsoDate(year, monthIndex, day);
  if (isDateInVacations(iso, vacations)) {
    return 'o';
  }
  return getTemplateShift(monthIndex, day);
}

export function getEffectiveShift(
  year: number,
  monthIndex: number,
  day: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): ShiftCode {
  const iso = toIsoDate(year, monthIndex, day);
  if (overrides[iso]) {
    return overrides[iso];
  }
  return getBaseShift(year, monthIndex, day, vacations);
}

export function getYearSchedule(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): Record<number, Record<number, ShiftCode>> {
  const schedule: Record<number, Record<number, ShiftCode>> = {};
  for (let m = 0; m < 12; m++) {
    schedule[m] = {};
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      schedule[m][d] = getEffectiveShift(year, m, d, vacations, overrides);
    }
  }
  return schedule;
}

export function getYearStats(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): YearStats {
  const counts: Record<ShiftCode, number> = { v: 0, d: 0, y: 0, n: 0, o: 0 };
  let totalHours = 0;
  let workDays = 0;
  let totalDays = 0;

  for (let m = 0; m < 12; m++) {
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      const code = getEffectiveShift(year, m, d, vacations, overrides);
      counts[code]++;
      totalHours += SHIFT_TYPES[code].hours;
      if (SHIFT_TYPES[code].isWork) workDays++;
      totalDays++;
    }
  }

  return { counts, totalHours, workDays, totalDays };
}

export function getMonthlyBreakdown(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): MonthStats[] {
  const result: MonthStats[] = [];

  for (let m = 0; m < 12; m++) {
    const counts: Record<ShiftCode, number> = { v: 0, d: 0, y: 0, n: 0, o: 0 };
    let totalHours = 0;
    let workDays = 0;
    const daysInMonth = getDaysInMonth(year, m);

    for (let d = 1; d <= daysInMonth; d++) {
      const code = getEffectiveShift(year, m, d, vacations, overrides);
      counts[code]++;
      totalHours += SHIFT_TYPES[code].hours;
      if (SHIFT_TYPES[code].isWork) workDays++;
    }

    result.push({
      monthIndex: m,
      monthName: MONTHS[m],
      counts,
      workDays,
      totalHours,
      daysInMonth,
    });
  }

  return result;
}

function shiftToCategory(code: ShiftCode): BlockCategory {
  if (code === 'o') return 'vacation';
  if (code === 'v') return 'rest';
  return 'work';
}

export function getYearRotationBlocks(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): RotationBlock[] {
  const blocks: RotationBlock[] = [];
  let current: RotationBlock | null = null;
  let workCounter = 0;
  let restCounter = 0;
  let vacCounter = 0;

  for (let m = 0; m < 12; m++) {
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      const iso = toIsoDate(year, m, d);
      const code = getEffectiveShift(year, m, d, vacations, overrides);
      const category = shiftToCategory(code);

      if (!current || current.category !== category) {
        if (current) blocks.push(current);
        let idx = 1;
        if (category === 'work') idx = ++workCounter;
        else if (category === 'rest') idx = ++restCounter;
        else idx = ++vacCounter;

        current = {
          id: `${year}-${category}-${idx}`,
          index: idx,
          category,
          startDate: iso,
          endDate: iso,
          days: 0,
          dayShifts: 0,
          nightShifts: 0,
          roadDays: 0,
          hours: 0,
        };
      }

      current.endDate = iso;
      current.days += 1;
      if (code === 'y') current.dayShifts += 1;
      if (code === 'n') current.nightShifts += 1;
      if (code === 'd') current.roadDays += 1;
      current.hours += SHIFT_TYPES[code].hours;
    }
  }

  if (current) blocks.push(current);
  return blocks;
}

function addDaysUtc(year: number, monthIndex: number, day: number, delta: number) {
  const dt = new Date(Date.UTC(year, monthIndex, day + delta));
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth(),
    day: dt.getUTCDate(),
  };
}

export function getDayBlockContext(
  year: number,
  monthIndex: number,
  day: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap
): DayBlockContext {
  const targetCode = getEffectiveShift(year, monthIndex, day, vacations, overrides);
  const category = shiftToCategory(targetCode);

  let start = { year, month: monthIndex, day };
  let beforeCount = 0;
  for (let step = 1; step <= 60; step++) {
    const prev = addDaysUtc(year, monthIndex, day, -step);
    if (prev.year < 2027 || prev.year > 2030) break;
    const prevCode = getEffectiveShift(prev.year, prev.month, prev.day, vacations, overrides);
    if (shiftToCategory(prevCode) !== category) break;
    start = prev;
    beforeCount++;
  }

  let end = { year, month: monthIndex, day };
  let afterCount = 0;
  for (let step = 1; step <= 60; step++) {
    const next = addDaysUtc(year, monthIndex, day, step);
    if (next.year < 2027 || next.year > 2030) break;
    const nextCode = getEffectiveShift(next.year, next.month, next.day, vacations, overrides);
    if (shiftToCategory(nextCode) !== category) break;
    end = next;
    afterCount++;
  }

  const totalDaysInBlock = beforeCount + 1 + afterCount;
  let blockHours = 0;
  for (let i = 0; i < totalDaysInBlock; i++) {
    const cur = addDaysUtc(start.year, start.month, start.day, i);
    const code = getEffectiveShift(cur.year, cur.month, cur.day, vacations, overrides);
    blockHours += SHIFT_TYPES[code].hours;
  }

  return {
    category,
    dayInBlock: beforeCount + 1,
    totalDaysInBlock,
    startDate: toIsoDate(start.year, start.month, start.day),
    endDate: toIsoDate(end.year, end.month, end.day),
    blockHours,
  };
}

export function pluralizeDays(n: number): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

export function pluralizeHours(n: number): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return 'часов';
  if (mod10 === 1) return 'час';
  if (mod10 >= 2 && mod10 <= 4) return 'часа';
  return 'часов';
}
