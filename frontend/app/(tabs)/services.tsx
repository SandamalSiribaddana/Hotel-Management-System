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
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import API from "../../services/api";

const EMPTY_FORM = {
  customerName: "",
  customerId: "",
  phoneNumber: "",
};

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Form Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slipUri, setSlipUri] = useState<string | null>(null);
  const [slipName, setSlipName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services");
      // Only show available services to customers
      const availableServices = response.data.services.filter((s: any) => s.availability);
      setServices(availableServices);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    return `${process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.2.2:5000"}/${imagePath}`;
  };

  const openPaymentModal = (service: any) => {
    setSelectedService(service);
    setForm(EMPTY_FORM);
    setSlipUri(null);
    setSlipName(null);
    setModalVisible(true);
  };

  const pickSlip = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "File size must be less than 5MB");
          return;
        }
        setSlipUri(file.uri);
        setSlipName(file.name);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const submitRequest = async () => {
    if (!form.customerName || !form.customerId || !form.phoneNumber || !slipUri) {
      Alert.alert("Validation", "Please fill all fields and upload the payment slip.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("customerName", form.customerName);
      formData.append("customerId", form.customerId);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("serviceName", selectedService.name);
      formData.append("servicePrice", String(selectedService.price));

      const uriParts = slipUri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      
      let mimeType = `image/${fileType}`;
      if (fileType.toLowerCase() === 'pdf') mimeType = 'application/pdf';

      formData.append("paymentSlip", {
        uri: slipUri,
        name: slipName || `slip.${fileType}`,
        type: mimeType,
      } as any);

      const token = await AsyncStorage.getItem("token");
      await API.post("/service-payments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      Alert.alert("Success", "Service request submitted successfully! Pending approval.");
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: getImageUrl(item.image) }} style={styles.serviceImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={32} color="#aaa" />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        
        <TouchableOpacity style={styles.buyBtn} onPress={() => openPaymentModal(item)}>
          <Text style={styles.buyBtnText}>Buy Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* My Requests Header Button */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Available Services</Text>
        <TouchableOpacity
          style={styles.myRequestsBtn}
          onPress={() => router.push("/my-service-requests" as any)}
        >
          <Ionicons name="receipt-outline" size={16} color="#fff" />
          <Text style={styles.myRequestsBtnText}>My Requests</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No available services at the moment.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Request {selectedService?.name}</Text>
            <Text style={styles.modalSubtitle}>Price: ${selectedService?.price}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: "customerName", label: "Customer Name *", placeholder: "e.g. John Doe" },
                { key: "customerId", label: "ID / NIC *", placeholder: "e.g. 123456789V" },
                { key: "phoneNumber", label: "Phone Number *", placeholder: "e.g. 0712345678", keyboard: "phone-pad" },
              ].map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                    keyboardType={(f.keyboard as any) || "default"}
                  />
                </View>
              ))}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Payment Slip (JPG, PNG, PDF) *</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickSlip}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#6C63FF" />
                  <Text style={styles.uploadBtnText}>
                    {slipName ? slipName : "Select Payment Slip"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#6C63FF" }]} onPress={submitRequest} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Submit</Text>}
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F3FF" },
  container: { flex: 1, backgroundColor: "#F5F3FF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2DEFF",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1240",
  },
  myRequestsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B3FE4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  myRequestsBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  listContainer: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  serviceImage: { width: "100%", height: 160, resizeMode: "cover" },
  placeholderImage: { width: "100%", height: 160, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceName: { fontSize: 18, fontWeight: "800", color: "#1A1A2E", flex: 1 },
  price: { fontSize: 18, fontWeight: "bold", color: "#6C63FF", marginLeft: 10 },
  description: { fontSize: 14, color: "#888", marginBottom: 16, lineHeight: 20 },
  buyBtn: { backgroundColor: "#6C63FF", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A2E", marginBottom: 4 },
  modalSubtitle: { fontSize: 16, fontWeight: "600", color: "#6C63FF", marginBottom: 16 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: "#E0E0E0",
    borderRadius: 10, padding: 12,
    fontSize: 15, color: "#1A1A2E",
    backgroundColor: "#FAFAFA",
  },
  uploadBtn: {
    borderWidth: 1.5, borderColor: "#E0E0E0", borderStyle: "dashed",
    borderRadius: 10, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FAFAFA", gap: 10,
  },
  uploadBtnText: { color: "#6C63FF", fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 16, marginBottom: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E0E0E0", alignItems: "center",
  },
  cancelText: { color: "#888", fontWeight: "700" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
