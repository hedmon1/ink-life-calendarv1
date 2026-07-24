import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, TextInput, View } from 'react-native';
import { Card } from '../components/Bits';
import { BookView } from '../components/BookView';
import { Screen } from '../components/Screen';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { fmt } from '../lib/calc';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { WeekRecord } from '../store/types';
import { C } from '../theme';

export function MemoriesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, clearExampleMemories } = useStore();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'book'>('grid');

  const photographed = useMemo(
    () => state.records.filter((r) => r.photos.length > 0).sort((a, b) => b.weekIndex - a.weekIndex),
    [state.records]
  );

  const hasExamples = useMemo(
    () => state.records.some((r) => r.seed || r.photos.some((p) => p.includes('picsum.photos'))),
    [state.records]
  );

  const confirmClear = () =>
    Alert.alert('Clear example memories?', 'This removes the demo photos the app came with. Weeks you logged yourself stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearExampleMemories },
    ]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return photographed;
    const qNum = q.replace(/[^0-9]/g, '');
    return photographed.filter((r) => {
      const wk = String(r.weekIndex + 1);
      const numHit = qNum.length > 0 && wk.includes(qNum);
      const textHit = r.sentence.toLowerCase().includes(q);
      return numHit || textHit;
    });
  }, [photographed, q]);

  const [featured, ...rest] = filtered;

  return (
    <Screen>
      <Serif size={30} weight="medium" style={{ marginBottom: 2 }}>
        Memories
      </Serif>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <Serif size={15} italic color={C.muted} style={{ flex: 1 }}>
          {photographed.length === 0
            ? 'Nothing photographed yet.'
            : `${fmt(photographed.length)} week${photographed.length === 1 ? '' : 's'} photographed.`}
        </Serif>
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.inputLine, borderRadius: 7, overflow: 'hidden' }}>
          {(['grid', 'book'] as const).map((v) => (
            <Pressable key={v} onPress={() => setView(v)} style={{ paddingVertical: 7, paddingHorizontal: 12, backgroundColor: view === v ? C.ink : 'transparent' }}>
              <Mono size={8.5} spacing={0.14} color={view === v ? C.paper : C.muted}>
                {v.toUpperCase()}
              </Mono>
            </Pressable>
          ))}
        </View>
      </View>

      {view === 'book' && (
        <BookView
          records={state.records}
          birthYear={state.birthYear}
          onOpenWeek={(weekIndex) => nav.navigate('WeekDetail', { weekIndex })}
        />
      )}

      {view === 'grid' && (
        <>
      {hasExamples && (
        <Card style={{ borderColor: C.amber, marginBottom: 14, padding: 14 }}>
          <Mono size={9} spacing={0.18} color={C.amber} style={{ marginBottom: 4 }}>
            EXAMPLE MEMORIES
          </Mono>
          <Serif size={14.5} italic color={C.muted} style={{ marginBottom: 12 }}>
            Yours replace these.
          </Serif>
          <Pressable onPress={confirmClear} style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}>
            <Mono size={9.5} spacing={0.16} color={C.paper}>
              REMOVE EXAMPLES
            </Mono>
          </Pressable>
        </Card>
      )}

      {/* search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: C.paper,
          borderWidth: 1,
          borderColor: C.cardLine,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginBottom: 16,
        }}
      >
        <Mono size={12} color={C.faint}>
          ⌕
        </Mono>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Week number or word"
          placeholderTextColor={C.faint}
          style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: C.ink, paddingVertical: 12 }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Mono size={9} spacing={0.12} color={C.muted}>
              CLEAR
            </Mono>
          </Pressable>
        )}
      </View>

      {q.length > 0 && (
        <Mono size={9} spacing={0.16} color={C.muted} style={{ marginBottom: 12 }}>
          {filtered.length} MATCH{filtered.length === 1 ? '' : 'ES'} FOR “{query.trim().toUpperCase()}”
        </Mono>
      )}

      {filtered.length === 0 ? (
        <Serif size={16} italic color={C.muted} style={{ paddingVertical: 24 }}>
          {q.length > 0 ? `No match for “${query.trim()}”.` : 'Nothing here yet.'}
        </Serif>
      ) : (
        <>
          {/* featured only when not searching */}
          {q.length === 0 && featured && (
            <Pressable onPress={() => nav.navigate('WeekDetail', { weekIndex: featured.weekIndex })}>
              <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                <Image source={{ uri: featured.photos[0] }} style={{ width: '100%', height: 150, backgroundColor: C.pencil }} />
                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Mono size={9} spacing={0.16}>
                      WK {fmt(featured.weekIndex + 1)}
                    </Mono>
                    <Stars value={featured.rating} size={13} />
                  </View>
                  <Serif size={15.5} italic>
                    “{featured.sentence}”
                  </Serif>
                </View>
              </View>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(q.length === 0 ? rest : filtered).map((r) => (
              <MemoryTile key={r.weekIndex} record={r} onPress={() => nav.navigate('WeekDetail', { weekIndex: r.weekIndex })} />
            ))}
          </View>
        </>
      )}
        </>
      )}
    </Screen>
  );
}

function MemoryTile({ record, onPress }: { record: WeekRecord; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: '48.5%', marginBottom: 10 }}>
      <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 10, overflow: 'hidden' }}>
        <Image source={{ uri: record.photos[0] }} style={{ width: '100%', height: 86, backgroundColor: C.pencil }} />
        <View style={{ paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Mono size={8} spacing={0.12}>
            WK {fmt(record.weekIndex + 1)}
          </Mono>
          <Stars value={record.rating} size={10.5} />
        </View>
      </View>
    </Pressable>
  );
}
