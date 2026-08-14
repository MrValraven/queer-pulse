import type { ReactNode } from "react";
import {
  IVA_EXEMPTION_THRESHOLD,
  RETENTION_RATES,
  SIMPLIFIED_COEFFICIENTS,
  SIMPLIFIED_STARTUP_FACTORS,
  SS_RATE_FREELANCER,
  SS_MIN_MONTHLY,
  SS_FIRST_YEAR_EXEMPTION_MONTHS,
  RETENTION_DISPENSA_THRESHOLD,
} from "./tax.constants";

/** A readable section of the recibos verdes guide. */
export interface GuideSection {
  id: string;
  title: ReactNode;
  body: ReactNode;
}

/* Numbers are interpolated from tax.constants.ts so the guide can never drift
   out of sync with the figures the tools use. This guide's own prose
   (GUIDE_SECTIONS below) is deliberately left in English regardless of the
   active app language — see the sweep report: dense, article-citing pt-PT tax
   prose was flagged rather than risk a subtly wrong tax instruction. Because
   the surrounding sentences never translate, the numbers inside them are
   formatted with a fixed English locale (not the hardcoded "pt-PT" this used
   to carry, which mismatched the English prose) rather than `useFormat()` —
   there is no active-language branch for this content to follow. */
const euro = (n: number) => `€${n.toLocaleString("en-GB")}`;
const pct = (fraction: number) =>
  `${(fraction * 100).toLocaleString("en-GB")}%`;

