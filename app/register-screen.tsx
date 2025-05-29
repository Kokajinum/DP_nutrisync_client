import CButton from "@/components/button/CButton";
import CTextInput from "@/components/input/CTextInput";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TranslationKeys } from "@/translations/translations";
import { globalStyles } from "@/utils/global-styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View, Pressable, KeyboardAvoidingView } from "react-native";

const RegistrationScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isEmailErrorVisible, setIsEmailErrorVisible] = useState(false);
  const [isPasswordErrorVisible, setIsPasswordErrorVisible] = useState(false);
  const [isPasswordConfirmErrorVisible, setIsPasswordConfirmErrorVisible] = useState(false);
  const { signUp, loading, error } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  //colors
  const linkColor = useThemeColor({}, "primary");
  const onBackground = useThemeColor({}, "onBackground");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6 && password.length <= 30;
  };

  const validatePasswordConfirmation = (password: string, confirmation: string): boolean => {
    return password === confirmation;
  };

  useEffect(() => {
    if (email) {
      setIsEmailErrorVisible(!validateEmail(email));
    }

    if (password) {
      setIsPasswordErrorVisible(!validatePassword(password));
    }

    if (passwordConfirmation) {
      setIsPasswordConfirmErrorVisible(
        !validatePasswordConfirmation(password, passwordConfirmation)
      );
    }
  }, [email, password, passwordConfirmation]);

  const handleSignUp = async () => {
    const isEmailValid = email && validateEmail(email);
    const isPasswordValid = password && validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirmation(password, passwordConfirmation);

    setIsEmailErrorVisible(!isEmailValid);
    setIsPasswordErrorVisible(!isPasswordValid);
    setIsPasswordConfirmErrorVisible(!isPasswordConfirmValid);

    if (!isEmailValid || !isPasswordValid || !isPasswordConfirmValid) {
      Alert.alert(t(TranslationKeys.error), t(TranslationKeys.validation_error_message));
      return;
    }

    if (!email || !password) {
      Alert.alert(t(TranslationKeys.error), t(TranslationKeys.enter_email_password));
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert(t(TranslationKeys.error), t(TranslationKeys.passwords_do_not_match));
      return;
    }

    const success = await signUp(email, password);

    if (!success && !loading) {
      Alert.alert(t(TranslationKeys.registration_failed), t(TranslationKeys.try_again_later), [
        { text: t(TranslationKeys.try_again), style: "cancel" },
        { text: t(TranslationKeys.log_in), onPress: () => router.replace("/login-screen") },
      ]);
    } else if (success) {
      router.replace("/onboarding");
    }
  };

  const handleContinueWithoutAccount = () => {
    router.replace("/home-screen");
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardView}>
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.get_free_account),
        }}
      />
      <ThemedStatusBar />
      <ThemedView style={[styles.container, globalStyles.globalMainContent]}>
        {/* Email Input */}
        <CTextInput
          placeholder={t(TranslationKeys.enter_email)}
          value={email}
          onChangeText={(val) => setEmail(val)}
          rightIcon={<MaterialIcons name="close" size={20} color={onBackground} />}
          onRightIconPress={() => {
            setEmail("");
            setIsEmailErrorVisible(false);
          }}
          containerStyle={styles.inputContainer}
        />
        <ThemedText style={[styles.helperText, { display: isEmailErrorVisible ? "flex" : "none" }]}>
          {t(TranslationKeys.validation_invalid_email)}
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
        <ThemedText
          style={[styles.helperText, { display: isPasswordErrorVisible ? "flex" : "none" }]}>
          {t(TranslationKeys.validation_short_password)}
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
        <ThemedText
          style={[styles.helperText, { display: isPasswordConfirmErrorVisible ? "flex" : "none" }]}>
          {t(TranslationKeys.validation_passwords_mismatch)}
        </ThemedText>

        <View style={styles.buttons}>
          {/* Sign Up Button */}
          <CButton
            style={styles.signUpButton}
            title={loading ? t(TranslationKeys.loading) : t(TranslationKeys.sign_up)}
            onPress={handleSignUp}
            icon={<MaterialIcons name="email" size={24} />}
          />

          {/* Already have an account link */}
          <Pressable
            style={styles.loginLinkContainer}
            onPress={() => router.replace("/login-screen")}>
            <ThemedText style={[styles.loginLink, { color: linkColor }]}>
              {t(TranslationKeys.already_have_account)}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    color: "#e74c3c",
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
    marginBottom: 12,
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
  forgotPasswordContainer: {
    marginVertical: 20,
    alignItems: "flex-end",
  },
});

export default RegistrationScreen;
