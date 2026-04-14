import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_TIMEOUT_MS = 30000; // 30s timeout for Gemini

async function callTextAI(
  messages: Array<{ role: string; content: string }>,
  tools: any[],
  toolChoice: any,
  lovableKey: string,
  openaiKey: string,
): Promise<any> {
  // Try Gemini first (free)
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
        console.log("✅ Gemini succeeded");
        return data;
      }
      console.warn("Gemini returned empty tool call, falling back to OpenAI");
    } else {
      const errText = await geminiRes.text();
      console.warn("Gemini failed:", geminiRes.status, errText);
    }
  } catch (err) {
    console.warn("Gemini error (timeout or network):", err instanceof Error ? err.message : err);
  }

  // Fallback to OpenAI
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

  console.log("✅ OpenAI fallback succeeded");
  return openaiRes.json();
}

function buildChildPrompt(order: any): string {
  const name = order.name;
  const age = order.age || "5-7";
  const theme = order.theme;
  const details = order.personal_message || "";

  // Parse structured child data from personal_message
  const extract = (key: string) => {
    const match = details.match(new RegExp(`${key}:\\s*([^.]+)`));
    return match ? match[1].trim() : "";
  };

  const personality = extract("Personality");
  const favToy = extract("Favorite toy");
  const favFood = extract("Favorite food");
  const favActivity = extract("Favorite activity");
  const favCharacter = extract("Favorite character");
  const dislikes = extract("Dislikes");
  const sidekick = extract("Sidekick");
  const goal = extract("Story goal");
  const challenge = extract("Story challenge");
  const cuteHabit = extract("Cute habit");
  const funnyPhrase = extract("Funny phrase");
  const smileMemory = extract("Smile memory");
  const whySpecial = extract("Why special");
  const message = extract("Message");
  const futureWish = extract("Future wish");
  const songName = extract("Song");
  const songMeaning = extract("Song meaning");
  const dedication = order.dedication || "";
  const occasion = extract("Occasion");

  return `
You are an expert children's book author. Generate a complete, magical 24-page storybook.

CHILD PROFILE:
- Name: ${name}
- Age: ${age}
- Theme: ${theme}
- Occasion: ${occasion || "Just Because"}
${personality ? `- Personality: ${personality}` : ""}
${favToy ? `- Favorite toy: ${favToy}` : ""}
${favFood ? `- Favorite food: ${favFood}` : ""}
${favActivity ? `- Favorite activity: ${favActivity}` : ""}
${favCharacter ? `- Favorite character: ${favCharacter}` : ""}
${dislikes ? `- Dislikes/Fears: ${dislikes}` : ""}

STORY ELEMENTS:
${sidekick ? `- Sidekick companion: ${sidekick} (make this character a loyal friend throughout the adventure)` : ""}
${goal ? `- Adventure goal: ${goal} (this is what ${name} must accomplish)` : ""}
${challenge ? `- Challenge/obstacle: ${challenge} (this creates the story tension ${name} must overcome)` : ""}

REAL-LIFE TOUCHES:
${cuteHabit ? `- Cute habit to weave in: ${cuteHabit}` : ""}
${funnyPhrase ? `- Funny phrase ${name} says: "${funnyPhrase}" (use this in dialogue)` : ""}
${smileMemory ? `- A real moment to reference: ${smileMemory}` : ""}

EMOTIONAL CORE:
${whySpecial ? `- Why ${name} is special: ${whySpecial}` : ""}
${message ? `- Message from the gifter: ${message}` : ""}
${futureWish ? `- Future wish: ${futureWish}` : ""}

BOOK STRUCTURE (EXACTLY 24 pages):
Page 1: COVER — "${name}'s ${theme} Adventure" with occasion tagline
Page 2: DEDICATION — "This book is made with love for ${name}..." ${dedication ? `Include: ${dedication}` : ""}
Page 3: SONG PAGE — ${songName ? `Song: "${songName}" — ${songMeaning}. Include "[QR CODE HERE]" placeholder` : "A magical lullaby moment with '[QR CODE HERE]' placeholder"}
Page 4: INTRO — "Every adventure starts with a single step..." Hook the young reader.
Pages 5-6: CHARACTER INTRO — Introduce ${name} as the hero! Personality: ${personality || "brave and curious"}. ${cuteHabit ? `Include their cute habit: ${cuteHabit}.` : ""} ${funnyPhrase ? `Have them say: "${funnyPhrase}"` : ""}
Pages 7-8: THE WORLD — Describe the ${theme} world. ${sidekick ? `Introduce ${sidekick} as ${name}'s loyal companion.` : ""} Make it vivid and magical.
Pages 9-10: THE QUEST BEGINS — ${goal ? `${name} discovers they must ${goal}.` : `${name} discovers a mysterious quest.`} Build excitement!
Pages 11-12: FUN & DISCOVERY — Silly adventures, ${favFood ? `a feast with ${favFood},` : "feasting,"} ${favToy ? `finding a magical version of ${favToy},` : ""} playful moments with ${sidekick || "friends"}.
Pages 13-14: THE CHALLENGE — ${challenge ? `${name} faces ${challenge}!` : "A magical obstacle appears!"} ${dislikes ? `Connect to their real fear/dislike: ${dislikes} — and show them being brave.` : "Show courage and determination."} This is the story tension.
Pages 15-16: OVERCOMING — With help from ${sidekick || "friends"} and inner strength, ${name} conquers the challenge. ${favCharacter ? `Channel the spirit of ${favCharacter}.` : ""}
Pages 17-18: THE VICTORY — ${name} achieves the goal! Celebration, joy, pride. ${smileMemory ? `Weave in this real moment: ${smileMemory}` : ""}
Pages 19-20: REFLECTION — What ${name} learned. ${whySpecial ? `Why they're special: ${whySpecial}` : ""} Gentle emotional moment.
Page 21: LETTER PAGE — "Dear ${name}," — ${message || "a heartfelt message about how special they are"}
Page 22: "IF YOU WERE A STORY" — Creative metaphors: "You'd be the bravest hero, the brightest star..."
Page 23: FINAL MESSAGE — ${futureWish ? `"${futureWish}"` : "\"The adventure never ends...\""} Short & magical.
Page 24: BACK PAGE — "Made with ❤️ by KahaaniSeKitab"

AGE-ADAPTED WRITING (age ${age}):
${age === "2-3" ? "- Very simple sentences (3-5 words). Lots of repetition. Onomatopoeia. Rhyming." : ""}
${age === "4-5" ? "- Simple but descriptive sentences. Gentle humor. Easy vocabulary. Rhyming optional." : ""}
${age === "6-7" ? "- Richer vocabulary. Simple plot twists. Dialogue between characters. Light suspense." : ""}
${age === "8-10" ? "- More complex narrative. Real challenges. Character growth. Subtle life lessons." : ""}

RULES:
- Make it story-driven, NOT memory-driven
- Use magical, imaginative, playful language
- ${name} is ALWAYS the hero
- Include ${sidekick || "a companion"} throughout
- Build: Setup → Quest → Challenge → Victory → Reflection
- Each page: 3-5 sentences, vivid and engaging
- NO repetition between pages
- Maintain wonder and excitement throughout

Generate ALL 24 pages.`;
}

function buildAdultPrompt(order: any): string {
  const name = order.name;
  const theme = order.theme;
  const tone = order.tone || "Heartfelt";
  const dedication = order.dedication || "";
  const relationship = order.relationship || "";
  const details = order.personal_message || "";
  const memory = order.favorite_memory || "";
  const interests = order.interests || "";

  // Parse occasion from personal_message
  const occasionMatch = details.match(/Occasion:\s*([^.]+)/);
  const occasion = occasionMatch ? occasionMatch[1].trim() : "";

  // Build occasion-specific story arc instructions
  let occasionArc = "";
  switch (occasion) {
    case "anniversary":
      occasionArc = `
STORY ARC: LOVE STORY
- Pages 5-6: How they met, first impressions, what stood out
- Pages 7-8: Falling in love — the moment everything changed
- Pages 9-10: Relationship journey — challenges faced together, what strengthened the bond
- Pages 11-12: Little things — cute habits, inside jokes, small moments of love
- Pages 13-14: Growth together — how they've changed each other for the better
- Pages 15-16: What they mean to each other today
- Pages 17-18: EMOTIONAL PEAK — deepest feelings, things never said before
- Pages 19-20: Forever — what the future looks like together, promises`;
      break;
    case "wedding":
      occasionArc = `
STORY ARC: LOVE STORY CELEBRATION
- Pages 5-6: How the couple met, first impressions, instant connection
- Pages 7-8: The courtship — dating days, funny moments, falling in love
- Pages 9-10: The proposal story and the journey to the wedding
- Pages 11-12: Fun couple moments — inside jokes, quirky habits, what makes them unique
- Pages 13-14: Challenges overcome together — what made them stronger
- Pages 15-16: Why they're perfect for each other
- Pages 17-18: EMOTIONAL PEAK — what their love means, wedding day emotions
- Pages 19-20: The future together — dreams, wishes, happily ever after`;
      break;
    case "mothers-day":
      occasionArc = `
STORY ARC: TRIBUTE TO MOM
- Pages 5-6: Who she is — her personality, how she shows love, what makes her special
- Pages 7-8: Childhood memories — moments she cared for you, made everything okay
- Pages 9-10: Her sacrifices — what she gave up, when you realized her efforts
- Pages 11-12: Her strength — times she was incredible, handled tough situations
- Pages 13-14: Fun moments — her quirks, funny habits, signature dish
- Pages 15-16: What she means today — irreplaceable, admirable qualities
- Pages 17-18: EMOTIONAL PEAK — the deepest thank you, things never said
- Pages 19-20: What you wish for her — dreams, rest, happiness`;
      break;
    case "fathers-day":
      occasionArc = `
STORY ARC: TRIBUTE TO DAD
- Pages 5-6: Who he is — personality, signature dad moves, what makes him unique
- Pages 7-8: Childhood memories — earliest moments, feeling safe and protected
- Pages 9-10: His sacrifices — silent things he did, putting family first
- Pages 11-12: Life lessons — advice that stuck, things you still follow today
- Pages 13-14: Fun & dad humor — dad jokes, classic dad moments, funny fails
- Pages 15-16: What makes him great today — why you admire him
- Pages 17-18: EMOTIONAL PEAK — things never told him, deepest gratitude
- Pages 19-20: Thank you — what you want to say now`;
      break;
    case "farewell":
      occasionArc = `
STORY ARC: BITTERSWEET GOODBYE
- Pages 5-6: When this journey started — what made it special
- Pages 7-8: Best memories together — defining moments of the bond
- Pages 9-10: Funny incidents — inside jokes, routines, shared laughter
- Pages 11-12: Impact — how they changed your life, what you learned
- Pages 13-14: What you'll miss — specific habits, routines, their presence
- Pages 15-16: Appreciation — what made them irreplaceable
- Pages 17-18: EMOTIONAL PEAK — the hardest goodbye, deepest feelings
- Pages 19-20: Wishes for their next chapter — hope, dreams, stay in touch`;
      break;
    case "graduation":
      occasionArc = `
STORY ARC: ACHIEVEMENT & TRANSFORMATION
- Pages 5-6: Where the journey began — expectations, first days
- Pages 7-8: The experience — best memories, defining moments
- Pages 9-10: Hardest moments — challenges, turning points, perseverance
- Pages 11-12: Fun times — college/school shenanigans, friendship stories
- Pages 13-14: Growth — how they've changed, what they've learned
- Pages 15-16: The people who mattered — friends, mentors, supporters
- Pages 17-18: EMOTIONAL PEAK — pride, what this achievement means
- Pages 19-20: What's next — dreams, the future, limitless possibilities`;
      break;
    case "roast":
      occasionArc = `
STORY ARC: COMEDY ROAST (WITH LOVE)
- Pages 5-6: Introducing the "victim" — what makes them roast-worthy
- Pages 7-8: Their most embarrassing habits and behaviors
- Pages 9-10: Epic fails and disasters — legendary mess-ups
- Pages 11-12: Delusional beliefs about themselves — what they THINK vs reality
- Pages 13-14: Roast lines — savage but loving burns, funny observations
- Pages 15-16: Their go-to excuses and signature moves
- Pages 17-18: THE TWIST — actually, here's why they're amazing (soft ending)
- Pages 19-20: Real appreciation disguised as backhanded compliments`;
      break;
    case "birthday":
    default:
      occasionArc = `
STORY ARC: CELEBRATION & REFLECTION
- Pages 5-6: Who they are today — personality, what makes them different, signature traits
- Pages 7-8: Their journey — how they've evolved, phases of growth
- Pages 9-10: Defining memories — proud moments, surprises, emotional stories
- Pages 11-12: Fun & light — funny habits, inside jokes, quirky moments
- Pages 13-14: Personal impact — how they've changed your life, lessons learned
- Pages 15-16: Appreciation — what you admire most, what should never change
- Pages 17-18: EMOTIONAL PEAK — deepest feelings, things unsaid
- Pages 19-20: Future — where you see them, wishes and dreams`;
      break;
  }

  return `
You are an expert emotional storyteller and personalized book creator.
Generate a complete, print-ready personalized storybook with EXACTLY 24 pages.

INPUT:
- Name: ${name}
- Audience: Adult
- Occasion: ${occasion || "Birthday"}
- Theme: ${theme}
- Tone: ${tone}
- Relationship: ${relationship}
${dedication ? `- Dedication: ${dedication}` : ""}
${details ? `- Personal Details: ${details}` : ""}
${interests ? `- Interests: ${interests}` : ""}
${memory ? `- Memorable Moment: ${memory}` : ""}

BOOK STRUCTURE (EXACTLY 24 pages):
Page 1: COVER — Book title featuring ${name}, occasion tagline
Page 2: DEDICATION — "This book is made with love for ${name}..." ${dedication ? `Include: ${dedication}` : ""}
Page 3: MEMORY SONG PAGE — A meaningful song moment with "[QR CODE HERE]" placeholder
Page 4: INTRO — Set the emotional tone. Hook the reader. "Every story has a beginning…"
${occasionArc}
Page 21: LETTER PAGE — Written as a personal letter: "Dear ${name}, There's so much I want to say…"
Page 22: "IF YOU WERE A STORY" — "You'd be… a hero / a melody / a journey…" Creative metaphor page.
Page 23: FINAL MESSAGE — Short & powerful closing: "This is just the beginning…"
Page 24: BACK PAGE — Closing line with "Made with ❤️ by KahaaniSeKitab"

${occasion === "roast" ? `
ROAST BOOK RULES:
- Sarcastic, funny, savage but loving
- Exaggerate flaws for comedy
- Include real roast-worthy material from their details
- End with a genuine heartfelt twist
- Balance: 70% roast, 30% love
` : `
ADULT BOOK RULES:
- Deep emotional storytelling, realistic and relatable
- Include reflection, gratitude, emotional depth
- Balance warmth, humor, and sentiment
- Powerful one-liners throughout
- Occasion-specific emotional arc (follow the story arc above)
`}

WRITING STYLE:
- Human-like, heartfelt, NOT robotic
- NO repetition
- Storytelling, NOT bullet points
- Each page: concise but impactful (3-6 sentences)
- Include occasional powerful one-liners
- Maintain emotional build-up → peak → closure

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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured (needed for image generation)");

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

    const isKid = order.audience === "kid";
    const bookPrompt = isKid ? buildChildPrompt(order) : buildAdultPrompt(order);

    console.log("Generating story for order:", orderId, "audience:", order.audience);

    const storyTools = [{
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
    }];

    let storyData;
    try {
      storyData = await callTextAI(
        [
          { role: "system", content: "You are a professional book author. Return structured JSON only." },
          { role: "user", content: bookPrompt },
        ],
        storyTools,
        { type: "function", function: { name: "create_story" } },
        LOVABLE_API_KEY,
        OPENAI_API_KEY,
      );
    } catch (err) {
      console.error("All AI providers failed:", err);
      await adminClient.from("orders").update({ status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to generate story" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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

    console.log(`Story generated with ${story.pages.length} pages, creating illustrations...`);

    // Generate illustrations in batches
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
