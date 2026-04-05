import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { getPelanggarans, createPelanggaran } from '../services/api';
import StudentPicker from '../components/StudentPicker';

const TYPES = ['Ringan', 'Sedang', 'Berat'];
const TYPE_COLORS = { Ringan: '#FFC107', Sedang: '#FF9800', Berat: '#F44336' };
const DEFAULT_POINTS = { Ringan: 10, Sedang: 50, Berat: 100 };

const PelanggaranScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [form, setForm] = useState({ student_id: '', nis: '', name: '', className: '', type: 'Ringan', description: '', poin: '10' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null);

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
      Alert.alert('Error', 'Siswa dan keterangan wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createPelanggaran({ ...form, poin: parseInt(form.poin) || 0 });
      setModalVisible(false);
      setForm({ student_id: '', nis: '', name: '', className: '', type: 'Ringan', description: '', poin: '10' });
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan pelanggaran: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedData = React.useMemo(() => {
    const groups = {};
    data.forEach(item => {
      const key = item.nis || item.student_id || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          key,
          nis: item.nis,
          name: item.name,
          className: item.className,
          totalPoin: 0,
          records: [],
        };
      }
      groups[key].totalPoin += (Number(item.poin) || 0);
      groups[key].records.push(item);
    });
    return Object.values(groups).sort((a, b) => b.totalPoin - a.totalPoin);
  }, [data]);

  const onStudentSelect = (student) => {
    setForm(f => ({
      ...f,
      student_id: student.id || student._id || '',
      nis: student.nipd || student.nisn || '',
      name: student.nama || '',
      className: student.nama_rombel || ''
    }));
  };

  const renderItem = ({ item }) => {
    const badgeColor = item.totalPoin >= 30 ? '#F44336' : item.totalPoin >= 15 ? '#FF9800' : '#FFC107';
    const isExpanded = expandedKey === item.key;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => setExpandedKey(isExpanded ? null : item.key)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{item.name || 'Menunggu Sinkronisasi'}</Text>
            <Text style={styles.cardNis}>NIS: {item.nis || '-'} • Kelas: {item.className || '-'}</Text>
            <Text style={styles.cardSub}>{item.records.length} kali pelanggaran</Text>
          </View>
          <View style={[styles.pointBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.pointText}>{item.totalPoin}</Text>
            <Text style={styles.pointLabel}>Poin</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.records.map((rec, i) => (
              <View key={i} style={styles.recordItem}>
                <View style={styles.recordRow}>
                  <Text style={[styles.recordType, { color: TYPE_COLORS[rec.type] || '#888' }]}>{rec.type || 'Lainnya'}</Text>
                  <Text style={styles.recordPoints}>+{rec.poin} poin</Text>
                </View>
                <Text style={styles.recordDesc}>{rec.description || '-'}</Text>
                {rec.date && <Text style={styles.recordDate}>{new Date(rec.date).toLocaleDateString('id-ID')}</Text>}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#B71C1C" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚠️ Data Pelanggaran</Text>
        <Text style={styles.headerSub}>{groupedData.length} siswa dengan catatan pelanggaran</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#B71C1C" />
      ) : (
        <FlatList
          data={groupedData}
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
            
            <Text style={styles.label}>Cari Siswa</Text>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible(true)}>
              <Text style={[styles.pickerTriggerText, !form.name && { color: '#aaa' }]}>
                {form.name ? `${form.name} (${form.className})` : 'Cari Nama Siswa...'}
              </Text>
              <Text>🔍</Text>
            </TouchableOpacity>

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

      <StudentPicker 
        visible={pickerVisible} 
        onClose={() => setPickerVisible(false)} 
        onSelect={onStudentSelect} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFEBEE' },
  header: { backgroundColor: '#B71C1C', padding: 20, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#EF9A9A', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pointBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  pointText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pointLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '500', marginTop: -2 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 2 },
  cardNis: { fontSize: 13, color: '#666', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#D32F2F', fontWeight: '500' },
  expandedContent: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 16 },
  recordItem: { marginBottom: 12, backgroundColor: '#FAFAFA', padding: 10, borderRadius: 8 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recordType: { fontSize: 12, fontWeight: 'bold' },
  recordPoints: { fontSize: 12, fontWeight: 'bold', color: '#B71C1C' },
  recordDesc: { fontSize: 13, color: '#444', marginBottom: 4 },
  recordDate: { fontSize: 11, color: '#888' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#B71C1C', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 16 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, height: 46, marginBottom: 12 },
  pickerTriggerText: { fontSize: 15, color: '#1A1A2E' },
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
