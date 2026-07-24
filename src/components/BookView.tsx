import React, { useState } from 'react';
import { FlatList, Image, Pressable, useWindowDimensions, View } from 'react-native';
import { fmt, weekDateRange } from '../lib/calc';
import { WeekRecord } from '../store/types';
import { C } from '../theme';
import { Stars } from './Stars';
import { Mono, Serif } from './Type';

/**
 * Memories as a book: one inked week per page, oldest first, swiped like turning
 * pages. Weeks without a photo still get a page — the sentence carries it.
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
  const pageW = width - 44; // Screen's horizontal padding
  const [page, setPage] = useState(0);
  const pages = [...records].sort((a, b) => a.weekIndex - b.weekIndex);

  if (pages.length === 0) {
    return (
      <Serif size={16} italic color={C.muted} style={{ paddingVertical: 24 }}>
        The book is empty. Ink a week to write the first page.
      </Serif>
    );
  }

  return (
    <View>
      <FlatList
        data={pages}
        keyExtractor={(r) => String(r.weekIndex)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageW}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / pageW))}
        style={{ marginHorizontal: 0 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenWeek(item.weekIndex)} style={{ width: pageW }}>
            <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, overflow: 'hidden', marginRight: 0 }}>
              {item.photos[0] ? (
                <Image source={{ uri: item.photos[0] }} style={{ width: '100%', height: 210, backgroundColor: C.pencil }} />
              ) : (
                <View style={{ width: '100%', height: 110, backgroundColor: C.pencil, alignItems: 'center', justifyContent: 'center' }}>
                  <Mono size={9} spacing={0.16} color={C.faint}>
                    NO PHOTO THIS WEEK
                  </Mono>
                </View>
              )}
              <View style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Mono size={9.5} spacing={0.16}>
                    WEEK {fmt(item.weekIndex + 1)}
                  </Mono>
                  <Stars value={item.rating} size={13} />
                </View>
                <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginBottom: 12 }}>
                  {weekDateRange(birthYear, item.weekIndex)}
                </Mono>
                <Serif size={19} italic style={{ lineHeight: 28, minHeight: 56 }}>
                  “{item.sentence || '…'}”
                </Serif>
                {item.seed && (
                  <Mono size={7.5} spacing={0.14} color={C.faint} style={{ marginTop: 10 }}>
                    EXAMPLE
                  </Mono>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
      <Mono size={8.5} spacing={0.16} color={C.faint} style={{ textAlign: 'center', marginTop: 12 }}>
        PAGE {page + 1} OF {pages.length} · SWIPE
      </Mono>
    </View>
  );
}
