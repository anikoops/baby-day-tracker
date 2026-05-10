import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useTracker,
  todaysActivities,
  totalDuration,
  formatDuration,
  formatTime,
  timeAgo,
  formatBabyAge,
  type Activity,
  type ActivityType,
} from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";
import { Settings as SettingsIcon, Plus, Square, ChevronRight } from "lucide-react";
import babyMoon from "@/assets/baby-moon.png";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const shortLabel: Record<ActivityType, string> = {
  sleep: "Сон",
  feed: "Еда",
  diaper: "Подгуз.",
  walk: "Прогул.",
};

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
    <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-glow truncate text-[34px] font-bold leading-[38px] tracking-tight text-foreground">
            {babyName}
          </h1>
          <p className="mt-2 text-base text-foreground/65">
            {formatBabyAge(babyBirthDate)}
            {currentParent ? ` · ${currentParent}` : ""}
          </p>
        </div>
        <Link
          to="/settings"
          aria-label="Настройки"
          className="liquid-control glow-soft flex size-12 shrink-0 items-center justify-center rounded-full"
        >
          <SettingsIcon className="size-5 text-foreground/80" />
        </Link>
      </header>

      {/* Now */}
      <NowCard activities={today} active={active} now={now} mounted={mounted} />

      {/* Quick Add */}
      <section>
        <h2 className="mb-3 text-xl font-bold text-foreground/75">Быстро добавить</h2>
        <div className="flex items-center justify-between gap-2">
          <QuickTile type="sleep" active={active?.type === "sleep"} onClick={() => handleQuick("sleep")} />
          <QuickTile type="feed" onClick={() => handleQuick("feed")} />
          <PlusButton onClick={handlePlus} stopping={!!active} />
          <QuickTile type="diaper" onClick={() => handleQuick("diaper")} />
          <QuickTile type="walk" onClick={() => handleQuick("walk")} />
        </div>
        <p className="mt-2 text-center text-[13px] text-foreground/40">
          {active ? "Нажмите ещё раз, чтобы остановить" : "Добавить другое событие"}
        </p>
      </section>

      {/* Today summary */}
      <TodaySummary activities={today} />

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

