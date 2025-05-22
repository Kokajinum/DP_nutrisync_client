import { useContext } from "react";
import NotificationsContext from "@/context/NotificationsProvider";

/**
 * Hook to access the notifications context
 * @returns The notifications context
 */
export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }

  return context;
}
