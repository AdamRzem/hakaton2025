
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


function add_marker(){

}

export default function App() {
  const markers = [
      {
      description:"Kubots home'nt",
      coordinate:{latitude: -34.397, longitude: 150.644}
      }
  ];
  //TODO: link markers to database
  const markersList = markers.map(marker => 
    <Marker 
      description={marker.description}
      coordinate={marker.coordinate}
    />
  )
  return (
    <>
    <View style={styles.container}>
      <MapView style={styles.map}>
        {markersList}
      </MapView>
    </View>
      <Button onPress={add_marker} title="➕ Add marker📌"/>
    </>
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
