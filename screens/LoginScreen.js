import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. TUKAR DI SINI: Kita guna { navigation } seperti skrin lain, bukan useRouter
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showAlert } = useAlert();
  
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const session = await AsyncStorage.getItem('userData');
    if (session) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter email and password.', 'error');
      return;
    }

    try {
      const API_URL = 'http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/login.php';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // 2. PERANGKAP DEBUG: Baca sebagai teks biasa dahulu
      const rawText = await response.text();
      console.log("JAWAPAN DARI XAMPP: ", rawText); // Lihat terminal VS Code!

      // Cuba tukar teks kepada format JSON
      const json = JSON.parse(rawText);

      if (json.status === 'success') {
        // Simpan data user ke AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(json.data));

        showAlert('Success', json.message, 'success');
        // 3. TUKAR DI SINI: Guna navigation.reset supaya tak boleh tekan 'Back' balik ke Login
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        showAlert('Failed', json.message, 'error');
      }
    } catch (error) {
      showAlert('Server Error', 'Could not connect to server. Please check your connection.', 'error');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.mainLogo}
            resizeMode="contain"
          />
          <Text style={styles.appNameText}>UKMFoodie</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>WELCOME</Text>
          <Text style={styles.welcomeSubTitle}>Please Login to continue</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="enter your email" placeholderTextColor="#D1D5DB" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="enter your password" placeholderTextColor="#D1D5DB" value={password} onChangeText={setPassword} secureTextEntry={true} />
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          <View style={styles.registerTextContainer}>
            <Text style={styles.dontHaveText}>Don't have an account? </Text>
            {/* 4. TUKAR DI SINI: Guna TouchableOpacity biasa untuk Daftar */}
            <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
              <Text style={styles.registerLink}>Register here!</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  logoSection: { alignItems: 'center', marginBottom: 20 },
  mainLogo: { width: 120, height: 120, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFC93C' },
  appNameText: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginTop: 5, letterSpacing: 0.5 },
  welcomeSection: { alignItems: 'center', marginBottom: 40 },
  welcomeTitle: { fontSize: 36, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 1, marginBottom: 5 },
  welcomeSubTitle: { fontSize: 16, color: '#666666' },
  formSection: { width: '100%', marginBottom: 30 },
  inputLabel: { fontSize: 16, color: '#666666', marginBottom: 8, fontWeight: '500' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 20, borderWidth: 1, borderColor: '#E6E6E8' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333333' },
  buttonSection: { alignItems: 'center', marginTop: 10 },
  loginButton: { width: '100%', height: 60, backgroundColor: '#FFB74D', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#FFB74D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  registerTextContainer: { flexDirection: 'row', marginTop: 25 },
  dontHaveText: { fontSize: 14, color: '#666666' },
  registerLink: { fontSize: 14, color: '#666666', fontWeight: 'bold', textDecorationLine: 'underline' },
});