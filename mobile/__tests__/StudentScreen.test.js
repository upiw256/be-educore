import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import StudentScreen from '../src/screens/StudentScreen';
import api from '../src/services/api';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  getStudents: jest.fn(),
}));

const renderWithAuth = (component) => render(
  <AuthContext.Provider value={{ userInfo: { role: 'admin' } }}>
    {component}
  </AuthContext.Provider>
);

describe('StudentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches students', async () => {
    api.getStudents.mockResolvedValue({ 
      data: { data: [{ _id: '1', nama: 'Andi', nipd: '123', nama_rombel: '10A' }] } 
    });

    const { getByText } = renderWithAuth(<StudentScreen />);

    await waitFor(() => {
      expect(api.getStudents).toHaveBeenCalled();
      expect(getByText('🎓 Data Siswa')).toBeTruthy();
      expect(getByText('Andi')).toBeTruthy();
    });
  });
});
