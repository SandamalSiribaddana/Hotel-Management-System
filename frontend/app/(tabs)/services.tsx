import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import API from "../../services/api";

export default function ServicesScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services");
      setServices(response.data.services);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text
        style={[
          styles.status,
          item.availability ? styles.available : styles.unavailable,
        ]}
      >
        {item.availability ? "Available" : "Currently Unavailable"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No services available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#F4F6FB" },
  listContainer: { padding: 15 },
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceName: { fontSize: 18, fontWeight: "800", color: "#1A1A2E", flex: 1 },
  price: { fontSize: 18, fontWeight: "bold", color: "#6C63FF", marginLeft: 10 },
  description: { fontSize: 14, color: "#888", marginBottom: 16, lineHeight: 20 },
  status: { fontSize: 13, fontWeight: "700", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start", overflow: "hidden" },
  available: { color: "#2DC653", backgroundColor: "#E6F9EC" },
  unavailable: { color: "#E63946", backgroundColor: "#FDECEA" },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
});
