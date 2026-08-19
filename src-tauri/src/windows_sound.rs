// Fase 0 spike: read/apply/restore a single Windows sound event via the
// registry, without touching anything beyond HKCU\AppEvents\Schemes\Apps.
//
// Windows stores the sound that actually plays for an event in the
// `.Current` subkey of that event; named scheme subkeys (`.Default`, custom
// names) are just templates that Control Panel copies into `.Current` when
// the user switches schemes. Writing `.Current` directly is enough to make
// the OS play a different sound immediately, no restart required.

use serde::{Deserialize, Serialize};
use windows_registry::{Key, Type as RegType, Value, CURRENT_USER};

const SCHEMES_APPS_PATH: &str = "AppEvents\\Schemes\\Apps";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SoundEvent {
    pub app: String,
    pub event: String,
    pub current_sound: Option<String>,
}

// Raw bytes + registry type of a value, so restore can write back an exact
// byte-for-byte copy. This matters because the original value may be
// REG_EXPAND_SZ (e.g. "%SystemRoot%\Media\..."); always writing REG_SZ back
// would silently change its type on restore.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RawValue {
    pub reg_type: u32,
    pub bytes: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EventSnapshot {
    pub app: String,
    pub event: String,
    pub previous_sound: Option<String>,
    pub previous_raw: Option<RawValue>,
}

fn current_key_path(app: &str, event: &str) -> String {
    format!("{}\\{}\\{}\\.Current", SCHEMES_APPS_PATH, app, event)
}

fn default_key_path(app: &str, event: &str) -> String {
    format!("{}\\{}\\{}\\.Default", SCHEMES_APPS_PATH, app, event)
}

pub fn list_events() -> windows_registry::Result<Vec<SoundEvent>> {
    let apps_key = CURRENT_USER.open(SCHEMES_APPS_PATH)?;
    let mut events = Vec::new();

    for app in apps_key.keys()? {
        let app_key = match apps_key.open(&app) {
            Ok(key) => key,
            Err(_) => continue,
        };

        for event in app_key.keys()? {
            let current_sound = get_current_sound(&app, &event);
            events.push(SoundEvent {
                app: app.clone(),
                event,
                current_sound,
            });
        }
    }

    Ok(events)
}

pub fn get_current_sound(app: &str, event: &str) -> Option<String> {
    CURRENT_USER
        .open(current_key_path(app, event))
        .ok()
        .and_then(|key| key.get_string("").ok())
        .filter(|value| !value.is_empty())
}

fn get_current_raw(app: &str, event: &str) -> Option<RawValue> {
    CURRENT_USER
        .open(current_key_path(app, event))
        .ok()
        .and_then(|key| key.get_value("").ok())
        .map(|value| RawValue {
            reg_type: value.ty().into(),
            bytes: value.as_ref().to_vec(),
        })
}

/// Captures an event's current state without writing anything. This is what
/// a backup is made of — taken for every event *before* the first write, so a
/// failure partway through can still be rolled back completely.
pub fn snapshot_event(app: &str, event: &str) -> EventSnapshot {
    EventSnapshot {
        app: app.to_string(),
        event: event.to_string(),
        previous_sound: get_current_sound(app, event),
        previous_raw: get_current_raw(app, event),
    }
}

pub fn apply_sound(app: &str, event: &str, wav_path: &str) -> windows_registry::Result<EventSnapshot> {
    let snapshot = snapshot_event(app, event);

    let current_key = CURRENT_USER.create(current_key_path(app, event))?;
    current_key.set_string("", wav_path)?;

    Ok(snapshot)
}

/// Writes a raw value back into `.Current`, preserving its registry type.
///
/// Windows represents a silenced event as a *zero-length* value, and that is
/// not an edge case: 22 of the 71 events on a stock Windows 10 install have an
/// empty `.Current` and an empty `.Default`. Handing those bytes straight to
/// `set_value` aborts the process in a dev build — the crate's debug-only
/// null-termination check reads `value[len - 2]` before writing, which
/// underflows on an empty buffer. Release builds compile that check out, so
/// this only ever bit `tauri dev`, but it took the whole app down with it.
///
/// Writing the canonical empty string (a single UTF-16 NUL) keeps the original
/// type and means exactly the same thing to Windows — it is byte-for-byte what
/// `disable_sound` already writes. Only string types are substituted; an empty
/// REG_BINARY is passed through untouched, since the check doesn't apply to it.
fn write_raw_value(key: &Key, reg_type: u32, bytes: &[u8]) -> windows_registry::Result<()> {
    // REG_SZ, REG_EXPAND_SZ, REG_MULTI_SZ.
    const STRING_TYPES: [u32; 3] = [1, 2, 7];
    const EMPTY_STRING: [u8; 2] = [0, 0];

    let bytes = if STRING_TYPES.contains(&reg_type) && bytes.len() < EMPTY_STRING.len() {
        &EMPTY_STRING[..]
    } else {
        bytes
    };

    let mut value = Value::from(bytes);
    value.set_ty(RegType::from(reg_type));
    key.set_value("", &value)
}

/// Restores the event to the stock Windows sound by copying the `.Default`
/// template into `.Current` — the same thing Control Panel does when you pick
/// the Windows Default scheme. If the event has no `.Default` (some third-party
/// apps register events without one), clearing `.Current` is the honest
/// equivalent: no sound rather than a wrong one.
pub fn apply_windows_default(app: &str, event: &str) -> windows_registry::Result<()> {
    let default_value = CURRENT_USER
        .open(default_key_path(app, event))
        .ok()
        .and_then(|key| key.get_value("").ok());

    let current_key = CURRENT_USER.create(current_key_path(app, event))?;
    match default_value {
        Some(value) => write_raw_value(&current_key, value.ty().into(), value.as_ref())?,
        None => {
            let _ = current_key.remove_value("");
        }
    }
    Ok(())
}

