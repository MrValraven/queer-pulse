import type { SubprofileKind } from "./api/subprofiles.api";

/**
 * Each persona kind's work field: the professional area a member picks in
 * onboarding (a key of `PROFESSION_IDS_BY_FIELD` in
 * `members/workTaxonomy.data.ts`). The persona directory heads its
 * Profession chips with these fields, so the groups read in the same words
 * members already used for their own work.
 *
 * A `Record` over the whole kind union, so a new kind fails tsc until it is
 * placed here. `null` marks a kind with no single field (`generic`); the
 * directory gathers those under one trailing "Something else" group.
 */
export const WORK_FIELD_BY_KIND: Record<SubprofileKind, string | null> = {
  // music
  musician: "music",
  dj: "music",
  vocalist: "music",
  // performance
  drag: "performance",
  dancer: "performance",
  performer: "performance",
  comedian: "performance",
  burlesque: "performance",
  circus: "performance",
  spoken_word: "performance",
  voguer: "performance",
  pole_dancer: "performance",
  voice_actor: "performance",
  // nightlife
  host: "nightlife",
  event_producer: "nightlife",
  promoter: "nightlife",
  // editorial
  podcaster: "editorial",
  podcast_producer: "editorial",
  video_creator: "editorial",
  short_form_creator: "editorial",
  writer: "editorial",
  journalist: "editorial",
  poet: "editorial",
  editor: "editorial",
  zinester: "editorial",
  // film
  radio_host: "film",
  filmmaker: "film",
  videomaker: "film",
  screenwriter: "film",
  // craft
  visual_artist: "craft",
  printmaker: "craft",
  maker: "craft",
  ceramicist: "craft",
  jeweler: "craft",
  textile_artist: "craft",
  woodworker: "craft",
  // design
  designer: "design",
  illustrator: "design",
  animator: "design",
  comic_artist: "design",
  artist_3d: "design",
  // photo
  photographer: "photo",
  // beauty
  tattoo_artist: "beauty",
  hair_stylist: "beauty",
  barber: "beauty",
  makeup_artist: "beauty",
  nail_artist: "beauty",
  esthetician: "beauty",
  piercer: "beauty",
  // architecture
  architect: "architecture",
  // languages
  translator: "languages",
  // science
  academic: "science",
  // games
  fanfic_writer: "games",
  game_critic: "games",
  game_master: "games",
  ttrpg_designer: "games",
  game_designer: "games",
  board_game_reviewer: "games",
  game_night_host: "games",
  larp_organizer: "games",
  miniature_painter: "games",
  cartographer: "games",
  dice_maker: "games",
  tournament_organizer: "games",
  actual_play: "games",
  streamer: "games",
  speedrunner: "games",
  modder: "games",
  cosplayer: "games",
  prop_maker: "games",
  puzzle_designer: "games",
  // tech
  developer: "tech",
  data_scientist: "tech",
  // retail
  florist: "retail",
  // healthcare
  therapist: "healthcare",
  nutritionist: "healthcare",
  doula: "healthcare",
  peer_support: "healthcare",
  // wellness
  coach: "wellness",
  bodyworker: "wellness",
  yoga_teacher: "wellness",
  personal_trainer: "wellness",
  astrologer: "wellness",
  // education
  sex_educator: "education",
  teacher: "education",
  facilitator: "education",
  tutor: "education",
  lecturer: "education",
  // food
  chef: "food",
  mixologist: "food",
  baker: "food",
  barista: "food",
  brewer: "food",
  sommelier: "food",
  caterer: "food",
  // fashion
  fashion_designer: "fashion",
  stylist: "fashion",
  model: "fashion",
  costume_designer: "fashion",
  // curation
  curator: "curation",
  gallerist: "curation",
  art_dealer: "curation",
  archivist: "curation",
  conservator: "curation",
  registrar: "curation",
  exhibition_designer: "curation",
  art_critic: "curation",
  docent: "curation",
  preparator: "curation",
  historian: "curation",
  art_historian: "curation",
  oral_historian: "curation",
  genealogist: "curation",
  heritage: "curation",
  archival_researcher: "curation",
  memory_keeper: "curation",
  // community
  organizer: "community",
  activist: "community",
  // no single field
  generic: null,
};
