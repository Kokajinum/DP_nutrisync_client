import CButton from "@/components/button/CButton";
import CCheckBox from "@/components/checkbox/CCheckBox";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from "react-native";

const RegistrationScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
    const success = await signUp(email, password);

    if (!success && !loading) {
      Alert.alert("Registration Failed", "Please try again in few minutes.", [
        { text: "Try Again", style: "cancel" },
        { text: "Sign In", onPress: () => router.replace("/LoginScreen") },
      ]);
    } else if (success) {
      router.replace("/(tabs)/HomeScreen");
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText>ahoij</ThemedText>
        <CCheckBox
          label="Remember"
          boxColor="#333"
          checkColor="#fff"
          defaultChecked={true}
          onChange={(newState) => console.log("Checkbox state:", newState)}
        />
        <CButton
          title="TEST"
          onPress={() => {
            console.log("test");
          }}></CButton>
      </ThemedView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RegistrationScreen;
