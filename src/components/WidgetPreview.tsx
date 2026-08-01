import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { fmt, LIFE_YEARS, TOTAL_WEEKS, WEEKS_PER_YEAR } from '../lib/calc';
import { C } from '../theme';
import { Mono } from './Type';

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

/**
 * The lock-screen widget — same shape as the home one (header row, then the grid),
 * drawn white-on-wallpaper. Mirrors lock.swift, including the 104×40 reflow: the
 * accessory slot is wide and short, so two years per row keeps the cells big
 * enough to read as squares instead of smearing into a bar.
 */
const LOCK_COLS = WEEKS_PER_YEAR * 2; // 104
const LOCK_ROWS = LIFE_YEARS / 2; // 40

export function LockWidgetPreview({ width, lived }: { width: number; lived: number }) {
  const s = width / LOCK_W;
  const font = Math.max(6, 7.5 * s);
  const gridH = 72 * s - font * 1.35 - 3 * s;

  const cells = useMemo(() => {
    const gap = (1 / 3) * s; // one device pixel at 3×, as in lock.swift
    const cell = Math.min((width - (LOCK_COLS - 1) * gap) / LOCK_COLS, (gridH - (LOCK_ROWS - 1) * gap) / LOCK_ROWS);
    const x0 = (width - (LOCK_COLS * cell + (LOCK_COLS - 1) * gap)) / 2;
    const y0 = (gridH - (LOCK_ROWS * cell + (LOCK_ROWS - 1) * gap)) / 2;

    const out: React.ReactNode[] = [];
    for (let i = 0; i < TOTAL_WEEKS; i++) {
      const c = i % LOCK_COLS;
      const r = Math.floor(i / LOCK_COLS);
      out.push(
        <Rect
          key={i}
          x={x0 + c * (cell + gap)}
          y={y0 + r * (cell + gap)}
          width={cell}
          height={cell}
          fill="#ffffff"
          fillOpacity={i < lived ? 0.9 : i === lived ? 1 : 0.25}
        />
      );
    }
    return out;
  }, [width, gridH, s, lived]);

  // iOS draws lock-screen widgets in a translucent rounded container
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 18 * s, padding: 9 * s }}>
      <View style={{ width, gap: 3 * s }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5 * s }}>
          <Mono size={font} spacing={0.1} color="#ffffff" medium numberOfLines={1} style={{ flexShrink: 1 }}>
            LIFE IN WEEKS
          </Mono>
          <Mono size={font} spacing={0.04} color="#ffffff" medium numberOfLines={1}>
            WK {fmt(lived + 1)} / {fmt(TOTAL_WEEKS)}
          </Mono>
        </View>
        <Svg width={width} height={gridH}>
          {cells}
        </Svg>
      </View>
    </View>
  );
}
