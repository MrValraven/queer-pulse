import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getLandlord as getLandlordFixture, type Landlord } from "../landlords";
import { getLandlord } from "./landlord.api";
import { landlordDetailToLandlord } from "./landlord.adapters";
import { economyKeys } from "./economyKeys";

/** One endorsed landlord. `language` is appended to the shared key because the
 * adapter resolves each recommendation's "Recommended {date}" line through
 * `t`/`fmt`; appending keeps the mutations' `["landlord", demoMode, slug]`
 * prefix invalidation matching.
 *
 * The signed-in member's profile slug is threaded into the adapter so each
 * recommendation knows whether the reader wrote it. That flag is what surfaces
 * the withdraw control (`DELETE /landlords/:slug/recommendations/mine`). It is
 * part of the query key too, since signing in or out changes the answer. Demo
 * mode reads the fixture, which flags the demo persona's own entry. */
export function useLandlord(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const mySlug = demoMode ? undefined : user?.profile.slug;
  return useQuery<Landlord | null>({
    queryKey: [...economyKeys.landlord(demoMode, slug), language, mySlug],
    initialData:
      demoMode && slug ? (getLandlordFixture(slug) ?? null) : undefined,
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) return getLandlordFixture(slug) ?? null;
      return landlordDetailToLandlord(await getLandlord(slug), t, fmt, mySlug);
    },
  });
}
