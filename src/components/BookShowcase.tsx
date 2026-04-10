import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import bookCover4 from "@/assets/book-cover-4.jpg";
import bookCover5 from "@/assets/book-cover-5.jpg";
import bookCover6 from "@/assets/book-cover-6.jpg";
import bookCover7 from "@/assets/book-cover-7.jpg";
import bookCover8 from "@/assets/book-cover-8.jpg";

const kidBooks = [
  { img: bookCover1, title: "The Adventures of Emma", theme: "Enchanted Forest" },
  { img: bookCover2, title: "Leo's Sky Adventure", theme: "Dragon Rider" },
  { img: bookCover3, title: "Mia's Ocean Quest", theme: "Underwater Kingdom" },
  { img: bookCover4, title: "Sam's Space Journey", theme: "Outer Space" },
  { img: bookCover5, title: "Jake's Hero Story", theme: "Superhero City" },
  { img: bookCover6, title: "Dino Discovery", theme: "Dinosaur World" },
  { img: bookCover7, title: "Lily's Magic Garden", theme: "Fairy Garden" },
  { img: bookCover8, title: "Captain's Treasure", theme: "Pirate Adventure" },
];

const adultBooks = [
  { img: bookCover1, title: "Letters to My Love", theme: "Romance" },
  { img: bookCover2, title: "The Last Clue", theme: "Mystery Thriller" },
  { img: bookCover3, title: "Wanderlust Diaries", theme: "Travel Memoir" },
  { img: bookCover4, title: "Beyond the Stars", theme: "Sci-Fi Epic" },
  { img: bookCover5, title: "Laugh Out Loud", theme: "Comedy & Satire" },
  { img: bookCover6, title: "My Life, My Story", theme: "Life Story" },
  { img: bookCover7, title: "The Enchanted Realm", theme: "Fantasy Quest" },
  { img: bookCover8, title: "Rise & Shine", theme: "Inspirational" },
];

const BookShowcase = () => {
  const [tab, setTab] = useState<"kids" | "adults">("kids");
  const books = tab === "kids" ? kidBooks : adultBooks;

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
            Explore Our Book Themes
          </h2>
          <p className="mx-auto max-w-md font-body text-muted-foreground">
            Each book is uniquely generated with beautiful illustrations tailored to your story.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {[
              { id: "kids" as const, label: "👶 For Kids", desc: "Ages 2-10" },
              { id: "adults" as const, label: "🧑 For Adults", desc: "All genres" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-6 py-2.5 font-body text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-gradient-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {books.map((book, i) => (
            <motion.div
              key={`${tab}-${book.title}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative mb-3 overflow-hidden rounded-2xl shadow-book transition-transform duration-300 group-hover:scale-105">
                <img
                  src={book.img}
                  alt={book.title}
                  loading="lazy"
                  width={640}
                  height={800}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{book.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{book.theme}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-gradient-primary px-8 font-body font-bold text-primary-foreground hover:opacity-90">
            <Link to="/create">Create Your Own Book</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookShowcase;
