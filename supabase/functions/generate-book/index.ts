import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

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

    // Fetch order
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

    // Update status to generating
    await adminClient.from("orders").update({ status: "generating" }).eq("id", orderId);

    // Build prompt based on audience
    let storyPrompt = "";
    if (order.audience === "kid") {
      storyPrompt = `Create a personalized children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"} years old.
Theme: ${order.theme}
Tone: ${order.tone || "Adventurous"}
${order.interests ? `The child loves: ${order.interests}` : ""}
${order.favorite_character ? `Their favorite character is: ${order.favorite_character}` : ""}
${order.dedication ? `Dedication: ${order.dedication}` : ""}

Create a story with exactly 6 pages. Each page should have:
- A page number
- A short, engaging paragraph (3-5 sentences, age-appropriate)
- A vivid description of the illustration that should accompany it

Return as JSON with this structure:
{"title": "string", "pages": [{"pageNumber": 1, "text": "string", "illustrationPrompt": "string"}]}`;
    } else {
      storyPrompt = `Create a personalized storybook for an adult named ${order.name}.
Genre/Theme: ${order.theme}
Tone: ${order.tone || "Heartfelt"}
Relationship: ${order.relationship || "For myself"}
${order.hobbies ? `Hobbies & passions: ${order.hobbies}` : ""}
${order.favorite_memory ? `A favorite memory to weave in: ${order.favorite_memory}` : ""}
${order.personal_message ? `Personal touches: ${order.personal_message}` : ""}
${order.dedication ? `Dedication: ${order.dedication}` : ""}

Create a story with exactly 6 pages. Each page should have:
- A page number
- An engaging paragraph (4-6 sentences, literary quality)
- A vivid description of the illustration that should accompany it

Return as JSON with this structure:
{"title": "string", "pages": [{"pageNumber": 1, "text": "string", "illustrationPrompt": "string"}]}`;
    }

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
          { role: "system", content: "You are a creative children's book author and illustrator. Always respond with valid JSON only, no markdown." },
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

    // Generate illustrations for each page
    const illustrations: string[] = [];
    for (const page of story.pages) {
      try {
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          illustrations.push(imageUrl || "");
        } else {
          console.error("Image generation failed for page", page.pageNumber);
          illustrations.push("");
        }
      } catch (err) {
        console.error("Image error:", err);
        illustrations.push("");
      }
    }

    // Save to order
    await adminClient.from("orders").update({
      status: "preview",
      story_content: story,
      illustrations: illustrations,
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
