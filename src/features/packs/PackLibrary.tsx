import { useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { IconButton } from "../../components/IconButton";
import { Skeleton } from "../../components/Skeleton";
import { ChevronRightIcon, LibraryIcon, SearchIcon } from "../../components/icons/icons";
import { useAppState } from "../../app/AppState";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { collectAllTags, derivePackTags, resolveTagLabel } from "../../lib/packTags";
import { useT } from "../../i18n";
import { PackCard } from "./PackCard";
import { PackDetails } from "./PackDetails";
import styles from "./PackLibrary.module.css";

const COMPACT_BREAKPOINT = 900;

export function PackLibrary() {
  const t = useT();
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
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const compact = width > 0 && width < COMPACT_BREAKPOINT;

  const packs = packsState.status === "success" ? packsState.data : [];
  const allTags = useMemo(() => collectAllTags(packs), [packs]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packs.filter((pack) => {
      const matchesQuery = !q || pack.name.toLowerCase().includes(q) || pack.author.toLowerCase().includes(q);
      const matchesTags = activeTags.size === 0 || derivePackTags(pack).some((tag) => activeTags.has(tag));
      return matchesQuery && matchesTags;
    });
  }, [packs, query, activeTags]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function handleSelect(id: string) {
    selectPack(id);
  }

  function handleApply(id: string) {
    selectPack(id);
    openApplyDialog();
  }

  const showGrid = !compact || !selectedPack;
  const showDetails = !compact || Boolean(selectedPack);

  const noResultsDescription =
    query && activeTags.size > 0
      ? t("library.noResultsForQueryAndTags", { query })
      : query
        ? t("library.noResultsForQuery", { query })
        : t("library.noResults.desc");

  return (
    <div className={styles.layout} ref={ref}>
      {showGrid && (
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarRow}>
              <label className={styles.searchField}>
                <SearchIcon size={15} />
                <input
                  type="search"
                  placeholder={t("library.searchPlaceholder")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label={t("library.searchLabel")}
                />
              </label>
              {packsState.status === "success" && (
                <span className={styles.count}>{t("library.count", { shown: filtered.length, total: packs.length })}</span>
              )}
            </div>
            {allTags.length > 0 && (
              <div className={styles.tagFilter} role="group" aria-label={t("library.filterByTag")}>
                {allTags.map((tag) => {
                  const active = activeTags.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={[styles.tagChip, active ? styles.tagChipActive : ""].join(" ")}
                      aria-pressed={active}
                      onClick={() => toggleTag(tag)}
                    >
                      {resolveTagLabel(t, tag)}
                    </button>
                  );
                })}
                {activeTags.size > 0 && (
                  <button type="button" className={styles.tagClear} onClick={() => setActiveTags(new Set())}>
                    {t("library.clearFilters")}
                  </button>
                )}
              </div>
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
                title={t("library.loadError.title")}
                description={t("library.loadError.desc")}
                detail={packsState.message}
                onRetry={reloadPacks}
              />
            )}

            {packsState.status === "success" && packs.length === 0 && (
              <EmptyState
                icon={<LibraryIcon size={32} />}
                title={t("library.empty.title")}
                description={t("library.empty.desc")}
              />
            )}

            {packsState.status === "success" && packs.length > 0 && filtered.length === 0 && (
              <EmptyState
                icon={<SearchIcon size={32} />}
                title={t("library.noResults.title")}
                description={noResultsDescription}
                action={
                  <button
                    type="button"
                    className={styles.tagClear}
                    onClick={() => {
                      setQuery("");
                      setActiveTags(new Set());
                    }}
                  >
                    {t("library.clearSearch")}
                  </button>
                }
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
                    label={t("library.back")}
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
              title={t("library.noPack.title")}
              description={t("library.noPack.desc")}
            />
          )}
        </div>
      )}
    </div>
  );
}
