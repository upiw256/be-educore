import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ScheduleScreen from '../src/screens/ScheduleScreen';
import api from '../src/services/api';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  getSchedules: jest.fn(),
}));

const renderWithAuth = (component) => render(
  <AuthContext.Provider value={{ userInfo: { role: 'admin' } }}>
    {component}
  </AuthContext.Provider>
);

describe('ScheduleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches schedules', async () => {
    api.getSchedules.mockResolvedValue({ 
      data: { data: [{ _id: '1', class: '10A', subject: 'Math', teacher_name: 'Mr. Budi', day: 'Senin', time: '08:00' }] } 
    });

    const { getByText } = renderWithAuth(<ScheduleScreen />);

    await waitFor(() => {
      expect(api.getSchedules).toHaveBeenCalled();
      expect(getByText('📅 Jadwal Pelajaran')).toBeTruthy();
      expect(getByText('Math')).toBeTruthy();
    });
  });
});
