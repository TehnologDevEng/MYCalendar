export type ShiftCode = 'v' | 'd' | 'y' | 'n' | 'o';

export type MonthHalfPhase = 'enter' | 'exit';

export type RoadPlacement = 'none' | 'start' | 'end' | 'both';

export interface PerevakhtovkaRange {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  road: RoadPlacement;
  invertNextPhase: boolean;
  title: string;
}

export interface MonthWorkConfig {
  workStart: number; // 1..31 (0 = весь месяц отдых)
  workEnd: number;   // 1..31
  road: RoadPlacement;
  dayShiftsCount?: number; // optional exact count of day shifts ('y'); undefined = auto half
  cascadeAfter: boolean;   // if true, subsequent months rebuild from this month's ending phase
}

export interface MonthConfigsMap {
  // Key format: "YYYY-MM" (1-indexed month, e.g. "2028-02")
  [yearMonth: string]: MonthWorkConfig;
}

export const ROAD_PLACEMENT_OPTIONS: { value: RoadPlacement; label: string; shortLabel: string }[] = [
  { value: 'none', label: 'Без дня дороги (только Я и Н)', shortLabel: 'Без дороги' },
  { value: 'end', label: 'Дорога в последний день (выезд)', shortLabel: 'Дорога в конце' },
  { value: 'start', label: 'Дорога в первый день (заезд)', shortLabel: 'Дорога в начале' },
  { value: 'both', label: 'Дорога в первый и последний день', shortLabel: 'Начало и конец' },
];

export const DEFAULT_PEREVAKHTOVKI: PerevakhtovkaRange[] = [
  {
    id: 'pv-2028-sep',
    startDate: '2028-09-01',
    endDate: '2028-09-14',
    road: 'none',
    invertNextPhase: false,
    title: 'Перевахтовка сентябрь 2028',
  },
];

export const DEFAULT_MONTH_CONFIGS: MonthConfigsMap = {};

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

// Эталонный график 2027 года (для Носар А.И.)
export const TEMPLATE_2027: Record<number, Record<number, ShiftCode>> = {
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
    title: 'Летний отпуск 2027',
  },
  {
    id: 'vac-2027-autumn',
    startDate: '2027-09-20',
    endDate: '2027-10-13',
    title: 'Осенний отпуск 2027',
  },
];

export function toYearMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

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

function addDaysIso(iso: string, delta: number): string {
  const { year, month, day } = parseIsoDate(iso);
  const dt = new Date(Date.UTC(year, month, day + delta));
  return toIsoDate(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
}

/**
 * Generates shift codes for a contiguous work sequence of length `totalDays`.
 */
export function buildWorkSequence(
  totalDays: number,
  road: RoadPlacement,
  customDayShiftsCount?: number
): ShiftCode[] {
  if (totalDays <= 0) return [];
  const seq: ShiftCode[] = new Array(totalDays).fill('y');

  const hasStartRoad = (road === 'start' || road === 'both') && totalDays >= 1;
  const hasEndRoad = (road === 'end' || road === 'both') && totalDays >= (hasStartRoad ? 2 : 1);

  let innerStart = 0;
  let innerEnd = totalDays - 1;

  if (hasStartRoad) {
    seq[0] = 'd';
    innerStart = 1;
  }
  if (hasEndRoad) {
    seq[totalDays - 1] = 'd';
    innerEnd = totalDays - 2;
  }

  const innerCount = Math.max(0, innerEnd - innerStart + 1);
  const dayCount =
    customDayShiftsCount !== undefined
      ? Math.max(0, Math.min(innerCount, customDayShiftsCount))
      : Math.ceil(innerCount / 2);

  for (let i = 0; i < innerCount; i++) {
    seq[innerStart + i] = i < dayCount ? 'y' : 'n';
  }

  return seq;
}

/**
 * Builds days for a single month from a MonthWorkConfig.
 */
export function buildMonthDaysFromConfig(
  year: number,
  monthIndex: number,
  config: MonthWorkConfig
): Record<number, ShiftCode> {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const res: Record<number, ShiftCode> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    res[d] = 'v';
  }

  if (config.workStart <= 0 || config.workEnd < config.workStart) {
    return res;
  }

  const start = Math.max(1, Math.min(daysInMonth, config.workStart));
  const end = Math.max(start, Math.min(daysInMonth, config.workEnd));
  const seq = buildWorkSequence(end - start + 1, config.road, config.dayShiftsCount);

  for (let i = 0; i < seq.length; i++) {
    res[start + i] = seq[i];
  }

  return res;
}

