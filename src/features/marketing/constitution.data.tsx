export interface Article {
  id: string;
  roman: string;
  tocKey: string;
  titleKey: string;
  clauseKeys: string[];
  quoteKey?: string;
}

export const ARTICLES: Article[] = [
  {
    id: "art1",
    roman: "I",
    tocKey: "marketing:constitution.art1.toc",
    titleKey: "marketing:constitution.art1.title",
    clauseKeys: [
      "marketing:constitution.art1.clause1",
      "marketing:constitution.art1.clause2",
      "marketing:constitution.art1.clause3",
    ],
  },
  {
    id: "art2",
    roman: "II",
    tocKey: "marketing:constitution.art2.toc",
    titleKey: "marketing:constitution.art2.title",
    clauseKeys: [
      "marketing:constitution.art2.clause1",
      "marketing:constitution.art2.clause2",
      "marketing:constitution.art2.clause3",
    ],
  },
  {
    id: "art3",
    roman: "III",
    tocKey: "marketing:constitution.art3.toc",
    titleKey: "marketing:constitution.art3.title",
    clauseKeys: [
      "marketing:constitution.art3.clause1",
      "marketing:constitution.art3.clause2",
      "marketing:constitution.art3.clause3",
    ],
  },
  {
    id: "art4",
    roman: "IV",
    tocKey: "marketing:constitution.art4.toc",
    titleKey: "marketing:constitution.art4.title",
    clauseKeys: [
      "marketing:constitution.art4.clause1",
      "marketing:constitution.art4.clause2",
      "marketing:constitution.art4.clause3",
      "marketing:constitution.art4.clause4",
    ],
    quoteKey: "marketing:constitution.art4.quote",
  },
  {
    id: "art5",
    roman: "V",
    tocKey: "marketing:constitution.art5.toc",
    titleKey: "marketing:constitution.art5.title",
    clauseKeys: [
      "marketing:constitution.art5.clause1",
      "marketing:constitution.art5.clause2",
      "marketing:constitution.art5.clause3",
    ],
  },
  {
    id: "art6",
    roman: "VI",
    tocKey: "marketing:constitution.art6.toc",
    titleKey: "marketing:constitution.art6.title",
    clauseKeys: [
      "marketing:constitution.art6.clause1",
      "marketing:constitution.art6.clause2",
      "marketing:constitution.art6.clause3",
      "marketing:constitution.art6.clause4",
    ],
  },
  {
    id: "art7",
    roman: "VII",
    tocKey: "marketing:constitution.art7.toc",
    titleKey: "marketing:constitution.art7.title",
    clauseKeys: [
      "marketing:constitution.art7.clause1",
      "marketing:constitution.art7.clause2",
      "marketing:constitution.art7.clause3",
    ],
  },
  {
    id: "art8",
    roman: "VIII",
    tocKey: "marketing:constitution.art8.toc",
    titleKey: "marketing:constitution.art8.title",
    clauseKeys: [
      "marketing:constitution.art8.clause1",
      "marketing:constitution.art8.clause2",
      "marketing:constitution.art8.clause3",
    ],
  },
  {
    id: "art9",
    roman: "IX",
    tocKey: "marketing:constitution.art9.toc",
    titleKey: "marketing:constitution.art9.title",
    clauseKeys: [
      "marketing:constitution.art9.clause1",
      "marketing:constitution.art9.clause2",
      "marketing:constitution.art9.clause3",
    ],
  },
  {
    id: "art10",
    roman: "X",
    tocKey: "marketing:constitution.art10.toc",
    titleKey: "marketing:constitution.art10.title",
    clauseKeys: [
      "marketing:constitution.art10.clause1",
      "marketing:constitution.art10.clause2",
    ],
  },
  {
    id: "art11",
    roman: "XI",
    tocKey: "marketing:constitution.art11.toc",
    titleKey: "marketing:constitution.art11.title",
    clauseKeys: [
      "marketing:constitution.art11.clause1",
      "marketing:constitution.art11.clause2",
    ],
  },
  {
    id: "art12",
    roman: "XII",
    tocKey: "marketing:constitution.art12.toc",
    titleKey: "marketing:constitution.art12.title",
    clauseKeys: [
      "marketing:constitution.art12.clause1",
      "marketing:constitution.art12.clause2",
      "marketing:constitution.art12.clause3",
    ],
  },
];
