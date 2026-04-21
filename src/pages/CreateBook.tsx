import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Upload, Loader2, Music, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OccasionQuestions from "@/components/OccasionQuestions";
import ChildStoryFlow, { type ChildFormData } from "@/components/ChildStoryFlow";
import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import bookCover4 from "@/assets/book-cover-4.jpg";
import bookCover5 from "@/assets/book-cover-5.jpg";
import bookCover6 from "@/assets/book-cover-6.jpg";
import bookCover7 from "@/assets/book-cover-7.jpg";
import bookCover8 from "@/assets/book-cover-8.jpg";
import adultRomance from "@/assets/adult-cover-romance.jpg";
import adultMystery from "@/assets/adult-cover-mystery.jpg";
import adultTravel from "@/assets/adult-cover-travel.jpg";
import adultScifi from "@/assets/adult-cover-scifi.jpg";
import adultComedy from "@/assets/adult-cover-comedy.jpg";
import adultMemoir from "@/assets/adult-cover-memoir.jpg";
import adultFantasy from "@/assets/adult-cover-fantasy.jpg";
import adultMotivation from "@/assets/adult-cover-motivation.jpg";

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
  { id: "romance", label: "Love Story", img: adultRomance, emoji: "💕" },
  { id: "mystery", label: "Mystery Thriller", img: adultMystery, emoji: "🔍" },
  { id: "travel", label: "Travel Memoir", img: adultTravel, emoji: "✈️" },
  { id: "scifi", label: "Sci-Fi Epic", img: adultScifi, emoji: "🤖" },
  { id: "comedy", label: "Comedy & Satire", img: adultComedy, emoji: "😂" },
  { id: "memoir", label: "Life Story", img: adultMemoir, emoji: "📖" },
  { id: "fantasy", label: "Fantasy Quest", img: adultFantasy, emoji: "⚔️" },
  { id: "motivation", label: "Inspirational", img: adultMotivation, emoji: "🌟" },
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

const bookSizeOptions = [
  { id: "40", label: "40 pages", price: 1200, displayPrice: "₹1,200" },
  { id: "60", label: "40–60 pages", price: 1500, displayPrice: "₹1,500" },
  { id: "80", label: "60–80 pages", price: 1700, displayPrice: "₹1,700" },
  { id: "100", label: "80–100 pages", price: 2000, displayPrice: "₹2,000" },
] as const;

