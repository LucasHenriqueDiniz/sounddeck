import "./styles/tokens.css";
import "./styles/base.css";
import { AppStateProvider } from "./app/AppState";
import { AppShell } from "./app/AppShell";
import { I18nProvider } from "./i18n";

function App() {
  return (
    <I18nProvider>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </I18nProvider>
  );
}

export default App;
