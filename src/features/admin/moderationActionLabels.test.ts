import { describe, expect, it } from "vitest";
import type { AuditEntryDTO } from "./api/moderation.api";
import { auditActionLabel } from "./moderationActionLabels";

const echoKey = ((key: string) => key) as Parameters<
  typeof auditActionLabel
>[1];

/** The trail's rows may carry codes wider than the DTO's union. */
function actionOf(code: string): AuditEntryDTO["action"] {
  return code as AuditEntryDTO["action"];
}

describe("auditActionLabel", () => {
  it("labels the Pulse Live staff takedowns", () => {
    expect(auditActionLabel(actionOf("quizshow_game_ended"), echoKey)).toBe(
      "admin:moderation.action.quizshowGameEnded",
    );
    expect(auditActionLabel(actionOf("quizshow_game_deleted"), echoKey)).toBe(
      "admin:moderation.action.quizshowGameDeleted",
    );
  });

  it("labels the quiz template staff actions", () => {
    expect(
      auditActionLabel(actionOf("quizshow_template_published"), echoKey),
    ).toBe("admin:moderation.action.quizshowTemplatePublished");
    expect(
      auditActionLabel(actionOf("quizshow_template_unpublished"), echoKey),
    ).toBe("admin:moderation.action.quizshowTemplateUnpublished");
    expect(
      auditActionLabel(actionOf("quizshow_template_deleted"), echoKey),
    ).toBe("admin:moderation.action.quizshowTemplateDeleted");
  });

  it("labels the seven quiz badge actions", () => {
    const expectedLabels: Record<string, string> = {
      quiz_badge_attached: "admin:moderation.action.quizBadgeAttached",
      quiz_badge_detached: "admin:moderation.action.quizBadgeDetached",
      quiz_badge_awarded_after_game:
        "admin:moderation.action.quizBadgeAwardedAfterGame",
      quiz_game_win_revoked: "admin:moderation.action.quizGameWinRevoked",
      quiz_badge_definition_archived:
        "admin:moderation.action.quizBadgeDefinitionArchived",
      quiz_badge_definition_restored:
        "admin:moderation.action.quizBadgeDefinitionRestored",
      quiz_badge_definition_deleted:
        "admin:moderation.action.quizBadgeDefinitionDeleted",
    };
    for (const [actionCode, expectedLabel] of Object.entries(expectedLabels)) {
      expect(auditActionLabel(actionOf(actionCode), echoKey)).toBe(
        expectedLabel,
      );
    }
  });

  it("falls back to the raw code for an unmapped action", () => {
    expect(auditActionLabel(actionOf("some_new_action"), echoKey)).toBe(
      "some_new_action",
    );
  });
});
