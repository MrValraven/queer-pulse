import type { Catalog } from "../../types";

/** Portuguese "About this screen" help copy. Mirror en/help.ts key-for-key. */
export const help: Catalog = {
  // Shared chrome
  "trigger.label": "Sobre este ecrã: {screen}",
  "eyebrow": "Como usar isto",
  "useHeading": "Como usar",
  "demoLabel": "Na demo",
  "got": "Percebi",

  // Per-screen entries (id-sorted; keep en/help.ts and pt/help.ts in lockstep)
  "admin.hub.title":
    "Painel de administração",
  "admin.hub.intro":
    "O teu posto de comando diário para manter a plataforma segura e saudável. Mostra o que precisa de atenção humana agora e as tendências que revelam como a comunidade está.",
  "admin.hub.use":
    "Começa pelo aviso de triagem no topo: conta tudo o que espera por um moderador.\nClica num item da fila para saltares diretamente para a moderação.\nPercorre os gráficos abaixo para veres denúncias por tipo, crescimento de membros e tempos de resposta.",
  "admin.hub.demo":
    "o aviso pode indicar \"12 coisas precisam de atenção humana\", com as emergências de segurança destacadas primeiro.",
  "admin.listings.title":
    "Estabelecimentos",
  "admin.listings.intro":
    "A mesa de revisão dos estabelecimentos submetidos pelos membros: os espaços, cafés e lojas queer-friendly que as pessoas adicionam ao mapa. És tu que decides o que fica visível.",
  "admin.listings.use":
    "Filtra por estado: Em revisão, Pergunta ou No ar.\nAbre um estabelecimento para veres as fotos, os detalhes e quem o submeteu.\nColoca-o No ar, envia uma pergunta rápida ao dono, ou remove-o.",
  "admin.listings.demo":
    "uma submissão como \"Maison Du Tiago\" no Príncipe Real fica em revisão até a aprovares.",
  "admin.members.title":
    "Membros",
  "admin.members.intro":
    "O diretório de toda a gente na plataforma, e o sítio para o manter de confiança. Verifica quem chega, revê contas sinalizadas e gere funções.",
  "admin.members.use":
    "Usa os separadores para alternar entre todos os membros, verificações pendentes e contas sinalizadas.\nPesquisa por nome ou pronome, ou filtra por membros verificados e novos.\nClica em alguém para abrir o perfil, ajustar a função ou agir.",
  "admin.members.demo":
    "perfis como Sofia Almeida (ela/elu), moderadora, aparecem ao lado de membros recém-chegados à espera de verificação.",
  "admin.moderation.title":
    "Fila de moderação",
  "admin.moderation.intro":
    "Onde chegam as denúncias da comunidade para um moderador rever e agir. Tudo aqui aguarda uma decisão humana, com o mais urgente em destaque primeiro.",
  "admin.moderation.use":
    "Alterna entre os separadores Abertas, Recursos e Resolvidas para veres cada fase.\nFiltra por emergências, ou apenas pelas denúncias atribuídas a ti.\nClica numa denúncia para abrires o contexto completo e registares a tua decisão.",
  "admin.moderation.demo":
    "uma denúncia de emergência como \"Morada partilhada numa captura de DM\" fica no topo da fila, sinalizada para revisão imediata.",
  "auth.onboarding.title":
    "Boas-vindas",
  "auth.onboarding.intro":
    "Este assistente curto e guiado configura o teu perfil assim que entras. Em poucos passos adicionas uma foto, aceitas as normas da comunidade, dizes-nos o que te traz cá e escolhes algumas comunidades a seguir, para que a rede seja tua desde o primeiro dia.",
  "auth.onboarding.use":
    "Segue os passos \"Passo X de N\" pela ordem; podes voltar atrás a qualquer momento.\nAdiciona uma foto e escolhe as intenções que combinam contigo.\nEscolhe algumas comunidades para entrares e termina no ecrã \"está tudo pronto\".",
  "auth.onboarding.demo":
    "no passo das intenções podes tocar em etiquetas como Encontros & eventos, Comunidade ou Habitação para moldar o que vês.",
  "cinema.hub.title":
    "Cinema",
  "cinema.hub.intro":
    "Um cinema queer com curadoria: longas, documentários e curtas programados a cada semana, com a maior parte do que pagas a ir diretamente para quem realiza. Vem ver filmes, mas também apoiar quem os faz.",
  "cinema.hub.use":
    "Explora a programação da semana e abre um filme para saber quem o fez e como o ver.\nVê títulos gratuitos, ou aluga ou torna-te membro para desbloquear filmes exclusivos.\nUsa as secções para descobrir coleções, sessões de perguntas ao vivo e chamadas para realizadores.",
  "cinema.hub.demo":
    "o filme de capa é \"The light between rooms\", de Maria Vasconcelos, a par de longas como \"A summer in Cascais\".",
  "communities.hub.title":
    "Comunidades",
  "communities.hub.intro":
    "É aqui que encontras a tua gente. As comunidades são grupos geridos pelos membros à volta de um interesse, identidade ou causa em comum. Explora-as e junta-te às que te fizerem sentir em casa.",
  "communities.hub.use":
    "Percorre os cartões para veres do que trata cada comunidade.\nToca num filtro de categoria para filtrar pelo ambiente: social, artes, ativismo, apoio e mais.\nAbre uma para leres a página completa, ou carrega em Juntar-me para te tornares membro.",
  "communities.hub.demo":
    "grupos como o Queer Runners Lisboa para corridas ao fim de semana ou o Rainbow Arts Collective para quem cria.",
  "community.detail.title":
    "Comunidade",
  "community.detail.intro":
    "A página de uma comunidade: quem faz parte, do que trata e tudo o que lá acontece. Daqui podes juntar-te, guardá-la para depois, ou explorar os separadores.",
  "community.detail.use":
    "Lê a introdução e os detalhes para perceberes o espírito do grupo.\nJunta-te para poderes publicar e confirmar presença, ou guarda-a para voltares depois.\nUsa os separadores para explorar o pulso, a discussão, os membros e os eventos.",
  "community.detail.demo":
    "um grupo como o Queer Runners Lisboa, com os membros, a cadência e o próximo encontro tudo num só sítio.",
  "community.events.title":
    "Eventos",
  "community.events.intro":
    "Tudo o que reúne a comunidade: o próximo encontro em cima, com os anteriores e os seus resumos por baixo. É assim que um grupo passa do online para o presencial.",
  "community.events.use":
    "Vê o próximo evento e confirma presença para garantires o teu lugar.\nPercorre os eventos passados para veres o que o grupo já fez.\nAbre qualquer evento para os detalhes completos e a localização.",
  "community.events.demo":
    "uma saída como \"June Pride 10 km\" com o Queer Runners Lisboa, pronta para confirmares presença.",
  "community.forum.title":
    "Discussão",
  "community.forum.intro":
    "O mural de conversa da comunidade. Os membros abrem tópicos para colocar dúvidas, partilhar novidades e organizar coisas em conjunto. Pesquisa o que já existe, ou acrescenta o teu.",
  "community.forum.use":
    "Pesquisa ou filtra para encontrares um tópico que te interesse.\nAbre um tópico para leres as respostas e acrescentares a tua.\nCria uma nova publicação na caixa em baixo (só membros).",
  "community.forum.demo":
    "um tópico como \"Encontro de junho: onde devíamos ir?\" onde os membros dão as suas ideias.",
  "connect.connections.title":
    "Ligações",
  "connect.connections.intro":
    "Este é o teu centro de relações: todas as pessoas com quem estás ligado, além dos pedidos, recomendações e bloqueios à volta delas. É como acompanhas o teu círculo aqui.",
  "connect.connections.use":
    "Muda de separador para veres ligações, pedidos recebidos e enviados, recomendações ou bloqueios.\nAceita ou recusa os pedidos à tua espera.\nEnvia mensagem a uma ligação ou convida alguém novo.",
  "connect.connections.demo":
    "ligações como a Catarina, que te recomendou, aparecem ao lado de pedidos recebidos, como um do Daniel.",
  "culture.hub.title":
    "Cultura",
  "culture.hub.intro":
    "A casa das artes e da noite queer: clubes de livros, cinema e música, encomendas abertas a artistas, uma montra de trabalho feito na comunidade e uma sala de rádio ao vivo. É onde a vida criativa da plataforma se junta.",
  "culture.hub.use":
    "Muda de separador para navegar entre Clube, Encomendas, Montra e Rádio.\nAbre uma escolha do clube ou um projeto da montra para veres quem o fez e como participar.\nToca em \"Submeter o teu trabalho\" para mostrar o teu próprio projeto à comunidade.",
  "culture.hub.demo":
    "o Clube de Leitura está a ler Giovanni's Room, e a Montra destaca \"Portraits of Queer Elders in Mouraria\", de Inês Tavares.",
  "economy.grants.title":
    "Financiamentos",
  "economy.grants.intro":
    "Um mapa selecionado de financiamento para projetos e pessoas queer: de micro apoios comunitários a fundações portuguesas e programas da UE. Poupa-te a procura e mostra para que serve realmente cada fundo.",
  "economy.grants.use":
    "Filtra por destinatário: pessoas, organizações, artes ou âmbito da UE.\nAbre um apoio para ver o valor, o estado do prazo e como enquadrar uma candidatura.\nLê o guia breve sobre como escrever uma candidatura forte e honesta.",
  "economy.grants.demo":
    "o QueerPulse Micro Grant oferece €200–€2.000 para projetos queer em Lisboa, com decisões tomadas por um painel comunitário rotativo em vez de uma direção.",
  "economy.hub.title":
    "Economia",
  "economy.hub.intro":
    "O centro de Economia é onde vive a vida profissional da comunidade: uma base para encontrar trabalho, desenvolver uma atividade em freelance e perceber o que é uma remuneração justa. Reúne a incubadora, as ferramentas de freelancer e a transparência salarial num só lugar.",
  "economy.hub.use":
    "Alterna entre os separadores Incubadora, Freelance e Salários para explorar cada vertente.\nExplora empregos de gestão queer ou abre as ferramentas de freelancer de que precisas.\nConsulta as tabelas salariais para confirmar quanto deve pagar uma função.",
  "economy.hub.demo":
    "o separador Salários mostra um UX Designer em Lisboa a rondar os €38.000, para veres quanto pagam as funções reais antes de negociares.",
  "economy.jobs.title":
    "Empregos",
  "economy.jobs.intro":
    "Um mural de empregos em locais de gestão queer, liderança queer e genuinamente inclusivos. Cada anúncio traz sinais de segurança para saberes ao que vais. É onde a comunidade contrata a comunidade.",
  "economy.jobs.use":
    "Filtra por categoria como design, tecnologia ou cuidado para afinar o mural.\nAbre um anúncio para ler toda a função, a proposta e quem analisa as candidaturas.\nGuarda os que gostas e , ou publica o teu com “Publicar vaga”.",
  "economy.jobs.demo":
    "um anúncio como Junior Graphic Designer no Atelier Pulso, um estúdio de gestão queer no Príncipe Real, onde as candidaturas são lidas pela própria fundadora.",
  "economy.skills.title":
    "Competências",
  "economy.skills.intro":
    "Um mural de partilha de competências onde os membros oferecem o que sabem e pedem o que querem aprender: de branding a engenharia backend até olaria em torno. É ensino entre pares, gratuito e partilhado dentro da comunidade.",
  "economy.skills.use":
    "Explora por categoria ou vê em “A oferecer” e “A querer aprender”.\nContacta um membro cuja oferta corresponda ao que precisas.\nPartilha a tua própria competência ou anuncia um workshop para outros participarem.",
  "economy.skills.demo":
    "uma oferta como a Inês a ensinar identidade visual e branding, um a um, no seu estúdio, ou alguém que quer aprender a angariar fundos para um projeto comunitário.",
  "economy.tools.title":
    "Gerador de faturas",
  "economy.tools.intro":
    "Um gerador de faturas gratuito que transforma os teus dados numa fatura-recibo pronta a imprimir, diretamente no navegador. Sem conta e sem que os dados saiam do teu dispositivo. Feito para freelancers a lidar com o trabalho independente em Portugal.",
  "economy.tools.use":
    "Preenche os teus dados e os do cliente e adiciona as linhas do trabalho.\nDefine a taxa de IVA, ou marca-te como isento se for o caso.\nDescarrega o PDF para imprimir ou enviar.",
  "economy.tools.demo":
    "uma fatura de exemplo começa com uma linha como “Brand identity: logo + guidelines” a €1.200, para veres o formato antes de editar o teu.",
  "events.detail.title":
    "Evento",
  "events.detail.intro":
    "A página completa de um encontro: o que é, quando e onde acontece, quem organiza e quantos lugares restam. Tudo o que precisas para decidir se vais.",
  "events.detail.use":
    "Lê a descrição e confirma a data, o bairro e quem organiza.\nVê a linha de lugares para saber quanto espaço ainda há.\nToca no botão principal para reservar lugar, confirmar presença ou enviar mensagem a quem organiza.\nDescobre mais encontros na secção ao fundo.",
  "events.detail.demo":
    "uma página como Inside Beatriz's Ceramics Studio na Graça, organizada pela Beatriz: um domingo tranquilo com o forno, chá e barro para tocar, limitado a poucas pessoas.",
  "events.hub.title":
    "Eventos",
  "events.hub.intro":
    "É aqui que descobres o que se passa na comunidade queer: encontros que organizamos e outros criados por pessoas da rede, tudo num só lugar. É a forma mais rápida de ver o que há esta noite, esta semana ou mais para o fim do mês.",
  "events.hub.use":
    "Começa em Destaques para uma seleção do que vale mesmo a pena.\nMuda para Explorar para percorrer tudo o que aí vem e carregar mais à medida que desces.\nAbre o Calendário para ver os eventos organizados por data.\nToca em qualquer evento para ler os detalhes e confirmar presença.",
  "events.hub.demo":
    "o destaque principal pode mostrar algo como o Queer Supper Club №12 na Mouraria: doze lugares, vinho trazido pelos convidados, morada partilhada na manhã do evento.",
  "feed.hub.title":
    "Feed",
  "feed.hub.intro":
    "O teu feed é a página inicial: um pulso contínuo do que as tuas comunidades, encontros e pessoas estão a publicar, para saberes sempre o que se passa sem teres de procurar.",
  "feed.hub.use":
    "Muda de separador para filtrares por comunidades, encontros, novas pessoas ou publicações.\nDesliza para te pores a par da atividade mais recente.\nGosta, responde ou liga-te diretamente a partir de um cartão.\nAbre a barra lateral para veres membros sugeridos e encontros a chegar.",
  "feed.hub.demo":
    "uma publicação como a da Anika Kovač na Trans & Non-Binary Network a pedir um médico de família amigo da comunidade queer em Lisboa, com membros a responder com recomendações.",
  "forum.hub.title":
    "Fórum",
  "forum.hub.intro":
    "O fórum é onde a comunidade pensa em voz alta em conjunto: conversas mais longas sobre habitação, saúde, ativismo, artes e o dia a dia, organizadas para encontrares e acompanhares o que te interessa.",
  "forum.hub.use":
    "Percorre os tópicos mais recentes ou escolhe uma categoria na barra lateral para afinar o tema.\nOrdena por mais recentes ou mais ativos para veres o que está a mexer agora.\nToca num tópico para leres a discussão completa e responderes.\nUsa Nova publicação para começares a tua própria conversa.",
  "forum.hub.demo":
    "tópicos como \"Honest guide to finding a flat in Lisbon as a newcomer\" ou \"Proposal: Monthly queer film night at Cinema São Jorge\", organizados em categorias como Habitação e Artes.",
  "forum.thread.title":
    "Tópico",
  "forum.thread.intro":
    "Esta é uma discussão completa: a publicação original no topo, seguida das respostas de toda a gente. É o sítio para leres a conversa inteira e acrescentares a tua voz.",
  "forum.thread.use":
    "Lê a publicação original e as respostas por baixo.\nGosta ou guarda as publicações que queres recordar, e ordena as respostas das mais antigas ou mais recentes.\nEscreve na caixa de resposta para responderes ao tópico, ou responde por baixo de um comentário para manteres um sub-tópico junto.\nUsa a opção de denúncia se algo violar as regras da comunidade.",
  "forum.thread.demo":
    "um tópico como \"Trans-affirming healthcare in Lisbon: the full guide\", onde os membros partilham clínicas acolhedoras e respondem às perguntas uns dos outros.",
  "governance.hub.title":
    "Governação",
  "governance.hub.intro":
    "A janela aberta para a forma como o QueerPulse é gerido: quem decide, como o dinheiro é gasto e como a comunidade se mantém segura. A transparência é o objetivo central.",
  "governance.hub.use":
    "Usa a navegação lateral para saltar entre saúde, moderação, o conselho, princípios, finanças e decisões.\nLê o resumo trimestral de saúde para veres como a plataforma está.\nAbre um documento fundador, como a constituição ou o relatório de transparência, para todos os detalhes.",
  "governance.hub.demo":
    "a secção de finanças mostra para onde vão as contribuições dos membros, a par dos membros do conselho que orientam a plataforma.",
  "home.landing.title":
    "Boas-vindas",
  "home.landing.intro":
    "Esta é a porta de entrada da QueerPulse: uma rede pequena, gerida pelos membros, para pessoas queer em Lisboa, onde cada membro entra por recomendação em vez de correr atrás de seguidores. A página inicial é a tua visita guiada ao que vais encontrar: pessoas, comunidades, encontros e apoio.",
  "home.landing.use":
    "Lê o destaque e desce a página para ver quem cá está e para que serve a rede.\nPede um convite para começar a tua adesão.\nExplora membros e comunidades para ganhares uma ideia antes de entrares.",
  "home.landing.demo":
    "a página de entrada dá o tom com frases como \"Uma rede queer, com raízes em Lisboa\": uma rede por recomendação, de pessoas que conheces mesmo.",
  "housing.flatmates.title":
    "Colegas de casa",
  "housing.flatmates.intro":
    "Perfis de pessoas que procuram partilhar casa: tanto quem oferece um quarto como quem procura um. É uma forma mais tranquila de encontrar colegas de casa que combinam contigo, ainda antes de haver contrato.",
  "housing.flatmates.use":
    "Filtra por zona, orçamento, data de entrada e etiquetas de estilo de vida.\nLê um perfil para saberes como é viver com essa pessoa.\nDiz olá para iniciares uma conversa.\nPublica o teu próprio perfil para que te encontrem.",
  "housing.flatmates.demo":
    "perfis como uma pessoa amante de plantas e em teletrabalho à procura de um quarto por volta de €700–900.",
  "housing.hub.title":
    "Habitação",
  "housing.hub.intro":
    "Casas e quartos partilhados pela e para a comunidade, para encontrares onde viver entre pessoas que te entendem. Muda para o separador Colegas de casa para encontrares as pessoas por detrás dos quartos.",
  "housing.hub.use":
    "Explora o separador Habitação para quartos, apartamentos e subarrendamentos.\nUsa os filtros para corresponderem ao teu orçamento, zona e datas.\nAbre um anúncio para veres fotos e enviares mensagem a quem publica.\nMuda para Colegas de casa para encontrares alguém com quem partilhar.",
  "housing.hub.demo":
    "anúncios como um T1 soalheiro no Príncipe Real, ou um quarto num apartamento partilhado em Arroios.",
  "housing.listing.title":
    "Anúncio de habitação",
  "housing.listing.intro":
    "Todos os detalhes de uma casa ou quarto: fotos, preço, o que está incluído e quem oferece. É aqui que entras em contacto e dás o próximo passo.",
  "housing.listing.use":
    "Vê as fotos e lê o que está a ser oferecido.\nConfirma o preço, o bairro e a data de entrada.\nGuarda o anúncio ou envia mensagem diretamente a quem publica.\nDenuncia se algo não parecer certo.",
  "housing.listing.demo":
    "um anúncio como um T1 soalheiro no Príncipe Real, publicado por um membro da comunidade.",
  "local.directory.title":
    "Diretório local",
  "local.directory.intro":
    "Um mapa vivo de espaços geridos por pessoas queer e amigos da comunidade pela cidade: cafés, livrarias, estúdios, bares e serviços que valem a pena. É assim que encontras os sítios onde podes simplesmente ser quem és.",
  "local.directory.use":
    "Pesquisa ou escolhe uma categoria para afinar a lista.\nAbre a gaveta Refinar para filtrar por ambiente ou verificação de espaço seguro.\nAlterna entre Lista e Mapa para explorar como preferires.\nToca num espaço para veres todos os detalhes.",
  "local.directory.demo":
    "explora espaços como a Livraria Bertha, uma livraria queer, ou o Queer Supper Club.",
  "local.directoryDetail.title":
    "Detalhes do espaço",
  "local.directoryDetail.intro":
    "Tudo sobre um espaço do diretório: fotos, horários, o que o torna acolhedor e como lá chegar. É aqui que decides se é o teu tipo de sítio.",
  "local.directoryDetail.use":
    "Lê a descrição, os horários e o estado de espaço seguro.\nGuarda o espaço ou abre-o no mapa.\nUsa as ligações de denúncia ou sugerir alteração se algo estiver errado.\nAbre um espaço relacionado para continuares a explorar por perto.",
  "local.directoryDetail.demo":
    "uma página como o Atelier Pulso, um estúdio criativo, com horários, fotos e bairro.",
  "magazine.hub.title":
    "Revista",
  "magazine.hub.intro":
    "A revista da comunidade: reportagem, ensaios e histórias na primeira pessoa sobre a vida queer, escritos por e para quem a vive. É onde a plataforma abranda para contar as histórias mais longas.",
  "magazine.hub.use":
    "Lê a história de capa e depois explora reportagens, ensaios e as edições anteriores.\nSegue um autor ou autora para acompanhares o que escreve.\nPropõe o teu próprio artigo ou história quando tiveres algo para contar.",
  "magazine.hub.demo":
    "a primeira página traz reportagens como \"Mouraria's chosen family, ten years later\" e \"The last queer bar in Bairro Alto that isn't trying\".",
  "marketing.about.title":
    "Sobre",
  "marketing.about.intro":
    "Esta página explica porque existe a QueerPulse e como é gerida: uma plataforma feita de propósito, pequena por opção e detida pela sua comunidade e não por anunciantes. É o melhor sítio para perceberes os nossos valores antes de te comprometeres.",
  "marketing.about.use":
    "Lê \"Porque existimos\" para veres a falha que esta rede veio preencher.\nCompara a nossa forma de trabalhar com as plataformas habituais no lado a lado.\nAbre a Governação ou o Contacto no fundo para veres quem a gere e falares connosco.",
  "marketing.about.demo":
    "os valores dizem-no com clareza: pequena por opção, sem economia de anúncios ou de dados, e o valor fica com a comunidade.",
  "members.hub.title":
    "Membros",
  "members.hub.intro":
    "Este é o diretório da comunidade: toda a lista de membros num só sítio, para encontrares as pessoas que realmente queres conhecer. É aqui que a ligação começa.",
  "members.hub.use":
    "Pesquisa ou percorre a grelha de membros.\nAbre os Filtros para afinar por identidade, bairro, área ou idioma.\nToca num cartão para ler o perfil de alguém e fazer contacto.",
  "members.hub.demo":
    "perfis como o da Inês, designer gráfica em Lisboa, aparecem ao lado de dezenas de outros membros que podes filtrar.",
  "members.profile.title":
    "Perfil público",
  "members.profile.intro":
    "Este é o perfil público de um membro: a versão de alguém que qualquer pessoa na web pode ler, mesmo sem conta. É a forma de te apresentares para além das paredes da comunidade.",
  "members.profile.use":
    "Lê a bio, os pronomes e os links no topo.\nExplora o trabalho e os contributos públicos em baixo.\nPede um convite se ainda não fores membro.",
  "members.profile.demo":
    "uma página como a da Inês Tavares mostra a frase de apresentação, a bio e o trabalho público a quem visitar o link.",
  "messages.conversation.title":
    "Conversa",
  "messages.conversation.intro":
    "Uma conversa aberta. Lê o histórico, responde em tempo real e reage, cita ou reencaminha qualquer mensagem.",
  "messages.conversation.use":
    "Escreve na caixa em baixo e carrega em enviar.\nMantém uma mensagem premida para reagir, responder, editar ou reencaminhar.\nToca no ícone da estrela para veres as mensagens que guardaste.\nAbre o nome no topo para veres o perfil ou os detalhes do grupo.",
  "messages.conversation.demo":
    "uma conversa com alguém como o Jordan Park, onde uma mensagem marcada com estrela fica a um toque de distância.",
  "messages.inbox.title":
    "Mensagens",
  "messages.inbox.intro":
    "A tua caixa de entrada privada. Todas as conversas diretas e de grupo em que participas aparecem aqui, com as respostas mais recentes primeiro.",
  "messages.inbox.use":
    "Escolhe uma conversa da lista para a abrires.\nToca no ícone do lápis para começares uma nova mensagem direta.\nToca no ícone de grupo para criares uma conversa de grupo.\nPesquisa por nome ou por palavras dentro de mensagens antigas.",
  "messages.inbox.demo":
    "conversas como um chat direto com a Anika Kovač, ou um grupo como o Pride Brunch Crew.",
  "myevents.hub.title":
    "Os teus eventos",
  "myevents.hub.intro":
    "O teu espaço pessoal para tudo aquilo em que vais, estás em lista de espera, organizas, guardaste ou foste convidade. Um lugar arrumado para acompanhares os teus planos e nunca falhares a hora de chegada.",
  "myevents.hub.use":
    "Usa os separadores para filtrar por vais, organizas, guardados ou convites.\nAbre um evento para ver os detalhes ou gerir a tua presença.\nAceita ou recusa convites diretamente na lista.\nMuda para o calendário para veres a tua semana num relance.",
  "myevents.hub.demo":
    "podes ver o Trans Joy Picnic no Jardim da Estrela entre os teus planos: mantas, petiscos para partilhar e um cantinho tranquilo se precisares.",
  "notifications.hub.title":
    "Notificações",
  "notifications.hub.intro":
    "Tudo o que aconteceu enquanto estiveste ausente: respostas, menções, novos membros, atualizações de eventos e mais, reunido num só sítio.",
  "notifications.hub.use":
    "Percorre para veres a atividade recente e mais antiga.\nUsa os separadores para filtrar por tipo, ou abre Menções para veres onde foste marcado.\nToca numa notificação para saltares diretamente para ela.\nCarrega em Marcar tudo como lido para limpares o indicador.",
  "notifications.hub.demo":
    "atualizações como a Inês a responder-te, ou o Diogo a juntar-se à comunidade Queer Classics.",
  "resources.hub.title":
    "Bem-estar",
  "resources.hub.intro":
    "Um diretório de cuidado e apoio para a comunidade queer: terapeutas afirmativos, apoio entre pares, linhas de crise e orientação de redução de riscos, reunidos num só lugar. Recorre aqui quando tu ou alguém que amas precisar de ajuda.",
  "resources.hub.use":
    "Salta para a secção de que precisas: terapeutas, apoio entre pares, crise ou redução de riscos.\nAbre o perfil de um terapeuta para veres a sua abordagem e como o contactar.\nGuarda as linhas de crise para as teres à mão quando precisares depressa.",
  "resources.hub.demo":
    "encontras terapeutas afirmativos como a Dra. Marta Seabra, a par de linhas de apoio como a SOS Voz Amiga e a ILGA Portugal.",
  "safety.hub.title":
    "Espaços seguros",
  "safety.hub.intro":
    "Um diretório validado pela comunidade de locais que conquistaram o selo de espaço seguro, mais um registo honesto dos que o perderam. Ajuda-te a encontrar um sítio onde relaxar sendo quem és.",
  "safety.hub.use":
    "Explora os espaços seguros verificados no diretório.\nAbre um local para ler as suas promessas, avaliações e recomendações.\nNomeia um espaço em que confias, ou sinaliza um que falhou à comunidade.",
  "safety.hub.demo":
    "o registo mantém-se transparente, por isso um local que perdeu o selo, como o Purex, guarda uma nota a explicar porquê.",
  "settings.hub.title":
    "Definições",
  "settings.hub.intro":
    "É aqui que decides como o QueerPulse funciona para ti. A barra lateral agrupa todas as preferências, das notificações e privacidade ao teu perfil, tema e conta.",
  "settings.hub.use":
    "Escolhe uma categoria na barra lateral para abrir o painel.\nAjusta os interruptores e as opções lá dentro.\nGuarda quando a barra aparecer no fundo, ou descarta para anular.",
  "settings.hub.demo":
    "o painel da conta mostra o teu email e liga à autenticação de dois fatores e à segurança, a par de categorias como Notificações, Visibilidade e Tema do perfil.",
  "settings.privacy.title":
    "Preferências de notificações",
  "settings.privacy.intro":
    "Decide exatamente que avisos chegam até ti e como. Liga os que importam e silencia o resto, para o QueerPulse só te tocar quando conta.",
  "settings.privacy.use":
    "Liga ou desliga cada notificação por categoria.\nEscolhe com que frequência recebes email, do imediato ao resumo diário.\nDefine horas de silêncio para nada te incomodar de noite.",
  "settings.privacy.demo":
    "podes silenciar tudo entre as 22:00 e as 08:00 com as horas de silêncio, mantendo os alertas de mensagens novas ligados.",
  "studio.hub.title":
    "Studio",
  "studio.hub.intro":
    "Uma plataforma de música pensada para artistas queer, onde quem cria os sets e as faixas fica com a maior fatia do que pagas e das gorjetas. Ouve sets ao vivo, segue artistas e apoia-os diretamente.",
  "studio.hub.use":
    "Ouve o set ou a faixa que está no ar neste momento.\nSegue artistas e guarda o trabalho a que queres voltar.\nDá gorjeta ou subscreve para que o teu dinheiro chegue a quem faz a música.",
  "studio.hub.demo":
    "o set \"Vespertina, vol. iv\" está no ar, com curadoria de Sara Marques e faixas como \"Carta para a santa\", de Mariana Sol.",
  "subprofiles.detail.title":
    "Persona",
  "subprofiles.detail.intro":
    "Esta é a página de uma persona: uma montra autónoma para um único ofício, com a sua própria apresentação, trabalho e contacto. Se estiver ligada a um membro, vês quem está por detrás.",
  "subprofiles.detail.use":
    "Lê a frase de apresentação e a bio no destaque.\nPercorre as secções com o trabalho, lançamentos ou portefólio.\nApoia, segue ou envia mensagem se quiseres ligar-te.",
  "subprofiles.detail.demo":
    "uma página como a da NIGHTFORM mostra os lançamentos, os links e a disponibilidade de um músico numa montra dedicada.",
  "subprofiles.hub.title":
    "Personas",
  "subprofiles.hub.intro":
    "Uma persona é uma página pública dedicada a um lado da tua vida (a tua música, a tua arte, o teu ofício) separada do teu perfil principal. Este diretório deixa-te explorar as de todos.",
  "subprofiles.hub.use":
    "Filtra por área, como músico, escritor ou artista visual.\nPesquisa por nome ou adiciona etiquetas para afinar.\nAtiva \"aberto a colaborações\" para encontrar quem quer juntar-se a projetos.",
  "subprofiles.hub.demo":
    "personas como a NIGHTFORM, uma músico de eletrónica para as madrugadas, aparecem aqui ao lado de escritores, designers e DJ.",
  "topics.hub.title":
    "Tema",
  "topics.hub.intro":
    "Um tema reúne num só sítio todas as publicações marcadas com a mesma etiqueta: um feed de hashtag onde podes acompanhar um assunto que te interessa em toda a plataforma.",
  "topics.hub.use":
    "Lê as publicações reunidas neste tema.\nSegue o tema para o teres à mão e receberes mais dele no teu feed.\nUsa Escrever uma publicação para acrescentares o teu contributo.\nExplora temas e recursos relacionados na barra lateral.",
  "topics.hub.demo":
    "um tema como #healthcare, que junta tópicos e publicações sobre clínicas acolhedoras para pessoas trans, o SNS e como encontrar um médico de família afirmativo.",
};
