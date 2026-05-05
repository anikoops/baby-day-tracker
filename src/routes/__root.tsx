import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Страница не найдена</h2>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Лунный — Трекер сна малыша" },
      {
        name: "description",
        content: "Совместный трекер сна, кормлений и подгузников для родителей.",
      },
      { name: "theme-color", content: "#1e1530" },
      { property: "og:title", content: "Лунный — Трекер сна малыша" },
      { name: "twitter:title", content: "Лунный — Трекер сна малыша" },
      { name: "description", content: "Baby Day Tracker logs and visualizes your baby's daily activities, including sleep, feeding, and diaper changes." },
      { property: "og:description", content: "Baby Day Tracker logs and visualizes your baby's daily activities, including sleep, feeding, and diaper changes." },
      { name: "twitter:description", content: "Baby Day Tracker logs and visualizes your baby's daily activities, including sleep, feeding, and diaper changes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/94da8868-8efe-45c6-8773-5e6f93e4b7e5/id-preview-48d8b821--c399888f-1b84-4126-90c5-96c040cc2883.lovable.app-1777846628795.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/94da8868-8efe-45c6-8773-5e6f93e4b7e5/id-preview-48d8b821--c399888f-1b84-4126-90c5-96c040cc2883.lovable.app-1777846628795.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden">
      <div className="starry pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex-1 pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
