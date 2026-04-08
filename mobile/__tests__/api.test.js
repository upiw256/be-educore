import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Mock axios so that interceptor functions are isolated from the fetch adapter
jest.mock('axios', () => {
  const mockCreate = jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), handlers: [] },
      response: { use: jest.fn(), handlers: [] },
    },
    get: jest.fn(),
    post: jest.fn(),
  }));
  return { create: mockCreate };
});

import api, { getStudents, createIzin } from '../src/services/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

describe('API Services', () => {
  let requestInterceptorFulfilled;

  beforeAll(() => {
    // Capture the interceptor function before any jest.clearAllMocks() is called
    requestInterceptorFulfilled = api.interceptors.request.use.mock.calls[0][0];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds Authorization token to the request when token is present', async () => {
    SecureStore.getItemAsync.mockResolvedValue('fake-jwt-token');
    
    const config = { headers: {}, method: 'get', url: '/test' };
    
    const resolvedConfig = await requestInterceptorFulfilled(config);
    
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
    expect(resolvedConfig.headers.Authorization).toBe('Bearer fake-jwt-token');
  });

  it('handles scenario when token is absent', async () => {
    SecureStore.getItemAsync.mockResolvedValue(null);

    const config = { headers: {}, method: 'get', url: '/test' };
    
    const resolvedConfig = await requestInterceptorFulfilled(config);
    
    expect(resolvedConfig.headers.Authorization).toBeUndefined();
  });
});
