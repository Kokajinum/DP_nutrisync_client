import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type CSegmentedButtonProps = {
  segments: string[];
  currentIndex: number;
  onChange: (index: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  segmentStyle?: StyleProp<ViewStyle>;
  highlightStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textActiveStyle?: StyleProp<TextStyle>;
  /** Odsazení zvýrazněného segmentu od okrajů (default 4) */
  highlightMargin?: number;
  /**
   * (Volitelné) Fixní šířka segmented buttonu.
   * Pokud se neuvede, komponenta se pokusí měřit dostupnou šířku rodiče.
   */
  buttonWidth?: number;
};

export const CSegmentedButton: React.FC<CSegmentedButtonProps> = ({
  segments,
  currentIndex,
  onChange,
  containerStyle,
  segmentStyle,
  highlightStyle,
  textStyle,
  textActiveStyle,
  highlightMargin = 4,
  buttonWidth,
}) => {
  const primaryColor = useThemeColor({}, "primary");
  const onPrimaryColor = useThemeColor({}, "onPrimary");
  const secondaryContainerColor = useThemeColor({}, "secondaryContainer");

  // Pokud není buttonWidth předán, měříme dostupnou šířku rodiče
  const [containerWidth, setContainerWidth] = useState<number>(buttonWidth ?? 0);
  const effectiveWidth = buttonWidth ?? containerWidth;

  // Pokud ještě nemáme dostupnou šířku, segmentWidth bude 0
  const segmentWidth = effectiveWidth ? effectiveWidth / segments.length : 0;

  const translateX = useSharedValue(currentIndex * segmentWidth);

  useEffect(() => {
    if (segmentWidth) {
      translateX.value = withTiming(currentIndex * segmentWidth, { duration: 200 });
    }
  }, [currentIndex, segmentWidth, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!buttonWidth) {
      setContainerWidth(event.nativeEvent.layout.width);
    }
  };

  const animatedHighlightStyle = useAnimatedStyle(() => ({
    width: segmentWidth ? segmentWidth - highlightMargin * 2 : 0,
    transform: [{ translateX: segmentWidth ? translateX.value + highlightMargin : 0 }],
  }));

  const handlePress = useCallback(
    (index: number) => {
      onChange(index);
    },
    [onChange]
  );

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        { backgroundColor: secondaryContainerColor, alignSelf: "flex-start" },
        // Pokud je buttonWidth předán, explicitně jej použijeme
        buttonWidth ? { width: buttonWidth } : {},
        containerStyle,
      ]}>
      <Animated.View
        style={[
          styles.highlight,
          { backgroundColor: primaryColor },
          animatedHighlightStyle,
          highlightStyle,
        ]}
      />
      {segments.map((segment, index) => {
        const isActive = index === currentIndex;
        return (
          <Pressable
            key={index}
            style={[styles.segment, segmentStyle]}
            onPress={() => handlePress(index)}>
            <Text
              style={[
                styles.text,
                { color: "#000" },
                textStyle,
                isActive && styles.textActive,
                isActive && textActiveStyle,
                isActive && { color: onPrimaryColor },
              ]}>
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {},
  textActive: {
    fontWeight: "600",
  },
});
