import { Moon, Milk, Baby, Footprints, Sun, type LucideIcon } from "lucide-react";
import type { Activity, ActivityType } from "@/lib/tracker-store";
import { formatTime } from "@/lib/tracker-store";

interface Props {
  activities: Activity[];
  now: number;
}

const iconMap: Record<ActivityType, LucideIcon> = {
  sleep: Moon,
  feed: Milk,
  diaper: Baby,
  walk: Footprints,
};
const colorMap: Record<ActivityType, string> = {
  sleep: "oklch(0.78 0.13 300)",
  feed: "oklch(0.82 0.13 200)",
  diaper: "oklch(0.85 0.14 80)",
  walk: "oklch(0.80 0.13 150)",
};
const labelMap: Record<ActivityType, string> = {
  sleep: "Сон",
  feed: "Кормление",
  diaper: "Подгузник",
  walk: "Прогулка",
};

export function TodayTimeline({ activities, now }: Props) {
  const W = 320;
  const H = 140;
  const padX = 24;

  const sorted = [...activities].sort((a, b) => a.startedAt - b.startedAt);
  const dayStart = new Date(now).setHours(6, 0, 0, 0);
  const minT = sorted.length ? Math.min(sorted[0].startedAt, dayStart) : dayStart;
  const maxT = sorted.length
    ? Math.max(sorted[sorted.length - 1].startedAt, now) + 30 * 60000
    : now + 60 * 60000;

  const tToX = (t: number) =>
    padX + ((t - minT) / Math.max(1, maxT - minT)) * (W - padX * 2);

  // smooth sine wave path
  const baselineY = H / 2 + 8;
  const amp = 18;
  const wave = (x: number) =>
    baselineY + Math.sin(((x - padX) / (W - padX * 2)) * Math.PI * 2.2) * amp;

  let path = `M ${padX} ${wave(padX)}`;
  for (let x = padX + 4; x <= W - padX; x += 4) {
    path += ` L ${x} ${wave(x)}`;
  }

  const nowX = tToX(now);
  const nowY = wave(nowX);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <defs>
          <linearGradient id="todayLine" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.85 0.14 80)" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="oklch(0.78 0.13 300)" stopOpacity="0.9" />
            <stop offset="1" stopColor="oklch(0.70 0.16 280)" stopOpacity="0.9" />
          </linearGradient>
          <filter id="todayGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* sun on left */}
        <g transform={`translate(${padX - 14}, ${wave(padX) - 6})`}>
          <circle r="9" fill="oklch(0.85 0.14 80 / 0.18)" />
          <Sun x={-6} y={-6} width={12} height={12} stroke="oklch(0.88 0.14 80)" strokeWidth={1.5} fill="none" />
        </g>

        {/* curve */}
        <path d={path} fill="none" stroke="url(#todayLine)" strokeWidth="2" strokeLinecap="round" filter="url(#todayGlow)" />

        {/* moon on right */}
        <g transform={`translate(${W - padX + 4}, ${wave(W - padX) - 4})`}>
          <path
            d="M 4 -6 A 6 6 0 1 0 4 6 A 4.5 4.5 0 1 1 4 -6 Z"
            fill="oklch(0.85 0.16 300)"
            opacity="0.85"
          />
        </g>

        {/* activity dots on curve */}
        {sorted.map((a) => {
          const x = tToX(a.startedAt);
          const y = wave(x);
          return (
            <g key={a.id + "-dot"}>
              <circle cx={x} cy={y} r="5" fill={colorMap[a.type]} opacity="0.25" />
              <circle cx={x} cy={y} r="2.8" fill={colorMap[a.type]} />
            </g>
          );
        })}

        {/* current time vertical line */}
        <line
          x1={nowX}
          y1={20}
          x2={nowX}
          y2={H - 24}
          stroke="oklch(0.78 0.13 300 / 0.5)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx={nowX} cy={nowY} r="6" fill="oklch(0.78 0.13 300)" />
        <circle cx={nowX} cy={nowY} r="2.5" fill="white" />
      </svg>

      {/* Activity icon bubbles positioned above curve */}
      <div className="pointer-events-none absolute inset-0">
        {sorted.map((a) => {
          const x = tToX(a.startedAt);
          const y = wave(x);
          const Icon = iconMap[a.type];
          const leftPct = (x / W) * 100;
          const topPct = ((y - 38) / H) * 100;
          return (
            <div
              key={a.id + "-icon"}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <div
                className="flex size-7 items-center justify-center rounded-full ring-1"
                style={{
                  background: `color-mix(in oklab, ${colorMap[a.type]} 22%, transparent)`,
                  boxShadow: `0 0 12px color-mix(in oklab, ${colorMap[a.type]} 50%, transparent)`,
                  borderColor: colorMap[a.type],
                }}
              >
                <Icon className="size-3.5" style={{ color: colorMap[a.type] }} />
              </div>
            </div>
          );
        })}

        {/* now pill */}
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${(nowX / W) * 100}%`, top: 0 }}
        >
          <div className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-[0_0_16px_oklch(0.78_0.13_300/0.6)]">
            {formatTime(now)}
          </div>
        </div>
      </div>

      {/* time axis labels */}
      <div className="relative mt-1 h-4">
        {sorted.map((a) => {
          const x = tToX(a.startedAt);
          return (
            <span
              key={a.id + "-t"}
              className="absolute -translate-x-1/2 font-mono text-[10px] text-muted-foreground"
              style={{ left: `${(x / W) * 100}%` }}
            >
              {formatTime(a.startedAt)}
            </span>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {(["sleep", "feed", "diaper", "walk"] as ActivityType[]).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: colorMap[t] }}
            />
            {labelMap[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
