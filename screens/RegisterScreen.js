import React, { useState, useEffect, useRef } from 'react';
import { IP_ADDRESS, API_BASE } from '../constants/config';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar as RNStatusBar, Image, Animated, Easing } from 'react-native';
import { useAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. TUKAR: Guna { navigation }, buang useRouter
export default function RegisterScreen({ navigation }) {
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role = 'customer'; // Default role for app users

  // Animation values (Independent)
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;
  
  const spinAnim1 = useRef(new Animated.Value(0)).current;
  const spinAnim2 = useRef(new Animated.Value(0)).current;
  const spinAnim3 = useRef(new Animated.Value(0)).current;
  const spinAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startFloat = (anim, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    };

    const startSpin = (anim, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    };

    startFloat(floatAnim1, 4000);
    startFloat(floatAnim2, 6000);
    startFloat(floatAnim3, 8000);
    startFloat(floatAnim4, 5000);

    startSpin(spinAnim1, 15000);
    startSpin(spinAnim2, 20000);
    startSpin(spinAnim3, 12000);
    startSpin(spinAnim4, 18000);
  }, []);

  const handleRegister = async () => {
    if (!fullName || !phone || !email || !password || !confirmPassword) {
      showAlert('Error', 'Please fill in all information!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match!', 'error');
      return;
    }

    try {
      // Pastikan IP ini tepat dengan IP Hotspot awak
      const API_URL = `${API_BASE}/register.php`;

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
          role: role.toLowerCase() // Pastikan huruf kecil untuk database
        })
      });

      // 2. DEBUG: Baca jawapan XAMPP sebagai teks dahulu
      const rawText = await response.text();
      console.log("JAWAPAN DAFTAR DARI XAMPP: ", rawText);

      const json = JSON.parse(rawText);

      if (json.status === 'success') {
        showAlert('Success!', json.message, 'success');
        // 3. TUKAR: Kembali ke LoginScreen guna navigate
        navigation.navigate('LoginScreen');
      } else {
        showAlert('Failed', json.message, 'error');
      }
    } catch (error) {
      showAlert('Network Error', 'Could not connect to server.', 'error');
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

        {/* Food App Themed Background Shapes (Animated Icons) */}
        <View style={styles.backgroundShapes}>
          <Animated.View style={[
            styles.foodIcon1, 
            { 
              transform: [
                { translateY: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [-50, 100] }) },
                { translateX: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [-20, 60] }) },
                { rotate: spinAnim1.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '40deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="fast-food" size={160} color="rgba(255, 107, 107, 0.12)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon2, 
            { 
              transform: [
                { translateY: floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [40, -120] }) },
                { translateX: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [20, -50] }) },
                { rotate: spinAnim2.interpolate({ inputRange: [0, 1], outputRange: ['20deg', '-30deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="pizza" size={200} color="rgba(255, 160, 122, 0.1)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon3, 
            { 
              transform: [
                { translateX: floatAnim4.interpolate({ inputRange: [0, 1], outputRange: [-80, 90] }) },
                { translateY: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [-30, 70] }) },
                { rotate: spinAnim3.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '20deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="restaurant" size={130} color="rgba(78, 205, 196, 0.12)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon4, 
            { 
              transform: [
                { translateY: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [100, -90] }) },
                { translateX: floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [40, -60] }) },
                { rotate: spinAnim4.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="cafe" size={150} color="rgba(132, 94, 194, 0.1)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon5, 
            { 
              transform: [
                { translateX: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [120, -80] }) },
                { translateY: floatAnim4.interpolate({ inputRange: [0, 1], outputRange: [-60, 50] }) },
                { rotate: spinAnim2.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '50deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="ice-cream" size={120} color="rgba(255, 150, 113, 0.12)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon6, 
            { 
              transform: [
                { translateY: floatAnim4.interpolate({ inputRange: [0, 1], outputRange: [-100, 110] }) },
                { translateX: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [-40, 70] }) },
                { rotate: spinAnim3.interpolate({ inputRange: [0, 1], outputRange: ['30deg', '-20deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="nutrition" size={140} color="rgba(0, 201, 167, 0.1)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon7, 
            { 
              transform: [
                { translateX: floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [-90, 80] }) },
                { translateY: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [40, -60] }) },
                { rotate: spinAnim1.interpolate({ inputRange: [0, 1], outputRange: ['15deg', '-45deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="water" size={110} color="rgba(44, 115, 210, 0.12)" />
          </Animated.View>

          <Animated.View style={[
            styles.foodIcon8, 
            { 
              transform: [
                { translateY: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [120, -100] }) },
                { translateX: floatAnim4.interpolate({ inputRange: [0, 1], outputRange: [50, -50] }) },
                { rotate: spinAnim4.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '30deg'] }) }
              ] 
            }
          ]}>
            <Ionicons name="basket" size={130} color="rgba(214, 93, 177, 0.08)" />
          </Animated.View>
        </View>

        <View style={styles.topHeader}>
          {/* 4. TUKAR: Butang Back dipindahkan ke topHeader sebagai 'absolute' */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>

          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerAppName}>UKMFoodie</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>REGISTER AN ACCOUNT</Text>
            <Text style={styles.subTitle}>Welcome to UKMFoodie!</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="please enter your full name" placeholderTextColor="#CBD5E0" value={fullName} onChangeText={setFullName} />
            </View>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="eg: 012-3456789" placeholderTextColor="#CBD5E0" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="eg: ali@siswa.ukm.edu.my" placeholderTextColor="#CBD5E0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Text style={styles.inputLabel}>Create Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="min 6 character" placeholderTextColor="#CBD5E0" value={password} onChangeText={setPassword} secureTextEntry={true} />
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="min 6 character" placeholderTextColor="#CBD5E0" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />
            </View>
          </View>



          <TouchableOpacity style={styles.signUpButton} onPress={handleRegister}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginTextContainer}>
            <Text style={styles.alreadyHaveText}>Already have an account? </Text>
            {/* 5. TUKAR: Navigasi ke LoginScreen */}
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 40 },
  topHeader: { alignItems: 'center', paddingTop: 10, paddingBottom: 15, backgroundColor: 'transparent', position: 'relative' },
  headerLogo: { width: 45, height: 45, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFC93C' },
  headerAppName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginTop: 5 },
  backButton: { position: 'absolute', left: 25, top: 15, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  backButtonText: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 2 },
  titleSection: { alignItems: 'center', marginBottom: 25, marginTop: 15 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 0.5 },
  subTitle: { fontSize: 14, color: '#666666', marginTop: 2 },
  formSection: { width: '100%' },
  inputLabel: { fontSize: 14, color: '#1A1A1A', marginBottom: 6, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 15, height: 55, marginBottom: 15, borderWidth: 1.5, borderColor: '#A0AEC0' },
  inputIcon: { marginRight: 10, color: '#4A5568' },
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

  // Abstract Shapes Styles (Food Icons)
  backgroundShapes: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  foodIcon1: {
    position: 'absolute',
    top: -20,
    right: -40,
  },
  foodIcon2: {
    position: 'absolute',
    top: '35%',
    left: -70,
  },
  foodIcon3: {
    position: 'absolute',
    bottom: '15%',
    right: -30,
  },
  foodIcon4: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  foodIcon5: {
    position: 'absolute',
    top: '15%',
    left: -30,
  },
  foodIcon6: {
    position: 'absolute',
    top: '55%',
    right: -50,
  },
  foodIcon7: {
    position: 'absolute',
    bottom: '40%',
    left: 40,
  },
  foodIcon8: {
    position: 'absolute',
    top: '75%',
    right: 40,
  },
});