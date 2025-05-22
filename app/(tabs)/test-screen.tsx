import { View, Text, ScrollView, StyleSheet, Clipboard } from "react-native";
import React, { useEffect, useState } from "react";
import CAccordion from "@/components/text/CAccordion";
import { MaterialIcons } from "@expo/vector-icons";
import { CCheckCard } from "@/components/cards/CCheckCard";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import CCard from "@/components/cards/CCard";
import { useAuth } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ensureError } from "@/utils/methods";
import { useRestManager } from "@/context/RestManagerProvider";
import { fetchUserProfile } from "@/utils/api/apiClient";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";
import TestButton from "@/components/button/TestButton";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const TestScreen = () => {
  const [selected, setSelected] = useState(false);
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const restManager = useRestManager();
  const { expoPushToken, permissionStatus, registerForPushNotifications } = useNotifications();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSegmentedIndex, setSelectedSegmentedIndex] = useState(0);
  const segments = ["První", "Druhý", "Třetí"];
  const segments2 = ["Kg", "Lbs"];

  const copyTokenToClipboard = () => {
    if (expoPushToken) {
      Clipboard.setString(expoPushToken);
      alert("Token zkopírován do schránky!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Push Notifikací</Text>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Stav povolení notifikací</ThemedText>
        <ThemedText>
          {permissionStatus === "granted"
            ? "Povoleno ✅"
            : permissionStatus === "denied"
              ? "Zamítnuto ❌"
              : "Neurčeno ❓"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Expo Push Token</ThemedText>
        {expoPushToken ? (
          <>
            <ThemedText style={styles.tokenText}>{expoPushToken}</ThemedText>
            <TestButton
              title="Zkopírovat token"
              onPress={copyTokenToClipboard}
              style={styles.button}
            />
          </>
        ) : (
          <ThemedText>Token není k dispozici. Nejprve zaregistrujte zařízení.</ThemedText>
        )}
      </ThemedView>

      <TestButton
        title="Zaregistrovat zařízení pro push notifikace"
        onPress={registerForPushNotifications}
        style={styles.button}
      />

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Jak testovat push notifikace</ThemedText>
        <ThemedText>
          1. Zaregistrujte zařízení pomocí tlačítka výše{"\n"}
          2. Zkopírujte vygenerovaný token{"\n"}
          3. Navštivte Expo Push Notification Tool:{"\n"}
          https://expo.dev/notifications{"\n"}
          4. Vložte token a vyplňte údaje pro notifikaci{"\n"}
          5. Odešlete notifikaci
        </ThemedText>
      </ThemedView>

      <Text style={styles.title}>Ostatní komponenty</Text>

      <CAccordion
        title="Training plan"
        content="Zde můžeš zobrazit detailní informace o tréninkovém plánu."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
      />

      <CAccordion
        title="Height, weight, age or birthday"
        content="To understand your basic stats like age, height, and weight, which are crucial for our algorithms to calculate your calorie needs and goals."
        leftIcon={<MaterialIcons name="rocket-launch" size={24} />}
      />

      <CCheckCard
        icon={<MaterialIcons name="fitness-center" size={24} />}
        label="Lose fat"
        checked={selected}
        onPress={() => setSelected((prev) => !prev)}
      />

      <CStepIndicator status="done" />
      <CStepIndicator status="inProgress" />
      <CStepIndicator status="notStarted" />

      <CCard
        key="0"
        title="Beginner"
        description="I'm just starting with exercise or have limited experience..."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
        isSelected={selectedIndex === 0}
        onPress={() => setSelectedIndex(0)}
      />

      <CCard
        key="1"
        title="Experienced"
        description="I have been working out regularly for months or years..."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
        isSelected={selectedIndex === 1}
        onPress={() => setSelectedIndex(1)}
      />

      <CSegmentedButton
        segments={segments2}
        currentIndex={selectedSegmentedIndex}
        onChange={setSelectedSegmentedIndex}
        containerStyle={{ width: "50%" }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tokenText: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: "monospace",
    fontSize: 12,
  },
  button: {
    marginVertical: 10,
  },
});

export default TestScreen;
