import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const kidThemes = [
  { id: "forest", label: "Enchanted Forest", img: bookCover1, emoji: "🌳" },
  { id: "sky", label: "Sky Adventure", img: bookCover2, emoji: "🐉" },
  { id: "ocean", label: "Ocean Quest", img: bookCover3, emoji: "🐠" },
  { id: "space", label: "Space Journey", img: bookCover4, emoji: "🚀" },
  { id: "superhero", label: "Superhero City", img: bookCover5, emoji: "🦸" },
  { id: "dinosaur", label: "Dinosaur World", img: bookCover6, emoji: "🦕" },
  { id: "fairy", label: "Fairy Garden", img: bookCover7, emoji: "🧚" },
  { id: "pirate", label: "Pirate Adventure", img: bookCover8, emoji: "🏴‍☠️" },
];

const adultThemes = [
  { id: "romance", label: "Love Story", img: bookCover1, emoji: "💕" },
  { id: "mystery", label: "Mystery Thriller", img: bookCover2, emoji: "🔍" },
  { id: "travel", label: "Travel Memoir", img: bookCover3, emoji: "✈️" },
  { id: "scifi", label: "Sci-Fi Epic", img: bookCover4, emoji: "🤖" },
  { id: "comedy", label: "Comedy & Satire", img: bookCover5, emoji: "😂" },
  { id: "memoir", label: "Life Story", img: bookCover6, emoji: "📖" },
  { id: "fantasy", label: "Fantasy Quest", img: bookCover7, emoji: "⚔️" },
  { id: "motivation", label: "Inspirational", img: bookCover8, emoji: "🌟" },
];

const kidAgeOptions = ["2-3", "4-5", "6-7", "8-10"];
const genderOptions = ["Girl", "Boy", "Non-binary"];
const toneOptions = ["Humorous", "Heartfelt", "Adventurous", "Inspirational", "Romantic", "Mysterious"];
const relationshipOptions = ["For myself", "Partner / Spouse", "Best Friend", "Parent", "Sibling", "Colleague"];
const bookSizeOptions = ["Standard (8×10)", "Compact (6×8)", "Large (10×12)"];

const TOTAL_STEPS = 5;

