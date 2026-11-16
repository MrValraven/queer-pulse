import { beforeEach, describe, expect, it } from "vitest";
import { currentUser } from "../../members/data/demoCurrentUser";
import {
  EMPTY_LEAD_FILTERS,
  type LeadAssignedToFilter,
  type LeadDTO,
} from "./api/leads.types";
import {
  DEMO_LEAD_STAFF,
  DEMO_LEAD_VIEWER_ID,
  DEMO_LEADS_SEED,
} from "./leadsDemo.data";
import {
  demoAssignLeadStaff,
  demoGetLead,
  demoLeadDueCount,
  demoListLeads,
  demoSearchLeadStaff,
  demoUnassignLeadStaff,
  resetDemoLeads,
} from "./leadsDemoStore";

const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;
const CAVE_ID = "demo-lead-cave-23";
const LUA_ID = "demo-lead-lua-marques";
const ASSIGNEE_KINDS = [
  "assignee_added",
  "assignee_removed",
  "assignee_access_ended",
];

const idsOf = (lead: LeadDTO) => lead.assignees.map((assignee) => assignee.id);

const namesWith = (assignedTo: LeadAssignedToFilter) =>
  demoListLeads({ ...EMPTY_LEAD_FILTERS, assignedTo })
    .items.map((item) => item.name)
    .sort();

const searchNames = (query: string) =>
  demoSearchLeadStaff(query).map((person) => person.displayName);

/** Runs a store call that must refuse, and hands back what it threw. */
const refusalOf = (call: () => unknown): unknown => {
  try {
    call();
  } catch (cause) {
    return cause;
  }
  throw new Error("Expected a refusal");
};

beforeEach(() => resetDemoLeads());

describe("leadsDemoStore In charge views", () => {
  it("narrows the list to mine, unassigned, or both", () => {
    expect(namesWith("me")).toEqual([
      "Afterhours",
      "Coletivo Maré",
      "Livraria Pó",
      "Lua Marques",
    ]);
    expect(namesWith("unassigned")).toEqual([
      "Cave 23",
      "MC Aurora",
      "Zine Tinta",
    ]);
    expect(namesWith("me_or_unassigned")).toHaveLength(7);
  });

  it("counts stages, the total and the due leads over the In charge view", () => {
    const page = demoListLeads({ ...EMPTY_LEAD_FILTERS, assignedTo: "me" });
    expect(page.totalCount).toBe(4);
    expect(page.stageCounts).toEqual({
      to_contact: 0,
      contacted: 2,
      in_talks: 1,
      on_board: 1,
      not_now: 0,
    });
    expect(page.dueCount).toBe(2);
  });

  it("matches the badge with the mine-and-unassigned due count, before and after an unassign", () => {
    const mineOrNobodys = () =>
      demoListLeads({ ...EMPTY_LEAD_FILTERS, assignedTo: "me_or_unassigned" })
        .dueCount;
    expect(demoLeadDueCount()).toEqual({ count: 3 });
    expect(mineOrNobodys()).toBe(3);
    demoUnassignLeadStaff("demo-lead-kai-duarte", "demo-staff-rafa");
    expect(demoLeadDueCount()).toEqual({ count: 4 });
    expect(mineOrNobodys()).toBe(4);
  });

  it("shows three assignees on a row and counts them all", () => {
    const afterhours = demoListLeads({
      ...EMPTY_LEAD_FILTERS,
      q: "afterhours",
    }).items[0];
    expect(
      afterhours?.assignees.map((assignee) => assignee.displayName),
    ).toEqual(["Marta Lobo", "Rafa Quintas", "Joana Vidal"]);
    expect(afterhours?.assigneeCount).toBe(5);
  });

  it("projects each assignee as the five summary keys", () => {
    const [viewer] = demoGetLead(LUA_ID).assignees;
    expect(Object.keys(viewer ?? {}).sort()).toEqual([
      "avatarCrop",
      "avatarUrl",
      "displayName",
      "id",
      "slug",
    ]);
    expect(viewer).toMatchObject({
      id: DEMO_LEAD_VIEWER_ID,
      slug: currentUser.slug,
      displayName: VIEWER_NAME,
    });
  });
});

describe("leadsDemoStore staff search", () => {
  it("previews the viewer then four by name", () => {
    expect(searchNames("")).toEqual([
      VIEWER_NAME,
      "Bea Moniz",
      "Duda Fontes",
      "Inês Barros",
      "Joana Vidal",
    ]);
  });

  it("searches first name, last name and slug with folded accents", () => {
    expect(searchNames("ines")).toEqual(["Inês Barros"]);
    expect(searchNames("LOBO")).toEqual(["Marta Lobo"]);
    expect(searchNames("rafa-quintas")).toEqual(["Rafa Quintas"]);
    expect(searchNames("teo")).toEqual([]);
  });
});

