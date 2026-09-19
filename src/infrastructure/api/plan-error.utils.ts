import { Alert } from "react-native";
import axios from "axios";
import { router } from "expo-router";
import { openPaywallModal } from "../../application/slices/paywall.slice";
import { selectIsVip } from "../../application/selectors/user.selectors";
import { getStoreRef } from "./store-ref";

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string') return data.message;
  }
  if (err instanceof Error) return err.message;
  return '';
}

export function isTrialExhaustedError(err: unknown): boolean {
  const msg = getErrorMessage(err);
  return msg.includes('trial_exhausted');
}

export function isTrialTutorExhaustedError(err: unknown): boolean {
  return getErrorMessage(err).includes('trial_tutor_exhausted');
}

export function isTrialSummaryExhaustedError(err: unknown): boolean {
  return getErrorMessage(err).includes('trial_summary_exhausted');
}

export function isTrialStandardPathExhaustedError(err: unknown): boolean {
  return getErrorMessage(err).includes('trial_standard_path_exhausted');
}

export function isTrialDeepPathExhaustedError(err: unknown): boolean {
  return getErrorMessage(err).includes('trial_deep_path_exhausted');
}

export function isPlanLimitError(err: unknown): boolean {
  const msg = getErrorMessage(err);
  return (
    msg.includes('trial_exhausted') ||
    msg.includes('trial_tutor_exhausted') ||
    msg.includes('trial_summary_exhausted') ||
    msg.includes('trial_standard_path_exhausted') ||
    msg.includes('trial_deep_path_exhausted') ||
    msg.includes('does not allow this action')
  );
}

export function showPaywallModal(featureBlocked?: string): void {
  const store = getStoreRef();
  if (store) {
    if (selectIsVip(store.getState())) {
      Alert.alert(
        'Acceso VIP',
        'Como usuario VIP tienes acceso completo sin restricciones.',
      );
      return;
    }
    store.dispatch(openPaywallModal(featureBlocked ? { featureBlocked } : undefined));
    return;
  }
  router.push("/(shared)/paywall");
}

type PremiumAlertReason =
  | 'device_blocked'
  | 'tutor_quota'
  | 'summary_quota'
  | 'standard_path_quota'
  | 'deep_path_quota'
  | 'plan';

export interface PremiumFeatureAlertOptions {
  reason?: PremiumAlertReason;
  tutorLimit?: number | null | undefined;
  summaryLimit?: number | null | undefined;
  standardPathLimit?: number | null | undefined;
  deepPathLimit?: number | null | undefined;
}

function resolveFeatureBlocked(
  featureLabel: string,
  reasonOrOptions: PremiumAlertReason | PremiumFeatureAlertOptions = 'plan',
): string {
  const options: PremiumFeatureAlertOptions =
    typeof reasonOrOptions === 'string' ? { reason: reasonOrOptions } : reasonOrOptions;
  const reason = options.reason ?? 'plan';

  if (reason === 'device_blocked') {
    return 'El acceso gratuito en este dispositivo';
  }
  if (reason === 'tutor_quota') {
    return 'El tutor con IA';
  }
  if (reason === 'summary_quota') {
    return 'Los resúmenes inteligentes';
  }
  if (reason === 'standard_path_quota') {
    return 'Las rutas estándar';
  }
  if (reason === 'deep_path_quota') {
    return 'Las rutas profundas';
  }
  return featureLabel;
}

export function showPremiumFeatureAlert(
  featureLabel: string,
  reasonOrOptions: PremiumAlertReason | PremiumFeatureAlertOptions = 'plan',
): void {
  showPaywallModal(resolveFeatureBlocked(featureLabel, reasonOrOptions));
}

export function showPlanLimitAlert(
  err: unknown,
  featureLabel?: string,
  _limits?: { tutorLimit?: number | null; summaryLimit?: number | null },
): void {
  if (isTrialExhaustedError(err)) {
    showPaywallModal('El acceso gratuito en este dispositivo');
    return;
  }
  if (isTrialTutorExhaustedError(err)) {
    showPaywallModal('El tutor con IA');
    return;
  }
  if (isTrialSummaryExhaustedError(err)) {
    showPaywallModal('Los resúmenes inteligentes');
    return;
  }
  if (isTrialStandardPathExhaustedError(err)) {
    showPaywallModal('Las rutas estándar');
    return;
  }
  if (isTrialDeepPathExhaustedError(err)) {
    showPaywallModal('Las rutas profundas');
    return;
  }
  if (isPlanLimitError(err)) {
    showPaywallModal(featureLabel ?? 'Esta función');
  }
}
