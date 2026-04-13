import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Upload, Sparkles, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import bookCover4 from "@/assets/book-cover-4.jpg";
import bookCover5 from "@/assets/book-cover-5.jpg";
import bookCover6 from "@/assets/book-cover-6.jpg";
import bookCover7 from "@/assets/book-cover-7.jpg";
import bookCover8 from "@/assets/book-cover-8.jpg";

interface ChildStoryFlowProps {
  onComplete: (data: ChildFormData) => void;
  generating: boolean;
}

export interface ChildFormData {
  name: string;
  nickname: string;
  age: string;
  photo: File | null;
  photoPreview: string;
  occasion: string;
  theme: string;
  personality: string[];
  favoriteToy: string;
  favoriteFood: string;
  favoriteActivity: string;
  favoriteCharacter: string;
  dislikes: string[];
  dislikesCustom: string;
  sidekick: string;
  goal: string;
  challenge: string;
  cuteHabit: string;
  funnyPhrase: string;
  smileMemory: string;
  whySpecial: string;
  messageForChild: string;
  futureWish: string;
  songName: string;
  songLink: string;
  songWhy: string;
  coverType: "softcover" | "hardcover";
  dedication: string;
}

const CHILD_STEPS = 11;

const kidOccasions = [
  { id: "birthday", emoji: "🎂", label: "Birthday" },
  { id: "new-baby", emoji: "👶", label: "New Baby" },
  { id: "just-because", emoji: "😊", label: "Just Because" },
  { id: "achievement", emoji: "🏆", label: "Achievement" },
];

const storyThemes = [
  { id: "superhero", label: "Superhero Adventure", img: bookCover5, emoji: "🦸" },
  { id: "magical", label: "Magical Fantasy", img: bookCover7, emoji: "🧙" },
  { id: "space", label: "Space Explorer", img: bookCover4, emoji: "🚀" },
  { id: "jungle", label: "Jungle Adventure", img: bookCover6, emoji: "🐯" },
  { id: "fairy", label: "Fairy Tale", img: bookCover3, emoji: "🏰" },
  { id: "surprise", label: "Surprise Me!", img: bookCover1, emoji: "🎲" },
];

