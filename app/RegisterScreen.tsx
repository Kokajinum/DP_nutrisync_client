import CButton from "@/components/button/CButton";
import CCheckBox from "@/components/checkbox/CCheckBox";
import CTextInput from "@/components/input/CTextInput";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TranslationKeys } from "@/translations/translations";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View, Pressable } from "react-native";

const RegistrationScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isEmailErrorVisible, setIsEmailErrorVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { signUp, loading, error } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  //colors
  const linkColor = useThemeColor({}, "primary");
  const onBackground = useThemeColor({}, "onBackground");
  const background = useThemeColor({}, "background");
  const colorScheme = useColorScheme();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const success = await signUp(email, password);

    if (!success && !loading) {
      Alert.alert(t(TranslationKeys.registration_failed), t(TranslationKeys.try_again_later), [
        { text: "Try Again", style: "cancel" },
        { text: "Sign In", onPress: () => router.replace("/LoginScreen") },
      ]);
    } else if (success) {
      router.replace("/onboarding");
    }
  };

  const handleContinueWithoutAccount = () => {
    router.replace("/HomeScreen");
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t(TranslationKeys.get_free_account),
          headerTitleAlign: "center",
          headerTintColor: onBackground,
          headerStyle: { backgroundColor: colorScheme === "dark" ? "black" : "white" },
        }}
      />
      <ThemedStatusBar />

      <View style={styles.formContainer}>
        {/* Email Input */}
        <CTextInput
          placeholder={t(TranslationKeys.enter_email)}
          value={email}
          onChangeText={(val) => setEmail(val)}
          rightIcon={<MaterialIcons name="close" size={20} color={onBackground} />}
          onRightIconPress={() => {
            setEmail("");
          }}
          containerStyle={styles.inputContainer}
        />
        <ThemedText style={[styles.helperText, { display: isEmailErrorVisible ? "flex" : "none" }]}>
          Enter your email/Invalid email address
        </ThemedText>

        {/* Password Input */}
        <CTextInput
          placeholder={t(TranslationKeys.enter_password)}
          value={password}
          onChangeText={(val) => setPassword(val)}
          rightIcon={
            isPasswordVisible ? (
              <MaterialIcons name="visibility" size={20} color={onBackground} />
            ) : (
              <MaterialIcons name="visibility-off" size={20} color={onBackground} />
            )
          }
          isPassword={!isPasswordVisible}
          onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
          containerStyle={styles.inputContainer}
        />
        <ThemedText style={[styles.helperText, { display: "none" }]}>
          Enter your password
        </ThemedText>

        {/* Confirm Password Input */}
        <CTextInput
          placeholder={t(TranslationKeys.password_confirm)}
          value={passwordConfirmation}
          onChangeText={(val) => setPasswordConfirmation(val)}
          rightIcon={
            isConfirmPasswordVisible ? (
              <MaterialIcons name="visibility" size={20} color={onBackground} />
            ) : (
              <MaterialIcons name="visibility-off" size={20} color={onBackground} />
            )
          }
          isPassword={!isConfirmPasswordVisible}
          onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          containerStyle={styles.inputContainer}
        />
        <ThemedText style={[styles.helperText, { display: "none" }]}>
          Confirm your password
        </ThemedText>

        {/* Remember Me and Forgot Password */}
        <View style={styles.rememberForgotContainer}>
          <CCheckBox
            label={t(TranslationKeys.remember)}
            boxColor="#333"
            checkColor="#fff"
            defaultChecked={rememberMe}
            onChange={setRememberMe}
          />
          <Pressable onPress={() => router.push("/PasswordRecoveryScreen")}>
            <ThemedText style={[styles.forgotPassword, { color: linkColor }]}>
              {t(TranslationKeys.forgot_password)}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.buttons}>
          {/* Sign Up Button */}
          <CButton
            title={loading ? "Loading..." : t(TranslationKeys.sign_up)}
            onPress={handleSignUp}
            icon={<MaterialIcons name="email" size={24} />}
            style={styles.signUpButton}
          />

          {/* Continue Without Account Button */}
          <CButton
            title={t(TranslationKeys.continue_without_account)}
            onPress={handleContinueWithoutAccount}
            icon={<MaterialIcons name="rocket-launch" size={24} />}
            style={styles.continueButton}
          />

          {/* Already have an account link */}
          <Pressable
            style={styles.loginLinkContainer}
            onPress={() => router.replace("/LoginScreen")}>
            <ThemedText style={[styles.loginLink, { color: linkColor }]}>
              {t(TranslationKeys.already_have_account)}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  forgotPassword: {
    fontSize: 14,
  },
  signUpButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 24,
  },
  loginLinkContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLink: {
    fontSize: 14,
  },
  buttons: {
    marginTop: "auto",
  },
});

export default RegistrationScreen;
