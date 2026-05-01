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
import API from "../../services/api";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RoomsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Date states for booking
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await API.get("/rooms");
      setRooms(response.data.rooms);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (room: any) => {
    setSelectedRoom(room);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
    setModalVisible(true);
  };

  const submitBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert("Error", "Please provide check-in and check-out dates");
      return;
    }

    const checkInStr = checkInDate.toISOString().split("T")[0];
    const checkOutStr = checkOutDate.toISOString().split("T")[0];

    setBookingLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.post(
        "/bookings/check-availability",
        {
          roomId: selectedRoom._id,
          checkInDate: checkInStr,
          checkOutDate: checkOutStr,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.available) {
        setModalVisible(false);
        router.push({
          pathname: "/booking-form",
          params: {
            roomId: selectedRoom._id,
            roomNumber: selectedRoom.roomNumber,
            roomType: selectedRoom.roomType,
            price: selectedRoom.price,
            maxPersons: selectedRoom.maxPersons,
            checkInDate: checkInStr,
            checkOutDate: checkOutStr,
          }
        });
      }
    } catch (error: any) {
      Alert.alert("Not Available", error?.response?.data?.message || "Room is already booked for these dates.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.roomType}>{item.roomType}</Text>
              <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
              <Text style={styles.price}>${item.price} / night</Text>
              <Text style={styles.capacity}>Capacity: {item.maxPersons} persons</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text
                style={[
                  styles.status,
                  item.availabilityStatus === "available" ? styles.available : styles.booked,
                ]}
              >
                {item.availabilityStatus === "booked" ? "NOT AVAILABLE" : item.availabilityStatus.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                item.availabilityStatus !== "available" && styles.buttonDisabled,
              ]}
              onPress={() => handleBookPress(item)}
              disabled={item.availabilityStatus !== "available"}
            >
              <Text style={styles.buttonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No rooms available.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Room {selectedRoom?.roomNumber}</Text>
            
            <Text style={styles.label}>Check-in Date:</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowCheckInPicker(true)}>
              <Text style={styles.input}>{checkInDate.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>
            {showCheckInPicker && (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                minimumDate={new Date()}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowCheckInPicker(false);
                  if (selectedDate) setCheckInDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Check-out Date:</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowCheckOutPicker(true)}>
              <Text style={styles.input}>{checkOutDate.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>
            {showCheckOutPicker && (
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                minimumDate={checkInDate}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowCheckOutPicker(false);
                  if (selectedDate) setCheckOutDate(selectedDate);
                }}
              />
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
                onPress={submitBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Confirm</Text>
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
  roomType: { fontSize: 20, fontWeight: "800", color: "#1A1A2E" },
  roomNumber: { fontSize: 14, color: "#888", marginTop: 2 },
  price: { fontSize: 18, fontWeight: "bold", color: "#6C63FF", marginTop: 8 },
  capacity: { fontSize: 14, color: "#555", marginTop: 4 },
  desc: { fontSize: 14, color: "#777", marginTop: 8 },
  status: { marginTop: 12, fontWeight: "700", fontSize: 13, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', overflow: 'hidden' },
  available: { color: "#2DC653", backgroundColor: "#E6F9EC" },
  booked: { color: "#E63946", backgroundColor: "#FDECEA" },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
  
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
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 15, color: "#1A1A2E" },
  label: { fontSize: 14, color: "#333", marginBottom: 5, fontWeight: "600" },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E0E5F2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  input: { fontSize: 16, color: "#1A1A2E" },
  note: { fontSize: 12, color: "#888", marginBottom: 20, fontStyle: "italic" },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { padding: 14, borderRadius: 12, width: "48%", alignItems: "center" },
  cancelBtn: { backgroundColor: "#FDECEA" },
  confirmBtn: { backgroundColor: "#6C63FF" },
  cancelBtnText: { color: "#E63946", fontWeight: "bold", fontSize: 16 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
