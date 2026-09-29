import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useTherapistPersonas } from "../../../resources/api/useTherapistPersonas";
import type {
  TherapistCardCapacity,
  TherapistCardVM,
} from "../../../resources/therapistPersonaCard";
import { personaPublicPathOrNull } from "../../personaLinks.data";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaViewMode } from "../../personaSkinRender";
import {
  rankSimilarTherapists,
  therapistTopicSet,
} from "./rankSimilarTherapists";
import styles from "./TherapistSidebar.module.css";

const MAX_ROWS = 3;

const STATUS_KEY: Record<TherapistCardCapacity, string> = {
  open: "subprofiles:therapist.side.similar.open",
  wait: "subprofiles:therapist.side.similar.wait",
  closed: "subprofiles:therapist.side.similar.full",
};

/** Is this card the persona on screen? By id when the card has one (demo),
 *  by owner + per-owner slug for a linked persona, by public address, and by
 *  global handle. Any match excludes it. */
function isSamePersona(
  card: TherapistCardVM,
  data: PublicSubprofileView,
): boolean {
  if (card.id !== null && card.id === data.id) return true;
  if (
    card.ownerSlug &&
    data.ownerSlug &&
    card.ownerSlug === data.ownerSlug &&
    card.slug === data.slug
  ) {
    return true;
  }
  const ownPath = personaPublicPathOrNull(data);
  if (ownPath !== null && card.href === ownPath) return true;
  return data.handle !== null && card.handle === data.handle;
}

function SimilarRow({
  card,
  isInteractive,
}: {
  card: TherapistCardVM;
  isInteractive: boolean;
}) {
  const { t } = useTranslation();
  const line = card.creds?.trim() || card.specs.slice(0, 2).join(" · ");
  const content = (
    <>
      <Avatar
        initials={card.initials}
        src={card.avatarUrl ?? undefined}
        size={38}
      />
      <span className={styles.similarText}>
        <span className={styles.similarName}>{card.name}</span>
        {line && <span className={styles.similarLine}>{line}</span>}
      </span>
      {card.availability && (
        <span
          className={`${styles.similarStatus} ${
            card.availability === "open" ? styles.statusOpen : styles.statusFull
          }`}
        >
          {t(STATUS_KEY[card.availability])}
        </span>
      )}
    </>
  );

  return (
    <li>
      {isInteractive ? (
        <Link to={card.href} className={styles.similarRow}>
          {content}
        </Link>
      ) : (
        <div className={styles.similarRow}>{content}</div>
      )}
    </li>
  );
}

/** A stable key for the persona on screen: its public address, the same
 *  scheme the cards' `href` uses. A persona with no address yet (an owner's
 *  preview) falls back to its id. */
function pageKey(data: PublicSubprofileView): string {
  return personaPublicPathOrNull(data) ?? data.id;
}

/**
 * "Also worth a look": up to three other therapist personas listed on
 * QueerPulse. Shared topics rank first, then therapists taking new clients,
 * then a rotation seeded by this page (see `rankSimilarTherapists`). Renders
 * nothing while loading, on an error, or when this persona is the only one
 * listed.
 */
export function TherapistSimilar({
  data,
  mode,
}: {
  data: PublicSubprofileView;
  mode: PersonaViewMode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { cards, isLoading, isError } = useTherapistPersonas();

  const rows = useMemo(
    () =>
      rankSimilarTherapists({
        cards: cards.filter((card) => !isSamePersona(card, data)),
        topics: therapistTopicSet(data),
        currentSlug: pageKey(data),
        limit: MAX_ROWS,
      }),
    [cards, data],
  );

  if (isLoading || isError || rows.length === 0) return null;

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.label}>
        {t("subprofiles:therapist.side.similar.label")}
      </h2>
      <ul className={styles.similarList}>
        {rows.map((card) => (
          <SimilarRow
            key={card.href}
            card={card}
            isInteractive={mode !== "preview"}
          />
        ))}
      </ul>
      <p className={styles.quiet}>
        {t("subprofiles:therapist.side.similar.note")}
      </p>
    </section>
  );
}
