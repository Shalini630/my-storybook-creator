import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Copy, Check, Megaphone, Mail, Target, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ContentType = "social" | "email" | "ads";

const TYPE_META: Record<ContentType, { label: string; icon: typeof Megaphone; desc: string }> = {
  social: { label: "Social Media", icon: Megaphone, desc: "Instagram, Facebook & X posts" },
  email: { label: "Email Campaign", icon: Mail, desc: "Subject lines + body copy" },
  ads: { label: "Ad Copy", icon: Target, desc: "Google & Meta ads" },
};

const AdminMarketing = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { toast } = useToast();

  const [activeType, setActiveType] = useState<ContentType>("social");
  const [audience, setAudience] = useState("Parents of kids 4-10");
  const [occasion, setOccasion] = useState("Birthday gift");
  const [tone, setTone] = useState("Warm, playful, premium");
  const [extraNotes, setExtraNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md">
            <CardHeader className="items-center text-center">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <CardTitle className="font-display">Admin Access Only</CardTitle>
              <CardDescription className="font-body">
                This area is restricted. Sign in with the admin account to continue.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setContent("");
    setCopied(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-marketing", {
        body: { type: activeType, audience, occasion, tone, extraNotes },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setContent((data as any)?.content || "");
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard ✓" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-5xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">AI Marketing Studio</h1>
              <p className="font-body text-sm text-muted-foreground">
                Generate on-brand social posts, emails, and ads in seconds.
              </p>
            </div>
          </div>

          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ContentType)}>
            <TabsList className="grid w-full grid-cols-3">
              {(Object.keys(TYPE_META) as ContentType[]).map((t) => {
                const Icon = TYPE_META[t].icon;
                return (
                  <TabsTrigger key={t} value={t} className="font-body">
                    <Icon className="mr-1.5 h-4 w-4" /> {TYPE_META[t].label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(TYPE_META) as ContentType[]).map((t) => (
              <TabsContent key={t} value={t} className="mt-4">
                <p className="font-body text-sm text-muted-foreground">{TYPE_META[t].desc}</p>
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Campaign Brief</CardTitle>
                <CardDescription className="font-body">Tell the AI what to write about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="audience" className="font-body">Target Audience</Label>
                  <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Parents of kids 4-10" className="font-body" />
                </div>
                <div>
                  <Label htmlFor="occasion" className="font-body">Occasion / Theme</Label>
                  <Input id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="e.g. Diwali, Anniversary, Birthday" className="font-body" />
                </div>
                <div>
                  <Label htmlFor="tone" className="font-body">Tone</Label>
                  <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. Warm, playful, premium" className="font-body" />
                </div>
                <div>
                  <Label htmlFor="notes" className="font-body">Extra Notes (optional)</Label>
                  <Textarea id="notes" value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} placeholder="Any offers, deadlines, or specific angles..." rows={3} className="font-body" />
                </div>
                <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                  {generating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate {TYPE_META[activeType].label}</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="font-display text-lg">Generated Content</CardTitle>
                  <CardDescription className="font-body">Copy and paste anywhere.</CardDescription>
                </div>
                {content && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="font-body">
                    {copied ? <Check className="mr-1.5 h-4 w-4 text-green-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generating && !content ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : content ? (
                  <motion.pre
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-4 font-body text-sm text-foreground"
                  >
                    {content}
                  </motion.pre>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                    <p className="font-body text-sm text-muted-foreground">
                      Fill in the brief and click Generate to see your content here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminMarketing;
