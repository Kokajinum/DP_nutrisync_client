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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  withTiming,
} from "react-native-reanimated";
import { _500Medium, _600SemiBold, _700Bold } from "@/constants/Global";

const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

interface CTextInputProps extends Omit<TextInputProps, "placeholder" | "onChangeText" | "value"> {
  value?: string;

  onChangeText?: (text: string) => void;

  placeholder?: string;

  placeholderColor?: string;

  borderColor?: string;

  //barva borderu při focusu
  focusedBorderColor?: string;

  containerStyle?: StyleProp<ViewStyle>;

  inputStyle?: StyleProp<TextStyle>;

  rightIcon?: React.ReactNode;

  onRightIconPress?: () => void;

  isPassword?: boolean;
}

const CTextInput: React.FC<CTextInputProps> = ({
  value = "",
  onChangeText,
  placeholder = "Placeholder",
  placeholderColor = "#aaa",
  borderColor = "#ccc",
  focusedBorderColor = "#ccc",
  containerStyle,
  inputStyle,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  ...textInputProps
}) => {
  const [focused, setFocused] = useState(false);
  const themedFocusedBorderColor = useThemeColor({}, "primary");

  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = value.length > 0 || focused ? 1 : 0;
  }, []);

  // Kdykoli se změní focus nebo hodnota, spustíme animaci
  useEffect(() => {
    const newValue = focused || value.length > 0 ? 1 : 0;
    animation.value = withTiming(newValue, { duration: 200 });
  }, [focused, value]);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  const handleChangeText = (text: string) => onChangeText?.(text);

  // Animovaný styl pro placeholder
  const animatedPlaceholderStyle = useAnimatedStyle(() => {
    return {
      // Posun Y z 0 na -35
      transform: [
        {
          translateY: interpolate(animation.value, [0, 1], [0, -38]),
        },
      ],
      // Měníme velikost písma z 16 na 12
      fontSize: interpolate(animation.value, [0, 1], [16, 14]),
      color: placeholderColor,
    };
  });

  // Animovaný styl pro borderColor
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        animation.value,
        [0, 1],
        [borderColor, themedFocusedBorderColor]
      ),
    };
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <AnimatedText style={[styles.placeholder, animatedPlaceholderStyle]}>
          {placeholder}
        </AnimatedText>

        <TextInput
          {...textInputProps}
          style={[styles.textInput, inputStyle]}
          placeholder=""
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          value={value}
          secureTextEntry={isPassword}
        />

        {/* Volitelná pravá ikona */}
        {rightIcon &&
          (onRightIconPress ? (
            <Pressable style={styles.iconContainer} onPress={onRightIconPress}>
              {rightIcon}
            </Pressable>
          ) : (
            <View style={styles.iconContainer}>{rightIcon}</View>
          ))}
      </Animated.View>
    </View>
  );
};

export default CTextInput;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: 30,
  },
  container: {
    position: "relative",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingTop: 12, // Rezerva nahoře pro placeholder
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  placeholder: {
    position: "absolute",
    left: 12,
    fontFamily: _500Medium,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    marginLeft: 8,
  },
});