function NowCard({
  activities,
  active,
  now,
  mounted,
}: {
  activities: Activity[];
  active?: Activity;
  now: number;
  mounted: boolean;
}) {
  const sleepRow = useMemo(() => {
    if (active?.type === "sleep") {
      const mins = Math.max(0, Math.floor((now - active.startedAt) / 60000));
      return {
        title: `Спит ${formatDuration(mins * 60000)}`,
        subtitle: `начался в ${formatTime(active.startedAt)}`,
      };
    }
    const lastSleep = activities
      .filter((a) => a.type === "sleep" && a.endedAt)
      .sort((a, b) => (b.endedAt as number) - (a.endedAt as number))[0];
    if (lastSleep && lastSleep.endedAt) {
      const mins = Math.max(0, Math.floor((now - lastSleep.endedAt) / 60000));
      return {
        title: `Бодрствует ${formatDuration(mins * 60000)}`,
        subtitle: `после сна ${formatTime(lastSleep.startedAt)} — ${formatTime(lastSleep.endedAt)}`,
      };
    }
    return { title: "Сна сегодня ещё не было", subtitle: "" };
  }, [active, activities, now]);

  const lastFeed = activities.filter((a) => a.type === "feed").sort((a, b) => b.startedAt - a.startedAt)[0];
  const lastDiaper = activities.filter((a) => a.type === "diaper").sort((a, b) => b.startedAt - a.startedAt)[0];

  const feedRow = lastFeed
    ? {
        title: `Кормление ${timeAgo(lastFeed.startedAt)}`,
        subtitle: `последнее в ${formatTime(lastFeed.startedAt)}${
          lastFeed.meta?.ml ? ` · ${lastFeed.meta.ml} мл` : ""
        }`,
      }
    : { title: "Кормления ещё не было", subtitle: "" };

  const diaperRow = lastDiaper
    ? {
        title: `Подгузник ${timeAgo(lastDiaper.startedAt)}`,
        subtitle: `последний в ${formatTime(lastDiaper.startedAt)}`,
      }
    : { title: "Подгузник ещё не меняли", subtitle: "" };

  const rows: { type: ActivityType; title: string; subtitle: string }[] = [
    { type: "sleep", ...sleepRow },
    { type: "feed", ...feedRow },
    { type: "diaper", ...diaperRow },
  ];

  return (
    <section className="soft-card glow-medium relative overflow-hidden rounded-[28px] px-5 pb-5 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[22px] font-bold leading-7">Сейчас</h2>
        <span className="font-mono text-[15px] text-foreground/55" suppressHydrationWarning>
          {mounted ? formatTime(now) : ""}
        </span>
      </div>
      <div className="relative z-10 flex flex-col gap-3 pr-[44%]">
        {rows.map((r) => {
          const cfg = activityConfig[r.type];
          const Icon = cfg.icon;
          return (
            <div key={r.type} className="flex items-center gap-3">
              <div
                className={`flex size-[44px] shrink-0 items-center justify-center rounded-[22px] ring-1 ${cfg.bg} ${cfg.ring}`}
                style={{
                  boxShadow: `0 0 8px color-mix(in oklab, var(--${r.type}) 22%, transparent)`,
                }}
              >
                <Icon
                  className={`size-[20px] ${cfg.color}`}
                  style={{
                    filter: `drop-shadow(0 0 4px color-mix(in oklab, var(--${r.type}) 60%, transparent))`,
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold leading-5" suppressHydrationWarning>
                  {mounted ? r.title : "—"}
                </p>
                {r.subtitle && (
                  <p className="truncate text-[12px] text-foreground/55" suppressHydrationWarning>
                    {mounted ? r.subtitle : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <img
        src={babyMoon}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-2 bottom-0 top-8 my-auto h-[180px] w-auto object-contain opacity-95"
      />
    </section>
  );
}

function TodaySummary({ activities }: { activities: Activity[] }) {
  const types: ActivityType[] = ["sleep", "feed", "diaper", "walk"];
  const stats = types.map((t) => {
    const count = activities.filter((a) => a.type === t).length;
    const dur = totalDuration(activities, t);
    const isDuration = t === "sleep" || t === "walk";
    const value = isDuration ? formatDuration(dur) : String(count);
    const label =
      t === "sleep"
        ? "Сон"
        : t === "feed"
          ? "Кормлений"
          : t === "diaper"
            ? "Подгузников"
            : "Прогулка";
    return { type: t, value, label };
  });

  return (
    <section className="soft-card glow-soft rounded-[28px] px-4 pb-4 pt-4">
      <h2 className="mb-3 text-[18px] font-bold leading-6">Сегодня</h2>
      <div className="flex items-stretch gap-2">
        {stats.map((s) => {
          const cfg = activityConfig[s.type];
          const Icon = cfg.icon;
          return (
            <div
              key={s.type}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-[18px] px-1 py-2"
            >
              <div
                className={`flex size-[36px] items-center justify-center rounded-full ring-1 ${cfg.bg} ${cfg.ring}`}
                style={{
                  boxShadow: `0 0 6px color-mix(in oklab, var(--${s.type}) 18%, transparent)`,
                }}
              >
                <Icon
                  className={`size-[18px] ${cfg.color}`}
                  style={{
                    filter: `drop-shadow(0 0 3px color-mix(in oklab, var(--${s.type}) 50%, transparent))`,
                  }}
                />
              </div>
              <span className="text-[16px] font-bold leading-5 tabular-nums">{s.value}</span>
              <span className="text-[11px] text-foreground/55">{s.label}</span>
            </div>
          );
        })}
      </div>
    </section>
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
      className={`liquid-control flex h-[102px] w-[60px] flex-col items-center justify-center gap-2.5 rounded-[22px] transition-transform active:scale-[0.96] ${
        active ? "ring-2 ring-primary glow-strong" : "glow-soft"
      }`}
      style={{
        boxShadow: active
          ? undefined
          : `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 12px color-mix(in oklab, var(--${type}) 22%, transparent), 0 8px 22px rgba(0,0,0,0.24)`,
      }}
    >
      <Icon
        className={`size-[26px] ${cfg.color}`}
        strokeWidth={1.8}
        style={{
          filter: `drop-shadow(0 0 6px color-mix(in oklab, var(--${type}) 70%, transparent))`,
        }}
      />
      <span className="text-[13px] font-semibold leading-4">{shortLabel[type]}</span>
    </button>
  );
}

function PlusButton({ onClick, stopping }: { onClick: () => void; stopping: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={stopping ? "Остановить" : "Добавить событие"}
      className="plus-pulse relative flex size-24 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-[0.96]"
      style={{
        background:
          "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.38), transparent 28%), linear-gradient(180deg, #B58AFF 0%, #7D4DFF 100%)",
      }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/30" />
      {stopping ? (
        <Square className="size-6 fill-current" />
      ) : (
        <Plus className="size-12" strokeWidth={2} />
      )}
    </button>
  );
}
