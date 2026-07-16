import { useMemo, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  buildBoiler,
  buildDownloads,
  buildFacts,
  buildImages,
  buildLogos,
  buildSwatches,
  buildTeam,
  COVERAGE,
} from "./pressKit.data";
import { PressKitDownloadModal } from "./PressKitDownloadModal";
import { assetFor, logoSvg, type PressAsset } from "./pressKitAssets.data";
import logoStyles from "./MarketingModal.module.css";
import styles from "./PressKitPage.module.css";

const FACTS_AS_OF = new Date(2026, 4, 14);

export function BoilerplateSection() {
  const { t } = useTranslation();
  const boiler = useMemo(() => buildBoiler(t), [t]);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.boiler.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§01</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.boiler.section.lead"
          components={{ b: <b /> }}
        />
      </p>
      {boiler.map((b) => (
        <div className={styles.boiler} key={b.id}>
          <div className={styles.boilerH}>
            {b.label}
            <span className={styles.wc}>{b.wc}</span>
          </div>
          <button
            type="button"
            className={[styles.boilerCopy, copied === b.id && styles.copied]
              .filter(Boolean)
              .join(" ")}
            onClick={() => copy(b.id, b.text)}
          >
            {copied === b.id
              ? t("marketing:pressKit.boiler.copiedCta")
              : t("marketing:pressKit.boiler.copyCta")}
          </button>
          <div className={styles.boilerText}>{b.text}</div>
        </div>
      ))}
    </section>
  );
}

const LOGO_VARIANTS: ("light" | "plum" | "coral")[] = [
  "light",
  "plum",
  "coral",
];
const LOGO_NAMES = ["primary-light", "inverse-plum", "coral-solidarity"];

