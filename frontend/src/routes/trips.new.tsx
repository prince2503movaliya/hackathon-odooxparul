import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { tripService } from "@/lib/mock/travel";
import { toast } from "sonner";
import { Calendar, ImagePlus, Loader2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { authService } from "@/lib/mock/auth";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/trips/new")({ component: NewTrip });

const COVERS = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=70",
];

function NewTrip() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [budget, setBudget] = useState<string>("2000");
  const [cover, setCover] = useState(COVERS[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const user = authService.current();
  const currency = user?.preferences.currency || "USD";

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Trip name is required.";
    if (!startDate) e.startDate = "Pick a start date.";
    if (!endDate) e.endDate = "Pick an end date.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) e.endDate = "End date must be after start.";
    if (!budget || +budget < 0) e.budget = "Budget must be positive.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const trip = await tripService.create({
        name: name.trim(), description, startDate, endDate, budget: +budget, cover,
      });
      toast.success("Trip created!");
      nav({ to: "/trips/$tripId", params: { tripId: trip.id } });
    } catch { toast.error("Couldn't create trip."); }
    finally { setLoading(false); }
  };

  const previewDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    return Math.max(1, Math.round((+new Date(endDate) - +new Date(startDate)) / 86400000));
  }, [startDate, endDate]);

  return (
    <>
      <PageHeader
        title="Plan a new trip"
        subtitle="Set the basics — you can add cities, activities, and notes after."
        breadcrumbs={[{ label: "My Trips", to: "/trips" }, { label: "New trip" }]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 shadow-soft">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Trip name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Japan Discovery" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary of what this trip is about." rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget target ({currency})</Label>
              <Input id="budget" type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
              {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Cover image</Label>
              <div className="grid grid-cols-4 gap-2">
                {COVERS.map((c) => (
                  <button type="button" key={c} onClick={() => setCover(c)}
                    className={`relative h-20 rounded-md overflow-hidden border-2 transition ${cover === c ? "border-primary shadow-glow" : "border-transparent"}`}>
                    <img src={c} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Pick a cover (upload coming soon).</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create trip
              </Button>
              <Button type="button" variant="outline" onClick={() => nav({ to: "/trips" })}>Cancel</Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden shadow-soft sticky top-20 h-fit">
          <div className="h-40 bg-muted">
            <img src={cover} alt="cover preview" className="w-full h-full object-cover" />
          </div>
          <div className="p-5 space-y-3">
            <h3 className="font-semibold text-lg">{name || "Your trip name"}</h3>
            <p className="text-sm text-muted-foreground">{description || "A short description will appear here."}</p>
            <div className="flex flex-col gap-1.5 text-sm pt-2 border-t">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />
                {startDate && endDate ? `${format(new Date(startDate), "MMM d")} – ${format(new Date(endDate), "MMM d, yyyy")} (${previewDays}d)` : "Dates not set"}
              </span>
              <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> {formatCurrency(+budget || 0, currency)} budget</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
