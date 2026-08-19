import type { SoundPack } from "../types/pack";
import type { EventAssignmentState, PackEventAssignment } from "../types/soundEvent";

function a(
  event: string,
  state: EventAssignmentState,
  fileName?: string,
  durationMs?: number,
): PackEventAssignment {
  return { eventId: { app: ".Default", event }, state, fileName, durationMs };
}

/** None of the hand-authored packs below assign window-action sounds — added later than the rest of the catalog. */
function defaultWindowActions(): PackEventAssignment[] {
  return ["Open", "Close", "Minimize", "Maximize", "RestoreUp", "RestoreDown"].map((event) =>
    a(event, "default"),
  );
}

/** Windows XP — "Default" scheme (2001). */
const xpAssignments: PackEventAssignment[] = [
  a("SystemAsterisk", "pack", "chimes.wav", 1500),
  a("SystemExclamation", "pack", "chord.wav", 900),
  a("SystemHand", "pack", "chord.wav", 900),
  a("SystemQuestion", "pack", "chimes.wav", 1500),
  a(".Default", "pack", "ding.wav", 300),
  a("MenuCommand", "pack", "menu-command.wav", 200),
  a("Notification.Default", "pack", "notify.wav", 700),
  a("Notification.IM", "pack", "notify.wav", 700),
  a("Notification.Mail", "pack", "newmail.wav", 1200),
  a("Notification.Reminder", "pack", "reminder.wav", 1400),
  a("Notification.SMS", "default"),
  a("DeviceConnect", "pack", "hardware-insert.wav", 900),
  a("DeviceDisconnect", "pack", "hardware-remove.wav", 900),
  a("DeviceFail", "pack", "hardware-fail.wav", 1100),
  a("LowBatteryAlarm", "pack", "low-battery.wav", 1800),
  a("CriticalBatteryAlarm", "pack", "critical-battery.wav", 2200),
  a("Navigating", "pack", "start-navigation.wav", 400),
  a("EmptyRecycleBin", "pack", "recycle.wav", 1300),
  a("BlockedPopup", "pack", "notify.wav", 700),
  ...defaultWindowActions(),
  a("WindowsLogon", "pack", "tada.wav", 4200),
  a("WindowsLogoff", "pack", "logoff.wav", 3200),
  a("WindowsUAC", "default"),
];

/** Windows Vista — "Windows Default" scheme (2006). */
const vistaAssignments: PackEventAssignment[] = [
  a("SystemAsterisk", "pack", "Windows Information Bar.wav", 1900),
  a("SystemExclamation", "pack", "Windows Exclamation.wav", 1100),
  a("SystemHand", "pack", "Windows Critical Stop.wav", 1600),
  a("SystemQuestion", "pack", "Windows Question.wav", 1700),
  a(".Default", "pack", "Windows Ding.wav", 350),
  a("MenuCommand", "pack", "Windows Menu Command.wav", 250),
  a("Notification.Default", "pack", "Windows Notify.wav", 1300),
  a("Notification.IM", "pack", "Windows Notify Messaging.wav", 1300),
  a("Notification.Mail", "pack", "Windows Notify Email.wav", 1500),
  a("Notification.Reminder", "pack", "Windows Reminder.wav", 1600),
  a("Notification.SMS", "pack", "Windows Notify Messaging.wav", 1300),
  a("DeviceConnect", "pack", "Windows Hardware Insert.wav", 1200),
  a("DeviceDisconnect", "pack", "Windows Hardware Remove.wav", 1200),
  a("DeviceFail", "pack", "Windows Hardware Fail.wav", 1400),
  a("LowBatteryAlarm", "pack", "Windows Battery Low.wav", 2000),
  a("CriticalBatteryAlarm", "pack", "Windows Battery Critical.wav", 2400),
  a("Navigating", "pack", "Windows Navigation Start.wav", 500),
  a("EmptyRecycleBin", "pack", "Windows Recycle.wav", 1600),
  a("BlockedPopup", "pack", "Windows Notify System Generic.wav", 900),
  ...defaultWindowActions(),
  a("WindowsLogon", "pack", "Windows Logon Sound.wav", 4500),
  a("WindowsLogoff", "pack", "Windows Logoff Sound.wav", 3400),
  a("WindowsUAC", "pack", "Windows User Account Control.wav", 1300),
];

/** Windows 7 — "Windows Default" scheme (2009). Currently applied in the demo. */
const win7Assignments: PackEventAssignment[] = [
  a("SystemAsterisk", "pack", "Windows Background.wav", 1400),
  a("SystemExclamation", "pack", "Windows Exclamation.wav", 900),
  a("SystemHand", "pack", "Windows Critical Stop.wav", 1500),
  a("SystemQuestion", "pack", "Windows Foreground.wav", 1300),
  a(".Default", "pack", "Windows Ding.wav", 300),
  a("MenuCommand", "pack", "Windows Menu Command.wav", 200),
  a("Notification.Default", "pack", "Windows Notify.wav", 1100),
  a("Notification.IM", "pack", "Windows Notify Messaging.wav", 1100),
  a("Notification.Mail", "pack", "Windows Notify Email.wav", 1300),
  a("Notification.Reminder", "pack", "Windows Reminder.wav", 1400),
  a("Notification.SMS", "pack", "Windows Notify Messaging.wav", 1100),
  a("DeviceConnect", "pack", "Windows Hardware Insert.wav", 1000),
  a("DeviceDisconnect", "pack", "Windows Hardware Remove.wav", 1000),
  a("DeviceFail", "pack", "Windows Hardware Fail.wav", 1200),
  a("LowBatteryAlarm", "pack", "Windows Battery Low.wav", 1900),
  a("CriticalBatteryAlarm", "pack", "Windows Battery Critical.wav", 2200),
  a("Navigating", "pack", "Windows Navigation Start.wav", 400),
  a("EmptyRecycleBin", "pack", "Windows Recycle.wav", 1400),
  a("BlockedPopup", "pack", "Windows Notify Calendar.wav", 800),
  ...defaultWindowActions(),
  a("WindowsLogon", "pack", "Windows Logon Sound.wav", 4000),
  a("WindowsLogoff", "pack", "Windows Logoff Sound.wav", 3000),
  a("WindowsUAC", "pack", "Windows User Account Control.wav", 1200),
];

