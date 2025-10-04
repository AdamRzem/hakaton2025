import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@app:token';
const EMAIL_KEY = '@app:email';

export async function saveAuth(token: string, email: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(EMAIL_KEY, email);
  } catch (e) {
    console.warn('Failed to save auth', e);
  }
}

export async function clearAuth() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(EMAIL_KEY);
  } catch (e) {
    console.warn('Failed to clear auth', e);
  }
}

export async function getAuth() {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const email = await AsyncStorage.getItem(EMAIL_KEY);
    return { token, email };
  } catch (e) {
    console.warn('Failed to get auth', e);
    return { token: null, email: null };
  }
}
