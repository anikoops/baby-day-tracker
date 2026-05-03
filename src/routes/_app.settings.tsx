import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTracker } from "@/lib/tracker-store";
import { Check, UserPlus, X } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const {
    babyName,
    babyAgeMonths,
    setBaby,
    currentParent,
    setParent,
    partners,
    addPartner,
  } = useTracker();
  const [name, setName] = useState(babyName);
  const [age, setAge] = useState(babyAgeMonths);
  const [newPartner, setNewPartner] = useState("");

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
        <Field label="Возраст (мес)">
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full bg-transparent text-base font-medium outline-none"
          />
        </Field>
        <button
          onClick={() => setBaby(name, age)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-semibold text-primary-foreground active:scale-[0.98]"
        >
          <Check className="size-4" /> Сохранить
        </button>
      </section>

      <section className="glass-card flex flex-col gap-3 rounded-3xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Кто ведёт записи
        </h2>
        <div className="flex flex-wrap gap-2">
          {partners.map((p) => (
            <button
              key={p}
              onClick={() => setParent(p)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                p === currentParent
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newPartner}
            onChange={(e) => setNewPartner(e.target.value)}
            placeholder="Имя второго родителя"
            className="flex-1 rounded-2xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => {
              if (newPartner.trim()) {
                addPartner(newPartner.trim());
                setNewPartner("");
              }
            }}
            className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <UserPlus className="size-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Совет: при интеграции в Telegram оба родителя смогут вести единый трекер через
          бота.
        </p>
      </section>

      <section className="glass-card rounded-3xl p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          О приложении
        </h2>
        <p className="text-sm text-muted-foreground">
          Трекер сна и активностей малыша. Дизайн оптимизирован под формат 9:16 для
          встраивания в Telegram WebApp.
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
