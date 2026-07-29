import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  usePublicSubprofile,
  type PublicSubprofileArgs,
} from "./api/usePublicSubprofile";
import { SubprofileHero } from "./SubprofileHero";
import { SubprofileSections } from "./SubprofileSections";
import { SubprofileSpotlight } from "./SubprofileSpotlight";
import { SubprofileAffiliations } from "./SubprofileAffiliations";
import { SubprofileNotFoundArt } from "./SubprofileNotFoundArt";
import { NOT_FOUND } from "./subprofilePage.data";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath } from "./personaLinks.data";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import styles from "./SubprofilePage.module.css";

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
        <PageMeta title={t("subprofiles:page.notFoundMetaTitle")} noIndex />
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
              onClick: () => void navigate(-1),
            }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageMeta
        title={`${data.displayName} · ${t(KIND_LABEL_KEYS[data.kind])} — QueerPulse`}
        description={(data.tagline || data.bio || "").slice(0, 160) || undefined}
        image={data.coverUrl ?? data.avatarUrl ?? undefined}
        canonical={personaPublicPath(data)}
        type="profile"
      />
      <SubprofileHero
        view={data}
        canMessage={data.linkVisibility === "linked" && Boolean(data.ownerSlug)}
      />

      {data.featured && (
        <SubprofileSpotlight
          item={data.featured}
          accent={data.accent ?? DEFAULT_ACCENT}
        />
      )}

      <div className={`wrap ${styles.body}`}>
        <SubprofileSections sections={data.sections} />
      </div>

      {data.affiliations.length > 0 && (
        <SubprofileAffiliations affiliations={data.affiliations} />
      )}
    </PageShell>
  );
}
