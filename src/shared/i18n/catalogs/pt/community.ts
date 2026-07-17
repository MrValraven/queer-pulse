import type { Catalog } from "../../types";

/**
 * Community — pt-PT inclusivo. Mesmas chaves que `en/community.ts`.
 *
 * Notas de tradução:
 * - "Members" → "pessoas" ou "a comunidade", nunca "Membros".
 * - Registo `tu`, caloroso, nunca `você`.
 * - Formas neutras (-e) só quando nos dirigimos diretamente à pessoa
 *   (ex.: "bem-vinde", "obrigade", "prontе"), nunca `@`/`x`, nunca
 *   masculino por omissão.
 * - Bios, citações e conteúdo atribuído a pessoas (agentes de mudança,
 *   artistas, avaliações "da comunidade", grupos de leitura) NÃO são
 *   traduzidos — em modo live vêm da API como texto de quem os escreveu.
 * - Marca QueerPulse, nomes próprios, bairros e nomes de aplicações de
 *   namoro ficam iguais em ambos os catálogos.
 */
export const community: Catalog = {
  // ── Caregivers page (CaregiversPage.tsx) ──────────────────────────────────
  "caregivers.hero.eyebrow":
    "Para pais e mães · parceires · irmãos e irmãs · amigues · para quem estiver presente",
  "caregivers.hero.title":
    "Estar presente <em>como deve ser</em>, quando importa.",
  "caregivers.hero.lead":
    "Um espaço dedicado a quem ama uma pessoa queer e quer fazer isto bem. <em>Não precisas de saber tudo antes de começar.</em> Precisas de algumas respostas simples, de umas conversas, e da comunidade a apoiar-te.",
  "caregivers.hero.whoAriaLabel": "Quem és?",
  "caregivers.persona.parent": "Sou pai ou mãe",
  "caregivers.persona.partner": "Sou parceire",
  "caregivers.persona.siblingFriend": "Sou irmão, irmã ou amigue",
  "caregivers.persona.youthWorker": "Trabalho com jovens",
  "caregivers.outro.title": "Não tens de <em>acertar sempre.</em>",
  "caregivers.outro.sub":
    "Tens de continuar a aparecer. Este espaço também é para ti.",
  "caregivers.outro.cta": "Encontrar uma sala de apoio",

  // Caregivers — Start Here (five short reads)
  "caregivers.startHere.title": "Começa <em>aqui</em>",
  "caregivers.startHere.lead":
    "Cinco leituras curtas. Cada uma responde a uma pergunta concreta, na linguagem que gostaríamos de ouvir. <em>Não é um curso. Não são 50 módulos.</em> Cinco leituras.",
  "caregivers.lesson.listen.title": "Como <em>ouvir</em> da primeira vez",
  "caregivers.lesson.listen.body":
    "A primeira conversa importa menos do que pensas e mais do que pensas. <em>Uma coisa a fazer; três coisas a não fazer.</em> Escrito por Sara Marques + 6 pais e mães.",
  "caregivers.lesson.listen.readTime": "4 min de leitura",
  "caregivers.lesson.listen.langs": "PT + EN",
  "caregivers.lesson.wrongThing.title":
    "O que dizer <em>quando dizes asneira</em>",
  "caregivers.lesson.wrongThing.body":
    "Vais dizer. Toda a gente diz. <em>O que importa é reparar.</em> Um pequeno guião e um pedido de desculpas com calma, escrito por pessoas que já o fizeram mal e bem.",
  "caregivers.lesson.wrongThing.readTime": "5 min de leitura",
  "caregivers.lesson.wrongThing.langs": "PT + EN",
  "caregivers.lesson.pronouns.title":
    "Pronomes &amp; <em>nomes</em>, de forma simples",
  "caregivers.lesson.pronouns.body":
    "O que fazer, o que não fazer, o que fazer quando te enganas. <em>Não é um texto político — é um texto prático.</em> Escrito por Yara R.",
  "caregivers.lesson.pronouns.readTime": "3 min de leitura",
  "caregivers.lesson.pronouns.langs": "PT + EN",
  "caregivers.lesson.transitioning.title":
    "Se a tua pessoa está a <em>fazer transição médica</em>",
  "caregivers.lesson.transitioning.body":
    "O que perguntar, o que não perguntar, para que te prepares. Aborda terapia hormonal, cirurgias de afirmação de género e especificidades do sistema de saúde português. <em>Escrito por pessoas trans da comunidade + os pais e mães delas.</em>",
  "caregivers.lesson.transitioning.readTime": "9 min de leitura",
  "caregivers.lesson.transitioning.langs": "PT + EN",
  "caregivers.lesson.familyPullsAway.title":
    "Quando a família <em>puxa para o lado contrário</em>",
  "caregivers.lesson.familyPullsAway.body":
    "Quando avós, sogros e primos tornam tudo mais difícil. <em>Como manter a posição sem incendiar a casa toda.</em> Escrito por 4 pais e mães.",
  "caregivers.lesson.familyPullsAway.readTime": "7 min de leitura",
  "caregivers.lesson.familyPullsAway.langs": "PT + EN",

  // Caregivers — Common questions (FAQ accordion)
  "caregivers.commonQuestions.title": "Perguntas <em>frequentes</em>",
  "caregivers.faq.childCameOut.q":
    "O meu filho ou filha acabou de sair do armário e não sei o que dizer. <em>Ajuda.</em>",
  "caregivers.faq.childCameOut.a":
    '<strong>Respira fundo. Diz "obrigade por me teres contado." Depois pergunta "há alguma coisa de que precises de mim agora?"</strong> É só isso. Não precisas de saber a linguagem certa. Não precisas de ter um plano. <em>Esta é uma conversa longa, não uma conversa única.</em> Volta mais tarde com perguntas — vão estar prontas para as ouvir, e este espaço também está aqui.',
  "caregivers.faq.partnerTransitioning.q":
    "O meu par está em transição e tenho medo que nos afastemos.",
  "caregivers.faq.partnerTransitioning.a":
    "Muitas pessoas na tua posição sentem o mesmo medo, e não há vergonha nenhuma nisso. <em>Tens todo o direito de o sentir.</em> O que ajuda: falar com outros pares que já passaram por isto — vê as salas de apoio abaixo. Também ajuda: continuar a fazer as pequenas coisas que sempre foram vossas, juntes. A transição muda muita coisa. Não tem de mudar tudo.",
  "caregivers.faq.wrongPronouns.q":
    "Continuo a usar os pronomes errados. O meu amigue vai perdoar-me?",
  "caregivers.faq.wrongPronouns.a":
    'Provavelmente. O que mais ajuda: corrige-te <em>sem tornar isto sobre ti</em>. "Ela — desculpa, elu — disse." Segue em frente. Não peças desculpa outra vez três frases depois. Não peças que te absolvam. Continua só a praticar. <strong>O esforço é o que vão lembrar-se.</strong>',
  "caregivers.faq.grandchildQueer.q":
    "O meu neto ou neta é queer e os meus filhos não lhe falam. <em>O que faço?</em>",
  "caregivers.faq.grandchildQueer.a":
    "Mantém-te em contacto com o teu neto ou neta. <em>Cada relação direta conta.</em> Não deixes que carreguem o conflito familiar. Sê a voz constante a quem podem voltar. Se quiseres escrever aos teus filhos sobre isto, o recurso para Pais e Mães tem uma carta-modelo que a comunidade tem vindo a melhorar ao longo dos anos.",

  // Caregivers — Voice rooms
  "caregivers.voiceRooms.title": "Fala com <em>outras pessoas</em> como tu",
  "caregivers.voiceRooms.lead":
    "Salas de apoio só para pessoas da comunidade. A entrada é opcional e discreta.",
  "caregivers.room.parents.title": "Sala de voz <em>de pais e mães</em>",
  "caregivers.room.parents.sub":
    "Todas as terças 21:00 Lisboa · com facilitação · PT + EN",
  "caregivers.room.parents.meta": "38 pais e mães na sala · na última semana",
  "caregivers.room.partnersOfTrans.title": "Pares de <em>pessoas trans</em>",
  "caregivers.room.partnersOfTrans.sub":
    "Quinzenal às quintas 20:00 · com facilitação · EN",
  "caregivers.room.partnersOfTrans.meta": "12 pares na sala",
  "caregivers.room.siblings.title":
    "Irmãos, irmãs &amp; <em>família escolhida</em>",
  "caregivers.room.siblings.sub":
    "Mensal ao domingo 18:00 · informal · PT + EN",
  "caregivers.room.siblings.meta": "22 pessoas · no mês passado",
  "caregivers.room.youthWorkers.title": "Quem trabalha com <em>jovens</em>",
  "caregivers.room.youthWorkers.sub":
    "Docentes, técnicos/as sociais, equipas de clubes juvenis · Qua 19:00",
  "caregivers.room.youthWorkers.meta": "14 pessoas na sala",

  // Caregivers — Don't say / Do say
  "caregivers.dontDoSay.eyebrow": "— uma pequena lista —",
  "caregivers.dontDoSay.heading": "Não digas isto. <em>Diz isto.</em>",
  "caregivers.dontDoSay.lead":
    "Algumas das coisas que gostaríamos que nos tivessem dito. Não é uma lista exaustiva nem um guião — só alguns primeiros passos que ajudam.",
  "caregivers.dontDoSay.dontHeading": "Não <em>digas</em>",
  "caregivers.dontDoSay.doHeading": "<em>Diz</em> antes",
  "caregivers.dontSay.1": '"Tens a certeza?"',
  "caregivers.dontSay.2": '"Como é que sabes?"',
  "caregivers.dontSay.3": '"Não digas à tua avó."',
  "caregivers.dontSay.4": '"É só uma fase."',
  "caregivers.dontSay.5": '"Não pareces queer."',
  "caregivers.dontSay.6": '"Adoro-te mas não concordo."',
  "caregivers.dontSay.7": '"O que é que eu fiz de errado?"',
  "caregivers.doSay.1": '"Obrigade por me teres contado."',
  "caregivers.doSay.2": '"O que precisas de mim agora?"',
  "caregivers.doSay.3": '"Quero fazer isto bem. <em>Posso enganar-me.</em>"',
  "caregivers.doSay.4": '"Diz-me que nome e pronomes usar."',
  "caregivers.doSay.5": '"A quem mais contaste? A quem não devo contar?"',
  "caregivers.doSay.6": '"Adoro-te. O resto vamos resolvendo."',
  "caregivers.doSay.7":
    '"Vou fazer a minha própria aprendizagem, para não teres de me ensinar."',

  // ── Change Makers directory (ChangemakersPage.tsx) ────────────────────────
  "changemakers.hero.cat": "Agentes de Mudança",
  "changemakers.hero.title":
    "Pessoas que tornam o futuro <em>vivível</em> para toda a gente.",
  "changemakers.hero.lead":
    "Não são ativistas a tempo inteiro. São pessoas que trabalham em design, advocacia, cuidados e ensino — e que também estão a mudar as coisas — bairro a bairro, política a política, uma conversa difícil de cada vez.",
  "changemakers.stat.profiled": "Agentes de mudança já retratados",
  "changemakers.stat.causeAreas": "Áreas de causa ativas em Lisboa",
  "changemakers.stat.peopleHelped":
    "Pessoas diretamente ajudadas pelo trabalho delas",
  "changemakers.stat.activeCampaigns": "Campanhas ativas neste momento",
  "changemakers.featured.label": "Agente de mudança em destaque",
  "changemakers.featured.readStoryCta": "Lê a história dela →",
  "changemakers.featured.connectCta": "Ligar",
  "changemakers.empty.title": "Ainda não há agentes de mudança retratados",
  "changemakers.empty.description":
    "É aqui que celebramos quem está, em silêncio, a tornar as coisas melhores. Conheces alguém a fazer esse trabalho? Nomeia essa pessoa abaixo e começamos a história.",
  "changemakers.card.readMoreCta": "Ler mais →",

  // Change Makers — nominate form
  "changemakers.nominate.eyebrow": "Nomeações da comunidade",
  "changemakers.nominate.heading":
    "Conheces alguém que devia <em>estar aqui?</em>",
  "changemakers.nominate.lead":
    "Acrescentamos agentes de mudança através de nomeações da comunidade. Se conheces alguém a fazer um trabalho significativo pelas pessoas queer em Lisboa, um nome e uma frase já chegam para começar.",
  "changemakers.nominate.namePlaceholder": "O nome dessa pessoa…",
  "changemakers.nominate.submitCta": "Nomear",
  "changemakers.nominate.submitPending": "A enviar…",
  "changemakers.nominate.successToast": "Obrigade — vamos investigar {name}.",
  "changemakers.nominate.errorToast":
    "Não foi possível enviar a tua nomeação — tenta novamente.",

  // ── Change Maker story page (ChangemakerStoryPage.tsx) ────────────────────
  "changemakerStory.backCta": "← Agentes de Mudança",
  "changemakerStory.categoryLabel": "Agente de Mudança · {cause}",
  "changemakerStory.impactLabel": "Porque destacamos {name}",
  "changemakerStory.outro.title":
    "Queres apoiar o trabalho <em>de {name}?</em>",
  "changemakerStory.outro.sub":
    "As pessoas agentes de mudança fazem isto para além do trabalho do dia a dia. Uma mensagem, uma apresentação ou uma hora do teu tempo valem mais do que imaginas.",
  "changemakerStory.outro.connectCta": "Contactar {name} →",
  "changemakerStory.outro.moreCta": "Conhecer mais agentes de mudança",
  "changemakerStory.moreLabel": "Mais agentes de mudança",

  // ── Coming Out page (ComingOutPage.tsx) ───────────────────────────────────
  "comingOut.hero.eyebrow": "Apoio para Sair do Armário · Espaço privado",
  "comingOut.hero.title":
    "Um lugar para o dizeres <em>antes de o dizeres.</em>",
  "comingOut.hero.lead":
    'Um espaço privado e discreto para quem está a navegar o processo de sair do armário — no trabalho, à família ou a si próprie. Não há pressão para já estares "fora do armário" para entrares, e nada aqui é visível a partir do teu perfil público.',
  "comingOut.privacy.heading":
    "Pensado para a <em>privacidade</em>, antes de tudo.",
  "comingOut.privacy.lead":
    "Este espaço tem controlos adicionais além do resto da QueerPulse. Existem para que possas estar aqui sem que isso te custe nada noutro lado.",
  "comingOut.privacy.invisible.title": "Invisível a partir do teu perfil",
  "comingOut.privacy.invisible.body":
    "Nada do que fazes aqui aparece no teu perfil público ou em qualquer feed. A própria participação fica escondida.",
  "comingOut.privacy.noList.title": "Sem lista pública de pessoas",
  "comingOut.privacy.noList.body":
    "Não podes ser encontrade nem pesquisade aqui. As pessoas só veem o que é partilhado dentro do espaço.",
  "comingOut.privacy.confidentiality.title":
    "Confidencialidade em primeiro lugar",
  "comingOut.privacy.confidentiality.body":
    "Moderação mais rigorosa, sem capturas de ecrã, sem partilha para fora. A primeira regra e a última.",
  "comingOut.privacy.noPressure.title":
    'Sem pressão para estares "fora do armário"',
  "comingOut.privacy.noPressure.body":
    "Entra em qualquer fase — incluindo o ainda-não e o não-tenho-a-certeza. Podes sair no momento em que estiveres pronte.",
  "comingOut.stages.heading": "Da forma como <em>precisares de o usar.</em>",
  "comingOut.stages.lead":
    "Facilitado com mão leve pela Mariana, psicóloga clínica que trata a confidencialidade como a primeira regra e a última.",
  "comingOut.stage.readFirst.title": "Primeiro, só para ti",
  "comingOut.stage.readFirst.body":
    "Há pessoas que só leem. É uma forma completa e válida de estar aqui — ninguém te vai pedir para publicares.",
  "comingOut.stage.saySafely.title": "Diz-o num lugar seguro",
  "comingOut.stage.saySafely.body":
    "Experimenta dizer as palavras em voz alta aqui antes de as dizeres a sério. O círculo semanal existe exatamente para isso.",
  "comingOut.stage.moveOn.title": "Passa por aqui, e segue",
  "comingOut.stage.moveOn.body":
    "As pessoas deixam este espaço quando já não precisam dele. É esse o objetivo — não é uma despedida.",
  "comingOut.outro.title": "Não deves <em>um discurso perfeito.</em>",
  "comingOut.outro.sub":
    "Dizer a verdade de forma imperfeita continua a ser dizer a verdade. Entra no espaço quando estiveres pronte — e sai no momento em que quiseres.",
  "comingOut.outro.enterCta": "Entrar no espaço →",
  "comingOut.outro.communitiesCta": "Ver todas as comunidades",

  // ── Creatives directory (CreativesPage.tsx + sub-components) ──────────────
  "creatives.hero.eyebrow": "Em destaque esta semana",
  "creatives.hero.dotAriaLabel": "Destaque {index}",
  "creatives.mode.art": "Arte Visual",
  "creatives.mode.music": "Música",
  "creatives.filter.all": "Tudo",
  "creatives.filter.photography": "Fotografia",
  "creatives.filter.ceramics": "Cerâmica",
  "creatives.filter.typography": "Tipografia",
  "creatives.filter.film": "Cinema",
  "creatives.filter.illustration": "Ilustração",
  "creatives.filter.textile": "Têxtil",
  "creatives.filter.mural": "Mural",
  "creatives.filter.electronic": "Eletrónica",
  "creatives.filter.folk": "Folk",
  "creatives.filter.jazz": "Jazz",
  "creatives.filter.rnb": "R&B",
  "creatives.badge.commission": "Encomendas abertas",
  "creatives.badge.exhibition": "Exposição",
  "creatives.badge.openCall": "Chamada aberta",
  "creatives.badge.liveSets": "Concertos ao vivo",
  "creatives.badge.bookingsOpen": "Reservas abertas",
  "creatives.badge.collab": "Colaboração",
  "creatives.count.works_one": "{count} obra",
  "creatives.count.works_other": "{count} obras",
  "creatives.count.artists_one": "{count} artista",
  "creatives.count.artists_other": "{count} artistas",
  "creatives.card.viewProfileCta": "Ver perfil →",
  "creatives.card.viewProfileCtaShort": "Ver perfil",
  "creatives.card.artistPhoto": "foto de artista",
  "creatives.player.playAriaLabel": "Reproduzir",
  "creatives.empty.art.title": "Nada corresponde aos teus filtros",
  "creatives.empty.art.description":
    "Nenhuma obra corresponde a estas etiquetas agora. Limpa-as para veres tudo o que a comunidade partilhou.",
  "creatives.empty.music.title": "Nada corresponde aos teus filtros",
  "creatives.empty.music.description":
    "Nenhum artista corresponde a estas etiquetas agora. Limpa-as para ouvires toda a gente.",
  "creatives.empty.clearFiltersCta": "Limpar filtros",
  "creatives.outro.title": "O teu trabalho <em>pertence aqui.</em>",
  "creatives.outro.sub":
    "A QueerPulse é um espaço para artistas queer serem encontrades, apoiades e contratades — umas pelas outras e pela comunidade em geral.",
  "creatives.outro.cta": "Adicionar o teu perfil criativo",

  // ── Dating & Relationships page (DatingPage.tsx + data) ───────────────────
  "dating.hero.cat": "Namoro e Relações · Lisboa",
  "dating.hero.title": "Ligação, <em>nos teus próprios termos.</em>",
  "dating.hero.sub":
    "O panorama das aplicações, a cultura de namoro em Lisboa, as estruturas de relação, o reconhecimento legal — e onde a comunidade se encontra mesmo, fora do ecrã do telemóvel.",

  "dating.apps.heading": "Aplicações em <em>Lisboa</em>",
  "dating.apps.lead":
    "O que a comunidade realmente usa — opiniões honestas, não textos de marketing.",
  "dating.app.grindr.audience": "Homens gays e bi · Trans masculinidades",
  "dating.app.grindr.body":
    "Continua a ser a aplicação com mais utilizadores gays e bi em Lisboa. Funciona. A cultura varia imenso consoante quem está online em cada momento.",
  "dating.app.grindr.tag1": "Orientada a convívios casuais",
  "dating.app.grindr.tag2": "Muito movimento",
  "dating.app.grindr.tag3": "Cultura variável",
  "dating.app.grindr.quote":
    '"Funciona bem para o que é. Define as tuas preferências com clareza e encontras a tua gente. A comunidade tende a concentrar-se no Príncipe Real e na Mouraria."',
  "dating.app.scruff.audience":
    "Homens gays e bi · Bears · Perfil mais masculino",
  "dating.app.scruff.body":
    "Mais conversacional do que o Grindr. Melhor para quem quer conversar primeiro. Tem eventos e funcionalidades de grupo que a comunidade queer usa ativamente em Lisboa.",
  "dating.app.scruff.tag1": "Funcionalidades de comunidade",
  "dating.app.scruff.tag2": "Foco em conversar primeiro",
  "dating.app.scruff.tag3": "Bears e perfil masculino",
  "dating.app.scruff.quote":
    '"O grupo em Lisboa é mais pequeno mas o ambiente é melhor. É mais provável resultar numa conversa a sério."',
  "dating.app.her.audience": "Mulheres queer · Pessoas não-binárias",
  "dating.app.her.body":
    "A principal aplicação para mulheres queer e pessoas não-binárias em Lisboa. Grupo mais pequeno mas genuinamente orientada para a comunidade — tem listas de eventos e grupos para além do namoro.",
  "dating.app.her.tag1": "Comunidade em primeiro lugar",
  "dating.app.her.tag2": "Eventos e grupos",
  "dating.app.her.tag3": "Todo o tipo de relações",
  "dating.app.her.quote":
    '"Não é enorme em Lisboa mas a qualidade das ligações é melhor. Vale a pena ter a par do Tinder."',
  "dating.app.feeld.audience":
    "Todos os géneros · Não-monogamia ética · Próxima do kink",
  "dating.app.feeld.body":
    "A referência para não-monogamia ética, relações abertas e kink em Lisboa. Muito inclusiva quanto à identidade. A crescer rápido na comunidade — também muito usada em eventos e convívios.",
  "dating.app.feeld.tag1": "Não-monogamia ética",
  "dating.app.feeld.tag2": "Próxima do kink",
  "dating.app.feeld.tag3": "Inclusiva quanto à identidade",
  "dating.app.feeld.tag4": "Casais e solteires",
  "dating.app.feeld.quote":
    '"A melhor aplicação para quem não quer caber numa caixa arrumada. A comunidade aqui usa-a mais do que em qualquer sítio onde já vivi."',
  "dating.app.hornet.audience": "Homens gays e bi · Foco na comunidade",
  "dating.app.hornet.body":
    "Mais orientada para a comunidade do que o Grindr — tem notícias, histórias e funcionalidades de grupo. Melhor para quem quer conhecer a cidade e não só namorar nela. Ativa em Lisboa.",
  "dating.app.hornet.tag1": "Funcionalidades de comunidade",
  "dating.app.hornet.tag2": "Notícias locais",
  "dating.app.hornet.tag3": "Mais do que convívios casuais",
  "dating.app.hornet.quote":
    '"Usei isto para encontrar eventos e sítios da comunidade antes de ter uma rede social. Subestimada."',
  "dating.app.okcupid.audience": "Todos os géneros · Relações",
  "dating.app.okcupid.body":
    "As melhores opções de identidade e pronomes de qualquer aplicação mainstream. O sistema de perguntas faz com que chegues às conversas já a saber que tens algo em comum. Ritmo mais lento, melhor para relações do que para convívios casuais.",
  "dating.app.okcupid.tag1": "Melhores opções de identidade",
  "dating.app.okcupid.tag2": "Foco em relações",
  "dating.app.okcupid.tag3": "Ritmo mais lento",
  "dating.app.okcupid.quote":
    '"Se te importas com a política e os valores de alguém antes das fotos, o OkCupid é a escolha certa."',

  "dating.culture.heading": "Cultura de namoro <em>em Lisboa</em>",
  "dating.culture.lead":
    "Coisas que a comunidade gostava que lhe tivessem dito antes de começar a namorar aqui.",
  "dating.culture.smallCommunity.title": "É uma comunidade pequena",
  "dating.culture.smallCommunity.text":
    "A comunidade queer de Lisboa é íntima. Vais encontrar as mesmas pessoas em eventos, nas aplicações e através de amigues, semanas depois de chegares. Isto é, na maior parte, maravilhoso — mas também significa que a forma como tratas as pessoas ecoa. Sê gentil.",
  "dating.culture.slowerPace.title": "O ritmo é mais lento",
  "dating.culture.slowerPace.text":
    "A cultura social e de namoro portuguesa é, em geral, mais lenta do que as normas do norte da Europa ou da América do Norte. Conta com períodos de aquecimento mais longos, mais ênfase na química presencial e menos pressão para definir tudo depressa. Isto é uma vantagem, não um defeito.",
  "dating.culture.languageGap.title": "A barreira da língua é real",
  "dating.culture.languageGap.text":
    "Namorar através de uma barreira linguística é uma experiência específica. Há quem ache libertador; outres acham cansativo. A comunidade queer de expatriades é suficientemente grande para namorares dentro dela — mas vais perder a comunidade mais alargada se só namorares com outres expatriades.",
  "dating.culture.eventsMatter.title":
    "Os eventos são como as pessoas realmente se conhecem",
  "dating.culture.eventsMatter.text":
    "As aplicações importam menos aqui do que em algumas cidades. Uma parte significativa das relações na comunidade QueerPulse começou num evento da comunidade, através de uma apresentação em comum, ou num convívio do fórum. Aparece.",

  "dating.structures.heading": "<em>Estruturas</em> de relação",
  "dating.structures.lead":
    "Lisboa tem uma comunidade ativa e visível em todas as estruturas de relação. Aqui não se assume nenhuma como padrão.",
  "dating.structure.monogamy.label": "Monogamia",
  "dating.structure.monogamy.title": "Uma pessoa, por inteiro",
  "dating.structure.monogamy.text":
    "Completamente válida e comum. A comunidade não assume que a não-monogamia seja mais progressista — é uma preferência, não uma hierarquia. As proteções legais em Portugal são mais fortes para casais monógamos casados, o que vale a pena saber se o reconhecimento legal for importante para ti.",
  "dating.structure.enm.label": "Não-monogamia ética",
  "dating.structure.enm.title": "Relações abertas",
  "dating.structure.enm.text":
    'A não-monogamia ética cobre um leque amplo, desde "abertos mas juntos" até relações totalmente independentes com várias pessoas. O Feeld e os próprios convívios da comunidade são os melhores pontos de entrada. O fórum tem um tópico ativo sobre não-monogamia ética com convívios locais.',
  "dating.structure.polyamory.label": "Poliamor",
  "dating.structure.polyamory.title": "Várias relações de amor",
  "dating.structure.polyamory.text":
    "Uma cultura distinta da não-monogamia ética — mais focada em várias relações de compromisso do que em estruturas abertas ou casuais. Há uma comunidade poliamorosa ativa em Lisboa, com convívios regulares e apoio no fórum. Legalmente complexo em Portugal — sobretudo em questões de habitação, saúde e situações familiares.",
  "dating.structure.relationshipAnarchy.label": "Anarquia relacional",
  "dating.structure.relationshipAnarchy.title": "Sem hierarquia, sem regras",
  "dating.structure.relationshipAnarchy.text":
    "Relações definidas inteiramente pelas pessoas envolvidas, sem referência a categorias convencionais. A anarquia relacional é discretamente comum na comunidade queer de Lisboa — a maioria das pessoas não lhe chama assim, mas a prática está muito espalhada.",
  "dating.structure.queerplatonic.label": "Queerplatónica",
  "dating.structure.queerplatonic.title": "Parceria profunda e não-romântica",
  "dating.structure.queerplatonic.text":
    "Uma relação próxima e de compromisso sem componente romântica ou sexual. Estas parcerias podem incluir coabitação, finanças partilhadas e o tipo de parceria que o casamento normalmente descreve — só sem o enquadramento romântico. Cada vez mais visível na comunidade.",
  "dating.structure.soloPolyamory.label": "Poliamor solo",
  "dating.structure.soloPolyamory.title": "A tua própria âncora",
  "dating.structure.soloPolyamory.text":
    'Várias ligações sem um par principal nem uma trajetória de "escalada" tradicional. Comum entre pessoas que se mudaram para Lisboa de forma independente e valorizam a sua autonomia. Funciona bem com o ritmo social da cidade — eventos e comunidade sem pressão de coabitação.',

  "dating.recognition.heading": "Reconhecimento <em>legal em Portugal</em>",
  "dating.recognition.sameSexMarriage.title":
    "Casamento entre pessoas do mesmo sexo",
  "dating.recognition.sameSexMarriage.text":
    "Reconhecimento legal total desde 2010. Os mesmos direitos do casamento entre pessoas de sexo diferente — herança, residência, decisões de saúde, adoção conjunta.",
  "dating.recognition.sameSexMarriage.status":
    "Reconhecimento total desde 2010",
  "dating.recognition.civilPartnership.title": "União de facto",
  "dating.recognition.civilPartnership.text":
    "Reconhecida após 2 anos de coabitação. Tem proteções legais significativas, incluindo herança, decisões de saúde e direitos de residência. Mais simples do que o casamento para constituir e desfazer.",
  "dating.recognition.civilPartnership.status": "Reconhecimento total",
  "dating.recognition.nonMonogamous.title": "Relações não-monógamas",
  "dating.recognition.nonMonogamous.text":
    "Sem reconhecimento legal para relações com vários parceiros. Existem soluções práticas (testamentos, procurações, acordos de coabitação) mas exigem planeamento legal deliberado.",
  "dating.recognition.nonMonogamous.status":
    "Sem reconhecimento automático — planeia com antecedência",
  "dating.recognition.legalCta": "Aconselhamento jurídico para relações →",

  "dating.social.heading": "Conhece pessoas <em>presencialmente.</em>",
  "dating.social.lead":
    "As aplicações estão bem. Mas a comunidade QueerPulse tende mesmo é a encontrar-se em eventos — convívios, jantares, convívios pensados especificamente para criar ligação. Menos transacional do que uma aplicação de namoro; mais honesto sobre aquilo que procuras.",
  "dating.social.upcomingEventsCta": "Ver próximos eventos",
  "dating.social.forumThreadCta": "Tópico social no fórum →",
  "dating.event.singlesDinner.name": "Jantar Queer para Solteires",
  "dating.event.singlesDinner.detail": "Mensal · Mouraria · 12–16 pessoas",
  "dating.event.singlesDinner.note":
    "Jantares organizados para pessoas solteiras da comunidade. Sem agenda, sem pressão — só uma boa refeição e a oportunidade de conhecer pessoas como deve ser.",
  "dating.event.enmPolySocial.name": "Convívio Não-Monogamia & Poliamor",
  "dating.event.enmPolySocial.detail": "Bimensal · Arroios · Contínuo",
  "dating.event.enmPolySocial.note":
    "Convívio da comunidade para pessoas não-monógamas. Principalmente social, e também um espaço para falar sobre como viver a não-monogamia ética em Lisboa.",
  "dating.event.newMembersSocial.name":
    "Convívio para Quem Entrou Recentemente",
  "dating.event.newMembersSocial.detail": "A cada 6 semanas · Local rotativo",
  "dating.event.newMembersSocial.note":
    "Especificamente para quem entrou na comunidade nos últimos 3 meses. A comunidade aparece sempre para este.",

  "dating.outro.title": "A ligação verdadeira <em>existe aqui.</em>",
  "dating.outro.sub":
    "É preciso um pouco de tempo e aparecer algumas vezes. A comunidade torna isso mais fácil.",
  "dating.outro.cta": "Ver o que está a acontecer →",

  // ── Family building hub (FamilyPage.tsx + sub-components) ─────────────────
  "family.hero.cat": "Construir Família · Portugal",
  "family.hero.title": "Constrói a tua família <em>à tua maneira.</em>",
  "family.hero.sub":
    "Informação prática e honesta sobre adoção, reprodução assistida, coparentalidade e parentalidade legal em Portugal — da comunidade, para a comunidade.",
  "family.hero.legalNote":
    "Informação da comunidade, não aconselhamento jurídico. As leis mudam — confirma sempre com um ou uma especialista.",

  "family.situations.heading": "De onde <em>estás a partir?</em>",
  "family.situations.lead":
    "Opcional — escolhe uma situação para destacar o que é mais relevante, ou explora tudo abaixo. Não precisas de decidir nada para poderes ler.",
  "family.situation.twoWomen.name": "Duas mulheres",
  "family.situation.twoWomen.desc":
    "FIV ou IIU com esperma de dador, parentalidade legal conjunta desde o nascimento.",
  "family.situation.twoWomen.to": "Ver: FIV e Reprodução Assistida →",
  "family.situation.twoMen.name": "Dois homens",
  "family.situation.twoMen.desc":
    "Adoção conjunta, acordos de coparentalidade ou opções de gestação de substituição.",
  "family.situation.twoMen.to": "Ver: Adoção e Coparentalidade →",
  "family.situation.singleWoman.name": "Mulher solteira",
  "family.situation.singleWoman.desc":
    "FIV ou IIU a solo disponível através do SNS e clínicas privadas.",
  "family.situation.singleWoman.to": "Ver: FIV e Reprodução Assistida →",
  "family.situation.singleMan.name": "Homem solteiro",
  "family.situation.singleMan.desc":
    "Adoção a solo ou coparentalidade. Gestação de substituição legalmente complexa.",
  "family.situation.singleMan.to": "Ver: Adoção →",
  "family.situation.transParent.name": "Pai ou mãe trans",
  "family.situation.transParent.desc":
    "Parentalidade legal, registo de nascimento e reprodução assistida para pessoas trans.",
  "family.situation.transParent.to": "Ver: Parentalidade Legal →",
  "family.situation.lookingForCoparent.name": "À procura de um coparente",
  "family.situation.lookingForCoparent.desc":
    "Coparentalidade feita através da comunidade, enquadramentos legais, guarda partilhada.",
  "family.situation.lookingForCoparent.to": "Ver: Coparentalidade →",
  "family.browseFreely.cta": "Só estou a explorar — mostra-me tudo",

  "family.tab.adoption.label": "Adoção",
  "family.tab.ivf.label": "FIV e Reprodução Assistida",
  "family.tab.coparenting.label": "Coparentalidade",
  "family.tab.donors.label": "Perguntas sobre Dadores",
  "family.tab.legal.label": "Parentalidade Legal",

  "family.tab.adoption.headTitle": "Adoção em <em>Portugal</em>",
  "family.tab.adoption.headText":
    "Os casais do mesmo sexo têm direitos de adoção plenos em Portugal desde outubro de 2016, incluindo adoção conjunta e adoção de enteados. O processo é longo mas percorrível — eis o que a comunidade já aprendeu.",
  "family.tab.adoption.card.law.eyebrow": "A lei",
  "family.tab.adoption.card.law.title": "Quem pode adotar",
  "family.tab.adoption.card.law.body":
    "Casais casados e em união de facto, de qualquer género, podem adotar em conjunto. Pessoas solteiras também podem adotar. Os casais do mesmo sexo são elegíveis desde a alteração de 2016. É exigida residência em Portugal; a nacionalidade não é obrigatória.",
  "family.tab.adoption.card.process.eyebrow": "O processo",
  "family.tab.adoption.card.process.title": "Como funciona",
  "family.tab.adoption.card.process.body":
    "Os pedidos são feitos através da SCML (Santa Casa da Misericórdia de Lisboa) ou do centro de Segurança Social da tua área. Vais ter entrevistas, um estudo ao domicílio e verificações de antecedentes. O processo é o mesmo para casais do mesmo sexo — ainda que as experiências variem.",
  "family.tab.adoption.card.process.note": "Prazo habitual: 12 a 36 meses",
  "family.tab.adoption.card.international.eyebrow": "Adoção internacional",
  "family.tab.adoption.card.international.title":
    "Adotar a partir do estrangeiro",
  "family.tab.adoption.card.international.body":
    "A adoção internacional é significativamente mais complexa e a maioria dos países que a permitem não estende a elegibilidade a casais do mesmo sexo. Há algumas exceções. Procura aconselhamento jurídico especializado antes de iniciares este caminho.",
  "family.tab.adoption.card.international.linkLabel":
    "Falar com um ou uma especialista jurídica →",
  "family.tab.adoption.card.stepchild.eyebrow": "Adoção de enteado",
  "family.tab.adoption.card.stepchild.title":
    "Adotar o filho ou filha do teu par",
  "family.tab.adoption.card.stepchild.body":
    "Se o teu par já tem um filho ou filha, podes adotar como segundo progenitor. Isto é normalmente mais rápido do que a adoção conjunta de uma criança sem relação familiar prévia. A parentalidade legal também já é possível desde o nascimento, sem adoção (ver separador Parentalidade Legal).",
  "family.tab.adoption.noteLabel": "Da comunidade:",
  "family.tab.adoption.reviewHead":
    "<em>Técnicos/as sociais e agências</em> avaliades pela comunidade",

  "family.tab.ivf.headTitle": "FIV e <em>Reprodução Assistida</em>",
  "family.tab.ivf.headText":
    "Portugal tem uma das leis de reprodução assistida mais progressistas da Europa. Desde 2016, a FIV e a IIU estão disponíveis para todas as mulheres — incluindo mulheres solteiras e casais de mulheres do mesmo sexo — através do SNS e de clínicas privadas.",
  "family.tab.ivf.card.public.eyebrow": "Público (SNS)",
  "family.tab.ivf.card.public.title": "O que o Estado cobre",
  "family.tab.ivf.card.public.body":
    "O SNS cobre reprodução assistida (FIV, IIU) para mulheres até aos 40 anos, incluindo casais de mulheres do mesmo sexo. O tratamento é fortemente subsidiado. As listas de espera podem ser longas — 12 a 24 meses em Lisboa. O Hospital de Santa Maria e a Maternidade Alfredo da Costa são os principais centros.",
  "family.tab.ivf.card.public.note":
    "Comparticipação média: 200–600 € por ciclo",
  "family.tab.ivf.card.private.eyebrow": "Clínicas privadas",
  "family.tab.ivf.card.private.title": "Optar pelo privado",
  "family.tab.ivf.card.private.body":
    "As clínicas privadas são significativamente mais rápidas e oferecem mais flexibilidade no tratamento. Os custos variam entre 3000 e 7000 € por ciclo de FIV, menos para IIU. Várias clínicas em Lisboa são conhecidas pela experiência com pacientes LGBTQ+ — recomendações da comunidade abaixo.",
  "family.tab.ivf.card.private.note": "IIU: 800–1500 € · FIV: 3000–7000 €",
  "family.tab.ivf.card.transMen.eyebrow": "Homens trans",
  "family.tab.ivf.card.transMen.title":
    "Se ainda não fizeste cirurgia reprodutiva",
  "family.tab.ivf.card.transMen.body":
    "Homens trans que ainda não fizeram cirurgias reprodutivas podem aceder à criopreservação de óvulos ou a FIV. As clínicas portuguesas variam em experiência — pergunta especificamente. O reconhecimento legal de género não afeta o acesso a tratamentos de fertilidade. Pessoas da comunidade documentaram as suas experiências no fórum.",
  "family.tab.ivf.card.transMen.linkLabel": "Recursos do Trans Hub →",
  "family.tab.ivf.card.surrogacy.eyebrow": "Gestação de substituição",
  "family.tab.ivf.card.surrogacy.title": "Um panorama complexo",
  "family.tab.ivf.card.surrogacy.body":
    "A gestação de substituição tem sido legalmente controversa em Portugal. Uma lei de 2016 permitiu-a em circunstâncias limitadas; partes foram depois declaradas inconstitucionais. A situação legal continua por resolver. Se for este o teu caminho, o aconselhamento jurídico especializado é essencial antes de avançares.",
  "family.tab.ivf.card.surrogacy.linkLabel": "Obter aconselhamento jurídico →",
  "family.tab.ivf.noteLabel": "Da comunidade:",
  "family.tab.ivf.reviewHead": "<em>Clínicas</em> recomendadas pela comunidade",

  "family.tab.coparenting.headTitle":
    "Coparentalidade — <em>juntes, de forma diferente</em>",
  "family.tab.coparenting.headText":
    "Coparentalidade significa criar uma criança com alguém com quem não tens uma relação romântica. Pode funcionar lindamente com acordos claros, comunicação honesta e enquadramentos legais que protejam todas as pessoas — incluindo a criança.",
  "family.tab.coparenting.card.whatItMeans.eyebrow": "O que significa",
  "family.tab.coparenting.card.whatItMeans.title":
    "Como funciona a coparentalidade",
  "family.tab.coparenting.card.whatItMeans.body":
    "Duas ou mais pessoas concordam em criar uma criança juntas sem serem casal. Os acordos variam imenso — desde uma casa principal única com visitas regulares, até à guarda totalmente partilhada 50/50. O que importa é que os acordos sejam claros, documentados e juridicamente sólidos antes de a criança nascer.",
  "family.tab.coparenting.card.findingCoparent.eyebrow":
    "Encontrar um coparente",
  "family.tab.coparenting.card.findingCoparent.title": "Dentro da comunidade",
  "family.tab.coparenting.card.findingCoparent.body":
    "A QueerPulse tem um mural de Ligações para Coparentalidade para quem quer encontrar um coparente dentro da comunidade. Não é um algoritmo de compatibilidade — é um mural de anúncios. Publica as tuas intenções, conhece pessoas com o tempo, tem conversas honestas antes de decidires seja o que for.",
  "family.tab.coparenting.card.findingCoparent.linkLabel":
    "Mural de Ligações para Coparentalidade →",
  "family.tab.coparenting.card.legalFrameworks.eyebrow":
    "Enquadramentos legais",
  "family.tab.coparenting.card.legalFrameworks.title":
    "Proteger todas as pessoas envolvidas",
  "family.tab.coparenting.card.legalFrameworks.body":
    "Em Portugal, ambos os progenitores podem ser registados legalmente à nascença se forem dadores conhecidos ou coparentes e tiverem um acordo legal prévio. Um acordo de coparentalidade é fortemente recomendado. Envolve um ou uma advogada de direito da família desde cedo.",
  "family.tab.coparenting.card.legalFrameworks.note":
    "Faz isto antes da conceção, não depois",
  "family.tab.coparenting.card.international.eyebrow":
    "Situações internacionais",
  "family.tab.coparenting.card.international.title":
    "Famílias transfronteiriças",
  "family.tab.coparenting.card.international.body":
    "Se os coparentes vivem em países diferentes, a parentalidade legal pode complicar-se. O reconhecimento de parentalidade na UE está a melhorar mas ainda não é uniforme. Isto exige aconselhamento jurídico especializado em direito da família transfronteiriço.",
  "family.tab.coparenting.card.international.linkLabel":
    "Apoio em direito da família internacional →",
  "family.tab.coparenting.noteLabel": "Da comunidade:",

  "family.tab.donors.headTitle": "<em>Perguntas</em> sobre dadores",
  "family.tab.donors.headText":
    "Quer estejas a pensar num dador conhecido ou anónimo, doação de esperma ou de óvulos — as implicações legais variam muito consoante a tua situação. Aqui fica um panorama claro.",
  "family.tab.donors.card.knownVsUnknown.eyebrow": "Conhecido vs. anónimo",
  "family.tab.donors.card.knownVsUnknown.title": "Uma escolha fundamental",
  "family.tab.donors.card.knownVsUnknown.body":
    "Um dador anónimo significa que a clínica trata de tudo; a parentalidade legal não recai sobre o dador. Um dador conhecido é legalmente mais complexo — pode ou não ter direitos parentais, consoante os acordos existentes antes da doação. É aqui que o aconselhamento jurídico é mais importante.",
  "family.tab.donors.card.spermDonation.eyebrow": "Doação de esperma",
  "family.tab.donors.card.spermDonation.title": "Opções em Portugal",
  "family.tab.donors.card.spermDonation.body":
    "A doação de esperma está disponível através de clínicas de fertilidade licenciadas (dadores anónimos de banco) ou através de dadores conhecidos com documentação legal. A inseminação caseira com um dador conhecido situa-se numa zona cinzenta legal — a reivindicação de parentalidade é incerta sem o envolvimento de uma clínica e acordos legais prévios.",
  "family.tab.donors.card.eggDonation.eyebrow": "Doação de óvulos",
  "family.tab.donors.card.eggDonation.title":
    "Para casais do mesmo sexo e homens solteiros",
  "family.tab.donors.card.eggDonation.body":
    "A doação de óvulos está disponível através de clínicas privadas licenciadas em Portugal. Os dadores são anónimos ao abrigo da lei portuguesa. Os tempos de espera para encontrar dadoras variam — 3 a 12 meses é o habitual. A mãe gestante (ou gestante de substituição) é a mãe legal, a menos que se estabeleça um caminho legal alternativo.",
  "family.tab.donors.card.legalParenthood.eyebrow": "Parentalidade legal",
  "family.tab.donors.card.legalParenthood.title": "Quem é o progenitor legal?",
  "family.tab.donors.card.legalParenthood.body":
    "No caso de dadores usados através de clínicas licenciadas, o dador não tem direitos parentais. No caso de dadores conhecidos, isto depende inteiramente de acordos escritos prévios e de a doação ter sido feita através de uma clínica. Um ou uma especialista em direito da família deve rever a tua situação antes de avançares.",
  "family.tab.donors.card.legalParenthood.linkLabel":
    "Obter aconselhamento jurídico →",
  "family.tab.donors.noteLabel": "Da comunidade:",

  "family.tab.legal.headTitle": "<em>Parentalidade</em> legal",
  "family.tab.legal.headText":
    "A lei portuguesa avançou significativamente nos últimos anos. Desde 2022, ambos os progenitores do mesmo sexo podem ser registados à nascença sem adoção, na maioria dos casos. Eis o que isso significa na prática — e onde ainda há lacunas.",
  "family.tab.legal.card.birthRegistration.eyebrow": "Registo de nascimento",
  "family.tab.legal.card.birthRegistration.title":
    "Ambos os progenitores na certidão",
  "family.tab.legal.card.birthRegistration.body":
    "Desde uma atualização legislativa de 2022, uma criança nascida de um casal do mesmo sexo (casado ou em união de facto) pode ter ambos os progenitores registados na certidão de nascimento sem necessitar de adoção do segundo progenitor. Isto aplica-se a crianças nascidas por reprodução assistida em clínicas licenciadas.",
  "family.tab.legal.card.birthRegistration.note":
    "Só para casais casados ou em união de facto",
  "family.tab.legal.card.unmarried.eyebrow": "Se não és casade",
  "family.tab.legal.card.unmarried.title": "Casais não casados",
  "family.tab.legal.card.unmarried.body":
    "Se não és casade nem estás em união de facto, o progenitor que não deu à luz não tem parentalidade legal automática. Vais precisar de adoção do segundo progenitor ou de um acordo legal estabelecido antes do nascimento. Isto também é relevante para coparentes e situações de dador conhecido.",
  "family.tab.legal.card.unmarried.linkLabel":
    "Informação sobre casamento e união de facto →",
  "family.tab.legal.card.transParents.eyebrow": "Progenitores trans",
  "family.tab.legal.card.transParents.title":
    "Reconhecimento de género e parentalidade",
  "family.tab.legal.card.transParents.body":
    "Um homem trans que dá à luz é legalmente o pai se o seu género legal já tiver sido alterado para masculino. Uma mulher trans cuja parceira leva a criança pode ser registada como mãe. A lei portuguesa já contempla estas situações, ainda que a prática administrativa varie — documenta tudo.",
  "family.tab.legal.card.transParents.linkLabel":
    "Recursos jurídicos do Trans Hub →",
  "family.tab.legal.card.secondParentAdoption.eyebrow":
    "Adoção do segundo progenitor",
  "family.tab.legal.card.secondParentAdoption.title":
    "Continua a ser um caminho válido",
  "family.tab.legal.card.secondParentAdoption.body":
    "A adoção do segundo progenitor continua disponível e é por vezes a opção mais clara — sobretudo para crianças nascidas antes das alterações de 2022, ou em situações internacionais complexas. Também se aplica a crianças nascidas noutros países cuja parentalidade Portugal possa não reconhecer automaticamente.",
  "family.tab.legal.step.legalStatus.title":
    "Estabelece o teu estatuto legal como casal",
  "family.tab.legal.step.legalStatus.text":
    "O casamento ou a união de facto são o caminho mais claro para a parentalidade conjunta automática à nascença. Isto pode ser feito rapidamente na conservatória.",
  "family.tab.legal.step.notifyClinic.title":
    "Avisa a clínica antes da conceção",
  "family.tab.legal.step.notifyClinic.text":
    "Garante que a clínica está a usar o enquadramento legal correto. Pede confirmação por escrito de como a parentalidade vai ser registada.",
  "family.tab.legal.step.notifyClinic.time": "No início do tratamento",
  "family.tab.legal.step.registerBirth.title":
    "Regista o nascimento com ambos os progenitores",
  "family.tab.legal.step.registerBirth.text":
    "No hospital ou na conservatória, no prazo de 20 dias. Leva a documentação do casamento ou da união de facto. Se houver complicações, um ou uma advogada pode acompanhar-te.",
  "family.tab.legal.step.registerBirth.time":
    "No prazo de 20 dias após o nascimento",
  "family.tab.legal.step.willGuardianship.title":
    "Considera um testamento e um documento de tutela",
  "family.tab.legal.step.willGuardianship.text":
    "Mesmo com parentalidade legal plena, vale a pena ter um testamento que especifique a tutela em caso de morte. Um ou uma advogada de família pode redigir isto em poucas horas.",

  "family.talk.heading": "Fala com quem já <em>passou por isto.</em>",
  "family.talk.body":
    "A Rede de Pais e Mães Queer liga quem está a construir família com pessoas da comunidade que já passaram por isto — os mesmos caminhos, situações semelhantes. Não são profissionais. São só pessoas que já o fizeram e querem ajudar.",
  "family.talk.findMentorCta": "Encontrar um mentor ou mentora",
  "family.talk.networkCta": "Rede de Pais e Mães Queer →",
  "family.talk.forumCta.heading":
    "Perguntas que esta página <em>não responde?</em>",
  "family.talk.forumCta.body":
    "O tópico do fórum sobre Construir Família é onde a comunidade partilha experiências atuais, faz perguntas e se apoia mutuamente ao longo de um processo que nenhum guia consegue captar por completo.",
  "family.talk.forumCta.openForumCta": "Abrir o tópico do fórum",
  "family.talk.forumCta.legalResourcesCta": "Recursos jurídicos →",

  "family.outro.title": "A tua família <em>é real.</em>",
  "family.outro.sub":
    "Seja qual for o caminho que escolheres, seja qual for a forma que tomar. A comunidade está aqui.",
  "family.outro.cta": "Junta-te à QueerPulse",

  // ── Queer Parent Network section (ParentNetwork.tsx) ──────────────────────
  "parentNetwork.eyebrow": "Rede de Pais e Mães Queer · Já és pai ou mãe?",
  "parentNetwork.heading":
    "Para as famílias <em>muitas vezes esquecidas</em> em espaços queer.",
  "parentNetwork.lead":
    "Pais e mães LGBTQ+, coparentes e pessoas a navegar a parentalidade — biológica, adotiva, escolhida e tudo o que está entre isso. Mais do que um fórum, é um acordo permanente entre famílias que se ajudam mutuamente, tanto no prático como no mais pesado.",
  "parentNetwork.stat.parents": "pais, mães e coparentes",
  "parentNetwork.stat.meetups": "convívios por mês",
  "parentNetwork.stat.kids": "crianças no grupo de brincadeiras",
  "parentNetwork.offer.healthcare.title": "Cuidados de saúde afirmativos",
  "parentNetwork.offer.healthcare.body":
    "Uma lista partilhada e verificada de pediatras e médicos de família que tratam duas mães, dois pais e qualquer família na ficha de admissão com a maior naturalidade.",
  "parentNetwork.offer.schools.title": "Escolas e burocracia",
  "parentNetwork.offer.schools.body":
    "Que escolas fazem bem feito, como lidar com formulários que presumem uma mãe e um pai, e pessoas da comunidade que já passaram pelas mesmas candidaturas.",
  "parentNetwork.offer.playdates.title": "Brincadeiras e apoio às crianças",
  "parentNetwork.offer.playdates.body":
    "Um grupo permanente de brincadeiras, troca de cuidados entre pessoas de confiança da comunidade, e convívios de fim de semana onde ninguém tem de explicar a própria família.",
  "parentNetwork.offer.vent.title": "Um lugar para desabafar",
  "parentNetwork.offer.vent.body":
    "Logística da coparentalidade, percursos de gestação de substituição e adoção, e as pequenas coisas do dia a dia — com pessoas que realmente entendem.",
  "parentNetwork.comingUp.heading": "Para <em>breve.</em>",
  "parentNetwork.comingUp.lead":
    "A maioria dos meses traz uma manhã de brincadeiras e uma noite para os adultos. Crianças bem-vindas, salvo aviso em contrário.",
  "parentNetwork.tag.playdate": "Brincadeiras",
  "parentNetwork.tag.social": "Convívio",
  "parentNetwork.tag.workshop": "Workshop",
  "parentNetwork.resource.legalRights": "Direitos legais como família queer",
  "parentNetwork.resource.chosenFamily":
    "Família escolhida e reconhecimento legal",
  "parentNetwork.resource.healthcareGuides": "Guias de saúde e documentação",

  // ── Reading Groups page (ReadingGroupsPage.tsx + sub-components) ──────────
  "readingGroups.hero.eye": "Comunidade · Leitura",
  "readingGroups.hero.titleLine1": "Ler juntes.",
  "readingGroups.hero.titleLine2": "<em>Confiar mais depressa.</em>",
  "readingGroups.hero.sub":
    "Grupos pequenos, um livro, um mês. Sem ansiedade de trabalhos de casa, sem gatekeeping. A melhor forma de encontrar a tua gente numa cidade nova é discutir um livro com elas.",
  "readingGroups.why.curated.title": "Livros com curadoria queer",
  "readingGroups.why.curated.desc":
    "Cada grupo escolhe a sua própria leitura. Não te dizemos o que importa.",
  "readingGroups.why.small.title": "Pequeno por opção",
  "readingGroups.why.small.desc":
    "Os grupos têm um limite de 6 a 8 pessoas. Conversas a sério, não palestras.",
  "readingGroups.why.mixed.title": "Formatos mistos",
  "readingGroups.why.mixed.desc":
    "Presenciais em cafés e casas. Online para quem está fora de Lisboa ou tem necessidades de acessibilidade.",
  "readingGroups.filterBar.genreLabel": "Género",
  "readingGroups.filterBar.formatLabel": "Formato",
  "readingGroups.filterBar.count_one": "{count} grupo",
  "readingGroups.filterBar.count_other": "{count} grupos",
  "readingGroups.genre.all": "Todos",
  "readingGroups.genre.fiction": "Ficção",
  "readingGroups.genre.nonfiction": "Não-ficção",
  "readingGroups.genre.theory": "Teoria",
  "readingGroups.genre.poetry": "Poesia",
  "readingGroups.genre.memoir": "Memórias",
  "readingGroups.format.filter.any": "Qualquer",
  "readingGroups.format.filter.irl": "Presencial",
  "readingGroups.format.filter.online": "Online",
  "readingGroups.card.formatPrefix.irl": "Presencial · ",
  "readingGroups.card.formatPrefix.online": "Online · ",
  "readingGroups.empty.title": "Nenhum grupo corresponde a estes filtros",
  "readingGroups.empty.description":
    "Ainda não há nada que corresponda a esta combinação de género e formato — tenta alargar os filtros, ou cria um grupo à volta do livro que queres ler.",
  "readingGroups.empty.clearFiltersCta": "Limpar filtros",
  "readingGroups.outro.title": "Os livros constroem <em>comunidade.</em>",
  "readingGroups.outro.sub":
    "Os grupos de leitura da QueerPulse existem desde 2024. Alguns tornaram-se amizades, outros colaborações, dois tornaram-se bandas.",
  "readingGroups.outro.cta": "Junta-te à rede",
  "readingGroups.joinedWaitlistToast":
    "Estás em #{position} na lista de espera para {name}",

  "readingGroups.card.spots.full": "Completo",
  "readingGroups.card.spots.left_one": "Resta {count} vaga",
  "readingGroups.card.spots.left_other": "Restam {count} vagas",
  "readingGroups.card.joinWaitlistCta": "Entrar na lista de espera",
  "readingGroups.card.requestToJoinCta": "Pedir para entrar",
  "readingGroups.card.onWaitlist": "Em lista de espera · #{position}",

  "readingGroups.waitlist.heading": "Estás na <em>lista de espera.</em>",
  "readingGroups.waitlist.sub":
    "Enviamos-te um email assim que alguém desistir — não precisas de estar sempre a verificar.",
  "readingGroups.waitlist.position": "Estás em #{position}",

  "readingGroups.listGroup.heading": "Cria o <em>teu próprio grupo.</em>",
  "readingGroups.listGroup.lead":
    "Escolhe um livro. Diz quantas pessoas queres. Diz onde e quando. Nós publicamos aqui e ligamos-te a pessoas da comunidade que querem ler a mesma coisa.",
  "readingGroups.listGroup.bookLabel": "Título do livro e autor/a",
  "readingGroups.listGroup.bookPlaceholder":
    "ex.: O Quarto de Giovanni — James Baldwin",
  "readingGroups.listGroup.whyLabel": "Porquê este livro?",
  "readingGroups.listGroup.whyPlaceholder":
    "Uma frase — o que te fez escolhê-lo?",
  "readingGroups.listGroup.formatLabel": "Formato",
  "readingGroups.listGroup.formatOption.inPerson": "Presencial",
  "readingGroups.listGroup.formatOption.online": "Online",
  "readingGroups.listGroup.formatOption.either": "Tanto faz",
  "readingGroups.listGroup.maxLabel": "Máximo de pessoas",
  "readingGroups.listGroup.submitCta": "Publicar o meu grupo",
  "readingGroups.listGroup.submitPending": "A publicar…",
  "readingGroups.listGroup.successToast":
    "Grupo publicado — vamos encontrar os teus leitores",
  "readingGroups.listGroup.errorToast":
    "Não foi possível publicar o teu grupo — tenta novamente.",
  "readingGroups.listGroup.successHeading":
    "O teu grupo está <em>publicado.</em>",
  "readingGroups.listGroup.successBody":
    "<strong>{book}</strong> já está visível no topo do diretório. Vamos começar a ligar-te a pessoas que querem ler a mesma coisa.",
  "readingGroups.listGroup.newGroupDesc":
    "Um grupo de leitura novo, acabado de publicar. As pessoas vão ser associadas em breve.",
  "readingGroups.listGroup.listAnotherCta": "Publicar outro grupo",
  "readingGroups.listGroup.defaultName": "O teu novo grupo",
  "readingGroups.listGroup.defaultAuthor": "Tu",
  "readingGroups.listGroup.defaultWhereOnline": "Online",
  "readingGroups.listGroup.defaultWhereIrl": "Lisboa (a confirmar)",
  "readingGroups.listGroup.defaultFrequency": "Mensal",
  "readingGroups.listGroup.defaultLang": "EN / PT",
};
