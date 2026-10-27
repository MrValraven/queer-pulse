import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  quizshowTemplateErrorKeyOf,
  quizshowTemplatePublishErrorKeyOf,
} from "./quizshowTemplateErrors";

describe("quizshow template error copy", () => {
  it("names a coded refusal", () => {
    const error = new ApiError(404, "x", {
      code: "quizshow_template_not_found",
    });
    expect(quizshowTemplateErrorKeyOf(error)).toBe(
      "quizshow:errors.template_not_found",
    );
    const cardRefusal = new ApiError(422, "x", {
      code: "quizshow_template_card_incomplete",
      missing: ["description.pt"],
    });
    expect(quizshowTemplateErrorKeyOf(cardRefusal)).toBe(
      "quizshow:errors.template_card_incomplete",
    );
  });

  it("reads an uncoded 404 as missing Pulse Live access", () => {
    expect(quizshowTemplateErrorKeyOf(new ApiError(404, "Not Found"))).toBe(
      "quizshow:templates.errors.noFeatureAccess",
    );
  });

  it("reads an uncoded 403 as a missing staff role", () => {
    expect(quizshowTemplateErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "quizshow:templates.errors.noStaffRole",
    );
    expect(
      quizshowTemplatePublishErrorKeyOf(new ApiError(403, "Forbidden")),
    ).toBe("quizshow:templates.errors.noStaffRole");
  });

  it.each([
    ["Forbidden resource", "quizshow:templates.errors.noStaffRole"],
    [
      "Active membership required",
      "quizshow:templates.errors.membershipInactive",
    ],
    [
      "Referenced upload does not belong to you",
      "quizshow:templates.errors.foreignUpload",
    ],
    ["Invalid or missing CSRF token", "quizshow:templates.errors.staleSession"],
    ["Cross-site request rejected", "quizshow:templates.errors.staleSession"],
    ["Origin not allowed", "quizshow:templates.errors.staleSession"],
  ])("reads the uncoded 403 %j by its message", (message, expectedKey) => {
    const refused = new ApiError(403, message, {
      statusCode: 403,
      message,
      error: "Forbidden",
    });
    expect(quizshowTemplateErrorKeyOf(refused)).toBe(expectedKey);
    expect(quizshowTemplatePublishErrorKeyOf(refused)).toBe(expectedKey);
  });

  it("reads the member guard's uncoded 403 as a lapsed membership", () => {
    const lapsed = new ApiError(403, "Active membership required", {
      statusCode: 403,
      message: "Active membership required",
      error: "Forbidden",
    });
    expect(quizshowTemplateErrorKeyOf(lapsed)).toBe(
      "quizshow:templates.errors.membershipInactive",
    );
    expect(quizshowTemplatePublishErrorKeyOf(lapsed)).toBe(
      "quizshow:templates.errors.membershipInactive",
    );
  });

  it("reads an uncoded 400 as a field the server refused", () => {
    const refused = new ApiError(400, "quiz.title should not be empty", {
      statusCode: 400,
      message: ["quiz.title should not be empty"],
      error: "Bad Request",
    });
    expect(quizshowTemplateErrorKeyOf(refused)).toBe(
      "quizshow:templates.errors.invalidInput",
    );
    expect(quizshowTemplatePublishErrorKeyOf(refused)).toBe(
      "quizshow:templates.errors.invalidInput",
    );
  });

  it("reads an uncoded 401 as a session that ended", () => {
    const signedOut = new ApiError(401, "Not authenticated");
    expect(quizshowTemplateErrorKeyOf(signedOut)).toBe(
      "quizshow:templates.errors.signedOut",
    );
    expect(quizshowTemplatePublishErrorKeyOf(signedOut)).toBe(
      "quizshow:templates.errors.signedOut",
    );
  });

  it("reads a failed fetch as offline", () => {
    expect(quizshowTemplateErrorKeyOf(new TypeError("Failed to fetch"))).toBe(
      "quizshow:templates.errors.offline",
    );
    expect(
      quizshowTemplateErrorKeyOf(new ApiError(408, "Request timed out")),
    ).toBe("quizshow:templates.errors.offline");
  });

  it("reads a 500 as a server problem", () => {
    expect(
      quizshowTemplateErrorKeyOf(new ApiError(500, "Internal Server Error")),
    ).toBe("quizshow:templates.errors.server");
  });

  it("reads a publish refused for its quiz as problems to fix", () => {
    const invalid = new ApiError(422, "x", {
      code: "quizshow_quiz_invalid",
      problems: [],
    });
    expect(quizshowTemplatePublishErrorKeyOf(invalid)).toBe(
      "quizshow:templates.errors.quizInvalid",
    );
    const incomplete = new ApiError(422, "x", {
      code: "quizshow_quiz_incomplete",
      problems: [],
    });
    expect(quizshowTemplatePublishErrorKeyOf(incomplete)).toBe(
      "quizshow:templates.errors.quizInvalid",
    );
    const cardRefusal = new ApiError(422, "x", {
      code: "quizshow_template_card_incomplete",
      missing: ["title.en"],
    });
    expect(quizshowTemplatePublishErrorKeyOf(cardRefusal)).toBe(
      "quizshow:errors.template_card_incomplete",
    );
    expect(quizshowTemplatePublishErrorKeyOf(new ApiError(403, "x"))).toBe(
      "quizshow:templates.errors.noStaffRole",
    );
  });
});
