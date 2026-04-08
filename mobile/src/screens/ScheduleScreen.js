import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, StatusBar, TextInput, ScrollView, Modal,
} from 'react-native';
import { getSchedules, getScheduleClasses, getScheduleDirect } from '../services/api';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_COLORS = ['#7C4DFF', '#1565C0', '#00897B', '#F57F17', '#D84315', '#37474F'];

const ScheduleScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [rombel, setRombel] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);

  const SCHEDULE_API_BASE = process.env.EXPO_PUBLIC_SCHEDULE_API_URL || 'https://jadwalapi.sman1margaasih.sch.id/jadwal/kelas';

  const fetchClasses = async () => {
    try {
      const res = await getScheduleClasses();
      const classList = res.data.data || [];
      setClasses(classList);
      if (classList.length > 0 && !rombel) {
        setRombel(classList[0]);
      }
    } catch (e) {
      console.error('Failed to fetch classes:', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (rombel) {
        // Fetch DIRECTLY from external API using explicitly defined URL
        const targetUrl = `${SCHEDULE_API_BASE}/${rombel}`;
        console.log('[Schedule API] Fetching from:', targetUrl);

        const res = await getScheduleDirect(rombel);
        const dayKey = selectedDay.toUpperCase();
        const rawList = res.data?.data_per_hari?.[dayKey] || [];
        
        const formatted = rawList.map(item => ({
          period: item.jam_ke,
          timeRange: item.waktu,
          subject: item.kegiatan?.[0]?.mapel || 'Istirahat / Lainnya',
          teacherName: item.kegiatan?.[0]?.guru || '-',
          rombel: res.data.kelas
        }));
        setData(formatted);
      } else {
        setData([]);
      }
    } catch (e) {
      if (e.response?.status === 404) {
        console.log(`[Schedule API] No schedule found for ${rombel} (404)`);
        setData([]);
      } else {
        Alert.alert('Error', 'Gagal memuat jadwal: ' + (e.response?.data?.message || e.message));
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (rombel) fetchData(); }, [selectedDay, rombel]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.periodBadge}>
        <Text style={styles.periodText}>{item.period || '-'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.subjectText}>{item.subject || '-'}</Text>
        <Text style={styles.teacherText}>👤 {item.teacherName || '-'}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🕐 {item.timeRange || '-'}</Text>
          <Text style={styles.metaText}>🏫 {item.rombel || '-'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Jadwal Pelajaran</Text>
        <TouchableOpacity 
          style={styles.pickerTrigger} 
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.pickerTriggerText}>
            {rombel ? `Kelas: ${rombel}` : 'Pilih Kelas'}
          </Text>
          <Text style={styles.pickerIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Class Selection Modal */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kelas</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.closeBtn}>Tutup</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.classList}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  style={[styles.classItem, rombel === cls && styles.classItemActive]}
                  onPress={() => {
                    setRombel(cls);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[styles.classItemText, rombel === cls && styles.classItemTextActive]}>
                    {cls}
                  </Text>
                  {rombel === cls && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Day selector */}
      <View style={styles.dayScroll}>
        {DAYS.map((day, idx) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDay === day && { backgroundColor: DAY_COLORS[idx] }]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && { color: '#fff' }]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1A237E" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada jadwal untuk {selectedDay}</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1A237E', paddingVertical: 20, paddingHorizontal: 16, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  pickerTrigger: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  pickerTriggerText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  pickerIcon: { color: '#fff', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E' },
  closeBtn: { color: '#1A237E', fontWeight: 'bold' },
  classList: { padding: 10 },
  classItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  classItemActive: { backgroundColor: '#E8EAF6' },
  classItemText: { fontSize: 16, color: '#333' },
  classItemTextActive: { color: '#1A237E', fontWeight: 'bold' },
  checkIcon: { color: '#1A237E', fontSize: 18 },
  dayScroll: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, backgroundColor: '#fff', elevation: 2 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' },
  dayChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  periodBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center' },
  periodText: { fontWeight: 'bold', color: '#1A237E', fontSize: 16 },
  subjectText: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  teacherText: { fontSize: 13, color: '#555', marginVertical: 3 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 12, color: '#888' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
});

export default ScheduleScreen;
