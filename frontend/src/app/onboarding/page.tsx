"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { profileApi, ApiError } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──

type RaceEntry = {
  race_name: string;
  distance_km: number;
  finish_time_secs: number;
  race_date: string;
};

type OnboardingData = {
  experience_level: string;
  current_weekly_km: number;
  available_days: number;
  preferred_long_run_day: string;
  injury_notes: string;
  races: RaceEntry[];
};

// ── Helpers ──

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function timeStringToSecs(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
  return 0;
}

function secsToTimeString(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const EXPERIENCE_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to running or less than a year of consistent training",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "1-3 years of running, completed a few races",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "3+ years, regular racing, structured training background",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
];

// ── Step Components ──

function StepExperience({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          What&apos;s your running experience?
        </h2>
        <p className="text-white/35 text-sm mt-1.5">
          This helps us tailor your training intensity
        </p>
      </div>

      <div className="grid gap-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const selected = data.experience_level === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ experience_level: opt.value })}
              className={`group relative w-full text-left rounded-xl border p-5 transition-all duration-200 cursor-pointer ${
                selected
                  ? "border-orange-500/60 bg-orange-500/[0.06]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
              }`}
            >
              {/* Selected indicator glow */}
              {selected && (
                <div className="absolute inset-0 rounded-xl ring-1 ring-orange-500/20 shadow-[0_0_20px_-4px_oklch(0.705_0.213_47.604_/_0.15)]" />
              )}

              <div className="relative flex items-start gap-4">
                <div
                  className={`flex-shrink-0 mt-0.5 transition-colors duration-200 ${
                    selected ? "text-orange-500" : "text-white/25 group-hover:text-white/40"
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[15px] font-medium transition-colors duration-200 ${
                        selected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {selected && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <p className="text-white/30 text-[13px] mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFitness({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  const addRace = () => {
    onChange({
      races: [
        ...data.races,
        { race_name: "", distance_km: 0, finish_time_secs: 0, race_date: "" },
      ],
    });
  };

  const updateRace = (index: number, field: keyof RaceEntry, value: string | number) => {
    const updated = [...data.races];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ races: updated });
  };

  const removeRace = (index: number) => {
    onChange({ races: data.races.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Current fitness level
        </h2>
        <p className="text-white/35 text-sm mt-1.5">
          Where are you right now in your training?
        </p>
      </div>

      <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Label
          htmlFor="weekly-km"
          className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
        >
          Weekly mileage (km)
        </Label>
        <Input
          id="weekly-km"
          type="number"
          min={0}
          max={300}
          placeholder="e.g. 25"
          value={data.current_weekly_km || ""}
          onChange={(e) =>
            onChange({ current_weekly_km: Number(e.target.value) || 0 })
          }
          className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 transition-colors"
        />
        <p className="text-white/20 text-[11px]">
          Your average weekly running distance
        </p>
      </div>

      <Separator className="bg-white/[0.06]" />

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white/50 text-[11px] tracking-[0.08em] uppercase">
              Race history
            </Label>
            <p className="text-white/20 text-[11px] mt-0.5">Optional — helps calibrate your plan</p>
          </div>
          <Button
            type="button"
            onClick={addRace}
            variant="outline"
            className="h-8 px-3 text-xs border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] bg-transparent cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1.5">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
            </svg>
            Add race
          </Button>
        </div>

        {data.races.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] p-8 text-center">
            <p className="text-white/20 text-sm">No race history added yet</p>
            <p className="text-white/15 text-xs mt-1">
              Add past races to help AI calibrate your plan
            </p>
          </div>
        )}

        {data.races.map((race, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[11px] tracking-[0.08em] uppercase">
                Race {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRace(i)}
                className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-white/40 text-[10px] tracking-[0.08em] uppercase">
                  Race name
                </Label>
                <Input
                  placeholder="e.g. City Half Marathon"
                  value={race.race_name}
                  onChange={(e) => updateRace(i, "race_name", e.target.value)}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-white/15 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/40 text-[10px] tracking-[0.08em] uppercase">
                  Distance (km)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  placeholder="e.g. 21.1"
                  value={race.distance_km || ""}
                  onChange={(e) =>
                    updateRace(i, "distance_km", Number(e.target.value) || 0)
                  }
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-white/15 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/40 text-[10px] tracking-[0.08em] uppercase">
                  Finish time (H:MM:SS)
                </Label>
                <Input
                  placeholder="e.g. 1:45:00"
                  value={race.finish_time_secs ? secsToTimeString(race.finish_time_secs) : ""}
                  onChange={(e) =>
                    updateRace(i, "finish_time_secs", timeStringToSecs(e.target.value))
                  }
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-white/15 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-white/40 text-[10px] tracking-[0.08em] uppercase">
                  Race date
                </Label>
                <Input
                  type="date"
                  value={race.race_date}
                  onChange={(e) => updateRace(i, "race_date", e.target.value)}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-white/15 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPreferences({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Training preferences
        </h2>
        <p className="text-white/35 text-sm mt-1.5">
          How should we structure your week?
        </p>
      </div>

      <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Label className="text-white/50 text-[11px] tracking-[0.08em] uppercase">
          Days available per week
        </Label>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const selected = data.available_days === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onChange({ available_days: day })}
                className={`h-11 w-11 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  selected
                    ? "bg-orange-500 text-white shadow-[0_0_16px_-2px_oklch(0.705_0.213_47.604_/_0.3)]"
                    : "bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="text-white/20 text-[11px]">
          {data.available_days
            ? `${data.available_days} day${data.available_days > 1 ? "s" : ""} per week`
            : "Select how many days you can train"}
        </p>
      </div>

      <Separator className="bg-white/[0.06]" />

      <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <Label className="text-white/50 text-[11px] tracking-[0.08em] uppercase">
          Preferred long run day
        </Label>
        <Select
          value={data.preferred_long_run_day}
          onValueChange={(val) => onChange({ preferred_long_run_day: val })}
        >
          <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/[0.08] text-white focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10">
            <SelectValue placeholder="Choose a day" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/[0.08]">
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem
                key={day}
                value={day}
                className="text-white/70 focus:bg-orange-500/10 focus:text-white cursor-pointer"
              >
                {formatDay(day)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-white/20 text-[11px]">
          Which day works best for your weekly long run?
        </p>
      </div>
    </div>
  );
}

function StepReview({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Almost there
        </h2>
        <p className="text-white/35 text-sm mt-1.5">
          Any injuries to note? Review your info below.
        </p>
      </div>

      <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Label
          htmlFor="injury-notes"
          className="text-white/50 text-[11px] tracking-[0.08em] uppercase"
        >
          Injury or health notes
        </Label>
        <Textarea
          id="injury-notes"
          placeholder="e.g. Mild left knee stiffness, recovering from shin splints..."
          value={data.injury_notes}
          onChange={(e) => onChange({ injury_notes: e.target.value })}
          rows={3}
          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-orange-500/40 focus-visible:ring-orange-500/10 resize-none"
        />
        <p className="text-white/20 text-[11px]">
          Optional — helps AI avoid risky training loads
        </p>
      </div>

      <Separator className="bg-white/[0.06]" />

      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <Label className="text-white/50 text-[11px] tracking-[0.08em] uppercase mb-3 block">
          Profile summary
        </Label>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
          <SummaryRow
            label="Experience"
            value={formatDay(data.experience_level)}
          />
          <SummaryRow
            label="Weekly mileage"
            value={`${data.current_weekly_km} km`}
          />
          <SummaryRow
            label="Training days"
            value={`${data.available_days} days/week`}
          />
          <SummaryRow
            label="Long run day"
            value={formatDay(data.preferred_long_run_day)}
          />
          {data.races.length > 0 && (
            <SummaryRow
              label="Races"
              value={`${data.races.length} race${data.races.length > 1 ? "s" : ""} logged`}
            />
          )}
          {data.injury_notes && (
            <SummaryRow label="Notes" value={data.injury_notes} />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-4 py-3">
      <span className="text-white/30 text-[13px]">{label}</span>
      <span className="text-white/70 text-[13px] text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

// ── Step config ──

const STEPS = [
  { title: "Experience", key: "experience" },
  { title: "Fitness", key: "fitness" },
  { title: "Preferences", key: "preferences" },
  { title: "Review", key: "review" },
] as const;

// ── Main Content ──

function OnboardingContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    experience_level: "",
    current_weekly_km: 0,
    available_days: 0,
    preferred_long_run_day: "",
    injury_notes: "",
    races: [],
  });

  // Redirect if user already has profile
  useEffect(() => {
    if (user?.has_profile) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setError("");
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!data.experience_level) {
          setError("Please select your experience level.");
          return false;
        }
        return true;
      case 1:
        if (!data.current_weekly_km || data.current_weekly_km <= 0) {
          setError("Please enter your weekly mileage.");
          return false;
        }
        // Validate any added races
        for (let i = 0; i < data.races.length; i++) {
          const race = data.races[i];
          if (!race.race_name.trim()) {
            setError(`Race ${i + 1}: Please enter a race name.`);
            return false;
          }
          if (!race.distance_km || race.distance_km <= 0) {
            setError(`Race ${i + 1}: Please enter a valid distance.`);
            return false;
          }
          if (!race.finish_time_secs || race.finish_time_secs <= 0) {
            setError(`Race ${i + 1}: Please enter a valid finish time.`);
            return false;
          }
          if (!race.race_date) {
            setError(`Race ${i + 1}: Please enter a race date.`);
            return false;
          }
        }
        return true;
      case 2:
        if (!data.available_days || data.available_days <= 0) {
          setError("Please select how many days you can train.");
          return false;
        }
        if (!data.preferred_long_run_day) {
          setError("Please select your preferred long run day.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await profileApi.update({
        profile: {
          experience_level: data.experience_level,
          current_weekly_km: data.current_weekly_km,
          available_days: data.available_days,
          preferred_long_run_day: data.preferred_long_run_day,
          injury_notes: data.injury_notes || null,
        },
      });

      for (const race of data.races) {
        await profileApi.addRace({ race_history: race });
      }

      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.data.error.details;
        setError(
          details
            ? Array.isArray(details)
              ? details.join(". ")
              : JSON.stringify(details)
            : err.data.error.message
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  if (user?.has_profile) return null;

  const progressValue = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* ── Top bar ── */}
      <div className="w-full px-6 pt-6 pb-0">
        <div className="max-w-lg mx-auto">
          {/* Step indicator */}
          <div
            className="flex items-center justify-between mb-3 animate-fade-up"
            style={{ animationDelay: "0s" }}
          >
            <span className="text-white/30 text-[11px] tracking-[0.15em] uppercase font-mono">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-orange-500/60 text-[11px] tracking-[0.08em] uppercase">
              {STEPS[step].title}
            </span>
          </div>

          {/* Progress bar */}
          <Progress
            value={progressValue}
            className="h-1 bg-white/[0.06] animate-fade-up progress-orange"
            style={{ animationDelay: "0.05s" }}
          />
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-6 sm:pt-14">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg"
        >
          {/* Step content */}
          <div key={step}>
            {step === 0 && <StepExperience data={data} onChange={updateData} />}
            {step === 1 && <StepFitness data={data} onChange={updateData} />}
            {step === 2 && <StepPreferences data={data} onChange={updateData} />}
            {step === 3 && <StepReview data={data} onChange={updateData} />}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg bg-red-500/[0.08] border border-red-500/20 px-4 py-3 text-[13px] text-red-400 animate-fade-up">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div
            className="mt-8 flex items-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            {step > 0 && (
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="h-12 px-6 border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] bg-transparent cursor-pointer transition-all duration-200"
              >
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold tracking-wide text-sm cursor-pointer transition-all duration-200"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold tracking-wide text-sm cursor-pointer transition-all duration-200 animate-pulse-glow disabled:animate-none disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  "Complete setup"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* ── Bottom decorative element ── */}
      <div className="px-6 pb-8">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= step
                    ? "w-6 bg-orange-500/50"
                    : "w-1.5 bg-white/[0.06]"
                }`}
              />
            ))}
          </div>
          <span className="text-white/15 text-[10px] tracking-[0.2em] uppercase font-light">
            Profile setup
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page export ──

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
