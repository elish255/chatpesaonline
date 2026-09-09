import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download,
  Headphones,
  MessageCircle,
  TrendingUp,
  Wallet,
  Banknote,
  Clock,
  Smartphone,
  Landmark,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { people, testimonials, transactions, type Person } from "@/data/people";
import { ChatModal } from "@/components/ChatModal";


const REGISTER_URL = "https://kozenasite.site/register?ref=NEXAMU01";
const SUPPORT_SMS = "sms:0791504184";
const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029VbDURjo7DAWw5qvws62c";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chatpesa — Chati na Wazungu, Pata Pesa Kila Siku" },
      {
        name: "description",
        content:
          "Fundisha Kiswahili kwa wazungu kwa chati fupi na upate malipo ya TZS 70,000 hadi 150,000. Toa pesa kupitia M-Pesa, Airtel Money, Mixx by Yas, NMB na CRDB.",
      },
      { property: "og:title", content: "Chatpesa — Chati na Wazungu, Pata Pesa" },
      {
        property: "og:description",
        content:
          "Wazungu maelfu wapo mtandaoni wanaotaka kufundishwa Kiswahili. Anza chati leo na toa pesa moja kwa moja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const withdrawMethods = [
  { label: "Mpesa", bank: false },
  { label: "Mixx by Yas", bank: false },
  { label: "Halopesa", bank: false },
  { label: "Airtel Money", bank: false },
  { label: "NMB", bank: true },
  { label: "CRDB", bank: true },
];

