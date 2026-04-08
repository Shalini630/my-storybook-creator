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

const books = [
  { img: bookCover1, title: "The Adventures of Emma", theme: "Enchanted Forest" },
  { img: bookCover2, title: "Leo's Sky Adventure", theme: "Dragon Rider" },
  { img: bookCover3, title: "Mia's Ocean Quest", theme: "Underwater Kingdom" },
  { img: bookCover4, title: "Sam's Space Journey", theme: "Outer Space" },
  { img: bookCover5, title: "Jake's Hero Story", theme: "Superhero City" },
  { img: bookCover6, title: "Dino Discovery", theme: "Dinosaur World" },
  { img: bookCover7, title: "Lily's Magic Garden", theme: "Fairy Garden" },
  { img: bookCover8, title: "Captain's Treasure", theme: "Pirate Adventure" },
];

const BookShowcase = () => (
  <section className="bg-secondary/50 py-20">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
          Explore Our Book Themes
        </h2>
        <p className="mx-auto max-w-md font-body text-muted-foreground">
          Each book is uniquely generated with beautiful illustrations tailored to your child.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {books.map((book, i) => (
          <motion.div
            key={book.title}
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

export default BookShowcase;
