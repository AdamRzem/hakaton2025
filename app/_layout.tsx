// app/_layout.tsx  (optional)
import { Slot } from 'expo-router';
import React from 'react';
import useDatabase from './hooks/useDatabase';

export default function RootLayout() {
  useDatabase(); // initialize on app start
  return <Slot />;
}
