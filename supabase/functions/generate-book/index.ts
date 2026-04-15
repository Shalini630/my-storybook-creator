import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_TIMEOUT_MS = 30000;
const IMAGE_TIMEOUT_MS = 45000;

// --- TEXT AI: Gemini first, OpenAI fallback ---
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
    console.warn("Gemini error (timeout or network):", err instanceof Error ? err.message : err);
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

// --- IMAGE AI: Gemini first, DALL-E fallback ---
async function generateImage(
  prompt: string,
  lovableKey: string,
  openaiKey: string,
): Promise<string> {
  // Try Gemini image generation first
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
      console.warn("Gemini image returned no URL, falling back to DALL-E");
    } else {
      console.warn("Gemini image failed:", geminiRes.status);
    }
  } catch (err) {
    console.warn("Gemini image error:", err instanceof Error ? err.message : err);
  }

  // Fallback to OpenAI DALL-E
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
    } else {
      console.warn("DALL-E failed:", dalleRes.status);
    }
  } catch (err) {
    console.warn("DALL-E error:", err instanceof Error ? err.message : err);
  }

  return "";
}

// --- CHILD PROMPT (unchanged) ---
function buildChildPrompt(order: any): string {
  const name = order.name;
  const age = order.age || "5-7";
  const theme = order.theme;
  const details = order.personal_message || "";

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

// --- ADULT PROMPT (upgraded to novel/literary quality) ---
function buildAdultPrompt(order: any): string {
  const name = order.name;
  const theme = order.theme;
  const tone = order.tone || "Heartfelt";
  const dedication = order.dedication || "";
  const relationship = order.relationship || "";
  const details = order.personal_message || "";
  const memory = order.favorite_memory || "";
  const interests = order.interests || "";

  const occasionMatch = details.match(/Occasion:\s*([^.]+)/);
  const occasion = occasionMatch ? occasionMatch[1].trim() : "";

  // Extract all details from personal_message
  const extract = (key: string) => {
    const match = details.match(new RegExp(`${key}:\\s*([^.]+)`));
    return match ? match[1].trim() : "";
  };

  const personality = extract("Personality");
  const quirks = extract("Quirks");
  const favoriteThings = extract("Favorite things");
  const funnyMoment = extract("Funny moment");
  const bestFriends = extract("Best friends");
  const extra1 = extract("Extra detail");

  let occasionArc = "";
  switch (occasion) {
    case "anniversary":
      occasionArc = `
NARRATIVE ARC: A LOVE LETTER IN CHAPTERS
- Pages 5-6: THE MEETING — Write this like the opening chapter of a novel. Set the scene cinematically. What was the air like? What caught their eye first? Use sensory details, not summary.
- Pages 7-8: FALLING — The turning point. The moment that shifted everything from "maybe" to "certain." Write with the intimacy of a diary entry, the weight of something sacred.
- Pages 9-10: THE JOURNEY — The hard parts. The fights, the silences, the choosing each other anyway. Write with honesty and raw beauty. This is what makes love real, not a fairy tale.
- Pages 11-12: THE SMALL THINGS — The coffee made just right. The hand on the back. The private language. Write these micro-moments like prose poetry.
- Pages 13-14: TRANSFORMATION — How loving this person has changed you. Write with vulnerability. "Before you, I was..." "Because of you, I learned..."
- Pages 15-16: WHAT YOU ARE TO ME — Not what they do, but what they ARE. Write this as if you're trying to explain their essence to someone who's never met them.
- Pages 17-18: EMOTIONAL PEAK — The unsaid things. The 3am truths. Write this like it's the last page you'd ever write. Make it ache beautifully.
- Pages 19-20: FOREVER — Not a promise of perfection, but a promise of choosing. Write with quiet certainty.`;
      break;
    case "wedding":
      occasionArc = `
NARRATIVE ARC: THE GREATEST LOVE STORY
- Pages 5-6: BEFORE — Two separate lives, two incomplete stories. Paint who they were before they found each other. Use cinematic detail.
- Pages 7-8: THE COLLISION — How they met. Write it like the inciting incident of a great novel. Make it feel inevitable in hindsight.
- Pages 9-10: THE COURTSHIP — The dance of falling. First dates, nervous laughter, the moment walls came down. Write with warmth and gentle humor.
- Pages 11-12: THE BECOMING — How they became "us" instead of "you and I." The inside jokes, the rituals, the shorthand.
- Pages 13-14: THE STORMS — What they've weathered. Write with honesty—real love isn't absence of conflict, it's the art of returning.
- Pages 15-16: THE CERTAINTY — Why them? Why forever? Write this like a closing argument for the greatest love you've witnessed.
- Pages 17-18: THE VOW — Not recited words, but the real promise. The unspoken contract. Write it raw and beautiful.
- Pages 19-20: THE BEGINNING — Because a wedding isn't an ending, it's Chapter One of the rest. Write with hope and electricity.`;
      break;
    case "mothers-day":
      occasionArc = `
NARRATIVE ARC: A DAUGHTER/SON'S TESTIMONY
- Pages 5-6: PORTRAIT — Paint her as a character in a novel. Not "my mom is great" but who she IS — her gestures, her voice, her way of entering a room.
- Pages 7-8: THE EARLY DAYS — Childhood through adult eyes. The safety she created. Write with sensory nostalgia—smells, sounds, textures.
- Pages 9-10: HER SACRIFICE — What she gave up that you only understand now. Write this with the weight of adult realization.
- Pages 11-12: HER STRENGTH — The times she held everything together. Write her as the protagonist she is—flawed, fierce, unbreakable.
- Pages 13-14: HER JOY — Her laughter, her guilty pleasures, her secret rebellions. Write her as a full human, not just a mother.
- Pages 15-16: WHAT SHE TAUGHT — Not lessons she said, but lessons she lived. Write these as realized truths.
- Pages 17-18: THE WORDS I OWE HER — Everything you've swallowed. Everything you assumed she knew. Write it now. Write it raw.
- Pages 19-20: MY WISH FOR HER — Not generic blessings, but specific dreams. Write it like a prayer you actually mean.`;
      break;
    case "fathers-day":
      occasionArc = `
NARRATIVE ARC: A LETTER HE'LL NEVER ASK FOR
- Pages 5-6: THE MAN — Not "dad" but the man himself. His hands, his silences, his way of showing up. Write him like a character study.
- Pages 7-8: FIRST MEMORIES — The earliest imprint. Safety, adventure, the first time you realized he was human. Write with tender specificity.
- Pages 9-10: THE QUIET SACRIFICES — The things he never mentioned. The overtime, the worry, the "I'm fine." Write what you now understand.
- Pages 11-12: HIS LESSONS — Not lectures but demonstrations. "He never told me to be brave, he just was." Write through example.
- Pages 13-14: HIS HUMANITY — The dad jokes. The embarrassing moments. The stubbornness. Write him fully—lovable flaws and all.
- Pages 15-16: WHAT I BECAME BECAUSE OF HIM — The direct line from his character to yours. Trace the inheritance.
- Pages 17-18: WHAT I NEVER SAID — Men don't always hear these words. Write them anyway. Make them count.
- Pages 19-20: GRATITUDE — Specific, earned, overdue. Not a card message. A reckoning with how much he matters.`;
      break;
    case "farewell":
      occasionArc = `
NARRATIVE ARC: THE ART OF GOODBYE
- Pages 5-6: THE BEGINNING — When this chapter of life started. Set the scene with novelistic detail. What was the world like then?
- Pages 7-8: THE GOLDEN MOMENTS — The memories that crystallize. Write them in present tense—make them live again.
- Pages 9-10: THE LAUGHTER — Inside jokes, absurd moments, shared madness. Write with the energy of midnight conversations.
- Pages 11-12: THE IMPACT — How they changed the shape of your life. Write this like you're mapping the architecture of influence.
- Pages 13-14: WHAT I'LL CARRY — Not what you'll miss, but what you'll keep. The permanent marks on your character.
- Pages 15-16: THE HARD PART — Acknowledge the loss. Don't pretty it up. Write the ache honestly.
- Pages 17-18: WHAT I WANT YOU TO KNOW — The final transmission. No pretense. Just truth.
- Pages 19-20: NOT GOODBYE — Because real connections don't end with distance. Write the continuation.`;
      break;
    case "graduation":
      occasionArc = `
NARRATIVE ARC: THE BECOMING
- Pages 5-6: THE BEGINNING — Who they were when this started. Write the "before" portrait with fondness and honesty.
- Pages 7-8: THE CRUCIBLE — The defining experiences. Not just academics—the friendships, the failures, the 2am breakthroughs.
- Pages 9-10: THE HARD PARTS — What almost broke them. The moments of doubt. Write with respect for the struggle.
- Pages 11-12: THE JOY — The friendships, the wild times, the moments of pure aliveness. Write these scenes vividly.
- Pages 13-14: THE TRANSFORMATION — Compare who walked in to who walks out. Chart the growth like a novelist.
- Pages 15-16: THE PEOPLE — Those who shaped the journey. Mentors, friends, unlikely teachers. Honor them specifically.
- Pages 17-18: THE PRIDE — Not generic congratulations. Specific, earned admiration. Write what makes this person extraordinary.
- Pages 19-20: THE OPEN ROAD — The future as possibility, not pressure. Write with excitement, not advice.`;
      break;
    case "roast":
      occasionArc = `
NARRATIVE ARC: THE ROAST (A COMEDY IN CHAPTERS)
- Pages 5-6: INTRODUCING THE DEFENDANT — Present them like a true crime documentary subject, except the crime is their personality. Deadpan, detailed, devastating.
- Pages 7-8: EXHIBIT A: HABITS — Their most roast-worthy behaviors, described with the precision of a court filing and the savagery of a stand-up set.
- Pages 9-10: THE GREATEST HITS — Their legendary failures, told as epic stories. Build them up just to knock them down harder.
- Pages 11-12: DELUSION VS REALITY — What they think they are vs. what they actually are. Use side-by-side comparisons for maximum comedy.
- Pages 13-14: THE SAVAGE LINES — Pure roast material. Sharp, specific, personal. These should sting in the best way.
- Pages 15-16: THE SIGNATURE MOVES — Their most predictable, eye-rolling behaviors catalogued with loving contempt.
- Pages 17-18: THE TWIST — Drop the act. Reveal the real feelings underneath the comedy. This should hit like a truck after all the laughter.
- Pages 19-20: THE VERDICT — Backhanded love. "Despite being objectively the worst, you're somehow also the best." Close with earned warmth.`;
      break;
    case "birthday":
    default:
      occasionArc = `
NARRATIVE ARC: THE BOOK OF YOU
- Pages 5-6: WHO YOU ARE — Not a list of traits. A portrait. Write them the way a novelist writes a protagonist—through specific details, gestures, contradictions. What they're like when no one's watching.
- Pages 7-8: YOUR EVOLUTION — The chapters of their life. Not a timeline—a transformation. Who they were, who they became, the pivots in between.
- Pages 9-10: THE MOMENTS THAT MATTER — Specific memories rendered in vivid detail. Write scenes, not summaries. Put the reader there.
- Pages 11-12: YOUR BEAUTIFUL MESS — The quirks, the contradictions, the things that make them infuriating and lovable in equal measure. Write with affection.
- Pages 13-14: YOUR IMPACT — How knowing them has changed the world around them—and specifically, changed you. Write with authentic gratitude.
- Pages 15-16: WHAT SHOULD NEVER CHANGE — The non-negotiable parts of who they are. The things you'd fight to protect.
- Pages 17-18: THE UNSAID — What you've been meaning to say. What you assumed they knew. Write it now, without armor.
- Pages 19-20: YOUR NEXT CHAPTER — Not generic wishes. Specific, personal hopes. Write their future like you can already see it.`;
      break;
  }

  return `
You are a literary author writing a deeply personal, beautifully crafted book. This is NOT a children's book or a fairy tale. This is a mature, emotionally sophisticated piece of writing — think of it as a short novel, a memoir, or a collection of literary essays about a real person.

CRITICAL STYLE RULES:
- Write like a published author, not a greeting card
- Use rich, sensory prose — show, don't tell
- Every sentence should carry weight — no filler, no fluff
- Vary sentence structure: short punches, flowing passages, fragments for impact
- Use metaphor and imagery, but keep it grounded and authentic
- Include specific details (from the input below) woven naturally into the narrative
- This should feel like literature, not a template
- NO childish language, NO fairy tale tone, NO "once upon a time"
- Think: The writing quality of a Khaled Hosseini dedication meets a John Green love letter

INPUT:
- Name: ${name}
- Occasion: ${occasion || "Birthday"}
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
${memory ? `- Memorable Moment: ${memory}` : ""}

BOOK STRUCTURE (EXACTLY 24 pages):
Page 1: COVER — A compelling title featuring ${name}. Not cutesy — think book-jacket worthy. Occasion: ${occasion || "Birthday"}.
Page 2: DEDICATION — "For ${name}," — ${dedication ? dedication : "followed by a line that makes them stop breathing for a second"}. Write this like the opening line of a novel.
Page 3: PRELUDE — ${tone === "Romantic" || occasion === "anniversary" || occasion === "wedding" ? `A meaningful song or poem reference. Include "[QR CODE HERE]" placeholder.` : `An evocative opening moment — a memory, a sensation, a question — that sets the emotional key of the entire book. Include "[QR CODE HERE]" placeholder.`}
Page 4: CHAPTER ONE — The opening paragraph that hooks the reader. Set the emotional landscape. "There are people who change the temperature of every room they walk into..." Write with authority and intimacy.
${occasionArc}
Page 21: THE LETTER — "Dear ${name}," — This is the raw, unfiltered letter. Drop all literary pretense and write from the gut. This should be the most honest page in the book.
Page 22: IF YOU WERE A STORY — A page of literary metaphors. "If you were a novel, you'd be the kind readers finish at 3am and immediately start again." "If you were a song, you'd be the one people play when they need to feel something real." Make each metaphor specific and surprising.
Page 23: THE LAST LINE — One powerful closing paragraph. The kind that makes someone close the book slowly and sit in silence. ${tone === "Humorous" ? "End with a laugh that hides something deeper." : "End with quiet, unshakeable truth."}
Page 24: COLOPHON — "Made with ❤️ by KahaaniSeKitab" and a brief, elegant closing line.

${occasion === "roast" ? `
ROAST RULES:
- Think Comedy Central Roast meets literary wit
- Sharp, intelligent humor — not mean-spirited
- Observational comedy that proves you REALLY know this person
- Build running jokes through the book
- The humor should feel curated, not random
- 70% savage comedy, 30% genuine love (the twist at the end should HIT)
- Reference specific details to make it personal, not generic
` : `
WRITING RULES:
- This is PROSE, not poetry. Write in flowing paragraphs.
- Each page should read like a chapter of a beautiful short novel
- 5-8 sentences per page — substantial, not sparse
- Build emotional momentum: intrigue → warmth → depth → vulnerability → catharsis → hope
- Use the personal details provided to make it SPECIFIC — generic sentiment is the enemy
- Every page should have at least one line that could be underlined and remembered
- Real emotions have contradictions — embrace them
- Don't shy away from the bittersweet, the complicated, the imperfect
`}

TONE GUIDANCE (${tone}):
${{
    "Humorous": "Witty and warm, like a best man speech that makes everyone laugh AND cry. Smart humor, not slapstick.",
    "Heartfelt": "Tender and genuine, like a letter you'd write at midnight. Vulnerability is strength here.",
    "Adventurous": "Bold and vivid, like travel writing about a person instead of a place. Make their life feel epic.",
    "Inspirational": "Powerful and uplifting, like a TED talk wrapped in a love letter. Conviction without cliché.",
    "Romantic": "Intimate and sensual (tastefully), like the best passages of a love story. Heat and tenderness.",
    "Mysterious": "Atmospheric and intriguing, like literary fiction. Reveal the subject layer by layer.",
  }[tone] || "Authentic and moving. Write like you mean every word."}

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
          { role: "system", content: isKid ? "You are a professional children's book author. Return structured JSON only." : "You are a literary author who writes with the emotional depth of Khaled Hosseini and the wit of David Sedaris. Return structured JSON only." },
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

    // Generate illustrations in batches with fallback
    const illustrations: string[] = [];
    const batchSize = 4;
    for (let i = 0; i < story.pages.length; i += batchSize) {
      const batch = story.pages.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((page: any) => {
          const style = isKid
            ? "Children's book illustration. Colorful, whimsical, magical, high quality. No text in the image."
            : "Elegant, sophisticated book illustration. Rich, cinematic, painterly style like a premium novel cover. Warm tones, atmospheric lighting. No text in the image.";
          return generateImage(
            `Create a beautiful illustration: ${page.illustrationPrompt}. Style: ${style}`,
            LOVABLE_API_KEY,
            OPENAI_API_KEY,
          );
        })
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
