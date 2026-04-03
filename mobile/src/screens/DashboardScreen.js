import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const MENU_ITEMS = [
  { id: 'izin',       title: 'Izin Siswa',        icon: '📋', screen: 'Izin',       color: '#1565C0', light: '#E3F2FD' },
  { id: 'late',       title: 'Terlambat',          icon: '⏰', screen: 'Late',       color: '#E65100', light: '#FFF3E0' },
  { id: 'pelanggaran',title: 'Pelanggaran',        icon: '⚠️', screen: 'Pelanggaran',color: '#B71C1C', light: '#FFEBEE' },
  { id: 'schedule',   title: 'Jadwal Pelajaran',   icon: '📅', screen: 'Schedule',   color: '#1A237E', light: '#E8EAF6' },
];

const DashboardScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);

  const initial = (userInfo?.username || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.welcomeLabel}>Selamat datang,</Text>
              <Text style={styles.usernameText}>{userInfo?.username || 'User'}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{(userInfo?.role || 'staff').toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          {/* Stats bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🎓</Text>
              <Text style={styles.statLabel}>Siswa</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statLabel}>Laporan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏫</Text>
              <Text style={styles.statLabel}>Kelas</Text>
            </View>
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: item.light }]}
              onPress={() => navigation.navigate(item.screen)}
              id={`menu-${item.id}`}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: item.color }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.title}</Text>
              <Text style={[styles.menuArrow, { color: item.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} id="btn-logout">
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  scrollContent: { paddingBottom: 40 },

  header: { backgroundColor: '#0D47A1', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 24 },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  welcomeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  usernameText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  rolePill: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, marginHorizontal: -4, padding: 14, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 20 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 20, marginBottom: 12 },

  menuGrid: { paddingHorizontal: 16, gap: 12 },
  menuCard: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  menuIconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuIcon: { fontSize: 22 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  menuArrow: { fontSize: 18, fontWeight: '300' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 32, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#EF5350', backgroundColor: '#fff', gap: 8 },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#EF5350', fontWeight: '700', fontSize: 15 },
});

export default DashboardScreen;
