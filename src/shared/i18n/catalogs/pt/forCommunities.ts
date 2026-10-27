import type { Catalog } from "../../types";

/**
 * The audience landing page for communities and collectives (`/for/communities`): its meta, hero, sections,
 * sample content and questions.
 */
export const forCommunities: Catalog = {
  "meta.title": "QueerPulse para comunidades e coletivos",
  "meta.description":
    "A tua gente, as conversas e os eventos num só sítio, geridos por quem organiza.",

  // ── Hero ──
  "hero.eyebrow": "Para comunidades e coletivos",
  "hero.title": "A tua gente, as conversas e os eventos, <em>num só sítio</em>",
  "hero.lede":
    "Clubes, crews, círculos e coletivos vivem aqui por inteiro: quem entra, o que se conversa, o próximo evento e a própria noite, tudo nas mãos de quem o organiza.",
  "cta.startCommunity": "Criar uma comunidade",
  "cta.createEvent": "Criar um evento",

  // ── Showcase frame labels ──
  "frame.poster": "Exemplo de cartaz de evento",
  "frame.communityCard": "Exemplo de cartão de comunidade",
  "frame.discussion": "Exemplo de publicação na página de uma comunidade",
  "frame.tiers":
    "As quatro formas de uma comunidade deixar entrar pessoas e um exemplo de pedido de entrada",
  "frame.team": "Exemplo de equipa com responsável, cotitular e mod",
  "frame.threads": "Exemplo de tópicos na Discussão de uma comunidade",
  "frame.hosts":
    "Exemplo de quem organiza um evento, com coorganização e uma comunidade convidada",
  "frame.guestList": "Exemplo da lista de convidados à porta",
  "lineup.title": "Lineup",

  // ── Sample content ──
  "sample.community.description":
    "Um coletivo queer de artes que cola cartazes, faz noites de clube e põe estreantes no cartaz.",
  "sample.event.title": "Glitter Paste: Noite de Clube de Outono",
  "sample.discussion.time": "há 2 horas",
  "sample.discussion.text":
    "os cartazes da noite de outono já estão impressos e estão incríveis!! quem pode na quinta para ajudar a colá-los por Arroios, nós levamos os pincéis e a cola e no fim há petiscos",
  "sample.joinRequest.note":
    "vi os vossos cartazes por Arroios inteira e adorava ajudar a colar os próximos, tenho bicicleta e muitas noites livres",
  "sample.joinRequest.time": "3 horas",
  "sample.thread.zine.title":
    "Zine para a noite de outono: quem escreve, quem desenha?",
  "sample.thread.zine.time": "há 3 dias",
  "sample.thread.firstTimers.title":
    "Ideias para a mesa de quem vem pela primeira vez ser acolhedora",
  "sample.thread.firstTimers.time": "na semana passada",
  "album.title": "Fotos do evento",
  "album.count_one": "{count} foto",
  "album.count_other": "{count} fotos",

  // ── Where it all lives today ──
  "scatter.title": "A tua comunidade vive em seis sítios ao mesmo tempo",
  "scatter.lede":
    "Se organizas um coletivo, já conheces a história. Cada parte está numa app diferente, e és tu quem segura tudo junto.",
  "scatter.chat.label": "O grupo de chat",
  "scatter.chat.quote":
    "trezentas mensagens durante a noite e a data do próximo encontro está algures lá no meio",
  "scatter.sheet.label": "A folha de cálculo",
  "scatter.sheet.quote":
    "quem fez a folha de inscrições saiu e agora ninguém a consegue editar",
  "scatter.tickets.label": "O site de bilhetes",
  "scatter.tickets.quote":
    "só queremos saber quem vem e pedem-nos um perfil de empresa inteiro",
  "scatter.form.label": "O formulário de entrada",
  "scatter.form.quote":
    "as respostas caem no email de alguém e ficam lá semanas",
  "scatter.photos.label": "A pasta das fotos",
  "scatter.photos.quote":
    "as fotos da última vez estão num link que expirou em março",
  "scatter.bio.label": "O link na bio",
  "scatter.bio.quote":
    "gente nova encontra-nos por um post de há dois anos e pergunta se ainda existimos",
  "scatter.punchline": "Dá à tua gente uma só página onde se encontrar.",

  // ── How it works here ──
  "walkthrough.title": "Do primeiro olá à última música",
  "walkthrough.lede":
    "A página da comunidade junta as pessoas, as conversas e os eventos, e quem a organiza divide o trabalho.",
  "walkthrough.join.title": "Escolhe como se entra",
  "walkthrough.join.body":
    "Aberta a todas as pessoas, por pedido, por convite pessoal, ou privada e escondida do Descobrir. Os pedidos chegam à fila da tua equipa, que aprova ou recusa cada um.",
  "walkthrough.tier.public":
    "Qualquer pessoa no QueerPulse entra com um toque.",
  "walkthrough.tier.request": "As pessoas pedem e a tua equipa responde.",
  "walkthrough.tier.invite": "Só entra quem convidas pelo nome.",
  "walkthrough.tier.private":
    "Escondida do Descobrir, visível para a tua gente e para quem convidas.",
  "walkthrough.team.title": "Organizem em conjunto",
  "walkthrough.team.body":
    "Uma pessoa responsável, cotitulares com quase todos os poderes dela, e mods que mantêm o ambiente bom. O trabalho é partilhado e ninguém fica com tudo às costas.",
  "walkthrough.team.rosterTitle": "Quem organiza",
  "walkthrough.talk.title": "Conversem onde toda a gente vos encontra",
  "walkthrough.talk.body":
    "Publicações rápidas com reações no Pulso, conversas mais longas na Discussão. Fica tudo na página da comunidade, à espera da próxima pessoa que entrar.",
  "walkthrough.events.title": "Façam eventos com a vossa gente",
  "walkthrough.events.body":
    "Anuncia a noite, junta coanfitriões, convida outras comunidades e monta o lineup. Quem organiza convida pessoas para o cartaz, e quando aceitam aparecem com o seu ofício ao lado do nome.",
  "walkthrough.door.title": "Abre a porta na noite",
  "walkthrough.door.body":
    "Faz o check-in das pessoas pela lista de convidados ou lendo o cartão QueerPulse, e vê as entradas a encher. Depois do evento, quem organiza junta as fotos ao álbum do evento.",

  // ── Try it ──
  "tryIt.title": "Leva um evento por toda a sua vida",
  "tryIt.lede":
    "Escolhe um momento e vê os componentes reais do evento mudarem com ele.",
  "tryIt.switchLabel": "Momento da vida do evento",
  "tryIt.state.announce": "Anúncio",
  "tryIt.state.lineup": "Lineup",
  "tryIt.state.doors": "Porta",
  "tryIt.state.photos": "Fotos",
  "tryIt.frame.announce": "Exemplo de cartaz de evento",
  "tryIt.frame.lineup": "Exemplo de cartaz de evento com o lineup",
  "tryIt.frame.doors": "Exemplo do contador de entradas na noite",
  "tryIt.frame.photos": "Exemplo do álbum de fotos de um evento",
  "tryIt.caption.announce":
    "O cartaz sobe com a data, o bairro e quem organiza, e as pessoas dizem que vão.",
  "tryIt.caption.lineup":
    "O lineup enche à medida que DJs, artistas drag e quem dança aceitam os convites, cada um com o seu ofício ao lado do nome.",
  "tryIt.caption.doors":
    "A porta abre e o contador soma as entradas enquanto quem organiza risca a lista.",
  "tryIt.caption.photos":
    "Depois do evento quem organiza junta as fotos, e só quem organiza e as pessoas que iam as podem ver.",

  // ── All in one place ──
  "allInOne.title": "Uma página no lugar da pilha",
  "allInOne.lede":
    "As ferramentas que hoje coses umas às outras, e o que a página da comunidade põe no lugar delas.",
  "allInOne.before.chat": "Um grupo de chat que nunca dorme",
  "allInOne.before.sheet": "Uma folha de cálculo de quem está dentro",
  "allInOne.before.tickets": "Um site de bilhetes para cada evento",
  "allInOne.before.photos": "Uma pasta partilhada de fotos",
  "allInOne.before.money": "Um link de donativos que ninguém encontra",
  "allInOne.after.page":
    "Uma página da comunidade com a vossa gente, publicações e conversas",
  "allInOne.after.events":
    "Eventos com coanfitriões, comunidades convidadas e lineup",
  "allInOne.after.door": "Check-in à porta e um álbum depois",
  "allInOne.after.support": "Um separador Apoiar com as formas de vos ajudar",
  "allInOne.after.quiz":
    "Noites de quiz com o Pulse Live, jogadas no telemóvel",
  "allInOne.after.together":
    "Vamos juntes, para quem vem a solo chegar com um pequeno grupo",

  // ── Safe by design ──
  "safety.title": "Nas mãos da vossa gente",
  "safety.lede":
    "As ferramentas que mantêm uma comunidade boa e as suas pessoas seguras já vêm incluídas.",
  "safety.review.title": "Revisão de pedidos",
  "safety.review.body":
    "Numa comunidade por pedido, cada pedido espera que a tua equipa o aprove ou recuse.",
  "safety.bans.title": "Banimentos a duas mãos",
  "safety.bans.body":
    "Um banimento afasta a pessoa de imediato, e um banimento permanente precisa da assinatura de uma segunda pessoa da moderação.",
  "safety.log.title": "Um registo de governação",
  "safety.log.body":
    "Cada mudança de papel, remoção, banimento e alteração de definições fica registada, para a tua equipa saber quem fez o quê.",
  "safety.private.title": "Privada quando precisas",
  "safety.private.body":
    "Uma comunidade privada fica fora do Descobrir, e a sua página só abre para a tua gente e para quem convidas.",
  "safety.photos.title": "Fotos que se podem denunciar",
  "safety.photos.body":
    "Quem pode ver uma foto do evento pode denunciá-la, e quem a juntou pode retirá-la.",
  "safety.conduct.body":
    "O código de conduta do QueerPulse aplica-se em toda a plataforma, incluindo a tua comunidade e os seus eventos.",
  "safety.conduct.cta": "Ler o código de conduta",

  // ── Questions ──
  "faq.whoSees.question": "Quem pode ver a nossa comunidade?",
  "faq.whoSees.answer":
    "O QueerPulse funciona só por convite, por isso só quem está no QueerPulse vê comunidades. As comunidades abertas, por pedido e só por convite aparecem no Descobrir. Uma comunidade <b>privada</b> fica escondida, e a sua página só abre para a sua gente e para quem tem convite.",
  "faq.private.question": "Podemos mantê-la privada?",
  "faq.private.answer":
    "Sim. Escolhe <b>Privada</b> e a comunidade sai do Descobrir. Só se entra com um convite da tua equipa.",
  "faq.team.question": "Podemos organizá-la entre várias pessoas?",
  "faq.team.answer":
    "Sim. Há uma pessoa <b>responsável</b>, e podes juntar <b>cotitulares</b> com quase todos os poderes dela, mais <b>mods</b> que cuidam das publicações, dos pedidos e das pessoas. Só a pessoa responsável pode passar a comunidade a outra pessoa ou arquivá-la.",
  "faq.together.question": "Podemos fazer eventos com outras comunidades?",
  "faq.together.answer":
    "Sim. Junta coanfitriões a um evento e convida outras comunidades a participar. Cada uma aceita ou recusa o convite.",
  "faq.support.question": "As pessoas podem apoiar-nos com dinheiro?",
  "faq.support.answer":
    "A tua comunidade pode ter um separador <b>Apoiar</b> com as formas de ajudar: um link de angariação, um número MB WAY ou uma transferência bancária, com uma linha sobre o destino do apoio. O dinheiro vai direto para a comunidade, e o QueerPulse nunca lhe toca.",

  // ── Closing ──
  "closing.title": "Traz a tua gente <em>para casa</em>",
  "closing.body":
    "Cria a página da tua comunidade, cola o primeiro cartaz e deixa a tua gente encontrar-se.",
};
