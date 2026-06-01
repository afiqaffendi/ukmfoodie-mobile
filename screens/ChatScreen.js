import React, { useState, useEffect, useRef } from 'react';
import { IP_ADDRESS, API_BASE } from '../constants/config';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ navigation, route }) {
  const { order_id, stall_id } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const flatListRef = useRef();

  useEffect(() => {
    loadUser();
    fetchMessages();
    markMessagesAsRead();
    const interval = setInterval(() => {
      fetchMessages();
      markMessagesAsRead();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/fetch_chat.php?order_id=${order_id}`);
      const result = await response.json();
      if (result.status === 'success') {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`${API_BASE}/mark_chat_read.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order_id, reader_type: 'customer' })
      });
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageData = {
      order_id: order_id,
      sender_id: user.id,
      sender_type: 'customer',
      message: inputText.trim()
    };

    setInputText('');

    try {
      const response = await fetch(`${API_BASE}/send_chat.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      const result = await response.json();
      if (result.status === 'success') {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_type === 'customer';
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chat with Seller</Text>
          <Text style={styles.headerSubtitle}>Order #ORD-{order_id}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color="#FFC93C" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: { marginRight: 15 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  messageList: { padding: 15, paddingBottom: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFC93C',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: '#000' },
  theirMessageText: { color: '#333' },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(0,0,0,0.5)' },
  theirMessageTime: { color: '#999' },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFC93C',
    justifyContent: 'center',
    alignItems: 'center',
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
