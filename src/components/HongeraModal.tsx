import { GraduationCap, LogIn, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Person } from "@/data/people";
import { ACTIVATION_FEE } from "@/lib/session";

export function HongeraModal({ person, onClose }: { person: Person; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-success/30 bg-[#07240f] p-6 text-center shadow-cta sm:p-8">
        <button
          onClick={onClose}
          aria-label="Funga"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-success/40 text-success"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-success shadow-cta">
          <GraduationCap className="h-8 w-8 text-success-foreground" />
        </div>

        <h2 className="mt-4 text-2xl font-extrabold text-white">
          Hongera kwa kuchagua fursa hii!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Ili uweze kukamilisha usajili na kuanza kufundisha wazungu lugha ya Kiswahili huku
          uklipwa, unahitaji kuwa na mtaji wa kuanzia wa:
        </p>

        <div className="mt-5 rounded-2xl gradient-success p-5 shadow-cta">
          <p className="text-xs font-bold tracking-[0.2em] text-success-foreground/90">
            MTAJI WA KUANZIA
          </p>
          <p className="mt-1 text-3xl font-extrabold text-success-foreground">
            TSh {ACTIVATION_FEE.toLocaleString("en-US")}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-white/60">
          Tafadhali hakikisha una kiasi hiki tayari ili uweze kuendelea na hatua zinazofuata za
          usajili bila usumbufu.
        </p>

        <Link
          to="/jisajili"
          search={{ partner: person.name, price: person.price }}
          className="mt-5 flex items-center justify-center gap-2 rounded-full gradient-success py-3.5 font-bold tracking-wide text-success-foreground shadow-cta"
        >
          <LogIn className="h-5 w-5" /> JISAJILI SASA
        </Link>
        <button
          onClick={onClose}
          className="mt-3 text-xs font-bold tracking-widest text-white/60"
        >
          FUNGA
        </button>
      </div>
    </div>
  );
}
