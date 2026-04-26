import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPTS: Record<string, string> = {
  social: `You are a social media copywriter for "KahaaniSeKitab" — a service that creates personalized storybooks for kids and adults in India. Generate 3 distinct social media posts (one each for Instagram, Facebook, X/Twitter). Each post should be punchy, emotionally resonant, include relevant emojis, 5-8 hashtags, and end with a clear CTA. Format with clear platform headings.`,
  email: `You are an email marketing copywriter for "KahaaniSeKitab" — personalized storybooks for kids and adults in India. Generate a complete promotional email with: 3 catchy subject line options, a preview/preheader line, an engaging email body (under 200 words, conversational tone, with personalization tokens like {{first_name}}), and a clear CTA button text. Format with clear section headings.`,
  ads: `You are a performance ad copywriter for "KahaaniSeKitab" — personalized storybooks for kids and adults in India. Generate ad copy for both Google Search Ads and Meta (Facebook/Instagram) Ads. For Google: 5 headline variants (max 30 chars each) + 3 descriptions (max 90 chars each). For Meta: a primary text (under 125 chars), headline, and description. Include the strongest CTA for each. Format with clear platform headings.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, audience, occasion, tone, extraNotes } = await req.json();
    const systemPrompt = PROMPTS[type as string];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid content type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Audience: ${audience || "anyone (kids & adults)"}`,
      `Occasion / theme: ${occasion || "general promotion"}`,
      `Tone: ${tone || "warm, playful, premium"}`,
      extraNotes ? `Extra notes: ${extraNotes}` : "",
    ].filter(Boolean).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-marketing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
