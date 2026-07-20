import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { OverlayToggle, Swatch } from '../components/Bits';
import { LifeGrid } from '../components/LifeGrid';
import { Screen } from '../components/Screen';
import { Mono, Serif } from '../components/Type';
import { fmt, WEEKS_PER_YEAR } from '../lib/calc';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';
import { Pressable, useWindowDimensions } from 'react-native';

const GAP = 1.3;
const ZOOMS = [1, 2, 3, 4];

export function GridScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, toggleOverlay } = useStore();
  const { width } = useWindowDimensions();
  const [zoom, setZoom] = useState(1);

  // always open the grid at the full 1× overview, even after a previous zoom
  useFocusEffect(useCallback(() => setZoom(1), []));

  const baseCell = Math.max(4, Math.floor((Math.min(width, 460) - 44 - (WEEKS_PER_YEAR - 1) * GAP) / WEEKS_PER_YEAR));
  const cell = baseCell * zoom;

  const recordWeeks = useMemo(() => new Set(state.records.map((r) => r.weekIndex)), [state.records]);

  const onCellPress = useCallback((i: number) => nav.navigate('WeekDetail', { weekIndex: i }), [nav]);

  const grid = (
    <LifeGrid
      lived={calc.lived}
      primeEnd={calc.primeEnd}
      proxLeft={calc.proxLeft}
      prime={state.overlays.prime}
      prox={state.overlays.prox}
      recordWeeks={recordWeeks}
      onCellPress={onCellPress}
      installWeek={state.installWeekIndex}
      cell={cell}
      gap={GAP}
    />
  );

  return (
    <Screen>
      <Serif size={30} weight="medium" style={{ marginBottom: 12 }}>
        The Grid
      </Serif>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <OverlayToggle active={state.overlays.prime} color={C.amber} label={`PRIME · ${fmt(calc.primeLeft)}`} onPress={() => toggleOverlay('prime')} />
        <OverlayToggle active={state.overlays.prox} color={C.slate} label={`PROX · ${fmt(calc.proxLeft)}`} onPress={() => toggleOverlay('prox')} />
      </View>
      <Mono size={9} spacing={0.12} color={C.muted} style={{ marginBottom: 14 }}>
        TAP EACH TO SHADE ITS WINDOW ON THE GRID
      </Mono>

      {/* zoom controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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

      {zoom === 1 ? (
        <View style={{ alignItems: 'center' }}>{grid}</View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
          {grid}
        </ScrollView>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 16 }}>
        <LegendItem color={C.ink} label="INK" />
        <LegendItem color={C.pencil} ring={C.pencilBorder} label="PENCIL" />
        <LegendItem color={C.amber} label="PRIME" />
        <LegendItem color={C.paper} ring={C.ink} label="THIS WEEK" />
        <LegendItem color={C.ink} ring={C.green} label="STARTED HERE" />
      </View>

      <Mono size={9.5} spacing={0.16} color={C.faint} style={{ textAlign: 'center', marginTop: 18 }}>
        90 YEARS × 52 WEEKS · EACH BOX IS ONE WEEK
      </Mono>
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
