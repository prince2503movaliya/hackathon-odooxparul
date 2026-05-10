import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, Plus, Search, Sparkles, PieChart,
  ListChecks, NotebookPen, Settings, LogOut, Plane, BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authService, themeService, type User, type Theme } from "@/lib/mock/auth";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencySymbols } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/trips/new", label: "Plan New Trip", icon: Plus },
  { to: "/cities", label: "Discover Cities", icon: Search },
  { to: "/activities", label: "Activities", icon: Sparkles },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/packing", label: "Packing", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/admin", label: "Admin", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    themeService.apply();
    setTheme(themeService.get());
    setUser(authService.current());
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  const toggleTheme = () => {
    const t: Theme = theme === "light" ? "dark" : "light";
    themeService.set(t); setTheme(t);
  };

  const signOut = () => { authService.signOut(); navigate({ to: "/login" }); };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-8 max-w-[1600px] mx-auto">

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline font-semibold text-[15px] tracking-tight">Traveloop</span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-5 w-px bg-border mx-1" />

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search cities, trips…"
                className="pl-9 h-9 text-sm bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value;
                    navigate({ to: "/cities", search: { q: v } as never });
                  }
                }}
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Divider */}
            <div className="h-5 w-px bg-border mx-2" />

            {/* User avatar + name */}
            <Link to="/settings" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {(user?.name ?? "GU").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-none">
                <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{user?.name ?? "Guest"}</p>
                <p className="text-[10px] text-muted-foreground">{currencySymbols[user?.preferences.currency || "USD"]}</p>
              </div>
            </Link>

            {/* Sign out */}
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="flex flex-col gap-1 p-4 overflow-y-auto h-full">
            {NAV.map(({ to, label, icon: Icon }) => {
              const isActuallyActive = to === "/dashboard"
                ? path === "/dashboard"
                : to === "/trips"
                  ? path === "/trips" || (path.startsWith("/trips/") && !path.startsWith("/trips/new"))
                  : path.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActuallyActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-auto pt-4 border-t mt-4">
              <Link to="/settings" className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                path.startsWith("/settings") ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"
              )}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </div>
          </nav>
        </aside>

        {open && (
          <div className="fixed inset-0 top-16 z-20 bg-foreground/10 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
        )}

        <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t bg-card/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => {
            const isActuallyActive = to === "/dashboard"
              ? path === "/dashboard"
              : to === "/trips"
                ? path === "/trips" || (path.startsWith("/trips/") && !path.startsWith("/trips/new"))
                : path.startsWith(to);

            return (
              <Link key={to} to={to} className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px]",
                isActuallyActive ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
                {label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
