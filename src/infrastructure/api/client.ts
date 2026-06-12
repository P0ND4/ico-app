import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL } from '../../config/environment/api.config';
import { applyAuthInterceptor } from './interceptors/auth.interceptor';
import { applyMultipartInterceptor } from './interceptors/multipart.interceptor';
import { applyResponseInterceptor } from './interceptors/response.interceptor';
import { applyRefreshInterceptor } from './interceptors/refresh.interceptor';

export { setStoreRef, getStoreRef } from './store-ref';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

applyAuthInterceptor(apiClient);
applyMultipartInterceptor(apiClient);
applyResponseInterceptor(apiClient);
applyRefreshInterceptor(apiClient);

export default apiClient;
