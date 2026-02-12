"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.has_profile) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (user && !user.has_profile) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Your training dashboard is coming soon.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/10 text-white/60 hover:text-white hover:border-white/20 bg-transparent cursor-pointer"
          >
            Log out
          </Button>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <div className="text-white/20 text-5xl mb-4">🏃</div>
          <h2 className="text-lg font-medium text-white/60 mb-2">
            Dashboard under construction
          </h2>
          <p className="text-white/30 text-sm max-w-md mx-auto">
            This is where your training plans, run history, and AI insights will live.
            Stay tuned.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
