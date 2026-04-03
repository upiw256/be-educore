import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { getPelanggarans, createPelanggaran } from '../services/api';

const TYPES = ['Ringan', 'Sedang', 'Berat'];
const TYPE_COLORS = { Ringan: '#FFC107', Sedang: '#FF9800', Berat: '#F44336' };
const DEFAULT_POINTS = { Ringan: 5, Sedang: 15, Berat: 30 };

const PelanggaranScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ nis: '', type: 'Ringan', description: '', poin: '5' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPelanggarans();
      setData(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data pelanggaran: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.nis || !form.description) {
      Alert.alert('Error', 'NIS dan keterangan wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createPelanggaran({ ...form, poin: parseInt(form.poin) || 0 });
      setModalVisible(false);
      setForm({ nis: '', type: 'Ringan', description: '', poin: '5' });
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan pelanggaran: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.pointBadge, { backgroundColor: TYPE_COLORS[item.type] || '#888' }]}>
        <Text style={styles.pointText}>{item.poin || 0}</Text>
        <Text style={styles.pointLabel}>poin</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardNis}>NIS: {item.nis || '-'}</Text>
        <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[item.type] || '#888') + '22' }]}>
          <Text style={[styles.typeText, { color: TYPE_COLORS[item.type] || '#888' }]}>{item.type || '-'}</Text>
        </View>
        <Text style={styles.cardDesc}>{item.description || '-'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#B71C1C" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚠️ Data Pelanggaran</Text>
        <Text style={styles.headerSub}>{data.length} record</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#B71C1C" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data pelanggaran</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Catat Pelanggaran</Text>
            <TextInput style={styles.input} placeholder="NIS Siswa" value={form.nis} onChangeText={v => setForm(f => ({ ...f, nis: v }))} />
            <Text style={styles.label}>Jenis Pelanggaran</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, form.type === t && { backgroundColor: TYPE_COLORS[t] }]}
                  onPress={() => setForm(f => ({ ...f, type: t, poin: String(DEFAULT_POINTS[t]) }))}
                >
                  <Text style={[styles.typeChipText, form.type === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Keterangan pelanggaran" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
            <TextInput style={styles.input} placeholder="Poin" value={form.poin} onChangeText={v => setForm(f => ({ ...f, poin: v }))} keyboardType="numeric" />
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
  container: { flex: 1, backgroundColor: '#FFEBEE' },
  header: { backgroundColor: '#B71C1C', padding: 20, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#EF9A9A', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pointBadge: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pointText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  pointLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  cardNis: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginBottom: 6 },
  typeText: { fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#555' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#B71C1C', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 15, backgroundColor: '#FAFAFA' },
  label: { fontSize: 13, color: '#666', marginBottom: 8 },
  typeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  typeChipText: { fontSize: 13, color: '#444' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#B71C1C', alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
});

export default PelanggaranScreen;
