import { describe, expect, it } from "vitest";
import type { ListingDraft } from "../marketing/listBusiness/listBusiness.data";
import {
  MEMBER_ONLY_DRAFT_KEYS,
  teamDraftFromMemberDraft,
  teamListingFromDraftPath,
} from "./listingDraftHandover";
import { adminDraftToDto } from "./api/adminListingCreate.api";
import { adminDraftToUpdateDto } from "./api/adminListingEdit.api";

/** A member's draft as a server that forgot to strip it might send it: every
 *  answer about the member filled in. None of it may reach a team listing. */
const LEAKY_PAYLOAD: Partial<ListingDraft> = {
  path: "claim",
  name: "Tasca da Graça",
  cats: ["food"],
  hood: "Graça",
  blurb: "Petiscos and a long table.",
  badge: "owned",
  evidence: "I'm the owner and I'm trans.",
  rel: "own",
  ownerName: "Marta Fonseca",
  ownerRole: "Co-founder",
  ownerBio: "Cook, dyke, Graça born.",
  visibility: "anon",
  linkToProfile: true,
  ownedBy: ["women", "trans"],
  consentOuting: true,
  consentGuide: true,
  affirmingBaselineAccepted: true,
  managementRole: "owner",
};

describe("teamDraftFromMemberDraft", () => {
  it("keeps the business details the member wrote", () => {
    const draft = teamDraftFromMemberDraft(LEAKY_PAYLOAD);
    expect(draft.name).toBe("Tasca da Graça");
    expect(draft.cats).toEqual(["food"]);
    expect(draft.hood).toBe("Graça");
    expect(draft.blurb).toBe("Petiscos and a long table.");
  });

  it("opens as a staff-authored suggestion, never as the member's claim", () => {
    const draft = teamDraftFromMemberDraft(LEAKY_PAYLOAD);
    expect(draft.isStaffAuthored).toBe(true);
    expect(draft.path).toBe("suggest");
    expect(draft.managementRole).toBeUndefined();
  });

  it("reads a member draft from before the Path question as answered", () => {
    const legacy = teamDraftFromMemberDraft({ ...LEAKY_PAYLOAD, online: true });
    expect(legacy.isWhereFoundAnswered).toBe(true);
    expect(legacy.online).toBe(true);
    const unanswered = teamDraftFromMemberDraft({
      ...LEAKY_PAYLOAD,
      isWhereFoundAnswered: false,
    });
    expect(unanswered.isWhereFoundAnswered).toBe(false);
  });

  it("blanks every answer that belongs to the member", () => {
    const draft = teamDraftFromMemberDraft(LEAKY_PAYLOAD);
    expect(draft).toMatchObject({
      badge: "",
      evidence: "",
      rel: "",
      ownerName: "",
      ownerRole: "",
      ownerBio: "",
      ownedBy: [],
      consentOuting: false,
      consentGuide: false,
      affirmingBaselineAccepted: false,
    });
  });

  it("sends none of the member's answers in the admin create body", () => {
    const body = adminDraftToDto(teamDraftFromMemberDraft(LEAKY_PAYLOAD), {
      publishState: "review",
    }) as unknown as Record<string, unknown>;
    expect(body.badge ?? "").toBe("");
    expect(body.evidence ?? "").toBe("");
    for (const key of MEMBER_ONLY_DRAFT_KEYS) {
      if (key === "badge" || key === "evidence" || key === "path") continue;
      expect(body).not.toHaveProperty(key);
    }
    expect(JSON.stringify(body)).not.toMatch(/Marta|trans\.|dyke/);
  });

  it("drops the 18+ category from both kinds' categories", () => {
    const draft = teamDraftFromMemberDraft({
      ...LEAKY_PAYLOAD,
      online: true,
      cats: ["intimacy", "apparel"],
      inactiveModeCats: ["food", "intimacy"],
      adultTermsAccepted: true,
    });
    expect(draft.cats).toEqual(["apparel"]);
    expect(draft.inactiveModeCats).toEqual(["food"]);
    expect(draft.adultTermsAccepted).toBe(false);
  });

  it("opens a payload from an older wizard as a complete draft", () => {
    const draft = teamDraftFromMemberDraft({ name: "Barbearia Norte" });
    expect(draft.name).toBe("Barbearia Norte");
    expect(draft.whatItIs).toEqual([]);
    expect(draft.social).toEqual({
      instagram: "",
      website: "",
      email: "",
      phone: "",
    });
  });
});

describe("teamListingFromDraftPath", () => {
  it("points the add-a-listing form at the draft", () => {
    expect(teamListingFromDraftPath("listing-draft-0004")).toBe(
      "/admin/listings/new?fromDraft=listing-draft-0004",
    );
  });
});

describe("adminDraftToUpdateDto", () => {
  it("never carries the 18+ acknowledgement, even when the draft holds it", () => {
    const stampedDraft = {
      ...teamDraftFromMemberDraft(LEAKY_PAYLOAD),
      online: true,
      cats: ["intimacy"],
      adultTermsAccepted: true,
      managementRole: "co_manager" as const,
      // Off on purpose: the strip by name is what must keep the key out.
      isStaffAuthored: false,
    };
    const body = adminDraftToUpdateDto(stampedDraft) as unknown as Record<
      string,
      unknown
    >;
    expect(body).not.toHaveProperty("adultTermsAccepted");
    expect(body.cats).toEqual(["intimacy"]);
  });
});
