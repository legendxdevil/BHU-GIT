"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  FileText,
  History,
  Info,
  Check,
  Trash2,
  CheckCheck,
  Zap,
  Radio,
  ExternalLink,
  X,
} from "lucide-react";
import { useNotifications, RealtimeNotification, NotificationType } from "@/lib/realtime/notification-context";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "conflicts">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isRtdbConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    broadcastTestEvent,
  } = useNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "conflicts") return n.type === "conflict";
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "conflict":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "evidence":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "version":
        return <History className="w-4 h-4 text-emerald-600" />;
      case "ocr":
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-slate" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge status="conflict" label="Critical" icon={false} className="text-[9px] py-0 px-1.5" />;
      case "high":
        return <Badge status="pending" label="High" icon={false} className="text-[9px] py-0 px-1.5" />;
      case "medium":
        return <Badge status="info" label="Medium" icon={false} className="text-[9px] py-0 px-1.5" />;
      default:
        return <Badge status="info" label="Low" icon={false} className="text-[9px] py-0 px-1.5" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Realtime Notification Center"
        className={clsx(
          "p-2 rounded-pill transition-colors relative flex items-center justify-center",
          isOpen ? "bg-blush-light text-sienna" : "text-slate hover:text-ink hover:bg-fog"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-sienna text-paper text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-paper shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Drawer Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-paper border border-mist rounded-2xl shadow-editorial z-50 overflow-hidden flex flex-col max-h-[550px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Bar */}
          <div className="p-3.5 bg-fog/60 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-ink">Notifications</h3>
              {isRtdbConnected ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  RTDB Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                  <Zap className="w-3 h-3 text-amber-600" />
                  Event Stream
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={broadcastTestEvent}
                title="Broadcast Test Realtime Event"
                className="p-1 rounded-lg text-slate hover:text-sienna hover:bg-blush-light text-xs flex items-center gap-1 transition-colors font-medium px-2 border border-mist"
              >
                <Zap className="w-3 h-3 text-sienna" />
                <span>Test Alert</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate hover:text-ink hover:bg-mist/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between px-3 py-2 bg-paper border-b border-mist text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={clsx(
                  "px-2.5 py-1 rounded-pill font-semibold transition-colors",
                  activeTab === "all" ? "bg-ink text-paper" : "text-slate hover:text-ink hover:bg-fog"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={clsx(
                  "px-2.5 py-1 rounded-pill font-semibold transition-colors",
                  activeTab === "unread" ? "bg-sienna text-paper" : "text-slate hover:text-ink hover:bg-fog"
                )}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("conflicts")}
                className={clsx(
                  "px-2.5 py-1 rounded-pill font-semibold transition-colors",
                  activeTab === "conflicts" ? "bg-rose-600 text-paper" : "text-slate hover:text-ink hover:bg-fog"
                )}
              >
                Conflicts
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                className="text-sienna hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notification List Body */}
          <div className="overflow-y-auto flex-1 divide-y divide-mist">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-ash mx-auto opacity-50" />
                <p className="text-xs text-slate font-medium">No notifications in this filter.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={clsx(
                    "p-3.5 flex items-start gap-3 transition-colors hover:bg-fog/50 relative group",
                    !n.read ? "bg-blush-light/30" : "bg-paper"
                  )}
                >
                  {/* Icon Indicator */}
                  <div className="p-2 rounded-xl bg-fog border border-mist mt-0.5 shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif font-bold text-xs text-ink truncate">{n.title}</span>
                      {getPriorityBadge(n.priority)}
                    </div>
                    <p className="text-[11px] text-slate leading-snug break-words">{n.message}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-ash">
                      <span>{formatRelativeTime(n.timestamp)}</span>

                      <div className="flex items-center gap-2">
                        {n.actionUrl && (
                          <Link
                            href={n.actionUrl}
                            onClick={() => {
                              markAsRead(n.id);
                              setIsOpen(false);
                            }}
                            className="text-sienna hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <span>Action</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            title="Mark as read"
                            className="text-slate hover:text-emerald-600 p-0.5 rounded transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(n.id)}
                          title="Remove notification"
                          className="text-slate hover:text-rose-600 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sienna absolute top-3.5 right-3" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Options */}
          {notifications.length > 0 && (
            <div className="p-2 bg-fog/60 border-t border-mist flex items-center justify-between text-xs px-3">
              <span className="text-[11px] text-slate font-medium">
                {notifications.length} total event{notifications.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={clearAll}
                className="text-slate hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
