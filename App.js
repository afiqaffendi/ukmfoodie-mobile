import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Panggil kedua-dua skrin yang awak dah buat tadi
// (Pastikan path folder ./screens/ ini betul mengikut susunan folder awak)
import HomeScreen from './screens/HomeScreen'; 
import MenuScreen from './screens/MenuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        
        {/* Daftarkan HomeScreen */}
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ headerShown: false }} // Kita sorokkan header asal (sebab UI awak dah ada header sendiri)
        />
        
        {/* Daftarkan MenuScreen */}
        <Stack.Screen 
          name="MenuScreen" 
          component={MenuScreen} 
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}