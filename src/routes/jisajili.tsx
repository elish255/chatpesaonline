import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { ACTIVATION_FEE, saveRegistration } from "@/lib/session";
import { registerUser } from "@/lib/app.functions";

const searchSchema = z.object({ partner: z.string().optional(), price: z.string().optional() });
export const Route = createFileRoute("/jisajili")({
  validateSearch: searchSchema,
  component: Jisajili,
  head: () => ({ meta: [
    { title: "Jisajili — Chatpesa" },
    { name: "description", content: `Jisajili Chatpesa kisha lipia activation fee ya TZS ${ACTIVATION_FEE.toLocaleString()}.` },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
});

const formSchema = z.object({
  name: z.string().trim().min(3, "Andika jina kamili").max(80),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/, "Username iwe herufi ndogo, namba au _ (herufi 3-30)"),
  email: z.string().trim().email("Barua pepe si sahihi").max(120),
  phone: z.string().trim().regex(/^(0|255)\d{9}$/, "Namba ya simu iwe kama 0712345678 au 255712345678"),
  password: z.string().min(6, "Password iwe na angalau herufi 6").max(100),
});

function Jisajili() {
  const { partner, price } = Route.useSearch();
  const navigate = useNavigate();
  const createUser = useServerFn(registerUser);
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Jaza taarifa zote"); return; }
    setLoading(true);
    try {
      await createUser({ data: parsed.data });
      saveRegistration({ name: parsed.data.name, username: parsed.data.username, email: parsed.data.email, phone: parsed.data.phone, partner: partner ?? "", price: price ?? "" });
      await navigate({ to: "/lipa" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "REGISTRATION_FAILED";
      if (message.includes("USERNAME_EXISTS")) setError("Username hiyo tayari inatumika. Chagua username nyingine.");
      else if (message.includes("EMAIL_OR_PHONE_EXISTS")) setError("Barua pepe au namba ya simu tayari imesajiliwa. Tumia taarifa nyingine au ingia kwenye account yako.");
      else setError("Usajili umeshindikana. Hakikisha taarifa zako kisha jaribu tena.");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Rudi mwanzo</Link>
        <div className="mt-4 rounded-3xl bg-card p-6 shadow-card">
          <img src="/chatpesa-logo.jpg" alt="Chatpesa" className="mx-auto h-20 w-full object-contain" />
          <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full gradient-blue"><UserPlus className="h-7 w-7 text-primary-foreground" /></div>
          <h1 className="mt-3 text-center text-2xl font-extrabold text-foreground">Fungua Akaunti Yako</h1>
          {partner && <p className="mt-2 text-center text-sm text-muted-foreground">Unajisajili ili kuchat na <strong className="text-foreground">{partner}</strong>{price ? ` (${price} kwa somo)` : ""}.</p>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="text-sm font-semibold text-foreground">Jina Kamili</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juma Hassan" className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /></div>
            <div><label className="text-sm font-semibold text-foreground">Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} placeholder="juma_2026" className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /></div>
            <div><label className="text-sm font-semibold text-foreground">Barua Pepe</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juma@gmail.com" className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /></div>
            <div><label className="text-sm font-semibold text-foreground">Namba ya Simu</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /></div>
            <div><label className="text-sm font-semibold text-foreground">Password</label><div className="relative mt-1"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Angalau herufi 6" className="w-full rounded-xl bg-secondary px-4 py-3 pr-11 text-sm text-foreground outline-none" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Onyesha password">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full gradient-success py-3.5 font-bold text-success-foreground shadow-cta disabled:opacity-60">{loading ? "INASAJILI..." : "ENDELEA KWENYE MALIPO"}</button>
            <p className="text-center text-xs text-muted-foreground">Baada ya usajili utalipia activation fee ya TZS <strong>{ACTIVATION_FEE.toLocaleString("en-US")}</strong>.</p>
            <p className="text-center text-xs text-muted-foreground">Tayari una account? <Link to="/login" className="font-bold text-primary">Ingia hapa</Link></p>
          </form>
        </div>
      </div>
    </main>
  );
}
