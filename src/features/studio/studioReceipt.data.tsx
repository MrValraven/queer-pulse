import type { ReactNode } from "react";

/** Cover art for the tipped track (Unsplash). */
export const RECEIPT_COVER =
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80&auto=format&fit=crop";

/** Content — this specific tip's track/artist/album/tipper; stays English in
 * both modes (§1). */
export const RECEIPT_TRACK_TITLE = "Carta para a santa";
export const RECEIPT_ARTIST = "Mariana Sol";
export const RECEIPT_ALBUM = "Cidade dos santos";
export const RECEIPT_TIPPER = "Rita Tavares";

/** Money — route through useFormat().currency() at render. */
export const TIP_AMOUNT = 2;
export const ARTIST_SETTLE_DAYS = 5;

export const RECEIPT_NUMBER = "QP-T-2026-06-09-4af7";
export const RECEIPT_LEDGER_ROW = "#26-06-T4af7";

/** These are demo-fixed timestamps; formatted at render via useFormat(). */
export const RECEIPT_TIP_DATE = new Date("2026-06-09T21:24:00+01:00");
export const RECEIPT_LEDGER_DATE = new Date("2026-06-15T12:00:00+01:00");
export const RECEIPT_SUSTAINER_SINCE = new Date("2026-02-01T00:00:00+00:00");

/** The note Rita left, plus Mariana's reply — both content (§1). */
export const NOTE = {
  quote: "earn it, mariana",
  reply: {
    avatar: "MS",
    body: '"rita ily. and i\'m earning it. promise."',
    minutesAgo: 22,
  },
};

export type ReceiptDetailKey =
  | "receiptNo"
  | "dateTime"
  | "from"
  | "method"
  | "postedToLedger"
  | "visibility";

/** Labels are catalog keys (chrome); values below are rendered per-field in
 * the component, since several need Date formatting or content interleaving. */
export const DETAIL_LABEL_KEYS: ReceiptDetailKey[] = [
  "receiptNo",
  "dateTime",
  "from",
  "method",
  "postedToLedger",
  "visibility",
];

export type { ReactNode };
