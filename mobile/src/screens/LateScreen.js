import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { getLateRecords, createLateRecord } from '../services/api';

const LateScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ nipd: '', reason: '', recorded_by: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getLateRecords();
      setData(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Gagal memuat data keterlambatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.nipd) {
      Alert.alert('Error', 'NIPD wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createLateRecord({
        ...form,
        arrival_time: new Date().toISOString(),
        semester: 1,
        academic_year: '2025/2026',
      });
      setModalVisible(false);
      setForm({ nipd: '', reason: '', recorded_by: '' });
      fetchData();
    } catch {
      Alert.alert('Error', 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (t) => {
    if (!t) return '-';
    try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
    catch { return '-'; }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.timeCircle}>
        <Text style={styles.timeText}>{formatTime(item.arrival_time)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardNipd}>NIPD: {item.nipd || '-'}</Text>
        <Text style={styles.cardReason}>{item.reason || 'Tanpa keterangan'}</Text>
        <Text style={styles.cardRecordedBy}>Dicatat oleh: {item.recorded_by || '-'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E65100" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Presensi Terlambat</Text>
        <Text style={styles.headerSub}>{data.length} record</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#E65100" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data keterlambatan</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Catat Keterlambatan</Text>
            <TextInput style={styles.input} placeholder="NIPD Siswa" value={form.nipd} onChangeText={v => setForm(f => ({ ...f, nipd: v }))} />
            <TextInput style={styles.input} placeholder="Alasan (opsional)" value={form.reason} onChangeText={v => setForm(f => ({ ...f, reason: v }))} />
            <TextInput style={styles.input} placeholder="Dicatat oleh" value={form.recorded_by} onChangeText={v => setForm(f => ({ ...f, recorded_by: v }))} />
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
  container: { flex: 1, backgroundColor: '#FFF3E0' },
  header: { backgroundColor: '#E65100', padding: 20, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#FFCC80', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E65100' },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },
  cardNipd: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardReason: { fontSize: 13, color: '#666', marginVertical: 2 },
  cardRecordedBy: { fontSize: 12, color: '#aaa' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#E65100', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 15, backgroundColor: '#FAFAFA' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#E65100', alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
});

export default LateScreen;
