import type { NativeCapabilityStatus } from "../../types/async";
import { isRunningInTauri, scanEvents } from "./windowsSoundService";

/**
 * Real, read-only probe: confirms the app is running inside the Tauri
 * shell and that `scan_events` can actually read
 * HKCU\AppEvents\Schemes\Apps. Used to gate the "unavailable native
 * capability" state — for example when the UI is opened in a plain browser
 * during development instead of `tauri dev`.
 */
export async function checkNativeCapability(): Promise<NativeCapabilityStatus> {
  if (!isRunningInTauri()) {
    return { available: false, messageKey: "capability.offline" };
  }

  try {
    const events = await scanEvents();
    return { available: true, eventCount: events.length, messageKey: "capability.online" };
  } catch (error) {
    return { available: false, messageKey: "capability.readError", detail: String(error) };
  }
}
