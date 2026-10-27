import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { session } from "@/lib/api";

const nav = [
  { to: "/camaras", label: "Mis Cámaras" },
  { to: "/alertas", label: "Muro de Alertas" },
  { to: "/telegram", label: "Integración Telegram" },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!session.getTenantId()) navigate({ to: "/" });
    else {
      setSlug(session.getSlug());
      setReady(true);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4">
          <span className="font-mono text-sm font-bold tracking-widest text-primary">◉ SENTINEL</span>
          <nav className="flex flex-wrap gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="font-mono text-muted-foreground">{slug}</span>
            <button
              className="rounded-md border border-border px-3 py-1.5 hover:bg-accent"
              onClick={() => {
                session.clear();
                navigate({ to: "/" });
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
        {ready ? children : null}
      </main>
    </div>
  );
}

export const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btnCls =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50";

export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        kind === "error" ? "border-destructive text-destructive" : "border-primary text-primary"
      }`}
    >
      {children}
    </p>
  );
}
