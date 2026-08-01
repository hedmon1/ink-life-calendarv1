import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { fmt, LIFE_YEARS, TOTAL_WEEKS, WEEKS_PER_YEAR } from '../lib/calc';
import { C } from '../theme';
import { Mono, Serif } from './Type';

// Pixel-faithful mocks of the real widgets so people can see what they're adding.
// These mirror targets/widget/grid.swift and lock.swift — same header, same
// lattice, same colours. Keep them in sync.

// a large widget / rectangular lock widget, in points, on a 6.1" iPhone
export const LARGE_W = 338;
const LARGE_H = 354;
export const LOCK_W = 160;

/** The home-screen widget: header + the full 52×80 grid, exactly as grid.swift draws it. */
export function HomeWidgetPreview({ width, lived }: { width: number; lived: number }) {
  const s = width / LARGE_W;
  const height = width * (LARGE_H / LARGE_W);
  const pad = 14 * s;
  const font = Math.max(6.5, 8.5 * s);

  const canvasW = width - pad * 2;
  const canvasH = height - pad * 2 - font * 1.35 - 7 * s;

  const cells = useMemo(() => {
    const gap = Math.max(0.5, s);
    const cell = Math.min((canvasW - (WEEKS_PER_YEAR - 1) * gap) / WEEKS_PER_YEAR, (canvasH - (LIFE_YEARS - 1) * gap) / LIFE_YEARS);
    const gridW = WEEKS_PER_YEAR * cell + (WEEKS_PER_YEAR - 1) * gap;
    const gridH = LIFE_YEARS * cell + (LIFE_YEARS - 1) * gap;
    const x0 = (canvasW - gridW) / 2;
    const y0 = (canvasH - gridH) / 2;

    const out: React.ReactNode[] = [];
    for (let i = 0; i < TOTAL_WEEKS; i++) {
      const c = i % WEEKS_PER_YEAR;
      const r = Math.floor(i / WEEKS_PER_YEAR);
      const common = {
        x: x0 + c * (cell + gap),
        y: y0 + r * (cell + gap),
        width: cell,
        height: cell,
        rx: cell * 0.22,
      };
      if (i === lived) {
        out.push(<Rect key={i} {...common} fill={C.bg} stroke={C.ink} strokeWidth={Math.max(0.5, s)} />);
      } else {
        out.push(<Rect key={i} {...common} fill={i < lived ? C.ink : C.pencil} />);
      }
    }
    return out;
  }, [canvasW, canvasH, s, lived]);

  return (
    <View style={{ width, height, borderRadius: 22 * s, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, padding: pad, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Mono size={font} spacing={0.15} color={C.muted} medium>
          YOUR LIFE IN WEEKS
        </Mono>
        <Mono size={font} spacing={0.07} color={C.muted} medium>
          WK {fmt(lived + 1)} / {fmt(TOTAL_WEEKS)}
        </Mono>
      </View>
      <View style={{ marginTop: 7 * s }}>
        <Svg width={canvasW} height={canvasH}>
          {cells}
        </Svg>
      </View>
    </View>
  );
}

/** Weeks of the current year that are done, and the year itself — mirrors yearStats() in index.swift. */
export function yearStats(now: Date = new Date()) {
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const dayOfYear = Math.floor((now.getTime() - start) / 86400000) + 1;
  return { year, inkedWeeks: Math.min(52, Math.floor((dayOfYear - 1) / 7)) };
}

/**
 * The lock-screen widget: this year as 52 boxes, the same 26×2 strip the Year
 * widget draws on the home screen, in lock-screen monochrome. Mirrors lock.swift.
 * 52 boxes fit this slot legibly where the 4,160-week life grid does not.
 */
const LOCK_COLS = 26;
const LOCK_ROWS = 2;

export function LockWidgetPreview({ width }: { width: number }) {
  const s = width / LOCK_W;
  const font = Math.max(6, 8.5 * s);
  const { year, inkedWeeks } = yearStats();
  // 26 boxes across is what sets the cell size here, so the strip hugs its rows
  const gapR = 0.3;
  const cell = width / (LOCK_COLS + (LOCK_COLS - 1) * gapR);
  const stripH = LOCK_ROWS * cell + (LOCK_ROWS - 1) * cell * gapR;

  const cells = useMemo(() => {
    const gap = cell * gapR;
    const x0 = (width - (LOCK_COLS * cell + (LOCK_COLS - 1) * gap)) / 2;
    const y0 = 0;
    const current = Math.min(LOCK_COLS * LOCK_ROWS - 1, inkedWeeks);

    const out: React.ReactNode[] = [];
    for (let i = 0; i < LOCK_COLS * LOCK_ROWS; i++) {
      const common = {
        x: x0 + (i % LOCK_COLS) * (cell + gap),
        y: y0 + Math.floor(i / LOCK_COLS) * (cell + gap),
        width: cell,
        height: cell,
        rx: cell * 0.25,
      };
      out.push(
        i === current ? (
          <Rect key={i} {...common} fill="none" stroke="#ffffff" strokeWidth={Math.max(1, cell * 0.18)} />
        ) : (
          <Rect key={i} {...common} fill="#ffffff" fillOpacity={i < inkedWeeks ? 0.95 : 0.28} />
        )
      );
    }
    return out;
  }, [width, cell, inkedWeeks]);

  // iOS draws lock-screen widgets in a translucent rounded container
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 18 * s, padding: 9 * s }}>
      <View style={{ width, gap: 4 * s }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5 * s }}>
          <Serif size={Math.max(11, 14 * s)} weight="semi" color="#ffffff">
            {year}
          </Serif>
          <Mono size={font} spacing={0.06} color="#ffffff" medium numberOfLines={1}>
            {inkedWeeks} / 52 WEEKS
          </Mono>
        </View>
        <Svg width={width} height={stripH}>
          {cells}
        </Svg>
      </View>
    </View>
  );
}
