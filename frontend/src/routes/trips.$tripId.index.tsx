import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { tripService, estimateBudget, type Trip } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/common/Skeleton";
import { Calendar, MapPin, Wallet, ListChecks, NotebookPen, PieChart, Share2, ArrowRight, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";
import { useState as useLocalState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/trips/$tripId/")({ component: TripDetail });

function TripDetail() {
  const { tripId } = useParams({ from: "/trips/$tripId/" });
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  useEffect(() => { tripService.get(tripId).then((t) => setTrip(t ?? null)); }, [tripId]);

  const [copied, setCopied] = useLocalState(false);
  const copyLink = () => {
    const url = `${window.location.origin}/share/${tripId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (trip === undefined) {
    return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /></div>;
  }
  if (trip === null) {
    return <PageHeader title="Trip not found" subtitle="It may have been deleted." actions={<Button asChild><Link to="/trips">Back to trips</Link></Button>} />;
  }

  const est = estimateBudget(trip);
  const overBudget = est.total > trip.budget;

  return (
    <>
      <div className="relative h-56 sm:h-64 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6 overflow-hidden">
        <img src={trip.cover} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white max-w-7xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 capitalize mb-2">{trip.status}</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{trip.name}</h1>
          <p className="opacity-90 mt-1 max-w-2xl">{trip.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild><Link to="/trips/$tripId/itinerary" params={{ tripId }}>Edit itinerary</Link></Button>
        <Button asChild variant="outline"><Link to="/trips/$tripId/view" params={{ tripId }}>Timeline view</Link></Button>
        <Button asChild variant="outline"><Link to="/share/$tripId" params={{ tripId }}><Share2 className="h-4 w-4 mr-1" /> Preview share</Link></Button>
        <Button variant="outline" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4 mr-1 text-success" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Dates</div>
          <p className="font-semibold mt-1">{format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d, yyyy")}</p>
          <p className="text-xs text-muted-foreground mt-1">{est.days} days</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Cities</div>
          <p className="font-semibold mt-1">{trip.stops.length} stops</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{trip.stops.map((s) => s.cityName).join(" → ") || "No stops yet"}</p>
        </Card>
        <Card className={`p-5 ${overBudget ? "border-destructive/40 bg-destructive/5" : ""}`}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Budget</div>
          <p className="font-semibold mt-1">{formatCurrency(est.total, currency)} <span className="text-xs text-muted-foreground">/ {formatCurrency(trip.budget, currency)}</span></p>
          <p className={`text-xs mt-1 ${overBudget ? "text-destructive" : "text-muted-foreground"}`}>
            {overBudget ? "Over budget" : `${Math.round((est.total / trip.budget) * 100)}% of budget`}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">City stops</h2>
            <Link to="/trips/$tripId/itinerary" params={{ tripId }} className="text-sm text-primary hover:underline">Edit →</Link>
          </div>
          {trip.stops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stops yet — add cities in the itinerary builder.</p>
          ) : (
            <ol className="space-y-3">
              {trip.stops.map((s, i) => (
                <li key={s.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition">
                  <div className="w-8 h-8 grid place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.cityName}, <span className="text-muted-foreground">{s.country}</span></p>
                    <p className="text-xs text-muted-foreground">{format(new Date(s.startDate), "MMM d")} – {format(new Date(s.endDate), "MMM d")} • {s.activities.length} activities</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ol>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Quick links</h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <Link to="/trips/$tripId/itinerary" params={{ tripId }} className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5"><span>Itinerary builder</span><ArrowRight className="h-4 w-4" /></Link>
              <Link to="/budget" className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5"><span>Budget analytics</span><ArrowRight className="h-4 w-4" /></Link>
              <Link to="/packing" className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5"><span><ListChecks className="inline h-3.5 w-3.5 mr-1" /> Packing list</span><ArrowRight className="h-4 w-4" /></Link>
              <Link to="/journal" className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5"><span><NotebookPen className="inline h-3.5 w-3.5 mr-1" /> Journal</span><ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
