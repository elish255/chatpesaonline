import { useEffect, useRef, useState } from "react";
import { Send, X, ShieldCheck } from "lucide-react";
import { people, topics, type Person } from "@/data/people";
import { ACTIVATION_FEE } from "@/lib/session";
import { HongeraModal } from "@/components/HongeraModal";

type Msg = { from: "them" | "me"; text: string };

export function ChatModal({ person, onClose }: { person: Person; onClose: () => void }) {
  const first = person.name.split(" ")[0];
  const topic =
    topics[people.findIndex((p) => p.name === person.name)] ?? "lugha ya Kiswahili";
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "them",
      text: `Habari 👋 Mimi ni ${person.name}. Napenda sana kujadili ${topic} — unaweza kunifundisha Kiswahili? 🇹🇿`,
    },
  ]);
  const [input, setInput] = useState("");
  const [replies, setReplies] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showHongera, setShowHongera] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, locked]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 200);
    if (!text || locked) return;
    setInput("");
    setMsgs((m) => [...m, { from: "me", text }]);
    const n = replies + 1;
    setReplies(n);

    setTimeout(() => {
      if (n === 1) {
        setMsgs((m) => [
          ...m,
          { from: "them", text: `Asante! 😊 Kuhusu ${topic}, ninasemaje salamu za jioni kwa Kiswahili vizuri?` },
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            from: "them",
            text: `Napenda jinsi unavyofundisha 💙 Ninalipa ${person.price} kwa kila somo.`,
          },
        ]);
        setTimeout(() => setLocked(true), 900);
      }
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-2 sm:items-center sm:p-4">
      <div className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-cta">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <img
            src={person.photo}
            alt={person.name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-success"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-foreground">{person.name}</p>
            <p className="text-xs font-bold tracking-wide text-success">ONLINE</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Funga chat"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "me"
                    ? "gradient-blue text-primary-foreground"
                    : "bg-card text-foreground shadow-card"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}

          {locked && (
            <div className="rounded-2xl bg-card p-5 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-success">
                <ShieldCheck className="h-7 w-7 text-success-foreground" />
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-foreground">
                {first} anakusubiri
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ili uendelee kuchat na <strong className="text-foreground">{first}</strong> na
                ulipwe, jisajili kwanza kwa mtaji wa{" "}
                <strong className="text-foreground">TZS {ACTIVATION_FEE.toLocaleString("en-US")}</strong>.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground">MTAJI</p>
                  <p className="font-bold text-foreground">
                    TZS {ACTIVATION_FEE.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground">
                    MALIPO/CHAT
                  </p>
                  <p className="font-bold text-foreground">{person.price}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHongera(true)}
                className="mt-4 block w-full rounded-full gradient-success py-3 text-center font-bold tracking-wide text-success-foreground shadow-cta"
              >
                JISAJILI SASA
              </button>
              <button onClick={onClose} className="mt-3 text-xs font-bold text-muted-foreground">
                FUNGA
              </button>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={200}
            disabled={locked}
            placeholder={locked ? "Jisajili ili uendelee..." : "Andika ujumbe..."}
            className="min-w-0 flex-1 rounded-full bg-secondary px-4 py-3 text-sm text-foreground outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={locked}
            aria-label="Tuma"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-success text-success-foreground disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
      {showHongera && <HongeraModal person={person} onClose={() => setShowHongera(false)} />}
    </div>
  );
}
