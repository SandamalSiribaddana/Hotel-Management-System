import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const MENU_ITEMS = [
  {
    key: "rooms",
    label: "Manage Rooms",
    icon: "bed-outline" as const,
    color: "#6C63FF",
    bg: "#EEF0FF",
    route: "/admin/rooms",
  },
  {
    key: "bookings",
    label: "All Bookings",
    icon: "calendar-outline" as const,
    color: "#00B4D8",
    bg: "#E0F8FF",
    route: "/admin/bookings",
  },
  {
    key: "services",
    label: "Manage Services",
    icon: "construct-outline" as const,
    color: "#F77F00",
    bg: "#FFF3E0",
    route: "/admin/services",
  },
  {
    key: "payments",
    label: "All Payments",
    icon: "card-outline" as const,
    color: "#2DC653",
    bg: "#E6F9EC",
    route: "/admin/payments",
  },
  {
    key: "complaints",
    label: "Complaints",
    icon: "chatbubble-ellipses-outline" as const,
    color: "#E63946",
    bg: "#FDECEA",
    route: "/admin/complaints",
  },
  {
    key: "staff",
    label: "Manage Staff",
    icon: "people-outline" as const,
    color: "#9B2335",
    bg: "#F9EEF0",
    route: "/admin/staff",
  },
];

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const load = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role !== "admin") {
            Alert.alert("Access Denied", "Admins only.");
            router.replace("/login");
          }
          setAdminName(user.name || "Admin");
        }
      } catch (_) {}
    };
    load();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "user"]);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.adminName}>{adminName}</Text>
          <Text style={styles.role}>Administrator</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Label */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <Text style={styles.sectionSub}>Manage your hotel operations</Text>
      </View>

      {/* Menu Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#bbb" />
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  header: {
    backgroundColor: "#1A1A2E",
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 2,
  },
  adminName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  role: {
    color: "#6C63FF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E63946",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  sectionSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
});
