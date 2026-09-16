// src/features/messages/linkSafety.ts

/**
 * Why a link earned a second look before opening it (PRD-371). A link can
 * carry more than one reason at once (a shortened lookalike domain, say).
 */
export type LinkSafetyReason =
  "shortener" | "punycode" | "ipAddress" | "credentialsInUrl" | "lookalike";

export interface LinkSafetyAssessment {
  isSuspicious: boolean;
  reasons: LinkSafetyReason[];
  /** The host the link ACTUALLY leads to (`URL.host`, port and all) — what a
   *  confirm dialog shows as ground truth, since the visible label a bubble
   *  renders (`formatLinkLabel` in `linkify.tsx`) is cosmetic and, for a
   *  `credentialsInUrl` link, can differ from where it really goes. */
  displayHost: string;
}

/** Pure, framework-free, and deliberately conservative: this is an advisory
 * hint (like `contactSafetyDetector.ts`), never an enforcement boundary — a
 * false negative here just means no warning, not a security hole, so keep
 * every check narrow rather than reaching for a broad heuristic that would
 * also flag ordinary links. Never call this to block navigation outright.
 */

// Known URL-shortener hosts: the visible label can never tell you where one
// of these actually leads, which is the whole point of a shortener and
// exactly what makes it worth a second look before opening.
const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "is.gd",
  "cutt.ly",
  "ow.ly",
  "rebrand.ly",
  "shorturl.at",
  "rb.gy",
  "tiny.cc",
  "buff.ly",
  "s.id",
  "t.ly",
]);

// QueerPulse's own hosts are never suspicious, whatever else about them would
// otherwise trip a check below (mirrors `linkify.tsx`'s own
// `QUEERPULSE_HOSTS` — duplicated rather than imported so this module stays a
// standalone, dependency-free unit callers can test in isolation; keep the
// two in sync if either changes). `window.location.host` additionally covers
// wherever the app is actually being served (a preview deploy, a LAN address,
// a dev server), same reasoning as `linkify.tsx`'s `isExternalHref`.
const QUEERPULSE_HOSTS = new Set(["queerpulse.com", "www.queerpulse.com"]);

