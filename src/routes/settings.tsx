import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTracker } from "@/lib/tracker-store";
import { Check, UserPlus } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { babyName, babyBirthDate, setBaby } = useTracker();
  const [name, setName] = useState(babyName);
  const [birth, setBirth] = useState(babyBirthDate ?? "");

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Профиль</p>
        <h1 className="mt-1 text-2xl font-bold">Настройки</h1>
      </header>

      <section className="glass-card flex flex-col gap-4 rounded-3xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Малыш
        </h2>
        <Field label="Имя">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-base font-medium outline-none"
          />
        </Field>
        <Field label="Дата рождения">
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            className="w-full bg-transparent text-base font-medium outline-none"
          />
        </Field>
        <button
          onClick={() => setBaby(name, birth)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-semibold text-primary-foreground active:scale-[0.98]"
        >
          <Check className="size-4" /> Сохранить
        </button>
      </section>


      <section className="glass-card rounded-3xl p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          О приложении
        </h2>
        <p className="text-sm text-muted-foreground">
          Трекер сна и активностей малыша. Формат 9:16, готов к встраиванию в Telegram WebApp.
        </p>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl bg-secondary/60 px-4 py-3">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
