import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

let isColdStart = true;

/**
 * Tracks whether the app left foreground (background/inactive) or just launched.
 * Used by Tutor to decide between keeping the active conversation or starting fresh.
 */
export function useAppSessionContinuity() {
  const needsFreshTutorSessionRef = useRef(isColdStart);
  const handledRef = useRef(false);

  useEffect(() => {
    isColdStart = false;

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        needsFreshTutorSessionRef.current = true;
        handledRef.current = false;
      }
    });

    return () => subscription.remove();
  }, []);

  const shouldResetTutorSession = useCallback(() => {
    if (handledRef.current) return false;
    if (!needsFreshTutorSessionRef.current) return false;
    return true;
  }, []);

  const markTutorSessionHandled = useCallback(() => {
    handledRef.current = true;
    needsFreshTutorSessionRef.current = false;
  }, []);

  return { shouldResetTutorSession, markTutorSessionHandled };
}
