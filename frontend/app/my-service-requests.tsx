import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import API from "../services/api";

// ─── Theme ────────────────────────────────────────────────────────
const C = {
  purple: "#5B3FE4",
  purpleDark: "#4A35BE",
  purpleLight: "#EDE9FF",
  bg: "#F5F3FF",
  card: "#FFFFFF",
  text: "#1A1240",
  muted: "#9095A8",
  border: "#E2DEFF",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  "Pending Approval": {
    label: "Waiting for admin approval",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "time-outline",
  },
  Approved: {
    label: "Your service request has been approved",
    color: "#16A34A",
    bg: "#DCFCE7",
    icon: "checkmark-circle-outline",
  },
  Rejected: {
    label: "Your service request has been rejected",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "close-circle-outline",
  },
};

export default function MyServiceRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    API.defaults.baseURL?.replace("/api", "") || "http://10.0.2.2:5000";

  const getSlipUrl = (slipPath: string) => {
    if (!slipPath) return null;
    if (slipPath.startsWith("http")) return slipPath;
    return `${baseUrl}/${slipPath.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be logged in to view your requests.");
        router.replace("/login");
        return;
      }
      const response = await API.get("/service-payments/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.servicePayments || []);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to load your service requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["Pending Approval"];
    const slipUrl = getSlipUrl(item.paymentSlip);
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <View style={styles.card}>
        {/* Service name & price */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.date}>Requested on {date}</Text>
          </View>
          <Text style={styles.price}>${item.servicePrice}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Customer info row */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color={C.muted} />
          <Text style={styles.infoText}>{item.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={14} color={C.muted} />
          <Text style={styles.infoText}>{item.phoneNumber}</Text>
        </View>

        {/* Payment Slip preview */}
        {slipUrl && (
          <View style={styles.slipWrap}>
            <Text style={styles.slipLabel}>Payment Slip</Text>
            {slipUrl.endsWith(".pdf") ? (
              <View style={styles.pdfBox}>
                <Ionicons name="document-outline" size={28} color={C.purple} />
                <Text style={styles.pdfText}>PDF document attached</Text>
              </View>
            ) : (
              <Image
                source={{ uri: slipUrl }}
                style={styles.slipImage}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.purple} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Service Requests</Text>
        <TouchableOpacity onPress={fetchMyRequests} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color={C.purple} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={56} color="#C4B8F0" />
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptySubtitle}>
              You have not made any service requests yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4, marginRight: 10 },
  refreshBtn: { padding: 4, marginLeft: "auto" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    flex: 1,
  },

  listContainer: { padding: 16, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: C.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  date: { fontSize: 12, color: C.muted },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: C.purple,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoText: { fontSize: 13, color: C.muted },

  // Slip
  slipWrap: { marginTop: 12, marginBottom: 12 },
  slipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slipImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: C.purpleLight,
  },
  pdfBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.purpleLight,
    padding: 14,
    borderRadius: 12,
  },
  pdfText: { color: C.purple, fontWeight: "600", fontSize: 14 },

  // Status
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },

  // Empty state
  emptyWrap: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
