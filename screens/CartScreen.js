import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CartScreen({ navigation, route }) {
  const { cartItems, stall } = route.params;
  const IP_ADDRESS = '10.19.95.173';
  
  // Inisialkan state dengan items yang diterima
  const [items, setItems] = useState(cartItems);
  const [note, setNote] = useState('');

  // 1. FUNGSI UPDATE QUANTITY
  const updateQuantity = (id, action) => {
    const updatedItems = items.map(item => {
      if (String(item.id) === String(id)) {
        let newQty = item.quantity;
        if (action === 'add') newQty += 1;
        else if (action === 'remove' && newQty > 1) newQty -= 1;
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setItems(updatedItems);
  };

  // 2. FUNGSI DELETE (VERSION TERPALING FIX)
  const removeItem = (id) => {
    // Debug: Tengok kat terminal id apa yang masuk
    console.log("Cuba buang ID:", id);

    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            // Gunakan String(item.id) !== String(id) untuk elak isu String vs Number
            const filtered = items.filter(item => String(item.id) !== String(id));
            
            console.log("Baki item selepas filter:", filtered.length);
            setItems(filtered);
            
            if (filtered.length === 0) {
              navigation.goBack();
            }
          } 
        }
      ]
    );
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stallName}>Ordering from: {stall.stall_name}</Text>
        <Text style={styles.sectionTitle}>Order Items</Text>

        {items.map((item) => (
          <View key={item.id.toString()} style={styles.cartItem}>
            <Image 
               source={{ uri: `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}` }} 
               style={styles.itemImage} 
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemPrice}>RM {parseFloat(item.price).toFixed(2)}</Text>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 'remove')} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 'add')} style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* BUTANG TONG SAMPAH */}
            <TouchableOpacity 
              onPress={() => removeItem(item.id)} 
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={22} color="#F1416C" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Special Requests</Text>
          <View style={styles.noteContainer}>
            <Ionicons name="document-text-outline" size={20} color="#888" style={{marginRight: 10}} />
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note to seller..."
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>
        <View style={{ height: 150 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalAmount}>RM {calculateTotal()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutBtn} 
          onPress={() => navigation.navigate('CheckoutScreen', {
            orderData: {
              stall_id: stall.id,
              items: items,
              total_amount: calculateTotal(),
              customer_note: note
            }
          })}
        >
          <Text style={styles.checkoutText}>Proceed To Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  stallName: { fontSize: 14, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#FFF', padding: 15, borderRadius: 15, elevation: 2 },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 2 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 15 },
  qtyBtn: { backgroundColor: '#FDE68A', padding: 4, borderRadius: 6 },
  quantityText: { fontWeight: '700', fontSize: 14 },
  deleteBtn: { padding: 10 },
  noteSection: { marginTop: 10 },
  noteLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  noteInput: { flex: 1, fontSize: 14, minHeight: 40 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  subtotalLabel: { fontSize: 16, color: '#F1416C', fontWeight: '500' },
  subtotalAmount: { fontSize: 16, fontWeight: 'bold', color: '#F1416C' },
  checkoutBtn: { backgroundColor: '#FFC93C', padding: 18, borderRadius: 15, alignItems: 'center' },
  checkoutText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }
});