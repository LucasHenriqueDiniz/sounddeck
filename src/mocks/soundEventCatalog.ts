import type { EventFriendlyMeta } from "../types/soundEvent";

/**
 * Canonical Windows sound events, grouped into the six product categories.
 * Technical ids (`app`/`event`) match real HKCU\AppEvents\Schemes\Apps
 * aliases so this catalog stays consistent with what `scan_events` (the
 * real Tauri command) would actually return — only the presentation layer
 * (friendly name, description, category) is product-defined.
 */
export const SOUND_EVENT_CATALOG: EventFriendlyMeta[] = [
  // Sistema
  {
    id: { app: ".Default", event: "SystemAsterisk" },
    friendlyName: "System notice",
    description: "Plays when Windows shows a general piece of information.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemExclamation" },
    friendlyName: "System alert",
    description: "Plays for warnings that need attention but are not errors.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemHand" },
    friendlyName: "Critical error",
    description: "Plays for serious errors or blocked operations.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemQuestion" },
    friendlyName: "System question",
    description: "Plays in confirmation dialogs.",
    category: "system",
  },
  {
    id: { app: ".Default", event: ".Default" },
    friendlyName: "Default sound",
    description: "Generic sound used when no other event applies.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "MenuCommand" },
    friendlyName: "Menu command",
    category: "system",
  },

  // Notificações
  {
    id: { app: ".Default", event: "Notification.Default" },
    friendlyName: "Default notification",
    description: "Generic Windows toast.",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.IM" },
    friendlyName: "Instant message",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.Mail" },
    friendlyName: "New email",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.Reminder" },
    friendlyName: "Reminder",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.SMS" },
    friendlyName: "SMS received",
    category: "notifications",
  },

  // Dispositivos
  {
    id: { app: ".Default", event: "DeviceConnect" },
    friendlyName: "Device connected",
    description: "Plays when a USB or Bluetooth device is connected.",
    category: "devices",
  },
  {
    id: { app: ".Default", event: "DeviceDisconnect" },
    friendlyName: "Device disconnected",
    category: "devices",
  },
  {
    id: { app: ".Default", event: "DeviceFail" },
    friendlyName: "Device failure",
    description: "Plays when a device is not recognised.",
    category: "devices",
  },

  // Energia
  {
    id: { app: ".Default", event: "LowBatteryAlarm" },
    friendlyName: "Low battery",
    category: "power",
  },
  {
    id: { app: ".Default", event: "CriticalBatteryAlarm" },
    friendlyName: "Critical battery",
    description: "Plays when the charge is about to run out.",
    category: "power",
  },

  // Explorer
  {
    id: { app: ".Default", event: "Navigating" },
    friendlyName: "Explorer navigation",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "EmptyRecycleBin" },
    friendlyName: "Empty Recycle Bin",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "BlockedPopup" },
    friendlyName: "Pop-up blocked",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Open" },
    friendlyName: "Open program",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Close" },
    friendlyName: "Close program",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Minimize" },
    friendlyName: "Minimise window",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Maximize" },
    friendlyName: "Maximise window",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "RestoreUp" },
    friendlyName: "Restore window (maximised)",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "RestoreDown" },
    friendlyName: "Restore window (minimised)",
    category: "explorer",
  },

  // Sessão
  {
    id: { app: ".Default", event: "WindowsLogon" },
    friendlyName: "Windows logon",
    category: "session",
  },
  {
    id: { app: ".Default", event: "WindowsLogoff" },
    friendlyName: "Windows logoff",
    category: "session",
  },
  {
    id: { app: ".Default", event: "WindowsUAC" },
    friendlyName: "User Account Control",
    description: "Plays when administrative permission is requested.",
    category: "session",
  },
];
