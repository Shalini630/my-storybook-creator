import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroKid from "@/assets/hero-kid.jpg";
import heroWoman from "@/assets/hero-woman.jpg";
import heroCouple from "@/assets/hero-couple.jpg";
import heroDad from "@/assets/hero-dad.jpg";
import heroGrandma from "@/assets/hero-grandma.jpg";

const heroSlides = [
  { img: heroKid, alt: "Smiling child holding a personalized storybook with their own face illustrated inside", caption: "Your child as the hero" },
  { img: heroWoman, alt: "Young woman holding a personalized storybook with her own portrait inside", caption: "Her, painted into every page" },
  { img: heroCouple, alt: "Couple holding a personalized storybook with both of them illustrated inside", caption: "Your love story, illustrated" },
  { img: heroDad, alt: "Father holding a personalized storybook with his own face illustrated inside", caption: "A book starring Dad" },
  { img: heroGrandma, alt: "Grandmother holding a personalized storybook with her own face illustrated inside", caption: "Her life, lovingly written" },
];

const HeroSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % heroSlides.length), 3500);
    return () => clearInterval(id);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Decorative floating shapes */}
      <div className="absolute left-10 top-20 h-16 w-16 animate-float rounded-full bg-sunshine/20" />
      <div className="absolute right-20 top-40 h-12 w-12 animate-wiggle rounded-full bg-coral/20" />
      <div className="absolute bottom-20 left-1/4 h-10 w-10 animate-float rounded-full bg-lavender/20" style={{ animationDelay: "1s" }} />

      <div className="container grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-body text-sm font-semibold text-primary">8,000+ personalized books created</span>
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Make them the{" "}
            <span className="text-gradient-warm">star</span>{" "}
            of a personalized book
          </h1>

          <p className="mb-6 max-w-lg font-body text-lg text-muted-foreground">
            Upload their photo, answer a few questions, and we'll write — and illustrate — a one-of-a-kind book where their face appears inside the story.
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="bg-gradient-primary px-8 font-body text-lg font-bold text-primary-foreground shadow-book hover:opacity-90">
              <Link to="/create">Create Your Book</Link>
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-sunshine text-sunshine" />
              ))}
              <span className="ml-2 font-body text-sm font-semibold text-foreground">4.9/5</span>
              <span className="font-body text-sm text-muted-foreground">· by happy gifters</span>
            </div>
          </div>

          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Introducing Children's Books →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative w-full max-w-md">
            <div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl shadow-book">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide.img}
                  src={slide.img}
                  alt={slide.alt}
                  width={800}
                  height={960}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>

            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card/95 px-4 py-2 shadow-lg backdrop-blur">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-coral">
                <span className="text-xs">📖</span>
              </div>
              <p className="font-display text-xs font-semibold text-foreground">{slide.caption}</p>
            </div>

            <div className="mt-8 flex justify-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
