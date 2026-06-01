import React, { useState, useEffect, useRef } from 'react';
import { IP_ADDRESS, API_BASE } from '../constants/config';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, Animated, Easing, Modal, ActivityIndicator } from 'react-native';
import { useAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. TUKAR DI SINI: Kita guna { navigation } seperti skrin lain, bukan useRouter
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showAlert } = useAlert();

  // Forgot password state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);

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
    checkSession();

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
      const API_URL = `${API_BASE}/login.php`;

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

  const handleVerifyEmail = async () => {
    if (!forgotEmail) {
      showAlert('Error', 'Please enter your registered email address.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE}/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const json = await response.json();
      if (json.status === 'success') {
        setForgotStep(2);
      } else {
        showAlert('Failed', json.message, 'error');
      }
    } catch (error) {
      showAlert('Error', 'Could not connect to server. Please check your connection.', 'error');
      console.error(error);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showAlert('Error', 'Please enter a password with at least 6 characters.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, password: newPassword })
      });
      const json = await response.json();
      if (json.status === 'success') {
        showAlert('Success', json.message, 'success');
        setForgotModalVisible(false);
        setForgotEmail('');
        setNewPassword('');
        setForgotStep(1);
      } else {
        showAlert('Failed', json.message, 'error');
      }
    } catch (error) {
      showAlert('Error', 'Could not connect to server.', 'error');
      console.error(error);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="enter your email" placeholderTextColor="#A0AEC0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="enter your password" placeholderTextColor="#A0AEC0" value={password} onChangeText={setPassword} secureTextEntry={true} />
            </View>

            <TouchableOpacity 
              style={styles.forgotContainer} 
              onPress={() => {
                setForgotStep(1);
                setForgotEmail('');
                setNewPassword('');
                setForgotModalVisible(true);
              }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <View style={styles.registerTextContainer}>
              <Text style={styles.dontHaveText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.registerLink}>Register here!</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.guestButton} 
              onPress={async () => {
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.setItem('guestMode', 'true');
                navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
              }}
            >
              <Ionicons name="eye-outline" size={18} color="#718096" style={{ marginRight: 8 }} />
              <Text style={styles.guestButtonText}>Browse as Guest</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={forgotModalVisible}
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Forgot Password</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setForgotModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Enter your registered email address to verify your account.
                </Text>
                
                <Text style={styles.modalInputLabel}>Email Address</Text>
                <View style={styles.modalInputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.modalInputIcon} />
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="E.g. yourname@gmail.com"
                    placeholderTextColor="#A0AEC0"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.modalBtn} 
                  onPress={handleVerifyEmail}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.modalBtnText}>Verify Email</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Verification successful! Please enter your new password below.
                </Text>
                
                <Text style={styles.modalInputLabel}>New Password</Text>
                <View style={styles.modalInputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.modalInputIcon} />
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="Min 6 characters"
                    placeholderTextColor="#A0AEC0"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.modalBtn} 
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.modalBtnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, // Slightly lighter bg to let shapes pop

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

  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingTop: 35, paddingBottom: 20 },
  logoSection: { alignItems: 'center', marginBottom: 15 },
  mainLogo: { width: 120, height: 120, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFC93C', shadowColor: '#FFC93C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  appNameText: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginTop: 12, letterSpacing: 0.5 },
  welcomeSection: { alignItems: 'center', marginBottom: 8 },
  welcomeTitle: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1, marginBottom: 5 },
  formSection: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#1A1A1A', marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 15, height: 60, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1.5, borderColor: '#A0AEC0' },
  inputIcon: { marginRight: 12, color: '#4A5568' },
  input: { flex: 1, fontSize: 16, color: '#2D3748', fontWeight: '500' },
  buttonSection: { alignItems: 'center', marginTop: 5 },
  loginButton: { width: '100%', height: 60, backgroundColor: '#1A1A1A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  registerTextContainer: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  dontHaveText: { fontSize: 14, color: '#718096', fontWeight: '500' },
  registerLink: { fontSize: 14, color: '#FFC93C', fontWeight: '800' },
  guestButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 35, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#FFC93C', 
    backgroundColor: '#FFFDF0',
    width: '70%',
    height: 55,
  },
  guestButtonText: { 
    color: '#1A1A1A', 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 5,
  },
  forgotText: {
    color: '#FFC93C',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    width: '100%',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 55,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalInputIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 5,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});