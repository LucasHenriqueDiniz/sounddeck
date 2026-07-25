// Fase 0 spike validation, runnable with `cargo run --bin probe`.
//
// Exercises the exact same windows_sound module the Tauri commands call —
// no GUI involved. It also proves the registry writes actually affect what
// Windows resolves and plays, by calling PlaySoundW with SND_ALIAS, which is
// the same alias-resolution path Windows itself uses for system sounds
// (HKCU\AppEvents\Schemes\Apps\.Default\<alias>\.Current).

use sounddeck_lib::windows_sound;
use std::path::Path;

#[link(name = "winmm")]
extern "system" {
    fn PlaySoundW(pszSound: *const u16, hmod: isize, fdwSound: u32) -> i32;
}

const SND_SYNC: u32 = 0x0000;
const SND_NODEFAULT: u32 = 0x0002;
const SND_ALIAS: u32 = 0x00010000;

fn play_alias(alias: &str) -> bool {
    let wide: Vec<u16> = alias.encode_utf16().chain(std::iter::once(0)).collect();
    let result = unsafe { PlaySoundW(wide.as_ptr(), 0, SND_ALIAS | SND_NODEFAULT | SND_SYNC) };
    result != 0
}

fn main() {
    println!("== SoundDeck Fase 0 probe ==\n");

    let events = windows_sound::list_events().expect("list_events failed");
    println!("1) list_events(): {} eventos encontrados", events.len());
    assert!(!events.is_empty(), "esperava pelo menos 1 evento");

    let candidate = events
        .iter()
        .find(|e| {
            e.app == ".Default"
                && (e.event.eq_ignore_ascii_case("SystemAsterisk")
                    || e.event.eq_ignore_ascii_case("SystemNotification")
                    || e.event.eq_ignore_ascii_case("Notification.Default"))
        })
        .or_else(|| events.iter().find(|e| e.app == ".Default"))
        .cloned()
        .expect("nenhum evento em .Default encontrado");

    println!(
        "   usando evento: {}\\{}  (valor atual: {:?})\n",
        candidate.app, candidate.event, candidate.current_sound
    );

    let media_dir = Path::new(r"C:\Windows\Media");
    let mut wavs: Vec<String> = std::fs::read_dir(media_dir)
        .expect("nao consegui ler C:\\Windows\\Media")
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| {
            p.extension()
                .map(|ext| ext.eq_ignore_ascii_case("wav"))
                .unwrap_or(false)
        })
        .map(|p| p.to_string_lossy().to_string())
        .collect();
    wavs.sort();
    assert!(
        wavs.len() >= 2,
        "preciso de pelo menos 2 wavs em C:\\Windows\\Media pro teste"
    );
    let wav_a = wavs[0].clone();
    let wav_b = wavs[1].clone();
    println!("2) wavs de teste:\n   A = {}\n   B = {}\n", wav_a, wav_b);

    let snapshot = windows_sound::apply_sound(&candidate.app, &candidate.event, &wav_a)
        .expect("apply_sound(A) falhou");
    let readback_a = windows_sound::get_current_sound(&candidate.app, &candidate.event);
    assert_eq!(readback_a.as_deref(), Some(wav_a.as_str()), "registro nao refletiu o wav A");
    let played_a = play_alias(&candidate.event);
    println!(
        "3) apply(A) -> registro confere: sim | PlaySoundW resolveu e tocou: {}",
        played_a
    );

    windows_sound::apply_sound(&candidate.app, &candidate.event, &wav_b).expect("apply_sound(B) falhou");
    let readback_b = windows_sound::get_current_sound(&candidate.app, &candidate.event);
    assert_eq!(readback_b.as_deref(), Some(wav_b.as_str()), "registro nao refletiu o wav B");
    assert_ne!(readback_a, readback_b, "valor nao mudou entre A e B");
    let played_b = play_alias(&candidate.event);
    println!(
        "4) apply(B) -> valor mudou de fato: sim | PlaySoundW resolveu e tocou: {}",
        played_b
    );

    let bogus = r"C:\Windows\Media\sounddeck-probe-arquivo-que-nao-existe.wav".to_string();
    windows_sound::apply_sound(&candidate.app, &candidate.event, &bogus).expect("apply_sound(bogus) falhou");
    let played_bogus = play_alias(&candidate.event);
    println!(
        "5) apply(caminho inexistente) -> PlaySoundW deveria FALHAR: {} (esperado: false)",
        played_bogus
    );

    windows_sound::restore_sound(&snapshot).expect("restore_sound falhou");
    let restored = windows_sound::get_current_sound(&candidate.app, &candidate.event);
    assert_eq!(restored, snapshot.previous_sound, "restore nao bateu com o valor original");
    println!(
        "6) restore_sound() -> valor voltou ao original: {:?}\n",
        restored
    );

    let ok = played_a && played_b && !played_bogus;
    println!(
        "== RESULTADO: {} ==",
        if ok {
            "PASS - escrever no registro muda de fato o que o Windows resolve e toca"
        } else {
            "FAIL - ver detalhes acima"
        }
    );

    if !ok {
        std::process::exit(1);
    }
}
