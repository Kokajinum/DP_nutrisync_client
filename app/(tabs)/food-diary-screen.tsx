import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View } from "react-native";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { useTranslation } from "react-i18next";

export default function FoodDiaryScreen() {
  const { getFormattedDate } = useDateStore();
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedStatusBar />
      <ThemedStackScreen />

      <CDatePicker dateFormat="long" style={{ marginVertical: 12 }} />

      <View style={{ padding: 16 }}>
        <ThemedText>Food diary for {getFormattedDate("full")}</ThemedText>
      </View>
    </ThemedView>
  );
}
