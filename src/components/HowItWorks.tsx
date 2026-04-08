import { motion } from "framer-motion";
import { MessageSquare, Palette, Package } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: MessageSquare,
    title: "Tell Us About Your Child",
    desc: "Share their name, age, interests, and favorite things. We'll use these to craft their unique story.",
    color: "bg-primary/10 text-primary",
  },
  {
    num: 2,
    icon: Palette,
    title: "Pick Your Theme & Style",
    desc: "Choose from magical adventures, space journeys, ocean quests, and more. Customize the cover and illustrations.",
    color: "bg-coral/10 text-coral",
  },
  {
    num: 3,
    icon: Package,
    title: "Receive Your Printed Book",
    desc: "We professionally print and ship your personalized storybook in a beautiful package, ready to gift.",
    color: "bg-sky/10 text-sky",
  },
];

const HowItWorks = () => (
  <section className="py-20">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
          How It Works
        </h2>
        <p className="mx-auto max-w-md font-body text-muted-foreground">
          It's that simple — just answer, customize, and get it delivered.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="relative rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-card-hover"
          >
            <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
              {step.num}
            </div>
            <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}>
              <step.icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
