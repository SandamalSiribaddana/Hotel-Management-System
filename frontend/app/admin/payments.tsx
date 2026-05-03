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
import { formatCurrency } from "../../utils/currency";

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await API.get("/payments", { headers });
      setPayments(res.data.payments || []);
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    const baseUrl = API.defaults.baseURL?.replace("/api", "") || "http://172.28.19.108:5000";
    return `${baseUrl}/uploads/${path}`;
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Payments</Text>
        <TouchableOpacity onPress={fetchPayments}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.revenueBanner}>
        <View>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueAmount}>{formatCurrency(totalRevenue)}</Text>
        </View>
        <View style={styles.revenueIcon}>
          <Ionicons name="trending-up-outline" size={28} color="#2DC653" />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2DC653" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No payments found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.bookingId}>
                  <Ionicons name="receipt-outline" size={14} color="#2DC653" />
                  <Text style={styles.idText}>
                    {item.bookingId ? item.bookingId.slice(-6).toUpperCase() : "——"}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={15} color="#888" />
                <Text style={styles.infoText}>
                  {item.customerName} ({item.nic})
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="bed-outline" size={15} color="#888" />
                <Text style={styles.infoText}>
                  Room: {item.roomNumber} ({item.roomType})
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={15} color="#888" />
                <Text style={styles.infoText}>
                  Total: {formatCurrency(item.totalAmount)} (Paid: {formatCurrency(item.paidAmount)})
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={15} color="#888" />
                <Text style={styles.infoText}>
                  Payment: <Text style={{ color: "#2DC653", fontWeight: "bold" }}>{item.paymentStatus}</Text>
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
                  <Ionicons name="document-text-outline" size={16} color="#2DC653" />
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
              
              <Text style={styles.completedDate}>
                Completed on {formatDate(item.completedDate)}
              </Text>

            </View>
          )}
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
  revenueBanner: {
    margin: 20,
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: { color: "#aaa", fontSize: 13, marginBottom: 4 },
  revenueAmount: { color: "#2DC653", fontSize: 28, fontWeight: "900" },
  revenueIcon: {
    backgroundColor: "#E6F9EC",
    width: 52, height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 15 },
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
  idText: { fontWeight: "800", color: "#2DC653", fontSize: 14 },
  statusBadge: { backgroundColor: "#E6F9EC", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#2DC653", fontWeight: "700", fontSize: 12 },
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
  completedDate: { textAlign: "right", fontSize: 11, color: "#999", marginTop: 10, fontStyle: "italic" },
  viewSlipBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#E6F9EC", borderRadius: 8, alignSelf: "flex-start" },
  viewSlipText: { color: "#2DC653", fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "70%", backgroundColor: "#fff", borderRadius: 16, padding: 10, alignItems: "center", justifyContent: "center" },
  closeModalBtn: { position: "absolute", top: 10, right: 10, zIndex: 10, padding: 5, backgroundColor: "#f0f0f0", borderRadius: 20 },
  slipImage: { width: "100%", height: "100%", borderRadius: 10 },
});
