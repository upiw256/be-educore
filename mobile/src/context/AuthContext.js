import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data.data;
      
      setUserToken(token);
      setUserInfo(user);
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
    } catch (e) {
      console.log('Login error: ', e);
      throw e;
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userInfo');
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let user = await SecureStore.getItemAsync('userInfo');
      
      if (token && user) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
      setIsLoading(false);
    } catch (e) {
      console.log('isLoggedIn error: ', e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
