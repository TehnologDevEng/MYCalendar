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
    cell: 'bg-emerald-950/55 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/55 hover:border-emerald-400/55',
    swatch: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300',
    text: 'text-emerald-400',
    surface: 'bg-emerald-950/45 border-emerald-500/35 text-emerald-200',
    ring: 'ring-emerald-400/70',
  },
  d: {
    cell: 'bg-orange-950/60 border-orange-500/40 text-orange-300 hover:bg-orange-900/60 hover:border-orange-400/65',
    swatch: 'bg-orange-950/90 border-orange-500/70 text-orange-300',
    text: 'text-orange-400',
    surface: 'bg-orange-950/45 border-orange-500/40 text-orange-200',
    ring: 'ring-orange-400/70',
  },
  y: {
    cell: 'bg-amber-950/55 border-amber-400/40 text-amber-200 hover:bg-amber-900/55 hover:border-amber-300/65',
    swatch: 'bg-amber-950/90 border-amber-400/70 text-amber-200',
    text: 'text-amber-300',
    surface: 'bg-amber-950/45 border-amber-400/40 text-amber-100',
    ring: 'ring-amber-300/70',
  },
  n: {
    cell: 'bg-indigo-950/75 border-indigo-400/40 text-indigo-200 hover:bg-indigo-900/75 hover:border-indigo-300/65',
    swatch: 'bg-indigo-950 border-indigo-400/70 text-indigo-200',
    text: 'text-indigo-300',
    surface: 'bg-indigo-950/55 border-indigo-400/40 text-indigo-100',
    ring: 'ring-indigo-300/70',
  },
  o: {
    cell: 'bg-rose-950/60 border-rose-500/40 text-rose-200 hover:bg-rose-900/60 hover:border-rose-400/65',
    swatch: 'bg-rose-950/90 border-rose-500/70 text-rose-200',
    text: 'text-rose-400',
    surface: 'bg-rose-950/45 border-rose-500/40 text-rose-100',
    ring: 'ring-rose-400/70',
  },
};
