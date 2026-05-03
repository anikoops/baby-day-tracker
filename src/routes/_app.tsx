import { Outlet, createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden">
      <div className="starry pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex-1 pb-32">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
