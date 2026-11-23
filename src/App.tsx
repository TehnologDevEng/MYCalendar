import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  Download,
  ListChecks,
  Moon,
  Search,
  SlidersHorizontal,
  Sun,
  Table2,
  X,
} from 'lucide-react';
import {
  DEFAULT_VACATIONS,
  DayNotesMap,
  DayOverrideMap,
  MONTHS_SHORT,
  OWNER_INFO,
  SHIFT_ORDER,
  SHIFT_TYPES,
  ScheduleYear,
  ShiftCode,
  VacationRange,
  YEARS,
  countDaysInclusive,
  formatNumericDate,
  getBaseShift,
  getDayBlockContext,
  getEffectiveShift,
  getMonthlyBreakdown,
  getYearRotationBlocks,
  getYearSchedule,
  getYearStats,
  parseIsoDate,
  pluralizeDays,
  toIsoDate,
} from './data/scheduleData';
import { SHIFT_STYLES } from './data/shiftStyles';
import { YearCalendarView } from './components/YearCalendarView';
import { RotationsListView } from './components/RotationsListView';
import { VacationsAndEditsView } from './components/VacationsAndEditsView';
import { SummaryTableView } from './components/SummaryTableView';
import { DayDetailModal } from './components/DayDetailModal';
import { ExportModal } from './components/ExportModal';
import { buildMonthlyCsv, triggerFileDownload } from './utils/exportUtils';

type ActiveTab = 'calendar' | 'rotations' | 'vacations' | 'summary';

const STORAGE_KEYS = {
  vacations: 'vakhta_nosar_vacations_v1',
  overrides: 'vakhta_nosar_overrides_v1',
  notes: 'vakhta_nosar_notes_v1',
  theme: 'vakhta_nosar_theme_v1',
  showCodes: 'vakhta_nosar_show_codes_v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or private-mode security errors
  }
}

