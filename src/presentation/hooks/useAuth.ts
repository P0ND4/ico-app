import { useAppSelector, useAppDispatch } from '../../application/store/hooks';
import { selectAuth } from '../../application/selectors/auth.selectors';
import { logout } from '../../application/thunks/auth.thunks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  return {
    ...auth,
    logout: () => dispatch(logout()),
  };
}
