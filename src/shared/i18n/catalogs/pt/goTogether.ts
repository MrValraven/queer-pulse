import type { Catalog } from "../../types";

/**
 * Vamos juntes: quem vai a um convívio sozinhe (ou com uma pessoa amiga)
 * responde a um pequeno questionário de amizade e chega com um grupo pequeno.
 * As chaves do questionário espelham os ids estáveis do backend em
 * `go-together/go-together-questionnaire.catalog.ts`. Os nomes dos bairros são
 * nomes próprios e não se traduzem; só as três zonas amplas têm chave.
 */
export const goTogether: Catalog = {
  "product.name": "Vamos juntes",

  // ── Valores: quanto conta cada um na tua vida ─────────────────────────────
  "questionnaire.values.community.label": "Comunidade e ativismo",
  "questionnaire.values.creativity.label": "Criatividade",
  "questionnaire.values.family.label": "Família, escolhida ou de origem",
  "questionnaire.values.fun.label": "Diversão e prazer",
  "questionnaire.values.career.label": "Carreira e conquistas",
  "questionnaire.values.spirituality.label": "Espiritualidade",
  "questionnaire.values.scale.1": "Nem por isso",
  "questionnaire.values.scale.2": "Um pouco",
  "questionnaire.values.scale.3": "Mais ou menos",
  "questionnaire.values.scale.4": "Muito",
  "questionnaire.values.scale.5": "Tudo",

  // ── Humor: uma frase de exemplo por estilo, escolhe a mais engraçada ──────
  // h1 absurdo / seco
  "questionnaire.humour.h1.a":
    "Tenho quase a certeza de que o meu gato grava um podcast enquanto estou a trabalhar.",
  "questionnaire.humour.h1.b":
    "Adoro fazer planos. Os cancelados são os meus preferidos.",
  // h2 camp / trocadilho
  "questionnaire.humour.h2.a":
    "Amor, é um piquenique. Trouxe três looks e uma sandes.",
  "questionnaire.humour.h2.b":
    "O que é que o tomate foi fazer ao banco? Tirar extrato.",
  // h3 negro / ternurento
  "questionnaire.humour.h3.a":
    "Já escolhi a playlist do meu funeral. Assim, pelo menos, toda a gente dança.",
  "questionnaire.humour.h3.b":
    "Vi um cão com uma gabardina minúscula esta manhã. A semana está salva.",
  // h4 autodepreciativo / observacional
  "questionnaire.humour.h4.a":
    "Tenho tão pouco sentido de orientação que uma vez me perdi na minha própria rua.",
  "questionnaire.humour.h4.b":
    "Há sempre alguém no grupo que responde a uma mensagem de há três dias como se fosse notícia de última hora.",
  // h5 absurdo / camp
  "questionnaire.humour.h5.a":
    "As gaivotas de Lisboa estão claramente a planear alguma coisa, e sinceramente eu alinhava.",
  "questionnaire.humour.h5.b":
    "Qualquer paragem de autocarro é uma passerelle, se acreditares com força.",
  // h6 seco / negro
  "questionnaire.humour.h6.a":
    "Uma vez quis fazer uma coisa espontânea. Marquei-a na agenda.",
  "questionnaire.humour.h6.b":
    "As minhas plantas confiam em mim cegamente. Primeiro erro delas.",
  // h7 trocadilho / observacional
  "questionnaire.humour.h7.a":
    "O que diz uma impressora à outra? Essa folha é tua ou é impressão minha?",
  "questionnaire.humour.h7.b":
    "Porque é que toda a gente vira especialista em meteorologia mal chove em Lisboa?",
  // h8 ternurento / autodepreciativo
  "questionnaire.humour.h8.a":
    "A avó da porta ao lado ensinou-me a fazer pão. Agora apresenta-me como aprendiz dela.",
  "questionnaire.humour.h8.b":
    "Comecei catorze passatempos este ano. A minha guitarra quer ter uma palavrinha comigo.",

  // ── Interesses: famílias (os mesmos nomes do catálogo de convívios) ───────
  "questionnaire.interests.family.meet": "Conhecer e jogar",
  "questionnaire.interests.family.eat": "Comer e beber",
  "questionnaire.interests.family.party": "Festa e noite",
  "questionnaire.interests.family.make": "Fazer e criar",
  "questionnaire.interests.family.learn": "Aprender e conversar",
  "questionnaire.interests.family.watch": "Ver e ouvir",
  "questionnaire.interests.family.move": "Mexer e ar livre",
  "questionnaire.interests.family.care": "Cuidar e apoiar",
  "questionnaire.interests.family.organise": "Organizar e agir",

  // ── Interesses: etiquetas ─────────────────────────────────────────────────
  // meet
  "questionnaire.interests.tag.coffeeChats": "Conversas de café",
  "questionnaire.interests.tag.boardGames": "Jogos de tabuleiro",
  "questionnaire.interests.tag.quizNights": "Noites de quiz",
  "questionnaire.interests.tag.languageExchange": "Intercâmbio de línguas",
  "questionnaire.interests.tag.bookClubs": "Clubes de leitura",
  "questionnaire.interests.tag.walksAndTalks": "Passeios e conversas",
  "questionnaire.interests.tag.brunch": "Brunch",
  // eat
  "questionnaire.interests.tag.cooking": "Cozinhar",
  "questionnaire.interests.tag.supperClubs": "Jantares partilhados",
  "questionnaire.interests.tag.plantBased": "Comida vegetal",
  "questionnaire.interests.tag.baking": "Fazer bolos e pão",
  "questionnaire.interests.tag.streetFood": "Comida de rua",
  "questionnaire.interests.tag.cafes": "Cafés",
  "questionnaire.interests.tag.wineAndVinho": "Vinho, tinto ou verde",
  // party
  "questionnaire.interests.tag.dragShows": "Espetáculos de drag",
  "questionnaire.interests.tag.karaoke": "Karaoke",
  "questionnaire.interests.tag.clubNights": "Noites de discoteca",
  "questionnaire.interests.tag.queerBars": "Bares queer",
  "questionnaire.interests.tag.festivals": "Festivais",
  "questionnaire.interests.tag.ballroom": "Ballroom",
  "questionnaire.interests.tag.liveGigs": "Concertos ao vivo",
  // make
  "questionnaire.interests.tag.crafts": "Trabalhos manuais",
  "questionnaire.interests.tag.zines": "Zines",
  "questionnaire.interests.tag.photography": "Fotografia",
  "questionnaire.interests.tag.drawing": "Desenho",
  "questionnaire.interests.tag.knitting": "Tricô",
  "questionnaire.interests.tag.pottery": "Cerâmica",
  "questionnaire.interests.tag.writing": "Escrita",
  // learn
  "questionnaire.interests.tag.queerHistory": "História queer",
  "questionnaire.interests.tag.museums": "Museus",
  "questionnaire.interests.tag.workshops": "Workshops",
  "questionnaire.interests.tag.science": "Ciência",
  "questionnaire.interests.tag.philosophy": "Filosofia",
  "questionnaire.interests.tag.tech": "Tecnologia",
  // watch
  "questionnaire.interests.tag.cinema": "Cinema",
  "questionnaire.interests.tag.theatre": "Teatro",
  "questionnaire.interests.tag.standUp": "Stand-up",
  "questionnaire.interests.tag.tvSeries": "Séries",
  "questionnaire.interests.tag.anime": "Anime",
  "questionnaire.interests.tag.dancePerformance": "Espetáculos de dança",
  // move
  "questionnaire.interests.tag.hiking": "Caminhadas",
  "questionnaire.interests.tag.running": "Corrida",
  "questionnaire.interests.tag.yoga": "Ioga",
  "questionnaire.interests.tag.swimming": "Natação",
  "questionnaire.interests.tag.cycling": "Andar de bicicleta",
  "questionnaire.interests.tag.climbing": "Escalada",
  "questionnaire.interests.tag.beach": "Dias de praia",
  "questionnaire.interests.tag.teamSports": "Desportos de equipa",
  // care
  "questionnaire.interests.tag.meditation": "Meditação",
  "questionnaire.interests.tag.wellbeingCircles": "Círculos de bem-estar",
  "questionnaire.interests.tag.plants": "Plantas",
  "questionnaire.interests.tag.pets": "Animais de estimação",
  "questionnaire.interests.tag.tarot": "Tarot",
  // organise
  "questionnaire.interests.tag.activism": "Ativismo",
  "questionnaire.interests.tag.volunteering": "Voluntariado",
  "questionnaire.interests.tag.prideOrganising": "Organizar o Pride",
  "questionnaire.interests.tag.mutualAid": "Apoio mútuo",
  "questionnaire.interests.tag.politics": "Política",

  // ── Música ────────────────────────────────────────────────────────────────
  "questionnaire.music.pop": "Pop",
  "questionnaire.music.indie": "Indie",
  "questionnaire.music.rock": "Rock",
  "questionnaire.music.electronic": "Eletrónica",
  "questionnaire.music.techno": "Techno",
  "questionnaire.music.house": "House",
  "questionnaire.music.hipHop": "Hip-hop",
  "questionnaire.music.rnb": "R&B",
  "questionnaire.music.jazz": "Jazz",
  "questionnaire.music.classical": "Clássica",
  "questionnaire.music.fado": "Fado",
  "questionnaire.music.brazilian": "Música brasileira",
  "questionnaire.music.afrobeats": "Afrobeats",
  "questionnaire.music.latin": "Música latina",
  "questionnaire.music.metal": "Metal",
  "questionnaire.music.punk": "Punk",
  "questionnaire.music.folk": "Folk",
  "questionnaire.music.soul": "Soul",
  "questionnaire.music.disco": "Disco",
  "questionnaire.music.kpop": "K-pop",
  "questionnaire.music.hyperpop": "Hyperpop",
  "questionnaire.music.ambient": "Ambient",
  "questionnaire.music.musicals": "Musicais",
  "questionnaire.music.country": "Country",
  "questionnaire.music.funk": "Funk",

  // ── Energia: 1 é o extremo calmo, 5 o mais animado ────────────────────────
  "questionnaire.energy.talker.low": "Sou mais de ouvir",
  "questionnaire.energy.talker.high": "Puxo conversa com gosto",
  "questionnaire.energy.nightShape.low":
    "Uma conversa calma num sítio acolhedor",
  "questionnaire.energy.nightShape.high": "Dançar até tarde",
  "questionnaire.energy.planner.low": "Vou ao sabor do momento",
  "questionnaire.energy.planner.high": "Gosto de ter um plano",

  // ── Intenção e ritmo ──────────────────────────────────────────────────────
  "questionnaire.intent.closeFriends": "Amizades próximas",
  "questionnaire.intent.activityBuddies": "Companhia para fazer coisas",
  "questionnaire.intent.both": "Um pouco de cada",
  "questionnaire.frequency.monthly": "Mais ou menos uma vez por mês",
  "questionnaire.frequency.fewTimesAMonth": "Algumas vezes por mês",
  "questionnaire.frequency.weekly": "Todas as semanas",

  // ── Condições essenciais ──────────────────────────────────────────────────
  "questionnaire.language.pt": "Português",
  "questionnaire.language.en": "Inglês",
  "questionnaire.language.es": "Espanhol",
  "questionnaire.language.fr": "Francês",
  "questionnaire.language.de": "Alemão",
  "questionnaire.drinking.soberGroup": "Prefiro um grupo sóbrio",
  "questionnaire.drinking.eitherWay": "Tanto faz",
  "questionnaire.drinking.willDrink": "Provavelmente vou beber um copo",
  "questionnaire.age.18-24": "18 a 24",
  "questionnaire.age.25-34": "25 a 34",
  "questionnaire.age.35-44": "35 a 44",
  "questionnaire.age.45-54": "45 a 54",
  "questionnaire.age.55+": "55 ou mais",
  "questionnaire.agePreference.similar": "Pessoas mais ou menos da minha idade",
  "questionnaire.agePreference.any": "Qualquer idade",

  // ── Zona: as zonas amplas (os bairros mantêm o próprio nome) ──────────────
  "questionnaire.area.lisbonMetro": "Grande Lisboa",
  "questionnaire.area.porto": "Porto",
  "questionnaire.area.elsewhere": "Noutro sítio",

  // ── Lente de identidade (só aparece no passo de adesão da própria pessoa) ─
  "lens.transNonBinary.label": "Pessoas trans e não binárias",
  "lens.transNonBinary.description":
    "Vais ficar num grupo com outras pessoas trans e não binárias que também escolheram esta opção.",
  "lens.womenFemmes.label": "Mulheres e femmes",
  "lens.womenFemmes.description":
    "Inclui sempre mulheres e femmes trans. Vais ficar num grupo com outras mulheres e femmes que também escolheram esta opção.",
  "lens.queerPoc.label": "Pessoas queer racializadas",
  "lens.queerPoc.description":
    "Vais ficar num grupo com outras pessoas queer racializadas que também escolheram esta opção.",

  // ── Nível de afinidade do grupo ───────────────────────────────────────────
  "band.strong": "Grande afinidade",
  "band.good": "Boa afinidade",

  // ── Razões do grupo ───────────────────────────────────────────────────────
  "reason.interestsEveryone": "Todes vocês escolheram {tags}",
  "reason.interestsSome": "{count} de vocês escolheram {tags}",
  "reason.musicEveryone": "Todes vocês ouvem {tags}",
  "reason.musicSome": "{count} de vocês ouvem {tags}",
  "reason.energy.calm": "Energia parecida: noites calmas e de boa conversa",
  "reason.energy.balanced":
    "Energia parecida: um pouco de conversa, um pouco de dança",
  "reason.energy.lively": "Energia parecida: com vontade de dançar até tarde",
  "reason.areaEveryone": "Todes vocês vivem na mesma zona: {area}",
  "reason.areaSome": "{count} de vocês vivem na mesma zona: {area}",
  "reason.hostQuestion": "Todes vocês responderam “{option}” a “{prompt}”",

  // ── Quebra-gelos: perguntas leves para o cartão do grupo ──────────────────
  "icebreaker.1": "Qual é a tua forma preferida de passar um domingo?",
  "icebreaker.2": "Que pequena coisa te fez feliz esta semana?",
  "icebreaker.3": "Qual foi a última coisa que aprendeste só por gosto?",
  "icebreaker.4":
    "Se pudesses dominar uma competência de um dia para o outro, qual seria?",
  "icebreaker.5": "Que música deixas sempre tocar até ao fim?",
  "icebreaker.6": "Qual foi a melhor coisa que comeste ultimamente?",
  "icebreaker.7":
    "Que sítio da tua cidade adorarias mostrar a quem está de visita?",
  "icebreaker.8": "Que passatempo gostavas de experimentar este ano?",
  "icebreaker.9": "Qual foi o melhor conselho que já te deram?",
  "icebreaker.10": "Que filme ou série recomendavas a este grupo todo?",
  "icebreaker.11": "Como é o teu dia livre perfeito, desde o pequeno-almoço?",
  "icebreaker.12": "Que coisa boa tens à tua espera este mês?",

  // UI copy for the card, questionnaire, group, feedback, host and settings surfaces.
  "card.body": "Junta-te a um grupo pequeno para irem juntes.",
  "card.closed.note": "O Vamos juntes já fechou para este convívio.",
  "card.error.alreadyGrouped": "Já estás num grupo para este convívio.",
  "card.error.generic":
    "Não foi possível concluir. Tenta outra vez daqui a pouco.",
  "card.error.ineligible":
    "Vamos juntes não está disponível na tua conta neste momento.",
  "card.error.invalidAnswers":
    "As perguntas de quem organiza mudaram. Responde outra vez a cada uma e confirma.",
  "card.error.lensConsent":
    "Marca a caixa para confirmar a tua lente, ou escolhe Sem lente.",
  "card.error.lensMismatch":
    "Este par não pode avançar com essa escolha de lente. Escolhe outra, ou vai sozinhe.",
  "card.error.locked": "Os grupos já se formaram para este convívio.",
  "card.error.partnerUnavailable":
    "Essa pessoa não pode ir contigo a este convívio. Talvez ainda não tenha confirmado presença. Escolhe outra pessoa ou vai sozinhe.",
  "card.error.profileNeeded":
    "Responde primeiro às perguntas do Vamos juntes e depois volta para entrar.",
  "card.error.unavailable":
    "O Vamos juntes já não está a funcionar para este convívio.",
  "card.ineligible.unavailableBody":
    "Continuas bem-vinde a este convívio, tal como estás.",
  "card.ineligible.unavailableTitle":
    "Vamos juntes não está disponível na tua conta neste momento",
  "card.ineligible.verifyBody":
    "Vamos juntes é para membros verificades, para que todes no grupo saibam que as outras pessoas são quem dizem ser.",
  "card.ineligible.verifyCta": "Verificar a minha conta",
  "card.ineligible.verifyTitle": "Verifica a tua conta para entrar",
  "card.lens.consent":
    "Escolho esta lente por mim. A QueerPulse usa-a só para me juntar a um grupo neste convívio e apaga-a quando o convívio terminar.",
  "card.lens.hint":
    "Só tu vês esta escolha. Com uma lente, ficas num grupo só com pessoas que escolheram a mesma.",
  "card.lens.none.description": "Junta-me a qualquer pessoa que vá.",
  "card.lens.none.label": "Sem lente",
  "card.lens.title": "Escolhe uma lente, se quiseres",
  "card.mode.pair.description":
    "Tu e uma conexão que também vai, juntes num grupo como par.",
  "card.mode.pair.label": "Com uma pessoa amiga",
  "card.mode.solo.description": "Só tu. Conheces o grupo todo ao mesmo tempo.",
  "card.mode.solo.label": "Sozinhe",
  "card.mode.title": "Como vais?",
  "card.optIn.cancel": "Voltar",
  "card.optIn.confirm": "Conta comigo",
  "card.optIn.sending": "A guardar",
  "card.pairInvite.accept": "Aceitar",
  "card.pairInvite.body":
    "Se aceitares, ficam juntes num grupo pequeno para este convívio.",
  "card.pairInvite.confirm": "Ir com {name}",
  "card.pairInvite.decline": "Recusar",
  "card.pairInvite.title": "{name} quer ir contigo",
  "card.partner.empty":
    "Ainda não tens conexões para escolher. Podes ir sozinhe e conhecer o grupo.",
  "card.partner.hint":
    "Escolhe uma conexão que também vai. Recebe um convite para ir contigo.",
  "card.partner.loadError": "As tuas conexões não carregaram.",
  "card.partner.loading": "A carregar as tuas conexões",
  "card.partner.search": "Procurar nas tuas conexões",
  "card.partner.title": "Com quem vais?",
  "card.questionnaire.body":
    "Primeiro, umas perguntas sobre o que gostas e como gostas de estar com pessoas. Respondes uma vez e usamos as respostas em todos os convívios.",
  "card.questionnaire.cta": "Responder às perguntas",
  "card.questionnaire.refreshBody":
    "Algumas perguntas mudaram desde a última vez que respondeste. Atualiza-as e já podes entrar.",
  "card.questionnaire.refreshCta": "Atualizar as minhas respostas",
  "card.title": "Vais sozinhe ou com uma pessoa amiga?",
  "card.unmatched.body":
    "Se mais pessoas entrarem, continuamos a tentar juntar-te a um grupo até 6 horas antes do início.",
  "card.unmatched.title": "Ainda não há pessoas suficientes para um grupo",
  "card.waiting.body":
    "Estás dentro. Avisamos-te assim que o teu grupo estiver pronto.",
  "card.waiting.change": "Mudar como vou",
  "card.waiting.demoReveal": "Revelar o meu grupo de demonstração",
  "card.waiting.leave": "Deixar de procurar grupo",
  "card.waiting.pairAccepted":
    "Vais com {name}. Vamos juntar-vos ao mesmo grupo.",
  "card.waiting.pairPending":
    "À espera que {name} aceite. Se não aceitar até lá, juntamos-te a um grupo sozinhe.",
  "card.waiting.saveChange": "Guardar alterações",
  "card.waiting.title": "Conheces o teu grupo: {day}, às {time}",
  "card.waiting.titleSoon": "Conheces o teu grupo em breve",
  "feedback.backToEvents": "Voltar aos teus eventos",
  "feedback.backToGathering": "Voltar ao convívio",
  "feedback.click.no": "Não",
  "feedback.click.somewhat": "Assim-assim",
  "feedback.click.yes": "Sim",
  "feedback.clickQuestion.title": "O grupo bateu certo?",
  "feedback.closed.body":
    "As respostas sobre quem queres voltar a encontrar só ficam abertas durante os 7 dias a seguir ao convívio.",
  "feedback.closed.title": "Este período de feedback já fechou",
  "feedback.confirmation.body":
    "Se alguém também disse que sim, ficam as duas pessoas a saber.",
  "feedback.confirmation.title": "Obrigade por",
  "feedback.goAgain.ariaLabel": "Vamos juntes outra vez",
  "feedback.goAgain.description":
    "Se duas ou mais pessoas do grupo entrarem noutro convívio, juntamos-vos outra vez.",
  "feedback.goAgain.title": "Vamos juntes outra vez",
  "feedback.likingGap":
    "As pessoas costumam subestimar o quanto as outras gostaram da companhia delas.",
  "feedback.loading": "A carregar o teu grupo",
  "feedback.option.maybe": "Talvez",
  "feedback.option.no": "Não",
  "feedback.option.yes": "Sim",
  "feedback.privateNote":
    "Só tu vês isto. Não voltas a ser agrupade com esta pessoa.",
  "feedback.row.ariaLabel": "Voltar a encontrar {name}?",
  "feedback.saveCta": "Guardar",
  "feedback.saveError": "Não foi possível guardar. Tenta outra vez.",
  "feedback.savingLabel": "A guardar",
  "feedback.title": "Como correu?",
  "feedback.titleWithEvent": "Como correu {title}?",
  "group.avatarsLabel_one": "{count} pessoa no teu grupo",
  "group.avatarsLabel_other": "{count} pessoas no teu grupo",
  "group.bannerLabel": "O teu grupo do Vamos juntes para {title}",
  "group.checkIn.here": "Já cheguei",
  "group.checkIn.hint": "Só o teu grupo vê isto. Nada é publicado na conversa.",
  "group.checkIn.left": "Já saí",
  "group.checkIn.statusHere": "O teu grupo vê que já chegaste.",
  "group.checkIn.statusLeft": "O teu grupo vê que já saíste.",
  "group.dissolved": "Este grupo terminou.",
  "group.entryTitle": "O teu grupo para este convívio",
  "group.error.checkInClosed": "O check-in já fechou para este convívio.",
  "group.error.generic": "Não deu. Tenta outra vez daqui a pouco.",
  "group.error.mergeExpired":
    "Esse grupo encheu ou fechou. Continuas no teu grupo atual.",
  "group.feedbackCta": "Conta-nos como correu",
  "group.icebreakers.title": "Algo para começar",
  "group.leave": "Sair do grupo",
  "group.leaveConfirm.confirm": "Sair do grupo",
  "group.leaveConfirm.description":
    "Também sais da conversa do grupo. As outras pessoas veem a nota habitual de que saíste, e mais nada.",
  "group.leaveConfirm.title": "Sair deste grupo?",
  "group.loadError": "Não conseguimos carregar o teu grupo",
  "group.meetingPoint.heading": "Onde se encontram",
  "group.meetingPoint.label": "Sugestão de quem organiza",
  "group.membersHeading": "Quem vai contigo",
  "group.merge.accept": "Juntar-me a outro grupo",
  "group.merge.body":
    "Há lugar noutro grupo que vai a este convívio. Podes juntar-te a ele, se quiseres.",
  "group.merge.title": "O teu grupo ficou mais pequeno",
  "group.openChat": "Abrir a conversa do grupo",
  "group.pairPartner": "Vem contigo",
  "group.reasonsHeading": "O que têm em comum",
  "group.report": "Denunciar este grupo",
  "group.reportAria": "Denunciar este grupo: conversa de {title}",
  "group.bannerTitle": "O teu grupo do Vamos juntes",
  "group.seeGroup": "Ver o teu grupo",
  "group.sharePlans": "Diz a alguém onde vais estar",
  "group.sheetLabel": "O teu grupo do Vamos juntes",
  "group.status.here": "Já chegou",
  "group.status.left": "Já saiu",
  "group.you": "Tu",
  "host.closedNote":
    "Os pedidos para este convívio já fecharam, por isso estas definições já não podem mudar.",
  "host.create.description":
    "Quem vem sozinhe ou com uma pessoa amiga pode entrar num pequeno grupo para chegarem juntes. Adiciona perguntas e um ponto de encontro em Gerir.",
  "host.create.title": "Oferecer o Vamos juntes",
  "host.cutoff.error": "Escolhe uma hora dentro do intervalo acima.",
  "host.cutoff.hint":
    "Por defeito, 48 horas antes do início. Podes escolher qualquer hora entre {earliest} e {latest}.",
  "host.cutoff.label": "Quando se formam os grupos",
  "host.enable.description":
    "Quem vai pode pedir para entrar num grupo até os grupos se formarem, 48 horas antes do início, a não ser que escolhas outra hora.",
  "host.enable.title": "Oferecer o Vamos juntes",
  "host.heading": "Vamos juntes",
  "host.intro":
    "Quem vem sozinhe ou com uma pessoa amiga pode entrar num pequeno grupo para chegarem juntes.",
  "host.loadError": "Não foi possível carregar as definições do Vamos juntes",
  "host.lockedNote":
    "Os grupos deste convívio já foram formados, por isso estas definições estão bloqueadas.",
  "host.meetingPoint.hint": "Escolhe um sítio público perto do local.",
  "host.meetingPoint.label": "Ponto de encontro",
  "host.meetingPoint.placeholder": "Junto ao quiosque à entrada do parque",
  "host.questions.addAnswer": "Adicionar uma resposta",
  "host.questions.addQuestion": "Adicionar uma pergunta",
  "host.questions.answerLabel": "Resposta {number}",
  "host.questions.answersLabel": "Respostas",
  "host.questions.error":
    "Cada pergunta precisa de texto e de pelo menos 2 respostas.",
  "host.questions.hint":
    "Até 2 perguntas, com 2 a 4 respostas cada. Quem escolhe a mesma resposta tem mais hipóteses de ficar no mesmo grupo.",
  "host.questions.label": "Perguntas divertidas",
  "host.questions.promptLabel": "Pergunta {number}",
  "host.questions.reaskHint":
    "Se mudares ou juntares uma pergunta, quem já está à espera responde no cartão.",
  "host.offConfirm.title": "Desligar o Vamos juntes?",
  "host.offConfirm.description":
    "Quem está à espera de um grupo é avisade de que não há grupo desta vez. Os grupos já formados continuam. Se voltares a ligar, tem de pedir para entrar outra vez.",
  "host.offConfirm.confirm": "Desligar",
  "host.offConfirm.cancel": "Manter ligado",
  "host.questions.promptPlaceholder": "Manta de piquenique ou pista de dança?",
  "host.questions.removeAnswer": "Remover a resposta {number}",
  "host.questions.removeQuestion": "Remover a pergunta {number}",
  "host.save": "Guardar alterações",
  "host.saving": "A guardar",
  "host.summary.groups_one": "grupo formado",
  "host.summary.groups_other": "grupos formados",
  "host.summary.heading": "Até agora",
  "host.summary.note":
    "Só vês números. Quem pediu para entrar fica em privado.",
  "host.summary.waiting_one": "pessoa à espera",
  "host.summary.waiting_other": "pessoas à espera",
  "host.toast.badCutoff":
    "Não foi possível guardar o Vamos juntes: a hora dos grupos já não encaixa neste convívio. Tenta outra vez.",
  "host.toast.closed":
    "Os pedidos para este convívio já fecharam, por isso estas definições ficam como estão.",
  "host.toast.locked":
    "Os grupos já foram formados, por isso estas definições estão bloqueadas.",
  "host.toast.publishSwitchFailed":
    "Não foi possível ativar o Vamos juntes. Podes ativá-lo em Gerir.",
  "host.toast.saveError":
    "Não foi possível guardar as definições do Vamos juntes. Tenta outra vez.",
  "host.toast.saved": "Definições do Vamos juntes guardadas",
  "questionnaire.age.hint": "Só serve para formar grupos. Mais ninguém a vê.",
  "questionnaire.age.label": "A tua idade",
  "questionnaire.agePreference.label": "Idades no teu grupo",
  "questionnaire.area.groupLisbon": "Bairros de Lisboa",
  "questionnaire.area.groupWide": "Outras zonas",
  "questionnaire.area.label": "A tua zona",
  "questionnaire.area.placeholder": "Escolhe um bairro ou zona",
  "questionnaire.area.search": "Procurar zonas",
  "questionnaire.area.skip": "Limpar e saltar",
  "questionnaire.consent.agree":
    "Aceito que a QueerPulse use estas respostas para me sugerir grupos.",
  "questionnaire.consent.delete":
    "Podes ver, editar ou apagar tudo quando quiseres em <link>Definições, Dados e privacidade</link>.",
  "questionnaire.consent.private":
    "Quem organiza e as outras pessoas nunca veem as tuas respostas.",
  "questionnaire.consent.reasons":
    "Quando o teu grupo se forma, só os interesses, a música, a energia e a zona que tens em comum podem aparecer como motivos para estarem juntes.",
  "questionnaire.consent.retention":
    "Se passarem 12 meses sem as editares nem te inscreveres no Vamos juntes, apagamo-las.",
  "questionnaire.consent.use":
    "Usamos as tuas respostas para te sugerir um grupo pequeno quando entras no Vamos juntes de um convívio.",
  "questionnaire.drinking.label": "Como te sentes em relação ao álcool?",
  "questionnaire.energy.nightShape.prompt": "O teu tipo de noite",
  "questionnaire.energy.planner.prompt": "Quando se trata de planos",
  "questionnaire.energy.talker.prompt": "Numa conversa em grupo",
  "questionnaire.error.consent":
    "Marca a caixa de consentimento e guarda outra vez.",
  "questionnaire.error.generic":
    "As tuas respostas não foram guardadas. Tenta outra vez daqui a pouco.",
  "questionnaire.error.invalid":
    "Algumas respostas não passaram. Revê os passos e tenta outra vez.",
  "questionnaire.frequency.label":
    "Com que frequência gostavas de te encontrar?",
  "questionnaire.humour.pairLabel": "Par {position} de {total}",
  "questionnaire.intent.label": "Que tipo de amizade procuras?",
  "questionnaire.language.hint":
    "Escolhe pelo menos uma. Todes no teu grupo vão ter uma língua em comum contigo.",
  "questionnaire.language.label": "Línguas em que gostas de conversar",
  "questionnaire.likert.anchored": "{position} de {total}: {anchor}",
  "questionnaire.likert.position": "{position} de {total}",
  "questionnaire.page.back": "Voltar",
  "questionnaire.page.consentHint":
    "Marca a caixa acima para guardares as tuas respostas.",
  "questionnaire.page.incompleteHint":
    "Responde a todas as perguntas deste passo para continuar.",
  "questionnaire.page.interestsHint":
    "Escolhe pelo menos um interesse para continuar.",
  "questionnaire.page.intro":
    "Cerca de 3 minutos. Respondes uma vez e podes editar quando quiseres.",
  "questionnaire.page.loadErrorTitle":
    "Não conseguimos carregar as tuas respostas",
  "questionnaire.page.next": "Seguinte",
  "questionnaire.page.progressLabel": "Progresso do questionário",
  "questionnaire.page.save": "Guardar respostas",
  "questionnaire.page.saving": "A guardar",
  "questionnaire.page.stepOf": "Passo {step} de {total}: {label}",
  "questionnaire.pickCount": "Escolheste {count} de {max}.",
  "questionnaire.pickLimitReached":
    "Chegaste ao máximo. Desmarca uma para trocar.",
  "questionnaire.step.area.intro":
    "Opcional. Viverem perto torna mais fácil voltarem a encontrar-se.",
  "questionnaire.step.area.short": "Zona",
  "questionnaire.step.area.title": "A tua zona",
  "questionnaire.step.consent.intro":
    "As tuas respostas são pessoais, por isso explicamos com clareza o que lhes acontece.",
  "questionnaire.step.consent.short": "Consentimento",
  "questionnaire.step.consent.title": "Antes de guardares",
  "questionnaire.step.dealbreakers.intro":
    "Só te juntamos a pessoas compatíveis com estas respostas.",
  "questionnaire.step.dealbreakers.short": "Essenciais",
  "questionnaire.step.dealbreakers.title": "O que é essencial para ti",
  "questionnaire.step.energy.intro":
    "Em cada uma, escolhe o ponto que mais tem a ver contigo.",
  "questionnaire.step.energy.short": "Energia",
  "questionnaire.step.energy.title": "A tua energia",
  "questionnaire.step.humour.intro":
    "Em cada par, escolhe a frase que te faz rir mais.",
  "questionnaire.step.humour.short": "Humor",
  "questionnaire.step.humour.title": "O que te faz rir",
  "questionnaire.step.intent.intro":
    "Qualquer resposta é boa. Ajuda-nos a juntar pessoas que querem o mesmo.",
  "questionnaire.step.intent.short": "Intenções",
  "questionnaire.step.intent.title": "O que procuras",
  "questionnaire.step.interests.intro":
    "Escolhe de 1 a 8 coisas que farias com gosto com amigues novos.",
  "questionnaire.step.interests.short": "Interesses",
  "questionnaire.step.interests.title": "Aquilo de que gostas",
  "questionnaire.step.music.intro":
    "Escolhe até 5 géneros. Se a música não é a tua praia, passa à frente.",
  "questionnaire.step.music.short": "Música",
  "questionnaire.step.music.title": "O que ouves",
  "questionnaire.step.values.intro":
    "Quanto é que cada uma destas coisas importa na tua vida?",
  "questionnaire.step.values.short": "Valores",
  "questionnaire.step.values.title": "O que importa para ti",
  "settings.data.card.editCta": "Editar as tuas respostas",
  "settings.data.card.lastAnswered": "Respondeste pela última vez a {date}.",
  "settings.data.card.saved": "Guardado.",
  "settings.data.card.title": "As tuas respostas do Vamos juntes",
  "settings.data.delete.cta": "Eliminar as minhas respostas",
  "settings.data.delete.description":
    "Isto remove as tuas respostas por completo e tira-te do Vamos juntes em qualquer convívio cujo grupo ainda não se formou. Podes sempre responder outra vez mais tarde.",
  "settings.data.delete.title": "As tuas respostas, eliminadas para sempre",
  "settings.data.deleteConfirm.body":
    "Eliminar remove as tuas respostas por completo e tira-te do Vamos juntes em qualquer convívio cujo grupo ainda não se formou. Podes responder às perguntas outra vez quando quiseres.",
  "settings.data.deleteConfirm.confirm": "Eliminar as minhas respostas",
  "settings.data.deleteConfirm.title":
    "Eliminar as tuas respostas do Vamos juntes?",
  "settings.data.deleteError":
    "Não foi possível eliminar as tuas respostas. Tenta novamente daqui a pouco.",
  "settings.data.deleted": "As tuas respostas foram eliminadas.",
  "settings.data.empty.cta": "Responder às perguntas",
  "settings.data.empty.description":
    "Responde a algumas perguntas sobre como gostas de passar o tempo e juntamos-te a pessoas do mesmo convívio com quem te podes dar bem.",
  "settings.data.empty.title":
    "Ainda não respondeste às perguntas do Vamos juntes",
  "settings.data.refreshSuggested":
    "Já lá vai um tempo. Queres atualizar as tuas respostas?",
  "settings.data.sectionLabel": "Respostas do Vamos juntes",
  "card.optIn.hint.hostQuestions":
    "Responde a cada pergunta de quem organiza para continuar.",
  "card.optIn.hint.lensConsent": "Marca a caixa para confirmar a tua lente.",
  "card.optIn.hint.partner": "Escolhe uma pessoa amiga para continuar.",
  "card.answerAgain.body":
    "Continuas na lista. Responde outra vez para te juntarmos ao grupo certo.",
  "card.loadError.retryFailed":
    "O Vamos juntes continua sem carregar. Tenta outra vez daqui a pouco.",
  "card.answerAgain.error.invalidAnswers":
    "As perguntas de quem organiza voltaram a mudar. Responde outra vez e guarda.",
  "card.answerAgain.bodyMany":
    "Continuas na lista. Responde outra vez a cada uma para te juntarmos ao grupo certo.",
  "card.answerAgain.save": "Guardar a minha resposta",
  "card.answerAgain.saveMany": "Guardar as minhas respostas",
  "card.answerAgain.title": "Quem organiza mudou uma pergunta",
  "card.answerAgain.titleMany": "Quem organiza mudou as perguntas",
  "card.loadError.body":
    "Se já tiveres configurado alguma coisa, continua guardada. Tenta outra vez daqui a pouco.",
  "card.loadError.retry": "Tentar outra vez",
  "card.loadError.retrying": "A tentar outra vez",
  "card.loadError.title": "O Vamos juntes não carregou",
  "feedback.confirmation.titleEm": "nos contares",
  "feedback.privacyLine":
    "As tuas respostas ficam privadas. Sem nomes, ajudam-nos a formar grupos melhores.",
  "group.feedbackEditCta": "Mudar o que respondeste sobre o grupo",
  "group.member.optionsLabel": "Opções para {name}",
  "group.member.block": "Bloquear {name}",
  "group.member.report": "Denunciar {name}",
  "group.block.title": "Bloquear {name}?",
  "group.block.description.beforeStart":
    "Sais deste grupo e passas para outro grupo que vai a este convívio, se houver um que encaixe. O teu cartão mostra o que vem a seguir. {name} fica, e ninguém lhe diz porquê.",
  "group.block.description.afterStart":
    "Sais deste grupo e da conversa. {name} fica, e ninguém lhe diz porquê.",
  "group.block.description.late":
    "Já é tarde para mudar de grupo, e deixam de se ver neste grupo. Ninguém diz a {name} porquê.",
  "group.block.everywhere":
    "O bloqueio vale em toda a QueerPulse: {name} não te pode enviar mensagens, ver o teu perfil nem encontrar-te na pesquisa. Podes desbloquear mais tarde.",
  "group.block.confirm": "Bloquear",
  "group.block.movedToast":
    "Bloqueaste {name} e saíste desse grupo. O teu cartão do Vamos juntes mostra o que vem a seguir.",
  "group.block.doneToast": "Bloqueaste {name}.",
  "group.memberReport.title": "Denunciar {name}",
  "group.leaveChat.label": "Sair da conversa",
  "group.leaveChat.hint":
    "Continuas no grupo e ainda podes dizer quem queres voltar a encontrar.",
  "group.leaveChat.done": "Saíste da conversa. Continuas no grupo.",
  "group.leaveChatConfirm.title": "Sair da conversa?",
  "group.leaveChatConfirm.description":
    "Deixas de receber as mensagens deste grupo, e as outras pessoas veem a nota habitual de que saíste. Continuas no grupo, por isso ainda podes dizer quem queres voltar a encontrar.",
  "group.leaveChatConfirm.confirm": "Sair da conversa",
  "group.member.gone": "Esta pessoa já não está no grupo.",
  "group.block.pairMoves":
    "{partner} vem contigo, por isso muda de grupo contigo.",
  "group.block.pairEnds":
    "Tu e {partner} deixam de ser um par para este convívio, e {partner} fica no grupo.",
  "group.block.pairBlocked":
    "Tu e {name} deixam de ser um par para este convívio.",
};
