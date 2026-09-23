import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logoutSession, readSession, requireAdmin, requireUser, setSession } from "@/lib/auth";
import { supabaseRest } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/security";
import { ACTIVATION_FEE, LIPA_BUSINESS, LIPA_NUMBER } from "@/lib/session";
import { people } from "@/data/people";

const registrationSchema = z.object({
  name: z.string().trim().min(3).max(80),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(/^\d{9,15}$/),
  password: z.string().min(6).max(100),
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  return digits.length === 9 ? `255${digits}` : digits;
}

export const registerUser = createServerFn({ method: "POST" })
  .validator(registrationSchema)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const username = data.username.toLowerCase();
    const phone = normalizePhone(data.phone);
    const existing = await supabaseRest<Array<Record<string, unknown>>>("app_users", {
      query: { select: "id,username,email,phone", or: `(username.eq.${username},email.eq.${email},phone.eq.${phone})`, limit: 1 },
    });
    if (existing.length) {
      const row = existing[0] ?? {};
      if (String(row.username ?? "").toLowerCase() === username) throw new Error("USERNAME_EXISTS");
      throw new Error("EMAIL_OR_PHONE_EXISTS");
    }

    const { hash, salt } = await hashPassword(data.password);
    const created = await supabaseRest<Array<Record<string, unknown>>>("app_users", {
      method: "POST",
      body: {
        name: data.name,
        username,
        email,
        phone,
        password_hash: hash,
        password_salt: salt,
        status: "pending",
        role: "user",
        balance: 0,
        withdrawn: 0,
      },
    });
    const user = created[0];
    if (!user?.id) throw new Error("REGISTRATION_FAILED");
    await setSession({ userId: String(user.id), role: "user" });
    return { id: String(user.id), status: "pending", activationFee: ACTIVATION_FEE };
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator(z.object({ username: z.string().trim().toLowerCase().min(3).max(30), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const rows = await supabaseRest<Array<Record<string, unknown>>>("app_users", {
      query: { select: "id,password_hash,password_salt,status,role", username: `eq.${data.username.toLowerCase()}`, limit: 1 },
    });
    const user = rows[0];
    if (!user || user.role !== "user" || !(await verifyPassword(data.password, String(user.password_hash), String(user.password_salt)))) {
      throw new Error("INVALID_LOGIN");
    }
    await setSession({ userId: String(user.id), role: "user" });
    return { status: String(user.status) };
  });

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await readSession();
  if (!session.userId || session.role !== "user") return { user: null };
  const rows = await supabaseRest<Array<Record<string, unknown>>>("app_users", {
    query: { select: "id,name,username,email,phone,status,balance,withdrawn,created_at", id: `eq.${session.userId}`, limit: 1 },
  });
  return { user: rows[0] ?? null };
});

export const submitManualPayment = createServerFn({ method: "POST" })
  .validator(z.object({ phone: z.string().regex(/^\d{9,15}$/) }))
  .handler(async ({ data }) => {
    const userId = await requireUser();
    const phone = normalizePhone(data.phone);
    await supabaseRest("activation_payments", {
      method: "POST",
      body: {
        user_id: userId,
        method: "lipa_namba",
        amount: ACTIVATION_FEE,
        phone,
        external_id: LIPA_NUMBER,
        status: "pending",
        metadata: { business: LIPA_BUSINESS, lipa_number: LIPA_NUMBER },
      },
    });
    await supabaseRest("notifications", {
      method: "POST",
      body: { user_id: userId, title: "Malipo yametumwa kwa ukaguzi", message: "Tumepokea taarifa yako ya Lipa Namba. Admin atakagua muamala kabla ya ku-activate akaunti.", type: "info" },
    });
    return { ok: true };
  });

export const getNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUser();
  const rows = await supabaseRest<Array<Record<string, unknown>>>("notifications", {
    query: { select: "id,title,message,type,created_at", or: `(user_id.is.null,user_id.eq.${userId})`, order: "created_at.desc", limit: 20 },
  });
  const dismissals = await supabaseRest<Array<Record<string, unknown>>>("notification_dismissals", {
    query: { select: "notification_id", user_id: `eq.${userId}`, limit: 100 },
  });
  const hidden = new Set(dismissals.map((x) => String(x.notification_id)));
  return { notifications: rows.filter((x) => !hidden.has(String(x.id))) };
});

