import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  tripService, cityService, activityService,
  type Trip, type City, type Activity, type CityStop, type ItineraryActivity,
} from "@/lib/mock/travel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/common/Skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Clock, DollarSign, GripVertical, MapPin, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { toast } from "sonner";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/trips/$tripId/itinerary")({ component: ItineraryBuilder });

function ItineraryBuilder() {
  const { tripId } = useParams({ from: "/trips/$tripId/itinerary" });
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  const reload = () => tripService.get(tripId).then((t) => setTrip(t ?? null));
  useEffect(() => {
    reload();
    cityService.list().then(setCities);
    activityService.list().then(setActivities);
  }, [tripId]);

  if (trip === undefined) return <Skeleton className="h-96" />;
  if (trip === null) return <PageHeader title="Trip not found" />;

  const move = async (idx: number, dir: -1 | 1) => {
    const stops = [...trip.stops];
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    [stops[idx], stops[j]] = [stops[j], stops[idx]];
    await tripService.reorderStops(tripId, stops);
    reload();
  };

  const removeStop = async (stopId: string) => {
    await tripService.removeStop(tripId, stopId);
    toast.success("Stop removed");
    reload();
  };

  return (
    <>
      <PageHeader
        title="Itinerary builder"
        subtitle={trip.name}
        breadcrumbs={[
          { label: "My Trips", to: "/trips" },
          { label: trip.name, to: `/trips/${tripId}` as never },
          { label: "Itinerary" },
        ]}
        actions={
          <>
            <AddStopDialog cities={cities} trip={trip} onAdded={reload} />
            <Button asChild variant="outline"><Link to="/trips/$tripId/view" params={{ tripId }}>Timeline view</Link></Button>
          </>
        }
      />

      {trip.stops.length === 0 ? (
        <Card className="p-10 text-center">
          <MapPin className="h-10 w-10 mx-auto text-primary mb-2" />
          <h3 className="font-semibold">No city stops yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first city to start planning.</p>
          <AddStopDialog cities={cities} trip={trip} onAdded={reload} />
        </Card>
      ) : (
        <div className="space-y-4">
          {trip.stops.map((stop, idx) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={idx}
              total={trip.stops.length}
              activities={activities.filter((a) => a.city === stop.cityName)}
              allActivities={activities}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
              onRemove={() => removeStop(stop.id)}
              onChanged={reload}
              tripId={tripId}
              currency={currency}
            />
          ))}
        </div>
      )}
    </>
  );
}

function AddStopDialog({ cities, trip, onAdded }: { cities: City[]; trip: Trip; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [cityId, setCityId] = useState("");
  const [start, setStart] = useState(trip.startDate);
  const [end, setEnd] = useState(trip.endDate);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const city = cities.find((c) => c.id === cityId);
    if (!city) return toast.error("Pick a city");
    if (new Date(end) < new Date(start)) return toast.error("Invalid dates");
    setLoading(true);
    await tripService.addStop(trip.id, city, { startDate: start, endDate: end });
    setLoading(false); setOpen(false);
    toast.success(`${city.name} added`);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" /> Add city stop</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a city stop</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>City</Label>
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger><SelectValue placeholder="Pick a city" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}, {c.country}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Arrive</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Leave</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>Add stop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StopCard({
  stop, index, total, activities, allActivities, onMoveUp, onMoveDown, onRemove, onChanged, tripId,
}: {
  stop: CityStop;
  index: number; total: number;
  activities: Activity[];
  allActivities: Activity[];
  onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
  onChanged: () => void;
  tripId: string;
  currency: string;
}) {
  const [open, setOpen] = useState(true);
  const days = Math.max(1, differenceInDays(new Date(stop.endDate), new Date(stop.startDate)) + 1);

  const removeActivity = async (id: string) => {
    await tripService.removeActivity(tripId, stop.id, id);
    toast.success("Activity removed");
    onChanged();
  };

  return (
    <Card className="overflow-hidden shadow-soft">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="p-4 flex items-center gap-3 bg-gradient-card">
          <GripVertical className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <div className="w-8 h-8 grid place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{index + 1}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{stop.cityName} <span className="text-muted-foreground font-normal">· {stop.country}</span></h3>
            <p className="text-xs text-muted-foreground">{format(new Date(stop.startDate), "MMM d")} – {format(new Date(stop.endDate), "MMM d")} · {days} days · {stop.activities.length} activities</p>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={onMoveUp} disabled={index === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={onMoveDown} disabled={index === total - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={onRemove} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
            <CollapsibleTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Toggle">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Day-by-day plan</h4>
              <AddActivityDialog tripId={tripId} stop={stop} suggestions={activities.length ? activities : allActivities.slice(0, 6)} days={days} onAdded={onChanged} currency={currency} />
            </div>
            {Array.from({ length: days }).map((_, di) => {
              const dayNum = di + 1;
              const dayDate = addDays(new Date(stop.startDate), di);
              const acts = stop.activities.filter((a) => a.day === dayNum).sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div key={dayNum} className="mb-4 last:mb-0">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 grid place-items-center rounded-full bg-secondary text-secondary-foreground text-[10px]">D{dayNum}</span>
                    {format(dayDate, "EEE, MMM d")}
                  </div>
                  {acts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic pl-8">No activities planned.</p>
                  ) : (
                    <div className="space-y-2 pl-8 border-l-2 border-primary/20 ml-3">
                      {acts.map((a) => (
                        <div key={a.id} className="rounded-lg border bg-card p-3 flex items-center gap-3 -ml-[1.55rem] pl-4 relative">
                          <span className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                          <img src={a.image} alt="" className="w-12 h-12 rounded-md object-cover hidden sm:block" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{a.title}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time} · {a.durationHours}h</span>
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(a.cost, currency)}</span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{a.category}</Badge>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeActivity(a.id)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function AddActivityDialog({ tripId, stop, suggestions, days, onAdded, currency }: {
  tripId: string; stop: CityStop; suggestions: Activity[]; days: number; onAdded: () => void; currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState("");
  const [day, setDay] = useState("1");
  const [time, setTime] = useState("10:00");

  const submit = async () => {
    const a = suggestions.find((x) => x.id === activityId);
    if (!a) return toast.error("Pick an activity");
    const item: ItineraryActivity = { ...a, id: a.id + "-" + Date.now(), day: +day, time };
    await tripService.addActivity(tripId, stop.id, item);
    setOpen(false); setActivityId("");
    toast.success("Activity added");
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Add activity</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add activity to {stop.cityName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Activity</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger><SelectValue placeholder="Pick an activity" /></SelectTrigger>
              <SelectContent>
                {suggestions.map((a) => <SelectItem key={a.id} value={a.id}>{a.title} — {formatCurrency(a.cost, currency)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Day</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: days }).map((_, i) => <SelectItem key={i} value={String(i + 1)}>Day {i + 1}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