/**
 * Builds standard days for a single month in the automatic 30/30 rotational cycle.
 * Accounts for shorter February automatically (28/29 days).
 */
function buildStandardMonthDays(
  year: number,
  monthIndex: number,
  phase: MonthHalfPhase
): Record<number, ShiftCode> {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const isFeb = monthIndex === 1;

  if (phase === 'enter') {
    const start = isFeb ? 15 : 16;
    const totalWork = daysInMonth - start + 1;
    const inner = totalWork - 1; // minus start road
    const dayShifts = isFeb ? Math.floor(inner / 2) : 7;
    return buildMonthDaysFromConfig(year, monthIndex, {
      workStart: start,
      workEnd: daysInMonth,
      road: 'start',
      dayShiftsCount: dayShifts,
      cascadeAfter: false,
    });
  }

  // phase === 'exit'
  if (isFeb) {
    return buildMonthDaysFromConfig(year, monthIndex, {
      workStart: 1,
      workEnd: 15,
      road: 'end',
      dayShiftsCount: 7,
      cascadeAfter: false,
    });
  }

  return buildMonthDaysFromConfig(year, monthIndex, {
    workStart: 1,
    workEnd: 17,
    road: 'end',
    dayShiftsCount: 8,
    cascadeAfter: false,
  });
}

export interface ComputedMonthPattern {
  source: 'template_2027' | 'auto' | 'perevakhtovka' | 'custom';
  hasPerevakhtovka: boolean;
  isCustomMonth: boolean;
  badgeText: string | null;
  workRangeLabel: string;
  inferredConfig: MonthWorkConfig;
  days: Record<number, ShiftCode>;
}

function inferMonthConfig(
  year: number,
  monthIndex: number,
  days: Record<number, ShiftCode>
): { config: MonthWorkConfig; rangeLabel: string } {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  let firstWork = 0;
  let lastWork = 0;
  let dayShifts = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const c = days[d];
    if (c === 'y' || c === 'n' || c === 'd') {
      if (firstWork === 0) firstWork = d;
      lastWork = d;
      if (c === 'y') dayShifts++;
    }
  }

  if (firstWork === 0) {
    return {
      config: { workStart: 0, workEnd: 0, road: 'none', cascadeAfter: false },
      rangeLabel: 'Весь месяц отдых',
    };
  }

  const startIsRoad = days[firstWork] === 'd';
  const endIsRoad = lastWork > firstWork && days[lastWork] === 'd';
  const road: RoadPlacement =
    startIsRoad && endIsRoad
      ? 'both'
      : startIsRoad
      ? 'start'
      : endIsRoad
      ? 'end'
      : 'none';

  return {
    config: {
      workStart: firstWork,
      workEnd: lastWork,
      road,
      dayShiftsCount: dayShifts,
      cascadeAfter: false,
    },
    rangeLabel: `${firstWork}–${lastWork}`,
  };
}

/**
 * Computes the complete continuous 2027–2030 base schedule:
 * - 2027 follows TEMPLATE_2027 (unless overridden by a custom month config or перевахтовка)
 * - 2028–2030 continue seamlessly from Dec 2027 with automatic February handling
 * - Date-range перевахтовки paint exact shift spans (even across month boundaries!)
 *   and automatically rebuild every following month's phase!
 * - Per-month work day configs let the user fine-tune any month (e.g. February) directly.
 */
