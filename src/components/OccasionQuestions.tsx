import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OccasionQuestionsProps {
  occasion: string;
  birthdayType: string;
  name: string;
  form: Record<string, string>;
  onUpdate: (field: string, value: string) => void;
}

interface QuestionDef {
  field: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
}

const getQuestions = (occasion: string, birthdayType: string, name: string): QuestionDef[] => {
  const n = name || "them";
  const ns = name ? `${name}'s` : "their";

  switch (occasion) {
    case "wedding":
      return [
        { field: "personality", label: `How did ${n} and their partner meet?`, placeholder: "e.g. Through mutual friends at a college party" },
        { field: "funnyQuirks", label: `What's the funniest thing about their relationship?`, placeholder: "e.g. They argue about who makes better chai" },
        { field: "favoriteThings", label: `What do they love doing together?`, placeholder: "e.g. Traveling, cooking together, movie marathons" },
        { field: "hilariousMoment", label: `Share a funny or memorable couple moment`, placeholder: "e.g. The time they got lost on a road trip and ended up at a random village festival", multiline: true },
        { field: "bestFriends", label: `What's their love story in one line?`, placeholder: "e.g. Best friends who realized they were soulmates" },
        { field: "memorableAdventure", label: `How did the proposal happen?`, placeholder: "e.g. On a beach in Goa at sunset..." },
      ];

    case "anniversary":
      return [
        { field: "personality", label: `How many years have they been together?`, placeholder: "e.g. 5 wonderful years" },
        { field: "funnyQuirks", label: `What's their cutest couple habit?`, placeholder: "e.g. They finish each other's sentences" },
        { field: "favoriteThings", label: `What's the secret to their relationship?`, placeholder: "e.g. Lots of laughter and never going to bed angry" },
        { field: "hilariousMoment", label: `Share their most romantic or funny memory`, placeholder: "e.g. Dancing in the rain during their honeymoon", multiline: true },
        { field: "bestFriends", label: `What do they admire most about each other?`, placeholder: "e.g. Their kindness, sense of humor, determination" },
        { field: "memorableAdventure", label: `What's their biggest adventure together?`, placeholder: "e.g. Backpacking across Europe for a month" },
      ];

    case "roast":
      return [
        { field: "personality", label: `What's ${ns} most embarrassing habit?`, placeholder: "e.g. Talks to plants, dances in the elevator" },
        { field: "funnyQuirks", label: `What's the most ridiculous thing ${n} has ever done?`, placeholder: "e.g. Wore mismatched shoes to a wedding" },
        { field: "favoriteThings", label: `What does ${n} think they're good at but really aren't?`, placeholder: "e.g. Cooking — they once burned boiled eggs" },
        { field: "hilariousMoment", label: `Share the most cringe-worthy moment with ${n}`, placeholder: "e.g. Tried to impress a date and walked into a glass door", multiline: true },
        { field: "bestFriends", label: `What would ${ns} friends roast them about?`, placeholder: "e.g. Always late, terrible taste in music, can't park a car" },
        { field: "memorableAdventure", label: `Any legendary fails or disasters?`, placeholder: "e.g. Got lost in their own city using Google Maps" },
      ];

    case "mothers-day":
      return [
        { field: "personality", label: `How would you describe your mom's personality?`, placeholder: "e.g. Warm, fierce, and always knows best" },
        { field: "funnyQuirks", label: `What's her most endearing habit?`, placeholder: "e.g. Always packs extra food 'just in case'" },
        { field: "favoriteThings", label: `What does she love doing in her free time?`, placeholder: "e.g. Gardening, watching old Bollywood movies" },
        { field: "hilariousMoment", label: `Share a favorite memory with your mom`, placeholder: "e.g. The time she tried to use TikTok and accidentally went live", multiline: true },
        { field: "bestFriends", label: `What's the most important thing she taught you?`, placeholder: "e.g. To always be kind and to never skip breakfast" },
        { field: "memorableAdventure", label: `What makes her the best mom?`, placeholder: "e.g. She drops everything when we need her" },
      ];

    case "fathers-day":
      return [
        { field: "personality", label: `How would you describe your dad's personality?`, placeholder: "e.g. Strong, funny, and full of dad jokes" },
        { field: "funnyQuirks", label: `What's his signature dad move?`, placeholder: "e.g. Falls asleep on the couch every Sunday" },
        { field: "favoriteThings", label: `What does he love doing?`, placeholder: "e.g. Cricket, fixing things around the house, grilling" },
        { field: "hilariousMoment", label: `Share a classic dad moment`, placeholder: "e.g. The time he tried to 'fix' the WiFi by unplugging everything", multiline: true },
        { field: "bestFriends", label: `What's the best advice he's given you?`, placeholder: "e.g. Work hard, but don't forget to have fun" },
        { field: "memorableAdventure", label: `What makes him a great dad?`, placeholder: "e.g. Always there for every school event, no matter what" },
      ];

    case "graduation":
      return [
        { field: "personality", label: `What is ${n} graduating from?`, placeholder: "e.g. Engineering from IIT Delhi" },
        { field: "funnyQuirks", label: `What was ${ns} funniest college/school moment?`, placeholder: "e.g. Fell asleep during their own presentation" },
        { field: "favoriteThings", label: `What's ${ns} dream or next big goal?`, placeholder: "e.g. Working at a top tech company, traveling the world" },
        { field: "hilariousMoment", label: `Share a memorable moment from their journey`, placeholder: "e.g. Pulling an all-nighter before finals and still acing the exam", multiline: true },
        { field: "bestFriends", label: `Who were their closest friends during this journey?`, placeholder: "e.g. Their study group: Ravi, Priya, and Aditya" },
        { field: "memorableAdventure", label: `What are you most proud of about ${n}?`, placeholder: "e.g. Their determination to never give up" },
      ];

    case "retirement":
      return [
        { field: "personality", label: `What was ${ns} career/profession?`, placeholder: "e.g. 35 years as a school teacher" },
        { field: "funnyQuirks", label: `What will they NOT miss about work?`, placeholder: "e.g. Monday morning meetings, the commute" },
        { field: "favoriteThings", label: `What are they excited to do in retirement?`, placeholder: "e.g. Travel, learn painting, spend time with grandkids" },
        { field: "hilariousMoment", label: `Share a legendary work story about ${n}`, placeholder: "e.g. The time they accidentally replied-all to the entire company", multiline: true },
        { field: "bestFriends", label: `What's the biggest lesson from their career?`, placeholder: "e.g. Patience and persistence pay off" },
        { field: "memorableAdventure", label: `What will colleagues miss most about ${n}?`, placeholder: "e.g. Their humor, mentorship, and legendary chai breaks" },
      ];

    case "farewell":
      return [
        { field: "personality", label: `Where is ${n} going or what's changing?`, placeholder: "e.g. Moving to London, switching jobs, leaving the team" },
        { field: "funnyQuirks", label: `What will everyone miss most about ${n}?`, placeholder: "e.g. Their laugh, the snacks they always shared" },
        { field: "favoriteThings", label: `What was ${ns} signature move at work/school?`, placeholder: "e.g. Always the first to crack a joke in meetings" },
        { field: "hilariousMoment", label: `Share a favorite memory together`, placeholder: "e.g. The team trip where everything went hilariously wrong", multiline: true },
        { field: "bestFriends", label: `What's a wish or message for ${n}?`, placeholder: "e.g. Keep being awesome and don't forget us!" },
        { field: "memorableAdventure", label: `Describe ${n} in 3 words`, placeholder: "e.g. Loyal, hilarious, irreplaceable" },
      ];

    case "new-baby":
      return [
        { field: "personality", label: `What's the baby's name (or expected name)?`, placeholder: "e.g. Baby Arya" },
        { field: "funnyQuirks", label: `How are the parents feeling?`, placeholder: "e.g. Excited, nervous, and already losing sleep!" },
        { field: "favoriteThings", label: `Any special meaning behind the baby's name?`, placeholder: "e.g. Named after their grandmother" },
        { field: "hilariousMoment", label: `Share a funny pregnancy or parenting moment`, placeholder: "e.g. Dad fainted during the ultrasound", multiline: true },
        { field: "bestFriends", label: `What are the parents' hopes for the baby?`, placeholder: "e.g. To be kind, curious, and always loved" },
        { field: "memorableAdventure", label: `Who's most excited about the new arrival?`, placeholder: "e.g. The grandparents — they've already bought 50 outfits" },
      ];

    case "bachelorette":
      return [
        { field: "personality", label: `Describe the bride-to-be in 3 words`, placeholder: "e.g. Wild, kind, unstoppable" },
        { field: "funnyQuirks", label: `What's her most hilarious dating story?`, placeholder: "e.g. Went on a date and accidentally called them by her ex's name" },
        { field: "favoriteThings", label: `What does she love most about her partner?`, placeholder: "e.g. Their patience with her shopping addiction" },
        { field: "hilariousMoment", label: `Share the craziest girls' night out moment`, placeholder: "e.g. They ended up at karaoke singing until 3 AM", multiline: true },
        { field: "bestFriends", label: `Who are her ride-or-die friends?`, placeholder: "e.g. Meera, Ananya, and Kavya — the squad since college" },
        { field: "memorableAdventure", label: `What's the bride's guilty pleasure?`, placeholder: "e.g. Reality TV and midnight ice cream runs" },
      ];

    case "birthday":
      if (birthdayType === "pet") {
        return [
          { field: "personality", label: `How would you describe ${ns} personality?`, placeholder: "e.g. Goofy, loyal, and always hungry" },
          { field: "funnyQuirks", label: `What are ${ns} funniest quirks?`, placeholder: "e.g. Chases their own tail, barks at the mirror" },
          { field: "favoriteThings", label: `What does ${n} love doing?`, placeholder: "e.g. Fetching balls, napping in sunbeams, stealing socks" },
          { field: "favoriteTreats", label: `What are ${ns} favorite treats?`, placeholder: "e.g. Peanut butter, chicken treats, cheese" },
          { field: "sleepHabits", label: `Where and how does ${n} sleep?`, placeholder: "e.g. On the couch, curled up in a ball, steals the bed" },
          { field: "memorableAdventure", label: `What's ${ns} most memorable adventure?`, placeholder: "e.g. The time they escaped the yard and came back with a stick twice their size" },
        ];
      }
      // human birthday - falls through to default
      return [
        { field: "personality", label: `How would you describe ${ns} personality?`, placeholder: "e.g. Funny, adventurous, always smiling" },
        { field: "funnyQuirks", label: `What are ${ns} funniest quirks or habits?`, placeholder: "e.g. Always loses their keys, sings in the shower" },
        { field: "favoriteThings", label: `What does ${n} love doing?`, placeholder: "e.g. Cooking, hiking, binge-watching shows" },
        { field: "hilariousMoment", label: `Share a hilarious moment with ${n}`, placeholder: "e.g. That time they tried to cook and set off the fire alarm", multiline: true },
        { field: "bestFriends", label: `Who are ${ns} best friends?`, placeholder: "e.g. Jake, Sarah, and their dog Bruno" },
        { field: "memorableAdventure", label: `What's ${ns} most memorable adventure?`, placeholder: "e.g. Road trip to Goa, camping in the mountains" },
      ];

    case "just-because":
    default:
      return [
        { field: "personality", label: `How would you describe ${ns} personality?`, placeholder: "e.g. Funny, adventurous, always smiling" },
        { field: "funnyQuirks", label: `What are ${ns} funniest quirks or habits?`, placeholder: "e.g. Always loses their keys, sings in the shower" },
        { field: "favoriteThings", label: `What does ${n} love doing?`, placeholder: "e.g. Cooking, hiking, binge-watching shows" },
        { field: "hilariousMoment", label: `Share a favorite memory with ${n}`, placeholder: "e.g. That spontaneous road trip you took together", multiline: true },
        { field: "bestFriends", label: `Who are ${ns} closest people?`, placeholder: "e.g. Jake, Sarah, and their dog Bruno" },
        { field: "memorableAdventure", label: `What makes ${n} special?`, placeholder: "e.g. Their ability to make everyone laugh" },
      ];
  }
};