const CreateBook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audience, setAudience] = useState<"kid" | "adult" | "">("");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    // Shared
    name: "",
    theme: "",
    dedication: "",
    bookSize: "",
    coverType: "" as "" | "softcover" | "hardcover",
    photo: null as File | null,
    photoPreview: "",
    // Kid-specific
    age: "",
    gender: "",
    interests: "",
    favoriteCharacter: "",
    // Adult-specific
    tone: "",
    relationship: "",
    hobbies: "",
    favoriteMemory: "",
    personalMessage: "",
  });

  const themes = audience === "kid" ? kidThemes : adultThemes;

  const canNext = (() => {
    if (step === 0) return !!audience;
    if (step === 1) {
      if (audience === "kid") return !!form.name && !!form.age && !!form.gender;
      return !!form.name && !!form.relationship;
    }
    if (step === 2) return !!form.theme;
    if (step === 3) return !!form.tone || audience === "kid";
    return true;
  })();

  const handleNext = () => { if (step < TOTAL_STEPS - 1) setStep(step + 1); };
  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file, photoPreview: URL.createObjectURL(file) });
    }
  };

  const stepLabels = audience === "kid"
    ? ["Audience", "Child Info", "Theme", "Details", "Personalize"]
    : ["Audience", "About You", "Theme", "Tone & Style", "Personalize"];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-2xl">
          {/* Progress */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold transition-colors ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`hidden font-body text-sm font-medium lg:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < TOTAL_STEPS - 1 && <div className={`h-0.5 w-6 rounded ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Audience */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Who is this book for?</h2>
                  <p className="font-body text-muted-foreground">Choose the audience for your personalized story.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "kid" as const, emoji: "👶", label: "For Kids", desc: "Ages 2-10, colorful adventures" },
                    { id: "adult" as const, emoji: "🧑", label: "For Adults", desc: "Romance, mystery, memoir & more" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAudience(opt.id)}
                      className={`rounded-2xl border-2 p-6 text-center transition-all ${audience === opt.id ? "border-primary bg-primary/5 shadow-book" : "border-border hover:border-primary/50"}`}
                    >
                      <p className="mb-2 text-4xl">{opt.emoji}</p>
                      <p className="font-display text-lg font-bold text-foreground">{opt.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Person Info */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                    {audience === "kid" ? "Tell Us About Your Child" : "Tell Us About the Star"}
                  </h2>
                  <p className="font-body text-muted-foreground">We'll use this to create a unique story.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">{audience === "kid" ? "Child's Name" : "Name"}</Label>
                    <Input placeholder={audience === "kid" ? "e.g. Emma" : "e.g. Sarah"} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
                  </div>

                  {audience === "kid" && (
                    <>
                      <div>
                        <Label className="font-body font-semibold">Gender</Label>
                        <div className="mt-1.5 flex gap-2">
                          {genderOptions.map(g => (
                            <button key={g} onClick={() => setForm({ ...form, gender: g })}
                              className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-body font-semibold">Age Range</Label>
                        <div className="mt-1.5 flex gap-2">
                          {kidAgeOptions.map(a => (
                            <button key={a} onClick={() => setForm({ ...form, age: a })}
                              className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.age === a ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                              {a} yrs
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-body font-semibold">Interests & Hobbies</Label>
                        <Input placeholder="e.g. dinosaurs, painting, soccer" value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="font-body font-semibold">Favorite Character (optional)</Label>
                        <Input placeholder="e.g. Spider-Man, Elsa, Peppa Pig" value={form.favoriteCharacter} onChange={e => setForm({ ...form, favoriteCharacter: e.target.value })} className="mt-1.5" />
                      </div>
                    </>
                  )}

                  {audience === "adult" && (
                    <>
                      <div>
                        <Label className="font-body font-semibold">Who is this book for?</Label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {relationshipOptions.map(r => (
                            <button key={r} onClick={() => setForm({ ...form, relationship: r })}
                              className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.relationship === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-body font-semibold">Hobbies & Passions</Label>
                        <Input placeholder="e.g. cooking, hiking, music, reading" value={form.hobbies} onChange={e => setForm({ ...form, hobbies: e.target.value })} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="font-body font-semibold">A Favorite Memory (optional)</Label>
                        <Input placeholder="e.g. Our trip to Paris, graduation day" value={form.favoriteMemory} onChange={e => setForm({ ...form, favoriteMemory: e.target.value })} className="mt-1.5" />
                      </div>
                    </>
                  )}

                  {/* Photo Upload */}
                  <div>
                    <Label className="font-body font-semibold">Upload Photo (optional)</Label>
                    <p className="mb-2 font-body text-xs text-muted-foreground">Solo photo, front-facing & smiling works best</p>
                    <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50">
                      {form.photoPreview ? (
                        <img src={form.photoPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="font-body text-sm text-muted-foreground">Click to upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Theme */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Choose a Theme</h2>
                  <p className="font-body text-muted-foreground">
                    Pick the {audience === "kid" ? "adventure world" : "genre"} for {form.name || "your story"}.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(t => (
                    <button key={t.id} onClick={() => setForm({ ...form, theme: t.id })}
                      className={`group overflow-hidden rounded-2xl border-2 transition-all ${form.theme === t.id ? "border-primary shadow-book" : "border-border hover:border-primary/50"}`}>
                      <img src={t.img} alt={t.label} loading="lazy" width={640} height={800} className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="p-3">
                        <p className="font-display text-sm font-semibold text-foreground">{t.emoji} {t.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Tone & Details */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                    {audience === "kid" ? "Story Details" : "Tone & Style"}
                  </h2>
                  <p className="font-body text-muted-foreground">Help us craft the perfect story.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Story Tone</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(audience === "kid" ? ["Funny", "Adventurous", "Heartfelt", "Educational", "Magical"] : toneOptions).map(t => (
                        <button key={t} onClick={() => setForm({ ...form, tone: t })}
                          className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.tone === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-body font-semibold">Book Size</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {bookSizeOptions.map(s => (
                        <button key={s} onClick={() => setForm({ ...form, bookSize: s })}
                          className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.bookSize === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-body font-semibold">Cover Type</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      {[
                        { id: "softcover" as const, label: "Softcover", price: "₹999", desc: "Lightweight & flexible" },
                        { id: "hardcover" as const, label: "Hardcover", price: "₹1,299", desc: "Premium & durable" },
                      ].map(c => (
                        <button key={c.id} onClick={() => setForm({ ...form, coverType: c.id })}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${form.coverType === c.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}>
                          <p className="font-display text-sm font-bold text-foreground">{c.label}</p>
                          <p className="font-display text-lg font-bold text-primary">{c.price}</p>
                          <p className="font-body text-xs text-muted-foreground">{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {audience === "adult" && (
                    <div>
                      <Label className="font-body font-semibold">Personal Message in the Story (optional)</Label>
                      <textarea
                        placeholder="Any inside jokes, shared memories, or special moments you'd like woven into the story..."
                        value={form.personalMessage}
                        onChange={e => setForm({ ...form, personalMessage: e.target.value })}
                        rows={3}
                        className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Personalize / Summary */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Final Touches</h2>
                  <p className="font-body text-muted-foreground">Add a personal dedication for {form.name || "your story"}.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Dedication Message (optional)</Label>
                    <textarea
                      placeholder={`e.g. To ${form.name || "someone special"}, may you always believe in magic...`}
                      value={form.dedication}
                      onChange={e => setForm({ ...form, dedication: e.target.value })}
                      rows={4}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-4">
                    <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Book Summary</h4>
                    <ul className="space-y-1 font-body text-sm text-muted-foreground">
                      <li>👤 For: <span className="font-semibold text-foreground">{audience === "kid" ? "Kids" : "Adults"}</span></li>
                      <li>📝 Starring: <span className="font-semibold text-foreground">{form.name}</span></li>
                      {audience === "kid" && form.age && <li>🎂 Age: <span className="font-semibold text-foreground">{form.age} years</span></li>}
                      {audience === "kid" && form.gender && <li>⚧ Gender: <span className="font-semibold text-foreground">{form.gender}</span></li>}
                      {audience === "adult" && form.relationship && <li>💝 Relationship: <span className="font-semibold text-foreground">{form.relationship}</span></li>}
                      <li>🎨 Theme: <span className="font-semibold text-foreground">{themes.find(t => t.id === form.theme)?.label}</span></li>
                      {form.tone && <li>🎭 Tone: <span className="font-semibold text-foreground">{form.tone}</span></li>}
                      {form.bookSize && <li>📐 Size: <span className="font-semibold text-foreground">{form.bookSize}</span></li>}
                      {form.coverType && <li>📕 Cover: <span className="font-semibold text-foreground">{form.coverType === "softcover" ? "Softcover — ₹999" : "Hardcover — ₹1,299"}</span></li>}
                      {(form.interests || form.hobbies) && <li>⭐ Interests: <span className="font-semibold text-foreground">{form.interests || form.hobbies}</span></li>}
                      {form.photo && <li>📷 Photo: <span className="font-semibold text-foreground">Uploaded ✓</span></li>}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 0} className="gap-2 font-body">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={handleNext} disabled={!canNext} className="gap-2 bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={generating || !form.coverType}
                onClick={async () => {
                  setGenerating(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                      toast({ title: "Please sign in first", description: "You need an account to generate a book.", variant: "destructive" });
                      navigate("/auth");
                      return;
                    }

                    const price = form.coverType === "hardcover" ? 1299 : 999;

                    const { data: order, error: insertError } = await supabase
                      .from("orders")
                      .insert({
                        user_id: user.id,
                        audience: audience as string,
                        name: form.name,
                        theme: form.theme,
                        tone: form.tone || null,
                        book_size: form.bookSize || null,
                        cover_type: form.coverType,
                        dedication: form.dedication || null,
                        personal_message: form.personalMessage || null,
                        age: form.age || null,
                        gender: form.gender || null,
                        interests: form.interests || null,
                        favorite_character: form.favoriteCharacter || null,
                        relationship: form.relationship || null,
                        hobbies: form.hobbies || null,
                        favorite_memory: form.favoriteMemory || null,
                        price,
                        status: "pending",
                      })
                      .select()
                      .single();

                    if (insertError || !order) {
                      throw new Error(insertError?.message || "Failed to create order");
                    }

                    // Navigate to preview immediately (it will show loading state)
                    navigate(`/preview/${order.id}`);

                    // Trigger generation in background
                    supabase.functions.invoke("generate-book", {
                      body: { orderId: order.id },
                    });
                  } catch (err: any) {
                    console.error(err);
                    toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
                    setGenerating(false);
                  }
                }}
                className="gap-2 bg-gradient-coral font-body font-bold text-accent-foreground shadow-book hover:opacity-90"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : "Generate My Book"}
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
