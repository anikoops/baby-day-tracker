import { useEffect, useState } from "react";
import type { Activity, ActivityType } from "@/lib/tracker-store";
import { formatTime } from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";

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

const types: ActivityType[] = ["sleep", "feed", "walk", "diaper"];

export function TodayTimeline({ activities, now }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayStart = new Date(now).setHours(0, 0, 0, 0);
  const dayEnd = dayStart + 24 * 3600_000;
  const pct = (t: number) =>
    Math.max(0, Math.min(100, ((t - dayStart) / (dayEnd - dayStart)) * 100));

  const nowPct = pct(now);

  return (
    <div className="relative">
      {/* hour ticks */}
      <div className="relative mb-1.5 h-3">
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

      {/* per-type lanes */}
      <div className="relative space-y-1.5">
        {/* vertical now line spanning all lanes */}
        {mounted && (
          <div
            className="pointer-events-none absolute inset-y-0 w-px"
            style={{
              left: `${nowPct}%`,
              background:
                "linear-gradient(180deg, transparent, oklch(0.78 0.13 300 / 0.5), transparent)",
              boxShadow: "0 0 8px oklch(0.78 0.13 300 / 0.6)",
            }}
          />
        )}

        {types.map((type) => {
          const cfg = activityConfig[type];
          const color = colorMap[type];
          const items = activities.filter((a) => a.type === type);
          return (
            <div key={type} className="relative h-3">
              {/* lane base */}
              <div
                className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              />
              {/* duration bars + instant dots */}
              {items.map((a) => {
                const startPct = pct(a.startedAt);
                const endPct = pct(a.endedAt ?? now);
                const width = Math.max(0.6, endPct - startPct);
                const isInstant = !a.endedAt
                  ? false
                  : a.endedAt - a.startedAt < 60_000;
                if (isInstant) {
                  return (
                    <span
                      key={a.id}
                      className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${startPct}%`,
                        background: color,
                        boxShadow: `0 0 10px ${color}, 0 0 18px ${color}`,
                      }}
                    />
                  );
                }
                return (
                  <span
                    key={a.id}
                    className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full"
                    style={{
                      left: `${startPct}%`,
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${color} / 0.0, ${color}) `,
                      backgroundImage: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), color-mix(in oklab, ${color} 90%, transparent))`,
                      boxShadow: `0 0 10px color-mix(in oklab, ${color} 70%, transparent), inset 0 0 6px color-mix(in oklab, ${color} 50%, transparent)`,
                    }}
                  />
                );
              })}
              {/* lane label */}
              <span
                className="absolute -left-px top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/30"
                style={{ paddingLeft: 0 }}
                aria-hidden
              >
                {cfg.emoji}
              </span>
            </div>
          );
        })}
      </div>

      {/* footer: count + now time */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/45">
        <span className="font-mono uppercase tracking-[0.14em]">
          {activities.length.toString().padStart(2, "0")} событий
        </span>
        <span className="font-mono" suppressHydrationWarning>
          {mounted ? formatTime(now) : "--:--"}
        </span>
      </div>
    </div>
  );
}
