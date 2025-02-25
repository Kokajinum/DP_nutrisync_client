import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";

// Import ikony z @expo/vector-icons
import { MaterialIcons } from "@expo/vector-icons";

// Vytvoříme si "animovatelnou" verzi MaterialIcons
const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface CCheckBox {
  /** Popisek checkboxu */
  label: string;
  /** Barva ikony checku */
  checkColor?: string;
  /** Barva rámečku a vyplněného pozadí */
  boxColor?: string;
  /** Výchozí stav (zaškrtnutý / nezaškrtnutý) */
  defaultChecked?: boolean;
  /** Callback volaný při změně stavu */
  onChange?: (checked: boolean) => void;
}

const CCheckBox: React.FC<CCheckBox> = ({
  label,
  checkColor = "#fff",
  boxColor = "#000",
  defaultChecked = false,
  onChange,
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
    <Pressable style={styles.container} onPress={handlePress}>
      <Animated.View style={[styles.box, animatedBoxStyle]}>
        <AnimatedIcon name="check" size={16} style={[animatedIconStyle, { color: checkColor }]} />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

export default CCheckBox;

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
