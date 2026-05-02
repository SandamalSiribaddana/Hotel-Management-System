import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/register", {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: "customer",
      });

      console.log("Register response:", response.data);

      Alert.alert(
        "Success ✅",
        "Registration successful! Please login.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Register error:", JSON.stringify(error?.response?.data));
      console.log("Register error message:", error?.message);
      console.log("Register error code:", error?.code);

      let errorMessage = "Something went wrong. Please try again.";

      if (error?.code === "ERR_NETWORK" || error?.code === "ECONNREFUSED") {
        errorMessage =
          "Cannot connect to server.\n\nMake sure:\n• Backend server is running\n• Your IP address is correct in api.ts";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Deep purple background */}
      <View style={styles.background}>
        {/* Decorative floating circles */}
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.circle, styles.circleTopLeft]} />
        <View style={[styles.circleSm, styles.circleBottomLeft]} />
        <View style={[styles.circleSm, styles.circleBottomRight]} />

        {/* Decorative stars */}
        <Text style={[styles.deco, { top: height * 0.07, left: width * 0.1 }]}>✦</Text>
        <Text style={[styles.deco, { top: height * 0.13, right: width * 0.07 }]}>✦</Text>
        <Text style={[styles.decoSm, { top: height * 0.20, right: width * 0.20 }]}>✦</Text>
        <Text style={[styles.decoSm, { top: height * 0.05, right: width * 0.38 }]}>○</Text>
        <Text style={[styles.decoSm, { top: height * 0.17, left: width * 0.06 }]}>○</Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lavendra</Text>
            <Text style={styles.headerSub}>Hotel Management</Text>
          </View>

          {/* White card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Join us and manage your stay!</Text>

            {/* Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, nameFocused && styles.inputFocused]}
              placeholder="Enter your full name"
              placeholderTextColor="#B0B8D4"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="Enter your email"
              placeholderTextColor="#B0B8D4"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="Min 6 characters"
              placeholderTextColor="#B0B8D4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />

            {/* Register button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login link */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.replace("/login")}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#4A35BE",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 0,
  },

  /* Decorative elements */
  circle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circleSm: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circleTopRight: { top: -50, right: -40 },
  circleTopLeft: { top: 60, left: -60 },
  circleBottomLeft: { bottom: 380, left: 20 },
  circleBottomRight: { bottom: 340, right: 30 },
  deco: {
    position: "absolute",
    fontSize: 22,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "700",
  },
  decoSm: {
    position: "absolute",
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "700",
  },

  /* Header */
  header: {
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 36,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
  },

  /* White card */
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 50,
    shadowColor: "#2D1B8E",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1A1240",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#9095A8",
    marginBottom: 24,
  },

  /* Form */
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3D2FA0",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#F4F2FF",
    borderWidth: 1.5,
    borderColor: "#E2DEFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderRadius: 14,
    fontSize: 15,
    color: "#1A1240",
  },
  inputFocused: {
    borderColor: "#6C52F5",
    backgroundColor: "#EDEAFF",
  },

  /* Buttons */
  button: {
    backgroundColor: "#5B3FE4",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#5B3FE4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9B8FD6",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E5F5",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#A89EC8",
    fontSize: 13,
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: "#5B3FE4",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#5B3FE4",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});