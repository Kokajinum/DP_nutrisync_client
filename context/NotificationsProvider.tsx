import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerPushToken } from "@/utils/api/apiClient";
import { useRestManager } from "@/context/RestManagerProvider";
import { useAuth } from "@/context/AuthProvider";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationsContextType {
  expoPushToken?: string;
  permissionStatus?: string;
  registerForPushNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [permissionStatus, setPermissionStatus] = useState<string | undefined>(undefined);
  const restManager = useRestManager();
  const { user } = useAuth();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    let token;

    // Notification channel on Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        alert("Nepodařilo se získat oprávnění pro push notifikace!");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }

      try {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        token = pushToken.data;
        setExpoPushToken(token);

        if (token && user) {
          try {
            const deviceId = `${Device.deviceName || "unknown"}-${Device.modelName || "unknown"}`;
            const deviceName = Device.deviceName || "unknown";

            const success = await registerPushToken(restManager, token, deviceId, deviceName);

            if (!success) {
              console.error("Failed to register push token with server");
            } else {
              console.log("Push token registered successfully");
            }
          } catch (error) {
            console.error("Error during push token registration:", error);
          }
        }
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    } else {
      alert("Pro push notifikace je nutné používat fyzické zařízení");
    }
  }, [user, restManager, setExpoPushToken, setPermissionStatus]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
    });

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    })();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  useEffect(() => {
    if (user && permissionStatus === "granted" && !expoPushToken) {
      registerForPushNotifications();
    }
  }, [permissionStatus, expoPushToken]);

  return (
    <NotificationsContext.Provider
      value={{
        expoPushToken,
        permissionStatus,
        registerForPushNotifications,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
