import { useEffect, useState } from "react";
import { ConfigContext, appConfig, applyConfigTheme } from "./config/serverConfig";
import Titlebar from "./components/Titlebar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/app.css";

/**
 * Root application component — applies white-label config theme
 * and renders the launcher layout (Titlebar + Sidebar + Content).
 */
function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "settings">("home");

  // Apply dynamic CSS theme on mount
  useEffect(() => {
    applyConfigTheme(appConfig);
  }, []);

  return (
    <ConfigContext.Provider value={appConfig}>
      <div className="app-container scanline-overlay">
        <Titlebar />
        <div className="app-body">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="app-content">
            {currentPage === "home" && <HomePage />}
            {currentPage === "settings" && <SettingsPage />}
          </main>
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

export default App;
