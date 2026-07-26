import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, PanResponder, Pressable, useWindowDimensions, View } from 'react-native';
import { fmt, weekDateRange } from '../lib/calc';
import { WeekRecord } from '../store/types';
import { C } from '../theme';
import { Stars } from './Stars';
import { Mono, Serif } from './Type';

/**
 * Memories as a real book: one inked week per page, oldest first. Turn a page by
 * dragging it or tapping the ‹ › controls — the page swings on the spine (3D
 * rotateY) and reveals the next. Tap a page to open that week.
 */
export function BookView({
  records,
  birthYear,
  onOpenWeek,
}: {
  records: WeekRecord[];
  birthYear: number;
  onOpenWeek: (weekIndex: number) => void;
}) {
  const { width } = useWindowDimensions();
  const pageW = width - 44; // matches Screen's horizontal padding
  const pageH = Math.max(340, Math.min(pageW * 1.32, 560));

  const pages = useMemo(() => [...records].sort((a, b) => a.weekIndex - b.weekIndex), [records]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev' | null>(null);
  const turn = useRef(new Animated.Value(0)).current; // 0..1 progress of the current turn
  const progress = useRef(0);
  const animating = useRef(false);

  const indexRef = useRef(0);
  indexRef.current = index;
  const dirRef = useRef<'next' | 'prev' | null>(null);
  dirRef.current = dir;

  const clampIndex = (i: number) => Math.max(0, Math.min(pages.length - 1, i));
  const canGo = (d: 'next' | 'prev') => (d === 'next' ? indexRef.current < pages.length - 1 : indexRef.current > 0);

  // animate a turn to completion (commit) from wherever it currently is
  const runFlip = (direction: 'next' | 'prev', startAt = 0) => {
    if (!canGo(direction) || animating.current) return;
    animating.current = true;
    setDir(direction);
    turn.setValue(startAt);
    Animated.timing(turn, { toValue: 1, duration: Math.round(300 * (1 - startAt)) + 90, useNativeDriver: false }).start(() => {
      setIndex((i) => clampIndex(direction === 'next' ? i + 1 : i - 1));
      turn.setValue(0);
      progress.current = 0;
      setDir(null);
      animating.current = false;
    });
  };

  const cancelFlip = () => {
    animating.current = true;
    Animated.timing(turn, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
      progress.current = 0;
      setDir(null);
      animating.current = false;
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) => !animating.current && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_e, g) => {
        const d: 'next' | 'prev' = g.dx < 0 ? 'next' : 'prev';
        if (!canGo(d)) return;
        if (dirRef.current !== d) setDir(d);
        const p = Math.min(1, Math.abs(g.dx) / pageW);
        progress.current = p;
        turn.setValue(p);
      },
      onPanResponderRelease: (_e, g) => {
        const d = dirRef.current;
        if (!d) return;
        if (progress.current > 0.32 || Math.abs(g.vx) > 0.4) runFlip(d, progress.current);
        else cancelFlip();
      },
      onPanResponderTerminate: () => {
        if (dirRef.current) cancelFlip();
      },
    })
  ).current;

  if (pages.length === 0) {
    return (
      <Serif size={16} italic color={C.muted} style={{ paddingVertical: 24 }}>
        The book is empty. Ink a week to write the first page.
      </Serif>
    );
  }

  // which page sits under the turning one, and which page is turning
  const basePage = dir === 'next' ? pages[clampIndex(index + 1)] : pages[index];
  const topPage = dir === 'prev' ? pages[clampIndex(index - 1)] : pages[index];

  const rotateY = turn.interpolate({
    inputRange: [0, 1],
    outputRange: dir === 'prev' ? ['-180deg', '0deg'] : ['0deg', '-180deg'],
  });
  const shade = turn.interpolate({ inputRange: [0, 0.5, 1], outputRange: dir === 'prev' ? [0.35, 0.18, 0] : [0, 0.18, 0.35] });

  return (
    <View>
      <View style={{ width: pageW, height: pageH, alignSelf: 'center' }} {...pan.panHandlers}>
        {/* spine shadow */}
        <View style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 10, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, backgroundColor: '#000', opacity: 0.35 }} />

        {/* base page (revealed) */}
        <View style={{ position: 'absolute', width: pageW, height: pageH }}>
          <Page record={dir ? basePage : pages[index]} birthYear={birthYear} onOpen={onOpenWeek} h={pageH} />
        </View>

        {/* turning page */}
        {dir && (
          <Animated.View
            style={{
              position: 'absolute',
              width: pageW,
              height: pageH,
              backfaceVisibility: 'hidden',
              transformOrigin: 'left center',
              transform: [{ perspective: 1400 }, { rotateY }],
            }}
          >
            <Page record={topPage} birthYear={birthYear} onOpen={onOpenWeek} h={pageH} />
            <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: '#000', opacity: shade }} />
          </Animated.View>
        )}
      </View>

      {/* turn controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 14 }}>
        <Arrow label="‹" disabled={index === 0} onPress={() => runFlip('prev')} />
        <Mono size={8.5} spacing={0.16} color={C.faint} style={{ minWidth: 118, textAlign: 'center' }}>
          PAGE {index + 1} OF {pages.length}
        </Mono>
        <Arrow label="›" disabled={index === pages.length - 1} onPress={() => runFlip('next')} />
      </View>
    </View>
  );
}

function Arrow({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={10}
      style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: disabled ? C.inputLine : C.ink, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}
    >
      <Serif size={20} color={C.ink} style={{ lineHeight: 22 }}>
        {label}
      </Serif>
    </Pressable>
  );
}

function Page({ record, birthYear, onOpen, h }: { record: WeekRecord; birthYear: number; onOpen: (weekIndex: number) => void; h: number }) {
  const photoH = Math.round(h * 0.54);
  return (
    <Pressable onPress={() => onOpen(record.weekIndex)} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, overflow: 'hidden' }}>
        {record.photos[0] ? (
          <Image source={{ uri: record.photos[0] }} style={{ width: '100%', height: photoH, backgroundColor: C.pencil }} />
        ) : (
          <View style={{ width: '100%', height: Math.round(photoH * 0.5), backgroundColor: C.pencil, alignItems: 'center', justifyContent: 'center' }}>
            <Mono size={9} spacing={0.16} color={C.faint}>
              NO PHOTO THIS WEEK
            </Mono>
          </View>
        )}
        <View style={{ flex: 1, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Mono size={9.5} spacing={0.16}>
              WEEK {fmt(record.weekIndex + 1)}
            </Mono>
            <Stars value={record.rating} size={13} />
          </View>
          <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginBottom: 12 }}>
            {weekDateRange(birthYear, record.weekIndex)}
          </Mono>
          <Serif size={19} italic style={{ lineHeight: 28 }}>
            “{record.sentence || '…'}”
          </Serif>
          <View style={{ flex: 1 }} />
          {record.seed && (
            <Mono size={7.5} spacing={0.14} color={C.faint}>
              EXAMPLE
            </Mono>
          )}
        </View>
      </View>
    </Pressable>
  );
}
