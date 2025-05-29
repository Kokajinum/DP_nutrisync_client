import React, { useState, useEffect, ReactElement } from "react";
import { View, Pressable, StyleSheet, Alert } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CAccordionProps {
  title: string;
  content: string;
  leftIcon?: ReactElement; // Volitelná ikona vedle titulku
}

const CAccordion: React.FC<CAccordionProps> = ({ title, content, leftIcon }) => {
  const onBackgroundColor = useThemeColor({}, "onBackground");

  let leftIconWithColor: ReactElement | null = leftIcon ?? null;
  try {
    // Trochu nebezpecne, nekontroluje, zda element opravdu obsahuje atribut "color"
    leftIconWithColor = React.isValidElement(leftIcon)
      ? React.cloneElement(leftIcon as React.ReactElement<any>, {
          color: onBackgroundColor,
        })
      : (leftIcon ?? null);
  } catch (e) {
    if (__DEV__) {
      Alert.alert("Error: CCheckCard -> leftIconWithColor");
    }
  }

  const [expanded, setExpanded] = useState(false);

  // Měřená výška obsahu
  const [measuredHeight, setMeasuredHeight] = useState(0);

  // Reanimated sdílené proměnné
  const arrowRotation = useSharedValue(0); // 0 -> 1 (0° -> 180°)
  const animatedHeight = useSharedValue(0); // 0 -> measuredHeight

  // Když se "expanded" změní, animujeme výšku a rotaci šipky
  useEffect(() => {
    arrowRotation.value = withTiming(expanded ? 1 : 0, { duration: 200 });
    animatedHeight.value = withTiming(expanded ? measuredHeight : 0, { duration: 300 });
  }, [expanded, measuredHeight]);

  // Styl pro animovanou šipku
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${arrowRotation.value * 180}deg`, // 0 -> 180 stupňů
        },
      ],
    };
  });

  // Styl pro animovanou výšku
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      overflow: "hidden",
    };
  });

  return (
    <ThemedView style={styles.wrapper}>
      {/* Hlavička */}
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.titleContainer}>
          {/* Volitelná ikona vlevo */}
          {leftIcon && <View style={styles.iconWrapper}>{leftIconWithColor}</View>}
          <ThemedText style={[styles.title, { color: onBackgroundColor }]}>{title}</ThemedText>
        </View>
        {/* Šipka (expand-more) */}
        <Animated.View style={arrowAnimatedStyle}>
          <MaterialIcons name="expand-more" size={24} color={onBackgroundColor} />
        </Animated.View>
      </Pressable>

      {/* text posunutý mimo obrazovku */}
      <ThemedView style={styles.hiddenMeasuringContainer}>
        <View
          style={styles.contentContainer}
          onLayout={(e) => setMeasuredHeight(e.nativeEvent.layout.height)}>
          <ThemedText style={[styles.contentText, { color: onBackgroundColor }]}>
            {content}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Viditelný animovaný kontejner */}
      <Animated.View style={[containerAnimatedStyle]}>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.contentText}>{content}</ThemedText>
        </View>
      </Animated.View>
    </ThemedView>
  );
};

export default CAccordion;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Neviditelný kontejner mimo obrazovku pro měření
  hiddenMeasuringContainer: {
    position: "absolute",
    top: -9999,
    width: "100%",
    opacity: 0,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  contentText: {
    fontSize: 14,
  },
});
