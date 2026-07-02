import { type ReactNode } from "react";

export interface Flag {
  id: string;
  tint: "coral" | "jade" | "plum";
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  who: string;
  cat: string;
  reason: ReactNode;
  rmeta: string;
  claimAv: string;
  claim: ReactNode;
  deadline: string;
  unclaimed?: boolean;
  image?: string;
}

export const resolvedFlagImage =
  "https://plus.unsplash.com/premium_photo-1757392183531-16c1990f7b43?q=80&w=400&auto=format&fit=crop";

export const FLAGS: Flag[] = [
  {
    id: "f1",
    tint: "plum",
    titlePre: "Salt water, ",
    titleEm: "slowly",
    who: "Akin Diallo · single · uploaded 3 weeks ago",
    cat: "Possible uncleared sample",
    reason: (
      <>
        "There's a field recording under the second half that sounds lifted from
        a known archive. <em>Worth checking it's cleared</em> before it keeps
        earning."
      </>
    ),
    rmeta: "Flagged by 2 listeners · the artist has been notified to respond",
    claimAv: "SM",
    claim: (
      <>
        Claimed by <em>Sara Marques</em> · awaiting artist reply
      </>
    ),
    deadline: "decide by 19 Jun",
    image:
      "https://plus.unsplash.com/premium_photo-1669876271015-55e215f60bc4?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "f2",
    tint: "coral",
    titlePre: "Bicha, with ",
    titleEm: "love",
    titlePost: " (remix)",
    who: "Mateus F. & DJ Carrasco · single · uploaded 1 month ago",
    cat: "Wrong / missing credit or split",
    reason: (
      <>
        "The remix credits DJ Carrasco but the original vocal is by someone
        uncredited. <em>The split table doesn't list them</em> — they should be
        getting paid."
      </>
    ),
    rmeta:
      "Flagged by 1 listener · the named artist has been notified to respond",
    claimAv: "DO",
    claim: (
      <>
        Claimed by <em>D. Okoye</em> · awaiting artist reply
      </>
    ),
    deadline: "decide by 21 Jun",
    image:
      "https://images.unsplash.com/photo-1774394027421-9daa1181f9ea?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "f3",
    tint: "jade",
    titlePre: "The Anjos ",
    titleEm: "tape",
    who: "Recorded live · Casa do Comum · 7 artists",
    cat: "Not the artist it claims to be",
    reason: (
      <>
        "Pretty sure this live tape lists a performer who wasn't actually there
        that night. <em>Could be an honest mistake</em> in the lineup."
      </>
    ),
    rmeta: "Flagged by 1 listener · unclaimed · in the queue 2 days",
    claimAv: "?",
    claim: <>Unclaimed · any curator can take it</>,
    deadline: "decide by 23 Jun",
    unclaimed: true,
    image:
      "https://plus.unsplash.com/premium_photo-1666232835461-f49509f2a97c?q=80&w=800&auto=format&fit=crop",
  },
];
