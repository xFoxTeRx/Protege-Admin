import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { AppShell, btnCls, inputCls, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/telegram")({
  head: () => ({
    meta: [
      { title: "Integración Telegram — Sentinel" },
      { name: "description", content: "Configura el bot de Telegram para recibir alertas." },
      { property: "og:title", content: "Integración Telegram — Sentinel" },
      { property: "og:description", content: "Configura el bot de Telegram para recibir alertas." },
    ],
  }),
  component: () => (
    <AppShell title="Integración Telegram">
      <Telegram />
    </AppShell>
  ),
});

function Telegram() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const guardar = useMutation({
    mutationFn: () =>
      api("/api/Telegram/configuracion", {
        method: "POST",
        body: JSON.stringify({ botToken, chatId, activo: true }),
      }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardar.mutate();
      }}
      className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-6"
    >
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Bot Token</span>
        <input className={inputCls} value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="123456:ABC-DEF…" required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Chat ID</span>
        <input className={inputCls} value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890" required />
      </label>
      {guardar.isSuccess && <Notice kind="ok">Configuración guardada.</Notice>}
      {guardar.error && <Notice kind="error">{guardar.error.message}</Notice>}
      <button className={btnCls} disabled={guardar.isPending}>{guardar.isPending ? "Guardando…" : "Guardar"}</button>
    </form>
  );
}
