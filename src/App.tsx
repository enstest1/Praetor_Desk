import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import AirdropsTab from "./tabs/AirdropsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import IdeasTab from "./tabs/IdeasTab";
import BrainstormTab from "./tabs/BrainstormTab";
import HouseTab from "./tabs/HouseTab";
import CalendarTab from "./tabs/CalendarTab";
import { TauriWarning } from "./components/TauriWarning";

const tabs: Record<string, React.ComponentType> = {
  airdrops: AirdropsTab,
  projects: ProjectsTab,
  ideas: IdeasTab,
  brainstorm: BrainstormTab,
  house: HouseTab,
  calendar: CalendarTab,
  settings: () => <div className="p-10 text-slate-400">Settings coming soon</div>,
};

function App() {
  const [activeRoute, setActiveRoute] = useState("airdrops");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const ActiveComponent = tabs[activeRoute] || AirdropsTab;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b0d12] to-[#141821] text-slate-100">
      <TauriWarning />
      <div className="flex h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeRoute={activeRoute}
          onRouteChange={setActiveRoute}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

export default App;
