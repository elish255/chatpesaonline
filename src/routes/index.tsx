import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Headphones, MessageCircle, TrendingUp, Wallet, Banknote, Clock, Smartphone, Landmark, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { people, testimonials, transactions, type Person } from "@/data/people";
import { ChatModal } from "@/components/ChatModal";
import { ACTIVATION_FEE, LIPA_BUSINESS, LIPA_NUMBER } from "@/lib/session";

const SUPPORT_SMS = "sms:0791504184";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbDURjo7DAWw5qvws62c";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chatpesa.online — Chati na Wazungu, Pata Pesa" },
      { name: "description", content: "Chatpesa.online: jisajili, lipia activation fee ya TZS 16,000, kisha anza kuchat na kupata malipo." },
      { property: "og:title", content: "Chatpesa.online" },
      { property: "og:description", content: "Chati na Wazungu, pata pesa. Activation fee TZS 16,000." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://chatpesaonline.site/" },
      { property: "og:image", content: "https://chatpesaonline.site/chatpesa-logo.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://chatpesaonline.site/" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
});

const withdrawMethods = [
  { label: "M-Pesa", bank: false }, { label: "Mixx by Yas", bank: false }, { label: "Halopesa", bank: false },
  { label: "Airtel Money", bank: false }, { label: "NMB", bank: true }, { label: "CRDB", bank: true },
];

