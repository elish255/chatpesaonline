import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Check, LogOut, RefreshCw, Send, X, ShieldCheck } from "lucide-react";
import { adminLogin, adminReviewPayment, adminReviewWithdrawal, adminSendNotification, adminSetUserStatus, getAdminData, logout } from "@/lib/app.functions";

export const Route = createFileRoute("/admin")({ component: Admin, head: () => ({ meta: [{ title: "Admin Panel — Chatpesa" }, { name: "robots", content: "noindex, nofollow" }] }) });
function Admin(){
 const navigate=useNavigate(); const location=useLocation(); const load=useServerFn(getAdminData); const reviewPayment=useServerFn(adminReviewPayment); const reviewWithdrawal=useServerFn(adminReviewWithdrawal); const setUserStatus=useServerFn(adminSetUserStatus); const send=useServerFn(adminSendNotification); const signOut=useServerFn(logout);
 if (location.pathname === "/admin/login") {
   return <AdminLoginView />;
 }
 const [data,setData]=useState<{users:Record<string,unknown>[],payments:Record<string,unknown>[],withdrawals:Record<string,unknown>[],notifications:Record<string,unknown>[]}>({users:[],payments:[],withdrawals:[],notifications:[]});
 const [loading,setLoading]=useState(true); const [authorized,setAuthorized]=useState(false); const [error,setError]=useState(""); const [title,setTitle]=useState(""); const [message,setMessage]=useState(""); const [target,setTarget]=useState(""); const [type,setType]=useState<"info"|"success"|"warning"|"error">("info");
 async function refresh(){
   setLoading(true);
   setError("");
   try {
     setData(await load());
   } catch (err) {
     // Never leave the Admin UI visible after an expired/invalid admin session.
     if (err instanceof Error && err.message.includes("UNAUTHORIZED")) {
       await navigate({ to: "/admin/login", replace: true });
       return;
     }
     setError("Session ya admin imeisha au database haijaconnect.");
   } finally {
     setLoading(false);
   }
 }
 useEffect(()=>{
   let cancelled = false;
   (async()=>{
     setLoading(true);
     setError("");
     try {
       // Do not use a one-time "adminEntry" gate here. The authenticated
       // server session is the only gate for the admin panel. This avoids
       // the panel getting stuck on "Inathibitisha admin..." after login.
       const result = await load();
       if (cancelled) return;
       setData(result);
       setAuthorized(true);
     } catch (err) {
       if (cancelled) return;
       if (err instanceof Error && err.message.includes("UNAUTHORIZED")) {
         await navigate({ to: "/admin/login", replace: true });
       } else {
         setError("Session ya admin imeisha au database haijaconnect.");
       }
     } finally {
       if (!cancelled) setLoading(false);
     }
   })();
   return () => { cancelled = true; };
 },[]);
 async function pay(id:string,action:"approve"|"reject"){try{await reviewPayment({data:{paymentId:id,action}});await refresh();}catch(e){setError(e instanceof Error?e.message:"Imeshindikana.");}}
 async function wd(id:string,action:"approve"|"reject"){try{await reviewWithdrawal({data:{withdrawalId:id,action}});await refresh();}catch(e){setError(e instanceof Error?e.message:"Imeshindikana.");}} async function status(id:string,value:"active"|"rejected"|"pending"){try{await setUserStatus({data:{userId:id,status:value}});await refresh();}catch(e){setError(e instanceof Error?e.message:"Imeshindikana.");}}
 async function notify(e:React.FormEvent){e.preventDefault();try{await send({data:{userId:target?target:null,title,message,type}});setTitle("");setMessage("");setTarget("");await refresh();}catch{setError("Notification haikutumwa.");}}
 async function exit(){await signOut();setAuthorized(false);await navigate({to:"/admin/login",replace:true});}
 if (loading && !authorized) {
   return <main className="grid min-h-screen place-items-center bg-background px-4"><div className="w-full max-w-md rounded-3xl bg-card p-7 text-center shadow-card"><p className="text-xs font-bold tracking-widest text-muted-foreground">CHATPESA</p><h1 className="mt-2 text-2xl font-black text-foreground">Inathibitisha Admin...</h1><p className="mt-2 text-sm text-muted-foreground">Inaangalia authentication ya admin.</p></div></main>;
 }
 if (!authorized) {
   return <main className="grid min-h-screen place-items-center bg-background px-4"><div className="w-full max-w-md rounded-3xl bg-card p-7 text-center shadow-card"><p className="text-sm font-semibold text-destructive">{error || "Authentication ya admin inahitajika."}</p><button onClick={()=>void navigate({to:"/admin/login",replace:true})} className="mt-4 w-full rounded-full gradient-blue py-3 font-bold text-primary-foreground">INGIA ADMIN</button></div></main>;
 }
 const userName=(id:unknown)=>String(data.users.find(u=>String(u.id)===String(id))?.name??id);
 return <main className="min-h-screen bg-background pb-16"><div className="mx-auto max-w-6xl px-4 py-5"><header className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-card"><div><p className="text-xs font-bold tracking-widest text-muted-foreground">CHATPESA</p><h1 className="text-2xl font-black text-foreground">Admin Panel</h1></div><div className="flex gap-2"><button onClick={()=>void refresh()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><RefreshCw className="h-4 w-4"/></button><button onClick={()=>void exit()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><LogOut className="h-4 w-4"/></button></div></header>
 {error&&<div className="mt-4 rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}
 <div className="mt-4 grid gap-3 sm:grid-cols-4"><Stat label="Users" value={data.users.length}/><Stat label="Pending deposits" value={data.payments.filter(x=>x.status==="pending").length}/><Stat label="Pending withdrawals" value={data.withdrawals.filter(x=>x.status==="pending").length}/><Stat label="Notifications" value={data.notifications.length}/></div>
 <section className="mt-5 rounded-3xl bg-card p-5 shadow-card"><h2 className="text-lg font-extrabold text-foreground">Tuma Notification</h2><form onSubmit={notify} className="mt-4 grid gap-3 md:grid-cols-2"><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kichwa cha notification" className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"/><select value={target} onChange={e=>setTarget(e.target.value)} className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"><option value="">Watumiaji wote</option>{data.users.map(u=><option key={String(u.id)} value={String(u.id)}>{String(u.name)} — {String(u.email)}</option>)}</select><textarea required value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ujumbe..." className="min-h-24 rounded-xl bg-secondary px-4 py-3 text-sm outline-none md:col-span-2"/><div className="flex gap-2"><select value={type} onChange={e=>setType(e.target.value as typeof type)} className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option></select><button className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-blue px-4 py-3 font-bold text-primary-foreground"><Send className="h-4 w-4"/> Tuma</button></div></form></section>
 <section className="mt-5 rounded-3xl bg-card p-5 shadow-card"><h2 className="text-lg font-extrabold text-foreground">Activation Deposits</h2><div className="mt-3 space-y-2">{data.payments.length===0?<Empty/>:data.payments.map(p=><div key={String(p.id)} className="rounded-2xl border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-foreground">{userName(p.user_id)}</p><p className="text-xs text-muted-foreground">{String(p.method)} · {String(p.phone)} · TZS {Number(p.amount).toLocaleString()}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{String(p.status)}</span></div>{p.status==="pending"&&<div className="mt-3 flex gap-2"><button onClick={()=>void pay(String(p.id),"approve")} className="flex-1 rounded-full gradient-success py-2 text-xs font-bold text-success-foreground"><Check className="mr-1 inline h-3.5 w-3.5"/> APPROVE</button><button onClick={()=>void pay(String(p.id),"reject")} className="flex-1 rounded-full bg-destructive/10 py-2 text-xs font-bold text-destructive"><X className="mr-1 inline h-3.5 w-3.5"/> REJECT</button></div>}</div>)}</div></section>
 <section className="mt-5 rounded-3xl bg-card p-5 shadow-card"><h2 className="text-lg font-extrabold text-foreground">Withdrawals</h2><div className="mt-3 space-y-2">{data.withdrawals.length===0?<Empty/>:data.withdrawals.map(w=><div key={String(w.id)} className="rounded-2xl border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-foreground">{userName(w.user_id)}</p><p className="text-xs text-muted-foreground">{String(w.method)} · {String(w.account_number)} · TZS {Number(w.amount).toLocaleString()}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{String(w.status)}</span></div>{w.status==="pending"&&<div className="mt-3 flex gap-2"><button onClick={()=>void wd(String(w.id),"approve")} className="flex-1 rounded-full gradient-success py-2 text-xs font-bold text-success-foreground">APPROVE</button><button onClick={()=>void wd(String(w.id),"reject")} className="flex-1 rounded-full bg-destructive/10 py-2 text-xs font-bold text-destructive">REJECT</button></div>}</div>)}</div></section>
 <section className="mt-5 rounded-3xl bg-card p-5 shadow-card"><h2 className="text-lg font-extrabold text-foreground">Users</h2><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="p-2">User</th><th className="p-2">Phone</th><th className="p-2">Status</th><th className="p-2">Balance</th><th className="p-2">Created</th><th className="p-2">Control</th></tr></thead><tbody>{data.users.map(u=><tr key={String(u.id)} className="border-b border-border"><td className="p-2"><p className="font-bold">{String(u.name)}</p><p className="text-xs text-muted-foreground">@{String(u.username)} · {String(u.email)}</p></td><td className="p-2">{String(u.phone)}</td><td className="p-2">{String(u.status)}</td><td className="p-2">TZS {Number(u.balance).toLocaleString()}</td><td className="p-2 text-xs">{new Date(String(u.created_at)).toLocaleString()}</td><td className="p-2"><div className="flex flex-wrap gap-1">{String(u.status)!=="active"&&<button onClick={()=>void status(String(u.id),"active")} className="rounded-full gradient-success px-3 py-1.5 text-[11px] font-bold text-success-foreground">ACTIVATE</button>}{String(u.status)!=="rejected"&&<button onClick={()=>void status(String(u.id),"rejected")} className="rounded-full bg-destructive/10 px-3 py-1.5 text-[11px] font-bold text-destructive">REJECT</button>}{String(u.status)!=="pending"&&<button onClick={()=>void status(String(u.id),"pending")} className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold">PENDING</button>}</div></td></tr>)}</tbody></table></div></section>
 </div></main>
}
function Stat({label,value}:{label:string,value:number}){return <div className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-black text-foreground">{value}</p></div>}
function Empty(){return <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">Hakuna taarifa kwa sasa.</div>}

function AdminLoginView() {
 const login = useServerFn(adminLogin);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);

 async function submit(e:React.FormEvent){
   e.preventDefault();
   setError("");
   setLoading(true);
   try {
     await login({data:{email,password}});
     window.location.assign("/admin");
   } catch (err) {
     const code = err instanceof Error ? err.message : "";
     if (code.includes("ADMIN_NOT_FOUND")) setError("Admin account haijapatikana.");
     else if (code.includes("NOT_ADMIN")) setError("Account hii haina ruhusa ya admin.");
     else if (code.includes("ADMIN_NOT_ACTIVE")) setError("Admin account haijawekwa active.");
     else if (code.includes("INVALID_ADMIN_PASSWORD")) setError("Admin password si sahihi.");
     else setError("Admin credentials si sahihi au database haijaconnect.");
   } finally {
     setLoading(false);
   }
 }

 return <main className="grid min-h-screen place-items-center bg-background px-4">
   <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-card p-7 shadow-card">
     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-blue"><ShieldCheck className="h-7 w-7 text-primary-foreground"/></div>
     <h1 className="mt-4 text-center text-2xl font-extrabold text-foreground">Chatpesa Admin</h1>
     <p className="mt-1 text-center text-sm text-muted-foreground">Ingiza credentials za admin.</p>
     <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" className="mt-5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"/>
     <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" className="mt-3 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"/>
     {error&&<p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}
     <button type="submit" disabled={loading} className="mt-4 w-full rounded-full gradient-blue py-3.5 font-bold text-primary-foreground">{loading?"INAINGIA...":"INGIA ADMIN"}</button>
   </form>
 </main>;
}
