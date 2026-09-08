import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAdminGovernancePolicyDraft } from "./adminGovernancePolicyDraft";
import type {
  AdminOverviewResponseDTO,
  CouncilSeatDTO,
} from "./api/adminGovernanceOverview.api";

/**
 * The council section is the one whose rows are shaped differently on the way
 * in and on the way out: a read carries the resolved `member`, a write carries
 * only the `memberId`. These cover that asymmetry and the save block that keeps
 * an empty seat from reaching the API.
 */

const emptyMeta = { editor: null, editedAt: null };

const seat = (overrides: Partial<CouncilSeatDTO> = {}): CouncilSeatDTO => ({
  memberId: "member-1",
  member: {
    slug: "mariana",
    firstName: "Mariana",
    lastName: "Loução",
    avatarUrl: null,
  },
  roleKey: "psychologistChair",
  tint: "jade",
  ...overrides,
});

function overviewWith(council: CouncilSeatDTO[]): AdminOverviewResponseDTO {
  return {
    health: [],
    moderationSteps: [],
    council,
    principles: [],
    decisions: [],
    meta: {
      health: emptyMeta,
      moderationSteps: emptyMeta,
      council: emptyMeta,
      principles: emptyMeta,
      decisions: emptyMeta,
    },
  };
}

describe("the Policy draft's council section", () => {
  it("sends the member id and drops the resolved member", () => {
    const { result } = renderHook(() =>
      useAdminGovernancePolicyDraft(overviewWith([seat()])),
    );

    act(() => {
      result.current.setSection.council([seat({ memberId: "member-2" })]);
    });

    // The API runs `forbidNonWhitelisted`: echoing `member` back would be a 400
    // that reads like nothing the editor did.
    expect(result.current.changedSectionsBody.council).toEqual([
      { memberId: "member-2", roleKey: "psychologistChair", tint: "jade" },
    ]);
  });

  it("carries an authored role through, and omits the key it does not have", () => {
    const { result } = renderHook(() =>
      useAdminGovernancePolicyDraft(overviewWith([seat()])),
    );
    const authored = { en: "Peer support lead", pt: "Apoio entre pares" };

    act(() => {
      result.current.setSection.council([
        { memberId: "member-3", member: null, role: authored, tint: "plum" },
      ]);
    });

    const [body] = result.current.changedSectionsBody.council ?? [];
    expect(body).toEqual({
      memberId: "member-3",
      role: authored,
      tint: "plum",
    });
    expect(body).not.toHaveProperty("roleKey");
  });

  it("blocks the save while a seat has nobody in it", () => {
    const { result } = renderHook(() =>
      useAdminGovernancePolicyDraft(overviewWith([seat()])),
    );
    expect(result.current.hasUnseatedCouncilRow).toBe(false);

    act(() => {
      result.current.setSection.council([
        seat(),
        // What "Add a seat" appends before anyone is picked.
        { memberId: "", member: null, role: { en: "", pt: "" }, tint: "jade" },
      ]);
    });

    expect(result.current.hasUnseatedCouncilRow).toBe(true);
  });

  it("leaves an unedited council out of the body entirely", () => {
    const { result } = renderHook(() =>
      useAdminGovernancePolicyDraft(overviewWith([seat()])),
    );

    act(() => {
      result.current.setSection.principles([
        { key: "noSellingData", icon: "lock" },
      ]);
    });

    // Only the sections that actually changed are PATCHed, so per-section
    // "edited by" metadata stays honest.
    expect(result.current.changedSectionsBody.council).toBeUndefined();
    expect(result.current.changedSectionsBody.principles).toBeDefined();
  });
});
