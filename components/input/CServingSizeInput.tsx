import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _400Regular, _500Medium, _600SemiBold } from "@/constants/Global";
import { ThemedText } from "../ThemedText";

export interface CServingSizeInputProps {
  value: string;
  unit: "g" | "ml";
  onChangeText: (text: string) => void;
  onUnitChange: (unit: "g" | "ml") => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

const CServingSizeInput: React.FC<CServingSizeInputProps> = ({
  value,
  unit,
  label = "Serving Size",
  onChangeText,
  onUnitChange,
  placeholder = "100",
  isRequired = false,
  error,
  style,
}) => {
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const unitOptions = [
    { label: "Grams", value: "g" },
    { label: "Milliliters", value: "ml" },
  ];

  // Theme colors
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const placeholderColor = useThemeColor({}, "outline");
  const borderColor = useThemeColor({}, "outline");
  const errorColor = useThemeColor({}, "error");
  const iconColor = useThemeColor({}, "primary");
  const modalBackgroundColor = useThemeColor({}, "surfaceContainer");
  const modalOverlayColor = useThemeColor({}, "scrim");
  const selectedItemColor = useThemeColor({}, "primaryContainer");
  const selectedTextColor = useThemeColor({}, "onPrimaryContainer");

  const handleUnitSelect = (selectedUnit: "g" | "ml") => {
    onUnitChange(selectedUnit);
    setUnitModalVisible(false);
  };

  const handleChangeText = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericText = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericText.split(".");
    const formattedText = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : numericText;
    onChangeText(formattedText);
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={styles.labelRow}>
        <MaterialCommunityIcons name="food-variant" size={20} color={iconColor} />
        <ThemedText style={[styles.label /*{ color: textColor }*/]}>
          {label}
          {isRequired && <Text style={[styles.required, { color: errorColor }]}>*</Text>}
        </ThemedText>
      </View>

      <View style={[styles.inputRow, { borderColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
        />

        <Pressable onPress={() => setUnitModalVisible(true)} style={styles.unitSelector}>
          <Text style={[styles.unitText, { color: textColor }]}>{unit}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color={iconColor} />
        </Pressable>
      </View>

      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}

      {/* Unit Selection Modal */}
      <Modal
        visible={unitModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUnitModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor + "80" }]}>
          <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Unit</Text>

            {unitOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionItem,
                  unit === option.value && [
                    styles.selectedOption,
                    { backgroundColor: selectedItemColor },
                  ],
                ]}
                onPress={() => handleUnitSelect(option.value as "g" | "ml")}>
                <Text
                  style={[
                    styles.optionText,
                    { color: textColor },
                    unit === option.value && { color: selectedTextColor },
                  ]}>
                  {option.label} ({option.value})
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={[styles.closeButton, { borderColor }]}
              onPress={() => setUnitModalVisible(false)}>
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
    //fontSize: 16,
    //fontFamily: _500Medium,
  },
  required: {
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: _400Regular,
    padding: 0,
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unitText: {
    fontSize: 16,
    fontFamily: _500Medium,
    marginRight: 2,
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
    width: "80%",
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

export default CServingSizeInput;
