import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import { openToLabel, type OpenToId } from "../members/openTo.data";
import type { SuggestedPerson } from "./SuggestedPeople.api";
import styles from "./SuggestedPeople.module.css";

/**
 * The one line that says WHY this person is here.
 *
 * Every suggestion carries a fact the member can go and check: a room they
 * both joined, connections they share, a chip or a word they both wrote. There
 * is no "recommended for you" branch, because the server never sends a
 * suggestion without a reason.
 */
function SuggestionReason({ person }: { person: SuggestedPerson }) {
  const { t } = useTranslation();
  const { reason } = person;

  if (reason.kind === "mutuals") {
    return (
      <p className={styles.reason}>
        {t("connect:suggested.reasonMutuals", { count: reason.count })}
      </p>
    );
  }
  if (reason.kind === "community" && reason.label) {
    return (
      <p className={styles.reason}>
        {t("connect:suggested.reasonCommunity", { name: reason.label })}
      </p>
    );
  }
  if (reason.kind === "openTo") {
    const label = reason.presetId
      ? openToLabel({ kind: "preset", id: reason.presetId as OpenToId }, t)
      : (reason.label ?? "");
    return (
      <p className={styles.reason}>
        {t("connect:suggested.reasonOpenTo", { label })}
      </p>
    );
  }
  if (reason.kind === "profession" && reason.label) {
    return (
      <p className={styles.reason}>
        {t("connect:suggested.reasonProfession", { label: reason.label })}
      </p>
    );
  }
  if (reason.kind === "tag" && reason.label) {
    return (
      <p className={styles.reason}>
        {t("connect:suggested.reasonTag", { label: reason.label })}
      </p>
    );
  }
  return null;
}

/**
 * One suggested person: face, name, the reason, a way to say hello and a way
 * to say no thanks.
 *
 * The dismiss control is a real button with its own accessible name (the
 * a11y budget is zero, so an unlabelled icon control fails the build), and it
 * sits outside the `<Link>` rather than inside it: nesting a button in a
 * router link is banned here.
 */
export function SuggestedPeopleCard({
  person,
  onDismiss,
}: {
  person: SuggestedPerson;
  onDismiss: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(person.slug);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.dismiss}
        aria-label={t("connect:suggested.dismissAria", { name: person.name })}
        onClick={() => onDismiss(person.slug)}
      >
        <FiX aria-hidden />
      </button>
      <Link to={`/members/${person.slug}`} className={styles.identity}>
        <Avatar
          initials={person.initials}
          tint={person.tint}
          src={person.photo}
          size={56}
        />
        <span className={styles.name}>{person.name}</span>
        {person.tagline && (
          <span className={styles.tagline}>{person.tagline}</span>
        )}
      </Link>
      <SuggestionReason person={person} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => contact({ slug: person.slug, name: person.name })}
      >
        {connected
          ? t("connect:contact.message")
          : t("connect:suggested.sayHello")}
      </Button>
    </article>
  );
}
