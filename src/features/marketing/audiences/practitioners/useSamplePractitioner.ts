import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { PublicSubprofileView } from "../../../subprofiles/api/subprofiles.adapters";
import type { SubprofilePublicDTO } from "../../../subprofiles/api/subprofiles.api";
import { toSamplePersonaView } from "../shared/persona/samplePersonaView";
import type { PractitionerTryKind } from "./practitionersLanding.data";
import { buildSamplePractitioner } from "./practitionersSample.data";

/** The day the page was opened, fixed for the life of the component. */
export function useSampleToday(): Date {
  return useMemo(() => new Date(), []);
}

/** The sample persona for `kind`, in the reader's language. */
export function useSamplePractitioner(
  kind: PractitionerTryKind,
): SubprofilePublicDTO {
  const { t } = useTranslation();
  const today = useSampleToday();
  return useMemo(
    () => buildSamplePractitioner(t, kind, today),
    [t, kind, today],
  );
}

/**
 * The view a page fragment renders from: the sample's view without its cover
 * image, so a fragment drawn inside its own `.pp` article never mounts a
 * banner of its own.
 */
export function useSampleFragmentView(
  kind: PractitionerTryKind,
): PublicSubprofileView {
  const dto = useSamplePractitioner(kind);
  return useMemo(
    () => ({ ...toSamplePersonaView(dto), coverUrl: null }),
    [dto],
  );
}
