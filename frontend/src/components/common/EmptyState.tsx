import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center rounded-xl border border-dashed bg-card/60 p-10",
      className
    )}>
      <div className="rounded-full bg-primary/10 text-primary p-4 mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
