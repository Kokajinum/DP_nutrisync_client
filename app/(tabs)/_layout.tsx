import { Stack, Tabs } from "expo-router";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GlobalColors } from "@/constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const activeTint = isDark
    ? GlobalColors.dark.bottomBarActiveTint
    : GlobalColors.light.bottomBarActiveTint;
  const inactiveTint = isDark
    ? GlobalColors.dark.bottomBarInactiveTint
    : GlobalColors.light.bottomBarInactiveTint;
  const barBackground = isDark
    ? GlobalColors.dark.bottomBarBarBackground
    : GlobalColors.light.bottomBarBarBackground;
  const borderTop = isDark
    ? GlobalColors.dark.bottomBarBorderTop
    : GlobalColors.light.bottomBarBorderTop;

  const createTwoButtonAlert = () =>
    Alert.alert("Alert Title", "My Alert Msg", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const handleOpenSheet = () => {
    createTwoButtonAlert();
    //bottomSheetRef.current?.present();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarShowLabel: false,
          tabBarStyle: { backgroundColor: barBackground, borderTopColor: borderTop },
        }}>
        <Tabs.Screen
          name="home-screen"
          options={{
            tabBarIcon: ({ color, size }) => <MaterialIcons name="house" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="food-diary-screen"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="library-books" size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="activity-diary-screen"
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="dumbbell" size={size} color={color} />
            ),
          }}></Tabs.Screen>

        <Tabs.Screen
          name="profile-screen"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={35} color={color} />
            ),
          }}></Tabs.Screen>
      </Tabs>
    </>
  );
}
