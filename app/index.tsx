import { Router, useRouter } from "expo-router";
import { TouchableOpacity, StyleSheet, Text, ScrollView, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { STORAGE_KEY_HAS_LAUNCHED, _500Medium } from "@/constants/Global";
import { setStorageItem } from "@/utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";

const WelcomeScreen = () => {
  const router: Router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleLoginPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/login");
  };

  const handleSignUpPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/register");
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>
        }>
        <ThemedText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porttitor, lectus at semper
          gravida, nisl dolor eleifend sem, quis laoreet purus nisl eu arcu. Suspendisse aliquet
          lacus id ex tempus, nec tempus mauris venenatis. Etiam pretium enim a urna sagittis, in
          malesuada dolor sagittis. Nunc vitae enim pellentesque, vestibulum est ac, bibendum ipsum.
          Cras feugiat sem metus, vitae aliquet urna iaculis id. Sed finibus libero nec felis
          efficitur, sed viverra tortor efficitur. Phasellus et ullamcorper felis. Praesent
          vestibulum risus at diam aliquam euismod. Morbi non porta ligula. Vivamus eleifend
          consectetur tincidunt. Sed condimentum, turpis faucibus ultricies ornare, dui arcu lacinia
          odio, quis tempor lacus nibh vehicula diam. Donec vel orci sit amet lorem pretium
          sollicitudin ut et purus. Aliquam quis magna maximus, tempus leo in, venenatis dui.
          Aliquam vestibulum odio mauris. In dui ligula, sodales sed dictum quis, molestie ut dui.
          In a gravida dolor. Duis luctus tortor vitae porta rutrum.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    padding: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default WelcomeScreen;
