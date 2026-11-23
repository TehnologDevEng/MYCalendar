import { ShiftCode } from './scheduleData';

export interface ShiftVisualStyle {
  cell: string;
  swatch: string;
  text: string;
  surface: string;
  ring: string;
}

export const SHIFT_STYLES: Record<ShiftCode, ShiftVisualStyle> = {
  v: {
    cell: 'bg-emerald-50/95 border-emerald-300/80 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/55 dark:border-emerald-700/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60',
    swatch: 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200',
    text: 'text-emerald-800 dark:text-emerald-300',
    surface: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800/70 dark:text-emerald-200',
    ring: 'ring-emerald-500/60',
  },
  d: {
    cell: 'bg-orange-50/95 border-orange-300/90 text-orange-950 hover:bg-orange-100 dark:bg-orange-950/55 dark:border-orange-700/70 dark:text-orange-200 dark:hover:bg-orange-900/60',
    swatch: 'bg-orange-100 border-orange-500 text-orange-950 dark:bg-orange-950 dark:border-orange-500 dark:text-orange-200',
    text: 'text-orange-800 dark:text-orange-300',
    surface: 'bg-orange-50 border-orange-200 text-orange-950 dark:bg-orange-950/60 dark:border-orange-800/70 dark:text-orange-200',
    ring: 'ring-orange-500/60',
  },
  y: {
    cell: 'bg-amber-50/95 border-amber-300/90 text-amber-950 hover:bg-amber-100 dark:bg-amber-950/50 dark:border-amber-700/70 dark:text-amber-200 dark:hover:bg-amber-900/60',
    swatch: 'bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950 dark:border-amber-500 dark:text-amber-200',
    text: 'text-amber-800 dark:text-amber-300',
    surface: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/60 dark:border-amber-800/70 dark:text-amber-200',
    ring: 'ring-amber-500/60',
  },
  n: {
    cell: 'bg-indigo-50/95 border-indigo-300/85 text-indigo-950 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:border-indigo-700/70 dark:text-indigo-200 dark:hover:bg-indigo-900/65',
    swatch: 'bg-indigo-100 border-indigo-500 text-indigo-950 dark:bg-indigo-950 dark:border-indigo-500 dark:text-indigo-200',
    text: 'text-indigo-800 dark:text-indigo-300',
    surface: 'bg-indigo-50 border-indigo-200 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-800/70 dark:text-indigo-200',
    ring: 'ring-indigo-500/60',
  },
  o: {
    cell: 'bg-rose-50/95 border-rose-300/85 text-rose-950 hover:bg-rose-100 dark:bg-rose-950/55 dark:border-rose-700/70 dark:text-rose-200 dark:hover:bg-rose-900/60',
    swatch: 'bg-rose-100 border-rose-500 text-rose-950 dark:bg-rose-950 dark:border-rose-500 dark:text-rose-200',
    text: 'text-rose-800 dark:text-rose-300',
    surface: 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/60 dark:border-rose-800/70 dark:text-rose-200',
    ring: 'ring-rose-500/60',
  },
};
