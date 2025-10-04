
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const backend_list = [
    {
      _id:0,
      description:"ae",
      coordinate:{latitude:0.0,longitude:0.0}
    }
  ];
  const markerList = backend_list.map(marker=>
    <Marker 
    key={marker._id}
    description={marker.description}
    coordinate={marker.coordinate}
    />
  )
  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {markerList}
        </MapView>
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
});
