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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";
import { formatCurrency } from "../../utils/currency";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get("/bookings/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (bookingId: string) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await API.delete(`/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchBookings();
            } catch (error: any) {
              Alert.alert("Error", error?.response?.data?.message || "Failed to delete booking");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const checkIn = new Date(item.checkInDate).toLocaleDateString();
    const checkOut = new Date(item.checkOutDate).toLocaleDateString();
    
    let statusColor = "#F77F00";
    let statusBg = "#FFF3E0";
    if (item.status === "Confirmed" || item.status === "Completed") {
      statusColor = "#2DC653";
      statusBg = "#E6F9EC";
    } else if (item.status === "Cancelled") {
      statusColor = "#E63946";
      statusBg = "#FDECEA";
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.roomInfo}>
            Room {item.roomId?.roomNumber} - {item.roomId?.roomType}
          </Text>
          <Text style={styles.dateInfo}>
            {checkIn} to {checkOut} ({item.numberOfNights} nights)
          </Text>
          <Text style={styles.dateInfo}>Persons: {item.numberOfPersons}</Text>
          <Text style={[styles.status, { color: statusColor, backgroundColor: statusBg }]}>
            {item.status}
          </Text>
          <Text style={styles.price}>Total: {formatCurrency(item.totalAmount)}</Text>
          
          {(item.status === "Completed" || item.status === "Cancelled") && (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no bookings.</Text>}
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
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: { padding: 20 },
  roomInfo: { fontSize: 18, fontWeight: "800", color: "#1A1A2E", marginBottom: 6 },
  dateInfo: { fontSize: 14, color: "#888", marginBottom: 8 },
  status: { fontSize: 13, fontWeight: "700", color: "#F77F00", marginBottom: 8, backgroundColor: "#FFF3E0", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start", overflow: "hidden" },
  price: { fontSize: 16, fontWeight: "bold", color: "#6C63FF", marginTop: 4 },
  deleteBtn: { marginTop: 12, backgroundColor: "#FDECEA", paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  deleteBtnText: { color: "#E63946", fontWeight: "bold", fontSize: 14 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
});
