import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 

// 1. TUKAR DI SINI: Kita guna { navigation } seperti skrin lain, bukan useRouter
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ralat', 'Sila masukkan e-mel dan kata laluan.');
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
        Alert.alert('Berjaya', json.message);
        // 3. TUKAR DI SINI: Guna navigation.navigate
        navigation.navigate('HomeScreen'); 
      } else {
        Alert.alert('Gagal', json.message);
      }
    } catch (error) {
      Alert.alert('Ralat XAMPP', 'Sila semak terminal VS Code untuk melihat punca ralat sebenar.');
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
          <View style={styles.logoYellowBox}>
            <Ionicons name="fast-food-outline" size={45} color="black" />
          </View>
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
            <TextInput style={styles.input} placeholder="enter your email" placeholderTextColor="#A9A9A9" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="enter your password" placeholderTextColor="#A9A9A9" value={password} onChangeText={setPassword} secureTextEntry={true} />
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
  logoYellowBox: { width: 90, height: 90, backgroundColor: '#FFC93C', borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  appNameText: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginTop: 10, letterSpacing: 0.5 },
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