/**
 * Mirrors the Rust structs in src-tauri/src/windows_sound.rs exactly.
 * This is the one part of the type layer backed by real Tauri commands
 * (see services/tauri/windowsSoundService.ts).
 */
export interface SoundEvent {
  app: string;
  event: string;
  current_sound: string | null;
}

export interface RawValue {
  reg_type: number;
  bytes: number[];
}

export interface EventSnapshot {
  app: string;
  event: string;
  previous_sound: string | null;
  previous_raw: RawValue | null;
}
