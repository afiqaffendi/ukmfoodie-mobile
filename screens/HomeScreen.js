import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Image, Platform, StatusBar as RNStatusBar, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TAMBAHAN: Masukkan { navigation } di sini supaya kita boleh bertukar skrin
export default function HomeScreen({ navigation }) {
  const { showToast } = useToast();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ PENTING: Gantikan dengan IP Address laptop awak
  const API_URL = 'http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/get_all_stalls.php';

  useEffect(() => {
    checkAuth();
    fetchStalls();
  }, []);

  const checkAuth = async () => {
    const session = await AsyncStorage.getItem('userData');
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    }
  };

  const fetchStalls = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.status === 'success') {
        setStalls(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToMap = (latitude, longitude, stallName) => {
    if (!latitude || !longitude) {
      showToast("This stall hasn't set their location yet.", "info");
      return;
    }

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(stallName);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* === HEADER === */}
      <View style={styles.headerContainer}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.logoText}>UKMFoodie</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => navigation.navigate('CustomerProfileScreen')}
        >
          <Ionicons name="person-outline" size={18} color="#1A1A1A" />
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* === SEARCH BAR === */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find stalls,foods or location"
            placeholderTextColor="#888"
          />
        </View>


        {/* === LATEST STALLS LIST === */}

        {loading ? (
          <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
        ) : stalls.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No stalls available.</Text>
          </View>
        ) : (
          stalls.map((item, index) => {
            const isOpen = item.status === 'Buka';

            // Kod dinamik untuk path gambar
            const imagePath = item.stall_image && item.stall_image !== 'default_stall.jpg'
              ? `http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.stall_image}`
              : 'https://via.placeholder.com/600x400?text=No+Image'; // Gambar backup jika tiada

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                // TAMBAHAN: Letak fungsi onPress untuk pergi ke MenuScreen dan bawa data gerai (item)
                onPress={() => {
                  if (isOpen) {
                    navigation.navigate('MenuScreen', { stall: item });
                  } else {
                    showToast("This stall is currently closed. Please check back later.", "error");
                  }
                }}
              >

                {/* PEMBETULAN DI SINI: Gambar Gerai menggunakan uri: imagePath */}
                <Image source={{ uri: imagePath }} style={styles.cardImage} />

                {/* Info Gerai */}
                <View style={styles.cardContent}>

                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.stallName}>{item.stall_name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
                        {isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationGoRow}>
                    <View style={styles.locationBox}>
                      <Ionicons name="location-outline" size={14} color="#F1416C" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location_area || 'Lokasi tidak ditetapkan'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.goButton}
                      onPress={() => handleGoToMap(item.latitude, item.longitude, item.stall_name)}
                    >
                      <MaterialCommunityIcons name="map-marker-path" size={18} color="#1A1A1A" />
                      <Text style={styles.goText}>Go</Text>
                    </TouchableOpacity>
                  </View>

                  {/* TAMBAHAN: Paparan Rating (Sekarang di bawah lokasi) */}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FFC93C" />
                    <Text style={styles.ratingText}>
                      {parseFloat(item.avg_rating || 0).toFixed(1)} 
                    </Text>
                    <Text style={styles.reviewCountText}>
                      ({item.total_reviews || 0} reviews)
                    </Text>
                  </View>

                </View>
              </TouchableOpacity>
            );
          })
        )}

      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiFloatingBtn}
        onPress={() => navigation.navigate('AIChatScreen')}
      >
        <MaterialCommunityIcons name="robot" size={30} color="#1A1A1A" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Latar belakang kelabu sangat lembut
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#FFC93C',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileBox: {
    backgroundColor: '#FFC93C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#50CD89',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },

  // Cards
  card: {
    backgroundColor: '#EAEBEE', // Latar bawah kad sedikit kelabu
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textOpen: {
    color: '#50CD89',
  },
  textClosed: {
    color: '#F1416C',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 5,
  },
  reviewCountText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  locationGoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 6,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
  },
  aiFloatingBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FFC93C',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});