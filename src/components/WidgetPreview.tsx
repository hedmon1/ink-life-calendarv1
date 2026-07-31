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

/** The lock-screen widget: one square per year, in the system's white-on-wallpaper style. */
export function LockWidgetPreview({ width, lived }: { width: number; lived: number }) {
  const s = width / LOCK_W;
  const livedYears = Math.floor(lived / WEEKS_PER_YEAR);
  const cols = 40;
  const rows = 2;
  const gap = Math.max(0.75, s);
  const barH = 16 * s;
  const cw = (width - (cols - 1) * gap) / cols;
  const ch = (barH - (rows - 1) * gap) / rows;

  const cells = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const yearIndex = r * cols + c;
        out.push(
          <Rect
            key={yearIndex}
            x={c * (cw + gap)}
            y={r * (ch + gap)}
            width={cw}
            height={ch}
            rx={Math.min(cw, ch) * 0.25}
            fill="#ffffff"
            fillOpacity={yearIndex < livedYears ? 0.95 : 0.22}
          />
        );
      }
    }
    return out;
  }, [cw, ch, gap, livedYears]);

  // iOS draws lock-screen widgets in a translucent rounded container
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 18 * s, padding: 10 * s }}>
      <View style={{ width, gap: 3 * s }}>
        <Mono size={Math.max(7, 9 * s)} spacing={0.12} color="#ffffff" medium>
          LIFE IN WEEKS
        </Mono>
        <Svg width={width} height={barH}>
          {cells}
        </Svg>
        <Mono size={Math.max(7, 9 * s)} spacing={0.08} color="rgba(255,255,255,0.65)">
          WK {fmt(lived + 1)} / {fmt(TOTAL_WEEKS)}
        </Mono>
      </View>
    </View>
  );
}
