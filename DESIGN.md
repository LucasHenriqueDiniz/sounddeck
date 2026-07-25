# SoundDeck — contrato de design

## Caráter do produto

Preciso, calmo, confiável, discretamente nostálgico, sem excesso. SoundDeck é um
utilitário de sistema — não um site institucional nem um dashboard administrativo.
A nostalgia entra pelas capas, nomes e prévias dos packs; a interface em si é
neutra, silenciosa e deixa o conteúdo (capas, formas de onda, nomes de eventos)
carregar a cor e a personalidade.

## Densidade de interação

Densidade compacta/confortável (não espaçosa). Listas de eventos e a biblioteca
de packs priorizam mostrar mais itens úteis por tela. Diálogos e telas de
resultado (sucesso/erro) podem respirar mais, pois aparecem raramente.

## Tipografia

- **UI:** `"Segoe UI Variable Text", "Segoe UI", -apple-system, "Inter", system-ui, sans-serif`
  (nativa no Windows 11/10, sem dependência de rede).
- **Display:** mesma família da UI, apenas com peso maior — sem uma segunda
  fonte decorativa.
- **Monoespaçada:** `"Cascadia Code", "Consolas", ui-monospace, monospace` —
  usada só para nomes de arquivo e identificadores técnicos.
- **Escala:** `--text-xs` (11px) a `--text-2xl` (24px), 6 degraus. Ver `tokens.css`.
- **Pesos:** 400 (corpo), 500 (rótulos/ênfase), 600 (títulos de seção).
- **Números:** duração, contagens e percentuais usam `font-variant-numeric: tabular-nums`.
- Nunca usar caixa alta para rótulos longos; texto pequeno nunca abaixo de `--text-xs`.

## Cores semânticas

Tokens em `src/styles/tokens.css`, com claro e escuro definidos intencionalmente
(não é inversão automática). Uso:

| Token | Papel |
|---|---|
| `--surface-canvas` | fundo da janela |
| `--surface-panel` | painéis (biblioteca, editor, listas) |
| `--surface-raised` | cards, linhas selecionáveis |
| `--surface-overlay` | diálogos, menus |
| `--surface-selected` / `--surface-hover` | estados de seleção e hover |
| `--text-primary/secondary/muted` | hierarquia tipográfica |
| `--text-on-accent` | texto sobre `--accent` |
| `--border-subtle/default/strong` | divisórias, contornos |
| `--accent` / `--accent-hover` / `--accent-active` / `--accent-soft` | única cor de destaque (âmbar/latão) — ações primárias, seleção, progresso |
| `--success` / `--warning` / `--danger` / `--info` | estados do sistema — sempre acompanhados de ícone/texto, nunca só cor |
| `--focus-ring` | anel de foco — tom azul, deliberadamente distinto do acento, para não confundir "selecionado" com "focado" |

## Superfícies e bordas

Três níveis: `canvas` (fundo), `panel` (contêiner estrutural, sem sombra),
`raised` (item individual dentro de um painel — borda de 1px, sem sombra).
Sombra (`--shadow-raised`, `--shadow-overlay`) é reservada para elementos que
flutuam sobre o conteúdo: diálogos, menus, tooltips. Nunca usar sombra em cards
dentro de listas — a hierarquia vem de borda + espaçamento.

Divisórias usam `--border-subtle` dentro de um mesmo grupo e `--border-default`
entre seções.

## Geometria

- Espaçamento: `--space-1` (4px) a `--space-12` (48px), escala de 4/8px.
- Raios: `--radius-sm` (4px, controles pequenos), `--radius-md` (8px, cards/inputs/botões),
  `--radius-lg` (12px, diálogos). Nunca mais que três níveis.
- Alturas de controle: `--control-sm` (28px), `--control-md` (34px), `--control-lg` (40px).
- Largura máxima de conteúdo de leitura (resumos, diálogos): `--content-max`.

## Elevação

Dois níveis de sombra apenas: `--shadow-raised` (dropdown leve) e
`--shadow-overlay` (diálogo modal). Nada além disso.

## Movimento

- `--motion-fast` (120ms) para hover/pressed/foco.
- `--motion-base` (180ms) para abrir/fechar painéis, trocar de aba.
- `--motion-slow` (260ms) para transições de progresso e confirmação de sucesso.
- Easing padrão: `--ease-standard`.
- `prefers-reduced-motion: reduce` remove praticamente toda duração de
  transição/animação globalmente — implementado em `base.css`.

## Componentes

- **Botões:** primário (`--accent`), secundário (contorno neutro), fantasma
  (sem contorno), perigoso (`--danger`). Sempre com estado de carregamento
  (spinner substitui o rótulo do ícone, texto permanece) e desabilitado
  (opacidade + `cursor: not-allowed`, nunca só opacidade sem `aria-disabled`).
- **Badges/estado:** sempre ícone + texto, nunca só cor de fundo.
- **Listas:** linhas com divisória `--border-subtle`, sem card por item.
- **Cards:** reservados para objetos discretos com capa (packs). Nunca card
  dentro de card.
- **Diálogos:** título, corpo com `--content-max`, ações à direita, `Esc`
  fecha, foco inicial no primeiro controle relevante, foco retorna ao
  disparador ao fechar.
- **Banner de status:** persistente/contextual no topo da área de conteúdo,
  papel `status`/`alert` conforme severidade.
- **Estados vazios/erro:** título curto, explicação de uma linha, ação
  seguinte quando existir.

## Comportamento da janela

- Tamanho mínimo: **1040×680** (definido em `tauri.conf.json`).
- Layout em painel duplo (lista + detalhe) só acima de ~880px de largura útil;
  abaixo disso o detalhe substitui a lista com um botão "voltar" (sem virar
  layout mobile empilhado).
- Sem rolagem horizontal em nenhuma tela — listas largas usam elipse/truncamento
  central para caminhos de arquivo.
- Barra de título customizada (`decorations: false`): a barra superior de
  52px é a única região arrastável (`data-tauri-drag-region="deep"`, que
  automaticamente exclui abas, botões e inputs — nenhum controle interativo
  fica dentro da região de arraste). Botões de minimizar/maximizar/fechar
  (`app/WindowControls.tsx`) substituem os controles nativos, seguem a
  convenção visual do Windows 11 (46px de largura, altura total da barra,
  hover vermelho em fechar) e ficam encostados na borda direita da janela.
  Duplo clique na região arrastável maximiza/restaura (comportamento nativo
  do Tauri, sem código adicional).
- Atalhos: `Esc` fecha diálogos/menus; `Enter`/`Espaço` ativam controles
  focados; setas navegam listas de eventos e abas.

## Acessibilidade

- Contraste mínimo AA (4.5:1 para texto normal, 3:1 para texto grande/ícones
  informativos) nos dois temas.
- Foco sempre visível (`:focus-visible`, nunca suprimido).
- Alvo de toque/clique mínimo de 28px em controles densos.
- Toda ação somente-ícone tem `aria-label` e tooltip.
- Estado nunca comunicado só por cor (texto/ícone acompanha sempre).
- Regiões de status assíncrono usam `aria-live="polite"` (ou `assertive` para erro).
