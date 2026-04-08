import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="py-20">
    <div className="container">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-primary p-10 text-center md:p-16">
        <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
          Ready to Create Magic?
        </h2>
        <p className="mb-8 font-body text-primary-foreground/80">
          Give your child a gift they'll treasure forever — a book where they're the star.
        </p>
        <Button asChild size="lg" className="bg-card px-10 font-body text-lg font-bold text-foreground shadow-book hover:bg-card/90">
          <Link to="/create">Create Your Book Now ✨</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default CTASection;
