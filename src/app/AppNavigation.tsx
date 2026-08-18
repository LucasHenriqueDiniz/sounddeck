import { Tabs, type TabItem } from "../components/Tabs";
import { BackupsIcon, EditorIcon, LibraryIcon, SettingsIcon } from "../components/icons/icons";
import { useAppState, type ViewId } from "./AppState";
import { useT, type TranslationKey } from "../i18n";

const ITEMS: Array<{ id: ViewId; labelKey: TranslationKey; icon: TabItem<ViewId>["icon"] }> = [
  { id: "library", labelKey: "nav.library", icon: <LibraryIcon /> },
  { id: "editor", labelKey: "nav.editor", icon: <EditorIcon /> },
  { id: "backups", labelKey: "nav.backups", icon: <BackupsIcon /> },
  { id: "settings", labelKey: "nav.settings", icon: <SettingsIcon /> },
];

export function AppNavigation() {
  const { view, setView } = useAppState();
  const t = useT();
  const items: TabItem<ViewId>[] = ITEMS.map(({ id, labelKey, icon }) => ({
    id,
    label: t(labelKey),
    icon,
  }));
  return <Tabs items={items} value={view} onChange={setView} aria-label={t("nav.main")} />;
}
