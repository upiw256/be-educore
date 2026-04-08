import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import DashboardScreen from '../src/screens/DashboardScreen';
import { AuthContext } from '../src/context/AuthContext';
import * as api from '../src/services/api';

// Mock the API calls
jest.mock('../src/services/api', () => ({
  getIzins: jest.fn(),
  getLateRecords: jest.fn(),
  getPelanggarans: jest.fn(),
  getPengumuman: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };
const mockLogout = jest.fn();

const mockUserInfo = {
  username: 'testuser',
  role: 'admin',
  teacher_name: 'Budi Santoso'
};

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={{ userInfo: mockUserInfo, logout: mockLogout }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('DashboardScreen - Responsive & Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API Mocks
    api.getIzins.mockResolvedValue({ data: { data: [{ student_id: '1' }] } });
    api.getLateRecords.mockResolvedValue({ data: { data: [{ nipd: '101' }] } });
    api.getPelanggarans.mockResolvedValue({ data: { data: [{}, {}] } });
    api.getPengumuman.mockResolvedValue({ data: { data: [{ _id: '1', title: 'Libur', isActive: true }] } });
  });

  // Helper function to mock viewport
  const setViewport = (width, height) => {
    Dimensions.get = jest.fn().mockReturnValue({ width, height, scale: 1, fontScale: 1 });
  };

  it('renders correctly on small mobile screens (width: 320px)', async () => {
    setViewport(320, 568); // iPhone SE size
    
    const { getByText } = renderWithContext(<DashboardScreen navigation={mockNavigation} />);
    
    // Check if greeting is rendered
    expect(getByText('Selamat datang,')).toBeTruthy();
    expect(getByText('Budi Santoso')).toBeTruthy();
    expect(getByText('ADMIN')).toBeTruthy();
    
    await waitFor(() => {
      // Check if stats are loaded
      expect(getByText('Siswa Izin')).toBeTruthy();
    });
  });

  it('renders correctly on tablet screens (width: 768px)', async () => {
    setViewport(768, 1024); // iPad size
    
    const { getByText } = renderWithContext(<DashboardScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByText('Siswa Telat')).toBeTruthy();
    });
  });

  it('navigates to Students screen when Data Siswa menu is clicked', async () => {
    const { getByText } = renderWithContext(<DashboardScreen navigation={mockNavigation} />);
    
    const menuSiswa = getByText('Data Siswa');
    fireEvent.press(menuSiswa);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Students');
  });

  it('calls logout function when Keluar button is pressed', async () => {
    const { getByText } = renderWithContext(<DashboardScreen navigation={mockNavigation} />);
    
    const logoutBtn = getByText('Keluar');
    fireEvent.press(logoutBtn);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});
