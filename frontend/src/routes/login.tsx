import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/lib/mock/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(undefined);
    if (!email.includes("@")) return setErr("Please enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await authService.signIn(email, pwd);
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch { toast.error("Sign in failed."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue planning your adventures."
      footer={<>Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Create one free</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pwd" className="text-xs font-medium">Password</Label>
            <Link to="/forgot" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="pwd" type={show ? "text" : "password"} autoComplete="current-password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="h-10 pr-10" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox /> <span>Remember me for 30 days</span>
        </label>
        {err && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
            <p className="text-sm text-destructive">{err}</p>
          </div>
        )}
        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
