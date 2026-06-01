import React, { useState, useEffect, useRef } from 'react';
import { IP_ADDRESS, API_BASE } from '../constants/config';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Animated, Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';

const { width: windowWidth } = Dimensions.get('window');

export default function LocationSearchScreen({ navigation }) {
  const { showToast } = useToast();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // STATIC LOCATIONS LIST (SYNCED WITH SELLER PORTAL)
  const ALL_LOCATIONS = [
    { name: "Kolej Pendeta Za'ba", category: "Kolej" },
    { name: "Kolej Keris Mas", category: "Kolej" },
    { name: "Kolej Tun Hussein Onn", category: "Kolej" },
    { name: "Kolej Aminuddin Baki", category: "Kolej" },
    { name: "Kolej Rahim Kajai", category: "Kolej" },
    { name: "Kolej Ibrahim Yaakob", category: "Kolej" },
    { name: "Kolej Ungku Omar", category: "Kolej" },
    { name: "Kolej Burhanuddin Helmi", category: "Kolej" },
    { name: "Kolej Dato' Onn", category: "Kolej" },
    { name: "Kolej Ibu Zain", category: "Kolej" },
    { name: "Fakulti Teknologi & Sains Maklumat (FTSM)", category: "Fakulti" },
    { name: "Fakulti Kejuruteraan & Alam Bina (FKAB)", category: "Fakulti" },
    { name: "Fakulti Sains & Teknologi (FST)", category: "Fakulti" },
    { name: "Fakulti Pendidikan (FPEND)", category: "Fakulti" },
    { name: "Fakulti Ekonomi & Pengurusan (FEP)", category: "Fakulti" },
    { name: "Fakulti Sains Sosial & Kemanusiaan (FSSK)", category: "Fakulti" },
    { name: "Fakulti Undang-Undang (FUU)", category: "Fakulti" },
    { name: "Fakulti Pengajian Islam (FPI)", category: "Fakulti" },
    { name: "Pusat Pengajian Citra Universiti (PPCU)", category: "Fakulti" },
    { name: "Dewan Canselor Tun Abdul Razak (DECTAR)", category: "Others" },
    { name: "Pusanika", category: "Others" },
    { name: "Pusat Islam Universiti", category: "Others" },
    { name: "Pusat Kesihatan Universiti (PKU)", category: "Others" },
    { name: "Perpustakaan Tun Sri Lanang (PTSL)", category: "Others" },
    { name: "Stadium UKM", category: "Others" }
  ];

  useEffect(() => {
    fetchStalls();
  }, []);

  const fetchStalls = async () => {
    try {
      const response = await fetch(`${API_BASE}/get_all_stalls.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setStalls(data.data);
      }
    } catch (error) {
      console.error('Error fetching stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocations = () => {
    let filteredList = ALL_LOCATIONS.map(loc => {
      const count = stalls.filter(s => s.location_area === loc.name).length;
      return { ...loc, count };
    });

    if (activeCategory !== 'All') {
      filteredList = filteredList.filter(l => l.category === activeCategory);
    }

    return filteredList.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>

      {/* STICKY HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#AAA" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* STICKY TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['All', 'Kolej', 'Fakulti', 'Others'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.tabBtn, activeCategory === cat && styles.activeTab]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Places in UKM</Text>
          {getLocations().map((loc, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.locationCard}
              onPress={() => navigation.navigate('MainTabs', { 
                screen: 'Home',
                params: { viewMode: 'stalls', selectedLocation: loc.name }
              })}
            >
              <View style={styles.locationInfo}>
                <Text style={styles.locationNameText}>{loc.name}</Text>
                <Text style={styles.stallCountText}>{loc.count} {loc.count === 1 ? 'stall' : 'stalls'} available</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
          {getLocations().length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No places found for "{searchQuery}"</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F8F9FB' },
  backBtn: { marginRight: 15 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  
  tabsContainer: { backgroundColor: '#F8F9FB', paddingVertical: 10 },
  tabsScroll: { paddingHorizontal: 20, gap: 10 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  activeTab: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeTabText: { color: '#FFF' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  resultsTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginTop: 10, marginBottom: 15 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  locationInfo: { flex: 1 },
  locationNameText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  stallCountText: { fontSize: 12, color: '#888', marginTop: 4 },
  
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#AAA', fontSize: 16 },

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
