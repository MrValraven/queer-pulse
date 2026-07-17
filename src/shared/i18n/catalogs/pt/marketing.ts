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
  "about.meta.title": "Sobre — QueerPulse",
  "about.meta.description":
    "A QueerPulse é uma rede profissional queer construída em Lisboa — sem anúncios, sem algoritmo, sem crescimento pelo crescimento. Eis o que acreditamos, e porque a construímos assim.",
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
  "activism.local.letter.title": "Assina a carta aberta",
  "activism.local.letter.body":
    "<b>{signatures}</b> de {target} assinaturas — entregue em mão na Câmara Municipal assim que atingirmos a meta.",
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
  "coc.report.crisisCta": "Falar com alguém agora",
  "coc.report.emergencyCta": "Isto é uma emergência",
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
  "coc.crisisChatToast": "A abrir o chat de crise…",
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

  // ── Manifesto ──────────────────────────────────────────────────────────
  "manifesto.meta.title": "O Manifesto — QueerPulse",
  "manifesto.meta.description":
    "No que a QueerPulse acredita, por palavras próprias — o documento fundador por trás de tudo o resto nesta plataforma.",
  "manifesto.hero.eyebrow": "O Manifesto",
  "manifesto.hero.title": "Construímos <em>por nós, para nós.</em>",
  "manifesto.hero.attrib":
    "Escrito pelo círculo fundador, <b>ratificado pela comunidade.</b>",
  "manifesto.toast.signed": "Obrigade por assinares.",

  // ── Parceiros ──────────────────────────────────────────────────────────
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

  // ── Corpo do Manifesto (documento fundador — autoria da plataforma, vai
  //    no bundle nos dois modos, logo é chrome pela regra de âmbito).
  //    Os nomes de quem assina ficam em inglês: são nomes de pessoas.
  "manifesto.stanza01.title": "Mais devagar é <em>mais gentil.</em>",
  "manifesto.stanza01.p1":
    "Não estamos numa corrida pela escala. Não queremos mais pessoas; queremos <em>as certas</em>. Vamos crescer ao ritmo a que a comunidade consegue absorver quem chega — avalizade, acolhide, integrade. Se isso significar sermos mais pequenos do que poderíamos ser, seremos mais pequenos do que poderíamos ser.",
  "manifesto.stanza01.p2":
    "As outras plataformas foram construídas para te manter a percorrer o ecrã; a tua atenção é o produto que medem e vendem. Nós não vendemos nada. Não há contagens de seguidores, nem algoritmo a escolher o que vês, nem feed “para ti” a competir pela tua noite. <strong>O tempo passado aqui destina-se a somar tempo fora da plataforma</strong> — em convívios, em ateliês, em clínicas, com amigues.",
  "manifesto.stanza02.title": "Avalizade, não <em>verificade.</em>",
  "manifesto.stanza02.p1":
    "A adesão é por convite, e cada convite é assinado por um nome. Se estás aqui, alguém que conheceste mesmo disse que devias estar. Se ficares, um dia farás o mesmo por outra pessoa. Isto não é exclusividade. É <em>responsabilidade</em>.",
  "manifesto.stanza02.p2":
    "“Verificado” é uma palavra corporativa. Pressupõe um centro que pode decidir quem tu és. Nós não decidimos. A comunidade decide — em conjunto, devagar, e com o comprovativo do tempo passado em pessoa.",
  "manifesto.pull1":
    "Não pomos logótipos arco-íris em nada. <em>O trabalho fala.</em>",
  "manifesto.stanza03.title": "A segurança é <em>infraestrutura.</em>",
  "manifesto.stanza03.p1":
    "Uma rede profissional queer sem uma ponte para a ILGA em casos de crime de ódio é um logótipo, não uma rede. Tal como uma sem terapeutas avaliades pela comunidade, sem um mapa de espaços seguros verdadeiramente mantido, e sem uma noite de clínica aberta que se repete todos os meses no Café Beirão. <strong>Se não conseguimos proteger-nos operacionalmente, não somos uma rede.</strong>",
  "manifesto.stanza03.p2":
    "A saída rápida vive na navegação. O chat de crise está a um toque. A porta das traseiras da Mercearia Rosa abre para a Penha de França. Nada disto são funcionalidades. São o chão.",
  "manifesto.stanza04.title": "O dinheiro move-se <em>de lado.</em>",
  "manifesto.stanza04.p1":
    "As pessoas Apoiantes pagam 96 € por ano. Isso paga a equipa, a infraestrutura, e as coisas que têm de continuar a funcionar. Acima disso, cada euro é alocado <em>de lado</em> — para um fundo que distribui apoios de 50 a 200 €, decididos por um círculo rotativo, entregues em 14 dias. <strong>96% de cada euro vai para programas.</strong> Discriminação completa, todos os anos, no relatório de governação.",
  "manifesto.stanza04.p2":
    "O trabalho também se move de lado. A rede profissional que devia ligar-nos só nos vendeu de volta a recrutadores. Aqui, as pessoas contratam-se, orientam-se, encomendam e arrendam umas às outras — e o valor <em>fica connosco</em> em vez de ser retirado por cima.",
  "manifesto.stanza04.p3":
    "Existe um escalão solidário. É genuinamente gratuito. Não perguntamos porquê.",
  "manifesto.pull2":
    "Se não consegues pagar, isso é informação sobre <em>o mundo</em>, não sobre ti.",
  "manifesto.stanza05.title": "Lisboa, <em>de propósito.</em>",
  "manifesto.stanza05.p1":
    "Estamos sediades num lugar. Concretamente: Anjos, Mouraria, Graça, Alfama, Bairro Alto, Marvila, e as carreiras de autocarro que os ligam. Uma rede queer enraizada em lado nenhum é um feed. Uma rede queer enraizada algures — numa cidade que se atravessa a pé numa hora, com espaços, núcleos e uma Câmara Municipal — é uma rede.",
  "manifesto.stanza05.p2":
    "Só vamos expandir para outras cidades quando houver lá uma comunidade a pedir-nos. Não antes. <strong>O Porto é o próximo.</strong> Depois Madrid. Depois paramos e repensamos.",
  "manifesto.stanza06.title": "O desacordo está <em>incluído.</em>",
  "manifesto.stanza06.p1":
    "Discordámos publicamente, por duas vezes, da ILGA Portugal, a nossa parceira mais antiga. Vamos voltar a fazê-lo. Coligação não é consenso. Não falamos por todas as pessoas queer, e ninguém fala por nós. O fórum acolhe discussões que esperamos que fiquem por resolver. A Assembleia vota o que não pode ficar por resolver.",
  "manifesto.stanza06.p2":
    "Moderar não é ser neutro. Vamos remover crueldade. Não vamos remover incómodo.",
  "manifesto.stanza07.title": "Segura tudo isto <em>sem apertar.</em>",
  "manifesto.stanza07.p1":
    "Este documento está errado nalguma coisa. Não sabemos em quê. A revisão de 2025 mudou onze frases. A revisão de 2026 vai mudar mais. Manifestos que não se atualizam são lápides. <em>Este atualiza-se.</em>",
  "manifesto.stanza07.p2":
    "Se estás a ler isto e algo te soa mal, escreve para <a>manifesto@queerpulse.app</a>. Uma pessoa a sério lê todas. Discutimo-las na assembleia.",
  "manifesto.signers.title_one":
    "Assinado por <em>{formatted} pessoa</em> · até agora",
  "manifesto.signers.title_other":
    "Assinado por <em>{formatted} pessoas</em> · até agora",
  "manifesto.signers.sub":
    "Assina-se com um clique. Não há obrigação nenhuma — muita gente não assinou, e isso também está bem. Estas são algumas das pessoas que assinaram.",
  "manifesto.signers.addCta": "Juntar o meu nome",
  "manifesto.signers.more":
    "Mais <b>{formatted}</b> · a última assinatura foi de <b>{name}</b>, {time}.",
  "manifesto.signers.minutesAgo_one": "há {count} minuto",
  "manifesto.signers.minutesAgo_other": "há {count} minutos",
  "manifesto.actions.addName": "Junta o teu nome",
  "manifesto.actions.print": "Imprimir / guardar PDF",
  "manifesto.actions.governance": "Ler o relatório de governação →",

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
    "A QueerPulse é uma rede profissional queer sediada em Lisboa, fundada em 2024 por oito pessoas da comunidade na sala das traseiras do Café Beirão. É gerida pela Associação QueerPulse, uma entidade sem fins lucrativos registada em Portugal (NIPC 517 426 884), e sustentada por adesões de Apoiante, doações pontuais e três apoios a programas. A adesão é por convite avalizado. A plataforma mantém uma revista, um podcast (The Back Room), uma rede verificada de espaços seguros por toda a Lisboa, um fundo de microapoios distribuído em 14 dias por um círculo rotativo da comunidade, e uma parceria operacional com a ILGA Portugal para apoio jurídico e encaminhamento de linhas de apoio. Os relatórios anuais de transparência são auditados de forma independente e publicados publicamente.",
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
    "Para: cuidados de saúde trans-afirmativos, finanças, transparência, entreajuda, parceria com a ILGA.",
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
  "listBusiness.step3.findOnMap": "Encontrar no mapa",
  "listBusiness.step3.pinPlaced": "Pino colocado perto de {place}",
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
    "Referência · <b>{ref}</b> &nbsp;·&nbsp; guarda-a algures",
  "listBusiness.success.demoFlip":
    "Protótipo · pré-visualizar estados de revisão:",
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

  // ── Etiqueta partilhada de regresso ao hub (secção Governação) ─────────
  "hub.governanceLabel": "Governação",

  // ── Assembleia Anual — chrome da página. A agenda/resoluções/contagens/
  //    histórico são registos de governação por ano (propostas e votos
  //    concretos) — ficam em inglês; ver o relatório da varredura.
  "annualAssembly.hero.eyebrow":
    "Assembleia Anual · 14 de novembro de 2026 · Lisboa",
  "annualAssembly.hero.title": "Dois dias, onze <em>resoluções.</em>",
  "annualAssembly.hero.dek":
    "O convívio anual vinculativo da QueerPulse. Onde o manifesto é revisto, o orçamento é aprovado, e qualquer decisão que não possa ser tomada por um círculo vai a votação da comunidade. <em>Podes participar presencialmente, online, ou só ler as atas depois</em> — mas o teu voto conta da mesma forma.",
  "annualAssembly.hero.meta.datesLabel": "Dois dias · sáb. e dom.",
  "annualAssembly.hero.meta.videoLink": "+ link de vídeo",
  "annualAssembly.hero.meta.eligibleLabel": "Pessoas com direito a voto",
  "annualAssembly.hero.meta.quorumLabel": "Quórum · atingido",
  "annualAssembly.hero.voteCta": "Vota agora · {count} resoluções",
  "annualAssembly.hero.rsvpGoing": "Vais participar · toca para cancelar",
  "annualAssembly.hero.rsvpCta":
    "Confirmar presença · faltam {spotsLeft} de {totalSpots} vagas",
  "annualAssembly.hero.joinOnlineCta": "Participar online · link do Zoom",
  "annualAssembly.toast.rsvpCancelled":
    "Confirmação cancelada · o teu lugar volta a estar disponível",
  "annualAssembly.toast.rsvpConfirmed": "Estás na lista · até 14 de novembro",
  "annualAssembly.toast.openingZoom": "A abrir o link do Zoom…",
  "annualAssembly.footer.eligibility": "Perguntas sobre o teu direito a voto?",
  "annualAssembly.footer.helpCta": "Ajuda →",
  "annualAssembly.footer.proposal": "Queres propor algo para o próximo ano?",
  "annualAssembly.footer.writeCta": "Escreve-nos",
  "annualAssembly.agenda.title": "A <em>agenda</em>",
  "annualAssembly.agenda.sub":
    "Mais ou menos por esta ordem. Os horários são indicativos. Nunca acabámos a horas e não esperamos começar agora.",
  "annualAssembly.vote.title":
    "Votação · <em>aberta até 14 de nov. · 14:00</em>",
  "annualAssembly.vote.sub":
    "Todas as pessoas votam — quer participem ou não. Vota quando quiseres; podes mudar o voto até ao encerramento. <em>Um voto por pessoa, por resolução.</em>",
  "annualAssembly.vote.quorumStrip":
    "<b>Quórum:</b> são precisos 184 votos para validar uma resolução. <em>Neste momento há 312 votos registados</em> — quórum atingido. <b>Limiares de aprovação:</b> maioria simples para itens de orçamento; maioria qualificada de 60% para alterações ao Código de Conduta e ao manifesto.",
  "annualAssembly.vote.noCta": "Não · rejeitar",
  "annualAssembly.vote.abstainCta": "Abster",
  "annualAssembly.vote.showMore": "Mostrar mais {count} resoluções →",
  "annualAssembly.vote.recorded":
    "Voto registado · podes alterá-lo quando quiseres",
  "annualAssembly.vote.tallyYes": "Sim",
  "annualAssembly.vote.tallyNo": "Não",
  "annualAssembly.vote.tallyAbstain": "Abstenção",
  "annualAssembly.attend.title": "Não podes vir presencialmente?",
  "annualAssembly.attend.body":
    "Vota online quando quiseres até 14 de nov. · 14:00. Assiste à transmissão em direto das sessões presenciais com chat. Lê as atas na sexta-feira seguinte.",
  "annualAssembly.attend.voteCta": "Vota",
  "annualAssembly.attend.streamCta": "Link da transmissão",
  "annualAssembly.past.title": "Assembleias <em>anteriores</em>",
  "annualAssembly.past.sub":
    "As resoluções e as atas de todas as Assembleias Anuais são públicas.",
  "annualAssembly.past.minutesCta": "Atas →",

  // ── Modal de transmissão em direto (Assembleia Anual) ──────────────────
  "liveStream.closeAria": "Fechar",
  "liveStream.eyebrow": "Transmissão em direto · Atelier Pulso",
  "liveStream.title": "Assembleia Anual · <em>em direto.</em>",
  "liveStream.lead":
    "As sessões presenciais são transmitidas aqui, com chat aberto. A transmissão começa quando a sala abre — <b>14 de nov. · 10:00 WET.</b>",
  "liveStream.playAria": "Reproduzir transmissão",
  "liveStream.statusLive": "Em direto",
  "liveStream.statusSoon": "Começa em breve",
  "liveStream.noteStreaming":
    "A transmitir a sala principal · áudio + diapositivos · chat abaixo",
  "liveStream.noteSoon": "A transmissão começa às 10:00 WET, 14 de novembro",
  "liveStream.backCta": "← Fechar",
  "liveStream.voteInsteadCta": "Ir votar em vez disso →",

  // ── Atas da Assembleia — chrome da página. As atas de cada ano (resumo,
  //    agenda, resoluções, ações) são o registo oficial de governação —
  //    ficam em inglês; ver o relatório da varredura.
  "assemblyMinutes.hero.eyebrow": "Assembleia Anual · Atas · {year}",
  "assemblyMinutes.hero.title": "As <em>atas.</em>",
  "assemblyMinutes.hero.dek":
    "O registo público da Assembleia Anual de {year} — quem presidiu, o que esteve em cima da mesa, e como ficou cada resolução.",
  "assemblyMinutes.hero.fallbackNote":
    "Não temos atas de {requestedYear} arquivadas, por isso aqui tens o registo de {year}.",
  "assemblyMinutes.hero.backCta": "← Voltar à Assembleia",
  "assemblyMinutes.otherYears": "Outros anos:",
  "assemblyMinutes.meta.date": "Data",
  "assemblyMinutes.meta.location": "Local",
  "assemblyMinutes.meta.chair": "Presidência",
  "assemblyMinutes.meta.secretary": "Secretariado",
  "assemblyMinutes.meta.quorum": "Quórum",
  "assemblyMinutes.meta.attendance": "Presenças",
  "assemblyMinutes.meta.attendanceValue":
    "{inPerson} presenciais · {online} online · {votes} votos",
  "assemblyMinutes.summary.title": "Resumo dos <em>trabalhos</em>",
  "assemblyMinutes.agenda.title": "<em>Agenda</em> seguida",
  "assemblyMinutes.resolutions.title": "Resoluções e <em>resultados</em>",
  "assemblyMinutes.actions.title": "Ações e <em>próximos passos</em>",
  "assemblyMinutes.signoff":
    "Atas registadas por {secretary} · ratificadas no encerramento da Assembleia Anual de {year}. Este é o registo público.",
  "assemblyMinutes.outcome.passed": "Aprovada",
  "assemblyMinutes.outcome.rejected": "Rejeitada",
  "assemblyMinutes.outcome.tabled": "Adiada",

  // ── Carta aberta — o corpo da carta é um documento de defesa de direitos
  //    autoral e delimitado (não é conteúdo de utilizadores); traduzido na
  //    íntegra, como o Manifesto. Nomes de signatários e notas individuais
  //    de assinatura ficam em inglês (palavras/nomes próprios das pessoas).
  "openLetter.hero.eyebrowPrefix": "Carta aberta · {partners}",
  "openLetter.hero.live_one": "Ativa · falta {days} dia",
  "openLetter.hero.live_other": "Ativa · faltam {days} dias",
  "openLetter.hero.addressed": "Endereçada a <b>{to}</b> · {date}",
  "openLetter.hero.countGoalSuffix": "/ {goal} assinaturas",
  "openLetter.hero.countLabel":
    "Pessoas da QueerPulse e organizações parceiras · última assinatura <b>{at}</b> por {by}",
  "openLetter.hero.pctLabel": "<b>{pct}%</b> · {note}",
  "openLetter.toast.signatureAdded": "Assinatura adicionada · {total} no total",
  "openLetter.body.addressee":
    "Ao Ministério da Saúde, e à Direção-Geral da Saúde:",
  "openLetter.body.lead":
    "A Lei n.º 38/2018 consagrou um princípio fundamental na lei portuguesa: que a identidade de género de uma pessoa é dela para determinar, e que o Estado e o seu sistema de saúde são obrigados a reconhecer essa determinação. <em>A lei é boa.</em> Ainda não está a ser aplicada.",
  "openLetter.body.p2":
    "Concretamente, os protocolos de prescrição de terapêutica hormonal de substituição em Portugal <strong>não são portáteis dentro do SNS</strong>. Uma pessoa trans que inicia acompanhamento com um médico de família em Lisboa, constrói um processo clínico ao longo de 12 a 24 meses, e depois muda de cidade — por trabalho, por habitação, por segurança — tem de, na prática, recomeçar do zero com um novo médico de família na nova cidade. A evidência clínica não a acompanha. O historial de prescrições não a acompanha. <em>A confiança construída com quem a acompanhava não a acompanha.</em>",
  "openLetter.body.p3":
    "Não é isto que a lei diz que deveria acontecer. É esta a realidade operacional.",
  "openLetter.body.asksTitle": "O que estamos a <em>pedir</em>",
  "openLetter.body.asksLead":
    "Três mudanças concretas e exequíveis. Nenhuma exige legislação nova.",
  "openLetter.body.ask1.lead": "Um registo nacional de prescrições de THS",
  "openLetter.body.ask1.body":
    ", de adesão voluntária e acesso restrito a clínicos, disponível a qualquer médico de família do SNS que a pessoa autorize. O mesmo modelo do registo de diabetes adotado em 2019.",
  "openLetter.body.ask2.lead": "Uma regra de “receita-ponte” de 14 dias",
  "openLetter.body.ask2.body":
    " — quando a pessoa muda de região, o novo médico de família pode emitir uma receita-ponte de 90 dias até uma reavaliação completa, sem exigir um novo processo de diagnóstico.",
  "openLetter.body.ask3.lead":
    "Inclusão dos cuidados afirmativos trans no módulo de formação inicial de medicina geral e familiar",
  "openLetter.body.ask3.body":
    " — obrigatório, com quatro horas, elaborado em colaboração com clínicos portugueses certificados pela WPATH.",
  "openLetter.body.whyNowTitle": "Porquê <em>agora</em>",
  "openLetter.body.whyNowP1":
    "Porque a janela política está aberta. Porque o Ministério assumiu, no orçamento da saúde de 2026, o compromisso de “avaliar percursos de continuidade de cuidados para medicação crónica”. Porque os clínicos que teriam de implementar isto — incluindo a <em>Dra. Inês Pereira</em>, da Clínica do Largo, o <em>Dr. Hugo Marques</em>, da USF Sé, e a <em>Dra. Mariza Câmara</em>, da Câmara — já declararam publicamente que estão prontos a participar.",
  "openLetter.body.whyNowP2":
    "E porque, por cada mês que esperamos, <strong>cerca de 40 pessoas trans em Portugal perdem a continuidade da THS</strong> só por atrito administrativo. O custo clínico destas interrupções está documentado. O custo pessoal é incalculável.",
  "openLetter.body.whatWeDoTitle": "O que vamos fazer <em>com esta carta</em>",
  "openLetter.body.whatWeDoP1":
    "Ao chegar às 5000 assinaturas, esta carta será entregue em mão ao Ministério por uma delegação de três pessoas: <em>Catarina Vaz</em> (QueerPulse, Trans Hub), <em>Filipa Mendes</em> (ILGA Portugal), e uma pessoa trans cuja continuidade de cuidados foi interrompida nos últimos 24 meses. Vamos pedir uma reunião. Vamos publicar a resposta, seja ela qual for.",
  "openLetter.body.whatWeDoP2":
    "Se recusarem reunir-se, esta carta segue para a próxima audição trimestral da comissão de saúde da Assembleia da República — já agendada para discutir a implementação da Lei n.º 38/2018 — e para a imprensa.",
  "openLetter.body.kicker":
    "Não estamos a pedir um direito novo. <strong>Estamos a pedir que um direito já existente se torne real na prática.</strong>",
  "openLetter.sig.transHub":
    "Coordenação do Trans Hub · co-tesouraria · QueerPulse",
  "openLetter.sig.ilgaDirector": "Direção executiva · ILGA Portugal",
  "openLetter.sidebar.recentSignatures": "Assinaturas recentes",
  "openLetter.sidebar.aboutRunning":
    "<b>Porque fazemos cartas abertas assim:</b> por trás de cada assinatura está um nome verificado. <em>Isso torna-as mais difíceis de ignorar.</em> Não fazemos petições de massa anónimas — o modelo é menos assinaturas, mas reais e identificadas.",
  "openLetter.sign.title": "Assina a carta aberta",
  "openLetter.sign.asLabel": "Como {name} · {pronouns}",
  "openLetter.sign.nameLabel": "Nome a mostrar na lista",
  "openLetter.sign.visibilityLabel": "Mostrar como · visibilidade",
  "openLetter.sign.noteLabel": "Acrescenta uma frase (opcional)",
  "openLetter.sign.noteCounter": "{length}/280",
  "openLetter.sign.notePlaceholder":
    "Porque é que isto importa para ti · 280 carateres",
  "openLetter.sign.submitCta": "Assinar a carta",
  "openLetter.sign.signedCta": "Assinaste a carta",
  "openLetter.sign.footer":
    "Só para pessoas da comunidade. Nunca partilhamos os teus dados com a organização destinatária. Podes retirar a tua assinatura quando quiseres.",
  "openLetter.sign.anonName": "Uma pessoa da comunidade",
  "openLetter.visibility.full": "Nome completo · público",
  "openLetter.visibility.initials": "Só iniciais",
  "openLetter.visibility.anon": "Anónimo · “Uma pessoa da comunidade”",
  "openLetter.sidebar.noNote": "—",

  // ── Relatório de Transparência — chrome da página. Os valores em euros,
  //    a repartição do orçamento, as linhas de moderação, os pedidos
  //    governamentais, os erros nomeados e as estatísticas de governação
  //    são os números auditados reais do ano — ficam em inglês; ver o
  //    relatório da varredura.
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

  // ── Arquivo da Comunidade — chrome da página. As citações, biografias e
  //    excertos de histórias orais são testemunhos reais de pessoas — ficam
  //    em inglês (o caso canónico de "biografia fictícia" da regra de âmbito).
  "archive.hero.category": "Arquivo da Comunidade",
  "archive.hero.title": "Histórias que não devem <em>ser esquecidas.</em>",
  "archive.hero.sub":
    "Um arquivo contínuo de histórias orais, testemunhos e relatos pessoais de pessoas queer em Lisboa — de ontem e de hoje. Histórias que registam quem somos, o que construímos, e o que isso custou.",
  "archive.featured.label": "A história em destaque este mês",
  "archive.featured.readCta": "Lê a história dela →",
  "archive.grid.title": "Do <em>arquivo</em>",
  "archive.grid.sub":
    "Relatos pessoais de pessoas da comunidade, de ontem e de hoje.",
  "archive.oral.title": "Nas <em>próprias palavras.</em>",
  "archive.oral.sub":
    "Excertos curtos de histórias orais mais longas no arquivo.",
  "archive.submit.title": "A tua história <em>também tem lugar aqui.</em>",
  "archive.submit.body":
    "O arquivo cresce com a contribuição da comunidade. Se tens uma história para contar — sobre Lisboa, sobre a tua comunidade, sobre o que te trouxe até aqui ou o que te manteve a caminhar — queremos ouvi-la. Todos os formatos são bem-vindos: escrito, áudio, vídeo, fotos.",
  "archive.submit.cta": "Submete a tua história →",

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
  "changelog.filter.all": "Todas",
  "changelog.filter.feature": "Funcionalidades",
  "changelog.filter.community": "Comunidade",
  "changelog.filter.fix": "Correções",
  "changelog.filter.policy": "Políticas",
  "changelog.filter.magazine": "Revista",
  "changelog.badge.feature": "Funcionalidade",
  "changelog.badge.community": "Comunidade",
  "changelog.badge.fix": "Correção",
  "changelog.badge.policy": "Política",
  "changelog.badge.magazine": "Revista",
  "changelog.empty.title": "Ainda nada registado com este filtro",
  "changelog.empty.description":
    "Ainda não houve alterações deste tipo. Limpa o filtro para ver o histórico completo.",
  "changelog.empty.clearCta": "Limpar filtros",

  // ── Roteiro — chrome da página. Os itens enviados/em construção/
  //    planeados, as ideias mais votadas e as contagens de votos são o
  //    backlog em direto — ficam em inglês; ver o relatório da varredura.
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
  "roadmap.submitIdea.toast.submitted": "Ideia submetida — obrigado",
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

  // ── Voluntariado — chrome da página. Nomes/funções/descrições/competências
  //    das organizações vêm da API de oportunidades em direto (ou do seu
  //    mock de demonstração) — ficam em inglês; o adaptador compõe alguns
  //    fragmentos de chrome (etiqueta de compromisso, etiquetas de
  //    estatística/vagas, frase de confirmação) que também têm chave aqui
  //    para o modo em direto traduzir tal como a demonstração.
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
  "postOpportunity.core.orgPlaceholder": "ex.: ILGA Portugal",
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
    "Sensibilização Comunitária · ILGA Lisboa",
  "postOpportunity.rich.partnerSlugLabel": "Slug do parceiro",
  "postOpportunity.rich.partnerSlugHelper": "Liga à página de um parceiro.",
  "postOpportunity.rich.partnerSlugPlaceholder": "ilga-portugal",
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
};
