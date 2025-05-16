import React, { useState, useEffect } from "react";
import { View, StyleSheet, StyleProp, ViewStyle, TextInput } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _400Regular, _500Medium } from "@/constants/Global";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { ThemedText } from "@/components/ThemedText";

interface CNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const CNumberInput: React.FC<CNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  style,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const borderColor = useThemeColor({}, "outline");
  const focusedBorderColor = useThemeColor({}, "primary");
  const errorColor = useThemeColor({}, "error");

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateValue = (val: number): string | null => {
    if (isNaN(val)) {
      return t(TranslationKeys.error_invalid_number);
    }

    if (val < min) {
      return t(TranslationKeys.error_range_less, { value: min });
    }

    if (val > max) {
      return t(TranslationKeys.error_range_more, { value: max });
    }

    // Check if the value follows the step pattern
    const remainder = (val - min) % step;
    if (Math.abs(remainder) > 0.0001 && Math.abs(remainder - step) > 0.0001) {
      // Use a generic error message for step validation
      return t(TranslationKeys.error_invalid_number);
    }

    return null;
  };

  const handleChangeText = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericText = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericText.split(".");
    const formattedText = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : numericText;

    setInputValue(formattedText);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Convert to number and validate
    let numValue = parseFloat(inputValue);

    // Handle empty input
    if (inputValue === "" || isNaN(numValue)) {
      numValue = min;
      setInputValue(min.toString());
    }

    // Round to nearest step if needed
    const stepsFromMin = Math.round((numValue - min) / step);
    const roundedValue = min + stepsFromMin * step;
    numValue = parseFloat(roundedValue.toFixed(2)); // Fix floating point precision issues

    // Clamp to min/max
    numValue = Math.max(min, Math.min(max, numValue));

    // Update input value with formatted number
    setInputValue(numValue.toString());

    // Validate and set error
    const validationError = validateValue(numValue);
    setError(validationError);

    // Only update parent if valid
    if (!validationError) {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setError(null);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? errorColor : isFocused ? focusedBorderColor : borderColor,
            backgroundColor,
          },
        ]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={inputValue}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          keyboardType="numeric"
          selectTextOnFocus
        />
      </View>

      {error && <ThemedText style={[styles.errorText, { color: errorColor }]}>{error}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    //fontSize: 14,
    //fontFamily: _500Medium,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: _400Regular,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    fontFamily: _400Regular,
    marginTop: 4,
  },
});

export default CNumberInput;
