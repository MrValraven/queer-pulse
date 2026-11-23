import { describe, expect, it } from "vitest";
import type { CommunityBadgeAdminDTO } from "./api/communityBadges.api";
import {
  createBodyFromDraft,
  draftFieldProblem,
  draftFromAdminBadge,
  draftProblem,
  draftProblems,
  draftWithRule,
  emptyCommunityBadgeDraft,
  isThresholdLowered,
  previewFlairFromDraft,
  refusalField,
  updateBodyFromDraft,
} from "./communityBadgeForm.model";
import { communityBadgeRefusal } from "./communityBadgeErrors";

function adminBadge(
  overrides: Partial<CommunityBadgeAdminDTO> = {},
): CommunityBadgeAdminDTO {
  return {
    id: "badge-1",
    starterKey: "regular",
    name: "Regular",
    iconKey: "calendar",
    tint: "jade",
    ruleType: "events_checked_in",
    threshold: 3,
    isEnabled: true,
    holderCount: 4,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("communityBadgeForm.model", () => {
  it("starts a new badge on the events rule at three", () => {
    expect(emptyCommunityBadgeDraft()).toEqual({
      name: "",
      iconKey: "award",
      tint: "jade",
      ruleType: "events_checked_in",
      threshold: "3",
      isEnabled: true,
    });
    const body = createBodyFromDraft({
      ...emptyCommunityBadgeDraft(),
      name: "  Night owls ",
    });
    expect(body).toEqual({
      name: "Night owls",
      iconKey: "award",
      tint: "jade",
      ruleType: "events_checked_in",
      threshold: 3,
      isEnabled: true,
    });
  });

  it("sends only the changed fields on an edit and keeps the rule fixed", () => {
    const badge = adminBadge();
    const draft = {
      ...draftFromAdminBadge(badge),
      name: "Regulars",
      ruleType: "tenure_days" as const,
    };
    const body = updateBodyFromDraft(draft, badge);
    expect(body).toEqual({ name: "Regulars" });
    expect("ruleType" in body).toBe(false);
    expect(updateBodyFromDraft(draftFromAdminBadge(badge), badge)).toEqual({});
  });

  it("opens an unknown icon and tint as an award in jade without sending them back", () => {
    const badge = adminBadge({ iconKey: "rocket", tint: "teal" });
    const draft = draftFromAdminBadge(badge);
    expect(draft.iconKey).toBe("award");
    expect(draft.tint).toBe("jade");
    expect(updateBodyFromDraft(draft, badge)).toEqual({});
  });

  it("names an empty name and a long one", () => {
    const base = emptyCommunityBadgeDraft();
    expect(draftProblem({ ...base, name: "  " })).toEqual({
      code: "badge_name_required",
      field: "name",
    });
    expect(draftProblem({ ...base, name: "a".repeat(33) })).toEqual({
      code: "badge_name_too_long",
      field: "name",
    });
    expect(
      draftProblem({ ...base, name: `${"a".repeat(31)}\u{1F319}` }),
    ).toBeNull();
    expect(
      draftProblem({ ...base, name: `${"a".repeat(32)}\u{1F319}` }),
    ).toEqual({
      code: "badge_name_too_long",
      field: "name",
    });
  });

  it("names a threshold outside the rule range or not whole", () => {
    const base = { ...emptyCommunityBadgeDraft(), name: "Night owls" };
    expect(
      draftProblem({ ...base, ruleType: "tenure_days", threshold: "10" }),
    ).toEqual({ code: "badge_threshold_out_of_range", field: "threshold" });
    expect(draftProblem({ ...base, threshold: "2.5" })).toEqual({
      code: "badge_threshold_out_of_range",
      field: "threshold",
    });
    expect(draftProblem({ ...base, threshold: "" })).toEqual({
      code: "badge_threshold_out_of_range",
      field: "threshold",
    });
    expect(
      draftProblem({ ...base, ruleType: "tenure_days", threshold: "30" }),
    ).toBeNull();
  });

  it("checks one field on its own for the blur check", () => {
    const draft = { ...emptyCommunityBadgeDraft(), threshold: "0" };
    expect(draftFieldProblem(draft, "name")).toEqual({
      code: "badge_name_required",
      field: "name",
    });
    expect(draftFieldProblem(draft, "threshold")).toEqual({
      code: "badge_threshold_out_of_range",
      field: "threshold",
    });
    expect(draftProblems(draft).map((problem) => problem.field)).toEqual([
      "name",
      "threshold",
    ]);
    expect(
      draftFieldProblem({ ...draft, name: "Night owls" }, "name"),
    ).toBeNull();
  });

  it("tells a lowered threshold apart from a raised one", () => {
    const badge = adminBadge({ threshold: 5 });
    const draft = draftFromAdminBadge(badge);
    expect(isThresholdLowered({ ...draft, threshold: "4" }, badge)).toBe(true);
    expect(isThresholdLowered({ ...draft, threshold: "6" }, badge)).toBe(false);
    expect(isThresholdLowered({ ...draft, threshold: "5" }, badge)).toBe(false);
    expect(isThresholdLowered({ ...draft, threshold: "" }, badge)).toBe(false);
  });

  it("keeps the starter key on the preview chip", () => {
    const draft = draftFromAdminBadge(adminBadge());
    expect(previewFlairFromDraft(draft, "regular")).toEqual({
      name: "Regular",
      starterKey: "regular",
      iconKey: "calendar",
      tint: "jade",
    });
  });

  it("puts each refusal under the field it names", () => {
    expect(refusalField(communityBadgeRefusal("badge_name_taken"))).toBe(
      "name",
    );
    expect(
      refusalField(communityBadgeRefusal("badge_threshold_out_of_range")),
    ).toBe("threshold");
    expect(refusalField(communityBadgeRefusal("badge_icon_unknown"))).toBe(
      "icon",
    );
    expect(refusalField(communityBadgeRefusal("badge_tint_unknown"))).toBe(
      "tint",
    );
    expect(
      refusalField(communityBadgeRefusal("badge_limit_reached")),
    ).toBeNull();
    expect(refusalField(new Error("offline"))).toBeNull();
  });
  it("resets a threshold the new rule cannot take to that rule's minimum", () => {
    const base = emptyCommunityBadgeDraft();
    const onTenure = draftWithRule(base, "tenure_days");
    expect(onTenure).toMatchObject({
      ruleType: "tenure_days",
      threshold: "30",
    });
    expect(
      draftWithRule({ ...base, threshold: "2.5" }, "volunteer_hours"),
    ).toMatchObject({ ruleType: "volunteer_hours", threshold: "1" });
    expect(draftWithRule(onTenure, "events_checked_in")).toMatchObject({
      ruleType: "events_checked_in",
      threshold: "30",
    });
  });
});
