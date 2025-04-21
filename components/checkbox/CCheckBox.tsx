import React, { useState } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface CCheckBoxProps {
  label: string;
  checkColor?: string;
  /** Barva rámečku a vyplněného pozadí */
  boxColor?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const CCheckbox: React.FC<CCheckBoxProps> = ({
  label,
  checkColor = "#fff",
  boxColor = "#000",
  defaultChecked = false,
  onChange,
  style,
}) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked);

  // Shared value pro animaci (0 = nezaškrtnuto, 1 = zaškrtnuto)
  const progress = useSharedValue(defaultChecked ? 1 : 0);

  const handlePress = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange?.(newChecked);

    // Spustíme animaci (0 -> 1 nebo 1 -> 0) s pružinovým efektem
    progress.value = withSpring(newChecked ? 1 : 0, {
      damping: 12,
      stiffness: 120,
    });
  };

  // Animovaný styl pro box - plynulý přechod barvy pozadí
  const animatedBoxStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1], ["transparent", boxColor]);
    return {
      borderColor: boxColor,
      backgroundColor,
    };
  });

  // Animovaný styl pro ikonu checku - měníme scale a opacity
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
      opacity: progress.value,
    };
  });

  return (
    <Pressable style={[styles.container, style]} onPress={handlePress}>
      <Animated.View style={[styles.box, animatedBoxStyle]}>
        <AnimatedIcon name="check" size={16} style={[animatedIconStyle, { color: checkColor }]} />
      </Animated.View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
};

export default CCheckbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    /**
     * alignSelf: 'flex-start' zajistí, že se Pressable "neroztáhne"
     * přes celou šířku, ale jen kolem svého obsahu (box + text).
     */
    alignSelf: "flex-start",
  },
  box: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
  },
});
