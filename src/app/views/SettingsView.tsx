import { Button } from "../../components/Button";
import { StatusBanner } from "../../components/StatusBanner";
import { Tabs } from "../../components/Tabs";
import { MoonIcon, RefreshIcon, SettingsIcon, SunIcon } from "../../components/icons/icons";
import { useAppState } from "../AppState";
import styles from "./SettingsView.module.css";

export function SettingsView() {
  const { theme, setTheme, nativeCapability, recheckNativeCapability, triggerExternalChangeDemo } =
    useAppState();

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Aparência</h1>
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>Tema</span>
              <span className={styles.rowDescription}>Claro, escuro ou acompanhar o sistema.</span>
            </div>
            <Tabs
              aria-label="Tema"
              value={theme}
              onChange={setTheme}
              items={[
                { id: "light", label: "Claro", icon: <SunIcon size={14} /> },
                { id: "dark", label: "Escuro", icon: <MoonIcon size={14} /> },
                { id: "system", label: "Sistema", icon: <SettingsIcon size={14} /> },
              ]}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Diagnóstico</h1>
          <div className={styles.diagnostics}>
            {nativeCapability.status === "loading" && (
              <StatusBanner severity="info" title="Verificando acesso ao Registro do Windows…" />
            )}
            {nativeCapability.status === "success" && (
              <StatusBanner
                severity={nativeCapability.data.available ? "success" : "warning"}
                title={
                  nativeCapability.data.available
                    ? "Recurso nativo disponível"
                    : "Recurso nativo indisponível"
                }
                description={nativeCapability.data.message}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshIcon size={14} />}
                    onClick={recheckNativeCapability}
                  >
                    Verificar novamente
                  </Button>
                }
              />
            )}
            {nativeCapability.status === "error" && (
              <StatusBanner
                severity="danger"
                title="Falha ao verificar o recurso nativo"
                description={nativeCapability.message}
                action={
                  <Button variant="secondary" size="sm" onClick={recheckNativeCapability}>
                    Tentar novamente
                  </Button>
                }
              />
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>Simular alteração externa</span>
              <span className={styles.rowDescription}>
                Ferramenta de demonstração: simula outro programa alterando o esquema de sons do Windows
                enquanto o SoundDeck está aberto.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerExternalChangeDemo}>
              Simular
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Sobre</h1>
          <p className={styles.about}>
            SoundDeck 0.1.0 — gerenciador de esquemas de sons do Windows 10 e 11. A biblioteca já mostra
            packs reais; aplicar ao sistema e o histórico de backups ainda são simulados.
          </p>
          <ul className={styles.limitations}>
            <li>
              A biblioteca de packs e as prévias de áudio vêm de um catálogo real (28 esquemas clássicos),
              hospedado publicamente. Packs sem essa origem tocam um tom sintetizado no lugar do arquivo.
            </li>
            <li>Eventos por pack refletem os arquivos reais de cada esquema — nem todo pack cobre todos os eventos.</li>
            <li>Aplicar um pack ainda simula as fases do processo — nenhuma alteração é gravada no Registro.</li>
            <li>Backups são dados de demonstração, não vêm do sistema.</li>
            <li>
              Leitura real do Registro (diagnóstico acima) e o seletor nativo de arquivos já estão
              conectados.
            </li>
          </ul>
          <p className={styles.credit}>
            Agradecimentos a{" "}
            <a href="https://lelegofrog.github.io/wav.html" target="_blank" rel="noreferrer">
              lelegofrog.github.io
            </a>{" "}
            pelo arquivo de esquemas de som clássicos do Windows.
          </p>
        </section>
      </div>
    </div>
  );
}
