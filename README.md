# SoundDeck

Gerenciador de esquemas de sons para Windows 10/11. Escolha um pack, ouça a prévia e aplique
sem mexer no Painel de Controle — com backup automático do esquema atual antes de qualquer alteração.

Construído com Tauri 2, React 19 e TypeScript.

**[sounddeck.lucashdo.com](https://sounddeck.lucashdo.com)** · [Baixar](https://sounddeck.lucashdo.com/download) · [Notas de versão](https://sounddeck.lucashdo.com/changelog)

## O que faz

- **Packs de sons** — navegue por um catálogo de esquemas e aplique com um clique.
- **Prévia antes de aplicar** — ouça cada evento (inicialização, lixeira, erro, notificação) antes de commitar.
- **Backup e restauração** — o esquema atual é salvo antes de cada aplicação; volte ao original quando quiser.
- **Por evento** — troque sons individuais em vez do pack inteiro.
- **100% local** — os arquivos ficam na sua máquina; não há conta, telemetria ou upload.

Cinco packs vêm inclusos: recriações dos esquemas do Windows XP (2001), Vista (2006) e 7 (2009),
mais dois originais — Minimal, quase silencioso, e Calm, com sinos suaves.

## Instalação

Requer Windows 10 versão 1809 ou mais recente, ou Windows 11. Não precisa de privilégios de
administrador e não há runtime extra: o app usa o WebView2 já presente no sistema.

```bash
winget install LucasHenriqueDiniz.SoundDeck
```

Ou baixe o instalador direto da [página de releases](https://github.com/LucasHenriqueDiniz/sounddeck/releases/latest).

## Como funciona

O aplicativo escreve direto nas chaves de esquema de som do registro do Windows
(`src-tauri/src/windows_sound.rs`), em `HKCU\AppEvents\Schemes\Apps`, e mantém os `.wav`
em uma pasta gerenciada por pack. O backup (`src/features/backups`) serializa o esquema
vigente antes de qualquer escrita, então aplicar um pack é sempre reversível.

Nenhum arquivo de sistema é modificado, nenhuma DLL é substituída e nada é escrito fora
da colmeia do usuário no registro — o mesmo lugar que o painel oficial usa.

## Desenvolvimento

```bash
npm install
npm run tauri dev
```

Build de produção:

```bash
npm run tauri build
```

Veja [AGENTS.md](AGENTS.md) para a arquitetura em detalhe e [DESIGN.md](DESIGN.md) para o
contrato de design. (`CLAUDE.md` existe só como um import de uma linha, para
o Claude Code também ler o mesmo arquivo.)

## Estrutura

```txt
src/
  features/
    packs/         # catálogo e instalação de packs
    apply-pack/    # fluxo de aplicação no sistema
    sound-events/  # eventos individuais do Windows
    backups/       # backup e restauração do esquema
  services/tauri/  # ponte com o backend Rust
src-tauri/src/
  windows_sound.rs # leitura/escrita do registro de som
  pack_download.rs # download e extração de packs
landing-page/      # site estático (Cloudflare Workers)
winget/            # manifestos do winget por versão
scripts/
  build-catalog.mjs # ferramenta de autoria do catálogo (não vai no app)
```

## Créditos

Os arquivos de som dos esquemas clássicos vêm de acervos públicos de fãs, como
[lelegofrog.github.io/wav.html](https://lelegofrog.github.io/wav.html).
SoundDeck não é afiliado à Microsoft. Windows é marca da Microsoft.

## Licença

[MIT](LICENSE).

## Status

v0.1.0 publicada. Em desenvolvimento ativo.
