import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/theme';
import { trpc } from '@/utils/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@react-navigation/elements';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken).catch(()=>setToken(null));
  }, []);
  const reportQueryOptions = trpc.getReports.queryOptions({ toke: token || undefined });
  const reportQueryKey = reportQueryOptions.queryKey;
  const data = useQuery({ ...reportQueryOptions });
  const upvoter=useMutation(trpc.upvote.mutationOptions());
  const downvoter=useMutation(trpc.downovote.mutationOptions());
  const isDark = useColorScheme() === 'dark';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#000' }}
      headerImage={
  <Image source={require('../../assets/images/icon (2).png')} style={{ width: '100%', height: 100, marginTop: 32 }} />
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

        {(() => {
          // Build a memoized map of userId -> total score across their reports
          const userTotals = useMemo(() => {
            const totals: Record<string, number> = {};
            (data.data || []).forEach((r: any) => {
              if (r.user) {
                const id = r.user.userId;
                const s = typeof r.score === 'number' ? r.score : 0;
                totals[id] = (totals[id] || 0) + s;
              }
            });
            return totals;
          }, [data.data]);

          return data.data?.map((report: any, idx: number) => {
          const parsed = new Date(report.date);
          const dateDisplay = isNaN(parsed.getTime()) ? report.date : parsed.toLocaleString();
          const authorDisplay = report.user?.email || 'Admin';
          const border = pickColor(idx);
          // Determine badge text: total score for user or ADMIN
          const badgeText = report.user ? String(userTotals[report.user.userId] ?? 0) : 'ADMIN';
          const isAdminPost = !report.user; // admin posts have no associated user object
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
                  <Text style={styles.badgeText}>{badgeText}</Text>
                </View>
              </View>
              <Text style={styles.metaText}>Source: {authorDisplay}</Text>
              <Text style={styles.metaText}>Line: {report.lineNumber ?? 'not set'}</Text>
              <Text style={styles.metaText}>Description: {report.description || 'No description'}</Text>
              {!isAdminPost && (
                <View style={styles.voteRow}>
                  <TouchableOpacity
                    style={[
                      styles.voteButton,
                      report.userVote==='up' ? { backgroundColor: border, opacity: 1 } : { backgroundColor: border, opacity: 0.4 }
                    ]}
                    onPress={async ()=>{
                      try {
                        if(!token) return;
                        const res = await upvoter.mutateAsync({ toke: token, reportId: report.reportId });
                        queryClient.setQueryData(reportQueryKey as any, (old: any)=> Array.isArray(old) ? old.map((r:any)=> r.reportId===report.reportId ? { ...r, score: res.score, userVote: res.userVote } : r) : old);
                      } catch(e){
                        console.log('upvote error', e);
                      }
                    }}
                  >
                    <Text style={styles.voteText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.scoreText}>{(report as any).score ?? 0}</Text>
                  <TouchableOpacity
                    style={[
                      styles.voteButton,
                      report.userVote==='down' ? { backgroundColor: border, opacity: 1 } : { backgroundColor: border, opacity: 0.4 }
                    ]}
                    onPress={async ()=>{
                      try {
                        if(!token) return;
                        const res = await downvoter.mutateAsync({ toke: token, reportId: report.reportId });
                        queryClient.setQueryData(reportQueryKey as any, (old: any)=> Array.isArray(old) ? old.map((r:any)=> r.reportId===report.reportId ? { ...r, score: res.score, userVote: res.userVote } : r) : old);
                      } catch(e){
                        console.log('downvote error', e);
                      }
                    }}
                  >
                    <Text style={styles.voteText}>▼</Text>
                  </TouchableOpacity>
                </View>
              )}
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
        });})()}
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
  voteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  voteButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  voteText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scoreText: { fontSize: 16, fontWeight: '700', color: '#888', minWidth: 30, textAlign: 'center' },
});
