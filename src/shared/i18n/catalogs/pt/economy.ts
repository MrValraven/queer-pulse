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
    "Ferramentas, mentoria e solidariedade para fundadoras, freelancers e profissionais queer — porque a independência económica faz parte da libertação queer.",
  "hub.tab.incubator": "Incubadora de negócios",
  "hub.tab.freelance": "Ferramentas para freelancers",
  "hub.tab.salary": "Quadro de salários",
  "hub.outro.title": "Constrói <em>connosco.</em>",
  "hub.outro.sub":
    "Uma economia queer mais forte beneficia todas as pessoas. Começa pelas ferramentas, fica pela comunidade.",
  "hub.outro.browseCta": "Ver vagas",
  "hub.outro.hostCta": "Encontrar uma pessoa mentora",

  // ── IncubatorTab ────────────────────────────────────────────────────────
  "incubator.hero.title": "Um espaço para construíres <em>a tua</em> ideia.",
  "incubator.hero.body":
    "A incubadora QueerPulse apoia fundadoras queer em Lisboa com seis meses de mentoria estruturada, responsabilização entre pares e ligações a investidores e colaboradores que percebem do que se trata.",
  "incubator.hero.applyCta": "Candidatar à 3.ª coorte",
  "incubator.hero.mentorCta": "Tornar-te mentor",
  "incubator.stats.founders": "fundadoras em 2 coortes",
  "incubator.stats.mentors": "pessoas mentoras da comunidade",
  "incubator.stats.raised": "angariados por antigas participantes",
  "incubator.programme.title": "Como <em>funciona</em> o programa.",
  "incubator.mentors.title": "Pessoas <em>mentoras</em> atuais.",
  "incubator.mentors.requestCta": "Pedir sessão",
  "incubator.step.apply.title": "Candidatar",
  "incubator.step.apply.desc":
    "Uma candidatura curta — a tua ideia, onde estás, do que precisas. Sem necessidade de pitch deck. Decisão em 3 semanas.",
  "incubator.step.apply.meta": "Candidaturas abertas · Prazo 30 jul",
  "incubator.step.match.title": "Emparelhamento com mentoria",
  "incubator.step.match.desc":
    "Emparelhado com uma pessoa mentora da comunidade com base no teu setor, fase e naquilo que nos disseste que precisas. Encontram-se quinzenalmente durante seis meses.",
  "incubator.step.match.meta": "Set–fev · Sessões quinzenais",
  "incubator.step.cohort.title": "Sessões de coorte",
  "incubator.step.cohort.desc":
    "Workshops mensais com toda a coorte — jurídico, finanças, angariação de fundos, design — além de tempo para apoio entre pares e conversa honesta.",
  "incubator.step.cohort.meta": "Primeiro sábado de cada mês",
  "incubator.step.demo.title": "Noite de demonstração",
  "incubator.step.demo.desc":
    "Partilha o que construíste com a comunidade, investidores e imprensa. Baixo risco, alto apoio. Decides quanto revelar.",
  "incubator.step.demo.meta": "Março · Apenas por convite",

  // ── FreelanceTab (grelha de ferramentas) ────────────────────────────────
  "freelance.title": "Ferramentas para <em>freelancers.</em>",
  "freelance.sub":
    "Ferramentas reais e funcionais — criadas por e para freelancers queer em Portugal. Gratuitas, sem registo, e nada do que introduzires sai do teu dispositivo.",
  "freelance.section.documents": "Documentos que <em>te pagam.</em>",
  "freelance.section.numbers": "Conhece os teus <em>números.</em>",
  "freelance.section.together": "Mais fortes <em>juntas.</em>",

  "tool.invoice.title": "Gerador de faturas",
  "tool.invoice.desc":
    "Cria uma fatura-recibo limpa e correta para Portugal — NIF, opções de IVA, notas sobre a isenção do art. 53.º e a dispensa do art. 101.º-B — e guarda-a como PDF real. Os teus dados ficam guardados para a próxima vez.",
  "tool.invoice.cta": "Abrir gerador de faturas",
  "tool.contract.title": "Gerador de contratos",
  "tool.contract.desc":
    "Monta um contrato de prestação de serviços freelance cláusula a cláusula — âmbito, pagamento, propriedade intelectual, cancelamento, confidencialidade. Descarrega um PDF ou copia o texto para editar.",
  "tool.contract.cta": "Abrir gerador de contratos",
  "tool.scope.title": "Gerador de âmbito e orçamento",
  "tool.scope.desc":
    "Define exatamente o que vais entregar, o que não vais, revisões e prazos — acrescenta um preço para transformar tudo num orçamento. Exporta um PDF que evita a maioria dos conflitos.",
  "tool.scope.cta": "Abrir gerador de âmbito",
  "tool.reciboGuide.title": "Guia de recibos verdes",
  "tool.reciboGuide.desc":
    "Um guia em linguagem simples sobre o sistema fiscal para freelancers em Portugal — registo, retenção, IVA, Segurança Social e o teu primeiro ano. Sempre atualizado.",
  "tool.reciboGuide.cta": "Ler o guia",

  "tool.takeHome.title": "Calculadora de rendimento líquido",
  "tool.takeHome.desc":
    "Transforma o teu rendimento bruto de freelancer no que realmente ficas a ganhar — depois de IRS e Segurança Social, com os coeficientes do regime simplificado e os teus primeiros anos incluídos.",
  "tool.takeHome.cta": "Abrir calculadora",
  "tool.dayRate.title": "Calculadora de valor-dia",
  "tool.dayRate.desc":
    "Parte do rendimento de que precisas para chegar a um valor-dia (e por hora) que realmente te sustente — despesas gerais, dias não pagos e IVA incluídos.",
  "tool.dayRate.cta": "Abrir calculadora",
  "tool.ivaTracker.title": "Rastreador do limiar do IVA",
  "tool.ivaTracker.desc":
    "Acompanha o teu rendimento faturado face ao limite de isenção do art. 53.º (15 000 €), para nunca seres apanhada de surpresa ao ultrapassá-lo. Guardado no teu dispositivo.",
  "tool.ivaTracker.cta": "Abrir rastreador",
  "tool.setAside.title": "Planeador de reserva fiscal",
  "tool.setAside.desc":
    "Calcula que fatia de cada fatura pôr de lado agora, e mantém um saldo acumulado, para que as contas do IRS e da Segurança Social nunca te apanhem desprevenida.",
  "tool.setAside.cta": "Abrir planeador",
  "tool.comparator.title": "Freelancer vs. assalariada",
  "tool.comparator.desc":
    "Compara o que realmente ficarias a ganhar como freelancer face a um salário equivalente — líquido por líquido, com os custos que um recibo de vencimento esconde.",
  "tool.comparator.cta": "Comparar",

  "tool.rateBoard.title": "Quadro de transparência de valores",
  "tool.rateBoard.desc":
    "Valores-dia anónimos partilhados pela comunidade, por função e experiência — para que ninguém tenha de adivinhar quanto cobrar. Acrescenta o teu, vê como te posicionas.",
  "tool.rateBoard.cta": "Abrir o quadro",
  "tool.slidingScale.title": "Cartão de preços em escala móvel",
  "tool.slidingScale.desc":
    "Publica uma escala móvel para que cada pessoa pague conforme os seus meios e tu continues a receber de forma justa. Cria um cartão e exporta-o para partilhar.",
  "tool.slidingScale.cta": "Criar um cartão",

  // ── SalaryTab ───────────────────────────────────────────────────────────
  "salary.title": "Transparência <em>salarial.</em>",
  "salary.sub":
    "Submissões anónimas da comunidade. Filtra por setor, função ou tipo de contrato. Conhecimento é poder.",
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
    "Ainda não há nada partilhado para este setor. Limpa o filtro para ver todas as submissões — ou junta a tua para ajudar a próxima pessoa a negociar.",
  "salary.empty.clear": "Limpar filtros",
  "salary.disclaimer":
    "Todas as entradas são anónimas. Não é guardado nome, email nem empregador. As entradas são revistas por uma pessoa moderadora antes de aparecerem.",
  "salary.helpBody":
    "Ajuda a comunidade partilhando o que ganhas. Quantas mais entradas, mais útil isto se torna para todas as pessoas — sobretudo para quem está a começar a negociar.",
  "salary.submitLong": "Submeter o teu salário",
  "salary.submitToast": "Submetido de forma anónima — obrigada",

  // ── WorkHubPage ─────────────────────────────────────────────────────────
  "workHub.eyebrow": "O teu espaço de trabalho",
  "workHub.title": "O teu trabalho, <em>{name}.</em>",
  "workHub.status.live": "Tudo sobre o teu trabalho, num só lugar.",
  "workHub.section.needsYou": "O que precisa de ti",
  "workHub.section.whereThingsStand": "Como estão as coisas",
  "workHub.section.profile": "O teu perfil de trabalho",
  "workHub.emptyLive.title": "O teu espaço de trabalho está pronto quando quiseres",
  "workHub.emptyLive.description":
    "Candidata-te a uma vaga, encontra uma pessoa mentora ou guarda uma vaga e tudo se vai juntar aqui — candidaturas, subsídios, saberes e avaliações numa só vista.",
  "workHub.emptyLive.cta": "Ver vagas",

  // ── work.data.tsx (linha de estado + próximas ações + cartões de estado) ─
  "workHub.statusLine.apps_one": "{count} candidatura ativa",
  "workHub.statusLine.apps_other": "{count} candidaturas ativas",
  "workHub.statusLine.offers": "{count} proposta para responder",
  "workHub.statusLine.noOffers": "ainda sem propostas",
  "workHub.statusLine.mentorThreads": "2 conversas de mentoria",

  "workHub.next.offer.label": "Responde à tua proposta de {company}",
  "workHub.next.offer.context": "Estão à espera da tua decisão.",
  "workHub.next.offer.urgency": "Fecha em {days} dias",
  "workHub.next.offer.cta": "Rever proposta",
  "workHub.next.mentor.label": "{name} respondeu sobre o teu emparelhamento de mentoria",
  "workHub.next.mentor.context": "Uma primeira chamada de apresentação está em cima da mesa.",
  "workHub.next.mentor.cta": "Ler resposta",
  "workHub.next.grant.label": "Prazo do micro-subsídio esta sexta-feira",
  "workHub.next.grant.context": "{fund} · até {amount}.",
  "workHub.next.grant.urgency": "Prazo sex.",
  "workHub.next.grant.cta": "Ver subsídio",
  "workHub.next.profile.label": "O teu perfil de trabalho está {percent}% completo",
  "workHub.next.profile.context":
    "Acrescenta a tua preferência de visibilidade no trabalho para seres emparelhada em segurança.",
  "workHub.next.profile.cta": "Concluir perfil",

  "workHub.card.apps.label": "Candidaturas",
  "workHub.card.apps.primary": "{active} ativas / {sent} enviadas",
  "workHub.card.apps.noOffers": "Ainda sem propostas",
  "workHub.card.mentor.label": "Mentoria",
  "workHub.card.mentor.primary": "1 mentoria ativa",
  "workHub.card.mentor.next": "{count} pessoas mentoras com vagas abertas",
  "workHub.card.skills.label": "Troca de saberes",
  "workHub.card.skills.primary": "A ensinar 2 · A aprender 1",
  "workHub.card.skills.next": "Um novo pedido combina contigo",
  "workHub.card.saved.label": "Vagas guardadas",
  "workHub.card.saved.primary": "5 vagas guardadas",
  "workHub.card.saved.next": "2 a fechar esta semana",
  "workHub.card.grants.label": "Subsídios e financiamento",
  "workHub.card.grants.primary": "2 prazos este mês",
  "workHub.card.grants.next": "{fund} abre em breve",
  "workHub.card.reviews.label": "Avaliações de empregadores",
  "workHub.card.reviews.primary": "Já avaliaste 2",
  "workHub.card.reviews.next": "1 rascunho por terminar",

  // ── WorkProfilePage / WorkProfileCard / WorkProfileSections ────────────
  "workProfile.success.title": "O teu perfil de trabalho está <em>definido.</em>",
  "workProfile.success.sub":
    "Apareces às empresas exatamente como escolheres — e nunca de outra forma.",
  "workProfile.success.backCta": "Voltar ao teu espaço de trabalho",
  "workProfile.success.editCta": "Continuar a editar",
  "workProfile.eyebrow": "Perfil de trabalho",
  "workProfile.title": "Como apareces <em>no trabalho.</em>",
  "workProfile.sub":
    "Isto controla o que as empresas veem — e o que fica só contigo. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.saveCta": "Guardar perfil de trabalho",
  "workProfile.savedToast": "Perfil de trabalho guardado",

  "workProfile.card.meterLabel": "Perfil {percent}% completo",
  "workProfile.card.note":
    "Isto controla como apareces às empresas — e o que fica só contigo.",
  "workProfile.card.editCta": "Editar perfil de trabalho",

  "workProfile.identity.title": "Identidade <em>profissional</em>",
  "workProfile.identity.sub": "Como és identificade e descrite às empresas.",
  "workProfile.identity.nameInUse": "Nome utilizado",
  "workProfile.identity.legalName": "Nome legal",
  "workProfile.identity.legalNameOptional": "mantido privado",
  "workProfile.identity.legalNamePlaceholder": "Só quando exigido por lei",
  "workProfile.identity.legalNameHint":
    "Guardado de forma privada e usado apenas quando a lei o exige.",
  "workProfile.identity.pronouns": "Pronomes",
  "workProfile.identity.headline": "Título profissional",
  "workProfile.identity.location": "Localização",
  "workProfile.identity.bio": "Biografia curta",
  "workProfile.identity.bioPlaceholder":
    "Umas linhas sobre o que fazes e o que procuras…",

  "workProfile.showUp.title": "Como apareces <em>no trabalho</em>",
  "workProfile.showUp.sub":
    "Tu decides o que as empresas veem. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.showUp.outAtWork": "Assumide no trabalho",
  "workProfile.showUp.outAtWorkAriaLabel": "Assumide no trabalho",
  "workProfile.showUp.transSupport": "Apoio trans e não-binárie",
  "workProfile.showUp.transSupportOptional": "opcional",
  "workProfile.showUp.matrixLabel": "O que as empresas veem vs a comunidade",
  "workProfile.showUp.matrixField": "Campo",
  "workProfile.showUp.matrixEmployers": "Empresas veem",
  "workProfile.showUp.matrixCommunity": "Comunidade vê",
  "workProfile.showUp.safeOnly.label":
    "Mostrar-me apenas a empresas verificadas como seguras pela comunidade",
  "workProfile.showUp.safeOnly.desc":
    "Ignora tudo o que ainda não foi validado pela rede.",

  "workProfile.outAtWork.out.label": "Totalmente assumide",
  "workProfile.outAtWork.out.desc":
    "A tua identidade queer fica visível para quem vir o teu perfil de trabalho.",
  "workProfile.outAtWork.verified.label":
    "Assumide apenas para empresas verificadas",
  "workProfile.outAtWork.verified.desc":
    "Só empresas verificadas como seguras pela comunidade veem isto. As restantes veem um perfil neutro.",
  "workProfile.outAtWork.private.label": "Privado",
  "workProfile.outAtWork.private.desc":
    "A tua identidade queer nunca é mostrada às empresas. Tu decides a quem contas, e quando.",

  "workProfile.transSupport.chosenName.label":
    "Candidaturas apenas com nome utilizado",
  "workProfile.transSupport.chosenName.desc":
    "As candidaturas usam o teu nome utilizado — nunca um nome legal.",
  "workProfile.transSupport.hideLegal.label":
    "Não mostrar o meu nome legal às empresas",
  "workProfile.transSupport.hideLegal.desc":
    "Mantido privado e usado apenas quando exigido por lei.",
  "workProfile.transSupport.transitionFriendly.label":
    "Preferir empresas amigas de pessoas em transição",
  "workProfile.transSupport.transitionFriendly.desc":
    "Prioriza empresas verificadas por políticas inclusivas para pessoas trans.",

  "workProfile.visMatrix.nameInUse": "Nome utilizado",
  "workProfile.visMatrix.legalName": "Nome legal",
  "workProfile.visMatrix.pronouns": "Pronomes",
  "workProfile.visMatrix.queerIdentity": "Identidade queer",
  "workProfile.visMatrix.skillsFocus": "Saberes e focos",
  "workProfile.visMatrix.visible": "Visível",
  "workProfile.visMatrix.hidden": "Oculto",
  "workProfile.visMatrix.yourChoice": "A tua escolha",
  "workProfile.visMatrix.perSettingAbove": "Consoante a definição acima",

  "workProfile.skillsFocus.title": "Saberes <em>e foco</em>",
  "workProfile.skillsFocus.sub":
    "Usados para te emparelhar na troca de saberes e com mentorias.",
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
  "workProfile.focus.difficultWorkplace": "Navegar um ambiente de trabalho difícil",
  "workProfile.focus.mentalHealth": "Saúde mental no trabalho",

  // ── JobsPage (quadro de vagas) ─────────────────────────────────────────
  "jobs.eyebrow": "Quadro de vagas",
  "jobs.title": "Trabalho que <em>não te pede para te esconderes.</em>",
  "jobs.lead":
    "Negócios geridos por pessoas queer e empresas verificadas como inclusivas — vagas onde podes aparecer como és. Sem rainbow capitalism. Cada anúncio é validado pela comunidade.",
  "jobs.badge.queerRun": "Gerido por pessoas queer",
  "jobs.badge.verified": "Verificado pela comunidade",
  "jobs.badge.location": "Lisboa + remoto",
  "jobs.postCta": "+ Publicar uma vaga",

  "jobs.filter.all": "Todas as vagas",
  "jobs.filter.design": "Design",
  "jobs.filter.tech": "Tecnologia",
  "jobs.filter.arts": "Artes e cultura",
  "jobs.filter.care": "Cuidados",
  "jobs.filter.food": "Restauração",
  "jobs.filter.community": "Comunidade",

  "jobs.card.applyBy": "Candidaturas até {date}",
  "jobs.card.deadlineOpen": "Sem prazo",
  "jobs.card.save": "Guardar",
  "jobs.card.saved": "Guardada",
  "jobs.card.saveAriaLabel": "Guardar {title}",
  "jobs.card.unsaveAriaLabel": "Remover {title} das guardadas",
  "jobs.card.savedToast": "{title} guardada",
  "jobs.card.unsavedToast": "{title} removida das guardadas",
  "jobs.card.applyCta": "Candidatar →",
  "jobs.card.applyAriaLabel": "Candidatar a {title}",

  "jobs.safetyBanner.text":
    "Ajustado ao teu perfil de trabalho — a mostrar <strong>empresas verificadas como seguras</strong>.",
  "jobs.safetyBanner.link": "Alterar no teu perfil de trabalho",
  "jobs.safetyBanner.showVerified": "Mostrar só verificadas",
  "jobs.safetyBanner.showAll": "Mostrar todas",
  "jobs.safetyBanner.showAllCount": "Mostrar todas (mais {count})",

  "jobs.empty.title": "Nenhuma vaga corresponde neste momento",
  "jobs.empty.verifiedDescription":
    "Ainda não há nada verificado como seguro nesta categoria. Mostra todas as vagas ou escolhe outra categoria.",
  "jobs.empty.description":
    "Sem vagas nesta categoria de momento. Vê todas as vagas ou volta em breve — há anúncios novos todas as semanas.",
  "jobs.empty.showAll": "Mostrar todas as vagas",
  "jobs.empty.clearCategory": "Limpar categoria",

  "jobs.employers.title": "Empresas queer <em>em que confiamos</em>",
  "jobs.employers.subtitle":
    "Estas organizações são geridas por ou para a comunidade queer. Trabalhar aqui significa que o teu dinheiro fica na rede.",

  // ── Distintivos de segurança (vocabulário partilhado) ──────────────────
  "safetyBadge.verified.label": "Verificada como segura",
  "safetyBadge.verified.blurb":
    "Conquistado, não reclamado. Confirmamos as políticas inclusivas no papel e cruzamos com pelo menos três avaliações anónimas de pessoas LGBTQ+ que ali trabalham ou trabalharam. Reavaliado todos os anos.",
  "safetyBadge.trans.label": "Amiga de pessoas trans",
  "safetyBadge.trans.blurb":
    "Prática documentada de inclusão trans: cuidados de saúde de afirmação de género no plano, um processo de mudança de nome e pronomes, e instalações neutras quanto ao género — confirmado por avaliações de quem lá trabalha.",
  "safetyBadge.out.label": "Seguro para te assumires",
  "safetyBadge.out.blurb":
    "A comunidade avalia esta empresa com 8+/10 em \"seguro para te assumires no trabalho\" — ser aberte sobre quem és aqui é um não-acontecimento, não um risco.",
  "safetyBadge.affiliation.run.label": "Gerida por pessoas queer",
  "safetyBadge.affiliation.run.blurb":
    "Liderada ou detida por pessoas queer — decisões, cultura e dinheiro ficam dentro da comunidade. Verificado durante a validação, não auto-declarado.",
  "safetyBadge.affiliation.friendly.label": "Amiga da comunidade queer",
  "safetyBadge.affiliation.friendly.blurb":
    "Uma empresa acolhedora, com políticas inclusivas e uma presença LGBTQ+ real — mas não liderada por pessoas queer. Bem-vinda, apenas não é detida pela comunidade.",

  // ── jobs.adapters.ts (chrome composto em modo live) ────────────────────
  // O adaptador live tem de emitir chaves, nunca inglês composto, para que
  // demo e live mostrem a mesma frase traduzida.
  "jobs.pay.barterOrDiscuss": "Troca / a combinar",
  "jobs.pay.competitive": "Competitivo",
  "jobs.pay.openToBarter": "Aberto a troca",
  "jobs.pay.toDiscuss": "A combinar",
  "jobs.posted.on": "Publicada a {date}",
  "jobs.posted.recently": "Publicada recentemente",
  "jobs.qrLabel.inclusive": "Inclusiva",

  // ── JobDetailPage (+ cabeçalho / corpo / barra lateral) ────────────────
  "jobDetail.breadcrumb.jobs": "Vagas",
  "jobDetail.saveTitle": "Guardar anúncio",
  "jobDetail.savedToast": "Anúncio guardado no teu perfil.",
  "jobDetail.unsavedToast": "Anúncio removido das guardadas.",
  "jobDetail.chip.applyBy": "Candidaturas até {date}",

  "jobDetail.section.about": "Sobre a vaga",
  "jobDetail.section.dayToDay": "No dia a dia",
  "jobDetail.section.lookingFor": "O que procuramos",
  "jobDetail.section.offer": "O que oferecemos",
  "jobDetail.section.aboutCompany": "Sobre {company}",
  "jobDetail.section.viewCompany": "Ver perfil da empresa →",
  "jobDetail.section.safety": "Segurança",
  "jobDetail.section.safetyBody":
    "Como {company} é avaliada pela comunidade nas coisas que importam a profissionais queer.",
  "jobDetail.section.safetyReviews": "Ver avaliações de segurança →",

  "jobDetail.sidebar.salary": "Salário",
  "jobDetail.sidebar.type": "Tipo",
  "jobDetail.sidebar.location": "Localização",
  "jobDetail.sidebar.category": "Categoria",
  "jobDetail.sidebar.deadline": "Prazo",
  "jobDetail.sidebar.applyCta": "Candidatar agora →",
};
