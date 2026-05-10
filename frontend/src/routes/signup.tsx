import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/lib/mock/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(undefined);
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (!email.includes("@")) return setErr("Please enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await authService.signUp(name.trim(), email, pwd);
      toast.success("Account created!");
      nav({ to: "/dashboard" });
    } catch { toast.error("Could not sign up."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start planning trips in minutes."
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Traveler" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pwd">Password</Label>
          <div className="relative">
            <Input id="pwd" type={show ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="At least 6 characters" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
