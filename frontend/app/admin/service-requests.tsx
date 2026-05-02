import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";

export default function AdminServiceRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get("/service-payments");
      setRequests(res.data.servicePayments || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateStatus = (id: string, status: string) => {
    Alert.alert("Confirm", `Are you sure you want to mark this request as ${status}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await API.put(`/service-payments/${id}/status`, { status });
            Alert.alert("Success", `Request ${status.toLowerCase()}`);
            fetchRequests();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Failed to update status");
          }
        },
      },
    ]);
  };

  const openSlip = (slipPath: string) => {
    const url = `${process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.2.2:5000"}/${slipPath}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open slip"));
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Requests</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8338EC" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No service requests found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.serviceName}</Text>
                <Text style={styles.cardPrice}>${item.servicePrice}</Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailText}>Customer: {item.customerName}</Text>
                <Text style={styles.detailText}>NIC: {item.customerId}</Text>
                <Text style={styles.detailText}>Phone: {item.phoneNumber}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={[styles.statusText, 
                  item.status === 'Approved' ? styles.statusApproved : 
                  item.status === 'Rejected' ? styles.statusRejected : 
                  styles.statusPending]}>
                  {item.status}
                </Text>
                <TouchableOpacity onPress={() => openSlip(item.paymentSlip)} style={styles.slipBtn}>
                  <Text style={styles.slipBtnText}>View Slip</Text>
                </TouchableOpacity>
              </View>

              {item.status === "Pending Approval" && (
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleUpdateStatus(item._id, "Approved")} style={styles.approveBtn}>
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateStatus(item._id, "Rejected")} style={styles.rejectBtn}>
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6FB" },
  header: {
    backgroundColor: "#1A1A2E",
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 20, fontWeight: "800" },
  list: { padding: 20, gap: 14 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A2E" },
  cardPrice: { fontSize: 16, fontWeight: "700", color: "#8338EC" },
  details: { marginBottom: 12 },
  detailText: { fontSize: 14, color: "#555", marginBottom: 4 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusText: { fontSize: 13, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: "hidden" },
  statusApproved: { backgroundColor: "#E6F9EC", color: "#2DC653" },
  statusRejected: { backgroundColor: "#FDECEA", color: "#E63946" },
  statusPending: { backgroundColor: "#FFF3E0", color: "#F77F00" },
  slipBtn: { padding: 6 },
  slipBtnText: { color: "#007bff", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12 },
  approveBtn: { flex: 1, backgroundColor: "#2DC653", padding: 12, borderRadius: 8, alignItems: "center" },
  rejectBtn: { flex: 1, backgroundColor: "#E63946", padding: 12, borderRadius: 8, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