/** Minimal — near-silent scheme, most events disabled on purpose. */
const minimalAssignments: PackEventAssignment[] = [
  a("SystemAsterisk", "disabled"),
  a("SystemExclamation", "pack", "tick.wav", 120),
  a("SystemHand", "pack", "tick-low.wav", 150),
  a("SystemQuestion", "disabled"),
  a(".Default", "disabled"),
  a("MenuCommand", "disabled"),
  a("Notification.Default", "pack", "tick.wav", 120),
  a("Notification.IM", "disabled"),
  a("Notification.Mail", "disabled"),
  a("Notification.Reminder", "pack", "tick.wav", 120),
  a("Notification.SMS", "disabled"),
  a("DeviceConnect", "pack", "tick.wav", 120),
  a("DeviceDisconnect", "pack", "tick.wav", 120),
  a("DeviceFail", "pack", "tick-low.wav", 150),
  a("LowBatteryAlarm", "pack", "tick-low.wav", 150),
  a("CriticalBatteryAlarm", "pack", "tick-low.wav", 150),
  a("Navigating", "disabled"),
  a("EmptyRecycleBin", "disabled"),
  a("BlockedPopup", "disabled"),
  a("Open", "disabled"),
  a("Close", "disabled"),
  a("Minimize", "disabled"),
  a("Maximize", "disabled"),
  a("RestoreUp", "disabled"),
  a("RestoreDown", "disabled"),
  a("WindowsLogon", "disabled"),
  a("WindowsLogoff", "disabled"),
  a("WindowsUAC", "pack", "tick.wav", 120),
];

/** Calm — soft ambient replacements, harsh alerts intentionally disabled. */
const calmAssignments: PackEventAssignment[] = [
  a("SystemAsterisk", "pack", "soft-chime.wav", 1600),
  a("SystemExclamation", "pack", "soft-alert.wav", 1300),
  a("SystemHand", "disabled"),
  a("SystemQuestion", "pack", "soft-chime.wav", 1600),
  a(".Default", "pack", "soft-tap.wav", 260),
  a("MenuCommand", "default"),
  a("Notification.Default", "pack", "soft-bell.wav", 1200),
  a("Notification.IM", "pack", "soft-bell.wav", 1200),
  a("Notification.Mail", "pack", "soft-bell.wav", 1200),
  a("Notification.Reminder", "pack", "soft-bell-long.wav", 1900),
  a("Notification.SMS", "pack", "soft-bell.wav", 1200),
  a("DeviceConnect", "pack", "soft-tap.wav", 260),
  a("DeviceDisconnect", "pack", "soft-tap.wav", 260),
  a("DeviceFail", "default"),
  a("LowBatteryAlarm", "pack", "soft-alert.wav", 1300),
  a("CriticalBatteryAlarm", "default"),
  a("Navigating", "disabled"),
  a("EmptyRecycleBin", "pack", "soft-tap.wav", 260),
  a("BlockedPopup", "disabled"),
  ...defaultWindowActions(),
  a("WindowsLogon", "pack", "ambient-rise.wav", 3800),
  a("WindowsLogoff", "pack", "ambient-fall.wav", 2600),
  a("WindowsUAC", "default"),
];

export const CURRENT_APPLIED_PACK_ID = "win7";

export const SOUND_PACKS: SoundPack[] = [
  {
    id: "xp",
    name: "Windows XP",
    author: "Microsoft",
    origin: "microsoft",
    releaseYear: 2001,
    description:
      "The classic XP scheme: the logon tada, warning chimes and the short beep everyone recognises.",
    cover: { gradientFrom: "#2f7fd6", gradientTo: "#8fc44c", glyph: "XP" },
    assignments: xpAssignments,
  },
  {
    id: "vista",
    name: "Windows Vista",
    author: "Microsoft",
    origin: "microsoft",
    releaseYear: 2006,
    description:
      "Longer, orchestral sounds, including the opening logon and the UAC prompt that defined the era.",
    cover: { gradientFrom: "#4a6fa5", gradientTo: "#0f2a4a", glyph: "Vi" },
    assignments: vistaAssignments,
  },
  {
    id: "win7",
    name: "Windows 7",
    author: "Microsoft",
    origin: "microsoft",
    releaseYear: 2009,
    description:
      "The most widely used default scheme in Windows history — balanced, restrained and still the best remembered.",
    cover: { gradientFrom: "#5aa6e0", gradientTo: "#12395e", glyph: "7" },
    assignments: win7Assignments,
  },
  {
    id: "minimal",
    name: "Minimal",
    author: "Chimer",
    origin: "chimer",
    description:
      "Almost everything off. Only short clicks for the essential events — made for people who want quiet.",
    cover: { gradientFrom: "#3a3a3a", gradientTo: "#111111", glyph: "—" },
    assignments: minimalAssignments,
  },
  {
    id: "calm",
    name: "Calm",
    author: "Chimer",
    origin: "chimer",
    description:
      "Soft bells and chimes instead of the harsh Windows alerts. Critical errors stay silent.",
    cover: { gradientFrom: "#7fb0a0", gradientTo: "#2c4a44", glyph: "☾" },
    assignments: calmAssignments,
  },
];
