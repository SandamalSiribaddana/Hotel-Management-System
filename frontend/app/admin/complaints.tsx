import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FFF8E1", text: "#F77F00" },
  Resolved: { bg: "#E6F9EC", text: "#2DC653" },
};

export default function AdminComplaintsScreen() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const getImageUrl = (filename: string) => {
    if (!filename) return undefined;
    if (filename.startsWith("http")) return filename;
    const baseUrl = API.defaults.baseURL?.replace("/api", "") || "";
    // Handle both stored as filename-only and full path
    if (filename.startsWith("/")) return `${baseUrl}${filename}`;
    return `${baseUrl}/uploads/${filename}`;
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await API.get("/complaints", { headers });
      setComplaints(res.data.complaints || []);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to load complaints",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const headers = await getHeaders();
      await API.put(`/complaints/${id}`, { status: newStatus }, { headers });
      setSelected(null);
      fetchComplaints();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (c: any) => {
    Alert.alert(
      "Delete Complaint",
      "Are you sure you want to delete this complaint?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await getHeaders();
              await API.delete(`/complaints/${c._id}`, { headers });
              fetchComplaints();
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message || "Failed to delete.",
              );
            }
          },
        },
      ],
    );
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints</Text>
        <TouchableOpacity onPress={fetchComplaints}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#E63946"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No complaints found. 🎉</Text>
          }
          renderItem={({ item }) => {
            const sm = STATUS_META[item.status] || STATUS_META.Pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: sm.bg }]}
                  >
                    <Text style={[styles.statusText, { color: sm.text }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.message} numberOfLines={4}>
                  {item.message}
                </Text>
                {item.image ? (
                  <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.complaintImage}
                    resizeMode="cover"
                  />
                ) : null}
                {item.userId && (
                  <View style={styles.userRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={15}
                      color="#aaa"
                    />
                    <Text style={styles.userName}>
                      {item.userId.name || item.userId.email || "User"}
                    </Text>
                  </View>
                )}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.statusBtn}
                    onPress={() => setSelected(item)}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={15}
                      color="#6C63FF"
                    />
                    <Text style={styles.statusBtnText}>Update Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={15} color="#E63946" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Text style={styles.modalMsg} numberOfLines={5}>
              {selected?.message}
            </Text>
            {selected?.image ? (
              <Image
                source={{ uri: getImageUrl(selected.image) }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.modalLabel}>Choose new status:</Text>
            <View style={styles.statusRow}>
              {["Pending", "Resolved"].map((s) => {
                const sm = STATUS_META[s];
                const isCurrent = selected?.status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusChoice,
                      isCurrent && {
                        backgroundColor: sm.bg,
                        borderColor: sm.text,
                      },
                    ]}
                    onPress={() => handleUpdateStatus(selected._id, s)}
                    disabled={updating}
                  >
                    <Text
                      style={[
                        styles.statusChoiceText,
                        isCurrent && { color: sm.text },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {updating && (
              <ActivityIndicator color="#6C63FF" style={{ marginTop: 10 }} />
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontWeight: "700", fontSize: 12 },
  dateText: { fontSize: 12, color: "#aaa", fontWeight: "600" },
  message: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 10 },
  complaintImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  userName: { fontSize: 12, color: "#aaa", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EEF0FF",
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusBtnText: { color: "#6C63FF", fontWeight: "700", fontSize: 13 },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FDECEA",
    paddingVertical: 10,
    borderRadius: 10,
  },
  deleteBtnText: { color: "#E63946", fontWeight: "700", fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  modalMsg: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    backgroundColor: "#F4F6FB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  statusChoice: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  statusChoiceText: { fontWeight: "700", color: "#888", fontSize: 15 },
  closeBtn: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F4F6FB",
    alignItems: "center",
    marginBottom: 8,
  },
  closeText: { color: "#888", fontWeight: "700" },
});