function isQueerPulseHost(host: string): boolean {
  const lower = host.toLowerCase();
  const servedHost =
    typeof window === "undefined" ? "" : window.location.host.toLowerCase();
  if (servedHost !== "" && lower === servedHost) return true;
  return QUEERPULSE_HOSTS.has(lower);
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** True for an IPv4 or bracketed IPv6 literal host — a link that skips DNS
 *  entirely and points straight at a numeric address, which a legitimate
 *  listing or business link essentially never does. */
function isIpAddressHost(hostname: string): boolean {
  const bare =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;
  const ipv4Match = IPV4_RE.exec(bare);
  if (ipv4Match) {
    return ipv4Match
      .slice(1)
      .every((octet) => Number(octet) <= 255 && octet.length <= 3);
  }
  // A bracketed or bare IPv6 literal always carries a colon; an ordinary
  // hostname label never does (colons aren't a valid hostname character).
  return bare.includes(":");
}

// == Punycode (RFC 3492) decode, iterative, no dependency ==
// `URL` normalizes EVERY internationalized domain to its ASCII `xn--` form,
// whether it is a homograph attack or a completely ordinary accented word.
// QueerPulse serves Portugal, so `camara-lisboa.pt` (with the accented a)
// and any other PT/ES/FR/DE domain with a diacritic normalizes to `xn--...`
// exactly the same way a Cyrillic homograph does. Telling them apart needs
// the actual decoded text, not merely the presence of `xn--`, hence decoding
// it back below rather than pattern-matching the encoded form.
const PUNYCODE_BASE = 36;
const PUNYCODE_TMIN = 1;
const PUNYCODE_TMAX = 26;
const PUNYCODE_SKEW = 38;
const PUNYCODE_DAMP = 700;
const PUNYCODE_INITIAL_BIAS = 72;
const PUNYCODE_INITIAL_N = 128;
const PUNYCODE_DELIMITER = "-";

function punycodeAdaptBias(
  delta: number,
  numPoints: number,
  isFirstDelta: boolean,
): number {
  let k = 0;
  let adjustedDelta = isFirstDelta
    ? Math.floor(delta / PUNYCODE_DAMP)
    : Math.floor(delta / 2);
  adjustedDelta += Math.floor(adjustedDelta / numPoints);
  const threshold = ((PUNYCODE_BASE - PUNYCODE_TMIN) * PUNYCODE_TMAX) / 2;
  while (adjustedDelta > threshold) {
    adjustedDelta = Math.floor(adjustedDelta / (PUNYCODE_BASE - PUNYCODE_TMIN));
    k += PUNYCODE_BASE;
  }
  return (
    k +
    Math.floor(
      ((PUNYCODE_BASE - PUNYCODE_TMIN + 1) * adjustedDelta) /
        (adjustedDelta + PUNYCODE_SKEW),
    )
  );
}

/** A basic-code-point digit (`0-9a-zA-Z`) back to its 0-35 value, or -1 for
 *  anything else: the alphabet Punycode's generalized variable-length
 *  integers are written in. */
function punycodeDigitValue(charCode: number): number {
  if (charCode >= 0x30 && charCode <= 0x39) return charCode - 0x30 + 26;
  if (charCode >= 0x41 && charCode <= 0x5a) return charCode - 0x41;
  if (charCode >= 0x61 && charCode <= 0x7a) return charCode - 0x61;
  return -1;
}

/** Decodes the part of a label after its `xn--` prefix back to the original
 *  Unicode text, or `null` for input that is not well-formed Punycode. A
 *  decode failure here is treated as "nothing to assess" by every caller,
 *  never as suspicious on its own, matching this module's own "false
 *  negative just means no warning" rule at the top of the file. */
function decodePunycode(input: string): string | null {
  const codePoints: number[] = [];
  let n = PUNYCODE_INITIAL_N;
  let i = 0;
  let bias = PUNYCODE_INITIAL_BIAS;

  const lastDelimiterIndex = input.lastIndexOf(PUNYCODE_DELIMITER);
  const basicLength = lastDelimiterIndex < 0 ? 0 : lastDelimiterIndex;
  for (let index = 0; index < basicLength; index += 1) {
    const codePoint = input.codePointAt(index);
    if (codePoint === undefined || codePoint >= 0x80) return null;
    codePoints.push(codePoint);
  }

  let inputIndex = basicLength > 0 ? basicLength + 1 : 0;
  while (inputIndex < input.length) {
    const previousI = i;
    let weight = 1;
    let k = PUNYCODE_BASE;
    for (;;) {
      if (inputIndex >= input.length) return null;
      const digit = punycodeDigitValue(input.charCodeAt(inputIndex));
      inputIndex += 1;
      if (digit === -1) return null;
      i += digit * weight;
      const threshold =
        k <= bias
          ? PUNYCODE_TMIN
          : k >= bias + PUNYCODE_TMAX
            ? PUNYCODE_TMAX
            : k - bias;
      if (digit < threshold) break;
      weight *= PUNYCODE_BASE - threshold;
      k += PUNYCODE_BASE;
    }
    const numPoints = codePoints.length + 1;
    bias = punycodeAdaptBias(i - previousI, numPoints, previousI === 0);
    n += Math.floor(i / numPoints);
    i %= numPoints;
    if (n > 0x10ffff) return null;
    codePoints.splice(i, 0, n);
    i += 1;
  }
  return String.fromCodePoint(...codePoints);
}

/** One DNS label decoded back to real text, or `null` when there is nothing
 *  to decode: a plain ASCII label (ordinary, no IDN involved) or a malformed
 *  `xn--` label. */
function decodeIdnLabel(label: string): string | null {
  if (/^xn--/i.test(label)) return decodePunycode(label.slice(4));
  // A defensive fallback for whatever an environment's URL parser leaves
  // un-normalized: a label with a literal non-ASCII character, no `xn--`
  // prefix involved. Written as a positive range starting above the ASCII
  // block (never a negated `[^\x00-...]` class) so it never trips
  // `no-control-regex` on the low end of that range.
  return /[-￿]/.test(label) ? label : null;
}

// A coarse Unicode-script bucket for one codepoint. Digits and the hyphen
// are "common" (compatible with any script, so they never make a label read
// as "mixed"). Basic Latin through Latin Extended-B covers ordinary
// PT/ES/FR/DE diacritics (the accented a in camara, u in muller, e in
// societe, n in nino) as ONE ordinary script rather than "not ASCII
// therefore suspicious". A handful of other script blocks are named because
// they are the ones a homograph kit actually reaches for; anything else
// falls into a shared "other" bucket, which is enough to still catch a mix
// of two unnamed scripts without enumerating every block in Unicode.
type ScriptBucket =
  | "common"
  | "latin"
  | "greek"
  | "cyrillic"
  | "armenian"
  | "hebrew"
  | "arabic"
  | "other";

function scriptBucketOf(codePoint: number): ScriptBucket {
  if (codePoint === 0x2d || (codePoint >= 0x30 && codePoint <= 0x39)) {
    return "common";
  }
  if (codePoint <= 0x24f) return "latin";
  if (codePoint >= 0x370 && codePoint <= 0x3ff) return "greek";
  if (codePoint >= 0x400 && codePoint <= 0x4ff) return "cyrillic";
  if (codePoint >= 0x530 && codePoint <= 0x58f) return "armenian";
  if (codePoint >= 0x590 && codePoint <= 0x5ff) return "hebrew";
  if (codePoint >= 0x600 && codePoint <= 0x6ff) return "arabic";
  return "other";
}

/** Every distinct, script-bearing bucket a decoded label's characters belong
 *  to (never includes `"common"`: a bare run of digits carries no script of
 *  its own). Two or more distinct buckets in one label is the mixed-script
 *  homograph pattern itself (a Cyrillic "а" standing in for a Latin "a" in
 *  an otherwise-Latin label); exactly one is an ordinary label in that one
 *  script, whatever it is. */
function distinctScriptsIn(text: string): Set<ScriptBucket> {
  const scripts = new Set<ScriptBucket>();
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) continue;
    const bucket = scriptBucketOf(codePoint);
    if (bucket !== "common") scripts.add(bucket);
  }
  return scripts;
}