const occasionTitles: Record<string, string> = {
  wedding: "Tell Us About the Love Story 💒",
  anniversary: "Celebrate Their Journey Together 💕",
  roast: "Time to Roast! 🔥😂",
  "mothers-day": "Tell Us About Mom 💐",
  "fathers-day": "Tell Us About Dad 👔",
  graduation: "Celebrate the Graduate 🎓",
  retirement: "Celebrate Their Career 🎉",
  farewell: "Say a Special Goodbye 👋",
  "new-baby": "Welcome the Little One 👶",
  bachelorette: "About the Bride-to-Be 💃",
  birthday: "Tell Us About the Birthday Star 🎂",
  "just-because": "Tell Us More",
};

const occasionSubtitles: Record<string, string> = {
  wedding: "Help us write a beautiful love story for the couple!",
  anniversary: "Share what makes their relationship magical.",
  roast: "Don't hold back — the funnier, the better! 😈",
  "mothers-day": "Help us create a heartfelt tribute to mom.",
  "fathers-day": "Let's celebrate everything that makes dad awesome.",
  graduation: "Share memories from their journey to the top!",
  retirement: "Let's honor an incredible career.",
  farewell: "Help us create a memorable send-off.",
  "new-baby": "Share the excitement of this new chapter!",
  bachelorette: "Let's make this book as fun as the party!",
  birthday: "The more you share, the more personal the book!",
  "just-because": "The more you share, the more personal the book will be!",
};

const OccasionQuestions = ({ occasion, birthdayType, name, form, onUpdate }: OccasionQuestionsProps) => {
  const effectiveOccasion = occasion || "just-because";
  const questions = getQuestions(effectiveOccasion, birthdayType, name);
  const title = occasionTitles[effectiveOccasion] || `Tell us more about ${name || "them"}`;
  const subtitle = occasionSubtitles[effectiveOccasion] || "The more you share, the more personal the book will be!";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">{title}</h2>
        <p className="font-body text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        {questions.map(q => (
          <div key={q.field}>
            <Label className="font-body font-semibold">{q.label}</Label>
            {q.multiline ? (
              <textarea
                placeholder={q.placeholder}
                value={form[q.field] || ""}
                onChange={e => onUpdate(q.field, e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <Input
                placeholder={q.placeholder}
                value={form[q.field] || ""}
                onChange={e => onUpdate(q.field, e.target.value)}
                className="mt-1.5"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccasionQuestions;
