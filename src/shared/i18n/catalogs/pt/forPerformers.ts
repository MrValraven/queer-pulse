import type { Catalog } from "../../types";

/**
 * The audience landing page for performers and creators (`/for/performers`): its meta, hero, sections,
 * sample content and questions.
 */
export const forPerformers: Catalog = {
  "meta.title": "QueerPulse para artistas",
  "meta.description":
    "Uma página que funciona como o teu próprio site: quem és, a tua próxima atuação e como te contratar, num só endereço.",

  // Hero
  "hero.eyebrow": "Para artistas e criadores",
  "hero.title": "O teu próprio site, <em>sem teres de o construir</em>",
  "hero.lede":
    "Drag, sets de DJ, comédia, dança e tudo o que houver pelo meio. Põe quem és, a tua próxima atuação e como te contratar numa só página, no teu próprio endereço.",
  "hero.personaFrameLabel":
    "Página de persona de exemplo de uma artista drag, com a próxima atuação e os dados para contratação",
  "hero.lineupFrameLabel":
    "Lineup de evento de exemplo, com cada artista pelo nome e pela arte",
  "hero.lineupTitle": "Lineup",
  "hero.lineupNote":
    "Quem organiza junta-te ao lineup, com a tua arte ao lado do teu nome.",
  "memberAction.createPersona": "Criar uma persona",

  // Where it all lives today
  "scatter.title": "Neste momento, a tua carreira vive num link na bio",
  "scatter.lede":
    "Nunca quiseste construir um site, por isso ficou tudo espalhado, e quem te quer contratar tem de juntar as peças.",
  "scatter.linkInBio": "Uma página de links na bio a segurar tudo",
  "scatter.stories":
    "A tua próxima atuação numa story que amanhã já não está lá",
  "scatter.messages":
    "Pedidos de contratação por DM, email e grupos de conversa",
  "scatter.rider": "O teu rider e as fotos de imprensa numa pasta algures",
  "scatter.pastGigs": "Atuações passadas que só existem em publicações antigas",
  "scatter.website": "O site que andas sempre a pensar fazer",

  // How it works here
  "walkthrough.title": "Uma página que cresce com o teu número",
  "walkthrough.lede":
    "Cinco coisas que o QueerPulse faz pelo teu número, cada uma com a parte que a faz.",
  "walkthrough.persona.title": "Uma persona só tua",
  "walkthrough.persona.body":
    "Uma persona é uma página para o teu número, à parte do teu perfil pessoal. Liga as duas se não te importas que saibam que és tu, ou deixa-a autónoma.",
  "walkthrough.persona.linkedBody":
    "Aparece no teu perfil como outro lado de ti.",
  "walkthrough.persona.standaloneBody":
    "Nada nela aponta para o teu perfil, e és tu que escolhes o identificador.",
  "walkthrough.skin.title": "Um visual à medida da tua arte",
  "walkthrough.skin.body":
    "Escolhe a tua arte e a página veste-se a condizer. Drag, DJs, comédia, dança e as outras artes de palco aqui listadas partilham o visual Palco: um palco escuro, letras grandes e um letreiro para a tua próxima atuação.",
  "walkthrough.skin.listLabel": "Artes com o visual Palco",
  "walkthrough.skin.moreCount": "+{count} mais",
  "walkthrough.gigs.title": "Atuações, looks, sets e espetáculos",
  "walkthrough.gigs.body":
    "Cada atuação que juntas mostra a data, a hora de abertura de portas e o link para bilhetes, e a mais próxima abre a tua página num letreiro com a sala. Quando a data passa, a atuação passa para Já realizados. Os looks e os sets têm as suas próprias secções.",
  "walkthrough.gigs.frameLabel":
    "Espetáculos e looks de exemplo na página de persona de uma artista drag",
  "walkthrough.lineup.title": "No cartaz quando quem organiza te convida",
  "walkthrough.lineup.body":
    "Quem organiza um evento convida-te para o lineup, já com a tua arte. Aceitas ou recusas, e quando entras, a página do evento mostra-te com a tua arte ao lado do teu nome.",
  "walkthrough.lineup.frameLabel":
    "Convite de exemplo para o lineup de um evento, com Entrar no lineup e Recusar",
  "walkthrough.address.title":
    "O teu próprio endereço, com todos os teus links",
  "walkthrough.address.body":
    "Cada persona vive no seu próprio endereço /p/, o único link que pões na bio. Junta até 20 links de redes sociais e ficam no topo da tua página.",
  "walkthrough.address.frameLabel":
    "Endereço de persona de exemplo com os seus links de redes sociais",
  "walkthrough.address.studio":
    "Fazes música ou sets? O QueerPulse Studio é o nosso espaço para os lançares, ligado à tua persona. A nossa equipa abre-o às pessoas da comunidade aos poucos.",
  "walkthrough.address.studioLink": "Abrir o QueerPulse Studio",

  // Try it
  "tryIt.title": "Muda a arte e vê a página mudar",
  "tryIt.lede":
    "O mesmo nome artístico, o mesmo endereço. Escolhe uma arte e a página de persona de exemplo redesenha-se com o tipo, a frase de apresentação e as secções dessa arte.",
  "tryIt.switchLabel": "Arte da persona",
  "tryIt.frameLabel": "Página de persona de exemplo, {kind}",
  "tryIt.sectionsTitle": "Secções nesta página",
  "tryIt.staysTitle": "O que fica igual",
  "tryIt.staysBody":
    "O nome artístico, a foto, o endereço /p/ e a próxima atuação no topo da página.",

  // All in one place
  "allInOne.title": "Tudo o que quem contrata precisa, num só endereço",
  "allInOne.lede":
    "As peças com que hoje fazes malabarismo, juntas numa página que és tu a gerir.",
  "allInOne.before.linkInBio": "Uma página de links na bio",
  "allInOne.before.stories": "Stories que desaparecem num dia",
  "allInOne.before.inboxes":
    "Pedidos de contratação em todas as caixas de entrada",
  "allInOne.before.folder": "Uma pasta partilhada para o teu rider",
  "allInOne.after.page": "Uma página de persona no seu próprio endereço /p/",
  "allInOne.after.nextUp": "A tua próxima atuação a abrir a página",
  "allInOne.after.booker": "Cachê, rider, imprensa e contacto num só bloco",
  "allInOne.after.work":
    "Looks, sets, números e espetáculos nas suas próprias secções",
  "allInOne.after.links": "Até 20 links de redes sociais",

  // Safe by design
  "safety.title": "Decides quem a vê e quem a gere",
  "safety.lede":
    "A tua página de persona tem as suas próprias definições, à parte do teu perfil pessoal.",
  "safety.visibility.title": "Escolhe quem a pode ver",
  "safety.visibility.body":
    "Uma página autónoma e aberta pode ser lida por qualquer pessoa com o link, com ou sem sessão iniciada, e pode aparecer nos motores de busca. Uma página ligada só é vista por quem tem sessão iniciada. Também a podes guardar só para a tua rede, ou só para ti enquanto lhe dás forma.",
  "safety.standalone.title": "Ligada ou autónoma",
  "safety.standalone.body":
    "Mostra-a no teu perfil, ou deixa-a autónoma para que nada nela aponte para ti.",
  "safety.coOwners.title": "Gere-a com a tua agência ou com quem trabalhas",
  "safety.coOwners.body":
    "Convida uma pessoa das tuas ligações para co-gerir. Quando aceitar, pode editar e publicar a página contigo.",

  // Questions
  "faq.whoSees.question": "Quem pode ver a minha página de persona?",
  "faq.whoSees.answer":
    "Escolhes tu. Numa página autónoma, <b>Aberto a todas as pessoas</b> quer dizer que qualquer pessoa com o link a pode ler, com ou sem sessão iniciada, e que pode aparecer nos motores de busca. Uma página ligada só é vista por quem tem sessão iniciada. Também podes escolher <b>a tua rede</b>, ou <b>só tu</b> enquanto lhe dás forma.",
  "faq.separate.question": "Posso mantê-la à parte do meu perfil pessoal?",
  "faq.separate.answer":
    "Sim. Escolhe <b>Autónomo</b> e nada na página aponta para o teu perfil principal, e és tu que escolhes o identificador público. Uma pessoa que convides para co-gerir vê a conta por trás quando aceitar, e o convite avisa-te disso antes de ser enviado.",
  "faq.coOwner.question":
    "A minha agência ou quem trabalha comigo pode gerir a página?",
  "faq.coOwner.answer":
    "Sim. Convida essa pessoa para <b>co-gerir</b> a partir das tuas ligações. Quando aceitar, pode editar a página e publicá-la contigo. Só tu, que a criaste, podes mudar o endereço, restringir quem a vê, ligá-la ao teu perfil, despublicá-la ou apagá-la.",

  // Closing
  "closing.title": "Dá ao teu número <em>uma página só dele</em>",
  "closing.body":
    "Cria a tua página de persona uma vez e depois manda toda a gente para um só endereço.",

  // Sample persona (made up for this page)
  "sample.cta": "Contratar Juno",
  "sample.booker.fee": "A partir de 250",
  "sample.booker.press": "Fotos de imprensa e uma bio curta a pedido",
  "sample.drag.tagline": "Lip sync, voz ao vivo e lantejoulas a mais",
  "sample.drag.bio":
    "Juno sobe a palcos tardios com números sobre santos, marinheiros e o grupo da família. Contratações para clubes, marchas e festas privadas.",
  "sample.drag.nextSubtitle": "Lip sync e uma canção ao vivo",
  "sample.drag.pastSubtitle": "Brunch drag mensal",
  "sample.drag.rider":
    "Um espelho, uma ventoinha e dez minutos para mudar entre números",
  "sample.dj.tagline": "Edits de disco e warm-ups que acabam tarde",
  "sample.dj.bio":
    "Juno passa disco, house e um ou outro edit pop, do primeiro disco do warm-up à última chamada. Contratações para clubes, marchas e after-parties.",
  "sample.dj.nextSubtitle": "Set de fecho",
  "sample.dj.pastSubtitle": "Set de abertura",
  "sample.dj.rider": "Dois decks, uma mesa de mistura e um monitor de cabine",
  "sample.dj.mixSubtitle": "Gravado ao vivo",
  "sample.comedian.tagline": "Stand-up sobre família, fé e o grupo da família",
  "sample.comedian.bio":
    "Juno faz stand-up sobre crescer queer numa família muito católica. Contratações para noites de comédia, marchas e festivais.",
  "sample.comedian.nextSubtitle": "Vinte minutos de material novo",
  "sample.comedian.pastSubtitle": "Set principal",
  "sample.comedian.rider": "Um microfone num tripé, um banco e um copo de água",
  "sample.comedian.setSubtitle": "Vinte minutos certeiros para noites de clube",
  "sample.dancer.tagline": "Dança contemporânea com coração de ballroom",
  "sample.dancer.bio":
    "Juno cria solos e duetos que andam entre a dança contemporânea e o ballroom. Contratações para palcos, festivais e videoclipes.",
  "sample.dancer.nextSubtitle": "Um solo novo",
  "sample.dancer.pastSubtitle": "Dueto, com música ao vivo",
  "sample.dancer.rider":
    "Um chão limpo e flutuante e uma deixa para arrancar a faixa",
  "sample.dancer.reelSubtitle": "Destaques deste ano",
};
