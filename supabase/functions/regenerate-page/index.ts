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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, pageIndex, mode } = await req.json();
    // mode: "page" = regenerate single page, "full" = regenerate entire story

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "paid") {
      return new Response(JSON.stringify({ error: "Cannot regenerate a paid order" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const story = order.story_content as any;
    const illustrations = (order.illustrations as string[]) || [];

    if (mode === "page" && typeof pageIndex === "number" && story) {
      // Regenerate single page text + illustration
      const pageNum = pageIndex + 1;
      const regenPrompt = order.audience === "kid"
        ? `Rewrite page ${pageNum} of a children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"}. Theme: ${order.theme}. Tone: ${order.tone || "Adventurous"}. The book title is "${story.title}". Context from other pages: ${story.pages.filter((_: any, i: number) => i !== pageIndex).map((p: any) => p.text).join(" ")}. Write a fresh, different version of page ${pageNum}. Return JSON: {"text":"string","illustrationPrompt":"string"}`
        : `Rewrite page ${pageNum} of a storybook for an adult named ${order.name}. Genre: ${order.theme}. Tone: ${order.tone || "Heartfelt"}. The book title is "${story.title}". Context: ${story.pages.filter((_: any, i: number) => i !== pageIndex).map((p: any) => p.text).join(" ")}. Write a fresh, different version. Return JSON: {"text":"string","illustrationPrompt":"string"}`;

      const textRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a creative book author. Respond with valid JSON only." },
            { role: "user", content: regenPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "rewrite_page",
              description: "Rewrite a single page",
              parameters: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  illustrationPrompt: { type: "string" },
                },
                required: ["text", "illustrationPrompt"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "rewrite_page" } },
        }),
      });

      if (!textRes.ok) {
        console.error("Regen text error:", await textRes.text());
        return new Response(JSON.stringify({ error: "Failed to regenerate page text" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const textData = await textRes.json();
      const toolCall = textData.choices?.[0]?.message?.tool_calls?.[0];
      const newPage = JSON.parse(toolCall.function.arguments);

      // Generate new illustration
      const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: `Create a beautiful ${order.audience === "kid" ? "children's book" : "storybook"} illustration: ${newPage.illustrationPrompt}. Style: colorful, whimsical, high quality. No text.` }],
          modalities: ["image", "text"],
        }),
      });

      let newImgUrl = "";
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        newImgUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
      }

      // Update story
      const updatedPages = [...story.pages];
      updatedPages[pageIndex] = { pageNumber: pageNum, text: newPage.text, illustrationPrompt: newPage.illustrationPrompt };
      const updatedIllustrations = [...illustrations];
      updatedIllustrations[pageIndex] = newImgUrl || illustrations[pageIndex] || "";

      await adminClient.from("orders").update({
        story_content: { ...story, pages: updatedPages },
        illustrations: updatedIllustrations,
      }).eq("id", orderId);

      return new Response(JSON.stringify({
        success: true,
        story: { ...story, pages: updatedPages },
        illustrations: updatedIllustrations,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Full regeneration - reuse the generate-book logic inline
    await adminClient.from("orders").update({ status: "generating" }).eq("id", orderId);

    const storyPrompt = order.audience === "kid"
      ? `Create a personalized children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"}. Theme: ${order.theme}. Tone: ${order.tone || "Adventurous"}. ${order.interests ? `Loves: ${order.interests}` : ""} ${order.personal_message ? `Details: ${order.personal_message}` : ""} ${order.dedication ? `Dedication: ${order.dedication}` : ""} Create exactly 8 pages. Each page: pageNumber, short paragraph (3-5 sentences, age-appropriate), vivid illustration description. Return JSON: {"title":"string","pages":[{"pageNumber":1,"text":"string","illustrationPrompt":"string"}]}`
      : `Create a personalized storybook for an adult named ${order.name}. Genre: ${order.theme}. Tone: ${order.tone || "Heartfelt"}. ${order.relationship ? `Relationship: ${order.relationship}` : ""} ${order.personal_message ? `Details: ${order.personal_message}` : ""} ${order.dedication ? `Dedication: ${order.dedication}` : ""} Create exactly 8 pages. Each page: pageNumber, engaging paragraph (4-6 sentences), vivid illustration description. Return JSON: {"title":"string","pages":[{"pageNumber":1,"text":"string","illustrationPrompt":"string"}]}`;

    const storyRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a creative book author. Respond with valid JSON only, no markdown." },
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
                pages: { type: "array", items: { type: "object", properties: { pageNumber: { type: "number" }, text: { type: "string" }, illustrationPrompt: { type: "string" } }, required: ["pageNumber", "text", "illustrationPrompt"] } },
              },
              required: ["title", "pages"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_story" } },
      }),
    });

    if (!storyRes.ok) {
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to regenerate story" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storyData = await storyRes.json();
    const newStory = JSON.parse(storyData.choices?.[0]?.message?.tool_calls?.[0].function.arguments);

    const imgPromises = newStory.pages.map((page: any) =>
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: `Create a beautiful ${order.audience === "kid" ? "children's book" : "storybook"} illustration: ${page.illustrationPrompt}. Style: colorful, whimsical, high quality. No text.` }],
          modalities: ["image", "text"],
        }),
      }).then(async r => r.ok ? (await r.json()).choices?.[0]?.message?.images?.[0]?.image_url?.url || "" : "").catch(() => "")
    );

    const newIllustrations = await Promise.all(imgPromises);

    await adminClient.from("orders").update({
      status: "preview",
      story_content: newStory,
      illustrations: newIllustrations,
    }).eq("id", orderId);

    return new Response(JSON.stringify({ success: true, story: newStory, illustrations: newIllustrations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("regenerate-page error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
