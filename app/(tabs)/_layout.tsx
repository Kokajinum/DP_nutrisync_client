import { Link, Stack, Tabs } from "expo-router";

import { HeaderButton } from "../../components/HeaderButton";
import { TabBarIcon } from "../../components/TabBarIcon";

export default function TabLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "black",
        }}>
        <Tabs.Screen
          name="HomeScreen"
          options={{
            title: "Home screen",
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Tab Twooo",
            tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
