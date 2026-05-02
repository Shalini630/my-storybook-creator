import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, Eye, CreditCard, Clock, CheckCircle, AlertCircle, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-500" },
  generating: { label: "Generating", icon: Loader2, color: "text-blue-500" },
  preview: { label: "Ready to Pay", icon: Eye, color: "text-primary" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-green-500" },
  failed: { label: "Failed", icon: AlertCircle, color: "text-destructive" },
};

const MyBooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Books</h1>
              <p className="font-body text-muted-foreground">All your personalized storybooks in one place.</p>
            </div>
            <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
              <Link to="/create">Create New Book</Link>
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-12">
              <Book className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-display text-xl font-bold text-foreground">No books yet</h3>
              <p className="font-body text-muted-foreground">Create your first personalized storybook!</p>
              <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground">
                <Link to="/create">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order, index) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const storyTitle = (order.story_content as any)?.title || `Book for ${order.name}`;
                const illustration = (order.illustrations as string[])?.[0];

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-book"
                  >
                    {/* Thumbnail */}
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {illustration ? (
                        <img src={illustration} alt={storyTitle} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Book className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground">{storyTitle}</h3>
                        <p className="font-body text-xs text-muted-foreground">
                          For {order.name} · {order.audience === "kid" ? "Kids" : "Adults"} · {order.cover_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`flex items-center gap-1 font-body text-xs font-medium ${status.color}`}>
                          <StatusIcon className={`h-3.5 w-3.5 ${order.status === "generating" ? "animate-spin" : ""}`} />
                          {status.label}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {order.paid_at && (
                          <span className="flex items-center gap-1 font-body text-xs text-green-600">
                            <CreditCard className="h-3 w-3" />
                            Paid ₹{order.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 flex-col items-stretch gap-1.5">
                      {(order.status === "preview" || order.status === "paid") && (
                        <Button variant="outline" size="sm" asChild className="font-body text-xs">
                          <Link to={`/preview/${order.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            {order.status === "paid" ? "Read" : "Preview"}
                          </Link>
                        </Button>
                      )}
                      {order.status === "paid" && (
                        <Button size="sm" asChild className="bg-gradient-primary font-body text-xs text-primary-foreground hover:opacity-90">
                          <Link to={`/track/${order.id}`}>
                            <Truck className="mr-1.5 h-3.5 w-3.5" />
                            Track Order
                          </Link>
                        </Button>
                      )}
                      {order.status === "generating" && (
                        <Button variant="outline" size="sm" asChild className="font-body text-xs">
                          <Link to={`/preview/${order.id}`}>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            View Progress
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyBooks;
