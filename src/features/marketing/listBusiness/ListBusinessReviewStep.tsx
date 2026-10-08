import { FiShield } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { toPlainText } from "../../../shared/markdown";
import type { TFunction } from "../../../shared/i18n/types";
import {
  catLabel,
  goodForLabel,
  langLabel,
  PRICES,
  slugify,
  type ListingDraft,
} from "./listBusiness.data";
import { isAdultCategoryPicked } from "../localCategories";
import { listingTagLabel } from "./listingTags.data";
import { canAcceptAdultTerms } from "./listingOnline.data";
import { normalizeOwnedBy, OWNED_BY_TAG_KEYS } from "./listingOwnedBy.data";
import type { ListingForm } from "./useListingForm";
import { listingKindOf } from "./listingMobile.data";
import { WHERE_FOUND_TITLE_KEYS, whereFoundChoiceOf } from "./listingKind";
import {
  Group,
  ReviewPracticalGroup,
  Row,
  WhereYouWorkRow,
} from "./ListBusinessReviewPractical";
import { PaneHeader } from "./ListBusinessChrome";
import { ConsentChecks } from "./fields/ConsentChecks";
import { AffirmingBaselineAgreement } from "./fields/AffirmingBaselineAgreement";
import { isOwnerBlockHidden } from "./ownerBlock";
import styles from "./ListBusinessPage.module.css";

function optionLabel(
  t: TFunction,
  list: { id: string; labelKey: string }[],
  id: string,
): string {
  const found = list.find((x) => x.id === id);
  return found ? t(found.labelKey) : id;
}

/** The description as plain text, keeping the line breaks the owner typed
 *  and a blank line between paragraphs, so the recap reads like the live
 *  preview. `toPlainText` collapses every newline, so it runs per line; it
 *  also keeps single `*` marks, so italics are unwrapped here. */
