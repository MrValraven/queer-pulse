import { PageMeta, JsonLd, buildPersonProfileSchema } from "../../shared/seo";
import { socialHref } from "../../shared/social/socialPlatforms";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS, personaNameBesideCraft } from "./subprofile-kinds";
import { personaPublicPathOrNull } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * Page `<head>` metadata for a public persona page: the `PageMeta` title/
 * description/OG/Twitter-card tags, plus the schema.org `Person` JSON-LD.
 * Extracted from `SubprofilePage` so that component stays under the repo's
 * 200-line limit.
 *
 * Never renders the JSON-LD for an owner's own unpublished draft preview,
 * which must not be discoverable at all.
 */
export function SubprofilePageHeadMeta({
  data,
  isOwnerDraftPreview,
}: {
  data: PublicSubprofileView;
  isOwnerDraftPreview: boolean;
}) {
  const { t } = useTranslation();

  const craftLabel = t(KIND_LABEL_KEYS[data.kind]);
  // Reaching this page means the URL resolved, so an address exists in every
  // real case. It stays nullable because the builder refuses to invent one,
  // and an absent canonical is dropped rather than pointed at a dead path.
  const canonicalPath = personaPublicPathOrNull(data);
  // A persona still named after its profession ("Poet") is titled "Owner Name
  // | Poet". The three sinks below each already carry the craft as its own
  // field, so they take the owner's name alone rather than the composed
  // title, which would otherwise say "Poet" twice ("Poet · Poet ·
  // QueerPulse").
  const seoName = personaNameBesideCraft({
    displayName: data.displayName,
    kind: data.kind,
    ownerName: data.ownerName,
  });
  const cardImage = data.coverUrl ?? data.avatarUrl ?? undefined;
  // A real wide cover reads well as a large-image card; falling back to the
  // small avatar/default, `summary` (square thumb) is the better fit.
  const twitterCard = data.coverUrl ? "summary_large_image" : "summary";
  const cardImageAlt = cardImage
    ? t("subprofiles:page.ogImageAlt", {
        name: seoName,
        craft: craftLabel,
      })
    : undefined;
  // Resolved external profile URLs for the Person's `sameAs`.
  const sameAs = data.socialLinks
    .map((link) => socialHref(link.platform, link.urlOrHandle))
    .filter((href): href is string => Boolean(href));

  return (
    <>
      <PageMeta
        title={`${seoName} · ${craftLabel} · QueerPulse`}
        description={
          (data.tagline || data.bio || "").slice(0, 160) || undefined
        }
        image={cardImage}
        imageAlt={cardImageAlt}
        twitterCard={twitterCard}
        canonical={canonicalPath ?? undefined}
        // An owner's own unpublished draft preview must never index — only a
        // published persona is meant to be publicly discoverable.
        noIndex={isOwnerDraftPreview || undefined}
        type="profile"
      />

      {/* Structured data for the public persona — never for an owner's own
          unpublished draft preview, which must not be discoverable at all. */}
      {!isOwnerDraftPreview && canonicalPath && (
        <JsonLd
          schema={buildPersonProfileSchema({
            // schema.org Person: the human's name in `name`, the craft in
            // `jobTitle` — the same split the "Owner Name | Poet" heading
            // makes.
            name: seoName,
            url: canonicalPath,
            jobTitle: craftLabel,
            image: cardImage ?? null,
            sameAs,
            description:
              (data.tagline || data.bio || "").slice(0, 300) || undefined,
          })}
        />
      )}
    </>
  );
}
