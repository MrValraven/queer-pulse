export interface RecapDayPhoto {
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export interface RecapAttendee {
  initials: string;
  tint: "coral" | "jade" | "plum";
  name: string;
  pronouns: string;
}

export const RECAP_ATTENDEES: RecapAttendee[] = [
  { initials: "SR", tint: "jade", name: "Sofia R.", pronouns: "she/her" },
  { initials: "AK", tint: "coral", name: "Anika K.", pronouns: "she/they" },
  { initials: "JP", tint: "plum", name: "Jordan P.", pronouns: "they/them" },
  { initials: "TM", tint: "jade", name: "Tomás M.", pronouns: "he/him" },
  { initials: "MF", tint: "coral", name: "Maria F.", pronouns: "she/her" },
  { initials: "KL", tint: "plum", name: "Kai L.", pronouns: "they/them" },
  { initials: "BK", tint: "jade", name: "Bilal K.", pronouns: "he/him" },
  { initials: "NC", tint: "coral", name: "Nadia C.", pronouns: "she/her" },
];

export const RECAP_PHOTOS: RecapDayPhoto[] = [
  {
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop",
  },
  {
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1719590839309-5dbf71989e8d?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1720524119990-97c506ee1246?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1720741741673-ce5c7a2c2fb2?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1723199686044-32743f788589?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1731174218715-9b4d23795265?q=80&w=800&auto=format&fit=crop",
  },
];
