import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, ScrollView, Platform, StatusBar as RNStatusBar, TextInput, BackHandler, Modal, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useToast } from '../components/Toast';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import LogoImage from '../assets/images/logo.png';

export default function OrderStatusScreen({ navigation, route }) {
  const { order_id } = route.params;
  const { showToast } = useToast();
  const IP_ADDRESS = 'campsite-feisty-nephew.ngrok-free.dev';
  const API_BASE = `https://${IP_ADDRESS}/ukmfoodie_workspace/ukmfoodie_api`;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);

  useEffect(() => {
    fetchOrderStatus();

    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 5000);

    // Override back button (Android & Swipe)
    const backAction = () => {
      navigation.navigate('MainTabs');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      clearInterval(interval);
      backHandler.remove();
    };
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

  const submitReview = async () => {
    if (rating === 0) {
      showToast("Please select a star rating", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE}/submit_review.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stall_id: order.stall_id,
          customer_id: order.user_id,
          order_id: order_id,
          rating: rating,
          comment: "" // Can add comment field if needed
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        showToast("Thank you for your review!", "success");
        fetchOrderStatus(); // Refresh to hide the rating box
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const downloadReceipt = async () => {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1A1A1A; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px solid #FFC93C; padding-bottom: 25px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 900; color: #1A1A1A; letter-spacing: -1px; }
            .receipt-title { font-size: 16px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .detail-item { font-size: 14px; }
            .detail-label { color: #888; font-size: 11px; text-transform: uppercase; font-weight: bold; }
            .detail-value { font-weight: 700; color: #1A1A1A; margin-top: 2px; }
            .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .item-table th { text-align: left; border-bottom: 2px solid #1A1A1A; padding: 12px 0; font-size: 12px; text-transform: uppercase; }
            .item-table td { padding: 15px 0; border-bottom: 1px solid #F0F0F0; font-size: 14px; }
            .total-section { margin-top: 30px; float: right; width: 250px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
            .grand-total { font-size: 20px; font-weight: 900; border-top: 2px solid #1A1A1A; margin-top: 15px; padding-top: 15px; color: #1A1A1A; }
            .footer { text-align: center; margin-top: 100px; color: #AAA; font-size: 11px; clear: both; }
            .paid-badge { 
              position: absolute; top: 30px; right: 30px; 
              border: 5px solid #50CD89; color: #50CD89; 
              padding: 8px 15px; font-size: 28px; font-weight: 900; 
              transform: rotate(12deg); border-radius: 12px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="paid-badge">PAID</div>
          <div class="header">
            <div class="logo">UKMFoodie</div>
            <div class="receipt-title">Official E-Receipt</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Order Reference</div>
              <div class="detail-value">#ORD-${formatOrderDate(order?.created_at)}-${order_id}</div>
            </div>
            <div class="detail-item" style="text-align: right;">
              <div class="detail-label">Date & Time</div>
              <div class="detail-value">${new Date(order?.created_at).toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Customer Name</div>
              <div class="detail-value">${order?.customer_name || 'Valued Customer'}</div>
            </div>
            <div class="detail-item" style="text-align: right;">
              <div class="detail-label">Stall Name</div>
              <div class="detail-value">${order?.stall_name || 'UKM Food Stall'}</div>
            </div>
          </div>

          <table class="item-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order?.items?.map(item => `
                <tr>
                  <td>
                    <strong>${item.item_name}</strong>
                    ${item.note ? `<div style="font-size: 11px; color: #888; font-style: italic; margin-top: 4px;">Note: ${item.note}</div>` : ''}
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">RM ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal</span>
              <span>RM ${(parseFloat(order?.total_amount) - 1).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Service Tax</span>
              <span>RM 1.00</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL</span>
              <span>RM ${parseFloat(order?.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your order with UKMFoodie!</p>
            <p>For inquiries, please contact the stall owner via the app.</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      showToast("Failed to generate PDF receipt", "error");
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
      case 'Rejected': return '100%';
      default: return '10%';
    }
  };

  const getStatusTitle = () => {
    switch(order?.status) {
      case 'Pending': return 'Waiting for confirmation';
      case 'Preparing': return 'Preparing your order';
      case 'Ready': return 'Food is ready!';
      case 'Completed': return 'Order completed';
      case 'Rejected': return 'Order Rejected';
      default: return 'Processing';
    }
  };

  const getStatusIcon = () => {
    switch(order?.status) {
      case 'Pending': return 'time-outline';
      case 'Preparing': return 'flame-outline';
      case 'Ready': return 'restaurant-outline';
      case 'Completed': return 'checkmark-done-circle-outline';
      case 'Rejected': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusSubtitle = () => {
    switch(order?.status) {
      case 'Pending': return 'Please wait for seller to accept...';
      case 'Preparing': return 'Please wait, the seller is preparing...';
      case 'Ready': return 'You can now collect your food.';
      case 'Completed': return 'Thank you for ordering with us.';
      case 'Rejected': return 'Sorry, your order was declined by the seller.';
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
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>

      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft} 
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Ionicons name="home-outline" size={22} color="#1A1A1A" />
          <Text style={styles.homeBtnText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Ionicons name={getStatusIcon()} size={32} color="#1A1A1A" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>{getStatusTitle()}</Text>
              <Text style={styles.statusSubtitle}>{getStatusSubtitle()}</Text>
            </View>
          </View>

          <View style={styles.minimalProgressContainer}>
            <View style={[
              styles.minimalProgressBar, 
              { width: getProgressWidth() },
              order?.status === 'Rejected' && { backgroundColor: '#F1416C' }
            ]} />
          </View>

          <View style={styles.statusFooter}>
            <View>
              <Text style={styles.statusFooterLabel}>Est. Collect Time</Text>
              <Text style={styles.statusFooterValue}>
                {order?.status === 'Preparing' && timeLeftStr ? `${timeLeftStr} Left` : 
                 order?.status === 'Pending' ? 'Waiting to start' : 
                 order?.status === 'Ready' ? 'Ready Now' : 
                 order?.status === 'Rejected' ? 'Cancelled' : '-'}
              </Text>
            </View>
            <Ionicons 
              name={order?.status === 'Rejected' ? "alert-circle" : "notifications-outline"} 
              size={20} 
              color={order?.status === 'Rejected' ? "#F1416C" : "#CCC"} 
            />
          </View>
        </View>

        {order?.status === 'Rejected' && (
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedHeader}>
              <View style={styles.rejectedIconBox}>
                <Ionicons name="call" size={22} color="#FFF" />
              </View>
              <View>
                <Text style={styles.rejectedTitle}>Contact Seller</Text>
                <Text style={styles.rejectedSubtitle}>For more info about your order</Text>
              </View>
            </View>
            <Text style={styles.rejectedDesc}>
              Sorry, your order has been declined by the seller. Please contact the seller at the number below for further inquiries or refunds (if applicable).
            </Text>
            <TouchableOpacity 
              style={styles.contactSellerBtn}
              onPress={() => Linking.openURL(`tel:${order.stall_phone}`)}
            >
              <Ionicons name="call-outline" size={20} color="#FFF" />
              <Text style={styles.contactSellerBtnText}>Call Seller: {order.stall_phone}</Text>
            </TouchableOpacity>
          </View>
        )}

        {order?.status !== 'Pending' && order?.status !== 'Rejected' ? (
          <>
            <Text style={styles.sectionTitle}>Order Billing</Text>
            <View style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceIconBox}>
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#1A1A1A" />
                </View>
                <View style={styles.invoiceHeaderText}>
                  <Text style={styles.invoiceTitle}>E-Invoice Issued</Text>
                  <Text style={styles.invoiceStatus}>Payment Verified • PAID</Text>
                </View>
              </View>
              
              <Text style={styles.invoiceDesc}>
                Your official receipt is ready. You can view the full details of your purchase and download it as a PDF for your records.
              </Text>

              <View style={styles.invoiceActions}>
                <TouchableOpacity 
                  style={styles.viewInvoiceBtn}
                  onPress={() => setIsReceiptVisible(true)}
                >
                  <Ionicons name="eye-outline" size={18} color="#1A1A1A" />
                  <Text style={styles.viewInvoiceBtnText}>View Receipt</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.downloadInvoiceBtn}
                  onPress={downloadReceipt}
                >
                  <Ionicons name="download-outline" size={18} color="#FFF" />
                  <Text style={styles.downloadInvoiceBtnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.pendingReceiptCard}>
            <Ionicons name="time-outline" size={24} color="#888" />
            <Text style={styles.pendingReceiptText}>Receipt will be available once seller accepts your order.</Text>
          </View>
        )}

        {/* Modal Resit Estetik */}
        <Modal
          visible={isReceiptVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsReceiptVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.receiptPaper}>
              {/* Receipt Header */}
              <View style={styles.receiptTop}>
                <Image 
                  source={LogoImage} 
                  style={styles.receiptLogo} 
                  resizeMode="contain" 
                />
                <Text style={styles.receiptBrand}>UKMFoodie</Text>
                <Text style={styles.receiptType}>OFFICIAL RECEIPT</Text>
                <View style={styles.paidStampModal}>
                  <Text style={styles.paidStampText}>PAID</Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.receiptScroll}>
                <View style={styles.receiptInfoGrid}>
                  <View>
                    <Text style={styles.receiptInfoLabel}>STALL</Text>
                    <Text style={styles.receiptInfoValue}>{order?.stall_name || 'Stall'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.receiptInfoLabel}>CUSTOMER</Text>
                    <Text style={styles.receiptInfoValue}>{order?.customer_name || 'Customer'}</Text>
                  </View>
                </View>

                <View style={styles.receiptInfoGrid}>
                  <View>
                    <Text style={styles.receiptInfoLabel}>ORDER NO</Text>
                    <Text style={styles.receiptInfoValue}>#ORD-${formatOrderDate(order?.created_at)}-${order_id}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.receiptInfoLabel}>DATE</Text>
                    <Text style={styles.receiptInfoValue}>{new Date(order?.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={styles.receiptDivider} />

                {order?.items?.map((item, index) => (
                  <View key={index} style={styles.receiptItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.receiptItemName}>{item.item_name}</Text>
                      {item.note && (
                        <Text style={styles.receiptItemNote}>Note: {item.note}</Text>
                      )}
                      <Text style={styles.receiptItemQty}>{item.quantity} x RM {parseFloat(item.price).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.receiptItemTotal}>RM {(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}

                <View style={styles.receiptDividerDashed} />

                <View style={styles.receiptSummaryRow}>
                  <Text style={styles.receiptSummaryLabel}>Subtotal</Text>
                  <Text style={styles.receiptSummaryValue}>RM {(parseFloat(order?.total_amount) - 1).toFixed(2)}</Text>
                </View>
                <View style={styles.receiptSummaryRow}>
                  <Text style={styles.receiptSummaryLabel}>Service Tax</Text>
                  <Text style={styles.receiptSummaryValue}>RM 1.00</Text>
                </View>
                <View style={[styles.receiptSummaryRow, { marginTop: 10 }]}>
                  <Text style={styles.receiptGrandLabel}>TOTAL</Text>
                  <Text style={styles.receiptGrandValue}>RM {parseFloat(order?.total_amount).toFixed(2)}</Text>
                </View>

                <View style={styles.receiptFooter}>
                  <Text style={styles.receiptFooterText}>Thank you for ordering!</Text>
                  <Text style={styles.receiptFooterSub}>This is a digital receipt.</Text>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={styles.closeReceiptBtn}
                onPress={() => setIsReceiptVisible(false)}
              >
                <Text style={styles.closeReceiptBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* TAMBAHAN: Butang Selesai untuk Customer - SEKARANG DI BAWAH ORDER DETAILS */}
        {order?.status === 'Ready' && (
          <TouchableOpacity 
            style={[styles.completeOrderBtn, { marginTop: 20 }]} 
            onPress={async () => {
              try {
                const response = await fetch(`${API_BASE}/update_order_status.php`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ order_id: order_id, status: 'Completed' })
                });
                const result = await response.json();
                if (result.status === 'success') {
                  showToast("Order marked as completed!", "success");
                  fetchOrderStatus();
                }
              } catch (error) {
                console.error("Error completing order:", error);
              }
            }}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#FFF" />
            <Text style={styles.completeOrderBtnText}>I have received my food</Text>
          </TouchableOpacity>
        )}

        {/* TAMBAHAN: Ruangan Review */}
        {(order?.status === 'Completed' || order?.status === 'Ready') && parseInt(order.is_reviewed) === 0 && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Rate your experience</Text>
            <Text style={styles.reviewSubtitle}>How was the food and service?</Text>
            
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={35} 
                    color="#FFC93C" 
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submittingReview && { opacity: 0.7 }]} 
              onPress={submitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#1A1A1A" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 16, 
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center'
  },
  homeBtnText: {
    marginLeft: 5,
    fontWeight: '700',
    fontSize: 14,
    color: '#1A1A1A'
  },
  content: { 
    padding: 20,
    paddingBottom: 120 
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  minimalProgressContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 25,
    overflow: 'hidden',
  },
  minimalProgressBar: {
    height: '100%',
    backgroundColor: '#FFC93C',
    borderRadius: 3,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    paddingTop: 20,
  },
  statusFooterLabel: {
    fontSize: 12,
    color: '#AAA',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusFooterValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
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
  },
  completeOrderBtn: {
    backgroundColor: '#50CD89',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  completeOrderBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  submitBtn: {
    backgroundColor: '#FFC93C',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  invoiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  invoiceIconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FFF8DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  invoiceStatus: {
    fontSize: 12,
    color: '#50CD89',
    fontWeight: '700',
    marginTop: 2,
  },
  invoiceDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewInvoiceBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewInvoiceBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  downloadInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  downloadInvoiceBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptPaper: {
    backgroundColor: '#FFF',
    width: '100%',
    maxHeight: '85%',
    borderRadius: 5,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptTop: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  receiptLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  receiptBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  receiptType: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
    marginTop: 5,
    fontWeight: '700',
  },
  paidStampModal: {
    position: 'absolute',
    top: 10,
    right: -10,
    borderWidth: 3,
    borderColor: '#50CD89',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
    opacity: 0.6,
  },
  paidStampText: {
    color: '#50CD89',
    fontWeight: '900',
    fontSize: 18,
  },
  receiptScroll: {
    marginVertical: 15,
  },
  receiptInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  receiptInfoLabel: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: 'bold',
  },
  receiptInfoValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '700',
    marginTop: 2,
  },
  receiptDivider: {
    height: 2,
    backgroundColor: '#1A1A1A',
    marginVertical: 15,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  receiptItemNote: {
    fontSize: 11,
    color: '#F1416C',
    fontStyle: 'italic',
    marginVertical: 2,
  },
  receiptItemQty: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  receiptItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  receiptDividerDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    marginVertical: 15,
  },
  receiptSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptSummaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  receiptSummaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  receiptGrandLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  receiptGrandValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  receiptFooter: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  receiptFooterSub: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 5,
  },
  closeReceiptBtn: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeReceiptBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingReceiptCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  pendingReceiptText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  rejectedCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#F1416C',
    marginTop: 10,
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rejectedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1416C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rejectedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  rejectedSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rejectedDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactSellerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  contactSellerBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },

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