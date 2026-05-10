import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { TripCard } from "@/components/common/TripCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonGrid } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tripService, type Trip } from "@/lib/mock/travel";
import { Map, Plus, Search, LayoutGrid, List, Calendar, Wallet, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/trips/")({ component: MyTrips });

const STATUS_STYLES: Record<string, string> = {
  planning: "bg-blue-50 text-blue-600 border-blue-100",
  upcoming: "bg-primary/10 text-primary border-primary/20",
  ongoing: "bg-emerald-50 text-emerald-600 border-emerald-100",
  completed: "bg-muted text-muted-foreground border-border",
};

function MyTrips() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  const load = () => tripService.list().then(setTrips);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return (trips ?? []).filter((t) =>
      (status === "all" || t.status === status) &&
      (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase()))
    );
  }, [trips, q, status]);

  const onDelete = async () => {
    if (!pendingDelete) return;
    await tripService.remove(pendingDelete);
    setPendingDelete(null);
    toast.success("Trip deleted");
    load();
  };

  return (
    <>
      <PageHeader
        title="My Trips"
        subtitle="Plan, organize, and revisit your journeys."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}
        actions={<Button asChild><Link to="/trips/new"><Plus className="h-4 w-4 mr-2" />New trip</Link></Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="inline-flex border rounded-lg p-0.5 bg-muted/40 gap-0.5">
          <Button
            size="icon"
            variant={view === "grid" ? "secondary" : "ghost"}
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className="h-8 w-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "secondary" : "ghost"}
            onClick={() => setView("list")}
            aria-label="List view"
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {trips === null ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Map}
          title={trips.length === 0 ? "No trips yet" : "No trips match your filters"}
          description={
            trips.length === 0
              ? "Start by creating your first trip — you'll be exploring in no time."
              : "Try adjusting your search or filters."
          }
          action={
            trips.length === 0 && (
              <Button asChild>
                <Link to="/trips/new"><Plus className="h-4 w-4 mr-2" />Create your first trip</Link>
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => <TripCard key={t.id} trip={t} onDelete={setPendingDelete} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-soft">
              <img
                src={t.cover}
                alt={t.name}
                className="w-full sm:w-28 h-20 object-cover rounded-lg shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate text-sm">{t.name}</h3>
                  <Badge className={`capitalize border text-[11px] font-medium ${STATUS_STYLES[t.status] ?? ""}`}>
                    {t.status}
                  </Badge>
                </div>
                {t.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{t.stops.length} {t.stops.length === 1 ? "city" : "cities"}</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t.startDate ? format(new Date(t.startDate), "MMM d") : "—"} – {t.endDate ? format(new Date(t.endDate), "MMM d, yyyy") : "—"}
                  </span>
                  <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" />{formatCurrency(t.budget, currency)}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button asChild size="sm"><Link to="/trips/$tripId" params={{ tripId: t.id }}>View</Link></Button>
                <Button asChild size="sm" variant="outline"><Link to="/trips/$tripId/itinerary" params={{ tripId: t.id }}>Itinerary</Link></Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setPendingDelete(t.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the trip and all its itinerary data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
