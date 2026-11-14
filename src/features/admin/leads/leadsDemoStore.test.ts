import { beforeEach, describe, expect, it } from "vitest";
import {
  EMPTY_LEAD_FILTERS,
  LEAD_REVERT_WINDOW_MS,
  type CreateLeadBody,
  type LeadDTO,
  type LeadStage,
} from "./api/leads.types";
import type { DemoLeadsSeed } from "./leadsDemo.data";
import {
  demoAddLeadNote,
  demoCreateLead,
  demoDeleteLead,
  demoDeleteLeadNote,
  demoEditLeadNote,
  demoGetLead,
  demoLeadDueCount,
  demoListLeads,
  demoRevertLeadStageChange,
  demoSearchLeadPersonas,
  demoUpdateLead,
  resetDemoLeads,
} from "./leadsDemoStore";

const CAVE_ID = "demo-lead-cave-23";
const LUA_ID = "demo-lead-lua-marques";
const VANDA_ID = "demo-lead-vanda-diesel";
const ZINE_ID = "demo-lead-zine-tinta";
const VANDA_PERSONA_ID = "sp-ines-fonseca-vanda-diesel";

const namesOf = (filters: Partial<typeof EMPTY_LEAD_FILTERS>): string[] =>
  demoListLeads({ ...EMPTY_LEAD_FILTERS, ...filters }).items.map(
    (item) => item.name,
  );

/** Runs a store call that must refuse, and hands back what it threw. */
function refusalOf(call: () => unknown): unknown {
  try {
    call();
  } catch (error) {
    return error;
  }
  throw new Error("expected the call to refuse");
}

const newestKindsOf = (lead: LeadDTO, count: number) =>
  lead.entries.slice(0, count).map((entry) => entry.kind);

/** One lead whose last stage change Marta wrote two days ago, from To
 *  contact to Contacted, now sitting in `stage`. */
function seedWithStageChange(stage: LeadStage): DemoLeadsSeed {
  return {
    leads: [
      {
        id: "demo-lead-solo",
        name: "Solo",
        type: "dj",
        stage,
        location: null,
        email: null,
        phone: null,
        links: [],
        followUpOffsetDays: null,
        linkedPersonaId: null,
        entries: [
          {
            kind: "created",
            daysAgo: 3,
            authorId: "demo-staff-marta",
            toStage: "to_contact",
          },
          {
            kind: "stage_changed",
            daysAgo: 2,
            authorId: "demo-staff-marta",
            fromStage: "to_contact",
            toStage: "contacted",
          },
        ],
      },
    ],
  };
}

const SOLO_ID = "demo-lead-solo";

/** The id of the solo lead's seeded stage change line. */
const soloStageChangeId = (): string =>
  demoGetLead(SOLO_ID).entries.find((entry) => entry.kind === "stage_changed")
    ?.id ?? "";

/** Moves Cave 23 to `stage` and hands back the line the move wrote. */
function moveCave(stage: LeadStage): string {
  return demoUpdateLead(CAVE_ID, { stage }).entries[0]?.id ?? "";
}

beforeEach(() => resetDemoLeads());

