import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);

    const MenuButton = ({ title, icon, onPress, color }) => (
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: color }]} onPress={onPress}>
            <Text style={styles.menuTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome,</Text>
                    <Text style={styles.usernameText}>{userInfo?.username || 'User'}</Text>
                    <Text style={styles.roleText}>{userInfo?.role?.toUpperCase()}</Text>
                </View>

                <View style={styles.menuGrid}>
                    <MenuButton 
                        title="Izin Siswa" 
                        color="#4CAF50" 
                        onPress={() => console.log('Izin')} 
                    />
                    <MenuButton 
                        title="Presensi Terlambat" 
                        color="#FF9800" 
                        onPress={() => console.log('Late')} 
                    />
                    <MenuButton 
                        title="Pelanggaran" 
                        color="#F44336" 
                        onPress={() => console.log('Pelanggaran')} 
                    />
                    <MenuButton 
                        title="Jadwal Pelajaran" 
                        color="#2196F3" 
                        onPress={() => console.log('Schedule')} 
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    usernameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    roleText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600',
        marginTop: 5,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuButton: {
        width: '48%',
        height: 120,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
    },
    logoutButton: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F44336',
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#F44336',
        fontWeight: 'bold',
    },
});

export default DashboardScreen;
