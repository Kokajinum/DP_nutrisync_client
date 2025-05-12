import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, Text } from "react-native";

export default function FoodDiaryScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedStatusBar></ThemedStatusBar>
      <ThemedStackScreen></ThemedStackScreen>
      <ThemedText>food diary screen</ThemedText>
    </ThemedView>
  );
}
