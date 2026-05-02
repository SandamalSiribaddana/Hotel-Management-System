import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");
        if (token && userStr) {
          const user = JSON.parse(userStr);
          if (user.role === "admin") {
            router.replace("/admin" as any);
          } else {
            router.replace("/(tabs)");
          }
        } else {
          router.replace("/login");
        }
      } catch (error) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  // Show a loading spinner while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A35BE",
  },
});