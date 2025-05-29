import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
  TextInputProps,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { _500Medium } from "@/constants/Global";

interface CSearchInputProps extends Omit<TextInputProps, "placeholder" | "onChangeText" | "value"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onSubmitEditing?: () => void;
  debounceTime?: number;
}

const CSearchInput: React.FC<CSearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  containerStyle,
  inputStyle,
  onSubmitEditing,
  debounceTime = 500,
  ...textInputProps
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "onSurface");
  const placeholderColor = useThemeColor({}, "onSurfaceVariant");
  const iconColor = useThemeColor({}, "onBackground");
  const borderColor = useThemeColor({}, "outline");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      onChangeText(text);
    }, debounceTime);

    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleClear = () => {
    setLocalValue("");
    onChangeText("");
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={[styles.container, { backgroundColor, borderColor }]}>
        <MaterialIcons name="search" size={20} color={iconColor} style={styles.searchIcon} />

        <TextInput
          {...textInputProps}
          style={[styles.textInput, { color: textColor }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onChangeText={handleChangeText}
          value={localValue}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
        />

        {localValue.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <MaterialIcons name="clear" size={20} color={iconColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default CSearchInput;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
    fontFamily: _500Medium,
  },
  clearButton: {
    padding: 4,
  },
});
