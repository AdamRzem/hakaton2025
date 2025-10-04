import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Palette } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    alert('Login submitted!');
  };

  const title = 'LOGIN';
  const titleColors = [Palette.accentPink, Palette.accentGreen, Palette.accentYellow, Palette.accentBlue, Palette.accentPurple];

  return (
    <ThemedView lightColor="#ffffff" darkColor="#ffffff" style={styles.container}>
      <View style={styles.titleCard}>
        <View style={styles.titleRow}>
          {title.split('').map((ch, i) => (
            <ThemedText
              key={i}
              style={[
                styles.titleLetter,
                { color: titleColors[i % titleColors.length], fontFamily: (Fonts as any).rounded },
              ]}
            >
              {ch}
            </ThemedText>
          ))}
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.colorStrip}>
          {titleColors.map((c, idx) => (
            <View key={idx} style={[styles.colorSegment, { backgroundColor: c }]} />
          ))}
        </View>
        <TextInput
          style={[styles.input, { borderColor: '#000', color: textColor }]}
          placeholder="Email"
          placeholderTextColor={placeholderColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.colorStrip}>
          {titleColors.map((c, idx) => (
            <View key={idx} style={[styles.colorSegment, { backgroundColor: c }]} />
          ))}
        </View>
        <TextInput
          style={[styles.input, { borderColor: '#000', color: textColor }]}
          placeholder="Password"
          placeholderTextColor={placeholderColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error ? (
        <ThemedText style={[styles.error, { color: tint }]}>
          {error}
        </ThemedText>
      ) : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: '#2b2b2b' }]} onPress={handleLogin} activeOpacity={0.9}>
        <ThemedText style={[styles.buttonText, { fontFamily: (Fonts as any).rounded }]}>Login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  titleLetter: {
    fontSize: 44,
    fontWeight: '800',
    marginHorizontal: 1,
    lineHeight: 52,
    marginTop: 2,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  titleCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 0,
    marginTop: 24,
    marginBottom: 12,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  colorStrip: {
    flexDirection: 'row',
    height: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  colorSegment: {
    flex: 1,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
