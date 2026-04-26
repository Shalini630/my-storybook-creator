import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Camera, CreditCard, Package, User as UserIcon, Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const load = async () => {
      const [{ data: profile }, { data: orderData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profile) {
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url);
      } else {
        setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      }
      setOrders(orderData || []);
      setLoading(false);
    };

    load();
  }, [user, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("subject-photos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage.from("subject-photos").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = signed?.signedUrl ?? null;

      const { error: updErr } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, avatar_url: url, display_name: displayName, email: user.email }, { onConflict: "user_id" });
      if (updErr) throw updErr;

      setAvatarUrl(url);
      toast({ title: "Profile photo updated! 📸" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, display_name: displayName, email: user.email, avatar_url: avatarUrl },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      toast({ title: "Profile saved ✓" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === "paid" || o.paid_at);
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const initials = (displayName || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-4xl space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
            <p className="font-body text-muted-foreground">Manage your account, photo, and view payment history.</p>
          </div>

          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-xl">
                  <UserIcon className="h-5 w-5 text-primary" /> Account Details
                </CardTitle>
                <CardDescription className="font-body">Update your photo and personal info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                      <AvatarFallback className="bg-gradient-primary font-display text-2xl text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="name" className="font-body">Display Name</Label>
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Email</Label>
                      <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-body text-sm text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">{orders.length}</div>
                  <div className="font-body text-xs text-muted-foreground">Total Books</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">{paidOrders.length}</div>
                  <div className="font-body text-xs text-muted-foreground">Paid Orders</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="font-display text-2xl font-bold text-foreground">₹{totalSpent}</div>
                <div className="font-body text-xs text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" /> Payment History
              </CardTitle>
              <CardDescription className="font-body">All your past purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              {paidOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground">No payments yet.</p>
                  <Button asChild variant="outline" size="sm" className="font-body">
                    <Link to="/create">Create your first book</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {paidOrders.map((order) => {
                    const title = (order.story_content as any)?.title || `Book for ${order.name}`;
                    return (
                      <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm font-medium text-foreground">{title}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            {new Date(order.paid_at || order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                            {order.payment_id && ` · ID: ${String(order.payment_id).slice(-10)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-base font-bold text-foreground">₹{order.price}</div>
                          <span className="font-body text-xs text-green-600">Paid</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
