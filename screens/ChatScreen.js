import { useState } from 'react';
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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

      <Text style={styles.chatText}>{item.text}</Text>
    </View>
  );
}

function answerWeatherQuestion(question, weather) {
  if (!weather) {
    return 'Jeg mangler vejrdata. Gå tilbage til forsiden og hent vejret først.';
  }

  const lowerQuestion = question.toLowerCase();

  const temperature = weather.temperature;
  const windSpeed = weather.windSpeed;
  const rain = weather.rain;

  const isCold = temperature < 10;
  const isMild = temperature >= 10 && temperature <= 22;
  const isWarm = temperature > 22;
  const isWindy = windSpeed > 30;
  const isRaining = rain > 0;

  if (
    lowerQuestion.includes('løb') ||
    lowerQuestion.includes('løbe') ||
    lowerQuestion.includes('jogge') ||
    lowerQuestion.includes('træne') ||
    lowerQuestion.includes('motion')
  ) {
    if (isRaining) {
      return `Jeg ville være lidt forsigtig med løb lige nu. Temperaturen er ${temperature}°C, men der er regn, så det kan blive glat og mindre behageligt.`;
    }

    if (isWindy) {
      return `Du kan godt løbe, men vinden er på ${windSpeed} km/t, så det kan føles hårdere end normalt.`;
    }

    if (isMild) {
      return `Ja, vejret er ret godt til løb. Temperaturen er ${temperature}°C, der er ${rain} mm regn, og vinden er ${windSpeed} km/t.`;
    }

    if (isCold) {
      return `Du kan godt løbe, men det er koldt med ${temperature}°C. Tag gerne en ekstra trøje, hue eller handsker på.`;
    }

    return `Det kan godt bruges til løb, men med ${temperature}°C kan det føles lidt varmt. Husk vand og undgå at løbe for hårdt.`;
  }

  if (
    lowerQuestion.includes('svøm') ||
    lowerQuestion.includes('svømme') ||
    lowerQuestion.includes('strand') ||
    lowerQuestion.includes('bade') ||
    lowerQuestion.includes('badetur')
  ) {
    if (temperature >= 22 && !isRaining) {
      return `Vejret virker godt til strand eller svømning. Temperaturen er ${temperature}°C, og der er ikke registreret regn.`;
    }

    if (isRaining) {
      return `Jeg ville ikke anbefale svømning lige nu, fordi der er regn. Temperaturen er ${temperature}°C, så det virker ikke særlig oplagt.`;
    }

    return `Svømning er nok ikke helt oplagt lige nu. Temperaturen er ${temperature}°C, så det kan føles lidt køligt, især hvis vandet også er koldt.`;
  }

  if (
    lowerQuestion.includes('cykel') ||
    lowerQuestion.includes('cykle') ||
    lowerQuestion.includes('transport') ||
    lowerQuestion.includes('pendle')
  ) {
    if (isWindy) {
      return `Cykling kan blive hårdt lige nu, fordi vinden er ${windSpeed} km/t. Især modvind kan gøre turen tung.`;
    }

    if (isRaining) {
      return `Du kan godt cykle, men jeg ville tage regntøj på, fordi der er registreret ${rain} mm regn.`;
    }

    return `Cykling ser fint ud. Temperaturen er ${temperature}°C, vinden er ${windSpeed} km/t, og der er ikke meget regn.`;
  }

  if (
    lowerQuestion.includes('jakke') ||
    lowerQuestion.includes('tøj') ||
    lowerQuestion.includes('tage på') ||
    lowerQuestion.includes('outfit') ||
    lowerQuestion.includes('klæde')
  ) {
    if (isCold && isRaining) {
      return `Ja, tag en varm jakke og helst noget vandtæt. Det er ${temperature}°C, og der er regn.`;
    }

    if (isCold) {
      return `Ja, jeg ville tage jakke på. ${temperature}°C er ret køligt, især hvis du skal være ude længe.`;
    }

    if (isRaining) {
      return `Du behøver måske ikke en tyk jakke, men en regnjakke er en god idé, fordi der er regn.`;
    }

    if (isWarm) {
      return `Nej, en tung jakke virker ikke nødvendig. Det er ${temperature}°C, så let tøj burde være nok.`;
    }

    return `En let jakke kan være fin. Temperaturen er ${temperature}°C, så det afhænger lidt af, hvor længe du skal være ude.`;
  }

  if (
    lowerQuestion.includes('gåtur') ||
    lowerQuestion.includes('gå') ||
    lowerQuestion.includes('tur') ||
    lowerQuestion.includes('udenfor') ||
    lowerQuestion.includes('luft')
  ) {
    if (isRaining) {
      return `En gåtur kan stadig lade sig gøre, men tag paraply eller regnjakke med. Der er ${rain} mm regn.`;
    }

    if (isWindy) {
      return `Det kan godt være fint til en gåtur, men vinden på ${windSpeed} km/t kan gøre det lidt køligere.`;
    }

    return `Det ser fint ud til en gåtur. Temperaturen er ${temperature}°C, og vejret virker forholdsvis roligt.`;
  }

  if (
    lowerQuestion.includes('godt vejr') ||
    lowerQuestion.includes('dårligt vejr') ||
    lowerQuestion.includes('hvordan er vejret') ||
    lowerQuestion.includes('vurder') ||
    lowerQuestion.includes('anbefal')
  ) {
    if (!isRaining && isMild && !isWindy) {
      return `Vejret ser generelt godt ud. ${temperature}°C, lav regn og vind på ${windSpeed} km/t gør det behageligt til de fleste udendørsaktiviteter.`;
    }

    if (isRaining && isWindy) {
      return `Vejret virker lidt ustabilt. Der er både regn og en del vind, så det er ikke optimalt til udendørsaktiviteter.`;
    }

    if (isCold) {
      return `Vejret er okay, men ret koldt med ${temperature}°C. Det kræver lidt varmere tøj.`;
    }

    return `Vejret er blandet. Temperaturen er ${temperature}°C, vinden er ${windSpeed} km/t, og regnen er ${rain} mm.`;
  }

  if (
    lowerQuestion.includes('regn') ||
    lowerQuestion.includes('paraply') ||
    lowerQuestion.includes('vådt') ||
    lowerQuestion.includes('regner')
  ) {
    if (isRaining) {
      return `Ja, der er registreret regn på ${rain} mm. Jeg ville tage paraply eller regnjakke med.`;
    }

    return `Der er ikke registreret regn lige nu, så paraply virker ikke nødvendig.`;
  }

  if (
    lowerQuestion.includes('vind') ||
    lowerQuestion.includes('blæser') ||
    lowerQuestion.includes('storm') ||
    lowerQuestion.includes('modvind')
  ) {
    if (isWindy) {
      return `Det blæser en del. Vinden er ${windSpeed} km/t, så det kan mærkes tydeligt udenfor.`;
    }

    return `Vinden virker ikke særlig voldsom lige nu. Den ligger på ${windSpeed} km/t.`;
  }

  if (
    lowerQuestion.includes('koldt') ||
    lowerQuestion.includes('varmt') ||
    lowerQuestion.includes('temperatur')
  ) {
    if (isCold) {
      return `Det er ret koldt lige nu med ${temperature}°C. Jeg ville tage varmt tøj på.`;
    }

    if (isWarm) {
      return `Det er forholdsvis varmt med ${temperature}°C. Det kan være behageligt, men husk vand hvis du skal være aktiv.`;
    }

    return `Temperaturen er mild med ${temperature}°C. Det passer godt til mange udendørsaktiviteter.`;
  }

  return `Ud fra de aktuelle vejrdata er temperaturen ${temperature}°C, vinden er ${windSpeed} km/t, og regnen er ${rain} mm. Spørg gerne mere specifikt, fx om løb, cykling, svømning, tøj, regn, vind eller gåtur.`;
}

export default function ChatScreen({ route }) {
  const weather = route.params?.weather;

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hej! Spørg mig om vejret, fx om du kan løbe, svømme, cykle, tage på stranden eller hvilken jakke du skal tage på.',
    },
  ]);

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
      text: answerWeatherQuestion(chatInput, weather),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      aiMessage,
    ]);

    setChatInput('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>AI-chat om vejret</Text>

        <Text style={styles.description}>
          Stil spørgsmål om aktiviteter, tøj, regn, vind eller om vejret passer
          til dine planer.
        </Text>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage item={item} />}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Spørg fx: Kan jeg løbe i dag?"
            value={chatInput}
            onChangeText={setChatInput}
            multiline
          />

          <Button title="Send" onPress={sendChatMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef6fb',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#123047',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#4d6675',
    lineHeight: 21,
    marginBottom: 16,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#eef6fb',
    paddingTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd7df',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    minHeight: 46,
    maxHeight: 100,
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
    backgroundColor: '#ffffff',
  },
  chatSender: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#123047',
  },
  chatText: {
    fontSize: 15,
    lineHeight: 21,
  },
});