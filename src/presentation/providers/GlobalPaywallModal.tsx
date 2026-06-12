import React from 'react';
import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import { closePaywallModal } from '../../application/slices/paywall.slice';
import PaywallModal from '../screens/shared/PaywallModal';

const GlobalPaywallModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.paywall.visible);
  const featureBlocked = useAppSelector((state) => state.paywall.featureBlocked);

  return (
    <PaywallModal
      visible={visible}
      onClose={() => dispatch(closePaywallModal())}
      {...(featureBlocked ? { featureBlocked } : {})}
    />
  );
};

export default GlobalPaywallModal;
