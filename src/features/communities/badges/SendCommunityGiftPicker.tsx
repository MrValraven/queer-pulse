import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { RadioCardGroup } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { communityGiftNameKey } from "./communityBadgeCopy.data";
import { communityBadgeIcon } from "./communityBadgeIcons";
import {
  COMMUNITY_GIFTS,
  resolveCommunityFlairTint,
  type CommunityGiftKey,
} from "./communityBadges.catalog";
import styles from "./SendCommunityGiftDialog.module.css";

/** The eight gifts as a radio group of tiles: the icon on its tint ground and
 *  the gift name below. */
export function SendCommunityGiftPicker({
  value,
  onChange,
}: {
  value: CommunityGiftKey | null;
  onChange: (giftKey: CommunityGiftKey) => void;
}) {
  const { t } = useTranslation();
  const pickLabelId = useId();
  return (
    <>
      <p id={pickLabelId} className={styles.pickLabel}>
        {t("communities:badges.giftDialog.pick")}
      </p>
      <RadioCardGroup<CommunityGiftKey>
        value={value ?? ""}
        onChange={onChange}
        ariaLabel={t("communities:badges.giftDialog.pick")}
        ariaLabelledBy={pickLabelId}
        className={styles.tiles}
        optionClassName={styles.tile}
        checkedClassName={styles.tileChecked}
        options={COMMUNITY_GIFTS.map((gift) => {
          const GiftIcon = communityBadgeIcon(gift.iconKey);
          return {
            id: gift.key,
            render: (
              <>
                <span
                  className={styles.tileIcon}
                  data-tint={resolveCommunityFlairTint(gift.tint)}
                  aria-hidden
                >
                  <GiftIcon />
                </span>
                <span className={styles.tileName}>
                  {t(communityGiftNameKey(gift.key))}
                </span>
              </>
            ),
          };
        })}
      />
      <Collapse isOpen={value === null}>
        <p className={styles.pickHint}>
          {t("communities:badges.giftDialog.pickHint")}
        </p>
      </Collapse>
    </>
  );
}

/** The weekly cap, right under the lead where the phone's fold still shows
 *  it. It folds in once the allowance is used up and out again when it frees
 *  up. */
export function SendCommunityGiftCapNotice({
  isCapped,
  text,
}: {
  isCapped: boolean;
  text: string;
}) {
  return (
    <Collapse isOpen={isCapped}>
      <p className={styles.capNotice}>
        <FiAlertCircle size={18} aria-hidden />
        <span>{text}</span>
      </p>
    </Collapse>
  );
}
