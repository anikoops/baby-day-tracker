import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, Settings, Plus, Square } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTracker, type ActivityType } from "@/lib/tracker-store";
import { activityConfig } from "@/lib/activity-config";

const leftTabs = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/history", label: "История", icon: BarChart3 },
] as const;

const rightTabs = [
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { activeId, activities, startActivity, stopActivity, logInstant } = useTracker();
  const active = activities.find((a) => a.id === activeId);
  const [open, setOpen] = useState(false);

  const handle = (type: ActivityType) => {
    if (type === "sleep") {
      if (active?.type === "sleep") stopActivity();
      else startActivity("sleep");
    } else if (type === "walk") {
      if (active?.type === "walk") stopActivity();
      else startActivity("walk");
    } else {
      logInstant(type);
    }
    setOpen(false);
  };

  const renderTab = (to: string, label: string, Icon: typeof Home) => {
    const isActive = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        className={`flex h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all ${
          isActive
            ? "bg-primary/25 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_18px_rgba(155,99,255,0.18)]"
            : "text-foreground/55"
        }`}
      >
        <Icon className="size-[22px]" strokeWidth={isActive ? 2.4 : 1.8} />
        <span className="text-[12px] font-semibold">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div className="liquid-control relative flex h-[68px] items-center justify-around rounded-[30px] px-2">
        {leftTabs.map((t) => renderTab(t.to, t.label, t.icon))}

        {/* Center FAB */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label={active ? "Остановить" : "Добавить событие"}
              className="plus-pulse relative -mt-10 flex size-[72px] shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-[0.96]"
              style={{
                background:
                  "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.38), transparent 28%), linear-gradient(180deg, #B58AFF 0%, #7D4DFF 100%)",
                boxShadow:
                  "0 0 24px rgba(155,99,255,0.55), 0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/30" />
              {active ? <Square className="size-6 fill-current" /> : <Plus className="size-9" strokeWidth={2.4} />}
              <span className="absolute -bottom-5 text-[11px] font-semibold text-foreground/60">
                Добавить
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[28px] border-white/10 bg-background/95 backdrop-blur-xl">
            <SheetHeader>
              <SheetTitle className="text-left">Быстро добавить</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 pb-6 pt-4">
              {(Object.keys(activityConfig) as ActivityType[]).map((type) => {
                const cfg = activityConfig[type];
                const Icon = cfg.icon;
                const isActive = active?.type === type;
                return (
                  <button
                    key={type}
                    onClick={() => handle(type)}
                    className={`liquid-control flex h-[88px] flex-col items-center justify-center gap-2 rounded-[22px] transition-transform active:scale-[0.97] ${
                      isActive ? "ring-2 ring-primary glow-strong" : "glow-soft"
                    }`}
                    style={{
                      boxShadow: isActive
                        ? undefined
                        : `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 14px color-mix(in oklab, var(--${type}) 24%, transparent), 0 8px 22px rgba(0,0,0,0.24)`,
                    }}
                  >
                    <Icon
                      className={`size-[26px] ${cfg.color}`}
                      strokeWidth={1.8}
                      style={{
                        filter: `drop-shadow(0 0 6px color-mix(in oklab, var(--${type}) 70%, transparent))`,
                      }}
                    />
                    <span className="text-[14px] font-semibold">
                      {isActive ? "Остановить" : cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        {rightTabs.map((t) => renderTab(t.to, t.label, t.icon))}
      </div>
    </nav>
  );
}
