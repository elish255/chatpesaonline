import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.mobilipa.store";

const orderSchema = z.object({
  buyer_name: z.string().trim().min(2).max(80),
  buyer_email: z.string().trim().email().max(120),
  buyer_phone: z.string().trim().regex(/^\d{9,15}$/),
  amount: z.number().int().min(500).max(5000000),
});

export const createPaymentOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["MOBILIPA_API_KEY"];
    if (!key) return { ok: false as const, message: "Malipo hayajawekwa sawa." };

    const res = await fetch(`${BASE}/v1/payment/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": key,
      },
      body: JSON.stringify({ ...data, currency: "TZS" }),
    });

    const body = (await res.json().catch(() => null)) as
      | { status?: string; message?: string; data?: { order_id?: string; reference?: string } }
      | null;

    if (!res.ok || !body || body.status !== "success") {
      return {
        ok: false as const,
        message: body?.message ?? "Imeshindikana kutuma ombi la malipo. Jaribu tena.",
      };
    }

    return {
      ok: true as const,
      order_id: body.data?.order_id ?? "",
      reference: body.data?.reference ?? "",
      message: body.message ?? "Push imetumwa kwenye simu yako.",
    };
  });

export const checkPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ order_id: z.string().trim().min(3).max(80) }).parse(data),
  )
  .handler(async ({ data }) => {
    const key = process.env["MOBILIPA_API_KEY"];
    if (!key) return { ok: false as const, status: "UNKNOWN" };

    const res = await fetch(`${BASE}/v1/payment/check_status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": key,
      },
      body: JSON.stringify({ order_id: data.order_id }),
    });

    const body = (await res.json().catch(() => null)) as
      | { data?: { payment_status?: string; status?: string } }
      | null;

    const status = body?.data?.payment_status ?? body?.data?.status ?? "PENDING";
    return { ok: res.ok, status };
  });
