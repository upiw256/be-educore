import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Modal, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { getStudents } from '../services/api';

const StudentPicker = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [search]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await getStudents(search);
      setResults(res.data.data || []);
    } catch (e) {
      console.error('Search error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.studentItem}
      onPress={() => {
        onSelect(item);
        setSearch('');
        onClose();
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.nama || 'S').charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.studentName}>{item.nama || 'Tanpa Nama'}</Text>
        <Text style={styles.studentMeta}>NIS: {item.nipd || item.nisn || '-'} • {item.nama_rombel || 'Tanpa Kelas'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cari Siswa</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Tutup</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Ketik nama siswa..."
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {loading && <ActivityIndicator size="small" color="#1565C0" />}
          </View>

          <FlatList
            data={results}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              !loading && search.length >= 2 ? (
                <Text style={styles.emptyText}>Tidak ada siswa ditemukan</Text>
              ) : (
                <Text style={styles.emptyText}>Masukkan minimal 2 karakter</Text>
              )
            }
            contentContainerStyle={styles.listPadding}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E' },
  closeBtn: { color: '#1565C0', fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  studentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#1565C0', fontWeight: 'bold' },
  info: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A2E' },
  studentMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  listPadding: { paddingBottom: 40 },
});

export default StudentPicker;
