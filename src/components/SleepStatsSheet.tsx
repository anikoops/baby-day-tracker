import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTracker, todaysActivities, totalDuration, formatDuration } from "@/lib/tracker-store";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const DAY_START_HOUR = 6; // arc spans 6:00 -> 6:00 next day (24h)
const SPAN_HOURS = 24;

export function SleepStatsSheet({ open, onOpenChange }: Props) {
  const { activities } = useTracker();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, [open]);

  const today = todaysActivities(activities);
  const sleepMs = totalDuration(today, "sleep");
  const sleepSessions = today.filter((a) => a.type === "sleep");

  const dayStart = new Date();
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayStartMs = dayStart.getTime();

  // Estimate next sleep: assume avg awake window ~ 1h45m for now
  const lastSleep = sleepSessions
    .filter((s) => s.endedAt)
    .sort((a, b) => (b.endedAt! - a.endedAt!))[0];
  const awakeWindowMs = 1.75 * 3600 * 1000;
  const nextSleepAt = lastSleep?.endedAt ? lastSleep.endedAt + awakeWindowMs : null;
  const timeToSleep = nextSleepAt ? nextSleepAt - now : null;

  // Arc geometry
  const W = 320;
  const H = 200;
  const cx = W / 2;
  const cy = H + 20;
  const r = 170;

  const tToAngle = (ts: number) => {
    const hours = (ts - dayStartMs) / 3600000;
    const frac = Math.max(0, Math.min(1, hours / SPAN_HOURS));
    return Math.PI - frac * Math.PI; // left=0, right=24h
  };

  const polar = (angle: number, radius = r) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });

  const nowPos = polar(tToAngle(now));
  const sunPos = polar(tToAngle(now), r + 18);

  // hour ticks
  const hourLabels = [6, 9, 12, 15, 18, 21, 24];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] rounded-t-3xl border-white/10 bg-background p-0"
      >
        <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-2">
          <SheetHeader className="pt-2">
            <SheetTitle className="text-center text-base font-semibold">
              Текущая временная шкала
            </SheetTitle>
          </SheetHeader>

          <div className="relative mt-4 overflow-hidden rounded-3xl">
            {/* starfield + nebula background */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.32_0.10_290/0.55),transparent_65%)]" />
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(1px 1px at 12% 28%, white, transparent), radial-gradient(1px 1px at 72% 18%, white, transparent), radial-gradient(1px 1px at 38% 62%, white, transparent), radial-gradient(1px 1px at 88% 70%, white, transparent), radial-gradient(1px 1px at 8% 78%, white, transparent), radial-gradient(1px 1px at 56% 38%, white, transparent), radial-gradient(1.4px 1.4px at 28% 14%, white, transparent), radial-gradient(1px 1px at 92% 44%, white, transparent), radial-gradient(1px 1px at 48% 82%, white, transparent)",
                }}
              />
            </div>
            <svg viewBox={`0 0 ${W} ${H + 30}`} className="relative w-full">
              <defs>
                <linearGradient id="arcGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="oklch(0.78 0.18 300)" />
                  <stop offset="0.5" stopColor="oklch(0.72 0.20 320)" />
                  <stop offset="1" stopColor="oklch(0.65 0.18 260)" />
                </linearGradient>
                <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="oklch(0.95 0.18 80)" stopOpacity="0.95" />
                  <stop offset="0.4" stopColor="oklch(0.85 0.18 80)" stopOpacity="0.4" />
                  <stop offset="1" stopColor="oklch(0.85 0.18 80)" stopOpacity="0" />
                </radialGradient>
                <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>

              {/* outer halo */}
              <path
                d={`M ${polar(Math.PI).x} ${polar(Math.PI).y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`}
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="26"
                strokeLinecap="round"
                opacity="0.22"
                filter="url(#softGlow)"
              />

              {/* base arc — orbit */}
              <path
                d={`M ${polar(Math.PI).x} ${polar(Math.PI).y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`}
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                opacity="0.9"
                filter="url(#arcGlow)"
              />

              {/* sleep segments */}
              {sleepSessions.map((s) => {
                const end = s.endedAt ?? now;
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
                    strokeWidth="9"
                    strokeLinecap="round"
                    filter="url(#arcGlow)"
                  />
                );
              })}

              {/* event dots */}
              {today.map((a) => {
                const pos = polar(tToAngle(a.startedAt));
                const colorMap: Record<string, string> = {
                  sleep: "oklch(0.85 0.16 300)",
                  feed: "oklch(0.82 0.13 200)",
                  diaper: "oklch(0.85 0.14 80)",
                  walk: "oklch(0.80 0.15 150)",
                };
                return (
                  <g key={a.id}>
                    <circle cx={pos.x} cy={pos.y} r="9" fill={colorMap[a.type]} opacity="0.25" />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill={colorMap[a.type]}
                      stroke="oklch(0.18 0.05 290)"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* sun (now) — glowing */}
              <circle cx={sunPos.x} cy={sunPos.y} r="32" fill="url(#sunGlow)" />
              <circle cx={sunPos.x} cy={sunPos.y} r="11" fill="oklch(0.92 0.18 80)" filter="url(#arcGlow)" />
              <circle cx={sunPos.x} cy={sunPos.y} r="6" fill="oklch(0.97 0.15 90)" />

              {/* now indicator on arc */}
              <line
                x1={nowPos.x}
                y1={nowPos.y - 6}
                x2={nowPos.x}
                y2={nowPos.y + 16}
                stroke="oklch(0.6 0.02 300)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <rect
                x={nowPos.x - 22}
                y={nowPos.y + 16}
                width="44"
                height="18"
                rx="9"
                fill="oklch(0.85 0.14 80)"
              />
              <text
                x={nowPos.x}
                y={nowPos.y + 28}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="oklch(0.2 0.04 300)"
              >
                {new Date(now).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </text>
            </svg>

            {/* center caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
              <p className="text-xs text-muted-foreground">
                {timeToSleep !== null && timeToSleep > 0
                  ? "Время для сна"
                  : timeToSleep !== null
                    ? "Пора спать"
                    : "Сегодня ещё не спал"}
              </p>
              {timeToSleep !== null && (
                <p className="mt-1 text-2xl font-bold text-[oklch(0.78_0.13_300)]">
                  ~{formatDuration(Math.abs(timeToSleep))}
                </p>
              )}
            </div>
          </div>

          {/* hour axis */}
          <div className="mt-2 flex justify-between px-2 text-[11px] text-muted-foreground">
            {hourLabels.map((h) => (
              <span key={h}>{h === 24 ? "6am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}</span>
            ))}
          </div>

          {/* totals */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Tile
              icon={<Moon className="size-5 text-[oklch(0.78_0.13_300)]" />}
              label="Всего сна"
              value={formatDuration(sleepMs)}
            />
            <Tile
              icon={<Sun className="size-5 text-[oklch(0.85_0.14_80)]" />}
              label="В активе"
              value={formatDuration(Math.max(0, now - dayStartMs - sleepMs))}
            />
            <Tile label="Засыпаний" value={`${sleepSessions.length}`} />
          </div>

          {/* sessions list */}
          <p className="mt-6 mb-2 px-1 text-xs uppercase tracking-widest text-muted-foreground">
            Сны сегодня
          </p>
          {sleepSessions.length === 0 ? (
            <div className="glass-card rounded-3xl p-6 text-center text-sm text-muted-foreground">
              Пока без сна
            </div>
          ) : (
            <div className="glass-card overflow-hidden rounded-3xl">
              {sleepSessions.map((s, i) => {
                const dur = (s.endedAt ?? now) - s.startedAt;
                const fmt = (ts: number) =>
                  new Date(ts).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i !== sleepSessions.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-[oklch(0.78_0.13_300/0.15)] ring-1 ring-[oklch(0.78_0.13_300/0.4)]">
                      <Moon className="size-4 text-[oklch(0.78_0.13_300)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {fmt(s.startedAt)} – {s.endedAt ? fmt(s.endedAt) : "сейчас"}
                      </p>
                    </div>
                    <p className="font-mono text-sm tabular-nums">{formatDuration(dur)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
