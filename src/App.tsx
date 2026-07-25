import "./styles/tokens.css";
import "./styles/base.css";
import { AppStateProvider } from "./app/AppState";
import { AppShell } from "./app/AppShell";

function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}

export default App;
