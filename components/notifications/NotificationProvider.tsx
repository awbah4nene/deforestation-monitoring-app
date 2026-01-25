"use client";

import { useEffect, useState, createContext, useContext } from "react";
import NotificationBell from "./NotificationBell";

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const refreshNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=1&unreadOnly=true");
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshNotifications();

    // Set up Server-Sent Events for real-time updates
    if (typeof window !== "undefined") {
      let es: EventSource | null = null;
      
      try {
        es = new EventSource("/api/notifications/stream");
        
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "notification") {
              refreshNotifications();
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        };

        es.onerror = (error) => {
          console.error("SSE error:", error);
          // Reconnect after delay
          setTimeout(() => {
            if (es) {
              es.close();
              setEventSource(null);
            }
          }, 5000);
        };

        setEventSource(es);
      } catch (error) {
        console.error("Error setting up SSE:", error);
      }

      return () => {
        if (es) {
          es.close();
        }
      };
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Export NotificationBell for use in navigation
export { NotificationBell };
