import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="flex-1 py-16">
      <div className="container max-w-3xl">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">Terms of Service</h1>
        <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground">Last updated: April 8, 2026</p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing and using StoryStar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">2. Our Services</h2>
            <p>StoryStar provides personalized children's books created using information you provide, including your child's name, age, interests, and photos. Each book is uniquely generated and printed to order.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">3. Orders & Payments</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>All prices are displayed in the applicable currency and include taxes where required</li>
              <li>Payment is processed securely at the time of order</li>
              <li>You will receive an order confirmation via email</li>
              <li>We reserve the right to cancel orders if information provided is incomplete or inappropriate</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">4. Personalization Content</h2>
            <p>You are responsible for the accuracy and appropriateness of all personalization content you provide. We reserve the right to refuse any content that is offensive, inappropriate, or violates any applicable laws.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">5. Shipping & Delivery</h2>
            <p>We aim to deliver all orders within the estimated timeframe provided at checkout. Delivery times may vary based on your location. We are not responsible for delays caused by shipping carriers or customs.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">6. Returns & Refunds</h2>
            <p>Due to the personalized nature of our products, we cannot accept returns. However, if your book arrives damaged or with printing errors, please contact us within 14 days of delivery for a replacement or refund.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">7. Intellectual Property</h2>
            <p>All content, illustrations, and designs on StoryStar are owned by us or our licensors. You may not reproduce, distribute, or create derivative works without our written permission.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">8. Contact</h2>
            <p>For questions about these terms, email us at <a href="mailto:legal@storystar.com" className="text-primary hover:underline">legal@storystar.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
