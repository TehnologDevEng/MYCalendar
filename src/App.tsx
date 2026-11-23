import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  Download,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SlidersHorizontal,
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
  showCodes: 'vakhta_nosar_show_codes_v1',
  sidebarCollapsed: 'mycalendar_sidebar_collapsed_v1',
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    loadJson<boolean>(STORAGE_KEYS.sidebarCollapsed, false)
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

  useEffect(() => {
    saveJson(STORAGE_KEYS.sidebarCollapsed, isSidebarCollapsed);
  }, [isSidebarCollapsed]);

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
    { id: 'calendar', label: 'Календарь', shortLabel: 'Календарь', icon: CalendarDays },
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

  const renderBrandLockup = (collapsed = false) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-md bg-[#00BCC5] flex items-center justify-center shadow-lg shadow-[#00BCC5]/20 shrink-0">
        <CalendarDays size={18} className="text-white" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none select-none">
          <span className="font-[family-name:var(--font-signature)] text-[27px] leading-[0.95] tracking-wide whitespace-nowrap">
            <span className="text-[#00BCC5]">MY</span>
            <span className="text-[#F7F8F8]">Calendar</span>
          </span>
          <svg
            viewBox="0 0 112 8"
            className="w-[104px] h-[6px] -mt-0.5 text-[#00BCC5]/55"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 5.5C32 1.8 74 1.2 110 4.2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );

  const renderToolsContent = (collapsed = false) => (
    <div className="flex flex-col h-full">
      {/* Brand header + collapse toggle (MYPlaner signature style) */}
      <div
        className={`pt-5 pb-4 border-b border-[#222222] flex items-center text-[#F7F8F8] ${
          collapsed ? 'justify-center px-2 flex-col gap-3' : 'justify-between px-4'
        }`}
      >
        {renderBrandLockup(collapsed)}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex p-1.5 text-[#666] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] rounded-lg transition-colors cursor-pointer shrink-0"
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          aria-label={collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Navigation (desktop & tablet sidebar) */}
      <nav className="hidden md:block p-2.5 space-y-1 border-b border-[#222222]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer group ${
                collapsed ? 'justify-center px-0' : 'justify-between'
              } ${
                isActive
                  ? 'bg-[#1A1A1C] text-[#F7F8F8] font-medium'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  size={16}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#00BCC5]' : 'group-hover:text-[#00BCC5]'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </span>
              {!collapsed && item.count !== undefined && item.count > 0 && (
                <span className="font-mono tabular-nums text-[11px] text-[#666]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          {/* Quick Date Lookup */}
          <div className="p-4 border-b border-[#222222] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#8A8F98]">
              <Search className="w-3.5 h-3.5 text-[#00BCC5]" />
              Проверить дату
            </div>
            <input
              type="date"
              min="2027-01-01"
              max="2030-12-31"
              value={lookupDate}
              onChange={(e) => setLookupDate(e.target.value)}
              aria-label="Выбрать дату для проверки смены"
              className="w-full h-10 md:h-9 px-2.5 rounded-lg border border-[#2A2A30] bg-[#141416] text-sm md:text-xs font-mono tabular-nums text-[#F7F8F8] focus:outline-none focus:border-[#00BCC5]"
            />
            {lookupResult && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-xs font-semibold ${SHIFT_STYLES[lookupResult.code].text}`}>
                    {lookupResult.meta.shortLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-[#8A8F98]">
                    {lookupResult.meta.hours} ч
                  </span>
                </div>
                <div className="text-[11px] text-[#8A8F98] leading-snug">
                  День {lookupResult.block.dayInBlock} из {lookupResult.block.totalDaysInBlock} (
                  {MONTHS_SHORT[parseIsoDate(lookupResult.block.startDate).month]}{' '}
                  {parseIsoDate(lookupResult.block.startDate).day} –{' '}
                  {MONTHS_SHORT[parseIsoDate(lookupResult.block.endDate).month]}{' '}
                  {parseIsoDate(lookupResult.block.endDate).day})
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToDate(lookupDate)}
                  className="text-xs font-medium text-[#00BCC5] hover:underline cursor-pointer"
                >
                  Перейти к дате
                </button>
              </div>
            )}
          </div>

          {/* Interactive Shift Legend / Filter */}
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-[#8A8F98]">Обозначения смен</span>
              {activeFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="text-[11px] font-medium text-[#00BCC5] hover:underline cursor-pointer"
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
                    className={`w-full min-h-[40px] md:min-h-0 flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1A1A1C] text-[#F7F8F8] font-semibold'
                        : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#141416]'
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
                    <span className="font-mono tabular-nums text-[11px] text-[#666] shrink-0">
                      {count} дн.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owner profile footer (MYPlaner style) */}
          <div className="px-4 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] md:pb-3.5 border-t border-[#222222] bg-[#0B0B0C]">
            <div className="text-xs font-medium text-[#F7F8F8] truncate">
              {OWNER_INFO.fullName}
            </div>
            <div className="text-[11px] text-[#8A8F98] mt-0.5 truncate">
              {OWNER_INFO.role} · {OWNER_INFO.department}
            </div>
            {notesCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('vacations');
                  setMobileToolsOpen(false);
                }}
                className="mt-2 text-[11px] font-mono tabular-nums text-[#00BCC5] hover:underline cursor-pointer"
              >
                Личных заметок: {notesCount}
              </button>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className="mt-auto p-2.5 border-t border-[#222222] flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            title="Экспорт .ics / CSV"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#00BCC5] hover:bg-[#1A1A1C] transition-colors cursor-pointer"
          >
            <Download size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-black text-[#F7F8F8]">
      {/* Desktop & Landscape Tablet Collapsible Sidebar */}
      <aside
        className={`hidden md:flex shrink-0 bg-[#0E0E0F] border-r border-[#222222] flex-col sticky top-0 h-screen transition-[width] duration-200 ease-out ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {renderToolsContent(isSidebarCollapsed)}
      </aside>

      {/* Mobile Tools Drawer (Date Check, Shift Legend, Owner Info) */}
      {mobileToolsOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/75 backdrop-blur-xs flex"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileToolsOpen(false);
          }}
        >
          <aside className="w-72 max-w-[85vw] bg-[#0E0E0F] h-full border-r border-[#222226] relative">
            <button
              type="button"
              onClick={() => setMobileToolsOpen(false)}
              aria-label="Закрыть панель"
              className="absolute top-3.5 right-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1A1A1C] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {renderToolsContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact Obsidian Top Header Bar */}
        <header className="sticky top-0 z-20 h-12 md:h-14 bg-[#0E0E10]/90 backdrop-blur-md border-b border-[#222226] px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#00BCC5] flex items-center justify-center shrink-0">
                <CalendarDays size={15} className="text-white" />
              </div>
              <span className="font-[family-name:var(--font-signature)] text-[22px] leading-none whitespace-nowrap">
                <span className="text-[#00BCC5]">MY</span>
                <span className="text-[#F7F8F8]">Calendar</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm truncate">
              <span className="font-semibold text-[#F7F8F8] truncate">
                {activeTabLabel}
              </span>
              <span className="text-[#33333A]" aria-hidden="true">
                /
              </span>
              <span className="font-mono tabular-nums text-[#8A8F98] whitespace-nowrap">
                {year}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 min-h-[34px] rounded-lg bg-[#00BCC5] hover:bg-[#19CBD3] text-black text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="sm:hidden">Экспорт</span>
              <span className="hidden sm:inline">Экспорт .ics / CSV</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-3 sm:px-6 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-[1280px] w-full mx-auto space-y-4 sm:space-y-6">
          {/* Year switcher & Workspace Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F7F8F8]">
                График вахты на {year} год
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8F98] mt-0.5 sm:mt-1">
                {yearVacations.length > 0 ? (
                  <>
                    Отпуска:{' '}
                    {yearVacations.map((vac, i) => (
                      <span key={vac.id}>
                        {i > 0 && ' · '}
                        <span className="font-mono tabular-nums text-[#F7F8F8]">
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
                className="grid grid-cols-4 sm:inline-flex w-full sm:w-auto items-center p-1 bg-[#0E0E0F] border border-[#222226] rounded-lg"
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
                        ? 'bg-[#00BCC5] text-black'
                        : 'text-[#8A8F98] hover:text-[#F7F8F8]'
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
                      ? 'bg-[#131D1F] text-[#00BCC5] border-[#00BCC5]/50'
                      : 'bg-[#0E0E0F] text-[#8A8F98] border-[#222226] hover:text-[#F7F8F8] hover:border-[#33333A]'
                  }`}
                >
                  Коды Я/Н/Д в ячейках
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Strip (uniform 1px obsidian grid hairlines) */}
          <section
            aria-label="Годовая статистика смен"
            className="rounded-xl border border-[#222226] overflow-hidden bg-[#222226] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px"
          >
            <div className="p-3 sm:p-4 bg-[#0E0E0F]">
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Часов за год</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-[#00BCC5] mt-0.5 sm:mt-1">
                {stats.totalHours}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
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
                  ? 'bg-amber-950/45'
                  : 'bg-[#0E0E0F] hover:bg-[#161618]'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Дневные (Я)</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-amber-300 mt-0.5 sm:mt-1">
                {stats.counts.y}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
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
                  ? 'bg-indigo-950/55'
                  : 'bg-[#0E0E0F] hover:bg-[#161618]'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Ночные (Н)</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-indigo-300 mt-0.5 sm:mt-1">
                {stats.counts.n}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
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
                  ? 'bg-orange-950/45'
                  : 'bg-[#0E0E0F] hover:bg-[#161618]'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Дорога (Д)</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-orange-400 mt-0.5 sm:mt-1">
                {stats.counts.d}
              </div>
              <div className="text-[11px] sm:text-xs font-mono tabular-nums text-[#8A8F98] mt-0.5">
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
                  ? 'bg-emerald-950/45'
                  : 'bg-[#0E0E0F] hover:bg-[#161618]'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Выходные (В)</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-emerald-400 mt-0.5 sm:mt-1">
                {stats.counts.v}
              </div>
              <div className="text-[11px] sm:text-xs text-[#8A8F98] mt-0.5">
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
                  ? 'bg-rose-950/45'
                  : 'bg-[#0E0E0F] hover:bg-[#161618]'
              }`}
            >
              <div className="text-[11px] sm:text-xs text-[#8A8F98]">Отпуск (О)</div>
              <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-rose-400 mt-0.5 sm:mt-1">
                {stats.counts.o}
              </div>
              <div className="text-[11px] sm:text-xs text-[#8A8F98] mt-0.5">
                {stats.counts.o > 0 ? pluralizeDays(stats.counts.o) : 'не запланирован'}
              </div>
            </button>
          </section>

          {/* Active filter notification */}
          {activeTab === 'calendar' && activeFilter !== 'all' && (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#0E0E0F] border border-[#00BCC5]/35 text-xs">
              <span className="text-[#C8CCD4]">
                Выделен тип дней:{' '}
                <strong className="text-[#F7F8F8]">
                  {SHIFT_TYPES[activeFilter].label}
                </strong>{' '}
                ({stats.counts[activeFilter]} {pluralizeDays(stats.counts[activeFilter])})
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="font-medium text-[#00BCC5] hover:underline whitespace-nowrap cursor-pointer"
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

      {/* Fixed Mobile Bottom Navigation Bar (exact MYPlaner 56px obsidian pattern) */}
      <nav
        aria-label="Основная навигация"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0E0E10]/95 backdrop-blur-md border-t border-[#222226] z-30 flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] no-print"
      >
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
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-11 rounded-lg text-[10px] transition-colors cursor-pointer ${
                isActive ? 'text-[#00BCC5] font-medium' : 'text-[#8A8F98]'
              }`}
            >
              <Icon size={18} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileToolsOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-11 rounded-lg text-[10px] text-[#8A8F98] active:text-[#00BCC5] transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={18} />
          <span>Меню</span>
        </button>
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
