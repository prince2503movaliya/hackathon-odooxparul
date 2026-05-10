import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { tripService, type Trip, type PackingItem } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/common/Skeleton";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/packing")({ component: Packing });

const CATS: PackingItem["category"][] = ["Clothing", "Electronics", "Documents", "Essentials"];

function Packing() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<PackingItem["category"]>("Essentials");

  // Load trip list once on mount to populate the selector
  useEffect(() => {
    tripService.list().then((t) => {
      setTrips(t);
      if (t[0]) setTripId(t[0].id);
    });
  }, []);

  // Whenever the selected tripId changes, fetch the FULL trip detail
  // (the list endpoint doesn't include packingItems)
  useEffect(() => {
    if (!tripId) return;
    tripService.get(tripId).then((t) => setTrip(t ?? null));
  }, [tripId]);

  const packing = trip?.packing ?? [];
  const progress = useMemo(
    () => (packing.length ? Math.round((packing.filter((p) => p.packed).length / packing.length) * 100) : 0),
    [packing]
  );

  // Helper: refresh the current trip from the API (full detail)
  const refresh = async () => {
    if (!tripId) return;
    const updated = await tripService.get(tripId);
    setTrip(updated ?? null);
  };

  const toggle = async (id: string, current: boolean) => {
    if (!trip) return;
    await tripService.togglePackingItem(trip.id, id, !current);
    await refresh();
  };

  const remove = async (id: string) => {
    if (!trip) return;
    await tripService.removePackingItem(trip.id, id);
    await refresh();
    toast("Removed");
  };

  const add = async () => {
    if (!name.trim() || !trip) return;
    await tripService.addPackingItem(trip.id, { name: name.trim(), category: cat });
    await refresh(); // Re-fetch the full trip so packingItems are included
    setName("");
    toast.success("Added");
  };

  if (trips === null) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Packing checklist"
        subtitle="Don't leave anything behind."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Packing" }]}
        actions={
          <Select value={tripId} onValueChange={setTripId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {!trip ? (
        <Card className="p-6 text-sm text-muted-foreground">No trip selected.</Card>
      ) : (
        <>
          {/* Progress */}
          <Card className="p-5 mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Packed {packing.filter((p) => p.packed).length} of {packing.length}</p>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
            <Progress value={progress} />
          </Card>

          {/* Add item */}
          <Card className="p-4 mb-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Add an item…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                className="flex-1"
              />
              <Select value={cat} onValueChange={(v) => setCat(v as PackingItem["category"])}>
                <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
          </Card>

          {/* Category sections */}
          <div className="grid sm:grid-cols-2 gap-4">
            {CATS.map((c) => {
              const items = packing.filter((p) => p.category === c);
              return (
                <Card key={c} className="p-4">
                  <h3 className="font-semibold mb-3">{c}</h3>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No items.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {items.map((p) => (
                        <li key={p.id} className="flex items-center gap-3 group rounded-md hover:bg-accent px-2 py-1.5">
                          <Checkbox checked={p.packed} onCheckedChange={() => toggle(p.id, p.packed)} />
                          <span className={`flex-1 text-sm ${p.packed ? "line-through text-muted-foreground" : ""}`}>
                            {p.name}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7"
                            onClick={() => remove(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
