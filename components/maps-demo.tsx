
import { Text } from '@react-navigation/elements';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.0421,
  });
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
    title='Roadblock'
    >
      <Text style={{fontSize:30}}>🚧</Text>
    </Marker>
  )
  // navigator.geolocation.getCurrentPosition(info => {
  //   setPosition({
  //     longitude:info.coords.longitude,
  //     latitude:info.coords.latitude,
  //     latitudeDelta: 0.0421,
  //     longitudeDelta: 0.0421,
  //   });
  // });
  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map}
      initialRegion={{
        latitude:50.067575,
        longitude:19.991951,
       latitudeDelta: 0.0421,
       longitudeDelta: 0.0421,}}//fxit
      >
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
