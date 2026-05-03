import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityType = "sleep" | "feed" | "diaper" | "walk";

export interface Activity {
  id: string;
  type: ActivityType;
  startedAt: number;
  endedAt?: number;
  note?: string;
  parent: string;
  meta?: Record<string, string | number>;
}

interface State {
  babyName: string;
  babyAgeMonths: number;
  babyBirthDate?: string; // ISO yyyy-mm-dd
  currentParent: string;
  partners: string[];
  activities: Activity[];
  activeId?: string;
  setBaby: (name: string, birthDate: string) => void;
  setParent: (name: string) => void;
  addPartner: (name: string) => void;
  startActivity: (type: ActivityType, meta?: Record<string, string | number>) => void;
  stopActivity: () => void;
  logInstant: (type: ActivityType, meta?: Record<string, string | number>) => void;
  removeActivity: (id: string) => void;
}

export const useTracker = create<State>()(
  persist(
    (set, get) => ({
      babyName: "Малыш",
      babyAgeMonths: 4,
      babyBirthDate: undefined,
      currentParent: "Мама",
      partners: ["Мама", "Папа"],
      activities: [],
      setBaby: (babyName, babyBirthDate) => {
        const months = babyBirthDate
          ? Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(babyBirthDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 30.4375),
              ),
            )
          : 0;
        set({ babyName, babyBirthDate, babyAgeMonths: months });
      },
      setParent: (currentParent) => set({ currentParent }),
      addPartner: (name) =>
        set((s) => ({ partners: Array.from(new Set([...s.partners, name])) })),
      startActivity: (type, meta) => {
        const id = crypto.randomUUID();
        const a: Activity = {
          id,
          type,
          startedAt: Date.now(),
          parent: get().currentParent,
          meta,
        };
        set((s) => ({ activities: [a, ...s.activities], activeId: id }));
      },
      stopActivity: () => {
        const { activeId, activities } = get();
        if (!activeId) return;
        set({
          activeId: undefined,
          activities: activities.map((a) =>
            a.id === activeId ? { ...a, endedAt: Date.now() } : a,
          ),
        });
      },
      logInstant: (type, meta) => {
        const a: Activity = {
          id: crypto.randomUUID(),
          type,
          startedAt: Date.now(),
          endedAt: Date.now(),
          parent: get().currentParent,
          meta,
        };
        set((s) => ({ activities: [a, ...s.activities] }));
      },
      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),
    }),
    { name: "baby-tracker" },
  ),
);

export function todaysActivities(activities: Activity[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return activities.filter((a) => a.startedAt >= start.getTime());
}

export function totalDuration(activities: Activity[], type: ActivityType) {
  return activities
    .filter((a) => a.type === type && a.endedAt)
    .reduce((sum, a) => sum + ((a.endedAt as number) - a.startedAt), 0);
}

export function formatDuration(ms: number) {
  if (ms <= 0) return "0м";
  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}м`;
  return `${h}ч ${m}м`;
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} д назад`;
}
