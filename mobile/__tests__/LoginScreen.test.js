import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';
import { AuthContext } from '../src/context/AuthContext';

jest.mock('../src/services/api', () => ({
  // Mock any functions needed
}));

describe('LoginScreen - Logic & Responsive Tests', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android'; // Reset platform to default android
  });

  const renderWithContext = (component) => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        {component}
      </AuthContext.Provider>
    );
  };

  it('renders correctly on Android', () => {
    Platform.OS = 'android';
    const { getByPlaceholderText, getByText } = renderWithContext(<LoginScreen />);
    
    expect(getByPlaceholderText('Masukkan username')).toBeTruthy();
    expect(getByPlaceholderText('Masukkan password')).toBeTruthy();
    expect(getByText('Masuk')).toBeTruthy();
  });

  it('renders correctly on iOS (KeyboardAvoidingView padding behavior)', () => {
    Platform.OS = 'ios';
    const { getByPlaceholderText } = renderWithContext(<LoginScreen />);
    
    expect(getByPlaceholderText('Masukkan username')).toBeTruthy();
  });

  it('shows an alert when username or password is empty', () => {
    const { getByText } = renderWithContext(<LoginScreen />);
    const loginButton = getByText('Masuk');
    
    // Spy on Alert.alert
    const alertSpy = jest.spyOn(global.Alert = require('react-native').Alert, 'alert');
    
    fireEvent.press(loginButton);
    expect(alertSpy).toHaveBeenCalledWith('Perhatian', 'Username dan password harus diisi');
    
    alertSpy.mockRestore();
  });

  it('calls login function successfully with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = renderWithContext(<LoginScreen />);
    
    const inputUsername = getByPlaceholderText('Masukkan username');
    const inputPassword = getByPlaceholderText('Masukkan password');
    const loginButton = getByText('Masuk');
    
    fireEvent.changeText(inputUsername, 'admin');
    fireEvent.changeText(inputPassword, 'secret123');
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'secret123');
    });
  });

  it('toggles password visibility when the eye icon is pressed', () => {
    const { getByPlaceholderText, getByText } = renderWithContext(<LoginScreen />);
    
    const inputPassword = getByPlaceholderText('Masukkan password');
    expect(inputPassword.props.secureTextEntry).toBe(true);
    
    const toggleIcon = getByText('👁️');
    fireEvent.press(toggleIcon);
    
    expect(inputPassword.props.secureTextEntry).toBe(false);
  });
});
