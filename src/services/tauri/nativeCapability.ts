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
    return {
      available: false,
      message: "Running outside the Tauri runtime — registry access unavailable.",
    };
  }

  try {
    const events = await scanEvents();
    return {
      available: true,
      eventCount: events.length,
      message: `Windows registry reachable — ${events.length} events found.`,
    };
  } catch (error) {
    return {
      available: false,
      message: `Falha ao ler o Registro do Windows: ${String(error)}`,
    };
  }
}
