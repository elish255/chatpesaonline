export type Registration = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  partner?: string;
  price?: string;
};

export const ACTIVATION_FEE = 16000;

const KEY = "chatpesa_registration";

export function saveRegistration(r: Registration) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(r));
  }
}

export function loadRegistration(): Registration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Registration) : null;
  } catch {
    return null;
  }
}

export function clearRegistration() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
