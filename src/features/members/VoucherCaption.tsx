import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { MutualVouchersChip } from "./MutualVouchersChip";
import { VoucherOthersButton } from "./VoucherOthersButton";
import type { VouchRelationship } from "./vouchMember.data";
import styles from "./ProfilePage.module.css";

/**
 * Labels for the read-only "texture" chips on this row, distinct from
 * `RELATIONSHIP_LABEL_KEY` in `vouchMember.data.ts`, which is first-person
 * form copy for the vouch-SUBMISSION modal ("We've collaborated"). Rendered
 * verbatim on someone else's profile, first-person has no clear antecedent;
 * these are short third-person noun phrases instead, matching the
 * `.hereForChip` convention ("Community events", "Mentoring juniors").
 */
const RELATIONSHIP_CHIP_LABEL_KEY: Record<VouchRelationship, string> = {
  collaborated: "members:vouch.relationshipChip.collaborated",
  friends: "members:vouch.relationshipChip.friends",
  group: "members:vouch.relationshipChip.group",
  met_through: "members:vouch.relationshipChip.met_through",
  neighbours: "members:vouch.relationshipChip.neighbours",
};

/**
 * The "Vouched for by …" sentence: up to a few names, then "N others" as a
 * button that toggles the roster. Which of the four wordings applies depends on
 * whether other vouchers follow the names and whether the viewer is one of them.
 */
function VouchedByLine({
  names,
  othersCount,
  isViewerAVoucher,
  isRosterOpen,
  rosterId,
  onToggleRoster,
}: {
  names: string[];
  othersCount: number;
  isViewerAVoucher: boolean;
  isRosterOpen: boolean;
  rosterId: string;
  onToggleRoster: () => void;
}) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);
  if (names.length === 0) {
    return (
      <Translation
        i18nKey="members:hero.vouch.countOnly"
        components={{ b: <b /> }}
        values={{ count: othersCount }}
      />
    );
  }
  if (othersCount === 0) {
    const namesList = new Intl.ListFormat(locale, {
      style: "long",
      type: "conjunction",
    }).format(names);
    return (
      <Translation
        i18nKey="members:hero.vouch.by"
        components={{ b: <b /> }}
        values={{
          names: isViewerAVoucher
            ? t("members:hero.vouch.namesPlusYou", { names: namesList })
            : namesList,
        }}
      />
    );
  }
  const namesList = new Intl.ListFormat(locale, {
    style: "long",
    type: "unit",
  }).format(names);
  return (
    <Translation
      i18nKey={
        isViewerAVoucher
          ? "members:hero.vouch.byAndOthersPlusYou"
          : "members:hero.vouch.byAndOthers"
      }
      components={{ b: <b /> }}
      values={{ names: namesList }}
      slots={{
        others: (
          <VoucherOthersButton
            count={othersCount}
            isOpen={isRosterOpen}
            rosterId={rosterId}
            onToggle={onToggleRoster}
          />
        ),
      }}
    />
  );
}

/**
 * The text beside the voucher faces: the "Vouched for by …" line, the owner's
 * hidden-roster note, and the "texture" and mutual chips.
 */
export function VoucherCaption({
  first,
  isSelf,
  isRosterHidden,
  names,
  othersCount,
  isViewerAVoucher,
  isViewerTheOnlyVoucher,
  isRosterOpen,
  rosterId,
  onToggleRoster,
  textureRelationships,
  mutualsCount,
  mutualVoucherCount,
}: {
  first: string;
  isSelf: boolean;
  isRosterHidden: boolean;
  /** Display names of the vouchers the line names, viewer excluded. */
  names: string[];
  /** Vouchers beyond `names`, viewer excluded. */
  othersCount: number;
  isViewerAVoucher: boolean;
  isViewerTheOnlyVoucher: boolean;
  isRosterOpen: boolean;
  rosterId: string;
  onToggleRoster: () => void;
  textureRelationships: VouchRelationship[];
  mutualsCount: number;
  mutualVoucherCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.vouchText}>
      {isViewerTheOnlyVoucher ? (
        <Translation
          i18nKey="members:hero.vouch.byYouOnly"
          components={{ b: <b /> }}
          values={{ first }}
        />
      ) : (
        <>
          <VouchedByLine
            names={names}
            othersCount={othersCount}
            isViewerAVoucher={isViewerAVoucher}
            isRosterOpen={isRosterOpen}
            rosterId={rosterId}
            onToggleRoster={onToggleRoster}
          />
          <br />
          {t(
            isSelf
              ? "members:hero.vouch.onlyNumberMattersSelf"
              : "members:hero.vouch.onlyNumberMatters",
          )}
        </>
      )}
      {/* The owner is looking at a roster their visitors cannot see. Say so
          here, so the privacy sheet holds no surprise. */}
      {isSelf && isRosterHidden && (
        <>
          <br />
          {t("members:hero.vouch.namesHiddenSelf")}
        </>
      )}
      {(textureRelationships.length > 0 ||
        mutualsCount > 0 ||
        mutualVoucherCount > 0) && (
        <div className={styles.hereFor}>
          {textureRelationships.map((relationship) => (
            <span key={relationship} className={styles.hereForChip}>
              {t(RELATIONSHIP_CHIP_LABEL_KEY[relationship])}
            </span>
          ))}
          {mutualsCount > 0 && (
            <span className={styles.hereForChip}>
              {t("members:card.mutualsCount", { count: mutualsCount })}
            </span>
          )}
          <MutualVouchersChip count={mutualVoucherCount} />
        </div>
      )}
    </div>
  );
}
