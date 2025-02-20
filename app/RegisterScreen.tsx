import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleSignUp}
        disabled={loading}
      />
      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Text style={styles.link} onPress={() => router.replace("/LoginScreen")}>
          Login
        </Text>
      </View>
      {loading && <ActivityIndicator style={styles.loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    marginTop: 20,
  },
});

export default RegistrationScreen;
