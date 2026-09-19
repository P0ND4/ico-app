import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAppDispatch } from '../../../application/store/hooks';
import {
  loginWithGoogle,
  loginWithApple,
  loginAsGuest,
} from '../../../application/thunks/auth.thunks';
import AppButton from '../../components/ui/buttons/AppButton';
import AppText from '../../components/ui/typography/AppText';
import { getAuthErrorMessage } from '../../../infrastructure/api/auth-error.utils';
import {
  configureGoogleSignIn,
  getGoogleDeveloperErrorMessage,
  isGoogleDeveloperError,
} from '../../../infrastructure/auth/google-signin.utils';
import { API_BASE_URL } from '../../../config/environment/api.config';
import { RETRY_MESSAGE } from '../../../shared/messages';

let GoogleSignin: any = null;
let isErrorWithCode: (e: unknown) => e is { code: string } = (_e): _e is { code: string } => false;
let statusCodes: Record<string, string> = {};
try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  isErrorWithCode = googleSignInModule.isErrorWithCode;
  statusCodes = googleSignInModule.statusCodes;
} catch {
  // Google Sign-In not available in this build configuration
}

export function LoginScreen() {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GoogleSignin) return;
    configureGoogleSignIn(GoogleSignin);
  }, []);

  const handleGoogle = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'No disponible',
        'Google Sign-In requiere un build nativo (npx expo run:ios / run:android). No funciona en Expo Go.',
      );
      return;
    }
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      Alert.alert(
        'Configuración faltante',
        'Define EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en ico-app/.env y reinicia Metro.',
      );
      return;
    }
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      if (signInResult.type === 'cancelled') return;

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        Alert.alert(
          'Error',
          'Google no devolvió un token. Verifica el web client ID y, en iOS, EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME en .env.',
        );
        return;
      }

      await dispatch(loginWithGoogle(idToken)).unwrap();
      router.replace('/(protected)/(tabs)/home');
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) return;

      const detail = isGoogleDeveloperError(err)
        ? getGoogleDeveloperErrorMessage()
        : getAuthErrorMessage(err);
      const hint = isGoogleDeveloperError(err) ? '' : `\n\nAPI: ${API_BASE_URL}`;

      Alert.alert('Error', `${detail}${hint}`);
      console.warn('[auth] Google login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const fullName = credential.fullName?.givenName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      await dispatch(
        loginWithApple({
          identityToken: credential.identityToken!,
          ...(fullName ? { fullName } : {}),
        }),
      ).unwrap();
      router.replace('/(protected)/(tabs)/home');
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', `No se pudo iniciar sesión con Apple. ${RETRY_MESSAGE}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await dispatch(loginAsGuest()).unwrap();
      router.replace('/(protected)/(tabs)/home');
    } catch (err) {
      Alert.alert('Error', getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Logo area */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <AppText variant="title" weight="700" color={theme.textPrimary} align="center">
          I.C.O
        </AppText>
        <AppText variant="paragraph" color={theme.textMuted} align="center">
          Tu tutor de aprendizaje con IA
        </AppText>
      </View>

      {/* Auth buttons */}
      <View style={styles.buttons}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <>
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={styles.appleButton}
                onPress={handleApple}
              />
            )}

            <AppButton
              variant="outline"
              widthFull
              onPress={handleGoogle}
            >
              <AppText variant="paragraph" color={theme.primary} weight="600">
                Continuar con Google
              </AppText>
            </AppButton>

            <TouchableOpacity onPress={handleGuest} style={styles.guestLink}>
              <AppText variant="smallParagraph" color={theme.textMuted} align="center">
                Continuar como invitado
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 48,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 8,
  },
  buttons: {
    gap: 16,
    minHeight: 140,
    justifyContent: 'center',
  },
  appleButton: {
    height: 48,
    width: '100%',
  },
  guestLink: {
    paddingVertical: 8,
    alignSelf: 'center',
  },
});
