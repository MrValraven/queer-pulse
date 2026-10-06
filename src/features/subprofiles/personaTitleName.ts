// Persona kind labels and the persona name helpers. This module holds only
// type imports, so the message adapters can read it without loading the
// icon-heavy subprofile-kinds module on first page load.
import type { SubprofileKind } from "./api/subprofiles.api";
import type { Language } from "../../shared/i18n/types";

/**
 * English fallback names, kept ONLY for the "no display name typed" case: when
 * a persona is created with a blank name, its `displayName` — a PERSISTED
 * field — defaults to the profession (e.g. a blank Developer persona is named
 * "Developer"). That stored value isn't chrome and isn't re-translated later
 * (no backend translation pipeline), so it stays English like other
 * persisted/generated content, distinct from `KIND_LABEL_KEYS` (the UI badge
 * label, which does follow the active language). Used by
 * `useSubprofileMutations.ts`'s demo path and the MSW test handler that
 * mirror this same backend default.
 */
export const KIND_LABELS: Record<SubprofileKind, string> = {
  developer: "Developer",
  writer: "Writer",
  musician: "Musician",
  visual_artist: "Visual artist",
  filmmaker: "Filmmaker",
  designer: "Designer",
  maker: "Maker",
  drag: "Drag performer",
  dj: "DJ",
  dancer: "Dancer",
  performer: "Performer",
  photographer: "Photographer",
  videomaker: "Videomaker",
  chef: "Chef",
  mixologist: "Mixologist",
  therapist: "Therapist",
  astrologer: "Astrologer",
  generic: "Other",
  // stage (new kinds)
  comedian: "Comedian",
  vocalist: "Vocalist",
  burlesque: "Burlesque performer",
  circus: "Circus & aerial",
  spoken_word: "Spoken word artist",
  host: "Host & emcee",
  voguer: "Ballroom & vogue",
  pole_dancer: "Pole dancer",
  // studio (new kinds)
  illustrator: "Illustrator",
  tattoo_artist: "Tattoo artist",
  animator: "Animator",
  comic_artist: "Comic artist",
  game_designer: "Game designer",
  artist_3d: "3D artist",
  printmaker: "Printmaker",
  // page (new kinds)
  journalist: "Journalist",
  poet: "Poet",
  editor: "Editor",
  screenwriter: "Screenwriter",
  translator: "Translator",
  zinester: "Zinester",
  academic: "Academic",
  // workshop (new kinds)
  ceramicist: "Ceramicist",
  jeweler: "Jeweller",
  textile_artist: "Textile artist",
  woodworker: "Woodworker",
  florist: "Florist",
  data_scientist: "Data scientist",
  // practice (new kinds)
  coach: "Coach",
  bodyworker: "Bodyworker & massage",
  yoga_teacher: "Yoga & movement teacher",
  nutritionist: "Nutritionist",
  doula: "Doula & birth worker",
  personal_trainer: "Personal trainer",
  sex_educator: "Sexual health educator",
  peer_support: "Peer support & social work",
  // table (new kinds)
  baker: "Baker & pastry chef",
  barista: "Barista",
  brewer: "Brewer & distiller",
  sommelier: "Sommelier",
  caterer: "Caterer & supper club",
  // chair (new family)
  hair_stylist: "Hair stylist",
  barber: "Barber",
  makeup_artist: "Makeup artist",
  nail_artist: "Nail artist",
  esthetician: "Esthetician",
  piercer: "Piercer",
  // runway (new family)
  fashion_designer: "Fashion designer",
  stylist: "Stylist",
  model: "Model",
  costume_designer: "Costume designer",
  // gallery (new family)
  curator: "Curator",
  gallerist: "Gallerist",
  art_dealer: "Art dealer",
  archivist: "Archivist",
  conservator: "Conservator",
  registrar: "Registrar",
  exhibition_designer: "Exhibition designer",
  art_critic: "Art critic",
  docent: "Docent & gallery guide",
  preparator: "Preparator & art handler",
  // history (new family — "Record")
  historian: "Historian",
  art_historian: "Art historian",
  oral_historian: "Oral historian",
  genealogist: "Genealogist",
  heritage: "Heritage & preservation",
  archival_researcher: "Archival researcher",
  memory_keeper: "Cultural memory keeper",
  // collective (new family — "Poster")
  organizer: "Organiser",
  activist: "Activist",
  event_producer: "Event producer",
  promoter: "Promoter",
  // classroom (new family)
  teacher: "Teacher",
  facilitator: "Workshop facilitator",
  tutor: "Tutor",
  lecturer: "Lecturer",
  // Quest personas (+20)
  game_master: "Game master (DM/GM)",
  ttrpg_designer: "TTRPG writer",
  board_game_reviewer: "Board game reviewer",
  game_night_host: "Game night host",
  larp_organizer: "LARP organiser",
  miniature_painter: "Miniature painter",
  cartographer: "Fantasy map maker",
  dice_maker: "Dice maker",
  tournament_organizer: "Tournament organiser",
  actual_play: "Actual play performer",
  streamer: "Streamer / VTuber",
  speedrunner: "Speedrunner",
  modder: "Modder",
  cosplayer: "Cosplayer",
  prop_maker: "Prop and armour maker",
  puzzle_designer: "Puzzle and escape room designer",
  podcaster: "Podcaster",
  voice_actor: "Voice actor",
  fanfic_writer: "Fanfic writer",
  game_critic: "Video game critic",
};

