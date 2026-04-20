import { useState } from "react";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent! 💌",
      description: "We'll get back to you within 24 hours.",
    });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">Get in Touch</h1>
            <p className="mx-auto max-w-md font-body text-muted-foreground">Have a question or need help? We'd love to hear from you.</p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Email Us</h3>
                  <p className="font-body text-sm text-muted-foreground">shalma63000@gmail.com</p>
                  <p className="font-body text-xs text-muted-foreground">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">WhatsApp</h3>
                  <p className="font-body text-sm text-muted-foreground">+91 7021050765</p>
                  <p className="font-body text-xs text-muted-foreground">For bulk orders & return gifts</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Location</h3>
                  <p className="font-body text-sm text-muted-foreground">Navi Mumbai, India</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label className="font-body font-semibold">Your Name</Label>
                <Input placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" required />
              </div>
              <div>
                <Label className="font-body font-semibold">Email</Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5" required />
              </div>
              <div>
                <Label className="font-body font-semibold">Message</Label>
                <textarea
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  required
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
