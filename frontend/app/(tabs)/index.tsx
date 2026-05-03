import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// ─── Theme colours ────────────────────────────────────────────────
const PURPLE = "#4A35BE";
const PURPLE_MID = "#5B3FE4";
const PURPLE_LIGHT = "#8B7CF6";
const LAVENDER = "#EDE9FF";
const WHITE = "#FFFFFF";

// ─── Nav card data ────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Rooms",
    sublabel: "Browse & book available rooms",
    image: require("../../assets/images/rooms.png"),
    accentColor: "#7C3AED",
    route: "/(tabs)/rooms",
  },
  {
    label: "My Bookings",
    sublabel: "View & manage your reservations",
    image: require("../../assets/images/bookings.png"),
    accentColor: "#5B3FE4",
    route: "/(tabs)/bookings",
  },
  {
    label: "Services",
    sublabel: "Explore hotel amenities",
    image: require("../../assets/images/services.png"),
    accentColor: "#8B5CF6",
    route: "/(tabs)/services",
  },
  {
    label: "Complaints",
    sublabel: "Submit & track your complaints",
    image: require("../../assets/images/complaints.png"),
    accentColor: "#A78BFA",
    route: "/(tabs)/complaints",
  },
];

function AnimatedCard({
  item,
  delay,
}: {
  item: (typeof NAV_ITEMS)[0];
  delay: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 550,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    router.navigate(item.route as any);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { opacity, transform: [{ translateY: slideY }, { scale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.card}
      >
        <View style={[styles.iconBox, { backgroundColor: item.accentColor + "18" }]}>
          <Image source={item.image} style={styles.cardImageIcon} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardSub}>{item.sublabel}</Text>
        </View>
        <View style={[styles.chevron, { borderColor: item.accentColor + "50" }]}>
          <Text style={[styles.chevronText, { color: item.accentColor }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>("");

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-24)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;
  const logoutOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || user.username || user.email || "Guest");
        }
      } catch { }
    };
    loadUser();

    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(logoutOpacity, { toValue: 1, duration: 700, delay: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orbTranslateY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });

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
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#3B28A8", "#5B3FE4", "#7C5CE4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated decorative orb */}
      <Animated.View
        style={[styles.orb, { transform: [{ translateY: orbTranslateY }] }]}
      />

      {/* Decorative circles */}
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}
      >
        <View style={styles.tagRow}>
          <View style={styles.tagDot} />
          <Text style={styles.tagText}>LAVENDRA HOTEL</Text>
        </View>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{userName || "Guest"} 👋</Text>
        <Text style={styles.subheading}>What would you like to do today?</Text>
      </Animated.View>

      {/* White card area with nav grid */}
      <View style={styles.cardArea}>
        {NAV_ITEMS.map((item, i) => (
          <AnimatedCard key={item.label} item={item} delay={300 + i * 120} />
        ))}

        {/* Sign Out */}
        <Animated.View style={[styles.logoutWrap, { opacity: logoutOpacity }]}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },

  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -80,
    right: -80,
  },
  decoCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: 100,
    left: -60,
  },
  decoCircle2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: 60,
    right: 30,
  },

  header: {
    paddingHorizontal: 28,
    paddingTop: 68,
    paddingBottom: 32,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  tagText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "400",
    marginBottom: 2,
  },
  name: {
    fontSize: 32,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "400",
  },

  cardArea: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  cardWrap: {
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: WHITE,
    shadowColor: "#4A35BE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
    borderRadius: 18,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageIcon: { width: 28, height: 28, resizeMode: "contain" },
  cardText: { flex: 1 },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1240",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: "#9095A8",
    fontWeight: "400",
  },
  chevron: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronText: { fontSize: 20, fontWeight: "300", marginTop: -2 },

  logoutWrap: { alignItems: "center", marginTop: 8, marginBottom: 4 },
  logoutBtn: {
    paddingVertical: 11,
    paddingHorizontal: 30,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "#C4B8F0",
    backgroundColor: "rgba(91,63,228,0.06)",
  },
  logoutText: {
    color: "#7C5CE4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});