/**
 * Static copy of the Portuguese `subprofiles:kind.*` labels
 * (src/shared/i18n/catalogs/pt/subprofiles.ts). Keep it in sync with those
 * keys: `personaTitleName.test.ts` checks every entry against the catalog.
 *
 * The persisted default name is always English (`KIND_LABELS`), but the create
 * form suggests "por ex. {kind}" with the translated label, so a member
 * creating a persona in Portuguese can type "Terapia" or "Poesia" as its name.
 * `isBareProfessionName` needs these labels to recognise that as the bare
 * profession too. They live here as a plain map because `subprofiles` is a
 * lazily loaded catalog chunk: importing it would pull the whole Portuguese
 * namespace into every bundle that reads this module, and this module runs
 * outside React where `t` is unavailable.
 */
const PT_KIND_LABELS: Record<SubprofileKind, string> = {
  developer: "Programação",
  writer: "Escrita",
  musician: "Música",
  visual_artist: "Arte visual",
  filmmaker: "Realização",
  designer: "Design",
  maker: "Maker",
  drag: "Arte drag",
  dj: "DJ",
  dancer: "Dança",
  performer: "Performance",
  photographer: "Fotografia",
  videomaker: "Videografia",
  chef: "Cozinha",
  mixologist: "Coquetelaria",
  therapist: "Terapia",
  astrologer: "Astrologia",
  generic: "Generalista",
  comedian: "Comédia",
  vocalist: "Canto",
  burlesque: "Burlesco",
  circus: "Circo e aéreo",
  spoken_word: "Spoken word",
  host: "Apresentação",
  voguer: "Ballroom e vogue",
  pole_dancer: "Pole dance",
  illustrator: "Ilustração",
  tattoo_artist: "Tatuagem",
  animator: "Animação",
  comic_artist: "Banda desenhada",
  game_designer: "Videojogos",
  artist_3d: "Arte 3D",
  printmaker: "Gravura",
  journalist: "Jornalismo",
  poet: "Poesia",
  editor: "Edição",
  screenwriter: "Argumento",
  translator: "Tradução",
  zinester: "Fanzines",
  academic: "Investigação",
  ceramicist: "Cerâmica",
  jeweler: "Joalharia",
  textile_artist: "Têxteis",
  woodworker: "Madeira",
  florist: "Floricultura",
  data_scientist: "Dados",
  coach: "Coaching",
  bodyworker: "Massagem",
  yoga_teacher: "Yoga e movimento",
  nutritionist: "Nutrição",
  doula: "Doula",
  personal_trainer: "Treino pessoal",
  sex_educator: "Educação sexual",
  peer_support: "Apoio entre pares",
  baker: "Pastelaria e pão",
  barista: "Barista",
  brewer: "Cerveja e destilados",
  sommelier: "Escanção",
  caterer: "Catering",
  hair_stylist: "Cabelo",
  barber: "Barbearia",
  makeup_artist: "Maquilhagem",
  nail_artist: "Unhas",
  esthetician: "Estética",
  piercer: "Piercing",
  fashion_designer: "Moda",
  stylist: "Styling",
  model: "Modelo",
  costume_designer: "Guarda-roupa",
  curator: "Curadoria",
  gallerist: "Galeria",
  art_dealer: "Comércio de arte",
  archivist: "Arquivo",
  conservator: "Conservação",
  registrar: "Gestão de coleções",
  exhibition_designer: "Design expositivo",
  art_critic: "Crítica de arte",
  docent: "Mediação",
  preparator: "Montagem",
  historian: "História",
  art_historian: "História da arte",
  oral_historian: "História oral",
  genealogist: "Genealogia",
  heritage: "Património",
  archival_researcher: "Pesquisa em arquivo",
  memory_keeper: "Memória cultural",
  organizer: "Organização",
  activist: "Ativismo",
  event_producer: "Produção de eventos",
  promoter: "Promoção",
  teacher: "Ensino",
  facilitator: "Facilitação",
  tutor: "Explicações",
  lecturer: "Docência universitária",
  // Quest personas (+20)
  game_master: "Narração de RPG",
  ttrpg_designer: "Escrita de RPG",
  board_game_reviewer: "Crítica de jogos de tabuleiro",
  game_night_host: "Noites de jogos",
  larp_organizer: "LARP",
  miniature_painter: "Pintura de miniaturas",
  cartographer: "Cartografia fantástica",
  dice_maker: "Dados artesanais",
  tournament_organizer: "Organização de torneios",
  actual_play: "Actual play",
  streamer: "Streaming",
  speedrunner: "Speedrunning",
  modder: "Modding",
  cosplayer: "Cosplay",
  prop_maker: "Adereços e armaduras",
  puzzle_designer: "Puzzles e escape rooms",
  podcaster: "Podcast",
  voice_actor: "Dobragem e voz",
  fanfic_writer: "Fanfic",
  game_critic: "Crítica de videojogos",
};

