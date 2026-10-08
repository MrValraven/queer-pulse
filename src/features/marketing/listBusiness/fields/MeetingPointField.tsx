import { FiEye } from "react-icons/fi";
import { CheckLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListBusinessLocationField } from "../ListBusinessLocationField";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { NeighbourhoodField } from "./NeighbourhoodField";
import styles from "../ListBusinessPage.module.css";
import practicalStyles from "./MobilePractical.module.css";

const KEY = "marketing:listBusiness.step3.meetingPoint";

/**
 * "People meet us at a set spot", optional. Ticking it opens the usual
 * neighbourhood, address and pin fields under a note that the spot is
 * public. Unticked, the listing has no location anywhere: the draft keeps
 * what was typed, and nothing of it is sent, previewed or shown.
 *
 * The anchor wraps the whole block, so the missing-fields chips for the
 * neighbourhood land on it; the address keeps its own anchor inside.
 */
export function MeetingPointField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, setHasMeetingPoint } = form;
  const isOn = draft.hasMeetingPoint === true;
  return (
    <div id={ANCHOR.meetingPoint} className={styles.onlineToggleRow}>
      <CheckLine
        checked={isOn}
        onChange={setHasMeetingPoint}
        title={t(`${KEY}.title`)}
        sub={t(`${KEY}.sub`)}
      />
      {isOn && (
        <div className={practicalStyles.meetingPointBlock}>
          <div className={styles.onlineNote} role="note">
            <FiEye aria-hidden />
            <span>{t(`${KEY}.note`)}</span>
          </div>
          <NeighbourhoodField form={form} />
          <ListBusinessLocationField draft={draft} set={set} />
        </div>
      )}
    </div>
  );
}
