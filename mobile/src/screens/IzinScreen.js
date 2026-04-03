import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { getIzins, createIzin } from '../services/api';

const TYPES = ['Sakit', 'Izin', 'Alfa'];
const COLORS = { Sakit: '#4CAF50', Izin: '#2196F3', Alfa: '#FF5722' };

const IzinScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ nis: '', name: '', className: '', type: 'Sakit', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getIzins();
      setData(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data izin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.nis || !form.name || !form.reason) {
      Alert.alert('Error', 'NIS, Nama, dan Alasan wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createIzin({ ...form, time: new Date().toISOString() });
      setModalVisible(false);
      setForm({ nis: '', name: '', className: '', type: 'Sakit', reason: '' });
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan izin');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.typeBadge, { backgroundColor: COLORS[item.type] || '#888' }]}>
        <Text style={styles.typeText}>{item.type || '-'}</Text>
      </View>
      <Text style={styles.cardName}>{item.name || item.nis || 'Siswa'}</Text>
      <Text style={styles.cardSub}>{item.className || ''}</Text>
      <Text style={styles.cardReason}>{item.reason}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Data Izin Siswa</Text>
        <Text style={styles.headerSub}>{data.length} record</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1565C0" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data izin</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah Izin Siswa</Text>
            <TextInput style={styles.input} placeholder="NIS" value={form.nis} onChangeText={v => setForm(f => ({ ...f, nis: v }))} />
            <TextInput style={styles.input} placeholder="Nama Siswa" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            <TextInput style={styles.input} placeholder="Kelas (opsional)" value={form.className} onChangeText={v => setForm(f => ({ ...f, className: v }))} />
            <Text style={styles.label}>Jenis Izin</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && { backgroundColor: COLORS[t] }]} onPress={() => setForm(f => ({ ...f, type: t }))}>
                  <Text style={[styles.typeChipText, form.type === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Alasan" value={form.reason} onChangeText={v => setForm(f => ({ ...f, reason: v }))} multiline />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1565C0', padding: 20, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#90CAF9', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 4 },
  cardReason: { fontSize: 14, color: '#444', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1565C0', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 15, backgroundColor: '#FAFAFA' },
  label: { fontSize: 13, color: '#666', marginBottom: 8 },
  typeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  typeChipText: { fontSize: 14, color: '#444' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
});

export default IzinScreen;
