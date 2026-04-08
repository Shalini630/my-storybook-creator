import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How does it work?", a: "Simply answer a few fun questions about your child — their name, age, interests, and favorite things. Our AI creates a unique story and beautiful illustrations, then we professionally print and ship the book to you." },
  { q: "How long does it take?", a: "Your book preview is generated instantly. Once you approve and order, printing takes 3-5 business days, plus shipping time depending on your location." },
  { q: "How much does it cost?", a: "Books start at $34.99 for softcover and $44.99 for hardcover. Shipping costs are calculated at checkout based on your location." },
  { q: "What age is this for?", a: "Our books are perfect for children aged 2-10. We tailor the story complexity and vocabulary based on the age you provide." },
  { q: "Can I customize the illustrations?", a: "Yes! You can choose the art style, theme, and even describe how you'd like the character to look. We'll create illustrations that match your child." },
  { q: "Is this a real printed book?", a: "Absolutely! Every book is professionally printed on high-quality paper with vibrant colors. Available in both softcover and hardcover formats." },
];

const FAQSection = () => (
  <section className="bg-secondary/50 py-20">
    <div className="container max-w-2xl">
      <h2 className="mb-10 text-center font-display text-3xl font-bold text-foreground md:text-4xl">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="font-body text-sm text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