// The Cyrillic and Greek letters most often reached for as a visual stand-in
// for a Latin one in a real homograph phishing kit, each folded to the Latin
// letter it impersonates. Deliberately small and conservative (an advisory
// hint, never exhaustive), used only to ask "does this decoded label read as
// a known brand once the look-alikes are folded back", not to detect mixed
// scripts on its own (`distinctScriptsIn` already does that from the raw,
// unfolded text).
const CONFUSABLE_TO_LATIN: Record<string, string> = {
  а: "a", // Cyrillic a
  е: "e", // Cyrillic ie
  о: "o", // Cyrillic o
  р: "p", // Cyrillic er
  с: "c", // Cyrillic es
  х: "x", // Cyrillic ha
  у: "y", // Cyrillic u
  і: "i", // Cyrillic byelorussian-ukrainian i
  ј: "j", // Cyrillic je
  ѕ: "s", // Cyrillic dze
  һ: "h", // Cyrillic shha
  ԁ: "d", // Cyrillic komi de
  ԛ: "q", // Cyrillic qa
  ѡ: "w", // Cyrillic omega
  ѵ: "v", // Cyrillic izhitsa
  ο: "o", // Greek omicron
  ν: "v", // Greek nu
  ρ: "p", // Greek rho
  κ: "k", // Greek kappa
};

