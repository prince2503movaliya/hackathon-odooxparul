import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TripCard } from "@/components/common/TripCard";
import { SkeletonGrid } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { tripService, cityService, type Trip, type City } from "@/lib/mock/travel";
import { authService } from "@/lib/mock/auth";
import { Plus, Map, Wallet, Calendar, Sparkles, ArrowRight, ListChecks, NotebookPen, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const user = authService.current();

  useEffect(() => {
    tripService.list().then(setTrips);
    cityService.list().then((c) => setCities(c.slice(0, 4)));
  }, []);

  const upcoming = (trips ?? []).filter((t) => t.status === "upcoming" || t.status === "planning");
  const totalBudget = (trips ?? []).reduce((s, t) => s + t.budget, 0);
  const totalCities = (trips ?? []).reduce((s, t) => s + t.stops.length, 0);
  const totalDays = (trips ?? []).reduce((s, t) => s + Math.max(1, Math.round((+new Date(t.endDate) - +new Date(t.startDate)) / 86400000)), 0);
  const currency = user?.preferences.currency || "USD";

  return (
    <>
      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""} 👋`}
        subtitle="Here's a snapshot of your upcoming adventures."
        actions={
          <Button asChild>
            <Link to="/trips/new"><Plus className="h-4 w-4 mr-2" /> Plan New Trip</Link>
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Trips" value={trips?.length ?? "—"} icon={Map} accent="primary" trend="All your journeys" />
        <StatCard label="Cities Planned" value={totalCities || "—"} icon={Sparkles} accent="info" trend="Across all trips" />
        <StatCard label="Total Budget" value={formatCurrency(totalBudget, currency)} icon={Wallet} accent="success" trend="Planned spend" />
        <StatCard label="Days Planned" value={totalDays || "—"} icon={Calendar} accent="warning" trend="Total travel days" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Trips */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Upcoming Trips</h2>
              <Link to="/trips" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {trips === null ? (
              <SkeletonGrid count={2} />
            ) : upcoming.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-muted-foreground">No upcoming trips.</p>
                <Link to="/trips/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                  Plan your first adventure →
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.slice(0, 2).map((t) => <TripCard key={t.id} trip={t} />)}
              </div>
            )}
          </section>

          {/* Recommended Destinations */}
          <section>
            <h2 className="text-base font-semibold mb-4">Recommended Destinations</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cities.map((c) => (
                <Link key={c.id} to="/cities" className="group relative h-32 rounded-xl overflow-hidden border border-border/60">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-semibold text-sm leading-none">{c.name}</p>
                    <p className="text-xs opacity-80 mt-1">{c.country} · {c.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { to: "/trips/new", label: "Create a new trip", icon: Plus },
                { to: "/cities", label: "Discover cities", icon: Map },
                { to: "/budget", label: "Review budgets", icon: PieChart },
                { to: "/packing", label: "Packing lists", icon: ListChecks },
                { to: "/journal", label: "Travel journal", icon: NotebookPen },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center justify-between rounded-lg hover:bg-muted/60 transition-colors px-3 py-2.5 text-sm group"
                >
                  <span className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                    <a.icon className="h-4 w-4 shrink-0 text-primary" />
                    {a.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Itineraries */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Itineraries</h3>
            {trips && trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No itineraries yet.</p>
            ) : (
              <ul className="space-y-1">
                {(trips ?? []).slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/trips/$tripId/itinerary"
                      params={{ tripId: t.id }}
                      className="flex items-center justify-between group rounded-lg hover:bg-muted/60 transition-colors px-3 py-2 -mx-3 text-sm"
                    >
                      <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">{t.name}</span>
                      <span className="text-xs text-muted-foreground/70 shrink-0 ml-3">{t.stops.length} stops</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
