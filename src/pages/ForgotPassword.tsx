import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Email sent! 📧", description: "Check your inbox for a reset link." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="font-body text-muted-foreground">Enter your email and we'll send a reset link.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-4xl">📬</p>
                <p className="font-body text-foreground font-semibold">Check your inbox!</p>
                <p className="font-body text-sm text-muted-foreground">We sent a reset link to <span className="font-semibold">{email}</span></p>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/auth"><ArrowLeft className="h-4 w-4" /> Back to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="font-body font-semibold">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="text-center">
                  <Link to="/auth" className="font-body text-sm text-muted-foreground hover:text-foreground">← Back to Sign In</Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
