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

    const numValue = parseFloat(formattedText);
    if (!isNaN(numValue)) {
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    let numValue = parseFloat(inputValue);

    if (inputValue === "" || isNaN(numValue)) {
      numValue = min;
      setInputValue(min.toString());
    }

    numValue = parseFloat(numValue.toFixed(2));

    numValue = Math.max(min, Math.min(max, numValue));

    setInputValue(numValue.toString());

    const validationError = validateValue(numValue);
    setError(validationError);

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
