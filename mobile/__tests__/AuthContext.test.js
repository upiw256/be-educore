import React, { useContext } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../src/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import api from '../src/services/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../src/services/api', () => ({
  post: jest.fn(),
}));

import { Text } from 'react-native';

const TestComponent = () => {
  const { login, logout, userToken, userInfo } = useContext(AuthContext);
  return (
    <>
      <Text>Token: {userToken || 'NONE'}</Text>
      <Text>User: {userInfo?.username || 'NONE'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads user data from SecureStore on mount', async () => {
    SecureStore.getItemAsync
      .mockResolvedValueOnce('stored-token')
      .mockResolvedValueOnce(JSON.stringify({ username: 'storeduser' }));

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Token: stored-token')).toBeTruthy();
      expect(getByText('User: storeduser')).toBeTruthy();
    });
  });

  it('successful login updates state and SecureStore', async () => {
    SecureStore.getItemAsync.mockResolvedValue(null); // initial empty
    api.post.mockResolvedValue({
      data: { data: { token: 'new-token', user: { username: 'newuser' } } }
    });

    let contextValues;
    const Asserter = () => {
      contextValues = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <Asserter />
      </AuthProvider>
    );

    await act(async () => {
      await contextValues.login('newuser', 'pass');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'newuser', password: 'pass' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'new-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userInfo', JSON.stringify({ username: 'newuser' }));
    expect(contextValues.userToken).toBe('new-token');
  });

  it('logout removes state and clears SecureStore', async () => {
    SecureStore.getItemAsync
      .mockResolvedValueOnce('temp-token')
      .mockResolvedValueOnce(JSON.stringify({ username: 'tempuser' }));

    let contextValues;
    const Asserter = () => {
      contextValues = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <Asserter />
      </AuthProvider>
    );

    await waitFor(() => expect(contextValues.userToken).toBe('temp-token'));

    await act(async () => {
      await contextValues.logout();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userInfo');
    expect(contextValues.userToken).toBeNull();
  });
});
