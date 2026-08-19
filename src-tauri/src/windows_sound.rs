// Fase 0 spike: read/apply/restore a single Windows sound event via the
// registry, without touching anything beyond HKCU\AppEvents\Schemes\Apps.
//
// Windows stores the sound that actually plays for an event in the
// `.Current` subkey of that event; named scheme subkeys (`.Default`, custom
// names) are just templates that Control Panel copies into `.Current` when
// the user switches schemes. Writing `.Current` directly is enough to make
// the OS play a different sound immediately, no restart required.

use serde::{Deserialize, Serialize};
use windows_registry::{Type as RegType, Value, CURRENT_USER};

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
        Some(value) => current_key.set_value("", &value)?,
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

pub fn restore_sound(snapshot: &EventSnapshot) -> windows_registry::Result<()> {
    let current_key = CURRENT_USER.create(current_key_path(&snapshot.app, &snapshot.event))?;

    match &snapshot.previous_raw {
        Some(raw) => {
            let mut value = Value::from(raw.bytes.as_slice());
            value.set_ty(RegType::from(raw.reg_type));
            current_key.set_value("", &value)?;
        }
        None => {
            // No prior sound registered for this event; clearing the value
            // is the closest equivalent to "restore to how we found it".
            let _ = current_key.remove_value("");
        }
    }

    Ok(())
}
