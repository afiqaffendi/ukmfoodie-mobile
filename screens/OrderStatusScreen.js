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
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchOrderStatus();

    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (order?.status === 'Preparing' && order?.accepted_at && order.accepted_at !== 'null') {
      timer = setInterval(() => {
        // Pengekodan masa ke bentuk yang sesuai dengan React Native JS
        const acceptedDate = new Date(order.accepted_at.replace(' ', 'T'));
        
        if (isNaN(acceptedDate.getTime())) {
          setTimeLeftStr('N/A');
          return;
        }

        const targetDate = new Date(acceptedDate.getTime() + 15 * 60000);
        const now = new Date();
        const diffMs = targetDate - now;

        if (diffMs <= 0) {
          setTimeLeftStr('LATE');
        } else {
          const mins = Math.floor(diffMs / 60000);
          const secs = Math.floor((diffMs % 60000) / 1000);
          setTimeLeftStr(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
    } else {
      setTimeLeftStr('');
    }

    return () => clearInterval(timer);
  }, [order]);

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

  const getProgressWidth = () => {
    switch(order?.status) {
      case 'Pending': return '25%';
      case 'Preparing': return '60%';
      case 'Ready': return '100%';
      case 'Completed': return '100%';
      default: return '10%';
    }
  };

  const getStatusTitle = () => {
    switch(order?.status) {
      case 'Pending': return 'Waiting for confirmation';
      case 'Preparing': return 'Preparing your order';
      case 'Ready': return 'Food is ready!';
      case 'Completed': return 'Order completed';
      default: return 'Processing';
    }
  };

  const getStatusSubtitle = () => {
    switch(order?.status) {
      case 'Pending': return 'Please wait for seller to accept...';
      case 'Preparing': return 'Please wait, the seller is preparing...';
      case 'Ready': return 'You can now collect your food.';
      case 'Completed': return 'Thank you for ordering with us.';
      default: return '...';
    }
  };

  const formatOrderDate = (dateStr) => {
    if(!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#000" />
          </View>
          <Text style={styles.headerTitle}>UKMFoodie</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{getStatusTitle()}</Text>
          <Text style={styles.cardSubtitle}>{getStatusSubtitle()}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: getProgressWidth() }]} />
          </View>

          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.valueText}>#ORD-{formatOrderDate(order?.created_at)}-{order_id}</Text>

          <Text style={[styles.label, {marginTop: 25}]}>Estimation Collect Time</Text>
          <Text style={styles.valueTextBig}>
            {order?.status === 'Preparing' && timeLeftStr ? `${timeLeftStr} Left` : 
             order?.status === 'Pending' ? 'Waiting to start' : 
             order?.status === 'Ready' ? 'Ready Now' : '-'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Order Details</Text>

        <TouchableOpacity 
          style={styles.detailsCard} 
          activeOpacity={0.8}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.detailsHeaderRow}>
            <View>
              <Text style={styles.itemsCount}>{order?.num_items || 0} Items</Text>
              <Text style={styles.totalAmount}>Total : RM {order?.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}</Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </View>
          </View>
          
          {isExpanded && order?.items && (
            <View style={styles.expandedItemsContainer}>
              <View style={styles.divider} />
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemNameText}>{item.quantity}x {item.item_name}</Text>
                  <Text style={styles.itemPriceText}>RM {(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatScreen', { order_id: order_id, stall_id: order?.stall_id })}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" />
        {order?.unread_chats > 0 && (
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeText}>{order.unread_chats}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#FFC93C',
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  content: { 
    padding: 20 
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A6D3B', // Warna keemasan sikit ikut gambar mockup
    marginBottom: 5
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20
  },
  progressContainer: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#F0F0F0', 
    borderRadius: 4, 
    marginBottom: 30, 
    overflow: 'hidden' 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: '#34C759', // Hijau mockup
    borderRadius: 4
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 5
  },
  valueText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500'
  },
  valueTextBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center'
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedItemsContainer: {
    marginTop: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemNameText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chatButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFC93C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  chatBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#F1416C',
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  chatBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});