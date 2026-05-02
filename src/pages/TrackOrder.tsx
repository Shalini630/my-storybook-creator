import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, CheckCircle2, Circle, Package, Sparkles, Printer, Truck, Home,
  MapPin, Phone, Calendar, Copy, ArrowLeft, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STAGES = [
  { key: "order_placed", label: "Order Placed", icon: Package, desc: "We've received your order." },
  { key: "story_generated", label: "Story Crafted", icon: Sparkles, desc: "Your personalized story & illustrations are ready." },
  { key: "printing", label: "Printing & Binding", icon: Printer, desc: "Your book is being printed and lovingly bound." },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your package is on its way." },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Your storybook has arrived!" },
];

const stageIndex = (stage: string) => Math.max(0, STAGES.findIndex((s) => s.key === stage));

const TrackOrder = () => {
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!orderId) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (error) {
        toast({ title: "Couldn't load order", description: error.message, variant: "destructive" });
      }
      setOrder(data);
      setLoading(false);
    };
    load();

    // Realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, orderId, navigate, toast]);

  const copyTracking = () => {
    if (!order?.tracking_number) return;
    navigator.clipboard.writeText(order.tracking_number);
    toast({ title: "Tracking number copied" });
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

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex-1 py-16 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Order not found</h1>
          <Button asChild variant="outline" className="mt-4 font-body">
            <Link to="/my-books"><ArrowLeft className="mr-2 h-4 w-4" /> Back to My Books</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIdx = stageIndex(order.production_stage || "order_placed");
  const progressPct = ((currentIdx + 1) / STAGES.length) * 100;
  const title = (order.story_content as any)?.title || `Book for ${order.name}`;
  const isDelivered = order.production_stage === "delivered";
  const isShipped = currentIdx >= stageIndex("shipped");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-10">
        <div className="container max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button asChild variant="ghost" size="sm" className="mb-2 font-body text-muted-foreground -ml-3">
                <Link to="/my-books"><ArrowLeft className="mr-1.5 h-4 w-4" /> My Books</Link>
              </Button>
              <h1 className="font-display text-3xl font-bold text-foreground">Track Your Order</h1>
              <p className="font-body text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge variant={isDelivered ? "default" : "secondary"} className="font-body">
              {STAGES[currentIdx]?.label}
            </Badge>
          </div>

          {/* Book summary */}
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                {(order.illustrations as string[])?.[0] ? (
                  <img src={(order.illustrations as string[])[0]} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-bold text-foreground">{title}</h3>
                <p className="font-body text-xs text-muted-foreground">
                  For {order.name} · {order.cover_type} · ₹{order.price}
                </p>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">
                  Ordered {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Production & Delivery Progress</CardTitle>
              <CardDescription className="font-body">
                {isDelivered ? "Delivered — we hope you love it! 💛" : `Stage ${currentIdx + 1} of ${STAGES.length}`}
              </CardDescription>
              <Progress value={progressPct} className="mt-3 h-2" />
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isFuture = idx > currentIdx;
                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          isDone ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                        }`}>
                          {isDone ? <CheckCircle2 className="h-5 w-5" />
                            : isCurrent ? <Icon className="h-5 w-5" />
                            : <Circle className="h-5 w-5" />}
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div className={`mt-1 h-10 w-0.5 ${idx < currentIdx ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-body font-semibold ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>
                            {stage.label}
                          </h4>
                          {isCurrent && !isDelivered && (
                            <Badge variant="secondary" className="font-body text-[10px]">In progress</Badge>
                          )}
                        </div>
                        <p className="font-body text-sm text-muted-foreground">{stage.desc}</p>
                        {stage.key === "shipped" && order.shipped_at && (
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            Shipped on {new Date(order.shipped_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        {stage.key === "delivered" && order.delivered_at && (
                          <p className="mt-1 font-body text-xs text-green-600">
                            Delivered on {new Date(order.delivered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-primary" /> Shipment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 font-body text-sm">
                {isShipped && order.tracking_number ? (
                  <>
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Tracking Number</p>
                        <p className="font-mono font-semibold">{order.tracking_number}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={copyTracking}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {order.courier_partner && (
                      <p><span className="text-muted-foreground">Courier:</span> {order.courier_partner}</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Tracking details will appear here once your book ships.</p>
                )}
                {order.estimated_delivery && !isDelivered && (
                  <p className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 font-body text-sm">
                {order.shipping_name ? (
                  <>
                    <p className="font-semibold text-foreground">{order.shipping_name}</p>
                    <p className="text-muted-foreground">{order.shipping_address}</p>
                    <p className="text-muted-foreground">
                      {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ""} {order.shipping_pincode}
                    </p>
                    {order.shipping_phone && (
                      <p className="flex items-center gap-1.5 pt-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {order.shipping_phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No shipping address on file.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="font-body">
              <Link to={`/preview/${order.id}`}>Preview Book</Link>
            </Button>
            <Button asChild variant="ghost" className="font-body">
              <Link to="/contact">Need help? Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
