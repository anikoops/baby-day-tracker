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

export function TodayTimeline({ activities, now }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayStart = new Date(now).setHours(0, 0, 0, 0);
  const dayEnd = dayStart + 24 * 3600_000;
  const pct = (t: number) =>
    Math.max(0, Math.min(100, ((t - dayStart) / (dayEnd - dayStart)) * 100));

  const sorted = [...activities].sort((a, b) => a.startedAt - b.startedAt);
  const nowPct = pct(now);

  // Cluster start-points that are visually close (<2.2% of the day ≈ ~32 min)
  const THRESHOLD = 2.2;
  type Cluster = { centerPct: number; items: Activity[] };
  const clusters: Cluster[] = [];
  for (const a of sorted) {
    const p = pct(a.startedAt);
    const last = clusters[clusters.length - 1];
    if (last && p - last.centerPct < THRESHOLD) {
      last.items.push(a);
      last.centerPct =
        last.items.reduce((s, x) => s + pct(x.startedAt), 0) / last.items.length;
    } else {
      clusters.push({ centerPct: p, items: [a] });
    }
  }

  return (
    <div className="relative">
      {/* hour ticks */}
      <div className="relative mb-1 h-3">
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

      {/* avatars row above the line */}
      <div className="relative mb-1 h-5">
        {clusters.map((c, i) => (
          <div
            key={i}
            className="absolute top-0 flex -translate-x-1/2 items-end gap-[2px]"
            style={{ left: `${c.centerPct}%` }}
          >
            {c.items.slice(0, 4).map((a) => {
              const color = colorMap[a.type];
              return (
                <span
                  key={a.id}
                  className="flex size-4 items-center justify-center rounded-full text-[9px] leading-none"
                  style={{
                    background: `color-mix(in oklab, ${color} 25%, transparent)`,
                    boxShadow: `0 0 8px color-mix(in oklab, ${color} 70%, transparent), inset 0 0 0 1px color-mix(in oklab, ${color} 60%, transparent)`,
                  }}
                  title={activityConfig[a.type].label}
                >
                  {activityConfig[a.type].emoji}
                </span>
              );
            })}
            {c.items.length > 4 && (
              <span className="text-[8px] font-mono text-foreground/50">
                +{c.items.length - 4}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* single timeline track */}
      <div className="relative h-[14px]">
        {/* base line */}
        <div
          className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 6%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 94%, transparent)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)",
          }}
        />

        {/* duration segments (glow bars) */}
        {sorted
          .filter((a) => a.endedAt && a.endedAt - a.startedAt >= 60_000)
          .map((a) => {
            const color = colorMap[a.type];
            const startPct = pct(a.startedAt);
            const endPct = pct(a.endedAt as number);
            const width = Math.max(0.6, endPct - startPct);
            return (
              <span
                key={`bar-${a.id}`}
                className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full"
                style={{
                  left: `${startPct}%`,
                  width: `${width}%`,
                  backgroundImage: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), color-mix(in oklab, ${color} 95%, transparent))`,
                  boxShadow: `0 0 10px color-mix(in oklab, ${color} 75%, transparent), 0 0 18px color-mix(in oklab, ${color} 45%, transparent), inset 0 0 6px color-mix(in oklab, ${color} 50%, transparent)`,
                }}
              />
            );
          })}

        {/* event start dots */}
        {sorted.map((a) => {
          const color = colorMap[a.type];
          return (
            <span
              key={`dot-${a.id}`}
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${pct(a.startedAt)}%`,
                background: color,
                boxShadow: `0 0 8px ${color}, 0 0 14px color-mix(in oklab, ${color} 60%, transparent)`,
              }}
            />
          );
        })}

        {/* now indicator */}
        {mounted && (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
            style={{
              left: `${nowPct}%`,
              background: "white",
              boxShadow:
                "0 0 10px oklch(0.78 0.13 300 / 0.9), 0 0 18px oklch(0.78 0.13 300 / 0.6)",
            }}
          />
        )}
      </div>

      {/* footer */}
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
