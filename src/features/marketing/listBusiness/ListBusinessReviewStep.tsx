import { type ReactNode } from "react";
import { FiShield } from "react-icons/fi";
import { CheckLine } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import {
  ANCHOR,
  catLabel,
  DAYS,
  goodForLabel,
  langLabel,
  PRICES,
  slugify,
  VERIFY,
  type ListingDraft,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
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
  const { draft, set } = form;
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
          queerpulse.app/directory/<b>{slugify(draft.name)}</b>
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
        {draft.path === "claim" && (
          <Row k={t("marketing:listBusiness.step5.row.verification")}>
            {optionLabel(t, VERIFY, draft.verify)}
          </Row>
        )}
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
          {draft.whatItIs
            .map((w) => w.text.trim())
            .filter(Boolean)
            .join(" · ")}
        </Row>
        <Row k={t("marketing:listBusiness.step5.row.tags")}>
          {draft.tags.join(", ")}
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

      {draft.linkToProfile && (
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

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step5.beforeSendHeading")}
      </h3>
      <div id={ANCHOR.consent} className={styles.consentChecks}>
        <div className={styles.flagOuting}>
          <CheckLine
            checked={draft.consentOuting}
            onChange={(v) => set({ consentOuting: v })}
            title={t("marketing:listBusiness.step5.consentOuting.title")}
            sub={t("marketing:listBusiness.step5.consentOuting.sub")}
          />
        </div>
        <CheckLine
          checked={draft.consentGuide}
          onChange={(v) => set({ consentGuide: v })}
          title={t("marketing:listBusiness.step5.consentGuide.title")}
          sub={t("marketing:listBusiness.step5.consentGuide.sub")}
        />
      </div>

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
    </div>
  );
}