describe("leadsDemoStore list", () => {
  it("lists due follow-ups first, oldest date first", () => {
    expect(
      demoListLeads(EMPTY_LEAD_FILTERS)
        .items.slice(0, 4)
        .map((item) => item.name),
    ).toEqual(["Cave 23", "Lua Marques", "Coletivo Maré", "Kai Duarte"]);
  });

  it("keeps not-now and on-board leads out of the due count and the due sort", () => {
    expect(demoLeadDueCount()).toEqual({ count: 4 });
    const dueNames = namesOf({ isDueOnly: true });
    expect(dueNames).toHaveLength(4);
    expect(dueNames).not.toContain("Rita Sol Produções");
    expect(dueNames).not.toContain("Vanda Diesel");
    const listed = demoListLeads(EMPTY_LEAD_FILTERS).items;
    const vandaIndex = listed.findIndex((item) => item.name === "Vanda Diesel");
    expect(vandaIndex).toBeGreaterThanOrEqual(4);
    expect(listed[vandaIndex]?.isFollowUpDue).toBe(false);
  });

  it("counts stages for the search and type only", () => {
    const page = demoListLeads({
      ...EMPTY_LEAD_FILTERS,
      type: "dj",
      stage: "on_board",
    });
    expect(page.items.map((item) => item.name)).toEqual(["Afterhours"]);
    expect(page.stageCounts).toEqual({
      to_contact: 0,
      contacted: 1,
      in_talks: 0,
      on_board: 1,
      not_now: 0,
    });
    expect(page.totalCount).toBe(2);
    expect(page.nextCursor).toBeNull();
  });

  it("counts due follow-ups for the search and type only", () => {
    expect(demoListLeads(EMPTY_LEAD_FILTERS).dueCount).toBe(4);
    expect(
      demoListLeads({
        ...EMPTY_LEAD_FILTERS,
        stage: "on_board",
        isDueOnly: true,
      }).dueCount,
    ).toBe(4);
    expect(
      demoListLeads({ ...EMPTY_LEAD_FILTERS, type: "venue" }).dueCount,
    ).toBe(1);
    expect(demoListLeads({ ...EMPTY_LEAD_FILTERS, q: "Cave" }).dueCount).toBe(
      1,
    );
  });

  it("drops a lead from the due count when it closes", () => {
    demoUpdateLead(CAVE_ID, { stage: "on_board" });
    expect(demoListLeads(EMPTY_LEAD_FILTERS).dueCount).toBe(3);
  });

  it("searches name, email and links with folded accents", () => {
    expect(namesOf({ q: "ambar" })).toEqual(["Sala Âmbar"]);
    expect(namesOf({ q: "cave23.example" })).toEqual(["Cave 23"]);
    expect(namesOf({ q: "MIXCLOUD" })).toEqual(["Kai Duarte"]);
  });

  it("shows three links and the full count", () => {
    const kai = demoListLeads({ ...EMPTY_LEAD_FILTERS, q: "Kai" }).items[0];
    expect(kai?.links).toHaveLength(3);
    expect(kai?.linkCount).toBe(4);
  });

  it("shows the linked persona with its directory state", () => {
    const afterhours = demoListLeads({ ...EMPTY_LEAD_FILTERS, q: "afterhours" })
      .items[0];
    expect(afterhours?.linkedPersona?.id).toBe("sp-jordan-afterhours");
    expect(afterhours?.linkedPersona?.publicState).toBe("not_open");
  });
});

describe("leadsDemoStore create", () => {
  it("creates a lead with its created entry and first note", () => {
    const lead = demoCreateLead({
      name: " Nova ",
      type: "dj",
      note: "Met at Lux",
    });
    expect(lead.name).toBe("Nova");
    expect(lead.stage).toBe("to_contact");
    expect(lead.entries.map((entry) => entry.kind)).toEqual([
      "note",
      "created",
    ]);
    expect(lead.entries[0]?.body).toBe("Met at Lux");
    expect(lead.entries[1]?.toStage).toBe("to_contact");
    expect(demoGetLead(lead.id).name).toBe("Nova");
  });

  it.each([
    [{ name: " ", type: "dj" }, "LEAD_NAME_REQUIRED", 400],
    [{ name: "A", type: "mime" }, "LEAD_TYPE_INVALID", 400],
    [{ name: "A", type: "dj", email: "nope" }, "LEAD_EMAIL_INVALID", 400],
    [
      { name: "A", type: "dj", links: ["https://ok.example", "ftp://x"] },
      "LEAD_LINK_INVALID",
      400,
    ],
    [
      { name: "A", type: "dj", followUpOn: "2026-02-30" },
      "LEAD_FOLLOW_UP_INVALID",
      400,
    ],
    [
      { name: "A", type: "dj", email: "ana@gmail.c" },
      "LEAD_EMAIL_INVALID",
      400,
    ],
    [
      { name: "A", type: "dj", email: "ana..x@example.com" },
      "LEAD_EMAIL_INVALID",
      400,
    ],
    [
      { name: "A", type: "dj", email: "ana@my_host.com" },
      "LEAD_EMAIL_INVALID",
      400,
    ],
    [
      { name: "A", type: "dj", email: `${"a".repeat(65)}@example.com` },
      "LEAD_EMAIL_INVALID",
      400,
    ],
  ])("refuses %o with %s", (body, code, status) => {
    expect(
      refusalOf(() => demoCreateLead(body as CreateLeadBody)),
    ).toMatchObject({ status, data: { code } });
  });

  it("keeps a plus tag and a subdomain in an email", () => {
    expect(
      demoCreateLead({ name: "A", type: "dj", email: "Ana+Leads@example.org" })
        .email,
    ).toBe("ana+leads@example.org");
    expect(
      demoCreateLead({
        name: "B",
        type: "dj",
        email: "bookings@mail.cave.example",
      }).email,
    ).toBe("bookings@mail.cave.example");
  });

  it("trims a padded type and removes a NUL from the name", () => {
    const paddedBody = { name: "No\u0000va", type: "band " };
    const lead = demoCreateLead(paddedBody as CreateLeadBody);
    expect(lead.type).toBe("band");
    expect(lead.name).toBe("Nova");
  });

  it("names the other lead on a taken email and a taken link", () => {
    expect(
      refusalOf(() =>
        demoCreateLead({
          name: "A",
          type: "venue",
          email: "BOOKINGS@cave23.example ",
        }),
      ),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_EMAIL_TAKEN", leadId: CAVE_ID, leadName: "Cave 23" },
    });
    expect(
      refusalOf(() =>
        demoCreateLead({
          name: "A",
          type: "artist",
          links: [
            "https://x.example",
            "http://www.instagram.com/luamarques.demo/?igsh=1",
          ],
        }),
      ),
    ).toMatchObject({
      status: 409,
      data: {
        code: "LEAD_LINK_TAKEN",
        index: 1,
        leadId: LUA_ID,
        leadName: "Lua Marques",
      },
    });
  });
});

