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

//omit vynechá uvedené atributy z TextInputProps
interface CTextInputProps extends Omit<TextInputProps, "placeholder" | "onChangeText" | "value"> {
  /** Hodnota pole (řízená komponenta) */
  value?: string;
  /** Callback při změně textu */
  onChangeText?: (text: string) => void;

  /** Text placeholderu, který se bude animovat (plavat nahoru) */
  placeholder?: string;
  /** Barva placeholderu */
  placeholderColor?: string;
  /** Barva orámování */
  borderColor?: string;

  //barva borderu při focusu
  focusedBorderColor?: string;

  /** Styl kontejneru obalujícího vstup */
  containerStyle?: StyleProp<ViewStyle>;
  /** Styl samotného text inputu */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Volitelný React prvek pro zobrazení vpravo (např. <MaterialIcons name="close" size={20} />).
   * Pokud není vyplněno, ikona se nezobrazí.
   */
  rightIcon?: React.ReactNode;
  /**
   * Callback při stisku ikony vpravo (pokud je ikona definovaná).
   * Pokud není definován, ikona nebude tlačítko, ale pouze statický prvek.
   */
  onRightIconPress?: () => void;

  /** Zda se jedná o heslo (skryté zadávání) */
  isPassword?: boolean;
}

const FloatingPlaceholderInput: React.FC<CTextInputProps> = ({
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
  //const themedBorderColor = useThemeColor({}, "onBackground");
  const themedFocusedBorderColor = useThemeColor({}, "primary");

  // Animovaná hodnota 0..1 – 0 = placeholder je uvnitř pole, 1 = placeholder je nahoře
  const animation = useSharedValue(0);

  // Nastavíme výchozí stav podle toho, zda je pole prázdné
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
          translateY: interpolate(animation.value, [0, 1], [0, -35]),
        },
      ],
      // Měníme velikost písma z 16 na 12
      fontSize: interpolate(animation.value, [0, 1], [16, 12]),
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
          // Skutečný "placeholder" nepotřebujeme, máme vlastní s animací
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

export default FloatingPlaceholderInput;

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
    // top: 0; animujeme transform: translateY
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
