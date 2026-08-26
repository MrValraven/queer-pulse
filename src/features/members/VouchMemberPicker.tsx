import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiSearch } from "react-icons/fi";
import {
  Avatar,
  Button,
  EmptyState,
  SearchInput,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useVouch } from "../../app/providers/useVouch";
import { useMembers } from "./api/useMembers";
import { VouchMemberModal } from "./VouchMemberModal";
import { resolveVouchCandidates } from "./vouchCandidates";
import styles from "./VouchPage.module.css";

/**
 * The member picker behind `/vouch`: search the directory, pick someone, vouch
 * for them through the real `POST /members/:slug/vouch` endpoint.
 *
 * The submit itself is `VouchMemberModal`, unchanged and shared with the
 * profile page, so there is exactly one vouch form in the product and one
 * definition of what a vouch requires (at least one "how you know them").
 * This page only answers the question the profile page cannot: "I want to
 * vouch for someone, who?".
 *
 * Demo and live share the search through `useMembers`, which branches on
 * `demoMode` itself. Demo mode's branch ignores the server query, so the
 * name filter is applied here for both; live mode simply filters an already
 * filtered list.
 */
export function VouchMemberPicker() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { hasVouched } = useVouch();
  const [query, setQuery] = useState("");
  const [pickedSlug, setPickedSlug] = useState<string | null>(null);

  const { items, isLoading, isError, refetch } = useMembers({ query });
  const viewerSlug = demoMode ? undefined : user?.profile.slug;
  const candidates = useMemo(
    () => resolveVouchCandidates(items, query, viewerSlug, demoMode),
    [items, query, viewerSlug, demoMode],
  );

  if (isError) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("members:vouch.picker.error.title")}
        description={t("members:vouch.picker.error.description")}
        action={{
          label: t("members:vouch.picker.error.retry"),
          onClick: () => refetch(),
        }}
      />
    );
  }

  return (
    <>
      <SearchInput
        value={query}
        onChange={setQuery}
        className={styles.search}
        placeholder={t("members:vouch.picker.searchPlaceholder")}
        ariaLabel={t("members:vouch.picker.searchAria")}
      />
      {isLoading ? (
        <div className={styles.results}>
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : candidates.length === 0 ? (
        <p className={styles.noResults}>
          {t("members:vouch.picker.noResults", { query })}
        </p>
      ) : (
        <ul className={styles.results}>
          {candidates.map((candidate) => {
            const alreadyVouched = hasVouched(candidate.slug);
            return (
              <li key={candidate.slug} className={styles.result}>
                <Avatar
                  initials={candidate.initials}
                  tint={candidate.tint}
                  size={48}
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                />
                <div className={styles.resultBody}>
                  <Link
                    to={`/members/${candidate.slug}`}
                    className={styles.resultName}
                  >
                    {candidate.name}
                  </Link>
                  {candidate.meta ? (
                    <span className={styles.resultMeta}>{candidate.meta}</span>
                  ) : null}
                </div>
                {alreadyVouched ? (
                  <span className={styles.resultDone}>
                    <FiCheck aria-hidden />
                    {t("members:vouch.picker.alreadyVouched")}
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setPickedSlug(candidate.slug)}
                  >
                    {t("members:vouch.picker.vouchCta", {
                      name: candidate.firstName,
                    })}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pickedSlug ? (
        <VouchMemberModal
          slug={pickedSlug}
          onClose={() => setPickedSlug(null)}
          // The modal's own success panel is the confirmation; closing it
          // returns to the picker so a member can vouch for the next person
          // without navigating. `useVouch` already knows about the new vouch,
          // so that row switches to "Vouched" on the way back.
          onVouched={() => undefined}
        />
      ) : null}
    </>
  );
}
