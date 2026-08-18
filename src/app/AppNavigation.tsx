import { Tabs, type TabItem } from "../components/Tabs";
import { BackupsIcon, EditorIcon, LibraryIcon, SettingsIcon } from "../components/icons/icons";
import { useAppState, type ViewId } from "./AppState";

const ITEMS: TabItem<ViewId>[] = [
  { id: "library", label: "Library", icon: <LibraryIcon /> },
  { id: "editor", label: "Editor", icon: <EditorIcon /> },
  { id: "backups", label: "Backups", icon: <BackupsIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export function AppNavigation() {
  const { view, setView } = useAppState();
  return <Tabs items={ITEMS} value={view} onChange={setView} aria-label="Main navigation" />;
}
