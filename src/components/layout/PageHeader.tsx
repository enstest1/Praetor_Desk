import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { clsx } from "clsx";

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">
        {title}
      </h1>
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium",
            "text-white transition-all duration-150 hover:bg-primary/90",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          {action.icon || <Plus className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </header>
  );
}

