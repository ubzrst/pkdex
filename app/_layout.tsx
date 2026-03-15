import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen
      name="index"
      options={{
        title: "Pokédex",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 24,
        },
      }} />
    <Stack.Screen
      name="[name]"
      options={{
        headerBackButtonDisplayMode: "minimal",
      }} />
  </Stack>;
}
