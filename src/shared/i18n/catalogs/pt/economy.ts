import type { Catalog } from "../../types";

/**
 * Economia — pt-PT inclusivo. Mesmas chaves que `en/economy.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members"/"you" evita género por omissão masculino; usa segunda pessoa e
 *   reformulação neutra sempre que possível.
 * - Termos fiscais (IVA, IRS, Segurança Social, recibos verdes, regime
 *   simplificado) mantêm-se tal como usados em Portugal — nunca traduzidos
 *   nem simplificados; o registo destas cadeias é deliberadamente conservador
 *   e literal (nunca mais informal do que o inglês).
 * - Conteúdo fictício (descrições de vagas, biografias de empresas, entradas
 *   do quadro de salários) NÃO é traduzido — em modo live vem da API.
 */
export const economy: Catalog = {
  // ── EconomyPage (hub) ──────────────────────────────────────────────────
  "hub.eyebrow": "Economia queer",
  "hub.title": "Constrói algo que <em>perdura.</em>",
  "hub.lead":
    "Ferramentas, mentoria e solidariedade para pessoas queer que criam negócios, trabalham por conta própria ou fazem carreira, porque a independência económica faz parte da libertação queer.",
  "hub.tab.incubator": "Incubadora de negócios",
  "hub.tab.freelance": "Trabalho independente",
  "hub.tab.salary": "Quadro de salários",
  "hub.outro.title": "Constrói <em>connosco.</em>",
  "hub.outro.sub":
    "Uma economia queer mais forte beneficia todas as pessoas. Começa pelas ferramentas, fica pela comunidade.",
  "hub.outro.browseCta": "Ver vagas",
  "hub.outro.hostCta": "Encontrar uma pessoa mentora",

  // ── IncubatorTab ────────────────────────────────────────────────────────
  "incubator.hero.title": "Um espaço para construíres <em>a tua</em> ideia.",
  "incubator.hero.body":
    "A incubadora da QueerPulse é para pessoas queer que estão a criar um negócio. Conta-nos o que estás a construir e a nossa equipa lê a tua candidatura.",
  "incubator.hero.applyCta": "Candidatar-me à incubadora",
  "incubator.hero.mentorCta": "Tornar-me pessoa mentora",
  "incubator.stats.founders": "pessoas fundadoras em 2 coortes",
  "incubator.stats.mentors": "pessoas mentoras da comunidade",
  "incubator.stats.raised": "angariados por quem já passou pelas coortes",
  "incubator.programme.title": "Como <em>funciona</em> o programa.",
  "incubator.mentors.title": "Pessoas <em>mentoras</em> atuais.",
  "incubator.mentors.requestCta": "Pedir sessão",
  "incubator.mentors.empty.title": "O emparelhamento de mentoria está a chegar",
  "incubator.mentors.empty.description":
    "Assim que a bolsa de pessoas mentoras da comunidade estiver ativa, vamos emparelhar-te aqui mesmo com alguém do teu setor.",
  "incubator.step.apply.title": "Candidatura",
  "incubator.step.apply.desc":
    "Uma candidatura curta: a tua ideia, em que fase estás, do que precisas. Não é preciso pitch deck. Decisão em 3 semanas.",
  "incubator.step.apply.meta": "Candidaturas abertas · Prazo 30 jul",
  "incubator.step.match.title": "Emparelhamento com uma pessoa mentora",
  "incubator.step.match.desc":
    "Emparelhamos-te com uma pessoa mentora da comunidade com base no teu setor, na tua fase e naquilo de que nos disseste precisar. Encontram-se quinzenalmente durante seis meses.",
  "incubator.step.match.meta": "Set a fev · Sessões quinzenais",
  "incubator.step.cohort.title": "Sessões de coorte",
  "incubator.step.cohort.desc":
    "Workshops mensais com toda a coorte (jurídico, finanças, angariação de fundos, design) e ainda tempo para apoio entre pares e conversas francas.",
  "incubator.step.cohort.meta": "Primeiro sábado de cada mês",
  "incubator.step.demo.title": "Noite de demonstração",
  "incubator.step.demo.desc":
    "Partilha o que construíste com a comunidade, com quem investe e com a imprensa. Sem pressão e com muito apoio. Tu decides quanto queres revelar.",
  "incubator.step.demo.meta": "Março · Apenas por convite",

  // ── FreelanceTab (grelha de ferramentas) ────────────────────────────────
  "freelance.title": "Ferramentas de <em>trabalho independente.</em>",
  "freelance.sub":
    "Ferramentas práticas para quem trabalha por conta própria em Portugal. Gratuitas, sem registo, e nada do que introduzires sai do teu dispositivo.",
  "freelance.section.documents":
    "Documentos para <em>receberes o teu dinheiro.</em>",
  "freelance.section.numbers": "Conhece os teus <em>números.</em>",
  "freelance.section.together": "Mais força <em>em conjunto.</em>",

  "tool.invoice.title": "Gerador de faturas",
  "tool.invoice.desc":
    "Cria uma fatura-recibo limpa e conforme às regras portuguesas: NIF, opções de IVA, notas sobre a isenção do art. 53.º e a dispensa do art. 101.º-B. Guarda-a como um PDF a sério. Os teus dados ficam memorizados para a próxima vez.",
  "tool.invoice.cta": "Abrir gerador de faturas",
  "tool.contract.title": "Gerador de contratos",
  "tool.contract.desc":
    "Monta, cláusula a cláusula, um contrato de prestação de serviços: âmbito, pagamento, propriedade intelectual, cancelamento, confidencialidade. Descarrega um PDF ou copia o texto para editar.",
  "tool.contract.cta": "Abrir gerador de contratos",
  "tool.scope.title": "Gerador de âmbito e orçamento",
  "tool.scope.desc":
    "Define exatamente o que vais entregar e o que fica de fora, as revisões e os prazos. Acrescenta um preço para o transformar num orçamento. Exporta um PDF que evita a maioria dos conflitos.",
  "tool.scope.cta": "Abrir gerador de âmbito",
  "tool.reciboGuide.title": "Guia de recibos verdes",
  "tool.reciboGuide.desc":
    "Um guia em linguagem simples sobre os impostos de quem trabalha por conta própria em Portugal: abertura de atividade, retenção na fonte, IVA, Segurança Social e o teu primeiro ano.",
  "tool.reciboGuide.cta": "Ler o guia",

  "tool.takeHome.title": "Calculadora de rendimento líquido",
  "tool.takeHome.desc":
    "Converte o teu rendimento bruto como independente naquilo com que realmente ficas, depois de IRS e Segurança Social, com os coeficientes do regime simplificado e as regras dos primeiros anos já incluídos.",
  "tool.takeHome.cta": "Abrir calculadora",
  "tool.dayRate.title": "Calculadora de valor-dia",
  "tool.dayRate.desc":
    "Parte do rendimento de que precisas para chegar a um valor-dia (e por hora) que te sustente a sério, com despesas gerais, dias não pagos e IVA incluídos.",
  "tool.dayRate.cta": "Abrir calculadora",
  "tool.ivaTracker.title": "Rastreador do limiar do IVA",
  "tool.ivaTracker.desc":
    "Acompanha o teu rendimento faturado face ao limite de isenção do art. 53.º (15 000 €), para que ultrapassá-lo nunca te apanhe de surpresa. Guardado no teu dispositivo.",
  "tool.ivaTracker.cta": "Abrir rastreador",
  "tool.setAside.title": "Planeador de reserva fiscal",
  "tool.setAside.desc":
    "Calcula que fatia de cada fatura deves pôr de lado agora e mantém um mealheiro acumulado, para que as contas do IRS e da Segurança Social nunca te apanhem de surpresa.",
  "tool.setAside.cta": "Abrir planeador",
  "tool.comparator.title": "Conta própria vs. conta de outrem",
  "tool.comparator.desc":
    "Compara o que realmente ficarias a ganhar a trabalhar por conta própria face a um salário equivalente, líquido com líquido, com os custos que um recibo de vencimento esconde.",
  "tool.comparator.cta": "Comparar",

  "tool.rateBoard.title": "Quadro de transparência de valores",
  "tool.rateBoard.desc":
    "Um quadro de valores privado no teu dispositivo. Acrescenta os teus valores, vê a distribuição por função e experiência, e vê como te posicionas.",
  "tool.rateBoard.cta": "Abrir o quadro",
  "tool.slidingScale.title": "Cartão de preços em escala móvel",
  "tool.slidingScale.desc":
    "Publica uma escala móvel para que cada pessoa pague conforme os seus meios e tu continues a receber de forma justa. Cria um cartão e exporta-o para partilhar.",
  "tool.slidingScale.cta": "Criar um cartão",

  // ── SalaryTab ───────────────────────────────────────────────────────────
  "salary.title": "Transparência <em>salarial.</em>",
  "salary.sub":
    "Salários anónimos, para que ninguém entre numa negociação sem saber o valor de mercado.",
  "salary.submitCta": "+ Submeter o teu",
  "salary.filter.all": "Todos os setores",
  "salary.filter.tech": "Tecnologia",
  "salary.filter.design": "Design",
  "salary.filter.creative": "Criativo",
  "salary.filter.ngo": "ONG / sem fins lucrativos",
  "salary.filter.law": "Direito",
  "salary.table.role": "Função",
  "salary.table.annual": "Anual (bruto)",
  "salary.table.experience": "Experiência",
  "salary.table.type": "Tipo",
  "salary.empty.title": "Ainda sem entradas neste setor",
  "salary.empty.description":
    "Ainda não há nada partilhado para este setor. Limpa o filtro para ver todas as submissões, ou junta a tua para ajudar a próxima pessoa a negociar.",
  "salary.empty.clear": "Limpar filtros",
  "salary.emptyLive.title": "O quadro de salários está a chegar",
  "salary.emptyLive.description":
    "Sê a primeira pessoa a adicionar um salário anónimo e ajuda a próxima pessoa a chegar preparada à negociação.",
  "salary.disclaimer":
    "Todas as entradas são anónimas. Não guardamos nome, email nem entidade empregadora. As entradas são revistas por uma pessoa moderadora antes de aparecerem.",
  "salary.helpBody":
    "Partilha o que ganhas e ajuda a comunidade. Quantas mais entradas, mais útil isto se torna para todas as pessoas, sobretudo para quem está a começar a negociar.",
  "salary.submitLong": "Submeter o teu salário",
  "salary.submitToast": "Submetido de forma anónima. Agradecemos",

  // ── WorkHubPage ─────────────────────────────────────────────────────────
  "workHub.eyebrow": "O teu espaço de trabalho",
  "workHub.title": "O teu trabalho, <em>{name}.</em>",
  "workHub.status.live": "Tudo sobre o teu trabalho, num só lugar.",
  "workHub.section.needsYou": "O que precisa de ti",
  "workHub.section.whereThingsStand": "Como estão as coisas",
  "workHub.section.profile": "O teu perfil de trabalho",
  "workHub.emptyLive.title":
    "O teu espaço de trabalho está pronto quando quiseres",
  "workHub.emptyLive.description":
    "Candidata-te a uma vaga, encontra uma pessoa mentora ou guarda uma oferta e tudo fica reunido aqui. Candidaturas, subsídios, saberes e avaliações numa só vista.",
  "workHub.emptyLive.cta": "Ver vagas",

  // ── work.data.tsx (linha de estado + próximas ações + cartões de estado) ─
  "workHub.statusLine.apps_one": "{count} candidatura ativa",
  "workHub.statusLine.apps_other": "{count} candidaturas ativas",
  "workHub.statusLine.offers": "{count} proposta à espera de resposta",
  "workHub.statusLine.noOffers": "ainda sem propostas",
  "workHub.statusLine.mentorThreads": "2 conversas de mentoria",

  "workHub.next.offer.label": "Responde à tua proposta de {company}",
  "workHub.next.offer.context": "Estão à espera da tua decisão.",
  "workHub.next.offer.urgency": "Fecha em {days} dias",
  "workHub.next.offer.cta": "Rever proposta",
  "workHub.next.mentor.label":
    "{name} respondeu sobre o teu emparelhamento de mentoria",
  "workHub.next.mentor.context":
    "Há uma primeira chamada de apresentação em cima da mesa.",
  "workHub.next.mentor.cta": "Ler resposta",
  "workHub.next.grant.label":
    "O prazo do microssubsídio acaba esta sexta-feira",
  "workHub.next.grant.context": "{fund} · até {amount}.",
  "workHub.next.grant.urgency": "Prazo sex.",
  "workHub.next.grant.cta": "Ver subsídio",
  "workHub.next.profile.label":
    "O teu perfil de trabalho está {percent}% completo",
  "workHub.next.profile.context":
    "Acrescenta a tua preferência de visibilidade no trabalho para te emparelharmos em segurança.",
  "workHub.next.profile.cta": "Concluir perfil",

  "workHub.card.apps.label": "Candidaturas",
  "workHub.card.apps.primary": "{active} ativas / {sent} enviadas",
  "workHub.card.apps.noOffers": "Ainda sem propostas",
  "workHub.card.apps.trackAll":
    "Acompanha todas as vagas a que te candidataste",
  "workHub.card.apps.viewAll": "Ver todas as candidaturas",
  "workHub.card.mentor.label": "Mentoria",
  "workHub.card.mentor.primary": "1 mentoria ativa",
  "workHub.card.mentor.next": "{count} pessoas mentoras com vagas abertas",
  "workHub.card.saved.label": "Vagas guardadas",
  "workHub.card.saved.primary": "5 vagas guardadas",
  "workHub.card.saved.next": "2 a fechar esta semana",
  "workHub.card.grants.label": "Subsídios e financiamento",
  "workHub.card.grants.primary": "2 prazos este mês",
  "workHub.card.grants.next": "{fund} abre em breve",
  "workHub.card.reviews.label": "Avaliações de empresas",
  "workHub.card.reviews.primary": "Já avaliaste 2",
  "workHub.card.reviews.next": "1 rascunho por terminar",

  // ── WorkProfilePage / WorkProfileCard / WorkProfileSections ────────────
  "workProfile.success.title":
    "O teu perfil de trabalho está <em>definido.</em>",
  "workProfile.success.sub": "As empresas veem-te exatamente como escolheste.",
  "workProfile.success.backCta": "Voltar ao teu espaço de trabalho",
  "workProfile.success.editCta": "Continuar a editar",
  "workProfile.eyebrow": "Perfil de trabalho",
  "workProfile.title": "Como apareces <em>no trabalho.</em>",
  "workProfile.sub":
    "Isto controla o que as empresas veem, e o que fica só contigo. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.saveCta": "Guardar perfil de trabalho",
  "workProfile.savingLabel": "A guardar…",
  "workProfile.savedToast": "Perfil de trabalho guardado",
  "workProfile.saveFailedToast":
    "Não conseguimos guardar. As tuas definições ficaram exatamente como estavam. Tenta outra vez daqui a pouco.",
  "workProfile.saveFailedTitle":
    "Não conseguimos guardar e as tuas definições ficaram como estavam",

  "workProfile.card.meterLabel": "Perfil {percent}% completo",
  "workProfile.card.note":
    "Isto controla como apareces às empresas, e o que fica só contigo.",
  "workProfile.card.editCta": "Editar perfil de trabalho",

  "workProfile.identity.title": "Identidade <em>profissional</em>",
  "workProfile.identity.sub":
    "Como o teu nome e a tua descrição aparecem às empresas.",
  "workProfile.identity.nameInUse": "Nome que usas",
  "workProfile.identity.legalName": "Nome legal",
  "workProfile.identity.legalNameOptional": "mantido privado",
  "workProfile.identity.legalNamePlaceholder": "Só quando exigido por lei",
  "workProfile.identity.legalNameHint":
    "Guardado de forma privada e usado apenas quando a lei o exige.",
  "workProfile.identity.pronouns": "Pronomes",
  "workProfile.identity.pronounsWriteOwn": "Escreve os teus",
  "workProfile.identity.pronounsPlaceholder": "ex.: xe/xem",
  "workProfile.identity.pronounsAdd": "Adicionar",
  "workProfile.identity.pronounsRemoveAria": "Remover {pronoun}",
  "workProfile.identity.headline": "Título profissional",
  "workProfile.identity.location": "Localização",
  "workProfile.identity.bio": "Biografia curta",
  "workProfile.identity.bioPlaceholder":
    "Umas linhas sobre o que fazes e o que procuras…",

  "workProfile.showUp.title": "Como apareces <em>no trabalho</em>",
  "workProfile.showUp.sub":
    "Tu decides o que as empresas veem. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.showUp.outAtWork": "Fora do armário no trabalho",
  "workProfile.showUp.outAtWorkAriaLabel": "Fora do armário no trabalho",
  "workProfile.showUp.transSupport": "Apoio a pessoas trans e não binárias",
  "workProfile.showUp.transSupportOptional": "opcional",
  "workProfile.showUp.matrixLabel": "O que veem as empresas e a comunidade",
  "workProfile.showUp.matrixField": "Campo",
  "workProfile.showUp.matrixEmployers": "Empresas veem",
  "workProfile.showUp.matrixCommunity": "Comunidade vê",
  "workProfile.showUp.safeOnly.label":
    "Mostrar-me apenas a empresas verificadas como seguras pela comunidade",
  "workProfile.showUp.safeOnly.desc":
    "Ignora tudo o que ainda não foi validado pela rede.",

  "workProfile.outAtWork.out.label": "Totalmente fora do armário",
  "workProfile.outAtWork.out.desc":
    "A tua identidade queer fica visível para quem vir o teu perfil de trabalho.",
  "workProfile.outAtWork.verified.label":
    "Fora do armário só para empresas verificadas",
  "workProfile.outAtWork.verified.desc":
    "Só empresas verificadas como seguras pela comunidade veem isto. As restantes veem um perfil neutro.",
  "workProfile.outAtWork.private.label": "Privado",
  "workProfile.outAtWork.private.desc":
    "A tua identidade queer nunca é mostrada às empresas. Tu decides a quem contas, e quando.",

  "workProfile.transSupport.chosenName.label":
    "Candidaturas só com o nome que usas",
  "workProfile.transSupport.chosenName.desc":
    "As candidaturas mostram só o nome que usas.",
  "workProfile.transSupport.hideLegal.label":
    "Não mostrar o meu nome legal às empresas",
  "workProfile.transSupport.hideLegal.desc":
    "Mantido privado e usado apenas quando exigido por lei.",
  "workProfile.transSupport.transitionFriendly.label":
    "Preferir empresas amigas de pessoas em transição",
  "workProfile.transSupport.transitionFriendly.desc":
    "Dá prioridade a empresas com políticas de inclusão trans verificadas.",

  "workProfile.visMatrix.nameInUse": "Nome que usas",
  "workProfile.visMatrix.legalName": "Nome legal",
  "workProfile.visMatrix.pronouns": "Pronomes",
  "workProfile.visMatrix.queerIdentity": "Identidade queer",
  "workProfile.visMatrix.skillsFocus": "Saberes e foco",
  "workProfile.visMatrix.visible": "Visível",
  "workProfile.visMatrix.hidden": "Oculto",
  "workProfile.visMatrix.yourChoice": "A tua escolha",
  "workProfile.visMatrix.perSettingAbove": "Consoante a definição acima",

  "workProfile.skillsFocus.title": "Saberes <em>e foco</em>",
  "workProfile.skillsFocus.sub":
    "Usados para te emparelhar na troca de saberes e com pessoas mentoras.",
  "workProfile.skillsFocus.skills": "Saberes",
  "workProfile.skillsFocus.focusAreas": "Áreas de foco",

  "workProfile.skill.branding": "Identidade de marca",
  "workProfile.skill.backend": "Engenharia backend",
  "workProfile.skill.fundraising": "Angariação de fundos",
  "workProfile.skill.photography": "Fotografia",
  "workProfile.skill.copywriting": "Copywriting",
  "workProfile.skill.product": "Produto",

  "workProfile.focus.careerDirection": "Direção de carreira",
  "workProfile.focus.comingOut": "Assumir-se profissionalmente",
  "workProfile.focus.creativePractice": "Prática criativa",
  "workProfile.focus.startingBusiness": "Começar um negócio",
  "workProfile.focus.difficultWorkplace":
    "Lidar com um ambiente de trabalho difícil",
  "workProfile.focus.mentalHealth": "Saúde mental no trabalho",

  // ── JobsPage (quadro de vagas) ─────────────────────────────────────────
  "jobs.eyebrow": "Quadro de vagas",
  "jobs.title": "Trabalho que <em>não te pede para te esconderes.</em>",
  "jobs.lead":
    "Vagas de negócios geridos por pessoas queer e de entidades empregadoras da comunidade, onde podes ser quem és. Qualquer pessoa da comunidade pode denunciar um anúncio que quebre as nossas regras.",
  "jobs.badge.queerRun": "Gerido por pessoas queer",
  "jobs.postCta": "+ Publicar uma vaga",

  "jobs.filter.all": "Todas as vagas",

  "jobs.fieldGroup.creativeMedia": "Criatividade e media",
  "jobs.fieldGroup.techScience": "Tecnologia e ciência",
  "jobs.fieldGroup.business": "Negócios",
  "jobs.fieldGroup.healthCare": "Saúde e cuidados",
  "jobs.fieldGroup.educationCommunity": "Educação e comunidade",
  "jobs.fieldGroup.foodHospitality": "Restauração, hotelaria e comércio",
  "jobs.fieldGroup.tradesIndustry": "Ofícios, indústria e logística",
  "jobs.fieldGroup.landAnimals": "Terra e animais",
  "jobs.fieldGroup.publicSafety": "Serviço público e segurança",

  "jobs.fieldFilter.groupsLabel": "Filtrar vagas por área",
  "jobs.fieldFilter.fieldsLabel": "Escolher uma área",
  "jobs.fieldFilter.anyField": "Qualquer área",

  "jobs.card.applyBy": "Candidaturas até {date}",
  "jobs.card.deadlineOpen": "Sem prazo",
  "jobs.card.save": "Guardar",
  "jobs.card.saved": "Guardada",
  "jobs.card.saveAriaLabel": "Guardar {title}",
  "jobs.card.unsaveAriaLabel": "Remover {title} das guardadas",
  "jobs.card.savedToast": "{title} guardada",
  "jobs.card.unsavedToast": "{title} removida das guardadas",
  "jobs.card.applyCta": "Candidatar",
  "jobs.card.applyAriaLabel": "Candidatar-me a {title}",

  "jobs.safetyBanner.text":
    "Ajustado ao teu perfil de trabalho, a mostrar <strong>empresas verificadas como seguras</strong>.",
  "jobs.safetyBanner.link": "Alterar no teu perfil de trabalho",
  "jobs.safetyBanner.showVerified": "Mostrar só verificadas",
  "jobs.safetyBanner.showAll": "Mostrar todas",
  "jobs.safetyBanner.showAllCount": "Mostrar todas (mais {count})",

  "jobs.loadError.title": "Não foi possível carregar o quadro de vagas",
  "jobs.loadError.description":
    "As vagas continuam lá. Tenta de novo daqui a um instante.",
  "jobs.empty.title": "Nenhuma vaga corresponde neste momento",
  "jobs.empty.verifiedDescription":
    "Ainda não há nada verificado como seguro nesta categoria. Mostra todas as vagas ou escolhe outra categoria.",
  "jobs.empty.description":
    "Sem vagas nesta categoria de momento. Vê todas as vagas ou volta em breve.",
  "jobs.empty.showAll": "Mostrar todas as vagas",
  "jobs.empty.clearCategory": "Limpar categoria",

  "jobs.loadingMore": "A carregar…",
  "jobs.loadMoreCta": "Carregar mais vagas",
  "jobs.loadMoreError": "Não conseguimos carregar mais vagas.",

  "jobs.employers.title": "Empresas <em>na QueerPulse</em>",
  "jobs.employers.subtitle":
    "Organizações com perfil aqui, as suas vagas abertas e as avaliações da comunidade.",
  "jobs.employers.loadingMore": "A carregar…",
  "jobs.employers.loadMoreCta": "Carregar mais empresas",

  // ── Distintivos de segurança (vocabulário partilhado) ──────────────────
  "safetyBadge.verified.label": "Verificada como segura",
  "safetyBadge.verified.blurb":
    "Cada selo é conquistado. Confirmamos as políticas inclusivas no papel e cruzamo-las com pelo menos três avaliações anónimas de pessoas LGBTQ+ que lá trabalham ou trabalharam. Voltamos a verificar todos os anos.",
  "safetyBadge.trans.label": "Amiga de pessoas trans",
  "safetyBadge.trans.blurb":
    "Prática documentada de inclusão trans: cuidados de saúde de afirmação de género no seguro de saúde, um processo para mudar nome e pronomes e instalações neutras quanto ao género, confirmada por avaliações de quem lá trabalha.",
  "safetyBadge.out.label": "Seguro para te assumires",
  "safetyBadge.out.blurb":
    'A comunidade dá a esta empresa 8+/10 em "seguro para te assumires no trabalho". Aqui, ser quem és é perfeitamente normal.',
  "safetyBadge.affiliation.run.label": "Gerida por pessoas queer",
  "safetyBadge.affiliation.run.blurb":
    "Liderada ou detida por pessoas queer, segundo a própria entidade empregadora.",
  "safetyBadge.affiliation.friendly.label": "Amiga da comunidade queer",
  "safetyBadge.affiliation.friendly.blurb":
    "Uma empresa acolhedora, com políticas inclusivas e uma presença LGBTQ+ real. A liderança e a propriedade estão fora da comunidade queer.",

  // ── jobs.adapters.ts (chrome composto em modo live) ────────────────────
  // O adaptador live tem de emitir chaves, nunca inglês composto, para que
  // demo e live mostrem a mesma frase traduzida.
  "jobs.pay.barterOrDiscuss": "Troca / a combinar",
  "jobs.pay.competitive": "Competitivo",
  "jobs.pay.openToBarter": "Aberto a troca",
  "jobs.pay.toDiscuss": "A combinar",
  "jobs.pay.perHour": "/hora",
  "jobs.pay.perDay": "/dia",
  "jobs.pay.perProject": "/projeto",
  "jobs.pay.perMonth": "/mês",
  "jobs.pay.perYear": "/ano",
  "jobs.posted.on": "Publicada a {date}",
  "jobs.posted.recently": "Publicada recentemente",
  "jobs.qrLabel.inclusive": "Inclusiva",

  // ── JobDetailPage (+ cabeçalho / corpo / barra lateral) ────────────────
  "jobDetail.breadcrumb.jobs": "Vagas",
  "jobDetail.savedToast": "Anúncio guardado no teu perfil.",
  "jobDetail.unsavedToast": "Anúncio removido dos guardados.",
  "jobDetail.chip.applyBy": "Candidaturas até {date}",

  "jobDetail.section.about": "Sobre a vaga",
  "jobDetail.section.dayToDay": "No dia a dia",
  "jobDetail.section.lookingFor": "O que procuramos",
  "jobDetail.section.offer": "O que oferecemos",
  "jobDetail.section.aboutCompany": "Sobre {company}",
  "jobDetail.section.viewCompany": "Ver perfil da empresa",
  "jobDetail.section.safety": "Segurança",
  "jobDetail.section.safetyBody":
    "Como a comunidade avalia {company} nas coisas que importam a profissionais queer.",
  "jobDetail.section.safetyReviews": "Ver avaliações de segurança",

  "jobDetail.sidebar.salary": "Salário",
  "jobDetail.sidebar.type": "Tipo",
  "jobDetail.sidebar.location": "Localização",
  "jobDetail.sidebar.category": "Área",
  "jobDetail.sidebar.profession": "Profissão",
  "jobDetail.sidebar.deadline": "Prazo",
  "jobDetail.sidebar.applyCta": "Candidatar agora",
  "jobDetail.sidebar.shareToCommunityCta": "Partilhar numa comunidade",

  // ── ShareToCommunityModal ───────────────────────────────────────────────
  "shareToCommunity.eyebrow": "Passa a palavra",
  "shareToCommunity.title": "Partilha numa <em>comunidade.</em>",
  "shareToCommunity.ariaLabel": "Partilhar numa comunidade",
  "shareToCommunity.ariaLabelNamed": "Partilhar {title} numa comunidade",
  "shareToCommunity.sub":
    "Publica isto numa das tuas comunidades. Aparece no mural dessa comunidade e no feed, e segue as regras de lá.",
  "shareToCommunity.communityLabel": "Que comunidade",
  "shareToCommunity.communityPlaceholder": "Escolhe uma comunidade",
  "shareToCommunity.noteLabel": "Diz alguma coisa sobre isto",
  "shareToCommunity.notePlaceholder":
    "Porque é que isto pode servir a alguém daqui…",
  "shareToCommunity.defaultNote":
    "Partilho isto caso sirva a alguém daqui: {title} em {organization}.",
  "shareToCommunity.moderationNote":
    "Publicado em teu nome, nessa comunidade. A moderação de lá pode editar ou remover a publicação, como qualquer outra.",
  "shareToCommunity.noCommunities":
    "Ainda não estás em nenhuma comunidade. Junta-te a uma e passas a poder partilhar coisas lá.",
  "shareToCommunity.cancel": "Cancelar",
  "shareToCommunity.shareCta": "Publicar",
  "shareToCommunity.sending": "A publicar…",
  "shareToCommunity.errorNotAllowed":
    "De momento não podes publicar nessa comunidade. Pode estar congelada, arquivada, ou podes já ter saído.",
  "shareToCommunity.errorGone": "Essa comunidade já não existe. Escolhe outra.",
  "shareToCommunity.errorFailed":
    "A tua publicação não foi enviada. Tenta outra vez daqui a um bocado.",
  "shareToCommunity.success.title": "Está",
  "shareToCommunity.success.em": "publicado.",
  "shareToCommunity.success.body":
    "A tua publicação está em <strong>{community}</strong> e no feed.",
  "shareToCommunity.success.closeLabel": "Concluído",
  "jobDetail.report.cta": "Denunciar esta vaga",
  "jobDetail.report.ariaLabel": "Denunciar {name}",

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
  "housing.meta.title":
    "Quadro de habitação LGBTQ+ e colegas de casa em Lisboa",
  "housing.meta.description":
    "Encontra um quarto, uma sublocação ou alguém para partilhar casa em Lisboa no quadro de habitação da QueerPulse. Vê os anúncios, filtra por tipo ou anuncia o teu espaço.",
  "housing.tabs.housing": "Habitação",
  "housing.tabs.flatmates": "Colegas de casa",
  "housing.hero.eyebrow": "Quadro de Habitação · Lisboa",
  "housing.hero.title":
    "Encontra uma casa, e as pessoas com quem <em>a partilhar.</em>",
  "housing.hero.lead":
    "Um quadro de habitação queer em Lisboa. Vê espaços para arrendar ou encontra alguém para partilhar casa com quem possas ser quem és, tudo dentro da rede da comunidade.",
  "housing.hero.note":
    "Cada anúncio e perfil vem de uma pessoa da comunidade QueerPulse",

  "housing.filter.all": "Todos os anúncios",
  "housing.filter.sublet": "Sublocação",
  "housing.filter.room": "Quarto em casa partilhada",
  "housing.filter.short": "Curta duração",
  "housing.filter.studio": "Estúdio / apartamento inteiro",
  "housing.listSpaceCta": "+ Anunciar o teu espaço",
  "housing.loadError.title": "Não foi possível carregar o quadro de habitação",
  "housing.loadError.description":
    "As casas continuam lá. Tenta de novo daqui a um instante.",
  "housing.loadMore": "Ver mais casas",
  "housing.loadingMore": "A carregar mais casas…",
  "housing.filterBar.area": "Bairro",
  "housing.filterBar.areaAny": "Qualquer bairro",
  "housing.filterBar.areaSelected": "{count} selecionados",
  "housing.filterBar.areaClear": "Limpar bairros",
  "housing.filterBar.areaSearch": "Pesquisa bairros",
  "housing.filterBar.price": "Preço (€ / mês)",
  "housing.filterBar.min": "Mín.",
  "housing.filterBar.max": "Máx.",
  "housing.filterBar.priceMin": "Preço mínimo",
  "housing.filterBar.priceMax": "Preço máximo",
  "housing.filterBar.beds": "Quartos",
  "housing.filterBar.bedsAny": "Qualquer",
  "housing.filterBar.bedsStudio": "Estúdio",
  "housing.filterBar.beds1": "1+",
  "housing.filterBar.beds2": "2+",
  "housing.filterBar.beds3": "3+",
  "housing.filterBar.availableBy": "Entrada até",
  "housing.filterBar.bills": "Despesas incluídas",
  // PRD-250. Filtros que faltavam apesar de os dados já existirem.
  "housing.filterBar.furnished": "Mobilado",
  "housing.filterBar.pets": "Aceita animais",
  "housing.filterBar.accessibility": "Com info de acesso",
  "housing.filterBar.verified": "Só verificados",
  "housing.filterBar.flagsLabel": "Tem de ter",
  "housing.filterBar.chip.priceRange": "€{min} a €{max}",
  "housing.filterBar.chip.priceFrom": "A partir de €{min}",
  "housing.filterBar.chip.priceUpTo": "Até €{max}",
  // PRD-250. `depositMax` é o aria-label do campo.
  "housing.filterBar.deposit": "Caução",
  "housing.filterBar.depositMax": "Caução máxima",
  "housing.filterBar.chip.depositUpTo": "Caução até €{max}",
  "housing.filterBar.chip.beds": "{beds} quartos",
  "housing.filterBar.chip.availableBy": "Entrada até {date}",
  "housing.filterBar.typeTitle": "Tipo de anúncio",
  "housing.filterBar.withCount_one": "{label}, {count} anúncio",
  "housing.filterBar.withCount_other": "{label}, {count} anúncios",
  "housing.resultCount_one": "{count} anúncio",
  "housing.resultCount_other": "{count} anúncios",
  "housing.filtersSheetLabel": "Filtrar anúncios",
  "housing.showResultsCta_one": "Ver {count} anúncio",
  "housing.showResultsCta_other": "Ver {count} anúncios",
  "housing.map.count_one": "{count} casa",
  "housing.map.count_other": "{count} casas",
  "housing.map.empty": "Ainda não há casas com estes filtros.",
  "housing.map.jumpToList_one": "Ir para {count} casa",
  "housing.map.jumpToList_other": "Ir para {count} casas",
  "housing.map.sidebar.allHomes": "Todas as casas",
  "housing.map.sidebar.count_one": "<b>{count}</b> casa",
  "housing.map.sidebar.count_other": "<b>{count}</b> casas",
  "housing.map.pinAria_one": "{name}, {count} casa",
  "housing.map.pinAria_other": "{name}, {count} casas",
  "housing.map.clusterAria_one": "{count} bairro aqui, ampliar",
  "housing.map.clusterAria_other": "{count} bairros aqui, ampliar",
  "housing.map.viewList": "Lista",
  "housing.map.viewMap": "Mapa",
  "housing.saveSearch.cta": "Guardar esta pesquisa",
  "housing.saveSearch.namePlaceholder": "Dá um nome a esta pesquisa",
  "housing.saveSearch.nameLabel": "Nome desta pesquisa guardada",
  "housing.saveSearch.save": "Guardar",
  "housing.saveSearch.cancel": "Cancelar",
  "housing.saveSearch.saved":
    "Pesquisa guardada. Avisamos-te quando aparecer uma casa assim.",
  "housing.saveSearch.error":
    "Não deu para guardar essa pesquisa. Tenta outra vez daqui a pouco.",
  "housing.saveSearch.errorTitle": "Não conseguimos guardar essa pesquisa",
  "housing.saveSearch.cause.limit":
    "Chegaste ao limite de pesquisas guardadas. Elimina uma de que já não precises e guarda esta a seguir.",
  "housing.savedSearches.title": "As tuas pesquisas guardadas",
  "housing.savedSearches.alertsOn": "Alertas ativos",
  "housing.savedSearches.remove": "Remover pesquisa guardada {name}",
  "housing.savedSearches.removed": "Pesquisa guardada removida",

  "housing.empty.filteredTitle": "Sem anúncios deste tipo neste momento",
  "housing.empty.title": "O quadro de habitação está parado neste momento",
  "housing.empty.filteredDescription":
    "Ainda não há nada publicado nesta categoria. Limpa o filtro para veres todos os espaços que a comunidade tem disponíveis. Há anúncios novos com frequência.",
  "housing.empty.description":
    "Ainda não há espaços publicados. Quando as pessoas partilharem sublocações, quartos em casas partilhadas e estadias de curta duração, vão aparecer aqui. Volta em breve ou anuncia o teu próprio espaço.",
  "housing.empty.clearFilters": "Limpar filtros",
  "housing.empty.listSpace": "Anunciar um espaço",
  "housing.listing.photoAlt": "Foto · {hood}",
  "housing.listing.from": "A partir de {date}",
  "housing.card.saveAriaLabel": "Guardar {title}",
  "housing.card.unsaveAriaLabel": "Remover {title} das casas guardadas",
  "housing.card.savedToast": "Guardaste {title}",
  "housing.card.unsavedToast": "Removeste {title} das casas guardadas",

  "housing.landlords.heading":
    "Pessoas senhorias <em>com recomendação da comunidade</em>",
  "housing.landlords.subtitle":
    "A comunidade deu um voto de confiança a estas pessoas senhorias: queer-friendly, fiáveis e justas. Não é uma garantia, por isso faz sempre as tuas próprias verificações.",
  "housing.landlords.endorsedBadge": "Recomendação da comunidade",
  "housing.landlords.suggestCta": "Sugerir uma pessoa senhoria",
  "housing.landlords.emptyTitle": "Ainda não há pessoas senhorias recomendadas",
  "housing.landlords.emptyBody":
    "Sê a primeira pessoa a falar-nos de uma pessoa senhoria a quem darias um voto de confiança: queer-friendly, fiável e justa.",

  "housing.tipsHeading":
    "Habitação em Lisboa, <em>o que precisas de saber</em>",
  "housing.tip.budget.title": "Prepara-te para um mercado competitivo",
  "housing.tip.budget.text":
    "O mercado de arrendamento em Lisboa é competitivo e tudo acontece depressa. Tem os documentos prontos: NIF, comprovativo de rendimentos ou fiança, e uma mensagem de apresentação.",
  "housing.tip.board.title": "Usa o quadro da comunidade",
  "housing.tip.board.text":
    "Vê o quadro da QueerPulse ou publica um perfil de colega de casa a dizer onde procuras, para a comunidade te poder encontrar.",
  "housing.tip.rights.title": "Conhece os teus direitos no arrendamento",
  "housing.tip.rights.text":
    "A lei do arrendamento em Portugal é razoavelmente protetora. Precisas de um contrato escrito. A pessoa senhoria não te pode despejar sem o pré-aviso legal. A ILGA Portugal pode aconselhar-te se enfrentares discriminação.",
  "housing.tip.shortTerm.title": "Começar por algo temporário está bem",
  "housing.tip.shortTerm.text":
    "Não faz mal nenhum chegar com uma sublocação de 2 a 3 meses e procurar casa a longo prazo quando já conheceres melhor a cidade.",
  "housing.tip.gut.title": "Confia no teu instinto nas visitas",
  "housing.tip.gut.text":
    "Conhece a pessoa senhoria antes de assinar. Pergunta quem mais lá vive. Um mau pressentimento vale mais do que um bom preço.",
  "housing.tip.emergency.title":
    "Em caso de emergência, pede ajuda à comunidade",
  "housing.tip.emergency.text":
    "Se ficares de repente sem casa ou se onde vives não for seguro, podes pedir ajuda no fórum. Se estiveres em perigo imediato, liga para o 112.",

  "housing.subpages.eyebrow": "Habitação",
  "housing.subpages.title": "Mais sobre habitação",
  "housing.subpages.coop.label": "Cooperativa de Habitação",
  "housing.subpages.coop.blurb":
    "Pessoas a comprar e gerir casas em conjunto, como se formam as cooperativas, e como te podes juntar a uma.",

  "housing.outro.title": "Encontrar casa <em>em conjunto.</em>",
  "housing.outro.sub":
    "Cada anúncio aqui vem de alguém da comunidade. Anuncia o teu espaço, ou publica o que procuras.",
  "housing.outro.listCta": "Anunciar o teu espaço",
  "housing.outro.askForum": "Perguntar no fórum",

  // ── HousingModals (mensagem à pessoa anunciante / recomendar) ──────────
  "housingModal.charsToSubmit_one": "Falta {count} carácter para submeter",
  "housingModal.charsToSubmit_other": "Faltam {count} caracteres para submeter",
  "housingModal.charsCount_one": "{count} carácter",
  "housingModal.charsCount_other": "{count} caracteres",
  "housingModal.cancel": "Cancelar",
  "housingModal.done": "Concluído",
  // PRD-245. Igual a `marketing:directory.detail.enquiry.openThreadCta`.
  "housingModal.message.openThreadCta": "Abrir a conversa",

  "housingModal.message.ariaLabel": "Enviar mensagem a quem anunciou",
  "housingModal.message.successTitle": "Mensagem",
  "housingModal.message.successEm": "enviada",
  "housingModal.message.successBody":
    "A tua mensagem está a caminho de <strong>{toName}</strong>, que costuma responder <strong>{responseTime}</strong>. Vais receber aqui uma notificação quando o fizer. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "housingModal.message.successBodyNoReplyTime":
    "A tua mensagem está a caminho de <strong>{toName}</strong>. Vais receber aqui uma notificação quando responder. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "housingModal.message.unavailable":
    "Esta casa já não está no quadro, por isso a tua mensagem não foi enviada.",
  "housingModal.message.body":
    "Sobre <strong>{listingTitle}</strong>. Sê natural: uma frase sobre quem és e porque é que esta casa te serve já ajuda muito. O teu perfil é partilhado com a mensagem.",
  "housingModal.message.note":
    "Para tua segurança, mantém a conversa dentro da QueerPulse até se terem conhecido pessoalmente. Nunca transfiras a caução antes de visitares a casa.",
  "housingModal.message.error":
    "A tua mensagem não foi enviada. Verifica a ligação e tenta novamente.",
  "housingModal.message.draftNamed":
    'Olá, {name}! Tenho interesse em "{listingTitle}". Ainda está disponível? Um pouco sobre mim: ',
  "housingModal.message.draftGeneric":
    'Olá! Tenho interesse em "{listingTitle}". Ainda está disponível? Um pouco sobre mim: ',

  "housingModal.recommend.ariaLabel": "Recomendar uma pessoa senhoria",
  "housingModal.recommend.successTitle": "Agradecemos. <em>Registada.</em>",
  "housingModal.recommend.successBody":
    "A tua recomendação para <strong>{landlordName}</strong> vai aparecer assim que a moderação confirmar que esta pessoa te arrendou casa. É assim que o quadro continua a ser de confiança. É este tipo de gesto que torna a mudança de casa de alguém muito mais segura.",
  "housingModal.recommend.eyebrow": "Recomendar uma pessoa senhoria",
  "housingModal.recommend.title": "Recomendar <em>{landlordName}</em>",
  "housingModal.recommend.body":
    "Esta pessoa arrendou-te casa e correu bem. Conta a outras pessoas da comunidade o que podem esperar: os pormenores concretos e úteis que gostavas de ter sabido antes.",
  "housingModal.recommend.ratingLabel": "A tua avaliação",
  "housingModal.recommend.starAriaLabel_one": "{count} estrela",
  "housingModal.recommend.starAriaLabel_other": "{count} estrelas",
  "housingModal.recommend.whatShouldKnow":
    "O que devem saber as outras pessoas?",
  "housingModal.recommend.placeholder":
    "Como correram as reparações, o contrato, a caução? Respeitaram a tua privacidade e as tuas relações? Os pormenores ajudam.",
  // PRD-249. A declaração de arrendamento, obrigatória em recomendações novas.
  "housingModal.recommend.attestLabel":
    "{landlordName} arrendou-me mesmo uma casa.",
  "housingModal.recommend.tenancyLabel":
    "Mais ou menos quando é que esta pessoa te arrendou casa?",
  "housingModal.recommend.tenancyFrom": "De",
  "housingModal.recommend.tenancyTo": "Até",
  "housingModal.recommend.stillRenting": "Ainda vivo numa casa desta pessoa",
  "housingModal.recommend.tenancyHint":
    "O mês chega. Ninguém te está a pedir o dia.",
  "housingModal.recommend.unverifiedNote":
    "Isto vai para uma página pública sobre {landlordName}, uma pessoa real sem conta aqui. Vai ficar marcado como autodeclarado e não verificado, porque a QueerPulse não tem forma de o confirmar, e {landlordName} pode pedir para responder.",
  "housingModal.recommend.note":
    "As recomendações são verificadas antes de aparecerem. Recomenda apenas pessoas que te tenham mesmo arrendado casa.",
  "housingModal.recommend.submit": "Submeter recomendação",
  "housingModal.recommend.error":
    "Não foi possível submeter a tua recomendação. Verifica a ligação e tenta novamente.",
  "housingModal.recommend.errorTitle":
    "Não conseguimos enviar a tua recomendação",

  // ── ListSpaceModal ──────────────────────────────────────────────────────
  "listSpace.type.sublet": "Sublocação",
  "listSpace.type.room": "Quarto em casa partilhada",
  "listSpace.type.short": "Curta duração",
  "listSpace.type.studio": "Estúdio / apartamento inteiro",
  "listSpace.success.title": "Anúncio",
  "listSpace.success.em": "submetido.",
  "listSpace.success.body":
    "Agradecemos teres partilhado <strong>{title}</strong>. A moderação verifica todos os anúncios antes de ficarem visíveis, para que o quadro continue a ser de confiança para quem procura um sítio seguro para viver.",
  "listSpace.eyebrow": "Quadro de habitação",
  "listSpace.title": "Anuncia o teu <em>espaço.</em>",
  "listSpace.sub":
    "Abre o teu espaço a uma pessoa da comunidade. Conta como é viver lá, junta algumas fotos, e uma pessoa moderadora lê cada anúncio antes de chegar ao quadro.",
  "listSpace.titleLabel": "Título do anúncio *",
  "listSpace.titlePlaceholder":
    "ex.: Quarto soalheiro numa casa partilhada queer",
  "listSpace.areaLabel": "Bairro / zona *",
  "listSpace.areaPlaceholder": "ex.: Arroios, Lisboa",
  "listSpace.rentLabel": "Renda mensal (€) *",
  "listSpace.rentPlaceholder": "ex.: 650",
  // PRD-250. Opcional. Em branco significa "não indicada", e nesse caso a casa
  // fica de fora das pesquisas com limite de caução.
  "listSpace.depositLabel": "Caução (€)",
  "listSpace.depositPlaceholder": "ex.: 900",
  "listSpace.depositHint":
    "Deixa em branco se ainda não definiste uma caução. Quem filtra por caução não vê casas que não indicaram nenhuma.",
  "listSpace.bedroomsLabel": "Quartos",
  "listSpace.bedroomsPlaceholder": "ex.: 1, usa 0 para um estúdio",
  "listSpace.typeLabel": "Tipo de espaço *",
  "listSpace.chooseOne": "Escolhe uma opção…",
  "listSpace.accessLabel": "Acessos e circulação *",
  "listSpace.accessPlaceholder":
    "ex.: Segundo andar, sem elevador, um lance de escadas. Sem degraus lá dentro.",
  "listSpace.photoGuide.title": "Umas boas fotos fazem toda a diferença",
  "listSpace.photoGuide.lit":
    "Fotografa com luz do dia: divisões bem iluminadas parecem honestas e acolhedoras.",
  "listSpace.photoGuide.rooms":
    "Mostra mais do que uma divisão, e também a cozinha e a casa de banho.",
  "listSpace.photoGuide.consent":
    "Deixa de fora os rostos de colegas de casa, a menos que tenham dado autorização.",
  // ── ListSpaceDetailFields + ListSpacePhotoField (LOC-09) ───────────────
  "listSpace.areaHint":
    "Só o bairro. Todas as casas deste quadro ficam em {city}.",
  // PRD-241. A morada, que nenhum formulário recolhia até agora.
  "listSpace.addressLabel": "Morada",
  "listSpace.addressPlaceholder": "ex.: Rua da Escola Politécnica 42",
  "listSpace.addressHint":
    "Opcional e privada. Só a partilhamos com as tuas conexões ou com quem aceitares para uma visita. As outras pessoas só veem o bairro.",
  "listSpace.blurbLabel": "Resumo numa linha",
  "listSpace.blurbPlaceholder":
    "ex.: Um quarto duplo numa casa partilhada queer de quatro pessoas",
  "listSpace.blurbHint":
    "A linha que as pessoas leem no quadro. Se ficar em branco, usamos o início da tua descrição.",
  "listSpace.descriptionLabel": "Sobre esta casa",
  "listSpace.descriptionPlaceholder":
    "Como é o espaço, quem mais lá vive, como é a rua, tudo o que gostarias de saber antes de te mudares.",
  "listSpace.descriptionHint":
    "Algumas frases honestas ajudam mais do que uma lista longa. É isto que as pessoas leem antes de te escreverem.",
  "listSpace.availableLabel": "Disponível a partir de",
  "listSpace.availableHint": "Deixa em branco se o espaço já estiver livre.",
  "listSpace.minStayLabel": "Estadia mínima (meses)",
  "listSpace.minStayPlaceholder": "ex.: 6",
  "listSpace.minStayHint": "Deixa em branco se aceitas qualquer duração.",
  "listSpace.featuresLabel": "O que o espaço tem",
  "listSpace.idealForLabel": "Para quem é indicado",
  "listSpace.idealForHint":
    "Descreve a casa e as questões práticas. Todas as casas aqui estão abertas a toda a comunidade.",
  "listSpace.photos.label": "Fotos",
  "listSpace.photos.hint":
    "Até {max}. A primeira é a foto que as pessoas veem no quadro. Os dados de localização são removidos de cada foto antes de sair do teu dispositivo.",
  "listSpace.photos.add": "Adicionar foto",
  "listSpace.photos.full": "Este anúncio já tem o máximo de fotos",
  "listSpace.photos.cover": "Capa",
  "listSpace.photos.remove": "Remover a foto {position}",
  "listSpace.photos.previewAlt": "Foto {position} do teu anúncio",
  "listSpace.feature.furnished": "Mobilado",
  "listSpace.feature.light": "Luz natural",
  "listSpace.feature.balcony": "Varanda",
  "listSpace.feature.outdoor": "Espaço exterior",
  "listSpace.feature.lift": "Elevador",
  "listSpace.feature.washing": "Máquina de lavar roupa",
  "listSpace.feature.dishwasher": "Máquina de lavar loiça",
  "listSpace.feature.heating": "Aquecimento",
  "listSpace.feature.cooling": "Ar condicionado",
  "listSpace.feature.desk": "Espaço de secretária",
  "listSpace.feature.bathroom": "Casa de banho privativa",
  "listSpace.feature.kitchen": "Cozinha partilhada",
  "listSpace.feature.bike": "Arrumação para bicicletas",
  "listSpace.feature.pets": "Animais bem-vindos",
  "listSpace.feature.quiet": "Rua sossegada",
  "listSpace.ideal.new": "Quem chegou agora a Lisboa",
  "listSpace.ideal.longStay": "Estadias longas",
  "listSpace.ideal.shortStay": "Estadias curtas",
  "listSpace.ideal.wfh": "Teletrabalho",
  "listSpace.ideal.students": "Estudantes",
  "listSpace.ideal.couples": "Casais",
  "listSpace.ideal.pet": "Quem tem um animal",
  "listSpace.ideal.quiet": "Uma casa sossegada",
  "listSpace.ideal.social": "Uma casa sociável",
  "listSpace.ideal.cyclists": "Quem anda de bicicleta",
  "listSpace.tourLabel": "Link de visita virtual",
  "listSpace.tourPlaceholder": "Matterport, um passeio em vídeo no YouTube…",
  "listSpace.tourHint":
    "Opcional, um link https que as pessoas podem abrir para ver antes de visitar.",
  "listSpace.tourError": "Esse link tem de começar por https://",
  "listSpace.billsLabel": "As despesas estão incluídas na renda",
  "listSpace.billsHint":
    "Água, luz, internet, para as pessoas saberem o que pagam.",
  "listSpace.agentLabel": "Estou a anunciar como agente ou agência",
  "listSpace.agentHint":
    "Agentes e agências podem anunciar aqui. Só mostramos um pequeno selo para ficar claro quem está a oferecer o espaço.",
  "listSpace.note":
    "Os anúncios são revistos antes de aparecerem. Nunca peças a caução antes de a pessoa visitar o espaço pessoalmente.",
  "listSpace.submitting": "A submeter…",
  "listSpace.submitCta": "Submeter anúncio",
  "listSpace.error":
    "O teu anúncio não foi submetido. Verifica a ligação e tenta novamente.",
  "listSpace.errorTitle": "Não conseguimos publicar a tua casa",

  // ── MyHousingListingsPage (HSG-1/HSG-3) ─────────────────────────────────
  "myHousingListings.entryLink": "Os meus anúncios",
  "myHousingListings.eyebrow": "Quadro de habitação",
  "myHousingListings.title": "Os meus <em>anúncios.</em>",
  "myHousingListings.sub":
    "Gere aqui tudo o que publicaste no quadro de habitação.",
  "myHousingListings.empty.title": "Ainda não publicaste nenhum anúncio",
  "myHousingListings.empty.description":
    "Quando anunciares um quarto, sublocação ou partilha, aparece aqui para poderes geri-lo.",
  "myHousingListings.empty.cta": "Anunciar o teu espaço",
  "myHousingListings.error.title": "Não foi possível carregar os teus anúncios",
  "myHousingListings.error.body":
    "Algo correu mal do nosso lado. Verifica a ligação e tenta novamente.",
  "myHousingListings.error.retry": "Tentar novamente",
  "myHousingListings.status.review": "Em revisão",
  "myHousingListings.status.question": "Precisa de resposta",
  "myHousingListings.status.live": "No ar",
  "myHousingListings.status.filled": "Ocupado",
  "myHousingListings.status.expired": "Expirado",
  "myHousingListings.status.rejected": "Não publicado",
  "myHousingListings.status.takenDown": "Removido",
  "myHousingListings.decision.question":
    "Uma pessoa moderadora pediu uma alteração",
  "myHousingListings.decision.rejected": "Porque não foi publicado",
  "myHousingListings.decision.takenDown": "Porque foi removido",
  "myHousingListings.decision.questionHint":
    "Resolve isto, edita o anúncio e ele volta para a fila de revisão.",
  "myHousingListings.postedOn": "Publicado a {date}",
  "myHousingListings.expiresOn": "Expira a {date}",
  "myHousingListings.expiredHint":
    "Esta casa saiu do quadro. Prolonga para a voltares a publicar.",
  // PRD-244. O único aviso que chega ANTES de o anúncio expirar.
  "myHousingListings.expiringInDays_one":
    "Expira em {count} dia, prolonga para o manteres no quadro",
  "myHousingListings.expiringInDays_other":
    "Expira em {count} dias, prolonga para o manteres no quadro",
  "myHousingListings.filledHint": "Marcado como ocupado, escondido do quadro",
  "myHousingListings.actions.edit": "Editar",
  "myHousingListings.actions.view": "Ver anúncio",
  "myHousingListings.actions.markFilled": "Marcar como ocupado",
  "myHousingListings.actions.markAvailable": "Marcar como disponível",
  "myHousingListings.actions.extend": "Prolongar",
  "myHousingListings.actions.delete": "Eliminar",
  "myHousingListings.delete.confirmTitle": "Eliminar este anúncio?",
  "myHousingListings.delete.confirmBody":
    "Isto tira-o do quadro de vez e quem tiver o link vê uma página a dizer que já não existe. Avisamos quem tiver uma visita marcada de que foi cancelada. Não é possível desfazer.",
  "myHousingListings.delete.confirmCta": "Eliminar anúncio",
  "myHousingListings.toast.filled":
    "Marcado como ocupado. Avisámos quem tinha uma visita marcada de que foi cancelada.",
  "myHousingListings.toast.available": "Marcado como disponível outra vez",
  "myHousingListings.toast.extended": "Anúncio prolongado",
  "myHousingListings.toast.deleted": "Anúncio eliminado",
  "myHousingListings.toast.updated": "Anúncio atualizado",
  "myHousingListings.toast.error":
    "A alteração não foi guardada. Tenta novamente.",
  "myHousingListings.toast.errorTitle":
    "Não conseguimos atualizar esse anúncio",
  "myHousingListings.toast.deleteErrorTitle":
    "Não conseguimos eliminar esse anúncio",
  "myHousingListings.cause.missing":
    "Este anúncio já não está na tua lista. Pode já ter sido removido. Atualiza a página para veres os teus anúncios atuais.",
  "myHousingListings.edit.eyebrow": "Quadro de habitação",
  "myHousingListings.edit.title": "Edita o teu <em>anúncio.</em>",
  "myHousingListings.edit.sub":
    "As tuas alterações ficam guardadas de imediato e atualizam o anúncio no quadro.",
  "myHousingListings.edit.submitting": "A guardar…",
  "myHousingListings.edit.submitCta": "Guardar alterações",

  // ── SuggestLandlordModal ────────────────────────────────────────────────
  "suggestLandlord.ariaLabel": "Sugerir uma pessoa senhoria",
  "suggestLandlord.eyebrow": "Quadro de habitação",
  "suggestLandlord.title": "Sugerir uma <em>pessoa senhoria.</em>",
  "suggestLandlord.sub":
    "Conheces alguém que arrenda casas queer-friendly e mesmo decentes? Fala-nos dessa pessoa. A moderação confirma tudo antes de a juntar ao quadro.",
  "suggestLandlord.nameLabel": "Nome da pessoa senhoria *",
  "suggestLandlord.namePlaceholder": "ex.: Mariana Sousa",
  "suggestLandlord.hoodLabel": "Bairro",
  "suggestLandlord.hoodPlaceholder": "ex.: Arroios, Lisboa",
  "suggestLandlord.taglineLabel": "Frase de apresentação",
  "suggestLandlord.taglinePlaceholder":
    "ex.: Rendas justas, reparações rápidas",
  "suggestLandlord.noteLabel": "Nota curta para o cartão do quadro",
  "suggestLandlord.notePlaceholder":
    "O que deve a comunidade saber à primeira vista?",
  "suggestLandlord.aboutLabel": "Mais sobre esta pessoa",
  "suggestLandlord.aboutPlaceholder":
    "Como é viver numa casa desta pessoa? Os pormenores ajudam o resto da comunidade.",
  "suggestLandlord.areasLabel": "Onde arrenda",
  "suggestLandlord.areasPlaceholder":
    "Uma zona por linha, ex.:\nArroios\nAnjos\nGraça",
  "suggestLandlord.note":
    "As sugestões são revistas antes de entrarem no quadro. Sugere apenas quem já arrendou casa a ti ou a alguém em quem confias.",
  "suggestLandlord.submitting": "A enviar…",
  "suggestLandlord.submitCta": "Sugerir pessoa senhoria",
  "suggestLandlord.success.title": "Agradecemos.",
  "suggestLandlord.success.em": "Enviado para revisão.",
  "suggestLandlord.success.body":
    "Uma pessoa moderadora vai rever <strong>{name}</strong> antes de a adicionar ao quadro. Avisamos-te se precisarmos de mais alguma coisa.",
  "suggestLandlord.error":
    "Não foi possível enviar, importas-te de tentar outra vez?",
  "suggestLandlord.errorTitle": "Não conseguimos enviar a tua sugestão",

  // ── HousingListingPage (+ secções) ─────────────────────────────────────
  "housingListing.back": "Quadro de habitação",
  "housingListing.section.about": "Sobre este espaço",
  "housingListing.section.features": "Características",
  "housingListing.section.facts": "O essencial",
  "housingListing.section.idealFor": "Ideal para",
  "housingListing.section.accessibility": "Acessos e circulação",
  "housingListing.section.virtualTour": "Visita virtual",
  "housingListing.virtualTour.frameTitle": "Visita virtual desta casa",
  "housingListing.virtualTour.linkNote":
    "Espreita a casa antes de a visitares. Esta visita virtual abre num novo separador.",
  "housingListing.virtualTour.openCta": "Abrir visita virtual",
  "housingGallery.photoAlt": "{title}, foto {index} de {total}",
  "housingGallery.openAt": "Abrir fotos de {title}, foto {index} de {total}",
  "housingGallery.counter": "{index} / {total}",
  "housingGallery.slideAnnouncement": "Foto {index} de {total}, {label}",
  "housingGallery.close": "Fechar fotos",
  "housingGallery.prev": "Foto anterior",
  "housingGallery.next": "Foto seguinte",
  "housingListing.billsIncluded": "Despesas incluídas",
  "housingListing.billsExcluded": "Despesas não incluídas",
  "housingListing.agentBadge.label": "Anúncio de agente",
  "housingListing.agentBadge.tooltip":
    "Anunciado por agente ou agência em nome de quem lá vive. Agentes e agências podem anunciar aqui. Este selo só serve para deixar isso claro.",
  "housingListing.messageCtaArrow": "Enviar mensagem a {name}",
  "housingListing.messageCta": "Enviar mensagem a {name}",
  "housingListing.listedBy": "Anunciado por",

  // ── Verificação de identidade — selos honestos + verificação em degraus ─
  "verification.badge.id.label": "Identidade verificada",
  "verification.badge.id.tooltip":
    "Esta pessoa concluiu uma verificação de identidade externa. Confirma quem é. Não é uma garantia de segurança nem uma recomendação.",
  "verification.badge.phone.label": "Telefone verificado",
  "verification.badge.phone.tooltip":
    "Esta pessoa confirmou um número de telefone. É uma verificação ligeira. Não prova a identidade.",
  // ── Compromisso afirmativo (base LGBTQ+ obrigatória) ───────────────────
  "affirmingPledge.ariaLabel": "O compromisso de habitação afirmativa LGBTQ+",
  "affirmingPledge.title": "Casas que <em>te afirmam</em>",
  "affirmingPledge.sub":
    "Na QueerPulse, todas as casas e todas as pessoas com quem se partilha casa são afirmativas LGBTQ+. É o padrão aqui, para toda a gente. Antes de publicares ou contactares alguém, assume o compromisso.",
  "affirmingPledge.point.affirm":
    "Vou manter as casas e a convivência afirmativas: pessoas trans, não binárias e queer são bem-vindas e respeitadas aqui.",
  "affirmingPledge.point.noHarm":
    "Não vou discriminar, expor ninguém, nem tratar alguém pelo género errado.",
  "affirmingPledge.point.report":
    "Se uma casa ou pessoa aqui quebrar isto, posso denunciar.",
  "affirmingPledge.cancel": "Agora não",
  "affirmingPledge.acceptCta": "Assumir o compromisso",
  "affirmingPledge.accepting": "A guardar…",
  "affirmingPledge.error":
    "Não foi possível guardar o compromisso agora. Tenta de novo.",
  "affirmingPledge.errorTitle": "Não conseguimos guardar o teu compromisso",
  "affirmingBaseline.badge": "Afirmativo LGBTQ+",
  "affirmingBaseline.badgeTooltip":
    "Todas as casas aqui, e todas as pessoas que as partilham, são afirmativas LGBTQ+. É o mínimo exigido em todos os anúncios.",
  "affirmingBaseline.note":
    "Todas as casas aqui, e todas as pessoas que as partilham, são afirmativas LGBTQ+. É o <em>padrão.</em>",
  "affirmingBaseline.detailNote": "Esta é a base para todas as casas aqui.",
  // ── Pedidos de verificação — enviar, acompanhar, recorrer (Fase 2) ─────
  "verification.request.ariaLabel": "Pedir verificação",
  "verification.request.title": "Pedir verificação",
  "verification.request.subForm":
    "Uma pessoa moderadora lê cada pedido à mão, por isso conta-nos um pouco por palavras tuas. Nunca vais ter de enviar documentos.",
  "verification.request.levelLabel": "De que nível precisas?",
  "verification.request.level.phone.hint":
    "Uma verificação leve de que conseguimos contactar-te. Suficiente para a maioria dos anúncios.",
  "verification.request.level.id.hint":
    "Uma verificação mais completa, para os anúncios e funções que a pedem.",
  "verification.request.contextLabel": "Conta-nos um pouco (opcional)",
  "verification.request.contextPlaceholder":
    "Um link para o teu perfil noutro sítio, ou uma conexão em comum que te conheça. O que ajudar uma pessoa moderadora a reconhecer-te.",
  "verification.request.contextHint":
    "As tuas próprias palavras chegam. Uma pessoa moderadora lê isto à mão.",
  "verification.request.submitCta": "Enviar pedido",
  "verification.request.submitting": "A enviar",
  "verification.request.submitError":
    "Não foi possível enviar o teu pedido. Importas-te de tentar de novo?",
  "verification.request.submitErrorTitle":
    "Não conseguimos enviar o teu pedido",
  "verification.request.cause.alreadyOpen":
    "Já tens um pedido de verificação aberto. Volta a abrir esta janela para veres em que ponto está.",
  "verification.request.cancel": "Agora não",
  "verification.request.sub.pending":
    "Uma pessoa moderadora lê os pedidos à mão, por isso isto pode demorar alguns dias. Avisamos-te assim que houver decisão.",
  "verification.request.sub.in_review":
    "Uma pessoa moderadora está a analisar isto agora. Avisamos-te assim que houver decisão.",
  "verification.request.sub.appealing":
    "O teu recurso está com uma pessoa moderadora agora. Avisamos-te assim que houver decisão.",
  "verification.request.sub.rejected":
    "Este pedido precisa de mais um passo antes de podermos subir o teu nível.",
  "verification.request.statusPill.pending": "Enviado",
  "verification.request.statusPill.in_review": "Em análise",
  "verification.request.statusPill.appealing": "Recurso em análise",
  "verification.request.statusPill.rejected": "Precisa de mais um passo",
  "verification.request.appealChip": "Recurso",
  "verification.request.yourNote": "A tua nota",
  "verification.request.moderatorNote": "O que a pessoa moderadora disse",
  "verification.request.withdrawCta": "Retirar pedido",
  "verification.request.withdrawing": "A retirar",
  "verification.request.withdrawnToast": "Pedido retirado.",
  "verification.request.withdrawError":
    "Não foi possível retirar o pedido. Importas-te de tentar de novo?",
  "verification.request.withdrawErrorTitle":
    "Não conseguimos retirar o teu pedido",
  "verification.request.cause.alreadyDecided":
    "A nossa equipa já fez avançar este pedido, por isso já não pode ser retirado. Volta a abrir esta janela para veres em que ponto está.",
  "verification.request.appealCta": "Recorrer desta decisão",
  "verification.request.appealSending": "A enviar recurso",
  "verification.request.appealError":
    "Não foi possível enviar o teu recurso. Importas-te de tentar de novo?",
  "verification.request.appealErrorTitle":
    "Não conseguimos enviar o teu recurso",
  "verification.request.cause.alreadyAppealed":
    "Esta decisão já foi alvo de recurso uma vez, e cada decisão só pode ser contestada uma vez. Começa antes um novo pedido.",
  "verification.request.newRequestCta": "Começar um novo pedido",
  "verification.request.later": "Vejo mais tarde",
  "verification.request.approved.title": "O teu pedido foi",
  "verification.request.approved.em": "aprovado",
  "verification.request.approved.body":
    "Uma pessoa moderadora subiu o teu nível. Já podes tentar de novo.",
  "verification.request.approved.continueCta": "Continuar",
  "housingListing.availableFrom":
    "Disponível a partir de {date} · publicado por uma pessoa verificada da comunidade",
  "housingListing.repliesUsually": "Costuma responder <b>{time}</b>",
  "housingListing.staySafe.title": "Mantém-te em segurança",
  "housingListing.staySafe.body":
    "<b>Nunca pagues a caução antes de visitares a casa pessoalmente.</b> Mantém a conversa dentro da QueerPulse até se terem conhecido. Se algo parecer estranho, a Queer Housing Justice Network pode aconselhar-te.",
  "housingListing.moreOnBoard": "Mais no quadro",
  "housingListing.save": "Guardar",
  "housingListing.saved": "Guardada",
  "housingListing.savedToast": "{title} guardada",
  "housingListing.unsavedToast": "{title} removida das guardadas",
  // Estado de erro de carregamento (não 404): mostra tentar de novo em vez de
  // redirecionar em silêncio.
  "housingListing.error.title": "Não conseguimos carregar este espaço",
  "housingListing.error.body":
    "Algo correu mal do nosso lado. Tenta de novo daqui a um instante.",
  "housingListing.error.retry": "Tentar de novo",

  // PRD-248. Estado de erro de carregamento (não 404): mostra tentar de novo em
  // vez de redirecionar em silêncio para o quadro.
  // PRD-249. O formulário público de direito de resposta, a única superfície
  // escrita para quem não é membro. Nada aqui promete resposta: a plataforma
  // não envia email nenhum.
  "landlordReply.eyebrow": "Direito de resposta",
  "landlordReply.title": "Responde ao que escreveram sobre ti",
  "landlordReply.intro":
    "Alguém te enviou isto porque uma pessoa da QueerPulse escreveu sobre uma casa que lhe arrendaste. As páginas da QueerPulse são só para pessoas da comunidade com voto de confiança, por isso não consegues ler essa página. É através deste formulário que podes responder.",
  "landlordReply.checkNotice":
    "Nada do que escreveres aqui é publicado de imediato. Alguém da equipa lê primeiro e confirma que és a pessoa referida. É por causa desse passo que este formulário existe.",
  "landlordReply.nameLabel": "O teu nome",
  "landlordReply.contactLabel": "Uma forma de te contactarem",
  "landlordReply.contactHint":
    "Um telefone, ou onde for mais fácil encontrar-te. A equipa pode precisar de te perguntar algo antes de publicar.",
  "landlordReply.replyLabel": "O que queres dizer",
  "landlordReply.replyPlaceholder": "A tua resposta, nas tuas palavras.",
  "landlordReply.replyHint":
    "Publicamos isto tal como o escreveres, ao lado do que escreveram sobre ti.",
  "landlordReply.send": "Enviar à equipa",
  "landlordReply.error": "Não foi enviado. Tenta outra vez.",
  "landlordReply.errorTitle": "Não conseguimos enviar a tua resposta",
  "landlordReply.doneTitle": "A equipa recebeu",
  "landlordReply.doneBody":
    "Alguém vai ler isto e confirmar quem és antes de publicar seja o que for. Guarda esta página se quiseres anotar o que enviaste.",
  "landlordPage.error.title": "Não conseguimos carregar este perfil",
  "landlordPage.error.body":
    "Algo correu mal do nosso lado. Tenta de novo daqui a um instante.",
  "landlordPage.error.retry": "Tentar de novo",

  // ── Selo de anúncio verificado (P2.3) ──────────────────────────────────
  "verifiedListing.label": "Anúncio verificado",
  "verifiedListing.tooltip":
    "Quem anuncia tem identidade verificada, este anúncio passou na nossa revisão e não levantou alertas. É uma verificação real. Não chega a ser uma garantia de segurança nem uma recomendação.",

  // ── Pedir uma visita (P2.3) ────────────────────────────────────────────
  "housingViewing.request.cta": "Pedir uma visita",
  "housingViewing.request.myViewingsLink": "As tuas visitas",
  "housingViewing.request.ariaLabel": "Pedir uma visita",
  "housingViewing.request.eyebrow": "Pedir uma visita",
  "housingViewing.request.title": "Vê a casa <em>ao vivo</em> primeiro",
  "housingViewing.request.body":
    "Marca uma visita a <strong>{listingTitle}</strong>, por vídeo ou presencial, antes de se falar em dinheiro. Ver a casa ao vivo é a forma mais segura de saber que é real.",
  "housingViewing.request.modeLabel": "Como preferes ver a casa?",
  "housingViewing.request.video": "Videochamada",
  "housingViewing.request.inPerson": "Presencial",
  "housingViewing.request.slotOne": "Uma hora que te dê jeito",
  "housingViewing.request.slotTwo": "Outra opção (opcional)",
  "housingViewing.request.slotPastError": "Escolhe uma hora no futuro.",
  "housingViewing.request.slotOrderError":
    "A segunda opção tem de ser depois da primeira.",
  "housingViewing.request.noteLabel": "Uma nota para quem anuncia",
  "housingViewing.request.notePlaceholder":
    "Diz olá e menciona o que gostavas de ver ou perguntar.",
  "housingViewing.request.safety":
    "Uma visita por vídeo ou presencial antes de pagares é a melhor forma de evitar uma burla de arrendamento.",
  "housingViewing.request.send": "Enviar pedido de visita",
  "housingViewing.request.error":
    "Não foi possível enviar o pedido. Tenta de novo daqui a pouco.",
  "housingViewing.request.errorTitle":
    "Não conseguimos enviar o pedido de visita",
  "housingViewing.request.cause.alreadyOpen":
    "Já tens um pedido de visita em aberto para esta casa. Vê as tuas visitas para saberes em que ponto está.",
  "housingViewing.request.successTitle": "Visita <em>pedida.</em>",
  "housingViewing.request.successBody":
    "Quem anuncia vai escolher uma hora ou sugerir outra. Vais encontrá-la em As tuas visitas.",
  "housingViewing.request.unavailable":
    "Esta casa já não aceita visitas. Pode ter sido ocupada ou retirada do quadro.",

  // ── As tuas visitas (P2.3) ─────────────────────────────────────────────
  "housingViewing.list.back": "Quadro de habitação",
  "housingViewing.list.title": "As tuas <em>visitas</em>",
  "housingViewing.list.sub":
    "Todas as casas que pediste para visitar e todos os pedidos para visitarem a tua. Aceita uma hora, sugere outra ou deixa uma avaliação depois de se conhecerem.",
  "housingViewing.list.loadError.title":
    "Não foi possível carregar as tuas visitas",
  "housingViewing.list.loadError.description":
    "As tuas visitas continuam lá. Tenta de novo daqui a um instante.",
  "housingViewing.list.empty":
    "Ainda não há visitas. Quando pedires uma a partir de um anúncio, aparece aqui.",
  "housingViewing.list.group.needsResponse": "À tua espera",
  "housingViewing.list.group.upcoming": "Próximas",
  "housingViewing.list.group.past": "Anteriores",
  "housingViewing.list.withLister": "Com {name}",
  "housingViewing.list.fromEnquirer": "De {name}",
  "housingViewing.list.video": "Vídeo",
  "housingViewing.list.inPerson": "Presencial",
  "housingViewing.list.someone": "alguém",
  "housingViewing.list.acceptAt": "Aceitar {time}",
  "housingViewing.list.propose": "Propor outras horas",
  "housingViewing.list.decline": "Recusar",
  "housingViewing.list.waiting": "À espera da resposta de {name}",
  "housingViewing.list.cancel": "Cancelar",
  "housingViewing.list.cancelViewing": "Cancelar visita",
  "housingViewing.cancelConfirm.title": "Cancelar esta visita?",
  "housingViewing.cancelConfirm.bodyAsRequester":
    "{name} recebe uma notificação de que a visita foi cancelada.",
  "housingViewing.cancelConfirm.bodyAsLister":
    "{name} recebe uma notificação de que a visita foi cancelada e deixa de ver a morada exata, a não ser que sejam conexões.",
  "housingViewing.cancelConfirm.confirm": "Cancelar visita",
  "housingViewing.cancelConfirm.keep": "Manter",
  "housingViewing.list.completeAfter":
    "Podes marcá-la como feita depois da visita.",
  "housingViewing.list.withdrawRequest": "Retirar pedido",
  "housingViewing.withdrawConfirm.title": "Retirar este pedido?",
  "housingViewing.withdrawConfirm.body":
    "{name} recebe uma notificação de que retiraste o pedido.",
  "housingViewing.withdrawConfirm.confirm": "Retirar pedido",
  "housingViewing.declineConfirm.title": "Recusar este pedido?",
  "housingViewing.declineConfirm.body":
    "{name} recebe uma notificação de que recusaste o pedido.",
  "housingViewing.declineConfirm.confirm": "Recusar pedido",
  "housingViewing.list.offHint":
    "Esta visita já não vai acontecer. Podes pedir outra hora a partir do anúncio.",
  "housingViewing.list.requestAgain": "Pedir outra hora",
  "housingViewing.list.actionError":
    "Não foi possível concluir. Tenta outra vez.",
  "housingViewing.list.actionErrorTitle":
    "Não conseguimos atualizar esta visita",
  "housingViewing.cause.notYourTurn":
    "Não é a tua vez nesta visita. Espera que a outra pessoa responda e tenta outra vez.",
  "housingViewing.cause.missing":
    "Esta visita já não existe ou a casa saiu do quadro. Atualiza a página para veres o estado atual.",
  "housingViewing.cause.slotTaken":
    "Uma das duas pessoas já tem uma visita marcada a essa hora. Escolhe outra hora.",
  "housingViewing.cause.moved":
    "Esta visita mudou desde que a abriste, por isso essa ação já não se aplica. Atualiza a página para veres em que ponto está.",
  "housingViewing.cause.homeOffBoard":
    "Esta casa saiu do quadro, por isso a visita já não pode avançar.",
  "housingViewing.cause.timePassed":
    "Essa hora já passou. Escolhe uma hora no futuro.",
  "housingViewing.cause.notYetHappened":
    "Podes marcar uma visita como feita depois de passar a hora combinada.",
  "housingViewing.list.markCompleted": "Marcar como feita",
  "housingViewing.list.leaveReview": "Deixar avaliação",
  "housingViewing.status.requested": "Pedida",
  "housingViewing.status.accepted": "Aceite",
  "housingViewing.status.declined": "Recusada",
  "housingViewing.status.cancelled": "Cancelada",
  "housingViewing.status.completed": "Concluída",

  // ── Propor outras horas ────────────────────────────────────────────────
  "housingViewing.propose.ariaLabel": "Propor outras horas",
  "housingViewing.propose.title": "Propor outras horas",
  "housingViewing.propose.body":
    "Sugere uma ou duas horas que te deem mais jeito. A outra pessoa pode aceitar uma.",
  "housingViewing.propose.send": "Enviar novas horas",

  // ── Avaliação cega após uma visita concluída (P2.4) ────────────────────
  "housingViewing.review.ariaLabel": "Deixar avaliação",
  "housingViewing.review.eyebrow": "Depois da visita",
  "housingViewing.review.title": "Como correu com <em>{name}?</em>",
  "housingViewing.review.body":
    "As avaliações são feitas pelas duas partes e às cegas: ninguém vê o que a outra pessoa escreveu até as duas terem escrito, para que nenhuma avaliação influencie a outra.",
  "housingViewing.review.ratingLabel": "A tua classificação",
  "housingViewing.review.whatWasItLike": "Como foi?",
  "housingViewing.review.placeholder":
    "A casa era como descrita? Foi fácil lidar com a pessoa? Detalhes honestos e gentis ajudam quem vier a seguir.",
  "housingViewing.review.blindNote":
    "A tua avaliação fica escondida até a outra pessoa deixar a dela, ou passadas duas semanas, o que vier primeiro.",
  "housingViewing.review.submit": "Enviar avaliação",
  "housingViewing.review.error":
    "Não foi possível enviar a avaliação. Tenta de novo daqui a pouco.",
  "housingViewing.review.errorTitle": "Não conseguimos enviar a tua avaliação",
  "housingViewing.review.cause.notCompleted":
    "A avaliação abre depois de a visita estar marcada como feita e precisa de uma classificação e de algumas palavras. Confirma as duas coisas e tenta outra vez.",
  "housingViewing.review.cause.notParticipant":
    "Só as duas pessoas desta visita a podem avaliar.",
  "housingViewing.review.cause.alreadyReviewed":
    "Já avaliaste esta casa. Só podes deixar uma avaliação por casa, por muitas visitas que faças.",
  "housingViewing.review.successTitle": "Avaliação <em>guardada.</em>",
  "housingViewing.review.successBody":
    "Agradecemos. Fica privada até <strong>{name}</strong> deixar também a avaliação, ou passarem duas semanas.",

  // ── Bloco de avaliações no anúncio (P2.4) ──────────────────────────────
  "housingViewing.reviews.heading": "Avaliações",
  "housingViewing.reviews.empty":
    "Ainda não há avaliações. Aparecem aqui quando pessoas da comunidade visitarem esta casa e partilharem como correu.",
  "housingViewing.reviews.outOf": "de 5",
  "housingViewing.reviews.count_one": "{count} avaliação",
  "housingViewing.reviews.count_other": "{count} avaliações",
  "housingViewing.reviews.anonymous": "Uma pessoa da comunidade",
  "housingViewing.reviews.ratingAria_one": "{count} estrela",
  "housingViewing.reviews.ratingAria_other": "{count} estrelas",

  // ── ReportListingModal ─────────────────────────────────────────────────
  "housingListing.report": "Denunciar",
  "housingListing.reportAriaLabel": "Denunciar {title}",
  "housingListing.reportModal.ariaLabel": "Denunciar",
  "housingListing.reportModal.eyebrow": "Denunciar à nossa equipa",
  "housingListing.reportModal.title": "O que se passa com <em>{title}?</em>",
  "housingListing.reportModal.lead":
    "As denúncias ajudam-nos a manter a QueerPulse fiável. Conta-nos o que se passa: os detalhes ajudam a equipa de revisão. O teu nome nunca é partilhado com quem denuncias.",
  "housingListing.reportModal.concernLabel": "Qual é o motivo?",
  "housingListing.reportModal.reasonMissing": "Escolhe um motivo para enviar",
  "housingListing.reportModal.copyrightRoute.body":
    "As reivindicações de direitos de autor têm um formulário próprio, que pede a obra original e mantém a faixa online até a nossa equipa verificar",
  "housingListing.reportModal.copyrightRoute.cta":
    "Abrir o formulário de reivindicação",
  "housingListing.reportModal.detailLabel": "Conta-nos mais",
  "housingListing.reportModal.detailPlaceholder":
    "O que fez isto parecer inseguro, discriminatório ou pouco fiável? Dá os detalhes que te sentires à vontade para partilhar.",
  "housingListing.reportModal.charsRemaining_one":
    "Falta {count} carácter para submeter",
  "housingListing.reportModal.charsRemaining_other":
    "Faltam {count} carateres para submeter",
  "housingListing.reportModal.charsCount_one": "{count} carácter",
  "housingListing.reportModal.charsCount_other": "{count} carateres",
  "housingListing.reportModal.confidentialNote":
    "As denúncias são confidenciais. As pessoas moderadoras veem o teu nome; a pessoa ou entidade que denuncias nunca o vê. Em caso de emergência, liga primeiro para o <strong>112</strong>.",
  "housingListing.reportModal.cancelCta": "Cancelar",
  "housingListing.reportModal.submitting": "A submeter…",
  "housingListing.reportModal.submitCta": "Submeter denúncia",
  "housingListing.reportModal.success.title": "Denúncia",
  "housingListing.reportModal.success.em": "recebida.",
  "housingListing.reportModal.success.body":
    "Agradecemos. Uma pessoa moderadora vai rever {title}. Podemos contactar-te para pedir mais detalhes, mas nunca partilhamos a tua denúncia com quem denunciaste.",
  "housingListing.reportModal.success.equalityPointer":
    "A discriminação no acesso à habitação também pode ser levada a um organismo nacional de igualdade, não tens de escolher. Denunciá-la aqui ajuda-nos a agir na plataforma.",
  "housingListing.reportModal.doneCta": "Concluído",
  "housingListing.reportModal.error":
    "Não foi possível enviar a tua denúncia: não chegou até nós. Verifica a ligação e tenta novamente.",

  // ── ContactRequestModal (fluxo partilhado de "contactar") ──────────────
  "contactRequest.defaultTitle": "Enviar um",
  "contactRequest.defaultEm": "pedido.",
  "contactRequest.defaultSuccessTitle": "Pedido",
  "contactRequest.defaultSuccessEm": "enviado.",
  "contactRequest.defaultSendLabel": "Enviar pedido",
  "contactRequest.defaultSendingLabel": "A enviar…",
  "contactRequest.defaultSuccessBody":
    "A tua mensagem está a caminho de <strong>{firstName}</strong>. A resposta chega diretamente à tua caixa de entrada aqui. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "contactRequest.messageLabel": "A tua mensagem *",
  "contactRequest.messagePlaceholder":
    "Uma frase sobre quem és e o que procuras já ajuda muito.",
  "contactRequest.charsNeeded_one":
    "Falta mais {count} carácter para dar contexto.",
  "contactRequest.charsNeeded_other":
    "Faltam mais {count} caracteres para dar contexto.",
  "contactRequest.looksGood":
    "Está ótimo. Mantém a conversa aqui até ambas as partes decidirem avançar.",
  "contactRequest.cancel": "Cancelar",
  "contactRequest.done": "Concluído",
  "contactRequest.sendError":
    "Não foi possível enviar. Importas-te de tentar outra vez?",
  "contactRequest.sendErrorTitle": "Não conseguimos enviar a tua mensagem",

  // ── LandlordPage ─────────────────────────────────────────────────────────
  "landlordPage.eyebrow": "Pessoa senhoria recomendada pela comunidade",
  "landlordPage.recommendCta": "Recomendar {name}",
  "landlordPage.recommendCount_one": "{count} recomendação da comunidade",
  "landlordPage.recommendCount_other": "{count} recomendações da comunidade",
  "landlordPage.section.about": "Sobre {name}",
  "landlordPage.section.whereTheyRent": "Onde arrenda",
  "landlordPage.section.recommendations": "Recomendações da comunidade",
  // PRD-249. Uma recomendação é uma avaliação pública e nomeada de uma pessoa
  // real que não tem conta aqui. Passa a estar marcada como declarada pelo
  // próprio e não verificada, e quem é nomeado ganha direito de resposta.
  "landlordPage.rating.selfReported_one":
    "Segundo {count} pessoa da comunidade",
  "landlordPage.rating.selfReported_other":
    "Segundo {count} pessoas da comunidade",
  "landlordPage.rating.attestedOf_one":
    "{count} de {total} diz que viveu aqui.",
  "landlordPage.rating.attestedOf_other":
    "{count} de {total} dizem que viveram aqui.",
  "landlordPage.section.recommendationsNote":
    "São pessoas da comunidade a contar como foi o arrendamento com {name}. A QueerPulse não verificou nenhum destes relatos e {name} não está na QueerPulse.",
  "landlordPage.recommendation.selfAttestedBadge":
    "Autodeclaração, sem verificação",
  "landlordPage.recommendation.noTenancyGiven":
    "Não foram indicadas as datas do arrendamento.",
  "landlordPage.recommendation.reply.heading": "Resposta de {name}",
  "landlordPage.recommendation.reply.askCta": "És {name}? Pede para responder",
  "landlordPage.sidebar.atAGlance": "Resumo",
  "landlordPage.sidebar.rentedFrom": "Já viveste numa casa de {name}?",
  "landlordPage.sidebar.rentedFromBody":
    "A tua recomendação é o que torna esta lista de confiança, e o que torna a mudança de outra pessoa muito mais segura. Demora dois minutos.",
  "landlordPage.sidebar.recommendCta": "Recomendar esta pessoa senhoria",
  "landlordPage.sidebar.howToRent": "Como arrendar uma casa desta pessoa",
  "landlordPage.sidebar.requestIntro": "Pedir uma apresentação",
  "landlordPage.toast.recommended_one":
    "Recomendação submetida, {count} estrela",
  "landlordPage.toast.recommended_other":
    "Recomendação submetida, {count} estrelas",
  "landlordPage.intro.eyebrow": "Habitação · Apresentação",
  "landlordPage.intro.title": "Pedir uma",
  "landlordPage.intro.em": "apresentação.",
  "landlordPage.intro.sub":
    "A equipa de habitação da QueerPulse lê a tua nota e trata da apresentação a {name}. Conta um pouco sobre o que procuras e quando gostarias de te mudar.",
  "landlordPage.intro.preset":
    "Olá {firstName}, encontrei-te através do quadro de habitação da QueerPulse. Procuro casa em ",
  "landlordPage.intro.successTitle": "Apresentação",
  "landlordPage.intro.successEm": "pedida.",
  "landlordPage.intro.successBody":
    "A tua nota está com a equipa de habitação da QueerPulse, que trata das apresentações a <strong>{firstName}</strong>. Vais receber aqui uma notificação assim que a equipa a tiver visto.",
  "landlordPage.intro.sendLabel": "Pedir apresentação",
  "landlordPage.intro.fallbackName": "Uma pessoa da comunidade",
  "landlordPage.save": "Guardar",
  "landlordPage.saved": "Guardado",
  "landlordPage.savedToast": "Guardaste {name}",
  "landlordPage.unsavedToast": "Removeste {name} dos guardados",
  "landlordPage.report": "Denunciar",
  "landlordPage.reportAriaLabel": "Denunciar {name}",

  // ── ModalKit (moldura de modal partilhada + painel de sucesso) ──────────
  "modalKit.close": "Fechar",

  // ── FlatmatesBoard / FlatmatesFilterBar / FlatmateCard ─────────────────
  // Nota de âmbito: nomes de bairros, tags de estilo de vida e campos por
  // perfil (nota, orçamento, data de entrada) são conteúdo fictício deste
  // quadro — mantidos em inglês (ver docs/i18n/extraction-brief.md §1). Só o
  // chrome envolvente (etiquetas, CTAs, estados vazios) é traduzido abaixo.
  "flatmates.filter.show": "Mostrar",
  "flatmates.filter.all": "Todos os perfis",
  "flatmates.filter.seeking": "À procura de um quarto",
  "flatmates.filter.offering": "Com quarto disponível",
  "flatmates.filter.anyNeighbourhood": "Qualquer bairro",
  "flatmates.filter.anyBudget": "Qualquer orçamento",
  "flatmates.filter.budget.upTo700": "Até 700 €",
  "flatmates.filter.budget.700to900": "700 a 900 €",
  "flatmates.filter.budget.900to1100": "900 a 1100 €",
  "flatmates.filter.budget.1100plus": "1100 € ou mais",
  "flatmates.filter.anyMoveIn": "Qualquer data de entrada",
  "flatmates.filter.moveIn.now": "Disponível já",
  "flatmates.filter.moveIn.jul": "Julho",
  "flatmates.filter.moveIn.aug": "Agosto",
  "flatmates.filter.moveIn.flex": "Flexível",
  "flatmates.filter.lifestyle": "Estilo de vida",
  "flatmates.filter.typeTitle": "Tipo de perfil",
  "flatmates.filter.budgetTitle": "Orçamento",
  "flatmates.filter.moveInTitle": "Data de entrada",
  // A filter option's accessible name with its availability count.
  "flatmates.filter.withCount_one": "{label}, {count} perfil",
  "flatmates.filter.withCount_other": "{label}, {count} perfis",
  "flatmates.filtersSheetLabel": "Filtrar colegas de casa",
  "flatmates.showResultsCta_one": "Ver {count} perfil",
  "flatmates.showResultsCta_other": "Ver {count} perfis",

  "flatmates.count_one": "{count} perfil no quadro",
  "flatmates.count_other": "{count} perfis no quadro",
  "flatmates.loadMore": "Ver mais pessoas",
  "flatmates.loadError.title":
    "Não foi possível carregar o quadro de colegas de casa",
  "flatmates.loadError.description":
    "Os perfis continuam lá. Tenta de novo daqui a um instante.",
  "flatmates.loadingMore": "A carregar mais pessoas…",
  "flatmates.postProfileCta": "Publicar o teu perfil",

  "flatmates.empty.title": "O quadro de colegas de casa está calmo por agora",
  "flatmates.empty.description":
    "Ainda não há perfis publicados. Quando as pessoas da comunidade partilharem o que procuram (um quarto, alguém para partilhar casa, um bairro, um orçamento), vão aparecer aqui. Volta em breve ou publica o teu perfil.",
  "flatmates.empty.filteredTitle": "Nenhum perfil corresponde a esses filtros",
  "flatmates.empty.filteredDescription":
    "Ninguém corresponde a essa combinação exata neste momento. Tenta alargar os filtros, ou publica o teu próprio perfil e deixa que a pessoa certa te encontre.",
  "flatmates.empty.clearFilters": "Limpar filtros",

  "flatmates.outro.title": "Uma casa onde <em>pertences.</em>",
  "flatmates.outro.sub":
    "A pessoa certa para partilhar casa pode fazer uma cidade parecer um lar. Não tenhas pressa, confia no teu instinto e conta com a comunidade.",
  "flatmates.outro.askForum": "Perguntar no fórum",

  "flatmates.card.memberSince": "Membro desde {date}",
  "flatmates.card.sayHello": "Dizer olá",
  "flatmates.card.helloSent": "Olá enviado",
  "flatmates.card.sayHelloError":
    "Não foi possível enviar o teu olá. Tenta novamente daqui a pouco.",
  "flatmates.card.sayHelloErrorTitle": "Não conseguimos enviar o teu olá",
  "flatmates.card.matchScore": "{score}% de compatibilidade",
  "flatmates.card.save": "Guardar",
  "flatmates.card.saved": "Guardado",
  "flatmates.card.savedToast": "Perfil de {name} guardado",
  "flatmates.card.unsavedToast": "Perfil de {name} removido dos guardados",
  "flatmates.card.reportAriaLabel": "Denunciar o perfil de {name}",
  "flatmates.card.safeSpaceLabel": "Necessidades de espaço seguro",
  "flatmates.card.householdLabel": "Casa",
  "flatmates.card.whyMatched": "Porque combinam",

  // Fatores explicáveis de compatibilidade — a interface mapeia cada `factor`
  // aqui. As especificidades de espaço seguro são ocultadas pelo backend para
  // quem não tem permissão para as ver.
  "flatmates.reason.budget": "Orçamento compatível",
  "flatmates.reason.neighbourhood": "Mesmo bairro",
  "flatmates.reason.lifestyle": "Estilo de vida em comum",
  "flatmates.reason.timing": "As datas coincidem",
  "flatmates.reason.safeSpace": "Valores de espaço seguro em comum",
  "flatmates.reason.household": "O básico da casa bate certo",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Publicar o teu perfil de colega de casa",
  "postProfileModal.error":
    "Não foi possível guardar o teu perfil. Importas-te de tentar de novo?",
  "postProfileModal.errorTitle": "Não conseguimos guardar o teu perfil",
  "postProfileModal.success.title": "Já estás no <em>quadro.</em>",
  "postProfileModal.success.body":
    "O teu perfil está publicado. As pessoas da comunidade vão contactar-te diretamente. Vai espreitando as tuas mensagens na QueerPulse.",
  "postProfileModal.success.backCta": "Voltar aos perfis",

  "postProfileForm.title": "Publicar o teu perfil",
  "postProfileForm.sub":
    "Demora cerca de dois minutos. O teu perfil fica publicado de imediato e as pessoas contactam-te diretamente, sem algoritmos pelo meio.",
  "postProfileForm.lookingForLabel": "O que procuras?",
  "postProfileForm.seekingDesc":
    "Estás à procura de um quarto num apartamento ou casa",
  "postProfileForm.offeringDesc":
    "Tens um quarto ou casa partilhada para oferecer",
  "postProfileForm.pronounsLabel": "Pronomes (opcional)",
  "postProfileForm.pronounsPlaceholder": "ex.: ela, ele, elu",
  "postProfileForm.pronounsWriteOwn": "Escreve os teus",
  "postProfileForm.pronounsAdd": "Adicionar",
  "postProfileForm.pronounsRemoveAria": "Remover {pronoun}",
  "postProfileForm.neighbourhoodLabel": "Bairro",
  "postProfileForm.neighbourhoodPlaceholder": "Preferência / localização",
  "postProfileForm.anywhereCentral": "Em qualquer zona central",
  "postProfileForm.budgetLabel": "Orçamento / mês (€)",
  "postProfileForm.budgetPlaceholder": "ex.: 750",
  "postProfileForm.moveInLabel": "Disponível / entrada a partir de",
  "postProfileForm.moveInPlaceholder": "Quando?",
  "postProfileForm.moveIn.jul2026": "Julho de 2026",
  "postProfileForm.moveIn.aug2026": "Agosto de 2026",
  "postProfileForm.moveIn.sep2026": "Setembro de 2026",
  "postProfileForm.aboutLabel": "Sobre ti e o que procuras numa casa",
  "postProfileForm.aboutPlaceholder":
    "Conta um pouco sobre ti, o teu ritmo, o teu trabalho, que tipo de casa te faz sentir bem. Não precisas de te vender: fala com honestidade.",
  "postProfileForm.lifestyleTagsLabel": "Tags de estilo de vida",
  "postProfileForm.submitCta": "Publicar perfil",

  // ── Normas da casa (opcional, dados comuns) ─────────────────────────────
  "postProfileForm.householdLabel": "Casa (opcional)",
  "postProfileForm.householdHint":
    "Alguns pontos básicos da vida partilhada, se quiseres que se saibam à partida.",
  "postProfileForm.householdNoPreference": "Sem preferência",
  "postProfileForm.household.smoking": "Fumar",
  "postProfileForm.household.pets": "Animais",
  "postProfileForm.household.guests": "Visitas",
  "postProfileForm.household.cleanliness": "Limpeza",
  "postProfileForm.household.sleepSchedule": "Horário de sono",
  "postProfileForm.household.noise": "Ruído",
  "postProfileForm.household.sharing": "Espaço partilhado vs. privado",

  // ── Identidade e espaço seguro (RGPD Art.9, opcional) ───────────────────
  "postProfileForm.identityLabel": "Identidade e espaço seguro",
  "postProfileForm.identityHint":
    "Tudo opcional. Partilha só o que te ajuda a sentir em casa. Escolhes quem vê e podes retirar tudo quando quiseres.",
  "postProfileForm.consentLabel":
    "Sim, guardem os meus pronomes, género e necessidades de espaço seguro, e mostrem-nos às pessoas que eu escolher abaixo para nos encontrarmos. Tens o controlo: podes apagá-los <em>quando quiseres.</em>",
  "postProfileForm.genderLabel": "Género (opcional)",
  "postProfileForm.genderPlaceholder": "ex.: não-binárie, mulher trans",
  "postProfileForm.safeSpaceLabel": "O que torna uma casa segura",
  "postProfileForm.safeSpaceHint":
    "Escolhe o que te importa. Estas opções descrevem a casa que procuras, e toda a gente continua a ser bem-vinda.",
  // Prompts de casa afirmativos para pessoas trans (Art.9, dentro do consentimento).
  "postProfileForm.identityHousehold.label": "Ser quem és em casa",
  "postProfileForm.identityHousehold.hint":
    "Tudo opcional e visível só para quem escolheres. Partilha o que faria uma casa parecer tua.",
  "postProfileForm.identityHousehold.outAtHome":
    "Estar fora do armário em casa",
  "postProfileForm.identityHousehold.bathroom": "Partilhar casa de banho",
  "postProfileForm.identityHousehold.mailName": "Nome no correio e entregas",
  "postProfileForm.identityHousehold.medication":
    "Privacidade sobre a medicação",

  "postProfileForm.visibilityLabel": "Quem pode ver isto",
  "postProfileForm.visibility.public": "Qualquer pessoa no quadro",
  "postProfileForm.visibility.members": "Qualquer pessoa da comunidade",
  "postProfileForm.visibility.matches": "Só quem deu match comigo",
  "postProfileForm.visibility.hidden": "Só eu",

  // ── CompanyPage (+ Cover / Sidebar / Tabs) ──────────────────────────────
  "company.loadError.title": "Não foi possível carregar esta empresa",
  "company.loadError.description":
    "O perfil continua lá. Tenta de novo daqui a um instante.",
  "company.notFound.title": "Empresa não encontrada",
  "company.notFound.description":
    "Este perfil de empresa não existe ou foi retirado. Explora o quadro de vagas para encontrar empresas geridas por pessoas queer e verificadas como inclusivas.",
  "company.notFound.backCta": "Voltar ao quadro de vagas",

  "company.cover.backCta": "Todas as empresas",
  "company.cover.seeOpenRoles_one": "Ver {count} vaga aberta",
  "company.cover.seeOpenRoles_other": "Ver {count} vagas abertas",
  "company.cover.follow": "Seguir empresa",
  "company.cover.following": "A seguir",
  "company.cover.message": "Enviar mensagem",
  "company.cover.openRoleStat_one": "Vaga aberta",
  "company.cover.openRoleStat_other": "Vagas abertas",
  "company.cover.toast.followed":
    "A seguir {name}. Vais saber quando surgirem novas vagas",
  "company.cover.toast.unfollowed": "Deixaste de seguir {name}",

  "company.sidebar.detailsTitle": "Detalhes do estúdio",
  "company.sidebar.peopleTitle": "Pessoas desta empresa na QueerPulse",
  "company.sidebar.hiringContactTitle": "Contacto de recrutamento",
  "company.sidebar.messagePerson": "Enviar mensagem a {name}",
  "company.sidebar.sendMessage": "Enviar mensagem",
  "company.report.cta": "Denunciar esta empresa",
  "company.report.ariaLabel": "Denunciar {name}",

  "company.tabs.about": "Sobre",
  "company.tabs.jobs": "Vagas",
  "company.tabs.reviews": "Avaliações",
  "company.tabs.work": "Trabalhos",

  "company.jobs.empty.title": "Sem vagas abertas neste momento",
  "company.jobs.empty.description":
    "Esta empresa não está a recrutar na QueerPulse neste momento. Segue-a no topo da página para saberes quando surgir uma vaga.",
  "company.jobs.postRole": "Publicar uma vaga",

  "company.reviews.outOf5_one": "/ 5 · {count} avaliação",
  "company.reviews.outOf5_other": "/ 5 · {count} avaliações",
  "company.reviews.writeReview": "Escrever uma avaliação",
  "company.reviews.loadError.title": "Não foi possível carregar as avaliações",
  "company.reviews.loadError.description":
    "As avaliações continuam lá. Tenta de novo daqui a um instante.",
  "company.reviews.empty.title": "Ainda sem avaliações",
  "company.reviews.empty.description":
    "Já trabalhaste aqui ou com esta empresa? Sê a primeira pessoa a contar à próxima pessoa queer como é mesmo.",
  "company.reviews.starsAriaLabel": "{count} em 5",
  "company.reviews.loadingMore": "A carregar…",
  "company.reviews.loadMoreCta": "Carregar mais avaliações",

  "company.work.intro": "Uma pequena seleção de projetos recentes do estúdio.",

  // ── CompanyReviewModal ──────────────────────────────────────────────────
  // Nota de âmbito: os prefixos compostos do corpo da avaliação ("The good:
  // …", "The hard parts: …") e a byline ("{role} · Rated {stars}/5 · just
  // now") ficam gravados no registo da avaliação, mostrado a quem quer que
  // veja depois, independentemente do idioma — mantidos em inglês
  // deliberadamente, tal como as etiquetas de resposta da candidatura. Só o
  // chrome do próprio modal é traduzido abaixo.
  "companyReview.overallRatingAriaLabel": "Avaliação geral",
  "companyReview.starAriaLabel_one": "{count} estrela",
  "companyReview.starAriaLabel_other": "{count} estrelas",
  "companyReview.success.title": "Avaliação",
  "companyReview.success.em": "publicada.",
  "companyReview.success.body":
    "Agradecemos. A tua avaliação de {companyName} já está publicada. {companyName} não pode editar nem remover o que escreveste.",
  "companyReview.title": "Como é que era <em>na realidade?</em>",
  "companyReview.sub":
    "O teu relato honesto ajuda a próxima pessoa queer a decidir se aceita a entrevista. O teu nome não aparece nela.",
  "companyReview.headlineLabel": "Título",
  "companyReview.headlinePlaceholder": "Resume numa frase",
  "companyReview.roleLabel": "A tua função / antiguidade",
  "companyReview.rolePlaceholder": "ex.: Designer, 2 anos na função",
  "companyReview.prosLabel": "O que funcionou, o lado bom",
  "companyReview.prosPlaceholder":
    "Pronomes respeitados, inclusão real, liderança que percebe do assunto…",
  "companyReview.consLabel": "O que foi difícil, o resto",
  "companyReview.consPlaceholder": "Onde o acompanhamento ficou aquém…",
  "companyReview.missingHint": "Preenche {fields} para desbloquear o botão.",
  "companyReview.missing.company": "uma empresa",
  "companyReview.missing.headline": "um título",
  "companyReview.missing.rating": "uma classificação em estrelas",
  "companyReview.missing.role": "a tua função",
  "companyReview.missing.prosOrCons": "o que funcionou ou o que foi difícil",
  "companyReview.cancel": "Cancelar",
  "companyReview.posting": "A publicar…",
  "companyReview.submitCta": "Publicar avaliação",
  "companyReview.toast.alreadyReviewed": "Já avaliaste esta empresa.",
  "companyReview.toast.error":
    "Não conseguimos publicar a tua avaliação. Tenta novamente.",
  "companyReview.toast.errorTitle": "Não conseguimos publicar a tua avaliação",
  "companyReview.cause.empty":
    "A tua avaliação precisa de uma classificação e de algumas palavras. Confirma as duas coisas e tenta outra vez.",
  "companyReview.cause.ownOrTeam":
    "Não podes avaliar uma empresa que é tua ou em cuja equipa trabalhas.",

  // ── EmployerReviewsPage (+ Card) ─────────────────────────────────────────
  // Nota de âmbito: nomes de empresas, pontuações, citações e o texto/meta de
  // cada avaliação em employerReviews.data.ts são conteúdo fictício — em modo
  // live seriam registos de empresas e avaliações reais. Mantidos em inglês.
  "employerReviews.hero.eyebrow": "Avaliações de empresas",
  "employerReviews.hero.title":
    "O teu local de trabalho é <em>realmente seguro?</em>",
  "employerReviews.hero.lead":
    "Avaliações de empresas, escritas por pessoas da comunidade que lá trabalharam. Para lá do logótipo do Orgulho, como é realmente assumir quem és lá dentro.",

  "employerReviews.how.title": "Como <em>funciona</em>",
  "employerReviews.how.sub":
    "Escritas por pessoas da comunidade, mostradas sem nomes, e as empresas não as podem editar.",
  "employerReviews.how.write.title": "Escreve sem o teu nome",
  "employerReviews.how.write.desc":
    "O teu nome não aparece na tua avaliação. Só quem faz parte da comunidade pode escrever uma, e podes editar a tua mais tarde.",
  "employerReviews.how.rate.title": "Avalia o que importa",
  "employerReviews.how.rate.desc":
    "Segurança para te assumires, sensibilidade da gestão, inclusão trans, capacidade de resposta dos RH, e cultura real vs. valores declarados.",
  "employerReviews.how.help.title": "Ajuda a próxima pessoa",
  "employerReviews.how.help.desc":
    "A tua avaliação ajuda outras pessoas queer a fazer escolhas melhores sobre onde levam o seu talento e quem são por inteiro.",

  "employerReviews.recent.title": "Avaliações <em>recentes</em>",
  "employerReviews.recent.sub":
    "Escritas pela comunidade · mostradas sem nomes",
  "employerReviews.recent.browseCta": "Ver vagas inclusivas para pessoas queer",
  "employerReviews.recent.writeCta": "Escrever uma avaliação",
  "employerReviews.loadError.title": "Não foi possível carregar as empresas",
  "employerReviews.loadError.description":
    "A lista continua lá. Tenta de novo daqui a um instante.",
  "employerReviews.emptyLive.title": "Ainda sem empresas avaliadas",
  "employerReviews.emptyLive.description":
    "Ainda não há avaliações publicadas. Sê a primeira pessoa a partilhar como é realmente trabalhar num sítio.",

  "employerReviews.verify.title": "Como funciona a <em>verificação</em>",
  "employerReviews.verify.verifiedSafe.label": "Verificada como segura",
  "employerReviews.verify.verifiedSafe.desc":
    "Políticas inclusivas confirmadas no papel e depois cruzadas com 3+ avaliações anónimas de quem lá trabalha. Verificação renovada todos os anos.",
  "employerReviews.verify.queerRun.label":
    "Gerida por pessoas queer vs. amiga da comunidade queer",
  "employerReviews.verify.queerRun.desc":
    "Gerida por pessoas queer significa liderada ou detida por pessoas queer. Amiga da comunidade queer é acolhedora mas não liderada pela comunidade. Nunca confundimos as duas coisas.",
  "employerReviews.verify.confidence.label": "Confiança na pontuação",
  "employerReviews.verify.confidence.desc":
    "Cada pontuação mostra em quantas avaliações se baseia. Mais avaliações, mais confiança: um 9 dado por 3 pessoas não vale o mesmo que um 9 dado por 30.",

  "employerReviews.write.title": "Escreve uma <em>avaliação.</em>",
  "employerReviews.write.body":
    "Já lá trabalhaste. Sabes como era na realidade. A tua avaliação ajuda a próxima pessoa queer a decidir se aceita aquela entrevista. Demora poucos minutos e o teu nome não aparece.",
  "employerReviews.write.note":
    "Só para pessoas da comunidade · o teu nome não aparece na tua avaliação",
  "employerReviews.write.rulesTitle": "Os nossos princípios de avaliação",
  "employerReviews.write.rule.anonymous":
    "O teu nome não aparece numa avaliação",
  "employerReviews.write.rule.verifyMembership":
    "Só quem faz parte da QueerPulse pode escrever avaliações",
  "employerReviews.write.rule.noEdit":
    "As empresas não podem editar nem remover avaliações, e podem publicar uma resposta pública",
  "employerReviews.write.rule.moderation":
    "Qualquer avaliação pode ser denunciada à nossa equipa",
  "employerReviews.write.rule.retract":
    "Podes editar a tua avaliação a qualquer momento",
  "employerReviews.write.rule.noBuying":
    "Nenhuma empresa pode comprar uma pontuação mais alta ou destaque",

  "employerReviews.outro.title": "O teu trabalho <em>importa.</em>",
  "employerReviews.outro.sub":
    "Mereces saber onde te estás a meter. Tal como todas as outras pessoas.",
  "employerReviews.outro.cta": "Pedir um convite",

  "employerReviewCard.basedOn_one": "com base em {count} avaliação",
  "employerReviewCard.basedOn_other": "com base em {count} avaliações",
  "employerReviewCard.readAll_one": "Ler a avaliação",
  "employerReviewCard.readAll_other": "Ler todas as {count} avaliações",
  "employerReviewCard.showLess": "Mostrar menos",

  // ── WriteReviewModal (fluxo de avaliação anónima da EmployerReviewsPage) ─
  // Nota de âmbito: tal como no CompanyReviewModal — o texto/meta composto da
  // avaliação é conteúdo gravado mostrado a quem vir depois; mantido em inglês
  // deliberadamente.
  "writeReviewModal.eyebrow": "Escrever uma avaliação · anónima",
  "writeReviewModal.sub":
    "O teu relato honesto ajuda a próxima pessoa queer a decidir se aceita a entrevista. Confirmamos que fazes parte da comunidade e nunca associamos a avaliação ao teu nome.",
  "writeReviewModal.companyLabel": "Empresa",
  "writeReviewModal.roleLabel": "A tua função / equipa",
  "writeReviewModal.rolePlaceholder": "ex.: Engenharia, Design, Operações",
  "writeReviewModal.prosPlaceholder":
    "Pronomes respeitados, cuidados de saúde trans reais, liderança que percebe do assunto…",
  "writeReviewModal.consPlaceholder":
    "Logótipo do Orgulho e mais nada, RH que não sabia como ajudar…",
  "writeReviewModal.success.body":
    "Agradecemos. A tua avaliação anónima de {company} já está publicada. O teu nome nunca fica guardado com ela e a {company} não pode editar nem remover o que escreveste.",

  // ── JobApplyPage (+ cabeçalho / formulário / barra lateral) ────────────
  "jobApply.backToJob": "Voltar à vaga",
  "jobApply.backToJobs": "Voltar às vagas",
  "jobApply.header.eyebrow": "Candidatura · {title}",
  "jobApply.header.title": "Conta à <em>{org}</em> quem és.",
  "jobApply.header.closes": "Fecha a {date}",
  "jobApply.header.progressLabel": "Candidatura completa",

  "jobApply.aboutYouTitle": "Sobre ti",
  "jobApply.aboutYouSub":
    "Preenchemos o que conseguimos a partir do teu perfil. Edita o que tiver mudado.",
  "jobApply.fullName": "Nome completo",
  "jobApply.pronouns": "Pronomes",
  "jobApply.pronounsHelper": "Visíveis para a equipa de recrutamento.",
  "jobApply.email": "Email",
  "jobApply.location": "Onde vives?",

  "jobApply.yourWorkTitle": "O teu trabalho",
  "jobApply.yourWorkSub":
    "Um CV é ótimo. Um portefólio é melhor. Envia os dois se puderes.",
  "jobApply.cv": "CV ou currículo",
  "jobApply.cvDrop": "Arrasta o PDF para aqui ou clica para escolher",
  "jobApply.cvHint": "Máx. 5 MB · PDF / DOCX",
  "jobApply.browse": "Procurar",
  "jobApply.portfolio": "Ligações do portefólio",
  "jobApply.portfolioHelper":
    "O teu perfil QueerPulse é anexado automaticamente. Se não quiseres, desmarca em Privacidade.",
  "jobApply.sitePlaceholder": "O teu site ou Are.na",
  "jobApply.identityIg": "IG",
  "jobApply.instagramPlaceholder": "@teuhandle",
  "jobApply.identityQp": "QP",

  "jobApply.whyTitle": "Porquê esta vaga?",
  "jobApply.whySub":
    "Não precisas de mais do que dois parágrafos curtos. Vai ao concreto: o que te atrai na {org} e o que podes trazer.",
  "jobApply.coverNote": "Nota de apresentação",
  "jobApply.charCount": "{used} / {max}",
  "jobApply.coverPlaceholder":
    "O que te atraiu nesta vaga? O que fazes bem? Em que gostavas de crescer?",
  "jobApply.availableFrom": "Disponível a partir de",
  "jobApply.salaryExpectation": "Expectativa salarial",
  "jobApply.salaryHelper":
    "O intervalo publicado é {salary}. Podes indicar um valor fora deste intervalo, que vai ser tido em conta.",
  "jobApply.salaryPlaceholder": "ex.: 1400 €/mês, ou em aberto",

  "jobApply.extraTitle": "Mais alguma coisa",
  "jobApply.extraOptional": " (opcional)",
  "jobApply.extraSub":
    "Há mais alguma coisa que queiras que a {org} saiba? Horário, necessidades de acesso, referências, o que for relevante.",
  "jobApply.extraLabel": "Notas para a equipa de recrutamento",
  "jobApply.extraPlaceholder":
    "Preferia terças e quintas-feiras no escritório para conseguir ir buscar o meu filho à escola…",

  "jobApply.draftSavedJustNow": "Rascunho guardado · agora mesmo",
  "jobApply.saveDraft": "Guardar rascunho",
  "jobApply.sending": "A enviar…",
  "jobApply.sendCta": "Enviar candidatura",

  "jobApply.sidebar.closes": "Fecha a <b>{date}</b>",
  "jobApply.sidebar.tipsTitle": "Antes de enviares",

  "jobApply.success.title": "A tua candidatura está a caminho de",
  "jobApply.success.closeLabel": "Acompanhar a tua candidatura",
  "jobApply.success.step1":
    "A {org} vai ver o teu perfil QueerPulse e tudo o que anexaste.",
  "jobApply.success.step2":
    "Vais receber uma notificação assim que responderem.",
  "jobApply.success.step3":
    "Podes acompanhá-la na página das tuas candidaturas.",
  "jobApply.success.footerCta": "Voltar a todas as vagas",
  "jobApply.success.body":
    "Enviada à {org} para a vaga de {title}. Por agora não tens de fazer mais nada: a bola está do lado de lá.",

  "jobApply.toast.draftSaved": "Rascunho guardado, retomas quando quiseres.",
  "jobApply.error.missingFields":
    "Adiciona o teu nome e email antes de enviares.",
  "jobApply.error.alreadyApplied":
    "Já te candidataste a esta vaga. Consulta as tuas candidaturas.",
  "jobApply.error.generic":
    "Não conseguimos enviar a tua candidatura. Tenta novamente.",
  "jobApply.error.genericTitle": "Não conseguimos enviar a tua candidatura",

  "jobApply.availability.now.title": "Imediatamente",
  "jobApply.availability.now.desc": "Disponível já",
  "jobApply.availability.soon.title": "Em 2 a 4 semanas",
  "jobApply.availability.soon.desc": "Período de aviso prévio",
  "jobApply.availability.later.title": "Em 1 a 3 meses",
  "jobApply.availability.later.desc": "A terminar compromissos",

  "jobApply.tip.autocorrect":
    "Revê bem a tua nota de apresentação, o corretor automático adora reescrever “queer”.",
  "jobApply.tip.profileLink":
    "Basta o link do teu perfil QueerPulse. Vão ver o teu trabalho.",
  "jobApply.tip.replyTime":
    "Podes guardar um rascunho e voltar a ele antes de enviar.",
  "jobApply.tip.fixedComp":
    "A remuneração indicada é a que a entidade empregadora publicou.",

  // ── BarterPage (+ Card / PostStrip) ─────────────────────────────────────
  "barter.hero.eyebrow": "Troca de competências queer",
  "barter.hero.title": "Troca aquilo que <em>sabes.</em>",
  "barter.hero.lead":
    "Uma bolsa de trocas estruturada, competências por competências, saber por saber. Sem dinheiro, sem comissões da plataforma. Publica o que podes oferecer e o que esperas receber em troca.",
  "barter.principle.noMoney.title": "Sem dinheiro",
  "barter.principle.noMoney.body":
    "Cada troca é entre pessoas. O valor é definido entre quem participa.",
  "barter.principle.reputation.title": "Entre pessoas da comunidade",
  "barter.principle.reputation.body":
    "As ofertas vêm de pessoas da comunidade QueerPulse.",
  "barter.principle.wants.title": "O que precisas também conta",
  "barter.principle.wants.body":
    "Publica o que procuras, tanto como o que podes dar. Precisar é tão bem-vindo como oferecer.",

  "barter.search.placeholder": "Pesquisa nas trocas…",
  "barter.mode.all": "Todas",
  "barter.mode.offering": "A oferecer",
  "barter.mode.seeking": "À procura",
  "barter.count_one": "<b>{count}</b> publicação",
  "barter.count_other": "<b>{count}</b> publicações",

  "barter.cat.all": "Todas as categorias",
  "barter.cat.creative": "Criatividade",
  "barter.cat.tech": "Tecnologia",
  "barter.cat.legal": "Jurídico e administrativo",
  "barter.cat.care": "Cuidado e saúde",
  "barter.cat.food": "Comida e hospitalidade",
  "barter.cat.body": "Corpo e movimento",
  "barter.cat.fallback": "Troca de competências",

  "barter.badge.offering": "A oferecer",
  "barter.badge.seeking": "À procura",
  "barter.badge.both": "A oferecer e à procura",

  "barter.card.offeringLabel": "A oferecer",
  "barter.card.wantLabel": "À procura de",
  "barter.card.proposeCta": "Propor uma troca",
  "barter.card.yoursCta": "A tua troca",
  "barter.toast.messageSent": "Mensagem enviada a {name}",
  "barter.postedToday": "Hoje",
  "barter.postedDaysAgo_one": "há {count} dia",
  "barter.postedDaysAgo_other": "há {count} dias",

  "barter.emptyLive.title": "Ainda não há trocas publicadas",
  "barter.emptyLive.description":
    "Sê a primeira pessoa a oferecer uma competência ou um objeto. Põe algo em cima da mesa aqui em baixo e deixa que a troca certa te encontre.",
  "barter.errorLive.title": "A bolsa de trocas não carregou",
  "barter.errorLive.description":
    "Correu algo mal do nosso lado ao ir buscar o quadro. Tenta outra vez daqui a um bocado.",
  "barter.errorLive.retry": "Tentar outra vez",
  "barter.empty.title": "Nada corresponde aos teus filtros",
  "barter.empty.description":
    "Ainda não há trocas que encaixem nessa combinação. Tenta alargar a pesquisa, ou publica o que tens para oferecer e deixa que a troca certa te encontre.",
  "barter.empty.clearFilters": "Limpar filtros",

  "barter.postStrip.success.title": "Está <em>em cima da mesa.</em>",
  "barter.postStrip.success.body":
    "A tua troca já está no topo do quadro. Avisamos-te quando alguém propuser uma troca.",
  "barter.postStrip.success.postAnother": "Publicar outra",
  "barter.postStrip.title": "Põe algo <em>em cima da mesa.</em>",
  "barter.postStrip.body":
    "Cada troca começa com uma publicação. Diz à comunidade o que podes oferecer e o que esperas receber em troca.",
  "barter.postStrip.offerPlaceholder":
    "Posso oferecer, ex.: aulas de português, design de logótipo…",
  "barter.postStrip.wantPlaceholder":
    "Procuro, ex.: ajuda com impostos, ajuda numa mudança…",
  "barter.postStrip.categoryLabel": "Categoria",
  "barter.postStrip.categoryPlaceholder": "Escolhe uma categoria",
  "barter.postStrip.submitCta": "Publicar na bolsa de trocas",
  "barter.postStrip.submitting": "A publicar…",
  "barter.postStrip.errorInvalid":
    "Confirma as duas linhas e a categoria e tenta outra vez.",
  "barter.postStrip.errorFailed":
    "A tua troca não foi publicada. Tenta outra vez daqui a um bocado.",
  "barter.postStrip.namePlaceholder": "Tu",
  "barter.postStrip.hoodPlaceholder": "A tua publicação",
  "barter.postStrip.detailPlaceholder":
    "Publicado agora mesmo, envia uma mensagem para começar a troca.",
  "barter.postStrip.tagNew": "nova",
  "barter.postStrip.tagYourPost": "a tua publicação",

  "barter.outro.title": "As competências são <em>a moeda.</em>",
  "barter.outro.sub":
    "A Troca QueerPulse está aberta a todas as pessoas da comunidade. Quanto mais ofereces, mais podes pedir.",
  "barter.outro.cta": "Junta-te à rede",

  // ── BarterDetailPage (+ ProposeCard / QuestionModal) ────────────────────
  "barterDetail.back": "Troca de competências",
  "barterDetail.goneLive.title": "Esta troca já não existe",
  "barterDetail.goneLive.description":
    "A publicação foi retirada do quadro, ou já não está disponível para ti. Vê o que mais há na troca de competências.",
  "barterDetail.emptyLive.cta": "Voltar à troca de competências",
  "barterDetail.sub.offering":
    "Disponível para a comunidade: propõe em troca algo de que a pessoa precise.",
  "barterDetail.sub.seeking": "À procura disto, e a oferecer algo em troca.",
  "barterDetail.sub.both":
    "A oferecer uma coisa, à procura de outra. Propõe uma troca que funcione para os dois lados.",
  "barterDetail.locationWithHood": "{hood} · Lisboa",
  "barterDetail.repliesFast": "Costuma responder rápido",
  "barterDetail.messageCta": "Enviar mensagem a {firstName}",
  "barterDetail.section.offering": "O que <em>tem para oferecer</em>",
  "barterDetail.section.lookingFor": "O que <em>procura</em>",
  "barterDetail.section.howItWorks": "Como funciona <em>uma troca</em>",

  "barterDetail.steps.propose.title": "Propor",
  "barterDetail.steps.propose.text":
    "Envia uma mensagem a dizer o que trocarias e porque é que a troca funciona para ti.",
  "barterDetail.steps.agree.title": "Combinar",
  "barterDetail.steps.agree.text":
    "Definem a troca em conjunto: âmbito, calendário, formato. Nenhum dinheiro muda de mãos.",
  "barterDetail.steps.exchange.title": "Trocar",
  "barterDetail.steps.exchange.text":
    "Cada pessoa entrega a sua parte. Encontram-se em Lisboa ou fazem à distância, o que for mais prático.",
  "barterDetail.steps.vouch.title": "Voto de confiança",
  "barterDetail.steps.vouch.text":
    "Depois, deixa um voto de confiança para que a próxima pessoa saiba que correu bem.",

  "barterDetail.sidebar.quickFacts": "Resumo rápido",
  "barterDetail.sidebar.type": "Tipo",
  "barterDetail.sidebar.category": "Categoria",
  "barterDetail.sidebar.posted": "Publicado",
  "barterDetail.sidebar.area": "Zona",
  "barterDetail.sidebar.tagged": "Etiquetas",

  "barterDetail.propose.title": "Propor uma troca",
  "barterDetail.propose.lead": "Sem dinheiro, <em>só troca.</em>",
  "barterDetail.propose.placeholder":
    "Diz a {firstName} o que oferecerias em troca, e porque é que esta troca funciona para ti.",
  "barterDetail.propose.sendCta": "Enviar proposta",
  "barterDetail.propose.askFirst": "Perguntar antes",
  "barterDetail.propose.footNote":
    "Nada fica combinado até ambas as partes dizerem que sim. As trocas são entre pessoas da comunidade e a QueerPulse não fica com nenhuma comissão.",
  "barterDetail.propose.footNoteLive":
    "A tua proposta vai diretamente para a caixa de entrada da pessoa, onde podem continuar a conversa. Nada fica combinado até ambas as partes dizerem que sim.",
  "barterDetail.propose.errorEmpty": "Escreve uma linha sobre o que trocarias.",
  "barterDetail.propose.toastSent": "Troca proposta a {name}.",
  "barterDetail.propose.sending": "A enviar…",
  "barterDetail.propose.alreadySent":
    "Já tens uma proposta em curso com {firstName}. O que enviares agora segue na mesma conversa.",
  "barterDetail.propose.errorAlreadySent":
    "Já tens uma proposta nesta troca. Continua a conversa nas tuas mensagens.",
  "barterDetail.propose.errorNotAllowed":
    "Não podes propor uma troca aqui. Pode ser a tua própria publicação, ou tu e esta pessoa não se conseguem contactar.",
  "barterDetail.propose.errorGone":
    "Esta troca já não existe. Vê o que mais há na troca de competências.",
  "barterDetail.propose.errorFailed":
    "A tua proposta não foi enviada. Tenta outra vez daqui a um bocado.",
  "barterDetail.propose.yoursTitle": "Esta troca é tua",
  "barterDetail.propose.yoursLead":
    "As propostas de outras pessoas chegam à tua caixa de entrada. Responde aí para combinar a troca.",

  "barterQuestion.eyebrow": "Antes de propores",
  "barterQuestion.title": "Faz uma pergunta a <em>{firstName}</em>.",
  "barterQuestion.sub":
    "Ainda não é o momento certo para propores uma troca? Pergunta primeiro o que precisas de saber: calendário, o que a pessoa procura, como funcionaria. Num tom descontraído e sem pressão.",
  "barterQuestion.fieldLabel": "A tua pergunta *",
  "barterQuestion.placeholder":
    "Olá {firstName}, uma pergunta rápida antes de propor uma troca…",
  "barterQuestion.charsRemaining_one":
    "Falta mais {count} caráter para enviares.",
  "barterQuestion.charsRemaining_other":
    "Faltam mais {count} carateres para enviares.",
  "barterQuestion.keepOnPlatform":
    "Mantém a conversa na QueerPulse até ambas as partes concordarem em avançar.",
  "barterQuestion.cancel": "Cancelar",
  "barterQuestion.sendCta": "Enviar pergunta",
  "barterQuestion.sendingLabel": "A enviar…",
  "barterQuestion.success.title": "Pergunta",
  "barterQuestion.success.em": "enviada.",
  "barterQuestion.success.closeLabel": "Concluído",
  "barterQuestion.success.body":
    "A tua pergunta está a caminho de <strong>{name}</strong>. Nenhuma troca fica combinada até ambas as partes dizerem que sim. É só uma conversa para ver se pode resultar. Vais receber uma notificação aqui quando a pessoa responder.",

  // ── PostJobPage (gate + composer + steps + sidebar + preview + confirmation) ──
  "postJob.gate.title":
    "Publicar uma vaga é para <em>empresas verificadas</em>",
  "postJob.gate.sub":
    "Para manter a bolsa de emprego fiável, só pessoas afiliadas a uma empresa podem publicar vagas. Afilia a tua empresa para continuar. É rápido.",
  "postJob.gate.affiliateCta": "Afiliar a tua empresa",
  "postJob.gate.backCta": "Voltar à bolsa",
  "postJob.gate.point1":
    "Confirmamos que as empresas são mesmo inclusivas para pessoas queer, no papel e na prática.",
  "postJob.gate.point2":
    "As vagas são publicadas em nome da tua empresa verificada, com o logótipo e o selo.",
  "postJob.gate.point3":
    "Sem comissões de colocação. É uma bolsa da comunidade.",

  "postJob.stepLabels.type": "Tipo e função",
  "postJob.stepLabels.details": "Detalhes",
  "postJob.stepLabels.pay": "Remuneração e benefícios",
  "postJob.stepLabels.screening": "Triagem",
  "postJob.stepLabels.review": "Revisão",
  "postJob.stepLabels.ariaLabel": "Progresso da publicação da vaga",

  "postJob.topbar.back": "Vagas e competências",
  "postJob.topbar.savedJustNow": "Guardado agora mesmo",
  "postJob.topbar.autosaves": "O rascunho guarda-se enquanto escreves",
  "postJob.nav.back": "Voltar",
  "postJob.nav.continue": "Continuar",
  "postJob.nav.saveDraft": "Guardar rascunho",
  "postJob.nav.publish": "Publicar vaga",
  "postJob.nav.publishing": "A publicar…",
  "postJob.toast.saveDraft": "Rascunho guardado na tua empresa.",
  "postJob.toast.fillHighlighted": "Preenche os campos destacados.",
  "postJob.toast.agreeRequired":
    "Adiciona um título e uma descrição e aceita o Código de Cuidado.",
  "postJob.toast.notAuthorised":
    "Não tens autorização para publicar em nome de {company}. Muda para uma empresa onde fazes parte da equipa.",
  "postJob.toast.publishError":
    "Não foi possível publicar a tua vaga. Tenta novamente.",
  "postJob.toast.publishErrorTitle": "Não conseguimos publicar a tua vaga",

  "postJob.field.optional": "opcional",
  "postJob.field.category": "Área",
  "postJob.field.profession": "Profissão",
  "postJob.field.fieldPlaceholder": "Escolhe uma área",
  "postJob.field.fieldSearch": "Pesquisa áreas e profissões",
  "postJob.field.professionPlaceholder": "Qualquer função nesta área",
  "postJob.field.commitment": "Regime",
  "postJob.field.experienceLevel": "Nível de experiência",
  "postJob.field.format": "Formato",
  "postJob.field.timezone": "Fuso horário",
  "postJob.field.location": "Localização",
  "postJob.field.level": "Nível",
  "postJob.field.where": "Onde",
  "postJob.field.pay": "Remuneração",
  "postJob.field.starts": "Início",
  "postJob.field.arrangement": "Modalidade",
  "postJob.field.title": "Título",
  "postJob.field.description": "Descrição",
  "postJob.field.perks": "Benefícios",
  "postJob.field.thisSpaceIs": "Este espaço é",
  "postJob.field.skills": "Competências",
  "postJob.field.screening": "Triagem",
  "postJob.field.postingAs": "A publicar como",
  "postJob.field.respondVia": "Responder via",

  "postJob.option.commitment.fullTime": "Tempo inteiro",
  "postJob.option.commitment.partTime": "Tempo parcial",
  "postJob.option.commitment.contract": "Contrato",
  "postJob.option.commitment.freelanceGig": "Freelance / trabalho pontual",
  "postJob.option.commitment.volunteer": "Voluntariado",
  "postJob.option.commitment.internship": "Estágio",

  "postJob.option.seniority.anyLevel": "Qualquer nível",
  "postJob.option.seniority.entry": "Júnior",
  "postJob.option.seniority.mid": "Intermédio",
  "postJob.option.seniority.senior": "Sénior",
  "postJob.option.seniority.leadPrincipal": "Liderança / Principal",

  "postJob.option.format.remote": "Remoto",
  "postJob.option.format.inPersonLisbon": "Presencial (Lisboa)",
  "postJob.option.format.hybrid": "Híbrido",
  "postJob.option.format.either": "Indiferente",

  "postJob.option.timezone.noPreference": "Sem preferência",
  "postJob.option.timezone.wetLisbon": "WET / Lisboa (UTC+0)",
  "postJob.option.timezone.cet": "CET (UTC+1)",
  "postJob.option.timezone.threeHoursOfLisbon": "±3h de Lisboa",
  "postJob.option.timezone.anyOverlap": "Qualquer sobreposição",

  "postJob.option.ratePer.hour": "Hora",
  "postJob.option.ratePer.day": "Dia",
  "postJob.option.ratePer.project": "Projeto",
  "postJob.option.ratePer.month": "Mês",
  "postJob.option.ratePer.year": "Ano",
  "postJob.option.ratePer.toDiscuss": "A combinar",

  "postJob.step1.eyebrow": "Passo 1 de 5",
  "postJob.step1.title": "A <em>função</em>",
  "postJob.step1.sub":
    "Como o trabalho está estruturado. Estas opções passam a ser os principais filtros que as pessoas usam para pesquisar na bolsa.",
  "postJob.step1.arrangementTitle": "Modalidade",
  "postJob.step1.arrangementSub":
    "O formato da função. Escolhe o mais próximo.",
  "postJob.step1.locationPlaceholder":
    "ex.: Arroios, Lisboa, ou um bairro / concelho",
  "postJob.step1.locationError": "Indica onde fica esta vaga.",
  "postJob.step1.fieldError": "Escolhe a área desta vaga.",

  "postJob.step2.eyebrow": "Passo 2 de 5",
  "postJob.step2.title": "Os <em>detalhes</em>",
  "postJob.step2.sub":
    "Um título claro e uma descrição honesta trazem respostas muito mais úteis.",
  "postJob.step2.titlePlaceholder":
    'ex.: "Design gráfico júnior, foco editorial"',
  "postJob.step2.titleError": "Dá um título à tua vaga.",
  "postJob.step2.titleCounter": "{used}/{max}",
  "postJob.step2.lookingForLabel": "O que procuras",
  "postJob.step2.descriptionPlaceholder":
    "Descreve o trabalho, para quem é e o que conta como sucesso. Escreve como explicarias a uma pessoa da comunidade num evento.",
  "postJob.step2.descriptionError": "Adiciona uma descrição.",
  "postJob.step2.charsCount_one": "{count} caráter",
  "postJob.step2.charsCount_other": "{count} carateres",
  "postJob.step2.timelineTitle": "Calendário",
  "postJob.step2.applyBy": "Candidaturas até",
  "postJob.step2.startDate": "Data de início",
  "postJob.step2.startDatePlaceholder": "ex.: já, junho, flexível",

  "postJob.step3.eyebrow": "Passo 3 de 5",
  "postJob.step3.title": "Remuneração <em>e benefícios</em>",
  "postJob.step3.sub":
    "A transparência é um valor da comunidade aqui, e resulta.",
  "postJob.step3.rateTitle": "Valor",
  "postJob.step3.currency": "Moeda",
  "postJob.step3.min": "Mín.",
  "postJob.step3.max": "Máx.",
  "postJob.step3.optAbbrev": "opc.",
  "postJob.step3.per": "Por",
  "postJob.step3.hidePay.name": "Ocultar valores exatos",
  "postJob.step3.hidePay.desc":
    'Mostra "Competitivo" no lugar do número. Mesmo assim, vale a pena indicar um intervalo na descrição.',
  "postJob.step3.barter.name": "Aceita troca de competências ou permuta",
  "postJob.step3.barter.desc":
    "Troca competências no lugar do dinheiro (ou além dele), uma opção de pleno direito na QueerPulse.",
  "postJob.step3.nudge":
    "<strong>As vagas com um valor definido recebem ~2× mais respostas.</strong> As pessoas agradecem não ter de perguntar.",
  "postJob.step3.benefitsTitle": "Benefícios",
  "postJob.step3.benefitsSub":
    "Escolhe tudo o que se aplica. Aparecem como etiquetas na tua vaga.",

  "postJob.step4.eyebrow": "Passo 4 de 5",
  "postJob.step4.title": "Competências, <em>triagem</em> e quem publica",
  "postJob.step4.sub":
    "É aqui que as vagas da QueerPulse vão além de uma bolsa de emprego genérica.",
  "postJob.step4.screeningTitle": "Perguntas de triagem",
  "postJob.step4.screeningSub":
    "Faz até 3 perguntas de resposta obrigatória para quem se candidata. Ótimo para filtrar depressa.",
  "postJob.step4.questionPlaceholder": "ex.: Vives em Portugal?",
  "postJob.step4.removeQuestionAria": "Remover pergunta",
  "postJob.step4.addQuestion": "Adicionar uma pergunta",
  "postJob.step4.spaceIsTitle": "Este espaço é…",
  "postJob.step4.spaceIsSub":
    "Sinais opcionais que dizem às pessoas o que esperar. Marca só o que for genuinamente verdade.",
  "postJob.step4.whosPostingTitle": "Quem publica",
  "postJob.step4.whosPostingSub":
    "As vagas são publicadas em nome da tua empresa verificada. É isso que mantém a bolsa fiável.",
  "postJob.step4.verifiedEmployerAria": "Empresa verificada",
  "postJob.step4.notYou": "Não és tu?",

  "postJob.skills.title": "Competências",
  "postJob.skills.sub":
    "Adiciona a partir da lista partilhada para que as pessoas possam encontrar e filtrar a vaga. Também podes escrever texto livre.",
  "postJob.skills.placeholder": "Começa a escrever uma competência…",
  "postJob.skills.addCta": "Adicionar",
  "postJob.skills.removeAria": "Remover {skill}",
  "postJob.skills.popular": "Popular nesta comunidade",

  "postJob.step5.eyebrow": "Passo 5 de 5",
  "postJob.step5.title": "Resposta e <em>revisão</em>",
  "postJob.step5.sub":
    "Escolhe como as pessoas te contactam e depois dá uma última vista de olhos.",
  "postJob.step5.respondTitle": "Como responder",
  "postJob.step5.respondSub":
    "Escolhe um ou mais. Cada método escolhido mostra o seu campo.",
  "postJob.step5.emailLabel": "Endereço de email",
  "postJob.step5.emailPlaceholder": "tu@exemplo.com",
  "postJob.step5.linkLabel": "Link externo",
  "postJob.step5.linkPlaceholder": "https://…",
  "postJob.step5.summaryTitle": "Resumo",
  "postJob.step5.dash": "Por definir",
  "postJob.step5.notSpecified": "Não especificado",
  "postJob.step5.questionCount_one": "{count} pergunta",
  "postJob.step5.questionCount_other": "{count} perguntas",
  "postJob.step5.editCta": "Editar",
  "postJob.step5.agreement":
    "Confirmo que esta vaga cumpre o <link>Código de Cuidado</link>: nenhuma discriminação com base na identidade e uma remuneração justa. <strong>A QueerPulse é um espaço de solidariedade.</strong>",

  "postJob.sidebar.livePreview": "Pré-visualização",
  "postJob.sidebar.fullView": "Ver tudo",
  "postJob.sidebar.hiring": "A contratar",
  "postJob.sidebar.titlePlaceholder": "O teu título vai aparecer aqui",
  "postJob.sidebar.descPlaceholder": "Adiciona uma descrição…",
  "postJob.sidebar.viewFullCta": "Ver a vaga completa",
  "postJob.sidebar.howThisWorks": "Como funciona",
  "postJob.sidebar.point1":
    "As vagas ficam <strong>visíveis só para a comunidade</strong> e nunca são públicas.",
  "postJob.sidebar.point2":
    "As candidaturas <strong>chegam-te</strong> pela QueerPulse e revê-las nas vagas que publicaste.",
  "postJob.sidebar.point3":
    "<strong>Sem comissões de colocação.</strong> Uma bolsa da comunidade, gerida pela comunidade.",
  "postJob.sidebar.point4":
    "<strong>Edita ou fecha</strong> a qualquer momento nas vagas que publicaste.",

  "postJob.preview.ariaLabel": "Pré-visualização da vaga",
  "postJob.preview.untitled": "Vaga sem título",
  "postJob.preview.verifiedEmployer": "empresa verificada",
  "postJob.preview.aboutRole": "Sobre esta função",
  "postJob.preview.noDescription": "Ainda sem descrição.",
  "postJob.preview.inclusivityTitle": "Este espaço é",
  "postJob.preview.youllBeAsked": "Vão perguntar-te",
  "postJob.preview.respondViaLabel": "Responder via",
  "postJob.preview.respondCta": "Responder",

  "postJob.confirm.title": "“{title}” está <em>publicada</em>",
  "postJob.confirm.sub":
    "As pessoas já a podem ver. Avisamos-te quando alguém se candidatar.",
  "postJob.confirm.viewListing": "Ver vaga",
  "postJob.confirm.postAnother": "Publicar outra",
  "postJob.confirm.responses.title": "Respostas",
  "postJob.confirm.responses.body":
    "As candidaturas ficam todas num só lugar. Revê-as nas vagas que publicaste.",
  "postJob.confirm.responses.openManager": "Abrir as vagas que publicaste",
  "postJob.confirm.share.title": "Partilha",
  "postJob.confirm.share.body":
    "Copia o link e põe-no onde as tuas pessoas já estão.",
  "postJob.confirm.share.copyLink": "Copiar link",
  "postJob.confirm.share.toastLink": "Link copiado",
  "postJob.confirm.whatsNext.title": "A seguir",
  "postJob.confirm.whatsNext.body": "A tua vaga já aparece na bolsa.",

  // ── MentorshipPage (+ match modal/steps) ────────────────────────────────
  "mentorship.hero.eyebrow": "Mentoria",
  "mentorship.hero.title":
    "Alguém mais à frente no caminho <em>quer ajudar-te.</em>",
  "mentorship.hero.lead":
    "Mentoria formal individual, com pares feitos entre profissionais queer em Lisboa. Se estás a ter dificuldades, há alguém na rede que já passou pelo mesmo. Se já ultrapassaste essa fase, podes retribuir.",
  "mentorship.stat.activeMentors": "Pessoas mentoras ativas na rede",
  "mentorship.stat.matchesMade": "Pares feitos até agora",
  "mentorship.stat.areasOfFocus": "Áreas de foco",

  "mentorship.choose.title": "O que te traz <em>aqui?</em>",
  "mentorship.choose.mentee.title": "Procuro mentoria",
  "mentorship.choose.mentee.desc":
    "Estás a atravessar alguma coisa: uma transição de carreira, um bloqueio criativo, sair do armário no trabalho, um ambiente de trabalho difícil, uma cidade nova. Fazia-te bem falar com alguém que já passou por isso.",
  "mentorship.choose.mentee.for":
    "Para: qualquer pessoa, em qualquer fase, que precise de orientação",
  "mentorship.choose.mentor.title": "Posso dar mentoria",
  "mentorship.choose.mentor.desc":
    "Já passaste por coisas suficientes para teres algo a oferecer. Não precisas de ser especialista. Basta já teres passado por algo que outra pessoa está a viver agora.",
  "mentorship.choose.mentor.for":
    "Para: pessoas com experiência dispostas a partilhá-la",

  "mentorship.emptyLive.title": "Diretório de mentoria em breve",
  "mentorship.emptyLive.description":
    "Ainda estamos a construir a rede de mentoria. Volta em breve para explorar e falar com pessoas mentoras da comunidade.",
  "mentorship.strip.title": "Pessoas mentoras <em>na rede</em>",
  "mentorship.strip.sub":
    "Estas pessoas estão disponíveis para dar mentoria. Podes pedir um par no formulário acima.",

  "mentorship.outro.title": "Tens algo <em>para dar?</em>",
  "mentorship.outro.sub":
    "A mentoria é uma das formas. Explora oportunidades de voluntariado para encontrar outras formas de contribuir para a comunidade à tua volta.",
  "mentorship.outro.cta": "Ver funções de voluntariado",

  "mentorship.matchArea.careerDirection": "Rumo profissional",
  "mentorship.matchArea.comingOutProfessionally": "Sair do armário no trabalho",
  "mentorship.matchArea.creativePractice": "Prática criativa",
  "mentorship.matchArea.startingBusiness": "Começar um negócio",
  "mentorship.matchArea.difficultWorkplace":
    "Lidar com um ambiente de trabalho difícil",
  "mentorship.matchArea.newToLisbon": "Primeiros tempos em Lisboa",
  "mentorship.matchArea.settlingInLisbon": "Instalar-te em Lisboa",
  "mentorship.matchArea.mentalHealthAtWork": "Saúde mental no trabalho",
  "mentorship.matchArea.legalRightsIssues": "Questões legais ou de direitos",
  "mentorship.matchArea.legalRightsNavigation":
    "Orientação jurídica e de direitos",

  "mentorship.match.findMentorAria": "Encontrar mentoria",
  "mentorship.match.becomeMentorAria": "Dar mentoria",
  "mentorship.match.closeAria": "Fechar",
  "mentorship.match.stepOf": "Passo {step} de {total}",

  "mentorship.match.success.mentee.title": "Pedido recebido.",
  "mentorship.match.success.mentor.title": "Agradecemos.",
  "mentorship.match.success.mentee.body":
    "Vamos rever o teu pedido e enviar-te uma sugestão de par no prazo de 2 semanas. A apresentação chega por email.",
  "mentorship.match.success.mentor.body":
    "Vamos juntar-te à bolsa de pessoas mentoras e contactar-te quando tivermos um bom par para ti. Significa muito para nós.",
  "mentorship.match.success.done": "Concluído",

  "mentorship.mentee.step1.eyebrow": "A procurar mentoria para ti",
  "mentorship.mentee.step1.title": "Em que precisas de ajuda?",
  "mentorship.mentee.step1.sub":
    "Escolhe as áreas em que a orientação te faria mais falta. Vamos pôr-te em contacto com alguém com experiência direta nelas.",
  "mentorship.mentee.step2.eyebrow": "Sobre ti",
  "mentorship.mentee.step2.title": "O que deve a tua pessoa mentora saber?",
  "mentorship.mentee.step2.namePlaceholder": "O teu nome",
  "mentorship.mentee.step2.rolePlaceholder": "A tua função ou prática",
  "mentorship.mentee.step2.frequencyPlaceholder":
    "Com que frequência gostavas de ter encontros?",
  "mentorship.mentee.step2.frequency.monthly": "Uma vez por mês",
  "mentorship.mentee.step2.frequency.twiceMonthly": "Duas vezes por mês",
  "mentorship.mentee.step2.frequency.asNeeded": "Conforme necessário",
  "mentorship.mentee.step2.notePlaceholder":
    "Uma frase sobre o que se passa e que tipo de apoio ajudaria…",
  "mentorship.mentee.step3.eyebrow": "Falta pouco",
  "mentorship.mentee.step3.title": "Como te contactamos?",
  "mentorship.mentee.step3.emailPlaceholder": "O teu endereço de email",
  "mentorship.mentee.step3.sub":
    "Vamos rever o teu pedido e sugerir um par no prazo de 2 semanas. Vais receber uma apresentação por email e continuar a partir daí.",
  "mentorship.mentee.toastSubmitted": "Pedido de par recebido",

  "mentorship.mentor.step1.eyebrow": "Para dar mentoria",
  "mentorship.mentor.step1.title": "O que podes oferecer?",
  "mentorship.mentor.step1.sub":
    "Não precisas de ser especialista. Basta já teres passado por algo que outra pessoa está a viver agora.",
  "mentorship.mentor.step2.eyebrow": "A tua disponibilidade",
  "mentorship.mentor.step2.title": "Quanto tempo podes dar?",
  "mentorship.mentor.step2.namePlaceholder": "O teu nome e função",
  "mentorship.mentor.step2.menteesPlaceholder":
    "Quantas pessoas mentorandas por trimestre?",
  "mentorship.mentor.step2.mentees.one": "1 pessoa",
  "mentorship.mentor.step2.mentees.two": "2 pessoas",
  "mentorship.mentor.step2.mentees.three": "3 pessoas",
  "mentorship.mentor.step2.formatPlaceholder": "Formato de encontro preferido",
  "mentorship.mentor.step2.format.inPersonLisbon": "Presencial em Lisboa",
  "mentorship.mentor.step2.format.video": "Chamada de vídeo",
  "mentorship.mentor.step2.format.either": "Tanto faz",
  "mentorship.mentor.step2.emailPlaceholder": "O teu endereço de email",
  "mentorship.mentor.toastSubmitted": "Entraste na bolsa de pessoas mentoras",

  "mentorship.nav.continue": "Continuar",
  "mentorship.nav.back": "Voltar",
  "mentorship.nav.submit": "Submeter",
  "mentorship.cta.requestMatch": "Pedir um par",
  "mentorship.cta.joinWaitlist": "Entrar na lista de espera",

  // ── MentorDetailPage (+ header / sections / sidebar / cycle nav) ───────
  "mentorDetail.backToAll": "Todas as pessoas mentoras",
  "mentorDetail.emptyLive.title": "Este perfil de mentoria chega em breve",
  "mentorDetail.emptyLive.description":
    "O diretório de mentoria ainda não está ativo. Volta para explorar a mentoria quando abrir.",
  "mentorDetail.emptyLive.cta": "Voltar à mentoria",
  "mentorDetail.messageCta": "Enviar mensagem a {firstName}",
  "mentorDetail.cyclePrevious": "Anterior",
  "mentorDetail.cycleNext": "Seguinte",
  "mentorDetail.cyclePosition": "{position} de {total}",
  "mentorDetail.section.howTheyMentor": "Como {firstName} <em>dá mentoria</em>",
  "mentorDetail.section.fitFor": "Se <em>é a mentoria certa</em> para ti",
  "mentorDetail.fit.benefitIf": "Beneficiarias se…",
  "mentorDetail.fit.andIdeally": "E, idealmente…",
  "mentorDetail.fit.andMaybe": "E talvez…",
  "mentorDetail.fit.notRightCall": "Não é a escolha certa se…",
  "mentorDetail.section.process": "O <em>processo</em>, passo a passo",
  "mentorDetail.sidebar.workWith": "Trabalhar com {firstName}",
  "mentorDetail.sidebar.noUpfrontCost":
    "Sem custo inicial. A mentoria aqui é entre pessoas. Podes sempre fazer uma pergunta antes de te comprometeres.",
  "mentorDetail.sidebar.notSureYet": "Ainda não tens a certeza?",
  "mentorDetail.sidebar.askQuestion": "Enviar uma pergunta a {firstName}",
  "mentorDetail.sidebar.browseAll": "Explorar todas as pessoas mentoras",

  // ── ApplicationStatusPage (+ header/list/card, listing-manager modals) ──
  "applicationStatus.header.eyebrow": "As tuas vagas",
  "applicationStatus.header.title": "Em que ponto <em>está tudo.</em>",
  "applicationStatus.header.sub":
    "Acompanha todas as candidaturas, vê há quanto tempo cada empresa tem a tua sem resposta e percebe quando deves insistir.",
  "applicationStatus.header.counterSent": "/ {count} enviadas",
  "applicationStatus.header.activeLabel": "Candidaturas ativas",

  "applicationStatus.tab.all": "Todas",
  "applicationStatus.tab.active": "Ativas",
  "applicationStatus.tab.offer": "Ofertas",
  "applicationStatus.tab.closed": "Fechadas",
  "applicationStatus.tab.draft": "Rascunhos",

  "applicationStatus.legend.key": "Legenda",
  "applicationStatus.legend.done": "Concluído. Este passo está feito",
  "applicationStatus.legend.active": "Estás aqui, passo atual",
  "applicationStatus.legend.upcoming": "Por vir. Este passo ainda não começou",
  "applicationStatus.legend.closed": "Fechado, terminado ou retirado",

  "applicationStatus.group.offers.title": "Ofertas, a tua decisão",
  "applicationStatus.group.inProgress.title": "Em curso",
  "applicationStatus.group.drafts.title": "Rascunhos",
  "applicationStatus.group.drafts.hint":
    "Por terminar. Conclui-as antes que fechem.",
  "applicationStatus.group.closedWithdrawn.title": "Fechadas e retiradas",
  "applicationStatus.group.closedWithdrawn.hint":
    "Não precisas de fazer nada. Ficam guardadas para referência.",
  "applicationStatus.compareOffersCta": "Comparar ofertas",

  "applicationStatus.empty.title": "Ainda sem candidaturas",
  "applicationStatus.empty.description":
    "Quando te candidatares a uma vaga, bolsa ou oportunidade, podes acompanhar cada candidatura e comparar ofertas lado a lado, aqui mesmo.",
  "applicationStatus.empty.browseCta": "Explorar vagas",

  "applicationStatus.error.title":
    "Não foi possível carregar as tuas candidaturas",
  "applicationStatus.error.description":
    "Algo correu mal ao carregar as tuas candidaturas. Espera um momento e tenta de novo. Nada do que enviaste se perdeu.",

  // Elementos do acompanhamento em modo real — o subtítulo da data de
  // candidatura, as etapas derivadas do estado, as linhas de estado e os
  // selos que os cartões vindos da API mostram (a ficção detalhada de
  // recrutador/entrevista/oferta é apenas do modo demo).
  "applicationStatus.live.appliedOn": "Enviada a {date}",
  "applicationStatus.live.action.viewSubmission": "Ver candidatura",
  "applicationStatus.live.stage.submitted": "Enviada",
  "applicationStatus.live.stage.review": "Em análise",
  "applicationStatus.live.stage.decision": "Decisão",
  "applicationStatus.live.stage.offer": "Oferta",
  "applicationStatus.live.stage.declined": "Desta vez não",
  "applicationStatus.live.status.submitted":
    "Enviada à empresa. Vais ver as atualizações aqui à medida que responderem.",
  "applicationStatus.live.status.reviewing":
    "A empresa está a ler a tua candidatura agora.",
  "applicationStatus.live.status.accepted":
    "Boas notícias, a tua candidatura foi aceite.",
  "applicationStatus.live.status.declined":
    "Desta vez não resultou. Fica guardada aqui para referência.",
  "applicationStatus.live.badge.submitted": "Enviada agora",
  "applicationStatus.live.badge.reviewing": "Em análise",
  "applicationStatus.live.badge.accepted": "Aceite",
  "applicationStatus.live.badge.declined": "Fechada",

  "applicationStatus.card.stepOf": "Passo {step} de {total}",
  "applicationStatus.card.whatThisMeans": "O que isto significa",

  "applicationStatus.close": "Fechar",
  "applicationStatus.submission.eyebrow": "A tua candidatura",
  "applicationStatus.submission.attachments": "Anexos",
  "applicationStatus.company.eyebrow": "A empresa",
  "applicationStatus.company.statPeople": "Pessoas",
  "applicationStatus.company.statVerified": "Verificada pela comunidade",
  "applicationStatus.company.statWeekPilot": "Semana em teste",
  "applicationStatus.company.sector": "Setor",
  "applicationStatus.company.based": "Localização",
  "applicationStatus.company.viewDirectory": "Ver no diretório",
  "applicationStatus.note.from": "Uma nota de {company}",

  // Linhas de estado geradas pelo applicationStatus.patches.tsx logo após a
  // pessoa tomar uma ação (ver nota de âmbito no catálogo EN).
  "applicationStatus.patch.withdrawn":
    "Retiraste esta candidatura agora mesmo. Avisámos a empresa com delicadeza.",
  "applicationStatus.patch.followedUp":
    "<b>Seguimento enviado agora mesmo.</b> Já lhes deixámos um lembrete simpático. Costumas ter resposta em poucos dias.",
  "applicationStatus.patch.submitted":
    "Enviada agora mesmo. O prazo indicado é de 7 dias. Ficamos de olho no prazo por ti.",
  "applicationStatus.patch.accepted":
    "<b>Oferta aceite.</b> Vão enviar-te o contrato por email nos próximos dois dias úteis.",
  "applicationStatus.patch.declined":
    "Recusaste esta oferta. Agradecemos-lhes calorosamente em teu nome.",

  "msg.message.title": "Enviar mensagem",
  "msg.message.em": "à pessoa recrutadora.",
  "msg.message.sub":
    "Vai direto para a caixa de entrada, sem confirmação de leitura, sem algoritmo pelo meio.",
  "msg.followup.title": "Enviar um",
  "msg.followup.em": "seguimento.",
  "msg.followup.sub":
    "Um empurrãozinho simpático. Já escrevemos algo caloroso. Edita como quiseres.",
  "msg.followup.preset":
    "Olá. Só uma mensagem rápida para saber em que ponto está a minha candidatura. Continuo com muito interesse na vaga e disponível para partilhar o que for útil. Sem pressa nenhuma, e agradeço desde já a atenção.",
  "msg.conversation.title": "Abrir a",
  "msg.conversation.em": "conversa.",
  "msg.conversation.sub": "Continua a conversa diretamente.",
  "msg.recipientHiringTeam": "Equipa de contratação",
  "msg.historyWith":
    "O histórico completo com {firstName}, todas as mensagens e marcos, por ordem.",
  "msg.you": "Tu",
  "msg.yourReply": "A tua resposta",
  "msg.replyPlaceholder": "Escreve uma resposta…",
  "msg.sendingLabel": "A enviar…",
  "msg.sendCta": "Enviar",
  "msg.yourMessageLabel": "A tua mensagem",
  "msg.messagePlaceholder": "Escreve à vontade.",
  "msg.cancel": "Cancelar",
  "msg.success.title": "Mensagem",
  "msg.success.em": "enviada.",
  "msg.success.body":
    "A tua mensagem para {firstName} está a caminho. Vais receber a resposta diretamente na tua caixa de entrada.",

  "calendar.eyebrow": "Entrevista",
  "calendar.close": "Fechar",
  "calendar.icsLabel": "Ficheiro .ics",
  "calendar.googleLabel": "Google Calendar",
  "calendar.addingLabel": "A adicionar…",
  "calendar.success.title": "Guardado no teu",
  "calendar.success.em": "calendário.",
  "calendar.success.google":
    "Abrimos o Google Calendar, basta guardares. Também te vamos lembrar na manhã do dia.",
  "calendar.success.ics":
    "O convite (.ics) foi descarregado, abre-o para adicionar o evento. Também te vamos lembrar na manhã do dia.",
  "calendar.when": "Quando",
  "calendar.where": "Onde",
  "calendar.with": "Com",

  "withdraw.eyebrow": "Retirar",
  "withdraw.title": "Desistir de <em>{company}?</em>",
  "withdraw.sub":
    "A tua candidatura a <b>{title}</b> deixa de ser considerada. Vamos enviar uma nota breve e educada em teu nome. Não precisas de escrever nada.",
  "withdraw.reasonLabel": "Motivo (só tu vês isto)",
  "withdraw.reasonPlaceholder": "Escolhe um motivo, ou deixa em aberto",
  "withdraw.cantUndo":
    "Isto não pode ser desfeito, terias de te candidatar de novo.",
  "withdraw.keepIt": "Manter",
  "withdraw.sendingLabel": "A retirar…",
  "withdraw.submitCta": "Retirar candidatura",
  "withdraw.success.title": "Candidatura",
  "withdraw.success.em": "retirada.",
  "withdraw.success.body":
    "Avisámos {company} com educação. Esta vaga passou para o separador Fechadas.",
  "withdrawReason.acceptedAnother": "Aceitei outra vaga",
  "withdrawReason.noLongerFit": "Já não faz sentido",
  "withdrawReason.payDidntWork": "A remuneração ou as condições não serviam",
  "withdrawReason.tookTooLong": "O processo demorou demasiado",
  "withdrawReason.preferNotToSay": "Prefiro não dizer",

  "negotiate.eyebrow": "Negociação da oferta",
  "negotiate.title": "Pede o que <em>vale.</em>",
  "negotiate.sub":
    "Negociar faz parte do processo e a maioria das ofertas tem margem. Aqui tens a tua vantagem, as tuas alavancas e cinco formas de fazer o pedido.",
  "negotiate.onTheTable": "Em cima da mesa",
  "negotiate.holiday": "Férias",
  "negotiate.whatMattersMost": "O que mais te importa",
  "negotiate.pickAngle": "Escolhe a tua abordagem",
  "negotiate.draftLabel": "O teu rascunho de resposta. Edita-o para soar a ti",
  "negotiate.copyDraft": "Copiar rascunho",
  "negotiate.copiedToast": "Rascunho copiado",
  "negotiate.sendingLabel": "A enviar…",
  "negotiate.sendCta": "Enviar resposta",
  "negotiate.success.title": "Contraproposta",
  "negotiate.success.em": "enviada.",
  "negotiate.success.body":
    "A tua resposta está a caminho de {company}. Pedir é normal e esperado. Fizeste tudo certo.",
  "lever.baseSalary": "Salário base",
  "lever.holidayDays": "Dias de férias",
  "lever.remoteDays": "Dias de teletrabalho",
  "lever.learningBudget": "Orçamento de formação",
  "lever.startDate": "Data de início",
  "lever.titleScope": "Título e âmbito",
  "principle.anchor":
    "Ancora o pedido no valor que trazes. As tuas necessidades ficam fora da conversa.",
  "principle.nameNumber":
    "Diz um número claro e depois fica em silêncio. Deixa a outra parte responder.",
  "principle.trade":
    "Se o salário base não subir, troca: dias, orçamento, título, flexibilidade.",
  "principle.stayWarm":
    "Mantém um tom caloroso. Estás a construir uma relação.",
  "negotiate.angle.collaborative.name": "O pedido colaborativo",
  "negotiate.angle.collaborative.blurb":
    "Caloroso, focado na parceria. Melhor quando já há sintonia.",
  "negotiate.angle.market.name": "O argumento de mercado",
  "negotiate.angle.market.blurb":
    "Baseado em dados e confiante. Melhor quando tens os valores de mercado do teu lado.",
  "negotiate.angle.bundle.name": "O pacote",
  "negotiate.angle.bundle.blurb":
    "Trocar entre alavancas. Melhor quando o teto salarial é fixo.",
  "negotiate.angle.enthusiastic.name": "Começar com um sim",
  "negotiate.angle.enthusiastic.blurb":
    "Entusiasmo primeiro, número depois. Desarmante e eficaz.",
  "negotiate.angle.time.name": "Pedir tempo",
  "negotiate.angle.time.blurb":
    "Ganhar espaço para decidir, com calma, sem pressão.",

  "offer.respondByEyebrow": "A tua oferta · responde até {date}",
  "offer.saidYes": "A {company} <em>disse sim.</em>",
  "offer.sub":
    "Aqui está tudo o que está em cima da mesa. Pensa com calma e depois escolhe.",
  "offer.salary": "Salário",
  "offer.holiday": "Férias",
  "offer.start": "Início",
  "offer.declinePolitely": "Recusar com educação",
  "offer.decliningLabel": "A recusar…",
  "offer.acceptCta": "Aceitar oferta",
  "offer.acceptingLabel": "A aceitar…",
  "offer.success.title": "Oferta",
  "offer.success.emAccepted": "aceite.",
  "offer.success.emDeclined": "recusada.",
  "offer.undo.changedMind":
    "Mudaste de ideias? Podes desfazer durante {seconds}s.",
  "offer.undo.button": "Desfazer",
  "offer.undo.confirmed": "Agora está confirmado.",
  "offer.success.acceptedBody":
    "Parabéns, a {company} vai enviar o teu contrato no prazo de dois dias úteis.",
  "offer.success.declinedBody":
    "Agradecemos calorosamente à {company} em teu nome. A porta fica aberta para o futuro.",

  "resume.eyebrowPrefix": "Retomar rascunho · {deadline}",
  "resume.title": "Termina a tua <em>candidatura.</em>",
  "resume.progress_one": "{percent}% concluído · falta {count} coisa",
  "resume.progress_other": "{percent}% concluído · faltam {count} coisas",
  "resume.coverLetterLabel": "Carta de apresentação",
  "resume.coverLetterPlaceholder":
    "Umas linhas sinceras sobre o porquê desta vaga.",
  "resume.availabilityLabel": "Disponibilidade",
  "resume.availabilityPlaceholder": "ex.: aviso prévio de duas semanas",
  "resume.saveClose": "Guardar e fechar",
  "resume.submittingLabel": "A submeter…",
  "resume.submitCta": "Submeter candidatura",
  "resume.success.title": "Candidatura",
  "resume.success.em": "enviada.",
  "resume.success.body":
    "Boa, a tua candidatura para {company} foi enviada. Já está no teu separador Ativas.",

  "compare.eyebrow": "As tuas ofertas",
  "compare.title": "Duas ofertas, <em>lado a lado.</em>",
  "compare.sub":
    "Uma visão tranquila do que está em cima da mesa. Compara os números e responde quando quiseres.",
  "compare.whatsIncluded": "O que está incluído",
  "compare.respondCta": "Responder",
  "compare.close": "Fechar",
  "compareRow.salary": "Salário",
  "compareRow.holiday": "Férias",
  "compareRow.startDate": "Data de início",
  "compareRow.respondBy": "Responder até",
  "compareRow.howItPays": "Como paga",

  // ── SolidarityPage (+ directory) ────────────────────────────────────────
  "solidarity.hero.eyebrow": "Cuidado comunitário",
  "solidarity.hero.titleLine1": "Paga o que",
  "solidarity.hero.titleEm": "puderes.",
  "solidarity.hero.sub":
    "Um diretório de profissionais que oferecem tarifas em escala variável, porque o acesso a bons cuidados não devia depender do que ganhas.",
  "solidarity.hero.note":
    "Todos os perfis foram verificados por pelo menos duas pessoas da comunidade.",
  "solidarity.how.step1.title": "Encontra quem te pode ajudar",
  "solidarity.how.step1.body":
    "Filtra por profissão, bairro ou idioma. Cada listagem explica como funciona a escala variável, sem surpresas.",
  "solidarity.how.step2.title": "Contacta diretamente",
  "solidarity.how.step2.body":
    "Contacta através da plataforma ou por email. Tu conduzes a conversa. Não tens de explicar a tua situação financeira a mais ninguém primeiro.",
  "solidarity.how.step3.title": "Paga o que puderes",
  "solidarity.how.step3.body":
    "Cada profissional define o seu próprio intervalo e abordagem. Há quem use escalas por rendimento e quem te deixe propor o valor. A listagem explica como.",
  "solidarity.outro.title": "Cuidar é um <em>ato coletivo.</em>",
  "solidarity.outro.sub":
    "A QueerPulse liga a comunidade a profissionais que acreditam no acesso tanto quanto tu.",
  "solidarity.outro.cta": "Junta-te à rede",

  "solidarity.filter.all": "Todas",
  "solidarity.filter.therapy": "Terapia",
  "solidarity.filter.legal": "Jurídico",
  "solidarity.filter.medical": "Medicina",
  "solidarity.filter.dental": "Dentista",
  "solidarity.filter.vet": "Veterinária",
  "solidarity.filter.finance": "Contabilidade",
  "solidarity.filter.body": "Trabalho corporal",

  "solidarityDirectory.professionLabel": "Profissão",
  "solidarityDirectory.searchPlaceholder": "Pesquisa por nome, zona…",
  "solidarityDirectory.count_one": "<b>{count}</b> profissional",
  "solidarityDirectory.count_other": "<b>{count}</b> profissionais",
  "solidarityDirectory.badgeMember": "Comunidade",
  "solidarityDirectory.badgeVerified": "Perfil verificado",
  "solidarityDirectory.slidingScaleLabel": "Escala variável",
  "solidarityDirectory.connectCta": "Conectar",
  "solidarityDirectory.empty.title": "Sem resultados para essa pesquisa",
  "solidarityDirectory.empty.description":
    "Ainda ninguém corresponde a essa pesquisa. Tenta outra profissão ou limpa a pesquisa para ver todas as pessoas que oferecem cuidado em escala variável.",
  "solidarityDirectory.empty.clearFilters": "Limpar filtros",
  "solidarityDirectory.emptyLive.title": "Ainda não há profissionais na lista",
  "solidarityDirectory.emptyLive.description":
    "Quem oferece tarifários solidários vai aparecer aqui assim que entrar na lista.",
  "solidarityDirectory.register.titleLine1": "Ofereces",
  "solidarityDirectory.register.titleEm": "tarifários solidários?",
  "solidarityDirectory.register.body":
    "Se és profissional na comunidade e já ofereces tarifas em escala variável, junta-te a esta lista. Demora dez minutos e ajuda as pessoas a encontrar-te.",
  "solidarityDirectory.register.cta": "Regista a tua atividade",
  "solidarityDirectory.register.questionsLink":
    "Tens dúvidas antes? Fala connosco",

  // ── tools/ToolPage (shared document-generator shell, all freelance tools) ──
  "toolPage.backToEconomy": "Voltar à Economia",
  "toolPage.eyebrowFreelance": "Ferramentas para trabalho independente",
  "toolPage.eyebrowCommunity": "Comunidade",
  "toolPage.downloadPdf": "Descarregar PDF",
  "toolPage.copyText": "Copiar texto",
  "toolPage.copiedToast": "Copiado para a área de transferência",
  "toolPage.reset": "Repor",

  // ── tax.constants.ts — IVA rate dropdown labels (InvoiceFormFields, DayRateCalculatorPage) ──
  "tax.ivaRate.0": "0% (isento)",
  "tax.ivaRate.6": "6% (reduzida)",
  "tax.ivaRate.13": "13% (intermédia)",
  "tax.ivaRate.23": "23% (normal)",

  // ── IvaTrackerForm / IvaTrackerPage / IvaTrackerStatus ─────────────────
  "ivaTracker.title": "Fica abaixo do <em>limite.</em>",
  "ivaTracker.sub":
    "Acompanha o que já faturaste face ao limite de isenção de IVA de 15 000 € (art. 53.º). Guardado apenas neste dispositivo.",
  "ivaTracker.form.whatForLabel": "A que se refere",
  "ivaTracker.form.whatForPlaceholder": "ex.: Design de logótipo, Café Aurora",
  "ivaTracker.form.amountLabel": "Valor (€)",
  "ivaTracker.form.dateLabel": "Data",
  "ivaTracker.form.addCta": "Adicionar fatura",
  "ivaTracker.form.loggedHead": "Faturas registadas",
  "ivaTracker.form.empty":
    "Ainda não registaste nada. Adiciona a tua primeira fatura acima.",
  "ivaTracker.form.removeAriaLabel": "Remover {label}",
  "ivaTracker.status.eyebrow": "Rumo ao limite de 15 000 €",
  "ivaTracker.status.barAriaLabel":
    "Rendimento faturado em relação ao limite de isenção de IVA",
  "ivaTracker.status.invoiced": "Faturado",
  "ivaTracker.status.headroomLeft": "Margem restante",
  "ivaTracker.status.overBy": "Acima em",
  "ivaTracker.status.thresholdUsed": "Limite utilizado",
  "ivaTracker.status.safeNote":
    "Confortavelmente abaixo do limite. Continua a registar faturas e vais ver a tua margem a diminuir em tempo real.",
  "ivaTracker.status.nearNote":
    "Estás a aproximar-te: resta apenas {remaining} de margem. Planeia bem o resto do ano antes de ultrapassares {threshold}.",
  "ivaTracker.status.overNote":
    "Ultrapassaste o limite de isenção de {threshold}. Podes terminar o ano com isenção, mas no próximo ano vais cobrar IVA. Se passares {overrun} (25% acima), sais da isenção de imediato.",
  "ivaTracker.status.overrunTitle": "Tens de sair da <em>isenção.</em>",
  "ivaTracker.status.overrunBody":
    "Ultrapassaste {overrun}, mais de 25% acima do limite, pelo que a isenção do art. 53.º termina ainda este ano. Vais ter de começar a cobrar IVA e retirar a nota de isenção das tuas faturas.",
  "ivaTracker.status.overrunNote": "Até agora as tuas faturas incluíam: {note}",

  // ── InvoiceForm / InvoiceFormFields / InvoiceLineItems / InvoicePreview / InvoiceGeneratorPage ──
  "invoiceTool.title": "Cria uma <em>fatura.</em>",
  "invoiceTool.sub":
    "Preenche os detalhes e vê a tua fatura-recibo a construir-se sozinha. Quando estiver como queres, guarda-a diretamente em PDF, sem conta e sem carregamentos: nada sai do teu navegador.",
  "invoiceTool.issuer.legend": "Os teus dados",
  "invoiceTool.issuer.nameLabel": "Nome / empresa",
  "invoiceTool.issuer.namePlaceholder": "O teu nome ou estúdio",
  "invoiceTool.issuer.nifLabel": "NIF",
  "invoiceTool.issuer.emailLabel": "Email",
  "invoiceTool.issuer.emailPlaceholder": "tu@exemplo.com",
  "invoiceTool.issuer.addressLabel": "Morada",
  "invoiceTool.issuer.addressPlaceholder": "Rua, código postal, cidade",
  "invoiceTool.issuer.ibanLabel": "IBAN",
  "invoiceTool.issuer.ibanPlaceholder": "PT50 0000 0000 0000 0000 0000 0",
  "invoiceTool.client.legend": "Cliente",
  "invoiceTool.client.nameLabel": "Nome do cliente",
  "invoiceTool.client.namePlaceholder": "A quem estás a faturar",
  "invoiceTool.client.nifLabel": "NIF do cliente",
  "invoiceTool.client.addressLabel": "Morada do cliente",
  "invoiceTool.optional": "Opcional",
  "invoiceTool.meta.legend": "Fatura",
  "invoiceTool.meta.numberLabel": "Número da fatura",
  "invoiceTool.meta.numberPlaceholder": "FR 2026/001",
  "invoiceTool.meta.issueDateLabel": "Data de emissão",
  "invoiceTool.meta.dueDateLabel": "Data de vencimento",
  "invoiceTool.meta.ivaRateLabel": "Taxa de IVA",
  "invoiceTool.lines.legend": "Linhas da fatura",
  "invoiceTool.lines.description": "Descrição",
  "invoiceTool.lines.qty": "Qtd.",
  "invoiceTool.lines.unit": "Unitário (€)",
  "invoiceTool.lines.total": "Total",
  "invoiceTool.lines.descAriaLabel": "Descrição da linha {index}",
  "invoiceTool.lines.qtyAriaLabel": "Quantidade da linha {index}",
  "invoiceTool.lines.unitAriaLabel": "Preço unitário da linha {index}",
  "invoiceTool.lines.descPlaceholder": "O que entregaste",
  "invoiceTool.lines.removeAriaLabel": "Remover linha {index}",
  "invoiceTool.lines.addCta": "Adicionar linha",
  "invoiceTool.notes.legend": "Notas",
  "invoiceTool.notes.placeholder":
    "Condições de pagamento, agradecimentos, tudo o que convém saber.",
  "invoiceTool.preview.yourNameFallback": "O teu nome",
  "invoiceTool.preview.docLabel": "Fatura-Recibo",
  "invoiceTool.preview.issued": "Emitida a {date}",
  "invoiceTool.preview.due": "Vencimento a {date}",
  "invoiceTool.preview.billedTo": "Faturado a",
  "invoiceTool.preview.nifLine": "NIF {nif}",
  "invoiceTool.preview.subtotal": "Subtotal",
  "invoiceTool.preview.ivaLabel": "IVA ({rate}%)",
  "invoiceTool.preview.total": "Total",
  "invoiceTool.preview.notesTitle": "Notas",

  // ── ScopeForm / ScopePreview / ScopeGeneratorPage ──────────────────────
  "scopeTool.title": "Define o <em>âmbito.</em>",
  "scopeTool.sub":
    "Um âmbito claro (e o que fica de fora) evita a maioria dos conflitos. Cria um e envia um PDF.",
  "scopeTool.projectLabel": "Projeto",
  "scopeTool.projectPlaceholder": "ex.: Renovação de marca e site",
  "scopeTool.clientLabel": "Nome do cliente",
  "scopeTool.clientPlaceholder": "Para quem é",
  "scopeTool.includedLegend": "O que está incluído",
  "scopeTool.includedHint": "As entregas a que te comprometes.",
  "scopeTool.includedPlaceholder": "Uma entrega",
  "scopeTool.includedAdd": "Adicionar entrega",
  "scopeTool.excludedLegend": "Não incluído",
  "scopeTool.excludedHint":
    "Nomear exclusões à partida evita a maioria dos conflitos.",
  "scopeTool.excludedPlaceholder": "Algo fora do âmbito",
  "scopeTool.excludedAdd": "Adicionar exclusão",
  "scopeTool.itemAriaLabel": "Item {index} de {legend}",
  "scopeTool.removeItemAriaLabel": "Remover item {index} de {legend}",
  "scopeTool.revisionsLabel": "Revisões",
  "scopeTool.revisionsPlaceholder": "ex.: 2 rondas por entrega",
  "scopeTool.milestonesLabel": "Marcos & condições",
  "scopeTool.milestonesPlaceholder":
    "Calendário de pagamentos, prazos, condições…",
  "scopeTool.priceLabel": "Preço (opcional)",
  "scopeTool.pricePlaceholder": "Deixa vazio para ser só o âmbito",
  "scopeTool.validUntilLabel": "Válido até",
  "scopeTool.preview.yourNameFallback": "O teu nome",
  "scopeTool.preview.quote": "Orçamento",
  "scopeTool.preview.scopeOfWork": "Âmbito de Trabalho",
  "scopeTool.preview.untitledProject": "Projeto sem título",
  "scopeTool.preview.forClient": "Para {client}",
  "scopeTool.preview.forYourClient": "Para o teu cliente",
  "scopeTool.preview.included": "O que está incluído",
  "scopeTool.preview.addDeliverable": "Adiciona pelo menos uma entrega.",
  "scopeTool.preview.notIncluded": "Não incluído",
  "scopeTool.preview.revisions": "Revisões",
  "scopeTool.preview.milestones": "Marcos & condições",
  "scopeTool.preview.total": "Total",
  "scopeTool.preview.validUntil": "Válido até {date}",
  "scopeTool.disclaimer":
    "Este documento é um âmbito de trabalho. Só um contrato assinado cria obrigações vinculativas. Tudo o que fique de fora de “O que está incluído” cai fora do âmbito e é orçamentado à parte.",
  "scopeTool.plainText.quote": "ORÇAMENTO",
  "scopeTool.plainText.scopeOfWork": "ÂMBITO DE TRABALHO",
  "scopeTool.plainText.from": "De: {name}",
  "scopeTool.plainText.for": "Para: {name}",
  "scopeTool.plainText.project": "Projeto: {name}",
  "scopeTool.plainText.included": "O que está incluído",
  "scopeTool.plainText.notIncluded": "Não incluído",
  "scopeTool.plainText.revisions": "Revisões: {value}",
  "scopeTool.plainText.terms": "Condições: {value}",
  "scopeTool.plainText.total": "Total: {value}",
  "scopeTool.plainText.validUntil": "Válido até: {date}",

  // ── ContractForm / ContractClauses / ContractPreview / ContractGeneratorPage ──
  // Scope note: CLAUSES/DOC_STRINGS in contract.data.ts are the CONTRACT
  // DOCUMENT's own output-language toggle (English/Português, chosen by the
  // member for the generated legal document) — orthogonal to the app's UI
  // language and already bilingual by design. Left untouched. Only the
  // surrounding app chrome (this section) follows the app locale.
  "contractTool.title": "Cria um <em>contrato.</em>",
  "contractTool.sub":
    "Um acordo de prestação de serviços claro, pronto em minutos. Preenche o trabalho, escolhe as cláusulas que te protegem e exporta um PDF real. Tudo no teu navegador.",
  "contractTool.docLanguageLegend": "Idioma do documento",
  "contractTool.docLanguageAriaLabel": "Idioma do documento",
  "contractTool.providerLegend": "Tu (quem presta o serviço)",
  "contractTool.clientLegend": "O teu cliente",
  "contractTool.nameLabel": "Nome",
  "contractTool.nifLabel": "NIF / IVA",
  "contractTool.providerNamePlaceholder": "O teu nome ou estúdio",
  "contractTool.providerNifPlaceholder": "123 456 789",
  "contractTool.clientNamePlaceholder": "Nome do cliente ou empresa",
  "contractTool.clientNifPlaceholder": "987 654 321",
  "contractTool.projectTitleLabel": "Título do projeto",
  "contractTool.projectTitlePlaceholder":
    "ex.: Identidade de marca para a Casa Aurora",
  "contractTool.scopeLabel": "Âmbito de trabalho",
  "contractTool.scopePlaceholder":
    "O que vais entregar, e o que fica fora do âmbito.",
  "contractTool.feeLabel": "Honorários",
  "contractTool.feePlaceholder": "ex.: 2400 € + IVA",
  "contractTool.timelineLabel": "Prazos",
  "contractTool.timelinePlaceholder": "ex.: 6 semanas a partir da assinatura",
  "contractTool.paymentTermsLabel": "Condições de pagamento",
  "contractTool.paymentTermsPlaceholder":
    "ex.: 50% na assinatura, 50% na entrega",
  "contractTool.governingLawLabel": "Lei aplicável",
  "contractTool.governingLawPlaceholder": "Portugal",

  // ── ComparatorForm / ComparatorResult / ComparatorPage ─────────────────
  "comparator.title": "Por conta própria ou <em>por conta de outrem?</em>",
  "comparator.sub":
    "Compara o que levarias para casa numa e noutra situação, com o mesmo rendimento bruto, e pesa os custos que não aparecem no recibo de vencimento.",
  "comparator.form.grossLabel": "Rendimento bruto anual (€)",
  "comparator.form.grossPlaceholder": "ex.: 30000",
  "comparator.form.activityLabel": "Tipo de atividade independente",
  "comparator.form.yearLabel": "Ano fiscal",
  "comparator.form.startupLabel": "Início de atividade",
  "comparator.activityOption.services": "Profissão liberal (0,75)",
  "comparator.activityOption.otherServices": "Outros serviços (0,35)",
  "comparator.activityOption.goods": "Venda de bens / hotelaria (0,15)",
  "comparator.activityOption.ipCapital":
    "Propriedade intelectual / capital (0,95)",
  "comparator.startupOption.none": "Fora dos primeiros 2 anos",
  "comparator.startupOption.year1": "Primeiro ano (coeficiente ×0,5)",
  "comparator.startupOption.year2": "Segundo ano (coeficiente ×0,75)",
  "comparator.result.freelanceLabel": "Por conta própria",
  "comparator.result.salariedLabel": "Por conta de outrem",
  "comparator.result.perMonth": "/ mês",
  "comparator.result.segurancaSocial": "− Segurança Social",
  "comparator.result.irs": "− IRS",
  "comparator.result.effectiveRate": "Taxa efetiva",
  "comparator.result.bottomLine": "A conclusão",
  "comparator.result.summaryMore":
    "Por conta própria, ficarias com <em>mais {amount}</em> por ano",
  "comparator.result.summaryLess":
    "Por conta própria, ficarias com <em>menos {amount}</em> por ano",
  "comparator.result.subMore":
    "com {gross} brutos, cerca de {monthly} a mais por mês no teu bolso, antes dos custos abaixo.",
  "comparator.result.subLess":
    "com {gross} brutos, cerca de {monthly} a menos por mês, antes dos custos abaixo.",
  "comparator.result.costsTitle":
    "O que o <em>recibo de vencimento</em> não mostra",
  "comparator.hiddenCost.noHoliday":
    "Sem férias pagas. As tuas folgas saem do teu bolso.",
  "comparator.hiddenCost.noSubsidio":
    "Sem subsídio de férias nem de Natal (os dois meses extra de quem trabalha por conta de outrem).",
  "comparator.hiddenCost.noSickLeave":
    "Sem baixa por doença paga nem cobertura de desemprego garantida.",
  "comparator.hiddenCost.ownSS":
    "Pagas a tua própria Segurança Social, trimestralmente.",
  "comparator.hiddenCost.lumpyIncome":
    "O rendimento é irregular, meses de fartura e meses de vacas magras.",
  "comparator.hiddenCost.upside":
    "Mas: despesas dedutíveis, autonomia, e podes cobrar mais.",

  // ── RateBoardForm / RateBoardStats / RateBoardPage ─────────────────────
  "rateBoard.title": "O que <em>cobras</em> mesmo.",
  "rateBoard.sub":
    "Um quadro de tarifas privado que vive neste dispositivo. Adiciona as tuas tarifas, vê a distribuição a crescer e exporta o ficheiro quando quiseres comparar com pessoas em quem confias.",
  "rateBoard.form.title": "Adiciona a tua tarifa",
  "rateBoard.form.hint":
    "Sem nome, sem email. Só os números. Fica neste dispositivo até exportares.",
  "rateBoard.form.roleLabel": "Função",
  "rateBoard.form.experienceLabel": "Experiência",
  "rateBoard.form.dayRateLabel": "Tarifa diária (€)",
  "rateBoard.form.dayRatePlaceholder": "ex.: 350",
  "rateBoard.form.typeLabel": "Tipo",
  "rateBoard.form.addCta": "Adicionar ao quadro",
  "rateBoard.form.compareLabel": "Vê onde te situas",
  "rateBoard.form.comparePlaceholder": "A tua tarifa diária (€)",
  "rateBoard.form.compareHint":
    "Mostramos o teu percentil face às tarifas deste quadro. Nada é adicionado ao quadro.",
  "rateBoard.form.addedToast": "Adicionado ao teu quadro",
  "rateBoard.experienceOption.junior": "Júnior (0 a 2 anos)",
  "rateBoard.experienceOption.mid": "Intermédio (3 a 5 anos)",
  "rateBoard.experienceOption.senior": "Sénior (6 a 9 anos)",
  "rateBoard.experienceOption.lead": "Lead (10+ anos)",
  "rateBoard.typeOption.freelance": "Por conta própria",
  "rateBoard.typeOption.employed": "Por conta de outrem (equivalente diário)",
  "rateBoard.roleOption.designer": "Design",
  "rateBoard.roleOption.softwareEngineer": "Engenharia de software",
  "rateBoard.roleOption.writer": "Escrita",
  "rateBoard.roleOption.photographer": "Fotografia",
  "rateBoard.roleOption.consultant": "Consultoria",
  "rateBoard.roleOption.other": "Outro",
  "rateBoard.stats.emptyTitle": "Ainda não há nada <em>aqui.</em>",
  "rateBoard.stats.emptyBody":
    "Adiciona a tua primeira tarifa, ou importa um ficheiro JSON que alguém te tenha partilhado. A distribuição aparece aqui assim que este dispositivo tiver dados.",
  "rateBoard.stats.communityMedian": "Tarifa diária mediana neste quadro",
  "rateBoard.stats.across": "em",
  "rateBoard.stats.rateCount_one": "{count} tarifa",
  "rateBoard.stats.rateCount_other": "{count} tarifas",
  "rateBoard.stats.roleCount_one": "{count} função",
  "rateBoard.stats.roleCount_other": "{count} funções",
  "rateBoard.stats.yourRateSits": "A tua tarifa de {rate} situa-se no",
  "rateBoard.stats.percentileValue": "percentil {percentile}",
  "rateBoard.stats.aboveMost": "Acima de {percent}% das tarifas deste quadro.",
  "rateBoard.stats.belowMost":
    "Abaixo da maioria das tarifas deste quadro. Podes estar a deixar dinheiro em cima da mesa.",
  "rateBoard.disclaimer":
    "Tudo o que está aqui foi escrito por ti e pelas pessoas que te enviaram um ficheiro: valores autodeclarados e não verificados. Cada situação é diferente, por isso trata estes números como um ponto de partida para a conversa. Guardado apenas neste dispositivo e nunca enviado para lado nenhum.",
  "rateBoard.export": "Exportar JSON",
  "rateBoard.import": "Importar JSON",
  "rateBoard.importAriaLabel": "Importar um ficheiro JSON do quadro de tarifas",
  "rateBoard.exportedToast": "Exportado",
  "rateBoard.invalidFileToast":
    "Esse ficheiro não é um quadro de tarifas. Tem de ser uma lista (array) JSON.",
  "rateBoard.noValidEntriesToast":
    "Não foram encontradas entradas válidas nesse ficheiro.",
  "rateBoard.importedToast_one": "{count} entrada importada",
  "rateBoard.importedToast_other": "{count} entradas importadas",
  "rateBoard.readErrorToast":
    "Não foi possível ler esse ficheiro. É JSON válido?",
  "rateBoard.readErrorGenericToast": "Não foi possível ler esse ficheiro.",

  // ── SetAsideForm / SetAsideResult / SetAsidePlannerPage ────────────────
  "setAside.title": "Poupa para os <em>impostos.</em>",
  "setAside.sub":
    "Calcula quanto de cada fatura poupar agora, para as contas do IRS e da Segurança Social não doerem depois.",
  "setAside.yourYearLegend": "O teu ano",
  "setAside.grossLabel": "Bruto anual esperado",
  "setAside.grossPlaceholder": "30000",
  "setAside.grossHint":
    "Tudo o que esperas faturar este ano, antes de impostos.",
  "setAside.activityLabel": "Atividade",
  "setAside.yearLabel": "Ano fiscal",
  "setAside.activityOption.services":
    "Serviços (profissões liberais, art. 151.º)",
  "setAside.activityOption.otherServices":
    "Outros serviços (fora do conjunto de 0,75)",
  "setAside.activityOption.goods": "Venda de bens / hotelaria",
  "setAside.logInvoiceLegend": "Registar uma fatura",
  "setAside.logInvoiceHint":
    "Adiciona cada pagamento à medida que chega. Somamos o que já devias ter poupado.",
  "setAside.amountLabel": "Valor recebido",
  "setAside.amountPlaceholder": "1200",
  "setAside.dateLabel": "Data",
  "setAside.addCta": "Adicionar à poupança",
  "setAside.removeAriaLabel": "Remover fatura de {amount}",
  "setAside.result.parkKicker": "Por cada fatura, poupa",
  "setAside.result.title":
    "Poupa <em>{percent}%</em> de cada euro que faturas.",
  "setAside.result.body":
    "Com os {gross} que esperas faturar, são cerca de {monthly} por mês que guardas para o IRS e a Segurança Social e não gastas.",
  "setAside.result.parkPerMonth": "Poupar por mês",
  "setAside.result.parkThisYear": "Poupar este ano",
  "setAside.result.potLabel": "A tua poupança para impostos",
  "setAside.result.potCount_one": "{count} fatura registada",
  "setAside.result.potCount_other": "{count} faturas registadas",
  "setAside.result.potEmpty":
    "Regista a tua primeira fatura para começares a poupança.",
  "setAside.result.potSub":
    "{percent}% dos {logged} que já registaste. Mantém este valor intocado.",

  // ── TakeHomeForm / TakeHomeResult / TakeHomeCalculatorPage ─────────────
  "takeHome.title": "O que realmente <em>levas para casa.</em>",
  "takeHome.sub":
    "Indica o teu bruto anual e estimamos o que sobra depois do IRS e da Segurança Social no regime simplificado, recalculado em tempo real.",
  "takeHome.grossLabel": "Rendimento bruto anual (€)",
  "takeHome.grossPlaceholder": "ex.: 30000",
  "takeHome.activityLabel": "Tipo de atividade",
  "takeHome.statusLabel": "Situação profissional",
  "takeHome.yearLabel": "Ano fiscal",
  "takeHome.startupLabel": "Início de atividade",
  "takeHome.activityOption.services": "Profissão liberal (0,75)",
  "takeHome.activityOption.otherServices": "Outros serviços (0,35)",
  "takeHome.activityOption.goods": "Venda de bens / hotelaria (0,15)",
  "takeHome.activityOption.ipCapital":
    "Propriedade intelectual / capital (0,95)",
  "takeHome.startupOption.none": "Fora dos primeiros 2 anos",
  "takeHome.startupOption.year1": "Ano 1 (coeficiente ×0,5)",
  "takeHome.startupOption.year2": "Ano 2 (coeficiente ×0,75)",
  "takeHome.statusOption.freelancer": "Trabalho independente (21,4% SS)",
  "takeHome.statusOption.eni": "ENI, empresário em nome individual (25,2% SS)",
  "takeHome.result.netLabel":
    "O que te fica, depois do IRS e da Segurança Social",
  "takeHome.result.perMonth": "por mês",
  "takeHome.result.keepCaption":
    "Ficas com <em>{percent}%</em> de cada euro que faturas. Taxa efetiva IRS + SS: {rate}%.",
  "takeHome.result.barAriaLabel":
    "Ficas com {percent}% do teu rendimento bruto",
  "takeHome.result.annualGross": "Bruto anual",
  "takeHome.result.segurancaSocial": "− Segurança Social",
  "takeHome.result.taxableIncome": "Rendimento tributável",
  "takeHome.result.irs": "− IRS",
  "takeHome.result.netTakeHome": "Líquido final",

  // ── DayRateCalculatorPage / DayRateResult ──────────────────────────────
  "dayRate.title": "Põe preço ao teu <em>dia.</em>",
  "dayRate.sub":
    "Parte do rendimento de que precisas para chegar a uma tarifa diária (e horária) que te sustente mesmo, com despesas gerais, dias não pagos e IVA incluídos.",
  "dayRate.annualLabel": "Rendimento anual pretendido (€)",
  "dayRate.daysLabel": "Dias faturáveis por ano",
  "dayRate.overheadLabel": "Despesas gerais (% do rendimento)",
  "dayRate.hoursLabel": "Horas por dia faturável",
  "dayRate.ivaLabel": "Taxa de IVA",
  "dayRate.result.heading": "A tua tarifa diária",
  "dayRate.result.minLabel": "Tarifa diária mínima (sem IVA)",
  "dayRate.result.withIvaLabel": "Com IVA",
  "dayRate.result.hourlyLabel": "Por hora (sem IVA)",
  "dayRate.result.note":
    "Um ponto de partida: ajusta-o ao teu setor e ao teu mercado.",

  // ── SlidingScaleForm / SlidingScalePreview / SlidingScalePage ──────────
  "slidingScale.title": "Cobra com <em>solidariedade.</em>",
  "slidingScale.sub":
    "Publica uma escala variável para que cada pessoa pague o que puder e tu continues a receber de forma justa. Exporta um cartão para partilhar.",
  "slidingScale.yourNameLabel": "O teu nome",
  "slidingScale.yourNamePlaceholder": "O nome que as pessoas vão ver",
  "slidingScale.serviceLabel": "Serviço / oferta",
  "slidingScale.servicePlaceholder": "ex.: Sessão de coaching individual",
  "slidingScale.introLabel": "Linha de introdução",
  "slidingScale.introPlaceholder": "Uma frase calorosa que enquadra a escala.",
  "slidingScale.tierLegend": "Nível {index}",
  "slidingScale.tierNameLabel": "Nome do nível",
  "slidingScale.tierNamePlaceholder": "ex.: Apoio",
  "slidingScale.tierPriceLabel": "Preço",
  "slidingScale.tierPricePlaceholder": "ex.: 60 €",
  "slidingScale.tierForWhomLabel": "Para quem é",
  "slidingScale.tierForWhomPlaceholder":
    "Uma indicação honesta que ajuda cada pessoa a escolher o seu nível.",
  "slidingScale.preview.kind": "Escala variável",
  "slidingScale.preview.yourNameFallback": "O teu nome",
  "slidingScale.preview.offeringFallback": "A tua oferta",
  "slidingScale.preview.tierFallback": "Nível",
  "slidingScale.preview.priceFallback": "Por definir",
  "slidingScale.preview.outro":
    "Paga o nível que for honesto para ti. Escolher um valor mais alto mantém este trabalho acessível a todas as pessoas.",
  "slidingScale.disclaimer":
    "Estes níveis são os preços desta pessoa, uma escala variável oferecida de boa-fé. Os valores variam de pessoa para pessoa, e ninguém te pede prova de rendimentos.",

  // ── ReciboVerdeGuidePage (page chrome only — see report re: GUIDE_SECTIONS) ──
  // Scope note: the guide's own section titles/bodies (reciboVerdeGuide.data.tsx
  // GUIDE_SECTIONS) are dense, article-citing pt-PT tax/legal explanations —
  // flagged and deliberately left English rather than risk a subtly wrong tax
  // instruction. Only this page's surrounding chrome is translated.
  "reciboGuide.heroTitle": "O guia dos <em>recibos verdes.</em>",
  "reciboGuide.heroLead":
    "Trabalhar por conta própria em Portugal não devia significar afogares-te em jargão. Aqui tens todo o sistema de recibos verdes em linguagem simples e próxima: como abrir atividade, o que vais ter de pagar e as poucas datas que importam mesmo. Lê uma secção de cada vez.",
  "reciboGuide.ctaTitle": "Vamos <em>enviar uma?</em>",
  "reciboGuide.ctaText":
    "A ferramenta de faturação transforma tudo o que leste numa fatura-recibo pronta, com os coeficientes certos, as notas certas e as contas certas.",
  "reciboGuide.makeInvoiceCta": "Cria uma fatura",
  "reciboGuide.backToEconomy": "Voltar à Economia",
  "reciboGuide.disclaimerTitle": "Não é <em>aconselhamento fiscal.</em>",

  // ── HousingCoopPage (+ Sections) ────────────────────────────────────────
  // Scope note: housingCoop.data.ts's FORMING_COOPS (specific co-ops, member
  // counts, financials) is a directory of real-world entries — in live mode
  // this would be fetched. Left in English, same as the grants directory.
  // COOP_STATS/COOP_PHASES/COOP_TEMPLATES/COOP_RESOURCES are platform-authored
  // programme content (same shape as `incubator.step.*`, which IS translated)
  // and are now swept below.
  "housingCoop.backLabel": "Habitação",
  "housingCoop.hero.eyebrow":
    "Formação de cooperativas de habitação · Portugal primeiro, outros países depois",
  "housingCoop.hero.title": "Cria uma cooperativa <em>em conjunto</em>.",
  "housingCoop.hero.sub":
    "Um kit de ferramentas para formar uma cooperativa de habitação queer em Portugal: encontrar as pessoas, a constituição legal, o financiamento, o imóvel e a governação do dia a dia. <em>Cinco fases, com modelos para a maioria delas.</em>",
  "housingCoop.hero.statsHead": "Cooperativas a formar-se agora",
  "housingCoop.phases.title": "Cinco <em>fases</em> da ideia às chaves",
  "housingCoop.phases.sub": "Os modelos abaixo seguem estas fases.",
  "housingCoop.grid.title": "Cooperativas a <em>formar-se agora</em>",
  "housingCoop.grid.seeAll": "Ver as 8",
  "housingCoop.templates.title": "Modelos & <em>ferramentas</em>",
  "housingCoop.templates.sub":
    "Documentos para cada etapa da formação de uma cooperativa, para leres e adaptares. Pede aconselhamento jurídico antes de assinares seja o que for.",
  "housingCoop.templates.read": "Ler",
  "housingCoop.startCta.eyebrow": "Começa uma cooperativa",
  "housingCoop.startCta.title": "Ainda não tens <em>o teu grupo</em>?",
  "housingCoop.startCta.body":
    "Formar uma cooperativa começa com algumas pessoas que querem a mesma coisa. Publicar que estás a começar é como vais encontrar outras pessoas que também querem.",
  "housingCoop.startCta.postCta": "Publica que estás a começar",
  "housingCoop.startCta.storyCta": "Lê a história da Casa Sambizanga",
  "housingCoop.startCta.resourcesHead": "Recursos & pessoas mentoras",

  // ── Estado vazio de "a formar-se agora" (CoopEmptyState) ────────────────
  "housingCoop.empty.title": "Ainda nenhuma cooperativa",
  "housingCoop.empty.titleEm": "a formar-se",
  "housingCoop.empty.body":
    "É aqui que vais encontrar grupos a organizar habitação em conjunto. Publica que estás a começar e vamos ajudar-te a encontrar o teu grupo.",
  "housingCoop.empty.cta": "Publica que estás a começar",

  // ── CoopTemplatePage (documentos-modelo de formação) ────────────────────
  "coopTemplate.back": "Voltar às cooperativas de habitação",
  "coopTemplate.disclaimer":
    "Este é um modelo de partida. Adapta-o com o teu grupo e, sempre que tiver peso legal, com apoio jurídico ou notarial.",

  // ── CoopTemplatePage: prosa dos documentos-modelo de formação ───────────
  // pt-PT co-op template — DRAFT machine translation, requires professional
  // legal review before launch. This is legal/governance prose translated as a
  // first draft; it is NOT legally verified. Do not treat any figure or clause
  // as advice. Keys are at EN/pt parity (see catalog parity test) and mirror the
  // document shape in src/features/economy/coopTemplateContent.data.tsx.
  // founding-values
  "coopTemplate.doc.founding-values.tag": "Fase 1 · modelo",
  "coopTemplate.doc.founding-values.title": "Carta de valores",
  "coopTemplate.doc.founding-values.titleEm": "fundadores",
  "coopTemplate.doc.founding-values.intro":
    "A vossa carta de valores fundadores é a primeira coisa que o grupo escreve em conjunto, antes de um pedido de crédito à habitação, antes de um contrato de arrendamento, antes de alguém assinar seja o que for com um banco ou um notário. Põe por palavras o que estão a construir e para quem, para que daqui a seis meses, quando o dinheiro apertar ou uma decisão for difícil, tenham algo a que voltar em conjunto. Trata tudo o que se segue como um primeiro rascunho: lê-o em voz alta em grupo, risca o que não encaixa e reescreve-o por palavras vossas até soar a vocês.",
  "coopTemplate.doc.founding-values.s0.h":
    "Porque estamos a formar esta cooperativa",
  "coopTemplate.doc.founding-values.s0.b0":
    "Começa com uma ou duas frases que digam, com clareza, para que serve esta cooperativa. Escreve-a como uma resposta privada para quem vai assinar os títulos de capital. De que se estão a proteger mutuamente e o que estão a construir?",
  "coopTemplate.doc.founding-values.s0.b1.0":
    "Estamos a formar esta cooperativa para que ninguém tenha de escolher entre continuar no armário e ter casa.",
  "coopTemplate.doc.founding-values.s0.b1.1":
    "Queremos uma casa onde o envelhecimento, a deficiência e as necessidades de cuidados sejam planeados com tempo.",
  "coopTemplate.doc.founding-values.s0.b1.2":
    "Estamos a juntar o que temos para que quem não conseguiria pagar uma casa a solo possa continuar na cidade a que chama lar.",
  "coopTemplate.doc.founding-values.s1.h":
    "Quem somos, e para quem é esta casa",
  "coopTemplate.doc.founding-values.s1.b0":
    "Diz explicitamente quem pertence aqui e em que termos. O silêncio sobre este ponto tende a favorecer quem já tem poder no grupo, por isso, põe-no por escrito.",
  "coopTemplate.doc.founding-values.s1.b1.0":
    "Esta casa acolhe e afirma as pessoas queer e trans. Usamos os nomes e pronomes que as pessoas nos pedem, sem discussão, desde o primeiro dia.",
  "coopTemplate.doc.founding-values.s1.b1.1":
    "Comprometemo-nos a trabalhar ativamente contra o racismo, a transfobia, o capacitismo e o classismo em quem admitimos, na forma como falamos entre nós e em quem tem prioridade nas reparações e no orçamento.",
  "coopTemplate.doc.founding-values.s1.b1.2":
    "Vamos tornar os nossos espaços físicos e os nossos processos de decisão tão acessíveis quanto formos capazes, e vamos continuar a melhorá-los à medida que as necessidades de quem cá vive mudam.",
  "coopTemplate.doc.founding-values.s1.b1.3":
    "Quem se junta à cooperativa entra através de [descreve aqui o vosso processo, um período experimental, um sistema de votos de confiança, uma votação de todo o grupo].",
  "coopTemplate.doc.founding-values.s2.h": "Como decidimos em conjunto",
  "coopTemplate.doc.founding-values.s2.b0":
    "Escolhe um método antes de precisares de um sob pressão. Muitas cooperativas começam pelo consenso e acrescentam uma alternativa para quando o consenso emperra.",
  "coopTemplate.doc.founding-values.s2.b1.0":
    "As decisões do dia a dia (pequenas reparações, política de visitas, o calendário partilhado) são tomadas pelas pessoas afetadas, que informam o grupo depois.",
  "coopTemplate.doc.founding-values.s2.b1.1":
    "As decisões ao nível da casa (alterações ao orçamento, entrada de novas pessoas, regras da casa) vão à assembleia geral, com um quórum definido.",
  "coopTemplate.doc.founding-values.s2.b1.2":
    "Quando não se chega a consenso depois de um esforço genuíno, recorremos a [uma maioria qualificada, um período de reflexão e nova votação, uma pessoa facilitadora externa]. Decide isto agora, enquanto ainda é hipotético.",
  "coopTemplate.doc.founding-values.s3.h": "Como cuidamos de toda a gente",
  "coopTemplate.doc.founding-values.s3.b0":
    "Os compromissos de segurança e de cuidado têm lugar aqui, no documento que o grupo lê de facto.",
  "coopTemplate.doc.founding-values.s3.b1.0":
    "Vamos sabendo como está cada pessoa, sobretudo quem atravessa um momento difícil, sem que isso fique a cargo de uma só pessoa.",
  "coopTemplate.doc.founding-values.s3.b1.1":
    "Temos um plano para o que acontece se alguém não estiver em segurança em casa, por causa de uma relação, da família ou de qualquer outra pessoa, e esse plano não depende de essa pessoa saber pedir ajuda na perfeição.",
  "coopTemplate.doc.founding-values.s3.b1.2":
    "Nunca revelamos a orientação ou identidade de ninguém, seja à família, a quem nos arrenda casa, a entidades empregadoras ou aos contactos de cada pessoa, por motivo algum.",
  "coopTemplate.doc.founding-values.s4.h": "Dinheiro e equidade",
  "coopTemplate.doc.founding-values.s4.b0":
    "Diz com clareza o que significa equidade para o vosso grupo antes de o modelo financeiro (ver o Modelo financeiro explicado) o transformar em números.",
  "coopTemplate.doc.founding-values.s4.b1.0":
    "As contribuições são ajustadas ao que cada pessoa consegue realmente pagar.",
  "coopTemplate.doc.founding-values.s4.b1.1":
    "Ninguém perde a sua casa por causa de dinheiro sem que o grupo tente primeiro, em conjunto, todas as alternativas (ver o Acordo de honestidade financeira e o Processo de resolução de conflitos).",
  "coopTemplate.doc.founding-values.s4.b1.2":
    "A informação financeira da cooperativa está sempre disponível para toda a gente que dela faz parte. Aqui não há contas escondidas.",
  "coopTemplate.doc.founding-values.s5.h": "Rever estes valores",
  "coopTemplate.doc.founding-values.s5.b0":
    "Os valores perdem-se se ninguém os voltar a ler. Marca uma data concreta no calendário.",
  "coopTemplate.doc.founding-values.s5.b1.0":
    "Voltamos a ler esta carta em conjunto pelo menos uma vez por ano, e depois de qualquer acontecimento importante que a tenha posto à prova.",
  "coopTemplate.doc.founding-values.s5.b1.1":
    "As alterações precisam de [uma maioria qualificada / consenso total, decidam qual] e só produzem efeito depois de toda a gente na cooperativa ter visto a redação proposta.",
  "coopTemplate.doc.founding-values.s5.b2":
    "Esta carta é um modelo de partida. A versão que conta é a que o vosso grupo alcançar depois de muita discussão, e que revê todos os anos.",
  // financial-honesty
  "coopTemplate.doc.financial-honesty.tag": "Fase 1 · modelo",
  "coopTemplate.doc.financial-honesty.title": "Acordo de honestidade",
  "coopTemplate.doc.financial-honesty.titleEm": "financeira",
  "coopTemplate.doc.financial-honesty.intro":
    "Problemas de dinheiro não ditos podem afundar uma cooperativa de habitação. Este acordo existe para que quem esteja com dificuldades o diga logo na segunda semana, enquanto o problema ainda é pequeno, e para que ninguém tenha de adivinhar quanto as outras pessoas ganham, devem ou receiam. Adapta os pormenores ao vosso grupo; mantém o princípio de que toda a gente vê os mesmos números.",
  "coopTemplate.doc.financial-honesty.s0.h":
    "O que significa aqui total transparência",
  "coopTemplate.doc.financial-honesty.s0.b0":
    "Transparência financeira significa que toda a gente vê os mesmos números sobre a cooperativa e que o grupo acorda antecipadamente que informação individual é partilhada, e porquê.",
  "coopTemplate.doc.financial-honesty.s0.b1.0":
    "Qualquer pessoa da cooperativa pode consultar o livro de contas partilhado a qualquer momento do ano.",
  "coopTemplate.doc.financial-honesty.s0.b1.1":
    "Os valores das contribuições individuais (se ajustados ao rendimento) são visíveis para o grupo, mas os recibos de vencimento ou as declarações de IRS que lhes dão origem não o são, a menos que a própria pessoa opte por partilhá-los.",
  "coopTemplate.doc.financial-honesty.s0.b1.2":
    "Não existem acordos paralelos sobre dinheiro fora deste documento e do livro de contas partilhado.",
  "coopTemplate.doc.financial-honesty.s1.h":
    "O que cada pessoa revela, e quando",
  "coopTemplate.doc.financial-honesty.s1.b0":
    "Deixa claro o que é pedido na entrada e o que é pedido de forma contínua.",
  "coopTemplate.doc.financial-honesty.s1.b1.0":
    "Na entrada: se consegues cobrir o valor total do título de capital, em que calendário, e qualquer apoio que tragas para o fundo de solidariedade do grupo ou de que precises dele.",
  "coopTemplate.doc.financial-honesty.s1.b1.1":
    "De forma contínua: qualquer mudança que afete a tua capacidade de pagar, perda de emprego, doença, alteração de horário, comunicada a [uma pessoa responsável pelas finanças / todo o grupo] assim que souberes, bem antes de falhares um pagamento.",
  "coopTemplate.doc.financial-honesty.s1.b1.2":
    "Anualmente: uma revisão conjunta para verificar se as contribuições ainda refletem as circunstâncias reais das pessoas.",
  "coopTemplate.doc.financial-honesty.s2.h": "O livro de contas partilhado",
  "coopTemplate.doc.financial-honesty.s2.b0":
    "Indica a ferramenta concreta e a regra de acesso.",
  "coopTemplate.doc.financial-honesty.s2.b1.0":
    "O livro de contas fica em [uma folha de cálculo partilhada, um programa de contabilidade] que qualquer pessoa da cooperativa pode abrir, ler e exportar a qualquer momento.",
  "coopTemplate.doc.financial-honesty.s2.b1.1":
    "Uma ou duas pessoas assumem a responsabilidade pelas finanças, com rotação a cada [ano], e mantêm os registos atualizados e abertos a todo o grupo.",
  "coopTemplate.doc.financial-honesty.s2.b1.2":
    "Cada pagamento, de entrada ou de saída, é registado no prazo de [uma semana], com uma nota em linguagem simples. Nenhuma rubrica que ninguém saiba explicar.",
  "coopTemplate.doc.financial-honesty.s3.h":
    "Lidar com atrasos de pagamento com dignidade",
  "coopTemplate.doc.financial-honesty.s3.b0":
    "Escreve este processo antes de alguém estar realmente em atraso. É muito mais difícil chegar a acordo quando já é pessoal.",
  "coopTemplate.doc.financial-honesty.s3.b1.0":
    "Um pagamento em falta dá origem a uma conversa privada e não punitiva no prazo de duas semanas, entre as pessoas diretamente envolvidas.",
  "coopTemplate.doc.financial-honesty.s3.b1.1":
    "A pessoa e quem é responsável pelas finanças acordam em conjunto um plano de pagamento; ao grupo diz-se apenas que existe um plano, e os pormenores pessoais ficam com essa pessoa, a menos que os queira partilhar.",
  "coopTemplate.doc.financial-honesty.s3.b1.2":
    "O fundo de solidariedade (abaixo) é oferecido antes de qualquer conversa sobre a saída de alguém.",
  "coopTemplate.doc.financial-honesty.s4.h":
    "Fundo de solidariedade e de emergência",
  "coopTemplate.doc.financial-honesty.s4.b0":
    "Um fundo concreto é o que faz com que o «cuidamos de toda a gente» sobreviva a uma emergência real.",
  "coopTemplate.doc.financial-honesty.s4.b1.0":
    "Cada pessoa contribui com, por exemplo, 10 a 20 € por mês para um fundo de emergência partilhado, separado dos custos de funcionamento.",
  "coopTemplate.doc.financial-honesty.s4.b1.1":
    "O fundo pode cobrir o que falta a alguém durante, por exemplo, até três meses, enquanto se prepara um plano a mais longo prazo.",
  "coopTemplate.doc.financial-honesty.s4.b1.2":
    "Os pedidos são aprovados por [as pessoas responsáveis pelas finanças / maioria simples] no prazo de uma semana, sem obrigação de justificar a dificuldade em pormenor.",
  "coopTemplate.doc.financial-honesty.s5.h": "Revisão anual",
  "coopTemplate.doc.financial-honesty.s5.b0":
    "Marca uma data fixa para que isto seja revisto no prazo previsto, em calma e fora de qualquer crise.",
  "coopTemplate.doc.financial-honesty.s5.b1.0":
    "Uma vez por ano, o grupo revê: se as contribuições ainda correspondem às circunstâncias, se o fundo de emergência está devidamente dotado, e se alguém tem preocupações de dinheiro por dizer.",
  "coopTemplate.doc.financial-honesty.s5.b2":
    "Este acordo é um ponto de partida. Adapta os valores, os prazos e os papéis aos números reais do vosso grupo, e revê-o todos os anos.",
  // crl-statutes
  "coopTemplate.doc.crl-statutes.tag": "Fase 2 · jurídico",
  "coopTemplate.doc.crl-statutes.title": "Estatutos-modelo",
  "coopTemplate.doc.crl-statutes.titleEm": "CRL",
  "coopTemplate.doc.crl-statutes.intro":
    "A Cooperativa de Responsabilidade Limitada (CRL) é uma forma jurídica sob a qual as cooperativas de habitação em Portugal se podem registar. O que se segue é um modelo, em linguagem simples, das secções de que os teus estatutos precisam. Não é o texto jurídico em si nem constitui aconselhamento jurídico. Antes de redigires ou registares seja o que for, leva este esboço e a tua carta de valores fundadores a um escritório de advocacia ou cartório notarial com experiência em direito cooperativo.",
  "coopTemplate.doc.crl-statutes.s0.h": "Nome e sede (sede social)",
  "coopTemplate.doc.crl-statutes.s0.b0":
    "Os teus estatutos abrem com o nome da cooperativa e a sua morada registada (sede social), habitualmente o próprio imóvel ou a morada de um membro até à escritura do imóvel.",
  "coopTemplate.doc.crl-statutes.s0.b1.0":
    "Denominação legal, incluindo a designação obrigatória «Cooperativa de Responsabilidade Limitada» ou «CRL».",
  "coopTemplate.doc.crl-statutes.s0.b1.1": "Sede: município e morada completa.",
  "coopTemplate.doc.crl-statutes.s0.b1.2":
    "Duração: a maioria das cooperativas regista-se por tempo indeterminado.",
  "coopTemplate.doc.crl-statutes.s1.h": "Objeto e âmbito",
  "coopTemplate.doc.crl-statutes.s1.b0":
    "Esta cláusula define o que a cooperativa efetivamente faz. Mantém-na específica para a habitação, mas suficientemente ampla para abranger atividades relacionadas.",
  "coopTemplate.doc.crl-statutes.s1.b1.0":
    "Objeto principal: adquirir, desenvolver e gerir habitação para os seus membros numa base não especulativa e de cobertura de custos.",
  "coopTemplate.doc.crl-statutes.s1.b1.1":
    "Atividades secundárias que podes querer abranger: espaços comuns partilhados, bancos de ferramentas, programação comunitária de pequena escala.",
  "coopTemplate.doc.crl-statutes.s1.b1.2":
    "Uma cláusula que exclua a revenda de frações com fins lucrativos, mantendo a habitação da cooperativa fora do mercado especulativo.",
  "coopTemplate.doc.crl-statutes.s2.h": "Adesão: admissão e saída",
  "coopTemplate.doc.crl-statutes.s2.b0":
    "A lei cooperativa exige, em princípio, uma adesão aberta e não discriminatória, permitindo ainda assim que definas critérios de admissão justos e alinhados com os vossos valores.",
  "coopTemplate.doc.crl-statutes.s2.b1.0":
    "Critérios e processo de admissão, por exemplo, um período experimental, uma entrevista, uma votação da assembleia.",
  "coopTemplate.doc.crl-statutes.s2.b1.1":
    "Condições para a saída voluntária, e o pré-aviso exigido (habitualmente de três a seis meses).",
  "coopTemplate.doc.crl-statutes.s2.b1.2":
    "Fundamentos e processo para a saída involuntária: remete para o teu Processo de resolução de conflitos, para que isto não se decida caso a caso.",
  "coopTemplate.doc.crl-statutes.s3.h": "Direitos e deveres dos membros",
  "coopTemplate.doc.crl-statutes.s3.b0.0":
    "Direito a participar e votar na assembleia geral, um membro, um voto, independentemente da dimensão do título de capital. Este é um princípio cooperativo fundamental, e vale sempre.",
  "coopTemplate.doc.crl-statutes.s3.b0.1":
    "Direito a informação financeira completa sobre a cooperativa (remete para o teu Acordo de honestidade financeira).",
  "coopTemplate.doc.crl-statutes.s3.b0.2":
    "Dever de pagar o capital social e as contribuições contínuas conforme acordado.",
  "coopTemplate.doc.crl-statutes.s3.b0.3":
    "Dever de participar na governação num mínimo acordado: comparecer às assembleias e assumir funções por rotação.",
  "coopTemplate.doc.crl-statutes.s4.h": "Capital e títulos (capital social)",
  "coopTemplate.doc.crl-statutes.s4.b0":
    "A lei cooperativa portuguesa fixa valores mínimos dos títulos de capital e regras para admitir e reembolsar membros (confirma os valores atuais com apoio jurídico). Os estatutos precisam de indicar:",
  "coopTemplate.doc.crl-statutes.s4.b1.0":
    "O valor nominal de um título de capital, e quantos cada membro tem de deter.",
  "coopTemplate.doc.crl-statutes.s4.b1.1":
    "Como se pagam os títulos: na totalidade na admissão, ou em prestações (ver o teu Acordo de quota de membro).",
  "coopTemplate.doc.crl-statutes.s4.b1.2":
    "Como se valorizam e reembolsam os títulos à saída, e em que prazo, para que a cooperativa não seja obrigada a um reembolso de uma só vez que ponha em risco as suas finanças.",
  "coopTemplate.doc.crl-statutes.s5.h": "Órgãos de governação",
  "coopTemplate.doc.crl-statutes.s5.b0":
    "As CRL portuguesas estruturam-se habitualmente em torno de três órgãos. Os teus estatutos atribuem poderes específicos a cada um:",
  "coopTemplate.doc.crl-statutes.s5.b1.0":
    "Assembleia geral: a totalidade dos membros, e a autoridade máxima. Aprova o orçamento, admite e exclui membros, altera os estatutos.",
  "coopTemplate.doc.crl-statutes.s5.b1.1":
    "Direção: um pequeno grupo eleito que trata da administração corrente entre assembleias.",
  "coopTemplate.doc.crl-statutes.s5.b1.2":
    "Conselho fiscal: um órgão independente que analisa as contas e presta contas à assembleia, mantido separado da direção, para que um pequeno grupo não controle ao mesmo tempo a despesa e a fiscalização.",
  "coopTemplate.doc.crl-statutes.s6.h": "Excedentes, reservas e dissolução",
  "coopTemplate.doc.crl-statutes.s6.b0.0":
    "Qualquer excedente de exploração fica na cooperativa, afeto a reservas ou reinvestido no imóvel. É isto que mantém a cooperativa não especulativa.",
  "coopTemplate.doc.crl-statutes.s6.b0.1":
    "Um fundo de reserva legal mínimo, constituído ao longo do tempo, para reparações imprevistas ou faltas de tesouraria.",
  "coopTemplate.doc.crl-statutes.s6.b0.2":
    "Em caso de dissolução, os bens que restarem depois de saldadas as dívidas passam para outra cooperativa ou entidade de fim social e nunca são distribuídos pelos membros como ganho inesperado. É uma exigência legal e um compromisso de valores.",
  "coopTemplate.doc.crl-statutes.s6.b1":
    "Este é um esboço em linguagem simples. Os estatutos registáveis são um documento formal à parte: leva isto, juntamente com a tua carta de valores fundadores, a um escritório de advocacia ou cartório notarial que trabalhe com direito cooperativo antes de redigires o documento que vais efetivamente registar.",
  // share-agreement
  "coopTemplate.doc.share-agreement.tag": "Fase 2 · jurídico",
  "coopTemplate.doc.share-agreement.title": "Acordo de quota",
  "coopTemplate.doc.share-agreement.titleEm": "de membro",
  "coopTemplate.doc.share-agreement.intro":
    "Um acordo de quota de membro é o contrato individual entre a cooperativa e uma pessoa associada. Transforma os estatutos, que são do grupo, num documento que uma pessoa concreta assina, com números concretos ao lado do seu nome. Lê-o como um modelo para preencher em conjunto e rever com apoio jurídico antes de alguém assinar.",
  "coopTemplate.doc.share-agreement.s0.h": "A que dá direito a quota",
  "coopTemplate.doc.share-agreement.s0.b0":
    "Diz com clareza a que é que a adesão dá direito, e a que não dá.",
  "coopTemplate.doc.share-agreement.s0.b1.0":
    "Uma quota de membro no valor de, por exemplo, 5000 €, que dá direito a ocupar [uma fração descrita] e a um voto na assembleia geral.",
  "coopTemplate.doc.share-agreement.s0.b1.1":
    "Uma quota corresponde à adesão à cooperativa, que detém o imóvel coletivamente. Nenhuma fração nem metro quadrado fica em nome de quem tem a quota.",
  "coopTemplate.doc.share-agreement.s0.b1.2":
    "A quota mantém-se no seu valor nominal enquanto o valor de mercado do imóvel varia; à saída é reembolsada por esse valor nominal ajustado (ver abaixo).",
  "coopTemplate.doc.share-agreement.s1.h": "Calendário de pagamento",
  "coopTemplate.doc.share-agreement.s1.b0":
    "Define como a quota é paga, já que poucas pessoas conseguem pagar o valor total à cabeça.",
  "coopTemplate.doc.share-agreement.s1.b1.0":
    "Pagamento total na admissão, ou um plano de prestações, por exemplo, 24 pagamentos mensais, acordado individualmente e registado no livro de contas partilhado.",
  "coopTemplate.doc.share-agreement.s1.b1.1":
    "O que acontece se falhar uma prestação: remete para o processo de atrasos do teu Acordo de honestidade financeira, sem o repetir aqui.",
  "coopTemplate.doc.share-agreement.s2.h": "Sair: condições de reembolso",
  "coopTemplate.doc.share-agreement.s2.b0":
    "Esta é a cláusula que as pessoas leem com mais atenção, e a que mais precisa de ser justa.",
  "coopTemplate.doc.share-agreement.s2.b1.0":
    "Em caso de saída voluntária com o pré-aviso acordado, a cooperativa reembolsa o valor nominal da quota, ajustado de acordo com [a inflação / um índice acordado], no prazo de, por exemplo, 12 meses após a saída.",
  "coopTemplate.doc.share-agreement.s2.b1.1":
    "A cooperativa não é obrigada a reembolsar de uma só vez se isso puser em risco as suas finanças. Indica à partida o prazo máximo de reembolso, para que não seja negociado sob pressão.",
  "coopTemplate.doc.share-agreement.s2.b1.2":
    "Não se aplica qualquer penalização de saída a quem sai em situação regular; as saídas motivadas por dificuldades passam primeiro pelo fundo de solidariedade.",
  "coopTemplate.doc.share-agreement.s3.h": "Quem pode deter uma quota",
  "coopTemplate.doc.share-agreement.s3.b0.0":
    "As quotas são detidas por pessoas associadas individuais e maiores de idade, e a sua transmissão por herança, venda ou doação carece de aprovação da assembleia. Isto mantém a adesão ligada à participação real.",
  "coopTemplate.doc.share-agreement.s3.b0.1":
    "O agregado de um membro (pessoas com quem tem uma relação, crianças, família escolhida que viva com essa pessoa) pode viver ao abrigo de uma só quota; indica com clareza quem conta como parte dessa adesão.",
  "coopTemplate.doc.share-agreement.s4.h": "Proteção do valor entregue",
  "coopTemplate.doc.share-agreement.s4.b0":
    "Como uma quota não é uma caução de arrendamento, normalmente não está abrangida pelo regime português de proteção de cauções no arrendamento. Di-lo explicitamente e explica o que a protege.",
  "coopTemplate.doc.share-agreement.s4.b1.0":
    "O valor da quota é mantido na conta da cooperativa, registado individualmente no livro de contas, e confirmado por escrito ao membro todos os anos.",
  "coopTemplate.doc.share-agreement.s4.b1.1":
    "Um conselho fiscal independente (ver os teus estatutos CRL) verifica que as contas das quotas correspondem ao que é devido a cada membro.",
  "coopTemplate.doc.share-agreement.s5.h": "Assinaturas",
  "coopTemplate.doc.share-agreement.s5.b0":
    "Um bloco de assinaturas simples, datado, com quem assina como membro e uma pessoa que represente a direção da cooperativa, mais uma linha que torna explícita a natureza de modelo:",
  "coopTemplate.doc.share-agreement.s5.b1.0":
    "Nome do membro, data, assinatura.",
  "coopTemplate.doc.share-agreement.s5.b1.1":
    "Nome de quem representa a cooperativa, cargo, data, assinatura.",
  "coopTemplate.doc.share-agreement.s5.b1.2":
    "Nota: este acordo foi adaptado a partir de um modelo da QueerPulse em [data] e revisto por [nome de quem fez a revisão jurídica ou notarial] antes da assinatura.",
  "coopTemplate.doc.share-agreement.s5.b2":
    "Preenche todos os campos entre parênteses acima com os números reais do vosso grupo e pede uma revisão jurídica da versão final antes de alguém assinar.",
  // finance-model
  "coopTemplate.doc.finance-model.tag": "Fase 3 · finanças",
  "coopTemplate.doc.finance-model.title": "Modelo financeiro",
  "coopTemplate.doc.finance-model.titleEm": "explicado",
  "coopTemplate.doc.finance-model.intro":
    "Esta explicação mostra como se fazem, na prática, as contas de uma cooperativa de habitação: o que estás a pagar, onde podem entrar um crédito à habitação e o apoio municipal, e como definir uma contribuição mensal sustentável. O exemplo prático no fim usa apenas números ilustrativos; os teus valores reais dependem inteiramente do teu imóvel, da tua cidade e do teu grupo.",
  "coopTemplate.doc.finance-model.s0.h": "As camadas de custo",
  "coopTemplate.doc.finance-model.s0.b0":
    "Os custos de uma cooperativa vêm em três camadas, e ajuda mantê-las visualmente separadas, cada uma com o seu número.",
  "coopTemplate.doc.finance-model.s0.b1.0":
    "Aquisição: o preço de compra do imóvel, mais notário, registo e imposto de transmissão (IMT).",
  "coopTemplate.doc.finance-model.s0.b1.1":
    "Obras: renovação, adequação às normas, adaptações de acessibilidade, muitas vezes subestimadas nos edifícios antigos de Lisboa e do Porto.",
  "coopTemplate.doc.finance-model.s0.b1.2":
    "Custos correntes: prestação do crédito ou empréstimo, seguros, reserva de manutenção, consumos dos espaços partilhados, e a própria administração da cooperativa (contabilidade, acompanhamento notarial).",
  "coopTemplate.doc.finance-model.s1.h":
    "Quotas dos membros, crédito e apoio municipal",
  "coopTemplate.doc.finance-model.s1.b0":
    "A maioria das cooperativas da QueerPulse combina três fontes de financiamento.",
  "coopTemplate.doc.finance-model.s1.b1.0":
    "As quotas dos membros (ver o teu Acordo de quota de membro) cobrem uma parte da aquisição, normalmente o suficiente para tornar viável, para uma entidade financiadora, o rácio entre o crédito e o valor do imóvel.",
  "coopTemplate.doc.finance-model.s1.b1.1":
    "Um crédito ou empréstimo cooperativo, muitas vezes através da Caixa de Crédito Agrícola Mútuo (CCAM) ou de outro financiador habituado a mutuários cooperativos, cobre o restante da aquisição e, por vezes, as obras.",
  "coopTemplate.doc.finance-model.s1.b1.2":
    "O apoio municipal, um arrendamento de longa duração sobre um imóvel do município, um subsídio de renovação, ou um coinvestimento de um fundo de habitação, pode, em alguns casos, reduzir ou substituir totalmente o custo de aquisição. Pergunta à pessoa de ligação ao fundo de habitação da QueerPulse o que está atualmente disponível na tua cidade.",
  "coopTemplate.doc.finance-model.s2.h": "Definir as contribuições mensais",
  "coopTemplate.doc.finance-model.s2.b0":
    "Trabalha de trás para a frente: parte do que as pessoas conseguem realmente pagar e só depois confirma que o número cobre os custos reais. Começa sempre pelas pessoas.",
  "coopTemplate.doc.finance-model.s2.b1.0":
    "Soma o total dos custos correntes mensais: prestação do empréstimo mais reserva mais seguros mais administração.",
  "coopTemplate.doc.finance-model.s2.b1.1":
    "Decide como se dividem as contribuições: por igual, ou ajustadas ao rendimento e à dimensão do agregado (remete para a vossa carta de valores fundadores e para o Acordo de honestidade financeira).",
  "coopTemplate.doc.finance-model.s2.b1.2":
    "Prevê uma margem: a maioria das cooperativas orça 5 a 10 % acima dos custos conhecidos para as surpresas que aparecem sempre no primeiro ano.",
  "coopTemplate.doc.finance-model.s3.h": "Constituir reservas",
  "coopTemplate.doc.finance-model.s3.b0.0":
    "Uma reserva de manutenção, dotada desde o primeiro mês, ainda antes de alguma coisa avariar. Criá-la mais tarde, depois de uma infiltração no telhado, é muito mais difícil.",
  "coopTemplate.doc.finance-model.s3.b0.1":
    "Um valor-alvo para a reserva, muitas vezes apontado como vários meses de custos correntes, acordado pelo grupo.",
  "coopTemplate.doc.finance-model.s3.b0.2":
    "A reserva é separada do fundo de solidariedade e de emergência: uma protege o edifício, o outro protege as pessoas.",
  "coopTemplate.doc.finance-model.s4.h":
    "Onde encaixam os parceiros da QueerPulse",
  "coopTemplate.doc.finance-model.s4.b0.0":
    "A CCAM e outras entidades financiadoras próximas das cooperativas: financiamento pensado para mutuários coletivos.",
  "coopTemplate.doc.finance-model.s4.b0.1":
    "O fundo municipal de habitação: coinvestimento, arrendamentos de longa duração sobre edifícios municipais, ou subsídios associados a metas de habitação acessível. As condições variam de cidade para cidade e mudam ao longo do tempo: confirma as condições atuais com a pessoa de ligação ao fundo de habitação da QueerPulse, já que este documento pode estar desatualizado.",
  "coopTemplate.doc.finance-model.s4.b0.2":
    "A equipa jurídica da QueerPulse: uma primeira leitura das condições de financiamento antes de assinares. Procura também aconselhamento jurídico e financeiro independente.",
  "coopTemplate.doc.finance-model.s5.h":
    "Um exemplo prático (valores apenas ilustrativos)",
  "coopTemplate.doc.finance-model.s5.b0":
    "Nenhum dos valores abaixo é um orçamento real. Servem para mostrar como as peças encaixam numa cooperativa hipotética de 6 agregados.",
  "coopTemplate.doc.finance-model.s5.b1.0":
    "Imóvel + obras: 900 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.1":
    "Quotas dos membros, 6 agregados × 8000 €: 48 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.2":
    "Coinvestimento municipal: 150 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.3":
    "Montante restante financiado por crédito hipotecário à cooperativa: 702 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.4":
    "Custo corrente mensal estimado por agregado, incluindo reserva: 420 a 480 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b2":
    "Trata este modelo como uma estrutura de partida. Os números aqui são ilustrativos. Constrói os números reais com a entidade financiadora, com o município e, para tudo o que for vinculativo, com um gabinete de contabilidade ou de advocacia.",
  // conflict-resolution
  "coopTemplate.doc.conflict-resolution.tag": "Fase 5 · governação",
  "coopTemplate.doc.conflict-resolution.title": "Processo de resolução de",
  "coopTemplate.doc.conflict-resolution.titleEm": "conflitos",
  "coopTemplate.doc.conflict-resolution.intro":
    "Todas as cooperativas têm conflitos, e um processo construído antes de precisares dele ajuda a atravessá-los. Trata isto como uma estrutura de partida para percorrer e ajustar com o teu próprio grupo, sobretudo os passos que envolvem a possível saída de alguém.",
  "coopTemplate.doc.conflict-resolution.s0.h": "Princípios: reparar primeiro",
  "coopTemplate.doc.conflict-resolution.s0.b0":
    "Define o tom antes dos passos. Um processo que só existe para punir tende a levar as pessoas a esconder os problemas que deviam ser falados.",
  "coopTemplate.doc.conflict-resolution.s0.b1.0":
    "O objetivo de qualquer passo abaixo é reparar a relação ou a situação o suficiente para que a cooperativa continue a funcionar. Apurar quem tinha razão fica de fora.",
  "coopTemplate.doc.conflict-resolution.s0.b1.1":
    "Qualquer pessoa pode levantar uma preocupação sem ser acusada por isso.",
  "coopTemplate.doc.conflict-resolution.s0.b1.2":
    "As questões de segurança (ver abaixo) são a única categoria em que a proteção imediata passa à frente da reparação.",
  "coopTemplate.doc.conflict-resolution.s1.h": "Desacordos do dia a dia",
  "coopTemplate.doc.conflict-resolution.s1.b0":
    "A maior parte dos atritos nunca precisa de um processo formal. Diz isto de forma explícita, para que ninguém transforme coisas pequenas em grandes por ansiedade.",
  "coopTemplate.doc.conflict-resolution.s1.b1.0":
    "Barulho, tarefas, visitas, uso dos espaços partilhados: levantados diretamente, a sós, o mais próximo possível do momento em que acontecem.",
  "coopTemplate.doc.conflict-resolution.s1.b1.1":
    "Se te custar demasiado começar uma conversa direta sem companhia, pede a uma terceira pessoa do grupo para estar presente. O papel dela é simplesmente estar ali, para que não fiquem duas pessoas a sós num momento difícil.",
  "coopTemplate.doc.conflict-resolution.s2.h": "O processo por etapas",
  "coopTemplate.doc.conflict-resolution.s2.b0":
    "Quando uma conversa direta não resolve algo, ou não parece seguro tentá-la a solo, o processo sobe por etapas, cada uma com menos peso do que a seguinte, para que a maioria das coisas se resolva antes de chegar à assembleia.",
  "coopTemplate.doc.conflict-resolution.s2.b1.0":
    "Etapa 1, direta: as pessoas envolvidas conversam, a sós, idealmente até uma semana depois de a questão surgir.",
  "coopTemplate.doc.conflict-resolution.s2.b1.1":
    "Etapa 2, facilitada: se a etapa 1 não resultar, uma terceira pessoa do grupo, escolhida por acordo, facilita uma conversa entre as pessoas envolvidas.",
  "coopTemplate.doc.conflict-resolution.s2.b1.2":
    "Etapa 3, assembleia: se continuar por resolver, ou afetar toda a casa, o assunto é levado a todo o grupo como um ponto claro da ordem de trabalhos, que toda a gente aceitou com antecedência.",
  "coopTemplate.doc.conflict-resolution.s2.b1.3":
    "Etapa 4, mediação externa: para tudo o que o grupo não consiga resolver internamente, chama-se uma pessoa mediadora externa, a expensas da cooperativa, antes de se considerar qualquer decisão sobre a saída de alguém.",
  "coopTemplate.doc.conflict-resolution.s3.h": "Questões de dano e segurança",
  "coopTemplate.doc.conflict-resolution.s3.b0":
    "Algumas situações passam diretamente para a ação de proteção, e não devem esperar pela etapa 1.",
  "coopTemplate.doc.conflict-resolution.s3.b1.0":
    "Tudo o que envolva violência, assédio ou a segurança imediata de alguém vai diretamente para as pessoas com um papel de resposta de segurança, saltando por completo o processo por etapas.",
  "coopTemplate.doc.conflict-resolution.s3.b1.1":
    "A pessoa que sofreu o dano decide, tanto quanto possível, o que acontece a seguir, seja ter espaço, uma conversa facilitada ou a saída temporária de alguém da casa.",
  "coopTemplate.doc.conflict-resolution.s3.b1.2":
    "A cooperativa não investiga nem julga por si própria matérias criminais; apoia a pessoa afetada no acesso a ajuda externa, se a quiser, e toma decisões sobre a segurança da habitação partilhada em paralelo.",
  "coopTemplate.doc.conflict-resolution.s4.h": "Limites e responsabilização",
  "coopTemplate.doc.conflict-resolution.s4.b0.0":
    "Responsabilização, aqui, significa alguém mudar efetivamente o comportamento que causou o dano, com apoio e com seguimento.",
  "coopTemplate.doc.conflict-resolution.s4.b0.1":
    "Os acordos feitos em qualquer etapa, um comportamento alterado, um limite, uma ação de reparação, são postos por escrito e recebem uma data de revisão, para que sejam verificados e ninguém tenha de presumir que resultaram.",
  "coopTemplate.doc.conflict-resolution.s5.h": "Quando alguém tem de sair",
  "coopTemplate.doc.conflict-resolution.s5.b0":
    "Este é o passo mais difícil, e aquele que mais vale a pena decidir com calma, com antecedência, bem antes de qualquer crise.",
  "coopTemplate.doc.conflict-resolution.s5.b1.0":
    "A saída involuntária só é considerada depois da etapa 4, exceto em situações de segurança em que é necessária uma separação imediata e temporária.",
  "coopTemplate.doc.conflict-resolution.s5.b1.1":
    "A decisão exige [um limiar acordado, por exemplo, uma maioria qualificada da assembleia, excluindo quem está diretamente envolvido] e segue as condições de saída dos teus estatutos CRL e do Acordo de quota de membro.",
  "coopTemplate.doc.conflict-resolution.s5.b1.2":
    "Sempre que possível, a cooperativa apoia a pessoa que sai a encontrar outra casa. É uma rede de segurança habitacional.",
  "coopTemplate.doc.conflict-resolution.s6.h": "Rever o processo",
  "coopTemplate.doc.conflict-resolution.s6.b0":
    "Revê este processo sempre que for usado e também numa data fixa.",
  "coopTemplate.doc.conflict-resolution.s6.b1.0":
    "Depois de qualquer uso da etapa 3 ou seguinte, o grupo revê se o próprio processo funcionou, separando isso do desfecho daquele conflito em concreto.",
  "coopTemplate.doc.conflict-resolution.s6.b1.1":
    "Anualmente, a par da revisão da carta de valores fundadores, verifica se o processo por etapas, o papel de facilitação e o papel de resposta de segurança ainda servem o grupo à medida que este cresceu ou mudou.",
  "coopTemplate.doc.conflict-resolution.s6.b2":
    "Este processo é um modelo de partida adaptado da prática de outra cooperativa da QueerPulse. Percorre todos os passos em grupo antes de precisares dele e ajusta os papéis e os limiares à tua cooperativa.",

  // ── Estatísticas do hero (housingCoop.data → COOP_STATS) ────────────────
  "housingCoop.stats.activeGroups": "Grupos ativos",
  "housingCoop.stats.householdsHoused": "Agregados alojados",
  "housingCoop.stats.inPhase": "Nas fases 4 e 5",
  "housingCoop.stats.cities": "Cidades",
  "housingCoop.stats.citiesLisbon": "Lisboa · ",

  // ── Calendário de cinco fases (housingCoop.data → COOP_PHASES) ──────────
  "housingCoop.phase.findPeople.name": "Encontrar",
  "housingCoop.phase.findPeople.nameEm": "as pessoas",
  "housingCoop.phase.findPeople.time": "2 a 4 meses",
  "housingCoop.phase.findPeople.desc":
    "4 a 12 agregados familiares que partilham valores, calendário e hábitos financeiros. Teste de afinidades, honestidade financeira, cláusula de saída.",
  "housingCoop.phase.legalIncorporation.name": "Constituição",
  "housingCoop.phase.legalIncorporation.nameEm": "legal",
  "housingCoop.phase.legalIncorporation.time": "1 a 3 meses",
  "housingCoop.phase.legalIncorporation.desc":
    "Estrutura de cooperativa CRL, estatutos, quotas de membro. Modelos específicos para a lei portuguesa.",
  "housingCoop.phase.financeStructure.name": "Financiamento &",
  "housingCoop.phase.financeStructure.nameEm": "estrutura",
  "housingCoop.phase.financeStructure.time": "3 a 8 meses",
  "housingCoop.phase.financeStructure.desc":
    "Capital social dos membros, financiamento bancário ético, apoios do Estado, mecânica do fundo do grupo.",
  "housingCoop.phase.findProperty.name": "Encontrar",
  "housingCoop.phase.findProperty.nameEm": "o imóvel",
  "housingCoop.phase.findProperty.time": "6 a 12 meses",
  "housingCoop.phase.findProperty.desc":
    "Levantamento, negociação, assinatura. A maioria dos grupos compra. Alguns optam por arrendamento com opção de compra. Outros arrendam a longo prazo do parque público.",
  "housingCoop.phase.dailyGovernance.name": "Governação",
  "housingCoop.phase.dailyGovernance.nameEm": "diária",
  "housingCoop.phase.dailyGovernance.time": "Para sempre",
  "housingCoop.phase.dailyGovernance.desc":
    "Tomada de decisões, conflitos, reparações, novas entradas, sucessão. Ferramentas que aguentam o tédio e os dias maus.",

  // ── Modelos para descarregar (housingCoop.data → COOP_TEMPLATES) ────────
  "housingCoop.template.foundingValues.tag": "Fase 1 · modelo",
  "housingCoop.template.foundingValues.name": "Valores fundadores &",
  "housingCoop.template.foundingValues.nameEm": "teste de afinidades",
  "housingCoop.template.foundingValues.meta": "Documento na app · PT + EN",
  "housingCoop.template.financialHonesty.tag": "Fase 1 · modelo",
  "housingCoop.template.financialHonesty.name": "Folha de",
  "housingCoop.template.financialHonesty.nameEm": "honestidade financeira",
  "housingCoop.template.financialHonesty.meta": "Folha de trabalho na app",
  "housingCoop.template.crlStatutes.tag": "Fase 2 · legal",
  "housingCoop.template.crlStatutes.name": "Estatutos da",
  "housingCoop.template.crlStatutes.nameEm": "cooperativa CRL",
  "housingCoop.template.crlStatutes.meta": "Documento na app · lei portuguesa",
  "housingCoop.template.shareAgreement.tag": "Fase 2 · legal",
  "housingCoop.template.shareAgreement.name": "Acordo de",
  "housingCoop.template.shareAgreement.nameEm": "quota de membro",
  "housingCoop.template.shareAgreement.meta":
    "Documento na app · cláusulas para família escolhida",
  "housingCoop.template.financeModel.tag": "Fase 3 · financiamento",
  "housingCoop.template.financeModel.name": "Modelo de",
  "housingCoop.template.financeModel.nameEm": "financiamento do grupo",
  "housingCoop.template.financeModel.meta": "Folha de trabalho na app",
  "housingCoop.template.conflictResolution.tag": "Fase 5 · governação",
  "housingCoop.template.conflictResolution.name": "Processo de",
  "housingCoop.template.conflictResolution.nameEm": "resolução de conflitos",
  "housingCoop.template.conflictResolution.meta": "Documento na app",

  // ── Lista de mentores/parceiros (housingCoop.data → COOP_RESOURCES).
  //    Os campos `em` (nomes próprios: "Casa Sambizanga", "CCAM") ficam no
  //    ficheiro de dados, não no catálogo.
  "housingCoop.resource.sambizangaMentorsPost": " · pessoas mentoras",
  "housingCoop.resource.sambizangaMentorsMeta": "4 ativas",
  "housingCoop.resource.qpLegalTeamPre": "Equipa jurídica da QP",
  "housingCoop.resource.qpLegalTeamMeta": "3 juristas",
  "housingCoop.resource.housingFundLiaisonPre":
    "Ponte com o fundo de habitação de Lisboa",
  "housingCoop.resource.housingFundLiaisonMeta": "1 contacto",
  "housingCoop.resource.caixaPre": "Caixa ",
  "housingCoop.resource.caixaPost": " · atendimento a cooperativas",
  "housingCoop.resource.caixaMeta": "Parceria",
  "housingCoop.resource.monthlyAssemblyPre": "Assembleia mensal da cooperativa",
  "housingCoop.resource.monthlyAssemblyMeta": "1.º sábado",

  "housingCoop.toast.updates":
    "Vais passar a receber as atualizações de {name} no teu feed.",
  "housingCoop.toast.mentoring":
    "Pedido de mentoria enviado à Casa Sambizanga.",
  "housingCoop.toast.seeAll":
    "O diretório completo de cooperativas está a chegar.",
  "housingCoop.toast.postHelp":
    "Vamos ajudar-te a encontrar o teu grupo. Confirma a tua caixa de entrada.",
  "housingCoop.toast.story": "A história da Casa Sambizanga está a chegar.",

  // ── JoinCoopModal ────────────────────────────────────────────────────────
  "joinCoop.askToJoinAriaLabel": "Pedir para te juntares a {name}",
  "joinCoop.success.title": "Pedido",
  "joinCoop.success.em": "enviado.",
  "joinCoop.success.closeLabel": "Concluído",
  "joinCoop.success.body":
    "A organização de <strong>{name}</strong> vai ver o teu interesse e entrar em contacto para marcar uma primeira conversa. Para já não há compromisso: as primeiras conversas servem para perceber se há sintonia dos dois lados.",
  "joinCoop.title": "Pedir para te juntares a <em>{name}.</em>",
  "joinCoop.sub":
    "{location}. Conta-lhes um pouco sobre quem se vai juntar. Vão entrar em contacto para marcar uma primeira conversa.",
  "joinCoop.nameLabel": "O teu nome *",
  "joinCoop.namePlaceholder": "Como te devemos chamar?",
  "joinCoop.householdLabel": "Quem se vai juntar *",
  "joinCoop.chooseOne": "Escolhe uma opção…",
  "joinCoop.noteLabel": "Alguma coisa que queiras que saibam",
  "joinCoop.notePlaceholder":
    "O que te atrai nesta cooperativa? A tua situação, prazos, esperanças…",
  "joinCoop.disclaimer":
    "O teu pedido é partilhado apenas com a organização desta cooperativa. Entrar numa cooperativa é uma conversa longa. Vai com calma.",
  "joinCoop.cancel": "Cancelar",
  "joinCoop.sending": "A enviar…",
  "joinCoop.sendCta": "Enviar pedido",
  "joinCoop.error": "Não foi possível enviar o teu pedido. Tenta novamente.",
  "joinCoop.errorTitle": "Não conseguimos enviar o teu pedido",
  "joinCoop.household.justMe": "Só eu",
  "joinCoop.household.mePlusPartners": "Eu + par(es)",
  "joinCoop.household.small": "Um agregado de 3 a 4",
  "joinCoop.household.large": "Um agregado de 5+",

  // ── OfferPage (Asks & Offers board detail) ─────────────────────────────
  // Scope note: MAIN/OTHERS in OfferPage.tsx (the zine-collab ask, the free
  // portraits/mentoring/sublet offers, poster names/roles/bios) are
  // member-authored marketplace posts — in live mode fetched from the board.
  // Left in English. Only the surrounding chrome below is translated.
  "offerBoard.backLink": "Pedidos & Ofertas",
  "offerBoard.pill.looking": "Procura",
  "offerBoard.pill.offering": "Oferece",
  "offerBoard.respondCta": "Responder a {name}",
  "offerBoard.seeProfileCta": "Ver o perfil",
  "offerBoard.postedBy": "Publicado por",
  "offerBoard.sidebarNote":
    "{name} faz parte da comunidade e está em situação regular. Cada pessoa da comunidade tem o voto de confiança de alguém que já faz parte dela.",
  "offerBoard.sidebarNoteVerified":
    "{name} faz parte da comunidade, está em situação regular e já tem a verificação da equipa. Cada pessoa da comunidade tem o voto de confiança de alguém que já faz parte dela.",
  "offerBoard.connectCta": "Conectar com {name}",
  "offerBoard.moreFromBoard": "Mais do <em>quadro</em>",
  "offerBoard.comingSoon.title": "Pedidos & Ofertas está a caminho",
  "offerBoard.comingSoon.body":
    "O quadro da comunidade, onde as pessoas publicam o que procuram e o que podem oferecer, chega brevemente. Volta daqui a pouco.",

  // ── SalarySubmitModal ────────────────────────────────────────────────────
  "salarySubmitModal.subtitle":
    "Completamente anónimo. Nada que te possa identificar é guardado.",
  "salarySubmitModal.jobTitlePlaceholder": "Cargo / função",
  "salarySubmitModal.sectorPlaceholder": "Setor (ex.: Tecnologia, ONG, Design)",
  "salarySubmitModal.annualSalaryPlaceholder": "Salário anual (€)",
  "salarySubmitModal.yearsExpPlaceholder": "Anos de experiência",
  "salarySubmitModal.employmentTypeLabel": "Tipo de vínculo",
  "salarySubmitModal.submitCta": "Enviar anonimamente",

  // ── AffiliateCompanyModal ────────────────────────────────────────────────
  "affiliateRole.founder": "Pessoa fundadora / proprietária",
  "affiliateRole.hiringLead": "Responsável de contratação",
  "affiliateRole.teamMember": "Pessoa da equipa",
  "affiliateRole.recruiter": "Pessoa recrutadora",
  "affiliateRole.volunteerCoordinator": "Coordenação de voluntariado",
  "affiliateCompanyModal.ariaLabel": "Associar a tua empresa",
  "affiliateCompanyModal.eyebrow": "Acesso para entidades empregadoras",
  "affiliateCompanyModal.title":
    "Para que empresa estás a <em>publicar a vaga?</em>",
  "affiliateCompanyModal.sub":
    "Escolhe a organização pela qual tens autorização para contratar. Confirmamos as associações com entidades empregadoras para manter a bolsa de confiança.",
  "affiliateCompanyModal.notListed.name": "A minha empresa não está listada",
  "affiliateCompanyModal.notListed.meta": "Adicioná-la ao diretório",
  "affiliateCompanyModal.addCompany.nameLabel": "Nome da empresa",
  "affiliateCompanyModal.addCompany.namePlaceholder": "ex.: Atelier Pulso",
  "affiliateCompanyModal.addCompany.taglineLabel": "Frase de apresentação",
  "affiliateCompanyModal.addCompany.taglinePlaceholder":
    "O que a empresa faz, numa frase.",
  "affiliateCompanyModal.addCompany.aboutLabel": "Sobre",
  "affiliateCompanyModal.addCompany.aboutPlaceholder":
    "Uma breve descrição da empresa e de como funciona.",
  "affiliateCompanyModal.addCompany.pickExisting":
    "Escolher uma empresa existente",
  "affiliateCompanyModal.roleLabel": "O teu cargo na empresa",
  "affiliateCompanyModal.cancel": "Cancelar",
  "affiliateCompanyModal.creating": "A criar…",
  "affiliateCompanyModal.verifying": "A verificar…",
  "affiliateCompanyModal.createCta": "Criar e continuar",
  "affiliateCompanyModal.confirmCta": "Confirmar e continuar",
  "affiliateCompanyModal.createErrorToast":
    "Não foi possível criar essa empresa. Tenta novamente.",
  "affiliateCompanyModal.createErrorTitle":
    "Não conseguimos criar essa empresa",
  "affiliateCompanyModal.cause.nameTaken":
    "Não conseguimos dar a essa empresa um endereço de página próprio. Experimenta um nome ligeiramente diferente.",

  // ── Coming soon (live mode: honest stand-in for flows with no backend yet) ─
  "comingSoon.title": "Ainda não está",
  "comingSoon.em": "ativo.",
  "comingSoon.body":
    "Este formulário faz parte da pré-visualização, vai ligar-se a sério quando a QueerPulse arrancar. Nada do que escreveres aqui é enviado para lado nenhum.",
  "comingSoon.close": "Percebido",

  // ── IncubatorModals: CohortApplyModal ────────────────────────────────────
  "incubatorApply.success.title": "Candidatura",
  "incubatorApply.success.em": "recebida.",
  "incubatorApply.success.body":
    "Agradecemos, <strong>{name}</strong>. A nossa equipa recebeu a tua candidatura e responde-te por email.",
  "incubatorApply.eyebrow": "Incubadora",
  "incubatorApply.title": "Candidata-te a <em>construir a tua ideia.</em>",
  "incubatorApply.sub":
    "Não é preciso pitch deck. Diz-nos só o que estás a criar e em que ponto estás.",
  "incubatorApply.nameLabel": "O teu nome *",
  "incubatorApply.namePlaceholder": "Nome e apelido",
  "incubatorApply.emailLabel": "Email *",
  "incubatorApply.emailPlaceholder": "tu@exemplo.com",
  "incubatorApply.pitchLabel": "O que estás a construir? *",
  "incubatorApply.pitchPlaceholder":
    "Algumas frases sobre a tua ideia, em que ponto estás e em que precisas mais de ajuda.",
  "incubatorApply.charsNeeded_one":
    "Falta {count} carácter no teu pitch para poderes enviar.",
  "incubatorApply.charsNeeded_other":
    "Faltam {count} caracteres no teu pitch para poderes enviar.",
  "incubatorApply.looksGood":
    "Tudo certo. A nossa equipa vai ler a tua candidatura.",
  "incubatorApply.submitCta": "Enviar candidatura",

  // ── IncubatorModals: MentorSignupModal ───────────────────────────────────
  "mentorSignup.success.title": "Já estás na",
  "mentorSignup.success.em": "lista.",
  "mentorSignup.success.body":
    "Agradecemos, <strong>{name}</strong>. A nossa equipa recebeu a tua inscrição e responde-te por email.",
  "mentorSignup.eyebrow": "Incubadora · Mentoria",
  "mentorSignup.title": "Torna-te <em>pessoa mentora.</em>",
  "mentorSignup.sub":
    "Diz-nos em que podias ajudar uma pessoa fundadora queer a dar os primeiros passos, e o que sabes mesmo.",
  "mentorSignup.nameLabel": "O teu nome *",
  "mentorSignup.namePlaceholder": "Nome e apelido",
  "mentorSignup.emailLabel": "Email *",
  "mentorSignup.emailPlaceholder": "tu@exemplo.com",
  "mentorSignup.expertiseLabel": "Em que podes ajudar? *",
  "mentorSignup.expertisePlaceholder":
    "ex.: Produto, angariação de fundos, jurídico, contratação",
  "mentorSignup.whyLabel": "Porquê fazer mentoria? *",
  "mentorSignup.whyPlaceholder":
    "Uma ou duas frases sobre o que podes trazer e quem mais gostarias de apoiar.",
  "mentorSignup.charsNeeded_one": "Falta {count} carácter para poderes enviar.",
  "mentorSignup.charsNeeded_other":
    "Faltam {count} caracteres para poderes enviar.",
  "mentorSignup.looksGood":
    "Tudo certo. A nossa equipa vai ler a tua inscrição.",
  "mentorSignup.submitCta": "Inscrever-me na mentoria",

  // ── IncubatorModals: RequestSessionModal ─────────────────────────────────
  "requestSession.success.title": "Sessão",
  "requestSession.success.em": "pedida.",
  "requestSession.success.body":
    "O teu pedido chegou a <strong>{name}</strong>. As pessoas mentoras respondem em poucos dias para confirmar uma hora. Vai espreitando o teu email: é por lá que chega o contacto.",
  "requestSession.eyebrow": "Incubadora · {role}",
  "requestSession.title": "Pede uma sessão com <em>{name}.</em>",
  "requestSession.sub":
    "Uma nota curta já ajuda muito. Diz em que estás a trabalhar e quando te dava jeito o encontro, e {firstName} responde para combinarem.",
  "requestSession.whenLabel": "Horário preferido *",
  "requestSession.whenPlaceholder":
    "ex.: Fim do dia em dias úteis, ou terças/quintas à tarde",
  "requestSession.messageLabel": "Sobre o que gostarias de falar? *",
  "requestSession.messagePlaceholder":
    "Algumas frases sobre o ponto em que estás e aquilo em que mais gostarias de ter ajuda.",
  "requestSession.looksGood":
    "Tudo certo. As pessoas mentoras costumam responder em poucos dias.",
  "requestSession.sendCta": "Enviar pedido",

  // ── companies.data.tsx — títulos estruturais dentro do "Sobre" de cada empresa ─
  "company.about.howWeWorkHeading": "Como trabalhamos",
  "company.about.whatWeLookForHeading": "O que procuramos",

  // ── Segurança na habitação — aviso anti-burla, direitos, preços (Wave A) ──
  "housingSafety.banner.ariaLabel": "Segurança na habitação",
  "housingSafety.banner.eyebrow": "Antes de avançares",
  "housingSafety.banner.title":
    "Algumas coisas que te mantêm em <em>segurança</em>",
  "housingSafety.banner.dismiss": "Dispensar",
  "housingSafety.banner.moreCta": "Conhece os teus direitos, deteta uma burla",
  "housingSafety.tips.neverPayFirst":
    "Nunca pagues nada antes de teres um contrato assinado.",
  "housingSafety.tips.videoCall":
    "Pede uma videochamada. Vê a pessoa e o espaço em direto.",
  "housingSafety.tips.lowPrice":
    "Um preço muito abaixo do normal costuma ser sinal de alarme.",
  "housingSafety.tips.noTransfers":
    "Sem transferências nem sinais antes de confirmares com quem estás a falar.",
  "housingSafety.tips.stayOnPlatform":
    "Mantém a conversa aqui. É mais fácil pedir ajuda se algo correr mal.",
  "housingSafety.tips.neverSightUnseen":
    "Nunca arrendes uma casa sem que tu, ou alguém de confiança, a tenha visto pessoalmente.",
  "housingSafety.price.title": "Quanto custa mesmo arrendar em Lisboa",
  "housingSafety.price.lead":
    "Uma referência rápida. Se um espaço estiver muito abaixo destes valores, pergunta-te porquê antes de avançares.",
  "housingSafety.price.room.label": "Quarto individual em casa partilhada",
  "housingSafety.price.double.label": "Quarto partilhado, por pessoa",
  "housingSafety.price.studio.label": "T0 só para ti",
  "housingSafety.price.perMonth": "/ mês",
  "housingSafety.price.note":
    "Intervalos aproximados para Lisboa, como referência. Uma avaliação formal é outra coisa.",
  "housingSafety.page.eyebrow": "Segurança na habitação",
  "housingSafety.page.title": "Arrendar, com <em>segurança</em>",
  "housingSafety.page.lead":
    "Um guia curto e claro para detetar uma burla e conhecer os teus direitos no arrendamento em Portugal, para encontrares casa sem ficares na dúvida.",
  "housingSafety.page.antiScamTitle": "Detetar uma <em>burla</em>",
  "housingSafety.page.rightsTitle":
    "Os teus direitos no arrendamento em Portugal",
  "housingSafety.rights.lease.title": "Um contrato escrito e registado",
  "housingSafety.rights.lease.point.1":
    "O teu arrendamento deve ter um contrato escrito. Um acordo verbal deixa-te com muito menos para te defenderes.",
  "housingSafety.rights.lease.point.2":
    "Deve identificar as duas partes, o imóvel, a renda e a duração. Guarda a tua cópia assinada.",
  "housingSafety.rights.lease.point.3":
    "A pessoa senhoria tem de registar o contrato nas Finanças. Desde 2025, se não o fizer, podes registá-lo tu.",
  "housingSafety.rights.lease.point.4":
    "Um contrato de habitação dura pelo menos um ano, salvo se foste tu a pedir um prazo mais curto.",
  "housingSafety.rights.deposit.title": "Caução e renda adiantada",
  "housingSafety.rights.deposit.point.1":
    "A caução está limitada a duas rendas.",
  "housingSafety.rights.deposit.point.2":
    "A renda pedida por antecipação tem o mesmo limite, ou seja, cerca de duas rendas é o teto do que te podem pedir à cabeça. Acima disso, pede a justificação por escrito.",
  "housingSafety.rights.rentIncrease.title": "Aumentos de renda",
  "housingSafety.rights.rentIncrease.point.1":
    "A renda pode subir no máximo uma vez a cada 12 meses, e só com 30 dias de aviso por escrito.",
  "housingSafety.rights.rentIncrease.point.2":
    "O aumento está limitado ao coeficiente que o INE publica todos os anos. Para 2026 é de 2,24%.",
  "housingSafety.rights.rentIncrease.point.3":
    "Uma subida acima desse limite, ou sem o aviso, merece ser questionada. Pede o valor por escrito antes de o pagares.",
  "housingSafety.rights.eviction.title": "Despejo e a tua casa",
  "housingSafety.rights.eviction.point.1":
    "Um despejo só pode avançar através de um tribunal ou do Balcão Nacional do Arrendamento. Nunca de um dia para o outro.",
  "housingSafety.rights.eviction.point.2":
    "Mudar a fechadura, cortar-te a água ou a luz, ou tirar-te as coisas de casa é crime, ao abrigo da Lei n.º 12/2019.",
  "housingSafety.rights.eviction.point.3":
    "Se algo disto acontecer, é matéria criminal. Fotografa tudo, guarda as mensagens e vai à polícia ou a uma associação de inquilinos.",
  "housingSafety.rights.discrimination.title":
    "Se te tratarem de forma injusta",
  "housingSafety.rights.discrimination.point.1":
    "A lei do arrendamento não prevê proteções específicas para pessoas LGBTQ+. Mesmo assim, podes denunciar a discriminação a um organismo para a igualdade.",
  "housingSafety.rights.discrimination.point.2":
    "Guarda o anúncio, as mensagens e qualquer recusa que te tenham dado. É o registo escrito que sustenta uma queixa.",
  "housingSafety.disclaimer.title":
    "Orientação <em>geral</em> para quem arrenda",
  "housingSafety.disclaimer.body":
    "Mantivemos isto rigoroso e claro, mas cada situação é única. Para o que for mesmo importante, fala com uma associação de inquilinos ou procura aconselhamento jurídico.",
  "housingSafety.backToHousing": "Voltar à habitação",

  // ── Localização do anúncio — área aproximada vs morada exata (Wave A) ──
  "housingListing.section.location": "Onde fica",
  "housingListing.location.approxNote":
    "Por agora vês a área aproximada. A morada exata aparece quando estiverem conectados ou uma visita for aceite.",
  "housingListing.location.exactNote":
    "Estão conectados, por isso podes ver a morada exata.",
  "housingListing.location.viewingExactNote":
    "A tua visita foi aceite, por isso podes ver a morada exata.",
  "housingListing.location.unlockedExactNote":
    "Podes ver a morada exata desta casa.",
  "housingListing.location.areaPinNote":
    "O círculo no mapa mostra o bairro. A morada é o sítio exato.",
  // PRD-241, o terceiro estado: quem já tem acesso mas o anúncio não tem morada.
  "housingListing.location.noAddressOnFileNote":
    "Tens acesso à morada exata e quem anunciou ainda não a adicionou. Pede-lha quando combinares a visita.",
  // Os dois estados de quem é dono do anúncio. As duas chaves acima apontavam
  // uma pessoa para si própria.
  "housingListing.location.ownExactNote":
    "Este anúncio é teu, por isso estás a ver a morada exata que guardaste.",
  "housingListing.location.ownNoAddressNote":
    "Ainda não adicionaste uma morada a este anúncio. Adiciona uma e quem tiver acesso vai ver o sítio exato.",
  "housingListing.location.addressLabel": "Morada",
  "housingListing.location.mapAreaAria":
    "Mapa que mostra a área aproximada de {title}",
  "housingListing.location.mapExactAria":
    "Mapa que mostra a localização exata de {title}",

  // ── Diz olá — primeira mensagem, com partilha opcional de pronomes (Wave A) ─
  "sayHello.ariaLabel": "Diz olá a {name}",
  "sayHello.title": "Diz <em>olá</em>",
  "sayHello.lede":
    "Uma primeira mensagem curta e calorosa faz toda a diferença. Diz o que procuras e o que trarias para uma casa.",
  "sayHello.messageLabel": "A tua mensagem",
  "sayHello.messagePlaceholder":
    "Olá! Procuro um sítio calmo e queer-friendly a partir de setembro…",
  "sayHello.sharePronouns": "Deixar {name} ver os meus pronomes: {pronouns}",
  "sayHello.sharePronounsHint":
    "Partilhado só com esta pessoa, e só quando quiseres.",
  "sayHello.noPronounsHint":
    "Adiciona pronomes ao teu perfil para os partilhares aqui.",
  "sayHello.cancel": "Cancelar",
  "sayHello.send": "Enviar olá",
  "sayHello.sending": "A enviar…",
  "sayHello.success.title": "O teu olá está a <em>caminho.</em>",
  "sayHello.success.body":
    "{name} vai ver a tua mensagem na caixa de entrada. Se quiser conversar, a resposta chega-te por lá.",
  "sayHello.success.bodyWithPronouns":
    "{name} vai ver a tua mensagem e os teus pronomes na caixa de entrada. Se quiser conversar, a resposta chega-te por lá.",
  "sayHello.success.close": "Concluído",

  // ── Companheiros de casa — alternar lista/descoberta + modo descoberta (Wave A) ─
  "flatmates.view.label": "Escolhe como explorar",
  "flatmates.view.list": "Lista",
  "flatmates.view.discovery": "Descoberta",
  "flatmates.discovery.progress": "{current} de {total}",
  "flatmates.discovery.pass": "Passar",
  "flatmates.discovery.like": "Gostar",
  "flatmates.discovery.sayHello": "Diz olá",
  "flatmates.discovery.keepBrowsing": "Continuar a explorar",
  "flatmates.discovery.error": "Não foi possível guardar. Tenta daqui a pouco.",
  "flatmates.discovery.errorTitle": "Não conseguimos guardar a tua escolha",
  "flatmates.discovery.cause.ownProfile":
    "Este é o teu próprio perfil, por isso não há nada a gostar nem a passar. Avança para o seguinte.",
  "flatmates.discovery.cause.missing":
    "Este perfil já não está disponível. Pode ter sido pausado ou removido. Avança para o seguinte.",
  "flatmates.discovery.matchTitle": "Olá <em>dos dois lados</em>",
  "flatmates.discovery.matchBody":
    "Tu e {name} gostaram dos vossos perfis. Começa a conversa quando quiseres.",
  "flatmates.discovery.doneTitle": "Por agora, é toda a gente",
  "flatmates.discovery.doneBody":
    "Já viste todos os perfis que encaixam nos teus filtros. Volta em breve, entra gente nova com frequência.",

  // ── Grupos de habitação verificados + pedido de entrada (Wave A) ──
  "housingGroups.backLabel": "Habitação",
  "housingGroups.hero.eyebrow": "Habitação verificada",
  "housingGroups.hero.title":
    "Grupos em que pessoas queer à procura de casa <em>confiam</em> mesmo",
  "housingGroups.hero.sub":
    "Grupos de habitação pequenos e com triagem, onde cada anúncio indica a renda, descreve a acessibilidade com honestidade e as imobiliárias ficam de fora.",
  "housingGroups.grid.title": "Encontra a tua <em>gente</em>",
  "housingGroups.grid.sub":
    "Pede para entrar num grupo e alguém que gere o grupo vem dizer olá. Cada grupo tem as suas regras.",
  "housingGroups.gated": "Pedir para entrar",
  "housingGroups.members": "{count} pessoas",
  "housingGroups.view": "Ver",
  "housingGroups.empty.title": "Ainda não há grupos",
  "housingGroups.empty.titleEm": "abertos",
  "housingGroups.empty.body":
    "Ainda não há grupos de habitação listados. Volta em breve.",
  "housingGroups.detail.backLabel": "Todos os grupos",
  "housingGroups.detail.askToJoin": "Pedir para entrar",
  "housingGroups.detail.join": "Entrar neste grupo",
  "housingGroups.norms.title": "Como",
  "housingGroups.norms.titleEm": "cuidamos de toda a gente",
  "housingGroups.norms.sub":
    "Regras com que toda a gente aqui concorda. Quem as quebra, sai. É para isso que existem.",
  "housingGroups.listings.title": "Quartos e apartamentos neste grupo",
  // ENG-171, o lado da leitura. "alguém da equipa" segue a escolha que o
  // catálogo já faz para "steward" em `housingGroups.grid.sub`.
  "housingGroups.listings.locked.title": "Os quartos ficam dentro do grupo",
  "housingGroups.listings.locked.none":
    "Este grupo guarda os quartos partilhados aqui para quem já deixou entrar. Pede para entrar e alguém que gere o grupo vem dizer olá.",
  "housingGroups.listings.locked.pending":
    "O teu pedido para entrar ainda está com quem gere o grupo. Os quartos partilhados aqui abrem-se assim que alguém disser que sim.",
  "housingGroups.listings.locked.declined":
    "O teu pedido para entrar não foi aprovado, por isso os quartos partilhados aqui ficam dentro do grupo.",
  "housingGroups.listings.perMonth": "{price} € / mês",
  "housingGroups.listings.accessLabel": "Acessibilidade:",
  "housingGroups.listings.empty":
    "Sem quartos listados de momento. Entra para veres o próximo antes de toda a gente.",
  "housingGroups.listings.postedBy": "Publicado por {name}",
  "housingGroups.listings.message": "Enviar mensagem a {name}",
  "housingGroups.listings.report": "Denunciar",
  "housingGroups.listings.reportAria": "Denunciar {title}",
  "housingGroups.listings.yourRoom": "Publicaste este quarto",
  "housingGroups.listings.yourRoomLink": "Vê-o nos teus quartos",

  // ── Entrar num grupo de habitação — pedido triado (Wave A) ──
  "joinGroup.ariaLabel": "Pedir para entrar em {name}",
  "joinGroup.eyebrow": "Pedir para entrar",
  "joinGroup.title": "Pedir para entrar em <em>{name}</em>",
  "joinGroup.sub":
    "Quem gere o grupo lê todos os pedidos. Conta um pouco sobre ti: não há respostas erradas.",
  "joinGroup.nameLabel": "O teu nome",
  "joinGroup.namePlaceholder": "O nome que usas",
  "joinGroup.relationshipLabel": "Como fazes parte da comunidade",
  "joinGroup.relationshipPlaceholder":
    "Uma pessoa amiga deu-me um voto de confiança, já fui a alguns eventos…",
  "joinGroup.optional": "(opcional)",
  "joinGroup.disclaimer":
    "As tuas respostas ficam privadas: só quem gere o grupo as vê.",
  "joinGroup.cancel": "Cancelar",
  "joinGroup.sending": "A enviar…",
  "joinGroup.sendCta": "Enviar pedido",
  "joinGroup.error": "Não foi possível enviar. Tenta daqui a pouco.",
  "joinGroup.alreadyPending":
    "Já pediste para entrar neste grupo. Vais receber uma notificação quando houver resposta.",
  "joinGroup.alreadyMember": "Já fazes parte deste grupo.",
  "joinGroup.success.title": "O teu pedido foi <em>enviado.</em>",
  "joinGroup.success.closeLabel": "Concluído",
  "joinGroup.success.body":
    "Quem gere <strong>{name}</strong> vai analisá-lo e responder-te. Vais ter notícias na tua caixa de entrada.",

  // ── Cooperativa de habitação — marca de operador verificado (Wave A) ──
  "housingCoop.operatorVerified": "Gestão verificada",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "placeholder.notSet": "Sem dados",
  "member.fallbackName": "Uma pessoa da comunidade",
  "housing.fact.rent": "Renda",
  // PRD-250. Só aparece quando quem anuncia indicou mesmo uma caução.
  "housing.fact.deposit": "Caução",
  "housing.fact.rentPerMonth": "{amount} / mês",
  "housing.fact.area": "Zona",
  "housing.fact.available": "Disponível",
  "housing.fact.availableNow": "Já",
  "housing.fact.minimumStay": "Estadia mínima",
  "housing.fact.minimumStayMonths_one": "{count} mês",
  "housing.fact.minimumStayMonths_other": "{count} meses",
  "housing.fact.bills": "Despesas",
  "housing.fact.billsIncluded": "Incluídas",
  "housing.fact.billsNotIncluded": "Não incluídas",
  "housing.beds.count_one": "{count} quarto",
  "housing.beds.count_other": "{count} quartos",
  "housing.period.month": "mês",
  "housing.lister.memberSince": "Aqui desde {year}",
  "company.badge.queerRun": "Gerida por pessoas queer",
  "company.badge.queerRunVerified": "Gerida por pessoas queer · verificada",
  "company.badge.queerLed": "Liderada por pessoas queer",
  "company.badge.queerLedVerified": "Liderada por pessoas queer · verificada",
  "company.badge.verified": "Verificada",
  "company.badge.employer": "Entidade empregadora",
  "company.reviews.starsBar_one": "{count} estrela",
  "company.reviews.starsBar_other": "{count} estrelas",
  "company.stats.founded": "Fundada em",
  "company.stats.people_one": "Pessoa",
  "company.stats.people_other": "Pessoas",
  "company.stats.avgReview_one": "Avaliação média · {count} avaliação",
  "company.stats.avgReview_other": "Avaliação média · {count} avaliações",
  "company.stats.noScore": "Sem nota",
  "company.membersLabel_one": "Ver {count} pessoa",
  "company.membersLabel_other": "Ver as {count} pessoas",
  "company.hiringContact.fallbackName": "A equipa",
  "company.hiringContact.fallbackRole":
    "A equipa da empresa lê as candidaturas.",
  "landlord.recommendation.when": "Recomendação de {date}",
  // PRD-249. Precisão ao mês. "Diz que": a plataforma relata uma afirmação, não
  // a confirma.
  "landlord.recommendation.tenancy.range": "Diz que arrendou de {from} a {to}",
  "landlord.recommendation.tenancy.ongoing": "Diz que arrenda desde {from}",
  "landlord.recommendation.reply.published": "Publicado pela equipa, {date}",
  "housingCoop.card.phaseLabel": "Fase {number} · {phase}",
  "housingCoop.card.phaseWord.forming": "formação",
  "housingCoop.card.phaseWord.legal": "constituição legal",
  "housingCoop.card.phaseWord.finance": "financiamento",
  "housingCoop.card.phaseWord.property": "imóvel",
  "housingCoop.card.phaseWord.daily": "dia a dia",
  "housingCoop.card.cta.join": "Pedir para entrar",
  "housingCoop.card.cta.updates": "Ler novidades",
  "housingCoop.card.cta.mentor": "Pedir mentoria",
  "housingCoop.card.location_one": "{area}, {city} · {count} agregado",
  "housingCoop.card.location_other": "{area}, {city} · {count} agregados",
  "housingCoop.card.meta.targetShares": "Quotas-alvo",
  "housingCoop.card.meta.memberShares": "Quotas dos membros",
  "housingCoop.card.meta.monthly": "Mensal",
  "housingCoop.card.meta.operating": "Em funcionamento",
  "housingCoop.card.meta.formingSince": "Em formação desde",
  "housingCoop.card.operationalSince": "A funcionar desde",
  "housingCoop.card.progressThrough": "<em>{percent}</em> concluído",
  "housingCoop.card.duration.years_one": "{count} ano",
  "housingCoop.card.duration.years_other": "{count} anos",
  "housingCoop.card.duration.months_one": "{count} mês",
  "housingCoop.card.duration.months_other": "{count} meses",
  "housingCoop.card.duration.justOpened": "abriu agora",
  "tax.disclaimer":
    "Apenas informação geral. As regras mudam e cada situação é diferente, por isso confirma estes valores com contabilista certificado antes de contares com eles.",
  "tax.retentionRate.23": "23% (valor por defeito desde 2025)",
  "tax.retentionRate.25": "25% (opcional)",
  "tax.retentionRate.16_5": "16,5% (propriedade intelectual ou industrial)",
  "tax.retentionRate.11_5": "11,5% (atividades fora da tabela do art. 151.º)",
  "tax.retentionRate.0": "Sem retenção (dispensa, art. 101.º-B)",
  "postJob.step3.maxPlaceholder": "Opcional",
  "postJob.confirm.share.linkCopied": "Copiado",
  "postJob.confirm.share.toastLinkFailed":
    "Não conseguimos aceder à área de transferência. Abre o anúncio e copia o link da barra de endereço do navegador.",
  "rateBoard.eyebrow": "Neste dispositivo",
  "housingCoop.empty.bodyComingSoon":
    "É aqui que vais encontrar grupos a organizar habitação em conjunto. Ainda ninguém começou nenhum por aqui, e em breve vais poder anunciar que estás a começar um.",
  "housingCoop.startCta.comingSoonNote":
    "Em breve vais poder anunciar que estás a começar uma cooperativa. Até lá, podes pedir para entrar em qualquer cooperativa já em formação aqui em cima.",
  "myHousingListings.edit.backToReviewWarning":
    "Este anúncio está publicado neste momento. Ao guardares uma alteração, volta para revisão e sai do quadro público até a moderação o aprovar de novo. Normalmente é rápido.",
  "myHousingListings.toast.backToReview":
    "Guardado. O teu anúncio voltou para revisão, por isso está fora do quadro até a moderação o aprovar.",
  // ── Anúncios em grupos de habitação: editar e retirar o teu (BE-HSG-20) ──
  "groupListing.manage.editCta": "Editar",
  "groupListing.manage.editAriaLabel": "Editar o anúncio {title}",
  "groupListing.manage.withdrawCta": "Retirar",
  "groupListing.manage.withdrawAriaLabel": "Retirar o anúncio {title}",

  "groupListing.edit.ariaLabel": "Editar o anúncio {title}",
  "groupListing.edit.eyebrow": "O teu quarto",
  "groupListing.edit.title": "Corrige <em>o teu anúncio</em>",
  "groupListing.edit.sub":
    "Corrige a renda, reescreve a descrição ou atualiza o que disseste sobre acessibilidade.",
  "groupListing.edit.backToReviewWarning":
    "Tudo neste formulário aparece na página do grupo, por isso guardar uma alteração envia o quarto de volta para revisão. Sai da página do grupo até a moderação o aprovar de novo. Normalmente é rápido.",
  "groupListing.edit.submitCta": "Guardar e enviar para revisão",
  "groupListing.edit.submitting": "A guardar…",

  "groupListing.field.titleLabel": "Quarto ou apartamento",
  "groupListing.field.titlePlaceholder": "Quarto soalheiro em casa partilhada",
  "groupListing.field.neighbourhoodLabel": "Zona",
  "groupListing.field.neighbourhoodPlaceholder": "Arroios",
  "groupListing.field.priceLabel": "Renda por mês",
  "groupListing.field.pricePlaceholder": "480",
  "groupListing.field.priceHint":
    "Um valor real em euros. Indicar a renda à partida é uma regra da casa por aqui.",
  "groupListing.field.priceError":
    "Indica um valor inteiro em euros, no mínimo 1.",
  "groupListing.field.descriptionLabel": "Como é o sítio",
  "groupListing.field.descriptionPlaceholder":
    "Quem lá vive, como é o apartamento, o que procuras em quem vier partilhar.",
  "groupListing.field.accessLabel": "Acessibilidade",
  "groupListing.field.accessPlaceholder":
    "Terceiro andar, sem elevador. A porta da casa de banho tem 70cm. Sem degraus da rua até à porta do prédio.",
  "groupListing.field.accessHint":
    "Descreve escadas, elevador, percursos sem degraus e larguras de porta com honestidade. Todos os anúncios aqui têm de o fazer.",

  "groupListing.withdraw.confirmTitle": "Retirar este quarto?",
  "groupListing.withdraw.confirmBody":
    "{title} sai da página do grupo para toda a gente. Isto não se pode desfazer, por isso publica outra vez se o quarto voltar a ficar livre.",
  "groupListing.withdraw.confirmCta": "Retirar o anúncio",

  "groupListing.toast.backToReview":
    "Guardado. O teu quarto voltou para revisão, por isso está fora da página do grupo até a moderação o aprovar.",
  "groupListing.toast.editFailed": "Não foi possível guardar essa alteração",
  "groupListing.toast.withdrawn":
    "Esse quarto foi retirado. Agradecemos por manteres o grupo em ordem.",
  "groupListing.toast.withdrawFailed": "Não foi possível retirar esse anúncio",

  // ── Anúncios de grupo: publicar um quarto e ver onde estão os teus ──
  "groupListing.post.ariaLabel": "Publicar um quarto em {group}",
  "groupListing.post.eyebrow": "Partilhar um quarto",
  "groupListing.post.title": "Publica um quarto <em>no grupo</em>",
  "groupListing.post.sub":
    "Diz a quem está em {group} o que está livre, quanto custa e como é chegar ao sítio.",
  "groupListing.post.reviewNotice":
    "A moderação lê todos os quartos antes de irem para a página do grupo. O teu fica em revisão até lá e vais saber aqui o que ficou decidido.",
  "groupListing.post.submitCta": "Enviar para revisão",
  "groupListing.post.submitting": "A enviar…",
  "groupListing.post.failed": "Não foi possível enviar esse quarto",
  "groupListing.post.success.title": "O teu quarto está",
  "groupListing.post.success.titleEm": "com a moderação",
  "groupListing.post.success.body":
    "A moderação de <strong>{group}</strong> lê-o a seguir e o quarto vai para a página do grupo assim que for aprovado. De qualquer forma, encontra-lo aqui nos teus quartos.",
  "groupListing.post.posterNamedNotice":
    "Quem consegue ver a página do grupo vai ver o teu nome neste quarto e pode enviar-te mensagem sobre ele.",

  "groupListing.mine.title": "Os teus quartos",
  "groupListing.mine.titleEm": "neste grupo",
  "groupListing.mine.sub":
    "Tudo o que partilhaste aqui e em que ponto está cada um. Nada chega à página do grupo antes de a moderação o ler.",
  "groupListing.mine.postCta": "Publicar um quarto",
  "groupListing.mine.empty":
    "Ainda não partilhaste nenhum quarto aqui. Quando o fizeres, aparece neste sítio com o estado da revisão.",
  "groupListing.mine.postedOn": "Publicado a {date}",

  // PRD-242. Onde um membro vê o que aconteceu à sua candidatura a uma
  // cooperativa ou a um grupo de habitação. "Notificação" é sempre o sino: a
  // QueerPulse não envia email nenhum.
  "housingJoinRequests.coop.title": "As tuas candidaturas",
  "housingJoinRequests.coop.titleEm": "a cooperativas",
  "housingJoinRequests.coop.sub":
    "Todas as cooperativas a que pediste para entrar, e o ponto de situação de cada pedido. Recebes uma notificação assim que houver decisão.",
  "housingJoinRequests.group.title": "A tua candidatura",
  "housingJoinRequests.group.titleEm": "a este grupo",
  "housingJoinRequests.group.sub":
    "O ponto de situação do teu pedido para entrar. Recebes uma notificação assim que quem gere o grupo decidir.",
  "housingJoinRequests.askedOn": "Pedido a {date}",
  "housingJoinRequests.status.pending": "À espera de decisão",
  "housingJoinRequests.status.accepted": "Entraste",
  "housingJoinRequests.status.declined": "Desta vez não",
  "housingJoinRequests.outcome.pending":
    "Ainda ninguém decidiu. Assim que decidirem, aparece aqui.",
  "housingJoinRequests.outcome.accepted":
    "Foste aceite. O que vier a seguir parte de quem faz a gestão.",
  "housingJoinRequests.outcome.declined":
    "Este pedido não foi aprovado. Podes voltar a pedir mais tarde, ou ver os outros.",
  "joinCoop.success.whereToCheck":
    "Encontras esta candidatura, e a decisão sobre ela, mais abaixo nesta página.",
  "joinGroup.success.whereToCheck":
    "Encontras este pedido, e a decisão de quem gere o grupo, no topo da página do grupo.",

  "groupListing.mine.status.review": "À espera de revisão",
  "groupListing.mine.status.question": "Uma pergunta para ti",
  "groupListing.mine.status.live": "Na página do grupo",
  "groupListing.mine.status.declined": "Não publicado",
  "groupListing.mine.status.takenDown": "Retirado",

  "groupListing.mine.decision.question": "A moderação perguntou-te uma coisa",
  "groupListing.mine.decision.declined":
    "Porque é que este quarto não foi publicado",
  "groupListing.mine.decision.takenDown":
    "Porque é que este quarto foi retirado",
  "groupListing.mine.decision.questionHint":
    "Para responder, edita o quarto. Ao guardares, volta para as mãos da moderação.",
  "groupListing.mine.decision.editHint":
    "Edita o quarto para corrigir o que está indicado aqui. Ao guardares, volta para as mãos da moderação.",
  "groupListing.mine.reportTakedown.title": "Retirado depois de uma denúncia",
  "groupListing.mine.reportTakedown.body":
    "A moderação retirou este quarto depois de alguém o denunciar. Agora já ninguém o vê na página do grupo.",
  "groupListing.mine.reportTakedown.appealHint":
    "Se achas que foi um engano, outra pessoa da moderação pode voltar a analisá-lo.",
  "groupListing.mine.reportTakedown.appealButton": "Recorrer",
  "groupListing.mine.reportTakedown.appealAria":
    "Recorrer da retirada de {title}",

  // ── Recomendações de senhorios: retirar a tua (BE-HSG-18) ──
  "landlordPage.recommendation.yoursBadge": "Tua",
  "landlordPage.recommendation.withdrawCta": "Retirar",
  "landlordPage.withdraw.confirmTitle": "Retirar a tua recomendação?",
  "landlordPage.withdraw.confirmBody":
    "Sai da página de {name} e deixa de contar para a classificação. Podes escrever outra quando quiseres.",
  "landlordPage.withdraw.confirmCta": "Retirar",
  "landlordPage.toast.recommendationWithdrawn":
    "A tua recomendação foi retirada.",
  "landlordPage.toast.withdrawFailed":
    "Não foi possível retirar essa recomendação",

  // ── Consola de candidaturas do lado de quem publica (BE-HSG-16) ──
  "jobDetail.sidebar.reviewApplicationsCta": "Ver candidaturas",
  "jobApplications.eyebrow": "Candidaturas",
  "jobApplications.fallbackJobTitle": "O teu anúncio",
  "jobApplications.countTotal_one": "{count} pessoa candidatou-se.",
  "jobApplications.countTotal_other": "{count} pessoas candidataram-se.",
  "jobApplications.countWaiting_one": "{count} está à espera de uma decisão.",
  "jobApplications.countWaiting_other":
    "{count} estão à espera de uma decisão.",
  "jobApplications.countWaitingNone": "Neste momento não há nada à tua espera.",
  "jobApplications.notifyNote":
    "Quem aceitares ou recusares recebe uma mensagem direta tua, por isso vai espreitando a tua caixa de entrada para veres a resposta.",
  "jobApplications.viewListing": "Ver o anúncio",
  "jobApplications.appliedOn": "Candidatou-se a {date}",
  "jobApplications.applicantRemoved": "Alguém que entretanto saiu",
  "jobApplications.status.submitted": "Nova",
  "jobApplications.status.reviewing": "Em análise",
  "jobApplications.status.accepted": "Aceite",
  "jobApplications.status.declined": "Recusada",
  "jobApplications.action.startReview": "Começar a analisar",
  "jobApplications.action.decline": "Recusar",
  "jobApplications.action.accept": "Aceitar",
  "jobApplications.decisionFinal":
    "Esta decisão é definitiva e a pessoa já foi avisada.",
  "jobApplications.decideFailed": "Não foi possível atualizar essa candidatura",
  "jobApplications.confirmAccept.title": "Aceitar esta candidatura?",
  "jobApplications.confirmAccept.body":
    "A pessoa recebe uma mensagem direta tua a avisar. Aceitar é definitivo, por isso pensa bem antes.",
  "jobApplications.confirmAccept.cta": "Aceitar",
  "jobApplications.confirmDecline.title": "Recusar esta candidatura?",
  "jobApplications.confirmDecline.body":
    "A pessoa recebe uma mensagem direta tua a avisar. Recusar é definitivo, e uma palavra amável na tua resposta faz toda a diferença.",
  "jobApplications.confirmDecline.cta": "Recusar",
  "jobApplications.empty.title": "Ainda sem candidaturas",
  "jobApplications.empty.description":
    "Quando alguém se candidatar, aparece aqui, com o que te tiver escrito.",
  "jobApplications.forbidden.title": "Este anúncio é de outra pessoa",
  "jobApplications.forbidden.description":
    "Só quem publicou uma vaga pode ler as candidaturas dela. Se o anúncio é teu, entra com a conta com que o publicaste.",
  "jobApplications.forbidden.cta": "Voltar à bolsa",
  "jobApplications.missing.title": "Esse anúncio já não existe",
  "jobApplications.missing.description":
    "Pode ter sido retirado. Vê que outras vagas estão abertas.",
  "jobApplications.error.title": "Não conseguimos carregar as candidaturas",
  "jobApplications.error.description":
    "Algo correu mal do nosso lado. Tenta outra vez daqui a pouco.",
  "jobApplications.error.retry": "Tentar outra vez",

  // ── Paginação da bolsa de competências + caixa de propostas de quem publica ──
  "barter.loadMore": "Ver mais trocas",
  "barter.loadingMore": "A carregar mais trocas…",

  "barterProposals.entryLink": "As tuas trocas e propostas",
  "barterProposals.eyebrow": "Bolsa de competências",
  "barterProposals.title": "Propostas nas tuas trocas",
  "barterProposals.countListings_one": "{count} troca publicada.",
  "barterProposals.countListings_other": "{count} trocas publicadas.",
  "barterProposals.countWaiting_one": "{count} proposta está à tua espera.",
  "barterProposals.countWaiting_other": "{count} propostas estão à tua espera.",
  "barterProposals.countWaitingNone":
    "Não tens nada à espera de resposta neste momento.",
  "barterProposals.backToBoard": "Voltar à bolsa de competências",
  "barterProposals.pickerLegend":
    "Escolhe de que troca queres ler as propostas",
  "barterProposals.pendingBadgeLabel_one": "{count} proposta à espera",
  "barterProposals.pendingBadgeLabel_other": "{count} propostas à espera",
  "barterProposals.proposedOn": "Proposta a {date}",
  "barterProposals.proposerRemoved": "Alguém que entretanto saiu",
  "barterProposals.status.pending": "À tua espera",
  "barterProposals.status.accepted": "Aceite",
  "barterProposals.status.declined": "Recusada",
  "barterProposals.action.accept": "Aceitar",
  "barterProposals.action.decline": "Recusar",
  "barterProposals.decisionFinal":
    "Esta resposta é definitiva e a pessoa já foi avisada.",
  "barterProposals.confirmAccept.title": "Aceitar esta troca?",
  "barterProposals.confirmAccept.body":
    "A pessoa recebe a tua resposta nas mensagens, onde podem combinar a troca em conjunto. Aceitar é definitivo, por isso pensa um momento.",
  "barterProposals.confirmAccept.cta": "Aceitar",
  "barterProposals.confirmDecline.title": "Recusar esta troca?",
  "barterProposals.confirmDecline.body":
    "A pessoa recebe a tua resposta nas mensagens. Recusar é definitivo, e uma palavra simpática faz toda a diferença.",
  "barterProposals.confirmDecline.cta": "Recusar",
  "barterProposals.decide.errorFailed":
    "A tua resposta não ficou guardada. Tenta outra vez daqui a pouco.",
  "barterProposals.decide.errorNotOwner":
    "Esta troca é de outra pessoa, por isso só ela pode responder às propostas.",
  "barterProposals.decide.errorGone":
    "Esta troca ou esta proposta já não existe. Atualiza para veres o que ainda cá está.",
  "barterProposals.decide.errorAlreadyDecided":
    "Esta proposta já tem resposta. Atualiza para veres como ficou.",
  "barterProposals.empty.title": "Ainda não há propostas nesta troca",
  "barterProposals.empty.description":
    "Quando alguém propuser uma troca aparece aqui, com o que te escreveu.",
  "barterProposals.noListings.title": "Ainda não publicaste nenhuma troca",
  "barterProposals.noListings.description":
    "Põe alguma coisa em cima da mesa e as propostas de outras pessoas chegam aqui.",
  "barterProposals.noListings.cta": "Ir para a bolsa de competências",
  "barterProposals.forbidden.title": "Esta troca é de outra pessoa",
  "barterProposals.forbidden.description":
    "Só quem publicou uma troca pode ler as suas propostas. Se esta é tua, entra com a conta com que a publicaste.",
  "barterProposals.missing.title": "Essa troca já não existe",
  "barterProposals.missing.description":
    "Pode ter sido retirada do mural. Vê o que mais há na bolsa de competências.",
  "barterProposals.error.title": "Não conseguimos carregar as propostas",
  "barterProposals.error.description":
    "Algo correu mal do nosso lado. Tenta outra vez daqui a pouco.",
  "barterProposals.error.retry": "Tentar outra vez",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "flatmateDangerZone.heading": "Zona de risco",
  "flatmateDangerZone.takeDown.label": "Retirar o teu perfil do quadro",
  "flatmateDangerZone.takeDown.text":
    "Já encontraste casa, ou queres os teus pronomes, etiquetas de identidade, respostas sobre a casa e orçamento fora de um quadro aberto a toda a comunidade? Podes remover o teu perfil quando quiseres. Não há como voltar atrás.",
  "flatmateDangerZone.takeDown.cta": "Retirar perfil",
  "flatmateDangerZone.confirm.title": "Retirar o teu perfil de colega de casa?",
  "flatmateDangerZone.confirm.body":
    "O teu perfil sai do quadro de colegas de casa de imediato, com tudo o que tem: pronomes, identidade de género, necessidades de espaço seguro, respostas sobre a casa, bairro e orçamento. Todas as escolhas de gostar ou passar que outras pessoas fizeram nele desaparecem também, por isso qualquer correspondência que tivesses termina.",
  "flatmateDangerZone.confirm.keeps":
    "As conversas que já começaste ficam nas Mensagens para as duas pessoas. Podes publicar um novo perfil mais tarde, e começa vazio.",
  "flatmateDangerZone.confirm.cta": "Retirar",
  "flatmateDangerZone.confirm.retryCta": "Tentar de novo",
  "flatmateDangerZone.confirm.error":
    "Não foi possível retirar o teu perfil. Continua no quadro. Tenta de novo.",
  "flatmateDangerZone.cause.gone":
    "O teu perfil de colega de casa já saiu do quadro. Atualiza a página para veres como está.",
  "flatmateDangerZone.toast.deleted":
    "O teu perfil de colega de casa saiu do quadro.",
  "postProfileForm.editTitle": "O teu perfil de colega de casa",
  "postProfileForm.editSub":
    "Muda o que quiseres aqui e guarda, e o quadro atualiza de imediato. Também podes retirar o perfil todo, em baixo.",
  "postProfileForm.editSubmitCta": "Guardar alterações",
  "barter.hero.mineCta": "As tuas trocas e as propostas que enviaste",
  "myBarter.eyebrow": "Bolsa de competências",
  "myBarter.title": "As tuas <em>trocas</em>",
  "myBarter.sub":
    "As trocas que publicaste e as propostas que fizeste nas trocas de outras pessoas.",
  "myBarter.backToBoard": "Voltar ao mural",
  "myBarter.posted.heading": "Trocas que publicaste",
  "myBarter.posted.status.open": "No mural",
  "myBarter.posted.status.closed": "Fechada",
  "myBarter.posted.waiting_one":
    "{count} proposta está à espera da tua resposta.",
  "myBarter.posted.waiting_other":
    "{count} propostas estão à espera da tua resposta.",
  "myBarter.posted.noneWaiting": "Nenhuma proposta à espera da tua resposta.",
  "myBarter.posted.actions.proposals": "Ler propostas",
  "myBarter.posted.actions.edit": "Editar",
  "myBarter.posted.actions.view": "Ver no mural",
  "myBarter.posted.actions.close": "Retirar do mural",
  "myBarter.posted.empty.title": "Ainda não publicaste nenhuma troca",
  "myBarter.posted.empty.description":
    "Publica o que sabes fazer e o que gostavas de receber em troca. É no mural que as pessoas se encontram.",
  "myBarter.posted.empty.cta": "Ir para o mural",
  "myBarter.posted.error.title":
    "Não conseguimos carregar as trocas que publicaste",
  "myBarter.posted.error.body":
    "O pedido não chegou. As tuas trocas continuam lá.",
  "myBarter.sent.heading": "Propostas que enviaste",
  "myBarter.sent.status.pending": "A aguardar resposta",
  "myBarter.sent.status.accepted": "Aceite",
  "myBarter.sent.status.declined": "Recusada",
  "myBarter.sent.sentOn": "Enviada a {date}",
  "myBarter.sent.answeredOn": "respondida a {date}",
  "myBarter.sent.editedAfter":
    "Quem publicou alterou esta troca depois da tua proposta. Confirma que ainda te serve antes de avançares.",
  "myBarter.sent.listingGone": "Esta troca já não está no mural",
  "myBarter.sent.unknownPoster": "Pessoa da comunidade",
  "myBarter.sent.actions.view": "Ver a troca",
  "myBarter.sent.actions.thread": "Abrir a conversa",
  "myBarter.sent.empty.title": "Ainda não propuseste nenhuma troca",
  "myBarter.sent.empty.description":
    "Quando propuseres uma troca a alguém, ela aparece aqui com a resposta que receberes.",
  "myBarter.sent.empty.cta": "Ver o mural",
  "myBarter.sent.error.title":
    "Não conseguimos carregar as propostas que enviaste",
  "myBarter.sent.error.body":
    "O pedido não chegou. As tuas propostas continuam lá.",
  "myBarter.close.confirmTitle": "Retirar esta troca do mural?",
  "myBarter.close.confirmBody":
    "Deixa de receber novas propostas. As propostas que já tem ficam como estão e não há forma de a voltar a publicar.",
  "myBarter.close.confirmCta": "Retirar",
  "myBarter.close.done": "A troca saiu do mural.",
  "myBarter.close.errorNotYours":
    "Não publicaste esta troca, por isso não a podes fechar.",
  "myBarter.close.errorGone": "Esta troca já não existe.",
  "myBarter.close.errorFailed":
    "Não conseguimos fechar a troca. Tenta novamente.",
  "barterEdit.back": "Voltar às tuas trocas",
  "barterEdit.eyebrow": "Bolsa de competências",
  "barterEdit.title": "Editar a tua <em>troca</em>",
  "barterEdit.sub":
    "Corrige um erro, afina as palavras ou muda o que estás a pedir.",
  "barterEdit.pendingNotice_one":
    "{count} pessoa já propôs algo nesta troca. Se mudares o que ofereces ou o que pedes, essa pessoa vai ver que a troca mudou depois da proposta.",
  "barterEdit.pendingNotice_other":
    "{count} pessoas já propuseram algo nesta troca. Se mudares o que ofereces ou o que pedes, essas pessoas vão ver que a troca mudou depois da proposta.",
  "barterEdit.cancel": "Cancelar",
  "barterEdit.saveCta": "Guardar alterações",
  "barterEdit.saving": "A guardar",
  "barterEdit.field.mode": "O que é esta publicação",
  "barterEdit.field.category": "Categoria",
  "barterEdit.field.offer": "O que ofereces",
  "barterEdit.field.offerHelper": "Uma linha. É o título que aparece no mural.",
  "barterEdit.field.offerDetail": "Mais sobre o que ofereces",
  "barterEdit.field.offerDetailHelper":
    "O que está incluído, em que quantidade e como é trabalhar contigo.",
  "barterEdit.field.want": "O que procuras",
  "barterEdit.field.wantHelper":
    "Uma linha. O que para ti seria uma troca justa.",
  "barterEdit.field.wantDetail": "Mais sobre o que procuras",
  "barterEdit.field.wantDetailHelper":
    "O detalhe ajuda quem lê a perceber se te consegue mesmo ajudar.",
  "barterEdit.field.tags": "Etiquetas",
  "barterEdit.field.tagsHelper": "Separa por vírgulas. Até oito.",
  "barterEdit.save.done": "A tua troca foi atualizada.",
  "barterEdit.save.errorInvalid":
    "Há algo no formulário que ainda não está certo. Confirma que cada lado da troca diz o que anuncia.",
  "barterEdit.save.errorNotYours":
    "Não publicaste esta troca, por isso não a podes editar.",
  "barterEdit.save.errorGone": "Esta troca já não existe.",
  "barterEdit.save.errorFailed":
    "Não conseguimos guardar as alterações. Tenta novamente.",
  "barterEdit.loadError.title": "Não conseguimos carregar esta troca",
  "barterEdit.loadError.body": "O pedido não chegou. A tua troca continua lá.",
  "barterEdit.gone.title": "Esta troca desapareceu",
  "barterEdit.gone.body":
    "Já não está no mural, por isso não há nada para editar.",
  "barterEdit.gone.cta": "Voltar às tuas trocas",
  "barterEdit.notYours.title": "Esta troca não é tua",
  "barterEdit.notYours.body": "Só quem publicou uma troca a pode alterar.",
  "barterEdit.notYours.cta": "Voltar ao mural",
  "myJobs.eyebrow": "Bolsa de emprego",
  "myJobs.title": "Vagas <em>que publicaste.</em>",
  "myJobs.sub":
    "Tudo o que publicaste, aberto ou fechado. Corrige um detalhe, vê quem se candidatou ou retira uma vaga.",
  "myJobs.postCta": "Publicar outra vaga",
  "myJobs.entryLink": "Vagas que publicaste",
  "myJobs.noOrganization": "Sem empresa",
  "myJobs.status.open": "Aberta",
  "myJobs.status.closed": "Fechada",
  "myJobs.postedOn": "Publicada a {date}",
  "myJobs.postedRecently": "Publicada recentemente",
  "myJobs.closedHint": "já não aparece na bolsa",
  "myJobs.actions.view": "Ver anúncio",
  "myJobs.actions.edit": "Editar",
  "myJobs.actions.applications": "Candidaturas",
  "myJobs.actions.close": "Fechar",
  "myJobs.close.confirmTitle": "Fechar este anúncio?",
  "myJobs.close.confirmBody":
    "Sai da bolsa e deixa de receber candidaturas. Quem já se candidatou mantém a candidatura e continuas a poder lê-la.",
  "myJobs.close.confirmCta": "Fechar anúncio",
  "myJobs.toast.closed": "Anúncio fechado",
  "myJobs.toast.closeError": "Não foi possível fechar esse anúncio",
  "myJobs.empty.title": "Ainda não publicaste nenhuma vaga",
  "myJobs.empty.description":
    "Assim que publicares uma vaga, ela aparece aqui, com as candidaturas que reunir e uma forma de corrigir o que estiver errado.",
  "myJobs.empty.cta": "Publicar uma vaga",
  "myJobs.error.title": "Não foi possível carregar as tuas publicações",
  "myJobs.error.description":
    "Os teus anúncios continuam lá. O que falhou foi o pedido para os obter.",
  "myJobs.loadMore": "Carregar mais",
  "myJobs.loadingMore": "A carregar",
  "myJobs.hub.label": "Vagas que publicaste",
  "myJobs.hub.primary_one": "{count} vaga publicada",
  "myJobs.hub.primary_other": "{count} vagas publicadas",
  "myJobs.hub.next": "Edita-as ou vê quem se candidatou",
  "editJob.eyebrow": "A tua publicação",
  "editJob.title": "Editar <em>esta vaga.</em>",
  "editJob.sub":
    "Muda o que estiver errado. O anúncio mantém o mesmo endereço, por isso as ligações que já partilhaste continuam a funcionar.",
  "editJob.quietNote":
    "As alterações ficam guardadas sem alarido. Nada volta para revisão e quem já se candidatou não recebe nenhum aviso.",
  "editJob.section.role": "A vaga",
  "editJob.section.pay": "Remuneração",
  "editJob.section.whatYouOffer": "O que ofereces",
  "editJob.section.benefitsSub": "Benefícios que acompanham a vaga.",
  "editJob.section.inclusivitySub":
    "O que faz deste um sítio seguro para trabalhar.",
  "editJob.section.tagsSub": "Competências que procuras.",
  "editJob.section.screening": "Perguntas de triagem",
  "editJob.section.screeningSub":
    "Até três perguntas a que todas as pessoas candidatas respondem.",
  "editJob.section.contact": "Como te contactar",
  "editJob.field.title": "Título da vaga",
  "editJob.field.description": "Em que consiste a vaga",
  "editJob.field.descriptionHelper":
    "É este o texto que aparece no cartão da vaga.",
  "editJob.field.category": "Área",
  "editJob.field.profession": "Profissão",
  "editJob.legacyFieldNote":
    "Este anúncio foi publicado antes de existirem áreas. Escolhe uma para guardares as alterações.",
  "editJob.field.commitment": "Regime",
  "editJob.field.seniority": "Nível",
  "editJob.field.format": "Onde se trabalha",
  "editJob.field.city": "Cidade",
  "editJob.field.timezone": "Sobreposição de fuso horário",
  "editJob.field.deadline": "Candidaturas até",
  "editJob.field.startDate": "Data de início",
  "editJob.field.startDateHelper":
    "Texto livre, por exemplo: assim que puderes.",
  "editJob.field.currency": "Moeda",
  "editJob.field.rateMin": "De",
  "editJob.field.rateMax": "Até",
  "editJob.field.ratePer": "Por",
  "editJob.field.hidePay": "Esconder os valores",
  "editJob.field.hidePayHelper":
    "O cartão esconde o intervalo e mostra Competitivo.",
  "editJob.field.barter": "Aberto a troca",
  "editJob.field.barterHelper":
    "Admites receber uma troca de competências como pagamento.",
  "editJob.field.email": "Email",
  "editJob.field.link": "Ligação externa",
  "editJob.field.linkHelper": "Um endereço completo, começado por https.",
  "editJob.field.screeningQuestion": "Pergunta {index}",
  "editJob.screening.add": "Adicionar uma pergunta",
  "editJob.screening.remove": "Remover",
  "editJob.save": "Guardar alterações",
  "editJob.saving": "A guardar",
  "editJob.cancel": "Cancelar",
  "editJob.toast.saved": "Anúncio atualizado",
  "editJob.saveFailed": "Não foi possível guardar as alterações",
  "editJob.backToJobs": "Voltar às tuas publicações",
  "editJob.forbidden.title": "Esta publicação não é tua",
  "editJob.forbidden.description": "Só quem publicou uma vaga a pode editar.",
  "editJob.missing.title": "Esta publicação já não existe",
  "editJob.missing.description": "Foi retirada ou o endereço está errado.",
  "editJob.error.title": "Não foi possível carregar esta publicação",
  "editJob.error.description":
    "O anúncio continua lá. O que falhou foi o pedido para o obter.",
  "editJob.error.titleRequired": "Dá um título à vaga.",
  "editJob.error.titleTooLong": "O título tem de ter menos de 200 caracteres.",
  "editJob.error.descriptionRequired": "Diz em que consiste a vaga.",
  "editJob.error.descriptionTooLong": "Essa descrição é demasiado longa.",
  "editJob.error.cityRequired": "Indica a cidade.",
  "editJob.error.rateRange": "O valor máximo não pode ser inferior ao mínimo.",
  "editJob.error.emailRequired":
    "Adiciona o email para onde as pessoas candidatas devem escrever.",
  "editJob.error.linkRequired":
    "Adiciona a ligação que as pessoas candidatas devem seguir.",
  "company.reviews.reply.employerResponseTitle":
    "Resposta da entidade empregadora",
  "company.reviews.reply.editedAfterReply":
    "Esta avaliação foi alterada depois da resposta da entidade empregadora, por isso a resposta pode referir-se a um texto diferente.",
  "company.reviews.reply.replyCta": "Responder como entidade empregadora",
  "company.reviews.reply.editReplyCta": "Editar a tua resposta",
  "company.reviews.reply.placeholder":
    "Responde a esta avaliação em público. Quem ler a página vai ver a resposta em nome da entidade empregadora.",
  "company.reviews.reply.cancel": "Cancelar",
  "company.reviews.reply.save": "Publicar resposta",
  "company.reviews.reply.savingLabel": "A publicar...",
  "company.reviews.reply.successToast": "A tua resposta já está na página.",
  "company.reviews.reply.errorToast":
    "Não foi possível guardar a resposta. Tenta de novo.",
  "company.reviews.reply.errorTitle": "Não conseguimos guardar a tua resposta",
  "company.reviews.reply.cause.empty":
    "A tua resposta está vazia. Escreve algumas palavras e tenta outra vez.",
  "company.reviews.reply.cause.notOwner":
    "Só a pessoa proprietária da empresa pode responder a uma avaliação, e um perfil que ninguém reivindicou ainda não tem pessoa proprietária.",
  "company.reviews.editedOn": "Editada a {date}",
  "company.reviews.report.cta": "Denunciar esta avaliação",
  "company.reviews.report.ariaLabel":
    "Denunciar a avaliação com o título {title}",
  "employerReviewCard.reply.title": "Resposta da entidade empregadora",
  "employerReviewCard.reply.editedAfterReply":
    "Esta avaliação foi alterada depois da resposta da entidade empregadora, por isso a resposta pode referir-se a um texto diferente.",
  "housingReview.loadError.title":
    "Não foi possível carregar as avaliações desta casa",
  "housingReview.loadError.body":
    "As avaliações continuam lá. O pedido ficou sem resposta. Tenta novamente daqui a pouco.",
  "housingReview.editedOn": "Editada a {date}",
  "housingReview.editedAfterReply":
    "Esta avaliação foi alterada depois de a resposta ter sido escrita, por isso a resposta pode estar a responder a outras palavras.",
  "housingReview.report.cta": "Denunciar esta avaliação",
  "housingReview.report.subjectName": "a avaliação de {name}",
  "housingReview.reply.listerResponseTitle": "Resposta de quem anuncia",
  "housingReview.reply.cta": "Responder a esta avaliação",
  "housingReview.reply.editCta": "Editar a tua resposta",
  "housingReview.reply.placeholder":
    "Responde por palavras tuas. Quem ler este anúncio vai ver a resposta.",
  "housingReview.reply.publicNote":
    "Uma resposta por avaliação, e é pública. Escrever de novo substitui a anterior.",
  "housingReview.reply.cancel": "Cancelar",
  "housingReview.reply.save": "Publicar resposta",
  "housingReview.reply.savingLabel": "A publicar...",
  "housingReview.reply.successToast": "A tua resposta está no anúncio.",
  "housingReview.reply.errorToast":
    "A tua resposta não foi guardada. Continua aqui, podes tentar de novo.",
  "housingReview.reply.errorTitle": "Não conseguimos guardar a tua resposta",
  "housingReview.reply.cause.empty":
    "A tua resposta está vazia. Escreve algumas palavras e tenta outra vez.",
  "housingReview.reply.cause.notYetYours":
    "Só podes responder a uma avaliação sobre ti, e uma avaliação fica escondida até as duas pessoas escreverem a sua.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // BLIND-EDIT — BLIND-EDIT: housing reviews close to edits at reveal. ONE key, and it is NOT wired by this agent, because there is no edit affordance anywhere in the housing UI to attach it to (verified: `updateHousingReview` in housingReviews.api.ts has zero callers, and `useHousingReviews.ts` exposes no edit hook). The only correct home for it is the blind note in `ReviewViewingModal.tsx`, which this agent does not own. Land it together with an edit affordance: on its own it promises a correction the UI cannot deliver. The exact insertion is in this agent's report.
  // LANDLORD-MOD — LANDLORD-MOD (PRD-47d) - the per-recommendation report control on the landlord page, and the byline of a recommendation whose author erased their account. The entry-level report control in the hero keeps its existing copy: this is the narrower one, so acting on it takes down one tenant's warning instead of every warning about that landlord. The formerMember string mirrors marketing:listBusiness.coManagers.formerMember word for word, so the same absence reads the same way wherever a member has left.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "housingViewing.review.editableUntilPublic":
    "Podes alterar o que escreveste até a tua avaliação ficar pública. A partir daí fica como a enviaste.",
  "landlordPage.recommendation.report.cta": "Denunciar esta recomendação",
  "landlordPage.recommendation.report.ariaLabel":
    "Denunciar a recomendação de {name}",
  "landlordPage.recommendation.formerMember": "Alguém que entretanto saiu",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // BLIND-EDIT-FE — BLIND-EDIT-FE: the member-facing half of the housing blind-review edit. NOTE: `housingViewing.review.editableUntilPublic` is NOT declared here, it is claimed by the BLIND-EDIT manifest, and this agent wires it exactly where that manifest recommended (appended after `housingViewing.review.blindNote` in the note block, now inside the shared `ReviewViewingForm`, so it shows on both the first submission and the correction). Keys below are new. `housingViewing.reviews.ratingAria` is reused as-is (existing CLDR plural).
  // BLIND-EDIT — BLIND-EDIT: housing reviews close to edits at reveal. ONE key, and it is NOT wired by this agent, because there is no edit affordance anywhere in the housing UI to attach it to (verified: `updateHousingReview` in housingReviews.api.ts has zero callers, and `useHousingReviews.ts` exposes no edit hook). The only correct home for it is the blind note in `ReviewViewingModal.tsx`, which this agent does not own. Land it together with an edit affordance: on its own it promises a correction the UI cannot deliver. The exact insertion is in this agent's report.
  // LANDLORD-MOD — LANDLORD-MOD (PRD-47d) - the per-recommendation report control on the landlord page, and the byline of a recommendation whose author erased their account. The entry-level report control in the hero keeps its existing copy: this is the narrower one, so acting on it takes down one tenant's warning instead of every warning about that landlord. The formerMember string mirrors marketing:listBusiness.coManagers.formerMember word for word, so the same absence reads the same way wherever a member has left.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "housingViewing.review.loading": "A carregar a tua avaliação.",
  "housingViewing.review.loadError.title":
    "Não foi possível carregar esta avaliação",
  "housingViewing.review.loadError.description":
    "Algo correu mal do nosso lado. Tenta novamente daqui a pouco.",
  "housingViewing.review.editAriaLabel": "A tua avaliação",
  "housingViewing.review.editEyebrow": "Ainda privada",
  "housingViewing.review.editTitle":
    "Alterar a tua avaliação sobre <em>{name}</em>",
  "housingViewing.review.editBody":
    "Corrige uma gralha, diz melhor o que querias dizer, muda a classificação. Ainda ninguém leu isto.",
  "housingViewing.review.saveChanges": "Guardar alterações",
  "housingViewing.review.saving": "A guardar...",
  "housingViewing.review.editSavedTitle": "Avaliação <em>atualizada.</em>",
  "housingViewing.review.editSavedBody":
    "As tuas alterações ficaram guardadas. Continua privada até <strong>{name}</strong> escrever a sua avaliação, ou até passarem duas semanas.",
  "housingViewing.review.editError":
    "Não foi possível guardar a alteração. Tenta novamente daqui a pouco.",
  "housingViewing.review.editNotYours":
    "Esta avaliação é de outra pessoa, por isso não pode ser alterada aqui.",
  "housingViewing.review.editMissing":
    "Esta avaliação já não existe, por isso não há nada para alterar.",
  "housingViewing.review.gonePublicEyebrow": "Já pública",
  "housingViewing.review.gonePublicTitle":
    "Esta avaliação já é <em>pública.</em>",
  "housingViewing.review.gonePublicBody":
    "Esta avaliação ficou pública, por isso já não pode ser alterada. Uma avaliação pode ser corrigida até ao momento em que fica pública.",
  "housingViewing.list.yourReview": "A tua avaliação",

  // Messaging inbox and entry points (scan section 5, 2026-09-15)
  "barterDetail.propose.openThreadCta": "Abrir a conversa",
};
