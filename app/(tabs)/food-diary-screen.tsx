import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, StyleSheet } from "react-native";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import CButton from "@/components/button/CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FoodDiaryScreen() {
  const { getFormattedDate } = useDateStore();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedStatusBar />
      <ThemedStackScreen />

      <CDatePicker dateFormat="long" style={{ marginVertical: 12 }} />

      <View style={{ padding: 16 }}>
        <ThemedText>Food diary for {getFormattedDate("full")}</ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <CButton
          title="Add New Food"
          icon={<MaterialCommunityIcons name="food-apple" size={20} />}
          onPress={() => router.push("/food-creation-screen")}
          style={styles.addButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 16,
    alignItems: "center",
  },
  addButton: {
    minWidth: 200,
  },
});