export const dismissNotification = createServerFn({ method: "POST" })
  .validator(z.object({ notificationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUser();
    await supabaseRest("notification_dismissals", {
      method: "POST",
      body: { notification_id: data.notificationId, user_id: userId },
      prefer: "resolution=ignore-duplicates,return=minimal",
    });
    return { ok: true };
  });


export const completeChat = createServerFn({ method: "POST" })
  .validator(z.object({ sessionId: z.string().uuid(), personName: z.string().min(2).max(100) }))
  .handler(async ({ data }) => {
    const userId = await requireUser();
    const person = people.find((item) => item.name === data.personName);
    const payout = person ? Number(person.price.replace(/[^0-9]/g, "")) : 0;
    if (!person || payout <= 0) throw new Error("CHAT_PERSON_NOT_FOUND");
    const users = await supabaseRest<Array<Record<string, unknown>>>("app_users", { query: { select: "status", id: `eq.${userId}`, limit: 1 } });
    if (users[0]?.status !== "active") throw new Error("ACCOUNT_NOT_ACTIVE");
    const existing = await supabaseRest<Array<Record<string, unknown>>>("chat_sessions", { query: { select: "id", session_id: `eq.${data.sessionId}`, limit: 1 } });
    if (existing.length) return { ok: true, alreadyCompleted: true };
    await supabaseRest("chat_sessions", { method: "POST", body: { session_id: data.sessionId, user_id: userId, person_name: data.personName, payout, status: "completed", completed_at: new Date().toISOString() } });
    const current = await supabaseRest<Array<Record<string, unknown>>>("app_users", { query: { select: "balance", id: `eq.${userId}`, limit: 1 } });
    const balance = Number(current[0]?.balance ?? 0);
    await supabaseRest("app_users", { method: "PATCH", query: { id: `eq.${userId}` }, body: { balance: balance + payout } });
    await supabaseRest("notifications", { method: "POST", body: { user_id: userId, title: "Umejipatia malipo 💰", message: `Chat na ${data.personName} imekamilika. TZS ${payout.toLocaleString()} imeongezwa kwenye salio lako.`, type: "success" } });
    return { ok: true, alreadyCompleted: false, balance: balance + payout };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .validator(z.object({ amount: z.number().int().min(100000), method: z.string().min(2), accountNumber: z.string().min(5).max(30) }))
  .handler(async ({ data }) => {
    const userId = await requireUser();
    const rows = await supabaseRest<Array<Record<string, unknown>>>("app_users", {
      query: { select: "balance,status", id: `eq.${userId}`, limit: 1 },
    });
    const user = rows[0];
    const balance = Number(user?.balance ?? 0);
    if (user?.status !== "active") throw new Error("ACCOUNT_NOT_ACTIVE");
    if (data.amount > balance) throw new Error("INSUFFICIENT_BALANCE");
    await supabaseRest("withdrawals", {
      method: "POST",
      body: { user_id: userId, amount: data.amount, method: data.method, account_number: data.accountNumber, status: "pending" },
    });
    await supabaseRest("notifications", {
      method: "POST",
      body: { user_id: userId, title: "Withdrawal imeombwa", message: `Ombi la withdrawal la TZS ${data.amount.toLocaleString()} limetumwa kwa admin kwa ukaguzi.`, type: "info" },
    });
    return { ok: true };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await logoutSession();
  return { ok: true };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword || data.email.toLowerCase() !== adminEmail || data.password !== adminPassword) {
      throw new Error("INVALID_ADMIN_LOGIN");
    }
    await setSession({ userId: "admin", role: "admin" });
    return { ok: true };
  });

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const [users, payments, withdrawals, notifications] = await Promise.all([
    supabaseRest<Array<Record<string, unknown>>>("app_users", { query: { select: "id,name,username,email,phone,status,balance,withdrawn,created_at", order: "created_at.desc", limit: 200 } }),
    supabaseRest<Array<Record<string, unknown>>>("activation_payments", { query: { select: "id,user_id,method,amount,phone,status,created_at,external_id", order: "created_at.desc", limit: 200 } }),
    supabaseRest<Array<Record<string, unknown>>>("withdrawals", { query: { select: "id,user_id,amount,method,account_number,status,created_at", order: "created_at.desc", limit: 200 } }),
    supabaseRest<Array<Record<string, unknown>>>("notifications", { query: { select: "id,user_id,title,message,type,created_at", order: "created_at.desc", limit: 50 } }),
  ]);
  return { users, payments, withdrawals, notifications };
});

