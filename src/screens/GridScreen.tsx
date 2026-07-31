import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, View } from 'react-native';
import { OverlayToggle, Swatch } from '../components/Bits';
import { GRID_LABEL_GUTTER, HBLOCKS, LifeGrid, VBLOCKS } from '../components/LifeGrid';
import { Screen } from '../components/Screen';
import { Mono, Serif } from '../components/Type';
import { fmt, LIFE_YEARS, WEEKS_PER_YEAR } from '../lib/calc';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';

const ZOOMS = [1, 2, 3, 4];

// gaps are a fraction of the cell, so the grid keeps its proportions at any size
const GAP_R = 0.32; // between weeks
const BLOCK_R = 1; // between the 13-week / 10-year blocks

// the grid's width and height in "cell units" — used to solve for the cell size
// that makes the whole grid fit the space it's given
const W_UNITS = WEEKS_PER_YEAR + (WEEKS_PER_YEAR - 1) * GAP_R + HBLOCKS * BLOCK_R;
const H_UNITS = LIFE_YEARS + 1 + LIFE_YEARS * GAP_R + VBLOCKS * BLOCK_R;

export function GridScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, toggleOverlay } = useStore();
  const [zoom, setZoom] = useState(1);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // always open the grid at the full 1× overview, even after a previous zoom
  useFocusEffect(useCallback(() => setZoom(1), []));

  const onBox = useCallback((e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setBox((b) => (b && Math.abs(b.w - w) < 1 && Math.abs(b.h - h) < 1 ? b : { w, h }));
  }, []);

  // fit the grid to the gap the header and footer leave behind, so the page
  // never scrolls — the legend and the widget button are always in view
  const cell = useMemo(() => {
    if (!box) return 0;
    const fit = Math.min((box.w - GRID_LABEL_GUTTER) / W_UNITS, box.h / H_UNITS);
    return Math.max(2, Math.floor(fit * 4) / 4);
  }, [box]);

  const recordWeeks = useMemo(() => new Set(state.records.map((r) => r.weekIndex)), [state.records]);

  const onCellPress = useCallback((i: number) => nav.navigate('WeekDetail', { weekIndex: i }), [nav]);

  const grid =
    cell > 0 ? (
      <LifeGrid
        lived={calc.lived}
        primeEnd={calc.primeEnd}
        proxLeft={calc.proxLeft}
        prime={state.overlays.prime}
        prox={state.overlays.prox}
        recordWeeks={recordWeeks}
        onCellPress={onCellPress}
        installWeek={state.installWeekIndex}
        cell={cell * zoom}
        gap={cell * zoom * GAP_R}
        blockGap={cell * zoom * BLOCK_R}
      />
    ) : null;

  return (
    <Screen scroll={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
        <Serif size={30} weight="medium">
          The Grid
        </Serif>
        <Mono size={9} spacing={0.16} color={C.faint} style={{ marginBottom: 7 }}>
          80 YEARS × 52 WEEKS
        </Mono>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <OverlayToggle active={state.overlays.prime} color={C.amber} label={`PRIME · ${fmt(calc.primeLeft)}`} onPress={() => toggleOverlay('prime')} />
        <OverlayToggle active={state.overlays.prox} color={C.slate} label={`PROX · ${fmt(calc.proxLeft)}`} onPress={() => toggleOverlay('prox')} />
      </View>

      {/* zoom controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Mono size={9} spacing={0.12} color={C.muted}>
          TAP AN INKED WEEK TO OPEN IT
        </Mono>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ZoomBtn label="−" disabled={zoom === ZOOMS[0]} onPress={() => setZoom((z) => Math.max(ZOOMS[0], z - 1))} />
          <Mono size={11} spacing={0.1} color={C.ink} medium>
            {zoom}×
          </Mono>
          <ZoomBtn label="+" disabled={zoom === ZOOMS[ZOOMS.length - 1]} onPress={() => setZoom((z) => Math.min(ZOOMS[ZOOMS.length - 1], z + 1))} />
        </View>
      </View>

      {/* the grid takes whatever height is left; zoomed in, it pans inside that box */}
      <View style={{ flex: 1, overflow: 'hidden' }} onLayout={onBox}>
        {zoom === 1 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{grid}</View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {grid}
            </ScrollView>
          </ScrollView>
        )}
      </View>

      <View style={{ paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          <LegendItem color={C.ink} label="INK" />
          <LegendItem color={C.pencil} ring={C.pencilBorder} label="PENCIL" />
          <LegendItem color={C.amber} label="PRIME" />
          <LegendItem color={C.paper} ring={C.ink} label="THIS WEEK" />
          <LegendItem color={C.ink} ring={C.green} label="STARTED HERE" />
        </View>

        <Pressable
          onPress={() => nav.navigate('Widgets')}
          style={{ marginTop: 12, borderWidth: 1, borderColor: C.inputLine, borderRadius: 10, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Mono size={10} spacing={0.16} color={C.ink}>
            ADD WIDGETS
          </Mono>
          <Serif size={16} color={C.ink} style={{ lineHeight: 16 }}>
            →
          </Serif>
        </Pressable>
      </View>
    </Screen>
  );
}

function ZoomBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: disabled ? C.inputLine : C.ink,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Serif size={19} color={C.ink} style={{ lineHeight: 21 }}>
        {label}
      </Serif>
    </Pressable>
  );
}

function LegendItem({ color, ring, label }: { color: string; ring?: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Swatch color={color} size={8} ring={ring} />
      <Mono size={8.5} spacing={0.1}>
        {label}
      </Mono>
    </View>
  );
}
