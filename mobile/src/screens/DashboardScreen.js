import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getIzins, getLateRecords, getPelanggarans, getPengumuman, checkServerHealth, changePassword } from '../services/api';

const MENU_ITEMS = [
  { id: 'students',   title: 'Data Siswa',        icon: '🎓', screen: 'Students',   color: '#00695C', light: '#E0F2F1' },
  { id: 'izin',       title: 'Izin Siswa',        icon: '📋', screen: 'Izin',       color: '#1565C0', light: '#E3F2FD' },
  { id: 'late',       title: 'Terlambat',          icon: '⏰', screen: 'Late',       color: '#E65100', light: '#FFF3E0' },
  { id: 'pelanggaran',title: 'Pelanggaran',        icon: '⚠️', screen: 'Pelanggaran',color: '#B71C1C', light: '#FFEBEE' },
  { id: 'schedule',   title: 'Jadwal',             icon: '📅', screen: 'Schedule',   color: '#1A237E', light: '#E8EAF6' },
];

const DashboardScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ izin: 0, late: 0, pelanggaran: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [newsList, setNewsList] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const displayName = userInfo?.teacher_name || userInfo?.name || userInfo?.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Semua kolom password harus diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }
    setChangingPass(true);
    try {
      const response = await changePassword({
        username: userInfo?.username,
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (response.status === 200) {
        Alert.alert('Sukses', 'Password berhasil diubah!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setPassModalVisible(false);
      } else {
        Alert.alert('Gagal', response.data?.message || 'Gagal mengubah password');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Terjadi kesalahan jaringan';
      Alert.alert('Error', msg);
    } finally {
      setChangingPass(false);
    }
  };

  useEffect(() => {
    let interval;
    const checkDb = async () => {
      try {
        const response = await checkServerHealth();
        if (response.status === 200) {
          setDbStatus('Connected');
        } else {
          setDbStatus('Disconnected');
        }
      } catch (error) {
        setDbStatus('Disconnected');
      }
    };
    checkDb();
    interval = setInterval(checkDb, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resIzin, resLate, resPelanggaran, resNews] = await Promise.all([
          getIzins(),
          getLateRecords(),
          getPelanggarans(),
          getPengumuman()
        ]);
        
        const uniqueIzin = new Set(resIzin.data?.data?.map(i => i.student_id || i.nis)).size;
        const uniqueLate = new Set(resLate.data?.data?.map(l => l.student_id || l.nipd)).size;
        const totalPelanggaran = resPelanggaran.data?.data?.length || 0;

        setStats({ izin: uniqueIzin, late: uniqueLate, pelanggaran: totalPelanggaran });

        const fetchedNews = resNews.data?.data || [];
        setNewsList(fetchedNews.map(n => ({
          id: n._id || Math.random().toString(),
          title: n.title,
          date: n.date ? new Date(n.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
          type: n.type || 'Informasi',
          content: n.content,
          isActive: n.isActive !== false
        })).filter(n => n.isActive));

      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />

      {/* Header (Sticky) */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View flex={1}>
            <Text style={styles.welcomeLabel}>Selamat datang,</Text>
            <Text style={styles.usernameText} numberOfLines={1}>{displayName}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{(userInfo?.role || 'staff').toUpperCase()}</Text>
            </View>
            <View style={[styles.dbStatusPill, { backgroundColor: dbStatus === 'Connected' ? 'rgba(76,175,80,0.2)' : dbStatus === 'Checking...' ? 'rgba(255,255,255,0.2)' : 'rgba(239,83,80,0.2)' }]}>
              <View style={[styles.dbStatusDot, { backgroundColor: dbStatus === 'Connected' ? '#81C784' : dbStatus === 'Checking...' ? '#FFF' : '#E57373' }]} />
              <Text style={styles.dbStatusText}>Server: {dbStatus}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => setPassModalVisible(true)}>
            <Text style={styles.avatarText}>{initial}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats bar */}
        <Text style={styles.statsTitle}>Laporan Hari Ini</Text>
        <View style={styles.statsRow}>
          {loadingStats ? (
            <ActivityIndicator color="#fff" style={{ margin: 20, alignSelf: 'center', width: '100%' }} />
          ) : (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>📋</Text>
                <Text style={styles.statValue}>{stats.izin}</Text>
                <Text style={styles.statLabel}>Siswa Izin</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⏰</Text>
                <Text style={styles.statValue}>{stats.late}</Text>
                <Text style={styles.statLabel}>Siswa Telat</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text style={styles.statValue}>{stats.pelanggaran}</Text>
                <Text style={styles.statLabel}>Pelanggaran</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Berita Terkini */}
        <Text style={styles.sectionTitle}>Berita Terkini</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsScroll}>
          {newsList.map(news => (
            <TouchableOpacity 
              key={news.id} 
              style={styles.newsCard} 
              onPress={() => {
                setSelectedNews(news);
                setNewsModalVisible(true);
              }}
            >
              <View style={styles.newsTypeBadge}>
                <Text style={styles.newsTypeText}>{news.type}</Text>
              </View>
              <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
              <Text style={styles.newsDate}>{news.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map(item => {
            const isDisabled = item.id === 'schedule' && dbStatus !== 'Connected';
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuCard, { backgroundColor: isDisabled ? '#E0E0E0' : item.light, opacity: isDisabled ? 0.6 : 1 }]}
                disabled={isDisabled}
                onPress={() => navigation.navigate(item.screen)}
                id={`menu-${item.id}`}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: isDisabled ? '#9E9E9E' : item.color }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={[styles.menuLabel, { color: isDisabled ? '#757575' : item.color }]}>
                  {item.title} {isDisabled && '(Offline)'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} id="btn-logout">
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={passModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Password</Text>
            
            <Text style={styles.inputLabel}>Password Lama</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInputField}
                secureTextEntry={!showPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Masukkan password lama"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Password Baru</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInputField}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Masukkan password baru"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInputField}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ulangi password baru"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPassModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={changingPass}>
                {changingPass ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* News Detail Modal */}
      <Modal visible={newsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedNews && (
              <>
                <View style={[styles.newsTypeBadge, { marginBottom: 16 }]}>
                  <Text style={styles.newsTypeText}>{selectedNews.type}</Text>
                </View>
                <Text style={styles.newsDetailTitle}>{selectedNews.title}</Text>
                <Text style={styles.newsDetailDate}>Diterbitkan pada {selectedNews.date}</Text>
                
                <ScrollView style={{ marginVertical: 20, maxHeight: 350 }}>
                  <Text style={styles.newsDetailText}>{selectedNews.content}</Text>
                </ScrollView>

                <TouchableOpacity style={[styles.saveBtn, { width: '100%', marginTop: 10 }]} onPress={() => setNewsModalVisible(false)}>
                  <Text style={styles.saveBtnText}>Tutup Berita</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  scrollContent: { paddingBottom: 40, paddingTop: 24 },

  header: { backgroundColor: '#0D47A1', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, elevation: 4, zIndex: 10 },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  welcomeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  usernameText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  rolePill: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  dbStatusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 6, gap: 6 },
  dbStatusDot: { width: 6, height: 6, borderRadius: 3 },
  dbStatusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 10, marginBottom: 16 },
  statsTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 16 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },

  newsScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  newsCard: { width: 220, backgroundColor: '#fff', padding: 14, borderRadius: 16, elevation: 2 },
  newsTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E0F2F1', borderRadius: 6, marginBottom: 8 },
  newsTypeText: { fontSize: 10, fontWeight: 'bold', color: '#00695C', textTransform: 'uppercase' },
  newsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6, lineHeight: 20 },
  newsDate: { fontSize: 11, color: '#888' },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', gap: 12 },
  menuCard: { width: '48%', borderRadius: 16, padding: 18, alignItems: 'center', justifyContent: 'center', elevation: 1, marginBottom: 4 },
  menuIconCircle: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuIcon: { fontSize: 24 },
  menuLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#EF5350', backgroundColor: '#fff', gap: 8 },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#EF5350', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
  inputLabel: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '600' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, marginBottom: 16, height: 48 },
  passwordInputField: { flex: 1, paddingHorizontal: 14, height: '100%' },
  eyeIcon: { padding: 12, justifyContent: 'center', alignItems: 'center' },
  eyeIconText: { fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#0D47A1', minWidth: 90, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  
  newsDetailTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8, lineHeight: 28 },
  newsDetailDate: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  newsDetailText: { fontSize: 15, color: '#444', lineHeight: 24 },
});

export default DashboardScreen;
