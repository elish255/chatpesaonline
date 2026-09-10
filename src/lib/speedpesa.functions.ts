import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_BASE = "https://sandbox.speedpesapro.com/api";

function base() {
  return (process.env["SPEEDPESA_BASE_URL"] || DEFAULT_BASE).replace(/\/$/, "");
}

function channelFor(msisdn: string): string {
  const p = msisdn.slice(3, 6);
  if (/^(74|75|76)/.test(p)) return "MPESA";
  if (/^(71|65|67|77)/.test(p)) return "TIGOPESA";
  if (/^(78|68|69)/.test(p)) return "AIRTELMONEY";
  if (/^(62|61)/.test(p)) return "HALOPESA";
  return "MPESA";
}

async function getToken(): Promise<string | null> {
  const api_key = process.env["SPEEDPESA_API_KEY"];
  const api_secret = process.env["SPEEDPESA_API_SECRET"];
  if (!api_key || !api_secret) return null;

  const res = await fetch(`${base()}/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ api_key, api_secret }),
  });
  const body = (await res.json().catch(() => null)) as { access_token?: string } | null;
  return res.ok && body?.access_token ? body.access_token : null;
}

function authHeaders(token: string) {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  const merchant = process.env["SPEEDPESA_MERCHANT_ID"];
  if (merchant) h["X-Merchant-Id"] = merchant;
  return h;
}

const orderSchema = z.object({
  buyer_name: z.string().trim().min(2).max(80),
  buyer_email: z.string().trim().email().max(120),
  buyer_phone: z.string().trim().regex(/^\d{9,15}$/),
  amount: z.number().int().min(500).max(5000000),
});

export const createPaymentOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const token = await getToken();
    if (!token) return { ok: false as const, message: "Malipo hayajawekwa sawa. Jaribu tena baadaye." };

    const reference = `CP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const res = await fetch(`${base()}/v1/collections/ussd-push`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        msisdn: data.buyer_phone,
        amount: data.amount,
        currency: "TZS",
        channel: channelFor(data.buyer_phone),
        reference,
        customer_name: data.buyer_name,
        customer_email: data.buyer_email,
      }),
    });

    const body = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string; reference?: string; transaction_id?: string; status?: string }
      | null;

    if (!res.ok || !body?.success) {
      return {
        ok: false as const,
        message: body?.message ?? "Imeshindikana kutuma ombi la malipo. Jaribu tena.",
      };
    }

    return {
      ok: true as const,
      order_id: body.reference ?? reference,
      reference: body.transaction_id ?? reference,
      message: body.message ?? "Push imetumwa kwenye simu yako.",
    };
  });

export const checkPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ order_id: z.string().trim().min(3).max(80) }).parse(data),
  )
  .handler(async ({ data }) => {
    const token = await getToken();
    if (!token) return { ok: false as const, status: "UNKNOWN" };

    const res = await fetch(`${base()}/v1/orders/${encodeURIComponent(data.order_id)}`, {
      method: "GET",
      headers: authHeaders(token),
    });

    const body = (await res.json().catch(() => null)) as { status?: string } | null;
    return { ok: res.ok, status: body?.status ?? "PENDING" };
  });
