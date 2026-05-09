import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function CustomerOrderScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const IP_ADDRESS = '10.19.95.173';
  const CUSTOMER_NAME = 'Afiq (Student)'; // Hardcoded currently
  const API_URL = `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/fetch_customer_orders.php?customer_name=${encodeURIComponent(CUSTOMER_NAME)}`;

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.status === 'success') {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FFB74D'; // Orange
      case 'Preparing': return '#3B82F6'; // Blue
      case 'Ready': return '#50CD89'; // Green
      case 'Completed': return '#50CD89'; // Green
      case 'Rejected': return '#F1416C'; // Red
      default: return '#888';
    }
  };

  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const historyOrders = orders.filter(o => ['Completed', 'Rejected'].includes(o.status));

  const displayOrders = activeTab === 'Active' ? activeOrders : historyOrders;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Active')}
        >
          <Text style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'History' && styles.tabButtonActive]}
          onPress={() => setActiveTab('History')}
        >
          <Text style={[styles.tabText, activeTab === 'History' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found.</Text>
          </View>
        ) : (
          displayOrders.map((order, index) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.card}
              onPress={() => navigation.navigate('OrderStatusScreen', { order_id: order.id })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.stallName}>{order.stall_name || 'Stall'}</Text>
                  <Text style={styles.orderDate}>{order.created_at}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.itemSummary}>
                  {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
                </Text>
                <Text style={styles.totalAmount}>RM {parseFloat(order.total_amount).toFixed(2)}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#888" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EAEBEE' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: '#FFC93C' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#1A1A1A' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 15, padding: 15, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  stallName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemSummary: { fontSize: 14, color: '#555' },
  totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 10 },
  viewDetailsText: { fontSize: 13, color: '#888', marginRight: 4, fontWeight: '500' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 16 }
});
