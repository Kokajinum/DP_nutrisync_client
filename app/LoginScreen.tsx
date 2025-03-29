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
import apiClient from "@/utils/api/apiClient";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { useQueryClient } from "@tanstack/react-query";
import { ensureError } from "@/utils/methods";
import { useRestManager } from "@/context/RestManagerProvider";

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
        // const profile = await queryClient.fetchQuery({
        //   queryKey: ["profileData"],
        //   queryFn: fetchUserProfile,
        // });
        // const queryState = queryClient.getQueryState(["profileData"]);
        // console.log(queryState);
        // if (profile) {
        //   router.replace("/HomeScreen");
        // } else {
        //   router.replace("/onboarding");
        // }
      }
    } catch (err: any) {}
  };

  const fetchUserProfile = async (): Promise<UserProfileData | null> => {
    try {
      const response = await restManager.get<UserProfileData>("/users/profile");
      return response.data;
    } catch (exception) {
      const error: Error = ensureError(exception);
      console.error(error.message);
      return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t(TranslationKeys.log_in),
          headerTitleAlign: "center",
          headerTintColor: onBackground,
          headerStyle: { backgroundColor: colorScheme === "dark" ? "black" : "white" },
        }}></Stack.Screen>
      <ThemedStatusBar></ThemedStatusBar>

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
      <ThemedText style={[styles.helperText, { display: "none" }]}>Enter your password</ThemedText>

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
          title={loading ? t(TranslationKeys.loading) : t(TranslationKeys.log_in)}
          onPress={handleSignIn}
          icon={<MaterialIcons name="login" size={24} />}
          style={styles.signInButton}
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

      {loading && <ActivityIndicator style={styles.loading} />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
    // alignItems: "center",
    // justifyContent: "center",
    // padding: 20,
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
    marginVertical: 16,
  },
  forgotPassword: {
    fontSize: 14,
  },
});

export default LoginScreen;
