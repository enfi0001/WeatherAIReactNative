import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';

function WeatherCard({ weather }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vejret lige nu</Text>

      <Text style={styles.weatherText}>Temperatur: {weather.temperature}°C</Text>
      <Text style={styles.weatherText}>Vind: {weather.windSpeed} km/t</Text>
      <Text style={styles.weatherText}>Regn: {weather.rain} mm</Text>
    </View>
  );
}

function AnalysisList({ analysis }) {
  if (analysis.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>AI-analyse af vejret</Text>

      <FlatList
        data={analysis}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => <Text style={styles.listItem}>• {item}</Text>}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  async function getLocationAndWeather() {
    try {
      setLoading(true);
      setErrorMessage('');

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setErrorMessage('Du skal give adgang til lokation for at hente vejret.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;

      const locationObject = {
        latitude,
        longitude,
      };

      setLocation(locationObject);
      await fetchWeather(latitude, longitude);
    } catch (error) {
      setErrorMessage('Der skete en fejl ved hentning af lokation eller vejr.');
      setLoading(false);
    }
  }

  async function fetchWeather(latitude, longitude) {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,wind_speed_10m,rain`;

      const response = await fetch(url);
      const data = await response.json();

      const currentWeather = {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        rain: data.current.rain,
      };

      setWeather(currentWeather);
      setLoading(false);
    } catch (error) {
      setErrorMessage('Kunne ikke hente vejret fra API.');
      setLoading(false);
    }
  }

  function createWeatherAnalysis() {
    if (!weather) {
      return;
    }

    const newAnalysis = [];

    if (weather.temperature >= 15 && weather.windSpeed < 25 && weather.rain === 0) {
      newAnalysis.push('Vejret er godt til løb, fordi temperaturen er behagelig og vinden er lav.');
    } else {
      newAnalysis.push('Løb kan godt lade sig gøre, men vejret er ikke helt optimalt.');
    }

    if (weather.temperature >= 20 && weather.rain === 0) {
      newAnalysis.push('Det kan være fint til svømning, især hvis vandtemperaturen også er god.');
    } else {
      newAnalysis.push('Svømning er mindre oplagt, fordi temperaturen eller vejret ikke er ideelt.');
    }

    if (weather.windSpeed > 30) {
      newAnalysis.push('Det blæser en del, så cykling kan føles hårdere end normalt.');
    } else {
      newAnalysis.push('Cykling ser fornuftigt ud, fordi vinden ikke er alt for kraftig.');
    }

    if (weather.rain > 0) {
      newAnalysis.push('Du bør tage regntøj eller paraply med, fordi der er registreret regn.');
    } else {
      newAnalysis.push('Du behøver sandsynligvis ikke regntøj lige nu.');
    }

    if (weather.temperature < 10) {
      newAnalysis.push('Det er koldt, så en jakke eller ekstra lag tøj vil være en god idé.');
    } else {
      newAnalysis.push('Temperaturen virker behagelig nok til almindelige udendørsaktiviteter.');
    }

    setAnalysis(newAnalysis);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Henter lokation og vejr...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Button title="Prøv igen" onPress={getLocationAndWeather} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weather AI App</Text>

      <Text style={styles.subtitle}>
        Vejrbaseret anbefaling ud fra din lokation
      </Text>

      {weather && <WeatherCard weather={weather} />}

      <View style={styles.buttonSpacing}>
        <Button title="Lav AI-analyse" onPress={createWeatherAnalysis} />
      </View>

      <AnalysisList analysis={analysis} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Andre funktioner</Text>

        <View style={styles.buttonSpacing}>
          <Button
            title="Åbn AI-chat"
            onPress={() =>
              navigation.navigate('Chat', {
                weather,
              })
            }
          />
        </View>

        <Button
          title="Åbn vejrkort"
          onPress={() =>
            navigation.navigate('Map', {
              location,
            })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#eef6fb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#123047',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4d6675',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  weatherText: {
    fontSize: 16,
    marginBottom: 6,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 21,
  },
});