import { 
  Coins, FolderKanban, Sparkles, Workflow, Building2, CalendarDays, Settings,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const navItems = [
  { id: "airdrops", label: "Airdrops", icon: Coins },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "ideas", label: "Ideas", icon: Sparkles },
  { id: "brainstorm", label: "Brainstorm", icon: Workflow },
  { id: "house", label: "House", icon: Building2 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle, activeRoute, onRouteChange }: SidebarProps) {
  return (
    <aside
      className={clsx(
        "relative flex flex-col border-r border-white/10 bg-panel transition-all duration-150",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-panel shadow-soft hover:bg-white/5"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-slate-300" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-300" />
        )}
      </button>

      {/* Nav items */}
      <nav className={clsx("flex flex-col gap-2 p-4", collapsed ? "items-center" : "")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.id)}
              className={clsx(
                "group relative flex items-center rounded-xl text-sm transition-all duration-150",
                "hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50",
                collapsed
                  ? "h-10 w-10 justify-center px-0"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-white/10 text-primary"
                  : "text-slate-300 hover:text-slate-100"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={clsx("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
              {!collapsed && (
                <span className="font-medium tracking-tight">{item.label}</span>
              )}
              {collapsed && (
                <div className="pointer-events-none invisible absolute left-full ml-2 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-100 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

