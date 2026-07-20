import React, { useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { TOTAL_WEEKS, WEEKS_PER_YEAR } from '../lib/calc';
import { C, F } from '../theme';

/** Width reserved on the left for the age labels. */
export const GRID_LABEL_GUTTER = 24;

// the grid is split into sub-grids: 13-week quarters across, decades down
const QUARTER = 13;
const DECADE = 10;
export const BLOCK_GAP = 4; // extra gap between sub-grids (both axes)
export const HBLOCKS = Math.floor((WEEKS_PER_YEAR - 1) / QUARTER); // inter-block gaps per row (3)

const LABEL_STYLE = { fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: 0.5 } as const;

type CellKind = 'ink' | 'inkStart' | 'thisWeek' | 'slate' | 'amber' | 'pencil';

function kindStyle(kind: CellKind) {
  switch (kind) {
    case 'ink':
      return { backgroundColor: C.ink };
    case 'inkStart':
      return { backgroundColor: C.ink, borderWidth: 1.5, borderColor: C.green };
    case 'thisWeek':
      return { backgroundColor: C.paper, borderWidth: 1, borderColor: C.ink };
    case 'slate':
      return { backgroundColor: C.slate };
    case 'amber':
      return { backgroundColor: C.amber };
    case 'pencil':
    default:
      return { backgroundColor: C.pencil, borderWidth: 0.5, borderColor: C.pencilBorder };
  }
}

export type LifeGridProps = {
  lived: number;
  primeEnd: number;
  proxLeft: number;
  prime: boolean;
  prox: boolean;
  /** absolute week indices that have a saved record → tappable */
  recordWeeks?: Set<number>;
  onCellPress?: (weekIndex: number) => void;
  /** the week the app was first opened — ink with a green outline */
  installWeek?: number | null;
  cell?: number;
  gap?: number;
};

function classify(i: number, p: LifeGridProps): CellKind {
  if (p.installWeek != null && i === p.installWeek) return 'inkStart'; // where you started Ink
  if (i < p.lived) return 'ink';
  if (i === p.lived) return 'thisWeek';
  if (p.prox && i <= p.lived + p.proxLeft) return 'slate';
  if (p.prime && i < p.primeEnd) return 'amber';
  return 'pencil';
}

function LifeGridImpl(props: LifeGridProps) {
  const { width } = useWindowDimensions();
  const gap = props.gap ?? 1.4;
  const auto = Math.max(4, Math.floor((Math.min(width, 460) - 44 - GRID_LABEL_GUTTER - HBLOCKS * BLOCK_GAP - (WEEKS_PER_YEAR - 1) * gap) / WEEKS_PER_YEAR));
  const size = props.cell ?? auto;
  const { recordWeeks, onCellPress } = props;
  const years = TOTAL_WEEKS / WEEKS_PER_YEAR; // 80

  // fixed-height gutter; the label is absolutely positioned so it never inflates the row
  const gutter = (label?: number) => (
    <View style={{ width: GRID_LABEL_GUTTER, height: size }}>
      {label != null ? (
        <Text style={[LABEL_STYLE, { position: 'absolute', right: 6, top: (size - 11) / 2 }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );

  const rows = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let y = 0; y < years; y++) {
      const cells: React.ReactNode[] = [];
      for (let w = 0; w < WEEKS_PER_YEAR; w++) {
        const i = y * WEEKS_PER_YEAR + w;
        const kind = classify(i, props);
        const base = {
          width: size,
          height: size,
          borderRadius: Math.max(1, size * 0.18),
          marginRight: w === WEEKS_PER_YEAR - 1 ? 0 : (w + 1) % QUARTER === 0 ? BLOCK_GAP : gap,
        };
        const tappable = !!(recordWeeks && onCellPress && recordWeeks.has(i));
        if (tappable) {
          cells.push(<Pressable key={w} hitSlop={4} onPress={() => onCellPress!(i)} style={[base, kindStyle(kind)]} />);
        } else {
          cells.push(<View key={w} style={[base, kindStyle(kind)]} />);
        }
      }
      const decadeStart = y % DECADE === 0;
      out.push(
        <View key={y} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: gap, marginTop: decadeStart && y !== 0 ? BLOCK_GAP : 0 }}>
          {gutter(decadeStart ? y : undefined)}
          {cells}
        </View>
      );
    }
    // closing age label at the very bottom (e.g. 80)
    out.push(
      <View key="end" style={{ flexDirection: 'row', alignItems: 'center' }}>
        {gutter(years)}
      </View>
    );
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, gap, years, props.lived, props.prime, props.prox, props.proxLeft, props.primeEnd, props.installWeek, recordWeeks, onCellPress]);

  return <View style={{ alignItems: 'flex-start' }}>{rows}</View>;
}

export const LifeGrid = React.memo(LifeGridImpl);
