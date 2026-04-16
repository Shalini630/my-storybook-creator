import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_TIMEOUT_MS = 30000;
const IMAGE_TIMEOUT_MS = 45000;

async function callTextAI(
  messages: Array<{ role: string; content: string }>,
  tools: any[],
  toolChoice: any,
  lovableKey: string,
  openaiKey: string,
): Promise<any> {
  try {
    console.log("Attempting Gemini (Lovable AI Gateway)...");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, tools, tool_choice: toolChoice }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        console.log("✅ Gemini text succeeded");
        return data;
      }
      console.warn("Gemini returned empty tool call, falling back to OpenAI");
    } else {
      const errText = await geminiRes.text();
      console.warn("Gemini failed:", geminiRes.status, errText);
    }
  } catch (err) {
    console.warn("Gemini error:", err instanceof Error ? err.message : err);
  }

  console.log("Falling back to OpenAI (gpt-4o-mini)...");
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, tools, tool_choice: toolChoice }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    throw new Error(`OpenAI fallback also failed: ${openaiRes.status} ${errText}`);
  }

  console.log("✅ OpenAI text fallback succeeded");
  return openaiRes.json();
}

async function generateImage(
  prompt: string,
  lovableKey: string,
  openaiKey: string,
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

    const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (url) return url;
    }
  } catch (err) {
    console.warn("Gemini image error:", err instanceof Error ? err.message : err);
  }

  try {
    console.log("Falling back to DALL-E for image...");
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (dalleRes.ok) {
      const data = await dalleRes.json();
      const url = data.data?.[0]?.url;
      if (url) {
        console.log("✅ DALL-E fallback succeeded");
        return url;
      }
    }
  } catch (err) {
    console.warn("DALL-E error:", err instanceof Error ? err.message : err);
  }

  return "";
}

function getIllustrationStyle(isKid: boolean): string {
  return isKid
    ? "Children's book illustration. Colorful, whimsical, magical, high quality. No text in the image."
    : "Elegant, sophisticated book illustration. Rich, cinematic, painterly style like a premium novel cover. Warm tones, atmospheric lighting. No text in the image.";
}

function buildAdultSinglePagePrompt(order: any, pageIndex: number, contextPages: string): string {
  const pageNum = pageIndex + 1;
  const name = order.name;
  const theme = order.theme;
  const tone = order.tone || "Heartfelt";
  const details = order.personal_message || "";
  const memory = order.favorite_memory || "";
  const interests = order.interests || "";
  const relationship = order.relationship || "";

  return `You are a literary author writing with the emotional depth of Khaled Hosseini and the wit of David Sedaris.

Rewrite page ${pageNum} of a deeply personal, literary-quality book about ${name}.

CRITICAL STYLE RULES:
- Write like a published author, NOT a children's book writer
- Use rich, sensory prose — show, don't tell
- Every sentence should carry weight — no filler, no fluff
- Use metaphor and imagery, grounded and authentic
- This should feel like literature, not a greeting card
- NO childish language, NO fairy tale tone, NO "once upon a time"
- 5-8 sentences of substantial, novel-quality prose

INPUT:
- Name: ${name}
- Genre/Theme: ${theme}
- Tone: ${tone}
- Relationship: ${relationship}
${details ? `- Personal Details: ${details}` : ""}
${interests ? `- Interests: ${interests}` : ""}
${memory ? `- Key Memory: ${memory}` : ""}

Context from other pages (maintain continuity but write a FRESH, DIFFERENT version):
${contextPages}

Write a completely new version of page ${pageNum}. Make it emotionally sophisticated, mature, and literary.`;
}

