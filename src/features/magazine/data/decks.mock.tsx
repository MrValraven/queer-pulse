import { memberName } from "../../members/data/members";
import type { SlideDeck } from "./decks";

// Demo-only deck registry. Imported ONLY via the demo-gated dynamic import() in
// api/useDeck.ts (never statically) so it code-splits out of the live bundle.

export const decks: Record<string, SlideDeck> = {
  "ten-years-mouraria": {
    id: "ten-years-mouraria",
    kicker: "Interactive · Feature",
    section: "Features",
    title: (
      <>
        Ten years in Mouraria,
        <br />
        <em>slide by slide</em>
      </>
    ),
    byline: memberName("ines"),
    role: `Photography by ${memberName("andre")}`,
    date: "June 2026",
    readTime: "7 slides · 4 min",
    initials: "IT",
    tint: "jade",
    cover:
      "https://images.unsplash.com/photo-1601977078202-8825cd23ddf3?q=80&w=1000&auto=format&fit=crop",
    coverDesc:
      "Narrow street in Mouraria, late afternoon light, laundry lines overhead",
    authorBio: `${memberName("ines")} writes about community, place, and the social infrastructure of queer life. She has lived in Mouraria for eight years.`,
    tags: ["Community", "Chosen family", "Lisbon"],
    related: ["mouraria-family", "city-changed"],
    slides: [
      {
        layout: "text",
        align: "center",
        eyebrow: "Interactive",
        heading: (
          <>
            A decade on one <em>corner</em>
          </>
        ),
        body: "Seven of them met at a language exchange in 2016. This is what the next ten years did to a chosen family, one slide at a time.",
      },
      {
        layout: "image",
        src: "https://images.unsplash.com/photo-1601977078202-8825cd23ddf3?q=80&w=1400&auto=format&fit=crop",
        alt: "Narrow Mouraria street with laundry lines overhead at dusk",
        tint: "jade",
        caption:
          "The corner in Mouraria where they still meet, first Sunday of every month.",
      },
      {
        layout: "stat",
        value: "×3",
        label: (
          <>
            Rents in the neighbourhood <em>tripled</em> between 2016 and 2026.
          </>
        ),
        source: "Lisbon housing observatory, 2026",
        tint: "coral",
      },
      {
        layout: "text",
        align: "center",
        pull: "A chosen family is not chosen once. It is chosen again and again, through inconvenience and absence.",
      },
      {
        layout: "interactive",
        kind: "before-after",
        before: {
          src: "https://images.unsplash.com/photo-1601977078202-8825cd23ddf3?q=80&w=1200&auto=format&fit=crop",
          alt: "The street in warm afternoon light",
          label: "2016",
        },
        after: {
          src: "https://images.unsplash.com/photo-1693323588991-42119b16994b?q=80&w=1200&auto=format&fit=crop",
          alt: "The same neighbourhood, rooftops at golden hour",
          label: "2026",
        },
      },
      {
        layout: "interactive",
        kind: "reveal",
        tint: "plum",
        prompt: <>What held them together for ten years?</>,
        hidden:
          "Not affection. Affection comes and goes. The accumulated evidence that you showed up when it was inconvenient.",
      },
      {
        layout: "text",
        align: "center",
        heading: (
          <>
            Three of them <em>still</em> come
          </>
        ),
        body: "Sometimes two. Sometimes one sits for an hour to see if anyone will. They do not call it maintenance. It feels like showing up for something already decided.",
      },
    ],
  },
};
