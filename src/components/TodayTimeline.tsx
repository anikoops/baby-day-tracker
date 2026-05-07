import { useEffect, useState } from "react";
import type { Activity, ActivityType } from "@/lib/tracker-store";
import { formatTime } from "@/lib/tracker-store";

interface Props {
  activities: Activity[];
  now: number;
}

const colorMap: Record<ActivityType, string> = {
  sleep: "oklch(0.78 0.13 300)",
  feed: "oklch(0.82 0.13 200)",
  diaper: "oklch(0.85 0.14 80)",
  walk: "oklch(0.80 0.13 150)",
};

export function TodayTimeline({ activities, now }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Day window: 00:00 → 24:00 of `now`'s day
  const dayStart = new Date(now).setHours(0, 0, 0, 0);
  const dayEnd = dayStart + 24 * 3600_000;
  const pct = (t: number) =>
    Math.max(0, Math.min(100, ((t - dayStart) / (dayEnd - dayStart)) * 100));

  const sorted = [...activities].sort((a, b) => a.startedAt - b.startedAt);
  const nowPct = pct(now);

  return (
    <div className="relative">
      {/* hour ticks */}
      <div className="relative mb-2 h-3">
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2 font-mono text-[9px] tracking-wider text-foreground/35"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {h.toString().padStart(2, "0")}
          </span>
        ))}
      </div>

      {/* track */}
      <div className="relative h-[18px]">
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 8%, rgba(255,255,255,0.18) 92%, transparent)",
          }}
        />
        {/* progress fill up to now */}
        {mounted && (
          <div
            className="absolute top-1/2 h-px -translate-y-1/2"
            style={{
              left: 0,
              width: `${nowPct}%`,
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.13 300 / 0.6))",
            }}
          />
        )}

        {/* activity dots */}
        {sorted.map((a) => (
          <span
            key={a.id}
            className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${pct(a.startedAt)}%`,
              background: colorMap[a.type],
              boxShadow: `0 0 8px ${colorMap[a.type]}`,
            }}
          />
        ))}

        {/* now indicator */}
        {mounted && (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
            style={{
              left: `${nowPct}%`,
              background: "oklch(0.78 0.13 300)",
              boxShadow: "0 0 12px oklch(0.78 0.13 300 / 0.8)",
            }}
          />
        )}
      </div>

      {/* footer: count + now time */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/45">
        <span className="font-mono uppercase tracking-[0.14em]">
          {sorted.length.toString().padStart(2, "0")} событий
        </span>
        <span className="font-mono" suppressHydrationWarning>
          {mounted ? formatTime(now) : "--:--"}
        </span>
      </div>
    </div>
  );
}
