import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { journeyPuzzles } from "@/lib/journeyData";
import { HandCheck, Sprig } from "./Marks";

// Public links — replace with the real destinations when ready.
export const PRODUCT_URL = "https://echoesofthemarket.com";
const REVIEW_URL = "https://echoesofthemarket.com";
const FEEDBACK_URL = "mailto:hello@echoesofthemarket.com?subject=Echoes%20of%20the%20Market%20feedback";
const FOLLOW_URL = "https://www.instagram.com/";

const REACTIONS = [
  { id: "loved", emoji: "😍", label: "Loved it", good: true },
  { id: "liked", emoji: "🙂", label: "Liked it", good: true },
  { id: "okay", emoji: "😐", label: "It was okay", good: false },
  { id: "not", emoji: "🙁", label: "Not for me", good: false },
];
const REACTION_KEY = "eotm_reaction_v1";
const SIGNUP_KEY = "eotm_signed_up_v1";

const Rule = () => <div className="border-t-2 border-rule/70 my-2" />;

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

// Spoiler-free 1080x1920 share card. Only title, time, and icons — no answers.
async function makeCard(time: string): Promise<Blob> {
  await document.fonts.ready;
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const col = (v: string) => `hsl(${css.getPropertyValue(v).trim()})`;
  const paper = col("--paper"), ink = col("--ink"), rule = col("--rule");

  g.fillStyle = paper; g.fillRect(0, 0, W, H);
  // speckle texture
  g.fillStyle = rule; g.globalAlpha = 0.05;
  for (let k = 0; k < 1400; k++) g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  g.globalAlpha = 1;
  // border (inside IG safe area)
  g.strokeStyle = rule; g.lineWidth = 6; g.strokeRect(70, 260, W - 140, H - 520);
  g.lineWidth = 2; g.strokeRect(88, 278, W - 176, H - 556);

  g.textAlign = "center"; g.fillStyle = ink;
  g.font = "500 58px Poppins"; g.fillText("ECHOES OF THE MARKET", W / 2, 440);
  g.fillStyle = rule; g.fillRect(260, 480, W - 520, 4);
  g.fillStyle = ink; g.font = "68px Caveat"; g.fillText("I found all 9 memories.", W / 2, 620);
  g.font = "500 190px Poppins"; g.fillText(time, W / 2, 880);

  const imgs = await Promise.all(journeyPuzzles.map((p) => loadImg(p.icon).catch(() => null)));
  const size = 170, gap = 50, cols = 3;
  const startX = (W - (cols * size + (cols - 1) * gap)) / 2;
  imgs.forEach((im, i) => {
    if (!im) return;
    const x = startX + (i % cols) * (size + gap), y = 990 + Math.floor(i / cols) * (size + 30);
    const r = Math.min(size / im.width, size / im.height);
    g.drawImage(im, x + (size - im.width * r) / 2, y + (size - im.height * r) / 2, im.width * r, im.height * r);
  });

  g.fillStyle = rule; g.font = "74px Caveat"; g.fillText("Can you beat my time?", W / 2, 1640);
  g.fillStyle = ink; g.font = "36px Poppins"; g.fillText("echoesofthemarket.com", W / 2, 1720);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}

const SecondaryCard = ({ lead, title, text, children }: { lead: string; title: string; text: string; children: React.ReactNode }) => (
  <section className="py-8">
    <p className="font-hand text-2xl text-ink/80 text-center mb-3">{lead}</p>
    <div className="bg-paper-deep/60 border-2 border-rule/60 rounded-sm p-5 shadow-paper">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-ink font-semibold">{title}</h3>
      <p className="text-[16px] text-ink/85 mt-2 leading-relaxed">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  </section>
);

const linkBtn = "inline-flex items-center min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-rule-text font-semibold";