function descriptionSummary(draft: ListingDraft): string {
  return draft.whatItIs
    .map((paragraph) => paragraph.text)
    .filter((text) => text.trim())
    .join("\n\n")
    .split("\n")
    .map((line) => toPlainText(line).replace(/\*(\S[^*]*?)\*/g, "$1"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The owner's own "who owns and runs it" tags, joined; empty when none. */
function ownedBySummary(t: TFunction, draft: ListingDraft): string {
  return normalizeOwnedBy(draft.ownedBy)
    .map((value) => t(OWNED_BY_TAG_KEYS[value]))
    .join(", ");
}

/** Stands in for the withheld consent block on a member's own suggestion:
 *  a person reviews it, and the platform holds it until the business claims
 *  it. Styled like the submit note the consent block ends with. */
function SuggestNote() {
  return (
    <div className={styles.submitNote}>
      <span className={styles.ic}>
        <FiShield size={15} />
      </span>
      <p>
        <Translation
          i18nKey="marketing:listBusiness.step5.suggestNote"
          components={{ b: <b /> }}
        />
      </p>
    </div>
  );
}

/** The address a new listing will get, derived from the name typed so far. */
function SlugBox({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.slugBox}>
      <div className={styles.sbK}>
        {t("marketing:listBusiness.step5.slugLabel")}
      </div>
      <div className={styles.sbUrl}>
        {t("marketing:listBusiness.step5.slugDomain")}
        <b>{slugify(name)}</b>
      </div>
    </div>
  );
}

/** Recaps the step 0 path choice and where people find the business; its
 *  edit link jumps back to that step. */
function PathPlaceGroup({
  draft,
  onEdit,
}: {
  draft: ListingDraft;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { path } = draft;
  const whereFound = whereFoundChoiceOf(draft);
  return (
    <Group
      title={t("marketing:listBusiness.step5.group.pathPlace")}
      onEdit={onEdit}
    >
      <Row k={t("marketing:listBusiness.step5.row.listingAs")}>
        {path === "claim"
          ? t("marketing:listBusiness.step5.listingAs.claim")
          : path === "suggest"
            ? t("marketing:listBusiness.step5.listingAs.suggest")
            : ""}
      </Row>
      <Row k={t("marketing:listBusiness.step5.row.whereFound")}>
        {whereFound === "" ? "" : t(WHERE_FOUND_TITLE_KEYS[whereFound])}
      </Row>
    </Group>
  );
}

export function StepReview({
  form,
  userName,
  userInitials,
  onEdit,
  isEdit = false,
}: {
  form: ListingForm;
  userName: string;
  userInitials: string;
  onEdit: (step: number) => void;
  /** Reviewing changes to an existing listing (admin console). The header
   *  switches to edit copy, and the slug box and the path group are left
   *  out: the listing already has its address, which `slugify(draft.name)`
   *  may no longer match, and an edit has no path step to go back to. */
  isEdit?: boolean;
}) {
  const { t } = useTranslation();
  const { draft } = form;
  /* A staff-authored draft has no owner yet, and a suggestion's submitter is
     not the business, so neither has a name, initials or visibility choice
     belonging to anybody. Every recap block below that describes the
     submitter is withheld, the same way step 4's owner block is. Whoever
     accepts the handover answers all of it then. */
  const isOwnerAuthored = !isOwnerBlockHidden(draft);
  // A member suggestion gets a short note in place of the consent block
  // above: nothing of theirs to consent about, but not silence either.
  const isMemberSuggestion = draft.path === "suggest" && !draft.isStaffAuthored;
  return (
    <div className={styles.stepBody}>
      {isEdit ? (
        <PaneHeader
          title={t("marketing:listBusiness.step5.edit.title")}
          em={t("marketing:listBusiness.step5.edit.em")}
          sub={t("marketing:listBusiness.step5.edit.sub")}
        />
      ) : (
        <PaneHeader
          title={t("marketing:listBusiness.step5.title")}
          em={t("marketing:listBusiness.step5.em")}
          sub={t("marketing:listBusiness.step5.sub")}
        />
      )}

      {!isEdit && <SlugBox name={draft.name} />}

      {!isEdit && <PathPlaceGroup draft={draft} onEdit={() => onEdit(0)} />}

      <Group
        title={t("marketing:listBusiness.step5.group.basics")}
        onEdit={() => onEdit(1)}
      >
        <Row k={t("marketing:listBusiness.step5.row.name")}>{draft.name}</Row>
        <Row k={t("marketing:listBusiness.step5.row.category")}>
          {draft.cats.map((c) => catLabel(t, c)).join(", ")}
        </Row>
        {/* An online-only listing has no neighbourhood: the field is hidden
            and the payload sends it blank. It gives the city it works from. */}
        {draft.online ? (
          <Row k={t("marketing:listBusiness.step5.row.basedIn")}>
            {draft.city?.trim() ?? ""}
          </Row>
        ) : (
          listingKindOf(draft) !== "mobile" && (
            <Row k={t("marketing:listBusiness.step5.row.neighbourhood")}>
              {draft.hood}
            </Row>
          )
        )}
        {listingKindOf(draft) === "mobile" && <WhereYouWorkRow draft={draft} />}
        {/* Staff and a member suggesting a business are never asked for the
            18+ rules, so their drafts skip the row the same way the
            missing-fields bar skips them. */}
        {isAdultCategoryPicked(draft.cats) && canAcceptAdultTerms(draft) && (
          <Row k={t("marketing:listBusiness.step5.row.adultTerms")}>
            {draft.adultTermsAccepted === true
              ? t("marketing:listBusiness.step5.adultTermsAccepted")
              : ""}
          </Row>
        )}
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
        <Row k={t("marketing:listBusiness.step5.row.whatItIs")} isMultiline>
          {descriptionSummary(draft)}
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

      <ReviewPracticalGroup draft={draft} onEdit={() => onEdit(3)} />

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
          <Row k={t("marketing:listBusiness.step5.row.ownedBy")}>
            {ownedBySummary(t, draft)}
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
      {isMemberSuggestion && <SuggestNote />}
    </div>
  );
}
