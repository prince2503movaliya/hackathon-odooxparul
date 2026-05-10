import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { tripService, estimateBudget, type Trip } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/common/StatCard";
import { Skeleton } from "@/components/common/Skeleton";
import { AlertTriangle, Calendar, PieChart as PieIcon, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/budget")({ component: Budget });

function Budget() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [tripId, setTripId] = useState<string>("");
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";
  useEffect(() => { tripService.list().then((t) => { setTrips(t); if (t[0]) setTripId(t[0].id); }); }, []);

  if (trips === null) return <Skeleton className="h-96" />;
  const trip = trips.find((t) => t.id === tripId);

  return (
    <>
      <PageHeader
        title="Budget analytics"
        subtitle="See where every dollar of your trip is going."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Budget" }]}
        actions={
          <Select value={tripId} onValueChange={setTripId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Pick a trip" /></SelectTrigger>
            <SelectContent>{trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        }
      />
      {!trip ? <Card className="p-10 text-center text-sm text-muted-foreground">No trips yet.</Card> : <BudgetView trip={trip} currency={currency} />}
    </>
  );
}

function BudgetView({ trip, currency }: { trip: Trip; currency: string }) {
  const est = estimateBudget(trip);
  const over = est.total > trip.budget;
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Estimated total" value={formatCurrency(est.total, currency)} icon={Wallet} accent={over ? "warning" : "primary"} trend={`Budget ${formatCurrency(trip.budget, currency)}`} />
        <StatCard label="Daily average" value={formatCurrency(est.dailyAverage, currency)} icon={Calendar} accent="info" trend={`${est.days} days`} />
        <StatCard label="Stops" value={trip.stops.length} icon={PieIcon} accent="success" />
        <StatCard label={over ? "Over budget" : "Within budget"} value={`${Math.round((est.total / trip.budget) * 100)}%`} icon={AlertTriangle} accent={over ? "warning" : "success"} />
      </div>
      {over && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive-foreground p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Over budget by {formatCurrency(est.total - trip.budget, currency)}</p>
            <p className="text-muted-foreground">Consider trimming activities or shortening city stays.</p>
          </div>
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Breakdown by category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={est.breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {est.breakdown.map((b, i) => <Cell key={i} fill={`var(--chart-${i + 1})`} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Spend by category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={est.breakdown}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip formatter={(v: number) => formatCurrency(v, currency)} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {est.breakdown.map((_, i) => <Cell key={i} fill={`var(--chart-${i + 1})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {est.breakdown.map((b, i) => (
          <Card key={b.name} className="p-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: `var(--chart-${i + 1})` }} /><p className="text-sm text-muted-foreground">{b.name}</p></div>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(b.value, currency)}</p>
            <p className="text-xs text-muted-foreground">{Math.round((b.value / est.total) * 100)}% of total</p>
          </Card>
        ))}
      </div>
    </>
  );
}
