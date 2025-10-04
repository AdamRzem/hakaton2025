
import { Palette } from '@/constants/theme';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';

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
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#111' }}>{title}</Text>
      <Text style={{ fontSize: 14, color: '#555' }}>{body}</Text>
    </View>
  );
}

function WelcomeContent() {
  const cards = [
    { title: 'Card 1', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { title: 'Card 2', body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { title: 'Card 3', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.' },
  ];

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: Palette.accentPink }}>
        Welcome, user
      </Text>
      {cards.map((c, idx) => (
        <Card key={idx} title={c.title} body={c.body} borderColor={pickColor(idx)} />
      ))}
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
          <Text style={{ color: '#fff', fontWeight: '700' }}>Action A</Text>
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
          <Text style={{ color: '#fff', fontWeight: '700' }}>Action B</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#E0E0E0' }}
      headerImage={
        <Image
          source={{ uri: 'https://nipo.pl/wp-content/uploads/2015/09/Ma%C5%82opolska-nowe-logo-poziom.jpg' }}
          style={{ width: '100%', height: 100, marginTop: 32 }}
          resizeMode="cover"
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
