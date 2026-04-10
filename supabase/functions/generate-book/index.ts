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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

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

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("orders").update({ status: "generating" }).eq("id", orderId);

    // Build prompt
    const storyPrompt = order.audience === "kid"
      ? `Create a personalized children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"}.
Theme: ${order.theme}. Tone: ${order.tone || "Adventurous"}.
${order.interests ? `Loves: ${order.interests}` : ""}
${order.favorite_character ? `Favorite character: ${order.favorite_character}` : ""}
${order.dedication ? `Dedication: ${order.dedication}` : ""}
Create exactly 4 pages. Each page: pageNumber, short paragraph (3-5 sentences, age-appropriate), vivid illustration description.
Return JSON: {"title":"string","pages":[{"pageNumber":1,"text":"string","illustrationPrompt":"string"}]}`
      : `Create a personalized storybook for an adult named ${order.name}.
Genre: ${order.theme}. Tone: ${order.tone || "Heartfelt"}. Relationship: ${order.relationship || "For myself"}.
${order.hobbies ? `Hobbies: ${order.hobbies}` : ""}
${order.favorite_memory ? `Memory: ${order.favorite_memory}` : ""}
${order.personal_message ? `Personal: ${order.personal_message}` : ""}
${order.dedication ? `Dedication: ${order.dedication}` : ""}
Create exactly 4 pages. Each page: pageNumber, engaging paragraph (4-6 sentences), vivid illustration description.
Return JSON: {"title":"string","pages":[{"pageNumber":1,"text":"string","illustrationPrompt":"string"}]}`;

    // Generate story
    const storyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a creative book author. Always respond with valid JSON only, no markdown." },
          { role: "user", content: storyPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_story",
            description: "Create a personalized storybook",
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
      console.error("Failed to parse story JSON:", toolCall);
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to parse story" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate ALL illustrations in PARALLEL for speed
    const illustrationPromises = story.pages.map((page: any) =>
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
              content: `Create a beautiful ${order.audience === "kid" ? "children's book" : "storybook"} illustration: ${page.illustrationPrompt}. Style: colorful, whimsical, high quality book illustration. No text in the image.`,
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
    );

    const illustrations = await Promise.all(illustrationPromises);

    await adminClient.from("orders").update({
      status: "preview",
      story_content: story,
      illustrations,
    }).eq("id", orderId);

    return new Response(JSON.stringify({ success: true, orderId, story, illustrations }), {
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
