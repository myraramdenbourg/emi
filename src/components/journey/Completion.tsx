import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { journeyPuzzles } from "@/lib/journeyData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HandCheck } from "./Marks";
import { PRIVACY_READY } from "@/pages/Privacy";

// Public links. Leave REVIEW_URL / PRIVACY_URL empty until a real destination exists;
// empty values hide the related links rather than sending players somewhere generic.
export const PRODUCT_URL = "https://echoesofthemarket.com";
const REVIEW_URL = "";
const SHOW_BEHIND_SCENES = true;
const FEEDBACK_URL = "mailto:hello@echoesofthemarket.com?subject=Echoes%20of%20the%20Market%20feedback";
const FOLLOW_URL = "https://www.instagram.com/origamiescape";

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
  await Promise.all([
    document.fonts.load("500 96px 'EB Garamond'"),
    document.fonts.load("48px 'EB Garamond'"),
    document.fonts.load("600 240px Poppins"),
    document.fonts.load("500 38px Poppins"),
    document.fonts.load("500 78px Caveat"),
  ]).catch(() => {});
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const col = (v: string) => `hsl(${css.getPropertyValue(v).trim()})`;
  const paper = col("--paper"), ink = col("--ink"), rule = col("--rule");
  const track = (v: string) => { try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = v; } catch { /* unsupported */ } };

  g.fillStyle = paper; g.fillRect(0, 0, W, H);
  // speckle texture
  g.fillStyle = rule; g.globalAlpha = 0.05;
  for (let k = 0; k < 1400; k++) g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  g.globalAlpha = 1;
  // full-page double frame
  g.strokeStyle = rule; g.lineWidth = 8; g.strokeRect(52, 52, W - 104, H - 104);
  g.lineWidth = 2; g.strokeRect(78, 78, W - 156, H - 156);

  g.textAlign = "center";
  // masthead
  track("5px");
  g.fillStyle = ink; g.font = "500 96px 'EB Garamond', serif";
  g.fillText("ECHOES OF", W / 2, 240);
  g.fillText("THE MARKET", W / 2, 352);
  track("0px");
  g.font = "48px 'EB Garamond', serif";
  g.fillText("A postcard puzzle adventure", W / 2, 452);
  g.fillStyle = rule; g.fillRect((W - 620) / 2, 516, 620, 5);

  g.fillStyle = ink; g.font = "500 74px Caveat"; g.fillText("We explored all 9 stalls.", W / 2, 656);
  track("16px");
  g.font = "500 38px Poppins"; g.fillText("OUR TIME", W / 2, 772);
  track("0px");
  g.font = "600 240px Poppins";
  const tw = g.measureText(time).width;
  if (tw > 820) g.font = `600 ${Math.floor(240 * 820 / tw)}px Poppins`;
  g.fillText(time, W / 2, 948);

  // 3x3 stall sketch grid
  const imgs = await Promise.all(journeyPuzzles.map((p) => loadImg(p.icon).catch(() => null)));
  const size = 176, gap = 52, cols = 3;
  const startX = (W - (cols * size + (cols - 1) * gap)) / 2;
  imgs.forEach((im, i) => {
    if (!im) return;
    const x = startX + (i % cols) * (size + gap), y = 1016 + Math.floor(i / cols) * (size + 52);
    const r = Math.min(size / im.width, size / im.height);
    g.drawImage(im, x + (size - im.width * r) / 2, y + (size - im.height * r) / 2, im.width * r, im.height * r);
  });

  g.fillStyle = rule; g.font = "500 82px Caveat"; g.fillText("Your turn to explore.", W / 2, 1748);
  g.fillStyle = ink; g.font = "600 42px Poppins"; g.fillText("echoesofthemarket.com", W / 2, 1798);
  g.font = "25px Poppins"; g.fillText("By Origami Escape", W / 2, 1832);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}

const SecondaryCard = ({ lead, title, text, children }: { lead: string; title: string; text: string; children: React.ReactNode }) => (
  <section className="py-5">
    <p className="font-hand text-2xl text-ink/80 text-center mb-3">{lead}</p>
    <div className="bg-paper-deep/60 border-2 border-rule/60 rounded-sm p-5 shadow-paper">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink font-semibold">{title}</h2>
      <p className="text-[16px] text-ink/85 mt-2 leading-relaxed">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  </section>
);

const linkBtn = "inline-flex items-center min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-rule-text font-semibold";

