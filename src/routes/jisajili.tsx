import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import { ACTIVATION_FEE, saveRegistration } from "@/lib/session";

const searchSchema = z.object({
  partner: z.string().optional(),
  price: z.string().optional(),
});

export const Route = createFileRoute("/jisajili")({
  validateSearch: searchSchema,
  component: Jisajili,
  head: () => ({
    meta: [
      { title: "Jisajili — Chatpesa" },
      {
        name: "description",
        content:
          "Jaza fomu ya usajili wa Chatpesa kisha lipia ada ya uwezeshaji TZS 16,000 ili kuanza kuchat na kulipwa.",
      },
      { property: "og:title", content: "Jisajili — Chatpesa" },
      {
        property: "og:description",
        content: "Fungua akaunti yako ya Chatpesa na uanze kufundisha Kiswahili kwa malipo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
});

const formSchema = z.object({
  name: z.string().trim().min(3, "Andika jina kamili").max(80),
  email: z.string().trim().email("Barua pepe si sahihi").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(0|255)\d{9}$/, "Namba ya simu iwe kama 0712345678 au 255712345678"),
});

function Jisajili() {
  const { partner, price } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Jaza taarifa zote");
      return;
    }
    saveRegistration({
      ...parsed.data,
      partner: partner ?? "",
      price: price ?? "",
    });
    navigate({ to: "/lipa" });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Rudi mwanzo
        </Link>

        <div className="mt-4 rounded-3xl bg-card p-6 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-blue">
            <UserPlus className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-center text-2xl font-extrabold text-foreground">
            Fungua Akaunti Yako
          </h1>
          {partner && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Unajisajili ili kuchat na <strong className="text-foreground">{partner}</strong>
              {price ? ` (malipo ${price} kwa somo)` : ""}.
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Jina Kamili</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={80}
                placeholder="Juma Hassan"
                className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Barua Pepe</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={120}
                placeholder="juma@gmail.com"
                className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Namba ya Simu</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={15}
                placeholder="0712345678"
                className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none"
              />
            </div>

            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full gradient-success py-3.5 font-bold text-success-foreground shadow-cta"
            >
              ENDELEA
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Baada ya usajili utalipia ada ya uwezeshaji TZS{" "}
              {ACTIVATION_FEE.toLocaleString("en-US")}.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