export function MarkSection() {
  const { t } = useTranslation();
  const logos = useMemo(() => buildLogos(), []);
  const [open, setOpen] = useState<number | null>(null);
  const variant = open !== null ? LOGO_VARIANTS[open] : "light";
  const asset: PressAsset = {
    filename: `queerpulse-mark-${open !== null ? LOGO_NAMES[open] : "light"}.svg`,
    mime: "image/svg+xml",
    content: logoSvg(variant),
  };
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.mark.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§02</span>
      </div>
      <p>{t("marketing:pressKit.mark.section.lead")}</p>
      <div className={styles.logoGrid}>
        {logos.map((l, i) => (
          <div className={styles.logoCard} key={i}>
            <div className={`${styles.logoDisplay} ${styles[l.display]}`}>
              <span
                className={[
                  styles.logoMark,
                  ...l.mark.split(" ").map((m) => styles[m]),
                ].join(" ")}
              >
                <span className={styles.logoDot} />
                Queer<span className={styles.q}>Pulse</span>
              </span>
            </div>
            <div className={styles.logoMeta}>
              <span>{l.meta}</span>
              <a
                role="button"
                tabIndex={0}
                onClick={() => setOpen(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(i);
                  }
                }}
              >
                {t("marketing:pressKit.mark.downloadLinkLabel")}
              </a>
            </div>
          </div>
        ))}
      </div>
      {open !== null && (
        <PressKitDownloadModal
          eyebrow={t("marketing:pressKit.mark.modal.eyebrow")}
          title={
            <Translation
              i18nKey="marketing:pressKit.mark.modal.title"
              components={{ em: <em /> }}
            />
          }
          lead={
            <Translation
              i18nKey="marketing:pressKit.mark.modal.lead"
              components={{ b: <b /> }}
              values={{ variant: LOGO_VARIANTS[open] ?? "light" }}
            />
          }
          asset={asset}
          preview={
            <div
              className={`${logoStyles.logoStage} ${variant === "plum" ? styles.displayPlum : variant === "coral" ? styles.displayCoral : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: logoSvg(variant) }} />
            </div>
          }
          buttonLabel={t("marketing:pressKit.mark.modal.buttonLabel")}
          onClose={() => setOpen(null)}
        />
      )}
      <p style={{ fontSize: 14, color: "var(--ink-60)", marginTop: 18 }}>
        <Translation
          i18nKey="marketing:pressKit.mark.usageNote"
          components={{ b: <b />, em: <em /> }}
        />
      </p>
    </section>
  );
}

export function ColourSection() {
  const { t } = useTranslation();
  const swatches = useMemo(() => buildSwatches(t), [t]);
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.colour.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§03</span>
      </div>
      <p>{t("marketing:pressKit.colour.section.lead")}</p>
      <div className={styles.swatchRow}>
        {swatches.map((s) => (
          <div className={styles.swatch} key={s.name}>
            <div
              className={styles.swatchChip}
              style={{
                background: s.bg,
                border: s.border ? "1px solid rgba(45,27,61,.10)" : undefined,
              }}
            />
            <div className={styles.swatchName}>{s.name}</div>
            <div className={styles.swatchHex}>{s.hex}</div>
            <div className={styles.swatchMeta}>{s.meta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PhotographySection() {
  const { t } = useTranslation();
  const images = useMemo(() => buildImages(t), [t]);
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.photography.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§04</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.photography.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.imgGrid}>
        {images.map((img, i) => (
          <div className={`${styles.imgCard} ${styles[img.tint]}`} key={i}>
            {img.label}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeamSection() {
  const { t } = useTranslation();
  const team = useMemo(() => buildTeam(t), [t]);
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.team.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§05</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.team.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.teamGrid}>
        {team.map((member) => (
          <div className={styles.teamCard} key={member.email}>
            <div
              className={[styles.ph, member.phCls && styles[member.phCls]]
                .filter(Boolean)
                .join(" ")}
            >
              {member.ph}
            </div>
            <h4>{member.name}</h4>
            <div className={styles.teamRole}>{member.role}</div>
            <p>{member.desc}</p>
            <div className={styles.teamLangs}>{member.langs}</div>
            <div className={styles.teamContact}>
              <a href={`mailto:${member.email}`}>{member.email}</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FactsSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const facts = useMemo(() => buildFacts(t), [t]);
  const asOf = fmt.date(FACTS_AS_OF, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.facts.section.title"
            components={{ em: <em /> }}
            values={{ date: asOf }}
          />
        </h2>
        <span className={styles.secNum}>§06</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.facts.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.factsGrid}>
        {facts.map((f, i) => (
          <div className={styles.fact} key={i}>
            <b>{f.b}</b>
            <span>{f.s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CoverageSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.coverage.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§07</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.coverage.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.covList}>
        {COVERAGE.map((c, i) => (
          <a
            href="#"
            className={styles.covRow}
            key={i}
            onClick={(e) => {
              e.preventDefault();
              showToast(
                t("marketing:pressKit.coverage.openingToast", {
                  source: c.source.split(" · ")[0] ?? c.source,
                }),
                "info",
              );
            }}
          >
            <div>
              <div className={styles.covSource}>{c.source}</div>
              <div className={styles.covTitle}>{c.title}</div>
              <div className={styles.covMeta}>{c.meta}</div>
            </div>
            <div className={styles.covDate}>
              {c.day}
              <em>{c.month}</em>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function DownloadsSection() {
  const { t } = useTranslation();
  const downloads = useMemo(() => buildDownloads(t), [t]);
  const [open, setOpen] = useState<number | null>(null);
  const d = open !== null ? downloads[open] : null;
  const asset = d ? assetFor(t, d.ic, d.title, d.desc) : null;
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.downloads.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§08</span>
      </div>
      <p>{t("marketing:pressKit.downloads.section.lead")}</p>
      <div className={styles.downloadRow}>
        {downloads.map((dl, i) => (
          <button
            type="button"
            className={styles.dlCard}
            key={i}
            onClick={() => setOpen(i)}
          >
            <div
              className={[styles.dlIc, dl.icCls && styles[dl.icCls]]
                .filter(Boolean)
                .join(" ")}
            >
              {dl.ic}
            </div>
            <div className={styles.dlInfo}>
              <b>{dl.title}</b>
              <span>{dl.desc}</span>
            </div>
            <div className={styles.dlArrow}>↓</div>
          </button>
        ))}
      </div>
      {d && asset && (
        <PressKitDownloadModal
          eyebrow={t("marketing:pressKit.downloads.modal.eyebrow", {
            format: d.ic,
          })}
          title={<>{d.title}.</>}
          lead={
            <Translation
              i18nKey="marketing:pressKit.downloads.modal.lead"
              components={{ b: <b /> }}
              values={{ desc: d.desc, filename: asset.filename }}
            />
          }
          rows={[{ ic: d.ic, title: asset.filename, desc: d.desc }]}
          asset={asset}
          buttonLabel={t("marketing:pressKit.downloads.modal.buttonLabel", {
            format: asset.filename.split(".").pop()?.toUpperCase() ?? "",
          })}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
