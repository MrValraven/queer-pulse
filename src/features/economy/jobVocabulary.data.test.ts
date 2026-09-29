import { describe, expect, it } from "vitest";
import { normalizeCommitment, normalizeSeniority } from "./jobVocabulary.data";
import { normalizePostJobDraft } from "./usePostJobForm";

describe("job vocabulary", () => {
  it("normalizes ids and legacy English labels", () => {
    expect(normalizeCommitment("freelanceGig")).toBe("freelanceGig");
    expect(normalizeCommitment("Freelance / gig")).toBe("freelanceGig");
    expect(normalizeCommitment("something else")).toBe("fullTime");
    expect(normalizeSeniority("Lead / Principal")).toBe("leadPrincipal");
    expect(normalizeSeniority("Lead")).toBe("leadPrincipal");
    expect(normalizeSeniority("Junior")).toBe("entry");
    expect(normalizeSeniority("")).toBe("anyLevel");
  });

  it("restores an old draft with an empty field and id values", () => {
    const restored = normalizePostJobDraft({
      category: "Design & creative",
      commitment: "Freelance / gig",
      seniority: "Any level",
      title: "Illustrator",
    });
    expect(restored.category).toBe("");
    expect(restored.profession).toBe("");
    expect(restored.commitment).toBe("freelanceGig");
    expect(restored.seniority).toBe("anyLevel");
    expect(restored.title).toBe("Illustrator");
  });

  it("drops a restored profession that is outside the restored field", () => {
    const restored = normalizePostJobDraft({
      category: "tech",
      profession: "nurse",
    });
    expect(restored.category).toBe("tech");
    expect(restored.profession).toBe("");
  });

  it("keeps a restored profession that belongs to the restored field", () => {
    const restored = normalizePostJobDraft({
      category: "healthcare",
      profession: "nurse",
    });
    expect(restored.category).toBe("healthcare");
    expect(restored.profession).toBe("nurse");
  });
});
