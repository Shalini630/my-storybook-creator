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
import OccasionQuestions from "@/components/OccasionQuestions";
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

const occasions = [
  { id: "birthday", emoji: "🎂", label: "Birthday" },
  { id: "mothers-day", emoji: "💐", label: "Mother's Day" },
  { id: "anniversary", emoji: "💕", label: "Anniversary" },
  { id: "wedding", emoji: "💒", label: "Wedding" },
  { id: "bachelorette", emoji: "💃", label: "Bachelorette" },
  { id: "retirement", emoji: "🎉", label: "Retirement" },
  { id: "fathers-day", emoji: "👔", label: "Father's Day" },
  { id: "graduation", emoji: "🎓", label: "Graduation" },
  { id: "farewell", emoji: "👋", label: "Farewell" },
  { id: "new-baby", emoji: "👶", label: "New Baby" },
  { id: "just-because", emoji: "😊", label: "Just Because" },
  { id: "roast", emoji: "😂", label: "Roast" },
];

const kidAgeOptions = ["2-3", "4-5", "6-7", "8-10"];
const genderOptions = ["Girl", "Boy", "Non-binary"];
const toneOptions = ["Humorous", "Heartfelt", "Adventurous", "Inspirational", "Romantic", "Mysterious"];
const bookSizeOptions = ["Standard (8×10)", "Compact (6×8)", "Large (10×12)"];

// Steps: 0=Gift?, 1=Occasion, 2=Audience, 3=Couple?, 4=PersonInfo, 5=Personality, 6=Theme, 7=Tone&Cover, 8=Finalize
const TOTAL_STEPS = 9;

