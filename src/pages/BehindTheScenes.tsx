import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Sprig } from "@/components/journey/Marks";

// Real photos, captions, and credits go here once supplied. Until then the page stays
// minimal (no placeholders) and is kept out of search results.
const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.head.querySelector(selector);
  const prev = el?.getAttribute(attr) ?? null;
  el?.setAttribute(attr, value);
  return () => { if (el && prev !== null) el.setAttribute(attr, prev); };
};

const BehindTheScenes = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Behind the Scenes — Echoes of the Market";
    const undo = [
      setMeta('meta[name="description"]', "content", "How Echoes of the Market was made."),
      setMeta('link[rel="canonical"]', "href", "https://guide.echoesofthemarket.com/behind-the-scenes"),
    ];
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => { document.title = prevTitle; undo.forEach((u) => u()); robots.remove(); };
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-[520px] mx-auto px-5 py-6">
        <Link to="/" className="flex items-center gap-1 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="border-t-2 border-rule/70" />
        <header className="text-center py-10">
          <Sprig className="w-14 mx-auto" />
          <h1 className="font-display text-3xl font-medium tracking-[0.12em] text-ink mt-3">BEHIND THE SCENES</h1>
          <p className="font-hand text-2xl text-ink/80 mt-2">This page is still being written.</p>
        </header>
      </div>
    </main>
  );
};

export default BehindTheScenes;
