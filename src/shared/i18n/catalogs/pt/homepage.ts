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
  "meta.title": "QueerPulse: uma rede queer, com raízes em Lisboa",
  "meta.description":
    "Um lugar para descobrires o que se passa na comunidade queer de Lisboa e encontrares as pessoas, comunidades, eventos e oportunidades que dão forma à vida queer na cidade.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Ao vivo em Lisboa",
  "hero.title": "Uma rede queer, <em>com raízes em Lisboa.</em>",
  "hero.sub":
    "Um lugar para descobrires o que se passa na comunidade queer de Lisboa e encontrares as pessoas, comunidades, eventos e oportunidades que dão forma à vida queer na cidade.",
  "hero.requestInviteCta": "Pedir um convite",
  "hero.exploreMembersCta": "Explorar pessoas",
  "hero.note":
    "Todas as semanas entram pessoas novas, sempre com um voto de confiança.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "O nosso manifesto",
  "manifesto.lead":
    "Uma plataforma de comunidade construída à volta <em>daquilo de que as pessoas queer realmente precisam.</em>",
  "manifesto.body1":
    "A QueerPulse existe porque já não aguentávamos plataformas que tratam pessoas queer como um segmento de mercado em vez de uma comunidade. Cada funcionalidade aqui nasce de uma necessidade real, de uma frustração, ou de algo que gostávamos que já existisse.",
  "manifesto.body2":
    "Acreditamos que a comunidade funciona de outra forma quando há confiança por trás. Quando sabes com quem estás a ligar-te, quando tens controlo sobre o que partilhas, e quando há pessoas a zelar pelos espaços que usas.",
  "manifesto.body3":
    "É por isso que a QueerPulse é só por convite, que as pessoas têm voto de confiança, e que a segurança e a privacidade fazem parte da base da plataforma.",
  "manifesto.body4":
    "A libertação queer é indivisível de todas as outras lutas por segurança e autodeterminação, incluindo a libertação da Palestina. <a>Onde nos posicionamos</a>.",
  "manifesto.highlight":
    "Estamos a construir um lugar onde ser queer é o ponto de partida para uma ligação verdadeira.",
  "manifesto.safetyCta": "Como mantemos isto seguro",
  "manifesto.assurance.vouched.title": "Convite ou voto de confiança",
  "manifesto.assurance.vouched.description":
    "Cada pessoa entra através de uma ligação de confiança ou de um pedido de convite analisado, ajudando-nos a construir uma comunidade onde há sempre uma razão para se estar.",
  "manifesto.assurance.safeSpaces.title": "Espaços seguros onde já estivemos",
  "manifesto.assurance.safeSpaces.description":
    "A nossa equipa visita os locais em pessoa e mantém a informação atualizada, para poderes descobrir sítios que a comunidade já foi mesmo conferir.",
  "manifesto.assurance.encrypted.title": "Encriptação de ponta a ponta",
  "manifesto.assurance.encrypted.description":
    "As tuas conversas diretas são encriptadas, mantendo as mensagens privadas só entre quem elas são para.",
  "manifesto.assurance.privacy.title": "Tu decides o que é visível",
  "manifesto.assurance.privacy.description":
    "Escolhe o que partilhas e quem pode ver. O teu perfil, fotografias e atividade podem ser públicos, só para a comunidade, ou privados.",
  "manifesto.assurance.moderation.title": "Moderação 24 horas por dia",
  "manifesto.assurance.moderation.description":
    "Quando algo corre mal, não devias ter de gritar para o vazio. As denúncias são revistas por pessoas reais e respondidas o mais depressa possível.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────
  "trustStrip.vouched": "Só por convite e voto de confiança",
  "trustStrip.encrypted": "Encriptação de ponta a ponta",
  "trustStrip.moderation": "Moderação ativa",
  "trustStrip.blockMuteReport": "Bloquear, silenciar, denunciar",
  "trustStrip.privacyControls": "Controlos de privacidade detalhados",
  "trustStrip.reportCta": "Lê a nossa política de segurança",

  // ── PainPoints ("porque construímos isto") ──────────────────────────────────
  "painPoints.eyebrow": "Porque construímos isto",
  "painPoints.title":
    "Construímos <em>a comunidade que queríamos encontrar.</em>",
  "painPoints.sub":
    "A vida queer em Lisboa está cheia de pessoas a fazer coisas incríveis, mas encontrar o teu caminho até essa comunidade ainda pode ser mais difícil do que devia. As pessoas certas, os espaços, as oportunidades, os recursos e o apoio estão muitas vezes espalhados por sítios diferentes.",
  "painPoints.sub2":
    "A QueerPulse aproxima tudo isto, tornando mais fácil descobrir o que existe, encontrar onde pertences e transformar uma ligação em algo real.",

  "painPoints.hero1.eyebrow": "A primeira falha que sentimos",
  "painPoints.hero1.question":
    '"Onde é que eu conheço pessoas que percebem isto?"',
  "painPoints.hero1.heading": "Por isso construímos <em>uma rede.</em>",
  "painPoints.hero1.body":
    "Cada pessoa tem o voto de confiança de alguém que já está dentro, criando uma comunidade onde conheces pessoas através de confiança e ligações partilhadas.",
  "painPoints.hero1.builtLabel": "Construímos a rede de votos de confiança",
  "painPoints.hero1.cta": "Conhecer a comunidade",

  "painPoints.marker1": "Depois de entrares na sala, abrem-se mais portas.",

  "painPoints.exchange1.question":
    '"Preciso de um favor, mas não sei a quem pedir."',
  "painPoints.exchange1.heading":
    "Por isso construímos <em>um quadro comunitário.</em>",
  "painPoints.exchange1.body":
    "Pede o que precisas ou oferece o que podes dar, e dá às pessoas uma forma de se ajudarem no dia a dia.",
  "painPoints.exchange1.cta": "Ver o quadro",

  "painPoints.exchange2.question":
    '"Quero gastar o meu dinheiro com pessoas como eu."',
  "painPoints.exchange2.heading":
    "Por isso construímos <em>um diretório de negócios queer.</em>",
  "painPoints.exchange2.body":
    "Descobre negócios queer e serviços acolhedores por toda a Lisboa, tudo num só lugar.",
  "painPoints.exchange2.cta": "Ver o diretório",

  "painPoints.exchange3.question":
    '"Quero organizar um convívio, só não sei por onde começar."',
  "painPoints.exchange3.heading":
    "Por isso construímos <em>um guia para organizar.</em>",
  "painPoints.exchange3.body":
    "Tudo o que precisas para transformar uma ideia num convívio real, com orientação prática e uma comunidade por trás.",
  "painPoints.exchange3.cta": "Começar a organizar",

  "painPoints.exchange4.question":
    '"Tenho algo que posso ensinar, e algo que quero aprender."',
  "painPoints.exchange4.heading":
    "Por isso estamos a construir <em>as trocas de saberes.</em>",
  "painPoints.exchange4.body":
    "Partilha o que sabes, aprende com outra pessoa e cria ligações úteis pelo caminho.",
  "painPoints.exchange4.cta": "Ver no roteiro",

  "painPoints.hero2.eyebrow": "A falha mais difícil de sentir",
  "painPoints.hero2.question": '"E se eu não estiver bem?"',
  "painPoints.hero2.heading":
    "Por isso construímos <em>uma rede de segurança.</em>",
  "painPoints.hero2.body":
    "Encontra terapeutas queer-friendly, apoio entre pares e recursos de confiança quando precisares de um sítio para onde te virar.",
  "painPoints.hero2.builtLabel": "Construímos o centro de bem-estar",
  "painPoints.hero2.cta": "Ver recursos de bem-estar",

  "painPoints.marker2": "E para lá da sala, as perguntas mais difíceis.",

  "painPoints.exchange5.question":
    '"Quero fazer alguma coisa, não só publicar sobre isso."',
  "painPoints.exchange5.heading":
    "Por isso construímos <em>uma forma de agir.</em>",
  "painPoints.exchange5.body":
    "Encontra campanhas locais, iniciativas de entreajuda, oportunidades de voluntariado e formas de transformar cuidado em ação.",
  "painPoints.exchange5.cta": "Participar",

  "painPoints.exchange6.question": '"Conheço mesmo os meus direitos aqui?"',
  "painPoints.exchange6.heading":
    "Por isso construímos <em>guias em linguagem simples.</em>",
  "painPoints.exchange6.body":
    "Informação clara e acessível sobre os direitos LGBTQ+ em Portugal, escrita para a vida real e não para um manual jurídico.",
  "painPoints.exchange6.cta": "Ler os guias",

  "painPoints.exchange7.question":
    '"Vou estar mesmo em segurança neste trabalho?"',
  "painPoints.exchange7.heading":
    "Por isso estamos a construir <em>as avaliações de empregadores.</em>",
  "painPoints.exchange7.body":
    "Experiências honestas de pessoas queer que já lá trabalharam, para te ajudarem a decidir com mais informação onde trabalhar.",
  "painPoints.exchange7.cta": "Ver no roteiro",

  // ── Discovery (destaque de pessoas) ───────────────────────────────────────
  "discovery.eyebrow": "Mais de {count} pessoas, e a crescer",
  "discovery.title": "Os <em>rostos</em> da Lisboa queer",
  "discovery.sub":
    "Explora uma rede diversa de profissionais, criadores, fundadores e dinamizadores comunitários LGBTQ+ a colaborar para transformar ideias em impacto real.",
  "discovery.exploreMembersCta": "Explorar pessoas",
  "discovery.footNote": "Todas as semanas chegam caras novas.",
  "discovery.verifiedBadge": "Verificação",
  "discovery.featuredMember": "Pessoa em destaque",
  "discovery.vouchedBy": "Com voto de confiança de {name}",
  "discovery.viewProfile": "Ver perfil",
  "discovery.sayHello": "Diz olá",
  "membersExplainer.eyebrow": "Só para a comunidade",
  "membersExplainer.title": "A comunidade <em>move</em> a QueerPulse",
  "membersExplainer.titlePlain": "A comunidade move a QueerPulse",
  "membersExplainer.lede":
    "O diretório da comunidade abre-se assim que entras. Eis porque o mantemos assim, e como te juntares.",
  "membersExplainer.pillars.vouched.title":
    "Pessoas reais, com voto de confiança",
  "membersExplainer.pillars.vouched.body":
    "Cada pessoa é convidada e recebe o voto de confiança de alguém que já cá está. Sem bots, sem estranhos a copiar a lista.",
  "membersExplainer.pillars.inside.title": "O melhor abre-se por dentro",
  "membersExplainer.pillars.inside.body":
    "Perfis completos, comunidades e encontros abrem-se no momento em que te juntas.",
  "membersExplainer.pillars.safe.title":
    "Só por convite mantém um espaço seguro",
  "membersExplainer.pillars.safe.body":
    "Manter o diretório só para a comunidade é como quem cá está consegue ser plenamente quem é.",
  "membersExplainer.requestInviteCta": "Pedir um convite",
  "membersExplainer.signInCta": "Já faço parte",
  "discovery.featuredMembersAria": "Pessoas em destaque",
  "discovery.featureMemberAria": "Mostrar {name}",

  // ── Live sections (curadoria da equipa, dados reais) ──────────────────────
  "liveDiscovery.eyebrow": "Escolhido pela nossa equipa",
  "liveCommunities.sub":
    "A QueerPulse reúne as comunidades que moldam o ecossistema LGBTQ+ de Lisboa, tornando mais fácil descobrir, ligar e colaborar.",
  "liveCommunities.memberCount": "{count} membros",

  // ── Gatherings (destaque na homepage) ─────────────────────────────────────
  "gatherings.title": "Encontra-te em <em>salas reais.</em>",
  "gatherings.subtitle":
    "Jantares, oficinas, sessões de cinema e caminhadas: convívios reais a acontecer por Lisboa este mês.",
  "gatherings.spots.seatsLeft": "lugares restantes",
  "gatherings.spots.spotsLeft": "vagas restantes",
  "gatherings.spots.going": "pessoas vão",
  "gatherings.spots.casual": "Informal",
  "gatherings.cta.seeDetails": "Ver detalhes do evento",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Contado <em>com as nossas palavras.</em>",
  "stories.subtitle":
    "Ensaios, perfis e reportagens de dentro da comunidade: sem olhar de fora, sem termos de nos explicar.",
  "stories.imagePlaceholder": "imagem da história",
  // LiveStories.tsx — a mesma secção a partir das peças publicadas na revista.
  "liveStories.byline": "{author} · leitura de {minutes} min",
  "liveStories.issueKicker": "Edição {number}",
  "liveStories.magazineKicker": "Da revista",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Agentes de mudança",
  "changeMakers.title": "A construir a <em>Lisboa que queremos.</em>",
  "changeMakers.sub":
    "Pessoas organizadoras, ativistas e gente do dia a dia a impulsionar esta cidade.",
  "changeMakers.cta": "Conhecer os agentes de mudança",
  "changeMakers.portraitPlaceholder": "retrato de {name}",

  // ── Communities (variante G — destaque + índice) ───────────────────────────
  "communities.eyebrow": "Comunidades · Lisboa",
  "communities.title":
    "A comunidade é mais forte <em>quando se constroem juntas</em>",
  "communities.sub":
    "Pesquisa ou filtra a lista e depois abre qualquer comunidade para veres a sala toda: o que é, o que faz, quem está lá dentro, e o que desbloqueias ao entrar.",
  "communities.howCommunitiesWorkCta": "Como funcionam as comunidades",
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
  "communities.category.sports": "Desporto",
  "communities.category.professional": "Profissional",

  "communities.access.open": "Adesão aberta",
  "communities.access.request": "Adesão por pedido",
  "communities.access.invite": "Só por convite",
  "communities.access.private": "Privada",

  "communities.rail.showingCount": "A mostrar · {count}",
  "communities.rail.noMatches": "Sem resultados",
  "communities.rail.emptyTitle": "Nenhuma comunidade corresponde.",
  "communities.rail.emptyBody": "Alarga o filtro ou limpa a tua pesquisa.",
  "communities.rail.privateNoHeadcount": "Privada: sem contagem de pessoas",
  "communities.clearFiltersCta": "Limpar filtros",

  "communities.spotlight.emptyTitle": "Ainda não há nada aqui.",
  "communities.spotlight.emptyBody":
    "Nenhuma comunidade corresponde a estes filtros. Alarga a pesquisa, ou começa a que está a faltar.",
  "communities.spotlight.startCommunityCta": "Começar uma comunidade",
  "communities.spotlight.quiet.membersOnlyPrivate":
    "Só para a comunidade · privada",
  "communities.spotlight.quiet.discreetSafe":
    "Discreta e segura · sem contagem de pessoas",
  "communities.spotlight.quiet.enterCta": "Entrar",
  "communities.spotlight.whatHappensHere": "O que acontece aqui",
  "communities.spotlight.whatYouGet": "O que ganhas ao entrar",
  "communities.spotlight.keptBy": "Mantida por <b>{name}</b> e {extra}",
  "communities.spotlight.keptByName": "Mantida por <b>{name}</b>",
  "communities.spotlight.sinceLabel": "Desde {year}",

  "communities.room.pulse": "o feed ao vivo",
  "communities.room.discussions": "conversas",
  "communities.room.events": "convívios e confirmações",
  "communities.room.resources": "guias e biblioteca",

  // ── Housing ────────────────────────────────────────────────────────────────
  "housing.title": "Encontra um sítio onde te sintas em <em>casa.</em>",
  "housing.subtitle":
    "Quartos, subarrendamentos e colegas de casa de pessoas da comunidade, com recomendações de quem já lá viveu.",
  "housing.cta": "Ver alojamento",
  "housing.eyebrow": "Quartos e colegas de casa",
  "housing.secondaryCta": "Publica que estás à procura",
  "housing.ctaNote": "Aqui, toda a gente faz parte da mesma rede de confiança.",
  "housing.tabRoom": "O quarto",
  "housing.tabLandlord": "O senhorio",
  "housing.postedByMember": "Publicado por uma pessoa da comunidade",
  "housing.bringToFrontAria": 'Trazer "{label}" para a frente',
  "housing.reviewsFootNote":
    "Escrito por pessoas que lá viveram. Os senhorios não podem responder nem remover.",
  "housing.reviewsFootCta": "Como funcionam as avaliações",

  // Ver nota equivalente em en/homepage.ts: os dois anúncios de exemplo são
  // uma exceção intencional à regra de âmbito acima — conteúdo estático,
  // igual em modo demo e live, nunca vindo da API.
  "housing.listings.a.peekLabel": "Quarto em Arroios · 480 €",
  "housing.listings.a.photoPlaceholder": "O quarto. Apartamento em Arroios.",
  "housing.listings.a.chips.0": "480 € + despesas",
  "housing.listings.a.chips.1": "Arroios · a partir de 1 de outubro",
  "housing.listings.a.title":
    "Um quarto luminoso num apartamento partilhado por três pessoas",
  "housing.listings.a.meta":
    "Quarto privado, cozinha partilhada, terraço e dois gatos que já vivem lá sem pagar renda.",
  "housing.listings.a.price.lead": "40 € abaixo",
  "housing.listings.a.price.rest":
    "da mediana de um quarto em Arroios (520 €). Mostramos-te isso antes de perguntares.",
  "housing.listings.a.household.name": "Vera, Tó e mais uma pessoa",
  "housing.listings.a.household.sub":
    "Recomendada por 3 pessoas da comunidade. Aqui desde 2024.",
  "housing.listings.a.signals.0.lead": "Casa trans-afirmativa.",
  "housing.listings.a.signals.0.rest": "Partilhado por quem lá vive.",
  "housing.listings.a.signals.1.lead":
    "Senhorio avaliado por 3 antigos inquilinos.",
  "housing.listings.a.signals.1.rest":
    "Vê o que os inquilinos anteriores tiveram a dizer antes de entrares em contacto.",
  "housing.listings.a.signals.2.lead": "Termos da caução por escrito.",
  "housing.listings.a.signals.2.rest":
    "Sabe a que estás a concordar antes de te mudares.",
  "housing.listings.a.landlord.sub":
    "Três apartamentos em Arroios. Conhecido aqui desde 2024.",
  "housing.listings.a.landlord.verdict":
    "Os três antigos inquilinos voltariam a alugar com ele",
  "housing.listings.a.landlord.quotes.0.quote":
    "Nunca me perguntou quem era a minha pessoa. Arranjou o esquentador em dois dias.",
  "housing.listings.a.landlord.quotes.0.who": "Rui, viveu lá entre 2022 e 2024",
  "housing.listings.a.landlord.quotes.1.quote":
    "Pôs o meu nome no contrato como eu pedi, à primeira, sem qualquer conversa sobre isso.",
  "housing.listings.a.landlord.quotes.1.who":
    "Nadia, viveu lá entre 2021 e 2022",
  "housing.listings.a.landlord.quotes.2.quote":
    "Caução devolvida na totalidade, as duas vezes. Ele manda uma foto da transferência.",
  "housing.listings.a.landlord.quotes.2.who":
    "Joana, viveu lá entre 2019 e 2021",
  "housing.listings.a.landlord.flag.lead": "Um alerta:",
  "housing.listings.a.landlord.flag.rest":
    "aumentou a renda a meio do contrato em 2023, revertendo depois de uma reclamação por escrito.",

  "housing.listings.b.peekLabel": "Subarrendamento na Graça · 390 € · jan–mar",
  "housing.listings.b.photoPlaceholder": "O estúdio. Subarrendamento na Graça.",
  "housing.listings.b.chips.0": "390 € + despesas",
  "housing.listings.b.chips.1": "Graça · jan–mar",
  "housing.listings.b.title": "Um estúdio inteiro na Graça, de janeiro a março",
  "housing.listings.b.meta":
    "Subarrendo enquanto estou fora. Acesso ao terraço, boa luz à tarde, um cão que terias de alimentar.",
  "housing.listings.b.price.lead": "Perto da mediana",
  "housing.listings.b.price.rest":
    "de um estúdio na Graça (420 €). Mobilado, despesas divididas com o apartamento de baixo.",
  "housing.listings.b.household.sub":
    "Recomendada por 5 pessoas da comunidade. Aqui desde 2023.",
  "housing.listings.b.signals.0.lead":
    "Subarrendamento com consentimento escrito do senhorio.",
  "housing.listings.b.signals.0.rest": "A documentação está no anúncio.",
  "housing.listings.b.signals.1.lead": "Entrada sem degraus.",
  "housing.listings.b.signals.1.rest":
    "Elevador até ao quarto andar, porta de casa de banho larga.",
  "housing.listings.b.signals.2.lead": "Sem caução.",
  "housing.listings.b.signals.2.rest":
    "A Beatriz só está a pedir o primeiro mês.",
  "housing.listings.b.landlord.sub": "Um apartamento na Graça. Nova no quadro.",
  "housing.listings.b.landlord.emptyState.title": "Ainda sem avaliações.",
  "housing.listings.b.landlord.emptyState.body":
    "Ainda ninguém aqui alugou com ela. Se ficares com o quarto, és a primeira pessoa a escrever sobre isso, e a próxima fica a saber o que tu sabes.",
  "housing.listings.b.landlord.facts.0.text":
    "Uma pessoa moderadora verificou a identidade dela pessoalmente.",
  "housing.listings.b.landlord.facts.1.text":
    "Contrato e carta de consentimento mostrados à equipa de alojamento antes de o anúncio ser publicado.",
  "housing.listings.b.landlord.facts.2.text":
    "Ainda sem histórico como senhoria. Leva uma pessoa amiga à visita.",
  "housing.listings.factsHeading": "O que sabemos",

  // ── Subprofiles ────────────────────────────────────────────────────────────
  "subprofiles.title": "Diferentes lados de ti. <em>Tudo num só lugar.</em>",
  "subprofiles.subtitle":
    "Talvez sejas designer de dia e DJ à noite. Talvez faças arte, tenhas um projeto, ou um lado inteiro de ti que preferes manter à parte. Cria perfis alternativos para o que quiseres partilhar, e decide exatamente quão visível cada um é.",
  "subprofiles.subtitleIdentity":
    "Cada perfil pode ter a sua própria identidade, com a informação, interesses e conteúdo que fazem sentido naquele contexto. Podes mostrar um lado mais profissional num perfil e algo completamente diferente noutro, sem perder a ligação entre eles.",
  "subprofiles.subtitleControl":
    "Tu decides o que cada pessoa vê e quanto queres partilhar. Alguns perfis podem estar totalmente ligados ao teu nome, enquanto outros podem existir de forma mais discreta. Nem todas as partes de nós precisam de aparecer no mesmo lugar.",
  "subprofiles.cta": "Explorar perfis alternativos",
  "subprofiles.ctaNote":
    "Três perfis alternativos estão incluídos em cada conta.",
  "subprofiles.proofHeading":
    "Mais do que um lado teu. Um perfil não consegue mostrar tudo.",
  "subprofiles.proofEverywhereNote":
    "Um único perfil tende a tornar-se na versão de ti mais fácil de explicar. O resto fica de fora.",
  "subprofiles.everywhereElse": "Em qualquer outro lado",
  "subprofiles.onQueerPulse": "No QueerPulse",
  "subprofiles.proofVs": "vs",
  "subprofiles.proofCrampRoles":
    "artista de drag · ceramista · crítica musical",
  "subprofiles.mainNodeSub": "Perfil principal · design de produto",
  "subprofiles.postingAs": "A publicar como",

  // Ver nota equivalente em en/homepage.ts: os quatro perfis de exemplo são
  // a mesma exceção intencional. Os nomes próprios mantêm-se em
  // personasShowcase.data.ts, fora do catálogo — nomes não se traduzem.
  "subprofiles.personas.main.role": "Designer de produto",
  "subprofiles.personas.main.sub": "Fintech, há seis anos · Arroios",
  "subprofiles.personas.main.cta": "Ver o trabalho",
  "subprofiles.personas.main.bio":
    "Designer de produto em fintech, com casos de estudo e disponibilidade para consultoria.",
  "subprofiles.personas.main.meta.0": "Aberta a consultoria",
  "subprofiles.personas.main.meta.1": "4 casos de estudo",
  "subprofiles.personas.main.meta.2": "Fala inglês e português",
  "subprofiles.personas.main.tiles.0.label": "Caso de estudo",
  "subprofiles.personas.main.tiles.1.label": "Caso de estudo",
  "subprofiles.personas.main.tiles.2.label": "Palestra",
  "subprofiles.personas.main.foot":
    "O teu perfil principal. Aquele por que as pessoas já te conhecem.",
  "subprofiles.personas.main.note":
    "A falar como tu própria: a carreira em design de produto, a que todas as redes já conhecem.",
  "subprofiles.personas.main.switcherSub":
    "Perfil principal · design de produto",
  "subprofiles.personas.main.laneLabel": "design de produto",

  "subprofiles.personas.mara.role": "Artista de drag",
  "subprofiles.personas.mara.sub": "Anjos · a atuar desde 2018",
  "subprofiles.personas.mara.cta": "Marcar um espetáculo",
  "subprofiles.personas.mara.bio":
    "Espetáculos nos Anjos desde 2018, com cachet público e disponibilidade para festivais.",
  "subprofiles.personas.mara.meta.0": "Dois espetáculos por mês",
  "subprofiles.personas.mara.meta.1": "Tabela de preços pública",
  "subprofiles.personas.mara.meta.2": "Viaja para festivais",
  "subprofiles.personas.mara.tiles.0.label": "Foto do espetáculo",
  "subprofiles.personas.mara.tiles.1.label": "Foto do espetáculo",
  "subprofiles.personas.mara.tiles.2.label": "Cartaz da tour",
  "subprofiles.personas.mara.foot":
    "Tudo o que precisam de saber sobre o trabalho da Sofia como artista, sem o resto do perfil dela pelo meio.",
  "subprofiles.personas.mara.note":
    "A falar como Mara: quem contrata vê os espetáculos, as fotos e o cachet. O currículo de design de produto fica fora desta página.",
  "subprofiles.personas.mara.switcherSub": "Drag · promotores e espaços",
  "subprofiles.personas.mara.laneLabel": "drag",
  "subprofiles.personas.mara.deck.skinLabel": "Aspeto de cartaz",
  "subprofiles.personas.mara.deck.tag":
    "Drag, há oito anos. Dois espetáculos por mês nos Anjos, uma tabela de preços que não pede desculpa.",
  "subprofiles.personas.mara.deck.visLabel": "Promotores e espaços",
  "subprofiles.personas.mara.deck.showsLine":
    "Espetáculos · fotos · tabela de preços",

  "subprofiles.personas.atelier.role": "Estúdio de cerâmica, duas pessoas",
  "subprofiles.personas.atelier.sub": "Graça · encomendas e venda por grosso",
  "subprofiles.personas.atelier.cta": "Encomendar uma peça",
  "subprofiles.personas.atelier.bio":
    "Ateliê de cerâmica na Graça gerido por duas pessoas, com encomendas e venda por grosso.",
  "subprofiles.personas.atelier.meta.0": "Encomendas abertas",
  "subprofiles.personas.atelier.meta.1": "Lista de venda por grosso",
  "subprofiles.personas.atelier.meta.2": "Workshops aos sábados",
  "subprofiles.personas.atelier.tiles.0.label": "Peça acabada",
  "subprofiles.personas.atelier.tiles.1.label": "Peça acabada",
  "subprofiles.personas.atelier.tiles.2.label": "O estúdio",
  "subprofiles.personas.atelier.foot":
    "Creditado ao ateliê: uma página inicial partilhada que duas pessoas podem gerir.",
  "subprofiles.personas.atelier.note":
    "A falar como o estúdio: compradores e galerias veem o trabalho e os preços, creditados ao ateliê em vez de a ti.",
  "subprofiles.personas.atelier.switcherSub":
    "Cerâmica · compradores e galerias",
  "subprofiles.personas.atelier.laneLabel": "cerâmica",
  "subprofiles.personas.atelier.deck.skinLabel": "Aspeto de estúdio",
  "subprofiles.personas.atelier.deck.tag":
    "Um estúdio de cerâmica de duas pessoas na Graça. Encomendas, venda por grosso e workshops aos sábados.",
  "subprofiles.personas.atelier.deck.visLabel": "Compradores e galerias",
  "subprofiles.personas.atelier.deck.showsLine":
    "Trabalho · preços · dias de estúdio",

  "subprofiles.personas.byline.role": "Crítica musical",
  "subprofiles.personas.byline.sub": "Assinaturas em três revistas desde 2021",
  "subprofiles.personas.byline.cta": "Ler os artigos",
  "subprofiles.personas.byline.bio":
    "Crítica musical com assinaturas em três revistas, focada em clubbing e diáspora.",
  "subprofiles.personas.byline.meta.0": "Área: clubbing e diáspora",
  "subprofiles.personas.byline.meta.1": "Nota de proposta disponível",
  "subprofiles.personas.byline.meta.2": "Encomendas a partir de 180 €",
  "subprofiles.personas.byline.tiles.0.label": "Reportagem",
  "subprofiles.personas.byline.tiles.1.label": "Crítica de álbum",
  "subprofiles.personas.byline.tiles.2.label": "Entrevista",
  "subprofiles.personas.byline.foot":
    "Um pseudónimo com portefólio. Os artigos falam por si, sem o trabalho do dia a dia associado.",
  "subprofiles.personas.byline.note":
    "A falar como o pseudónimo: quem edita vê os artigos e a área que cobres, com o teu trabalho do dia a dia fora disso.",
  "subprofiles.personas.byline.switcherSub": "Crítica musical · editores",
  "subprofiles.personas.byline.laneLabel": "crítica musical",
  "subprofiles.personas.byline.deck.skinLabel": "Aspeto de assinatura",
  "subprofiles.personas.byline.deck.tag":
    "O nome com que assina crítica musical. Assinaturas em três revistas desde 2021.",
  "subprofiles.personas.byline.deck.visLabel": "Editores que encomendam",
  "subprofiles.personas.byline.deck.showsLine":
    "Artigos · áreas · nota de proposta",

  // ── Outro (chamada final) ──────────────────────────────────────────────────
  "outro.title": "Entra numa sala onde <em>já pertences.</em>",
  "outro.sub":
    "A QueerPulse é uma comunidade só por convite, construída sobre confiança, curiosidade e a crença de que ligações genuínas podem mudar vidas e cidades.",
  "outro.cta": "Pedir um convite",
};
