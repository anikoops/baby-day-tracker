import { createFileRoute } from "@tanstack/react-router";
import {
  useTracker,
  totalDuration,
  formatDuration,
  formatTime,
  type Activity,
} from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";
import { DayArc } from "@/components/DayArc";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function groupByDay(items: Activity[]) {
  const map = new Map<string, Activity[]>();
  for (const a of items) {
    const d = new Date(a.startedAt);
    const key = d.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries()).map(([key, list]) => ({
    key,
    date: new Date(key),
    list: list.sort((a, b) => b.startedAt - a.startedAt),
  }));
}

const dayLabel = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = (today.getTime() - target.getTime()) / 86400000;
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Вчера";
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
};

function HistoryPage() {
  const { activities } = useTracker();
  const days = groupByDay(activities);

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Архив</p>
        <h1 className="mt-1 text-2xl font-bold">История</h1>
      </header>

      {days.length === 0 && (
        <div className="glass-card rounded-3xl p-8 text-center text-sm text-muted-foreground">
          Записей пока нет
        </div>
      )}

      {days.map((day) => {
        const sleep = totalDuration(day.list, "sleep");
        const feeds = day.list.filter((a) => a.type === "feed").length;
        const diapers = day.list.filter((a) => a.type === "diaper").length;
        return (
          <section key={day.key} className="flex flex-col gap-2">
            <div className="flex items-end justify-between px-1">
              <h2 className="text-base font-semibold capitalize">{dayLabel(day.date)}</h2>
              <p className="text-xs text-muted-foreground">
                🌙 {formatDuration(sleep)} · 🍼 {feeds} · 👶 {diapers}
              </p>
            </div>
            <DayArc
              activities={day.list}
              date={day.date}
              now={Date.now()}
              showSun={dayLabel(day.date) === "Сегодня"}
            />
            <div className="glass-card overflow-hidden rounded-3xl">
              {day.list.map((a, i) => {
                const cfg = activityConfig[a.type];
                const Icon = cfg.icon;
                const dur = a.endedAt ? a.endedAt - a.startedAt : 0;
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i !== day.list.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-xl ring-1 ${cfg.bg} ${cfg.ring}`}
                    >
                      <Icon className={`size-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground">{a.parent}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs">{formatTime(a.startedAt)}</p>
                      {dur > 60000 && (
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {formatDuration(dur)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
