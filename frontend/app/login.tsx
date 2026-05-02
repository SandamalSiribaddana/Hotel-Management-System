import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user?.role;
      Alert.alert("Success", "Login successful");
      if (role === "admin") {
        router.replace("/admin" as any);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Server error or wrong credentials"
      );
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

        {/* Decorative stars / plus signs */}
        <Text style={[styles.deco, { top: height * 0.08, left: width * 0.12 }]}>✦</Text>
        <Text style={[styles.deco, { top: height * 0.14, right: width * 0.08 }]}>✦</Text>
        <Text style={[styles.decoSm, { top: height * 0.22, right: width * 0.22 }]}>✦</Text>
        <Text style={[styles.decoSm, { top: height * 0.06, right: width * 0.35 }]}>○</Text>
        <Text style={[styles.decoSm, { top: height * 0.18, left: width * 0.05 }]}>○</Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header area */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lavendra</Text>
            <Text style={styles.headerSub}>Hotel Management</Text>
          </View>

          {/* White card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardSubtitle}>Welcome back! Please sign in.</Text>

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
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="Enter your password"
              placeholderTextColor="#B0B8D4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />



            {/* Login button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push("/register")}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Sign Up</Text>
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
  circleBottomLeft: { bottom: 320, left: 20 },
  circleBottomRight: { bottom: 280, right: 30 },
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

  /* Header above card */
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
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
    marginBottom: 28,
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
    marginBottom: 16,
    borderRadius: 14,
    fontSize: 15,
    color: "#1A1240",
  },
  inputFocused: {
    borderColor: "#6C52F5",
    backgroundColor: "#EDEAFF",
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    color: "#6C52F5",
    fontWeight: "600",
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
    marginBottom: 20,
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
    fontSize: 16,
    letterSpacing: 0.5,
  },
});