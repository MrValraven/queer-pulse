import { type ReactNode } from "react";
import { FiShield } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { toPlainText } from "../../../shared/markdown";
import type { TFunction } from "../../../shared/i18n/types";
import {
  catLabel,
  DAYS,
  goodForLabel,
  langLabel,
  PRICES,
  slugify,
  type ListingDraft,
} from "./listBusiness.data";
import { listingTagLabel } from "./listingTags.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { ConsentChecks } from "./fields/ConsentChecks";
import { AffirmingBaselineAgreement } from "./fields/AffirmingBaselineAgreement";
import styles from "./ListBusinessPage.module.css";

function optionLabel(
  t: TFunction,
  list: { id: string; labelKey: string }[],
  id: string,
): string {
  const found = list.find((x) => x.id === id);
  return found ? t(found.labelKey) : id;
}

function hoursSummary(draft: ListingDraft): string {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  if (!open.length) return "";
  // Day ids are the stable three-letter English keys; the summary is a
  // compact glance, so it reuses them rather than the long localized names.
  return open.map((d) => d.id).join(", ");
}

function onlineSummary(t: TFunction, draft: ListingDraft): string {
  const bits: string[] = [];
  if (draft.social.instagram)
    bits.push(t("marketing:listBusiness.step5.online.instagram"));
  if (draft.social.website)
    bits.push(t("marketing:listBusiness.step5.online.website"));
  if (draft.social.email)
    bits.push(t("marketing:listBusiness.step5.online.email"));
  if (draft.social.phone)
    bits.push(t("marketing:listBusiness.step5.online.phone"));
  return bits.join(" · ");
}

function Row({
  k,
  children,
  quote,
}: {
  k: string;
  children: ReactNode;
  quote?: boolean;
}) {
  const { t } = useTranslation();
  const empty = children === "" || children === null || children === undefined;
  return (
    <div className={styles.recapRow}>
      <span className={styles.rk}>{k}</span>
      <span
        className={[styles.rv, quote && styles.rvQuote]
          .filter(Boolean)
          .join(" ")}
      >
        {empty ? (
          <span className={styles.rvMiss}>
            {t("marketing:listBusiness.step5.notAdded")}
          </span>
        ) : (
          children
        )}
      </span>
    </div>
  );
}

function Group({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.recapGroup}>
      <div className={styles.recapHead}>
        <span>{title}</span>
        <button type="button" className={styles.recapEdit} onClick={onEdit}>
          {t("marketing:listBusiness.step5.editCta")}
        </button>
      </div>
      {children}
    </div>
  );
}

