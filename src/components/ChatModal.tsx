import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X, CheckCircle2 } from "lucide-react";
import type { Person } from "@/data/people";
import { ACTIVATION_FEE } from "@/lib/session";
import { HongeraModal } from "@/components/HongeraModal";
import { completeChat } from "@/lib/app.functions";
import { useServerFn } from "@tanstack/react-start";

type Msg = { from: "them" | "me"; text: string };

type Conversation = {
  opening: string;
  replies: string[];
};

const conversations: Record<string, Conversation> = {
  "Emma Johnson": {
    opening: "Hi! 😊 I'm Emma from London. I'm learning Kiswahili and I really want to practise with someone from Tanzania. How is your day going?",
    replies: [
      "That sounds nice! 😄 What do people normally say when they meet a new friend in Tanzania?",
      "Ah, HABARI! I know that one now. Am I saying it naturally? 😂",
      "ASANTE! I hear that word everywhere. What is another simple word I should learn today?",
      "I like RAFIKI. It feels warm and friendly. Can I use it with someone I just met?",
      "Tell me something about everyday life in Tanzania. What do you enjoy doing after work?",
      "I've heard so much about Dar es Salaam. Is it more relaxed near the coast, or is it always busy?",
      "I would love to try Tanzanian food one day. What should I order first if I visit?",
      "You're a really patient teacher 😄. Please correct my Swahili whenever I make a mistake.",
      "This has been fun! I feel like I'm actually learning instead of just memorising words.",
      "Asante sana, rafiki! 😊 I think my Kiswahili is a little better already."
    ]
  },
  "Lucas Müller": {
    opening: "Hallo! 👋 I'm Lucas from Germany. I work with software, but lately I've become curious about Swahili and Tanzanian culture. What should I learn first?",
    replies: [
      "Good choice! 😄 What does that phrase mean exactly, and when would a Tanzanian normally use it?",
      "Interesting. I like learning the natural way people actually speak, not only textbook Swahili.",
      "Can you give me a casual phrase that friends use with each other?",
      "Haha, POA! I have heard that before. Does it basically mean everything is okay?",
      "I work with computers all day. What kind of work do people your age usually do in Tanzania?",
      "I also enjoy football. Do you follow Simba or Yanga? I keep hearing those names. ⚽",
      "One day I want to visit Tanzania and see more than the tourist places.",
      "Which city would you recommend for someone visiting for the first time?",
      "I appreciate the explanation. You make the language feel much easier.",
      "Asante, rafiki! I will practise these phrases before my next trip. 😊"
    ]
  },
  "Sophie Martin": {
    opening: "Salut! 😊 I'm Sophie from France. I'm interested in journalism and African culture. I'd love to hear how daily conversations sound in Tanzania.",
    replies: [
      "Nice! How would I politely ask someone how their day has been?",
      "HABARI sounds familiar now. Is MAMBO more casual between friends?",
      "I love languages because small words can tell you a lot about a culture.",
      "What is a Swahili word you use almost every day without thinking about it?",
      "That makes sense. Are there expressions that sound funny if a foreigner translates them word for word?",
      "I would love to visit Zanzibar too. What would you tell a first-time visitor not to miss?",
      "And what local food would you recommend? I'm always curious about food when I travel. 😄",
      "Thank you for explaining it so clearly. I am writing these phrases down.",
      "I think learning from a real speaker is much better than only using an app.",
      "Kwaheri? 😄 I think I finally know what that means. Don't worry, I'm still here!"
    ]
  },
  "Daniel Brown": {
    opening: "Hey! 👋 I'm Daniel from Manchester. I run a small business and I'm curious about business life in Tanzania. What is it like where you live?",
    replies: [
      "Interesting. What kind of small businesses are common in your area?",
      "I keep hearing people say ASANTE. Is there a more casual way to say thank you?",
      "What advice would you give someone opening a small shop for the first time?",
      "I like that idea. Do customers usually prefer cash or mobile money?",
      "I've heard M-Pesa is everywhere in Tanzania. Is that true even outside the big cities?",
      "What about young people? Are many of them starting online businesses now?",
      "That sounds like a market I should learn more about. What products sell quickly?",
      "You're explaining this very clearly. I can see why local knowledge matters.",
      "I have learned a lot in just a few minutes. 😄",
      "Asante sana, rafiki. I'll remember these ideas when I visit Tanzania."
    ]
  },
  "Anna Kowalski": {
    opening: "Cześć! 👋 I'm Anna from Poland. I work in dentistry and I'm trying to learn simple Kiswahili for travelling. Will you help me?",
    replies: [
      "Great! What is the nicest way to greet someone in the morning?",
      "ASUBUHI! I like how it sounds. Did I pronounce it correctly? 😊",
      "What do you say when someone is not feeling well?",
      "POLE sounds useful. Is it also something you say to comfort a friend?",
      "I meet people from many countries at work. I enjoy learning small phrases from them.",
      "What should a visitor know about being polite in Tanzania?",
      "I like that. Respect seems very important in everyday conversations.",
      "Can you teach me one phrase I could use with a new Tanzanian friend?",
      "I am writing it down so I don't forget. 😄",
      "Asante! You have been a very good teacher today."
    ]
  },
  "James Wilson": {
    opening: "Hey there! 📷 I'm James from Australia. I'm a photographer and I love travel. What place in Tanzania would you recommend for great photos?",
    replies: [
      "Wow, that sounds beautiful. Is it better for landscapes or people photography?",
      "I love photographing everyday life, not just famous landmarks.",
      "What time of day has the best light where you live?",
      "That makes sense. Do people usually mind if a visitor asks before taking a photo?",
      "I've seen amazing pictures from Zanzibar. The colours look incredible.",
      "What local food should I try while travelling with a camera? 😄",
      "I also want to learn a few Swahili phrases so I can talk to people naturally.",
      "HABARI and ASANTE are already on my list. What comes next?",
      "You're making me want to book the trip right now! 😂",
      "Asante, rafiki. I'll remember your recommendations."
    ]
  },
  "Laura Rossi": {
    opening: "Ciao! 👋 I'm Laura from Italy. I'm a university student and I'm learning about Tanzania. Can you teach me a few everyday Swahili phrases?",
    replies: [
      "Let's start with greetings. What would you say to a friend?",
      "MAMBO! I like that one 😄. Is it okay with people you don't know well?",
      "What about saying I'm fine?",
      "NIKO VIZURI? Nice! I think I'm getting it.",
      "Do university students in Tanzania mix English and Swahili when chatting?",
      "That sounds similar to how young people speak in Italy too.",
      "What music do students listen to? I've heard about Bongo Flava.",
      "Which artist would you put on my playlist first? 🎵",
      "This is much more interesting than a language textbook.",
      "Asante! I'll practise these phrases with my friends. 😊"
    ]
  },
  "Peter Hansen": {
    opening: "Hallo! ✈️ I'm Peter from Denmark. I'm a pilot and I love learning about places I fly near. Tell me something interesting about Tanzania.",
    replies: [
      "That's fascinating. Which part of Tanzania should a first-time visitor see?",
      "I have heard Arusha is a good starting point for safari trips.",
      "What is the best way to greet someone there?",
      "So HABARI is a safe one. Good to know! 😄",
      "I spend a lot of time travelling. What local custom should visitors respect?",
      "I like learning those small details before visiting a country.",
      "And what food should I try after a long day of travelling?",
      "Pilau sounds delicious. Is it spicy?",
      "You have convinced me that I need to visit properly, not just fly over.",
      "Asante sana! I've really enjoyed this conversation."
    ]
  },
  "Chloe Dubois": {
    opening: "Bonjour! 😊 I'm Chloe from France. I work in nutrition and I'm curious about traditional Tanzanian food. What should I learn about first?",
    replies: [
      "Interesting! Which foods are common in a normal Tanzanian home?",
      "I keep hearing about ugali. How do people normally eat it?",
      "And what would you recommend for breakfast?",
      "I like simple food, especially when travelling.",
      "Are there traditional fruits that visitors should try?",
      "That sounds delicious. I would definitely want to visit a local market.",
      "What is one Swahili phrase I should use when buying food?",
      "ASANTE! I know that one now. 😄",
      "Thank you for explaining the culture behind the food too.",
      "Kwaheri for now, rafiki. I hope we can chat again someday!"
    ]
  },
  "Mark Taylor": {
    opening: "Hi! 👋 I'm Mark from the UK. I work in marketing and I'm learning how people communicate in different cultures. What topic do you enjoy talking about?",
    replies: [
      "Let's talk about social media. Which platforms are popular with young people in Tanzania?",
      "Interesting. Do businesses use WhatsApp a lot to talk to customers?",
      "That makes sense. Personal recommendations can be powerful for small businesses.",
      "What kind of online business ideas are popular right now?",
      "I like the idea of combining local knowledge with digital tools.",
      "Do people usually advertise in Swahili, English, or both?",
      "I suppose the audience makes a big difference.",
      "Can you teach me one natural Swahili phrase for saying 'that's a good idea'?",
      "I'm enjoying this. You're giving me a much better picture of everyday communication.",
      "Asante sana! That was a useful conversation. 😊"
    ]
  },
  "Nina Petrova": {
    opening: "Privet! 🎵 I'm Nina from Russia. I'm a music teacher and I love discovering music from other countries. What Tanzanian music should I hear first?",
    replies: [
      "Bongo Flava! I have heard that name before. What makes it special?",
      "Which artist would you recommend for someone completely new to it?",
      "Do people also listen to traditional music at celebrations?",
      "I love music that tells stories about everyday life.",
      "What Swahili words appear often in songs?",
      "ASANTE is easy to remember. 😄",
      "Could you teach me a simple phrase I could say before a song starts?",
      "I am writing this down. Language and music fit together so well.",
      "I think I need a Tanzanian playlist now! 🎶",
      "Asante, rafiki. This was really fun."
    ]
  }
};

