import React from 'react';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { fmt, LIFE_YEARS, lifeCalc, PRIME_END, WEEKS_PER_YEAR } from '../lib/calc';
import { C } from '../theme';

/**
 * Full-screen 52×80 life grid, sized to the device for use as a wallpaper.
 * Drawn as a handful of SVG <Path>s (one per cell category) rather than 4,160
 * <Rect>s so it captures fast. The grid is nudged below the top of the screen
 * so the lock-screen clock doesn't sit on it.
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
  const gap = Math.max(1, availW * 0.003);
  const cell = Math.min((availW - (cols - 1) * gap) / cols, (availH - (rows - 1) * gap) / rows);
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const x0 = (width - gridW) / 2;
  const y0 = topPad + (availH - gridH) / 2;

  const xy = (i: number) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return [x0 + c * (cell + gap), y0 + r * (cell + gap)] as const;
  };
  const rectAt = (i: number) => {
    const [x, y] = xy(i);
    return `M${x.toFixed(2)} ${y.toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h${(-cell).toFixed(2)}z`;
  };

  let inkedD = '';
  let pencilD = '';
  let primeD = '';
  for (let i = 0; i < cols * rows; i++) {
    if (i < lived) inkedD += rectAt(i);
    else if (i === lived) continue; // drawn separately (outlined)
    else if (i < PRIME_END) primeD += rectAt(i);
    else pencilD += rectAt(i);
  }
  const [twx, twy] = xy(Math.min(lived, cols * rows - 1));

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect x={0} y={0} width={width} height={height} fill={C.bg} />
      {pencilD ? <Path d={pencilD} fill={C.pencil} /> : null}
      {primeD ? <Path d={primeD} fill={C.amber} /> : null}
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
