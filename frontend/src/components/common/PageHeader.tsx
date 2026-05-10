import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function PageHeader({
  title, subtitle, actions, breadcrumbs, className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {b.to ? (
                <Link to={b.to} className="hover:text-foreground transition-colors">{b.label}</Link>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="text-muted-foreground/60">/</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
