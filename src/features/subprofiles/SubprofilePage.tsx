import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Avatar,
  EmptyState,
  Reveal,
  Spinner,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  usePublicSubprofile,
  type PublicSubprofileArgs,
} from "./api/usePublicSubprofile";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { SubprofileSections } from "./SubprofileSections";
import { SubprofileNotFoundArt } from "./SubprofileNotFoundArt";
import { NOT_FOUND } from "./subprofilePage.data";
import styles from "./SubprofilePage.module.css";

/** Up to two initials from a display name, for the avatar fallback. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Public persona page — serves both the standalone `/p/:handle` route and the
 * nested `/members/:slug/:subslug` linked-persona route. The owner tie is shown
 * ONLY for linked personas (spec §4): an unlinked, pseudonymous persona never
 * reveals who is behind it.
 */
export function SubprofilePage() {
  const { t } = useTranslation();
  const { handle, slug, subslug } = useParams();
  const navigate = useNavigate();

  const args: PublicSubprofileArgs = handle
    ? { handle }
    : { ownerSlug: slug ?? "", subslug: subslug ?? "" };
  const { data, isLoading } = usePublicSubprofile(args);

  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>{t("subprofiles:page.loading")}</span>
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className={styles.stateWrap}>
          <SubprofileNotFoundArt />
          <EmptyState
            className={styles.stateEmpty}
            title={t(NOT_FOUND.titleKey)}
            description={t(NOT_FOUND.descriptionKey)}
            action={{
              label: t(NOT_FOUND.actionLabelKey),
              to: NOT_FOUND.actionTo,
            }}
            secondaryAction={{
              label: <>← {t(NOT_FOUND.backLabelKey)}</>,
              onClick: () => navigate(-1),
            }}
          />
        </div>
      </PageShell>
    );
  }

  // Gating: linked personas may name their main profile; unlinked ones never do.
  const linkedToOwner =
    data.linkVisibility === "linked" &&
    Boolean(data.ownerName) &&
    Boolean(data.ownerSlug);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.heroInner}>
            <Avatar
              initials={initialsFrom(data.displayName)}
              src={data.avatarUrl ?? undefined}
              tint="plum"
              size={104}
              className={styles.avatar}
            />
            <div className={styles.heroText}>
              <span className={styles.kindBadge}>
                {t(KIND_LABEL_KEYS[data.kind])}
              </span>
              <h1 className={styles.name}>{data.displayName}</h1>
              {data.tagline && <p className={styles.tagline}>{data.tagline}</p>}
              {linkedToOwner && (
                <Link
                  className={styles.ownerTie}
                  to={`${routes.members}/${data.ownerSlug}`}
                >
                  <Translation
                    i18nKey="subprofiles:page.ownerTie"
                    components={{ em: <em /> }}
                    values={{ name: data.ownerName ?? "" }}
                  />
                  <FiArrowUpRight aria-hidden />
                </Link>
              )}
              {data.bio && <p className={styles.bio}>{data.bio}</p>}
            </div>
          </Reveal>
        </div>
      </header>

      <div className={`wrap ${styles.body}`}>
        <SubprofileSections sections={data.sections} />
      </div>
    </PageShell>
  );
}
