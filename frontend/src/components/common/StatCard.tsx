import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, icon: Icon, trend, accent = "primary",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  accent?: "primary" | "success" | "warning" | "info";
}) {
  const iconColor = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[accent];

  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          {Icon && (
            <div className={cn("shrink-0 mt-0.5", iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
