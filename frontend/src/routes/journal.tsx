import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { tripService, type Trip, type TripNote } from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { NotebookPen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/journal")({ component: Journal });

function Journal() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Load trip list once to populate the selector
  useEffect(() => {
    tripService.list().then((t) => {
      setTrips(t);
      if (t[0]) setTripId(t[0].id);
    });
  }, []);

  // Whenever selected trip changes, load FULL trip detail (includes notes)
  useEffect(() => {
    if (!tripId) return;
    tripService.get(tripId).then((t) => setTrip(t ?? null));
  }, [tripId]);

  // Refresh full trip detail after mutations
  const refresh = async () => {
    if (!tripId) return;
    const updated = await tripService.get(tripId);
    setTrip(updated ?? null);
  };

  const add = async () => {
    if (!trip) return;
    if (!title.trim() || !content.trim()) return toast.error("Title and content required");
    await tripService.addNote(trip.id, { title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    toast.success("Note added");
    await refresh(); // Use get() so notes are included in response
  };

  const remove = async (n: TripNote) => {
    if (!trip) return;
    await tripService.removeNote(trip.id, n.id);
    await refresh();
    toast("Deleted");
  };

  if (trips === null) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Travel journal"
        subtitle="Capture moments, notes, and memories."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Journal" }]}
        actions={
          <Select value={tripId} onValueChange={setTripId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Pick a trip" /></SelectTrigger>
            <SelectContent>
              {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {!trip ? (
        <Card className="p-6 text-sm text-muted-foreground">No trip selected.</Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* New entry form */}
          <Card className="p-5 lg:col-span-1 h-fit sticky top-20">
            <h3 className="font-semibold mb-3">New entry</h3>
            <div className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                rows={6}
                placeholder="What happened today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
              />
              <Button className="w-full" onClick={add}>Save entry</Button>
            </div>
          </Card>

          {/* Notes list */}
          <div className="lg:col-span-2">
            {trip.notes.length === 0 ? (
              <EmptyState
                icon={NotebookPen}
                title="No notes yet"
                description="Write your first journal entry on the left."
              />
            ) : (
              <div className="relative pl-6 border-l-2 border-primary/20 space-y-5">
                {trip.notes.map((n) => (
                  <div key={n.id} className="relative">
                    <span className="absolute -left-[1.85rem] top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <Card className="p-5 group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{n.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {n.createdAt ? format(new Date(n.createdAt), "PPp") : ""}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8"
                          onClick={() => remove(n)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mt-2 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
