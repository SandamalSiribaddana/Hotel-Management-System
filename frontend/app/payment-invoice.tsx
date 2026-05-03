import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function PaymentInvoiceScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [payslip, setPayslip] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Calculate invoice
  const checkIn = new Date(params.checkInDate as string);
  const checkOut = new Date(params.checkOutDate as string);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const price = Number(params.price);
  const totalAmount = numberOfNights * price;
  const halfPayment = totalAmount / 2;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPayslip(result.assets[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payslip) {
      Alert.alert("Error", "Please upload your bank deposit payslip");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      
      // Step 1: Create Booking
      const bookingFormData = new FormData();
      bookingFormData.append("roomId", params.roomId as string);
      bookingFormData.append("fullName", params.fullName as string);
      bookingFormData.append("nicNumber", params.nicNumber as string);
      bookingFormData.append("phone", params.phone as string);
      bookingFormData.append("email", params.email as string);
      bookingFormData.append("numberOfPersons", params.numberOfPersons as string);
      bookingFormData.append("checkInDate", params.checkInDate as string);
      bookingFormData.append("checkOutDate", params.checkOutDate as string);
      


      const bookingResponse = await API.post("/bookings/create-with-nic", bookingFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const bookingId = bookingResponse.data.booking._id;

      // Step 2: Upload Slip
      const paymentFormData = new FormData();
      paymentFormData.append("bookingId", bookingId);
      paymentFormData.append("amount", halfPayment.toString());
      paymentFormData.append("paymentMethod", "Online");
      
      paymentFormData.append("paymentSlip", {
        uri: payslip.uri,
        name: payslip.name || "payslip.pdf",
        type: payslip.mimeType || "application/pdf",
      } as any);

      await API.post("/payments/upload-slip", paymentFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Booking and Payment submitted successfully! Awaiting Admin Approval.");
      router.replace("/(tabs)/bookings");
      
    } catch (error: any) {
      console.error(error?.response?.data || error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to process booking and payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Invoice & Payment</Text>
      
      <View style={styles.invoiceCard}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.row}><Text style={styles.label}>Customer:</Text><Text style={styles.value}>{params.fullName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>NIC Number:</Text><Text style={styles.value}>{params.nicNumber}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Room:</Text><Text style={styles.value}>{params.roomType} ({params.roomNumber})</Text></View>
        <View style={styles.row}><Text style={styles.label}>Check-in:</Text><Text style={styles.value}>{params.checkInDate}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Check-out:</Text><Text style={styles.value}>{params.checkOutDate}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Nights:</Text><Text style={styles.value}>{numberOfNights}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Price/Night:</Text><Text style={styles.value}>${price}</Text></View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}><Text style={styles.totalLabel}>Total Payment:</Text><Text style={styles.totalValue}>${totalAmount}</Text></View>
        <View style={styles.row}><Text style={styles.halfLabel}>Half Payment (Required):</Text><Text style={styles.halfValue}>${halfPayment}</Text></View>
      </View>

      <View style={styles.uploadCard}>
        <Text style={styles.sectionTitle}>Upload Payslip</Text>
        <Text style={styles.desc}>Please deposit ${halfPayment} to our bank account and upload the receipt here (PDF or Image).</Text>
        
        <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
          <Text style={styles.uploadBtnText}>{payslip ? "Change Document" : "Select Payslip"}</Text>
        </TouchableOpacity>

        {payslip && (
          <Text style={styles.fileName}>Selected: {payslip.name}</Text>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmPayment} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Confirm Payment</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FB", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A2E", marginBottom: 20 },
  invoiceCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A2E", marginBottom: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { fontSize: 14, color: "#555" },
  value: { fontSize: 14, color: "#1A1A2E", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E0E5F2", marginVertical: 15 },
  totalLabel: { fontSize: 16, color: "#1A1A2E", fontWeight: "700" },
  totalValue: { fontSize: 16, color: "#1A1A2E", fontWeight: "700" },
  halfLabel: { fontSize: 18, color: "#6C63FF", fontWeight: "800" },
  halfValue: { fontSize: 18, color: "#6C63FF", fontWeight: "800" },
  uploadCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, elevation: 2, marginBottom: 40 },
  desc: { fontSize: 14, color: "#555", marginBottom: 15, lineHeight: 20 },
  uploadBtn: { backgroundColor: "#E0E5F2", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  uploadBtnText: { color: "#1A1A2E", fontWeight: "600" },
  fileName: { fontSize: 12, color: "#2DC653", marginBottom: 15, textAlign: "center" },
  submitBtn: { backgroundColor: "#2DC653", padding: 16, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
