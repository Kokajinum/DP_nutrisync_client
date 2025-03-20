import React, { ReactElement, useState } from "react";
import { Pressable, View, Text, StyleSheet, StyleProp, ViewStyle, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@react-navigation/native";
import { ensureError } from "@/utils/methods";

interface CCardProps {
  /** Nadpis karty (např. "Beginner") */
  title: string;
  /** Popis či delší text pod titulkem */
  description: string;
  /** Nepovinný název ikonky (dumbbell, check, atd.) z knihovny @expo/vector-icons / MaterialCommunityIcons */
  leftIcon?: ReactElement;
  /** Callback, který se zavolá při kliknutí */
  onPress?: () => void;
  /** zda je karta vybraná */
  isSelected?: boolean;
  /** Volitelný styl obalového View */
  style?: StyleProp<ViewStyle>;
}

/**
 * Komponenta CCard
 * - V levé části volitelná ikona
 * - V pravé části title + description
 * - Kliknutím změní barvu pozadí na selectedColor
 */
const CCard: React.FC<CCardProps> = ({
  title,
  description,
  leftIcon,
  onPress,
  isSelected = false,
  style,
}) => {
  //const [isSelected, setIsSelected] = useState(false);

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

  //   const handlePress = () => {
  //     // Přepneme stav karty na vybranou/nevybranou
  //     setIsSelected(!isSelected);
  //     // Volitelně zavoláme callback z props
  //     onPress?.();
  //   };

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
    // Stín může být volitelně
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 3, // pro Android
  },
  textContainer: {
    flex: 1,
  },
  title: {
    //color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    //color: "#FFF",
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
