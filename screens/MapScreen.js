import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const cityMarkers = [
  {
    id: '1',
    name: 'København',
    latitude: 55.6761,
    longitude: 12.5683,
  },
  {
    id: '2',
    name: 'Aarhus',
    latitude: 56.1629,
    longitude: 10.2039,
  },
  {
    id: '3',
    name: 'Odense',
    latitude: 55.4038,
    longitude: 10.4024,
  },
  {
    id: '4',
    name: 'Aalborg',
    latitude: 57.0488,
    longitude: 9.9217,
  },
];

export default function MapScreen({ route }) {
  const location = route.params?.location;

  const startLocation = location || {
    latitude: 55.6761,
    longitude: 12.5683,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vejrkort</Text>

      <Text style={styles.description}>
        Kortet viser din lokation og nogle eksempelbyer. Vi henter ikke vejrdata
        for alle byer automatisk, så vi undgår for mange API-kald.
      </Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Din lokation"
            description="Her henter appen vejret fra"
          />
        )}

        {cityMarkers.map((city) => (
          <Marker
            key={city.id}
            coordinate={{
              latitude: city.latitude,
              longitude: city.longitude,
            }}
            title={city.name}
            description="Eksempel på by-marker"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eef6fb',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#123047',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#4d6675',
    marginBottom: 14,
    lineHeight: 21,
  },
  map: {
    flex: 1,
    borderRadius: 14,
  },
});