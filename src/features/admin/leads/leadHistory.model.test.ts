import { describe, expect, it } from "vitest";
import type {
  LeadEntryDTO,
  LeadPersonaDTO,
  LeadStaffSummaryDTO,
} from "./api/leads.types";
import { leadHistoryLineOf } from "./leadHistory.model";

const translate = (key: string): string => key;

const MARTA = {
  id: "demo-staff-marta",
  displayName: "Marta Lobo",
  avatarUrl: null,
  avatarCrop: null,
};

const AFTERHOURS_PERSONA: LeadPersonaDTO = {
  id: "sp-jordan-afterhours",
  handle: "afterhours",
  displayName: "Afterhours",
  kind: "dj",
  avatarUrl: null,
  avatarCrop: null,
};

const ANA: LeadStaffSummaryDTO = {
  id: "staff-ana",
  slug: "ana-reis-demo",
  displayName: "Ana Reis",
  avatarUrl: null,
  avatarCrop: null,
};

function entryWith(overrides: Partial<LeadEntryDTO>): LeadEntryDTO {
  return {
    id: "entry-1",
    kind: "note",
    body: null,
    fromStage: null,
    toStage: null,
    persona: null,
    author: MARTA,
    createdAt: "2026-11-01T10:00:00.000Z",
    editedAt: null,
    canEdit: false,
    subject: null,
    ...overrides,
  };
}

describe("leadHistory.model", () => {
  it("reads a stage change with both stages", () => {
    expect(
      leadHistoryLineOf(
        entryWith({
          kind: "stage_changed",
          fromStage: "contacted",
          toStage: "in_talks",
        }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.stageChanged",
      values: {
        author: "Marta Lobo",
        from: "admin:leads.stage.contacted",
        to: "admin:leads.stage.in_talks",
      },
    });
  });

  it("reads the created line with the starting stage", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "created", toStage: "to_contact" }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.created",
      values: { author: "Marta Lobo", stage: "admin:leads.stage.to_contact" },
    });
  });

  it("names the persona on a link entry while it exists", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "persona_unlinked", persona: AFTERHOURS_PERSONA }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.personaUnlinked",
      values: { author: "Marta Lobo", persona: "Afterhours" },
    });
  });

  it("reads a link entry whose persona is gone as no longer available", () => {
    const line = leadHistoryLineOf(
      entryWith({ kind: "persona_linked", persona: null }),
      translate,
    );
    expect(line?.key).toBe("admin:leads.history.personaGoneLinked");
    expect(line?.values).not.toHaveProperty("persona");
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "persona_unlinked", persona: null }),
        translate,
      )?.key,
    ).toBe("admin:leads.history.personaGoneUnlinked");
  });

  it("names a gone author with the unknown author line", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "created", toStage: "contacted", author: null }),
        translate,
      )?.values.author,
    ).toBe("admin:leads.history.unknownAuthor");
  });

  it("names an author with a blank name with the unknown author line", () => {
    for (const displayName of ["", "   "]) {
      expect(
        leadHistoryLineOf(
          entryWith({
            kind: "stage_changed",
            fromStage: "contacted",
            toStage: "in_talks",
            author: { ...MARTA, displayName },
          }),
          translate,
        )?.values.author,
      ).toBe("admin:leads.history.unknownAuthor");
    }
  });

  it("reads nothing for a kind this build does not know", () => {
    const futureEntry = {
      ...entryWith({ kind: "created", toStage: "contacted" }),
      kind: "merged",
    } as unknown as LeadEntryDTO;
    expect(leadHistoryLineOf(futureEntry, translate)).toBeNull();
  });

  it("leaves notes to the note item", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "note", body: "Met at Lux" }),
        translate,
      ),
    ).toBeNull();
  });

  it("reads an assignment by someone else", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "assignee_added", subject: ANA }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.assigneeAdded",
      values: { author: "Marta Lobo", subject: "Ana Reis" },
    });
  });

  it("reads a self assignment and a self unassignment", () => {
    const self = { ...ANA, id: MARTA.id };
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "assignee_added", subject: self }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.assigneeAddedSelf",
      values: { author: "Marta Lobo" },
    });
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "assignee_removed", subject: self }),
        translate,
      )?.key,
    ).toBe("admin:leads.history.assigneeRemovedSelf");
  });

  it("names a gone subject as a former team member", () => {
    expect(
      leadHistoryLineOf(
        entryWith({ kind: "assignee_removed", subject: null }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.assigneeRemoved",
      values: {
        author: "Marta Lobo",
        subject: "admin:leads.history.unknownSubject",
      },
    });
  });

  it("reads an access-ended line with no author", () => {
    expect(
      leadHistoryLineOf(
        entryWith({
          kind: "assignee_access_ended",
          author: null,
          subject: ANA,
        }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.assigneeAccessEnded",
      values: { subject: "Ana Reis" },
    });
  });

  it("reads an access-ended line whose subject is gone", () => {
    expect(
      leadHistoryLineOf(
        entryWith({
          kind: "assignee_access_ended",
          author: null,
          subject: null,
        }),
        translate,
      ),
    ).toEqual({
      key: "admin:leads.history.assigneeAccessEndedGone",
      values: {},
    });
  });
});
