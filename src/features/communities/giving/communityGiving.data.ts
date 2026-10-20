import type {
  CommunityGivingDTO,
  CommunityGivingMethodDTO,
  UpdateCommunityGivingBody,
} from "../api/communityGiving.api";

/**
 * Demo support sections for the flagship communities. Copy stays English like
 * the rest of the living demo data. Values pass the same rules the live editor
 * enforces: https links, a Portuguese mobile for MB WAY (stored as 9 digits)
 * and a checksum-valid IBAN stored compact. Every name and account is
 * fictional.
 *
 * - `queer-runners`: the demo viewer is a moderator there, so the editor shows.
 * - `trans-mutual-aid`: the viewer is not a member, so it shows the read-only
 *   path.
 * - `trans-hub` has no entry on purpose: the demo moderator sees the empty
 *   state there.
 */

type DemoGivingMethodSeed = Omit<CommunityGivingMethodDTO, "id" | "position">;

function demoMethods(
  slug: string,
  seeds: DemoGivingMethodSeed[],
): CommunityGivingMethodDTO[] {
  return seeds.map((seed, index) => ({
    ...seed,
    id: `demo-giving-${slug}-${index}`,
    position: index,
  }));
}

export const DEMO_COMMUNITY_GIVING: Record<string, CommunityGivingDTO> = {
  "queer-runners": {
    intro:
      "Kit for new runners, race entry fees for members who can't cover them, and water at every event",
    methods: demoMethods("queer-runners", [
      {
        kind: "link",
        label: null,
        value: "https://ko-fi.com/queerrunnerslisboa",
        note: null,
      },
      {
        kind: "link",
        label: "Volunteer at a race",
        value: "https://forms.gle/queerrunnersvolunteer",
        note: null,
      },
      {
        kind: "mbway",
        label: "Rita, treasurer",
        value: "912345678",
        note: "Write RUN in the description",
      },
    ]),
    updatedAt: "2026-10-12T18:30:00.000Z",
  },
  "trans-mutual-aid": {
    intro:
      "Every cent goes to rent support and pharmacy costs for trans people in Lisbon",
    methods: demoMethods("trans-mutual-aid", [
      {
        kind: "link",
        label: null,
        value: "https://opencollective.com/trans-mutual-aid-lisboa",
        note: null,
      },
      {
        kind: "link",
        label: "Winter fund",
        value: "https://www.gofundme.com/f/trans-mutual-aid-winter-fund",
        note: null,
      },
      {
        kind: "iban",
        label: null,
        value: "PT50000201231234567890154",
        note: "Holder: Associação Ajuda Mútua Trans (fictional)",
      },
    ]),
    updatedAt: "2026-10-05T09:15:00.000Z",
  },
};

/** The seeded support section for a demo community, or null when it has none. */
export function demoGivingFor(slug: string): CommunityGivingDTO | null {
  return DEMO_COMMUNITY_GIVING[slug] ?? null;
}

/**
 * What a demo save stores: the PUT body shaped like the server's answer, with
 * ids and positions from array order. The editor already normalized the
 * values. `updatedAt` follows the server rule and is null for an empty set.
 */
export function demoGivingFromBody(
  body: UpdateCommunityGivingBody,
  savedAtIso: string,
): CommunityGivingDTO {
  return {
    intro: body.intro,
    methods: body.methods.map((method, index) => ({
      id: `demo-giving-saved-${index}`,
      kind: method.kind,
      label: method.label,
      value: method.value,
      note: method.note,
      position: index,
    })),
    updatedAt: body.methods.length > 0 ? savedAtIso : null,
  };
}
