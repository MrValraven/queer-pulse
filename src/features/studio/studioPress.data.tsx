import type { ReactNode } from "react";

/** Round hero portrait for Mariana Sol (Unsplash). */
export const PRESS_PORTRAIT =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80";

/** Latest-release cover art. */
export const PRESS_COVER =
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80";

/** Four hi-res press photos (each carries a hover download hint). */
export const PRESS_PHOTOS: { src: string; caption: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    caption: "Live · converted garage",
  },
  {
    src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80",
    caption: "Portrait · Sintra hills",
  },
  {
    src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    caption: "Studio · Cidade dos santos",
  },
  {
    src: "https://images.unsplash.com/photo-1499415479124-43c32433a620?auto=format&fit=crop&w=800&q=80",
    caption: "Portrait · black & white",
  },
];

/** Small waveform for the watermarked preview (56 bars). */
export const PREVIEW_WAVE: number[] = [
  32, 48, 40, 62, 55, 70, 44, 58, 36, 66, 78, 52, 60, 46, 72, 84, 58, 40, 68,
  54, 76, 62, 48, 82, 70, 56, 44, 64, 88, 60, 50, 74, 42, 66, 58, 80, 46, 62,
  54, 72, 38, 68, 60, 50, 78, 56, 44, 64, 70, 52, 60, 48, 74, 40, 58, 66,
];

/** Facts shown as label / value pairs in the hero. */
export const PRESS_FACTS: { label: string; value: ReactNode }[] = [
  { label: "From", value: "Sintra, Portugal" },
  { label: "Pronouns", value: "she / her" },
  { label: "Since", value: "2024" },
  {
    label: "Plays",
    value: (
      <>
        <em>231k</em> on Studio
      </>
    ),
  },
  { label: "For fans of", value: "Cesária, Anohni" },
];

/** Short + long bios (both copyable). */
export const BIO_SHORT =
  "Mariana Sol is a Sintra-born singer and composer working at the seam between fado and devotional song. Her 2026 album Cidade dos santos has been played 142,000 times on the QueerPulse co-op, paying her €7,100 directly.";

export const BIO_LONG =
  "Mariana Sol grew up in the hills above Sintra, in a house where her grandmother sang the rosary like a torch song. She writes fado that refuses church — hymns for queer congregations that never had a building.\n\nHer debut Cidade dos santos (2026) arrived on QueerPulse Studio, the listener-owned co-op, where she keeps her masters and 80% of every play. She performs the Wednesday listening room from a converted garage, tipped in real time by a room of several hundred.";

/** Rich (JSX) renders of the two bios for on-page display. */
export const BIO_SHORT_RICH: ReactNode = (
  <>
    Mariana Sol is a Sintra-born singer and composer working at the seam between
    fado and devotional song. Her 2026 album <em>Cidade dos santos</em> has been
    played 142,000 times on the QueerPulse co-op, paying her €7,100 directly.
  </>
);

export const BIO_LONG_RICH: ReactNode = (
  <>
    <p>
      Mariana Sol grew up in the hills above Sintra, in a house where her
      grandmother sang the rosary like a torch song. She writes{" "}
      <em>fado that refuses church</em> — hymns for queer congregations that
      never had a building.
    </p>
    <p>
      Her debut <em>Cidade dos santos</em> (2026) arrived on QueerPulse Studio,
      the listener-owned co-op, where she keeps her masters and 80% of every
      play. She performs the Wednesday listening room from a converted garage,
      tipped in real time by a room of several hundred.
    </p>
  </>
);

/** Selected-press pull quotes. */
export const PRESS_QUOTES: { quote: string; source: ReactNode }[] = [
  {
    quote:
      "The most devastating record to come out of the Iberian queer underground this decade.",
    source: (
      <>
        Shape <em>· Lisbon</em>
      </>
    ),
  },
  {
    quote: "Sol sings like she's negotiating with God and winning.",
    source: (
      <>
        The Wire <em>· print</em>
      </>
    ),
  },
  {
    quote: "Proof that the co-op model produces art, not just spreadsheets.",
    source: (
      <>
        Pitchfork <em>· feature</em>
      </>
    ),
  },
  {
    quote: "You will cry in a language you don't speak.",
    source: (
      <>
        Gay Times <em>· review</em>
      </>
    ),
  },
];

/** Facts & boilerplate copy rows. `value` is display JSX; `copy` is the plain string put on the clipboard. */
export const BOILERPLATE: { key: string; value: ReactNode; copy: string }[] = [
  {
    key: "Full name",
    value: "Mariana Sol (b. 1996, Sintra)",
    copy: "Mariana Sol (b. 1996, Sintra)",
  },
  {
    key: "Genre",
    value: "Fado · devotional · art song",
    copy: "Fado · devotional · art song",
  },
  {
    key: "Label",
    value: (
      <>
        <em>Self-released</em> · masters retained · via QueerPulse Studio co-op
      </>
    ),
    copy: "Self-released · masters retained · via QueerPulse Studio co-op",
  },
  {
    key: "Booking",
    value: "Direct · no agent · bookings@marianasol.pt",
    copy: "Direct · no agent · bookings@marianasol.pt",
  },
  {
    key: "Pronounce",
    value: "mah-ree-AH-nah SOL",
    copy: "mah-ree-AH-nah SOL",
  },
];
