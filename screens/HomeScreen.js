import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Image, Platform, StatusBar as RNStatusBar, Linking, Animated, Pressable, BackHandler, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: windowWidth } = Dimensions.get('window');
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, route }) {
  const { showToast } = useToast();
  const [stalls, setStalls] = useState([]);
  const [randomItems, setRandomItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // NAVIGATION STATE
  const [viewMode, setViewMode] = useState('locations'); // 'locations' (Home) or 'stalls' (Selected Loc)
  const [selectedLocation, setSelectedLocation] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // NATIVE ANIMATION
  const stickyTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

  // ⚠️ PENTING: Gantikan dengan IP Address laptop awak
  const API_URL = 'http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/get_all_stalls.php';

  useEffect(() => {
    // Handle navigation params from LocationSearchScreen
    if (route.params?.selectedLocation) {
      setViewMode('stalls');
      setSelectedLocation(route.params.selectedLocation);

      // Clear params to prevent re-triggering on every focus
      navigation.setParams({ selectedLocation: undefined, viewMode: undefined });
    }
  }, [route.params]);

  useEffect(() => {
    checkAuth();
    fetchStalls();
    fetchRandomItems();

    // INTERCEPT HARDWARE BACK BUTTON
    const backAction = () => {
      if (viewMode === 'stalls') {
        navigation.goBack(); // Go back to LocationSearchScreen
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [viewMode]);

  const checkAuth = async () => {
    const session = await AsyncStorage.getItem('userData');
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    }
  };

  const fetchStalls = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.status === 'success') {
        setStalls(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const fetchRandomItems = async () => {
    try {
      // Use the same base IP for random items
      const response = await fetch('http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/fetch_random_items.php');
      const result = await response.json();
      if (result.status === 'success') {
        setRandomItems(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch random items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocations = () => []; // No longer needed in HomeScreen

  const handleLocationPress = (locName) => {
    setSelectedLocation(locName);
    setViewMode('stalls');
    scrollY.setValue(0); // Reset scroll
  };

  const handleBackToLocations = () => {
    navigation.goBack(); // Always go back to search screen if we were there
  };

  // LOGIC: CAROUSEL AUTO-SCROLL
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Shuffle all stalls and pick up to 10 for the carousel to promote everyone
  const [featuredStalls, setFeaturedStalls] = useState([]);

  useEffect(() => {
    if (stalls.length > 0) {
      const allStalls = stalls;
      // Featured Carousel: ONLY OPEN STALLS
      const openStalls = allStalls.filter(s => s.status === 'Buka');
      // Randomize and pick up to 10
      const shuffled = [...openStalls].sort(() => 0.5 - Math.random());
      setFeaturedStalls(shuffled.slice(0, 10));
    }
  }, [stalls]);

  useEffect(() => {
    if (viewMode === 'locations' && featuredStalls.length > 0) {
      const interval = setInterval(() => {
        let nextSlide = (activeSlide + 1) % featuredStalls.length;
        carouselRef.current?.scrollTo({ x: nextSlide * (windowWidth - 40), animated: true });
        setActiveSlide(nextSlide);
      }, 3000); // 3 seconds interval
      return () => clearInterval(interval);
    }
  }, [activeSlide, viewMode, featuredStalls.length]);

  // LOGIC: DISCOVERY AUTO-SCROLL
  const discoveryRef = useRef(null);
  const discoveryOffset = useRef(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    let interval;
    if (viewMode === 'locations' && randomItems.length > 0 && isAutoScrolling) {
      interval = setInterval(() => {
        discoveryOffset.current += 0.5;
        // Jump back to start when we reach the end of the first set (seamless loop)
        const singleSetWidth = randomItems.length * 145; // 130 width + 15 margin
        if (discoveryOffset.current >= singleSetWidth) {
          discoveryOffset.current = 0;
        }
        discoveryRef.current?.scrollTo({ x: discoveryOffset.current, animated: false });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [viewMode, randomItems.length, isAutoScrolling]);

  const categories = [
    { name: 'Food', icon: '🥘', bgColor: '#FFF0F0', borderColor: '#FF9999', textColor: '#1A1A1A' },
    { name: 'Beverage', icon: '🥤', bgColor: '#E0F7FF', borderColor: '#70C5FF', textColor: '#1A1A1A' },
    { name: 'Others', icon: '🍿', bgColor: '#F3E8FF', borderColor: '#C594FE', textColor: '#1A1A1A' }
  ];
  // Repeat items for infinite feel
  const repeatedCats = [...categories, ...categories, ...categories, ...categories, ...categories];
  const itemWidth = 125;
  const initialOffset = categories.length * 2 * itemWidth;

  // CATEGORY ANIMATION LOGIC - Initialize with the center offset so it's scaled correctly on mount
  const catScrollX = useRef(new Animated.Value(initialOffset)).current;
  const catScrollRef = useRef(null);

  // Note: Initial scroll is handled by contentOffset prop in ScrollView for better stability
  useEffect(() => {
    // Fallback for some Android versions
    if (viewMode === 'locations') {
      catScrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }
  }, [viewMode]);

  const handleGoToMap = (latitude, longitude, stallName) => {
    if (!latitude || !longitude) {
      showToast("Location Not Set", "This stall hasn't set their location coordinates yet.", "info");
      return;
    }

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(stallName);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  const filteredStalls = stalls.filter(s =>
    s.location_area === selectedLocation
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* === HEADER (NON-STICKY) === */}
      <View style={styles.headerContainer}>
        <View style={styles.logoRow}>
          {viewMode === 'stalls' ? (
            <TouchableOpacity onPress={handleBackToLocations} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoBox}>
              <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
          )}
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.logoText} numberOfLines={2}>
              {viewMode === 'locations' ? 'UKMFoodie' : selectedLocation}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.profileBox} onPress={() => navigation.navigate('CustomerProfileScreen')}>
          <Ionicons name="person-outline" size={18} color="#1A1A1A" />
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: viewMode === 'locations' ? 60 : 0 }} />

        {loading ? (
          <ActivityIndicator size="large" color="#FFC93C" style={{ marginTop: 40 }} />
        ) : viewMode === 'locations' ? (
          <>
            {/* === PROMO CAROUSEL === */}
            <View style={styles.carouselHeader}>
              <Text style={styles.carouselTitle}>Open for Orders</Text>
              <Text style={styles.carouselSubtitle}>Fresh meals ready to be served right now</Text>
            </View>

            {featuredStalls.length > 0 ? (
              <View style={styles.carouselContainer}>
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const slide = Math.round(e.nativeEvent.contentOffset.x / (windowWidth - 40));
                    setActiveSlide(slide);
                  }}
                >
                  {featuredStalls.map((stall, index) => {
                    const imagePath = stall.stall_image && stall.stall_image !== 'default_stall.jpg'
                      ? `http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/uploads/${stall.stall_image}`
                      : 'https://via.placeholder.com/600x400?text=UKMFoodie';

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.featuredCard}
                        activeOpacity={0.9}
                        onPress={() => {
                          if (stall.status === 'Buka') {
                            navigation.navigate('MenuScreen', { stall });
                          } else {
                            showToast('Stall Closed', 'This stall is currently closed. Please check back later.', 'info');
                          }
                        }}
                      >
                        <ImageBackground source={{ uri: imagePath }} style={styles.featuredImg}>
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.featuredOverlay}
                          >
                            <Text style={styles.featuredName} numberOfLines={1}>{stall.stall_name}</Text>
                            <View style={styles.featuredMeta}>
                              <View style={styles.featuredRating}>
                                <Ionicons name="star" size={12} color="#FFC93C" />
                                <Text style={styles.featuredRatingText}>{parseFloat(stall.avg_rating).toFixed(1)}</Text>
                              </View>
                              <View style={styles.featuredLoc}>
                                <Ionicons name="location" size={12} color="#FFF" />
                                <Text style={styles.featuredLocText} numberOfLines={1}>{stall.location_area}</Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={styles.pagination}>
                  {featuredStalls.map((_, i) => (
                    <View key={i} style={[styles.dot, activeSlide === i && styles.activeDot]} />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyCarousel}>
                <LinearGradient colors={['#F8F9FB', '#EEE']} style={styles.emptyCarouselGradient}>
                  <Ionicons name="moon" size={40} color="#AAA" />
                  <Text style={styles.emptyCarouselTitle}>Resting Time</Text>
                  <Text style={styles.emptyCarouselText}>All stalls are currently closed. Check back during business hours!</Text>
                </LinearGradient>
              </View>
            )}

            {/* === DAILY DISCOVERIES (RANDOM MENUS) === */}
            {randomItems.length > 0 && (
              <View style={styles.discoveryContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily Discoveries</Text>
                  <TouchableOpacity onPress={fetchRandomItems} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={18} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  ref={discoveryRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.discoveryScroll}
                  onScrollBeginDrag={() => setIsAutoScrolling(false)}
                  onScrollEndDrag={() => {
                    // Resume auto-scroll after 2 seconds of no interaction
                    setTimeout(() => setIsAutoScrolling(true), 2000);
                  }}
                  onMomentumScrollEnd={(e) => {
                    discoveryOffset.current = e.nativeEvent.contentOffset.x;
                  }}
                >
                  {[...randomItems, ...randomItems, ...randomItems].map((item, index) => {
                    const foodImg = item.food_image
                      ? `http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.food_image}`
                      : 'https://via.placeholder.com/200?text=Food';

                    const stallObj = stalls.find(s => s.id == item.stall_id);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.foodCard}
                        activeOpacity={0.8}
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
                        <Image source={{ uri: foodImg }} style={styles.foodImg} />
                        <View style={styles.foodCardContent}>
                          <Text style={styles.foodName} numberOfLines={1}>{item.item_name}</Text>
                          <Text style={styles.foodPrice}>RM {parseFloat(item.price).toFixed(2)}</Text>
                          <View style={styles.foodStallRow}>
                            <Text style={styles.foodStallName} numberOfLines={1}>{item.stall_name}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* === CATEGORIES SECTION === */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Browse by Type</Text>
              <Animated.ScrollView
                ref={catScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: initialOffset, y: 0 }}
                contentContainerStyle={[styles.catScroll, { paddingHorizontal: (windowWidth - 110) / 2 }]}
                snapToInterval={itemWidth}
                snapToAlignment="center"
                decelerationRate="fast"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: catScrollX } } }],
                  {
                    useNativeDriver: true,
                    listener: (e) => {
                      const x = e.nativeEvent.contentOffset.x;
                      const setWidth = categories.length * itemWidth;
                      // Infinite Loop Jump Logic
                      if (x < setWidth) {
                        catScrollRef.current?.scrollTo({ x: x + setWidth, animated: false });
                      } else if (x > setWidth * 3) {
                        catScrollRef.current?.scrollTo({ x: x - setWidth, animated: false });
                      }
                    }
                  }
                )}
                scrollEventThrottle={16}
              >
                {repeatedCats.map((cat, i) => {
                  const inputRange = [(i - 1) * itemWidth, i * itemWidth, (i + 1) * itemWidth];
                  const scale = catScrollX.interpolate({
                    inputRange,
                    outputRange: [0.8, 1.25, 0.8],
                    extrapolate: 'clamp'
                  });

                  const opacity = catScrollX.interpolate({
                    inputRange,
                    outputRange: [0.6, 1, 0.6],
                    extrapolate: 'clamp'
                  });

                  return (
                    <Animated.View key={i} style={{ transform: [{ scale }], opacity }}>
                      <TouchableOpacity
                        style={[styles.catCard, { backgroundColor: cat.bgColor, borderColor: cat.borderColor }]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('CategoryItemsScreen', { category: cat.name })}
                      >
                        <View style={styles.catContent}>
                          <Text style={styles.catEmoji}>{cat.icon}</Text>
                          <Text style={[styles.catLabel, { color: cat.textColor }]}>{cat.name}</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </Animated.ScrollView>
            </View>

            {/* === ALL VENDORS SECTION === */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Explore All Vendors</Text>
                  <Text style={styles.subtitleText}>Find your favorite stall anywhere in UKM</Text>
                </View>
              </View>
              <View style={styles.allStallsList}>
                {stalls.map((stall, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.vendorCard}
                    onPress={() => {
                      if (stall.status === 'Buka') {
                        navigation.navigate('MenuScreen', { stall });
                      } else {
                        showToast('Stall Closed', 'This stall is currently closed. Please check back later.', 'info');
                      }
                    }}
                  >
                    <Image
                      source={{
                        uri: stall.stall_image && stall.stall_image !== 'default_stall.jpg'
                          ? `http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/uploads/${stall.stall_image}`
                          : 'https://via.placeholder.com/150?text=Stall'
                      }}
                      style={styles.vendorImg}
                    />
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorName} numberOfLines={1}>{stall.stall_name}</Text>
                      <View style={styles.vendorMeta}>
                        <Ionicons name="location" size={12} color="#888" />
                        <Text style={styles.vendorLoc} numberOfLines={1}>{stall.location_area}</Text>
                      </View>
                      <View style={styles.vendorRating}>
                        <Ionicons name="star" size={12} color="#FFC93C" />
                        <Text style={styles.ratingText}>{parseFloat(stall.avg_rating).toFixed(1)} ({stall.total_reviews})</Text>
                        <View style={[styles.statusBadge, { backgroundColor: stall.status === 'Buka' ? '#E8F5E9' : '#FFEBEE' }]}>
                          <Text style={[styles.statusText, { color: stall.status === 'Buka' ? '#2E7D32' : '#C62828' }]}>
                            {stall.status === 'Buka' ? 'Open' : 'Closed'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#DDD" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.stallsHeader}>
              <Text style={styles.sectionTitle}>Stalls at this place</Text>
              <Text style={styles.subtitleText}>Displaying {filteredStalls.length} vendors</Text>
            </View>

            {filteredStalls.map((item, index) => {
              const isOpen = item.status === 'Buka';
              const imagePath = item.stall_image && item.stall_image !== 'default_stall.jpg'
                ? `http://10.19.95.173/ukmfoodie_workspace/ukmfoodie_api/uploads/${item.stall_image}`
                : 'https://via.placeholder.com/600x400?text=No+Image';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (isOpen) {
                      navigation.navigate('MenuScreen', { stall: item });
                    } else {
                      showToast('Stall Closed', 'This stall is currently closed. Please check back later.', 'info');
                    }
                  }}
                >
                  <Image source={{ uri: imagePath }} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.stallName}>{item.stall_name}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
                          {isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationGoRow}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFC93C" />
                        <Text style={styles.ratingText}>{parseFloat(item.avg_rating || 0).toFixed(1)}</Text>
                        <Text style={styles.reviewCountText}>({item.total_reviews})</Text>
                      </View>

                      <View style={styles.locationBox}>
                        <Ionicons name="location-outline" size={12} color="#F1416C" />
                        <Text style={styles.cardLocationText} numberOfLines={1}>{item.location_area}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.goButton}
                        onPress={() => handleGoToMap(item.latitude, item.longitude, item.stall_name)}
                      >
                        <Ionicons name="map" size={14} color="#FFFFFF" />
                        <Text style={styles.goText}>Go</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </Animated.ScrollView>

      {/* === STICKY CONTROLS (Only in Locations Mode) === */}
      {viewMode === 'locations' && (
        <Animated.View style={[styles.stickyContainer, { transform: [{ translateY: stickyTranslateY }] }]}>
          <Pressable
            style={styles.searchBar}
            onPress={() => navigation.navigate('LocationSearchScreen')}
          >
            <Ionicons name="search" size={20} color="#AAA" style={{ marginRight: 10 }} />
            <Text style={{ color: '#AAA', fontSize: 16 }}>Search places...</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiFloatingBtn}
        onPress={() => navigation.navigate('AIChatScreen')}
      >
        <MaterialCommunityIcons name="robot" size={30} color="#1A1A1A" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 20, paddingRight: 50, paddingVertical: 10, backgroundColor: '#F8F9FB' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  logoBox: { width: 32, height: 32, borderRadius: 8, overflow: 'hidden', marginRight: 10, backgroundColor: '#FFC93C' },
  logoImage: { width: '100%', height: '100%' },
  logoText: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  profileBox: { backgroundColor: '#FFC93C', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 0 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, backgroundColor: '#50CD89', borderRadius: 5, borderWidth: 2, borderColor: '#F8F9FB' },

  stickyContainer: { position: 'absolute', top: 95, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#F8F9FB', zIndex: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  subtitleText: { fontSize: 13, color: '#888', marginBottom: 15 },
  locationGrid: { marginTop: 10 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  locationIconBox: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#FFF9E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  locationInfo: { flex: 1 },
  locationNameText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  stallCountText: { fontSize: 12, color: '#888', marginTop: 2 },

  card: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 15 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  stallName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8F9FA' },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  textOpen: { color: '#50CD89' },
  textClosed: { color: '#F1416C' },
  locationGoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginLeft: 4 },
  reviewCountText: { fontSize: 11, color: '#AAA', marginLeft: 4 },
  locationBox: { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 10 },
  cardLocationText: { fontSize: 11, color: '#666', marginLeft: 3 },
  goButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 5 },
  goText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#AAA', fontSize: 16 },
  aiFloatingBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FFC93C', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },

  // Carousel
  carouselContainer: { marginBottom: 30, position: 'relative' },
  featuredCard: { width: windowWidth - 40, height: 180, borderRadius: 20, overflow: 'hidden', backgroundColor: '#DDD' },
  featuredImg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  featuredOverlay: { height: '100%', width: '100%', justifyContent: 'flex-end', padding: 20 },
  featuredName: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 5 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  featuredRating: { flexDirection: 'row', alignItems: 'center' },
  featuredRatingText: { color: '#FFF', fontSize: 12, marginLeft: 4, fontWeight: '700' },
  featuredLoc: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  featuredLocText: { color: '#FFF', fontSize: 11, marginLeft: 4, fontWeight: '500' },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD' },
  activeDot: { width: 20, backgroundColor: '#FFC93C' },

  // Discovery Section
  discoveryContainer: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refreshBtn: { padding: 5, backgroundColor: '#EEE', borderRadius: 8 },
  discoveryScroll: { paddingRight: 20, paddingVertical: 10 },
  foodCard: { width: 130, backgroundColor: '#FFF', borderRadius: 18, marginRight: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  foodImg: { width: '100%', height: 85 },
  foodCardContent: { padding: 10 },
  foodName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  foodPrice: { fontSize: 11, fontWeight: '800', color: '#FFC93C', marginTop: 1 },
  foodStallRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  foodStallName: { fontSize: 10, color: '#888', flex: 1 },

  // New Sections
  sectionContainer: { marginBottom: 30 },
  catScroll: { gap: 15, paddingVertical: 20 },
  catCard: { width: 110, height: 110, borderRadius: 25, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, borderWidth: 2 },
  catContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 40, marginBottom: 5 },
  catLabel: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

  allStallsList: { gap: 15 },
  vendorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  vendorImg: { width: 70, height: 70, borderRadius: 15 },
  vendorInfo: { flex: 1, marginLeft: 15 },
  vendorName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  vendorLoc: { fontSize: 11, color: '#888', flex: 1 },
  vendorRating: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#444' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  // Carousel Enhancements
  carouselHeader: { marginBottom: 10, paddingHorizontal: 5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(80, 205, 137, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#50CD89', marginRight: 5 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#2E7D32', letterSpacing: 1 },
  carouselTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 },
  carouselSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },

  // Empty Carousel Fallback
  emptyCarousel: { height: 200, marginBottom: 20, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE' },
  emptyCarouselGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyCarouselTitle: { fontSize: 18, fontWeight: '800', color: '#666', marginTop: 10 },
  emptyCarouselText: { fontSize: 13, color: '#AAA', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 }
});