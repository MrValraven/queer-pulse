import { FiKey, FiLock, FiUnlock, FiUserCheck } from "react-icons/fi";
import {
  RadioCardGroup,
  type RadioCardOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AccessTier } from "../membership.types";
import { ACCESS_OPTIONS } from "./startCommunity.data";
import pageStyles from "./StartCommunityPage.module.css";
import styles from "./QuickStartCommunity.module.css";

const ACCESS_ICONS = {
  public: FiUnlock,
  request: FiUserCheck,
  invite: FiKey,
  private: FiLock,
} as const;

/** Who can find the community and how they get in, as one radio group. */
export function QuickStartAccessChoice({
  value,
  onChange,
}: {
  value: AccessTier | "";
  onChange: (tier: AccessTier) => void;
}) {
  const { t } = useTranslation();
  const options: RadioCardOption<AccessTier>[] = ACCESS_OPTIONS.map(
    (accessOption) => {
      const Icon = ACCESS_ICONS[accessOption.tier];
      return {
        id: accessOption.tier,
        render: (
          <>
            {/* The page sheet tints `.accPrivate .accIc` jade, so the private
                tier's icon sits inside that class at rest as well. */}
            <span
              className={[
                styles.accessIconWrap,
                accessOption.private && pageStyles.accPrivate,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={pageStyles.accIc}>
                <Icon size={21} aria-hidden />
              </span>
            </span>
            {/* The desktop chapter's structure: the name sits in its own
                `.accTop` row and the note is a block under it, so the note's
                hairline runs above the whole note. */}
            <span className={pageStyles.accBody}>
              <span className={pageStyles.accTop}>
                <span className={pageStyles.accName}>
                  {t(accessOption.nameKey)}
                </span>
              </span>
              <span
                className={[pageStyles.accNote, styles.accessNote].join(" ")}
              >
                {t(accessOption.noteKey)}
              </span>
            </span>
            <span className={pageStyles.accRadio} aria-hidden />
          </>
        ),
      };
    },
  );
  // The private tier keeps its jade look once picked, as on the desktop chapter.
  const isPrivatePicked = ACCESS_OPTIONS.some(
    (accessOption) => accessOption.private && accessOption.tier === value,
  );

  return (
    <div className={pageStyles.field}>
      <span id="quick-start-access-label" className={styles.groupLabel}>
        {t("communities:start.quick.accessLabel")}{" "}
        <span className={pageStyles.req}>*</span>
      </span>
      <RadioCardGroup<AccessTier>
        value={value}
        onChange={onChange}
        options={options}
        ariaLabel={t("communities:start.quick.accessLabel")}
        ariaLabelledBy="quick-start-access-label"
        className={pageStyles.accStack}
        optionClassName={pageStyles.accCard}
        checkedClassName={[
          pageStyles.accCardSelected,
          isPrivatePicked && pageStyles.accPrivate,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}
