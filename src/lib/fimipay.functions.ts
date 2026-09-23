import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseRest } from "@/lib/db";
import { ACTIVATION_FEE } from "@/lib/session";

const paymentInput = z.object({ phone: z.string().regex(/^255\d{9}$/) });

const CREATE_URL = "https://fimipay.com/api/v1/payment/create_order";
const STATUS_URL = "https://fimipay.com/api/v1/payment/order_status";

function fimipayHeaders() {
  const key = process.env.FIMIPAY_API_KEY;
  if (!key) throw new Error("FIMIPAY_API_KEY haijawekwa Vercel Environment Variables.");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Chatpesa.online/1.0",
    Authorization: `Bearer ${key}`,
  };
}

function nestedData(body: Record<string, unknown> | null) {
  return body?.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : null;
}

export const createFimiPayment = createServerFn({ method: "POST" })
  .validator(paymentInput)
  .handler(async ({ data }) => {
    const userId = await requireUser();
    const users = await supabaseRest<Array<Record<string, unknown>>>("chatpesa_users", {
      query: { select: "id,name,username,email,phone,status", id: `eq.${userId}`, limit: 1 },
    });
    const user = users[0];
    if (!user) throw new Error("Akaunti haijapatikana.");
    if (user.status === "active") return { ok: true, orderId: "already-active", message: "Akaunti yako tayari iko active." };

    const res = await fetch(CREATE_URL, {
      method: "POST",
      headers: fimipayHeaders(),
      body: JSON.stringify({
        buyer_email: user.email,
        buyer_name: user.name,
        buyer_phone: data.phone,
        amount: ACTIVATION_FEE,
        currency: "TZS",
        payment_method: "mobile",
      }),
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const nested = nestedData(body);
    if (!res.ok || String(body?.status ?? "").toLowerCase() !== "success") {
      throw new Error(String(body?.message ?? "FimiPay imeshindwa kuanzisha malipo."));
    }

    const orderId = String(nested?.order_id ?? body?.order_id ?? "");
    if (!orderId) throw new Error("FimiPay haikurudisha order_id.");

    await supabaseRest("chatpesa_activation_payments", {
      method: "POST",
      body: {
        user_id: userId,
        method: "fimipay",
        amount: ACTIVATION_FEE,
        phone: data.phone,
        external_id: orderId,
        status: "pending",
        metadata: body,
      },
    });

    return {
      ok: true,
      orderId,
      message: String(body?.message ?? "Payment request initiated. Thibitisha malipo kwenye simu yako."),
    };
  });

export const checkFimiPayment = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.string().min(2).max(200) }))
  .handler(async ({ data }) => {
    const userId = await requireUser();
    const payments = await supabaseRest<Array<Record<string, unknown>>>("chatpesa_activation_payments", {
      query: { select: "id,status", external_id: `eq.${data.orderId}`, user_id: `eq.${userId}`, limit: 1 },
    });
    const payment = payments[0];
    if (!payment) throw new Error("Malipo hayajapatikana.");
    if (payment.status === "approved") return { status: "SUCCESS" };

    const res = await fetch(STATUS_URL, {
      method: "POST",
      headers: fimipayHeaders(),
      body: JSON.stringify({ order_id: data.orderId }),
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) throw new Error(String(body?.message ?? "FimiPay order status haijapatikana."));

    const nested = nestedData(body);
    const status = String(nested?.payment_status ?? nested?.status ?? body?.payment_status ?? body?.status ?? "PENDING").toUpperCase();

    if (status === "SUCCESS") {
      await supabaseRest("chatpesa_activation_payments", {
        method: "PATCH",
        query: { id: `eq.${String(payment.id)}` },
        body: { status: "approved", confirmed_at: new Date().toISOString(), metadata: body },
      });
      await supabaseRest("chatpesa_users", {
        method: "PATCH",
        query: { id: `eq.${userId}` },
        body: { status: "active", activated_at: new Date().toISOString() },
      });
      await supabaseRest("chatpesa_notifications", {
        method: "POST",
        body: { user_id: userId, title: "Akaunti imefunguliwa 🎉", message: "Malipo yako ya FimiPay yamefanikiwa. Akaunti yako iko active; karibu Dashboard.", type: "success" },
      });
      return { status: "SUCCESS" };
    }

    if (["CANCELLED", "USERCANCELLED", "REJECTED"].includes(status)) {
      await supabaseRest("chatpesa_activation_payments", {
        method: "PATCH",
        query: { id: `eq.${String(payment.id)}` },
        body: { status: "rejected", metadata: body },
      });
      return { status: "FAILED" };
    }

    return { status };
  });
