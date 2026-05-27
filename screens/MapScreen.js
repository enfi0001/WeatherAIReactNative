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

      <View style={styles.mapCard}>
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
            />
          ))}
        </MapView>
      </View>

      <View style={styles.cityList}>
        {cityMarkers.map((city) => (
          <View key={city.id} style={styles.cityChip}>
            <Text style={styles.cityChipText}>{city.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 28,
    backgroundColor: '#eef6fb',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#123047',
    marginBottom: 18,
  },
  mapCard: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  cityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  cityChip: {
    backgroundColor: 'white',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  cityChipText: {
    color: '#123047',
    fontWeight: '700',
  },
});