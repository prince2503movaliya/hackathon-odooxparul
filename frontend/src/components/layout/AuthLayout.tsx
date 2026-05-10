import { Plane } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthLayout({ children, title, subtitle, footer }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block bg-gradient-hero overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=70"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70"
        />
        <div className="relative z-10 p-10 h-full flex flex-col text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur">
              <Plane className="h-4 w-4" />
            </span>
            Traveloop
          </Link>
          <div className="mt-auto">
            <p className="text-3xl font-semibold leading-tight max-w-md text-balance">
              "The world is a book, and those who do not travel read only one page."
            </p>
            <p className="mt-3 text-sm opacity-90">— Saint Augustine</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2 font-semibold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-hero text-primary-foreground">
              <Plane className="h-4 w-4" />
            </span>
            Traveloop
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
