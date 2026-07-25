import { useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { IconButton } from "../../components/IconButton";
import { Skeleton } from "../../components/Skeleton";
import { ChevronRightIcon, LibraryIcon, SearchIcon } from "../../components/icons/icons";
import { useAppState } from "../../app/AppState";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { PackCard } from "./PackCard";
import { PackDetails } from "./PackDetails";
import styles from "./PackLibrary.module.css";

const COMPACT_BREAKPOINT = 900;

export function PackLibrary() {
  const {
    packsState,
    reloadPacks,
    appliedPackId,
    selectedPackId,
    selectedPack,
    selectPack,
    goToEditor,
    openApplyDialog,
  } = useAppState();
  const [query, setQuery] = useState("");
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const compact = width > 0 && width < COMPACT_BREAKPOINT;

  const packs = packsState.status === "success" ? packsState.data : [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return packs;
    return packs.filter(
      (pack) => pack.name.toLowerCase().includes(q) || pack.author.toLowerCase().includes(q),
    );
  }, [packs, query]);

  function handleSelect(id: string) {
    selectPack(id);
  }

  function handleApply(id: string) {
    selectPack(id);
    openApplyDialog();
  }

  const showGrid = !compact || !selectedPack;
  const showDetails = !compact || Boolean(selectedPack);

  return (
    <div className={styles.layout} ref={ref}>
      {showGrid && (
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <SearchIcon size={15} />
              <input
                type="search"
                placeholder="Buscar packs por nome ou autor…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Buscar packs"
              />
            </label>
            {packsState.status === "success" && (
              <span className={styles.count}>
                {filtered.length} de {packs.length} packs
              </span>
            )}
          </div>

          <div className={styles.grid}>
            {packsState.status === "loading" && (
              <div className={styles.gridInner}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Skeleton height={120} radius="12px" />
                    <Skeleton height={14} width="70%" />
                    <Skeleton height={12} width="45%" />
                  </div>
                ))}
              </div>
            )}

            {packsState.status === "error" && (
              <ErrorState
                title="Não foi possível carregar a biblioteca"
                description="Ocorreu um erro ao buscar os packs disponíveis."
                detail={packsState.message}
                onRetry={reloadPacks}
              />
            )}

            {packsState.status === "success" && packs.length === 0 && (
              <EmptyState
                icon={<LibraryIcon size={32} />}
                title="Sua biblioteca está vazia"
                description="Você ainda não tem nenhum pack de sons instalado."
              />
            )}

            {packsState.status === "success" && packs.length > 0 && filtered.length === 0 && (
              <EmptyState
                icon={<SearchIcon size={32} />}
                title="Nenhum resultado encontrado"
                description={`Nenhum pack corresponde a "${query}".`}
              />
            )}

            {packsState.status === "success" && filtered.length > 0 && (
              <div className={styles.gridInner}>
                {filtered.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    soundCount={pack.assignments.filter((a) => a.state === "pack").length}
                    isApplied={pack.id === appliedPackId}
                    isSelected={pack.id === selectedPackId}
                    onSelect={() => handleSelect(pack.id)}
                    onApply={() => handleApply(pack.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showDetails && (
        <div className={selectedPack ? styles.detailsPane : styles.detailsEmpty}>
          {selectedPack ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
              {compact && (
                <div className={styles.backRow}>
                  <IconButton
                    label="Voltar para a biblioteca"
                    icon={<ChevronRightIcon style={{ transform: "rotate(180deg)" }} />}
                    onClick={() => selectPack(null)}
                  />
                </div>
              )}
              <PackDetails
                pack={selectedPack}
                isApplied={selectedPack.id === appliedPackId}
                onApply={() => openApplyDialog()}
                onEditEvents={() => goToEditor(selectedPack.id)}
              />
            </div>
          ) : (
            <EmptyState
              icon={<LibraryIcon size={28} />}
              title="Nenhum pack selecionado"
              description="Escolha um pack na biblioteca para ver capa, autor e eventos."
            />
          )}
        </div>
      )}
    </div>
  );
}
