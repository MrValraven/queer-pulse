import { describe, expect, it } from "vitest";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction } from "../../../shared/i18n/types";
import {
  isLeadAssignedToFilter,
  type LeadStaffSummaryDTO,
} from "./api/leads.types";
import { LEAD_STAFF_AVATAR_TONES } from "./leadAssignees.data";
import {
  leadAssigneesAriaOf,
  leadStaffBySlug,
  leadStaffInitialsOf,
  leadStaffMidSentenceNameOf,
  leadStaffToneOf,
  toLeadStaffPerson,
} from "./leadAssignees.model";

const ENGLISH_STRINGS: Record<string, string> = {
  "admin:leads.assignees.you": "You",
  "admin:leads.history.unknownSubject": "a former team member",
  "admin:leads.list.assigneesAria": "In charge: {names}",
  "admin:leads.list.assigneesMoreAria": "In charge: {names} and {count} more",
};

const PORTUGUESE_STRINGS: Record<string, string> = {
  "admin:leads.assignees.you": "Tu",
  "admin:leads.history.unknownSubject": "alguém que já não está na equipa",
  "admin:leads.list.assigneesAria": "Responsáveis: {names}",
  "admin:leads.list.assigneesMoreAria": "Responsáveis: {names} e mais {count}",
};

function translatorOf(strings: Record<string, string>): TFunction {
  return (key, options) => interpolate(strings[key] ?? key, options);
}

const englishTranslate = translatorOf(ENGLISH_STRINGS);
const portugueseTranslate = translatorOf(PORTUGUESE_STRINGS);

function staff(id: string, displayName: string): LeadStaffSummaryDTO {
  return {
    id,
    slug: `${id}-slug`,
    displayName,
    avatarUrl: null,
    avatarCrop: null,
  };
}

const MARTA_STAFF = staff("demo-staff-marta", "Marta Lobo");

describe("leadAssignees.model", () => {
  it("joins every shown name with You for the viewer", () => {
    expect(
      leadAssigneesAriaOf(
        {
          assignees: [staff("staff-ana", "Ana Reis"), MARTA_STAFF],
          assigneeCount: 2,
        },
        "staff-ana",
        englishTranslate,
        "en",
      ),
    ).toBe("In charge: You and Marta Lobo");
  });

  it("lists the shown names then the rest as a count", () => {
    expect(
      leadAssigneesAriaOf(
        {
          assignees: [
            MARTA_STAFF,
            staff("r", "Rafa Quintas"),
            staff("j", "Joana Vidal"),
          ],
          assigneeCount: 5,
        },
        null,
        englishTranslate,
        "en",
      ),
    ).toBe("In charge: Marta Lobo, Rafa Quintas, Joana Vidal and 2 more");
  });

  it("uses the Portuguese list words", () => {
    expect(
      leadAssigneesAriaOf(
        {
          assignees: [MARTA_STAFF, staff("r", "Rafa Quintas")],
          assigneeCount: 2,
        },
        null,
        portugueseTranslate,
        "pt",
      ),
    ).toBe("Responsáveis: Marta Lobo e Rafa Quintas");
  });

  it("uses the Portuguese more line after a comma list", () => {
    expect(
      leadAssigneesAriaOf(
        {
          assignees: [
            MARTA_STAFF,
            staff("r", "Rafa Quintas"),
            staff("j", "Joana Vidal"),
          ],
          assigneeCount: 5,
        },
        null,
        portugueseTranslate,
        "pt",
      ),
    ).toBe("Responsáveis: Marta Lobo, Rafa Quintas, Joana Vidal e mais 2");
  });

  it("names a blank-named assignee as a former team member", () => {
    expect(
      leadAssigneesAriaOf(
        { assignees: [MARTA_STAFF, staff("gone", "  ")], assigneeCount: 2 },
        null,
        englishTranslate,
        "en",
      ),
    ).toBe("In charge: Marta Lobo and a former team member");
  });

  it("says nothing for an unassigned lead", () => {
    expect(
      leadAssigneesAriaOf(
        { assignees: [], assigneeCount: 0 },
        null,
        englishTranslate,
        "en",
      ),
    ).toBeNull();
  });

  it("maps a staff summary to a picker row with You as the viewer's detail", () => {
    expect(
      toLeadStaffPerson(staff("staff-ana", "Ana Reis"), "staff-ana", "You"),
    ).toEqual({
      slug: "staff-ana-slug",
      name: "Ana Reis",
      avatarUrl: undefined,
      detail: "You",
    });
    expect(
      toLeadStaffPerson(
        { ...MARTA_STAFF, avatarUrl: "https://example.org/m.jpg" },
        "staff-ana",
        "You",
      ),
    ).toEqual({
      slug: "demo-staff-marta-slug",
      name: "Marta Lobo",
      avatarUrl: "https://example.org/m.jpg",
      detail: undefined,
    });
  });

  it("finds a summary by slug across results and assignees", () => {
    expect(leadStaffBySlug("demo-staff-marta-slug", [[], [MARTA_STAFF]])).toBe(
      MARTA_STAFF,
    );
    expect(leadStaffBySlug("nobody", [[MARTA_STAFF]])).toBeNull();
  });

  it("gives each person one tone and two initials", () => {
    expect(leadStaffToneOf("demo-staff-marta")).toBe(
      leadStaffToneOf("demo-staff-marta"),
    );
    expect(LEAD_STAFF_AVATAR_TONES).toContain(leadStaffToneOf("anyone"));
    expect(leadStaffInitialsOf("marta lobo")).toBe("ML");
    expect(leadStaffInitialsOf("  ")).toBe("");
  });

  it("reads a blank name as the lower-case unknown subject mid-sentence", () => {
    expect(
      leadStaffMidSentenceNameOf(staff("gone", "  "), null, englishTranslate),
    ).toBe("a former team member");
    expect(
      leadStaffMidSentenceNameOf(MARTA_STAFF, null, englishTranslate),
    ).toBe("Marta Lobo");
    expect(
      leadStaffMidSentenceNameOf(
        MARTA_STAFF,
        "demo-staff-marta",
        portugueseTranslate,
      ),
    ).toBe("Tu");
  });

  it.each([
    ["me", true],
    ["me_or_unassigned", true],
    ["unassigned", true],
    ["", false],
    ["mine", false],
    [["me"], false],
    [null, false],
  ])("tells whether %o is an In charge view", (value, isView) => {
    expect(isLeadAssignedToFilter(value)).toBe(isView);
  });
});
