import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { loginUser } from "@/lib/app.functions";

export const Route = createFileRoute("/login")({ component: Login, head: () => ({ meta: [{ title: "Ingia — Chatpesa" }, { name: "robots", content: "noindex, nofollow" }] }) });

function Login() {
  const navigate = useNavigate();
  const login = useServerFn(loginUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try { const res = await login({ data: { username, password } }); if (res.status === "active") await navigate({ to: "/dashboard" }); else await navigate({ to: "/lipa" }); }
    catch { setError("Username au password si sahihi, au account haijapatikana."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-background px-4 py-8"><div className="mx-auto w-full max-w-md"><Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Rudi mwanzo</Link><div className="mt-4 rounded-3xl bg-card p-6 shadow-card"><img src="/chatpesa-logo.jpg" alt="Chatpesa" className="mx-auto h-20 w-full object-contain" /><div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full gradient-blue"><LogIn className="h-7 w-7 text-primary-foreground" /></div><h1 className="mt-3 text-center text-2xl font-extrabold text-foreground">Ingia kwenye Account</h1><form onSubmit={submit} className="mt-6 space-y-4"><input required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="Username" className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none" /><div className="relative"><input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl bg-secondary px-4 py-3 pr-11 text-sm text-foreground outline-none" /><button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{error && <p className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}<button disabled={loading} className="w-full rounded-full gradient-success py-3.5 font-bold text-success-foreground shadow-cta disabled:opacity-60">{loading ? "INAINGIA..." : "INGIA"}</button><p className="text-center text-xs text-muted-foreground">Huna account? <Link to="/jisajili" className="font-bold text-primary">Jisajili</Link></p></form></div></div></main>;
}
