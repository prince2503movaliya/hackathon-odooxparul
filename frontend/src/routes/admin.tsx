import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/common/Skeleton";
import { Users, Map, Sparkles, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { apiClient } from "@/lib/apiClient";
import { authService } from "@/lib/mock/auth";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({ component: Admin });

interface AdminStats {
  counts: { users: number; trips: number; cities: number };
  popularCities: Array<{ name: string; _count: { tripStops: number } }>;
  recentTrips: Array<{ id: string; title: string; createdAt: string; user: { name: string } }>;
}

function Admin() {
  const user = authService.current();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      apiClient<AdminStats>("/admin/stats").then(setStats);
    }
  }, [user]);
  
  if (!user || user.role !== "ADMIN") return <Navigate to="/dashboard" />;
  if (!stats) return <Skeleton className="h-96" />;

  const cityCounts = (stats.popularCities || []).map((c) => ({ 
    name: c.name, 
    value: c._count.tripStops 
  }));
  const trend = Array.from({ length: 7 }).map((_, i) => ({ 
    day: `D${i+1}`, 
    trips: 10 + Math.floor(Math.random() * 20), 
    users: 30 + Math.floor(Math.random() * 50) 
  }));
  const recentTrips = stats.recentTrips || [];
  const counts = stats.counts || { users: 0, trips: 0, cities: 0 };

  return (
    <>
      <PageHeader title="Admin analytics" subtitle="Platform-wide insights." breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Admin" }]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value={counts.users.toLocaleString()} icon={Users} accent="primary" />
        <StatCard label="Trips planned" value={counts.trips.toLocaleString()} icon={Map} accent="info" />
        <StatCard label="Database cities" value={counts.cities.toLocaleString()} icon={Sparkles} accent="success" />
        <StatCard label="System health" value="100%" icon={TrendingUp} accent="warning" trend="Stable" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Top cities</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={cityCounts} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {cityCounts.map((_, i) => <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Activity trends (7d)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="trips" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="p-5 mt-6">
        <h3 className="font-semibold mb-4">Recent system activity</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground"><th className="py-2">Trip</th><th>User</th><th className="text-right">Planned on</th></tr></thead>
          <tbody>
            {recentTrips.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="py-2 font-medium">{t.title}</td>
                <td>{t.user?.name}</td>
                <td className="text-right text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
