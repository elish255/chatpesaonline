export type Registration = {
  name: string;
  email: string;
  phone: string;
  partner: string;
  price: string;
};

const KEY = "chatpesa_user";
export const ACTIVATION_FEE = 16000;

export function saveRegistration(r: Registration) {
  localStorage.setItem(KEY, JSON.stringify(r));
}

export function loadRegistration(): Registration | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Registration) : null;
  } catch {
    return null;
  }
}
