import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function CustomerProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { showAlert } = useAlert();

  const IP_ADDRESS = 'campsite-feisty-nephew.ngrok-free.dev';
  const API_BASE = `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api`;

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const session = await AsyncStorage.getItem('userData');
      if (session) {
        const parsed = JSON.parse(session);
        fetchProfile(parsed.id);
      } else {
        navigation.replace('LoginScreen');
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/fetch_profile.php?user_id=${userId}`);
      const result = await response.json();
      if (result.status === 'success') {
        const data = result.data;
        setUserData(data);
        setFullname(data.fullname);
        setPhone(data.phone);
        setEmail(data.email);
        if (data.profile_picture && data.profile_picture !== 'default_profile.png') {
          setImage(`${API_BASE}/uploads/${data.profile_picture}`);
        }
      } else {
        showAlert("Failed", result.message || "Failed to fetch profile data.", "error");
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      showAlert("Network Error", "Please ensure your phone is on the same WiFi as the server (IP: " + IP_ADDRESS + ")", "error");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!fullname || !phone) {
      showAlert("Error", "Please fill in your name and phone number.", "warning");
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append('user_id', userData.id);
    formData.append('fullname', fullname);
    formData.append('phone', phone);

    if (image && !image.startsWith('http')) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('profile_picture', { uri: image, name: filename, type });
    }

    try {
      const response = await fetch(`${API_BASE}/update_profile.php`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      if (result.status === 'success') {
        showAlert("Success", "Your profile has been updated.", "success");
        fetchProfile(userData.id);
      } else {
        showAlert("Failed", result.message, "error");
      }
    } catch (error) {
      showAlert("Error", "Failed to connect to server.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    showAlert(
      "Logout Confirmation",
      "Are you sure you want to log out?",
      "warning",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFC93C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImg} />
            ) : (
              <View style={styles.placeholderImg}>
                <Ionicons name="person" size={50} color="#CCC" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Your Name"
            />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="01X-XXXXXXX"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.updateBtn, updating && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#F1416C" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  imageSection: { alignItems: 'center', marginBottom: 35 },
  imageWrapper: { position: 'relative' },
  profileImg: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFC93C' },
  placeholderImg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFC93C' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FFC93C', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  emailText: { marginTop: 15, fontSize: 16, color: '#666', fontWeight: '500' },
  form: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  updateBtn: { backgroundColor: '#1A1A1A', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  updateBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40, padding: 15 },
  logoutBtnText: { color: '#F1416C', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Static Abstract Background
  staticBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  staticLine1: {
    position: 'absolute',
    top: 100,
    left: -150,
    width: 600,
    height: 40,
    backgroundColor: '#FFC93C',
    opacity: 0.12,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine2: {
    position: 'absolute',
    top: 350,
    right: -250,
    width: 800,
    height: 55,
    backgroundColor: '#1A1A1A',
    opacity: 0.05,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine3: {
    position: 'absolute',
    bottom: 250,
    left: -200,
    width: 700,
    height: 70,
    backgroundColor: '#FFC93C',
    opacity: 0.08,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine4: {
    position: 'absolute',
    bottom: 0,
    right: -100,
    width: 500,
    height: 35,
    backgroundColor: '#1A1A1A',
    opacity: 0.06,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine5: {
    position: 'absolute',
    top: -30,
    right: -50,
    width: 400,
    height: 25,
    backgroundColor: '#1A1A1A',
    opacity: 0.04,
    transform: [{ rotate: '-45deg' }]
  }
});
