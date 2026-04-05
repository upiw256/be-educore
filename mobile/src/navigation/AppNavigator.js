import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IzinScreen from '../screens/IzinScreen';
import LateScreen from '../screens/LateScreen';
import PelanggaranScreen from '../screens/PelanggaranScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import StudentScreen from '../screens/StudentScreen';

const Stack = createNativeStackNavigator();

const HEADER_STYLE = {
  backgroundColor: '#0D47A1',
  elevation: 0,
  shadowOpacity: 0,
};
const HEADER_TITLE_STYLE = {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 17,
};

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D47A1' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Izin"
              component={IzinScreen}
              options={{ title: 'Izin Siswa', headerStyle: HEADER_STYLE, headerTitleStyle: HEADER_TITLE_STYLE, headerTintColor: '#fff' }}
            />
            <Stack.Screen
              name="Late"
              component={LateScreen}
              options={{ title: 'Presensi Terlambat', headerStyle: { ...HEADER_STYLE, backgroundColor: '#E65100' }, headerTitleStyle: HEADER_TITLE_STYLE, headerTintColor: '#fff' }}
            />
            <Stack.Screen
              name="Pelanggaran"
              component={PelanggaranScreen}
              options={{ title: 'Data Pelanggaran', headerStyle: { ...HEADER_STYLE, backgroundColor: '#B71C1C' }, headerTitleStyle: HEADER_TITLE_STYLE, headerTintColor: '#fff' }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{ title: 'Jadwal Pelajaran', headerStyle: { ...HEADER_STYLE, backgroundColor: '#1A237E' }, headerTitleStyle: HEADER_TITLE_STYLE, headerTintColor: '#fff' }}
            />
            <Stack.Screen
              name="Students"
              component={StudentScreen}
              options={{ title: 'Data Siswa', headerStyle: { ...HEADER_STYLE, backgroundColor: '#00695C' }, headerTitleStyle: HEADER_TITLE_STYLE, headerTintColor: '#fff' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
