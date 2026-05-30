import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, StatusBar as RNStatusBar, KeyboardAvoidingView } from 'react-native';
import { useAlert } from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CartScreen({ navigation, route }) {
  const { showAlert } = useAlert();
  const { cartItems, stall } = route.params;
  const IP_ADDRESS = 'campsite-feisty-nephew.ngrok-free.dev';
  
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

    showAlert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      "warning",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            const filtered = items.filter(item => String(item.id) !== String(id));
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
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stallName}>Ordering from: {stall.stall_name}</Text>
          <Text style={styles.sectionTitle}>Order Items</Text>

          <View style={styles.cartItemsContainer}>
            {items.map((item, index) => (
              <View key={item.id.toString()} style={[styles.cartItemRow, index !== items.length - 1 && styles.itemDivider]}>
                <Image 
                   source={{ uri: `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}` }} 
                   style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <Text style={styles.itemPrice}>RM {parseFloat(item.price).toFixed(2)}</Text>
                  
                  {item.note && (
                    <View style={styles.itemNoteContainer}>
                      <Ionicons name="chatbubble-outline" size={12} color="#888" />
                      <Text style={styles.itemNoteText}>{item.note}</Text>
                    </View>
                  )}
                  
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

                <TouchableOpacity 
                  onPress={() => removeItem(item.id)} 
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={22} color="#F1416C" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

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
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'transparent' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  stallName: { fontSize: 14, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
  cartItemsContainer: { backgroundColor: '#FFF', borderRadius: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 25 },
  cartItemRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 2 },
  itemNoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, gap: 5 },
  itemNoteText: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 15 },
  qtyBtn: { backgroundColor: '#FDE68A', padding: 4, borderRadius: 6 },
  quantityText: { fontWeight: '700', fontSize: 14 },
  deleteBtn: { padding: 10 },
  noteSection: { marginTop: 10 },
  noteLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  noteInput: { flex: 1, fontSize: 14, minHeight: 40 },
  footer: { padding: 25, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  subtotalLabel: { fontSize: 16, color: '#F1416C', fontWeight: '500' },
  subtotalAmount: { fontSize: 16, fontWeight: 'bold', color: '#F1416C' },
  checkoutBtn: { backgroundColor: '#FFC93C', padding: 18, borderRadius: 15, alignItems: 'center' },
  checkoutText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },

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