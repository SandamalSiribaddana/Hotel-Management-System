import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EMPTY_ROOM = {
  roomNumber: "",
  roomType: "",
  price: "",
  maxPersons: "",
  description: "",
  availabilityStatus: "available",
};

export default function AdminRoomsScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_ROOM);
  const [saving, setSaving] = useState(false);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await API.get("/rooms");
      setRooms(res.data.rooms || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_ROOM);
    setModalVisible(true);
  };

  const openEdit = (room: any) => {
    setEditing(room);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: String(room.price),
      maxPersons: String(room.maxPersons || ""),
      description: room.description,
      availabilityStatus: room.availabilityStatus,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.roomNumber || !form.roomType || !form.price || !form.maxPersons || !form.description) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      const headers = await getHeaders();
      const payload = {
        ...form,
        price: Number(form.price),
        maxPersons: Number(form.maxPersons),
      };
      if (editing) {
        await API.put(`/rooms/${editing._id}`, payload, { headers });
        Alert.alert("Success", "Room updated.");
      } else {
        await API.post("/rooms", payload, { headers });
        Alert.alert("Success", "Room created.");
      }
      setModalVisible(false);
      fetchRooms();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save room.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (room: any) => {
    Alert.alert("Delete Room", `Delete Room ${room.roomNumber}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await API.delete(`/rooms/${room._id}`, { headers });
            fetchRooms();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Failed to delete.");
          }
        },
      },
    ]);
  };

  const statusColor = (s: string) => s === "available" ? "#2DC653" : "#E63946";

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Rooms</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No rooms found. Add one!</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.roomBadge}>
                  <Text style={styles.roomNumber}>#{item.roomNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.availabilityStatus) + "22" }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.availabilityStatus) }]}>
                    {item.availabilityStatus === "booked" ? "Not Available" : "Available"}
                  </Text>
                </View>
              </View>
              <Text style={styles.roomType}>{item.roomType}</Text>
              <Text style={styles.roomDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaItem}>💰 ${item.price}/night</Text>
                <Text style={styles.metaItem}>👥 {item.maxPersons} guests</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="pencil-outline" size={16} color="#6C63FF" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color="#E63946" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Edit Room" : "Add Room"}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: "roomNumber", label: "Room Number *", placeholder: "e.g. 101" },
                { key: "roomType", label: "Room Type *", placeholder: "e.g. Deluxe" },
                { key: "price", label: "Price per Night *", placeholder: "e.g. 150", keyboard: "numeric" },
                { key: "maxPersons", label: "Capacity *", placeholder: "e.g. 2", keyboard: "numeric" },
                { key: "description", label: "Description *", placeholder: "Room details", multi: true },
              ].map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={[styles.input, f.multi && { height: 80 }]}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                    keyboardType={(f.keyboard as any) || "default"}
                    multiline={!!f.multi}
                  />
                </View>
              ))}

              <Text style={styles.fieldLabel}>Availability Status</Text>
              <View style={styles.toggleRow}>
                {["available", "booked"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.toggleBtn,
                      form.availabilityStatus === s && styles.toggleActive,
                    ]}
                    onPress={() => setForm((p) => ({ ...p, availabilityStatus: s }))}
                  >
                    <Text style={[styles.toggleText, form.availabilityStatus === s && styles.toggleTextActive]}>
                      {s === "booked" ? "Not Available" : "Available"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  addBtn: {
    backgroundColor: "#6C63FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  roomBadge: {
    backgroundColor: "#EEF0FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomNumber: { color: "#6C63FF", fontWeight: "800", fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontWeight: "700", fontSize: 12 },
  roomType: { fontSize: 17, fontWeight: "800", color: "#1A1A2E", marginBottom: 4 },
  roomDesc: { fontSize: 13, color: "#777", marginBottom: 10 },
  cardMeta: { flexDirection: "row", gap: 16, marginBottom: 12 },
  metaItem: { fontSize: 13, color: "#555", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EEF0FF",
    paddingVertical: 10,
    borderRadius: 10,
  },
  editText: { color: "#6C63FF", fontWeight: "700" },
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
  deleteText: { color: "#E63946", fontWeight: "700" },
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
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1A1A2E",
    backgroundColor: "#FAFAFA",
  },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 20, marginTop: 6 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  toggleText: { fontWeight: "700", color: "#888" },
  toggleTextActive: { color: "#fff" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelText: { color: "#888", fontWeight: "700" },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
