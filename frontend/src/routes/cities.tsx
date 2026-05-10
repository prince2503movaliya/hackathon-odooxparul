import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { cityService, tripService, type City, type Trip } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonGrid } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, Search, Star, MapPin, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type S = { q?: string };
export const Route = createFileRoute("/cities")({
  component: Cities,
  validateSearch: (s: Record<string, unknown>): S => ({ q: typeof s.q === "string" ? s.q : undefined }),
});

const REGIONS = ["All", "India"];

function Cities() {
  const search = useSearch({ from: "/cities" });
  const [q, setQ] = useState(search.q ?? "");
  const [region, setRegion] = useState("All");
  const [cities, setCities] = useState<City[] | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => { tripService.list().then(setTrips); }, []);
  useEffect(() => {
    setCities(null);
    cityService.search(q, region).then(setCities);
  }, [q, region]);

  return (
    <>
      <PageHeader
        title="Discover Cities"
        subtitle="Explore destinations and plan your next stop."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Cities" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search city or country…" className="pl-9" />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {cities === null ? <SkeletonGrid count={6} /> : cities.length === 0 ? (
        <EmptyState icon={MapPin} title="No cities found" description="Try a different search or region." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => <CityCard key={c.id} city={c} trips={trips} />)}
        </div>
      )}
    </>
  );
}

function CityCard({ city, trips }: { city: City; trips: Trip[] }) {
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const addToTrip = async () => {
    if (!tripId) return toast.error("Pick a trip");
    if (!start || !end) return toast.error("Pick dates");
    await tripService.addStop(tripId, city, { startDate: start, endDate: end });
    toast.success(`${city.name} added to trip`);
    setOpen(false);
  };

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-md transition-all duration-200 group border-border/70">
      <div className="relative h-44 bg-muted overflow-hidden">
        <img src={city.image} alt={city.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-black/40 text-white border-0 backdrop-blur-sm text-[11px]">
          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />{city.popularity}
        </Badge>
        <div className="absolute bottom-3 left-3 text-white">
          <p className="font-semibold leading-none">{city.name}</p>
          <p className="text-xs opacity-80 mt-0.5">{city.country}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{city.tagline}</p>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" />{"$".repeat(city.costIndex)}
          </span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full text-xs mt-1">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add to Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add {city.name} to a trip</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Select value={tripId} onValueChange={setTripId}>
                <SelectTrigger><SelectValue placeholder="Pick a trip" /></SelectTrigger>
                <SelectContent>{trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Departure</p>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addToTrip}>Add to Trip</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
