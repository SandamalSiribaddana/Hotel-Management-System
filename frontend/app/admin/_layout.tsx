import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="rooms" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="services" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="complaints" />
      <Stack.Screen name="staff" />
    </Stack>
  );
}
