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

    // On Android, we need to create a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Check if we're running on a physical device
    if (Device.isDevice) {
      // Check if we already have permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If we don't have permission, ask for it
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      // If we don't have permission, return
      if (finalStatus !== "granted") {
        alert("Nepodařilo se získat oprávnění pro push notifikace!");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      // Get the token
      try {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        token = pushToken.data;
        setExpoPushToken(token);

        // Register token with server if user is logged in
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
    // Set up notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      // we just need to open the app, which happens automatically
    });

    // Check permission status on mount
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    })();

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Register push token when user logs in and permissions are granted
  useEffect(() => {
    if (user && permissionStatus === "granted" && !expoPushToken) {
      registerForPushNotifications();
    }
  }, [permissionStatus, expoPushToken]);

  // // Re-register token when it changes
  // useEffect(() => {
  //   if (expoPushToken && user) {
  //     const registerToken = async () => {
  //       try {
  //         const deviceId = `${Device.deviceName || "unknown"}-${Device.modelName || "unknown"}`;
  //         const deviceName = Device.deviceName || "unknown";

  //         await registerPushToken(restManager, expoPushToken, deviceId, deviceName);
  //       } catch (error) {
  //         console.error("Error registering push token:", error);
  //       }
  //     };

  //     registerToken();
  //   }
  // }, [expoPushToken, user, restManager]);

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
