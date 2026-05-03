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
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 pt-2">
      <div className="glass-card flex items-center justify-around rounded-3xl px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all ${
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
