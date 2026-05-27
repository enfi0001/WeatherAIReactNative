import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

function CityWeatherCard({ cityName, country, weather }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {cityName}, {country}
      </Text>

      <Text style={styles.weatherText}>Temperatur: {weather.temperature}°C</Text>
      <Text style={styles.weatherText}>Vind: {weather.windSpeed} km/t</Text>
      <Text style={styles.weatherText}>Regn: {weather.rain} mm</Text>
    </View>
  );
}

function CityAnalysis({ weather }) {
  if (!weather) {
    return null;
  }

  const analysis = createCityAnalysis(weather);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vurdering</Text>

      <FlatList
        data={analysis}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => <Text style={styles.listItem}>• {item}</Text>}
      />
    </View>
  );
}

function createCityAnalysis(weather) {
  const result = [];

  if (weather.temperature >= 15 && weather.temperature <= 22 && weather.rain === 0) {
    result.push('Vejret er godt til gåtur eller let udendørs aktivitet.');
  } else {
    result.push('Vejret kan bruges til udendørs aktivitet, men forholdene er ikke helt optimale.');
  }

  if (weather.temperature >= 20 && weather.rain === 0) {
    result.push('Det virker behageligt til park, strand eller cafébesøg udenfor.');
  } else {
    result.push('Det er ikke oplagt strandvejr lige nu.');
  }

  if (weather.windSpeed > 30) {
    result.push('Vinden er høj, så cykling eller længere gåture kan føles mere anstrengende.');
  } else {
    result.push('Vinden virker acceptabel til de fleste aktiviteter.');
  }

  if (weather.rain > 0) {
    result.push('Der er regn, så regnjakke eller paraply kan være nødvendigt.');
  } else {
    result.push('Der er ikke registreret regn lige nu.');
  }

  if (weather.temperature < 10) {
    result.push('Det er koldt, så varmt tøj er en god idé.');
  } else {
    result.push('Temperaturen virker passende til almindelige planer udenfor.');
  }

  return result;
}

export default function CitySearchScreen() {
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityWeather, setCityWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function searchCityWeather() {
    if (cityInput.trim() === '') {
      setErrorMessage('Skriv navnet på en by først.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSelectedCity(null);
      setCityWeather(null);

      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(cityInput)}` +
        `&count=1` +
        `&language=da` +
        `&format=json`;

      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setErrorMessage('Byen blev ikke fundet.');
        setLoading(false);
        return;
      }

      const city = geoData.results[0];

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${city.latitude}` +
        `&longitude=${city.longitude}` +
        `&current=temperature_2m,wind_speed_10m,rain`;

      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      const weatherObject = {
        temperature: weatherData.current.temperature_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        rain: weatherData.current.rain,
      };

      setSelectedCity({
        name: city.name,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
      });

      setCityWeather(weatherObject);
      setLoading(false);
    } catch (error) {
      setErrorMessage('Der skete en fejl ved hentning af vejr.');
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Søg by</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Skriv fx Copenhagen, Aarhus eller London"
          value={cityInput}
          onChangeText={setCityInput}
        />

        <Button title="Hent vejr" onPress={searchCityWeather} />
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Henter vejr...</Text>
        </View>
      )}

      {errorMessage !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {selectedCity && cityWeather && (
        <>
          <CityWeatherCard
            cityName={selectedCity.name}
            country={selectedCity.country}
            weather={cityWeather}
          />

          <CityAnalysis weather={cityWeather} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#eef6fb',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#123047',
    marginBottom: 20,
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
    color: '#123047',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd7df',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fbfd',
  },
  weatherText: {
    fontSize: 16,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 21,
  },
  loadingBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#4d6675',
  },
  errorBox: {
    backgroundColor: '#ffe3e3',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#8a0000',
    fontSize: 15,
  },
});