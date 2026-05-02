import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AppText from "../typography/AppText";
import { useThemeColors } from "../../../hooks/useThemeColors";

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const AppSelect: React.FC<AppSelectProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar",
  style,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = useThemeColors();

  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.container, containerStyle, style]}
        onPress={() => setModalVisible(true)}
      >
        <AppText variant="smallParagraph" color={selectedOption ? colors.textPrimary : colors.textMuted} weight="600">
          {selectedOption ? selectedOption.label : placeholder}
        </AppText>
        <FontAwesome5 name="chevron-down" size={12} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} activeOpacity={1} />

          <View
            style={[
              styles.modalContentWrapper,
              { backgroundColor: `${colors.surface}F2`, borderColor: `${colors.border}66` },
            ]}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: `${colors.background}B3` },
              ]}
            />

            <View style={styles.modalHeader}>
              <AppText variant="paragraph" weight="bold" color={colors.textPrimary}>
                Selecciona una opción
              </AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <FontAwesome5 name="times" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && { backgroundColor: `${colors.primary}20` }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <AppText
                      variant="paragraph"
                      color={isSelected ? colors.primary : colors.textPrimary}
                      weight={isSelected ? "bold" : "normal"}
                    >
                      {item.label}
                    </AppText>
                    {isSelected && <FontAwesome5 name="check" size={14} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52, // Match inputBase in RegistrationForm
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dark overlay outside the modal
  },
  modalContentWrapper: {
    width: "85%",
    maxHeight: "60%",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  closeBtn: {
    padding: 4,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
});

export default AppSelect;
