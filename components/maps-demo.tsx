
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const { data: reports = [], isLoading } = useQuery(trpc.getReports.queryOptions());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permDenied, setPermDenied] = useState(false);

  // default fallback (Kraków coordinate you had)
  const fallbackRegion = { latitude: 50.067575, longitude: 19.991951, latitudeDelta: 0.0421, longitudeDelta: 0.0421 };

  // ask for location & fetch
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermDenied(true);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        setPermDenied(true);
      }
    })();
  }, []);

  const backend_list = reports
  .map((r: any) => {
    // `location` may be stored as "lat,lng" (from report.tsx) or JSON
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
        const locObj: any = r.location;
        coord = { latitude: Number(locObj.latitude) || 0, longitude: Number(locObj.longitude) || 0 };
      }
    } catch (e) {
      // ignore parse errors
    }
    return {
      id: r.reportId ?? Math.random().toString(),
      description: r.description ?? 'Report',
      coordinate: coord,
    };
  })
    .filter((m) => m.coordinate.latitude !== 0 || m.coordinate.longitude !== 0);

  // Debugging
  console.log('maps-demo reports:', reports);

  const markerList = backend_list.map((marker) => (
    // render same Marker as ReportScreen (default pin)
    <Marker key={marker.id} coordinate={marker.coordinate} title={marker.description} description={marker.description} />
  ));

  const mapRef = useRef<MapView | null>(null);

  // auto-fit map to markers
  useEffect(() => {
    const coords = backend_list.map((m) => m.coordinate).filter((c) => c.latitude && c.longitude);
    if (userLocation) coords.push(userLocation);
    if (coords.length > 0 && mapRef.current) {
      try {
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
      } catch {}
    }
  }, [reports, userLocation]);
  // Static marker in the center of Kraków (Main Market Square)
  // const staticMarker = (
  //   <Marker
  //     key="static-krakow"
  //     coordinate={{ latitude: 50.06143, longitude: 19.93658 }}
  //     title="Kraków - Main Market"
  //     description="Static marker for testing"
  //     pinColor="blue"
  //   />
  // );
  // navigator.geolocation.getCurrentPosition(info => {
  //   setPosition({
  //     longitude:info.coords.longitude,
  //     latitude:info.coords.latitude,
  //     latitudeDelta: 0.0421,
  //     longitudeDelta: 0.0421,
  //   });
  // });
  const initialRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : fallbackRegion;

  return (
    <View style={styles.container}>
      <MapView
        ref={(r) => { mapRef.current = r; }}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton
      >
        {markerList}
        {userLocation && (
          <Marker
            key="user-location"
            coordinate={userLocation}
            title="You are here"
            pinColor="magenta"
          />
        )}
      </MapView>
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.overlayText}>Reports: {reports.length}</Text>
        {!isLoading && reports.length === 0 && <Text style={styles.overlayText}>No reports found</Text>}
        {permDenied && <Text style={styles.overlayText}>Location permission denied</Text>}
        {isLoading && <Text style={styles.overlayText}>Loading...</Text>}
      </View>
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
});
