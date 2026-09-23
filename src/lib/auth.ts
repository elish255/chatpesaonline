import { clearSession, updateSession, useSession } from "@tanstack/react-start/server";

export type SessionData = { userId?: string; role?: "user" | "admin"; expiresAt?: number; adminEntry?: string | null };

function sessionConfig() {
  return {
    password: process.env.SESSION_SECRET ?? "change-this-session-secret-in-vercel",
    name: "chatpesa-session",
    maxAge: 60 * 20,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function readSession() {
  const session = await useSession<SessionData>(sessionConfig());
  const data = session.data;
  if (data.expiresAt && data.expiresAt <= Date.now()) {
    await clearSession(sessionConfig());
    return {} as SessionData;
  }
  return data;
}

export async function setSession(data: SessionData) {
  await updateSession(sessionConfig(), { ...data, expiresAt: Date.now() + 20 * 60 * 1000 });
}

export async function logoutSession() {
  await clearSession(sessionConfig());
}

export async function consumeAdminEntry() {
  const session = await readSession();
  if (!session.userId || session.role !== "admin" || !session.adminEntry) {
    throw new Error("ADMIN_ENTRY_REQUIRED");
  }
  await updateSession(sessionConfig(), {
    ...session,
    adminEntry: null,
  });
  return session.userId;
}

export async function requireUser() {
  const session = await readSession();
  if (!session.userId || session.role !== "user") throw new Error("UNAUTHORIZED");
  return session.userId;
}

export async function requireAdmin() {
  const session = await readSession();
  if (!session.userId || session.role !== "admin") throw new Error("UNAUTHORIZED");
  return session.userId;
}