export default function App() {
  const [year, setYear] = useState<ScheduleYear>(2027);
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [activeFilter, setActiveFilter] = useState<ShiftCode | 'all'>('all');
  const [showCellCodes, setShowCellCodes] = useState<boolean>(() =>
    loadJson<boolean>(STORAGE_KEYS.showCodes, false)
  );
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    loadJson<boolean>(STORAGE_KEYS.theme, false)
  );
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const [vacations, setVacations] = useState<VacationRange[]>(() =>
    loadJson<VacationRange[]>(STORAGE_KEYS.vacations, DEFAULT_VACATIONS)
  );
  const [overrides, setOverrides] = useState<DayOverrideMap>(() =>
    loadJson<DayOverrideMap>(STORAGE_KEYS.overrides, {})
  );
  const [notes, setNotes] = useState<DayNotesMap>(() =>
    loadJson<DayNotesMap>(STORAGE_KEYS.notes, {})
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [lookupDate, setLookupDate] = useState<string>('2027-01-16');
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveJson(STORAGE_KEYS.theme, darkMode);
  }, [darkMode]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.vacations, vacations);
  }, [vacations]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.overrides, overrides);
  }, [overrides]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.notes, notes);
  }, [notes]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.showCodes, showCellCodes);
  }, [showCellCodes]);

  const scheduleByMonth = useMemo(
    () => getYearSchedule(year, vacations, overrides),
    [year, vacations, overrides]
  );

  const stats = useMemo(
    () => getYearStats(year, vacations, overrides),
    [year, vacations, overrides]
  );

  const monthlyBreakdown = useMemo(
    () => getMonthlyBreakdown(year, vacations, overrides),
    [year, vacations, overrides]
  );

  const rotationBlocks = useMemo(
    () => getYearRotationBlocks(year, vacations, overrides),
    [year, vacations, overrides]
  );

  const yearVacations = useMemo(() => {
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    return vacations
      .filter((v) => v.endDate >= startOfYear && v.startDate <= endOfYear)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [year, vacations]);

  // Quick date checker result
  const lookupResult = useMemo(() => {
    if (!lookupDate || lookupDate < '2027-01-01' || lookupDate > '2030-12-31') {
      return null;
    }
    const { year: ly, month: lm, day: ld } = parseIsoDate(lookupDate);
    const code = getEffectiveShift(ly, lm, ld, vacations, overrides);
    const block = getDayBlockContext(ly, lm, ld, vacations, overrides);
    return { code, meta: SHIFT_TYPES[code], block, year: ly, month: lm, day: ld };
  }, [lookupDate, vacations, overrides]);

  // Selected day modal details
  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;
    const { year: sy, month: sm, day: sd } = parseIsoDate(selectedDate);
    const effectiveCode = getEffectiveShift(sy, sm, sd, vacations, overrides);
    const baseCode = getBaseShift(sy, sm, sd, vacations);
    const blockContext = getDayBlockContext(sy, sm, sd, vacations, overrides);
    return {
      isoDate: selectedDate,
      effectiveCode,
      baseCode,
      isOverridden: Boolean(overrides[selectedDate]),
      blockContext,
      note: notes[selectedDate] ?? '',
    };
  }, [selectedDate, vacations, overrides, notes]);

  const handleJumpToDate = (isoDate: string) => {
    const { year: targetYear, month: targetMonth } = parseIsoDate(isoDate);
    if (YEARS.includes(targetYear as ScheduleYear)) {
      setYear(targetYear as ScheduleYear);
    }
    setActiveTab('calendar');
    setActiveFilter('all');
    setHighlightedMonth(targetMonth);
    setSelectedDate(isoDate);
    setMobileToolsOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`month-card-${targetMonth}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);

    setTimeout(() => {
      setHighlightedMonth((prev) => (prev === targetMonth ? null : prev));
    }, 2200);
  };

  const handleNavigateModalDay = (delta: number) => {
    if (!selectedDate) return;
    const { year: sy, month: sm, day: sd } = parseIsoDate(selectedDate);
    const next = new Date(Date.UTC(sy, sm, sd + delta));
    const ny = next.getUTCFullYear();
    if (ny < 2027 || ny > 2030) return;
    const nextIso = toIsoDate(ny, next.getUTCMonth(), next.getUTCDate());
    if (ny !== year && YEARS.includes(ny as ScheduleYear)) {
      setYear(ny as ScheduleYear);
    }
    setSelectedDate(nextIso);
  };

  const handleSetOverride = (iso: string, code: ShiftCode) => {
    setOverrides((prev) => ({ ...prev, [iso]: code }));
  };

  const handleResetOverride = (iso: string) => {
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[iso];
      return copy;
    });
  };

  const handleSaveNote = (iso: string, text: string) => {
    setNotes((prev) => {
      const trimmed = text.trim();
      const copy = { ...prev };
      if (!trimmed) {
        delete copy[iso];
      } else {
        copy[iso] = trimmed;
      }
      return copy;
    });
  };

  const handleAddVacation = (vac: Omit<VacationRange, 'id'>) => {
    const id = `vac-${Date.now()}`;
    setVacations((prev) => [...prev, { ...vac, id }]);
  };

  const handleDeleteVacation = (id: string) => {
    setVacations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleDownloadMonthlyCsv = () => {
    const csv = buildMonthlyCsv(year, vacations, overrides);
    triggerFileDownload(csv, `vakhta_svodka_${year}.csv`, 'text/csv;charset=utf-8');
  };

  const overridesCount = Object.keys(overrides).length;
  const notesCount = Object.values(notes).filter((v) => v.trim().length > 0).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: typeof CalendarDays;
    count?: number;
  }[] = [
    { id: 'calendar', label: 'Годовой календарь', shortLabel: 'Календарь', icon: CalendarDays },
    { id: 'rotations', label: 'Список вахт', shortLabel: 'Вахты', icon: ListChecks },
    {
      id: 'vacations',
      label: 'Отпуска и правки',
      shortLabel: 'Отпуска',
      icon: CalendarRange,
      count: vacations.length + overridesCount,
    },
    { id: 'summary', label: 'Сводка 2027–2030', shortLabel: 'Сводка', icon: Table2 },
  ];

  const activeTabLabel = navItems.find((i) => i.id === activeTab)?.label ?? 'Календарь';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Identity */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Календарь вахты
        </div>
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1.5">
          {OWNER_INFO.fullName}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
          {OWNER_INFO.role} · {OWNER_INFO.department}
        </div>
      </div>

      {/* Navigation (desktop sidebar) */}
      <nav className="hidden lg:block p-3 space-y-1 border-b border-slate-200 dark:border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.count !== undefined && item.count > 0 && (
                <span className="font-mono tabular-nums text-xs text-slate-400 dark:text-slate-500">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Date Lookup */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          Проверить дату
        </div>
        <input
          type="date"
          min="2027-01-01"
          max="2030-12-31"
          value={lookupDate}
          onChange={(e) => setLookupDate(e.target.value)}
          aria-label="Выбрать дату для проверки смены"
          className="w-full h-10 lg:h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm lg:text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {lookupResult && (
          <div className="pt-1 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={`text-xs font-semibold ${SHIFT_STYLES[lookupResult.code].text}`}
              >
                {lookupResult.meta.shortLabel}
              </span>
              <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                {lookupResult.meta.hours} ч
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              День {lookupResult.block.dayInBlock} из {lookupResult.block.totalDaysInBlock} (
              {MONTHS_SHORT[parseIsoDate(lookupResult.block.startDate).month]}{' '}
              {parseIsoDate(lookupResult.block.startDate).day} –{' '}
              {MONTHS_SHORT[parseIsoDate(lookupResult.block.endDate).month]}{' '}
              {parseIsoDate(lookupResult.block.endDate).day})
            </div>
            <button
              type="button"
              onClick={() => handleJumpToDate(lookupDate)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Перейти к дате
            </button>
          </div>
        )}
      </div>

      {/* Interactive Shift Legend / Filter */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Обозначения смен
          </span>
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="space-y-1">
          {SHIFT_ORDER.map((code) => {
            const meta = SHIFT_TYPES[code];
            const style = SHIFT_STYLES[code];
            const count = stats.counts[code];
            const isActive = activeFilter === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setActiveFilter((prev) => (prev === code ? 'all' : code));
                  if (activeTab !== 'calendar') setActiveTab('calendar');
                  setMobileToolsOpen(false);
                }}
                className={`w-full min-h-[40px] lg:min-h-0 flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${style.swatch}`}
                  >
                    {meta.shortCode}
                  </span>
                  <span className="truncate">{meta.shortLabel}</span>
                </span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  {count} дн.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom utilities */}
      <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:pb-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          className="min-h-[40px] lg:min-h-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Светлая тема' : 'Тёмная тема'}
        </button>

        {notesCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('vacations');
              setMobileToolsOpen(false);
            }}
            className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 cursor-pointer"
          >
            Заметок: {notesCount}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f6f7f9] dark:bg-[#0b111d] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-[#111927] border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Tools Drawer (Date Check, Shift Legend, Theme) */}
      {mobileToolsOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-950/50 backdrop-blur-[2px] flex"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileToolsOpen(false);
          }}
        >
          <aside className="w-72 max-w-[85vw] bg-white dark:bg-[#111927] h-full border-r border-slate-200 dark:border-slate-800 relative">
            <button
              type="button"
              onClick={() => setMobileToolsOpen(false)}
              aria-label="Закрыть панель"
              className="absolute top-3.5 right-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact Top Header Bar (48px on mobile, 56px on desktop) */}
        <header className="sticky top-0 z-20 h-12 lg:h-14 bg-white/95 dark:bg-[#111927]/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileToolsOpen(true)}
              aria-label="Проверка даты, фильтры и тема"
              className="lg:hidden min-h-[40px] min-w-[40px] -ml-1 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-sm truncate">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeTabLabel}
              </span>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                /
              </span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {year}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
              className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 min-h-[36px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="sm:hidden">Экспорт</span>
              <span className="hidden sm:inline">Экспорт .ics / CSV</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-3 sm:px-6 pt-4 sm:pt-6 pb-24 lg:pb-8 max-w-[1280px] w-full mx-auto space-y-4 sm:space-y-6">
          {/* Year switcher & Workspace Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                График вахты на {year} год
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                {yearVacations.length > 0 ? (
                  <>
                    Отпуска:{' '}
                    {yearVacations.map((vac, i) => (
                      <span key={vac.id}>
                        {i > 0 && ' · '}
                        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {formatNumericDate(vac.startDate).slice(0, 5)}–
                          {formatNumericDate(vac.endDate).slice(0, 5)}
                        </span>{' '}
                        ({countDaysInclusive(vac.startDate, vac.endDate)}{' '}
                        {pluralizeDays(countDaysInclusive(vac.startDate, vac.endDate))})
                      </span>
                    ))}
                  </>
                ) : (
                  <>Стандартный цикл перевахтовки · {stats.totalDays} календарных дней</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              {/* Year Segmented Control */}
              <div
                role="tablist"
                aria-label="Выбор года"
                className="grid grid-cols-4 sm:inline-flex w-full sm:w-auto items-center p-1 bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    role="tab"
                    aria-selected={year === y}
                    onClick={() => setYear(y)}
                    className={`min-h-[38px] sm:min-h-[34px] px-2 sm:px-3.5 text-sm font-mono tabular-nums font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      year === y
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              {activeTab === 'calendar' && (
                <button
                  type="button"
                  onClick={() => setShowCellCodes((prev) => !prev)}
                  className={`min-h-[38px] sm:min-h-[34px] px-3 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    showCellCodes
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'bg-white dark:bg-[#111927] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Коды Я/Н/Д в ячейках
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Strip with uniform 1px grid hairlines across all breakpoints */}
          <section
            aria-label="Годовая статистика смен"
            className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px"
          >
            <div className="p-3 sm:p-4 bg-white dark:bg-[#111927]">
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Часов за год
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-blue-700 dark:text-blue-400 mt-0.5 sm:mt-1">
                {stats.totalHours}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.workDays} раб. дней
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveFilter((p) => (p === 'y' ? 'all' : 'y'));
                setActiveTab('calendar');
              }}
              className={`p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                activeFilter === 'y'
                  ? 'bg-amber-50 dark:bg-amber-950/60'
                  : 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Дневные (Я)
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-amber-800 dark:text-amber-300 mt-0.5 sm:mt-1">
                {stats.counts.y}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.counts.y * 11} ч · по 11 ч
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter((p) => (p === 'n' ? 'all' : 'n'));
                setActiveTab('calendar');
              }}
              className={`p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                activeFilter === 'n'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60'
                  : 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Ночные (Н)
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-indigo-800 dark:text-indigo-300 mt-0.5 sm:mt-1">
                {stats.counts.n}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.counts.n * 11} ч · по 11 ч
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter((p) => (p === 'd' ? 'all' : 'd'));
                setActiveTab('calendar');
              }}
              className={`p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                activeFilter === 'd'
                  ? 'bg-orange-50 dark:bg-orange-950/60'
                  : 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Дорога (Д)
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-orange-800 dark:text-orange-300 mt-0.5 sm:mt-1">
                {stats.counts.d}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.counts.d * 8} ч · по 8 ч
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter((p) => (p === 'v' ? 'all' : 'v'));
                setActiveTab('calendar');
              }}
              className={`p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                activeFilter === 'v'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60'
                  : 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Выходные (В)
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 sm:mt-1">
                {stats.counts.v}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                отдыхающая вахта
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter((p) => (p === 'o' ? 'all' : 'o'));
                setActiveTab('calendar');
              }}
              className={`p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                activeFilter === 'o'
                  ? 'bg-rose-50 dark:bg-rose-950/60'
                  : 'bg-white dark:bg-[#111927] hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Отпуск (О)
              </div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-rose-700 dark:text-rose-300 mt-0.5 sm:mt-1">
                {stats.counts.o}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.counts.o > 0 ? pluralizeDays(stats.counts.o) : 'не запланирован'}
              </div>
            </button>
          </section>

          {/* Active filter notification */}
          {activeTab === 'calendar' && activeFilter !== 'all' && (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Выделен тип дней:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {SHIFT_TYPES[activeFilter].label}
                </strong>{' '}
                ({stats.counts[activeFilter]} {pluralizeDays(stats.counts[activeFilter])})
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer"
              >
                Все дни
              </button>
            </div>
          )}

          {/* Main Active View */}
          {activeTab === 'calendar' && (
            <YearCalendarView
              year={year}
              scheduleByMonth={scheduleByMonth}
              activeFilter={activeFilter}
              showCellCodes={showCellCodes}
              selectedDate={selectedDate}
              highlightedMonth={highlightedMonth}
              overrides={overrides}
              notes={notes}
              onSelectDay={(iso) => setSelectedDate(iso)}
            />
          )}

          {activeTab === 'rotations' && (
            <RotationsListView
              year={year}
              blocks={rotationBlocks}
              onJumpToDate={handleJumpToDate}
            />
          )}

          {activeTab === 'vacations' && (
            <VacationsAndEditsView
              year={year}
              vacations={vacations}
              overrides={overrides}
              notes={notes}
              onAddVacation={handleAddVacation}
              onDeleteVacation={handleDeleteVacation}
              onResetVacations={() => setVacations(DEFAULT_VACATIONS)}
              onRemoveOverride={handleResetOverride}
              onClearAllOverrides={() => setOverrides({})}
              onDeleteNote={(iso) => handleSaveNote(iso, '')}
              onJumpToDate={handleJumpToDate}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryTableView
              year={year}
              monthlyBreakdown={monthlyBreakdown}
              vacations={vacations}
              overrides={overrides}
              onSelectYear={(y) => setYear(y)}
              onDownloadMonthlyCsv={handleDownloadMonthlyCsv}
            />
          )}
        </main>
      </div>

      {/* Fixed Bottom Tab Bar for Mobile Thumb Navigation (56px + safe area) */}
      <nav
        aria-label="Основная навигация"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#111927]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] no-print"
      >
        <div className="grid grid-cols-4 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-none tracking-tight">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Day Inspector & Override Sheet */}
      {selectedDayInfo && (
        <DayDetailModal
          isoDate={selectedDayInfo.isoDate}
          effectiveCode={selectedDayInfo.effectiveCode}
          baseCode={selectedDayInfo.baseCode}
          isOverridden={selectedDayInfo.isOverridden}
          blockContext={selectedDayInfo.blockContext}
          note={selectedDayInfo.note}
          onClose={() => setSelectedDate(null)}
          onNavigateDay={handleNavigateModalDay}
          onSetOverride={handleSetOverride}
          onResetOverride={handleResetOverride}
          onSaveNote={handleSaveNote}
        />
      )}

      {/* Export Sheet */}
      {exportOpen && (
        <ExportModal
          year={year}
          vacations={vacations}
          overrides={overrides}
          notes={notes}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}
