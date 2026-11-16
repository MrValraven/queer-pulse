import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BACKEND_UNTITLED_DRAFT_NAME } from "./listBusiness/api/listingDrafts.api";
import { useListingDrafts } from "./listBusiness/api/useListingDrafts";
import { readDemoDraft } from "./listBusiness/useListingDraft";
import { DEMO_CONTINUE_ID } from "./listBusiness/useContinueDrafts";

export interface ListingDraftCta {
  to: string;
  label: string;
  isContinuing: boolean;
}

/** The directory header's listing call to action. With exactly one saved draft
 *  it reads "Continue <name>" and deep links into that draft; with several it
 *  reads "Continue your listing" and opens the landing list. Without a draft
 *  (none saved, still loading, failed, or signed out) it keeps the plain
 *  "List your business" link. Demo reads its single localStorage draft and
 *  never the network. */
export function useListingDraftCta(): ListingDraftCta {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const liveDrafts = useListingDrafts().data;
  // Read once per mount: parsing localStorage on every render is wasted work.
  const [demoDrafts] = useState(readDemoDrafts);

  const savedDrafts: { id: string; name: string }[] = demoMode
    ? demoDrafts
    : (liveDrafts ?? []);
  const [onlyDraft] = savedDrafts;

  if (onlyDraft === undefined) {
    return {
      to: routes.listBusiness,
      label: t("marketing:directory.hero.cta"),
      isContinuing: false,
    };
  }
  if (savedDrafts.length > 1) {
    return {
      to: routes.listBusiness,
      label: t("marketing:directory.hero.continueListing"),
      isContinuing: true,
    };
  }

  const draftName = onlyDraft.name.trim();
  const hasUsableName =
    draftName !== "" && draftName !== BACKEND_UNTITLED_DRAFT_NAME;
  return {
    to: `${routes.listBusiness}?continue=${encodeURIComponent(onlyDraft.id)}`,
    label: hasUsableName
      ? t("marketing:directory.hero.continueNamed", { name: draftName })
      : t("marketing:directory.hero.continueListing"),
    isContinuing: true,
  };
}

function readDemoDrafts(): { id: string; name: string }[] {
  const storedDraft = readDemoDraft();
  if (!storedDraft) return [];
  // A hand-edited snapshot may carry anything in `name`.
  const name: unknown = storedDraft.draft?.name;
  return [{ id: DEMO_CONTINUE_ID, name: typeof name === "string" ? name : "" }];
}
