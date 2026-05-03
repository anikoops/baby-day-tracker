import { Moon, Milk, Baby, Footprints, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/lib/tracker-store";

export const activityConfig: Record<
  ActivityType,
  { label: string; icon: LucideIcon; color: string; bg: string; ring: string; emoji: string }
> = {
  sleep: {
    label: "Сон",
    icon: Moon,
    color: "text-[oklch(0.78_0.13_300)]",
    bg: "bg-[oklch(0.78_0.13_300/0.15)]",
    ring: "ring-[oklch(0.78_0.13_300/0.4)]",
    emoji: "🌙",
  },
  feed: {
    label: "Кормление",
    icon: Milk,
    color: "text-[oklch(0.82_0.13_200)]",
    bg: "bg-[oklch(0.82_0.13_200/0.15)]",
    ring: "ring-[oklch(0.82_0.13_200/0.4)]",
    emoji: "🍼",
  },
  diaper: {
    label: "Подгузник",
    icon: Baby,
    color: "text-[oklch(0.85_0.14_80)]",
    bg: "bg-[oklch(0.85_0.14_80/0.15)]",
    ring: "ring-[oklch(0.85_0.14_80/0.4)]",
    emoji: "👶",
  },
  walk: {
    label: "Прогулка",
    icon: Footprints,
    color: "text-[oklch(0.80_0.13_150)]",
    bg: "bg-[oklch(0.80_0.13_150/0.15)]",
    ring: "ring-[oklch(0.80_0.13_150/0.4)]",
    emoji: "🌳",
  },
};
