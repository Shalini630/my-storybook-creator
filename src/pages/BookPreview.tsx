import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, RefreshCw, RotateCcw, Share2, MessageCircle, Facebook, Link as LinkIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

interface StoryContent {
  title: string;
  pages: StoryPage[];
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir", "Ladakh",
];

const BookPreview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [regeneratingPage, setRegeneratingPage] = useState<number | null>(null);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [address, setAddress] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    shipping_phone: "",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (fetchError || !data) {
        setError("Order not found");
        setLoading(false);
        return;
      }

      setOrder(data);
      if (data.shipping_name) {
        setAddress({
          shipping_name: data.shipping_name || "",
          shipping_address: data.shipping_address || "",
          shipping_city: data.shipping_city || "",
          shipping_state: data.shipping_state || "",
          shipping_pincode: data.shipping_pincode || "",
          shipping_phone: data.shipping_phone || "",
        });
      }
      setLoading(false);

      // Show address form after payment if no address saved
      if (data.status === "paid" && !data.shipping_name) {
        setShowAddressForm(true);
      }

      if (data.status === "generating" || data.status === "pending") {
        const interval = setInterval(async () => {
          const { data: updated } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (updated) {
            setOrder(updated);
            if (updated.status !== "generating" && updated.status !== "pending") {
              clearInterval(interval);
            }
          }
        }, 3000);

        return () => clearInterval(interval);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleRegeneratePage = async () => {
    if (!orderId || regeneratingPage !== null) return;
    setRegeneratingPage(currentPage);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("regenerate-page", {
        body: { orderId, pageIndex: currentPage, mode: "page" },
      });
      if (fnError || !data?.success) throw new Error(fnError?.message || "Failed to regenerate page");
      setOrder((prev: any) => ({ ...prev, story_content: data.story, illustrations: data.illustrations }));
      toast({ title: "Page regenerated! ✨" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRegeneratingPage(null);
    }
  };

  const handleRegenerateAll = async () => {
    if (!orderId || regeneratingAll) return;
    setRegeneratingAll(true);
    setOrder((prev: any) => ({ ...prev, status: "generating" }));
    try {
      const { data, error: fnError } = await supabase.functions.invoke("regenerate-page", {
        body: { orderId, mode: "full" },
      });
      if (fnError || !data?.success) throw new Error(fnError?.message || "Failed to regenerate story");
      setOrder((prev: any) => ({ ...prev, status: "preview", story_content: data.story, illustrations: data.illustrations }));
      setCurrentPage(0);
      toast({ title: "New story generated! 📖" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setOrder((prev: any) => ({ ...prev, status: "preview" }));
    } finally {
      setRegeneratingAll(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId || paying) return;
    setPaying(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { orderId },
      });
      if (fnError || !data) throw new Error(fnError?.message || "Failed to create payment order");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "KahaaniSeKitab",
        description: `Personalized Book for ${order?.name}`,
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              },
            });
            if (verifyError) throw verifyError;
            toast({ title: "Payment Successful! 🎉" });
            setOrder((prev: any) => ({ ...prev, status: "paid" }));
            setShowAddressForm(true);
          } catch (err: any) {
            toast({ title: "Payment verification failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: { name: order?.name || "" },
        theme: { color: "#F97316" },
        modal: { ondismiss: () => setPaying(false) },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
emi: false,
          paylater: true,
        },
        config: {
          display: {
            blocks: {
              upi_id: {
                name: "Pay using UPI ID",
                instruments: [
                  { method: "upi", flows: ["collect", "intent"] },
                ],
              },
              upi_qr: {
                name: "Scan QR to Pay",
                instruments: [
                  { method: "upi", flows: ["qr"] },
                ],
              },
            },
            sequence: ["block.upi_id", "block.upi_qr"],
            preferences: { show_default_blocks: true },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setPaying(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!address.shipping_name || !address.shipping_address || !address.shipping_city || !address.shipping_state || !address.shipping_pincode || !address.shipping_phone) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSavingAddress(true);
    const { error } = await supabase
      .from("orders")
      .update(address as any)
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error saving address", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Address saved! 📦", description: "We'll ship your book to this address." });
      setShowAddressForm(false);
      setOrder((prev: any) => ({ ...prev, ...address }));
    }
    setSavingAddress(false);
  };

  const shareUrl = `${window.location.origin}/preview/${orderId}`;
  const shareText = `Check out this personalized book I created on KahaaniSeKitab! 📖✨`;

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied! 🔗" });
        return;
    }
    if (url) window.open(url, "_blank");
  };

  const story = order?.story_content as StoryContent | null;
  const illustrations = (order?.illustrations as string[]) || [];

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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="font-display text-xl text-destructive">{error}</p>
          <Button onClick={() => navigate("/create")}>Create a New Book</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (order?.status === "generating" || order?.status === "pending") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            {regeneratingAll ? "Regenerating Your Book..." : "Creating Your Book..."}
          </h2>
          <p className="max-w-md text-center font-body text-muted-foreground">
            Our AI is writing your personalized story and creating beautiful illustrations. This may take 1-2 minutes.
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="h-3 w-3 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (order?.status === "failed") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="font-display text-xl text-destructive">Something went wrong generating your book.</p>
          <Button onClick={() => navigate("/create")}>Try Again</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Paid + address form
  if (order?.status === "paid" && showAddressForm) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Where should we ship your book?</h2>
          <p className="font-body text-muted-foreground">Enter your delivery address to complete the order.</p>

          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
            <div>
              <Label className="font-body font-semibold">Full Name</Label>
              <Input placeholder="e.g. Aarav Sharma" value={address.shipping_name} onChange={e => setAddress({ ...address, shipping_name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="font-body font-semibold">Address</Label>
              <textarea
                placeholder="House/Flat No., Street, Landmark"
                value={address.shipping_address}
                onChange={e => setAddress({ ...address, shipping_address: e.target.value })}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body font-semibold">City</Label>
                <Input placeholder="e.g. Mumbai" value={address.shipping_city} onChange={e => setAddress({ ...address, shipping_city: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">State</Label>
                <select
                  value={address.shipping_state}
                  onChange={e => setAddress({ ...address, shipping_state: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select state</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body font-semibold">PIN Code</Label>
                <Input placeholder="e.g. 400001" value={address.shipping_pincode} onChange={e => setAddress({ ...address, shipping_pincode: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body font-semibold">Phone</Label>
                <Input placeholder="e.g. 9876543210" value={address.shipping_phone} onChange={e => setAddress({ ...address, shipping_phone: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={handleSaveAddress} disabled={savingAddress} className="w-full gap-2 bg-gradient-primary font-body font-bold text-primary-foreground hover:opacity-90">
              {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {savingAddress ? "Saving..." : "Save Address & Complete Order"}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Paid confirmation (address already saved)
  if (order?.status === "paid") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Order Confirmed! 🎉</h2>
          <p className="max-w-md text-center font-body text-muted-foreground">
            Your personalized book for <span className="font-semibold text-foreground">{order.name}</span> has been ordered.
            {order.shipping_name && <> Shipping to <span className="font-semibold text-foreground">{order.shipping_city}, {order.shipping_state}</span>.</>}
          </p>

          {/* Share buttons */}
          <div className="flex items-center gap-3">
            <p className="font-body text-sm text-muted-foreground">Share:</p>
            <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="gap-1.5 font-body text-xs">
              <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("facebook")} className="gap-1.5 font-body text-xs">
              <Facebook className="h-4 w-4 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("copy")} className="gap-1.5 font-body text-xs">
              <LinkIcon className="h-4 w-4" /> Copy Link
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setShowAddressForm(true); }} className="font-body">
              {order.shipping_name ? "Update Address" : "Add Address"}
            </Button>
            <Button onClick={() => navigate("/my-books")} className="bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
              View My Books
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-body text-muted-foreground">No story content found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPages = story.pages.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">{story.title}</h1>
            <p className="font-body text-muted-foreground">
              A personalized story for <span className="font-semibold text-foreground">{order.name}</span>
            </p>
          </div>

          <div className="relative mx-auto max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, rotateY: -10 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 10 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-book"
              >
                {regeneratingPage === currentPage ? (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="font-body text-sm text-muted-foreground">Regenerating page...</p>
                    </div>
                  </div>
                ) : illustrations[currentPage] ? (
                  <img src={illustrations[currentPage]} alt={`Page ${currentPage + 1}`} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-secondary">
                    <p className="font-body text-sm text-muted-foreground">Illustration unavailable</p>
                  </div>
                )}

                <div className="p-6">
                  <p className="font-body text-base leading-relaxed text-foreground">{story.pages[currentPage].text}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={handleRegeneratePage} disabled={regeneratingPage !== null}
                      className="gap-1.5 font-body text-xs text-muted-foreground hover:text-primary">
                      <RefreshCw className={`h-3.5 w-3.5 ${regeneratingPage === currentPage ? "animate-spin" : ""}`} />
                      Regenerate this page
                    </Button>
                    <p className="font-display text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="gap-2 font-body">
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex gap-1.5">
                {story.pages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-border hover:bg-muted-foreground"}`} />
                ))}
              </div>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="gap-2 font-body">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">Love Your Book?</h3>
            <p className="mb-4 font-body text-muted-foreground">
              Price: <span className="font-bold text-foreground">{order.cover_type === "hardcover" ? "₹1,299" : "₹999"}</span> ({order.cover_type})
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={handleRegenerateAll} disabled={regeneratingAll || regeneratingPage !== null} className="gap-2 font-body">
                <RotateCcw className={`h-4 w-4 ${regeneratingAll ? "animate-spin" : ""}`} />
                Regenerate Entire Book
              </Button>
              <Button variant="outline" onClick={() => navigate("/create")} className="font-body">Start Over</Button>
              <Button onClick={handlePayment} disabled={paying || regeneratingPage !== null || regeneratingAll}
                className="gap-2 bg-gradient-primary font-body font-bold text-primary-foreground shadow-book hover:opacity-90">
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {paying ? "Processing..." : "Confirm & Pay"}
              </Button>
            </div>

            {/* Share preview */}
            <div className="mt-4 flex items-center justify-center gap-3 border-t border-border pt-4">
              <span className="font-body text-sm text-muted-foreground">Share preview:</span>
              <Button variant="ghost" size="sm" onClick={() => handleShare("whatsapp")} className="gap-1 text-xs">
                <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")} className="gap-1 text-xs">
                <Facebook className="h-4 w-4 text-blue-600" /> Facebook
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare("copy")} className="gap-1 text-xs">
                <LinkIcon className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookPreview;
