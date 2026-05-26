import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
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

function WeatherCard({ weather }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vejret lige nu</Text>

      <Text style={styles.weatherText}>
        Temperatur: {weather.temperature}°C
      </Text>

      <Text style={styles.weatherText}>
        Vind: {weather.windSpeed} km/t
      </Text>

      <Text style={styles.weatherText}>
        Regn: {weather.rain} mm
      </Text>
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
        renderItem={({ item }) => <Text style={styles.listItem}>• {item}</Text>}
      />
    </View>
  );
}

function ChatMessage({ item }) {
  return (
    <View
      style={[
        styles.chatBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.chatSender}>
        {item.sender === 'user' ? 'Dig' : 'AI'}
      </Text>
      <Text>{item.text}</Text>
    </View>
  );
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hej! Spørg mig om vejret, fx om du kan løbe, svømme eller tage ud.',
    },
  ]);
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

      setLocation({
        latitude,
        longitude,
      });

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

  function answerWeatherQuestion(question) {
    if (!weather) {
      return 'Jeg mangler vejrdata endnu, så prøv igen om lidt.';
    }

    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('løb') || lowerQuestion.includes('løbe')) {
      if (weather.temperature >= 10 && weather.temperature <= 22 && weather.rain === 0) {
        return 'Ja, vejret ser ret godt ud til løb. Temperaturen er passende, og der er ikke regn.';
      }

      return 'Du kan godt løbe, men vejret er ikke perfekt. Tjek især regn og vind før du tager afsted.';
    }

    if (lowerQuestion.includes('svøm') || lowerQuestion.includes('svømme')) {
      if (weather.temperature >= 20 && weather.rain === 0) {
        return 'Det ser okay ud til svømning, men du bør også tage højde for vandtemperaturen.';
      }

      return 'Svømning er nok ikke det mest oplagte lige nu, fordi vejret ikke virker varmt nok.';
    }

    if (lowerQuestion.includes('jakke') || lowerQuestion.includes('tøj')) {
      if (weather.temperature < 10) {
        return 'Ja, jeg ville tage jakke på. Temperaturen er lav.';
      }

      if (weather.rain > 0) {
        return 'Tag gerne en regnjakke med, fordi der er regn registreret.';
      }

      return 'En tung jakke virker ikke nødvendig lige nu, men en let jakke kan være fin.';
    }

    if (lowerQuestion.includes('cykel') || lowerQuestion.includes('cykle')) {
      if (weather.windSpeed > 30) {
        return 'Cykling kan blive lidt hårdt, fordi vinden er høj.';
      }

      return 'Cykling ser fint ud. Vinden er ikke alt for kraftig.';
    }

    return `Lige nu er temperaturen ${weather.temperature}°C, vinden er ${weather.windSpeed} km/t, og regnen er ${weather.rain} mm. Ud fra det virker vejret generelt ${weather.rain > 0 ? 'lidt ustabilt' : 'fornuftigt'}.`;
  }

  function sendChatMessage() {
    if (chatInput.trim() === '') {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
    };

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: answerWeatherQuestion(chatInput),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      aiMessage,
    ]);

    setChatInput('');
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Weather AI App</Text>

        <Text style={styles.subtitle}>
          Vejrbaseret anbefaling ud fra din lokation
        </Text>

        {weather && <WeatherCard weather={weather} />}

        <View style={styles.buttonContainer}>
          <Button title="Lav AI-analyse" onPress={createWeatherAnalysis} />
        </View>

        <AnalysisList analysis={analysis} />

        {location && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kort over vejr-lokationer</Text>

            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 1.5,
                longitudeDelta: 1.5,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Din lokation"
                description="Her henter appen vejret fra"
              />

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

            <Text style={styles.smallText}>
              Kortet viser byer uden automatisk at hente vejr for alle byer, så vi undgår for mange API-kald.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI-chat om vejret</Text>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage item={item} />}
            scrollEnabled={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Spørg fx: Kan jeg løbe i dag?"
            value={chatInput}
            onChangeText={setChatInput}
          />

          <Button title="Send spørgsmål" onPress={sendChatMessage} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef6fb',
  },
  container: {
    padding: 20,
    paddingTop: 60,
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
  buttonContainer: {
    marginBottom: 18,
  },
  listItem: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 21,
  },
  map: {
    height: 250,
    borderRadius: 14,
    marginBottom: 10,
  },
  smallText: {
    fontSize: 13,
    color: '#667',
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd7df',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#f8fbfd',
  },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#d7ebff',
  },
  aiBubble: {
    backgroundColor: '#eef1f3',
  },
  chatSender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});