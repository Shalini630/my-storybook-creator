import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

interface StoryContent {
  title: string;
  pages: StoryPage[];
}

const BookPreview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState("");

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
      setLoading(false);

      // If still generating, poll every 5s
      if (data.status === "generating" || data.status === "pending") {
        const interval = setInterval(async () => {
          const { data: updated } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (updated) {
            setOrder(updated);
            if (updated.status === "preview" || updated.status === "failed") {
              clearInterval(interval);
            }
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    };

    fetchOrder();
  }, [orderId]);

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
          <h2 className="font-display text-2xl font-bold text-foreground">Creating Your Book...</h2>
          <p className="max-w-md text-center font-body text-muted-foreground">
            Our AI is writing your personalized story and creating beautiful illustrations. This may take 1-2 minutes.
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
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
          <p className="font-body text-muted-foreground">Please try again or contact support.</p>
          <Button onClick={() => navigate("/create")}>Try Again</Button>
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

          {/* Book Preview */}
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
                {/* Illustration */}
                {illustrations[currentPage] && (
                  <img
                    src={illustrations[currentPage]}
                    alt={`Page ${currentPage + 1} illustration`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                {!illustrations[currentPage] && (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-secondary">
                    <p className="font-body text-sm text-muted-foreground">Illustration unavailable</p>
                  </div>
                )}

                {/* Text */}
                <div className="p-6">
                  <p className="font-body text-base leading-relaxed text-foreground">
                    {story.pages[currentPage].text}
                  </p>
                  <p className="mt-4 text-right font-display text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Page Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="gap-2 font-body"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex gap-1.5">
                {story.pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="gap-2 font-body"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Finalize Section */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">Love Your Book?</h3>
            <p className="mb-4 font-body text-muted-foreground">
              Price: <span className="font-bold text-foreground">{order.cover_type === "hardcover" ? "₹1,299" : "₹999"}</span> ({order.cover_type})
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => navigate("/create")} className="font-body">
                Start Over
              </Button>
              <Button className="gap-2 bg-gradient-primary font-body font-bold text-primary-foreground shadow-book hover:opacity-90">
                <Check className="h-4 w-4" /> Confirm & Pay
              </Button>
            </div>
            <p className="mt-3 font-body text-xs text-muted-foreground">
              Payment integration coming soon. Your book has been saved.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookPreview;
