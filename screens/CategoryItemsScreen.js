import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';

export default function CategoryItemsScreen({ navigation, route }) {
  const { showToast } = useToast();
  const { category } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stalls, setStalls] = useState([]);

  useEffect(() => {
    fetchStalls();
    fetchItems();
  }, []);

  const fetchStalls = async () => {
    try {
      const response = await fetch('https://campsite-feisty-nephew.ngrok-free.dev/ukmfoodie_workspace/ukmfoodie_api/get_all_stalls.php');
      const data = await response.json();
      if (data.status === 'success') {
        setStalls(data.data);
      }
    } catch (error) {
      console.error('Error fetching stalls:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`https://campsite-feisty-nephew.ngrok-free.dev/ukmfoodie_workspace/ukmfoodie_api/fetch_items_by_category.php?category=${category}`);
      const data = await response.json();
      if (data.status === 'success') {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Selection</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {items.map((item, index) => {
              const stallObj = stalls.find(s => s.id == item.stall_id);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.foodCard}
                  onPress={() => {
                    if (stallObj) {
                      if (stallObj.status === 'Buka') {
                        navigation.navigate('MenuScreen', { stall: stallObj });
                      } else {
                        showToast('Stall Closed', 'This stall is currently closed. Please check back later.', 'info');
                      }
                    }
                  }}
                >
                  <Image 
                    source={{ uri: item.food_image 
                      ? `https://campsite-feisty-nephew.ngrok-free.dev/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}`
                      : 'https://via.placeholder.com/200?text=Food' }} 
                    style={styles.foodImg} 
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>{item.item_name}</Text>
                    <Text style={styles.foodPrice}>RM {parseFloat(item.price).toFixed(2)}</Text>
                    <View style={styles.stallRow}>
                      <Text style={styles.stallName} numberOfLines={1}>{item.stall_name}</Text>
                      <View style={[styles.miniStatus, { backgroundColor: stallObj?.status === 'Buka' ? '#E8F5E9' : '#FFEBEE' }]}>
                        <Text style={[styles.statusText, { color: stallObj?.status === 'Buka' ? '#2E7D32' : '#C62828' }]}>
                          {stallObj?.status === 'Buka' ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {items.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No {category.toLowerCase()} items found yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  scrollContent: { padding: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  foodCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 20, marginBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  foodImg: { width: '100%', height: 130 },
  cardInfo: { padding: 10 },
  foodName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  foodPrice: { fontSize: 14, fontWeight: '800', color: '#FFC93C', marginTop: 1 },
  stallRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  stallName: { fontSize: 11, color: '#888', flex: 1 },
  miniStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#AAA' },

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
