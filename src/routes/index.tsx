import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  useTracker,
  todaysActivities,
  formatTime,
  timeAgo,
  formatBabyAge,
  type ActivityType,
} from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";
import { Settings as SettingsIcon, Plus, Square, ChevronRight } from "lucide-react";
import babyMoon from "@/assets/baby-moon.png";
import { TodayTimeline } from "@/components/TodayTimeline";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const {
    babyName,
    babyBirthDate,
    currentParent,
    activities,
    activeId,
    startActivity,
    stopActivity,
    logInstant,
  } = useTracker();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  const today = todaysActivities(activities);
  const active = activities.find((a) => a.id === activeId);
  const recent = today.slice(0, 3);

  const handleQuick = (type: ActivityType) => {
    if (type === "sleep") {
      if (active?.type === "sleep") stopActivity();
      else startActivity("sleep");
    } else {
      logInstant(type);
    }
  };

  const handlePlus = () => {
    if (active) stopActivity();
    else logInstant("feed");
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-7">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-bold">{babyName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBabyAge(babyBirthDate)}
            {currentParent ? ` · ${currentParent}` : ""}
          </p>
        </div>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
          <img
            src={babyMoon}
            alt="малыш"
            width={88}
            height={88}
            className="relative size-22 object-contain"
            style={{ width: 88, height: 88 }}
          />
        </div>
        <Link
          to="/settings"
          aria-label="Настройки"
          className="glass-card flex size-10 shrink-0 items-center justify-center rounded-2xl"
        >
          <SettingsIcon className="size-4 text-muted-foreground" />
        </Link>
      </header>

      {/* Quick add */}
      <section>
        <p className="mb-3 px-1 text-sm text-muted-foreground">Быстро добавить</p>
        <div className="flex items-end justify-between gap-2">
          <QuickTile type="sleep" active={active?.type === "sleep"} onClick={() => handleQuick("sleep")} />
          <QuickTile type="feed" onClick={() => handleQuick("feed")} />
          <PlusButton onClick={handlePlus} stopping={!!active} />
          <QuickTile type="diaper" onClick={() => handleQuick("diaper")} />
          <QuickTile type="walk" onClick={() => handleQuick("walk")} />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          ↑ {active ? "Нажмите ещё раз, чтобы остановить" : "Нажмите, чтобы добавить событие"}
        </p>
      </section>

      {/* Today timeline card */}
      <section className="glass-card rounded-3xl p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold">Сегодня</h2>
          <p className="text-xs text-muted-foreground">
            Сейчас{" "}
            <span className="font-mono text-sm font-semibold text-primary">
              {formatTime(now)}
            </span>
          </p>
        </div>
        <TodayTimeline activities={today} now={now} />
      </section>

      {/* Recent events */}
      <section className="glass-card overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-base font-semibold">События дня</h2>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-sm text-primary"
          >
            Смотреть все <ChevronRight className="size-4" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 pb-5 text-sm text-muted-foreground">
            Сегодня пока нет записей.
          </p>
        ) : (
          <div className="pb-2">
            {recent.map((a, i) => {
              const cfg = activityConfig[a.type];
              const Icon = cfg.icon;
              return (
                <Link
                  to="/history"
                  key={a.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== recent.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${cfg.bg} ${cfg.ring}`}
                  >
                    <Icon className={`size-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.startedAt)}</p>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatTime(a.startedAt)}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickTile({
  type,
  active,
  onClick,
}: {
  type: ActivityType;
  active?: boolean;
  onClick: () => void;
}) {
  const cfg = activityConfig[type];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`glass-card flex h-24 w-16 flex-col items-center justify-center gap-1.5 rounded-3xl transition-all active:scale-95 ${
        active ? "ring-2 ring-primary" : ""
      }`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-2xl ${cfg.bg} ring-1 ${cfg.ring}`}
      >
        <Icon className={`size-4 ${cfg.color}`} />
      </div>
      <span className="text-[11px] font-medium">{cfg.label}</span>
    </button>
  );
}

function PlusButton({ onClick, stopping }: { onClick: () => void; stopping: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={stopping ? "Остановить" : "Добавить событие"}
      className="relative flex size-20 shrink-0 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-95"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, oklch(0.85 0.14 310), oklch(0.62 0.20 300))",
        boxShadow:
          "0 0 40px oklch(0.78 0.18 300 / 0.6), 0 0 80px oklch(0.78 0.18 300 / 0.35)",
      }}
    >
      <span className="absolute inset-0 rounded-full ring-2 ring-white/20" />
      {stopping ? <Square className="size-6 fill-current" /> : <Plus className="size-9" strokeWidth={2.5} />}
    </button>
  );
}
