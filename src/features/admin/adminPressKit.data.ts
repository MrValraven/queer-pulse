import type {
  AdminPressContactDTO,
  AdminPressCoverageDTO,
  PressContactInput,
  PressContactPatch,
  PressCoverageInput,
  PressCoveragePatch,
  PressKitFactDTO,
} from "./api/pressKit.api";

/**
 * Demo fixtures + demo-session mutation registry for the admin press-kit
 * curation surface (`/admin/press-kit`). Mirrors `adminLanding.data.ts`: the
 * seeds below are shaped exactly like `GET /admin/press-kit/coverage` and
 * `.../contacts` would answer, and the mutation hooks read/write a module-
 * scoped registry (lazily cloned from the seed) so adds/edits/reorders made
 * this demo session stay visible until a full page reload.
 *
 * The seed content reuses the real values already shown on the public press
 * kit (`features/marketing/pressKit.data.tsx`) so demo and live read alike —
 * it never invents a new outlet or spokesperson.
 */

// ── Facts (auto-derived; read-only preview) ─────────────────────────────────
/** The derived headline numbers `GET /press-kit` returns under `facts`. Keys
 *  match `marketing:pressKit.facts.<key>` so the admin preview panel resolves
 *  a human label; values are pre-formatted, mirroring the live backend which
 *  computes and formats these from platform data. */
export const DEMO_PRESS_FACTS: PressKitFactDTO[] = [
  { key: "founded", value: "2024" },
  { key: "activeMembers", value: "1,847" },
  { key: "communities", value: "38" },
  { key: "gatherings", value: "284" },
  { key: "safeSpaces", value: "42" },
  { key: "magazineIssues", value: "9" },
];

// ── Coverage seed ───────────────────────────────────────────────────────────
export const DEMO_PRESS_COVERAGE: AdminPressCoverageDTO[] = [
  {
    id: "demo-coverage-publico",
    source: "Público",
    title: "Em Lisboa, uma rede profissional queer e independente.",
    meta: "Long-form feature · by Ana Sá Lopes · 6,400 words",
    publishedOn: "4 Mar 2026",
    url: "https://www.publico.pt/",
    position: 0,
    active: true,
  },
  {
    id: "demo-coverage-vice",
    source: "Vice Portugal",
    title: "The platform that refuses to scale.",
    meta: "Interview with Marta Reis · 22 min read",
    publishedOn: "18 Feb 2026",
    url: "https://www.vice.com/pt",
    position: 1,
    active: true,
  },
  {
    id: "demo-coverage-ft",
    source: "FT Weekend",
    title: "Inside Lisbon's quietest queer institution.",
    meta: "Long-form magazine piece · syndicated to FT.com",
    publishedOn: "24 Jan 2026",
    url: "https://www.ft.com/",
    position: 2,
    active: true,
  },
  {
    id: "demo-coverage-mensagem",
    source: "Mensagem de Lisboa",
    title: "A Câmara dos Anjos.",
    meta: "Local-press feature on the neighbourhood",
    publishedOn: "11 Nov 2025",
    url: null,
    position: 3,
    active: true,
  },
];

// ── Contact seed ────────────────────────────────────────────────────────────
export const DEMO_PRESS_CONTACTS: AdminPressContactDTO[] = [
  {
    id: "demo-contact-marta",
    name: "Marta Reis",
    role: "Founder & director",
    description: "Speaks to strategy, funding and the platform's story.",
    languages: "EN / PT",
    email: "marta@queerpulse.app",
    avatarUrl: null,
    position: 0,
    active: true,
  },
  {
    id: "demo-contact-catarina",
    name: "Catarina Vaz",
    role: "Head of community",
    description: "Speaks to safe spaces, gatherings and moderation.",
    languages: "EN / PT / ES",
    email: "catarina@queerpulse.app",
    avatarUrl: null,
    position: 1,
    active: true,
  },
  {
    id: "demo-contact-andre",
    name: "André Bento",
    role: "Editor, the magazine",
    description: "Speaks to editorial, commissions and partnerships.",
    languages: "EN / PT",
    email: "andre@queerpulse.app",
    avatarUrl: null,
    position: 2,
    active: true,
  },
];

// ── Generic demo-session registry ───────────────────────────────────────────
interface PositionedRow {
  id: string;
  position: number;
  active: boolean;
}

