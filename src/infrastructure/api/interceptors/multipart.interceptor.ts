import type { AxiosInstance } from 'axios';

/** Let the runtime set multipart boundary — required for RN FormData uploads. */
export function applyMultipartInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      if (config.headers) {
        config.headers.delete('Content-Type');
      }
    }
    return config;
  });
}
