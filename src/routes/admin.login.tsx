import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { adminLogin } from "@/lib/app.functions";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin, head: () => ({ meta: [{ title: "Admin Login — Chatpesa" }, { name: "robots", content: "noindex, nofollow" }] }) });
function AdminLogin() {
  const navigate = useNavigate(); const login = useServerFn(adminLogin); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e: React.FormEvent){e.preventDefault();setError("");setLoading(true);try{await login({data:{email,password}});await navigate({to:"/admin"});}catch{setError("Admin credentials si sahihi.");}finally{setLoading(false);}}
  return <main className="grid min-h-screen place-items-center bg-background px-4"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-card p-7 shadow-card"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-blue"><ShieldCheck className="h-7 w-7 text-primary-foreground"/></div><h1 className="mt-4 text-center text-2xl font-extrabold text-foreground">Chatpesa Admin</h1><p className="mt-1 text-center text-sm text-muted-foreground">Ingiza credentials za admin.</p><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" className="mt-5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" className="mt-3 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"/>{error&&<p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}<button disabled={loading} className="mt-4 w-full rounded-full gradient-blue py-3.5 font-bold text-primary-foreground">{loading?"INAINGIA...":"INGIA ADMIN"}</button></form></main>;
}
