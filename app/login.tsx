import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    const success = await signIn(email, password);

    if (!success && !loading) {
      Alert.alert("Login Failed", "Incorrect email or password. You can try again or sign up.", [
        { text: "Try Again", style: "cancel" },
        { text: "Sign Up", onPress: () => router.replace("/register") },
      ]);
    } else if (success) {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        style={styles.title}
        /*lightColor={Colors.light.primary}
        darkColor={Colors.dark.primary}*/
      >
        Login
      </ThemedText>
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
        title={loading ? "Logging in..." : "Login"}
        onPress={handleSignIn}
        disabled={loading}
      />
      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <Text style={styles.link} onPress={() => router.replace("/register")}>
          Register
        </Text>
      </View>
      {loading && <ActivityIndicator style={styles.loading} />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default LoginScreen;
