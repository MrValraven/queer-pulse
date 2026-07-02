import { memberName } from "../members/data/members";

export const CHIPS = [
  "All · 42",
  "Health",
  "Migration",
  "Work",
  "Public services",
  "The city",
  "Money",
  "Family",
  "Activism",
  "Profiles",
  "Interviews",
];

export interface Item {
  kicker: string;
  read: string;
  title: React.ReactNode;
  dek: string;
  byline: React.ReactNode;
  topics: string[];
}

const ITEMS: Item[] = [
  {
    kicker: "Reportage",
    read: "· 22 min · Issue 07",
    title: (
      <>
        A history of the lifeline, <em>1995–2025.</em>
      </>
    ),
    dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember and the ones they can't.",
    byline: (
      <>
        By <b>Catarina Vaz</b> · 12 Dec 2025
      </>
    ),
    topics: ["Health", "Activism"],
  },
  {
    kicker: "Reported essay",
    read: "· 17 min · Issue 06",
    title: (
      <>
        The visa queue is <em>a kind of closet.</em>
      </>
    ),
    dek: "Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.",
    byline: (
      <>
        By <b>Sara Pinheiro</b> · 18 Sep 2025
      </>
    ),
    topics: ["Migration", "Public services"],
  },
  {
    kicker: "Reportage",
    read: "· 16 min · Issue 08",
    title: (
      <>
        Inside the back room of <em>Café Beirão.</em>
      </>
    ),
    dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.",
    byline: (
      <>
        By <b>Jonas Ferreira</b> · 14 Mar 2026
      </>
    ),
    topics: ["Health", "The city"],
  },
  {
    kicker: "Interview",
    read: "· 19 min · Issue 06",
    title: (
      <>
        Mariza Câmara, <em>district health director.</em>
      </>
    ),
    dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal — what passed, what got buried.",
    byline: (
      <>
        By <b>Sara Pinheiro</b> &amp; <b>{memberName("sofia")}</b> · 14 Sep 2025
      </>
    ),
    topics: ["Interviews", "Health", "Public services"],
  },
  {
    kicker: "Long read",
    read: "· 24 min · Issue 05",
    title: <>Six months on a four-day week.</>,
    dek: "A studio that closes on Fridays, told from inside — what it does to the work, the staff, and the math.",
    byline: (
      <>
        By <b>Tomás Mendes</b> · 4 Jun 2025
      </>
    ),
    topics: ["Work", "Money"],
  },
  {
    kicker: "Reported essay",
    read: "· 14 min · Issue 07",
    title: (
      <>
        What the SNS gets right (and where it <em>still leaves you waiting</em>
        ).
      </>
    ),
    dek: "Six months reporting inside three regional health centres in Lisbon and the Algarve.",
    byline: (
      <>
        By <b>Sara Pinheiro</b> · 8 Apr 2026
      </>
    ),
    topics: ["Health", "Public services"],
  },
  {
    kicker: "Profile",
    read: "· 18 min · Issue 04",
    title: (
      <>
        The lawyer who only takes <em>cases nobody else will.</em>
      </>
    ),
    dek: "Twenty-one years of asylum work, told over five lunches.",
    byline: (
      <>
        By <b>Anika Kovač</b> · 12 Mar 2025
      </>
    ),
    topics: ["Profiles", "Migration"],
  },
  {
    kicker: "Reportage",
    read: "· 21 min · Issue 03",
    title: (
      <>
        A village called <em>everywhere.</em>
      </>
    ),
    dek: "In Trás-os-Montes, the rural queers reshaping who gets to leave.",
    byline: (
      <>
        By <b>Luísa Gomes</b> · 22 Dec 2024
      </>
    ),
    topics: ["The city", "Family"],
  },
  {
    kicker: "Long read",
    read: "· 26 min · Issue 02",
    title: (
      <>
        The longest night of <em>Lisboa Pride.</em>
      </>
    ),
    dek: "A behind-the-scenes account of march night with the legal observer team — twelve hours, six incidents, one resignation.",
    byline: (
      <>
        By <b>Catarina Vaz</b> · 28 Sep 2024
      </>
    ),
    topics: ["Activism"],
  },
  {
    kicker: "Reported essay",
    read: "· 15 min · Issue 01",
    title: (
      <>
        What we owe <em>each other.</em>
      </>
    ),
    dek: "The inaugural essay. On chosen family, mutual aid, and how the magazine itself got made.",
    byline: (
      <>
        By <b>Marta Reis</b> · 12 Jun 2024
      </>
    ),
    topics: ["Family", "Activism"],
  },
];

/** The full back-catalogue: the curated pieces plus an archive generated
 *  deterministically from them, so "Load older" reveals real list rows. */
const ARCHIVE: Item[] = Array.from({ length: 32 }, (_, i) => {
  const base = ITEMS[i % ITEMS.length]!;
  const issue = 9 - ((i % 9) + 1);
  return {
    ...base,
    read: `· ${12 + (i % 14)} min · Issue 0${Math.max(1, issue)}`,
    byline: <>{base.byline} · from the archive</>,
  };
});

export const ALL_ITEMS: Item[] = [...ITEMS, ...ARCHIVE];
export const PAGE_SIZE = 9;