describe("leadsDemoStore update", () => {
  it("writes a stage change once and ignores the current value", () => {
    const changed = demoUpdateLead(CAVE_ID, { stage: "on_board" });
    expect(changed.entries[0]).toMatchObject({
      kind: "stage_changed",
      fromStage: "in_talks",
      toStage: "on_board",
    });
    const again = demoUpdateLead(CAVE_ID, { stage: "on_board" });
    expect(again.entries).toHaveLength(changed.entries.length);
    expect(again.updatedAt).toBe(changed.updatedAt);
  });

  it("refuses a persona linked to another lead or off the directory", () => {
    expect(
      refusalOf(() =>
        demoUpdateLead(ZINE_ID, { linkedSubprofileId: VANDA_PERSONA_ID }),
      ),
    ).toMatchObject({
      status: 409,
      data: {
        code: "LEAD_PERSONA_TAKEN",
        leadId: VANDA_ID,
        leadName: "Vanda Diesel",
      },
    });
    expect(
      refusalOf(() =>
        demoUpdateLead(ZINE_ID, { linkedSubprofileId: "sp-anika-journal" }),
      ),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_PERSONA_NOT_LISTED", publicState: "not_open" },
    });
    expect(
      refusalOf(() => demoUpdateLead(ZINE_ID, { linkedSubprofileId: "nope" })),
    ).toMatchObject({ status: 400, data: { code: "LEAD_PERSONA_NOT_FOUND" } });
    expect(demoGetLead(ZINE_ID).linkedPersona).toBeNull();
  });

  it("unlinks then links on a persona swap", () => {
    const lead = demoUpdateLead(VANDA_ID, {
      linkedSubprofileId: "sp-bea-cadeira",
    });
    expect(newestKindsOf(lead, 2)).toEqual([
      "persona_linked",
      "persona_unlinked",
    ]);
    expect(lead.entries[0]?.persona?.id).toBe("sp-bea-cadeira");
    expect(lead.entries[1]?.persona?.id).toBe(VANDA_PERSONA_ID);
    expect(lead.linkedPersona).toMatchObject({
      id: "sp-bea-cadeira",
      publicState: "shown",
    });
  });
});

describe("leadsDemoStore notes and delete", () => {
  it("adds, edits and deletes a note", () => {
    const added = demoAddLeadNote(ZINE_ID, { body: "Call back Friday" });
    const note = added.entries[0];
    expect(note).toMatchObject({
      kind: "note",
      body: "Call back Friday",
      editedAt: null,
      canEdit: true,
    });
    const noteId = note?.id ?? "";
    const edited = demoEditLeadNote(ZINE_ID, noteId, {
      body: "Call back Monday",
    });
    const editedNote = edited.entries.find((entry) => entry.id === noteId);
    expect(editedNote?.body).toBe("Call back Monday");
    expect(editedNote?.editedAt).not.toBeNull();
    const afterDelete = demoDeleteLeadNote(ZINE_ID, noteId);
    expect(afterDelete.entries.some((entry) => entry.id === noteId)).toBe(
      false,
    );
  });

  it("refuses to edit a stage line", () => {
    const created = demoGetLead(CAVE_ID).entries.find(
      (entry) => entry.kind === "created",
    );
    expect(
      refusalOf(() =>
        demoEditLeadNote(CAVE_ID, created?.id ?? "", { body: "Changed" }),
      ),
    ).toMatchObject({ status: 409, data: { code: "LEAD_ENTRY_NOT_EDITABLE" } });
  });

  it("answers not found after a delete", () => {
    expect(demoDeleteLead(CAVE_ID)).toEqual({ ok: true });
    expect(refusalOf(() => demoGetLead(CAVE_ID))).toMatchObject({
      status: 404,
      data: { code: "LEAD_NOT_FOUND" },
    });
    expect(demoLeadDueCount()).toEqual({ count: 3 });
  });

  it("searches personas by handle and flags linked ones", () => {
    const results = demoSearchLeadPersonas("@vanda");
    expect(results).toHaveLength(1);
    expect(results[0]?.linkedLead?.name).toBe("Vanda Diesel");
    expect(demoSearchLeadPersonas("@ vanda")).toHaveLength(1);
    expect(demoSearchLeadPersonas("  ")).toEqual([]);
    expect(Object.keys(results[0]?.persona ?? {}).sort()).toEqual([
      "avatarCrop",
      "avatarUrl",
      "displayName",
      "handle",
      "id",
      "kind",
    ]);
  });
});

