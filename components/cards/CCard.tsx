import React, { ReactElement, useState } from "react";
import { Pressable, View, Text, StyleSheet, StyleProp, ViewStyle, Alert } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ensureError } from "@/utils/methods";

interface CCardProps {
  title: string;

  description: string;

  leftIcon?: ReactElement;

  onPress?: () => void;

  isSelected?: boolean;

  style?: StyleProp<ViewStyle>;
}

const CCard: React.FC<CCardProps> = ({
  title,
  description,
  leftIcon,
  onPress,
  isSelected = false,
  style,
}) => {
  const primaryColor = useThemeColor({}, "primary");
  const onPrimaryColor = useThemeColor({}, "onPrimary");
  const primaryContainerColor = useThemeColor({}, "primaryContainer");
  const onPrimaryContainerColor = useThemeColor({}, "onPrimaryContainer");

  let leftIconWithColor: ReactElement | null = leftIcon ?? null;
  try {
    //trochu nebezpecne, nekontroluje, zda element opravdu obsahuje atribut "color"
    leftIconWithColor = React.isValidElement(leftIcon)
      ? React.cloneElement(leftIcon as React.ReactElement<any>, {
          color: isSelected ? onPrimaryColor : onPrimaryContainerColor,
        })
      : (leftIcon ?? null);
  } catch (e) {
    if (__DEV__) {
      const error = ensureError(e);
      console.log(error.message);
      Alert.alert("Error: CCheckCard -> leftIconWithColor");
    }
  }

  return (
    <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onPress}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: isSelected ? primaryColor : primaryContainerColor,
          },
          style,
        ]}>
        {leftIcon && <View style={styles.iconWrapper}>{leftIconWithColor}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isSelected ? onPrimaryColor : onPrimaryContainerColor },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.description,
              { color: isSelected ? onPrimaryColor : onPrimaryContainerColor },
            ]}>
            {description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  iconWrapper: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default CCard;
