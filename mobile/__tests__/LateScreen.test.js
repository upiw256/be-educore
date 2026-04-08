import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LateScreen from '../src/screens/LateScreen';
import api from '../src/services/api';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  getLateRecords: jest.fn(),
}));

const renderWithAuth = (component) => render(
  <AuthContext.Provider value={{ userInfo: { role: 'admin' } }}>
    {component}
  </AuthContext.Provider>
);

describe('LateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches data', async () => {
    api.getLateRecords.mockResolvedValue({ data: { data: [] } });

    const { getByText } = renderWithAuth(<LateScreen />);

    await waitFor(() => {
      expect(api.getLateRecords).toHaveBeenCalled();
      expect(getByText('⏰ Rekap Keterlambatan')).toBeTruthy();
    });
  });
});