function fallbackConversation(person: Person): Conversation {
  const topic = person.job.toLowerCase();
  return {
    opening: `Hi! 😊 I'm ${person.name}. I'm from Europe and I'm interested in Tanzania. I work as ${topic}, and I'd love to practise a little Kiswahili with you. How are you today?`,
    replies: [
      "That sounds interesting! Tell me a little more about life in Tanzania.",
      "Ah, HABARI! I think I'm learning that one correctly. 😊",
      "What other simple Swahili word should I learn next?",
      "I like RAFIKI. It means friend, right?",
      "What place in Tanzania would you recommend to a first-time visitor?",
      "And what food should I try first? 😄",
      "I am still learning, so please correct me if I make a mistake.",
      "This feels much more natural than studying from a book.",
      "Thank you for being patient with me.",
      "Asante sana, rafiki! I've really enjoyed our chat."
    ]
  };
}

export function ChatModal({ person, onClose, authenticated = false }: { person: Person; onClose: () => void; authenticated?: boolean }) {
  const finishChat = useServerFn(completeChat);
  const conversation = useMemo(() => conversations[person.name] ?? fallbackConversation(person), [person.name, person.job]);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "them", text: conversation.opening }]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showHongera, setShowHongera] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const endRef = useRef<HTMLDivElement>(null);
  const payout = Number(person.price.replace(/[^0-9]/g, "")) || 0;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, locked]);

  async function finish() {
    setLocked(true);
    try {
      await finishChat({ data: { sessionId, personName: person.name } });
      setPaid(true);
      setShowReward(true);
    } catch {
      setShowReward(true);
    }
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 300);
    if (!text || locked) return;
    if (!authenticated) { setShowHongera(true); return; }

    setInput("");
    const nextTurn = turn + 1;
    const isLast = nextTurn >= 10;
    setMsgs((current) => [...current, { from: "me", text }]);
    setTurn(nextTurn);

    window.setTimeout(() => {
      const replyIndex = nextTurn >= 10 ? conversation.replies.length - 1 : Math.min(nextTurn - 1, conversation.replies.length - 2);
      const reply = conversation.replies[replyIndex] ?? "Asante sana! 😊";
      setMsgs((current) => [...current, { from: "them", text: isLast ? `${reply} 💙` : reply }]);
      if (isLast) void finish();
    }, 850);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-2 sm:items-center sm:p-4">
      <div className="flex h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-cta">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative shrink-0"><img src={person.photo} alt={person.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-success" /><span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-success" /></div>
          <div className="min-w-0 flex-1"><p className="truncate font-bold text-foreground">{person.name}</p><p className="text-xs font-bold tracking-wide text-success">ONLINE · READY TO CHAT</p></div>
          <button onClick={onClose} aria-label="Funga chat" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "gradient-blue text-primary-foreground" : "bg-card text-foreground shadow-card"}`}>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} disabled={locked} placeholder={locked ? "Chat imekamilika..." : "Andika ujumbe..."} className="min-w-0 flex-1 rounded-full bg-secondary px-4 py-3 text-sm text-foreground outline-none disabled:opacity-60" />
          <button type="submit" disabled={locked} aria-label="Tuma" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-success text-success-foreground disabled:opacity-50"><Send className="h-5 w-5" /></button>
        </form>
      </div>

      {showReward && authenticated && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
        <div className="relative w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-cta">
          <button onClick={() => setShowReward(false)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-secondary" aria-label="Dismiss"><X className="h-4 w-4" /></button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-success"><CheckCircle2 className="h-8 w-8 text-success-foreground" /></div>
          <h2 className="mt-4 text-2xl font-black text-foreground">Umelipwa! 🎉</h2>
          <p className="mt-2 text-sm text-muted-foreground">Umemaliza kuchat na {person.name}.</p>
          <div className="mt-4 rounded-2xl gradient-success p-5 text-success-foreground"><p className="text-xs font-bold tracking-widest">MALIPO YAKO</p><p className="mt-1 text-3xl font-black">TZS {payout.toLocaleString("en-US")}</p></div>
          <p className="mt-4 text-sm font-semibold text-foreground">Pesa yako ipo kwenye Balance.</p>
          {!paid && <p className="mt-1 text-xs text-muted-foreground">Malipo yanathibitishwa kwenye account yako.</p>}
          <button onClick={() => setShowReward(false)} className="mt-5 w-full rounded-full gradient-blue py-3 font-bold text-primary-foreground">SAWA, NIMEONA</button>
        </div>
      </div>}

      {showHongera && <HongeraModal person={person} onClose={() => setShowHongera(false)} />}
    </div>
  );
}
