import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

function SendButton({ onPress }) {
  return (
    <Pressable style={styles.sendButton} onPress={onPress}>
      <Text style={styles.sendButtonText}>Send</Text>
    </Pressable>
  );
}

function ChatMessage({ item }) {
  const isUser = item.sender === 'user';

  return (
    <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
      <View style={[styles.chatBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.chatSender}>{isUser ? 'Dig' : 'AI'}</Text>
        <Text style={styles.chatText}>{item.text}</Text>
      </View>
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

  return `Ud fra de aktuelle vejrdata er temperaturen ${temperature}°C, vinden er ${windSpeed} km/t, og regnen er ${rain} mm. Spørg gerne mere specifikt om løb, cykling, svømning, tøj, regn eller vind.`;
}

export default function ChatScreen({ route }) {
  const weather = route.params?.weather;

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hej! Spørg mig om vejret, aktiviteter eller hvad du bør tage på.',
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
        <Text style={styles.title}>AI-chat</Text>

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

          <SendButton onPress={sendChatMessage} />
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
    paddingTop: 26,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#123047',
    marginBottom: 18,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '82%',
    padding: 13,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#1f7a9c',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  chatSender: {
    fontWeight: '800',
    marginBottom: 4,
    color: '#123047',
  },
  chatText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#253946',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    padding: 12,
    maxHeight: 110,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#1f7a9c',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 15,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '800',
  },
});