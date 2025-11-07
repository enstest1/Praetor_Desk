import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={clsx("text-lg font-semibold tracking-tight text-slate-100", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <p className={clsx("text-sm text-slate-400", className)}>
      {children}
    </p>
  );
}

export function CardSection({ children, className }: CardProps) {
  return <div className={clsx("mt-4 space-y-4", className)}>{children}</div>;
}
