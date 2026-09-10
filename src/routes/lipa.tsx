import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Loader2, Smartphone, XCircle } from "lucide-react";
import { ACTIVATION_FEE, loadRegistration, type Registration } from "@/lib/session";
import { checkPaymentStatus, createPaymentOrder } from "@/lib/speedpesa.functions";

export const Route = createFileRoute("/lipa")({
  component: Lipa,
  head: () => ({
    meta: [
      { title: "Lipa Ada ya Uwezeshaji — Chatpesa" },
      {
        name: "description",
        content:
          "Lipa ada ya uwezeshaji TZS 16,000 kwa M-Pesa, Airtel Money, Mixx by Yas au Halopesa kupitia USSD Push na uanze kuchat.",
      },
      { property: "og:title", content: "Lipa Ada ya Uwezeshaji — Chatpesa" },
      {
        property: "og:description",
        content: "Weka namba yako ya simu, gusa LIPA SASA na thibitisha malipo kwenye simu yako.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function normalize(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("255")) return d;
  if (d.startsWith("0")) return `255${d.slice(1)}`;
  return d.length === 9 ? `255${d}` : d;
}

function Lipa() {
  const createOrder = useServerFn(createPaymentOrder);
  const checkStatus = useServerFn(checkPaymentStatus);

  const [user, setUser] = useState<Registration | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const r = loadRegistration();
    setUser(r);
    if (r) setPhone(r.phone);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let tries = 0;
    const poll = async () => {
      tries += 1;
      try {
        const res = await checkStatus({ data: { order_id: orderId } });
        setStatus(res.status);
        if (["COMPLETED", "SUCCESS", "FAILED", "CANCELLED", "REJECTED"].includes(res.status)) {
          if (timer.current) clearInterval(timer.current);
        }
      } catch {
        /* endelea kusubiri */
      }
      if (tries >= 60 && timer.current) clearInterval(timer.current);
    };
    timer.current = setInterval(poll, 5000);
    void poll();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [orderId, checkStatus]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const msisdn = normalize(phone);
    if (!/^255\d{9}$/.test(msisdn)) {
      setError("Weka namba sahihi, mfano 0712345678");
      return;
    }
    setLoading(true);
    try {
      const res = await createOrder({
        data: {
          buyer_name: user?.name || "Mteja Chatpesa",
          buyer_email: user?.email || "mteja@chatpesa.online",
          buyer_phone: msisdn,
          amount: ACTIVATION_FEE,
        },
      });
      if (!res.ok) {
        setError(res.message);
      } else {
        setOrderId(res.order_id);
        setStatus("PENDING");
        setNote(res.message);
      }
    } catch {
      setError("Tatizo la mtandao. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  }

  const done = status === "COMPLETED" || status === "SUCCESS";
  const failed = ["FAILED", "CANCELLED", "REJECTED"].includes(status);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Rudi mwanzo
        </Link>

        <div className="mt-4 rounded-3xl bg-card p-6 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-teal">
            <Smartphone className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-center text-2xl font-extrabold text-foreground">
            Lipia Ada ya Uwezeshaji
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Kiasi cha kulipa ni{" "}
            <strong className="text-foreground">
              TZS {ACTIVATION_FEE.toLocaleString("en-US")}
            </strong>
            {user?.partner ? ` ili kuanza kuchat na ${user.partner}.` : "."}
          </p>

          {!done && (
            <form onSubmit={pay} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Namba ya Simu</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                  placeholder="0712345678"
                  className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  M-Pesa, Airtel Money, Mixx by Yas au Halopesa.
                </p>
              </div>

              {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading || (!!orderId && !failed)}
                className="flex w-full items-center justify-center gap-2 rounded-full gradient-success py-3.5 font-bold text-success-foreground shadow-cta disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                LIPA SASA
              </button>
            </form>
          )}

          {orderId && !done && !failed && (
            <div className="mt-5 rounded-2xl bg-secondary p-4 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-sm font-semibold text-foreground">
                Angalia simu yako — weka PIN kuthibitisha malipo.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note} · Oda: {orderId}
              </p>
            </div>
          )}

          {done && (
            <div className="mt-5 rounded-2xl bg-secondary p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 font-bold text-foreground">Malipo yamekamilika! 🎉</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Akaunti yako imewezeshwa. Sasa unaweza kuanza kuchat na kulipwa.
              </p>
              <Link
                to="/"
                className="mt-4 block rounded-full gradient-blue py-3 font-bold text-primary-foreground shadow-cta"
              >
                ANZA KUCHAT
              </Link>
            </div>
          )}

          {failed && (
            <div className="mt-5 rounded-2xl bg-secondary p-5 text-center">
              <XCircle className="mx-auto h-10 w-10 text-destructive" />
              <p className="mt-2 font-bold text-foreground">Malipo hayakukamilika.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hakikisha una salio la kutosha kisha ujaribu tena.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