const personalityTraits = ["Brave", "Funny", "Curious", "Kind", "Mischievous", "Smart"];
const dislikeOptions = ["Darkness", "Loud Noises", "Vegetables", "Being Alone", "Monsters", "Bedtime"];
const sidekickOptions = [
  { id: "pet", emoji: "🐶", label: "Pet" },
  { id: "robot", emoji: "🤖", label: "Robot" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
  { id: "bestfriend", emoji: "👧", label: "Best Friend" },
  { id: "imaginary", emoji: "🌈", label: "Imaginary Friend" },
];
const goalOptions = [
  { id: "save", emoji: "🌍", label: "Save the Day" },
  { id: "treasure", emoji: "💎", label: "Find Treasure" },
  { id: "help", emoji: "🤝", label: "Help Someone" },
  { id: "discover", emoji: "🔍", label: "Discover Something" },
];
const challengeOptions = [
  { id: "villain", emoji: "😈", label: "A Villain" },
  { id: "mystery", emoji: "🧩", label: "A Mystery" },
  { id: "fear", emoji: "😨", label: "Facing Fear" },
  { id: "lost", emoji: "🌲", label: "Getting Lost" },
];

const ChildStoryFlow = ({ onComplete, generating }: ChildStoryFlowProps) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ChildFormData>({
    name: "",
    nickname: "",
    age: "",
    photo: null,
    photoPreview: "",
    occasion: "",
    theme: "",
    personality: [],
    favoriteToy: "",
    favoriteFood: "",
    favoriteActivity: "",
    favoriteCharacter: "",
    dislikes: [],
    dislikesCustom: "",
    sidekick: "",
    goal: "",
    challenge: "",
    cuteHabit: "",
    funnyPhrase: "",
    smileMemory: "",
    whySpecial: "",
    messageForChild: "",
    futureWish: "",
    songName: "",
    songLink: "",
    songWhy: "",
    coverType: "softcover",
    dedication: "",
  });

  const n = form.name || "them";
  const ns = form.name ? `${form.name}'s` : "their";

  const togglePersonality = (trait: string) => {
    setForm(f => ({
      ...f,
      personality: f.personality.includes(trait)
        ? f.personality.filter(t => t !== trait)
        : [...f.personality, trait],
    }));
  };

  const toggleDislike = (item: string) => {
    setForm(f => ({
      ...f,
      dislikes: f.dislikes.includes(item)
        ? f.dislikes.filter(d => d !== item)
        : [...f.dislikes, item],
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, photo: file, photoPreview: URL.createObjectURL(file) });
  };

  const canNext = (() => {
    if (step === 0) return !!form.name;
    if (step === 1) return !!form.age;
    if (step === 2) return true; // photo optional
    if (step === 3) return !!form.occasion;
    if (step === 4) return !!form.theme;
    if (step === 5) return form.personality.length > 0;
    if (step === 6) return !!form.sidekick && !!form.goal && !!form.challenge;
    if (step === 7) return true; // optional
    if (step === 8) return true; // optional
    if (step === 9) return true; // optional
    if (step === 10) return !!form.coverType;
    return true;
  })();

  const anim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  const ChipButton = ({ selected, onClick, children, className = "" }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) => (
    <button onClick={onClick} className={`rounded-xl border-2 px-4 py-2 font-body text-sm font-medium transition-all ${selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"} ${className}`}>
      {children}
    </button>
  );

  const CardButton = ({ selected, onClick, emoji, label, desc }: { selected: boolean; onClick: () => void; emoji: string; label: string; desc?: string }) => (
    <button onClick={onClick} className={`rounded-2xl border-2 p-4 text-center transition-all ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}>
      <p className="mb-1 text-2xl">{emoji}</p>
      <p className="font-display text-xs font-semibold text-foreground">{label}</p>
      {desc && <p className="font-body text-xs text-muted-foreground">{desc}</p>}
    </button>
  );

  return (
    <div>
      {/* Progress */}
      <div className="mb-10">
        <div className="h-2 w-full rounded-full bg-secondary">
          <div className="h-2 rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${((step + 1) / CHILD_STEPS) * 100}%` }} />
        </div>
        <p className="mt-2 text-center font-body text-xs text-muted-foreground">Step {step + 1} of {CHILD_STEPS}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Name */}
        {step === 0 && (
          <motion.div key="c0" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Who are we creating this magical book for? ✨</h2>
              <p className="font-body text-muted-foreground">We'll make them the hero of the story!</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">Child's Name *</Label>
                <Input placeholder="e.g. Emma, Aarav" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">Nickname (optional)</Label>
                <Input placeholder="e.g. Emmy, Teddy Bear" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="mt-1.5" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Age */}
        {step === 1 && (
          <motion.div key="c1" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">How old is {n}? 🎈</h2>
              <p className="font-body text-muted-foreground">This helps us adjust the story's language and complexity.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "2-3", label: "2–3 years", desc: "Simple words, lots of pictures" },
                { id: "4-5", label: "4–5 years", desc: "Short sentences, magical stories" },
                { id: "6-7", label: "6–7 years", desc: "Adventure with more detail" },
                { id: "8-10", label: "8–10 years", desc: "Rich stories, fun twists" },
              ].map(a => (
                <CardButton key={a.id} selected={form.age === a.id} onClick={() => setForm({ ...form, age: a.id })} emoji="🎂" label={a.label} desc={a.desc} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Photo */}
        {step === 2 && (
          <motion.div key="c2" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Upload a photo of {n} 📸</h2>
              <p className="font-body text-muted-foreground">Optional but magical — we can place their face in the storybook! ✨</p>
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-10 transition-colors hover:border-primary/50">
              {form.photoPreview ? (
                <img src={form.photoPreview} alt="Preview" className="h-32 w-32 rounded-xl object-cover shadow-md" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="font-body text-sm text-muted-foreground">Click to upload a photo</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </motion.div>
        )}

        {/* Step 3: Occasion */}
        {step === 3 && (
          <motion.div key="c3" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">What's the special reason? 🎉</h2>
              <p className="font-body text-muted-foreground">We'll tailor the story to match the celebration.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {kidOccasions.map(o => (
                <CardButton key={o.id} selected={form.occasion === o.id} onClick={() => setForm({ ...form, occasion: o.id })} emoji={o.emoji} label={o.label} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Story Theme */}
        {step === 4 && (
          <motion.div key="c4" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">What kind of story would {n} love? 📖</h2>
              <p className="font-body text-muted-foreground">Pick an adventure world for the story.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {storyThemes.map(t => (
                <button key={t.id} onClick={() => setForm({ ...form, theme: t.id })}
                  className={`group overflow-hidden rounded-2xl border-2 transition-all ${form.theme === t.id ? "border-primary shadow-book" : "border-border hover:border-primary/50"}`}>
                  <img src={t.img} alt={t.label} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold text-foreground">{t.emoji} {t.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Character Building */}
        {step === 5 && (
          <motion.div key="c5" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Let's build {ns} character 🧩</h2>
              <p className="font-body text-muted-foreground">These details make the story feel truly personal.</p>
            </div>
            <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
              {/* Personality */}
              <div>
                <Label className="font-body font-semibold">How would you describe {n}? (pick all that apply) *</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {personalityTraits.map(t => (
                    <ChipButton key={t} selected={form.personality.includes(t)} onClick={() => togglePersonality(t)}>{t}</ChipButton>
                  ))}
                </div>
              </div>

              {/* Favorites */}
              <div>
                <Label className="font-body font-semibold">What does {n} love the most?</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 font-body text-xs text-muted-foreground">Favorite toy</p>
                    <Input placeholder="e.g. Teddy bear, LEGO" value={form.favoriteToy} onChange={e => setForm({ ...form, favoriteToy: e.target.value })} />
                  </div>
                  <div>
                    <p className="mb-1 font-body text-xs text-muted-foreground">Favorite food</p>
                    <Input placeholder="e.g. Pizza, ice cream" value={form.favoriteFood} onChange={e => setForm({ ...form, favoriteFood: e.target.value })} />
                  </div>
                  <div>
                    <p className="mb-1 font-body text-xs text-muted-foreground">Favorite activity</p>
                    <Input placeholder="e.g. Drawing, playing tag" value={form.favoriteActivity} onChange={e => setForm({ ...form, favoriteActivity: e.target.value })} />
                  </div>
                  <div>
                    <p className="mb-1 font-body text-xs text-muted-foreground">Favorite character</p>
                    <Input placeholder="e.g. Spider-Man, Elsa" value={form.favoriteCharacter} onChange={e => setForm({ ...form, favoriteCharacter: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Dislikes */}
              <div>
                <Label className="font-body font-semibold">What does {n} NOT like? 😄</Label>
                <p className="mb-2 font-body text-xs text-muted-foreground">This helps create fun story conflicts!</p>
                <div className="flex flex-wrap gap-2">
                  {dislikeOptions.map(d => (
                    <ChipButton key={d} selected={form.dislikes.includes(d)} onClick={() => toggleDislike(d)}>{d}</ChipButton>
                  ))}
                </div>
                <Input placeholder="Add your own..." value={form.dislikesCustom} onChange={e => setForm({ ...form, dislikesCustom: e.target.value })} className="mt-2" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: Story Elements */}
        {step === 6 && (
          <motion.div key="c6" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Let's shape the adventure 🗺️</h2>
              <p className="font-body text-muted-foreground">Choose the elements that make {ns} story epic!</p>
            </div>
            <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
              {/* Sidekick */}
              <div>
                <Label className="font-body font-semibold">Who should join {n} on the adventure? *</Label>
                <div className="mt-2 grid grid-cols-3 gap-3 md:grid-cols-5">
                  {sidekickOptions.map(s => (
                    <CardButton key={s.id} selected={form.sidekick === s.id} onClick={() => setForm({ ...form, sidekick: s.id })} emoji={s.emoji} label={s.label} />
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <Label className="font-body font-semibold">What should {n} achieve? *</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {goalOptions.map(g => (
                    <CardButton key={g.id} selected={form.goal === g.id} onClick={() => setForm({ ...form, goal: g.id })} emoji={g.emoji} label={g.label} />
                  ))}
                </div>
              </div>

              {/* Challenge */}
              <div>
                <Label className="font-body font-semibold">What obstacle should they face? *</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {challengeOptions.map(c => (
                    <CardButton key={c.id} selected={form.challenge === c.id} onClick={() => setForm({ ...form, challenge: c.id })} emoji={c.emoji} label={c.label} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 7: Memory Touch */}
        {step === 7 && (
          <motion.div key="c7" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Add a real-life touch 💫</h2>
              <p className="font-body text-muted-foreground">These little details blend fantasy with real emotion. (All optional)</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">A cute habit {n} has</Label>
                <Input placeholder="e.g. Always carries their blankie, talks to stuffed animals" value={form.cuteHabit} onChange={e => setForm({ ...form, cuteHabit: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">A funny thing {n} always says</Label>
                <Input placeholder={"e.g. \"I'm not tired!\", \"One more story please!\""} value={form.funnyPhrase} onChange={e => setForm({ ...form, funnyPhrase: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">A moment that made you smile</Label>
                <textarea
                  placeholder="e.g. When they tried to 'cook' breakfast and put cereal in a glass"
                  value={form.smileMemory}
                  onChange={e => setForm({ ...form, smileMemory: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 8: Love & Future */}
        {step === 8 && (
          <motion.div key="c8" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">What would you like to say to {n}? ❤️</h2>
              <p className="font-body text-muted-foreground">This becomes the heartfelt ending of the book.</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">Why is {n} special?</Label>
                <textarea
                  placeholder="e.g. They light up every room, their laugh is contagious..."
                  value={form.whySpecial}
                  onChange={e => setForm({ ...form, whySpecial: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <Label className="font-body font-semibold">A message for {n}</Label>
                <textarea
                  placeholder="e.g. You can do anything you set your mind to..."
                  value={form.messageForChild}
                  onChange={e => setForm({ ...form, messageForChild: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <Label className="font-body font-semibold">A wish for their future</Label>
                <Input placeholder="e.g. To always stay curious and kind" value={form.futureWish} onChange={e => setForm({ ...form, futureWish: e.target.value })} className="mt-1.5" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 9: Song */}
        {step === 9 && (
          <motion.div key="c9" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Add a special song 🎵</h2>
              <p className="font-body text-muted-foreground">We'll add a QR code in the book so they can listen! (Optional)</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">Song name</Label>
                <Input placeholder="e.g. You Are My Sunshine" value={form.songName} onChange={e => setForm({ ...form, songName: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">Song link (YouTube, Spotify, etc.)</Label>
                <Input placeholder="e.g. https://youtube.com/..." value={form.songLink} onChange={e => setForm({ ...form, songLink: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">Why does this song matter?</Label>
                <Input placeholder="e.g. We always sing this together at bedtime" value={form.songWhy} onChange={e => setForm({ ...form, songWhy: e.target.value })} className="mt-1.5" />
              </div>
              {form.songName && (
                <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                  <Music className="h-5 w-5 text-primary" />
                  <p className="font-body text-sm text-foreground">🎵 {form.songName} — QR code will be added to the book!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 10: Cover & Finalize */}
        {step === 10 && (
          <motion.div key="c10" {...anim} className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Final Touches ✨</h2>
              <p className="font-body text-muted-foreground">Choose your cover and add a dedication.</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">Cover Type</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
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

              <div>
                <Label className="font-body font-semibold">Dedication Message (optional)</Label>
                <textarea
                  placeholder={`e.g. To ${form.name || "someone special"}, may you always believe in magic...`}
                  value={form.dedication}
                  onChange={e => setForm({ ...form, dedication: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <h4 className="mb-2 font-display text-sm font-semibold text-foreground">📖 Story Summary</h4>
                <ul className="space-y-1 font-body text-sm text-muted-foreground">
                  <li>🌟 Hero: <span className="font-semibold text-foreground">{form.name}{form.nickname ? ` (${form.nickname})` : ""}</span></li>
                  <li>🎂 Age: <span className="font-semibold text-foreground">{form.age} years</span></li>
                  {form.occasion && <li>🎉 Occasion: <span className="font-semibold text-foreground">{kidOccasions.find(o => o.id === form.occasion)?.label}</span></li>}
                  <li>📖 Theme: <span className="font-semibold text-foreground">{storyThemes.find(t => t.id === form.theme)?.label}</span></li>
                  <li>🧩 Personality: <span className="font-semibold text-foreground">{form.personality.join(", ")}</span></li>
                  {form.sidekick && <li>🐾 Sidekick: <span className="font-semibold text-foreground">{sidekickOptions.find(s => s.id === form.sidekick)?.label}</span></li>}
                  {form.goal && <li>🎯 Goal: <span className="font-semibold text-foreground">{goalOptions.find(g => g.id === form.goal)?.label}</span></li>}
                  {form.challenge && <li>⚡ Challenge: <span className="font-semibold text-foreground">{challengeOptions.find(c => c.id === form.challenge)?.label}</span></li>}
                  <li>📕 Cover: <span className="font-semibold text-foreground">{form.coverType === "softcover" ? "Softcover — ₹999" : "Hardcover — ₹1,299"}</span></li>
                  {form.songName && <li>🎵 Song: <span className="font-semibold text-foreground">{form.songName}</span></li>}
                  {form.photo && <li>📷 Photo: <span className="font-semibold text-foreground">Uploaded ✓</span></li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="gap-2 font-body">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < CHILD_STEPS - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="gap-2 bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            disabled={generating || !form.coverType}
            onClick={() => onComplete(form)}
            className="gap-2 bg-gradient-coral font-body font-bold text-accent-foreground shadow-book hover:opacity-90"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate My Book"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChildStoryFlow;
