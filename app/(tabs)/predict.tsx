// ...existing code...
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/theme';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function pickColor(index?: number) {
  const colors = [
    Palette.accentPink,
    Palette.accentGreen,
    Palette.accentYellow,
    Palette.accentBlue,
    Palette.accentPurple,
  ];
  if (typeof index === 'number') return colors[index % colors.length];
  return colors[Math.floor(Math.random() * colors.length)];
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PredictionsScreen() {
  const data = useQuery(trpc.getReports.queryOptions());
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  // compute previous 7 days window (last 7 * 24h ending now)
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // aggregate reports by line and by weekday (0..6 where 1=Mon..7=Sun mapped)
  const predictions = React.useMemo(() => {
    const map: Record<
      string,
      {
        weekdaySet: Set<number>; // 0..6 for Mon..Sun
        countsByWeekday: number[]; // index 0..6
        total: number;
      }
    > = {};

    (data.data ?? []).forEach((r) => {
      const parsed = new Date(r.date);
      if (isNaN(parsed.getTime())) return;
      if (parsed < weekStart || parsed > now) return;

      const lineKey = r.lineNumber != null ? String(r.lineNumber) : 'unknown';

      // JS getDay(): 0=Sun,1=Mon,...6=Sat. We want Mon=0..Sun=6
      const jsDay = parsed.getDay(); // 0..6 (Sun..Sat)
      const weekdayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 .. Sun=6

      if (!map[lineKey]) map[lineKey] = { weekdaySet: new Set(), countsByWeekday: Array(7).fill(0), total: 0 };
      map[lineKey].weekdaySet.add(weekdayIdx);
      map[lineKey].countsByWeekday[weekdayIdx] += 1;
      map[lineKey].total += 1;
    });

    return Object.entries(map).map(([line, info]) => {
      // For each weekday next week, predicted percent = (did last week have >=1 report on that weekday) ? 100 : 0
      // (Projection of previous week to next week)
      const perDay = WEEKDAYS.map((wd, i) => {
        const has = info.weekdaySet.has(i);
        const percent = has ? 100 : 0;
        const count = info.countsByWeekday[i] ?? 0;
        return { weekday: wd, percent, count };
      });

      return {
        line,
        totalReportsLastWeek: info.total,
        perDay, // array of 7 { weekday, percent, count }
      };
    }).sort((a, b) => b.totalReportsLastWeek - a.totalReportsLastWeek);
  }, [data.data, weekStart, now]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#000' }}
      headerImage={null}
    >
      <ThemedView
        lightColor="#fff"
        darkColor="#000"
        style={[styles.container, { paddingBottom: 16 + Math.max(0, insets.bottom) }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: Palette.accentPink }]}>Predicted Delays — Next Week (by day)</Text>
        </View>

        {data.isLoading && <Text style={styles.infoText}>Loading reports...</Text>}
        {data.error && <Text style={styles.errorText}>Failed to load reports</Text>}

        {predictions.length === 0 && !data.isLoading && (
          <Text style={styles.infoText}>No recent reports to base predictions on.</Text>
        )}

        {predictions.map((p, idx) => {
          const color = pickColor(idx);
          return (
            <View key={p.line + idx} style={[styles.card, { borderColor: color, backgroundColor: isDark ? '#000' : '#fff' }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.lineText, { color: isDark ? '#EEE' : '#111' }]}>Line: {p.line}</Text>
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{p.totalReportsLastWeek}</Text>
                </View>
              </View>

              <Text style={styles.metaText}>Projected probability of delay for each day next week (based on last week)</Text>

              {p.perDay.map((d, di) => (
                <View key={p.line + '_' + di} style={styles.dayRow}>
                  <Text style={[styles.dayLabel, { color: isDark ? '#EEE' : '#111' }]}>{d.weekday}</Text>
                  <View style={styles.dayMeta}>
                    <Text style={styles.smallText}>{d.count} reports</Text>
                    <Text style={[styles.smallText, { marginLeft: 8 }]}>{d.percent}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${d.percent}%`, backgroundColor: color }]} />
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24, paddingHorizontal: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  screenTitle: { fontSize: 20, fontWeight: '700' },
  infoText: { fontSize: 14, color: '#AAA', marginVertical: 8 },
  errorText: { fontSize: 14, color: '#ff6b6b', marginVertical: 8 },

  card: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineText: { fontSize: 16, fontWeight: '600' },
  metaText: { fontSize: 13, color: '#888', marginTop: 6, marginBottom: 6 },

  dayRow: { marginTop: 8 },
  dayLabel: { fontSize: 14, fontWeight: '600' },
  dayMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 6 },
  smallText: { fontSize: 12, color: '#888' },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

  progressBarBackground: {
    height: 8,
    backgroundColor: '#222',
    opacity: 0.06,
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
});
// ...existing code...