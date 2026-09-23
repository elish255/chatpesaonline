import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, CheckCircle2, LogOut, X, Wallet, Banknote } from "lucide-react";
import { getMe, getNotifications, dismissNotification, requestWithdrawal, logout } from "@/lib/app.functions";
import { people, type Person } from "@/data/people";
import { ChatModal } from "@/components/ChatModal";

export const Route = createFileRoute("/dashboard")({ component: Dashboard, head: () => ({ meta: [{ title: "Dashboard — Chatpesa" }, { name: "robots", content: "noindex, nofollow" }] }) });

function money(value: unknown) { return `TZS ${Number(value ?? 0).toLocaleString("en-US")}`; }

function Dashboard() {
  const navigate = useNavigate();
  const loadMe = useServerFn(getMe);
  const loadNotifications = useServerFn(getNotifications);
  const hideNotification = useServerFn(dismissNotification);
  const withdraw = useServerFn(requestWithdrawal);
  const signOut = useServerFn(logout);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [active, setActive] = useState<Person | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("100000");
  const [method, setMethod] = useState("M-Pesa");
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh() {
    try {
      const me = await loadMe();
      if (!me.user) { await navigate({ to: "/login" }); return; }
      setUser(me.user);
      const n = await loadNotifications();
      setNotifications(n.notifications);
    } catch { await navigate({ to: "/login" }); }
  }
  useEffect(() => { void refresh(); }, []);

  async function dismiss(id: string) {
    await hideNotification({ data: { notificationId: id } });
    setNotifications((items) => items.filter((x) => String(x.id) !== id));
  }

  async function submitWithdrawal(e: React.FormEvent) {
    e.preventDefault(); setNotice("");
    try { await withdraw({ data: { amount: Number(amount), method, accountNumber } }); setNotice("Ombi la withdrawal limetumwa kwa admin."); setShowWithdraw(false); await refresh(); }
    catch (err) { setNotice(err instanceof Error && err.message.includes("INSUFFICIENT") ? "Salio halitoshi kwa kiasi hicho." : "Withdrawal haikufanikiwa. Hakikisha taarifa zako."); }
  }

  async function doLogout() { await signOut(); await navigate({ to: "/" }); }

  if (!user) return <main className="grid min-h-screen place-items-center bg-background"><div className="text-sm text-muted-foreground">Inapakia dashboard...</div></main>;
  const activeUser = String(user.status) === "active";

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl px-4 py-5">
        <header className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-card"><div><p className="text-xs font-bold tracking-widest text-muted-foreground">CHATPESA ONLINE</p><h1 className="mt-1 text-xl font-extrabold text-foreground">Karibu, {String(user.name).split(" ")[0]} 👋</h1></div><button onClick={() => void doLogout()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground" aria-label="Logout"><LogOut className="h-4 w-4" /></button></header>

        {notifications.length > 0 && <section className="mt-4 space-y-2">{notifications.map((n) => <div key={String(n.id)} className="relative rounded-3xl bg-slate-800 p-5 pr-12 text-white shadow-card"><button onClick={() => void dismiss(String(n.id))} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10" aria-label="Dismiss notification"><X className="h-4 w-4" /></button><div className="flex items-start gap-3"><Bell className="mt-1 h-5 w-5 shrink-0" /><div><p className="font-extrabold">{String(n.title)}</p><p className="mt-1 text-sm text-white/75">{String(n.message)}</p></div></div></div>)}</section>}

        {!activeUser && <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><strong>Akaunti bado haija-activate.</strong> Subiri admin athibitishe Lipa Namba, au malipo ya FimiPay yakamilike.</div>}
        <section className="mt-4 rounded-3xl gradient-brand p-5 text-primary-foreground shadow-cta"><p className="text-sm font-semibold opacity-90">SALIO LAKO</p><p className="mt-1 text-4xl font-black">{money(user.balance)}</p><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white/15 p-3"><p className="text-xs opacity-80">Withdrawn</p><p className="font-bold">{money(user.withdrawn)}</p></div><div className="rounded-2xl bg-white/15 p-3"><p className="text-xs opacity-80">Status</p><p className="font-bold">{activeUser ? "ACTIVE" : "PENDING"}</p></div></div></section>

        <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setShowWithdraw(true)} disabled={!activeUser || Number(user.balance) < 100000} className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 font-extrabold text-foreground shadow-card disabled:opacity-50"><Banknote className="h-5 w-5 text-primary" /> Cash Out</button><Link to="/lipa" className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 font-extrabold text-foreground shadow-card"><Wallet className="h-5 w-5 text-success" /> Activation</Link></div>

        {notice && <div className="mt-3 rounded-2xl bg-secondary p-4 text-sm font-semibold text-foreground">{notice}</div>}

        <section className="mt-7"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-foreground">Wazungu walio tayari kuchat</h2><span className="text-xs font-bold text-success">ACTIVE</span></div><div className="mt-4 space-y-3">{people.map((p) => <article key={p.name} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"><img src={p.photo} alt={p.name} className="h-14 w-14 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="font-bold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.job} · {p.price}</p></div><button disabled={!activeUser} onClick={() => setActive(p)} className="rounded-full gradient-success px-4 py-2 text-xs font-bold text-success-foreground disabled:opacity-50">CHAT</button></article>)}</div></section>

        <div className="mt-8 rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-card"><div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> Malipo ya chat yakikamilika yataongezwa kwenye salio lako. Withdrawal inahitaji salio la angalau TZS 100,000 na approval ya admin.</div></div>
      </div>

      {showWithdraw && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><form onSubmit={submitWithdrawal} className="w-full max-w-md rounded-3xl bg-card p-6 shadow-cta"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-foreground">Omba Withdrawal</h2><button type="button" onClick={() => setShowWithdraw(false)}><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-muted-foreground">Kiwango cha chini ni TZS 100,000.</p><input type="number" min={100000} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-4 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /><select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-3 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"><option>M-Pesa</option><option>Airtel Money</option><option>Mixx by Yas</option><option>HaloPesa</option><option>NMB</option><option>CRDB</option></select><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Namba ya simu/akaunti" className="mt-3 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /><button type="submit" className="mt-4 w-full rounded-full gradient-success py-3.5 font-bold text-success-foreground">TUMA OMBI</button></form></div>}
      {active && <ChatModal person={active} authenticated onClose={() => setActive(null)} />}
    </main>
  );
}
