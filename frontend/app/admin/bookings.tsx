import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Pending Payment":   { bg: "#FFF8E1", text: "#F77F00" },
  "Pending Admin Approval": { bg: "#E3F2FD", text: "#1976D2" },
  "Confirmed": { bg: "#E6F9EC", text: "#2DC653" },
  "Cancelled": { bg: "#FDECEA", text: "#E63946" },
  "Completed": { bg: "#F3E5F5", text: "#9C27B0" },
  "Pending Verification": { bg: "#FFF8E1", text: "#F77F00" },
  "Verified": { bg: "#E6F9EC", text: "#2DC653" },
  "Rejected": { bg: "#FDECEA", text: "#E63946" },
  "No Payment": { bg: "#F5F5F5", text: "#757575" },
};

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await API.get("/bookings", { headers });
      setBookings(res.data.bookings || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const headers = await getHeaders();
      await API.put(`/bookings/${id}`, { status: newStatus }, { headers });
      fetchBookings();
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    const baseUrl = API.defaults.baseURL?.replace("/api", "") || "http://172.28.19.108:5000";
    return `${baseUrl}/uploads/${path}`;
  };

  const approveBookingAndPayment = async (bookingId: string, paymentId: string | null) => {
    try {
      const headers = await getHeaders();
      if (paymentId) {
        await API.put(`/payments/${paymentId}`, { status: "Verified" }, { headers });
      }
      await API.put(`/bookings/${bookingId}`, { status: "Confirmed" }, { headers });
      fetchBookings();
    } catch (error) {
      Alert.alert("Error", "Failed to approve booking and verify payment");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Bookings</Text>
        <TouchableOpacity onPress={fetchBookings} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00B4D8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No bookings found.</Text>}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS["Pending Payment"];
            const psc = STATUS_COLORS[item.paymentStatus] || STATUS_COLORS["No Payment"];
            
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.bookingId}>
                    <Ionicons name="receipt-outline" size={14} color="#00B4D8" />
                    <Text style={styles.idText}>
                      {item._id ? item._id.slice(-6).toUpperCase() : "——"}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={15} color="#888" />
                  <Text style={styles.infoText}>
                    {item.fullName || item.userId?.name || "Guest"} ({item.nicNumber || "No NIC"})
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="bed-outline" size={15} color="#888" />
                  <Text style={styles.infoText}>
                    Room: {item.roomId?.roomNumber || "—"} ({item.roomId?.roomType || "—"})
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={15} color="#888" />
                  <Text style={styles.infoText}>
                    Total: ${item.totalAmount} (Half: ${item.halfPayment})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={15} color="#888" />
                  <Text style={styles.infoText}>
                    Payment: <Text style={{ color: psc.text, fontWeight: "bold" }}>{item.paymentStatus}</Text>
                  </Text>
                </View>

                {item.paymentSlip && (
                  <TouchableOpacity 
                    style={styles.viewSlipBtn} 
                    onPress={() => {
                      setSelectedSlipUrl(getFullImageUrl(item.paymentSlip));
                      setModalVisible(true);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={16} color="#00B4D8" />
                    <Text style={styles.viewSlipText}>View Payment Slip</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.dateRow}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    <Text style={styles.dateValue}>{formatDate(item.checkInDate)}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#bbb" />
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    <Text style={styles.dateValue}>{formatDate(item.checkOutDate)}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  {item.status === "Pending Admin Approval" && (
                    <TouchableOpacity style={styles.approveBtn} onPress={() => approveBookingAndPayment(item._id, item.paymentId)}>
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === "Confirmed" && (
                    <TouchableOpacity style={[styles.approveBtn, {backgroundColor: '#9C27B0'}]} onPress={() => updateBookingStatus(item._id, "Completed")}>
                      <Text style={styles.approveBtnText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => updateBookingStatus(item._id, "Cancelled")}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          }}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            {selectedSlipUrl ? (
              <Image source={{ uri: selectedSlipUrl }} style={styles.slipImage} resizeMode="contain" />
            ) : (
              <Text>No image available</Text>
            )}
          </View>
        </View>
      </Modal>
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
  refreshBtn: {},
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  bookingId: { flexDirection: "row", alignItems: "center", gap: 6 },
  idText: { fontWeight: "800", color: "#00B4D8", fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontWeight: "700", fontSize: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  infoText: { color: "#444", fontSize: 14, fontWeight: "500" },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
    backgroundColor: "#F4F6FB",
    borderRadius: 10,
    padding: 12,
  },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 11, color: "#999", fontWeight: "600", marginBottom: 2 },
  dateValue: { fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  actionsRow: { flexDirection: "row", marginTop: 15, justifyContent: "space-between" },
  approveBtn: { backgroundColor: "#2DC653", padding: 10, borderRadius: 8, flex: 1, marginRight: 5, alignItems: "center" },
  approveBtnText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#E63946", padding: 10, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: "center" },
  cancelBtnText: { color: "#fff", fontWeight: "bold" },
  viewSlipBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#E3F2FD", borderRadius: 8, alignSelf: "flex-start" },
  viewSlipText: { color: "#00B4D8", fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "70%", backgroundColor: "#fff", borderRadius: 16, padding: 10, alignItems: "center", justifyContent: "center" },
  closeModalBtn: { position: "absolute", top: 10, right: 10, zIndex: 10, padding: 5, backgroundColor: "#f0f0f0", borderRadius: 20 },
  slipImage: { width: "100%", height: "100%", borderRadius: 10 },
});
