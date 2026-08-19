import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AsyncState, NativeCapabilityStatus } from "../types/async";
import type { SoundPack } from "../types/pack";
import { checkNativeCapability } from "../services/tauri/nativeCapability";
import { useFirstRun, type FirstRunKind } from "../features/onboarding/useFirstRun";
import {
  getAppliedPackId,
  isExternallyChanged,
  listPacks,
  resyncAppliedState,
  simulateExternalChange,
} from "../services/tauri/packService";
import { useTheme, type ThemeMode } from "../hooks/useTheme";
import { usePackEditor } from "../features/sound-events/usePackEditor";
import type { PackEventAssignment, WindowsEventId } from "../types/soundEvent";
import type { PickWavResult } from "../services/tauri/fileDialogService";

export type ViewId = "library" | "editor" | "backups" | "settings" | "createCustomPack";

interface PackEditorHandle {
  assignments: PackEventAssignment[];
  dirty: boolean;
  useDefault: (id: WindowsEventId) => void;
  disable: (id: WindowsEventId) => void;
  replaceFile: (id: WindowsEventId) => Promise<PickWavResult>;
  /** Borrows a sound from another pack in the library. */
  useLibrarySound: (
    id: WindowsEventId,
    sound: { packId: string; packName: string; fileName: string; durationMs?: number },
  ) => void;
  reset: () => void;
}

interface AppStateValue {
  view: ViewId;
  setView: (view: ViewId) => void;

  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  packsState: AsyncState<SoundPack[]>;
  reloadPacks: () => void;

  appliedPackId: string | null;
  externallyChanged: boolean;
  refreshAppliedState: () => void;
  acknowledgeExternalChange: () => void;
  triggerExternalChangeDemo: () => void;

  onboarding: FirstRunKind;
  dismissOnboarding: () => void;
  showTour: () => void;

  selectedPackId: string | null;
  selectPack: (id: string | null) => void;
  goToEditor: (id: string) => void;
  goToCreateCustomPack: () => void;
  onCustomPackCreated: (pack: SoundPack) => void;

  /** Selected pack with any in-session edits from the Editor already merged in. */
  selectedPack: SoundPack | null;
  editor: PackEditorHandle;

  nativeCapability: AsyncState<NativeCapabilityStatus>;
  recheckNativeCapability: () => void;

  applyDialogOpen: boolean;
  openApplyDialog: () => void;
  closeApplyDialog: () => void;
  onApplySuccess: () => void;

  /** Bumped whenever the backup set changes elsewhere (e.g. a pack apply creates one). */
  backupsVersion: number;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { kind: onboarding, dismiss: dismissOnboarding, showTour } = useFirstRun();
  const [view, setView] = useState<ViewId>("library");
  const { theme, setTheme } = useTheme();

  const [packsState, setPacksState] = useState<AsyncState<SoundPack[]>>({ status: "idle" });
  const [appliedPackId, setAppliedPackId] = useState<string | null>(null);
  const [externallyChanged, setExternallyChanged] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [nativeCapability, setNativeCapability] = useState<AsyncState<NativeCapabilityStatus>>({
    status: "idle",
  });
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [backupsVersion, setBackupsVersion] = useState(0);

  const reloadPacks = useCallback(() => {
    setPacksState({ status: "loading" });
    listPacks()
      .then((packs) => setPacksState({ status: "success", data: packs }))
      .catch((error: unknown) => setPacksState({ status: "error", message: String(error) }));
  }, []);

  const refreshAppliedState = useCallback(() => {
    getAppliedPackId().then((id) => {
      setAppliedPackId(id);
      setExternallyChanged(isExternallyChanged());
    });
  }, []);

  /** Resolves drift by accepting the last-known applied pack as authoritative again. */
  const acknowledgeExternalChange = useCallback(() => {
    resyncAppliedState();
    refreshAppliedState();
  }, [refreshAppliedState]);

  const triggerExternalChangeDemo = useCallback(() => {
    simulateExternalChange();
    refreshAppliedState();
  }, [refreshAppliedState]);

  const recheckNativeCapability = useCallback(() => {
    setNativeCapability({ status: "loading" });
    checkNativeCapability()
      .then((status) => setNativeCapability({ status: "success", data: status }))
      .catch((error: unknown) => setNativeCapability({ status: "error", message: String(error) }));
  }, []);

  useEffect(() => {
    reloadPacks();
    refreshAppliedState();
    recheckNativeCapability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPack = useCallback((id: string | null) => {
    setSelectedPackId(id);
  }, []);

  const goToEditor = useCallback((id: string) => {
    setSelectedPackId(id);
    setView("editor");
  }, []);

  const goToCreateCustomPack = useCallback(() => {
    setView("createCustomPack");
  }, []);

  const onCustomPackCreated = useCallback(
    (pack: SoundPack) => {
      reloadPacks();
      setSelectedPackId(pack.id);
      setView("library");
    },
    [reloadPacks],
  );

  const openApplyDialog = useCallback(() => setApplyDialogOpen(true), []);
  const closeApplyDialog = useCallback(() => setApplyDialogOpen(false), []);

  const onApplySuccess = useCallback(() => {
    acknowledgeExternalChange();
    setBackupsVersion((v) => v + 1);
  }, [acknowledgeExternalChange]);

  const rawSelectedPack =
    (packsState.status === "success" && packsState.data.find((p) => p.id === selectedPackId)) || null;

  // Single editor instance, keyed on the selected pack, shared by every view
  // and the one ApplyPackDialog instance — avoids each view owning its own
  // copy of in-session edits (or, worse, its own dialog).
  const editorState = usePackEditor(rawSelectedPack);
  const selectedPack: SoundPack | null = rawSelectedPack
    ? { ...rawSelectedPack, assignments: editorState.assignments }
    : null;

  const value = useMemo<AppStateValue>(
    () => ({
      view,
      setView,
      theme,
      setTheme,
      packsState,
      reloadPacks,
      appliedPackId,
      externallyChanged,
      refreshAppliedState,
      acknowledgeExternalChange,
      triggerExternalChangeDemo,
      onboarding,
      dismissOnboarding,
      showTour,
      selectedPackId,
      selectPack,
      goToEditor,
      goToCreateCustomPack,
      onCustomPackCreated,
      selectedPack,
      editor: editorState,
      nativeCapability,
      recheckNativeCapability,
      applyDialogOpen,
      openApplyDialog,
      closeApplyDialog,
      onApplySuccess,
      backupsVersion,
    }),
    [
      view,
      theme,
      setTheme,
      packsState,
      reloadPacks,
      appliedPackId,
      externallyChanged,
      refreshAppliedState,
      acknowledgeExternalChange,
      triggerExternalChangeDemo,
      onboarding,
      dismissOnboarding,
      showTour,
      selectedPackId,
      selectPack,
      goToEditor,
      goToCreateCustomPack,
      onCustomPackCreated,
      selectedPack,
      editorState,
      nativeCapability,
      recheckNativeCapability,
      applyDialogOpen,
      openApplyDialog,
      closeApplyDialog,
      onApplySuccess,
      backupsVersion,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
