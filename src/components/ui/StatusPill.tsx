import { clsx } from "clsx";

type Status = "active" | "paused" | "complete";

interface StatusPillProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  complete: {
    label: "Complete",
    className: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