export function buildMultiYearBaseSchedule(
  perevakhtovki: PerevakhtovkaRange[] = DEFAULT_PEREVAKHTOVKI,
  monthConfigs: MonthConfigsMap = DEFAULT_MONTH_CONFIGS
): Record<number, Record<number, ComputedMonthPattern>> {
  const allYears: Record<number, Record<number, ComputedMonthPattern>> = {
    2027: {},
    2028: {},
    2029: {},
    2030: {},
  };

  // Pre-build a date lookup for all перевахтовки
  const pvDayMap: Record<string, { code: ShiftCode; pv: PerevakhtovkaRange }> = {};
  const pvAffectedMonths = new Set<string>();
  const pvEndingInMonth: Record<string, PerevakhtovkaRange> = {};

  const sortedPvs = [...perevakhtovki].sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (const pv of sortedPvs) {
    const totalDays = countDaysInclusive(pv.startDate, pv.endDate);
    if (totalDays <= 0) continue;
    const seq = buildWorkSequence(totalDays, pv.road);
    for (let i = 0; i < totalDays; i++) {
      const iso = addDaysIso(pv.startDate, i);
      const { year, month } = parseIsoDate(iso);
      if (year < 2027 || year > 2030) continue;
      pvDayMap[iso] = { code: seq[i], pv };
      pvAffectedMonths.add(toYearMonthKey(year, month));
    }
    const endParsed = parseIsoDate(pv.endDate);
    if (endParsed.year >= 2027 && endParsed.year <= 2030) {
      pvEndingInMonth[toYearMonthKey(endParsed.year, endParsed.month)] = pv;
    }
  }

  let nextExpectedPhase: MonthHalfPhase = 'exit';

  for (const year of YEARS) {
    for (let m = 0; m < 12; m++) {
      const ymKey = toYearMonthKey(year, m);
      const daysInMonth = getDaysInMonth(year, m);
      const customConfig = monthConfigs[ymKey];
      const hasPvInMonth = pvAffectedMonths.has(ymKey);

      let days: Record<number, ShiftCode> = {};
      let source: ComputedMonthPattern['source'] = 'auto';
      let hasPerevakhtovka = false;
      let isCustomMonth = false;
      let badgeText: string | null = null;

      if (hasPvInMonth) {
        // Fill month with rest, then paint exact перевахтовка days
        for (let d = 1; d <= daysInMonth; d++) {
          const iso = toIsoDate(year, m, d);
          days[d] = pvDayMap[iso]?.code ?? 'v';
        }
        source = 'perevakhtovka';
        hasPerevakhtovka = true;

        // Determine range label for badge
        const { rangeLabel } = inferMonthConfig(year, m, days);
        badgeText = `Перевахтовка ${rangeLabel}`;

        // Rebuild next month phase if a перевахтовка ends in this month
        const endingPv = pvEndingInMonth[ymKey];
        if (endingPv) {
          const endDay = parseIsoDate(endingPv.endDate).day;
          const naturalNext: MonthHalfPhase = endDay <= 18 ? 'enter' : 'exit';
          nextExpectedPhase = endingPv.invertNextPhase
            ? naturalNext === 'enter'
              ? 'exit'
              : 'enter'
            : naturalNext;
        } else {
          // Перевахтовка continues into next month
          nextExpectedPhase = 'exit';
        }
      } else if (customConfig) {
        days = buildMonthDaysFromConfig(year, m, customConfig);
        source = 'custom';
        isCustomMonth = true;
        badgeText =
          customConfig.workStart > 0
            ? `Свои дни ${customConfig.workStart}–${customConfig.workEnd}`
            : 'Весь месяц отдых';

        if (customConfig.cascadeAfter) {
          if (customConfig.workStart <= 0) {
            nextExpectedPhase = 'enter';
          } else {
            nextExpectedPhase =
              customConfig.workEnd >= daysInMonth - 3 ? 'exit' : 'enter';
          }
        } else if (year >= 2028) {
          nextExpectedPhase = nextExpectedPhase === 'enter' ? 'exit' : 'enter';
        }
      } else if (year === 2027) {
        for (let d = 1; d <= daysInMonth; d++) {
          days[d] = TEMPLATE_2027[m]?.[d] ?? 'v';
        }
        source = 'template_2027';
        if (m === 8) {
          hasPerevakhtovka = true;
          badgeText = 'Перевахтовка 1–14';
        }
        if (m === 11) {
          const lastDayCode = days[daysInMonth];
          nextExpectedPhase =
            lastDayCode === 'y' || lastDayCode === 'n' || lastDayCode === 'd'
              ? 'exit'
              : 'enter';
        }
      } else {
        days = buildStandardMonthDays(year, m, nextExpectedPhase);
        source = 'auto';
        nextExpectedPhase = nextExpectedPhase === 'enter' ? 'exit' : 'enter';
      }

      // If user edited Dec 2027 manually, reflect its ending phase into Jan 2028
      if (year === 2027 && m === 11 && (customConfig || hasPvInMonth)) {
        const lastDayCode = days[daysInMonth];
        nextExpectedPhase =
          lastDayCode === 'y' || lastDayCode === 'n' || lastDayCode === 'd'
            ? 'exit'
            : 'enter';
      }

      const { config: inferredConfig, rangeLabel } = inferMonthConfig(year, m, days);

      allYears[year][m] = {
        source,
        hasPerevakhtovka,
        isCustomMonth,
        badgeText,
        workRangeLabel: rangeLabel,
        inferredConfig: customConfig ?? inferredConfig,
        days,
      };
    }
  }

  return allYears;
}

export function isDateInVacations(iso: string, vacations: VacationRange[]): boolean {
  for (const vac of vacations) {
    if (iso >= vac.startDate && iso <= vac.endDate) {
      return true;
    }
  }
  return false;
}