/// Silences the event. Windows treats an empty `.Current` as "(None)" — the
/// event still exists and can be given a sound again later.
pub fn disable_sound(app: &str, event: &str) -> windows_registry::Result<()> {
    let current_key = CURRENT_USER.create(current_key_path(app, event))?;
    current_key.set_string("", "")
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Picks a real event off this machine rather than assuming a fixed one —
    /// which events exist varies by Windows version and installed apps.
    fn some_event_with_sound() -> SoundEvent {
        list_events()
            .expect("registry readable")
            .into_iter()
            .find(|e| e.current_sound.is_some())
            .expect("at least one event has a sound")
    }


    /// The counterpart to `some_event_with_sound`. Every test above picks an
    /// event that *has* a sound, which is why the empty-value write path went
    /// unexercised long enough to crash the dev build: Windows stores a
    /// silenced event as a zero-length value, and roughly a third of the
    /// events on a stock install are silent out of the box.
    fn some_silent_event() -> Option<SoundEvent> {
        list_events()
            .expect("registry readable")
            .into_iter()
            .find(|e| {
                e.current_sound.is_none()
                    && snapshot_event(&e.app, &e.event)
                        .previous_raw
                        .is_some_and(|raw| raw.bytes.len() < 2)
            })
    }

    // These write to the live HKCU sound scheme, so they're opt-in:
    //   cargo test -- --ignored
    // Each one restores what it touched before returning.

    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn apply_then_restore_is_byte_exact() {
        let target = some_event_with_sound();
        let original = snapshot_event(&target.app, &target.event);
        let original_raw = original.previous_raw.clone().expect("event has a raw value");

        let probe = "C:\\Windows\\Media\\Windows Ding.wav";
        apply_sound(&target.app, &target.event, probe).expect("apply");
        assert_eq!(
            get_current_sound(&target.app, &target.event).as_deref(),
            Some(probe),
            "apply should have written the probe path"
        );

        restore_sound(&original).expect("restore");
        let after = snapshot_event(&target.app, &target.event)
            .previous_raw
            .expect("value still present after restore");

        // Byte-and-type equality, not just string equality: REG_EXPAND_SZ
        // values must not silently come back as REG_SZ.
        assert_eq!(after.reg_type, original_raw.reg_type, "registry type changed");
        assert_eq!(after.bytes, original_raw.bytes, "registry bytes changed");
    }

    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn disable_then_restore_round_trip() {
        let target = some_event_with_sound();
        let original = snapshot_event(&target.app, &target.event);

        disable_sound(&target.app, &target.event).expect("disable");
        assert_eq!(
            get_current_sound(&target.app, &target.event),
            None,
            "disabled event should read as no sound"
        );

        restore_sound(&original).expect("restore");
        assert_eq!(
            get_current_sound(&target.app, &target.event),
            original.previous_sound,
            "restore should bring the original sound back"
        );
    }

    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn windows_default_then_restore_round_trip() {
        let target = some_event_with_sound();
        let original = snapshot_event(&target.app, &target.event);

        apply_windows_default(&target.app, &target.event).expect("apply default");
        restore_sound(&original).expect("restore");

        assert_eq!(
            get_current_sound(&target.app, &target.event),
            original.previous_sound,
            "restore should bring the original sound back"
        );
    }
    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn restoring_a_silent_event_does_not_abort() {
        let Some(target) = some_silent_event() else {
            eprintln!("no zero-length event on this machine; nothing to regress against");
            return;
        };
        let original = snapshot_event(&target.app, &target.event);

        let probe = r"C:\Windows\Media\Windows Ding.wav";
        apply_sound(&target.app, &target.event, probe).expect("apply");

        // Before write_raw_value this aborted the process rather than failing:
        // the crate's null-termination check underflows on an empty buffer.
        restore_sound(&original).expect("restore");

        assert_eq!(
            get_current_sound(&target.app, &target.event),
            None,
            "a silenced event must come back silent"
        );
        let after = snapshot_event(&target.app, &target.event)
            .previous_raw
            .expect("value still present after restore");
        let before = original.previous_raw.expect("event had a raw value");
        assert_eq!(after.reg_type, before.reg_type, "registry type changed");
    }

    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn windows_default_on_a_silent_event_does_not_abort() {
        let Some(target) = some_silent_event() else {
            eprintln!("no zero-length event on this machine; nothing to regress against");
            return;
        };
        let original = snapshot_event(&target.app, &target.event);

        // Copies an empty `.Default` into `.Current` — the other way the
        // zero-length buffer reached the write path.
        apply_windows_default(&target.app, &target.event).expect("apply default");
        assert_eq!(get_current_sound(&target.app, &target.event), None);

        restore_sound(&original).expect("restore");
    }
}

pub fn restore_sound(snapshot: &EventSnapshot) -> windows_registry::Result<()> {
    let current_key = CURRENT_USER.create(current_key_path(&snapshot.app, &snapshot.event))?;

    match &snapshot.previous_raw {
        Some(raw) => write_raw_value(&current_key, raw.reg_type, &raw.bytes)?,
        None => {
            // No prior sound registered for this event; clearing the value
            // is the closest equivalent to "restore to how we found it".
            let _ = current_key.remove_value("");
        }
    }

    Ok(())
}
