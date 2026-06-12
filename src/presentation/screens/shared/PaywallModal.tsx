import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import PaywallContent from "./PaywallContent";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureBlocked?: string;
}

const PaywallModal = ({ visible, onClose, featureBlocked }: PaywallModalProps) => {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          s.container,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={[s.handle, { backgroundColor: theme.border }]} />
        <PaywallContent
          onClose={onClose}
          {...(featureBlocked ? { featureBlocked } : {})}
          showCloseButton
          showPlanLink
        />
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
  },
});

export default PaywallModal;
