import { parseApiError } from './auth-error.utils';
import { RETRY_MESSAGE } from '../../shared/messages';

/**
 * Domain error codes emitted by the coupon context. Matched before the HTTP
 * status so a backend rename of a status still yields the right copy.
 */
const DOMAIN_ERROR_MESSAGES: { code: string; message: string }[] = [
  {
    code: 'coupon_requires_linked_account',
    message:
      'Necesitas vincular tu cuenta con Google o Apple para canjear cupones. Hazlo desde tu perfil y vuelve a intentarlo.',
  },
  {
    code: 'coupon_already_redeemed',
    message: 'Ya canjeaste este cupón. Cada cupón se puede usar una sola vez por cuenta.',
  },
  {
    code: 'coupon_exhausted',
    message: 'Este cupón ya alcanzó su límite de canjes. Revisa si tienes otro código disponible.',
  },
  {
    code: 'coupon_expired',
    message: 'Este cupón ya venció y no se puede canjear.',
  },
  {
    code: 'coupon_not_found',
    message: 'No encontramos ese cupón. Revisa el código e inténtalo de nuevo.',
  },
  {
    code: 'coupon_invalid_config',
    message: `Este cupón tiene un problema de configuración. Escríbenos a soporte para que lo revisemos. ${RETRY_MESSAGE}`,
  },
];

/** True when the failure is the guest/linked-account rejection (HTTP 403). */
export function isCouponRequiresLinkedAccountError(err: unknown): boolean {
  const parsed = parseApiError(err);
  if (parsed.message.includes('coupon_requires_linked_account')) return true;
  return parsed.status === 403;
}

/** User-facing message for a failed redemption, by domain code first, HTTP status as fallback. */
export function getRedeemCouponErrorMessage(err: unknown): string {
  const parsed = parseApiError(err);
  const raw = parsed.message;

  const byCode = DOMAIN_ERROR_MESSAGES.find((entry) => raw.includes(entry.code));
  if (byCode) return byCode.message;

  switch (parsed.status) {
    case 400:
      return 'El código no es válido. Revisa que lo hayas escrito completo y sin espacios.';
    case 403:
      return 'Necesitas vincular tu cuenta con Google o Apple para canjear cupones. Hazlo desde tu perfil y vuelve a intentarlo.';
    case 404:
      return 'No encontramos ese cupón. Revisa el código e inténtalo de nuevo.';
    case 409:
      return 'Este cupón ya no está disponible: puede que ya lo hayas canjeado o que se haya agotado.';
    case 410:
      return 'Este cupón ya venció y no se puede canjear.';
    case 429:
      return 'Hiciste demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.';
    default:
      break;
  }

  if (!parsed.status && raw.includes('Network Error')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (raw && raw !== 'Error desconocido' && !/status code \d{3}/i.test(raw)) {
    return raw;
  }

  return `No se pudo canjear el cupón. ${RETRY_MESSAGE}`;
}

/** User-facing message for a failed history fetch. */
export function getCouponHistoryErrorMessage(err: unknown): string {
  const parsed = parseApiError(err);

  if (!parsed.status && parsed.message.includes('Network Error')) {
    return 'No se pudo cargar tu historial. Revisa tu conexión e inténtalo de nuevo.';
  }

  return `No se pudo cargar tu historial de cupones. ${RETRY_MESSAGE}`;
}
