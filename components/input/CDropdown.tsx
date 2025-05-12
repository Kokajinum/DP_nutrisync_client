import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _400Regular, _500Medium, _600SemiBold } from "@/constants/Global";

export interface CDropdownProps {
  label: string;
  icon: React.ReactElement;
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  style?: StyleProp<ViewStyle>;
}

const CDropdown: React.FC<CDropdownProps> = ({
  label,
  icon,
  options,
  selectedValue,
  onValueChange,
  error,
  isRequired = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const borderColor = useThemeColor({}, "outline");
  const errorColor = useThemeColor({}, "error");
  const iconColor = useThemeColor({}, "primary");
  const modalBackgroundColor = useThemeColor({}, "surfaceContainer");
  const modalOverlayColor = useThemeColor({}, "scrim");
  const selectedItemColor = useThemeColor({}, "primaryContainer");
  const selectedTextColor = useThemeColor({}, "onPrimaryContainer");

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={styles.labelRow}>
        {React.cloneElement(icon, { size: 20, color: iconColor })}
        <Text style={[styles.label, { color: textColor }]}>
          {label}
          {isRequired && <Text style={[styles.required, { color: errorColor }]}>*</Text>}
        </Text>
      </View>

      <Pressable
        style={[styles.dropdownButton, { borderColor }]}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.selectedText, { color: textColor }]}>
          {selectedOption?.label || "Select..."}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={iconColor} />
      </Pressable>

      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor + "80" }]}>
          <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && [
                      styles.selectedOption,
                      { backgroundColor: selectedItemColor },
                    ],
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: textColor },
                      selectedValue === item.value && { color: selectedTextColor },
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              style={[styles.closeButton, { borderColor }]}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButtonText, { color: textColor }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: _500Medium,
  },
  required: {
    marginLeft: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingTop: 4,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: _400Regular,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: _400Regular,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: _600SemiBold,
    marginBottom: 16,
    textAlign: "center",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedOption: {},
  optionText: {
    fontSize: 16,
    fontFamily: _400Regular,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: _500Medium,
  },
});

export default CDropdown;
