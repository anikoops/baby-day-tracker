import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  useTracker,
  todaysActivities,
  totalDuration,
  formatDuration,
  formatTime,
  timeAgo,
  formatBabyAge,
  type ActivityType,
} from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";
import { Moon, Milk, Baby, Square, Sparkles, Trash2 } from "lucide-react";
import babyMoon from "@/assets/baby-moon.png";
import { SleepStatsSheet } from "@/components/SleepStatsSheet";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const {
    babyName,
    babyBirthDate,
    activities,
    activeId,
    startActivity,
    stopActivity,
    logInstant,
    removeActivity,
  } = useTracker();

  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const today = todaysActivities(activities);
  const sleepMs = totalDuration(today, "sleep");
  const dayStart = new Date().setHours(0, 0, 0, 0);
  const wakeMs = Math.max(0, Date.now() - dayStart - sleepMs);
  const feedCount = today.filter((a) => a.type === "feed").length;
  const diaperCount = today.filter((a) => a.type === "diaper").length;
  const active = activities.find((a) => a.id === activeId);

  const handleQuick = (type: ActivityType) => {
    if (type === "sleep") {
      if (active?.type === "sleep") stopActivity();
      else startActivity("sleep");
    } else {
      logInstant(type);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{babyName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatBabyAge(babyBirthDate)}</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
          <img
            src={babyMoon}
            alt="малыш"
            width={80}
            height={80}
            className="relative size-20 object-contain"
          />
        </div>
      </header>

      {active && !active.endedAt && (
        <button
          onClick={stopActivity}
          className="glass-card relative overflow-hidden rounded-3xl p-5 text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-foreground/70">
                Сейчас идёт
              </p>
              <p className="mt-1 text-xl font-bold">
                {activityConfig[active.type].emoji} {activityConfig[active.type].label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                с {formatTime(active.startedAt)} ·{" "}
                <LiveDuration startedAt={active.startedAt} />
              </p>
            </div>
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_oklch(0.78_0.13_300/0.6)]">
              <Square className="size-5 fill-current" />
            </div>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Сон" value={formatDuration(sleepMs)} icon={Moon} tint="sleep" />
        <StatCard
          label="Бодрствование"
          value={formatDuration(wakeMs)}
          icon={Sparkles}
          tint="diaper"
        />
        <StatCard label="Кормления" value={`${feedCount}`} sub="раз" icon={Milk} tint="feed" />
        <StatCard
          label="Подгузники"
          value={`${diaperCount}`}
          sub="шт"
          icon={Baby}
          tint="diaper"
        />
      </div>

      <div>
        <p className="mb-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">
          Быстрое добавление
        </p>
        <div className="grid grid-cols-4 gap-2">
          <QuickButton
            type="sleep"
            label={active?.type === "sleep" ? "Стоп" : "Сон"}
            active={active?.type === "sleep"}
            onClick={() => handleQuick("sleep")}
          />
          <QuickButton type="feed" label="Еда" onClick={() => handleQuick("feed")} />
          <QuickButton type="diaper" label="Подгуз." onClick={() => handleQuick("diaper")} />
          <QuickButton type="walk" label="Прогул." onClick={() => handleQuick("walk")} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            События дня
          </p>
          <span className="text-xs text-muted-foreground">{today.length}</span>
        </div>
        {today.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Сегодня пока нет записей. Нажмите кнопку выше.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-3xl">
            {today.map((a, i) => {
              const cfg = activityConfig[a.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className={`group flex items-center gap-3 px-4 py-3 ${
                    i !== today.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-2xl ring-1 ${cfg.bg} ${cfg.ring}`}
                  >
                    <Icon className={`size-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{cfg.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatTime(a.startedAt)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.endedAt && a.endedAt - a.startedAt > 60000
                        ? `${formatDuration(a.endedAt - a.startedAt)} · ${a.parent}`
                        : `${a.parent} · ${timeAgo(a.startedAt)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="opacity-60 transition-opacity hover:opacity-100"
                    aria-label="удалить"
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LiveDuration({ startedAt }: { startedAt: number }) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);
  return <span className="font-mono">{formatDuration(Date.now() - startedAt)}</span>;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: "sleep" | "feed" | "diaper" | "walk";
}) {
  const tintMap = {
    sleep: "text-[oklch(0.78_0.13_300)]",
    feed: "text-[oklch(0.82_0.13_200)]",
    diaper: "text-[oklch(0.85_0.14_80)]",
    walk: "text-[oklch(0.80_0.13_150)]",
  };
  return (
    <div className="glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`size-4 ${tintMap[tint]}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function QuickButton({
  type,
  label,
  active,
  onClick,
}: {
  type: ActivityType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  const cfg = activityConfig[type];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`glass-card flex flex-col items-center gap-2 rounded-3xl py-4 transition-all active:scale-95 ${
        active ? "ring-2 ring-primary" : ""
      }`}
    >
      <div
        className={`flex size-11 items-center justify-center rounded-2xl ${cfg.bg} ring-1 ${cfg.ring}`}
      >
        <Icon className={`size-5 ${cfg.color}`} />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