function Index() {
  const [ticker, setTicker] = useState(0);
  const [online, setOnline] = useState(3490);
  const [active, setActive] = useState<Person | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTicker((i) => (i + 1) % transactions.length), 4000);
    const o = setInterval(() => setOnline((n) => Math.max(3200, n + Math.floor(Math.random() * 21) - 10)), 5000);
    return () => { clearInterval(t); clearInterval(o); };
  }, []);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-3xl px-4 py-5">
        <header className="rounded-3xl bg-card p-4 shadow-card">
          <img src={logo} alt="Chatpesa.online logo" className="mx-auto h-28 w-full max-w-[320px] object-contain" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/jisajili" className="rounded-full gradient-brand py-3 text-center text-sm font-extrabold text-primary-foreground shadow-cta">JISAJILI</Link>
            <Link to="/login" className="rounded-full bg-secondary py-3 text-center text-sm font-extrabold text-secondary-foreground">INGIA</Link>
          </div>
        </header>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-card px-5 py-3 shadow-card">
          <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-success" />
          <p className="text-sm font-semibold text-foreground">Wazungu {online.toLocaleString("en-US")} wapo mtandaoni</p>
        </div>

        <section className="mt-4 rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-success text-success-foreground"><ShieldCheck className="h-5 w-5" /></div>
            <div><h2 className="font-extrabold text-foreground">Anza kwa hatua 3</h2><p className="mt-1 text-sm text-muted-foreground">Jisajili → lipia TZS {ACTIVATION_FEE.toLocaleString()} → account iki-activate, ingia Dashboard.</p></div>
          </div>
          <Link to="/jisajili" className="mt-4 block rounded-full gradient-success py-3.5 text-center font-extrabold text-success-foreground shadow-cta">FUNGUA ACCOUNT HAPA</Link>
        </section>

        <section className="mt-4 rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-lg font-extrabold text-foreground">Njia za Malipo</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary p-4"><p className="font-extrabold text-foreground">FimiPay</p><p className="mt-1 text-xs text-muted-foreground">Malipo ya moja kwa moja. Ukithibitishwa, account ina-activate bila kusubiri admin.</p></div>
            <div className="rounded-2xl border border-border bg-secondary p-4"><p className="font-extrabold text-foreground">Lipa Namba</p><p className="mt-1 text-xs text-muted-foreground">Lipa kwa namba <strong>{LIPA_NUMBER}</strong>, jina {LIPA_BUSINESS}, kisha thibitisha kwa kuweka namba yako.</p></div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl gradient-blue p-3 text-primary-foreground shadow-card"><p className="flex items-center gap-1 text-[11px] opacity-90"><TrendingUp className="h-3.5 w-3.5" /> Mapato</p><p className="mt-1.5 text-base font-bold">TZS 0</p></div>
          <div className="rounded-2xl gradient-teal p-3 text-primary-foreground shadow-card"><p className="flex items-center gap-1 text-[11px] opacity-90"><Wallet className="h-3.5 w-3.5" /> Salio</p><p className="mt-1.5 text-base font-bold">TZS 0</p></div>
          <div className="rounded-2xl gradient-green p-3 text-primary-foreground shadow-card"><p className="flex items-center gap-1 text-[11px] opacity-90"><Banknote className="h-3.5 w-3.5" /> Iliyotolewa</p><p className="mt-1.5 text-base font-bold">TZS 0</p></div>
        </div>

        <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-foreground">👉 Njia za kutoa pesa (Withdraw)</h2>
          <div className="mt-3 flex flex-wrap gap-2">{withdrawMethods.map((m) => <span key={m.label} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{m.bank ? <Landmark className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}{m.label}</span>)}</div>
        </section>

        <h2 className="mt-8 text-xl font-extrabold text-foreground">Wazungu Wanaotaka Kufundishwa Kiswahili</h2>
        <div className="mt-4 space-y-3">
          {people.map((p, i) => (
            <article key={`${p.name}-${i}`} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card sm:gap-4 sm:p-4">
              <div className="relative shrink-0"><img src={p.photo} alt={p.name} loading="lazy" className="h-16 w-16 rounded-full object-cover" /><span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${p.online ? "bg-success" : "bg-muted-foreground"}`} /></div>
              <div className="min-w-0 flex-1"><h3 className="font-bold leading-tight text-foreground">{p.name}, {p.age}</h3><p className="text-sm text-muted-foreground">{p.job}</p><span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"><Clock className="h-3.5 w-3.5" />{p.duration} · {p.price}</span><p className={`mt-1 text-[11px] font-bold ${p.online ? "text-success" : "text-muted-foreground"}`}>{p.online ? "ONLINE" : "OFFLINE"}</p></div>
              <button type="button" onClick={() => setActive(p)} className="shrink-0 rounded-full gradient-blue px-3 py-2 text-xs font-semibold text-primary-foreground shadow-cta">Start Chat</button>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-2xl bg-card p-6 text-center shadow-card">
          <img src={logo} alt="Chatpesa" className="mx-auto h-16 w-40 object-contain" />
          <h2 className="mt-2 text-lg font-extrabold text-foreground">Huduma kwa Wateja</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center"><a href={SUPPORT_SMS} className="rounded-full gradient-blue px-5 py-3 text-sm font-semibold text-primary-foreground shadow-cta">SMS — 0791504184</a><a href={WHATSAPP_CHANNEL} target="_blank" rel="noreferrer" className="rounded-full gradient-success px-5 py-3 text-sm font-semibold text-success-foreground shadow-cta">WhatsApp Channel</a></div>
        </section>

        <section className="mt-6 rounded-2xl bg-card p-4 shadow-card"><p className="text-[11px] font-bold tracking-widest text-muted-foreground">MIAMALA YA HIVI KARIBUNI</p><p key={ticker} className="mt-2 animate-ticker text-sm font-medium text-foreground">{transactions[ticker]} • Dakika 2 zilizopita</p></section>
        <h2 className="mt-10 text-xl font-extrabold text-foreground">Maoni ya Watumiaji 🎉</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{testimonials.map((t) => <blockquote key={t.author} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-sm text-foreground">“{t.text}”</p><footer className="mt-3 text-xs font-semibold text-muted-foreground">— {t.author}</footer></blockquote>)}</div>
        <footer className="mt-10 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Chatpesa.online — Haki zote zimehifadhiwa.</footer>
      </div>
      <a href={SUPPORT_SMS} className="fixed bottom-5 right-5 flex h-16 w-16 flex-col items-center justify-center rounded-full gradient-teal text-center text-[9px] font-bold leading-tight text-primary-foreground shadow-cta"><Headphones className="mb-0.5 h-5 w-5" />Huduma</a>
      {active && <ChatModal person={active} onClose={() => setActive(null)} />}
    </main>
  );
}
