import { Link } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";

export function Logo({ size = "md", linkTo = "/" }: { size?: "sm" | "md" | "lg"; linkTo?: string }) {
  const dims = size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link to={linkTo} className="flex items-center gap-2.5 group">
      <div className={`${dims} rounded-lg bg-gradient-to-br from-navy to-electric shadow-elegant flex items-center justify-center text-white relative overflow-hidden`}>
        <CheckSquare className="size-1/2" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-display font-bold tracking-tight text-navy dark:text-foreground`}>
        SurveySathi <span className="text-electric">Pro</span>
      </span>
    </Link>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-gradient-to-br from-navy to-electric flex items-center justify-center text-white font-display font-bold tracking-tighter ${className}`}>
      SSP
    </div>
  );
}
