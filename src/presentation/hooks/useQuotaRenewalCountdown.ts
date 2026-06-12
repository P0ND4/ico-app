import { useEffect, useMemo, useState } from "react";
import { formatQuotaRenewalCountdown } from "../utils/quota-renewal.utils";

/** Actualiza el texto de countdown cada minuto (cada 10s si falta menos de 1h). */
export function useQuotaRenewalCountdown(
  renewsAt: string | null | undefined,
): string | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!renewsAt) return undefined;

    const target = new Date(renewsAt);
    if (Number.isNaN(target.getTime())) return undefined;

    const tick = () => setNow(new Date());
    const diffMs = target.getTime() - Date.now();
    const intervalMs = diffMs > 0 && diffMs < 60 * 60 * 1000 ? 10_000 : 60_000;

    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [renewsAt]);

  return useMemo(
    () => formatQuotaRenewalCountdown(renewsAt, now),
    [renewsAt, now],
  );
}
