import { useId, useMemo } from "react";
import {
  LoadErrorState,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import styles from "./GoTogetherCard.module.css";

/**
 * Pick the one connection to go with. Same source and list as "Tell someone
 * where I'm going" (`SharePlansModal`). The server checks that the friend is
 * also going; a refusal comes back as `GO_TOGETHER_PARTNER_UNAVAILABLE` and
 * the card says so.
 */
export function GoTogetherPartnerPicker({
  partnerSlug,
  onPartnerChange,
}: {
  partnerSlug: string | null;
  onPartnerChange: (partnerSlug: string | null) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { views, loading, isError, refetch } = useConnectionsList("all");

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      views.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
      })),
    [views],
  );
  const selected = useMemo(
    () => new Set(partnerSlug ? [partnerSlug] : []),
    [partnerSlug],
  );

  return (
    <section className={styles.step} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.stepTitle}>
        {t("goTogether:card.partner.title")}
      </h3>
      <p className={styles.stepHint}>{t("goTogether:card.partner.hint")}</p>
      {isError ? (
        <LoadErrorState compact onRetry={refetch} />
      ) : (
        <MemberSelectList
          people={people}
          selected={selected}
          multiSelect={false}
          selectedIndicator="radio"
          onToggle={(slug) =>
            onPartnerChange(slug === partnerSlug ? null : slug)
          }
          searchPlaceholder={t("goTogether:card.partner.search")}
          searchAriaLabel={t("goTogether:card.partner.search")}
          emptyHint={
            loading
              ? t("goTogether:card.partner.loading")
              : t("goTogether:card.partner.empty")
          }
        />
      )}
    </section>
  );
}
