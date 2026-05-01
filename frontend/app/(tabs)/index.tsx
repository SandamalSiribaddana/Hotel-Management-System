import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

function AnimatedButton({
  onPress,
  label,
  sublabel,
  delay,
  accentColor,
  icon,
}: {
  onPress: () => void;
  label: string;
  sublabel: string;
  delay: number;
  accentColor: string;
  icon: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { opacity, transform: [{ translateY: slideY }, { scale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          style={styles.card}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: accentColor + "22" }]}
          >
            <Text style={[styles.cardIcon, { color: accentColor }]}>{icon}</Text>
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardSublabel}>{sublabel}</Text>
          </View>
          <View style={[styles.arrow, { borderColor: accentColor + "66" }]}>
            <Text style={[styles.arrowText, { color: accentColor }]}>›</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>("");

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-30)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const logoutOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || user.username || user.email || "Guest");
        }
      } catch {}
    };
    loadUser();

    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoutOpacity, {
        toValue: 1,
        duration: 800,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orb1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, {
          toValue: 1,
          duration: 5500,
          useNativeDriver: true,
        }),
        Animated.timing(orb2, {
          toValue: 0,
          duration: 5500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const orb1TranslateY = orb1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });
  const orb2TranslateY = orb2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      Alert.alert("Goodbye", "You have been signed out.");
      router.replace("/login");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0a0a1a", "#0d1528", "#0a0a1a"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1TranslateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: orb2TranslateY }] },
        ]}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, transform: [{ translateY: headerY }] },
        ]}
      >
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>HOTEL MANAGEMENT</Text>
          </View>
        </View>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{userName || "Guest"}</Text>
        <Text style={styles.subheading}>
          Manage your property with ease
        </Text>
      </Animated.View>

      {/* Divider */}
      <Animated.View style={[styles.divider, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={["transparent", "#C9A96E", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dividerLine}
        />
      </Animated.View>

      {/* Action Cards */}
      <View style={styles.cards}>
        <AnimatedButton
          onPress={() => router.navigate("/(tabs)/rooms")}
          label="Room Directory"
          sublabel="Browse & manage all rooms"
          delay={300}
          accentColor="#C9A96E"
          icon="⬛"
        />
        <AnimatedButton
          onPress={() => router.navigate("/(tabs)/bookings")}
          label="Reservations"
          sublabel="View & track bookings"
          delay={480}
          accentColor="#7EB8C9"
          icon="⬛"
        />
      </View>

      {/* Sign Out */}
      <Animated.View style={[styles.logoutWrapper, { opacity: logoutOpacity }]}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.18,
  },
  orb1: {
    width: 320,
    height: 320,
    backgroundColor: "#C9A96E",
    top: -80,
    right: -100,
  },
  orb2: {
    width: 260,
    height: 260,
    backgroundColor: "#4466BB",
    bottom: 60,
    left: -100,
  },
  header: {
    marginBottom: 28,
  },
  tagRow: {
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C9A96E",
  },
  tagText: {
    color: "#C9A96E",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
  greeting: {
    fontSize: 18,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "300",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.3,
    fontWeight: "400",
  },
  divider: {
    marginBottom: 32,
  },
  dividerLine: {
    height: 1,
    width: "100%",
  },
  cards: {
    flex: 1,
    gap: 16,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTouchable: {
    borderRadius: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTextGroup: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
    marginBottom: 3,
  },
  cardSublabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.42)",
    fontWeight: "400",
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "300",
    marginTop: -2,
  },
  logoutWrapper: {
    alignItems: "center",
    marginTop: 24,
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  logoutText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});