describe("leadsDemoStore assign and unassign", () => {
  it("assigns once and writes one history line by the viewer", () => {
    const assigned = demoAssignLeadStaff(CAVE_ID, {
      userId: "demo-staff-marta",
    });
    expect(idsOf(assigned)).toEqual(["demo-staff-marta"]);
    expect(assigned.entries[0]).toMatchObject({
      kind: "assignee_added",
      author: { id: DEMO_LEAD_VIEWER_ID },
      subject: { id: "demo-staff-marta", displayName: "Marta Lobo" },
      canEdit: false,
    });
    const again = demoAssignLeadStaff(CAVE_ID, { userId: "demo-staff-marta" });
    expect(again.entries).toHaveLength(assigned.entries.length);
    expect(again.updatedAt).toBe(assigned.updatedAt);
  });

  it("unassigns once and ignores someone not assigned", () => {
    const removed = demoUnassignLeadStaff(LUA_ID, "demo-staff-marta");
    expect(idsOf(removed)).toEqual([DEMO_LEAD_VIEWER_ID]);
    expect(removed.entries[0]).toMatchObject({
      kind: "assignee_removed",
      subject: { id: "demo-staff-marta" },
    });
    expect(
      demoUnassignLeadStaff(LUA_ID, "demo-staff-marta").entries,
    ).toHaveLength(removed.entries.length);
  });

  it.each([
    [
      "an unknown lead",
      () =>
        demoAssignLeadStaff("demo-lead-nope", { userId: "demo-staff-marta" }),
      404,
      "LEAD_NOT_FOUND",
    ],
    [
      "a blank user id",
      () => demoAssignLeadStaff(CAVE_ID, { userId: " " }),
      400,
      "LEAD_ASSIGNEE_NOT_FOUND",
    ],
    [
      "an unknown person",
      () => demoAssignLeadStaff(CAVE_ID, { userId: "demo-staff-nobody" }),
      404,
      "LEAD_ASSIGNEE_NOT_FOUND",
    ],
    [
      "a lead gone on unassign",
      () => demoUnassignLeadStaff("demo-lead-nope", "demo-staff-marta"),
      404,
      "LEAD_NOT_FOUND",
    ],
  ] as const)(
    "refuses %s with the route's code",
    (_case, call, status, code) => {
      expect(refusalOf(call)).toMatchObject({ status, data: { code } });
    },
  );

  it("refuses a former staff member and names the missing access", () => {
    expect(
      refusalOf(() =>
        demoAssignLeadStaff(CAVE_ID, { userId: "demo-staff-teo" }),
      ),
    ).toMatchObject({
      status: 400,
      data: { code: "LEAD_ASSIGNEE_NOT_STAFF", reason: "no_access" },
    });
  });

  it("refuses an eleventh assignee", () => {
    const cave = DEMO_LEADS_SEED.leads.find((record) => record.id === CAVE_ID);
    const tenIds = [
      ...DEMO_LEAD_STAFF.map((person) => person.id),
      "extra-1",
      "extra-2",
      "extra-3",
      "extra-4",
    ];
    resetDemoLeads({ leads: cave ? [{ ...cave, assignees: tenIds }] : [] });
    expect(
      refusalOf(() =>
        demoAssignLeadStaff(CAVE_ID, { userId: DEMO_LEAD_VIEWER_ID }),
      ),
    ).toMatchObject({ status: 409, data: { code: "LEAD_TOO_MANY_ASSIGNEES" } });
  });
});

describe("leadsDemoStore seeded assignee history", () => {
  it("seeds the history lines the design names", () => {
    const luaAdded = demoGetLead(LUA_ID).entries.find(
      (entry) =>
        entry.kind === "assignee_added" &&
        entry.subject?.id === DEMO_LEAD_VIEWER_ID,
    );
    expect(luaAdded?.author?.displayName).toBe("Marta Lobo");
    expect(
      demoGetLead(CAVE_ID).entries.find(
        (entry) => entry.kind === "assignee_access_ended",
      ),
    ).toMatchObject({ author: null, subject: { displayName: "Teo Ramos" } });
  });

  it("keeps every lead's newest entry outside the assignee kinds", () => {
    for (const item of demoListLeads(EMPTY_LEAD_FILTERS).items) {
      expect(ASSIGNEE_KINDS).not.toContain(
        demoGetLead(item.id).entries[0]?.kind,
      );
    }
    expect(demoGetLead(CAVE_ID).entries[0]?.author).not.toBeNull();
  });
});
