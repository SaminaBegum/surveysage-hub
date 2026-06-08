import type { ReactNode } from "react";

interface KPIProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "navy" | "electric" | "emerald" | "destructive";
  icon?: ReactNode;
}

const accentClasses = {
  navy: "from-navy/5 to-transparent text-navy",
  electric: "from-primary/10 to-transparent text-primary",
  emerald: "from-emerald/10 to-transparent text-emerald",
  destructive: "from-destructive/10 to-transparent text-destructive",
};

export function KPICard({ label, value, hint, accent = "electric", icon }: KPIProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 bg-gradient-to-br ${accentClasses[accent]} hover:shadow-elegant transition-all`}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-display font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
