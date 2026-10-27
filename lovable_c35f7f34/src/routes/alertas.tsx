import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Alerta, type Camara } from "@/lib/api";
import { AppShell, btnDanger, inputCls, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Muro de Alertas — Sentinel" },
      { name: "description", content: "Intrusiones detectadas por tus cámaras." },
      { property: "og:title", content: "Muro de Alertas — Sentinel" },
      { property: "og:description", content: "Intrusiones detectadas por tus cámaras." },
    ],
  }),
  component: () => (
    <AppShell title="Muro de Alertas">
      <Alertas />
    </AppShell>
  ),
});

function Alertas() {
  const qc = useQueryClient();
  const [camaraId, setCamaraId] = useState("");
  const q = useQuery({ queryKey: ["alertas"], queryFn: () => api<Alerta[]>("/api/Alertas") });
  const cams = useQuery({ queryKey: ["camaras"], queryFn: () => api<Camara[]>("/api/Camaras") });

  const disparar = useMutation({
    mutationFn: () =>
      api(`/api/Alertas/webhook?camaraId=${encodeURIComponent(camaraId)}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertas"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
        <span className="text-sm text-muted-foreground">Prueba de intrusión:</span>
        <select className={`${inputCls} max-w-xs`} value={camaraId} onChange={(e) => setCamaraId(e.target.value)}>
          <option value="">Selecciona cámara…</option>
          {cams.data?.map((c) => (
            <option key={c.id} value={String(c.id)}>CH-{c.numeroCanalDVR} · {c.nombreUbicacion}</option>
          ))}
        </select>
        <button className={btnDanger} disabled={!camaraId || disparar.isPending} onClick={() => disparar.mutate()}>
          {disparar.isPending ? "Disparando…" : "⚠ Simular intrusión"}
        </button>
        {disparar.isSuccess && <Notice kind="ok">Alerta enviada. Revisa Telegram.</Notice>}
        {disparar.error && <Notice kind="error">{disparar.error.message}</Notice>}
      </div>

      {q.isLoading && <p className="text-muted-foreground">Cargando…</p>}
      {q.error && <Notice kind="error">{q.error.message}</Notice>}
      {q.data && q.data.length === 0 && <p className="text-muted-foreground">Sin alertas registradas.</p>}
      <ul className="space-y-2">
        {q.data?.map((a) => {
          const fecha = a.fechaHora ?? a.fecha;
          return (
            <li key={String(a.id)} className="flex items-center gap-4 rounded-lg border border-border border-l-4 border-l-destructive bg-card px-4 py-3">
              <span className="font-mono text-xs text-destructive">INTRUSIÓN</span>
              <span className="text-sm">{a.descripcion ?? `Cámara ${String(a.camaraId ?? "?")}`}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {fecha ? new Date(fecha).toLocaleString() : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