// Adult flow steps:
// 0=Gift+Audience, 1=Occasion, 2=Couple?, 3=PersonInfo+Photo, 4=Personality,
// 5=Theme, 6=Tone, 7=Song(QR), 8=Memory Photos, 9=Book Size & Cover, 10=Finalize
const TOTAL_STEPS = 11;

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
    personality: "",
    funnyQuirks: "",
    favoriteThings: "",
    hilariousMoment: "",
    bestFriends: "",
    favoriteTreats: "",
    sleepHabits: "",
    memorableAdventure: "",
    extraDetail1: "",
    extraDetail2: "",
    extraDetail3: "",
    theme: "",
    tone: "",
    bookSize: "" as "" | "40" | "60" | "80" | "100",
    coverType: "" as "" | "softcover" | "hardcover",
    dedication: "",
    photo: null as File | null,
    photoPreview: "",
    songName: "",
    songLink: "",
    songWhy: "",
    memoryPhotos: [] as { file: File; preview: string; caption: string }[],
  });

  const audience = form.audience;
  const themes = audience === "kid" ? kidThemes : adultThemes;

  const canNext = (() => {
    if (step === 0) return form.isGift !== null && !!audience;
    if (step === 1) return form.isGift ? !!form.occasion : true;
    if (step === 2) return form.isCouple !== null;
    if (step === 3) {
      if (audience === "kid") return !!form.name && !!form.age && !!form.gender;
      return !!form.name;
    }
    if (step === 4) return true;
    if (step === 5) return !!form.theme;
    if (step === 6) return true; // tone optional
    if (step === 7) return true; // song optional
    if (step === 8) return true; // memory photos optional
    if (step === 9) return !!form.bookSize && !!form.coverType;
    return true;
  })();

  const getNextStep = (current: number) => {
    let next = current + 1;
    if (next === 1 && !form.isGift) next = 2; // skip occasion if not gift
    if (next === 2 && audience === "kid") next = 3; // skip couple for kids
    return Math.min(next, TOTAL_STEPS - 1);
  };

  const getPrevStep = (current: number) => {
    let prev = current - 1;
    if (prev === 2 && audience === "kid") prev = 1;
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

  const handleChildComplete = async (childData: ChildFormData) => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in first", description: "You need an account to generate a book.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const sizePriceMap: Record<string, number> = { "40": 1200, "60": 1500, "80": 1700, "100": 2000 };
      const basePrice = sizePriceMap[childData.bookSize] ?? 1200;
      const price = basePrice + (childData.coverType === "hardcover" ? 200 : 0);

      // Upload subject photo (if any) to private storage so the AI can render their face
      let photoUrl: string | null = null;
      if (childData.photo) {
        const ext = childData.photo.name.split(".").pop() || "jpg";
        const path = `${user.id}/subject-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("subject-photos").upload(path, childData.photo, { upsert: false });
        if (!upErr) {
          const { data: signed } = await supabase.storage.from("subject-photos").createSignedUrl(path, 60 * 60 * 24 * 7);
          photoUrl = signed?.signedUrl ?? null;
        }
      }

      const personalityDetails = [
        `Occasion: ${childData.occasion}`,
        `Personality: ${childData.personality.join(", ")}`,
        childData.favoriteToy && `Favorite toy: ${childData.favoriteToy}`,
        childData.favoriteFood && `Favorite food: ${childData.favoriteFood}`,
        childData.favoriteActivity && `Favorite activity: ${childData.favoriteActivity}`,
        childData.favoriteCharacter && `Favorite character: ${childData.favoriteCharacter}`,
        childData.dislikes.length > 0 && `Dislikes: ${childData.dislikes.join(", ")}${childData.dislikesCustom ? ", " + childData.dislikesCustom : ""}`,
        childData.sidekick && `Sidekick: ${childData.sidekick}`,
        childData.goal && `Story goal: ${childData.goal}`,
        childData.challenge && `Story challenge: ${childData.challenge}`,
        childData.cuteHabit && `Cute habit: ${childData.cuteHabit}`,
        childData.funnyPhrase && `Funny phrase: ${childData.funnyPhrase}`,
        childData.smileMemory && `Smile memory: ${childData.smileMemory}`,
        childData.whySpecial && `Why special: ${childData.whySpecial}`,
        childData.messageForChild && `Message: ${childData.messageForChild}`,
        childData.futureWish && `Future wish: ${childData.futureWish}`,
        childData.songName && `Song: ${childData.songName}`,
        childData.songWhy && `Song meaning: ${childData.songWhy}`,
      ].filter(Boolean).join(". ");

      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          audience: "kid",
          name: childData.nickname ? `${childData.name} (${childData.nickname})` : childData.name,
          theme: childData.theme,
          cover_type: childData.coverType,
          book_size: childData.bookSize,
          dedication: childData.dedication || null,
          personal_message: personalityDetails,
          age: childData.age,
          favorite_character: childData.favoriteCharacter || null,
          favorite_memory: childData.smileMemory || null,
          interests: childData.favoriteActivity || null,
          hobbies: childData.favoriteToy || null,
          photo_url: photoUrl,
          price,
          status: "pending",
        })
        .select()
        .single();

      if (insertError || !order) throw new Error(insertError?.message || "Failed to create order");

      navigate(`/preview/${order.id}`);
      supabase.functions.invoke("generate-book", { body: { orderId: order.id } });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
      setGenerating(false);
    }
  };

  // If audience is kid and we're past step 0, render the child flow
  if (audience === "kid" && step > 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 py-10">
          <div className="container max-w-2xl">
            <ChildStoryFlow onComplete={handleChildComplete} generating={generating} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            {/* Step 0: Gift + Audience combined */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Let's Create Your Story!</h2>
                  <p className="font-body text-muted-foreground">Tell us who this book is for.</p>
                </div>

                {/* Is it a gift? */}
                <div>
                  <p className="mb-3 text-center font-display text-sm font-semibold text-foreground">Is this book a gift?</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { val: true, emoji: "🎁", label: "Yes, Create a Gift" },
                      { val: false, emoji: "📖", label: "No, It's for Me" },
                    ].map(opt => (
                      <button
                        key={String(opt.val)}
                        onClick={() => setForm({ ...form, isGift: opt.val })}
                        className={`rounded-2xl border-2 p-5 text-center transition-all ${form.isGift === opt.val ? "border-primary bg-primary/5 shadow-book" : "border-border hover:border-primary/50"}`}
                      >
                        <p className="mb-1 text-3xl">{opt.emoji}</p>
                        <p className="font-display text-sm font-bold text-foreground">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <p className="mb-3 text-center font-display text-sm font-semibold text-foreground">Who is this book for?</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "kid" as const, emoji: "👶", label: "For Kids", desc: "Ages 2-10, colorful adventures" },
                      { id: "adult" as const, emoji: "🧑", label: "For Adults", desc: "Romance, mystery, memoir & more" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setForm({ ...form, audience: opt.id })}
                        className={`rounded-2xl border-2 p-5 text-center transition-all ${audience === opt.id ? "border-primary bg-primary/5 shadow-book" : "border-border hover:border-primary/50"}`}
                      >
                        <p className="mb-1 text-3xl">{opt.emoji}</p>
                        <p className="font-display text-sm font-bold text-foreground">{opt.label}</p>
                        <p className="font-body text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
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

            {/* Step 2: Couple? (adults only) */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Is this book about a couple?</h2>
                  <p className="font-body text-muted-foreground">Create a special love story featuring both partners!</p>
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
              </motion.div>
            )}

            {/* Step 3: Person Info */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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

            {/* Step 4: Occasion-Specific Questions */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
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
                    extraDetail1: form.extraDetail1,
                    extraDetail2: form.extraDetail2,
                    extraDetail3: form.extraDetail3,
                  }}
                  onUpdate={(field, value) => setForm({ ...form, [field]: value })}
                />
              </motion.div>
            )}

            {/* Step 5: Theme */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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

            {/* Step 6: Tone */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Story Tone</h2>
                  <p className="font-body text-muted-foreground">Set the emotional voice of the writing.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <Label className="font-body font-semibold">Pick a tone (optional)</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {toneOptions.map(t => (
                      <button key={t} onClick={() => setForm({ ...form, tone: t })}
                        className={`rounded-xl border px-4 py-2 font-body text-sm font-medium transition-colors ${form.tone === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 7: Song (QR) */}
            {step === 7 && (
              <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Add a song that reminds you of them 🎵</h2>
                  <p className="font-body text-muted-foreground">We'll print a QR code in the book so they can play it. (Optional)</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Song name</Label>
                    <Input placeholder="e.g. Tum Hi Ho" value={form.songName} onChange={e => setForm({ ...form, songName: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body font-semibold">Link (YouTube, Spotify, etc.)</Label>
                    <Input placeholder="https://..." value={form.songLink} onChange={e => setForm({ ...form, songLink: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body font-semibold">Why it matters</Label>
                    <Input placeholder="e.g. The song from our first dance" value={form.songWhy} onChange={e => setForm({ ...form, songWhy: e.target.value })} className="mt-1.5" />
                  </div>
                  {form.songName && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Music className="h-5 w-5 text-primary" />
                      <p className="font-body text-sm text-foreground">"{form.songName}" — QR code will be added to the book.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 8: Memory Photos */}
            {step === 8 && (
              <motion.div key="s8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Add memory photos 📷</h2>
                  <p className="font-body text-muted-foreground">We'll weave these moments into the book. (Optional)</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">Click to upload photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const next = files.slice(0, 6).map(file => ({ file, preview: URL.createObjectURL(file), caption: "" }));
                        setForm({ ...form, memoryPhotos: [...form.memoryPhotos, ...next].slice(0, 6) });
                      }}
                      className="hidden"
                    />
                  </label>

                  {form.memoryPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {form.memoryPhotos.map((mp, i) => (
                        <div key={i} className="relative">
                          <img src={mp.preview} alt={`Memory ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, memoryPhotos: form.memoryPhotos.filter((_, idx) => idx !== i) })}
                            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow"
                            aria-label="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <Input
                            placeholder="Caption (optional)"
                            value={mp.caption}
                            onChange={e => {
                              const updated = [...form.memoryPhotos];
                              updated[i] = { ...updated[i], caption: e.target.value };
                              setForm({ ...form, memoryPhotos: updated });
                            }}
                            className="mt-1.5 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="font-body text-xs text-muted-foreground">Up to 6 photos. We'll use the captions as story prompts.</p>
                </div>
              </motion.div>
            )}

            {/* Step 9: Book Size & Cover */}
            {step === 9 && (
              <motion.div key="s9" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Choose your book size 💰</h2>
                  <p className="font-body text-muted-foreground">Pricing reflects pages and finishing.</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <Label className="font-body font-semibold">Book Size *</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {bookSizeOptions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setForm({ ...form, bookSize: s.id })}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${form.bookSize === s.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}
                        >
                          <p className="font-display text-sm font-bold text-foreground">📘 {s.label}</p>
                          <p className="font-display text-lg font-bold text-primary">{s.displayPrice}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-body font-semibold">Cover *</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {[
                        { id: "softcover" as const, label: "Softcover", price: "Included", desc: "Lightweight & flexible" },
                        { id: "hardcover" as const, label: "Hardcover", price: "+ ₹200", desc: "Premium & durable" },
                      ].map(c => (
                        <button key={c.id} onClick={() => setForm({ ...form, coverType: c.id })}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${form.coverType === c.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}>
                          <p className="font-display text-sm font-bold text-foreground">{c.label}</p>
                          <p className="font-display text-base font-bold text-primary">{c.price}</p>
                          <p className="font-body text-xs text-muted-foreground">{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.bookSize && form.coverType && (
                    <div className="rounded-xl bg-primary/5 p-3 text-center">
                      <p className="font-body text-sm text-muted-foreground">Total</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        ₹{((bookSizeOptions.find(s => s.id === form.bookSize)?.price || 0) + (form.coverType === "hardcover" ? 200 : 0)).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 10: Finalize */}
            {step === 10 && (
              <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
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
                      {form.bookSize && <li>📐 Size: <span className="font-semibold text-foreground">{bookSizeOptions.find(s => s.id === form.bookSize)?.label} — {bookSizeOptions.find(s => s.id === form.bookSize)?.displayPrice}</span></li>}
                      {form.coverType && <li>📕 Cover: <span className="font-semibold text-foreground">{form.coverType === "softcover" ? "Softcover (included)" : "Hardcover (+ ₹200)"}</span></li>}
                      {form.songName && <li>🎵 Song: <span className="font-semibold text-foreground">{form.songName}</span></li>}
                      {form.photo && <li>📷 Subject photo: <span className="font-semibold text-foreground">Uploaded ✓</span></li>}
                      {form.memoryPhotos.length > 0 && <li>🖼️ Memory photos: <span className="font-semibold text-foreground">{form.memoryPhotos.length} added</span></li>}
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

                    const sizePriceMap: Record<string, number> = { "40": 1200, "60": 1500, "80": 1700, "100": 2000 };
                    const basePrice = sizePriceMap[form.bookSize] ?? 1200;
                    const price = basePrice + (form.coverType === "hardcover" ? 200 : 0);

                    // Upload subject photo to private storage so the AI can render their face
                    let photoUrl: string | null = null;
                    if (form.photo) {
                      const ext = form.photo.name.split(".").pop() || "jpg";
                      const path = `${user.id}/subject-${Date.now()}.${ext}`;
                      const { error: upErr } = await supabase.storage.from("subject-photos").upload(path, form.photo, { upsert: false });
                      if (!upErr) {
                        const { data: signed } = await supabase.storage.from("subject-photos").createSignedUrl(path, 60 * 60 * 24 * 7);
                        photoUrl = signed?.signedUrl ?? null;
                      }
                    }

                    const personalityDetails = [
                      form.occasion && `Occasion: ${form.occasion}`,
                      form.personality && `Personality: ${form.personality}`,
                      form.funnyQuirks && `Quirks: ${form.funnyQuirks}`,
                      form.favoriteThings && `Favorite things: ${form.favoriteThings}`,
                      form.hilariousMoment && `Funny moment: ${form.hilariousMoment}`,
                      form.bestFriends && `Best friends: ${form.bestFriends}`,
                      form.favoriteTreats && `Favorite treats: ${form.favoriteTreats}`,
                      form.sleepHabits && `Sleep habits: ${form.sleepHabits}`,
                      form.memorableAdventure && `Memorable adventure: ${form.memorableAdventure}`,
                      form.extraDetail1 && `Extra detail: ${form.extraDetail1}`,
                      form.extraDetail2 && `Extra detail: ${form.extraDetail2}`,
                      form.extraDetail3 && `Extra detail: ${form.extraDetail3}`,
                      form.songName && `Song: ${form.songName}${form.songWhy ? ` — ${form.songWhy}` : ""}${form.songLink ? ` (${form.songLink})` : ""}`,
                      form.memoryPhotos.length > 0 && `Memory photo captions: ${form.memoryPhotos.map(mp => mp.caption).filter(Boolean).join(" | ")}`,
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
                        photo_url: photoUrl,
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
