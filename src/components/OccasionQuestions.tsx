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

interface SectionDef {
  title: string;
  emoji: string;
  questions: QuestionDef[];
}

const getSections = (occasion: string, birthdayType: string, name: string): SectionDef[] => {
  const n = name || "them";
  const ns = name ? `${name}'s` : "their";

  switch (occasion) {
    case "birthday":
      if (birthdayType === "pet") {
        return [
          { title: "Their Personality", emoji: "🐾", questions: [
            { field: "personality", label: `How would you describe ${ns} personality?`, placeholder: "e.g. Goofy, loyal, and always hungry" },
            { field: "funnyQuirks", label: `What are ${ns} funniest quirks?`, placeholder: "e.g. Chases their own tail, barks at the mirror" },
          ]},
          { title: "Their Favorites", emoji: "❤️", questions: [
            { field: "favoriteThings", label: `What does ${n} love doing?`, placeholder: "e.g. Fetching balls, napping in sunbeams" },
            { field: "favoriteTreats", label: `What are ${ns} favorite treats?`, placeholder: "e.g. Peanut butter, chicken treats" },
            { field: "sleepHabits", label: `Where and how does ${n} sleep?`, placeholder: "e.g. On the couch, curled up in a ball" },
          ]},
          { title: "Memorable Moments", emoji: "📸", questions: [
            { field: "memorableAdventure", label: `${ns} most memorable adventure?`, placeholder: "e.g. Escaped the yard and came back with a huge stick" },
            { field: "extraDetail1", label: `Relationship with family/other pets?`, placeholder: "e.g. Best friends with the cat, scared of vacuum" },
          ]},
          { title: "Why They're Special", emoji: "🌟", questions: [
            { field: "extraDetail2", label: `What makes ${n} the best pet ever?`, placeholder: "e.g. Always knows when you're sad and comes to cuddle", multiline: true },
          ]},
        ];
      }
      return [
        { title: "Their Story", emoji: "🎂", questions: [
          { field: "personality", label: `How would you describe ${n} in 3-5 words?`, placeholder: "e.g. Funny, adventurous, always smiling" },
          { field: "funnyQuirks", label: `What makes ${n} different from everyone else?`, placeholder: "e.g. Always loses their keys, sings in the shower" },
          { field: "extraDetail3", label: `Something that instantly reminds you of ${n}?`, placeholder: "e.g. Their infectious laugh, a specific gesture" },
        ]},
        { title: "Their Journey", emoji: "🛤️", questions: [
          { field: "favoriteThings", label: `How were they when you first met?`, placeholder: "e.g. Shy but hilarious once you got to know them" },
          { field: "hilariousMoment", label: `What has changed the most about them?`, placeholder: "e.g. They've become so much more confident", multiline: true },
          { field: "bestFriends", label: `A phase of life where they grew a lot?`, placeholder: "e.g. After moving to a new city" },
        ]},
        { title: "Defining Memories", emoji: "✨", questions: [
          { field: "memorableAdventure", label: `A moment that made you proud of ${n}`, placeholder: "e.g. When they stood up for a friend", multiline: true },
          { field: "extraDetail1", label: `A funny moment you'll never forget`, placeholder: "e.g. That time they tried cooking and set off the alarm" },
        ]},
        { title: "Appreciation & Future", emoji: "🌟", questions: [
          { field: "extraDetail2", label: `What do you admire most about ${n}?`, placeholder: "e.g. Their resilience, humor, kindness", multiline: true },
        ]},
      ];

    case "anniversary":
      return [
        { title: "Where It All Started", emoji: "💕", questions: [
          { field: "personality", label: `How did you first meet?`, placeholder: "e.g. Through mutual friends at a party" },
          { field: "funnyQuirks", label: `What was your first impression?`, placeholder: "e.g. Thought they were way out of my league" },
          { field: "favoriteThings", label: `What stood out about them immediately?`, placeholder: "e.g. Their smile lit up the room" },
        ]},
        { title: "Falling in Love", emoji: "💘", questions: [
          { field: "hilariousMoment", label: `When did you realize you loved them?`, placeholder: "e.g. During a rainy night when they made me laugh through tears", multiline: true },
          { field: "bestFriends", label: `What moment changed everything?`, placeholder: "e.g. The first road trip together" },
        ]},
        { title: "Your Journey Together", emoji: "🛤️", questions: [
          { field: "memorableAdventure", label: `A challenge you faced together`, placeholder: "e.g. Long distance for a year", multiline: true },
          { field: "extraDetail1", label: `A moment that strengthened your bond`, placeholder: "e.g. Supporting each other through family troubles" },
        ]},
        { title: "The Little Things", emoji: "🥰", questions: [
          { field: "extraDetail2", label: `Their cutest habit & an inside joke`, placeholder: "e.g. They hum when cooking; 'remember the pizza incident'", multiline: true },
        ]},
        { title: "Heart & Forever", emoji: "💖", questions: [
          { field: "extraDetail3", label: `Something you've never said before & what forever looks like`, placeholder: "e.g. You saved me in ways you'll never know. Forever is Sunday mornings with you.", multiline: true },
        ]},
      ];

    case "wedding":
      return [
        { title: "The Love Story", emoji: "💒", questions: [
          { field: "personality", label: `How did the couple meet?`, placeholder: "e.g. Through mutual friends at a college party" },
          { field: "funnyQuirks", label: `What's the funniest thing about their relationship?`, placeholder: "e.g. They argue about who makes better chai" },
          { field: "favoriteThings", label: `What do they love doing together?`, placeholder: "e.g. Traveling, cooking together, movie marathons" },
        ]},
        { title: "The Journey", emoji: "💍", questions: [
          { field: "hilariousMoment", label: `How did the proposal happen?`, placeholder: "e.g. On a beach in Goa at sunset...", multiline: true },
          { field: "bestFriends", label: `What's their love story in one line?`, placeholder: "e.g. Best friends who realized they were soulmates" },
        ]},
        { title: "What Makes Them Special", emoji: "✨", questions: [
          { field: "memorableAdventure", label: `What would they say is each other's best quality?`, placeholder: "e.g. She loves his humor, he loves her determination", multiline: true },
          { field: "extraDetail1", label: `What song represents their love story?`, placeholder: "e.g. 'Tum Hi Ho', 'Perfect' by Ed Sheeran" },
        ]},
        { title: "Dreams", emoji: "🌟", questions: [
          { field: "extraDetail2", label: `Dream honeymoon & future together?`, placeholder: "e.g. Maldives, building a home full of laughter", multiline: true },
        ]},
      ];

    case "mothers-day":
      return [
        { title: "Her Love", emoji: "💐", questions: [
          { field: "personality", label: `What makes your mom special?`, placeholder: "e.g. Warm, fierce, and always knows best" },
          { field: "funnyQuirks", label: `How does she show love?`, placeholder: "e.g. Always packs extra food 'just in case'" },
        ]},
        { title: "Childhood Memories", emoji: "🧒", questions: [
          { field: "favoriteThings", label: `A moment she cared for you that you'll never forget`, placeholder: "e.g. Stayed up all night when I was sick" },
          { field: "hilariousMoment", label: `A memory where she made everything okay`, placeholder: "e.g. After my first heartbreak, she made my favorite meal", multiline: true },
        ]},
        { title: "Her Sacrifices & Strength", emoji: "💪", questions: [
          { field: "bestFriends", label: `Something she gave up for you`, placeholder: "e.g. Her career to raise us" },
          { field: "memorableAdventure", label: `A time she showed incredible strength`, placeholder: "e.g. Handled dad's job loss with grace and optimism", multiline: true },
        ]},
        { title: "Today & Heart Message", emoji: "❤️", questions: [
          { field: "extraDetail1", label: `What do you admire about her today?`, placeholder: "e.g. Her patience, her cooking, her unwavering faith" },
          { field: "extraDetail2", label: `What do you want to say to her now?`, placeholder: "e.g. Thank you for being my rock. I love you more than words.", multiline: true },
        ]},
      ];

    case "fathers-day":
      return [
        { title: "Who He Is", emoji: "👔", questions: [
          { field: "personality", label: `Describe your dad in 3-5 words`, placeholder: "e.g. Strong, funny, and full of dad jokes" },
          { field: "funnyQuirks", label: `What is his "dad signature move"?`, placeholder: "e.g. Falls asleep on the couch every Sunday" },
        ]},
        { title: "Childhood Memories", emoji: "🧒", questions: [
          { field: "favoriteThings", label: `Your earliest memory with him`, placeholder: "e.g. Him teaching me to ride a bicycle" },
          { field: "hilariousMoment", label: `A moment he protected or supported you`, placeholder: "e.g. Drove 3 hours in rain to pick me up from camp", multiline: true },
        ]},
        { title: "Sacrifices & Lessons", emoji: "📖", questions: [
          { field: "bestFriends", label: `A silent sacrifice he made`, placeholder: "e.g. Worked double shifts so I could go to college" },
          { field: "memorableAdventure", label: `One lesson he taught you that stayed`, placeholder: "e.g. Work hard but never forget to have fun" },
        ]},
        { title: "The Unsaid", emoji: "💙", questions: [
          { field: "extraDetail1", label: `Something you never told him`, placeholder: "e.g. I'm proud to be your kid" },
          { field: "extraDetail2", label: `What you want to thank him for`, placeholder: "e.g. For being there every single time, even when I didn't ask", multiline: true },
        ]},
      ];

    case "farewell":
      return [
        { title: "The Journey", emoji: "👋", questions: [
          { field: "personality", label: `Where is ${n} going or what's changing?`, placeholder: "e.g. Moving to London, switching jobs" },
          { field: "funnyQuirks", label: `When did this journey start & what made it special?`, placeholder: "e.g. 3 years ago, best team ever" },
        ]},
        { title: "Memories Together", emoji: "📸", questions: [
          { field: "favoriteThings", label: `Your favorite moment together`, placeholder: "e.g. The team trip where everything went hilariously wrong" },
          { field: "hilariousMoment", label: `A funny incident you'll always remember`, placeholder: "e.g. They accidentally emailed the CEO a meme", multiline: true },
        ]},
        { title: "Impact & Missing", emoji: "💔", questions: [
          { field: "bestFriends", label: `How did ${n} impact your life?`, placeholder: "e.g. They taught me to not take things too seriously" },
          { field: "memorableAdventure", label: `What will you miss the most?`, placeholder: "e.g. Their laugh, the snacks they always shared", multiline: true },
        ]},
        { title: "Goodbye Message", emoji: "✈️", questions: [
          { field: "extraDetail1", label: `Your message & wish for ${n}`, placeholder: "e.g. Keep being awesome, the world needs more of you", multiline: true },
        ]},
      ];

    case "graduation":
      return [
        { title: "The Beginning", emoji: "🎓", questions: [
          { field: "personality", label: `What is ${n} graduating from?`, placeholder: "e.g. Engineering from IIT Delhi" },
          { field: "funnyQuirks", label: `What were the expectations at the start?`, placeholder: "e.g. Nervous but excited to start a new chapter" },
        ]},
        { title: "The Experience", emoji: "📚", questions: [
          { field: "favoriteThings", label: `Best memory from this journey`, placeholder: "e.g. The late-night study sessions that turned into parties" },
          { field: "hilariousMoment", label: `Hardest moment & how they overcame it`, placeholder: "e.g. Failed an exam but came back stronger", multiline: true },
        ]},
        { title: "Growth & People", emoji: "🌱", questions: [
          { field: "bestFriends", label: `How have they changed through this journey?`, placeholder: "e.g. From shy to confident, from unsure to determined" },
          { field: "memorableAdventure", label: `Who made it special? Closest friends/mentors`, placeholder: "e.g. Ravi, Priya — the study group that became family" },
        ]},
        { title: "Future & Pride", emoji: "🚀", questions: [
          { field: "extraDetail1", label: `What are you most proud of about ${n}?`, placeholder: "e.g. Their determination to never give up" },
          { field: "extraDetail2", label: `Dreams & wishes for what's next`, placeholder: "e.g. Conquer the world, stay curious, never stop growing", multiline: true },
        ]},
      ];

    case "roast":
      return [
        { title: "The Roast Begins 🔥", emoji: "😈", questions: [
          { field: "personality", label: `What makes ${n} roast-worthy?`, placeholder: "e.g. Thinks they're Gordon Ramsay but burns toast" },
          { field: "funnyQuirks", label: `Most annoying habit?`, placeholder: "e.g. Always late, talks during movies" },
        ]},
        { title: "Epic Fails", emoji: "🤦", questions: [
          { field: "favoriteThings", label: `What does ${n} think they're good at but really aren't?`, placeholder: "e.g. Cooking — once burned boiled eggs" },
          { field: "hilariousMoment", label: `Most cringe-worthy moment with ${n}`, placeholder: "e.g. Tried to impress a date and walked into a glass door", multiline: true },
        ]},
        { title: "The Roast Lines", emoji: "🎤", questions: [
          { field: "bestFriends", label: `What would friends roast them about?`, placeholder: "e.g. Always late, terrible music taste, can't park" },
          { field: "memorableAdventure", label: `Write 2-3 savage roast lines`, placeholder: "e.g. 'Your cooking is why delivery apps exist'", multiline: true },
          { field: "extraDetail1", label: `If ${n} had a warning label, what would it say?`, placeholder: "e.g. 'Caution: Will steal your fries'" },
        ]},
        { title: "The Soft Ending 😄", emoji: "❤️", questions: [
          { field: "extraDetail2", label: `One genuinely nice thing about ${n}`, placeholder: "e.g. Despite everything, they're the most loyal friend ever", multiline: true },
        ]},
      ];

    case "retirement":
      return [
        { title: "The Career", emoji: "💼", questions: [
          { field: "personality", label: `What was ${ns} career/profession?`, placeholder: "e.g. 35 years as a school teacher" },
          { field: "funnyQuirks", label: `What will they NOT miss about work?`, placeholder: "e.g. Monday morning meetings, the commute" },
        ]},
        { title: "Work Stories", emoji: "📸", questions: [
          { field: "favoriteThings", label: `What are they excited to do in retirement?`, placeholder: "e.g. Travel, painting, time with grandkids" },
          { field: "hilariousMoment", label: `A legendary work story about ${n}`, placeholder: "e.g. Accidentally replied-all to the entire company", multiline: true },
        ]},
        { title: "Legacy", emoji: "🏆", questions: [
          { field: "bestFriends", label: `What's the biggest lesson from their career?`, placeholder: "e.g. Patience and persistence pay off" },
          { field: "memorableAdventure", label: `Their proudest professional achievement`, placeholder: "e.g. Mentored 500+ students" },
        ]},
        { title: "What's Next", emoji: "🌅", questions: [
          { field: "extraDetail1", label: `What will colleagues miss most?`, placeholder: "e.g. Their humor, mentorship, legendary chai breaks" },
          { field: "extraDetail2", label: `Their retirement bucket list`, placeholder: "e.g. Learn guitar, visit Japan, write a book", multiline: true },
        ]},
      ];

    case "new-baby":
      return [
        { title: "The New Arrival", emoji: "👶", questions: [
          { field: "personality", label: `Baby's name (or expected name)?`, placeholder: "e.g. Baby Arya" },
          { field: "funnyQuirks", label: `How are the parents feeling?`, placeholder: "e.g. Excited, nervous, already losing sleep!" },
          { field: "favoriteThings", label: `Special meaning behind the name?`, placeholder: "e.g. Named after their grandmother" },
        ]},
        { title: "Funny Moments", emoji: "😄", questions: [
          { field: "hilariousMoment", label: `A funny pregnancy or parenting moment`, placeholder: "e.g. Dad fainted during the ultrasound", multiline: true },
        ]},
        { title: "Hopes & Dreams", emoji: "🌟", questions: [
          { field: "bestFriends", label: `Parents' hopes for the baby?`, placeholder: "e.g. To be kind, curious, and always loved" },
          { field: "memorableAdventure", label: `Who's most excited about the arrival?`, placeholder: "e.g. The grandparents — already bought 50 outfits" },
        ]},
        { title: "Family & Traditions", emoji: "👨‍👩‍👧", questions: [
          { field: "extraDetail1", label: `What does the nursery look like?`, placeholder: "e.g. Jungle theme with tiny animal plushies" },
          { field: "extraDetail2", label: `Family traditions the baby will grow up with?`, placeholder: "e.g. Sunday family dinners, annual beach trips", multiline: true },
        ]},
      ];

    case "bachelorette":
      return [
        { title: "The Bride-to-Be", emoji: "💃", questions: [
          { field: "personality", label: `Describe her in 3 words`, placeholder: "e.g. Wild, kind, unstoppable" },
          { field: "funnyQuirks", label: `Her most hilarious dating story?`, placeholder: "e.g. Accidentally called a date by her ex's name" },
        ]},
        { title: "The Love Story", emoji: "💕", questions: [
          { field: "favoriteThings", label: `What does she love most about her partner?`, placeholder: "e.g. Their patience with her shopping addiction" },
          { field: "hilariousMoment", label: `Craziest girls' night out moment`, placeholder: "e.g. Ended up at karaoke singing until 3 AM", multiline: true },
        ]},
        { title: "The Squad", emoji: "👯", questions: [
          { field: "bestFriends", label: `Who are her ride-or-die friends?`, placeholder: "e.g. Meera, Ananya, and Kavya — since college" },
          { field: "memorableAdventure", label: `Her guilty pleasure?`, placeholder: "e.g. Reality TV and midnight ice cream runs" },
        ]},
        { title: "Advice for the Groom", emoji: "😂", questions: [
          { field: "extraDetail1", label: `Funniest thing about her relationship?`, placeholder: "e.g. Dedicated meme chat with 10,000+ messages" },
          { field: "extraDetail2", label: `Advice for the groom?`, placeholder: "e.g. Never touch the thermostat, always agree on food", multiline: true },
        ]},
      ];

    case "just-because":
    default:
      return [
        { title: "About Them", emoji: "✨", questions: [
          { field: "personality", label: `How would you describe ${n}?`, placeholder: "e.g. Funny, adventurous, always smiling" },
          { field: "funnyQuirks", label: `Funniest quirks or habits?`, placeholder: "e.g. Always loses their keys, sings in shower" },
          { field: "favoriteThings", label: `What does ${n} love doing?`, placeholder: "e.g. Cooking, hiking, binge-watching shows" },
        ]},
        { title: "Memories", emoji: "📸", questions: [
          { field: "hilariousMoment", label: `Share a favorite memory with ${n}`, placeholder: "e.g. That spontaneous road trip", multiline: true },
          { field: "memorableAdventure", label: `What makes ${n} special?`, placeholder: "e.g. Their ability to make everyone laugh" },
        ]},
        { title: "Personal Touch", emoji: "🌟", questions: [
          { field: "extraDetail1", label: `A secret talent or hidden skill?`, placeholder: "e.g. Can solve a Rubik's cube in under a minute" },
          { field: "extraDetail2", label: `If ${n} could live in any fictional world?`, placeholder: "e.g. Hogwarts, Middle Earth, the Marvel universe" },
        ]},
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
  "just-because": "Tell Us More ✨",
};

const occasionSubtitles: Record<string, string> = {
  wedding: "Help us write a beautiful love story for the couple!",
  anniversary: "Share what makes their love story magical.",
  roast: "Don't hold back — the funnier, the better! 😈",
  "mothers-day": "Help us create a heartfelt tribute to mom.",
  "fathers-day": "Let's celebrate everything that makes dad awesome.",
  graduation: "Share memories from their journey to the top!",
  retirement: "Let's honor an incredible career.",
  farewell: "Help us create a memorable send-off.",
  "new-baby": "Share the excitement of this new chapter!",
  bachelorette: "Let's celebrate the bride-to-be!",
  birthday: "The more you share, the more magical the book!",
  "just-because": "Share what makes them special!",
};

const OccasionQuestions = ({ occasion, birthdayType, name, form, onUpdate }: OccasionQuestionsProps) => {
  const effectiveOccasion = occasion || "just-because";
  const title = occasionTitles[effectiveOccasion] || "Tell Us More ✨";
  const subtitle = occasionSubtitles[effectiveOccasion] || "Share what makes them special!";
  const sections = getSections(effectiveOccasion, birthdayType, name);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">{title}</h2>
        <p className="font-body text-muted-foreground">{subtitle}</p>
      </div>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <span className="text-lg">{section.emoji}</span> {section.title}
          </h3>
          {section.questions.map((q) => (
            <div key={q.field}>
              <Label className="font-body text-sm font-medium text-foreground">{q.label}</Label>
              {q.multiline ? (
                <textarea
                  placeholder={q.placeholder}
                  value={form[q.field] || ""}
                  onChange={(e) => onUpdate(q.field, e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <Input
                  placeholder={q.placeholder}
                  value={form[q.field] || ""}
                  onChange={(e) => onUpdate(q.field, e.target.value)}
                  className="mt-1.5"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OccasionQuestions;
