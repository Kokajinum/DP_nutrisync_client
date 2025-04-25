import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { useThemeColor } from "@/hooks/useThemeColor";
import CTextInput from "@/components/input/CTextInput";
import { MaterialIcons } from "@expo/vector-icons";
import CButton from "@/components/button/CButton";
import CCheckBox from "@/components/checkbox/CCheckBox";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { useQueryClient } from "@tanstack/react-query";
import { ensureError } from "@/utils/methods";
import { useRestManager } from "@/context/RestManagerProvider";
import TestButton from "@/components/button/TestButton";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { globalStyles } from "@/utils/global-styles";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmailErrorVisible, setIsEmailErrorVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { signIn, loading, error, session } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const restManager = useRestManager();

  //colors
  const linkColor = useThemeColor({}, "primary");
  const onBackground = useThemeColor({}, "onBackground");
  const background = useThemeColor({}, "background");
  const colorScheme = useColorScheme();

  const [text, onChangeText] = React.useState("Useless Text");

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        Alert.alert(t(TranslationKeys.error), t(TranslationKeys.enter_email_password));
        return;
      }

      const success = await signIn(email, password);

      if (!success && !loading) {
        Alert.alert(t(TranslationKeys.login_failed), t(TranslationKeys.incorrect_email_password), [
          { text: t(TranslationKeys.try_again), style: "cancel" },
          { text: t(TranslationKeys.sign_up), onPress: () => router.replace("/RegisterScreen") },
        ]);
      } else if (success) {
        router.replace("/(tabs)/home-screen");
      }
    } catch (err: any) {}
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.log_in),
        }}></ThemedStackScreen>
      <ThemedStatusBar></ThemedStatusBar>
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        </TouchableWithoutFeedback> */}

      <ThemedView style={[styles.container, globalStyles.globalMainContent]}>
        <ScrollView>
          {/* Email Input */}
          <CTextInput
            placeholder={t(TranslationKeys.enter_email)}
            value={email}
            onChangeText={(val) => setEmail(val)}
            rightIcon={<MaterialIcons name="close" size={20} color={onBackground} />}
            onRightIconPress={() => {
              setEmail("");
            }}
            containerStyle={styles.inputContainer}></CTextInput>
          <ThemedText
            style={[styles.helperText, { display: isEmailErrorVisible ? "flex" : "none" }]}>
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

          <Pressable
            style={[styles.forgotPasswordContainer]}
            onPress={() => router.push("/PasswordRecoveryScreen")}>
            <ThemedText style={[styles.forgotPassword, { color: linkColor }]}>
              {t(TranslationKeys.forgot_password)}
            </ThemedText>
          </Pressable>

          {loading && <ActivityIndicator style={styles.loading} />}
        </ScrollView>
        <View style={styles.buttons}>
          {/* Sign Up Button */}
          <CButton
            style={styles.signInButton}
            title={loading ? t(TranslationKeys.loading) : t(TranslationKeys.log_in)}
            onPress={handleSignIn}
            icon={<MaterialIcons name="login" size={24} />}
          />

          {/* don't have an account link */}
          <Pressable
            style={styles.loginLinkContainer}
            onPress={() => router.replace("/RegisterScreen")}>
            <ThemedText style={[styles.loginLink, { color: linkColor }]}>
              {t(TranslationKeys.dont_have_account)}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    //alignItems: "center",
    //justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
  },
  link: {
    color: "blue",
    fontWeight: "bold",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 16,
  },
  buttons: {
    marginTop: "auto",
  },
  signInButton: {
    marginBottom: 12,
  },
  loginLinkContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLink: {
    fontSize: 14,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  forgotPassword: {
    fontSize: 14,
  },
  forgotPasswordContainer: {
    marginVertical: 20,
    alignItems: "flex-end",
  },
});

export default LoginScreen;
