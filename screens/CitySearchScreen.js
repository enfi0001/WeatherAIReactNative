import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

function PrimaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function SmallButton({ title, onPress, danger }) {
  return (
    <Pressable
      style={[styles.smallButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <Text style={[styles.smallButtonText, danger && styles.dangerButtonText]}>
        {title}
      </Text>
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

function CityWeatherCard({ cityName, country, weather }) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.cityName}>{cityName}</Text>
      <Text style={styles.countryName}>{country}</Text>

      <Text style={styles.bigTemperature}>{weather.temperature}°</Text>

      <View style={styles.metricsRow}>
        <WeatherMetric label="Vind" value={`${weather.windSpeed} km/t`} />
        <WeatherMetric label="Regn" value={`${weather.rain} mm`} />
      </View>
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
        renderItem={({ item, index }) => (
          <View style={styles.analysisItem}>
            <View style={styles.analysisDot}>
              <Text style={styles.analysisDotText}>{index + 1}</Text>
            </View>
            <Text style={styles.listItem}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

function FavoriteCityItem({ city, onSelectCity, onRemoveCity }) {
  return (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteTextContainer}>
        <Text style={styles.favoriteName}>{city.name}</Text>
        <Text style={styles.favoriteCountry}>{city.country}</Text>
      </View>

      <View style={styles.favoriteButtons}>
        <SmallButton title="Vis" onPress={() => onSelectCity(city)} />
        <SmallButton title="Fjern" danger onPress={() => onRemoveCity(city.id)} />
      </View>
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
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function searchCityWeather() {
    if (cityInput.trim() === '') {
      setErrorMessage('Skriv navnet på en by først.');
      return;
    }

    await fetchCityAndWeather(cityInput);
  }

  async function fetchCityAndWeather(cityName) {
    try {
      setLoading(true);
      setErrorMessage('');
      setSelectedCity(null);
      setCityWeather(null);

      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(cityName)}` +
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

      await fetchWeatherForCity({
        id: `${city.name}-${city.latitude}-${city.longitude}`,
        name: city.name,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
      });
    } catch (error) {
      setErrorMessage('Der skete en fejl ved hentning af vejr.');
      setLoading(false);
    }
  }

  async function fetchWeatherForCity(city) {
    try {
      setLoading(true);
      setErrorMessage('');

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

      setSelectedCity(city);
      setCityWeather(weatherObject);
      setLoading(false);
    } catch (error) {
      setErrorMessage('Der skete en fejl ved hentning af vejr.');
      setLoading(false);
    }
  }

  function addFavoriteCity() {
    if (!selectedCity) {
      return;
    }

    const cityAlreadyExists = favoriteCities.some(
      (city) => city.id === selectedCity.id
    );

    if (cityAlreadyExists) {
      setErrorMessage('Byen er allerede tilføjet som favorit.');
      return;
    }

    setFavoriteCities((previousCities) => [...previousCities, selectedCity]);
    setErrorMessage('');
  }

  function removeFavoriteCity(cityId) {
    setFavoriteCities((previousCities) =>
      previousCities.filter((city) => city.id !== cityId)
    );
  }

  async function selectFavoriteCity(city) {
    await fetchWeatherForCity(city);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Søg by</Text>
      <Text style={styles.subtitle}>Find vejret i en valgfri by</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Copenhagen, Aarhus, London..."
          value={cityInput}
          onChangeText={setCityInput}
        />

        <PrimaryButton title="Hent vejr" onPress={searchCityWeather} />
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

          <PrimaryButton title="Tilføj til favoritter" onPress={addFavoriteCity} />

          <CityAnalysis weather={cityWeather} />
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Favoritbyer</Text>

        {favoriteCities.length === 0 ? (
          <Text style={styles.emptyText}>Ingen favoritbyer endnu.</Text>
        ) : (
          <FlatList
            data={favoriteCities}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <FavoriteCityItem
                city={item}
                onSelectCity={selectFavoriteCity}
                onRemoveCity={removeFavoriteCity}
              />
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 28,
    backgroundColor: '#eef6fb',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#123047',
  },
  subtitle: {
    fontSize: 16,
    color: '#5f7482',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherCard: {
    backgroundColor: '#123047',
    padding: 22,
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cityName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  countryName: {
    color: '#b8d8e8',
    fontSize: 15,
    marginTop: 2,
  },
  bigTemperature: {
    color: 'white',
    fontSize: 68,
    fontWeight: '800',
    marginTop: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1d4664',
    padding: 14,
    borderRadius: 16,
  },
  metricValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#b8d8e8',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
    color: '#123047',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd7df',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f8fbfd',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#1f7a9c',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  analysisDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d7ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  analysisDotText: {
    color: '#123047',
    fontWeight: '800',
  },
  listItem: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#253946',
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
    borderRadius: 14,
    marginBottom: 18,
  },
  errorText: {
    color: '#8a0000',
    fontSize: 15,
  },
  favoriteItem: {
    borderWidth: 1,
    borderColor: '#dde7ee',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#f8fbfd',
  },
  favoriteTextContainer: {
    marginBottom: 12,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#123047',
  },
  favoriteCountry: {
    fontSize: 14,
    color: '#4d6675',
    marginTop: 2,
  },
  favoriteButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#eef6fb',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#123047',
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#ffe3e3',
  },
  dangerButtonText: {
    color: '#b00020',
  },
  emptyText: {
    fontSize: 15,
    color: '#4d6675',
  },
});