export const Completion = ({ time }: { time: string }) => {
  const [reaction, setReaction] = useState<string | null>(() => localStorage.getItem(REACTION_KEY));
  const [card, setCard] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(() => localStorage.getItem(SIGNUP_KEY) === "1");
  const [sending, setSending] = useState(false);

  useEffect(() => () => { if (card) URL.revokeObjectURL(card.url); }, [card]);

  const shareText = `I found all 9 memories in Echoes of the Market in ${time}. Can you beat my time?`;
  const picked = REACTIONS.find((r) => r.id === reaction);

  const react = (id: string) => {
    setReaction(id);
    localStorage.setItem(REACTION_KEY, id);
    trackEvent("journey_reaction", { reaction: id });
  };

  const shareTime = async () => {
    setBusy(true);
    trackEvent("share_time_click");
    try {
      const blob = await makeCard(time);
      const file = new File([blob], "echoes-of-the-market.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], text: shareText }); } catch { /* cancelled */ }
      }
      setCard({ url: URL.createObjectURL(blob), blob });
    } catch {
      toast.error("Couldn't create your card. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${PRODUCT_URL}`);
      toast.success("Copied — paste it anywhere.");
    } catch { toast.error("Couldn't copy the link."); }
  };

  const shareGame = async () => {
    trackEvent("share_game_click");
    const text = "I just finished Echoes of the Market and thought you'd love it.";
    if (navigator.share) {
      try { await navigator.share({ text, url: PRODUCT_URL }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text} ${PRODUCT_URL}`).catch(() => {});
      toast.success("Link copied — send it to a friend.");
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || v.length > 255) {
      toast.error("That email doesn't look quite right.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("adventure_signups").insert({ email: v, reaction });
    setSending(false);
    if (error) { toast.error("Something went wrong. Please try again."); return; }
    localStorage.setItem(SIGNUP_KEY, "1");
    setSignedUp(true);
    trackEvent("adventure_signup");
  };

  return (
    <div className="relative">
      {/* hand-drawn sprigs growing in at the corners */}
      <Sprig className="absolute -left-2 top-4 w-14 opacity-0 animate-[fade-in_1.6s_ease-out_0.6s_forwards] -rotate-12" />
      <Sprig className="absolute -right-2 top-40 w-14 opacity-0 animate-[fade-in_1.6s_ease-out_1.2s_forwards] rotate-[160deg]" />

      {/* 1. Completion moment — the first viewport */}
      <section className="min-h-[82svh] flex flex-col justify-center text-center animate-fade-in">
        <HandCheck className="w-14 h-14 mx-auto" />
        <h1 className="font-display text-3xl font-medium tracking-[0.15em] text-ink mt-5">JOURNEY COMPLETE</h1>
        <p className="font-hand text-3xl text-ink/85 mt-1">You made it through the market.</p>
        <Rule />
        <p className="font-display text-xs uppercase tracking-[0.3em] text-ink/70 mt-6">Your time</p>
        <p className="font-display text-6xl font-medium text-ink tabular-nums mt-1">{time}</p>
        <p className="text-[17px] text-ink mt-5">Thank you for following Emi's story.</p>

        {/* 2. Quick reaction */}
        <div className="mt-10">
          <p className="font-hand text-2xl text-ink">How was your journey?</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {REACTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => react(r.id)}
                aria-pressed={reaction === r.id}
                className={`min-h-[56px] rounded-sm border-2 font-display text-sm text-ink transition-all ${
                  reaction === r.id ? "border-rule bg-rule/15 scale-[1.02]" : "border-rule/40 bg-paper-deep/40"
                }`}
              >
                <span className="text-xl mr-2">{r.emoji}</span>{r.label}
              </button>
            ))}
          </div>
          {picked && (
            <div className="mt-4 animate-fade-in">
              <p className="text-[16px] text-ink/85">
                {picked.good ? "We're so glad you enjoyed your time at the market." : "Thanks for playing. We'd love to hear what we could improve."}
              </p>
              <a
                href={picked.good ? REVIEW_URL : FEEDBACK_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent(picked.good ? "review_click" : "feedback_click")}
                className={linkBtn}
              >
                {picked.good ? "Leave a Review →" : "Share Feedback →"}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 3. Primary CTA */}
      <section className="py-10 text-center">
        <Rule />
        <p className="font-hand text-2xl text-ink/80 mt-6">Share your journey</p>
        <button
          onClick={shareTime}
          disabled={busy}
          className="w-full min-h-[60px] mt-3 bg-ink text-paper font-display text-base uppercase tracking-[0.2em] rounded-sm shadow-paper disabled:opacity-60"
        >
          {busy ? "Making your card…" : "Share Your Time"}
        </button>
        <p className="text-[15px] text-ink/75 mt-3">Made it through the market? Share your journey — without spoiling the puzzles.</p>
        {card && (
          <div className="mt-6 animate-fade-in">
            <img src={card.url} alt="Your spoiler-free completion card" className="w-2/3 mx-auto border-2 border-rule/50 shadow-paper" />
            <div className="flex justify-center gap-6 mt-3">
              <a href={card.url} download="echoes-of-the-market.png" className={linkBtn}>Save Share Card</a>
              <button onClick={copyLink} className={linkBtn}>Copy Link</button>
            </div>
          </div>
        )}
      </section>

      {/* 4–6. Secondary actions */}
      <SecondaryCard lead="Want to see how it was made?" title="🎨 Behind the Scenes" text="See how Echoes of the Market went from sketches and puzzle prototypes to the game in your hands.">
        <Link to="/behind-the-scenes" onClick={() => trackEvent("behind_scenes_click")} className={linkBtn}>Take a look →</Link>
      </SecondaryCard>

      <SecondaryCard lead="The market may have more stories to tell…" title="💌 Get the Next Adventure" text="Be the first to hear about the next Origami Escape experience.">
        {signedUp ? (
          <p className="font-hand text-2xl text-ink animate-fade-in">You're in. See you on the next adventure.</p>
        ) : (
          <form onSubmit={signUp} className="flex flex-col gap-2">
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="min-h-[48px] px-3 bg-paper border-b-2 border-rule/60 text-ink text-[17px] outline-none placeholder:text-ink/85 focus:border-rule"
            />
            <button disabled={sending} className="min-h-[48px] border-2 border-ink text-ink font-display text-xs uppercase tracking-[0.2em] rounded-sm disabled:opacity-60">
              {sending ? "Sending…" : "Keep Me in the Loop"}
            </button>
          </form>
        )}
      </SecondaryCard>

      <SecondaryCard lead="Know another puzzle lover?" title="🎁 Share Echoes with a Friend" text="Know someone who would love exploring the market?">
        <button onClick={shareGame} className={linkBtn}>Share the Game →</button>
      </SecondaryCard>

      {/* Tertiary footer */}
      <footer className="pt-6 pb-10 text-center">
        <Rule />
        <nav className="flex justify-center flex-wrap gap-x-3 mt-4 text-sm text-ink/70 font-display">
          <a href={REVIEW_URL} target="_blank" rel="noreferrer" className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Leave a Review</a>
          <span className="self-center">·</span>
          <a href={FOLLOW_URL} target="_blank" rel="noreferrer" className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Follow Origami Escape</a>
          <span className="self-center">·</span>
          <Link to="/behind-the-scenes#credits" className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Credits</Link>
        </nav>
      </footer>
    </div>
  );
};
