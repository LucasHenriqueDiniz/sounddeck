# CLAUDE.md

Guia do repositório para agentes. Leia antes de mexer em qualquer coisa.

## O que é

App desktop para **Windows 10/11** que troca o esquema de sons do sistema.
O usuário escolhe um pack, ouve a prévia, aplica — e o esquema anterior fica
salvo para restaurar. Um editor troca evento por evento quando ele quer detalhe.

Tauri 2 (Rust) + React 19 + TypeScript + Vite. **Só funciona no Windows**: todo
o backend depende do registro do Windows. Não há caminho de código para Linux
ou macOS, e não faz sentido criar um.

## Comandos

```bash
npm install
npm run tauri dev          # app completo (Rust + webview) — o normal
npm run dev                # só o frontend no browser, sem IPC (usa src/mocks)
npm run build              # tsc + vite build
npm run tauri build        # instaladores em src-tauri/target/release/bundle
npm run build:landing-packs  # regenera landing-page/packs-data.js
npm run build:og             # regenera landing-page/og.png
```

Não existe suíte de testes. Verificação é manual, rodando o app.

## Arquitetura

### Fronteira Rust ↔ TypeScript

Toda comunicação passa por **4 comandos Tauri**, declarados em
[src-tauri/src/lib.rs](src-tauri/src/lib.rs):

| Comando | Faz |
|---|---|
| `scan_events` | lê todos os eventos de som do registro |
| `apply_test_sound` | escreve um `.wav` num evento, devolve snapshot do valor anterior |
| `restore_sound` | reescreve um snapshot de volta |
| `download_pack_asset` | baixa um `.wav` do catálogo remoto |

Do lado TS, cada comando tem um wrapper em `src/services/tauri/`. **Componentes
nunca chamam `invoke` direto** — sempre via esses services. `nativeCapability.ts`
detecta se está rodando dentro do Tauri; fora dele o app cai nos `src/mocks/`,
que é o que permite `npm run dev` no browser.

### O modelo de registro (a parte não óbvia)

[src-tauri/src/windows_sound.rs](src-tauri/src/windows_sound.rs) escreve em
`HKCU\AppEvents\Schemes\Apps\<app>\<evento>\.Current`.

Duas coisas que não são intuitivas e que já estão resolvidas — não regrida nelas:

1. **`.Current` é o que toca.** As subchaves nomeadas (`.Default` e esquemas
   customizados) são só templates que o Painel de Controle copia para
   `.Current` quando o usuário troca de esquema. Escrever `.Current` direto faz
   o som mudar na hora, sem reiniciar nada.

2. **O tipo do valor precisa ser preservado.** `RawValue` guarda os bytes crus
   *e* o `reg_type` original. Muitos valores são `REG_EXPAND_SZ`
   (ex.: `%SystemRoot%\Media\...`); restaurar sempre como `REG_SZ` corromperia
   o valor silenciosamente. Se você mexer no restore, mantenha isso.

Limites de segurança que o app promete na landing page e no README — **não
quebre nenhum**: nada fora de `HKCU`, nenhum arquivo de sistema tocado, nenhuma
elevação de privilégio, e backup antes de toda escrita.

### Frontend

```
src/
  app/          AppShell, AppState (estado global), navegação, views/
  features/     packs/ apply-pack/ sound-events/ backups/  — um diretório por fluxo
  components/   UI compartilhada + icons/
  services/
    tauri/      wrappers dos comandos (única porta para o Rust)
    audio/      tonePreview.ts — prévia sintetizada, sem arquivo
  hooks/ lib/ types/ mocks/ styles/
```

CSS Modules por componente (`Foo.module.css`). [DESIGN.md](DESIGN.md) é o
contrato de design — tipografia, cores semânticas, geometria, movimento. Leia
antes de criar componente novo; ele existe para o app não virar uma colcha de
retalhos.

## Catálogo de packs

