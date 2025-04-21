// TestButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  StyleProp,
} from "react-native";

interface TestButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>; // umožníme přidání vlastního stylu
}

const TestButton: React.FC<TestButtonProps> = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    //flex: 1, // zajistí, že tlačítko zabere dostupný prostor v rodiči
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 5, // mezery mezi tlačítky
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default TestButton;
