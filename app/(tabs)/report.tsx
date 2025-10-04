import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

export default function ReportScreen() {
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportedMarker, setReportedMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reportedDescription, setReportedDescription] = useState('');
  const [description, setDescription] = useState('');
  const theme = useColorScheme() ?? 'light';
  const placeholderColor = useThemeColor({}, 'icon');

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const handleReport = () => {
    // Save the marker and description for the report modal, then remove them
    // from the form/UI so the marker/button/input disappear immediately.
    if (marker) {
      setReportedMarker(marker);
      setReportedDescription(description);
      setMarker(null);
      setDescription('');
      setModalVisible(true);
    }
  };

  return (
    <ThemedView lightColor="#ffffff" darkColor="#ffffff" style={styles.screen}>
      <View style={styles.titleCard}>
        <View style={styles.titleRow}>
          {'REPORT'.split('').map((ch, i) => (
            <ThemedText
              key={i}
              style={[
                styles.titleLetter,
                { color: [Palette.accentPink, Palette.accentGreen, Palette.accentYellow, Palette.accentBlue, Palette.accentPurple][i % 5], fontFamily: (Fonts as any).rounded },
              ]}
            >
              {ch}
            </ThemedText>
          ))}
        </View>
      </View>

      <View style={[styles.card, { borderColor: theme === 'light' ? Colors.light.card : Colors.dark.card }]}>
        <MapView style={styles.map} onPress={handleMapPress}>
          {marker && <Marker coordinate={marker} />}
        </MapView>
      </View>

      {/* Input directly below the map */}
      <View style={styles.inputWrapper}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the problem..."
          placeholderTextColor={placeholderColor}
          style={styles.bottomInput}
          multiline
        />
      </View>

      {marker && (
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleReport}
            style={[styles.button, { backgroundColor: '#2b2b2b' }]}
          >
            <ThemedText style={[styles.buttonText, { fontFamily: (Fonts as any).rounded }]}>Report location</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {modalVisible && (
        <View style={styles.modalBackground}>
          <View style={[styles.modalCard, { backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a' }]}>
            <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
              Report Sent
            </ThemedText>
            <ThemedText style={styles.coordText}>
              Latitude: {reportedMarker?.latitude ? reportedMarker.latitude.toFixed(5) : '-'}
            </ThemedText>
            <ThemedText style={styles.coordText}>
              Longitude: {reportedMarker?.longitude ? reportedMarker.longitude.toFixed(5) : '-'}
            </ThemedText>
            <ThemedText style={[styles.coordText, { marginTop: 8 }]}>Description:</ThemedText>
            <ThemedText style={styles.coordText}>{reportedDescription || '-'}</ThemedText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Palette.accentBlue }]}
                onPress={() => {
                  setModalVisible(false);
                  setReportedMarker(null);
                  setReportedDescription('');
                }}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.buttonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },

  /* Title */
  titleCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 0,
    marginTop: 0,
    marginBottom: 8,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    marginBottom: 6,
    justifyContent: 'center',
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

  /* Map card */
  card: {
    height: 360,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#f8f8f8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  /* Input area */
  inputWrapper: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomInput: {
    width: '95%',
    minHeight: 56,
    maxHeight: 120,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  /* Actions */
  actions: {
    marginTop: 28,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* Modal */
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  coordText: {
    marginBottom: 6,
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
});