function Index() {
  const [ticker, setTicker] = useState(0);
  const [online, setOnline] = useState(3490);
  const [active, setActive] = useState<Person | null>(null);


  useEffect(() => {
    const t = setInterval(() => setTicker((i) => (i + 1) % transactions.length), 4000);
    const o = setInterval(
      () => setOnline((n) => Math.max(3200, n + Math.floor(Math.random() * 21) - 10)),
      5000,
    );
    return () => {
      clearInterval(t);
      clearInterval(o);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <img
            src={logo}
            alt="Nembo ya Chatpesa"
            width={512}
            height={512}
            className="h-14 w-14 rounded-full bg-card object-contain p-1 shadow-card"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Chatpesa.online
          </h1>
        </header>

        {/* Top actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={REGISTER_URL}
            className="flex items-center justify-center gap-2 rounded-3xl gradient-blue px-4 py-4 text-center font-bold text-primary-foreground shadow-cta transition-transform hover:scale-[1.02]"
          >
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 shrink-0 rounded-full bg-card object-contain p-0.5"
            />
            <Download className="h-5 w-5 shrink-0" />
            <span>Install App</span>
          </a>
          <a
            href={SUPPORT_SMS}
            className="flex items-center justify-center gap-2 rounded-3xl gradient-success px-4 py-4 text-center font-bold text-success-foreground shadow-cta transition-transform hover:scale-[1.02]"
          >
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 shrink-0 rounded-full bg-card object-contain p-0.5"
            />
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span>Huduma kwa Wateja</span>
          </a>
        </div>


        {/* Online counter */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-card px-5 py-3 shadow-card">
          <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse-dot" />
          <p className="text-sm font-semibold text-foreground">
            Wazungu {online.toLocaleString("en-US")} wapo mtandaoni
          </p>
        </div>

        {/* Balance cards — horizontal row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl gradient-blue p-3 text-primary-foreground shadow-card">
            <p className="flex items-center gap-1 text-[11px] opacity-90">
              <TrendingUp className="h-3.5 w-3.5" /> Mapato
            </p>
            <p className="mt-1.5 text-base font-bold leading-tight">TZS 0</p>
          </div>
          <div className="rounded-2xl gradient-teal p-3 text-primary-foreground shadow-card">
            <p className="flex items-center gap-1 text-[11px] opacity-90">
              <Wallet className="h-3.5 w-3.5" /> Salio
            </p>
            <p className="mt-1.5 text-base font-bold leading-tight">TZS 0</p>
            <a
              href={REGISTER_URL}
              className="mt-2 block rounded-full bg-card/85 py-1.5 text-center text-[11px] font-semibold text-accent"
            >
              Toa Pesa
            </a>
          </div>
          <div className="rounded-2xl gradient-green p-3 text-primary-foreground shadow-card">
            <p className="flex items-center gap-1 text-[11px] opacity-90">
              <Banknote className="h-3.5 w-3.5" /> Iliyotolewa
            </p>
            <p className="mt-1.5 text-base font-bold leading-tight">TZS 0</p>
          </div>
        </div>

        {/* Register CTA */}
        <a
          href={REGISTER_URL}
          className="mt-4 block rounded-full gradient-brand py-4 text-center text-lg font-bold text-primary-foreground shadow-cta transition-transform hover:scale-[1.01]"
        >
          Fungua Account Hapa
        </a>

        {/* Withdraw methods */}
        <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-foreground">
            👉 Njia Rahisi za kutoa pesa (Withdraw) zako Automatically
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {withdrawMethods.map((m) => (
              <span
                key={m.label}
                className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground"
              >
                {m.bank ? (
                  <Landmark className="h-4 w-4 text-primary" />
                ) : (
                  <Smartphone className="h-4 w-4 text-primary" />
                )}
                {m.label}
              </span>
            ))}
          </div>
        </section>

        {/* People list */}
        <h2 className="mt-8 text-xl font-extrabold text-foreground">
          Wazungu Wanaotaka Kufundishwa Kiswahili
        </h2>
        <div className="mt-4 space-y-3">
          {people.map((p, i) => (
            <article
              key={`${p.name}-${i}`}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 sm:gap-4 sm:p-4 shadow-card"
            >
              <div className="relative shrink-0">
                <img
                  src={p.photo}
                  alt={p.name}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${
                    p.online ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold leading-tight text-foreground">
                  {p.name}, {p.age}
                </h3>
                <p className="text-sm text-muted-foreground">{p.job}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {p.duration} · {p.price}
                </span>
                <p
                  className={`mt-1 text-[11px] font-bold ${
                    p.online ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {p.online ? "ONLINE" : "OFFLINE"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive(p)}
                className="shrink-0 rounded-full gradient-blue px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm text-primary-foreground shadow-cta"
              >
                Start Chat
              </button>

            </article>
          ))}
        </div>

        {/* Support */}
        <section className="mt-10 rounded-2xl bg-card p-6 text-center shadow-card">
          <img
            src={logo}
            alt="Chatpesa"
            loading="lazy"
            width={512}
            height={512}
            className="mx-auto h-16 w-16 object-contain"
          />
          <h2 className="mt-3 text-lg font-extrabold text-foreground">
            Huduma kwa Wateja
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={SUPPORT_SMS}
              className="rounded-full gradient-blue px-5 py-3 text-sm font-semibold text-primary-foreground shadow-cta"
            >
              Tuma SMS ya Kawaida — 0791504184
            </a>
            <a
              href={WHATSAPP_CHANNEL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full gradient-success px-5 py-3 text-sm font-semibold text-success-foreground shadow-cta"
            >
              Jiunge na Channel ya WhatsApp
            </a>
          </div>
        </section>

        {/* Transactions ticker */}
        <section className="mt-6 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground">
            MIAMALA YA HIVI KARIBUNI
          </p>
          <p
            key={ticker}
            className="mt-2 animate-ticker text-sm font-medium text-foreground"
          >
            {transactions[ticker]} • Dakika 2 zilizopita
          </p>
        </section>

        {/* Testimonials */}
        <h2 className="mt-10 text-xl font-extrabold text-foreground">
          Maoni ya Watumiaji 🎉
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.author}
              className="rounded-2xl bg-card p-4 shadow-card"
            >
              <p className="text-sm text-foreground">“{t.text}”</p>
              <footer className="mt-3 text-xs font-semibold text-muted-foreground">
                — {t.author}
              </footer>
            </blockquote>
          ))}
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Chatpesa.online — Haki zote zimehifadhiwa.
        </footer>
      </div>

      {/* Floating support */}
      <a
        href={SUPPORT_SMS}
        className="fixed bottom-5 right-5 flex h-16 w-16 flex-col items-center justify-center rounded-full gradient-teal text-center text-[9px] font-bold leading-tight text-primary-foreground shadow-cta"
      >
        <Headphones className="mb-0.5 h-5 w-5" />
        Huduma kwa Wateja
      </a>
    </main>
  );
}
