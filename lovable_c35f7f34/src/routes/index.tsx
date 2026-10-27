import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resolveTenant, session } from "@/lib/api";
import { btnCls, inputCls, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso — Sentinel" },
      { name: "description", content: "Ingresa con tu Tenant para gestionar cámaras y alertas." },
      { property: "og:title", content: "Acceso — Sentinel" },
      { property: "og:description", content: "Ingresa con tu Tenant para gestionar cámaras y alertas." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = await resolveTenant(slug.trim());
      session.set(id, slug.trim());
      navigate({ to: "/camaras" });
    } catch (err) {
      setError(`No se pudo validar el tenant: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8">
        <div>
          <p className="font-mono text-xs font-bold tracking-widest text-primary">◉ SENTINEL</p>
          <h1 className="mt-2 text-2xl font-bold">Acceso</h1>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Tenant Slug</span>
          <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-empresa" required />
        </label>
        {error && <Notice kind="error">{error}</Notice>}
        <button className={`${btnCls} w-full`} disabled={loading}>
          {loading ? "Validando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
