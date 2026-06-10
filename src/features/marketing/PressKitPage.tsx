import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./PressKitPage.module.css";
import { Button } from '../../shared/components/ui'

const BOILER = [
  { id: "short", label: "25 words · for headers, intros", wc: "25 words · 154 char", text: "QueerPulse is a queer professional network rooted in Lisbon — connecting LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support." },
  { id: "med", label: "60 words · for press releases, capsule bios", wc: "60 words · 408 char", text: "QueerPulse is a queer professional network rooted in Lisbon, founded in 2024. We connect LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support. Membership is by invitation, operationally protected, and free at the solidarity tier. The platform runs a magazine, a podcast, a safe-spaces network, and a micro-grants fund disbursed by the community itself." },
  { id: "long", label: '130 words · for longer features, "about" sections', wc: "130 words", text: "QueerPulse is a Lisbon-based queer professional network, founded in 2024 by eight community members in the back room of Café Beirão. It is operated by Associação QueerPulse, a not-for-profit registered in Portugal (NIPC 517 426 884), and supported by Sustainer memberships, one-off donations, and three programme grants. Membership is by vouched invitation. The platform supports a magazine, a podcast (The Back Room), a verified safe-spaces network across Lisbon, a micro-grants fund disbursed within 14 days by a rotating community circle, and an operational partnership with ILGA Portugal for legal aid and helpline handoffs. Annual transparency reports are independently audited and published publicly." },
];

const LOGOS = [
  { display: "displayCream", mark: "markDark", meta: <><b>Primary · light</b> · for cream/white backgrounds</> },
  { display: "displayPlum", mark: "markLight", meta: <><b>Inverse · plum</b> · for dark backgrounds</> },
  { display: "displayCoral", mark: "markLight markCoral", meta: <><b>Coral · solidarity</b> · use sparingly · pride contexts</> },
];

const SWATCHES = [
  { bg: "#2D1B3D", name: "Plum", hex: "#2D1B3D", meta: "Brand anchor · headings, dark surfaces" },
  { bg: "#E8775A", name: "Coral", hex: "#E8775A", meta: "Accent · CTAs, italic emphasis, the pulse dot" },
  { bg: "#F7F3EE", name: "Cream", hex: "#F7F3EE", meta: "Page background · never pure white", border: true },
  { bg: "#4A8C6F", name: "Jade", hex: "#4A8C6F", meta: "Verified · live · success" },
];

const IMAGES = [
  { tint: "tintA", label: "01 · Founding members at Café Beirão" },
  { tint: "tintB", label: "02 · Open clinic night, in progress" },
  { tint: "tintC", label: "03 · The print magazine, fanned" },
  { tint: "tintA", label: "04 · Trans Hub office · Mouraria" },
  { tint: "tintB", label: "05 · A gathering · Atelier Pulso" },
  { tint: "tintC", label: "06 · Map detail · safe spaces" },
];

const TEAM = [
  { ph: "MR", phCls: "", name: <>Marta <em>Reis</em></>, role: "Co-founder · Editor in chief", desc: <>For: editorial decisions, the magazine, governance, the manifesto. <em>Not for: individual member stories, moderation decisions.</em></>, langs: <><b>EN · PT · ES</b> · available on 48h notice</>, email: "marta@queerpulse.app" },
  { ph: "CV", phCls: "phJade", name: <>Catarina <em>Vaz</em></>, role: "Co-founder · Co-treasurer · Trans Hub", desc: "For: trans-affirming healthcare, finances, transparency, mutual aid, ILGA partnership.", langs: <><b>EN · PT</b> · available on 24h notice</>, email: "catarina@queerpulse.app" },
  { ph: "AB", phCls: "phPlum", name: <>André <em>Bento</em></>, role: "Co-founder · Co-treasurer · Design", desc: "For: platform design, technical decisions, partnerships, infrastructure. Photographer for in-house imagery.", langs: <><b>EN · PT</b> · available on 72h notice</>, email: "andre@queerpulse.app" },
];

const FACTS = [
  { b: <><em>2024</em></>, s: "Founded · Lisbon" },
  { b: <>1,847</>, s: "Active members at year-end 2025" },
  { b: <><em>96</em>%</>, s: "Of every euro goes to programs" },
  { b: <>€<em>278</em>k</>, s: "Total raised in 2025" },
  { b: <>284</>, s: "Gatherings held in 2025" },
  { b: <><em>147</em></>, s: "Micro-grants disbursed in 2025" },
  { b: <><em>42</em></>, s: "Verified safe spaces in Lisbon" },
  { b: <>9</>, s: "Magazine issues to date" },
  { b: <>22<em>%</em></>, s: "Trans / non-binary members" },
];

