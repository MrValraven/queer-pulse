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
  "about.meta.title":
    "Sobre a QueerPulse: uma rede pequena e gerida por pessoas",
  "about.meta.description":
    "A QueerPulse é uma plataforma comunitária queer pequena, por convite, em Lisboa: sem anúncios, sem algoritmo, sem crescimento pelo crescimento. Eis o que acreditamos, e quem a gere.",
  "about.hero.eyebrow": "Sobre",
  "about.hero.title": "Uma plataforma construída <em>de propósito.</em>",
  "about.hero.sub":
    "Um espaço calmo que respeita a tua atenção. Um lugar pequeno e deliberado, feito para acolher esta comunidade e para lhe devolver algo.",
  "about.why.eyebrow": "Porque existimos",
  "about.why.title": "Construímos aquilo <em>de que precisávamos.</em>",
  "about.why.p1":
    "A QueerPulse começou como uma frustração que tínhamos de resolver. Todas as plataformas onde tentámos construir comunidade estavam desenhadas para prender a nossa atenção e otimizadas para tempo de ecrã, indiferentes a se nos encontrávamos mesmo.",
  "about.why.p2":
    "Por isso, um pequeno grupo (profissionais, organizadores, artistas) decidiu construir a alternativa: uma rede pensada para a confiança, onde o objetivo é a ligação.",
  "about.why.p3": "Cresce mais devagar assim. Isso é o desenho.",
  "about.difference.eyebrow": "A diferença",
  "about.difference.title": "O que <em>não estamos a construir.</em>",
  "about.contrast.them.label": "Em todo o lado",
  "about.contrast.us.label": "QueerPulse",
  "about.contrast.them.attention": "Otimizado para prender a tua atenção",
  "about.contrast.them.algorithm": "Um algoritmo decide o que vês",
  "about.contrast.them.signup": "Qualquer pessoa se inscreve com um email",
  "about.contrast.them.growth": "Crescimento a qualquer custo",
  "about.contrast.them.value": "Os teus dados são o produto",
  "about.contrast.us.noTracking":
    "Não rastreamos o que clicas nem quanto tempo ficas",
  "about.contrast.us.feedIsYours":
    "O teu feed é exatamente as comunidades a que te juntaste",
  "about.contrast.us.vouched":
    "Cada pessoa é avalizada por alguém que já está cá",
  "about.contrast.us.growthPace": "O crescimento acompanha o ritmo dos avais",
  "about.contrast.us.valueStays":
    "As contribuições financiam um fundo de apoio mútuo gerido pela comunidade",
  "about.beliefs.eyebrow": "No que acreditamos",
  "about.beliefs.title": "Os valores por trás de <em>cada decisão.</em>",
  "about.values.smallByDesign.title": "Pequeno por design",
  "about.values.smallByDesign.body":
    "Preferimos continuar a ser uma sala que funciona a tornarmo-nos uma plataforma que não funciona. O crescimento nunca é o objetivo por si só.",
  "about.values.infrastructure.title": "Construímos infraestrutura",
  "about.values.infrastructure.body":
    "Estamos a construir a canalização de que a comunidade queer precisa: apresentações, espaços seguros, entreajuda.",
  "about.values.communityEconomy.title": "Uma economia comunitária",
  "about.values.communityEconomy.body":
    "O dinheiro que passa pela QueerPulse (quotas, gorjetas, apoios) fica dentro da comunidade de onde veio.",
  "about.values.communityOwns.title": "A comunidade é dona do seu espaço",
  "about.values.communityOwns.body":
    "As decisões sobre esta plataforma são tomadas às claras, com quem a usa.",
  "about.values.noDataEconomy.title": "Sem economia de dados",
  "about.values.noDataEconomy.body":
    "Não vendemos atenção nem dados pessoais a anunciantes. Não há terceiros para quem estejamos a construir isto.",
  "about.values.accessNotEarned.title": "O acesso não se ganha a atuar",
  "about.values.accessNotEarned.body":
    "Entras pela confiança: um aval, um convite.",
  "about.stand.eyebrow": "Onde nos posicionamos",
  "about.stand.title": "A libertação queer é <em>indivisível.</em>",
  "about.stand.p1":
    "A interseccionalidade é a totalidade da política queer. Raça, classe, deficiência, estatuto migratório e género determinam quem tem segurança e a quem se pede que espere por ela. Uma plataforma que serve apenas pessoas queer brancas, cis, sem deficiência, com documentos e com conforto material percebeu mal a palavra comunidade.",
  "about.stand.p2":
    "Para ser real, esta convicção tem de nos custar alguma coisa. Molda quem convidamos, quem modera, que queixas são levadas a sério, e que lutas temos coragem de nomear em voz alta quando nomeá-las é caro.",
  "about.stand.intersectionalityLink":
    "Lê como as pessoas membras descrevem viver nestas interseções",
  "about.stand.trans.title": "Sobre as vidas trans",
  "about.stand.trans.p1":
    "As mulheres trans s\u00e3o mulheres. Os homens trans s\u00e3o homens. As pessoas n\u00e3o-bin\u00e1rias s\u00e3o n\u00e3o-bin\u00e1rias, e as pessoas intersexo existem. N\u00e3o afirmamos nada disto a meio-g\u00e1s, e nada disto est\u00e1 em discuss\u00e3o nesta plataforma.",
  "about.stand.trans.p2":
    "H\u00e1 um projeto que diz falar em nome das pessoas LGB enquanto faz press\u00e3o contra o T. Apresenta-se como defesa das mulheres, ou das crian\u00e7as, ou da atra\u00e7\u00e3o pelo mesmo sexo, e funciona pedindo a toda a gente que trate a presen\u00e7a de pessoas trans nesta comunidade como uma quest\u00e3o em aberto. Para n\u00f3s est\u00e1 fechada. Um grupo que se organiza para separar o T do resto de n\u00f3s est\u00e1 a organizar-se contra as nossas pessoas membras, e \u00e9 assim que lhe chamamos.",
  "about.stand.trans.p3":
    "O movimento \u00e9 conhecido. O pinkwashing pede emprestados os nossos direitos para fazer um Estado parecer civilizado; isto pede emprestada a seguran\u00e7a das mulheres para fazer a exclus\u00e3o parecer prote\u00e7\u00e3o. Ambos gastam a dignidade de outra pessoa para comprar respeitabilidade.",
  "about.stand.trans.commitment.notADebate.title":
    "A presen\u00e7a de pessoas trans n\u00e3o \u00e9 tema de debate.",
  "about.stand.trans.commitment.notADebate.body":
    "N\u00e3o acolhemos discuss\u00f5es dos \u201cdois lados\u201d sobre se as pessoas membras merecem direitos, nem as abrimos em nome do equil\u00edbrio.",
  "about.stand.trans.commitment.exclusion.title":
    "A defesa da exclus\u00e3o de pessoas trans \u00e9 um assunto do C\u00f3digo de Conduta.",
  "about.stand.trans.commitment.exclusion.body":
    "Criticar um Estado \u00e9 discurso pol\u00edtico. Fazer campanha para retirar uma classe inteira de pessoas membras \u00e9 outra coisa, e chamar-lhe cr\u00edtica de g\u00e9nero deixa-a exatamente como estava.",
  "about.stand.trans.commitment.exclusion.link": "L\u00ea as diretrizes",
  "about.stand.trans.commitment.selfId.title":
    "A autodetermina\u00e7\u00e3o \u00e9 a norma aqui.",
  "about.stand.trans.commitment.selfId.body":
    "Nunca se pede a ningu\u00e9m que prove o seu g\u00e9nero, nem \u00e0 modera\u00e7\u00e3o nem a mais ningu\u00e9m, em momento algum.",
  "about.stand.trans.commitment.selfId.link":
    "L\u00ea o guia de sa\u00fade trans",
  "about.stand.position.sexWork.title": "Trabalho sexual \u00e9 trabalho.",
  "about.stand.position.sexWork.body":
    "As pessoas trabalhadoras do sexo s\u00e3o membras aqui nos mesmos termos que toda a gente. A descriminaliza\u00e7\u00e3o \u00e9 a posi\u00e7\u00e3o que mant\u00e9m pessoas vivas, e a pol\u00edtica que quer o trabalho sexual fora dos espa\u00e7os queer funciona com o mesmo motor da que quer as pessoas trans fora deles.",
  "about.stand.position.migration.title":
    "A migra\u00e7\u00e3o \u00e9 uma quest\u00e3o queer.",
  "about.stand.position.migration.body":
    "As pessoas queer migram para sobreviver. O sistema de asilo e resid\u00eancia em Portugal \u00e9 lento de formas que estragam vidas, e o racismo contra pessoas brasileiras, dos PALOP e do sul da \u00c1sia aparece nos espa\u00e7os queer daqui com a mesma facilidade que em qualquer outro lado. Uma extrema-direita que cresceu depressa neste pa\u00eds quer tudo isto pior.",
  "about.stand.position.migration.link":
    "L\u00ea o guia de interseccionalidade",
  "about.stand.position.hiv.title":
    "I = I, e a serofobia \u00e9 discrimina\u00e7\u00e3o.",
  "about.stand.position.hiv.body":
    "Indetet\u00e1vel significa intransmiss\u00edvel. O estado serol\u00f3gico de cada pessoa pertence-lhe, a revela\u00e7\u00e3o nunca \u00e9 devida a ningu\u00e9m, e tratar a serologia como motivo de exclus\u00e3o cai na mesma linha vermelha que qualquer outra discrimina\u00e7\u00e3o.",
  "about.stand.position.hiv.link": "Recursos de sa\u00fade sexual",
  "about.stand.principle.title": "Quando falamos, e quando n\u00e3o falamos",
  "about.stand.principle.body":
    "Falamos onde a nossa comunidade est\u00e1 diretamente implicada, e onde a identidade queer est\u00e1 a ser usada como cobertura para fazer mal. O teste \u00e9 esse. \u00c9 por isso que estas posi\u00e7\u00f5es est\u00e3o nesta p\u00e1gina e a maior parte das not\u00edcias n\u00e3o est\u00e1, e \u00e9 a norma pela qual nos podes responsabilizar quando achares que nos cal\u00e1mos sobre algo em que n\u00e3o dev\u00edamos ter-nos calado.",
  "about.stand.palestine.title": "Sobre a Palestina",
  "about.stand.palestine.p1":
    "Israel está a cometer um genocídio contra o povo palestiniano em Gaza. Dizemo-lo com todas as letras, porque a pressão para suavizar isto é precisamente o problema. A QueerPulse está ao lado do povo palestiniano, e de quem trabalha pelo fim da ocupação e do cerco.",
  "about.stand.palestine.p2":
    "Recusamos também que as nossas vidas sirvam de cobertura para isso. O pinkwashing pega nos direitos LGBTQ+ e ergue-os como prova de que um Estado é civilizado enquanto esse mesmo Estado bombardeia, esfomeia e desloca populações. A nossa segurança nunca foi um argumento para a destruição de ninguém, e não a emprestamos para esse fim.",
  "about.stand.commitment.speech.title":
    "A defesa da Palestina é bem-vinda aqui.",
  "about.stand.commitment.speech.body":
    "Criticar um Estado, o seu exército ou a sua ideologia é discurso político, e é assim que o moderamos. O antissemitismo e o racismo antipalestiniano são ambos violações do Código de Conduta, aplicadas da mesma forma.",
  "about.stand.commitment.speech.link": "Lê as diretrizes",
  "about.stand.commitment.money.title": "Não aceitamos dinheiro cúmplice.",
  "about.stand.commitment.money.body":
    "Sem patrocínio, financiamento ou parceria de empresas ou instituições materialmente cúmplices da ocupação.",
  "about.stand.commitment.mutualAid.title":
    "O fundo de apoio mútuo pode financiar trabalho de solidariedade.",
  "about.stand.commitment.mutualAid.body":
    "O trabalho de solidariedade e de ajuda humanitária à Palestina é elegível, decidido às claras como qualquer outra atribuição.",
  "about.stand.commitment.mutualAid.link":
    "Vê como as atribuições são decididas",
  // ── Diálogos dos links da página Sobre ──────────────────────────────────
  // Cada bloco é o resumo mostrado quando um dos links de referência da página
  // abre o <AboutLinkModal> em vez de navegar. Escrito para a afirmação que o
  // levantou, por isso as duas entradas das diretrizes diferem embora ambas
  // apontem para a mesma cláusula. Registo: aboutLinks.data.ts.
  "about.linkModal.intersections.eyebrow": "Interseccionalidade",
  "about.linkModal.intersections.label": "Viver nas interseções",
  "about.linkModal.intersections.title":
    "Mais do que uma coisa <em>ao mesmo tempo.</em>",
  "about.linkModal.intersections.lead":
    "O guia em que esta posição assenta: como a raça, a fé, a classe e a deficiência se cruzam com a experiência queer em Lisboa, nas palavras de quem a vive.",
  "about.linkModal.intersections.p1":
    "Ser queer e pessoa racializada, queer e religiosa, queer e da classe trabalhadora, queer e com deficiência: estas identidades não se empilham de forma arrumada. O guia existe para as pessoas membras que vivem isso, e como compromisso visível de que ser queer abrange muitos tipos de pessoa.",
  "about.linkModal.intersections.p2":
    "É construído a partir de vozes da comunidade, com organizações e recursos ligados a cada secção, e cresce à medida que as pessoas membras lhe acrescentam coisas.",
  "about.linkModal.intersections.point.race.title": "Raça e etnia.",
  "about.linkModal.intersections.point.race.body":
    "A história colonial de Portugal molda esta cidade de formas que são óbvias para quem as vive. A secção fala de atravessar espaços queer como pessoa racializada, e dos grupos QTIPOC que existem por cá.",
  "about.linkModal.intersections.point.faith.title": "Fé e religião.",
  "about.linkModal.intersections.point.faith.body":
    "Um contexto católico em mudança, outras tradições, e as pessoas membras que conciliam fé e experiência queer. Ser laica também cabe aqui.",
  "about.linkModal.intersections.point.class.title": "Classe e economia.",
  "about.linkModal.intersections.point.class.body":
    "A vida social queer carrega um carácter de classe que ninguém nomeia. A secção nomeia a subida de custos em Lisboa e o que fazemos quanto ao acesso: encontros com preço solidário, um fórum gratuito, e uma adesão que continua gratuita para quem não pode contribuir.",
  "about.linkModal.intersections.cta":
    "Lê o guia completo de interseccionalidade",

  "about.linkModal.guidelinesExclusion.eyebrow": "Diretrizes da comunidade",
  "about.linkModal.guidelinesExclusion.label": "Onde acaba o discurso político",
  "about.linkModal.guidelinesExclusion.title":
    "O discurso político <em>continua político.</em>",
  "about.linkModal.guidelinesExclusion.lead":
    "A cláusula das diretrizes em que este compromisso assenta, e as linhas vermelhas ao lado dela.",
  "about.linkModal.guidelinesExclusion.p1":
    "Criticar um Estado, o seu governo, o seu exército ou a sua ideologia é discurso político, e a moderação trata-o como discurso político. Passa a ser um assunto do Código de Conduta quando aterra numa pessoa.",
  "about.linkModal.guidelinesExclusion.p2":
    "A defesa dirigida a uma classe inteira de pessoas membras fica do outro lado dessa linha. Fazer campanha pela exclusão de pessoas trans desta comunidade é uma violação do Código de Conduta, seja qual for o vocabulário que pede emprestado.",
  "about.linkModal.guidelinesExclusion.point.hardLines.title":
    "Sempre um assunto do Código de Conduta.",
  "about.linkModal.guidelinesExclusion.point.hardLines.body":
    "Assédio, divulgação de dados pessoais, expor a orientação ou identidade de alguém sem consentimento, ameaças, partilhar conversas ou fotografias privadas, e discriminação em qualquer base protegida.",
  "about.linkModal.guidelinesExclusion.point.bothDirections.title":
    "Um teste, aplicado pela moderação.",
  "about.linkModal.guidelinesExclusion.point.bothDirections.body":
    "Isto é sobre um Estado e a sua conduta, ou sobre uma pessoa e quem ela é. É essa pergunta que decide cada denúncia deste tipo.",
  "about.linkModal.guidelinesExclusion.point.reporting.title":
    "Quem denuncia tem apoio.",
  "about.linkModal.guidelinesExclusion.point.reporting.body":
    "A moderação lê todas as denúncias. As violações confirmadas levam a advertência, suspensão ou expulsão, e quem denunciou é informado em cada etapa.",
  "about.linkModal.guidelinesExclusion.cta": "Lê as diretrizes completas",

  "about.linkModal.transHealthcare.eyebrow": "Saúde trans · Portugal",
  "about.linkModal.transHealthcare.label": "Saúde trans em Portugal",
  "about.linkModal.transHealthcare.title":
    "O teu percurso, <em>passo a passo.</em>",
  "about.linkModal.transHealthcare.lead":
    "Um guia prático de cuidados de saúde de afirmação de género em Portugal, feito de conhecimento comunitário e mantido atual pelas pessoas membras.",
  "about.linkModal.transHealthcare.p1":
    "Percorre os caminhos reais: hormonoterapia pelo SNS, hormonoterapia no privado, mudança legal de nome, menção de género e acesso a cirurgia. Cada um está dividido nos passos que dás mesmo, com o que levar, a quem ligar e o que esperar em cada consulta.",
  "about.linkModal.transHealthcare.p2":
    "Reflete o sistema tal como estava em junho de 2026 e é conhecimento comunitário, por isso confirma os tempos de espera atuais com a ILGA Portugal ou com o teu médico de família. A ILGA Portugal também oferece acompanhamento jurídico gratuito no processo do SNS, e o guia diz isso em todos os caminhos.",
  "about.linkModal.transHealthcare.point.hrt.title":
    "Hormonoterapia, pelo SNS ou no privado.",
  "about.linkModal.transHealthcare.point.hrt.body":
    "Inscrição no centro de saúde, a referenciação pelo médico de família, a avaliação na consulta de género, a prescrição e as análises que se seguem.",
  "about.linkModal.transHealthcare.point.legal.title":
    "Nome legal e menção de género.",
  "about.linkModal.transHealthcare.point.legal.body":
    "O processo da Lei n.º 38/2018 na Conservatória do Registo Civil, o prazo de espera, e a atualização dos documentos depois disso.",
  "about.linkModal.transHealthcare.point.clinicians.title":
    "Profissionais que afirmam quem és.",
  "about.linkModal.transHealthcare.point.clinicians.body":
    "Contactos essenciais, mais o Registo de Preços Solidários para médicos de família e psiquiatras trans-afirmativos.",
  "about.linkModal.transHealthcare.cta": "Lê o guia completo de saúde trans",

  "about.linkModal.guidelinesSpeech.eyebrow": "Diretrizes da comunidade",
  "about.linkModal.guidelinesSpeech.label":
    "Como é moderada a defesa da Palestina",
  "about.linkModal.guidelinesSpeech.title":
    "Um teste, <em>nos dois sentidos.</em>",
  "about.linkModal.guidelinesSpeech.lead":
    "A cláusula das diretrizes que rege o discurso político, e as linhas vermelhas ao lado dela.",
  "about.linkModal.guidelinesSpeech.p1":
    "A defesa da libertação da Palestina é bem-vinda aqui e não será removida por incomodar. Criticar um Estado, o seu governo, o seu exército ou a sua ideologia é discurso político, e a moderação trata-o como discurso político.",
  "about.linkModal.guidelinesSpeech.p2":
    "Passa a ser um assunto do Código de Conduta quando aterra numa pessoa. Responsabilizar uma pessoa membra pelos atos de um Estado por causa da sua etnia, religião ou nacionalidade é discriminação ao abrigo das linhas vermelhas.",
  "about.linkModal.guidelinesSpeech.point.antisemitism.title":
    "O antissemitismo é uma violação.",
  "about.linkModal.guidelinesSpeech.point.antisemitism.body":
    "Incluindo enquadramentos conspirativos, e responsabilizar pessoas membras judias pelos atos de um Estado.",
  "about.linkModal.guidelinesSpeech.point.antiPalestinian.title":
    "O racismo antipalestiniano é uma violação.",
  "about.linkModal.guidelinesSpeech.point.antiPalestinian.body":
    "Incluindo tratar pessoas membras palestinianas ou árabes como suspeitas à partida, e o assédio a qualquer pessoa membra pela sua nacionalidade, etnia ou religião.",
  "about.linkModal.guidelinesSpeech.point.test.title": "Uma pergunta decide.",
  "about.linkModal.guidelinesSpeech.point.test.body":
    "A moderação pergunta se uma publicação é sobre um Estado e a sua conduta, ou sobre uma pessoa e quem ela é. A posição da própria QueerPulse sobre a Palestina deixa essa pergunta intacta.",
  "about.linkModal.guidelinesSpeech.cta": "Lê as diretrizes completas",

  "about.linkModal.governanceAllocations.eyebrow": "Governação e transparência",
  "about.linkModal.governanceAllocations.label":
    "Como são decididas as atribuições",
  "about.linkModal.governanceAllocations.title":
    "O que entra, <em>para onde vai.</em>",
  "about.linkModal.governanceAllocations.lead":
    "As contas são publicadas todos os trimestres, e as decisões que mexem com dinheiro são tomadas às claras.",
  "about.linkModal.governanceAllocations.p1":
    "A QueerPulse é financiada por quem a usa. As receitas e as despesas são publicadas a cada trimestre, linha a linha, sem interesses de investidores e sem metas de crescimento por trás.",
  "about.linkModal.governanceAllocations.p2":
    "Os excedentes trimestrais vão para uma reserva operacional com a meta de três meses de custos de funcionamento. Assim que essa meta é atingida, o excedente adicional vai por inteiro para o fundo comunitário de microfinanciamentos. O capital é redistribuído.",
  "about.linkModal.governanceAllocations.point.partners.title":
    "O dinheiro de parceiros é restrito.",
  "about.linkModal.governanceAllocations.point.partners.body":
    "Está preso a um âmbito nomeado, como o Fundo de Saúde Mental ou os eventos da comunidade, e não traz qualquer influência editorial, de governação ou sobre a plataforma.",
  "about.linkModal.governanceAllocations.point.votes.title":
    "As mudanças de financiamento vão a votação.",
  "about.linkModal.governanceAllocations.point.votes.body":
    "Aceitar financiamento fora das nossas fontes habituais exige uma votação por maioria das pessoas membras. Cada proposta aberta está listada com a sua contagem, e as anteriores continuam visíveis com o resultado.",
  "about.linkModal.governanceAllocations.point.record.title":
    "O registo fica de pé.",
  "about.linkModal.governanceAllocations.point.record.body":
    "Os números de saúde da comunidade, os desfechos de moderação e os recursos são publicados ao lado das contas, todos os trimestres.",
  "about.linkModal.governanceAllocations.cta":
    "Vê a página de governação completa",

  "about.linkModal.migration.eyebrow": "Interseccionalidade",
  "about.linkModal.migration.label": "Raça, migração e a Lisboa queer",
  "about.linkModal.migration.title":
    "Raça, migração e a <em>Lisboa queer.</em>",
  "about.linkModal.migration.lead":
    "A parte do guia de interseccionalidade em que esta posição se apoia.",
  "about.linkModal.migration.p1":
    "Ser uma pessoa queer racializada em Lisboa significa atravessar duas coisas ao mesmo tempo que os espaços dominantes raramente pensam em conjunto. A história colonial de Portugal molda esta cidade de formas visíveis para quem as vive e invisíveis para quem não as vive.",
  "about.linkModal.migration.p2":
    "O guia fala do que é preciso saber ao chegar, do que acontece quando os espaços queer tratam a raça como pormenor, e dos grupos comunitários que existem para pessoas membras QTIPOC.",
  "about.linkModal.migration.point.queerSpaces.title":
    "Quando ser queer não chega.",
  "about.linkModal.migration.point.queerSpaces.body":
    "O que as pessoas membras descrevem sobre o racismo dentro dos espaços queer daqui, e as diretrizes que tornam isso denunciável.",
  "about.linkModal.migration.point.arriving.title": "Chegar a Portugal.",
  "about.linkModal.migration.point.arriving.body":
    "A história colonial, como ela cai sobre pessoas membras brasileiras, dos PALOP e do sul da Ásia, e onde encontrar quem já fez este caminho antes de ti.",
  "about.linkModal.migration.point.cost.title": "O custo como barreira.",
  "about.linkModal.migration.point.cost.body":
    "A subida de custos em Lisboa, o carácter de classe da vida social queer, e as medidas de acesso a que nos obrigamos.",
  "about.linkModal.migration.cta": "Lê o guia completo de interseccionalidade",

  "about.linkModal.sexualHealth.eyebrow": "Saúde sexual",
  "about.linkModal.sexualHealth.label": "Recursos de saúde sexual",
  "about.linkModal.sexualHealth.title":
    "Indetetável = <em>Intransmissível.</em>",
  "about.linkModal.sexualHealth.lead":
    "Testagem, PrEP e recursos sobre VIH em Lisboa, com um diretório de clínicas avaliado pela comunidade.",
  "about.linkModal.sexualHealth.p1":
    "As pessoas que vivem com VIH e estão em tratamento eficaz, com carga viral indetetável, não podem transmitir o VIH sexualmente. Está cientificamente estabelecido e é reconhecido pelo CDC, pela OMS e por mais de 400 organizações de saúde em todo o mundo.",
  "about.linkModal.sexualHealth.p2":
    "O tratamento para o VIH é gratuito para todas as pessoas residentes através do SNS, e 97% de quem está em tratamento em Portugal atinge carga viral indetetável em seis meses.",
  "about.linkModal.sexualHealth.point.testing.title": "Onde fazer o teste.",
  "about.linkModal.sexualHealth.point.testing.body":
    "Clínicas em Lisboa avaliadas pela comunidade, filtráveis por gratuito/SNS, ONG, farmácia e privado, com o que cada uma testa e o que levar.",
  "about.linkModal.sexualHealth.point.prep.title": "PrEP através do SNS.",
  "about.linkModal.sexualHealth.point.prep.body":
    "Gratuita para quem é elegível e mais de 99% eficaz quando tomada corretamente. O guia percorre a avaliação de elegibilidade, as análises e a prescrição.",
  "about.linkModal.sexualHealth.point.living.title": "Viver com VIH.",
  "about.linkModal.sexualHealth.point.living.body":
    "Informação atual, serviços de apoio, e respostas às perguntas que mais medo dá fazer.",
  "about.linkModal.sexualHealth.cta": "Lê o guia completo de saúde sexual",

  "about.linkModal.governanceOverview.eyebrow": "Governação e transparência",
  "about.linkModal.governanceOverview.label": "Como a QueerPulse é governada",
  "about.linkModal.governanceOverview.title":
    "Como gerimos isto, e quem <em>decide.</em>",
  "about.linkModal.governanceOverview.lead":
    "O registo de como a QueerPulse é governada, como as decisões são tomadas, e o que acontece quando algo corre mal.",
  "about.linkModal.governanceOverview.p1":
    "A moderação é feita por uma pequena equipa de pessoas membras que aceitaram esse papel. Respondem perante o conselho consultivo, e qualquer decisão pode ser contestada em 14 dias. É o conselho consultivo que analisa o recurso, e o desfecho é final.",
  "about.linkModal.governanceOverview.p2":
    "As denúncias são analisadas em 48 horas, no próprio dia quando a segurança de alguém está em risco, e os números por trás desse processo são publicados todos os trimestres.",
  "about.linkModal.governanceOverview.point.council.title":
    "O conselho consultivo.",
  "about.linkModal.governanceOverview.point.council.body":
    "Analisa recursos, propõe mudanças na plataforma e serve de camada de responsabilização. Os seus lugares têm mandatos de um ano e podem ser retirados por votação de dois terços da comunidade.",
  "about.linkModal.governanceOverview.point.finances.title":
    "Contas às claras.",
  "about.linkModal.governanceOverview.point.finances.body":
    "Receitas e despesas publicadas trimestralmente, uma reserva operacional com a meta de três meses de custos de funcionamento, e o excedente acima disso encaminhado para microfinanciamentos.",
  "about.linkModal.governanceOverview.point.proposals.title":
    "Propostas e votações.",
  "about.linkModal.governanceOverview.point.proposals.body":
    "A retirada de lugares no conselho e as mudanças de financiamento vão a votação das pessoas membras. Cada proposta continua visível com o seu resultado.",
  "about.linkModal.governanceOverview.cta":
    "Vê a página de governação completa",

  "about.who.eyebrow": "Quem está por trás disto",
  "about.who.title": "Construída pela <em>comunidade, para a comunidade.</em>",
  "about.who.p1":
    "A QueerPulse é gerida por quem a usa: uma pequena equipa fundadora e um círculo crescente de pessoas que ajudam a definir o que vem a seguir.",
  "about.who.p2":
    "Não temos capital de risco à procura de retorno. Temos quotas, doações e apoios que mantêm a plataforma independente.",
  "about.contactStrip.title": "Perguntas? <em>Estamos contactáveis.</em>",
  "about.contactStrip.body":
    "Sem pedidos de suporte perdidos numa fila. Uma pessoa a sério lê o que envias.",
  "about.contactStrip.contactCta": "Contacta-nos",
  "about.contactStrip.governanceCta": "Lê a nossa governação",
  "about.outro.title": "Vem ver <em>com os teus próprios olhos.</em>",
  "about.outro.sub":
    "A melhor forma de perceber a QueerPulse é fazer parte dela.",
  "about.outro.cta": "Pedir um convite",

  // ── Ativismo ───────────────────────────────────────────────────────────
  "activism.backToVolunteer": "Voltar a Voluntariado",
  "activism.meta.title":
    "Ativismo com a QueerPulse: formas de te envolveres em Lisboa",
  "activism.meta.description":
    "Um guia prático de ativismo queer em Lisboa: por onde começar, o que uma competência pode fazer, como mobilizar, e as organizações parceiras que já estão no terreno.",
  "activism.hero.eyebrow": "Ativismo",
  "activism.hero.title": "Cuidar da comunidade é <em>político.</em>",
  "activism.hero.sub":
    "Formas de te envolveres, perto e mais longe: de uma tarde de terça-feira a um compromisso permanente.",
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
    "Aqui tens uma escada. Escolhe o degrau que corresponde ao que tens para dar este mês.",
  "activism.start.step1.title": "Aparece uma vez",
  "activism.start.step1.body":
    "Vai a um convívio, uma vigília, uma reunião comunitária. A presença é o primeiro ato.",
  "activism.start.step2.title": "Dá algumas horas",
  "activism.start.step2.body":
    "Escolhe um turno recorrente: uma linha de apoio, uma tarde de sensibilização, uma banca num evento.",
  "activism.start.step3.title": "Traz uma competência",
  "activism.start.step3.body":
    "Design, código, cozinha, trabalho de cuidado: as organizações precisam de tudo isso, cada competência conta.",
  "activism.start.step4.title": "Compromete-te",
  "activism.start.step4.body":
    "Entra numa direção, lidera uma campanha, orienta alguém mais novo na organização.",
  "activism.local.title": "Localmente, <em>em Lisboa</em>",
  "activism.local.p1":
    "As lutas mais próximas de casa raramente fazem manchete: habitação, acesso a cuidados de saúde, um espaço ameaçado.",
  "activism.local.p2":
    "Neste momento, <b>Mouraria e Intendente</b> são os bairros onde inquilinos queer mais precisam de apoio.",
  "activism.local.banner.title": "Pressão habitacional na Mouraria",
  "activism.local.banner.body":
    "Vários agregados queer enfrentam avisos de não renovação este trimestre. O papel de Defesa da Habitação abaixo é uma resposta direta.",
  "activism.skills.title": "Traz uma <em>competência</em>",
  "activism.skills.p1":
    "Cada organização abaixo precisa de mais do que voluntários com cartazes. Precisa do teu ofício.",
  "activism.skills.design.title": "Design",
  "activism.skills.design.body":
    "Materiais de campanha, zines, sinalética: trabalho visual que faz um argumento chegar.",
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
    "<b>Mobiliza em conjunto.</b> Traz alguém contigo. Os números mudam o que é politicamente possível.",
  "activism.mobilise.p2":
    "<b>Documenta o que vês.</b> Fotografias e notas de uma ação importam mais tarde, para responsabilização e para a história.",
  "activism.mobilise.p3":
    "<b>Continua o trabalho depois da marcha.</b> O trabalho que se segue a uma manifestação é onde acontece a maior parte da mudança real.",
  "activism.feel.title": "Como se <em>sente</em>",
  "activism.feel.p1":
    "O esgotamento é real. Um ativismo que só exige e nunca repõe não é sustentável, nem para ti nem para o movimento.",
  "activism.feel.p2":
    "Está tudo bem em recuar. Está tudo bem em fazer menos do que achas que devias. Descansar faz parte do trabalho.",
  "activism.feel.banner.title": "Se estás perto do esgotamento",
  "activism.feel.banner.body":
    "Fala com o apoio entre pares antes de desapareceres de vez. Recuar com um plano é melhor do que desaparecer sem nenhum.",
  "activism.orgs.title": "Organizações <em>parceiras</em>",
  "activism.orgs.p1":
    "Quatro organizações portuguesas com quem trabalhamos diretamente: todas recebem voluntários de braços abertos.",
  "activism.volunteer.title": "Vagas <em>abertas</em>",
  "activism.volunteer.p1":
    "Oportunidades de voluntariado atuais das nossas organizações parceiras, atualizadas regularmente.",
  "activism.volunteer.seeRoleCta": "Ver a função",
  "activism.volunteer.seeAllCta": "Ver todas as vagas de voluntariado",
  "activism.outro.title": "Escolhe um degrau. <em>Começa hoje.</em>",
  "activism.outro.sub":
    "O Quadro é onde vive cada vaga listada, atualizado à medida que as organizações publicam novas.",
  "activism.outro.seeBoardCta": "Ver o quadro de voluntariado",

  // ── Código de Conduta ──────────────────────────────────────────────────
  "coc.meta.title": "Código de Conduta da QueerPulse: o que é obrigatório",
  "coc.meta.description":
    "O Código de Conduta vinculativo da QueerPulse: seis compromissos que assumes ao aderir, o que conta como dano, como as denúncias são tratadas, e como recorrer.",
  "coc.hero.backLabel": "Governação",
  "coc.hero.eyebrow": "Código de Conduta · em vigor desde {date}",
  "coc.hero.title": "Como nos tratamos, <em>aqui dentro.</em>",
  "coc.hero.dek":
    "Este é o documento vinculativo, <b>de cumprimento obrigatório</b> e aplicado. Se uma denúncia for confirmada, é isto que usamos como referência.",
  "coc.distinction.thisPage.title": "Esta página",
  "coc.distinction.thisPage.body":
    "O <b>Código de Conduta</b>: o que é de cumprimento obrigatório, o que acontece quando é violado, como recorrer.",
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
    "Este Código aplica-se a tudo na QueerPulse (<strong>publicações, mensagens, convívios, comentários, perfis</strong>) e a conduta fora da plataforma quando afeta diretamente a segurança de outra pessoa aqui.",
  "coc.scope.p2":
    "Aplica-se a todas as pessoas, <em>sem exceção</em>, incluindo fundadores, equipa e moderação.",
  "coc.scope.p3":
    "Não se aplica ao próprio desacordo. Estar em erro, ou ser impopular, não é uma violação. <em>Causar dano, é.</em>",
  "coc.pact.title": "§02 O <em>pacto</em>",
  "coc.pact.lead": "Seis compromissos que cada pessoa assume ao entrar.",
  "coc.pact.item01.title": "Mostramo-nos como somos",
  "coc.pact.item01.body":
    "Traz a tua identidade inteira. Ninguém aqui tem de representar uma versão mais palatável de si próprio.",
  "coc.pact.item02.title": "Perguntamos antes de presumir",
  "coc.pact.item02.body":
    "Pronomes, limites, níveis de conforto: confirma, não adivinhes.",
  "coc.pact.item03.title": "Mantemos esta sala privada",
  "coc.pact.item03.body":
    "O que acontece aqui fica aqui, a menos que a pessoa envolvida diga o contrário.",
  "coc.pact.item04.title": "Ocupamos o espaço na medida certa",
  "coc.pact.item04.body":
    "Repara quando estás a dominar uma conversa. Abre espaço para vozes mais discretas.",
  "coc.pact.item05.title": "Reparamos o dano",
  "coc.pact.item05.body":
    "Um pedido de desculpa a sério muda o comportamento. As palavras sozinhas não bastam.",
  "coc.pact.item06.title": "Levamos o dano a quem pode agir",
  "coc.pact.item06.body":
    "Se algo estiver errado, avisa alguém que possa agir.",
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
    "O desconforto não é o mesmo que dano. Olhamos para o que foi realmente dito ou feito.",
  "coc.harm.friction.criticism.lead": "Críticas à plataforma.",
  "coc.harm.friction.criticism.rest":
    "Incluindo críticas a nós, que a gerimos.",
  "coc.harm.friction.politicalViews.lead":
    "Posições políticas que não partilhas.",
  "coc.harm.friction.politicalViews.rest":
    "Desde que não visem a identidade ou a segurança de outra pessoa.",
  "coc.harm.closing":
    "O que conta é o <em>impacto</em>. “Não foi essa a intenção” não anula o dano causado.",
  "coc.enforce.title": "§04 <em>Aplicação</em>",
  "coc.enforce.lead":
    "Uma escada gradual: a maioria das denúncias resolve-se no primeiro ou segundo degrau.",
  "coc.ladder.step1.title": "Uma palavra em privado",
  "coc.ladder.step1.body":
    "Uma pessoa moderadora contacta diretamente, de forma informal, antes de qualquer registo formal.",
  "coc.ladder.step2.title": "Um aviso formal",
  "coc.ladder.step2.body":
    "Documentado, associado à conta. <em>Um aviso mantém-se privado</em>. Não é divulgado.",
  "coc.ladder.step3.title": "Suspensão temporária",
  "coc.ladder.step3.body":
    "Um período de arrefecimento, de dias a semanas, consoante a gravidade.",
  "coc.ladder.step4.title": "Remoção de um espaço",
  "coc.ladder.step4.body":
    "Perda de acesso a um convívio, comunidade ou canal específico, enquanto o resto da plataforma continua aberto.",
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
    "Isto é usado <em>raramente e com cuidado</em>. Nunca é uma licença geral para policiar a vida de alguém fora da plataforma.",
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
    "(Este é um descarregável de protótipo. O ficheiro de produção corresponderá exatamente à página web.)",

  // ── Cookies ────────────────────────────────────────────────────────────
  "cookies.meta.title": "Política de Cookies da QueerPulse e preferências",
  "cookies.meta.description":
    "Todos os cookies que a QueerPulse usa e tudo o que guarda no teu dispositivo, com o nome completo, o que cada um faz e quanto tempo dura. Sem cookies de publicidade nem de análise.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "Tudo o que <em>guardamos,</em> e porquê.",
  "cookies.sub":
    "A lista completa, em linguagem simples: todos os cookies que usamos e tudo o que fica no teu dispositivo. Quatro cookies iniciam a tua sessão e mantêm o site seguro. Uma coisa é opcional, e está desligada até dizeres o contrário.",
  "cookies.essential.title": "Estritamente necessários",
  "cookies.essential.body":
    "Necessários para iniciar a tua sessão e manter a tua conta segura. Sem eles o site não consegue distinguir os teus pedidos dos de outra pessoa, por isso não podem ser desligados.",
  "cookies.functional.title": "As tuas definições, no teu dispositivo",
  "cookies.functional.body":
    "Não são cookies: ficam no teu navegador e nunca nos são enviados. Guardam as escolhas que fizeste e o trabalho que não terminaste, por isso apagá-los faz perder as tuas definições e quaisquer rascunhos por enviar.",
  "cookies.monitoring.title": "Erros e falhas",
  "cookies.monitoring.body":
    "A única coisa que podes desligar, e já começa desligada. Nada é carregado nem guardado até a ativares nas tuas escolhas de privacidade.",
  "cookies.alwaysOn": "Sempre ativo",
  "cookies.optIn": "Desligado até o ativares",
  "cookies.columns.name": "Nome",
  "cookies.columns.storedWhere": "Guardado onde",
  "cookies.columns.expires": "Expira",
  "cookies.noAds.title": "Não temos anúncios",
  "cookies.noAds.body":
    "Por isso não há aqui categoria de publicidade, nem de análise. Nada nesta página traça o teu perfil nem te segue para outro site.",
  "cookies.summary.title": "O teu <em>resumo</em>",
  "cookies.summary.essential": "Cookies que usamos",
  "cookies.summary.functional": "Guardado no teu dispositivo",
  "cookies.summary.monitoring": "Relato de erros",
  "cookies.summary.count_one": "{count} entrada",
  "cookies.summary.count_other": "{count} entradas",
  "cookies.actions.managePreferences": "Gerir preferências",
  "cookies.info":
    "Gere as tuas escolhas de privacidade quando quiseres em <settingsLink>Definições</settingsLink>. Detalhe completo na <privacyLink>Política de Privacidade</privacyLink>.",
  "cookies.outro.title": "Perguntas sobre <em>os teus dados?</em>",
  "cookies.outro.sub":
    "A Política de Privacidade cobre tudo o que os cookies não cobrem.",
  "cookies.outro.cta": "Ler a Política de Privacidade",

  // ── Pedido de dados (DSAR) ─────────────────────────────────────────────
  "dsar.backToPrivacyLabel": "Política de Privacidade",
  "dsar.eyebrow": "Direitos sobre os dados",
  "dsar.h1": "Exerce os teus <em>direitos sobre os dados.</em>",
  "dsar.lead":
    "Ao abrigo do <b>RGPD</b>, podes pedir uma cópia dos teus dados, uma correção, ou a sua eliminação, <em>sem qualquer custo</em>.",
  "dsar.gdprStrip":
    "Este pedido é tratado ao abrigo dos artigos 15.º a 21.º do <b>RGPD</b>.",
  "dsar.rightLabel": "Que direito queres exercer?",
  "dsar.rights.access.label": "Direito de <em>acesso</em>",
  "dsar.rights.access.desc":
    "Obtém uma cópia de tudo o que a QueerPulse guarda sobre ti.",
  "dsar.rights.access.formTitle": "Pedir uma cópia dos teus dados",
  "dsar.rights.access.formSub":
    "Reunimos tudo o que está associado à tua conta e disponibilizamo-lo aqui para descarregares.",
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
    "Isto é diferente de eliminar a conta. Diz-nos exatamente o que queres removido.",
  "dsar.rights.objection.label": "Direito de <em>oposição</em>",
  "dsar.rights.objection.desc":
    "Opõe-te a uma forma específica de usarmos os teus dados, como a monitorização de erros.",
  "dsar.rights.objection.formTitle": "Opor-te a um uso dos teus dados",
  "dsar.rights.objection.formSub":
    "Diz-nos a que processamento te estás a opor.",
  "dsar.artPrefix": "Artigo {number}",
  "dsar.toast.showingForm": "A mostrar o formulário do Artigo {article}",
  "dsar.requestLabel": "Pedido:",
  "dsar.form.accountLabel": "A tua conta",
  "dsar.form.whatChanged.label": "O que precisa de mudar?",
  "dsar.form.whatChanged.helper":
    "Dá o máximo de detalhe possível. Isso acelera a análise.",
  "dsar.form.whatChanged.placeholder":
    "Descreve o que deve ser corrigido, eliminado, ou a que te opões",
  "dsar.form.scopeLabel": "Que dados abrange isto?",
  "dsar.scopes.profile.b": "Perfil",
  "dsar.scopes.profile.s": "Nome, biografia, fotos, pronomes",
  "dsar.scopes.connections.b": "Ligações",
  "dsar.scopes.connections.s": "Avais, convites, a tua rede",
  "dsar.scopes.activity.b": "Atividade",
  "dsar.scopes.activity.s": "Publicações, comentários, confirmações, mensagens",
  "dsar.scopes.membership.b": "Adesão",
  "dsar.scopes.membership.s":
    "O teu escalão, data de entrada, e quem te convidou",
  "dsar.scopes.moderation.b": "Moderação",
  "dsar.scopes.moderation.s":
    "Denúncias que fizeste ou em que foste mencionade",
  "dsar.form.contextLabel": "Mais alguma coisa que devamos saber?",
  "dsar.form.contextPlaceholder": "Contexto adicional para a nossa equipa",
  "dsar.legalStrip":
    "Respondemos no prazo de <b>30 dias</b>, como a lei exige. Vê <link>retenção de dados</link> para saber por quanto tempo guardamos as coisas por norma.",
  "dsar.actions.info":
    "Os pedidos são revistos por uma pessoa da nossa equipa de privacidade, <b>nunca totalmente automatizado</b>.",
  "dsar.actions.submit": "Submeter pedido",
  "dsar.actions.submitting": "A enviar…",
  "dsar.past.heading": "Os teus pedidos anteriores",
  "dsar.past.submitted": "Submetido em {date}",
  "dsar.past.responded": "Respondido em {date}",
  "dsar.past.resolved": "Resolvido",
  "dsar.past.status.received": "Recebido",
  "dsar.past.status.inReview": "Em análise",
  "dsar.past.status.rejected": "Recusado",
  "dsar.past.loading": "A carregar os teus pedidos anteriores…",
  "dsar.past.error":
    "Não foi possível carregar os teus pedidos anteriores. Tenta novamente daqui a pouco.",
  "dsar.past.empty": "Ainda não submeteste nenhum pedido.",
  "dsar.toast.submitted": "Pedido submetido: referência {ref}",
  "dsar.toast.submitError":
    "Não conseguimos registar esse pedido. Nada foi enviado. Importas-te de tentar outra vez?",

  // ── Diretrizes da Comunidade ───────────────────────────────────────────
  "guidelines.meta.title": "Diretrizes da Comunidade QueerPulse",
  "guidelines.meta.description":
    "A cultura que estamos a construir juntes na QueerPulse: como te mostrares, discordares bem, e manteres o espaço seguro, distinto do Código de Conduta de cumprimento obrigatório.",
  "guidelines.hero.eyebrow": "Diretrizes da Comunidade",
  "guidelines.hero.title": "A cultura que estamos a <em>construir juntes.</em>",
  "guidelines.hero.sub":
    "Estas não são regras de cumprimento obrigatório. Isso é o Código de Conduta. Isto é como é o bom aqui.",
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
    "A maior parte do atrito aqui vem de mal-entendidos. Pergunta antes de presumir o pior.",
  "guidelines.clause02.li1":
    "Lê uma mensagem duas vezes antes de reagir a ela.",
  "guidelines.clause02.li2":
    "Faz uma pergunta de clarificação em vez de presumir a intenção.",
  "guidelines.clause02.li3":
    "Dá espaço para alguém formular algo de forma desajeitada.",
  "guidelines.clause02.li4": "Presume que podes estar sem contexto.",
  "guidelines.clause02.li5":
    "Discorda do argumento, e trata a pessoa com respeito.",
  "guidelines.clause02.p2":
    "A boa-fé não é infinita. Comportamento mau repetido deixa de merecer o benefício da dúvida.",
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
  "guidelines.clause05.titlePre": "Repara para além do ",
  "guidelines.clause05.titleEm": "pedido de desculpa",
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
  "guidelines.clause07.reportLead": "Denuncia. Vais ter apoio.",
  "guidelines.clause07.reportBody":
    "Se alguém ultrapassar uma destas linhas, denuncia essa pessoa ou a publicação a partir do menu. A moderação lê todas as denúncias, e nunca ficas com isto sozinhe. Infrações confirmadas levam a um aviso, suspensão ou remoção, e cooperamos com as autoridades quando a segurança de alguém está em risco. Nunca estás a exagerar por denunciar.",
  "guidelines.clause08.titlePre": "O discurso pol\u00edtico ",
  "guidelines.clause08.titleEm": "continua pol\u00edtico",
  "guidelines.clause08.p1":
    "Criticar um Estado, o seu governo, o seu ex\u00e9rcito ou a sua ideologia \u00e9 discurso pol\u00edtico, e \u00e9 assim que o moderamos. Isso inclui a defesa da liberta\u00e7\u00e3o da Palestina, que \u00e9 bem-vinda aqui e n\u00e3o ser\u00e1 removida por incomodar.",
  "guidelines.clause08.p2":
    "Passa a ser um assunto do C\u00f3digo de Conduta quando recai sobre uma pessoa. Responsabilizar algu\u00e9m pelos atos de um Estado por causa da sua etnia, religi\u00e3o ou nacionalidade \u00e9 discrimina\u00e7\u00e3o, e cai nas linhas vermelhas acima. O mesmo vale para a defesa dirigida a uma classe de pessoas membras em vez de a um Estado: criticar um governo \u00e9 discurso pol\u00edtico, fazer campanha para retirar pessoas trans n\u00e3o \u00e9, seja qual for o r\u00f3tulo.",
  "guidelines.clause08.li4":
    "Fazer campanha pela exclus\u00e3o de pessoas trans desta comunidade, seja qual for o vocabul\u00e1rio que use",
  "guidelines.clause08.hardLinesHead":
    "Continua a ser um assunto do C\u00f3digo de Conduta",
  "guidelines.clause08.li1":
    "Antissemitismo, incluindo enquadramentos conspirativos e responsabilizar pessoas judias pelos atos de um Estado",
  "guidelines.clause08.li2":
    "Racismo antipalestiniano, incluindo tratar pessoas palestinianas ou \u00e1rabes como suspeitas \u00e0 partida",
  "guidelines.clause08.li3":
    "Ass\u00e9dio a qualquer pessoa por causa da sua nacionalidade, etnia ou religi\u00e3o",
  "guidelines.clause08.p3Lead":
    "Os dois lados s\u00e3o aplicados da mesma forma.",
  "guidelines.clause08.p3Rest":
    "A modera\u00e7\u00e3o aplica um \u00fanico teste: isto \u00e9 sobre um Estado e a sua conduta, ou sobre uma pessoa e quem ela \u00e9? A posi\u00e7\u00e3o da pr\u00f3pria QueerPulse sobre a Palestina est\u00e1 na p\u00e1gina Sobre, e n\u00e3o altera a forma como uma den\u00fancia \u00e9 tratada.",
  "guidelines.final.p2": "Obrigade por construíres isto connosco.",
  "guidelines.modalDone": "Li tudo, concluir",
  "guidelines.modalScrollHint": "Desliza até ao fim para continuar.",
  "guidelines.outro.title": "Agora já conheces <em>a cultura.</em>",
  "guidelines.outro.sub":
    "O Código de Conduta cobre o que acontece se for violada.",
  "guidelines.outro.backCta": "Voltar ao início",

  // ── Ajuda ──────────────────────────────────────────────────────────────
  "help.meta.title": "Central de ajuda da QueerPulse: convites, segurança",
  "help.meta.description":
    "Respostas às perguntas mais comuns sobre a QueerPulse: como funcionam os convites, gerir a tua conta, confirmações e convívios, denúncias e recursos, e escalões de adesão.",
  "help.hero.eyebrow": "Ajuda",
  "help.hero.title": "Perguntas, <em>respondidas.</em>",
  "help.hero.sub": "Pesquisa abaixo, ou navega por tema.",
  // PRD-271: ver a nota no catálogo EN.
  "help.search.label": "Pesquisa no centro de ajuda",
  "help.search.placeholder": "Pesquisa todas as respostas",
  "help.search.summary_one":
    "1 resposta corresponde a \u201c{query}\u201d, em todos os temas.",
  "help.search.summary_other":
    "{count} respostas correspondem a \u201c{query}\u201d, em todos os temas.",
  "help.search.clear": "Limpar pesquisa",
  "help.search.inCategory": "No tema:",
  "help.search.resultsHead": "Respostas <em>encontradas</em>",
  "help.search.emptyTitle": "Nada aqui corresponde a \u201c{query}\u201d",
  "help.search.emptyBody":
    "Tenta uma palavra mais curta ou outra grafia. Ou fala connosco: uma pessoa real lê todas as mensagens.",
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
    "Configuras o teu perfil e a tua conta fica ativa de imediato: sem período de espera.",
  "help.qa.lisbonOnly.q": "A QueerPulse é só para quem vive em Lisboa?",
  "help.qa.lisbonOnly.a":
    "Os convívios são em Lisboa, mas a adesão em si não está limitada por localização. Muitas pessoas participam à distância pela rede e pela revista.",
  "help.qa.free.q": "A QueerPulse é gratuita?",
  "help.qa.free.a": "Sim, a QueerPulse é gratuita para aderir e usar.",
  "help.qa.changeName.q": "Como mudo o meu nome ou pronomes?",
  "help.qa.changeName.a":
    "Vai a <settingsLink>Definições</settingsLink> e depois a Perfil. As alterações aplicam-se em todo o lado de imediato.",
  "help.qa.privateProfile.q": "Posso tornar o meu perfil privado?",
  "help.qa.privateProfile.a":
    "Sim, em <settingsLink>Definições</settingsLink> e depois Privacidade. Um perfil privado continua visível para as tuas ligações. Só <strong>não aparece na pesquisa nem no diretório público</strong>.",
  "help.qa.unknownSession.q":
    "Não reconheço um dispositivo nas minhas sessões ativas. E agora?",
  "help.qa.unknownSession.a":
    "Termina essa sessão em <sessionsLink>sessões ativas</sessionsLink>. O início de sessão é feito através da Google, por isso revê também a segurança da tua conta Google, já que quem tiver acesso a ela consegue entrar aqui. Depois <contactLink>conta-nos o que aconteceu</contactLink> e ajudamos-te a proteger a tua conta.",
  "help.qa.deleteAccount.q": "Como elimino a minha conta?",
  "help.qa.deleteAccount.a":
    "Em <settingsLink>Definições</settingsLink> e depois Conta, mais abaixo. Isto é permanente. Vê a Política de Privacidade para saber o que fica retido e por quanto tempo.",
  "help.qa.levels.q":
    "O que significam os diferentes níveis de pessoa da comunidade?",
  "help.qa.levels.a":
    "Os níveis refletem há quanto tempo foste avalizade na comunidade e a tua atividade. São um sinal de confiança, sem qualquer barreira de pagamento.",
  "help.qa.rsvp.q": "Como funcionam as confirmações de presença?",
  "help.qa.rsvp.a":
    "Confirma na página do evento através do <calendarLink>calendário</calendarLink> ou do quadro de eventos. <strong>As vagas são limitadas</strong> na maioria dos convívios, por isso confirma cedo.",
  "help.qa.hostGathering.q": "Posso organizar o meu próprio convívio?",
  "help.qa.hostGathering.a":
    "Sim, vê o <hostLink>guia de organização</hostLink> para um passo a passo completo.",
  "help.qa.cantMakeIt.q":
    "Confirmei presença mas afinal não posso ir. O que faço?",
  "help.qa.cantMakeIt.a":
    "Cancela a tua confirmação na página do evento assim que souberes, para que alguém na lista de espera possa ficar com o teu lugar.",
  "help.qa.waitlist.q": "Como funciona a lista de espera?",
  "help.qa.waitlist.a":
    "És avisade automaticamente assim que surge uma vaga, com uma janela curta para a garantires antes de passar para a pessoa seguinte.",
  "help.qa.reportMember.q": "Como denuncio outra pessoa da comunidade?",
  "help.qa.reportMember.a":
    "No perfil da pessoa, numa publicação ou numa mensagem, usa a opção de denúncia. Toda a denúncia vai para uma pessoa moderadora.",
  "help.qa.afterReport.q": "O que acontece depois de eu fazer uma denúncia?",
  "help.qa.afterReport.a":
    "Procuramos responder em 48 horas. <strong>Tens sempre resposta</strong>, mesmo que decidamos que não é necessária qualquer ação.",
  "help.qa.appeal.q": "Posso recorrer de uma decisão de moderação?",
  "help.qa.appeal.a":
    "Sim, toda a decisão pode ser contestada uma vez, revista por uma pessoa moderadora diferente. Vê <governanceLink>Governação</governanceLink> para o processo completo.",
  "help.qa.blockMute.q": "Qual a diferença entre bloquear e silenciar?",
  "help.qa.blockMute.a":
    "<strong>Bloquear</strong> remove todo o contacto nos dois sentidos. <strong>Silenciar</strong> só esconde alguém do teu feed. A outra pessoa não sabe que aconteceu nenhum dos dois.",
  "help.qa.invitesWork.q": "Quantos convites tenho?",
  "help.qa.invitesWork.a":
    "Cada pessoa começa com uma pequena reserva de convites que se renova com o tempo, consoante o crescimento da comunidade.",
  "help.qa.vouching.q": "O que significa avalizar alguém, na prática?",
  "help.qa.vouching.a":
    "Quando avalizas alguém, estás a dizer à comunidade que confias que essa pessoa deve estar aqui. É um sinal real, com peso.",
  "help.qa.perks.q": "O que ganho como Apoiante?",
  "help.qa.perks.a":
    "Acesso antecipado a eventos, um distintivo de apoiante, e a certeza de que a tua adesão mantém a plataforma sem anúncios.",
  "help.qa.emailNotifications.q": "Como controlo as notificações?",
  "help.qa.emailNotifications.a":
    "Em <settingsLink>Definições</settingsLink> e depois Notificações, ativa ou desativa cada categoria em separado. A QueerPulse avisa-te dentro da aplicação e, se autorizares, por push. Não envia email.",
  "help.qa.browserSupport.q": "Que navegadores é que a QueerPulse suporta?",
  "help.qa.browserSupport.a":
    "Versões atuais do Chrome, Firefox, Safari e Edge. Navegadores mais antigos podem ter problemas de visualização.",
  "help.qa.somethingBroken.q": "Alguma coisa está avariada. O que faço?",
  "help.qa.somethingBroken.a":
    "Tenta atualizar a página primeiro. Se continuar, <contactLink>avisa-nos</contactLink> com o máximo de detalhe possível.",
  "help.stillStuck.title": "Continuas com dúvidas?",
  "help.stillStuck.body":
    "Uma pessoa a sério lê todas as mensagens que chegam por aqui.",
  "help.stillStuck.cta": "Contacta-nos",

  // ── Chrome partilhado (Termos / Privacidade) ──────────────────────────
  "legal.eyebrow": "Legal",
  "legal.plainSummaryTitle": "Em linguagem simples",
  "legal.toc.title": "Índice",
  "legal.contact.emailCta": "Envia-nos um email",
  "legal.viewFullPage": "Ver a página completa da política",

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
    "As organizações com quem a QueerPulse faz parceria em Portugal e mais além, cada uma avaliada quanto ao alinhamento antes de ser listada. Ninguém paga para aparecer aqui.",
  "partners.hero.eyebrow": "Parceiros",
  "partners.hero.title": "Organizações com quem <em>estamos.</em>",
  "partners.hero.sub":
    "Parceiros avaliados em Portugal e mais além, a trabalhar lado a lado com a QueerPulse no terreno.",
  "partners.section.title": "Os nossos <em>parceiros</em>",
  "partners.section.sub":
    "Ainda não há filtro disponível. Aqui está a lista completa.",
  "partners.card.viewCta": "Ver perfil",
  "partners.empty.title": "Ainda não há parceiros listados",
  "partners.empty.body":
    "Estamos a construir a lista. Se a tua organização trabalha connosco no terreno, candidata-te e avaliamos o alinhamento antes de a listar aqui.",
  "partners.loadingMore": "A carregar mais parceiros…",
  "partners.loadMoreCta": "Carregar mais parceiros",
  "partners.why.title": "Porque fazemos <em>parcerias</em>",
  "partners.why.p1": "Há coisas maiores do que a QueerPulse.",
  "partners.why.p2":
    "Apoio jurídico, saúde, trabalho com jovens e outros serviços especializados são melhor tratados por organizações com experiência para os fazer bem. Preferimos ligar-te a pessoas que conhecemos e em quem confiamos a mandar-te procurar por ti.",
  "partners.why.p3":
    "Quando fazemos parceria com uma organização, queremos que a relação seja nos dois sentidos. Encaminhamentos, pessoas voluntárias, recursos partilhados e, por vezes, financiamento ajudam a transformar uma listagem em algo mais útil.",
  "partners.become.title": "Queres <em>ser nosso parceiro?</em>",
  "partners.become.body":
    "Se a tua organização faz um trabalho alinhado em Lisboa ou arredores, gostaríamos de saber de ti.",
  "partners.become.applyCta": "Candidatar como parceiro",
  "partners.become.contactCta": "Fala connosco primeiro",
  "partners.outro.title":
    "Conheces uma organização que <em>devia estar aqui?</em>",
  "partners.outro.sub":
    "Diz-nos. Estamos sempre à procura de parceiros alinhados.",

  // ── Kit de Imprensa ────────────────────────────────────────────────────
  "pressKit.meta.title": "Kit de imprensa da QueerPulse: logótipos, factos",
  "pressKit.meta.description":
    "Tudo o que uma pessoa jornalista precisa para escrever sobre a QueerPulse: texto institucional já autorizado, marcas, factos-chave e um contacto direto.",
  "pressKit.hero.eyebrow": "Imprensa",
  "pressKit.hero.title":
    "Tudo o que precisas para <em>escrever sobre nós.</em>",
  "pressKit.hero.dek":
    "Texto institucional, marcas, cor e factos, <b>já autorizados</b> para uso direto, sem necessidade de aprovação.",
  "pressKit.hero.downloadKitCta": "Descarregar o kit completo",
  "pressKit.hero.askPersonCta": "Falar com uma pessoa",
  "pressKit.contact.deskLabel": "<b>Contacto de imprensa:</b>",
  "pressKit.contact.phoneLabel": "<b>Por telefone</b>, a pedido",
  "pressKit.contact.responseLabel": "Respondemos em <b>48 horas</b>",
  "pressKit.contact.languagesLabel": "<b>PT / EN</b>",
  "pressKit.contact.email": "hello@queerpulse.com",
  "pressKit.footerNote.licence":
    "Todos os materiais aqui são disponibilizados sob licença <a>CC BY 4.0</a> para uso editorial.",
  "pressKit.footerNote.commercial":
    "Para uso comercial, <a>contacta-nos</a> primeiro.",
  "pressKit.outro.title": "Precisas de <em>algo específico?</em>",
  "pressKit.outro.sub":
    "Contacta diretamente o gabinete de imprensa: a maioria dos pedidos tem resposta no mesmo dia.",
  "pressKit.outro.askCta": "Fala com a redação de imprensa",
  "pressKit.downloadModal.eyebrow": "Kit completo · ZIP",
  "pressKit.downloadModal.title": "Descarrega o <em>kit completo.</em>",
  "pressKit.downloadModal.lead":
    "Todos os materiais de marca desta página num só arquivo, <b>com um leia-me e a licença</b>, pronto para o teu CMS.",
  "pressKit.downloadModal.buttonLabel": "Descarregar · ZIP",
  "pressKit.subpageIndex.title": "Relacionado",
  "pressKit.subpageIndex.archive.label": "Arquivo de imprensa",
  "pressKit.subpageIndex.archive.blurb":
    "Todas as menções e reportagens anteriores, num só lugar.",
  "pressKit.modal.dialogAriaLabel": "Descarregar material",
  "pressKit.modal.closeAriaLabel": "Fechar",
  "pressKit.modal.success.title": "Descarregado. <em>Está tudo pronto.</em>",
  "pressKit.modal.success.body":
    "O ficheiro <b>{filename}</b> já deve estar na tua pasta de transferências.",
  "pressKit.modal.closeCta": "Fechar",
  "pressKit.modal.cancelCta": "Cancelar",
  "pressKit.preview.readme.title": "Leia-me + licença",
  "pressKit.preview.readme.desc": "Termos de utilização e índice de ficheiros",
  "pressKit.preview.marks.title": "Marca · SVG",
  "pressKit.preview.marks.desc": "A cores e monocromática, vetorial",
  "pressKit.preview.marksPng.title": "Logótipo · PNG",
  "pressKit.preview.marksPng.desc": "Três variantes, 2048 px de largura",
  "pressKit.preview.appIcon.title": "Ícone da app · PNG",
  "pressKit.preview.appIcon.desc":
    "512 px, tal como fica instalado nos dispositivos",
  "pressKit.preview.brandReference.title": "Referência de cor e tipografia",
  "pressKit.preview.brandReference.desc":
    "PDF pronto a imprimir, tirado dos tokens de design",
  "pressKit.preview.colour.title": "Cores da marca",
  "pressKit.preview.colour.desc": "Todos os valores hex e RGB em texto simples",
  "pressKit.boiler.short.wc": "25 palavras · 210 carateres",
  "pressKit.boiler.short.text":
    "A QueerPulse é uma plataforma comunitária queer pequena e por convite, com raízes em Lisboa, a ligar profissionais, criativos, ativistas e pessoas da comunidade para trabalho, comunidade, cultura e entreajuda.",
  "pressKit.boiler.med.wc": "60 palavras · 424 carateres",
  "pressKit.boiler.med.text":
    "A QueerPulse é uma plataforma comunitária queer pequena e por convite, com raízes em Lisboa, fundada em 2024 por profissionais, organizadores e artistas a construir uma alternativa às redes que prendem a atenção: sem publicidade, sem algoritmo. Cada pessoa é avalizada por alguém que já está cá. Sem capital de risco por trás, a plataforma vive de mensalidades, doações e apoios, e publica uma revista para a sua comunidade.",

  // ── Explicador de Comunidades ──────────────────────────────────────────
  "communitiesAbout.meta.title": "Como funcionam as comunidades no QueerPulse",
  "communitiesAbout.hero.eyebrow": "Comunidades",
  "communitiesAbout.hero.title":
    "Como funcionam as comunidades, e porque <em>importam</em>",
  "communitiesAbout.hero.sub":
    "A comunidade é a espinha dorsal da vida queer. Cuidamos uns dos outros, e isso só funciona quando aparecemos juntos. Eis como encontrar a tua, em três passos.",
  "communitiesAbout.how.find.title": "Encontra a tua gente",
  "communitiesAbout.how.find.body":
    "Explora comunidades por interesse, cena ou bairro até uma parecer tua.",
  "communitiesAbout.how.welcome.title": "Recebe boas-vindas a sério",
  "communitiesAbout.how.welcome.body":
    "Quem a organiza diz olá e mostra-te tudo, para nunca começares do nada.",
  "communitiesAbout.how.belong.title": "Aparece e pertence",
  "communitiesAbout.how.belong.body":
    "Entra na conversa, vai aos convívios e torna-te uma cara que as pessoas gostam de ver.",
  "communitiesAbout.outro.title": "A tua gente já está aqui.",
  "communitiesAbout.outro.sub":
    "Pede um convite e mostramos-te as comunidades que parecem casa.",

  // ── Política de Privacidade ────────────────────────────────────────────
  "privacy.meta.title":
    "Política de Privacidade da QueerPulse: o que recolhemos e porquê",
  "privacy.meta.description":
    "Que dados a QueerPulse recolhe, como são usados, quem os pode ver, por quanto tempo são guardados, e como exercer os teus direitos sobre dados, com um resumo em linguagem simples.",
  "privacy.title": "Política de <em>Privacidade</em>",
  "privacy.meta.effective": "Em vigor desde {date}",
  "privacy.meta.lastUpdated": "Última atualização em {date}",
  "privacy.meta.version": "Versão {version}",
  "privacy.plain.text":
    "Recolhemos o que precisamos para gerir a plataforma, nunca vendemos os teus dados, e damos-te controlo real sobre o que é partilhado e com quem. Os detalhes estão abaixo.",
  "privacy.contactCta":
    "Perguntas sobre esta política? <strong>Contacta-nos quando quiseres</strong>. Respondemos em linguagem simples.",
  "privacy.related.title": "Relacionado",
  "privacy.related.dataRequestLabel": "Pedir os teus dados",
  "privacy.related.dataRequestBlurb":
    "Acede, corrige ou elimina os teus dados pessoais ao abrigo do RGPD.",
  "privacy.whoWeAre.title": "Quem somos",
  "privacy.whoWeAre.p1":
    "A QueerPulse é mantida por um grupo de voluntários que constroem e cuidam do queerpulse.com. Ainda não existe nenhuma empresa ou organização registada por trás dela. Esta política explica como tratamos os teus dados pessoais em toda a plataforma.",
  "privacy.whoWeAre.p2":
    "Se algo aqui não estiver claro, contacta-nos diretamente. Preferimos explicar a deixar-te adivinhar.",
  "privacy.whatWeCollect.title": "O que recolhemos",
  "privacy.whatWeCollect.accountHeading": "Informação da conta",
  "privacy.whatWeCollect.account.item1":
    "<strong>Detalhes do perfil</strong> que adicionas: nome, pronomes, descrição, biografia, fotos.",
  "privacy.whatWeCollect.account.item2":
    "<strong>Informação de contacto</strong>: o teu email, que vem da tua conta Google e serve para iniciares sessão. A QueerPulse não envia email.",
  "privacy.whatWeCollect.account.item3":
    "<strong>Dados de adesão</strong>: o teu escalão, data de entrada, quem te convidou e quem te avalizou.",
  "privacy.whatWeCollect.signInHeading": "Como inicias sessão",
  "privacy.whatWeCollect.signInBody":
    "Inicias sessão com o <strong>Google</strong>. Não há uma palavra-passe QueerPulse separada para gerir. Quando o fazes, o Google partilha connosco o teu nome, email e foto de perfil. Nunca vemos nem guardamos a tua palavra-passe do Google.",
  "privacy.whatWeCollect.deviceHeading": "Dados de dispositivo e técnicos",
  "privacy.whatWeCollect.device.item1":
    "<strong>O navegador e o dispositivo</strong> a partir dos quais inicias sessão, guardados com as tuas sessões ativas para as poderes ver e terminar à distância.",
  "privacy.whatWeCollect.device.item2":
    "<strong>Detalhes das notificações push</strong>: se ativares as notificações, o endereço que o teu navegador nos dá e as suas chaves, para as podermos entregar. Podes desativar quando quiseres.",
  "privacy.whatWeCollect.device.item3":
    "<strong>O teu endereço IP</strong>, usado apenas no momento para manter a plataforma segura e prevenir abusos. Não é guardado associado à tua conta.",
  "privacy.whatWeCollect.activityHeading": "Dados de atividade",
  "privacy.whatWeCollect.activity.item1":
    "<strong>Publicações, comentários e mensagens</strong> que envias na plataforma.",
  "privacy.whatWeCollect.activity.item2":
    "<strong>O que faz o chat funcionar</strong>: quem está numa conversa, confirmações de entrega e de leitura, reações, e quem bloqueaste. Quem está a escrever e quem está online não é guardado, existe apenas em tempo real.",
  "privacy.whatWeCollect.activity.item3":
    "<strong>Confirmações e presenças em eventos</strong>, para os convívios poderem planear-se conforme o número de pessoas.",
  "privacy.whatWeCollect.activity.item4":
    "<strong>Uma localização geral</strong> que escolheres adicionar, uma cidade ou zona, e a área do mapa que exploras no diretório. Nunca lemos a localização precisa do teu dispositivo.",
  "privacy.whatWeCollect.notCollectedHeading": "O que não recolhemos",
  "privacy.whatWeCollect.notCollectedBody":
    "Não fazemos análise de produto nem rastreio de comportamento, não te seguimos noutros sites, não vendemos dados a anunciantes, nem construímos um perfil publicitário sobre ti. Não há aqui rede publicitária para alimentar.",
  "privacy.sensitive.title": "A tua identidade, nos teus termos",
  "privacy.sensitive.p1":
    "Parte do que partilhas aqui é sensível por natureza: os teus pronomes, identidade de género, orientação sexual, se és uma pessoa assumida no trabalho, o apoio que procuras. Tratamo-lo com o cuidado que merece.",
  "privacy.sensitive.p2":
    "<strong>És tu que decides o que é visível.</strong> Grande parte disto fica privada para ti por predefinição. Escolhes o que aparece no teu perfil público e o que fica visível apenas para ti. Quando a lei chama a isto dados de categoria especial, só os tratamos porque escolheste partilhá-los com a tua comunidade.",
  "privacy.sensitive.p3":
    "Os perfis criativos podem conter mais: os dados de nascimento de um perfil de astrologia, o contacto de um serviço de apoio entre pares ou de terapia. Aplica-se a mesma regra: está lá porque o adicionaste, visível exatamente como o definiste, e teu para alterar ou remover quando quiseres.",
  "privacy.sensitive.p4":
    "<strong>As fotos são limpas antes de serem enviadas.</strong> Os metadados de localização e de câmara são removidos das imagens no teu dispositivo, para que uma foto não revele em silêncio onde estiveste.",
  "privacy.howWeUse.title": "Como usamos os dados",
  "privacy.howWeUse.intro": "Os teus dados só são usados para:",
  "privacy.howWeUse.item1": "Gerir a tua conta e manter a tua sessão segura",
  "privacy.howWeUse.item2":
    "Mostrar-te convívios, comunidades e conteúdo relevantes para ti",
  "privacy.howWeUse.item3":
    "Entregar as tuas mensagens, notificações e as ligações que crias",
  "privacy.howWeUse.item4":
    "Manter a plataforma segura: investigar denúncias, aplicar o Código de Conduta",
  "privacy.howWeUse.item5":
    "Enviar-te as notificações na aplicação e push que ativaste",
  "privacy.howWeUse.item6":
    "Resolver problemas e manter a plataforma fiável, com o teu consentimento, através de monitorização de erros que respeita a privacidade",
  "privacy.howWeUse.p1":
    "Nunca vendemos os teus dados, nem os usamos para treinar modelos de IA ou para os entregar a anunciantes.",
  "privacy.whoSees.title": "Quem vê os teus dados",
  "privacy.whoSees.p1":
    "<strong>Outras pessoas da comunidade</strong> veem o que as tuas definições de privacidade permitirem: o teu perfil público, publicações, e o que escolheres partilhar.",
  "privacy.whoSees.p2":
    "<strong>A nossa pequena equipa</strong> pode aceder a dados da conta para dar apoio, investigar denúncias e manter a plataforma a funcionar.",
  "privacy.whoSees.p3":
    "<strong>Fornecedores de serviços</strong>, as empresas que alojam a plataforma, guardam os teus envios, colocam moradas num mapa e (com o teu consentimento) monitorizam erros, veem só o necessário para a sua função específica.",
  "privacy.whoSees.p4":
    "<strong>Mais ninguém.</strong> Nunca vendemos nem alugamos os teus dados a terceiros.",
  "privacy.retention.title": "Por quanto tempo guardamos",
  "privacy.retention.p1":
    "O teu perfil, as tuas mensagens, as tuas publicações, as tuas ligações e os teus envios são guardados enquanto a tua conta estiver aberta. As tuas confirmações de presença também, para que um convívio a que foste continue no teu histórico e quem o organizou mantenha a sua contagem. O que desaparece sozinho são os detalhes de presença listados abaixo.",
  "privacy.retention.clearsHeading": "Coisas que desaparecem sozinhas",
  "privacy.retention.p3":
    "Estas acontecem automaticamente, faças alguma coisa ou não:",
  "privacy.retention.clears.gathering":
    "<strong>O que disseste a quem organiza sobre necessidades de acesso ou alimentares, e o registo de que fizeste check-in</strong>: 30 dias depois do convívio. A tua confirmação de presença em si permanece, para que os convívios passados mantenham a sua contagem.",
  "privacy.retention.clears.notifications":
    "<strong>Notificações lidas</strong>: 90 dias. As não lidas ficam até as veres.",
  "privacy.retention.clears.push":
    "<strong>Registos de notificações push não usados</strong>: 90 dias.",
  "privacy.retention.clears.cardVerification":
    "<strong>Registos de verificação de cartão</strong>: 90 dias.",
  "privacy.retention.clears.export":
    "<strong>Uma exportação de dados que pediste</strong>: a ligação de descarga funciona durante 7 dias, e a cópia é eliminada ao fim de 30.",
  "privacy.retention.clears.sessions":
    "<strong>Sessões</strong>: 30 dias depois de terminares sessão ou de expirarem.",
  "privacy.retention.clears.invites":
    "<strong>Convites que envias</strong>: 7 dias, depois expiram.",
  "privacy.retention.clears.housing":
    "<strong>Anúncios de alojamento</strong>: deixam de aparecer nas pesquisas ao fim de 60 dias. Nunca são eliminados, e podes prolongar ou voltar a publicar.",
  "privacy.retention.deleteHeading": "Se eliminares a tua conta",
  "privacy.retention.p2":
    "Eliminar a tua conta abre um período de tolerância de 30 dias, e podes cancelar a qualquer momento dentro dele bastando iniciar sessão outra vez. Avisamos-te 3 dias antes do prazo. Depois disso, a tua conta e os dados a ela associados são apagados de forma permanente, incluindo os ficheiros que enviaste.",
  "privacy.retention.deleted.keptIntro":
    "Três coisas são deliberadamente mantidas:",
  "privacy.retention.deleted.keptModeration":
    "<strong>Os registos de moderação</strong> permanecem, com o teu nome removido, para que eliminar uma conta não possa apagar o registo das denúncias que fizeste sobre outras pessoas.",
  "privacy.retention.deleted.keptContent":
    "<strong>Conteúdo de que outras pessoas dependem</strong> permanece, como um convívio que estavas a organizar ou um anúncio que publicaste, com o teu nome removido.",
  "privacy.retention.beyondHeading": "O que guardamos para além da tua conta",
  "privacy.retention.beyond.body":
    "Os registos de moderação, os registos de consentimento e os registos dos pedidos de dados que fizeste são guardados como prova, com o teu nome removido sempre que é possível.",
  "privacy.retention.p4":
    "Quando uma conta é eliminada, guardamos uma <strong>impressão unidirecional</strong> do email, que nunca pode voltar a ser o endereço em si, apenas para impedir que uma conta removida seja recriada em silêncio.",
  "privacy.yourRights.title": "Os teus direitos",
  "privacy.yourRights.intro": "Ao abrigo do RGPD, tens direito a:",
  "privacy.yourRights.item1":
    "<strong>Acesso</strong>: obter uma cópia de tudo o que guardamos sobre ti",
  "privacy.yourRights.item2":
    "<strong>Retificação</strong>: corrigir o que estiver errado",
  "privacy.yourRights.item3":
    "<strong>Apagamento</strong>: pedir-nos para eliminar os teus dados",
  "privacy.yourRights.item4":
    "<strong>Oposição</strong>: opor-te a um uso específico dos teus dados",
  "privacy.yourRights.item5":
    "<strong>Portabilidade</strong>: receber os teus dados num formato portátil",
  "privacy.yourRights.item6":
    "<strong>Limitação</strong>: limitar como processamos os teus dados enquanto um litígio é resolvido",
  "privacy.yourRights.item7":
    "<strong>Retirar o consentimento</strong>: desativar aquilo em que tenhas consentido",
  "privacy.yourRights.howHeading": "Como exercer cada um",
  "privacy.yourRights.how.access":
    "<strong>Acesso</strong>: descarrega os teus dados nas Definições, ou apresenta um pedido através do formulário.",
  "privacy.yourRights.how.rectification":
    "<strong>Retificação</strong>: edita o teu próprio perfil, ou apresenta um pedido para o que não conseguires editar.",
  "privacy.yourRights.how.erasure":
    "<strong>Apagamento</strong>: elimina a tua conta nas Definições, ou apresenta um pedido para remover dados específicos.",
  "privacy.yourRights.how.objection":
    "<strong>Oposição</strong>: apresenta um pedido através do formulário. Para te opores à monitorização de erros, desativa-a nas tuas definições de privacidade.",
  "privacy.yourRights.how.portability":
    "<strong>Portabilidade</strong>: descarrega os teus dados nas Definições. Vêm em JSON, ou num zip de ficheiros CSV com os teus envios.",
  "privacy.yourRights.how.restriction":
    "<strong>Limitação</strong>: apresenta um pedido através do formulário e descreve o que queres limitar.",
  "privacy.yourRights.how.withdrawConsent":
    "<strong>Retirar o consentimento</strong>: desativa onde ativaste. As tuas definições de privacidade para a monitorização de erros, o teu perfil de partilha de casa para os campos de identidade, o teu navegador para as notificações push.",
  "privacy.yourRights.p1":
    "Para exerceres qualquer um destes direitos, usa o nosso formulário de pedido de dados. É gratuito e respondemos no prazo de 30 dias.",
  "privacy.yourRights.slaExtension":
    "Se um pedido for invulgarmente complexo, podemos precisar de mais tempo, e dizemos-te porquê dentro do primeiro mês.",
  "privacy.yourRights.responseChannel":
    "Um pedido resolvido chega como notificação na aplicação, com uma nota sobre o resultado. Nada é enviado por email.",
  "privacy.yourRights.p2":
    "Também podes apresentar uma reclamação junto da Comissão Nacional de Proteção de Dados (CNPD), a autoridade portuguesa de proteção de dados.",
  "privacy.cookiesSection.title": "Cookies",
  "privacy.cookiesSection.p1":
    "Usamos um pequeno número de cookies para te manter com sessão iniciada e lembrar as tuas preferências: tema, idioma e escolhas de notificações.",
  "privacy.cookiesSection.p2":
    "Não usamos cookies de publicidade nem de rastreio entre sites, e não fazemos análise de produto. Não há aqui rede publicitária para alimentar.",
  "privacy.cookiesSection.p3":
    "Consulta a <strong>Política de Cookies</strong> completa para a lista integral, e <em>gere as tuas preferências</em> quando quiseres.",
  "privacy.thirdParties.title": "Terceiros",
  "privacy.thirdParties.intro":
    "Trabalhamos com um pequeno número de fornecedores de serviços. Cada um vê apenas o que precisa para a função que desempenha:",
  "privacy.thirdParties.google":
    "<strong>Google</strong>: dá suporte ao Iniciar sessão com o Google, o nosso único método de acesso. O Google confirma quem és e partilha o teu nome, email e foto de perfil.",
  "privacy.thirdParties.railway":
    "<strong>Railway</strong>: aloja a plataforma e a base de dados onde fica guardado tudo o que publicas.",
  "privacy.thirdParties.tigris":
    "<strong>Tigris</strong>: guarda os ficheiros que envias, num espaço privado, acedido através do serviço de buckets da Railway.",
  "privacy.thirdParties.vercel":
    "<strong>Vercel</strong>: serve o site da QueerPulse ao teu navegador.",
  "privacy.thirdParties.openFreeMap":
    "<strong>OpenFreeMap</strong>: fornece os mosaicos de mapa que vês. É o teu navegador que os vai buscar, por isso o OpenFreeMap vê a área do mapa em visualização.",
  "privacy.thirdParties.openStreetMap":
    "<strong>OpenStreetMap</strong>: transforma uma morada escrita num ponto no mapa. Enviamos a morada a partir do nosso próprio servidor, por isso o OpenStreetMap nunca vê quem perguntou.",
  "privacy.thirdParties.googleMaps":
    "<strong>Google Maps</strong>: quando colas uma ligação do Google Maps num anúncio, seguimo-la a partir do nosso servidor para ler a localização.",
  "privacy.thirdParties.klipy":
    "<strong>Klipy</strong>: dá suporte à pesquisa de GIFs nas mensagens. Quando pesquisas um GIF, o teu termo de pesquisa chega ao Klipy; as tuas mensagens nunca.",
  "privacy.thirdParties.pushService":
    "<strong>O serviço de push do teu navegador</strong>: Google, Mozilla, Apple ou Microsoft, consoante o navegador. Entrega as notificações push que ativaste, e recebe apenas a notificação cifrada.",
  "privacy.thirdParties.embeds":
    "Alguns anúncios de alojamento incluem uma visita virtual alojada no YouTube ou no Matterport. Abrir uma dessas visitas carrega-a a partir dos servidores dessa empresa, o que significa que veem o teu endereço IP. Mais nada sobre ti é partilhado com elas.",
  "privacy.thirdParties.optInIntro":
    "Com o teu <strong>consentimento explícito</strong>, também usamos:",
  "privacy.thirdParties.optItem1":
    "<strong>Sentry</strong>: monitorização de erros. Nada é enviado a menos que a ativies. Não recebe dados publicitários nem constrói qualquer perfil sobre ti.",
  "privacy.thirdParties.transfersLabel": "Por confirmar",
  "privacy.thirdParties.transfers":
    "Onde cada um destes fornecedores trata os dados, e a salvaguarda que cobre o que for tratado fora do Espaço Económico Europeu, tem de ser preenchido aqui por uma pessoa que o tenha confirmado com cada fornecedor. Preferimos deixar isto em aberto a publicar uma localização que não verificámos.",
  "privacy.thirdParties.outro":
    "Nunca partilhamos os teus dados com corretores de dados nem redes publicitárias.",
  "privacy.changes.title": "Alterações a esta política",
  "privacy.changes.p1":
    "Avisamos as pessoas da comunidade sobre alterações relevantes através de um aviso na aplicação, antes de entrarem em vigor.",
  "privacy.changes.p2":
    "Clarificações menores podem ser publicadas sem aviso prévio. O número de versão e a data no topo desta página refletem sempre o texto atual.",
  "privacy.contactSection.title": "Contacto",
  "privacy.contactSection.body":
    "Perguntas sobre esta política ou sobre os teus dados? Envia um email para <a>hello@queerpulse.com</a> e uma pessoa a sério responde.",

  // ── Termos de Serviço ──────────────────────────────────────────────────
  "terms.meta.title": "Termos de Serviço da QueerPulse",
  "terms.meta.description":
    "As regras para usar a QueerPulse: elegibilidade, conduta na conta, propriedade de conteúdo, participação em eventos, e o que acontece se os termos forem violados.",
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
  "terms.eligibility.why":
    "É só para adultos por uma razão: muito do que acontece aqui (conversas francas sobre sexo e saúde sexual, encontros e vida noturna, e o tipo de conversa sem filtros que só é seguro entre adultos) não é adequado a menores, e misturar as duas coisas poria em risco a segurança de todos. Quem tem menos de 18 anos também merece comunidade queer; só que esta ainda não é a sala certa para isso.",
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
    "Aplicam-se termos adicionais a propostas para a revista e submissões criativas. Vê as diretrizes de submissão quando propuseres algo.",
  "terms.events.title": "Convívios e eventos",
  "terms.events.p1":
    "Os convívios são organizados por pessoas da comunidade e pela QueerPulse; cada um tem os seus próprios termos de presença e cancelamento, indicados na página do evento.",
  "terms.events.p2":
    "Os preços dos bilhetes em eventos de escala progressiva são definidos por quem organiza, dentro dos escalões exigidos pela plataforma. A QueerPulse não fica com nenhuma percentagem da receita dos bilhetes.",
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
    "Avisamos as pessoas da comunidade sobre alterações relevantes através de um aviso na aplicação, antes de entrarem em vigor.",
  "terms.changesTerms.p2":
    "Continuar a usar a QueerPulse depois de as alterações entrarem em vigor significa que aceitas os termos atualizados.",
  "terms.law.title": "Lei aplicável",
  "terms.law.p1": "Estes termos regem-se pela lei portuguesa.",
  "terms.law.p2":
    "Quaisquer litígios serão resolvidos nos tribunais de Lisboa, Portugal, salvo se a lei local de proteção do consumidor exigir o contrário.",
  "terms.contactSection.title": "Contacto",
  "terms.contactSection.body":
    "Perguntas sobre estes termos? Envia um email para <a>hello@queerpulse.com</a> e uma pessoa a sério responde.",

  // ── Informação legal / Imprint ────────────────────────────────────────
  // A QueerPulse é mantida por voluntários e ainda não tem entidade legal
  // registada. Quando isso mudar, acrescenta aqui os dados de registo confirmados.
  "imprint.meta.title": "Informação legal · QueerPulse",
  "imprint.meta.description":
    "Quem gere a QueerPulse: os voluntários por trás da plataforma, como falar com uma pessoa a sério, e a lei que nos rege.",
  "imprint.meta.lastReviewed": "Revisto pela última vez a 1 de junho de 2026",
  "imprint.title": "Informação <em>legal</em>",
  "imprint.plain.text":
    "A versão simples: a QueerPulse é construída e mantida por um grupo de pessoas voluntárias, a título pessoal. Esta página diz-te quem está por trás dela, como nos contactar, e a lei que nos rege.",
  "imprint.operator.title": "Quem gere a QueerPulse",
  "imprint.operator.p1":
    "A QueerPulse é construída e mantida por um grupo de voluntários. Ainda não existe nenhuma empresa ou organização registada por trás dela. Quando isso mudar, publicaremos aqui os dados de registo.",
  "imprint.contact.title": "Como nos contactar",
  "imprint.contact.p1":
    "Para qualquer coisa nesta página, ou para o que for, envia um email para <a>{email}</a> e uma pessoa a sério responde.",
  "imprint.contact.p2":
    "Respondemos em inglês ou português, normalmente dentro de dois dias úteis.",
  "imprint.representation.title": "Responsável pelo conteúdo",
  "imprint.representation.p1":
    "Os voluntários que gerem a QueerPulse são responsáveis pelas páginas que a própria QueerPulse publica: os textos deste site, a revista e os guias. Cada membro é responsável pelo que publica. Se algo publicado por um membro precisar de atenção, denuncia na aplicação ou envia-nos um email, e uma pessoa a sério vai ver.",
  "imprint.hosting.title": "Alojamento",
  "imprint.hosting.p1":
    "A plataforma corre em alojamento e armazenamento na cloud. A tua sessão e os teus dados são tratados como descrito na nossa Política de Privacidade.",
  "imprint.jurisdiction.title": "Lei aplicável",
  "imprint.jurisdiction.p1":
    "A QueerPulse opera ao abrigo da lei portuguesa e da União Europeia.",
  "imprint.jurisdiction.p2":
    "Qualquer litígio que não consigamos resolver diretamente será decidido nos tribunais de Lisboa, Portugal, salvo se a lei de defesa do consumidor te der outro direito.",
  "imprint.disputes.title": "Resolução de litígios em linha",
  "imprint.disputes.p1":
    "A Comissão Europeia disponibiliza uma plataforma de resolução de litígios em linha em ec.europa.eu/consumers/odr. Preferimos resolver as coisas por email primeiro. Vê “Como nos contactar” acima.",
  "imprint.contactCta":
    "Algo aqui desatualizado? <strong>Diz-nos e corrigimos.</strong>",

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
    "A QueerPulse é uma plataforma comunitária queer pequena e por convite, com raízes em Lisboa, fundada em 2024 por um grupo de profissionais, organizadores e artistas que queriam uma alternativa às redes desenhadas para prender a atenção: sem publicidade, sem algoritmo, sem crescimento pelo crescimento. É gerida pelas pessoas que a usam: uma pequena equipa fundadora e um círculo crescente de membros que ajudam a moldar o que vem a seguir. Cada pessoa é avalizada por alguém que já está cá. A QueerPulse não tem capital de risco à procura de retorno; vive de mensalidades, doações e apoios que a mantêm independente. O dinheiro que passa pela QueerPulse fica dentro da comunidade de onde veio, e a plataforma já publica uma revista para os seus membros.",
  "pressKit.mark.section.title": "A <em>marca</em> e como usá-la",
  "pressKit.mark.section.lead":
    "Três variantes aprovadas. O logótipo leva sempre o ponto de pulso coral, exceto na variante inversa “coral”, onde o ponto passa a ameixa. Não recolores o ponto para mais nada.",
  "pressKit.mark.logo.light.meta":
    "<b>Principal · clara</b> · para fundos creme/brancos",
  "pressKit.mark.logo.plum.meta":
    "<b>Inversa · ameixa</b> · para fundos escuros",
  "pressKit.mark.logo.coral.meta":
    "<b>Coral · solidariedade</b> · usar com parcimónia · contextos de orgulho",
  "pressKit.mark.downloadLinkLabel": "PNG",
  "pressKit.mark.modal.eyebrow": "Logótipo · PNG",
  "pressKit.mark.modal.title": "A <em>marca</em>, pronta a usar.",
  "pressKit.mark.modal.lead":
    "O que vês abaixo é o próprio ficheiro: <b>{filename}</b>, 2048 px de largura, com fundo transparente e a tipografia real do logótipo.",
  "pressKit.mark.modal.buttonLabel": "Descarregar · PNG",
  "pressKit.mark.usageNote":
    "<b>Espaçamento:</b> deixa sempre a altura de um <em>P</em> inteiro de espaço livre à volta da marca. <b>Tamanho mínimo:</b> 88px de largura no ecrã, 18 mm em impressão. <b>Não:</b> estiques, recolores, coloques sobre fotografias carregadas, nem juntes a gradientes arco-íris que não fizemos.",
  "pressKit.colour.section.title": "Cor, <em>sistema completo</em>",
  "pressKit.colour.section.lead":
    "Toda a marca assenta em quatro tons. Não introduzimos cores de destaque adicionais, incluindo as específicas de campanhas.",
  "pressKit.colour.plum.meta": "Âncora da marca · títulos, superfícies escuras",
  "pressKit.colour.coral.meta":
    "Destaque · CTAs, ênfase em itálico, o ponto de pulso",
  "pressKit.colour.cream.meta": "Fundo da página · nunca branco puro",
  "pressKit.colour.jade.meta": "Verificado · ao vivo · sucesso",
  "pressKit.team.section.title": "<em>Porta-vozes</em> identificades",
  "pressKit.team.section.lead":
    "Três pessoas fundadoras estão disponíveis para comentário à imprensa. Cita-as sobre os temas indicados; não parafraseies. <em>As restantes pessoas da comunidade não estão disponíveis sem consentimento explícito</em>. Por favor não as contactes diretamente através da plataforma.",
  "pressKit.facts.section.title": "<em>Factos</em> rápidos · a {date}",
  "pressKit.facts.section.lead":
    "Fonte: relatório de transparência de 2025. <em>Por favor liga à página de transparência quando citares.</em>",
  "pressKit.facts.founded": "Fundada · Lisboa",
  "pressKit.facts.activeMembers": "Pessoas ativas no final de 2025",
  "pressKit.facts.communities": "Comunidades na plataforma",
  "pressKit.facts.gatherings": "Convívios realizados em 2025",
  "pressKit.facts.safeSpaces": "Espaços seguros verificados em Lisboa",
  "pressKit.facts.magazineIssues": "Edições da revista até hoje",
  "pressKit.coverage.section.title": "<em>Cobertura</em> recente",
  "pressKit.coverage.section.lead":
    "Peças selecionadas em inglês e português, de 2024 a 2026. <em>Contagens de visitas são bem-vindas mas não necessárias</em>. Liga antes à página de Imprensa.",
  "pressKit.downloads.section.title": "<em>Descarregáveis</em>",
  "pressKit.downloads.section.lead":
    "Links diretos para os ficheiros, servidos a partir do próprio site. O kit completo junta tudo o que está abaixo, com um leia-me e a licença.",
  "pressKit.downloads.completeKit.title": "Kit de imprensa completo",
  "pressKit.downloads.completeKit.desc":
    "Marca, logótipo, ícone da app, referência de cor e tipografia, leia-me",
  "pressKit.downloads.markSvg.title": "Marca · SVG",
  "pressKit.downloads.markSvg.desc": "Vetorial, a cores, segura para recolorir",
  "pressKit.downloads.markMonochrome.title": "Marca monocromática · SVG",
  "pressKit.downloads.markMonochrome.desc":
    "Silhueta vetorial, para impressão a uma cor",
  "pressKit.downloads.wordmarkPng.title": "Logótipo · PNG",
  "pressKit.downloads.wordmarkPng.desc":
    "2048 px de largura, transparente, para documentos e apresentações",
  "pressKit.downloads.appIcon.title": "Ícone da app · PNG",
  "pressKit.downloads.appIcon.desc":
    "512 px, tal como fica instalado nos dispositivos",
  "pressKit.downloads.brandReference.title": "Referência de cor e tipografia",
  "pressKit.downloads.brandReference.desc":
    "PDF pronto a imprimir, com todos os valores tirados dos tokens de design",
  "pressKit.downloads.modal.eyebrow": "Descarregar · {format}",
  "pressKit.downloads.modal.lead":
    "{desc}. O descarregável é o ficheiro <b>{filename}</b> real, servido a partir do próprio site.",
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
    "Queer-owned ou queer-friendly, grande ou pequenino: se o teu lugar é bom para a nossa gente, pertence aqui. Conta-nos e a equipa da comunidade trata do resto. <b>Cada anúncio é lido por uma pessoa antes de ficar no ar.</b>",
  "listBusiness.wizard.stepAria": "Passo {number}: {label}",
  "listBusiness.wizard.stepAriaDone": "Passo {number}: {label} (concluído)",
  "listBusiness.wizard.stepAriaCurrent": "Passo {number}: {label} (atual)",
  "listBusiness.wizard.stepJumpAria": "Voltar ao passo {number}: {label}",
  "listBusiness.wizard.stepOf": "Passo {number} de {total}: {label}",
  "listBusiness.wizard.draftSaved": "Rascunho guardado",
  "listBusiness.draftBanner.text":
    "<b>Tens um rascunho guardado.</b> Continuar de onde ficaste?",
  "listBusiness.draftBanner.startFresh": "Começar de novo",
  "listBusiness.draftBanner.resume": "Retomar rascunho",
  "listBusiness.paneActions.back": "Voltar",
  "listBusiness.paneActions.cancel": "Cancelar",
  "listBusiness.paneActions.neededLabel": "Faltam algumas coisas",
  "listBusiness.paneActions.jumpToAria": "Ir para {label}",
  "listBusiness.paneActions.blockedTitle":
    "Preenche os campos obrigatórios para continuar",
  "listBusiness.next.basics": "A seguir: o básico",
  "listBusiness.next.story": "A seguir: a história",
  "listBusiness.next.practical": "A seguir: o prático",
  "listBusiness.next.photos": "A seguir: fotos e tu",
  "listBusiness.next.review": "Rever o teu anúncio",
  "listBusiness.next.send": "Enviar à equipa",
  "listBusiness.next.continue": "Continuar",
  "listBusiness.sending": "A enviar o teu lugar à equipa…",
  "listBusiness.toast.submitted":
    "O teu anúncio está com a equipa da comunidade",
  "listBusiness.toast.submitError":
    "Não conseguimos enviar o teu espaço agora. Os teus dados ficaram guardados. Tenta de novo.",
  "listBusiness.toast.withdrawn": "Anúncio retirado",
  // Validação do servidor (item #4)
  "listBusiness.serverError.title":
    "O sistema da equipa da comunidade assinalou isto",
  "listBusiness.serverError.dismiss": "Dispensar esta mensagem",
  // Guardar e terminar mais tarde + rascunhos entre dispositivos (item #11)
  "listBusiness.saveLater.cta": "Guardar e terminar mais tarde",
  "listBusiness.saveLater.saving": "A guardar…",
  "listBusiness.saveLater.toast":
    "Guardado. Retoma quando quiseres. Fica à espera nos teus rascunhos.",
  "listBusiness.saveLater.error":
    "Não conseguimos guardar o teu rascunho agora. Verifica a ligação e tenta de novo.",
  "listBusiness.drafts.title": "Retoma onde ficaste",
  "listBusiness.drafts.count": "{count} em curso",
  "listBusiness.drafts.untitled": "Espaço sem título",
  "listBusiness.drafts.updated": "Última edição {when}",
  "listBusiness.drafts.resume": "Retomar",
  "listBusiness.drafts.resuming": "A abrir…",
  "listBusiness.drafts.delete": "Eliminar rascunho",
  "listBusiness.drafts.loadError":
    "Não conseguimos carregar os teus rascunhos agora.",
  "listBusiness.resume.invalidTitle": "Este link de rascunho já não é válido",
  "listBusiness.resume.invalidBody":
    "O link pode ter expirado, ou o rascunho já foi submetido ou eliminado. Podes na mesma começar um anúncio novo.",
  "listBusiness.resume.startFresh": "Começar um anúncio novo",
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
  "listBusiness.step0.signedInAs":
    "Tens sessão iniciada como <b>{name}</b>. Vamos associar esta submissão ao teu perfil para a equipa saber a quem agradecer (e a quem perguntar, se for preciso).",
  // Passo 1 — básico
  "listBusiness.step1.title": "Começa com",
  "listBusiness.step1.em": "o básico.",
  "listBusiness.step1.sub":
    "O suficiente para pôr o teu lugar no mapa. No passo seguinte podes fazê-lo brilhar.",
  "listBusiness.step1.nameLabel": "Como se chama?",
  "listBusiness.step1.nameHelper": "O nome tal como as pessoas o procurariam.",
  "listBusiness.step1.namePlaceholder": "ex.: o nome que os habituais usam",
  "listBusiness.step1.dupHead":
    "Talvez já exista um lugar com este nome no diretório:",
  "listBusiness.step1.catsLabel": "Que tipo de lugar é? Escolhe até 2",
  "listBusiness.step1.catsAria": "Categoria",
  "listBusiness.step1.hoodLabel": "Que bairro?",
  "listBusiness.step1.hoodPlaceholder": "Escolhe um bairro de Lisboa…",
  "listBusiness.step1.hoodOnlineHelper":
    "Opcional para espaços online. Escolhe um se tens raízes num bairro.",
  "listBusiness.step1.badgeLabel": "Quem o gere?",
  "listBusiness.step1.badgeHelper":
    "Queer-owned, ou um lugar que nos acolhe genuinamente? Ambos pertencem aqui. Isto é um acolhimento, aberto a toda a gente.",
  "listBusiness.step1.badgeAria": "Propriedade",
  "listBusiness.step1.owned.tag": "Queer-owned",
  "listBusiness.step1.owned.title": "Gerido ou liderado pela nossa comunidade",
  "listBusiness.step1.owned.desc":
    "Tu, quem partilha a propriedade contigo, ou a liderança são LGBTQ+.",
  "listBusiness.step1.friendly.tag": "Acolhe pessoas LGBTQ+",
  "listBusiness.step1.friendly.title": "Um lugar que nos acolhe",
  "listBusiness.step1.friendly.desc":
    "Não é queer-owned, mas é ativamente seguro e afirmativo.",
  "listBusiness.step1.evidenceLabel":
    "Só um toque leve: em que sentido é queer-owned?",
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
    "Etiquetas: palavras por que as pessoas possam filtrar",
  "listBusiness.step2.tagsPlaceholder": "ex.: Acessível a cadeiras de rodas",
  "listBusiness.step2.tagsAddCta": "Adicionar",
  "listBusiness.step2.tagRemoveAria": "Remover {tag}",
  "listBusiness.step2.goodForLabel": "Bom para… (marca o que for verdade)",
  "listBusiness.step2.goodForHelper":
    "As pequenas coisas que dizem à nossa gente que está segura e é bem-vinda.",
  "listBusiness.step2.goodForAria": "Bom para",
  "listBusiness.step2.langsLabel": "Idiomas falados (opcional)",
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
  "listBusiness.step3.onlineOnly.title": "Este negócio é só online",
  "listBusiness.step3.onlineOnly.sub":
    "Partilha onde as pessoas te encontram online, em vez de uma morada.",
  "listBusiness.step3.onlineOnly.note":
    "Não precisas de morada. Adiciona o teu site ou redes sociais abaixo para que saibam como te contactar.",
  "listBusiness.step3.addressLabel": "Morada",
  "listBusiness.step3.addressHelper":
    "Rua e número chega. Colocamos o pino a partir daí.",
  "listBusiness.step3.addressPlaceholder":
    "R. Antero de Quental 26, 1170-024 Lisboa",
  "listBusiness.step3.locateAddress": "Localizar esta morada",
  "listBusiness.step3.locateError":
    "Não conseguimos encontrar essa morada. Tenta acrescentar a cidade ou o código postal, ou coloca um pino no teu bairro abaixo.",
  "listBusiness.step3.locateDemoHint":
    "No modo demo não é possível procurar uma morada online. Colocámos um pino perto do teu bairro. Arrasta-o para o local exato.",
  "listBusiness.step3.dropNeighbourhoodPin": "Colocar um pino em {hood}",
  "listBusiness.step3.mapLinkLabel": "Link do Google Maps",
  "listBusiness.step3.mapLinkHelper":
    "Abre o teu espaço no Google Maps, toca em Partilhar e cola o link. Colocamos o pino por ti.",
  "listBusiness.step3.mapLinkPlaceholder": "https://maps.app.goo.gl/…",
  "listBusiness.step3.findOnMap": "Encontrar no mapa",
  "listBusiness.step3.resolving": "A localizar…",
  "listBusiness.step3.resolveError":
    "Não conseguimos ler esse link. Cola um link de um local do Google Maps e tenta de novo.",
  "listBusiness.step3.unsupportedLinkDemo":
    "No modo demo, cola o link completo google.com/maps/… Os links curtos precisam do site em produção.",
  "listBusiness.step3.pinPlaced": "Pino colocado perto de {place}",
  "listBusiness.step3.usePlaceName": "Usar “{place}” como morada",
  "listBusiness.step3.mapAria":
    "Mapa: arrasta o pino para definir o local exato.",
  "listBusiness.step3.hoursHeading": "Horário de funcionamento *",
  "listBusiness.step3.hasOpenHours": "Tem horas de abertura",
  "listBusiness.step3.allClosed": "Tudo fechado",
  "listBusiness.step3.copyMonday": "Copiar segunda-feira para todos os dias",
  "listBusiness.step3.markAllClosed": "Marcar tudo como fechado",
  "listBusiness.step3.open": "Aberto",
  "listBusiness.step3.closed": "Fechado",
  "listBusiness.step3.opensAria": "{day}: abertura",
  "listBusiness.step3.closesAria": "{day}: fecho",
  "listBusiness.step3.addHours": "+ Dividir (pausa de almoço)",
  "listBusiness.step3.removeHoursAria": "Remover segundo período de {day}",
  "listBusiness.step3.nextDay": "dia seguinte",
  "listBusiness.step3.hoursWarning":
    "Verifica estes horários: um período está em branco, tem duração zero ou sobrepõe-se.",
  "listBusiness.step3.hoursNoteLabel":
    "Uma nota curta sobre o horário (opcional)",
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
  "listBusiness.step4.photosLabel": "Algumas fotos (opcional)",
  "listBusiness.step4.photosHelper":
    "O plano geral é a tua capa: é a foto que aparece no teu cartão no diretório. Horizontal funciona melhor · idealmente ≥1200px de largura · menos de 5MB cada · sem gráficos carregados de texto.",
  "listBusiness.step4.gallery.wide": "Plano geral do espaço",
  "listBusiness.step4.gallery.wideNote":
    "Foto de capa · aparece no teu cartão no diretório",
  "listBusiness.step4.gallery.detail": "Um detalhe",
  "listBusiness.step4.gallery.vibe": "Pessoas / ambiente",
  "listBusiness.step4.alt.wide": "Plano geral · texto alternativo",
  "listBusiness.step4.alt.d1": "Detalhe 1 · texto alternativo",
  "listBusiness.step4.alt.d2": "Detalhe 2 · texto alternativo",
  "listBusiness.step4.alt.vibe": "Ambiente · texto alternativo",
  "listBusiness.step4.altPlaceholder":
    "Descreve para quem é cega ou tem baixa visão",
  "listBusiness.step4.altPlaceholderRequired":
    "Obrigatório: descreve para quem é cega ou tem baixa visão",
  "listBusiness.step4.photo.upload": "Carregar",
  "listBusiness.step4.photo.change": "Trocar",
  "listBusiness.step4.photo.uploading": "A carregar…",
  "listBusiness.step4.photo.remove": "Remover foto",
  "listBusiness.step4.photo.serverRejected":
    "Não conseguimos guardar esta foto. Carrega-a de novo ou escolhe outra.",
  "listBusiness.step4.photo.uploadError":
    "Não foi possível carregar essa imagem. Tenta novamente",
  "listBusiness.step4.aboutYouHeading": "Um pouco sobre ti",
  "listBusiness.step4.relLabel": "A tua ligação ao lugar",
  "listBusiness.step4.relAria": "A tua ligação",
  "listBusiness.step4.ownerNameLabel": "O teu nome",
  "listBusiness.step4.ownerNamePlaceholder": "ex.: Sandra Lopes",
  "listBusiness.step4.ownerRoleLabel": "O teu papel",
  "listBusiness.step4.ownerRolePlaceholder": "ex.: Dona e padeira",
  "listBusiness.step4.ownerBioLabel": "Uma linha ou duas sobre ti (opcional)",
  "listBusiness.step4.ownerBioPlaceholder":
    "Pegámos numa pastelaria com 60 anos em 2019 e reconstruímo-la à volta de uma regra: toda a gente é bem-vinda, exatamente como é.",
  "listBusiness.step4.visLabel": "Quem pode ver o teu nome?",
  "listBusiness.step4.visAria": "Visibilidade do nome",
  "listBusiness.step4.linkProfileLabel": "Ligar ao teu perfil? (opcional)",
  "listBusiness.step4.linkProfileTitle": "Mostrar que sou da QueerPulse",
  "listBusiness.step4.linkProfileDesc":
    "Põe um rosto familiar e verificado no anúncio. Tens sessão iniciada como {name}.",
  "listBusiness.step4.linkProfileToggleLabel": "Ligar ao perfil",
  "listBusiness.step4.loopHeading": "Manteres-te a par",
  "listBusiness.step4.contactEmailLabel": "O teu email de contacto",
  "listBusiness.step4.contactEmailHelper":
    "Para ti, que submetes: fica privado, nunca aparece no anúncio.",
  "listBusiness.step4.contactEmailPlaceholder":
    "Para te podermos contactar sobre este anúncio",
  "listBusiness.step4.notifyNote":
    "Uma notificação da QueerPulse avisa-te quando o teu anúncio ficar no ar, e as perguntas da equipa chegam por mensagem na QueerPulse.",
  "listBusiness.step4.consent":
    "És tu que controlas o que é público. <b>Os contactos que deixares em branco ficam fora do anúncio.</b> Queres o teu nome privado? Escolhe “só o papel” ou “anónime” acima. Não há problema nenhum.",
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
  // Passo 5 — revisão
  "listBusiness.step5.title": "Uma última vista de olhos",
  "listBusiness.step5.em": "antes de ir para a equipa.",
  "listBusiness.step5.sub":
    "Aqui está tudo o que nos contaste. Edita qualquer parte voltando atrás. Nada fica fechado até enviares.",
  "listBusiness.step5.slugLabel": "O teu anúncio vai viver em",
  "listBusiness.step5.slugDomain": "queerpulse.app/directory/",
  "listBusiness.step5.editCta": "Editar",
  "listBusiness.step5.notAdded": "Por preencher",
  "listBusiness.step5.onlineBusiness": "Só online",
  "listBusiness.step5.group.pathPlace": "Tu e o lugar",
  "listBusiness.step5.group.basics": "Básico",
  "listBusiness.step5.group.story": "História",
  "listBusiness.step5.group.practical": "Prático",
  "listBusiness.step5.group.photosYou": "Fotos e tu",
  "listBusiness.step5.row.listingAs": "A anunciar como",
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
    "<b>Uma pessoa revê cada anúncio.</b> É isto que mantém o diretório verificado pela comunidade. Nada é publicado automaticamente. Lemo-lo em poucos dias, e a QueerPulse avisa-te quando ficar no ar (ou a equipa manda-te mensagem se tivermos uma pergunta). Podes editá-lo ou retirá-lo a qualquer momento até lá.",
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
    "Agradecemos o contributo para o diretório. <b>Uma pessoa a sério da equipa da comunidade lê cada anúncio</b> antes de ficar no ar. É essa a promessa por trás do nosso distintivo de verificação pela comunidade. Revemos em <b>poucos dias</b> e recebes uma notificação da QueerPulse assim que estiver no ar.",
  "listBusiness.success.note.question":
    "<b>A equipa tem uma pequena pergunta</b> antes de ficar no ar. Está à tua espera nas mensagens da QueerPulse. Não se passa nada de errado; basta uma resposta rápida e segue tudo em frente.",
  "listBusiness.success.note.live":
    "<b>Já está no ar no diretório.</b> O teu lugar já pode ser encontrado pela comunidade. Agradecemos por tornares o mapa um bocadinho mais completo.",
  "listBusiness.success.fallbackName": "O teu lugar",
  "listBusiness.success.withdrawConfirm":
    "Retirar <b>{name}</b>? Isto tira-o da revisão. Podes sempre anunciá-lo outra vez mais tarde.",
  "listBusiness.success.withdrawFallbackName": "este anúncio",
  "listBusiness.success.keepIt": "Manter",
  "listBusiness.success.yesWithdraw": "Sim, retirar",
  "listBusiness.success.backToDirectory": "Voltar ao diretório",
  "listBusiness.success.viewOnProfile": "Ver no teu perfil",
  "listBusiness.success.editSubmission": "Editar submissão",
  "listBusiness.success.listAnother": "Anunciar outro lugar",
  "listBusiness.success.withdraw": "Retirar",
  "listBusiness.success.reference":
    "Referência · <b>{ref}</b>  ·  guarda-a algures",
  // Etiquetas dos chips de "o que falta"
  "listBusiness.missing.path": "como conheces o lugar",
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
  "listBusiness.missing.hoursInvalid": "uma correção no horário",
  "listBusiness.missing.hoursExceptionsInvalid":
    "uma correção nas exceções por data",
  "listBusiness.missing.socialFormat":
    "o formato dos links de contacto corrigido",
  "listBusiness.missing.rel": "a tua ligação",
  "listBusiness.missing.ownerName": "o teu nome",
  "listBusiness.missing.ownerRole": "o teu papel",
  "listBusiness.missing.contactEmail": "um email de contacto",
  "listBusiness.missing.alt": "texto alternativo para as tuas fotos",
  "listBusiness.missing.consent": "as duas confirmações",
  "listBusiness.missing.services": "um nome e um preço em cada serviço",
  "listBusiness.missing.affirmingBaseline": "o compromisso afirmativo",
  // Coluna de pré-visualização ao vivo
  "listBusiness.preview.head":
    "Pré-visualização ao vivo · atualiza enquanto escreves",
  "listBusiness.preview.addPhoto": "Adicionar foto de capa",
  "listBusiness.preview.placeholderName": "O teu lugar",
  "listBusiness.preview.placeholderMeta": "Categoria · bairro",
  "listBusiness.preview.placeholderBlurb":
    "O teu lugar vai aparecer aqui à medida que preencheres o formulário, exatamente como ficará na grelha do diretório.",
  "listBusiness.preview.placeholderTagline":
    "O teu lema torna-se a citação em destaque no topo da tua página.",
  "listBusiness.preview.whatItIs": "O que é",
  "listBusiness.preview.goodFor": "Bom para",
  "listBusiness.preview.languages": "Idiomas",
  "listBusiness.preview.hours": "Horário",
  "listBusiness.preview.roleShown": "Papel visível · nome privado",
  "listBusiness.preview.yourRole": "O teu papel",
  "listBusiness.preview.fullCta": "Pré-visualizar a página completa",
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
  "listBusiness.edit.savedInReview":
    "As tuas alterações foram guardadas. O anúncio continua em análise.",
  "listBusiness.edit.status.liveBody":
    "Este anúncio está ativo. Guardar as alterações atualiza a página pública de imediato.",
  "listBusiness.edit.status.reviewBody":
    "Este anúncio ainda não é público. A moderação está a lê-lo, e guardar atualiza o que a equipa vê.",
  "listBusiness.edit.status.questionBody":
    "A moderação tem uma pergunta sobre este anúncio antes de poder ficar ativo. Guardar atualiza o que a equipa vê.",
  "listBusiness.edit.verifiedBadge.title": "Selo de negócio queer verificado",
  "listBusiness.edit.verifiedBadge.body":
    "A moderação confirmou este selo para o negócio tal como está hoje. Alterar o nome do negócio, o selo Queer-owned ou LGBTQ+ friendly, ou a ligação deste anúncio ao teu perfil, remove o selo até a moderação confirmar o negócio outra vez. Tudo o resto que editares aqui não lhe toca.",
  "listBusiness.edit.saveError":
    "Não conseguimos guardar as alterações. Tenta de novo.",
  "listBusiness.edit.discardConfirm":
    "Descartar as alterações não guardadas a este anúncio?",
  "listBusiness.edit.notAllowed":
    "Só podes editar um anúncio que tenhas submetido.",

  // ── Editor de anúncio num só ecrã (modo de edição). O fluxo de criação
  //    continua um assistente guiado; a edição põe tudo numa página.
  "listBusiness.editor.section.aboutYou": "Sobre ti",
  "listBusiness.editor.section.permissions": "Permissões",
  "listBusiness.editor.nav.label": "Ir para",
  "listBusiness.editor.nav.aria": "Ir para uma secção do teu anúncio",
  "listBusiness.editor.nav.missingCount": "Faltam {count}",
  "listBusiness.editor.unsavedChanges": "Tens alterações por guardar.",
  "listBusiness.editor.noChanges": "Está tudo guardado.",
  "listBusiness.editor.previewCta": "Pré-visualizar página",
  "listBusiness.editor.preview.eyebrow":
    "Pré-visualização, com as alterações por guardar",
  "listBusiness.editor.preview.sub":
    "A página do teu anúncio como quem visita a vai ver. Nada fica guardado até carregares em guardar.",
  "listBusiness.editor.preview.subCoManager":
    "A página do anúncio como quem visita a vai ver. Nada fica guardado até carregares em guardar. O bloco sobre a pessoa por trás do negócio aparece vazio nesta pré-visualização e preenchido na página real.",

  "listBusiness.editor.section.services": "Quanto custa",
  "listBusiness.editor.section.accessibility": "Como se entra",
  "listBusiness.editor.section.tradingAndVisibility":
    "Atividade e visibilidade",
  "listBusiness.editor.section.whoCanEdit": "Quem pode editar",
  "listBusiness.editor.section.roleOnListing": "Função mostrada na página",

  // ── Cogestão. Quem mais pode editar uma página, e o convite que os leva lá.
  //    Só para membros: nada disto chega à página pública.
  "listBusiness.coManagers.introOwner":
    "Gerir um espaço raramente é trabalho para uma pessoa só. Convida alguém de confiança para ajudar a manter esta página atualizada. Essa pessoa pode alterar tudo sobre o negócio. Os teus dados pessoais, e quem pode editar, continuam contigo.",
  "listBusiness.coManagers.introCoManager":
    "Quem trata desta página. Só quem é proprietário pode convidar pessoas ou retirar um lugar.",
  "listBusiness.coManagers.status.active": "Pode editar",
  "listBusiness.coManagers.status.invited": "À espera de resposta",
  "listBusiness.coManagers.formerMember": "Alguém que entretanto saiu",
  "listBusiness.coManagers.invitedOn": "Convite enviado a {date}",
  "listBusiness.coManagers.editingSince": "Ajuda desde {date}",
  "listBusiness.coManagers.removeCta": "Retirar",
  "listBusiness.coManagers.cancelInviteCta": "Cancelar convite",
  "listBusiness.coManagers.removeConfirm":
    "Retirar <b>{name}</b> desta página? Fica tudo o que essa pessoa acrescentou, e podes voltar a convidá-la quando quiseres.",
  "listBusiness.coManagers.cancelInviteConfirm":
    "Cancelar o convite para <b>{name}</b>? Podes voltar a enviá-lo quando quiseres.",
  "listBusiness.coManagers.keepCta": "Voltar atrás",
  "listBusiness.coManagers.removeYes": "Retirar",
  "listBusiness.coManagers.cancelInviteYes": "Cancelar convite",
  "listBusiness.coManagers.empty.title": "Por agora, só tu",
  "listBusiness.coManagers.empty.descriptionOwner":
    "Ainda não há mais ninguém a editar esta página. Convida alguém aqui em baixo quando quiseres uma ajuda.",
  "listBusiness.coManagers.empty.descriptionCoManager":
    "Neste momento não há mais ninguém a tratar desta página.",
  "listBusiness.coManagers.removedToast":
    "Essa pessoa deixou de editar esta página.",
  "listBusiness.coManagers.removeError":
    "Não conseguimos fazer essa alteração agora. Tenta outra vez.",
  "listBusiness.coManagers.inviteHeading": "Convidar alguém para ajudar",
  "listBusiness.coManagers.inviteIntro":
    "Encontra a pessoa em quem estás a pensar e envia o convite. Nada muda para ela até aceitar.",
  "listBusiness.coManagers.seats":
    "{used} de {cap} lugares ocupados. Um convite ocupa um lugar enquanto espera resposta.",
  "listBusiness.coManagers.seatsFullNotice":
    "Os lugares estão todos ocupados. Retira alguém, ou cancela um convite, para libertar um.",
  "listBusiness.coManagers.searchPlaceholder": "Procurar membros pelo nome",
  "listBusiness.coManagers.searchHint":
    "Escreve um nome para encontrar a pessoa em quem estás a pensar.",
  "listBusiness.coManagers.sendCta": "Enviar convite",
  "listBusiness.coManagers.sendingCta": "A enviar...",
  "listBusiness.coManagers.invitedToast": "Convite enviado.",
  "listBusiness.coManagers.error.self": "Esta página já é tua para editar.",
  "listBusiness.coManagers.error.seatsFull":
    "Os lugares estão todos ocupados. Retira alguém, ou cancela um convite, para libertar um.",
  "listBusiness.coManagers.error.alreadyThere":
    "Essa pessoa já tem lugar aqui, ou um convite à espera.",
  "listBusiness.coManagers.error.generic":
    "Não conseguimos enviar esse convite. Tenta outra vez.",
  "listBusiness.coManagers.stepDownHeading": "Deixar de gerir esta página",
  "listBusiness.coManagers.stepDownIntro":
    "Podes devolvê-la quando quiseres. Tudo o que acrescentaste fica com a página.",
  "listBusiness.coManagers.stepDownCta": "Deixar de gerir",
  "listBusiness.coManagers.stepDownConfirm":
    "Deixar de ajudar com {name}? O teu acesso termina de imediato, e só quem é proprietário te pode trazer de volta.",
  "listBusiness.coManagers.stepDownCancel": "Voltar atrás",
  "listBusiness.coManagers.stepDownYes": "Sim, deixar de gerir",
  "listBusiness.coManagers.leftToast": "Já não ajudas com {name}.",
  "listBusiness.coManagers.leaveError":
    "Não conseguimos fazer isso agora. Tenta outra vez.",
  "listBusiness.coManagers.banner.title": "Ajudas a gerir esta página",
  "listBusiness.coManagers.banner.titleNamed":
    "Ajudas {name} a gerir {listing}",
  "listBusiness.coManagers.banner.body":
    "Podes alterar tudo sobre o negócio: o que diz, os horários, as fotografias, os serviços, as respostas de acessibilidade, e as respostas a avaliações e perguntas. Os dados de contacto e as escolhas de perfil de quem é proprietário ficam privados, e apagar a página ou mudar quem pode editar também fica com essa pessoa.",
  "listBusiness.coManagers.roleFieldLabel": "Função mostrada na página",
  "listBusiness.coManagers.roleFieldHelper":
    "O cargo apresentado ao lado do negócio na página pública.",
  "listBusiness.coManagers.ownerPrivateNotice":
    "O nome, a apresentação, o email de contacto e as escolhas de perfil de quem é proprietário são privados. Não aparecem aqui, e nada do que guardares os altera.",

  // ── Vocabulário de acessibilidade. As seis perguntas são fixas e
  //    partilhadas com a API, que guarda os slugs tal e qual.
  "listBusiness.accessibility.question.stepFree.label": "Entrada sem degraus",
  "listBusiness.accessibility.question.stepFree.help":
    "Dá para chegar da rua à porta sem subir degraus.",
  "listBusiness.accessibility.question.interior.label":
    "Interior acessível em cadeira de rodas",
  "listBusiness.accessibility.question.interior.help":
    "Há espaço para circular e chegar à zona principal em cadeira de rodas.",
  "listBusiness.accessibility.question.accessibleToilet.label":
    "Casa de banho acessível",
  "listBusiness.accessibility.question.accessibleToilet.help":
    "Uma casa de banho com o espaço e os apoios de que uma pessoa em cadeira de rodas precisa.",
  "listBusiness.accessibility.question.genderNeutralToilet.label":
    "Casa de banho neutra",
  "listBusiness.accessibility.question.genderNeutralToilet.help":
    "Pelo menos uma casa de banho para a qual ninguém tem de escolher uma porta com género.",
  "listBusiness.accessibility.question.quietHours.label":
    "Horas calmas, de baixo estímulo",
  "listBusiness.accessibility.question.quietHours.help":
    "Horários regulares com a música baixa e as luzes suaves.",
  "listBusiness.accessibility.question.assistanceAnimals.label":
    "Animais de assistência bem-vindos",
  "listBusiness.accessibility.question.assistanceAnimals.help":
    "Cães-guia e outros animais de assistência podem entrar. A política sobre animais de companhia é uma pergunta à parte.",

  // Palavras de quem lê na página pública; palavras de quem gere no editor.
  "listBusiness.accessibility.answer.yes.reader": "Sim",
  "listBusiness.accessibility.answer.yes.owner": "Sim",
  "listBusiness.accessibility.answer.no.reader": "Não",
  "listBusiness.accessibility.answer.no.owner": "Não",
  "listBusiness.accessibility.answer.unknown.reader": "Ninguém nos disse",
  "listBusiness.accessibility.answer.unknown.owner": "Ainda não sei",

  "listBusiness.accessibility.intro":
    "Seis perguntas que alguém pode precisar de ver respondidas antes de decidir se consegue vir. Responde ao que souberes.",
  "listBusiness.accessibility.reassurance":
    "Um não honesto é útil. Quem anda em cadeira de rodas prefere muito mais ler que há dois degraus à tua porta do que aparecer e descobrir na hora. Nada disto conta contra o teu anúncio.",
  "listBusiness.accessibility.noteLabel":
    "Mais alguma coisa que valha a pena saber",
  "listBusiness.accessibility.noteHint":
    "Os detalhes que uma lista de verificação não segura. Diz o que uma pessoa vai mesmo encontrar à porta.",
  "listBusiness.accessibility.notePlaceholder":
    "Dois degraus à porta da frente e a equipa ajuda com a rampa. Toca à campainha da esquerda.",

  // ── Serviços com preço, do lado de quem gere.
  "listBusiness.services.intro":
    "O que vendes e quanto custa. A tua faixa de preço continua a ser o sinal rápido; aqui dizes o que ela compra. Deixa vazio se os preços não funcionarem assim contigo.",
  "listBusiness.services.empty":
    "Ainda não há nada. Adiciona uma linha por cada coisa para a qual queres mostrar um preço.",
  "listBusiness.services.addCta": "Adicionar um serviço",
  "listBusiness.services.addHint":
    "Opcional. A maioria dos anúncios fica bem com meia dúzia.",
  "listBusiness.services.ceilingHint":
    "Chegaste ao limite de {count}. Uma lista de preços mais longa fica melhor no teu próprio site.",
  "listBusiness.services.nameLabel": "O que é",
  "listBusiness.services.namePlaceholder": "Consulta, primeira sessão",
  "listBusiness.services.nameError":
    "Dá um nome a esta linha, ou limpa o preço para a remover.",
  "listBusiness.services.priceLabel": "Quanto custa",
  "listBusiness.services.pricePlaceholder": "Desde 25 EUR, escala variável",
  "listBusiness.services.priceError":
    "Diz quanto custa. Serve tudo o que for verdade: um número, um intervalo ou uma escala variável.",
  "listBusiness.services.noteLabel": "Uma linha de detalhe",
  "listBusiness.services.noteHint": "Opcional.",
  "listBusiness.services.notePlaceholder":
    "45 minutos, inclui mensagem de seguimento",
  "listBusiness.services.unnamedRow": "linha {position}",
  "listBusiness.services.moveUp": "Mover {name} para cima",
  "listBusiness.services.moveDown": "Mover {name} para baixo",
  "listBusiness.services.remove": "Remover {name}",

  // ── A pausa de quem gere. Uma pergunta diferente do estado de atividade
  //    acima: isto é sobre se o ANÚNCIO aparece, e não diz nada sobre se o
  //    negócio está aberto.
  "listBusiness.visibility.heading": "A aparecer no diretório",
  "listBusiness.visibility.intro":
    "Retira o teu anúncio do diretório durante um tempo e volta a pô-lo quando quiseres. Fica tudo onde está enquanto estiver fora.",
  "listBusiness.visibility.distinction":
    "Isto é diferente do estado de atividade acima. Fechado temporariamente mantém-te no diretório e diz às pessoas que estás fechado por agora. Pausar tira o anúncio da exploração, da pesquisa e do mapa, e não diz nada sobre se estás aberto.",
  "listBusiness.visibility.state.showing.title":
    "O teu anúncio está a aparecer",
  "listBusiness.visibility.state.showing.sub":
    "As pessoas encontram-no na exploração, na pesquisa e no mapa.",
  "listBusiness.visibility.state.hidden.title": "O teu anúncio está em pausa",
  "listBusiness.visibility.state.hidden.sub":
    "Neste momento está fora da exploração, da pesquisa e do mapa. Ninguém o encontra no diretório até o voltares a pôr.",
  "listBusiness.visibility.hiddenSince": "Em pausa {when}",
  "listBusiness.visibility.kept.reviews":
    "As tuas avaliações, classificações e respostas ficam exatamente como estão.",
  "listBusiness.visibility.kept.content":
    "Fotografias, horários, contactos e os selos que tiveres ficam todos guardados.",
  "listBusiness.visibility.kept.reversible":
    "Podes voltar a pô-lo quando quiseres, e ele regressa inteiro.",
  "listBusiness.visibility.hideCta": "Pôr este anúncio em pausa",
  "listBusiness.visibility.showCta": "Voltar a mostrar",
  "listBusiness.visibility.applying": "A atualizar…",
  "listBusiness.visibility.saved.hidden":
    "O teu anúncio ficou em pausa. Está fora do diretório até o voltares a pôr.",
  "listBusiness.visibility.saved.shown": "O teu anúncio voltou ao diretório.",
  "listBusiness.visibility.saveError":
    "Não foi possível atualizar. Tenta novamente.",
  "listBusiness.visibility.banner.title": "Este anúncio está em pausa",
  "listBusiness.visibility.banner.body":
    "Neste momento está fora da exploração, da pesquisa e do mapa. As tuas alterações guardam-se normalmente, e ninguém as vê até voltares a mostrar o anúncio.",

  // ── O compromisso afirmativo, assumido uma vez na submissão. Fora do
  //    pedido de atualização de propósito: não há edição que o desfaça.
  "listBusiness.baseline.title":
    "A única coisa com que <em>todos os anúncios concordam.</em>",
  "listBusiness.baseline.body":
    "Os negócios deste diretório comprometem-se a acolher e servir pessoas LGBTQ+, e a agir quando alguém no seu espaço fica aquém. É esse compromisso que faz esta lista valer a pena.",
  "listBusiness.baseline.scope":
    "É sobre a forma como tratas as pessoas que serves. Não dá a ninguém autorização para recusar uma pessoa por quem ela é.",
  "listBusiness.baseline.agreeTitle": "Concordamos com isto",
  "listBusiness.baseline.agreeSub":
    "Obrigatório. Todos os anúncios do diretório concordaram com o mesmo.",
  "listBusiness.baseline.noticeTitle":
    "Concordaste com o compromisso afirmativo LGBTQ+ quando este anúncio foi criado.",
  "listBusiness.baseline.noticeBody":
    "Mantém-se enquanto o anúncio existir, por isso não há nada para mudar aqui. Todos os negócios do diretório concordaram com o mesmo.",

  // ── Guardado automático local do editor. OFERECE uma cópia guardada neste
  //    dispositivo; o formulário mantém-se igual ao que o servidor devolveu
  //    até a pessoa carregar em repor, por isso nada publicado é substituído
  //    em silêncio.
  "listBusiness.editor.restore.title": "Tens alterações por guardar de {when}",
  "listBusiness.editor.restore.sub":
    "Ficaram guardadas neste dispositivo e nunca foram enviadas. O teu anúncio publicado não mudou.",
  "listBusiness.editor.restore.serverChanged":
    "Atenção: este anúncio foi atualizado depois de essas alterações terem sido guardadas, por isso reposicioná-las substituiria o texto mais recente.",
  "listBusiness.editor.restore.restoreCta": "Repor",
  "listBusiness.editor.restore.discardCta": "Descartar",
  "listBusiness.editor.restore.justNow": "há instantes",
  "listBusiness.editor.restore.unknownWhen": "uma sessão anterior",

  // ── Estado de funcionamento: o que o próprio negócio diz sobre si. Definir
  //    isto nunca mexe no estado de moderação nem obriga a nova revisão.
  "listBusiness.trading.groupAria": "Este negócio ainda está em atividade?",
  "listBusiness.trading.currently": "Neste momento",
  "listBusiness.trading.since": "definido {when}",
  "listBusiness.trading.justNow": "há instantes",
  "listBusiness.trading.unknownWhen": "há algum tempo",
  "listBusiness.trading.state.open.label": "Aberto como sempre",
  "listBusiness.trading.state.open.desc":
    "A funcionar normalmente. Não aparece nada de extra na tua página.",
  "listBusiness.trading.state.temporarilyClosed.label":
    "Fechado temporariamente",
  "listBusiness.trading.state.temporarilyClosed.desc":
    "Continua listado em todo o lado, com um aviso de fecho na tua página.",
  "listBusiness.trading.state.moved.label": "Mudou de sítio",
  "listBusiness.trading.state.moved.desc":
    "Continua listado em todo o lado, com a morada nova na tua página.",
  "listBusiness.trading.state.permanentlyClosed.label": "Fechado de vez",
  "listBusiness.trading.state.permanentlyClosed.desc":
    "Retirado da exploração, da pesquisa e do mapa.",
  "listBusiness.trading.noteLabel": "O que é que as pessoas devem saber?",
  "listBusiness.trading.noteHint":
    "Aparece no teu anúncio, por isso mantém curto e simples.",
  "listBusiness.trading.notePlaceholder":
    "Fechado para obras, de volta em setembro.",
  "listBusiness.trading.movedToLabel": "Onde é que te encontram agora?",
  "listBusiness.trading.movedToHint":
    "Uma mudança sem destino não diz a quem lê nada que já não tivesse percebido à porta.",
  "listBusiness.trading.movedToPlaceholder": "Rua da Prata 42, Baixa",
  "listBusiness.trading.applyCta": "Atualizar estado",
  "listBusiness.trading.applying": "A atualizar…",
  "listBusiness.trading.applyHint":
    "Isto aplica-se sozinho, separado do botão de guardar abaixo.",
  "listBusiness.trading.saveError":
    "Não foi possível atualizar o estado. Tenta novamente.",
  "listBusiness.trading.saved.open":
    "O teu anúncio volta a estar aberto como sempre.",
  "listBusiness.trading.saved.temporarily_closed":
    "O teu anúncio passa a aparecer como fechado temporariamente.",
  "listBusiness.trading.saved.permanently_closed":
    "O teu anúncio ficou marcado como fechado de vez.",
  "listBusiness.trading.saved.moved":
    "O teu anúncio passa a mostrar a morada nova.",
  "listBusiness.trading.closeConfirm.title":
    "Marcar {name} como fechado de vez?",
  "listBusiness.trading.closeConfirm.lead":
    "Este é o único estado que tira o teu negócio dos resultados do diretório. É isto que acontece.",
  "listBusiness.trading.closeConfirm.removed":
    "Deixa de aparecer na exploração, na pesquisa, no mapa e nos resultados de espaços seguros.",
  "listBusiness.trading.closeConfirm.kept":
    "A tua página continua acessível, por isso links guardados, avaliações e o teu aviso de fecho mantêm-se.",
  "listBusiness.trading.closeConfirm.reversible":
    "Podes voltar a pôr aberto quando quiseres. Não se apaga nada.",
  "listBusiness.trading.closeConfirm.cancel": "Manter listado",
  "listBusiness.trading.closeConfirm.confirm": "Sim, fechar de vez",

  // ── "Continua certo?": um toque barato que carimba o anúncio como
  //    confirmado por quem o gere. Pedido com mais insistência à medida que o
  //    carimbo envelhece.
  "listBusiness.confirmDetails.title.fresh": "Estes dados estão confirmados",
  "listBusiness.confirmDetails.title.ageing": "Estes dados continuam certos?",
  "listBusiness.confirmDetails.title.stale":
    "Já ninguém verifica estes dados há algum tempo",
  "listBusiness.confirmDetails.lastConfirmed": "Última confirmação {when}.",
  "listBusiness.confirmDetails.never":
    "Nunca os confirmaste, por isso quem visita só tem o dia em que os escreveste.",
  "listBusiness.confirmDetails.justNow": "há instantes",
  "listBusiness.confirmDetails.unknownWhen": "há algum tempo",
  "listBusiness.confirmDetails.cta": "Continua certo",
  "listBusiness.confirmDetails.saving": "A guardar…",
  "listBusiness.confirmDetails.toast":
    "Obrigade. O teu anúncio fica carimbado como verificado hoje.",
  "listBusiness.confirmDetails.error":
    "Não foi possível registar isso agora. Tenta novamente.",

  // ── Exceções por data ao horário semanal (só no editor de quem gere).
  "listBusiness.hoursExceptions.heading": "Datas que são diferentes",
  "listBusiness.hoursExceptions.hint":
    "Feriados, pausa de verão, uma noite mais longa. Cada data aqui substitui o horário semanal nesse dia.",
  "listBusiness.hoursExceptions.empty":
    "Ainda não há exceções, por isso o horário semanal aplica-se todas as semanas.",
  "listBusiness.hoursExceptions.addCta": "Adicionar uma data",
  "listBusiness.hoursExceptions.clearPastCta_one": "Remover 1 data passada",
  "listBusiness.hoursExceptions.clearPastCta_other":
    "Remover {count} datas passadas",
  "listBusiness.hoursExceptions.count": "{used} de {max} datas",
  "listBusiness.hoursExceptions.capReached":
    "Chegaste ao limite de {max} datas. Remove uma para adicionar outra.",
  "listBusiness.hoursExceptions.dateLabel": "Data",
  "listBusiness.hoursExceptions.untitledDate": "esta data",
  "listBusiness.hoursExceptions.pastTag": "Passada",
  "listBusiness.hoursExceptions.removeAria": "Remover a exceção de {date}",
  "listBusiness.hoursExceptions.noteAria": "Etiqueta para {date}",
  "listBusiness.hoursExceptions.notePlaceholder":
    "Véspera de Natal, fecha mais cedo",
  "listBusiness.hoursExceptions.problem.date":
    "Indica uma data real do calendário, como 2026-12-24.",
  "listBusiness.hoursExceptions.problem.duplicate":
    "Já existe uma entrada para esta data. Edita essa em vez de criar outra.",
  "listBusiness.hoursExceptions.problem.intervals":
    "Uma data aberta precisa de pelo menos uma janela, e as horas não podem ser iguais nem sobrepor-se.",

  // ── Etiqueta partilhada de regresso ao hub (secção Governação) ─────────
  "hub.governanceLabel": "Governação",

  // ── Registo de alterações — chrome da página. As 18 entradas datadas
  //    (título/corpo/tag) são notas de lançamento históricas — ficam em
  //    inglês por causa do volume; sinalizado no relatório em vez de feito
  //    à pressa.
  "changelog.hero.backLabel": "Roteiro",
  "changelog.meta.title":
    "Registo de alterações da QueerPulse: o que mudou, e quando",
  "changelog.meta.description":
    "Todas as atualizações da QueerPulse, da mais recente para a mais antiga, das novidades às pequenas correções, para saberes sempre o que é diferente e porquê.",
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
  "changelog.controls.expandAll": "Abrir tudo",
  "changelog.controls.collapseAll": "Fechar tudo",
  "changelog.release.highlights": "Destaques",
  "changelog.release.count.feature_one": "{count} funcionalidade",
  "changelog.release.count.feature_other": "{count} funcionalidades",
  "changelog.release.count.improvement_one": "{count} melhoria",
  "changelog.release.count.improvement_other": "{count} melhorias",
  "changelog.release.count.fix_one": "{count} correção",
  "changelog.release.count.fix_other": "{count} correções",
  "changelog.release.count.infrastructure_one":
    "{count} alteração de infraestrutura",
  "changelog.release.count.infrastructure_other":
    "{count} alterações de infraestrutura",
  "changelog.entry.more": "Mais",
  "changelog.entry.less": "Menos",
  // Release headlines, one per shipping day (see changelogReleases.ts).
  "changelog.releases.2026-09-12.headline":
    "O teu cartão Agora mostra o que a tua disponibilidade faz, e as fotos da ficha vêm dos teus ficheiros.",
  "changelog.releases.2026-09-11.headline":
    "Quem organiza cria convívios em cinco capítulos curtos, e os guias ganham um editor completo.",
  "changelog.releases.2026-09-10.headline":
    "Cada conversa pode ter o seu papel de parede, na cor que escolheres.",
  "changelog.releases.2026-09-09.headline":
    "Os anfitriões gerem um encontro a partir da página dele, e o registo de alterações lê-se como lançamentos.",
  "changelog.releases.2026-09-08.headline":
    "A biografia liga pessoas e lugares, e o menu de conta troca idioma e tema.",
  "changelog.releases.2026-09-06.headline":
    "Habitação, mensagens, fórum, revista e encontros levam todos uma volta completa.",
  "changelog.releases.2026-09-03.headline":
    "A app instalada abre com um batimento direto no teu feed, e as páginas de comunidade cabem no telemóvel.",
  "changelog.releases.2026-09-01.headline":
    "O que envias chega a uma pessoa, os filtros dizem o que deixam, e a app segue o tamanho do teu texto.",
  "changelog.releases.2026-08-31.headline":
    "Tudo o que enviaste num só sítio, podes escrever a um negócio, e a segurança leva uma volta a fundo.",
  "changelog.releases.2026-08-30.headline":
    "Vê a tua persona como um visitante a vê, e cada bairro diz quantas pessoas lá estão.",
  "changelog.releases.2026-08-29.headline":
    "As páginas abrem assim que clicas, eventos e comunidades arrumam as barras, e os filtros mostram quantos.",
  "changelog.releases.2026-08-28.headline":
    "As comunidades e o diretório recolhem os filtros, e as páginas vão direitas ao assunto.",
  "changelog.releases.2026-08-27.headline":
    "Os guias aparecem depois de um editor os verificar, e as regras abrem sem saíres da fila.",
  "changelog.releases.2026-08-26.headline":
    "O quadro de habitação abre, os anfitriões gerem a própria porta, e podes pôr algo a votação.",
  "changelog.releases.2026-08-25.headline":
    "As páginas de negócios foram refeitas, o perfil diz o que fazes, e as edições comandam a redação.",
  "changelog.releases.2026-08-24.headline":
    "Vê o cartão da comunidade enquanto o editas, e os banners de persona guardam o teu enquadramento.",
  "changelog.releases.2026-08-23.headline":
    "As comunidades ganham co-donos, avisos que chegam, e escolhes quanto cada uma te contacta.",
  "changelog.releases.2026-08-22.headline":
    "As comunidades podem dar-te um cartão de membro, com ferramenta de design, duas faces e impressão.",
  "changelog.releases.2026-08-21.headline":
    "As notificações escondem-se no ecrã bloqueado, há etiquetas nas comunidades, e o menu instala a app.",
  "changelog.releases.2026-08-20.headline":
    "Escreve a alguém novo da caixa de entrada, subscreve o teu calendário, e os membros votam.",
  "changelog.releases.2026-08-19.headline":
    "Os distintivos e níveis foram redesenhados, e os XP de Primeiros passos voltam a aparecer.",
  "changelog.releases.2026-08-18.headline":
    "Escolhe quem vê o quê no teu perfil, reclama um anúncio do diretório, e adiciona encontros ao calendário.",
  "changelog.releases.2026-08-14.headline":
    "Ganha XP, níveis e distintivos, reenquadra as tuas fotos, e acrescenta traduções a um poema.",
  "changelog.releases.2026-08-13.headline":
    "A habitação ganha mapa e visitas, a verificação tem um caminho, e os primeiros passos têm uma lista.",
  "changelog.releases.2026-08-12.headline":
    "Grupos de habitação verificados, matching explicado, e mensagens mais seguras com bloqueio e denúncia.",
  "changelog.releases.2026-08-11.headline":
    "As personas levam uma volta enorme com galerias e arrastar para ordenar, e os poemas leem-se por inteiro.",
  "changelog.releases.2026-08-10.headline":
    "As páginas de persona e a redação foram redesenhadas, e podes gerir tudo o que carregaste.",
  "changelog.releases.2026-08-09.headline":
    "Dá o teu aval a um espaço seguro, e as definições e a edição do perfil ficam mais fáceis no telemóvel.",
  "changelog.releases.2026-08-05.headline":
    "Guarda eventos em coleções, segue os temas que te importam, e vê todas as menções num só sítio.",
  "changelog.releases.2026-08-04.headline":
    "O teu feed mostra as tuas comunidades, o fórum cresce e o teu perfil cabe no telemóvel.",
  "changelog.releases.2026-08-03.headline":
    "A pesquisa abrange toda a plataforma, as notificações obedecem-te e as histórias chegam em slides.",
  "changelog.releases.2026-07-31.headline":
    "As páginas de espaços ganham um novo desenho, e as avaliações mostram quem as escreveu.",
  "changelog.releases.2026-07-30.headline":
    "Chega a pesquisa, os espaços seguros verificados entram no diretório e o cinema transmite filmes reais.",
  "changelog.releases.2026-07-29.headline":
    "Conversas de grupo, pesquisa de mensagens e GIFs chegam ao chat, e os eventos ganham uma casa só.",
  "changelog.releases.2026-07-28.headline":
    "Os convívios ganham galerias de fotos, chegam as menções e as mensagens avisam-te no telemóvel.",
  "changelog.releases.2026-07-25.headline":
    "Os subperfis ficam mais ricos, e as mensagens ganham edição, resposta e ações por toque longo.",
  "changelog.releases.2026-07-23.headline":
    "Os diretórios de habitação e colegas de casa abrem aos membros, e as rotas ficam arrumadas.",
  "changelog.releases.2026-07-22.headline":
    "O diretório local e os seus espaços abrem-se num mapa interativo.",
  "changelog.releases.2026-07-21.headline":
    "Um fluxo Genesis único configura a primeira pessoa administradora da plataforma.",
  "changelog.releases.2026-07-20.headline":
    "A QueerPulse instala-se como aplicação, e as implementações saem com fiabilidade.",
  "changelog.releases.2026-07-19.headline":
    "As páginas carregam mais depressa, e as contas oficiais usam um crachá de equipa.",
  "changelog.releases.2026-07-18.headline":
    "Correções de acessibilidade e refinamentos da interface chegam a toda a app.",
  "changelog.releases.2026-07-17.headline":
    "Toda a interface fala português, com troca a partir da navegação.",
  "changelog.releases.2026-07-16.headline":
    "Os subperfis permitem-te ter várias presenças públicas numa só conta.",
  "changelog.releases.2026-07-15.headline":
    "A app corre no seu backend real, com o modo demo ao lado.",
  "changelog.releases.2026-07-06.headline":
    "Uma página inicial redesenhada dá as boas-vindas a quem chega.",
  "changelog.releases.2026-07-05.headline":
    "O Cinema e o Estúdio juntam-se à plataforma.",
  "changelog.releases.2026-07-03.headline":
    "Os bilhetes para eventos compram-se diretamente na plataforma.",
  "changelog.releases.2026-07-01.headline":
    "Abre um diretório de negócios locais queer-friendly, e quem os gere pode adicionar o seu.",
  "changelog.releases.2026-06-30.headline":
    "O registo passa a funcionar por convite, com uma integração renovada a acompanhar.",
  "changelog.releases.2026-06-29.headline":
    "Chegam as ferramentas de moderação, a gestão de eventos e a rede de confiança.",
  "changelog.releases.2026-06-28.headline":
    "As comunidades geridas por membros e o fórum de discussão lançam-se juntos.",
  "changelog.releases.2026-06-20.headline":
    "Os novos membros têm uma integração guiada e um início de sessão mais suave.",
  "changelog.releases.2026-06-10.headline":
    "A QueerPulse arranca com as suas páginas principais e a navegação da comunidade.",
  "changelog.tag.report": "Abrir o formulário de denúncia",
  "changelog.tag.changelog": "Ver o registo de alterações",
  // Section 11, core member journeys (PRD-01..PRD-18).
  // Seccao 4 (Comunidades), 6 Set 2026.
  "changelog.entries.photos-match-your-screen-instead-of-a-guess.title":
    "As fotos passam a acertar com o teu ecrã em vez de adivinhar",
  "changelog.entries.photos-match-your-screen-instead-of-a-guess.body":
    "As imagens passam a pedir a resolução que o teu ecrã mostra, por isso carregam mais leves e ficam mais nítidas. Escolher e recortar uma foto foi refeito.",
  "changelog.entries.you-can-step-back-from-a-connection-without-blocking.title":
    "Podes afastar-te de uma ligação sem bloquear",
  "changelog.entries.you-can-step-back-from-a-connection-without-blocking.body":
    "Terminar ligação no menu da ligação pede confirmação, não avisa a outra pessoa e as mensagens ficam na tua caixa de entrada.",
  // ── Secção 10 (Recursos, sobre e cívico), 6 set 2026 ────────────────────
  "changelog.entries.help-centre-search.title": "Pesquisa no centro de ajuda",
  "changelog.entries.help-centre-search.body":
    "Uma caixa de pesquisa percorre todas as respostas de todos os separadores, e encontra em português com ou sem acentos.",
  "changelog.entries.how-communities-work-fits-on-one-screen.title":
    "Como funcionam as comunidades cabe agora num só ecrã",
  "changelog.entries.how-communities-work-fits-on-one-screen.body":
    "Os três passos para entrar ficam lado a lado num único ecrã mais largo, com o botão de convite no fim.",
  "changelog.entries.pick-your-neighbourhood-from-a-list.title":
    "Escolhe o teu bairro numa lista",
  "changelog.entries.pick-your-neighbourhood-from-a-list.body":
    "O bairro do perfil é um seletor com as 24 freguesias de Lisboa e bairros, e a mesma lista serve o filtro do diretório.",
  "changelog.entries.one-place-to-switch-between-light-and-dark.title":
    "Um só sítio para trocar entre claro e escuro",
  "changelog.entries.one-place-to-switch-between-light-and-dark.body":
    "O segundo botão de tema do rodapé saiu; o claro e o escuro continuam no menu da conta e na barra de topo.",
  "changelog.entries.a-library-of-shared-values-to-choose-from.title":
    "Uma biblioteca de valores partilhados à escolha",
  "changelog.entries.a-library-of-shared-values-to-choose-from.body":
    "Percorre oitenta valores partilhados em dez temas e marca os que encaixam, ao fundar ou ao editar uma comunidade.",
  "changelog.entries.a-library-of-shared-values-to-choose-from.details":
    "Fundar uma comunidade já não começa num campo vazio. Podes ver oitenta valores partilhados agrupados em dez temas, do consentimento e privacidade ao acesso, dinheiro, conflito e reparação, procurá-los pelas palavras e marcar os que encaixam. Escrever os teus continua lá e continua em primeiro. O mesmo painel está na edição, para uma comunidade já existente adotar um valor que nunca chegou a escrever.",
  "changelog.entries.find-any-admin-page-by-name.title":
    "Encontra qualquer página de administração pelo nome",
  "changelog.entries.find-any-admin-page-by-name.body":
    "Um campo de procura no topo do menu de administração reduz-o às páginas que correspondem, e Enter abre a primeira.",
  "changelog.entries.find-any-admin-page-by-name.details":
    "O menu de administração passa a abrir com um campo de procura. Escreve parte do nome de uma página e o menu reduz-se ao que corresponde, com os títulos de secção, para nada ficar escondido dentro de um grupo fechado. Enter abre o primeiro resultado.",
  "changelog.entries.the-homepage-card-walks-itself.title":
    "O cartão da página inicial percorre o que construímos",
  "changelog.entries.the-homepage-card-walks-itself.body":
    "O cartão avança sozinho a cada vinte segundos e para de vez assim que escolhes uma linha.",
  "changelog.entries.the-homepage-card-walks-itself.details":
    "O cartão que abre a página inicial enumera onze coisas que construímos, uma debaixo da outra, e só mostrava a história da primeira até clicares numa linha. Agora avança sozinho a cada vinte segundos, para que o fórum, o mapa, a revista e tudo o resto tenham a sua vez. Fica parado enquanto o cartão está fora do ecrã e enquanto tens lá dentro o rato ou o foco do teclado, e assim que escolhes uma linha para de vez e mantém a tua escolha. Quem navega com o movimento reduzido ativado vê o cartão tal como estava.",
  "changelog.entries.delete-a-piece-from-the-desk.title":
    "Apagar uma peça na redação",
  "changelog.entries.delete-a-piece-from-the-desk.body":
    "Cada linha tem um menu com Apagar; a confirmação diz o que vai com a peça e a proposta de origem volta à caixa de entrada.",
  "changelog.entries.delete-a-piece-from-the-desk.details":
    "Uma peça encomendada por engano, ou um rascunho que não foi a lado nenhum, não tinha forma de sair da redação: ficava no fluxo para sempre. Cada linha passa a ter um menu no fim com a opção Apagar, atrás de uma confirmação que diz exatamente o que vai com a peça, ou seja o rascunho, as versões guardadas e os comentários de quem lê. Se a peça veio de uma proposta, essa proposta volta para a caixa de entrada como pendente, para que a ideia sobreviva ao rascunho em que se tornou. Uma peça cujo artigo ou deck já está publicado fica onde está até ser despublicado, porque nada que já se lê deve desaparecer só porque arrumaste a redação.",
  "changelog.entries.tap-what-is-missing-to-go-straight-to-it.title":
    "Toca no que falta para ires direto ao campo",
  "changelog.entries.tap-what-is-missing-to-go-straight-to-it.body":
    "Cada linha da lista é um botão que desliza até ao campo, põe lá o cursor e destaca-o por um momento.",
  "changelog.entries.tap-what-is-missing-to-go-straight-to-it.details":
    "A lista por cima do botão Continuar dizia o que ainda faltava numa etapa e depois deixava-te à procura: na primeira etapa isso é voltar atrás por uma grelha de oito formatos, e na revisão por todo o resumo. Cada linha dessa lista passa a ser um botão. Carregas e o assistente desliza até ao campo, põe lá o cursor e destaca-o por um momento para veres qual era. Funciona também nos compromissos de publicação, levando-te à caixa exata que falta assinalar.",
  "changelog.entries.the-gathering-wizard-says-what-it-needs.title":
    "O assistente de convívios diz o que precisa",
  "changelog.entries.the-gathering-wizard-says-what-it-needs.body":
    "Cada etapa abre a dizer se é obrigatória ou opcional, e uma lista por cima de Continuar mostra o que ainda falta.",
  "changelog.entries.the-gathering-wizard-says-what-it-needs.details":
    "Criar um convívio passa por cinco etapas. Duas delas, a repetição e a lotação, podem ser saltadas por completo, e nada no ecrã dizia isso: o botão Continuar ficava simplesmente apagado e a única explicação era uma dica que nunca aparece no telemóvel. Cada etapa passa a abrir com uma linha a dizer se é obrigatória ou opcional, e uma lista por cima do botão mostra o que ainda falta, riscando cada linha à medida que a preenches. Na etapa de revisão indica exatamente qual o compromisso que ainda tens de confirmar. O botão passa também a ser acessível pelo teclado, para que um leitor de ecrã possa ler o motivo de ainda não estar pronto.",
  "changelog.entries.bio-mentions-read-as-names.title":
    "As menções na bio leem-se como nomes",
  "changelog.entries.bio-mentions-read-as-names.body":
    "Quem mencionas na tua bio passa a aparecer pelo nome, esteja onde estiver no diretório.",
  "changelog.entries.vouching-happens-on-each-profile.title":
    "Os votos de confiança dão-se no perfil de cada pessoa",
  "changelog.entries.vouching-happens-on-each-profile.body":
    "A página própria dos votos de confiança e o atalho no menu saíram. Abre o perfil de alguém para lhe dares o teu voto.",
  "changelog.entries.turn-a-blocked-location-back-on.title":
    "Volta a ligar uma localização bloqueada a partir do diretório",
  "changelog.entries.turn-a-blocked-location-back-on.body":
    "Passos para o teu navegador e dispositivo e, no Chrome, um botão que volta a pedir a localização.",
  "changelog.entries.your-now-card-shows-what-your-openness-does.title":
    "O teu cartão Agora mostra o que a tua disponibilidade faz",
  "changelog.entries.your-now-card-shows-what-your-openness-does.body":
    "A tua nota de limites vive aqui também, com olás por etiqueta e um empurrão para trocares as mais paradas.",
  "changelog.entries.your-now-card-shows-what-your-openness-does.details":
    "O cartão passa a reunir o teu estado, a tua nota de limites e a tua disponibilidade num só sítio, atualizados juntos a partir de um único botão. Como dono do perfil, vês também quantos olás cada etiqueta recebeu nos últimos 90 dias e a quantos respondeste, um empurrão para trocares uma que ninguém bateu, e os estados que já deixaste para trás. Não há contagem de visualizações. Quem visita vê o mesmo cartão sem esses números, e continua a poder tocar numa etiqueta para te contactar com o motivo já preenchido. Cada número vem de pedidos de ligação que já existiam. Nada de novo sobre como usas a aplicação passa a ser registado.",
  "changelog.entries.the-app-opens-on-your-feed-not-a-blank-screen.title":
    "A app instalada abre no teu mural, não num ecrã vazio",
  "changelog.entries.the-app-opens-on-your-feed-not-a-blank-screen.body":
    "Abrir a app no telemóvel já não deixa um ecrã de espaço vazio acima do teu mural até fazeres scroll.",
  "changelog.entries.admins-see-which-address-you-sign-in-with.title":
    "A administração vê com que endereço um membro entra na conta",
  "changelog.entries.admins-see-which-address-you-sign-in-with.body":
    "A gaveta do membro mostra-o em parte, e revelá-lo por inteiro fica registado na auditoria com o nome de quem o fez.",
  "changelog.entries.sign-in-with-a-different-google-account.title":
    "Inicia sessão com outra conta Google",
  "changelog.entries.sign-in-with-a-different-google-account.body":
    "Depois de uma sessão recusada, o botão abre o seletor de contas da Google em vez de repetir a mesma conta.",
  "changelog.entries.listing-photos-come-from-your-uploads.title":
    "As fotos da ficha vêm dos teus ficheiros",
  "changelog.entries.listing-photos-come-from-your-uploads.body":
    "Adiciona fotos à tua ficha de negócio carregando-as, para que cada imagem continue a funcionar e passe pelo mesmo recorte e verificação de tamanho.",
  "changelog.entries.accepting-a-connection-request-works-again.title":
    "Aceitar um pedido de ligação volta a funcionar",
  "changelog.entries.accepting-a-connection-request-works-again.body":
    "Desde 31 de agosto, aceitar dava erro e o pedido ficava à espera; já podes aceitar esses pedidos.",
  "changelog.entries.read-more-on-a-workshop-persona-keeps-your-place.title":
    "Ler mais numa persona Oficina mantém-te onde estavas",
  "changelog.entries.read-more-on-a-workshop-persona-keeps-your-place.body":
    "Uma bio longa abre-se agora abaixo da linha que estavas a ler, também em personas com poucas secções ou nenhuma.",
  "changelog.entries.listing-photos-flag-problems-before-you-submit.title":
    "As fotos do negócio assinalam problemas antes de enviares",
  "changelog.entries.listing-photos-flag-problems-before-you-submit.body":
    "Tipos de ficheiro não suportados e ficheiros demasiado grandes ficam assinalados na foto.",
  "changelog.entries.show-a-photo-of-your-certificate-on-a-persona.title":
    "Junta a foto do teu certificado a uma persona",
  "changelog.entries.show-a-photo-of-your-certificate-on-a-persona.body":
    "Credenciais e formações aceitam a foto do diploma, em tamanho real, com um lembrete para tapares números de identificação.",
  "changelog.entries.the-directory-stops-pitching-invites-to-members.title":
    "O diretório deixa de sugerir um convite a quem já é membro",
  "changelog.entries.the-directory-stops-pitching-invites-to-members.body":
    "Só membros com sessão iniciada abrem o diretório, por isso o apelo para aderir no fundo da página saiu.",
  "changelog.entries.list-your-business-from-the-directory-hero.title":
    "Regista o teu negócio a partir do topo do diretório",
  "changelog.entries.list-your-business-from-the-directory-hero.body":
    "O botão fica ao lado da nota de verificação, sem teres de percorrer todos os resultados para o encontrar.",
  "changelog.entries.reposition-a-photo-you-already-uploaded.title":
    "Reposiciona uma foto que já carregaste",
  "changelog.entries.reposition-a-photo-you-already-uploaded.body":
    "Cada foto em As tuas fotos ganha um botão para a aproximar e mover sem a voltares a carregar.",
  "changelog.entries.edit-a-gatherings-care-and-rsvps-after-publishing.title":
    "Edita os cuidados e as confirmações de um convívio já publicado",
  "changelog.entries.edit-a-gatherings-care-and-rsvps-after-publishing.body":
    "As confirmações podem fechar quando o convívio começa, e os convívios que se repetem mantêm a hora quando os relógios mudam.",
  "changelog.entries.calendars-open-in-front-of-dialogs.title":
    "Os calendários abrem à frente das janelas",
  "changelog.entries.calendars-open-in-front-of-dialogs.body":
    "O calendário abre agora por cima quando escolhes uma data num editor, como a formação de um perfil alternativo.",
  "changelog.entries.the-personas-section-shows-who-sees-each-side.title":
    "A secção de perfis alternativos mostra quem vê cada lado",
  "changelog.entries.the-personas-section-shows-who-sees-each-side.body":
    "Escolhe um perfil alternativo para veres a página dele ao lado de quem o encontra e se está ligado ao teu nome.",
  "changelog.entries.guide-editor-workspace.title":
    "Edita guias de recursos num espaço de trabalho completo",
  "changelog.entries.guide-editor-workspace.body":
    "Formatação, pré-visualização ao vivo, cartões, ligações para onde cada guia aparece e rascunhos guardados no navegador.",
  "changelog.entries.create-a-gathering-in-five-short-chapters.title":
    "Cria um convívio em cinco capítulos curtos, com pré-visualização ao vivo",
  "changelog.entries.create-a-gathering-in-five-short-chapters.body":
    "Agora podes juntar regras da casa, avisos de conteúdo, temas, perguntas ao confirmar presença e um prazo para confirmar.",
  "changelog.entries.the-landing-page-drops-the-bottom-bar-for-visitors.title":
    "A página inicial no telemóvel deixa de mostrar a barra de baixo a visitantes",
  "changelog.entries.the-landing-page-drops-the-bottom-bar-for-visitors.body":
    "Sem sessão iniciada, lês a apresentação em ecrã inteiro, com os links do rodapé de volta no fim da página.",
  "changelog.entries.the-phone-top-bar-slides-away-as-you-scroll.title":
    "A barra de cima no telemóvel esconde-se ao deslizares a página",
  "changelog.entries.the-phone-top-bar-slides-away-as-you-scroll.body":
    "Ao descer lês com o ecrã inteiro, e a barra volta suavemente mal deslizas para cima.",
  "changelog.entries.communities-takes-the-members-tab.title":
    "As Comunidades ficam com o separador dos Membros no telemóvel",
  "changelog.entries.communities-takes-the-members-tab.body":
    "A barra de baixo abre agora Comunidades e Coletivos, e o diretório de membros fica em Mais.",
  "changelog.entries.the-bell-opens-your-recent-notifications.title":
    "O sino abre as tuas notificações recentes ali mesmo",
  "changelog.entries.the-bell-opens-your-recent-notifications.body":
    "Percorre as mais recentes em qualquer página e abre a lista completa no botão ao fundo.",
  "changelog.entries.messages-on-a-phone-gets-its-own-header.title":
    "As mensagens no telemóvel têm o seu próprio cabeçalho",
  "changelog.entries.messages-on-a-phone-gets-its-own-header.body":
    "A barra superior sai do caminho, e uma seta ao lado do logótipo QueerPulse leva-te de volta para onde estavas.",
  "changelog.entries.writer-and-poet-personas-show-their-photo.title":
    "As personas de escrita e poesia mostram a sua foto",
  "changelog.entries.writer-and-poet-personas-show-their-photo.body":
    "Jornalistas, editores, tradutores e académicos também: a foto que carregas aparece agora como retrato por cima do nome.",
  "changelog.entries.pick-a-wallpaper-for-each-chat.title":
    "Escolhe um papel de parede para cada conversa",
  "changelog.entries.pick-a-wallpaper-for-each-chat.body":
    "Seis cores de fundo e um padrão suave de rabiscos, por conversa ou em todas de uma vez.",
  "changelog.entries.messages-fills-the-screen.title":
    "As mensagens ocupam o ecrã",
  "changelog.entries.messages-fills-the-screen.body":
    "No computador a barra do site sai da frente, e o teu perfil, os alertas e a saída ficam por baixo da caixa de entrada.",
  "changelog.entries.the-landing-page-has-its-own-nav.title":
    "A página inicial tem a sua própria barra",
  "changelog.entries.the-landing-page-has-its-own-nav.body":
    "Sem sessão iniciada, a barra troca os menus por ligações às secções da página, entrar e pedir um convite.",
  "changelog.entries.a-long-bio-folds-until-you-open-it.title":
    "Uma bio longa fica dobrada até a abrires",
  "changelog.entries.a-long-bio-folds-until-you-open-it.body":
    "Os perfis de membro e de persona mostram as primeiras linhas, com Ler mais para o resto.",
  "changelog.entries.housing-explains-itself-before-the-door.title":
    "O alojamento explica-se antes de te pedir para entrares",
  "changelog.entries.housing-explains-itself-before-the-door.body":
    "Sem sessão iniciada, o botão de alojamento da página inicial abre o que é, em vez do ecrã de entrada.",
  "changelog.entries.housing-explains-itself-before-the-door.details":
    "O quadro de alojamento e o de colegas de casa são só para membros, por isso quem estava de fora e carregasse em qualquer um deles caía no ecrã de entrada sem explicação nenhuma. A secção da página inicial passa a ter um único botão que abre uma explicação curta: os grupos de habitação triados que escolhem quem entra, como uma visita liberta a morada exata e acaba numa avaliação cega dos dois lados, e porque é que o quadro tem uma porta. Também liga à página das cooperativas de habitação, que qualquer pessoa pode ler sem conta.",
  "changelog.entries.pick-the-gathering-you-actually-want-to-host.title":
    "Escolhe o convívio que queres mesmo organizar",
  "changelog.entries.pick-the-gathering-you-actually-want-to-host.body":
    "Nove tipos e cinquenta e seis formatos substituem os oito antigos, e agora o formato já define um tamanho sensato e faz as suas próprias perguntas.",
  "changelog.entries.pick-the-gathering-you-actually-want-to-host.details":
    "O assistente oferecia oito formatos, e um deles era Outro. Um piquenique, uma noite de colagem, uma noite de karaoke ou um clube de corrida não tinham onde encaixar, por isso quem faria os convívios mais acolhedores escolhia Outro ou desistia. Agora há nove tipos, cada um com a sua própria energia, e cinquenta e seis formatos lá dentro, com uma caixa que procura em todos eles e um campo de texto para o que ninguém se lembrou. O passo agora faz o que sempre pareceu fazer: o formato define um tamanho sensato para o convívio, decide se a página conta quem vai e faz-te uma ou duas perguntas que só ele levanta. Uma mesa partilhada pergunta o que trazer. Uma noite de discoteca pergunta pela porta e por quem não bebe. Uma caminhada pergunta pelo terreno. Uma sessão de cinema pergunta quanto dura o filme. As respostas aparecem na página do convívio em Bom saber, e o quadro de descoberta abre com os nove tipos para encontrares uma terça-feira de que gostes sem leres cinquenta títulos.",
  "changelog.entries.a-gathering-can-run-past-midnight.title":
    "Um convívio pode passar da meia-noite",
  "changelog.entries.a-gathering-can-run-past-midnight.body":
    "Diz quando o teu acaba, mesmo que seja às quatro da manhã ou três dias depois.",
  "changelog.entries.a-gathering-can-run-past-midnight.details":
    "Um convívio só podia começar e acabar na mesma data, por isso uma festa das 23h às 4h não tinha onde o dizer e um festival de fim de semana era impossível. O assistente passa a pedir a data de fim além da hora, preenche-a por ti e passa-a para o dia seguinte sozinho quando a hora de fim fica antes da de início. Todas as páginas que mostram um horário dizem quando um convívio entra pela manhã seguinte, e as que mostram um intervalo passam a nomear os dois dias. Podes mudar o fim depois de publicares, coisa que até agora te deixava num beco sem saída: passar o início para depois do fim guardado era recusado sem nada no formulário que desse para corrigir. Um convívio a decorrer fica também onde o irias procurar, na descoberta, nas páginas da comunidade e do espaço, no painel e na tua lista de planos, em vez de desaparecer assim que começava.",
  "changelog.entries.the-changelog-reads-as-releases.title":
    "O registo de alterações lê-se como lançamentos",
  "changelog.entries.the-changelog-reads-as-releases.body":
    "Cada dia é um lançamento com versão, título, destaques e entradas agrupadas por tipo, que podes abrir e fechar.",
  "changelog.entries.run-your-gathering-from-its-own-page.title":
    "Gere o teu encontro a partir da página dele",
  "changelog.entries.run-your-gathering-from-its-own-page.body":
    "Uma faixa de anfitrião por baixo do RSVP deixa-te editar, cancelar ou apagar o encontro onde estás.",
  "changelog.entries.run-your-gathering-from-its-own-page.details":
    "Na página de um encontro que organizas, vias tudo o que um convidado vê e não podias fazer nada: para editar ou cancelar tinhas de voltar a Os meus eventos e procurar a ligação. A página do teu encontro passa a ter uma faixa de anfitrião por baixo da linha de inscrição. Editas os detalhes ali mesmo, cancelas ou eliminas de vez, e Gerir continua a levar-te às inscrições, aos avisos e ao painel do próprio dia. Cancelar mantém o encontro no quadro marcado como cancelado e avisa quem tem lugar. Eliminar remove-o para sempre sem avisar ninguém, por isso só está disponível depois de o encontro ser cancelado ou enquanto ainda ninguém se inscreveu. Se já houver gente a contar com ele, a plataforma pede-te que canceles primeiro para que sejam avisadas.",
  "changelog.entries.a-persona-page-is-one-colour-again.title":
    "As páginas de persona abrem na cor certa",
  "changelog.entries.a-persona-page-is-one-colour-again.body":
    "A faixa por trás da navegação flutuante passa a ter o fundo da própria persona, no tema claro e no escuro.",
  "changelog.entries.a-persona-page-is-one-colour-again.details":
    "Cada estilo de ofício pinta o seu próprio fundo, mas a faixa onde assenta a navegação flutuante mantinha o creme do site, por isso a maioria das páginas de persona abria com uma banda no topo que destoava da página por baixo. Essa faixa passa a ter o fundo da própria persona, no tema claro e no escuro, para que a página de quem ensina yoga, o céu de quem lê astrologia e a ementa de quem cozinha se leiam como uma só superfície desde o topo. As páginas cuja imagem de capa já subia por trás da navegação ficam exatamente na mesma.",
  "changelog.entries.link-people-and-places-from-your-bio.title":
    "Liga pessoas e lugares a partir da tua biografia",
  "changelog.entries.link-people-and-places-from-your-bio.body":
    "Escreve @, c/, e/ ou t/ na biografia para ligar um membro, comunidade, evento ou tópico do fórum; ninguém é notificado.",
  "changelog.entries.link-people-and-places-from-your-bio.details":
    "A tua biografia passa a aceitar os mesmos atalhos que as mensagens e o fórum já tinham. Escreve @ para um membro, c/ para uma comunidade, e/ para um evento ou t/ para um tópico do fórum, escolhe da lista que aparece, e o nome fica uma ligação no teu perfil. Funciona também na tua biografia em português e em todas as páginas de persona. Ninguém recebe notificação quando é nomeado: uma biografia é texto permanente, por isso fica em silêncio por mais vezes que a edites.",
  "changelog.entries.see-what-a-save-will-change-before-you-save-it.title":
    "Vê o que uma gravação vai alterar antes de gravares",
  "changelog.entries.see-what-a-save-will-change-before-you-save-it.body":
    "As definições da comunidade listam o que Guardar vai escrever, e mudar valores avisa que todos concordam outra vez.",
  "changelog.entries.see-what-a-save-will-change-before-you-save-it.details":
    "O formulário de definições da comunidade passa a listar o que carregar em Guardar vai escrever, mesmo por cima do botão. Nos valores partilhados são nomeados os que entram e os que saem, e o formulário diz com clareza que alterá-los pede a todos os membros que concordem outra vez. O registo de governação lê-se da mesma forma: uma alteração aos valores mostra o que foi adicionado e o que foi removido, em vez de imprimir a lista inteira duas vezes.",
  "changelog.entries.the-tag-list-folds-away-once-you-have-picked.title":
    "A lista de etiquetas fecha-se depois de escolheres",
  "changelog.entries.the-tag-list-folds-away-once-you-have-picked.body":
    "Editar uma comunidade mostra só as etiquetas que escolheste, com um botão para abrir as 53 quando quiseres mudar.",
  "changelog.entries.switch-language-from-your-account-menu.title":
    "Muda de idioma a partir do teu menu de conta",
  "changelog.entries.switch-language-from-your-account-menu.body":
    "English e Português ficam ao lado do seletor de claro e escuro no menu de conta, e no painel de conta no telemóvel.",
  "changelog.entries.the-theme-switch-moves-into-your-account-menu.title":
    "O seletor de tema passa para o teu menu de conta",
  "changelog.entries.the-theme-switch-moves-into-your-account-menu.body":
    "O claro e o escuro ficam junto a Guardados e Definições no menu de conta; sem sessão, o seletor fica na barra superior.",
  "changelog.entries.the-account-menu-drops-the-maintenance-controls.title":
    "O menu de conta deixa de ter os controlos de manuten\u00e7\u00e3o",
  "changelog.entries.the-account-menu-drops-the-maintenance-controls.body":
    "Preencher a plataforma, Simulações de fluxo e o seletor de Navegação aparecem só a admins da plataforma.",
  "changelog.entries.the-homepage-personas-take-turns.title":
    "As personas da página inicial passam a alternar",
  "changelog.entries.the-homepage-personas-take-turns.body":
    "A montra de personas avança a cada vinte segundos, para sob o rato e fica parada de vez quando escolhes uma.",
  "changelog.entries.persona-cards-now-show-the-banner.title":
    "Os cartões de persona já mostram o banner",
  "changelog.entries.persona-cards-now-show-the-banner.body":
    "Os cartões do diretório mostram o teu banner no topo, enquadrado como o posicionaste; sem banner, fica a mancha de cor.",
  "changelog.entries.save-profile-stays-off-until-you-change-something.title":
    "Guardar perfil só fica ativo quando mudas alguma coisa",
  "changelog.entries.save-profile-stays-off-until-you-change-something.body":
    "O botão fica apagado até mudares mesmo alguma coisa, e enquanto não mexeres em nada o outro diz Voltar.",
  "changelog.entries.hear-your-name-before-you-save-it.title":
    "Ouve o teu nome antes de o guardares",
  "changelog.entries.hear-your-name-before-you-save-it.body":
    "Um botão ouvir sob o campo da pronúncia usa a mesma voz que as visitas ouvem, para ajustares a grafia até soar a ti.",
  "changelog.entries.every-cookie-we-set-now-has-its-real-name.title":
    "Cada cookie que usamos passa a ter o nome verdadeiro",
  "changelog.entries.every-cookie-we-set-now-has-its-real-name.body":
    "A página de cookies lista os quatro cookies que usamos, o que cada um faz e quanto dura, e as escolhas de privacidade também.",
  "changelog.entries.a-safe-space-badge-has-to-be-earned.title":
    "Um emblema de espaço seguro tem de ser conquistado",
  "changelog.entries.a-safe-space-badge-has-to-be-earned.body":
    "As três visitas são verificadas antes de atribuir o emblema; a equipa pode atribuir com menos, com a razão registada.",
  "changelog.entries.rooms-in-a-vetted-group-are-for-its-members.title":
    "Os quartos de um grupo vetado são para os seus membros",
  "changelog.entries.rooms-in-a-vetted-group-are-for-its-members.body":
    "Os quartos de um grupo de habitação com triagem só são visíveis aos membros; o grupo, a cidade e as regras ficam abertos.",
  "changelog.entries.a-viewing-that-tells-you-what-happened.title":
    "Uma visita que te diz o que aconteceu",
  "changelog.entries.a-viewing-that-tells-you-what-happened.body":
    "Pedidos, aceitações, propostas de outro horário, recusas e cancelamentos chegam-te agora como notificações na aplicação.",
  "changelog.entries.the-exact-address-once-you-connect.title":
    "A morada exata, assim que se ligam",
  "changelog.entries.the-exact-address-once-you-connect.body":
    "Quem anuncia pode indicar a morada, visível só para ligações e visitas aceites; os outros continuam a ver o bairro.",
  "changelog.entries.an-answer-on-your-housing-application.title":
    "Uma resposta à tua candidatura de habitação",
  "changelog.entries.an-answer-on-your-housing-application.body":
    "Recebes notificação quando uma cooperativa ou grupo de habitação decide, e as páginas mostram o estado do teu pedido.",
  "changelog.entries.filter-for-pets-furnishing-and-deposit.title":
    "Filtra por animais, mobília e caução",
  "changelog.entries.filter-for-pets-furnishing-and-deposit.body":
    "Mobilado e Aceita animais são filtros, e quem anuncia pode indicar a caução, à qual podes pôr um limite na pesquisa.",
  "changelog.entries.a-warning-before-your-listing-expires.title":
    "Um aviso antes de o teu anúncio expirar",
  "changelog.entries.a-warning-before-your-listing-expires.body":
    "O teu anúncio avisa-te uma semana antes de os sessenta dias acabarem, e o cartão mostra quantos dias faltam.",
  "changelog.entries.landlord-recommendations-say-what-they-are.title":
    "As recomendações de senhorios dizem o que são",
  "changelog.entries.landlord-recommendations-say-what-they-are.body":
    "Dizes quando arrendaste a essa pessoa, a recomendação fica marcada como declarada e não verificada, e ela pode responder.",
  "changelog.entries.counts-and-dates-you-can-trust.title":
    "Contagens e datas em que podes confiar",
  "changelog.entries.counts-and-dates-you-can-trust.body":
    "As contagens do diretório e espaços seguros são reais, as datas também, e os guias de vistos e chegada têm data de revisão.",
  "changelog.entries.reporting-without-an-account.title":
    "Denunciar sem ter conta",
  "changelog.entries.reporting-without-an-account.body":
    "Enviar uma denúncia sem sessão falhava; agora funciona a partir das páginas de segurança, de um anúncio, encontro ou perfil.",
  "changelog.entries.report-from-where-you-are.title":
    "Denuncia a partir de onde encontras o problema",
  "changelog.entries.report-from-where-you-are.body":
    "Um encontro pode ser denunciado na própria página sem entrares na lista; oportunidades e perfis também têm denúncia.",
  "changelog.entries.a-receipt-when-you-report.title":
    "Um comprovativo assim que denuncias",
  "changelog.entries.a-receipt-when-you-report.body":
    "Uma confirmação com a referência do caso fica logo nas tuas notificações, para a guardares depois de fechares a mensagem.",
  "changelog.entries.every-decision-carries-a-reason.title":
    "Todas as decisões vêm com a sua justificação",
  "changelog.entries.every-decision-carries-a-reason.body":
    "Um moderador tem de escrever a justificação que recebes antes de registar aviso, restrição, suspensão, bloqueio ou remoção.",
  "changelog.entries.appeal-dates-you-can-hold-us-to.title":
    "Prazos de recurso a que nos podes obrigar",
  "changelog.entries.appeal-dates-you-can-hold-us-to.body":
    "A página de recurso mostra quanto tempo tens para o apresentar, e o teu recurso mostra a data em que te devemos resposta.",
  "changelog.entries.guides-and-partners-without-signing-in.title":
    "Páginas públicas que abrem mesmo sem sessão iniciada",
  "changelog.entries.guides-and-partners-without-signing-in.body":
    "O glossário, os parceiros, o voluntariado, o registo de governação e as listas de apoio jurídico e testagem abrem sem sessão.",
  "changelog.entries.a-code-to-follow-your-concern.title":
    "Um código para acompanhar uma preocupação que levantaste",
  "changelog.entries.a-code-to-follow-your-concern.body":
    "Levantar uma preocupação sem conta dá-te um código de referência para veres se está à espera, em análise ou fechada.",
  "changelog.entries.the-decision-log-can-grow.title":
    "O registo de decisões já pode receber a próxima decisão",
  "changelog.entries.the-decision-log-can-grow.body":
    "A equipa de governação escreve, edita e reordena entradas do registo público nas duas línguas, sem esperar por atualização.",
  "changelog.entries.partners-keep-their-own-page.title":
    "As organizações parceiras mantêm a sua própria página",
  "changelog.entries.partners-keep-their-own-page.body":
    "Uma organização parceira aprovada edita telefone, morada e descrição; nível e data de entrada ficam com a equipa.",
  "changelog.entries.one-way-to-apply-as-a-partner.title":
    "Uma só forma de te candidatares a parceria",
  "changelog.entries.one-way-to-apply-as-a-partner.body":
    "A página Para Organizações e o formulário levam à candidatura de parceria verdadeira, e a resposta chega na aplicação.",
  "changelog.entries.the-glossary-reads-in-portuguese.title":
    "O glossário abre na tua língua",
  "changelog.entries.the-glossary-reads-in-portuguese.body":
    "As etiquetas de categoria abrem também na tua língua, até seres tu a mudar, e a pesquisa lê as definições em português.",
  "changelog.entries.suggest-a-glossary-term.title":
    "Sugerir um termo que falta",
  "changelog.entries.suggest-a-glossary-term.body":
    "As sugestões chegam à equipa editorial, que tem uma consola para acrescentar o termo e terminar a definição em português.",
  "changelog.entries.reach-the-team-behind-an-opportunity.title":
    "Falar com a equipa por trás de uma oportunidade de voluntariado",
  "changelog.entries.reach-the-team-behind-an-opportunity.body":
    "Enviar mensagem à equipa abre uma conversa com quem publicou, e quem pode rever candidaturas vê a lista na sua publicação.",
  "changelog.entries.approved-resources-appear-straight-away.title":
    "Um recurso aprovado aparece no diretório",
  "changelog.entries.approved-resources-appear-straight-away.body":
    "Aprovar a sugestão de um membro publica a ficha no mesmo passo, com os dados confirmados antes.",
  "changelog.entries.guides-get-reviewed-on-time.title":
    "Os guias são revistos a tempo",
  "changelog.entries.guides-get-reviewed-on-time.body":
    "Um guia fica escondido até ser confirmado; os fora de prazo sinalizam a fila de administração e avisam quem os cuida.",
  "changelog.entries.the-trans-healthcare-guide-in-portuguese.title":
    "O guia de saúde trans, em português",
  "changelog.entries.the-trans-healthcare-guide-in-portuguese.body":
    "Os percursos clínicos e o diretório QTIPOC estão todos traduzidos, com tempos de espera, custos e referências legais.",
  "changelog.entries.forms-instead-of-email-links.title":
    "Formulários em vez de ligações de email",
  "changelog.entries.forms-instead-of-email-links.body":
    "Sugestões e perguntas de imprensa passam por formulários na app, para terem fila e resposta.",
  "changelog.entries.send-a-document-in-a-message.title":
    "Já podes enviar um documento numa mensagem",
  "changelog.entries.send-a-document-in-a-message.body":
    "Anexa um PDF, ficheiro de texto, CSV ou folha de cálculo até 20 MB; chega como cartão com nome, formato e tamanho.",
  "changelog.entries.delete-a-message-just-for-you.title":
    "Já podes eliminar uma mensagem só para ti",
  "changelog.entries.delete-a-message-just-for-you.body":
    "Eliminar só para mim fica ao lado de eliminar para todos; a mensagem sai só da tua vista, em todos os teus dispositivos.",
  "changelog.entries.mark-a-conversation-unread.title":
    "Já podes marcar uma conversa como não lida",
  "changelog.entries.mark-a-conversation-unread.body":
    "Marcar como não lida está no menu da conversa, vale em todos os dispositivos e limpa-se quando abres a conversa outra vez.",
  "changelog.entries.new-messages-reach-you-wherever-you-are.title":
    "As mensagens novas chegam-te onde quer que estejas",
  "changelog.entries.new-messages-reach-you-wherever-you-are.body":
    "A caixa de entrada e o contador de não lidas atualizam-se assim que chega mensagem a qualquer conversa, fechadas incluídas.",
  "changelog.entries.an-enquiry-reply-no-longer-fails-in-silence.title":
    "Responder a um contacto sobre casa já não falha em silêncio",
  "changelog.entries.an-enquiry-reply-no-longer-fails-in-silence.body":
    "Responder a um contacto sobre casa precisa de uma ligação; a conversa di-lo e oferece-te o pedido de ligação ali mesmo.",
  "changelog.entries.notifications-you-can-clear-that-open-the-right-thing.title":
    "Notificações que consegues limpar e que abrem o que dizem",
  "changelog.entries.notifications-you-can-clear-that-open-the-right-thing.body":
    "Limpam-se de vez em todos os dispositivos, abrem a publicação ou mensagem certa, e o número no topo bate certo com o sino.",
  "changelog.entries.hiding-your-photo-now-holds-everywhere.title":
    "Desligar a tua foto passa a valer em todo o lado",
  "changelog.entries.hiding-your-photo-now-holds-everywhere.body":
    "Mostrar a tua foto passa por uma única verificação em mensagens, encontros, ligações, cartões de membro e página pública.",
  "changelog.entries.someone-you-blocked-can-no-longer-vouch-for-you.title":
    "Quem bloqueaste já não te pode dar voto de confiança",
  "changelog.entries.someone-you-blocked-can-no-longer-vouch-for-you.body":
    "Bloquear recusa o voto de confiança, um voto existente deixa de contar e de aparecer no teu perfil, e desbloquear repõe-no.",
  "changelog.entries.a-hidden-vouch-list-no-longer-reads-as-none.title":
    "Uma lista de votos escondida já não se lê como nenhum voto",
  "changelog.entries.a-hidden-vouch-list-no-longer-reads-as-none.body":
    "Com a lista de votos privada, o cabeçalho do perfil mostra o número verdadeiro e diz que os nomes são privados.",
  "changelog.entries.a-private-profile-now-says-so-instead-of-looking-abandoned.title":
    "Um perfil privado passa a dizê-lo em vez de parecer abandonado",
  "changelog.entries.a-private-profile-now-says-so-instead-of-looking-abandoned.body":
    "Um perfil privado, ou só para ligações, tem uma nota curta a dizer que foi escolha da pessoa e o que mudaria.",
  "changelog.entries.hiding-yourself-now-holds-on-the-people-like-you-row.title":
    "Esconderes-te passa a valer na fila Pessoas como tu",
  "changelog.entries.hiding-yourself-now-holds-on-the-people-like-you-row.body":
    "Aplica bloqueios, esconderes-te de uma pessoa, Esconder-me durante 24 horas e remoções pela moderação, como qualquer lista.",
  "changelog.entries.renaming-your-username-no-longer-breaks-every-link-to-you.title":
    "Mudar de nome de utilizador já não parte todas as ligações para ti",
  "changelog.entries.renaming-your-username-no-longer-breaks-every-link-to-you.body":
    "As ligações antigas para o teu nome encaminham para o endereço novo e dizem-no, no perfil e na página pública.",
  "changelog.entries.you-can-search-the-member-directory-by-name.title":
    "Podes procurar no diretório de pessoas pelo nome",
  "changelog.entries.you-can-search-the-member-directory-by-name.body":
    "Uma caixa de procura encontra parte de um nome e funciona ao lado dos filtros que já tinhas.",
  "changelog.entries.the-persona-directory-now-searches-all-of-it-at-once.title":
    "O diretório de personas passa a procurar em tudo de uma vez",
  "changelog.entries.the-persona-directory-now-searches-all-of-it-at-once.body":
    "A procura corre no servidor sobre todas as personas, por isso vê para lá da número dois mil num único pedido.",
  "changelog.entries.a-co-owned-persona-link-opens-the-right-persona.title":
    "Uma persona partilhada abre a persona certa",
  "changelog.entries.a-co-owned-persona-link-opens-the-right-persona.body":
    "Cada persona tem um endereço só, no telemóvel e no computador, por isso uma ligação do perfil de quem copossui abre a certa.",
  "changelog.entries.no-more-persona-share-links-and-qr-codes-that-lead-nowhere.title":
    "Acabaram as ligações e códigos QR de personas que não levam a lado nenhum",
  "changelog.entries.no-more-persona-share-links-and-qr-codes-that-lead-nowhere.body":
    "Partilhar, código QR, cartão de contacto e Ver usam o endereço real da persona, ou ficam indisponíveis a dizer o que fazer.",
  "changelog.entries.co-owners-are-offered-leave-instead-of-a-delete-that-fails.title":
    "Quem copossui recebe Sair em vez de um Eliminar que falha",
  "changelog.entries.co-owners-are-offered-leave-instead-of-a-delete-that-fails.body":
    "Só quem criou a persona pode Eliminar, por isso quem copossui vê Sair nesse lugar; o aviso conta bem as pessoas afetadas.",
  "changelog.entries.the-personas-you-follow-now-have-a-home.title":
    "As personas que segues passam a ter um sítio",
  "changelog.entries.the-personas-you-follow-now-have-a-home.body":
    "Um separador Que segues no diretório de personas lista-as com deixar de seguir em cada linha e avisa quando publicam.",
  "changelog.entries.badges-levels-and-perks-now-read-in-your-language.title":
    "Distintivos e níveis passam a ler-se na tua língua",
  "changelog.entries.badges-levels-and-perks-now-read-in-your-language.body":
    "Os nomes dos distintivos, o que cada um pede, os filtros por categoria e os sete níveis seguem a língua que escolheste.",
  "changelog.entries.a-membership-card-check-shows-a-real-role-name.title":
    "A verificação de um cartão mostra um nome de função a sério",
  "changelog.entries.a-membership-card-check-shows-a-real-role-name.body":
    "Ler o cartão de quem copossui à porta mostra o nome da função; uma função desconhecida mostra algo legível.",
  "changelog.entries.invite-only-communities-can-finally-let-people-in.title":
    "As comunidades por convite já conseguem deixar entrar",
  "changelog.entries.invite-only-communities-can-finally-let-people-in.body":
    "Quem convidas para uma comunidade privada ou por convite vê-a e entra diretamente, e podes retirar o convite.",
  "changelog.entries.your-invitations-now-wait-for-you-in-one-place.title":
    "Os teus convites ficam à tua espera num só sítio",
  "changelog.entries.your-invitations-now-wait-for-you-in-one-place.body":
    "Uma página lista as comunidades que te pediram para entrar e quem te convidou, com abrir ou recusar; recusar é discreto.",
  "changelog.entries.an-archived-community-stays-readable-to-its-members.title":
    "Uma comunidade arquivada continua legível para quem a construiu",
  "changelog.entries.an-archived-community-stays-readable-to-its-members.body":
    "Quem era membro continua a ler todas as publicações e recursos, e ninguém pode publicar, responder, reagir ou entrar.",
  "changelog.entries.leaving-a-community-you-run-now-points-you-somewhere.title":
    "Sair de uma comunidade que é tua já te leva a algum lado",
  "changelog.entries.leaving-a-community-you-run-now-points-you-somewhere.body":
    "Uma comunidade não pode ficar sem quem responda por ela, por isso dizemos-to e levamos-te à passagem de testemunho.",
  "changelog.entries.the-communities-home-tab-shows-your-real-week.title":
    "O separador inicial das comunidades mostra a tua semana a sério",
  "changelog.entries.the-communities-home-tab-shows-your-real-week.body":
    "A vista geral lê das tuas comunidades: o que foi publicado, o que vem aí e o que está à tua espera.",
  "changelog.entries.you-can-see-a-communitys-gatherings-before-you-join.title":
    "Já podes ver os convívios de uma comunidade antes de entrares",
  "changelog.entries.you-can-see-a-communitys-gatherings-before-you-join.body":
    "Os convívios abertos veem-se de fora; o que a comunidade reserva a quem é membro continua reservado, e a página diz-to.",
  "changelog.entries.communities-can-set-a-mark-and-a-welcome-note.title":
    "As comunidades podem ter uma marca e uma nota de boas-vindas",
  "changelog.entries.communities-can-set-a-mark-and-a-welcome-note.body":
    "Uma marca pequena e quadrada ao lado do nome e uma nota de boas-vindas para quem chega; ambas são opcionais.",
  "changelog.entries.a-post-taken-down-now-comes-with-a-reason.title":
    "Uma publicação removida passa a vir com um motivo",
  "changelog.entries.a-post-taken-down-now-comes-with-a-reason.body":
    "A moderação pode dar um motivo e citar a regra da casa; isso chega-te e fica no registo da comunidade.",
  "changelog.entries.you-can-take-back-a-request-to-join.title":
    "Já podes retirar um pedido para entrar",
  "changelog.entries.you-can-take-back-a-request-to-join.body":
    "O botão de pedido enviado retira o teu pedido sem custo, e podes pedir outra vez de imediato.",
  "changelog.entries.finding-the-busiest-communities-is-instant.title":
    "Encontrar as comunidades mais activas é instantâneo",
  "changelog.entries.finding-the-busiest-communities-is-instant.body":
    "Ordenar o Descobrir por mais activas acontece do nosso lado, por isso os primeiros resultados chegam de uma vez.",
  "changelog.entries.an-outage-no-longer-looks-like-an-empty-page.title":
    "Uma falha já não parece uma página vazia",
  "changelog.entries.an-outage-no-longer-looks-like-an-empty-page.body":
    "Quando algo falha a carregar, dizemos isso e damos Tentar de novo; a mensagem de vazio só aparece quando é verdade.",
  "changelog.entries.onboarding-never-guesses-your-visibility.title":
    "As boas-vindas nunca adivinham a tua visibilidade",
  "changelog.entries.onboarding-never-guesses-your-visibility.body":
    "O passo das intenções avisa quando não carregou as tuas escolhas e oferece tentar de novo; nunca escreve um palpite.",
  "changelog.entries.reporting-a-person-says-what-actually-happens.title":
    "Denunciar uma pessoa diz o que acontece mesmo",
  "changelog.entries.reporting-a-person-says-what-actually-happens.body":
    "A confirmação descreve o que a moderação vai fazer; o texto antigo era o de sinalizar o selo de um espaço seguro.",
  "changelog.entries.mod-tools-bans-read-in-words-again.title":
    "As expulsões nas ferramentas de moderação voltam a ler-se por palavras",
  "changelog.entries.mod-tools-bans-read-in-words-again.body":
    "A duração, a citação da regra e o editor de expulsões aparecem em inglês e em português nas Ferramentas de moderação.",
  "changelog.entries.offline-no-longer-clears-what-youre-typing.title":
    "Perder rede já não apaga o que estavas a escrever",
  "changelog.entries.offline-no-longer-clears-what-youre-typing.body":
    "A página fica onde estava, com uma barra pequena a avisar que a ligação caiu; o ecrã offline fica só para abrir a app.",
  "changelog.entries.back-button-leaves-an-editor-cleanly.title":
    "Voltar atrás sai do editor num só toque",
  "changelog.entries.back-button-leaves-an-editor-cleanly.body":
    "As páginas que avisam sobre edições por guardar deixavam um passo escondido no histórico; agora é limpo, saias como saíres.",
  "changelog.entries.signed-out-tab-bar-is-whole-again.title":
    "A barra de separadores sem sessão está completa outra vez",
  "changelog.entries.signed-out-tab-bar-is-whole-again.body":
    "Sem conta, a barra do telemóvel oferece a biblioteca de recursos, o guia de espaços seguros e o Sobre, todos sem sessão.",
  "changelog.entries.installing-the-app-takes-one-tap-again.title":
    "Instalar a app volta a ser um toque",
  "changelog.entries.installing-the-app-takes-one-tap-again.body":
    "A página, a janela de instalação e a app partilham o único convite do navegador, por isso instalas com um toque.",
  "changelog.entries.notification-taps-land-on-the-right-screen.title":
    "Tocar numa notificação abre o ecrã certo",
  "changelog.entries.notification-taps-land-on-the-right-screen.body":
    "Na app instalada, a notificação de uma mensagem termina de abrir a conversa antes que algo a possa interromper.",
  "changelog.entries.the-installed-app-keeps-itself-current.title":
    "A app instalada mantém-se atualizada",
  "changelog.entries.the-installed-app-keeps-itself-current.body":
    "Uma app deixada aberta verifica se há versão nova cerca de uma vez por hora e oferece-te a habitual pastilha de atualização.",
  "changelog.entries.pausing-your-account-now-pauses-it.title":
    "Pausar a tua conta agora pausa mesmo",
  "changelog.entries.pausing-your-account-now-pauses-it.body":
    "O teu perfil sai de vista, deixas de ser contactável e a sessão termina; a confirmação só aparece depois disso.",
  "changelog.entries.pause-and-delete-live-in-one-place.title":
    "Pausar e apagar num só sítio",
  "changelog.entries.pause-and-delete-live-in-one-place.body":
    "Uma só página explica o que pausar e apagar fazem, e todos os outros ecrãs levam-te até lá.",
  "changelog.entries.content-settings-actually-filter-your-feed.title":
    "As definições de conteúdo em Interesses já funcionam",
  "changelog.entries.content-settings-actually-filter-your-feed.body":
    "Desligar encontros, saúde mental, ou sexualidade e identidade esconde essas comunidades do teu feed; o acesso fica igual.",
  "changelog.entries.you-can-stop-being-suggested-to-strangers.title":
    "Podes deixar de ser sugerido a quem não conheces",
  "changelog.entries.you-can-stop-being-suggested-to-strangers.body":
    "Em Visibilidade, podes sair da faixa de sugestões das outras pessoas; continuas a ver sugestões e ficas no diretório.",
  "changelog.entries.the-activity-switch-is-one-switch.title":
    "O interruptor de atividade é o mesmo nos dois sítios",
  "changelog.entries.the-activity-switch-is-one-switch.body":
    "Mudas a atividade recente nas Definições ou no teu perfil e vale nos dois, e cada um diz-te como apareces agora.",
  "changelog.entries.answer-a-connection-request-where-you-read-it.title":
    "Podes responder a um pedido de ligação onde o lês",
  "changelog.entries.answer-a-connection-request-where-you-read-it.body":
    "O perfil oferece aceitar, a notificação traz aceitar e recusar, e o que escreveste vai contigo para a conversa.",
  "changelog.entries.a-gathering-tells-you-when-it-is-nearly-full.title":
    "Um convívio pode avisar-te quando faltam poucos lugares",
  "changelog.entries.a-gathering-tells-you-when-it-is-nearly-full.body":
    "Para convívios guardados ou com talvez, podes pedir um aviso quando faltam lugares; desligado por defeito, cala-se se abrir.",
  "changelog.entries.blocked-and-muted-in-one-place.title":
    "Pessoas bloqueadas e silenciadas na mesma lista",
  "changelog.entries.blocked-and-muted-in-one-place.body":
    "O painel lista quem bloqueaste e quem silenciaste, com a data e um toque para desfazer.",
  "changelog.entries.your-join-request-shows-its-deadline.title":
    "O teu pedido de adesão mostra o prazo, e um convite expirado não é o fim",
  "changelog.entries.your-join-request-shows-its-deadline.body":
    "Os sete dias começam quando és avisado; a página de estado mostra o prazo e pode reativar um convite expirado.",
  "changelog.entries.losing-your-google-account-is-no-longer-final.title":
    "Perder a conta Google já não significa perder a tua adesão",
  "changelog.entries.losing-your-google-account-is-no-longer-final.body":
    "Um administrador pode religar a tua adesão a uma nova conta Google que já provou controlar o teu endereço.",
  "changelog.entries.vouching-has-a-front-door.title":
    "Avalizar alguém passou a ter porta de entrada",
  "changelog.entries.vouching-has-a-front-door.body":
    "A página de avalizar está no menu da tua conta e ao lado das tuas ligações, e o passo de início leva-te até lá.",
  "changelog.entries.recognition-counts-people-not-volume.title":
    "O reconhecimento conta pessoas e não volume",
  "changelog.entries.recognition-counts-people-not-volume.body":
    "Os pontos vêm só de coisas em que outra pessoa participou; os distintivos que ganhas sozinho continuam teus e à vista.",

  "changelog.entries.declining-a-connection-request-now-holds.title":
    "Recusar um pedido de ligação passa a valer",
  "changelog.entries.declining-a-connection-request-now-holds.body":
    "Um novo pedido tem de esperar, a espera cresce a cada recusa da mesma pessoa, e recusas suficientes impedem novos pedidos.",

  "changelog.entries.you-can-report-a-whole-community.title":
    "Podes denunciar uma comunidade inteira",
  "changelog.entries.you-can-report-a-whole-community.body":
    "A partir da página dela, com motivos como expor a identidade, divulgar dados pessoais, assédio, ódio e discriminação.",

  "changelog.entries.housing-reports-can-reach-the-urgent-queue.title":
    "As denúncias de habitação chegam à fila urgente",
  "changelog.entries.housing-reports-can-reach-the-urgent-queue.body":
    "Oferecem expor a identidade e divulgar dados pessoais como motivos, e uma denúncia urgente nunca é travada pelo limite.",

  "changelog.entries.hiding-a-housing-profile-now-hides-it.title":
    "Esconder um perfil de habitação passa a escondê-lo",
  "changelog.entries.hiding-a-housing-profile-now-hides-it.body":
    "Um perfil de quem partilha casa ou de quem arrenda que a moderação esconde desaparece ao navegar, na pesquisa e por link.",

  "changelog.entries.you-choose-whether-a-report-is-anonymous.title":
    "És tu que escolhes se uma denúncia é anónima",
  "changelog.entries.you-choose-whether-a-report-is-anonymous.body":
    "O anonimato é uma escolha tua, com o que cada opção te custa explicado; o campo de email volta a ser só um campo de email.",

  "changelog.entries.barring-someone-forever-needs-two-people.title":
    "Barrar alguém para sempre passa a precisar de duas pessoas",
  "changelog.entries.barring-someone-forever-needs-two-people.body":
    "A remoção continua imediata e barra por trinta dias; torná-la permanente espera por uma segunda pessoa dona ou moderadora.",

  "changelog.entries.a-community-can-read-its-own-history.title":
    "Uma comunidade passa a poder ler a sua própria história",
  "changelog.entries.a-community-can-read-its-own-history.body":
    "Donos e moderadores leem o registo nas ferramentas de moderação: remoções, papéis, congelamentos e passagens a privada.",

  "changelog.entries.we-now-publish-government-data-requests.title":
    "Passamos a publicar os pedidos de dados de tribunais e governos",
  "changelog.entries.we-now-publish-government-data-requests.body":
    "O relatório de transparência ganha uma secção para estes pedidos: quantos recebemos, o que pediam e o que fizemos.",

  "changelog.entries.dark-mode-gives-feedback-again.title":
    "O modo escuro volta a responder-te",
  "changelog.entries.dark-mode-gives-feedback-again.body":
    "O realce do cursor e do teclado pintava quase a cor da página em 69 superfícies; corrigido, com a opção de menu e o brilho.",

  "changelog.entries.persona-pages-had-text-you-could-barely-read.title":
    "As páginas de persona tinham texto quase ilegível",
  "changelog.entries.persona-pages-had-text-you-could-barely-read.body":
    "Treze aparências tinham texto discreto, datas e linhas de ajuda demasiado ténues; cada uma cumpre agora o mínimo de 4,5.",

  "changelog.entries.things-that-were-meant-to-move-now-move.title":
    "O que era suposto mexer volta a mexer",
  "changelog.entries.things-that-were-meant-to-move-now-move.body":
    "Onze animações não faziam nada: listas e seletores de data abriam de repente e mudar de persona cortava; voltam a correr.",

  "changelog.entries.your-identity-details-now-reach-only-real-matches.title":
    "Os teus detalhes de identidade chegam agora só a matches reais",
  "changelog.entries.your-identity-details-now-reach-only-real-matches.body":
    "A identidade de género e as necessidades de espaço seguro no perfil de casa chegam a alguém só depois de ambos darem like.",

  "changelog.entries.review-queues-no-longer-hide-people-who-are-waiting.title":
    "As filas de revisão já não escondem quem está à espera",
  "changelog.entries.review-queues-no-longer-hide-people-who-are-waiting.body":
    "As filas de comunidades, reivindicações e habitação paravam nos primeiros 200 pedidos; agora carregam tudo e mostram o total.",

  "changelog.entries.press-kit-photos-can-be-uploaded-again.title":
    "As fotografias do kit de imprensa podem ser carregadas",
  "changelog.entries.press-kit-photos-can-be-uploaded-again.body":
    "A fotografia de um contacto de imprensa só podia ser um link; podes carregá-la, e os links limitam-se a sítios que servimos.",

  "changelog.entries.a-mistyped-address-says-not-found.title":
    "Um endereço mal escrito diz que não existe",
  "changelog.entries.a-mistyped-address-says-not-found.body":
    "Um identificador danificado num link dava um erro de servidor; cerca de vinte endereços dizem agora que aquilo não existe.",
  "changelog.tag.about": "L\u00ea onde nos posicionamos",
  "changelog.tag.partners": "Vê os nossos parceiros",
  "changelog.tag.aboutCommunities": "Ver como funcionam as comunidades",
  "changelog.tag.work": "Abrir o teu Trabalho",
  "changelog.tag.settings": "Definições de notificações",
  "changelog.tag.messages": "Abrir mensagens",
  "changelog.tag.createGathering": "Criar um convívio",
  "changelog.tag.startCommunity": "Começar uma comunidade",
  "changelog.tag.communities": "Ver comunidades",
  "changelog.tag.subprofiles": "Ver subperfis",
  "changelog.tag.personas": "Ver personas",
  "changelog.tag.gettingStarted": "Primeiros passos",
  "changelog.tag.housing": "Ver habitação",
  "changelog.tag.housingViewings": "Ver as tuas visitas",
  "changelog.tag.directory": "Abrir o diretório",
  "changelog.tag.cinema": "Visitar o Cinema",
  "changelog.tag.forum": "Visitar o fórum",
  "changelog.tag.sessions": "Vê as tuas sessões ativas",
  "changelog.tag.profile": "Abrir o teu perfil",
  "changelog.tag.gatherings": "Ver encontros",
  "changelog.tag.members": "Conhecer os membros",
  "changelog.tag.events": "Abrir o Events Hub",
  "changelog.tag.roadmap": "Abrir o roteiro",
  "changelog.tag.magazine": "Abrir a revista",
  "changelog.tag.magazineSections": "Navegar por seção",
  "changelog.tag.magazineWriter": "Abrir o teu espaço",
  "changelog.tag.badges": "Ver emblemas e níveis",
  "changelog.tag.safety": "Ver a nossa abordagem à segurança",
  "changelog.tag.editProfile": "Editar o teu perfil",
  "changelog.tag.employerReviews": "Ler avaliações de empregadores",
  "changelog.tag.studio": "Visitar o Studio",
  "changelog.tag.search": "Experimentar a pesquisa global",
  "changelog.tag.topics": "Ver os tópicos",
  "changelog.tag.perks": "Vê as tuas vantagens",
  "changelog.tag.volunteer": "Encontra o teu caminho",
  "changelog.tag.postVolunteer": "Publicar oportunidade",
  "changelog.tag.notifications": "Abrir as tuas notificações",
  "changelog.tag.connections": "Abrir as tuas ligações",
  "changelog.tag.trustNetwork": "Abrir a rede de confiança",
  "changelog.tag.invite": "Convidar alguém",
  "changelog.tag.imprint": "Ler o aviso legal",
  "changelog.tag.terms": "Ler os termos",
  "changelog.tag.library": "Abrir a biblioteca",
  "changelog.tag.feed": "Abrir o teu feed",
  "changelog.tag.myEvents": "Abrir Meus Eventos",
  "changelog.tag.safeSpaces": "Encontrar um espaço seguro",
  "changelog.tag.cookies": "Ver a lista completa",
  "changelog.tag.pressKit": "Abrir o kit de imprensa",
  "changelog.tag.pushDevices": "Gerir os teus dispositivos",
  "changelog.tag.magazineDesk": "Abrir a redação",
  "changelog.tag.comingOut": "Ler o guia de sair do armário",
  "changelog.tag.guidelines": "Ler as diretrizes da comunidade",
  "changelog.tag.guideIndex": "Ver todos os guias",
  "changelog.tag.requestInvite": "Pedir para entrar",
  "changelog.tag.privacy": "Ler a política de privacidade",
  "changelog.tag.flatmates": "Ver o quadro de colegas de casa",
  "changelog.tag.tenantRights": "Conhece os teus direitos",
  "changelog.tag.workProfile": "Abrir o teu perfil de trabalho",
  "changelog.tag.help": "Abrir o centro de ajuda",
  "changelog.tag.glossary": "Abrir o glossário",
  "changelog.tag.governance": "Ver como o QueerPulse é gerido",
  "changelog.tag.appealOutcome": "Ver o estado do teu recurso",
  "changelog.tag.hateCrime": "Ler recursos sobre crimes de ódio",
  "changelog.tag.changemakers": "Ver os nossos Changemakers",
  "changelog.tag.vouch": "Apadrinhar alguém",
  "changelog.tag.culture": "Visitar a Cultura",
  "changelog.tag.myCards": "Ver os teus cartões",

  "changelog.tag.magazineSearch": "Pesquisar na revista",
  "changelog.tag.resources": "Ver os guias",
  "changelog.tag.readingGroups": "Encontrar um clube de leitura",

  "changelog.tag.arriving": "Acabaste de chegar a Lisboa?",
  "changelog.tag.housingGroups": "Ver grupos de habitação",
  "changelog.entries.post-a-room-in-a-housing-group.title":
    "Partilha um quarto dentro de um grupo de habitação",
  "changelog.entries.post-a-room-in-a-housing-group.body":
    "Publica um quarto num grupo de habitação verificado, com a renda e a acessibilidade pedidas; um moderador lê-o primeiro.",
  "changelog.entries.the-housing-board-is-open.title":
    "O quadro de alojamento está aberto",
  "changelog.entries.the-housing-board-is-open.body":
    "Quartos e casas anunciados por membros chegam ao quadro depois de moderação, e o teu anúncio mostra-te a decisão e o motivo.",
  "changelog.entries.gatherings-say-where-and-what-they-cost.title":
    "Os convívios dizem onde são e quanto custam",
  "changelog.entries.gatherings-say-where-and-what-they-cost.body":
    "A morada, as indicações de chegada, o bairro e a acessibilidade ficam guardados e à vista; a morada exata chega a quem vai.",
  "changelog.entries.hosts-run-their-own-door.title":
    "Quem organiza controla a própria porta",
  "changelog.entries.hosts-run-their-own-door.body":
    "Avisa quem vai, regista entradas à porta, vê as necessidades de acesso partilhadas, e impede alguém num convívio.",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.title":
    "O selo de espaço seguro passa a valer o que a página diz",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.body":
    "Três pessoas sem ligação ao espaço têm de o visitar antes do selo, e cada decisão leva um motivo escrito.",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.title":
    "Está aberto? E consigo entrar?",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.body":
    "Mostra se um espaço está aberto agora, filtra pelo acesso de que precisas, e ordena pelo mais perto com tempo a pé.",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.title":
    "O espaço é consultado antes de te receber",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.body":
    "Indicar um negócio como espaço consulta quem é dono, que confirma ou retira; até lá o convívio fica fora da página pública.",
  "changelog.entries.arriving-points-at-real-things.title":
    "Chegar a Lisboa aponta para coisas reais",
  "changelog.entries.arriving-points-at-real-things.body":
    "A página para quem chegou mostra convívios reais, espaços e comunidades reais, e uma lista das primeiras duas semanas.",
  "changelog.entries.what-you-send-in-now-gets-an-answer.title":
    "O que envias passa a ter resposta",
  "changelog.entries.what-you-send-in-now-gets-an-answer.body":
    "Um grupo de leitura proposto torna-se uma comunidade tua; quartos, senhorios e apresentações recebem decisão e motivo.",
  "changelog.entries.the-magazine-has-pictures.title": "A revista tem imagens",
  "changelog.entries.the-magazine-has-pictures.body":
    "Os editores carregam a imagem de abertura e colocam fotografias no texto; aparece no artigo, na capa e nos cartões.",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.title":
    "Um texto mais antigo diz-te em que pé está",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.body":
    "Em revisão, arquivado ou substituído, um texto continua legível com uma nota datada; também pode sair em português.",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.title":
    "As correcções e os avisos de conteúdo chegam-te agora",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.body":
    "As correções aparecem no artigo, com data e por ordem, e os avisos de conteúdo ficam antes do corpo, onde os podes dispensar.",
  "changelog.entries.the-magazine-front-page-is-editors-work.title":
    "A capa da revista volta a ser o trabalho dos editores",
  "changelog.entries.the-magazine-front-page-is-editors-work.body":
    "A capa abre com o texto escolhido e segue a ordem da edição atual, agrupada por secções; o cabeçalho diz a edição e a data.",
  "changelog.entries.search-the-whole-magazine-archive.title":
    "Pesquisa tudo o que a revista publicou",
  "changelog.entries.search-the-whole-magazine-archive.body":
    "Pesquisa por título, entrada, corpo e etiqueta, por relevância; as etiquetas dos artigos são ligações que podes seguir.",
  "changelog.entries.a-byline-is-a-person-now.title":
    "Uma assinatura na revista é uma pessoa a sério",
  "changelog.entries.a-byline-is-a-person-now.body":
    "Quem escreve tem um perfil de autoria editável, as assinaturas ligam ao perfil de membro, e os textos ficam lá creditados.",
  "changelog.entries.your-story-submission-gets-an-answer.title":
    "A tua proposta de texto tem agora uma resposta",
  "changelog.entries.your-story-submission-gets-an-answer.body":
    "Os editores aceitam, recusam ou encomendam uma proposta e escrevem-te uma nota; a decisão chega às tuas notificações.",
  "changelog.entries.every-guide-says-when-it-was-last-checked.title":
    "Cada guia diz quando foi visto pela última vez",
  "changelog.entries.every-guide-says-when-it-was-last-checked.body":
    "Cada guia tem uma data de revisão que a equipa acompanha; um novo índice lista-os todos, dezassete sem ligação nenhuma.",
  "changelog.entries.the-reading-group-directory-is-real.title":
    "O directório de clubes de leitura é real",
  "changelog.entries.the-reading-group-directory-is-real.body":
    "Uma proposta aprovada cria um grupo que podes encontrar, abrir e pedir para entrar, com quem o propôs como anfitrião.",
  "changelog.entries.in-this-issue-replaces-the-members-digest.title":
    "“Nesta edição” substitui a newsletter para membros",
  "changelog.entries.in-this-issue-replaces-the-members-digest.body":
    'A newsletter fica como um painel "Nesta edição" em cada página de edição, com uma notificação quando sai uma edição.',
  "changelog.entries.the-press-kit-carries-real-brand-assets.title":
    "O kit de imprensa tem ficheiros de marca a sério",
  "changelog.entries.the-press-kit-carries-real-brand-assets.body":
    "A marca em vetorial e alta resolução, uma versão monocromática, o ícone da aplicação e uma referência de cores e tipografia.",
  "changelog.entries.cinema-and-culture-say-what-they-are.title":
    "O Cinema e a Cultura deixaram de anunciar o que não existe",
  "changelog.entries.cinema-and-culture-say-what-they-are.body":
    "O Cinema e a Cultura dizem com clareza que ainda não abriram, e a revista pede a quem não tem sessão para entrar.",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.title":
    "Uma edição fica guardada até sair",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.body":
    "A capa, o número, o título e o tema de uma edição por publicar ficam escondidos dos leitores; a redação vê tudo.",

  "changelog.entries.the-directory-stopped-going-blank.title":
    "O directório local deixou de ficar em branco",
  "changelog.entries.the-directory-stopped-going-blank.body":
    "O diretório e o formulário para listares o teu negócio podiam abrir vazios; os nomes das categorias vivem agora por si.",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.title":
    "Esconder as pré-visualizações já funciona no iPhone",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.body":
    "Esconder as pré-visualizações viaja com a tua conta, a notificação sai já sem conteúdo, e vem ligada por omissão.",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.title":
    "Sair já não apaga os encontros de outras pessoas",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.body":
    "Apagar uma conta apagava os seus encontros; um futuro passa a quem co-organiza ou é cancelado com aviso a quem ia.",
  "changelog.entries.a-new-device-signing-in-tells-you.title":
    "Ficas a saber quando um novo dispositivo inicia sessão",
  "changelog.entries.a-new-device-signing-in-tells-you.body":
    "Um dispositivo desconhecido envia-te uma notificação com o tipo e a hora; a lista de sessões identifica cada uma.",
  "changelog.entries.nothing-promises-you-an-email-any-more.title":
    "Já nada te promete um email",
  "changelog.entries.nothing-promises-you-an-email-any-more.body":
    "Lista de espera, anúncios, propostas da Cultura e candidaturas dizem agora que a resposta chega nas notificações.",
  "changelog.entries.the-status-page-works-without-an-account.title":
    "A página de estado funciona sem conta",
  "changelog.entries.the-status-page-works-without-an-account.body":
    "A página mostra o estado real dos serviços e os incidentes que registámos.",
  "changelog.entries.data-requests-get-a-real-answer.title":
    "Os pedidos de dados têm uma resposta a sério",
  "changelog.entries.data-requests-get-a-real-answer.body":
    "Um pedido entra numa fila ordenada pelo prazo legal, e a decisão chega-te como notificação com o número de referência.",
  "changelog.entries.we-ask-again-when-the-rules-change.title":
    "Voltamos a perguntar quando os Termos ou as Diretrizes mudam",
  "changelog.entries.we-ask-again-when-the-rules-change.body":
    "Depois de uma mudança relevante, pedimos-te para ler o que mudou e concordar de novo, e fica um registo com data.",
  "changelog.entries.iphone-notifications-explain-the-install-step.title":
    "As notificações no iPhone explicam o passo da instalação",
  "changelog.entries.iphone-notifications-explain-the-install-step.body":
    "A definição diz-te para adicionares a QueerPulse ao ecrã principal primeiro e liga diretamente para esse passo.",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.title":
    "Um aviso antes de a tua conta ser apagada",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.body":
    "Recebes uma notificação três dias antes de a eliminação ficar definitiva, e cancelar continua a ser um passo só.",
  "changelog.entries.moderators-see-the-positions-at-the-queue.title":
    "A modera\u00e7\u00e3o v\u00ea as posi\u00e7\u00f5es junto \u00e0 fila",
  "changelog.entries.moderators-see-the-positions-at-the-queue.body":
    "As duas filas de denúncias abrem com as três regras que mais importam, como nunca pedir a ninguém que prove o género.",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.title":
    "Onde nos posicionamos: vidas trans, Palestina, e o resto",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.body":
    "A página Sobre nomeia a interseccionalidade, a autodeterminação trans, o genocídio em Gaza e três compromissos.",
  "changelog.entries.directory-cards-show-who-runs-the-place.title":
    "Quem gere um espaço mostra agora a sua cara no cartão",
  "changelog.entries.directory-cards-show-who-runs-the-place.body":
    "O círculo ao lado do nome de quem gere mostra a fotografia de perfil, ou a inicial; uma ficha anónima não mostra nenhuma.",
  "changelog.entries.members-can-put-something-to-a-vote.title":
    "Podes submeter algo a votação",
  "changelog.entries.members-can-put-something-to-a-vote.body":
    "Apresenta uma moção, junta dez assinaturas incluindo a tua, e a equipa define o período de votação.",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.title":
    "Uma votação de governação passa a precisar de gente suficiente para contar",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.body":
    "O resultado só conta com um quórum de um décimo dos membros ativos ou dez pessoas, e as propostas mostram a participação.",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.title":
    "Qualquer pessoa numa comunidade pode sinalizar um proprietário ausente",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.body":
    "Reporta um proprietário ausente uma vez por dia; se ele apagar a conta, a propriedade passa a um coproprietário ou moderador.",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.title":
    "A Constituição liga ao Código de Conduta",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.body":
    "Ler o Código de Conduta passa a abri-lo; Descarregar PDF e Ver a Assembleia não levavam a nada, por isso saíram.",
  "changelog.entries.menu-resizes-smoothly.title":
    "O menu principal muda de tamanho suavemente entre secções",
  "changelog.entries.menu-resizes-smoothly.body":
    "O painel aberto ajusta a altura gradualmente ao mudares de secção no menu de topo; com movimento reduzido, muda de imediato.",
  "changelog.entries.nearby-places-full-cards.title":
    "Os locais a curta dist\u00e2ncia a p\u00e9 passam a mostrar o cart\u00e3o completo",
  "changelog.entries.nearby-places-full-cards.body":
    "As sugestões usam o cartão completo do diretório local, com foto, selo de espaço seguro, avaliação e distância a pé.",
  "changelog.entries.map-pin-opens-place.title":
    "Tocar num local no mapa passa a abri-lo",
  "changelog.entries.map-pin-opens-place.body":
    "Tocar num pino limpa o filtro de área e entrega o painel inteiro a esse local, com o mapa a aproximar-se dele.",
  "changelog.entries.review-line-breaks.title":
    "As avaliações mantêm os teus parágrafos e dobram-se quando ficam longas",
  "changelog.entries.review-line-breaks.body":
    "As quebras de parágrafo ficam como as escreveste, e as avaliações longas dobram-se nas primeiras linhas com Ler mais.",
  "changelog.entries.directory-filters-in-one-row.title":
    "A barra de filtros do diretório passa a ser uma só linha",
  "changelog.entries.directory-filters-in-one-row.body":
    "A barra assenta abaixo da navegação e mantém-se legível; os tipos de lugar mudaram para o Refinar, que conta os filtros.",
  "changelog.entries.volunteer-applicants-community-organisers.title":
    "As comunidades passam a poder rever as suas candidaturas de voluntariado",
  "changelog.entries.volunteer-applicants-community-organisers.body":
    "Quem detém, co-detém ou modera a comunidade da oportunidade pode ler as candidaturas e aceitar ou recusar.",
  "changelog.entries.invites-go-out-by-hand.title":
    "Aprovar um pedido de adesão passa a dizer com clareza o que acontece a seguir",
  "changelog.entries.invites-go-out-by-hand.body":
    "Prometia um email que a QueerPulse não envia; agora diz que os convites seguem à mão e mostra a ligação para copiar.",
  "changelog.entries.sessions-page-links-reach-a-person.title":
    "As tuas sessões ativas já conseguem chegar a uma pessoa",
  "changelog.entries.sessions-page-links-reach-a-person.body":
    "As duas ligações abrem a secção Conta da Ajuda e o formulário de contacto com o tema de acesso à conta.",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.title":
    "As sec\u00e7\u00f5es das ferramentas de modera\u00e7\u00e3o chegam em vez de aparecerem de repente",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.body":
    "Passar entre Resumo, Pedidos, Denúncias e o resto surge com um leve subir e esbatimento; com movimento reduzido é imediato.",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.title":
    "Gerir as pessoas de uma comunidade volta a ler-se como uma lista de pessoas",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.body":
    "Tornar alguém mod, dar cotitularidade e remover uma pessoa ficam atrás de um único botão de menu no fim da linha.",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.title":
    "O Studio e o Cinema falam portugu\u00eas em mais s\u00edtios",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.body":
    "Botões, títulos, separadores e estados vazios seguem a tua língua; a obra fica como o autor a escreveu.",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.details":
    "Botões, títulos, separadores e estados vazios do Studio e do Cinema passam a seguir a língua que escolheste. A obra fica como o autor a escreveu: títulos de faixas, letras, biografias, sinopses e fichas técnicas.",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.title":
    "A tua lista de dispositivos deixa de acumular sess\u00f5es antigas",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.body":
    "Iniciar sessão substitui a sessão que este navegador já tinha, as caducadas saem, e um botão termina todas as outras.",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.title":
    "Cada dispositivo diz quando iniciaste sess\u00e3o e mais ou menos quando l\u00e1 estiveste pela \u00faltima vez",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.body":
    "Sessão iniciada mostra quando iniciaste mesmo sessão nesse dispositivo, mais uma linha aproximada de última atividade.",
  "changelog.entries.profile-sections-share-one-left-edge.title":
    "Todas as secções do teu perfil alinham pela mesma margem",
  "changelog.entries.profile-sections-share-one-left-edge.body":
    'As secções partilham a margem esquerda de "Espaços que geres", por isso a coluna fica alinhada, no telemóvel também.',
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.title":
    "As minhas comunidades esperam pela tua lista em vez de dizerem que n\u00e3o tens nenhuma",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.body":
    "Um esqueleto segura a página até as tuas adesões carregarem, e a linha sob o título espera pelo número verdadeiro.",
  "changelog.entries.say-what-you-do-on-your-profile.title":
    "Podes dizer o que fazes no teu perfil e ser encontrada por isso",
  "changelog.entries.say-what-you-do-on-your-profile.body":
    'Escolhe a tua área e funções no editor do perfil; aparecem em "Trabalha em" e colocam-te nos filtros do diretório de membros.',
  "changelog.entries.admin-account-menu-is-real.title":
    "O botão de conta da barra de administração passou a fazer alguma coisa",
  "changelog.entries.admin-account-menu-is-real.body":
    "O botão identifica a conta com que estás autenticado e abre perfil, definições, sessões, acessos e terminar sessão.",
  "changelog.entries.admin-sidebar-grouped-sections.title":
    "A barra lateral de administração está agrupada em secções que podes fechar",
  "changelog.entries.admin-sidebar-grouped-sections.body":
    "32 links ficam em oito secções identificadas; a barra lembra o que deixaste aberto e os cabeçalhos fechados mostram totais.",
  "changelog.entries.since-friday-panel-removed.title":
    "O painel Desde sexta da redação deixou de existir",
  "changelog.entries.since-friday-panel-removed.body":
    "O feed de atividade lê o mesmo registo e cada peça mantém o separador Histórico, por isso a barra lateral ficou mais curta.",
  "changelog.entries.writer-desk-header-says-whats-due.title":
    "O cabeçalho do teu espaço de escrita passa a dizer o que está para entregar",
  "changelog.entries.writer-desk-header-says-whats-due.body":
    "O cabeçalho identifica a página, conta os trabalhos em aberto e diz a entrega mais próxima, ou que não tens nada em mãos.",
  "changelog.entries.editors-can-write-their-own-pieces.title":
    "Quem edita a revista pode escrever uma peça, e não apenas encomendá-la",
  "changelog.entries.editors-can-write-their-own-pieces.body":
    "Escrever fica ao lado de Encomendar, dispensa o briefing, cria a peça contigo como autoria e leva-te direto ao editor.",
  "changelog.entries.editor-pages-start-at-the-top.title":
    "As páginas do editor da revista já não começam com uma faixa de creme vazio",
  "changelog.entries.editor-pages-start-at-the-top.body":
    "Cada ecrã do editor reservava uma faixa para uma barra de navegação que nunca mostra; essa faixa foi libertada.",
  "changelog.entries.issue-publish-date-optional.title":
    "Uma edição da revista já não precisa de data para existir",
  "changelog.entries.issue-publish-date-optional.body":
    "Número, título e tema chegam; a data vive num cartão de Data de publicação que podes definir ou remover mais tarde.",
  "changelog.entries.cohost-invite-form-reads-properly.title":
    "Convidar quem co-organiza já se lê como deve ser",
  "changelog.entries.cohost-invite-form-reads-properly.body":
    "O passo das condições lê-se inteiro nas duas línguas, mostra quem convidaste com foto e pronomes, e descreve cada função.",
  "changelog.entries.desk-activity-reads-in-plain-language.title":
    "A atividade da reda\u00e7\u00e3o passa a ler-se em linguagem normal",
  "changelog.entries.desk-activity-reads-in-plain-language.body":
    "A Atividade e o histórico leem-se como frases: quem fez, o quê e quando; os passos automáticos aparecem como Sistema.",
  "changelog.entries.mod-tools-became-a-console.title":
    "As ferramentas de modera\u00e7\u00e3o passam a ser uma consola com barra de sec\u00e7\u00f5es",
  "changelog.entries.mod-tools-became-a-console.body":
    "Abrem no que está à tua espera, com barra para Pedidos, Denúncias, Pessoas, Convites, Cartão de membro e Zona de risco.",
  "changelog.entries.share-card-shows-your-own-gathering.title":
    "O cart\u00e3o de partilha de um conv\u00edvio mostra agora esse conv\u00edvio",
  "changelog.entries.share-card-shows-your-own-gathering.body":
    "O cartão mostra o convívio que estás a gerir, com título, data, local e foto de capa; Copiar dá-te o link público.",
  "changelog.entries.place-page-reads-in-one-piece.title":
    "A p\u00e1gina de um espa\u00e7o passa a ler-se como um todo",
  "changelog.entries.place-page-reads-in-one-piece.body":
    'O horário vive num só cartão, a semana em duas colunas e o estado ao lado do título; "Onde fica" é também um só cartão.',
  "changelog.entries.place-pages-open-all-at-once.title":
    "A p\u00e1gina de um espa\u00e7o passa a abrir j\u00e1 com as fotografias",
  "changelog.entries.place-pages-open-all-at-once.body":
    "Um ecrã de carregamento curto diz em que passo vai, e a página chega já com as fotografias no lugar.",
  "changelog.entries.browse-every-tag-by-category.title":
    "Explora todas as etiquetas por categoria em vez de adivinhar a palavra",
  "changelog.entries.browse-every-tag-by-category.body":
    'Um botão "Ver todas" abre a lista toda por categoria; toca numa etiqueta para a juntar ou retirar, ou pesquisa em todas.',
  "changelog.entries.backspace-keeps-your-tags.title":
    "O backspace deixa de apagar as etiquetas que j\u00e1 escolheste",
  "changelog.entries.backspace-keeps-your-tags.body":
    "Manter o backspace premido num campo de etiquetas limpa só o texto que escreves; as etiquetas saem no x da própria etiqueta.",
  "changelog.entries.map-loader-stays-in-its-panel.title":
    "O mapa do diret\u00f3rio passa a carregar dentro do seu pr\u00f3prio painel",
  "changelog.entries.map-loader-stays-in-its-panel.body":
    "Mudar de Lista para Mapa cobria a janela inteira com o carregamento; agora preenche o painel do mapa e a página mantém-se.",
  "changelog.entries.plum-headers-reach-the-top.title":
    "Os cabe\u00e7alhos cor de ameixa passam a chegar ao topo",
  "changelog.entries.plum-headers-reach-the-top.body":
    "Em Espaços seguros, Cultura, Empregos e Habitação ficava uma faixa de creme atrás da navegação; a cor de ameixa preenche-a.",
  "changelog.entries.footer-closes-the-page.title":
    "As páginas curtas passam a acabar no fundo da janela",
  "changelog.entries.footer-closes-the-page.body":
    "Todas as páginas chegam ao fundo da janela, por isso o rodapé fica em baixo mesmo numa página curta como os teus cartões.",
  "changelog.entries.tab-title-follows-the-page.title":
    "O separador do navegador diz em que p\u00e1gina est\u00e1s",
  "changelog.entries.tab-title-follows-the-page.body":
    "As páginas com nome próprio definem o título do separador, e todas as outras mostram o nome QueerPulse assim que chegas.",
  "changelog.entries.magazine-issues-run-the-desk.title":
    "As edições passam a mandar na redação",
  "changelog.entries.magazine-issues-run-the-desk.body":
    'Chega um botão "Nova edição" e um seletor de edição; as peças esperam em Sem edição até as arrumares, e publicar arquiva-as.',
  "changelog.entries.local-map-reads-clearly.title":
    "O mapa local voltou a ler-se bem",
  "changelog.entries.local-map-reads-clearly.body":
    "As ruas têm uma escala quente e contorno próprio, os nomes recortam-se com nitidez, e cada freguesia é nomeada uma só vez.",
  "changelog.entries.reviews-sort-on-quiet-listings.title":
    "Ordenar e filtrar avalia\u00e7\u00f5es passa a funcionar nos espa\u00e7os mais sossegados",
  "changelog.entries.reviews-sort-on-quiet-listings.body":
    "A partir da segunda avaliação ordena por recentes, antigas, úteis ou classificação, ou filtra por foto ou resposta.",
  "changelog.entries.map-narrows-to-the-area-you-pick.title":
    "Escolher uma zona no mapa limpa as restantes",
  "changelog.entries.map-narrows-to-the-area-you-pick.body":
    "Escolher uma freguesia deixa apenas os pinos dessa zona; clica outra vez na zona destacada para trazer tudo de volta.",
  "changelog.entries.pages-open-at-the-top.title":
    "Mudar de p\u00e1gina leva-te ao topo de imediato",
  "changelog.entries.pages-open-at-the-top.body":
    "O botão de retroceder continua a devolver-te ao ponto onde estavas, e tocar no separador atual continua a subir suavemente.",
  "changelog.entries.queer-owned-says-queer-owned.title":
    "Os neg\u00f3cios queer j\u00e1 o dizem no cart\u00e3o",
  "changelog.entries.queer-owned-says-queer-owned.body":
    "O selo tem três níveis honestos, negócio queer verificado, negócio queer ou LGBTQ+ friendly, com o escudo jade ao lado.",
  "changelog.entries.review-appears-immediately.title":
    "A tua avaliação aparece assim que a publicas",
  "changelog.entries.review-appears-immediately.body":
    "A classificação conta-a logo, e as páginas de persona, os grupos de habitação e o roteiro também atualizam de imediato.",
  "changelog.entries.star-pickers-follow-your-cursor.title":
    "As estrelas j\u00e1 acompanham o cursor como deve ser",
  "changelog.entries.star-pickers-follow-your-cursor.body":
    "As estrelas ficam encostadas, por isso qualquer ponto da linha acende a classificação que apontas e o coral preenche.",
  "changelog.entries.review-stars-hint.title":
    "As avaliações já dizem porque é que o botão está desativado",
  "changelog.entries.review-stars-hint.body":
    "Dava para escrever uma avaliação inteira e encontrar o botão desativado; agora uma linha ao lado pede-te as estrelas.",
  "changelog.entries.filters-keep-your-place.title":
    "Filtrar uma p\u00e1gina j\u00e1 n\u00e3o te atira de volta para o topo",
  "changelog.entries.filters-keep-your-place.body":
    "Ativar um filtro, escrever numa pesquisa ou alternar o diretório local entre mapa e lista deixa-te onde estavas a ler.",
  "changelog.entries.directory-card-cover-photo.title":
    "A foto do teu neg\u00f3cio j\u00e1 aparece no diret\u00f3rio",
  "changelog.entries.directory-card-cover-photo.body":
    "Os cartões mostram o plano geral enquadrado como o recortaste, e o passo das fotos diz qual delas fica como capa.",
  "changelog.entries.persona-banner-reposition.title":
    "Põe o banner da tua persona exatamente onde queres",
  "changelog.entries.persona-banner-reposition.body":
    'Passa o rato pelo banner, escolhe "Reposicionar" e arrasta a imagem até enquadrar a parte certa; as setas também servem.',

  "changelog.entries.listing-owner-photo.title":
    "A cara por tr\u00e1s de um an\u00fancio aparece mesmo",
  "changelog.entries.listing-owner-photo.body":
    'O cartão "Quem gere" e as fotos ao lado das avaliações e perguntas carregam bem; quem desligou a foto continua com iniciais.',
  "changelog.entries.persona-savebar-compact.title":
    "Mais espaço para escrever ao editar uma persona no telemóvel",
  "changelog.entries.persona-savebar-compact.body":
    "A barra de alterações por guardar mostra uma linha com o número de alterações à espera; toca para abrir a lista completa.",
  "changelog.entries.sharper-photos.title":
    "Fotografias nítidas em qualquer ecrã",
  "changelog.entries.sharper-photos.body":
    "As imagens grandes são reduzidas por etapas e guardadas num formato novo, por isso um banner ou foto de perfil fica nítido.",
  "changelog.entries.listing-pages-rebuild.title":
    "Páginas de negócios, refeitas à volta do que vieste saber",
  "changelog.entries.listing-pages-rebuild.body":
    "Começa por dizer se está aberto, onde fica e como é entrar lá; podes perguntar em público ou marcar uma avaliação como útil.",
  "changelog.entries.listing-owner-control.title":
    "Mais controlo para quem gere um espaço",
  "changelog.entries.listing-owner-control.body":
    "Depois de aprovado, as correções ficam logo no ar; o editor tem pré-visualização, horários de feriado, avisos e pausa.",
  "changelog.entries.persona-banner-framing.title":
    "Banners de persona, enquadrados como tu os enquadraste",
  "changelog.entries.persona-banner-framing.body":
    "Os banners reenquadram-se em 3:1, a forma com que aparecem, e a página mantém o que centraste; sobem com mais resolução.",
  "changelog.entries.card-check-page-rebuild.title":
    "A p\u00e1gina de verifica\u00e7\u00e3o do cart\u00e3o passa a mostrar a fotografia",
  "changelog.entries.card-check-page-rebuild.body":
    "A verificação chega como o próprio cartão: nome, pronomes, comunidade, papel, número e foto; um cartão que falha diz porquê.",
  "changelog.entries.persona-rights-footer-once.title":
    "Um s\u00f3 aviso de direitos por p\u00e1gina de persona",
  "changelog.entries.persona-rights-footer-once.body":
    "O aviso aparece uma vez no fim, a cobrir todo o trabalho dessa persona; um poema ou obra aberta em separado mostra o seu.",
  "changelog.entries.community-card-live-preview.title":
    "Vê o cartão da tua comunidade enquanto a editas",
  "changelog.entries.community-card-live-preview.body":
    "A janela de edição mostra o cartão ao lado do formulário, com o que escreves, para veres a capa ou a frase curta antes.",

  "changelog.entries.card-co-owner-role.title":
    "Os cartões de sócie identificam corretamente quem é cotitular",
  "changelog.entries.card-co-owner-role.body":
    "Cotitular aparece no cartão, no painel de titulares e na página do código; promover alguém atualiza o cartão de imediato.",

  "changelog.entries.profile-community-cards.title":
    "As tuas comunidades ficam iguais no perfil e na página de comunidades",
  "changelog.entries.profile-community-cards.body":
    "Usam o cartão da página de comunidades: capa, caras, descrição, etiquetas e atividade da semana, com um selo do teu papel.",

  "changelog.entries.profile-places-directory-cards.title":
    "Os teus espaços ficam iguais no perfil e no diretório",
  "changelog.entries.profile-places-directory-cards.body":
    "Usam o mesmo cartão do diretório local: foto de capa, selos, categoria, etiquetas e o horário de hoje.",

  "changelog.entries.community-co-owners.title":
    "Quem é responsável pode partilhar a comunidade com alguém cotitular",
  "changelog.entries.community-co-owners.body":
    "Nas Ferramentas de moderação, torna alguém cotitular e partilha pedidos, moderação e definições; retira quando quiseres.",

  "changelog.entries.card-art-counted-as-in-use.title":
    "A arte do cartão de sócio passa a contar como imagem em uso",
  "changelog.entries.card-art-counted-as-in-use.body":
    "O brasão e o fundo escolhidos para o cartão de sócio contam como imagens em uso e ligam à comunidade.",

  "changelog.entries.community-house-rules.title":
    "As regras da casa chegam com o convite",
  "changelog.entries.community-house-rules.body":
    "Entrar passa por ler e aceitar as regras primeiro; se mudarem, quem já está dentro é convidado uma vez a ler a nova versão.",
  "changelog.entries.community-removal-bars-return.title":
    "Sair por decisão da moderação passa a significar isso mesmo",
  "changelog.entries.community-removal-bars-return.body":
    "Quem é removido fica impedido de voltar logo; a moderação pode deixar a porta aberta e levantar qualquer impedimento.",
  "changelog.entries.community-announcements.title":
    "Quem é responsável pode dizer algo que se destaca",
  "changelog.entries.community-announcements.body":
    "Quem é responsável, cotitular ou modera pode publicar um anúncio que fica fixado no topo e chega a quem é membro.",
  "changelog.entries.community-notification-levels.title":
    "Escolhe quanto é que cada comunidade te chega",
  "changelog.entries.community-notification-levels.body":
    "Cada comunidade tem a sua definição na linha de separadores: tudo, só anúncios, só menções ou silenciada.",
  "changelog.entries.community-invites-any-time.title":
    "Convida pessoas para a tua comunidade a qualquer momento",
  "changelog.entries.community-invites-any-time.body":
    "Convida nas Ferramentas de moderação quando quiseres; um convite é uma mensagem, e entrar é decisão da outra pessoa.",
  "changelog.entries.community-join-review-context.title":
    "Ver um pedido de entrada mostra-te a pessoa",
  "changelog.entries.community-join-review-context.body":
    "Os pedidos trazem pronomes, tempo na QueerPulse, ligações e comunidades em comum, e o nome ligado ao perfil.",
  "changelog.entries.community-resources-shelf.title":
    "Uma prateleira a sério para os links da comunidade",
  "changelog.entries.community-resources-shelf.body":
    "Quem é responsável, cotitular ou modera constrói uma prateleira de recursos reordenável que aparece no separador Sobre.",
  "changelog.entries.community-co-ownership.title":
    "Cotitulares, e uma forma de sinalizar ausências",
  "changelog.entries.community-co-ownership.body":
    "Quem é cotitular partilha os poderes diários, e a moderação pode pedir à equipa da plataforma que veja um caso de ausência.",
  "changelog.entries.community-governance-history.title":
    "Cada comunidade vê o seu próprio histórico",
  "changelog.entries.community-governance-history.body":
    "Quem gere a comunidade lê agora o registo de mudanças de papel, remoções, impedimentos levantados, pausas e transferências.",
  "changelog.entries.community-public-teaser.title":
    "Partilha uma comunidade com quem está de fora",
  "changelog.entries.community-public-teaser.body":
    "Quem é responsável pode ligar uma página pública curta para quem não tem sessão, que nunca mostra membros nem publicações.",
  "changelog.entries.community-place-and-language.title":
    "Encontra comunidades perto de ti, na tua língua",
  "changelog.entries.community-place-and-language.body":
    "As comunidades podem dizer onde se encontram e em que línguas funcionam, e o Descobrir filtra por ambos.",
  "changelog.entries.community-welcome-and-search.title":
    "Boas-vindas à chegada, e pesquisa dentro da comunidade",
  "changelog.entries.community-welcome-and-search.body":
    "Quem é responsável escreve uma saudação que quem chega vê uma vez, e as publicações são pesquisáveis em todo o histórico.",
  "changelog.entries.community-insight-trends.title":
    "As estatísticas da comunidade mostram direção",
  "changelog.entries.community-insight-trends.body":
    "O painel de estatísticas junta doze semanas de entradas e publicações, apenas em totais da comunidade inteira.",
  "changelog.entries.community-pause-reason.title":
    "Uma comunidade em pausa explica-se com honestidade",
  "changelog.entries.community-pause-reason.body":
    "O aviso de pausa diz qual dos três motivos se aplica, quando a pausa começou, e mostra a nota da moderação quando existe.",
  "changelog.entries.community-card-covers.title":
    "As comunidades mostram a sua fotografia",
  "changelog.entries.community-card-covers.body":
    "A foto de capa é o cabeçalho do cartão, categoria e acesso sobre um véu escuro, e todos os cartões têm a mesma altura.",
  "changelog.entries.community-founded-month.title":
    "Fundada, at\u00e9 ao m\u00eas",
  "changelog.entries.community-founded-month.body":
    "A página da comunidade indica o mês de fundação além do ano, escrito como a tua língua o escreve.",
  "changelog.entries.card-text-legibility.title":
    "Cart\u00f5es que se leem \u00e0 dist\u00e2ncia",
  "changelog.entries.card-text-legibility.body":
    "Quem é responsável escolhe como o cartão escurece o fundo: painel atrás dos nomes, sombra em cima e em baixo, ou véu total.",
  "changelog.entries.my-communities-cards.title":
    "As tuas comunidades, como comunidades",
  "changelog.entries.my-communities-cards.body":
    "As tuas comunidades abrem a página como cartões completos, cada um a mostrar quantas pessoas estiveram por lá esta semana.",
  "changelog.entries.cards-load-whole.title": "O teu cartão chega inteiro",
  "changelog.entries.cards-load-whole.body":
    "Um cartão de sócie espera pela bandeira, pelo emblema e pela fotografia antes de aparecer, com um espaço a segurar a forma.",
  "changelog.entries.pronouns-on-membership-cards.title":
    "Pronomes no cartão de sócie",
  "changelog.entries.pronouns-on-membership-cards.body":
    "Uma comunidade pode mostrar os pronomes do perfil ao lado do nome no cartão, e qualquer pessoa pode desligar os seus.",
  "changelog.entries.printed-membership-cards.title":
    "Cartões de membro para imprimir",
  "changelog.entries.printed-membership-cards.body":
    "A folha que se corta e dobra leva o código do cartão no telemóvel, e substituir um cartão perdido inutiliza as cópias.",
  "changelog.entries.profile-back-to-origin.title":
    "A saída de um perfil leva-te de volta a onde estavas",
  "changelog.entries.profile-back-to-origin.body":
    "O link por cima de um perfil diz de que página vieste e deixa-te no ponto da lista onde tocaste.",

  "changelog.entries.card-holder-open-card.title":
    "Abrir o cartão de uma pessoa a partir da lista",
  "changelog.entries.card-holder-open-card.body":
    "Qualquer linha abre o cartão real dessa pessoa em tamanho inteiro, com suspender, revogar e reativar no cartão aberto.",

  "changelog.entries.card-photo-legibility.title":
    "Fotografias que se leem bem em qualquer cartão",
  "changelog.entries.card-photo-legibility.body":
    "A fotografia e o emblema ganham contorno de dois tons e sombra suave, para se lerem sobre bandeira, imagem ou cor lisa.",

  "changelog.entries.card-member-photos.title":
    "Cartões de sócie com fotografia, e a última palavra fica com a pessoa",
  "changelog.entries.card-member-photos.body":
    "A foto do perfil pode ir para o cartão para quem está à porta ligar cartão a pessoa, e qualquer pessoa pode desligar a sua.",

  "changelog.entries.card-two-sides.title":
    "O teu cartão de sócio passou a ter verso, e uma frente que vale a pena ver",
  "changelog.entries.card-two-sides.body":
    "A frente traz a bandeira ou cor da comunidade, o brasão e o teu nome; o verso traz um código grande, número, datas e papel.",

  "changelog.entries.cohost-invite-copy.title":
    "Os convites para coanfitrião voltam a ler-se, e a semana em português começa à segunda",
  "changelog.entries.cohost-invite-copy.body":
    "Papéis, compromissos de tempo, ligações expiradas e notificação leem-se bem, e os seletores de data começam à segunda-feira.",

  "changelog.entries.card-backgrounds.title":
    "Põe uma bandeira, ou a tua própria fotografia, no cartão da comunidade",
  "changelog.entries.card-backgrounds.body":
    "Escolhe uma de treze bandeiras do orgulho ou carrega uma foto; uma camada fixa mantém o código legível por cima.",

  "changelog.entries.card-designer.title":
    "Uma verdadeira ferramenta de desenho para o cartão de sócio da tua comunidade",
  "changelog.entries.card-designer.body":
    "Uma tela em ecrã largo com pré-visualização grande, estilos em miniatura, verificação em claro e escuro e a data de validade.",

  "changelog.entries.membership-cards.title":
    "As comunidades já podem dar-te um cartão de sócio",
  "changelog.entries.membership-cards.body":
    "Uma comunidade tua pode emitir-te um cartão, tapado até o mostrares, que qualquer pessoa verifica ao ler o código.",

  "changelog.entries.push-preview-privacy.title":
    "Esconde o que as tuas notificações dizem no ecrã bloqueado",
  "changelog.entries.push-preview-privacy.body":
    "Um interruptor nas notificações do telemóvel mantém o remetente e o texto fora do ecrã bloqueado; só se vê que chegou algo.",

  "changelog.entries.honest-success-states.title":
    "Os botões deixaram de dizer que resultou quando não resultou",
  "changelog.entries.honest-success-states.body":
    "As ações passam a esperar pela resposta real do servidor antes de confirmar, e repõem o teu conteúdo se falhar.",

  "changelog.entries.reports-really-filed.title":
    "Denúncias que falham passam a dizê-lo",
  "changelog.entries.reports-really-filed.body":
    "Todos os caminhos de denúncia confirmam só depois de ela ficar registada, e mantêm o que escreveste para tentares de novo.",

  "changelog.entries.message-previews-and-drafts.title":
    "As mensagens enviadas antes de a conversa existir já não desaparecem",
  "changelog.entries.message-previews-and-drafts.body":
    "A primeira mensagem de uma conversa nova passa a chegar, e os rascunhos ficam guardados por conta num aparelho partilhado.",

  "changelog.entries.moderation-holds.title":
    "As decisões de moderação já não podem ser desfeitas por quem publicou",
  "changelog.entries.moderation-holds.body":
    "As remoções registam quem as fez, por isso só a moderação desfaz uma remoção sua, e ganhar um recurso repõe o conteúdo.",

  "changelog.entries.housing-listings-stay-reviewed.title":
    "As edições a um anúncio publicado voltam a passar por revisão",
  "changelog.entries.housing-listings-stay-reviewed.body":
    "Editar as partes moderadas de um anúncio publicado devolve-o a revisão, e pedir uma visita exige o compromisso afirmativo.",

  "changelog.entries.article-titles-render-plain.title":
    "Os títulos da revista com um E comercial voltam a ler-se bem",
  "changelog.entries.article-titles-render-plain.body":
    "Os títulos ficam guardados como texto simples, por isso o & lê-se bem no artigo, nos cartões e na pré-visualização.",

  "changelog.entries.communities-hub-hero-restore.title":
    "As Comunidades voltaram a ter as boas-vindas",
  "changelog.entries.communities-hub-hero-restore.body":
    "O topo volta a encostar à navegação, com título, uma linha sobre o espaço e o alternador Minhas comunidades e Descobrir.",

  "changelog.entries.community-tags-discovery.title":
    "Descobre comunidades por etiquetas e ligações",
  "changelog.entries.community-tags-discovery.body":
    "A página mostra comunidades semelhantes por etiquetas em comum, e o Descobrir destaca onde as tuas ligações já estão.",

  "changelog.entries.community-tags.title":
    "As comunidades já podem ter etiquetas",
  "changelog.entries.community-tags.body":
    "Quem gere uma comunidade escolhe até 8 etiquetas de uma lista curada; aparecem nos cartões e filtram o Descobrir.",

  "changelog.entries.account-menu-install-app.title":
    "Instala a app a partir do menu da conta",
  "changelog.entries.account-menu-install-app.body":
    'No telemóvel, o menu da conta tem uma linha "Instalar a app" com os passos para o teu aparelho, que some depois de instalada.',

  "changelog.entries.member-directory-filter-crossfade.title":
    "Filtragem mais suave no diretório de pessoas",
  "changelog.entries.member-directory-filter-crossfade.body":
    "Mudar um filtro faz a grelha transitar suavemente entre resultados; com menos movimento, trocam de imediato.",

  "changelog.entries.excerpt-line-editor-reorder.title":
    "Uma forma mais limpa de escrever e reordenar linhas da página",
  "changelog.entries.excerpt-line-editor-reorder.body":
    "Cada linha de excerto ocupa uma fila própria: arrasta a pega ou usa as setas para reordenar, e remove com um toque.",

  "changelog.entries.collaborator-member-picker.title":
    "Credita pessoas colaboradoras procurando por membros",
  "changelog.entries.collaborator-member-picker.body":
    "Escreves um nome ou identificador, escolhes a pessoa na lista, e ela aparece como etiqueta que podes remover.",

  "changelog.entries.unified-searchable-select.title":
    "Menus onde podes escrever para procurar",
  "changelog.entries.unified-searchable-select.body":
    "Escreve para filtrar listas longas de categorias, idiomas ou bairros; as escolhas múltiplas surgem como etiquetas.",

  "changelog.entries.persona-date-month-picker.title":
    "Escolhe o mês e o ano dos teus trabalhos, sem os escrever à mão",
  "changelog.entries.persona-date-month-picker.body":
    "As datas dos itens de persona têm um seletor de mês e ano no teu idioma; as que escreveste à mão ficam como estavam.",

  "changelog.entries.unified-date-picker.title":
    "Um novo seletor de datas em toda a plataforma, mais acolhedor e totalmente acessível por teclado",
  "changelog.entries.unified-date-picker.body":
    "Todos os campos de data e hora usam um só calendário onde podes escrever diretamente ou percorrer por mês e ano.",

  "changelog.entries.protect-your-work.title": "Protege o teu trabalho",
  "changelog.entries.protect-your-work.body":
    "As peças publicadas têm linha de direitos de autor, um registo de autoria descarregável e histórico de versões restaurável.",

  "changelog.entries.verification-signals-bulk-keyboard.title":
    "Quem revê pedidos agora vê sinais, decide em lote e avança pelo teclado",
  "changelog.entries.verification-signals-bulk-keyboard.body":
    "Os pedidos mostram a idade da conta, rejeições anteriores e um aviso quando um telefone ou referência surge em duas contas.",

  "changelog.entries.verification-request-review.title":
    "Pede verificação, e vê como está o teu pedido",
  "changelog.entries.verification-request-review.body":
    "Pede por email, telefone ou identidade com uma nota curta, acompanha o pedido até à decisão e recorre se precisares.",

  "changelog.entries.verification-audit-trail.title":
    "Passas a saber quando o teu estado de verificação muda",
  "changelog.entries.verification-audit-trail.body":
    "Uma mudança de nível por um administrador envia-te uma notificação com o motivo, e a consola regista quem decidiu o quê.",

  "changelog.entries.community-safety-enforcement.title":
    "Definições de segurança da comunidade que passam a agir",
  "changelog.entries.community-safety-enforcement.body":
    "Exige-se um segundo aval antes da entrada, e o congelamento automático pára publicações e entradas numa denúncia grave.",

  "changelog.entries.community-settings-persist.title":
    "Definições da comunidade que guardam mesmo",
  "changelog.entries.community-settings-persist.body":
    "Definições abre nome, descrição, modo de adesão e regras, e as duas opções de segurança mantêm-se depois de recarregar.",

  "changelog.entries.community-health-explainer.title":
    "Vê exatamente como o índice de saúde de uma comunidade é calculado",
  "changelog.entries.community-health-explainer.body":
    'Uma vista "Como é calculada" mostra os quatro sinais, os pesos, as contas da própria comunidade e os escalões.',

  "changelog.entries.modals-cover-full-screen.title":
    "As janelas de diálogo passam a escurecer o ecrã inteiro",
  "changelog.entries.modals-cover-full-screen.body":
    "O fundo escurecido cobre a janela inteira e o diálogo fica centrado, em qualquer ecrã.",

  "changelog.entries.inbox-menu-dropdown-visibility.title":
    "O menu de ações de conversa passa a aparecer corretamente",
  "changelog.entries.inbox-menu-dropdown-visibility.body":
    "O menu abre por cima da conversa seguinte, para veres Fixar, Favorito e Eliminar.",

  "changelog.entries.member-directory-filters-fix.title":
    "Os filtros do diretório de membros passam a filtrar mesmo",
  "changelog.entries.member-directory-filters-fix.body":
    "Aberto a, Onde estão, O que fazem, Profissão, Tempo de casa e Idiomas funcionam mesmo; define os teus em Definições.",

  "changelog.entries.directory-ownership-claims.title":
    "Posse real no diretório local",
  "changelog.entries.directory-ownership-claims.body":
    "O selo “negócio queer-owned verificado” significa uma confirmação da moderação; podes reclamar a listagem de um negócio teu.",

  "changelog.entries.session-expired-toast-fix.title":
    "Corrigida uma mensagem falsa de “sessão expirada”",
  "changelog.entries.session-expired-toast-fix.body":
    "Só aparece quando realmente tiveste uma sessão que expirou.",

  "changelog.entries.join-request-form-fix.title":
    "Simplificámos o formulário de pedido para entrar numa comunidade",
  "changelog.entries.join-request-form-fix.body":
    "O campo de email desapareceu, e “como gostarias de participar” partilha um passo com a nota que deixas para a moderação.",

  "changelog.entries.community-pulse-and-insights.title":
    "As comunidades já mostram os seus eventos, discussões e oportunidades de voluntariado reais",
  "changelog.entries.community-pulse-and-insights.body":
    "O separador Eventos lista os convívios reais, a barra lateral mostra discussões recentes, e quem gere tem um painel novo.",
  "changelog.entries.community-pulse-and-insights.details":
    "O separador Eventos de uma comunidade já lista os próximos convívios reais, e a barra lateral mostra discussões recentes e oportunidades de voluntariado. Quem gere a comunidade tem um novo painel sobre crescimento e publicações.",

  "changelog.entries.onboarding-identity-and-notifications.title":
    "A configuração inicial já pergunta pronomes e preferências de notificação",
  "changelog.entries.onboarding-identity-and-notifications.body":
    "A configuração tem passos opcionais para pronomes, uma bio curta e ativar notificações, e termina nos Primeiros passos.",

  "changelog.entries.getting-started-vouch-fix.title":
    "Corrigido o passo “recomenda alguém” do Início Rápido",
  "changelog.entries.getting-started-vouch-fix.body":
    "O passo só fica concluído depois de avalizares alguém; ser avalizade por um convite pessoal estava a marcá-lo por erro.",

  "changelog.entries.admin-invite-quota-controls.title":
    "Administradores podem definir limites de convites por membro",
  "changelog.entries.admin-invite-quota-controls.body":
    "A página de supervisão de convites sobe ou desce quantos convites um membro pode enviar por mês.",

  "changelog.entries.invite-approval-email.title":
    "Os convites aprovados enviam-se sozinhos",
  "changelog.entries.invite-approval-email.body":
    "Aprovar um pedido envia logo por email a ligação de convite; quem revê continua a poder copiá-la à mão como reserva.",

  "changelog.entries.join-request-mutual-member-field.title":
    "Nomear alguém que te pode avalizar passa a ser um dado real",
  "changelog.entries.join-request-mutual-member-field.body":
    "O campo “alguém que te pode avalizar” é enviado como campo próprio, para quem revê o poder associar diretamente.",

  "changelog.entries.post-opportunity-team-picker.title":
    "Publicar uma oportunidade já vem preenchido com os teus dados",
  "changelog.entries.post-opportunity-team-picker.body":
    "Equipa e contacto preenche o teu identificador e o slug de parceiro; a equipa vem de um seletor das tuas ligações.",

  "changelog.entries.side-quests-getting-started.title":
    "Missões secundárias assim que estiveres pronto",
  "changelog.entries.side-quests-getting-started.body":
    "Cada crachá que te falta tem um botão para onde o ganhas, mais as regalias por reclamar; há também quatro crachás novos.",

  // Ver a nota em en/marketing.ts: entrada corrigida a 26 de agosto de 2026.
  "changelog.entries.join-request-invite-email.title":
    "Correção: quem foi aprovade nunca recebeu um email de convite",
  "changelog.entries.join-request-invite-email.body":
    "A QueerPulse não envia email: aprovar um pedido cria a ligação de convite na fila de revisão, e quem revê fá-la chegar.",
  "changelog.entries.article-editor-header-and-send-on.title":
    "Cabeçalho do editor de artigos corrigido, e o botão Enviar já funciona",
  "changelog.entries.article-editor-header-and-send-on.body":
    "A barra fica encostada ao topo do ecrã, e “Enviar” avança mesmo a peça para a fase editorial seguinte.",
  "changelog.entries.gathering-rsvp-fix.title":
    "Confirmar presença nos encontros já funciona",
  "changelog.entries.gathering-rsvp-fix.body":
    "“Eu vou” confirma logo, com uma notificação e a opção Cancelar presença no mesmo sítio.",
  "changelog.entries.add-to-calendar-modal.title":
    "Adiciona encontros ao teu calendário",
  "changelog.entries.add-to-calendar-modal.body":
    "Um seletor oferece o Google Calendar ou um ficheiro .ics compatível com o Apple Calendar, o Outlook e a maioria das apps.",
  "changelog.entries.recognition-xp.title": "Ganha XP, níveis e crachás",
  "changelog.entries.recognition-xp.body":
    "A lista de primeiros passos, comunidades, encontros e ligações dão experiência; acompanha na página de Crachás.",

  "changelog.entries.governance-editable-finances.title":
    "Valores financeiros editáveis, com indicação da origem de cada número",
  "changelog.entries.governance-editable-finances.body":
    "Os admins corrigem os valores do separador Finanças, cada um etiquetado como exemplo, introduzido por admin ou calculado.",

  "changelog.entries.push-devices-list.title":
    "Vê e remove todos os dispositivos que recebem as tuas notificações push",
  "changelog.entries.push-devices-list.body":
    "As Definições listam em Notificações cada dispositivo registado para push; remove os que não reconheces.",

  "changelog.entries.admin-sitewide-announcement.title":
    "Os admins podem publicar um aviso em toda a plataforma",
  "changelog.entries.admin-sitewide-announcement.body":
    "Qualquer visitante o vê, com expiração automática opcional; cada membro pode dispensá-lo, e uma edição volta a mostrá-lo.",

  "changelog.entries.admin-reports-page.title":
    "Nova página consolidada de Relatórios no admin",
  "changelog.entries.admin-reports-page.body":
    "Crescimento, volume de denúncias, saúde das comunidades e finanças da governação, com intervalo de 4 a 26 semanas e CSV.",

  "changelog.entries.magazine-sections-browse.title":
    "Navega a revista por secção",
  "changelog.entries.magazine-sections-browse.body":
    "Uma página de Secções agrupa todos os artigos e edições pela secção editorial: Reportagens, Entrevista, Ensaios e outras.",

  // Ver a nota em en/marketing.ts: entrada corrigida a 26 de agosto de 2026.
  "changelog.entries.magazine-digest-real-send.title":
    "Correção: os resumos de edição nunca chegaram a ser enviados",
  "changelog.entries.magazine-digest-real-send.body":
    "A QueerPulse não envia email, por isso nenhum resumo chegou a uma caixa de correio; a redação continua a montá-lo.",

  "changelog.entries.magazine-deck-convert-to-article.title":
    "Os decks podem converter-se em artigos",
  "changelog.entries.magazine-deck-convert-to-article.body":
    "O editor de decks transporta texto, imagens e slides de estatísticas para um artigo, e assinala os slides interativos.",

  "changelog.entries.magazine-writer-read-brief.title":
    "Os redatores podem ler o briefing real da peça",
  "changelog.entries.magazine-writer-read-brief.body":
    "“Ler o briefing” abre o briefing real: o ângulo, o que incluir e evitar, o cachê e quem encomendou a peça.",

  "changelog.entries.admin-trust-network-cite-evidence.title":
    "Os admins podem citar provas a partir do grafo da rede de confiança",
  "changelog.entries.admin-trust-network-cite-evidence.body":
    "“Citar” escreve uma nota real no histórico de auditoria do membro, a descrever a relação de aval citada.",

  "changelog.entries.admin-trust-network-ring-detection.title":
    "A deteção de anéis na rede de confiança é agora uma análise real de grafo",
  "changelog.entries.admin-trust-network-ring-detection.body":
    "O aviso vem de grupos de contas novas que só se avalizam entre si, sem nenhum aval externo.",

  "changelog.entries.admin-reporter-credibility.title":
    "A fila de moderação mostra agora o histórico de quem denuncia, além de quem foi denunciado",
  "changelog.entries.admin-reporter-credibility.body":
    "Cada denúncia mostra quantas quem denuncia apresentou e quantas foram arquivadas, ao lado das de quem foi denunciado.",

  "changelog.entries.admin-housing-moderator-role.title":
    "Novo papel de staff: moderador só de Habitação",
  "changelog.entries.admin-housing-moderator-role.body":
    "O papel cobre anúncios e grupos de Habitação sem o nível completo de Moderador da plataforma.",

  "changelog.entries.gatherings-manage-attendees-remove-promote.title":
    "Quem organiza já pode remover uma pessoa convidada ou promovê-la da lista de espera",
  "changelog.entries.gatherings-manage-attendees-remove-promote.body":
    "Em Pessoas Convidadas, remover alguém liberta o lugar, e Promover traz alguém da lista de espera, fora de ordem se quiseres.",

  "changelog.entries.myevents-calendar-feed-subscribe.title":
    "Subscreve os teus convívios no Google ou Apple Calendar",
  "changelog.entries.myevents-calendar-feed-subscribe.body":
    "“Subscrever o teu feed” em Os Meus Convívios copia um link privado que mantém o Google ou Apple Calendar atualizado.",

  "changelog.entries.gatherings-recap-more-from-host.title":
    "Os resumos passam a apontar para mais convívios da mesma pessoa anfitriã",
  "changelog.entries.gatherings-recap-more-from-host.body":
    "A página de resumo mostra outros convívios futuros da mesma pessoa anfitriã, para marcares o próximo a partir dali.",

  "changelog.entries.myevents-rsvp-actions-real.title":
    "As ações em Os Meus Convívios já atualizam mesmo a tua inscrição",
  "changelog.entries.myevents-rsvp-actions-real.body":
    "Talvez, vou, aceitar ou recusar um convite, e sair de uma lista de espera passam a escrever na tua inscrição real.",

  "changelog.entries.myevents-block-host-real.title":
    '"Bloquear a pessoa anfitriã" em Os Meus Convívios já bloqueia mesmo',
  "changelog.entries.myevents-block-host-real.body":
    "A opção de bloquear no menu de um cartão de convívio usa o mesmo bloqueio de todo o resto da QueerPulse.",

  "changelog.entries.myevents-reminder-indicator-honest.title":
    "O sino de lembrete nos cartões de convívio passa a ser um estado",
  "changelog.entries.myevents-reminder-indicator-honest.body":
    "Os lembretes vão para todas as pessoas que vão ou talvez vão, com a antecedência que definires em Preferências.",

  "changelog.entries.gatherings-edit-date-time-fix.title":
    "Editar a data e hora de um convívio já o reagenda mesmo",
  "changelog.entries.gatherings-edit-date-time-fix.body":
    "O campo de data em Editar detalhes guarda uma data real, e todas as pessoas com inscrição são notificadas da mudança.",

  "changelog.entries.gatherings-cancelled-page-real-content.title":
    "A página de um convívio cancelado já mostra o convívio real",
  "changelog.entries.gatherings-cancelled-page-real-content.body":
    "O aviso de cancelamento mostra o título, a data, a pessoa anfitriã e o local reais do convívio cancelado.",

  "changelog.entries.gatherings-cohost-roster-visible.title":
    "Quem organiza já vê quem já está a coanfitrionar",
  "changelog.entries.gatherings-cohost-roster-visible.body":
    "O painel de pessoas coanfitriãs no painel de gestão lista quem já coanfitria o teu convívio.",

  "changelog.entries.gatherings-remove-pricing-step.title":
    "Removido o passo de preços ao criar um convívio",
  "changelog.entries.gatherings-remove-pricing-step.body":
    "A QueerPulse não processa pagamentos, por isso o passo de preços de bilhetes saiu do assistente de criação.",

  "changelog.entries.messages-message-requests.title":
    "Contacta alguém novo, diretamente da tua caixa de entrada",
  "changelog.entries.messages-message-requests.body":
    "Uma primeira mensagem em Nova Mensagem chega como pedido que a pessoa aceita ou recusa, num novo separador Pedidos.",

  "changelog.entries.messages-mute-conversation.title":
    "Silencia as notificações de uma conversa",
  "changelog.entries.messages-mute-conversation.body":
    "Silenciar fica junto de Fixar e Favoritos; uma conversa silenciada mantém o lugar e deixa de enviar notificações push.",

  "changelog.entries.messages-search-in-chat.title":
    "Pesquisa dentro de uma única conversa",
  "changelog.entries.messages-search-in-chat.body":
    "Abre uma conversa e toca no ícone de pesquisa para pesquisares só nessa conversa.",

  "changelog.entries.governance-proposals-voting.title":
    "As decisões de governação passam agora por uma votação real da comunidade",
  "changelog.entries.governance-proposals-voting.body":
    "Encerrar um lugar no conselho exige dois terços, financiamento externo maioria, com contagem ao vivo na Governação.",

  "changelog.entries.governance-figures-honesty.title":
    "A contagem de membros ativos da Governação é agora calculada ao vivo",
  "changelog.entries.governance-figures-honesty.body":
    "O número é contado a partir de contas reais, e a página diz que a equipa reporta os valores financeiros a cada trimestre.",

  "changelog.entries.communities-sister-demo-only.title":
    'As sugestões de "comunidades irmãs" ficam limitadas ao modo de demonstração',
  "changelog.entries.communities-sister-demo-only.body":
    'As sugestões de comunidades irmãs e "também em" usam dados de exemplo, por isso aparecem só na demonstração.',

  "changelog.entries.communities-category-filter.title":
    "Os filtros de categoria das comunidades funcionam para lá da primeira página",
  "changelog.entries.communities-category-filter.body":
    "O filtro de categoria pede as correspondências ao servidor, por isso continua a funcionar depois da primeira página.",

  "changelog.entries.communities-archive-reversible.title":
    "Comunidades arquivadas podem ser recuperadas",
  "changelog.entries.communities-archive-reversible.body":
    "Os administradores podem desarquivar uma comunidade, por isso arquivar por engano é reversível.",

  "changelog.entries.changemakers-nomination-reason.title":
    "As nomeações de Changemakers pedem agora a frase que prometem pedir",
  "changelog.entries.changemakers-nomination-reason.body":
    "O formulário tem um campo real para a tua frase sobre a pessoa, e quem revê pode ler o que escreveste.",

  "changelog.entries.changemakers-nomination-review.title":
    "As nomeações de Changemakers recebem agora uma resposta real",
  "changelog.entries.changemakers-nomination-review.body":
    "Os administradores podem aprovar ou recusar uma nomeação, e recebes uma notificação da decisão.",

  "changelog.entries.changemakers-connect-honest.title":
    'O botão "Contactar" num perfil de Changemaker é agora honesto sobre o que faz',
  "changelog.entries.changemakers-connect-honest.body":
    "Não há conta de membro por trás de um perfil de Changemaker, por isso Contactar encaminha-te para o canal de contacto geral.",

  "changelog.entries.moderation-assign-to-me.title":
    "Os moderadores podem reivindicar denúncias na fila",
  "changelog.entries.moderation-assign-to-me.body":
    'Reivindica ou liberta uma denúncia no painel da denúncia, e o filtro "Atribuídas a mim" reflete reivindicações reais.',

  "changelog.entries.moderation-report-history-link.title":
    "Vê o histórico completo de denúncias de um membro a partir da fila",
  "changelog.entries.moderation-report-history-link.body":
    'A contagem de "denúncias anteriores" liga a todas as outras denúncias sobre essa pessoa.',

  "changelog.entries.moderation-resolution-detail.title":
    "As denúncias resolvidas mostram o que realmente aconteceu",
  "changelog.entries.moderation-resolution-detail.body":
    'Cada uma mostra quem a resolveu, o que foi decidido e quando, e o "Encerrada há X" conta a partir da resolução.',

  "changelog.entries.moderation-sla-overdue.title":
    "As denúncias atrasadas são assinaladas na fila",
  "changelog.entries.moderation-sla-overdue.body":
    "O prazo de resposta de cada denúncia aparece na fila, com um aviso de atraso quando é ultrapassado.",

  "changelog.entries.moderation-bulk-actions-expanded.title":
    "A moderação em lote passa a incluir aviso, suspensão e banimento",
  "changelog.entries.moderation-bulk-actions-expanded.body":
    "A suspensão traz seletor de duração, e uma vaga de denúncias coordenadas pode ser tratada de uma só vez.",

  "changelog.entries.moderation-appeal-integrity.title":
    "As revisões de recursos mostram as provas reais, e já não podem ser autorrevistas",
  "changelog.entries.moderation-appeal-integrity.body":
    "O conteúdo denunciado aparece a par do resumo do moderador, e quem decidiu o caso fica impedido de rever o recurso.",

  "changelog.entries.forum-write-rate-limit.title":
    "As publicações no fórum têm agora o seu próprio limite de frequência",
  "changelog.entries.forum-write-rate-limit.body":
    "Tópicos, respostas e votos têm agora uma proteção contra abuso própria, à altura da que as comunidades já tinham.",

  "changelog.entries.forum-first-post-accuracy.title":
    'O aviso de "primeira publicação" verifica agora o teu histórico real',
  "changelog.entries.forum-first-post-accuracy.body":
    "O convite verifica se já publicaste alguma vez, por isso quem já publica deixa de ser saudado como recém-chegado.",

  "changelog.entries.forum-lock-reason.title":
    "Os tópicos encerrados podem dizer porquê",
  "changelog.entries.forum-lock-reason.body":
    "Um moderador pode acrescentar um motivo breve ao encerrar, e esse motivo aparece na faixa de encerrado.",

  "changelog.entries.forum-shareable-filters.title":
    "A categoria e a ordenação do fórum sobrevivem a uma atualização da página",
  "changelog.entries.forum-shareable-filters.body":
    "Escolher uma categoria ou ordenação atualiza o link da página, por isso atualizar ou partilhar mantém a tua vista.",

  "changelog.entries.forum-search-hint.title":
    "A pesquisa do fórum diz agora o que pesquisa",
  "changelog.entries.forum-search-hint.body":
    "Uma nota breve junto à caixa de pesquisa explica que a busca é pelos títulos dos tópicos.",

  "changelog.entries.forum-most-helpful-real.title":
    'A ordenação "Mais útil" reflete agora votos reais',
  "changelog.entries.forum-most-helpful-real.body":
    "Ordenar respostas usa votos positivos reais em toda a plataforma, e a resposta mais votada leva o distintivo de estrela.",

  "changelog.entries.recognition-locked-badges-honest.title":
    "A vitrine de emblemas só mostra emblemas que consegues mesmo ganhar",
  "changelog.entries.recognition-locked-badges-honest.body":
    "Alguns emblemas bloqueados não levavam a nada; ficam escondidos até haver uma forma real de os ganhar.",

  "changelog.entries.recognition-vouch-perk-copy.title":
    'A descrição do benefício "Acesso a apadrinhamento" corresponde agora à realidade',
  "changelog.entries.recognition-vouch-perk-copy.body":
    "Apadrinhar nunca teve requisito de nível, por isso a vitrine diz agora que qualquer membro ativo pode apadrinhar.",

  "changelog.entries.recognition-visible-on-profiles.title":
    "Vê o nível e os emblemas de outros membros",
  "changelog.entries.recognition-visible-on-profiles.body":
    "O nível e os emblemas aparecem agora nos perfis de outros membros, para o reconhecimento ser um sinal visível entre membros.",

  "changelog.entries.vouch-daily-cap.title":
    "Um limite diário de apadrinhamentos, para manter o sinal significativo",
  "changelog.entries.vouch-daily-cap.body":
    "Além do intervalo entre apadrinhamentos, um limite diário generoso mantém o peso do sinal ao longo do tempo.",

  "changelog.entries.magazine-article-publish-schedule.title":
    "Publicar e agendar artigos, agora a sério",
  "changelog.entries.magazine-article-publish-schedule.body":
    "Publicar e Agendar no editor de artigos já funcionam: a tua peça vai ao ar de imediato ou na hora que escolheres.",

  "changelog.entries.magazine-writer-draft-paste-fix.title":
    'Colar um rascunho em "Entregar rascunho" deixou de o perder',
  "changelog.entries.magazine-writer-draft-paste-fix.body":
    "O texto colado passa para o editor de artigos como parágrafos reais, prontos para continuares a trabalhar.",

  "changelog.entries.magazine-live-discovery.title":
    "A revista já tem por onde navegar",
  "changelog.entries.magazine-live-discovery.body":
    "A capa, o arquivo de edições e as páginas de autores usam dados reais, e um novo diretório de autores mostra quem escreve.",

  "changelog.entries.culture-submissions-real.title":
    "As submissões do Clube, Mostra e Rádio são agora reais",
  "changelog.entries.culture-submissions-real.body":
    "Sugerir uma escolha, publicar um projeto de encomenda, submeter trabalho para a mostra e enviar uma playlist ficam guardados.",

  "changelog.entries.culture-radio-honest.title":
    "Os controlos da Rádio dizem a verdade",
  "changelog.entries.culture-radio-honest.body":
    "Reproduzir e avançar refletem o que está mesmo no ar, e Tornar-me curador abre o formulário real de submissão de playlist.",

  "changelog.entries.newsletter-unsubscribe.title":
    "Cancela tu a subscrição da newsletter",
  // Ver a nota em en/marketing.ts: corpo corrigido a 26 de agosto de 2026.
  "changelog.entries.newsletter-unsubscribe.body":
    "Abre a página de cancelamento com o teu código e o teu endereço sai da lista.",

  "changelog.entries.resources-crisis-hotline-coverage.title":
    "Linhas de crise aparecem agora em todas as páginas próximas de crise",
  "changelog.entries.resources-crisis-hotline-coverage.body":
    "Direito, Saúde Trans, Redução de Danos, Saúde Sexual, Segurança e Saúde Mental têm a mesma faixa do Bem-estar.",

  "changelog.entries.resources-library-consolidated.title":
    "A página de Recursos passa a mostrar dados reais de guias",
  "changelog.entries.resources-library-consolidated.body":
    "A página inicial de Recursos mostra os mesmos guias reais do resto da aplicação, com a atualidade de cada guia registada.",

  "changelog.entries.resources-guide-freshness.title":
    "Os guias mostram agora quando foram verificados pela última vez",
  "changelog.entries.resources-guide-freshness.body":
    'Cada guia mostra a data da última verificação editorial, ou um honesto "ainda não verificado".',

  "changelog.entries.resources-suggest-edit-expanded.title":
    "Sugerir uma alteração, para além do Glossário",
  "changelog.entries.resources-suggest-edit-expanded.body":
    "Abre agora também em Direito, Saúde Trans, Redução de Danos, Saúde Mental e na biblioteca de guias.",

  "changelog.entries.directory-review-reporting.title":
    "Denunciar uma avaliação individual no diretório local",
  "changelog.entries.directory-review-reporting.body":
    "Cada avaliação na página de um negócio tem a opção Denunciar; um moderador trata dela como de qualquer outra denúncia.",

  "changelog.entries.directory-search-pagination.title":
    "Pesquisa mais rápida e completa no diretório local",
  "changelog.entries.directory-search-pagination.body":
    "A pesquisa filtra no servidor e carrega mais lugares ao chegares ao fim, para uma pesquisa ampla chegar à contagem real.",

  "changelog.entries.directory-edit-suggestions-applied.title":
    "Correções de anúncios aceites agora atualizam mesmo o anúncio",
  "changelog.entries.directory-edit-suggestions-applied.body":
    "Uma correção aceite ao horário, morada, telefone, site ou descrição atualiza o anúncio e notifica a pessoa dona.",

  "changelog.entries.housing-my-listings.title":
    "Gere o quarto ou casa que publicaste, na tua própria página Os Meus Anúncios",
  "changelog.entries.housing-my-listings.body":
    "Edita, marca como preenchido, prolonga ou remove; um anúncio expira por si ao fim de alguns meses sem atualização.",

  "changelog.entries.appeal-outcome-tracking.title":
    "O resultado do recurso mostra agora o teu estado real",
  "changelog.entries.appeal-outcome-tracking.body":
    "A página de resultado usa a decisão do moderador: mantido, revertido ou a aguardar revisão.",

  "changelog.entries.quickexit-more-pages.title":
    "A saída rápida está disponível em mais páginas de segurança",
  "changelog.entries.quickexit-more-pages.body":
    "O botão de saída rápida aparece também em Bloquear e Silenciar, nas páginas de recurso e nos anúncios de Espaços Seguros.",

  "changelog.entries.legal-links-reconciled.title":
    "Todos os documentos legais estão agora listados no rodapé e no menu",
  "changelog.entries.legal-links-reconciled.body":
    "O rodapé e o menu Sobre partilham o mesmo conjunto: privacidade, termos, cookies, ficha legal, diretrizes e pedidos de dados.",

  "changelog.entries.hate-crime-resources-linked.title":
    "Recursos sobre Crimes de Ódio está agora ligado a partir do rodapé",
  "changelog.entries.hate-crime-resources-linked.body":
    "Está na coluna de Apoio do rodapé, junto de Apoio Jurídico e Denúncias e Segurança.",

  "changelog.entries.listing-quick-edit.title":
    "Edição rápida para o teu anúncio no diretório",
  "changelog.entries.listing-quick-edit.body":
    "Os Meus Espaços edita frase de apresentação, nota do horário, telefone e site no sítio; o editor completo fica a um clique.",

  "changelog.entries.topics-follow-notifications-and-directory.title":
    "Seguir um tópico já te avisa, e há um novo diretório de Tópicos",
  "changelog.entries.topics-follow-notifications-and-directory.body":
    "Recebes aviso quando alguém publica com uma etiqueta que segues, e a página de Tópicos no menu Comunidade lista todos.",

  "changelog.entries.search-topics-real-results.title":
    "Os tópicos já aparecem na pesquisa global",
  "changelog.entries.search-topics-real-results.body":
    'Tópicos com hashtag aparecem ao lado de pessoas e comunidades, e categorias com mais resultados têm uma ligação "Ver tudo".',

  "changelog.entries.feed-connections-tab.title":
    'Novo separador "Ligações" no teu feed',
  "changelog.entries.feed-connections-tab.body":
    "Publicações, tópicos do fórum e convívios das tuas ligações, tudo num só lugar na barra de separadores do feed.",

  "changelog.entries.connections-report-now-files.title":
    "Corrigido: denunciar uma ligação agora envia mesmo a denúncia",
  "changelog.entries.connections-report-now-files.body":
    "Denunciar, no menu de opções de uma ligação, abre o formulário habitual de motivo e detalhe e chega à equipa de moderação.",

  "changelog.entries.getting-started-xp-not-awarded-fix.title":
    "Corrigido: XP do Início Rápido não aparecia",
  "changelog.entries.getting-started-xp-not-awarded-fix.body":
    "O teu nível atualiza-se logo à medida que concluis passos, e cada passo concluído mostra o XP que rendeu.",

  "changelog.entries.badges-levels-v2-redesign.title":
    "Emblemas e níveis redesenhados",
  "changelog.entries.badges-levels-v2-redesign.body":
    "Um mostrador de nível, os emblemas mais perto de ganhares, um espólio filtrável, emblemas sazonais e de onde veio o teu XP.",

  "changelog.entries.listing-preview-matches-card.title":
    "A pré-visualização do anúncio agora corresponde ao cartão real do diretório",
  "changelog.entries.listing-preview-matches-card.body":
    'A pré-visualização mostra o cartão exato que as pessoas veem, foto de capa incluída, com um atalho "Adicionar foto de capa".',

  "changelog.entries.profile-shapings-editor.title":
    'Edita a secção "O que me formou"',
  "changelog.entries.profile-shapings-editor.body":
    "O filme, o livro, a música e o momento que te formaram já podem ser adicionados e editados no perfil, como as outras listas.",

  "changelog.entries.xp-breakdown.title": "Vê o que rendeu o teu XP",
  "changelog.entries.xp-breakdown.body":
    "O Início Rápido mostra as principais fontes do teu XP, e a página de Emblemas detalha cada fonte e o que falta ganhar.",

  "changelog.entries.profile-hero-rail-redesign.title":
    "Hero e barra lateral do perfil redesenhados",
  "changelog.entries.profile-hero-rail-redesign.body":
    "Os sinais de confiança, como verificado, equipa e avais, vêm com uma explicação simples, mais uma navegação por secções.",
  "changelog.entries.profile-rail-stats-redesign.title":
    "As tuas estatísticas de perfil, num relance",
  "changelog.entries.profile-rail-stats-redesign.body":
    "As ligações e os votos de confiança aparecem como números identificados, e a privacidade passou para um menu junto a Editar.",
  "changelog.entries.profile-who-sees-what-controls.title":
    "Escolhe exatamente quem vê o quê no teu perfil",
  "changelog.entries.profile-who-sees-what-controls.body":
    '"Quem vê o quê" reúne predefinições, interruptores para foto, bairro e avais, e esconder-te de pessoas específicas.',
  "changelog.entries.profile-your-data-panel.title":
    'Um painel "Os teus dados" para a tua conta',
  "changelog.entries.profile-your-data-panel.body":
    "Descarrega tudo o que a QueerPulse guarda sobre ti, afasta-te, pede a eliminação com 30 dias de margem, ou pede dados.",
  "changelog.entries.profile-board-work-name-qr-updates.title":
    "Publicações no quadro podem ser marcadas como encontradas, trabalhos ganham um segundo link, e mais",
  "changelog.entries.profile-board-work-name-qr-updates.body":
    "Marca uma publicação do quadro como encontrada, indica a pronúncia do teu nome, escreve a bio em português e abre o teu QR.",

  "changelog.entries.gathering-venue-directory-link.title":
    "Liga o espaço de um encontro à sua ficha no diretório local",
  "changelog.entries.gathering-venue-directory-link.body":
    "Ao definires o espaço, podes pesquisar o diretório local e escolher um negócio real, e o nome liga à sua ficha.",
  "changelog.entries.add-to-calendar-picker-redesign.title":
    "Adicionar ao calendário passa a oferecer Google, Apple, Outlook e Yahoo",
  "changelog.entries.add-to-calendar-picker-redesign.body":
    "O seletor tem uma linha para cada serviço e usa o fuso horário indicado no evento, para a hora ficar certa.",
  "changelog.entries.local-directory-card-redesign.title":
    "Os cartões do diretório e dos espaços mostram agora foto, avaliação e horário",
  "changelog.entries.local-directory-card-redesign.body":
    "Os cartões trazem avaliação por estrelas, preço e etiquetas, um botão de guardar e o estado de horário à volta da foto.",

  "changelog.entries.forum-thread-pinning.title":
    "Os moderadores podem fixar tópicos do fórum no topo",
  "changelog.entries.forum-thread-pinning.body":
    "Fixa um tópico no menu de opções, mantendo até 3 acima da lista em qualquer separador de ordenação; desafixa da mesma forma.",

  "changelog.entries.magazine-desk-notifications-cleanup.title":
    "Menos notificações duplicadas na secretária, e Marcar tudo como lido a funcionar",
  "changelog.entries.magazine-desk-notifications-cleanup.body":
    "Edições repetidas à mesma peça pela mesma pessoa juntam-se numa só notificação, e o número no sino limpa mesmo.",

  "changelog.entries.volunteer-opportunity-edit-parity.title":
    "Editar uma oportunidade usa agora o mesmo formulário de a publicar",
  "changelog.entries.volunteer-opportunity-edit-parity.body":
    "O ecrã de edição inclui agora os campos de motivo, tarefas e compromisso.",

  "changelog.entries.local-directory-sort-fix.title":
    "Corrigido o menu de ordenação do Diretório de negócios locais",
  "changelog.entries.local-directory-sort-fix.body":
    'O menu Ordenar tem agora sempre espaço para mostrar "Em destaque", "A a Z" e "Por bairro" numa só linha.',

  "changelog.entries.governance-chart-upgrade.title":
    "Um gráfico de receita vs. despesa mais claro na área de governação",
  "changelog.entries.governance-chart-upgrade.body":
    "O gráfico trimestral ajusta-se ao espaço; passa o rato ou o foco numa barra para ver receita, despesa e excedente da reserva.",

  "changelog.entries.landing-live-preview.title":
    "Pré-visualização em tempo real ao fazer a curadoria da página inicial",
  "changelog.entries.landing-live-preview.body":
    "Adiciona, reordena, oculta ou reescreve um cartão em destaque e a pré-visualização ao lado do editor atualiza logo.",

  "changelog.entries.personas-in-directory.title":
    "As personas do teu perfil aparecem no diretório",
  "changelog.entries.personas-in-directory.body":
    "As personas ligadas ao teu perfil de membro surgem ao lado das autónomas, que continuam pseudónimas.",

  "changelog.entries.therapist-personas-directory.title":
    "Diretórios de terapeutas, com perfis reais",
  "changelog.entries.therapist-personas-directory.body":
    "Cada perfil verificado pela comunidade mostra como a pessoa trabalha, valores, disponibilidade, onde atende e avais.",
  "changelog.entries.therapist-personas-directory.details":
    "Os diretórios de terapeutas afirmativos mostram agora perfis reais, verificados pela comunidade: como cada pessoa trabalha, valores, disponibilidade, onde atende e avais. Os terapeutas geram o seu próprio perfil.",

  "changelog.entries.concern-intake-live.title":
    "Levanta uma preocupação, e nós vamos mesmo vê-la",
  "changelog.entries.concern-intake-live.body":
    "As submissões da página de governação entram num painel da equipa onde são triadas e acompanhadas.",

  "changelog.entries.housing-neighbourhoods-map.title":
    "Escolhe vários bairros e explora casas num mapa",
  "changelog.entries.housing-neighbourhoods-map.body":
    "Filtra por vários bairros de Lisboa ao mesmo tempo, e toca num bairro na nova vista de mapa para o juntares aos filtros.",

  "changelog.entries.housing-outro-band.title":
    "Um convite de fecho no quadro de habitação",
  "changelog.entries.housing-outro-band.body":
    "O quadro termina com a faixa de fecho acolhedora do site, com formas rápidas de anunciar o teu espaço ou perguntar no fórum.",

  "changelog.entries.gathering-audience-scope.title":
    "Escolhe quem pode ver o teu convívio",
  "changelog.entries.gathering-audience-scope.body":
    "Define até onde chega: toda a QueerPulse, quem as tuas ligações conhecem, as tuas ligações, uma comunidade ou só por convite.",

  "changelog.entries.unified-pronoun-picker.title":
    "Um seletor de pronomes consistente em todos os perfis",
  "changelog.entries.unified-pronoun-picker.body":
    "Perfil, perfil de trabalho e habitação usam uma lista partilhada; escolhe mais do que um conjunto ou acrescenta os teus.",
  "changelog.entries.work-profile-skills-focus.title":
    "Escolhe as tuas competências e áreas de foco no perfil de trabalho",
  "changelog.entries.work-profile-skills-focus.body":
    "Escolhe o que ofereces e onde queres apoio; a troca de competências usa essas etiquetas para te ligar a alguém.",
  "changelog.entries.profile-personal-fields.title":
    "O teu nome, pronomes e localização agora ficam juntos",
  "changelog.entries.profile-personal-fields.body":
    "Os dois editores de perfil começam com os três essenciais num só bloco.",
  "changelog.entries.feed-avatar-to-profile.title":
    "Toca na foto de alguém no feed para abrir o perfil",
  "changelog.entries.feed-avatar-to-profile.body":
    "Funciona em publicações, notas de nova pessoa, tópicos do fórum e cartões de convívio.",
  "changelog.entries.affirming-housing-baseline.title":
    "Todas as casas e todos os colegas de casa aqui são afirmativos LGBTQ+, agora é o padrão",
  "changelog.entries.affirming-housing-baseline.body":
    "Assumes um compromisso curto antes de publicares ou contactares, e cada anúncio tem o selo.",
  // ── Wave B2: anúncios verificados, marcação de visitas, avaliações cegas ─
  "changelog.entries.housing-listing-discovery.title":
    "Encontra a casa certa: fotos a sério, filtros que encaixam e um aviso quando aparece",
  "changelog.entries.housing-listing-discovery.body":
    "Fotos em ecrã inteiro com legendas, filtros de preço, bairro, quartos, acesso e data de entrada, e procuras guardadas.",

  "changelog.entries.housing-viewings-reviews.title":
    "Vê a casa antes de pagar, e avaliações que não se manipulam",
  "changelog.entries.housing-viewings-reviews.body":
    "Pede uma visita por vídeo ou presencial, vê a morada exata quando for aceite, e depois ambos deixam uma avaliação cega.",

  // ── Wave B1: integridade dos anúncios de habitação — risco, provas, transparência ─
  "changelog.entries.housing-listing-integrity.title":
    "Anúncios de habitação em que podes confiar um pouco mais",
  "changelog.entries.housing-listing-integrity.body":
    "Cada novo anúncio indica o acesso com honestidade, diz se é membro ou agente a oferecer, e é verificado antes de entrar.",

  // ── Wave A: segurança na habitação, privacidade no mapa, mensagens, grupos ─
  "changelog.entries.housing-scam-safety-tenant-rights.title":
    "Arrenda sem cair em burlas, e conhece os teus direitos",
  "changelog.entries.housing-scam-safety-tenant-rights.body":
    "Aparece uma nota de segurança ao contactares sobre um espaço, e a página Segurança na habitação cobre os teus direitos.",

  "changelog.entries.housing-map-area-privacy.title":
    "Vê primeiro a zona, a morada exata só quando estiverem ligados",
  "changelog.entries.housing-map-area-privacy.body":
    "Os anúncios mostram um mapa ao nível do bairro que passa ao ponto exato e à morada completa quando ficarem ligados.",

  "changelog.entries.messaging-safety-block-report-pii.title":
    "Bloquear, denunciar e um lembrete antes de partilhares demais",
  "changelog.entries.messaging-safety-block-report-pii.body":
    "Bloquear tem efeito imediato, e um aviso discreto aparece se a mensagem tiver telefone, email ou dados bancários.",

  "changelog.entries.flatmate-pronoun-pre-share.title":
    "Partilha os teus pronomes com um olá, só quando quiseres",
  "changelog.entries.flatmate-pronoun-pre-share.body":
    "A opção fica no olá a um possível colega de casa, desativada por omissão e visível só para essa pessoa.",

  "changelog.entries.flatmate-discovery-mode.title":
    "Uma forma mais calma de explorar colegas de casa",
  "changelog.entries.flatmate-discovery-mode.body":
    "A vista de Descoberta mostra um perfil de cada vez com a razão do encaixe; quando ambos gostam, podes dizer olá.",

  "changelog.entries.vetted-housing-groups.title":
    "Grupos de habitação verificados em que quem arrenda queer confia",
  "changelog.entries.vetted-housing-groups.body":
    "Cada anúncio indica a renda à partida e descreve a acessibilidade; pede para entrar e alguém do grupo lê o teu pedido.",

  "changelog.entries.vouch-multiple-relationships.title":
    "Diz todas as formas como conheces alguém",
  "changelog.entries.vouch-multiple-relationships.body":
    "Um aval pode indicar todas as relações: amizade, colaboração, vizinhança, ou terem-se conhecido aqui.",

  "changelog.entries.getting-started-checklist.title":
    "Uma lista suave para os teus primeiros passos",
  "changelog.entries.getting-started-checklist.body":
    "Primeiros passos, no menu da conta, lista perfil, comunidade, aval e publicação, e cada passo assinala-se sozinho.",

  "changelog.entries.onboarding-set-up-personas-after.title":
    "Um acolhimento mais calmo: cria personas depois de entrares",
  "changelog.entries.onboarding-set-up-personas-after.body":
    "O onboarding deixa as personas para depois; cria uma para o teu ofício quando quiseres, na tua página de personas.",

  "changelog.entries.pin-favorite-chats-inbox-tabs.title":
    "Fixa, marca como favorita e filtra a tua caixa de entrada",
  "changelog.entries.pin-favorite-chats-inbox-tabs.body":
    "Fixa até 3 conversas no topo, marca favoritas, e filtra por Todas, Não lidas, Favoritas ou Grupos.",

  "changelog.entries.identity-verification-honest-badges.title":
    "Verificação de identidade real com selos honestos",
  "changelog.entries.identity-verification-honest-badges.body":
    "Confirma o telefone para anunciar ou contactar; um parceiro faz a verificação de identidade opcional, sem vermos o documento.",

  "changelog.entries.flatmate-explainable-matching.title":
    "Correspondências de colega de casa mais inteligentes e explicáveis",
  "changelog.entries.flatmate-explainable-matching.body":
    "Cada correspondência mostra porquê: orçamento, bairro, datas, estilo de vida e bases da casa; um questionário curto afina-a.",

  "changelog.entries.flatmate-safe-space-identity.title":
    "Diz quem és no quadro de colegas de casa, nos teus termos",
  "changelog.entries.flatmate-safe-space-identity.body":
    "Pronomes, género e o que torna uma casa segura são opcionais; escolhes quem vê e podes limpar quando quiseres.",

  "changelog.entries.privacy-policy-refresh.title":
    "A Política de Privacidade agora corresponde ao que a plataforma faz de facto",
  "changelog.entries.privacy-policy-refresh.body":
    "Cobre o Iniciar sessão com o Google, as notificações push, os dados de localização e mensagens, e os serviços que usamos.",

  "changelog.entries.gatherings-manage-rsvp-recap-live.title":
    "Organizar um encontro já funciona a sério",
  "changelog.entries.gatherings-manage-rsvp-recap-live.body":
    "Presença e lista de espera no próprio encontro; quem organiza edita, cancela, vê quem vem, junta co-anfitriões e põe fotos.",

  "changelog.entries.coop-template-portuguese.title":
    "Os modelos para formar uma cooperativa já falam português",
  "changelog.entries.coop-template-portuguese.body":
    "Carta de valores, estatutos-modelo e acordo de título de capital leem-se em português europeu; pede a um advogado que reveja.",

  "changelog.entries.members-explainer-modal.title":
    "O botão “Explorar pessoas” da página inicial agora explica-se",
  "changelog.entries.members-explainer-modal.body":
    "Quem não tem sessão recebe uma explicação curta de como funciona fazer parte, e pode pedir convite ou iniciar sessão.",

  "changelog.entries.invite-request-mutual-email.title":
    "Pedir para entrar passa a pedir o email de um membro",
  "changelog.entries.invite-request-mutual-email.body":
    "Dá o email de alguém que conheces aqui e encontramos essa pessoa para te avalizar mais depressa; o campo continua opcional.",

  "changelog.entries.report-form-guide-split.title":
    "O formulário de denúncia e o guia de denúncias são agora páginas separadas",
  "changelog.entries.report-form-guide-split.body":
    "O guia, os princípios das decisões e o registo público de moderação têm agora uma página própria, ligada nos dois sentidos.",

  "changelog.entries.safety-page-report-form.title":
    "Denunciar uma preocupação vai direto ao formulário",
  "changelog.entries.safety-page-report-form.body":
    "A página de segurança liga ao formulário de denúncia na app, e a explicação dos avais corresponde a como a entrada funciona.",

  "changelog.entries.public-profile-eligibility-live.title":
    "Perfis públicos que podes mesmo conquistar.",
  "changelog.entries.public-profile-eligibility-live.body":
    "O progresso segue textos publicados, encontros que organizaste, avais, recomendações e o tempo que apareceste.",

  "changelog.entries.public-profile-eligibility-tracker.title":
    "Um caminho mais claro para o perfil público.",
  "changelog.entries.public-profile-eligibility-tracker.body":
    "Vês o essencial, como contribuição, confiança da comunidade e participação somam, e o próximo passo para avançares.",

  "changelog.entries.how-communities-work-page.title":
    "Uma entrada mais clara para as comunidades",
  "changelog.entries.how-communities-work-page.body":
    "Os cartões de comunidade da página inicial abrem uma página sobre como funcionam e porque importam, antes de pedires convite.",

  "changelog.entries.guidelines-read-gate.title":
    "Lê as diretrizes até ao fim antes de concordares",
  "changelog.entries.guidelines-read-gate.body":
    "As diretrizes começam pelas linhas vermelhas, como denunciar e o que acontece a quem as ultrapassa, de um aviso à remoção.",

  "changelog.entries.guidelines-in-sheet.title":
    "Lê as diretrizes da comunidade sem perderes o que escreveste",
  "changelog.entries.guidelines-in-sheet.body":
    "No pedido de convite e no acolhimento sobem numa folha que podes ler e fechar ali mesmo, sem perderes o que escreveste.",

  "changelog.entries.meganav-highlight-illustrations.title":
    "Menus ilustrados na navegação de topo",
  "changelog.entries.meganav-highlight-illustrations.body":
    "Cada menu abre com uma ilustração desenhada à mão do seu destaque: pessoas a reunir-se, a cidade, apoio, cultura, trabalho.",

  "changelog.entries.coming-out-guide-public.title":
    "O guia de sair do armário volta a estar aberto a todos",
  "changelog.entries.coming-out-guide-public.body":
    "Ficou trancado atrás do início de sessão por engano; é uma página de apoio e volta a ler-se sem conta.",

  "changelog.entries.poem-editor-v2.title":
    "Escrever um poema já parece mesmo escrever um poema",
  "changelog.entries.poem-editor-v2.body":
    "Uma pré-visualização ao vivo fica ao lado do texto, as estrofes arrastam-se, e cada poema tem um link para partilhar.",

  "changelog.entries.under18-open-invite.title":
    "A mensagem para menores de 18 passa a abrir uma porta, não a fechá-la",
  "changelog.entries.under18-open-invite.body":
    "A nota começa pelo que está aberto a todos: a biblioteca, a revista e os nossos recursos, para ler sem conta.",

  "changelog.entries.communities-explained.title":
    "Uma visão mais clara de como funcionam as comunidades",
  "changelog.entries.communities-explained.body":
    "A página explica o que é uma comunidade, como te juntas e porque importa, com um caminho para as que já existem.",

  "changelog.entries.smoother-drag-reorder.title":
    "Arrastar para reordenar mais fluido",
  "changelog.entries.smoother-drag-reorder.body":
    "Agarra uma linha de uma secção de persona pela pega e as outras deslizam; as setas continuam para teclado e leitor de ecrã.",

  "changelog.entries.poem-translations.title": "Adiciona traduções de um poema",
  "changelog.entries.poem-translations.body":
    "Um poema pode ter o original e as traduções, cada uma com nome, e quem lê troca com um toque.",

  "changelog.entries.reframe-your-photos.title": "Reenquadra as tuas fotos",
  "changelog.entries.reframe-your-photos.body":
    "Arrasta e amplia para escolher como uma foto fica enquadrada antes de guardar, em fotos de perfil, personas e tudo o resto.",

  "changelog.entries.guidelines-agree-self-tick.title":
    "A caixa das diretrizes marca-se sozinha quando lês até ao fim",
  "changelog.entries.guidelines-agree-self-tick.body":
    "As diretrizes abrem num painel, confirmar desbloqueia no fim e marca a caixa; um clique distraído deixa-a como está.",

  "changelog.entries.adults-only-explainer-modal.title":
    "“Eis porquê somos 18+” abre onde estás",
  "changelog.entries.adults-only-explainer-modal.body":
    "Um painel discreto abre por cima da verificação de idade; lês, fechas, e tudo o que escreveste continua lá.",

  "changelog.entries.adults-only-explainer.title":
    "“Eis porquê somos 18+” passa mesmo a dizer porquê",
  "changelog.entries.adults-only-explainer.body":
    "A secção Elegibilidade explica porque a QueerPulse é só para adultos e porque quem tem menos de 18 anos também pertence.",

  "changelog.entries.persona-excerpt-crash-fix.title":
    "Adicionar um excerto já não estraga o perfil",
  "changelog.entries.persona-excerpt-crash-fix.body":
    "Um só campo preenchido num excerto ou detalhe de menu deixava a página em branco; agora mostra o que já adicionaste.",

  "changelog.entries.poem-line-break-fix.title":
    "As quebras de linha dos poemas ficam guardadas",
  "changelog.entries.poem-line-break-fix.body":
    "Colar um poema juntava as linhas; cada verso mantém agora a sua própria linha, tal como o escreveste ou colaste.",

  "changelog.entries.poet-rich-poems.title": "Escreve e lê poemas na íntegra",
  "changelog.entries.poet-rich-poems.body":
    "Os perfis de poeta têm um editor com estrofes, separadores, notas, itálico e negrito, e uma vista de leitura ampla.",

  "changelog.entries.persona-editor-drag-reorder.title":
    "Arrasta para reordenar itens numa persona",
  "changelog.entries.persona-editor-drag-reorder.body":
    "A pega arrasta com o dedo ou o rato e a lista reorganiza-se ao vivo; as setas continuam para uso com teclado.",

  "changelog.entries.persona-item-link-picker-size.title":
    "Corrigidos campos em linha sobredimensionados em alguns editores",
  "changelog.entries.persona-item-link-picker-size.body":
    "O seletor de ligação da persona, as notas de conteúdo de filmes e as caixas de fotos de negócio voltam ao tamanho compacto.",

  "changelog.entries.persona-editor-wide-sheet.title":
    "Editar uma secção da tua persona abre agora um painel amplo a partir de baixo",
  "changelog.entries.persona-editor-wide-sheet.body":
    "Projetos, papéis e fotos editam-se num painel largo com os campos dois a dois; no telemóvel fica de largura total.",

  "changelog.entries.community-featured-cards.title":
    "As comunidades em destaque ganham o cartão completo, com fotografias de capa",
  "changelog.entries.community-featured-cards.body":
    "O cartão da página inicial mostra capa, categoria, quem organiza e rostos reais de membros; quem cria pode adicionar capa.",

  "changelog.entries.media-in-use-references.title":
    "Vê onde cada imagem enviada está a ser usada, e o que podes eliminar em segurança",
  "changelog.entries.media-in-use-references.body":
    "Os teus envios e a consola de imagens ligam a cada sítio onde uma imagem é usada e marcam as sem referências.",

  "changelog.entries.homepage-featured-photo-fix.title":
    "As fotografias dos membros em destaque voltam a aparecer na página inicial",
  "changelog.entries.homepage-featured-photo-fix.body":
    "O destaque mostrava cada retrato como imagem quebrada; agora resolve as fotos como qualquer outro avatar.",

  "changelog.entries.admin-media-filter-by-uploader.title":
    "As administrações podem filtrar as imagens enviadas por quem as enviou",
  "changelog.entries.admin-media-filter-by-uploader.body":
    "Restringe a grelha a um membro procurando por nome ou identificador, ou tocando no nome de quem enviou num ficheiro.",

  "changelog.entries.persona-preview-banner-bleed.title":
    "As capas das personas vão agora de ponta a ponta no teu perfil",
  "changelog.entries.persona-preview-banner-bleed.body":
    "A capa do cartão “Também a trabalhar como” preenche-o por completo, igual ao aspeto das páginas das personas.",

  "changelog.entries.magazine-archive-truthful-hero.title":
    "O arquivo da revista mostra agora só edições reais",
  "changelog.entries.magazine-archive-truthful-hero.body":
    "Números de exemplo como “nove edições desde 2024” ficam só na pré-visualização; a página real leva às edições verdadeiras.",

  "changelog.entries.persona-families-expansion.title":
    "As personas já servem muito mais ofícios",
  "changelog.entries.persona-families-expansion.body":
    "Seis novos estilos de página, entre eles cadeira de salão, passerelle e cartaz de movimento, e dezenas de novas profissões.",

  "changelog.entries.pole-dancer-persona.title": "Personas de pole dance",
  "changelog.entries.pole-dancer-persona.body":
    "Uma só persona junta os espetáculos que apresentas e as aulas que dás.",

  "changelog.entries.astrologer-persona.title":
    "Novas personas de astrologia, com a sua própria página celeste",
  "changelog.entries.astrologer-persona.body":
    "A página de mapa mostra as tuas leituras numeradas como casas, o céu de hoje e o que precisas antes de uma leitura.",

  "changelog.entries.crisp-profile-photos.title":
    "As fotos de perfil estão mais nítidas nas páginas de membros",
  "changelog.entries.crisp-profile-photos.body":
    "O retrato grande pede uma resolução à medida do espaço que preenche, por isso aparece nítido.",

  "changelog.entries.developer-persona-banner.title":
    "Os perfis de programador voltam a mostrar banner",
  "changelog.entries.developer-persona-banner.body":
    "As personas de programador, criador e afins escondiam a capa que enviaste; passa a aparecer no topo.",

  "changelog.entries.persona-preview-edit-hidden.title":
    "Pré-visualizar o teu perfil como visitante já esconde os controlos de edição",
  "changelog.entries.persona-preview-edit-hidden.body":
    "O botão Editar desaparece na pré-visualização como visitante, para veres o mesmo que os outros.",

  "changelog.entries.persona-solo-card-wide.title":
    "Um único perfil profissional com capa passa a ocupar o espaço",
  "changelog.entries.persona-solo-card-wide.body":
    "O cartão apresenta-se na horizontal, com a capa ao lado dos detalhes; personas com menos conteúdo ficam compactas.",

  "changelog.entries.persona-performance-row-mobile.title":
    "As listas de atuações dos perfis leem-se bem no telemóvel",
  "changelog.entries.persona-performance-row-mobile.body":
    "Num ecrã estreito, o ano, o título e o local ocupam cada um a sua linha, e os títulos deixam de partir letra a letra.",

  "changelog.entries.endorse-persona-by-owner-name.title":
    "Apoiar um perfil sem nome passa a usar o teu nome",
  "changelog.entries.endorse-persona-by-owner-name.body":
    "Quando uma persona só tem o nome do ofício, a janela de recomendação usa o primeiro nome da pessoa.",

  "changelog.entries.landing-featured-member-card.title":
    "Um cartão de membro em destaque mais rico na página inicial",
  "changelog.entries.landing-featured-member-card.body":
    "Um retrato grande, as palavras da própria pessoa e uma ligação ao perfil, alternando entre todos os destacados.",

  "changelog.entries.session-expiry-csrf-fix.title":
    "Menos expulsões inesperadas por “sessão expirada”",
  "changelog.entries.session-expiry-csrf-fix.body":
    "Uma sessão válida podia ser desligada, sobretudo com vários separadores abertos; agora recupera sozinha.",

  "changelog.entries.persona-image-remove-confirm.title":
    "Uma confirmação rápida antes de remover uma foto da persona",
  "changelog.entries.persona-image-remove-confirm.body":
    "Remover um avatar, capa ou imagem de item pede confirmação primeiro, para um toque acidental no caixote ser seguro.",

  "changelog.entries.persona-craft-pass.title":
    "As personas ficam melhores em todo o lado",
  "changelog.entries.persona-craft-pass.body":
    "O modo escuro fica nítido nas skins e menus, o diretório passa das 40 pessoas e podes pré-visualizar enquanto editas.",

  "changelog.entries.persona-audit-hardening.title":
    "Personas: uma passagem de polimento e segurança",
  "changelog.entries.persona-audit-hardening.body":
    "Retroceder avisa antes de perder alterações, e só quem criou pode renomear, despublicar ou eliminar uma persona partilhada.",

  "changelog.entries.persona-followers-owner-view.title":
    "Vê quem segue a tua persona",
  "changelog.entries.persona-followers-owner-view.body":
    "Abre os seguidores de uma persona tua e vê quem acompanha o teu trabalho; para os outros, seguir mantém-se privado.",

  "changelog.entries.persona-image-reuse-uploads.title":
    "Reutiliza uma foto que já carregaste",
  "changelog.entries.persona-image-reuse-uploads.body":
    "Cada espaço de imagem oferece as fotos já carregadas além de um ficheiro novo, para reutilizares em várias personas.",

  "changelog.entries.persona-banner-quality.title":
    "Banners de persona mais nítidos",
  "changelog.entries.persona-banner-quality.body":
    "Os banners mantêm mais detalhe e uma capa de largura total fica nítida em ecrãs grandes; volta a carregar um banner antigo.",

  "changelog.entries.modal-close-scroll-jump.title":
    "Adeus ao salto da página ao fechar um diálogo",
  "changelog.entries.modal-close-scroll-jump.body":
    "Fechar um diálogo deixa-te exatamente onde estavas, com a tua posição restaurada de imediato.",

  "changelog.entries.persona-gallery-multi-add.title":
    "Adiciona várias fotos à galeria de uma vez",
  "changelog.entries.persona-gallery-multi-add.body":
    "Escolhe várias fotos do dispositivo ou dos carregamentos anteriores e entram todas juntas na galeria, até ao limite de seis.",

  "changelog.entries.persona-gallery-lightbox.title":
    "Toca numa foto da persona para a veres em ecrã inteiro",
  "changelog.entries.persona-gallery-lightbox.body":
    "A foto abre sem cortes, com setas no ecrã e no teclado para passares de uma para outra.",

  "changelog.entries.persona-gig-images.title":
    "Adiciona uma foto aos teus concertos",
  "changelog.entries.persona-gig-images.body":
    "Os concertos e atuações no editor de persona aceitam uma imagem, para o teu destaque ter uma foto a sério.",

  "changelog.entries.persona-save-all-changes.title":
    "Guarda a tua persona de uma vez só",
  "changelog.entries.persona-save-all-changes.body":
    "Uma lista sempre atualizada mostra o que alteraste, e um só Guardar grava tudo.",

  "changelog.entries.persona-page-motion.title":
    "Páginas de persona que se movem contigo",
  "changelog.entries.persona-page-motion.body":
    "Cada secção surge à medida que percorres, com um ritmo próprio para cada visual; o movimento reduzido é respeitado.",

  "changelog.entries.endorse-with-note.title":
    "Endossa uma persona com uma nota",
  "changelog.entries.endorse-with-note.body":
    "Uma janela deixa-te acrescentar uma nota breve sobre o valor do trabalho; toca depois em Endossado para a editar ou retirar.",

  "changelog.entries.persona-banner-bleed.title":
    "Deixa o banner do teu perfil sangrar na página",
  "changelog.entries.persona-banner-bleed.body":
    "A opção Borda do banner, em Presença, mantém a capa contida ou desvanece-a na página; funciona com qualquer visual.",

  "changelog.entries.persona-hero-actions-tidy.title":
    "Uma linha de ações mais arrumada nas páginas de persona",
  "changelog.entries.persona-hero-actions-tidy.body":
    "Mensagem e Seguir lideram a linha, Partilhar e Denunciar ficam num menu extra, e as contagens ficam numa linha discreta.",

  "changelog.entries.fix-member-filter-collapse.title":
    "Filtros mais arrumados no diretório de membros",
  "changelog.entries.fix-member-filter-collapse.body":
    "Um grupo de filtros recolhido mostra apenas o seu título, para o painel se ler como um menu limpo.",

  "changelog.entries.fix-persona-hero-theme-colors.title":
    "O estado e as redes sociais da persona agora acompanham o tema",
  "changelog.entries.fix-persona-hero-theme-colors.body":
    "Nos visuais escuros, como o de palco, o estado e os ícones das redes seguem as cores da tua persona e ficam legíveis.",

  "changelog.entries.persona-photo-gallery.title":
    "Adiciona uma galeria de fotos à tua persona",
  "changelog.entries.persona-photo-gallery.body":
    "A galeria aceita até seis fotos.",

  "changelog.entries.persona-project-links.title":
    "Adiciona links a projetos individuais",
  "changelog.entries.persona-project-links.body":
    "Cada projeto da tua persona pode ter o seu próprio link, como um repositório no GitHub.",

  "changelog.entries.fix-persona-avatar-overlap.title":
    "As fotos das personas já não se sobrepõem ao título",
  "changelog.entries.fix-persona-avatar-overlap.body":
    "Em alguns visuais a foto saía da moldura sobre o nome e os botões; passa a ficar dentro dela, no tamanho certo.",

  "changelog.entries.network-modal-search.title":
    "Procura nas listas da tua rede",
  "changelog.entries.network-modal-search.body":
    "As listas Ligações e Avalizaram-te têm uma caixa de procura, para uma lista longa se filtrar até um nome num instante.",

  "changelog.entries.profile-your-network.title":
    "Vê a tua rede no teu próprio perfil",
  "changelog.entries.profile-your-network.body":
    "Uma linha privada A tua rede mostra as tuas ligações, quem avalizaste e quem te avalizou; toca num atalho para a lista.",

  "changelog.entries.fix-page-top-nav-overlap.title":
    "O conteúdo das páginas já não fica escondido por baixo do menu do topo",
  "changelog.entries.fix-page-top-nav-overlap.body":
    "Todas as páginas reservam espaço para o menu flutuante num único sítio partilhado, e títulos e botões ficam livres dele.",

  "changelog.entries.nav-rail-redesign.title": "Um menu principal mais claro",
  "changelog.entries.nav-rail-redesign.body":
    "Escolhes uma secção na coluna e as suas ligações aparecem ao lado, com uma pequena pré-visualização; menos procura.",

  "changelog.entries.persona-photo-enlarge.title":
    "Toca na foto de uma persona para a ver em tamanho grande",
  "changelog.entries.persona-photo-enlarge.body":
    "O avatar abre em ecrã inteiro como num perfil normal; toca fora, usa o botão de fechar ou carrega em Esc para sair.",

  "changelog.entries.persona-mobile-hero.title":
    "As personas ficam bem no teu telemóvel",
  "changelog.entries.persona-mobile-hero.body":
    "O cabeçalho usa a mesma coluna centrada do teu perfil, com botões de ação de largura total ao alcance do polegar.",

  "changelog.entries.fix-persona-save-conflict.title":
    "Guardar uma segunda persona já não dá erro",
  "changelog.entries.fix-persona-save-conflict.body":
    "Um erro de endereço já em uso aparecia com mais do que uma persona; um identificador em branco passa a contar como nenhum.",

  "changelog.entries.magazine-desk-two-tracks.title":
    "Duas vias na redação da revista: Destaques e Edição",
  "changelog.entries.magazine-desk-two-tracks.body":
    "Os destaques autónomos ficam separados das peças de uma edição; alterna entre vias com um toque e move peças entre elas.",

  "changelog.entries.photo-metadata-strip-hardening.title":
    "Remoção mais forte dos dados de localização escondidos nas tuas fotos",
  "changelog.entries.photo-metadata-strip-hardening.body":
    "Os metadados escondidos saem da foto no teu navegador antes de sair do dispositivo, ou o carregamento é bloqueado.",

  "changelog.entries.fix-persona-cover-overlay-leak.title":
    "As capas dos perfis aparecem limpas depois de as carregares",
  "changelog.entries.fix-persona-cover-overlay-leak.body":
    "Nas personas de música e DJ, a textura do estado vazio continuava a escurecer a capa; desaparece assim que defines uma.",

  "changelog.entries.members-filter-panel-polish.title":
    "Um painel de filtros mais calmo no diretório de membros",
  "changelog.entries.members-filter-panel-polish.body":
    "Os filtros ficam num único painel com separadores discretos, e cada cabeçalho reage ao rato e ao foco do teclado.",

  "changelog.entries.fix-persona-stage-dark-legibility.title":
    "As páginas de persona continuam legíveis no modo escuro",
  "changelog.entries.fix-persona-stage-dark-legibility.body":
    "Os estilos palco e escritor ficavam escuros sobre escuro; ambos se mantêm agora legíveis em qualquer tema.",

  "changelog.entries.fix-persona-preview-avatar.title":
    "As fotos da persona aparecem agora na pré-visualização, e o avatar voltou a ser redondo",
  "changelog.entries.fix-persona-preview-avatar.body":
    "Um avatar ou capa acabados de escolher aparecem logo na pré-visualização do editor, sem um quadrado indevido em volta.",

  "changelog.entries.fix-vouch-success-self-face.title":
    "A confirmação do teu voto mostra agora a tua cara",
  "changelog.entries.fix-vouch-success-self-face.body":
    "A confirmação podia mostrar um perfil de demonstração em vez do teu; passa a mostrar sempre o teu avatar e iniciais.",

  "changelog.entries.persona-readiness-estimate.title":
    "A estimativa de prontidão da persona reflete agora o que falta mesmo",
  "changelog.entries.persona-readiness-estimate.body":
    "A Estimativa rápida conta tudo o que ainda vale a pena acrescentar, como uma capa ou um link social, e só enche no fim.",

  "changelog.entries.fix-persona-item-drawer-scroll.title":
    "Percorre todos os campos ao editar um item da montra",
  "changelog.entries.fix-persona-item-drawer-scroll.body":
    "O painel de edição de um concerto ou projeto fica dentro do ecrã no telemóvel, e chegas a todos os campos e ao Guardar.",

  "changelog.entries.my-uploads.title":
    "Vê e faz a gestão de tudo o que enviaste",
  "changelog.entries.my-uploads.body":
    "As minhas imagens, nas Definições, lista todas as imagens carregadas, avisa quais estão em uso e deixa apagar duplicados.",

  "changelog.entries.profile-photo-picker.title":
    "Reutiliza uma foto que já carregaste",
  "changelog.entries.profile-photo-picker.body":
    "O seletor define a tua foto de perfil a partir de carregamentos anteriores, do dispositivo ou da Google, e arruma os antigos.",

  "changelog.entries.fix-persona-image-persistence.title":
    "As fotos carregadas mantêm-se depois de editar",
  "changelog.entries.fix-persona-image-persistence.body":
    "Guardar deixa em paz uma imagem em que não mexeste, e as fotos de personas, perfil, trabalho e negócios ficam onde estão.",

  "changelog.entries.dark-ghost-button-contrast.title":
    "Os botões delineados ficam legíveis no modo escuro",
  "changelog.entries.dark-ghost-button-contrast.body":
    "Botões delineados como o Partilhar ficavam quase invisíveis em fundos escuros; contorno e texto cumprem agora o contraste.",

  "changelog.entries.admin-media-delete-and-preview-fix.title":
    "As administradoras podem eliminar ficheiros guardados, e as pré-visualizações grandes já não escondem os controlos",
  "changelog.entries.admin-media-delete-and-preview-fix.body":
    "As pré-visualizações altas têm limite de altura, e um ficheiro pode ser eliminado do seu painel de detalhes.",

  "changelog.entries.persona-editor-live-preview.title":
    "A pré-visualização do editor de persona atualiza-se enquanto escreves",
  "changelog.entries.persona-editor-live-preview.body":
    "Nome, frase, bio, avatar, capa, acento e chamada para ação atualizam-se na pré-visualização antes de guardares.",

  "changelog.entries.fix-uploaded-avatar-not-showing.title":
    "As fotografias de perfil carregadas passam a aparecer depois de guardar",
  "changelog.entries.fix-uploaded-avatar-not-showing.body":
    "Uma foto de perfil guardada podia voltar como imagem partida ao recarregar; o teu retrato aparece agora em todo o lado.",

  "changelog.entries.fix-image-preview-csp.title":
    "A pré-visualização da imagem volta a aparecer ao carregar",
  "changelog.entries.fix-image-preview-csp.body":
    "Uma política de segurança bloqueava a pré-visualização local de uma foto acabada de escolher; agora aparece logo.",

  "changelog.entries.use-google-profile-photo.title":
    "Usa a tua fotografia da Google no teu perfil",
  "changelog.entries.use-google-profile-photo.body":
    "Se entraste com a Google e ainda não tens foto, o editor de perfil oferece um botão Usar foto da Google, com um toque.",

  "changelog.entries.skip-link-keyboard-only.title":
    "O atalho “Saltar para o conteúdo” deixou de aparecer sem razão",
  "changelog.entries.skip-link-keyboard-only.body":
    "O atalho aparecia por vezes durante a navegação normal; agora surge apenas quando chegas a ele com a tecla Tab.",

  "changelog.entries.enlarge-profile-photo.title":
    "Toca na foto de perfil para a ver de perto",
  "changelog.entries.enlarge-profile-photo.body":
    "A versão completa abre em grande para veres quem é antes de contactares; toca em qualquer sítio ou carrega em Escape.",

  "changelog.entries.tap-notification-to-profile.title":
    "Toca numa notificação para abrir o perfil",
  "changelog.entries.tap-notification-to-profile.body":
    "Quando alguém aceita o teu convite ou ligação, toda a notificação abre o perfil; as mais específicas abrem onde apontam.",

  "changelog.entries.more-push-notifications.title":
    "Mais do que te importa chega agora como notificação push",
  "changelog.entries.more-push-notifications.body":
    "O push cobre pedidos de ligação, menções, respostas nas tuas conversas, avais e alterações a um evento a que vais.",

  "changelog.entries.localized-push-notifications.title":
    "Notificações push no teu idioma",
  "changelog.entries.localized-push-notifications.body":
    "Com a app em português, as notificações push do sistema, como o lembrete de um evento, chegam em português.",

  "changelog.entries.magazine-desk-workspace-nav.title":
    "Um espaço próprio para a redação da revista",
  "changelog.entries.magazine-desk-workspace-nav.body":
    "Cada ecrã de edição tem navegação à esquerda com Redação, Propostas e Edição, mais o salto rápido (Cmd+K) e Desde sexta.",
  "changelog.entries.richer-push-notifications.title":
    "Notificações push que mostram quem e o quê",
  "changelog.entries.richer-push-notifications.body":
    "Uma mensagem mostra de quem é, com a foto, um lembrete mostra a capa do evento, e as mensagens agrupam-se por conversa.",

  "changelog.entries.admin-uploaded-images.tag": "Abrir admin",
  "changelog.entries.admin-uploaded-images.title":
    "As administradoras podem ver todas as imagens enviadas",
  "changelog.entries.admin-uploaded-images.body":
    "Cada ficheiro mostra o dono, os metadados de armazenamento e a verificação do tipo real de conteúdo, para revisão.",

  "changelog.entries.events-and-my-events-merged.title":
    "Os eventos e Os meus eventos são agora uma só página",
  "changelog.entries.events-and-my-events-merged.body":
    "Vivem juntos em /events com um interruptor Os meus eventos / Descobrir; abre no teu painel quando tens eventos marcados.",

  "changelog.entries.trust-network-legend-withdrawn.title":
    "A legenda da rede de confiança já explica as linhas tracejadas",
  "changelog.entries.trust-network-legend-withdrawn.body":
    "A legenda nomeia a linha tracejada vermelha como «Aval retirado», para reconheceres um aval retirado num relance.",

  "changelog.entries.trust-network-replay-timeline.title":
    "A repetição da Rede de Confiança conta a história pessoa a pessoa",
  "changelog.entries.trust-network-replay-timeline.body":
    "A repetição percorre uma ligação de cada vez, por ordem real, diz quem se ligou e quando, e acende a linha na lista lateral.",

  "changelog.entries.pronouns-on-member-cards.title":
    "Cartões de novos membros mais completos no feed",
  "changelog.entries.pronouns-on-member-cards.body":
    "Pronomes ao lado do nome, onde a pessoa vive e os seus interesses; a localização fica oculta em perfis privados.",

  "changelog.entries.onboarding-join-and-leave.title":
    "Junta-te (e sai) de comunidades durante o registo",
  "changelog.entries.onboarding-join-and-leave.body":
    "Toca outra vez numa comunidade a que te juntaste para sair; as sugestões só incluem comunidades totalmente abertas.",

  "changelog.entries.saved-and-searched-lists-load.title":
    "Os eventos guardados e as listas pesquisadas voltam a carregar em vez de dar erro",
  "changelog.entries.saved-and-searched-lists-load.body":
    "Separador Guardados, pesquisa de mensagens, filtro da revista por autor e pesquisa na fila de moderação voltam a funcionar.",

  "changelog.entries.admin-overview-stat-grid-responsive.title":
    "Os cartões de estatísticas do painel de administração ajustam-se ao ecrã no telemóvel",
  "changelog.entries.admin-overview-stat-grid-responsive.body":
    "Os quatro cartões de destaque reduzem-se para dois e depois um à medida que o ecrã estreita, e cada um fica legível.",

  "changelog.entries.trust-network-mobile-graph-first.title":
    "A Rede de Confiança abre no grafo no telemóvel",
  "changelog.entries.trust-network-mobile-graph-first.body":
    "Toca em alguém no grafo de ligações para deslizar os detalhes dos avais, e desliza para fora para voltares à vista completa.",

  "changelog.entries.magazine-article-versions.title":
    "Os rascunhos de artigos passam a guardar um histórico completo de versões",
  "changelog.entries.magazine-article-versions.body":
    "Cada rascunho entregue e gravação manual guarda uma versão; a equipa editorial compara com o atual e restaura qualquer uma.",

  "changelog.entries.magazine-article-comments.title":
    "Notas encadeadas nos rascunhos de artigos",
  "changelog.entries.magazine-article-comments.body":
    "A equipa editorial deixa notas num artigo, responde entre si e resolve uma nota depois de tratada.",

  "changelog.entries.magazine-desk-live-notifications.title":
    "O painel de atividade da mesa editorial passa a mostrar eventos reais",
  "changelog.entries.magazine-desk-live-notifications.body":
    "Cada entrada diz quem fez o quê e quando, com ligação direta à peça.",

  "changelog.entries.magazine-desk-wave-b-fixes.title":
    "Pesquisa no arquivo, resumos do índice e valores de cancelamento, agora reais",
  "changelog.entries.magazine-desk-wave-b-fixes.body":
    "A pesquisa no arquivo encontra peças publicadas, os resumos guardam-se, e quem colabora vê o valor real de cancelamento.",

  "changelog.entries.magazine-commission-editor-fix.title":
    "Encomendar um artigo funciona numa revista nova",
  "changelog.entries.magazine-commission-editor-fix.body":
    "Encomendar numa revista nova falhava com um erro de editorId; as encomendas levam agora a tua identidade de editor.",

  "changelog.entries.magazine-issue-production.title": "Produção da edição",
  "changelog.entries.magazine-issue-production.body":
    "Define alinhamento, capa e chamadas, escolhe o resumo e os cartões sociais, e publica tudo com uma lista de verificação.",

  "changelog.entries.events-page-utility-redesign.title":
    "Uma página de eventos mais limpa e rápida",
  "changelog.entries.events-page-utility-redesign.body":
    "O cabeçalho junta o interruptor Os meus eventos / Descobrir e um sítio para organizar, um destaque «A seguir» e procura.",

  "changelog.entries.magazine-writer-workspace.title":
    "O espaço de quem escreve",
  "changelog.entries.magazine-writer-workspace.body":
    "Quem escreve tem um só lugar para atribuições, propostas e pagamentos, onde escolhe a assinatura e entrega os textos.",

  "changelog.entries.persona-discovery-nudges.title":
    "Personas, mais fáceis de descobrir",
  "changelog.entries.persona-discovery-nudges.body":
    "Sugestões discretas para criares uma persona aparecem no teu perfil, no fim do diretório e no registo; podes dispensá-las.",

  "changelog.entries.magazine-deck-editor-redesign.title":
    "O editor de decks de slides, redesenhado",
  "changelog.entries.magazine-deck-editor-redesign.body":
    "Combina agora com a redação, com pré-visualização ao vivo, limites de caracteres por slide e lista de verificação.",

  "changelog.entries.magazine-desk-redesign.title":
    "A redação da revista, redesenhada",
  "changelog.entries.magazine-desk-redesign.body":
    "Um painel ao vivo com vistas de fluxo, quadro e plano da edição, caixa de propostas, vistas guardadas, Cmd+K e atalhos.",

  "changelog.entries.persona-directory-redesign.title":
    "O diretório de personas, redesenhado",
  "changelog.entries.persona-directory-redesign.body":
    "As personas ficam em seis famílias de ofício, do Palco à Mesa, e os cartões mostram tags e número de seguidores.",

  "changelog.entries.persona-editor-redesign.title":
    "Um editor redesenhado para as tuas personas",
  "changelog.entries.persona-editor-redesign.body":
    "Uma barra de secções à esquerda, pré-visualização ao lado das edições e campos mais completos para concertos e projetos.",

  "changelog.entries.magazine-article-editor.title":
    "O editor de artigos por blocos, no ar",
  "changelog.entries.magazine-article-editor.body":
    "Escreve em parágrafos, títulos, citações, imagens, perguntas e respostas e estatísticas, com menu de barra e ênfase em linha.",

  "changelog.entries.magazine-piece-record.title":
    "O registo completo da peça, aberto",
  "changelog.entries.magazine-piece-record.body":
    "Encomenda, cuidado e consentimento, dinheiro, histórico e cartas; publicar espera pelo consentimento e pela leitura sensível.",

  "changelog.entries.persona-dashboard-redesign.title":
    "As tuas personas, num painel redesenhado",
  "changelog.entries.persona-dashboard-redesign.body":
    "Cada cartão mostra anel de progresso ou selo de estado, disponibilidade e coproprietários; criar uma nova leva dois passos.",

  "changelog.entries.persona-pages-redesigned.title":
    "Páginas de persona, redesenhadas para cada ofício",
  "changelog.entries.persona-pages-redesigned.body":
    "Faixa de palco com dados de contratação, parede de estúdio com caixa de luz, folha de oficina ou cartão de menu.",

  "changelog.entries.persona-page-unavailable-reasons.title":
    'As páginas de persona já dizem porquê, não só "não encontrada"',
  "changelog.entries.persona-page-unavailable-reasons.body":
    "Diz se é privada, só para membros ou retirada; a tua página ainda não publicada mostra uma pré-visualização com o que falta.",

  "changelog.entries.meet-the-table.title": "Vê quem está à mesa",
  "changelog.entries.meet-the-table.body":
    "Os jantares de grupo mostram a mesa de cima, com quem recebe, quem vem e lugares livres; toca em alguém para saber mais.",

  "changelog.entries.settings-mobile-nav-strips.title":
    "Definições e edição de perfil mais fáceis no telemóvel",
  "changelog.entries.settings-mobile-nav-strips.body":
    "Uma faixa compacta de separadores fica fixa no topo das Definições e da edição de perfil, para saltares direto a uma secção.",

  "changelog.entries.places-card-mobile-foot.title":
    "Cartões “Espaços que geres” mais arrumados no telemóvel",
  "changelog.entries.places-card-mobile-foot.body":
    "No telemóvel, o número de referência fica numa linha própria, por cima de uma linha com Editar, Eliminar e Ver anúncio.",

  "changelog.entries.vouch-for-a-safe-space.title":
    "Deixa o teu testemunho por um espaço seguro",
  "changelog.entries.vouch-for-a-safe-space.body":
    "Junta o teu testemunho à página de espaço seguro de um sítio, com nota opcional e como conheces o lugar, ou de forma anónima.",

  "changelog.entries.my-events-change-list-live.title":
    "Vê o que mudou nos Meus Eventos",
  "changelog.entries.my-events-change-list-live.body":
    "O sino abre as atualizações aos eventos a que respondeste ou para que foste convidade, cada uma marcada como não lida.",

  "changelog.entries.applications-inside-work-hub.title":
    "As Candidaturas passaram para o teu Trabalho",
  "changelog.entries.applications-inside-work-hub.body":
    "Ficam no topo do Trabalho, ao lado da mentoria e das competências; abre o Trabalho no menu de perfil para as encontrares.",

  "changelog.entries.invite-only-community-tier.title":
    "Comunidades só por convite voltam a ser restritas",
  "changelog.entries.invite-only-community-tier.body":
    "Os cartões do diretório, a página da comunidade e a folha de adesão mostram a política de adesão real e pedem um convite.",

  "changelog.entries.navbar-wordmark-no-wrap.title":
    "O logótipo da QueerPulse deixa de se empilhar",
  "changelog.entries.navbar-wordmark-no-wrap.body":
    "O nome na barra de topo mantém-se numa única linha em qualquer largura de ecrã.",

  "changelog.entries.mobile-edit-profile-refresh.title":
    "Editar o perfil combina com o novo visual",
  "changelog.entries.mobile-edit-profile-refresh.body":
    "No telemóvel usa o mesmo layout centrado, com foto redonda em cima, campos arrumados e Estado e Visibilidade numa só linha.",

  "changelog.entries.mobile-profile-header-refresh.title":
    "Um perfil mais limpo no telemóvel",
  "changelog.entries.mobile-profile-header-refresh.body":
    "Foto e nome ao centro, uma linha de estatísticas mais folgada e botões mais arrumados para dizer olá e avalizar.",

  "changelog.entries.profile-edit-save-bar-mobile.title":
    "Guardar o teu perfil no telemóvel passa a funcionar",
  "changelog.entries.profile-edit-save-bar-mobile.body":
    "Guardar e Descartar ficam acima da barra de navegação inferior e dividem toda a largura em ecrãs estreitos.",

  "changelog.entries.follow-topics-you-care-about.title":
    "Segue os temas que te interessam",
  "changelog.entries.follow-topics-you-care-about.body":
    "Toca em Seguir em qualquer tema; os teus seguimentos ficam guardados na tua conta e acompanham-te em todos os dispositivos.",

  "changelog.entries.event-change-alerts.title":
    "Fica a saber quando um evento muda",
  "changelog.entries.event-change-alerts.body":
    "Recebes uma notificação quando um evento a que confirmaste presença ou para o qual foste convidade muda de hora ou local.",

  "changelog.entries.forms-that-really-submit.title":
    "Os formulários da aplicação passam a enviar mesmo",
  // Ver a nota em en/marketing.ts: corpo corrigido a 26 de agosto de 2026.
  "changelog.entries.forms-that-really-submit.body":
    "Newsletter, contactos, candidaturas a bolsas e painéis e nomeações de espaços seguros guardam o que escreves para a equipa.",

  "changelog.entries.save-events-for-later.title":
    "Guarda convívios para mais tarde",
  "changelog.entries.save-events-for-later.body":
    "Toca em Guardar em qualquer convívio; tudo o que guardas aparece no separador Guardados em Os Meus Eventos.",

  "changelog.entries.collections-are-here.title":
    "Agrupa o que guardas em coleções",
  "changelog.entries.collections-are-here.body":
    "Reúne pessoas, lugares e publicações guardadas em coleções com nome, como uma lista de leitura ou uma seleção de espaços.",

  "changelog.entries.your-mentions-in-one-place.title":
    "Todas as menções, num só sítio",
  "changelog.entries.your-mentions-in-one-place.body":
    "Uma menção com @ num tópico do fórum ou numa publicação de comunidade chega à tua caixa de Menções para pores tudo em dia.",

  "changelog.entries.new-moderation-tools.title":
    "Mais ferramentas para a equipa de moderação",
  "changelog.entries.new-moderation-tools.body":
    "Verificar ou restringir um membro, gerir moderadores, decidir propostas de grupos de leitura e publicar registos.",

  "changelog.entries.reports-reach-the-team.title":
    "As denúncias chegam agora à equipa de moderação",
  "changelog.entries.reports-reach-the-team.body":
    "A denúncia de uma publicação chega à moderação, um envio falhado permite tentar de novo, e podes denunciar uma resposta.",

  "changelog.entries.chat-recovers-after-reconnect.title":
    "O chat recupera quando voltas a ter ligação",
  "changelog.entries.chat-recovers-after-reconnect.body":
    "Uma mensagem que falha offline envia-se sozinha ao reconectares; uma faixa indica se estás offline ou a reconectar.",

  "changelog.entries.honest-live-states.title": "O que vês é real",
  "changelog.entries.honest-live-states.body":
    "Recortes de imprensa, vozes e inventário de exemplo desapareceram, e os controlos ainda em construção estão assinalados.",

  "changelog.entries.community-activity-in-your-feed.title":
    "O teu feed mostra agora o que se passa nas tuas comunidades",
  "changelog.entries.community-activity-in-your-feed.body":
    "Publicações, anúncios, convívios, tópicos e quem se juntou chegam ao feed; partilha um convívio ou tópico numa comunidade.",

  "changelog.entries.assignable-staff-roles.title":
    "A administração já pode atribuir funções da equipa da revista",
  "changelog.entries.assignable-staff-roles.body":
    "No diretório de membros atribui-se Editor ou Redator da revista, e o desk editorial segue a função de Editor.",
  "changelog.entries.assignable-staff-roles.tag":
    "Abrir o diretório de membros",

  "changelog.entries.feed-scroll-no-longer-sticks.title":
    "O teu feed volta a rolar sem prender",
  "changelog.entries.feed-scroll-no-longer-sticks.body":
    "Rolar com o rato ou trackpad sobre o feed, notificações, membros e convívios podia prender; agora rola como deve ser.",

  "changelog.entries.fresh-feed-card-layout.title":
    "Um visual renovado para o teu feed",
  "changelog.entries.fresh-feed-card-layout.body":
    "Todos os cartões partilham um layout mais limpo e ficam dois por linha em ecrãs largos, para percorreres mais de relance.",

  "changelog.entries.feature-communities-cta-jump.title":
    "“Escolher comunidades” leva-te agora diretamente ao seletor",
  "changelog.entries.feature-communities-cta-jump.body":
    "O botão do bloco Comunidades abre o Editar perfil já posicionado no seletor de comunidades.",
  "changelog.entries.feature-communities-cta-jump.tag": "Escolher comunidades",

  "changelog.entries.live-homepage-curated-sections.title":
    "A página inicial mostra agora pessoas e comunidades reais, com curadoria da equipa",
  "changelog.entries.live-homepage-curated-sections.body":
    "As secções de pessoas, comunidades e agentes de mudança mostram as escolhas da equipa e escondem-se até ter algo escolhido.",

  "changelog.entries.featured-homepage-consent-toggle.title":
    "Consente ser destacade na página inicial",
  "changelog.entries.featured-homepage-consent-toggle.body":
    'Um interruptor nas definições de privacidade deixa a administração destacar-te; vem desligado e exige "Aberto a ligações".',
  "changelog.entries.featured-homepage-consent-toggle.tag":
    "Abrir as tuas definições de privacidade",

  "changelog.entries.mobile-profile-top-breathing-room.title":
    "Um topo mais calmo nos perfis no telemóvel",
  "changelog.entries.mobile-profile-top-breathing-room.body":
    "O avatar e os detalhes ficam à vontade sob o cabeçalho, e o nome “Queer Pulse” saiu da faixa superior nas páginas internas.",

  "changelog.entries.accessible-names-screen-readers.title":
    "Os leitores de ecrã passam a nomear todos os controlos",
  "changelog.entries.accessible-names-screen-readers.body":
    "Os botões e interruptores só com ícone anunciam um nome claro, e uma verificação automática mantém isso assim.",

  "changelog.entries.icons-not-text-symbols.title":
    "Ícones mais nítidos em vez de símbolos de texto",
  "changelog.entries.icons-not-text-symbols.body":
    "Setas, cursores de menus, pegas de arrastar e marcas de relógio são ícones próprios, nítidos e lidos pelos leitores de ecrã.",

  "changelog.entries.message-alerts-out-of-notifications.title":
    "Os avisos de novas mensagens saíram do centro de notificações",
  "changelog.entries.message-alerts-out-of-notifications.body":
    'As mensagens diretas contam no ícone de mensagens, e as linhas de "Tens uma nova mensagem" saem do separador de Notificações.',

  "changelog.entries.shared-ui-consistency.title":
    "Janelas e formulários mais suaves e consistentes",
  "changelog.entries.shared-ui-consistency.body":
    "Cada janela mantém o foco do teclado, fecha com Escape pela ordem certa e devolve-te ao ponto onde estavas.",

  "changelog.entries.balanced-feed-grid.title":
    "Um feed inicial mais equilibrado",
  "changelog.entries.balanced-feed-grid.body":
    "Os cartões leves, como novos membros, ficam dois ou mais por linha numa grelha, e as publicações mantêm a largura toda.",

  "changelog.entries.moderation-outcome-notifications.title":
    "Passas a saber o resultado de uma decisão de moderação",
  "changelog.entries.moderation-outcome-notifications.body":
    "Um aviso, suspensão ou encerramento de conta envia ao membro uma notificação com o motivo e uma ligação para recorrer.",

  "changelog.entries.community-page-polish.title":
    "Uma página de comunidade mais acolhedora",
  "changelog.entries.community-page-polish.body":
    "Podes partilhá-la, sair pede confirmação, Eventos mostra todos os próximos convívios, e mudar de separador atualiza o link.",

  "changelog.entries.job-application-status.title":
    "Vê em que ponto estão as tuas candidaturas",
  "changelog.entries.job-application-status.body":
    "O acompanhamento lista a que te candidataste, quando e em que ponto está cada uma; abre um cartão para rever as respostas.",

  "changelog.entries.data-request-history.title":
    "O teu histórico de pedidos de dados, num só sítio",
  "changelog.entries.data-request-history.body":
    "A página de privacidade lista os teus pedidos anteriores com a referência e o estado atual, para acompanhares um deles.",

  "changelog.entries.community-settings-controls.title":
    "Guarda, arquiva ou transfere a tua comunidade",
  "changelog.entries.community-settings-controls.body":
    "Nome, descrição e regras da casa guardam mesmo no painel de moderação; também podes arquivar ou transferir a propriedade.",

  "changelog.entries.feed-keeps-loading.title":
    "O feed continua a carregar à medida que percorres",
  "changelog.entries.feed-keeps-loading.body":
    "Parava na primeira página; agora carrega mais ao chegares ao fim, com um botão “Carregar mais” acessível por teclado.",

  "changelog.entries.faster-first-load.title":
    "Um primeiro carregamento mais rápido",
  "changelog.entries.faster-first-load.body":
    "Os textos da interface carregam por ecrã, conforme é preciso, e a app abre mais depressa no telemóvel ou numa ligação lenta.",

  "changelog.entries.readable-text-contrast.title":
    "Texto mais fácil de ler em toda a aplicação",
  "changelog.entries.readable-text-contrast.body":
    "Legendas, dicas e etiquetas nas coleções, no seletor de GIFs e nos cartões de perfil cumprem o contraste acessível.",

  "changelog.entries.ios-splash-screens.title":
    "Um ecrã de arranque cuidado no iPhone",
  "changelog.entries.ios-splash-screens.body":
    "A app no ecrã principal mostra a marca enquanto arranca, e as notificações no Android ganham um emblema mais limpo.",

  "changelog.entries.removed-content-stays-hidden.title":
    "O conteúdo removido fica escondido em todo o lado",
  "changelog.entries.removed-content-stays-hidden.body":
    "As remoções desaparecem de mensagens diretas, anúncios de negócios e habitação e personas, e deixam de contar como não lidas.",
  "changelog.entries.removed-content-stays-hidden.details":
    "O conteúdo removido pela moderação desaparece agora de todos os sítios onde poderia aparecer, incluindo mensagens diretas, anúncios de negócios e de habitação, e personas. As mensagens removidas deixam de contar nos emblemas de não lidas.",

  "changelog.entries.help-demo-example-live-hidden.title":
    "Os painéis de ajuda deixam de mostrar exemplos da demo no modo real",
  "changelog.entries.help-demo-example-live-hidden.body":
    "O exemplo “Na demo” no fim da ajuda “Sobre este ecrã” só aparece enquanto estás a explorar a demo.",

  "changelog.entries.smaller-help-icon.title":
    "Um ícone de ajuda “Sobre este ecrã” mais pequeno",
  "changelog.entries.smaller-help-icon.body":
    "O ícone ao lado do título crescia com o título; agora tem um tamanho discreto e igual em todos os ecrãs.",

  "changelog.entries.community-rules-and-tags-polish.title":
    "Regras da casa e etiquetas mais claras nos detalhes da comunidade",
  "changelog.entries.community-rules-and-tags-polish.body":
    "As regras da casa mostram o texto certo no lugar de um código interno, e as etiquetas em Sobre ficam legíveis no modo escuro.",

  "changelog.entries.co-owned-subprofiles.title":
    "Partilha a responsabilidade por uma persona",
  "changelog.entries.co-owned-subprofiles.body":
    "Convida outro membro para gerir um subperfil contigo; quando aceitar, ambos o gerem e aparece nos dois perfis.",

  "changelog.entries.smoother-mobile-navigation.title":
    "Uma forma mais suave de navegar no telemóvel",
  "changelog.entries.smoother-mobile-navigation.body":
    "A barra de separadores fica contigo no browser, cada separador guarda onde ficaste, e tocar no atual leva-te ao topo.",

  "changelog.entries.no-sideways-scroll-on-mobile.title":
    "As páginas voltam a deslizar de cima para baixo no telemóvel",
  "changelog.entries.no-sideways-scroll-on-mobile.body":
    "Links, nomes de utilizador e palavras compridas passam para a linha seguinte, e a página fica à largura do ecrã.",

  "changelog.entries.no-placeholder-people-in-live.title":
    "O modo ao vivo agora mostra apenas pessoas reais",
  "changelog.entries.no-placeholder-people-in-live.body":
    'Diretório de bem-estar, candidaturas e assinaturas da revista mostram conteúdo real ou uma nota de "ainda em construção".',

  "changelog.entries.honest-roadmap-promises.title":
    "O roteiro agora cumpre promessas, e diz que não, com sinceridade",
  "changelog.entries.honest-roadmap-promises.body":
    'Se a data de um item Assumido mudar, vês o motivo, e a lista "Não vamos construir isto, e porquê" cobre os pedidos recusados.',

  "changelog.entries.invite-resend-and-qr.title":
    "Reenvia um convite que expirou, e partilha-o com um código QR",
  "changelog.entries.invite-resend-and-qr.body":
    '"Enviar de novo" num convite expirado faz o mesmo link durar outra semana, e cada convite inclui um código QR.',
  "changelog.entries.invite-resend-and-qr.tag": "Convidar alguém",

  "changelog.entries.smoother-onboarding-first-minutes.title":
    "Um acolhimento mais suave nos teus primeiros minutos",
  "changelog.entries.smoother-onboarding-first-minutes.body":
    'Se saíres a meio da preparação, retomas onde ficaste; as etiquetas de "aqui para" aparecem no teu perfil desde o início.',

  "changelog.entries.events-open-at-top.title": "Eventos abre no topo",
  "changelog.entries.events-open-at-top.body":
    "Qualquer separador começa no topo da página, e o botão Voltar do navegador continua a levar-te para onde estavas.",
  "changelog.entries.events-open-at-top.tag": "Ver eventos",

  "changelog.entries.chat-header-tap-to-profile.title":
    "Um cabeçalho de conversa mais tranquilo",
  "changelog.entries.chat-header-tap-to-profile.body":
    "Toca no nome ou na foto no topo para abrir o perfil; os controlos de informação e mensagens marcadas ficam juntos no canto.",
  "changelog.entries.chat-header-tap-to-profile.tag": "Abrir mensagens",

  "changelog.entries.sheet-close-scroll-jump-fix.title":
    "Sem mais saltos de volta ao topo",
  "changelog.entries.sheet-close-scroll-jump-fix.body":
    "Fechar a folha da tua conta a meio de uma página fazia-a saltar para o topo; agora fica exatamente onde a deixaste.",

  "changelog.entries.mobile-account-you-tab.title":
    "A tua conta, a um toque no telemóvel",
  "changelog.entries.mobile-account-you-tab.body":
    "A tua foto na barra inferior abre uma folha com perfil, ligações, lugares guardados, candidaturas e definições.",

  "changelog.entries.instagram-style-mobile-profile.title":
    "O teu perfil, redesenhado para o telemóvel",
  "changelog.entries.instagram-style-mobile-profile.body":
    "Avatar compacto, uma linha de avais, comunidades e personas, uma faixa de destaques e secções por separadores que deslizas.",

  "changelog.entries.forum-upvotes-tags-search.title":
    "O fórum cresceu: votos, etiquetas, pesquisa e tópicos que se podem fechar",
  "changelog.entries.forum-upvotes-tags-search.body":
    "Vota em tópicos e respostas, ordena por Ativos ou Sem resposta, usa etiquetas como #habitação, e a moderação fecha tópicos.",
  "changelog.entries.forum-upvotes-tags-search.tag": "Abrir o fórum",
  "changelog.entries.list-business-wizard-overhaul.title":
    "Adicionar o teu espaço ao diretório ficou bem mais fácil",
  "changelog.entries.list-business-wizard-overhaul.body":
    "Recomendar um sítio pede só o nome, onde fica e uma frase sobre o porquê; escreve a morada ou coloca um pino no mapa.",
  "changelog.entries.list-business-wizard-overhaul.tag": "Listar o teu espaço",
  "changelog.entries.mobile-experience-pass.title":
    "Toda a app, à medida do teu polegar",
  "changelog.entries.mobile-experience-pass.body":
    "Botões, etiquetas e interruptores maiores, e menus, filtros e diálogos sobem do fundo como painéis que afastas com um gesto.",

  "changelog.entries.magazine-deck-authoring.title":
    "As pessoas editoras já podem criar os seus próprios decks interativos",
  "changelog.entries.magazine-deck-authoring.body":
    "Cinco modelos de slide, assinatura e metadados, pré-visualização, rascunhos e publicação com a etiqueta “Interativo”.",
  "changelog.entries.magazine-deck-authoring.details":
    "As pessoas editoras podem agora criar decks interativos no painel: cinco modelos de slide, assinatura e metadados, pré-visualização como quem lê, rascunhos guardados, e publicação com a etiqueta “Interativo” na primeira página da revista.",

  "changelog.entries.listings-moderation-console.title":
    "A fila de listagens ganhou uma consola de moderação a sério",
  "changelog.entries.listings-moderation-console.body":
    "Paginação, pesquisa por nome, autor ou referência, ordenação, contagem por estado e ações em várias submissões de uma vez.",

  "changelog.entries.magazine-slide-decks.title":
    "Histórias em slide-deck interativo, já na revista",
  "changelog.entries.magazine-slide-decks.body":
    "Histórias com a etiqueta Interativo leem-se em slides de ecrã inteiro: texto, fotos, números animados e antes-e-depois.",

  "changelog.entries.real-notification-settings.title":
    "Definições de notificações que finalmente fazem alguma coisa",
  "changelog.entries.real-notification-settings.body":
    "Liga ou desliga cada tipo de aviso, push do telemóvel incluído; as mensagens de segurança e de conta chegam sempre.",
  "changelog.entries.platform-wide-search.title":
    "A pesquisa passa a abranger toda a plataforma",
  "changelog.entries.platform-wide-search.body":
    "Os resultados juntam artigos da revista, empregos, habitação, recursos, workshops e subperfis, em inglês e em português.",
  "changelog.entries.platform-wide-search.details":
    "A pesquisa global abrange agora artigos da revista, empregos, anúncios de habitação, recursos, workshops e subperfis, a par de membros, comunidades, eventos, tópicos do fórum e negócios, em inglês e em português.",
  "changelog.entries.save-events-communities.title":
    "Guarda eventos e comunidades, e guardados que ficam mesmo guardados",
  "changelog.entries.save-events-communities.body":
    "O mesmo marcador guarda um convívio ou uma comunidade na tua coleção, e guardar empregos e curtas-metragens fica guardado.",
  "changelog.entries.invite-revoke-oversight.title":
    "Recupera um convite que enviaste",
  "changelog.entries.invite-revoke-oversight.body":
    "Revoga um convite pendente na lista de enviados e a ligação deixa de funcionar; admins têm uma vista de Convites por estado.",
  "changelog.entries.moderation-completeness.title":
    "Um conjunto de ferramentas de moderação mais completo",
  "changelog.entries.moderation-completeness.body":
    "Os moderadores podem remover um perfil ou uma avaliação, que deixa de contar para a classificação, e levantar uma suspensão.",
  "changelog.entries.account-media-safety.title":
    "Nomes de utilizador mais seguros, armazenamento mais limpo",
  "changelog.entries.account-media-safety.body":
    "O nome antigo fica reservado 30 dias, as fotos substituídas são apagadas, e as imagens de um suspenso deixam de aparecer.",
  "changelog.entries.legal-notice-imprint.title":
    "Uma página de aviso legal (imprint)",
  "changelog.entries.legal-notice-imprint.body":
    "Está em Políticas, ligada a partir do rodapé, e indica quem opera a QueerPulse e como nos contactar.",
  "changelog.entries.messages-list-virtualization.title":
    "As conversas longas agora deslizam de forma suave, por maiores que fiquem",
  "changelog.entries.messages-list-virtualization.body":
    "Só as mensagens perto do que vês são desenhadas, por isso uma conversa com milhares delas desliza tão leve como uma nova.",
  "changelog.entries.live-mode-honesty-sweep.title":
    "Sem pessoas de exemplo, confirmações falsas ou botões sem saída",
  "changelog.entries.live-mode-honesty-sweep.body":
    "Páginas em protótipo dizem em breve em vez de gente inventada, formulários sem destino avisam, e os cookies ficam guardados.",
  "changelog.entries.frontend-reliability-hardening.title":
    "Menos rascunhos perdidos, estados de erro honestos e dispositivos partilhados mais seguros",
  "changelog.entries.frontend-reliability-hardening.body":
    "Sair de uma edição a meio avisa-te, os erros deixam-te tentar de novo, e guardados e rascunhos limpam-se ao terminar sessão.",
  "changelog.entries.screen-help-signs.title":
    "Ajuda “Sobre este ecrã” em cada funcionalidade",
  "changelog.entries.screen-help-signs.body":
    "Um pequeno botão de informação ao lado do título abre um cartão curto sobre para que serve o ecrã e como o usar.",
  "changelog.entries.performance-cost-hardening.title":
    "Pesquisa mais rápida, uploads mais leves e páginas movimentadas mais estáveis",
  "changelog.entries.performance-cost-hardening.body":
    "A pesquisa usa índices de texto, as fotos encolhem antes do envio, e listas grandes carregam por páginas com carregar mais.",
  "changelog.entries.accessibility-i18n-pwa-hardening.title":
    "Acessibilidade, tradução e melhorias offline",
  "changelog.entries.accessibility-i18n-pwa-hardening.body":
    "Leitores de ecrã ouvem cada etiqueta de campo, links partilhados ganham pré-visualização, e ficar offline dá uma página real.",
  "changelog.entries.launch-hardening-p1.title":
    "Reforço de segurança, honestidade e fiabilidade",
  "changelog.entries.launch-hardening-p1.body":
    "Bloquear trava mensagens, presença, escrita e notificações e esconde o teu perfil; alterações num convívio atualizam logo.",
  "changelog.entries.remove-listings-from-moderation.title":
    "Moderadores podem remover listagens do diretório",
  "changelog.entries.remove-listings-from-moderation.body":
    "A ação Remover na fila de revisão elimina uma submissão de spam ou duplicada e retira uma listagem ativa do diretório.",

  "changelog.entries.sent-invites-status-filter.title":
    "Filtra por estado os convites que enviaste",
  "changelog.entries.sent-invites-status-filter.body":
    "Os separadores Todos, Pendentes, Aceites e Expirados têm contagem, e cada convite mostra a hora exata de envio e expiração.",

  "changelog.entries.onboarding-one-time-guard.title":
    "Concluir a introdução agora fica guardado",
  "changelog.entries.onboarding-one-time-guard.body":
    "Registamos quando concluis as boas-vindas e, se voltares a cair nelas, vais para o teu feed, sem substituir as tuas escolhas.",

  "changelog.entries.trust-network-replay-by-joins.title":
    "A repetição da rede de confiança segue as pessoas",
  "changelog.entries.trust-network-replay-by-joins.body":
    "A Repetição avança pelos momentos de cada aval, com tempo igual para cada um, e mostra como a comunidade cresceu.",
  "changelog.entries.trust-network-invite-vs-vouch.title":
    "Vê quem foi convidado e quem foi avalizado depois",
  "changelog.entries.trust-network-invite-vs-vouch.body":
    "As ligações de convite na rede de confiança do painel ganham uma cor própria, com legenda e etiquetas ao passar o rato.",
  "changelog.entries.chef-mixologist-therapist-personas.title":
    "Três novos tipos de persona: cozinha, coquetelaria e terapia",
  "changelog.entries.chef-mixologist-therapist-personas.body":
    "Cria um subperfil de cozinha, coquetelaria ou terapia, cada um com o seu modelo inicial e filtro no diretório.",
  "changelog.entries.chef-mixologist-therapist-personas.details":
    "Já podes criar um subperfil de cozinha (menus e residências), de coquetelaria (cocktails e residências) ou de terapia (especialidades e credenciais), cada um com o seu modelo inicial e filtro no diretório.",
  "changelog.entries.connections-card-polish.title":
    "Cartões de ligação mais arrumados",
  "changelog.entries.connections-card-polish.body":
    "A linha de pessoas em comum aparece corretamente, e a data de Ligação mostra o dia e a hora ao minuto.",
  "changelog.entries.lightbox-focus-a11y.title":
    "Gestão de foco mais limpa no visualizador de fotos",
  "changelog.entries.lightbox-focus-a11y.body":
    "O foco deixa de prender na camada invisível de fechar atrás da foto, e leitores de ecrã e teclado continuam a funcionar.",
  "changelog.entries.directory-detail-polish.title":
    "Uma página de espaço redesenhada e mais rigorosa",
  "changelog.entries.directory-detail-polish.body":
    "Detalhes principais numa linha, galeria compacta, ações ao lado do nome, e o Aberto usa o relógio do próprio espaço.",
  "changelog.entries.review-author-avatars.title":
    "Vê quem deixou uma avaliação",
  "changelog.entries.review-author-avatars.body":
    "As avaliações mostram a foto de quem escreveu e o nome liga ao perfil; as de quem não é membro ficam iguais, sem ligação.",
  "changelog.entries.verification-in-context.title":
    "A verificação passa a estar onde estás a explorar",
  "changelog.entries.verification-in-context.body":
    "O diretório tem uma explicação curta, e cada espaço verificado traz uma linha discreta que remete para os critérios.",
  "changelog.entries.safe-spaces-in-directory.title":
    "Espaços seguros verificados, agora dentro do diretório",
  "changelog.entries.safe-spaces-in-directory.body":
    "O emblema aparece nos cartões, um filtro de Espaços seguros verificados reduz a lista, e os verificados aparecem primeiro.",

  "changelog.entries.magazine-desk-polish-sweep.title":
    "Afinações na redação da revista",
  "changelog.entries.magazine-desk-polish-sweep.body":
    "Os títulos ficam consistentes no modo escuro, o deck ligado edita-se da redação, e quem escreve controla a assinatura.",

  "changelog.entries.magazine-piece-messaging.title":
    "Pessoas editoras e quem escreve já podem trocar mensagens diretamente na peça",
  "changelog.entries.magazine-piece-messaging.body":
    "Perguntas e insistências ficam ao lado do trabalho, na própria peça, e os dois lados veem a conversa toda.",

  "changelog.entries.live-press-kit-real-data.title":
    "O kit de imprensa passa a mostrar cobertura, contactos e números reais",
  "changelog.entries.live-press-kit-real-data.body":
    "A cobertura e os contactos vêm do que a equipa publica, os números da plataforma, e as secções vazias ficam escondidas.",
  "changelog.entries.communities-and-home-merged.title":
    "Comunidades, tudo num só lugar",
  "changelog.entries.communities-and-home-merged.body":
    "O teu hub e Descobrir partilham a página /communities com um interruptor; abre no teu hub quando já pertences a alguma.",

  "changelog.entries.silent-session-recovery.title":
    "Sem o aviso de “sessão expirada” quando voltas",
  "changelog.entries.silent-session-recovery.body":
    "Uma sessão restaurável volta em silêncio e retomas onde estavas; só te avisamos quando tiveres mesmo de entrar de novo.",

  "changelog.entries.session-refresh-csrf-race.title":
    "Renovação de sessão mais suave quando o acesso expira",
  "changelog.entries.session-refresh-csrf-race.body":
    "Corrigimos uma condição de corrida na renovação da sessão: renova à primeira, sem aviso de expiração nem pedidos a mais.",

  "changelog.entries.directory-category-unify.title":
    "Categorias do diretório coerentes em todo o lado",
  "changelog.entries.directory-category-unify.body":
    "Um espaço novo mostra o pin da cor certa e a mesma categoria no cartão e no filtro, e a vida noturna já é uma escolha.",

  "changelog.entries.messages-badge-count.title":
    "Um contador de mensagens por ler mais rápido e certo",
  "changelog.entries.messages-badge-count.body":
    "O contador mantém-se certo em todas as páginas sem carregar a caixa de entrada em segundo plano, e atualiza-se em tempo real.",

  "changelog.entries.notifications-coverage.title":
    "Notificações para o que andava a passar despercebido",
  "changelog.entries.notifications-coverage.body":
    "O sino cobre RSVPs, respostas, pedidos de entrada, candidaturas, avaliações, convites aceites e denúncias resolvidas.",

  "changelog.entries.gathering-create-fix.title":
    "Criar um convívio volta a funcionar, e leva-te ao teu evento",
  "changelog.entries.gathering-create-fix.body":
    "O sucesso só aparece depois de publicar, Ver o teu evento abre o convívio real, e o assistente exige um início no futuro.",
  "changelog.entries.directory-collapsible-filters.title":
    "Filtros mais arrumados no diretório de espaços",
  "changelog.entries.directory-collapsible-filters.body":
    "Os refinamentos de espaços seguros e ambiente ficam atrás de um botão Refinar com contagem, e a gaveta fica como a deixaste.",
  "changelog.entries.members-collapsible-filters.title":
    "Filtros recolhíveis no diretório de membros",
  "changelog.entries.members-collapsible-filters.body":
    "As secções mostram-se ou ocultam-se com um botão, as seleções ficam aplicadas enquanto ocultas, e a tua vista fica guardada.",
  "changelog.entries.activism-volunteer-merge.title":
    "Ativismo e Voluntariado são agora um só lugar",
  "changelog.entries.activism-volunteer-merge.body":
    "O voluntariado é a porta de entrada: oportunidades reais em Lisboa por causa ou compromisso; /activism continua a funcionar.",
  "changelog.entries.spaces-map-pins.title":
    "Os pinos do mapa mostram agora que tipo de espaço é cada lugar",
  "changelog.entries.spaces-map-pins.body":
    "Cada pin é uma gota colorida com o ícone da categoria; os filtros usam a mesma cor e ícone e servem de legenda.",
  "changelog.entries.creatives-subprofile.title":
    "A montra Criativa é agora um subperfil criativo",
  "changelog.entries.creatives-subprofile.body":
    "Arte, música ou outro trabalho criativo vive agora nos subperfis; o antigo link /magazine/creatives leva-te até lá.",
  "changelog.entries.moderation-takedowns.title":
    "Ocultar e remover da moderação passam mesmo a retirar o conteúdo",
  "changelog.entries.moderation-takedowns.body":
    "Os membros não veem o conteúdo oculto, a equipa continua a vê-lo; o removido mostra uma marca de removido por um moderador.",
  "changelog.entries.directory-photos-crisp.title":
    "As fotos de capa das fichas voltam a carregar nítidas",
  "changelog.entries.directory-photos-crisp.body":
    "Fotos de capa e a pré-visualização ao adicionar carregam em resolução total; o cabeçalho fica livre da navegação flutuante.",
  "changelog.entries.admin-role-management.title":
    "Os admins podem promover moderadores e admins a partir do painel",
  "changelog.entries.admin-role-management.body":
    "Concede ou remove papéis no detalhe de um membro; o último admin não pode ser removido, e cada alteração fica registada.",
  "changelog.entries.appeal-submission.title":
    "Já podes contestar uma decisão de moderação",
  "changelog.entries.appeal-submission.body":
    "Recorre de um aviso, suspensão ou banimento a partir do ecrã da conta; vai para um moderador que não tomou a decisão.",
  "changelog.entries.honest-report-failures.title":
    "As denúncias de segurança dizem-te a verdade quando não são enviadas",
  "changelog.entries.honest-report-failures.body":
    "Se uma denúncia ou sinalização não chegar até nós, vês um erro honesto e o texto fica no formulário para tentares de novo.",
  "changelog.entries.directory-filters-and-accurate-recognition.title":
    "Filtros de membros que filtram mesmo, e emblemas e vantagens honestos",
  "changelog.entries.directory-filters-and-accurate-recognition.body":
    "Filtros do diretório devolvem as pessoas certas, e Emblemas e Vantagens mostram estados reais de carregamento, vazio e erro.",
  "changelog.entries.navigation-resilience.title":
    "O voltar atrás guarda o teu lugar, e a app aguenta as atualizações",
  "changelog.entries.navigation-resilience.body":
    "Voltar devolve-te ao mesmo ponto de scroll da lista, e uma versão nova a meio da visita atualiza a app em silêncio.",
  "changelog.entries.search-page-launcher.title":
    "Salta para qualquer lado a partir da pesquisa",
  "changelog.entries.search-page-launcher.body":
    "Começa a escrever para saltar para Membros, Comunidades, Definições e mais; um separador Páginas reúne todos os destinos.",
  "changelog.entries.donate-honest-live.title":
    "As doações são honestas sobre o pré-lançamento",
  "changelog.entries.donate-honest-live.body":
    "Não pede dados do cartão enquanto os pagamentos seguros são preparados, di-lo com clareza, e mostra para onde vai o dinheiro.",
  "changelog.entries.gathering-manage-coming-soon.title":
    "O painel de anfitrião é uma pré-visualização honesta",
  "changelog.entries.gathering-manage-coming-soon.body":
    "O modo live mostra um em breve claro; explorar e confirmar presença estão ativos, e ferramentas de anfitrião abrem na demo.",
  "changelog.entries.search-member-avatars.title": "Vê quem está a procurar",
  "changelog.entries.search-member-avatars.body":
    "Os resultados de membros mostram a foto de perfil em vez de um ícone genérico, para reconheceres o rosto de relance.",
  "changelog.entries.search-real-topics.title":
    "A pesquisa mostra agora resultados reais",
  "changelog.entries.search-real-topics.body":
    "Os tópicos em destaque e as contagens vêm da própria plataforma, a par de pessoas, comunidades e eventos reais.",
  "changelog.entries.global-search.title": "Pesquisa em toda a QueerPulse",
  "changelog.entries.global-search.body":
    "Encontra pessoas, comunidades, eventos, tópicos do fórum e negócios de qualquer lugar, com Cmd+K ou a página de pesquisa.",
  "changelog.entries.studio-coming-soon.title":
    "O Studio é agora uma pré-visualização honesta",
  "changelog.entries.studio-coming-soon.body":
    "O Studio de música em cooperativa ainda está em construção, por isso o live mostra em breve; explora-o por inteiro na demo.",
  "changelog.entries.cinema-honest-live.title":
    "O Cinema é honesto sobre o que está ativo",
  "changelog.entries.cinema-honest-live.body":
    "Catálogo e reprodução são reais; coleções, perfis de realizadores e convites abertos dizem em breve no live e abrem na demo.",
  "changelog.entries.cinema-live-streaming.title":
    "O Cinema agora transmite filmes reais",
  "changelog.entries.cinema-live-streaming.body":
    "Explora o programa real, carrega em play para ver um filme, e da próxima vez retoma de onde paraste.",
  "changelog.entries.employer-reviews-live.title":
    "Avaliações de empregadores, a sério",
  "changelog.entries.employer-reviews-live.body":
    "Abre um empregador inclusivo real para ver o perfil completo e as avaliações, ou escreve a tua avaliação anónima.",
  "changelog.entries.block-mute-from-profile.title":
    "Bloqueia ou silencia diretamente a partir do perfil",
  "changelog.entries.block-mute-from-profile.body":
    "Um menu de segurança no cabeçalho silencia alguém de imediato ou bloqueia após confirmação, com a opção de denunciar.",
  "changelog.entries.event-push-reminders.title":
    "Escolhe quando chegam os teus lembretes de eventos",
  "changelog.entries.event-push-reminders.body":
    "Escolhe o lembrete uma hora, um dia ou uma semana antes, e ativa o push no telemóvel para te chegar onde estejas.",
  "changelog.entries.report-more-surfaces.title":
    "Denuncia tudo o que não te parecer certo",
  "changelog.entries.report-more-surfaces.body":
    "Um link discreto Denunciar em eventos, negócios, empresas, vagas e personas abre o mesmo fluxo confidencial.",
  "changelog.entries.profile-photo-pronouns.title":
    "A tua cara, as tuas palavras",
  "changelog.entries.profile-photo-pronouns.body":
    "Carrega uma foto em Editar Perfil com pré-visualização imediata, e escreve os teus pronomes ao lado das opções predefinidas.",
  "changelog.entries.mobile-form-keyboard.title":
    "Os formulários ficam acima do teclado no telemóvel",
  "changelog.entries.mobile-form-keyboard.body":
    "No iOS, os formulários sobem acima do teclado e o submeter fica visível; o ícone da app ganha atalhos de toque prolongado.",

  "changelog.entries.magazine-real-content.title":
    "A revista mostra sempre edições reais",
  "changelog.entries.magazine-real-content.body":
    "O arquivo e as páginas de autoria carregam edições reais, com estados próprios de carregamento e de erro enquanto chegam.",

  "changelog.entries.community-roadmap.title":
    "O roteiro é agora feito contigo",
  "changelog.entries.community-roadmap.body":
    "Vê o que foi lançado, está em construção ou planeado, vota no que te importa ou submete uma ideia; lemos todas as sugestões.",

  "changelog.entries.listing-photos.title": "Fotos na tua ficha de negócio",
  "changelog.entries.listing-photos.body":
    "Carrega as tuas fotos e pré-visualiza a tua ficha antes de publicar.",

  "changelog.entries.business-page-live.title":
    "As páginas de negócios ganham vida",
  "changelog.entries.business-page-live.body":
    "As fotos reais do espaço enchem uma galeria de ecrã inteiro, e o horário traz um estado Aberto agora ou Encerrado ao vivo.",

  "changelog.entries.business-actions.title": "Guarda, partilha e chega lá",
  "changelog.entries.business-actions.body":
    "Uma barra de ações dá direções, telefonar, partilhar ou guardar num toque; os guardados mostram quantos membros os guardaram.",

  "changelog.entries.business-reviews-trust.title":
    "Avaliações que funcionam nos dois sentidos",
  "changelog.entries.business-reviews-trust.body":
    "Os donos respondem às avaliações, cada página mostra as estrelas por trás da média, e podes denunciar ou sugerir correções.",

  "changelog.entries.business-discovery.title": "Orienta-te no diretório",
  "changelog.entries.business-discovery.body":
    "Locais parecidos por perto, os idiomas falados no espaço e um caminho de volta ao diretório; os eventos ligam à sua página.",

  "changelog.entries.directory-filters-upgrade.title":
    "O diretório de negócios ficou muito mais fácil de filtrar",
  "changelog.entries.directory-filters-upgrade.body":
    "A pesquisa olha para descrições e etiquetas, ordenas de A a Z ou por bairro, e os filtros ficam no link, pronto a partilhar.",
  "changelog.entries.public-profile-badge.title":
    'O "Ficar público" agora vive no teu perfil',
  "changelog.entries.public-profile-badge.body":
    "Um selo discreto ao lado do teu nome mostra como os perfis públicos se desbloqueiam e ativa o teu; só tu o vês.",

  "changelog.entries.here-for-hero.title":
    '"Aqui para" agora abre o teu perfil',
  "changelog.entries.here-for-hero.body":
    "O que procuras aparece agora no topo, ao lado do nome e da bio, e continua igualmente fácil de manter privado.",

  "changelog.entries.directory-view-switcher.title":
    "Uma troca Lista / Mapa mais clara",
  "changelog.entries.directory-view-switcher.body":
    "Lista e mapa são um único seletor com etiquetas e ícones ao lado da contagem de resultados, fácil de tocar no telemóvel.",

  "changelog.entries.profile-links-fix.title":
    "Links de perfil que se comportam",
  "changelog.entries.profile-links-fix.body":
    "Um handle do Instagram simples é agora aceite como link de perfil, e o campo mantém-se no sítio quando surge uma dica.",

  "changelog.entries.subprofiles-showcase.title":
    'Um "Também a trabalhar como" mais rico',
  "changelog.entries.subprofiles-showcase.body":
    "Os cartões de persona mostram trabalho em destaque, links, disponibilidade, seguidores e endossos; edita as tuas na vitrine.",

  "changelog.entries.real-directory-map.title":
    "Um mapa a sério em cada página do diretório",
  "changelog.entries.real-directory-map.body":
    "Abre um negócio ou espaço e a localização aparece no mapa interativo de Lisboa, marcada no ponto onde o dono a colocou.",

  "changelog.entries.reply-threads.title":
    "Responde a qualquer comentário no fórum",
  "changelog.entries.reply-threads.body":
    "A tua resposta fica aninhada sob o comentário, e as conversas profundas recolhem numa linha que tocas para expandir.",

  "changelog.entries.copy-subprofile.title": "Duplica um perfil já existente",
  "changelog.entries.copy-subprofile.body":
    "A criar um subperfil novo? Duplica um que já tenhas, tudo ou só o conteúdo, e ajusta a partir daí.",

  "changelog.entries.smoother-chat.title": "Chat mais suave e reativo",
  "changelog.entries.smoother-chat.body":
    "Escrever mantém a conversa estável, deslizar para responder acompanha o teu dedo, e as mensagens novas assentam sozinhas.",

  "changelog.entries.invite-state-page.title": "Página de convite mais clara",
  "changelog.entries.invite-state-page.body":
    "Uma ligação de convite inválida mostra o convite, quem te avalizou, porque deixou de funcionar e o passo certo a seguir.",

  "changelog.entries.chat-shortcuts.title": "Atalhos de menção no chat",
  "changelog.entries.chat-shortcuts.body":
    "Um botão de ajuda no compositor lista todos os atalhos de menção, do @ ao t/; toca num e ele entra logo na tua mensagem.",

  "changelog.entries.events-hub.title": "Uma casa só para os eventos",
  "changelog.entries.events-hub.body":
    "Eventos, Encontros e Calendário são um único Events Hub com Destaques, Explorar e calendário completo, e fotos reais.",

  "changelog.entries.gifs-in-chat.title": "Envia GIFs no chat",
  "changelog.entries.gifs-in-chat.body":
    "Um botão de GIF no compositor deixa-te procurar ou ver o que está em tendência e enviar um, com filtro de conteúdo seguro.",

  "changelog.entries.privacy-and-speed.title":
    "Mais privacidade e uma app mais ágil",
  "changelog.entries.privacy-and-speed.body":
    "Personas privadas ficam privadas, quem bloqueaste sai do diretório de colegas de casa, e editar mensagens aplica-se logo.",

  "changelog.entries.leaner-prerendering.title":
    "Compilações do site mais leves e rápidas",
  "changelog.entries.leaner-prerendering.body":
    "Só a página pública essencial é pré-gerada para os motores de busca; todas continuam a ser encontradas pelo mapa do site.",

  "changelog.entries.admin-governance-real-data.title":
    "Painéis de governança agora com dados reais",
  "changelog.entries.admin-governance-real-data.body":
    "Valores financeiros, gráfico trimestral, registo de decisões e histórico de moderação leem agora dados reais da plataforma.",

  "changelog.entries.sign-in-fix.title": "Iniciar sessão volta a funcionar",
  "changelog.entries.sign-in-fix.body":
    "Uma incompatibilidade entre app e servidor impedia o início de sessão; entrar, sair e manter a sessão voltam a funcionar.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Mais fácil de tocar, mais fácil de navegar",
  "changelog.entries.accessibility-mobile-polish.body":
    "Botões pequenos com áreas de toque maiores, ações de hover alcançáveis pelo teclado, e formulários preenchem nome e email.",
  "changelog.entries.platform-hardening.title": "Reforços nos bastidores",
  "changelog.entries.platform-hardening.body":
    "A API é versionada com documentação publicada, as listas longas ficam limitadas e as denúncias ganham proteção contra spam.",
  "changelog.entries.composer-reaction-polish.title":
    "Caixa de mensagem mais ampla e reações mais arrumadas",
  "changelog.entries.composer-reaction-polish.body":
    "A caixa ocupa toda a largura do compositor e cresce à medida que escreves; tocar num emoji já usado remove a tua reação.",
  "changelog.entries.chat-mentions.title": "Menciona pessoas e lugares no chat",
  "changelog.entries.chat-mentions.body":
    "Escreve @ para um membro, ou c/ b/ e/ t/ # para comunidade, negócio, encontro, tópico ou tema, e escolhe uma sugestão.",
  "changelog.entries.group-chats.title": "Conversas de grupo",
  "changelog.entries.group-chats.body":
    "Cria e nomeia um grupo; os administradores gerem membros, os recibos mostram quem leu e uma bolha mostra quem escreve.",
  "changelog.entries.message-search.title": "Procura nas tuas mensagens",
  "changelog.entries.message-search.body":
    "Pesquisa em todas as conversas por aquela morada, aquela data ou aquilo que alguém disse, e salta diretamente para lá.",
  "changelog.entries.link-previews.title": "As ligações abrem-se",
  "changelog.entries.link-previews.body":
    "Uma ligação partilhada abre-se num cartão com título e imagem, para as pessoas verem para onde vai antes de tocar.",
  "changelog.entries.forward-pin-star.title": "Reencaminha, fixa e marca",
  "changelog.entries.forward-pin-star.body":
    "Passa uma mensagem para outra conversa, fixa as que um grupo revisita e marca com estrela as que queres reencontrar.",
  "changelog.entries.safe-space-view-page.title":
    "Pré-visualiza espaços seguros antes de verificar",
  "changelog.entries.safe-space-view-page.body":
    "Cada listagem na revisão de Espaços seguros tem um botão Ver página que abre a página pública num novo separador.",
  "changelog.entries.swipe-members-highlight.title":
    "Desliza pelos membros em destaque",
  "changelog.entries.swipe-members-highlight.body":
    "O cartão de membro em destaque na página inicial acompanha o teu dedo; desliza para o lado e encaixa no membro seguinte.",
  "changelog.entries.mention-names.title": "As menções mostram nomes reais",
  "changelog.entries.mention-names.body":
    "Uma menção aparece com o nome por extenso no chat, no fórum e nas comunidades; o cursor mostra o identificador.",
  "changelog.entries.forward-to-groups.title":
    "Reencaminha mensagens para os teus grupos",
  "changelog.entries.forward-to-groups.body":
    "Mantém premida qualquer mensagem, escolhe Reencaminhar e seleciona qualquer conversa de grupo de que fazes parte.",
  "changelog.entries.read-receipts.title": "Recibos de entrega e de leitura",
  "changelog.entries.read-receipts.body":
    "Os vistos mostram enviada, entregue no telemóvel e lida, para saberes onde a tua mensagem chegou.",
  "changelog.entries.message-gestures.title":
    "Desliza para responder, toca para reagir",
  "changelog.entries.message-gestures.body":
    "Desliza uma mensagem para o lado para lhe responder e toca duas vezes para reagir.",
  "changelog.entries.message-drafts.title": "Os teus rascunhos esperam por ti",
  "changelog.entries.message-drafts.body":
    "Uma mensagem que não enviaste fica guardada nessa conversa até voltares.",
  "changelog.entries.offline-outbox.title": "Envios que não se perdem",
  "changelog.entries.offline-outbox.body":
    "Envia sem rede e a mensagem fica em fila, a sair assim que voltares a ter ligação.",
  "changelog.entries.typing-indicator.title":
    "Bolha de escrita e cuidado com o leitor de ecrã",
  "changelog.entries.typing-indicator.body":
    "Uma bolha suave mostra quando a outra pessoa escreve, e a conversa fica mais fácil de acompanhar com leitor de ecrã.",
  "changelog.entries.moderation-actions.title":
    "Cada denúncia recebe uma decisão real",
  "changelog.entries.moderation-actions.body":
    "Uma denúncia oferece ocultar, avisar, restringir, remover e mais, cada uma com motivo que a pessoa lê; a fila conta bem.",
  "changelog.entries.listing-preview-and-ask.title":
    "Pré-visualiza um anúncio, faz uma pergunta",
  "changelog.entries.listing-preview-and-ask.body":
    "A moderação vê um negócio submetido tal como ficará publicado e envia uma pergunta a quem o submeteu por mensagem direta.",
  "changelog.entries.business-map-pin.title": "Coloca o teu negócio no mapa",
  "changelog.entries.business-map-pin.body":
    "Cola uma ligação do Google Maps ao listar um negócio para marcar o ponto; os anúncios ativos chegam ao mapa após moderação.",
  "changelog.entries.profile-editing.title": "Edita o teu perfil no lugar",
  "changelog.entries.profile-editing.body":
    "Edita o teu quadro, competências e grupos diretamente no perfil, com um aviso antes de saíres com alterações por guardar.",
  "changelog.entries.profile-communities-save.title":
    "Comunidades em destaque que ficam",
  "changelog.entries.profile-communities-save.body":
    "As comunidades fixadas ficam guardadas entre sessões e dispositivos, e quem visita vê-as com a tua função em cada uma.",
  "changelog.entries.mention-types.title": "Mais formas de mencionar",
  "changelog.entries.mention-types.body":
    "As menções chegam também a tópicos, negócios, eventos e discussões, e quem os gere é notificado quando é referido.",
  "changelog.entries.clear-errors.title": "Mensagens de erro mais claras",
  "changelog.entries.clear-errors.body":
    "Quando algo não pode ser guardado, a mensagem diz exatamente o que correu mal e o que corrigir.",
  "changelog.entries.messaging-reactions.title":
    "Reações a mensagens mais fluidas",
  "changelog.entries.messaging-reactions.body":
    "As reações aparecem de imediato para todos na conversa, e as tuas mensagens mantêm a posição quando reages.",
  "changelog.entries.event-photos.title": "Galerias de fotos de eventos",
  "changelog.entries.event-photos.body":
    "Quem organiza e quem participou pode partilhar fotos num encontro, visíveis apenas para quem lá esteve.",
  "changelog.entries.mentions.title": "Menciona pessoas e comunidades",
  "changelog.entries.mentions.body":
    "Escreve @ para etiquetar um membro ou c/ para ligar uma comunidade nas respostas; quem mencionas recebe uma notificação.",
  "changelog.entries.push-notifications.title":
    "Notificações push para mensagens",
  "changelog.entries.push-notifications.body":
    "Ativa uma notificação no telemóvel quando chega uma mensagem direta enquanto estás ausente; desativado por predefinição.",
  "changelog.entries.delete-conversation.title": "Apagar uma conversa",
  "changelog.entries.delete-conversation.body":
    "Limpa uma conversa da tua caixa de entrada enquanto a outra pessoa mantém a cópia dela.",
  "changelog.entries.profile-communities.title": "Destaca as tuas comunidades",
  "changelog.entries.profile-communities.body":
    "Fixa no teu perfil as comunidades que geres ou de que fazes parte, cada uma com um crachá de função.",
  "changelog.entries.subprofiles-upgrade.title": "Subperfis mais ricos",
  "changelog.entries.subprofiles-upgrade.body":
    "Os subperfis ganham presença e multimédia, pré-visualização ao partilhar e exportação por código QR e vCard.",
  "changelog.entries.messaging-upgrades.title": "Melhorias nas mensagens",
  "changelog.entries.messaging-upgrades.body":
    "Toca longamente numa mensagem para ver ações, edita-a ou responde-lhe, e lê um fio de conversa mais limpo.",
  "changelog.entries.housing.title":
    "Diretórios de habitação e colegas de casa",
  "changelog.entries.housing.body":
    "Anúncios só para membros de habitação, colegas de casa e senhorios amigáveis, cada um com pontuação de compatibilidade.",
  "changelog.entries.routing-cleanup.title": "Limpeza de rotas e caminhos",
  "changelog.entries.routing-cleanup.body":
    "Os caminhos públicos em conflito e os casos extremos de rotas em toda a aplicação ficaram resolvidos.",
  "changelog.entries.maps.title": "Mapas interativos",
  "changelog.entries.maps.body":
    "Explora o diretório local e os espaços num mapa interativo.",
  "changelog.entries.genesis.title": "Fluxo de arranque do fundador",
  "changelog.entries.genesis.body":
    "Um fluxo Genesis único configura o primeiro administrador quando a plataforma é iniciada.",
  "changelog.entries.pwa-mobile.title": "Instalar como aplicação",
  "changelog.entries.pwa-mobile.body":
    "Instala-a como aplicação web progressiva, com interface móvel de aspeto nativo, melhores ícones e metadados de pesquisa.",
  "changelog.entries.deploy-stability.title":
    "Estabilização de implementação e compilação",
  "changelog.entries.deploy-stability.body":
    "Uma série de correções de implementação, compilação e pré-renderização para a app ser publicada de forma fiável.",
  "changelog.entries.performance-staff.title": "Desempenho e crachás de equipa",
  "changelog.entries.performance-staff.body":
    "As páginas carregam mais depressa, há mais rotas de administração e as contas oficiais têm um crachá de equipa QueerPulse.",
  "changelog.entries.accessibility.title":
    "Acessibilidade e refinamento da interface",
  "changelog.entries.accessibility.body":
    "Correções de acessibilidade e uma ronda de melhorias de interface em toda a aplicação.",
  "changelog.entries.i18n-complete.title": "Tradução completa para português",
  "changelog.entries.i18n-complete.body":
    "Toda a interface está disponível em inglês e português, alternável a partir da navegação.",
  "changelog.entries.subprofiles.title": "Subperfis",
  "changelog.entries.subprofiles.body":
    "Cria várias presenças públicas numa só conta: para a tua arte, o teu negócio ou um projeto.",
  "changelog.entries.live-backend.title": "Backend em produção",
  "changelog.entries.live-backend.body":
    "A app corre no seu backend real com perfis editáveis, e o modo de demonstração autónomo continua disponível a par dele.",
  "changelog.entries.landing.title": "Nova página inicial",
  "changelog.entries.landing.body":
    "Uma página inicial redesenhada, com uma ronda de refatorações do site de marketing.",
  "changelog.entries.studio-cinema.title": "Cinema e Estúdio",
  "changelog.entries.studio-cinema.body":
    "As páginas de direitos do Cinema e as páginas de produção do Estúdio juntaram-se à plataforma.",
  "changelog.entries.tickets.title": "Eventos com bilhete",
  "changelog.entries.tickets.body":
    "Paga bilhetes de eventos diretamente na plataforma, com base em dados reais dos eventos.",
  "changelog.entries.business-directory.title": "Diretório de negócios locais",
  "changelog.entries.business-directory.body":
    "Um diretório de negócios locais amigáveis, com um fluxo para os proprietários acrescentarem o seu.",
  "changelog.entries.invite-flow.title": "Fluxo de convites",
  "changelog.entries.invite-flow.body":
    "A inscrição funciona por convite, com uma integração renovada a acompanhar.",
  "changelog.entries.moderation-trust.title": "Moderação e rede de confiança",
  "changelog.entries.moderation-trust.body":
    "Ferramentas de moderação, gestão de eventos, ferramentas de administração e um grafo de confiança que liga os membros.",
  "changelog.entries.communities-forum.title": "Comunidades e fórum",
  "changelog.entries.communities-forum.body":
    "As comunidades geridas por membros e um fórum de discussão de formato longo foram lançados em conjunto.",
  "changelog.entries.onboarding.title": "Integração de membros",
  "changelog.entries.onboarding.body":
    "Um fluxo de integração guiado para novos membros, com um início de sessão mais suave.",
  "changelog.entries.launch.title": "Lançamento da QueerPulse",
  "changelog.entries.launch.body":
    "O primeiro lançamento: a meganavegação da comunidade e o conjunto principal de páginas entraram em funcionamento.",
  "changelog.empty.title": "Ainda nada registado com este filtro",
  "changelog.empty.description":
    "Ainda não houve alterações deste tipo. Limpa o filtro para ver o histórico completo.",
  "changelog.empty.clearCta": "Limpar filtros",

  // ── Roteiro — chrome da página. Os itens enviados/em construção/
  //    planeados, as ideias mais votadas e as contagens de votos são o
  //    backlog em direto — ficam em inglês; ver o relatório da varredura.
  "roadmap.meta.title": "O roteiro da QueerPulse: lançado, em curso, planeado",
  "roadmap.meta.description":
    "Vê o que a QueerPulse já lançou, o que uma pequena equipa em Lisboa está a construir agora, e o que está planeado a seguir, além de como submeter e votar ideias.",
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
  "roadmap.card.committed": "Compromisso",
  "roadmap.card.slipNote": "Adiado de {from} para {to}: {reason}",
  "roadmap.card.plannedFeatures": "Funcionalidades planeadas",
  "roadmap.shape.title": "Tens uma <em>ideia?</em>",
  "roadmap.shape.sub":
    "Lemos todas as sugestões. As ideias mais votadas sobem no roteiro.",
  "roadmap.submitIdea.title": "Submeter uma ideia",
  "roadmap.submitIdea.ariaLabel": "A tua ideia",
  "roadmap.submitIdea.placeholder":
    "O que tornaria a QueerPulse melhor para ti?",
  "roadmap.submitIdea.cta": "Submeter ideia",
  "roadmap.submitIdea.toast.empty": "Escreve primeiro algumas palavras",
  "roadmap.submitIdea.toast.submitted":
    "Obrigade, enviámos à equipa para revisão",
  "roadmap.submitIdea.toast.error":
    "Não foi possível submeter a tua ideia. Tenta de novo",
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
  "roadmap.someday.title": "Um dia, <em>com honestidade</em>",
  "roadmap.someday.sub":
    "Sem data aqui, porque uma data seria uma promessa que ainda não podemos cumprir. Continua no nosso radar: vota para ajudar uma ideia a subir.",
  "roadmap.notBuilding.title": "O que não vamos construir, e <em>porquê</em>",
  "roadmap.notBuilding.sub":
    "A lista que a maioria das plataformas esconde. Se dizemos que não, recebes uma razão.",
  "roadmap.notBuilding.votesAsked_one": "{count} pessoa tinha pedido",
  "roadmap.notBuilding.votesAsked_other": "{count} pessoas tinham pedido",
  "roadmap.notBuilding.reason.scope.label": "Fora do que estamos a construir",
  "roadmap.notBuilding.reason.unsafe.label":
    "Não conseguimos construir isto com segurança",
  "roadmap.notBuilding.reason.capacity.label":
    "Sem capacidade, com honestidade",
  "roadmap.notBuilding.reason.exists.label": "Já existe noutro lugar",
  "roadmap.notBuilding.reason.harm.label": "O risco supera o valor",
  "roadmap.subpageIndex.title": "Já lançado",
  "roadmap.subpageIndex.changelog.label": "Registo de alterações",
  "roadmap.subpageIndex.changelog.blurb":
    "Todos os lançamentos, datados: o que já lançámos até agora.",

  // ── Arquivo de Imprensa — chrome da página. Títulos/fontes/autores da
  //    cobertura são peças de imprensa de terceiros reais (palavras de
  //    outras pessoas) e ficam em inglês, o mesmo precedente da secção de
  //    cobertura do Press Kit.
  "pressArchive.hero.backLabel": "Press Kit",
  "pressArchive.meta.title":
    "Arquivo de imprensa da QueerPulse: tudo o que já escreveram sobre nós",
  "pressArchive.meta.description":
    "Cobertura da QueerPulse em publicações de terceiros, indexada por ano, incluindo as críticas com as quais discordámos.",
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
  "pressArchive.endOfArchive": "É este o arquivo completo, de 2022 até hoje.",
  "pressArchive.noResults":
    "Nenhuma cobertura corresponde a esses filtros ainda.",
  "pressArchive.live.title": "O arquivo de imprensa está a ser reunido",
  "pressArchive.live.body":
    "Estamos a reunir a cobertura como deve ser antes de a publicarmos aqui. A preparar um artigo? Fala com a equipa através do kit de imprensa.",

  // ── Voluntariado — chrome da página. Nomes/funções/descrições/competências
  //    das organizações vêm da API de oportunidades em direto (ou do seu
  //    mock de demonstração) — ficam em inglês; o adaptador compõe alguns
  //    fragmentos de chrome (etiqueta de compromisso, etiquetas de
  //    estatística/vagas, frase de confirmação) que também têm chave aqui
  //    para o modo em direto traduzir tal como a demonstração.
  "volunteer.meta.title": "Voluntariado na QueerPulse: escolhe causa e tempo",
  "volunteer.meta.description":
    "Explora oportunidades de voluntariado na QueerPulse por causa (direitos, saúde, juventude, habitação, artes) e por tempo disponível, ou publica uma para a tua organização.",
  "volunteer.filter.all": "Todas as oportunidades",
  "volunteer.filter.low": "Compromisso baixo",
  "volunteer.filter.medium": "Compromisso médio",
  "volunteer.filter.commitmentGroup": "Filtrar por compromisso",
  "volunteer.filter.causeGroup": "Filtrar por causa",
  // A taxonomia de causas do voluntariado, um conjunto de chaves partilhado
  // pelos filtros do quadro, pelo seletor do formulário e pela etiqueta do
  // cartão. Substituiu dois conjuntos paralelos ("volunteer.filter.*" e
  // "postOpportunity.cause.*") que guardavam as mesmas cinco frases duas vezes.
  "cause.rights": "Direitos LGBTQ+",
  "cause.health": "Saúde e bem-estar",
  "cause.youth": "Juventude",
  "cause.housing": "Habitação",
  "cause.arts": "Artes e cultura",
  "cause.transCare": "Cuidados trans e de género",
  "cause.elders": "Pessoas mais velhas",
  "cause.mentalHealth": "Saúde mental e apoio entre pares",
  "cause.migration": "Migração e asilo",
  "cause.education": "Educação e formação",
  "cause.sport": "Desporto e movimento",
  "cause.communityEvents": "Eventos comunitários",
  "cause.fundraising": "Angariação e apoio administrativo",
  "volunteer.hero.eyebrow": "Voluntariado",
  "volunteer.hero.title": "Dá o teu tempo à <em>comunidade</em> à tua volta.",
  "volunteer.hero.sub":
    "Não precisas de ser ativista. Precisas de duas horas livres e vontade de aparecer. Abaixo estão organizações em Lisboa genuinamente à procura de pessoas como tu.",
  "volunteer.hero.note":
    "Todas as organizações abaixo foram avaliadas pela comunidade QueerPulse",
  "volunteer.hero.postCta": "Publicar uma oportunidade",
  "volunteer.guide.eyebrow": "Novo no ativismo?",
  "volunteer.guide.title": "Queres fazer <em>mais</em> do que um turno?",
  "volunteer.guide.body":
    "O nosso guia para organizar melhor leva-te de aparecer uma vez a trazer uma competência, sem experiência necessária.",
  "volunteer.guide.cta": "Ler o guia de ativismo",
  "volunteer.empty.noneTitle": "Ainda não há oportunidades publicadas",
  "volunteer.empty.noneDescription":
    "Ainda nenhuma organização publicou vagas aqui. Se a tua precisa de ajuda, sê a primeira a lançar o convite.",
  "volunteer.empty.noneCta": "Publicar uma oportunidade",
  "volunteer.empty.filteredTitle":
    "Ainda não há oportunidades com estes filtros",
  "volunteer.empty.filteredDescription":
    "Tenta alargar a pesquisa. Há muitas formas de dar o teu tempo, e há sempre vagas novas a surgir.",
  "volunteer.empty.clearCta": "Limpar filtros",
  "volunteer.card.commitLow": "Compromisso baixo",
  "volunteer.card.commitMedium": "Compromisso médio",
  "volunteer.card.seeRole": "Ver a função",
  "volunteer.loadingMore": "A carregar mais oportunidades…",
  "volunteer.loadMoreCta": "Carregar mais oportunidades",
  "volunteer.outro.title": "Queres ligar-te <em>mais a fundo?</em>",
  "volunteer.outro.sub":
    "Encontra quem já está a trabalhar nas causas que te importam.",
  "volunteer.outro.cta": "Conhece quem faz a mudança",
  "volunteer.signups.title": "Quem já se inscreveu",
  "volunteer.signups.loading": "A carregar inscrições…",
  "volunteer.signups.empty":
    "Ainda ninguém se inscreveu. A primeira pessoa aparece aqui.",
  "volunteer.signups.signedUp": "Inscreveu-se {when}",
  "volunteer.signups.closedTag": "Esta oportunidade está encerrada",
  "volunteer.signups.closing": "A encerrar…",
  "volunteer.signups.closeCta": "Encerrar oportunidade",
  "volunteer.signups.reviewCta": "{count} para rever",

  // ── A contribuição confirmada da própria pessoa (SUS-05). Sessões e horas
  // confirmadas por quem publicou, nunca autodeclaradas.
  "volunteer.contribution.title": "O que já contribuíste",
  "volunteer.contribution.loading": "A carregar o teu voluntariado…",
  "volunteer.contribution.sessions": "sessões confirmadas",
  "volunteer.contribution.hours": "horas contribuídas",
  "volunteer.contribution.lastOne": "Sessão confirmada mais recente: {when}",
  "volunteer.contribution.awaiting_one":
    "1 candidatura aceite está à espera de que quem publicou confirme a sessão.",
  "volunteer.contribution.awaiting_other":
    "{count} candidaturas aceites estão à espera de que quem publicou confirme a sessão.",
  "volunteer.contribution.empty":
    "Ainda não há nada confirmado. Assim que alguém registar uma sessão em que compareceste, as horas aparecem aqui.",
  "volunteer.contribution.note":
    "As horas são confirmadas por quem publicou a oportunidade, por isso este registo tem outra pessoa a garanti-lo.",
  "volunteer.hero.manageCta": "Gerir candidaturas",
  "volunteerManage.title": "Gerir candidaturas",
  "volunteerManage.sub":
    "Revê e decide sobre quem se inscreveu nas oportunidades que publicaste, ou que uma comunidade que organizas publicou.",
  "volunteerManage.loading": "A carregar as tuas oportunidades…",
  "volunteerManage.empty":
    "Ainda não publicaste nenhuma oportunidade de voluntariado, e as comunidades que organizas também não.",
  "volunteerManage.loadingApplicants": "A carregar candidaturas…",
  "volunteerManage.noApplicants": "Ainda ninguém se candidatou.",
  "volunteerManage.pendingCount": "{count} pendentes",
  "volunteerManage.status.pending": "Pendente",
  "volunteerManage.status.accepted": "Aceite",
  "volunteerManage.status.declined": "Recusada",
  "volunteerManage.accept": "Aceitar",
  "volunteerManage.decline": "Recusar",

  // ── Conclusão de sessão de voluntariado (SUS-05). Quem publicou regista o
  // que aconteceu, por isso as horas são atestadas por outra pessoa. Nenhum
  // texto aqui promete uma mensagem à pessoa voluntária: não é enviada nenhuma.
  "volunteerManage.completion.title": "Registar a sessão",
  "volunteerManage.completion.attendedLabel": "Compareceu?",
  "volunteerManage.completion.attendedYes": "Compareceu",
  "volunteerManage.completion.attendedNo": "Não compareceu",
  "volunteerManage.completion.hoursLabel": "Horas contribuídas",
  "volunteerManage.completion.hoursHelper":
    "Até 24 numa sessão. Podes usar quartos de hora.",
  "volunteerManage.completion.confirm": "Confirmar sessão",
  "volunteerManage.completion.confirming": "A confirmar…",
  "volunteerManage.completion.why":
    "As horas confirmadas contam para o total de horas de voluntariado que a QueerPulse pode reportar e para o reconhecimento desta pessoa.",
  "volunteerManage.completion.error":
    "Não foi possível guardar. Verifica a ligação e tenta outra vez.",
  "volunteerManage.completion.alreadyDone":
    "Esta sessão já tinha sido confirmada.",
  "volunteerManage.completion.confirmedHours": "Confirmado: {hours} h a {when}",
  "volunteerManage.completion.confirmedNoShow": "Registado como falta a {when}",

  // ── Publicar uma oportunidade de voluntariado — chrome do formulário
  //    (tudo interface da plataforma).
  "postOpportunity.hero.eyebrow": "Voluntariado · Publicar uma vaga",
  "postOpportunity.hero.title": "Publica uma <em>oportunidade.</em>",
  "postOpportunity.hero.sub":
    "Precisas de pessoas para dar o tempo delas? Descreve a vaga com honestidade (as horas, o compromisso, para quem é indicada) e fica logo visível no quadro de voluntariado.",
  "postOpportunity.toast.error":
    "Não foi possível publicar a tua oportunidade. Tenta outra vez.",
  "postOpportunity.success.title": "A tua oportunidade está",
  "postOpportunity.success.em": "publicada.",
  "postOpportunity.success.closeLabel": "Ver o quadro de voluntariado",
  "postOpportunity.success.step1": "Já está visível no quadro de voluntariado",
  "postOpportunity.success.step2":
    "As pessoas podem inscrever-se a partir da ficha",
  "postOpportunity.success.step3":
    "Vais ver todas as inscrições na página da vaga",
  "postOpportunity.success.body":
    "Obrigade por abrires espaço para alguém ajudar. Quem estiver interessade já pode encontrar a tua vaga e mostrar interesse.",
  "postOpportunity.actions.posting": "A publicar…",
  "postOpportunity.actions.submit": "Publicar oportunidade",
  "postOpportunity.actions.cancel": "Cancelar",
  "postOpportunity.tip1.title": "Sê honesto sobre o pedido",
  "postOpportunity.tip1.body":
    "As pessoas voluntárias ficam quando o compromisso corresponde ao que prometeste. Explica as horas, a duração, e qualquer formação, logo à partida.",
  "postOpportunity.tip2.title": "Diz para quem é indicada",
  "postOpportunity.tip2.body":
    "As melhores vagas descrevem a pessoa de que precisam: o temperamento tanto como o currículo. Ajuda as pessoas certas a identificarem-se.",
  "postOpportunity.tip3.title": "O que acontece depois de publicares",
  "postOpportunity.tip3.body":
    "A tua vaga aparece imediatamente no quadro de voluntariado. As pessoas interessadas inscrevem-se a partir da ficha, e vês a lista ali.",
  "postOpportunity.commit.low.label": "Compromisso baixo",
  "postOpportunity.commit.low.hint":
    "Umas horas flexíveis por semana, sem prazo fixo.",
  "postOpportunity.commit.medium.label": "Compromisso médio",
  "postOpportunity.commit.medium.hint":
    "Um turno regular e um prazo mínimo: a consistência importa.",
  "postOpportunity.core.basicsHeading": "O essencial",
  "postOpportunity.core.orgLabel": "Organização",
  "postOpportunity.core.orgHelper":
    "Escolhe uma comunidade que possuis ou moderas, ou uma organização parceira aprovada.",
  "postOpportunity.core.orgEmptyState":
    "Precisas de possuir ou moderar uma comunidade, ou ser uma organização parceira aprovada, antes de poderes publicar uma oportunidade em nome dela.",
  "postOpportunity.core.orgPlaceholder": "ex.: a tua organização",
  "postOpportunity.core.orgLinkLabel": "Associar a uma organização",
  "postOpportunity.core.orgLinkHelper":
    "Opcional: associe esta publicação a uma comunidade que possui ou modera, ou a uma organização parceira aprovada.",
  "postOpportunity.core.orgLinkNone": "Nenhuma",
  "postOpportunity.core.orgLinkGroupPartner": "Parceiros",
  "postOpportunity.core.orgLinkGroupCommunity": "As minhas comunidades",
  "postOpportunity.core.roleLabel": "Título da função",
  "postOpportunity.core.rolePlaceholder":
    "ex.: Voluntário de Sensibilização Comunitária",
  "postOpportunity.core.causeLabel": "Causa",
  "postOpportunity.core.causeHelper":
    "Escolhe até {{max}}. A primeira que escolheres é a que aparece à frente no teu cartão.",
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
    "Separadas por vírgulas, mostradas como hashtags no cartão. Até {maxCount}, {maxLength} carateres cada.",
  "postOpportunity.core.skillsPlaceholder":
    "Comunicação, Idiomas, Apoio a eventos",
  "postOpportunity.edit.eyebrow": "Voluntariado · Editar",
  "postOpportunity.edit.title": "Editar esta <em>oportunidade.</em>",
  "postOpportunity.edit.sub":
    "Atualiza os detalhes que as pessoas voluntárias veem no anúncio.",
  "postOpportunity.edit.saveCta": "Guardar alterações",
  "postOpportunity.missing.taskTitle": "Título da tarefa {index}",
  "postOpportunity.missing.commitmentLabel": "Título do compromisso {index}",
  "postOpportunity.missing.heading_one":
    "Falta preencher {count} campo para continuares:",
  "postOpportunity.missing.heading_other":
    "Faltam preencher {count} campos para continuares:",
  "postOpportunity.edit.saving": "A guardar…",
  "postOpportunity.edit.successToast": "As tuas alterações estão guardadas.",
  "postOpportunity.edit.errorToast":
    "Não foi possível guardar as alterações. Tenta novamente.",
  "postOpportunity.edit.notAllowed":
    "Só podes editar uma oportunidade que tenhas publicado.",
  "postOpportunity.rich.summary": "Acrescentar mais detalhe (opcional)",
  "postOpportunity.rich.whyHeading": "Porque é que importa",
  "postOpportunity.rich.whyLabel": "Porque é que esta função importa",
  "postOpportunity.rich.whyHelper":
    "Um parágrafo por linha. Até {maxCount} parágrafos, {maxLength} carateres cada.",
  "postOpportunity.rich.whyPlaceholder":
    "O que muda porque alguém apareceu para isto.",
  "postOpportunity.rich.goodForLabel": "Para quem é indicada",
  "postOpportunity.rich.goodForHelper":
    "Um parágrafo por linha. Até {maxCount} parágrafos, {maxLength} carateres cada.",
  "postOpportunity.rich.goodForPlaceholder":
    "O temperamento e as competências que encaixam, tanto como o currículo.",
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
    "Escolhe entre as tuas ligações ou as comunidades a que pertences.",
  "postOpportunity.rich.teamPlaceholder": "Selecionar ligações ou comunidades",
  "postOpportunity.rich.teamGroupConnections": "Ligações",
  "postOpportunity.rich.teamGroupCommunities": "Comunidades",
  "postOpportunity.rich.teamEmpty":
    "Ligue-se a pessoas ou junte-se a uma comunidade para as adicionar aqui.",
  "postOpportunity.rich.applyRoleLabel": "Etiqueta da função ao candidatar-se",
  "postOpportunity.rich.applyRoleHelper":
    "Por predefinição, “Função · Organização”.",
  "postOpportunity.rich.applyRolePlaceholder":
    "Sensibilização Comunitária · uma associação LGBTQ+ local",
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
  "volunteerDetail.backCta": "Todas as oportunidades de voluntariado",
  "volunteerDetail.meta.title":
    "{role} com {org}: voluntariado pela QueerPulse",
  "volunteerDetail.meta.loadingTitle":
    "A carregar uma função de voluntariado · QueerPulse",
  "volunteerDetail.error.alreadySignedUp": "Já te inscreveste nesta função.",
  "volunteerDetail.error.full":
    "Esta oportunidade acabou de ficar completa: todas as vagas estão ocupadas.",
  "volunteerDetail.error.alreadyOrFull":
    "Já te inscreveste, ou esta oportunidade já está completa.",
  "volunteerDetail.error.generic":
    "Algo correu mal ao enviar o teu interesse. Tenta outra vez.",
  "volunteerDetail.main.whyTitle": "Porque é que esta função <em>importa</em>",
  "volunteerDetail.main.tasksTitle": "O que vais <em>fazer, na prática</em>",
  "volunteerDetail.main.commitmentTitle":
    "O <em>compromisso</em>, com honestidade",
  "volunteerDetail.main.goodForTitle": "Para <em>quem é indicada</em>",
  "volunteerDetail.main.teamTitle": "Quem <em>já está cá</em>",
  "volunteerDetail.sidebar.appliedTitle": "Estás <em>na lista.</em>",
  // PRD-262 / PRD-260: ver a nota no catálogo EN.
  "volunteerDetail.sidebar.connectToMessage": "Ligar à equipa",
  "volunteerDetail.sidebar.signInToApply": "Inicia sessão para te candidatares",
  "volunteerDetail.sidebar.messageTeam": "Enviar mensagem à equipa",
  "volunteerDetail.sidebar.withdrawing": "A retirar…",
  "volunteerDetail.sidebar.withdraw": "Retirar o meu interesse",
  "volunteerDetail.sidebar.applyHeading": "Candidatar",
  "volunteerDetail.sidebar.spotsFilled": "Vagas ocupadas",
  "volunteerDetail.sidebar.roleFull": "Esta função está completa",
  "volunteerDetail.sidebar.sending": "A enviar a tua candidatura…",
  "volunteerDetail.sidebar.applyCta": "Candidatar",
  "volunteerDetail.sidebar.askTeam": "Perguntar à equipa",
  "volunteerDetail.sidebar.footNote":
    "Pessoas voluntárias antigas: <a>usa o perfil do ano passado</a> · salta este ecrã.",
  "volunteerDetail.sidebar.partnershipLabel": "Em parceria com",
  "volunteerDetail.sidebar.partnershipLink": "Sobre a parceria",
  "volunteerDetail.sidebar.communityLabel": "Organizado com",
  "volunteerDetail.sidebar.communityLink": "Sobre esta comunidade",
  "volunteerDetail.sidebar.editCta": "Editar esta oportunidade",
  "volunteerDetail.sidebar.notRightFit": "Não é a vaga certa para ti?",
  "volunteerDetail.sidebar.otherWays": "Outras formas de ajudar agora:",
  "volunteerDetail.signupModal.ariaLabel": "Candidatar a {role}",
  "volunteerDetail.signupModal.eyebrow": "A tua candidatura",
  "volunteerDetail.signupModal.title":
    "Conta-nos porque serias uma boa escolha",
  "volunteerDetail.signupModal.sub":
    "Algumas frases já chegam: a equipa lê todas as candidaturas.",
  "volunteerDetail.signupModal.noteLabel":
    "Porque queres ser voluntário/a nesta função?",
  "volunteerDetail.signupModal.notePlaceholder":
    "Partilha o que te atrai nisto, ou experiência relevante…",
  "volunteerDetail.signupModal.cancel": "Cancelar",
  "volunteerDetail.signupModal.submit": "Enviar candidatura",
  "volunteerDetail.signupModal.sending": "A enviar…",
  "volunteerDetail.report.cta": "Denunciar esta oportunidade",
  "volunteerDetail.report.ariaLabel":
    "Denunciar a oportunidade {role} em {org}",

  // ── Detalhe do Parceiro — chrome da página. O conteúdo sobre/trabalho
  //    conjunto/linha do tempo/como trabalhamos, as estatísticas, e os
  //    contactos são conteúdo próprio de cada organização parceira
  //    (partnerDetails.dataA/B.tsx) — ficam em inglês, o mesmo precedente da
  //    página de listagem de Parceiros.
  "partnerDetail.loadError":
    "Não conseguimos carregar este parceiro agora. Tenta outra vez.",
  "partnerDetail.backCta": "Todos os parceiros",
  "partnerDetail.meta.title": "{name}: uma organização parceira da QueerPulse",
  "partnerDetail.meta.loadingTitle": "A carregar um parceiro · QueerPulse",
  "partnerDetail.meta.errorTitle": "Parceiro indisponível · QueerPulse",
  "partnerDetail.tab.about": "Sobre",
  "partnerDetail.tab.work": "Trabalho conjunto",
  "partnerDetail.tab.timeline": "Linha do tempo",
  "partnerDetail.tab.how": "Como trabalhamos juntos",
  "partnerDetail.sidebar.atGlance": "De relance",
  "partnerDetail.sidebar.contactDirectly": "Contacta {name} diretamente",
  "partnerDetail.sidebar.becomeTitle": "Torna-te parceiro",
  "partnerDetail.sidebar.becomeBody":
    "És uma organização que devia estar operacionalmente ligada à QueerPulse? Somos pequenos e lentos nisto, escreve-nos.",
  "partnerDetail.sidebar.becomeCta": "Entra em contacto",

  // ── Contacto — chrome da página. Todo o conteúdo é escrito pela plataforma
  //    (formulário/vias de contacto).
  "contact.meta.title": "Contacta a QueerPulse: geral, segurança, imprensa",
  "contact.meta.description":
    "Fala com a QueerPulse, uma equipa pequena que lê e responde a cada mensagem pessoalmente. Vias para perguntas gerais, preocupações de segurança, imprensa e parcerias.",
  "contact.eyebrow": "Lemos tudo",
  "contact.hero.title": "Fala <em>connosco.</em>",
  "contact.hero.body":
    "Somos uma equipa pequena e respondemos às mensagens nós próprios. Não é um sistema automático, nem uma fila de suporte. Escolhe a via que faz mais sentido para o que precisas de dizer.",
  "contact.routes.cta": "Escreve-nos",
  "contact.routes.general.title": "Contacto geral",
  "contact.routes.general.desc":
    "Tudo o que não encaixa noutro lado: perguntas, feedback, apresentações, ideias que achas que devíamos ouvir.",
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
  "contact.form.topic.account": "Acesso à conta ou segurança",
  "contact.form.topic.safety": "Preocupação de segurança",
  "contact.form.topic.accessibility": "Barreira de acessibilidade",
  "contact.form.topic.press": "Pedido de imprensa ou investigação",
  "contact.form.topic.partnership": "Proposta de parceria",
  "contact.form.topic.other": "Outra coisa",
  "contact.form.messageLabel": "A tua mensagem",
  "contact.form.messagePlaceholder":
    "Escreve com naturalidade. Não há modelo nem limite de palavras.",
  "contact.form.sendCta": "Enviar",
  "contact.form.sendingCta": "A enviar…",
  "contact.form.error":
    "Algo correu mal ao enviar. Tenta novamente ou escreve-nos diretamente.",
  "contact.outro.title": "Construído em Lisboa, <em>com cuidado.</em>",
  "contact.outro.sub":
    "A QueerPulse é uma rede pequena, sustentada pelas pessoas que a usam. O teu feedback ajuda a mantê-la boa.",
  "contact.outro.backCta": "Voltar à sala",

  // ── Para Organizações — chrome da página de parcerias. Os quatro registos
  //    de PARTNERS (nome/tempo de parceria/descrição) e o testemunho de
  //    Filipa Mendes são conteúdo próprio de cada organização — ficam em
  //    inglês, o mesmo precedente da página de listagem de Parceiros.
  "forOrgs.meta.title": "Parcerias com a QueerPulse: parcerias operacionais",
  "forOrgs.meta.description":
    "Como as organizações podem fazer parceria com a QueerPulse através de colaborações operacionais assentes em trabalho partilhado, e como o processo começa.",
  "forOrgs.hero.eyebrow": "Para organizações · parcerias",
  "forOrgs.hero.title": "Trabalha <em>connosco,</em> não <em>sobre nós.</em>",
  "forOrgs.hero.dek":
    "As parcerias da QueerPulse são <b>operacionais e práticas</b>. Não vendemos acesso, não fazemos conteúdo patrocinado, nem co-branding pelo simples efeito. <em>Construímos ligações entre organizações que já fazem este trabalho.</em> Abaixo: como são essas ligações na prática, com quem já trabalhamos, e como começar uma conversa.",
  "forOrgs.hero.notDoTitle": "O que não fazemos",
  "forOrgs.notDo.prideCampaigns":
    "<b>Campanhas no mês do Orgulho.</b> Nunca as fazemos, em junho ou em qualquer mês. As pessoas da comunidade sairiam, e com razão.",
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
    "Café em Lisboa se estiveres cá, ou vídeo. Falamos sobre como a ligação funcionaria na prática.",
  "forOrgs.process.step3.title": "Proposta de duas páginas",
  "forOrgs.process.step3.body":
    "Um de nós faz o rascunho; ambos os lados editam. Inclui <b>condições de saída</b>, cláusulas de discordância pública, e o fluxo de dinheiro.",
  "forOrgs.process.step4.title": "Aprovação da Assembleia",
  "forOrgs.process.step4.body":
    "As parcerias operacionais vão à Assembleia mensal. A adesão de Sustentadores pronuncia-se. <em>~10% das parcerias são vetadas.</em>",
  "forOrgs.proof.title": "Já a trabalhar <em>connosco</em>",
  "forOrgs.proof.sub":
    "Quatro parceiros representativos, cada um num nível diferente. A lista completa está em Parceiros.",
  "forOrgs.proof.viewCta": "Ver parceiro",
  "forOrgs.tiers.title": "O que <em>oferecemos</em>",
  "forOrgs.tiers.sub":
    "Três níveis, cada um um tipo diferente de relação. Todos incluem o essencial: revisão prévia à publicação, divulgação transparente do financiamento, e a possibilidade de qualquer um dos lados discordar publicamente.",
  "forOrgs.tiers.employer.list1": "Vagas ilimitadas · <b>publicadas em 24h</b>",
  "forOrgs.tiers.employer.list2":
    "Selo de empregador verificado no perfil da empresa",
  "forOrgs.tiers.employer.list3":
    "Uma avaliação anual de cultura conduzida por uma pessoa da comunidade (anónima)",
  "forOrgs.tiers.employer.list4": "Presença nas Avaliações de Empregadores",
  "forOrgs.tiers.employer.list5":
    "Horário de atendimento trimestral sobre contratação com dois elementos da equipa",
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
  "forOrgs.tiers.funder.list1":
    "Relatórios específicos do programa · trimestrais",
  "forOrgs.tiers.funder.list2":
    "Crédito na página do programa em texto simples",
  "forOrgs.tiers.funder.list3":
    "Sem presença em toda a plataforma, sem co-branding",
  "forOrgs.tiers.funder.list4": "Auditoria independente anual incluída",
  "forOrgs.tiers.funder.list5":
    "Discriminação pública no relatório de transparência",
  // PRD-266: ver a nota no catálogo EN.
  "forOrgs.apply.lead":
    "Diz-nos quem és e levamos-te à candidatura de parceria. É um formulário só, entra na fila de parcerias, e podes ver em que ponto está a partir da tua conta quando quiseres.",
  "forOrgs.apply.note":
    "Lemos todas as candidaturas, por mais rascunho que sejam. A resposta chega dentro da app, na tua página de submissões e nas notificações. Nunca enviamos email.",
  "forOrgs.cta.title": "Começa uma <em>conversa.</em>",
  "forOrgs.cta.list1": "Para parcerias, normalmente ligamos antes de escrever",
  "forOrgs.cta.list2":
    "Candidaturas a financiamento: inclui uma página de resumo",
  "forOrgs.cta.pressInquiry": "Pedidos de imprensa: <a>Kit de Imprensa</a>",
  "forOrgs.cta.partnerQuestion":
    "Já tens uma parceria connosco e alguma pergunta? <a>Contacta-nos</a>",
  "forOrgs.form.orgLabel": "Organização",
  "forOrgs.form.orgPlaceholder": "A tua organização",

  // ── Diretório — chrome do diretório de negócios + página de detalhe. Os
  //    registos de locais (`directoryPlaces.ts`: nomes, taglines,
  //    avaliações, biografias dos donos) são conteúdo próprio de cada
  //    negócio — ficam em inglês, o mesmo precedente das biografias/
  //    avaliações fictícias de pessoas noutras páginas.
  "directory.meta.title": "Diretório de negócios locais | QueerPulse",
  "directory.meta.description":
    "Negócios queer e profissionais queer-friendly em Lisboa, avaliados e mantidos pela comunidade.",
  "directory.hero.eyebrow": "Diretório de negócios queer",
  "directory.hero.title": "Encontra <em>os lugares da tua gente.</em>",
  "directory.hero.sub":
    "Negócios queer e profissionais queer-friendly em Lisboa. Avaliados pela comunidade, mantidos pela comunidade. Quer tenhas acabado de chegar, quer já cá estejas há anos.",
  // "atualizado mensalmente" era uma cadência que nada agendava, media ou
  // conseguia mostrar: o `DirectoryCardDTO` não traz data de atualização, por
  // isso a página não tinha como a sustentar. Substituída por quem mantém o
  // diretório, que os fluxos de reivindicação, confirmação e contestação
  // sustentam mesmo.
  "directory.hero.note":
    "Verificado pela comunidade · mantido por membros e pelos próprios negócios",
  "directory.hero.cta": "Regista o teu negócio",
  "directory.search.placeholder": "Pesquisa por nome, bairro, ou tipo…",
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
  "directory.loadingMore": "A carregar mais lugares…",
  // Pluralizado em `count`, definido no componente como o tamanho do conjunto
  // que está a ser contado. A chave simples fica como recurso.
  "directory.count": "A mostrar <b>{shown}</b> de {total} lugares",
  "directory.count_one": "A mostrar <b>{shown}</b> de {total} lugar",
  "directory.count_other": "A mostrar <b>{shown}</b> de {total} lugares",
  // PRD-246. A contagem citava o total do SERVIDOR contra um número já filtrado
  // no cliente, por isso lia-se "A mostrar 3 de 120 lugares", uma frase cujos
  // dois números descrevem conjuntos diferentes. Quando um filtro só do cliente
  // está a reduzir um conjunto ainda incompleto, a contagem diz o que está
  // mesmo a contar e o total do diretório passa para a nota ao lado.
  "directory.countLoaded":
    "A mostrar <b>{shown}</b> de {loaded} lugares carregados até agora",
  "directory.countLoaded_one":
    "A mostrar <b>{shown}</b> de {loaded} lugar carregado até agora",
  "directory.countLoaded_other":
    "A mostrar <b>{shown}</b> de {loaded} lugares carregados até agora",
  "directory.countLoadedTotal": "{total} em todo o diretório",
  "directory.empty.title": "Nenhum lugar corresponde a esses filtros",
  "directory.empty.body":
    "Tenta uma categoria mais ampla, menos ambientes ou outra pesquisa, ou limpa os filtros para ver tudo.",
  // PRD-246. O mesmo estado vazio, para quando ainda faltam páginas por chegar.
  "directory.emptyPartial.title": "Ainda não há correspondências",
  "directory.emptyPartial.body":
    "Nenhum dos {loaded} lugares carregados até agora corresponde a esses filtros, e ainda estão a chegar mais. Espera um momento, ou limpa os filtros para ver tudo.",
  "directory.noListings.title": "Ainda não há lugares",
  "directory.noListings.body":
    "Este diretório cresce a partir da comunidade. Se tens ou conheces um lugar queer-owned ou queer-friendly em Lisboa, sê o primeiro a adicioná-lo.",
  // Mostrado quando a leitura do diretório falhou. Separado do `noListings`
  // acima: uma falha apresentada como estado vazio diria a quem lê que Lisboa
  // não tem lugares queer-owned (DES-25).
  "directory.loadError.title": "Não foi possível carregar o <em>diretório</em>",
  "directory.loadError.body":
    "Os lugares não chegaram desta vez. Os teus filtros continuam ativos, por isso tenta novamente daqui a pouco.",
  "directory.clearFilters": "Limpar filtros",
  "directory.clearAll": "Limpar tudo",
  "directory.activeFilters": "Filtrado por",
  "directory.removeFilter": "Remover filtro",
  "directory.onMap": "{count} no mapa",
  "directory.sort.label": "Ordenar",
  "directory.sort.default": "Em destaque",
  // A mesma opção, com outro nome enquanto a localização está ligada: com uma
  // posição conhecida, a ordem em destaque É a ordem por proximidade.
  "directory.sort.nearest": "Mais perto primeiro",
  "directory.sort.name": "A–Z",
  "directory.sort.hood": "Por bairro",
  "directory.badge.queerOwnedVerified": "Negócio queer verificado",
  "directory.badge.queerOwned": "Negócio queer",
  "directory.badge.friendly": "Acolhe pessoas LGBTQ+",
  "directory.card.memberRun": "Gerido por uma pessoa da comunidade",
  "directory.card.online": "Online",
  "directory.card.visit": "Visitar",
  "directory.card.verifiedBadge": "Espaço seguro verificado",
  // O selo de espaço seguro no cartão, nos dois estados que não são um
  // "verificado" simples. Ambos falam do SELO, nunca do espaço.
  "directory.card.safeSpaceDueBadge":
    "Espaço seguro verificado, com a verificação anual pendente",
  "directory.card.safeSpacePausedBadge":
    "Selo de espaço seguro em pausa enquanto voltamos a verificar",
  "directory.card.photoComing": "Foto brevemente",
  "directory.card.openTill": "Aberto até às {time}",
  "directory.card.closedNow": "Fechado",
  "directory.card.openNow": "Aberto agora",
  "directory.card.closingSoon": "Fecha às {time}",
  "directory.card.state.temporarily_closed": "Temporariamente fechado",
  "directory.card.state.permanently_closed": "Fechado definitivamente",
  "directory.card.state.moved": "Mudou de morada",
  "directory.card.saveAriaLabel": "Guardar {name}",
  "directory.card.unsaveAriaLabel": "Remover {name} das guardadas",
  // As necessidades a que um local respondeu SIM, no cartão da grelha. Nunca
  // uma lista completa: um "não" e um "ninguém nos disse" são respostas
  // diferentes e ambas precisam do espaço que a página do local lhes dá.
  "directory.card.access": "Acessibilidade confirmada por este local",
  "directory.card.accessMore_one": "mais {count}",
  "directory.card.accessMore_other": "mais {count}",
  "directory.card.savedToast": "Guardaste {name}",
  "directory.card.unsavedToast": "Removeste {name} dos guardados",
  "directory.submitStrip.title":
    "Conheces um lugar que devia estar <em>aqui?</em>",
  "directory.submitStrip.body":
    "Se tens ou conheces um negócio queer ou queer-friendly em Lisboa que pertence a este diretório, conta-nos. Revemos todas as sugestões antes de as publicar.",
  "directory.submitStrip.cta": "Regista o teu negócio",
  "directory.verify.eyebrow": "Verificado pela comunidade",
  "directory.verify.title": "Como funciona a <em>verificação.</em>",
  "directory.verify.lead":
    "O selo de verificação não é auto-declarado. Um membro propõe um espaço, outros visitam-no e avaliam-no segundo um conjunto fixo de critérios, e cada selo volta à fila de revisão um ano depois de ser atribuído, por isso também o pode perder.",
  "directory.verify.cta": "Ver a história de confiança completa",
  "directory.verify.pillar.nominate.title": "Proposto por membros",
  "directory.verify.pillar.nominate.body":
    "Qualquer membro pode propor um espaço para avaliação.",
  "directory.verify.pillar.review.title": "Avaliado de forma independente",
  "directory.verify.pillar.review.body":
    "Membros verificados visitam-no e avaliam-no segundo os mesmos critérios: casas de banho, pessoal, acessibilidade e avaliações reais.",
  "directory.verify.pillar.recheck.title": "Reavaliado todos os anos",
  "directory.verify.pillar.recheck.body":
    "Nenhum selo é permanente. Qualquer membro pode sinalizar um espaço, e o selo pode ser retirado.",
  "directory.detail.breadcrumbAria": "Trilho de navegação",
  "directory.detail.breadcrumbHome": "Diretório",
  "directory.detail.relatedTitle": "Mais {category} por perto",
  "directory.detail.badge.verifiedOwned": "Negócio queer verificado",
  "directory.detail.badge.owned": "Negócio queer",
  "directory.detail.badge.friendly": "Acolhe pessoas LGBTQ+",
  "directory.detail.reviewsCount": "· {count} avaliações",
  "directory.detail.newBadge": "Novo",
  "directory.detail.onlineBusiness": "Só online",
  "directory.detail.whatItIsTitle": "O que <em>é, na prática.</em>",
  "directory.detail.offersTitle": "O que este espaço <em>oferece</em>",
  "directory.detail.goodForSub": "Como {name} descreve.",
  "directory.detail.hoursTitle": "Horário",
  "directory.detail.today": "Hoje",
  "directory.detail.hoursClosed": "Encerrado",
  "directory.detail.openNow": "Aberto agora",
  "directory.detail.closedNow": "Encerrado",
  "directory.detail.closingSoon": "Fecha às {time}",
  "directory.detail.formerAddress": "Morada anterior",
  "directory.detail.operating.temporarily_closed.title":
    "Temporariamente fechado",
  "directory.detail.operating.temporarily_closed.lead":
    "Este espaço não está aberto de momento. Os horários abaixo são os habituais, para quando reabrir.",
  "directory.detail.operating.temporarily_closed.since": "Fechado desde {date}",
  "directory.detail.operating.temporarily_closed.chip":
    "Temporariamente fechado",
  "directory.detail.operating.temporarily_closed.hoursNote":
    "Estes são os horários habituais. Estão suspensos enquanto o espaço estiver fechado.",
  "directory.detail.operating.permanently_closed.title":
    "Fechado definitivamente",
  "directory.detail.operating.permanently_closed.lead":
    "Este negócio fechou de vez. A página fica aqui para que as avaliações, as fotografias e a história que os membros construíram à volta dele se mantenham.",
  "directory.detail.operating.permanently_closed.since": "Fechou a {date}",
  "directory.detail.operating.moved.title": "Este negócio mudou de morada",
  "directory.detail.operating.moved.lead":
    "Já não funciona na morada indicada nesta página.",
  "directory.detail.operating.moved.since": "Mudou a {date}",
  "directory.detail.operating.moved.newAddress": "Nova morada: {address}",
  "directory.detail.operating.moved.seeSuccessor": "Ver a página de {name}",
  "directory.detail.exceptions.title": "Alterações previstas",
  "directory.detail.freshness.confirmedBy":
    "Dados confirmados por {name} a {date}",
  "directory.detail.freshness.confirmed": "Dados confirmados a {date}",
  "directory.detail.freshness.staleBy":
    "{name} confirmou estes dados pela última vez a {date}. Podem ter mudado entretanto.",
  "directory.detail.freshness.stale":
    "Estes dados foram confirmados pela última vez a {date}. Podem ter mudado entretanto.",
  "directory.detail.freshness.unconfirmed":
    "Ainda ninguém confirmou estes dados. Vale a pena confirmar antes de se deslocar.",
  "directory.detail.reviewsTitle":
    "Avaliações da comunidade · <em>{count}</em>",
  "directory.detail.reviews.emptySub":
    "Ainda sem avaliações. Sê a primeira pessoa a deixar uma.",
  "directory.detail.ratingBreakdown": "Distribuição das avaliações",
  "directory.detail.starsCount": "{stars} estrelas, {count} avaliações",
  "directory.detail.review.formTitle": "Já cá estiveste? Deixa uma avaliação",
  "directory.detail.review.starsAria": "A tua avaliação",
  "directory.detail.review.starAria": "{count} de 5 estrelas",
  "directory.detail.review.placeholder":
    "Conta como foi a tua visita: o que resultou e para quem é.",
  "directory.detail.review.starsRequiredHint":
    "Escolhe uma classificação em estrelas para desbloquear o botão.",
  "directory.detail.review.submit": "Publicar avaliação",
  "directory.detail.review.submitting": "A publicar…",
  "directory.detail.review.successToast":
    "Obrigade. A tua avaliação está publicada.",
  "directory.detail.review.errorToast":
    "Não foi possível publicar a tua avaliação. Tenta novamente.",
  "directory.detail.review.signInPrompt":
    "Inicia sessão para avaliar este espaço.",
  "directory.detail.review.signInCta": "Iniciar sessão",
  "directory.detail.review.cancel": "Cancelar",
  "directory.detail.review.editCta": "Editar",
  "directory.detail.review.editTitle": "Editar a tua avaliação",
  "directory.detail.review.saveEdit": "Guardar alterações",
  "directory.detail.review.savingEdit": "A guardar…",
  "directory.detail.review.editSuccessToast": "A tua avaliação foi atualizada.",
  "directory.detail.review.editErrorToast":
    "Não foi possível guardar as alterações. Tenta novamente.",
  "directory.detail.review.photo.add": "Adicionar uma foto",
  "directory.detail.review.photo.change": "Mudar a foto",
  "directory.detail.review.photo.remove": "Remover",
  "directory.detail.review.photo.uploading": "A carregar…",
  "directory.detail.review.photo.error":
    "Não foi possível carregar essa foto. Tenta novamente.",
  "directory.detail.review.photo.previewAlt":
    "A foto que vais juntar a esta avaliação",
  "directory.detail.reply.ownerResponseTitle":
    "Resposta de quem gere este espaço",
  "directory.detail.reply.replyCta": "Responder",
  "directory.detail.reply.editReplyCta": "Editar resposta",
  "directory.detail.reply.editedAfterReply":
    "Esta avaliação foi editada depois de esta resposta ser publicada.",
  "directory.detail.reply.placeholder":
    "Escreve uma resposta pública a esta avaliação…",
  "directory.detail.reply.save": "Guardar resposta",
  "directory.detail.reply.cancel": "Cancelar",
  "directory.detail.reply.savingLabel": "A guardar…",
  "directory.detail.reply.successToast": "A tua resposta está publicada.",
  "directory.detail.reply.errorToast":
    "Não foi possível publicar a tua resposta. Tenta novamente.",
  "directory.detail.reviews.sortLabel": "Ordenar",
  "directory.detail.reviews.sortNewest": "Mais recentes",
  "directory.detail.reviews.sortHighest": "Melhor avaliadas",
  "directory.detail.reviews.sortLowest": "Pior avaliadas",
  "directory.detail.reviews.sortedByNewest": "Ordenado por mais recentes.",
  "directory.detail.reviews.sortedByHighest": "Ordenado por melhor avaliadas.",
  "directory.detail.reviews.sortedByLowest": "Ordenado por pior avaliadas.",
  "directory.detail.reviews.filterAria":
    "Filtrar avaliações por número de estrelas",
  "directory.detail.reviews.filterAll": "Todas as avaliações",
  "directory.detail.reviews.filterStars_one": "{count} estrela",
  "directory.detail.reviews.filterStars_other": "{count} estrelas",
  "directory.detail.reviews.edited": "editada",
  "directory.detail.reviews.helpfulCta": "Útil",
  "directory.detail.reviews.helpfulAria_one":
    "Útil. {count} pessoa marcou esta avaliação como útil.",
  "directory.detail.reviews.helpfulAria_other":
    "Útil. {count} pessoas marcaram esta avaliação como útil.",
  "directory.detail.reviews.helpfulSignIn":
    "Inicia sessão para marcar esta avaliação como útil",
  "directory.detail.reviews.helpfulError":
    "Não foi possível registar isso. Tenta novamente.",
  "directory.detail.reviews.photoAlt": "Foto da avaliação de {name}",
  "directory.detail.reviews.photoOpen": "Abrir a foto da avaliação de {name}",
  "directory.detail.reviews.sortHelpful": "Mais úteis",
  "directory.detail.reviews.sortedByHelpful": "Ordenado por mais úteis.",
  "directory.detail.reviews.sortOldest": "Mais antigas",
  "directory.detail.reviews.sortedByOldest": "Ordenado por mais antigas.",
  "directory.detail.reviews.filterContentAria":
    "Filtrar avaliações pelo que incluem",
  "directory.detail.reviews.filterPhotos": "Com fotos",
  "directory.detail.reviews.filterReply": "Com resposta",
  "directory.detail.reviews.noMatchingReviews":
    "Ainda não há avaliações que correspondam a estes filtros.",
  "directory.detail.reviews.clearFilters": "Limpar filtros",
  "directory.detail.reviews.noStarReviews":
    "Ainda não há avaliações de {count} estrelas.",
  "directory.detail.reviews.ratingAria":
    "Classificado com {count} em 5 estrelas",
  "directory.detail.reviews.readMore": "Ler mais",
  "directory.detail.reviews.showLess": "Mostrar menos",
  "directory.detail.visitTitle": "Onde fica",
  "directory.detail.accessTitle": "Entrar e ser compreendido",
  "directory.detail.accessSub":
    "Conforme {name} declarou. Pergunta se precisares de ter a certeza.",

  // ── Respostas estruturadas de acessibilidade. Três estados, e os três são
  //    informação: `unknown` nunca aparece como "não" e nunca desaparece.
  "directory.detail.accessibility.noteLabel": "Nas palavras de quem gere",
  "directory.detail.accessibility.noteLabelNamed": "Nas palavras de {name}",
  "directory.detail.accessibility.unansweredLine_one":
    "Falta responder a uma pergunta. Ninguém nos disse nada num sentido nem no outro, por isso pergunta antes de ires se isso for importante para ti.",
  "directory.detail.accessibility.unansweredLine_other":
    "Faltam responder a {count} perguntas. Ninguém nos disse nada num sentido nem no outro, por isso pergunta antes de ires se alguma delas for importante para ti.",

  // ── Serviços com preço. A faixa de preço no cabeçalho continua a ser o
  //    sinal rápido; isto diz o que essa faixa compra.
  "directory.detail.services.title": "Quanto <em>custa.</em>",
  "directory.detail.services.sub":
    "Preços tal como o negócio os escreveu. Pergunta se precisares de um orçamento para algo específico.",
  "directory.detail.services.subNamed":
    "Preços tal como {name} os escreveu. Pergunta se precisares de um orçamento para algo específico.",

  // ── A prova por trás do selo de negócio queer verificado, escrita como
  //    irmã da linha de verificação do espaço seguro ao lado.
  "directory.detail.queerOwned.byOnDate":
    "Negócio queer, confirmado por <strong>{verifier}</strong> a <strong>{date}</strong>.",
  "directory.detail.queerOwned.by":
    "Negócio queer, confirmado por <strong>{verifier}</strong>.",
  "directory.detail.queerOwned.onDate":
    "Negócio queer, confirmado pela última vez a <strong>{date}</strong>.",
  "directory.detail.queerOwned.nextCheck": "A confirmar de novo até {date}.",

  // ── O compromisso afirmativo, DECLARADO. Todos os anúncios daqui
  //    concordaram com ele, por isso isto é um facto sobre o diretório.
  //    Nunca um selo por anúncio e nunca um filtro de pesquisa: qualquer um
  //    dos dois faria um mínimo obrigatório parecer uma opção.
  "directory.detail.baseline.lead":
    "Todos os negócios aqui se comprometeram a acolher e <em>servir pessoas LGBTQ+.</em>",
  "directory.detail.baseline.condition":
    "Concordar com isso é a condição para sequer aparecer nesta lista. Todos os negócios do diretório assumiram o mesmo compromisso, por isso não vais encontrar isto assinalado numas páginas e ausente noutras.",
  "directory.detail.baseline.scope":
    "O compromisso é sobre a forma como um negócio trata as pessoas que serve, e sobre agir quando alguém no espaço fica aquém. Não dá a ninguém autorização para recusar uma pessoa por quem ela é.",
  "directory.detail.nearby.title": "A curta distância a pé",
  "directory.detail.nearby.sub":
    "Outros sítios que podes juntar à mesma noite, medidos a partir de {name}.",
  "directory.detail.nearby.metres": "{distance} m",
  "directory.detail.nearby.kilometres": "{distance} km",
  "directory.detail.visitWebsite": "Visitar o site",
  "directory.detail.getInTouch": "Entrar em contacto",
  "directory.detail.backToDirectory": "Voltar ao diretório",
  "directory.detail.claimCta": "És tu que geres este espaço? Reivindica-o",
  "directory.detail.claimsFiledLink": "Ver os pedidos que enviaste",
  "directory.detail.loader.ariaLabel": "A abrir este espaço",
  "directory.detail.loader.title": "A abrir este espaço",
  "directory.detail.loader.caption": "Vale a pena ver tudo de uma vez.",
  "directory.detail.loader.steps.fetchingListing": "A encontrar o negócio",
  "directory.detail.loader.steps.preparingDetails": "A organizar os detalhes",
  "directory.detail.loader.steps.loadingPhotos": "A trazer as fotografias",
  "directory.detail.notFound.title": "Não encontrámos este espaço",
  "directory.detail.notFound.body":
    "Este negócio pode ter sido removido, ou o link pode estar desatualizado. Todos os outros lugares abertos a nós continuam no diretório.",
  "directory.detail.notFound.cta": "Explorar o diretório",
  "directory.detail.reportCta": "Denunciar este negócio",
  "directory.detail.reportAriaLabel": "Denunciar {name}",
  "directory.detail.reportReview.cta": "Denunciar",
  "directory.detail.reportReview.title": "Denunciar esta avaliação",
  "directory.detail.reportReview.sub":
    "Diz-nos o que está errado na avaliação de {name}. Um moderador analisa todas as denúncias, e não será dito quem a fez.",
  "directory.detail.reportReview.reasonGroupAria": "Motivo da denúncia",
  "directory.detail.reportReview.cancel": "Cancelar",
  "directory.detail.reportReview.sendCta": "Enviar denúncia",
  "directory.detail.reportReview.sending": "A enviar…",
  "directory.detail.reportReview.confirmTitle":
    "Agradecemos. <em>Estamos a tratar disso.</em>",
  "directory.detail.reportReview.confirmBody":
    "Um moderador vai analisar esta avaliação.",
  "directory.detail.reportReview.done": "Concluído",
  "directory.detail.reportReview.errorTitle":
    "Não foi possível enviar a denúncia",
  "directory.detail.reportReview.errorBody":
    "Algo correu mal do nosso lado. Por favor, tenta novamente.",
  "directory.detail.reportReview.retryCta": "Tentar novamente",
  "directory.detail.reportQuestion.title": "Denunciar esta pergunta",
  "directory.detail.reportQuestion.sub":
    "Diz-nos o que está errado nesta pergunta ou na resposta por baixo. Um moderador analisa todas as denúncias, e não será dito quem a fez.",
  "directory.detail.questions.title":
    "Pergunta a quem gere, <em>em público</em>",
  "directory.detail.questions.sub_one":
    "{count} pergunta, da mais recente para a mais antiga.",
  "directory.detail.questions.sub_other":
    "{count} perguntas, da mais recente para a mais antiga.",
  "directory.detail.questions.emptySub":
    "Ainda ninguém perguntou nada por aqui.",
  "directory.detail.questions.emptyBody":
    "Faz a primeira pergunta. Tudo o que quiseres saber antes de ir: como se entra, como é o espaço, se a cozinha ainda serve às dez.",
  "directory.detail.questions.askLabel": "Pergunta em público",
  "directory.detail.questions.askPlaceholder":
    "O que gostarias de saber antes de ir?",
  "directory.detail.questions.askHint":
    "Toda a gente que lê esta ficha vê a tua pergunta e a resposta.",
  "directory.detail.questions.askCta": "Perguntar",
  "directory.detail.questions.asking": "A enviar…",
  "directory.detail.questions.successToast": "A tua pergunta está publicada.",
  "directory.detail.questions.errorGeneric":
    "Não foi possível enviar a tua pergunta. Tenta novamente.",
  "directory.detail.questions.signInPrompt":
    "Inicia sessão para fazer uma pergunta a este espaço.",
  "directory.detail.questions.signInCta": "Iniciar sessão",
  "directory.detail.questions.ownerNote":
    "Esta ficha é tua. Responde a qualquer pergunta aqui em baixo e a tua resposta fica visível para toda a gente.",
  "directory.detail.questions.awaitingAnswer": "Ainda sem resposta.",
  "directory.detail.questions.answeredByOwner": "{name} respondeu",
  "directory.detail.questions.answeredByModerator": "Moderação da QueerPulse",
  "directory.detail.questions.moderatorNote":
    "Esta resposta foi escrita por um moderador da QueerPulse. O negócio ainda não respondeu aqui.",
  "directory.detail.questions.answerCta": "Responder",
  "directory.detail.questions.editAnswerCta": "Editar resposta",
  "directory.detail.questions.answerPlaceholder":
    "Responde a esta pergunta em público…",
  "directory.detail.questions.answerSave": "Publicar resposta",
  "directory.detail.questions.answerSaving": "A publicar…",
  "directory.detail.questions.answerCancel": "Cancelar",
  "directory.detail.questions.answerSuccessToast":
    "A tua resposta está publicada.",
  "directory.detail.questions.answerErrorToast":
    "Não foi possível publicar a tua resposta. Tenta novamente.",
  "directory.detail.questions.cardAria": "Pergunta de {name}",
  "directory.detail.questions.seeAll": "Ver todas as perguntas",
  "directory.detail.questions.loadMore": "Carregar mais perguntas",
  "directory.detail.questions.loadingMore": "A carregar…",
  "directory.detail.questions.loadError":
    "Não foi possível carregar as restantes perguntas. Tenta novamente.",
  "directory.detail.suggestEdit.title": "Sugerir uma correção",
  "directory.detail.suggestEdit.sub":
    "Reparaste em algo que não bate certo? Diz à pessoa responsável o que corrigir. Só ela vê.",
  "directory.detail.suggestEdit.fieldLabel": "O que precisa de atenção?",
  "directory.detail.suggestEdit.field.hours": "Horário",
  "directory.detail.suggestEdit.field.address": "Morada",
  "directory.detail.suggestEdit.field.phone": "Número de telefone",
  "directory.detail.suggestEdit.field.website": "Site",
  "directory.detail.suggestEdit.field.description": "Descrição",
  "directory.detail.suggestEdit.field.other": "Outra coisa",
  "directory.detail.suggestEdit.messageLabel": "O que deve mudar?",
  "directory.detail.suggestEdit.messagePlaceholder":
    "Conta o que está desatualizado ou errado, e o que devia dizer em vez disso.",
  "directory.detail.suggestEdit.submit": "Enviar sugestão",
  "directory.detail.suggestEdit.submitting": "A enviar…",
  "directory.detail.suggestEdit.cancel": "Cancelar",
  "directory.detail.suggestEdit.successToast":
    "Obrigade. Vamos passar isto a quem gere este espaço.",
  "directory.detail.suggestEdit.errorToast":
    "Não foi possível enviar a tua sugestão. Tenta novamente.",
  // O valor de substituição, opcional. O balde "outra coisa" não corresponde a
  // nenhuma coluna do anúncio, por isso aceita só texto livre e o campo nunca
  // aparece para ele.
  "directory.detail.suggestEdit.value.optional": "(opcional)",
  "directory.detail.suggestEdit.value.hint":
    "Deixa em branco se só sabes que algo está errado. A nota por si só já ajuda.",
  "directory.detail.suggestEdit.value.rejected":
    "Esse valor não foi aceite: {reason}",
  "directory.detail.suggestEdit.value.proseOnly":
    "Para o resto, descreve a correção na nota acima. Este balde não aceita um valor de substituição.",
  "directory.detail.suggestEdit.value.hours.label":
    "O que é que o horário devia dizer?",
  "directory.detail.suggestEdit.value.hours.placeholder":
    "Ter a dom, 12:00 às 23:00. Fecha à segunda.",
  "directory.detail.suggestEdit.value.address.label": "Qual é a morada certa?",
  "directory.detail.suggestEdit.value.address.placeholder":
    "Rua da Prata 42, 1100-052 Lisboa",
  "directory.detail.suggestEdit.value.phone.label": "Qual é o telefone certo?",
  "directory.detail.suggestEdit.value.phone.placeholder": "+351 21 000 0000",
  "directory.detail.suggestEdit.value.website.label": "Qual é o site certo?",
  "directory.detail.suggestEdit.value.website.placeholder":
    "https://exemplo.pt",
  "directory.detail.suggestEdit.value.description.label":
    "O que é que a descrição devia dizer?",
  "directory.detail.suggestEdit.value.description.placeholder":
    "Uma linha sobre o que é o espaço.",
  "directory.detail.contest.cta":
    "Sugerir uma correção ou reivindicar este negócio",
  "directory.detail.contest.ariaLabel":
    "Sugerir uma correção ou reivindicar {name}",
  "directory.detail.contest.title":
    "Sugerir uma correção ou reivindicar este negócio",
  "directory.detail.contest.sub":
    "Como queres ajudar a manter a página de {name} correta?",
  "directory.detail.contest.suggest.title": "Sugerir uma correção",
  "directory.detail.contest.suggest.desc":
    "Algo está desatualizado ou errado: envia uma correção a quem gere o espaço.",
  "directory.detail.contest.dispute.title": "Contestar este negócio",
  "directory.detail.contest.dispute.desc":
    "Este espaço foi listado sem o seu consentimento, ou não devia estar aqui.",
  "directory.detail.contest.claim.title": "Reivindicar este negócio",
  "directory.detail.contest.claim.desc":
    "És tu que geres este espaço e queres gerir a sua página.",
  "directory.detail.dispute.ariaLabel": "Denunciar ou contestar {name}",
  "directory.detail.dispute.eyebrow": "Denunciar / contestar",
  "directory.detail.dispute.title": "Contestar <em>{name}</em>",
  "directory.detail.dispute.sub":
    "Um espaço pode ser identificado como nosso sem o saber. Diz-nos o que está errado. Uma pessoa moderadora analisa cada contestação, e nada do que escreveres é partilhado publicamente.",
  "directory.detail.dispute.reasonLabel": "Qual é o problema?",
  "directory.detail.dispute.reasonPlaceholder":
    "ex.: Somos nós que gerimos este espaço e nunca fomos consultados sobre esta listagem, ou esta informação está errada.",
  "directory.detail.dispute.emailLabel": "Email de contacto",
  "directory.detail.dispute.emailHelper":
    "Opcional. Adiciona um se uma pessoa moderadora te dever contactar fora da QueerPulse.",
  "directory.detail.dispute.emailPlaceholder": "tu@exemplo.com",
  "directory.detail.dispute.emailError": "Introduz um email válido.",
  "directory.detail.dispute.note":
    "Contestar não remove a listagem por si só. Uma pessoa moderadora analisa primeiro.",
  "directory.detail.dispute.cancel": "Cancelar",
  "directory.detail.dispute.submit": "Enviar à moderação",
  "directory.detail.dispute.submitting": "A enviar…",
  "directory.detail.dispute.errorToast":
    "Não foi possível registar a tua contestação. Tenta novamente.",
  "directory.detail.dispute.successAriaLabel": "Contestação recebida",
  "directory.detail.dispute.successTitle": "Obrigade. Estamos",
  "directory.detail.dispute.successEm": "a tratar disto.",
  "directory.detail.dispute.successBody":
    "Uma moderadora vai analisar a tua denúncia sobre {name}. Se deixaste um email, só o usamos se precisarmos de dar seguimento.",
  "directory.detail.dispute.doneCta": "Concluído",
  "directory.detail.claim.ariaLabel": "Reclamar {name}",
  "directory.detail.claim.eyebrow": "Reclamar esta listagem",
  "directory.detail.claim.title": "Geres o <em>{name}</em>?",
  "directory.detail.claim.sub":
    "Conta-nos um pouco sobre ti e uma moderadora analisa o teu pedido. Se tudo bater certo, passas a gerir a listagem: as avaliações, os detalhes, tudo.",
  "directory.detail.claim.noteLabel":
    "Algo que nos ajude a confirmar que és tu",
  "directory.detail.claim.notePlaceholder":
    "ex.: Sou a pessoa responsável, aqui está como me podes contactar para confirmar.",
  "directory.detail.claim.note":
    "Reclamar não transfere a listagem por si só. Uma pessoa moderadora analisa cada pedido primeiro.",
  "directory.detail.claim.cancel": "Cancelar",
  "directory.detail.claim.submit": "Enviar à moderação",
  "directory.detail.claim.submitting": "A enviar…",
  "directory.detail.claim.errorToast":
    "Não foi possível enviar o teu pedido. Tenta novamente.",
  "directory.detail.claim.successAriaLabel": "Pedido recebido",
  "directory.detail.claim.successTitle": "Recebido. Estamos",
  "directory.detail.claim.successEm": "a tratar disto.",
  "directory.detail.claim.successBody":
    "Uma pessoa moderadora vai analisar o teu pedido sobre {name}. Podes ver em que ponto está sempre que quiseres.",
  "directory.detail.claim.doneCta": "Concluído",
  "directory.detail.claim.policyTitle": "O que ajuda, e quanto tempo demora",
  "directory.detail.claim.policyTurnaround_one":
    "Uma pessoa moderadora decide no prazo de {count} dia depois de enviares.",
  "directory.detail.claim.policyTurnaround_other":
    "Uma pessoa moderadora decide no prazo de {count} dias depois de enviares.",
  "directory.detail.claim.policyHintsLabel":
    "Algo assim na tua nota torna a análise mais rápida:",
  "directory.detail.claim.trackCta": "Ver os pedidos que enviaste",
  "directory.myClaims.backLabel": "Diretório local",
  "directory.myClaims.title": "Pedidos que enviaste",
  "directory.myClaims.sub":
    "Todos os pedidos que fizeste para assumir uma listagem criada por outra pessoa, e em que ponto está cada um.",
  "directory.myClaims.turnaround_one":
    "Cada pedido é decidido no prazo de {count} dia a contar da data de envio.",
  "directory.myClaims.turnaround_other":
    "Cada pedido é decidido no prazo de {count} dias a contar da data de envio.",
  "directory.myClaims.checkBack":
    "Volta aqui sempre que quiseres ver em que ponto está um pedido.",
  "directory.myClaims.loading": "A carregar os teus pedidos…",
  "directory.myClaims.announceEmpty": "Ainda não há pedidos.",
  "directory.myClaims.announceCount_one": "1 pedido.",
  "directory.myClaims.announceCount_other": "{count} pedidos.",
  "directory.myClaims.empty.title": "Ainda não reclamaste nenhuma listagem",
  "directory.myClaims.empty.description":
    "Se geres um espaço que já está no diretório local, abre a página dele e escolhe reclamar a listagem. Uma pessoa moderadora lê todos os pedidos e, se estiver tudo certo, a listagem passa a ser tua: as avaliações, os detalhes, tudo.",
  "directory.myClaims.empty.action": "Ver o diretório local",
  "directory.myClaims.status.pending": "À espera de análise",
  "directory.myClaims.status.approved": "Aprovado",
  "directory.myClaims.status.declined": "Recusado",
  "directory.myClaims.reference": "Referência {reference}",
  "directory.myClaims.filedOn": "Enviado a {date}",
  "directory.myClaims.waiting_one": "À espera há {count} dia.",
  "directory.myClaims.waiting_other": "À espera há {count} dias.",
  "directory.myClaims.decisionDue": "A decisão é esperada até {date}.",
  "directory.myClaims.decisionOverdue":
    "Este pedido era esperado até {date}. Continua na fila e uma pessoa moderadora vai chegar lá.",
  "directory.myClaims.reviewedOn": "Analisado a {date}.",
  "directory.myClaims.outcome.approved":
    "A listagem é tua. Já a podes editar, e fica com os teus espaços no teu perfil.",
  "directory.myClaims.outcome.declined":
    "Este pedido não foi aprovado. Podes voltar a reclamar a listagem se entretanto algo tiver mudado.",
  "directory.myClaims.noteLabel": "O que disseste à moderação",
  "directory.myClaims.viewListing": "Ver {name} no diretório",
  "directory.myClaims.editListing": "Editar {name}",
  "directory.detail.mapAria": "Mapa a mostrar onde fica {name}",
  "directory.detail.languagesLabel": "Idiomas",
  "directory.detail.accessLabel": "Acessibilidade",
  "directory.detail.trust.lastVerifiedLabel": "Última verificação",
  "directory.detail.trust.howLine":
    "Este espaço cumpre os mesmos critérios que qualquer espaço verificado.",
  "directory.detail.trust.howLink": "Como funciona a verificação",
  "directory.detail.whoRunsIt": "Quem gere isto",
  "directory.detail.onQueerPulse": "Na QueerPulse",
  "directory.detail.addedByMember": "Adicionado por um membro",
  "directory.detail.viewProfile": "Ver o perfil de {name}",
  "directory.detail.savedByMembers_one": "Guardado por {count} membro",
  "directory.detail.savedByMembers_other": "Guardado por {count} membros",
  "directory.detail.membersHereLately": "Pessoas por aqui recentemente",
  "directory.detail.upcomingHere": "Próximos eventos aqui",
  "directory.detail.upcoming.addToCalendar": "Adicionar ao calendário:",
  "directory.detail.upcoming.googleCalendar": "Google Calendário",
  "directory.detail.upcoming.downloadIcs": ".ics",
  "directory.detail.galleryAria": "Fotos de {name}",
  "directory.detail.viewPhoto": "Ver foto",
  "directory.detail.noPhotos": "Ainda sem fotos",
  "directory.detail.lightboxClose": "Fechar",
  "directory.detail.prevPhoto": "Foto anterior",
  "directory.detail.nextPhoto": "Foto seguinte",
  "directory.detail.action.directions": "Como chegar",
  "directory.detail.action.call": "Ligar",
  "directory.detail.action.share": "Partilhar",
  "directory.detail.action.save": "Guardar",
  "directory.detail.action.saved": "Guardado",
  "directory.detail.action.linkCopied": "Link copiado",
  "directory.detail.action.shareError":
    "Não foi possível partilhar. Tenta copiar o link",
  "directory.detail.action.saveSignIn":
    "Inicia sessão para guardar este espaço",
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

  // ── Carimbo de revisão (`PageReviewStamp`), partilhado pelas duas páginas
  //    de orientação de Lisboa, /local/visas e /local/arriving. Uma data e uma
  //    equipa com nome, de propósito sem cadência nenhuma: nada agenda uma
  //    releitura destas páginas, por isso "revisto trimestralmente" seria o
  //    mesmo tipo de promessa sem suporte que o carimbo veio substituir.
  //    `{date}` é localizado por `fmt.date`.
  "reviewStamp.reviewed":
    "Revisto pela última vez pela equipa da QueerPulse a {date}.",

  // ── Arriving (guia para quem chega a Lisboa) — apenas chrome da página e
  //    das secções. As descrições de bairros, organizações e comunidades
  //    (`arrivingPage.data.ts`, `arrivingPageCards.data.ts`) são conteúdo de
  //    guia da cidade — ficam em inglês, o mesmo precedente das descrições
  // ── Arriving (guia para quem chega a Lisboa) — agora totalmente traduzido
  //    (LOC-13). As descrições de bairros, saúde, habitação, organizações e a
  //    checklist estavam escritas em inglês dentro de `arrivingPage.data.ts` /
  //    `arrivingPageCards.data.ts` e não podiam ser traduzidas. Passaram para
  //    aqui, nos dois catálogos. Nos ficheiros de dados fica apenas o que não
  //    se traduz: nomes de bairros e de organizações (nomes próprios, iguais
  //    nas duas línguas), destinos e ícones.
  "arriving.meta.title": "Acabaste de chegar a Lisboa? Um guia queer",
  "arriving.meta.description":
    "Um guia prático para pessoas LGBTQ+ recém-chegadas a Lisboa: bairros acolhedores, recursos de saúde, noções básicas de habitação, organizações-chave, e primeiros passos.",
  "arriving.hero.eyebrow": "Acabaste de chegar a Lisboa",
  "arriving.hero.title": "Queer e acabaste de chegar? <em>Bem-vinde.</em>",
  "arriving.hero.body":
    "Esta cidade tem muito para nós: uma comunidade queer real e enraizada, bairros acolhedores, organizações a fazer trabalho sério, e pessoas que te vão mesmo ajudar a assentar. Aqui fica o que convém saber primeiro.",
  "arriving.review.verify":
    "Rendas, taxas e horários mudam mais depressa do que esta página. Trata tudo o que está aqui como ponto de partida e confirma o detalhe atual junto do próprio serviço.",

  // Aparece ao lado de um link cujo destino precisa de conta na QueerPulse,
  // para que quem não tem sessão iniciada saiba antes de clicar.
  "arriving.memberOnly": "Só para membros",

  // ── Checklist de chegada. As marcações ficam guardadas apenas no browser
  //    de quem lê; não há conta por trás nem nada é enviado para lado nenhum.
  "arriving.checklist.eyebrow": "As tuas primeiras duas semanas",
  "arriving.checklist.title": "O que vale a pena tratar <em>cedo.</em>",
  "arriving.checklist.intro":
    "Papelada, médico, um quarto, e uma sala cheia de gente. Vai riscando à medida que avanças. A lista fica guardada neste browser, por isso podes fechar o separador e voltar mais tarde.",
  "arriving.checklist.progress": "{done} de {total} feitos",
  "arriving.checklist.reset": "Recomeçar",
  "arriving.checklist.storedHere":
    "Guardado neste browser, neste aparelho. Nada é enviado para lado nenhum e mais ninguém consegue ver.",
  "arriving.checklist.steps.nif.title": "Tirar o NIF",
  "arriving.checklist.steps.nif.note":
    "O número de identificação fiscal. Quase nada funciona sem ele: contrato de arrendamento, contrato de telemóvel, conta bancária. Faz disto o primeiro recado.",
  "arriving.checklist.steps.nif.linkLabel": "Vistos e residência",
  "arriving.checklist.steps.sns.title": "Inscrever-te no SNS",
  "arriving.checklist.steps.sns.note":
    "Assim que tiveres NIF, inscreve-te no teu Centro de Saúde. É isso que te dá direito a médico de família no Serviço Nacional de Saúde.",
  "arriving.checklist.steps.sns.linkLabel": "sns.gov.pt",
  "arriving.checklist.steps.doctor.title": "Pedir médico afirmativo",
  "arriving.checklist.steps.doctor.note":
    "O SNS cobre cuidados de saúde trans, e o médico que te calha continua a fazer muita diferença. Trata disto enquanto nada é urgente.",
  "arriving.checklist.steps.doctor.linkLabel": "O guia de saúde trans",
  "arriving.checklist.steps.room.title": "Começar a procurar quarto cedo",
  "arriving.checklist.steps.room.note":
    "Os quartos no centro saem em dias. Começa a procurar antes de chegares, se der, e continua a procurar depois de ficares com o primeiro.",
  "arriving.checklist.steps.room.linkLabel": "O quadro de habitação",
  "arriving.checklist.steps.rights.title":
    "Ler os teus direitos antes de assinar",
  "arriving.checklist.steps.rights.note":
    "O que a senhoria pode pedir, quanto pode ser a caução, e o que tem de ficar por escrito. Dez minutos agora poupam-te um ano mau.",
  "arriving.checklist.steps.rights.linkLabel": "Direitos de quem arrenda",
  "arriving.checklist.steps.crisis.title": "Guardar um número para um dia mau",
  "arriving.checklist.steps.crisis.note":
    "A ILGA Portugal tem uma linha de apoio para discriminação, violência e crise, e pode encaminhar-te para apoio jurídico. Guarda o número no telemóvel enquanto está tudo calmo.",
  "arriving.checklist.steps.crisis.linkLabel": "ilga-portugal.pt",
  "arriving.checklist.steps.gathering.title":
    "Ir a um encontro nas primeiras duas semanas",
  "arriving.checklist.steps.gathering.note":
    "Ler sobre uma cidade é uma coisa diferente de estar numa sala dela. Uma noite muda a sensação do mês inteiro.",
  "arriving.checklist.steps.gathering.linkLabel": "O que aí vem",
  "arriving.checklist.steps.community.title":
    "Entrar numa comunidade que se encontre presencialmente",
  "arriving.checklist.steps.community.note":
    "Escolhe a que se encontra perto de ti. Aparecer duas vezes é o que transforma desconhecidos em pessoas que conheces.",
  "arriving.checklist.steps.community.linkLabel": "Ver comunidades",

  // ── Bairros. As notas costumavam mencionar pessoas que só existem no
  //    registo de demonstração e que nunca poderiam ligar a um perfil real;
  //    agora dizem algo verdadeiro sobre o sítio.
  "arriving.neighbourhoods.eyebrow": "Os bairros de Lisboa",
  "arriving.neighbourhoods.title": "Onde é que a vida queer <em>acontece.</em>",
  "arriving.neighbourhoods.intro":
    "Lisboa não tem um bairro queer. Tem vários núcleos, cada um com o seu carácter. Aqui fica um guia honesto de onde está a comunidade.",
  "arriving.hoods.principeReal.tag": "Social · Criativo",
  "arriving.hoods.principeReal.body":
    "O coração da vida social queer em Lisboa. Um jardim, bares de vinhos, livrarias independentes, e muita gente criativa queer. O mais visível dos núcleos e o mais fácil de entrar.",
  "arriving.hoods.principeReal.note":
    "Um bom primeiro passeio se quiseres sentir a cidade sem planear nada.",
  "arriving.hoods.mouraria.tag": "Ativismo · Comunidade",
  "arriving.hoods.mouraria.body":
    "Um bairro que sempre fez espaço a quem vem de fora. Raízes de fado, uma grande comunidade imigrante, e boa parte do ativismo queer da cidade.",
  "arriving.hoods.mouraria.note":
    "Onde grande parte da organização e da ajuda mútua acontece de facto.",
  "arriving.hoods.bairroAlto.tag": "Noite · Artes",
  "arriving.hoods.bairroAlto.body":
    "Bares pequenos, salas de música independente, noites longas, e uma longa história queer. É onde a Lisboa queer vai dançar.",
  "arriving.hoods.bairroAlto.note":
    "Barulhento depois das 22h e muito sossegado de manhã.",
  "arriving.hoods.caisDoSodre.tag": "Criativo · Beira-rio",
  "arriving.hoods.caisDoSodre.body":
    "Energia criativa junto ao rio. Estúdios independentes, espaços culturais, e a Pink Street. Onde a Lisboa nova encontra a Lisboa antiga.",
  "arriving.hoods.caisDoSodre.note":
    "Onde fica a Pink Street, a rua de bares queer mais conhecida da cidade.",
  "arriving.hoods.arroios.tag": "Em crescimento · Acessível",
  "arriving.hoods.arroios.body":
    "Mais acessível, mais diverso, e a crescer depressa como casa de quem chega e de gente criativa empurrada para fora do Príncipe Real. Comida excelente, comunidade próxima.",
  "arriving.hoods.arroios.note":
    "Um dos bairros mais diversos da cidade, e um sítio sensato para procurar quarto.",
  "arriving.hoods.marvila.tag": "Industrial · Lisboa nova",
  "arriving.hoods.marvila.body":
    "Armazéns, estúdios, e uma vida criativa mais sossegada. Mais longe, e cada vez mais casa de quem quer espaço para fazer coisas.",
  "arriving.hoods.marvila.note":
    "Bom para estúdios e quartos maiores com renda mais baixa.",

  // ── Saúde. Cada cartão liga a um destino real: um serviço português
  //    oficial, um guia público da QueerPulse, ou o site da própria
  //    organização.
  "arriving.health.eyebrow": "Saúde",
  "arriving.health.title": "Saúde em Lisboa, <em>o que precisas de saber.</em>",
  "arriving.health.intro":
    "Portugal tem um serviço nacional de saúde (SNS) onde te podes inscrever. Os cuidados afirmativos para pessoas trans melhoraram bastante, mas é preciso saber onde ir.",
  "arriving.health.cards.sns.title": "Inscrição no SNS",
  "arriving.health.cards.sns.body":
    "Inscreve-te no Serviço Nacional de Saúde assim que tiveres NIF. Tens direito a médico de família. Pergunta no teu Centro de Saúde: Arroios, Mouraria e Príncipe Real têm todos centros ativos.",
  "arriving.health.cards.sns.linkLabel": "sns.gov.pt",
  "arriving.health.cards.trans.title": "Cuidados afirmativos trans",
  "arriving.health.cards.trans.body":
    "A Lei de Identidade de Género portuguesa é das mais progressistas da Europa, e o SNS presta cuidados de saúde trans, hormonas incluídas. Encontrar médico à vontade com isto é a parte que vale a pena preparar.",
  "arriving.health.cards.trans.linkLabel": "O guia de saúde trans",
  "arriving.health.cards.mental.title": "Apoio em saúde mental",
  "arriving.health.cards.mental.body":
    "Mudar de país pesa mesmo quando é a decisão certa: outra língua, outro tipo de visibilidade, e ninguém que te conheça há anos. Há apoio entre pares e opções mais baratas.",
  "arriving.health.cards.mental.linkLabel": "Recursos de saúde mental",
  "arriving.health.cards.crisis.title": "Crise e discriminação",
  "arriving.health.cards.crisis.body":
    "A ILGA Portugal tem uma linha de apoio para pessoas LGBTQ+ em crise ou a viver discriminação ou violência, e pode ligar-te a apoio jurídico. A linha é sobretudo em português, por isso leva contigo alguém que fale, se ajudar.",
  "arriving.health.cards.crisis.linkLabel": "ilga-portugal.pt",

  // ── Habitação. O cartão do mercado não tem link de propósito: descreve uma
  //    situação em vez de apontar para um destino.
  "arriving.housing.eyebrow": "Habitação",
  "arriving.housing.title": "Encontrar onde viver, <em>com honestidade.</em>",
  "arriving.housing.intro":
    "O mercado de habitação em Lisboa é caro e competitivo. Aqui fica um retrato honesto do que esperar, e de onde pedir ajuda.",
  "arriving.housing.cards.market.title": "Como é o mercado, na realidade",
  "arriving.housing.cards.market.body":
    "As rendas subiram muito nos últimos cinco anos, e um quarto num bairro central é de longe a maior despesa mensal da maioria das pessoas. Define o teu orçamento pelo que está mesmo a ser pedido este mês, no quadro de habitação e nos sites de anúncios, e não por um valor escrito num guia. Arroios e Mouraria ainda têm melhor relação preço-qualidade. Os bons anúncios saem em dias, por isso avança depressa quando vires um.",
  "arriving.housing.cards.board.title":
    "Quartos partilhados dentro da comunidade",
  "arriving.housing.cards.board.body":
    "As pessoas membros publicam quartos, subarrendamentos e partilhas no quadro de habitação da QueerPulse. As melhores pistas chegam quase sempre por pessoas e não por portais.",
  "arriving.housing.cards.board.linkLabel": "O quadro de habitação",
  "arriving.housing.cards.rights.title": "Saber o que estás a assinar",
  "arriving.housing.cards.rights.body":
    "A lei do arrendamento dá-te mais do que uma senhoria apressada te vai dizer: quanto pode ser a caução, que pré-aviso te é devido, e o que tem de ficar por escrito.",
  "arriving.housing.cards.rights.linkLabel": "Direitos de quem arrenda",
  "arriving.housing.cards.visas.title": "Residência e casa ao mesmo tempo",
  "arriving.housing.cards.visas.body":
    "Se estás a tratar da autorização de residência ao mesmo tempo que de um contrato de arrendamento, a ordem da papelada conta. O NIF vem primeiro, e quase tudo o resto vem atrás dele.",
  "arriving.housing.cards.visas.linkLabel": "Vistos e residência",
  "arriving.housing.cards.ask.title": "Perguntar em voz alta",
  "arriving.housing.cards.ask.body":
    "Dizer que procuras quarto ou um subarrendamento curto e que chegas no mês que vem é uma coisa perfeitamente normal de publicar aqui. As pessoas respondem. Alguém costuma conhecer alguém.",
  "arriving.housing.cards.ask.linkLabel": "Ir para o fórum",

  // ── Organizações. Cada linha abre o site da própria organização, que se
  //    alcança sem conta na QueerPulse.
  "arriving.orgs.eyebrow": "Organizações",
  "arriving.orgs.title": "Conhece estas <em>três primeiro.</em>",
  "arriving.orgs.intro":
    "Estas três são as mais úteis nas tuas primeiras semanas: para apoio jurídico, saúde mental, ou simplesmente para te ligares à comunidade. Cada uma abre o site da própria organização.",
  "arriving.orgs.items.ilga.body":
    "A principal organização de direitos LGBTQ+ em Portugal. Apoio jurídico, aconselhamento contra discriminação, encaminhamento para habitação, linha de apoio, e programação comunitária. A primeira chamada para qualquer coisa séria.",
  "arriving.orgs.items.opusDiversus.body":
    "Saúde mental e apoio entre pares para pessoas LGBTQ+, e formação para profissionais de saúde aliades. Um bom sítio para começar se a mudança ou a nova visibilidade estiverem a pesar.",
  "arriving.orgs.items.redeExAequo.body":
    "Associação LGBTQ+ focada em juventude, com grupos ativos em Lisboa. Apoio entre pares, ativismo, e uma sala tranquila para quem é mais jovem ou ainda está a descobrir-se.",

  // ── Primeiro passo. Encontros reais que aí vêm, ao vivo nos dois modos.
  //    Esta secção anunciava um cartão fixo datado de 14 de junho de 2026.
  "arriving.firstStep.eyebrow": "O teu primeiro passo",
  "arriving.firstStep.title": "Vem a algo <em>presencialmente.</em>",
  "arriving.firstStep.intro":
    "Tudo o que está acima ajuda. O que muda mesmo um primeiro mês é entrar numa sala. Aqui fica o que aí vem.",
  "arriving.firstStep.eventMeta": "{hood} · {time}",
  "arriving.firstStep.loading": "A carregar o que aí vem",
  "arriving.firstStep.error":
    "A lista de encontros não carregou agora. Tenta outra vez daqui a pouco.",
  "arriving.firstStep.retry": "Tentar outra vez",
  "arriving.firstStep.empty":
    "Não há nada no calendário neste momento. Aparecem encontros novos quase todas as semanas, por isso vale a pena voltar em breve.",
  "arriving.firstStep.emptyCta": "Ver a página de encontros",
  "arriving.firstStep.allCta": "Ver todos os encontros",
  "arriving.firstStep.locked":
    "O calendário de encontros vive dentro da QueerPulse. Quem é membro vê o que há esta semana e diz que vai.",
  "arriving.firstStep.lockedCta": "Pedir um convite",

  // ── Comunidades. Comunidades reais, da mesma fonte que a grelha de
  //    descoberta lê, cada uma a ligar à sua própria página.
  "arriving.commQuick.eyebrow": "Por onde começar",
  "arriving.commQuick.title": "Comunidades para <em>quem chega agora.</em>",
  "arriving.commQuick.intro":
    "Salas fáceis de entrar que se encontram presencialmente, aqui na cidade. Escolhe uma e aparece duas vezes.",
  "arriving.commQuick.browseCta": "Ver todas as comunidades",
  "arriving.commQuick.loading": "A carregar comunidades",
  "arriving.commQuick.empty":
    "Não há nada aberto a quem chega agora neste momento. A lista completa continua a valer uma vista de olhos.",
  "arriving.commQuick.locked":
    "As comunidades vivem dentro da QueerPulse, para que as pessoas membros falem umas com as outras sem plateia.",
  "arriving.commQuick.lockedCta": "Pedir um convite",

  "arriving.outro.title": "Vamos conhecer <em>a comunidade?</em>",
  "arriving.outro.sub":
    "Pede um convite para a QueerPulse e ganha acesso à rede completa: pessoas, encontros, o quadro, e tudo o resto nesta página.",
  "arriving.outro.cta": "Pedir um convite",

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
    "Informação da comunidade sobre vias de visto na UE e fora da UE, autorizações de residência, e imigração para casais do mesmo sexo em Portugal, com advogados de imigração avaliados. Isto não é aconselhamento jurídico.",
  "visas.hero.eyebrow": "Vistos & Residência · Portugal",
  "visas.hero.title":
    "Portugal, legalmente. <em>O teu caminho para a residência.</em>",
  "visas.hero.sub":
    "Informação prática sobre vistos, residência e cidadania em Portugal, e aquilo que os casais e famílias queer precisam de saber que a informação oficial nem sempre esclarece.",
  "visas.hero.note":
    "Informação da comunidade. Isto não é aconselhamento jurídico. A lei da imigração muda, confirma sempre com uma pessoa especialista.",
  "visas.review.verify":
    "Confirma antes de entregares o pedido. Esta página indica as regras e o organismo que publica cada valor, e não escreve limiares de rendimento nem taxas: esses são revistos todos os anos, e um número desatualizado é a única coisa aqui que te pode custar um pedido.",
  "visas.routePicker.label": "De onde estás a <em>partir?</em>",
  "visas.routePicker.euCitizen.name": "Cidadania da UE / EEE",
  "visas.routePicker.euCitizen.desc":
    "Aplica-se a livre circulação. O registo é simples, mas obrigatório.",
  "visas.routePicker.euCitizen.cta": "Cidadania da UE",
  "visas.routePicker.remoteWorker.name": "Trabalho remoto / rendimento passivo",
  "visas.routePicker.remoteWorker.desc":
    "A viver de poupanças, rendimento de arrendamento, trabalho independente ou emprego remoto.",
  "visas.routePicker.remoteWorker.cta": "Visto D7",
  "visas.routePicker.digitalNomad.name": "Nómada digital",
  "visas.routePicker.digitalNomad.desc":
    "A trabalhar remotamente para uma entidade empregadora não portuguesa, com rendimento mais elevado.",
  "visas.routePicker.digitalNomad.cta": "Nómada Digital (D8)",
  "visas.routePicker.jobOffer.name": "Proposta de emprego em Portugal",
  "visas.routePicker.jobOffer.desc":
    "Tens ou estás à procura de emprego junto de uma entidade portuguesa.",
  "visas.routePicker.jobOffer.cta": "Vistos de Trabalho",
  "visas.routePicker.partner.name": "A juntar-te a uma pessoa parceira aqui",
  "visas.routePicker.partner.desc":
    "A tua pessoa parceira já está em Portugal ou muda-se contigo.",
  "visas.routePicker.partner.cta": "Trazer uma Pessoa Parceira",

  "visas.tabs.eu.label": "Cidadania da UE",
  "visas.tabs.eu.headTitle": "Pessoas cidadãs da <em>UE e do EEE</em>",
  "visas.tabs.eu.headText":
    "Pessoas cidadãs da UE e do EEE têm o direito de viver e trabalhar em Portugal sem visto. Ainda assim precisas de te registar, e, para casais queer, há questões específicas a conhecer sobre trazer uma pessoa parceira de fora da UE.",
  "visas.tabs.eu.card1.eyebrow": "Registo",
  "visas.tabs.eu.card1.title": "Certificado de Registo",
  "visas.tabs.eu.card1.body":
    "Pessoas cidadãs da UE que fiquem mais de 3 meses têm de se registar na Câmara Municipal da sua área. Vais precisar do passaporte, comprovativo de morada e comprovativo de rendimento ou de emprego. O certificado é normalmente emitido no próprio dia. Há uma pequena taxa, definida por cada Câmara: pergunta à tua qual é neste momento.",
  "visas.tabs.eu.card1.tag": "Simples, baixo custo",
  "visas.tabs.eu.card2.eyebrow": "Os teus direitos",
  "visas.tabs.eu.card2.title": "O que a residência na UE te dá",
  "visas.tabs.eu.card2.body":
    "Acesso total ao SNS (com NISS), o direito de trabalhar sem restrições, o direito de votar em eleições locais e europeias, e o direito de trazer familiares. Após 5 anos de residência legal contínua, podes candidatar-te à residência permanente ou à cidadania.",
  "visas.tabs.eu.card3.eyebrow": "Pessoa parceira de fora da UE",
  "visas.tabs.eu.card3.title":
    "Reunificação familiar para casais do mesmo sexo",
  "visas.tabs.eu.card3.body":
    "Se és cidadã ou cidadão da UE e a tua pessoa parceira não é, ela pode juntar-se a ti em Portugal ao abrigo das regras de livre circulação da UE, incluindo cônjuges do mesmo sexo e uniões de facto registadas. O Tribunal de Justiça da União Europeia (acórdão Coman, 2018) estabeleceu que os Estados-membros da UE têm de reconhecer cônjuges do mesmo sexo para efeitos de livre circulação, mesmo que não tenham casamento entre pessoas do mesmo sexo a nível interno.",
  "visas.tabs.eu.card3.tag": "Direitos plenos de parceria",
  "visas.tabs.eu.card3.link": "Detalhes do visto para pessoa parceira",

  "visas.tabs.d7.label": "D7, Rendimento Passivo",
  "visas.tabs.d7.headTitle": "D7, <em>Visto de Rendimento Passivo</em>",
  "visas.tabs.d7.headText":
    'O D7 é o visto de "rendimento passivo" ou de "reforma" de Portugal. Apesar do nome, é usado por qualquer pessoa com rendimento estável de trabalho remoto, trabalho independente, pensões, rendas ou investimentos. Uma das vias mais populares para pessoas queer que se mudam para Portugal.',
  "visas.tabs.d7.card1.eyebrow": "Para quem é",
  "visas.tabs.d7.card1.title": "Elegibilidade",
  "visas.tabs.d7.card1.body":
    "Pessoas de fora da UE que consigam demonstrar um rendimento passivo ou remoto estável. O limiar mínimo de rendimento está indexado ao salário mínimo português, que é revisto todos os anos, e alguns consulados pedem bastante mais. Vê o valor atual na AIMA e no consulado onde vais entregar o pedido, antes de construíres um processo à volta dele. Os pedidos são feitos no consulado português do teu país de origem, antes de chegares.",
  "visas.tabs.d7.card1.tag": "Pede antes de chegar",
  "visas.tabs.d7.card1.link": "O limiar atual em aima.gov.pt",
  "visas.tabs.d7.card2.eyebrow": "O que obténs",
  "visas.tabs.d7.card2.title": "Condições do visto",
  "visas.tabs.d7.card2.body":
    "Visto inicial válido por 4 meses; é trocado por uma autorização de residência de 2 anos (Autorização de Residência) à chegada a Portugal. Renovável por 3 anos, seguida de residência permanente. Tens de passar pelo menos 6 meses por ano em Portugal para a manter. Pessoas parceiras e filhos a cargo podem ser incluídos.",
  "visas.tabs.d7.card3.eyebrow": "Impostos",
  "visas.tabs.d7.card3.title": "Regime fiscal do IFICI",
  "visas.tabs.d7.card3.body":
    "Portugal substituiu o regime do NHR no final de 2023 pelo regime do IFICI (informalmente chamado NHR 2.0). Está agora direcionado a profissões elegíveis (tecnologia, investigação, artes). Quem tem apenas o D7 deixou de qualificar automaticamente. O teu rendimento será tributado como o de qualquer pessoa residente comum. Procura aconselhamento fiscal antes de te mudares.",
  "visas.tabs.d7.card3.link": "Contactos de aconselhamento fiscal",
  "visas.tabs.d7.step1.title": "Pede no consulado português do teu país",
  "visas.tabs.d7.step1.text":
    "Submete comprovativo de rendimento, registo criminal limpo, seguro de saúde e comprovativo de alojamento em Portugal.",
  "visas.tabs.d7.step1.note": "Processamento de 2–8 semanas",
  "visas.tabs.d7.step2.title": "Chega a Portugal com o teu visto",
  "visas.tabs.d7.step2.text":
    "Tens 4 meses para marcar a tua marcação na AIMA e trocar o visto por uma autorização de residência.",
  "visas.tabs.d7.step3.title": "Marcação na AIMA",
  "visas.tabs.d7.step3.text":
    "A AIMA (que substituiu o SEF em 2023) trata das autorizações de residência. Marca com antecedência: as esperas podem ser longas. Leva todos os documentos originais.",
  "visas.tabs.d7.step3.note": "Marca online em aima.gov.pt",
  "visas.tabs.d7.step4.title": "Recebe o teu cartão AR",
  "visas.tabs.d7.step4.text":
    "O teu cartão de Autorização de Residência é o comprovativo da tua residência legal. Guarda-o bem: é usado para tudo.",

  "visas.tabs.d8.label": "Nómada Digital (D8)",
  "visas.tabs.d8.headTitle": "Visto de <em>Nómada Digital (D8)</em>",
  "visas.tabs.d8.headText":
    "O visto D8 de Portugal, introduzido em 2022, foi pensado para pessoas que trabalham remotamente para, ou prestam serviços a, empresas fora de Portugal. Tem um limiar de rendimento mais alto do que o D7, mas é cada vez mais popular.",
  "visas.tabs.d8.card1.eyebrow": "Requisitos",
  "visas.tabs.d8.card1.title": "O que precisas para te qualificares",
  "visas.tabs.d8.card1.body":
    "Comprovativo de emprego remoto ou contratos com clientes não portugueses. O requisito de rendimento é normalmente quatro vezes o salário mínimo português, e esse salário é revisto todos os anos, por isso tira o valor atual da AIMA e não de uma página que escreva um montante. Seguro de saúde com cobertura em Portugal. Registo criminal limpo. NIF português (nalguns casos pode ser obtido antes do visto).",
  "visas.tabs.d8.card1.tag": "Limiar de rendimento mais alto do que o D7",
  "visas.tabs.d8.card1.link": "O limiar atual em aima.gov.pt",
  "visas.tabs.d8.card2.eyebrow": "Processo",
  "visas.tabs.d8.card2.title": "Como pedir",
  "visas.tabs.d8.card2.body":
    "Tal como o D7, os pedidos são feitos no consulado português antes da chegada. À chegada, trocas por uma autorização de residência de 2 anos. Familiares (incluindo pessoas parceiras do mesmo sexo) podem ser incluídos no pedido ou pedir reunificação familiar depois de receberes a tua autorização.",
  "visas.tabs.d8.card3.eyebrow": "IFICI / Impostos",
  "visas.tabs.d8.card3.title": "Tratamento fiscal",
  "visas.tabs.d8.card3.body":
    "Quem tem D8 e trabalha em funções elegíveis de tecnologia ou investigação pode qualificar-se para o regime IFICI (taxa fixa de 20% de IRS durante até 10 anos). Não é automático: tens de te candidatar e a tua profissão tem de ser elegível. Confirma com uma pessoa especialista fiscal antes de assumir que vais beneficiar.",
  "visas.tabs.d8.card3.link": "Aconselhamento fiscal",

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
    "Portugal reconhece o casamento entre pessoas do mesmo sexo, a união de facto e a coabitação de longo prazo. O que isto significa para a residência depende das vossas nacionalidades e da via de visto que estás a usar, mas as notícias da comunidade são, de um modo geral, boas.",
  "visas.tabs.partner.card1.eyebrow": "Casamento entre pessoas do mesmo sexo",
  "visas.tabs.partner.card1.title":
    "Portugal reconhece plenamente o teu casamento",
  "visas.tabs.partner.card1.body":
    "Portugal reconhece o casamento entre pessoas do mesmo sexo desde 2010. Um casamento legal celebrado em qualquer parte do mundo é reconhecido para efeitos de residência em Portugal. O teu cônjuge tem direito a juntar-se a ti através de reunificação familiar, independentemente da sua nacionalidade ou do país onde casaram.",
  "visas.tabs.partner.card1.tag": "Reconhecimento legal pleno",
  "visas.tabs.partner.card2.eyebrow": "Sem casamento",
  "visas.tabs.partner.card2.title": "Pessoas parceiras sem estatuto formal",
  "visas.tabs.partner.card2.body":
    "Sem casamento, a coabitação de longo prazo (união de facto, normalmente 2 ou mais anos) é reconhecida para efeitos de reunificação familiar. Vais precisar de documentar a relação: contas partilhadas, contas conjuntas, correspondência. Casar ou constituir união de facto primeiro é muitas vezes administrativamente mais simples.",
  "visas.tabs.partner.card3.eyebrow":
    "Pessoa cidadã da UE + pessoa parceira de fora da UE",
  "visas.tabs.partner.card3.title": "O acórdão Coman",
  "visas.tabs.partner.card3.body":
    "O acórdão do Tribunal de Justiça da União Europeia de 2018 (Coman v. Roménia) estabeleceu que os Estados-membros da UE têm de reconhecer cônjuges do mesmo sexo de pessoas cidadãs da UE para efeitos de livre circulação, mesmo em países que não têm casamento entre pessoas do mesmo sexo. Isto significa que uma pessoa cidadã da UE pode trazer o seu cônjuge do mesmo sexo para Portugal, independentemente da posição do seu país de origem.",
  "visas.tabs.partner.card3.tag": "Proteção do tribunal da UE",
  "visas.tabs.partner.card3.link":
    "Fala com um advogado ou advogada de imigração",
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
    "O requisito de língua portuguesa para a cidadania é o nível A2 (básico), conversacional em vez de fluente. Podes comprová-lo através de um teste CAPLE ou CIPLE aprovado, ou mostrando escolaridade em português. O fórum da comunidade tem recomendações de professoras e professores de português queer-friendly.",
  "visas.tabs.citizenship.card3.link": "Recursos de aprendizagem da língua",

  "visas.ground.title": "No <em>terreno</em>",
  "visas.ground.sub":
    "Primeiros passos práticos, seja qual for a tua via de visto.",
  "visas.ground.nif.label": "Primeiro",
  "visas.ground.nif.title": "NIF, número de contribuinte",
  "visas.ground.nif.body":
    "Precisas de um Número de Identificação Fiscal para quase tudo: abrir uma conta bancária, assinar um contrato de arrendamento, comprar um plano de telemóvel. Consegue-o nas Finanças com o teu passaporte. Pessoas cidadãs da UE: leva o passaporte. Fora da UE: leva o passaporte + comprovativo de morada. Também podes usar um serviço de representante fiscal se ainda não estiveres em Portugal.",
  "visas.ground.niss.label": "Segundo",
  "visas.ground.niss.title": "NISS, segurança social",
  "visas.ground.niss.body":
    "O teu Número de Identificação de Segurança Social dá-te acesso aos cuidados de saúde do SNS e regista as tuas contribuições. Regista-te no Centro de Emprego e Formação Profissional ou na Segurança Social da tua área. Necessário antes de poderes aceder a consultas do SNS.",
  "visas.ground.aima.label": "Local-chave",
  "visas.ground.aima.title": "AIMA",
  "visas.ground.aima.body":
    "A AIMA (Agência para a Integração, Migrações e Asilo) substituiu o SEF em outubro de 2023. Trata de todas as autorizações de residência, renovações e reunificação familiar. Marca consultas online em aima.gov.pt. As esperas são longas, marca assim que chegares.",
  "visas.ground.sns.label": "Saúde",
  "visas.ground.sns.title": "Acesso ao SNS",
  "visas.ground.sns.body":
    "Regista-te num médico de família (Centro de Saúde) da tua área, usando o teu cartão AR ou o certificado de registo da UE, mais o NISS. Os tempos de espera são longos. Muitas pessoas da comunidade usam seguro de saúde privado a par do acesso ao SNS. Consulta a página de Bem-estar para prestadores de cuidados de saúde queer-friendly.",

  "visas.lawyers.title":
    "Advocacia de imigração <em>avaliada pela comunidade</em>",
  "visas.lawyers.emptyBody":
    "Estamos a construir um diretório de advogados de imigração LGBTQ+-friendly avaliado pela comunidade. Ainda não está pronto. Até estar, as melhores recomendações vêm de membros que já passaram pelo processo. Pergunta no tópico do fórum sobre vistos.",
  "visas.lawyers.forumCta": "Pergunta no tópico do fórum sobre vistos",

  "visas.outro.title": "Estás a construir uma vida <em>aqui.</em>",
  "visas.outro.sub": "A papelada é temporária. A comunidade é permanente.",
  "visas.outro.settlingCta": "Guia de instalação",
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
  "map.sidebar.backToAll": "Todos os locais",
  "map.sidebar.empty": "Nenhum espaço corresponde a estes filtros.",
  "map.jumpToList": "Ver a lista · {count}",
  "map.venueCard.beenCount_one": "<b>{count}</b> pessoa já esteve aqui",
  "map.venueCard.beenCount_other": "<b>{count}</b> pessoas já estiveram aqui",
  "map.venueCard.beenThere": "Já estiveste aqui",
  "map.venueCard.markBeen": "Já estive aqui",
  "map.venueCard.accessible": "Acesso para cadeira de rodas",
  "map.mapError":
    "Não foi possível carregar o mapa. A lista de espaços abaixo continua a funcionar.",
  "map.mapLoading": "A dar <em>vida</em> ao mapa…",
  "map.pinAria": "{name}, {type}",
  "map.clusterAria_one": "{count} espaço aqui, ampliar",
  "map.clusterAria_other": "{count} espaços aqui, ampliar",

  // ── Local — explorador combinado de locais em lista/mapa.
  "local.cat.nightlife": "Noite",
  "local.view.list": "Lista",
  "local.view.map": "Mapa",
  "local.view.toggleAria": "Escolher vista de lista ou mapa",
  "local.card.seeFullDetails": "Ver detalhes",
  "local.filter.searchPlaceholder": "Procurar espaços e locais…",
  "local.filter.categoryLabel": "Tipo de lugar",
  "local.filter.refine": "Refinar",
  "local.filter.vibeLabel": "Ambiente",
  "local.filter.vibeVenueNote": "Os filtros de ambiente aplicam-se a espaços",
  "local.filter.verifiedSafeSpaces": "Espaços seguros verificados",
  "local.filter.filters": "Filtros",
  "local.filter.quickFiltersLabel": "Filtros rápidos",
  "local.filter.openNow": "Aberto agora",
  "local.filter.accessLabel": "Necessidades de acesso",
  "local.filter.accessNote":
    "Mostra os locais que responderam sim a tudo o que escolheres. Um local sobre o qual ninguém perguntou fica de fora dos resultados.",
  // Mostrado sob o controlo de ordenação enquanto a localização está ligada,
  // a dizer o que a posição faz pela ordenação escolhida. As duas funcionam
  // em conjunto; nenhuma substitui a outra.
  "local.filter.sortNoteHood":
    "Os bairros estão ordenados pela proximidade, e os locais dentro de cada um também.",
  "local.filter.sortNoteName":
    "Mantém-se alfabético. A tua localização continua a pôr o tempo a pé em cada cartão.",
  // ── Usar a minha localização. Opcional, reversível e nunca sai do dispositivo.
  "local.nearMe.on": "Usar a minha localização",
  "local.nearMe.off": "Desligar a minha localização",
  "local.nearMe.asking": "A encontrar-te…",
  "local.nearMe.privacy": "A tua localização fica neste dispositivo.",
  "local.nearMe.onNote":
    "Os tempos a pé estão ligados. A tua localização fica neste dispositivo.",
  "local.nearMe.denied":
    "A localização está desligada para este site. Podes voltar a ligá-la nas definições do navegador.",
  "local.nearMe.timeout":
    "Isto demorou demasiado. Tenta de novo quando quiseres.",
  "local.nearMe.unavailable":
    "O teu dispositivo não conseguiu perceber onde estás neste momento.",
  "local.nearMe.deniedRecoverable":
    "A localização está desligada para este site. Carrega no botão para a voltares a permitir.",
  "local.nearMe.help.open": "Mostra-me como",
  "local.nearMe.help.stillOff": "Continua sem funcionar?",
  "local.nearMe.help.title": "Volta a ligar a tua localização",
  "local.nearMe.help.sub":
    "O teu navegador está a bloquear a localização para este site, e só tu podes mudar isso. É aqui que fica a definição.",
  "local.nearMe.help.chromium.title": "No Chrome, Edge ou Brave",
  "local.nearMe.help.chromium.step1":
    "Clica no ícone no início da barra de endereço para ver as <b>informações do site</b>.",
  "local.nearMe.help.chromium.step2":
    "Liga a <b>Localização</b> ou muda-a para <b>Permitir</b>.",
  "local.nearMe.help.chromium.step3":
    "Volta aqui e carrega em <b>Tentar de novo</b>.",
  "local.nearMe.help.safari.title": "No Safari",
  "local.nearMe.help.safari.step1":
    "Na barra de menus, escolhe <b>Safari</b> e depois <b>Definições</b>.",
  "local.nearMe.help.safari.step2":
    "Abre o separador <b>Sites</b> e escolhe <b>Localização</b> na lista à esquerda.",
  "local.nearMe.help.safari.step3":
    "Muda este site para <b>Perguntar</b> ou <b>Permitir</b> e carrega em <b>Tentar de novo</b>.",
  "local.nearMe.help.firefox.title": "No Firefox",
  "local.nearMe.help.firefox.step1":
    "Clica no ícone de <b>permissões</b> no início da barra de endereço.",
  "local.nearMe.help.firefox.step2":
    "Remove o bloqueio ao lado de <b>Aceder à tua localização</b>.",
  "local.nearMe.help.firefox.step3":
    "Recarrega a página e clica em <b>Usar a minha localização</b>.",
  "local.nearMe.help.ios.title": "No iPhone ou iPad",
  "local.nearMe.help.ios.step1":
    "No Safari, abre o <b>menu da página</b> ao lado do endereço e escolhe <b>Definições do site</b>.",
  "local.nearMe.help.ios.step2":
    "Muda a <b>Localização</b> para <b>Perguntar</b> ou <b>Permitir</b>.",
  "local.nearMe.help.ios.step3":
    "Usas outro navegador? Abre <b>Definições</b>, depois <b>Apps</b>, escolhe esse navegador e permite a <b>Localização</b>.",
  "local.nearMe.help.android.title": "No Android",
  "local.nearMe.help.android.step1":
    "Toca no ícone no início da barra de endereço para ver as <b>informações do site</b>.",
  "local.nearMe.help.android.step2":
    "Toca em <b>Autorizações</b> e liga a <b>Localização</b>.",
  "local.nearMe.help.android.step3":
    "Volta aqui e toca em <b>Tentar de novo</b>.",
  "local.nearMe.help.other.title": "No teu navegador",
  "local.nearMe.help.other.step1":
    "Abre as <b>definições do site</b> desta página, normalmente a partir do ícone no início da barra de endereço.",
  "local.nearMe.help.other.step2":
    "Muda a <b>Localização</b> para <b>Permitir</b> ou <b>Perguntar</b>.",
  "local.nearMe.help.other.step3":
    "Volta aqui e carrega em <b>Tentar de novo</b>.",
  "local.nearMe.help.systemTitle": "Continua desligada?",
  "local.nearMe.help.system.mac":
    "O teu Mac pode desligar a localização para um navegador inteiro. Abre <b>Definições do Sistema</b>, depois <b>Privacidade e segurança</b>, depois <b>Serviços de localização</b>, e liga o teu navegador.",
  "local.nearMe.help.system.windows":
    "O Windows pode desligar a localização para todas as apps. Abre <b>Definições</b>, depois <b>Privacidade e segurança</b>, depois <b>Localização</b>, e liga os serviços de localização.",
  "local.nearMe.help.system.ios":
    "O teu dispositivo pode desligar a localização para o Safari inteiro. Abre <b>Definições</b>, depois <b>Privacidade e segurança</b>, depois <b>Serviços de localização</b>, e muda <b>Sites no Safari</b> para <b>Durante a utilização da app</b>.",
  "local.nearMe.help.system.android":
    "O teu telemóvel pode desligar a localização por completo. Desliza a partir do topo do ecrã e confirma que a <b>Localização</b> está ligada.",
  "local.nearMe.help.system.other":
    "O teu dispositivo também pode desligar a localização para todas as apps. Vê as definições de privacidade ou de localização e carrega em <b>Tentar de novo</b>.",
  "local.nearMe.help.tryAgain": "Tentar de novo",
  "local.nearMe.walkChip": "{minutes} min a pé",
  "local.nearMe.walkAria": "Cerca de {minutes} minutos a pé de ti",
  "local.filter.showResults_one": "Ver {count} lugar",
  "local.filter.showResults_other": "Ver {count} lugares",
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
    "A constituição da QueerPulse: doze artigos em linguagem simples sobre finalidade, adesão e governação, escritos pelos voluntários que gerem a plataforma.",
  "constitution.artNumLabel": "Artigo",
  "constitution.hero.eyebrow": "Constituição · v1.4 · adotada a 14 nov. 2025",
  "constitution.hero.title": "As regras, <em>em português claro.</em>",
  "constitution.hero.dek1":
    "A carta de trabalho do <b>coletivo de voluntários</b> que gere a QueerPulse. Escrita pelas oito pessoas fundadoras e adotada na primeira assembleia. Não é um documento legal, e ainda não existe nenhuma empresa ou associação registada por trás da QueerPulse. <em>Revista várias vezes desde então.</em>",
  "constitution.hero.dek2":
    "É intencionalmente curta. Doze artigos, linguagem simples, sem subcláusulas aninhadas. Tudo o que exige mais detalhe está no Código de Conduta ou nas resoluções da Assembleia Anual.",
  "constitution.hero.meta":
    "<b>Escrita em:</b> Lisboa · <b>Texto original:</b> português.",

  "constitution.art1.toc": "I · Objeto",
  "constitution.art1.title": "Objeto",
  "constitution.art1.clause1":
    "A QueerPulse existe para prestar <strong>apoio profissional, social, cultural e material</strong> a pessoas LGBTQ+ na cidade de Lisboa, e (nos termos do Artigo X) noutras cidades, uma vez cumpridas condições específicas.",
  "constitution.art1.clause2":
    "A QueerPulse funciona <strong>sem fins lucrativos,</strong> como um coletivo de voluntários. Não é uma empresa nem uma associação registada, não detém capital próprio e não distribui lucros. Se isso alguma vez mudar, este documento muda com ela.",
  "constitution.art1.clause3":
    "Sempre que esta Constituição entre em conflito com o Manifesto, prevalece este documento. O Manifesto define valores; este define o funcionamento.",

  "constitution.art2.toc": "II · Pessoas-membro",
  "constitution.art2.title": "Pessoas-membro",
  "constitution.art2.clause1":
    "É <strong>pessoa-membro</strong> qualquer indivíduo avalizado por uma pessoa-membro existente, que tenha concluído uma breve conversa de admissão com a equipa de moderação, e aceite o Código de Conduta.",
  "constitution.art2.clause2":
    "As pessoas-membro podem estar num de três escalões: <em>Solidariedade</em> (gratuito), <em>Membro</em> (36 €/ano), ou <em>Sustentador/a</em> (96 €/ano). Todos os escalões têm direitos de voto iguais.",
  "constitution.art2.clause3":
    "Nenhum estatuto de uma pessoa-membro (incluindo idade, nacionalidade, língua, identidade, ocupação ou visibilidade) afeta os seus direitos de voto ou o tratamento em moderação.",

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
    "A Assembleia reúne uma vez por ano, em novembro, durante pelo menos um dia inteiro. É o órgão de decisão máximo do coletivo.",
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
    "<strong>Pelo menos 90% de cada euro recebido</strong> tem de ser gasto em programas comunitários, equipa e infraestrutura, deixando um teto de 10% para custos indiretos. A meta é 96% e tem sido cumprida todos os anos desde 2024.",
  "constitution.art6.clause2":
    "O orçamento anual é aprovado pela Assembleia. O círculo de finanças pode reequilibrar entre categorias ao longo do ano sem nova aprovação, até 10% por categoria.",
  "constitution.art6.clause3":
    "As contas anuais são <strong>publicadas na íntegra,</strong> em linguagem simples, como parte do <a>Relatório de Transparência</a>. Os valores são reportados pela própria equipa de voluntários.",
  "constitution.art6.clause4":
    "O coletivo não pode contrair dívidas superiores a 10 000 € sem aprovação explícita da Assembleia.",

  "constitution.art7.toc": "VII · Expressão",
  "constitution.art7.title": "Expressão & <em>moderação</em>",
  "constitution.art7.clause1":
    "A comunidade é moderada de acordo com o Código de Conduta, ratificado em separado e alterável por maioria qualificada da Assembleia (60%).",
  "constitution.art7.clause2":
    "<strong>A QueerPulse não modera críticas a si própria.</strong> Publicações críticas da QueerPulse, das suas decisões, ou de quem a organiza não podem ser removidas ao abrigo de nenhuma cláusula do Código de Conduta.",
  "constitution.art7.clause3":
    "As decisões de moderação são recorríveis junto de um painel de recurso permanente composto por três pessoas-membro de fora do círculo que decidiu. A percentagem de decisões revertidas em recurso é contada a partir do registo da moderação e publicada a cada trimestre no <a>Relatório de Transparência</a>.",

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
    "O coletivo pode celebrar <strong>parcerias operacionais</strong> com outras organizações, em termos aprovados pela Assembleia. Novas parcerias operacionais estão limitadas a duas por ano.",
  "constitution.art9.clause2":
    "Nenhuma parceria pode conceder a uma organização parceira acesso a dados de pessoas-membro para além do operacionalmente necessário, e apenas com o consentimento explícito da pessoa-membro em causa.",
  "constitution.art9.clause3":
    "Qualquer uma das partes de uma parceria pode discordar publicamente das posições da outra. <em>Coligação não é consenso.</em>",

  "constitution.art10.toc": "X · Expansão",
  "constitution.art10.title": "Expansão",
  "constitution.art10.clause1":
    "O coletivo só pode abrir em cidades além de Lisboa quando todas estas condições se verificarem: (a) pelo menos uma pessoa moderadora está no país; (b) uma parceira operacional local está firmada; (c) uma revisão jurídica local está concluída; (d) entre oito e doze pessoas-membro fundadoras se comprometeram com o lançamento-piloto.",
  "constitution.art10.clause2":
    "Cada nova cidade ratifica o seu próprio círculo local e opera ao abrigo desta Constituição, com estatutos específicos da cidade conforme necessário.",

  "constitution.art11.toc": "XI · Dissolução",
  "constitution.art11.title": "Dissolução",
  "constitution.art11.clause1":
    "O coletivo só pode ser encerrado por resolução da Assembleia que reúna uma <strong>maioria qualificada de 75%</strong> calculada sobre a totalidade das pessoas-membro ativas.",
  "constitution.art11.clause2":
    "Em caso de encerramento, quaisquer fundos remanescentes têm de ser transferidos para uma organização de direitos LGBTQ+ registada escolhida pela Assembleia dissolvente. Nenhum fundo pode ser distribuído a indivíduos.",

  "constitution.art12.toc": "XII · Emendas",
  "constitution.art12.title": "Emendas",
  "constitution.art12.clause1":
    "Esta Constituição só pode ser emendada por resolução da Assembleia que exija uma maioria qualificada de 60% dos votos expressos.",
  "constitution.art12.clause2":
    "As emendas têm de ser circuladas para comentário escrito junto de todas as pessoas-membro, pelo menos 30 dias antes da votação.",
  "constitution.art12.clause3":
    "O versionamento é sequencial (v1.0, v1.1…). O texto integral da versão em vigor é publicado em permanência.",

  "constitution.footer.version":
    "<b>Constituição v1.4</b> · adotada a 14 nov. 2025 · em vigor desde 1 jan. 2026",
  "constitution.footer.readCodeOfConduct": "Ler o Código de Conduta",

  // ── Biblioteca de Recursos — chrome de página/filtros/cartão. Os registos
  //    de `ORGANISATIONS` (nome/descrição/etiquetas — uma pequena lista com
  //    curadoria de organizações externas reais, mantida à parte da grade
  //    editorial de guias) é conteúdo de diretório, mesmo precedente de
  //    `directoryPlaces.ts` / da página Plataformas abaixo — ficam em
  //    inglês. `LIBRARY_SUBPAGES` (rótulo/descrição) é chrome curto de
  //    apresentação, escrito pela plataforma — traduzido.
  //    CNT-11: a grade de guias em si é dados reais, servidos pelo backend —
  //    o seu chrome de pesquisa/filtro/cartão vive nas chaves partilhadas
  //    `resources:library.*` (ver resources.ts) para não duplicar por catálogo.
  "resourceLibrary.meta.title":
    "Recursos queer em Lisboa: saúde, apoio jurídico, habitação e dinheiro",
  "resourceLibrary.meta.description":
    "Coisas que realmente ajudam: guias escritos pela comunidade e uma pequena lista de organizações de confiança, para saúde, apoio jurídico, habitação, finanças e vida trans na Lisboa queer.",
  "resourceLibrary.hero.eyebrow": "Biblioteca de Recursos",
  "resourceLibrary.hero.title": "Coisas que <em>realmente ajudam.</em>",
  "resourceLibrary.hero.sub":
    "Guias mantidos pela comunidade, organizações, contactos e ferramentas da QueerPulse, tudo num só lugar pesquisável.",
  "resourceLibrary.stats.resources": "recursos",
  "resourceLibrary.stats.categories": "categorias",
  "resourceLibrary.stats.communityLabel": "Comunidade",
  "resourceLibrary.stats.maintained": "mantida",
  "resourceLibrary.search.placeholder": "Pesquisar recursos…",
  "resourceLibrary.results_one": "{count} resultado",
  "resourceLibrary.results_other": "{count} resultados",
  "resourceLibrary.empty":
    "Nenhum recurso corresponde. Tenta um filtro mais amplo.",
  "resourceLibrary.emptyUnreviewed":
    "Ainda nenhum guia passou pela revisão editorial. Um guia aparece aqui assim que uma editora o ler de ponta a ponta e confirmar que está correto.",
  "resourceLibrary.card.visitSite": "Visitar site",
  "resourceLibrary.orgs.title":
    "Organizações que fazem isto <em>todos os dias.</em>",
  "resourceLibrary.orgs.lead":
    "Uma pequena lista de organizações em Lisboa e por Portugal em quem confiamos, para apoio que a QueerPulse não presta diretamente.",
  "resourceLibrary.outro.title": "Sabes de algo que <em>falta?</em>",
  "resourceLibrary.outro.sub":
    "Todos os recursos aqui foram adicionados por uma pessoa da comunidade. Se algo te ajudou e não está listado, conta-nos.",
  "resourceLibrary.outro.cta": "Sugerir um recurso",
  "resourceLibrary.subpages.eyebrow": "Aprender & pertencer",
  "resourceLibrary.subpages.title": "Começa pelo básico",
  "resourceLibrary.subpages.queer101.label": "Queer 101",
  "resourceLibrary.subpages.queer101.blurb":
    "Acabaste de chegar? Começa pelo básico: identidades, linguagem e comunidade.",
  "resourceLibrary.subpages.glossary.label": "Glossário",
  "resourceLibrary.subpages.glossary.blurb":
    "Definições em linguagem simples para as palavras que a comunidade usa.",
  "resourceLibrary.subpages.intersectionality.label": "Interseccionalidade",
  "resourceLibrary.subpages.intersectionality.blurb":
    "Como as identidades sobrepostas moldam as nossas experiências, e a nossa organização coletiva.",

  // ── Plataformas (a rede queer mais alargada) — chrome de página/filtros.
  //    Os registos de `PLATFORMS` (nome/descrição — apps/organizações
  //    externas nomeadas) são conteúdo de diretório, mesmo precedente da
  //    Biblioteca de Recursos acima — ficam em inglês.
  "platforms.meta.title": "Plataformas e organizações queer a conhecer",
  "platforms.meta.description":
    "Um diretório de aplicações de namoro, media, redes profissionais e organizações de defesa de direitos úteis a pessoas queer, incluindo grupos portugueses como a ILGA Portugal.",
  "platforms.hero.eyebrow": "Plataformas queer",
  "platforms.hero.title": "A rede <em>queer</em> mais alargada.",
  "platforms.hero.sub":
    "Aplicações, media, redes profissionais e organizações de defesa de direitos genuinamente úteis para pessoas queer, para além da própria QueerPulse.",
  "platforms.filter.all": "Todas",
  "platforms.filter.dating": "Namoro & Social",
  "platforms.filter.media": "Notícias & Media",
  "platforms.filter.professional": "Redes Profissionais",
  "platforms.filter.advocacy": "Defesa de Direitos",
  "platforms.filter.health": "Saúde & Bem-estar",
  "platforms.filter.portugal": "Portugal & Lisboa",
  "platforms.note.body":
    "<b>Uma nota sobre esta lista:</b> Incluímos plataformas que consideramos genuinamente úteis para pessoas queer. Isto não é um aval às práticas de nenhuma empresa. Faz sempre as tuas próprias escolhas informadas sobre dados, segurança e privacidade, especialmente em aplicações de namoro e sociais.",
  "platforms.outro.title": "Falta alguma coisa? <em>Diz-nos.</em>",
  "platforms.outro.sub":
    "Conheces uma plataforma, recurso ou comunidade que devia estar aqui? Sugere-a e nós adicionamo-la ao diretório.",
  "platforms.outro.cta": "Sugerir uma plataforma",

  // ── Candidatura a Parceiro — chrome do formulário "Candidata-te a
  //    parceria". Todo o texto é escrito pela plataforma (formulário/
  //    validação). `REGION_OPTIONS`/`DEFAULT_REGION_LABEL` mantêm o id
  //    canónico de `Region` ("pt"/"eu"/"int") como valor guardado; só o
  //    rótulo apresentado é traduzido (i18n brief §5.1).
  // PRD-266 / PRD-263: ver as notas no catálogo EN.
  "submitPartner.signedOut.title": "Entra na conta para te candidatares",
  "submitPartner.signedOut.body":
    "Uma candidatura a parceria fica ligada a uma conta, porque é aí que a resposta aparece. Entra e trazemos-te de volta a esta página com o que já escreveste.",
  "submitPartner.signedOut.signInCta": "Entrar e continuar",
  "submitPartner.signedOut.contactCta": "Só fazer uma pergunta",

  "partnerProfileEdit.meta.title": "O perfil da tua organização",
  "partnerProfileEdit.meta.description":
    "Mantém atualizada a página pública da tua organização na QueerPulse: contactos, descrição, etiquetas e financiamento.",
  "partnerProfileEdit.hero.eyebrow": "Parceiros · O teu perfil",
  "partnerProfileEdit.hero.title": "Mantém a tua página <em>verdadeira.</em>",
  "partnerProfileEdit.hero.sub":
    "Esta é a página que as pessoas encontram quando te procuram. Muda o que mudou, guarda, e fica no ar.",
  "partnerProfileEdit.empty.title": "Não geres nenhum perfil de parceiro",
  "partnerProfileEdit.empty.body":
    "Esta página é para organizações já aprovadas como parceiras. Se a tua foi aprovada e não a vês aqui, pede-nos para passar o perfil para a tua conta.",
  "partnerProfileEdit.empty.applyCta": "Candidatar a parceria",
  "partnerProfileEdit.picker.label": "Qual organização?",
  "partnerProfileEdit.staffFields.title": "Definido pela equipa de parcerias",
  "partnerProfileEdit.staffFields.tier": "Nível de parceria",
  "partnerProfileEdit.staffFields.since": "Parceiros desde",
  "partnerProfileEdit.staffFields.eyebrow": "Etiqueta do cartão",
  "partnerProfileEdit.staffFields.note":
    "Estes quatro dizem algo sobre a relação entre nós, por isso definimo-los em conjunto e não cada lado por si. Pede-nos e alteramos.",
  "partnerProfileEdit.fields.regionLabel.label":
    "Região, tal como deve aparecer",
  "partnerProfileEdit.fields.regionLabel.helper":
    'As palavras impressas no teu cartão, por exemplo "Portugal" ou "Lisboa e Setúbal".',
  "partnerProfileEdit.fields.about.label": "Sobre a tua organização",
  "partnerProfileEdit.fields.about.helper":
    "Alguns parágrafos, separados por uma linha em branco. É o texto longo da tua página.",
  "partnerProfileEdit.fields.funding.label": "Como és financiada",
  "partnerProfileEdit.fields.funding.helper":
    "As pessoas leem isto. Diz de onde vem o dinheiro, com clareza.",
  "partnerProfileEdit.fields.phone.label": "Telefone",
  "partnerProfileEdit.fields.phoneNote.label": "Quando ligar",
  "partnerProfileEdit.fields.phoneNote.helper":
    'Por exemplo "Dias úteis, das 14:00 às 20:00". Deixa vazio se a linha está sempre aberta.',
  "partnerProfileEdit.actions.save": "Guardar alterações",
  "partnerProfileEdit.actions.saving": "A guardar\u2026",
  "partnerProfileEdit.actions.viewPublic": "Ver a tua página pública",
  "partnerProfileEdit.savedToast":
    "Guardado. A tua página pública está atualizada.",
  "partnerProfileEdit.errorToast": "Não foi possível guardar o teu perfil.",
  "submitPartner.hero.eyebrow": "Parceiros · Candidatura",
  "submitPartner.hero.title": "Candidata-te a <em>parceria.</em>",
  "submitPartner.hero.sub":
    "As parcerias da QueerPulse são operacionais e de mãos na massa. Conta-nos quem és e o que fazes, com honestidade, e vamos ler cada palavra.",
  "submitPartner.success.title": "Candidatura",
  "submitPartner.success.em": "recebida.",
  "submitPartner.success.closeLabel": "Voltar a parceiros",
  "submitPartner.success.step1":
    "Está pendente de revisão pela equipa de parcerias",
  "submitPartner.success.step2":
    "Lemos todas as candidaturas, por mais toscas que sejam",
  "submitPartner.success.step3":
    "Entraremos em contacto: um sim, um ainda não, ou uma pergunta",
  "submitPartner.success.body":
    "Obrigade por nos contactares. A tua candidatura está feita. Nada fica público até termos falado contigo sobre ela.",
  "submitPartner.actions.sending": "A enviar…",
  "submitPartner.actions.submit": "Submeter candidatura",
  "submitPartner.actions.cancel": "Cancelar",

  "submitPartner.fields.sectionOrg": "A tua organização",
  "submitPartner.fields.name.label": "Nome da organização",
  "submitPartner.fields.name.placeholder": "ex.: Casa T",
  "submitPartner.fields.orgType.label": "Tipo de organização",
  "submitPartner.fields.orgType.helper":
    "Só o tipo de organização que são. O rótulo “Parceiro ·” é adicionado por nós.",
  "submitPartner.fields.orgType.placeholder":
    "ex.: Clínica de saúde comunitária",
  "submitPartner.fields.city.label": "Cidade / base",
  "submitPartner.fields.city.placeholder": "ex.: Lisboa",
  "submitPartner.fields.region.label": "Região",
  "submitPartner.fields.logo.label": "Marca do logótipo",
  "submitPartner.fields.logo.derivedHelper":
    "Preenchido a partir do nome. Edita se preferires definir a insígnia.",
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
    "As parcerias aqui são operacionais e de mãos na massa. Conta-nos o que a tua organização realmente faz e a quem serve, em termos concretos.",
  "submitPartner.tips.sharedValues.title":
    "Construído sobre valores partilhados",
  "submitPartner.tips.sharedValues.body":
    "Damos prioridade a organizações que colocam no centro as identidades marginalizadas dentro dos espaços queer, e também fora deles. Diz-nos onde se situa o teu trabalho.",
  "submitPartner.tips.whatNext.title": "O que acontece a seguir",
  "submitPartner.tips.whatNext.body":
    "A tua candidatura chega como pendente. Uma pessoa da equipa revê-a, e entraremos em contacto, seja um sim, um ainda não, ou uma pergunta.",

  "changelog.entries.resource-listings-and-suggestions.title":
    "Recursos reais para Apoio Jurídico e Testagem de Saúde Sexual",
  "changelog.entries.resource-listings-and-suggestions.body":
    "Onde existe, aparece um diretório verificado pela administração; onde não, Sugerir um recurso alimenta uma fila de revisão.",
  "changelog.tag.legal": "Ver Apoio Jurídico",

  "changelog.tag.guideRating": "Ver os guias de Legal",
  "changelog.entries.resources-guide-rating.title":
    "Avalia se um guia de recursos ajudou",
  "changelog.entries.resources-guide-rating.body":
    "Cada guia termina com polegar para cima ou para baixo, e os resultados aparecem na nova página Feedback dos guias.",

  "changelog.entries.homepage-housing-personas-showcase.title":
    "Alojamento e perfis alternativos, mais próximos do real na homepage",
  "changelog.entries.homepage-housing-personas-showcase.body":
    "Alojamento mostra dois anúncios com separador para o quarto e para o senhorio, e Perfis Alternativos um baralho de perfis.",

  // Trust, safety and moderation (section 1 build).
  "changelog.tag.transparency": "Ler o relatório de transparência",
  "changelog.tag.constitution": "Ler a constituição",
  "changelog.tag.codeOfConduct": "Ler o código de conduta",
  // ACQ-01..04, ACQ-08, ACQ-11, ID-11, ID-12, ID-15: the applicant funnel,
  // account security and export depth.
  "changelog.tag.accountSecurity": "Abrir segurança da conta",
  "changelog.tag.dataExport": "Transferir os teus dados",
  "changelog.tag.contact": "Fala connosco",
  // Lote de 26 de agosto de 2026: o acompanhamento de reivindicações e a
  // declaração de acessibilidade.
  "changelog.tag.listingClaims": "Acompanhar o teu pedido",
  "changelog.tag.accessibility": "Ler a declaração de acessibilidade",
  // Segundo lote de 26 de agosto de 2026. `changelog.tag.safety` já aponta
  // para `routes.report` numa entrada antiga com o rótulo "A nossa abordagem
  // à segurança", que se lê como explicação e não como o próprio formulário.
  "changelog.tag.reportForm": "Abrir o formulário de denúncia",

  // ── 28 de agosto de 2026 ──────────────────────────────────────────────────
  "changelog.entries.the-nomination-form-becomes-a-form.title":
    "O formulário de nomeação passa a ser um formulário",
  "changelog.entries.the-nomination-form-becomes-a-form.body":
    "Os dois campos têm etiqueta, a caixa do porquê conta até 500 caracteres, e a pessoa nomeada nunca sabe.",

  "changelog.entries.signing-a-device-out-now-signs-it-out.title":
    "Terminar sessão num dispositivo termina mesmo",
  "changelog.entries.signing-a-device-out-now-signs-it-out.body":
    "A lista identifica o dispositivo que tens na mão, sair dos outros deixa-te com sessão, e terminar sessão é imediato.",

  "changelog.entries.names-that-speak-for-queerpulse-are-reserved.title":
    "Nomes que falam pela QueerPulse ficam reservados",
  "changelog.entries.names-that-speak-for-queerpulse-are-reserved.body":
    "Cerca de trinta nomes como support, moderator e security ficam para a QueerPulse; se o teu coincidir, recebe um número.",

  "changelog.entries.badges-for-the-people-who-run-each-part.title":
    "Distintivos para quem cuida de cada área",
  "changelog.entries.badges-for-the-people-who-run-each-part.body":
    "Quem cuida da habitação, do diretório, da biblioteca, da revista e das comunidades tem um distintivo com a área indicada.",

  "changelog.entries.staying-signed-in-on-shared-wifi.title":
    "Manter a sessão em wifi partilhado",
  "changelog.entries.staying-signed-in-on-shared-wifi.body":
    "As renovações de sessão contam-se por sessão, por isso quem partilha a ligação num espaço, café ou casa mantém a sessão.",

  "changelog.entries.clearer-keyboard-focus-across-the-platform.title":
    "Foco de teclado mais claro em toda a plataforma",
  "changelog.entries.clearer-keyboard-focus-across-the-platform.body":
    "O anel de foco tem dois tons, linha escura com halo claro, para se ler em qualquer fundo; cerca de 170 controlos usam-no.",

  "changelog.entries.screen-readers-follow-along-in-more-places.title":
    "Os leitores de ecrã acompanham em mais sítios",
  "changelog.entries.screen-readers-follow-along-in-more-places.body":
    "Cinco painéis levam o foco para dentro, fecham com Escape e devolvem-te ao botão; reordenar peças da revista é anunciado.",

  "changelog.entries.see-your-persona-the-way-a-visitor-does.title":
    "Vê a tua persona como um visitante a vê",
  "changelog.entries.see-your-persona-the-way-a-visitor-does.body":
    "Ver como visitante, ao lado de Editar persona, mostra a página como um desconhecido a vê; a barra no fundo traz-te de volta.",

  "changelog.entries.filters-you-add-ease-in-and-out.title":
    "Os filtros que acrescentas entram e saem com calma",
  "changelog.entries.filters-you-add-ease-in-and-out.body":
    "Em Encontrar membros, cada pastilha de filtro cresce ao aparecer e encolhe ao sair; com Reduzir movimento, ficam quietas.",

  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.title":
    "Cada bairro diz quantas pessoas lá estão",
  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.body":
    "Onde estão baseadas passa a ser uma caixa por bairro com a contagem dos teus resultados; os bairros vazios ficam apagados.",

  "changelog.entries.a-persona-leads-with-its-name.title":
    "Uma persona passa a começar pelo nome",
  "changelog.entries.a-persona-leads-with-its-name.body":
    "A fotografia fica ao lado do nome, a descrição abre com o ofício em letra mais escura, e o distintivo em maiúsculas saiu.",

  "changelog.entries.pages-open-the-moment-you-click-them.title":
    "As páginas abrem no momento em que carregas",
  "changelog.entries.pages-open-the-moment-you-click-them.body":
    "A página é pedida assim que passas o rato ou tocas no link, e a estrutura aparece logo, com marcações enquanto chega.",

  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.title":
    "As pessoas que talvez conheças passam a deslizar de lado no telemóvel",
  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.body":
    "As sugestões por cima do mural deslizam de lado numa faixa, e o mural começa mais acima; cada cartão mantém as escolhas.",

  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.title":
    "Os filtros de membros mostram quantas pessoas estão por trás de cada um",
  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.body":
    "Cada opção da barra lateral traz o número de pessoas por trás dela, contado com o que escolheste; as vazias ficam esbatidas.",

  "changelog.entries.an-empty-browse-stops-blaming-your-filters.title":
    "Um Explorar vazio deixa de culpar os teus filtros",
  "changelog.entries.an-empty-browse-stops-blaming-your-filters.body":
    "Com filtros ligados, um Explorar vazio aponta as datas, o bairro e o tipo de convívio que podes alargar.",

  "changelog.entries.one-row-of-tabs-on-events.title":
    "Uma só linha de separadores nos Eventos",
  "changelog.entries.one-row-of-tabs-on-events.body":
    "Destaques, Explorar e Calendário sobem para o cabeçalho e a segunda barra fixa saiu; as ligações diretas funcionam.",

  "changelog.entries.the-recap-card-leaves-ways-to-gather.title":
    "O cartão das retrospetivas sai das formas de nos juntarmos",
  "changelog.entries.the-recap-card-leaves-ways-to-gather.body":
    "O Revive o último apontava para uma retrospetiva que ainda não existe, por isso saiu da faixa; ficam três portas iguais.",

  "changelog.entries.a-nomination-can-say-where-to-find-them.title":
    "Uma nomeação pode dizer onde encontrar a pessoa",
  "changelog.entries.a-nomination-can-say-where-to-find-them.body":
    "Uma nomeação aceita dois extras opcionais: o perfil da pessoa aqui, ou uma ligação pública como um Instagram.",

  "changelog.entries.the-communities-toolbar-becomes-one-line.title":
    "A barra das comunidades passa a uma linha",
  "changelog.entries.the-communities-toolbar-becomes-one-line.body":
    "Quatro faixas passam a uma linha: o alternador, a pesquisa com o Refinar ao lado e Começar uma comunidade.",

  "changelog.entries.three-icons-leave-the-events-header.title":
    "Três ícones saem do cabeçalho dos eventos",
  "changelog.entries.three-icons-leave-the-events-header.body":
    "Roda dentada, sino e lupa saíram; fica o nome da página, o alternador Os meus eventos e Descobrir, e Organizar um convívio.",

  "changelog.entries.browse-events-gets-the-same-refine.title":
    "Explorar eventos ganha o mesmo Refinar",
  "changelog.entries.browse-events-gets-the-same-refine.body":
    "O quadro do Descobrir ganha um campo de pesquisa e um Refinar com quando, bairro, tipo de encontro e custo.",

  "changelog.entries.your-events-filters-fold-away.title":
    "Os filtros dos teus eventos recolhem-se",
  "changelog.entries.your-events-filters-fold-away.body":
    "As etiquetas de secção, os filtros e a ordenação vivem atrás de um só Refinar, que mostra um número quando algo está ligado.",

  "changelog.entries.the-communities-filters-fold-away.title":
    "Os filtros das comunidades recolhem-se",
  "changelog.entries.the-communities-filters-fold-away.body":
    "Categorias, tags, os dois interruptores e a ordenação ficam atrás de um só Refinar, o painel do diretório de Lisboa.",

  "changelog.entries.your-sort-and-your-location-both-count.title":
    "A tua ordenação e a tua localização contam as duas",
  "changelog.entries.your-sort-and-your-location-both-count.body":
    "Por bairro ordena pela proximidade e A-Z fica alfabético, com o tempo a pé em cada cartão.",

  "changelog.entries.one-line-of-controls-on-the-directory.title":
    "Uma linha de controlos no diretório",
  "changelog.entries.one-line-of-controls-on-the-directory.body":
    "A ordenação mudou-se para dentro de Refinar, e o que restringe a lista aparece em etiquetas removíveis sob a pesquisa.",

  "changelog.entries.an-empty-partner-roster-says-so.title":
    "Uma lista de parceiros vazia di-lo",
  "changelog.entries.an-empty-partner-roster-says-so.body":
    "Sem parceiros aprovados, a página de Parceiros di-lo com clareza e oferece um botão direto para a candidatura.",

  "changelog.entries.the-tag-filter-opens-in-line.title":
    "O filtro de etiquetas abre em linha",
  "changelog.entries.the-tag-filter-opens-in-line.body":
    "As Etiquetas da página das comunidades abrem sob o botão, as 53 de uma vez; no telemóvel o painel desloca-se sozinho.",

  "changelog.entries.pages-that-get-to-the-point.title":
    "Páginas que vão direto ao assunto",
  "changelog.entries.pages-that-get-to-the-point.body":
    "Onze páginas perderam o segundo título gigante e a faixa vazia por cima, e o primeiro item está no ecrã mal a página chega.",

  "changelog.entries.your-communities-start-at-the-cards.title":
    "As tuas comunidades começam nos cartões",
  "changelog.entries.your-communities-start-at-the-cards.body":
    "Um só cabeçalho leva a saudação e o alternador As minhas comunidades e Descobrir; os cartões vêm logo a seguir.",

  // ── 27 de agosto de 2026 ──────────────────────────────────────────────────
  "changelog.entries.unused-uploads-filter.title":
    "Encontrar uploads que ninguém usa",
  "changelog.entries.unused-uploads-filter.body":
    "A consola de uploads passa a filtrar pelos ficheiros que nada na plataforma referencia, ou pelos que continuam em uso. Recarrega antes de eliminar: um conjunto de referências vazio fica por verificar.",

  // ── 26 de agosto de 2026 ──────────────────────────────────────────────────
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.title":
    "Os guias aparecem depois de uma editora os verificar",
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.body":
    "Um guia só chega ao índice e à pesquisa depois de uma editora o ler; sem revisão, a página mostra as linhas de apoio.",
  "changelog.entries.the-rules-open-without-leaving-the-queue.title":
    "As regras de moderação abrem sem sair da fila",
  "changelog.entries.the-rules-open-without-leaving-the-queue.body":
    "As linhas vermelhas e o posicionamento da plataforma abrem numa janela por cima da fila, com um botão para a página completa.",
  "changelog.entries.reporting-that-someone-outed-you.title":
    "Denunciar que alguém te expôs",
  "changelog.entries.reporting-that-someone-outed-you.body":
    "O outing e o doxxing são motivos de denúncia no formulário e nas perguntas públicas, e vão para a fila de emergência.",
  "changelog.entries.a-quieter-option-before-you-go.title":
    "Uma opção mais calma antes de apagares a conta",
  "changelog.entries.a-quieter-option-before-you-go.body":
    "A faixa ao lado de desativar e apagar leva-te às notificações, onde escolhes o que chega e defines horas de silêncio.",
  "changelog.entries.a-refused-moderation-action-says-why.title":
    "Quem modera fica a saber porque é que uma ação foi recusada",
  "changelog.entries.a-refused-moderation-action-says-why.body":
    "Quando uma sanção não tem pessoa sobre quem recair, anúncio não reivindicado ou conta apagada, vês o caso e o que fazer.",
  "changelog.entries.the-decision-sample-says-who-decided.title":
    "A amostra de decisões diz quem decidiu cada uma",
  "changelog.entries.the-decision-sample-says-who-decided.body":
    "Cada decisão recente sobre convites nomeia quem decidiu, as tuas leem-se como Tu, e podes reduzir a amostra a uma só pessoa.",
  "changelog.entries.communities-your-connections-already-joined.title":
    "Comunidades onde as tuas pessoas já estão",
  "changelog.entries.communities-your-connections-already-joined.body":
    "A página das comunidades lista grupos onde as tuas ligações entraram sem ti, por ordem de quantas estão em cada um.",
  "changelog.entries.follow-your-listing-claim.title":
    "Acompanha a reivindicação do teu anúncio do princípio ao fim",
  "changelog.entries.follow-your-listing-claim.body":
    "Uma página lista as tuas reivindicações de anúncios: o ponto de cada uma, há quanto espera e a data prometida.",
  "changelog.entries.the-accessibility-statement-is-published.title":
    "A declaração de acessibilidade está publicada",
  "changelog.entries.the-accessibility-statement-is-published.body":
    "Cobre leitores de ecrã, teclado e movimento reduzido, diz o que não foi auditado, e tem ligação no rodapé.",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.title":
    "A política de privacidade diz o que guarda, e por quanto tempo",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.body":
    "A retenção é um calendário por tipo de dados, estão nomeados dez fornecedores, e cada direito aponta para onde o exerces.",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.title":
    "O que dissemos que apagávamos passa a ser apagado",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.body":
    "Acesso, notas alimentares e check-ins apagam-se 30 dias após o encontro; a presença fica, as exportações expiram em 7.",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.title":
    "As denúncias dizem porque te estão a travar",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.body":
    "Fazer várias denúncias seguidas diz-te que te está a travar um instante e porquê; uma mensagem em bruto foi corrigida.",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.title":
    "As decisões em lote sobre pedidos de convite passam a pedir confirmação",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.body":
    "Um lote pede confirmação; se parte falhar, vês que pedido e porquê, e esses ficam selecionados para repetir.",
  "changelog.entries.decision-sampling-sits-with-the-queue.title":
    "A amostragem de decisões passou para a fila que analisa",
  "changelog.entries.decision-sampling-sits-with-the-queue.body":
    "A amostra de decisões recentes sobre convites saiu de uma página só de administração para a própria fila de pedidos.",
  "changelog.entries.every-moderation-queue-reports-its-health.title":
    "Cada fila de moderação dá conta do seu estado",
  "changelog.entries.every-moderation-queue-reports-its-health.body":
    "Um painel mostra a dimensão de cada fila, a espera mais longa e o que passou o prazo; quem modera é avisado ao limite.",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.title":
    "Arrumação: o serviço de email e dois becos sem saída",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.body":
    "O serviço de email do backend desapareceu, pois a QueerPulse não envia email; a página do protótipo de evento foi com ele.",

  "changelog.entries.the-about-page-shows-its-work-in-place.title":
    "A página Sobre mostra o seu trabalho ali mesmo",
  "changelog.entries.the-about-page-shows-its-work-in-place.body":
    "Os links de referência abrem um diálogo com um resumo da cláusula, guia ou registo, e um botão para a página completa.",
  "changelog.entries.perks-that-grant-something-real.title":
    "Vantagens que dão algo real",
  "changelog.entries.perks-that-grant-something-real.body":
    "As vantagens ao teu alcance podem ser reclamadas, uma de convites aumenta mesmo a tua quota mensal, e as vazias saíram.",
  "changelog.entries.renew-your-card-before-it-runs-out.title":
    "Renova o teu cartão antes de expirar",
  "changelog.entries.renew-your-card-before-it-runs-out.body":
    "Quando a tua comunidade o permite, renovas o cartão a partir da tua conta; um aviso chega trinta dias antes de terminar.",
  "changelog.entries.volunteering-that-counts.title": "Voluntariado que conta",
  "changelog.entries.volunteering-that-counts.body":
    "Quem publicou a oportunidade confirma que apareceste e regista as horas; as sessões confirmadas dão pontos de reconhecimento.",
  "changelog.entries.support-offers-a-community-receives.title":
    "Ofertas de apoio que a comunidade recebe",
  "changelog.entries.support-offers-a-community-receives.body":
    "Uma oferta de ajuda da equipa chega à comunidade; quem a gere é notificado e aceita ou recusa nas Ferramentas de moderação.",
  "changelog.entries.see-how-often-your-cards-are-checked.title":
    "Vê quantas vezes os cartões são verificados",
  "changelog.entries.see-how-often-your-cards-are-checked.body":
    "As Ferramentas de moderação mostram quantas vezes cada cartão foi verificado; quem verificou e onde nunca fica registado.",
  "changelog.entries.check-what-happened-to-your-invite-request.title":
    "Podes saber o que aconteceu ao teu pedido de convite",
  "changelog.entries.check-what-happened-to-your-invite-request.body":
    "O pedido dá-te um código de referência; introduz-o quando quiseres para ver como está, com o convite ali se for sim.",
  "changelog.entries.an-invite-you-can-address-to-a-person.title":
    "Um convite que podes dirigir a uma pessoa",
  "changelog.entries.an-invite-you-can-address-to-a-person.body":
    "Um convite pode levar o email da pessoa a quem se destina, e só quem inicia sessão com esse endereço o pode usar.",
  "changelog.entries.your-invites-are-where-you-can-find-them.title":
    "Os teus convites estão onde os irias procurar",
  "changelog.entries.your-invites-are-where-you-can-find-them.body":
    'O menu da conta tem uma linha "Convidar alguém" com o que te resta este mês, e o teu perfil diz quando o limite renova.',
  "changelog.entries.account-security-has-a-real-home.title":
    "A segurança da conta tem finalmente uma página sua",
  "changelog.entries.account-security-has-a-real-home.body":
    "A segurança abre uma página sobre como inicias sessão, que sessões e dispositivos estão ativos e onde apagar os dados.",
  "changelog.entries.your-photos-come-with-your-export.title":
    "As tuas fotografias vão com a exportação de dados",
  "changelog.entries.your-photos-come-with-your-export.body":
    "Todos os ficheiros que carregaste vão dentro do arquivo com um índice; escolhe o formato CSV ou Ambos para os receberes.",
  "changelog.entries.every-page-announces-itself.title":
    "Cada página anuncia-se a um leitor de ecrã",
  "changelog.entries.every-page-announces-itself.body":
    "Cada página diz o seu nome ao abrir e coloca-te no conteúdo; administração e início de sessão ganharam ligação de salto.",
  "changelog.entries.the-contact-form-reaches-a-person.title":
    "O formulário de contacto chega a uma pessoa",
  "changelog.entries.the-contact-form-reaches-a-person.body":
    "Contacto, parcerias, apoios, sugestões e Cultura chegam a uma consola, com registo de quem tratou de cada uma e quando.",
  "changelog.entries.an-approved-invite-can-be-found-again.title":
    "Um convite aprovado volta a poder ser encontrado",
  "changelog.entries.an-approved-invite-can-be-found-again.body":
    "Os pedidos decididos têm separador próprio, com o link do convite, a validade à vista e uma forma de reemitir o expirado.",
  "changelog.entries.no-stock-photo-on-a-real-application.title":
    "Nenhuma fotografia de arquivo numa candidatura real",
  "changelog.entries.no-stock-photo-on-a-real-application.body":
    "A administração associava pessoas a fotos de exemplo da demonstração; pessoas reais têm agora a sua foto ou as iniciais.",

  "changelog.entries.the-transparency-report-is-published.title":
    "O relatório de transparência foi publicado",
  "changelog.entries.the-transparency-report-is-published.body":
    "Por trimestre: o que foi denunciado e porquê, a demora das decisões e o que se seguiu; valores baixos ficam reservados.",
  "changelog.entries.a-permanent-ban-needs-two-moderators.title":
    "Uma remoção definitiva passa a precisar de um segundo moderador",
  "changelog.entries.a-permanent-ban-needs-two-moderators.body":
    "O conteúdo sai de imediato; a decisão sobre a conta espera por um segundo moderador e caduca ao fim de 72 horas.",
  "changelog.entries.appeals-have-a-deadline.title":
    "Os recursos passam a ter um prazo que é medido",
  "changelog.entries.appeals-have-a-deadline.body":
    "Tens 14 dias para recorrer e a decisão é devida em 7; a fila está ordenada pelo que vence primeiro.",
  "changelog.entries.a-community-ban-can-end.title":
    "Uma expulsão de uma comunidade pode ter data de fim",
  "changelog.entries.a-community-ban-can-end.body":
    "A moderação pode definir uma data de fim, e sabes o motivo, a regra da casa em que se baseia e o dia em que termina.",
  "changelog.entries.a-warning-now-reaches-you.title":
    "Um aviso passa mesmo a chegar-te",
  "changelog.entries.a-warning-now-reaches-you.body":
    "Os avisos fechavam em silêncio; um aviso a uma publicação, resposta, mensagem ou comentário teu chega-te com o motivo.",
  "changelog.entries.community-mods-can-read-what-was-reported.title":
    "A moderação de uma comunidade passa a ver o que foi denunciado",
  "changelog.entries.community-mods-can-read-what-was-reported.body":
    "As denúncias incluem a publicação, autoria, urgência e prazo; as urgentes sobre exposição ou dados pessoais vão à equipa.",

  // ── SecurityPolicyPage.tsx — divulgação de vulnerabilidades ────────────────────
  // Os créditos de agradecimento (securityPolicy.data.ts SECURITY_HALL_OF_FAME) são
  // registos de atribuição: nomes dos investigadores e o tipo/data da
  // vulnerabilidade. Ficam em inglês, como os restantes valores de registo
  // indicados no topo deste ficheiro, e a grelha fica escondida enquanto a
  // lista estiver vazia.
  "securityPolicy.meta.title": "Segurança e divulgação de vulnerabilidades",
  "securityPolicy.meta.description":
    "Como comunicar uma vulnerabilidade de segurança no QueerPulse, o que está dentro do âmbito e o que acontece depois de comunicares.",
  "securityPolicy.hero.eyebrow": "Divulgação de vulnerabilidades",
  "securityPolicy.hero.titleTop": "Encontraste algo?",
  "securityPolicy.hero.titleEm": "Diz-nos.",
  "securityPolicy.hero.sub":
    "Levamos a segurança a sério. Se encontraste uma vulnerabilidade no QueerPulse, queremos saber. Esta página explica como comunicá-la, o que esperar e como tratamos as divulgações.",

  "securityPolicy.commitment.eyebrow": "O nosso compromisso",
  "securityPolicy.commitment.title": "Não <em>penalizamos</em> a boa fé.",
  "securityPolicy.commitment.body1":
    "Os investigadores de segurança que comunicam vulnerabilidades de boa fé não sofrerão qualquer ação legal da nossa parte. Não contactaremos a tua entidade patronal, o teu fornecedor de internet nem as autoridades, a menos que uses o teu acesso para prejudicar membros. Acreditamos que a investigação de segurança torna toda a gente mais segura, e ficamos gratos quando alguém dedica tempo a comunicar o que encontra.",
  "securityPolicy.commitment.body2":
    "Pedimos-te que nos dês um prazo razoável para corrigir um problema antes de o divulgares publicamente. Em troca, comprometemo-nos a confirmar a receção da tua comunicação em 48 horas, a manter-te a par do progresso e a creditar-te nos nossos agradecimentos de segurança, se assim o quiseres.",

  "securityPolicy.scope.eyebrow": "Âmbito",
  "securityPolicy.scope.title": "O que está <em>no âmbito.</em>",
  "securityPolicy.scope.inLabel": "No âmbito",
  "securityPolicy.scope.outLabel": "Fora do âmbito",
  "securityPolicy.scope.in.1": "queerpulse.com e *.queerpulse.com",
  "securityPolicy.scope.in.2": "Autenticação e gestão de sessões",
  "securityPolicy.scope.in.3": "Acesso a dados e escalada de privilégios",
  "securityPolicy.scope.in.4": "XSS armazenado e refletido",
  "securityPolicy.scope.in.5": "CSRF em endpoints autenticados",
  "securityPolicy.scope.in.6": "Injeção de SQL",
  "securityPolicy.scope.in.7": "Referências diretas a objetos inseguras",
  "securityPolicy.scope.in.8": "Exposição de dados sensíveis",
  "securityPolicy.scope.out.1": "Ataques de negação de serviço",
  "securityPolicy.scope.out.2": "Engenharia social da nossa equipa",
  "securityPolicy.scope.out.3": "Ataques físicos à infraestrutura",
  "securityPolicy.scope.out.4": "Spam ou contorno dos limites de tráfego",
  "securityPolicy.scope.out.5":
    "Infraestrutura de terceiros (Hetzner, Postmark, Backblaze)",
  "securityPolicy.scope.out.6": "Clickjacking em páginas não sensíveis",
  "securityPolicy.scope.out.7":
    "Cabeçalhos de segurança em falta (apenas comunicação)",

  "securityPolicy.process.eyebrow": "Processo",
  "securityPolicy.process.aria": "O que acontece depois de comunicares",
  "securityPolicy.process.title":
    "O que acontece <em>depois de comunicares.</em>",
  "securityPolicy.process.step1.title": "Confirmação",
  "securityPolicy.process.step1.text":
    "Confirmamos a receção em 48 horas e avisamos-te de que estamos a analisar. Atribuímos um número de referência para podermos acompanhá-la em conjunto.",
  "securityPolicy.process.step1.note": "Objetivo: 48 horas",
  "securityPolicy.process.step2.title": "Avaliação",
  "securityPolicy.process.step2.text":
    "Investigamos e avaliamos a gravidade. Mantemos-te a par e poderemos colocar perguntas de seguimento. Se não conseguirmos reproduzir o problema, explicamos-te porquê.",
  "securityPolicy.process.step2.note": "Objetivo: 5 dias úteis",
  "securityPolicy.process.step3.title": "Correção",
  "securityPolicy.process.step3.text":
    "Para vulnerabilidades confirmadas, corrigimos e implementamos uma atualização. O prazo depende da gravidade. Os problemas críticos são tratados como emergências.",
  "securityPolicy.process.step3.note":
    "Crítico: <72h · Elevado: <7 dias · Médio/Baixo: próxima versão",
  "securityPolicy.process.step4.title": "Divulgação",
  "securityPolicy.process.step4.text":
    "Coordenamos contigo um calendário de divulgação. Creditamos-te nos nossos agradecimentos de segurança, a não ser que prefiras o anonimato.",
  "securityPolicy.process.step4.note":
    "Por omissão: divulgação coordenada a 90 dias",

  "securityPolicy.ack.eyebrow": "Agradecimentos",
  "securityPolicy.ack.title":
    "<em>Investigadores</em> de segurança que ajudaram.",
  "securityPolicy.ack.body":
    "Estamos gratos aos seguintes investigadores que divulgaram vulnerabilidades de forma responsável. (Listados com autorização.)",
  "securityPolicy.ack.empty":
    "Ainda não há ninguém creditado aqui. Reporta algo e, se quiseres o crédito, o teu nome fica registado.",

  "securityPolicy.report.titleTop": "Comunicar uma",
  "securityPolicy.report.titleEm": "vulnerabilidade",
  "securityPolicy.report.body":
    "Cifra a tua comunicação com a nossa chave PGP e envia-nos um email. Inclui os passos para reproduzir, o impacto potencial e qualquer prova de conceito.",
  "securityPolicy.report.cta": "Enviar email à equipa de segurança",
  "securityPolicy.pgp.label": "Chave pública PGP",
  "securityPolicy.pgp.copyCta": "Copiar chave",
  "securityPolicy.pgp.copied": "Chave PGP copiada.",
  "securityPolicy.pgp.copyFailed":
    "Falha ao copiar. Seleciona e copia manualmente.",
  "securityPolicy.pgp.unavailable":
    "Ainda não publicámos uma chave. Escreve-nos em texto simples e combinamos um canal encriptado antes de enviares qualquer detalhe.",

  "securityPolicy.outro.titleTop": "A segurança é",
  "securityPolicy.outro.titleEm": "trabalho de comunidade.",
  "securityPolicy.outro.sub":
    "Obrigade a todas as pessoas que ajudam a manter o QueerPulse seguro.",
  "securityPolicy.outro.cta": "Contactar a equipa de segurança",

  // ── Declaração de acessibilidade (/policies/accessibility) ─────────────
  // LG-01. Espelha en/marketing.ts chave a chave. Cada afirmação vem de algo
  // verificável no repositório; não acrescentes aqui nada que o código não
  // sustente.
  "accessibilityStatement.meta.title":
    "Declaração de acessibilidade do QueerPulse",
  "accessibilityStatement.meta.description":
    "Quão acessível é hoje o QueerPulse, medido face ao WCAG 2.2 nível AA: o que verificamos, o que sabemos que fica aquém, como comunicar uma barreira e o que fazer se a nossa resposta não chegar.",
  "accessibilityStatement.title": "Declaração de <em>acessibilidade</em>",
  "accessibilityStatement.meta.prepared": "Preparada a {date}",
  "accessibilityStatement.meta.reviewed": "Última revisão a {date}",
  "accessibilityStatement.meta.standard": "Medida face a {standard}",
  "accessibilityStatement.standard": "WCAG 2.2 nível AA",
  "accessibilityStatement.plain.text":
    "Apontamos ao WCAG 2.2 nível AA e estamos lá em parte. As verificações automáticas correm em cada build e são mantidas a zero falhas. Ainda ninguém testou esta plataforma com um leitor de ecrã numa sessão que possamos mostrar, e parte da nossa cor de marca fica abaixo do contraste que exigimos a nós próprias. Ambas as coisas estão escritas em baixo, com uma forma de nos dizeres o que nos escapou.",

  "accessibilityStatement.commitment.title": "O nosso compromisso",
  "accessibilityStatement.commitment.p1":
    "Publicamos isto porque há pessoas que contam com isto. Uma plataforma cujo sentido inteiro é poderes ser quem és nalgum lado tem de ser utilizável por todas essas pessoas, e escrever onde estamos mesmo é a única forma de sermos responsabilizadas por isso.",
  "accessibilityStatement.commitment.p2":
    "Trabalhamos segundo as Diretrizes de Acessibilidade para o Conteúdo Web (WCAG) 2.2, nível AA. A norma europeia de acessibilidade EN 301 549 exige o nível AA do WCAG 2.1. O WCAG 2.2 contém tudo o que está no 2.1 e acrescenta mais, por isso apontamos à versão mais recente.",
  "accessibilityStatement.commitment.p3":
    "Publicamos isto por escolha nossa. A nossa leitura da lei portuguesa, exposta na secção seguinte, é a de que nada nos obriga a isso hoje. Preferimos ser mensuráveis a estar isentas.",
  "accessibilityStatement.commitment.p4":
    "Quase tudo o que se segue é imposto pelo build e não deixado à boa vontade. Onde não é, dizemo-lo.",

  "accessibilityStatement.scope.title": "O que esta declaração cobre",
  "accessibilityStatement.scope.p1":
    "Esta declaração aplica-se à aplicação web do QueerPulse, incluindo a experiência no telemóvel e a aplicação instalável, que são a mesma aplicação.",
  "accessibilityStatement.scope.p2":
    "O Cinema, o Studio e a Cultura ficam de fora. Nenhum deles abriu, cada um resolve para uma página simples a dizer que ainda não abriu, e não há conteúdo por trás para tornar acessível. Esta declaração será alargada a cada um no dia em que abrir.",
  "accessibilityStatement.scope.p3":
    "O que os membros escrevem e carregam pertence-lhes. Damos os campos e as perguntas que permitem descrever uma imagem ou explicar como se entra num espaço. Não podemos prometer que toda a gente os preenche.",

  "accessibilityStatement.legal.title": "Onde está a lei",
  "accessibilityStatement.legal.p1":
    "Portugal transpôs o Ato Europeu da Acessibilidade, a Diretiva (UE) 2019/882, através do <lei>Decreto-Lei n.º 82/2022</lei>. Entrou em vigor a 7 de dezembro de 2022 e aplica-se aos serviços prestados a partir de 28 de junho de 2025. Duas coisas nesse diploma fazem com que, muito provavelmente, ele não alcance hoje o QueerPulse.",
  "accessibilityStatement.legal.services":
    "<strong>A lista de serviços que abrange.</strong> O artigo 2.º, n.º 3 nomeia os serviços de comunicações eletrónicas; o acesso a serviços de comunicação social audiovisual; determinados elementos do transporte aéreo, de autocarro, ferroviário, marítimo e por vias navegáveis interiores de passageiros; os terminais interativos de transporte; os serviços bancários e financeiros destinados aos consumidores; os livros eletrónicos e os programas informáticos dedicados; os serviços de comércio eletrónico; e o atendimento das chamadas de emergência para o 112. Uma plataforma comunitária sem fins comerciais não está em nenhuma dessas listas. A única alínea em que poderia caber é a do comércio eletrónico, e o QueerPulse não tem nenhum processador de pagamentos nem recebe dinheiro de ninguém.",
  "accessibilityStatement.legal.microenterprise":
    "<strong>A isenção das microempresas.</strong> O artigo 2.º, n.º 5, alínea b) diz que o decreto-lei não se aplica às microempresas que prestam os serviços previstos no n.º 3. Uma microempresa, na definição que o decreto-lei vai buscar à Diretiva, emprega menos de 10 pessoas e tem um volume de negócios anual ou um balanço total anual não superior a 2 milhões de euros.",
  "accessibilityStatement.legal.p2":
    "A bilhética paga nos encontros é uma questão de produto ainda em aberto. Se o QueerPulse alguma vez vender fosse o que fosse, passa plausivelmente a ser um serviço de comércio eletrónico ao abrigo do artigo 2.º, n.º 3, alínea g). O artigo 13.º, n.º 2, alínea b) passaria então a pedir-nos que explicássemos publicamente, por escrito e oralmente, de que forma o serviço cumpre os requisitos de acessibilidade aplicáveis, a menos que a isenção das microempresas continuasse a cobrir-nos. Escrevemos isto como um sinal para irmos verificar, e não fazemos nenhuma previsão sobre qual seria a resposta.",
  "accessibilityStatement.legal.p3":
    "A declaração de acessibilidade em que a maior parte das pessoas pensa vem de outra lei. A Diretiva sobre a Acessibilidade da Web, a (UE) 2016/2102, transposta cá pelo Decreto-Lei n.º 83/2018, vincula os organismos do setor público. O QueerPulse não é um deles.",
  "accessibilityStatement.legal.disclaimerLabel":
    "Isto não é aconselhamento jurídico",
  "accessibilityStatement.legal.disclaimer":
    "Esta secção é um resumo de como as pessoas que gerem o QueerPulse leem a lei na parte que nos toca. Nenhuma advogada a reviu, não é aconselhamento jurídico e não deves apoiar-te nela para a tua própria situação. Se achas que lemos a lei mal, diz-nos e vamos verificar.",

  "accessibilityStatement.status.title": "Estado de conformidade",
  "accessibilityStatement.status.p1":
    "O QueerPulse está <strong>parcialmente conforme</strong> com o WCAG 2.2 nível AA. Parcialmente conforme quer dizer que a maior parte da norma é cumprida e que algumas partes não são. As partes que sabemos ficarem aquém estão listadas mais abaixo, uma a uma.",
  "accessibilityStatement.status.p2":
    "Não temos nenhuma certificação de acessibilidade e não reclamamos nenhuma. Nenhuma entidade externa avaliou esta plataforma.",

  "accessibilityStatement.works.title": "O que funciona hoje",
  "accessibilityStatement.works.intro":
    "Cada um destes pontos está no produto agora e tem por trás uma verificação que faria o build falhar se fosse retirada.",
  "accessibilityStatement.works.keyboard":
    "<strong>Teclado.</strong> Cada página abre com uma ligação que salta a navegação e vai direta ao conteúdo, e tudo o que alcanças com o Tab desenha um contorno de foco visível. Esse contorno tem dois tons para se manter visível tanto nas páginas claras como nos painéis escuros: 5,38:1 sobre o fundo creme, 12,6:1 sobre o ameixa.",
  "accessibilityStatement.works.dialogs":
    "<strong>Caixas de diálogo.</strong> Abrir um diálogo leva o foco para dentro dele, o Tab fica lá dentro, o Escape fecha o que está por cima e fechar devolve o foco ao controlo que o abriu.",
  "accessibilityStatement.works.forms":
    "<strong>Formulários.</strong> Cada etiqueta visível está ligada ao seu campo, o texto de erro é anunciado e ligado ao campo a que pertence, o texto de ajuda é anunciado com o campo, e os campos obrigatórios estão marcados para os leitores de ecrã e não só para os olhos.",
  "accessibilityStatement.works.landmarks":
    "<strong>Estrutura e navegação.</strong> Cada página tem exatamente uma região principal. Um teste verifica isso diretamente na página inicial, e a passagem do axe aplica a mesma regra às outras dez páginas que cobre. As páginas fora dessas onze não são verificadas. Mudar de página anuncia a página nova e coloca lá o foco, coisa que uma aplicação de página única não faz sozinha.",
  "accessibilityStatement.works.motion":
    "<strong>Movimento.</strong> Quando o teu dispositivo pede movimento reduzido, as animações e o deslizamento suave desligam-se em toda a interface. As Definições têm também um interruptor de Reduzir movimento para quem tenha o dispositivo a dizer outra coisa.",
  "accessibilityStatement.works.status":
    "<strong>Mensagens de estado.</strong> As confirmações são anunciadas com calma e as falhas interrompem, para que um erro seja difícil de escapar.",
  "accessibilityStatement.works.language":
    "<strong>Idioma.</strong> A página declara o seu idioma e atualiza-o quando trocas entre inglês e português, para que um leitor de ecrã a leia com a voz certa.",

  "accessibilityStatement.shortfalls.title":
    "O que não está totalmente acessível",
  "accessibilityStatement.shortfalls.intro":
    "Estas são as falhas que conhecemos. Cada uma indica a razão e a alternativa que existe hoje. Se encontrares alguma coisa que não esteja nesta lista, diz-nos, porque quer dizer que não sabíamos.",
  "accessibilityStatement.shortfalls.colour":
    "<strong>O nosso coral, usado para dar ênfase.</strong> Medido sobre o fundo creme das páginas chega a 2,63:1, e sobre branco a 2,91:1, abaixo dos 4,5:1 que o nível AA pede para texto corrido. As palavras enfatizadas estão sempre também em itálico, por isso a cor nunca é o único sinal. Onde a cor carrega significado que tens de ler, como um erro de formulário, uma marca de campo obrigatório ou uma linha de sucesso, usamos variantes mais escuras de coral e de jade que passam. A revisão do resto da interface ainda não foi feita.",
  "accessibilityStatement.shortfalls.preferences":
    "<strong>Definições de acessibilidade que ainda não fazem nada.</strong> A secção de Acessibilidade das Definições lista alto contraste, texto maior, um tipo de letra amigo da dislexia, espaçamento mais largo, contornos de foco mais fortes, alvos de toque maiores e um tema de cor. Todos estão marcados como Em breve e desativados na interface, para que não possam anunciar uma mudança que não fazemos. Dois controlos ali são reais: Reduzir movimento e a ligação para saltar para o conteúdo.",
  "accessibilityStatement.shortfalls.textSize":
    "<strong>Tamanho do texto.</strong> O texto está definido em pixels em toda a aplicação, por isso mudar o tamanho de letra por omissão do teu navegador não o aumenta. O zoom do navegador e do sistema funciona normalmente e o layout reorganiza-se até à largura de um telemóvel. O controlo de tamanho de texto nas Definições é um dos que estão Em breve.",
  "accessibilityStatement.shortfalls.focusAfterError":
    "<strong>Foco depois de um envio falhado.</strong> Existe um auxiliar que leva o foco ao primeiro campo com erro e está ligado a um formulário até agora. Em todos os outros o erro continua a ser anunciado e continua ligado ao seu campo, e o foco fica onde o deixaste.",
  "accessibilityStatement.shortfalls.sample":
    "<strong>As verificações automáticas cobrem uma amostra de páginas.</strong> A suite de testes corre o axe-core sobre onze páginas representativas e a passagem de contraste corre num navegador real sobre seis. A aplicação tem cerca de 140 componentes de página, por isso a maioria nunca foi verificada por máquina uma a uma. A amostra foi escolhida para cobrir as peças partilhadas, que é onde vive a maior parte dos defeitos.",
  "accessibilityStatement.shortfalls.assistiveTech":
    "<strong>Nenhum teste com tecnologia de apoio registado.</strong> Nunca foi feita e escrita uma sessão com leitor de ecrã, dispositivo de comutação ou controlo por voz nesta plataforma. As ferramentas automáticas encontram uma minoria dos problemas de acessibilidade, por isso esta é a maior lacuna no que sabemos, e fechá-la é o próximo ponto desta lista.",
  "accessibilityStatement.shortfalls.pdf":
    "<strong>Um PDF para descarregar.</strong> O kit de imprensa oferece uma referência de marca imprimível em PDF, e essa não foi verificada quanto a etiquetagem ou ordem de leitura. Os mesmos valores de cor seguem ao lado num ficheiro de texto simples, que qualquer tecnologia de apoio lê corretamente.",
  "accessibilityStatement.shortfalls.language":
    "<strong>Duas línguas de interface.</strong> A interface está disponível em inglês e em português. O que um membro ou uma pessoa da redação escreve fica na língua em que foi escrito, e nós não o traduzimos.",

  "accessibilityStatement.prepared.title": "Como esta declaração foi preparada",
  "accessibilityStatement.prepared.p1":
    "Esta é uma autoavaliação, preparada por quem constrói o QueerPulse a partir das ferramentas de acessibilidade que estão no código e das auditorias escritas guardadas ao lado. Nenhuma entidade externa participou e nenhum teste com pessoas utilizadoras a informou.",
  "accessibilityStatement.prepared.lint":
    "<strong>Regras de lint que bloqueiam o build.</strong> Todas as regras de acessibilidade do eslint-plugin-jsx-a11y correm sobre todo o código. Nove são erros duros, e cobrem alternativas em texto para imagens, atributos e papéis ARIA válidos, e etiquetas ligadas aos seus campos. As restantes são mantidas num orçamento de zero avisos por uma verificação que corre em primeiro lugar no build, por isso um único aviso novo em qualquer sítio faz o build falhar.",
  "accessibilityStatement.prepared.axe":
    "<strong>axe-core na suite de testes.</strong> Onze páginas representativas são desenhadas através do router real e analisadas com o axe-core, sem nada em quarentena e sem nenhuma regra suprimida, tirando a única que um motor sem desenho não consegue calcular.",
  "accessibilityStatement.prepared.contrast":
    "<strong>Medição de contraste de cor.</strong> Cada par de cores que a interface desenha na realidade foi calculado com a fórmula do WCAG em vez de julgado a olho, foi escrito, e foi corrigido ou recebeu uma variante que passa. Uma passagem de contraste em navegador sobre seis páginas protege contra regressões.",
  "accessibilityStatement.prepared.p2":
    "As ferramentas automáticas apanham uma minoria dos problemas de acessibilidade, normalmente estimada entre um terço e metade. Tudo o que uma máquina não vê, e toda a questão de saber se esta plataforma é mesmo utilizável com um leitor de ecrã, continua por verificar. É por isso que a secção seguinte importa mais do que as duas anteriores.",

  "accessibilityStatement.feedback.title": "Diz-nos onde está a barreira",
  "accessibilityStatement.feedback.p1":
    "Se alguma coisa aqui te bloqueia, diz-nos. Não precisas de conta e não precisas de saber porque está partido. Descreve o que estavas a tentar fazer e o que aconteceu em vez disso, e indica a página se conseguires.",
  "accessibilityStatement.feedback.p2":
    "Usa o formulário de contacto e escolhe <strong>Acessibilidade</strong> como tema. A mensagem fica guardada para quem gere a plataforma, que lê todas.",
  "accessibilityStatement.feedback.p3":
    "O QueerPulse não envia email automático, por isso qualquer resposta é escrita por uma pessoa para o endereço que nos deres. Procuramos responder em {days} dias úteis. Se o teu relato for sobre algo que te está a deixar de fora da tua própria conta, diz-o e passa à frente.",
  "accessibilityStatement.feedback.cta": "Comunicar uma barreira de acesso",

  "accessibilityStatement.enforcement.title": "Se a nossa resposta não chegar",
  "accessibilityStatement.enforcement.p1":
    "Se não respondermos, ou se a resposta deixar a barreira de pé, é aqui que podes seguir, pela ordem com mais hipóteses de te ajudar.",
  "accessibilityStatement.enforcement.tellUs":
    "<strong>Diz-nos primeiro.</strong> O formulário de contacto, no tópico Acessibilidade, guarda o teu relato para as pessoas que gerem a plataforma, e é o caminho mais rápido para a barreira ser vista. Tudo o que vem a seguir parte do princípio de que esse caminho já te falhou.",
  "accessibilityStatement.enforcement.idipd":
    "<strong>IDiPD.</strong> O Instituto para os Direitos das Pessoas com Deficiência, I. P. é a entidade portuguesa que acompanha a aplicação do Decreto-Lei 82/2022 e promove os direitos das pessoas com deficiência. O artigo 36.º faz dele também a entidade que encaminha para o regulador competente as queixas que lhe cheguem diretamente. Chamava-se Instituto Nacional para a Reabilitação, I. P. até o Decreto-Lei n.º 60/2026 lhe mudar o nome. Os contactos estão <idipd>no site do próprio instituto</idipd>, onde se mantêm atualizados.",
  "accessibilityStatement.enforcement.regulator":
    "<strong>O regulador setorial, se alguma vez cairmos no artigo 28.º.</strong> O Decreto-Lei 82/2022 entrega a fiscalização a um regulador diferente por cada categoria de serviço, em vez de a entregar a uma única entidade de acessibilidade. Os serviços de comércio eletrónico cabem à ANACOM. Como está dito acima, não cremos que o QueerPulse seja hoje um serviço abrangido pelo decreto-lei, por isso é bem possível que este caminho não esteja aberto para ti neste momento. Preferimos dizer-te isso com clareza a mandar-te a um regulador que te vai ter de dispensar.",
  "accessibilityStatement.enforcement.p2":
    "Nada disto substitui os tribunais nem qualquer outro direito que tenhas. Se quiseres apresentar queixa e não souberes por onde começar, o IDiPD é a primeira porta certa.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "directory.detail.enquiry.cta": "Enviar mensagem a este negócio",
  "directory.detail.enquiry.deliveryNote":
    "Chega como mensagem direta da tua conta, e só quem gere esta ficha a pode ler.",
  "directory.detail.enquiry.replyNote":
    "A tua primeira mensagem passa. Uma resposta, de qualquer um dos lados, precisa de uma ligação aceite.",
  "directory.detail.enquiry.existingThreadCta": "Abrir a conversa que já tens",
  "directory.detail.enquiry.signInPrompt":
    "Com sessão iniciada podes escrever a um negócio aqui, sem dar um número de telefone nem um email.",
  "directory.detail.enquiry.signInCta": "Iniciar sessão",
  "directory.detail.enquiry.loadErrorTitle":
    "Não conseguimos verificar se este negócio recebe mensagens",
  "directory.detail.enquiry.loadErrorBody":
    "O resto da ficha está bem. Só esta verificação é que não respondeu.",
  "directory.detail.enquiry.unavailable.unclaimed":
    "Ainda ninguém reivindicou esta ficha, por isso não há uma caixa de entrada do negócio por trás dela. Se és tu que geres o {name}, reivindica a ficha e passas a poder ser contactado por aqui.",
  "directory.detail.enquiry.unavailable.noAccount":
    "Esta ficha não está ligada a uma conta que possa receber mensagens, por isso os contactos acima são a forma de lá chegar.",
  "directory.detail.enquiry.unavailable.ownListing":
    "Esta ficha é tua, por isso não há aqui ninguém a quem escrever.",
  "directory.detail.enquiry.unavailable.blocked":
    "Não é possível contactar este negócio a partir da tua conta.",
  "directory.detail.enquiry.ariaLabel": "Escrever a {name}",
  "directory.detail.enquiry.eyebrow": "Mensagem privada",
  "directory.detail.enquiry.title": "Escrever a <em>{name}</em>",
  "directory.detail.enquiry.sub":
    "Isto vai para quem gere esta ficha, como mensagem direta da tua conta. Não fica publicado na ficha.",
  "directory.detail.enquiry.replyNotice":
    "Ainda não têm uma ligação, por isso esta primeira mensagem passa e a conversa fica depois fechada para ambos até que um de vocês aceite uma ligação.",
  "directory.detail.enquiry.bodyLabel": "A tua mensagem",
  "directory.detail.enquiry.bodyPlaceholder":
    "O que gostarias de lhes perguntar?",
  "directory.detail.enquiry.bodyHint": "Pelo menos {min} carateres.",
  "directory.detail.enquiry.charactersLeft": "Carateres restantes: {remaining}",
  "directory.detail.enquiry.cancel": "Cancelar",
  "directory.detail.enquiry.submit": "Enviar mensagem",
  "directory.detail.enquiry.submitting": "A enviar…",
  "directory.detail.enquiry.error.rateLimited":
    "Já escreveste a este negócio hoje. Dá-lhes tempo para responder primeiro.",
  "directory.detail.enquiry.error.notAllowed":
    "Não é possível contactar este negócio a partir da tua conta.",
  "directory.detail.enquiry.error.unavailable":
    "Esta ficha já não recebe mensagens pelo QueerPulse. Tenta os contactos da página.",
  "directory.detail.enquiry.error.gone":
    "Esta ficha já não está disponível, por isso a tua mensagem não foi enviada.",
  "directory.detail.enquiry.error.generic":
    "A tua mensagem não foi enviada. Tenta outra vez daqui a pouco.",
  "directory.detail.enquiry.successAriaLabel":
    "A tua mensagem para {name} foi enviada",
  "directory.detail.enquiry.successTitle": "Mensagem",
  "directory.detail.enquiry.successEm": "enviada",
  "directory.detail.enquiry.successBody":
    "Está na caixa de entrada de quem gere o {name}, como mensagem direta tua.",
  "directory.detail.enquiry.successReplyStep":
    "Ainda não têm uma ligação, por isso a conversa fica fechada para ambos até que um de vocês aceite uma ligação.",
  "directory.detail.enquiry.openThreadCta": "Abrir a conversa",
  "directory.detail.enquiry.doneCta": "Concluído",
  "directory.detail.enquiry.limit.thisBusiness":
    "Já escreveste a {name} hoje. Dá tempo para responderem antes de escreveres outra vez.",
  "directory.detail.enquiry.limit.directory":
    "Escreveste a muitos negócios hoje, por isso isto está em pausa por agora.",
  "directory.detail.enquiry.limit.clearsIn": "Podes escrever de novo {when}.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // COORD-CHANGELOG — COORD - deep-scan section 13 (the vertical surfaces), the member-facing half.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "changelog.entries.take-down-your-flatmate-profile.title":
    "Podes retirar o teu perfil de colega de casa",
  "changelog.entries.take-down-your-flatmate-profile.body":
    "Um botão no editor retira o perfil, os gostos e qualquer correspondência; as conversas já começadas ficam nas Mensagens.",
  "changelog.entries.message-a-business-without-leaving.title":
    "Podes escrever a um negócio a partir da ficha dele",
  "changelog.entries.message-a-business-without-leaving.body":
    "Antes de escreveres, a ficha diz-te se a pessoa responsável está contactável e se já lhe escreveste hoje.",
  "changelog.entries.remove-a-photo-from-a-gathering-album.title":
    "Podes remover uma foto do álbum de um encontro",
  "changelog.entries.remove-a-photo-from-a-gathering-album.body":
    "Quem a publicou ou quem organiza pode removê-la por teclado ou por toque, e o ficheiro é apagado do armazenamento.",
  "changelog.entries.your-own-jobs-and-a-way-to-correct-them.title":
    "As vagas que publicaste, e uma forma de as corrigir",
  "changelog.entries.your-own-jobs-and-a-way-to-correct-them.body":
    "Uma página lista as vagas que publicaste, cada uma com as candidaturas, o botão de fechar e um formulário de edição.",
  "changelog.entries.your-own-swap-board.title":
    "O teu próprio quadro de trocas, e resposta ao que propuseste",
  "changelog.entries.your-own-swap-board.body":
    "Uma página reúne as trocas que publicaste, com editar e fechar, e as propostas que enviaste com o que foi decidido.",
  "changelog.entries.one-place-for-everything-you-have-sent.title":
    "Um só sítio para tudo o que nos enviaste",
  "changelog.entries.one-place-for-everything-you-have-sent.body":
    "Uma página na tua conta lista candidaturas a parceria, propostas de troca e sugestões de recursos, e o que lhes aconteceu.",
  "changelog.entries.employers-and-listers-can-answer-a-review.title":
    "Quem emprega e quem anuncia casa pode responder a uma avaliação",
  "changelog.entries.employers-and-listers-can-answer-a-review.body":
    "Uma resposta pública, identificada como o alvo da avaliação; a página diz se a avaliação foi editada depois da resposta.",
  "changelog.entries.register-interest-in-a-commission.title":
    "Podes registar interesse numa encomenda",
  "changelog.entries.register-interest-in-a-commission.body":
    "Diz o que gostavas de encomendar e com quem gostavas de trabalhar; fica numa fila que uma pessoa lê.",
  "changelog.entries.the-nav-says-what-is-still-being-built.title":
    "O menu diz o que ainda está a ser construído",
  "changelog.entries.the-nav-says-what-is-still-being-built.body":
    "O Cinema e o Studio ficam no menu Cultura com uma marca discreta, e o destaque passou para o que já funciona.",
  "changelog.entries.search-stops-offering-what-it-cannot-find.title":
    "A pesquisa deixa de oferecer o que não consegue encontrar",
  "changelog.entries.search-stops-offering-what-it-cannot-find.body":
    "A pesquisa mostra só os separadores das áreas abertas, por isso o separador de Vagas espera pela área de trabalho.",
  "changelog.entries.a-hidden-review-stays-hidden.title":
    "Uma avaliação escondida fica escondida de quem é avaliado",
  "changelog.entries.a-hidden-review-stays-hidden.body":
    "Uma avaliação escondida fica retida também para a pessoa avaliada, no histórico de visitas, e quem anuncia não lhe responde.",
  "changelog.entries.erasing-your-account-keeps-what-others-rely-on.title":
    "Apagar a tua conta mantém aquilo de que os outros dependem",
  "changelog.entries.erasing-your-account-keeps-what-others-rely-on.body":
    "Apagar retira o teu nome das tuas contribuições e mantém as imagens delas, para as páginas dos outros ficarem inteiras.",
  "changelog.entries.an-anonymous-owner-stays-anonymous.title":
    "Quem tem um negócio e escolheu o anonimato continua anónimo",
  "changelog.entries.an-anonymous-owner-stays-anonymous.body":
    "A notificação da resposta pública só identifica a pessoa se a página já o fizer; às antigas retirámos nome e fotografia.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // COORD-CHANGELOG-2 — COORD - the six decisions taken after the section 13 build, the member-facing half.
  // COORD-CHANGELOG — COORD - deep-scan section 13 (the vertical surfaces), the member-facing half.
  // COORD-FORORGS — COORD - the /about/for-organisations inquiry form. The promise of a personal reply in 5 working days is TRUE: a person answers from hello@queerpulse.com, out of band. What the copy did not say was by WHAT CHANNEL, on a platform that sends no automated email, so somebody could sit waiting on a notification that will never come. It now names the channel, the sending address and the address it goes to. The error state named no address to fall back to, which was a dead end; it names one now.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "changelog.entries.the-app-icon-is-now-the-pulse-dot.title":
    "O ícone da aplicação é agora o ponto de pulso",
  "changelog.entries.the-app-icon-is-now-the-pulse-dot.body":
    "Ícone, favicon, ecrãs de arranque e kit de imprensa trazem o ponto coral; se o antigo ficar, reinstala a aplicação.",
  "changelog.entries.the-install-tip-now-opens-the-steps-in-place.title":
    "A dica de instalação abre agora os passos ali mesmo",
  "changelog.entries.the-install-tip-now-opens-the-steps-in-place.body":
    "Tocar no cartão de instalação no telemóvel abre os passos do teu aparelho num painel; no Android pode trazer Instalar.",
  "changelog.entries.a-community-page-now-fits-a-phone-screen.title":
    "A página de uma comunidade cabe agora num ecrã de telemóvel",
  "changelog.entries.a-community-page-now-fits-a-phone-screen.body":
    "O campo de texto ganha toda a largura, anexar e Partilhar têm linha própria, e os seis separadores deslizam de lado.",
  "changelog.entries.the-installed-app-opens-in-one-motion.title":
    "A aplicação instalada abre num só movimento",
  "changelog.entries.the-installed-app-opens-in-one-motion.body":
    "Abre na imagem que o telemóvel acabou de mostrar; o ícone encolhe até ao pulso enquanto a saudação chega.",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-the-homepage.title":
    "Abrir a aplicação instalada já não mostra a página inicial por instantes",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-the-homepage.body":
    "O fundo mantém-se roxo desde que o ícone abre até chegares à aplicação, por isso a página de entrada nunca aparece.",
  "changelog.entries.the-installed-app-now-opens-on-your-feed.title":
    "A aplicação instalada abre agora no teu feed",
  "changelog.entries.the-installed-app-now-opens-on-your-feed.body":
    "Com sessão, abre no teu feed; a página inicial continua acessível lá dentro, e quem está sem sessão aterra nela.",
  "changelog.entries.text-that-vanished-in-dark-mode-is-back.title":
    "O texto que desaparecia no modo escuro voltou",
  "changelog.entries.text-that-vanished-in-dark-mode-is-back.body":
    "As etiquetas de persona, as marcas de editado e removido e os avisos de validade seguem o tema, e leem-se numa página escura.",
  "changelog.entries.the-installed-app-now-opens-on-a-heartbeat.title":
    "A aplicação instalada abre agora num bater de coração",
  "changelog.entries.the-installed-app-now-opens-on-a-heartbeat.body":
    "A marca coral bate sobre ameixa escura, um fio fino acompanha a espera, e quem regressa é saudado pelo nome.",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-a-bare-icon.title":
    "Abrir a aplicação instalada já não mostra um ícone solto",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-a-bare-icon.body":
    "O ecrã que o telemóvel desenha antes do arranque abre em ameixa escura, e os iPhones e iPads mais recentes têm imagens.",
  "changelog.entries.what-you-submit-now-reaches-a-person.title":
    "O que envias agora chega a uma pessoa",
  "changelog.entries.what-you-submit-now-reaches-a-person.body":
    "Pedidos de entrada, de verificação, sugestões de anúncio e propostas avisam uma pessoa na aplicação assim que chegam.",
  "changelog.entries.every-filter-now-tells-you-how-many-it-would-leave.title":
    "Cada filtro diz agora quantos deixaria",
  "changelog.entries.every-filter-now-tells-you-how-many-it-would-leave.body":
    "As cápsulas trazem um número contado sobre os outros filtros e ficam inativas a zero; as escolhidas continuam clicáveis.",
  "changelog.entries.browse-the-professional-directory-by-profession.title":
    "Explorar o diretório profissional por profissão",
  "changelog.entries.browse-the-professional-directory-by-profession.body":
    "Filtra por várias profissões ao mesmo tempo, cada uma com o número de personas, numa gaveta Refinar ao lado da pesquisa.",
  "changelog.entries.personas-named-after-a-craft-now-show-whose-they-are.title":
    "As personas com nome de ofício passam a mostrar de quem são",
  "changelog.entries.personas-named-after-a-craft-now-show-whose-they-are.body":
    "Uma persona com nome de ofício mostra a pessoa à frente, como Tiago Costa | Poet; as não associadas ficam anónimas.",
  "changelog.entries.empty-profile-tabs-say-so.title":
    "Separadores de perfil vazios passam a dizê-lo em vez de mostrar uma página em branco",
  "changelog.entries.empty-profile-tabs-say-so.body":
    "No telemóvel, os separadores Sobre e Comunidade dizem quando ainda não há nada e, no teu perfil, oferecem-te Editar perfil.",
  "changelog.entries.the-professional-directory-is-in-the-main-menu.title":
    "O diretório profissional está no menu principal",
  "changelog.entries.the-professional-directory-is-in-the-main-menu.body":
    "A linha fica no menu Comunidade, em Pessoas, ao lado do diretório de pessoas, para mostrares o trabalho que fazes.",
  "changelog.entries.tag-filters-show-how-many-communities-are-behind-them.title":
    "Os filtros de etiquetas mostram quantas comunidades t\u00eam por tr\u00e1s",
  "changelog.entries.tag-filters-show-how-many-communities-are-behind-them.body":
    "Cada uma das 53 etiquetas tem um número contado sobre os outros filtros; uma etiqueta vazia esbate-se e ignora o clique.",
  "changelog.entries.housing-filters-fold-away-until-you-need-them.title":
    "Os filtros de casas ficam recolhidos at\u00e9 precisares deles",
  "changelog.entries.housing-filters-fold-away-until-you-need-them.body":
    "Um botão Refinar esconde-os, como nos encontros; o que aplicaste aparece em etiquetas, e cada uma retira o seu filtro.",
  "changelog.entries.empty-category-filters-can-no-longer-be-picked.title":
    "Os filtros de categoria sem nada por tr\u00e1s ficam inativos",
  "changelog.entries.empty-category-filters-can-no-longer-be-picked.body":
    "Um filtro a 0 fica esbatido e ignora o clique, com o número ainda legível, e Todas as comunidades fica sempre disponível.",
  "changelog.entries.the-app-follows-your-browsers-text-size.title":
    "A aplicação segue o tamanho de letra do teu navegador",
  "changelog.entries.the-app-follows-your-browsers-text-size.body":
    "Aumenta a definição de letra do teu navegador e toda a interface cresce, avatares, contadores e títulos de cartões incluídos.",
  "changelog.entries.faint-outlines-are-visible-again-in-dark-mode.title":
    "Os contornos ténues voltam a ver-se no modo escuro",
  "changelog.entries.faint-outlines-are-visible-again-in-dark-mode.body":
    "Sessenta contornos ficavam escuros nos dois temas e escondiam as margens dos cartões; agora ficam creme no modo escuro.",
  "changelog.entries.deep-links-no-longer-flash-the-homepage.title":
    "Abrir uma ligação já não mostra a página inicial primeiro",
  "changelog.entries.deep-links-no-longer-flash-the-homepage.body":
    "Cada página carrega numa moldura vazia e define o próprio título e descrição, por isso a antevisão descreve-a bem.",
  "changelog.entries.report-one-photo-not-the-whole-gathering.title":
    "Podes denunciar uma foto, e não o encontro inteiro",
  "changelog.entries.report-one-photo-not-the-whole-gathering.body":
    "Cada foto do álbum tem o seu botão de denúncia, com outing e exposição de dados no topo, porque chegam à fila de uma hora.",
  "changelog.entries.report-one-landlord-warning.title":
    "Podes denunciar um aviso sobre um senhorio, e a remoção pode ser revertida",
  "changelog.entries.report-one-landlord-warning.body":
    "Cada recomendação numa ficha de senhorio tem o seu botão de denúncia, e agir sobre uma deixa as outras de pé.",
  "changelog.entries.your-landlord-warning-outlives-your-account.title":
    "Um aviso que escreveste sobre um senhorio sobrevive à tua conta",
  "changelog.entries.your-landlord-warning-outlives-your-account.body":
    "Apagar a conta mantém as recomendações de senhorios que escreveste, sem o teu nome e com a classificação intacta.",
  "changelog.entries.correct-a-review-until-it-goes-public.title":
    "Podes corrigir uma avaliação de visita até ela ficar pública",
  "changelog.entries.correct-a-review-until-it-goes-public.body":
    "Podes editar a tua avaliação até ficar pública, e o formulário mostra-te o prazo enquanto escreves.",

  // ── Deep-scan section 2 (Magazine: the reader), built 2026-09-06 ─────────
  "changelog.entries.a-piece-can-no-longer-go-live-with-consent-unresolved.title":
    "Uma peça já não pode ir para o ar com consentimentos por resolver",
  "changelog.entries.a-piece-can-no-longer-go-live-with-consent-unresolved.body":
    "Publicar pára se um consentimento ou a leitura de sensibilidade estiverem por resolver, e diz-te o que falta.",
  "changelog.entries.the-desk-can-see-what-is-published-and-take-it-down.title":
    "A redação vê o que está publicado e pode retirá-lo",
  "changelog.entries.the-desk-can-see-what-is-published-and-take-it-down.body":
    "A fase Publicado guarda cada peça no ar, o registo dela liga à página publicada, e retirá-la do ar é um clique.",
  "changelog.entries.writers-hear-when-they-are-commissioned-and-when-they-are-published.title":
    "Quem escreve fica a saber quando lhe encomendam uma peça e quando é publicada",
  "changelog.entries.writers-hear-when-they-are-commissioned-and-when-they-are-published.body":
    "Recebes aviso quando te encomendam uma peça, a cada avanço na redação e quando vai para o ar, com ligação para a peça.",
  "changelog.entries.an-issue-dated-for-later-now-ships-on-that-morning.title":
    "Uma edição datada para mais tarde sai agora nessa manhã",
  "changelog.entries.an-issue-dated-for-later-now-ships-on-that-morning.body":
    "As peças ficam agendadas para as 09:00 desse dia, e o botão diz-te se vai publicar já ou agendar.",
  "changelog.entries.shipping-an-issue-holds-back-what-is-not-ready-and-says-why.title":
    "Publicar uma edição segura o que não está pronto e diz porquê",
  "changelog.entries.shipping-an-issue-holds-back-what-is-not-ready-and-says-why.body":
    "Só saem as peças prontas que passam as verificações do botão Publicar; as outras ficam listadas com o que falta a cada uma.",
  "changelog.entries.an-accepted-story-now-arrives-on-the-desk-as-a-real-piece.title":
    "Uma história aceite chega agora à redação como peça a sério",
  "changelog.entries.an-accepted-story-now-arrives-on-the-desk-as-a-real-piece.body":
    "O teu texto passa a ser o rascunho, ficas com o crédito de escrita, e a linha de administração liga ao registo na redação.",
  "changelog.entries.your-submitted-stories-page-is-open-to-everyone-who-submitted-one.title":
    "A página das histórias que enviaste está aberta a quem as enviou",
  "changelog.entries.your-submitted-stories-page-is-open-to-everyone-who-submitted-one.body":
    "Quem enviou uma história consegue agora abrir a página, e os números no topo vêm das tuas próprias submissões.",
  "changelog.entries.you-can-withdraw-a-story-you-submitted.title":
    "Podes retirar uma história que enviaste",
  "changelog.entries.you-can-withdraw-a-story-you-submitted.body":
    "Retira a história enquanto a redação ainda está a decidir, e ela sai logo da fila deles.",
  "changelog.entries.two-editors-can-no-longer-overwrite-each-other-silently.title":
    "Dois editores já não se sobrepõem em silêncio",
  "changelog.entries.two-editors-can-no-longer-overwrite-each-other-silently.body":
    "Se o rascunho mudou por baixo de ti, o editor pára, mantém o teu texto no ecrã e oferece-se para recarregar.",
  "changelog.entries.writers-can-read-the-edited-draft-and-refiling-no-longer-doubles-it.title":
    "Quem escreve pode ler o rascunho editado, e voltar a entregar já não o duplica",
  "changelog.entries.writers-can-read-the-edited-draft-and-refiling-no-longer-doubles-it.body":
    "Lê o rascunho da redação, parte dele e entrega de novo, acrescentando ou substituindo; repetir o texto não faz nada.",
  "changelog.entries.a-published-deck-can-no-longer-vanish-from-under-readers.title":
    "Um deck publicado já não desaparece por baixo de quem o lê",
  "changelog.entries.a-published-deck-can-no-longer-vanish-from-under-readers.body":
    "Um deck no ar tem de ser retirado antes de ser apagado, e um que uma peça ainda use não pode ser apagado.",
  "changelog.entries.issue-cover-art-can-be-uploaded-from-the-desk.title":
    "A capa da edição pode ser carregada a partir da redação",
  "changelog.entries.issue-cover-art-can-be-uploaded-from-the-desk.body":
    "Carrega a capa com o mesmo recorte e pré-visualização das outras imagens da redação; já não precisas de a alojar fora.",
  "changelog.entries.the-writer-workspace-reads-in-plain-language.title":
    "O espaço de quem escreve lê-se em linguagem normal",
  "changelog.entries.the-writer-workspace-reads-in-plain-language.body":
    "Datas, estados de pagamento e números de edição leem-se por palavras; um rascunho entregue mostra a contagem face ao pedido.",
  "changelog.entries.every-story-on-the-magazine-front-now-opens.title":
    "Todos os textos da capa da revista abrem agora",
  "changelog.entries.every-story-on-the-magazine-front-now-opens.body":
    "Os cartões vão direitos à peça, e os endereços antigos ainda levam o texto, por isso um link do ano passado funciona.",
  "changelog.entries.articles-show-the-kicker-and-standfirst-the-desk-wrote.title":
    "Os artigos mostram o que a redação escreveu por cima do título",
  "changelog.entries.articles-show-the-kicker-and-standfirst-the-desk-wrote.body":
    "O antetítulo, a secção, o lead e a entrada que a redação escreveu chegam-te, no artigo e em todos os cartões que lhe apontam.",
  "changelog.entries.issue-pages-show-the-cover-the-desk-chose.title":
    "As páginas de edição mostram a capa que a redação escolheu",
  "changelog.entries.issue-pages-show-the-cover-the-desk-chose.body":
    "Cada edição mostra a sua própria capa, só a edição em banca leva o selo de atual, e Todas as edições vai para o arquivo.",
  "changelog.entries.interactive-decks-have-their-own-index.title":
    "Os decks interativos passam a ter índice próprio",
  "changelog.entries.interactive-decks-have-their-own-index.body":
    "Os decks listam-se do mais recente ao mais antigo, pela capa e pelo cabeçalho; um link partilhado mostra o título.",
  "changelog.entries.magazine-lists-no-longer-stop-at-twenty.title":
    "As listas da revista já não param nos vinte",
  "changelog.entries.magazine-lists-no-longer-stop-at-twenty.body":
    "A pesquisa e a navegação por etiqueta e secção percorrem o arquivo todo; Todos os 25 artigos abre mesmo a lista completa.",
  "changelog.entries.the-magazine-now-browses-in-your-language.title":
    "A revista navega agora no teu idioma",
  "changelog.entries.the-magazine-now-browses-in-your-language.body":
    "A capa, a pesquisa, a navegação e o teu feed pedem o teu idioma, por isso um texto em português chega-te em português.",
  "changelog.entries.long-reads-have-contents-progress-and-a-resume-point.title":
    "As leituras longas têm índice, progresso e um sítio onde retomar",
  "changelog.entries.long-reads-have-contents-progress-and-a-resume-point.body":
    "Índice a partir dos subtítulos, barra de progresso, retomar onde ficaste, e partilhar abre a folha do telemóvel.",
  "changelog.entries.published-pieces-now-reach-your-feed.title":
    "As peças publicadas chegam agora ao teu feed",
  "changelog.entries.published-pieces-now-reach-your-feed.body":
    "Os artigos juntam-se às publicações, tópicos e encontros no teu feed, no teu idioma; os de quem bloqueaste ficam fora.",
  "changelog.entries.blocks-and-mutes-now-apply-under-magazine-articles.title":
    "Os bloqueios e os silenciamentos passam a valer nos artigos da revista",
  "changelog.entries.blocks-and-mutes-now-apply-under-magazine-articles.body":
    "Os comentários e as respostas dos artigos são filtrados como no fórum e no feed, remoções da moderação incluídas.",
  "changelog.entries.article-comments-page-and-keep-your-paragraphs.title":
    "Os comentários dos artigos paginam, e guardam os teus parágrafos",
  "changelog.entries.article-comments-page-and-keep-your-paragraphs.body":
    "Os comentários carregam mais a pedido, o cabeçalho conta o que conta mesmo, e os teus parágrafos ficam parágrafos.",
  "changelog.entries.the-submit-form-names-the-issue-that-is-actually-open.title":
    "O formulário de envio diz qual é a edição realmente aberta",
  "changelog.entries.the-submit-form-names-the-issue-that-is-actually-open.body":
    "Diz qual a edição que aceita propostas, mostra prazo só se alguém o definiu, e diz claramente quando não há nada aberto.",
  "changelog.entries.unshipped-headlines-no-longer-appear-on-issue-pages.title":
    "Os títulos por sair já não aparecem nas páginas de edição",
  "changelog.entries.unshipped-headlines-no-longer-appear-on-issue-pages.body":
    "O índice de uma edição mostra só as peças publicadas, por isso um título que a redação ainda não publicou fica escondido.",
  "changelog.entries.the-authors-directory-only-lists-writers-who-have-published.title":
    "O diretório de autoria lista só quem já publicou",
  "changelog.entries.the-authors-directory-only-lists-writers-who-have-published.body":
    "O diretório lista as pessoas cujo trabalho podes mesmo ler; antes contava todas as assinaturas criadas ao abrir um rascunho.",

  // ── Deep-scan section 6 (Gatherings), built 2026-09-06 ────────────────────
  "changelog.entries.your-reminder-and-cancellation-links-now-open-the-gathering.title":
    "Os links de lembrete e de cancelamento abrem agora o encontro",
  "changelog.entries.your-reminder-and-cancellation-links-now-open-the-gathering.body":
    "Lembretes, cancelamentos e entradas de calendário abrem o encontro, no telemóvel e no Google ou Apple Calendar.",

  "changelog.entries.online-gatherings-now-have-a-join-link.title":
    "Os encontros online passam a ter link de entrada",
  "changelog.entries.online-gatherings-now-have-a-join-link.body":
    "O assistente pede o link de vídeo e partilha-o com quem vai, como uma morada, nunca na página pública.",

  "changelog.entries.a-cancelled-gathering-now-says-so.title":
    "Um encontro cancelado passa a dizê-lo",
  "changelog.entries.a-cancelled-gathering-now-says-so.body":
    "Diz que foi cancelado onde quer que o encontres, o botão de confirmação desaparece, e quem tem convite é avisado.",

  "changelog.entries.maybe-add-to-calendar-and-your-details-on-the-gathering-itself.title":
    "Talvez, adicionar ao calendário e os teus detalhes, na própria página do encontro",
  "changelog.entries.maybe-add-to-calendar-and-your-details-on-the-gathering-itself.body":
    "Marca-te como talvez, adiciona a data ao calendário, e diz a quem organiza que levas mais alguém ou precisas de acesso.",

  "changelog.entries.choose-when-your-gathering-reminder-arrives.title":
    "Escolhe quando chega o lembrete do encontro",
  "changelog.entries.choose-when-your-gathering-reminder-arrives.body":
    "Escolhe uma hora antes, um dia antes ou uma semana antes; as definições de notificações só tinham um interruptor.",

  "changelog.entries.hosts-can-run-a-gathering-again-and-take-the-door-list-offline.title":
    "Quem organiza pode repetir um encontro e levar a lista da porta offline",
  "changelog.entries.hosts-can-run-a-gathering-again-and-take-the-door-list-offline.body":
    "Repetir preenche o assistente com um encontro passado, e Exportar na lista de presenças descarrega um ficheiro.",

  // Section 5 of the 2026-09-05 deep scan: forum, feed and saved items.
  "changelog.tag.saved": "Abrir as tuas coleções",
  "changelog.entries.you-can-take-down-a-whole-forum-post.title":
    "Podes remover uma publicação do fórum por inteiro",
  "changelog.entries.you-can-take-down-a-whole-forum-post.body":
    "Apagar remove título, mensagem inicial e ligação e atualiza as contagens; as respostas ficam sem caminho pelo fórum.",
  "changelog.entries.a-thread-always-shows-its-real-opening-post.title":
    "Um tópico mostra sempre a mensagem inicial verdadeira",
  "changelog.entries.a-thread-always-shows-its-real-opening-post.body":
    "Autor silenciado ou escondido deixa a primeira resposta no lugar; o cartão diz quando a mensagem inicial está indisponível.",
  "changelog.entries.sorting-replies-reorders-the-whole-conversation.title":
    "Ordenar as respostas reorganiza a conversa toda",
  "changelog.entries.sorting-replies-reorders-the-whole-conversation.body":
    "Mais recentes e Mais úteis ordenam todas as respostas do tópico, cada uma ainda aninhada por baixo da que responde.",
  "changelog.entries.the-forum-opens-on-active-and-top-means-this-month.title":
    "O fórum abre em Ativos, e Melhores passa a ser do mês",
  "changelog.entries.the-forum-opens-on-active-and-top-means-this-month.body":
    "Melhores ordena pelos votos do último mês antes de cair para a atividade recente, para que uma pergunta nova fique à vista.",
  "changelog.entries.forum-search-looks-inside-replies.title":
    "A pesquisa do fórum procura dentro das respostas",
  "changelog.entries.forum-search-looks-inside-replies.body":
    "Uma pergunta respondida três respostas abaixo aparece agora na pesquisa, e a dica por baixo da caixa diz isso.",
  "changelog.entries.you-can-move-a-post-to-the-right-category.title":
    "Podes mover uma publicação para a categoria certa",
  "changelog.entries.you-can-move-a-post-to-the-right-category.body":
    "Move a tua publicação nas primeiras 24 horas, pela etiqueta de categoria ou pelo menu; quem modera pode reorganizar sempre.",
  "changelog.entries.see-how-many-replies-arrived-since-you-last-looked.title":
    "Vê quantas respostas chegaram desde a última vez",
  "changelog.entries.see-how-many-replies-arrived-since-you-last-looked.body":
    "As linhas contam as respostas desde que abriste a publicação; abri-la marca-a como lida, e as notificações ficam à parte.",
  "changelog.entries.the-composer-keeps-your-whole-draft.title":
    "O editor guarda o teu rascunho inteiro",
  "changelog.entries.the-composer-keeps-your-whole-draft.body":
    "Um rascunho guarda título, categoria, comunidade, etiquetas e fotografia, e o fórum mostra o caminho de volta a ele.",
  "changelog.entries.links-in-threads-and-the-feed-open-up.title":
    "As ligações nos tópicos e na página inicial abrem-se",
  "changelog.entries.links-in-threads-and-the-feed-open-up.body":
    "Uma ligação colada numa publicação abre num cartão com título, descrição e imagem da página, como nas mensagens.",
  "changelog.entries.votes-on-the-forum-are-honest.title":
    "Os votos no fórum são honestos",
  "changelog.entries.votes-on-the-forum-are-honest.body":
    "Votar na tua própria publicação, em quem te bloqueou ou numa comunidade privada de que não fazes parte é recusado.",
  "changelog.entries.threads-show-a-preview-of-what-was-asked.title":
    "As publicações mostram uma antevisão do que foi perguntado",
  "changelog.entries.threads-show-a-preview-of-what-was-asked.body":
    "As linhas do fórum e os cartões no feed mostram as primeiras linhas, e a contagem deixa de fora as respostas apagadas.",
  "changelog.entries.hidden-members-stay-hidden-in-the-feed.title":
    "Quem se esconde continua escondido na página inicial",
  "changelog.entries.hidden-members-stay-hidden-in-the-feed.body":
    "Esconde o teu perfil, por 24 horas ou de uma pessoa, e o feed deixa de te anunciar como alguém que acabou de chegar.",
  "changelog.entries.new-this-week-now-means-this-week.title":
    "Novos esta semana passa a significar esta semana",
  "changelog.entries.new-this-week-now-means-this-week.body":
    "A lista lateral mostra só quem chegou nos últimos sete dias, e diz com clareza quando não chegou ninguém.",
  "changelog.entries.saved-items-tell-you-when-something-is-gone.title":
    "Os itens guardados dizem-te quando algo já não existe",
  "changelog.entries.saved-items-tell-you-when-something-is-gone.body":
    "Guardados, listas partilhadas e coleções marcam como indisponível um item cuja página saiu, e mantêm o título.",

  // Section 5 follow-up: cross-device drafts, link previews, saved lists.
  "changelog.entries.a-post-you-start-on-one-device-reopens-on-another.title":
    "Uma publicação começada num dispositivo reabre noutro",
  "changelog.entries.a-post-you-start-on-one-device-reopens-on-another.body":
    "O rascunho inteiro viaja contigo, comunidade, etiquetas e fotografia incluídas, mesmo guardado sem corpo.",
  "changelog.entries.link-previews-no-longer-run-out-on-shared-wifi.title":
    "As antevisões de ligações deixam de esgotar em wifi partilhado",
  "changelog.entries.link-previews-no-longer-run-out-on-shared-wifi.body":
    "A tua quota de cartões de antevisão é só tua e chega para uma página de ligações; antes um café inteiro partilhava uma.",
  "changelog.entries.saved-lists-flag-a-dead-item-before-you-file-it.title":
    "As listas de guardados assinalam um item morto antes de o arrumares",
  "changelog.entries.saved-lists-flag-a-dead-item-before-you-file-it.body":
    "A linha de guardados recentes nas tuas listas marca os itens cuja página saiu, como o resto dos teus guardados.",
};
