import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck } from "lucide-react";
import { authService } from "@/lib/mock/auth";

export const Route = createFileRoute("/forgot")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(undefined);
    if (!email.includes("@")) return setErr("Please enter a valid email.");
    setLoading(true);
    await authService.forgot(email);
    setLoading(false); setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you a link to set a new password."
      footer={<><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></>}
    >
      {sent ? (
        <div className="rounded-lg border bg-success/10 p-4 flex gap-3">
          <MailCheck className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium">Check your inbox</p>
            <p className="text-sm text-muted-foreground">If an account exists for {email}, we've sent reset instructions.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
