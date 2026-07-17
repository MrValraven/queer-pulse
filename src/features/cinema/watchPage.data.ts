/**
 * "Next up" poster overrides, keyed by film id. The watch-page rail shows a
 * still rather than the shared poster, so images live here. Falls back to
 * `film.image` when absent.
 */
export const NEXT_UP_STILL_BY_ID: Record<string, string> = {
  paris:
    "https://images.unsplash.com/photo-1634733049839-0292be607569?q=80&w=600&auto=format&fit=crop",
  pharmacy:
    "https://images.unsplash.com/photo-1545033539-05e8f9ef8a8f?q=80&w=600&auto=format&fit=crop",
  mother:
    "https://images.unsplash.com/photo-1593795712029-2acb7f88e016?q=80&w=600&auto=format&fit=crop",
};

/** Cinematic still shown behind the player on the watch screen. */
export const PLAYER_STILL =
  "https://images.unsplash.com/photo-1637059880830-59a90102de77?q=80&w=1000&auto=format&fit=crop";

export const CONTENT_NOTES = [
  { k: "Grief", detail: "Throughout", tc: "—" },
  { k: "Dementia", detail: "Act two · care", tc: "42:18 – 51:04" },
  { k: "A slur, once", detail: "Reclaimed · in context", tc: "28:11" },
];

export const FACTS: [string, string][] = [
  ["Director", "Maria Vasconcelos"],
  ["Runtime", "92 min"],
  ["Year", "Portugal · 2025"],
  ["Captions", "EN · PT · LGP"],
];

export interface LobbyMessage {
  name: string;
  badge: string;
  when: string;
  body: string;
}

export const LOBBY: LobbyMessage[] = [
  {
    name: "Sara M.",
    badge: "curator",
    when: "now",
    body: "The bean-shelling shot at 1:07 is the whole film. Watch her hands.",
  },
  {
    name: "André Q.",
    badge: "",
    when: "2m",
    body: "Watching this for the third time and Dona Ilda still gets me every time.",
  },
  {
    name: "Kai L.",
    badge: "",
    when: "5m",
    body: "The window between the two apartments — such a quiet image of community.",
  },
];

/**
 * i18n stored-value trap (docs/i18n/sweep-agent-brief.md §5.1): `TABS` used
 * to be a bare display-string tuple (`"Film info" | "Lobby" | "Live Q&A"`)
 * doubling as the `WatchSidePanel` tab-state value, compared with `===`.
 * Translating the label in place would have broken the active-tab
 * comparison in pt mode. Each entry now carries a stable canonical `id`
 * (never translated) plus a `labelKey` resolved via `t()` only at render.
 */
export interface WatchTabDef {
  id: "film-info" | "lobby" | "live-qna";
  labelKey: string;
}

export const TABS: WatchTabDef[] = [
  { id: "film-info", labelKey: "cinema:watch.tab.filmInfo" },
  { id: "lobby", labelKey: "cinema:watch.tab.lobby" },
  { id: "live-qna", labelKey: "cinema:watch.tab.liveQna" },
];

export type WatchTab = WatchTabDef["id"];
