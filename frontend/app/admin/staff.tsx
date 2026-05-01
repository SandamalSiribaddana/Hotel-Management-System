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

const EMPTY = { name: "", role: "", phone: "", email: "", salary: "" };

export default function AdminStaffScreen() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await API.get("/staff", { headers });
      setStaff(res.data.staff || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalVisible(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name,
      role: s.role,
      phone: s.phone,
      email: s.email,
      salary: String(s.salary),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.phone || !form.email || !form.salary) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }
    setSaving(true);
    try {
      const headers = await getHeaders();
      const payload = { ...form, salary: Number(form.salary) };
      if (editing) {
        await API.put(`/staff/${editing._id}`, payload, { headers });
        Alert.alert("Success", "Staff updated.");
      } else {
        await API.post("/staff", payload, { headers });
        Alert.alert("Success", "Staff added.");
      }
      setModalVisible(false);
      fetchStaff();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s: any) => {
    Alert.alert("Delete Staff", `Remove ${s.name} from staff?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await API.delete(`/staff/${s._id}`, { headers });
            fetchStaff();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Failed to delete.");
          }
        },
      },
    ]);
  };

  const ROLE_COLORS: Record<string, string> = {
    Manager: "#6C63FF",
    Receptionist: "#00B4D8",
    Housekeeping: "#F77F00",
    Security: "#E63946",
    Chef: "#2DC653",
  };

  const getRoleColor = (role: string) =>
    ROLE_COLORS[role] || "#9B2335";

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Staff</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9B2335" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No staff records. Add one!</Text>}
          renderItem={({ item }) => {
            const color = getRoleColor(item.role);
            return (
              <View style={styles.card}>
                <View style={[styles.avatar, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.avatarText, { color }]}>
                    {item.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: color + "22" }]}>
                      <Text style={[styles.roleText, { color }]}>{item.role}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={13} color="#aaa" />
                    <Text style={styles.infoText}>{item.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={13} color="#aaa" />
                    <Text style={styles.infoText}>{item.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={13} color="#aaa" />
                    <Text style={styles.infoText}>${item.salary}/month</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <Ionicons name="pencil-outline" size={15} color="#6C63FF" />
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={15} color="#E63946" />
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Edit Staff" : "Add Staff"}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: "name", label: "Full Name *", placeholder: "e.g. John Smith" },
                { key: "role", label: "Role *", placeholder: "e.g. Receptionist" },
                { key: "phone", label: "Phone *", placeholder: "e.g. +1 234 567 890", keyboard: "phone-pad" },
                { key: "email", label: "Email *", placeholder: "e.g. john@hotel.com", keyboard: "email-address" },
                { key: "salary", label: "Monthly Salary *", placeholder: "e.g. 2000", keyboard: "numeric" },
              ].map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                    keyboardType={(f.keyboard as any) || "default"}
                    autoCapitalize="none"
                  />
                </View>
              ))}
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
    backgroundColor: "#9B2335",
    width: 36, height: 36,
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
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 52, height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: "900" },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: "800", color: "#1A1A2E" },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  infoText: { fontSize: 12, color: "#666" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#EEF0FF",
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: { color: "#6C63FF", fontWeight: "700", fontSize: 13 },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#FDECEA",
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: { color: "#E63946", fontWeight: "700", fontSize: 13 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
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
    borderWidth: 1.5, borderColor: "#E0E0E0",
    borderRadius: 10, padding: 12,
    fontSize: 15, color: "#1A1A2E",
    backgroundColor: "#FAFAFA",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E0E0E0", alignItems: "center",
  },
  cancelText: { color: "#888", fontWeight: "700" },
  saveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#9B2335", alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
