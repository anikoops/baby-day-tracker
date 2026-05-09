import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useTracker,
  totalDuration,
  formatDuration,
  formatTime,
  type Activity,
} from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";
import { DayOrbit } from "@/components/DayOrbit";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

const PARTS: { key: string; label: string; from: number; to: number }[] = [
  { key: "morning", label: "Утро", from: 5, to: 12 },
  { key: "day", label: "День", from: 12, to: 17 },
  { key: "evening", label: "Вечер", from: 17, to: 23 },
  { key: "night", label: "Ночь", from: 23, to: 5 },
];

const partOf = (ts: number) => {
  const h = new Date(ts).getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "day";
  if (h >= 17 && h < 23) return "evening";
  return "night";
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dateLabel = (d: Date) => {
  const today = new Date();
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (sameDay(d, today)) return "Сегодня";
  if (sameDay(d, yest)) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

const eventName = (a: Activity) => {
  const base = activityConfig[a.type].label;
  if (a.type === "sleep") {
    if (!a.endedAt) return "Сон начался";
    return "Сон";
  }
  return base;
};

const eventTail = (a: Activity) => {
  if (a.endedAt && a.endedAt - a.startedAt >= 60_000) {
    return formatDuration(a.endedAt - a.startedAt);
  }
  if (a.meta?.ml) return `${a.meta.ml} мл`;
  return a.parent;
};

function HistoryPage() {
  const { activities } = useTracker();
  const [date, setDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const dayActivities = useMemo(() => {
    const start = startOfDay(date).getTime();
    const end = start + 86400000;
    return activities
      .filter((a) => a.startedAt >= start && a.startedAt < end)
      .sort((a, b) => a.startedAt - b.startedAt);
  }, [activities, date]);

  const isToday = sameDay(date, new Date());
  const sleep = totalDuration(dayActivities, "sleep");
  const walk = totalDuration(dayActivities, "walk");
  const feeds = dayActivities.filter((a) => a.type === "feed").length;
  const diapers = dayActivities.filter((a) => a.type === "diaper").length;

  const selected =
    dayActivities.find((a) => a.id === selectedId) ??
    dayActivities[dayActivities.length - 1];

  const shift = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(startOfDay(d));
    setSelectedId(undefined);
  };

  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-5 px-5 pt-8 pb-32">
      <header className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/45">
          Архив
        </p>
        <h1 className="text-3xl font-bold tracking-tight">История</h1>
      </header>

      {/* Date switcher */}
      <div className="flex items-center justify-between liquid-control rounded-2xl px-3 py-2">
        <button
          onClick={() => shift(-1)}
          className="flex size-9 items-center justify-center rounded-xl text-foreground/70 hover:bg-white/5"
          aria-label="Предыдущий день"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold">{dateLabel(date)}</span>
          <span className="text-[10px] text-foreground/45">
            {date.toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <button
          onClick={() => shift(1)}
          disabled={isToday}
          className="flex size-9 items-center justify-center rounded-xl text-foreground/70 hover:bg-white/5 disabled:opacity-30"
          aria-label="Следующий день"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between rounded-2xl px-3 text-xs text-foreground/75">
        <span className="flex items-center gap-1.5">
          <span>🌙</span>
          <span className="font-mono">{formatDuration(sleep)}</span>
        </span>
        <span className="text-foreground/20">·</span>
        <span className="flex items-center gap-1.5">
          <span>🍼</span>
          <span className="font-mono">{feeds}</span>
        </span>
        <span className="text-foreground/20">·</span>
        <span className="flex items-center gap-1.5">
          <span>👶</span>
          <span className="font-mono">{diapers}</span>
        </span>
        <span className="text-foreground/20">·</span>
        <span className="flex items-center gap-1.5">
          <span>🚶</span>
          <span className="font-mono">{formatDuration(walk)}</span>
        </span>
      </div>

      {/* Orbit */}
      <DayOrbit
        activities={dayActivities}
        date={date}
        now={Date.now()}
        showNow={isToday}
        selectedId={selected?.id}
        onSelect={setSelectedId}
      />

      {/* Selected event */}
      {selected && <SelectedCard a={selected} />}

      {/* Empty state */}
      {dayActivities.length === 0 && (
        <div className="soft-card rounded-3xl p-8 text-center text-sm text-foreground/55">
          В этот день записей нет
        </div>
      )}

      {/* Timeline by parts of day */}
      {dayActivities.length > 0 && (
        <div className="flex flex-col gap-4">
          {PARTS.map((part) => {
            const items = dayActivities.filter((a) => partOf(a.startedAt) === part.key);
            if (items.length === 0) return null;
            return (
              <section key={part.key} className="flex flex-col gap-2">
                <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">
                  {part.label}
                </h2>
                <div className="soft-card overflow-hidden rounded-2xl">
                  {items.map((a, i) => {
                    const cfg = activityConfig[a.type];
                    const isSel = a.id === selected?.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          i !== items.length - 1 ? "border-b border-white/5" : ""
                        } ${isSel ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
                      >
                        <span className="w-12 shrink-0 font-mono text-xs text-foreground/55">
                          {formatTime(a.startedAt)}
                        </span>
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-base"
                          style={{
                            background: `color-mix(in oklab, var(--${a.type}) 18%, transparent)`,
                            boxShadow: `0 0 6px color-mix(in oklab, var(--${a.type}) ${
                              isSel ? 40 : 18
                            }%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--${a.type}) 40%, transparent)`,
                          }}
                        >
                          {cfg.emoji}
                        </span>
                        <span className="flex-1 text-sm">{eventName(a)}</span>
                        <span className="font-mono text-[11px] text-foreground/55">
                          {eventTail(a)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SelectedCard({ a }: { a: Activity }) {
  const cfg = activityConfig[a.type];
  const hasDuration = a.endedAt && a.endedAt - a.startedAt >= 60_000;
  return (
    <div
      className="soft-card flex flex-col gap-2 rounded-3xl p-4"
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 22px color-mix(in oklab, var(--${a.type}) 22%, transparent), 0 14px 36px rgba(0,0,0,0.26)`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-2xl text-2xl"
          style={{
            background: `color-mix(in oklab, var(--${a.type}) 22%, transparent)`,
            boxShadow: `0 0 14px color-mix(in oklab, var(--${a.type}) 38%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--${a.type}) 50%, transparent)`,
          }}
        >
          {cfg.emoji}
        </span>
        <div className="flex flex-col">
          <span className="text-base font-semibold">{cfg.label}</span>
          <span className="font-mono text-xs text-foreground/55">
            {formatTime(a.startedAt)}
            {a.endedAt ? ` — ${formatTime(a.endedAt)}` : ""}
          </span>
        </div>
        {hasDuration && (
          <span className="ml-auto font-mono text-sm text-foreground/80">
            {formatDuration((a.endedAt as number) - a.startedAt)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-foreground/60">
        <span>{a.parent}</span>
        {a.meta?.ml && <span className="font-mono">{a.meta.ml} мл</span>}
        {a.note && <span className="truncate">{a.note}</span>}
      </div>
    </div>
  );
}
