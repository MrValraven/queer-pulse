import { FiFileText, FiMoreHorizontal } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui/IconButton";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMenu } from "./kit/StudioMenu";
import { studioPressPath } from "./studioPaths";
import releaseStyles from "./StudioRelease.module.css";

/** The artist hero's overflow for a visitor: the persona's press kit.
 *  Escape, a press outside and tabbing out close it; Escape returns focus
 *  to the trigger. */
export function StudioArtistOverflow({
  subprofileId,
  name,
}: {
  subprofileId: string;
  name: string;
}) {
  const { t } = useTranslation();
  const label = t("studio:artistPage.v3.moreAria", { name });
  return (
    <div className={releaseStyles.overflow}>
      <StudioMenu
        trigger={
          <IconButton
            className={releaseStyles.overflowTrigger}
            aria-label={label}
          >
            <FiMoreHorizontal aria-hidden />
          </IconButton>
        }
        label={label}
        items={[
          {
            id: "pressKit",
            label: t("studio:artistPage.v3.pressKit"),
            icon: <FiFileText />,
            href: studioPressPath(subprofileId),
            onSelect: () => undefined,
          },
        ]}
      />
    </div>
  );
}
