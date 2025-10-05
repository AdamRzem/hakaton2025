import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { client } from '../app/utils/trpcClient';

export default function App() {
  const { data: reports, isLoading } = useQuery<any[], Error>({
    queryKey: ['maps-reports'],
    queryFn: () => client.getReports.query(),
    refetchInterval: 60_000,
  });

  const position = {
    latitude: 50.067575,
    longitude: 19.991951,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.0421,
  };

  const backend_list = (reports ?? [])
    .map((r) => {
      let coord = { latitude: 0, longitude: 0 };
      try {
        if (typeof r.location === 'string') {
          const s = r.location.trim();
          if (s.includes(',')) {
            const [latS, lngS] = s.split(',');
            coord = { latitude: Number(latS) || 0, longitude: Number(lngS) || 0 };
          } else {
            const parsed = JSON.parse(s);
            coord = { latitude: Number(parsed.latitude) || 0, longitude: Number(parsed.longitude) || 0 };
          }
        } else if (typeof r.location === 'object' && r.location !== null) {
          coord = { latitude: Number(r.location.latitude) || 0, longitude: Number(r.location.longitude) || 0 };
        }
      } catch (e) {
        // ignore parse errors
      }
      return {
        id: r.reportId ?? Math.random().toString(),
        description: r.description ?? 'Report',
        line: r.line ?? r.lineNumber ?? r.lineName ?? '',
        coordinate: coord,
      };
    })
    .filter((m) => m.coordinate.latitude !== 0 || m.coordinate.longitude !== 0);

  // Debugging
  console.log('maps-demo reports:', reports);

  const [selected, setSelected] = useState<null | { id: string; description: string; line: string; coordinate: { latitude: number; longitude: number } }>(null);

  const mapRef = useRef<MapView | null>(null);

  // auto-fit map to markers
  useEffect(() => {
    const coords = backend_list.map((m) => m.coordinate).filter((c) => c.latitude && c.longitude);
    if (coords.length > 0 && mapRef.current) {
      try {
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
      } catch {}
    }
  }, [reports]);

  return (
    <View style={styles.container}>
      <MapView ref={(r) => { mapRef.current = r; }} style={styles.map} initialRegion={position}>
        {backend_list.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => setSelected(marker)}
          />
        ))}
      </MapView>

      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.overlayText}>Reports: {(reports ?? []).length}</Text>
        {!isLoading && (reports ?? []).length === 0 && <Text style={styles.overlayText}>No reports found</Text>}
      </View>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.calloutLine}>Line: {selected?.line || '—'}</Text>
            <Text style={styles.calloutDesc}>{selected?.description}</Text>
            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
  },
  calloutContainer: {
    maxWidth: 220,
  },
  calloutLine: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  calloutDesc: {
    color: '#333',
    marginBottom: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 6,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});