function foldConfusables(text: string): string {
  let folded = "";
  for (const character of text) {
    folded += CONFUSABLE_TO_LATIN[character] ?? character;
  }
  return folded;
}

/** True when a single DNS label is a genuine homograph attempt: its decoded
 *  text mixes more than one script (the classic case, a Cyrillic look-alike
 *  dropped into an otherwise-Latin word), or, once look-alike characters are
 *  folded to the Latin letters they impersonate, it reads as a near-miss of
 *  a known brand (see `isNearLookalikeTarget`). An ordinary decoded label
 *  that is all one script (Latin with PT/ES/FR/DE diacritics, or a
 *  legitimate domain in another script entirely, such as a real
 *  Cyrillic-script site) is neither, so it is never flagged just for being
 *  an IDN. */
function isSuspiciousIdnLabel(label: string): boolean {
  const decoded = decodeIdnLabel(label);
  if (decoded === null) return false;
  if (distinctScriptsIn(decoded).size > 1) return true;
  const folded = foldConfusables(decoded).toLowerCase();
  // Nothing folded means every character was already plain ASCII/Latin: the
  // ordinary ASCII lookalike check elsewhere in this module already covers
  // that case, so re-running the identical check here would be wasted work
  // with an identical answer.
  if (folded === decoded.toLowerCase()) return false;
  return isNearLookalikeTarget(folded);
}

/** True when any label of the host is a genuinely suspicious
 *  internationalized domain, see `isSuspiciousIdnLabel`. `URL` already
 *  normalizes an IDN host to its punycode form, so decoding each label back
 *  is what actually tells a homograph apart from an ordinary accented
 *  domain, rather than merely noticing the host is not plain ASCII. */
function hasSuspiciousIdnHost(hostname: string): boolean {
  return hostname.split(".").some((label) => isSuspiciousIdnLabel(label));
}

// Real brands a lookalike domain most often impersonates in a Lisbon rental/
// marketplace/social-engineering context: payment rails, the big platforms
// a "continue elsewhere" push names, PT banks, and QueerPulse itself (a
// phishing page imitating the product we're IN would be the highest-stakes
// case of all).
const LOOKALIKE_TARGETS = [
  "paypal",
  "revolut",
  "wise",
  "google",
  "apple",
  "microsoft",
  "instagram",
  "whatsapp",
  "facebook",
  "airbnb",
  "booking",
  "idealista",
  "olx",
  "imovirtual",
  "uber",
  "mbway",
  "cgd",
  "millenniumbcp",
  "novobanco",
  "santander",
  "queerpulse",
];

/** Classic Levenshtein edit distance (insert/delete/substitute), iterative
 *  single-row DP — no recursion, no dependency. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let previousRow = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let aIndex = 0; aIndex < a.length; aIndex += 1) {
    const currentRow = [aIndex + 1];
    for (let bIndex = 0; bIndex < b.length; bIndex += 1) {
      const substitutionCost = a[aIndex] === b[bIndex] ? 0 : 1;
      currentRow.push(
        Math.min(
          previousRow[bIndex + 1]! + 1, // deletion
          currentRow[bIndex]! + 1, // insertion
          previousRow[bIndex]! + substitutionCost, // substitution
        ),
      );
    }
    previousRow = currentRow;
  }
  return previousRow[b.length]!;
}

/** The host label that stands for "the brand" — the second-level domain
 *  (e.g. `paypal` from `paypal.com`, or from a real subdomain like
 *  `accounts.paypal.com`, still `paypal`). A KNOWN LIMITATION: this assumes a
 *  single-label TLD (`.com`, `.pt`, …), so a multi-part TLD (`.co.uk`) would
 *  read one label short. None of `LOOKALIKE_TARGETS`' real domains use one,
 *  and getting this exactly right in general needs a public-suffix list,
 *  which is out of scope for an advisory hint. */
