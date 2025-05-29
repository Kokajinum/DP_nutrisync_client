import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardTypeOptions,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _400Regular, _500Medium } from "@/constants/Global";

export interface CFoodAttributeInputProps {
  icon: React.ReactElement;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  isNumeric?: boolean;
  unit?: string;
  placeholder?: string;
  maxLength?: number;
  isRequired?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

const CFoodAttributeInput: React.FC<CFoodAttributeInputProps> = ({
  icon,
  label,
  value,
  onChangeText,
  keyboardType = "default",
  isNumeric = false,
  unit,
  placeholder = "",
  maxLength,
  isRequired = false,
  error,
  style,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const placeholderColor = useThemeColor({}, "outline");
  const borderColor = useThemeColor({}, "outline");
  const errorColor = useThemeColor({}, "error");
  const iconColor = useThemeColor({}, "primary");

  const handleChangeText = (text: string) => {
    if (isNumeric) {
      // Allow only numbers and a single decimal point
      const numericText = text.replace(/[^0-9.]/g, "");
      // Ensure only one decimal point
      const parts = numericText.split(".");
      const formattedText =
        parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : numericText;
      onChangeText(formattedText);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={styles.labelRow}>
        {React.cloneElement(icon, { size: 20, color: iconColor })}
        <Text style={[styles.label, { color: textColor }]}>
          {label}
          {isRequired && <Text style={[styles.required, { color: errorColor }]}>*</Text>}
        </Text>
      </View>
      <View style={[styles.inputRow, { borderColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          maxLength={maxLength}
        />
        {unit && <Text style={[styles.unit, { color: textColor }]}>{unit}</Text>}
      </View>
      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
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
  unit: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: _400Regular,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: _400Regular,
  },
});

export default CFoodAttributeInput;
