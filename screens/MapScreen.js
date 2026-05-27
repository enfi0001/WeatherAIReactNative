import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  {
    id: '5',
    name: 'Esbjerg',
    latitude: 55.4765,
    longitude: 8.4594,
  },
];

function getActivityScore(weather) {
  let score = 0;

  if (weather.temperature >= 15 && weather.temperature <= 22) {
    score += 3;
  } else if (weather.temperature >= 10 && weather.temperature < 15) {
    score += 2;
  } else if (weather.temperature > 22 && weather.temperature <= 27) {
    score += 2;
  } else {
    score += 1;
  }

  if (weather.rain === 0) {
    score += 3;
  } else if (weather.rain > 0 && weather.rain <= 1) {
    score += 2;
  } else {
    score += 0;
  }

  if (weather.windSpeed <= 20) {
    score += 3;
  } else if (weather.windSpeed > 20 && weather.windSpeed <= 35) {
    score += 1;
  } else {
    score += 0;
  }

  return score;
}

function createShortVerdict(weather) {
  const score = getActivityScore(weather);

  if (score >= 8) {
    return 'Rigtig godt udendørsvejr';
  }

  if (score >= 5) {
    return 'Okay vejr med enkelte forbehold';
  }

  return 'Mindre oplagt udendørsvejr';
}

function createMapRecommendation(weather) {
  const temperature = weather.temperature;
  const windSpeed = weather.windSpeed;
  const rain = weather.rain;

  const isCold = temperature < 10;
  const isCool = temperature >= 10 && temperature < 15;
  const isComfortable = temperature >= 15 && temperature <= 22;
  const isWarm = temperature > 22 && temperature <= 27;
  const isHot = temperature > 27;

  const isDry = rain === 0;
  const isLightRain = rain > 0 && rain <= 1;
  const isRainy = rain > 1;

  const isCalm = windSpeed <= 20;
  const isWindy = windSpeed > 20 && windSpeed <= 35;
  const isVeryWindy = windSpeed > 35;

  if (isComfortable && isDry && isCalm) {
    return 'Vejret er meget velegnet til løb, gåtur og cykling. Temperaturen er behagelig, der er ingen regn, og vinden er lav.';
  }

  if (isWarm && isDry && isCalm) {
    return 'Vejret er godt til park, strand eller en rolig gåtur. Det kan også bruges til løb, men husk vand hvis du skal være aktiv.';
  }

  if (isHot && isDry) {
    return 'Det er varmt, så vejret passer bedst til strand, svømning eller afslapning udenfor. Hård træning kan føles tungt i varmen.';
  }

  if (isCold && isDry && isCalm) {
    return 'Det er koldt, men vejret kan stadig bruges til gåtur eller løb, hvis du tager varmt tøj på.';
  }

  if (isCool && isDry && isCalm) {
    return 'Vejret er lidt køligt, men stadig fint til gåtur, cykling eller let motion med en jakke.';
  }

  if (isLightRain && !isVeryWindy) {
    return 'Der er lidt regn, men vejret kan stadig bruges til korte gåture eller transport. Regnjakke er en god idé.';
  }

  if (isRainy && isVeryWindy) {
    return 'Vejret er ikke særlig oplagt til udendørsaktiviteter. Kombinationen af regn og kraftig vind gør det bedst til indendørs planer.';
  }

  if (isRainy) {
    return 'Regnen gør vejret mindre behageligt til løb, cykling og gåture. Hvis du skal ud, bør du tage regntøj med.';
  }

  if (isVeryWindy && isDry) {
    return 'Det blæser meget, så cykling og løb kan føles hårdere end normalt. En kort gåtur kan dog stadig være fin.';
  }

  if (isWindy && isComfortable && isDry) {
    return 'Temperaturen er god, men vinden kan mærkes. Vejret egner sig bedst til gåtur eller let aktivitet frem for cykling i modvind.';
  }

  if (isWindy && isWarm && isDry) {
    return 'Det er varmt nok til udendørs planer, men vinden kan gøre cykling og længere ture mindre behagelige.';
  }

  return `Vejret er blandet: ${temperature}°C, ${windSpeed} km/t vind og ${rain} mm regn. Det kan bruges til rolige udendørsaktiviteter, men planlæg efter vind og nedbør.`;
}

