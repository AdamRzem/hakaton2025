import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Tab layout shows Register and Login without the tab bar. When navigating to
// the main app screens (index, explore, antek) their options override the
// tabBarStyle so the tab bar becomes visible and the user can switch tabs.
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
      }}>
      {/* Main app screens: show the tab bar */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={14} name="house.fill" color={color} />,
            tabBarStyle: { display: 'flex' },
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={14} name="paperplane.fill" color={color} />,
            tabBarStyle: { display: 'flex' },
          }}
        />
        <Tabs.Screen
          name="antek"
          options={{
            title: 'Maps',
            tabBarIcon: ({ color }) => <IconSymbol size={14} name="map.fill" color={color} />,
            tabBarStyle: { display: 'flex' },
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Report',
            tabBarIcon: ({ color }) => <IconSymbol size={14} name="map.fill" color={color} />,
            tabBarStyle: { display: 'flex' },
          }}
        />
    </Tabs>
  );
}
