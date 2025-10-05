
import { Palette } from '@/constants/theme';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { client } from '../utils/trpcClient';

function pickColor(index?: number) {
  const colors = [
    Palette.accentPink,
    Palette.accentGreen,
    Palette.accentYellow,
    Palette.accentBlue,
    Palette.accentPurple,
  ];
  if (typeof index === 'number') {
    return colors[index % colors.length];
  }
  return colors[Math.floor(Math.random() * colors.length)];
}

function Card({ title, body, borderColor }: { title: string; body: string; borderColor?: string }) {
  const border = borderColor ?? pickColor();
  const isDarkTheme = useColorScheme() ==='dark';

  return (
    <View
      style={{
        backgroundColor: isDarkTheme?'#000':'#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: isDarkTheme?'#EEE':'#111' }}>{title}</Text>
      <Text style={{ fontSize: 14, color: '#555' }}>{body}</Text>
    </View>
  );
}

function WelcomeContent() {
  const [name, setName] = useState('User');
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setName(token);
      }
    })()
  }, []);
  const isDarkTheme = useColorScheme() ==='dark';
  const { data: reports, isLoading, error } = useQuery<any[], Error>({
    queryKey: ['reports'],
    queryFn: () => client.getReports.query(),
    refetchInterval: 60_000, // refetch every minute
    refetchOnWindowFocus: true,
  });

  const cards = (reports ?? []).map((r: any) : { title: string; body: string } => ({
    title: `Report ${r.reportId}`,
    body: `Location: ${r.location}\nDate: ${r.date}\n${r.description ?? ''}`,
  }));

  return (
    <ThemedView lightColor="#fff" darkColor="#000">
      
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: Palette.accentPink }}>
        Welcome {name}
      </Text>
      {isLoading ? (
        <Text>Loading reports...</Text>
      ) : error ? (
        <Text>Error loading reports</Text>
      ) : (
        cards.map((c, idx) => (
          <Card key={idx} title={c.title} body={c.body} borderColor={pickColor(idx)} />
        ))
      )}
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <TouchableOpacity
          onPress={() => console.log('Action A')}
          style={{
            backgroundColor: Palette.accentPink,
            paddingVertical: 12,
            borderRadius: 10,
            width: '70%',
            maxWidth: 360,
            alignItems: 'center',
            marginBottom: 12,
          }}>
          <Text style={{ color: isDarkTheme?'#fff':'#000', fontWeight: '700' }}>Action A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log('Action B')}
          style={{
            backgroundColor: Palette.accentBlue,
            paddingVertical: 12,
            borderRadius: 10,
            width: '70%',
            maxWidth: 360,
            alignItems: 'center',
          }}>
          <Text style={{ color: isDarkTheme?'#fff':'#000', fontWeight: '700' }}>Action B</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function HomeScreen() {
  return (
    
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#000' }}
      headerImage={
        <Image
          source={{ uri: 'https://nipo.pl/wp-content/uploads/2015/09/Ma%C5%82opolska-nowe-logo-poziom.jpg' }}
          style={{ width: '100%', height: 100, marginTop: 32}}
          contentFit="cover"
        />
      }>
      <WelcomeContent />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