export const Completion = ({ time }: { time: string }) => {
  const [reaction, setReaction] = useState<string | null>(() => { try { return localStorage.getItem(REACTION_KEY); } catch { return null; } });
  const [shareError, setShareError] = useState(false);
  const [card, setCard] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState<null | "new" | "dupe">(() => { try { return localStorage.getItem(SIGNUP_KEY) === "1" ? "new" : null; } catch { return null; } });
  const [signupError, setSignupError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => () => { if (card) URL.revokeObjectURL(card.url); }, [card]);

  const shareText = `I explored all 9 stalls in Echoes of the Market in ${time}. Our journey through the market.`;
  const picked = REACTIONS.find((r) => r.id === reaction);

  const react = (id: string) => {
    setReaction(id);
    try { localStorage.setItem(REACTION_KEY, id); } catch { /* storage unavailable */ }
    trackEvent("journey_reaction", { reaction: id });
  };

  const shareTime = async () => {
    setBusy(true);
    setShareError(false);
    trackEvent("share_time_click");
    let blob: Blob;
    try {
      blob = await makeCard(time);
      setCard({ url: URL.createObjectURL(blob), blob });
    } catch {
      setShareError(true);
      setBusy(false);
      return;
    }
    try {
      const file = new File([blob], "echoes-of-the-market.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: shareText });
    } catch (err) {
      // Cancelling the share sheet is fine; anything else falls back to Save / Copy below.
      if ((err as DOMException)?.name !== "AbortError") toast("Sharing isn't available here — save the card or copy the link instead.");
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
      try { await navigator.share({ text, url: PRODUCT_URL }); return; } catch (err) { if ((err as DOMException)?.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${PRODUCT_URL}`);
      toast.success("Link copied — send it to a friend.");
    } catch { toast.error(`Couldn't copy the link. Share ${PRODUCT_URL} instead.`); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    setSignupError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || v.length > 255) {
      setSignupError("That email doesn't look quite right.");
      return;
    }
    setSending(true);
    // Success is shown only after Shopify confirms the customer + consent.
    const { data, error: fnErr } = await supabase.functions.invoke("shopify-signup", { body: { email: v.toLowerCase() } });
    const ok = ["created", "resubscribed", "duplicate"].includes(data?.status);
    if (!ok) {
      setSending(false);
      if (fnErr) console.error("Newsletter signup failed", fnErr);
      setSignupError("We couldn't add you to the list just now. Please try again in a moment.");
      return;
    }
    // Keep a site-side record too (duplicates are fine to ignore).
    await supabase.from("adventure_signups").insert({ email: v.toLowerCase() });
    setSending(false);
    try { localStorage.setItem(SIGNUP_KEY, "1"); } catch { /* storage unavailable */ }
    setSignedUp(data?.status === "duplicate" ? "dupe" : "new");
    trackEvent("adventure_signup");
  };

  return (
    <div className="relative">
      {/* hand-drawn sprigs growing in at the corners */}

      {/* 1. Result, thank-you, and primary share */}
      <section className="pt-8 pb-6 text-center animate-fade-in">
        <HandCheck className="w-14 h-14 mx-auto" />
        <h1 tabIndex={-1} className="font-display text-3xl font-medium tracking-[0.15em] text-ink mt-4">JOURNEY COMPLETE</h1>
        <p className="font-hand text-3xl text-ink/85 mt-1">You made it through the market.</p>
        <Rule />
        <p className="font-display text-xs uppercase tracking-[0.3em] text-ink/70 mt-4">Your time</p>
        <p className="font-display text-6xl font-medium text-ink tabular-nums mt-1">{time}</p>
        <p className="text-[18px] text-ink mt-4">Thank you for following Emi's story.</p>

        <button
          onClick={shareTime}
          disabled={busy}
          className="w-full min-h-[60px] mt-6 bg-ink text-paper font-display text-base uppercase tracking-[0.2em] rounded-sm shadow-paper disabled:opacity-60"
        >
          {busy ? "Making your card…" : "Share Your Time"}
        </button>
        <p className="text-[15px] text-ink/75 mt-2">A spoiler-free card — no answers or hints.</p>
        {shareError && (
          <div role="alert" className="mt-3 animate-fade-in">
            <p className="text-ink">We couldn't make your card just now.</p>
            <div className="flex justify-center gap-6">
              <button onClick={shareTime} className={linkBtn}>Try Again</button>
              <button onClick={copyLink} className={linkBtn}>Copy Link</button>
            </div>
          </div>
        )}
        {card && (
          <div className="mt-5 animate-fade-in">
            <img src={card.url} alt="Your spoiler-free completion card" className="w-2/3 mx-auto border-2 border-rule/50 shadow-paper" />
            <div className="flex justify-center gap-6 mt-2">
              <a href={card.url} download="echoes-of-the-market.png" className={linkBtn}>Save Share Card</a>
              <button onClick={copyLink} className={linkBtn}>Copy Link</button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Optional reaction — same follow-up for everyone */}
      <section className="py-6 text-center">
        <Rule />
        <p id="reaction-label" className="font-hand text-2xl text-ink mt-4">How was your journey? <span className="font-body text-base text-ink/70">(optional)</span></p>
        <RadioGroup aria-labelledby="reaction-label" value={reaction ?? ""} onValueChange={react} className="grid grid-cols-2 gap-3 mt-3">
          {REACTIONS.map((r) => (
            <div key={r.id} className="relative min-h-[56px]">
              <RadioGroupItem
                value={r.id}
                aria-label={r.label}
                className={`w-full h-full min-h-[56px] aspect-auto rounded-sm border-2 transition-all [&>span]:hidden ${
                  reaction === r.id ? "border-rule bg-rule/15 scale-[1.02]" : "border-rule/40 bg-paper-deep/40"
                }`}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-sm text-ink">
                <span className="text-xl mr-2">{r.emoji}</span>{r.label}
              </span>
            </div>
          ))}
        </RadioGroup>
        {picked && (
          <p className="text-[16px] text-ink/85 mt-3 animate-fade-in" role="status">
            {picked.good ? "We're so glad you enjoyed your time at the market." : "Thanks for playing. We'd love to hear what we could improve."}
          </p>
        )}
        <div className="flex justify-center flex-wrap gap-x-6 mt-2">
          {REVIEW_URL && (
            <a href={REVIEW_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("review_click")} className={linkBtn}>Leave a Review →</a>
          )}
          <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("feedback_click")} className={linkBtn}>Share Feedback →</a>
        </div>
      </section>

      {/* 4–6. Secondary actions */}
      {SHOW_BEHIND_SCENES && <SecondaryCard lead="Want to see how it was made?" title="🎨 Behind the Scenes" text="See how Echoes of the Market went from sketches and puzzle prototypes to the game in your hands.">
        <Link to="/behind-the-scenes" onClick={() => trackEvent("behind_scenes_click")} className={linkBtn}>Take a look →</Link>
      </SecondaryCard>}

      <SecondaryCard lead="The market may have more stories to tell…" title="💌 Get the Next Adventure" text="Be the first to hear about the next Origami Escape experience.">
        {signedUp ? (
          <p role="status" className="font-hand text-2xl text-ink animate-fade-in">{signedUp === "dupe" ? "You're already on the list — see you on the next adventure." : "You're in. See you on the next adventure."}</p>
        ) : (
          <form onSubmit={signUp} className="flex flex-col gap-2" noValidate>
            <label htmlFor="signup-email" className="font-display text-xs uppercase tracking-[0.2em] text-ink">Email address</label>
            <input
              id="signup-email"
              aria-invalid={!!signupError}
              aria-describedby={`signup-note${signupError ? " signup-error" : ""}`}
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-h-[48px] px-3 bg-paper border-b-2 border-rule/60 text-ink text-[17px] outline-none placeholder:text-ink/85 focus:border-rule"
            />
            <button disabled={sending} className="min-h-[48px] border-2 border-ink text-ink font-display text-xs uppercase tracking-[0.2em] rounded-sm disabled:opacity-60">
              {sending ? "Saving…" : "Keep Me in the Loop"}
            </button>
            {signupError && <p id="signup-error" role="alert" className="text-ink text-[15px]">{signupError}</p>}
            <p id="signup-note" className="text-[14px] text-ink/80">
              Occasional updates about new games. Unsubscribe anytime.
              {PRIVACY_READY && <> <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link></>}
            </p>
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
          <a href={REVIEW_URL || FEEDBACK_URL} target="_blank" rel="noreferrer" className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">{REVIEW_URL ? "Leave a Review" : "Share Feedback"}</a>
          <span className="self-center">·</span>
          <a href={FOLLOW_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("instagram_click")} className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Follow Origami Escape</a>
          {SHOW_BEHIND_SCENES && <><span className="self-center">·</span>
          <Link to="/behind-the-scenes" onClick={() => trackEvent("behind_scenes_click", { source: "credits" })} className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Credits</Link></>}
          {PRIVACY_READY && <><span className="self-center">·</span>
          <Link to="/privacy" className="min-h-[44px] inline-flex items-center underline-offset-4 hover:underline">Privacy Policy</Link></>}
        </nav>
      </footer>
    </div>
  );
};
