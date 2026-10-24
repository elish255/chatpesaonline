import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Smartphone, Clock3 } from "lucide-react";
import { ACTIVATION_FEE, loadRegistration } from "@/lib/session";
import { createFimiPayment, checkFimiPayment } from "@/lib/fimipay.functions";
import { getMe } from "@/lib/app.functions";

export const Route = createFileRoute("/lipa")({
  component: Lipa,
  head: () => ({ meta: [
    { title: "Lipa Activation — Chatpesa" },
    { name: "description", content: `Lipa activation fee ya TZS ${ACTIVATION_FEE.toLocaleString()} kupitia mfumo wa malipo ya simu.` },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
});

function normalize(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("255")) return d;
  if (d.startsWith("0")) return `255${d.slice(1)}`;
  return d.length === 9 ? `255${d}` : d;
}

function Lipa() {
  const navigate = useNavigate();
  const createPayment = useServerFn(createFimiPayment);
  const checkPayment = useServerFn(checkFimiPayment);
  const me = useServerFn(getMe);
  const [phone, setPhone] = useState("");
    const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void me().then((res) => {
        if (res.user?.status === "active") void navigate({ to: "/dashboard" });
      }).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [me, navigate]);

  useEffect(() => {
    const r = loadRegistration();
    if (r?.phone) setPhone(r.phone);
    void me().then((res) => { if (res.user?.status === "active") void navigate({ to: "/dashboard" }); if (res.user?.phone && !r?.phone) setPhone(String(res.user.phone)); }).catch(() => undefined);
  }, [me]);

  useEffect(() => {
    if (!orderId) return;
    let tries = 0;
    const poll = async () => {
      tries += 1;
      try {
        const res = await checkPayment({ data: { orderId } });
        setStatus(res.status);
        if (res.status === "SUCCESS") { if (timer.current) clearInterval(timer.current); await navigate({ to: "/dashboard" }); }
        if (res.status === "FAILED") { if (timer.current) clearInterval(timer.current); setError("Malipo hayajakamilika. Jaribu tena."); }
      } catch { /* subiri poll inayofuata */ }
      if (tries >= 60 && timer.current) clearInterval(timer.current);
    };
    timer.current = setInterval(poll, 5000);
    void poll();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [orderId, checkPayment, navigate]);

  async function startFimiPay(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    const msisdn = normalize(phone);
    if (!/^255\d{9}$/.test(msisdn)) { setError("Weka namba sahihi, mfano 0712345678."); return; }
    setLoading(true);
    try {
      const res = await createPayment({ data: { phone: msisdn } });
      if (res.orderId === "already-active") { await navigate({ to: "/dashboard" }); return; }
      setOrderId(res.orderId); setStatus("PENDING"); setMessage(res.message);
    } catch (err) { setError(err instanceof Error ? err.message : "Imeshindwa kuanzisha malipo."); }
    finally { setLoading(false); }
  }




  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Rudi mwanzo</Link>
        <div className="mt-4 rounded-3xl bg-card p-5 shadow-card sm:p-6">
          <img src="/chatpesa-logo.jpg" alt="Chatpesa" className="mx-auto h-20 w-full object-contain" />
          <h1 className="mt-2 text-center text-2xl font-extrabold text-foreground">Activation Fee TZS {ACTIVATION_FEE.toLocaleString()}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Lipa kwa mfumo wa malipo ya simu. Hakuna Lipa Namba/manual payment.</p>

          <form onSubmit={startFimiPay} className="mt-5 space-y-4">
            <div><label className="text-sm font-semibold text-foreground">Namba ya simu</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /></div>
            <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground"><strong className="text-foreground">Malipo ya moja kwa moja:</strong> bonyeza LIPA SASA, kisha thibitisha ombi kwenye simu yako Kwa kuweka Namba ya Siri.</div>
            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}
            {message && <p className="rounded-xl bg-success/10 p-3 text-sm font-semibold text-success">{message}</p>}
            <button type="submit" disabled={loading || !!orderId} className="flex w-full items-center justify-center gap-2 rounded-full gradient-success py-3.5 font-bold text-success-foreground shadow-cta disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}{orderId ? "INASUBIRI UTHIBITISHO..." : "LIPA SASA"}</button>
            {orderId && <div className="rounded-2xl border border-border p-4 text-center"><Clock3 className="mx-auto h-7 w-7 animate-pulse text-primary" /><p className="mt-2 text-sm font-bold text-foreground">Subiri uthibitisho wa malipo</p><p className="mt-1 text-xs text-muted-foreground">Reference: {orderId} · Status: {status}</p></div>}
          </form>
        </div>
      </div>
    </main>
  );
}
