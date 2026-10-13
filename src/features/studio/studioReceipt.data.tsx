import type { ReactNode } from "react";

/** Cover art for the tipped track (Unsplash). */
export const RECEIPT_COVER =
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80&auto=format&fit=crop";

/** Proper nouns: this specific tip's track, artist, album and tipper. They
 * stay literal in both languages. */
export const RECEIPT_TRACK_TITLE = "Carta para a santa";
export const RECEIPT_ARTIST = "Mariana Sol";
export const RECEIPT_ALBUM = "Cidade dos santos";
export const RECEIPT_TIPPER = "Rita Tavares";

/** Money: route through useFormat().currency() at render. */
export const TIP_AMOUNT = 2;
export const ARTIST_SETTLE_DAYS = 5;

export const RECEIPT_NUMBER = "QP-T-2026-06-09-4af7";
export const RECEIPT_LEDGER_ROW = "#26-06-T4af7";

/** These are demo-fixed timestamps; formatted at render via useFormat(). */
export const RECEIPT_TIP_DATE = new Date("2026-06-09T21:24:00+01:00");
export const RECEIPT_LEDGER_DATE = new Date("2026-06-15T12:00:00+01:00");
export const RECEIPT_SUSTAINER_SINCE = new Date("2026-02-01T00:00:00+00:00");

/** The note Rita left, plus Mariana's reply. In-character copy: the words are
 * `studioShowcase` catalog keys (Pattern A); the avatar initials stay literal. */
export const NOTE = {
  quoteKey: "studioShowcase:receipt.note.quote",
  reply: {
    avatar: "MS",
    bodyKey: "studioShowcase:receipt.note.replyBody",
    minutesAgo: 22,
  },
};

export type { ReactNode };
