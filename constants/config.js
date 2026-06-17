// ukmfoodie-mobile/constants/config.js

// ==========================================
// PANDUAN PENGGUNAAN IP_ADDRESS:
// ==========================================
// 1. Jika anda menggunakan Android Emulator (pada PC yang sama):
//    Gunakan '10.0.2.2'
// 2. Jika anda menggunakan iOS Simulator (pada PC yang sama):
//    Gunakan 'localhost'
// 3. Jika anda menggunakan Telefon Fizikal (Android/iOS):
//    Buka CMD, taip 'ipconfig', salin IPv4 Address komputer anda (contoh: '192.168.1.15').
//    Dan tampal IP tersebut di bawah.
// ==========================================
export const IP_ADDRESS = '167.172.94.242';

// Protokol ditukar ke 'http' kerana local XAMPP Apache menggunakan http secara default
export const API_BASE = `https://ukmfoodie.systems/ukmfoodie_api`;
