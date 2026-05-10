import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform, StatusBar as RNStatusBar, Modal, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ navigation, route }) {
  const { orderData } = route.params;
  
  // IP Address Hotspot/Network awak
  const IP_ADDRESS = '10.19.95.173';
  const API_BASE = `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api`;

  const [bankDetails, setBankDetails] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingBank, setFetchingBank] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  const qrUrl = bankDetails?.qr_path && bankDetails.qr_path !== 'default_qr.png'
    ? `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${bankDetails.qr_path}`
    : 'https://via.placeholder.com/150?text=No+QR+Code';

  const serviceTax = 1.00;
  const finalTotal = (parseFloat(orderData.total_amount) + serviceTax).toFixed(2);

  useEffect(() => {
    fetchStallBankDetails();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) setUserData(JSON.parse(data));
    } catch (e) {
      console.error("Failed to load user data");
    }
  };

  const fetchStallBankDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/fetch_settings.php?stall_id=${orderData.stall_id}`);
      const result = await response.json();
      if (result.status === 'success') {
        setBankDetails(result.data);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    } finally {
      setFetchingBank(false);
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

  const submitOrder = async () => {
    if (!image) {
      Alert.alert("Missing Receipt", "Please upload your payment receipt to proceed.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('user_id', userData?.id || "");
    formData.append('stall_id', orderData.stall_id);
    formData.append('customer_name', userData?.fullname || "Unknown Customer"); 
    formData.append('total_amount', finalTotal);
    formData.append('customer_note', orderData.customer_note || "");
    formData.append('collect_time', "ASAP"); 
    formData.append('cart_items', JSON.stringify(orderData.items));

    const filename = image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('payment_receipt', { uri: image, name: filename, type });

    try {
      const response = await fetch(`${API_BASE}/place_order.php`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert("Success!", "Your order has been placed.");
        navigation.navigate('OrderStatusScreen', { order_id: result.order_id });
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {orderData.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image 
                source={{ uri: `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}` }} 
                style={styles.itemThumb} 
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>RM {(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>RM {parseFloat(orderData.total_amount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Total Calculation Section */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelSmall}>Subtotal</Text>
            <Text style={styles.totalValueSmall}>RM {parseFloat(orderData.total_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelSmall}>Service tax</Text>
            <Text style={styles.totalValueSmall}>RM {serviceTax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 10 }]}>
            <Text style={styles.totalLabelLarge}>Total</Text>
            <Text style={styles.totalValueLarge}>RM {finalTotal}</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <Text style={styles.sectionHeader}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.bankSectionTitle}>Bank Transfer Details</Text>
          
          {fetchingBank ? (
            <ActivityIndicator color="#FFC93C" style={{ marginVertical: 10 }} />
          ) : (
            <>
              <View style={styles.bankInfoRow}>
                <Text style={styles.bankLabel}>Bank Name:</Text>
                <Text style={styles.bankValue}>{bankDetails?.bank_name || 'Not Set'}</Text>
              </View>
              <View style={styles.bankInfoRow}>
                <Text style={styles.bankLabel}>Account Number:</Text>
                <Text style={[styles.bankValue, { color: '#F1416C' }]}>{bankDetails?.account_number || 'Not Set'}</Text>
              </View>
              <View style={styles.bankInfoRow}>
                <Text style={styles.bankLabel}>Account Name:</Text>
                <Text style={styles.bankValue}>{bankDetails?.account_holder || 'Not Set'}</Text>
              </View>
            </>
          )}

          <Text style={styles.bankNote}>
            Please make the transfer to confirm your order. Scan the QR code or use the bank details above.
          </Text>

          {/* QR Code Section - Menarik dari data Seller */}
          <View style={styles.qrContainer}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Image 
                source={{ uri: qrUrl }} 
                style={styles.qrImage} 
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 10, color: '#888', marginTop: 5 }}>Scan to Pay (Click to zoom)</Text>
          </View>

          {/* Full Screen Image Modal */}
          <Modal visible={isModalVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={styles.closeModal} onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={40} color="#FFF" />
              </TouchableOpacity>
              <Image 
                source={{ uri: qrUrl }} 
                style={styles.fullImage} 
                resizeMode="contain" 
              />
            </View>
          </Modal>

          {/* Upload Area */}
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.receiptPreview} />
            ) : (
              <View style={styles.uploadContent}>
                <Ionicons name="camera-outline" size={32} color="#555" />
                <Text style={styles.uploadLabel}>Upload receipt</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={submitOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.submitBtnText}>Submit Order</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF1F5', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFF' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 12, fontWeight: '700', marginLeft: 5 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  content: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 15 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemThumb: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemQty: { fontSize: 12, color: '#888' },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, fontWeight: '700' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  totalCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalLabelSmall: { fontSize: 13, color: '#555' },
  totalValueSmall: { fontSize: 13, fontWeight: '500' },
  totalLabelLarge: { fontSize: 16, fontWeight: '800' },
  totalValueLarge: { fontSize: 16, fontWeight: '800' },
  sectionHeader: { fontSize: 15, fontWeight: '800', marginBottom: 15 },
  paymentCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 100 },
  bankSectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 15 },
  bankInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bankLabel: { fontSize: 12, color: '#777' },
  bankValue: { fontSize: 12, fontWeight: '700' },
  bankNote: { fontSize: 11, color: '#888', marginTop: 10, lineHeight: 16 },
  qrContainer: { alignItems: 'center', marginVertical: 20 },
  qrImage: { width: 150, height: 150, borderWidth: 1, borderColor: '#EEE', borderRadius: 10 },
  uploadArea: { height: 130, backgroundColor: '#F9F9F9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#F1416C', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadContent: { alignItems: 'center' },
  uploadLabel: { fontSize: 12, color: '#555', marginTop: 8 },
  receiptPreview: { width: '100%', height: '100%' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20 },
  submitBtn: { backgroundColor: '#FFC93C', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 5 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModal: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.7,
  },
});