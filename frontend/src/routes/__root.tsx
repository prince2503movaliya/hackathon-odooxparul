import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState,
  HeadContent, Scripts, useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { authService, themeService } from "@/lib/mock/auth";
import appCss from "../styles.css?url";

const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot", "/share"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">404</div>
        <h2 className="mt-4 text-xl font-semibold">Lost on your journey?</h2>
        <p className="mt-2 text-sm text-muted-foreground">This destination isn't on the map. Let's get you back.</p>
        <div className="mt-6">
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-accent">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Traveloop — Personalized Multi-City Travel Planning" },
      { name: "description", content: "Plan, organize, and visualize multi-city trips with itineraries, budgets, and packing lists." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => { themeService.apply(); }, []);

  useEffect(() => {
    const isPublic = path === "/" || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
    if (!isPublic && !authService.current()) {
      navigate({ to: "/login" });
    }
  }, [path, navigate]);

  const isPublic = path === "/" || PUBLIC_PREFIXES.some((p) => path.startsWith(p));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={120}>
        {isPublic ? <Outlet /> : <AppShell><Outlet /></AppShell>}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
