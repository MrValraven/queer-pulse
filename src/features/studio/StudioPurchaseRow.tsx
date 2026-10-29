import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  ImageSlot,
} from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import { StudioCopyValueRow } from "./StudioCopyValueRow";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioPurchaseDownloads } from "./StudioPurchaseDownloads";
import { StudioPurchaseStatus } from "./StudioPurchaseStatus";
import { StudioPurchaseWallControl } from "./StudioPurchaseWallControl";
import css from "./StudioPurchaseList.module.css";

const COVER_SIZE = 64;

/** A pending claim in Studio: the reference code to copy and "Cancel this
 *  purchase" behind a confirm. A failed cancel names its reason here. */
function StudioPurchasePendingActions({
  purchase,
  onCancelled,
}: {
  purchase: StudioBuyerPurchaseView;
  onCancelled: () => void;
}) {
  const { t } = useTranslation();
  const { cancel, isCancelling } = useStudioPurchaseMutations();
  const lineId = useId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // The line keeps its words while it folds away.
  const [failure, setFailure] = useState({ line: "", isShown: false });
  const artist = purchase.artist.name;
  const confirmCancel = async () => {
    setFailure((shown) => ({ ...shown, isShown: false }));
    try {
      await cancel(purchase.id);
      onCancelled();
    } catch (error) {
      const reason = t(studioErrorMessageKeyOf(error, "save"));
      setFailure({
        line: `${t("studio:purchase.cancel.failed")}. ${reason}`,
        isShown: true,
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };
  return (
    <div className={css.block}>
      <StudioCopyValueRow
        label={t("studio:purchase.reference.label")}
        value={purchase.referenceCode}
        copyLabel={t("studio:purchase.reference.copyCta")}
        copyAriaLabel={t("studio:purchase.reference.copyAria")}
        copiedToast={t("studio:purchase.reference.copied")}
        copyFailedToast={t("studio:purchase.reference.copyFailed")}
        describedBy={lineId}
      />
      <p id={lineId} className={css.note}>
        {t("studio:purchase.reference.line", { artist })}
      </p>
      <Button variant="quiet" size="sm" onClick={() => setIsConfirmOpen(true)}>
        {t("studio:purchase.panel.cancelCta")}
      </Button>
      <Collapse isOpen={failure.isShown}>
        <p role="alert" className={css.alert}>
          {failure.line}
        </p>
      </Collapse>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          if (!isCancelling) setIsConfirmOpen(false);
        }}
        onConfirm={() => void confirmCancel()}
        title={t("studio:purchase.cancel.title")}
        description={t("studio:purchase.cancel.body", { artist })}
        confirmLabel={t("studio:purchase.cancel.confirm")}
        cancelLabel={t("studio:purchase.cancel.keep")}
        tone="destructive"
        loading={isCancelling}
      />
    </div>
  );
}

/** "Download tracks": the disclosure over a confirmed purchase's downloads,
 *  in the library and on the account page alike. */
function StudioPurchaseDownloadsToggle({
  purchase,
  titleId,
  downloadsHeadingLevel,
  isStudioContext,
}: {
  purchase: StudioBuyerPurchaseView;
  titleId: string;
  downloadsHeadingLevel: 3 | 4;
  isStudioContext: boolean;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={css.downloadsBlock}>
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-describedby={titleId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiDownload aria-hidden />
        {isOpen
          ? t("studio:purchase.panel.hideDownloadsCta")
          : t("studio:purchase.panel.downloadCta")}
      </Button>
      <div id={panelId} className={css.downloadsRegion}>
        <Collapse isOpen={isOpen}>
          <div className={css.downloadsPanel}>
            <StudioPurchaseDownloads
              purchase={purchase}
              headingLevel={downloadsHeadingLevel}
              isStudioContext={isStudioContext}
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
}

/** One purchase: cover, title, format, artist, amount, day and status. The
 *  item and the artist link only in Studio and only while they exist; after
 *  an artist unlink the snapshot name shows as text and the kept downloads
 *  stay. Studio adds the pending code, the cancel and the wall switch. */
export function StudioPurchaseRow({
  purchase,
  isStudioContext,
  headingLevel = 3,
}: {
  purchase: StudioBuyerPurchaseView;
  isStudioContext: boolean;
  /** The item title's level; the downloads heading sits one below. */
  headingLevel?: 2 | 3;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isCancelNoticeShown, setIsCancelNoticeShown] = useState(false);
  const shouldFocusTitleRef = useRef(false);
  const { item, artist, status } = purchase;
  const isPending = status === "pending";
  // The pending block folds away once the cancel lands, so focus moves to
  // the row's title and stays inside the list.
  useEffect(() => {
    if (!shouldFocusTitleRef.current || isPending) return;
    shouldFocusTitleRef.current = false;
    titleRef.current?.focus();
  }, [isPending]);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const isWallShown =
    isStudioContext &&
    (isPending || status === "confirmed") &&
    artist.subprofileId !== null;
  return (
    <CollapseListItem>
      <div className={css.row}>
        <div className={css.head}>
          <span className={css.cover}>
            <ImageSlot
              src={item.coverUrl ?? undefined}
              width={COVER_SIZE}
              height={COVER_SIZE}
              radius={8}
              placeholder=""
            />
          </span>
          <div className={css.main}>
            <p className={css.format}>{t(item.formatLabelKey)}</p>
            <Heading
              id={titleId}
              ref={titleRef}
              tabIndex={-1}
              className={css.title}
            >
              {isStudioContext && item.href ? (
                <Link to={item.href} className={css.link}>
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </Heading>
            <p className={css.artist}>
              {isStudioContext && artist.href ? (
                <Translation
                  i18nKey="studio:purchase.row.byArtist"
                  slots={{
                    artist: (
                      <Link to={artist.href} className={css.link}>
                        {artist.name}
                      </Link>
                    ),
                  }}
                />
              ) : (
                t("studio:purchase.row.byArtist", { artist: artist.name })
              )}
            </p>
            <p className={css.meta}>
              <span className={css.amount}>
                <Translation
                  i18nKey="studio:purchase.row.amount"
                  slots={{
                    amount: (
                      <StudioEuroAmount value={purchase.amountCents / 100} />
                    ),
                  }}
                />
              </span>
              <span>
                {t("studio:purchase.row.date", {
                  date: fmt.date(purchase.createdAt, { dateStyle: "medium" }),
                })}
              </span>
            </p>
          </div>
        </div>
        <StudioPurchaseStatus purchase={purchase} />
        <Collapse isOpen={!item.isAvailable}>
          <p className={css.note}>{t("studio:purchase.row.itemGone")}</p>
        </Collapse>
        <Collapse isOpen={isStudioContext && isPending}>
          <StudioPurchasePendingActions
            purchase={purchase}
            onCancelled={() => {
              setIsCancelNoticeShown(true);
              shouldFocusTitleRef.current = true;
            }}
          />
        </Collapse>
        <Collapse isOpen={status === "confirmed"}>
          <StudioPurchaseDownloadsToggle
            purchase={purchase}
            titleId={titleId}
            downloadsHeadingLevel={headingLevel === 2 ? 3 : 4}
            isStudioContext={isStudioContext}
          />
        </Collapse>
        <Collapse isOpen={isWallShown}>
          <StudioPurchaseWallControl purchase={purchase} />
        </Collapse>
        {/* Only Studio rows can cancel, so the account page reserves no
            empty live region (and no row gap) here. */}
        {isStudioContext && (
          <div role="status">
            <Collapse isOpen={isCancelNoticeShown}>
              <p className={css.note}>{t("studio:purchase.cancel.done")}</p>
            </Collapse>
          </div>
        )}
      </div>
    </CollapseListItem>
  );
}
