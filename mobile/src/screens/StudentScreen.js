import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { getStudents } from '../services/api';

const StudentScreen = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (search.length >= 2 || search.length === 0) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
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
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.nama || 'S').charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.studentName}>{item.nama || 'Tanpa Nama'}</Text>
        <Text style={styles.studentMeta}>NIS: {item.nipd || item.nisn || '-'} • Kelas: {item.nama_rombel || 'Tanpa Kelas'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00695C" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎓 Data Siswa</Text>
        <Text style={styles.headerSub}>Total: {results.length} Siswa</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama siswa..."
            value={search}
            onChangeText={setSearch}
          />
          {loading && <ActivityIndicator size="small" color="#00695C" />}
        </View>

        <FlatList
          data={results}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Tidak ada siswa ditemukan</Text>
          }
          contentContainerStyle={styles.listPadding}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2F1' },
  header: { backgroundColor: '#00695C', padding: 20, paddingTop: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#B2DFDB', marginTop: 4, fontSize: 13 },
  content: { flex: 1, padding: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, elevation: 2 },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#B2DFDB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#00695C', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4 },
  studentMeta: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 15 },
  listPadding: { paddingBottom: 40 },
});

export default StudentScreen;
