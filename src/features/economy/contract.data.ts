/**
 * Clause library, document strings, and defaults for the freelance
 * service-contract generator — bilingual (English / European Portuguese).
 *
 * Each clause body is a function of the live form context, per language, so
 * party names, fees and timeline flow into the prose. This is general
 * information, NOT legal advice — the preview footnote carries the disclaimer.
 */

export type Lang = 'en' | 'pt'

/** Everything the form collects and the contract is assembled from. */
export interface ContractCtx {
  providerName: string
  providerNif: string
  clientName: string
  clientNif: string
  project: string
  scope: string
  fee: string
  paymentTerms: string
  timeline: string
  governingLaw: string
}

/** A single optional clause: toggled on/off and rendered from ctx, per language. */
export interface Clause {
  id: string
  label: Record<Lang, string>
  defaultOn: boolean
  body: Record<Lang, (ctx: ContractCtx) => string>
}

/** Static document chrome (headings, party words, signatures) per language. */
export interface DocStrings {
  title: string
  projectScope: string
  feePayment: string
  fee: string
  paymentTerms: string
  timeline: string
  between: string
  and: string
  providerFallback: string
  clientFallback: string
  governedBy: (law: string) => string
  provider: string
  client: string
  date: string
  disclaimer: string
}

export const DOC_STRINGS: Record<Lang, DocStrings> = {
  en: {
    title: 'Service Agreement',
    projectScope: 'Project & scope',
    feePayment: 'Fee & payment',
    fee: 'Fee',
    paymentTerms: 'Payment terms',
    timeline: 'Timeline',
    between: 'Between',
    and: 'and',
    providerFallback: 'the Provider',
    clientFallback: 'the Client',
    governedBy: (law) => `This agreement is governed by the laws of ${law}.`,
    provider: 'Provider',
    client: 'Client',
    date: 'Date',
    disclaimer:
      'General information, not legal advice. Laws change and individual ' +
      'situations differ — confirm with a qualified lawyer (advogado) before relying on this.',
  },
  pt: {
    title: 'Contrato de Prestação de Serviços',
    projectScope: 'Projeto e âmbito',
    feePayment: 'Honorários e pagamento',
    fee: 'Honorários',
    paymentTerms: 'Condições de pagamento',
    timeline: 'Prazos',
    between: 'Entre',
    and: 'e',
    providerFallback: 'o Prestador',
    clientFallback: 'o Cliente',
    governedBy: (law) => `O presente contrato rege-se pela lei de ${law}.`,
    provider: 'Prestador',
    client: 'Cliente',
    date: 'Data',
    disclaimer:
      'Informação geral, não constitui aconselhamento jurídico. As leis mudam e ' +
      'cada situação é diferente — confirme com um advogado antes de se basear neste documento.',
  },
}

/** Party-name fallbacks resolve from the active language's document strings. */
const provider = (c: ContractCtx, lang: Lang) =>
  c.providerName.trim() || DOC_STRINGS[lang].providerFallback
const client = (c: ContractCtx, lang: Lang) =>
  c.clientName.trim() || DOC_STRINGS[lang].clientFallback

/**
 * The toggleable clause library. Order here is the order they appear in the
 * document. Each body() returns a single clear paragraph; PT legal context is
 * referenced where it materially changes the meaning.
 */
