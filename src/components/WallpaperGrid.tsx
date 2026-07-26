import React from 'react';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { fmt, LIFE_YEARS, lifeCalc, WEEKS_PER_YEAR } from '../lib/calc';
import { C } from '../theme';

// segmentation, mirroring LifeGrid: 13-week quarters across, decades down
const QUARTER = 13;
const DECADE = 10;
const HBLOCKS = Math.floor((WEEKS_PER_YEAR - 1) / QUARTER); // 3 inter-block gaps per row
const VBLOCKS = Math.floor((LIFE_YEARS - 1) / DECADE); // 7 inter-block gaps per column

// sizing ratios relative to a cell
const GAP_R = 0.28; // thin gap between cells
const BLOCK_R = 0.95; // wider gap between quarter/decade blocks

/**
 * Full-screen life grid, sized to the device for use as a wallpaper. Just lived /
 * this-week / ahead — no prime or proximity shading — and split into quarter and
 * decade blocks like the main grid so the passage of time reads clearly. Drawn as
 * two SVG <Path>s (one per state) so it captures fast.
 */
export function WallpaperGrid({ width, height, birthYear }: { width: number; height: number; birthYear: number }) {
  const { lived } = lifeCalc(birthYear);
  const cols = WEEKS_PER_YEAR;
  const rows = LIFE_YEARS;

  const padX = width * 0.09;
  const topPad = height * 0.2; // clear the lock clock
  const botPad = height * 0.13;
  const availW = width - padX * 2;
  const availH = height - topPad - botPad;

  // solve for the cell size with gap/blockGap expressed as multiples of it
  const cellW = availW / (cols + (cols - 1) * GAP_R + HBLOCKS * BLOCK_R);
  const cellH = availH / (rows + (rows - 1) * GAP_R + VBLOCKS * BLOCK_R);
  const cell = Math.min(cellW, cellH);
  const gap = cell * GAP_R;
  const blockGap = cell * BLOCK_R;

  const gridW = cols * cell + (cols - 1) * gap + HBLOCKS * blockGap;
  const gridH = rows * cell + (rows - 1) * gap + VBLOCKS * blockGap;
  const x0 = (width - gridW) / 2;
  const y0 = topPad + (availH - gridH) / 2;

  const xy = (i: number) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = x0 + c * (cell + gap) + Math.floor(c / QUARTER) * blockGap;
    const y = y0 + r * (cell + gap) + Math.floor(r / DECADE) * blockGap;
    return [x, y] as const;
  };
  const rectAt = (i: number) => {
    const [x, y] = xy(i);
    return `M${x.toFixed(2)} ${y.toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h${(-cell).toFixed(2)}z`;
  };

  let inkedD = '';
  let pencilD = '';
  for (let i = 0; i < cols * rows; i++) {
    if (i < lived) inkedD += rectAt(i);
    else if (i === lived) continue; // drawn separately (outlined)
    else pencilD += rectAt(i);
  }
  const [twx, twy] = xy(Math.min(lived, cols * rows - 1));

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect x={0} y={0} width={width} height={height} fill={C.bg} />
      {pencilD ? <Path d={pencilD} fill={C.pencil} /> : null}
      {inkedD ? <Path d={inkedD} fill={C.ink} /> : null}
      <Rect x={twx} y={twy} width={cell} height={cell} fill={C.bg} stroke={C.ink} strokeWidth={Math.max(1, cell * 0.12)} />
      <SvgText
        x={width / 2}
        y={height - botPad * 0.5}
        fill={C.muted}
        fontFamily="IBMPlexMono_500Medium"
        fontSize={Math.round(width * 0.03)}
        letterSpacing={2}
        textAnchor="middle"
      >
        {`WEEK ${fmt(lived + 1)}  /  ${fmt(cols * rows)}`}
      </SvgText>
    </Svg>
  );
}
