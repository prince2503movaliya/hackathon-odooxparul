import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { tripService, estimateBudget, type Trip } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/common/Skeleton";
import { Plane, Copy, Twitter, Facebook, Link2, Calendar, MapPin, Wallet, Clock } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/share/$tripId")({ component: Share });

function Share() {
  const { tripId } = useParams({ from: "/share/$tripId" });
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";
  useEffect(() => { tripService.get(tripId).then((t) => setTrip(t ?? null)); }, [tripId]);

  if (trip === undefined) return <div className="p-10"><Skeleton className="h-96" /></div>;
  if (trip === null) return <div className="min-h-screen grid place-items-center"><p>Trip not found.</p></div>;

  const est = estimateBudget(trip);
  const copy = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-hero text-primary-foreground"><Plane className="h-4 w-4" /></span>
            Traveloop
          </Link>
          <Button asChild size="sm"><Link to="/signup">Copy this trip</Link></Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative h-56 rounded-2xl overflow-hidden mb-6 shadow-soft">
          <img src={trip.cover} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 p-6 text-white">
            <Badge className="bg-white/20 border-0 mb-2">Shared itinerary</Badge>
            <h1 className="text-3xl font-semibold">{trip.name}</h1>
            <p className="opacity-90">{trip.description}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Dates</div><p className="font-semibold mt-1">{format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d")}</p></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Cities</div><p className="font-semibold mt-1">{trip.stops.length} stops</p></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Budget</div><p className="font-semibold mt-1">{formatCurrency(est.total, currency)}</p></Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" onClick={copy}><Link2 className="h-4 w-4 mr-1" /> Copy link</Button>
          <Button variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1" /> Share</Button>
          <Button variant="outline" asChild><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(trip.name)}`} target="_blank" rel="noreferrer"><Twitter className="h-4 w-4 mr-1" /> Twitter</a></Button>
          <Button variant="outline" asChild><a href="#" onClick={(e) => { e.preventDefault(); copy(); }}><Facebook className="h-4 w-4 mr-1" /> Facebook</a></Button>
        </div>

        <div className="space-y-8">
          {trip.stops.map((stop, si) => {
            const days = Math.max(1, differenceInDays(new Date(stop.endDate), new Date(stop.startDate)) + 1);
            return (
              <section key={stop.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 grid place-items-center rounded-full bg-primary text-primary-foreground font-semibold">{si + 1}</div>
                  <h2 className="text-xl font-semibold">{stop.cityName}, {stop.country}</h2>
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  {Array.from({ length: days }).map((_, di) => {
                    const acts = stop.activities.filter((a) => a.day === di + 1).sort((a, b) => a.time.localeCompare(b.time));
                    return (
                      <Card key={di} className="p-4">
                        <p className="font-medium text-sm mb-2">Day {di + 1} · {format(addDays(new Date(stop.startDate), di), "EEE, MMM d")}</p>
                        {acts.length === 0 ? <p className="text-xs text-muted-foreground italic">Free day</p> : (
                          <ul className="space-y-1.5 text-sm">
                            {acts.map((a) => (
                              <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-xs font-mono text-primary">{a.time}</span>
                                <span className="font-medium flex-1 min-w-0">{a.title}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.durationHours}h</span>
                                <span className="text-xs text-muted-foreground font-medium">{formatCurrency(a.cost, currency)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <Card className="p-6 mt-10 text-center bg-gradient-card">
          <h3 className="font-semibold text-lg">Inspired? Plan your own trip.</h3>
          <p className="text-sm text-muted-foreground mt-1">Sign up free and start building itineraries in minutes.</p>
          <Button asChild className="mt-4"><Link to="/signup">Get started</Link></Button>
        </Card>
      </main>
    </div>
  );
}
