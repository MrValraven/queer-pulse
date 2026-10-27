import type { Catalog } from "../../types";

/**
 * The audience landing page for small businesses (`/for/businesses`): its meta, hero, sections,
 * sample content and questions.
 */
export const forBusinesses: Catalog = {
  "meta.title": "QueerPulse para pequenos negócios",
  "meta.description":
    "Lista o teu negócio onde clientes queer procuram, gere-o com a tua equipa e fala com clientes num só sítio.",

  // Hero
  "hero.eyebrow": "Para pequenos negócios",
  "hero.title":
    "Que te encontrem as pessoas <em>para quem abriste a porta</em>",
  "hero.lede":
    "Põe o teu café, loja, salão ou serviço onde as pessoas queer procuram sítios para ir. O anúncio é teu, geres com a tua equipa e respondes a clientes a partir de uma só caixa de mensagens do negócio.",
  "hero.frame.card": "Exemplo de cartão do diretório de {name}, um café",
  "hero.frame.review":
    "Exemplo de avaliação com a resposta de quem gere o negócio logo abaixo",
  "hero.frame.thread":
    "Exemplo de conversa na caixa de mensagens do negócio, com o primeiro nome de quem respondeu",
  "cta.listBusiness": "Regista o teu negócio",

  // Where it all lives today
  "scatter.title": "O teu negócio já está <em>em muitos sítios</em>",
  "scatter.lede": "Um bocadinho em cada app, e cada bocadinho mantido à mão.",
  "scatter.social.title": "Um perfil numa rede social",
  "scatter.social.body":
    "As melhores fotos e o horário, se as pessoas encontrarem a publicação certa.",
  "scatter.pin.title": "Um pin no mapa que outra pessoa criou",
  "scatter.pin.body":
    "Horário antigo, telefone antigo e nenhum sítio para dizer quem acolhes.",
  "scatter.messages.title": "Mensagens espalhadas por várias apps",
  "scatter.messages.body":
    "Uma pergunta numa caixa, uma reserva noutra e uma resposta que ninguém da equipa viu.",
  "scatter.reviews.title": "Avaliações em vários sites",
  "scatter.reviews.body":
    "Palavras simpáticas e outras difíceis, espalhadas por sites a que respondes um a um.",

  // How it works here
  "walkthrough.title": "Um anúncio, gerido <em>como geres o teu espaço</em>",
  "walkthrough.lede":
    "Quatro coisas que fazes aqui, cada uma com a peça do QueerPulse que a faz.",
  "walkthrough.list.title": "Regista o teu negócio, ou reivindica-o",
  "walkthrough.list.body":
    "Começa por onde te encontram: um lugar que se visita, só online ou itinerante. A nossa equipa lê cada anúncio antes de ficar publicado. Se alguém já adicionou o teu negócio, reivindica-o na página dele e a nossa equipa analisa o pedido.",
  "walkthrough.list.frame":
    "Exemplo da primeira pergunta do formulário, onde é que as pessoas o encontram",
  "walkthrough.tags.title": "Mostra o que é só teu",
  "walkthrough.tags.body":
    "Escolhe os destaques que as pessoas procuram, diz por palavras tuas quem é dono e gere o negócio (mulheres, pessoas trans, não binárias, BIPOC ou migrantes) e responde às perguntas de acessibilidade com franqueza, para que as pessoas possam planear a visita.",
  "walkthrough.tags.frame":
    "Exemplo das etiquetas de um anúncio: categoria, quem o gere, destaques e acessibilidade",
  "walkthrough.team.title": "Gere-o em equipa",
  "walkthrough.team.body":
    "Convida pessoas de confiança para te ajudarem a manter o anúncio em dia. Podem editar tudo sobre o negócio, e os teus dados pessoais e quem pode editar ficam contigo. A tua página também pode mostrar quem lá trabalha.",
  "walkthrough.team.frame":
    "Exemplo da lista de cogestores: uma pessoa que já edita e um convite à espera",
  "walkthrough.team.rosterTitle": "Quem pode editar este anúncio",
  "walkthrough.inbox.title": "Responde a clientes numa só caixa",
  "walkthrough.inbox.body":
    "As mensagens para o teu negócio chegam à caixa dele, partilhada por quem gere o anúncio. As respostas saem em nome do negócio, com um primeiro nome ao lado se quiseres, e quem pega numa conversa fica com ela, para ninguém responder duas vezes.",
  "walkthrough.inbox.frame":
    "Exemplo da caixa de mensagens do negócio, do lado da equipa",

  // Try it
  "tryIt.title": "Um negócio, <em>três maneiras de ser encontrado</em>",
  "tryIt.lede":
    "Escolhe onde as pessoas encontram o café de exemplo e vê o cartão e a localização reais a mudar.",
  "tryIt.frame": "Exemplo de cartão do diretório e localização para {kind}",

  // All in one place
  "allInOne.title": "Tudo sobre o teu negócio, <em>num só anúncio</em>",
  "allInOne.before.details":
    "Horário, fotos e links atualizados em vários sítios",
  "allInOne.before.password": "Um único acesso partilhado por toda a equipa",
  "allInOne.before.apps": "Perguntas de clientes a chegar por várias apps",
  "allInOne.before.reviews": "Avaliações respondidas site a site",
  "allInOne.after.listing":
    "Um anúncio que é teu, com os teus destaques, quem o gere e as tuas respostas de acessibilidade",
  "allInOne.after.team": "Cogestores que o editam contigo",
  "allInOne.after.inbox":
    "Uma caixa de mensagens do negócio a que a equipa responde em conjunto",
  "allInOne.after.replies": "A tua resposta, logo abaixo de qualquer avaliação",
  "allInOne.after.events":
    "Eventos organizados pelo teu negócio, com o nome dele",

  // Safe by design
  "safety.title": "Confiança que <em>vem com cada anúncio</em>",
  "safety.lede":
    "O mesmo compromisso em todas as páginas do diretório, e a nossa equipa por trás de cada reivindicação e de cada contestação.",
  "safety.frame":
    "O compromisso de acolhimento, tal como aparece em cada página de anúncio",
  "safety.claims.title":
    "Reivindicações e contestações vão para a nossa equipa",
  "safety.claims.body":
    "Geres um negócio que outra pessoa listou? Reivindica-o, a nossa equipa analisa o pedido e podes acompanhar o estado dele. Qualquer pessoa da comunidade pode contestar um anúncio, e a nossa equipa analisa isso também.",
  "safety.replies.title": "O teu lado de cada avaliação",
  "safety.replies.body":
    "Responde uma vez a qualquer avaliação do teu negócio. Quem lê a avaliação vê as tuas palavras logo abaixo.",

  // Questions
  "faq.whoSees.question": "Quem pode ver o meu anúncio?",
  "faq.whoSees.answer":
    "Depois de a nossa equipa o ler e de ficar publicado, qualquer pessoa da comunidade que explore o diretório o encontra. Escolhes como apareces nele: com o teu nome e papel, só com o papel ou <b>anónime</b>, visível só para a nossa equipa.",
  "faq.team.question": "Mais do que uma pessoa pode gerir o anúncio?",
  "faq.team.answer":
    "Sim. Convida pessoas com quem tens ligação para cogestoras. Depois de aceitarem, podem editar o anúncio e responder à caixa de mensagens do negócio contigo. Só tu podes convidar pessoas ou retirar um lugar.",
  "faq.noPremises.question": "Posso registar um negócio sem espaço físico?",
  "faq.noPremises.answer":
    "Sim. Escolhe <b>Só online</b> para uma loja ou serviço a que as pessoas chegam por um site ou pelas redes sociais, ou <b>Itinerante</b> para visitas guiadas, cabeleireiros ao domicílio e tudo o que vai ter com os clientes. Dizes onde trabalhas, toda a Lisboa ou algumas freguesias, e as localidades onde também vais.",
  "faq.alreadyListed.question": "Alguém já listou o meu negócio. E agora?",
  "faq.alreadyListed.answer":
    "Reivindica-o na página dele. Ao reivindicar, aceitas o compromisso de acolhimento, e a nossa equipa analisa o pedido antes de o anúncio passar a ser teu. Podes acompanhar o estado nos pedidos que fizeste.",

  // Closing
  "closing.title": "Abre as portas <em>no QueerPulse</em>",
  "closing.body":
    "O teu anúncio, a tua equipa e a tua caixa de mensagens, juntos num só sítio.",

  // Sample content (the fictional Café Andorinha)
  "sample.place.desc":
    "Café, bolo e uma mesa comprida junto à janela. Traz um livro ou alguém amigo.",
  "sample.place.street": "Rua das Andorinhas 14",
  "sample.place.photoAlt": "Um café luminoso com mesas junto à janela",
  "sample.online.desc":
    "Café de pequenos lotes torrado em Lisboa e enviado para tua casa.",
  "sample.online.photoAlt": "Uma chávena de café numa mesa de madeira",
  "sample.mobile.desc":
    "Uma bicicleta de café para feiras, festas e lançamentos. Marca e vamos ter contigo.",
  "sample.mobile.photoAlt": "Uma chávena de café numa mesa de madeira",
  "sample.review.byline": "ela/dela · cliente habitual",
  "sample.review.text":
    "vim beber um café e fiquei a tarde toda na mesa comprida junto à janela e da segunda vez já sabiam o meu nome",
  "sample.review.reply":
    "obrigada Marisa!! a mesa da janela é tua sempre que quiseres, até breve",
  "sample.thread.ask":
    "olá! há acesso sem degraus? a minha amiga usa cadeira de rodas e queríamos ir no sábado",
  "sample.thread.answer":
    "olá! sim a porta é ao nível da rua e há espaço na mesa comprida, guardamos para vocês",
  "sample.thread.thanks": "que bom obrigada, até sábado",
  "sample.team.ask":
    "olá podíamos fazer um pequeno lançamento de livro no café num sábado à noite?",
  "sample.team.colleague":
    "adorávamos! juntamos as mesas junto à janela, mandem-nos a data e mais ou menos quantas pessoas",
  "sample.team.own": "e podemos fazer tudo com leite de aveia se der jeito",
};
