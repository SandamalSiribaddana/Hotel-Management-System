import { useEffect, useRef } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, Dimensions, Animated, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");
        
        // Wait for 2.5 seconds total before navigating
        setTimeout(() => {
          if (token && userStr) {
            const user = JSON.parse(userStr);
            if (user.role === "admin") {
              router.replace("/admin" as any);
            } else {
              router.replace("/(tabs)");
            }
          } else {
            router.replace("/login");
          }
        }, 2500);
      } catch (error) {
        setTimeout(() => {
          router.replace("/login");
        }, 2500);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.background}>
      {/* Decorative floating circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleTopLeft]} />
      <View style={[styles.circleSm, styles.circleBottomLeft]} />
      <View style={[styles.circleSm, styles.circleBottomRight]} />

      {/* Decorative stars */}
      <Text style={[styles.deco, { top: height * 0.15, left: width * 0.15 }]}>✦</Text>
      <Text style={[styles.deco, { top: height * 0.25, right: width * 0.15 }]}>✦</Text>
      <Text style={[styles.decoSm, { top: height * 0.75, right: width * 0.25 }]}>✦</Text>

      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Modern Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            {/* Note: using Ionicons as a placeholder until assets/logo.png is added */}
            <Ionicons name="business" size={64} color="#5B3FE4" />
          </View>
        </View>

        {/* Branding */}
        <Text style={styles.appName}>Lavendra Hotel</Text>
        <Text style={styles.tagline}>Comfort • Luxury • Experience</Text>

      </Animated.View>

      {/* Bottom Loading Indicator */}
      <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#4A35BE",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: "#2D1B8E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  bottomContainer: {
    position: "absolute",
    bottom: height * 0.08,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  /* Decorative elements (matched from login) */
  circle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circleSm: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circleTopRight: { top: -80, right: -60 },
  circleTopLeft: { top: 80, left: -100 },
  circleBottomLeft: { bottom: -40, left: -40 },
  circleBottomRight: { bottom: 120, right: -60 },
  deco: {
    position: "absolute",
    fontSize: 28,
    color: "rgba(255,255,255,0.4)",
  },
  decoSm: {
    position: "absolute",
    fontSize: 16,
    color: "rgba(255,255,255,0.3)",
  },
});