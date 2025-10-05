
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { trpc } from '@/utils/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';


function WelcomeContent() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken).catch(() => setToken(null));
  }, []);

  const userQuery = useQuery(trpc.userInfo.queryOptions({ toke: token ?? '' }));
  const isDark = useColorScheme() === 'dark';
  const accent = Palette.accentPink;

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={[styles.heading, { color: accent }]}>Dashboard</ThemedText>
      <ThemedText type="subtitle" style={styles.subheading}>Welcome back{userQuery.data?.email ? ',' : ''} {userQuery.data?.email}</ThemedText>

      <View
        style={[
          styles.card,
          {
            borderColor: accent,
            backgroundColor: isDark ? '#000' : '#fff',
          },
        ]}
      >
        {userQuery.isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={accent} />
            <ThemedText style={styles.loadingText}>Loading your profile...</ThemedText>
          </View>
        )}
        {userQuery.error && !userQuery.isLoading && (
          <ThemedText style={styles.errorText}>Could not load user info.</ThemedText>
        )}
        {!userQuery.isLoading && !userQuery.error && (
          <>
            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{userQuery.data?.email || '—'}</ThemedText>
            <ThemedText style={[styles.infoLabel, { marginTop: 12 }]}>Reputation</ThemedText>
            <ThemedText style={styles.reputation}>{userQuery.data?.score ?? 0}</ThemedText>
          </>
        )}
        {!token && !userQuery.isLoading && (
          <ThemedText style={styles.noticeText}>You are not logged in. Please sign in to see personalized data.</ThemedText>
        )}
      </View>


      <View
        style={[
          styles.card,
          {
            borderColor: accent,
            backgroundColor: isDark ? '#050505' : '#fff',
            marginTop: 4,
          },
        ]}
      >
        <ThemedText style={styles.rewardTitle}>Reward Offer</ThemedText>
        <ThemedText style={styles.rewardText}>Spend 500 points to get a free ticket.</ThemedText>
        <View style={styles.Button}>
          <ThemedText style={styles.ButtonText}>Redeem</ThemedText>
        </View>

      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (

    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#000' }}
      headerImage={
        <Image source={require('../../assets/images/icon (2).png')} style={{ width: '100%', height: 100, marginTop: 32 }} contentFit="cover" />
      }>
      <WelcomeContent />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingHorizontal: 12,
    gap: 12,
  },
  heading: {
    letterSpacing: 0.5,
  },
  subheading: {
    marginTop: 4,
    fontSize: 18,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 14, opacity: 0.8 },
  errorText: { fontSize: 14, color: '#ff6b6b' },
  infoLabel: { fontSize: 12, textTransform: 'uppercase', opacity: 0.6, letterSpacing: 1 },
  infoValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  reputation: { fontSize: 28, fontWeight: '700', paddingTop: 4 },
  noticeText: { marginTop: 16, fontSize: 13, opacity: 0.7 },
  rewardTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 },
  rewardText: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  Button: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: Palette.accentPink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.85,
  },
  ButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});