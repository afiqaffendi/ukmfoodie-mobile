import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, SafeAreaView, ActivityIndicator, Platform, StatusBar as RNStatusBar, TextInput, Dimensions, Modal, Animated, Pressable, KeyboardAvoidingView } from 'react-native';
const { width: windowWidth } = Dimensions.get('window');
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const HEADER_IMAGE_HEIGHT = 300;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? RNStatusBar.currentHeight : 20;
const COMPACT_NAME_HEIGHT = 60;
const CARD_MARGIN = 8;
const GRID_PADDING = 15;
const CARD_WIDTH = (windowWidth - (GRID_PADDING * 2) - CARD_MARGIN) / 2;

export default function MenuScreen({ navigation, route }) {
  const { stall } = route.params; 

  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0.00);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // IP Address Hotspot awak
  const IP_ADDRESS = 'campsite-feisty-nephew.ngrok-free.dev';
  const API_URL = `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/fetch_menu.php?stall_id=${stall.id}`;
  
  const headerImage = stall.stall_image && stall.stall_image !== 'default_stall.jpg'
    ? `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${stall.stall_image}`
    : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success') {
        const updatedData = result.data.map(item => ({ ...item, quantity: 0 }));
        setMenuList(updatedData);
      }
    } catch (error) {
      console.error("Gagal menarik senarai menu:", error);
    } finally {
      setLoading(false);
    }
  };

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

    updatedMenu.forEach(item => {
      newTotal += parseFloat(item.price) * item.quantity;
    });

    setMenuList(updatedMenu);
    setTotalPrice(newTotal);
    
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(updatedMenu.find(i => i.id === id));
    }
  };

  const updateNote = (id, note) => {
    const updatedMenu = menuList.map(item => {
      if (item.id === id) {
        return { ...item, note: note };
      }
      return item;
    });
    setMenuList(updatedMenu);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, note: note });
    }
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // NATIVE ANIMATIONS
  const compactNameOpacity = scrollY.interpolate({
    inputRange: [HEADER_IMAGE_HEIGHT - 120, HEADER_IMAGE_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const mainHeaderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_IMAGE_HEIGHT - 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const stickyTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_IMAGE_HEIGHT - 80],
    outputRange: [HEADER_IMAGE_HEIGHT - 80, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>

      

      
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      >
        {/* Section 0: Main Header Image */}
        <Animated.View style={{ opacity: mainHeaderOpacity }}>
          <ImageBackground source={{ uri: headerImage }} style={styles.headerImage}>
            <View style={styles.overlay} />
            <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={[styles.headerTextContainer, { paddingBottom: 80 }]}>
              <Text style={styles.stallTitle}>{stall.stall_name}</Text>
              <Text style={styles.stallLocation}>{stall.description || "Kampus UKM"}</Text>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Section 1: Spacer for the manual sticky header (Height matches categories + search) */}
        <View style={{ height: 120 }} /> 

        {/* Section 2: Food Grid */}
        <View style={styles.menuGridContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
          ) : (
            <>
              <Text style={styles.gridTitle}>
                {activeCategory === 'All' ? 'Recommended for You' : activeCategory}
              </Text>
              
              <View style={styles.gridItems}>
                {menuList
                  .filter(item => {
                    const matchesCategory = activeCategory === 'All' || (item.category || 'Food') === activeCategory;
                    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((item) => {
                    const foodImage = item.food_image && item.food_image !== 'default_food.jpg'
                      ? `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}`
                      : 'https://via.placeholder.com/200x200?text=No+Image';

                    const isAvailable = item.status === 'Available';

                    return (
                      <TouchableOpacity 
                        key={item.id} 
                        activeOpacity={0.9}
                        style={[styles.foodGridCard, !isAvailable && { opacity: 0.6 }]}
                        onPress={() => isAvailable && handleOpenItem(item)}
                      >
                        <View style={styles.imageContainer}>
                          <Image source={{ uri: foodImage }} style={styles.foodGridImage} />
                          
                          {/* Plus Button Removed */}

                          {item.quantity > 0 && (
                            <View style={styles.gridQuantityBadge}>
                              <Text style={styles.gridQuantityText}>{item.quantity}</Text>
                            </View>
                          )}

                          {!isAvailable && (
                            <View style={styles.soldOutOverlay}>
                              <Text style={styles.soldOutOverlayText}>OUT OF{"\n"}STOCK</Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.foodGridInfo}>
                          <Text style={styles.foodGridName} numberOfLines={2}>{item.item_name}</Text>
                          <Text style={styles.foodGridPrice}>{parseFloat(item.price).toFixed(2)}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
              
              {menuList.filter(item => {
                const matchesCategory = activeCategory === 'All' || (item.category || 'Food') === activeCategory;
                const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              }).length === 0 && (
                <View style={styles.emptySearch}>
                  <MaterialCommunityIcons name="food-off" size={40} color="#CCC" />
                  <Text style={styles.emptyText}>No items found</Text>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* Item Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            {selectedItem && (
              <>
                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={{ uri: selectedItem.food_image && selectedItem.food_image !== 'default_food.jpg'
                        ? `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api/uploads/${selectedItem.food_image}`
                        : 'https://via.placeholder.com/400x400?text=No+Image' }} 
                      style={styles.modalImage} 
                    />
                    <TouchableOpacity 
                      style={styles.modalCloseBtn} 
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons name="close" size={22} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalInfo}>
                    <View style={styles.modalHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalName}>{selectedItem.item_name}</Text>
                        <Text style={styles.modalCategory}>{selectedItem.category || 'Food'}</Text>
                      </View>
                      <Text style={styles.modalPrice}>RM {parseFloat(selectedItem.price).toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.noteSection}>
                      <View style={styles.noteHeader}>
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1A1A1A" />
                        <Text style={styles.noteTitle}>Special Instructions</Text>
                        <Text style={styles.optionalText}>(Optional)</Text>
                      </View>
                      <TextInput
                        style={styles.modalNoteInput}
                        placeholder="E.g. No onions, less spicy, extra sauce..."
                        placeholderTextColor="#AAA"
                        multiline
                        numberOfLines={3}
                        value={selectedItem.note || ''}
                        onChangeText={(text) => updateNote(selectedItem.id, text)}
                      />
                    </View>
                    
                    <View style={{ height: 20 }} />
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <View style={styles.modalQuantityControls}>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(selectedItem.id, 'remove')}
                      style={styles.modalQtyBtn}
                    >
                      <Ionicons name="remove" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.modalQtyText}>{selectedItem.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(selectedItem.id, 'add')}
                      style={[styles.modalQtyBtn, { backgroundColor: '#FFC93C' }]}
                    >
                      <Ionicons name="add" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={[styles.doneBtn, { flex: 1, marginLeft: 15 }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.doneBtnText}>
                      {selectedItem.quantity > 0 ? 'Add to Cart' : 'Close'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Bottom Bar */}
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

      {/* Manual Sticky Header (Outside ScrollView to prevent touch stealing) */}
      <Animated.View 
        style={[
          styles.stickyContainer, 
          { 
            position: 'absolute', 
            top: 0, left: 0, right: 0,
            transform: [{ translateY: stickyTranslateY }],
            zIndex: 500
          }
        ]} 
        pointerEvents="box-none"
      >
        {/* Categories Bar */}
        <View style={styles.categoryBarWrapper} pointerEvents="auto">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScroll}
            delaysContentTouches={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {['All', 'Food', 'Beverage', 'Others'].map(cat => (
              <Pressable 
                key={cat} 
                style={({ pressed }) => [
                  styles.categoryTab, 
                  activeCategory === cat && styles.categoryTabActive,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={() => setActiveCategory(cat)}
                hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat === 'All' ? 'Menu' : cat}
                </Text>
                {activeCategory === cat && <View style={styles.activeIndicator} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper} pointerEvents="auto">
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#888" style={{ marginRight: 10 }} />
            <TextInput 
              placeholder="Search food..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#AAA"
            />
          </View>
        </View>
      </Animated.View>

      {/* Floating Name Bar (Fades in on scroll) */}
      <Animated.View 
        pointerEvents="none"
        style={[
          styles.floatingNameBar, 
          { paddingTop: STATUS_BAR_HEIGHT, opacity: compactNameOpacity, zIndex: 1000 }
        ]}
      >
        <Text style={styles.compactStallTitle} numberOfLines={1}>{stall.stall_name}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  compactHeaderWrapper: { overflow: 'hidden', backgroundColor: '#FFF' },
  compactHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, paddingHorizontal: 15 },
  compactBackButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  floatingNameBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 + STATUS_BAR_HEIGHT, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  compactStallTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginTop: 10 },
  headerImage: { width: '100%', height: HEADER_IMAGE_HEIGHT, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(26, 26, 26, 0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 10 },
  headerTextContainer: { padding: 20, paddingBottom: 25 },
  stallTitle: { fontSize: 30, fontWeight: 'bold', color: '#FFF', marginBottom: 4, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
  stallLocation: { fontSize: 14, color: '#EAEBEE', fontWeight: '500' },
  mainHeaderContainer: { height: HEADER_IMAGE_HEIGHT, marginBottom: -60, zIndex: 5 },
  stickyContainer: { backgroundColor: 'transparent', marginTop: 0, paddingTop: 60 + STATUS_BAR_HEIGHT },
  stickyBackgroundFiller: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF', height: 60 + STATUS_BAR_HEIGHT },
  categoryBarWrapper: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5', backgroundColor: '#FFF', paddingBottom: 2 },
  categoryScroll: { paddingHorizontal: 15, paddingBottom: 5 },
  categoryTab: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, position: 'relative', alignItems: 'center' },
  categoryText: { fontSize: 15, fontWeight: '600', color: '#888' },
  categoryTextActive: { color: '#1A1A1A', fontWeight: 'bold' },
  activeIndicator: { position: 'absolute', bottom: 0, width: 25, height: 3, backgroundColor: '#FFC93C', borderRadius: 2 },
  searchWrapper: { paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#FFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 6 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', padding: 0 },
  menuGridContainer: { paddingHorizontal: GRID_PADDING, paddingTop: 10, paddingBottom: 150, backgroundColor: '#FFF' },
  gridTitle: { fontSize: 19, fontWeight: '800', color: '#1A1A1A', marginBottom: 15 },
  gridItems: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_MARGIN },
  foodGridCard: { width: CARD_WIDTH, marginBottom: 20 },
  imageContainer: { width: '100%', height: CARD_WIDTH, borderRadius: 18, overflow: 'hidden', position: 'relative' },
  foodGridImage: { width: '100%', height: '100%', backgroundColor: '#F8F9FA' },
  mostOrderedBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#00B14F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 2 },
  mostOrderedText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  plusButton: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#00B14F', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  foodGridInfo: { paddingTop: 10, paddingHorizontal: 4 },
  foodGridName: { fontSize: 14, fontWeight: '500', color: '#444', marginBottom: 4, lineHeight: 18 },
  foodGridPrice: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  gridQuantityBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFC93C', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', zIndex: 3 },
  gridQuantityText: { fontSize: 11, fontWeight: '900', color: '#1A1A1A' },
  soldOutOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 4 },
  soldOutOverlayText: { fontSize: 10, fontWeight: '900', color: '#FFF', backgroundColor: '#E53935', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 20, borderTopWidth: 1, borderTopColor: '#EAEBEE', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6 },
  totalLabel: { fontSize: 12, color: '#555', fontWeight: '600', marginBottom: 2 },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#E53935' },
  cartButton: { backgroundColor: '#FFC93C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, shadowColor: '#FFC93C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  cartButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', height: '80%' },
  modalImageContainer: { width: '100%', height: 280, position: 'relative' },
  modalImage: { width: '100%', height: '100%', backgroundColor: '#F8F9FA' },
  modalCloseBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalInfo: { padding: 24 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 10 },
  modalCategory: { fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  modalPrice: { fontSize: 20, fontWeight: '800', color: '#E53935' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  noteSection: { marginTop: 5 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  noteTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginLeft: 8 },
  optionalText: { fontSize: 12, color: '#AAA', marginLeft: 6 },
  modalNoteInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 14, color: '#1A1A1A', textAlignVertical: 'top', minHeight: 100, borderWidth: 1, borderColor: '#F0F0F0' },
  modalFooter: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderTopColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center' },
  modalQuantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4 },
  modalQtyBtn: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  modalQtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, minWidth: 20, textAlign: 'center' },
  doneBtn: { backgroundColor: '#FFC93C', paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#FFC93C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  doneBtnText: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  emptySearch: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, color: '#AAA', fontSize: 16, fontWeight: '500' },

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