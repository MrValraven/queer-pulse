import type { DirectoryPartnerPublicState } from "./api/directoryPartners.api";

/** One demo pick: the directory place it points at, the admin's note, and
 *  whether the public row shows it. */
export interface DemoDirectoryPartnerSeed {
  slug: string;
  note: string | null;
  publicState: DirectoryPartnerPublicState;
}

/**
 * The demo partners row as it opens. Three picks show; the fourth is closed
 * for good, so the admin tab's "Not showing" line and the public row's drop
 * rule both have something to render in demo.
 */
export const DEMO_DIRECTORY_PARTNER_SEED: readonly DemoDirectoryPartnerSeed[] =
  [
    {
      slug: "livraria-bertha",
      note: "Members get 10% off",
      publicState: "showing",
    },
    {
      slug: "queer-supper-club",
      note: "Hosts our monthly quiz",
      publicState: "showing",
    },
    { slug: "fio-solto", note: null, publicState: "showing" },
    { slug: "noite-aberta", note: null, publicState: "closed_for_good" },
  ];
