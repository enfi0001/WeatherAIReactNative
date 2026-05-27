import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';

function PrimaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function WeatherMetric({ label, value }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function WeatherCard({ weather }) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.cardLabel}>Din lokation</Text>
      <Text style={styles.bigTemperature}>{weather.temperature}°</Text>
      <Text style={styles.weatherSummary}>Aktuelt vejr lige nu</Text>

      <View style={styles.metricsRow}>
        <WeatherMetric label="Vind" value={`${weather.windSpeed} km/t`} />
        <WeatherMetric label="Regn" value={`${weather.rain} mm`} />
      </View>
    </View>
  );
}

function AnalysisList({ analysis }) {
  if (analysis.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>AI-analyse</Text>

      <FlatList
        data={analysis}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={styles.analysisItem}>
            <View style={styles.analysisNumber}>
              <Text style={styles.analysisNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.analysisText}>{item}</Text>
          </View>
        )}
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    getLocationAndWeather();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
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
        <Text style={styles.loadingText}>Henter vejr...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <PrimaryButton title="Prøv igen" onPress={getLocationAndWeather} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weather AI</Text>
          <Text style={styles.subtitle}>Din personlige vejrassistent</Text>
        </View>

        {weather && <WeatherCard weather={weather} />}

        <PrimaryButton title="Lav AI-analyse" onPress={createWeatherAnalysis} />

        <AnalysisList analysis={analysis} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funktioner</Text>

          <SecondaryButton
            title="AI-chat"
            onPress={() =>
              navigation.navigate('Chat', {
                weather,
              })
            }
          />

          <SecondaryButton
            title="Søg by"
            onPress={() => navigation.navigate('CitySearch')}
          />

          <SecondaryButton
            title="Vejrkort"
            onPress={() =>
              navigation.navigate('Map', {
                location,
              })
            }
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 28,
    backgroundColor: '#eef6fb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#eef6fb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4d6675',
  },
  errorText: {
    fontSize: 16,
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#123047',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    color: '#5f7482',
  },
  weatherCard: {
    backgroundColor: '#123047',
    padding: 22,
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardLabel: {
    color: '#b8d8e8',
    fontSize: 15,
    marginBottom: 8,
  },
  bigTemperature: {
    color: 'white',
    fontSize: 72,
    fontWeight: '800',
  },
  weatherSummary: {
    color: '#e6f4fb',
    fontSize: 17,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1d4664',
    padding: 14,
    borderRadius: 16,
  },
  metricValue: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#b8d8e8',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginTop: 18,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
    color: '#123047',
  },
  primaryButton: {
    backgroundColor: '#1f7a9c',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#eef6fb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#123047',
    fontSize: 16,
    fontWeight: '700',
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  analysisNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d7ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  analysisNumberText: {
    color: '#123047',
    fontWeight: '800',
  },
  analysisText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#253946',
  },
});