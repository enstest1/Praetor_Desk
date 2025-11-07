import { clsx } from "clsx";

interface ChainBadgeProps {
  chain: string;
  className?: string;
}

export function ChainBadge({ chain, className }: ChainBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300",
        className
      )}
    >
      {chain}
    </span>
  );
}