/**
 * Checks how many days of a vacation fall on working shifts vs resting вахта ('v').
 */
export function getVacationWorkOverlapDays(
  vac: VacationRange,
  baseSchedule: Record<number, Record<number, ComputedMonthPattern>>
): { totalDays: number; workOverlapDays: number; restDays: number } {
  const totalDays = countDaysInclusive(vac.startDate, vac.endDate);
  let workOverlapDays = 0;

  for (let i = 0; i < totalDays; i++) {
    const iso = addDaysIso(vac.startDate, i);
    const { year, month, day } = parseIsoDate(iso);
    const code = baseSchedule[year]?.[month]?.days[day] ?? 'v';
    if (SHIFT_TYPES[code].isWork) {
      workOverlapDays++;
    }
  }

  return {
    totalDays,
    workOverlapDays,
    restDays: totalDays - workOverlapDays,
  };
}

export function getBaseShift(
  year: number,
  monthIndex: number,
  day: number,
  vacations: VacationRange[],
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): ShiftCode {
  const iso = toIsoDate(year, monthIndex, day);
  if (isDateInVacations(iso, vacations)) {
    return 'o';
  }
  return precomputedBase[year]?.[monthIndex]?.days[day] ?? 'v';
}

export function getEffectiveShift(
  year: number,
  monthIndex: number,
  day: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): ShiftCode {
  const iso = toIsoDate(year, monthIndex, day);
  if (overrides[iso]) {
    return overrides[iso];
  }
  return getBaseShift(year, monthIndex, day, vacations, precomputedBase);
}

export function getYearSchedule(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): Record<number, Record<number, ShiftCode>> {
  const schedule: Record<number, Record<number, ShiftCode>> = {};
  for (let m = 0; m < 12; m++) {
    schedule[m] = {};
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      schedule[m][d] = getEffectiveShift(year, m, d, vacations, overrides, precomputedBase);
    }
  }
  return schedule;
}

export function getYearStats(
  year: number,
  vacations: VacationRange[],
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): YearStats {
  const counts: Record<ShiftCode, number> = { v: 0, d: 0, y: 0, n: 0, o: 0 };
  let totalHours = 0;
  let workDays = 0;
  let totalDays = 0;

  for (let m = 0; m < 12; m++) {
    const daysCount = getDaysInMonth(year, m);
    for (let d = 1; d <= daysCount; d++) {
      const code = getEffectiveShift(year, m, d, vacations, overrides, precomputedBase);
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
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): MonthStats[] {
  const result: MonthStats[] = [];

  for (let m = 0; m < 12; m++) {
    const counts: Record<ShiftCode, number> = { v: 0, d: 0, y: 0, n: 0, o: 0 };
    let totalHours = 0;
    let workDays = 0;
    const daysInMonth = getDaysInMonth(year, m);

    for (let d = 1; d <= daysInMonth; d++) {
      const code = getEffectiveShift(year, m, d, vacations, overrides, precomputedBase);
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
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
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
      const code = getEffectiveShift(year, m, d, vacations, overrides, precomputedBase);
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
  overrides: DayOverrideMap,
  precomputedBase: Record<number, Record<number, ComputedMonthPattern>>
): DayBlockContext {
  const targetCode = getEffectiveShift(year, monthIndex, day, vacations, overrides, precomputedBase);
  const category = shiftToCategory(targetCode);

  let start = { year, month: monthIndex, day };
  let beforeCount = 0;
  for (let step = 1; step <= 60; step++) {
    const prev = addDaysUtc(year, monthIndex, day, -step);
    if (prev.year < 2027 || prev.year > 2030) break;
    const prevCode = getEffectiveShift(prev.year, prev.month, prev.day, vacations, overrides, precomputedBase);
    if (shiftToCategory(prevCode) !== category) break;
    start = prev;
    beforeCount++;
  }

  let end = { year, month: monthIndex, day };
  let afterCount = 0;
  for (let step = 1; step <= 60; step++) {
    const next = addDaysUtc(year, monthIndex, day, step);
    if (next.year < 2027 || next.year > 2030) break;
    const nextCode = getEffectiveShift(next.year, next.month, next.day, vacations, overrides, precomputedBase);
    if (shiftToCategory(nextCode) !== category) break;
    end = next;
    afterCount++;
  }

  const totalDaysInBlock = beforeCount + 1 + afterCount;
  let blockHours = 0;
  for (let i = 0; i < totalDaysInBlock; i++) {
    const cur = addDaysUtc(start.year, start.month, start.day, i);
    const code = getEffectiveShift(cur.year, cur.month, cur.day, vacations, overrides, precomputedBase);
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
