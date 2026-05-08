import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function MenuScreen({ navigation, route }) {
  const { stall } = route.params; 

  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0.00); 

  // IP Address Hotspot awak
  const IP_ADDRESS = '10.19.95.173';
  const API_URL = `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/fetch_menu.php?stall_id=${stall.id}`;
  
  const headerImage = stall.stall_image && stall.stall_image !== 'default_stall.jpg'
    ? `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${stall.stall_image}`
    : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success') {
        // Tambah field 'quantity: 0' pada setiap item secara automatik
        const updatedData = result.data.map(item => ({ ...item, quantity: 0 }));
        setMenuList(updatedData);
      }
    } catch (error) {
      console.error("Gagal menarik senarai menu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk Tambah/Kurang Kuantiti
  const updateQuantity = (id, action) => {
    let newTotal = 0;
    const updatedMenu = menuList.map(item => {
      if (item.id === id) {
        let newQty = item.quantity;
        if (action === 'add') newQty += 1;
        else if (action === 'remove' && newQty > 0) newQty -= 1;
        
        return { ...item, quantity: newQty };
      }
      return item;
    });

    // Kira semula Total Price keseluruhan
    updatedMenu.forEach(item => {
      newTotal += parseFloat(item.price) * item.quantity;
    });

    setMenuList(updatedMenu);
    setTotalPrice(newTotal);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <ImageBackground source={{ uri: headerImage }} style={styles.headerImage}>
          <View style={styles.overlay} />
          <SafeAreaView>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.headerTextContainer}>
            <Text style={styles.stallTitle}>{stall.stall_name}</Text>
            <Text style={styles.stallLocation}>{stall.description || "Kampus UKM"}</Text>
          </View>
        </ImageBackground>

        <View style={styles.menuContainer}>
          {loading ? (
             <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
          ) : menuList.length === 0 ? (
             <View style={styles.emptyState}>
               <MaterialCommunityIcons name="food-off" size={50} color="#CCC" />
               <Text style={styles.emptyText}>Belum ada menu diletakkan.</Text>
             </View>
          ) : (
            menuList.map((item) => {
              const foodImage = item.food_image && item.food_image !== 'default_food.jpg'
                ? `http://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}`
                : 'https://via.placeholder.com/200x200?text=No+Image';

              const isAvailable = item.status === 'Available';

              return (
                <View key={item.id} style={[styles.menuCard, !isAvailable && { opacity: 0.5 }]}>
                  <Image source={{ uri: foodImage }} style={styles.foodImage} />
                  
                  <View style={styles.foodInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.foodName}>{item.item_name}</Text>
                        {!isAvailable && (
                            <View style={styles.soldOutBadge}>
                                <Text style={styles.soldOutText}>HABIS</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.foodDesc}>{item.category || 'N/A'}</Text>
                    <Text style={styles.foodPrice}>RM {parseFloat(item.price).toFixed(2)}</Text>
                  </View>

                  {/* Logik Butang Tambah/Kuantiti */}
                  <View style={styles.actionSection}>
                    {item.quantity > 0 ? (
                      <View style={styles.quantityControls}>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, 'remove')}>
                          <Ionicons name="remove-circle" size={28} color="#FFC93C" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, 'add')}>
                          <Ionicons name="add-circle" size={28} color="#FFC93C" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.addButton, !isAvailable && { backgroundColor: '#E0E0E0' }]} 
                        onPress={() => isAvailable && updateQuantity(item.id, 'add')}
                        disabled={!isAvailable}
                      >
                        <Ionicons name="add" size={20} color={isAvailable ? "#1A1A1A" : "#AAA"} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar: Pautkan ke CartScreen */}
      {totalPrice > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalAmount}>RM {totalPrice.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cartButton} 
            onPress={() => navigation.navigate('CartScreen', { 
                cartItems: menuList.filter(i => i.quantity > 0),
                stall: stall 
            })}
          >
            <Text style={styles.cartButtonText}>Go to cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  headerImage: { width: '100%', height: 250, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(26, 26, 26, 0.7)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 10 },
  headerTextContainer: { padding: 20, paddingBottom: 25 },
  stallTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  stallLocation: { fontSize: 14, color: '#EAEBEE', fontWeight: '500' },
  menuContainer: { paddingHorizontal: 20, paddingTop: 20 },
  menuCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  foodImage: { width: 70, height: 70, borderRadius: 10, marginRight: 15, backgroundColor: '#EEE' },
  foodInfo: { flex: 1, justifyContent: 'center' },
  foodName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginRight: 10 },
  foodDesc: { fontSize: 12, color: '#888', marginBottom: 8 },
  foodPrice: { fontSize: 15, fontWeight: 'bold', color: '#E53935' },
  actionSection: { marginLeft: 10 },
  addButton: { width: 32, height: 32, backgroundColor: '#FFC93C', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityText: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  soldOutBadge: { backgroundColor: '#FFEDED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  soldOutText: { fontSize: 10, color: '#D32F2F', fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#EAEBEE', elevation: 10 },
  totalLabel: { fontSize: 12, color: '#555', fontWeight: '600', marginBottom: 2 },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#E53935' },
  cartButton: { backgroundColor: '#FFC93C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  cartButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 14 }
});