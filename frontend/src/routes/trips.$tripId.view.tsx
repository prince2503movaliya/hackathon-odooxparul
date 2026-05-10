import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { tripService, type Trip } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Printer, Share2 } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/trips/$tripId/view")({ component: TimelineView });

function TimelineView() {
  const { tripId } = useParams({ from: "/trips/$tripId/view" });
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";
  useEffect(() => { tripService.get(tripId).then((t) => setTrip(t ?? null)); }, [tripId]);

  if (trip === undefined) return <Skeleton className="h-96" />;
  if (trip === null) return <PageHeader title="Trip not found" />;

  return (
    <>
      <PageHeader
        title={trip.name}
        subtitle="Day-by-day timeline"
        breadcrumbs={[{ label: "My Trips", to: "/trips" }, { label: trip.name, to: `/trips/${tripId}` as never }, { label: "Timeline" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
            <Button asChild><Link to="/share/$tripId" params={{ tripId }}><Share2 className="h-4 w-4 mr-1" /> Share</Link></Button>
          </>
        }
      />
      {trip.stops.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No stops yet. <Link to="/trips/$tripId/itinerary" params={{ tripId }} className="text-primary">Build your itinerary</Link>.</Card>
      ) : (
        <div className="space-y-8">
          {trip.stops.map((stop, si) => {
            const days = Math.max(1, differenceInDays(new Date(stop.endDate), new Date(stop.startDate)) + 1);
            return (
              <section key={stop.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 grid place-items-center rounded-full bg-primary text-primary-foreground font-semibold">{si + 1}</div>
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {stop.cityName}, {stop.country}</h2>
                    <p className="text-xs text-muted-foreground">{format(new Date(stop.startDate), "MMM d")} – {format(new Date(stop.endDate), "MMM d")}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: days }).map((_, di) => {
                    const dayNum = di + 1;
                    const acts = stop.activities.filter((a) => a.day === dayNum).sort((a, b) => a.time.localeCompare(b.time));
                    const cost = acts.reduce((s, a) => s + a.cost, 0);
                    return (
                      <Card key={dayNum} className="p-4 shadow-soft">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm">Day {dayNum}</p>
                          <span className="text-xs text-muted-foreground">{format(addDays(new Date(stop.startDate), di), "EEE, MMM d")}</span>
                        </div>
                        {acts.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Free day</p>
                        ) : (
                          <ul className="space-y-2">
                            {acts.map((a) => (
                              <li key={a.id} className="text-sm border-l-2 border-primary/30 pl-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-primary">{a.time}</span>
                                  <span className="font-medium">{a.title}</span>
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.durationHours}h</span>
                                  <span className="font-medium text-primary">{formatCurrency(a.cost, currency)}</span>
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{a.category}</Badge>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {cost > 0 && <p className="text-xs text-right text-muted-foreground mt-3 pt-2 border-t">Day total: <span className="font-semibold text-foreground">{formatCurrency(cost, currency)}</span></p>}
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