/** Every supported UI language's kind label, so adding a language to
 *  `Language` fails to compile until its labels are listed here. */
export const KIND_LABELS_BY_LANGUAGE: Record<
  Language,
  Record<SubprofileKind, string>
> = { en: KIND_LABELS, pt: PT_KIND_LABELS };

/** Fold a name for comparison: trimmed, inner whitespace collapsed, lowercase,
 *  and accents stripped, so "  ASTROLOGIA " and "Astrologia" compare equal. */
function foldProfessionName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * The name to address a persona by in "backing {name}'s work" copy (the endorse
 * modal). A persona created without a display name defaults to its profession
 * (`KIND_LABELS[kind]`, e.g. "Dancer"), so "Endorse Dancer" / "backing Dancer's
 * work" reads oddly and hides the human behind the craft. When the display name
 * is still that bare profession, fall back to the owner's first name instead
 * ("Endorse Philippine" / "backing Philippine's work"). A persona with a real,
 * custom display name — or one whose owner isn't known here — keeps its
 * display name unchanged.
 */
export function personaAddressName({
  displayName,
  kind,
  ownerName,
}: {
  displayName: string;
  kind: SubprofileKind;
  ownerName?: string;
}): string {
  const trimmedName = displayName.trim();
  if (!isBareProfessionName({ displayName, kind })) return trimmedName;
  const ownerFirstName = ownerName?.trim().split(/\s+/)[0];
  return ownerFirstName || trimmedName;
}