Os `.wav` não moram no repo. Ficam no bucket R2 **`sounddeck-packs`**, e o app
lê a URL base de `VITE_PACKS_BASE_URL` (o `.env` versionado só tem essa URL
pública — não é segredo; variáveis `VITE_` vão para o bundle do cliente).

Pipeline de autoria, rodado à mão e **fora do app**:

```
zips de esquemas clássicos
  → scripts/build-catalog.mjs    # extrai, normaliza, gera remote-catalog.json
  → scripts/upload-catalog.mjs   # sobe para o R2 via wrangler
```

`scripts/build-landing-packs.mjs` é outra coisa: gera `landing-page/packs-data.js`
para o site, a partir do mesmo catálogo.

Sobre licenciamento de áudio: os esquemas clássicos vêm de acervos públicos de
fãs. O site é explícito que não redistribui arquivos da Microsoft, e as capas
usam só imagens livres ou originais — **nunca logo ou wallpaper com marca**.
Mantenha essa linha.

## Landing page

`landing-page/` é um site estático — HTML/CSS/JS puro, sem build, sem framework.
Publicado em **https://sounddeck.lucashdo.com** (Cloudflare Workers).

```bash
cd landing-page && npx wrangler deploy
```

Convenções que quebram silenciosamente se ignoradas:

- **i18n:** elementos com `data-i18n="chave"` têm o conteúdo substituído por
  `innerHTML` a partir do dicionário em `site.js`. **Sempre deixe o texto em
  português inline no HTML** — se o elemento ficar vazio, o crawler sem JS não
  vê nada. Isso já foi um bug real: as seções Recursos e Segurança chegavam
  vazias ao Google.
- **URLs sem extensão** (`/download`, `/changelog`, `/privacy`). Links internos,
  `canonical`, `og:url` e `sitemap.xml` usam essa forma; os `.html` redirecionam.
- Ao mudar título ou descrição de uma página, atualize os pares
  `data-desc-pt/en` e `data-og-pt/en` junto — eles trocam com o idioma.
- `og.png` é gerado por script, não editado à mão. Rode `npm run build:og`.
- `llms.txt` descreve o site para agentes de IA. Atualize quando o produto mudar.

## Release

Push de tag `v*.*.*` dispara [.github/workflows/release.yml](.github/workflows/release.yml):
GitHub Actions compila no `windows-latest` via `tauri-action` e cria uma release
**em rascunho** — você precisa publicar à mão no GitHub.

A versão vive em **três lugares** e eles precisam bater:
`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.

Depois de publicar, `landing-page/download.html` e `changelog.html` puxam a
release da API do GitHub em runtime — nada a fazer no site.

### winget

Manifestos em `winget/<versão>/`, identificador `LucasHenriqueDiniz.SoundDeck`.
A cada release nova: copiar a pasta, atualizar versão, URLs, `ReleaseDate` e os
**SHA256** dos instaladores, validar e abrir PR em `microsoft/winget-pkgs`.

```bash
winget validate --manifest winget/<versão>
```

## Convenções

- **Commits em inglês**, imperativo, explicando o porquê e não só o quê.
  A prosa dos docs (`README.md`, `DESIGN.md`, este arquivo) é em português;
  comentários de código são em inglês. Mantenha essa divisão.
- Comentários explicam **por que**, não o que. Os comentários em
  `windows_sound.rs` são o padrão a seguir.
- Branch padrão: `master`.

## Estado atual

v0.1.0 publicada. Em desenvolvimento ativo.

O `UpgradeCode` do MSI está **fixado** em `tauri.conf.json`
(`bundle.windows.wix.upgradeCode`). Não mude esse GUID: ele é o que faz o
Windows reconhecer uma versão nova como atualização da anterior em vez de
instalar as duas lado a lado. Ele foi lido do MSI da 0.1.0 já distribuída.

Pendências conhecidas que valem arrumar quando encostar perto:

- `README.md` diz "ainda sem release empacotado", o que ficou desatualizado
  desde a v0.1.0.