export function StepReview({
  form,
  userName,
  userInitials,
  onEdit,
}: {
  form: ListingForm;
  userName: string;
  userInitials: string;
  onEdit: (step: number) => void;
}) {
  const { t } = useTranslation();
  const { draft } = form;
  /* A staff-authored draft has no owner yet, so it has no name, no initials
     and no visibility choice belonging to anybody. Every recap block below
     that describes the submitter is withheld, the same way step 4's owner
     block is. Whoever accepts the handover answers all of it then. */
  const isOwnerAuthored = !draft.isStaffAuthored;
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step5.title")}
        em={t("marketing:listBusiness.step5.em")}
        sub={t("marketing:listBusiness.step5.sub")}
      />

      <div className={styles.slugBox}>
        <div className={styles.sbK}>
          {t("marketing:listBusiness.step5.slugLabel")}
        </div>
        <div className={styles.sbUrl}>
          {t("marketing:listBusiness.step5.slugDomain")}
          <b>{slugify(draft.name)}</b>
        </div>
      </div>

      <Group
        title={t("marketing:listBusiness.step5.group.pathPlace")}
        onEdit={() => onEdit(0)}
      >
        <Row k={t("marketing:listBusiness.step5.row.listingAs")}>
          {draft.path === "claim"
            ? t("marketing:listBusiness.step5.listingAs.claim")
            : draft.path === "suggest"
              ? t("marketing:listBusiness.step5.listingAs.suggest")
              : ""}
        </Row>
      </Group>

      <Group
        title={t("marketing:listBusiness.step5.group.basics")}
        onEdit={() => onEdit(1)}
      >
        <Row k={t("marketing:listBusiness.step5.row.name")}>{draft.name}</Row>
        <Row k={t("marketing:listBusiness.step5.row.category")}>
          {draft.cats.map((c) => catLabel(t, c)).join(", ")}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.neighbourhood")}>
          {draft.hood}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.ownership")}>
          {draft.badge === "owned"
            ? t("marketing:listBusiness.step1.owned.tag")
            : draft.badge === "friendly"
              ? t("marketing:listBusiness.step1.friendly.tag")
              : ""}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.price")}>
          {draft.price ? optionLabel(t, PRICES, draft.price) : ""}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.oneLiner")}>
          {draft.blurb}
        </Row>
      </Group>

      <Group
        title={t("marketing:listBusiness.step5.group.story")}
        onEdit={() => onEdit(2)}
      >
        <Row k={t("marketing:listBusiness.step5.row.tagline")} quote>
          {draft.tagline}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.whatItIs")}>
          {/* `toPlainText` keeps single `*` marks, so italics are unwrapped here. */}
          {toPlainText(
            draft.whatItIs.map((paragraph) => paragraph.text).join("\n\n"),
          ).replace(/\*(\S[^*]*?)\*/g, "$1")}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.tags")}>
          {draft.tags.map((tag) => listingTagLabel(t, tag)).join(", ")}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.goodFor")}>
          {draft.goodFor.map((g) => goodForLabel(t, g)).join(", ")}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.languages")}>
          {draft.langs.map((l) => langLabel(t, l)).join(", ")}
        </Row>
      </Group>

      <Group
        title={t("marketing:listBusiness.step5.group.practical")}
        onEdit={() => onEdit(3)}
      >
        <Row k={t("marketing:listBusiness.step5.row.address")}>
          {draft.online
            ? t("marketing:listBusiness.step5.onlineBusiness")
            : draft.address}
        </Row>
        {!draft.online && (
          <Row k={t("marketing:listBusiness.step5.row.hours")}>
            {hoursSummary(draft)}
          </Row>
        )}
        <Row k={t("marketing:listBusiness.step5.row.online")}>
          {onlineSummary(t, draft)}
        </Row>
      </Group>

      {/* Both rows in this group are the submitter's own: who they are, and
          how much of that the listing shows. With both withheld the group
          would be an empty titled box with an edit link, so the whole group
          goes. The step pills above still jump to step 4 for the photos. */}
      {isOwnerAuthored && (
        <Group
          title={t("marketing:listBusiness.step5.group.photosYou")}
          onEdit={() => onEdit(4)}
        >
          <Row k={t("marketing:listBusiness.step5.row.you")}>
            {draft.ownerName}
            {draft.ownerRole ? ` · ${draft.ownerRole}` : ""}
          </Row>
          <Row k={t("marketing:listBusiness.step5.row.nameShown")}>
            {draft.visibility === "public"
              ? t("marketing:listBusiness.step5.nameShown.public")
              : draft.visibility === "role"
                ? t("marketing:listBusiness.step5.nameShown.role")
                : t("marketing:listBusiness.step5.nameShown.anon")}
          </Row>
        </Group>
      )}

      {/* The vouch line survives a staff-authored draft on its own, because
          `blankDraft()` sets `linkToProfile: true` and `ListingSeed` carries
          no `linkToProfile`, so no seed Task 9 passes can turn it off. Left
          alone it prints an empty avatar and an empty name over copy that
          says a trusted member stands behind this. */}
      {isOwnerAuthored && draft.linkToProfile && (
        <div className={styles.vouchLine}>
          <span className={styles.vlAv}>{userInitials}</span>
          <p>
            <Translation
              i18nKey="marketing:listBusiness.step5.vouchLine"
              components={{ b: <b /> }}
              values={{ name: userName }}
            />
          </p>
        </div>
      )}

      {/* The whole "before you send" block is addressed to the submitter:
          two consents about their own identity, the commitment only they can
          make, and a note promising a human will review it and tell them when
          it goes live. An admin console publishes on its own terms and shows
          its own copy for that, so the block goes as one piece. The owner
          editor withholds the same consent pair from a co-manager. */}
      {isOwnerAuthored && (
        <>
          <h3 className={styles.groupH}>
            {t("marketing:listBusiness.step5.beforeSendHeading")}
          </h3>
          <ConsentChecks form={form} />
          {/* The condition of appearing in this directory at all, agreed to
              once at submission. Not a preference and not a per-listing
              badge: every listing here has made the same commitment, which is
              why it is asked for here and never offered as a setting
              afterwards. */}
          <AffirmingBaselineAgreement form={form} />

          <div className={styles.submitNote}>
            <span className={styles.ic}>
              <FiShield size={15} />
            </span>
            <p>
              <Translation
                i18nKey="marketing:listBusiness.step5.submitNote"
                components={{ b: <b /> }}
              />
            </p>
          </div>
        </>
      )}
    </div>
  );
}
