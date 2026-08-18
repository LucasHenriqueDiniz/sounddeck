# SoundDeck

Gerenciador de esquemas de sons para Windows 10/11. Instale, previa e aplique packs de sons de sistema
sem mexer no Painel de Controle — com backup automatico do esquema atual antes de qualquer alteracao.

Construido com Tauri 2, React 19 e TypeScript.

## O que faz

- **Packs de sons** — navegue por um catalogo de esquemas e aplique com um clique.
- **Preview antes de aplicar** — ouca cada evento (inicializacao, lixeira, erro, notificacao) antes de commitar.
- **Backup e restauracao** — o esquema atual e salvo antes de cada aplicacao; volte ao original quando quiser.
- **Por evento** — troque sons individuais em vez do pack inteiro.
- **100% local** — os arquivos ficam na sua maquina; nao ha conta, telemetria ou upload.

## Como funciona

O aplicativo escreve direto nas chaves de esquema de som do registro do Windows
(`src-tauri/src/windows_sound.rs`) e mantem os `.wav` em uma pasta gerenciada por pack.
O backup (`src/features/backups`) serializa o esquema vigente antes de qualquer escrita,
entao aplicar um pack e sempre reversivel.

## Desenvolvimento

```bash
npm install
npm run tauri dev
```

Build de producao:

```bash
npm run tauri build
```

## Estrutura

```txt
src/
  features/
    packs/         # catalogo e instalacao de packs
    apply-pack/    # fluxo de aplicacao no sistema
    sound-events/  # eventos individuais do Windows
    backups/       # backup e restauracao do esquema
  services/tauri/  # ponte com o backend Rust
src-tauri/src/
  windows_sound.rs # leitura/escrita do registro de som
  pack_download.rs # download e extracao de packs
scripts/
  build-catalog.mjs # ferramenta de autoria do catalogo (nao vai no app)
```

## Creditos

Os arquivos de som dos esquemas classicos vem de acervos publicos de fas, como
[lelegofrog.github.io/wav.html](https://lelegofrog.github.io/wav.html).
SoundDeck nao e afiliado a Microsoft.

## Status

Em desenvolvimento ativo — funcional para uso pessoal, ainda sem release empacotado.