const defaultRetention =
  RETENTION_RATES.find((r) => r.value === 23)?.value ?? 23;

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "abrir-atividade",
    title: (
      <>
        Opening your <em>atividade.</em>
      </>
    ),
    body: (
      <>
        <p>
          Before you can send your first recibo verde, you tell the Autoridade
          Tributária (Finanças) that you&apos;re working for yourself. This is
          called <strong>abrir atividade</strong>, registering as a{" "}
          <em>trabalhador independente</em>. It&apos;s free, and you can do the
          whole thing online through the <strong>Portal das Finanças</strong>{" "}
          (or in person at a Loja de Finanças if you&apos;d rather have someone
          walk you through it).
        </p>
        <p>You&apos;ll need a few things ready:</p>
        <ul>
          <li>
            Your NIF (número de identificação fiscal) and Portal das Finanças
            login.
          </li>
          <li>
            A clear idea of what you do: you&apos;ll pick a{" "}
            <em>código de atividade</em> (CAE / CIRS code) that describes your
            work.
          </li>
          <li>
            Your IBAN, and the date you expect to start (you can backdate to
            when the work actually began).
          </li>
        </ul>
        <p>
          Once you&apos;re registered, you issue invoices (
          <em>faturas-recibo</em>, the modern recibos verdes) straight from the
          Portal. No special software needed, though our invoice tool makes the
          maths and the legal notes painless.
        </p>
      </>
    ),
  },
  {
    id: "regime-simplificado",
    title: (
      <>
        Regime simplificado &amp; <em>coefficients.</em>
      </>
    ),
    body: (
      <>
        <p>
          Most freelancers start in the <strong>regime simplificado</strong>.
          The idea is generous: the tax office assumes a chunk of what you earn
          was spent running your business, so you&apos;re only taxed on a{" "}
          <em>coefficient</em> of your gross income, a slice of the whole.
        </p>
        <p>
          <strong>Taxable income = coefficient × gross income.</strong> The
          coefficient depends on what you do:
        </p>
        <ul>
          <li>
            <strong>{pct(SIMPLIFIED_COEFFICIENTS.services)}</strong> for liberal
            / professional services listed in the art. 151.º table (designers,
            developers, consultants, therapists, and most creative work).
          </li>
          <li>
            <strong>{pct(SIMPLIFIED_COEFFICIENTS.otherServices)}</strong> for
            other services not in that table.
          </li>
        </ul>
        <p>
          So on the {pct(SIMPLIFIED_COEFFICIENTS.services)} coefficient, earning{" "}
          {euro(1000)} means only{" "}
          {euro(1000 * SIMPLIFIED_COEFFICIENTS.services)} counts as taxable
          income. The rest is presumed to be your costs.
        </p>
        <p>
          There&apos;s a kind starting bonus, too: in your{" "}
          <strong>first two years</strong> the taxable slice is reduced:
          multiplied by {pct(SIMPLIFIED_STARTUP_FACTORS.year1)} in year one (a
          50% cut) and {pct(SIMPLIFIED_STARTUP_FACTORS.year2)} in year two (a
          25% cut). It softens the landing while you find your feet.
        </p>
      </>
    ),
  },
  {
    id: "retencao",
    title: (
      <>
        Retenção na fonte &amp; <em>dispensa.</em>
      </>
    ),
    body: (
      <>
        <p>
          <strong>Retenção na fonte</strong> is withholding: when a business
          client pays you, they hold back a slice and send it to Finanças as an
          advance on your IRS. It&apos;s not an extra tax: it&apos;s a
          pre-payment, settled when you file your annual return.
        </p>
        <p>
          The default rate is <strong>{pct(defaultRetention / 100)}</strong>. So
          on a {euro(1000)} invoice with withholding, the client pays you{" "}
          {euro(1000 - 1000 * (defaultRetention / 100))} now and sends{" "}
          {euro(1000 * (defaultRetention / 100))} to the tax office on your
          behalf.
        </p>
        <p>Two things worth knowing:</p>
        <ul>
          <li>
            <strong>Only company / business clients withhold.</strong> When you
            invoice a private individual, there&apos;s no retention: you
            receive the full amount and account for the tax yourself later.
          </li>
          <li>
            If you expect to earn under{" "}
            <strong>{euro(RETENTION_DISPENSA_THRESHOLD)}</strong> a year, you
            can claim the <em>dispensa de retenção</em> and skip withholding
            entirely (art. 101.º-B). Handy for keeping cash flow in your own
            pocket. Just mark the receipt with the dispensa note.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "iva",
    title: (
      <>
        IVA &amp; the <em>art. 53.º</em> exemption.
      </>
    ),
    body: (
      <>
        <p>
          IVA (VAT) sounds intimidating, but many freelancers never have to
          charge it. If your turnover stays below{" "}
          <strong>{euro(IVA_EXEMPTION_THRESHOLD)}</strong> a year, you qualify
          for the <strong>isenção do art. 53.º do CIVA</strong>, meaning you
          don&apos;t add IVA to your invoices at all.
        </p>
        <p>
          Below that threshold, your prices are simply your prices: no 23% on
          top, no quarterly IVA returns to file. You just add a short note to
          each invoice saying you&apos;re working under the art. 53.º exemption
          (our invoice tool drops it in for you).
        </p>
        <p>
          Once you cross {euro(IVA_EXEMPTION_THRESHOLD)} you leave the exemption
          and start charging IVA, usually from the start of the following year.
          It&apos;s a good problem to have, and a sign your work is growing.
        </p>
      </>
    ),
  },
  {
    id: "seguranca-social",
    title: (
      <>
        Segurança Social, <em>quarter by quarter.</em>
      </>
    ),
    body: (
      <>
        <p>
          Segurança Social is your social-security contribution: it funds your
          pension, sick pay, and parental leave. For freelancers the rate is{" "}
          <strong>{pct(SS_RATE_FREELANCER)}</strong>, charged on a base built
          from your services income (not the full amount, only part of it
          counts).
        </p>
        <p>
          The rhythm is <strong>quarterly</strong>. Four times a year you file a
          short <em>declaração trimestral</em> in Segurança Social Direta,
          reporting what you earned in the previous three months. Your
          contribution adjusts to match, so quiet quarters cost less.
        </p>
        <p>
          There&apos;s a floor: even in a month with little or no income, the
          minimum contribution is <strong>{euro(SS_MIN_MONTHLY)}/month</strong>.
          Set a little aside each time you get paid and the quarterly bill never
          stings.
        </p>
      </>
    ),
  },
  {
    id: "deadlines",
    title: (
      <>
        The deadlines that <em>actually matter.</em>
      </>
    ),
    body: (
      <>
        <p>
          You don&apos;t need to memorise the tax calendar, just these three
          rhythms:
        </p>
        <ul>
          <li>
            <strong>Quarterly Segurança Social declaration</strong>: filed in{" "}
            <strong>January, April, July and October</strong>, covering the
            previous quarter. Quick, but don&apos;t skip it: missing it can
            default you to a higher base.
          </li>
          <li>
            <strong>IRS season</strong>: your annual income-tax return, filed
            in <strong>spring</strong> (the window typically runs April to
            June). This is where withholding and coefficients all settle up.
          </li>
          <li>
            <strong>IVA periodic returns</strong>: only if you&apos;re{" "}
            <em>not</em> under the art. 53.º exemption. Monthly or quarterly
            depending on your turnover.
          </li>
        </ul>
        <p>
          Put them in your calendar once and they become routine. A good
          contabilista will watch these dates for you, too.
        </p>
      </>
    ),
  },
  {
    id: "first-year",
    title: (
      <>
        Your <em>first year.</em>
      </>
    ),
    body: (
      <>
        <p>
          Starting out comes with real breathing room. Portugal goes easy on
          first-timers:
        </p>
        <ul>
          <li>
            <strong>
              {SS_FIRST_YEAR_EXEMPTION_MONTHS} months free of Segurança Social.
            </strong>{" "}
            If this is your first time as an independent worker, you&apos;re
            exempt from contributions for your first{" "}
            {SS_FIRST_YEAR_EXEMPTION_MONTHS} months. Your first payment falls
            in month {SS_FIRST_YEAR_EXEMPTION_MONTHS + 1}.
          </li>
          <li>
            <strong>Lower taxable income.</strong> The regime
            simplificado&apos;s start-up reduction (the{" "}
            {pct(SIMPLIFIED_STARTUP_FACTORS.year1)} year-one and{" "}
            {pct(SIMPLIFIED_STARTUP_FACTORS.year2)} year-two factors) shrinks
            the slice of income you&apos;re taxed on while you&apos;re building
            up.
          </li>
          <li>
            <strong>IRS Jovem.</strong> If you&apos;re a younger worker, the IRS
            Jovem regime can exempt a large share of your income from tax for
            several years. Worth checking whether you qualify. It can make a
            real difference early on.
          </li>
        </ul>
        <p>
          None of this is automatic gospel for every situation, so when in
          doubt, ask. But the headline is gentle: your first year as a
          freelancer is designed to cost you less.
        </p>
      </>
    ),
  },
];
