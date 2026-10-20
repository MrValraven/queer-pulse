import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { publicSubprofileToView } from "../../../subprofiles/api/subprofiles.adapters";
import type { SubprofilePublicDTO } from "../../../subprofiles/api/subprofiles.api";
import type { PersonaViewMode } from "../../../subprofiles/personaSkinRender";
import { SubprofilePageBody } from "../../../subprofiles/SubprofilePageBody";
import { skinFor } from "../../../subprofiles/subprofile-skins";
import {
  DEFAULT_ACCENT,
  skinVars,
} from "../../../subprofiles/subprofilePresence.data";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";
import styles from "./CreatorDraftPreviews.module.css";

/** No-op: the tree renders in `mode="preview"` and the frame swallows every
 *  press, so these handlers only meet `SubprofilePageBody`'s prop contract. */
function noop() {}

const PREVIEW_MODE: PersonaViewMode = "preview";

/**
 * A draft persona as the public page would show it: the same
 * `SubprofilePageBody` tree, skinned for the persona's kind and accent,
 * inside a bounded card. The cover rise and the nav band stay off, since
 * both only make sense under the site's floating nav.
 */
export function PersonaDraftPreview({
  preview,
}: {
  preview: SubprofilePublicDTO;
}) {
  const { t } = useTranslation();
  const view = useMemo(() => publicSubprofileToView(preview), [preview]);
  const skin = skinFor(view.kind);
  const skinStyle = skinVars(view.accent ?? DEFAULT_ACCENT);

  return (
    <CreatorDraftPreviewFrame label={t("admin:creatorDrafts.preview.label")}>
      <div className={styles.personaFrame}>
        <SubprofilePageBody
          data={view}
          skin={skin}
          mode={PREVIEW_MODE}
          skinVars={skinStyle}
          onAction={noop}
          onOpenWorkAt={noop}
          onOpenWorkItem={noop}
          onOpenGalleryPhoto={noop}
          onOpenPoem={noop}
        />
      </div>
    </CreatorDraftPreviewFrame>
  );
}
