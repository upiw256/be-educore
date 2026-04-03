import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, StatusBar,
  ScrollView,
} from 'react-native';
import { getLateRecords, createLateRecord } from '../services/api';
import StudentPicker from '../components/StudentPicker';
import { AuthContext } from '../context/AuthContext';

const LateScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({ 
    student_id: '',
    nipd: '', 
    name: '', 
    className: '', 
    reason: '', 
    recorded_by: userInfo?.teacher_name || userInfo?.username || '' 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getLateRecords();
      setData(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data keterlambatan: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Update recorded_by when userInfo changes (e.g. after fresh login)
  useEffect(() => {
    if (userInfo) {
      setForm(f => ({ ...f, recorded_by: userInfo.teacher_name || userInfo.username || '' }));
    }
  }, [userInfo]);

  // Group data by StudentID (fallback to NIPD)
  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      const key = item.student_id || item.nipd || 'unidentified';
      if (!groups[key]) {
        groups[key] = {
          student_id: item.student_id,
          nipd: item.nipd,
          name: item.name || 'Siswa', 
          className: item.className || '-',
          records: []
        };
      }
      groups[key].records.push(item);
    });
    return Object.values(groups).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data]);

  const handleSubmit = async () => {
    if (!form.student_id && !form.nipd) {
      Alert.alert('Error', 'Silakan pilih siswa terlebih dahulu');
      return;
    }
    try {
      setSubmitting(true);
      await createLateRecord({
        student_id: form.student_id,
        nipd: form.nipd,
        name: form.name,
        className: form.className,
        reason: form.reason || 'Terlambat',
        recorded_by: form.recorded_by,
        arrival_time: new Date().toISOString(),
        semester: 1,
        academic_year: '2025/2026',
      });
      setModalVisible(false);
      setForm(f => ({ ...f, student_id: '', nipd: '', name: '', className: '', reason: '' }));
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan data: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onStudentSelect = (student) => {
    setForm(f => ({
      ...f,
      student_id: student.id || student._id || '',
      nipd: student.nipd || student.nisn || '',
      name: student.nama || '',
      className: student.nama_rombel || ''
    }));
  };

  const formatTime = (t) => {
    if (!t) return '-';
    try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
    catch { return '-'; }
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
          <Text style={styles.cardSub}>{item.className || '-'} • NIS: {item.nipd}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.records.length}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Terakhir: {formatTime(item.records[0]?.arrival_time)}</Text>
        <Text style={styles.footerLink}>Detail →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E65100" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Rekap Keterlambatan</Text>
        <Text style={styles.headerSub}>{groupedData.length} siswa, {data.length} total rekaman</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#E65100" />
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.student_id || item.nipd || Math.random().toString()}
          renderItem={renderGroupItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data keterlambatan</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL: TAMBAH DATA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Catat Terlambat</Text>
            
            <Text style={styles.label}>Cari Siswa</Text>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible(true)}>
              <Text style={[styles.pickerTriggerText, !form.name && { color: '#aaa' }]}>
                {form.name ? `${form.name} (${form.className})` : 'Cari Nama Siswa...'}
              </Text>
              <Text>🔍</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Alasan (Opsional)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Contoh: Ban bocor, Bangun kesiangan" 
              value={form.reason} 
              onChangeText={v => setForm(f => ({ ...f, reason: v }))} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Simpan Data</Text>}
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
                <Text style={styles.modalTitle}>Riwayat Terlambat</Text>
                <Text style={styles.modalSub}>{selectedStudent?.name || selectedStudent?.nipd}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.closeBtn}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedStudent?.records.map((rec, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTime}>{formatTime(rec.arrival_time)}</Text>
                    <Text style={styles.historyDate}>{new Date(rec.arrival_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                  <Text style={styles.historyReason}>{rec.reason || 'Tanpa keterangan'}</Text>
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
  container: { flex: 1, backgroundColor: '#FFF3E0' },
  header: { backgroundColor: '#E65100', padding: 20, paddingTop: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#FFCC80', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#FFB74D' },
  avatarMiniText: { color: '#E65100', fontWeight: 'bold', fontSize: 18 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
  cardSub: { fontSize: 12, color: '#666', marginTop: 2 },
  countBadge: { backgroundColor: '#FFCC80', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 14, fontWeight: 'bold', color: '#E65100' },
  cardFooter: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8 },
  footerText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  footerLink: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#E65100', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 35 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A2E' },
  modalSub: { fontSize: 14, color: '#666', marginTop: 2 },
  closeBtn: { color: '#E65100', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  pickerTriggerText: { fontSize: 15, color: '#1A1A2E' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, backgroundColor: '#F8F9FA' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: '#E65100', alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 10 },
  historyTime: { fontSize: 15, fontWeight: 'bold', color: '#E65100', backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  historyDate: { fontSize: 12, color: '#666', flex: 1 },
  historyReason: { fontSize: 14, color: '#333', marginTop: 2 },
  historyMeta: { fontSize: 11, color: '#aaa', marginTop: 4 },
});

export default LateScreen;
