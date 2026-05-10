import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { authService, type User } from "@/lib/mock/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/common/Skeleton";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bell, Globe, Shield, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(authService.current()); }, []);
  if (!user) return <Skeleton className="h-96" />;

  const save = async (patch: Partial<User>) => {
    const u = await authService.update(patch);
    if (u) { setUser(u); toast.success("Saved"); }
  };
  const del = () => { authService.signOut(); toast("Account deleted"); nav({ to: "/login" }); };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="p-6 lg:col-span-2 space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-4 pb-5 border-b">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">Role: {user.role}</p>
            </div>
          </div>

          {/* Profile section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Profile
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input defaultValue={user.name} onBlur={(e) => e.target.value !== user.name && save({ name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email Address</Label>
                <Input type="email" defaultValue={user.email} onBlur={(e) => e.target.value !== user.email && save({ email: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Preferences section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Preferences
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <Select value={user.language} onValueChange={(v) => save({ language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["English", "French", "Spanish", "German", "Japanese"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Select value={user.preferences.currency} onValueChange={(v) => save({ preferences: { ...user.preferences, currency: v } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "JPY", "INR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Privacy */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Notifications & Privacy
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive trip reminders</p>
                </div>
                <Switch checked={user.preferences.notifications} onCheckedChange={(v) => save({ preferences: { ...user.preferences, notifications: v } })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public profile</p>
                  <p className="text-xs text-muted-foreground">Share your trips publicly</p>
                </div>
                <Switch checked={user.preferences.publicProfile} onCheckedChange={(v) => save({ preferences: { ...user.preferences, publicProfile: v } })} />
              </div>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="p-5 border-destructive/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Danger Zone
            </p>
            <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all trip data. This cannot be undone.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>All your trips and data will be permanently removed. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>
    </>
  );
}
