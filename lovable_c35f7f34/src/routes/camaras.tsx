import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Camara } from "@/lib/api";
import { AppShell, btnCls, inputCls, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/camaras")({
  head: () => ({
    meta: [
      { title: "Mis Cámaras — Sentinel" },
      { name: "description", content: "Lista y registra las cámaras de tu DVR." },
      { property: "og:title", content: "Mis Cámaras — Sentinel" },
      { property: "og:description", content: "Lista y registra las cámaras de tu DVR." },
    ],
  }),
  component: () => (
    <AppShell title="Mis Cámaras">
      <Camaras />
    </AppShell>
  ),
});

function Camaras() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [canal, setCanal] = useState("");
  const [ubic, setUbic] = useState("");

  const q = useQuery({ queryKey: ["camaras"], queryFn: () => api<Camara[]>("/api/Camaras") });
  const crear = useMutation({
    mutationFn: () =>
      api("/api/Camaras", {
        method: "POST",
        body: JSON.stringify({ numeroCanalDVR: Number(canal), nombreUbicacion: ubic }),
      }),
    onSuccess: () => {
      setCanal("");
      setUbic("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["camaras"] });
    },
  });

  return (
    <div className="space-y-6">
      <button className={btnCls} onClick={() => setOpen((v) => !v)}>+ Nueva Cámara</button>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            crear.mutate();
          }}
          className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-[160px_1fr_auto]"
        >
          <input className={inputCls} type="number" min={1} placeholder="Canal DVR" value={canal} onChange={(e) => setCanal(e.target.value)} required />
          <input className={inputCls} placeholder="Ubicación" value={ubic} onChange={(e) => setUbic(e.target.value)} required />
          <button className={btnCls} disabled={crear.isPending}>{crear.isPending ? "Guardando…" : "Guardar"}</button>
          {crear.error && <div className="sm:col-span-3"><Notice kind="error">{crear.error.message}</Notice></div>}
        </form>
      )}
      {q.isLoading && <p className="text-muted-foreground">Cargando…</p>}
      {q.error && <Notice kind="error">{q.error.message}</Notice>}
      {q.data && q.data.length === 0 && <p className="text-muted-foreground">Sin cámaras registradas.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {q.data?.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs text-primary">CH-{String(c.numeroCanalDVR).padStart(2, "0")}</p>
            <p className="mt-1 font-semibold">{c.nombreUbicacion}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">ID {String(c.id)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