function registrableLabel(hostname: string): string {
  const withoutWww = hostname.replace(/^www\./i, "");
  const labels = withoutWww.split(".");
  if (labels.length < 2) return labels[0] ?? "";
  return labels[labels.length - 2] ?? "";
}

/** The maximum edit distance a label may sit from a known target and still
 *  read as a near-miss, scaled to the target's own length (about a fifth of
 *  it, floored, so it grows with the target instead of being one fixed
 *  number for every target regardless of size). A short target such as
 *  "olx" (3) or "wise"/"uber" (4) resolves to 0, meaning no fuzzy match at
 *  all: only an exact label match reaches it, and that already reads as the
 *  real domain rather than a lookalike, so in practice a target this short
 *  is never flagged by distance alone. That is what actually stops an
 *  ordinary short word ("visa", "user", "site") from landing within one or
 *  two edits of a three- or four-letter target and reading as brand
 *  impersonation. A longer target such as "revolut" (7) or "queerpulse" (10)
 *  still tolerates a real one- or two-character typo. */
function maxAllowedDistance(targetLength: number): number {
  return Math.floor(targetLength * 0.2);
}

/** True when `label` is a near-miss of one of `LOOKALIKE_TARGETS`, e.g.
 *  `revoiut` for `revolut`, `paypa1` for `paypal`, but NOT when it is an
 *  exact match or a genuine subdomain of the real thing: an exact label
 *  match is distance 0, which the `>= 1` floor below already excludes, so
 *  "the real domain and its subdomains are never a lookalike" falls out of
 *  the distance check on its own, without a separate allowlist. Shared by
 *  the ordinary ASCII host check (`isLookalikeHost`) and the decoded-IDN
 *  check (`isSuspiciousIdnLabel`), which folds look-alike characters to
 *  Latin first and runs the exact same test on the result. */
function isNearLookalikeTarget(label: string): boolean {
  if (label.length < 4) return false;
  return LOOKALIKE_TARGETS.some((target) => {
    if (Math.abs(label.length - target.length) > 2) return false;
    const allowed = maxAllowedDistance(target.length);
    if (allowed < 1) return false;
    const distance = editDistance(label, target);
    return distance >= 1 && distance <= allowed;
  });
}

/** True when the host's brand-bearing label (its registrable second-level
 *  domain) is a lookalike of a known target, see `isNearLookalikeTarget`. */
function isLookalikeHost(hostname: string): boolean {
  return isNearLookalikeTarget(registrableLabel(hostname).toLowerCase());
}

/**
 * Assesses whether `href` is worth a second look before opening it. Returns
 * `isSuspicious: false` (with an empty `reasons` list) for a QueerPulse link,
 * an ordinary external link, or an `href` that fails to parse as a URL at all
 * (nothing reliable to assess, so the safer default here is "don't warn" —
 * `renderWithLinks`/`LinkPreview` never render an unparseable href as a link
 * to begin with).
 */
export function assessLinkSafety(href: string): LinkSafetyAssessment {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { isSuspicious: false, reasons: [], displayHost: href };
  }

  const displayHost = url.host;
  if (isQueerPulseHost(url.host)) {
    return { isSuspicious: false, reasons: [], displayHost };
  }

  const reasons: LinkSafetyReason[] = [];
  const bareHost = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (SHORTENER_HOSTS.has(bareHost)) reasons.push("shortener");
  if (hasSuspiciousIdnHost(url.hostname)) reasons.push("punycode");
  if (isIpAddressHost(url.hostname)) reasons.push("ipAddress");
  if (url.username !== "" || url.password !== "") {
    reasons.push("credentialsInUrl");
  }
  if (isLookalikeHost(url.hostname)) reasons.push("lookalike");

  return { isSuspicious: reasons.length > 0, reasons, displayHost };
}
