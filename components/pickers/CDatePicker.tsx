import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useDateStore } from "@/stores/dateStore";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import i18n from "@/translations/i18n";

interface CDatePickerProps {
  style?: StyleProp<ViewStyle>;
  dateFormat?: "full" | "long" | "medium" | "short";
  showDayName?: boolean;
  arrowSize?: number;
  compact?: boolean;
}

const CDatePicker: React.FC<CDatePickerProps> = ({
  style,
  dateFormat = "medium",
  showDayName = true,
  arrowSize = 24,
  compact = false,
}) => {
  const { getFormattedDate, getDayName, goToNextDay, goToPreviousDay } = useDateStore();

  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const iconColor = useThemeColor({}, "primary");
  const backgroundColor = useThemeColor({}, "background");

  const dateDisplay = showDayName
    ? `${getDayName()}, ${getFormattedDate(dateFormat)}`
    : getFormattedDate(dateFormat);

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={[styles.arrowContainer, { backgroundColor }, compact ? styles.compactArrow : null]}
        onPress={goToPreviousDay}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)", borderless: true }}>
        <MaterialIcons name="chevron-left" size={arrowSize} color={iconColor} />
      </Pressable>

      <View style={styles.dateContainer}>
        <ThemedText type={compact ? "default" : "subtitle"} style={styles.dateText}>
          {dateDisplay}
        </ThemedText>
      </View>

      <Pressable
        style={[styles.arrowContainer, { backgroundColor }, compact ? styles.compactArrow : null]}
        onPress={goToNextDay}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)", borderless: true }}>
        <MaterialIcons name="chevron-right" size={arrowSize} color={iconColor} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  arrowContainer: {
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  compactArrow: {
    padding: 4,
  },
  dateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  dateText: {
    textAlign: "center",
  },
});

export default CDatePicker;
