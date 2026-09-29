import type { MagazineWriterDto } from "../api/magazineWriters.api";

/**
 * The demo desk's writer roster for the commission and hand-off pickers.
 * Names match bylines already on `DEMO_PIECES`, so a demo commission reads
 * like the rest of the desk, and stay clear of the `DEMO_EDITORS` names.
 */
export const DEMO_WRITERS: MagazineWriterDto[] = [
  {
    id: "writer-anika-kovac",
    name: "Anika Kovač",
    initials: "AK",
    avatarUrl: null,
  },
  {
    id: "writer-tomas-mendes",
    name: "Tomás Mendes",
    initials: "TM",
    avatarUrl: null,
  },
  {
    id: "writer-catarina-vaz",
    name: "Catarina Vaz",
    initials: "CV",
    avatarUrl: null,
  },
];
