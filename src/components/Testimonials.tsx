import { Star } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Sarah M.",
    role: "Mom of 2",
    text: "My daughter's face when she saw herself as the hero of her own adventure book — priceless! The illustrations were stunning and the story was so personal.",
    avatar: "👩",
  },
  {
    name: "James P.",
    role: "Gift-Giving Dad",
    text: "Ordered one for my son's birthday. He reads it every single night. The quality of the print exceeded my expectations. Will definitely order more!",
    avatar: "👨",
  },
  {
    name: "Emily R.",
    role: "Proud Grandma",
    text: "Made personalized books for all three grandchildren for Christmas. Each one was completely unique. They absolutely loved seeing their names in the stories!",
    avatar: "👵",
  },
];

const Testimonials = () => (
  <section className="py-20">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
          What Parents Are Saying
        </h2>
        <p className="mx-auto max-w-md font-body text-muted-foreground">
          Join thousands of happy families who've created magical memories.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-sunshine text-sunshine" />
              ))}
            </div>
            <p className="mb-5 font-body text-sm leading-relaxed text-foreground">"{r.text}"</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                {r.avatar}
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">{r.name}</p>
                <p className="font-body text-xs text-muted-foreground">{r.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