export const CLAUSES: Clause[] = [
  {
    id: 'ip',
    label: {
      en: 'Intellectual property transfer on full payment',
      pt: 'Transmissão da propriedade intelectual após pagamento integral',
    },
    defaultOn: true,
    body: {
      en: (c) =>
        `All intellectual property rights in the deliverables created under this agreement ` +
        `transfer from ${provider(c, 'en')} to ${client(c, 'en')} only upon receipt of full payment. ` +
        `Until payment is settled in full, ${provider(c, 'en')} retains all such rights, and any ` +
        `use of the deliverables by ${client(c, 'en')} before then is by licence only. Each party ` +
        `keeps the rights to its own pre-existing materials, tools and know-how. Moral rights ` +
        `(direitos morais de autor) remain with the author as required by Portuguese copyright ` +
        `law (Código do Direito de Autor e dos Direitos Conexos).`,
      pt: (c) =>
        `Todos os direitos de propriedade intelectual sobre as entregas criadas ao abrigo do ` +
        `presente contrato transferem-se de ${provider(c, 'pt')} para ${client(c, 'pt')} apenas após ` +
        `o pagamento integral. Até à liquidação total, ${provider(c, 'pt')} mantém todos esses ` +
        `direitos, e qualquer utilização das entregas por ${client(c, 'pt')} antes desse momento é ` +
        `feita apenas a título de licença. Cada parte conserva os direitos sobre os seus próprios ` +
        `materiais, ferramentas e conhecimentos preexistentes. Os direitos morais de autor ` +
        `permanecem com o autor, conforme exigido pelo Código do Direito de Autor e dos Direitos Conexos.`,
    },
  },
  {
    id: 'killfee',
    label: { en: 'Kill fee & cancellation', pt: 'Taxa de cancelamento e rescisão' },
    defaultOn: true,
    body: {
      en: (c) =>
        `Either party may terminate this agreement in writing. If ${client(c, 'en')} cancels after ` +
        `work has begun, ${provider(c, 'en')} is entitled to payment for all work completed to date ` +
        `plus a kill fee of 25% of the remaining contract value, in recognition of the time ` +
        `reserved and opportunities declined. Any deposit already paid is non-refundable once ` +
        `work has commenced.`,
      pt: (c) =>
        `Qualquer das partes pode rescindir o presente contrato por escrito. Se ${client(c, 'pt')} ` +
        `cancelar após o início dos trabalhos, ${provider(c, 'pt')} tem direito ao pagamento de todo ` +
        `o trabalho concluído até à data, acrescido de uma taxa de cancelamento (kill fee) de 25% do ` +
        `valor remanescente do contrato, em reconhecimento do tempo reservado e das oportunidades ` +
        `recusadas. Qualquer sinal já pago não é reembolsável após o início dos trabalhos.`,
    },
  },
  {
    id: 'confidentiality',
    label: { en: 'Confidentiality', pt: 'Confidencialidade' },
    defaultOn: true,
    body: {
      en: (c) =>
        `Each party shall keep confidential any non-public information disclosed by the other ` +
        `in connection with this agreement, and shall use it solely to perform the work. This ` +
        `obligation survives termination. It does not apply to information that is or becomes ` +
        `public through no fault of the receiving party, or that must be disclosed by law. ` +
        `${provider(c, 'en')} may, unless ${client(c, 'en')} objects in writing, name the project in its ` +
        `portfolio.`,
      pt: (c) =>
        `Cada parte obriga-se a manter confidencial toda a informação não pública divulgada pela ` +
        `outra no âmbito do presente contrato, utilizando-a exclusivamente para a execução dos ` +
        `trabalhos. Esta obrigação subsiste após a cessação do contrato. Não se aplica a informação ` +
        `que seja ou se torne pública sem culpa da parte recetora, ou cuja divulgação seja exigida ` +
        `por lei. ${provider(c, 'pt')} pode, salvo oposição escrita de ${client(c, 'pt')}, identificar ` +
        `o projeto no seu portefólio.`,
    },
  },
  {
    id: 'latepayment',
    label: { en: 'Late-payment interest', pt: 'Juros de mora' },
    defaultOn: true,
    body: {
      en: (c) =>
        `Invoices are due within the period stated above. Overdue amounts accrue interest at ` +
        `the statutory rate for commercial transactions in Portugal (juros de mora comerciais ` +
        `under Decreto-Lei n.º 62/2013, set semi-annually by the Ministério das Finanças and ` +
        `typically several points above the ECB reference rate). ${client(c, 'en')} also bears any ` +
        `reasonable recovery costs. ${provider(c, 'en')} may pause work while payment is outstanding.`,
      pt: (c) =>
        `As faturas devem ser pagas dentro do prazo indicado acima. Os montantes em atraso vencem ` +
        `juros à taxa legal aplicável às transações comerciais em Portugal (juros de mora comerciais ` +
        `nos termos do Decreto-Lei n.º 62/2013, fixada semestralmente pelo Ministério das Finanças e ` +
        `habitualmente vários pontos acima da taxa de referência do BCE). ${client(c, 'pt')} suporta ` +
        `ainda os custos razoáveis de recuperação do crédito. ${provider(c, 'pt')} pode suspender os ` +
        `trabalhos enquanto o pagamento estiver em falta.`,
    },
  },
  {
    id: 'revisions',
    label: { en: 'Revisions limit', pt: 'Limite de revisões' },
    defaultOn: true,
    body: {
      en: (c) =>
        `The fee covers up to two rounds of revisions per deliverable, where a round is a single ` +
        `consolidated set of feedback from ${client(c, 'en')}. Further revisions, or changes that ` +
        `expand the agreed scope, are billed separately at ${provider(c, 'en')}'s standard rate and ` +
        `agreed in writing before the additional work begins.`,
      pt: (c) =>
        `O valor acordado inclui até duas rondas de revisões por entrega, entendendo-se por ronda um ` +
        `único conjunto consolidado de comentários de ${client(c, 'pt')}. Revisões adicionais, ou ` +
        `alterações que ampliem o âmbito acordado, são faturadas separadamente à tarifa habitual de ` +
        `${provider(c, 'pt')} e acordadas por escrito antes do início do trabalho adicional.`,
    },
  },
  {
    id: 'forcemajeure',
    label: { en: 'Force majeure', pt: 'Força maior' },
    defaultOn: false,
    body: {
      en: () =>
        `Neither party is liable for delay or failure to perform caused by events beyond its ` +
        `reasonable control — including illness, natural disaster, civil unrest, strikes, or ` +
        `failure of essential infrastructure. The affected party shall notify the other promptly ` +
        `and resume performance as soon as reasonably possible. If such an event continues for ` +
        `more than 30 days, either party may terminate this agreement with payment due for work ` +
        `completed to that point.`,
      pt: () =>
        `Nenhuma das partes é responsável por atrasos ou incumprimentos causados por eventos alheios ` +
        `ao seu controlo razoável — incluindo doença, catástrofes naturais, agitação civil, greves ou ` +
        `falha de infraestruturas essenciais. A parte afetada deve notificar a outra prontamente e ` +
        `retomar a execução logo que razoavelmente possível. Se tal evento se prolongar por mais de ` +
        `30 dias, qualquer das partes pode rescindir o contrato, sendo devido o pagamento do trabalho ` +
        `concluído até esse momento.`,
    },
  },
]

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

/** Initial form values: provider fields fill from the saved issuer at runtime. */
export const DEFAULT_CTX: ContractCtx = {
  providerName: '',
  providerNif: '',
  clientName: '',
  clientNif: '',
  project: '',
  scope: '',
  fee: '',
  paymentTerms: '50% on signing, 50% on delivery',
  timeline: '',
  governingLaw: 'Portugal',
}
