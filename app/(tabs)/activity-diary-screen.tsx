import { View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";

export default function ActivityDiaryScreen() {
  const { getFormattedDate } = useDateStore();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedStatusBar />
      <ThemedStackScreen />
      <CDatePicker
        dateFormat="full"
        showDayName={false}
        compact={true}
        arrowSize={20}
        style={{ marginTop: 8 }}
      />

      <View style={{ padding: 16 }}>
        <ThemedText>Activity diary for {getFormattedDate("full")}</ThemedText>
      </View>
    </ThemedView>
  );
}
