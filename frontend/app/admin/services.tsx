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

const EMPTY = { name: "", description: "", price: "" };

export default function AdminServicesScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await API.get("/services");
      setServices(res.data.services || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalVisible(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description, price: String(s.price) });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await API.put(`/services/${editing._id}`, payload);
        Alert.alert("Success", "Service updated.");
      } else {
        await API.post("/services", payload);
        Alert.alert("Success", "Service added.");
      }
      setModalVisible(false);
      fetchServices();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s: any) => {
    Alert.alert("Delete", `Delete "${s.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/services/${s._id}`);
            fetchServices();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Failed to delete.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F77F00" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No services found. Add one!</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="construct-outline" size={22} color="#F77F00" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                  <Ionicons name="pencil-outline" size={18} color="#F77F00" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#E63946" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Edit Service" : "Add Service"}</Text>
            <ScrollView>
              {[
                { key: "name", label: "Service Name *", placeholder: "e.g. Spa" },
                { key: "description", label: "Description *", placeholder: "Service details", multi: true },
                { key: "price", label: "Price *", placeholder: "e.g. 50", keyboard: "numeric" },
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
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#F77F00" }]} onPress={handleSave} disabled={saving}>
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
    backgroundColor: "#F77F00",
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A2E", marginBottom: 2 },
  cardDesc: { fontSize: 12, color: "#888", marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#F77F00" },
  actions: { flexDirection: "row", gap: 8, marginLeft: 10 },
  editBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
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
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
