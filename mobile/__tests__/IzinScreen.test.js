import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import IzinScreen from '../src/screens/IzinScreen';
import api from '../src/services/api';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  getIzins: jest.fn(),
}));

const renderWithAuth = (component) => render(
  <AuthContext.Provider value={{ userInfo: { role: 'admin' } }}>
    {component}
  </AuthContext.Provider>
);

describe('IzinScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches data', async () => {
    api.getIzins.mockResolvedValue({ data: { data: [] } });

    const { getByText } = renderWithAuth(<IzinScreen />);

    // Wait for the data fetch hook
    await waitFor(() => {
      expect(api.getIzins).toHaveBeenCalled();
      expect(getByText('📋 Rekap Izin Siswa')).toBeTruthy();
      expect(getByText('Belum ada data izin')).toBeTruthy();
    });
  });
});
