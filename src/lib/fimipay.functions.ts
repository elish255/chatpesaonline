import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseRest } from "@/lib/db";
import { ACTIVATION_FEE } from "@/lib/session";

const paymentInput = z.object({ phone: z.string().regex(/^255\d{9}$/) });
const API_BASE = "https://api.splashpay.co.tz/api/v1";
function splashHeaders(idempotencyKey?: string) {
  const key = process.env.SPLASHPAY_API_KEY;
  const secret = process.env.SPLASHPAY_API_SECRET;
  if (!key || !secret) throw new Error("SPLASHPAY_API_KEY na SPLASHPAY_API_SECRET lazima ziwekwe Vercel Environment Variables.");
  return { "Content-Type": "application/json", Accept: "application/json", "X-API-KEY": key, "X-API-SECRET": secret, ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) };
}
function nestedData(body: Record<string, unknown> | null): Record<string, unknown> | null {
  return body?.data && typeof body.data === "object" ? body.data as Record<string, unknown> : body;
}
function newReference() { return `INV-${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`; }

export const createFimiPayment = createServerFn({ method: "POST" }).validator(paymentInput).handler(async ({ data }) => {
  const userId = await requireUser();
  const users = await supabaseRest<Array<Record<string, unknown>>>("chatpesa_users", { query: { select: "id,name,username,email,phone,status", id: `eq.${userId}`, limit: 1 } });
  const user = users[0];
  if (!user) throw new Error("Akaunti haijapatikana.");
  if (user.status === "active") return { ok: true, orderId: "already-active", message: "Akaunti yako tayari iko active." };
  const reference = newReference();
  const res = await fetch(`${API_BASE}/payments/mobile-money`, { method: "POST", headers: splashHeaders(reference), body: JSON.stringify({
    amount: ACTIVATION_FEE, currency: "TZS", reference, phone: data.phone,
    customer_name: String(user.name || user.username || "Chatpesa User"), customer_email: String(user.email || `${userId}@chatpesaonline`),
    metadata: { user_id: userId, purpose: "activation", product: "Chatpesa account activation" },
  }) });
  const body = await res.json().catch(() => null) as Record<string, unknown> | null;
  const nested = nestedData(body);
  if (!res.ok || String(body?.status ?? "").toLowerCase() !== "success" || !nested?.reference) throw new Error(String(body?.message ?? `imeshindwa kuanzisha malipo (HTTP ${res.status}).`));
  const returnedReference = String(nested.reference);
  await supabaseRest("chatpesa_activation_payments", { method: "POST", body: { user_id: userId, method: "splashpay", amount: ACTIVATION_FEE, phone: data.phone, external_id: returnedReference, status: "pending", metadata: body } });
  return { ok: true, orderId: returnedReference, message: String(body?.message ?? "Ombi limetumwa. Thibitisha kwenye simu yako;.") };
});

export const checkFimiPayment = createServerFn({ method: "POST" }).validator(z.object({ orderId: z.string().regex(/^INV-[A-Za-z0-9-]{5,180}$/) })).handler(async ({ data }) => {
  const userId = await requireUser();
  const payments = await supabaseRest<Array<Record<string, unknown>>>("chatpesa_activation_payments", { query: { select: "id,status", external_id: `eq.${data.orderId}`, user_id: `eq.${userId}`, limit: 1 } });
  const payment = payments[0];
  if (!payment) throw new Error("Malipo hayajapatikana.");
  if (payment.status === "approved") return { status: "SUCCESS" };
  // Documented SplashPay Payment Status API; polling only, no webhook.
  const res = await fetch(`${API_BASE}/payments/check-status`, {
    method: "POST",
    headers: splashHeaders(),
    body: JSON.stringify({ reference: data.orderId }),
  });
  const body = await res.json().catch(() => null) as Record<string, unknown> | null;
  const nested = nestedData(body);
  if (!res.ok || String(body?.status ?? "").toLowerCase() !== "success" || !nested) {
    throw new Error(String(body?.message ?? `SplashPay status haijapatikana (HTTP ${res.status}).`));
  }
  const status = String(nested?.status ?? nested?.payment_status ?? "pending").toUpperCase();
  if (status === "SUCCESS") {
    await supabaseRest("chatpesa_activation_payments", { method: "PATCH", query: { id: `eq.${String(payment.id)}` }, body: { status: "approved", confirmed_at: new Date().toISOString(), metadata: body } });
    await supabaseRest("chatpesa_users", { method: "PATCH", query: { id: `eq.${userId}` }, body: { status: "active", activated_at: new Date().toISOString() } });
    await supabaseRest("chatpesa_notifications", { method: "POST", body: { user_id: userId, title: "Akaunti imefunguliwa 🎉", message: "Malipo yako yamefanikiwa. Akaunti yako iko active; karibu Dashboard.", type: "success" } });
    return { status: "SUCCESS" };
  }
  if (["FAILED", "CANCELLED", "EXPIRED"].includes(status)) {
    await supabaseRest("chatpesa_activation_payments", { method: "PATCH", query: { id: `eq.${String(payment.id)}` }, body: { status: "rejected", metadata: body } });
    return { status: "FAILED" };
  }
  return { status };
});
