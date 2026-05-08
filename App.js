import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Import fail RegisterScreen yang awak dah ada
import LoginScreen from './screens/LoginScreen'; 
import HomeScreen from './screens/HomeScreen'; 
import MenuScreen from './screens/MenuScreen';
import RegisterScreen from './screens/RegisterScreen'; 
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderStatusScreen from './screens/OrderStatusScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        {/* 2. Daftar skrin Register di sini */}
        <Stack.Screen 
          name="RegisterScreen" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="MenuScreen" 
          component={MenuScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CartScreen" 
          component={CartScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="CheckoutScreen" 
          component={CheckoutScreen} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="OrderStatusScreen" 
          component={OrderStatusScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}