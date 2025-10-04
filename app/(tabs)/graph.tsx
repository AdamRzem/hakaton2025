// app/(tabs)/graph.tsx
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import useDatabase from '../hooks/useDatabase'; // optional: ensures DB is inited
// If you want to fetch from DB instead of static values use:
// import { getAllItems } from '../database';

type Props = {};

/**
 * Graph screen:
 * - shows LineChart from static values (you'll later replace with DB values)
 * - computes average
 * - shows random "optimal" value for now
 * - displays a "note" and allows checking if average deviates >25%
 * - schedules a local notification when the average is "bad"
 */
export default function GraphScreen(_: Props) {
  // If you want DB initialization globally, ensure useDatabase is called
  useDatabase();

  // Static sample values for now (replace with DB values later)
  const [values, setValues] = useState<number[]>([12, 18, 20, 25, 30, 22, 28]);
  const [average, setAverage] = useState<number>(computeAverage([12, 18, 20, 25, 30, 22, 28]));
  const [optimal, setOptimal] = useState<number>(generateRandomOptimal());

  useEffect(() => {
    setAverage(computeAverage(values));
  }, [values]);

  // Optionally: on mount you could fetch values from DB (commented below)
  useEffect(() => {
    // Example of how you'd load numeric values from database later:
    // async function loadFromDb() {
    //   const rows = await getAllItems(); // assuming getAllItems returns rows with a numeric 'value' column
    //   // Convert rows to numbers (change prop name as needed)
    //   const numericValues = rows
    //     .map(r => Number(r.value ?? r.name ?? 0))
    //     .filter(n => Number.isFinite(n));
    //   if (numericValues.length) setValues(numericValues);
    // }
    // loadFromDb();
  }, []);

  async function ensureNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('badAverage', {
        name: 'Bad Average Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  }

  async function sendBadAverageNotification(avg: number, opt: number) {
    await ensureNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Average out of optimal range',
        body: `Average ${avg.toFixed(1)} vs optimal ${opt.toFixed(1)}.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // immediate
    });
  }

  async function requestNotificationPermissionsIfNeeded() {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async function checkAverageAndNotify() {
    const avg = average;
    const opt = optimal;
    const ratio = avg / opt;

    const tooHigh = ratio > 1.25;
    const tooLow = ratio < 0.75;

    if (tooHigh || tooLow) {
      const message = tooHigh
        ? `Average (${avg.toFixed(1)}) is more than 25% above optimal (${opt.toFixed(1)}).`
        : `Average (${avg.toFixed(1)}) is more than 25% below optimal (${opt.toFixed(1)}).`;

      // Show immediate alert in UI
      Alert.alert('Threshold exceeded', message);

      // Send local push notification (request permission if needed)
      const granted = await requestNotificationPermissionsIfNeeded();
      if (granted) {
        await sendBadAverageNotification(avg, opt);
      } else {
        // If user denied notifications, optionally show info
        Alert.alert('Notifications disabled', 'Enable notifications in system settings to receive alerts.');
      }
    } else {
      Alert.alert('OK', `Average (${avg.toFixed(1)}) is within ±25% of optimal (${opt.toFixed(1)}).`);
    }
  }

  // UI rendering for chart data
  const screenWidth = Dimensions.get('window').width - 32;
  const chartData = {
    labels: values.map((_, i) => String(i + 1)), // simple index labels
    datasets: [{ data: values }],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Values Graph</Text>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          verticalLabelRotation={0}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            style: {
              borderRadius: 12,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '1',
            },
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Average: <Text style={styles.bold}>{average.toFixed(2)}</Text></Text>
        <Text style={styles.infoText}>Optimal: <Text style={styles.bold}>{optimal.toFixed(2)}</Text></Text>
      </View>

      <Text style={styles.note}>
        Note: If the average is more than 25% higher or lower than the optimal value, you will be alerted.
      </Text>

      <View style={styles.buttonRow}>
        <Button title="Check now" onPress={checkAverageAndNotify} />
        <View style={{ width: 12 }} />
        <Button
          title="Randomize optimal"
          onPress={() => setOptimal(generateRandomOptimal())}
        />
      </View>

      <View style={{ height: 24 }} />

      <Text style={styles.small}>Developer note: to use real device values, replace the static `values` array with results from your database. See commented snippet above.</Text>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// small helpers
function computeAverage(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function generateRandomOptimal() {
  // random 10..40
  return Math.floor(Math.random() * 31) + 10;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 16,
  },
  bold: { fontWeight: '700' },
  note: {
    marginTop: 12,
    color: '#444',
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
  },
  small: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
