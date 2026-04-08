import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PelanggaranScreen from '../src/screens/PelanggaranScreen';
import api from '../src/services/api';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  getPelanggarans: jest.fn(),
}));

const renderWithAuth = (component) => render(
  <AuthContext.Provider value={{ userInfo: { role: 'admin' } }}>
    {component}
  </AuthContext.Provider>
);

describe('PelanggaranScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches data', async () => {
    api.getPelanggarans.mockResolvedValue({ data: { data: [] } });

    const { getByText } = renderWithAuth(<PelanggaranScreen />);

    await waitFor(() => {
      expect(api.getPelanggarans).toHaveBeenCalled();
      expect(getByText('⚠️ Data Pelanggaran')).toBeTruthy();
    });
  });
});
