"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { useAuth, ApiError } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password, passwordConfirmation);
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.data.error.details;
        setError(details ? details.join(". ") : err.data.error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-end">
        {/* Warm gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a08] via-[#15120d] to-[#0a0a0a]" />

        {/* Animated speed streaks */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px animate-streak"
              style={{
                top: `${18 + i * 9}%`,
                width: `${30 + i * 6}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.4}s`,
                background:
                  "linear-gradient(90deg, transparent, oklch(0.705 0.213 47.604 / 0.25), transparent)",
              }}
            />
          ))}
        </div>

        {/* Diagonal accent line */}
        <div
          className="absolute w-[200%] h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent"
          style={{
            top: "35%",
            left: "-20%",
            transform: "rotate(-12deg)",
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 p-16 pb-20 w-full">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 text-orange-500/80 text-[11px] font-mono tracking-[0.35em] uppercase mb-6">
              <span className="inline-block w-6 h-px bg-orange-500/60" />
              AI Running Coach
            </span>
          </div>

          <h1
            className={`${bebas.className} text-[7rem] leading-[0.82] tracking-[0.02em] text-white mb-8 animate-fade-up`}
            style={{ animationDelay: "0.2s" }}
          >
            STRIDE
          </h1>

          <p
            className="text-white/35 text-base max-w-sm leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            Join thousands of runners training smarter with AI-powered
            plans tailored to your goals.
          </p>

          <div
            className="mt-14 flex items-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-orange-500"
                  style={{ opacity: 1 - (i - 1) * 0.3 }}
                />
              ))}
            </div>
            <span className="text-white/20 text-[11px] tracking-[0.25em] uppercase font-light">
              Start your journey
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-14 animate-fade-up">
            <span className="text-orange-500/70 text-[10px] font-mono tracking-[0.35em] uppercase block mb-3">
              AI Running Coach
            </span>
            <h1
              className={`${bebas.className} text-5xl tracking-[0.02em] text-white`}
            >
              STRIDE
            </h1>
          </div>

          {/* Form header */}
          <div
            className="mb-10 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <h2 className="text-[22px] font-semibold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-white/35 mt-1.5 text-sm">
              Set up your profile and start training
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="space-y-2 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Label
                htmlFor="name"
                className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 transition-colors"
              />
            </div>

            <div
              className="space-y-2 animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              <Label
                htmlFor="email"
                className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 transition-colors"
              />
            </div>

            <div
              className="space-y-2 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Label
                htmlFor="password"
                className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 transition-colors"
              />
            </div>

            <div
              className="space-y-2 animate-fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              <Label
                htmlFor="password-confirmation"
                className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
              >
                Confirm password
              </Label>
              <Input
                id="password-confirmation"
                type="password"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/[0.08] border border-red-500/20 px-4 py-3 text-[13px] text-red-400">
                {error}
              </div>
            )}

            <div
              className="pt-1 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold tracking-wide text-sm cursor-pointer transition-all duration-200 animate-pulse-glow disabled:animate-none disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </form>

          {/* Footer link */}
          <p
            className="mt-10 text-center text-[13px] text-white/25 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-500/80 hover:text-orange-400 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
