import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/history", label: "История", icon: BarChart3 },
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div className="liquid-control flex h-[68px] items-center justify-around rounded-[30px] px-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all ${
                active
                  ? "bg-primary/25 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_18px_rgba(155,99,255,0.18)]"
                  : "text-foreground/55"
              }`}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[12px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
