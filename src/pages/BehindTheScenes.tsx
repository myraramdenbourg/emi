import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Sprig } from "@/components/journey/Marks";

const SECTIONS = [
  { id: "idea", title: "The First Idea", text: "How Echoes of the Market began." },
  { id: "puzzles", title: "Designing the Puzzles", text: "Early puzzle concepts, prototypes, and iterations." },
  { id: "art", title: "Bringing the Market to Life", text: "Concept sketches, illustration development, and artwork." },
  { id: "playtest", title: "Playtesting", text: "Photos and stories from testing and iteration." },
  { id: "physical", title: "Making the Physical Game", text: "Production samples, packaging iterations, printing, and manufacturing." },
  { id: "credits", title: "The People Behind Echoes", text: "Credits and short creator/artist information." },
];

const BehindTheScenes = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = "Behind the Scenes — Echoes of the Market";
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-[520px] mx-auto px-5 py-6">
        <Link to="/" className="flex items-center gap-1 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="border-t-2 border-rule/70" />
        <header className="text-center py-8">
          <Sprig className="w-14 mx-auto" />
          <h1 className="font-display text-3xl font-medium tracking-[0.12em] text-ink mt-3">BEHIND THE SCENES</h1>
          <p className="font-hand text-2xl text-ink/80 mt-1">Pages from the sketchbook.</p>
        </header>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id} className={`py-7 ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
            <div className="bg-paper-deep/50 border-2 border-rule/50 rounded-sm p-5 shadow-paper">
              <p className="font-hand text-xl text-rule-text">No. {i + 1}</p>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink font-semibold">{s.title}</h2>
              <p className="text-[16px] text-ink/85 mt-2">{s.text}</p>
              <div className="mt-4 h-40 border-2 border-dashed border-rule/40 rounded-sm flex items-center justify-center font-hand text-xl text-ink/50">
                sketches coming soon
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default BehindTheScenes;