export interface DemoPressRegistry<Row extends PositionedRow> {
  list(): Row[];
  create(
    fields: Omit<Row, "id" | "position" | "active">,
    idPrefix: string,
  ): Row;
  update(id: string, patch: Partial<Row>): Row;
  remove(id: string): void;
  reorder(orderedIds: string[]): Row[];
  reset(): void;
}

/**
 * A mutable, lazily-cloned copy of one seed list, module-scoped on purpose
 * (like `adminLanding.data.ts`'s registry): it must survive component remounts
 * and reset only on a full reload, never on navigation between admin screens.
 * A closure factory (not a class) to stay within the project's
 * `erasableSyntaxOnly` TS config. One instance backs coverage, another backs
 * contacts.
 */
function createDemoPressRegistry<Row extends PositionedRow>(
  seed: Row[],
): DemoPressRegistry<Row> {
  let rows: Row[] | null = null;

  const ensure = (): Row[] => {
    if (!rows) rows = seed.map((row) => ({ ...row }));
    return rows;
  };

  return {
    list: () =>
      [...ensure()].sort((rowA, rowB) => rowA.position - rowB.position),

    create: (fields, idPrefix) => {
      const current = ensure();
      const created = {
        ...fields,
        id: `${idPrefix}-${Date.now()}`,
        position: current.length,
        active: true,
      } as Row;
      current.push(created);
      return created;
    },

    update: (id, patch) => {
      const current = ensure();
      const index = current.findIndex((row) => row.id === id);
      const existing = current[index];
      if (index === -1 || !existing) {
        throw new Error(`Demo press-kit row not found: ${id}`);
      }
      // Callers pass a partial patch where untouched fields are `undefined`;
      // only merge keys the caller actually set so an active-only toggle never
      // blanks the row's copy.
      const definedPatch = Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ) as Partial<Row>;
      const updated: Row = { ...existing, ...definedPatch };
      current[index] = updated;
      return updated;
    },

    remove: (id) => {
      rows = ensure()
        .filter((row) => row.id !== id)
        .map((row, index) => ({ ...row, position: index }));
    },

    reorder: (orderedIds) => {
      const byId = new Map(ensure().map((row) => [row.id, row] as const));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((row): row is Row => Boolean(row))
        .map((row, index) => ({ ...row, position: index }));
      rows = reordered;
      return reordered;
    },

    reset: () => {
      rows = null;
    },
  };
}

const coverageRegistry =
  createDemoPressRegistry<AdminPressCoverageDTO>(DEMO_PRESS_COVERAGE);
const contactsRegistry =
  createDemoPressRegistry<AdminPressContactDTO>(DEMO_PRESS_CONTACTS);

// ── Coverage demo operations ────────────────────────────────────────────────
export const getDemoPressCoverage = (): AdminPressCoverageDTO[] =>
  coverageRegistry.list();

export const createDemoPressCoverage = (
  input: PressCoverageInput,
): AdminPressCoverageDTO => coverageRegistry.create(input, "demo-coverage");

export const updateDemoPressCoverage = (
  id: string,
  patch: PressCoveragePatch,
): AdminPressCoverageDTO => coverageRegistry.update(id, patch);

export const deleteDemoPressCoverage = (id: string): void =>
  coverageRegistry.remove(id);

export const reorderDemoPressCoverage = (
  orderedIds: string[],
): AdminPressCoverageDTO[] => coverageRegistry.reorder(orderedIds);

// ── Contact demo operations ─────────────────────────────────────────────────
export const getDemoPressContacts = (): AdminPressContactDTO[] =>
  contactsRegistry.list();

export const createDemoPressContact = (
  input: PressContactInput,
): AdminPressContactDTO => contactsRegistry.create(input, "demo-contact");

export const updateDemoPressContact = (
  id: string,
  patch: PressContactPatch,
): AdminPressContactDTO => contactsRegistry.update(id, patch);

export const deleteDemoPressContact = (id: string): void =>
  contactsRegistry.remove(id);

export const reorderDemoPressContacts = (
  orderedIds: string[],
): AdminPressContactDTO[] => contactsRegistry.reorder(orderedIds);

export const getDemoPressFacts = (): PressKitFactDTO[] => DEMO_PRESS_FACTS;

/** Reset both demo registries to seed. Kept for tests wanting a clean slate;
 *  a page reload already clears the in-memory copies. */
export function resetDemoPressKitRegistry(): void {
  coverageRegistry.reset();
  contactsRegistry.reset();
}