describe("leadsDemoStore stage change revert", () => {
  it("puts the stage back and deletes the line, writing none", () => {
    const before = demoGetLead(CAVE_ID).entries.length;
    const entryId = moveCave("on_board");
    const reverted = demoRevertLeadStageChange(CAVE_ID, entryId);
    expect(reverted.stage).toBe("in_talks");
    expect(reverted.entries).toHaveLength(before);
    expect(reverted.entries.some((entry) => entry.id === entryId)).toBe(false);
    expect(demoListLeads(EMPTY_LEAD_FILTERS).dueCount).toBe(4);
  });

  it("refuses a lead that is gone", () => {
    expect(
      refusalOf(() => demoRevertLeadStageChange("demo-lead-nope", "entry")),
    ).toMatchObject({ status: 404, data: { code: "LEAD_NOT_FOUND" } });
  });

  it("refuses a line that is gone or sits on another lead", () => {
    const entryId = moveCave("on_board");
    expect(
      refusalOf(() => demoRevertLeadStageChange(ZINE_ID, entryId)),
    ).toMatchObject({ status: 404, data: { code: "LEAD_ENTRY_NOT_FOUND" } });
    demoRevertLeadStageChange(CAVE_ID, entryId);
    expect(
      refusalOf(() => demoRevertLeadStageChange(CAVE_ID, entryId)),
    ).toMatchObject({ status: 404, data: { code: "LEAD_ENTRY_NOT_FOUND" } });
  });

  it("refuses a line that is no stage change", () => {
    const created = demoGetLead(CAVE_ID).entries.find(
      (entry) => entry.kind === "created",
    );
    expect(
      refusalOf(() => demoRevertLeadStageChange(CAVE_ID, created?.id ?? "")),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason: "not_stage_change" },
    });
  });

  it("refuses a stage change with a later one after it", () => {
    const firstEntryId = moveCave("on_board");
    moveCave("not_now");
    expect(
      refusalOf(() => demoRevertLeadStageChange(CAVE_ID, firstEntryId)),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason: "not_newest" },
    });
    expect(demoGetLead(CAVE_ID).stage).toBe("not_now");
  });

  it("refuses a stage change when the stage moved since", () => {
    resetDemoLeads(seedWithStageChange("on_board"));
    expect(
      refusalOf(() => demoRevertLeadStageChange(SOLO_ID, soloStageChangeId())),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason: "stage_moved" },
    });
  });

  it("refuses someone else's stage change to a caller who is no Admin", () => {
    resetDemoLeads(seedWithStageChange("contacted"));
    const caller = { userId: "demo-staff-rafa", isAdmin: false };
    expect(
      refusalOf(() =>
        demoRevertLeadStageChange(SOLO_ID, soloStageChangeId(), { caller }),
      ),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason: "not_yours" },
    });
  });

  it("refuses a stage change older than ten minutes", () => {
    resetDemoLeads(seedWithStageChange("contacted"));
    expect(
      refusalOf(() => demoRevertLeadStageChange(SOLO_ID, soloStageChangeId())),
    ).toMatchObject({
      status: 409,
      data: { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason: "too_old" },
    });
    resetDemoLeads();
    const entryId = moveCave("on_board");
    const movedAtMs = Date.parse(
      demoGetLead(CAVE_ID).entries[0]?.createdAt ?? "",
    );
    expect(
      refusalOf(() =>
        demoRevertLeadStageChange(CAVE_ID, entryId, {
          nowMs: movedAtMs + LEAD_REVERT_WINDOW_MS + 1,
        }),
      ),
    ).toMatchObject({ data: { reason: "too_old" } });
    expect(
      demoRevertLeadStageChange(CAVE_ID, entryId, {
        nowMs: movedAtMs + LEAD_REVERT_WINDOW_MS,
      }).stage,
    ).toBe("in_talks");
  });

  it("lets the author revert their own stage change", () => {
    resetDemoLeads(seedWithStageChange("contacted"));
    const entryId = soloStageChangeId();
    const writtenAtMs = Date.parse(
      demoGetLead(SOLO_ID).entries.find((entry) => entry.id === entryId)
        ?.createdAt ?? "",
    );
    const reverted = demoRevertLeadStageChange(SOLO_ID, entryId, {
      caller: { userId: "demo-staff-marta", isAdmin: false },
      nowMs: writtenAtMs + 1000,
    });
    expect(reverted.stage).toBe("to_contact");
  });
});
