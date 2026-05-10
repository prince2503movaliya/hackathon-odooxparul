import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { activityService, type Activity } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonGrid } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark, Clock, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/activities")({ component: Activities });

const CATS = ["All", "Food", "Culture", "Adventure", "Nature", "Nightlife", "Shopping"];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700 border-orange-200",
  Culture: "bg-purple-100 text-purple-700 border-purple-200",
  Adventure: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Nature: "bg-green-100 text-green-700 border-green-200",
  Nightlife: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Shopping: "bg-pink-100 text-pink-700 border-pink-200",
};

function Activities() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [maxCost, setMaxCost] = useState(200);
  const [maxHours, setMaxHours] = useState(8);
  const [list, setList] = useState<Activity[] | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  useEffect(() => {
    setList(null);
    activityService.search({ q, category: cat, maxCost, maxHours }).then(setList);
  }, [q, cat, maxCost, maxHours]);

  const toggle = (id: string) => {
    const next = new Set(saved);
    if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
    else { next.add(id); toast.success("Saved!"); }
    setSaved(next);
  };

  return (
    <>
      <PageHeader
        title="Discover Activities"
        subtitle="Curated things to do in every destination."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Activities" }]}
      />

      {/* Filters */}
      <Card className="p-4 mb-6 border-border/70">
        <div className="grid sm:grid-cols-4 gap-4 items-end">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Max cost: {formatCurrency(maxCost, currency)}</p>
              <Slider value={[maxCost]} max={300} step={10} onValueChange={(v) => setMaxCost(v[0])} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Max duration: {maxHours}h</p>
              <Slider value={[maxHours]} max={12} step={1} onValueChange={(v) => setMaxHours(v[0])} />
            </div>
          </div>
        </div>
      </Card>

      {list === null ? <SkeletonGrid count={6} /> : list.length === 0 ? (
        <EmptyState icon={Sparkles} title="No activities match" description="Loosen your filters and try again." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Card key={a.id} className="overflow-hidden shadow-soft hover:shadow-md transition-all duration-200 group border-border/70">
              <div className="relative h-40 bg-muted overflow-hidden">
                <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className={`absolute top-3 left-3 border text-[11px] font-medium ${CATEGORY_COLORS[a.category] ?? "bg-muted text-muted-foreground border-border"}`}>
                  {a.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{a.city}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{a.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.durationHours}h</span>
                    <span className="font-semibold text-foreground">{formatCurrency(a.cost, currency)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={saved.has(a.id) ? "default" : "outline"}
                    className="h-7 text-xs px-2.5"
                    onClick={() => toggle(a.id)}
                  >
                    <Bookmark className="h-3.5 w-3.5 mr-1" />
                    {saved.has(a.id) ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
