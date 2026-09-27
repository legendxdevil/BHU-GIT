"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase/client";
import { ref, onValue, push, set } from "firebase/database";
import { useToast } from "@/components/ui/Toast";

export type NotificationType = "conflict" | "version" | "evidence" | "ocr" | "system";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  parcelId?: string;
}

interface NotificationContextType {
  notifications: RealtimeNotification[];
  unreadCount: number;
  isRtdbConnected: boolean;
  pushNotification: (notif: Omit<RealtimeNotification, "id" | "timestamp" | "read">) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  broadcastTestEvent: () => Promise<void>;
}

const INITIAL_NOTIFICATIONS: RealtimeNotification[] = [
  {
    id: "notif-101",
    title: "Overlapping Boundary Conflict Detected",
    message: "High-priority spatial overlap (111.2 m²) detected between P-1004 and P-1003 in Ward 12.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: "conflict",
    priority: "critical",
    read: false,
    actionUrl: "/conflicts",
    parcelId: "P-1004",
  },
  {
    id: "notif-102",
    title: "New Survey Evidence Uploaded",
    message: "Field Officer B uploaded high-precision GNSS survey dataset for Ward 12 (CSV format).",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    type: "evidence",
    priority: "high",
    read: false,
    actionUrl: "/data-sources",
    parcelId: "P-1001",
  },
  {
    id: "notif-103",
    title: "OCR Registry Deed Processed",
    message: "Automated OCR extracted deed attributes with 94.2% confidence for Parcel P-1002.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: "ocr",
    priority: "medium",
    read: true,
    actionUrl: "/documents",
    parcelId: "P-1002",
  },
  {
    id: "notif-104",
    title: "Version V-1003-2 Approved",
    message: "Review Officer A committed harmonized boundary version V-1003-2 to master ledger.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: "version",
    priority: "low",
    read: true,
    actionUrl: "/history",
    parcelId: "P-1003",
  },
];

const STORAGE_KEY = "bhugit_notifications";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isRtdbConnected, setIsRtdbConnected] = useState(false);
  const { toast } = useToast();

  // Load initial / stored notifications
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch (e) {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  }, []);

  // Save to localStorage when notifications change
  const updateNotifications = (newList: RealtimeNotification[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn("Could not save notifications to storage:", e);
    }
  };

  // Firebase Realtime Database Listener
  useEffect(() => {
    if (rtdb && rtdb.app?.options?.databaseURL && !rtdb.app.options.databaseURL.includes("mock-app")) {
      try {
        const notifRef = ref(rtdb, "notifications");
        const unsubscribe = onValue(
          notifRef,
          (snapshot) => {
            setIsRtdbConnected(true);
            const val = snapshot.val();
            if (val) {
              const liveItems: RealtimeNotification[] = Object.entries(val).map(([key, item]: [string, any]) => ({
                id: key,
                title: item.title || "Realtime Alert",
                message: item.message || "",
                timestamp: item.timestamp || new Date().toISOString(),
                type: item.type || "system",
                priority: item.priority || "medium",
                read: !!item.read,
                actionUrl: item.actionUrl,
                parcelId: item.parcelId,
              }));

              // Sort newest first
              liveItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              setNotifications(liveItems);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(liveItems));
            }
          },
          (err) => {
            console.warn("RTDB notification subscription fallback:", err.message);
            setIsRtdbConnected(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firebase RTDB listener unavailable, using local event bus:", err);
        setIsRtdbConnected(false);
      }
    } else {
      setIsRtdbConnected(false);
    }
  }, []);

  const pushNotification = async (notifData: Omit<RealtimeNotification, "id" | "timestamp" | "read">) => {
    const newNotif: RealtimeNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Push to Firebase RTDB if live
    if (rtdb && isRtdbConnected) {
      try {
        const notifListRef = ref(rtdb, "notifications");
        const newRef = push(notifListRef);
        await set(newRef, newNotif);
      } catch (err) {
        console.warn("Could not write to Firebase RTDB, pushing to local state:", err);
      }
    }

    // Update local state
    const updated = [newNotif, ...notifications];
    updateNotifications(updated);

    // Trigger toast notification on screen
    toast(
      notifData.priority === "critical" ? "error" : notifData.priority === "high" ? "warning" : "info",
      notifData.title,
      notifData.message
    );
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    updateNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    updateNotifications(updated);
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    updateNotifications(updated);
  };

  const clearAll = () => {
    updateNotifications([]);
  };

  const broadcastTestEvent = async () => {
    const types: NotificationType[] = ["conflict", "version", "evidence", "ocr", "system"];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const mockEvents: Record<NotificationType, { title: string; message: string; priority: NotificationPriority; actionUrl: string }> = {
      conflict: {
        title: "Realtime Spatial Conflict Alert",
        message: "Overlap detected between Parcel P-1004 and newly ingested survey layer.",
        priority: "critical",
        actionUrl: "/conflicts",
      },
      version: {
        title: "Cadastral Version Ledger Update",
        message: "Harmonized Parcel Version V-1003-2 successfully committed to master database.",
        priority: "medium",
        actionUrl: "/history",
      },
      evidence: {
        title: "Live Ingestion Stream Active",
        message: "New high-density point cloud uploaded by Geospatial Field Survey Wing.",
        priority: "high",
        actionUrl: "/data-sources",
      },
      ocr: {
        title: "Automated OCR Extraction Finished",
        message: "Extracted deed metadata with 96.8% confidence score.",
        priority: "medium",
        actionUrl: "/documents",
      },
      system: {
        title: "System Synchronization Complete",
        message: "All spatial layers synchronized with central cadastral ledger.",
        priority: "low",
        actionUrl: "/dashboard",
      },
    };

    const evt = mockEvents[randomType];
    await pushNotification({
      title: evt.title,
      message: evt.message,
      type: randomType,
      priority: evt.priority,
      actionUrl: evt.actionUrl,
      parcelId: "P-1004",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isRtdbConnected,
        pushNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        broadcastTestEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
