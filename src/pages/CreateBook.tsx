import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import bookCover4 from "@/assets/book-cover-4.jpg";
import bookCover5 from "@/assets/book-cover-5.jpg";
import bookCover6 from "@/assets/book-cover-6.jpg";
import bookCover7 from "@/assets/book-cover-7.jpg";
import bookCover8 from "@/assets/book-cover-8.jpg";

const themes = [
  { id: "forest", label: "Enchanted Forest", img: bookCover1, emoji: "🌳" },
  { id: "sky", label: "Sky Adventure", img: bookCover2, emoji: "🐉" },
  { id: "ocean", label: "Ocean Quest", img: bookCover3, emoji: "🐠" },
  { id: "space", label: "Space Journey", img: bookCover4, emoji: "🚀" },
  { id: "superhero", label: "Superhero City", img: bookCover5, emoji: "🦸" },
  { id: "dinosaur", label: "Dinosaur World", img: bookCover6, emoji: "🦕" },
  { id: "fairy", label: "Fairy Garden", img: bookCover7, emoji: "🧚" },
  { id: "pirate", label: "Pirate Adventure", img: bookCover8, emoji: "🏴‍☠️" },
];

const ageOptions = ["2-3", "4-5", "6-7", "8-10"];

const CreateBook = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    childName: "",
    age: "",
    interests: "",
    theme: "",
    dedication: "",
  });

  const canNext =
    (step === 0 && form.childName && form.age) ||
    (step === 1 && form.theme) ||
    step === 2;

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-2xl">
          {/* Progress */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {["Child Info", "Theme", "Personalize"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold transition-colors ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`hidden font-body text-sm font-medium md:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`h-0.5 w-8 rounded ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Tell Us About Your Child</h2>
                  <p className="font-body text-muted-foreground">We'll use this to create their unique story.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Child's Name</Label>
                    <Input placeholder="e.g. Emma" value={form.childName} onChange={e => setForm({ ...form, childName: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body font-semibold">Age Range</Label>
                    <div className="mt-1.5 flex gap-2">
                      {ageOptions.map(a => (
                        <button
                          key={a}
                          onClick={() => setForm({ ...form, age: a })}
                          className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.age === a ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}
                        >
                          {a} yrs
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="font-body font-semibold">Interests & Hobbies (optional)</Label>
                    <Input placeholder="e.g. dinosaurs, painting, soccer" value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} className="mt-1.5" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Choose a Theme</h2>
                  <p className="font-body text-muted-foreground">Pick the adventure world for {form.childName || "your child"}.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setForm({ ...form, theme: t.id })}
                      className={`group overflow-hidden rounded-2xl border-2 transition-all ${form.theme === t.id ? "border-primary shadow-book" : "border-border hover:border-primary/50"}`}
                    >
                      <img src={t.img} alt={t.label} loading="lazy" width={640} height={800} className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="p-3">
                        <p className="font-display text-sm font-semibold text-foreground">{t.emoji} {t.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Final Touches</h2>
                  <p className="font-body text-muted-foreground">Add a personal dedication for {form.childName || "your child"}.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Dedication Message (optional)</Label>
                    <textarea
                      placeholder={`e.g. To ${form.childName || "my little one"}, may you always believe in magic...`}
                      value={form.dedication}
                      onChange={e => setForm({ ...form, dedication: e.target.value })}
                      rows={4}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-4">
                    <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Book Summary</h4>
                    <ul className="space-y-1 font-body text-sm text-muted-foreground">
                      <li>📝 Starring: <span className="font-semibold text-foreground">{form.childName}</span></li>
                      <li>🎂 Age: <span className="font-semibold text-foreground">{form.age} years</span></li>
                      <li>🎨 Theme: <span className="font-semibold text-foreground">{themes.find(t => t.id === form.theme)?.label}</span></li>
                      {form.interests && <li>⭐ Interests: <span className="font-semibold text-foreground">{form.interests}</span></li>}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-2 font-body"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext} disabled={!canNext} className="gap-2 bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2 bg-gradient-coral font-body font-bold text-accent-foreground shadow-book hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Generate My Book
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBook;
