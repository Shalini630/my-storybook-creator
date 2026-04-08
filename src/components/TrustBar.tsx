import { Truck, BookOpen, Heart } from "lucide-react";

const items = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: BookOpen, label: "Premium Print Quality" },
  { icon: Heart, label: "Satisfaction Guaranteed" },
];

const TrustBar = () => (
  <section className="border-y border-border bg-card py-6">
    <div className="container flex flex-wrap items-center justify-center gap-8 md:gap-16">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-body text-sm font-semibold text-foreground">{label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBar;
