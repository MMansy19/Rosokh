"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications, Notification } from "@/contexts/GlobalContext";

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      case "info":
        return "border-l-blue-500";
    }
  };

  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  return (
    <div
      className={`
        bg-background border border-border rounded-lg shadow-lg p-4 mb-3 border-l-4 ${getBorderColor()}
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl
        animate-in slide-in-from-right-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Utility function to create common notifications
export const createNotification = {
  success: (
    title: string,
    message?: string,
    action?: Notification["action"],
  ) => ({
    type: "success" as const,
    title,
    message,
    action,
  }),

  error: (
    title: string,
    message?: string,
    action?: Notification["action"],
  ) => ({
    type: "error" as const,
    title,
    message,
    action,
    duration: 0, // Don't auto-dismiss errors
  }),

  warning: (
    title: string,
    message?: string,
    action?: Notification["action"],
  ) => ({
    type: "warning" as const,
    title,
    message,
    action,
  }),

  info: (title: string, message?: string, action?: Notification["action"]) => ({
    type: "info" as const,
    title,
    message,
    action,
  }),
};
