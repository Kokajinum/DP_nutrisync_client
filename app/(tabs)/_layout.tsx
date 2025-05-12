import { Link, Stack, Tabs } from "expo-router";

import { HeaderButton } from "../../components/HeaderButton";
import { TabBarIcon } from "../../components/TabBarIcon";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet } from "react-native";
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
        {/* <Tabs.Screen
          name="quick-actions"
          options={{
            tabBarButton: () => (
              <Pressable onPress={handleOpenSheet} style={styles.fabButton}>
                <MaterialIcons name="add-circle" size={50} color="#007AFF" />
              </Pressable>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleOpenSheet();
            },
          }}></Tabs.Screen> */}

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

// const styles = StyleSheet.create({
//   fabButton: {
//     position: "absolute",
//     top: -20,
//     alignSelf: "center",
//     zIndex: 10,
//   },
// });