function buildAdultFullRegenPrompt(order: any): string {
  const name = order.name;
  const theme = order.theme;
  const tone = order.tone || "Heartfelt";
  const dedication = order.dedication || "";
  const relationship = order.relationship || "";
  const details = order.personal_message || "";
  const memory = order.favorite_memory || "";
  const interests = order.interests || "";

  const extract = (key: string) => {
    const match = details.match(new RegExp(`${key}:\\s*([^.]+)`));
    return match ? match[1].trim() : "";
  };

  const personality = extract("Personality");
  const quirks = extract("Quirks");
  const favoriteThings = extract("Favorite things");
  const funnyMoment = extract("Funny moment");
  const occasion = extract("Occasion") || "Birthday";

  return `You are a literary author writing a deeply personal, beautifully crafted book. This is NOT a children's book or a fairy tale. This is a mature, emotionally sophisticated piece of writing — think of it as a short novel, a memoir, or a collection of literary essays about a real person.

CRITICAL STYLE RULES:
- Write like a published author, not a greeting card
- Use rich, sensory prose — show, don't tell
- Every sentence should carry weight — no filler, no fluff
- Vary sentence structure: short punches, flowing passages, fragments for impact
- Use metaphor and imagery, but keep it grounded and authentic
- Include specific details woven naturally into the narrative
- This should feel like literature, not a template
- NO childish language, NO fairy tale tone, NO "once upon a time"
- Think: The writing quality of a Khaled Hosseini dedication meets a John Green love letter

INPUT:
- Name: ${name}
- Occasion: ${occasion}
- Theme: ${theme}
- Tone: ${tone}
- Relationship: ${relationship}
${dedication ? `- Dedication: ${dedication}` : ""}
${personality ? `- Personality: ${personality}` : ""}
${quirks ? `- Quirks: ${quirks}` : ""}
${favoriteThings ? `- Favorite things: ${favoriteThings}` : ""}
${funnyMoment ? `- Funny moment: ${funnyMoment}` : ""}
${details ? `- Personal Details: ${details}` : ""}
${interests ? `- Interests: ${interests}` : ""}
${memory ? `- Key Memory: ${memory}` : ""}

BOOK STRUCTURE (EXACTLY 24 pages):
Page 1: COVER — A compelling title featuring ${name}. Not cutesy — think book-jacket worthy.
Page 2: DEDICATION — "For ${name}," — ${dedication || "a line that stops them breathing for a second"}. Like the opening line of a novel.
Page 3: PRELUDE — An evocative opening moment. Include "[QR CODE HERE]" placeholder.
Page 4: CHAPTER ONE — Hook the reader. Set the emotional landscape with authority and intimacy.
Pages 5-6: PORTRAIT — Paint ${name} like a novelist writes a protagonist — through specific details, gestures, contradictions.
Pages 7-8: EVOLUTION — The chapters of their life. Not a timeline — a transformation.
Pages 9-10: MOMENTS — Specific memories rendered in vivid detail. Write scenes, not summaries.
Pages 11-12: THE MESS — Quirks, contradictions, infuriating and lovable in equal measure.
Pages 13-14: IMPACT — How knowing them has changed the world around them.
Pages 15-16: WHAT SHOULD NEVER CHANGE — The non-negotiable parts of who they are.
Pages 17-18: THE UNSAID — What you've been meaning to say. Without armor.
Pages 19-20: NEXT CHAPTER — Specific, personal hopes for their future.
Page 21: THE LETTER — "Dear ${name}," — Raw, unfiltered, from the gut.
Page 22: IF YOU WERE A STORY — Literary metaphors. Specific and surprising.
Page 23: THE LAST LINE — One powerful closing paragraph. Makes someone close the book slowly.
Page 24: COLOPHON — "Made with ❤️ by KahaaniSeKitab"

WRITING RULES:
- This is PROSE, not poetry. Write in flowing paragraphs.
- Each page should read like a chapter of a beautiful short novel
- 5-8 sentences per page — substantial, not sparse
- Build emotional momentum: intrigue → warmth → depth → vulnerability → catharsis → hope
- Use personal details to make it SPECIFIC — generic sentiment is the enemy

Generate ALL 24 pages.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
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

    const isKid = order.audience === "kid";
    const story = order.story_content as any;
    const illustrations = (order.illustrations as string[]) || [];
    const style = getIllustrationStyle(isKid);

    // --- SINGLE PAGE REGENERATION ---
    if (mode === "page" && typeof pageIndex === "number" && story) {
      const contextPages = story.pages
        .filter((_: any, i: number) => i !== pageIndex)
        .map((p: any) => p.text)
        .join(" ");

      const regenPrompt = isKid
        ? `Rewrite page ${pageIndex + 1} of a children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"}. Theme: ${order.theme}. Tone: ${order.tone || "Adventurous"}. The book title is "${story.title}". Context from other pages: ${contextPages}. Write a fresh, different version of page ${pageIndex + 1}. 3-5 sentences, age-appropriate, vivid and magical.`
        : buildAdultSinglePagePrompt(order, pageIndex, contextPages);

      const rewriteTools = [{
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
      }];

      const textData = await callTextAI(
        [
          { role: "system", content: isKid ? "You are a creative children's book author." : "You are a literary author who writes with the emotional depth of Khaled Hosseini and the wit of David Sedaris. Write mature, emotionally sophisticated prose. This is NOT a children's book." },
          { role: "user", content: regenPrompt },
        ],
        rewriteTools,
        { type: "function", function: { name: "rewrite_page" } },
        LOVABLE_API_KEY,
        OPENAI_API_KEY,
      );

      const toolCall = textData.choices?.[0]?.message?.tool_calls?.[0];
      const newPage = JSON.parse(toolCall.function.arguments);

      const newImgUrl = await generateImage(
        `Create a beautiful illustration: ${newPage.illustrationPrompt}. Style: ${style}`,
        LOVABLE_API_KEY,
        OPENAI_API_KEY,
      );

      const updatedPages = [...story.pages];
      updatedPages[pageIndex] = { pageNumber: pageIndex + 1, text: newPage.text, illustrationPrompt: newPage.illustrationPrompt };
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

    // --- FULL REGENERATION ---
    await adminClient.from("orders").update({ status: "generating" }).eq("id", orderId);

    const storyPrompt = isKid
      ? `Create a personalized children's storybook for a ${order.gender || "child"} named ${order.name}, aged ${order.age || "5-7"}. Theme: ${order.theme}. Tone: ${order.tone || "Adventurous"}. ${order.interests ? `Loves: ${order.interests}` : ""} ${order.personal_message ? `Details: ${order.personal_message}` : ""} ${order.dedication ? `Dedication: ${order.dedication}` : ""} Create exactly 24 pages. Each page: pageNumber, short paragraph (3-5 sentences, age-appropriate), vivid illustration description.`
      : buildAdultFullRegenPrompt(order);

    const storyTools = [{
      type: "function",
      function: {
        name: "create_story",
        description: "Create a personalized 24-page book",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            pages: { type: "array", items: { type: "object", properties: { pageNumber: { type: "number" }, text: { type: "string" }, illustrationPrompt: { type: "string" } }, required: ["pageNumber", "text", "illustrationPrompt"] } },
          },
          required: ["title", "pages"],
        },
      },
    }];

    let storyData;
    try {
      storyData = await callTextAI(
        [
          { role: "system", content: isKid ? "You are a professional children's book author." : "You are a literary author who writes with the emotional depth of Khaled Hosseini and the wit of David Sedaris. This is a mature, sophisticated book — NOT a children's story." },
          { role: "user", content: storyPrompt },
        ],
        storyTools,
        { type: "function", function: { name: "create_story" } },
        LOVABLE_API_KEY,
        OPENAI_API_KEY,
      );
    } catch (err) {
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to regenerate story" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStory = JSON.parse(storyData.choices?.[0]?.message?.tool_calls?.[0].function.arguments);

    // Generate images with fallback
    const batchSize = 4;
    const newIllustrations: string[] = [];
    for (let i = 0; i < newStory.pages.length; i += batchSize) {
      const batch = newStory.pages.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((page: any) =>
          generateImage(
            `Create a beautiful illustration: ${page.illustrationPrompt}. Style: ${style}`,
            LOVABLE_API_KEY,
            OPENAI_API_KEY,
          )
        )
      );
      newIllustrations.push(...batchResults);
    }

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