export const adminReviewPayment = createServerFn({ method: "POST" })
  .validator(z.object({ paymentId: z.string().uuid(), action: z.enum(["approve", "reject"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const payments = await supabaseRest<Array<Record<string, unknown>>>("activation_payments", {
      query: { select: "id,user_id,status,amount", id: `eq.${data.paymentId}`, limit: 1 },
    });
    const payment = payments[0];
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    const status = data.action === "approve" ? "approved" : "rejected";
    await supabaseRest("activation_payments", { method: "PATCH", query: { id: `eq.${data.paymentId}` }, body: { status, reviewed_at: new Date().toISOString() } });
    const userId = String(payment.user_id);
    if (data.action === "approve") {
      await supabaseRest("app_users", { method: "PATCH", query: { id: `eq.${userId}` }, body: { status: "active", activated_at: new Date().toISOString() } });
      await supabaseRest("notifications", { method: "POST", body: { user_id: userId, title: "Akaunti ime-activate 🎉", message: "Malipo yako yamehakikiwa. Ingia dashboard kuanza kuchat.", type: "success" } });
    } else {
      await supabaseRest("notifications", { method: "POST", body: { user_id: userId, title: "Malipo yamekataliwa", message: "Admin hakuthibitisha malipo yako. Tafadhali wasiliana na support na uthibitishe taarifa za muamala.", type: "error" } });
    }
    return { ok: true };
  });

export const adminReviewWithdrawal = createServerFn({ method: "POST" })
  .validator(z.object({ withdrawalId: z.string().uuid(), action: z.enum(["approve", "reject"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const rows = await supabaseRest<Array<Record<string, unknown>>>("withdrawals", { query: { select: "id,user_id,amount,status", id: `eq.${data.withdrawalId}`, limit: 1 } });
    const item = rows[0];
    if (!item) throw new Error("WITHDRAWAL_NOT_FOUND");
    if (item.status !== "pending") return { ok: true };
    const userId = String(item.user_id);
    const amount = Number(item.amount);
    if (data.action === "approve") {
      const users = await supabaseRest<Array<Record<string, unknown>>>("app_users", { query: { select: "balance,withdrawn", id: `eq.${userId}`, limit: 1 } });
      const balance = Number(users[0]?.balance ?? 0);
      if (balance < amount) throw new Error("INSUFFICIENT_BALANCE");
      await supabaseRest("app_users", { method: "PATCH", query: { id: `eq.${userId}` }, body: { balance: balance - amount, withdrawn: Number(users[0]?.withdrawn ?? 0) + amount } });
      await supabaseRest("withdrawals", { method: "PATCH", query: { id: `eq.${data.withdrawalId}` }, body: { status: "approved", reviewed_at: new Date().toISOString() } });
      await supabaseRest("notifications", { method: "POST", body: { user_id: userId, title: "Withdrawal imeidhinishwa", message: `Withdrawal ya TZS ${amount.toLocaleString()} imeidhinishwa na admin.`, type: "success" } });
    } else {
      await supabaseRest("withdrawals", { method: "PATCH", query: { id: `eq.${data.withdrawalId}` }, body: { status: "rejected", reviewed_at: new Date().toISOString() } });
      await supabaseRest("notifications", { method: "POST", body: { user_id: userId, title: "Withdrawal imekataliwa", message: "Admin amekataa ombi lako la withdrawal. Wasiliana na support kwa maelezo zaidi.", type: "error" } });
    }
    return { ok: true };
  });

export const adminSendNotification = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid().nullable(), title: z.string().trim().min(2).max(120), message: z.string().trim().min(2).max(1000), type: z.enum(["info", "success", "warning", "error"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await supabaseRest("notifications", { method: "POST", body: { user_id: data.userId, title: data.title, message: data.message, type: data.type } });
    return { ok: true };
  });
