import { clsx } from "clsx";

type Priority = "Low" | "Med" | "High";

interface PriorityChipProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { className: string }> = {
  Low: {
    className: "bg-emerald-500/20 text-emerald-400",
  },
  Med: {
    className: "bg-amber-500/20 text-amber-400",
  },
  High: {
    className: "bg-danger/20 text-danger",
  },
};

export function PriorityChip({ priority, className }: PriorityChipProps) {
  const config = priorityConfig[priority];
  
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {priority}
    </span>
  );
}

