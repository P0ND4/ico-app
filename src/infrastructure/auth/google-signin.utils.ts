const GOOGLE_DEVELOPER_ERROR_CODE = '10';
const ANDROID_PACKAGE_NAME = 'com.lmacml.ico';

export function isGoogleDeveloperError(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    if (code === GOOGLE_DEVELOPER_ERROR_CODE || code === 'DEVELOPER_ERROR') {
      return true;
    }
  }
  if (err instanceof Error) {
    return err.message.includes('DEVELOPER_ERROR');
  }
  return false;
}

export function getGoogleDeveloperErrorMessage(): string {
  return [
    'Google Sign-In no está configurado para este build de Android.',
    '',
    'En Google Cloud Console → Credenciales:',
    `1. Crea un cliente OAuth "Android" con paquete ${ANDROID_PACKAGE_NAME}.`,
    '2. Agrega la huella SHA-1 (en ico-app: pnpm android:sha1; keystore: android/app/debug.keystore).',
    '3. Usa el cliente OAuth "Web" en EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    '4. El mismo Web client ID debe estar en GOOGLE_CLIENT_ID del backend.',
    '',
    'Los cambios en Google Cloud pueden tardar unos minutos en aplicarse.',
  ].join('\n');
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // Google Sign-In no disponible o sin sesión activa
  }
}

export function configureGoogleSignIn(GoogleSignin: {
  configure: (options: { webClientId: string; offlineAccess: boolean }) => void;
}): boolean {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    console.warn('[auth] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no está definido en .env');
    return false;
  }
  try {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
    return true;
  } catch (e) {
    console.warn('[auth] GoogleSignin.configure falló:', e);
    return false;
  }
}
