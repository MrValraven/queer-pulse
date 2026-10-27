import type { Catalog } from "../../types";

/**
 * The audience landing page for practitioners (`/for/practitioners`): its meta, hero, sections,
 * sample content and questions.
 */
export const forPractitioners: Catalog = {
  "meta.title": "QueerPulse para profissionais",
  "meta.description":
    "Uma página calma e de confiança para a tua prática, para que as pessoas com quem queres trabalhar te encontrem e saibam o que esperar.",
  "cta.createPersona": "Criar uma persona",

  // Hero
  "hero.eyebrow": "Para profissionais",
  "hero.title": "Uma página calma para <em>a tua prática</em>",
  "hero.lede":
    "Mostra o teu trabalho, diz com quem trabalhas e quando estás livre, para que as pessoas saibam o que esperar antes de te escreverem.",
  "hero.frame.flash": "As flashes de exemplo de uma pessoa que tatua",
  "hero.frame.topics":
    "Os temas de exemplo de quem faz terapia e com quem trabalha",
  "hero.frame.chair":
    "A faixa de preço e marcações de exemplo de quem corta cabelo",

  // Where it all lives today
  "scatter.title": "A tua prática, aos bocados",
  "scatter.lede":
    "Um feed para o trabalho, uma publicação fixada para os preços e mensagens para tudo o resto. As pessoas juntam as peças antes de ganharem coragem para escrever.",
  "scatter.feed":
    "O teu portefólio vive num feed social, no meio de tudo o resto",
  "scatter.prices":
    "Os preços estão numa publicação fixada, ou numa resposta que voltas a escrever",
  "scatter.questions":
    "As mesmas primeiras perguntas chegam por mensagem todas as semanas",
  "scatter.calendar":
    "Saber se estás a aceitar marcações depende de uma story que desaparece num dia",

  // How it works here
  "walkthrough.title": "Como funciona uma página de prática",
  "walkthrough.lede":
    "Cinco coisas que a página faz por ti, cada uma mostrada com o bloco real que a faz.",
  "walkthrough.shape.title": "Uma página com a forma da tua prática",
  "walkthrough.shape.body":
    "Escolhe o teu ofício quando crias uma persona e a página ganha a sua forma: um estúdio de tatuagem, o consultório de quem faz terapia, a cadeira de quem corta cabelo ou o estúdio de quem fotografa.",
  "walkthrough.shape.tattoo_artist":
    "Flashes, trabalhos cicatrizados, preços e como marcar",
  "walkthrough.shape.therapist":
    "Temas, a primeira sessão, valores e disponibilidade",
  "walkthrough.shape.hair_stylist":
    "Serviços, looks, o teu preço e as horas calmas",
  "walkthrough.shape.photographer":
    "Séries, exposições e uma lista numerada de obras",
  "walkthrough.work.title": "Mostra o teu trabalho",
  "walkthrough.work.body":
    "Flashes e fotos cicatrizadas para quem tatua, séries para quem fotografa, looks para quem corta cabelo. As fotos de trabalhos cicatrizados e de cicatrizes podem ficar desfocadas até quem visita escolher vê-las.",
  "walkthrough.work.frame": "As séries de exemplo de quem fotografa",
  "walkthrough.how.title": "Diz com quem trabalhas e como",
  "walkthrough.how.body":
    "Quem faz terapia indica os temas com que trabalha, para quem a porta está aberta e o que acontece numa primeira sessão, passo a passo.",
  "walkthrough.how.frame": "A primeira sessão de exemplo de quem faz terapia",
  "walkthrough.when.title": "Diz quando estás livre",
  "walkthrough.when.body":
    "Quem tatua põe a agenda aberta, em lista de espera ou fechada, com a data em que volta a abrir. Quem faz terapia mostra quanto tempo falta para uma primeira sessão, o horário e as vagas que tem livres.",
  "walkthrough.when.frame":
    "Disponibilidade de exemplo: os estados da agenda de tatuagem e o horário de quem faz terapia",
  "walkthrough.found.title": "Deixa que as pessoas te encontrem",
  "walkthrough.found.body":
    "Quem tem sessão iniciada percorre as páginas abertas no diretório de personas por ofício, procura-as por nome e segue as que quiser. As páginas de terapia abertas aparecem também na lista de terapeutas do guia de saúde mental.",
  "walkthrough.found.search": "Pesquisar personas ou responsáveis",

  // Try it
  "tryIt.title": "Muda a prática, vê a página mudar",
  "tryIt.lede":
    "Escolhe uma prática. O mesmo tipo de página ganha a forma desse ofício, com os seus blocos reais e conteúdo de exemplo.",
  "tryIt.switchLabel": "Prática",
  "tryIt.frameLabel": "Uma página de exemplo para esta prática: {kind}",
  "tryIt.caption.tattoo_artist":
    "Uma página de tatuagem: o estado da agenda, flashes com tamanhos e preços, trabalhos cicatrizados, como marcar e o que ajuda as pessoas a sentirem-se à vontade.",
  "tryIt.caption.therapist":
    "Uma página de consultório: como trabalha, os temas com que trabalha, a primeira sessão, valores e disponibilidade.",
  "tryIt.caption.hair_stylist":
    "Uma cadeira: serviços e looks, a faixa de preço e entradas sem marcação e a lista para ler antes de te sentares.",
  "tryIt.caption.photographer":
    "Um estúdio: uma série em destaque, todas as séries em mosaico, as próximas exposições e uma lista numerada de obras.",

  // All in one place
  "allInOne.title": "Uma página calma para tudo isto",
  "allInOne.before.feed": "Um portefólio num feed social",
  "allInOne.before.pinned": "Preços numa publicação fixada",
  "allInOne.before.dms": "Perguntas sobre marcações espalhadas por mensagens",
  "allInOne.before.repeat": "As mesmas respostas escritas vezes sem conta",
  "allInOne.after.page": "Uma página com a forma da tua prática",
  "allInOne.after.work": "O teu trabalho arrumado para ser visto",
  "allInOne.after.status":
    "Se estás a receber pessoas novas, em palavras simples",
  "allInOne.after.messages": "Mensagens para a tua página na QueerPulse",

  // Safe by design
  "safety.title": "Decides quem vê o quê",
  "safety.lede":
    "A tua página mostra o que escolhes lá pôr, às pessoas que escolhes. Para quem faz terapia, a página é clara quanto aos números de cédula profissional.",
  "safety.visibility.title": "Escolhe quem a pode ver",
  "safety.visibility.body":
    "Uma página autónoma e aberta pode ser lida por qualquer pessoa com o link, com ou sem sessão iniciada, e pode aparecer nos motores de busca. Uma página ligada só é vista por quem tem sessão iniciada. Também a podes guardar só para a tua rede, ou só para ti enquanto lhe dás forma.",
  "safety.standalone.title": "Mantém-na à parte do teu perfil",
  "safety.standalone.body":
    "Uma página autónoma tem o seu próprio identificador e nada nela aponta para o teu perfil principal. Liga-a só quando quiseres que as pessoas vejam que as duas são tu.",
  "safety.messages.title": "As pessoas chegam-te primeiro por aqui",
  "safety.messages.body":
    "As pessoas enviam mensagens à tua página na QueerPulse. O teu email e o teu site só aparecem se os acrescentares.",
  "safety.registration.title": "Números de cédula, ditos com clareza",
  "safety.registration.body":
    "Se quem faz terapia acrescentar um número de cédula profissional, a página marca-o como autodeclarado e diz que a QueerPulse não verifica estes números, para que as pessoas o possam confirmar junto da entidade que o emitiu.",

  // Questions
  "faq.whoSees.question": "Quem pode ver a minha página?",
  "faq.whoSees.answer":
    "Escolhes tu. Numa página autónoma, <b>Aberto a todas as pessoas</b> quer dizer que qualquer pessoa com o link a pode ler, com ou sem sessão iniciada, e que pode aparecer nos motores de busca. Uma página ligada só é vista por quem tem sessão iniciada. Também podes escolher <b>a tua rede</b>, ou <b>só tu</b> enquanto lhe dás forma.",
  "faq.pause.question": "Posso pausar novas marcações ou novos clientes?",
  "faq.pause.answer":
    "Sim. Uma página de tatuagem mostra <b>Agenda aberta</b>, <b>Lista de espera</b> ou <b>Agenda fechada</b>, com a data em que a agenda volta a abrir. Uma página de terapia mostra <b>A aceitar novos clientes</b>, <b>Lista de espera</b> ou <b>Sem vagas para novos clientes</b>. Todas as outras páginas podem dizer <b>A aceitar marcações</b> ou <b>Sem disponibilidade agora</b>.",
  "faq.separate.question": "Posso mantê-la separada do meu perfil pessoal?",
  "faq.separate.answer":
    "Sim. Escolhe <b>Autónomo</b> e nada nela aponta para o teu perfil principal, e escolhes o seu identificador público. Escolhe <b>Ligado</b> e aparece no teu perfil como mais uma persona tua, vista só por quem tem sessão iniciada.",

  // Closing
  "closing.title": "Dá à tua prática uma página calma",
  "closing.body":
    "Mostra o teu trabalho, diz com quem trabalhas e avisa as pessoas de quando estás livre.",

  // Sample tattoo artist (Linha Lenta)
  "sample.tattoo.tagline":
    "Botânica em traço fino, tatuada com calma num estúdio privado",
  "sample.tattoo.bio":
    "plantinhas e traças e uma ou outra chávena, tatuadas devagar com as pausas que quiseres e podes trazer alguém para te dar a mão",
  "sample.tattoo.replyTime": "numa semana",
  "sample.tattoo.doesNotDo": "mãos e cara",
  "sample.tattoo.depositNote":
    "conta para o preço final e passa contigo para outra data se me avisares uma semana antes",
  "sample.tattoo.cancellation":
    "avisa-me uma semana antes e mudamos a data juntes",
  "sample.tattoo.comfortNote":
    "diz-me o que te ajuda e eu faço e não precisas de explicar",
  "sample.tattoo.city": "Lisboa",
  "sample.tattoo.flash.violets": "Violetas prensadas",
  "sample.tattoo.flash.circle": "Círculo partido",
  "sample.tattoo.flash.candle": "Vela e fumo",
  "sample.tattoo.placement.violets": "antebraço",
  "sample.tattoo.placement.circle": "coxa",
  "sample.tattoo.placement.candle": "barriga da perna",
  "sample.tattoo.placement.sleeve": "antebraço e mão",
  "sample.tattoo.healed.sleeve": "Manga cicatrizada, um ano depois",
  "sample.tattoo.healedFor": "1 ano",

  // Sample therapist (Joana Ferraz): no credentials, no outcome words
  "sample.therapist.tagline":
    "Terapia pela conversa para pessoas queer adultas e casais, em português e inglês",
  "sample.therapist.bio":
    "Trabalho com pessoas queer e casais nas coisas que vêm com sermos quem somos, sair do armário e a família e o amor nas suas muitas formas e mudar de país e recomeçar",
  "sample.therapist.title": "Psicoterapeuta",
  "sample.therapist.quote": "Tu marcas o ritmo e *começamos* onde estiveres",
  "sample.therapist.where": "Arroios, Lisboa · e online",
  "sample.therapist.approach":
    "Conversamos e eu ouço com atenção e juntes percebemos o que queres do nosso tempo, e não precisas de ter nada resolvido antes de chegares",
  "sample.therapist.step.hello.title": "Dizemos olá",
  "sample.therapist.step.hello.body":
    "Uma conversa curta sobre o que te traz e o que esperas",
  "sample.therapist.step.listen.title": "Tu falas, eu ouço",
  "sample.therapist.step.listen.body":
    "Partilhas o tanto ou o pouco que te parecer bem",
  "sample.therapist.step.decide.title": "Decidimos juntes",
  "sample.therapist.step.decide.body":
    "Se fizer sentido escolhemos um ritmo, e se não fizer posso sugerir outra pessoa",
  "sample.therapist.firstContact":
    "A primeira chamada de 15 minutos é gratuita",
  "sample.therapist.receipts": "Um recibo por cada sessão",
  "sample.therapist.sessionLength": "50 minutos",
  "sample.therapist.headline": "Cerca de 2 semanas",
  "sample.therapist.hours.weekdays": "Fins de tarde à semana",
  "sample.therapist.hours.weekdaysTime": "18:00 às 21:00",
  "sample.therapist.hours.saturday": "Manhãs de sábado",
  "sample.therapist.hours.saturdayTime": "10:00 às 13:00",
  "sample.therapist.slot.tuesday": "Terça 18:00",
  "sample.therapist.slot.thursday": "Quinta 19:30",
  "sample.therapist.venueArea": "Arroios, Lisboa",
  "sample.therapist.access.stepFree": "Entrada sem degraus",
  "sample.therapist.access.toilet": "Casa de banho para todos os géneros",
  "sample.therapist.topic.identity.heading": "Identidade e sair do armário",
  "sample.therapist.topic.identity.bullets":
    "Sair do armário em qualquer idade\nGénero e transição\nQuestionar, sem precisar de um rótulo",
  "sample.therapist.topic.relationships.heading": "Relações e família",
  "sample.therapist.topic.relationships.bullets":
    "Relações abertas e não monogâmicas\nFamília escolhida\nA família depois de sair do armário",
  "sample.therapist.topic.everyday.heading": "Trabalho e dia a dia",
  "sample.therapist.topic.everyday.bullets":
    "Ser assumide no trabalho\nMudar para outro país\nGrandes mudanças e decisões",

  // Sample hair stylist (Rafa Maré)
  "sample.chair.tagline":
    "Cortes e cor para todos os géneros, numa cadeira calma e sem pressa",
  "sample.chair.bio":
    "curto ou comprido ou algures no meio, diz-me como te queres sentir ao sair e chegamos lá juntes",
  "sample.chair.rate": "Cortes desde {amount}",
  "sample.chair.walkins": "Sábados a partir das 10:00",
  "sample.chair.where": "No primeiro andar de um pequeno salão, Lisboa",
  "sample.chair.quiet":
    "Manhãs de terça, música baixa e sem conversa de circunstância",
  "sample.chair.before.photo":
    "Traz uma foto do que adoras e do que preferes evitar",
  "sample.chair.before.name":
    "Diz-me o nome e os pronomes que queres na marcação",
  "sample.chair.before.hair": "Vem com o cabelo limpo e seco para um corte",
  "sample.chair.service.cut.title": "Corte e acabamento",
  "sample.chair.service.cut.time": "45 minutos",
  "sample.chair.service.cut.body":
    "Qualquer comprimento e qualquer género, com lavagem e acabamento",
  "sample.chair.service.colour.title": "Cor",
  "sample.chair.service.colour.time": "2 a 3 horas",
  "sample.chair.service.colour.body":
    "Descoloração, um gloss ou uma mudança completa, com teste de madeixa primeiro",
  "sample.chair.service.first.title": "Um corte para recomeçar",
  "sample.chair.service.first.time": "O tempo que precisares",
  "sample.chair.service.first.body":
    "Para uma grande mudança, com tempo para falarmos antes de a tesoura entrar",
  "sample.chair.look.sage": "Curto verde-salva",
  "sample.chair.look.shortBack": "Curto atrás, comprido em cima",

  // Sample photographer (Luz Parada)
  "sample.studio.tagline": "Retratos para quem detesta ser fotografade",
  "sample.studio.bio":
    "retratos lentos em película, quase sempre na tua casa com a luz que já lá tens, e vês todas as fotos antes de alguma ser partilhada",
  "sample.studio.series.hands.title": "Mãos",
  "sample.studio.series.hands.body": "As mãos de quem faz coisas",
  "sample.studio.series.morning.title": "Manhãs",
  "sample.studio.series.morning.body": "Retratos à primeira luz, em casa",
  "sample.studio.series.still.title": "Roupa de domingo",
  "sample.studio.series.still.body":
    "Pessoas com a roupa em que mais se sentem elas mesmas",
  "sample.studio.series.prints.title": "Folhas de contacto",
  "sample.studio.series.prints.body": "Todas as fotos, antes da edição",
  "sample.studio.exhibition.title": "Perto de casa",
  "sample.studio.exhibition.subtitle": "Exposição coletiva",
};
