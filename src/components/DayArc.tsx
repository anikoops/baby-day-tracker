import type { Activity } from "@/lib/tracker-store";

interface Props {
  activities: Activity[];
  date: Date;
  now?: number;
  showSun?: boolean;
}

const DAY_START_HOUR = 6;
const SPAN_HOURS = 24;

export function DayArc({ activities, date, now, showSun = false }: Props) {
  const dayStart = new Date(date);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayStartMs = dayStart.getTime();

  const W = 320;
  const H = 170;
  const cx = W / 2;
  const cy = H + 10;
  const r = 150;

  const tToAngle = (ts: number) => {
    const hours = (ts - dayStartMs) / 3600000;
    const frac = Math.max(0, Math.min(1, hours / SPAN_HOURS));
    return Math.PI - frac * Math.PI;
  };
  const polar = (angle: number, radius = r) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });

  const sleeps = activities.filter((a) => a.type === "sleep");
  const events = activities.filter((a) => a.type !== "sleep");
  const sunPos = showSun && now ? polar(tToAngle(now), r + 18) : null;

  const colorMap: Record<string, string> = {
    sleep: "oklch(0.85 0.16 300)",
    feed: "oklch(0.82 0.13 200)",
    diaper: "oklch(0.85 0.14 80)",
    walk: "oklch(0.80 0.15 150)",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.32_0.10_290/0.5),transparent_65%)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 28%, white, transparent), radial-gradient(1px 1px at 72% 18%, white, transparent), radial-gradient(1px 1px at 38% 62%, white, transparent), radial-gradient(1px 1px at 88% 70%, white, transparent), radial-gradient(1px 1px at 8% 78%, white, transparent), radial-gradient(1px 1px at 56% 38%, white, transparent), radial-gradient(1.4px 1.4px at 28% 14%, white, transparent), radial-gradient(1px 1px at 92% 44%, white, transparent)",
          }}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="relative w-full">
        <defs>
          <linearGradient id="dayArcGrad" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.78 0.18 300)" />
            <stop offset="0.5" stopColor="oklch(0.72 0.20 320)" />
            <stop offset="1" stopColor="oklch(0.65 0.18 260)" />
          </linearGradient>
          <radialGradient id="dayArcSun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="oklch(0.95 0.18 80)" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="oklch(0.85 0.18 80)" stopOpacity="0.4" />
            <stop offset="1" stopColor="oklch(0.85 0.18 80)" stopOpacity="0" />
          </radialGradient>
          <filter id="dayArcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dayArcSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d={`M ${polar(Math.PI).x} ${polar(Math.PI).y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`}
          fill="none"
          stroke="url(#dayArcGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.18"
          filter="url(#dayArcSoft)"
        />
        <path
          d={`M ${polar(Math.PI).x} ${polar(Math.PI).y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`}
          fill="none"
          stroke="url(#dayArcGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.85"
          filter="url(#dayArcGlow)"
        />

        {sleeps.map((s) => {
          const end = s.endedAt ?? now ?? s.startedAt;
          const a1 = tToAngle(s.startedAt);
          const a2 = tToAngle(end);
          const p1 = polar(a1);
          const p2 = polar(a2);
          const large = a1 - a2 > Math.PI ? 1 : 0;
          return (
            <path
              key={s.id}
              d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`}
              fill="none"
              stroke="oklch(0.88 0.16 300)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#dayArcGlow)"
            />
          );
        })}

        {events.map((a) => {
          const pos = polar(tToAngle(a.startedAt));
          return (
            <g key={a.id}>
              <circle cx={pos.x} cy={pos.y} r="8" fill={colorMap[a.type]} opacity="0.25" />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="3.5"
                fill={colorMap[a.type]}
                stroke="oklch(0.18 0.05 290)"
                strokeWidth="1.2"
              />
            </g>
          );
        })}

        {sunPos && (
          <>
            <circle cx={sunPos.x} cy={sunPos.y} r="28" fill="url(#dayArcSun)" />
            <circle cx={sunPos.x} cy={sunPos.y} r="9" fill="oklch(0.92 0.18 80)" filter="url(#dayArcGlow)" />
            <circle cx={sunPos.x} cy={sunPos.y} r="5" fill="oklch(0.97 0.15 90)" />
          </>
        )}
      </svg>
      <div className="relative flex justify-between px-3 pb-3 text-[10px] text-muted-foreground">
        {[6, 9, 12, 15, 18, 21, 24].map((h) => (
          <span key={h}>{h === 24 ? "6am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}</span>
        ))}
      </div>
    </div>
  );
}
