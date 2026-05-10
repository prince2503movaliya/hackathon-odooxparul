import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/lib/mock/travel";
import { format } from "date-fns";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  planning: "bg-blue-50 text-blue-600 border-blue-100",
  upcoming: "bg-primary/10 text-primary border-primary/20",
  ongoing: "bg-emerald-50 text-emerald-600 border-emerald-100",
  completed: "bg-muted text-muted-foreground border-border",
};

export function TripCard({ trip, onDelete }: { trip: Trip; onDelete?: (id: string) => void }) {
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  const startLabel = trip.startDate ? format(new Date(trip.startDate), "MMM d") : "—";
  const endLabel = trip.endDate ? format(new Date(trip.endDate), "MMM d, yyyy") : "—";

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-md transition-all duration-200 group border-border/70">
      <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="block">
        <div className="relative h-44 bg-muted overflow-hidden">
          <img
            src={trip.cover}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge
            className={`absolute top-3 right-3 capitalize border text-[11px] font-medium ${STATUS_STYLES[trip.status] ?? ""}`}
          >
            {trip.status}
          </Badge>
        </div>
      </Link>

      <div className="p-4">
        <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
          <h3 className="font-semibold text-base leading-tight truncate hover:text-primary transition-colors">
            {trip.name}
          </h3>
        </Link>
        {trip.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{trip.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {trip.stops.length} {trip.stops.length === 1 ? "city" : "cities"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {startLabel} – {endLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            {formatCurrency(trip.budget, currency)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <Button asChild variant="ghost" size="sm" className="flex-1 justify-between text-xs font-medium">
            <Link to="/trips/$tripId/itinerary" params={{ tripId: trip.id }}>
              View Itinerary
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(trip.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