function createActivityTips(weather) {
  const tips = [];

  if (weather.temperature >= 10 && weather.temperature <= 22 && weather.rain === 0 && weather.windSpeed <= 30) {
    tips.push('Løb: godt');
  } else if (weather.rain > 1 || weather.windSpeed > 35) {
    tips.push('Løb: mindre oplagt');
  } else {
    tips.push('Løb: muligt');
  }

  if (weather.temperature >= 18 && weather.rain === 0) {
    tips.push('Gåtur: godt');
  } else if (weather.rain > 1) {
    tips.push('Gåtur: tag regntøj');
  } else {
    tips.push('Gåtur: okay');
  }

  if (weather.windSpeed <= 25 && weather.rain === 0) {
    tips.push('Cykling: godt');
  } else if (weather.windSpeed > 35) {
    tips.push('Cykling: hårdt');
  } else {
    tips.push('Cykling: muligt');
  }

  if (weather.temperature >= 22 && weather.rain === 0) {
    tips.push('Strand: godt');
  } else {
    tips.push('Strand: mindre oplagt');
  }

  return tips;
}

function WeatherInfoCard({ city, weather, loading, errorMessage, onClose }) {
  if (!city && !loading && !errorMessage) {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Tryk på en by</Text>
        <Text style={styles.infoText}>
          Vælg en marker på kortet for at se vejret og en anbefaling.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.infoCard}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Henter vejr...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Luk</Text>
        </Pressable>
      </View>
    );
  }

  const activityTips = createActivityTips(weather);

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View>
          <Text style={styles.infoTitle}>{city.name}</Text>
          <Text style={styles.infoSubtitle}>{createShortVerdict(weather)}</Text>
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Luk</Text>
        </Pressable>
      </View>

      <Text style={styles.bigTemperature}>{weather.temperature}°</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{weather.windSpeed} km/t</Text>
          <Text style={styles.metricLabel}>Vind</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{weather.rain} mm</Text>
          <Text style={styles.metricLabel}>Regn</Text>
        </View>
      </View>

      <Text style={styles.recommendation}>
        {createMapRecommendation(weather)}
      </Text>

      <View style={styles.tipsContainer}>
        {activityTips.map((tip) => (
          <View key={tip} style={styles.tipChip}>
            <Text style={styles.tipChipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MapScreen({ route }) {
  const location = route.params?.location;

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startLocation = location || {
    latitude: 55.6761,
    longitude: 12.5683,
  };

  async function fetchWeatherForCity(city) {
    try {
      setSelectedCity(city);
      setSelectedWeather(null);
      setErrorMessage('');
      setLoadingWeather(true);

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${city.latitude}` +
        `&longitude=${city.longitude}` +
        `&current=temperature_2m,wind_speed_10m,rain`;

      const response = await fetch(weatherUrl);
      const data = await response.json();

      const weatherObject = {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        rain: data.current.rain,
      };

      setSelectedWeather(weatherObject);
      setLoadingWeather(false);
    } catch (error) {
      setErrorMessage('Kunne ikke hente vejr for byen.');
      setLoadingWeather(false);
    }
  }

  function closeWeatherCard() {
    setSelectedCity(null);
    setSelectedWeather(null);
    setErrorMessage('');
  }

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
              pinColor="#1f7a9c"
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
              onPress={() => fetchWeatherForCity(city)}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.cityList}>
        {cityMarkers.map((city) => (
          <Pressable
            key={city.id}
            style={[
              styles.cityChip,
              selectedCity?.id === city.id && styles.activeCityChip,
            ]}
            onPress={() => fetchWeatherForCity(city)}
          >
            <Text
              style={[
                styles.cityChipText,
                selectedCity?.id === city.id && styles.activeCityChipText,
              ]}
            >
              {city.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <WeatherInfoCard
        city={selectedCity}
        weather={selectedWeather}
        loading={loadingWeather}
        errorMessage={errorMessage}
        onClose={closeWeatherCard}
      />
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
    marginBottom: 14,
  },
  cityChip: {
    backgroundColor: 'white',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  activeCityChip: {
    backgroundColor: '#123047',
  },
  cityChipText: {
    color: '#123047',
    fontWeight: '700',
  },
  activeCityChipText: {
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#123047',
  },
  infoSubtitle: {
    color: '#5f7482',
    marginTop: 2,
    maxWidth: 210,
  },
  infoText: {
    fontSize: 15,
    color: '#4d6675',
    lineHeight: 21,
    marginTop: 6,
  },
  bigTemperature: {
    fontSize: 54,
    fontWeight: '800',
    color: '#123047',
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#eef6fb',
    padding: 13,
    borderRadius: 16,
  },
  metricValue: {
    color: '#123047',
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#5f7482',
    marginTop: 4,
  },
  recommendation: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 21,
    color: '#253946',
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tipChip: {
    backgroundColor: '#eef6fb',
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  tipChipText: {
    color: '#123047',
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#eef6fb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  closeButtonText: {
    color: '#123047',
    fontWeight: '800',
  },
  loadingText: {
    marginTop: 8,
    color: '#4d6675',
    textAlign: 'center',
  },
  errorText: {
    color: '#b00020',
    fontSize: 15,
    marginBottom: 10,
  },
});