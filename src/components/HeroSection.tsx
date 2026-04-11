import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroChild from "@/assets/hero-child.jpg";

const HeroSection = () => {
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
            Answer a few questions, preview their story, and get a one-of-a-kind gift book delivered to your doorstep.
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
          <div className="relative">
            <img
              src={heroChild}
              alt="Happy person holding their personalized storybook"
              width={800}
              height={960}
              className="w-full max-w-md rounded-3xl shadow-book"
            />
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-coral">
                  <span className="text-sm">📖</span>
                </div>
                <div>
                  <p className="font-display text-xs font-semibold text-foreground">High-Quality Print</p>
                  <p className="font-body text-xs text-muted-foreground">Hardcover & Softcover</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
