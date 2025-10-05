import { Image, StyleSheet, useColorScheme } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/theme';
import { trpc } from '@/utils/trpc';
import { Button } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

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

export default function TabTwoScreen() {
  const data = useQuery(trpc.getReports.queryOptions());
  const isDark = useColorScheme() === 'dark';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#000' }}
      headerImage={
        <Image source={require('../../assets/images/icon (2).png')} style={{ width: '100%', height: 100, marginTop: 32 }} contentFit="cover" />
      }
    >
      <ThemedView lightColor="#fff" darkColor="#000" style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: Palette.accentPink }]}>Recent Reports</Text>
          <Button onPress={() => data.refetch()}>Refetch</Button>
        </View>

        {data.isLoading && <Text style={styles.infoText}>Loading reports...</Text>}
        {data.error && <Text style={styles.errorText}>Failed to load reports</Text>}

        {data.data?.length === 0 && !data.isLoading && (
          <Text style={styles.infoText}>No reports yet.</Text>
        )}

        {data.data?.map((report, idx) => {
          const parsed = new Date(report.date);
          const dateDisplay = isNaN(parsed.getTime()) ? report.date : parsed.toLocaleString();
          const authorDisplay = report.user?.email || 'Admin';
          const border = pickColor(idx);
          return (
            <View
              key={report.reportId}
              style={[
                styles.reportCard,
                {
                  borderColor: border,
                  backgroundColor: isDark ? '#000' : '#fff',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.reportDate, { color: isDark ? '#EEE' : '#111' }]}>{dateDisplay}</Text>
                <View style={[styles.badge, { backgroundColor: border }]}>
                  <Text style={styles.badgeText}>{authorDisplay === 'Admin' ? 'ADMIN' : 'USER'}</Text>
                </View>
              </View>
              <Text style={styles.metaText}>Source: {authorDisplay}</Text>
              <Text style={styles.metaText}>Line: {report.lineNumber ?? 'not set'}</Text>
              <Link
                href="/(tabs)/antek"
                style={[
                  styles.mapLink,
                  { color: border, alignSelf: 'flex-end' },
                ]}
              >
                View on Map
              </Link>
            </View>
          );
        })}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  titleText: { fontSize: 20, fontWeight: '600', color: '#EEE' },
  reportCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  reportDate: { fontSize: 16, fontWeight: '600', color: '#EEE' },
  metaText: { fontSize: 14, color: '#CCC', marginTop: 2 },
  infoText: { fontSize: 14, color: '#AAA', marginVertical: 8 },
  errorText: { fontSize: 14, color: '#ff6b6b', marginVertical: 8 },
  container: { paddingBottom: 24, paddingHorizontal: 12 },
  screenTitle: { fontSize: 24, fontWeight: 'bold' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  mapLink: { marginTop: 12, fontWeight: '600' },
});
