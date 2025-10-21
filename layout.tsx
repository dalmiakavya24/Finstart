import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: true, title: 'Lesson' }} />
        <Stack.Screen name="simulation/[type]" options={{ headerShown: true, title: 'Simulation' }} />
      </Stack>
    </>
  );
}
