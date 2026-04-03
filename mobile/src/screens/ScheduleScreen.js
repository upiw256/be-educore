import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { getSchedules } from '../services/api';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_COLORS = ['#7C4DFF', '#1565C0', '#00897B', '#F57F17', '#D84315', '#37474F'];

const ScheduleScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [rombel, setRombel] = useState('');
  const [rombelInput, setRombelInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (rombel) params.rombel = rombel;
      if (selectedDay) params.day = selectedDay;
      const res = await getSchedules(params);
      setData(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDay, rombel]);

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
        <View style={styles.rombelRow}>
          <TextInput
            style={styles.rombelInput}
            placeholder="Filter kelas (contoh: X IPA 1)"
            placeholderTextColor="#9FA8DA"
            value={rombelInput}
            onChangeText={setRombelInput}
            onSubmitEditing={() => setRombel(rombelInput)}
          />
        </View>
      </View>

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
  header: { backgroundColor: '#1A237E', padding: 20, paddingTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  rombelRow: { flexDirection: 'row' },
  rombelInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
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
