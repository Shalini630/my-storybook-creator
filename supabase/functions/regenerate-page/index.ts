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

function getOccasionArc(occasion: string): string {
  switch (occasion) {
    case "anniversary":
      return `
NARRATIVE ARC: A LOVE LETTER IN CHAPTERS
- Pages 5-6: THE MEETING — Cinematic opening. Sensory details, not summary.
- Pages 7-8: FALLING — The turning point. Diary-entry intimacy, sacred weight.
- Pages 9-10: THE JOURNEY — Fights, silences, choosing each other anyway. Honest, raw beauty.
- Pages 11-12: THE SMALL THINGS — Coffee made right, hand on the back, private language. Prose poetry.
- Pages 13-14: TRANSFORMATION — How loving them changed you. Vulnerable.
- Pages 15-16: WHAT YOU ARE TO ME — Their essence, explained.
- Pages 17-18: EMOTIONAL PEAK — The 3am truths. Make it ache beautifully.
- Pages 19-20: FOREVER — Quiet certainty, not perfection.`;
    case "wedding":
      return `
NARRATIVE ARC: THE GREATEST LOVE STORY
- Pages 5-6: BEFORE — Two separate, incomplete lives. Cinematic detail.
- Pages 7-8: THE COLLISION — How they met, the inciting incident.
- Pages 9-10: THE COURTSHIP — First dates, nervous laughter, walls coming down.
- Pages 11-12: THE BECOMING — From "you and I" to "us." Inside jokes, rituals.
- Pages 13-14: THE STORMS — Honest about conflict and the art of returning.
- Pages 15-16: THE CERTAINTY — Why them, why forever. A closing argument.
- Pages 17-18: THE VOW — The unspoken contract. Raw and beautiful.
- Pages 19-20: THE BEGINNING — Chapter One of the rest. Hope and electricity.`;
    case "mothers-day":
      return `
NARRATIVE ARC: A DAUGHTER/SON'S TESTIMONY
- Pages 5-6: PORTRAIT — Her gestures, voice, way of entering a room.
- Pages 7-8: THE EARLY DAYS — Childhood through adult eyes. Sensory nostalgia.
- Pages 9-10: HER SACRIFICE — What she gave up that you only understand now.
- Pages 11-12: HER STRENGTH — Flawed, fierce, unbreakable.
- Pages 13-14: HER JOY — Her laughter, guilty pleasures, secret rebellions.
- Pages 15-16: WHAT SHE TAUGHT — Lessons she lived, not said.
- Pages 17-18: THE WORDS I OWE HER — Everything you've swallowed. Raw.
- Pages 19-20: MY WISH FOR HER — A prayer you actually mean.`;
    case "fathers-day":
      return `
NARRATIVE ARC: A LETTER HE'LL NEVER ASK FOR
- Pages 5-6: THE MAN — His hands, silences, way of showing up.
- Pages 7-8: FIRST MEMORIES — The first time you realized he was human.
- Pages 9-10: THE QUIET SACRIFICES — Overtime, worry, "I'm fine."
- Pages 11-12: HIS LESSONS — Demonstrations, not lectures.
- Pages 13-14: HIS HUMANITY — Dad jokes, embarrassing moments, stubbornness.
- Pages 15-16: WHAT I BECAME BECAUSE OF HIM — The inheritance.
- Pages 17-18: WHAT I NEVER SAID — Make the words count.
- Pages 19-20: GRATITUDE — Specific, earned, overdue.`;
    case "farewell":
      return `
NARRATIVE ARC: THE ART OF GOODBYE
- Pages 5-6: THE BEGINNING — When this chapter started.
- Pages 7-8: THE GOLDEN MOMENTS — In present tense. Make them live again.
- Pages 9-10: THE LAUGHTER — Inside jokes, midnight conversations.
- Pages 11-12: THE IMPACT — The architecture of influence.
- Pages 13-14: WHAT I'LL CARRY — Permanent marks on character.
- Pages 15-16: THE HARD PART — The ache, honestly.
- Pages 17-18: WHAT I WANT YOU TO KNOW — No pretense. Just truth.
- Pages 19-20: NOT GOODBYE — The continuation.`;
    case "graduation":
      return `
NARRATIVE ARC: THE BECOMING
- Pages 5-6: THE BEGINNING — The "before" portrait.
- Pages 7-8: THE CRUCIBLE — Friendships, failures, 2am breakthroughs.
- Pages 9-10: THE HARD PARTS — What almost broke them. Respect the struggle.
- Pages 11-12: THE JOY — Wild times, pure aliveness.
- Pages 13-14: THE TRANSFORMATION — Who walked in vs. who walks out.
- Pages 15-16: THE PEOPLE — Mentors, friends, unlikely teachers.
- Pages 17-18: THE PRIDE — Specific, earned admiration.
- Pages 19-20: THE OPEN ROAD — Possibility, not pressure.`;
    case "roast":
      return `
NARRATIVE ARC: THE ROAST (A COMEDY IN CHAPTERS)
- Pages 5-6: INTRODUCING THE DEFENDANT — True crime documentary, but the crime is their personality. Deadpan, devastating.
- Pages 7-8: EXHIBIT A: HABITS — Court-filing precision, stand-up savagery.
- Pages 9-10: THE GREATEST HITS — Legendary failures as epic stories.
- Pages 11-12: DELUSION VS REALITY — Side-by-side comedy.
- Pages 13-14: THE SAVAGE LINES — Sharp, specific, personal. Sting in the best way.
- Pages 15-16: THE SIGNATURE MOVES — Eye-rolling behaviors with loving contempt.
- Pages 17-18: THE TWIST — Drop the act. Real feelings beneath the comedy. Hits like a truck.
- Pages 19-20: THE VERDICT — Backhanded love. Earned warmth.`;
    case "birthday":
    default:
      return `
NARRATIVE ARC: THE BOOK OF YOU
- Pages 5-6: WHO YOU ARE — A portrait, not a list. Specific details, gestures, contradictions.
- Pages 7-8: YOUR EVOLUTION — Chapters of life. A transformation, not a timeline.
- Pages 9-10: THE MOMENTS THAT MATTER — Vivid scenes, not summaries.
- Pages 11-12: YOUR BEAUTIFUL MESS — Quirks, contradictions, infuriating-and-lovable.
- Pages 13-14: YOUR IMPACT — How knowing them changed the world around them.
- Pages 15-16: WHAT SHOULD NEVER CHANGE — The non-negotiables.
- Pages 17-18: THE UNSAID — Without armor.
- Pages 19-20: YOUR NEXT CHAPTER — Specific, personal hopes.`;
  }
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
  const bestFriends = extract("Best friends");
  const occasionRaw = extract("Occasion") || "birthday";
  const occasion = occasionRaw.toLowerCase();

  const occasionArc = getOccasionArc(occasion);

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
${bestFriends ? `- Best friends: ${bestFriends}` : ""}
${details ? `- Personal Details: ${details}` : ""}
${interests ? `- Interests: ${interests}` : ""}
${memory ? `- Key Memory: ${memory}` : ""}

BOOK STRUCTURE (EXACTLY 24 pages):
Page 1: COVER — A compelling title featuring ${name}. Book-jacket worthy. Occasion: ${occasion}.
Page 2: DEDICATION — "For ${name}," — ${dedication || "a line that stops them breathing for a second"}. Like the opening line of a novel.
Page 3: PRELUDE — ${tone === "Romantic" || occasion === "anniversary" || occasion === "wedding" ? `A meaningful song or poem reference. Include "[QR CODE HERE]" placeholder.` : `An evocative opening moment. Include "[QR CODE HERE]" placeholder.`}
Page 4: CHAPTER ONE — Hook the reader. Set the emotional landscape with authority and intimacy.
${occasionArc}
Page 21: THE LETTER — "Dear ${name}," — Raw, unfiltered, from the gut. The most honest page in the book.
Page 22: IF YOU WERE A STORY — Literary metaphors. Specific and surprising.
Page 23: THE LAST LINE — One powerful closing paragraph. ${tone === "Humorous" ? "End with a laugh that hides something deeper." : "End with quiet, unshakeable truth."}
Page 24: COLOPHON — "Made with ❤️ by KahaaniSeKitab"

${occasion === "roast" ? `
ROAST RULES:
- Comedy Central Roast meets literary wit
- Sharp, intelligent humor — not mean-spirited
- Observational comedy that proves you REALLY know this person
- Build running jokes through the book
- 70% savage comedy, 30% genuine love (the twist at the end should HIT)
- Reference specific details to make it personal, not generic
` : `
WRITING RULES:
- This is PROSE, not poetry. Flowing paragraphs.
- Each page reads like a chapter of a beautiful short novel
- 5-8 sentences per page — substantial, not sparse
- Build emotional momentum: intrigue → warmth → depth → vulnerability → catharsis → hope
- Use personal details to make it SPECIFIC — generic sentiment is the enemy
`}

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
