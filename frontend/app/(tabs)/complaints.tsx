import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import API from "../../services/api";

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get("/complaints/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(response.data.complaints);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to fetch complaints",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setMessage("");
    setImageUri(null);
    setModalVisible(true);
  };

  const handleEdit = (complaint: any) => {
    setIsEditing(true);
    setCurrentId(complaint._id);
    setMessage(complaint.message);
    // Note: We don't load the existing image into the picker,
    // user can select a new one to replace it.
    setImageUri(null);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this complaint?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await API.delete(`/complaints/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Complaint deleted");
            fetchComplaints();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to delete",
            );
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Message is required");
      return;
    }

    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("message", message);

      if (imageUri) {
        const localUri = imageUri;
        const filename = localUri.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }

      if (isEditing && currentId) {
        await API.put(`/complaints/${currentId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert("Success", "Complaint updated successfully");
      } else {
        await API.post("/complaints", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert("Success", "Complaint submitted successfully");
      }

      setModalVisible(false);
      fetchComplaints();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (filename: string) => {
    const baseUrl = API.defaults.baseURL?.replace("/api", "");
    return `${baseUrl}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text
          style={[
            styles.status,
            item.status === "Pending" ? styles.pending : styles.resolved,
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>

      {item.image ? (
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={styles.complaintImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no complaints.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Complaint" : "New Complaint"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="What is your complaint?"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnText}>
                {imageUri ? "Change Image" : "Attach Image (Optional)"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#F4F6FB" },
  listContainer: { padding: 15, paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  date: { color: "#888", fontSize: 14, fontWeight: "500" },
  status: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  pending: { color: "#F77F00", backgroundColor: "#FFF3E0" },
  resolved: { color: "#2DC653", backgroundColor: "#E6F9EC" },
  message: { fontSize: 16, color: "#1A1A2E", marginBottom: 15, lineHeight: 22 },
  complaintImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F4F6FB",
    paddingTop: 12,
  },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#EEF0FF",
  },
  editBtnText: { color: "#6C63FF", fontWeight: "700" },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FDECEA",
  },
  deleteBtnText: { color: "#E63946", fontWeight: "700" },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6C63FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { fontSize: 30, color: "#fff", marginTop: -2 },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    color: "#1A1A2E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E5F2",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#1A1A2E",
  },
  imageBtn: {
    backgroundColor: "#F4F6FB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    borderStyle: "dashed",
  },
  imageBtnText: { color: "#6C63FF", fontWeight: "700" },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: {
    padding: 14,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#FDECEA" },
  confirmBtn: { backgroundColor: "#6C63FF" },
  cancelBtnText: { color: "#E63946", fontWeight: "bold", fontSize: 16 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
