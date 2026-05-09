import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function OrderStatusScreen({ navigation, route }) {
  const { order_id } = route.params;
  const IP_ADDRESS = '10.19.95.173';
  const API_BASE = `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api`;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Semak status kali pertama
    fetchOrderStatus();

    // Set semakan automatik setiap 5 saat
    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/fetch_order_status.php?order_id=${order_id}`);
      const result = await response.json();
      if (result.status === 'success') {
        setOrder(result.data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFC93C" />
      </View>
    );
  }

  // Tentukan tahap progress bar berdasarkan status
  const getProgressWidth = () => {
    switch(order?.status) {
      case 'Pending': return '20%';
      case 'Preparing': return '60%';
      case 'Ready': return '100%';
      default: return '10%';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <MaterialCommunityIcons 
            name={order?.status === 'Ready' ? "shopping-outline" : "silverware-clean"} 
            size={80} 
            color="#FFC93C" 
          />
          <Text style={styles.statusText}>
            {order?.status === 'Pending' ? 'Waiting for Confirmation' : 
             order?.status === 'Preparing' ? 'Chef is Cooking' : 
             order?.status === 'Ready' ? 'Food is Ready!' : 'Processing'}
          </Text>
          <Text style={styles.orderIdText}>Order ID: #{order_id}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: getProgressWidth() }]} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Estimated Time:</Text>
            <Text style={styles.infoValue}>{order?.collect_time || 'ASAP'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Pick up at:</Text>
            <Text style={styles.infoValue}>Stall #{order?.stall_id}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.homeBtn} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { alignItems: 'center', padding: 20 },
  statusCard: { alignItems: 'center', marginVertical: 40 },
  statusText: { fontSize: 22, fontWeight: 'bold', marginTop: 20, color: '#1A1A1A' },
  orderIdText: { color: '#888', marginTop: 5 },
  progressContainer: { width: '100%', height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, marginVertical: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FFC93C' },
  infoSection: { width: '100%', backgroundColor: '#F9F9F9', borderRadius: 15, padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoLabel: { flex: 1, marginLeft: 10, color: '#666' },
  infoValue: { fontWeight: 'bold' },
  homeBtn: { marginTop: 40, backgroundColor: '#1A1A1D', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
  homeBtnText: { color: '#FFF', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});