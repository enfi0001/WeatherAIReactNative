import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#123047',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Weather AI' }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'AI-chat' }}
        />

        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'Vejrkort' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}