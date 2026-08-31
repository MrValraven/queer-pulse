import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState, LoadErrorState } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunity } from "../communities/api/useCommunity";
import { useCardHolders } from "./api/useCardHolders";
import { useCardProgram } from "./api/useCardProgram";
import { CardPrintSheet } from "./CardPrintSheet";
import { holderCardFace } from "./holderCard.data";
import styles from "./CardPrintSheet.module.css";
import "./cards.print.css";

/** Who may print a community's cards. The backend refuses a non-staff caller
 *  on the holders query as well; this keeps the page from rendering a toolbar
 *  nobody can use. */
const PRINTING_ROLES: readonly string[] = ["owner", "mod"];

/**
 * The sheet a community prints its physical cards from.
 *
 * Its own route rather than a modal: an owner is about to look at forty cards
 * and then hand the page to a printer, and print isolation is cleaner when
 * the sheet owns the document.
 *
 * The selection arrives in router location state rather than in the URL,
 * because a roster of two hundred members would otherwise produce a query
 * string long enough to be truncated somewhere between here and the printer.
 * Opened cold (a bookmark, a reload) it falls back to every active holder,
 * which is the batch a community printing for an event actually wants, so a
 * lost state object degrades into something sensible rather than an error.
 */
export function CardPrintPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { community, myRole } = useCommunity(slug);
  const {
    program,
    isLoading: isProgramLoading,
    isError: hasProgramFailed,
    refetch: refetchProgram,
  } = useCardProgram(slug);
  const {
    holders,
    isLoading: areHoldersLoading,
    isError: haveHoldersFailed,
    refetch: refetchHolders,
  } = useCardHolders(slug);

  const selectedIds = (location.state as { selectedIds?: string[] } | null)
    ?.selectedIds;

  // Only active cards. A paused or revoked card on paper would be an object
  // that scans to a refusal, which is worse than not printing it at all.
  const printable = holders
    .filter((holder) => holder.status === "active")
    .filter((holder) => !selectedIds || selectedIds.includes(holder.id));

  if (isProgramLoading || areHoldersLoading) return null;

  // A failed lookup used to land in the "printing is unavailable" state below,
  // which reads as the community having switched printing off. Say what
  // actually happened and offer the request again.
  if (hasProgramFailed || haveHoldersFailed) {
    return (
      <AppShell>
        <PageMeta title={t("cards:print.metaTitle")} noIndex />
        <div className={styles.page}>
          <LoadErrorState
            onRetry={() => {
              if (hasProgramFailed) refetchProgram();
              if (haveHoldersFailed) refetchHolders();
            }}
            description={t("cards:print.loadErrorBody")}
          />
        </div>
      </AppShell>
    );
  }

  const isAllowed =
    program?.allowsPrint === true &&
    myRole !== null &&
    PRINTING_ROLES.includes(myRole);

  if (!isAllowed || printable.length === 0) {
    return (
      <AppShell>
        <PageMeta title={t("cards:print.metaTitle")} noIndex />
        <div className={styles.page}>
          <EmptyState
            icon={<FiPrinter />}
            title={t("cards:print.unavailableTitle")}
            description={
              isAllowed
                ? t("cards:print.emptyBody")
                : t("cards:print.disabledBody")
            }
            action={{
              label: t("cards:print.back"),
              onClick: () => void navigate(-1),
            }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageMeta title={t("cards:print.metaTitle")} noIndex />
      <div className={styles.page}>
        <header className={styles.toolbar}>
          <h1 className={styles.title}>
            {t("cards:print.title", { count: printable.length })}
          </h1>
          {/* Said before the sheets rather than after: four of the five skins
              are dark and grounds bleed to the edge, so a forty-card batch is
              a real amount of ink and a real amount of money. */}
          <p className={styles.inkNotice}>{t("cards:print.inkNotice")}</p>
          <p className={styles.foldHint}>{t("cards:print.foldHint")}</p>
          <div className={styles.toolbarActions}>
            <Button variant="ghost" onClick={() => void navigate(-1)}>
              {t("cards:print.back")}
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              <FiPrinter aria-hidden="true" /> {t("cards:print.print")}
            </Button>
          </div>
        </header>

        <CardPrintSheet
          cards={printable.map((holder) =>
            holderCardFace(holder, program, {
              name: community?.name ?? "",
              slug: slug ?? "",
            }),
          )}
        />
      </div>
    </AppShell>
  );
}
