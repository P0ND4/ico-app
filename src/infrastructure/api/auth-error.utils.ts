import axios from 'axios';
import { RETRY_MESSAGE } from '../../shared/messages';

export type LinkProvider = 'google' | 'apple';

export interface ParsedApiError {
  status?: number;
  message: string;
}

function readMessage(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string').join(', ');
  return '';
}

/** Normalizes axios, RTK unwrap(), and rejectWithValue payloads. */
export function parseApiError(err: unknown): ParsedApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[]; statusCode?: number } | undefined;
    const status = err.response?.status ?? data?.statusCode;
    const message =
      readMessage(data?.message) ||
      err.message ||
      `Error del servidor (${err.response?.status ?? 'desconocido'})`;
    return status !== undefined ? { status, message } : { message };
  }

  if (typeof err === 'object' && err !== null) {
    const e = err as {
      status?: number;
      statusCode?: number;
      message?: string | string[];
    };
    const status = e.status ?? e.statusCode;
    const message = readMessage(e.message);
    if (status !== undefined || message) {
      const resolvedMessage =
        message || (status !== undefined ? `Error del servidor (${status})` : 'Error desconocido');
      return status !== undefined ? { status, message: resolvedMessage } : { message: resolvedMessage };
    }
  }

  if (err instanceof Error && err.message) {
    const statusMatch = /status code (\d{3})/i.exec(err.message);
    const status = statusMatch ? Number(statusMatch[1]) : undefined;
    return status !== undefined ? { status, message: err.message } : { message: err.message };
  }

  return { message: 'Error desconocido' };
}

export function isProviderAlreadyLinkedError(err: unknown): boolean {
  const parsed = parseApiError(err);
  if (parsed.status === 409) return true;
  return parsed.message.includes('provider_already_linked');
}

export function getLinkAccountErrorMessage(err: unknown, provider: LinkProvider): string {
  const providerLabel = provider === 'google' ? 'Google' : 'Apple';

  if (isProviderAlreadyLinkedError(err)) {
    return (
      `Esta cuenta de ${providerLabel} ya está vinculada a otra cuenta en Ico.\n\n` +
      `Para acceder a ella, cierra sesión e inicia con ${providerLabel}. ` +
      `El progreso de tu cuenta invitado no se puede fusionar automáticamente.`
    );
  }

  const parsed = parseApiError(err);
  if (parsed.message && parsed.message !== 'Error desconocido') {
    if (parsed.message.includes('No ID token')) {
      return 'No se recibió token de Google. Verifica EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID y el plugin de Google Sign-In en app.config.';
    }
    if (parsed.status === 401) {
      return 'Google rechazó el token. Verifica que GOOGLE_CLIENT_ID del backend coincida con el web client ID de la app.';
    }
    return parsed.message;
  }

  return `No se pudo vincular la cuenta de ${providerLabel}. ${RETRY_MESSAGE}`;
}

export function getAuthErrorMessage(err: unknown): string {
  const parsed = parseApiError(err);

  if (!parsed.status && parsed.message.includes('Network Error')) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo y la URL de API en .env.';
  }

  if (parsed.status === 401) {
    return 'Google rechazó el token. Verifica que GOOGLE_CLIENT_ID del backend coincida con el web client ID de la app.';
  }

  if (parsed.message && parsed.message !== 'Error desconocido') {
    if (parsed.message.includes('No ID token')) {
      return 'No se recibió token de Google. Verifica EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID y el plugin de Google Sign-In en app.config.';
    }
    return parsed.message;
  }

  return `No se pudo iniciar sesión con Google. ${RETRY_MESSAGE}`;
}

export function getDeleteAccountErrorMessage(err: unknown, isGuest: boolean): string {
  const parsed = parseApiError(err);

  if (parsed.status === 403) {
    return isGuest
      ? 'No se pudieron borrar tus datos de invitado. Inténtalo de nuevo más tarde.'
      : 'No tienes permiso para eliminar esta cuenta.';
  }

  if (parsed.message && parsed.message !== 'Error desconocido' && !parsed.message.match(/status code \d{3}/i)) {
    return parsed.message;
  }

  return isGuest
    ? `No se pudieron borrar tus datos de invitado. ${RETRY_MESSAGE}`
    : `No se pudo eliminar la cuenta. ${RETRY_MESSAGE}`;
}
