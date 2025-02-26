import CButton from "@/components/button/CButton";
import CCheckBox from "@/components/checkbox/CCheckBox";
import FloatingLabelInput from "@/components/input/CTextInput";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthProvider";
import { TranslationKeys } from "@/translations/translations";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet } from "react-native";

const RegistrationScreen = () => {
  const [email, setEmail] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { signUp, loading, error } = useAuth();
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

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
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t(TranslationKeys.get_free_account),
          headerTitleAlign: "center",
        }}></Stack.Screen>
      <ThemedStatusBar></ThemedStatusBar>
      <ThemedText>ahoijrere</ThemedText>
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

      <FloatingLabelInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(val) => {
          setEmail(val);
        }}
        rightIcon={<MaterialIcons name="close" size={20} color="#000" />}
        onRightIconPress={() => setEmail("")} // Vymaže text
      />

      <FloatingLabelInput
        placeholder="Enter your password"
        value={password}
        onChangeText={(val) => {
          setPassword(val);
        }}
        rightIcon={
          isPasswordVisible ? (
            <MaterialIcons name="visibility" size={20} color="#000"></MaterialIcons>
          ) : (
            <MaterialIcons name="visibility-off" size={20} color="#000"></MaterialIcons>
          )
        }
        isPassword={!isPasswordVisible}
        onRightIconPress={() => {
          setIsPasswordVisible(!isPasswordVisible);
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RegistrationScreen;
