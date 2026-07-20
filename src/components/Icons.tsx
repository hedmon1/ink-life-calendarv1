import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = { color: string; size?: number; active?: boolean };

const SW = 1.7;

// Calendar with a marked "this week" cell.
export function WeekIcon({ color, size = 22, active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4.5} width={18} height={16} rx={3} stroke={color} strokeWidth={SW} />
      <Line x1={3} y1={9} x2={21} y2={9} stroke={color} strokeWidth={SW} />
      <Rect x={6.5} y={12} width={4.5} height={4.5} rx={1} fill={active ? color : 'none'} stroke={color} strokeWidth={SW} />
    </Svg>
  );
}

// 3×3 grid of cells.
export function GridIcon({ color, size = 22, active }: IconProps) {
  const cells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      cells.push(
        <Rect
          key={`${r}-${c}`}
          x={4 + c * 6}
          y={4 + r * 6}
          width={4}
          height={4}
          rx={1}
          fill={active && r === 0 && c === 0 ? color : 'none'}
          stroke={color}
          strokeWidth={1.5}
        />
      );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {cells}
    </Svg>
  );
}

// Target — concentric rings.
export function GoalsIcon({ color, size = 22, active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={SW} />
      <Circle cx={12} cy={12} r={3.6} stroke={color} strokeWidth={SW} />
      <Circle cx={12} cy={12} r={1.4} fill={active ? color : color} />
    </Svg>
  );
}

// Photo — frame, sun, mountains.
export function MemoriesIcon({ color, size = 22, active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={3} stroke={color} strokeWidth={SW} />
      <Circle cx={8.5} cy={10} r={1.7} fill={active ? color : 'none'} stroke={color} strokeWidth={1.5} />
      <Path d="M4 17.5 L9 12.5 L13 16 L16 13 L20 17" stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

export function InfoIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={SW} />
      <Line x1={12} y1={11} x2={12} y2={16.5} stroke={color} strokeWidth={SW} strokeLinecap="round" />
      <Circle cx={12} cy={7.6} r={1.2} fill={color} />
    </Svg>
  );
}

export function LockIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={9} rx={2.5} stroke={color} strokeWidth={SW} />
      <Path d="M8 11 V8 a4 4 0 0 1 8 0 V11" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5 L10 17.5 L19 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  Week: WeekIcon,
  Grid: GridIcon,
  Goals: GoalsIcon,
  Memories: MemoriesIcon,
};

export function TabIcon({ name, ...props }: IconProps & { name: string }) {
  const Cmp = ICONS[name] ?? WeekIcon;
  return <Cmp {...props} />;
}
