import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Reminder messages by level
const reminderMessages = [
  {
    subject: "Your story is waiting ❤️",
    body: "Hey! Your story is waiting to be completed. Pick up where you left off and create something beautiful.",
  },
  {
    subject: "This isn't just a book… ✨",
    body: "This isn't just a book… it's a memory in the making. Don't leave it unfinished.",
  },
  {
    subject: "Still thinking? 🎁",
    body: "Still thinking? Complete your book today! We saved it just for you.",
  },
  {
    subject: "Last chance to complete your story 💔",
    body: "Last chance to complete your story. We saved it just for you — don't let this memory fade away.",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Find unpaid orders older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all unpaid orders that don't have a completed abandoned_cart entry
    const { data: unpaidOrders, error: ordersError } = await adminClient
      .from("orders")
      .select("id, user_id, name, created_at, cover_type, theme")
      .is("paid_at", null)
      .lt("created_at", oneHourAgo)
      .order("created_at", { ascending: true })
      .limit(100);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    console.log(`Found ${unpaidOrders?.length || 0} unpaid orders`);

    let sentCount = 0;

    for (const order of unpaidOrders || []) {
      // Check/create abandoned cart entry
      const { data: existing } = await adminClient
        .from("abandoned_carts")
        .select("*")
        .eq("order_id", order.id)
        .single();

      if (existing?.completed) continue;

      // Determine what reminder level we should be at based on time
      let targetLevel = 0;
      const orderAge = Date.now() - new Date(order.created_at).getTime();
      if (orderAge > 7 * 24 * 60 * 60 * 1000) targetLevel = 3;
      else if (orderAge > 3 * 24 * 60 * 60 * 1000) targetLevel = 2;
      else if (orderAge > 24 * 60 * 60 * 1000) targetLevel = 1;
      else targetLevel = 0;

      const currentLevel = existing?.reminder_level ?? -1;
      if (currentLevel >= targetLevel) continue;
      if (targetLevel > 3) continue;

      // Get user email
      const { data: userData } = await adminClient.auth.admin.getUserById(order.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const message = reminderMessages[targetLevel];
      console.log(`Sending level ${targetLevel} reminder to ${email} for order ${order.id}: ${message.subject}`);

      // Upsert abandoned cart
      if (existing) {
        await adminClient
          .from("abandoned_carts")
          .update({ reminder_level: targetLevel, last_reminded_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await adminClient
          .from("abandoned_carts")
          .insert({
            user_id: order.user_id,
            order_id: order.id,
            reminder_level: targetLevel,
            last_reminded_at: new Date().toISOString(),
          } as any);
      }

      sentCount++;
    }

    return new Response(JSON.stringify({ success: true, reminders_sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
