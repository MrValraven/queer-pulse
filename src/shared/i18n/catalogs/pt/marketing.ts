import type { Catalog } from "../../types";

/**
 * Marketing — pt-PT inclusivo. Mesmas chaves que `en/marketing.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *pessoas da comunidade*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Prioridade de formas inclusivas: reformulação neutra primeiro (*pessoa*,
 *   *quem*); segunda pessoa/imperativo; formas em `-e` (*avalizade*,
 *   *removide*, *obrigade*) só quando a reformulação neutra não chega e o
 *   texto se dirige diretamente à pessoa; nunca `@`/`x`, nunca masculino
 *   como falso neutro.
 * - Marca QueerPulse, nomes próprios (bairros, ILGA Portugal, siglas legais
 *   como RGPD/CNPD) ficam iguais.
 */
export const marketing: Catalog = {
  // ── Sobre ──────────────────────────────────────────────────────────────
  "about.meta.title": "Sobre a QueerPulse: uma rede pequena e gerida por pessoas",
  "about.meta.description":
    "A QueerPulse é uma plataforma comunitária queer pequena, por convite, em Lisboa — sem anúncios, sem algoritmo, sem crescimento pelo crescimento. Eis o que acreditamos, e quem a gere.",
  "about.hero.eyebrow": "Sobre",
  "about.hero.title": "Uma plataforma construída <em>de propósito.</em>",
  "about.hero.sub":
    "Não é mais um feed a competir pela tua atenção. Um espaço pequeno e deliberado, feito para acolher esta comunidade, não para a explorar.",
  "about.why.eyebrow": "Porque existimos",
  "about.why.title": "Construímos aquilo <em>de que precisávamos.</em>",
  "about.why.p1":
    "A QueerPulse começou como uma frustração, não como um plano de negócio. Todas as plataformas onde tentámos construir comunidade estavam desenhadas para prender a nossa atenção, não para nos servir — otimizadas para tempo de ecrã, não para saber se nos encontrávamos mesmo.",
  "about.why.p2":
    "Por isso, um pequeno grupo — profissionais, organizadores, artistas — decidiu construir a alternativa: uma rede pensada para a confiança, não para a escala, onde o objetivo é a ligação, não o envolvimento.",
  "about.why.p3":
    "Cresce mais devagar assim. Isso é o desenho, não um defeito.",
  "about.why.pullQuote":
    "Não queríamos uma audiência maior. Queríamos uma sala em que pudéssemos confiar.",
  "about.difference.eyebrow": "A diferença",
  "about.difference.title": "O que <em>não estamos a construir.</em>",
  "about.contrast.them.label": "Em todo o lado",
  "about.contrast.us.label": "QueerPulse",
  "about.contrast.them.attention": "Otimizado para prender a tua atenção",
  "about.contrast.them.algorithm": "Um algoritmo decide o que vês",
  "about.contrast.them.growth": "Crescimento a qualquer custo",
  "about.contrast.them.value": "Os teus dados são o produto",
  "about.contrast.us.noAds": "Sem anúncios, nunca",
  "about.contrast.us.findWhatYouNeed": "Encontras o que precisas e sais",
  "about.contrast.us.smallByDesign": "Pequeno por design, não por acaso",
  "about.contrast.us.valueStays": "O valor que crias fica na comunidade",
  "about.beliefs.eyebrow": "No que acreditamos",
  "about.beliefs.title": "Os valores por trás de <em>cada decisão.</em>",
  "about.values.smallByDesign.title": "Pequeno por design",
  "about.values.smallByDesign.body":
    "Preferimos continuar a ser uma sala que funciona a tornarmo-nos uma plataforma que não funciona. O crescimento nunca é o objetivo por si só.",
  "about.values.infrastructure.title": "Infraestrutura, não conteúdo",
  "about.values.infrastructure.body":
    "Estamos a construir a canalização de que a comunidade queer precisa — apresentações, espaços seguros, entreajuda — não mais um feed para percorrer.",
  "about.values.communityEconomy.title": "Uma economia comunitária",
  "about.values.communityEconomy.body":
    "O dinheiro que passa pela QueerPulse — quotas, gorjetas, apoios — fica dentro da comunidade de onde veio.",
  "about.values.communityOwns.title": "A comunidade é dona do seu espaço",
  "about.values.communityOwns.body":
    "As decisões sobre esta plataforma são tomadas às claras, com quem a usa — não em gabinetes fechados.",
  "about.values.noDataEconomy.title": "Sem economia de dados",
  "about.values.noDataEconomy.body":
    "Não vendemos atenção nem dados pessoais a anunciantes. Não há terceiros para quem estejamos a construir isto.",
  "about.values.accessNotEarned.title": "O acesso não se ganha a atuar",
  "about.values.accessNotEarned.body":
    "Entras pela confiança — um aval, um convite — não por publicares as coisas certas com frequência suficiente.",
  "about.who.eyebrow": "Quem está por trás disto",
  "about.who.title": "Construída pela <em>comunidade, para a comunidade.</em>",
  "about.who.p1":
    "A QueerPulse é gerida por quem a usa — uma pequena equipa fundadora e um círculo crescente de pessoas que ajudam a definir o que vem a seguir.",
  "about.who.p2":
    "Não temos capital de risco à procura de retorno. Temos quotas, doações e apoios que mantêm a plataforma independente.",
  "about.who.pullQuote":
    "Ninguém nesta equipa está a tentar enriquecer com isto. Estamos a tentar fazer bem-feito.",
  "about.contactStrip.title": "Perguntas? <em>Estamos contactáveis.</em>",
  "about.contactStrip.body":
    "Sem pedidos de suporte perdidos numa fila. Uma pessoa a sério lê o que envias.",
  "about.contactStrip.contactCta": "Contacta-nos",
  "about.contactStrip.governanceCta": "Lê a nossa governação",
  "about.outro.title": "Vem ver <em>com os teus próprios olhos.</em>",
  "about.outro.sub":
    "A melhor forma de perceber a QueerPulse é estar dentro dela.",
  "about.outro.cta": "Pedir um convite",

  // ── Acessibilidade ─────────────────────────────────────────────────────
  "accessibility.meta.title": "Espaços queer acessíveis em Lisboa, revistos",
  "accessibility.meta.description":
    "Informação real de acessibilidade sobre espaços queer em Lisboa, revista por pessoas com deficiência da comunidade e não adivinhada — e como pedir uma adaptação diretamente.",
  "accessibility.backLabel": "← Ajuda",
  "accessibility.category": "Acessibilidade",
  "accessibility.hero.title": "O acesso <em>não devia ser um talvez.</em>",
  "accessibility.hero.sub":
    "Informação real de acessibilidade sobre espaços queer em Lisboa — revista por pessoas com deficiência, não adivinhada. E como pedir-nos uma adaptação diretamente.",
  "accessibility.hero.accomCta": "Pedir uma adaptação",
  "accessibility.hero.spacesCta": "Ver espaços acessíveis",
  "accessibility.hero.note":
    "Cada espaço abaixo foi revisto por uma pessoa da comunidade com deficiência antes de ser listado.",
  "accessibility.spaces.title": "Espaços <em>acessíveis</em>",
  "accessibility.spaces.body":
    "Filtra pela característica de acesso que importa para ti. Cada ficha reflete o que uma pessoa com deficiência convíviou lá, não o que o espaço afirma sobre si próprio.",
  "accessibility.spaces.filterLabel": "Filtrar por:",
  "accessibility.spaces.emptyTitle": "Ainda não há espaços com este filtro",
  "accessibility.spaces.emptyBody":
    "Experimenta outra característica, ou assinala um espaço que gostarias de ver revisto.",
  "accessibility.filters.all": "Todos os espaços",
  "accessibility.filters.stepFree": "Sem degraus",
  "accessibility.filters.accessibleBathroom": "Casa de banho acessível",
  "accessibility.filters.seating": "Lugares sentados",
  "accessibility.filters.hearingLoop": "Aro magnético",
  "accessibility.filters.sensoryFriendly": "Sensorialmente amigável",
  "accessibility.filters.carerWelcome": "Acompanhantes bem-vindes",
  "accessibility.commitments.title": "Os nossos <em>compromissos</em>",
  "accessibility.commitments.body":
    "O que já fazemos e aquilo em que ainda estamos a trabalhar — sem arredondar para cima.",
  "accessibility.commitments.captions.title": "Legendagem ao vivo",
  "accessibility.commitments.captions.body":
    "Eventos comunitários com programa falado têm legendagem ao vivo a pedido.",
  "accessibility.commitments.captions.status": "Disponível a pedido",
  "accessibility.commitments.lgp.title": "Interpretação em LGP",
  "accessibility.commitments.lgp.body":
    "Interpretação em Língua Gestual Portuguesa nos eventos principais, reservada com antecedência.",
  "accessibility.commitments.lgp.status": "Só eventos principais",
  "accessibility.commitments.seating.title": "Lugares sentados, sempre",
  "accessibility.commitments.seating.body":
    "Todos os eventos organizados pela QueerPulse garantem lugar sentado para quem precisar — sem exceções.",
  "accessibility.commitments.seating.status": "Garantido",
  "accessibility.commitments.sensory.title": "Momentos sensorialmente calmos",
  "accessibility.commitments.sensory.body":
    "Janelas com menos volume e menos gente em convívios selecionados, para quem precisa.",
  "accessibility.commitments.sensory.status": "Eventos selecionados",
  "accessibility.commitments.carers.title": "Acompanhantes bem-vindes",
  "accessibility.commitments.carers.body":
    "Pessoas de apoio e acompanhantes entram gratuitamente em qualquer evento da QueerPulse.",
  "accessibility.commitments.carers.status": "Sempre gratuito",
  "accessibility.commitments.platform.title": "Uma plataforma acessível",
  "accessibility.commitments.platform.body":
    "Suporte a leitores de ecrã, navegação por teclado e redução de movimento fazem parte do produto, não são acrescentados depois.",
  "accessibility.commitments.platform.status": "Em curso",
  "accessibility.commitments.accomTitle":
    "Precisas de algo que não está na lista?",
  "accessibility.commitments.accomBody":
    "Diz-nos o que precisas para um evento específico e fazemos o que pudermos, mesmo em cima da hora.",
  "accessibility.commitments.accomCta": "Pedir uma adaptação",
  "accessibility.resources.title": "Recursos <em>relacionados</em>",
  "accessibility.resources.body":
    "Apoio que vai além do que a própria QueerPulse consegue oferecer.",
  "accessibility.resources.openingToast": "A abrir recurso…",
  "accessibility.resources.benefits.eyebrow": "Financeiro",
  "accessibility.resources.benefits.title":
    "Prestações por deficiência, explicadas",
  "accessibility.resources.benefits.body":
    "Um guia em linguagem simples sobre prestações por deficiência em Portugal e como te candidatares.",
  "accessibility.resources.benefits.link": "Ler o guia",
  "accessibility.resources.healthcare.eyebrow": "Saúde",
  "accessibility.resources.healthcare.title":
    "Encontrar cuidados acessíveis e afirmativos",
  "accessibility.resources.healthcare.body":
    "Clínicos e clínicas avaliados que levam a sério tanto a acessibilidade como os cuidados afirmativos de género.",
  "accessibility.resources.healthcare.link": "Ver a lista",
  "accessibility.resources.legal.eyebrow": "Legal",
  "accessibility.resources.legal.title": "Conhece os teus direitos",
  "accessibility.resources.legal.body":
    "O que a lei portuguesa garante mesmo a pessoas com deficiência, e a quem recorrer quando não é cumprida.",
  "accessibility.resources.legal.link": "Ler mais",
  "accessibility.resources.mentalHealth.eyebrow": "Saúde mental",
  "accessibility.resources.mentalHealth.title":
    "Apoio para doença crónica e deficiência",
  "accessibility.resources.mentalHealth.body":
    "Grupos de entreajuda e terapeutas que percebem a sobreposição entre ser queer e ter uma deficiência.",
  "accessibility.resources.mentalHealth.link": "Encontrar apoio",
  "accessibility.peer.title": "Mentoria entre <em>pares</em>",
  "accessibility.peer.body":
    "Pessoas com deficiência a apoiarem-se mutuamente — juntando quem chega agora a alguém que já navegou os mesmos sistemas.",
  "accessibility.peer.joinCta": "Juntar-me como pessoa mentorada",
  "accessibility.peer.joiningToast":
    "Estás na lista — juntamos-te a alguém em breve.",
  "accessibility.peer.mentorCta": "Oferecer mentoria",
  "accessibility.outro.title":
    "O acesso é uma <em>prática,</em> não uma política.",
  "accessibility.outro.sub": "Diz-nos onde estamos a falhar. Preferimos saber.",
  "accessibility.outro.cta": "Pedir um convite",
  "accessibility.venue.reviewedBy_one":
    "Revisto por {count} pessoa com deficiência",
  "accessibility.venue.reviewedBy_other":
    "Revisto por {count} pessoas com deficiência",
  "accessibility.venue.operatedBadge": "Espaço operado pela QueerPulse",
  "accessibility.venue.flagCta": "Assinalar um problema",
  "accessibility.flagIssues.stepFree": "Acesso sem degraus",
  "accessibility.flagIssues.bathroom": "Casa de banho acessível",
  "accessibility.flagIssues.seating": "Lugares sentados",
  "accessibility.flagIssues.hearingLoop": "Aro magnético",
  "accessibility.flagIssues.sensory": "Ambiente sensorial",
  "accessibility.flagIssues.staff": "Atitude da equipa",
  "accessibility.flagIssues.other": "Outra coisa",
  "accessibility.flagModal.ariaLabel":
    "Assinalar um problema de acessibilidade",
  "accessibility.flagModal.title": "Assinalar um problema de acessibilidade",
  "accessibility.flagModal.sub":
    "Diz-nos o que aconteceu — isto vai diretamente para o espaço e para a nossa equipa de acessibilidade.",
  "accessibility.flagModal.venueLabel": "Espaço",
  "accessibility.flagModal.issueTypeLabel": "Que tipo de problema?",
  "accessibility.flagModal.issueTypePlaceholder": "Escolhe um tipo de problema",
  "accessibility.flagModal.whatHappenedLabel": "O que aconteceu?",
  "accessibility.flagModal.whatHappenedPlaceholder":
    "Descreve o que encontraste",
  "accessibility.flagModal.whenLabel": "Quando?",
  "accessibility.flagModal.whenPlaceholder":
    "ex.: no fim de semana passado, 14 de maio",
  "accessibility.flagModal.submitCta": "Enviar",
  "accessibility.flagModal.cancelCta": "Cancelar",
  "accessibility.flagModal.doneTitle": "Obrigade — <em>já tratámos disto.</em>",
  "accessibility.flagModal.doneBody":
    "Vamos falar com o espaço e atualizar esta ficha se algo mudar.",
  "accessibility.flagModal.closeCta": "Fechar",
  "accessibility.accomModal.ariaLabel": "Pedir uma adaptação",
  "accessibility.accomModal.title": "Pedir uma adaptação",
  "accessibility.accomModal.sub":
    "Diz-nos o que precisas para um evento específico — quanto mais aviso, mais conseguimos fazer.",
  "accessibility.accomModal.nameLabel": "O teu nome",
  "accessibility.accomModal.namePlaceholder": "O teu nome",
  "accessibility.accomModal.eventLabel": "Que evento?",
  "accessibility.accomModal.eventPlaceholder": "Nome ou data do evento",
  "accessibility.accomModal.needLabel": "De que precisas?",
  "accessibility.accomModal.needPlaceholder":
    "ex.: legendagem, uma sala tranquila, acesso sem degraus",
  "accessibility.accomModal.contactLabel": "Melhor forma de te contactar",
  "accessibility.accomModal.contactPlaceholder": "Email ou telemóvel",
  "accessibility.accomModal.submitCta": "Enviar pedido",
  "accessibility.accomModal.cancelCta": "Cancelar",
  "accessibility.accomModal.doneTitle":
    "Recebido — <em>já estamos a tratar.</em>",
  "accessibility.accomModal.doneBody":
    "Alguém da equipa vai falar contigo antes do evento.",
  "accessibility.accomModal.closeCta": "Fechar",

  // ── Ativismo ───────────────────────────────────────────────────────────
  "activism.hero.eyebrow": "Ativismo",
  "activism.hero.title": "Cuidar da comunidade é <em>político.</em>",
  "activism.hero.sub":
    "Formas de te envolveres, perto e mais longe — de uma tarde de terça-feira a um compromisso permanente.",
  "activism.nav.onThisPage": "Nesta página",
  "activism.nav.start": "Por onde começar",
  "activism.nav.local": "Localmente",
  "activism.nav.skills": "Traz uma competência",
  "activism.nav.mobilise": "Mobilizar",
  "activism.nav.feel": "Como se sente",
  "activism.nav.orgs": "Organizações parceiras",
  "activism.nav.volunteer": "Voluntariado",
  "activism.conviction.local.word": "Local.",
  "activism.conviction.local.rest": "A mudança começa na sala em que já estás.",
  "activism.conviction.real.word": "Real.",
  "activism.conviction.real.rest":
    "Não é uma partilha. É algo que te custa alguma coisa.",
  "activism.conviction.yours.word": "Teu.",
  "activism.conviction.yours.rest":
    "Escolhe a forma que cabe na tua vida agora.",
  "activism.start.title": "Por onde <em>começar</em>",
  "activism.start.p1":
    "Não precisas de deixar o emprego nem de te filiares num partido. O ativismo cabe numa tarde.",
  "activism.start.p2":
    "Aqui tens uma escada — escolhe o degrau que corresponde ao que tens para dar este mês.",
  "activism.start.step1.title": "Aparece uma vez",
  "activism.start.step1.body":
    "Vai a um convívio, uma vigília, uma reunião comunitária. A presença é o primeiro ato.",
  "activism.start.step2.title": "Dá algumas horas",
  "activism.start.step2.body":
    "Escolhe um turno recorrente — uma linha de apoio, uma tarde de sensibilização, uma banca num evento.",
  "activism.start.step3.title": "Traz uma competência",
  "activism.start.step3.body":
    "Design, código, cozinha, trabalho de cuidado — as organizações precisam de tudo isso, não só de cartazes.",
  "activism.start.step4.title": "Compromete-te",
  "activism.start.step4.body":
    "Entra numa direção, lidera uma campanha, orienta alguém mais novo na organização.",
  "activism.local.title": "Localmente, <em>em Lisboa</em>",
  "activism.local.p1":
    "As lutas mais próximas de casa raramente fazem manchete — habitação, acesso a cuidados de saúde, um espaço ameaçado.",
  "activism.local.p2":
    "Neste momento, <b>Mouraria e Intendente</b> são os bairros onde inquilinos queer mais precisam de apoio.",
  "activism.local.banner.title": "Pressão habitacional na Mouraria",
  "activism.local.banner.body":
    "Vários agregados queer enfrentam avisos de não renovação este trimestre. O papel de Defesa da Habitação abaixo é uma resposta direta.",
  "activism.skills.title": "Traz uma <em>competência</em>",
  "activism.skills.p1":
    "Cada organização abaixo precisa de mais do que voluntários com cartazes — precisa do teu ofício.",
  "activism.skills.design.title": "Design",
  "activism.skills.design.body":
    "Materiais de campanha, zines, sinalética — trabalho visual que faz um argumento chegar.",
  "activism.skills.tech.title": "Tecnologia",
  "activism.skills.tech.body":
    "Sites, bases de dados, segurança digital para quem organiza e precisa de estar seguro online.",
  "activism.skills.food.title": "Comida",
  "activism.skills.food.body":
    "Cozinhar para eventos, angariações de fundos e programas de refeições de entreajuda.",
  "activism.skills.care.title": "Trabalho de cuidado",
  "activism.skills.care.body":
    "Apoio entre pares, guarda de crianças durante reuniões, ver como estão as pessoas em dificuldade.",
  "activism.mobilise.title": "Como <em>mobilizar</em>",
  "activism.mobilise.p1":
    "<b>Mobiliza, não apareças só.</b> Traz alguém contigo — os números mudam o que é politicamente possível.",
  "activism.mobilise.p2":
    "<b>Documenta, não sejas só testemunha.</b> Fotografias e notas de uma ação importam mais tarde, para responsabilização e para a história.",
  "activism.mobilise.p3":
    "<b>Continua depois, não fiques só na marcha.</b> O trabalho depois da manifestação é onde acontece a maior parte da mudança real.",
  "activism.feel.title": "Como se <em>sente</em>",
  "activism.feel.p1":
    "O esgotamento é real. Um ativismo que só exige e nunca repõe não é sustentável — nem para ti, nem para o movimento.",
  "activism.feel.p2":
    "Está tudo bem em recuar. Está tudo bem em fazer menos do que achas que devias. Descansar faz parte do trabalho, não é uma traição a ele.",
  "activism.feel.banner.title": "Se estás perto do esgotamento",
  "activism.feel.banner.body":
    "Fala com o apoio entre pares antes de desapareceres de vez. Recuar com um plano é melhor do que desaparecer sem nenhum.",
  "activism.orgs.title": "Organizações <em>parceiras</em>",
  "activism.orgs.p1":
    "Quatro organizações portuguesas com quem trabalhamos diretamente — todas recebem voluntários de braços abertos.",
  "activism.volunteer.title": "Vagas <em>abertas</em>",
  "activism.volunteer.p1":
    "Oportunidades de voluntariado atuais das nossas organizações parceiras, atualizadas regularmente.",
  "activism.volunteer.expressInterestCta": "Mostrar interesse →",
  "activism.volunteer.seeAllCta": "Ver todas as vagas de voluntariado",
  "activism.outro.title": "Escolhe um degrau. <em>Começa hoje.</em>",
  "activism.outro.sub":
    "O Quadro é onde vive cada vaga listada, atualizado à medida que as organizações publicam novas.",
  "activism.outro.seeBoardCta": "Ver o quadro de voluntariado",

  // ── Código de Conduta ──────────────────────────────────────────────────
  "coc.meta.title": "Código de Conduta da QueerPulse: o que é obrigatório",
  "coc.meta.description":
    "O Código de Conduta vinculativo da QueerPulse — seis compromissos que assumes ao aderir, o que conta como dano, como as denúncias são tratadas, e como recorrer.",
  "coc.hero.backLabel": "← Governação",
  "coc.hero.eyebrow": "Código de Conduta · em vigor desde {date}",
  "coc.hero.title": "Como nos tratamos, <em>aqui dentro.</em>",
  "coc.hero.dek":
    "Este é o documento vinculativo — <b>de cumprimento obrigatório</b>, não uma aspiração. Se uma denúncia for confirmada, é isto que usamos como referência.",
  "coc.distinction.thisPage.title": "Esta página",
  "coc.distinction.thisPage.body":
    "O <b>Código de Conduta</b> — o que é de cumprimento obrigatório, o que acontece quando é violado, como recorrer.",
  "coc.distinction.sister.title": "O seu documento irmão",
  "coc.distinction.sister.body":
    "As <b>Diretrizes da Comunidade</b> descrevem a cultura que estamos a construir. Esta página é aquilo sobre o qual agimos.",
  "coc.toc.scope": "Âmbito",
  "coc.toc.pact": "O pacto",
  "coc.toc.harm": "Sobre o que agimos",
  "coc.toc.enforce": "Aplicação",
  "coc.toc.appeal": "Recursos",
  "coc.toc.offplatform": "Conduta fora da plataforma",
  "coc.toc.changes": "Alterações",
  "coc.scope.title": "§01 <em>Âmbito</em>",
  "coc.scope.p1":
    "Este Código aplica-se a tudo na QueerPulse — <strong>publicações, mensagens, convívios, comentários, perfis</strong> — e a conduta fora da plataforma quando afeta diretamente a segurança de outra pessoa aqui.",
  "coc.scope.p2":
    "Aplica-se a todas as pessoas, <em>sem exceção</em> — incluindo fundadores, equipa e moderação.",
  "coc.scope.p3":
    "Não se aplica ao próprio desacordo. Estar em erro, ou ser impopular, não é uma violação. <em>Causar dano, é.</em>",
  "coc.pact.title": "§02 O <em>pacto</em>",
  "coc.pact.lead": "Seis compromissos que cada pessoa assume ao entrar.",
  "coc.pact.item01.title": "Mostramo-nos como somos",
  "coc.pact.item01.body":
    "Traz a tua identidade inteira. Ninguém aqui tem de representar uma versão mais palatável de si próprio.",
  "coc.pact.item02.title": "Perguntamos antes de presumir",
  "coc.pact.item02.body":
    "Pronomes, limites, níveis de conforto — confirma, não adivinhes.",
  "coc.pact.item03.title": "Mantemos esta sala privada",
  "coc.pact.item03.body":
    "O que acontece aqui fica aqui, a menos que a pessoa envolvida diga o contrário.",
  "coc.pact.item04.title": "Ocupamos o espaço na medida certa",
  "coc.pact.item04.body":
    "Repara quando estás a dominar uma conversa. Abre espaço para vozes mais discretas.",
  "coc.pact.item05.title": "Reparamos, não só pedimos desculpa",
  "coc.pact.item05.body":
    "Um pedido de desculpa a sério muda o comportamento. As palavras sozinhas não bastam.",
  "coc.pact.item06.title": "Denunciamos o dano, não só comentamos sobre ele",
  "coc.pact.item06.body":
    "Se algo estiver errado, avisa alguém que possa agir — não fiques só a comentar no grupo de conversa.",
  "coc.pact.closing":
    "Ninguém acerta nisto sempre. O pacto é o padrão a que nos responsabilizamos mutuamente quando falhamos.",
  "coc.harm.title": "§03 Sobre o que <em>agimos</em>",
  "coc.harm.actOnHeading": "Sobre o que agimos",
  "coc.harm.actOn.personalAttacks.lead": "Ataques pessoais.",
  "coc.harm.actOn.personalAttacks.rest":
    "Insultos, rotular alguém, ou atacar a pessoa em vez do seu argumento.",
  "coc.harm.actOn.sustainedHarassment.lead": "Assédio continuado.",
  "coc.harm.actOn.sustainedHarassment.rest":
    "Contacto indesejado e repetido depois de se pedir para parar.",
  "coc.harm.actOn.doxxing.lead": "Doxxing.",
  "coc.harm.actOn.doxxing.rest":
    "Partilhar o nome real, localização, entidade patronal ou outra informação identificativa de alguém sem consentimento.",
  "coc.harm.actOn.intimidation.lead": "Intimidação.",
  "coc.harm.actOn.intimidation.rest":
    "Ameaças, implícitas ou explícitas, para silenciar ou assustar alguém.",
  "coc.harm.actOn.badFaithFraming.lead": "Distorção de má-fé.",
  "coc.harm.actOn.badFaithFraming.rest":
    "Deturpar deliberadamente o que alguém disse para virar a comunidade contra essa pessoa.",
  "coc.harm.frictionHeading": "Sobre o que não agimos",
  "coc.harm.friction.disagreement.lead": "Desacordo.",
  "coc.harm.friction.disagreement.rest":
    "Incluindo desacordo <em>forte</em>, expresso com respeito.",
  "coc.harm.friction.hurtFeelings.lead": "Sentir-se magoade, por si só.",
  "coc.harm.friction.hurtFeelings.rest":
    "O desconforto não é o mesmo que dano — olhamos para o que foi realmente dito ou feito.",
  "coc.harm.friction.criticism.lead": "Críticas à plataforma.",
  "coc.harm.friction.criticism.rest":
    "Incluindo críticas a nós, que a gerimos.",
  "coc.harm.friction.politicalViews.lead":
    "Posições políticas que não partilhas.",
  "coc.harm.friction.politicalViews.rest":
    "Desde que não visem a identidade ou a segurança de outra pessoa.",
  "coc.harm.closing":
    "A linha é o <em>impacto</em>, não a intenção. “Não foi essa a intenção” não anula o dano causado.",
  "coc.enforce.title": "§04 <em>Aplicação</em>",
  "coc.enforce.lead":
    "Uma escada gradual — a maioria das denúncias resolve-se no primeiro ou segundo degrau.",
  "coc.ladder.step1.title": "Uma palavra em privado",
  "coc.ladder.step1.body":
    "Uma pessoa moderadora contacta diretamente, de forma informal, antes de qualquer registo formal.",
  "coc.ladder.step2.title": "Um aviso formal",
  "coc.ladder.step2.body":
    "Documentado, associado à conta. <em>Um aviso mantém-se privado</em> — não é divulgado.",
  "coc.ladder.step3.title": "Suspensão temporária",
  "coc.ladder.step3.body":
    "Um período de arrefecimento, de dias a semanas, consoante a gravidade.",
  "coc.ladder.step4.title": "Remoção de um espaço",
  "coc.ladder.step4.body":
    "Perda de acesso a um convívio, comunidade ou canal específico — não à plataforma inteira.",
  "coc.ladder.step5.title": "Remoção da QueerPulse",
  "coc.ladder.step5.body":
    "Reservado para violações graves ou repetidas. <em>Sempre revisível em recurso.</em>",
  "coc.report.title": "Como <em>denunciar</em>",
  "coc.report.body":
    "Toda a denúncia é lida por uma pessoa, nunca resolvida automaticamente. Procuramos responder em 48 horas.",
  "coc.report.fileCta": "Fazer uma denúncia",
  "coc.appeal.title": "§05 <em>Recursos</em>",
  "coc.appeal.p1":
    "Toda a decisão de aplicação pode ser contestada uma vez, no prazo de <strong>14 dias</strong>, junto de uma pessoa moderadora diferente da que tomou a decisão original.",
  "coc.appeal.p2":
    "Os recursos são decididos no prazo de <strong>7 dias</strong>. A decisão é final, mas a justificação é sempre partilhada contigo.",
  "coc.offplatform.title": "§06 Conduta <em>fora da plataforma</em>",
  "coc.offplatform.lead":
    "Este Código pode estender-se a comportamento fora da QueerPulse em duas situações.",
  "coc.offplatform.case1.lead": "Dano direto a uma pessoa da comunidade.",
  "coc.offplatform.case1.rest":
    "Assédio que começou aqui e continua noutra plataforma, dirigido a uma pessoa da QueerPulse.",
  "coc.offplatform.case2.lead": "Conduta pública que põe pessoas em risco.",
  "coc.offplatform.case2.rest":
    "Declarações ou ações públicas que tornariam <em>insegura a presença de alguém razoável num evento contigo</em>.",
  "coc.offplatform.closing":
    "Isto é usado <em>raramente e com cuidado</em> — nunca é uma licença geral para policiar a vida de alguém fora da plataforma.",
  "coc.changes.title": "§07 <em>Alterações</em>",
  "coc.changes.p1": "Este Código foi publicado pela última vez em {date}.",
  "coc.changelog.v21.lead": "v2.1 · {date}",
  "coc.changelog.v21.rest":
    "Clarificou a secção de conduta fora da plataforma e acrescentou o prazo de recurso.",
  "coc.changelog.v20.lead": "v2.0 · {date}",
  "coc.changelog.v20.rest":
    "Reescreveu a escada de aplicação do zero e acrescentou o passo de aviso privado.",
  "coc.changelog.v14.lead": "v1.4 · {date}",
  "coc.changelog.v14.rest":
    "Acrescentou doxxing e distorção de má-fé como violações explícitas.",
  "coc.changelog.v10.lead": "v1.0 · {date}",
  "coc.changelog.v10.rest":
    "Primeira versão publicada, ratificada pelo círculo fundador.",
  "coc.changes.seeChangelog":
    "Consulta o <changelogLink>histórico completo</changelogLink>.",
  "coc.version.label": "Versão 2.1",
  "coc.version.ratifiedMeta": "Ratificado em {date}",
  "coc.version.downloadCta": "descarregar como texto",
  "coc.version.readManifesto": "ler o Manifesto",
  "coc.download.headerTitle": "Código de Conduta da QueerPulse",
  "coc.download.headerMeta": "Em vigor desde {date}",
  "coc.download.intro":
    "Esta é a versão em texto simples do Código de Conduta vinculativo. Consulta a página web para a versão formatada completa.",
  "coc.download.section01": "Âmbito",
  "coc.download.section02": "O pacto",
  "coc.download.section03": "Sobre o que agimos",
  "coc.download.section04": "Aplicação",
  "coc.download.section05": "Recursos",
  "coc.download.section06": "Conduta fora da plataforma",
  "coc.download.section07": "Alterações",
  "coc.download.mockNote":
    "(Este é um descarregável de protótipo — o ficheiro de produção corresponderá exatamente à página web.)",

  // ── Cookies ────────────────────────────────────────────────────────────
  "cookies.meta.title": "Política de Cookies da QueerPulse e preferências",
  "cookies.meta.description":
    "Que cookies a QueerPulse utiliza — essenciais, funcionais e de análise — o que cada um faz, e onde ajustar as tuas preferências. Sem cookies de publicidade.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "O que <em>registamos,</em> e porquê.",
  "cookies.sub":
    "Uma lista curta, não um muro de juridiquês. Ajusta abaixo o que te faz sentido.",
  "cookies.essential.title": "Essenciais",
  "cookies.essential.body":
    "Necessários para te manteres com sessão iniciada e a tua conta segura. Não podem ser desligados.",
  "cookies.functional.title": "Funcionais",
  "cookies.functional.body":
    "Guardam as tuas preferências — tema, idioma, definições de notificação.",
  "cookies.analytics.title": "Análise",
  "cookies.analytics.body":
    "Estatísticas de utilização agregadas e respeitadoras da privacidade, via Plausible. Sem rastreio entre sites, sem redes publicitárias.",
  "cookies.expires.session": "Sessão",
  "cookies.expires.days30": "30 dias",
  "cookies.expires.year1": "1 ano",
  "cookies.expires.months6": "6 meses",
  "cookies.alwaysOn": "Sempre ativo",
  "cookies.columns.name": "Nome",
  "cookies.columns.expires": "Expira",
  "cookies.columns.provider": "Fornecedor",
  "cookies.noAds.title": "Não temos anúncios",
  "cookies.noAds.body":
    "Por isso não há aqui categoria de cookies de publicidade — nada a quem vender a tua atenção.",
  "cookies.summary.title": "O teu <em>resumo</em>",
  "cookies.summary.essential": "Essenciais",
  "cookies.summary.functional": "Funcionais",
  "cookies.summary.analytics": "Análise",
  "cookies.summary.on": "Ativo",
  "cookies.summary.off": "Inativo",
  "cookies.actions.save": "Guardar preferências",
  "cookies.actions.acceptAll": "Aceitar tudo",
  "cookies.actions.essentialOnly": "Só essenciais",
  "cookies.info":
    "Altera isto quando quiseres em <settingsLink>Definições</settingsLink>. Detalhe completo na <privacyLink>Política de Privacidade</privacyLink>.",
  "cookies.outro.title": "Perguntas sobre <em>os teus dados?</em>",
  "cookies.outro.sub":
    "A Política de Privacidade cobre tudo o que os cookies não cobrem.",
  "cookies.outro.cta": "Ler a Política de Privacidade",
  "cookies.toast.saved": "Preferências de cookies guardadas",

  // ── Pedido de dados (DSAR) ─────────────────────────────────────────────
  "dsar.backToPrivacyLabel": "← Política de Privacidade",
  "dsar.eyebrow": "Direitos sobre os dados",
  "dsar.h1": "Exerce os teus <em>direitos sobre os dados.</em>",
  "dsar.lead":
    "Ao abrigo do <b>RGPD</b>, podes pedir uma cópia dos teus dados, uma correção, ou a sua eliminação — <em>sem qualquer custo</em>.",
  "dsar.gdprStrip":
    "Este pedido é tratado ao abrigo dos artigos 15.º a 21.º do <b>RGPD</b>.",
  "dsar.rightLabel": "Que direito queres exercer?",
  "dsar.rights.access.label": "Direito de <em>acesso</em>",
  "dsar.rights.access.desc":
    "Obtém uma cópia de tudo o que a QueerPulse guarda sobre ti.",
  "dsar.rights.access.formTitle": "Pedir uma cópia dos teus dados",
  "dsar.rights.access.formSub":
    "Reunimos tudo o que está associado à tua conta e enviamos-te.",
  "dsar.rights.rectification.label": "Direito de retificação",
  "dsar.rights.rectification.desc":
    "Corrige informação sobre ti que esteja incorreta ou incompleta.",
  "dsar.rights.rectification.formTitle": "Pedir uma correção",
  "dsar.rights.rectification.formSub":
    "Diz-nos o que está errado e o que deve constar em vez disso.",
  "dsar.rights.erasure.label": "Direito ao <em>apagamento</em>",
  "dsar.rights.erasure.desc":
    "Pede-nos para eliminar os teus dados pessoais, dentro dos limites legais de retenção.",
  "dsar.rights.erasure.formTitle": "Pedir a eliminação dos teus dados",
  "dsar.rights.erasure.formSub":
    "Isto é diferente de eliminar a conta — diz-nos exatamente o que queres removido.",
  "dsar.rights.objection.label": "Direito de <em>oposição</em>",
  "dsar.rights.objection.desc":
    "Opõe-te a uma forma específica de usarmos os teus dados, como a análise de utilização.",
  "dsar.rights.objection.formTitle": "Opor-te a um uso dos teus dados",
  "dsar.rights.objection.formSub":
    "Diz-nos a que processamento te estás a opor.",
  "dsar.artPrefix": "Artigo {number}",
  "dsar.toast.showingForm": "A mostrar o formulário do Artigo {article}",
  "dsar.requestLabel": "Pedido:",
  "dsar.form.accountLabel": "A tua conta",
  "dsar.form.whatChanged.label": "O que precisa de mudar?",
  "dsar.form.whatChanged.helper":
    "Dá o máximo de detalhe possível — isso acelera a análise.",
  "dsar.form.whatChanged.placeholder":
    "Descreve o que deve ser corrigido, eliminado, ou a que te opões",
  "dsar.form.scopeLabel": "Que dados abrange isto?",
  "dsar.scopes.profile.b": "Perfil",
  "dsar.scopes.profile.s": "Nome, biografia, fotos, pronomes",
  "dsar.scopes.connections.b": "Ligações",
  "dsar.scopes.connections.s": "Avais, convites, a tua rede",
  "dsar.scopes.activity.b": "Atividade",
  "dsar.scopes.activity.s": "Publicações, comentários, confirmações, mensagens",
  "dsar.scopes.billing.b": "Faturação",
  "dsar.scopes.billing.s": "Escalão de adesão, histórico de pagamentos",
  "dsar.scopes.moderation.b": "Moderação",
  "dsar.scopes.moderation.s":
    "Denúncias que fizeste ou em que foste mencionade",
  "dsar.form.docs.label": "Documentos de suporte",
  "dsar.form.docs.optional": "(opcional)",
  "dsar.form.docs.helper":
    "Anexa o que ajudar a verificar ou processar o pedido — <em>nunca obrigatório</em> para submeter.",
  "dsar.form.contextLabel": "Mais alguma coisa que devamos saber?",
  "dsar.form.contextPlaceholder": "Contexto adicional para a nossa equipa",
  "dsar.legalStrip":
    "Respondemos no prazo de <b>30 dias</b>, como a lei exige. Vê <link>retenção de dados</link> para saber por quanto tempo guardamos as coisas por norma.",
  "dsar.actions.info":
    "Os pedidos são revistos por uma pessoa da nossa equipa de privacidade — <b>nunca totalmente automatizado</b>.",
  "dsar.actions.submit": "Submeter pedido",
  "dsar.past.heading": "Os teus pedidos anteriores",
  "dsar.past.submitted": "Submetido em {date}",
  "dsar.past.responded": "Respondido em {date}",
  "dsar.past.respondedWithDuration": "Respondido em {date} · {duration}",
  "dsar.past.resolved": "Resolvido",
  "dsar.past.objectAnalytics": "Oposição · Análise",
  "dsar.toast.submitted": "Pedido submetido — referência {ref}",

  // ── Diretrizes da Comunidade ───────────────────────────────────────────
  "guidelines.meta.title": "Diretrizes da Comunidade QueerPulse",
  "guidelines.meta.description":
    "A cultura que estamos a construir juntes na QueerPulse — como te mostrares, discordares bem, e manteres o espaço seguro, distinto do Código de Conduta de cumprimento obrigatório.",
  "guidelines.hero.eyebrow": "Diretrizes da Comunidade",
  "guidelines.hero.title": "A cultura que estamos a <em>construir juntes.</em>",
  "guidelines.hero.sub":
    "Não são regras de cumprimento obrigatório — isso é o Código de Conduta. Isto é como é o bom aqui.",
  "guidelines.updatedMeta": "Última revisão em {date}",
  "guidelines.clause01.titlePre": "Mostra-te como ",
  "guidelines.clause01.titleEm": "és",
  "guidelines.clause01.p1":
    "Não há código de vestir para a identidade aqui. Como quer que te apresentes hoje, já chega.",
  "guidelines.clause01.p2":
    "Isso inclui não teres a certeza, estares em dúvida, ou algures entre rótulos. Ninguém precisa de uma resposta fechada para pertencer.",
  "guidelines.clause02.titlePre": "Presume ",
  "guidelines.clause02.titleEm": "boa-fé",
  "guidelines.clause02.p1":
    "A maior parte do atrito aqui vem de mal-entendidos, não de má intenção. Pergunta antes de presumir o pior.",
  "guidelines.clause02.li1":
    "Lê uma mensagem duas vezes antes de reagir a ela.",
  "guidelines.clause02.li2":
    "Faz uma pergunta de clarificação em vez de presumir a intenção.",
  "guidelines.clause02.li3":
    "Dá espaço para alguém formular algo de forma desajeitada.",
  "guidelines.clause02.li4": "Presume que podes estar sem contexto.",
  "guidelines.clause02.li5": "Discorda do argumento, não da pessoa.",
  "guidelines.clause02.p2":
    "A boa-fé não é infinita — comportamento mau repetido deixa de merecer o benefício da dúvida.",
  "guidelines.clause03.titlePre": "Ocupa o ",
  "guidelines.clause03.titleEm": "espaço certo",
  "guidelines.clause03.p1":
    "Repara no tamanho da sala em que estás e no tamanho do espaço que estás a ocupar nela.",
  "guidelines.clause03.p2":
    "Sobretudo quem chega agora à comunidade: está tudo bem em observar antes de publicar. Não há quota a cumprir.",
  "guidelines.clause03.p3Lead": "A regra não escrita:",
  "guidelines.clause03.p3Rest":
    "se já falaste cinco vezes antes de outra pessoa falar uma, abre espaço.",
  "guidelines.clause04.titlePre": "Mantém a sala ",
  "guidelines.clause04.titleEm": "privada",
  "guidelines.clause04.p1":
    "O que se partilha num convívio, num espaço de apoio, ou numa comunidade privada, fica lá, a menos que a pessoa diga o contrário.",
  "guidelines.clause04.p2":
    "Isto inclui capturas de ecrã. Pergunta antes de partilhares algo que veio de dentro da QueerPulse.",
  "guidelines.clause05.titlePre": "Repara, não peças só ",
  "guidelines.clause05.titleEm": "desculpa",
  "guidelines.clause05.p1":
    "Um bom pedido de desculpa nomeia o que aconteceu, reconhece o impacto e muda o comportamento daí em diante.",
  "guidelines.clause05.p2":
    "“Desculpa se te sentiste assim” não é uma reparação. É uma fuga.",
  "guidelines.clause06.titlePre": "Descansar faz ",
  "guidelines.clause06.titleEm": "parte disto",
  "guidelines.clause06.p1":
    "Ninguém deve disponibilidade constante a esta comunidade. Recua quando precisares.",
  "guidelines.clause06.p2":
    "Uma comunidade saudável tem espaço para as pessoas entrarem e saírem sem explicações.",
  "guidelines.clause07.titlePre": "Conhece as ",
  "guidelines.clause07.titleEm": "linhas vermelhas",
  "guidelines.clause07.p1":
    "As Diretrizes descrevem cultura. Algumas coisas cruzam para o Código de Conduta, território de cumprimento obrigatório:",
  "guidelines.clause07.hardLinesHead":
    "Sempre uma questão do Código de Conduta",
  "guidelines.clause07.li1": "Assédio ou ataques pessoais dirigidos",
  "guidelines.clause07.li2":
    "Doxxing ou partilha da informação identificativa de alguém",
  "guidelines.clause07.li3":
    "Revelar a orientação ou identidade de alguém sem o seu consentimento",
  "guidelines.clause07.li4": "Ameaças ou intimidação",
  "guidelines.clause07.li5":
    "Partilhar conversas ou fotografias privadas sem consentimento",
  "guidelines.clause07.li6":
    "Discriminação com base em qualquer característica protegida",
  "guidelines.final.titlePre": "Mais uma ",
  "guidelines.final.titleEm": "coisa",
  "guidelines.final.p1":
    "Ninguém acerta nisto sempre. O que importa é <b>como reparas</b> quando falhas, não se falhas alguma vez.",
  "guidelines.final.p2": "Obrigade por construíres isto connosco.",
  "guidelines.outro.title": "Agora já conheces <em>a cultura.</em>",
  "guidelines.outro.sub":
    "O Código de Conduta cobre o que acontece se for violada.",
  "guidelines.outro.backCta": "Voltar ao início",

  // ── Ajuda ──────────────────────────────────────────────────────────────
  "help.meta.title": "Central de ajuda da QueerPulse: convites, segurança",
  "help.meta.description":
    "Respostas às perguntas mais comuns sobre a QueerPulse — como funcionam os convites, gerir a tua conta, confirmações e convívios, denúncias e recursos, e escalões de adesão.",
  "help.hero.eyebrow": "Ajuda",
  "help.hero.title": "Perguntas, <em>respondidas.</em>",
  "help.hero.sub": "Pesquisa abaixo, ou navega por tema.",
  "help.category.gettingStarted.label": "Começar",
  "help.category.gettingStarted.head": "Para <em>começar</em>",
  "help.category.account.label": "Conta",
  "help.category.account.head": "A tua <em>conta</em>",
  "help.category.gatherings.label": "Convívios",
  "help.category.gatherings.head": "<em>Convívios</em>",
  "help.category.safety.label": "Segurança",
  "help.category.safety.head": "<em>Segurança</em>",
  "help.category.membership.label": "Adesão",
  "help.category.membership.head": "<em>Adesão</em>",
  "help.category.technical.label": "Técnico",
  "help.category.technical.head": "<em>Técnico</em>",
  "help.qa.invite.q": "Como recebo um convite?",
  "help.qa.invite.a":
    "Alguém que já está na QueerPulse <strong>avaliza-te</strong> e envia um convite, ou podes <strong>pedir um convite</strong> e associamos-te a alguém da comunidade.",
  "help.qa.afterAccept.q": "O que acontece depois de aceitar um convite?",
  "help.qa.afterAccept.a":
    "Configuras o teu perfil e a tua conta fica ativa de imediato — sem período de espera.",
  "help.qa.lisbonOnly.q": "A QueerPulse é só para quem vive em Lisboa?",
  "help.qa.lisbonOnly.a":
    "Os convívios são em Lisboa, mas a adesão em si não está limitada por localização — muitas pessoas participam à distância pela rede e pela revista.",
  "help.qa.free.q": "A QueerPulse é gratuita?",
  "help.qa.free.a":
    "Sim — a adesão é gratuita no escalão solidário. Existem <link>escalões de Apoiante</link> pagos para quem quiser apoiar a plataforma financeiramente.",
  "help.qa.changeName.q": "Como mudo o meu nome ou pronomes?",
  "help.qa.changeName.a":
    "Vai a <settingsLink>Definições</settingsLink> → Perfil. As alterações aplicam-se em todo o lado de imediato.",
  "help.qa.privateProfile.q": "Posso tornar o meu perfil privado?",
  "help.qa.privateProfile.a":
    "Sim, em <settingsLink>Definições</settingsLink> → Privacidade. Um perfil privado continua visível para as tuas ligações — só <strong>não aparece na pesquisa nem no diretório público</strong>.",
  "help.qa.deleteAccount.q": "Como elimino a minha conta?",
  "help.qa.deleteAccount.a":
    "Em <settingsLink>Definições</settingsLink> → Conta, mais abaixo. Isto é permanente — vê a Política de Privacidade para saber o que fica retido e por quanto tempo.",
  "help.qa.levels.q":
    "O que significam os diferentes níveis de pessoa da comunidade?",
  "help.qa.levels.a":
    "Os níveis refletem há quanto tempo foste avalizade na comunidade e a tua atividade — não são uma barreira de pagamento, só um sinal de confiança.",
  "help.qa.rsvp.q": "Como funcionam as confirmações de presença?",
  "help.qa.rsvp.a":
    "Confirma na página do evento através do <calendarLink>calendário</calendarLink> ou do quadro de eventos. <strong>As vagas são limitadas</strong> na maioria dos convívios, por isso confirma cedo.",
  "help.qa.hostGathering.q": "Posso organizar o meu próprio convívio?",
  "help.qa.hostGathering.a":
    "Sim — vê o <hostLink>guia de organização</hostLink> para um passo a passo completo.",
  "help.qa.cantMakeIt.q":
    "Confirmei presença mas afinal não posso ir — o que faço?",
  "help.qa.cantMakeIt.a":
    "Cancela a tua confirmação na página do evento assim que souberes, para que alguém na lista de espera possa ficar com o teu lugar.",
  "help.qa.waitlist.q": "Como funciona a lista de espera?",
  "help.qa.waitlist.a":
    "És avisade automaticamente assim que surge uma vaga, com uma janela curta para a garantires antes de passar para a pessoa seguinte.",
  "help.qa.reportMember.q": "Como denuncio outra pessoa da comunidade?",
  "help.qa.reportMember.a":
    "No perfil dela, numa publicação ou numa mensagem, usa a opção de denúncia — toda a denúncia vai para uma pessoa moderadora.",
  "help.qa.afterReport.q": "O que acontece depois de eu fazer uma denúncia?",
  "help.qa.afterReport.a":
    "Procuramos responder em 48 horas. <strong>Tens sempre resposta</strong>, mesmo que decidamos que não é necessária qualquer ação.",
  "help.qa.appeal.q": "Posso recorrer de uma decisão de moderação?",
  "help.qa.appeal.a":
    "Sim — toda a decisão pode ser contestada uma vez, revista por uma pessoa moderadora diferente. Vê <governanceLink>Governação</governanceLink> para o processo completo.",
  "help.qa.blockMute.q": "Qual a diferença entre bloquear e silenciar?",
  "help.qa.blockMute.a":
    "<strong>Bloquear</strong> remove todo o contacto nos dois sentidos. <strong>Silenciar</strong> só esconde alguém do teu feed — a outra pessoa não sabe que aconteceu nenhum dos dois.",
  "help.qa.becomeSupporter.q": "Como me torno Apoiante?",
  "help.qa.becomeSupporter.a":
    "Visita a <membershipLink>página de Apoiante</membershipLink> para escolher um escalão — é um apoio inteiramente opcional, não um requisito para usar a plataforma.",
  "help.qa.invitesWork.q": "Quantos convites tenho?",
  "help.qa.invitesWork.a":
    "Cada pessoa começa com uma pequena reserva de convites que se renova com o tempo, consoante o crescimento da comunidade.",
  "help.qa.vouching.q": "O que significa avalizar alguém, na prática?",
  "help.qa.vouching.a":
    "Quando avalizas alguém, estás a dizer à comunidade que confias que essa pessoa deve estar aqui — é um sinal real, não uma formalidade.",
  "help.qa.perks.q": "O que ganho como Apoiante?",
  "help.qa.perks.a":
    "Acesso antecipado a eventos, um distintivo de apoiante, e a certeza de que a tua adesão mantém a plataforma sem anúncios.",
  "help.qa.emailNotifications.q": "Como controlo as notificações por email?",
  "help.qa.emailNotifications.a":
    "Em <settingsLink>Definições</settingsLink> → Notificações, ativa ou desativa cada categoria em separado.",
  "help.qa.browserSupport.q": "Que navegadores é que a QueerPulse suporta?",
  "help.qa.browserSupport.a":
    "Versões atuais do Chrome, Firefox, Safari e Edge. Navegadores mais antigos podem ter problemas de visualização.",
  "help.qa.somethingBroken.q": "Alguma coisa está avariada — o que faço?",
  "help.qa.somethingBroken.a":
    "Tenta atualizar a página primeiro. Se continuar, <contactLink>avisa-nos</contactLink> com o máximo de detalhe possível.",
  "help.stillStuck.title": "Continuas com dúvidas?",
  "help.stillStuck.body":
    "Uma pessoa a sério lê todas as mensagens que chegam por aqui.",
  "help.stillStuck.cta": "Contacta-nos",
  "help.subpageIndex.title": "Relacionado",
  "help.subpageIndex.accessibility.label": "Acessibilidade",
  "help.subpageIndex.accessibility.blurb":
    "Espaços acessíveis, adaptações e os nossos compromissos de acesso.",

  // ── Chrome partilhado (Termos / Privacidade) ──────────────────────────
  "legal.eyebrow": "Legal",
  "legal.plainSummaryTitle": "Em linguagem simples",
  "legal.toc.title": "Índice",
  "legal.contact.emailCta": "Envia-nos um email",

  // ── Anunciar o teu negócio (pills do assistente) ──────────────────────
  "listBusiness.wizard.pill.path": "Percurso",
  "listBusiness.wizard.pill.basics": "Básico",
  "listBusiness.wizard.pill.story": "História",
  "listBusiness.wizard.pill.practical": "Prático",
  "listBusiness.wizard.pill.photos": "Fotos",
  "listBusiness.wizard.pill.review": "Revisão",

  // ── Parceiros ──────────────────────────────────────────────────────────
  "partners.meta.title": "As organizações parceiras da QueerPulse",
  "partners.meta.description":
    "As organizações com quem a QueerPulse faz parceria em Portugal e mais além — cada uma avaliada quanto ao alinhamento antes de ser listada, nunca por pagamento.",
  "partners.hero.eyebrow": "Parceiros",
  "partners.hero.title": "Organizações com quem <em>estamos.</em>",
  "partners.hero.sub":
    "Parceiros avaliados em Portugal e mais além, a trabalhar lado a lado com a QueerPulse no terreno.",
  "partners.interstitial.quote":
    "Não fazemos parceria com quem quer que peça. <em>Fazemos parceria com quem já está a fazer o trabalho.</em>",
  "partners.interstitial.body":
    "Cada organização abaixo foi avaliada quanto ao alinhamento com os nossos valores antes de aqui aparecer.",
  "partners.section.title": "Os nossos <em>parceiros</em>",
  "partners.section.sub":
    "Ainda não há filtro disponível — aqui está a lista completa.",
  "partners.card.viewCta": "Ver perfil →",
  "partners.loadingMore": "A carregar mais parceiros…",
  "partners.loadMoreCta": "Carregar mais parceiros",
  "partners.why.title": "Porque fazemos <em>parcerias</em>",
  "partners.why.p1":
    "A QueerPulse não consegue fazer tudo — apoio jurídico, saúde, trabalho com jovens exigem competência dedicada que não temos internamente.",
  "partners.why.p2":
    "Fazer parcerias significa podermos encaminhar pessoas para organizações que avaliámos de facto, em vez de um resultado de pesquisa genérico.",
  "partners.why.p3":
    "Significa também que recursos reais se movem: <strong>encaminhamentos, horas de voluntariado e, nalguns casos, financiamento.</strong>",
  "partners.why.p4":
    "Nenhuma destas organizações paga para estar listada aqui.",
  "partners.become.title": "Queres <em>ser nosso parceiro?</em>",
  "partners.become.body":
    "Se a tua organização faz um trabalho alinhado em Lisboa ou arredores, gostaríamos de saber de ti.",
  "partners.become.applyCta": "Candidatar como parceiro",
  "partners.outro.title":
    "Conheces uma organização que <em>devia estar aqui?</em>",
  "partners.outro.sub":
    "Diz-nos — estamos sempre à procura de parceiros alinhados.",

  // ── Kit de Imprensa ────────────────────────────────────────────────────
  "pressKit.meta.title": "Kit de imprensa da QueerPulse: logótipos, factos",
  "pressKit.meta.description":
    "Tudo o que uma pessoa jornalista precisa para escrever sobre a QueerPulse — texto institucional já autorizado, marcas, fotografia, factos-chave e um contacto direto.",
  "pressKit.hero.eyebrow": "Imprensa",
  "pressKit.hero.title":
    "Tudo o que precisas para <em>escrever sobre nós.</em>",
  "pressKit.hero.dek":
    "Texto institucional, marcas, fotografia e factos — <b>já autorizados</b> para uso direto, sem necessidade de aprovação.",
  "pressKit.hero.downloadKitCta": "Descarregar o kit completo",
  "pressKit.hero.askPersonCta": "Falar com uma pessoa",
  "pressKit.contact.deskLabel": "<b>Contacto de imprensa:</b>",
  "pressKit.contact.phoneLabel": "<b>Por telefone</b>, a pedido",
  "pressKit.contact.responseLabel": "Respondemos em <b>48 horas</b>",
  "pressKit.contact.languagesLabel": "<b>PT / EN</b>",
  "pressKit.footerNote.licence":
    "Todos os materiais aqui são disponibilizados sob licença <a>CC BY 4.0</a> para uso editorial.",
  "pressKit.footerNote.commercial":
    "Para uso comercial, <a>contacta-nos</a> primeiro.",
  "pressKit.outro.title": "Precisas de <em>algo específico?</em>",
  "pressKit.outro.sub":
    "Contacta diretamente o gabinete de imprensa — a maioria dos pedidos tem resposta no mesmo dia.",
  "pressKit.outro.contactCta": "Enviar email ao gabinete de imprensa",
  "pressKit.downloadModal.eyebrow": "Kit completo · ZIP",
  "pressKit.downloadModal.title": "Descarrega o <em>kit completo.</em>",
  "pressKit.downloadModal.lead":
    "Tudo nesta página num único ficheiro — <b>38 MB</b>, pronto para o teu CMS.",
  "pressKit.downloadModal.buttonLabel": "Descarregar · ZIP",
  "pressKit.subpageIndex.title": "Relacionado",
  "pressKit.subpageIndex.archive.label": "Arquivo de imprensa",
  "pressKit.subpageIndex.archive.blurb":
    "Todas as menções e reportagens anteriores, num só lugar.",
  "pressKit.modal.dialogAriaLabel": "Descarregar material",
  "pressKit.modal.closeAriaLabel": "Fechar",
  "pressKit.modal.success.title": "Descarregado — <em>está tudo pronto.</em>",
  "pressKit.modal.success.body":
    "O ficheiro <b>{filename}</b> já deve estar na tua pasta de transferências.",
  "pressKit.modal.closeCta": "Fechar",
  "pressKit.modal.cancelCta": "Cancelar",
  "pressKit.readme.heading": "KIT DE IMPRENSA QUEERPULSE",
  "pressKit.readme.updated":
    "Atualizado regularmente — vê queerpulse.app/press para a versão mais recente.",
  "pressKit.readme.licenceHeading": "LICENÇA",
  "pressKit.readme.licenceBody":
    "Todos os materiais são disponibilizados sob licença CC BY 4.0 para uso editorial. Contacta press@queerpulse.app para licenciamento comercial.",
  "pressKit.readme.contentsHeading": "CONTEÚDO",
  "pressKit.readme.contents.boilerplate": "Texto institucional (3 tamanhos)",
  "pressKit.readme.contents.marks": "Marcas (SVG)",
  "pressKit.readme.contents.colour": "Sistema de cor",
  "pressKit.readme.contents.photography": "Fotografia (6 imagens)",
  "pressKit.readme.contents.spokespeople": "Porta-vozes",
  "pressKit.readme.contents.factSheet": "Ficha de factos",
  "pressKit.readme.contents.transparencyReport":
    "Relatório de transparência 2025",
  "pressKit.readme.pressDeskHeading": "GABINETE DE IMPRENSA",
  "pressKit.readme.hours": "9h–18h WET",
  "pressKit.readme.responseTime": "Respondemos em 48 horas.",
  "pressKit.readme.prototypeNote":
    "Este é um descarregável de protótipo — o ficheiro de produção corresponderá exatamente à página web.",
  "pressKit.readme.boilerHeading": "QUEERPULSE — TEXTO INSTITUCIONAL APROVADO",
  "pressKit.readme.boilerCleared":
    "Ambos os tamanhos estão autorizados para citação direta, sem necessidade de aprovação adicional.",
  "pressKit.preview.readme.title": "Leia-me + licença",
  "pressKit.preview.readme.desc": "Termos de utilização e índice de ficheiros",
  "pressKit.preview.marks.title": "Marcas · SVG",
  "pressKit.preview.marks.desc": "3 variantes, vetorial",
  "pressKit.preview.marksPng.title": "Marcas · PNG @ 2x",
  "pressKit.preview.marksPng.desc": "Para documentos e apresentações",
  "pressKit.preview.photography.title": "Fotografia",
  "pressKit.preview.photography.desc": "6 imagens com autorização de modelo",
  "pressKit.preview.boilerplate.title": "Texto institucional",
  "pressKit.preview.boilerplate.desc": "Versões curta e média",
  "pressKit.preview.factSheet.title": "Ficha de factos",
  "pressKit.preview.factSheet.desc": "PDF de uma página, pronto a imprimir",
  "pressKit.boiler.short.wc": "25 palavras · 154 carateres",
  "pressKit.boiler.short.text":
    "A QueerPulse é uma rede profissional queer com raízes em Lisboa — a ligar profissionais LGBTQ+, criatives, ativistas e pessoas da comunidade para trabalho, comunidade, cultura e entreajuda.",
  "pressKit.boiler.med.wc": "60 palavras · 408 carateres",
  "pressKit.boiler.med.text":
    "A QueerPulse é uma rede profissional queer com raízes em Lisboa, fundada em 2024. Ligamos profissionais LGBTQ+, criatives, ativistas e pessoas da comunidade para trabalho, comunidade, cultura e entreajuda. A adesão é por convite, operacionalmente protegida, e gratuita no escalão solidário. A plataforma mantém uma revista, um podcast, uma rede de espaços seguros e um fundo de microapoios distribuído pela própria comunidade.",
  "pressKit.downloads.boilerplate.title": "Texto institucional",
  "pressKit.placeholderFile.line1":
    "Este é um ficheiro de substituição gerado para o protótipo.",
  "pressKit.placeholderFile.line2":
    "O kit de produção incluirá o material real, pronto para produção.",

  // ── Política de Privacidade ────────────────────────────────────────────
  "privacy.meta.title":
    "Política de Privacidade da QueerPulse: o que recolhemos e porquê",
  "privacy.meta.description":
    "Que dados a QueerPulse recolhe, como são usados, quem os pode ver, por quanto tempo são guardados, e como exercer os teus direitos sobre dados — com um resumo em linguagem simples.",
  "privacy.title": "Política de <em>Privacidade</em>",
  "privacy.meta.effective": "Em vigor desde {date}",
  "privacy.meta.lastUpdated": "Última atualização em {date}",
  "privacy.meta.version": "Versão {version}",
  "privacy.plain.text":
    "Recolhemos o que precisamos para gerir a plataforma, nunca vendemos os teus dados, e damos-te controlo real sobre o que é partilhado e com quem. Os detalhes estão abaixo.",
  "privacy.contactCta":
    "Perguntas sobre esta política? <strong>Contacta-nos quando quiseres</strong> — respondemos em linguagem simples, não em juridiquês.",
  "privacy.related.title": "Relacionado",
  "privacy.related.dataRequestLabel": "Pedir os teus dados",
  "privacy.related.dataRequestBlurb":
    "Acede, corrige ou elimina os teus dados pessoais ao abrigo do RGPD.",
  "privacy.whoWeAre.title": "Quem somos",
  "privacy.whoWeAre.p1":
    "A QueerPulse é gerida pela Associação QueerPulse, uma entidade sem fins lucrativos registada em Portugal. Esta política explica como tratamos os teus dados pessoais em toda a plataforma.",
  "privacy.whoWeAre.p2":
    "Se algo aqui não estiver claro, contacta-nos diretamente — preferimos explicar a deixar-te adivinhar.",
  "privacy.whatWeCollect.title": "O que recolhemos",
  "privacy.whatWeCollect.accountHeading": "Informação da conta",
  "privacy.whatWeCollect.account.item1":
    "<strong>Detalhes do perfil</strong> que forneces — nome, pronomes, biografia, fotos.",
  "privacy.whatWeCollect.account.item2":
    "<strong>Informação de contacto</strong> — o teu email, usado para sessão e notificações.",
  "privacy.whatWeCollect.account.item3":
    "<strong>Dados de adesão</strong> — o teu escalão, data de entrada, e quem te avalizou.",
  "privacy.whatWeCollect.account.item4":
    "<strong>Informação de faturação</strong>, para pessoas Apoiantes — tratada pelo nosso processador de pagamentos, nunca guardada nos nossos servidores.",
  "privacy.whatWeCollect.activityHeading": "Dados de atividade",
  "privacy.whatWeCollect.activity.item1":
    "<strong>Publicações, comentários e mensagens</strong> que envias na plataforma.",
  "privacy.whatWeCollect.activity.item2":
    "<strong>Confirmações e presenças em eventos</strong>, para os convívios poderem planear-se conforme o número de pessoas.",
  "privacy.whatWeCollect.activity.item3":
    "<strong>Dados básicos de utilização</strong> — páginas visitadas, funcionalidades usadas — agregados e anonimizados para análise.",
  "privacy.whatWeCollect.notCollectedHeading": "O que não recolhemos",
  "privacy.whatWeCollect.notCollectedBody":
    "Não te rastreamos noutros sites, não vendemos dados a anunciantes, nem construímos um perfil publicitário sobre ti. Não há aqui rede publicitária para alimentar.",
  "privacy.howWeUse.title": "Como usamos os dados",
  "privacy.howWeUse.intro": "Os teus dados só são usados para:",
  "privacy.howWeUse.item1": "Gerir a tua conta e manter a tua sessão segura",
  "privacy.howWeUse.item2":
    "Mostrar-te convívios e conteúdo relevantes para ti",
  "privacy.howWeUse.item3": "Processar pagamentos de adesão e de Apoiante",
  "privacy.howWeUse.item4":
    "Manter a plataforma segura — investigar denúncias, aplicar o Código de Conduta",
  "privacy.howWeUse.item5": "Enviar-te notificações que ativaste",
  "privacy.howWeUse.item6":
    "Perceber a utilização agregada, para melhorar o produto",
  "privacy.howWeUse.p1":
    "Nunca usamos os teus dados para treinar modelos de IA de terceiros nem para os vender a anunciantes.",
  "privacy.whoSees.title": "Quem vê os teus dados",
  "privacy.whoSees.p1":
    "<strong>Outras pessoas da comunidade</strong> veem o que as tuas definições de privacidade permitirem — o teu perfil público, publicações, e o que escolheres partilhar.",
  "privacy.whoSees.p2":
    "<strong>A nossa pequena equipa</strong> pode aceder a dados da conta para dar apoio, investigar denúncias e manter a plataforma a funcionar.",
  "privacy.whoSees.p3":
    "<strong>Fornecedores de serviços</strong> — o nosso alojamento, email e processadores de pagamento — veem só o necessário para a sua função específica, ao abrigo de contrato.",
  "privacy.whoSees.p4":
    "<strong>Mais ninguém.</strong> Nunca vendemos nem alugamos os teus dados a terceiros.",
  "privacy.retention.title": "Por quanto tempo guardamos",
  "privacy.retention.p1":
    "Os dados da conta são guardados enquanto a tua conta estiver ativa.",
  "privacy.retention.p2":
    "Se eliminares a tua conta, a maioria dos dados pessoais é removida em 30 dias, exceto quando somos legalmente obrigados a retê-los (por exemplo, registos de faturação).",
  "privacy.retention.p3":
    "Os dados de presença em convívios são eliminados 30 dias após o evento, segundo a nossa política de dados de convívios.",
  "privacy.yourRights.title": "Os teus direitos",
  "privacy.yourRights.intro": "Ao abrigo do RGPD, tens direito a:",
  "privacy.yourRights.item1":
    "<strong>Acesso</strong> — obter uma cópia de tudo o que guardamos sobre ti",
  "privacy.yourRights.item2":
    "<strong>Retificação</strong> — corrigir o que estiver errado",
  "privacy.yourRights.item3":
    "<strong>Apagamento</strong> — pedir-nos para eliminar os teus dados",
  "privacy.yourRights.item4":
    "<strong>Oposição</strong> — opor-te a um uso específico dos teus dados",
  "privacy.yourRights.item5":
    "<strong>Portabilidade</strong> — receber os teus dados num formato portátil",
  "privacy.yourRights.item6":
    "<strong>Limitação</strong> — limitar como processamos os teus dados enquanto um litígio é resolvido",
  "privacy.yourRights.p1":
    "Para exerceres qualquer um destes direitos, usa o nosso formulário de pedido de dados — é gratuito e respondemos no prazo de 30 dias.",
  "privacy.yourRights.p2":
    "Também podes apresentar uma reclamação junto da Comissão Nacional de Proteção de Dados (CNPD), a autoridade portuguesa de proteção de dados.",
  "privacy.cookiesSection.title": "Cookies",
  "privacy.cookiesSection.p1":
    "Usamos um pequeno número de cookies para te manter com sessão iniciada, lembrar as tuas preferências e perceber a utilização agregada.",
  "privacy.cookiesSection.p2":
    "Não usamos cookies de publicidade nem de rastreio entre sites — não há aqui rede publicitária para alimentar.",
  "privacy.cookiesSection.p3":
    "Consulta a <strong>Política de Cookies</strong> completa para a lista integral, e <em>gere as tuas preferências</em> quando quiseres.",
  "privacy.thirdParties.title": "Terceiros",
  "privacy.thirdParties.intro":
    "Trabalhamos com um pequeno número de fornecedores de serviços, cada um vinculado por contrato a usar os teus dados apenas para o serviço que presta:",
  "privacy.thirdParties.item1":
    "<strong>Alojamento</strong> — onde a plataforma funciona",
  "privacy.thirdParties.item2":
    "<strong>Envio de email</strong> — para notificações e emails de conta",
  "privacy.thirdParties.item3":
    "<strong>Processamento de pagamentos</strong> — para adesões de Apoiante, sem nunca tocar diretamente nos dados do teu cartão",
  "privacy.thirdParties.optInIntro":
    "Com o teu <strong>consentimento explícito</strong>, também usamos:",
  "privacy.thirdParties.optItem1":
    "<strong>Plausible Analytics</strong> — estatísticas de utilização respeitadoras da privacidade, com poucos cookies",
  "privacy.thirdParties.optItem2":
    "<strong>Integrações de calendário</strong> — se escolheres sincronizar eventos com o Google Calendar ou o Apple Calendar",
  "privacy.thirdParties.outro":
    "Nunca partilhamos os teus dados com corretores de dados nem redes publicitárias.",
  "privacy.changes.title": "Alterações a esta política",
  "privacy.changes.p1":
    "Avisamos as pessoas da comunidade sobre alterações relevantes por email e por aviso na aplicação, antes de entrarem em vigor.",
  "privacy.changes.p2":
    "Clarificações menores podem ser publicadas sem aviso prévio — o número de versão e a data no topo desta página refletem sempre o texto atual.",
  "privacy.contactSection.title": "Contacto",
  "privacy.contactSection.body":
    "Perguntas sobre esta política ou sobre os teus dados? Envia um email para <a>privacy@queerpulse.pt</a> e uma pessoa a sério responde.",

  // ── Termos de Serviço ──────────────────────────────────────────────────
  "terms.meta.title": "Termos de Serviço da QueerPulse",
  "terms.meta.description":
    "As regras para usar a QueerPulse — elegibilidade, conduta na conta, propriedade de conteúdo, participação em eventos, e o que acontece se os termos forem violados.",
  "terms.title": "Termos de <em>Serviço</em>",
  "terms.meta.effective": "Em vigor desde {date}",
  "terms.meta.lastUpdated": "Última atualização em {date}",
  "terms.meta.version": "Versão {version}",
  "terms.plain.text":
    "Sê quem és, trata bem as outras pessoas, e não uses a QueerPulse para fazer mal a ninguém. Os termos completos estão abaixo.",
  "terms.contactCta":
    "Perguntas sobre estes termos? <strong>Contacta-nos quando quiseres.</strong>",
  "terms.eligibility.title": "Elegibilidade",
  "terms.eligibility.p1":
    "A QueerPulse está aberta a qualquer pessoa com 18 anos ou mais que seja convidada ou avalizada pela comunidade.",
  "terms.eligibility.p2":
    "Ao entrares, confirmas que <strong>a informação no teu perfil é exata</strong>, tanto quanto sabes.",
  "terms.eligibility.p3":
    "Reservamo-nos o direito de recusar ou remover a adesão de quem não cumprir estes termos.",
  "terms.account.title": "A tua conta",
  "terms.account.p1":
    "És responsável por manter as tuas credenciais de acesso seguras e por toda a atividade na tua conta.",
  "terms.account.p2":
    "Avisa-nos de imediato se suspeitares de acesso não autorizado à tua conta.",
  "terms.account.p3":
    "Podes eliminar a tua conta a qualquer momento em Definições; vê a nossa Política de Privacidade para saber o que fica retido depois.",
  "terms.conduct.title": "Conduta",
  "terms.conduct.intro": "Ao usares a QueerPulse, aceitas não:",
  "terms.conduct.item1":
    "Assediar, ameaçar ou intimidar outras pessoas da comunidade",
  "terms.conduct.item2":
    "Partilhar informação privada de alguém sem o seu consentimento",
  "terms.conduct.item3": "Fazer-te passar por outra pessoa ou organização",
  "terms.conduct.item4":
    "Usar a plataforma para promoção comercial não solicitada",
  "terms.conduct.item5":
    "Tentar contornar a nossa segurança ou controlos de acesso",
  "terms.conduct.item6": "Violar o Código de Conduta de qualquer outra forma",
  "terms.conduct.highlight":
    "As violações podem resultar num aviso, suspensão ou remoção, segundo a escada de aplicação do nosso Código de Conduta.",
  "terms.content.title": "Conteúdo",
  "terms.content.p1":
    "Manténs a titularidade de tudo o que publicas. Ao publicares, concedes à QueerPulse uma <strong>licença limitada</strong> para o mostrar na plataforma.",
  "terms.content.p2":
    "És responsável pelo conteúdo que partilhas e confirmas que tens o direito de o partilhar.",
  "terms.content.p3":
    "Podemos remover conteúdo que viole o Código de Conduta ou estes termos.",
  "terms.content.magazineHeading": "Revista e submissões criativas",
  "terms.content.magazineBody":
    "Aplicam-se termos adicionais a propostas para a revista e submissões criativas — vê as diretrizes de submissão quando propuseres algo.",
  "terms.events.title": "Convívios e eventos",
  "terms.events.p1":
    "Os convívios são organizados por pessoas da comunidade e pela QueerPulse; cada um tem os seus próprios termos de presença e cancelamento, indicados na página do evento.",
  "terms.events.p2":
    "Os preços dos bilhetes em eventos de escala progressiva são definidos por quem organiza, dentro dos escalões exigidos pela plataforma — a QueerPulse não fica com nenhuma percentagem da receita dos bilhetes.",
  "terms.events.p3":
    "Espera-se que sigas o Código de Conduta e quaisquer regras específicas do espaço em cada convívio.",
  "terms.events.p4":
    "Quem organiza pode remover participantes que violem o Código de Conduta no seu evento, ao seu critério.",
  "terms.termination.title": "Cessação",
  "terms.termination.intro": "Podemos suspender ou encerrar a tua conta se:",
  "terms.termination.item1": "Violares o Código de Conduta ou estes termos",
  "terms.termination.item2":
    "Forneceres informação falsa durante o registo ou verificação",
  "terms.termination.item3":
    "Tiveres um comportamento que ponha outras pessoas da comunidade em risco",
  "terms.termination.p1":
    "Sempre que possível, avisamos-te do motivo e damos-te a oportunidade de recorrer, segundo o processo de recurso do nosso Código de Conduta.",
  "terms.termination.p2":
    "Também podes encerrar a tua conta voluntariamente, a qualquer momento.",
  "terms.liability.title": "Responsabilidade",
  "terms.liability.p1":
    "A QueerPulse é fornecida “tal como está”. Trabalhamos para a manter a funcionar bem, mas não podemos garantir que esteja sempre disponível ou sem erros.",
  "terms.liability.p2":
    "Não somos responsáveis pela conduta das pessoas nos convívios, embora levemos as denúncias a sério e ajamos sobre elas.",
  "terms.liability.p3":
    "Na medida permitida por lei, a nossa responsabilidade limita-se ao montante que nos pagaste nos últimos 12 meses, se algum.",
  "terms.liability.highlight":
    "Nada nestes termos limita a responsabilidade por algo que não possa legalmente ser limitado, incluindo negligência grave ou conduta dolosa.",
  "terms.changesTerms.title": "Alterações a estes termos",
  "terms.changesTerms.p1":
    "Avisamos as pessoas da comunidade sobre alterações relevantes por email e por aviso na aplicação, antes de entrarem em vigor.",
  "terms.changesTerms.p2":
    "Continuar a usar a QueerPulse depois de as alterações entrarem em vigor significa que aceitas os termos atualizados.",
  "terms.law.title": "Lei aplicável",
  "terms.law.p1": "Estes termos regem-se pela lei portuguesa.",
  "terms.law.p2":
    "Quaisquer litígios serão resolvidos nos tribunais de Lisboa, Portugal, salvo se a lei local de proteção do consumidor exigir o contrário.",
  "terms.contactSection.title": "Contacto",
  "terms.contactSection.body":
    "Perguntas sobre estes termos? Envia um email para <a>hello@queerpulse.pt</a> e uma pessoa a sério responde.",

  // ── Kit de Imprensa — secções da página ───────────────────────────────
  // Os títulos/fontes da cobertura são peças de imprensa reais (palavras de
  // outras pessoas) e ficam em inglês; o chrome à volta é traduzido.
  "pressKit.boiler.section.title":
    "Texto institucional · <em>livre para reutilizar</em>",
  "pressKit.boiler.section.lead":
    "Três tamanhos, todos aprovados para citação direta sem necessidade de aprovação adicional. Clica em <b>copiar</b> para pores uma versão limpa na área de transferência.",
  "pressKit.boiler.copyCta": "Copiar",
  "pressKit.boiler.copiedCta": "Copiado",
  "pressKit.boiler.short.label": "25 palavras · para cabeçalhos, introduções",
  "pressKit.boiler.med.label":
    "60 palavras · para comunicados, biografias curtas",
  "pressKit.boiler.long.label":
    "130 palavras · para reportagens longas, secções “sobre”",
  "pressKit.boiler.long.wc": "130 palavras",
  "pressKit.boiler.long.text":
    "A QueerPulse é uma rede profissional queer sediada em Lisboa, fundada em 2024 por oito pessoas da comunidade na sala das traseiras do Café Beirão. É gerida pela Associação QueerPulse, uma entidade sem fins lucrativos registada em Portugal (NIPC 517 426 884), e sustentada por adesões de Apoiante, doações pontuais e três apoios a programas. A adesão é por convite avalizado. A plataforma mantém uma revista, um podcast (The Back Room), uma rede verificada de espaços seguros por toda a Lisboa, um fundo de microapoios distribuído em 14 dias por um círculo rotativo da comunidade, e uma parceria operacional com uma organização nacional de direitos LGBTQ+ para apoio jurídico e encaminhamento de linhas de apoio. Os relatórios anuais de transparência são auditados de forma independente e publicados publicamente.",
  "pressKit.mark.section.title": "A <em>marca</em> e como usá-la",
  "pressKit.mark.section.lead":
    "Três variantes aprovadas. O logótipo leva sempre o ponto de pulso coral — exceto na variante inversa “coral”, onde o ponto passa a ameixa. Não recolores o ponto para mais nada.",
  "pressKit.mark.logo.light.meta":
    "<b>Principal · clara</b> · para fundos creme/brancos",
  "pressKit.mark.logo.plum.meta":
    "<b>Inversa · ameixa</b> · para fundos escuros",
  "pressKit.mark.logo.coral.meta":
    "<b>Coral · solidariedade</b> · usar com parcimónia · contextos de orgulho",
  "pressKit.mark.downloadLinkLabel": "SVG · PNG",
  "pressKit.mark.modal.eyebrow": "Marca · SVG",
  "pressKit.mark.modal.title": "A <em>marca</em>, pronta a usar.",
  "pressKit.mark.modal.lead":
    "Pré-visualiza a variante {variant} abaixo. Descarregar gera um ficheiro <b>.svg</b> real e limpo — vetorial, seguro para recolorir, com o ponto de pulso intacto.",
  "pressKit.mark.modal.buttonLabel": "Descarregar · SVG",
  "pressKit.mark.usageNote":
    "<b>Espaçamento:</b> deixa sempre a altura de um <em>P</em> inteiro de espaço livre à volta da marca. <b>Tamanho mínimo:</b> 88px de largura no ecrã, 18 mm em impressão. <b>Não:</b> estiques, recolores, coloques sobre fotografias carregadas, nem juntes a gradientes arco-íris que não fizemos.",
  "pressKit.colour.section.title": "Cor, <em>sistema completo</em>",
  "pressKit.colour.section.lead":
    "Toda a marca assenta em quatro tons. Não introduzimos cores de destaque adicionais — incluindo as específicas de campanhas.",
  "pressKit.colour.plum.meta": "Âncora da marca · títulos, superfícies escuras",
  "pressKit.colour.coral.meta":
    "Destaque · CTAs, ênfase em itálico, o ponto de pulso",
  "pressKit.colour.cream.meta": "Fundo da página · nunca branco puro",
  "pressKit.colour.jade.meta": "Verificado · ao vivo · sucesso",
  "pressKit.photography.section.title": "<em>Fotografia</em> autorizada",
  "pressKit.photography.section.lead":
    "Seis imagens, com autorização de modelo e pré-autorizadas para uso editorial. Crédito: <em>fotografias de André Bento para a QueerPulse</em>. Resolução: 3000 × 2000 px JPG.",
  "pressKit.photography.image1": "01 · Pessoas fundadoras no Café Beirão",
  "pressKit.photography.image2": "02 · Noite de clínica aberta, a decorrer",
  "pressKit.photography.image3": "03 · A revista impressa, em leque",
  "pressKit.photography.image4": "04 · Escritório do Trans Hub · Mouraria",
  "pressKit.photography.image5": "05 · Um convívio · Atelier Pulso",
  "pressKit.photography.image6": "06 · Detalhe do mapa · espaços seguros",
  "pressKit.team.section.title": "<em>Porta-vozes</em> identificades",
  "pressKit.team.section.lead":
    "Três pessoas fundadoras estão disponíveis para comentário à imprensa. Cita-as sobre os temas indicados; não parafraseies. <em>As restantes pessoas da comunidade não estão disponíveis sem consentimento explícito</em> — por favor não as contactes diretamente através da plataforma.",
  "pressKit.team.marta.role": "Cofundadora · Editora-chefe",
  "pressKit.team.marta.desc":
    "Para: decisões editoriais, a revista, governação, o manifesto. <em>Não para: histórias individuais de pessoas da comunidade, decisões de moderação.</em>",
  "pressKit.team.marta.langs":
    "<b>EN · PT · ES</b> · disponível com 48h de antecedência",
  "pressKit.team.catarina.role": "Cofundadora · Cotesoureira · Trans Hub",
  "pressKit.team.catarina.desc":
    "Para: cuidados de saúde trans-afirmativos, finanças, transparência, entreajuda, parceria de apoio jurídico.",
  "pressKit.team.catarina.langs":
    "<b>EN · PT</b> · disponível com 24h de antecedência",
  "pressKit.team.andre.role": "Cofundador · Cotesoureiro · Design",
  "pressKit.team.andre.desc":
    "Para: design da plataforma, decisões técnicas, parcerias, infraestrutura. Fotógrafo das imagens internas.",
  "pressKit.team.andre.langs":
    "<b>EN · PT</b> · disponível com 72h de antecedência",
  "pressKit.facts.section.title": "<em>Factos</em> rápidos · a {date}",
  "pressKit.facts.section.lead":
    "Fonte: relatório de transparência de 2025. <em>Por favor liga à página de transparência quando citares.</em>",
  "pressKit.facts.founded": "Fundada · Lisboa",
  "pressKit.facts.activeMembers": "Pessoas ativas no final de 2025",
  "pressKit.facts.toPrograms": "De cada euro vai para programas",
  "pressKit.facts.totalRaised": "Total angariado em 2025",
  "pressKit.facts.gatherings": "Convívios realizados em 2025",
  "pressKit.facts.microGrants": "Microapoios distribuídos em 2025",
  "pressKit.facts.safeSpaces": "Espaços seguros verificados em Lisboa",
  "pressKit.facts.magazineIssues": "Edições da revista até hoje",
  "pressKit.facts.transNonBinary": "Pessoas trans / não-bináries",
  "pressKit.coverage.section.title": "<em>Cobertura</em> recente",
  "pressKit.coverage.section.lead":
    "Peças selecionadas em inglês e português, de 2024 a 2026. <em>Contagens de visitas são bem-vindas mas não necessárias</em> — liga antes à página de Imprensa.",
  "pressKit.coverage.openingToast": "A abrir a peça em {source}…",
  "pressKit.downloads.section.title": "<em>Descarregáveis</em>",
  "pressKit.downloads.section.lead":
    "Links diretos para os ficheiros. O kit completo é um ZIP de 38 MB com tudo o que está abaixo; os ficheiros individuais são mais pequenos.",
  "pressKit.downloads.completeKit.title": "Kit de imprensa completo",
  "pressKit.downloads.completeKit.desc":
    "Marcas, fotografia, texto institucional, ficha de factos · 38 MB",
  "pressKit.downloads.marksSvg.title": "Marcas · pacote SVG",
  "pressKit.downloads.marksSvg.desc":
    "3 variantes · autorizadas para uso editorial · 18 KB",
  "pressKit.downloads.marksPng.title": "Marcas · PNG @ 2x",
  "pressKit.downloads.marksPng.desc":
    "Para documentos, apresentações, web · 8 MB",
  "pressKit.downloads.photography.title": "Fotografia · 6 imagens",
  "pressKit.downloads.photography.desc":
    "3000 × 2000 px · com autorização de modelo · 24 MB",
  "pressKit.downloads.factSheet.title": "Ficha de factos",
  "pressKit.downloads.factSheet.desc":
    "Uma página, pronta a imprimir · versões EN e PT · 380 KB",
  "pressKit.downloads.transparency.title": "Relatório de transparência 2025",
  "pressKit.downloads.transparency.desc": "84 páginas · auditado · 4,2 MB",
  "pressKit.downloads.boilerplate.desc": "Versões curta e média",
  "pressKit.downloads.modal.eyebrow": "Descarregar · {format}",
  "pressKit.downloads.modal.lead":
    "{desc}. Descarregar gera agora um <b>{filename}</b> real no teu navegador — um substituto funcional do material de produção.",
  "pressKit.downloads.modal.buttonLabel": "Descarregar · {format}",

  // ── Anunciar o teu negócio — assistente ───────────────────────────────
  // As etiquetas das listas de opções só se resolvem com `t()` no render; o
  // rascunho guardado mantém o id canónico em inglês, por isso mudar de
  // idioma nunca reescreve dados já introduzidos.
  "listBusiness.hero.backCta": "Voltar ao diretório",
  "listBusiness.hero.eyebrow": "O diretório · adicionar um lugar",
  "listBusiness.hero.title":
    "Adiciona o teu lugar ao <em>diretório das pessoas.</em>",
  "listBusiness.hero.lead":
    "Queer-owned ou queer-friendly, grande ou pequenino — se o teu lugar é bom para a nossa gente, pertence aqui. Conta-nos e a equipa da comunidade trata do resto. <b>Cada anúncio é lido por uma pessoa antes de ficar no ar.</b>",
  "listBusiness.wizard.stepAria": "Passo {number}: {label}",
  "listBusiness.wizard.stepAriaDone": "Passo {number}: {label} (concluído)",
  "listBusiness.wizard.stepAriaCurrent": "Passo {number}: {label} (atual)",
  "listBusiness.wizard.draftSaved": "Rascunho guardado",
  "listBusiness.draftBanner.text":
    "<b>Tens um rascunho guardado.</b> Continuar de onde ficaste?",
  "listBusiness.draftBanner.startFresh": "Começar de novo",
  "listBusiness.draftBanner.resume": "Retomar rascunho",
  "listBusiness.paneActions.back": "← Voltar",
  "listBusiness.paneActions.cancel": "Cancelar",
  "listBusiness.paneActions.neededLabel": "Faltam algumas coisas",
  "listBusiness.paneActions.jumpToAria": "Ir para {label}",
  "listBusiness.paneActions.blockedTitle":
    "Preenche os campos obrigatórios para continuar",
  "listBusiness.next.basics": "A seguir: o básico →",
  "listBusiness.next.story": "A seguir: a história →",
  "listBusiness.next.practical": "A seguir: o prático →",
  "listBusiness.next.photos": "A seguir: fotos e tu →",
  "listBusiness.next.review": "Rever o teu anúncio →",
  "listBusiness.next.send": "Enviar à equipa →",
  "listBusiness.next.continue": "Continuar →",
  "listBusiness.sending": "A enviar o teu lugar à equipa…",
  "listBusiness.toast.submitted":
    "O teu anúncio está com a equipa da comunidade",
  "listBusiness.toast.submitError":
    "Não conseguimos enviar o teu espaço agora. Os teus dados ficaram guardados — tenta de novo.",
  "listBusiness.toast.withdrawn": "Anúncio retirado",
  // Passo 0 — percurso
  "listBusiness.step0.title": "Como é que",
  "listBusiness.step0.em": "conheces este lugar?",
  "listBusiness.step0.sub":
    "Ambos os percursos são bem-vindos, e ambos passam pela mesma revisão da comunidade. Só muda um par de perguntas mais à frente.",
  "listBusiness.step0.pathAria": "A tua relação com o lugar",
  "listBusiness.step0.claim.title": "Sou eu que giro este lugar",
  "listBusiness.step0.claim.desc":
    "És dono, lideras, ou trabalhas aqui. Vamos pedir-te para verificares a propriedade, para o diretório continuar de confiança.",
  "listBusiness.step0.suggest.title": "Estou a sugerir um lugar de que gosto",
  "listBusiness.step0.suggest.desc":
    "Um sítio que tem sido bom para ti. A equipa vai contactar quem o gere antes de ficar no ar.",
  "listBusiness.step0.verifyLabel":
    "Como devemos verificar que geres este lugar?",
  "listBusiness.step0.verifyHelp":
    "É isto que mantém o diretório de confiança. Escolhe o que for mais fácil para ti.",
  "listBusiness.step0.signedInAs":
    "Tens sessão iniciada como <b>{name}</b> — vamos associar esta submissão ao teu perfil para a equipa saber a quem agradecer (e a quem perguntar, se for preciso).",
  // Opções de verificação
  "listBusiness.verify.email.label": "Email do negócio",
  "listBusiness.verify.email.desc":
    "Enviamos um código para um endereço do teu domínio.",
  "listBusiness.verify.email.badge": "Mais rápido",
  "listBusiness.verify.instagram.label": "Instagram",
  "listBusiness.verify.instagram.desc":
    "Confirma com uma mensagem direta da conta indicada.",
  "listBusiness.verify.instagram.badge": "Fácil",
  "listBusiness.verify.post.label": "Postal para a morada",
  "listBusiness.verify.post.desc":
    "À moda antiga. O código chega em 3 a 5 dias.",
  "listBusiness.verify.post.badge": "3–5 dias",
  "listBusiness.verify.later.label": "Verificar depois da revisão",
  "listBusiness.verify.later.desc":
    "A equipa verifica contigo diretamente, de pessoa para pessoa.",
  "listBusiness.verify.later.badge": "Humano",
  // Passo 1 — básico
  "listBusiness.step1.title": "Começa com",
  "listBusiness.step1.em": "o básico.",
  "listBusiness.step1.sub":
    "O suficiente para pôr o teu lugar no mapa. No passo seguinte podes fazê-lo brilhar.",
  "listBusiness.step1.nameLabel": "Como se chama?",
  "listBusiness.step1.nameHelper": "O nome tal como as pessoas o procurariam.",
  "listBusiness.step1.namePlaceholder": "ex.: Café Beirão",
  "listBusiness.step1.dupHead":
    "Talvez já exista um lugar com este nome no diretório:",
  "listBusiness.step1.catsLabel": "Que tipo de lugar é? — escolhe até 2",
  "listBusiness.step1.catsAria": "Categoria",
  "listBusiness.step1.hoodLabel": "Que bairro?",
  "listBusiness.step1.hoodPlaceholder": "Escolhe um bairro de Lisboa…",
  "listBusiness.step1.badgeLabel": "Quem o gere?",
  "listBusiness.step1.badgeHelper":
    "Queer-owned, ou um lugar que nos acolhe genuinamente? Ambos pertencem aqui — isto é um acolhimento, não um portão.",
  "listBusiness.step1.badgeAria": "Propriedade",
  "listBusiness.step1.owned.tag": "Queer-owned",
  "listBusiness.step1.owned.title": "Gerido ou liderado pela nossa comunidade",
  "listBusiness.step1.owned.desc":
    "Tu, quem partilha a propriedade contigo, ou a liderança são LGBTQ+.",
  "listBusiness.step1.friendly.tag": "LGBTQ+ friendly",
  "listBusiness.step1.friendly.title": "Um lugar que nos acolhe",
  "listBusiness.step1.friendly.desc":
    "Não é queer-owned, mas é ativamente seguro e afirmativo.",
  "listBusiness.step1.evidenceLabel":
    "Só um toque leve — em que sentido é queer-owned?",
  "listBusiness.step1.evidenceHelp":
    "Sem documentos. Só uma frase que quem revê possa confirmar. É isto que mantém o distintivo com significado.",
  "listBusiness.step1.evidencePlaceholder":
    "ex.: Propriedade partilhada entre mim (Sandra, ela/dela) e o Rui (ele/dele) desde 2019",
  "listBusiness.step1.priceLabel": "Mais ou menos, que preço?",
  "listBusiness.step1.priceAria": "Escalão de preço",
  "listBusiness.step1.blurbLabel": "A frase única",
  "listBusiness.step1.blurbHelper":
    "É o texto do teu cartão no diretório. Uma frase, simples e calorosa.",
  "listBusiness.step1.blurbPlaceholder":
    "Uma pastelaria queer de dia, sala da comunidade à noite.",
  // Categorias
  "listBusiness.cat.foodDrink": "Comer e beber",
  "listBusiness.cat.designCraft": "Design e ofícios",
  "listBusiness.cat.healthCare": "Saúde e cuidados",
  "listBusiness.cat.spaces": "Espaços",
  "listBusiness.cat.culture": "Cultura",
  "listBusiness.cat.tech": "Tecnologia",
  "listBusiness.cat.barbershopSalon": "Barbearia e cabeleireiro",
  "listBusiness.cat.gymFitness": "Ginásio e desporto",
  // Escalões de preço
  "listBusiness.price.free": "Gratuito",
  "listBusiness.price.affordable": "Acessível",
  "listBusiness.price.midRange": "Intermédio",
  "listBusiness.price.higherEnd": "Mais caro",
  // Passo 2 — história
  "listBusiness.step2.title": "Agora,",
  "listBusiness.step2.em": "a história.",
  "listBusiness.step2.sub":
    "É isto que preenche a tua página de detalhe. Escreve como descreverias o lugar a alguém que acabou de chegar à cidade.",
  "listBusiness.step2.taglineLabel": "Lema",
  "listBusiness.step2.taglineHelper":
    "Uma única linha, mostrada em grande e em itálico no topo da tua página. <em>Faz dela o coração do lugar.</em>",
  "listBusiness.step2.taglinePlaceholder":
    "Ninguém é tratado no género errado. A sala das traseiras é sempre tua.",
  "listBusiness.step2.witLabel": "O que é, na prática",
  "listBusiness.step2.witHelper":
    "Duas a quatro linhas curtas. As coisas que gostarias que alguém soubesse ao entrar.",
  "listBusiness.step2.witFirstPlaceholder":
    "ex.: Galão, pastéis, dois pratos do dia",
  "listBusiness.step2.witMorePlaceholder":
    "Mais uma coisa que vale a pena saber",
  "listBusiness.step2.witRemoveAria": "Remover linha",
  "listBusiness.step2.witAdd": "Adicionar outra linha",
  "listBusiness.step2.tagsLabel":
    "Etiquetas — palavras por que as pessoas possam filtrar",
  "listBusiness.step2.tagsPlaceholder": "ex.: Acessível a cadeiras de rodas",
  "listBusiness.step2.tagsAddCta": "Adicionar",
  "listBusiness.step2.tagRemoveAria": "Remover {tag}",
  "listBusiness.step2.goodForLabel": "Bom para… — marca o que for verdade",
  "listBusiness.step2.goodForHelper":
    "As pequenas coisas que dizem à nossa gente que está segura e é bem-vinda.",
  "listBusiness.step2.goodForAria": "Bom para",
  "listBusiness.step2.langsLabel": "Idiomas falados — opcional",
  "listBusiness.step2.langsAria": "Idiomas",
  // Opções "bom para"
  "listBusiness.goodFor.wheelchairAccessible": "Acessível a cadeiras de rodas",
  "listBusiness.goodFor.genderNeutralToilets": "Casas de banho neutras",
  "listBusiness.goodFor.stepFreeEntrance": "Entrada sem degraus",
  "listBusiness.goodFor.walkInsWelcome": "Sem marcação necessária",
  "listBusiness.goodFor.quietLowSensory":
    "Horas calmas, de baixo estímulo sensorial",
  "listBusiness.goodFor.soloFriendly": "Bom para ir sozinhe",
  "listBusiness.goodFor.dogFriendly": "Aceita cães",
  "listBusiness.goodFor.hostsCommunityEvents": "Acolhe eventos da comunidade",
  "listBusiness.goodFor.budgetFriendly": "Amigo da carteira",
  "listBusiness.goodFor.accessibleBathroom": "Casa de banho acessível",
  // Idiomas (os endónimos ficam iguais; só "Outro" e a glosa de LGP traduzem)
  "listBusiness.lang.portugues": "Português",
  "listBusiness.lang.english": "English",
  "listBusiness.lang.espanol": "Español",
  "listBusiness.lang.francais": "Français",
  "listBusiness.lang.lgp": "LGP (gestual)",
  "listBusiness.lang.other": "Outro",
  // Passo 3 — prático
  "listBusiness.step3.title": "O",
  "listBusiness.step3.em": "prático",
  "listBusiness.step3.sub":
    "Como as pessoas te encontram, quando estás aberto, e onde te contactar. Partilha só o que quiseres público.",
  "listBusiness.step3.addressLabel": "Morada",
  "listBusiness.step3.addressHelper":
    "Rua e número chega — colocamos o pino a partir daí.",
  "listBusiness.step3.addressPlaceholder":
    "R. Antero de Quental 26, 1170-024 Lisboa",
  "listBusiness.step3.mapLinkLabel": "Link do Google Maps",
  "listBusiness.step3.mapLinkHelper":
    "Abre o teu espaço no Google Maps, toca em Partilhar e cola o link — colocamos o pino por ti.",
  "listBusiness.step3.mapLinkPlaceholder": "https://maps.app.goo.gl/…",
  "listBusiness.step3.findOnMap": "Encontrar no mapa",
  "listBusiness.step3.resolving": "A localizar…",
  "listBusiness.step3.resolveError":
    "Não conseguimos ler esse link. Cola um link de um local do Google Maps e tenta de novo.",
  "listBusiness.step3.unsupportedLinkDemo":
    "No modo demo, cola o link completo google.com/maps/… — os links curtos precisam do site em produção.",
  "listBusiness.step3.pinPlaced": "Pino colocado perto de {place}",
  "listBusiness.step3.usePlaceName": "Usar “{place}” como morada",
  "listBusiness.step3.mapAria": "Mapa — arrasta o pino para definir o local exato.",
  "listBusiness.step3.hoursHeading": "Horário de funcionamento *",
  "listBusiness.step3.hasOpenHours": "Tem horas de abertura",
  "listBusiness.step3.allClosed": "Tudo fechado",
  "listBusiness.step3.copyMonday": "Copiar segunda-feira para todos os dias",
  "listBusiness.step3.markAllClosed": "Marcar tudo como fechado",
  "listBusiness.step3.open": "Aberto",
  "listBusiness.step3.closed": "Fechado",
  "listBusiness.step3.opensAria": "{day} — abertura",
  "listBusiness.step3.closesAria": "{day} — fecho",
  "listBusiness.step3.hoursNoteLabel":
    "Uma nota curta sobre o horário — opcional",
  "listBusiness.step3.hoursNotePlaceholder":
    "Fechado à segunda. A sala das traseiras reserva-se à parte.",
  "listBusiness.step3.onlineHeading": "Encontrar-te online",
  "listBusiness.step3.onlineHint":
    "És tu que escolhes o que é público. Deixa em branco o que preferires manter fora do anúncio.",
  "listBusiness.social.instagram.placeholder": "Instagram · @nome",
  "listBusiness.social.website.placeholder": "Site · oteulugar.pt",
  "listBusiness.social.website.err": "Isso não parece um endereço web.",
  "listBusiness.social.email.placeholder": "Email · ola@oteulugar.pt",
  "listBusiness.social.email.err": "Isso não parece um email.",
  "listBusiness.social.phone.placeholder": "Telefone · +351 …",
  "listBusiness.social.phone.err": "Isso não parece um número de telefone.",
  // Dias
  "listBusiness.day.mon": "Segunda-feira",
  "listBusiness.day.tue": "Terça-feira",
  "listBusiness.day.wed": "Quarta-feira",
  "listBusiness.day.thu": "Quinta-feira",
  "listBusiness.day.fri": "Sexta-feira",
  "listBusiness.day.sat": "Sábado",
  "listBusiness.day.sun": "Domingo",
  // Passo 4 — fotos e tu
  "listBusiness.step4.title": "Fotos, e",
  "listBusiness.step4.em": "um pouco sobre ti.",
  "listBusiness.step4.sub":
    "As imagens ajudam as pessoas a sentir a sala antes de chegarem. E gostamos de saber quem está por trás da porta.",
  "listBusiness.step4.photosLabel": "Algumas fotos — opcional",
  "listBusiness.step4.photosHelper":
    "Horizontal funciona melhor · idealmente ≥1200px de largura · menos de 5MB cada · sem gráficos carregados de texto.",
  "listBusiness.step4.gallery.wide": "Plano geral do espaço",
  "listBusiness.step4.gallery.detail": "Um detalhe",
  "listBusiness.step4.gallery.vibe": "Pessoas / ambiente",
  "listBusiness.step4.alt.wide": "Plano geral · texto alternativo",
  "listBusiness.step4.alt.d1": "Detalhe 1 · texto alternativo",
  "listBusiness.step4.alt.d2": "Detalhe 2 · texto alternativo",
  "listBusiness.step4.alt.vibe": "Ambiente · texto alternativo",
  "listBusiness.step4.altPlaceholder":
    "Descreve para quem é cega ou tem baixa visão",
  "listBusiness.step4.photo.upload": "Carregar",
  "listBusiness.step4.photo.change": "Trocar",
  "listBusiness.step4.photo.uploading": "A carregar…",
  "listBusiness.step4.photo.remove": "Remover foto",
  "listBusiness.step4.photo.urlPlaceholder": "ou cola o link de uma imagem",
  "listBusiness.step4.photo.urlInvalid": "Isto não parece o link de uma imagem",
  "listBusiness.step4.photo.uploadError":
    "Não foi possível carregar essa imagem — tenta novamente",
  "listBusiness.step4.aboutYouHeading": "Um pouco sobre ti",
  "listBusiness.step4.relLabel": "A tua ligação ao lugar",
  "listBusiness.step4.relAria": "A tua ligação",
  "listBusiness.step4.ownerNameLabel": "O teu nome",
  "listBusiness.step4.ownerNamePlaceholder": "ex.: Sandra Lopes",
  "listBusiness.step4.ownerRoleLabel": "O teu papel",
  "listBusiness.step4.ownerRolePlaceholder": "ex.: Dona e padeira",
  "listBusiness.step4.ownerBioLabel": "Uma linha ou duas sobre ti — opcional",
  "listBusiness.step4.ownerBioPlaceholder":
    "Pegámos numa pastelaria com 60 anos em 2019 e reconstruímo-la à volta de uma regra: toda a gente é bem-vinda, exatamente como é.",
  "listBusiness.step4.visLabel": "Quem pode ver o teu nome?",
  "listBusiness.step4.visAria": "Visibilidade do nome",
  "listBusiness.step4.linkProfileLabel": "Ligar ao teu perfil? — opcional",
  "listBusiness.step4.linkProfileTitle": "Mostrar que sou da QueerPulse",
  "listBusiness.step4.linkProfileDesc":
    "Põe um rosto familiar e verificado no anúncio. Tens sessão iniciada como {name}.",
  "listBusiness.step4.linkProfileToggleLabel": "Ligar ao perfil",
  "listBusiness.step4.loopHeading": "Manteres-te a par",
  "listBusiness.step4.contactEmailLabel": "O teu email de contacto",
  "listBusiness.step4.contactEmailHelper":
    "Para ti, que submetes — fica privado, nunca aparece no anúncio.",
  "listBusiness.step4.contactEmailPlaceholder":
    "Para te podermos contactar sobre este anúncio",
  "listBusiness.step4.notifyLabel": "Envia-me email quando… — opcional",
  "listBusiness.step4.consent":
    "És tu que controlas o que é público. <b>Os contactos que deixares em branco ficam fora do anúncio.</b> Queres o teu nome privado? Escolhe “só o papel” ou “anónime” acima — não há problema nenhum.",
  // Opções de ligação
  "listBusiness.rel.own.label": "Sou dono ou codono",
  "listBusiness.rel.own.desc": "És quem tem a propriedade.",
  "listBusiness.rel.run.label": "Faço a gestão ou ajudo a gerir",
  "listBusiness.rel.run.desc": "No dia a dia, é em parte teu.",
  "listBusiness.rel.work.label": "Trabalho aqui",
  "listBusiness.rel.work.desc":
    "Equipa, com a bênção de quem gere para anunciar.",
  "listBusiness.rel.regular.label": "Sou cliente habitual e adoro",
  "listBusiness.rel.regular.desc":
    "A sugerir um lugar que tem sido bom para ti.",
  // Opções de visibilidade
  "listBusiness.vis.public.label": "O meu nome e o meu papel",
  "listBusiness.vis.public.desc": "Ambos aparecem no anúncio.",
  "listBusiness.vis.role.label": "Só o meu papel",
  "listBusiness.vis.role.desc": "“Dono”, mas sem nome.",
  "listBusiness.vis.anon.label": "Manter-me anónime",
  "listBusiness.vis.anon.desc": "Visível só para a equipa da comunidade.",
  // Opções de notificação
  "listBusiness.notify.live.label": "Ficar no ar",
  "listBusiness.notify.question.label": "A equipa tiver uma pergunta",
  "listBusiness.notify.news.label": "Houver novidades ocasionais do diretório",
  // Passo 5 — revisão
  "listBusiness.step5.title": "Uma última vista de olhos",
  "listBusiness.step5.em": "antes de ir para a equipa.",
  "listBusiness.step5.sub":
    "Aqui está tudo o que nos contaste. Edita qualquer parte voltando atrás — nada fica fechado até enviares.",
  "listBusiness.step5.slugLabel": "O teu anúncio vai viver em",
  "listBusiness.step5.editCta": "Editar",
  "listBusiness.step5.notAdded": "Por preencher",
  "listBusiness.step5.group.pathPlace": "Tu e o lugar",
  "listBusiness.step5.group.basics": "Básico",
  "listBusiness.step5.group.story": "História",
  "listBusiness.step5.group.practical": "Prático",
  "listBusiness.step5.group.photosYou": "Fotos e tu",
  "listBusiness.step5.row.listingAs": "A anunciar como",
  "listBusiness.step5.row.verification": "Verificação",
  "listBusiness.step5.row.name": "Nome",
  "listBusiness.step5.row.category": "Categoria",
  "listBusiness.step5.row.neighbourhood": "Bairro",
  "listBusiness.step5.row.ownership": "Propriedade",
  "listBusiness.step5.row.price": "Preço",
  "listBusiness.step5.row.oneLiner": "Frase única",
  "listBusiness.step5.row.tagline": "Lema",
  "listBusiness.step5.row.whatItIs": "O que é",
  "listBusiness.step5.row.tags": "Etiquetas",
  "listBusiness.step5.row.goodFor": "Bom para",
  "listBusiness.step5.row.languages": "Idiomas",
  "listBusiness.step5.row.address": "Morada",
  "listBusiness.step5.row.hours": "Horário",
  "listBusiness.step5.row.online": "Online",
  "listBusiness.step5.row.you": "Tu",
  "listBusiness.step5.row.nameShown": "Nome mostrado",
  "listBusiness.step5.listingAs.claim": "Sou eu que giro este lugar",
  "listBusiness.step5.listingAs.suggest": "A sugerir um lugar de que gosto",
  "listBusiness.step5.nameShown.public": "O meu nome e o meu papel",
  "listBusiness.step5.nameShown.role": "Só o meu papel",
  "listBusiness.step5.nameShown.anon": "Anónime",
  "listBusiness.step5.online.instagram": "Instagram",
  "listBusiness.step5.online.website": "Site",
  "listBusiness.step5.online.email": "Email",
  "listBusiness.step5.online.phone": "Telefone",
  "listBusiness.step5.vouchLine":
    "<b>Avalizado por ti, {name}.</b> O teu nome vai junto para a equipa saber que há alguém de confiança por trás disto. Depois de ficar no ar, outras pessoas podem juntar o seu aval.",
  "listBusiness.step5.beforeSendHeading": "Antes de enviares",
  "listBusiness.step5.consentOuting.title":
    "Percebo que este anúncio vai ser público e pesquisável.",
  "listBusiness.step5.consentOuting.sub":
    "Anunciar um lugar como queer-owned, com um nome associado, é uma divulgação pública. Escolhi acima o que fica visível e estou de acordo com isso andar pelo mundo.",
  "listBusiness.step5.consentGuide.title":
    "Está tudo aqui correto, tanto quanto sei.",
  "listBusiness.step5.consentGuide.sub":
    "Li as diretrizes da comunidade e como os meus dados são usados.",
  "listBusiness.step5.submitNote":
    "<b>Uma pessoa revê cada anúncio.</b> É isto que mantém o diretório verificado pela comunidade — nada é publicado automaticamente. Lemo-lo em poucos dias e enviamos-te um email quando ficar no ar (ou se tivermos uma pergunta). Podes editá-lo ou retirá-lo a qualquer momento até lá.",
  // Painel de sucesso
  "listBusiness.success.stage.review": "Em revisão",
  "listBusiness.success.stage.question": "Pergunta rápida",
  "listBusiness.success.stage.live": "No ar no diretório",
  "listBusiness.success.title.review.text": "Já está com",
  "listBusiness.success.title.review.em": "a comunidade.",
  "listBusiness.success.title.question.text": "Só",
  "listBusiness.success.title.question.em": "uma coisinha.",
  "listBusiness.success.title.live.text": "Estás",
  "listBusiness.success.title.live.em": "no mapa.",
  "listBusiness.success.note.review":
    "Agradecemos o contributo para o diretório. <b>Uma pessoa a sério da equipa da comunidade lê cada anúncio</b> antes de ficar no ar — é essa a promessa por trás do nosso distintivo de verificação pela comunidade. Revemos em <b>poucos dias</b> e enviamos-te um email assim que estiver no ar.",
  "listBusiness.success.note.question":
    "<b>A equipa tem uma pequena pergunta</b> antes de ficar no ar — vê o teu email. Não se passa nada de errado; basta uma resposta rápida e segue tudo em frente.",
  "listBusiness.success.note.live":
    "<b>Já está no ar no diretório.</b> O teu lugar já pode ser encontrado pela comunidade. Agradecemos por tornares o mapa um bocadinho mais completo.",
  "listBusiness.success.fallbackName": "O teu lugar",
  "listBusiness.success.withdrawConfirm":
    "Retirar <b>{name}</b>? Isto tira-o da revisão — podes sempre anunciá-lo outra vez mais tarde.",
  "listBusiness.success.withdrawFallbackName": "este anúncio",
  "listBusiness.success.keepIt": "Manter",
  "listBusiness.success.yesWithdraw": "Sim, retirar",
  "listBusiness.success.backToDirectory": "Voltar ao diretório",
  "listBusiness.success.viewOnProfile": "Ver no teu perfil →",
  "listBusiness.success.editSubmission": "Editar submissão",
  "listBusiness.success.listAnother": "Anunciar outro lugar",
  "listBusiness.success.withdraw": "Retirar",
  "listBusiness.success.reference":
    "Referência · <b>{ref}</b>  ·  guarda-a algures",
  // Etiquetas dos chips de "o que falta"
  "listBusiness.missing.path": "como conheces o lugar",
  "listBusiness.missing.verify": "uma forma de verificar",
  "listBusiness.missing.name": "um nome",
  "listBusiness.missing.cats": "uma categoria",
  "listBusiness.missing.hood": "um bairro",
  "listBusiness.missing.badge": "quem o gere",
  "listBusiness.missing.price": "um escalão de preço",
  "listBusiness.missing.blurb": "a frase única",
  "listBusiness.missing.tagline": "um lema",
  "listBusiness.missing.whatItIs": "o que é",
  "listBusiness.missing.address": "uma morada",
  "listBusiness.missing.pin": "um pino no mapa",
  "listBusiness.missing.hours": "o horário",
  "listBusiness.missing.social": "links de contacto válidos",
  "listBusiness.missing.rel": "a tua ligação",
  "listBusiness.missing.ownerName": "o teu nome",
  "listBusiness.missing.ownerRole": "o teu papel",
  "listBusiness.missing.contactEmail": "um email de contacto",
  "listBusiness.missing.consent": "as duas confirmações",
  // Coluna de pré-visualização ao vivo
  "listBusiness.preview.head":
    "Pré-visualização ao vivo · atualiza enquanto escreves",
  "listBusiness.preview.placeholderName": "O teu lugar",
  "listBusiness.preview.placeholderMeta": "Categoria · bairro",
  "listBusiness.preview.placeholderBlurb":
    "O teu lugar vai aparecer aqui à medida que preencheres o formulário — exatamente como ficará na grelha do diretório.",
  "listBusiness.preview.placeholderTagline":
    "O teu lema torna-se a citação em destaque no topo da tua página.",
  "listBusiness.preview.whatItIs": "O que é",
  "listBusiness.preview.goodFor": "Bom para",
  "listBusiness.preview.languages": "Idiomas",
  "listBusiness.preview.hours": "Horário",
  "listBusiness.preview.roleShown": "Papel visível · nome privado",
  "listBusiness.preview.yourRole": "O teu papel",
  "listBusiness.preview.fullCta": "Pré-visualizar a página completa →",
  "listBusiness.preview.fullDisabledTitle":
    "Indica primeiro um nome para pré-visualizares a página completa",
  "listBusiness.preview.foot":
    "Isto é uma pré-visualização. O teu anúncio só fica no ar depois de a equipa da comunidade o rever.",
  // Modal de pré-visualização da página completa
  "listBusiness.fullPreview.eyebrow": "Pré-visualização da página completa",
  "listBusiness.fullPreview.sub":
    "É assim que o teu anúncio vai ficar no diretório depois de a equipa o aprovar.",
  "listBusiness.fullPreview.whatItIs": "O que é",
  "listBusiness.fullPreview.goodFor": "Bom para",
  "listBusiness.fullPreview.goodToKnow": "Bom saber",
  "listBusiness.fullPreview.hours": "Horário de funcionamento",
  "listBusiness.fullPreview.findIt": "Onde fica",
  "listBusiness.fullPreview.whoRunsIt": "Quem o gere",
  "listBusiness.fullPreview.instagramPrefix": "Instagram · {handle}",

  "listBusiness.edit.title": "Editar o teu anúncio",
  "listBusiness.edit.saveCta": "Guardar alterações",
  "listBusiness.edit.saving": "A guardar as alterações…",
  "listBusiness.edit.saved": "O teu anúncio foi atualizado.",
  "listBusiness.edit.saveError":
    "Não conseguimos guardar as alterações. Tenta de novo.",
  "listBusiness.edit.discardConfirm":
    "Descartar as alterações não guardadas a este anúncio?",
  "listBusiness.edit.notAllowed":
    "Só podes editar um anúncio que tenhas submetido.",

  // ── Etiqueta partilhada de regresso ao hub (secção Governação) ─────────
  "hub.governanceLabel": "Governação",

  // ── Relatório de Transparência — chrome da página. Os valores em euros,
  //    a repartição do orçamento, as linhas de moderação, os pedidos
  //    governamentais, os erros nomeados e as estatísticas de governação
  //    são os números auditados reais do ano — ficam em inglês; ver o
  //    relatório da varredura.
  "transparency.meta.title": "Relatório de transparência de 2025 da QueerPulse",
  "transparency.meta.description":
    "O relatório de transparência auditado de 2025 da QueerPulse — de onde vieram e para onde foram os 278.400 €, ações de moderação, pedidos governamentais e os erros que assumimos.",
  "transparency.tabs.money": "Dinheiro",
  "transparency.tabs.people": "Pessoas",
  "transparency.tabs.moderation": "Moderação",
  "transparency.tabs.requests": "Pedidos governamentais",
  "transparency.tabs.mistakes": "Erros",
  "transparency.tabs.governance": "Como se decide",
  "transparency.hero.eyebrow": "Relatório anual de transparência · 2025",
  "transparency.hero.title":
    "Cada <em>euro,</em> cada <em>moderação,</em> cada <em>erro.</em>",
  "transparency.hero.dek":
    "Os números por trás da QueerPulse em 2025 — finanças, ações de moderação, pedidos governamentais, e o que fizemos mal. <em>Publicado pela Associação QueerPulse</em> a 14 de maio de 2026, após revisão independente pela Dra. Helena Faria (auditora).",
  "transparency.hero.meta.raised": "Total angariado",
  "transparency.hero.meta.toPrograms": "Para programas",
  "transparency.hero.meta.activeMembers": "Pessoas ativas",
  "transparency.hero.meta.mistakesNamed": "Erros públicos nomeados",
  "transparency.yearSwitch.inProgress": "em curso",
  "transparency.live.title": "O nosso primeiro relatório de transparência está quase a chegar",
  "transparency.live.description":
    "Vamos publicar aqui os números auditados — de onde veio e para onde foi o dinheiro, ações de moderação, pedidos governamentais e os erros que assumimos — assim que fechar o nosso primeiro período de reporte.",
  "transparency.money.title":
    "De onde <em>veio</em> o dinheiro, e para onde <em>foi.</em>",
  "transparency.money.sub":
    "Todos os valores em euros, ano civil de 2025. Contas auditadas por um auditor independente (sem relação com a organização), disponíveis a pedido como CSV detalhado.",
  "transparency.money.sourcesHeading": "De onde vieram os 278 400 €",
  "transparency.money.spentLabel":
    "Gasto em 2025 · 96,1% das receitas · 10 980 € de excedente transitado para reservas",
  "transparency.people.title": "As <em>pessoas</em> por trás dos números.",
  "transparency.people.sub":
    "Pessoas no fim do ano, crescimento, quem realmente aparece. Não celebramos números grandes — só os certos.",
  "transparency.moderation.title": "Moderação, <em>em números.</em>",
  "transparency.moderation.sub":
    "O que foi denunciado, sobre o que agimos, e quanto tempo demorou. Toda a ação fica registada; o registo completo e anonimizado está disponível a qualquer pessoa da comunidade que o peça.",
  "transparency.moderation.colReason": "Motivo da ação de moderação",
  "transparency.moderation.colCount": "Contagem",
  "transparency.moderation.colYoy": "Face ao ano anterior",
  "transparency.moderation.colPct": "% do total",
  "transparency.moderation.breakdown":
    "Repartição das ações: <b>96 publicações/comentários removidos</b>, <b>52 avisos emitidos</b>, <b>23 suspensões temporárias</b> (mediana de 7 dias), <b>9 remoções permanentes</b>, <b>4 casos encaminhados para a ILGA</b> para tratamento legal.",
  "transparency.requests.title":
    "Pedidos <em>governamentais e legais</em> de dados de pessoas da comunidade.",
  "transparency.requests.sub":
    "Todos os pedidos que recebemos de qualquer entidade governamental ou legal em 2025. Cumprimos ordens judiciais portuguesas válidas. <em>Não cumprimos pedidos informais.</em>",
  "transparency.mistakes.title": "Coisas que fizemos <em>mal</em> em 2025.",
  "transparency.mistakes.sub":
    "Publicado porque queremos que esta secção seja a parte mais fácil de escrever no relatório do próximo ano. <em>Nomear os nossos próprios erros é o preço de sermos dignos de confiança.</em>",
  "transparency.governance.title": "Como se <em>tomaram</em> as decisões.",
  "transparency.governance.sub":
    "Atas de reunião aborrecidas são a base da confiança. Eis como a governação da QueerPulse funcionou de facto em 2025.",
  "transparency.governance.seeMore":
    "Para as atas completas, a constituição, o acordo de Apoiante, e o organograma formal, consulta Governação.",
  "transparency.signoff.title":
    "Assinado de <em>boa-fé,</em> e pronto para perguntas.",
  "transparency.signoff.body":
    "Este relatório foi preparado por Catarina Vaz e André Bento, revisto pela Assembleia no seu todo, e auditado de forma independente pela Dra. Helena Faria da Faria Auditoria. <em>Os erros são nossos.</em> Perguntas, correções ou preocupações: <a>transparency@queerpulse.app</a> — uma pessoa a sério lê tudo no espaço de 48 horas.",
  "transparency.signoff.role.catarina":
    "Co-tesouraria · redigiu finanças + erros",
  "transparency.signoff.role.andre":
    "Co-tesouraria · redigiu moderação + governação",
  "transparency.signoff.role.auditor": "Auditora independente",
  "transparency.signoff.downloadPdf": "Descarregar PDF (84 páginas)",
  "transparency.signoff.downloadCsv": "Descarregar CSV em bruto",

  // ── Registo de alterações — chrome da página. As 18 entradas datadas
  //    (título/corpo/tag) são notas de lançamento históricas — ficam em
  //    inglês por causa do volume; sinalizado no relatório em vez de feito
  //    à pressa.
  "changelog.hero.backLabel": "Roteiro",
  "changelog.hero.eyebrow": "Registo de alterações da plataforma",
  "changelog.hero.title": "O que <em>mudou,</em>",
  "changelog.hero.titleLine2": "e quando.",
  "changelog.hero.sub":
    "Todas as atualizações da QueerPulse, da mais recente para a mais antiga. Publicamos as alterações aqui para saberes sempre o que é diferente e porquê. Nada acontece sem ficar registado.",
  "changelog.filterAria": "Filtrar atualizações por tipo",
  "changelog.filter.all": "Tudo",
  "changelog.filter.feature": "Funcionalidades",
  "changelog.filter.improvement": "Melhorias",
  "changelog.filter.infrastructure": "Infraestrutura",
  "changelog.filter.fix": "Correções",
  "changelog.badge.feature": "Funcionalidade",
  "changelog.badge.improvement": "Melhoria",
  "changelog.badge.infrastructure": "Infraestrutura",
  "changelog.badge.fix": "Correção",
  "changelog.tag.settings": "Definições de notificações →",
  "changelog.tag.messages": "Abrir mensagens →",
  "changelog.tag.communities": "Ver comunidades →",
  "changelog.tag.subprofiles": "Ver subperfis →",
  "changelog.tag.housing": "Ver habitação →",
  "changelog.tag.directory": "Abrir o diretório →",
  "changelog.tag.cinema": "Visitar o Cinema →",
  "changelog.tag.forum": "Visitar o fórum →",
  "changelog.tag.profile": "Abrir o seu perfil →",
  "changelog.tag.gatherings": "Ver encontros →",
  "changelog.tag.members": "Conhecer os membros →",
  "changelog.tag.events": "Abrir o Events Hub →",
  "changelog.tag.roadmap": "Abrir o roteiro →",

  "changelog.entries.community-roadmap.title":
    "O roteiro é agora feito contigo",
  "changelog.entries.community-roadmap.body":
    "Vê o que já foi lançado, o que está em construção e o que está planeado — depois vota no que mais importa para ti, ou submete a tua própria ideia. Lemos todas as sugestões; a equipa cura o que avança no roteiro.",

  "changelog.entries.listing-photos.title": "Fotos na tua ficha de negócio",
  "changelog.entries.listing-photos.body":
    "O formulário de registo de negócio já aceita fotos — carrega um ficheiro ou cola o link de uma imagem e vê em tempo real como a tua ficha vai ficar antes de publicar.",

  "changelog.entries.business-page-live.title": "As páginas de negócios ganham vida",
  "changelog.entries.business-page-live.body":
    "Cada página de negócio mostra agora as fotografias reais do espaço numa galeria que podes abrir em ecrã inteiro, além do horário de funcionamento real com um estado “Aberto agora / Encerrado” em tempo real — para saberes o aspeto de um lugar e se está aberto antes de ir.",

  "changelog.entries.directory-filters-upgrade.title":
    "O diretório de negócios ficou muito mais fácil de filtrar",
  "changelog.entries.directory-filters-upgrade.body":
    "Encontrar um lugar ficou mais suave. A pesquisa olha para descrições e etiquetas, não só para os nomes; cada categoria mostra uma contagem ao vivo; podes ordenar A–Z ou por bairro; e os filtros ficam no link, por isso um diretório filtrado é partilhável e sobrevive a um refresh. Escolher um ambiente já não faz desaparecer todos os negócios, os filtros ativos aparecem como chips removíveis com um Limpar tudo, os resultados vazios explicam-se, e o mapa é mais fácil de usar no telemóvel.",
  "changelog.entries.public-profile-badge.title":
    "O \"Ficar público\" agora vive no teu perfil",
  "changelog.entries.public-profile-badge.body":
    "O controlo de perfil público passou para um selo discreto ao lado do teu nome — toca nele para veres como os perfis públicos se desbloqueiam, ou para ativares o teu quando fores elegível. Só aparece no teu próprio perfil.",

  "changelog.entries.here-for-hero.title": "\"Aqui para\" agora abre o teu perfil",
  "changelog.entries.here-for-hero.body":
    "O teu \"Aqui para\" — o que procuras na QueerPulse — está agora logo no topo do perfil, ao lado do nome e da bio, em vez de mais abaixo na página. Mais fácil de ver à primeira vista, e continua tão fácil manter privado, se for essa a tua escolha.",

  "changelog.entries.directory-view-switcher.title": "Uma troca Lista / Mapa mais clara",
  "changelog.entries.directory-view-switcher.body":
    "Alternar entre a lista e o mapa no diretório de negócios ficou mais fácil de encontrar. Os dois botões passaram a ser um único seletor com etiquetas e ícones, ao lado da contagem de resultados — para se ler claramente como \"escolher uma vista\" e não como mais um filtro, mantendo-se compacto e fácil de tocar no telemóvel.",

  "changelog.entries.profile-links-fix.title": "Links de perfil que se comportam",
  "changelog.entries.profile-links-fix.body":
    "Adicionar links sociais ao teu perfil ficou mais suave. Um nome de utilizador simples, como o teu handle do Instagram, é aceite tal como está — acabou o aviso \"isto não parece um link válido\" quando claramente é — e as linhas já não se desmontam quando aparece uma dica; o campo mantém-se no sítio e a dica fica bem alinhada por baixo.",

  "changelog.entries.subprofiles-showcase.title": "Um \"Também a trabalhar como\" mais rico",
  "changelog.entries.subprofiles-showcase.body":
    "Os outros lados do teu trabalho mostram agora mais de quem és — trabalho em destaque, links, disponibilidade e o número de seguidores e endossos, tudo no cartão. No telemóvel é uma vista de um só toque, pensada para um ecrã mais pequeno, e se és dono das personas tens badges de visibilidade e uma forma rápida de editar direto da vitrine.",

  "changelog.entries.real-directory-map.title": "Um mapa a sério em cada página do diretório",
  "changelog.entries.real-directory-map.body":
    "Abre um negócio ou espaço no diretório e a localização passa a aparecer num mapa real e interativo — o mesmo mapa quente de Lisboa que já conheces da vista de mapa e de quando registas um negócio — marcado no ponto exato onde o dono o colocou. O antigo mapa decorativo desapareceu.",

  "changelog.entries.reply-threads.title": "Responde a qualquer comentário no fórum",
  "changelog.entries.reply-threads.body":
    "As respostas passam agora a poder ter as suas próprias respostas. Responde diretamente a qualquer comentário e a tua entra logo ali por baixo, para as conversas longas se ramificarem em vez de se amontoarem numa lista só. As conversas mais profundas recolhem-se numa única linha — toca para expandir quando quiseres ver o resto.",

  "changelog.entries.copy-subprofile.title": "Duplica um perfil já existente",
  "changelog.entries.copy-subprofile.body":
    "A criar um subperfil novo? Duplica um que já tenhas — leva tudo contigo, ou só o conteúdo — e ajusta a partir daí.",

  "changelog.entries.smoother-chat.title": "Chat mais suave e reativo",
  "changelog.entries.smoother-chat.body":
    "As mensagens passam a parecer mais rápidas e serenas em qualquer dispositivo. Escrever já não faz a conversa tremer, o deslizar-para-responder acompanha o teu dedo, e as mensagens novas assentam no lugar em vez de a conversa toda animar de uma vez. No telemóvel, manter uma mensagem premida abre as ações de forma limpa (sem lutar com o menu de seleção de texto), o chat preenche o ecrã como uma só superfície sem a página a saltar por trás, e os toques dão resposta imediata, com uma leve vibração ao premir sem soltar.",

  "changelog.entries.invite-state-page.title": "Página de convite mais clara",
  "changelog.entries.invite-state-page.body":
    "Quando uma ligação de convite não pode ser usada, a página passa a mostrar o convite real — quem te avalizou e quando expirou — em vez de uma mensagem genérica. Também distingue um convite que expirou, um que já foi usado e um que foi retirado, e encaminha-te para o passo certo em cada caso.",

  "changelog.entries.chat-shortcuts.title": "Atalhos de menção no chat",
  "changelog.entries.chat-shortcuts.body":
    "Um novo botão “?” no compositor de mensagens mostra todos os atalhos de menção de relance — @ para um membro, c/ para uma comunidade, # para um tópico, b/ para um negócio, e/ para um evento, t/ para um tópico do fórum. Toca num deles e o símbolo é inserido logo na tua mensagem, abrindo as sugestões enquanto escreves. E, para não sobrecarregar o ecrã, só há um popover aberto de cada vez no compositor.",

  "changelog.entries.events-hub.title": "Uma casa só para os eventos",
  "changelog.entries.events-hub.body":
    "Eventos, Encontros e Calendário são agora um único Events Hub — Destaques, Explorar e um calendário completo juntos, com fotos reais do que aí vem. Os mesmos eventos, mais fáceis de encontrar.",

  "changelog.entries.gifs-in-chat.title": "Envia GIFs no chat",
  "changelog.entries.gifs-in-chat.body":
    "Diz-lo com um GIF. Há um novo botão de GIF no compositor de mensagens — procura ou vê o que está em tendência, toca num e ele segue direto para a conversa (tanto em DMs como em grupos). Com tecnologia KLIPY e filtro de conteúdo seguro ativado por predefinição.",

  "changelog.entries.privacy-and-speed.title":
    "Mais privacidade e uma app mais ágil",
  "changelog.entries.privacy-and-speed.body":
    "Uma ronda de privacidade, velocidade e mensagens. As personas e subperfis que definiu como privados passam a manter-se totalmente privados, e as pessoas que bloqueou deixam de aparecer no diretório de colegas de casa. Editar ou apagar uma mensagem passa a atualizar de imediato, sem aquele piscar de recarregamento. E a própria aplicação está mais leve, por isso as páginas — e as imagens que o recebem no topo — carregam um pouco mais depressa.",

  "changelog.entries.leaner-prerendering.title":
    "Compilações do site mais leves e rápidas",
  "changelog.entries.leaner-prerendering.body":
    "Nos bastidores: passamos a pré-gerar apenas a página pública essencial para os motores de busca, em vez do site inteiro, e deixamos de criar uma cópia separada de cada perfil. As compilações usam menos dados e mantêm-se rápidas, e os motores de busca continuam a encontrar todas as páginas públicas através do mapa do site. Não é preciso fazer nada.",

  "changelog.entries.admin-governance-real-data.title":
    "Painéis de governança agora com dados reais",
  "changelog.entries.admin-governance-real-data.body":
    "A área de governança de administração — os valores financeiros e o gráfico trimestral, o registo de decisões e o histórico de moderação — passa a ler dados reais da plataforma em vez de valores fixos, para que a equipa veja as finanças e o histórico de moderação reais da comunidade.",

  "changelog.entries.sign-in-fix.title": "Iniciar sessão volta a funcionar",
  "changelog.entries.sign-in-fix.body":
    "Uma incompatibilidade entre a aplicação e o servidor impedia o início de sessão de concluir. Já está corrigido — iniciar sessão, terminar sessão e manter-se ligado voltam a funcionar sem problemas.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Mais fácil de tocar, mais fácil de navegar",
  "changelog.entries.accessibility-mobile-polish.body":
    "Os botões pequenos passam a ter áreas de toque maiores no telemóvel, as ações que só apareciam ao passar o rato podem ser alcançadas com o teclado, e os formulários de compra e de candidatura suportam preenchimento automático do nome e do email.",
  "changelog.entries.platform-hardening.title": "Reforços nos bastidores",
  "changelog.entries.platform-hardening.body":
    "Nos bastidores: a API passa a ser versionada com documentação publicada, as listas longas ficam limitadas com segurança para as páginas se manterem rápidas, e as denúncias ganham proteção contra spam. Não é preciso fazer nada — fica tudo simplesmente rápido e estável.",
  "changelog.entries.composer-reaction-polish.title":
    "Caixa de mensagem mais ampla e reações mais arrumadas",
  "changelog.entries.composer-reaction-polish.body":
    "A caixa de mensagem passa agora a ocupar toda a largura do compositor e, no telemóvel, fica encostada sem uma barra de deslocação a mais quando a mensagem é curta — crescendo apenas à medida que escreve. As reações também passam a comportar-se como deve ser: tocar num emoji com que já reagiu remove-o, em vez de empilhar o mesmo vezes sem conta.",
  "changelog.entries.chat-mentions.title": "Mencione pessoas e lugares no chat",
  "changelog.entries.chat-mentions.body":
    "Escreva @ para um membro, ou c/ b/ e/ t/ # para uma comunidade, negócio, encontro, tópico de fórum ou tema — escolha das sugestões e vira uma ligação tocável, numa mensagem direta ou num grupo. Funciona enquanto escreve e enquanto edita uma mensagem. As suas conversas continuam privadas: as menções apenas ligam, nunca notificam ninguém.",
  "changelog.entries.group-chats.title": "Conversas de grupo",
  "changelog.entries.group-chats.body":
    "Crie um grupo com as pessoas que quer lá dentro, dê-lhe um nome e mostre quem é quem. Os administradores podem adicionar ou remover membros e arrumar a informação do grupo, vê quem já leu uma mensagem, e uma bolha de escrita aparece quando alguém está a escrever.",
  "changelog.entries.message-search.title": "Procure nas suas mensagens",
  "changelog.entries.message-search.body":
    "À procura daquela morada, daquela data, daquilo que alguém disse? Pesquise em todas as suas conversas e salte diretamente para lá.",
  "changelog.entries.link-previews.title": "As ligações abrem-se",
  "changelog.entries.link-previews.body":
    "Partilhe uma ligação e ela desdobra-se num cartão de pré-visualização — título, imagem e tudo — para que as pessoas vejam para onde vai antes de tocar.",
  "changelog.entries.forward-pin-star.title": "Reencaminhe, fixe e marque",
  "changelog.entries.forward-pin-star.body":
    "Passe uma mensagem para outra conversa, fixe as que um grupo está sempre a revisitar, e marque com estrela as que quer voltar a encontrar — as mensagens marcadas ficam só para si.",
  "changelog.entries.safe-space-view-page.title":
    "Pré-visualize espaços seguros antes de verificar",
  "changelog.entries.safe-space-view-page.body":
    "A ferramenta de revisão de Espaços seguros passa a ter um botão “Ver página” em cada listagem, abrindo a sua página pública num novo separador para que a moderação veja um espaço por inteiro antes de o marcar como verificado.",
  "changelog.entries.swipe-members-highlight.title":
    "Deslize pelos membros em destaque",
  "changelog.entries.swipe-members-highlight.body":
    "Na página inicial, o cartão de membro em destaque agora acompanha o seu dedo — deslize para a esquerda ou direita no telemóvel para passar entre membros, e ele encaixa no seguinte.",
  "changelog.entries.mention-names.title": "As menções mostram nomes reais",
  "changelog.entries.mention-names.body":
    "Menciona uma pessoa, comunidade ou lugar numa conversa, tópico do fórum ou discussão de comunidade e agora aparece o nome — Tiago Costa, não @tiago-costa. Toca e continuas a ir para o sítio certo; passa o cursor para ver o identificador.",
  "changelog.entries.forward-to-groups.title": "Reencaminha mensagens para os teus grupos",
  "changelog.entries.forward-to-groups.body":
    "O reencaminhamento agora chega às tuas conversas de grupo, não só às mensagens individuais. Mantém premida qualquer mensagem, escolhe Reencaminhar e seleciona qualquer grupo de que fazes parte.",
  "changelog.entries.read-receipts.title": "Recibos de entrega e de leitura",
  "changelog.entries.read-receipts.body":
    "Os visto contam agora a história toda: enviada, entregue no telemóvel, e lida — para saber onde a sua mensagem chegou.",
  "changelog.entries.message-gestures.title": "Deslize para responder, toque para reagir",
  "changelog.entries.message-gestures.body":
    "Deslize uma mensagem para o lado para lhe responder, e toque duas vezes para reagir — os gestos rápidos que os seus polegares já conhecem.",
  "changelog.entries.message-drafts.title": "Os seus rascunhos esperam por si",
  "changelog.entries.message-drafts.body":
    "Meia mensagem que ainda não enviou? Guardamo-la para aquela conversa, por isso continua lá quando voltar.",
  "changelog.entries.offline-outbox.title": "Envios que não se perdem",
  "changelog.entries.offline-outbox.body":
    "Tocou em enviar sem rede? A sua mensagem fica em fila e parte assim que voltar a ter ligação — nada desaparece pelo caminho.",
  "changelog.entries.typing-indicator.title": "Bolha de escrita e cuidado com o leitor de ecrã",
  "changelog.entries.typing-indicator.body":
    "Uma bolha suave mostra quando a outra pessoa está a escrever, e uma ronda de trabalho no leitor de ecrã torna toda a conversa mais fácil de acompanhar sem olhar.",
  "changelog.entries.moderation-actions.title":
    "Cada denúncia recebe uma decisão real",
  "changelog.entries.moderation-actions.body":
    "Abrir uma denúncia na fila de moderação passa a mostrar sempre o conjunto completo de ações — ocultar, avisar, restringir, remover e mais, cada uma com um motivo que a pessoa vai ler — em vez de a fechar em silêncio. O título da fila também reflete o número real de denúncias em espera.",
  "changelog.entries.listing-preview-and-ask.title":
    "Pré-visualize um anúncio, faça uma pergunta",
  "changelog.entries.listing-preview-and-ask.body":
    "Os moderadores podem agora pré-visualizar um negócio submetido tal como ficará publicado e enviar uma pergunta que chega ao autor como mensagem direta.",
  "changelog.entries.business-map-pin.title": "Coloque o seu negócio no mapa",
  "changelog.entries.business-map-pin.body":
    "A listar um negócio? Cole uma ligação do Google Maps para marcar um ponto, e os anúncios ativos passam a aparecer no mapa local. As novas submissões passam por uma fila de moderação antes de ficarem visíveis.",
  "changelog.entries.profile-editing.title": "Edite o seu perfil no lugar",
  "changelog.entries.profile-editing.body":
    "O seu quadro, competências e grupos passam a ser editáveis diretamente no perfil, com proteção contra alterações não guardadas para nunca perder uma edição por engano.",
  "changelog.entries.profile-communities-save.title":
    "Comunidades em destaque que ficam",
  "changelog.entries.profile-communities-save.body":
    "As comunidades que fixa no seu perfil passam a ficar guardadas — entre sessões e dispositivos — e aparecem para quem visita, cada uma com a sua função.",
  "changelog.entries.mention-types.title": "Mais formas de mencionar",
  "changelog.entries.mention-types.body":
    "As menções vão agora além de pessoas e comunidades — tópicos, negócios, eventos e discussões — e os donos e responsáveis são notificados quando são referidos.",
  "changelog.entries.clear-errors.title": "Mensagens de erro mais claras",
  "changelog.entries.clear-errors.body":
    "Quando algo não pode ser guardado, passamos a dizer exatamente o que correu mal em vez de um genérico «algo correu mal».",
  "changelog.entries.messaging-reactions.title": "Reações a mensagens mais fluidas",
  "changelog.entries.messaging-reactions.body":
    "As reações atualizam-se instantaneamente para todos na conversa, e as suas mensagens enviadas já não mudam de posição quando reage a elas.",
  "changelog.entries.event-photos.title": "Galerias de fotos de eventos",
  "changelog.entries.event-photos.body":
    "Organizadores e participantes podem partilhar fotos num encontro, visíveis apenas para quem esteve presente.",
  "changelog.entries.mentions.title": "Mencione pessoas e comunidades",
  "changelog.entries.mentions.body":
    "Escreva @ para etiquetar um membro ou c/ para ligar uma comunidade nas respostas do fórum e das comunidades — quem for mencionado recebe uma notificação.",
  "changelog.entries.push-notifications.title": "Notificações push para mensagens",
  "changelog.entries.push-notifications.body":
    "Ative para receber uma notificação no telemóvel quando chega uma nova mensagem direta enquanto está ausente — privado, apenas para mensagens diretas e desativado por predefinição.",
  "changelog.entries.delete-conversation.title": "Apagar uma conversa",
  "changelog.entries.delete-conversation.body":
    "Limpe uma conversa da sua caixa de entrada sem afetar a cópia da outra pessoa, ao estilo do WhatsApp.",
  "changelog.entries.profile-communities.title": "Destaque as suas comunidades",
  "changelog.entries.profile-communities.body":
    "Fixe as comunidades que gere ou de que faz parte no seu perfil, cada uma com um crachá de função.",
  "changelog.entries.subprofiles-upgrade.title": "Subperfis mais ricos",
  "changelog.entries.subprofiles-upgrade.body":
    "Os subperfis ganharam presença e multimédia, pré-visualizações de ligações partilháveis e exportação por código QR e vCard.",
  "changelog.entries.messaging-upgrades.title": "Melhorias nas mensagens",
  "changelog.entries.messaging-upgrades.body":
    "Ações de mensagem por toque longo, edição e resposta, e um fio de conversa mais limpo.",
  "changelog.entries.housing.title": "Diretórios de habitação e colegas de casa",
  "changelog.entries.housing.body":
    "Listagens exclusivas para membros de habitação, colegas de casa e senhorios amigáveis, cada uma com uma pontuação de compatibilidade.",
  "changelog.entries.routing-cleanup.title": "Limpeza de rotas e caminhos",
  "changelog.entries.routing-cleanup.body":
    "Resolução de caminhos públicos em conflito e casos extremos de rotas em toda a aplicação.",
  "changelog.entries.maps.title": "Mapas interativos",
  "changelog.entries.maps.body":
    "O diretório local e os espaços podem agora ser explorados num mapa interativo.",
  "changelog.entries.genesis.title": "Fluxo de arranque do fundador",
  "changelog.entries.genesis.body":
    "Um fluxo Genesis único para configurar o primeiro administrador quando a plataforma é iniciada.",
  "changelog.entries.pwa-mobile.title": "Instalar como aplicação",
  "changelog.entries.pwa-mobile.body":
    "A QueerPulse passou a ser uma aplicação web progressiva com uma interface móvel de aspeto nativo, além de ícones melhorados e metadados para motores de busca.",
  "changelog.entries.deploy-stability.title": "Estabilização de implementação e compilação",
  "changelog.entries.deploy-stability.body":
    "Uma série de correções de implementação, compilação e pré-renderização para que a aplicação seja publicada de forma fiável em produção.",
  "changelog.entries.performance-staff.title": "Desempenho e crachás de equipa",
  "changelog.entries.performance-staff.body":
    "Carregamento de páginas mais rápido, mais rotas de administração e um crachá de equipa QueerPulse nas contas oficiais.",
  "changelog.entries.accessibility.title": "Acessibilidade e refinamento da interface",
  "changelog.entries.accessibility.body":
    "Correções de acessibilidade e uma ronda de melhorias de interface em toda a aplicação.",
  "changelog.entries.i18n-complete.title": "Tradução completa para português",
  "changelog.entries.i18n-complete.body":
    "Toda a interface passou a estar disponível em inglês e português, alternável a partir da navegação.",
  "changelog.entries.subprofiles.title": "Subperfis",
  "changelog.entries.subprofiles.body":
    "Crie várias presenças públicas numa só conta — para a sua arte, o seu negócio ou um projeto.",
  "changelog.entries.live-backend.title": "Backend em produção",
  "changelog.entries.live-backend.body":
    "A aplicação ligou-se ao seu backend real, mantendo o modo de demonstração autónomo a par dos dados em produção, com perfis editáveis.",
  "changelog.entries.landing.title": "Nova página inicial",
  "changelog.entries.landing.body":
    "Uma página inicial redesenhada e uma ronda de refatorações do site de marketing.",
  "changelog.entries.studio-cinema.title": "Cinema e Estúdio",
  "changelog.entries.studio-cinema.body":
    "Novas páginas de direitos do Cinema e páginas de produção do Estúdio juntaram-se à plataforma.",
  "changelog.entries.tickets.title": "Eventos com bilhete",
  "changelog.entries.tickets.body":
    "Pague bilhetes de eventos diretamente na plataforma, com base em dados reais de eventos.",
  "changelog.entries.business-directory.title": "Diretório de negócios locais",
  "changelog.entries.business-directory.body":
    "Um diretório de negócios locais amigáveis, com um fluxo para os proprietários adicionarem o seu.",
  "changelog.entries.invite-flow.title": "Fluxo de convites",
  "changelog.entries.invite-flow.body":
    "Um fluxo de inscrição baseado em convites e uma experiência de integração renovada.",
  "changelog.entries.moderation-trust.title": "Moderação e rede de confiança",
  "changelog.entries.moderation-trust.body":
    "Ferramentas de moderação, gestão de eventos, ferramentas de administração e um grafo de rede de confiança que liga os membros.",
  "changelog.entries.communities-forum.title": "Comunidades e fórum",
  "changelog.entries.communities-forum.body":
    "Comunidades geridas por membros e um fórum de discussão de formato longo foram lançados em conjunto.",
  "changelog.entries.onboarding.title": "Integração de membros",
  "changelog.entries.onboarding.body":
    "Um fluxo de integração guiado para novos membros, com uma experiência de início de sessão mais suave.",
  "changelog.entries.launch.title": "Lançamento da QueerPulse",
  "changelog.entries.launch.body":
    "O primeiro lançamento — a meganavegação da comunidade e o conjunto principal de páginas entraram em funcionamento.",
  "changelog.empty.title": "Ainda nada registado com este filtro",
  "changelog.empty.description":
    "Ainda não houve alterações deste tipo. Limpa o filtro para ver o histórico completo.",
  "changelog.empty.clearCta": "Limpar filtros",

  // ── Roteiro — chrome da página. Os itens enviados/em construção/
  //    planeados, as ideias mais votadas e as contagens de votos são o
  //    backlog em direto — ficam em inglês; ver o relatório da varredura.
  "roadmap.meta.title": "O roteiro da QueerPulse: lançado, em curso, planeado",
  "roadmap.meta.description":
    "Vê o que a QueerPulse já lançou, o que uma pequena equipa em Lisboa está a construir agora, e o que está planeado a seguir — e como submeter e votar ideias.",
  "roadmap.hero.eyebrow": "O que estamos a construir",
  "roadmap.hero.title": "O <em>roteiro</em>",
  "roadmap.hero.sub":
    "A QueerPulse é feita por uma pequena equipa em Lisboa. Eis o que estamos a fazer, o que já lançámos, e no que podes votar a seguir.",
  "roadmap.col.done": "Feito",
  "roadmap.col.buildingNow": "Em construção",
  "roadmap.col.planned": "Planeado",
  "roadmap.card.memberRequested": "Pedido por uma pessoa da comunidade",
  "roadmap.card.progressAria": "Progresso de {name}",
  "roadmap.card.mostWanted": "Mais pedido",
  "roadmap.card.votesSuffix": "votos",
  "roadmap.shape.title": "Tens uma <em>ideia?</em>",
  "roadmap.shape.sub":
    "Lemos todas as sugestões. As ideias mais votadas sobem no roteiro.",
  "roadmap.submitIdea.title": "Submeter uma ideia",
  "roadmap.submitIdea.ariaLabel": "A tua ideia",
  "roadmap.submitIdea.placeholder":
    "O que tornaria a QueerPulse melhor para ti?",
  "roadmap.submitIdea.cta": "Submeter ideia",
  "roadmap.submitIdea.toast.empty": "Escreve primeiro algumas palavras",
  "roadmap.submitIdea.toast.submitted": "Obrigado — enviámos à equipa para revisão",
  "roadmap.submitIdea.toast.error": "Não foi possível submeter a tua ideia — tenta de novo",
  "roadmap.topIdeas.title": "Ideias mais pedidas",
  "roadmap.topIdeas.voted": "Votado",
  "roadmap.topIdeas.vote": "Votar",
  "roadmap.topIdeas.toast.voted": "Voto registado",
  "roadmap.howWeDecide.title": "Como <em>decidimos</em>",
  "roadmap.howWeDecide.memberVotes.title": "Votos da comunidade",
  "roadmap.howWeDecide.memberVotes.desc":
    "As funcionalidades em que votas sobem ao topo. Vemos isto semanalmente.",
  "roadmap.howWeDecide.safetyFirst.title": "Segurança em primeiro lugar",
  "roadmap.howWeDecide.safetyFirst.desc":
    "Cada funcionalidade é revista quanto ao modo como poderia ser usada de forma abusiva numa comunidade como esta.",
  "roadmap.howWeDecide.smallTeam.title": "Equipa pequena, ritmo cuidado",
  "roadmap.howWeDecide.smallTeam.desc":
    "Somos duas pessoas de engenharia e uma de design. Preferimos construir devagar e acertar.",
  "roadmap.subpageIndex.title": "Já lançado",
  "roadmap.subpageIndex.changelog.label": "Registo de alterações",
  "roadmap.subpageIndex.changelog.blurb":
    "Todos os lançamentos, datados — o que já lançámos até agora.",

  // ── Arquivo de Imprensa — chrome da página. Títulos/fontes/autores da
  //    cobertura são peças de imprensa de terceiros reais (palavras de
  //    outras pessoas) e ficam em inglês, o mesmo precedente da secção de
  //    cobertura do Press Kit.
  "pressArchive.hero.backLabel": "Press Kit",
  "pressArchive.hero.eyebrow": "Arquivo de cobertura · desde 2024",
  "pressArchive.hero.title": "Tudo o que já escreveram <em>sobre nós.</em>",
  "pressArchive.hero.sub":
    "Peças sobre a QueerPulse em publicações de terceiros, indexadas por ano. <em>Inclui críticas com as quais discordámos.</em>",
  "pressArchive.stats.allTime": "Peças, desde sempre",
  "pressArchive.stats.languages": "Idiomas",
  "pressArchive.stats.thisYear": "Este ano",
  "pressArchive.search.placeholder": "Pesquisar título, fonte, autor",
  "pressArchive.chip.all": "Todas · {count}",
  "pressArchive.chip.features": "Reportagens · {count}",
  "pressArchive.chip.interviews": "Entrevistas · {count}",
  "pressArchive.chip.news": "Notícias · {count}",
  "pressArchive.chip.critiques": "Críticas · {count}",
  "pressArchive.pinBadge": "Destaque",
  "pressArchive.toast.opening": "A abrir em {source}…",
  "pressArchive.loadingMore": "A carregar peças mais antigas…",
  "pressArchive.loadMoreCta": "Carregar cobertura mais antiga",
  "pressArchive.endOfArchive": "É este o arquivo completo — de 2022 até hoje.",
  "pressArchive.noResults": "Nenhuma cobertura corresponde a esses filtros ainda.",

  // ── Voluntariado — chrome da página. Nomes/funções/descrições/competências
  //    das organizações vêm da API de oportunidades em direto (ou do seu
  //    mock de demonstração) — ficam em inglês; o adaptador compõe alguns
  //    fragmentos de chrome (etiqueta de compromisso, etiquetas de
  //    estatística/vagas, frase de confirmação) que também têm chave aqui
  //    para o modo em direto traduzir tal como a demonstração.
  "volunteer.meta.title": "Voluntariado na QueerPulse: escolhe causa e tempo",
  "volunteer.meta.description":
    "Explora oportunidades de voluntariado na QueerPulse por causa — direitos, saúde, juventude, habitação, artes — e por tempo disponível, ou publica uma para a tua organização.",
  "volunteer.filter.all": "Todas as oportunidades",
  "volunteer.filter.low": "Compromisso baixo",
  "volunteer.filter.medium": "Compromisso médio",
  "volunteer.filter.rights": "Direitos LGBTQ+",
  "volunteer.filter.health": "Saúde e bem-estar",
  "volunteer.filter.youth": "Juventude",
  "volunteer.filter.housing": "Habitação",
  "volunteer.filter.arts": "Artes e cultura",
  "volunteer.hero.eyebrow": "Voluntariado",
  "volunteer.hero.title": "Dá o teu tempo à <em>comunidade</em> à tua volta.",
  "volunteer.hero.sub":
    "Não precisas de ser ativista. Precisas de duas horas livres e vontade de aparecer. Abaixo estão organizações em Lisboa genuinamente à procura de pessoas como tu.",
  "volunteer.hero.note":
    "Todas as organizações abaixo foram avaliadas pela comunidade QueerPulse",
  "volunteer.hero.postCta": "Publicar uma oportunidade",
  "volunteer.empty.noneTitle": "Ainda não há oportunidades publicadas",
  "volunteer.empty.noneDescription":
    "Ainda nenhuma organização publicou vagas aqui. Se a tua precisa de ajuda, sê a primeira a lançar o convite.",
  "volunteer.empty.noneCta": "Publicar uma oportunidade",
  "volunteer.empty.filteredTitle":
    "Ainda não há oportunidades com estes filtros",
  "volunteer.empty.filteredDescription":
    "Tenta alargar a pesquisa — há muitas formas de dar o teu tempo, e há sempre vagas novas a surgir.",
  "volunteer.empty.clearCta": "Limpar filtros",
  "volunteer.card.commitLow": "Compromisso baixo",
  "volunteer.card.commitMedium": "Compromisso médio",
  "volunteer.card.expressInterest": "Mostrar interesse →",
  "volunteer.loadingMore": "A carregar mais oportunidades…",
  "volunteer.loadMoreCta": "Carregar mais oportunidades",
  "volunteer.outro.title": "Queres ligar-te <em>mais a fundo?</em>",
  "volunteer.outro.sub":
    "Encontra quem já está a trabalhar nas causas que te importam.",
  "volunteer.outro.cta": "Conhece quem faz a mudança →",
  "volunteer.signups.title": "Quem já se inscreveu",
  "volunteer.signups.loading": "A carregar inscrições…",
  "volunteer.signups.empty":
    "Ainda ninguém se inscreveu — a primeira pessoa aparece aqui.",
  "volunteer.signups.signedUp": "Inscreveu-se {when}",
  "volunteer.signups.closedTag": "Esta oportunidade está encerrada",
  "volunteer.signups.closing": "A encerrar…",
  "volunteer.signups.closeCta": "Encerrar oportunidade",
  "volunteer.adapter.eyebrow": "Voluntariado · {cause} · {org}",
  "volunteer.adapter.recruitingNow": "A recrutar agora",
  "volunteer.adapter.closedNotRecruiting": "Encerrado · sem recrutamento",
  "volunteer.adapter.perWeek": "Por semana",
  "volunteer.adapter.commitment": "Compromisso",
  "volunteer.adapter.spotsStillOpen": "Vagas ainda disponíveis",
  "volunteer.adapter.roleLabel": "Função",
  "volunteer.adapter.locationLabel": "Local",
  "volunteer.adapter.applyConfirm":
    "Candidatura submetida para {role}. A equipa entrará em contacto com os próximos passos.",
  "volunteer.adapter.inPartnershipWith": "Em parceria com {name}.",
  "volunteer.adapter.anonMember": "Uma pessoa da comunidade",

  // ── Publicar uma oportunidade de voluntariado — chrome do formulário
  //    (tudo interface da plataforma).
  "postOpportunity.hero.eyebrow": "Voluntariado · Publicar uma vaga",
  "postOpportunity.hero.title": "Publica uma <em>oportunidade.</em>",
  "postOpportunity.hero.sub":
    "Precisas de pessoas para dar o tempo delas? Descreve a vaga com honestidade — as horas, o compromisso, para quem é indicada — e fica logo visível no quadro de voluntariado.",
  "postOpportunity.toast.error":
    "Não foi possível publicar a tua oportunidade — tenta outra vez.",
  "postOpportunity.success.title": "A tua oportunidade está",
  "postOpportunity.success.em": "publicada.",
  "postOpportunity.success.closeLabel": "Ver o quadro de voluntariado →",
  "postOpportunity.success.step1": "Já está visível no quadro de voluntariado",
  "postOpportunity.success.step2":
    "As pessoas podem inscrever-se a partir da ficha",
  "postOpportunity.success.step3":
    "Vais ver todas as inscrições na página da vaga",
  "postOpportunity.success.body":
    "Obrigado por abrires espaço para alguém ajudar. Quem estiver interessade já pode encontrar a tua vaga e mostrar interesse.",
  "postOpportunity.actions.posting": "A publicar…",
  "postOpportunity.actions.submit": "Publicar oportunidade →",
  "postOpportunity.actions.cancel": "Cancelar",
  "postOpportunity.tip1.title": "Sê honesto sobre o pedido",
  "postOpportunity.tip1.body":
    "As pessoas voluntárias ficam quando o compromisso corresponde ao que prometeste. Explica as horas, a duração, e qualquer formação, logo à partida.",
  "postOpportunity.tip2.title": "Diz para quem é indicada",
  "postOpportunity.tip2.body":
    "As melhores vagas descrevem a pessoa de que precisam — o temperamento, não só o currículo. Ajuda as pessoas certas a identificarem-se.",
  "postOpportunity.tip3.title": "O que acontece depois de publicares",
  "postOpportunity.tip3.body":
    "A tua vaga aparece imediatamente no quadro de voluntariado. As pessoas interessadas inscrevem-se a partir da ficha, e vês a lista ali.",
  "postOpportunity.cause.rights": "Direitos LGBTQ+",
  "postOpportunity.cause.health": "Saúde e bem-estar",
  "postOpportunity.cause.youth": "Juventude",
  "postOpportunity.cause.housing": "Habitação",
  "postOpportunity.cause.arts": "Artes e cultura",
  "postOpportunity.commit.low.label": "Compromisso baixo",
  "postOpportunity.commit.low.hint":
    "Umas horas flexíveis por semana, sem prazo fixo.",
  "postOpportunity.commit.medium.label": "Compromisso médio",
  "postOpportunity.commit.medium.hint":
    "Um turno regular e um prazo mínimo — a consistência importa.",
  "postOpportunity.core.basicsHeading": "O essencial",
  "postOpportunity.core.orgLabel": "Organização",
  "postOpportunity.core.orgPlaceholder": "ex.: a sua organização",
  "postOpportunity.core.roleLabel": "Título da função",
  "postOpportunity.core.rolePlaceholder":
    "ex.: Voluntário de Sensibilização Comunitária",
  "postOpportunity.core.causeLabel": "Causa",
  "postOpportunity.core.commitLabel": "Nível de compromisso",
  "postOpportunity.core.timePlaceHeading": "Tempo e local",
  "postOpportunity.core.timeLabel": "Disponibilidade de tempo",
  "postOpportunity.core.timePlaceholder": "ex.: 2–4 h/semana",
  "postOpportunity.core.locationLabel": "Local",
  "postOpportunity.core.locationPlaceholder": "ex.: Presencial · Lisboa",
  "postOpportunity.core.spotsLabel": "Vagas disponíveis",
  "postOpportunity.core.spotsHelper":
    "Quantas pessoas voluntárias consegues receber nesta função?",
  "postOpportunity.core.spotsPlaceholder": "ex.: 24",
  "postOpportunity.core.pitchHeading": "A apresentação",
  "postOpportunity.core.descLabel": "Descrição breve",
  "postOpportunity.core.descHelper":
    "Uma ou duas frases mostradas no cartão da vaga.",
  "postOpportunity.core.descPlaceholder":
    "Com o que é que a pessoa voluntária vai ajudar, em linguagem simples.",
  "postOpportunity.core.skillsLabel": "Competências",
  "postOpportunity.core.skillsHelper":
    "Separadas por vírgulas — mostradas como hashtags no cartão.",
  "postOpportunity.core.skillsPlaceholder":
    "Comunicação, Idiomas, Apoio a eventos",
  "postOpportunity.rich.summary": "Acrescentar mais detalhe (opcional)",
  "postOpportunity.rich.whyHeading": "Porque é que importa",
  "postOpportunity.rich.whyLabel": "Porque é que esta função importa",
  "postOpportunity.rich.whyHelper": "Um parágrafo por linha.",
  "postOpportunity.rich.whyPlaceholder":
    "O que muda porque alguém apareceu para isto.",
  "postOpportunity.rich.goodForLabel": "Para quem é indicada",
  "postOpportunity.rich.goodForHelper": "Um parágrafo por linha.",
  "postOpportunity.rich.goodForPlaceholder":
    "O temperamento e as competências que encaixam — não só o currículo.",
  "postOpportunity.rich.tasksHeading": "O que vão fazer, na prática",
  "postOpportunity.rich.taskTitleAria": "Título da tarefa {index}",
  "postOpportunity.rich.taskTitlePlaceholder": "Título da tarefa",
  "postOpportunity.rich.taskDetailAria": "Detalhe da tarefa {index}",
  "postOpportunity.rich.taskDetailPlaceholder": "Uma linha sobre o que envolve",
  "postOpportunity.rich.taskRemoveAria": "Remover tarefa {index}",
  "postOpportunity.rich.addTask": "Adicionar uma tarefa",
  "postOpportunity.rich.commitmentsHeading": "O compromisso, com honestidade",
  "postOpportunity.rich.commitLabelAria": "Etiqueta do compromisso {index}",
  "postOpportunity.rich.commitLabelPlaceholder": "ex.: formação de 6 horas",
  "postOpportunity.rich.commitDetailAria": "Detalhe do compromisso {index}",
  "postOpportunity.rich.commitDetailPlaceholder":
    "ex.: Duas noites antes de começares · obrigatório",
  "postOpportunity.rich.commitRemoveAria": "Remover compromisso {index}",
  "postOpportunity.rich.addCommitment": "Adicionar um compromisso",
  "postOpportunity.rich.teamHeading": "Equipa e contacto",
  "postOpportunity.rich.teamIntroLabel": "Apresentação da equipa",
  "postOpportunity.rich.teamIntroPlaceholder":
    "ex.: 18 voluntários de sensibilização ativos este trimestre.",
  "postOpportunity.rich.teamLabel": "Membros da equipa",
  "postOpportunity.rich.teamHelper":
    "Identificadores/slugs de pessoas já na equipa, separados por vírgulas.",
  "postOpportunity.rich.teamPlaceholder": "catarina-v, jonas-f",
  "postOpportunity.rich.applyRoleLabel": "Etiqueta da função ao candidatar-se",
  "postOpportunity.rich.applyRoleHelper":
    "Por predefinição, “Função · Organização”.",
  "postOpportunity.rich.applyRolePlaceholder":
    "Sensibilização Comunitária · uma associação LGBTQ+ local",
  "postOpportunity.rich.partnerSlugLabel": "Slug do parceiro",
  "postOpportunity.rich.partnerSlugHelper": "Liga à página de um parceiro.",
  "postOpportunity.rich.partnerSlugPlaceholder": "your-organisation",
  "postOpportunity.rich.handleLabel": "Identificador de contacto",
  "postOpportunity.rich.handleHelper":
    "Onde as pessoas interessadas te podem contactar.",
  "postOpportunity.rich.handlePlaceholder": "@teu-identificador ou um email",

  // ── Detalhe da oportunidade de voluntariado — chrome da página.
  //    `opp.eyebrow` / `.urgent` / `.titleLead` / `.titleEm` / `.sub` /
  //    `.stats[].label` / `.spots[].label` / `.applyConfirm` /
  //    `.partner.text` / `.applyRole` vêm do modelo de vista partilhado que
  //    o adaptador em direto e o mock de demonstração preenchem
  //    (`volunteering.adapters.tsx`, `volunteerOpportunities.dataA/B.tsx`) —
  //    NÃO varridos nesta passagem; corrigi-los implica mudar esse tipo
  //    partilhado no adaptador + nos dois ficheiros de dados de
  //    demonstração, sinalizado no relatório da varredura como trabalho
  //    futuro. Todo o resto nesta página (títulos, botões, etiquetas fixas)
  //    é chrome e está traduzido abaixo.
  "volunteerDetail.backCta": "← Todas as oportunidades de voluntariado",
  "volunteerDetail.error.alreadySignedUp": "Já te inscreveste nesta função.",
  "volunteerDetail.error.full":
    "Esta oportunidade acabou de ficar completa — todas as vagas estão ocupadas.",
  "volunteerDetail.error.alreadyOrFull":
    "Já te inscreveste, ou esta oportunidade já está completa.",
  "volunteerDetail.error.generic":
    "Algo correu mal ao enviar o teu interesse — tenta outra vez.",
  "volunteerDetail.main.whyTitle": "Porque é que esta função <em>importa</em>",
  "volunteerDetail.main.tasksTitle": "O que vais <em>fazer, na prática</em>",
  "volunteerDetail.main.commitmentTitle":
    "O <em>compromisso</em>, com honestidade",
  "volunteerDetail.main.goodForTitle": "Para <em>quem é indicada</em>",
  "volunteerDetail.main.teamTitle": "Quem <em>já está cá</em>",
  "volunteerDetail.sidebar.appliedTitle": "Estás <em>na lista.</em>",
  "volunteerDetail.sidebar.messageTeam": "Enviar mensagem à equipa",
  "volunteerDetail.sidebar.withdrawing": "A retirar…",
  "volunteerDetail.sidebar.withdraw": "Retirar o meu interesse",
  "volunteerDetail.sidebar.applyHeading": "Candidatar",
  "volunteerDetail.sidebar.spotsFilled": "Vagas ocupadas",
  "volunteerDetail.sidebar.roleFull": "Esta função está completa",
  "volunteerDetail.sidebar.sending": "A enviar a tua candidatura…",
  "volunteerDetail.sidebar.applyCta": "Candidatar →",
  "volunteerDetail.sidebar.askTeam": "Perguntar à equipa",
  "volunteerDetail.sidebar.footNote":
    "Pessoas voluntárias antigas: <a>usa o perfil do ano passado →</a> · salta este ecrã.",
  "volunteerDetail.sidebar.partnershipLabel": "Em parceria com",
  "volunteerDetail.sidebar.partnershipLink": "Sobre a parceria →",
  "volunteerDetail.sidebar.notRightFit": "Não é a vaga certa para ti?",
  "volunteerDetail.sidebar.otherWays": "Outras formas de ajudar agora:",
  "volunteerDetail.sidebar.fundInstead":
    "→ Financiar este trabalho em vez disso",

  // ── Detalhe do Parceiro — chrome da página. O conteúdo sobre/trabalho
  //    conjunto/linha do tempo/como trabalhamos, as estatísticas, e os
  //    contactos são conteúdo próprio de cada organização parceira
  //    (partnerDetails.dataA/B.tsx) — ficam em inglês, o mesmo precedente da
  //    página de listagem de Parceiros.
  "partnerDetail.loadError":
    "Não conseguimos carregar este parceiro agora. Tenta outra vez.",
  "partnerDetail.backCta": "← Todos os parceiros",
  "partnerDetail.tab.about": "Sobre",
  "partnerDetail.tab.work": "Trabalho conjunto",
  "partnerDetail.tab.timeline": "Linha do tempo",
  "partnerDetail.tab.how": "Como trabalhamos juntos",
  "partnerDetail.sidebar.atGlance": "De relance",
  "partnerDetail.sidebar.contactDirectly": "Contacta {name} diretamente",
  "partnerDetail.sidebar.becomeTitle": "Torna-te parceiro",
  "partnerDetail.sidebar.becomeBody":
    "És uma organização que devia estar operacionalmente ligada à QueerPulse? Somos pequenos e lentos nisto — escreve-nos.",
  "partnerDetail.sidebar.becomeCta": "Entra em contacto →",

  // ── Donate — chrome da página. Tudo escrito pela própria plataforma (os
  //    valores/alocação/confiança são números fixos da QueerPulse, não
  //    conteúdo vindo de terceiros).
  "donate.meta.title": "Doa à QueerPulse: para onde vai cada euro",
  "donate.meta.description":
    "Apoia a QueerPulse com um donativo mensal ou pontual — financia ajuda mútua, encontros, segurança da plataforma e trabalho criativo pago, com prestação de contas trimestral.",
  "donate.hero.eyebrow": "Apoia a QueerPulse",
  "donate.hero.title": "As pessoas mantêm isto <em>vivo.</em>",
  "donate.hero.lead":
    "Sem anúncios, sem investidores, sem venda de dados. A QueerPulse funciona graças a quem a usa — e cada euro volta para a ajuda mútua, os encontros e para pagar de forma justa as pessoas criativas queer da comunidade.",
  "donate.toggle.monthly": "Mensal",
  "donate.toggle.oneOff": "Pontual",
  "donate.amounts.coffee": "um café",
  "donate.amounts.mostChosen": "mais escolhido",
  "donate.amounts.sustainsMember": "sustenta uma pessoa",
  "donate.amounts.fundsGathering": "financia um encontro",
  "donate.giveCta.monthly": "Dar {amount} / mês →",
  "donate.giveCta.oneOff": "Dar {amount} →",
  "donate.allocation.title": "Para onde <em>vai mesmo.</em>",
  "donate.allocation.lead":
    "Nada de despesas gerais e salários para pessoas que nunca vais conhecer. Aqui está a divisão real.",
  "donate.allocation.mutualAid.label": "Ajuda mútua direta",
  "donate.allocation.mutualAid.body":
    "Alojamento de emergência, apoio em crise, e microapoios pagos diretamente a quem precisa.",
  "donate.allocation.gatherings.label": "Encontros e espaços",
  "donate.allocation.gatherings.body":
    "Aluguer de espaços, bilhetes em escala solidária, e os encontros de boas-vindas que mantêm a porta aberta.",
  "donate.allocation.platform.label": "Plataforma e segurança",
  "donate.allocation.platform.body":
    "Moderação, a linha de chat de crise, e manter tudo a funcionar — sem anúncios, sem venda de dados.",
  "donate.allocation.magazine.label": "A revista e o Studio",
  "donate.allocation.magazine.body":
    "Pagar de forma justa a quem escreve, cria e faz música aqui.",
  "donate.trust.title": "Podes <em>confiar nos números.</em>",
  "donate.trust.lead": "Transparência aqui não é um extra — é o acordo.",
  "donate.trust.reported.title": "Cada euro é reportado",
  "donate.trust.reported.body":
    "Números trimestrais publicados em aberto — vê exatamente para onde foram.",
  "donate.trust.noAds.title": "Sem anúncios, sem venda de dados",
  "donate.trust.noAds.body":
    "Somos financiados por quem usa a plataforma, não por anunciantes. O teu apoio é todo o modelo.",
  "donate.trust.membersDecide.title": "Quem está cá decide",
  "donate.trust.membersDecide.body":
    "O conselho da comunidade vota como o fundo de solidariedade é gasto a cada trimestre.",
  "donate.outro.title": "Ou dá o teu <em>tempo, em vez disso.</em>",
  "donate.outro.sub":
    "O dinheiro é uma forma de ajudar. Ser voluntária ou voluntário, acolher encontros, e aparecer contam tanto quanto isso.",
  "donate.outro.volunteerCta": "Faz voluntariado connosco",
  "donate.outro.readFiguresCta": "Ver os números",

  // ── Modal de doação — chrome do formulário de pagamento (protótipo, sem
  //    cobrança real).
  "donateModal.title": "Confirma a tua <em>doação.</em>",
  "donateModal.sub":
    "Sem anúncios, sem investidores — só pessoas a manter isto vivo.",
  "donateModal.row.monthlyGift": "Doação mensal",
  "donateModal.row.oneOffGift": "Doação pontual",
  "donateModal.row.feeCovered": "Taxa de processamento coberta",
  "donateModal.row.chargedToday": "Cobrado hoje",
  "donateModal.amount.monthly": "{amount} / mês",
  "donateModal.checkLabel": "Cobrir a taxa de processamento de {pct}%",
  "donateModal.checkHint":
    "Para que 100% dos teus {amount} cheguem à comunidade.",
  "donateModal.field.nameOnCard": "Nome no cartão",
  "donateModal.field.namePlaceholder": "Ana Silva",
  "donateModal.field.emailReceipt": "Email para o recibo",
  "donateModal.field.cardNumber": "Número do cartão",
  "donateModal.field.expiry": "Validade",
  "donateModal.field.cvc": "CVC",
  "donateModal.processing": "A processar…",
  "donateModal.submitCta.monthly": "Doar {amount} / mês",
  "donateModal.submitCta.oneOff": "Doar {amount}",
  "donateModal.secure":
    "Encriptado e seguro. Isto é um protótipo — não é feita nenhuma cobrança real.",
  "donateModal.success.title": "Já estás dentro.",
  "donateModal.success.emMonthly": "Até para o mês.",
  "donateModal.success.emOneOff": "Obrigade.",
  "donateModal.success.closeLabel": "Concluído",
  "donateModal.success.bodyMonthly":
    "Os teus {amount} / mês vão diretamente para a ajuda mútua, os encontros, e para pagar de forma justa as pessoas criativas queer da comunidade. Cancela quando quiseres a partir da tua conta — sem perguntas.",
  "donateModal.success.bodyOneOff":
    "Os teus {amount} vão diretamente para a ajuda mútua, os encontros, e para pagar de forma justa as pessoas criativas queer da comunidade. Enviamos o recibo por email em breve.",

  // ── Contacto — chrome da página. Todo o conteúdo é escrito pela plataforma
  //    (formulário/vias de contacto).
  "contact.meta.title": "Contacta a QueerPulse: geral, segurança, imprensa",
  "contact.meta.description":
    "Fala com a QueerPulse — uma equipa pequena que lê e responde a cada mensagem pessoalmente. Vias para perguntas gerais, preocupações de segurança, imprensa e parcerias.",
  "contact.eyebrow": "Lemos tudo",
  "contact.hero.title": "Fala <em>connosco.</em>",
  "contact.hero.body":
    "Somos uma equipa pequena e respondemos às mensagens nós próprios. Não é um sistema automático, nem uma fila de suporte. Escolhe a via que faz mais sentido para o que precisas de dizer.",
  "contact.routes.general.title": "Contacto geral",
  "contact.routes.general.desc":
    "Tudo o que não encaixa noutro lado — perguntas, feedback, apresentações, ideias que achas que devíamos ouvir.",
  "contact.routes.safety.title": "Preocupação de segurança",
  "contact.routes.safety.desc":
    "Se alguma coisa na rede te fez sentir insegurança ou desconforto. Tratamos com total discrição. Respondemos dentro de 24 horas.",
  "contact.routes.press.title": "Imprensa e media",
  "contact.routes.press.desc":
    "Jornalistas, equipas de investigação, documentaristas. Temos todo o gosto em falar sobre o que estamos a construir e porquê. Pedimos que partilhes o teu rascunho antes da publicação.",
  "contact.routes.partnerships.title": "Parcerias",
  "contact.routes.partnerships.desc":
    "Organizações, espaços e comunidades que querem trabalhar com a QueerPulse. Somos seletivos, mas genuinamente interessados nas colaborações certas.",
  "contact.sent.title": "Mensagem <em>recebida.</em>",
  "contact.sent.body":
    "Vamos lê-la e responder, normalmente dentro de um ou dois dias. Se for uma preocupação de segurança, entramos em contacto dentro de 24 horas.",
  "contact.sent.backCta": "Voltar à QueerPulse",
  "contact.form.title": "Escreve-<em>nos.</em>",
  "contact.form.sub":
    "Se preferires um formulário a um email, usa este. Lemos da mesma forma.",
  "contact.form.nameLabel": "O teu nome",
  "contact.form.namePlaceholder": "Como preferes que te tratemos",
  "contact.form.emailLabel": "Email",
  "contact.form.emailPlaceholder": "Para podermos responder",
  "contact.form.topicLabel": "Sobre o que é?",
  "contact.form.topicPick": "Escolhe um tema",
  "contact.form.topic.general": "Pergunta geral ou feedback",
  "contact.form.topic.safety": "Preocupação de segurança",
  "contact.form.topic.press": "Pedido de imprensa ou investigação",
  "contact.form.topic.partnership": "Proposta de parceria",
  "contact.form.topic.other": "Outra coisa",
  "contact.form.messageLabel": "A tua mensagem",
  "contact.form.messagePlaceholder":
    "Escreve com naturalidade. Não há modelo nem limite de palavras.",
  "contact.form.sendCta": "Enviar →",
  "contact.outro.title": "Construído em Lisboa, <em>com cuidado.</em>",
  "contact.outro.sub":
    "A QueerPulse é uma rede pequena, sustentada pelas pessoas que a usam. O teu feedback ajuda a mantê-la boa.",
  "contact.outro.backCta": "Voltar à sala",

  // ── Para Organizações — chrome da página de parcerias. Os quatro registos
  //    de PARTNERS (nome/tempo de parceria/descrição) e o testemunho de
  //    Filipa Mendes são conteúdo próprio de cada organização — ficam em
  //    inglês, o mesmo precedente da página de listagem de Parceiros.
  "forOrgs.meta.title": "Parcerias com a QueerPulse: operacionais, não promo",
  "forOrgs.meta.description":
    "Como as organizações podem fazer parceria com a QueerPulse — colaborações operacionais, não conteúdo patrocinado nem campanhas do mês do Orgulho, e como começar.",
  "forOrgs.hero.eyebrow": "Para organizações · parcerias",
  "forOrgs.hero.title": "Trabalha <em>connosco,</em> não <em>sobre nós.</em>",
  "forOrgs.hero.dek":
    "As parcerias da QueerPulse são <b>operacionais, não promocionais</b>. Não vendemos acesso, não fazemos conteúdo patrocinado, nem co-branding pelo simples efeito. <em>Construímos ligações entre organizações que já fazem este trabalho.</em> Abaixo: como são essas ligações na prática, com quem já trabalhamos, e como começar uma conversa.",
  "forOrgs.hero.notDoTitle": "O que não fazemos",
  "forOrgs.notDo.prideCampaigns":
    "<b>Campanhas no mês do Orgulho.</b> Nem em junho, nem nunca. As pessoas da comunidade sairiam — e com razão.",
  "forOrgs.notDo.sellList":
    "<b>Vender a nossa lista de pessoas.</b> Sem segmentação, sem apresentações pagas.",
  "forOrgs.notDo.sponsoredPosts":
    '<b>"Publicações patrocinadas" ou conteúdo de marca</b> na revista, no feed, ou no podcast.',
  "forOrgs.notDo.rainbowLogos":
    "<b>Logótipos arco-íris.</b> Não adicionamos o teu e não emprestamos o nosso.",
  "forOrgs.notDo.recruit":
    "<b>Recrutar em teu nome.</b> As empresas publicam vagas no quadro de Vagas como toda a gente.",
  "forOrgs.process.title": "Como é que as parcerias <em>realmente começam</em>",
  "forOrgs.process.sub":
    "Devagar. Conversado. Muitas vezes por telefone antes de uma proposta escrita. Todo o processo demora normalmente 6 a 10 semanas.",
  "forOrgs.process.step1.title": "Email ou uma chamada",
  "forOrgs.process.step1.body":
    "Diz-nos o que fazes, o que gostarias, o que não é negociável do teu lado. <em>30 minutos, sem compromisso.</em>",
  "forOrgs.process.step2.title": "Uma reunião presencial",
  "forOrgs.process.step2.body":
    "Café em Lisboa se estiveres cá, ou vídeo. Falamos sobre como a ligação funcionaria — operacionalmente, não em teoria.",
  "forOrgs.process.step3.title": "Proposta de duas páginas",
  "forOrgs.process.step3.body":
    "Um de nós faz o rascunho; ambos os lados editam. Inclui <b>condições de saída</b>, cláusulas de discordância pública, e o fluxo de dinheiro.",
  "forOrgs.process.step4.title": "Aprovação da Assembleia",
  "forOrgs.process.step4.body":
    "As parcerias operacionais vão à Assembleia mensal. A adesão de Sustentadores pronuncia-se. <em>~10% das parcerias são vetadas.</em>",
  "forOrgs.proof.title": "Já a trabalhar <em>connosco</em>",
  "forOrgs.proof.sub":
    "Quatro parceiros representativos, cada um num nível diferente. A lista completa está em Parceiros.",
  "forOrgs.proof.viewCta": "Ver parceiro →",
  "forOrgs.tiers.title": "O que <em>oferecemos</em>",
  "forOrgs.tiers.sub":
    "Três níveis, cada um um tipo diferente de relação. Todos incluem o essencial: revisão prévia à publicação, divulgação transparente do financiamento, e a possibilidade de qualquer um dos lados discordar publicamente.",
  "forOrgs.tiers.employer.name": "Empregador verificado",
  "forOrgs.tiers.employer.pricePeriod": "/ ano · publica vagas ilimitadas",
  "forOrgs.tiers.employer.dek":
    'Para empregadores que querem publicar no nosso quadro de Vagas com o selo "verificado queer-friendly". Requer um compromisso de 12 meses e uma avaliação conduzida por uma pessoa da comunidade.',
  "forOrgs.tiers.employer.list1": "Vagas ilimitadas · <b>publicadas em 24h</b>",
  "forOrgs.tiers.employer.list2":
    "Selo de empregador verificado no perfil da empresa",
  "forOrgs.tiers.employer.list3":
    "Uma avaliação anual de cultura conduzida por uma pessoa da comunidade (anónima)",
  "forOrgs.tiers.employer.list4": "Presença nas Avaliações de Empregadores",
  "forOrgs.tiers.employer.list5":
    "Horário de atendimento trimestral sobre contratação com dois elementos da equipa",
  "forOrgs.tiers.employer.footnote":
    "Para: organizações com mais de 20 pessoas a contratar ativamente talento queer. Escala progressiva para equipas com menos de 50 pessoas.",
  "forOrgs.tiers.employer.reviewCta": "Iniciar a avaliação",
  "forOrgs.tiers.employer.reviewToast": "A abrir o formulário de avaliação…",
  "forOrgs.tiers.employer.exampleCta": "Ver um exemplo de perfil de empresa →",
  "forOrgs.tiers.partner.name": "Parceiro <em>operacional</em>",
  "forOrgs.tiers.partner.price": "Por <em>acordo</em>",
  "forOrgs.tiers.partner.pricePeriod": "recíproco · normalmente não pago",
  "forOrgs.tiers.partner.dek":
    "Para organizações que deviam estar operacionalmente ligadas à QueerPulse — organizações de apoio jurídico, serviços de saúde, serviços cívicos, associações aliadas. Construímos infraestrutura em conjunto, não co-marketing.",
  "forOrgs.tiers.partner.list1":
    "<b>Ligação operacional:</b> ponte de casos, encaminhamento da linha de apoio, protocolo conjunto",
  "forOrgs.tiers.partner.list2":
    "Canal de moderação partilhado quando apropriado",
  "forOrgs.tiers.partner.list3":
    "Trabalho de advocacia coassinado · qualquer lado pode discordar publicamente",
  "forOrgs.tiers.partner.list4":
    "Listado em Parceiros com uma página de caso dedicada",
  "forOrgs.tiers.partner.list5":
    "<b>Pagamento por caso</b> para serviços prestados pelo parceiro (ex.: 45 €/consulta jurídica)",
  "forOrgs.tiers.partner.footnote":
    "Para: organizações cívicas, de advocacia, de saúde, e alinhadas com a missão. A seleção é lenta e rara. <b>No máximo dois novos parceiros operacionais por ano.</b>",
  "forOrgs.tiers.partner.proposeCta": "Propor uma parceria",
  "forOrgs.tiers.funder.name": "Financiador de programa",
  "forOrgs.tiers.funder.pricePeriod": "/ ano · programa específico",
  "forOrgs.tiers.funder.dek":
    "Para fundações, entidades públicas, e organizações financiadoras a apoiar um programa específico — o fundo de microapoios, a revista, os espaços seguros, o acesso a cuidados de saúde trans.",
  "forOrgs.tiers.funder.list1":
    "Relatórios específicos do programa · trimestrais",
  "forOrgs.tiers.funder.list2":
    "Crédito na página do programa em texto simples",
  "forOrgs.tiers.funder.list3":
    "Sem presença em toda a plataforma, sem co-branding",
  "forOrgs.tiers.funder.list4": "Auditoria independente anual incluída",
  "forOrgs.tiers.funder.list5":
    "Discriminação pública no relatório de transparência",
  "forOrgs.tiers.funder.footnote":
    "Para: organizações do nível da Fundação Calouste Gulbenkian e programas da UE. Já recusámos mais de 60 mil euros quando as condições não encaixavam.",
  "forOrgs.tiers.funder.discussCta": "Discutir um financiamento",
  "forOrgs.tiers.funder.discussToast":
    "A abrir a conversa sobre financiamento…",
  "forOrgs.cta.title": "Começa uma <em>conversa.</em>",
  "forOrgs.cta.body":
    'Conta-nos sobre a tua organização num parágrafo. Lemos todas as mensagens no prazo de 5 dias úteis e respondemos pessoalmente — mesmo que a resposta seja "isto não é para nós, para já".',
  "forOrgs.cta.list1": "Para parcerias, normalmente ligamos antes de escrever",
  "forOrgs.cta.list2":
    "Candidaturas a financiamento: inclui uma página de resumo",
  "forOrgs.cta.pressInquiry": "Pedidos de imprensa → <a>Kit de Imprensa</a>",
  "forOrgs.cta.partnerQuestion":
    "Já és parceiro e tens uma pergunta → <a>Contacto</a>",
  "forOrgs.form.nameLabel": "O teu nome",
  "forOrgs.form.namePlaceholder": "Filipa Mendes",
  "forOrgs.form.orgLabel": "Organização",
  "forOrgs.form.orgPlaceholder": "A sua organização",
  "forOrgs.form.emailLabel": "Email",
  "forOrgs.form.emailPlaceholder": "tu@organizacao.exemplo",
  "forOrgs.form.interestLabel": "Área de interesse",
  "forOrgs.form.interest.operational": "Parceria operacional",
  "forOrgs.form.interest.employer": "Empregador verificado",
  "forOrgs.form.interest.funding": "Financiamento de programa",
  "forOrgs.form.interest.other": "Outra coisa (explica na nota)",
  "forOrgs.form.messageLabel": "O que gostarias de construir, num parágrafo",
  "forOrgs.form.messagePlaceholder": "Temos uma linha de apoio LGBTQ+ e…",
  "forOrgs.form.submitCta": "Enviar à equipa de parcerias",
  "forOrgs.form.small":
    "Vai diretamente para a nossa equipa de parcerias. Sem funil de vendas, sem sequência de seguimento. Só uma resposta no prazo de 5 dias úteis.",
  "forOrgs.form.toast":
    "Enviado à nossa equipa de parcerias — vão responder no prazo de 5 dias úteis",

  // ── Diretório — chrome do diretório de negócios + página de detalhe. Os
  //    registos de locais (`directoryPlaces.ts`: nomes, taglines,
  //    avaliações, biografias dos donos) são conteúdo próprio de cada
  //    negócio — ficam em inglês, o mesmo precedente das biografias/
  //    avaliações fictícias de pessoas noutras páginas.
  "directory.hero.eyebrow": "Diretório de negócios queer",
  "directory.hero.title": "Encontra <em>os lugares da tua gente.</em>",
  "directory.hero.sub":
    "Negócios queer e profissionais queer-friendly em Lisboa. Avaliados pela comunidade, mantidos pela comunidade. Quer tenhas acabado de chegar, quer já cá estejas há anos.",
  "directory.hero.note": "Verificado pela comunidade · atualizado mensalmente",
  "directory.search.placeholder": "Pesquisa por nome, bairro, ou tipo…",
  "directory.filterAria": "Filtrar lugares por categoria",
  "directory.cat.all": "Tudo",
  "directory.cat.food": "Comida e bebida",
  "directory.cat.design": "Design e artesanato",
  "directory.cat.health": "Saúde e cuidados",
  "directory.cat.space": "Espaços",
  "directory.cat.culture": "Cultura",
  "directory.cat.tech": "Tecnologia",
  "directory.cat.grooming": "Barbearia e Salão",
  "directory.cat.fitness": "Ginásio e Fitness",
  "directory.loading": "A carregar lugares…",
  "directory.count": "A mostrar <b>{shown}</b> de {total} lugares",
  "directory.empty.title": "Nenhum lugar corresponde a esses filtros",
  "directory.empty.body":
    "Tenta uma categoria mais ampla, menos ambientes ou outra pesquisa — ou limpa os filtros para ver tudo.",
  "directory.noListings.title": "Ainda não há lugares",
  "directory.noListings.body":
    "Este diretório cresce a partir da comunidade. Se tens ou conheces um lugar queer-owned ou queer-friendly em Lisboa, sê o primeiro a adicioná-lo.",
  "directory.clearFilters": "Limpar filtros",
  "directory.clearAll": "Limpar tudo",
  "directory.activeFilters": "Filtrado por",
  "directory.removeFilter": "Remover filtro",
  "directory.onMap": "{count} no mapa",
  "directory.sort.label": "Ordenar",
  "directory.sort.default": "Em destaque",
  "directory.sort.name": "A–Z",
  "directory.sort.hood": "Por bairro",
  "directory.badge.queerOwned": "Negócio queer",
  "directory.badge.friendly": "LGBTQ+ friendly",
  "directory.card.memberRun": "Gerido por uma pessoa da comunidade",
  "directory.card.viewDetails": "Ver detalhes →",
  "directory.submitStrip.title":
    "Conheces um lugar que devia estar <em>aqui?</em>",
  "directory.submitStrip.body":
    "Se tens ou conheces um negócio queer ou queer-friendly em Lisboa que pertence a este diretório, conta-nos. Revemos todas as sugestões antes de as publicar.",
  "directory.submitStrip.cta": "Regista o teu negócio",
  "directory.outro.title":
    "Acabaste de chegar a Lisboa? <em>Não estás a começar do zero.</em>",
  "directory.outro.sub":
    "Junta-te à rede e tem acesso ao diretório completo, recomendações da comunidade, e a uma comunidade que conhece a cidade.",
  "directory.outro.cta": "Pedir um convite",
  "directory.detail.backCta": "← Diretório",
  "directory.detail.badge.verifiedOwned": "Negócio queer verificado",
  "directory.detail.badge.friendly": "LGBTQ+ friendly",
  "directory.detail.reviewsCount": "· {count} avaliações",
  "directory.detail.whatItIsTitle": "O que <em>é, na prática.</em>",
  "directory.detail.goodForTitle":
    "Para que é que a comunidade diz que é <em>bom</em>",
  "directory.detail.goodForSub": "Com base em {count} avaliações.",
  "directory.detail.hoursTitle": "Horário",
  "directory.detail.today": "Hoje",
  "directory.detail.hoursClosed": "Encerrado",
  "directory.detail.openNow": "Aberto agora",
  "directory.detail.closedNow": "Encerrado",
  "directory.detail.reviewsTitle":
    "Avaliações da comunidade · <em>{count}</em>",
  "directory.detail.reviewsSub": "Ordenado por mais úteis.",
  "directory.detail.review.formTitle": "Já cá estiveste? Deixa uma avaliação",
  "directory.detail.review.starsAria": "A tua avaliação",
  "directory.detail.review.starAria": "{count} de 5 estrelas",
  "directory.detail.review.placeholder":
    "Conta como foi a tua visita — o que resultou e para quem é.",
  "directory.detail.review.submit": "Publicar avaliação",
  "directory.detail.review.submitting": "A publicar…",
  "directory.detail.review.successToast": "Obrigada — a tua avaliação está publicada.",
  "directory.detail.review.errorToast":
    "Não foi possível publicar a tua avaliação. Tenta novamente.",
  "directory.detail.review.signInPrompt":
    "Inicia sessão para avaliar este espaço.",
  "directory.detail.review.signInCta": "Iniciar sessão",
  "directory.detail.helpful": "<b>{count}</b> pessoas acharam isto útil",
  "directory.detail.visitWebsite": "Visitar o site →",
  "directory.detail.getInTouch": "Entrar em contacto →",
  "directory.detail.backToDirectory": "Voltar ao diretório",
  "directory.detail.mapAria": "Mapa a mostrar onde fica {name}",
  "directory.detail.whoRunsIt": "Quem gere isto",
  "directory.detail.onQueerPulse": "Na QueerPulse",
  "directory.detail.communityVouched": "Avalizado pela comunidade",
  "directory.detail.viewProfile": "Ver o perfil de {name} →",
  "directory.detail.membersHereLately": "Pessoas por aqui recentemente",
  "directory.detail.upcomingHere": "Próximos eventos aqui",
  "directory.detail.galleryAria": "Fotos de {name}",
  "directory.detail.viewPhoto": "Ver foto",
  "directory.detail.lightboxClose": "Fechar",
  "directory.detail.prevPhoto": "Foto anterior",
  "directory.detail.nextPhoto": "Foto seguinte",
  "directory.relative.yesterday": "Ontem",
  "directory.relative.twoDaysAgo": "há 2 dias",
  "directory.relative.threeDaysAgo": "há 3 dias",
  "directory.relative.lastWeek": "na semana passada",
  "directory.days.monday": "Segunda-feira",
  "directory.days.tuesday": "Terça-feira",
  "directory.days.wednesday": "Quarta-feira",
  "directory.days.thursday": "Quinta-feira",
  "directory.days.friday": "Sexta-feira",
  "directory.days.saturday": "Sábado",
  "directory.days.sunday": "Domingo",

  "directory.editThisListing": "Editar este anúncio",

  // ── Arriving (guia para quem chega a Lisboa) — apenas chrome da página e
  //    das secções. As descrições de bairros, organizações e comunidades
  //    (`arrivingPage.data.ts`, `arrivingPageCards.data.ts`) são conteúdo de
  //    guia da cidade — ficam em inglês, o mesmo precedente das descrições
  //    por cidade da página Cities.
  "arriving.meta.title": "Acabaste de chegar a Lisboa? Um guia queer",
  "arriving.meta.description":
    "Um guia prático para pessoas LGBTQ+ recém-chegadas a Lisboa — bairros acolhedores, recursos de saúde, noções básicas de habitação, organizações-chave, e primeiros passos.",
  "arriving.hero.eyebrow": "Acabaste de chegar a Lisboa",
  "arriving.hero.title":
    "Queer e acabaste de chegar a Lisboa? <em>Bem-vinde.</em>",
  "arriving.hero.body":
    "Esta cidade tem muito para nós — uma comunidade queer real e enraizada, bairros acolhedores, organizações a fazer um trabalho sério, e pessoas que vão genuinamente ajudar-te a instalares-te. Aqui está o que precisas de saber primeiro.",
  "arriving.neighbourhoods.eyebrow": "Os bairros de Lisboa",
  "arriving.neighbourhoods.title": "Onde é que a vida queer <em>acontece.</em>",
  "arriving.neighbourhoods.intro":
    "Lisboa não tem um único bairro queer — tem vários bolsões, cada um com o seu próprio caráter. Aqui vai um guia honesto sobre onde está a comunidade.",
  "arriving.health.eyebrow": "Saúde",
  "arriving.health.title":
    "Cuidados de saúde em Lisboa — <em>o que precisas de saber.</em>",
  "arriving.health.intro":
    "Portugal tem um serviço nacional de saúde (SNS) no qual te podes inscrever. Os cuidados afirmativos para pessoas trans melhoraram muito — mas é preciso saber onde procurar.",
  "arriving.housing.eyebrow": "Habitação",
  "arriving.housing.title":
    "Encontrar um lugar para viver — <em>com honestidade.</em>",
  "arriving.housing.intro":
    "O mercado de habitação em Lisboa é caro e competitivo. Aqui vai um retrato honesto do que esperar, e onde procurar ajuda.",
  "arriving.orgs.eyebrow": "Organizações",
  "arriving.orgs.title": "Conhece estas <em>três primeiro.</em>",
  "arriving.orgs.intro":
    "Estas são as organizações mais úteis nas tuas primeiras semanas em Lisboa — para apoio jurídico, saúde mental, ou simplesmente para te ligares à comunidade.",
  "arriving.firstStep.eyebrow": "O teu primeiro passo",
  "arriving.firstStep.title": "Vem a algo <em>presencialmente.</em>",
  "arriving.firstStep.intro":
    "Tudo nesta página é útil. Mas a melhor coisa que podes fazer é aparecer num encontro. O próximo já aí vem:",
  "arriving.firstStep.rsvpCta": "Vou estar lá →",
  "arriving.commQuick.eyebrow": "Por onde começar",
  "arriving.commQuick.title":
    "Três comunidades para <em>quem chega agora.</em>",
  "arriving.commQuick.intro":
    "Não sabes por onde começar? Estas três comunidades são particularmente acolhedoras para quem é novo em Lisboa.",
  "arriving.commQuick.browseCta": "Ver todas as comunidades →",
  "arriving.outro.title": "Vamos conhecer <em>a comunidade?</em>",
  "arriving.outro.sub":
    "Pede um convite para a QueerPulse e ganha acesso à rede completa — pessoas, encontros, o quadro, e tudo o resto nesta página.",
  "arriving.outro.cta": "Pedir um convite →",

  // ── Vistos & Residência — conteúdo jurídico/imigração. Traduzido com o
  //    cuidado extra do §6 do brief de i18n: termos oficiais portugueses
  //    (NIF, NISS, AIMA, SNS, Certificado de Registo, união de facto,
  //    Autorização de Residência, IFICI, trabalhador independente, recibos
  //    verdes, Finanças, Segurança Social, Centro de Saúde, Conservatória,
  //    CAPLE/CIPLE) mantidos exatamente como no original — nunca traduzidos
  //    nem adaptados. "Cônjuge" (invariável) usado para "spouse"; "pessoa
  //    parceira" como reformulação neutra para "partner" (prioridade 1 da
  //    ordem de formas inclusivas). As citações de "Community note"
  //    atribuídas a pessoas (nomeadas ou anónimas) e os testemunhos dos
  //    advogados/advogadas avaliados pela comunidade ficam em inglês — são
  //    conteúdo/testemunho, mesmo precedente de `directoryPlaces.ts`.
  "visas.meta.title": "Vistos e residência em Portugal para pessoas LGBTQ+",
  "visas.meta.description":
    "Informação da comunidade sobre vias de visto na UE e fora da UE, autorizações de residência, e imigração para casais do mesmo sexo em Portugal, com advogados de imigração avaliados — não é aconselhamento jurídico.",
  "visas.hero.eyebrow": "Vistos & Residência · Portugal",
  "visas.hero.title":
    "Portugal, legalmente. <em>O teu caminho para a residência.</em>",
  "visas.hero.sub":
    "Informação prática sobre vistos, residência e cidadania em Portugal — e aquilo que os casais e famílias queer precisam de saber que a informação oficial nem sempre esclarece.",
  "visas.hero.note":
    "Informação da comunidade, não aconselhamento jurídico. A lei da imigração muda — confirma sempre com uma pessoa especialista.",
  "visas.routePicker.label": "De onde estás a <em>partir?</em>",
  "visas.routePicker.euCitizen.name": "Cidadania da UE / EEE",
  "visas.routePicker.euCitizen.desc":
    "Aplica-se a livre circulação. O registo é simples, mas obrigatório.",
  "visas.routePicker.euCitizen.cta": "Cidadania da UE →",
  "visas.routePicker.remoteWorker.name": "Trabalho remoto / rendimento passivo",
  "visas.routePicker.remoteWorker.desc":
    "A viver de poupanças, rendimento de arrendamento, trabalho independente ou emprego remoto.",
  "visas.routePicker.remoteWorker.cta": "Visto D7 →",
  "visas.routePicker.digitalNomad.name": "Nómada digital",
  "visas.routePicker.digitalNomad.desc":
    "A trabalhar remotamente para uma entidade empregadora não portuguesa, com rendimento mais elevado.",
  "visas.routePicker.digitalNomad.cta": "Nómada Digital (D8) →",
  "visas.routePicker.jobOffer.name": "Proposta de emprego em Portugal",
  "visas.routePicker.jobOffer.desc":
    "Tens ou estás à procura de emprego junto de uma entidade portuguesa.",
  "visas.routePicker.jobOffer.cta": "Vistos de Trabalho →",
  "visas.routePicker.partner.name": "A juntar-te a uma pessoa parceira aqui",
  "visas.routePicker.partner.desc":
    "A tua pessoa parceira já está em Portugal ou muda-se contigo.",
  "visas.routePicker.partner.cta": "Trazer uma Pessoa Parceira →",

  "visas.tabs.eu.label": "Cidadania da UE",
  "visas.tabs.eu.headTitle": "Pessoas cidadãs da <em>UE e do EEE</em>",
  "visas.tabs.eu.headText":
    "Pessoas cidadãs da UE e do EEE têm o direito de viver e trabalhar em Portugal sem visto. Ainda assim precisas de te registar — e, para casais queer, há questões específicas a conhecer sobre trazer uma pessoa parceira de fora da UE.",
  "visas.tabs.eu.card1.eyebrow": "Registo",
  "visas.tabs.eu.card1.title": "Certificado de Registo",
  "visas.tabs.eu.card1.body":
    "Pessoas cidadãs da UE que fiquem mais de 3 meses têm de se registar na Câmara Municipal da sua área. Vais precisar do passaporte, comprovativo de morada e comprovativo de rendimento ou de emprego. O certificado é normalmente emitido no próprio dia. Custo: 15 €.",
  "visas.tabs.eu.card1.tag": "Simples, baixo custo",
  "visas.tabs.eu.card2.eyebrow": "Os teus direitos",
  "visas.tabs.eu.card2.title": "O que a residência na UE te dá",
  "visas.tabs.eu.card2.body":
    "Acesso total ao SNS (com NISS), o direito de trabalhar sem restrições, o direito de votar em eleições locais e europeias, e o direito de trazer familiares. Após 5 anos de residência legal contínua, podes candidatar-te à residência permanente ou à cidadania.",
  "visas.tabs.eu.card3.eyebrow": "Pessoa parceira de fora da UE",
  "visas.tabs.eu.card3.title":
    "Reunificação familiar para casais do mesmo sexo",
  "visas.tabs.eu.card3.body":
    "Se és cidadã ou cidadão da UE e a tua pessoa parceira não é, ela pode juntar-se a ti em Portugal ao abrigo das regras de livre circulação da UE — incluindo cônjuges do mesmo sexo e uniões de facto registadas. O Tribunal de Justiça da União Europeia (acórdão Coman, 2018) estabeleceu que os Estados-membros da UE têm de reconhecer cônjuges do mesmo sexo para efeitos de livre circulação, mesmo que não tenham casamento entre pessoas do mesmo sexo a nível interno.",
  "visas.tabs.eu.card3.tag": "Direitos plenos de parceria",
  "visas.tabs.eu.card3.link": "Detalhes do visto para pessoa parceira →",

  "visas.tabs.d7.label": "D7 — Rendimento Passivo",
  "visas.tabs.d7.headTitle": "D7 — <em>Visto de Rendimento Passivo</em>",
  "visas.tabs.d7.headText":
    'O D7 é o visto de "rendimento passivo" ou de "reforma" de Portugal. Apesar do nome, é usado por qualquer pessoa com rendimento estável de trabalho remoto, trabalho independente, pensões, rendas ou investimentos. Uma das vias mais populares para pessoas queer que se mudam para Portugal.',
  "visas.tabs.d7.card1.eyebrow": "Para quem é",
  "visas.tabs.d7.card1.title": "Elegibilidade",
  "visas.tabs.d7.card1.body":
    "Pessoas de fora da UE que consigam demonstrar um rendimento passivo ou remoto estável. O limiar mínimo de rendimento ronda os 820 €/mês (o salário mínimo português), mas alguns consulados pedem bastante mais. Os pedidos são feitos no consulado português do teu país de origem, antes de chegares.",
  "visas.tabs.d7.card1.tag": "Pede antes de chegar",
  "visas.tabs.d7.card2.eyebrow": "O que obténs",
  "visas.tabs.d7.card2.title": "Condições do visto",
  "visas.tabs.d7.card2.body":
    "Visto inicial válido por 4 meses; é trocado por uma autorização de residência de 2 anos (Autorização de Residência) à chegada a Portugal. Renovável por 3 anos, seguida de residência permanente. Tens de passar pelo menos 6 meses por ano em Portugal para a manter. Pessoas parceiras e filhos a cargo podem ser incluídos.",
  "visas.tabs.d7.card3.eyebrow": "Impostos",
  "visas.tabs.d7.card3.title": "Regime fiscal do IFICI",
  "visas.tabs.d7.card3.body":
    "Portugal substituiu o regime do NHR no final de 2023 pelo regime do IFICI (informalmente chamado NHR 2.0). Está agora direcionado a profissões elegíveis (tecnologia, investigação, artes). Quem tem apenas o D7 deixou de qualificar automaticamente. O teu rendimento será tributado como o de qualquer pessoa residente comum. Procura aconselhamento fiscal antes de te mudares.",
  "visas.tabs.d7.card3.link": "Contactos de aconselhamento fiscal →",
  "visas.tabs.d7.step1.title": "Pede no consulado português do teu país",
  "visas.tabs.d7.step1.text":
    "Submete comprovativo de rendimento, registo criminal limpo, seguro de saúde e comprovativo de alojamento em Portugal.",
  "visas.tabs.d7.step1.note": "Processamento de 2–8 semanas",
  "visas.tabs.d7.step2.title": "Chega a Portugal com o teu visto",
  "visas.tabs.d7.step2.text":
    "Tens 4 meses para marcar a tua marcação na AIMA e trocar o visto por uma autorização de residência.",
  "visas.tabs.d7.step3.title": "Marcação na AIMA",
  "visas.tabs.d7.step3.text":
    "A AIMA (que substituiu o SEF em 2023) trata das autorizações de residência. Marca com antecedência — as esperas podem ser longas. Leva todos os documentos originais.",
  "visas.tabs.d7.step3.note": "Marca online em aima.gov.pt",
  "visas.tabs.d7.step4.title": "Recebe o teu cartão AR",
  "visas.tabs.d7.step4.text":
    "O teu cartão de Autorização de Residência é o comprovativo da tua residência legal. Guarda-o bem — é usado para tudo.",

  "visas.tabs.d8.label": "Nómada Digital (D8)",
  "visas.tabs.d8.headTitle": "Visto de <em>Nómada Digital (D8)</em>",
  "visas.tabs.d8.headText":
    "O visto D8 de Portugal, introduzido em 2022, foi pensado para pessoas que trabalham remotamente para, ou prestam serviços a, empresas fora de Portugal. Tem um limiar de rendimento mais alto do que o D7, mas é cada vez mais popular.",
  "visas.tabs.d8.card1.eyebrow": "Requisitos",
  "visas.tabs.d8.card1.title": "O que precisas para te qualificares",
  "visas.tabs.d8.card1.body":
    "Comprovativo de emprego remoto ou contratos com clientes não portugueses. O requisito de rendimento é normalmente 4× o salário mínimo português (cerca de 3 280 €/mês). Seguro de saúde com cobertura em Portugal. Registo criminal limpo. NIF português (nalguns casos pode ser obtido antes do visto).",
  "visas.tabs.d8.card1.tag": "Limiar de rendimento mais alto do que o D7",
  "visas.tabs.d8.card2.eyebrow": "Processo",
  "visas.tabs.d8.card2.title": "Como pedir",
  "visas.tabs.d8.card2.body":
    "Tal como o D7, os pedidos são feitos no consulado português antes da chegada. À chegada, trocas por uma autorização de residência de 2 anos. Familiares (incluindo pessoas parceiras do mesmo sexo) podem ser incluídos no pedido ou pedir reunificação familiar depois de receberes a tua autorização.",
  "visas.tabs.d8.card3.eyebrow": "IFICI / Impostos",
  "visas.tabs.d8.card3.title": "Tratamento fiscal",
  "visas.tabs.d8.card3.body":
    "Quem tem D8 e trabalha em funções elegíveis de tecnologia ou investigação pode qualificar-se para o regime IFICI (taxa fixa de 20% de IRS durante até 10 anos). Não é automático — tens de te candidatar e a tua profissão tem de ser elegível. Confirma com uma pessoa especialista fiscal antes de assumir que vais beneficiar.",
  "visas.tabs.d8.card3.link": "Aconselhamento fiscal →",

  "visas.tabs.work.label": "Vistos de Trabalho",
  "visas.tabs.work.headTitle": "Vistos de <em>trabalho</em>",
  "visas.tabs.work.headText":
    "Se tens uma proposta de emprego de uma entidade empregadora portuguesa, ou estás à procura de uma, há vias de visto específicas. Estas são geralmente mais diretas do que os vistos de rendimento passivo, mas exigem o envolvimento da entidade empregadora.",
  "visas.tabs.work.card1.eyebrow": "Visto D1",
  "visas.tabs.work.card1.title": "Visto de trabalho",
  "visas.tabs.work.card1.body":
    "A via habitual para pessoas de fora da UE com uma proposta de emprego de uma entidade portuguesa. A entidade empregadora normalmente precisa de mostrar que não conseguiu preencher a vaga com uma pessoa cidadã da UE, embora este requisito seja muitas vezes dispensado na prática para funções qualificadas. Pede no consulado com o teu contrato de trabalho.",
  "visas.tabs.work.card2.eyebrow": "À procura de emprego",
  "visas.tabs.work.card2.title": "Visto de Procura de Emprego",
  "visas.tabs.work.card2.body":
    "Visto de 180 dias que te permite vir a Portugal à procura de trabalho. Exige comprovativo de fundos suficientes e qualificações. Assim que encontrares emprego, podes converter para um visto de trabalho D1 sem sair do país. Útil se quiseres chegar antes de garantir emprego.",
  "visas.tabs.work.card2.tag": "180 dias para encontrar trabalho",
  "visas.tabs.work.card3.eyebrow": "Trabalho independente",
  "visas.tabs.work.card3.title": "Trabalhador independente (D2)",
  "visas.tabs.work.card3.body":
    "Para freelancers e profissionais independentes que já identificaram clientes ou oportunidades em Portugal. Vais precisar de um plano de negócio e prova de rendimento previsto. Registares-te como trabalhador independente (recibos verdes) é a estrutura fiscal que a maioria das pessoas residentes por conta própria utiliza.",

  "visas.tabs.partner.label": "Trazer uma Pessoa Parceira",
  "visas.tabs.partner.headTitle": "Trazer uma <em>pessoa parceira</em>",
  "visas.tabs.partner.headText":
    "Portugal reconhece o casamento entre pessoas do mesmo sexo, a união de facto e a coabitação de longo prazo. O que isto significa para a residência depende das vossas nacionalidades e da via de visto que estás a usar — mas as notícias da comunidade são, de um modo geral, boas.",
  "visas.tabs.partner.card1.eyebrow": "Casamento entre pessoas do mesmo sexo",
  "visas.tabs.partner.card1.title":
    "Portugal reconhece plenamente o teu casamento",
  "visas.tabs.partner.card1.body":
    "Portugal reconhece o casamento entre pessoas do mesmo sexo desde 2010. Um casamento legal celebrado em qualquer parte do mundo é reconhecido para efeitos de residência em Portugal. O teu cônjuge tem direito a juntar-se a ti através de reunificação familiar — independentemente da sua nacionalidade ou do país onde casaram.",
  "visas.tabs.partner.card1.tag": "Reconhecimento legal pleno",
  "visas.tabs.partner.card2.eyebrow": "Sem casamento",
  "visas.tabs.partner.card2.title": "Pessoas parceiras sem estatuto formal",
  "visas.tabs.partner.card2.body":
    "Sem casamento, a coabitação de longo prazo (união de facto, normalmente 2 ou mais anos) é reconhecida para efeitos de reunificação familiar. Vais precisar de documentar a relação — contas partilhadas, contas conjuntas, correspondência. Casar ou constituir união de facto primeiro é muitas vezes administrativamente mais simples.",
  "visas.tabs.partner.card3.eyebrow":
    "Pessoa cidadã da UE + pessoa parceira de fora da UE",
  "visas.tabs.partner.card3.title": "O acórdão Coman",
  "visas.tabs.partner.card3.body":
    "O acórdão do Tribunal de Justiça da União Europeia de 2018 (Coman v. Roménia) estabeleceu que os Estados-membros da UE têm de reconhecer cônjuges do mesmo sexo de pessoas cidadãs da UE para efeitos de livre circulação — mesmo em países que não têm casamento entre pessoas do mesmo sexo. Isto significa que uma pessoa cidadã da UE pode trazer o seu cônjuge do mesmo sexo para Portugal, independentemente da posição do seu país de origem.",
  "visas.tabs.partner.card3.tag": "Proteção do tribunal da UE",
  "visas.tabs.partner.card3.link":
    "Fala com um advogado ou advogada de imigração →",
  "visas.tabs.partner.card4.eyebrow": "Reunificação familiar",
  "visas.tabs.partner.card4.title": "O processo para pessoas parceiras",
  "visas.tabs.partner.card4.body":
    "Depois de teres a tua própria autorização de residência, a tua pessoa parceira pede reunificação familiar na AIMA. Vai precisar do teu cartão AR, comprovativo da relação, comprovativo de alojamento e prova de rendimento. O processamento demora 60 a 90 dias. Durante este período, pode normalmente permanecer em Portugal com um visto de curta duração.",

  "visas.tabs.citizenship.label": "Cidadania",
  "visas.tabs.citizenship.headTitle":
    "Cidadania & <em>residência permanente</em>",
  "visas.tabs.citizenship.headText":
    "Portugal oferece um dos caminhos mais claros para a cidadania na Europa. Após 5 anos de residência legal, podes candidatar-te à residência permanente ou à naturalização como cidadã ou cidadão português.",
  "visas.tabs.citizenship.card1.eyebrow": "Prazo",
  "visas.tabs.citizenship.card1.title": "5 anos até à cidadania",
  "visas.tabs.citizenship.card1.body":
    "Após 5 anos de residência legal contínua, tens direito a candidatar-te à cidadania portuguesa. Requisitos: português básico (nível A2), registo criminal limpo, prova de ligação a Portugal, e nenhuma ausência superior a 6 meses consecutivos ou 8 meses no total durante os 5 anos.",
  "visas.tabs.citizenship.card1.tag": "Inclui passaporte da UE",
  "visas.tabs.citizenship.card2.eyebrow": "Residência permanente",
  "visas.tabs.citizenship.card2.title": "Alternativa à cidadania",
  "visas.tabs.citizenship.card2.body":
    "Também podes candidatar-te à residência permanente (Autorização de Residência Permanente) após 5 anos. Isto dá-te o direito indefinido de permanecer, sem os requisitos de língua e de cidadania. Algumas pessoas preferem esta via, mantendo a sua nacionalidade original.",
  "visas.tabs.citizenship.card3.eyebrow": "Língua portuguesa",
  "visas.tabs.citizenship.card3.title": "Requisito de A2",
  "visas.tabs.citizenship.card3.body":
    "O requisito de língua portuguesa para a cidadania é o nível A2 (básico) — conversacional, não fluente. Podes comprová-lo através de um teste CAPLE ou CIPLE aprovado, ou mostrando escolaridade em português. O fórum da comunidade tem recomendações de professoras e professores de português queer-friendly.",
  "visas.tabs.citizenship.card3.link": "Recursos de aprendizagem da língua →",

  "visas.ground.title": "No <em>terreno</em>",
  "visas.ground.sub":
    "Primeiros passos práticos, seja qual for a tua via de visto.",
  "visas.ground.nif.label": "Primeiro",
  "visas.ground.nif.title": "NIF — Número de contribuinte",
  "visas.ground.nif.body":
    "Precisas de um Número de Identificação Fiscal para quase tudo: abrir uma conta bancária, assinar um contrato de arrendamento, comprar um plano de telemóvel. Consegue-o nas Finanças com o teu passaporte. Pessoas cidadãs da UE: leva o passaporte. Fora da UE: leva o passaporte + comprovativo de morada. Também podes usar um serviço de representante fiscal se ainda não estiveres em Portugal.",
  "visas.ground.niss.label": "Segundo",
  "visas.ground.niss.title": "NISS — Segurança social",
  "visas.ground.niss.body":
    "O teu Número de Identificação de Segurança Social dá-te acesso aos cuidados de saúde do SNS e regista as tuas contribuições. Regista-te no Centro de Emprego e Formação Profissional ou na Segurança Social da tua área. Necessário antes de poderes aceder a consultas do SNS.",
  "visas.ground.aima.label": "Local-chave",
  "visas.ground.aima.title": "AIMA",
  "visas.ground.aima.body":
    "A AIMA (Agência para a Integração, Migrações e Asilo) substituiu o SEF em outubro de 2023. Trata de todas as autorizações de residência, renovações e reunificação familiar. Marca consultas online em aima.gov.pt — as esperas são longas, marca assim que chegares.",
  "visas.ground.sns.label": "Saúde",
  "visas.ground.sns.title": "Acesso ao SNS",
  "visas.ground.sns.body":
    "Regista-te num médico de família (Centro de Saúde) da tua área, usando o teu cartão AR ou o certificado de registo da UE, mais o NISS. Os tempos de espera são longos — muitas pessoas da comunidade usam seguro de saúde privado a par do acesso ao SNS. Consulta a página de Bem-estar para prestadores de cuidados de saúde queer-friendly.",

  "visas.lawyers.title":
    "Advocacia de imigração <em>avaliada pela comunidade</em>",
  "visas.lawyers.emptyBody":
    "Estamos a construir um diretório de advogados de imigração LGBTQ+-friendly avaliado pela comunidade. Ainda não está pronto — até estar, as melhores recomendações vêm de membros que já passaram pelo processo. Pergunta no tópico do fórum sobre vistos.",
  "visas.lawyers.forumCta": "Pergunta no tópico do fórum sobre vistos →",

  "visas.outro.title": "Estás a construir uma vida <em>aqui.</em>",
  "visas.outro.sub": "A papelada é temporária. A comunidade é permanente.",
  "visas.outro.settlingCta": "Guia de instalação →",
  "visas.outro.askCta": "Pergunta à comunidade",

  // ── Mapa (guia da cidade queer de Lisboa) — chrome de página/filtros/
  //    barra lateral. Nomes/moradas/horários/notas de espaços
  //    (`map.data.ts`) são conteúdo de diretório de negócios — ficam em
  //    inglês, mesmo precedente de `directoryPlaces.ts`. Nomes de bairros
  //    são nomes próprios de Lisboa — mantidos iguais. Os ids de `type`/
  //    `vibe` mantêm-se como strings canónicas em inglês (valores
  //    guardados/de filtro); só os rótulos apresentados abaixo são
  //    traduzidos.
  "map.filter.type.all": "Todos",
  "map.filter.type.bar": "Bar",
  "map.filter.type.club": "Discoteca",
  "map.filter.type.cafe": "Café",
  "map.filter.type.clinic": "Clínica",
  "map.filter.type.bookshop": "Livraria",
  "map.filter.type.sauna": "Sauna",
  "map.filter.type.communitySpace": "Comunidade",
  "map.filter.type.barbershop": "Barbearia / Cabeleireiro",
  "map.filter.type.gym": "Ginásio",
  "map.filter.vibe.mixed": "misto",
  "map.filter.vibe.mascLeaning": "tendência masc",
  "map.filter.vibe.femmeLeaning": "tendência femme",
  "map.filter.vibe.transCentred": "centrado em pessoas trans",
  "map.filter.vibe.soberFriendly": "acolhedor para sóbries",
  "map.sidebar.allVenues": "Todos os espaços",
  "map.sidebar.venueCount_one": "<b>{count}</b> espaço",
  "map.sidebar.venueCount_other": "<b>{count}</b> espaços",
  "map.sidebar.clear": "Limpar",
  "map.sidebar.empty": "Nenhum espaço corresponde a estes filtros.",
  "map.jumpToList": "Ver a lista · {count}",
  "map.venueCard.beenCount_one": "<b>{count}</b> pessoa já esteve aqui",
  "map.venueCard.beenCount_other": "<b>{count}</b> pessoas já estiveram aqui",
  "map.venueCard.beenThere": "Já estiveste aqui",
  "map.venueCard.markBeen": "Já estive aqui",
  "map.svg.filterByAria": "Filtrar o mapa por {bairro}",
  "map.mapError": "Não foi possível carregar o mapa. A lista de espaços abaixo continua a funcionar.",
  "map.mapLoading": "A dar <em>vida</em> ao mapa…",
  "map.pinAria": "{name} — {type}",
  "map.clusterAria_one": "{count} espaço aqui — ampliar",
  "map.clusterAria_other": "{count} espaços aqui — ampliar",

  // ── Local — explorador combinado de locais em lista/mapa.
  "local.cat.nightlife": "Noite",
  "local.view.list": "Lista",
  "local.view.map": "Mapa",
  "local.view.toggleAria": "Escolher vista de lista ou mapa",
  "local.card.seeFullDetails": "Ver detalhes",
  "local.filter.searchPlaceholder": "Procurar espaços e locais…",
  "local.filter.categoryAria": "Filtrar por categoria",
  "local.filter.vibeLabel": "Ambiente",
  "local.filter.vibeVenueNote": "Os filtros de ambiente aplicam-se a espaços",
  "local.venue.back": "Voltar ao mapa",
  "local.venue.address": "Morada",
  "local.venue.hours": "Horário",
  "local.venue.accessible": "Acesso para cadeira de rodas",
  "local.venue.onMap": "Ver no mapa",
  "local.venue.been_one": "{count} pessoa já esteve aqui",
  "local.venue.been_other": "{count} pessoas já estiveram aqui",

  // ── Constituição — texto de governação constitucional. Literal e preciso;
  //    números, percentagens e referências a artigos mantidos exatos.
  //    "Associação QueerPulse", "NIPC" e "ILGA Portugal" são nomes próprios,
  //    mantidos iguais. "Pessoa-membro"/"pessoas-membro" (nunca "Membro/s")
  //    por indicação do glossário. `hero.title`/`hero.meta` são uma
  //    ADAPTAÇÃO de conteúdo deliberada, não uma tradução literal: a versão
  //    inglesa apresenta-se como "a tradução inglesa" de um original em
  //    português — uma moldura que só faz sentido para quem está a ler a
  //    versão inglesa. Na versão pt-PT essa moldura deixa de fazer sentido
  //    (quem lê já está a ler em português), por isso a referência
  //    "esta é a tradução inglesa" foi omitida em vez de traduzida à letra —
  //    assinalado no relatório da sweep.
  "constitution.meta.title": "A constituição da QueerPulse: doze artigos",
  "constitution.meta.description":
    "A constituição da Associação QueerPulse — doze artigos em linguagem simples sobre finalidade, adesão e governação, ratificada a 14 de novembro de 2025.",
  "constitution.artNumLabel": "Artigo",
  "constitution.hero.eyebrow":
    "Constituição · v1.4 · ratificada a 14 nov. 2025",
  "constitution.hero.title": "As regras, <em>em português claro.</em>",
  "constitution.hero.dek1":
    "O documento organizativo formal da <b>Associação QueerPulse</b>, a associação sem fins lucrativos que gere a plataforma. Escrito pelas oito pessoas fundadoras. Ratificado na primeira assembleia. <em>Emendado quatro vezes desde então.</em>",
  "constitution.hero.dek2":
    "É intencionalmente curto. Doze artigos, linguagem simples, sem subcláusulas aninhadas. Tudo o que exige mais detalhe está no Código de Conduta, nos estatutos, ou nas resoluções da Assembleia Anual.",
  "constitution.hero.meta":
    "<b>Registada:</b> Associação QueerPulse · NIPC 517 426 884 · Lisboa · <b>Texto:</b> português, juridicamente vinculativo.",

  "constitution.art1.toc": "I · Objeto",
  "constitution.art1.title": "Objeto",
  "constitution.art1.clause1":
    "A QueerPulse existe para prestar <strong>apoio profissional, social, cultural e material</strong> a pessoas LGBTQ+ na cidade de Lisboa, e (nos termos do Artigo X) noutras cidades, uma vez cumpridas condições específicas.",
  "constitution.art1.clause2":
    "A organização é uma <strong>não-lucrativa associação</strong> — uma associação sem fins lucrativos. Não detém capital próprio, não distribui lucros, e só pode ser dissolvida nos termos do Artigo XI.",
  "constitution.art1.clause3":
    "Sempre que esta Constituição entre em conflito com o Manifesto, prevalece este documento. O Manifesto define valores; este define o funcionamento.",

  "constitution.art2.toc": "II · Pessoas-membro",
  "constitution.art2.title": "Pessoas-membro",
  "constitution.art2.clause1":
    "É <strong>pessoa-membro</strong> qualquer indivíduo avalizado por uma pessoa-membro existente, que tenha concluído uma breve conversa de admissão com a equipa de moderação, e aceite o Código de Conduta.",
  "constitution.art2.clause2":
    "As pessoas-membro podem estar num de três escalões: <em>Solidariedade</em> (gratuito), <em>Membro</em> (36 €/ano), ou <em>Sustentador/a</em> (96 €/ano). Todos os escalões têm direitos de voto iguais.",
  "constitution.art2.clause3":
    "Nenhum estatuto de uma pessoa-membro — incluindo idade, nacionalidade, língua, identidade, ocupação ou visibilidade — afeta os seus direitos de voto ou o tratamento em moderação.",

  "constitution.art3.toc": "III · Aval",
  "constitution.art3.title": "Aval",
  "constitution.art3.clause1":
    "Cada pessoa-membro existente pode avalizar até <strong>duas</strong> novas pessoas-membro por ano civil. O aval associa o nome de quem avaliza ao registo da nova pessoa-membro, permanentemente.",
  "constitution.art3.clause2":
    "O limite de avales pode ser temporariamente elevado por voto da Assembleia até um máximo de quatro por pessoa-membro, durante um ano civil, em casos de lacunas identificadas na rede.",
  "constitution.art3.clause3":
    "Uma pessoa-membro cujos três avales mais recentes tenham sido todos removidos ao abrigo do Artigo VIII perde o direito de avalizar durante doze meses.",

  "constitution.art4.toc": "IV · Assembleia",
  "constitution.art4.title": "A <em>Assembleia</em> Anual",
  "constitution.art4.clause1":
    "A Assembleia reúne uma vez por ano, em novembro, durante pelo menos um dia inteiro. É o órgão de decisão máximo da associação.",
  "constitution.art4.clause2":
    "Cada pessoa-membro tem direito a um voto por resolução, exercido presencialmente, online, ou de forma assíncrona até ao encerramento da votação.",
  "constitution.art4.clause3":
    "O quórum é de <strong>10% das pessoas-membro ativas</strong>, ou 100 pessoas-membro, o que for maior. As resoluções são aprovadas por maioria simples, salvo indicação em contrário deste documento ou do Código de Conduta.",
  "constitution.art4.clause4":
    "A agenda é publicada com 30 dias de antecedência e está aberta a emendas escritas de qualquer grupo de 10 pessoas-membro até 7 dias antes da reunião.",
  "constitution.art4.quote":
    '"Esta Assembleia é o chão sobre o qual tudo o resto assenta. <em>Perde-la, e ficas só com uma aplicação.</em>"',

  "constitution.art5.toc": "V · Círculos",
  "constitution.art5.title": "Círculos <em>rotativos</em>",
  "constitution.art5.clause1":
    "As decisões operacionais são tomadas por <strong>círculos rotativos</strong>: pequenas comissões permanentes de 3 a 7 pessoas-membro cada, com mandatos de 12 meses no máximo.",
  "constitution.art5.clause2":
    "Círculos ativos na v1.4: <em>moderação, subsídios, finanças, acolhimento, editorial, técnico.</em> A Assembleia pode criar ou dissolver círculos por maioria simples.",
  "constitution.art5.clause3":
    "Nenhuma pessoa-membro pode servir em mais de dois círculos em simultâneo, e nenhum círculo pode ter mais de metade das suas pessoas-membro provenientes de uma mesma geração de admissão anual.",

  "constitution.art6.toc": "VI · Dinheiro",
  "constitution.art6.title": "Dinheiro",
  "constitution.art6.clause1":
    "<strong>Pelo menos 90% de cada euro recebido</strong> tem de ser gasto em programas comunitários, equipa e infraestrutura — não em custos indiretos. A meta é 96% e tem sido cumprida todos os anos desde 2024.",
  "constitution.art6.clause2":
    "O orçamento anual é aprovado pela Assembleia. O círculo de finanças pode reequilibrar entre categorias ao longo do ano sem nova aprovação, até 10% por categoria.",
  "constitution.art6.clause3":
    "As contas anuais são <strong>auditadas por uma entidade terceira independente</strong> sem qualquer relação financeira com a associação, e publicadas na íntegra como parte do Relatório de Transparência.",
  "constitution.art6.clause4":
    "A associação não pode contrair dívidas superiores a 10 000 € sem aprovação explícita da Assembleia.",

  "constitution.art7.toc": "VII · Expressão",
  "constitution.art7.title": "Expressão & <em>moderação</em>",
  "constitution.art7.clause1":
    "A comunidade é moderada de acordo com o Código de Conduta, ratificado em separado e alterável por maioria qualificada da Assembleia (60%).",
  "constitution.art7.clause2":
    "<strong>A associação não modera críticas a si própria.</strong> Publicações críticas da associação, das suas decisões, ou dos seus dirigentes não podem ser removidas ao abrigo de nenhuma cláusula do Código de Conduta.",
  "constitution.art7.clause3":
    "As decisões de moderação são recorríveis junto de um painel de recurso permanente composto por três pessoas-membro que não pertençam ao círculo que decidiu. Os recursos revertem decisões em cerca de 11% dos casos (valor de 2025).",

  "constitution.art8.toc": "VIII · Remoção",
  "constitution.art8.title": "Remoção",
  "constitution.art8.clause1":
    "As pessoas-membro só podem ser removidas através da escala de moderação especificada no §04 do Código de Conduta, e apenas por decisão do círculo de moderação, ratificada por mais uma pessoa moderadora independente.",
  "constitution.art8.clause2":
    "A remoção é recorrível <strong>uma vez</strong>, junto do painel de recurso, no prazo de 14 dias a contar da data de efeito.",
  "constitution.art8.clause3":
    "Os dados de uma pessoa-membro removida são eliminados ou anonimizados nos termos da Política de Privacidade no prazo de 30 dias. Os registos do caso são conservados durante 36 meses, para eventual necessidade legal.",

  "constitution.art9.toc": "IX · Parceiros",
  "constitution.art9.title": "Parceiros",
  "constitution.art9.clause1":
    "A associação pode celebrar <strong>parcerias operacionais</strong> com outras organizações, em termos aprovados pela Assembleia. Novas parcerias operacionais estão limitadas a duas por ano.",
  "constitution.art9.clause2":
    "Nenhuma parceria pode conceder a uma organização parceira acesso a dados de pessoas-membro para além do operacionalmente necessário, e apenas com o consentimento explícito da pessoa-membro em causa.",
  "constitution.art9.clause3":
    "Qualquer uma das partes de uma parceria pode discordar publicamente das posições da outra. <em>Coligação não é consenso.</em>",

  "constitution.art10.toc": "X · Expansão",
  "constitution.art10.title": "Expansão",
  "constitution.art10.clause1":
    "A associação só pode abrir em cidades além de Lisboa quando todas estas condições se verificarem: (a) pelo menos uma pessoa moderadora está no país; (b) uma parceira operacional local está firmada; (c) uma revisão jurídica local está concluída; (d) entre oito e doze pessoas-membro fundadoras se comprometeram com o lançamento-piloto.",
  "constitution.art10.clause2":
    "Cada nova cidade ratifica o seu próprio círculo local e opera ao abrigo desta Constituição, com estatutos específicos da cidade conforme necessário.",

  "constitution.art11.toc": "XI · Dissolução",
  "constitution.art11.title": "Dissolução",
  "constitution.art11.clause1":
    "A associação só pode ser dissolvida por resolução da Assembleia que exija uma <strong>maioria qualificada de 75%</strong> de todas as pessoas-membro ativas, e não apenas das que votam.",
  "constitution.art11.clause2":
    "Em caso de dissolução, todos os ativos remanescentes têm de ser transferidos para uma organização de direitos LGBTQ+ registada escolhida pela Assembleia dissolvente. Nenhum ativo pode ser distribuído a indivíduos.",

  "constitution.art12.toc": "XII · Emendas",
  "constitution.art12.title": "Emendas",
  "constitution.art12.clause1":
    "Esta Constituição só pode ser emendada por resolução da Assembleia que exija uma maioria qualificada de 60% dos votos expressos.",
  "constitution.art12.clause2":
    "As emendas têm de ser circuladas para comentário escrito junto de todas as pessoas-membro, pelo menos 30 dias antes da votação.",
  "constitution.art12.clause3":
    "O versionamento é sequencial (v1.0, v1.1…). O texto integral da versão em vigor é publicado em permanência.",

  "constitution.footer.version":
    "<b>Constituição v1.4</b> · ratificada a 14 nov. 2025 · em vigor desde 1 jan. 2026 ·",
  "constitution.footer.downloadPdf": "Descarregar PDF",
  "constitution.footer.seeAssembly": "Ver a Assembleia",
  "constitution.footer.readCodeOfConduct": "Ler o Código de Conduta",

  // ── Biblioteca de Recursos — chrome de página/filtros/cartão. Os registos
  //    de `RESOURCES` (nome/descrição/etiquetas — organizações externas e
  //    ferramentas da QueerPulse com curadoria) são conteúdo de diretório,
  //    mesmo precedente de `directoryPlaces.ts` / da página Plataformas
  //    abaixo — ficam em inglês. `LIBRARY_SUBPAGES` (rótulo/descrição) é
  //    chrome curto de apresentação, escrito pela plataforma — traduzido.
  "resourceLibrary.meta.title":
    "Recursos queer em Lisboa: saúde, apoio jurídico, habitação e dinheiro",
  "resourceLibrary.meta.description":
    "Coisas que realmente ajudam — uma biblioteca com curadoria de recursos gratuitos e de escala variável de saúde, apoio jurídico, habitação, dinheiro, identidade e segurança para a Lisboa queer.",
  "resourceLibrary.hero.eyebrow": "Biblioteca de Recursos",
  "resourceLibrary.hero.title": "Coisas que <em>realmente ajudam.</em>",
  "resourceLibrary.hero.sub":
    "Guias mantidos pela comunidade, organizações, contactos e ferramentas da QueerPulse — tudo num só lugar pesquisável.",
  "resourceLibrary.stats.resources": "recursos",
  "resourceLibrary.stats.categories": "categorias",
  "resourceLibrary.stats.communityLabel": "Comunidade",
  "resourceLibrary.stats.maintained": "mantida",
  "resourceLibrary.search.placeholder": "Pesquisar recursos…",
  "resourceLibrary.category.all": "Todos",
  "resourceLibrary.category.health": "Saúde",
  "resourceLibrary.category.legal": "Jurídico",
  "resourceLibrary.category.housing": "Habitação",
  "resourceLibrary.category.money": "Dinheiro",
  "resourceLibrary.category.identity": "Identidade",
  "resourceLibrary.category.safety": "Segurança",
  "resourceLibrary.category.community": "Comunidade",
  "resourceLibrary.results_one": "{count} resultado",
  "resourceLibrary.results_other": "{count} resultados",
  "resourceLibrary.empty":
    "Nenhum recurso corresponde — tenta um filtro mais amplo.",
  "resourceLibrary.cost.free": "Gratuito",
  "resourceLibrary.cost.sliding": "Escala variável",
  "resourceLibrary.card.openGuide": "Abrir guia →",
  "resourceLibrary.card.visitSite": "Visitar site ↗",
  "resourceLibrary.outro.title": "Sabes de algo que <em>falta?</em>",
  "resourceLibrary.outro.sub":
    "Todos os recursos aqui foram adicionados por uma pessoa da comunidade. Se algo te ajudou e não está listado, conta-nos.",
  "resourceLibrary.outro.cta": "Sugerir um recurso",
  "resourceLibrary.subpages.eyebrow": "Aprender & pertencer",
  "resourceLibrary.subpages.title": "Começa pelo básico",
  "resourceLibrary.subpages.queer101.label": "Queer 101",
  "resourceLibrary.subpages.queer101.blurb":
    "Acabaste de chegar? Começa pelo básico — identidades, linguagem e comunidade.",
  "resourceLibrary.subpages.glossary.label": "Glossário",
  "resourceLibrary.subpages.glossary.blurb":
    "Definições em linguagem simples para as palavras que a comunidade usa.",
  "resourceLibrary.subpages.intersectionality.label": "Interseccionalidade",
  "resourceLibrary.subpages.intersectionality.blurb":
    "Como as identidades sobrepostas moldam as nossas experiências — e a nossa organização coletiva.",

  // ── Plataformas (a rede queer mais alargada) — chrome de página/filtros.
  //    Os registos de `PLATFORMS` (nome/descrição — apps/organizações
  //    externas nomeadas) são conteúdo de diretório, mesmo precedente da
  //    Biblioteca de Recursos acima — ficam em inglês.
  "platforms.meta.title": "Plataformas e organizações queer a conhecer",
  "platforms.meta.description":
    "Um diretório de aplicações de namoro, media, redes profissionais e organizações de defesa de direitos úteis a pessoas queer — incluindo grupos portugueses como a ILGA Portugal.",
  "platforms.hero.eyebrow": "Plataformas queer",
  "platforms.hero.title": "A rede <em>queer</em> mais alargada.",
  "platforms.hero.sub":
    "Aplicações, media, redes profissionais e organizações de defesa de direitos genuinamente úteis para pessoas queer — para além da própria QueerPulse.",
  "platforms.filter.all": "Todas",
  "platforms.filter.dating": "Namoro & Social",
  "platforms.filter.media": "Notícias & Media",
  "platforms.filter.professional": "Redes Profissionais",
  "platforms.filter.advocacy": "Defesa de Direitos",
  "platforms.filter.health": "Saúde & Bem-estar",
  "platforms.filter.portugal": "Portugal & Lisboa",
  "platforms.note.body":
    "<b>Uma nota sobre esta lista:</b> Incluímos plataformas que consideramos genuinamente úteis para pessoas queer. Isto não é um aval às práticas de nenhuma empresa. Faz sempre as tuas próprias escolhas informadas sobre dados, segurança e privacidade — especialmente em aplicações de namoro e sociais.",
  "platforms.outro.title": "Falta alguma coisa? <em>Diz-nos.</em>",
  "platforms.outro.sub":
    "Conheces uma plataforma, recurso ou comunidade que devia estar aqui? Sugere-a e nós adicionamo-la ao diretório.",
  "platforms.outro.cta": "Sugerir uma plataforma →",

  // ── Candidatura a Parceiro — chrome do formulário "Candidata-te a
  //    parceria". Todo o texto é escrito pela plataforma (formulário/
  //    validação). `REGION_OPTIONS`/`DEFAULT_REGION_LABEL` mantêm o id
  //    canónico de `Region` ("pt"/"eu"/"int") como valor guardado; só o
  //    rótulo apresentado é traduzido (i18n brief §5.1).
  "submitPartner.hero.eyebrow": "Parceiros · Candidatura",
  "submitPartner.hero.title": "Candidata-te a <em>parceria.</em>",
  "submitPartner.hero.sub":
    "As parcerias da QueerPulse são operacionais, não promocionais. Conta-nos quem és e o que fazes — com honestidade — e vamos ler cada palavra.",
  "submitPartner.success.title": "Candidatura",
  "submitPartner.success.em": "recebida.",
  "submitPartner.success.closeLabel": "Voltar a parceiros →",
  "submitPartner.success.step1":
    "Está pendente de revisão pela equipa de parcerias",
  "submitPartner.success.step2":
    "Lemos todas as candidaturas, não só as mais arrumadas",
  "submitPartner.success.step3":
    "Entraremos em contacto — um sim, um ainda não, ou uma pergunta",
  "submitPartner.success.body":
    "Obrigade por nos contactares. A tua candidatura está feita — nada fica público até termos falado contigo sobre ela.",
  "submitPartner.actions.sending": "A enviar…",
  "submitPartner.actions.submit": "Submeter candidatura →",
  "submitPartner.actions.cancel": "Cancelar",
  "submitPartner.error.toast":
    "Não foi possível enviar a tua candidatura — tenta novamente.",

  "submitPartner.fields.sectionOrg": "A tua organização",
  "submitPartner.fields.name.label": "Nome da organização",
  "submitPartner.fields.name.placeholder": "ex.: Casa T",
  "submitPartner.fields.orgType.label": "Tipo de organização",
  "submitPartner.fields.orgType.helper":
    "Só o tipo de organização que são — o rótulo “Parceiro ·” é adicionado por nós.",
  "submitPartner.fields.orgType.placeholder": "ex.: Clínica de saúde comunitária",
  "submitPartner.fields.city.label": "Cidade / base",
  "submitPartner.fields.city.placeholder": "ex.: Lisboa",
  "submitPartner.fields.region.label": "Região",
  "submitPartner.fields.logo.label": "Marca do logótipo",
  "submitPartner.fields.logo.derivedHelper":
    "Preenchido a partir do nome — edita se preferires definir a insígnia.",
  "submitPartner.fields.logo.placeholder": "ex.: CT",
  "submitPartner.fields.sectionPitch": "A apresentação",
  "submitPartner.fields.tagline.label": "Frase-síntese",
  "submitPartner.fields.tagline.helper":
    "A frase única que resume o que fazem.",
  "submitPartner.fields.tagline.placeholder":
    "Um espaço de acolhimento em Lisboa onde ninguém espera por cuidados sozinho.",
  "submitPartner.fields.desc.label": "Descrição breve",
  "submitPartner.fields.desc.helper":
    "Uma ou duas frases mostradas no cartão da listagem.",
  "submitPartner.fields.desc.placeholder":
    "O que a organização faz, em linguagem simples, e quem serve em Lisboa.",
  "submitPartner.fields.tags.label": "Etiquetas",
  "submitPartner.fields.tags.pickerHelper":
    "Escolhe até 3 que se ajustem ao vosso trabalho.",
  "submitPartner.fields.tags.count": "{count}/{max}",
  "submitPartner.fields.sectionContact": "Como te contactar",
  "submitPartner.fields.website.label": "Website",
  "submitPartner.fields.website.placeholder": "ex.: casat.pt",
  "submitPartner.fields.email.label": "Email de contacto",
  "submitPartner.fields.email.placeholder": "ex.: ola@casat.pt",
  "submitPartner.fields.requiredError": "Este campo é obrigatório.",
  "submitPartner.form.sinceDefault": "A candidatar · {year}",

  "submitPartner.region.pt": "Portugal",
  "submitPartner.region.eu": "Europa",
  "submitPartner.region.int": "Internacional",

  "submitPartner.tips.readEvery.title": "Lemos todas as candidaturas",
  "submitPartner.tips.readEvery.body":
    "As parcerias aqui são operacionais, não promocionais. Conta-nos o que a tua organização realmente faz e a quem serve — não uma declaração de missão.",
  "submitPartner.tips.sharedValues.title":
    "Valores partilhados, não alinhamento de marca",
  "submitPartner.tips.sharedValues.body":
    "Damos prioridade a organizações que colocam no centro as identidades marginalizadas dentro dos espaços queer, e também fora deles. Diz-nos onde se situa o teu trabalho.",
  "submitPartner.tips.whatNext.title": "O que acontece a seguir",
  "submitPartner.tips.whatNext.body":
    "A tua candidatura chega como pendente. Uma pessoa da equipa revê-a, e entraremos em contacto — seja um sim, um ainda não, ou uma pergunta.",

};
