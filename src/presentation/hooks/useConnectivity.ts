import { useAppSelector } from '../../application/store/hooks';
import { selectIsOnline } from '../../application/selectors/connectivity.selectors';

export function useConnectivity(): boolean {
  return useAppSelector(selectIsOnline);
}
