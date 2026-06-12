import type { AxiosInstance } from 'axios';

export function applyResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use((response) => {
    // Unwrap the { success, data, message, statusCode } envelope
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  });
}
