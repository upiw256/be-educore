import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
  ScrollView,
} from 'react-native';
import { getIzins, createIzin } from '../services/api';
import StudentPicker from '../components/StudentPicker';
import { AuthContext } from '../context/AuthContext';

const IzinScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [form, setForm] = useState({ 
    student_id: '',
    nis: '', 
    name: '', 
    className: '', 
    reason: '',
    recorded_by: userInfo?.teacher_name || userInfo?.username || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getIzins();
      setData(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data izin: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Update recorded_by when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setForm(f => ({ ...f, recorded_by: userInfo.teacher_name || userInfo.username || '' }));
    }
  }, [userInfo]);

  // Group data by StudentID (fallback to NIS)
  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      const key = item.student_id || item.nis || 'unidentified';
      if (!groups[key]) {
        groups[key] = {
          student_id: item.student_id,
          nis: item.nis,
          name: item.name,
          className: item.className,
          records: []
        };
      }
      groups[key].records.push(item);
    });
    return Object.values(groups).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data]);

  const handleSubmit = async () => {
    if (!form.student_id && !form.nis) {
      Alert.alert('Error', 'Siswa wajib diisi');
      return;
    }
    if (!form.reason) {
      Alert.alert('Error', 'Alasan wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createIzin({ 
        ...form, 
        time: new Date().toISOString() 
      });
      setModalVisible(false);
      setForm(f => ({ ...f, student_id: '', nis: '', name: '', className: '', reason: '' }));
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan izin: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onStudentSelect = (student) => {
    setForm(f => ({
      ...f,
      student_id: student.id || student._id || '',
      nis: student.nipd || student.nisn || '',
      name: student.nama || '',
      className: student.nama_rombel || ''
    }));
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setSelectedStudent(item);
        setDetailVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarMini}>
          <Text style={styles.avatarMiniText}>{(item.name || 'S').charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{item.name || 'Tanpa Nama'}</Text>
          <Text style={styles.cardSub}>{item.className || '-'} • NIS: {item.nis}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.records.length}</Text>
        </View>
      </View>
      <Text style={styles.cardFooter}>Ketuk untuk melihat riwayat {item.records.length} rekaman</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Rekap Izin Siswa</Text>
        <Text style={styles.headerSub}>{groupedData.length} siswa, {data.length} total rekaman</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1565C0" />
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.student_id || item.nis || Math.random().toString()}
          renderItem={renderGroupItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data izin</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL: TAMBAH IZIN */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah Izin Baru</Text>
            
            <Text style={styles.label}>Pilih Siswa</Text>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible(true)}>
              <Text style={[styles.pickerTriggerText, !form.name && { color: '#aaa' }]}>
                {form.name ? `${form.name} (${form.className})` : 'Cari Nama Siswa...'}
              </Text>
              <Text>🔍</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Alasan</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="Masukkan alasan izin..." 
              value={form.reason} 
              onChangeText={v => setForm(f => ({ ...f, reason: v }))} 
              multiline 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Simpan Izin</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: DETAIL RIWAYAT */}
      <Modal visible={detailVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { height: '70%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Riwayat Izin</Text>
                <Text style={styles.modalSub}>{selectedStudent?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.closeBtn}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedStudent?.records.map((rec, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{new Date(rec.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={styles.historyReason}>{rec.reason}</Text>
                  <Text style={styles.historyMeta}>Dicatat oleh: {rec.recorded_by || '-'}</Text>
                </View>
              ))}
            </ScrollView>
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
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1565C0', padding: 20, paddingTop: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#90CAF9', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarMiniText: { color: '#1565C0', fontWeight: 'bold', fontSize: 18 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
  cardSub: { fontSize: 12, color: '#666', marginTop: 2 },
  countBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 14, fontWeight: 'bold', color: '#1A237E' },
  cardFooter: { marginTop: 12, fontSize: 12, color: '#1565C0', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8, textAlign: 'center', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#1565C0', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 35 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A2E' },
  modalSub: { fontSize: 14, color: '#666', marginTop: 2 },
  closeBtn: { color: '#1565C0', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  pickerTriggerText: { fontSize: 15, color: '#1A1A2E' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, backgroundColor: '#F8F9FA' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: '#1565C0', alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  historyDate: { fontSize: 12, color: '#999', fontWeight: 'bold' },
  historyReason: { fontSize: 14, color: '#555', marginTop: 4 },
  historyMeta: { fontSize: 11, color: '#aaa', marginTop: 4 },
});

export default IzinScreen;
