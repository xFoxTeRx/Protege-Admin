import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { session } from "@/lib/api";
import { btnCls, inputCls, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso — Protege+" },
      { name: "description", content: "Ingresa con tu TenantId para gestionar cámaras y alertas." },
      { property: "og:title", content: "Acceso — Protege+" },
      { property: "og:description", content: "Ingresa con tu TenantId para gestionar cámaras y alertas." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [tenantInput, setTenantInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanId = tenantInput.trim();

    // Validación básica de GUID para asegurarnos de que el formato sea correcto
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(cleanId)) {
      setError("El TenantId debe ser un GUID válido (Ej. 60833b99-1550-4b99-9e11-5e5b2943aaed)");
      setLoading(false);
      return;
    }

    try {
      // Guardamos directamente el TenantId ingresado en el localStorage
      session.set(cleanId, "Mi Hogar / Negocio");
      navigate({ to: "/camaras" });
    } catch (err) {
      setError(`No se pudo acceder: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8">
        <div>
          <p className="font-mono text-xs font-bold tracking-widest text-primary">🛡️ PROTEGE+</p>
          <h1 className="mt-2 text-2xl font-bold">Acceso por Tenant</h1>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">TenantId (GUID de tu base Silo)</span>
          <input 
            className={inputCls} 
            value={tenantInput} 
            onChange={(e) => setTenantInput(e.target.value)} 
            placeholder="60833b99-1550-4b99-9e11-5e5b2943aaed" 
            required 
          />
        </label>
        {error && <Notice kind="error">{error}</Notice>}
        <button className={`${btnCls} w-full`} disabled={loading}>
          {loading ? "Entrando…" : "Ingresar al Panel"}
        </button>
      </form>
    </div>
  );
}