import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("orders").update({ status: "generating" }).eq("id", orderId);

    // Build comprehensive prompt based on the detailed book structure
    const isKid = order.audience === "kid";
    const personalDetails = order.personal_message || "";
    const name = order.name;
    const theme = order.theme;
    const tone = order.tone || (isKid ? "Adventurous" : "Heartfelt");
    const dedication = order.dedication || "";
    const relationship = order.relationship || "";
    const memory = order.favorite_memory || "";
    const interests = order.interests || "";

    const bookStructure = `
You are an expert emotional storyteller and personalized book creator.
Generate a complete, print-ready personalized storybook with EXACTLY 24 pages.

INPUT:
- Name: ${name}
- Audience: ${isKid ? "Child" : "Adult"}
- Theme: ${theme}
- Tone: ${tone}
- Relationship: ${relationship}
${isKid ? `- Age: ${order.age || "5-7"}
- Gender: ${order.gender || ""}` : ""}
${dedication ? `- Dedication: ${dedication}` : ""}
${personalDetails ? `- Personal Details: ${personalDetails}` : ""}
${interests ? `- Interests: ${interests}` : ""}
${memory ? `- Memorable Moment: ${memory}` : ""}

BOOK STRUCTURE (follow EXACTLY):
Page 1: COVER - Book title featuring ${name}, occasion tagline
Page 2: DEDICATION - "This book is made with love for ${name}..." ${dedication ? `Include: ${dedication}` : ""}
Page 3: MEMORY SONG PAGE - A meaningful song moment with "[QR CODE HERE]" placeholder
Page 4: INTRO - Set the emotional tone. Hook the reader. "Every story has a beginning…"
Pages 5-6: CHARACTER INTRO - ${isKid ? `"Once upon a time, there was a little star named ${name}..."` : `"Let me tell you about someone truly special..."`} Include personality traits and fun quirks.
Pages 7-8: BEGINNING STORY - How it all started. ${isKid ? "Early childhood magical moments." : "First meeting or early days."}
Pages 9-10: MEMORIES - 2-3 key emotional memories woven into narrative
Pages 11-12: FUN & LIGHT MOMENTS - Funny habits, inside jokes, cute quirks. ${isKid ? "Silly adventures!" : "Keep emotional balance with humor."}
Pages 13-14: GROWTH & CHALLENGES - ${isKid ? "A magical problem the hero overcomes!" : "Tough times, lessons learned, what made them stronger."}
Pages 15-16: APPRECIATION - What makes ${name} special. Why they matter.
Pages 17-18: EMOTIONAL PEAK - The tear moment. Most heartfelt message. "What you mean to me."
Pages 19-20: FUTURE - Wishes, dreams, vision for tomorrow
Page 21: LETTER PAGE - Written as a personal letter: "Dear ${name}, There's so much I want to say…"
Page 22: "IF YOU WERE A STORY" - "You'd be… a hero / a melody / a journey…" Creative metaphor page.
Page 23: FINAL MESSAGE - Short & powerful closing: "This is just the beginning…"
Page 24: BACK PAGE - Closing line with "Made with ❤️ by KahaaniSeKitab"

${isKid ? `
CHILD BOOK RULES:
- Use simple, magical, imaginative tone
- Convert real-life into adventure/fantasy/superhero journey
- Use playful language, avoid heavy emotional complexity
- Include: magical problems → journey → happy ending
` : `
ADULT BOOK RULES:
- Deep emotional storytelling, realistic and relatable
- Include reflection, gratitude, emotional depth
- Balance warmth, humor, and sentiment
- Powerful one-liners throughout
`}

WRITING STYLE:
- Human-like, heartfelt, NOT robotic
- NO repetition
- Storytelling, NOT bullet points
- Each page: concise but impactful (3-6 sentences)
- Include occasional powerful one-liners
- Maintain emotional build-up → peak → closure

Generate ALL 24 pages.`;

    console.log("Generating story for order:", orderId);

    const storyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional book author. Return structured JSON only." },
          { role: "user", content: bookStructure },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_story",
            description: "Create a personalized 24-page storybook",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                pages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      pageNumber: { type: "number" },
                      pageType: { type: "string", enum: ["cover", "dedication", "song", "intro", "character", "beginning", "memories", "fun", "growth", "appreciation", "emotional-peak", "future", "letter", "metaphor", "final-message", "back"] },
                      text: { type: "string" },
                      illustrationPrompt: { type: "string" },
                    },
                    required: ["pageNumber", "text", "illustrationPrompt"],
                  },
                },
              },
              required: ["title", "pages"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_story" } },
      }),
    });

    if (!storyResponse.ok) {
      const errText = await storyResponse.text();
      console.error("AI story error:", storyResponse.status, errText);
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to generate story" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storyData = await storyResponse.json();
    const toolCall = storyData.choices?.[0]?.message?.tool_calls?.[0];
    let story;
    try {
      story = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse story JSON:", JSON.stringify(toolCall));
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to parse story" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Story generated with ${story.pages.length} pages, creating illustrations in parallel...`);

    // Generate illustrations in parallel (batch of 6 at a time to avoid rate limits)
    const illustrations: string[] = [];
    const batchSize = 6;
    for (let i = 0; i < story.pages.length; i += batchSize) {
      const batch = story.pages.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((page: any) =>
          fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: `Create a beautiful ${isKid ? "children's book" : "storybook"} illustration: ${page.illustrationPrompt}. Style: colorful, whimsical, high quality book illustration. No text in the image.`,
                },
              ],
              modalities: ["image", "text"],
            }),
          })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
              }
              console.error("Image gen failed for page", page.pageNumber, res.status);
              return "";
            })
            .catch((err) => {
              console.error("Image error:", err);
              return "";
            })
        )
      );
      illustrations.push(...batchResults);
    }

    await adminClient.from("orders").update({
      status: "preview",
      story_content: story,
      illustrations,
    }).eq("id", orderId);

    console.log("Book generation complete for order:", orderId);

    return new Response(JSON.stringify({ success: true, orderId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-book error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
