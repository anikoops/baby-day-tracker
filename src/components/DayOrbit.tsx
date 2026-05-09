import type { Activity, ActivityType } from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";

interface Props {
  activities: Activity[];
  date: Date;
  now?: number;
  showNow?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const DAY_START_HOUR = 6;
const SPAN_HOURS = 24;

const colorMap: Record<ActivityType, string> = {
  sleep: "oklch(0.82 0.16 300)",
  feed: "oklch(0.82 0.13 220)",
  diaper: "oklch(0.85 0.14 190)",
  walk: "oklch(0.80 0.15 150)",
};

const TICKS = [6, 9, 12, 15, 18, 21];

export function DayOrbit({
  activities,
  date,
  now,
  showNow = false,
  selectedId,
  onSelect,
}: Props) {
  const dayStart = new Date(date);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayStartMs = dayStart.getTime();

  const W = 360;
  const H = 200;
  const cx = W / 2;
  const cy = H + 14;
  const r = 168;

  const tToAngle = (ts: number) => {
    const hours = (ts - dayStartMs) / 3600000;
    const frac = Math.max(0, Math.min(1, hours / SPAN_HOURS));
    return Math.PI - frac * Math.PI;
  };
  const polar = (angle: number, radius = r) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });

  const durations = activities.filter(
    (a) => a.endedAt && a.endedAt - a.startedAt >= 60_000,
  );
  const points = activities;

  const sun = showNow && now ? polar(tToAngle(now), r + 26) : null;
  const sunAnchor = showNow && now ? polar(tToAngle(now), r) : null;

  const arcPath = (a1: number, a2: number, radius = r) => {
    const p1 = polar(a1, radius);
    const p2 = polar(a2, radius);
    const large = a1 - a2 > Math.PI ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] soft-card">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,oklch(0.34_0.12_290/0.55),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 28%, white, transparent), radial-gradient(1px 1px at 72% 18%, white, transparent), radial-gradient(1px 1px at 38% 62%, white, transparent), radial-gradient(1.2px 1.2px at 88% 70%, white, transparent), radial-gradient(1px 1px at 8% 78%, white, transparent), radial-gradient(1px 1px at 56% 38%, white, transparent), radial-gradient(1.4px 1.4px at 28% 14%, white, transparent), radial-gradient(1px 1px at 92% 44%, white, transparent), radial-gradient(1px 1px at 46% 8%, white, transparent), radial-gradient(1px 1px at 66% 84%, white, transparent)",
          }}
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H + 36}`} className="relative w-full">
        <defs>
          <linearGradient id="orbitGrad" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.78 0.16 300)" />
            <stop offset="0.45" stopColor="oklch(0.74 0.15 250)" />
            <stop offset="1" stopColor="oklch(0.80 0.13 190)" />
          </linearGradient>
          <linearGradient id="orbitAtm" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.65 0.18 300)" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="oklch(0.60 0.18 250)" stopOpacity="0.45" />
            <stop offset="1" stopColor="oklch(0.65 0.15 190)" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="orbitSun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="oklch(0.97 0.16 90)" stopOpacity="1" />
            <stop offset="0.35" stopColor="oklch(0.88 0.18 80)" stopOpacity="0.55" />
            <stop offset="1" stopColor="oklch(0.85 0.18 80)" stopOpacity="0" />
          </radialGradient>
          <filter id="orbitGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="orbitSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* atmosphere */}
        <path
          d={arcPath(Math.PI, 0)}
          fill="none"
          stroke="url(#orbitAtm)"
          strokeWidth="34"
          strokeLinecap="round"
          filter="url(#orbitSoft)"
        />
        {/* base track */}
        <path
          d={arcPath(Math.PI, 0)}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* planet edge */}
        <path
          d={arcPath(Math.PI, 0)}
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* hour ticks on the arc */}
        {TICKS.map((h) => {
          const ts = dayStartMs + (h - DAY_START_HOUR + (h < DAY_START_HOUR ? 24 : 0)) * 3600000;
          const a = tToAngle(ts);
          const inner = polar(a, r - 6);
          const outer = polar(a, r + 6);
          const label = polar(a, r + 22);
          return (
            <g key={h}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="oklch(1 0 0 / 0.25)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="oklch(1 0 0 / 0.45)"
              >
                {h.toString().padStart(2, "0")}:00
              </text>
            </g>
          );
        })}

        {/* duration segments */}
        {durations.map((s) => {
          const color = colorMap[s.type];
          const a1 = tToAngle(s.startedAt);
          const a2 = tToAngle(s.endedAt as number);
          const isSel = s.id === selectedId;
          return (
            <g
              key={`seg-${s.id}`}
              onClick={() => onSelect?.(s.id)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={arcPath(a1, a2)}
                fill="none"
                stroke={color}
                strokeWidth={isSel ? 12 : 9}
                strokeLinecap="round"
                opacity={isSel ? 1 : 0.92}
                filter="url(#orbitGlow)"
              />
              <path
                d={arcPath(a1, a2)}
                fill="none"
                stroke={color}
                strokeWidth={isSel ? 14 : 11}
                strokeLinecap="round"
                opacity="0.18"
                filter="url(#orbitSoft)"
              />
            </g>
          );
        })}

        {/* event dots */}
        {points.map((a) => {
          const color = colorMap[a.type];
          const pos = polar(tToAngle(a.startedAt));
          const isSel = a.id === selectedId;
          const cfg = activityConfig[a.type];
          return (
            <g
              key={`pt-${a.id}`}
              onClick={() => onSelect?.(a.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSel ? 14 : 10}
                fill={color}
                opacity="0.18"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSel ? 6 : 4.2}
                fill={color}
                stroke="oklch(0.16 0.05 290)"
                strokeWidth="1.4"
                filter="url(#orbitGlow)"
              />
              {isSel && (
                <text
                  x={pos.x}
                  y={pos.y - 16}
                  textAnchor="middle"
                  fontSize="11"
                >
                  {cfg.emoji}
                </text>
              )}
            </g>
          );
        })}

        {/* now sun + dashed line */}
        {sun && sunAnchor && (
          <g>
            <line
              x1={sunAnchor.x}
              y1={sunAnchor.y}
              x2={sun.x}
              y2={sun.y}
              stroke="oklch(0.92 0.16 85 / 0.55)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle cx={sun.x} cy={sun.y} r="26" fill="url(#orbitSun)" />
            <circle
              cx={sun.x}
              cy={sun.y}
              r="7"
              fill="oklch(0.95 0.18 85)"
              filter="url(#orbitGlow)"
            />
            <circle cx={sun.x} cy={sun.y} r="3.5" fill="oklch(0.99 0.12 95)" />
            <text
              x={sun.x}
              y={sun.y - 32}
              textAnchor="middle"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              fill="oklch(0.95 0.10 90)"
            >
              Сейчас{" "}
              {new Date(now!).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
