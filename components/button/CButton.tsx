import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActivityIndicator,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _500Medium, _600SemiBold, _700Bold } from "@/constants/Global";

interface IconProps {
  style?: StyleProp<ViewStyle | TextStyle | ImageStyle>;
}

export interface CButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactElement<IconProps> | React.ReactNode;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle | TextStyle | ImageStyle>;
  type?: "default" | "google";
  textLightColor?: string;
  textDarkColor?: string;
  iconLightColor?: string;
  iconDarkColor?: string;
  backgroundLightColor?: string;
  backgroundDarkColor?: string;
  loading?: boolean;
  disabled?: boolean;
}

const CButton = ({
  title,
  onPress,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  iconStyle,
  type = "default",
  textLightColor,
  textDarkColor,
  iconLightColor,
  iconDarkColor,
  backgroundLightColor,
  backgroundDarkColor,
  loading = false,
  disabled = false,
}: CButtonProps) => {
  const foregroundColor = useThemeColor(
    { light: textLightColor, dark: textDarkColor },
    "onPrimary"
  );
  const iconColor = useThemeColor({ light: iconLightColor, dark: iconDarkColor }, "onPrimary");
  const backgroundColor = useThemeColor(
    { light: backgroundLightColor, dark: backgroundDarkColor },
    "primary"
  );

  const renderIcon = () => {
    if (!icon) return null;

    const baseIconStyles = [styles.icon, iconPosition === "right" && styles.iconRight];

    if (React.isValidElement<IconProps>(icon)) {
      // For MaterialIcons and other icon components that accept style prop
      const iconStyleWithColor = [
        baseIconStyles,
        { color: iconColor, fontSize: 24 }, // Default size for icons
        iconStyle,
      ].filter(Boolean);

      return React.cloneElement(icon, {
        style: iconStyleWithColor,
      } as IconProps);
    }

    return <View style={baseIconStyles}>{icon}</View>;
  };

  const isIconLeft = icon && iconPosition === "left";
  const isIconRight = icon && iconPosition === "right";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        style,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      <View style={styles.buttonContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={foregroundColor}
              style={styles.loadingIndicator}
            />
            <Text style={[styles.text, { color: foregroundColor }, textStyle]}>{title}</Text>
          </View>
        ) : (
          <>
            {isIconLeft && renderIcon()}
            <Text style={[styles.text, { color: foregroundColor }, textStyle]}>{title}</Text>
            {isIconRight && renderIcon()}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    overflow: "hidden",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: 8,
  },
  text: {
    fontSize: 15,
    fontFamily: _500Medium,
    textAlign: "center",
  },
});

export default CButton;
