import React, { useState, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info', // success, error, info
    buttons: [],
  });

  React.useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const showAlert = (title, message, type = 'info', buttons = []) => {
    // Default button if none provided
    const finalButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: null }];
    setAlertConfig({ title, message, type, buttons: finalButtons });
    setVisible(true);
  };

  const hideAlert = (onPress) => {
    Animated.timing(scaleAnim, {
      toValue: 0.8,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onPress) {
        onPress();
      }
    });
  };

  const getIcon = () => {
    switch (alertConfig.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (alertConfig.type) {
      case 'success': return '#50CD89';
      case 'error': return '#F1416C';
      case 'info': return '#FFC93C';
      case 'warning': return '#FFA800';
      default: return '#FFC93C';
    }
  };

  const getBgColor = () => {
    switch (alertConfig.type) {
      case 'success': return '#E8FFF3';
      case 'error': return '#FFF5F8';
      case 'info': return '#FFF8DD';
      case 'warning': return '#FFF4E5';
      default: return '#FFF8DD';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }] }]}>
            <View style={[styles.iconContainer, { backgroundColor: getBgColor() }]}>
              <Ionicons name={getIcon()} size={40} color={getIconColor()} />
            </View>
            
            <Text style={styles.title}>{alertConfig.title}</Text>
            <Text style={styles.message}>{alertConfig.message}</Text>
            
            <View style={styles.buttonContainer}>
              {alertConfig.buttons.map((btn, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.button, 
                    alertConfig.buttons.length > 1 && styles.multiButton,
                    btn.style === 'destructive' ? styles.destructiveButton : 
                    btn.style === 'cancel' ? styles.cancelButton : 
                    { backgroundColor: getIconColor() }
                  ]} 
                  onPress={() => hideAlert(btn.onPress)}
                >
                  <Text style={[
                    styles.buttonText,
                    btn.style === 'cancel' && styles.cancelButtonText
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  multiButton: {
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
  },
  cancelButtonText: {
    color: '#4B5563',
  },
  destructiveButton: {
    backgroundColor: '#F1416C',
  }
});