const COVERAGE = [
  { source: "Público · 4 Mar 2026", title: <>"Em Lisboa, uma rede profissional <em>queer e independente</em>."</>, meta: "Long-form feature · by Ana Sá Lopes · 6,400 words", day: "04", month: " Mar" },
  { source: "Vice Portugal · 18 Feb 2026", title: <>The platform that <em>refuses to scale.</em></>, meta: "Interview with Marta Reis · 22 min read", day: "18", month: " Feb" },
  { source: "FT Weekend · 24 Jan 2026", title: <>Inside Lisbon's quietest queer institution.</>, meta: "Long-form magazine piece · syndicated to FT.com", day: "24", month: " Jan" },
  { source: "Mensagem de Lisboa · 11 Nov 2025", title: <>A Câmara dos <em>Anjos.</em></>, meta: "Local-press feature on the neighbourhood", day: "11", month: " Nov" },
  { source: "Are.na Annual · Dec 2024", title: <>The 12 platforms we wished existed in 2024.</>, meta: "Editor's pick · positioned #4", day: "12", month: " Dec" },
];

const DOWNLOADS = [
  { ic: "ZIP", icCls: "dlZip", title: "Complete press kit", desc: "Marks, photography, boilerplate, fact sheet · 38 MB" },
  { ic: "SVG", icCls: "", title: "Marks · SVG bundle", desc: "3 variations · cleared for editorial use · 18 KB" },
  { ic: "PNG", icCls: "", title: "Marks · PNG @ 2x", desc: "For Word docs, slides, web · 8 MB" },
  { ic: "JPG", icCls: "", title: "Photography · 6 images", desc: "3000 × 2000 px · model-released · 24 MB" },
  { ic: "PDF", icCls: "", title: "Fact sheet", desc: "One-page printable · EN & PT versions · 380 KB" },
  { ic: "PDF", icCls: "", title: "2025 transparency report", desc: "84 pages · audited · 4.2 MB" },
];

export function PressKitPage() {
  const { showToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>For journalists, researchers &amp; partners</div>
          <h1 className={styles.h1}>
            Press <em>kit.</em>
          </h1>
          <p className={styles.dek}>
            Everything you need to write about, photograph, or fact-check QueerPulse.{" "}
            <b>Boilerplate, marks, photos, stats, and named spokespeople</b> — pre-cleared
            for reuse under the terms below. Updated 14 May 2026.
          </p>
          <div className={styles.actions}>
            <Button type="button" variant="primary" onClick={() => showToast("Downloading queerpulse-press-kit.zip (38 MB)", "success")}>
              Download full kit · ZIP
            </Button>
            <Button href="mailto:press@queerpulse.app" variant="ghost">
              Or ask a person
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.contactStrip}>
        <div className={styles.contactInner}>
          <span><b>Press desk:</b> <a href="mailto:press@queerpulse.app">press@queerpulse.app</a></span>
          <span className={styles.sep}>·</span>
          <span><b>Phone:</b> +351 21 314 08 22 (Mon–Fri 10:00–18:00 WET)</span>
          <span className={styles.sep}>·</span>
          <span><b>Response time:</b> &lt; 8 working hours</span>
          <span className={styles.sep}>·</span>
          <span><b>Languages:</b> EN · PT · ES</span>
        </div>
      </div>

      <div className={styles.page}>
        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Boilerplate · <em>cleared for reuse</em>
            </h2>
            <span className={styles.secNum}>§01</span>
          </div>
          <p>
            Three lengths, all approved for direct quotation without further sign-off.
            Click <b>copy</b> to put a clean version on your clipboard.
          </p>
          {BOILER.map((b) => (
            <div className={styles.boiler} key={b.id}>
              <div className={styles.boilerH}>
                {b.label}
                <span className={styles.wc}>{b.wc}</span>
              </div>
              <button
                type="button"
                className={[styles.boilerCopy, copied === b.id && styles.copied].filter(Boolean).join(" ")}
                onClick={() => copy(b.id, b.text)}
              >
                {copied === b.id ? "Copied" : "Copy"}
              </button>
              <div className={styles.boilerText}>{b.text}</div>
            </div>
          ))}
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              The <em>mark</em> and how to use it
            </h2>
            <span className={styles.secNum}>§02</span>
          </div>
          <p>
            Three approved variations. The wordmark always carries the coral pulse dot —
            except in the inverse "coral" variant, where the dot becomes plum. Don't
            recolour the dot to anything else.
          </p>
          <div className={styles.logoGrid}>
            {LOGOS.map((l, i) => (
              <div className={styles.logoCard} key={i}>
                <div className={`${styles.logoDisplay} ${styles[l.display]}`}>
                  <span className={[styles.logoMark, ...l.mark.split(" ").map((m) => styles[m])].join(" ")}>
                    <span className={styles.logoDot} />
                    Queer<span className={styles.q}>Pulse</span>
                  </span>
                </div>
                <div className={styles.logoMeta}>
                  <span>{l.meta}</span>
                  <a onClick={() => showToast("Downloading SVG", "success")}>SVG · PNG</a>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-60)", marginTop: 18 }}>
            <b>Spacing:</b> always leave one full <em>P</em>-height of clear space around
            the mark. <b>Minimum size:</b> 88px wide on screen, 18 mm in print.{" "}
            <b>Don't:</b> stretch, recolour, set on busy photos, or pair with rainbow
            gradients we didn't make.
          </p>
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Colour, <em>full system</em>
            </h2>
            <span className={styles.secNum}>§03</span>
          </div>
          <p>
            The whole brand runs on four hues. We do not introduce additional accent
            colours — including campaign-specific ones.
          </p>
          <div className={styles.swatchRow}>
            {SWATCHES.map((s) => (
              <div className={styles.swatch} key={s.name}>
                <div className={styles.swatchChip} style={{ background: s.bg, border: s.border ? "1px solid rgba(45,27,61,.10)" : undefined }} />
                <div className={styles.swatchName}>{s.name}</div>
                <div className={styles.swatchHex}>{s.hex}</div>
                <div className={styles.swatchMeta}>{s.meta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Cleared <em>photography</em>
            </h2>
            <span className={styles.secNum}>§04</span>
          </div>
          <p>
            Six images, model-released and pre-cleared for editorial use. Credit:{" "}
            <em>photographs by André Bento for QueerPulse</em>. Resolution: 3000 × 2000 px
            JPG.
          </p>
          <div className={styles.imgGrid}>
            {IMAGES.map((img, i) => (
              <div className={`${styles.imgCard} ${styles[img.tint]}`} key={i}>
                {img.label}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Named <em>spokespeople</em>
            </h2>
            <span className={styles.secNum}>§05</span>
          </div>
          <p>
            Three founding members are available for press comment. Quote them on their
            stated topics; don't paraphrase. <em>Other members are not available without
            explicit consent</em> — please don't approach members directly through the
            platform.
          </p>
          <div className={styles.teamGrid}>
            {TEAM.map((t) => (
              <div className={styles.teamCard} key={t.email}>
                <div className={[styles.ph, t.phCls && styles[t.phCls]].filter(Boolean).join(" ")}>{t.ph}</div>
                <h4>{t.name}</h4>
                <div className={styles.teamRole}>{t.role}</div>
                <p>{t.desc}</p>
                <div className={styles.teamLangs}>{t.langs}</div>
                <div className={styles.teamContact}>
                  <a href={`mailto:${t.email}`}>{t.email}</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Quick <em>facts</em> · as of 14 May 2026
            </h2>
            <span className={styles.secNum}>§06</span>
          </div>
          <p>
            Sourced from the 2025 transparency report. <em>Please link to the
            transparency page when citing.</em>
          </p>
          <div className={styles.factsGrid}>
            {FACTS.map((f, i) => (
              <div className={styles.fact} key={i}>
                <b>{f.b}</b>
                <span>{f.s}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              Recent <em>coverage</em>
            </h2>
            <span className={styles.secNum}>§07</span>
          </div>
          <p>
            Selected English- and Portuguese-language pieces from 2024–2026. <em>Hit-counts
            welcome but not necessary</em> — link to Press instead.
          </p>
          <div className={styles.covList}>
            {COVERAGE.map((c, i) => (
              <a href="#" className={styles.covRow} key={i} onClick={(e) => e.preventDefault()}>
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

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              <em>Downloads</em>
            </h2>
            <span className={styles.secNum}>§08</span>
          </div>
          <p>
            Direct file links. The full kit is a 38 MB ZIP with everything below;
            individual files are smaller.
          </p>
          <div className={styles.downloadRow}>
            {DOWNLOADS.map((d, i) => (
              <button type="button" className={styles.dlCard} key={i} onClick={() => showToast("Downloading…", "success")}>
                <div className={[styles.dlIc, d.icCls && styles[d.icCls]].filter(Boolean).join(" ")}>{d.ic}</div>
                <div className={styles.dlInfo}>
                  <b>{d.title}</b>
                  <span>{d.desc}</span>
                </div>
                <div className={styles.dlArrow}>↓</div>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.footerNote}>
          All assets above are licensed under <a href="#">Creative Commons BY 4.0</a> for
          editorial use.
          <br />
          Commercial reuse requires written permission — write to{" "}
          <a href="mailto:press@queerpulse.app">press@queerpulse.app</a>.
        </div>
      </div>
    </PageShell>
  );
}