const CreateBook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    isGift: null as boolean | null,
    occasion: "",
    audience: "" as "" | "kid" | "adult",
    isCouple: null as boolean | null,
    birthdayType: "" as "" | "human" | "pet",
    // Person info
    name: "",
    partnerName: "",
    age: "",
    gender: "",
    interests: "",
    favoriteCharacter: "",
    relationship: "",
    hobbies: "",
    favoriteMemory: "",
    personalMessage: "",
    // Personality questions
    personality: "",
    funnyQuirks: "",
    favoriteThings: "",
    hilariousMoment: "",
    bestFriends: "",
    favoriteTreats: "",
    sleepHabits: "",
    memorableAdventure: "",
    // Book config
    theme: "",
    tone: "",
    bookSize: "",
    coverType: "" as "" | "softcover" | "hardcover",
    dedication: "",
    photo: null as File | null,
    photoPreview: "",
  });

  const audience = form.audience;
  const themes = audience === "kid" ? kidThemes : adultThemes;

  const canNext = (() => {
    if (step === 0) return form.isGift !== null;
    if (step === 1) return form.isGift ? !!form.occasion : true;
    if (step === 2) return !!audience;
    if (step === 3) return form.isCouple !== null;
    if (step === 4) {
      if (audience === "kid") return !!form.name && !!form.age && !!form.gender;
      return !!form.name;
    }
    if (step === 5) return true; // personality is optional
    if (step === 6) return !!form.theme;
    if (step === 7) return !!form.coverType;
    return true;
  })();

  // Skip occasion if not a gift, skip couple if kid
  const getNextStep = (current: number) => {
    let next = current + 1;
    if (next === 1 && !form.isGift) next = 2; // skip occasion
    if (next === 3 && audience === "kid") next = 4; // skip couple for kids
    if (next === 3 && !audience) next = 3; // stay if no audience yet
    return Math.min(next, TOTAL_STEPS - 1);
  };

  const getPrevStep = (current: number) => {
    let prev = current - 1;
    if (prev === 3 && audience === "kid") prev = 2;
    if (prev === 1 && !form.isGift) prev = 0;
    return Math.max(prev, 0);
  };

  const handleNext = () => setStep(getNextStep(step));
  const handleBack = () => setStep(getPrevStep(step));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file, photoPreview: URL.createObjectURL(file) });
    }
  };

  const showBirthdayType = form.occasion === "birthday";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-2xl">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center font-body text-xs text-muted-foreground">
              Step {step + 1} of {TOTAL_STEPS}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Is this a gift? */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Is this book a gift?</h2>
                  <p className="font-body text-muted-foreground">Let us know if you're creating a special present for someone.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: true, emoji: "🎁", label: "Yes, Create a Gift" },
                    { val: false, emoji: "📖", label: "No, It's for Me" },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setForm({ ...form, isGift: opt.val })}
                      className={`rounded-2xl border-2 p-6 text-center transition-all ${form.isGift === opt.val ? "border-primary bg-primary/5 shadow-book" : "border-border hover:border-primary/50"}`}
                    >
                      <p className="mb-2 text-4xl">{opt.emoji}</p>
                      <p className="font-display text-lg font-bold text-foreground">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Occasion */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">What's the occasion?</h2>
                  <p className="font-body text-muted-foreground">This helps us tailor the experience for your unique gift.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {occasions.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setForm({ ...form, occasion: o.id, birthdayType: o.id !== "birthday" ? "" : form.birthdayType })}
                      className={`rounded-2xl border-2 p-4 text-center transition-all ${form.occasion === o.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}
                    >
                      <p className="mb-1 text-2xl">{o.emoji}</p>
                      <p className="font-display text-xs font-semibold text-foreground">{o.label}</p>
                    </button>
                  ))}
                </div>

                {/* Birthday: Pet or Human */}
                {showBirthdayType && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="mb-3 text-center font-display text-sm font-semibold text-foreground">Who's the birthday for?</p>
                    <div className="flex justify-center gap-4">
                      {[
                        { id: "human" as const, emoji: "👤", label: "Human" },
                        { id: "pet" as const, emoji: "🐾", label: "Pet" },
                      ].map(bt => (
                        <button
                          key={bt.id}
                          onClick={() => setForm({ ...form, birthdayType: bt.id })}
                          className={`rounded-xl border-2 px-6 py-3 text-center transition-all ${form.birthdayType === bt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                        >
                          <p className="text-2xl">{bt.emoji}</p>
                          <p className="font-body text-xs font-semibold">{bt.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Audience */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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
                      onClick={() => setForm({ ...form, audience: opt.id })}
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

            {/* Step 3: Couple? (adults only) */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Is this book about a couple?</h2>
                  <p className="font-body text-muted-foreground">Create a special love story featuring both partners with a photo of the couple on the cover!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: true, emoji: "💕", label: "Yes, It's About Us" },
                    { val: false, emoji: "👤", label: "No, Just One Person" },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setForm({ ...form, isCouple: opt.val })}
                      className={`rounded-2xl border-2 p-6 text-center transition-all ${form.isCouple === opt.val ? "border-primary bg-primary/5 shadow-book" : "border-border hover:border-primary/50"}`}
                    >
                      <p className="mb-2 text-4xl">{opt.emoji}</p>
                      <p className="font-display text-lg font-bold text-foreground">{opt.label}</p>
                    </button>
                  ))}
                </div>
                {form.isCouple && (
                  <p className="text-center font-body text-sm text-muted-foreground">
                    Couple books feature both partners as main characters with questions about your relationship!
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 4: Person Info */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                    {audience === "kid" ? "Tell Us About Your Child" : form.isCouple ? "Tell Us About the Couple" : "Tell Us About the Star"}
                  </h2>
                  <p className="font-body text-muted-foreground">We'll use this to create a unique story.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">{audience === "kid" ? "Child's Name" : form.birthdayType === "pet" ? "Pet's Name" : "Name"}</Label>
                    <Input placeholder={audience === "kid" ? "e.g. Emma" : form.birthdayType === "pet" ? "e.g. Max" : "e.g. Sarah"} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
                  </div>

                  {form.isCouple && (
                    <div>
                      <Label className="font-body font-semibold">Partner's Name</Label>
                      <Input placeholder="e.g. Alex" value={form.partnerName} onChange={e => setForm({ ...form, partnerName: e.target.value })} className="mt-1.5" />
                    </div>
                  )}

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
                    </>
                  )}

                  {audience === "adult" && !form.isCouple && (
                    <div>
                      <Label className="font-body font-semibold">Relationship</Label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {["For myself", "Partner / Spouse", "Best Friend", "Parent", "Sibling", "Colleague"].map(r => (
                          <button key={r} onClick={() => setForm({ ...form, relationship: r })}
                            className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.relationship === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div>
                    <Label className="font-body font-semibold">Upload Photo (for the book cover)</Label>
                    <p className="mb-2 font-body text-xs text-muted-foreground">
                      {form.isCouple ? "A photo of the couple together works best" : "Solo photo, front-facing & smiling works best"}
                    </p>
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

            {/* Step 5: Occasion-Specific Questions */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <OccasionQuestions
                  occasion={form.occasion || (form.isGift ? "" : "just-because")}
                  birthdayType={form.birthdayType}
                  name={form.name}
                  form={{
                    personality: form.personality,
                    funnyQuirks: form.funnyQuirks,
                    favoriteThings: form.favoriteThings,
                    hilariousMoment: form.hilariousMoment,
                    bestFriends: form.bestFriends,
                    favoriteTreats: form.favoriteTreats,
                    sleepHabits: form.sleepHabits,
                    memorableAdventure: form.memorableAdventure,
                  }}
                  onUpdate={(field, value) => setForm({ ...form, [field]: value })}
                />
              </motion.div>
            )}

            {/* Step 6: Theme */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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

            {/* Step 7: Tone & Cover */}
            {step === 7 && (
              <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Tone & Book Style</h2>
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
                </div>
              </motion.div>
            )}

            {/* Step 8: Finalize */}
            {step === 8 && (
              <motion.div key="s8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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
                      {form.isGift && <li>🎁 Gift for: <span className="font-semibold text-foreground">{occasions.find(o => o.id === form.occasion)?.label || "Someone special"}</span></li>}
                      <li>👤 For: <span className="font-semibold text-foreground">{audience === "kid" ? "Kids" : "Adults"}{form.isCouple ? " (Couple)" : ""}</span></li>
                      <li>📝 Starring: <span className="font-semibold text-foreground">{form.name}{form.partnerName ? ` & ${form.partnerName}` : ""}</span></li>
                      {audience === "kid" && form.age && <li>🎂 Age: <span className="font-semibold text-foreground">{form.age} years</span></li>}
                      <li>🎨 Theme: <span className="font-semibold text-foreground">{themes.find(t => t.id === form.theme)?.label}</span></li>
                      {form.tone && <li>🎭 Tone: <span className="font-semibold text-foreground">{form.tone}</span></li>}
                      {form.coverType && <li>📕 Cover: <span className="font-semibold text-foreground">{form.coverType === "softcover" ? "Softcover — ₹999" : "Hardcover — ₹1,299"}</span></li>}
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

                    // Build personality string for the AI
                    const personalityDetails = [
                      form.personality && `Personality: ${form.personality}`,
                      form.funnyQuirks && `Quirks: ${form.funnyQuirks}`,
                      form.favoriteThings && `Favorite things: ${form.favoriteThings}`,
                      form.hilariousMoment && `Funny moment: ${form.hilariousMoment}`,
                      form.bestFriends && `Best friends: ${form.bestFriends}`,
                      form.favoriteTreats && `Favorite treats: ${form.favoriteTreats}`,
                      form.sleepHabits && `Sleep habits: ${form.sleepHabits}`,
                      form.memorableAdventure && `Memorable adventure: ${form.memorableAdventure}`,
                    ].filter(Boolean).join(". ");

                    const { data: order, error: insertError } = await supabase
                      .from("orders")
                      .insert({
                        user_id: user.id,
                        audience: audience as string,
                        name: form.isCouple && form.partnerName ? `${form.name} & ${form.partnerName}` : form.name,
                        theme: form.theme,
                        tone: form.tone || null,
                        book_size: form.bookSize || null,
                        cover_type: form.coverType,
                        dedication: form.dedication || null,
                        personal_message: personalityDetails || form.personalMessage || null,
                        age: form.age || null,
                        gender: form.gender || null,
                        interests: form.favoriteThings || form.interests || null,
                        favorite_character: form.favoriteCharacter || null,
                        relationship: form.relationship || null,
                        hobbies: form.hobbies || null,
                        favorite_memory: form.memorableAdventure || form.favoriteMemory || null,
                        price,
                        status: "pending",
                      })
                      .select()
                      .single();

                    if (insertError || !order) {
                      throw new Error(insertError?.message || "Failed to create order");
                    }

                    navigate(`/preview/${order.id}`);

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
