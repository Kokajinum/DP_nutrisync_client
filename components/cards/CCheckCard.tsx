import React, { ReactElement } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

type CCheckCardProps = {
  icon: ReactElement;

  label: string;

  checked?: boolean;

  onPress?: () => void;
};

export const CCheckCard: React.FC<CCheckCardProps> = ({
  icon,
  label,
  checked = false,
  onPress,
}) => {
  const primaryColor = useThemeColor({}, "primary");
  const primaryContainerColor = useThemeColor({}, "primaryContainer");
  const onPrimaryColor = useThemeColor({}, "onPrimary");
  const onPrimaryContainerColor = useThemeColor({}, "onPrimaryContainer");

  let iconWithColor: ReactElement = icon;
  try {
    //trochu nebezpecne, nekontroluje, zda element opravdu obsahuje atribut "color"
    iconWithColor = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<any>, {
          color: checked ? onPrimaryColor : onPrimaryContainerColor,
        })
      : icon;
  } catch (e) {
    if (__DEV__) {
      Alert.alert("Error: CCheckCard -> iconWithColor");
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        checked ? { backgroundColor: primaryColor } : { backgroundColor: primaryContainerColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <View style={styles.leftSection}>
        {iconWithColor}
        <Text
          style={[
            styles.label,
            checked ? { color: onPrimaryColor } : { color: onPrimaryContainerColor },
          ]}>
          {label}
        </Text>
      </View>

      {checked && <MaterialIcons name="check" size={24} color="#fff" style={styles.checkIcon} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
