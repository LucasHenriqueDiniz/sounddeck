import { Button } from "../../components/Button";
import { StatusBanner } from "../../components/StatusBanner";
import { Tabs, type TabItem } from "../../components/Tabs";
import { MoonIcon, RefreshIcon, SettingsIcon, SunIcon } from "../../components/icons/icons";
import { useAppState } from "../AppState";
import { useI18n, useT, LANGUAGES, type LangPreference } from "../../i18n";
import styles from "./SettingsView.module.css";

export function SettingsView() {
  const { theme, setTheme, nativeCapability, recheckNativeCapability, triggerExternalChangeDemo } =
    useAppState();
  const t = useT();
  const { preference, setPreference } = useI18n();

  const langItems: TabItem<LangPreference>[] = [
    { id: "system", label: t("settings.language.system"), icon: <SettingsIcon size={14} /> },
    ...LANGUAGES.map((l) => ({ id: l.code, label: l.label })),
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>{t("settings.appearance")}</h1>
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>{t("settings.theme")}</span>
              <span className={styles.rowDescription}>{t("settings.themeDesc")}</span>
            </div>
            <Tabs
              aria-label={t("settings.theme")}
              value={theme}
              onChange={setTheme}
              items={[
                { id: "light", label: t("settings.theme.light"), icon: <SunIcon size={14} /> },
                { id: "dark", label: t("settings.theme.dark"), icon: <MoonIcon size={14} /> },
                { id: "system", label: t("settings.theme.system"), icon: <SettingsIcon size={14} /> },
              ]}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>{t("settings.language")}</span>
              <span className={styles.rowDescription}>{t("settings.languageDesc")}</span>
            </div>
            <Tabs aria-label={t("settings.language")} value={preference} onChange={setPreference} items={langItems} />
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>{t("settings.diagnostics")}</h1>
          <div className={styles.diagnostics}>
            {nativeCapability.status === "loading" && (
              <StatusBanner severity="info" title={t("settings.checking")} />
            )}
            {nativeCapability.status === "success" && (
              <StatusBanner
                severity={nativeCapability.data.available ? "success" : "warning"}
                title={nativeCapability.data.available ? t("settings.available") : t("settings.unavailable")}
                description={
                  t(nativeCapability.data.messageKey, { count: nativeCapability.data.eventCount ?? 0 }) +
                  (nativeCapability.data.detail ? `: ${nativeCapability.data.detail}` : "")
                }
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshIcon size={14} />}
                    onClick={recheckNativeCapability}
                  >
                    {t("settings.checkAgain")}
                  </Button>
                }
              />
            )}
            {nativeCapability.status === "error" && (
              <StatusBanner
                severity="danger"
                title={t("settings.checkFailed")}
                description={nativeCapability.message}
                action={
                  <Button variant="secondary" size="sm" onClick={recheckNativeCapability}>
                    {t("settings.tryAgain")}
                  </Button>
                }
              />
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>{t("settings.about")}</h1>
          <p className={styles.about}>{t("settings.about.summary", { version: "0.1.0" })}</p>
          <ul className={styles.limitations}>
            <li>{t("settings.limit.catalog")}</li>
            <li>{t("settings.limit.events")}</li>
            <li>{t("settings.limit.apply")}</li>
            <li>{t("settings.limit.backups")}</li>
            <li>{t("settings.limit.wired")}</li>
          </ul>
          <p className={styles.credit}>
            {t("settings.credit.before")}{" "}
            <a href="https://lelegofrog.github.io/wav.html" target="_blank" rel="noreferrer">
              lelegofrog.github.io
            </a>{" "}
            {t("settings.credit.after")}
          </p>
        </section>

        <details className={styles.devSection}>
          <summary className={styles.devSummary}>{t("settings.developer")}</summary>
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>{t("settings.simulate.title")}</span>
              <span className={styles.rowDescription}>{t("settings.simulate.desc")}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerExternalChangeDemo}>
              {t("settings.simulate.button")}
            </Button>
          </div>
        </details>
      </div>
    </div>
  );
}
