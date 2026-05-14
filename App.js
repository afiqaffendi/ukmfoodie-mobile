import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 1. Import fail RegisterScreen yang awak dah ada
import LoginScreen from './screens/LoginScreen'; 
import HomeScreen from './screens/HomeScreen'; 
import MenuScreen from './screens/MenuScreen';
import RegisterScreen from './screens/RegisterScreen'; 
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderStatusScreen from './screens/OrderStatusScreen';
import CustomerOrderScreen from './screens/CustomerOrderScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';
import ChatScreen from './screens/ChatScreen';
import AIChatScreen from './screens/AIChatScreen';
import { ToastProvider } from './components/Toast';
import { AlertProvider } from './components/CustomAlert';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFC93C',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EAEBEE',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={CustomerOrderScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <ToastProvider>
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
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
          
          {/* We keep HomeScreen in stack just in case, but usually it's accessed via MainTabs */}
          
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
          
          <Stack.Screen 
            name="CustomerProfileScreen" 
            component={CustomerProfileScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ChatScreen" 
            component={ChatScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AIChatScreen" 
            component={AIChatScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  </AlertProvider>
  );
}