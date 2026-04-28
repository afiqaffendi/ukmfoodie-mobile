import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Link, useRouter } from 'expo-router'; // Tambah useRouter untuk navigasi selepas berjaya

export default function RegisterScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User');

  // FUNGSI UNTUK HANTAR DATA KE DATABASE
  const handleRegister = async () => {
    // 1. Semak jika ada kotak yang kosong
    if (!fullName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Ralat', 'Sila isi semua maklumat!');
      return;
    }

    // 2. Semak jika kata laluan sepadan
    if (password !== confirmPassword) {
      Alert.alert('Ralat', 'Kata laluan tidak sepadan!');
      return;
    }

    try {
      // SILA TUKAR 192.168.X.X KEPADA ALAMAT IPv4 LAPTOP AWAK
      const API_URL = 'http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/register.php';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname: fullName,
          phone: phone,
          email: email,
          password: password,
          role: role
        })
      });

      const json = await response.json();

      if (json.status === 'success') {
        Alert.alert('Berjaya!', json.message);
        // Kembali ke skrin Log Masuk selepas berjaya daftar
        router.push('/'); 
      } else {
        Alert.alert('Gagal', json.message);
      }
    } catch (error) {
      Alert.alert('Ralat Rangkaian', 'Sila pastikan XAMPP berjalan dan IP adalah betul.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar style="dark" />
        
        {/* === SECTION TOP HEADER (LOGO) === */}
        <View style={styles.topHeader}>
          <View style={styles.headerLogoBox}>
            <MaterialCommunityIcons name="food-fork-drink" size={20} color="black" />
          </View>
          <Text style={styles.headerAppName}>UKMFoodie</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* === BACK BUTTON === */}
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
          </Link>

          {/* === SECTION TITLE === */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>REGISTER AN ACCOUNT</Text>
            <Text style={styles.subTitle}>Welcome to UKMFoodie!</Text>
          </View>

          {/* === SECTION FORM INPUT === */}
          <View style={styles.formSection}>
            
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="please enter your full name" placeholderTextColor="#A9A9A9" value={fullName} onChangeText={setFullName} />
            </View>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="eg: 012-3456789" placeholderTextColor="#A9A9A9" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="eg: ali@siswa.ukm.edu.my" placeholderTextColor="#A9A9A9" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Text style={styles.inputLabel}>Create Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="min 6 character" placeholderTextColor="#A9A9A9" value={password} onChangeText={setPassword} secureTextEntry={true} />
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="min 6 character" placeholderTextColor="#A9A9A9" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />
            </View>

          </View>

          {/* === SECTION ROLE SELECTION === */}
          <Text style={styles.roleLabel}>Please choose your role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity style={[styles.roleButton, role === 'User' && styles.roleButtonActive]} onPress={() => setRole('User')}>
              <Text style={[styles.roleText, role === 'User' && styles.roleTextActive]}>User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.roleButton, role === 'Seller' && styles.roleButtonActive]} onPress={() => setRole('Seller')}>
              <Text style={[styles.roleText, role === 'Seller' && styles.roleTextActive]}>Seller</Text>
            </TouchableOpacity>
          </View>

          {/* === SECTION BUTTON & LINK === */}
          {/* PANGGIL FUNGSI handleRegister DI SINI */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleRegister}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <View style={styles.loginTextContainer}>
            <Text style={styles.alreadyHaveText}>Already have an account? </Text>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stylesheet kekal sama, saya sertakan supaya tak perlu salin tampal banyak kali
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F8FA' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 40 },
  topHeader: { alignItems: 'center', paddingTop: 10, paddingBottom: 15, backgroundColor: '#EEEEF0' },
  headerLogoBox: { width: 45, height: 45, backgroundColor: '#FFC93C', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerAppName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginTop: 5 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 },
  backButtonText: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 2 },
  titleSection: { alignItems: 'center', marginBottom: 25 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 0.5 },
  subTitle: { fontSize: 14, color: '#666666', marginTop: 2 },
  formSection: { width: '100%' },
  inputLabel: { fontSize: 14, color: '#666666', marginBottom: 6, fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 15, height: 55, marginBottom: 15, borderWidth: 1, borderColor: '#E6E6E8' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#333333' },
  roleLabel: { fontSize: 14, color: '#666666', fontWeight: 'bold', textAlign: 'center', marginTop: 10, marginBottom: 10 },
  roleContainer: { flexDirection: 'row', backgroundColor: '#EAEAEA', borderRadius: 10, padding: 4, width: '60%', alignSelf: 'center', marginBottom: 25 },
  roleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  roleButtonActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  roleText: { fontSize: 14, color: '#888888', fontWeight: 'bold' },
  roleTextActive: { color: '#1A1A1A' },
  signUpButton: { width: '100%', height: 55, backgroundColor: '#FFB74D', borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#FFB74D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  signUpButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loginTextContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  alreadyHaveText: { fontSize: 14, color: '#666666' },
  loginLink: { fontSize: 14, color: '#666666', fontWeight: 'bold', textDecorationLine: 'underline' },
});