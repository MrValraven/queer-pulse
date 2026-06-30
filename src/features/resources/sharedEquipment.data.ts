import type { ImageSlotTint } from "../../shared/components/ui";

export interface Equipment {
  name: string;
  specs: string;
  status: string;
  available: boolean;
  tint: ImageSlotTint;
}

export const EQUIPMENT: Equipment[] = [
  {
    name: "Two-colour Risograph",
    specs:
      "Reconditioned RZ, A3, currently loaded coral + black. Lives at the atelier for collective use.",
    status: "Free this week",
    available: true,
    tint: "coral",
  },
  {
    name: "Electric kiln",
    specs:
      "Mid-size top-loader, cone 6. Firings are scheduled — add yours to the shared sheet a week ahead.",
    status: "Next firing Sunday",
    available: true,
    tint: "jade",
  },
  {
    name: "Projector + stand",
    specs:
      "1080p, long-throw, good for tracing and projection work. Portable with the soft case.",
    status: "On loan until Fri",
    available: false,
    tint: "plum",
  },
  {
    name: "Bookbinding kit",
    specs:
      "Awls, bone folders, waxed thread, board shears. For zines and small editions.",
    status: "Free this week",
    available: true,
    tint: "plum",
  },
];

export const CARE = [
  "Book it, clean it, log it — the three rules that keep shared kit shared.",
  "Leave it better than you found it. If something breaks, say so in the channel; nobody is in trouble, we just need to know.",
  "Consumables (ink, thread, board) work on a top-up honesty box. Use a lot, chip in a little.",
];
