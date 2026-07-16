import type { Catalog } from "../../types";

/**
 * Homepage — pt-PT inclusivo. Mesmas chaves que `en/homepage.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *a comunidade*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Formas neutras (*bem-vinde*-style) só no discurso direto à pessoa
 *   (newsletter, saudações) — nunca como neutro por omissão masculino.
 * - Nomes próprios (QueerPulse, Cinema, Studio, bairros de Lisboa) mantêm-se.
 * - Conteúdo fictício de pessoas/comunidades (nomes, bios, citações, títulos
 *   de publicações no quadro) NÃO é traduzido — em modo live vem da API como
 *   texto de quem o escreveu.
 */
export const homepage: Catalog = {
  // ── Meta da página ─────────────────────────────────────────────────────────
  "meta.title": "QueerPulse — a comunidade queer de Lisboa, online e na vida real",
  "meta.description":
    "Uma rede só por convite para pessoas LGBTQ+ em Lisboa — encontros, comunidades, trocas de saberes e apoio, construídos por quem usa a plataforma, para quem a usa.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Ao vivo em Lisboa",
  "hero.title": "A tua gente, <em>aqui mesmo em Lisboa.</em>",
  "hero.sub":
    "A QueerPulse é uma rede só por convite para a comunidade LGBTQ+ de Lisboa — encontros reais, apoio real, pessoas reais. Sem swipes, sem mensagens às cegas.",
  "hero.requestInviteCta": "Pedir um convite",
  "hero.exploreMembersCta": "Explorar pessoas",
  "hero.note": "Todas as semanas entram pessoas novas, sempre com aval.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "O nosso manifesto",
  "manifesto.lead":
    "Uma plataforma de comunidade, construída <em>como devia ter sido desde o início.</em>",
  "manifesto.body1":
    "A QueerPulse existe porque já não aguentávamos plataformas que tratam pessoas queer como um segmento de mercado em vez de uma comunidade. Cada funcionalidade aqui nasceu porque alguém precisava dela.",
  "manifesto.body2":
    "A adesão é só por convite e por aval — não porque não confiamos em ti, mas porque a confiança é o ponto todo. Todas as pessoas nesta sala escolheram estar aqui, umas pelas outras.",
  "manifesto.safetyCta": "Como mantemos isto seguro",
  "manifesto.assurance.vouched.title": "Convite ou aval",
  "manifesto.assurance.vouched.description":
    "Cada pessoa entra através de um aval ou de um pedido de convite analisado — nunca por inscrição aberta.",
  "manifesto.assurance.encrypted.title": "Encriptação de ponta a ponta",
  "manifesto.assurance.encrypted.description":
    "As mensagens diretas são encriptadas — as conversas privadas mantêm-se privadas.",
  "manifesto.assurance.privacy.title": "Tu decides o que é visível",
  "manifesto.assurance.privacy.description":
    "Define o teu perfil, fotografias e atividade como públicos, só para a comunidade, ou só para ti.",
  "manifesto.assurance.moderation.title": "Moderação 24 horas por dia",
  "manifesto.assurance.moderation.description":
    "As denúncias têm resposta real, normalmente em poucas horas — não em dias.",
  "manifesto.assurance.quickExit.title": "Saída rápida, num toque",
  "manifesto.assurance.quickExit.description":
    "Sai de qualquer página no instante em que alguém olhar por cima do teu ombro.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────
  "trustStrip.vouched": "Só por convite e aval",
  "trustStrip.encrypted": "Encriptação de ponta a ponta",
  "trustStrip.moderation": "Moderação ativa",
  "trustStrip.blockMuteReport": "Bloquear, silenciar, denunciar",
  "trustStrip.privacyControls": "Controlos de privacidade detalhados",
  "trustStrip.reportCta": "Lê a nossa política de segurança",

  // ── PainPoints ("porque construímos isto") ──────────────────────────────────
  "painPoints.eyebrow": "Porque construímos isto",
  "painPoints.title": "Construímos isto porque <em>também precisávamos dele.</em>",
  "painPoints.sub":
    "Cada funcionalidade começou por ser algo que gostávamos que já existisse.",

  "painPoints.hero1.eyebrow": "A primeira falha que sentimos",
  "painPoints.hero1.question": "\"Onde é que eu conheço pessoas que percebem isto?\"",
  "painPoints.hero1.heading": "Por isso construímos <em>a rede.</em>",
  "painPoints.hero1.body":
    "Cada pessoa aqui é avalizada por alguém que já está dentro — sem swipes, sem mensagens às cegas, sem teres de provar que pertences aqui.",
  "painPoints.hero1.builtLabel": "Construímos a rede de avales",
  "painPoints.hero1.cta": "Conhecer a comunidade",

  "painPoints.marker1": "Depois de entrares na sala, abrem-se mais portas.",

  "painPoints.exchange1.question": "\"Preciso de um favor, mas não sei a quem pedir.\"",
  "painPoints.exchange1.heading": "Por isso construímos <em>o quadro.</em>",
  "painPoints.exchange1.body":
    "Publica o que precisas ou o que podes oferecer — de um quarto livre a uma tradução no próprio dia — e deixa a comunidade responder.",
  "painPoints.exchange1.cta": "Ver o quadro",

  "painPoints.exchange2.question": "\"Quero gastar o meu dinheiro com pessoas como eu.\"",
  "painPoints.exchange2.heading": "Por isso construímos <em>o diretório.</em>",
  "painPoints.exchange2.body":
    "Lojas, ateliês e serviços de pessoas queer por toda a Lisboa — fáceis de encontrar, fáceis de apoiar.",
  "painPoints.exchange2.cta": "Ver o diretório",

  "painPoints.exchange3.question": "\"Quero organizar um encontro, só não sei como.\"",
  "painPoints.exchange3.heading": "Por isso construímos <em>um guia para organizar.</em>",
  "painPoints.exchange3.body":
    "Um guia passo a passo para organizares o teu primeiro jantar comunitário, oficina ou sessão de cinema — com o apoio da comunidade.",
  "painPoints.exchange3.cta": "Começar a organizar",

  "painPoints.exchange4.question":
    "\"Tenho um saber para ensinar — e outro que quero aprender.\"",
  "painPoints.exchange4.heading": "Por isso construímos <em>as trocas de saberes.</em>",
  "painPoints.exchange4.body":
    "Troca o que sabes pelo que precisas. Sem faturas, sem algoritmo — só pessoas a ensinarem-se umas às outras.",
  "painPoints.exchange4.cta": "Explorar trocas de saberes",

  "painPoints.hero2.eyebrow": "A falha mais difícil de sentir",
  "painPoints.hero2.question": "\"O que acontece se algo correr mal?\"",
  "painPoints.hero2.heading": "Por isso construímos <em>uma rede de segurança.</em>",
  "painPoints.hero2.body":
    "Terapeutas que percebem, apoio entre pares sem julgamentos, e linhas de crise que atendem — tudo analisado pela comunidade que precisa disto.",
  "painPoints.hero2.builtLabel": "Construímos o centro de bem-estar",
  "painPoints.hero2.cta": "Ver recursos de bem-estar",

  "painPoints.marker2": "E para lá da sala, as perguntas mais difíceis.",

  "painPoints.exchange5.question":
    "\"Quero fazer alguma coisa, não só publicar sobre isso.\"",
  "painPoints.exchange5.heading": "Por isso construímos <em>uma forma de agir.</em>",
  "painPoints.exchange5.body":
    "Campanhas locais, entreajuda e organização — formas reais de mover alguma coisa, em conjunto.",
  "painPoints.exchange5.cta": "Ver o que está em movimento",

  "painPoints.exchange6.question": "\"Conheço mesmo os meus direitos aqui?\"",
  "painPoints.exchange6.heading": "Por isso construímos <em>guias em linguagem simples.</em>",
  "painPoints.exchange6.body":
    "Informação legal sobre a vida LGBTQ+ em Portugal, escrita em linguagem simples — sem precisares de um curso de Direito.",
  "painPoints.exchange6.cta": "Ler os guias",

  "painPoints.exchange7.question": "\"Vou estar mesmo em segurança neste trabalho?\"",
  "painPoints.exchange7.heading": "Por isso construímos <em>as avaliações de empregadores.</em>",
  "painPoints.exchange7.body":
    "Avaliações honestas de pessoas queer que já lá trabalharam, para saberes antes de aceitares a proposta.",
  "painPoints.exchange7.cta": "Ler avaliações de empregadores",

  // ── Discovery (destaque de pessoas) ───────────────────────────────────────
  "discovery.eyebrow": "Mais de {count} pessoas — e a crescer",
  "discovery.title": "Pessoas reais, <em>não um diretório.</em>",
  "discovery.sub":
    "Cada perfil aqui pertence a uma pessoa real e avalizada da comunidade queer de Lisboa — não uma fotografia de stock, não um bot.",
  "discovery.exploreMembersCta": "Explorar pessoas",
  "discovery.footNote": "Todas as semanas chegam caras novas.",
  "discovery.verifiedBadge": "Verificação",
  "discovery.featuredMember": "Pessoa em destaque",
  "discovery.vouchedBy": "Com aval de {name}",
  "discovery.viewProfile": "Ver perfil",
  "discovery.sayHello": "Diz olá",
  "discovery.featuredMembersAria": "Pessoas em destaque",
  "discovery.featureMemberAria": "Mostrar {name}",

  // ── Gatherings (destaque na homepage) ─────────────────────────────────────
  "gatherings.title": "Encontra-te em <em>salas reais.</em>",
  "gatherings.subtitle":
    "Jantares, oficinas, sessões de cinema e caminhadas — encontros reais a acontecer por Lisboa este mês.",
  "gatherings.spots.seatsLeft": "lugares restantes",
  "gatherings.spots.spotsLeft": "vagas restantes",
  "gatherings.spots.going": "pessoas vão",
  "gatherings.spots.casual": "Informal",
  "gatherings.cta.reserveSeat": "Reservar lugar",
  "gatherings.cta.illBeThere": "Eu vou",
  "gatherings.cta.requestSpot": "Pedir uma vaga",
  "gatherings.cta.rsvp": "Confirmar presença",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Contado <em>com as nossas palavras.</em>",
  "stories.subtitle":
    "Ensaios, perfis e reportagens de dentro da comunidade — sem olhar de fora, sem termos de nos explicar.",
  "stories.imagePlaceholder": "imagem da história",

  // ── Media (Cinema + Studio) ────────────────────────────────────────────────
  "media.title": "<em>Vê. Ouve.</em> Feito por nós.",
  "media.subtitle":
    "QueerPulse Cinema e Studio — uma casa para o cinema e a música queer, feita por e para a comunidade.",
  "media.cinema.eyebrow": "Cinema",
  "media.cinema.title": "Cinema queer, <em>sem cortes.</em>",
  "media.cinema.desc":
    "Vê curtas e longas feitas por pessoas da comunidade, vai a sessões comunitárias, e submete o teu próprio trabalho.",
  "media.cinema.chip.stream": "Streaming",
  "media.cinema.chip.screenings": "Sessões",
  "media.cinema.chip.submit": "Submeter",
  "media.cinema.cta": "Entrar no Cinema",
  "media.studio.eyebrow": "Studio",
  "media.studio.title": "Som queer, <em>em voz alta.</em>",
  "media.studio.desc":
    "Lança a tua música, sintoniza sessões ao vivo, e descobre artistas da comunidade.",
  "media.studio.chip.listen": "Ouvir",
  "media.studio.chip.release": "Lançar",
  "media.studio.chip.liveSessions": "Sessões ao vivo",
  "media.studio.cta": "Entrar no Studio",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Agentes de mudança",
  "changeMakers.title": "A construir a <em>Lisboa que queremos.</em>",
  "changeMakers.sub":
    "Pessoas organizadoras, ativistas e gente do dia a dia a impulsionar esta cidade.",
  "changeMakers.cta": "Conhecer os agentes de mudança",
  "changeMakers.portraitPlaceholder": "retrato de {name}",

  // ── Wellbeing ──────────────────────────────────────────────────────────────
  "wellbeing.title": "Apoio que <em>percebe mesmo.</em>",
  "wellbeing.subtitle":
    "Saúde mental, apoio entre pares e recursos de crise — tudo analisado pela comunidade que precisa disto.",
  "wellbeing.allResourcesCta": "Ver todos os recursos de bem-estar",
  "wellbeing.therapists.title": "Encontra apoio terapêutico",
  "wellbeing.therapists.description":
    "Profissionais de saúde mental afirmativos e avaliados pela comunidade, por toda a Lisboa.",
  "wellbeing.therapists.cta": "Encontrar apoio terapêutico",
  "wellbeing.peerSupport.title": "Círculos de apoio entre pares",
  "wellbeing.peerSupport.description":
    "Grupos com facilitação, onde não precisas de explicar o básico primeiro.",
  "wellbeing.peerSupport.cta": "Juntar-te a um círculo",
  "wellbeing.crisis.title": "Linhas de crise",
  "wellbeing.crisis.description": "Alguém para ligares, de dia ou de noite, quando as coisas pesam.",
  "wellbeing.crisis.cta": "Pedir ajuda agora",
  "wellbeing.legal.title": "Conhece os teus direitos",
  "wellbeing.legal.description":
    "Guias jurídicos em linguagem simples para a vida LGBTQ+ em Portugal.",
  "wellbeing.legal.cta": "Ler os guias",
  "wellbeing.employerReviews.title": "Avaliações de empregadores",
  "wellbeing.employerReviews.description":
    "Avaliações reais de pessoas queer que já trabalharam lá — sabe antes de te candidatares.",
  "wellbeing.employerReviews.cta": "Ver avaliações",
  "wellbeing.harmReduction.title": "Redução de danos",
  "wellbeing.harmReduction.description":
    "Orientação honesta e sem julgamentos — sem sermões, sem vergonha.",
  "wellbeing.harmReduction.cta": "Ver o guia",

  // ── Communities (variante G — destaque + índice) ───────────────────────────
  "communities.eyebrow": "Comunidades · Lisboa",
  "communities.title": "Entra, <em>sala a sala.</em>",
  "communities.sub":
    "Pesquisa ou filtra a lista e depois abre qualquer comunidade para veres a sala toda — o que é, o que faz, quem está lá dentro, e o que desbloqueias ao entrar.",
  "communities.browseAllCta": "Ver todas as comunidades",
  "communities.resultCount.all": "<b>{count}</b> comunidades",
  "communities.resultCount.shown": "<b>{count}</b> de {total} comunidades",

  "communities.toolbar.searchPlaceholder": "Pesquisar comunidades…",
  "communities.toolbar.searchAriaLabel": "Pesquisar comunidades",
  "communities.toolbar.langAriaLabel": "Filtrar por idioma",
  "communities.toolbar.langAllOption": "Todos os idiomas",
  "communities.toolbar.hoodAriaLabel": "Filtrar por bairro",
  "communities.toolbar.hoodAllOption": "Todas as zonas",
  "communities.toolbar.sortLabel": "Ordenar",
  "communities.toolbar.sortAriaLabel": "Ordenar comunidades",
  "communities.toolbar.sort.active": "Mais ativas",
  "communities.toolbar.sort.size": "Maiores",
  "communities.toolbar.sort.new": "Mais recentes",
  "communities.toolbar.sort.near": "Mais próximas",

  "communities.category.all": "Todas",
  "communities.category.social": "Social",
  "communities.category.arts": "Artes",
  "communities.category.support": "Apoio",
  "communities.category.activism": "Ativismo",

  "communities.access.open": "Adesão aberta",
  "communities.access.request": "Adesão por pedido",
  "communities.access.private": "Privada",

  "communities.rail.showingCount": "A mostrar · {count}",
  "communities.rail.noMatches": "Sem resultados",
  "communities.rail.emptyTitle": "Nenhuma comunidade corresponde.",
  "communities.rail.emptyBody": "Alarga o filtro ou limpa a tua pesquisa.",
  "communities.rail.privateNoHeadcount": "Privada — sem contagem de pessoas",
  "communities.clearFiltersCta": "Limpar filtros",

  "communities.spotlight.emptyTitle": "Ainda não há nada aqui.",
  "communities.spotlight.emptyBody":
    "Nenhuma comunidade corresponde a estes filtros. Alarga a pesquisa, ou começa a que está a faltar.",
  "communities.spotlight.startCommunityCta": "Começar uma comunidade",
  "communities.spotlight.quiet.membersOnlyPrivate": "Só para a comunidade · privada",
  "communities.spotlight.quiet.discreetSafe": "Discreta e segura · sem contagem de pessoas",
  "communities.spotlight.quiet.enterCta": "Entrar",
  "communities.spotlight.whatHappensHere": "O que acontece aqui",
  "communities.spotlight.whatYouGet": "O que ganhas ao entrar",
  "communities.spotlight.keptBy": "Mantida por <b>{name}</b> e {extra}",
  "communities.spotlight.sinceLabel": "Desde {year}",
  "communities.spotlight.peekInsideCta": "Espreitar lá dentro",
  "communities.spotlight.joinCta": "Juntar-te",

  "communities.room.pulse": "o feed ao vivo",
  "communities.room.discussions": "conversas",
  "communities.room.events": "encontros e confirmações",
  "communities.room.resources": "guias e biblioteca",

  // ── MicroGrants ────────────────────────────────────────────────────────────
  "microGrants.title": "Pequenos fundos, <em>diferença real.</em>",
  "microGrants.subtitle":
    "Microbolsas financiadas pela comunidade, a cobrir os custos que mantêm pessoas e projetos a avançar.",
  "microGrants.seeFundCta": "Ver o fundo",
  "microGrants.applyCta": "Candidatar-te a uma bolsa",
  "microGrants.contributeCta": "Contribuir para o fundo",
  "microGrants.stat.contributed": "Contribuído por pessoas da comunidade",
  "microGrants.stat.grantsAwarded": "Bolsas atribuídas",
  "microGrants.stat.averageAmount": "Bolsa média",

  // ── Board (quadro de favores) ──────────────────────────────────────────────
  "board.title": "Pede ajuda, <em>oferece a tua.</em>",
  "board.subtitle":
    "Um quadro de favores da comunidade — publica o que precisas ou o que podes dar.",
  "board.postSomethingCta": "Publicar algo",
  "board.kind.lookingFor": "Precisa de",
  "board.kind.offering": "Oferece",
  "board.filter.all": "Todos",
  "board.filter.asking": "A pedir",
  "board.filter.offering": "A oferecer",
  "board.filter.design": "Design",
  "board.filter.tech": "Tecnologia",
  "board.filter.space": "Espaço",
  "board.filter.care": "Cuidado",
  "board.empty.title": "Ainda não há nada aqui",
  "board.empty.description":
    "Nenhuma publicação corresponde a este filtro agora. Experimenta outra categoria, ou sê a primeira pessoa a publicar.",
  "board.empty.clearFilters": "Limpar filtros",

  // ── Barter ─────────────────────────────────────────────────────────────────
  "barter.title": "Troca saberes, <em>não faturas.</em>",
  "barter.subtitle":
    "Pessoas da comunidade a trocar aquilo em que são boas pelo que precisam — sem dinheiro a mudar de mãos.",
  "barter.browseAllCta": "Ver todas as trocas",
  "barter.offeringLabel": "Oferece",
  "barter.inExchangeFor": "em troca de",
  "barter.wantingLabel": "Procura",

  // ── SkillsTeaser ───────────────────────────────────────────────────────────
  "skillsTeaser.title": "Ensina uma coisa, <em>aprende outra.</em>",
  "skillsTeaser.subtitle":
    "Uma troca contínua de saberes que as pessoas da comunidade ensinam e aprendem umas com as outras.",
  "skillsTeaser.browseAllCta": "Ver todos os saberes",
  "skillsTeaser.teachingLabel": "A ensinar",
  "skillsTeaser.learningLabel": "A aprender",

  // ── Library ────────────────────────────────────────────────────────────────
  "library.title": "O conhecimento <em>não desaparece.</em>",
  "library.subtitle":
    "Gravações, guias e notas de cada encontro — pesquisáveis e preservados. O saber das oficinas que sobrevive à sala.",
  "library.browseCta": "Ver a biblioteca →",
  "library.type.recording": "Gravação",
  "library.type.guide": "Guia",
  "library.type.notes": "Notas de encontro",
  "library.moreLabel": "no arquivo →",

  // ── Partners ───────────────────────────────────────────────────────────────
  "partners.title": "A comunidade é mais forte quando <em>as comunidades se ligam.</em>",
  "partners.subtitle":
    "Trabalhamos com organizações que partilham os nossos valores — em Portugal e além.",
  "partners.seeAllLabel": "Ver todas as parcerias",
  "partners.moreCount": "{count} comunidades",

  // ── SpacesMap ──────────────────────────────────────────────────────────────
  "spacesMap.title": "Encontra os teus <em>espaços na cidade.</em>",
  "spacesMap.subtitle":
    "Locais queer-seguros com curadoria da comunidade, ateliês de pessoas da comunidade e espaços de encontro por Lisboa. Não é um diretório de negócios — isto é nosso.",
  "spacesMap.openFullMapCta": "Abrir mapa completo →",
  "spacesMap.type.all": "Todos os espaços",
  "spacesMap.type.venue": "Locais seguros",
  "spacesMap.type.studio": "Ateliês de pessoas da comunidade",
  "spacesMap.type.community": "Espaços comunitários",
  "spacesMap.type.org": "Organizações",
  "spacesMap.countLabel": "{count} espaços · com curadoria da comunidade",

  // ── Platforms ──────────────────────────────────────────────────────────────
  "platforms.title": "O ecossistema <em>queer mais alargado</em>",
  "platforms.subtitle":
    "Outras plataformas, media e comunidades LGBTQ+ que vale a pena conhecer — para lá da QueerPulse.",
  "platforms.seeAllCta": "Ver todas as plataformas →",
  "platforms.moreCount": "mais {count}",
  "platforms.browseAllCta": "Ver tudo →",

  // ── Newsletter ─────────────────────────────────────────────────────────────
  "newsletter.title": "Mantém-te ligade. <em>Semanal, não diário.</em>",
  "newsletter.subtitle":
    "O resumo semanal da QueerPulse chega toda a quinta-feira — pessoas novas para conheceres, encontros a chegar, trocas de saberes abertas e um texto que vale o teu tempo. Sem ruído.",
  "newsletter.emailRequiredToast": "Introduz o teu email",
  "newsletter.subscribedToast": "Estás na lista — até quinta-feira",
  "newsletter.success.title": "Estás na lista, <em>quase.</em>",
  "newsletter.success.body":
    "Vamos começar a enviar o <strong>resumo semanal</strong> para <strong>{email}</strong> todas as quintas-feiras.",
  "newsletter.success.checkInboxNote":
    "Verifica a tua caixa de entrada para confirmares a subscrição — o link expira em 48 horas.",
  "newsletter.success.useDifferentEmailCta": "Usar outro email",
  "newsletter.emailPlaceholder": "oteu@email.com",
  "newsletter.subscribeCta": "Subscrever",
  "newsletter.note": "Só para a comunidade · sem spam · cancela quando quiseres",

  // ── Pillars ("um mundo, não uma lista de funcionalidades") ─────────────────
  "pillars.eyebrow": "Uma adesão · seis mundos",
  "pillars.title": "Um mundo, não uma <em>lista de funcionalidades.</em>",
  "pillars.sub":
    "Seis pilares da vida profissional queer em Lisboa — cada um construído por e para a comunidade, não acrescentado depois.",

  "pillars.community.name": "Comunidade",
  "pillars.community.desc":
    "Encontros, grupos, fórum e ligações — o tecido social da Lisboa queer, online e presencial.",
  "pillars.community.featured":
    "O tecido social da Lisboa queer — uma sala com a porta aberta, online e presencial.",
  "pillars.community.alt":
    "Pessoas a celebrar à volta de um táxi pintado com as cores do arco-íris numa marcha do Orgulho",
  "pillars.culture.name": "Cultura",
  "pillars.culture.desc":
    "A revista, histórias, grupos de leitura e biblioteca — um registo vivo da Lisboa queer, escrito de dentro.",
  "pillars.culture.alt":
    "Artistas de drag a percorrer o trajeto de uma marcha do Orgulho, de dia",
  "pillars.livelihood.name": "Sustento",
  "pillars.livelihood.desc":
    "Vagas, trocas de saberes, microbolsas e trocas diretas — uma economia queer construída sobre confiança, não sobre comissões de plataforma.",
  "pillars.livelihood.alt":
    "Duas pessoas a planear trabalho juntas com portáteis e cadernos",
  "pillars.wellbeing.name": "Bem-estar",
  "pillars.wellbeing.desc":
    "Saúde mental, saúde sexual, cuidados de saúde para pessoas trans — profissionais afirmativos, avaliados pela comunidade.",
  "pillars.wellbeing.alt": "Dois homens a partilhar um beijo terno",
  "pillars.safety.name": "Segurança",
  "pillars.safety.desc":
    "Guias jurídicos, denúncia de crimes de ódio, redução de danos e contactos de emergência — conhece os teus direitos.",
  "pillars.safety.alt":
    "Manifestantes a segurar cartazes com a frase os direitos trans são direitos humanos",
  "pillars.activism.name": "Ativismo",
  "pillars.activism.desc":
    "Agentes de mudança, voluntariado e governança transparente — a construir uma cidade melhor, de dentro para fora.",
  "pillars.activism.alt":
    "Manifestantes a transportar uma grande faixa com a bandeira trans por uma rua da cidade",

  "pillars.tag.gatherings": "Encontros",
  "pillars.tag.forum": "Fórum",
  "pillars.tag.communities": "Comunidades",
  "pillars.tag.magazine": "Revista",
  "pillars.tag.stories": "Histórias",
  "pillars.tag.library": "Biblioteca",
  "pillars.tag.jobs": "Vagas",
  "pillars.tag.skills": "Competências",
  "pillars.tag.microGrants": "Microbolsas",
  "pillars.tag.mentalHealth": "Saúde mental",
  "pillars.tag.transHub": "Hub trans",
  "pillars.tag.sexualHealth": "Saúde sexual",
  "pillars.tag.legal": "Jurídico",
  "pillars.tag.rights": "Direitos",
  "pillars.tag.emergency": "Emergência",
  "pillars.tag.changemakers": "Agentes de mudança",
  "pillars.tag.volunteer": "Voluntariado",
  "pillars.tag.governance": "Governança",

  // ── Outro (chamada final) ──────────────────────────────────────────────────
  "outro.title": "Entra numa sala onde <em>já pertences.</em>",
  "outro.sub":
    "A adesão é por convite e mantida pequena de propósito. Se alguém em quem confias já está cá, pede-lhe um aval.",
  "outro.cta": "Pedir um convite",
};
