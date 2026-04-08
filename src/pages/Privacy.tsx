import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="flex-1 py-16">
      <div className="container max-w-3xl">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">Privacy Policy</h1>
        <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground">Last updated: April 8, 2026</p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>When you use StoryStar, we collect information you provide directly, including your child's name, age, interests, and any photos you upload. We also collect your email address, shipping address, and payment information when you place an order.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Create personalized books for your child</li>
              <li>Process and deliver your orders</li>
              <li>Send order updates and shipping notifications</li>
              <li>Improve our products and services</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">3. Data Protection</h2>
            <p>We take the security of your data seriously. All personal information is encrypted in transit and at rest. We never sell your personal information to third parties. Photos uploaded for book creation are used solely for that purpose and can be deleted upon request.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">4. Children's Privacy</h2>
            <p>We are committed to protecting children's privacy. We do not knowingly collect information from children under 13 without parental consent. All child information is provided by parents or guardians and is used exclusively for book personalization.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">5. Cookies</h2>
            <p>We use essential cookies to ensure our website functions properly. We may also use analytics cookies to understand how visitors interact with our site. You can control cookie preferences through your browser settings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at privacy@storystar.com.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@storystar.com" className="text-primary hover:underline">privacy@storystar.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