/**
 * Is this persona still carrying the profession as its name? A persona created
 * without a display name persists `KIND_LABELS[kind]` as its `displayName`
 * (see that constant's doc), so "Poet" / "Developer" are the auto-filled
 * default rather than a name anyone chose. The kind's label in every supported
 * UI language counts too (`KIND_LABELS_BY_LANGUAGE`), since the create form
 * suggests the translated label as an example name. Compared through
 * `foldProfessionName` (case, accents and surrounding whitespace ignored)
 * because the stored value is user-editable and an owner may have retyped it.
 * Shared by `personaAddressName`, `personaTitleName` and
 * `personaNameBesideCraft`, which do different things with the same signal.
 */
export function isBareProfessionName({
  displayName,
  kind,
}: {
  displayName: string;
  kind: SubprofileKind;
}): boolean {
  const foldedName = foldProfessionName(displayName);
  return Object.values(KIND_LABELS_BY_LANGUAGE).some(
    (labels) => foldProfessionName(labels[kind]) === foldedName,
  );
}

/**
 * The name to TITLE a persona with wherever it is presented to other people —
 * the directory card, its page heading, the share card, its vCard. A persona
 * still named after its profession ("Poet") reads as a category rather than
 * somebody's work, so it is titled "Owner Name | Poet" instead, which restores
 * the human without discarding the craft.
 *
 * Distinct from `personaAddressName`, which answers a different question: how
 * to ADDRESS the persona inside a sentence ("backing Tiago's work"), where a
 * full name and a bar separator would not read. Both hang off
 * `isBareProfessionName`, so the two stay in step.
 *
 * The craft comes from `KIND_LABELS[kind]` rather than the stored name, so a
 * persona retyped as "poet" still titles as "Tiago Costa | Poet". It stays the
 * English persisted label (never the translated `KIND_LABEL_KEYS` badge), so
 * the title agrees with the persona's own persisted name and address.
 *
 * Falls back to the display name untouched when the persona has a real name,
 * or when no owner name is known — an UNLINKED persona deliberately carries no
 * owner identity (`toCardDTO` refuses to leak the tie), and anonymity outranks
 * a nicer title.
 */
export function personaTitleName({
  displayName,
  kind,
  ownerName,
}: {
  displayName: string;
  kind: SubprofileKind;
  ownerName?: string | null;
}): string {
  const trimmedName = displayName.trim();
  if (!isBareProfessionName({ displayName, kind })) return trimmedName;
  const trimmedOwnerName = ownerName?.trim();
  if (!trimmedOwnerName) return trimmedName;
  return `${trimmedOwnerName} | ${KIND_LABELS[kind]}`;
}

/**
 * The name for a slot that ALREADY shows the craft in a field of its own — the
 * page runhead, a feature card's name-above-craft column, the switch row's
 * "kind · tagline" line, the SEO title's `· {craft} ·` segment, a schema.org
 * Person's `name` beside its `jobTitle`.
 *
 * Those slots can't take `personaTitleName`'s composed "Owner Name | Poet",
 * which would say the craft twice ("Poet · Poet · QueerPulse"). They take the
 * owner's name alone and let the existing craft field do the rest, which is the
 * same information split across the two slots the layout already has.
 *
 * Falls back to the display name untouched on exactly `personaTitleName`'s
 * terms: a persona with a real name, or one with no owner name to borrow.
 */
export function personaNameBesideCraft({
  displayName,
  kind,
  ownerName,
}: {
  displayName: string;
  kind: SubprofileKind;
  ownerName?: string | null;
}): string {
  const trimmedName = displayName.trim();
  if (!isBareProfessionName({ displayName, kind })) return trimmedName;
  return ownerName?.trim() || trimmedName;
}
