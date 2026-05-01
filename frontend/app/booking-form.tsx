import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function BookingFormScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState("1");
  const [nicImage, setNicImage] = useState<any>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNicImage(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!fullName || !nicNumber || !phone || !email || !numberOfPersons || !nicImage) {
      Alert.alert("Error", "Please fill all fields and upload NIC image");
      return;
    }

    const nicRegex = /^([0-9]{9}[vV]|[0-9]{12})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!nicRegex.test(nicNumber)) {
      Alert.alert("Invalid NIC", "NIC should be 9 numbers followed by 'V' or 12 numbers");
      return;
    }

    if (!phoneRegex.test(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be exactly 10 digits");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    const maxPersons = parseInt(params.maxPersons as string, 10) || 1;
    const numPersons = parseInt(numberOfPersons, 10);

    if (isNaN(numPersons) || numPersons <= 0) {
      Alert.alert("Invalid Input", "Number of persons must be at least 1");
      return;
    }

    if (numPersons > maxPersons) {
      Alert.alert(
        "Capacity Exceeded", 
        `This ${params.roomType} room allows a maximum of ${maxPersons} person(s).`
      );
      return;
    }

    router.push({
      pathname: "/payment-invoice",
      params: {
        ...params,
        fullName,
        nicNumber,
        phone,
        email,
        numberOfPersons,
        nicImageUri: nicImage.uri,
        nicImageType: nicImage.type || "image/jpeg",
        nicImageName: nicImage.fileName || "nic.jpg",
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Details</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Room: {params.roomType} ({params.roomNumber})</Text>
        <Text style={styles.infoText}>Check-in: {params.checkInDate}</Text>
        <Text style={styles.infoText}>Check-out: {params.checkOutDate}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="John Doe" />
        
        <Text style={styles.label}>Identity Card Number (NIC)</Text>
        <TextInput style={styles.input} value={nicNumber} onChangeText={setNicNumber} placeholder="123456789V" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0712345678" />

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="john@example.com" />

        <Text style={styles.label}>Number of Persons</Text>
        <TextInput style={styles.input} value={numberOfPersons} onChangeText={setNumberOfPersons} keyboardType="numeric" />

        <Text style={styles.label}>NIC Image (Required)</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadBtnText}>{nicImage ? "Change Image" : "Upload NIC Photo"}</Text>
        </TouchableOpacity>
        
        {nicImage && (
          <Image source={{ uri: nicImage.uri }} style={styles.imagePreview} />
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FB", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A2E", marginBottom: 20 },
  infoCard: { backgroundColor: "#E6F9EC", padding: 15, borderRadius: 12, marginBottom: 20 },
  infoText: { fontSize: 16, color: "#2DC653", fontWeight: "600", marginBottom: 5 },
  form: { backgroundColor: "#fff", padding: 20, borderRadius: 16, elevation: 2, marginBottom: 40 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#E0E5F2", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: "#FAFAFA" },
  uploadBtn: { backgroundColor: "#E0E5F2", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 16 },
  uploadBtnText: { color: "#1A1A2E", fontWeight: "600" },
  imagePreview: { width: "100%", height: 200, borderRadius: 10, marginBottom: 16 },
  submitBtn: { backgroundColor: "#6C63FF", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
