import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plane, Map, PieChart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/lib/mock/auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!authService.current()); setChecked(true); }, []);

  if (checked && authed) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-hero text-primary-foreground shadow-glow">
            <Plane className="h-4 w-4" />
          </span>
          Traveloop
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild><Link to="/signup">Get started</Link></Button>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
          <Sparkles className="h-3 w-3" /> Plan smarter, travel further
        </span>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
          Multi-city trips,
          <span className="bg-gradient-hero bg-clip-text text-transparent"> beautifully organized.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Build day-by-day itineraries, track budgets, and discover activities — all in one elegant travel planner.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="shadow-glow"><Link to="/signup">Start planning free</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/login">Sign in</Link></Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-16 text-left">
          {[
            { icon: Map, title: "Multi-city itineraries", desc: "Drag-and-drop city stops, day-by-day plans." },
            { icon: PieChart, title: "Budget analytics", desc: "See where every dollar is going before you go." },
            { icon: Sparkles, title: "Curated activities", desc: "Find things to do, filtered by cost and vibe." },
          ].map(({ icon: I, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border bg-card shadow-soft">
              <div className="rounded-lg bg-primary/10 text-primary w-10 h-10 grid place-items-center mb-3">
                <I className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
