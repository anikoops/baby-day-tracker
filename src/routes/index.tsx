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
import { Settings as SettingsIcon, ChevronRight } from "lucide-react";
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

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  const today = todaysActivities(activities);
  const recent = today.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
      {/* Header */}
      <header className="relative min-h-[156px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-glow truncate text-[34px] font-bold leading-[38px] tracking-tight text-foreground">
              {babyName}
            </h1>
            <p className="mt-2 text-base text-foreground/65">
              {formatBabyAge(babyBirthDate)}
              {currentParent ? ` · ${currentParent}` : ""}
            </p>
            <p className="mt-3 text-sm text-foreground/55">Локальный режим</p>
          </div>
          <Link
            to="/settings"
            aria-label="Настройки"
            className="liquid-control glow-soft flex size-12 shrink-0 items-center justify-center rounded-full"
          >
            <SettingsIcon className="size-5 text-foreground/80" />
          </Link>
        </div>
        <img
          src={babyMoon}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 top-14 h-28 w-40 object-contain opacity-95"
        />
      </header>

      {/* Timeline */}
      <section className="soft-card glow-medium rounded-[22px] px-4 pb-3 pt-3">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-glow-soft text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
            Сегодня
          </h2>
        </div>
        <TodayTimeline activities={today} now={now} />
      </section>

      {/* Recent events */}
      <section className="soft-card glow-soft rounded-[28px] px-1 pb-2 pt-4">
        <div className="flex items-center justify-between px-4 pb-2">
          <h2 className="text-[22px] font-bold leading-7">События дня</h2>
          <Link to="/history" className="text-glow-soft text-[15px] font-semibold text-primary">
            Смотреть все
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-foreground/55">Сегодня пока нет записей.</p>
        ) : (
          <div>
            {recent.map((a, i) => {
              const cfg = activityConfig[a.type];
              const Icon = cfg.icon;
              return (
                <Link
                  to="/history"
                  key={a.id}
                  className={`flex h-[68px] items-center gap-3 px-4 ${
                    i !== recent.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <div
                    className={`flex size-[46px] items-center justify-center rounded-[23px] ring-1 ${cfg.bg} ${cfg.ring}`}
                    style={{
                      boxShadow: `0 0 6px color-mix(in oklab, var(--${a.type}) 18%, transparent)`,
                    }}
                  >
                    <Icon className={`size-[22px] ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[17px] font-semibold leading-6">{cfg.label}</p>
                    <p className="text-[13px] text-foreground/55">{timeAgo(a.startedAt)}</p>
                  </div>
                  <span className="font-mono text-[15px] text-foreground/60" suppressHydrationWarning>
                    {mounted ? formatTime(a.startedAt) : ""}
                  </span>
                  <ChevronRight className="size-4 text-foreground/40" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

