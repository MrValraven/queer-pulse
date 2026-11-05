import { beforeEach, describe, expect, it } from "vitest";
import {
  EMPTY_LEAD_FILTERS,
  type CreateLeadBody,
  type LeadDTO,
} from "./api/leads.types";
import {
  demoAddLeadNote,
  demoCreateLead,
  demoDeleteLead,
  demoDeleteLeadNote,
  demoEditLeadNote,
  demoGetLead,
  demoLeadDueCount,
  demoListLeads,
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
