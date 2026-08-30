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
    "Não é mais um feed a competir pela tua atenção. Um espaço pequeno e deliberado, feito para acolher esta comunidade, não para a explorar.",
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
    "<b>Documenta, não sejas só testemunha.</b> Fotografias e notas de uma ação importam mais tarde, para responsabilização e para a história.",
  "activism.mobilise.p3":
    "<b>Continua depois, não fiques só na marcha.</b> O trabalho depois da manifestação é onde acontece a maior parte da mudança real.",
  "activism.feel.title": "Como se <em>sente</em>",
  "activism.feel.p1":
    "O esgotamento é real. Um ativismo que só exige e nunca repõe não é sustentável, nem para ti nem para o movimento.",
  "activism.feel.p2":
    "Está tudo bem em recuar. Está tudo bem em fazer menos do que achas que devias. Descansar faz parte do trabalho, não é uma traição a ele.",
  "activism.feel.banner.title": "Se estás perto do esgotamento",
  "activism.feel.banner.body":
    "Fala com o apoio entre pares antes de desapareceres de vez. Recuar com um plano é melhor do que desaparecer sem nenhum.",
  "activism.orgs.title": "Organizações <em>parceiras</em>",
  "activism.orgs.p1":
    "Quatro organizações portuguesas com quem trabalhamos diretamente: todas recebem voluntários de braços abertos.",
  "activism.volunteer.title": "Vagas <em>abertas</em>",
  "activism.volunteer.p1":
    "Oportunidades de voluntariado atuais das nossas organizações parceiras, atualizadas regularmente.",
  "activism.volunteer.expressInterestCta": "Mostrar interesse",
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
  "coc.pact.item05.title": "Reparamos, não só pedimos desculpa",
  "coc.pact.item05.body":
    "Um pedido de desculpa a sério muda o comportamento. As palavras sozinhas não bastam.",
  "coc.pact.item06.title": "Denunciamos o dano, não só comentamos sobre ele",
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
    "A linha é o <em>impacto</em>, não a intenção. “Não foi essa a intenção” não anula o dano causado.",
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
    "Que cookies a QueerPulse utiliza, todos estritamente necessários ou funcionais, o que cada um faz, e como gerir as tuas escolhas de privacidade. Sem cookies de publicidade nem de análise.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "Os cookies que <em>usamos,</em> e porquê.",
  "cookies.sub":
    "Uma lista curta, em linguagem simples. Todos os cookies aqui são essenciais ou funcionais. Não há nada para desligar.",
  "cookies.essential.title": "Essenciais",
  "cookies.essential.body":
    "Necessários para te manteres com sessão iniciada e a tua conta segura. Não podem ser desligados.",
  "cookies.functional.title": "Funcionais",
  "cookies.functional.body":
    "Guardam as tuas preferências: tema, idioma, definições de notificação.",
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
    "Por isso não há aqui categoria de cookies de publicidade. Não há a quem vender a tua atenção.",
  "cookies.summary.title": "O teu <em>resumo</em>",
  "cookies.summary.essential": "Essenciais",
  "cookies.summary.functional": "Funcionais",
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
    "A maior parte do atrito aqui vem de mal-entendidos, não de má intenção. Pergunta antes de presumir o pior.",
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
    "Vai a <settingsLink>Definições</settingsLink> → Perfil. As alterações aplicam-se em todo o lado de imediato.",
  "help.qa.privateProfile.q": "Posso tornar o meu perfil privado?",
  "help.qa.privateProfile.a":
    "Sim, em <settingsLink>Definições</settingsLink> → Privacidade. Um perfil privado continua visível para as tuas ligações. Só <strong>não aparece na pesquisa nem no diretório público</strong>.",
  "help.qa.unknownSession.q":
    "Não reconheço um dispositivo nas minhas sessões ativas. E agora?",
  "help.qa.unknownSession.a":
    "Termina essa sessão em <sessionsLink>sessões ativas</sessionsLink>. O início de sessão é feito através da Google, por isso revê também a segurança da tua conta Google, já que quem tiver acesso a ela consegue entrar aqui. Depois <contactLink>conta-nos o que aconteceu</contactLink> e ajudamos-te a proteger a tua conta.",
  "help.qa.deleteAccount.q": "Como elimino a minha conta?",
  "help.qa.deleteAccount.a":
    "Em <settingsLink>Definições</settingsLink> → Conta, mais abaixo. Isto é permanente. Vê a Política de Privacidade para saber o que fica retido e por quanto tempo.",
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
    "Em <settingsLink>Definições</settingsLink> → Notificações, ativa ou desativa cada categoria em separado. A QueerPulse avisa-te dentro da aplicação e, se autorizares, por push. Não envia email.",
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
  "partners.become.emailCta": "hello@queerpulse.com",
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
  "pressKit.outro.contactCta": "Enviar email ao gabinete de imprensa",
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
    "Salas reais, cuidadas por pessoas reais. Sem feeds, sem algoritmo. Eis o que isso significa, e como encontrar aquela que parece tua.",
  "communitiesAbout.outro.title": "Pronto para encontrar a tua gente?",
  "communitiesAbout.outro.sub":
    "Pede um convite e ajudamos-te a encontrar as salas que parecem casa.",
  "communitiesAbout.what.title": "O que é aqui uma comunidade",
  "communitiesAbout.what.rooms.title": "Salas com propósito",
  "communitiesAbout.what.rooms.body":
    "Uma comunidade é uma sala com um propósito e alguém que a cuida, não um feed sem fim ordenado por um algoritmo. Sabes sempre em que espaço estás.",
  "communitiesAbout.what.kept.title": "Cuidadas por pessoas reais",
  "communitiesAbout.what.kept.body":
    "Cada comunidade tem alguém que a cuida, que define o tom, acolhe novas caras e zela pela sala.",
  "communitiesAbout.what.safe.title": "Um espaço em que podes confiar",
  "communitiesAbout.what.safe.body":
    "As comunidades são só por convite e moderadas, para que a sala continue a ser um sítio onde podes ser mesmo tu.",
  "communitiesAbout.how.title": "Como funciona",
  "communitiesAbout.how.find.title": "Encontra a tua sala",
  "communitiesAbout.how.find.body":
    "Explora comunidades por interesse, cena ou bairro até uma parecer tua.",
  "communitiesAbout.how.welcome.title": "Alguém te acolhe",
  "communitiesAbout.how.welcome.body":
    "Quem cuida da sala e os membros dão-te as boas-vindas, para nunca começares do nada.",
  "communitiesAbout.how.belong.title": "Apareces e pertences",
  "communitiesAbout.how.belong.body":
    "Entra na conversa, aparece nos convívios e torna-te uma das caras que os outros gostam de ver.",
  "communitiesAbout.why.title": "Porque as comunidades importam",
  "communitiesAbout.why.body":
    "Pertencer não é uma funcionalidade. É o <em>objetivo todo</em>: onde encontras a tua gente, te sentes em segurança e te manténs perto do que acontece à tua volta.",

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
    "A versão simples: a QueerPulse é construída e mantida por um grupo de voluntários, não é uma empresa registada. Esta página diz-te quem está por trás dela, como nos contactar, e a lei que nos rege.",
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
    "Os voluntários que gerem a QueerPulse são coletivamente responsáveis pelo que aqui é publicado. Para qualquer coisa sobre o conteúdo do site, envia-nos um email e uma pessoa a sério responde.",
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
  "listBusiness.step1.friendly.tag": "LGBTQ+ friendly",
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
    "O plano geral é a sua capa: é a foto que aparece no seu cartão no diretório. Horizontal funciona melhor · idealmente ≥1200px de largura · menos de 5MB cada · sem gráficos carregados de texto.",
  "listBusiness.step4.gallery.wide": "Plano geral do espaço",
  "listBusiness.step4.gallery.wideNote":
    "Foto de capa · aparece no seu cartão no diretório",
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
  "listBusiness.step4.photo.urlPlaceholder": "ou cola o link de uma imagem",
  "listBusiness.step4.photo.urlInvalid": "Isto não parece o link de uma imagem",
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
  "changelog.badge.feature": "Funcionalidade",
  "changelog.badge.improvement": "Melhoria",
  "changelog.badge.infrastructure": "Infraestrutura",
  "changelog.badge.fix": "Correção",
  "changelog.tag.about": "L\u00ea onde nos posicionamos",
  "changelog.tag.partners": "Vê os nossos parceiros",
  "changelog.tag.aboutCommunities": "Ver como funcionam as comunidades",
  "changelog.tag.work": "Abrir o teu Trabalho",
  "changelog.tag.settings": "Definições de notificações",
  "changelog.tag.messages": "Abrir mensagens",
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
  "changelog.tag.profile": "Abrir o seu perfil",
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
    "Podes publicar um quarto diretamente num grupo de habitação verificado, com a renda e a acessibilidade que o grupo pede. Um moderador lê-o antes de ir para a página do grupo, e os teus quartos ficam agora todos num sítio a mostrar em que ponto está cada um, incluindo o que um moderador te tenha respondido.",
  "changelog.entries.the-housing-board-is-open.title":
    "O quadro de alojamento está aberto",
  "changelog.entries.the-housing-board-is-open.body":
    "Os quartos e casas anunciados por quem cá está chegam finalmente ao quadro. Cada anúncio passa primeiro por moderação, e vês a decisão e o motivo no teu próprio anúncio em vez de ficares à espera sem saber. Os anúncios levam fotografias, descrição, data de disponibilidade e como é o espaço, e os alertas de procuras guardadas voltam a funcionar.",
  "changelog.entries.gatherings-say-where-and-what-they-cost.title":
    "Os convívios dizem onde são e quanto custam",
  "changelog.entries.gatherings-say-where-and-what-they-cost.body":
    "A morada, as indicações de chegada, o bairro e os detalhes de acessibilidade que quem organiza preenche passam a ser guardados e mostrados, em vez de se perderem no último passo. A morada exata é partilhada com quem vai. Um convívio pode dizer que é gratuito, ou indicar uma escala variável, e podes filtrar por data, bairro, tipo e custo.",
  "changelog.entries.hosts-run-their-own-door.title":
    "Quem organiza controla a própria porta",
  "changelog.entries.hosts-run-their-own-door.body":
    "Podes avisar toda a gente que vai, registar entradas à porta, ver as necessidades de acesso que as pessoas quiseram partilhar, e impedir alguém num convívio sem cancelar tudo. Quem bloqueaste já não pode aparecer. E se vais a um sítio novo, podes dizer a uma pessoa de confiança onde vais estar.",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.title":
    "O selo de espaço seguro passa a valer o que a página diz",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.body":
    "As nomeações são reconhecidas dentro de um prazo, três pessoas sem qualquer ligação ao espaço têm de o visitar, e cada decisão leva um motivo escrito. Qualquer pessoa pode levantar uma questão sobre um espaço com selo: três sinalizações separadas suspendem o selo de imediato e abrem uma revisão. O teu nome nunca chega ao espaço.",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.title":
    "Está aberto? E consigo entrar?",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.body":
    "O diretório mostra agora se um sítio está aberto neste momento, e podes filtrar só pelo que está aberto. Podes também filtrar pelo acesso de que precisas: entrada sem degraus, casa de banho acessível, casa de banho neutra e mais, sem teres de abrir cada espaço um a um. E se quiseres, a lista ordena pelo mais perto com o tempo a pé; a tua localização fica no teu telemóvel.",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.title":
    "O espaço é consultado antes de te receber",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.body":
    "Qualquer pessoa podia indicar um negócio como espaço do seu convívio e quem é dono nunca era avisado. Agora é consultado, pode confirmar ou retirar, e um convívio por confirmar não aparece na página pública do espaço.",
  "changelog.entries.arriving-points-at-real-things.title":
    "Chegar a Lisboa aponta para coisas reais",
  "changelog.entries.arriving-points-at-real-things.body":
    "A página para quem acabou de se mudar anunciava um convívio inventado numa data que já tinha passado. Passa a mostrar convívios reais a chegar, com ligações a espaços e comunidades que existem mesmo, e dá-te uma lista das primeiras duas semanas para ires riscando. E lê-se em português.",
  "changelog.entries.what-you-send-in-now-gets-an-answer.title":
    "O que envias passa a ter resposta",
  "changelog.entries.what-you-send-in-now-gets-an-answer.body":
    "Várias coisas que podias submeter chegavam até nós e ficavam por aí. Um grupo de leitura proposto passa a tornar-se uma comunidade real contigo como responsável. Quartos publicados num grupo de habitação, sugestões de senhorios e pedidos de apresentação têm todos uma decisão, com o motivo, e sabes sempre o que aconteceu.",
  "changelog.entries.the-magazine-has-pictures.title": "A revista tem imagens",
  "changelog.entries.the-magazine-has-pictures.body":
    "É uma revista, e a fotografia e a ilustração são metade dela, mas não havia forma de um editor pôr uma imagem encomendada numa página. Todos os cartões e todos os cabeçalhos de artigo mostravam um espaço colorido em vez da imagem. Os editores podem agora carregar a imagem de abertura de um texto e colocar fotografias a sério dentro do corpo da história, e essa imagem aparece no artigo, na capa e em todos os cartões que apontam para ele.",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.title":
    "Um texto mais antigo diz-te em que pé está",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.body":
    "Publicamos sobre direitos, acesso a cuidados de saúde e organizações, e tudo isso muda. Até agora as opções eram deixar um texto com ar de actual ou retirá-lo, o que também o apagava do arquivo. Um texto pode agora ser marcado como em revisão, arquivado ou substituído por outro mais recente, e continua a poder ser lido com uma nota datada no topo a dizer que idade tem, quando o vimos pela última vez e o que diríamos dele hoje. Os artigos podem também ser publicados em português como texto próprio, com crédito a quem traduziu e um selector de língua na página.",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.title":
    "As correcções e os avisos de conteúdo chegam-te agora",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.body":
    "A revista promete que uma correcção é publicada como uma nota datada no fim do texto e que nunca editamos em silêncio. Até agora os editores registavam essas correcções e nenhum leitor via nenhuma. A partir de hoje aparecem no artigo, com data, pela ordem em que foram feitas. Com os avisos de conteúdo passava-se o mesmo: um texto não pode ser publicado sem pelo menos um, e estavam a ser recolhidos e depois escondidos precisamente de quem precisa deles. Passam a ficar antes do corpo do artigo, onde os podes ler primeiro e dispensar se preferires.",
  "changelog.entries.the-magazine-front-page-is-editors-work.title":
    "A capa da revista volta a ser o trabalho dos editores",
  "changelog.entries.the-magazine-front-page-is-editors-work.body":
    "A capa era só os nove textos mais recentes, pela ordem em que calhou serem publicados. Passa a abrir com o texto que os editores escolheram para abrir e a seguir a ordem da edição actual, agrupada pelas suas secções, com o resto por baixo. O cabeçalho diz-te que edição estás a ler e a data em que saiu.",
  "changelog.entries.search-the-whole-magazine-archive.title":
    "Pesquisa tudo o que a revista publicou",
  "changelog.entries.search-the-whole-magazine-archive.body":
    "Não havia forma de pesquisar dentro da revista, por isso tudo o que ficasse abaixo do primeiro ecrã da capa estava praticamente perdido. Podes agora pesquisar todo o arquivo por título, entrada, corpo e etiqueta, ordenado por quão bem cada texto corresponde. As etiquetas de cada artigo também são links, para seguires uma e veres o que mais publicámos sobre o assunto.",
  "changelog.entries.a-byline-is-a-person-now.title":
    "Uma assinatura na revista é uma pessoa a sério",
  "changelog.entries.a-byline-is-a-person-now.body":
    "Uma assinatura era um nome e mais nada: sem fotografia, sem biografia, sem forma de a editar fora da base de dados e sem ligação a quem escreveu o texto. Quem escreve tem agora um perfil de autoria que pode editar, as assinaturas ligam ao perfil de membro quando quem escreve é um de nós, e os textos publicados aparecem creditados no perfil de quem os escreveu.",
  "changelog.entries.your-story-submission-gets-an-answer.title":
    "A tua proposta de texto tem agora uma resposta",
  "changelog.entries.your-story-submission-gets-an-answer.body":
    "Escrever para a revista significava preencher um texto inteiro, carregar uma capa e depois ver o acompanhamento a dizer “enviado” para sempre, porque do outro lado não havia nada que a pudesse aceitar ou recusar. Os editores podem agora aceitar, recusar ou encomendar uma proposta e escrever-te uma nota de volta. A decisão chega-te no acompanhamento e nas notificações, e um texto encomendado entra directamente na redacção. A tua entrada, o teu corpo de texto e a tua imagem de capa passam a ser guardados em vez de serem juntados todos num só campo.",
  "changelog.entries.every-guide-says-when-it-was-last-checked.title":
    "Cada guia diz quando foi visto pela última vez",
  "changelog.entries.every-guide-says-when-it-was-last-checked.body":
    "Os nossos guias cobrem percursos de saúde, redução de riscos, saúde sexual, linhas de apoio e apoio jurídico, e nenhum deles te dizia se alguém os tinha revisto este ano. Cada guia passa a ter uma data de revisão, e a equipa consegue ver quais estão por rever. Os editores podem também actualizar o texto dos guias e o glossário directamente, sem esperar por uma nova versão da aplicação. Há um novo índice na página dos guias com todos eles, incluindo cerca de dezassete que não tinham ligação em lado nenhum e só se alcançavam escrevendo o endereço.",
  "changelog.entries.the-reading-group-directory-is-real.title":
    "O directório de clubes de leitura é real",
  "changelog.entries.the-reading-group-directory-is-real.body":
    "Os clubes de leitura viviam só no navegador: o directório esvaziava-se ao recarregar a página e pedir para entrar estava desligado. Uma proposta aprovada passa a criar um grupo a sério, que podes encontrar, abrir e pedir para entrar, com quem o propôs como anfitrião.",
  "changelog.entries.in-this-issue-replaces-the-members-digest.title":
    "“Nesta edição” substitui a newsletter para membros",
  "changelog.entries.in-this-issue-replaces-the-members-digest.body":
    "A redacção andava a preparar uma newsletter que estava configurada para ser enviada por email. A QueerPulse não envia email e nunca vai enviar, por isso todo esse caminho desapareceu. O trabalho de selecção fica e passa a ter onde aterrar: cada página de edição tem um painel “Nesta edição” pela ordem que os editores escolheram, e uma notificação avisa-te quando uma edição sai.",
  "changelog.entries.the-press-kit-carries-real-brand-assets.title":
    "O kit de imprensa tem ficheiros de marca a sério",
  "changelog.entries.the-press-kit-carries-real-brand-assets.body":
    "Todos os downloads do kit de imprensa eram ficheiros de exemplo criados no teu navegador, por isso um jornalista que pedisse o logótipo recebia um ficheiro a dizer isso mesmo. O kit passa a servir ficheiros reais: a marca em vectorial e em alta resolução, uma versão monocromática, o ícone da aplicação e uma referência de cores e tipografia pronta a imprimir, gerada a partir dos próprios valores de desenho da plataforma.",
  "changelog.entries.cinema-and-culture-say-what-they-are.title":
    "O Cinema e a Cultura deixaram de anunciar o que não existe",
  "changelog.entries.cinema-and-culture-say-what-they-are.body":
    "O Cinema oferecia publicamente subscrições mensais e citava um registo de dinheiro pago a realizadores, sem qualquer forma de pagar e sem catálogo por trás. A Cultura estava no menu como quatro secções vazias com os botões de contribuir desligados. Ambos dizem agora com clareza que ainda não abriram. A revista também deixou de dizer a quem não tem sessão iniciada que estava para breve quando já publica há algum tempo: pede-te para entrares e leva-te de volta ao texto que querias.",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.title":
    "Uma edição fica guardada até sair",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.body":
    "O número, o título, o tema e a capa de uma edição ainda não publicada eram visíveis para qualquer pessoa com conta, e a edição aparecia no arquivo. As edições por publicar ficam agora guardadas em todos os sítios onde um leitor pode espreitar, e a redacção mantém a sua vista completa.",

  "changelog.entries.the-directory-stopped-going-blank.title":
    "O directório local deixou de ficar em branco",
  "changelog.entries.the-directory-stopped-going-blank.body":
    "Conforme a página de onde vinhas, o directório e o formulário para listares o teu negócio podiam abrir num ecrã vazio em vez dos lugares. Dois ficheiros precisavam um do outro antes de qualquer um ter acabado de carregar, por isso o primeiro a arrancar encontrava os horários a meio e parava. Os nomes das categorias passam a viver por si, e assim nada fica à espera de nada.",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.title":
    "Esconder as pré-visualizações já funciona no iPhone",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.body":
    "A opção só era respeitada por navegadores que correm o nosso código em segundo plano, coisa que o iPhone nunca faz, por isso o ecrã bloqueado continuava a dizer quem te escreveu enquanto o botão dizia “ligado”. A tua escolha passa a viajar com a conta, e a notificação sai já sem nada: diz que chegou algo sem dizer de quem nem o quê. Vem ligada por omissão, em todos os dispositivos onde tens sessão iniciada.",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.title":
    "Sair já não apaga os encontros de outras pessoas",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.body":
    "Apagar uma conta levava com ela todos os encontros que essa pessoa tinha organizado, incluindo os futuros, e as inscrições de toda a gente. Agora um encontro futuro passa para quem co-organiza, ou é cancelado com uma notificação para quem disse que ia. Anúncios, vagas e voluntariado fecham em vez de desaparecer, e as avaliações continuam legíveis sem o nome de quem as escreveu.",
  "changelog.entries.a-new-device-signing-in-tells-you.title":
    "Ficas a saber quando um novo dispositivo inicia sessão",
  "changelog.entries.a-new-device-signing-in-tells-you.body":
    "Se a tua conta for aberta num dispositivo que ainda não conhecia, passas a receber uma notificação a dizer que tipo de dispositivo e quando. A lista de sessões ativas identifica cada uma, como “Chrome no macOS”, e assinala aquela em que estás, para distinguires o teu portátil do de outra pessoa.",
  "changelog.entries.nothing-promises-you-an-email-any-more.title":
    "Já nada te promete um email",
  "changelog.entries.nothing-promises-you-an-email-any-more.body":
    "A QueerPulse não envia emails, por isso cada ecrã que dizia que ia enviar estava a pedir-te para esperares por algo que nunca chegaria. A lista de espera dos encontros, os anúncios do diretório, as propostas da Cultura, as candidaturas a bolsas e a checklist de anfitrião sem álcool passam a dizer onde a resposta chega mesmo: nas tuas notificações e mensagens da QueerPulse.",
  "changelog.entries.the-status-page-works-without-an-account.title":
    "A página de estado funciona sem conta",
  "changelog.entries.the-status-page-works-without-an-account.body":
    "Se não consegues iniciar sessão, a pergunta mais difícil é se o problema é nosso ou teu. A página de estado passa a mostrar o estado real dos serviços e os incidentes que registámos, e funciona sem conta nenhuma, para distinguires uma falha nossa de um problema com o teu acesso.",
  "changelog.entries.data-requests-get-a-real-answer.title":
    "Os pedidos de dados têm uma resposta a sério",
  "changelog.entries.data-requests-get-a-real-answer.body":
    "Um pedido sobre os teus dados era registado e ficava onde ninguém via o prazo a correr. Passa a entrar numa fila de revisão ordenada pelo prazo legal, e quando há decisão recebes uma notificação com o teu pedido e o número de referência.",
  "changelog.entries.we-ask-again-when-the-rules-change.title":
    "Voltamos a perguntar quando os Termos ou as Diretrizes mudam",
  "changelog.entries.we-ask-again-when-the-rules-change.body":
    "Concordar uma vez no registo valia como concordar para sempre, por isso uma regra podia mudar sem ninguém chegar a vê-la. Quando um destes documentos muda de forma relevante, passas a ser convidada a ler o que mudou e a concordar de novo, e fica um registo com data. Isto conta sobretudo se alguma vez fores moderada por uma regra criada depois de te juntares.",
  "changelog.entries.iphone-notifications-explain-the-install-step.title":
    "As notificações no iPhone explicam o passo da instalação",
  "changelog.entries.iphone-notifications-explain-the-install-step.body":
    "O Safari só entrega notificações da QueerPulse depois de a adicionares ao ecrã principal, e nada dizia isso: ativá-las falhava apenas com um aviso de que o teu navegador ainda não conseguia fazer isto. A definição passa a explicar o passo da instalação e a ligar diretamente para ele.",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.title":
    "Um aviso antes de a tua conta ser apagada",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.body":
    "Pedir para apagar a conta abre um período em que era fácil esquecer o assunto e não ouvir nada até já não haver volta. Passas a receber uma notificação três dias antes de se tornar definitivo, enquanto cancelar ainda é um passo só.",
  "changelog.entries.moderators-see-the-positions-at-the-queue.title":
    "A modera\u00e7\u00e3o v\u00ea as posi\u00e7\u00f5es junto \u00e0 fila",
  "changelog.entries.moderators-see-the-positions-at-the-queue.body":
    "As duas filas de den\u00fancias, a da consola de modera\u00e7\u00e3o da comunidade e a da equipa da plataforma, passam a abrir com as tr\u00eas regras que a modera\u00e7\u00e3o tem de acertar: criticar um Estado \u00e9 discurso pol\u00edtico e a defesa da Palestina \u00e9 bem-vinda, a defesa dirigida a uma classe de pessoas membras n\u00e3o \u00e9, se algu\u00e9m merece direitos n\u00e3o \u00e9 um debate que acolhemos, e nunca se pede a ningu\u00e9m que prove o seu g\u00e9nero. At\u00e9 agora nenhuma superf\u00edcie de modera\u00e7\u00e3o ligava sequer \u00e0s Diretrizes.",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.title":
    "Onde nos posicionamos: vidas trans, Palestina, e o resto",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.body":
    "A p\u00e1gina Sobre passa a ter uma posi\u00e7\u00e3o, e n\u00e3o apenas um conjunto de valores de produto. Uma nova sec\u00e7\u00e3o \u201cOnde nos posicionamos\u201d explica porque a interseccionalidade \u00e9 insepar\u00e1vel da liberta\u00e7\u00e3o queer, nomeia o genoc\u00eddio em Gaza com todas as letras, recusa o pinkwashing, e apresenta tr\u00eas compromissos pelos quais podemos ser responsabilizadas: a defesa da Palestina \u00e9 discurso pol\u00edtico e \u00e9 moderada como tal, n\u00e3o aceitamos dinheiro de entidades c\u00famplices da ocupa\u00e7\u00e3o, e o fundo de apoio m\u00fatuo pode financiar trabalho de solidariedade. Come\u00e7a pelas vidas trans (a autodetermina\u00e7\u00e3o como norma, nenhum debate dos \u201cdois lados\u201d sobre se as pessoas membras merecem direitos, e a campanha pela exclus\u00e3o de pessoas trans tratada como assunto do C\u00f3digo de Conduta), depois a Palestina, e depois posi\u00e7\u00f5es mais curtas sobre trabalho sexual, migra\u00e7\u00e3o e racismo em Portugal, e serofobia. Termina no teste que decide quando falamos. O manifesto da homepage liga para l\u00e1, e as Diretrizes da Comunidade ganharam uma cl\u00e1usula equivalente que explica onde acaba o discurso pol\u00edtico e come\u00e7a um assunto do C\u00f3digo de Conduta.",
  "changelog.entries.directory-cards-show-who-runs-the-place.title":
    "Quem gere um espaço mostra agora a sua cara no cartão",
  "changelog.entries.directory-cards-show-who-runs-the-place.body":
    "Cada cartão do diretório local termina com uma linha que nomeia o membro que gere o espaço, e ao lado desse nome ficava um pequeno círculo com as iniciais do negócio. Um cartão do Maison Du Tiago, gerido pelo Tiago, mostrava MD ao lado de Tiago, o que se lia como um segundo logótipo onde devia estar uma pessoa. Esse círculo passa a mostrar a fotografia de perfil do próprio membro, a mesma que aparece no seu perfil, e mostra a inicial quando ainda não há fotografia. A fotografia segue exatamente as mesmas regras do nome ao lado: uma ficha cujo dono escolheu ficar anónimo, ou aparecer apenas pelo cargo, continua a não mostrar nenhum dos dois, e quem desligou a sua fotografia no resto do site mantém-na desligada aqui também.",
  "changelog.entries.members-can-put-something-to-a-vote.title":
    "Pode submeter algo a votação",
  "changelog.entries.members-can-put-something-to-a-vote.body":
    "As votações de governação eram algo em que podia participar mas que nunca podia iniciar. As propostas na página de governação eram abertas por administradores, por isso, se achasse que a comunidade devia decidir alguma coisa, não havia nenhum botão que lhe permitisse dizê-lo. Passa a poder apresentar uma moção: um título, uma descrição e a questão que quer ver colocada à comunidade. Uma moção tem de merecer o seu lugar no boletim de voto. São precisos dez membros que assinem por baixo, e você conta como o primeiro, por isso outras nove pessoas têm de concordar que merece ser votada. Ao chegar aos dez, segue para apreciação da equipa e, se for aprovada, esta define o período de votação e a moção abre como qualquer outra votação. Se for recusada, o motivo fica escrito na moção, à vista de todos. Uma moção que nunca chegue aos dez membros encerra sozinha ao fim de trinta dias. Também pode juntar o seu nome à moção de outra pessoa e retirá-lo enquanto a recolha estiver a decorrer.",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.title":
    "Uma votação de governação passa a precisar de gente suficiente para contar",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.body":
    "Uma proposta era aprovada com dois terços de quem calhasse votar, sem qualquer mínimo de participação. Uma pessoa a votar a favor e ninguém contra eram dois terços dos votos expressos, por isso a proposta passava. Isso não é uma decisão da comunidade, e a página de governação descrevia-a como se fosse. Todas as votações passam também a ter de cumprir um quórum: um número mínimo de votos para que o resultado conte, fixado em um décimo dos membros ativos ou dez pessoas, consoante o que for maior. O número perante o qual a proposta foi avaliada fica registado no seu encerramento, para que um resultado antigo mostre sempre a fasquia que realmente cumpriu, e não uma que mudou depois. As propostas passam a mostrar a participação face ao quórum enquanto a votação decorre, e uma proposta que falhou por terem votado poucas pessoas di-lo de forma explícita, para nunca ser confundida com uma que perdeu a votação.",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.title":
    "Qualquer pessoa numa comunidade pode sinalizar um proprietário ausente",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.body":
    "Quando o proprietário de uma comunidade desaparece, a comunidade fica parada: ninguém pode alterar as definições, transferir a propriedade ou nomear um moderador que a desbloqueie. Sinalizar um proprietário ausente estava limitado a moderadores e coproprietários, o que deixava de fora precisamente o caso em que era mais necessário, porque uma comunidade pequena cujo proprietário desapareceu antes de nomear alguém não tinha ninguém que pudesse fazê-lo. Qualquer membro de uma comunidade passa a poder levantar a questão, uma vez por dia, e com uma revisão aberta de cada vez por comunidade. Mudaram ainda duas coisas relacionadas. Se um proprietário apagar a sua conta, a propriedade passa primeiro para um coproprietário, caso exista, por ser a pessoa em quem o proprietário já tinha confiado poderes equivalentes, e só depois para o moderador mais antigo. E uma comunidade cujo proprietário não é visto há muito tempo passa a ser sinalizada automaticamente à equipa, para que uma comunidade abandonada apareça mesmo quando ninguém lá dentro se lembra de a reportar.",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.title":
    "A Constituição liga ao Código de Conduta",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.body":
    "O rodapé da Constituição oferecia três coisas para clicar e nenhuma delas fazia nada. Ler o Código de Conduta passa a abrir o Código de Conduta. As outras duas, Descarregar PDF e Ver a Assembleia, apontavam para um ficheiro e uma página que não existem, por isso foram retiradas em vez de continuarem ali com o aspeto de algo que se pudesse abrir.",
  "changelog.entries.menu-resizes-smoothly.title":
    "O menu principal muda de tamanho suavemente entre secções",
  "changelog.entries.menu-resizes-smoothly.body":
    "Ao percorrer o menu de topo, por exemplo de Trabalho para Sobre, o painel aberto saltava para a nova altura de uma só vez, o que parecia uma falha. O painel passa agora a ajustar a altura de forma gradual à medida que mudas de secção, acompanhando o esbatimento das ligações lá dentro. Com o movimento reduzido ativo, continua a mudar de tamanho de imediato.",
  "changelog.entries.nearby-places-full-cards.title":
    "Os locais a curta dist\u00e2ncia a p\u00e9 passam a mostrar o cart\u00e3o completo",
  "changelog.entries.nearby-places-full-cards.body":
    "As sugest\u00f5es \u201cA curta dist\u00e2ncia a p\u00e9\u201d no fim de uma ficha eram uma linha de texto: nome, categoria e dist\u00e2ncia. Passam a aparecer como os mesmos cart\u00f5es do diret\u00f3rio local, com a foto, o selo de espa\u00e7o seguro, a avalia\u00e7\u00e3o, a descri\u00e7\u00e3o e se a porta est\u00e1 aberta agora. A dist\u00e2ncia a p\u00e9 fica sobre a foto, para continuar a planear a noite pela dist\u00e2ncia entre as coisas.",
  "changelog.entries.map-pin-opens-place.title":
    "Tocar num local no mapa passa a abri-lo",
  "changelog.entries.map-pin-opens-place.body":
    "Se tinha escolhido uma freguesia no mapa local e depois tocava num local noutro s\u00edtio, o painel ao lado do mapa continuava a mostrar essa freguesia e muitas vezes dizia que nada correspondia aos filtros. Tocar num pino passa a limpar o filtro de \u00e1rea e a entregar o painel inteiro a esse local, com o mapa a aproximar-se dele. \u201cTodos os locais\u201d leva-o de volta \u00e0 lista completa.",
  "changelog.entries.review-line-breaks.title":
    "As avaliações mantêm os teus parágrafos e dobram-se quando ficam longas",
  "changelog.entries.review-line-breaks.body":
    "Uma avaliação escrita em vários parágrafos aparecia na página como um bloco único: todas as quebras de linha e linhas em branco que escreveste eram descartadas ao mostrar o texto. Agora as tuas quebras ficam exatamente como as escreveste. As avaliações longas passam também a dobrar-se nas primeiras linhas, com uma ligação Ler mais, para que uma avaliação muito comprida deixe de enterrar todas as que vêm a seguir.",
  "changelog.entries.directory-filters-in-one-row.title":
    "A barra de filtros do diretório passa a ser uma só linha",
  "changelog.entries.directory-filters-in-one-row.body":
    "Ao percorrer o diretório, o campo de pesquisa subia para trás da navegação flutuante e as duas barras ficavam sobrepostas. A barra de filtros passa a assentar logo abaixo da navegação e mantém-se legível durante todo o percurso da página, em qualquer disposição: a barra flutuante, a coluna lateral e a barra estreita no telemóvel. Os tipos de lugar mudaram-se para dentro do botão Refinar, ao lado de espaços seguros verificados e ambiente, pelo que a barra é uma linha de pesquisa mais um único controlo. O Refinar mostra o número de filtros aplicados e cada filtro ativo continua a aparecer como etiqueta removível por cima dos resultados.",
  "changelog.entries.volunteer-applicants-community-organisers.title":
    "As comunidades passam a poder rever as suas candidaturas de voluntariado",
  "changelog.entries.volunteer-applicants-community-organisers.body":
    'Rever quem se inscreveu numa oportunidade de voluntariado dependia inteiramente de quem a tinha publicado. Se essa pessoa desaparecesse, as candidaturas ficavam à espera. Agora quem detém, co-detém ou modera a comunidade em que a oportunidade foi publicada pode abri-la, ler as candidaturas e aceitar ou recusar, para que uma comunidade nunca dependa de uma só pessoa para responder a quem ofereceu o seu tempo. Editar e fechar uma oportunidade continuam a pertencer a quem a publicou. O botão "Gerir candidaturas" na página de voluntariado também deixa de aparecer a quem não tem nada para rever.',
  "changelog.entries.invites-go-out-by-hand.title":
    "Aprovar um pedido de adesão passa a dizer com clareza o que acontece a seguir",
  "changelog.entries.invites-go-out-by-hand.body":
    "Quando alguém da equipa acolhia uma pessoa, a confirmação dizia que ia a caminho um email de convite. A QueerPulse não tem serviço de email, por isso nunca era enviado nada e o convite podia ficar por reclamar com as duas pessoas à espera. O cartão passa a dizer que os convites seguem à mão e mostra ali mesmo a ligação para copiar, e os três botões de decisão deixam de sair para fora do cartão.",
  "changelog.entries.sessions-page-links-reach-a-person.title":
    "As tuas sessões ativas já conseguem chegar a uma pessoa",
  "changelog.entries.sessions-page-links-reach-a-person.body":
    "\u201cAlgo parece errado? Conta-nos o que aconteceu\u201d, nas tuas sessões ativas, abria uma página a anunciar que a tua conta estava bloqueada, o que era assustador e falso. Os dois links dessa página passam a levar-te ao que prometem: \u201co que fazer a seguir\u201d abre a secção Conta da Ajuda, que explica o que fazer com um dispositivo estranho, e \u201cconta-nos o que aconteceu\u201d abre o formulário de contacto com o tema já definido como acesso à conta, para a tua mensagem chegar à equipa. O link Voltar, no topo da página, regressa a Definições \u2192 Conta, de onde a abriste.",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.title":
    "As sec\u00e7\u00f5es das ferramentas de modera\u00e7\u00e3o chegam em vez de aparecerem de repente",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.body":
    "Passar entre Resumo, Pedidos, Den\u00fancias, Pessoas, Convites e o resto da consola de modera\u00e7\u00e3o trocava o painel inteiro num s\u00f3 instante, o que fazia cada mudan\u00e7a parecer um salto da p\u00e1gina em vez de uma passagem. Agora cada sec\u00e7\u00e3o aparece com um ligeiro subir e esbatimento durante uma fra\u00e7\u00e3o de segundo, para que o olhar acompanhe o destaque da esquerda at\u00e9 \u00e0 superf\u00edcie que acabaste de abrir. Se pediste ao teu dispositivo para reduzir o movimento, o painel continua a mudar de imediato, sem anima\u00e7\u00e3o nenhuma.",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.title":
    "Gerir as pessoas de uma comunidade volta a ler-se como uma lista de pessoas",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.body":
    "A secção Pessoas das ferramentas de moderação colocava todos os controlos de função na própria linha, por isso cada pessoa chegava atrás de três botões a disputar atenção e o nome que procuravas ficava espremido no espaço que sobrava. Tornar alguém mod, dar cotitularidade e remover da comunidade passam a viver atrás de um único botão ⋯ no fim da linha, que abre um menu curto quando precisas. A linha mostra a pessoa, a fotografia e a função, e as ações que podes tomar continuam a ser exatamente as que aparecem: nada surge no menu que a tua função não te permita fazer.",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.title":
    "O Studio e o Cinema falam portugu\u00eas em mais s\u00edtios",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.body":
    "Ao mudar o site para portugu\u00eas, havia partes do Studio e do Cinema que continuavam em ingl\u00eas. Os bot\u00f5es, t\u00edtulos, separadores, estados vazios e descri\u00e7\u00f5es de imagens das sec\u00e7\u00f5es de m\u00fasica e de cinema passam agora a seguir a l\u00edngua que escolheste, tal como o ecr\u00e3 de arranque de funda\u00e7\u00e3o, o gloss\u00e1rio, as ferramentas de fatura e contrato e v\u00e1rias p\u00e1ginas da revista e de parceiros. O que fica propositadamente em ingl\u00eas \u00e9 a obra em si: t\u00edtulos de faixas e \u00e1lbuns, letras, biografias de artistas, sinopses de filmes, fichas t\u00e9cnicas e notas de curadoria. S\u00e3o textos escritos por quem os criou, e traduzir as palavras de algu\u00e9m sem lhe perguntar seria a decis\u00e3o errada, por isso aparecem tal como o autor as escreveu em qualquer das l\u00ednguas.",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.title":
    "A tua lista de dispositivos deixa de acumular sess\u00f5es antigas",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.body":
    "Onde tens sess\u00e3o iniciada podia encher-se de entradas de um dispositivo que usaste uma \u00fanica vez. Cada in\u00edcio de sess\u00e3o criava uma sess\u00e3o, e voltar a entrar no mesmo navegador criava outra ao lado da primeira em vez de a substituir, por isso um cookie apagado, uma janela an\u00f3nima ou uma sess\u00e3o que simplesmente caducou deixavam sempre uma entrada para tr\u00e1s. Essas entradas ficavam l\u00e1 um m\u00eas, todas com o mesmo aspeto, o que tornava quase imposs\u00edvel responder \u00e0 \u00fanica pergunta para que a p\u00e1gina existe: h\u00e1 aqui alguma coisa que n\u00e3o sou eu? Agora, iniciar sess\u00e3o substitui a que este navegador j\u00e1 tinha, e as sess\u00f5es que caducaram saem da lista em vez de ficarem at\u00e9 serem eliminadas. Se a tua lista j\u00e1 est\u00e1 cheia, Terminar todas as outras sess\u00f5es limpa-a de uma vez e mant\u00e9m-te com sess\u00e3o iniciada aqui.",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.title":
    "Cada dispositivo diz quando iniciaste sess\u00e3o e mais ou menos quando l\u00e1 estiveste pela \u00faltima vez",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.body":
    "O Sess\u00e3o iniciada de cada dispositivo estava a medir a coisa errada. A tua sess\u00e3o renova-se sozinha em segundo plano de poucos em poucos minutos, e a p\u00e1gina mostrava a renova\u00e7\u00e3o mais recente, por isso o port\u00e1til onde tens sess\u00e3o desde junho anunciava-se como tendo chegado h\u00e1 sete minutos. Passa a mostrar quando iniciaste mesmo sess\u00e3o nesse dispositivo, e acrescenta uma linha aproximada de \u00faltima atividade quando o dispositivo voltou desde ent\u00e3o. Um dispositivo onde iniciaste sess\u00e3o e ao qual nunca voltaste mostra apenas o in\u00edcio de sess\u00e3o, porque \u00e9 tudo o que sabemos sobre ele.",
  "changelog.entries.profile-sections-share-one-left-edge.title":
    "Todas as secções do teu perfil alinham pela mesma margem",
  "changelog.entries.profile-sections-share-one-left-edge.body":
    "Num ecrã largo, as secções do teu perfil ficavam ligeiramente desalinhadas entre si: Comunidades, o teu trabalho, as tuas competências e as restantes estavam recuadas uns pixéis que \u201cEspaços que geres\u201d não tinha, e a coluna parecia torta. A página estava a aplicar a margem lateral duas vezes a essas secções, uma vez pela página e outra pela própria secção. Passam todas a partilhar a mesma margem esquerda de \u201cEspaços que geres\u201d, do topo da página até ao fim. No telemóvel, \u201cEspaços que geres\u201d passa a ter a mesma margem lateral que as outras secções já tinham, para os cartões respirarem junto à margem.",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.title":
    "As minhas comunidades esperam pela tua lista em vez de dizerem que n\u00e3o tens nenhuma",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.body":
    "Abrir Comunidades mostrava \u201cAinda n\u00e3o entraste em nenhuma comunidade\u201d durante o instante que demorava a ir buscar as tuas ades\u00f5es, mesmo quando pertencias a seis. O separador passa a mostrar um esqueleto com a forma dos teus cart\u00f5es at\u00e9 a tua lista chegar, e a linha por baixo do t\u00edtulo fica em sil\u00eancio at\u00e9 poder citar o n\u00famero verdadeiro, para nunca ler \u201cnas tuas 0 comunidades\u201d pelo caminho. O estado vazio continua a aparecer assim que sabemos que \u00e9 verdade, com o mesmo convite para ires descobrir uma comunidade.",
  "changelog.entries.say-what-you-do-on-your-profile.title":
    "Podes dizer o que fazes no teu perfil e ser encontrada por isso",
  "changelog.entries.say-what-you-do-on-your-profile.body":
    "O diret\u00f3rio de membros sempre permitiu filtrar por \u00e1rea e por fun\u00e7\u00e3o, mas o \u00fanico s\u00edtio para definir as tuas estava escondido nas Defini\u00e7\u00f5es, por isso a maioria dos perfis n\u00e3o tinha nada para corresponder. Passas a escolher a tua \u00e1rea, e as fun\u00e7\u00f5es dentro dela, diretamente na vista de edi\u00e7\u00e3o do teu perfil, e o assistente faz a mesma pergunta a quem chega de novo. O que escolheres aparece no teu perfil em \u201cTrabalha em\u201d e \u00e9 o que te coloca nos resultados quando algu\u00e9m filtra o diret\u00f3rio por fot\u00f3grafa, enfermeiro ou advogada. Escolher uma fun\u00e7\u00e3o seleciona a \u00e1rea por ti, e as fun\u00e7\u00f5es s\u00f3 aparecem depois de escolheres uma \u00e1rea, para nunca teres setenta op\u00e7\u00f5es \u00e0 frente de uma vez.",
  "changelog.entries.admin-account-menu-is-real.title":
    "O botão de conta da barra de administração passou a fazer alguma coisa",
  "changelog.entries.admin-account-menu-is-real.body":
    "O botão no fundo da barra de administração mostrava um nome que nunca foi o teu e um cargo que ninguém tem, e clicar nele não fazia rigorosamente nada. Passa a mostrar a conta com que estás mesmo autenticado, com o endereço ao lado do nome, e abre um menu com aquilo que a administração não tinha caminho nenhum para alcançar: o teu perfil, as definições da conta, as sessões ativas e terminar sessão. Terminar sessão era o que mais faltava. Voltar à plataforma sai da consola mas mantém a sessão aberta, por isso sair a sério obrigava a mais três navegações já no site principal, o que é um percurso longo num computador partilhado. O menu diz também que acesso esta conta tem, incluindo as permissões de equipa que determinam quais secções da barra funcionam.",
  "changelog.entries.admin-sidebar-grouped-sections.title":
    "A barra lateral de administração está agrupada em secções que podes fechar",
  "changelog.entries.admin-sidebar-grouped-sections.body":
    "A barra de administração tinha crescido para trinta e dois links numa lista única, longa ao ponto de encontrar seja o que for exigir percorrer quase tudo. Esses links passam a estar em oito secções identificadas: Confiança e segurança, Pessoas e acessos, Comunidades, Diretório, Editorial, Parcerias e reconhecimento, Conteúdo do site e Plataforma. Cada cabeçalho abre e fecha com um deslize curto, e a barra lembra-se dos que deixaste abertos. Um cabeçalho fechado continua a mostrar o total de itens à espera lá dentro, por isso uma secção fechada nunca esconde uma fila que precisa de atenção, e abrir uma página dentro de uma secção fechada abre essa secção por ti.",
  "changelog.entries.since-friday-panel-removed.title":
    "O painel Desde sexta da redação deixou de existir",
  "changelog.entries.since-friday-panel-removed.body":
    "O painel lateral de quem edita tinha um botão Desde sexta que abria uma lista do que tinha acontecido na redação enquanto estiveste fora. Repetia o que a redação já mostra: o feed de atividade na barra lateral lê o mesmo registo, e cada peça mantém o seu separador de Histórico. O botão e o painel foram removidos, e o painel lateral ficou mais curto.",
  "changelog.entries.writer-desk-header-says-whats-due.title":
    "O cabeçalho do teu espaço de escrita passa a dizer o que está para entregar",
  "changelog.entries.writer-desk-header-says-whats-due.body":
    "O topo do teu espaço de escrita mostrava o teu avatar, o teu nome e a palavra Contributor, coisas que a barra de navegação já mostra logo acima. Essa palavra estava fixa: dizia Contributor a toda a gente, sempre, e ficava em inglês no site em português. A barra passa a identificar a página e a dizer-te como está o teu trabalho, com quantos trabalhos tens em aberto e quando é a entrega mais próxima, ou uma linha discreta a dizer que não tens nada em mãos.",
  "changelog.entries.editors-can-write-their-own-pieces.title":
    "Quem edita a revista pode escrever uma peça, e não apenas encomendá-la",
  "changelog.entries.editors-can-write-their-own-pieces.body":
    'A secretária de edição só tinha uma forma de começar uma peça: encomendá-la. Isso obrigava quem quisesse simplesmente escrever algo a enviar um briefing a si mesmo, com honorário e prazo, antes de poder escrever uma palavra. Escrever passa a ser a ação principal da secretária, e Encomendar fica ao lado para as vezes em que a peça vai mesmo para outra pessoa. Escrever dispensa o formulário: a peça é criada contigo como autoria, começa em rascunho em vez de ficar à espera de um briefing que nunca vai chegar, e cais diretamente no editor de artigo com o cursor pronto. O título, a secção, a assinatura e a edição definem-se na barra lateral do próprio editor, que é onde iam ser alterados de qualquer maneira. Uma peça começada assim entra na edição em que estás a trabalhar, ou fica por arquivar se começaste no separador das não atribuídas, e o histórico da secretária diz "começou a escrever" em vez de registar uma encomenda que não aconteceu. A tecla w na secretária faz o mesmo, tal como o botão Escrever na barra lateral e na paleta de comandos.',
  "changelog.entries.editor-pages-start-at-the-top.title":
    "As páginas do editor da revista já não começam com uma faixa de creme vazio",
  "changelog.entries.editor-pages-start-at-the-top.body":
    "Todos os ecrãs do editor da revista reservavam uma faixa de espaço no topo para a barra de navegação flutuante do site, que esses ecrãs nunca mostram: correm sobre a sua própria barra lateral. O resultado era uma faixa vazia e alta acima da secretária, do registo de propostas e do plano da edição, e empurrava as barras de título fixas de uma peça, de uma edição e de um dossiê para fora do limite da janela. Esse espaço deixou de ser reservado, por isso cada página do editor começa onde começa o seu conteúdo e as barras fixas ficam encostadas ao topo. Quem usa a navegação lateral da aplicação também tinha a secretária empurrada para o lado pela largura de uma barra que não é desenhada nessas páginas; esse desvio também desapareceu.",
  "changelog.entries.issue-publish-date-optional.title":
    "Uma edição da revista já não precisa de data para existir",
  "changelog.entries.issue-publish-date-optional.body":
    "Criar uma edição na redação exigia uma data de publicação antes de mais nada, o que obrigava quem edita a inventar uma só para abrir o número. A data passa a ser opcional: preenche o número, o título e o tema, e a edição existe. A página de produção da edição tem agora um cartão de Data de publicação na barra lateral, onde a data pode ser definida mais tarde, alterada ou removida se o plano mudar. Uma edição sem data aparece como sem data marcada em vez de mostrar um dia inventado, e o envio continua a marcar o dia em que saiu se ninguém tiver definido nenhum.",
  "changelog.entries.cohost-invite-form-reads-properly.title":
    "Convidar quem co-organiza já se lê como deve ser",
  "changelog.entries.cohost-invite-form-reads-properly.body":
    "O segundo passo do convite para co-organizar, onde quem organiza define as condições, mostrava etiquetas internas em vez de palavras a sério: o nome de cada campo, as duas listas e os dois botões apareciam em código. Agora lê-se por inteiro, em português e em inglês. A pessoa convidada fica visível no topo do formulário, com fotografia e pronomes, e um único botão volta atrás se for a pessoa errada. Ao escolher uma função ou um compromisso de tempo aparece a mesma descrição que a pessoa convidada vai ler no convite, para ninguém escolher às cegas. O campo do recado conta os 500 caracteres disponíveis, a data de resposta já não pode ficar no passado e diz que é opcional, e os botões de enviar e cancelar ficam dentro do painel em qualquer largura de janela. A mesma correção chegou à página do convite, que estava sem a frase sobre o que passa a poder fazer quem aceita e o que fica com a pessoa anfitriã principal, e às Definições, onde a parte pública do teu perfil (a tua área, a tua função e as línguas que falas) tinha ficado sem títulos.",
  "changelog.entries.desk-activity-reads-in-plain-language.title":
    "A atividade da reda\u00e7\u00e3o passa a ler-se em linguagem normal",
  "changelog.entries.desk-activity-reads-in-plain-language.body":
    "Havia dois s\u00edtios na reda\u00e7\u00e3o que escreviam as suas linhas tal como saem da base de dados: o painel de Atividade na barra lateral e o hist\u00f3rico na ficha de cada pe\u00e7a. Ambos mostravam um identificador longo no lugar do nome, um c\u00f3digo interno como \u201carticle_edited\u201d no lugar da a\u00e7\u00e3o, e uma data de m\u00e1quina. Ningu\u00e9m percebia quem tinha mexido em qu\u00ea. Agora leem-se como frases: a pessoa pelo nome, o que fez em palavras simples, e quando. O painel da reda\u00e7\u00e3o diz o t\u00edtulo de cada pe\u00e7a e h\u00e1 quanto tempo aconteceu; o hist\u00f3rico de uma pe\u00e7a diz \u201cesta pe\u00e7a\u201d e mostra a data e a hora, por ser o registo permanente. As notas deixadas num rascunho, os rascunhos repostos e as apresenta\u00e7\u00f5es convertidas em artigo passam tamb\u00e9m a ter texto pr\u00f3prio. As linhas de um passo autom\u00e1tico aparecem como Sistema, e uma pe\u00e7a entretanto apagada aparece de forma neutra em vez de mostrar um identificador.",
  "changelog.entries.mod-tools-became-a-console.title":
    "As ferramentas de modera\u00e7\u00e3o passam a ser uma consola com barra de sec\u00e7\u00f5es",
  "changelog.entries.mod-tools-became-a-console.body":
    "O separador de ferramentas de modera\u00e7\u00e3o de uma comunidade empilhava oito superf\u00edcies num s\u00f3 scroll, e por isso as duas coisas com tempo, quem pede para entrar e as publica\u00e7\u00f5es denunciadas, ficavam enterradas sob um painel de estat\u00edsticas e por cima da lista completa de pessoas. As ferramentas abrem agora num resumo que responde primeiro a uma pergunta: h\u00e1 alguma coisa \u00e0 tua espera. Ao lado corre uma barra com Resumo, Pedidos, Den\u00fancias, Pessoas, Convites, Cart\u00e3o de membro e Zona de risco, e cada uma abre sozinha, uma de cada vez. Pedidos e Den\u00fancias mostram um contador quando h\u00e1 algo em espera. Os banimentos passaram para dentro de Pessoas, onde a situa\u00e7\u00e3o de um membro j\u00e1 est\u00e1 a ser lida. Cada sec\u00e7\u00e3o tem agora o seu pr\u00f3prio endere\u00e7o, por isso podes enviar a outra pessoa da modera\u00e7\u00e3o diretamente para a fila de den\u00fancias e o bot\u00e3o de voltar sai de l\u00e1. No telem\u00f3vel a barra passa a ser uma linha de fichas por cima da sec\u00e7\u00e3o.",
  "changelog.entries.share-card-shows-your-own-gathering.title":
    "O cart\u00e3o de partilha de um conv\u00edvio mostra agora esse conv\u00edvio",
  "changelog.entries.share-card-shows-your-own-gathering.body":
    "No painel de gest\u00e3o de um conv\u00edvio que organizas, o cart\u00e3o de partilha na barra lateral mostrava sempre o mesmo evento de exemplo: um t\u00edtulo fixo, uma data e um bairro fixos, e um link que levava \u00e0 lista de conv\u00edvios em vez da tua p\u00e1gina. Passa a mostrar o conv\u00edvio que est\u00e1s a gerir, com o seu t\u00edtulo, data e local, e a foto de capa quando a carregaste. Copiar coloca o link p\u00fablico real do conv\u00edvio na \u00e1rea de transfer\u00eancia, e \u201cVer p\u00e1gina p\u00fablica\u201d abre a p\u00e1gina desse conv\u00edvio.",
  "changelog.entries.place-page-reads-in-one-piece.title":
    "A p\u00e1gina de um espa\u00e7o passa a ler-se como um todo",
  "changelog.entries.place-page-reads-in-one-piece.body":
    "Na p\u00e1gina de um neg\u00f3cio do diret\u00f3rio, o hor\u00e1rio ficava numa tabela estreita com uma faixa vazia ao lado, a linha que diz quem confirmou os detalhes andava perdida por baixo, e o mapa era um quadrado pequeno com a morada abandonada em baixo. O hor\u00e1rio passa a viver num s\u00f3 cart\u00e3o: a semana em duas colunas, as altera\u00e7\u00f5es previstas, e a linha de confirma\u00e7\u00e3o no rodap\u00e9. O estado do momento aparece ao lado do t\u00edtulo, como em \u201cHor\u00e1rio \u00b7 Aberto agora\u201d. A sec\u00e7\u00e3o \u201cOnde fica\u201d passa tamb\u00e9m a ser um \u00fanico cart\u00e3o, com o mapa a correr de um lado e a morada, todas as formas de chegar ao espa\u00e7o e a a\u00e7\u00e3o principal ao lado. Voltar ao diret\u00f3rio passa a ser uma liga\u00e7\u00e3o discreta por baixo desse cart\u00e3o, e uma linha fina separa cada sec\u00e7\u00e3o da p\u00e1gina da seguinte.",
  "changelog.entries.place-pages-open-all-at-once.title":
    "A p\u00e1gina de um espa\u00e7o passa a abrir j\u00e1 com as fotografias",
  "changelog.entries.place-pages-open-all-at-once.body":
    "Ao abrir um neg\u00f3cio no diret\u00f3rio de neg\u00f3cios queer, a p\u00e1gina mostrava o nome, os detalhes e quatro molduras vazias, que depois se iam preenchendo \u00e0 medida que cada imagem chegava. A p\u00e1gina passa a esperar atr\u00e1s de um ecr\u00e3 de carregamento que diz em que passo vai, e aparece com as fotografias no lugar. Se alguma estiver lenta ou em falta, a p\u00e1gina abre na mesma em vez de te deixar \u00e0 espera.",
  "changelog.entries.browse-every-tag-by-category.title":
    "Explora todas as etiquetas por categoria em vez de adivinhar a palavra",
  "changelog.entries.browse-every-tag-by-category.body":
    "O campo de etiquetas do teu perfil mostrava apenas seis etiquetas populares e uma caixa de pesquisa, pelo que tinhas de j\u00e1 saber que uma etiqueta existia para a encontrares. Passa a haver um bot\u00e3o \u201cVer todas\u201d que abre a lista completa agrupada por categoria: design e cria\u00e7\u00e3o visual, palavras e comunica\u00e7\u00e3o, tecnologia, comunidade e cuidado, pr\u00e1tico e profissional, m\u00fasica e performance. Toca numa etiqueta para a adicionar, toca outra vez para a retirar, e pesquisa em todas as categorias a partir do topo do painel. As tuas escolhas ficam no perfil \u00e0 medida que as fazes.",
  "changelog.entries.backspace-keeps-your-tags.title":
    "O backspace deixa de apagar as etiquetas que j\u00e1 escolheste",
  "changelog.entries.backspace-keeps-your-tags.body":
    "Em todos os campos onde vais juntando etiquetas, as compet\u00eancias do teu perfil, aquilo a que est\u00e1s aberta ou aberto e as etiquetas de uma publica\u00e7\u00e3o no f\u00f3rum, manter o backspace premido para limpar o que tinhas escrito continuava para as etiquetas \u00e0 esquerda do cursor e ia-as removendo uma a uma, sem forma de desfazer. O backspace passa a apagar apenas o texto que est\u00e1s a escrever. As etiquetas saem quando carregas no \u00d7 da pr\u00f3pria etiqueta.",
  "changelog.entries.map-loader-stays-in-its-panel.title":
    "O mapa do diret\u00f3rio passa a carregar dentro do seu pr\u00f3prio painel",
  "changelog.entries.map-loader-stays-in-its-panel.body":
    "Na primeira vez que mudavas o diret\u00f3rio de neg\u00f3cios queer de Lista para Mapa, o ecr\u00e3 de carregamento ocupava toda a janela em vez de ficar no painel do mapa, pelo que a p\u00e1gina parecia desaparecer por instantes. O carregamento passa a preencher o mesmo painel arredondado onde o mapa aterra, e a p\u00e1gina \u00e0 volta mant\u00e9m-se no lugar.",
  "changelog.entries.plum-headers-reach-the-top.title":
    "Os cabe\u00e7alhos cor de ameixa passam a chegar ao topo",
  "changelog.entries.plum-headers-reach-the-top.body":
    "Nas p\u00e1ginas com um cabe\u00e7alho cor de ameixa, como Espa\u00e7os seguros, Cultura, Empregos e Habita\u00e7\u00e3o, ficava uma faixa fina de p\u00e1gina em creme atr\u00e1s da barra de navega\u00e7\u00e3o flutuante, pelo que a cor parecia come\u00e7ar um pouco abaixo do topo do ecr\u00e3. A cor de ameixa passa a preencher essa faixa em todas estas p\u00e1ginas e mant\u00e9m-se correta tamb\u00e9m nas disposi\u00e7\u00f5es de barra lateral e m\u00f3vel.",
  "changelog.entries.footer-closes-the-page.title":
    "As páginas curtas passam a acabar no fundo da janela",
  "changelog.entries.footer-closes-the-page.body":
    "Uma página com pouco conteúdo, como os teus cartões de membro antes de uma comunidade te emitir um, ficava a meio: o rodapé aterrava a meio do ecrã com uma faixa de página vazia por baixo, como se a disposição se tivesse soltado. Todas as páginas passam a chegar ao limite inferior da janela, para que o rodapé a feche sempre. As páginas mais longas mantêm-se iguais.",
  "changelog.entries.tab-title-follows-the-page.title":
    "O separador do navegador diz em que p\u00e1gina est\u00e1s",
  "changelog.entries.tab-title-follows-the-page.body":
    "Abrires uma p\u00e1gina p\u00fablica como a revista e voltares depois ao teu Feed ou ao diret\u00f3rio local deixava o nome antigo no separador do navegador, pelo que uma janela deixada aberta para mais tarde podia dizer \u201cThe Magazine\u201d enquanto mostrava o teu Feed. As p\u00e1ginas que t\u00eam nome pr\u00f3prio continuam a defini-lo, e todas as outras passam a mostrar o nome QueerPulse assim que chegas.",
  "changelog.entries.magazine-issues-run-the-desk.title":
    "As edições passam a mandar na redação",
  "changelog.entries.magazine-issues-run-the-desk.body":
    "A redação só conseguia trabalhar numa edição: a que tivesse o número mais alto. Não havia como criar uma nova, nem como voltar a uma anterior. Agora há um botão \u201cNova edição\u201d e um seletor no cabeçalho que diz em que edição estás a trabalhar. As peças começam sem edição nenhuma, numa via \u201cSem edição\u201d, até alguém as arrumar. Podes arrumar uma a partir da própria linha, selecionar várias e atribuí-las de uma vez, ou entrar numa edição e puxar trabalho a partir da página dela. Uma peça pode passar diretamente de uma edição para outra. E publicar uma edição passa a arquivar os artigos debaixo dela, para que o índice público da edição mostre mesmo o que saiu.",
  "changelog.entries.local-map-reads-clearly.title":
    "O mapa local voltou a ler-se bem",
  "changelog.entries.local-map-reads-clearly.body":
    "O mapa do diret\u00f3rio local estava esbatido. As ruas eram desenhadas a branco e cinzento claro, cores pensadas para outro fundo, e sobre o nosso creme quase desapareciam. Cada nome trazia um brilho branco \u00e0 volta que deixava o texto desfocado, e alguns nomes de freguesia apareciam duas vezes, com poucos p\u00edxeis de diferen\u00e7a. As ruas passam agora por uma escala quente e com contorno pr\u00f3prio, para conseguires seguir uma rua pela cidade. Os nomes recortam-se com nitidez sobre o fundo, e cada freguesia \u00e9 nomeada uma s\u00f3 vez. Os mapas tamb\u00e9m perdiam nitidez sempre que ampliavas o navegador ou passavas a janela para um segundo ecr\u00e3, e ficavam assim at\u00e9 recarregares a p\u00e1gina. Agora qualquer mapa \u00e9 desenhado com mais detalhe do que o ecr\u00e3 pede e mant\u00e9m-se n\u00edtido em qualquer n\u00edvel de zoom, em qualquer ecr\u00e3.",
  "changelog.entries.reviews-sort-on-quiet-listings.title":
    "Ordenar e filtrar avalia\u00e7\u00f5es passa a funcionar nos espa\u00e7os mais sossegados",
  "changelog.entries.reviews-sort-on-quiet-listings.body":
    "A lista de avalia\u00e7\u00f5es trazia a linha \u201cMais recentes\u201d sem nada que pudesses usar para a mudar. Os controlos existiam, apenas ficavam guardados at\u00e9 um espa\u00e7o juntar quatro avalia\u00e7\u00f5es, pelo que a maioria dos an\u00fancios nunca os mostrava. A partir da segunda avalia\u00e7\u00e3o j\u00e1 podes ordenar e filtrar. Ordena por mais recentes, mais antigas, mais \u00fateis ou melhor e pior avaliadas; limita a lista a um n\u00famero de estrelas; e fica s\u00f3 com as avalia\u00e7\u00f5es que trouxeram foto ou que j\u00e1 tiveram resposta de quem gere o espa\u00e7o. Se uma combina\u00e7\u00e3o deixar o ecr\u00e3 vazio, limpas tudo com um toque.",
  "changelog.entries.map-narrows-to-the-area-you-pick.title":
    "Escolher uma zona no mapa limpa as restantes",
  "changelog.entries.map-narrows-to-the-area-you-pick.body":
    "Clicar numa freguesia no mapa local destacava-a e filtrava a lista ao lado, mas todos os outros pinos ficavam no s\u00edtio, pelo que a zona que acabavas de escolher continuava perdida no meio da cidade inteira. Escolher uma zona deixa agora apenas os pinos dessa zona no mapa. Cada uma das outras freguesias mant\u00e9m o nome e um n\u00famero com o que l\u00e1 existe, para continuares a perceber onde fica o resto da cidade. Clica outra vez na zona destacada para trazer tudo de volta.",
  "changelog.entries.pages-open-at-the-top.title":
    "Mudar de p\u00e1gina leva-te ao topo de imediato",
  "changelog.entries.pages-open-at-the-top.body":
    "Sa\u00edres de uma p\u00e1gina onde tinhas descido muito, por exemplo o fundo do diret\u00f3rio de an\u00fancios, e abrires outra, como o teu perfil, fazia o navegador deslizar lentamente at\u00e9 cima antes de a nova p\u00e1gina assentar. Numa lista comprida esse deslize demorava, e tudo o que tocasses entretanto lutava com a anima\u00e7\u00e3o. Agora a mudan\u00e7a de p\u00e1gina aparece logo no topo. O bot\u00e3o de retroceder continua a devolver-te ao ponto exato onde estavas, e tocar no separador em que j\u00e1 est\u00e1s continua a subir suavemente, como antes.",
  "changelog.entries.queer-owned-says-queer-owned.title":
    "Os neg\u00f3cios queer j\u00e1 o dizem no cart\u00e3o",
  "changelog.entries.queer-owned-says-queer-owned.body":
    "Um neg\u00f3cio cujo dono nos disse que \u00e9 queer continuava rotulado como \u201cLGBTQ+ friendly\u201d no diret\u00f3rio. Havia dois problemas: o cart\u00e3o estava a ler uma defini\u00e7\u00e3o completamente diferente (se o dono mostra o an\u00fancio no perfil dele) e um espa\u00e7o seguro verificado ocupava sozinho o canto do selo, pelo que esses lugares nem chegavam a dizer o que s\u00e3o. Agora os cart\u00f5es mostram o selo em tr\u00eas n\u00edveis honestos: neg\u00f3cio queer verificado, neg\u00f3cio queer ou LGBTQ+ friendly. A marca de espa\u00e7o seguro passou para o lado, como um escudo jade, e basta passar o rato ou o foco para saber o que \u00e9.",
  "changelog.entries.review-appears-immediately.title":
    "A tua avaliação aparece assim que a publicas",
  "changelog.entries.review-appears-immediately.body":
    "Publicar uma avaliação de um espaço dizia-te que tinha resultado e depois deixava a página igual ao que estava antes: as tuas palavras só apareciam se recarregasses. A página estava a receber uma cópia do espaço guardada mesmo antes de escreveres. Agora a tua avaliação aparece na lista no instante em que a publicas, já contada na classificação em estrelas. A mesma cópia desatualizada podia chegar a qualquer página pública, por isso as páginas de persona, as apresentações de comunidades, os grupos de habitação, as cooperativas, o roteiro e o diretório de changemakers também passam a mostrar as tuas alterações de imediato.",
  "changelog.entries.star-pickers-follow-your-cursor.title":
    "As estrelas j\u00e1 acompanham o cursor como deve ser",
  "changelog.entries.star-pickers-follow-your-cursor.body":
    "Classificar um espa\u00e7o ou uma empresa obrigava a acertar em cheio em cada estrela: os espa\u00e7os entre elas n\u00e3o contavam para nada, por isso a pr\u00e9-visualiza\u00e7\u00e3o voltava a zero enquanto percorrias a linha, e a cor entrava de repente. As estrelas passam a ficar encostadas umas \u00e0s outras, portanto qualquer ponto da linha acende a classifica\u00e7\u00e3o que est\u00e1s a apontar, e o coral entra a preencher em vez de saltar.",
  "changelog.entries.review-stars-hint.title":
    "As avaliações já dizem porque é que o botão está desativado",
  "changelog.entries.review-stars-hint.body":
    "Dava para escrever uma avaliação inteira de um espaço, ir ao botão e encontrá-lo desativado, sem nada que explicasse que as estrelas lá em cima continuavam por escolher. Agora, assim que começas a escrever, aparece uma linha ao lado do botão a pedir uma classificação em estrelas, para que a única peça em falta seja dita onde estás mesmo a olhar.",
  "changelog.entries.filters-keep-your-place.title":
    "Filtrar uma p\u00e1gina j\u00e1 n\u00e3o te atira de volta para o topo",
  "changelog.entries.filters-keep-your-place.body":
    "Alternar o diret\u00f3rio local entre mapa e lista atirava a p\u00e1gina toda para o in\u00edcio, e o mesmo acontecia ao ativar um filtro ou escrever mais uma letra numa pesquisa. Tudo o que vive na barra de endere\u00e7o contava como uma p\u00e1gina nova. Agora a aplica\u00e7\u00e3o distingue um filtro de uma navega\u00e7\u00e3o a s\u00e9rio: muda de vista ou afina uma lista e ficas exatamente onde estavas a ler.",
  "changelog.entries.directory-card-cover-photo.title":
    "A foto do seu neg\u00f3cio j\u00e1 aparece no diret\u00f3rio",
  "changelog.entries.directory-card-cover-photo.body":
    "Todos os cart\u00f5es do diret\u00f3rio local diziam \u201cFoto brevemente\u201d, mesmo para neg\u00f3cios cujos donos tinham carregado um plano geral h\u00e1 meses. A foto sempre l\u00e1 esteve; a grelha \u00e9 que nunca a pedia. Os cart\u00f5es passam a mostrar o plano geral da sua ficha, enquadrado como o recortou, e o passo das fotos diz claramente qual delas fica como capa.",
  "changelog.entries.persona-banner-reposition.title":
    "Põe o banner da tua persona exatamente onde queres",
  "changelog.entries.persona-banner-reposition.body":
    "O teu banner já não tem de ficar onde o recorte calhou. Passa o rato por cima dele na tua própria página de persona, escolhe “Reposicionar” e arrasta a imagem para cima ou para baixo até a parte que te interessa ficar enquadrada. As setas do teclado também funcionam. Guarda, e é assim que toda a gente a vê.",

  "changelog.entries.listing-owner-photo.title":
    "A cara por tr\u00e1s de um an\u00fancio aparece mesmo",
  "changelog.entries.listing-owner-photo.body":
    "O cart\u00e3o \u201cQuem gere\u201d numa p\u00e1gina de neg\u00f3cio mostrava as iniciais mesmo quando quem gere tinha foto de perfil, e o mesmo acontecia \u00e0s fotografias ao lado das avalia\u00e7\u00f5es e das perguntas. As imagens apontavam para o s\u00edtio errado e nunca chegavam a carregar. Passam a carregar bem, e quem desligou a sua foto nas defini\u00e7\u00f5es de privacidade continua a aparecer com iniciais, como escolheu.",
  "changelog.entries.persona-savebar-compact.title":
    "Mais espaço para escrever ao editar uma persona no telemóvel",
  "changelog.entries.persona-savebar-compact.body":
    "A barra de alterações por guardar no editor de personas listava todas as edições, o que num ecrã pequeno deixava quase nenhum espaço acima do teclado. No telemóvel passa a mostrar uma única linha com o número de alterações à espera, e basta tocar para abrir a lista completa. Guardar e Descartar ficam onde sempre estiveram.",
  "changelog.entries.sharper-photos.title":
    "Fotografias nítidas em qualquer ecrã",
  "changelog.entries.sharper-photos.body":
    "As fotografias que carregas mantêm agora muito mais detalhe. As imagens grandes são reduzidas por etapas cuidadas, em vez de num único passo tosco, que era o que deixava um banner ou uma foto de perfil com um aspeto ligeiramente desfocado, e passam a ser guardadas num formato mais recente que retém mais detalhe no mesmo tamanho. Capturas de ecrã e desenhos ficam perfeitos ao pixel. As imagens são também pedidas no tamanho que o teu ecrã consegue mostrar, por isso um telemóvel nítido recebe uma imagem nítida e ninguém paga por detalhe que não consegue ver.",
  "changelog.entries.listing-pages-rebuild.title":
    "Páginas de negócios, refeitas à volta do que vieste saber",
  "changelog.entries.listing-pages-rebuild.body":
    "Cada página de negócio começa agora pelo que realmente vieste ver: se está aberto, onde fica, o que é e como é entrar lá. As perguntas de acessibilidade são respondidas com sim, não, ou ninguém nos disse, para que uma pergunta sem resposta deixe de parecer um não. Podes perguntar algo em público a um negócio e ler o que outras pessoas perguntaram, ver quando uma avaliação foi escrita, marcá-la como útil e juntar uma foto à tua. Os sítios que fecharam, mudaram de morada ou estão em pausa passam a dizê-lo, em vez de parecerem abertos.",
  "changelog.entries.listing-owner-control.title":
    "Mais controlo para quem gere um espaço",
  "changelog.entries.listing-owner-control.body":
    "Editar o teu anúncio já não o retira do diretório enquanto espera por nova verificação. Depois de aprovado, as tuas correções ficam no ar assim que guardas. O editor é um único ecrã em vez de seis passos, guarda um rascunho se fores interrompido e mostra-te a página real antes de publicares. Podes definir horários de feriado, marcar-te como temporariamente fechado ou mudado, pôr um anúncio em pausa sem o apagar, listar os teus serviços e preços, e ver o que as pessoas sugeriram ou perguntaram.",
  "changelog.entries.persona-banner-framing.title":
    "Banners de persona, enquadrados como tu os enquadraste",
  "changelog.entries.persona-banner-framing.body":
    "Os banners de persona passam a reenquadrar-se em 3:1 (a forma com que realmente aparecem) em vez do 2:1 usado nas capas da revista, e a página mantém aquilo que centraste no enquadramento em vez de cortar uma faixa arbitrária do meio. Os banners também são carregados com mais resolução, por isso mantêm-se nítidos de ponta a ponta num ecrã grande, e agora sobem até ao topo da página.",
  "changelog.entries.card-check-page-rebuild.title":
    "A p\u00e1gina de verifica\u00e7\u00e3o do cart\u00e3o passa a mostrar a fotografia",
  "changelog.entries.card-check-page-rebuild.body":
    "Ler um cart\u00e3o de s\u00f3cie dava uma linha de texto e um aviso a dizer para olhar para a fotografia do cart\u00e3o. A verifica\u00e7\u00e3o passa a chegar como o pr\u00f3prio cart\u00e3o: o nome de quem o tem numa linha s\u00f3, os pronomes por baixo, a comunidade, o papel e o n\u00famero do cart\u00e3o, e a fotografia que o cart\u00e3o cont\u00e9m, vinda dos registos da pr\u00f3pria comunidade, para que esteja a comparar a pessoa \u00e0 sua frente com uma c\u00f3pia que ningu\u00e9m \u00e0 porta poderia ter alterado. Um cart\u00e3o que n\u00e3o passa a verifica\u00e7\u00e3o passa a explicar o que pode causar isso, o que fazer a seguir, e que isso n\u00e3o \u00e9 um ju\u00edzo sobre a pessoa. E uma leitura que falha por falta de rede passa a dizer isso mesmo em vez de parecer uma recusa.",
  "changelog.entries.persona-rights-footer-once.title":
    "Um s\u00f3 aviso de direitos por p\u00e1gina de persona",
  "changelog.entries.persona-rights-footer-once.body":
    "O aviso \u201cTodos os direitos reservados\u201d repetia-se ao lado de cada item de uma p\u00e1gina de persona. Passa a aparecer uma \u00fanica vez, no fim da p\u00e1gina, a cobrir todo o trabalho dessa persona. Ao abrir um poema ou uma obra em separado, continua a ver-se o aviso pr\u00f3prio.",
  "changelog.entries.community-card-live-preview.title":
    "Vê o cartão da tua comunidade enquanto a editas",
  "changelog.entries.community-card-live-preview.body":
    "Editar uma comunidade era adivinhar: o nome, a frase de assinatura, a foto de capa, o tipo de espaço, as etiquetas e quem a pode encontrar mudam todos o cartão por onde as pessoas te conhecem, e só depois de guardar e ir ver é que se percebia o resultado. A janela de edição passa a mostrar esse cartão ao lado do formulário, desenhado a partir do que estás a escrever, para veres o corte da capa ou uma frase mais curta antes de decidires.",

  "changelog.entries.card-co-owner-role.title":
    "Os cartões de sócie identificam corretamente quem é cotitular",
  "changelog.entries.card-co-owner-role.body":
    "As comunidades podem dar poderes de responsável a uma pessoa membro, tornando-a cotitular. Os cartões de sócie ainda não conheciam esse papel, por isso o cartão de uma pessoa cotitular chamava-lhe membro: no próprio cartão, no painel de titulares e na página que abre ao ler o código. Os cartões passam a apresentar o papel que a comunidade regista, e promover alguém atualiza o cartão de imediato, sem ser preciso recarregar a página.",

  "changelog.entries.profile-community-cards.title":
    "As tuas comunidades ficam iguais no perfil e na página de comunidades",
  "changelog.entries.profile-community-cards.body":
    "As comunidades que destacas no perfil eram um cartão simples e compacto. Passam a ser o mesmo cartão que a página de comunidades mostra: o cabeçalho da categoria com a foto de capa, as caras de quem já lá está, a descrição completa, as etiquetas e a atividade desta semana. O selo diz a quem te visita como estás em cada uma, se és responsável, se moderas ou se és membro.",

  "changelog.entries.profile-places-directory-cards.title":
    "Os teus espaços ficam iguais no perfil e no diretório",
  "changelog.entries.profile-places-directory-cards.body":
    "Os cartões “Espaços que geres” no teu perfil eram um resumo em texto simples. Passam a ser o mesmo cartão que o diretório local mostra: foto de capa, selo de negócio queer ou de espaço seguro, categoria, etiquetas e o horário de hoje. O estado do teu anúncio e as ações de editar, edição rápida e apagar ficam por baixo, para continuares a ver de relance se já está publicado ou ainda em leitura.",

  "changelog.entries.community-co-owners.title":
    "Quem é responsável pode partilhar a comunidade com alguém cotitular",
  "changelog.entries.community-co-owners.body":
    "Nas Ferramentas de moderação, quem é responsável por uma comunidade pode tornar qualquer pessoa membro cotitular. Quem é cotitular conduz a comunidade contigo: pedidos de entrada, moderação, definições e gestão de pessoas. Transferir a titularidade, arquivar a comunidade e mudar o papel de quem é cotitular continuam a caber só a quem é responsável, e a cotitularidade pode ser retirada quando quiseres.",

  "changelog.entries.card-art-counted-as-in-use.title":
    "A arte do cartão de sócio passa a contar como imagem em uso",
  "changelog.entries.card-art-counted-as-in-use.body":
    "O brasão e o fundo que uma comunidade escolhe para o cartão de sócio apareciam sem referências nos teus carregamentos, o que fazia parecer seguro apagar arte de cartões em circulação. Agora ambos contam como em uso e ligam de volta à comunidade que os imprime. Os avatares de comunidade, as imagens de matérias e decks da revista e as fotos enviadas numa conversa também passam a contar.",

  "changelog.entries.community-house-rules.title":
    "As regras da casa chegam com o convite",
  "changelog.entries.community-house-rules.body":
    "Entrar numa comunidade com regras da casa passa por lê-las e aceitá-las primeiro. Se mais tarde a pessoa responsável mudar as regras, quem já está dentro é convidado uma vez a ler a nova versão, e fica registado aquilo que aceitaste.",
  "changelog.entries.community-removal-bars-return.title":
    "Sair por decisão da moderação passa a significar isso mesmo",
  "changelog.entries.community-removal-bars-return.body":
    "Quando alguém da moderação remove uma pessoa, essa pessoa deixa de poder voltar a entrar de imediato. A moderação pode na mesma remover e deixar a porta aberta quando é só arrumação, e qualquer impedimento pode ser levantado depois nas Ferramentas de moderação.",
  "changelog.entries.community-announcements.title":
    "Quem é responsável pode dizer algo que se destaca",
  "changelog.entries.community-announcements.body":
    "Quem é responsável, cotitular ou modera pode publicar um anúncio: fica fixado no topo e chega a quem é membro da comunidade. As publicações normais continuam normais.",
  "changelog.entries.community-notification-levels.title":
    "Escolhe quanto é que cada comunidade te chega",
  "changelog.entries.community-notification-levels.body":
    "Cada comunidade passa a ter a sua definição: tudo, só anúncios, só menções, ou silenciada. Define-a comunidade a comunidade a partir da linha de separadores. Quem chega começa em só anúncios.",
  "changelog.entries.community-invites-any-time.title":
    "Convida pessoas para a tua comunidade a qualquer momento",
  "changelog.entries.community-invites-any-time.body":
    "Convidar pessoas só era possível no dia em que fundavas a comunidade. Quem é responsável, cotitular ou modera pode agora convidar a partir das Ferramentas de moderação. Um convite é uma mensagem, e entrar continua a ser decisão da outra pessoa.",
  "changelog.entries.community-join-review-context.title":
    "Ver um pedido de entrada mostra-te a pessoa",
  "changelog.entries.community-join-review-context.body":
    "Um pedido chega agora com pronomes, há quanto tempo a pessoa está na QueerPulse, ligações em comum e comunidades em comum, com o nome ligado ao perfil. Ao recusar, escolhes entre 'agora não' e 'não é o espaço certo', para a pessoa saber se vale a pena voltar a tentar.",
  "changelog.entries.community-resources-shelf.title":
    "Uma prateleira a sério para os links da comunidade",
  "changelog.entries.community-resources-shelf.body":
    "Quem é responsável, cotitular ou modera pode construir a prateleira de recursos: linhas de apoio, guias legais, uma lista de leituras, aquilo a que a comunidade volta sempre. Reordenável, e aparece no separador Sobre.",
  "changelog.entries.community-co-ownership.title":
    "Cotitulares, e uma forma de sinalizar ausências",
  "changelog.entries.community-co-ownership.body":
    "Uma comunidade pode agora ter uma pessoa cotitular que partilha os poderes do dia a dia, enquanto transferir a titularidade e arquivar continuam a caber a quem é responsável. Se quem é responsável ficar impossível de contactar, a moderação pode pedir à equipa da plataforma que veja, e basta aparecer para retirar esse pedido.",
  "changelog.entries.community-governance-history.title":
    "Cada comunidade vê o seu próprio histórico",
  "changelog.entries.community-governance-history.body":
    "Quem é responsável, cotitular ou modera pode ler o registo do que aconteceu na comunidade: mudanças de papel, remoções, impedimentos levantados, pausas e transferências. Antes só a equipa da plataforma via isto.",
  "changelog.entries.community-public-teaser.title":
    "Partilha uma comunidade com quem está de fora",
  "changelog.entries.community-public-teaser.body":
    "Quem é responsável pode deixar a comunidade mostrar uma página pública curta a quem não tem sessão iniciada: o que é, para quem é, e como pedir convite. Desligado por omissão, disponível só para comunidades abertas ou de pedido de entrada, e nunca mostra a lista de membros nem uma única publicação.",
  "changelog.entries.community-place-and-language.title":
    "Encontra comunidades perto de ti, na tua língua",
  "changelog.entries.community-place-and-language.body":
    "As comunidades podem dizer onde se encontram e em que línguas funcionam, e o Descobrir filtra por ambos. Ordenar por mais ativas passa também a ser feito no servidor, por isso os resultados ficam certos para lá da primeira página.",
  "changelog.entries.community-welcome-and-search.title":
    "Boas-vindas à chegada, e pesquisa dentro da comunidade",
  "changelog.entries.community-welcome-and-search.body":
    "Quem é responsável pode escrever uma saudação que quem chega vê uma vez. As publicações de cada comunidade passam a ser pesquisáveis, em todo o histórico e não só na parte a que já chegaste.",
  "changelog.entries.community-insight-trends.title":
    "As estatísticas da comunidade mostram direção",
  "changelog.entries.community-insight-trends.body":
    "O painel de estatísticas junta doze semanas de entradas e publicações, para veres se a comunidade está a crescer ou a ficar em silêncio. Apenas totais da comunidade inteira: a atividade individual de cada pessoa não é mostrada.",
  "changelog.entries.community-pause-reason.title":
    "Uma comunidade em pausa explica-se com honestidade",
  "changelog.entries.community-pause-reason.body":
    "O aviso de pausa dizia que a moderação estava a rever denúncias mesmo quando alguém tinha simplesmente posto a comunidade em pausa. Passa a dizer qual dos três casos é, quando começou, e mostra a nota da moderação quando existe.",
  "changelog.entries.community-card-covers.title":
    "As comunidades mostram a sua fotografia",
  "changelog.entries.community-card-covers.body":
    "O cart\u00e3o de uma comunidade abria com uma faixa de cor lisa, por isso uma comunidade que tinha escolhido uma fotografia de capa nunca a mostrava fora da sua pr\u00f3pria p\u00e1gina. Agora o cart\u00e3o usa essa fotografia como cabe\u00e7alho, com a categoria e a etiqueta de acesso assentes num v\u00e9u escuro suave, para continuarem leg\u00edveis sobre qualquer imagem. Uma comunidade sem fotografia mant\u00e9m a faixa de cor. Todos os cart\u00f5es da grelha passam tamb\u00e9m a ter a mesma altura, seja qual for o comprimento da descri\u00e7\u00e3o, por isso o n\u00famero de membros e os bot\u00f5es ficam alinhados na mesma linha em vez de andarem \u00e0 deriva.",
  "changelog.entries.community-founded-month.title":
    "Fundada, at\u00e9 ao m\u00eas",
  "changelog.entries.community-founded-month.body":
    "A p\u00e1gina de uma comunidade dizia apenas o ano de funda\u00e7\u00e3o, por isso tudo o que come\u00e7ou este ano aparecia como \u201cFundada em 2026\u201d e dizia muito pouco. Agora indica tamb\u00e9m o m\u00eas, escrito como a tua l\u00edngua o escreve: \u201cFundada em agosto de 2026\u201d.",
  "changelog.entries.card-text-legibility.title":
    "Cart\u00f5es que se leem \u00e0 dist\u00e2ncia",
  "changelog.entries.card-text-legibility.body":
    "Um cart\u00e3o de s\u00f3cie assente numa bandeira ou numa fotografia sempre escureceu o que fica por baixo do texto, mas um s\u00f3 tratamento n\u00e3o serve todas as imagens: o gradiente que funciona sobre uma bandeira \u00e0s riscas perde-se numa ilustra\u00e7\u00e3o carregada. Agora as dones escolhem entre tr\u00eas. O painel p\u00f5e uma pequena placa escura por tr\u00e1s do nome da comunidade e do nome da pessoa e deixa o resto da imagem destapado. A sombra escurece o topo e a base do cart\u00e3o. O v\u00e9u escurece o cart\u00e3o inteiro por igual. A pr\u00e9-visualiza\u00e7\u00e3o no editor acompanha a escolha \u00e0 medida que a faz, e um cart\u00e3o impresso leva o mesmo tratamento do que est\u00e1 no telem\u00f3vel. Todos os cart\u00f5es passam tamb\u00e9m a imprimir maior: o texto \u00e9 agora dimensionado em rela\u00e7\u00e3o ao pr\u00f3prio cart\u00e3o, por isso um cart\u00e3o mostrado em grande no ecr\u00e3 tem texto em grande, em vez de letra do tamanho do telem\u00f3vel num objeto ampliado.",
  "changelog.entries.my-communities-cards.title":
    "As tuas comunidades, como comunidades",
  "changelog.entries.my-communities-cards.body":
    "As tuas comunidades apareciam numa lista pequena ao lado da p\u00e1gina, enquanto as dos outros tinham cart\u00e3o. Agora as tuas abrem a p\u00e1gina: os mesmos cart\u00f5es, a mesma pesquisa, categorias e ordena\u00e7\u00e3o que j\u00e1 usas para encontrar uma comunidade, apontados \u00e0quelas em que j\u00e1 est\u00e1s. Cada cart\u00e3o est\u00e1 marcado como teu e mostra quantas pessoas estiveram por l\u00e1 esta semana, e os separadores trazem uma contagem para veres num relance em quantas est\u00e1s. O que estava antes \u2014 o que espera por ti como moderadore, e a semana das tuas comunidades \u2014 fica agora por baixo.",
  "changelog.entries.cards-load-whole.title": "O teu cartão chega inteiro",
  "changelog.entries.cards-load-whole.body":
    "Um cartão de sócie montava-se à tua frente: a bandeira da comunidade, o emblema e a tua fotografia apareciam à medida que iam carregando. Agora o cartão espera pelos três e chega completo, com um espaço reservado a segurar a forma exacta enquanto vem. Mostrar o mesmo cartão outra vez é imediato. Com ligação lenta, o cartão aparece à mesma, para não te deixar à espera à porta.",
  "changelog.entries.pronouns-on-membership-cards.title":
    "Pronomes no cartão de sócie",
  "changelog.entries.pronouns-on-membership-cards.body":
    "Uma comunidade pode agora mostrar os pronomes de cada sócie ao lado do nome no cartão, para que quem o lê saiba como tratar a pessoa que o mostra. Os pronomes vêm do perfil de cada sócie, por isso o cartão só mostra o que já está definido lá, e alterá-los atualiza todos os cartões de uma só vez. Vem desligado até a comunidade o ligar, e qualquer pessoa pode desligar os seus na sua página de cartões. Quando o cartão os mostra, aparecem também na página a que se chega depois de ler o código.",
  "changelog.entries.printed-membership-cards.title":
    "Cartões de membro para imprimir",
  "changelog.entries.printed-membership-cards.body":
    "As comunidades podem agora imprimir cartões de membro físicos, numa folha que se corta e dobra. Um cartão impresso mostra o mesmo código do cartão no telemóvel, por isso qualquer pessoa o pode verificar à porta. Se um cartão se perder, os moderadores podem substituí-lo: todas as cópias impressas deixam de funcionar de imediato e o cartão no telemóvel continua a funcionar.",
  "changelog.entries.profile-back-to-origin.title":
    "A saída de um perfil leva-te de volta a onde estavas",
  "changelog.entries.profile-back-to-origin.body":
    'Os perfis abrem-se a partir de todo o lado: da lista de pessoas de uma comunidade, de um tópico do fórum, de um convívio, de uma pesquisa, do cabeçalho de uma conversa. O link por cima de cada perfil dizia sempre "Voltar à sala" e deixava-te sempre no diretório de pessoas, que para a maioria era uma página onde nunca tinha estado, e ainda te fazia perder o sítio onde ias na lista. Agora volta à página de onde vieste mesmo, diz qual é, e deixa-te no ponto exato da lista de onde saíste. Quem chega diretamente de um link partilhado, de um recarregamento ou de uma notificação continua a receber o diretório, porque nesse caso não há mais nada para onde voltar.',

  "changelog.entries.card-holder-open-card.title":
    "Abrir o cartão de uma pessoa a partir da lista",
  "changelog.entries.card-holder-open-card.body":
    "A lista de quem tem cartão numa comunidade mostrava um nome, um número e dois botões, por isso a única coisa que quem gere a comunidade queria mesmo ver, o cartão, era a única que não conseguia abrir. Agora qualquer linha abre e mostra o cartão real dessa pessoa em tamanho inteiro: o desenho da comunidade, as datas que carrega, o papel que imprime e a fotografia que mostra ou não mostra. O código no verso é a exceção, e diz isso mesmo: é gerado para quem tem o cartão, por isso só essa pessoa consegue produzir um que funcione. Suspender, revogar e reativar estão ali no cartão aberto, por isso ver um cartão e agir sobre ele deixaram de ser duas viagens.",

  "changelog.entries.card-photo-legibility.title":
    "Fotografias que se leem bem em qualquer cartão",
  "changelog.entries.card-photo-legibility.body":
    "A fotografia de uma pessoa e o emblema de uma comunidade ficavam pousados diretamente sobre aquilo que o cartão tivesse vestido, por isso uma fotografia clara sobre uma bandeira clara perdia os contornos e uma ilustração cheia de coisas por trás competia com a cara. Ambos passam a ter um contorno de dois tons e uma sombra suave que escurece os poucos pixéis de cartão onde assentam, o que resulta tanto numa bandeira como numa imagem carregada ou numa cor lisa. As comunidades que põem fotografia podem também escolher imprimi-la a preto e branco, e o editor diz com todas as letras que esta é uma escolha sobre as imagens de outras pessoas.",

  "changelog.entries.card-member-photos.title":
    "Cartões de sócie com fotografia, e a última palavra fica com a pessoa",
  "changelog.entries.card-member-photos.body":
    "Uma comunidade pode agora pôr a fotografia de cada sócie no cartão, para quem está à porta poder ligar o cartão à pessoa sem ler código nenhum. A fotografia vem do perfil da própria pessoa e fica na frente, ao lado do nome da comunidade, onde um cartão físico a teria. Vem desligada até a comunidade a ligar, e qualquer pessoa pode desligar a sua a partir da página dos seus cartões, sem ter de sair da comunidade: uma cara num documento que nomeia uma comunidade queer não é coisa pouca para quem não está fora do armário.",

  "changelog.entries.card-two-sides.title":
    "O teu cartão de sócio passou a ter verso, e uma frente que vale a pena ver",
  "changelog.entries.card-two-sides.body":
    "Um cartão de sócio era um único lado liso com tudo amontoado. Agora funciona como um cartão a sério. A frente é o objeto: a bandeira, a fotografia ou a cor da tua comunidade, o brasão dela e o teu nome, sob uma película que apanha a luz à medida que passas por cima. Vira-o com o botão do canto e o verso traz a credencial: um código bem maior, o número do cartão, desde quando és sócie, até quando é válido e o teu papel na comunidade. O código só é preparado quando viras mesmo o cartão, por isso um cartão pousado de frente para cima não tem nada a provar e não gera nada.",

  "changelog.entries.cohost-invite-copy.title":
    "Os convites para coanfitrião voltam a ler-se, e a semana em português começa à segunda",
  "changelog.entries.cohost-invite-copy.body":
    "Convidar alguém para coanfitriar um convívio mostrava códigos internos no lugar dos papéis e dos compromissos de tempo, e a página do convite dizia o mesmo quando a ligação já não era válida ou já tinha sido respondida. Está tudo escrito como deve ser, em português e em inglês, incluindo a notificação que chega quando te pedem para coanfitriar. Os seletores de data em português também passam a começar a semana à segunda-feira, em vez de usarem um calendário que começa ao domingo.",

  "changelog.entries.card-backgrounds.title":
    "Põe uma bandeira, ou a tua própria fotografia, no cartão da comunidade",
  "changelog.entries.card-backgrounds.body":
    "Um cartão de sócio já não tem de ser uma cor lisa. Escolhe uma de treze bandeiras do orgulho, do arco-íris e da Progress Pride às bandeiras trans, bi, lésbica, pan, assexual, arromântica, não binária, de género fluido, genderqueer, agénero e intersexo, ou carrega uma fotografia tua. Escolhas o que escolheres, o cartão mantém-se legível: uma camada fixa fica entre o fundo e o texto, para ninguém ter de apertar os olhos à porta. O código continua a poder ser lido em todas elas.",

  "changelog.entries.card-designer.title":
    "Uma verdadeira ferramenta de desenho para o cartão de sócio da tua comunidade",
  "changelog.entries.card-designer.body":
    "Desenhar um cartão passa a acontecer numa tela em ecrã largo: uma pré-visualização grande do cartão tal como quem é membro o vê, estilos mostrados como cartões em miniatura em vez de pontos de cor, o teu emblema no cartão, uma verificação em modo claro e escuro, e a data exata em que um cartão emitido hoje deixaria de funcionar. Fechar com alterações por guardar passa a perguntar primeiro. Guardar um desenho já não emite cartões para toda a gente sem avisar: emitir é um botão próprio, diz o que vai fazer antes de o fazer, e os cartões que pausaste ou revogaste ficam como estão.",

  "changelog.entries.membership-cards.title":
    "As comunidades já podem dar-te um cartão de sócio",
  "changelog.entries.membership-cards.body":
    "Qualquer comunidade a que pertences pode emitir-te um cartão de sócio, guardado na tua conta junto dos teus outros cartões. Fica tapado até quereres mostrá-lo, volta a tapar-se assim que sais do ecrã, e qualquer pessoa o consegue verificar ao ler o código.",

  "changelog.entries.push-preview-privacy.title":
    "Esconde o que as tuas notificações dizem no ecrã bloqueado",
  "changelog.entries.push-preview-privacy.body":
    "As pré-visualizações mostram quem enviou e o texto da mensagem no ecrã bloqueado, onde qualquer pessoa com o teu telemóvel na mão consegue ler. Há agora um interruptor nas Definições, nas notificações do telemóvel, que mostra apenas que chegou algo. A app continua a mostrar tudo depois de aberta.",

  "changelog.entries.honest-success-states.title":
    "Os botões deixaram de dizer que resultou quando não resultou",
  "changelog.entries.honest-success-states.body":
    "Nas comunidades, no fórum, nas mensagens, nas ligações, nas definições e nas ferramentas de moderação, muitas ações confirmavam sucesso no momento em que tocavas, antes de o servidor responder. Se o pedido falhasse, recebias uma mensagem de sucesso e um erro ao mesmo tempo, e a alteração não existia. Agora esperam pela resposta real e repõem o conteúdo se falhar.",

  "changelog.entries.reports-really-filed.title":
    "Denúncias que falham passam a dizê-lo",
  "changelog.entries.reports-really-filed.body":
    "Denunciar uma publicação, um convívio ou um membro podia mostrar o painel de confirmação mesmo quando a denúncia nunca chegou até nós. Agora só confirma depois de ficar registada, e mantém o que escreveste no ecrã para poderes tentar de novo.",

  "changelog.entries.message-previews-and-drafts.title":
    "As mensagens enviadas antes de a conversa existir já não desaparecem",
  "changelog.entries.message-previews-and-drafts.body":
    "Começar uma conversa nova e escrever logo podia perder essa primeira mensagem, e continuar a tentar enviá-la de forma invisível a cada reconexão. As mensagens por enviar passam também a ficar guardadas por conta, por isso num dispositivo partilhado o rascunho de uma pessoa já não pode ser enviado a partir da sessão de outra. Abrir uma conversa marca-a como lida à medida que chegam mensagens, para que a marca de visto acompanhe.",

  "changelog.entries.moderation-holds.title":
    "As decisões de moderação já não podem ser desfeitas por quem publicou",
  "changelog.entries.moderation-holds.body":
    "Uma publicação ou resposta removida por moderação podia ser reposta por quem a escreveu. As remoções passam a registar quem as fez, e só a moderação pode desfazer as suas. Ganhar um recurso volta também a repor o conteúdo, o que antes não acontecia.",

  "changelog.entries.housing-listings-stay-reviewed.title":
    "As edições a um anúncio publicado voltam a passar por revisão",
  "changelog.entries.housing-listings-stay-reviewed.body":
    "Um anúncio aprovado podia ser editado depois sem que ninguém voltasse a vê-lo, por isso o texto que as pessoas liam nem sempre era o texto verificado. Editar as partes que a moderação cobre devolve agora o anúncio a revisão, e o formulário avisa antes de submeteres. Pedir uma visita passa também a exigir o compromisso afirmativo, como todas as outras formas de contacto.",

  "changelog.entries.article-titles-render-plain.title":
    "Os títulos da revista com um E comercial voltam a ler-se bem",
  "changelog.entries.article-titles-render-plain.body":
    "Um título com caracteres como & podia mostrar a marcação em bruto no artigo publicado, nos cartões que lhe ligam e na pré-visualização de partilha. Os títulos passam a ser guardados como texto simples, e os existentes ficam corrigidos.",

  "changelog.entries.communities-hub-hero-restore.title":
    "As Comunidades voltaram a ter as boas-vindas",
  "changelog.entries.communities-hub-hero-restore.body":
    "O topo das Comunidades tinha-se afastado demais da navegação, com um grande espaço vazio acima de um título simples. Voltou a encostar-se à navegação, com as boas-vindas completas: um título como deve ser, uma linha sobre o que este espaço é, e o alternador Minhas comunidades/Descobrir agrupado por cima das ações.",

  "changelog.entries.community-tags-discovery.title":
    "Descobre comunidades por etiquetas e ligações",
  "changelog.entries.community-tags-discovery.body":
    "A página de uma comunidade mostra agora comunidades semelhantes com base em etiquetas partilhadas, e o Descobrir destaca comunidades onde pessoas das tuas ligações já estão. Donos e moderadores também podem sugerir uma etiqueta que ainda não esteja na lista, um administrador revê o pedido a partir daí.",

  "changelog.entries.community-tags.title":
    "As comunidades já podem ter etiquetas",
  "changelog.entries.community-tags.body":
    "Donos e moderadores podem escolher até 8 etiquetas para a sua comunidade a partir de uma lista curada, coisas como Trans & Não-Binárie, Apoio entre Pares, Clube do Livro, Habitação & Colegas de Casa. Aparecem como pastilhas em cada cartão de comunidade, e o Descobrir tem agora um filtro de etiquetas para encontrares comunidades pelo que elas realmente são.",

  "changelog.entries.account-menu-install-app.title":
    "Instala a app a partir do menu da conta",
  "changelog.entries.account-menu-install-app.body":
    'No telemóvel, o menu da conta tem agora uma linha "Instalar a app" mesmo abaixo de Primeiros passos. Abre um modal rápido com os passos para o teu aparelho: no Android, um toque mostra o verdadeiro pedido de instalação do navegador; no iPhone, guia-te a adicionar a QueerPulse ao ecrã principal a partir do Safari. Já instalaste? A linha simplesmente não aparece.',

  "changelog.entries.member-directory-filter-crossfade.title":
    "Filtragem mais suave no diretório de pessoas",
  "changelog.entries.member-directory-filter-crossfade.body":
    "Mudar um filtro no diretório de pessoas fazia os resultados aparecer e desaparecer de forma abrupta. Agora a grelha faz uma transição suave: os resultados antigos esbatem-se por um instante enquanto as novas correspondências assentam, e depois os cartões voltam a surgir em conjunto. Respeita as preferências de movimento reduzido e troca de imediato para quem prefere menos movimento.",

  "changelog.entries.excerpt-line-editor-reorder.title":
    "Uma forma mais limpa de escrever e reordenar linhas da página",
  "changelog.entries.excerpt-line-editor-reorder.body":
    "O editor de listas para coisas como as linhas de excerto na tua página passa a igualar o editor de poemas: cada linha fica na sua própria linha organizada e ocupa toda a largura, sem mais campos apertados. Arrasta a pega para reordenar, ou usa as setas para cima e para baixo, e remove uma linha com um só toque. A pega de reordenar funciona com toque, teclado e tecnologias de apoio.",

  "changelog.entries.collaborator-member-picker.title":
    "Credita pessoas colaboradoras procurando por membros",
  "changelog.entries.collaborator-member-picker.body":
    "Quando acrescentas pessoas colaboradoras a algo na tua persona, já não precisas de lembrar e escrever um identificador exato. Basta começares a escrever um nome ou identificador e escolher a pessoa numa lista pesquisável, com a foto dela, para creditar sempre a pessoa certa. As tuas escolhas aparecem como etiquetas cuidadas e podes remover qualquer uma com a mesma facilidade.",

  "changelog.entries.unified-searchable-select.title":
    "Menus onde podes escrever para procurar",
  "changelog.entries.unified-searchable-select.body":
    "Por toda a plataforma, os pequenos menus para escolher coisas, uma categoria, um idioma, um bairro, uma função, passam a ter um desenho único e mais simpático. Quando a lista é longa, basta começares a escrever para a filtrar e depois escolher com o teclado ou um toque. Os menus que deixam escolher várias opções mostram as tuas escolhas como etiquetas cuidadas. Fica igual em todo o lado e é lido com clareza pelos leitores de ecrã.",

  "changelog.entries.persona-date-month-picker.title":
    "Escolhe o mês e o ano dos teus trabalhos, sem os escrever à mão",
  "changelog.entries.persona-date-month-picker.body":
    'Ao adicionar ou editar um item numa página de persona, poemas, exposições, lançamentos e o resto, o campo de data passa a ser um seletor de mês e ano em vez de uma caixa de texto livre. Escolhes o mês e ele aparece de forma cuidada como "julho de 2025" no teu idioma. As datas que já tinhas escrito à mão continuam a aparecer tal como as deixaste.',

  "changelog.entries.unified-date-picker.title":
    "Um novo seletor de datas em toda a plataforma, mais acolhedor e totalmente acessível por teclado",
  "changelog.entries.unified-date-picker.body":
    "Um novo seletor de datas em toda a plataforma: um calendário mais acolhedor e totalmente acessível por teclado para cada campo de data e hora. Escolhe um dia com um clique ou pelo teclado, escreve-o diretamente, ou avança rapidamente entre meses e anos, e é lido com clareza pelos leitores de ecrã.",

  "changelog.entries.protect-your-work.title": "Protege o teu trabalho",
  "changelog.entries.protect-your-work.body":
    "Cada peça publicada mostra agora uma linha de direitos de autor e de primeira publicação, podes descarregar um registo de autoria datado para guardar como prova, e as tuas edições guardadas ficam como histórico de versões que podes ver e restaurar.",

  "changelog.entries.verification-signals-bulk-keyboard.title":
    "Quem revê pedidos agora vê sinais, decide em lote e avança pelo teclado",
  "changelog.entries.verification-signals-bulk-keyboard.body":
    "Os pedidos de verificação passam a trazer sinais reais: há quanto tempo a conta existe, rejeições anteriores, e um aviso quando uma referência do fornecedor ou um número de telefone aparece em mais do que uma conta, para que quem revê tenha contexto antes de decidir. É possível selecionar vários pedidos de uma vez para aprovar, rejeitar ou marcar como em análise em conjunto, e avançar pela fila com o teclado: J e K para navegar, A para aprovar, R para rejeitar, e / para pesquisar, com o pedido seguinte a abrir sozinho depois de uma decisão.",

  "changelog.entries.verification-request-review.title":
    "Pede verificação, e vê como está o teu pedido",
  "changelog.entries.verification-request-review.body":
    "Envia um pedido de verificação por email, telefone ou identidade sempre que precisares, com uma nota curta se ajudar alguém a reconhecer-te. A partir daí acompanhas o percurso: submetido, em análise, aprovado, ou a precisar de mais um passo, e podes recorrer de uma decisão se algo não te parecer certo. Do lado da moderação, a equipa trabalha numa fila real, com a tua nota e o teu histórico ao lado de cada pedido, para que cada decisão tenha sempre uma razão por trás.",

  "changelog.entries.verification-audit-trail.title":
    "Passas a saber quando o teu estado de verificação muda",
  "changelog.entries.verification-audit-trail.body":
    "Sempre que um administrador atualiza o teu nível de verificação, seja para subir, descer ou substituir, passas a receber uma notificação com o motivo. Nos bastidores, a consola de administração guarda um histórico completo de cada decisão: quem a tomou, quando e porquê, além de indicar se o nível foi conquistado automaticamente ou atribuído por um administrador, para que nada mude sem deixar rasto.",

  "changelog.entries.community-safety-enforcement.title":
    "Definições de segurança da comunidade que passam a agir",
  "changelog.entries.community-safety-enforcement.body":
    "As duas definições de segurança da comunidade passam a produzir efeito, não só a guardar. Quando uma comunidade exige um segundo aval para entrar, só é admitido quem já tenha o aval de um membro atual. E, com o congelamento automático ativo, a comunidade pausa-se assim que chega uma denúncia grave (como doxxing) ou as denúncias se acumulam, bloqueando novas publicações e entradas e mostrando um aviso claro, até a moderação levantar a pausa depois de tratar do assunto.",

  "changelog.entries.community-settings-persist.title":
    "Definições da comunidade que guardam mesmo",
  "changelog.entries.community-settings-persist.body":
    "Na vista de administração da comunidade, o botão Definições passa a abrir o painel completo, onde podes editar o nome, a descrição, o modo de adesão e as regras da comunidade. E, no separador Definições da própria comunidade, as duas opções de segurança, exigir um segundo aval para entrar e congelar automaticamente numa denúncia, passam a guardar a sério e a manter-se depois de recarregar, em vez de apenas mostrarem uma mensagem.",

  "changelog.entries.community-health-explainer.title":
    "Vê exatamente como o índice de saúde de uma comunidade é calculado",
  "changelog.entries.community-health-explainer.body":
    'O explicador do índice de saúde passa a ter uma vista "Como é calculada". Mostra os quatro sinais e quanto cada um conta, percorre como os números da própria comunidade se somam até à pontuação publicada, explica porque as comunidades mais pequenas são avaliadas com mais brandura e mostra os escalões da pontuação para veres onde uma comunidade se situa. O sentimento aparece como ainda não contabilizado, porque até agora nada na plataforma o mede.',

  "changelog.entries.modals-cover-full-screen.title":
    "As janelas de diálogo passam a escurecer o ecrã inteiro",
  "changelog.entries.modals-cover-full-screen.body":
    "Quando uma janela de diálogo abre (o explicador do índice de saúde, um convite, um recurso, um pedido de impressão e outros), o fundo escurecido passa a cobrir o ecrã inteiro e a ficar centrado, em vez de ficar confinado a parte da página em certos ecrãs. As janelas funcionavam sempre, só nem sempre ficavam enquadradas contra a janela toda.",

  "changelog.entries.inbox-menu-dropdown-visibility.title":
    "O menu de ações de conversa passa a aparecer corretamente",
  "changelog.entries.inbox-menu-dropdown-visibility.body":
    "Abrir o menu “⋯” de uma conversa na tua caixa de entrada passa a mostrar as opções Fixar, Favorito e Eliminar por cima, em vez de ficarem escondidas atrás da conversa seguinte. O menu funcionava sempre, só nem sempre estava visível.",

  "changelog.entries.member-directory-filters-fix.title":
    "Os filtros do diretório de membros passam a filtrar mesmo",
  "changelog.entries.member-directory-filters-fix.body":
    "A maioria dos filtros em Encontrar membros (Aberto a, Onde estão, O que fazem, Profissão, Tempo de casa, Idiomas) só mudava o que estava marcado no ecrã, não os resultados. Agora pesquisam mesmo no diretório, e podes definir a tua área, profissão e idiomas em Definições para outras pessoas te encontrarem por eles.",

  "changelog.entries.directory-ownership-claims.title":
    "Posse real no diretório local",
  "changelog.entries.directory-ownership-claims.body":
    "O selo “negócio queer-owned verificado” nas listagens do diretório local passa agora a refletir uma confirmação real de uma moderadora. Se já existe uma listagem de um negócio que é teu, criada por outra pessoa, podes pedir para a reclamar, com revisão de uma moderadora antes de qualquer alteração.",

  "changelog.entries.session-expired-toast-fix.title":
    "Corrigida uma mensagem falsa de “sessão expirada”",
  "changelog.entries.session-expired-toast-fix.body":
    "Algumas páginas diziam às pessoas que a sessão tinha expirado mesmo quando nunca tinham iniciado sessão. Essa mensagem só aparece agora se realmente tiveste uma sessão que expirou.",

  "changelog.entries.join-request-form-fix.title":
    "Simplificámos o formulário de pedido para entrar numa comunidade",
  "changelog.entries.join-request-form-fix.body":
    "Pedir para entrar numa comunidade costumava voltar a pedir o teu email, mesmo já tendo sessão iniciada, e esse campo nunca era enviado para lado nenhum. Esse campo desapareceu, e a pergunta “como gostarias de participar” passa agora a partilhar um passo com a nota que deixas para a moderação, em vez de perguntar as duas coisas em separado.",

  "changelog.entries.community-pulse-and-insights.title":
    "As comunidades já mostram os seus eventos, discussões e oportunidades de voluntariado reais",
  "changelog.entries.community-pulse-and-insights.body":
    "O separador Eventos de uma comunidade já mostra os próximos convívios reais em vez de estar sempre vazio, e a barra lateral passa a mostrar discussões recentes e oportunidades de voluntariado associadas a essa comunidade. Organizações e moderação também têm um novo painel de estatísticas sobre o crescimento de membros e a atividade de publicações.",

  "changelog.entries.onboarding-identity-and-notifications.title":
    "A configuração inicial já pergunta pronomes e preferências de notificação",
  "changelog.entries.onboarding-identity-and-notifications.body":
    "O assistente de configuração passa a ter um espaço para os teus pronomes e uma bio curta, e um momento para ativares notificações se quiseres, ambos opcionais. O último passo também aponta para os Primeiros passos, para o resto da tua configuração ser fácil de encontrar.",

  "changelog.entries.getting-started-vouch-fix.title":
    "Corrigido o passo “recomenda alguém” do Início Rápido",
  "changelog.entries.getting-started-vouch-fix.body":
    "Marcava-se como concluído assim que entravas através de um convite pessoal, porque seres recomendade e recomendar outra pessoa estavam a contar como a mesma coisa. Agora só fica concluído depois de teres mesmo recomendado alguém.",

  "changelog.entries.admin-invite-quota-controls.title":
    "Administradores podem definir limites de convites por membro",
  "changelog.entries.admin-invite-quota-controls.body":
    "A página de supervisão de convites passa a permitir subir ou descer quantos convites um membro pode enviar por mês, em vez de isso só ser possível com acesso direto à base de dados.",

  "changelog.entries.invite-approval-email.title":
    "Os convites aprovados enviam-se sozinhos",
  "changelog.entries.invite-approval-email.body":
    "Aprovar um pedido de convite envia logo ao candidato a ligação do convite por email. Quem revê pedidos continua a poder copiar a ligação à mão como cópia de segurança, mas enviá-la deixou de ser algo que têm de lembrar de fazer.",

  "changelog.entries.join-request-mutual-member-field.title":
    "Nomear alguém que te pode avalizar passa a ser um dado real",
  "changelog.entries.join-request-mutual-member-field.body":
    "O campo “alguém que te pode avalizar” do formulário de pedido de convite era antes inserido na tua mensagem como texto simples. Agora é enviado como campo próprio, para quem revê o pedido conseguir associá-lo diretamente, em vez de ter de ler a mensagem toda para o encontrar.",

  "changelog.entries.post-opportunity-team-picker.title":
    "Publicar uma oportunidade já vem preenchido com os teus dados",
  "changelog.entries.post-opportunity-team-picker.body":
    "O passo de Equipa e contacto passa a preencher automaticamente o teu identificador de contacto, e o slug de parceiro também, se fores responsável por uma comunidade. Os membros da equipa passam a ser escolhidos a partir das tuas ligações e comunidades.",

  "changelog.entries.side-quests-getting-started.title":
    "Missões secundárias assim que estiveres pronto",
  "changelog.entries.side-quests-getting-started.body":
    "Terminar a lista de primeiros passos costumava ser um beco sem saída. Agora abre-se em missões secundárias: os crachás que ainda não ganhaste, cada um com um botão direto para onde precisas de ir, mais qualquer regalia que já desbloqueaste mas ainda não reclamaste. Vieram também quatro novos crachás, para explorares o diretório Local, guardares artigos, entrares numa segunda comunidade e preencheres o teu Perfil de Trabalho.",

  // Ver a nota em en/marketing.ts: entrada corrigida a 26 de agosto de 2026.
  "changelog.entries.join-request-invite-email.title":
    "Correção: quem foi aprovade nunca recebeu um email de convite",
  "changelog.entries.join-request-invite-email.body":
    "Esta entrada dizia que a aprovação enviava a ligação de convite diretamente a quem se candidatou. Nunca houve código a fazer isso, e a QueerPulse não envia email nenhum, por isso a entrada estava errada no dia em que foi escrita. O que é verdade: aprovar um pedido cria a ligação de convite na fila de revisão, e é quem revê que a faz chegar à pessoa. Corrigimos a entrada em vez de a retirar em silêncio.",
  "changelog.entries.article-editor-header-and-send-on.title":
    "Cabeçalho do editor de artigos corrigido, e o botão Enviar já funciona",
  "changelog.entries.article-editor-header-and-send-on.body":
    'A barra do editor de artigos ficava fixa a 76px do topo do ecrã em vez de encostada a ele, o que deixava texto a passar por trás dela, por cima e por baixo. Agora fica encostada ao topo. O botão "Enviar" também só mostrava uma notificação, e agora avança mesmo a peça para a fase editorial seguinte.',
  "changelog.entries.gathering-rsvp-fix.title":
    "Confirmar presença nos encontros já funciona",
  "changelog.entries.gathering-rsvp-fix.body":
    'Tocar em "Eu vou" na página de um encontro não mostrava confirmação nenhuma. Agora confirma logo, com uma notificação rápida e a opção de Cancelar presença no mesmo sítio.',
  "changelog.entries.add-to-calendar-modal.title":
    "Adiciona encontros ao teu calendário",
  "changelog.entries.add-to-calendar-modal.body":
    '"Adicionar ao calendário" num encontro a que vais ou que organizas abre agora um seletor para o Google Calendar ou um ficheiro .ics para transferir, compatível com o Apple Calendar, o Outlook e a maioria dos outros calendários.',
  "changelog.entries.recognition-xp.title": "Ganha XP, níveis e crachás",
  "changelog.entries.recognition-xp.body":
    "A tua atividade passa a dar experiência para níveis e crachás. Concluir a tua lista de primeiros passos, entrar em comunidades, ir a encontros e ligar-te a membros faz-te subir. Acompanha o teu progresso na página de Crachás.",

  "changelog.entries.governance-editable-finances.title":
    "Valores financeiros editáveis, com indicação da origem de cada número",
  "changelog.entries.governance-editable-finances.body":
    "Os administradores passam a poder corrigir os valores no separador de Finanças da governação, em vez de estarem fixos. Cada número tem uma pequena etiqueta que mostra a sua origem: um valor de exemplo por verificar, um valor introduzido por um administrador, ou um valor calculado (como o excedente). As correções ficam registadas, por isso é sempre claro quem alterou o quê e quando.",

  "changelog.entries.push-devices-list.title":
    "Vê e remove todos os dispositivos que recebem as tuas notificações push",
  "changelog.entries.push-devices-list.body":
    "As Definições passam a ter uma lista de Dispositivos em Notificações: todos os dispositivos registados para push da QueerPulse, quando foram registados, e quando foram notificados pela última vez. Perdeste um telemóvel, ou não reconheces algum? Remove-o diretamente ali.",

  "changelog.entries.admin-sitewide-announcement.title":
    "Os admins podem publicar um aviso em toda a plataforma",
  "changelog.entries.admin-sitewide-announcement.body":
    "A única ferramenta de mensagem para toda a plataforma era o aviso de bloqueio, só visível para admins. Os admins já podem escrever um aviso real que aparece para qualquer visitante, autenticado ou não, com uma expiração automática opcional para que um aviso de manutenção agendada não dependa de alguém se lembrar de o desligar. Cada membro pode dispensá-lo individualmente; editar a mensagem volta a mostrá-lo a quem já tinha dispensado a anterior.",

  "changelog.entries.admin-reports-page.title":
    "Nova página consolidada de Relatórios no admin",
  "changelog.entries.admin-reports-page.body":
    "Crescimento, volume de denúncias de moderação, saúde das comunidades e as cifras de finanças da governação viviam espalhados por páginas diferentes do admin, sem forma de ajustar a janela temporal ou exportar os números. Uma nova página de Relatórios reúne tudo num só sítio, com um intervalo de datas real e ajustável (4/8/12/26 semanas) e exportação em CSV para o crescimento e o volume de denúncias.",

  "changelog.entries.magazine-sections-browse.title":
    "Navega a revista por secção",
  "changelog.entries.magazine-sections-browse.body":
    "Cada artigo e edição já tinha uma secção editorial real (Reportagens, Entrevista, Ensaios, entre outras). Agora há uma página de Secções que agrupa tudo por ela, em vez de teres de tropeçar num tema através da pesquisa.",

  // Ver a nota em en/marketing.ts: entrada corrigida a 26 de agosto de 2026.
  "changelog.entries.magazine-digest-real-send.title":
    "Correção: os resumos de edição nunca chegaram a ser enviados",
  "changelog.entries.magazine-digest-real-send.body":
    "Esta entrada dizia que a redação da revista podia enviar por email um resumo de teste a quem clicasse, e agendar o resumo para sair com a edição. Nunca chegou nada a ninguém. A QueerPulse não envia email, e o serviço de envio que por poucos dias fez isso parecer possível foi removido a 26 de agosto de 2026. A redação continua a montar o resumo de uma edição; não sai nada para nenhuma caixa de correio. Corrigimos a entrada em vez de a apagar, porque apagá-la esconderia o que te foi dito.",

  "changelog.entries.magazine-deck-convert-to-article.title":
    "Os decks podem converter-se em artigos",
  "changelog.entries.magazine-deck-convert-to-article.body":
    "O editor de decks da redação já consegue transformar um deck terminado num artigo real, transportando o texto, as imagens e os slides de estatísticas. Os slides interativos não têm equivalente em artigo, por isso ficam assinalados com honestidade em vez de serem descartados em silêncio.",

  "changelog.entries.magazine-writer-read-brief.title":
    "Os redatores podem ler o briefing real da peça",
  "changelog.entries.magazine-writer-read-brief.body":
    '"Ler o briefing" era antes um aviso de placeholder. Agora abre o briefing real da peça, incluindo o ângulo, o que incluir, o que evitar, o cachê e quem a encomendou.',

  "changelog.entries.admin-trust-network-cite-evidence.title":
    "Os admins podem citar provas a partir do grafo da rede de confiança",
  "changelog.entries.admin-trust-network-cite-evidence.body":
    'O botão "Citar" do inspetor de grafo disparava um aviso de sucesso e não fazia mais nada. Agora escreve uma nota real no histórico de auditoria do membro a descrever a relação de aval citada, visível da próxima vez que um admin rever esse membro.',

  "changelog.entries.admin-trust-network-ring-detection.title":
    "A deteção de anéis na rede de confiança é agora uma análise real de grafo",
  "changelog.entries.admin-trust-network-ring-detection.body":
    'Assinalar um "anel de avais" significava apenas que uma conta estava suspensa, congelada ou tinha duas ou mais denúncias abertas, um sinal bem mais amplo do que um laço fechado real. O grafo agora deteta clusters reais de contas novas que só se avalizam entre si, sem nenhum aval externo a apoiá-las.',

  "changelog.entries.admin-reporter-credibility.title":
    "A fila de moderação mostra agora o histórico de quem denuncia, além de quem foi denunciado",
  "changelog.entries.admin-reporter-credibility.body":
    "A fila de denúncias sempre mostrou quantas denúncias anteriores tem a pessoa denunciada. Agora mostra o mesmo sinal para quem denuncia: quantas denúncias já apresentou e quantas foram arquivadas, para o moderador pesar os dois lados.",

  "changelog.entries.admin-housing-moderator-role.title":
    "Novo papel de staff: moderador só de Habitação",
  "changelog.entries.admin-housing-moderator-role.body":
    "Os papéis de staff só cobriam a redação da revista. Agora é possível conceder a um membro um papel de moderador de Habitação, que lhe permite moderar anúncios e grupos de Habitação sem lhe dar o nível completo de Moderador da plataforma.",

  "changelog.entries.gatherings-manage-attendees-remove-promote.title":
    "Quem organiza já pode remover uma pessoa convidada ou promovê-la da lista de espera",
  "changelog.entries.gatherings-manage-attendees-remove-promote.body":
    "Os botões Remover e Promover no separador de Pessoas Convidadas passam a fazer mesmo alguma coisa: remover liberta o lugar para a lista de espera, e promover coloca uma pessoa específica da lista de espera na lista de convidados, fora de ordem se quiseres.",

  "changelog.entries.myevents-calendar-feed-subscribe.title":
    "Subscreve os teus convívios no Google ou Apple Calendar",
  "changelog.entries.myevents-calendar-feed-subscribe.body":
    '"Subscrever o teu feed" em Os Meus Convívios passa a copiar um link de feed real e privado. Adiciona-o ao Google ou Apple Calendar e mantém-se atualizado com tudo a que vais.',

  "changelog.entries.gatherings-recap-more-from-host.title":
    "Os resumos passam a apontar para mais convívios da mesma pessoa anfitriã",
  "changelog.entries.gatherings-recap-more-from-host.body":
    "A página de resumo de um convívio passa a mostrar outros convívios futuros da mesma pessoa anfitriã, para que uma boa noite não termine sem forma de marcar a próxima.",

  "changelog.entries.myevents-rsvp-actions-real.title":
    "As ações em Os Meus Convívios já atualizam mesmo a tua inscrição",
  "changelog.entries.myevents-rsvp-actions-real.body":
    "Marcar-te como talvez ou vou, aceitar ou recusar um convite, dizer que não podes ir, e sair de uma lista de espera passam todos a escrever na tua inscrição real, em vez de só mudarem o que o cartão te mostra.",

  "changelog.entries.myevents-block-host-real.title":
    '"Bloquear a pessoa anfitriã" em Os Meus Convívios já bloqueia mesmo',
  "changelog.entries.myevents-block-host-real.body":
    "A opção de bloquear no menu de um cartão de convívio passa a usar o mesmo bloqueio de qualquer outro sítio na QueerPulse, em vez de só mostrar uma notificação de confirmação.",

  "changelog.entries.myevents-reminder-indicator-honest.title":
    "O sino de lembrete nos cartões de convívio passa a ser um estado",
  "changelog.entries.myevents-reminder-indicator-honest.body":
    "Os lembretes são enviados a todas as pessoas que vão ou talvez vão, de acordo com a tua definição de antecedência em Preferências, não por convívio individual. O sino num cartão passa a mostrar isso claramente, em vez de parecer um interruptor por convívio que nunca foi.",

  "changelog.entries.gatherings-edit-date-time-fix.title":
    "Editar a data e hora de um convívio já o reagenda mesmo",
  "changelog.entries.gatherings-edit-date-time-fix.body":
    'O campo de data no "Editar detalhes" do painel de gestão costumava guardar só um texto, não uma data real. Agora reagenda mesmo o convívio, e todas as pessoas com inscrição são notificadas da mudança.',

  "changelog.entries.gatherings-cancelled-page-real-content.title":
    "A página de um convívio cancelado já mostra o convívio real",
  "changelog.entries.gatherings-cancelled-page-real-content.body":
    "Abrir um aviso de cancelamento costumava mostrar sempre o mesmo convívio fictício de exemplo. Agora mostra o convívio que foi mesmo cancelado: o seu título, data, pessoa anfitriã e local reais.",

  "changelog.entries.gatherings-cohost-roster-visible.title":
    "Quem organiza já vê quem já está a coanfitrionar",
  "changelog.entries.gatherings-cohost-roster-visible.body":
    "O painel de pessoas coanfitriãs no painel de gestão costumava começar sempre vazio, mesmo em convívios que já tinham pessoas coanfitriãs. Agora mostra a lista real.",

  "changelog.entries.gatherings-remove-pricing-step.title":
    "Removido o passo de preços ao criar um convívio",
  "changelog.entries.gatherings-remove-pricing-step.body":
    "A QueerPulse não processa pagamentos, por isso o passo de preços de bilhetes no assistente nunca fazia nada com o que escrevias ali. Deixou de existir, em vez de continuar com um aspeto funcional sem o ser.",

  "changelog.entries.messages-message-requests.title":
    "Contacta alguém novo, diretamente da tua caixa de entrada",
  "changelog.entries.messages-message-requests.body":
    "Ainda não estás ligado(a) a alguém? Procura essa pessoa em Nova Mensagem e envia uma primeira mensagem. Torna-se um pedido que a pessoa pode aceitar ou recusar, e os pedidos à tua espera aparecem agora num novo separador Pedidos.",

  "changelog.entries.messages-mute-conversation.title":
    "Silencia as notificações de uma conversa",
  "changelog.entries.messages-mute-conversation.body":
    "O menu de opções de cada conversa passa a ter Silenciar, junto de Fixar e Favoritos. Uma conversa silenciada deixa de enviar notificações push, mas mantém-se exatamente no mesmo lugar da tua caixa de entrada.",

  "changelog.entries.messages-search-in-chat.title":
    "Pesquisa dentro de uma única conversa",
  "changelog.entries.messages-search-in-chat.body":
    "Abre uma conversa e toca no ícone de pesquisa para procurar só nessa conversa, em vez de em toda a caixa de entrada.",

  "changelog.entries.governance-proposals-voting.title":
    "As decisões de governação passam agora por uma votação real da comunidade",
  "changelog.entries.governance-proposals-voting.body":
    "Encerrar um lugar no conselho consultivo exige dois terços dos votos, e aceitar financiamento fora das nossas fontes habituais exige maioria. As propostas em aberto mostram uma contagem ao vivo na página de Governação, e as anteriores continuam visíveis com o respetivo resultado.",

  "changelog.entries.governance-figures-honesty.title":
    "A contagem de membros ativos da Governação é agora calculada ao vivo",
  "changelog.entries.governance-figures-honesty.body":
    "O número de membros ativos na página de Governação é agora calculado diretamente a partir de contas reais, em vez de ser escrito à mão. Os valores financeiros continuam a ser reportados pela equipa a cada trimestre, e a página passa a dizê-lo claramente, em vez de dar a entender que são calculados automaticamente.",

  "changelog.entries.communities-sister-demo-only.title":
    'As sugestões de "comunidades irmãs" ficam limitadas ao modo de demonstração',
  "changelog.entries.communities-sister-demo-only.body":
    'As sugestões de "comunidades irmãs" e "também em" estavam a aparecer com dados de exemplo mesmo em páginas de comunidades reais. Agora só aparecem quando estás a ver a demonstração.',

  "changelog.entries.communities-category-filter.title":
    "Os filtros de categoria das comunidades funcionam para lá da primeira página",
  "changelog.entries.communities-category-filter.body":
    'Filtrar comunidades por categoria pede agora uma correspondência real ao servidor, em vez de filtrar apenas o que já tinha carregado, corrigindo o "nenhuma comunidade corresponde" incorreto ao passar da primeira página.',

  "changelog.entries.communities-archive-reversible.title":
    "Comunidades arquivadas podem ser recuperadas",
  "changelog.entries.communities-archive-reversible.body":
    "Os administradores podem agora desarquivar uma comunidade, tal como já era possível reverter a congelação. Arquivar uma comunidade por engano deixa de ser permanente.",

  "changelog.entries.changemakers-nomination-reason.title":
    "As nomeações de Changemakers pedem agora a frase que prometem pedir",
  "changelog.entries.changemakers-nomination-reason.body":
    'O formulário de nomeação sempre disse que "um nome e uma frase chegam," mas só pedia um nome. Agora tem um campo real para a tua frase, e quem revê as nomeações pode ler o que escreveste.',

  "changelog.entries.changemakers-nomination-review.title":
    "As nomeações de Changemakers recebem agora uma resposta real",
  "changelog.entries.changemakers-nomination-review.body":
    "Os administradores podem agora aprovar ou recusar uma nomeação, e vais ser notificado da decisão em vez de ficares sem resposta depois de a submeteres.",

  "changelog.entries.changemakers-connect-honest.title":
    'O botão "Contactar" num perfil de Changemaker é agora honesto sobre o que faz',
  "changelog.entries.changemakers-connect-honest.body":
    'Os perfis de Changemakers são conteúdo editorial, não contas de membros ligadas, por isso "Contactar" nunca podia mesmo enviar uma mensagem a essa pessoa. Agora encaminha-te para o nosso canal de contacto geral e diz isso mesmo.',

  "changelog.entries.moderation-assign-to-me.title":
    "Os moderadores podem reivindicar denúncias na fila",
  "changelog.entries.moderation-assign-to-me.body":
    'O filtro "Atribuídas a mim" na fila de moderação estava sempre vazio. Os moderadores podem agora reivindicar ou libertar uma denúncia a partir do painel da denúncia, e o filtro reflete reivindicações reais.',

  "changelog.entries.moderation-report-history-link.title":
    "Vê o histórico completo de denúncias de um membro a partir da fila",
  "changelog.entries.moderation-report-history-link.body":
    'A contagem de "denúncias anteriores" numa denúncia era apenas um número. Agora é uma ligação direta para todas as outras denúncias sobre essa mesma pessoa.',

  "changelog.entries.moderation-resolution-detail.title":
    "As denúncias resolvidas mostram o que realmente aconteceu",
  "changelog.entries.moderation-resolution-detail.body":
    'As denúncias resolvidas mostram agora quem as resolveu, o que foi decidido, e quando, em vez de um texto genérico. "Encerrada há X" reflete agora o momento real da resolução, não o momento em que a denúncia foi submetida.',

  "changelog.entries.moderation-sla-overdue.title":
    "As denúncias atrasadas são assinaladas na fila",
  "changelog.entries.moderation-sla-overdue.body":
    "As denúncias já tinham um prazo de resposta calculado por trás dos bastidores. Agora é visível, com um aviso de atraso assim que uma denúncia ultrapassa o prazo.",

  "changelog.entries.moderation-bulk-actions-expanded.title":
    "A moderação em lote passa a incluir aviso, suspensão e banimento",
  "changelog.entries.moderation-bulk-actions-expanded.body":
    "A barra de ações em lote só lidava com dispensar, marcar como spam e reatribuir. Agora também lida com aviso, suspensão (com seletor de duração) e banimento, para que uma vaga de denúncias coordenadas não tenha de ser tratada uma a uma.",

  "changelog.entries.moderation-appeal-integrity.title":
    "As revisões de recursos mostram as provas reais, e já não podem ser autorrevistas",
  "changelog.entries.moderation-appeal-integrity.body":
    "Rever um recurso mostra agora o conteúdo originalmente denunciado, não apenas o resumo do próprio moderador sobre porque agiu. Um moderador já não pode rever o recurso da sua própria decisão original.",

  "changelog.entries.forum-write-rate-limit.title":
    "As publicações no fórum têm agora o seu próprio limite de frequência",
  "changelog.entries.forum-write-rate-limit.body":
    "Criar tópicos, respostas e votos tem agora uma proteção contra abuso dedicada, à altura da que as comunidades já tinham, em vez de depender apenas do limite geral do site.",

  "changelog.entries.forum-first-post-accuracy.title":
    'O aviso de "primeira publicação" verifica agora o teu histórico real',
  "changelog.entries.forum-first-post-accuracy.body":
    "O convite do fórum para fazeres a tua primeira publicação só verificava a sessão de navegação atual, por isso saudava incorretamente quem já publicava como se fosse novo. Agora verifica se já alguma vez publicaste.",

  "changelog.entries.forum-lock-reason.title":
    "Os tópicos encerrados podem dizer porquê",
  "changelog.entries.forum-lock-reason.body":
    "Quando um moderador encerra um tópico, pode agora acrescentar um motivo breve, que aparece na faixa de encerrado em vez de todos os tópicos encerrados terem o mesmo texto genérico.",

  "changelog.entries.forum-shareable-filters.title":
    "A categoria e a ordenação do fórum sobrevivem a uma atualização da página",
  "changelog.entries.forum-shareable-filters.body":
    'Escolher uma categoria ou separador de ordenação no fórum atualiza agora o link da página, para que atualizar ou partilhar mantenha a tua vista em vez de voltar silenciosamente a "Todas."',

  "changelog.entries.forum-search-hint.title":
    "A pesquisa do fórum diz agora o que pesquisa",
  "changelog.entries.forum-search-hint.body":
    "Uma pequena nota junto à caixa de pesquisa do fórum esclarece agora que procura nos títulos dos tópicos, não no texto de publicações e respostas.",

  "changelog.entries.forum-most-helpful-real.title":
    'A ordenação "Mais útil" reflete agora votos reais',
  "changelog.entries.forum-most-helpful-real.body":
    'Ordenar respostas por "mais útil" usa agora votos positivos reais, e a resposta mais votada recebe o distintivo de estrela, em vez de só funcionar na demonstração.',

  "changelog.entries.recognition-locked-badges-honest.title":
    "A vitrine de emblemas só mostra emblemas que consegues mesmo ganhar",
  "changelog.entries.recognition-locked-badges-honest.body":
    'Alguns emblemas apareciam como "bloqueados" com instruções para os ganhar que não levavam a lado nenhum. Deixam de aparecer até haver uma forma real de os ganhar.',

  "changelog.entries.recognition-vouch-perk-copy.title":
    'A descrição do benefício "Acesso a apadrinhamento" corresponde agora à realidade',
  "changelog.entries.recognition-vouch-perk-copy.body":
    "A vitrine de benefícios dizia que o acesso a apadrinhamento se desbloqueava no Nível 3. Apadrinhar nunca teve realmente esse requisito de nível, por isso a descrição diz agora o que é verdade: está disponível para qualquer membro ativo desde o início.",

  "changelog.entries.recognition-visible-on-profiles.title":
    "Vê o nível e os emblemas de outros membros",
  "changelog.entries.recognition-visible-on-profiles.body":
    "O nível e os emblemas só apareciam no teu próprio perfil. Agora aparecem também nos perfis de outros membros, para o reconhecimento funcionar como um sinal visível entre membros.",

  "changelog.entries.vouch-daily-cap.title":
    "Um limite diário de apadrinhamentos, para manter o sinal significativo",
  "changelog.entries.vouch-daily-cap.body":
    "Apadrinhar pessoas já tinha um curto intervalo entre apadrinhamentos. Agora existe também um limite diário generoso, para o sinal se manter significativo mesmo ao longo do tempo.",

  "changelog.entries.magazine-article-publish-schedule.title":
    "Publicar e agendar artigos, agora a sério",
  "changelog.entries.magazine-article-publish-schedule.body":
    "Os controlos de Publicar e Agendar do editor de artigos eram apenas decorativos. Agora publicam mesmo o teu artigo, de imediato ou numa data e hora futura à tua escolha, e artigos que não estão ligados a uma edição podem finalmente ir ao ar sem esperar pela produção da edição.",

  "changelog.entries.magazine-writer-draft-paste-fix.title":
    'Colar um rascunho em "Entregar rascunho" deixou de o perder',
  "changelog.entries.magazine-writer-draft-paste-fix.body":
    "Colar o texto do teu rascunho ao entregar uma peça costumava desaparecer assim que confirmavas. Agora passa diretamente para o editor de artigos como parágrafos reais, prontos para continuares a trabalhar.",

  "changelog.entries.magazine-live-discovery.title":
    "A revista já tem por onde navegar",
  "changelog.entries.magazine-live-discovery.body":
    "Antes, só era possível chegar a um artigo através de uma ligação direta. A capa da revista, o arquivo de edições e as páginas de autores estão agora ligados a dados reais, e as ligações de edição abrem a edição certa em vez de mostrarem sempre a atual. Há também um novo diretório de autores para conheceres quem escreve na revista.",

  "changelog.entries.culture-submissions-real.title":
    "As submissões do Clube, Mostra e Rádio são agora reais",
  "changelog.entries.culture-submissions-real.body":
    "Sugerir uma escolha, publicar um projeto de encomenda, submeter trabalho para a mostra ou enviar uma playlist costumava mostrar uma mensagem de sucesso e não ir a lado nenhum. Agora cada uma destas ações fica mesmo guardada.",

  "changelog.entries.culture-radio-honest.title":
    "Os controlos da Rádio dizem a verdade",
  "changelog.entries.culture-radio-honest.body":
    'Os controlos de reprodução e avançar da Rádio costumavam fingir que funcionavam. Agora são honestos sobre o que está realmente no ar, e "Tornar-me curador" abre o formulário real de submissão de playlist.',

  "changelog.entries.newsletter-unsubscribe.title":
    "Cancela a subscrição da newsletter tu mesmo/a",
  // Ver a nota em en/marketing.ts: corpo corrigido a 26 de agosto de 2026.
  "changelog.entries.newsletter-unsubscribe.body":
    "Subscrever a newsletter regista o teu endereço, e não havia forma de o tirares da lista sem ajuda. Existe agora uma ligação e uma página reais de cancelamento: abre-a com o teu código e o endereço sai da lista. A QueerPulse não envia email, por isso nunca chegou nada. Isto é sobre o teu endereço não ficar numa lista onde não querias estar.",

  "changelog.entries.resources-crisis-hotline-coverage.title":
    "Linhas de crise aparecem agora em todas as páginas próximas de crise",
  "changelog.entries.resources-crisis-hotline-coverage.body":
    "Direito, Saúde Trans, Redução de Danos, Saúde Sexual, Segurança e Saúde Mental mostram agora a mesma faixa de linhas de crise que já existia no Bem-estar, para a ajuda estar sempre a um toque de distância.",

  "changelog.entries.resources-library-consolidated.title":
    "A página de Recursos passa a mostrar dados reais de guias",
  "changelog.entries.resources-library-consolidated.body":
    "A página inicial de Recursos mostra agora os mesmos guias reais, servidos pelo backend, do resto da aplicação, com a atualidade de cada guia acompanhada.",

  "changelog.entries.resources-guide-freshness.title":
    "Os guias mostram agora quando foram verificados pela última vez",
  "changelog.entries.resources-guide-freshness.body":
    'Cada guia mostra a data em que a equipa editorial o verificou pela última vez, ou um honesto "ainda não verificado" quando ainda não foi revisto.',

  "changelog.entries.resources-suggest-edit-expanded.title":
    "Sugerir uma alteração, para além do Glossário",
  "changelog.entries.resources-suggest-edit-expanded.body":
    'O formulário de "sugerir uma alteração" só funcionava no Glossário. Agora também abre a partir de Direito, Saúde Trans, Redução de Danos, Saúde Mental e da biblioteca de guias.',

  "changelog.entries.directory-review-reporting.title":
    "Denunciar uma avaliação individual no diretório local",
  "changelog.entries.directory-review-reporting.body":
    "Cada avaliação na página de um negócio tem agora uma opção de Denunciar, para poderes assinalar uma avaliação abusiva ou falsa isoladamente, em vez de só poderes contestar o anúncio inteiro. Um moderador analisa cada denúncia da mesma forma que no resto da plataforma.",

  "changelog.entries.directory-search-pagination.title":
    "Pesquisa mais rápida e completa no diretório local",
  "changelog.entries.directory-search-pagination.body":
    "A pesquisa no diretório local agora filtra do lado do servidor, em vez de parar silenciosamente ao fim das primeiras duas centenas de lugares. Ao chegares ao fim da lista, mais resultados carregam automaticamente, por isso uma pesquisa ampla ou o diretório completo já não param antes da contagem real.",

  "changelog.entries.directory-edit-suggestions-applied.title":
    "Correções de anúncios aceites agora atualizam mesmo o anúncio",
  "changelog.entries.directory-edit-suggestions-applied.body":
    "Quando sugeres uma correção a um anúncio de negócio (horário, morada, telefone, site ou descrição errados) e um moderador a aceita, o anúncio em si é atualizado e o dono é notificado. Aceitar não tinha antes qualquer efeito visível.",

  "changelog.entries.housing-my-listings.title":
    "Gere o quarto ou casa que publicaste, na tua própria página Os Meus Anúncios",
  "changelog.entries.housing-my-listings.body":
    "Os anúncios de habitação têm agora um espaço próprio. Edita qualquer anúncio que publicaste, marca-o como preenchido assim que encontrares alguém, prolonga-o antes de expirar, ou remove-o por completo. Um anúncio também expira automaticamente ao fim de alguns meses se nunca voltares a atualizá-lo, para o diretório não se encher de anúncios desatualizados.",

  "changelog.entries.appeal-outcome-tracking.title":
    "O resultado do recurso mostra agora o teu estado real",
  "changelog.entries.appeal-outcome-tracking.body":
    "A página de resultado do recurso costumava mostrar um estado de demonstração, independentemente do que realmente aconteceu ao teu recurso. Agora mostra o teu recurso real: mantido, revertido, ou ainda a aguardar revisão, tirado diretamente da decisão do moderador.",

  "changelog.entries.quickexit-more-pages.title":
    "A saída rápida está disponível em mais páginas de segurança",
  "changelog.entries.quickexit-more-pages.body":
    "O botão de saída rápida, para saíres da página de imediato, aparece agora também em Bloquear e Silenciar, nas duas páginas de recurso, e nos anúncios de Espaços Seguros, não só nas páginas de crimes de ódio e denúncia.",

  "changelog.entries.legal-links-reconciled.title":
    "Todos os documentos legais estão agora listados no rodapé e no menu",
  "changelog.entries.legal-links-reconciled.body":
    "Os Termos de Serviço não constavam do rodapé, e algumas políticas, incluindo a página de pedido de dados, não constavam da secção legal do menu Sobre. Ambos listam agora o mesmo conjunto completo: privacidade, termos, cookies, ficha legal, diretrizes e pedidos de dados.",

  "changelog.entries.hate-crime-resources-linked.title":
    "Recursos sobre Crimes de Ódio está agora ligado a partir do rodapé",
  "changelog.entries.hate-crime-resources-linked.body":
    "Esta página só era antes acessível através de Recursos ou de uma ligação direta. Está agora também na coluna de Apoio do rodapé, junto de Apoio Jurídico e Denúncias e Segurança.",

  "changelog.entries.listing-quick-edit.title":
    "Edição rápida para o teu anúncio no diretório",
  "changelog.entries.listing-quick-edit.body":
    "Corrigir um erro na frase de apresentação ou atualizar o teu telefone costumava obrigar a percorrer todo o assistente de anúncio outra vez. A secção Os Meus Espaços da tua conta tem agora uma Edição Rápida para o essencial (frase de apresentação, nota sobre o horário, telefone, site), com o editor completo ainda a um clique de distância para alterações maiores.",

  "changelog.entries.topics-follow-notifications-and-directory.title":
    "Seguir um tópico já te avisa, e há um novo diretório de Tópicos",
  "changelog.entries.topics-follow-notifications-and-directory.body":
    'Seguir um tópico (o botão Seguir em qualquer página de #etiqueta) não tinha efeito nenhum. Agora, quando alguém publica uma conversa no fórum com a etiqueta desse tópico, todas as pessoas a segui-lo são avisadas. Há também uma nova página de Tópicos que lista todos os tópicos com um botão de seguir, ligada a partir do menu Comunidade junto ao Fórum, e o botão "Escrever uma publicação" de um tópico abre o compositor do fórum já com essa etiqueta associada.',

  "changelog.entries.search-topics-real-results.title":
    "Os tópicos já aparecem na pesquisa global",
  "changelog.entries.search-topics-real-results.body":
    'Pesquisar por um tópico com hashtag devolve agora resultados reais da pesquisa global, junto com pessoas, comunidades e tudo o resto. As categorias com mais resultados do que cabem no ecrã passam a ter uma ligação "Ver tudo".',

  "changelog.entries.feed-connections-tab.title":
    'Novo separador "Ligações" no teu feed',
  "changelog.entries.feed-connections-tab.body":
    "A barra de separadores do feed passa a ter Ligações: publicações, tópicos do fórum, e convívios de pessoas a quem estás ligade, tudo num só lugar. Ainda não te ligaste a ninguém? O separador leva-te ao diretório de pessoas para começares.",

  "changelog.entries.connections-report-now-files.title":
    "Corrigido: denunciar uma ligação agora envia mesmo a denúncia",
  "changelog.entries.connections-report-now-files.body":
    '"Denunciar" no menu de opções de uma ligação mostrava uma confirmação de "Denúncia enviada" sem enviar nada de facto. Agora abre o mesmo formulário de motivo e detalhe usado no resto da aplicação e envia mesmo uma denúncia à equipa de moderação.',

  "changelog.entries.getting-started-xp-not-awarded-fix.title":
    "Corrigido: XP do Início Rápido não aparecia",
  "changelog.entries.getting-started-xp-not-awarded-fix.body":
    "Ao concluíres passos do Início Rápido, o teu XP total podia ficar preso em 0 durante algum tempo, e os passos concluídos não mostravam quanto XP tinham rendido. Ambos foram corrigidos: o teu nível atualiza-se agora rapidamente à medida que concluis passos, e cada passo concluído mostra o seu XP.",

  "changelog.entries.badges-levels-v2-redesign.title":
    "Emblemas e níveis redesenhados",
  "changelog.entries.badges-levels-v2-redesign.body":
    "A página de Emblemas e Níveis tem um novo visual: um mostrador de nível, sugestões dos emblemas mais próximos de ganhares, um espólio filtrável com detalhe por emblema, uma faixa de emblemas sazonais, e um extrato a mostrar de onde veio o teu XP.",

  "changelog.entries.listing-preview-matches-card.title":
    "A pré-visualização do anúncio agora corresponde ao cartão real do diretório",
  "changelog.entries.listing-preview-matches-card.body":
    'A pré-visualização ao vivo, ao adicionares ou editares um anúncio no diretório, mostra agora exatamente o mesmo cartão que aparece no diretório, incluindo a foto de capa. Se ainda não tiveres adicionado uma, a pré-visualização mostra um botão "Adicionar foto de capa" que te leva diretamente ao passo das fotos.',

  "changelog.entries.profile-shapings-editor.title":
    'Edita a secção "O que me formou"',
  "changelog.entries.profile-shapings-editor.body":
    "O filme, o livro, a música e o momento que te formaram já podem ser adicionados e editados no teu perfil, tal como as tuas outras listas. Antes só era possível ver.",

  "changelog.entries.xp-breakdown.title": "Vê o que rendeu o teu XP",
  "changelog.entries.xp-breakdown.body":
    "A página de Primeiros passos mostra agora as principais fontes por trás do teu XP atual, e a página de Crachás detalha cada fonte (perfil, comunidades, avais, encontros e mais) com quanto cada uma já te deu e o que ainda está por ganhar.",

  "changelog.entries.profile-hero-rail-redesign.title":
    "Hero e barra lateral do perfil redesenhados",
  "changelog.entries.profile-hero-rail-redesign.body":
    "A tua página de perfil tem agora um hero mais limpo e uma nova barra lateral: os sinais de confiança (verificado, equipa, votos de confiança) vêm agora com uma explicação em linguagem simples, e uma navegação por secções permite a quem visita saltar direto para o que procura, sem precisar de percorrer a página toda.",
  "changelog.entries.profile-rail-stats-redesign.title":
    "As tuas estatísticas de perfil, num relance",
  "changelog.entries.profile-rail-stats-redesign.body":
    "As tuas ligações, votos de confiança dados e recebidos aparecem agora como números claramente identificados em vez de pastilhas só com ícones, por isso são legíveis sem precisar de passar o rato por cima. E os teus controlos de privacidade (quem vê o quê, esconder-me, os teus dados) passaram para um menu de definições no topo do teu perfil, junto ao botão Editar.",
  "changelog.entries.profile-who-sees-what-controls.title":
    "Escolhe exatamente quem vê o quê no teu perfil",
  "changelog.entries.profile-who-sees-what-controls.body":
    'Um novo painel "Quem vê o quê" reúne os teus controlos de visibilidade num só lugar: predefinições rápidas, interruptores instantâneos para a tua foto, bairro, votos de confiança e o que procuras, visibilidade por identidade, esconder o teu perfil de pessoas específicas, e um registo das denúncias que fizeste.',
  "changelog.entries.profile-your-data-panel.title":
    'Um painel "Os teus dados" para a tua conta',
  "changelog.entries.profile-your-data-panel.body":
    "Descarrega uma cópia de tudo o que a QueerPulse guarda sobre ti, afasta-te temporariamente ou pede a eliminação da conta com um período de 30 dias para mudares de ideias, ou envia um pedido de dados, tudo a partir de um único painel no teu perfil. Qualquer comunidade que possuas ou anúncio ativo que esteja a impedir a eliminação passa a aparecer ali mesmo, com a sua própria solução.",
  "changelog.entries.profile-board-work-name-qr-updates.title":
    "Publicações no quadro podem ser marcadas como encontradas, trabalhos ganham um segundo link, e mais",
  "changelog.entries.profile-board-work-name-qr-updates.body":
    "As tuas publicações no quadro podem agora ser marcadas como encontradas ao serem fechadas. As entradas em Trabalho em destaque passam a suportar um segundo link além do primeiro. Podes adicionar a pronúncia do teu nome e uma versão em português da tua biografia, e o código QR do teu perfil está agora a um toque de distância.",

  "changelog.entries.gathering-venue-directory-link.title":
    "Liga o espaço de um encontro à sua ficha no diretório local",
  "changelog.entries.gathering-venue-directory-link.body":
    "Ao definir o espaço ao criar um encontro, ou ao editá-lo a partir da página de gestão, já podes pesquisar o diretório local e escolher um negócio real em vez de escrever só o nome. Ao escolher um, o nome do espaço passa a ser uma ligação direta à sua ficha, para os convidados verem fotos, horário e avaliações antes de aparecerem. Continuas a poder escrever o nome livremente.",
  "changelog.entries.add-to-calendar-picker-redesign.title":
    "Adicionar ao calendário passa a oferecer Google, Apple, Outlook e Yahoo",
  "changelog.entries.add-to-calendar-picker-redesign.body":
    "O modal de adicionar ao calendário é agora um seletor a sério: Google, Apple, Outlook e Yahoo têm cada um a sua linha com ícone de marca e adição num clique (a Apple descarrega um ficheiro, por não ter ligação direta), ordenados consoante a tua plataforma, mais uma ligação de recurso para descarregar noutra aplicação. Corrigimos também uma falha em que o fuso horário indicado num evento não era usado ao criar a entrada de calendário, o que podia adicionar a hora errada ao teu calendário.",
  "changelog.entries.local-directory-card-redesign.title":
    "Os cartões do diretório e dos espaços mostram agora foto, avaliação e horário",
  "changelog.entries.local-directory-card-redesign.body":
    "Os cartões do diretório local e dos espaços foram redesenhados com uma foto, avaliação por estrelas, preço e etiquetas, e um botão de guardar, além de um estado de horário e do anfitrião nos cartões de negócios. Os espaços passam agora a ter fotos e avaliações de demonstração a condizer.",

  "changelog.entries.forum-thread-pinning.title":
    "Os moderadores podem fixar tópicos do fórum no topo",
  "changelog.entries.forum-thread-pinning.body":
    "Moderadores e administradores podem agora fixar um tópico a partir do menu ⋯, mantendo-o acima da lista normal (até 3 de cada vez), seja qual for o separador de ordenação. Desafixa da mesma forma para o devolver à ordem normal.",

  "changelog.entries.magazine-desk-notifications-cleanup.title":
    "Menos notificações duplicadas na secretária, e Marcar tudo como lido a funcionar",
  "changelog.entries.magazine-desk-notifications-cleanup.body":
    "O painel Desde sexta da secretária da revista registava uma notificação nova a quase cada gravação automática, por isso uma só edição num rascunho ainda sem título podia aparecer cinco ou seis vezes. Edições repetidas à mesma peça pela mesma pessoa passam agora a juntar-se numa única linha até acontecer outra coisa nessa peça. Marcar tudo como lido também se limitava a fechar o painel sem mudar nada, deixando o número no sino preso. Agora limpa mesmo.",

  "changelog.entries.volunteer-opportunity-edit-parity.title":
    "Editar uma oportunidade usa agora o mesmo formulário de a publicar",
  "changelog.entries.volunteer-opportunity-edit-parity.body":
    "Quem edita uma oportunidade de voluntariado vê agora exatamente o mesmo ecrã usado para a publicar, incluindo os campos de motivo/tarefas/compromissos que o antigo ecrã de edição não oferecia.",

  "changelog.entries.local-directory-sort-fix.title":
    "Corrigido o menu de ordenação do Diretório de negócios locais",
  "changelog.entries.local-directory-sort-fix.body":
    "O menu Ordenar no Diretório de negócios locais (antes “Diretório local”) podia ficar tão estreito que as opções quebravam a meio da palavra. Agora há sempre espaço para mostrar “Em destaque”, “A–Z” e “Por bairro” numa única linha.",

  "changelog.entries.governance-chart-upgrade.title":
    "Um gráfico de receita vs. despesa mais claro na área de governação",
  "changelog.entries.governance-chart-upgrade.body":
    "O gráfico de finanças trimestre a trimestre passa a ajustar-se ao espaço disponível e a ler-se com mais clareza. Passa o rato ou o foco do teclado sobre qualquer barra para ver a receita, a despesa e o excedente guardado na reserva desse trimestre, e uma faixa tracejada sobre cada barra de despesa marca o excedente num relance.",

  "changelog.entries.landing-live-preview.title":
    "Pré-visualização em tempo real ao fazer a curadoria da página inicial",
  "changelog.entries.landing-live-preview.body":
    "Quem faz a curadoria da página inicial passa a ver uma pré-visualização em tempo real de cada secção ao lado do editor. Adiciona, reordena, oculta ou reescreve um membro, comunidade ou agente de mudança em destaque e a pré-visualização atualiza logo, mostrando o cartão real da página inicial antes de qualquer visita.",

  "changelog.entries.personas-in-directory.title":
    "As personas do teu perfil aparecem no diretório",
  "changelog.entries.personas-in-directory.body":
    "As personas ligadas ao teu perfil de membro passam a aparecer no diretório de personas, ao lado das autónomas, por isso um terapeuta ou profissional cuja persona vive na sua página principal é igualmente descoberto. As personas autónomas continuam pseudónimas.",

  "changelog.entries.therapist-personas-directory.title":
    "Diretórios de terapeutas, com perfis reais",
  "changelog.entries.therapist-personas-directory.body":
    "Os diretórios de terapeutas afirmativos passam a mostrar perfis reais, verificados pela comunidade: cada um com a forma como trabalham, valores, disponibilidade, onde atendem e recomendações da comunidade. Os terapeutas criam e gerem o seu próprio perfil.",

  "changelog.entries.concern-intake-live.title":
    "Levanta uma preocupação, e nós vamos mesmo vê-la",
  "changelog.entries.concern-intake-live.body":
    "O formulário “Submeter uma preocupação” na página de governação chega agora à equipa. Denúncias, contestações e problemas aparecem num painel da equipa, onde são triados e acompanhados até à resolução. Os membros com sessão iniciada são identificados pela sua conta; se estiveres com sessão terminada, deixa um email e entraremos em contacto.",

  "changelog.entries.housing-neighbourhoods-map.title":
    "Escolha vários bairros e explore casas num mapa",
  "changelog.entries.housing-neighbourhoods-map.body":
    "A procura de casa passa a permitir filtrar por mais do que um bairro de Lisboa ao mesmo tempo, e uma nova vista de mapa mostra as casas agrupadas por bairro. Toque num bairro no mapa para o juntar aos filtros.",

  "changelog.entries.housing-outro-band.title":
    "Um convite de fecho no quadro de habitação",
  "changelog.entries.housing-outro-band.body":
    "O quadro principal de habitação termina agora com a mesma faixa de fecho acolhedora que o resto do site, com formas rápidas de anunciar o teu espaço ou perguntar no fórum. O separador de colegas de casa já tinha uma; agora ambos têm.",

  "changelog.entries.gathering-audience-scope.title":
    "Escolhe quem pode ver o teu convívio",
  "changelog.entries.gathering-audience-scope.body":
    "Ao organizares um convívio, agora podes definir exatamente até onde ele chega: aberto a todas as pessoas na QueerPulse, só a quem as tuas ligações conhecem, só às tuas próprias ligações, aos membros da comunidade onde estás a publicar, ou só a quem convidares. Público continua a ser a opção por omissão, e podes mudá-la a qualquer momento a partir da página de gestão.",

  "changelog.entries.unified-pronoun-picker.title":
    "Um seletor de pronomes consistente em todos os perfis",
  "changelog.entries.unified-pronoun-picker.body":
    "As tuas opções de pronomes passam a ser iguais em todo o lado onde as defines (o teu perfil, o teu perfil de trabalho e a habitação), a partir de uma lista partilhada, para que um conjunto que escolhes num sítio esteja disponível em todos. Também podes escolher mais do que um conjunto e adicionar os teus.",
  "changelog.entries.work-profile-skills-focus.title":
    "Escolhe as tuas competências e áreas de foco no perfil de trabalho",
  "changelog.entries.work-profile-skills-focus.body":
    "A secção “Competências e foco” do teu perfil de trabalho era antes um mostruário fixo que não podias alterar. Agora as etiquetas são tuas para escolher: toca nas competências que podes oferecer e nas áreas de foco em que gostarias de apoio, e ficam guardadas com o resto do teu perfil de trabalho. É o que vamos usar para te ligar na troca de competências e com mentores, escolhe quantas fizerem sentido.",
  "changelog.entries.profile-personal-fields.title":
    "O teu nome, pronomes e localização agora ficam juntos",
  "changelog.entries.profile-personal-fields.body":
    "Arrumámos o topo dos dois editores de perfil para que o essencial se leia como um só bloco. Nas definições do teu perfil, os pronomes subiram para ficar mesmo ao lado do nome e da localização, em vez de uma secção separada, e o teu perfil de Trabalho passa a começar pelos mesmos três (nome, pronomes, localização) antes de tudo o resto. Nada foi removido; é só mais fácil ver e preencher quem és num relance.",
  "changelog.entries.feed-avatar-to-profile.title":
    "Toca na foto de alguém no feed para abrir o perfil",
  "changelog.entries.feed-avatar-to-profile.body":
    "Alguém te chamou a atenção no feed? A foto passou a ser uma porta. Toca ou clica no avatar de qualquer publicação, nota de nova pessoa, tópico do fórum ou cartão de convívio e vais direto ao perfil dessa pessoa, sem procurar um link à parte.",
  "changelog.entries.affirming-housing-baseline.title":
    "Todas as casas e todos os colegas de casa aqui são afirmativos LGBTQ+, agora é o padrão",
  "changelog.entries.affirming-housing-baseline.body":
    'Ser afirmativo LGBTQ+ deixou de ser uma opção que um anúncio pode ou não marcar. É a base de todas as casas, quartos e pessoas no quadro de habitação. Antes de publicares um espaço, criares um perfil de colega de casa ou contactares sobre uma casa, assumes uma vez um compromisso afirmativo, e ele aplica-se em todo o lado. Cada anúncio passa a ter um selo "Afirmativo LGBTQ+" como norma, e se uma casa ou pessoa quebrar esse compromisso podes denunciar. Isto é um compromisso da comunidade: ninguém é separado pela sua identidade.',
  // ── Wave B2: anúncios verificados, marcação de visitas, avaliações cegas ─
  "changelog.entries.housing-listing-discovery.title":
    "Encontra a casa certa: fotos a sério, filtros que encaixam e um aviso quando aparece",
  "changelog.entries.housing-listing-discovery.body":
    "Cada anúncio abre agora num visualizador de fotos como deve ser: desliza ou navega pelos quartos em ecrã inteiro, com legendas e uma visita virtual quando quem anuncia a acrescentou. O quadro passa a ter filtros a sério: intervalo de preço, bairro, quartos, despesas incluídas, acesso sem degraus, data de entrada e só verificados. Gostaste de uma procura? Guarda-a e avisamos-te discretamente quando surgir uma casa nova que encaixe, sem estares sempre a atualizar. Anunciar a tua própria casa também ficou mais claro, com umas dicas simples sobre fotos que ajudam quem procura a imaginar-se a viver lá.",

  "changelog.entries.housing-viewings-reviews.title":
    "Vê a casa antes de pagar, e avaliações que não se manipulam",
  "changelog.entries.housing-viewings-reviews.body":
    "Passas a poder pedir uma visita diretamente a partir de um anúncio (por vídeo ou presencial) e propor algumas horas; quem oferece a casa aceita uma, sugere outra ou recusa, tudo registado em As tuas visitas. Assim que uma visita é aceite, a morada exata abre-se para ti. É a forma comprovada de evitar uma burla de arrendamento: ver a casa ao vivo antes de se falar em dinheiro. Alguns anúncios passam a ter um selo de Anúncio verificado, conquistado só quando quem anuncia tem identidade verificada, o anúncio passou na nossa revisão e não levantou alertas, e nunca é algo que alguém possa ligar por si. E depois de uma visita, ambos os lados podem deixar uma avaliação cega: nenhum vê as palavras do outro até ambos escreverem (ou passarem duas semanas), para que nenhuma avaliação seja escrita com medo da resposta. A classificação que vês numa casa é calculada a partir dessas avaliações reveladas.",

  // ── Wave B1: integridade dos anúncios de habitação — risco, provas, transparência ─
  "changelog.entries.housing-listing-integrity.title":
    "Anúncios de habitação em que podes confiar um pouco mais",
  "changelog.entries.housing-listing-integrity.body":
    "Cada novo anúncio passa a incluir uma linha honesta sobre acessos (sem degraus ou dois lances de escadas, com ou sem elevador) e diz claramente se é uma pessoa membro ou um agente a oferecer o espaço. Os agentes são bem-vindos aqui; só mostramos um pequeno selo para saberes. Nos bastidores, um anúncio é verificado antes de chegar ao quadro: uma renda pouco plausível, contactos ou linguagem de pagar antes de visitar, ou frases que condicionariam uma casa a quem tu és levantam um alerta para uma pessoa moderadora ver primeiro. E se denunciares um anúncio, a denúncia passa a organizar a tua preocupação numa razão clara (burla, discriminação, fora da plataforma e mais), guarda uma cópia do que viste e, no caso de discriminação, lembra com cuidado que também a podes levar a um organismo de igualdade.",

  // ── Wave A: segurança na habitação, privacidade no mapa, mensagens, grupos ─
  "changelog.entries.housing-scam-safety-tenant-rights.title":
    "Arrenda sem cair em burlas, e conhece os teus direitos",
  "changelog.entries.housing-scam-safety-tenant-rights.body":
    "Procurar casa não devia ser desconfiar de toda a gente. Quando contactas por causa de um espaço ou anuncias um, passa a aparecer uma nota curta de segurança com as poucas coisas que te protegem: nunca pagar antes de assinar, fazer videochamada primeiro, manter a conversa aqui, nunca arrendar um sítio que não viste. Há também uma nova página de Segurança na habitação, com um guia claro sobre os teus direitos enquanto inquilino em Portugal (contratos escritos e registados, o limite da caução, quanto a renda pode subir e o que um senhorio nunca pode fazer) e uma ideia aproximada de quanto custam mesmo as rendas em Lisboa. É orientação geral, e dá-te o contexto para recusares um mau negócio.",

  "changelog.entries.housing-map-area-privacy.title":
    "Vê primeiro a zona, a morada exata só quando estiverem ligados",
  "changelog.entries.housing-map-area-privacy.body":
    "Os anúncios de habitação passam a mostrar num mapa onde fica o espaço, mas só a zona aproximada até tu e a pessoa estarem realmente ligados. A morada exata fica privada até lá, por isso anunciar não põe a tua porta na internet. Assim que ficarem ligados, o mapa passa ao ponto exato e à morada completa.",

  "changelog.entries.messaging-safety-block-report-pii.title":
    "Bloquear, denunciar e um lembrete antes de partilhares demais",
  "changelog.entries.messaging-safety-block-report-pii.body":
    "Passas a poder bloquear ou denunciar alguém diretamente numa conversa, e o bloqueio tem efeito de imediato: quem bloqueias sai da tua caixa de entrada e não te consegue contactar. Se uma mensagem tiver um número de telefone, um email ou dados bancários, um aviso discreto lembra-te de manter tudo aqui e de nunca enviar dinheiro antes de confiares. Nunca te impede de enviar; é apenas uma sugestão.",

  "changelog.entries.flatmate-pronoun-pre-share.title":
    "Partilha os teus pronomes com um olá, só quando quiseres",
  "changelog.entries.flatmate-pronoun-pre-share.body":
    "Quando dizes olá a um possível colega de casa, passas a poder partilhar os teus pronomes junto com a mensagem, desativado por omissão, e só com essa pessoa. É um pormenor que faz a primeira mensagem chegar mais calorosa, nos teus termos.",

  "changelog.entries.flatmate-discovery-mode.title":
    "Uma forma mais calma de explorar colegas de casa",
  "changelog.entries.flatmate-discovery-mode.body":
    "O quadro de colegas de casa passa a ter uma vista de Descoberta, ao lado da lista: um perfil de cada vez, com uma razão clara para ter encaixado contigo. Passa ou gosta ao teu ritmo; quando ambos gostam, podes dizer olá e começar a conversa. Preferes a grelha de antes? A vista de Lista está a um toque.",

  "changelog.entries.vetted-housing-groups.title":
    "Grupos de habitação verificados em que quem arrenda queer confia",
  "changelog.entries.vetted-housing-groups.body":
    "Parte da habitação mais segura acontece em grupos pequenos e triados. Agora há uma casa para eles: grupos de habitação verificados onde cada anúncio indica a renda à partida, descreve a acessibilidade com honestidade e deixa os intermediários de fora. Pede para entrar e alguém da equipa lê o teu pedido, e as regras do grupo estão ali à vista, para saberes com o que estás a concordar.",

  "changelog.entries.vouch-multiple-relationships.title":
    "Diz todas as formas como conheces alguém",
  "changelog.entries.vouch-multiple-relationships.body":
    "Ao avalizar alguém, podes agora escolher mais do que uma forma como conheces essa pessoa: amigues e pessoas com quem colaboraste, vizinhes que também conheceste na QueerPulse. Um aval raramente vem de um só fio, por isso já não te pede para escolheres apenas um.",

  "changelog.entries.getting-started-checklist.title":
    "Uma lista suave para os teus primeiros passos",
  "changelog.entries.getting-started-checklist.body":
    "Uma nova página de Primeiros passos guia-te pelas primeiras ações: preencher o perfil, entrar numa comunidade, criar uma persona, avalizar e ligar-te a alguém, publicar. Cada passo assinala-se sozinho à medida que avanças, por isso reflete sempre o que já fizeste. Encontra-la no menu da tua conta.",

  "changelog.entries.onboarding-set-up-personas-after.title":
    "Um acolhimento mais calmo: cria personas depois de entrares",
  "changelog.entries.onboarding-set-up-personas-after.body":
    "O onboarding já não te pede para criar uma persona enquanto ainda te estás a ambientar. Primeiro instalas-te; quando quiseres, podes criar uma persona para o teu ofício a qualquer momento a partir da tua página de personas.",

  "changelog.entries.pin-favorite-chats-inbox-tabs.title":
    "Fixe, marque como favorita e filtre a sua caixa de entrada",
  "changelog.entries.pin-favorite-chats-inbox-tabs.body":
    "Fixe as conversas a que volta sempre (até 3) e elas ficam no topo da sua caixa de entrada. Marque as que importam como favoritas e depois filtre por Todas, Não lidas, Favoritas ou Grupos para as encontrar rapidamente.",

  "changelog.entries.identity-verification-honest-badges.title":
    "Verificação de identidade real com selos honestos",
  "changelog.entries.identity-verification-honest-badges.body":
    "Na habitação a confiança é o que mais importa, por isso um selo passa a significar algo real. Confirma um número de telefone num passo rápido para anunciar um espaço ou perfil de colega de casa, ou para contactar sobre uma casa, e uma verificação de identidade externa opcional dá direito a um selo de identidade verificada. Um selo só aparece para uma verificação que realmente aconteceu, e a sua dica diz exatamente o que prova e o que não prova. Nunca vemos nem guardamos o teu documento de identidade nem dados biométricos: um parceiro externo faz a verificação e só nos diz que passou.",

  "changelog.entries.flatmate-explainable-matching.title":
    "Correspondências de colega de casa mais inteligentes e explicáveis",
  "changelog.entries.flatmate-explainable-matching.body":
    "As correspondências mostram agora porque combinam: orçamento, bairro, estilo de vida em comum, datas, valores de espaço seguro e bases da casa, cada um um fator que consegues ver. Preenche um pequeno questionário de convivência (ruído, espaço partilhado vs. privado) e as tuas bases de casa entram na pontuação, para que uma correspondência seja mais do que um número. As especificidades de espaço seguro ficam privadas: uma razão só nomeia o que alguém partilha quando te deu permissão para ver. Tudo opcional, e nunca usado para excluir ninguém.",

  "changelog.entries.flatmate-safe-space-identity.title":
    "Diz quem és no quadro de colegas de casa, nos teus termos",
  "changelog.entries.flatmate-safe-space-identity.body":
    "O teu perfil de colega de casa pode agora incluir os teus pronomes, o teu género e aquilo que torna uma casa segura: inclusiva para pessoas trans, sem revelar a tua identidade a terceiros, colegas de casa afirmativos. É tudo opcional: nada é guardado ou mostrado até dizeres que sim, escolhes quem vê, e podes limpá-lo quando quiseres. Estes dados ajudam-te a encontrar um lar afirmativo; nunca servem para excluir ninguém.",

  "changelog.entries.privacy-policy-refresh.title":
    "A Política de Privacidade agora corresponde ao que a plataforma faz de facto",
  "changelog.entries.privacy-policy-refresh.body":
    "Revimos a Política de Privacidade de ponta a ponta. Agora explica o Iniciar sessão com o Google, as notificações push e os dados de dispositivo, como os teus dados de identidade ficam sob o teu controlo, os dados de localização e de mensagens que guardamos, e os serviços exatos em que nos apoiamos, e removemos aquilo que não oferecemos. A Política de Cookies e as tuas definições de privacidade passam a corresponder, com a opção de análise não utilizada removida. Sem análise de comportamento, sem publicidade, sem venda de dados: continua verdade.",

  "changelog.entries.gatherings-manage-rsvp-recap-live.title":
    "Organizar um encontro já funciona a sério",
  "changelog.entries.gatherings-manage-rsvp-recap-live.body":
    "Gerir o teu encontro, marcar presença e partilhar o resumo depois já estão a funcionar, deixando de ser pré-visualizações. Marcar presença é agora um botão no próprio encontro: diz que vais, ou entra na lista de espera quando está cheio, e o teu lugar continua lá quando voltas. Quem organiza pode editar detalhes, cancelar, ver quem vem e adicionar co-anfitriãs/os no evento real, e o álbum de fotos também fica agarrado a ele. (Convidar alguém para co-anfitrião com aceitação ainda está a caminho.)",

  "changelog.entries.coop-template-portuguese.title":
    "Os modelos para formar uma cooperativa já falam português",
  "changelog.entries.coop-template-portuguese.body":
    "Os nossos documentos-base para cooperativas (a carta de valores, os estatutos-modelo, o acordo de título de capital e os restantes) já se leem em português europeu além de inglês. É um primeiro rascunho para te pôr a andar; pede a um/a advogado/a que reveja os detalhes antes de entregares seja o que for.",

  "changelog.entries.members-explainer-modal.title":
    "O botão “Explorar pessoas” da página inicial agora explica-se",
  "changelog.entries.members-explainer-modal.body":
    "Quem não tinha sessão iniciada batia na página de entrada ao clicar em “Explorar pessoas” na página inicial. Agora recebe uma explicação curta e simpática sobre como funciona fazer parte da comunidade, com uma forma clara de pedir convite ou iniciar sessão.",

  "changelog.entries.invite-request-mutual-email.title":
    "Pedir para entrar passa a pedir o email de um membro",
  "changelog.entries.invite-request-mutual-email.body":
    "Quando pedes um convite e conheces alguém aqui, o formulário passa a pedir o email dessa pessoa em vez do nome: é assim que a encontramos e te avalizamos mais depressa. O campo continua opcional, mas se o preencheres verificamos que é um email válido.",

  "changelog.entries.report-form-guide-split.title":
    "O formulário de denúncia e o guia de denúncias são agora páginas separadas",
  "changelog.entries.report-form-guide-split.body":
    "Fazer uma denúncia passa a ter a sua própria página, focada, sem um texto longo para percorrer. Como funciona a denúncia, os princípios por trás de cada decisão e o registo público de moderação vivem agora numa página dedicada “Como funciona a denúncia”, ligada nos dois sentidos.",

  "changelog.entries.safety-page-report-form.title":
    "Denunciar uma preocupação vai direto ao formulário",
  "changelog.entries.safety-page-report-form.body":
    "A página de segurança leva-te agora ao formulário de denúncia dentro da app em vez de um endereço de email, e a explicação do sistema de avais está mais fiel à forma como a entrada na rede realmente funciona.",

  "changelog.entries.public-profile-eligibility-live.title":
    "Perfis públicos que podes mesmo conquistar.",
  "changelog.entries.public-profile-eligibility-live.body":
    "O teu progresso para um perfil público reflete agora a tua atividade real: os textos que publicaste, os eventos que organizaste, apadrinhamentos e recomendações, e o tempo que apareceste. Abre o teu perfil para veres exatamente onde estás.",

  "changelog.entries.public-profile-eligibility-tracker.title":
    "Um caminho mais claro para o perfil público.",
  "changelog.entries.public-profile-eligibility-tracker.body":
    "Os perfis públicos mostram agora exatamente onde estás: o essencial que precisas, como a tua contribuição, a confiança da comunidade e a participação somam, e o próximo passo para avançares.",

  "changelog.entries.how-communities-work-page.title":
    "Uma entrada mais clara para as comunidades",
  "changelog.entries.how-communities-work-page.body":
    "A página inicial mostrava um botão “Junta-te” antes de sequer teres conta. Agora os cartões de comunidade levam a uma nova página que explica como funcionam as comunidades e porque importam, para saberes ao que te juntas antes de pedires convite.",

  "changelog.entries.guidelines-read-gate.title":
    "Lê as diretrizes até ao fim antes de concordares",
  "changelog.entries.guidelines-read-gate.body":
    "As Diretrizes da Comunidade passam a começar pelas linhas vermelhas, explicam como denunciar e o que acontece a quem as ultrapassa, de um aviso à remoção, e pedem que as leias até ao fim antes de a caixa de concordância desbloquear.",

  "changelog.entries.guidelines-in-sheet.title":
    "Leia as diretrizes da comunidade sem perder o que escreveu",
  "changelog.entries.guidelines-in-sheet.body":
    "No pedido de convite e no acolhimento, tocar em “diretrizes da comunidade” levava-te para uma página separada, e para longe de tudo o que já tinhas escrito. Agora as diretrizes sobem numa folha que podes ler e fechar ali mesmo, sem perder nada do que escreveste.",

  "changelog.entries.meganav-highlight-illustrations.title":
    "Menus ilustrados na navegação de topo",
  "changelog.entries.meganav-highlight-illustrations.body":
    "Cada menu na navegação de topo passa a abrir com uma ilustração desenhada à mão do seu destaque (pessoas a reunir-se, a cidade, apoio, cultura, trabalho) em vez de um marcador simples.",

  "changelog.entries.coming-out-guide-public.title":
    "O guia de sair do armário volta a estar aberto a todos",
  "changelog.entries.coming-out-guide-public.body":
    "O guia de sair do armário ficou por engano trancado atrás do início de sessão. É uma página de apoio: tal como os nossos recursos e páginas de segurança, deve chegar a quem se está a questionar, tenha conta ou não. Voltou a ser público.",

  "changelog.entries.poem-editor-v2.title":
    "Escrever um poema já parece mesmo escrever um poema",
  "changelog.entries.poem-editor-v2.body":
    "O editor de poemas teve uma revisão completa: uma pré-visualização ao vivo fica mesmo ao lado do que estás a escrever, podes arrastar estrofes para as reordenar ou inserir um separador de secção num instante, e as linhas que colas ficam exatamente onde as puseste. Cada poema tem agora o seu próprio link para partilhar, e a vista de leitura é mais larga e serena, com um botão para copiar o poema para quem quiser guardar as tuas palavras.",

  "changelog.entries.under18-open-invite.title":
    "A mensagem para menores de 18 passa a abrir uma porta, não a fechá-la",
  "changelog.entries.under18-open-invite.body":
    "Se nos disseres que ainda não tens 18, a nota costumava insistir na conta que não podes ter. Agora começa pelo que está aberto a toda a gente: a biblioteca, a revista e os nossos recursos são teus para ler, sem precisares de iniciar sessão.",

  "changelog.entries.communities-explained.title":
    "Uma visão mais clara de como funcionam as comunidades",
  "changelog.entries.communities-explained.body":
    "A página que explica as comunidades foi redesenhada em torno do que é uma comunidade, como te juntas e porque importa, com um caminho direto para as que já existem. Passas a encontrá-la a partir da página de Comunidades e da página inicial, em vez de escondida no menu de topo.",

  "changelog.entries.smoother-drag-reorder.title":
    "Arrastar para reordenar mais fluido",
  "changelog.entries.smoother-drag-reorder.body":
    "Reordenar as peças de uma secção de persona usa agora um arrastar e largar fluido. Agarra uma linha pela pega e as outras deslizam para dar lugar enquanto a moves. As setas para cima e para baixo continuam ali para quem usa teclado ou leitor de ecrã.",

  "changelog.entries.poem-translations.title": "Adiciona traduções de um poema",
  "changelog.entries.poem-translations.body":
    "Um poema pode agora ter mais do que uma versão: o original ao lado das suas traduções. Adiciona cada uma, dá-lhe um nome como Português ou English, e quem lê troca entre elas com um toque. A primeira versão é a predefinida que todos veem primeiro.",

  "changelog.entries.reframe-your-photos.title": "Reenquadra as tuas fotos",
  "changelog.entries.reframe-your-photos.body":
    "Ao enviares uma foto, agora podes arrastar e ampliar para escolheres exatamente como fica enquadrada antes de guardares, para que fotos de perfil, personas e outras imagens fiquem exatamente como queres.",

  "changelog.entries.guidelines-agree-self-tick.title":
    "A caixa das diretrizes marca-se sozinha quando lês até ao fim",
  "changelog.entries.guidelines-agree-self-tick.body":
    "Nos formulários de entrada e de boas-vindas, a caixa “Li as diretrizes da comunidade” já não se marca com um clique distraído. As diretrizes abrem num painel, o botão de confirmar só desbloqueia quando deslizas até ao fim, e concluir aí é o que marca a caixa por ti. O botão fica agora no fundo do painel, em vez de flutuar por cima do texto.",

  "changelog.entries.adults-only-explainer-modal.title":
    "“Eis porquê somos 18+” abre onde estás",
  "changelog.entries.adults-only-explainer-modal.body":
    "A ligação “eis porquê” na verificação de idade levava-te aos Termos, e perdias o teu lugar no formulário. Agora abre a explicação num painel discreto por cima da página: lês porque é que a QueerPulse é só para adultos, fechas, e continuas sem perder uma palavra que tinhas escrito.",

  "changelog.entries.adults-only-explainer.title":
    "“Eis porquê somos 18+” passa mesmo a dizer porquê",
  "changelog.entries.adults-only-explainer.body":
    "A ligação “eis porquê” na verificação de idade levava aos Termos sem explicar nada. A secção Elegibilidade passa a dizer claramente porque é que a QueerPulse é só para adultos, e porque quem tem menos de 18 anos também pertence à comunidade queer.",

  "changelog.entries.persona-excerpt-crash-fix.title":
    "Adicionar um excerto já não estraga o perfil",
  "changelog.entries.persona-excerpt-crash-fix.body":
    "Começar um excerto ou um detalhe de menu numa página de persona, preenchendo um campo antes dos restantes, já não deixa a página em branco. Passa a mostrar o que adicionaste e completa o resto à medida que avanças.",

  "changelog.entries.poem-line-break-fix.title":
    "As quebras de linha dos poemas ficam guardadas",
  "changelog.entries.poem-line-break-fix.body":
    "Colar um poema no editor deixa de juntar as linhas todas quando o lês: cada verso mantém a sua própria linha, tal como o escreveste ou colaste.",

  "changelog.entries.poet-rich-poems.title": "Escreve e lê poemas na íntegra",
  "changelog.entries.poet-rich-poems.body":
    "Os perfis de poeta passam a ter um editor de poemas (estrofes, separadores e notas, com itálico e negrito) e quem lê pode tocar num poema para o abrir numa vista de leitura ampla.",

  "changelog.entries.persona-editor-drag-reorder.title":
    "Arrasta para reordenar itens numa persona",
  "changelog.entries.persona-editor-drag-reorder.body":
    "A pega de cada item numa secção da persona (projetos, papéis, ligações…) agora arrasta mesmo. Agarra-a e larga o item onde quiseres, no telemóvel com o dedo ou com o rato, e a lista reorganiza-se ao vivo. As setas para cima e para baixo continuam lá para uso com teclado, por isso nada mudou nesse aspeto.",

  "changelog.entries.persona-item-link-picker-size.title":
    "Corrigidos campos em linha sobredimensionados em alguns editores",
  "changelog.entries.persona-item-link-picker-size.body":
    "Alguns campos compactos lado a lado tinham inchado até ao tamanho total: o seletor de tipo de ligação ao adicionar uma ligação a um projeto de persona (que estava a espremer o campo do endereço ao lado), as linhas de notas de conteúdo no formulário de submissão de filmes e as caixas de ligação de fotografias ao listar um negócio. Agora ficam no tamanho pretendido, por isso cada linha alinha como foi desenhada.",

  "changelog.entries.persona-editor-wide-sheet.title":
    "Editar uma secção da tua persona abre agora um painel amplo a partir de baixo",
  "changelog.entries.persona-editor-wide-sheet.body":
    "Quando editas um item numa das secções da tua persona (um projeto, um papel, uma fotografia), o editor sobe agora a partir do fundo do ecrã como um painel largo, em vez de ficar preso numa faixa estreita ao lado. Os campos ficam dois lado a lado, por isso títulos, descrições e ligações têm espaço para respirar em vez de parecerem apertados. No telemóvel mantém-se o painel de largura total de sempre.",

  "changelog.entries.community-featured-cards.title":
    "As comunidades em destaque ganham o cartão completo, com fotografias de capa",
  "changelog.entries.community-featured-cards.body":
    "As comunidades em destaque na página inicial passam a mostrar o mesmo cartão rico da montra (imagem de capa, categoria, quem mantém o espaço, como entrar, o ano em que começou, o que ganhas lá dentro e rostos reais de membros) em vez de apenas um nome e a contagem de pessoas. Quem cria comunidades pode agora adicionar uma fotografia de capa ao começar uma comunidade ou no painel de edição, e ela recebe as pessoas no cartão.",

  "changelog.entries.media-in-use-references.title":
    "Vê onde cada imagem enviada está a ser usada, e o que podes eliminar em segurança",
  "changelog.entries.media-in-use-references.body":
    "Os teus envios, e a consola de imagens da administração, mostram agora todos os sítios onde cada imagem ainda está a ser usada, com uma ligação direta para cada um. Tudo o que já não tem referências fica assinalado como seguro para remover, para limpares duplicados antigos sem receio de partires uma página ativa.",

  "changelog.entries.homepage-featured-photo-fix.title":
    "As fotografias dos membros em destaque voltam a aparecer na página inicial",
  "changelog.entries.homepage-featured-photo-fix.body":
    "O destaque curado “Pessoas reais” estava a servir a fotografia enviada de cada membro em destaque como",

  "changelog.entries.admin-media-filter-by-uploader.title":
    "As administrações podem filtrar as imagens enviadas por quem as enviou",
  "changelog.entries.admin-media-filter-by-uploader.body":
    "A consola de imagens enviadas passa a deixar uma administração restringir toda a grelha a um único membro (procurar por nome ou identificador, ou tocar no nome de quem enviou em qualquer ficheiro) para rever num só lugar tudo o que uma pessoa colocou no armazenamento.",

  "changelog.entries.persona-preview-banner-bleed.title":
    "As capas das personas vão agora de ponta a ponta no teu perfil",
  "changelog.entries.persona-preview-banner-bleed.body":
    "A capa no cartão “Também a trabalhar como” passa a preencher o cartão de ponta a ponta, o mesmo visual sem margens que as tuas personas já têm nas páginas próprias, para que o teu perfil e cada página de persona pareçam uma só peça.",

  "changelog.entries.magazine-archive-truthful-hero.title":
    "O arquivo da revista mostra agora só edições reais",
  "changelog.entries.magazine-archive-truthful-hero.body":
    "A página de todas as edições abria com um título e uma contagem fixos: “nove edições desde 2024” e números de artigos, colaboradores e línguas, que eram valores de exemplo em vez do teu arquivo. Esses passam a existir só na pré-visualização; a página real leva-te direto às edições anteriores verdadeiras.",

  "changelog.entries.persona-families-expansion.title":
    "As personas já servem muito mais ofícios",
  "changelog.entries.persona-families-expansion.body":
    "As personas vão agora muito para lá do palco. Há seis novos estilos de página (uma cadeira de salão, uma passerelle, uma galeria, um registo de história oral, um cartaz de movimento e uma sala de aula) e dezenas de novas profissões, cada uma com um aspeto pensado para o trabalho que fazes mesmo.",

  "changelog.entries.pole-dancer-persona.title": "Personas de pole dance",
  "changelog.entries.pole-dancer-persona.body":
    "Quem faz pole dance pode agora criar uma persona que mostra os dois lados da arte: os espetáculos que apresenta e as aulas que dá.",

  "changelog.entries.astrologer-persona.title":
    "Novas personas de astrologia, com a sua própria página celeste",
  "changelog.entries.astrologer-persona.body":
    "Já podes criar uma persona de astrologia. Ganha a sua própria página “mapa”: uma efeméride índigo, salpicada de estrelas, com as tuas leituras numeradas como casas, o céu de hoje, o que precisas de quem te procura antes de uma leitura, e uma declaração clara do que uma leitura não é.",

  "changelog.entries.crisp-profile-photos.title":
    "As fotos de perfil estão mais nítidas nas páginas de membros",
  "changelog.entries.crisp-profile-photos.body":
    "Alguns retratos de membros apareciam desfocados na página de perfil, enquanto outros estavam nítidos. A foto grande passa a pedir uma resolução à medida do espaço que preenche, por isso cada perfil mostra um retrato claro e definido.",

  "changelog.entries.developer-persona-banner.title":
    "Os perfis de programador voltam a mostrar banner",
  "changelog.entries.developer-persona-banner.body":
    "Os perfis de programador, criador e outros perfis de quem constrói escondiam sem querer a imagem de banner que carregavas. Se adicionaste uma capa, ela passa a aparecer no topo do perfil. Se não adicionaste, a página fica limpa, sem faixa vazia.",

  "changelog.entries.persona-preview-edit-hidden.title":
    "Pré-visualizar o teu perfil como visitante já esconde os controlos de edição",
  "changelog.entries.persona-preview-edit-hidden.body":
    "Ao pré-visualizares o teu próprio perfil como visitante, o botão Editar ainda aparecia nos teus perfis profissionais, por isso a pré-visualização não correspondia bem ao que os outros veem. Agora fica escondido, e a pré-visualização reflete mesmo a experiência de quem te visita.",

  "changelog.entries.persona-solo-card-wide.title":
    "Um único perfil profissional com capa passa a ocupar o espaço",
  "changelog.entries.persona-solo-card-wide.body":
    "Se o teu perfil tem apenas um perfil profissional e este tem foto de capa, o cartão passa a apresentar-se na horizontal, com a capa ao lado dos detalhes, em vez de ficar numa coluna estreita com um espaço vazio ao lado. Perfis com menos conteúdo mantêm o cartão compacto.",

  "changelog.entries.persona-performance-row-mobile.title":
    "As listas de atuações dos perfis leem-se bem no telemóvel",
  "changelog.entries.persona-performance-row-mobile.body":
    "Num ecrã estreito, o ano, o título e o local de uma atuação disputavam a mesma linha, apertando o título até ele partir uma letra por linha. Agora cada parte ocupa a sua própria linha, para que as atuações de um bailarino, ou de qualquer perfil, continuem legíveis no telemóvel.",

  "changelog.entries.endorse-persona-by-owner-name.title":
    "Apoiar um perfil sem nome passa a usar o teu nome",
  "changelog.entries.endorse-persona-by-owner-name.body":
    "Quando alguém deixa um perfil com o nome apenas da sua área (“Bailarino”, “Programador”), a janela de apoio passa a tratar a pessoa pelo primeiro nome (“Apoiar Philippine”) em vez da profissão isolada, para que o texto soe a algo sobre uma pessoa.",

  "changelog.entries.landing-featured-member-card.title":
    "Um cartão de membro em destaque mais rico na página inicial",
  "changelog.entries.landing-featured-member-card.body":
    "Os membros que a nossa equipa destaca na página inicial aparecem agora no mesmo cartão de destaque completo da demonstração (um retrato grande, as palavras da própria pessoa e uma ligação direta ao perfil), alternando entre todos os que destacámos. Substitui o cartão mais simples que mostrava apenas um nome e uma frase.",

  "changelog.entries.session-expiry-csrf-fix.title":
    "Menos expulsões inesperadas por “sessão expirada”",
  "changelog.entries.session-expiry-csrf-fix.body":
    "Corrigimos um erro que te podia desligar com a mensagem “sessão expirada” mesmo estando a tua sessão perfeitamente válida: o sinal era que bastava recarregar a página para voltares a entrar. Acontecia sobretudo com a aplicação aberta em mais do que um separador. Agora a tua sessão recupera sozinha, em silêncio, em vez de te mandar para o ecrã de início de sessão.",

  "changelog.entries.persona-image-remove-confirm.title":
    "Uma confirmação rápida antes de remover uma foto da persona",
  "changelog.entries.persona-image-remove-confirm.body":
    "Tocar no ícone do caixote numa imagem de avatar, capa ou item já não a apaga de imediato. Aparece primeiro uma pequena confirmação, para que um toque acidental não elimine uma foto que querias manter.",

  "changelog.entries.persona-craft-pass.title":
    "As personas ficam melhores em todo o lado",
  "changelog.entries.persona-craft-pass.body":
    "Uma passagem de acabamento por toda a funcionalidade. O modo escuro está corrigido: detalhes das skins, menus e ícones de estado que antes desapareciam ficam agora nítidos. O diretório de personas já não para nas 40 pessoas, carrega com um esqueleto em vez de um spinner e abre mais depressa porque os estilos das personas já não pesam em todas as outras páginas. No telemóvel, as janelas de apoiantes, denúncia e eliminação são agora painéis que podes deslizar para fechar, as áreas de toque são maiores, os campos de endereço e link abrem o teclado certo, e podes pré-visualizar a tua persona enquanto editas. Partilhar também está mais cuidado: as pré-visualizações de link já não cortam a tua foto, e o editor mostra ilustração a sério quando algo corre mal.",

  "changelog.entries.persona-audit-hardening.title":
    "Personas: uma passagem de polimento e segurança",
  "changelog.entries.persona-audit-hardening.body":
    "Uma revisão ampla das personas. O editor passa a proteger o teu trabalho: avisa antes de o botão de retroceder perder alterações por guardar, mantém o que escreves em segurança durante uma gravação e pede-te para guardar antes de publicar, para que o que vês seja o que fica no ar. As páginas públicas de persona carregam o banner mais depressa, leem-se bem em leitores de ecrã e nunca mostram um placeholder perdido. Quem segue fica privado, os links são verificados por segurança e o diretório de personas carrega mais rápido. As pessoas co-donas podem editar à vontade, mas só quem criou pode renomear, despublicar, eliminar ou remover um co-dono, e todos são avisados se uma persona partilhada for eliminada.",

  "changelog.entries.persona-followers-owner-view.title":
    "Vê quem segue a tua persona",
  "changelog.entries.persona-followers-owner-view.body":
    "Quem é responsável por uma persona pode agora abrir os seus seguidores e ver exatamente quem lá está: as pessoas que acompanham o teu trabalho em silêncio. Para toda a gente, seguir mantém-se privado: mais ninguém consegue ver quem segue uma persona, e aquilo que tu segues nunca aparece a ninguém.",

  "changelog.entries.persona-image-reuse-uploads.title":
    "Reutiliza uma foto que já carregaste",
  "changelog.entries.persona-image-reuse-uploads.body":
    "Todos os espaços de imagem no editor da tua persona (o avatar ou logótipo, o banner de capa e a imagem de cada item) podem agora usar fotos que já carregaste antes, para lá de um ficheiro novo do teu dispositivo. Ao escolher uma imagem abre-se um seletor com as tuas fotos anteriores, para reutilizares a mesma imagem em várias personas com uns toques, ou apagares as que já não precisas.",

  "changelog.entries.persona-banner-quality.title":
    "Banners de persona mais nítidos",
  "changelog.entries.persona-banner-quality.body":
    "As imagens de banner das personas mantêm agora mais detalhe, por isso uma capa de largura total fica nítida em vez de parecer desfocada em ecrãs maiores. Adicionámos também um pouco de espaço entre um banner que sangra e o teu nome e foto. Volta a carregar um banner existente para obteres a qualidade superior.",

  "changelog.entries.modal-close-scroll-jump.title":
    "Adeus ao salto da página ao fechar um diálogo",
  "changelog.entries.modal-close-scroll-jump.body":
    "Fechar uma janela, como o cartão de informação de uma persona, já não faz a página saltar para o topo e voltar a descer. A tua posição é restaurada de imediato, exatamente onde a deixaste.",

  "changelog.entries.persona-gallery-multi-add.title":
    "Adiciona várias fotos à galeria de uma vez",
  "changelog.entries.persona-gallery-multi-add.body":
    "Montar a galeria de fotos da tua persona é agora mais rápido. Escolhe um conjunto do teu dispositivo ou das tuas fotos anteriores e entram todas juntas, até ao limite de seis fotos.",

  "changelog.entries.persona-gallery-lightbox.title":
    "Toca numa foto da persona para a veres em ecrã inteiro",
  "changelog.entries.persona-gallery-lightbox.body":
    "As fotos da galeria de uma persona abrem agora em ecrã inteiro quando lhes tocas: a foto completa, sem cortes, com as setas do teclado e no ecrã para passar de uma para outra.",

  "changelog.entries.persona-gig-images.title":
    "Adiciona uma foto aos teus concertos",
  "changelog.entries.persona-gig-images.body":
    "Os concertos e atuações no editor de persona já aceitam uma imagem, para o teu destaque brilhar com uma foto real em vez de um espaço vazio.",

  "changelog.entries.persona-save-all-changes.title":
    "Guarda a tua persona de uma vez só",
  "changelog.entries.persona-save-all-changes.body":
    "O editor de persona agora guarda tudo de uma vez, com uma lista sempre atualizada que mostra exatamente o que alteraste antes de tocares em Guardar.",

  "changelog.entries.persona-page-motion.title":
    "Páginas de persona que se movem contigo",
  "changelog.entries.persona-page-motion.body":
    "As páginas de persona agora ganham vida à medida que chegas e percorres: o cabeçalho assenta suavemente e cada secção surge quando lá chegas. Cada visual de persona mantém o seu próprio ritmo: umas são rápidas, outras deslizam devagar e as mais sóbrias ficam calmas. Tudo respeita a definição de movimento reduzido do teu dispositivo: se preferes tudo parado, fica parado.",

  "changelog.entries.endorse-with-note.title":
    "Endossa uma persona com uma nota",
  "changelog.entries.endorse-with-note.body":
    'Endossar a persona de alguém passa a abrir uma janela onde podes acrescentar uma breve nota sobre o que torna o trabalho digno de apoio. Já endossaste? Toca em "Endossado" para editar a tua nota ou retirar o endosso quando quiseres.',

  "changelog.entries.persona-banner-bleed.title":
    "Deixe o banner do seu perfil sangrar na página",
  "changelog.entries.persona-banner-bleed.body":
    "Os perfis agora podem suavizar a emenda onde a foto de capa encontra a página. Nas configurações do seu perfil, em Presença, a nova opção “Borda do banner” permite manter o banner contido (como antes) ou deixá-lo sangrar, com a imagem de capa a desvanecer suavemente na página abaixo. Funciona com qualquer visual de perfil, dissolvendo-se na cor que estiver sob o banner.",

  "changelog.entries.persona-hero-actions-tidy.title":
    "Uma linha de ações mais arrumada nas páginas de persona",
  "changelog.entries.persona-hero-actions-tidy.body":
    "Os botões no topo de uma persona passam a ler-se como um menu claro. Mensagem e Seguir ficam à frente, e as ações menos usadas (Partilhar e Denunciar) recolhem-se num menu “⋯” para a linha não ficar apinhada. As contagens de seguidores e apoios passaram para uma única linha discreta por baixo, em vez de se repetirem nos próprios botões.",

  "changelog.entries.fix-member-filter-collapse.title":
    "Filtros mais arrumados no diretório de membros",
  "changelog.entries.fix-member-filter-collapse.body":
    "Quando um grupo de filtros do diretório de membros estava recolhido, ainda espreitava uma fresta do seu conteúdo (uma caixa de seleção ou uma etiqueta) por baixo do título. Os grupos recolhidos passam a mostrar apenas o título, para o painel de filtros ler como um menu limpo, e tudo desliza como antes quando abres um grupo.",

  "changelog.entries.fix-persona-hero-theme-colors.title":
    "O estado e as redes sociais da persona agora acompanham o tema",
  "changelog.entries.fix-persona-hero-theme-colors.body":
    "Nas personas com tema escuro (como o visual de palco), o estado de disponibilidade e os ícones das redes sociais ficavam apagados: texto esbatido e um ícone num círculo branco gritante. Agora seguem as cores da tua persona, mantendo o estado legível e transformando cada ícone social num botão subtil, tingido com o acento, que combina com o tema.",

  "changelog.entries.persona-photo-gallery.title":
    "Adiciona uma galeria de fotos à tua persona",
  "changelog.entries.persona-photo-gallery.body":
    "As personas agora podem exibir uma galeria de até 6 fotos.",

  "changelog.entries.persona-project-links.title":
    "Adiciona links a projetos individuais",
  "changelog.entries.persona-project-links.body":
    "Adiciona links (como o GitHub) a projetos individuais.",

  "changelog.entries.fix-persona-avatar-overlap.title":
    "As fotos das personas já não se sobrepõem ao título",
  "changelog.entries.fix-persona-avatar-overlap.body":
    "Em alguns estilos de persona (como os estilos de programador/a e de terapeuta), a foto de perfil podia sair da moldura e sobrepor-se ao nome, à frase ou aos botões ao lado. A foto passa a ficar bem dentro da moldura, no tamanho certo para cada estilo, para que o topo de cada persona se leia com clareza.",

  "changelog.entries.network-modal-search.title":
    "Procura nas listas da tua rede",
  "changelog.entries.network-modal-search.body":
    'As listas "Ligações" e "Avalizaram-te" no teu perfil passam a ter uma caixa de procura, para filtrares uma lista longa até um nome num instante.',

  "changelog.entries.profile-your-network.title":
    "Vê a tua rede no teu próprio perfil",
  "changelog.entries.profile-your-network.body":
    'O cabeçalho do teu perfil passa a mostrar uma linha privada de atalhos "A tua rede", só para ti: quantas pessoas tens ligadas, quem avalizaste e quem te avalizou. Toca num atalho para veres a lista completa, do mais recente para o mais antigo, com a altura em que cada coisa aconteceu. Só tu a vês, e fica escondida quando pré-visualizas o teu perfil como visitante.',

  "changelog.entries.fix-page-top-nav-overlap.title":
    "O conteúdo das páginas já não fica escondido por baixo do menu do topo",
  "changelog.entries.fix-page-top-nav-overlap.body":
    "O menu flutuante do topo sobrepunha-se ao início de algumas páginas, cortando um título ou botão por baixo. Agora todas as páginas reservam esse espaço num único sítio partilhado, por isso nada fica por baixo do menu, e cada página mantém o seu próprio espaçamento.",

  "changelog.entries.nav-rail-redesign.title": "Um menu principal mais claro",
  "changelog.entries.nav-rail-redesign.body":
    "O menu no computador mantém agora todas as secções à vista: escolhes uma na coluna e as suas ligações, com uma pré-visualização ao lado, aparecem logo. Os mesmos destinos, com menos procura.",

  "changelog.entries.persona-photo-enlarge.title":
    "Toca na foto de uma persona para a ver em tamanho grande",
  "changelog.entries.persona-photo-enlarge.body":
    "Tal como num perfil normal, podes agora tocar no avatar de uma persona para abrir a foto em ecrã inteiro: um olhar em condições sobre quem está por trás da persona. Toca fora, usa o botão de fechar ou carrega em Esc para sair.",

  "changelog.entries.persona-mobile-hero.title":
    "As personas ficam bem no teu telemóvel",
  "changelog.entries.persona-mobile-hero.body":
    "O cabeçalho de uma persona passa a assentar na mesma coluna limpa e centrada que o teu próprio perfil usa no telemóvel: o avatar, o nome, a frase e as ligações empilhados ao centro, com os botões de ação a ocupar toda a largura e fáceis de alcançar com um só polegar. Fim do amontoado apertado no canto superior esquerdo num ecrã estreito.",

  "changelog.entries.fix-persona-save-conflict.title":
    "Guardar uma segunda persona já não dá erro",
  "changelog.entries.fix-persona-save-conflict.body":
    "Editar e guardar uma persona podia falhar com um erro de “endereço já em uso” assim que tinhas mais do que uma, mesmo quando nunca tinhas definido um identificador público em nenhuma delas. Um identificador em branco passa agora a ser tratado como “nenhum”, em vez de um valor vazio que colidia em silêncio com as tuas outras personas, por isso as alterações guardam sem problemas. E se duas personas partilharem mesmo o mesmo endereço, passamos a dizer-te exatamente que campo mudar.",

  "changelog.entries.magazine-desk-two-tracks.title":
    "Duas vias na redação da revista: Destaques e Edição",
  "changelog.entries.magazine-desk-two-tracks.body":
    "Quem edita pode agora manter os destaques autónomos da plataforma separados das peças que estão a ser reunidas numa edição completa. Alterna entre as duas vias com um toque e move qualquer peça de uma para a outra: envia um destaque para a edição atual, ou tira uma peça da edição para ela seguir por conta própria. A pesquisa, os filtros e as vistas guardadas funcionam dentro da via em que estás, e as novas encomendas entram na via que escolheres.",

  "changelog.entries.photo-metadata-strip-hardening.title":
    "Remoção mais forte dos dados de localização escondidos nas tuas fotos",
  "changelog.entries.photo-metadata-strip-hardening.body":
    "Todas as fotos que carregas têm os metadados escondidos (incluindo a localização GPS que muitos telemóveis gravam na imagem) removidos no teu navegador antes de saírem do teu dispositivo. Fechámos as falhas: se essa remoção não conseguir completar-se por algum motivo, o carregamento passa a ser bloqueado em vez de enviado como está, e os GIFs animados são limpos sem perderem a animação. A tua localização continua a ser tua.",

  "changelog.entries.fix-persona-cover-overlay-leak.title":
    "As capas dos perfis aparecem limpas depois de as carregares",
  "changelog.entries.fix-persona-cover-overlay-leak.body":
    "Nos perfis de músico e DJ, a textura decorativa pensada para o estado vazio, sem capa, continuava a pintar por cima da tua imagem depois de a carregares, escurecendo e granulando a foto. Passa a desaparecer assim que defines uma imagem de capa, para que a tua capa apareça exatamente como a escolheste.",

  "changelog.entries.members-filter-panel-polish.title":
    "Um painel de filtros mais calmo no diretório de membros",
  "changelog.entries.members-filter-panel-polish.body":
    "Os filtros do diretório de membros apareciam como sete caixas flutuantes quase idênticas que, quando fechadas, criavam ruído visual. Passam a ser um único painel arrumado, com separadores discretos entre cada grupo, e cada cabeçalho de filtro reage ao rato e ao foco do teclado, deixando claro que pode ser aberto.",

  "changelog.entries.fix-persona-stage-dark-legibility.title":
    "As páginas de persona continuam legíveis no modo escuro",
  "changelog.entries.fix-persona-stage-dark-legibility.body":
    "Dois estilos de persona ficavam ilegíveis no modo escuro, sobretudo na pré-visualização do editor. No estilo palco (músicos e DJ), o nome, os títulos das secções e a etiqueta de tipo ficavam escuros sobre escuro e quase desapareciam; o estilo de escritor ficava quase totalmente ilegível, com o texto de tinta quente perdido sobre uma página quase preta. Ambos passam a manter-se claros e legíveis em qualquer tema, e o pequeno ícone de ajuda ⓘ ao lado do nome da persona deixa de parecer um círculo vazio em superfícies escuras.",

  "changelog.entries.fix-persona-preview-avatar.title":
    "As fotos da persona aparecem agora na pré-visualização, e o avatar voltou a ser redondo",
  "changelog.entries.fix-persona-preview-avatar.body":
    "No editor de personas, um avatar ou capa acabados de escolher mostravam só um marcador de posição na pré-visualização até guardares. Passam a aparecer no momento em que os escolhes. Corrigimos também um quadrado indevido que emoldurava o avatar circular na pré-visualização e na página pública da persona.",

  "changelog.entries.fix-vouch-success-self-face.title":
    "A confirmação do teu voto mostra agora a tua cara",
  "changelog.entries.fix-vouch-success-self-face.body":
    'Ao votar por alguém, o painel de confirmação podia juntar a foto do membro a um perfil de demonstração em vez da tua. Passa a mostrar sempre o teu avatar e as tuas iniciais reais ao lado das dessa pessoa, para que o momento "confirmado" reflita quem está mesmo a votar.',

  "changelog.entries.persona-readiness-estimate.title":
    "A estimativa de prontidão da persona reflete agora o que falta mesmo",
  "changelog.entries.persona-readiness-estimate.body":
    'A "Estimativa rápida" na página Publicar de uma persona passa a contar tudo o que ainda vale a pena acrescentar (uma imagem de capa, a tua disponibilidade, um link social e conteúdo suficiente) em vez de saltar para 100 assim que já dava para publicar. O número só enche quando não falta mesmo nada por afinar.',

  "changelog.entries.fix-persona-item-drawer-scroll.title":
    "Percorre todos os campos ao editar um item da montra",
  "changelog.entries.fix-persona-item-drawer-scroll.body":
    "O painel de edição de um item da montra (como um concerto ou um projeto) já não fica cortado no fundo do ecrã no telemóvel: agora consegues percorrer todos os campos e chegar ao Guardar.",

  "changelog.entries.my-uploads.title":
    "Vê e faz a gestão de tudo o que enviaste",
  "changelog.entries.my-uploads.body":
    "Um novo ecrã As minhas imagens nas Definições mostra todas as imagens que enviaste, para encontrares e apagares envios duplicados sem querer. Avisa-te se uma imagem ainda está a ser usada antes de a removeres.",

  "changelog.entries.profile-photo-picker.title":
    "Reutiliza uma foto que já carregaste",
  "changelog.entries.profile-photo-picker.body":
    "O novo seletor de fotos permite definir a tua foto de perfil a partir de carregamentos anteriores, do teu dispositivo ou da tua foto da Google, e arrumar carregamentos antigos de que já não precisas.",

  "changelog.entries.fix-persona-image-persistence.title":
    "As fotos carregadas mantêm-se depois de editar",
  "changelog.entries.fix-persona-image-persistence.body":
    "Corrigimos um erro em que uma foto carregada podia desaparecer depois de editares algo e recarregar: aparecia ao início e depois voltava ao marcador de posição. Afetava as capas e os avatares das personas, a tua foto de perfil e as imagens de trabalho, e as fotos dos negócios no diretório. Guardar já não substitui uma imagem que não mexeste, por isso as tuas fotos ficam.",

  "changelog.entries.dark-ghost-button-contrast.title":
    "Os botões delineados ficam legíveis no modo escuro",
  "changelog.entries.dark-ghost-button-contrast.body":
    "Os botões secundários delineados, como o Partilhar numa persona, ficavam quase invisíveis sobre fundos escuros. O contorno e o texto passam a cumprir as diretrizes de contraste, por isso ficam claramente legíveis mantendo-se secundários face à ação principal.",

  "changelog.entries.admin-media-delete-and-preview-fix.title":
    "As administradoras podem eliminar ficheiros guardados, e as pré-visualizações grandes já não escondem os controlos",
  "changelog.entries.admin-media-delete-and-preview-fix.body":
    "Na consola de media de administração, as pré-visualizações de imagens altas empurravam as ações do ficheiro para fora do ecrã. Agora as pré-visualizações têm um limite de altura para que todos os controlos fiquem acessíveis. As administradoras podem também eliminar definitivamente um ficheiro guardado a partir do painel de detalhes, com um passo de confirmação que avisa quando algo ainda o referencia.",

  "changelog.entries.persona-editor-live-preview.title":
    "A pré-visualização do editor de persona atualiza-se enquanto escreves",
  "changelog.entries.persona-editor-live-preview.body":
    "A pré-visualização ao vivo ao lado do editor de persona passa a refletir de imediato as tuas alterações ao nome, à frase de destaque, à bio, ao avatar, à capa, ao acento e à chamada para ação, antes de guardares, para veres exatamente como a tua persona vai ficar enquanto editas.",

  "changelog.entries.fix-uploaded-avatar-not-showing.title":
    "As fotografias de perfil carregadas passam a aparecer depois de guardar",
  "changelog.entries.fix-uploaded-avatar-not-showing.body":
    "Corrigimos um erro em que uma fotografia de perfil que tinhas carregado e guardado aparecia como imagem partida ao recarregar a página. O teu retrato guardado passa a aparecer de forma fiável em todo o lado.",

  "changelog.entries.fix-image-preview-csp.title":
    "A pré-visualização da imagem volta a aparecer ao carregar",
  "changelog.entries.fix-image-preview-csp.body":
    "Corrigimos um erro em que a pré-visualização de uma fotografia acabada de escolher não aparecia durante o carregamento: uma política de segurança estava a bloquear a imagem de pré-visualização local. A fotografia escolhida passa a aparecer de imediato enquanto carrega.",

  "changelog.entries.use-google-profile-photo.title":
    "Usa a tua fotografia da Google no teu perfil",
  "changelog.entries.use-google-profile-photo.body":
    "Se entraste com a Google e ainda não escolheste uma fotografia de perfil, o editor de perfil passa a mostrar um botão “Usar fotografia da Google”, para preencheres o teu retrato a partir da conta Google com um só toque, sem teres de procurar um ficheiro para carregar.",

  "changelog.entries.skip-link-keyboard-only.title":
    "O atalho “Saltar para o conteúdo” deixou de aparecer sem razão",
  "changelog.entries.skip-link-keyboard-only.body":
    "O atalho “Saltar para o conteúdo”, que ajuda quem navega pelo teclado a passar à frente da navegação, aparecia por vezes durante a navegação normal. Agora só surge quando chegas mesmo a ele com o teclado (tecla Tab) e mantém-se escondido o resto do tempo.",

  "changelog.entries.enlarge-profile-photo.title":
    "Toca na foto de perfil para a ver de perto",
  "changelog.entries.enlarge-profile-photo.body":
    "No perfil de qualquer pessoa, toca na foto para a abrir em grande, na versão completa, para veres exatamente quem é antes de a contactares. Toca em qualquer sítio ou carrega em Escape para fechar.",

  "changelog.entries.tap-notification-to-profile.title":
    "Toca numa notificação para abrir o perfil",
  "changelog.entries.tap-notification-to-profile.body":
    "Quando alguém aceita o teu convite ou a tua ligação, toda a notificação passa a ser tocável e leva-te diretamente ao perfil dessa pessoa, para lá da pequena ligação do nome. As notificações que apontam para algo mais específico, como uma conversa ou um convívio, continuam a abrir isso.",

  "changelog.entries.more-push-notifications.title":
    "Mais do que te importa chega agora como notificação push",
  "changelog.entries.more-push-notifications.body":
    "As notificações push eram só mensagens diretas e lembretes de eventos. Agora chegam mais momentos que contam ao teu ecrã de bloqueio: pedidos e aceitações de ligação, menções, respostas em conversas em que estás, e avais que recebes, além de um aviso sempre que um evento a que vais muda ou é cancelado. Há também uma novidade para quem acolhe: um toque quando alguém avaliza um espaço seguro que cuidas. Novos botões em definições deixam-te manter as Menções e os Avais tão presentes ou discretos quanto quiseres, e um botão “Enviar um teste a ti” confirma que tudo chega ao teu dispositivo.",

  "changelog.entries.localized-push-notifications.title":
    "Notificações push no teu idioma",
  "changelog.entries.localized-push-notifications.body":
    "As notificações push do sistema, como o lembrete de um convívio, passam a aparecer em português para quem tem a app definida em português, em vez de virem sempre em inglês. As pré-visualizações de mensagens diretas já apareciam nas tuas próprias palavras; isto alinha o texto da própria app com elas.",

  "changelog.entries.magazine-desk-workspace-nav.title":
    "Um espaço próprio para a redação da revista",
  "changelog.entries.magazine-desk-workspace-nav.body":
    "Quem edita a revista passa a ter uma navegação própria à esquerda: Redação, Propostas e Edição, com salto rápido (⌘K) e o painel “Desde sexta”, em vez do menu geral do site, em todos os ecrãs de edição.",
  "changelog.entries.richer-push-notifications.title":
    "Notificações push que mostram quem e o quê",
  "changelog.entries.richer-push-notifications.body":
    "As notificações push ficaram mais ricas: uma mensagem direta passa a mostrar de quem é, com a foto de quem escreveu, e um lembrete de evento mostra a capa do evento. Ambas trazem um toque rápido para entrares logo, e as mensagens agrupam-se por conversa para o teu ecrã de bloqueio ficar tranquilo.",

  "changelog.entries.admin-uploaded-images.tag": "Abrir admin",
  "changelog.entries.admin-uploaded-images.title":
    "As administradoras podem ver todas as imagens enviadas",
  "changelog.entries.admin-uploaded-images.body":
    "As administradoras podem agora ver todas as imagens enviadas guardadas na plataforma, com detalhes por ficheiro (dono, metadados de armazenamento e uma verificação do tipo real de conteúdo) para revisão de segurança.",

  "changelog.entries.events-and-my-events-merged.title":
    "Os eventos e Os meus eventos são agora uma só página",
  "changelog.entries.events-and-my-events-merged.body":
    "O painel dos teus eventos e a descoberta de novos eventos passam a viver juntos em /events, com um interruptor My events / Descobrir no topo. Abre no teu painel quando tens eventos marcados e em Descobrir quando não tens.",

  "changelog.entries.trust-network-legend-withdrawn.title":
    "A legenda da rede de confiança já explica as linhas tracejadas",
  "changelog.entries.trust-network-legend-withdrawn.body":
    "No mapa da Rede de Confiança, um aval que foi retirado é desenhado como uma linha tracejada vermelha. A legenda passa a nomeá-lo, «Aval retirado», para que as linhas tracejadas deixem de ser um mistério.",

  "changelog.entries.trust-network-replay-timeline.title":
    "A repetição da Rede de Confiança conta a história pessoa a pessoa",
  "changelog.entries.trust-network-replay-timeline.body":
    "Antes, a repetição da Rede de Confiança avançava mês a mês, juntando num só borrão toda a gente que entrou no mesmo mês. Agora percorre a rede uma ligação de cada vez, pela ordem real em que as pessoas chegaram: cada passo nomeia quem se ligou e quando, e a linha correspondente na lista lateral acende-se enquanto reproduz.",

  "changelog.entries.pronouns-on-member-cards.title":
    "Cartões de novos membros mais completos no feed",
  "changelog.entries.pronouns-on-member-cards.body":
    "Os cartões de novos membros no teu feed passam a mostrar os pronomes da pessoa mesmo ao lado do nome, além de onde vive e dos seus interesses, para ficares com uma ideia de alguém ainda antes de abrires o perfil. A localização fica oculta para quem não tem o perfil público.",

  "changelog.entries.onboarding-join-and-leave.title":
    "Junta-te (e sai) de comunidades durante o registo",
  "changelog.entries.onboarding-join-and-leave.body":
    "No passo de registo que sugere comunidades, agora podes tocar novamente numa comunidade a que já te juntaste para sair, caso mudes de ideias. As sugestões passam também a mostrar apenas comunidades totalmente abertas às quais te podes juntar com um toque. As privadas e as só por convite deixam de aparecer aqui, já que não podem ser aderidas de imediato.",

  "changelog.entries.saved-and-searched-lists-load.title":
    "Os eventos guardados e as listas pesquisadas voltam a carregar em vez de dar erro",
  "changelog.entries.saved-and-searched-lists-load.body":
    "Algumas listas podiam falhar ao carregar e mostrar um erro em vez de resultados: o separador de eventos guardados (e os separadores Vou, Lista de espera e Passados), a pesquisa nas tuas mensagens, filtrar a revista por um único autor e pesquisar na fila de moderação. Cada uma destas combinava uma consulta com paginação de uma forma que baralhava a consulta à base de dados e não devolvia nada. Agora carregam os resultados de forma fiável.",

  "changelog.entries.admin-overview-stat-grid-responsive.title":
    "Os cartões de estatísticas do painel de administração ajustam-se ao ecrã no telemóvel",
  "changelog.entries.admin-overview-stat-grid-responsive.body":
    "Os quatro cartões de destaque no topo do painel de administração mantinham-se numa linha fixa de quatro em ecrãs estreitos, espremendo cada cartão até a etiqueta se partir e a linha transbordar para fora. Agora limitam-se a quatro por linha em ecrãs largos e reduzem-se com suavidade para dois e depois um à medida que o ecrã estreita, para que cada cartão continue legível no telemóvel.",

  "changelog.entries.trust-network-mobile-graph-first.title":
    "A Rede de Confiança abre no grafo no telemóvel",
  "changelog.entries.trust-network-mobile-graph-first.body":
    "Abrir a Rede de Confiança de um membro no telemóvel passa a mostrar logo o grafo de ligações, em vez de fazer surgir uma folha de detalhes por cima. Toca em qualquer pessoa no grafo para deslizar os detalhes das suas vouches e as respetivas ações, e desliza ou toca fora para voltares à vista completa.",

  "changelog.entries.magazine-article-versions.title":
    "Os rascunhos de artigos passam a guardar um histórico completo de versões",
  "changelog.entries.magazine-article-versions.body":
    "Cada rascunho enviado e cada gravação manual passam a guardar uma versão: a equipa editorial pode comparar com o rascunho atual e restaurar qualquer versão anterior sem perder trabalho.",

  "changelog.entries.magazine-article-comments.title":
    "Notas encadeadas nos rascunhos de artigos",
  "changelog.entries.magazine-article-comments.body":
    "A equipa editorial já pode deixar notas encadeadas num artigo, responder entre si e resolver uma nota depois de tratada.",

  "changelog.entries.magazine-desk-live-notifications.title":
    "O painel de atividade da mesa editorial passa a mostrar eventos reais",
  "changelog.entries.magazine-desk-live-notifications.body":
    "O painel de atividade da mesa editorial passa a mostrar eventos editoriais reais (quem fez o quê, e quando) com ligação direta à peça, em vez da mesma lista fixa de demonstração de sempre.",

  "changelog.entries.magazine-desk-wave-b-fixes.title":
    "Pesquisa no arquivo, resumos do índice e valores de cancelamento, agora reais",
  "changelog.entries.magazine-desk-wave-b-fixes.body":
    "A pesquisa no arquivo passa a encontrar peças publicadas em tempo real, em vez de uma lista de demonstração estática. Os resumos do índice da edição e a seleção “publicar nas cartas” das cartas das pessoas leitoras passam a guardar-se corretamente: essa opção criava por engano uma carta duplicada em vez de atualizar a que clicaste. Quem colabora também passa a ver o valor de cancelamento real de cada encomenda, em vez de um valor genérico.",

  "changelog.entries.magazine-commission-editor-fix.title":
    "Encomendar um artigo funciona numa revista nova",
  "changelog.entries.magazine-commission-editor-fix.body":
    "Encomendar um artigo a partir da mesa editorial podia falhar com um erro “editorId must be a UUID”, que acontecia numa revista nova, ainda sem artigos atribuídos a ninguém. As encomendas passam a ficar associadas à tua própria identidade de editor com sessão iniciada, por isso são criadas de imediato.",

  "changelog.entries.magazine-issue-production.title": "Produção da edição",
  "changelog.entries.magazine-issue-production.body":
    "Adicionámos a produção da edição: organiza o alinhamento, define a capa e as chamadas, escolhe o resumo para membros e os cartões sociais, e publica a edição inteira de uma vez com uma lista de verificação.",

  "changelog.entries.events-page-utility-redesign.title":
    "Uma página de eventos mais limpa e rápida",
  "changelog.entries.events-page-utility-redesign.body":
    "Os eventos passam a ser uma página mais funcional: um cabeçalho compacto com o interruptor Os meus eventos / Descobrir e um único sítio para organizar, sem herói gigante, um pequeno destaque “A seguir” quando há algo a acontecer, e procura em Explorar.",

  "changelog.entries.magazine-writer-workspace.title":
    "O espaço de quem escreve",
  "changelog.entries.magazine-writer-workspace.body":
    "Abrimos o espaço de quem escreve: quem escreve vê agora as suas próprias atribuições, propostas e pagamentos, escolhe a sua assinatura e entrega textos, tudo num só lugar.",

  "changelog.entries.persona-discovery-nudges.title":
    "Personas, mais fáceis de descobrir",
  "changelog.entries.persona-discovery-nudges.body":
    "Uma persona tua passa a ser mais fácil de notar, sempre que faz sentido: uma sugestão discreta no teu perfil se ainda não tens nenhuma, um lembrete no fundo do diretório de personas, um passo durante o acolhimento, um convite depois de um convívio onde atuaste, e um crédito em destaque quando alguém credita o teu trabalho no dela. Todos estes lembretes podem ser dispensados.",

  "changelog.entries.magazine-deck-editor-redesign.title":
    "O editor de decks de slides, redesenhado",
  "changelog.entries.magazine-deck-editor-redesign.body":
    "Redesenhámos o editor de decks de slides para combinar com a redação da revista: uma pré-visualização ao vivo que espelha exatamente o que os leitores veem, limites de caracteres por slide e uma lista de verificação antes de publicar.",

  "changelog.entries.magazine-desk-redesign.title":
    "A redação da revista, redesenhada",
  "changelog.entries.magazine-desk-redesign.body":
    "Redesenhámos a redação da revista: um painel editorial ao vivo com vistas de fluxo, quadro e plano da edição, caixa de propostas, vistas guardadas, paleta de comandos (⌘K) e atalhos de teclado.",

  "changelog.entries.persona-directory-redesign.title":
    "O diretório de personas, redesenhado",
  "changelog.entries.persona-directory-redesign.body":
    "Explorar personas passa a estar organizado em seis famílias de ofício (Palco, Estúdio, Página, Oficina, Consultório e Mesa) para chegares mais depressa ao tipo de trabalho que procuras, mesmo antes de pesquisares. Os cartões mostram agora tags e o número de seguidores num relance, e o bloco «Também a trabalhar como» no perfil dos membros ganhou um visual mais leve e completo para cada persona ligada.",

  "changelog.entries.persona-editor-redesign.title":
    "Um editor redesenhado para as tuas personas",
  "changelog.entries.persona-editor-redesign.body":
    "Editar uma persona tem agora o seu próprio espaço dedicado: uma barra de secções à esquerda, uma pré-visualização ao vivo encostada às tuas edições, campos mais completos para concertos, trabalho visual e projetos, e um aviso claro antes de mudares um endereço já publicado.",

  "changelog.entries.magazine-article-editor.title":
    "O editor de artigos por blocos, no ar",
  "changelog.entries.magazine-article-editor.body":
    "Adicionámos o editor de artigos por blocos: escreve em parágrafos, títulos, citações em destaque, imagens, perguntas e respostas e linhas de estatística, com ênfase em linha, um menu de barra, contagem de palavras e tempo de leitura ao vivo, e uma lista de verificação antes de publicar.",

  "changelog.entries.magazine-piece-record.title":
    "O registo completo da peça, aberto",
  "changelog.entries.magazine-piece-record.body":
    "Abrimos o registo completo da peça (encomenda, cuidado e consentimento, dinheiro, histórico e cartas de leitores) com um bloqueio de publicação que retém a peça até o consentimento e a leitura sensível estarem resolvidos.",

  "changelog.entries.persona-dashboard-redesign.title":
    "As tuas personas, num painel redesenhado",
  "changelog.entries.persona-dashboard-redesign.body":
    "O teu painel de personas foi redesenhado: cada cartão mostra agora um anel de progresso de rascunho ou um selo de estado ao vivo, a ligação e a disponibilidade num relance, e quantas pessoas coproprietárias tem. Criar uma nova persona passa a ser um fluxo guiado em dois passos: escolhe primeiro para que serve, depois dá-lhe um nome e escolhe se fica ligada ao teu perfil ou por si só.",

  "changelog.entries.persona-pages-redesigned.title":
    "Páginas de persona, redesenhadas para cada ofício",
  "changelog.entries.persona-pages-redesigned.body":
    "Cada persona passa a ter uma página pensada para a forma como esse ofício realmente se apresenta: artistas de palco ganham uma faixa de destaque com dados de contratação, artistas visuais ganham uma parede de estúdio com uma caixa de luz de ecrã inteiro para o trabalho, quem escreve ganha um layout ao estilo de página com citações em destaque, programadoras e criadores ganham uma folha de oficina, terapeutas ganham um layout de consultório calmo com a logística das sessões, e cozinheiros e mixologistas ganham um cartão de menu impresso. Denunciar uma persona e ver quem a apoia ou segue também passaram a ter os seus próprios ecrãs dedicados.",

  "changelog.entries.persona-page-unavailable-reasons.title":
    'As páginas de persona já dizem porquê, não só "não encontrada"',
  "changelog.entries.persona-page-unavailable-reasons.body":
    'Se uma persona é privada, só para membros, ou foi retirada, a página passa a dizer-te qual das três, em vez de um simples "não encontrada". E se és dona ou co-dona de uma persona que ainda não publicaste, o respetivo endereço mostra-te agora uma pré-visualização do teu rascunho, com uma barra a indicar o que falta para publicar, em vez de nada.',

  "changelog.entries.meet-the-table.title": "Vê quem está à mesa",
  "changelog.entries.meet-the-table.body":
    "As páginas dos jantares de grupo passam a mostrar uma vista acolhedora da mesa vista de cima: quem recebe, quem já vem e que lugares ainda estão livres. Toca em alguém para saber um pouco sobre essa pessoa antes de chegares. Também retirámos um antigo ecrã de pagamento de bilhetes que nunca foi um pagamento real.",

  "changelog.entries.settings-mobile-nav-strips.title":
    "Definições e edição de perfil mais fáceis no telemóvel",
  "changelog.entries.settings-mobile-nav-strips.body":
    "No telemóvel, as Definições e a edição de perfil passam a ter uma faixa compacta de separadores que fica fixa no topo enquanto percorres a página, para saltares diretamente para uma secção em vez de percorreres tudo. Na edição de perfil, a secção atual destaca-se sozinha à medida que desces na página.",

  "changelog.entries.places-card-mobile-foot.title":
    "Cartões “Espaços que geres” mais arrumados no telemóvel",
  "changelog.entries.places-card-mobile-foot.body":
    "No telemóvel, o número de referência e as ações Editar / Eliminar / Ver anúncio dos cartões dos teus anúncios do diretório deixam de se apertar numa única linha. A referência fica agora na sua própria linha, por cima de uma linha de ações mais folgada.",

  "changelog.entries.vouch-for-a-safe-space.title":
    "Deixa o teu testemunho por um espaço seguro",
  "changelog.entries.vouch-for-a-safe-space.body":
    "Se um espaço te tratou bem, podes agora juntar o teu próprio testemunho à sua página de espaço seguro, com uma nota opcional e como conheces o lugar, ou de forma anónima. O teu testemunho junta-se aos que outros membros e moderadores deixaram, para que quem chega veja quem confia num espaço.",

  "changelog.entries.my-events-change-list-live.title":
    "Vê o que mudou nos Meus Eventos",
  "changelog.entries.my-events-change-list-live.body":
    "O sino na tua página de Meus Eventos já funciona fora da demonstração. Abre-o para veres uma lista das atualizações aos eventos a que respondeste ou para que foste convidade (uma hora alterada, um novo local, um cancelamento), cada uma marcada como não lida até a veres.",

  "changelog.entries.applications-inside-work-hub.title":
    "As Candidaturas passaram para o teu Trabalho",
  "changelog.entries.applications-inside-work-hub.body":
    "As Candidaturas deixam de ter uma linha própria no menu de perfil. Passam a estar no topo do teu Trabalho, ao lado da mentoria, das competências e de tudo o resto ligado à carreira. Abre o Trabalho a partir do menu de perfil e encontras lá as tuas candidaturas, tanto em modo demonstração como em modo real.",

  "changelog.entries.invite-only-community-tier.title":
    "Comunidades só por convite voltam a ser restritas",
  "changelog.entries.invite-only-community-tier.body":
    "As comunidades definidas como só por convite ou com pedido de adesão apareciam com a etiqueta “Aberta a todes” e um botão de aderir com um toque, igual a uma comunidade totalmente aberta. Passam agora a mostrar a sua política de adesão real em todo o lado (nos cartões do diretório, na página da comunidade e na folha de adesão), por isso um espaço só por convite pede um convite em vez de deixar entrar qualquer pessoa.",

  "changelog.entries.navbar-wordmark-no-wrap.title":
    "O logótipo da QueerPulse deixa de se empilhar",
  "changelog.entries.navbar-wordmark-no-wrap.body":
    "Em alguns tamanhos de ecrã, o nome QueerPulse na barra de topo podia partir-se, deixando cada letra numa linha própria e inchando a barra numa bolha enorme. O logótipo passa agora a manter-se numa única linha em qualquer largura.",

  "changelog.entries.mobile-edit-profile-refresh.title":
    "Editar o perfil combina com o novo visual",
  "changelog.entries.mobile-edit-profile-refresh.body":
    "No telemóvel, editar o teu perfil passa a usar o mesmo layout ao centro do próprio perfil (foto redonda em cima e campos mais arrumados) e as opções de Estado e Visibilidade deixam de passar para uma segunda linha.",

  "changelog.entries.mobile-profile-header-refresh.title":
    "Um perfil mais limpo no telemóvel",
  "changelog.entries.mobile-profile-header-refresh.body":
    "Os perfis passam a começar pela foto e pelo nome ao centro, com uma linha de estatísticas mais folgada e botões mais arrumados: dizer olá e avalizar ficam mais calmos e claros no telemóvel.",

  "changelog.entries.profile-edit-save-bar-mobile.title":
    "Guardar o teu perfil no telemóvel passa a funcionar",
  "changelog.entries.profile-edit-save-bar-mobile.body":
    "Ao editares o teu perfil no telemóvel, os botões Guardar e Descartar deixam de ficar escondidos por trás da barra de navegação inferior. A barra de edição passa a ficar logo acima dela e, em ecrãs estreitos, os dois botões dividem toda a largura para serem fáceis de tocar.",

  "changelog.entries.follow-topics-you-care-about.title":
    "Segue os temas que te interessam",
  "changelog.entries.follow-topics-you-care-about.body":
    "Toca em Seguir em qualquer tema para o manteres por perto. Os teus seguimentos ficam guardados na tua conta, por isso os assuntos que te importam acompanham-te em todos os dispositivos.",

  "changelog.entries.event-change-alerts.title":
    "Fica a saber quando um evento muda",
  "changelog.entries.event-change-alerts.body":
    "Se um evento a que confirmaste presença ou para o qual foste convidade mudar de hora ou de local, recebes uma notificação, para que uma alteração de última hora nunca te apanhe desprevenide.",

  "changelog.entries.forms-that-really-submit.title":
    "Os formulários da aplicação passam a enviar mesmo",
  // Ver a nota em en/marketing.ts: corpo corrigido a 26 de agosto de 2026.
  "changelog.entries.forms-that-really-submit.body":
    "A subscrição da newsletter, os formulários de contacto e de parcerias, as candidaturas a bolsas / painéis / anfitrião sóbrio e as nomeações de espaços seguros deixaram de mostrar uma pré-visualização e passaram a guardar mesmo o que escreves, onde a equipa lhes pega dentro da aplicação. Não chega nada a ninguém por email: a QueerPulse não envia email. As tuas predefinições de eventos também ficam guardadas.",

  "changelog.entries.save-events-for-later.title":
    "Guarda convívios para mais tarde",
  "changelog.entries.save-events-for-later.body":
    "Encontraste um convívio para o qual ainda não queres confirmar presença? Toca em Guardar para o marcar. Tudo o que guardas aparece no separador Guardados em Os Meus Eventos, para que nada que te despertou curiosidade se perca.",

  "changelog.entries.collections-are-here.title":
    "Agrupa o que guardas em coleções",
  "changelog.entries.collections-are-here.body":
    "Podes agora reunir as pessoas, lugares e publicações que guardaste nas tuas próprias coleções com nome: uma lista de leitura, uma viagem, uma seleção de espaços. Cria as que quiseres e acrescenta ou remove itens quando te apetecer.",

  "changelog.entries.your-mentions-in-one-place.title":
    "Todas as menções, num só sítio",
  "changelog.entries.your-mentions-in-one-place.body":
    "Quando alguém te menciona com @ num tópico do fórum ou numa publicação de comunidade, isso passa a chegar à tua caixa de Menções, para pores a leitura em dia sem andar à procura nas notificações.",

  "changelog.entries.new-moderation-tools.title":
    "Mais ferramentas para a equipa de moderação",
  "changelog.entries.new-moderation-tools.body":
    "Nos bastidores, a equipa ganhou controlos reais: verificar ou restringir um membro, adicionar e remover moderadores de comunidade, decidir sobre propostas de grupos de leitura e publicar ou exportar registos de governação, tudo ligado à plataforma, em vez de servir apenas de pré-visualização.",

  "changelog.entries.reports-reach-the-team.title":
    "As denúncias chegam agora à equipa de moderação",
  "changelog.entries.reports-reach-the-team.body":
    'Quando denuncias uma publicação do fórum, ela chega agora à moderação de forma fiável. E, se o envio falhar, vês um erro claro e uma forma de tentar de novo, em vez de um falso "concluído". Também podes denunciar uma resposta em particular, para lá da publicação inicial.',

  "changelog.entries.chat-recovers-after-reconnect.title":
    "O chat recupera quando voltas a ter ligação",
  "changelog.entries.chat-recovers-after-reconnect.body":
    "Se uma mensagem não puder ser enviada por teres perdido a ligação, passa a enviar-se sozinha assim que voltas a estar online, sem precisares de recarregar ou reenviar à mão. Uma pequena faixa indica quando estás offline ou a reconectar, para saberes sempre o estado de uma mensagem.",

  "changelog.entries.honest-live-states.title": "O que vês é real",
  "changelog.entries.honest-live-states.body":
    "Revimos a aplicação para que as páginas mostrem apenas pessoas e conteúdos reais. Recortes de imprensa de exemplo, vozes de amostra e inventário de demonstração deixam de aparecer como se fossem reais, e os controlos que ainda não estão ligados passam a estar claramente assinalados em vez de fingirem que guardam.",

  "changelog.entries.community-activity-in-your-feed.title":
    "O teu feed mostra agora o que se passa nas tuas comunidades",
  "changelog.entries.community-activity-in-your-feed.body":
    "O feed principal passa a trazer atividade real das comunidades de que fazes parte: publicações, anúncios, novos convívios, tópicos do fórum e quem se juntou agora mesmo. Quando crias um convívio ou começas um tópico no fórum, podes partilhá-lo diretamente numa das tuas comunidades.",

  "changelog.entries.assignable-staff-roles.title":
    "A administração já pode atribuir funções da equipa da revista",
  "changelog.entries.assignable-staff-roles.body":
    "A partir do diretório de membros, a administração pode atribuir duas funções específicas, além do nível de conta de cada pessoa: Editor da revista e Redator da revista. O acesso ao desk editorial da revista passa a seguir a função de Editor da revista, em vez de qualquer pessoa moderadora. A administração mantém o acesso, como antes.",
  "changelog.entries.assignable-staff-roles.tag":
    "Abrir o diretório de membros",

  "changelog.entries.feed-scroll-no-longer-sticks.title":
    "O teu feed volta a rolar sem prender",
  "changelog.entries.feed-scroll-no-longer-sticks.body":
    "No feed inicial, nas notificações, nos membros e nos encontros, rolar com o rato ou o trackpad por cima do conteúdo podia ficar preso, sem mover nada enquanto a página não avançava. Agora rola a página como deve ser, em todo o lado.",

  "changelog.entries.fresh-feed-card-layout.title":
    "Um visual renovado para o teu feed",
  "changelog.entries.fresh-feed-card-layout.body":
    "Todos os cartões do teu feed inicial (novos membros, encontros, comunidades e publicações de comunidades) passam agora a partilhar um layout mais limpo, e ficam dois por linha em ecrãs mais largos, para veres mais coisas de relance.",

  "changelog.entries.feature-communities-cta-jump.title":
    "“Escolher comunidades” leva-te agora diretamente ao seletor",
  "changelog.entries.feature-communities-cta-jump.body":
    "No teu perfil, o botão “Escolher comunidades” do bloco Comunidades abre agora o Editar perfil já com o ecrã posicionado no seletor de comunidades, em vez de te deixar no topo da página à procura dele.",
  "changelog.entries.feature-communities-cta-jump.tag": "Escolher comunidades",

  "changelog.entries.live-homepage-curated-sections.title":
    "A página inicial mostra agora pessoas e comunidades reais, com curadoria da equipa",
  "changelog.entries.live-homepage-curated-sections.body":
    "As secções de pessoas, comunidades e agentes de mudança da página inicial pública passam agora a vir da lista com curadoria da administração: pessoas e comunidades reais que a equipa escolheu apresentar. Uma secção fica escondida até haver algo escolhido para ela.",

  "changelog.entries.featured-homepage-consent-toggle.title":
    "Consente ser destacade na página inicial",
  "changelog.entries.featured-homepage-consent-toggle.body":
    "As definições de privacidade têm agora um interruptor que deixa a administração destacar-te na página inicial com curadoria: uma citação ou destaque de membro, escolhido apenas entre perfis públicos com consentimento dado. Vem desligado por predefinição, só fica disponível depois de definires o perfil como “Aberto a ligações”, e podes voltar a desligá-lo quando quiseres.",
  "changelog.entries.featured-homepage-consent-toggle.tag":
    "Abrir as tuas definições de privacidade",

  "changelog.entries.mobile-profile-top-breathing-room.title":
    "Um topo mais calmo nos perfis no telemóvel",
  "changelog.entries.mobile-profile-top-breathing-room.body":
    "As páginas de perfil no telemóvel passam a ter mais espaço no topo, para que o avatar e os detalhes deixem de ficar espremidos por baixo do cabeçalho. Também retirámos o nome “Queer Pulse” da faixa superior nas páginas internas: a seta de voltar e o botão de início na barra inferior já te levam para onde precisas, por isso era só ruído.",

  "changelog.entries.accessible-names-screen-readers.title":
    "Os leitores de ecrã passam a nomear todos os controlos",
  "changelog.entries.accessible-names-screen-readers.body":
    "Os botões e interruptores que mostravam apenas um ícone (o botão de enviar no chat de uma transmissão, os botões de pagamento na finalização da compra, os interruptores nas tuas definições de estúdio, os cartões de moderação e de notificações) passam a anunciar um nome claro aos leitores de ecrã, para que nada seja lido como um “botão” sem nome. Acrescentámos também uma verificação automática que mantém toda a aplicação sem rótulos em falta daqui para a frente. Nada muda no aspeto ou no funcionamento; é apenas uma melhoria de acessibilidade.",

  "changelog.entries.icons-not-text-symbols.title":
    "Ícones mais nítidos em vez de símbolos de texto",
  "changelog.entries.icons-not-text-symbols.body":
    "Em toda a plataforma, as pequenas marcas de direção e de estado (as setas de “seguinte” e “voltar” nos botões e nas ligações, os cursores dos menus, as pegas de arrastar, as marcas de relógio e de reprodução) passam a ser desenhadas com ícones próprios em vez de caracteres de texto. Aparecem nítidas e iguais em qualquer dispositivo e tipo de letra, alinham-se bem com o texto e são lidas corretamente pelos leitores de ecrã. É apenas um retoque visual e de acessibilidade; nada muda no que os botões fazem.",

  "changelog.entries.message-alerts-out-of-notifications.title":
    "Os avisos de novas mensagens saíram do centro de notificações",
  "changelog.entries.message-alerts-out-of-notifications.body":
    "O teu separador de Notificações deixa de encher-se com linhas de “Tens uma nova mensagem”. As novas mensagens diretas passam a aparecer só onde faz sentido: na contagem de não lidas do ícone de mensagens e, se tiveres ativado, numa notificação push. Nada muda nas mensagens em si; o centro de notificações fica apenas mais tranquilo e focado no que ainda não vês na tua caixa de entrada.",

  "changelog.entries.shared-ui-consistency.title":
    "Janelas e formulários mais suaves e consistentes",
  "changelog.entries.shared-ui-consistency.body":
    "Reconstruímos dezenas de janelas, confirmações, seletores e formulários sobre um único conjunto de blocos partilhados. Na prática, isto significa que cada janela passa a manter o foco do teclado, fecha com a tecla Escape pela ordem certa quando há várias abertas e devolve-te exatamente ao ponto onde estavas, por isso toda a plataforma fica mais organizada e funciona melhor com teclado ou leitor de ecrã. Nenhuma funcionalidade mudou de sítio; simplesmente passam a comportar-se da mesma forma em todo o lado.",

  "changelog.entries.balanced-feed-grid.title":
    "Um feed inicial mais equilibrado",
  "changelog.entries.balanced-feed-grid.body":
    "O teu feed inicial passa a dispor os cartões numa grelha organizada em vez de uma única pilha alta. Os cartões mais leves (novos membros, leituras guardadas, resumos de encontros) ficam dois ou mais por linha num ecrã largo, por isso vês mais pessoas de relance e o separador Pessoas lê-se como um verdadeiro diretório. Cartões mais ricos, como publicações, o pulso das comunidades e encontros, continuam a ocupar toda a largura onde o espaço extra ajuda. No telemóvel, tudo volta a uma única coluna.",

  "changelog.entries.moderation-outcome-notifications.title":
    "Passas a saber o resultado de uma decisão de moderação",
  "changelog.entries.moderation-outcome-notifications.body":
    "Quando a equipa de moderação avisa, suspende ou encerra uma conta, o membro passa a receber uma notificação que explica o que aconteceu e porquê, no seu próprio idioma, com a razão escrita pela moderação e uma ligação para recorrer da decisão. Um membro suspenso ou banido é também levado diretamente para uma página que mostra a mesma razão e, no caso de uma suspensão, quando termina, em vez de um ecrã em branco que não carrega. Até agora só quem fazia uma denúncia era informado do resultado; o membro afetado ficava sem saber. As notificações de moderação são sempre entregues e não podem ser silenciadas.",

  "changelog.entries.community-page-polish.title":
    "Uma página de comunidade mais acolhedora",
  "changelog.entries.community-page-polish.body":
    "A página de cada comunidade recebeu uma ronda de melhorias: já podes partilhar uma comunidade com alguém, sair passa a pedir confirmação para nunca acontecer por engano, o separador Eventos mostra todos os próximos convívios em vez de só o seguinte, e mudar de separador atualiza o link para poderes partilhar ou guardar uma vista específica. Quem não é membro pode ler sem caixas de resposta a mais, e as tuas publicações mostram o teu nome e foto reais assim que as partilhas.",

  "changelog.entries.job-application-status.title":
    "Vê em que ponto estão as tuas candidaturas",
  "changelog.entries.job-application-status.body":
    "O acompanhamento de candidaturas mostra agora as tuas candidaturas reais (a que te candidataste, quando, e em que fase está cada uma) em vez de um exemplo. Abre qualquer cartão para rever as respostas que enviaste.",

  "changelog.entries.data-request-history.title":
    "O teu histórico de pedidos de dados, num só sítio",
  "changelog.entries.data-request-history.body":
    "A página de privacidade lista agora os teus pedidos de dados anteriores reais (acesso, correção, oposição e os restantes) com a respetiva referência e o estado atual, para poderes acompanhar um sem adivinhar.",

  "changelog.entries.community-settings-controls.title":
    "Guarda, arquiva ou transfere a tua comunidade",
  "changelog.entries.community-settings-controls.body":
    "Se geres uma comunidade, as definições do painel de moderação fazem agora o que dizem: editar o nome, a descrição e as regras da casa guarda mesmo, podes arquivar uma comunidade e podes transferir a propriedade para outro membro. Sem mais alterações que ficavam pelo caminho.",

  "changelog.entries.feed-keeps-loading.title":
    "O feed continua a carregar à medida que percorres",
  "changelog.entries.feed-keeps-loading.body":
    "O feed da comunidade parava após a primeira página. Agora carrega mais sozinho à medida que chegas ao fim, e há um “Carregar mais” acessível por teclado para quando preferires tocar.",

  "changelog.entries.faster-first-load.title":
    "Um primeiro carregamento mais rápido",
  "changelog.entries.faster-first-load.body":
    "Passámos a carregar cada parte dos textos da interface apenas quando um ecrã precisa deles, em vez de enviar tudo à partida. A aplicação abre visivelmente mais depressa, sobretudo no telemóvel ou numa ligação mais lenta.",

  "changelog.entries.readable-text-contrast.title":
    "Texto mais fácil de ler em toda a aplicação",
  "changelog.entries.readable-text-contrast.body":
    "Um conjunto de legendas, dicas e etiquetas ténues (nas coleções, no seletor de GIFs, nos cartões de perfil e nalguns outros pontos) estava demasiado claro sobre o fundo. Passam a cumprir o contraste acessível, tanto no modo claro como no escuro.",

  "changelog.entries.ios-splash-screens.title":
    "Um ecrã de arranque cuidado no iPhone",
  "changelog.entries.ios-splash-screens.body":
    "Quando abres o QueerPulse a partir do ecrã principal do iPhone, mostra agora um ecrã de arranque com a marca enquanto inicia, em vez de um flash branco. As notificações no Android passam também a ter um emblema mais limpo.",

  "changelog.entries.removed-content-stays-hidden.title":
    "O conteúdo removido fica escondido em todo o lado",
  "changelog.entries.removed-content-stays-hidden.body":
    "Quando um moderador remove algo, isso desaparece agora de forma consistente em todos os sítios onde poderia aparecer (incluindo mensagens diretas, anúncios de negócios e de habitação, e personas), e as mensagens removidas deixam de contar para os teus emblemas de não lidas.",

  "changelog.entries.help-demo-example-live-hidden.title":
    "Os painéis de ajuda deixam de mostrar exemplos da demo no modo real",
  "changelog.entries.help-demo-example-live-hidden.body":
    "A ajuda “Sobre este ecrã” terminava com um exemplo “Na demo” mesmo no modo real, onde esses dados de exemplo não existem. Esse aparte passa a surgir apenas quando estás a explorar a demo.",

  "changelog.entries.smaller-help-icon.title":
    "Um ícone de ajuda “Sobre este ecrã” mais pequeno",
  "changelog.entries.smaller-help-icon.body":
    "O pequeno ícone de ajuda ⓘ ao lado do título de uma página crescia com o título e podia parecer demasiado grande junto aos grandes títulos de destaque. Agora tem um tamanho discreto e consistente em todos os ecrãs.",

  "changelog.entries.community-rules-and-tags-polish.title":
    "Regras da casa e etiquetas mais claras nos detalhes da comunidade",
  "changelog.entries.community-rules-and-tags-polish.body":
    "As regras da casa de uma comunidade passam a mostrar o texto correto em vez de um código interno, e as etiquetas no fim da página Sobre mantêm-se legíveis no modo escuro.",

  "changelog.entries.co-owned-subprofiles.title":
    "Partilha a responsabilidade por uma persona",
  "changelog.entries.co-owned-subprofiles.body":
    "Há trabalho que não é feito sozinho: um dueto de DJs, uma banda, um estúdio a dois. Agora podes convidar outra pessoa membro para ser responsável conjunta de um subperfil: assim que aceitar, as duas passam a geri-lo por completo, ele aparece nos perfis de ambas, e qualquer uma pode convidar mais alguém, sair, ou editar o que é partilhado. Eliminar uma persona partilhada agora avisa logo quantas pessoas isso afeta.",

  "changelog.entries.smoother-mobile-navigation.title":
    "Uma forma mais suave de navegar no telemóvel",
  "changelog.entries.smoother-mobile-navigation.body":
    "Navegar na QueerPulse no telemóvel devia parecer fluido. A barra de separadores no fundo do ecrã fica agora s",

  "changelog.entries.no-sideways-scroll-on-mobile.title":
    "As páginas voltam a deslizar de cima para baixo no telemóvel",
  "changelog.entries.no-sideways-scroll-on-mobile.body":
    "Nalguns telemóveis, uma página podia fugir para o lado e parecer presa: tudo parecia demasiado largo e apertado, e o ecrã inteiro deslizava para a esquerda e para a direita em vez de subir e descer. Isto está corrigido em toda a aplicação. Links, nomes de utilizador e palavras compridas passam agora para a linha seguinte em vez de esticar um cartão para além da borda do ecrã, e a página é mantida à largura do teu telemóvel, para que só deslize como deve ser: para baixo.",

  "changelog.entries.no-placeholder-people-in-live.title":
    "O modo ao vivo agora mostra apenas pessoas reais",
  "changelog.entries.no-placeholder-people-in-live.body":
    "Alguns cantos da QueerPulse mostravam discretamente pessoas de exemplo da demonstração a membros reais: um diretório de bem-estar com terapeutas inventados, uma candidatura a emprego que chegava pré-preenchida com o nome e o email de outra pessoa, e histórias da revista assinadas por autores fictícios. Isto está corrigido. Vais passar a ver conteúdo real onde ele existe, os teus próprios dados onde um formulário os pede, e uma nota honesta de “ainda em construção” onde algo ainda não está pronto, nunca um substituto a fingir ser uma pessoa.",

  "changelog.entries.honest-roadmap-promises.title":
    "O roteiro agora cumpre promessas, e diz que não, com sinceridade",
  "changelog.entries.honest-roadmap-promises.body":
    "Quando algo no roteiro tem o selo Assumido, isso é uma promessa a sério. Se a data alguma vez mudar, vais ver o motivo real, publicado ali mesmo, em vez de desaparecer em silêncio. Há também uma nova lista “Não vamos construir isto, e porquê”, para que um pedido que não vai avançar receba uma resposta honesta em vez de silêncio. Por trás disto, as ferramentas de roteiro da equipa foram completamente reconstruídas: um quadro a sério para mover o trabalho da ideia até ao lançamento, uma linha do tempo, e uma fila real para ler e responder ao que os membros pedem, para que o que vês aqui se mantenha atual.",

  "changelog.entries.invite-resend-and-qr.title":
    "Reenvia um convite que expirou, e partilha-o com um código QR",
  "changelog.entries.invite-resend-and-qr.body":
    "Um convite que expirou antes de a tua amiga lá chegar já não obriga a começar do zero. Abre os teus convites enviados, toca em “Enviar de novo” no que expirou, e o mesmo link volta a funcionar por mais uma semana. Cada convite que geras passa também a incluir um código QR, para que alguém possa entrar bastando lê-lo diretamente do teu telemóvel, à mesa ou num evento, sem link para copiar. E se um convite foi endereçado a outro email, ou se quem te convidou já não está na QueerPulse, passas a receber uma explicação clara e gentil em vez de um erro confuso.",
  "changelog.entries.invite-resend-and-qr.tag": "Convidar alguém",

  "changelog.entries.smoother-onboarding-first-minutes.title":
    "Um acolhimento mais suave nos teus primeiros minutos",
  "changelog.entries.smoother-onboarding-first-minutes.body":
    "Preparar o teu espaço ficou mais gentil. Se te afastares a meio, passamos a lembrar-nos de onde estavas e retomamos aí mesmo, em vez de recomeçar do início. As etiquetas de “aqui para” que escolhes aparecem no teu perfil desde o início, e voltar ao acolhimento nunca as vai apagar sem querer. Percorrer os passos com teclado ou leitor de ecrã coloca-te agora no sítio certo de cada vez, e podes recuar uma página sempre que quiseres uma segunda vista.",

  "changelog.entries.events-open-at-top.title": "Eventos abre no topo",
  "changelog.entries.events-open-at-top.body":
    "Abrir Eventos (ou qualquer separador) começa agora sempre no topo da página. Antes deixava-te no ponto onde tinhas feito scroll da última vez, o que, na capa alta de Eventos, te deixava preso a meio da página. Carregar no botão Voltar do navegador continua a levar-te exatamente para onde estavas.",
  "changelog.entries.events-open-at-top.tag": "Ver eventos",

  "changelog.entries.chat-header-tap-to-profile.title":
    "Um cabeçalho de conversa mais tranquilo",
  "changelog.entries.chat-header-tap-to-profile.body":
    "O topo de uma conversa funciona agora como esperarias: toca no nome ou na foto da pessoa para abrir o perfil dela, sem precisares de um botão à parte. O arranjo também ficou mais limpo, com os controlos de informação e de mensagens marcadas reunidos num par arrumado no canto, em vez de ficarem soltos fora do sítio.",
  "changelog.entries.chat-header-tap-to-profile.tag": "Abrir mensagens",

  "changelog.entries.sheet-close-scroll-jump-fix.title":
    "Sem mais saltos de volta ao topo",
  "changelog.entries.sheet-close-scroll-jump-fix.body":
    "Se abrisses a folha da tua conta a meio de uma página e a fechasses, a página às vezes saltava de volta para o topo, perdendo o teu lugar. Agora fica exatamente onde a deixaste.",

  "changelog.entries.mobile-account-you-tab.title":
    "A tua conta, a um toque no telemóvel",
  "changelog.entries.mobile-account-you-tab.body":
    "No telemóvel, tocar na tua foto na barra inferior abre agora um espaço só teu: o teu perfil, as tuas ligações, os lugares que guardaste, as tuas candidaturas e as definições, reunidos numa folha organizada em vez de espalhados por um menu comprido. As mensagens subiram para o topo, ao lado das notificações, para que as pessoas com quem falas estejam sempre à mão, e o menu «Mais» passa a servir apenas para explorar o resto da QueerPulse.",

  "changelog.entries.instagram-style-mobile-profile.title":
    "O teu perfil, redesenhado para o telemóvel",
  "changelog.entries.instagram-style-mobile-profile.body":
    "No telemóvel, o teu perfil abre agora como as aplicações que já conheces: um avatar compacto envolto num anel suave em gradiente do orgulho, uma linha de estatísticas que se lê num relance (avais, comunidades, personas), uma faixa com as tuas personas em destaque logo no topo, e o resto do perfil organizado em secções por separadores que deslizas, em vez de uma única lista comprida.",

  "changelog.entries.forum-upvotes-tags-search.title":
    "O fórum cresceu: votos, etiquetas, pesquisa e tópicos que se podem fechar",
  "changelog.entries.forum-upvotes-tags-search.body":
    "Os comuns ganharam um conjunto de ferramentas a sério. Podes agora votar a favor de um tópico ou de uma resposta de verdade, para que as respostas que as pessoas acharam mais úteis subam para onde as vês. Ordena o quadro por Ativos ou Sem resposta, além de Melhores e Recentes, para encontrares as conversas que precisam de uma voz ou as que ainda esperam a primeira resposta. Ao começares uma publicação podes juntar algumas etiquetas como #habitação ou #saúde, e ao tocar numa etiqueta filtras todo o quadro para esse tema. Há agora uma caixa de pesquisa, para procurares um tópico em vez de o teres de rolar até o encontrar. E a moderação pode fechar um tópico a novas respostas quando uma conversa já deu o que tinha a dar. Continua legível, apenas em pausa.",
  "changelog.entries.forum-upvotes-tags-search.tag": "Abrir o fórum",
  "changelog.entries.list-business-wizard-overhaul.title":
    "Adicionar o teu espaço ao diretório ficou bem mais fácil",
  "changelog.entries.list-business-wizard-overhaul.body":
    "Reconstruímos todo o fluxo de “listar um negócio”. Se só estás a recomendar um sítio de que gostas, passamos a pedir apenas o que realmente podes saber (um nome, onde fica e uma frase sobre o porquê) em vez de exigir dados de quem gere o espaço e horários que não tens. Não tens um link do Google Maps para colar? Escreve a morada e toca em “Localizar esta morada”, ou coloca um pino no bairro e ajusta-o. Nunca ficas preso. Os horários passam a lidar com pausas de almoço e noites que vão para lá da meia-noite, e à medida que escreves o nome verificamos o diretório real para não adicionares um espaço que já lá está. O teu progresso vai sendo guardado e agora acompanha-te entre dispositivos, para começares no telemóvel e terminares no portátil. Cada negócio ganha também uma forma clara de reivindicar a sua própria listagem ou de contestar uma adicionada sem o seu consentimento, e qualquer pessoa continua a poder sinalizar uma listagem que não devia estar ali.",
  "changelog.entries.list-business-wizard-overhaul.tag": "Listar o teu espaço",
  "changelog.entries.mobile-experience-pass.title":
    "Toda a app, à medida do teu polegar",
  "changelog.entries.mobile-experience-pass.body":
    "Passámos ecrã a ecrã para que o QueerPulse funcione bem com uma só mão. Os botões, etiquetas e interruptores estão maiores e mais fáceis de tocar, e os menus, filtros e caixas de diálogo sobem agora a partir do fundo do ecrã como painéis que podes afastar com um gesto, mesmo onde o teu polegar já está. Há uma seta de voltar clara no topo de cada página, mesmo sem instalar a app, e quando abres uma conversa ela ocupa o ecrã inteiro para nada te atrapalhar, com a caixa de mensagem sempre logo acima do teclado. As histórias em slides, o calendário de eventos, os filtros do diretório e as ferramentas de administração leem-se agora com conforto no telemóvel, na vertical, sem ampliar nem arrastar para os lados.",

  "changelog.entries.magazine-deck-authoring.title":
    "As pessoas editoras já podem criar os seus próprios decks interativos",
  "changelog.entries.magazine-deck-authoring.body":
    "O formato de slide-deck interativo da primeira página da revista costumava ser montado à mão. Agora as pessoas editoras têm uma ferramenta de criação completa, direto no painel. Adiciona slides em cinco modelos (texto, imagem a toda a largura, uma estatística grande e animada, um comparador antes-e-depois, ou um momento para tocar e revelar), preenche a assinatura e os metadados, e pré-visualiza exatamente como quem lê vai ver. Guarda um rascunho enquanto ainda estás a moldá-lo, e publica quando estiver pronto: aparece com a etiqueta “Interativo” na primeira página da revista.",

  "changelog.entries.listings-moderation-console.title":
    "A fila de listagens ganhou uma consola de moderação a sério",
  "changelog.entries.listings-moderation-console.body":
    "Rever submissões do diretório é agora mais rápido: a fila tem paginação real, pesquisa por nome, autor ou referência, e ordenação por mais recentes, mais antigas ou nome, com uma contagem em direto para cada estado. Os moderadores podem selecionar várias submissões de uma vez para publicar, devolver a revisão ou remover em conjunto, e cada linha mostra agora há quanto tempo uma listagem está à espera, para que nada fique esquecido. Devolver ou remover uma listagem pode agora levar um motivo curto para o registo, e abrir a pré-visualização de uma listagem mostra o histórico completo de moderação, junto com qualquer fio de perguntas e respostas com quem a submeteu. Uma fila vazia finalmente parece uma boa notícia, com a sua própria ilustração em vez de um espaço em branco.",

  "changelog.entries.magazine-slide-decks.title":
    "Histórias em slide-deck interativo, já na revista",
  "changelog.entries.magazine-slide-decks.body":
    "Algumas histórias da revista já podem ser lidas em formato de slide-deck: slides em ecrã inteiro que percorres como numa apresentação, com texto, fotografias em página inteira, números grandes e animados, comparações de antes-e-depois e momentos que revelas ao tocar. Abre “Apresentar” para uma leitura em ecrã inteiro, sem distrações. Procura a etiqueta “Interativo” na primeira página da revista. A primeira, “Ten years in Mouraria”, já está disponível.",

  "changelog.entries.real-notification-settings.title":
    "Definições de notificações que finalmente fazem alguma coisa",
  "changelog.entries.real-notification-settings.body":
    "Os botões em Definições → Notificações eram só para inglês ver, e mudá-los não fazia nada. Agora são reais: liga ou desliga, por tipo, os convites para encontros, os lembretes de presença, os avisos de novas mensagens, os pedidos de ligação e as respostas em tópicos, e a tua escolha é guardada e respeitada em todo o lado, incluindo as notificações push no telemóvel. As mensagens de segurança e de conta (moderação, recursos, alterações à conta) chegam sempre e não ficam escondidas atrás de um botão. Algumas linhas ainda sem funcionalidade por trás continuam honestamente marcadas como “em breve”, em vez de fingirem funcionar.",
  "changelog.entries.platform-wide-search.title":
    "A pesquisa passa a abranger toda a plataforma",
  "changelog.entries.platform-wide-search.body":
    "A pesquisa global chegava apenas a membros, comunidades, eventos, tópicos do fórum e negócios. Agora inclui também artigos da revista, empregos, anúncios de habitação, recursos, workshops e subperfis, por isso uma só pesquisa encontra o que procuras onde quer que esteja, tanto em inglês como em português.",
  "changelog.entries.save-events-communities.title":
    "Guarda eventos e comunidades, e guardados que ficam mesmo guardados",
  "changelog.entries.save-events-communities.body":
    "Agora podes guardar um encontro ou uma comunidade na tua coleção com o mesmo marcador que já usas noutros sítios. Corrigimos também dois botões de Guardar (na página de detalhe de um emprego e nas curtas-metragens) que pareciam funcionar mas esqueciam tudo assim que saías. Todos os guardados passam a persistir na tua coleção.",
  "changelog.entries.invite-revoke-oversight.title":
    "Recupera um convite que enviaste",
  "changelog.entries.invite-revoke-oversight.body":
    "Mudaste de ideias sobre um convite? Agora podes revogar um convite pendente a partir da tua lista de enviados e a ligação deixa de funcionar de imediato. Os administradores passam também a ter uma vista de Convites de toda a plataforma, para ver cada convite e o seu estado, com filtros à mão.",
  "changelog.entries.moderation-completeness.title":
    "Um conjunto de ferramentas de moderação mais completo",
  "changelog.entries.moderation-completeness.body":
    "Os moderadores passam a poder remover o perfil de um membro e avaliações de negócios individuais, para lá de publicações e anúncios. Um perfil ou avaliação removido deixa de aparecer aos restantes (e uma avaliação removida deixa de contar para a classificação de um local). Os moderadores podem também levantar uma suspensão e reintegrar um membro diretamente, em vez de ser só através do processo de recurso.",
  "changelog.entries.account-media-safety.title":
    "Nomes de utilizador mais seguros, armazenamento mais limpo",
  "changelog.entries.account-media-safety.body":
    "Algumas melhorias discretas de segurança. Quando mudas de nome de utilizador, o antigo fica reservado para ti durante 30 dias antes de outra pessoa o poder usar, para que um nome libertado não seja agarrado de imediato e as antigas menções @ não sejam silenciosamente redirecionadas para um estranho. As fotografias que substituis (avatares, imagens de anúncios, imagens de publicações) passam a ser apagadas do armazenamento em vez de ficarem para trás, as imagens de um membro suspenso deixam de ser mostradas aos outros, e concluir a introdução regista a tua concordância com as diretrizes da comunidade.",
  "changelog.entries.legal-notice-imprint.title":
    "Uma página de aviso legal (imprint)",
  "changelog.entries.legal-notice-imprint.body":
    "Adicionámos uma página de Aviso Legal na secção de Políticas, ligada a partir do rodapé, que indica quem opera a QueerPulse e como nos contactar: o tipo de imprint esperado de um serviço a operar na Europa.",
  "changelog.entries.messages-list-virtualization.title":
    "As conversas longas agora deslizam de forma suave, por maiores que fiquem",
  "changelog.entries.messages-list-virtualization.body":
    "Uma conversa muito longa ou muito ativa mantinha na página, ao mesmo tempo, todas as mensagens já carregadas, o que podia tornar o deslizar mais pesado quanto mais a conversa crescia. As mensagens agora só são desenhadas na página perto do que estás mesmo a ver, por isso uma conversa com milhares de mensagens fica tão leve como uma acabada de começar. Carregar histórico mais antigo, saltar para uma resposta e deslizar até à mensagem mais recente continuam a levar-te exatamente onde esperarias.",
  "changelog.entries.live-mode-honesty-sweep.title":
    "Sem pessoas de exemplo, confirmações falsas ou botões sem saída",
  "changelog.entries.live-mode-honesty-sweep.body":
    "Uma ronda de honestidade em toda a plataforma para que nada do que vês seja inventado e nada em que toques finja funcionar. Páginas ainda em protótipo (partes da página inicial, a revista, os diretórios de terapeutas e clínicas, as trocas de competências, a incubadora e as ferramentas de eventos) mostram agora um “em breve” claro em vez de membros, eventos, prestadores “verificados” ou estatísticas inventados. Formulários que ainda não tinham destino (contacto, newsletter, preferências de cookies, candidaturas a micro-bolsas e painéis, apoios a espaços seguros, resgate de benefícios e ações de administração como publicar/exportar) já não mostram um falso “concluído”: ou guardam a sério ou dizem-te honestamente que ainda não estão abertos, e as escolhas de cookies ficam mesmo guardadas. Os diretórios de saúde e apoio jurídico, em particular, nunca mostrarão um prestador não verificado como se o tivéssemos avaliado.",
  "changelog.entries.frontend-reliability-hardening.title":
    "Menos rascunhos perdidos, estados de erro honestos e dispositivos partilhados mais seguros",
  "changelog.entries.frontend-reliability-hardening.body":
    "Uma ronda de correção em toda a aplicação para que nada perca o teu trabalho em silêncio nem te induza em erro. Sair de um evento, comunidade ou edição de perfil a meio agora avisa-te antes de as alterações desaparecerem, e as Definições já não descartam edições quando sais do ecrã. Quando algo corre mal, vês uma mensagem honesta com opção de tentar de novo em vez de um carregamento eterno ou um falso “concluído”, e uma oscilação passageira na ligação já não te incomoda com um aviso de erro sobre dados que já estás a ver. Num dispositivo partilhado, os teus itens guardados, rascunhos e apoios ficam agora separados por conta e são limpos quando terminas a sessão, para que a pessoa seguinte nunca veja as tuas coisas; e o botão “Seguir uma autora” só aparece onde seguir realmente funciona. Nos bastidores, a aplicação também recupera com elegância de uma resposta inválida ou de um separador desatualizado em vez de mostrar um ecrã de erro.",
  "changelog.entries.screen-help-signs.title":
    "Ajuda “Sobre este ecrã” em cada funcionalidade",
  "changelog.entries.screen-help-signs.body":
    "Novo numa parte da QueerPulse? Procura o pequeno botão de informação ⓘ ao lado do título do ecrã. Toca nele e um cartão curto e amigável explica para que serve o ecrã, como o usar e dá um exemplo concreto, para teres sempre a noção de como cada funcionalidade encaixa na plataforma. Está presente nos ecrãs principais (Membros, Comunidades, Fórum, Eventos, Mensagens, o diretório local, alojamento, trabalho, cultura, definições e mais), em português e inglês, e nunca atrapalha: abre-o quando quiseres, ignora-o quando não precisares.",
  "changelog.entries.performance-cost-hardening.title":
    "Pesquisa mais rápida, uploads mais leves e páginas movimentadas mais estáveis",
  "changelog.entries.performance-cost-hardening.body":
    'Uma passagem nos bastidores para manter o QueerPulse rápido e sustentável à medida que enche. A pesquisa global passa a usar índices de texto adequados, por isso encontrar pessoas, comunidades, eventos, anúncios e tópicos continua rápido por muitos membros que entrem, em vez de abrandar à medida que a plataforma cresce. As fotos que carregas são redimensionadas com cuidado antes de saírem do teu dispositivo, por isso publicar é mais rápido nos dados móveis e as páginas carregam mais leves para toda a gente. Tópicos movimentados de comunidades, listas de membros e listas de convidados de eventos passam a carregar por páginas, com um botão "carregar mais", em vez de trazerem tudo de uma vez, e as páginas populares que toda a comunidade partilha podem agora ser servidas a partir da cache em vez de reconstruídas sempre. Os lembretes de eventos e as notificações push saem num único lote eficiente, as imagens no topo de uma página carregam primeiro para uma primeira renderização mais ágil, e mudar de página a meio de um carregamento já não desperdiça um pedido. As listas longas (o diretório local e os tópicos movimentados do fórum) passam a revelar mais à medida que fazes scroll, em vez de renderizarem tudo de uma vez, por isso mantêm-se fluidas no telemóvel. Nada do que vês muda; só aguenta melhor com muita gente.',
  "changelog.entries.accessibility-i18n-pwa-hardening.title":
    "Acessibilidade, tradução e melhorias offline",
  "changelog.entries.accessibility-i18n-pwa-hardening.body":
    "Uma revisão para que o QueerPulse funcione para mais gente, em mais sítios. Todos os campos de formulário passam a anunciar a sua etiqueta aos leitores de ecrã, por isso registares-te, publicares uma vaga, pagares ou editares o teu perfil ficam limpos com tecnologia de apoio. Partilhar um link mostra finalmente uma imagem de pré-visualização em vez de uma miniatura partida. Se perderes a ligação, tens uma página offline a sério, em vez do erro do navegador, e a app instala mais leve e atualiza com uma etiqueta que espera por ti em vez de um aviso que desaparece. Os avisos passam a poder ser dispensados e pausam enquanto os lês; remover alguém de um grupo pergunta primeiro; os botões são um pouco maiores para tocar; e as horas das mensagens, mais algumas etiquetas soltas, seguem agora o idioma que escolheste, em inglês e português.",
  "changelog.entries.launch-hardening-p1.title":
    "Reforço de segurança, honestidade e fiabilidade",
  "changelog.entries.launch-hardening-p1.body":
    "Uma revisão ampla antes do lançamento. Bloquear alguém passa a travá-lo mesmo em todo o lado: deixam de passar mensagens, presença, «está a escrever» ou notificações push, e o teu perfil fica escondido de quem bloqueaste. O modo live diz a verdade: páginas que mostravam pessoas fictícias ou fingiam uma submissão passam a usar dados reais ou a dizer claramente quando algo ainda não está pronto, e pedir os teus dados (RGPD) é agora um pedido real. Editar, cancelar ou confirmar presença num convívio, e sair de uma comunidade, atualizam já o ecrã; uma falha mostra a opção de tentar de novo em vez de uma página vazia. E quando ainda não te conseguimos enviar email, deixámos de fingir que o faremos.",
  "changelog.entries.remove-listings-from-moderation.title":
    "Moderadores podem remover listagens do diretório",
  "changelog.entries.remove-listings-from-moderation.body":
    "A fila de revisão de listagens passa a ter uma ação Remover, para um moderador eliminar permanentemente uma submissão de spam, duplicada ou inapropriada em vez de apenas a devolver para revisão. Remover uma listagem live também a retira do diretório público. Cada remoção pede confirmação primeiro.",

  "changelog.entries.sent-invites-status-filter.title":
    "Filtra por estado os convites que enviaste",
  "changelog.entries.sent-invites-status-filter.body":
    "A lista de convites que já enviaste passa a ter separadores (Todos, Pendente, Aceite, Expirado), cada um com uma contagem, para saltares logo para os que ainda esperam resposta ou os que já foram aceites. Cada convite mostra também o dia e a hora exatos em que foi enviado e quando expira, em vez de apenas a data.",

  "changelog.entries.onboarding-one-time-guard.title":
    "Concluir a introdução agora fica guardado",
  "changelog.entries.onboarding-one-time-guard.body":
    "O percurso de boas-vindas que fazes logo após entrar é para acontecer uma só vez. Mas, se mais tarde o teu navegador preenchesse automaticamente o endereço da introdução, ele largava-te de novo no assistente como se nunca o tivesses feito, e avançar pelos passos podia repor em silêncio escolhas como os teus interesses em “Aqui por”. Agora registamos quando concluis a introdução e encaminhamos-te para o teu feed se voltares a cair nela, para que não se repita nem substitua o que já definiste.",

  "changelog.entries.trust-network-replay-by-joins.title":
    "A repetição da rede de confiança segue as pessoas",
  "changelog.entries.trust-network-replay-by-joins.body":
    "Na rede de confiança do painel de administração, a “Repetição” de como os avais se formaram ao longo do tempo avançava um mês de calendário de cada vez, arrastando-se por meses parados onde nada acontecia e passava a correr pelos mais movimentados. Agora percorre os momentos em que as pessoas foram efetivamente avalizadas, dando a cada evento real o mesmo tempo. O resultado acompanha o crescimento da comunidade em vez da passagem do calendário. Arrastar a barra da linha do tempo à mão funciona exatamente como antes.",
  "changelog.entries.trust-network-invite-vs-vouch.title":
    "Vê quem foi convidado e quem foi avalizado depois",
  "changelog.entries.trust-network-invite-vs-vouch.body":
    "A rede de confiança do painel de administração passa a mostrar as ligações de convite (pessoas que trouxeste tu próprio para a QueerPulse) numa cor distinta dos avais adicionados mais tarde, com uma legenda e etiquetas ao passar o rato para distinguires as duas facilmente.",
  "changelog.entries.chef-mixologist-therapist-personas.title":
    "Três novos tipos de persona: cozinha, coquetelaria e terapia",
  "changelog.entries.chef-mixologist-therapist-personas.body":
    "Já podes criar um subperfil de cozinha (menus + residências), de coquetelaria (cocktails + residências) ou de terapia (especialidades + credenciais), cada um com as suas secções, modelo inicial e filtro no diretório, a par dos ofícios que já existiam.",
  "changelog.entries.connections-card-polish.title":
    "Cartões de ligação mais arrumados",
  "changelog.entries.connections-card-polish.body":
    "Na tua página de ligações, a linha de “pessoas em comum” passa a aparecer corretamente em vez de mostrar formatação em bruto, e a data de “Ligação” mostra o dia e a hora em que se ligaram, para lá do mês e do ano.",
  "changelog.entries.lightbox-focus-a11y.title":
    "Gestão de foco mais limpa no visualizador de fotos",
  "changelog.entries.lightbox-focus-a11y.body":
    "Abrir uma foto em ecrã inteiro (nas galerias do diretório e nas páginas de encontros) deixa de deixar o foco do teclado preso na camada invisível de tocar-para-fechar por trás da imagem. O foco fica agora onde consegues vê-lo, o que mantém os leitores de ecrã e a navegação por teclado a funcionar sem falhas enquanto percorres as fotos.",
  "changelog.entries.directory-detail-polish.title":
    "Uma página de espaço redesenhada e mais rigorosa",
  "changelog.entries.directory-detail-polish.body":
    "As páginas de negócios do diretório foram reconstruídas com um layout mais claro: o espaço apresenta-se primeiro, com nome, categoria e os detalhes principais numa só linha, e só depois surge uma galeria compacta (uma foto principal com as restantes numa coluna clicável) em vez de um único banner enorme, com as ações principais mesmo ao lado do nome. Espaços novos passam a ler-se como “Novo” em vez de uma classificação vazia de zero estrelas. A par do redesenho: o “Aberto agora” é calculado pelo relógio do próprio espaço (e não pelo fuso horário do teu dispositivo), a linha de localização e os dados de pesquisa deixam de assumir que tudo fica em Lisboa, os links dos sites abrem sempre corretamente e mostram um domínio limpo, e as classificações por estrelas são lidas corretamente por leitores de ecrã. Quem não tem sessão iniciada pode agora guardar um espaço, quem gere um negócio pode reivindicar o seu registo, e um link errado ou removido mostra uma verdadeira página de “não encontrado” em vez de te devolver silenciosamente ao diretório.",
  "changelog.entries.review-author-avatars.title":
    "Vê quem deixou uma avaliação",
  "changelog.entries.review-author-avatars.body":
    "As avaliações na página de um espaço no diretório mostram agora a foto de quem escreveu, e o nome liga diretamente ao perfil da pessoa, por isso uma nota calorosa de alguém da comunidade fica a um toque de saberes mais sobre ela. As avaliações de quem não é membro continuam iguais, apenas sem a ligação.",
  "changelog.entries.verification-in-context.title":
    "A verificação passa a estar onde estás a explorar",
  "changelog.entries.verification-in-context.body":
    "“Como funciona a verificação” já não é um link escondido na navegação de topo. Passa a haver uma explicação curta no próprio diretório local (proposto, avaliado, reavaliado todos os anos) e uma linha discreta dentro de cada espaço verificado que remete para a história completa. O centro dos espaços seguros continua lá para os critérios completos e o registo de remoções; agora chega-se a ele em contexto, quando o emblema está mesmo à tua frente.",
  "changelog.entries.safe-spaces-in-directory.title":
    "Espaços seguros verificados, agora dentro do diretório",
  "changelog.entries.safe-spaces-in-directory.body":
    "O emblema de verificação aparece agora diretamente no cartão, dentro do diretório local, um filtro de “Espaços seguros verificados” mostra só os que o conquistaram, e os espaços verificados aparecem sempre primeiro na lista. Abre qualquer ficha para veres o bloco de confiança completo: o que a verificação significa para aquele espaço e quando foi avaliado pela última vez. E o /local/safe-spaces é agora o centro da verificação: o que o emblema significa, como funciona mesmo o processo de avaliação, e um registo honesto e público de todos os espaços que o perderam.",

  "changelog.entries.magazine-desk-polish-sweep.title":
    "Afinações na redação da revista",
  "changelog.entries.magazine-desk-polish-sweep.body":
    "Cores dos títulos agora consistentes no modo escuro, edição do deck certo diretamente a partir da redação, controlo da assinatura por atribuição para quem escreve, e outras pequenas limpezas.",

  "changelog.entries.magazine-piece-messaging.title":
    "Pessoas editoras e quem escreve já podem trocar mensagens diretamente na peça",
  "changelog.entries.magazine-piece-messaging.body":
    "Pessoas editoras e quem escreve trocam agora mensagens diretamente na peça: insistências e perguntas vivem ao lado do trabalho, e os dois lados veem sempre a conversa toda.",

  "changelog.entries.live-press-kit-real-data.title":
    "O kit de imprensa passa a mostrar cobertura, contactos e números reais",
  "changelog.entries.live-press-kit-real-data.body":
    "A cobertura e os contactos de imprensa do kit passam a vir do que a equipa realmente publica e mantém atualizado, e os números em destaque são retirados da própria plataforma, sem números inventados. Cada secção fica simplesmente escondida até haver algo real para mostrar.",
  "changelog.entries.communities-and-home-merged.title":
    "Comunidades, tudo num só lugar",
  "changelog.entries.communities-and-home-merged.body":
    "O teu hub de comunidades e o diretório de descoberta passam a viver juntos numa só página, /communities, com um interruptor Minhas comunidades / Descobrir no topo. Abre no teu hub quando já fazes parte de alguma comunidade, e em Descobrir quando ainda não fazes parte de nenhuma.",

  "changelog.entries.silent-session-recovery.title":
    "Sem o aviso de “sessão expirada” quando voltas",
  "changelog.entries.silent-session-recovery.body":
    "Ao voltares depois de algum tempo, podias ver aparecer por um momento um erro de “sessão expirada”, e mesmo assim ficares logo de novo autenticado. Essa mensagem estava a disparar sobre uma sessão que a app já estava a renovar em silêncio. Agora, quando conseguimos restaurar a tua sessão sozinhos, fazemo-lo em silêncio: sem erro, sem nada para ler, retomas simplesmente onde estavas. Só te diremos que a sessão terminou quando isso acontecer mesmo e tiveres de entrar de novo.",

  "changelog.entries.session-refresh-csrf-race.title":
    "Renovação de sessão mais suave quando o acesso expira",
  "changelog.entries.session-refresh-csrf-race.body":
    "Quando a tua sessão tinha expirado em silêncio, recarregar a página podia mostrar por um instante um estado de “sessão expirada” antes de te voltar a autenticar. Corrigimos uma condição de corrida na forma como a app renova a tua sessão, para que renove de forma limpa à primeira, sem oscilação e sem pedidos desperdiçados.",

  "changelog.entries.directory-category-unify.title":
    "Categorias do diretório coerentes em todo o lado",
  "changelog.entries.directory-category-unify.body":
    "Um espaço que adicionas mostra agora o pin da cor certa no mapa e a categoria certa no cartão e no filtro: o assistente de “listar um negócio” e o diretório passam finalmente a falar a mesma língua de categorias. A vida noturna também passa a ser uma categoria que podes escolher ao listar.",

  "changelog.entries.messages-badge-count.title":
    "Um contador de mensagens por ler mais rápido e certo",
  "changelog.entries.messages-badge-count.body":
    "O número de mensagens por ler no ícone de mensagens mantém-se agora correto em todas as páginas sem carregar silenciosamente a tua caixa de entrada inteira sempre que navegas. Atualiza-se em tempo real à medida que chegam mensagens e à medida que as lês.",

  "changelog.entries.notifications-coverage.title":
    "Notificações para o que andava a passar despercebido",
  "changelog.entries.notifications-coverage.body":
    "O teu sino avisa-te agora quando alguém confirma presença no teu convívio, responde à tua publicação ou tópico, pede para entrar na tua comunidade (e quando um pedido é decidido), se candidata à tua oferta de trabalho, avalia o teu negócio, quando um registo de negócio é aprovado, quando alguém que convidaste entra, quando uma denúncia ou recurso que apresentaste é resolvido, e quando uma ideia que partilhaste no roteiro muda de estado. Cada uma leva-te diretamente ao que lhe diz respeito.",

  "changelog.entries.gathering-create-fix.title":
    "Criar um convívio volta a funcionar, e leva-te ao teu evento",
  "changelog.entries.gathering-create-fix.body":
    "Publicar um novo convívio estava a falhar silenciosamente no servidor, mas o assistente mostrava na mesma o ecrã de celebração como se tivesse resultado, e o botão «Ver a página do teu evento» abria uma página de exemplo perdida. Ambos estão corrigidos: um convívio passa mesmo a ser publicado, o ecrã de sucesso só aparece depois de o ser, e «Ver a página do teu evento» leva-te diretamente ao teu convívio real. Se alguma publicação falhar, verás uma mensagem clara e ficas no passo de revisão para tentar de novo. O assistente passa também a pedir uma data e hora de início no futuro antes de avançares, para que nenhum convívio seja criado sem elas.",
  "changelog.entries.directory-collapsible-filters.title":
    "Filtros mais arrumados no diretório de espaços",
  "changelog.entries.directory-collapsible-filters.body":
    "A pesquisa e os botões de categoria continuam em destaque, enquanto os refinamentos de espaços seguros e de ambiente passam a ficar recolhidos atrás de um único botão “Refinar”, para que a barra deixe de sobrecarregar a página. Um contador no botão continua a indicar quando há filtros ocultos ativos, as tuas escolhas permanecem aplicadas, e a gaveta desliza suavemente ao abrir e fechar em vez de saltar, com a tua preferência de aberto/fechado guardada para a próxima visita.",
  "changelog.entries.members-collapsible-filters.title":
    "Filtros recolhíveis no diretório de membros",
  "changelog.entries.members-collapsible-filters.body":
    "Os filtros do diretório de membros agora são secções recolhíveis com um botão para mostrar/ocultar, libertando espaço para os resultados: as tuas seleções continuam aplicadas enquanto os filtros estão ocultos, e a tua vista fica guardada para a próxima visita. Abrir uma secção e ocultar a barra lateral inteira agora deslizam suavemente em vez de saltar.",
  "changelog.entries.activism-volunteer-merge.title":
    "Ativismo e Voluntariado são agora um só lugar",
  "changelog.entries.activism-volunteer-merge.body":
    "Juntámos as páginas de Ativismo e Voluntariado num único sítio. O Voluntariado é agora a porta de entrada: vê oportunidades reais em Lisboa, filtra por causa ou compromisso e começa com um par de horas livres. Se quiseres ir mais fundo, o nosso guia para organizar melhor fica a um toque de distância. A navegação, o rodapé e a barra lateral passam a ter uma única ligação «Ativismo e Voluntariado» em vez de duas, e o antigo endereço /activism continua a funcionar.",
  "changelog.entries.spaces-map-pins.title":
    "Os pinos do mapa mostram agora que tipo de espaço é cada lugar",
  "changelog.entries.spaces-map-pins.body":
    "No mapa do diretório Local, cada pino é agora uma gota colorida com um ícone da sua categoria (um copo de martini para a vida noturna, um garfo e faca para comida, um coração para saúde, e por aí fora), para leres o mapa num relance em vez de tocares em cada ponto. Os filtros de categoria têm a mesma cor e ícone, por isso a barra de filtros funciona também como legenda.",
  "changelog.entries.creatives-subprofile.title":
    "A montra Criativa é agora um subperfil criativo",
  "changelog.entries.creatives-subprofile.body":
    "O diretório Criativo autónomo foi descontinuado. Mostrar a tua arte, música ou outro trabalho criativo passa a viver nos subperfis, o mesmo sítio onde constróis qualquer persona ligada, por isso um perfil criativo faz parte de quem és na QueerPulse, em vez de ser uma lista à parte. O antigo link /magazine/creatives leva-te agora diretamente aos teus subperfis, onde podes adicionar um criativo.",
  "changelog.entries.moderation-takedowns.title":
    "Ocultar e remover da moderação passam mesmo a retirar o conteúdo",
  "changelog.entries.moderation-takedowns.body":
    'Quando um moderador oculta ou remove conteúdo denunciado, este desaparece agora realmente da vista pública. O conteúdo oculto fica retido para os membros, mas a equipa continua a vê-lo; o conteúdo removido mostra uma marca clara de "removido por um moderador", onde uma publicação eliminada já apareceria. Aplicado a publicações e respostas do fórum, publicações e respostas de comunidades, comunidades, eventos e fichas de negócios, registado no mesmo passo da decisão do moderador, para que nunca possa ficar registado sem produzir efeito.',
  "changelog.entries.directory-photos-crisp.title":
    "As fotos de capa das fichas voltam a carregar nítidas",
  "changelog.entries.directory-photos-crisp.body":
    "As fotos de capa das fichas de negócios, e a pré-visualização enquanto adicionas uma, carregavam em baixa resolução e ficavam desfocadas quando mostradas em tamanho grande. Passam agora a carregar nítidas em tamanho real. Também descemos o cabeçalho da ficha para que o caminho de navegação e o botão Editar do proprietário deixem de ficar por baixo da navegação flutuante.",
  "changelog.entries.admin-role-management.title":
    "Os admins podem promover moderadores e admins a partir do painel",
  "changelog.entries.admin-role-management.body":
    "Tornar alguém moderador ou admin implicava editar a base de dados à mão. Agora um admin pode conceder ou remover esses papéis diretamente no detalhe de um membro no painel de administração, com as proteções que importam já incluídas: não podes mudar o teu próprio papel, a conta oficial está fora de alcance e a plataforma nunca te deixa remover o último admin. Cada alteração fica registada no histórico de auditoria.",
  "changelog.entries.appeal-submission.title":
    "Já podes contestar uma decisão de moderação",
  "changelog.entries.appeal-submission.body":
    "Uma conta suspensa ou banida conseguia ler sobre recursos mas não tinha forma de apresentar um. Agora, qualquer membro sob uma decisão de moderação (um aviso, uma remoção, uma suspensão, um banimento) pode enviar um recurso diretamente do ecrã da sua conta, e este vai para um moderador que não esteve envolvido na decisão original. Um recurso em aberto de cada vez; a decisão original mantém-se enquanto é analisado.",
  "changelog.entries.honest-report-failures.title":
    "As denúncias de segurança dizem-te a verdade quando não são enviadas",
  "changelog.entries.honest-report-failures.body":
    "Quando uma denúncia, sinalização ou preocupação sobre um espaço seguro não chega até nós (uma ligação em falha, um problema no servidor), passas a ver um erro honesto e as tuas palavras ficam no formulário para tentares de novo, em vez de um falso «recebida». Se dizemos que uma denúncia chegou, chegou mesmo. Isto abrange também enviar mensagem a quem anuncia alojamento e anunciar um espaço.",
  "changelog.entries.directory-filters-and-accurate-recognition.title":
    "Filtros de membros que filtram mesmo, e emblemas e vantagens honestos",
  "changelog.entries.directory-filters-and-accurate-recognition.body":
    "Escolher um filtro no diretório de membros passa a mostrar quem corresponde, em vez de esvaziar a página. As páginas de Emblemas e Vantagens também apresentam um estado próprio de carregamento, vazio ou de tentar novamente enquanto o teu reconhecimento carrega, sem contagens fictícias a fazer de conta que são reais.",
  "changelog.entries.navigation-resilience.title":
    "O voltar atrás guarda o teu lugar, e a app aguenta as atualizações",
  "changelog.entries.navigation-resilience.body":
    "Ao voltares atrás depois de abrires algo de uma lista, ficas exatamente onde tinhas o scroll, em vez de saltar para o topo. Se a tua sessão expirar sem aviso, dizemos-te para poderes iniciar sessão outra vez, e quando sai uma versão nova a meio da visita a app atualiza-se sozinha em vez de mostrar um erro.",
  "changelog.entries.search-page-launcher.title":
    "Salta para qualquer lado a partir da pesquisa",
  "changelog.entries.search-page-launcher.body":
    "A pesquisa (⌘K e a página de pesquisa) passa a funcionar também como atalho: começa a escrever, ou simplesmente abre-a, para saltar direto para Membros, Comunidades, Eventos, Mensagens, o teu perfil, Definições, a Revista e muito mais, cada um com o seu ícone. Um novo separador Páginas reúne todos os destinos num só lugar.",
  "changelog.entries.donate-honest-live.title":
    "As doações são honestas sobre o pré-lançamento",
  "changelog.entries.donate-honest-live.body":
    "O fluxo de doação deixou de recolher dados do cartão para um pagamento que não podia mesmo ser cobrado. Até os pagamentos seguros estarem prontos, di-lo claramente e mostra exatamente para onde vai o dinheiro da comunidade.",
  "changelog.entries.gathering-manage-coming-soon.title":
    "O painel de anfitrião é uma pré-visualização honesta",
  "changelog.entries.gathering-manage-coming-soon.body":
    "O painel de anfitrião de encontros era um protótipo de demonstração, por isso em modo ao vivo mostra agora um claro “em breve” em vez de agir sobre dados de exemplo. Explorar e confirmar presença estão totalmente ativos; explora as ferramentas de anfitrião em modo de demonstração.",
  "changelog.entries.search-member-avatars.title": "Veja quem está a procurar",
  "changelog.entries.search-member-avatars.body":
    "Os resultados de membros na pesquisa (⌘K e a página de pesquisa) mostram agora a foto de perfil de cada pessoa em vez de um ícone genérico, para reconheceres de relance o rosto que procuras.",
  "changelog.entries.search-real-topics.title":
    "A pesquisa mostra agora resultados reais",
  "changelog.entries.search-real-topics.body":
    "A pesquisa (⌘K e a página de pesquisa) já não recorre a tópicos de exemplo com contagens de publicações inventadas. Passa a mostrar os tópicos reais em destaque e as contagens de publicações reais, a par de pessoas, comunidades, eventos, tópicos do fórum e negócios reais.",
  "changelog.entries.global-search.title": "Pesquisa em toda a QueerPulse",
  "changelog.entries.global-search.body":
    "Pesquisa pessoas, comunidades, eventos, o fórum e negócios locais, de qualquer lugar, com ⌘K ou a página de pesquisa.",
  "changelog.entries.studio-coming-soon.title":
    "O Studio é agora uma pré-visualização honesta",
  "changelog.entries.studio-coming-soon.body":
    "O Studio de música em cooperativa ainda está na oficina, por isso deixou de mostrar pagamentos e números de exemplo como se fossem reais. Explora-o por inteiro no modo demo; em modo live passas a ver um claro “em breve”.",
  "changelog.entries.cinema-honest-live.title":
    "O Cinema é honesto sobre o que está ativo",
  "changelog.entries.cinema-honest-live.body":
    "O catálogo de filmes e a reprodução são reais, por isso as partes ainda em produção (coleções, perfis de realizadores, convites abertos) passam a dizer “em breve” em modo live em vez de mostrar conteúdo de exemplo. Explora tudo no modo demo.",
  "changelog.entries.cinema-live-streaming.title":
    "O Cinema agora transmite filmes reais",
  "changelog.entries.cinema-live-streaming.body":
    "O Cinema está ativo: explora o programa real e carrega em play para ver o filme, e da próxima vez retoma exatamente de onde paraste.",
  "changelog.entries.employer-reviews-live.title":
    "Avaliações de empregadores, a sério",
  "changelog.entries.employer-reviews-live.body":
    "A página de avaliações de empregadores mostra agora empregadores inclusivos reais: abre qualquer empresa para ver o perfil completo e as avaliações, e escreve a tua própria avaliação anónima de um sítio onde trabalhaste.",
  "changelog.entries.block-mute-from-profile.title":
    "Bloqueia ou silencia diretamente a partir do perfil",
  "changelog.entries.block-mute-from-profile.body":
    "Um novo menu de segurança no cabeçalho do perfil permite silenciar alguém (escondendo discretamente as publicações) de imediato, ou bloquear após uma confirmação rápida, com a opção de também denunciar ao mesmo tempo.",
  "changelog.entries.event-push-reminders.title":
    "Escolhe quando chegam os teus lembretes de eventos",
  "changelog.entries.event-push-reminders.body":
    "As preferências de eventos passam a deixar-te escolher com que antecedência és lembrade (uma hora, um dia ou uma semana antes) e ativar um push no telemóvel para o lembrete te chegar onde estiveres.",
  "changelog.entries.report-more-surfaces.title":
    "Denuncia tudo o que não te parecer certo",
  "changelog.entries.report-more-surfaces.body":
    "Passas a poder denunciar um evento, um negócio, uma empresa, uma vaga ou a persona pública de um membro: um link discreto “Denunciar” abre o mesmo fluxo confidencial usado no resto da plataforma, e as denúncias de eventos passam a ser realmente enviadas à equipa de segurança, em vez de apenas confirmadas.",
  "changelog.entries.profile-photo-pronouns.title":
    "A tua cara, as tuas palavras",
  "changelog.entries.profile-photo-pronouns.body":
    "Editar Perfil passa a deixar-te carregar uma foto personalizada, com pré-visualização instantânea, em vez de usares só a imagem do Google, e podes escrever os teus próprios pronomes ao lado das opções predefinidas. Também retirámos os marcadores “brevemente” que ainda não faziam nada.",
  "changelog.entries.mobile-form-keyboard.title":
    "Os formulários ficam acima do teclado no telemóvel",
  "changelog.entries.mobile-form-keyboard.body":
    "No iOS, abrir o teclado dentro de um formulário de contacto ou de inscrição já não esconde o botão de submeter por trás dele: a janela sobe para continuar visível. Adicionámos também atalhos de toque prolongado no ícone da app instalada e melhorámos as dicas de ajuda para toque.",

  "changelog.entries.magazine-real-content.title":
    "A revista mostra sempre edições reais",
  "changelog.entries.magazine-real-content.body":
    "O arquivo da revista e as páginas de autoria passam a carregar edições reais com um estado de carregamento e de erro próprios, por isso nunca verás conteúdo de protótipo se algo estiver lento ou correr mal.",

  "changelog.entries.community-roadmap.title":
    "O roteiro é agora feito contigo",
  "changelog.entries.community-roadmap.body":
    "Vê o que já foi lançado, o que está em construção e o que está planeado. Depois vota no que mais importa para ti, ou submete a tua própria ideia. Lemos todas as sugestões; a equipa cura o que avança no roteiro.",

  "changelog.entries.listing-photos.title": "Fotos na tua ficha de negócio",
  "changelog.entries.listing-photos.body":
    "O formulário de registo de negócio já aceita fotos: carrega um ficheiro ou cola o link de uma imagem e vê em tempo real como a tua ficha vai ficar antes de publicar.",

  "changelog.entries.business-page-live.title":
    "As páginas de negócios ganham vida",
  "changelog.entries.business-page-live.body":
    "Cada página de negócio mostra agora as fotografias reais do espaço numa galeria que podes abrir em ecrã inteiro, além do horário de funcionamento real com um estado “Aberto agora / Encerrado” em tempo real, para saberes o aspeto de um lugar e se está aberto antes de ir.",

  "changelog.entries.business-actions.title": "Guarda, partilha e chega lá",
  "changelog.entries.business-actions.body":
    "Cada página de negócio tem agora uma barra de ações: pede direções, liga, partilha ou guarda o lugar na tua lista com um toque. Os lugares guardados mostram quantos membros também os guardaram, um sinal de confiança discreto.",

  "changelog.entries.business-reviews-trust.title":
    "Avaliações que funcionam nos dois sentidos",
  "changelog.entries.business-reviews-trust.body":
    "Quem tem um negócio já pode responder às avaliações, e cada página mostra a distribuição de estrelas para veres o panorama completo para lá da média. Se algo estiver errado, podes denunciar uma ficha ou sugerir uma correção, e ambas seguem diretamente para a nossa moderação.",

  "changelog.entries.business-discovery.title": "Orienta-te no diretório",
  "changelog.entries.business-discovery.body":
    "As páginas de negócio mostram agora locais parecidos por perto, um caminho claro de volta ao diretório e os idiomas falados no espaço. Os próximos eventos ligam diretamente à página do evento, onde podes adicioná-los ao teu calendário.",

  "changelog.entries.directory-filters-upgrade.title":
    "O diretório de negócios ficou muito mais fácil de filtrar",
  "changelog.entries.directory-filters-upgrade.body":
    "Encontrar um lugar ficou mais suave. A pesquisa olha para descrições e etiquetas, não só para os nomes; cada categoria mostra uma contagem ao vivo; podes ordenar A–Z ou por bairro; e os filtros ficam no link, por isso um diretório filtrado é partilhável e sobrevive a um refresh. Escolher um ambiente já não faz desaparecer todos os negócios, os filtros ativos aparecem como chips removíveis com um Limpar tudo, os resultados vazios explicam-se, e o mapa é mais fácil de usar no telemóvel.",
  "changelog.entries.public-profile-badge.title":
    'O "Ficar público" agora vive no teu perfil',
  "changelog.entries.public-profile-badge.body":
    "O controlo de perfil público passou para um selo discreto ao lado do teu nome: toca nele para veres como os perfis públicos se desbloqueiam, ou para ativares o teu quando fores elegível. Só aparece no teu próprio perfil.",

  "changelog.entries.here-for-hero.title":
    '"Aqui para" agora abre o teu perfil',
  "changelog.entries.here-for-hero.body":
    'O teu "Aqui para", o que procuras na QueerPulse, está agora logo no topo do perfil, ao lado do nome e da bio, em vez de mais abaixo na página. Mais fácil de ver à primeira vista, e continua tão fácil manter privado, se for essa a tua escolha.',

  "changelog.entries.directory-view-switcher.title":
    "Uma troca Lista / Mapa mais clara",
  "changelog.entries.directory-view-switcher.body":
    'Alternar entre a lista e o mapa no diretório de negócios ficou mais fácil de encontrar. Os dois botões passaram a ser um único seletor com etiquetas e ícones, ao lado da contagem de resultados, para se ler claramente como "escolher uma vista", mantendo-se compacto e fácil de tocar no telemóvel.',

  "changelog.entries.profile-links-fix.title":
    "Links de perfil que se comportam",
  "changelog.entries.profile-links-fix.body":
    'Adicionar links sociais ao teu perfil ficou mais suave. Um nome de utilizador simples, como o teu handle do Instagram, é aceite tal como está, e acabou o aviso "isto não parece um link válido" quando claramente é. As linhas já não se desmontam quando aparece uma dica; o campo mantém-se no sítio e a dica fica bem alinhada por baixo.',

  "changelog.entries.subprofiles-showcase.title":
    'Um "Também a trabalhar como" mais rico',
  "changelog.entries.subprofiles-showcase.body":
    "Os outros lados do teu trabalho mostram agora mais de quem és: trabalho em destaque, links, disponibilidade e o número de seguidores e endossos, tudo no cartão. No telemóvel é uma vista de um só toque, pensada para um ecrã mais pequeno, e se és dono das personas tens badges de visibilidade e uma forma rápida de editar direto da vitrine.",

  "changelog.entries.real-directory-map.title":
    "Um mapa a sério em cada página do diretório",
  "changelog.entries.real-directory-map.body":
    "Abre um negócio ou espaço no diretório e a localização passa a aparecer num mapa real e interativo, o mesmo mapa quente de Lisboa que já conheces da vista de mapa e de quando registas um negócio, marcado no ponto exato onde o dono o colocou. O antigo mapa decorativo desapareceu.",

  "changelog.entries.reply-threads.title":
    "Responde a qualquer comentário no fórum",
  "changelog.entries.reply-threads.body":
    "As respostas passam agora a poder ter as suas próprias respostas. Responde diretamente a qualquer comentário e a tua entra logo ali por baixo, para as conversas longas se ramificarem em vez de se amontoarem numa lista só. As conversas mais profundas recolhem-se numa única linha: toca para expandir quando quiseres ver o resto.",

  "changelog.entries.copy-subprofile.title": "Duplica um perfil já existente",
  "changelog.entries.copy-subprofile.body":
    "A criar um subperfil novo? Duplica um que já tenhas (leva tudo contigo, ou só o conteúdo) e ajusta a partir daí.",

  "changelog.entries.smoother-chat.title": "Chat mais suave e reativo",
  "changelog.entries.smoother-chat.body":
    "As mensagens passam a parecer mais rápidas e serenas em qualquer dispositivo. Escrever já não faz a conversa tremer, o deslizar-para-responder acompanha o teu dedo, e as mensagens novas assentam no lugar em vez de a conversa toda animar de uma vez. No telemóvel, manter uma mensagem premida abre as ações de forma limpa (sem lutar com o menu de seleção de texto), o chat preenche o ecrã como uma só superfície sem a página a saltar por trás, e os toques dão resposta imediata, com uma leve vibração ao premir sem soltar.",

  "changelog.entries.invite-state-page.title": "Página de convite mais clara",
  "changelog.entries.invite-state-page.body":
    "Quando uma ligação de convite não pode ser usada, a página passa a mostrar o convite real, com quem te avalizou e quando expirou, em vez de uma mensagem genérica. Também distingue um convite que expirou, um que já foi usado e um que foi retirado, e encaminha-te para o passo certo em cada caso.",

  "changelog.entries.chat-shortcuts.title": "Atalhos de menção no chat",
  "changelog.entries.chat-shortcuts.body":
    "Um novo botão “?” no compositor de mensagens mostra todos os atalhos de menção de relance: @ para um membro, c/ para uma comunidade, # para um tópico, b/ para um negócio, e/ para um evento, t/ para um tópico do fórum. Toca num deles e o símbolo é inserido logo na tua mensagem, abrindo as sugestões enquanto escreves. E, para não sobrecarregar o ecrã, só há um popover aberto de cada vez no compositor.",

  "changelog.entries.events-hub.title": "Uma casa só para os eventos",
  "changelog.entries.events-hub.body":
    "Eventos, Encontros e Calendário são agora um único Events Hub: Destaques, Explorar e um calendário completo juntos, com fotos reais do que aí vem. Os mesmos eventos, mais fáceis de encontrar.",

  "changelog.entries.gifs-in-chat.title": "Envia GIFs no chat",
  "changelog.entries.gifs-in-chat.body":
    "Diz-lo com um GIF. Há um novo botão de GIF no compositor de mensagens: procura ou vê o que está em tendência, toca num e ele segue direto para a conversa (tanto em DMs como em grupos). Com tecnologia KLIPY e filtro de conteúdo seguro ativado por predefinição.",

  "changelog.entries.privacy-and-speed.title":
    "Mais privacidade e uma app mais ágil",
  "changelog.entries.privacy-and-speed.body":
    "Uma ronda de privacidade, velocidade e mensagens. As personas e subperfis que definiste como privados passam a manter-se totalmente privados, e as pessoas que bloqueaste deixam de aparecer no diretório de colegas de casa. Editar ou apagar uma mensagem passa a atualizar de imediato, sem aquele piscar de recarregamento. E a própria aplicação está mais leve, por isso as páginas, e as imagens que te recebem no topo, carregam um pouco mais depressa.",

  "changelog.entries.leaner-prerendering.title":
    "Compilações do site mais leves e rápidas",
  "changelog.entries.leaner-prerendering.body":
    "Nos bastidores: passamos a pré-gerar apenas a página pública essencial para os motores de busca, em vez do site inteiro, e deixamos de criar uma cópia separada de cada perfil. As compilações usam menos dados e mantêm-se rápidas, e os motores de busca continuam a encontrar todas as páginas públicas através do mapa do site. Não é preciso fazer nada.",

  "changelog.entries.admin-governance-real-data.title":
    "Painéis de governança agora com dados reais",
  "changelog.entries.admin-governance-real-data.body":
    "A área de governança de administração (os valores financeiros e o gráfico trimestral, o registo de decisões e o histórico de moderação) passa a ler dados reais da plataforma em vez de valores fixos, para que a equipa veja as finanças e o histórico de moderação reais da comunidade.",

  "changelog.entries.sign-in-fix.title": "Iniciar sessão volta a funcionar",
  "changelog.entries.sign-in-fix.body":
    "Uma incompatibilidade entre a aplicação e o servidor impedia o início de sessão de concluir. Já está corrigido: iniciar sessão, terminar sessão e manter-se ligado voltam a funcionar sem problemas.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Mais fácil de tocar, mais fácil de navegar",
  "changelog.entries.accessibility-mobile-polish.body":
    "Os botões pequenos passam a ter áreas de toque maiores no telemóvel, as ações que só apareciam ao passar o rato podem ser alcançadas com o teclado, e os formulários de compra e de candidatura suportam preenchimento automático do nome e do email.",
  "changelog.entries.platform-hardening.title": "Reforços nos bastidores",
  "changelog.entries.platform-hardening.body":
    "Nos bastidores: a API passa a ser versionada com documentação publicada, as listas longas ficam limitadas com segurança para as páginas se manterem rápidas, e as denúncias ganham proteção contra spam. Não é preciso fazer nada; fica tudo simplesmente rápido e estável.",
  "changelog.entries.composer-reaction-polish.title":
    "Caixa de mensagem mais ampla e reações mais arrumadas",
  "changelog.entries.composer-reaction-polish.body":
    "A caixa de mensagem passa agora a ocupar toda a largura do compositor e, no telemóvel, fica encostada sem uma barra de deslocação a mais quando a mensagem é curta, crescendo apenas à medida que escreve. As reações também passam a comportar-se como deve ser: tocar num emoji com que já reagiu remove-o, em vez de empilhar o mesmo vezes sem conta.",
  "changelog.entries.chat-mentions.title": "Mencione pessoas e lugares no chat",
  "changelog.entries.chat-mentions.body":
    "Escreva @ para um membro, ou c/ b/ e/ t/ # para uma comunidade, negócio, encontro, tópico de fórum ou tema: escolha das sugestões e vira uma ligação tocável, numa mensagem direta ou num grupo. Funciona enquanto escreve e enquanto edita uma mensagem. As suas conversas continuam privadas: as menções apenas ligam, nunca notificam ninguém.",
  "changelog.entries.group-chats.title": "Conversas de grupo",
  "changelog.entries.group-chats.body":
    "Crie um grupo com as pessoas que quer lá dentro, dê-lhe um nome e mostre quem é quem. Os administradores podem adicionar ou remover membros e arrumar a informação do grupo, vê quem já leu uma mensagem, e uma bolha de escrita aparece quando alguém está a escrever.",
  "changelog.entries.message-search.title": "Procure nas suas mensagens",
  "changelog.entries.message-search.body":
    "À procura daquela morada, daquela data, daquilo que alguém disse? Pesquise em todas as suas conversas e salte diretamente para lá.",
  "changelog.entries.link-previews.title": "As ligações abrem-se",
  "changelog.entries.link-previews.body":
    "Partilhe uma ligação e ela desdobra-se num cartão de pré-visualização (título, imagem e tudo) para que as pessoas vejam para onde vai antes de tocar.",
  "changelog.entries.forward-pin-star.title": "Reencaminhe, fixe e marque",
  "changelog.entries.forward-pin-star.body":
    "Passe uma mensagem para outra conversa, fixe as que um grupo está sempre a revisitar, e marque com estrela as que quer voltar a encontrar. As mensagens marcadas ficam só para si.",
  "changelog.entries.safe-space-view-page.title":
    "Pré-visualize espaços seguros antes de verificar",
  "changelog.entries.safe-space-view-page.body":
    "A ferramenta de revisão de Espaços seguros passa a ter um botão “Ver página” em cada listagem, abrindo a sua página pública num novo separador para que a moderação veja um espaço por inteiro antes de o marcar como verificado.",
  "changelog.entries.swipe-members-highlight.title":
    "Deslize pelos membros em destaque",
  "changelog.entries.swipe-members-highlight.body":
    "Na página inicial, o cartão de membro em destaque agora acompanha o seu dedo: deslize para a esquerda ou direita no telemóvel para passar entre membros, e ele encaixa no seguinte.",
  "changelog.entries.mention-names.title": "As menções mostram nomes reais",
  "changelog.entries.mention-names.body":
    "Menciona uma pessoa, comunidade ou lugar numa conversa, tópico do fórum ou discussão de comunidade e agora aparece o nome por extenso, Tiago Costa em vez de @tiago-costa. Toca e continuas a ir para o sítio certo; passa o cursor para ver o identificador.",
  "changelog.entries.forward-to-groups.title":
    "Reencaminha mensagens para os teus grupos",
  "changelog.entries.forward-to-groups.body":
    "O reencaminhamento agora chega às tuas conversas de grupo, não só às mensagens individuais. Mantém premida qualquer mensagem, escolhe Reencaminhar e seleciona qualquer grupo de que fazes parte.",
  "changelog.entries.read-receipts.title": "Recibos de entrega e de leitura",
  "changelog.entries.read-receipts.body":
    "Os visto contam agora a história toda: enviada, entregue no telemóvel, e lida, para saber onde a sua mensagem chegou.",
  "changelog.entries.message-gestures.title":
    "Deslize para responder, toque para reagir",
  "changelog.entries.message-gestures.body":
    "Deslize uma mensagem para o lado para lhe responder, e toque duas vezes para reagir: os gestos rápidos que os seus polegares já conhecem.",
  "changelog.entries.message-drafts.title": "Os seus rascunhos esperam por si",
  "changelog.entries.message-drafts.body":
    "Meia mensagem que ainda não enviou? Guardamo-la para aquela conversa, por isso continua lá quando voltar.",
  "changelog.entries.offline-outbox.title": "Envios que não se perdem",
  "changelog.entries.offline-outbox.body":
    "Tocou em enviar sem rede? A sua mensagem fica em fila e parte assim que voltar a ter ligação. Nada desaparece pelo caminho.",
  "changelog.entries.typing-indicator.title":
    "Bolha de escrita e cuidado com o leitor de ecrã",
  "changelog.entries.typing-indicator.body":
    "Uma bolha suave mostra quando a outra pessoa está a escrever, e uma ronda de trabalho no leitor de ecrã torna toda a conversa mais fácil de acompanhar sem olhar.",
  "changelog.entries.moderation-actions.title":
    "Cada denúncia recebe uma decisão real",
  "changelog.entries.moderation-actions.body":
    "Abrir uma denúncia na fila de moderação passa a mostrar sempre o conjunto completo de ações (ocultar, avisar, restringir, remover e mais, cada uma com um motivo que a pessoa vai ler) em vez de a fechar em silêncio. O título da fila também reflete o número real de denúncias em espera.",
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
    "As comunidades que fixa no seu perfil passam a ficar guardadas, entre sessões e dispositivos, e aparecem para quem visita, cada uma com a sua função.",
  "changelog.entries.mention-types.title": "Mais formas de mencionar",
  "changelog.entries.mention-types.body":
    "As menções vão agora além de pessoas e comunidades (tópicos, negócios, eventos e discussões), e os donos e responsáveis são notificados quando são referidos.",
  "changelog.entries.clear-errors.title": "Mensagens de erro mais claras",
  "changelog.entries.clear-errors.body":
    "Quando algo não pode ser guardado, passamos a dizer exatamente o que correu mal em vez de um genérico «algo correu mal».",
  "changelog.entries.messaging-reactions.title":
    "Reações a mensagens mais fluidas",
  "changelog.entries.messaging-reactions.body":
    "As reações atualizam-se instantaneamente para todos na conversa, e as suas mensagens enviadas já não mudam de posição quando reage a elas.",
  "changelog.entries.event-photos.title": "Galerias de fotos de eventos",
  "changelog.entries.event-photos.body":
    "Organizadores e participantes podem partilhar fotos num encontro, visíveis apenas para quem esteve presente.",
  "changelog.entries.mentions.title": "Mencione pessoas e comunidades",
  "changelog.entries.mentions.body":
    "Escreva @ para etiquetar um membro ou c/ para ligar uma comunidade nas respostas do fórum e das comunidades: quem for mencionado recebe uma notificação.",
  "changelog.entries.push-notifications.title":
    "Notificações push para mensagens",
  "changelog.entries.push-notifications.body":
    "Ative para receber uma notificação no telemóvel quando chega uma nova mensagem direta enquanto está ausente: privado, apenas para mensagens diretas e desativado por predefinição.",
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
  "changelog.entries.housing.title":
    "Diretórios de habitação e colegas de casa",
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
  "changelog.entries.deploy-stability.title":
    "Estabilização de implementação e compilação",
  "changelog.entries.deploy-stability.body":
    "Uma série de correções de implementação, compilação e pré-renderização para que a aplicação seja publicada de forma fiável em produção.",
  "changelog.entries.performance-staff.title": "Desempenho e crachás de equipa",
  "changelog.entries.performance-staff.body":
    "Carregamento de páginas mais rápido, mais rotas de administração e um crachá de equipa QueerPulse nas contas oficiais.",
  "changelog.entries.accessibility.title":
    "Acessibilidade e refinamento da interface",
  "changelog.entries.accessibility.body":
    "Correções de acessibilidade e uma ronda de melhorias de interface em toda a aplicação.",
  "changelog.entries.i18n-complete.title": "Tradução completa para português",
  "changelog.entries.i18n-complete.body":
    "Toda a interface passou a estar disponível em inglês e português, alternável a partir da navegação.",
  "changelog.entries.subprofiles.title": "Subperfis",
  "changelog.entries.subprofiles.body":
    "Crie várias presenças públicas numa só conta: para a sua arte, o seu negócio ou um projeto.",
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
  "volunteer.card.expressInterest": "Mostrar interesse",
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
    "Um turno regular e um prazo mínimo: a consistência importa.",
  "postOpportunity.core.basicsHeading": "O essencial",
  "postOpportunity.core.orgLabel": "Organização",
  "postOpportunity.core.orgHelper":
    "Escolha uma comunidade que possui ou modera, ou uma organização parceira aprovada.",
  "postOpportunity.core.orgEmptyState":
    "Precisa de possuir ou moderar uma comunidade, ou ser uma organização parceira aprovada, antes de poder publicar uma oportunidade em nome dela.",
  "postOpportunity.core.orgPlaceholder": "ex.: a sua organização",
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
    "Escolha entre as suas ligações ou as comunidades a que pertence.",
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
    "As parcerias da QueerPulse são <b>operacionais, não promocionais</b>. Não vendemos acesso, não fazemos conteúdo patrocinado, nem co-branding pelo simples efeito. <em>Construímos ligações entre organizações que já fazem este trabalho.</em> Abaixo: como são essas ligações na prática, com quem já trabalhamos, e como começar uma conversa.",
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
  "forOrgs.cta.title": "Começa uma <em>conversa.</em>",
  "forOrgs.cta.body":
    'Conta-nos sobre a tua organização num parágrafo. Lemos todas as mensagens no prazo de 5 dias úteis e respondemos pessoalmente, mesmo que a resposta seja "isto não é para nós, para já".',
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
  "forOrgs.form.sendingCta": "A enviar…",
  "forOrgs.form.sent.title": "Enviado à nossa <em>equipa de parcerias.</em>",
  "forOrgs.form.sent.body":
    "Obrigade, recebemos a tua mensagem. A nossa equipa de parcerias lê cada uma e responde pessoalmente dentro de 5 dias úteis.",
  "forOrgs.form.error":
    "Algo correu mal ao enviar. Tenta novamente ou escreve diretamente à equipa de parcerias.",
  "forOrgs.form.small":
    "Vai diretamente para a nossa equipa de parcerias. Sem funil de vendas, sem sequência de seguimento. Só uma resposta no prazo de 5 dias úteis.",
  "forOrgs.form.toast":
    "Enviado à nossa equipa de parcerias. Vão responder no prazo de 5 dias úteis",

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
  "directory.hero.note": "Verificado pela comunidade · atualizado mensalmente",
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
  "directory.count": "A mostrar <b>{shown}</b> de {total} lugares",
  "directory.empty.title": "Nenhum lugar corresponde a esses filtros",
  "directory.empty.body":
    "Tenta uma categoria mais ampla, menos ambientes ou outra pesquisa, ou limpa os filtros para ver tudo.",
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
  // A mesma opção, com outro nome enquanto a localização está ligada: com uma
  // posição conhecida, a ordem em destaque É a ordem por proximidade.
  "directory.sort.nearest": "Mais perto primeiro",
  "directory.sort.name": "A–Z",
  "directory.sort.hood": "Por bairro",
  "directory.badge.queerOwnedVerified": "Negócio queer verificado",
  "directory.badge.queerOwned": "Negócio queer",
  "directory.badge.friendly": "LGBTQ+ friendly",
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
    "O selo de verificação não é auto-declarado. Um membro propõe um espaço, outros visitam-no e avaliam-no segundo um conjunto fixo de critérios, e cada espaço é reavaliado todos os anos, por isso também o pode perder.",
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
  "directory.outro.title":
    "Acabaste de chegar a Lisboa? <em>Não estás a começar do zero.</em>",
  "directory.outro.sub":
    "Junta-te à rede e tem acesso ao diretório completo, recomendações da comunidade, e a uma comunidade que conhece a cidade.",
  "directory.outro.cta": "Pedir um convite",
  "directory.detail.breadcrumbAria": "Trilho de navegação",
  "directory.detail.breadcrumbHome": "Diretório",
  "directory.detail.relatedTitle": "Mais {category} por perto",
  "directory.detail.badge.verifiedOwned": "Negócio queer verificado",
  "directory.detail.badge.owned": "Negócio queer",
  "directory.detail.badge.friendly": "LGBTQ+ friendly",
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
    "Obrigado. <em>Estamos a tratar disso.</em>",
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
    "As rendas subiram muito nos últimos cinco anos. Conta com cerca de 800 a 1100 euros por um quarto num bairro central. Arroios e Mouraria ainda têm melhor relação preço-qualidade. Os bons anúncios saem em dias, por isso avança depressa quando vires um.",
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
    "Comprovativo de emprego remoto ou contratos com clientes não portugueses. O requisito de rendimento é normalmente 4× o salário mínimo português (cerca de 3 280 €/mês). Seguro de saúde com cobertura em Portugal. Registo criminal limpo. NIF português (nalguns casos pode ser obtido antes do visto).",
  "visas.tabs.d8.card1.tag": "Limiar de rendimento mais alto do que o D7",
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
    "<strong>Pelo menos 90% de cada euro recebido</strong> tem de ser gasto em programas comunitários, equipa e infraestrutura, e não em custos indiretos. A meta é 96% e tem sido cumprida todos os anos desde 2024.",
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
    "O coletivo só pode ser encerrado por resolução da Assembleia que exija uma <strong>maioria qualificada de 75%</strong> de todas as pessoas-membro ativas, e não apenas das que votam.",
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
    "Lemos todas as candidaturas, não só as mais arrumadas",
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
    'Apoio Jurídico e Testagem de Saúde Sexual mostram agora um diretório real, verificado por administradores, quando existe, e um formulário "Sugerir um recurso" que alimenta uma fila de revisão administrativa quando não existe. Nunca com recursos fabricados.',
  "changelog.tag.legal": "Ver Apoio Jurídico →",

  "changelog.tag.guideRating": "Ver os guias de Legal",
  "changelog.entries.resources-guide-rating.title":
    "Avalia se um guia de recursos ajudou",
  "changelog.entries.resources-guide-rating.body":
    'Os guias de Legal, Saúde Sexual e Saúde Mental terminam agora com um rápido "Isto foi útil?": polegar para cima ou para baixo, sem contagens visíveis, só um agradecimento depois de responderes. A equipa editorial já vê quais guias estão e não estão a resultar na nova página de administração Feedback dos guias.',

  "changelog.entries.homepage-housing-personas-showcase.title":
    "Alojamento e perfis alternativos, mais próximos do real na homepage",
  "changelog.entries.homepage-housing-personas-showcase.body":
    'As secções de Alojamento e Perfis Alternativos da homepage mostram agora como as funcionalidades funcionam de verdade: dois anúncios reais com um separador para o quarto e outro para o senhorio (avaliações, veredictos, e um honesto "ainda sem avaliações" quando o senhorio é novo), e um baralho de perfis interativo onde podes ver como a página pública muda consoante o perfil escolhido.',

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
    "Nomear um Agente de Mudança eram duas caixas em forma de comprimido lado a lado por baixo do título: sem etiquetas, sem noção de quanto podias escrever na segunda e com um botão que ficava morto até as duas terem alguma coisa, sem nunca o dizer. O texto passa a ficar ao lado de um cartão a sério. Os dois campos têm etiqueta e uma pista, a caixa do porquê tem espaço para escrever e uma contagem de 500 caracteres, e carregar no botão com um campo vazio diz-te qual deles falta. Ao lado do formulário, três linhas explicam o que acontece a seguir: alguém da moderação lê, recebes uma notificação com a decisão e a pessoa nomeada nunca é avisada.",

  "changelog.entries.see-your-persona-the-way-a-visitor-does.title":
    "Vê a tua persona como um visitante a vê",
  "changelog.entries.see-your-persona-the-way-a-visitor-does.body":
    "A tua própria página de persona mostra-te os controlos de quem a gere: Editar persona, o reposicionamento do banner, os nomes de quem a segue. Isso tornava difícil responder à pergunta que interessa antes de partilhares o link, que é o que uma pessoa desconhecida vê ali. Passa a haver um botão Ver como visitante ao lado de Editar persona. Troca os teus controlos pelos que um visitante vê, esconde tudo o que é só teu e mantém a página viva, para poderes abrir uma foto, ler um poema e seguir uma ligação tal como quem lá chega pela primeira vez. Mensagem, Seguir, Recomendar e Denunciar aparecem todos no seu lugar e nenhum deles pode ser premido, por isso nada do que fizeres ali conta. Uma barra no fundo do ecrã leva-te de volta. Os rascunhos não o oferecem: ainda mais ninguém consegue abrir um rascunho, por isso não há vista de visitante para mostrar.",

  "changelog.entries.filters-you-add-ease-in-and-out.title":
    "Os filtros que acrescentas entram e saem com calma",
  "changelog.entries.filters-you-add-ease-in-and-out.body":
    "Em Encontrar membros, cada filtro que escolhes aparece como uma pastilha por cima dos resultados. Antes surgia já feita no instante em que marcavas a caixa e desaparecia da mesma maneira quando a tiravas. Agora a pastilha cresce ao aparecer e encolhe ao sair, e as pastilhas ao lado deslizam para fechar o espaço, para veres qual acabaste de acrescentar e qual acabaste de largar. Com o Reduzir movimento ligado, ou se o teu aparelho o pedir, as pastilhas continuam a aparecer e a desaparecer sem qualquer movimento.",

  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.title":
    "Cada bairro diz quantas pessoas lá estão",
  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.body":
    "Onde estão baseadas era o único filtro em Encontrar membros sem números. Era uma fila de pastilhas, por isso escolhias um bairro, esperavas e só depois descobrias se lá estava alguém. Passa a ter o aspeto dos filtros acima e abaixo: uma caixa por bairro, cada uma com a contagem de quantos dos teus resultados atuais lá estão, apagada e impossível de escolher quando não está ninguém. Toda a Lisboa leva o número completo, para veres o que ganharias ao largar o filtro de bairro antes de o largares.",

  "changelog.entries.a-persona-leads-with-its-name.title":
    "Uma persona passa a começar pelo nome",
  "changelog.entries.a-persona-leads-with-its-name.body":
    "O cartão da persona que estavas a ver abria com um distintivo em maiúsculas com o ofício e com o nome de utilizador. O nome e a linha que descreve o trabalho só apareciam por baixo de tudo isso, a começar mais à esquerda do que aquilo que estava por cima, por isso a fotografia ficava ao lado de nada em concreto. A fotografia passa a ficar ao lado do nome a que pertence, com a descrição logo por baixo, e o bloco inteiro lê-se como uma pessoa só. O ofício passou para o início dessa linha de descrição, escrito mais escuro do que as palavras à volta para continuar a saltar à vista, e o distintivo desapareceu.",

  "changelog.entries.pages-open-the-moment-you-click-them.title":
    "As páginas abrem no momento em que carregas",
  "changelog.entries.pages-open-the-moment-you-click-them.body":
    "Carregar num link deixava-te a olhar para um indicador de espera no lugar da página. Nada dessa página tinha ainda chegado ao teu navegador, por isso era o clique que dava início ao descarregamento, e só quando ele terminava é que alguma coisa começava a carregar o conteúdo. A aplicação passa a ir buscar a página em silêncio assim que passas o rato, chegas com o teclado ou tocas no link que lá leva, e os separadores no fundo do ecrã ficam prontos antes de carregares neles. A estrutura da página aparece logo, com marcações no lugar do conteúdo que ainda vem a caminho, para veres onde estás enquanto a página se preenche.",

  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.title":
    "As pessoas que talvez conheças passam a deslizar de lado no telemóvel",
  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.body":
    "No telemóvel, as sugestões por cima do teu mural empilhavam um cartão por linha, por isso seis pessoas empurravam o mural quase um ecrã inteiro para baixo e tinhas de passar por caras que não pediste até chegares ao que as tuas comunidades publicaram. Essa fila passa a deslizar de lado. Os cartões têm um tamanho que deixa sempre ver a beira do seguinte, a faixa mantém a mesma altura seja o que for que tenha dentro, e dentro de cada cartão nada muda: a mesma cara, a mesma linha a dizer porque está ali e as mesmas duas saídas, dizer olá ou dispensar a pessoa de vez.",

  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.title":
    "Os filtros de membros mostram quantas pessoas estão por trás de cada um",
  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.body":
    'Filtrar o diretório de membros era adivinhar. Escolhias "Mentoria", depois "Designer gráfico", depois um idioma, e só descobrias que tinhas reduzido tudo a ninguém quando os resultados ficavam vazios. Agora cada opção da barra lateral traz o número de pessoas por trás dela, contado ao vivo em relação a tudo o resto que já escolheste, para veres que uma combinação é um beco sem saída antes de gastares um clique nela. Uma opção que ninguém preenche fica esbatida em vez de desaparecer, porque zero é uma resposta verdadeira à pergunta "quem está aqui?" e um vocabulário que muda de forma é mais difícil de ler do que um que não muda.',

  "changelog.entries.an-empty-browse-stops-blaming-your-filters.title":
    "Um Explorar vazio deixa de culpar os teus filtros",
  "changelog.entries.an-empty-browse-stops-blaming-your-filters.body":
    'O Explorar, nos Eventos, dizia a quem o encontrava vazio que "nada corresponde a esse filtro, experimenta outro", mesmo quando nenhum filtro estava escolhido e simplesmente não havia nada. Punha as pessoas à procura de uma definição para alargar que não existia. Agora os dois vazios dizem coisas diferentes: com filtros escolhidos, aponta para as datas, o bairro e o tipo de convívio que podes alargar; sem nenhum, diz que o calendário está vazio e oferece-se para te ajudar a organizar a primeira coisa que lá esteja.',

  "changelog.entries.one-row-of-tabs-on-events.title":
    "Uma só linha de separadores nos Eventos",
  "changelog.entries.one-row-of-tabs-on-events.body":
    'Os Eventos tinham duas barras de separadores, uma por cima da outra: "Os meus eventos | Descobrir" no cabeçalho e, por baixo, outra barra fixa para Destaques, Explorar e Calendário. Dois níveis, duas barras e uma faixa de página vazia pelo meio. As três vistas de Descobrir passam a estar na própria linha do cabeçalho, logo a seguir ao botão que as abre e antes de "Organizar um convívio", para que todas as escolhas se leiam numa linha. As ligações para uma vista específica continuam a funcionar como antes.',

  "changelog.entries.the-recap-card-leaves-ways-to-gather.title":
    "O cartão das retrospetivas sai das formas de nos juntarmos",
  "changelog.entries.the-recap-card-leaves-ways-to-gather.body":
    'A faixa "formas de nos juntarmos", nos destaques do Hub de Eventos, oferecia quatro portas: ver tudo, abrir o calendário, organizar o teu, e "Revive o último", que prometia fotografias, notas e quantas pessoas apareceram nos convívios que já aconteceram. Essa última apontava para uma página de retrospetiva que ainda não existe. Quem a seguia ia parar a lado nenhum. O cartão saiu da faixa, que passa a mostrar as três portas que levam mesmo a algum lado, todas com a mesma largura e altura e com a ligação na mesma linha. Quando as retrospetivas forem reais, o cartão volta.',

  "changelog.entries.a-nomination-can-say-where-to-find-them.title":
    "Uma nomeação pode dizer onde encontrar a pessoa",
  "changelog.entries.a-nomination-can-say-where-to-find-them.body":
    'Nomear alguém para os Change Makers pedia um nome e uma frase, e era tudo o que chegava a quem modera. Há pessoas diferentes com o mesmo nome próprio, um nome artístico não é o nome que está nos documentos, e "organiza o grupo de apoio às terças" não é algo que se procure. Uma nomeação só era mesmo acionável quando quem modera já sabia de quem se tratava. O formulário passa a ter dois campos opcionais no meio. Se a pessoa já é membro aqui, podes procurá-la e ligar o perfil, e a fila de moderação mostra uma ligação direta. Se não é, há uma linha para onde já está em público: um Instagram, um site, um email. Ambos são opcionais e nenhum bloqueia o botão, por isso um nome e uma frase continuam a ser uma nomeação completa. Nada mudou em quem vê o quê: a nomeação continua privada, a pessoa nomeada continua a não ser avisada, e os contactos seguem a mesma regra do nome de quem nomeia, ou seja, só moderação e administração da plataforma os leem.',

  "changelog.entries.the-communities-toolbar-becomes-one-line.title":
    "A barra das comunidades passa a uma linha",
  "changelog.entries.the-communities-toolbar-becomes-one-line.body":
    "Tudo o que estava por cima dos cartões das comunidades ocupava quatro faixas empilhadas: o alternador As minhas comunidades e Descobrir com dois botões afastados à direita, depois um campo de pesquisa sozinho na sua própria linha, depois uma linha com a contagem de resultados e a ordenação. Juntas empurravam o primeiro cartão quase um ecrã para baixo e diziam o mesmo número duas vezes, já que o separador ativo trazia a sua própria contagem. Passam a ser uma linha: o alternador, o campo de pesquisa com o Refinar ao lado, e Começar uma comunidade. O Como funcionam as comunidades mudou-se para o botão de informação junto ao título da página, que já era a explicação da página a um polegar de distância. A contagem de resultados aparece na fila de etiquetas assim que algo restringe a lista, ao lado das etiquetas que a explicam, e a ordenação junta-se a essas etiquetas sempre que sai de Mais recentes, para que um painel Refinar fechado nunca esconda como a lista está ordenada. Uma pesquisa ou um filtro sobrevive agora à troca entre As minhas comunidades e Descobrir, por isso procurar o mesmo noutro sítio é um clique.",

  "changelog.entries.three-icons-leave-the-events-header.title":
    "Três ícones saem do cabeçalho dos eventos",
  "changelog.entries.three-icons-leave-the-events-header.body":
    "O cabeçalho dos eventos tinha uma roda dentada, um sino e uma lupa antes do botão Organizar um convívio. A roda abria um painel de preferências, o sino abria uma segunda lista de notificações mais pequena e a lupa levava-te ao separador Descobrir com o campo de pesquisa focado. Entre os três, repetiam as notificações que já recebes no sino principal e a pesquisa que já alcanças a partir de Descobrir, e o painel oferecia definições que quase ninguém o abria para encontrar. Os três desapareceram. O cabeçalho passa a ser o nome da página, o alternador Os meus eventos e Descobrir, e Organizar um convívio. Os lembretes continuam a chegar-te na app antes de um evento começar.",

  "changelog.entries.browse-events-gets-the-same-refine.title":
    "Explorar eventos ganha o mesmo Refinar",
  "changelog.entries.browse-events-gets-the-same-refine.body":
    "O quadro de exploração do Descobrir abre agora como os teus próprios eventos: uma linha com um campo de pesquisa e um controlo Refinar, e quando, bairro, tipo de encontro e custo como faixas lá dentro. O que escolheste aparece em etiquetas removíveis por baixo do campo de pesquisa, cada uma a voltar para qualquer em vez de para nada, e o Limpar tudo passa a ficar ao lado dessas etiquetas em vez de junto a controlos que o painel pode estar a esconder. Os filtros em si não mudaram, continuam aplicados pelo servidor, por isso um quadro restringido continua a aguentar o scroll e a partilhar-se como link.",

  "changelog.entries.your-events-filters-fold-away.title":
    "Os filtros dos teus eventos recolhem-se",
  "changelog.entries.your-events-filters-fold-away.body":
    "Seis etiquetas de secção, cinco etiquetas de filtro e um controlo de ordenação estavam todos abertos por cima dos teus eventos, deixando o primeiro evento muito abaixo na página por causa de escolhas que a maioria das pessoas faz uma vez ou nunca. Passam a viver atrás de um único controlo Refinar, o mesmo que a grelha de comunidades e o diretório de Lisboa usam, e ele mostra um número para que um painel fechado continue a dizer que há algo ligado. O que está a restringir a lista aparece em etiquetas removíveis por baixo do campo de pesquisa: primeiro a secção em que estás, depois os filtros, depois o teu termo de pesquisa, com um Limpar tudo ao lado. Confortável e Selecionar ficam na linha, porque nenhum deles muda que eventos vês.",

  "changelog.entries.the-communities-filters-fold-away.title":
    "Os filtros das comunidades recolhem-se",
  "changelog.entries.the-communities-filters-fold-away.body":
    "Sete etiquetas de categoria, uma gaveta de tags, dois interruptores e um controlo de ordenação estavam todos abertos por cima da grelha de comunidades, empurrando o primeiro cartão quase para fora do ecrã por causa de definições que a maioria das pessoas escolhe uma vez ou nunca. Passam a viver atrás de um único controlo Refinar, no mesmo painel que o diretório de Lisboa usa. O que está a restringir a lista, o teu termo de pesquisa incluído, aparece em etiquetas removíveis por baixo do campo de pesquisa, para que um painel fechado esconda os controlos sem esconder o que está ligado.",

  "changelog.entries.your-sort-and-your-location-both-count.title":
    "A tua ordenação e a tua localização contam as duas",
  "changelog.entries.your-sort-and-your-location-both-count.body":
    'Ligar a localização deitava fora a ordenação que tinhas escolhido. Agora as duas trabalham juntas. Por bairro mantém o agrupamento, e a tua posição ordena os bairros e os locais dentro de cada um pela proximidade. A–Z mantém-se alfabético, porque é uma ordem de consulta que a distância não melhora, e a tua posição continua a pôr o tempo a pé em cada cartão. Sem ordenação escolhida, a lista vai do mais perto para o mais longe e o controlo diz "Mais perto primeiro", para nunca prometer uma ordem que a lista não tem.',

  "changelog.entries.one-line-of-controls-on-the-directory.title":
    "Uma linha de controlos no diretório",
  "changelog.entries.one-line-of-controls-on-the-directory.body":
    "O diretório de negócios espalhava os seus controlos por duas linhas: pesquisa, localização e Refinar em cima, ordenação e o seletor Lista/Mapa em baixo, ao lado da contagem de resultados. Agora partilham uma só linha. A ordenação passou para dentro de Refinar, onde vive o resto da filtragem, e a própria gaveta é um painel com secções: tipo de local, ordenação, filtros rápidos e necessidades de acesso. Tudo o que está a restringir a lista, o teu termo de pesquisa incluído, aparece em etiquetas removíveis logo por baixo da linha de pesquisa, para que uma gaveta fechada nunca esconda o que está ligado.",

  "changelog.entries.an-empty-partner-roster-says-so.title":
    "Uma lista de parceiros vazia di-lo",
  "changelog.entries.an-empty-partner-roster-says-so.body":
    "Sem parceiros aprovados, a página de Parceiros mostrava um título, uma linha a prometer a lista completa e depois nada. A página passa a dizer com clareza que ainda não há parceiros listados e a oferecer o caminho: um botão direto para a candidatura a parceiro. A promessa da lista só aparece quando há lista.",

  "changelog.entries.the-tag-filter-opens-in-line.title":
    "O filtro de etiquetas abre em linha",
  "changelog.entries.the-tag-filter-opens-in-line.body":
    "Abrir as Etiquetas na página das comunidades fazia aparecer um painel flutuante por cima da página. Tapava o resumo da semana e a primeira fila de cartões de comunidades, e como o painel tinha altura fixa cortava também ao meio a sua própria última fila de etiquetas contra o limite de baixo, o que fazia com que parecesse avariado em vez de aberto. As etiquetas passam a abrir em linha: o painel fica por baixo do botão Etiquetas, empurra a grelha para baixo enquanto está aberto e mostra as 53 etiquetas de uma vez. No telemóvel, onde as mesmas etiquetas ocupam vários ecrãs, o painel mantém o seu próprio deslocamento para os cartões continuarem à mão.",

  "changelog.entries.pages-that-get-to-the-point.title":
    "Páginas que vão direto ao assunto",
  "changelog.entries.pages-that-get-to-the-point.body":
    "Havia uma série de páginas a abrir com um título a ocupar o ecrã todo em vez de abrirem naquilo que te levou lá. A página de eventos tinha um cabeçalho e logo a seguir um segundo, muito maior, a dizer o mesmo, com uma faixa de creme vazio por cima dos dois, e por isso a tua agenda começava bem abaixo da dobra. Agora o cabeçalho é só um, e os botões de preferências e de notificações que estavam ao lado do título antigo subiram para lá: a página abre nos teus separadores e no teu próximo evento. Outras dez páginas mantêm os títulos, as primeiras linhas e tudo o resto que já tinham, incluindo os quatro números nas pessoas que mudam as coisas, a nota e os dois botões no voluntariado, o seletor de vias nos vistos, e o cabeçalho e a história de capa na revista. O que saiu à volta foi espaço vazio, para que o primeiro lugar, o primeiro rosto, a primeira vaga e o primeiro título estejam no ecrã mal a página chega. O diretório de negócios, os temas, a habitação, o guia de chegada e os parceiros levaram o mesmo tratamento. Fora a repetição, não se tirou nada de nenhuma delas.",

  "changelog.entries.your-communities-start-at-the-cards.title":
    "As tuas comunidades começam nos cartões",
  "changelog.entries.your-communities-start-at-the-cards.body":
    "A página das comunidades abria com dois títulos empilhados um sobre o outro: o título da página e a sua entrada, e logo a seguir uma segunda saudação a dizer quase o mesmo. Juntos ocupavam quase todo o primeiro ecrã, por isso num portátil as comunidades a que pertences ficavam abaixo da dobra e era preciso rolar para chegar às tuas. Agora há um só cabeçalho. Tem a saudação, a linha sobre o que tem acontecido nas tuas comunidades e o seletor As minhas comunidades / Descobrir, e a caixa de pesquisa, os filtros e os cartões vêm logo a seguir. O Descobrir começa mais acima na página pela mesma razão.",

  // ── 27 de agosto de 2026 ──────────────────────────────────────────────────
  "changelog.entries.unused-uploads-filter.title":
    "Encontrar uploads que ninguém usa",
  "changelog.entries.unused-uploads-filter.body":
    "A consola de admin que lista todas as imagens enviadas passa a poder filtrar pelos ficheiros que nada na plataforma referencia, e também pelos que continuam em uso. Cada cartão já dizia se estava referenciado, por isso encontrar os que se podem limpar obrigava a ler a grelha cartão a cartão. O filtro reduz o que já foi carregado e continua a carregar mais do bucket enquanto nada corresponde, para nunca responder “nada sem uso aqui” a partir de uma lista carregada pela metade. Onde algumas verificações de referência não correram, o aviso de sempre mantém-se: um conjunto de referências vazio fica por verificar, por isso recarrega antes de tratar um ficheiro como seguro para eliminar.",

  // ── 26 de agosto de 2026 ──────────────────────────────────────────────────
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.title":
    "Os guias aparecem depois de uma editora os verificar",
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.body":
    "Um guia só te chega depois de uma editora o ler de ponta a ponta e confirmar que está correto. Isto abrange o índice de guias, a biblioteca, a pesquisa e as próprias páginas dos guias: abrir uma que ainda não passou pela revisão mostra as linhas de apoio e uma nota honesta sobre o ponto em que está. Estas são páginas que se abrem numa crise, por isso a exigência para mostrar uma é que alguém com nome tenha assumido a responsabilidade pelas palavras. Todos os guias estão neste momento na fila de revisão, por isso as prateleiras começam vazias e enchem à medida que cada um for aprovado. Vieram mais duas coisas com isto. Um guia cuja revisão apenas ficou em atraso mantém-se no ar e diz isso no rodapé. E quem não tem sessão iniciada passa a ver o mesmo texto e as mesmas datas de revisão que um membro vê, porque um adolescente com dúvidas não devia ter de se inscrever para ler um guia de saúde.",
  "changelog.entries.the-rules-open-without-leaving-the-queue.title":
    "As regras de moderação abrem sem sair da fila",
  "changelog.entries.the-rules-open-without-leaving-the-queue.body":
    "A nota que está no topo de cada fila de moderação remete para as linhas vermelhas e para onde a plataforma se posiciona, e até agora ler qualquer uma delas obrigava a sair da página a meio de uma decisão, com uma denúncia ou um pedido de adesão por ler. As duas referências passam a abrir uma janela por cima da fila: um resumo curto escrito para a decisão que está a ser tomada, com o único teste que separa a crítica a um Estado de um assunto do Código de Conduta, o que significa a autodeterminação para quem avalia uma candidatura, e o que resulta de uma violação confirmada. Um botão na janela leva à página completa para quem quiser o texto todo.",
  "changelog.entries.reporting-that-someone-outed-you.title":
    "Denunciar que alguém te expôs",
  "changelog.entries.reporting-that-someone-outed-you.body":
    "Dois formulários de denúncia não ofereciam outing nem doxxing como motivo: o formulário principal de denúncia, que qualquer pessoa alcança sem sequer ter sessão iniciada, e a caixa de denúncia nas perguntas públicas de um anúncio de negócio. Esses dois motivos são os únicos que enviam uma denúncia diretamente para a fila de emergência. Feita como assédio ou como outra coisa qualquer, a mesma denúncia era lida num relógio mais lento. Se foi contigo, a culpa não foi tua de forma nenhuma. Faltavam ao formulário as palavras para o que aconteceu. Ambos os formulários passam a ter os dois motivos, escritos como aquilo que te aconteceu e não no nosso vocabulário: “Alguém revelou que sou LGBTQ+ sem o meu consentimento”. Denunciar um convívio ganhou assédio e discriminação, e denunciar uma persona ganhou discriminação. A lista de motivos em oito formulários passa a vir do servidor em vez de uma segunda cópia guardada aqui, para que as opções não voltem a ficar atrás daquilo que a plataforma trata. Se a ligação cair enquanto estás a denunciar, o formulário continua a abrir com a lista completa e a tua denúncia segue à mesma.",
  "changelog.entries.a-quieter-option-before-you-go.title":
    "Uma opção mais calma antes de apagares a conta",
  "changelog.entries.a-quieter-option-before-you-go.body":
    "Ao lado de desativar e apagar estava uma oferta para pôr todas as notificações em pausa durante 30 dias. Era um botão ligado a nada: esse interruptor não existia, e a QueerPulse não envia email nenhum para pôr em pausa. À frente de quem está a pesar se fica ou se vai embora é o pior sítio possível para uma promessa que não podemos cumprir, por isso essa faixa leva-te agora às tuas definições de notificações, onde podes escolher que tipos chegam até ti e definir horas de silêncio para o telemóvel ficar quieto durante a noite. Essas duas coisas existem mesmo.",
  "changelog.entries.a-refused-moderation-action-says-why.title":
    "Quem modera fica a saber porque é que uma ação foi recusada",
  "changelog.entries.a-refused-moderation-action-says-why.body":
    "Avisar, restringir, suspender ou banir recai sobre quem escreveu aquilo que foi denunciado, e às vezes não há uma única pessoa sobre quem isso possa recair: não há ninguém por trás de um anúncio não reivindicado nem de uma conta apagada, uma denúncia pode abranger uma pergunta e a resposta por baixo dela escritas por duas pessoas diferentes, e as contas da casa e da equipa nunca são alvo desta fila. Tudo isto falhava com “Não foi possível contactar o serviço de segurança”, o que era falso nas duas metades. O serviço respondia, e recusava por um motivo concreto que quem modera nunca chegava a ver. Cada caso passa a dizer o que aconteceu e o que fazer em vez disso, e não oferece tentar de novo, porque tentar de novo dá a mesma resposta. O caso da pergunta e da resposta é o mais importante: era resolvido para quem tinha feito a pergunta mesmo quando o que fora denunciado era a resposta, por isso uma sanção podia cair na pessoa errada. Esconder, remover, arquivar e escalar continuam disponíveis na denúncia em todos os casos. A gaveta também deixou de dizer que banir estava indisponível enquanto mostrava um botão Banir.",
  "changelog.entries.the-decision-sample-says-who-decided.title":
    "A amostra de decisões diz quem decidiu cada uma",
  "changelog.entries.the-decision-sample-says-who-decided.body":
    "A amostra de decisões recentes sobre convites identificava cada uma com uma referência de conta, o que não dizia nada de útil a quem revê. Passa a nomear quem decidiu, e as tuas próprias decisões leem-se como “Tu”. Podes reduzir a mesma amostra a uma só pessoa, que é assim que uma leitura incoerente das diretrizes de revisão se torna visível. Nada aqui conta, ordena ou pontua ninguém: a única pergunta a que um nome responde é de quem é a leitura das diretrizes que estás a ver.",
  "changelog.entries.communities-your-connections-already-joined.title":
    "Comunidades onde as tuas pessoas já estão",
  "changelog.entries.communities-your-connections-already-joined.body":
    "A página de comunidades passa a mostrar uma lista curta de grupos onde as pessoas com quem tens ligação já entraram e tu não, por ordem de quantas delas estão em cada um. É a pergunta que farias a uma amiga de qualquer forma. Quando não há nada que valha a pena sugerir, a secção sai da frente em vez de ficar ali vazia.",
  "changelog.entries.follow-your-listing-claim.title":
    "Acompanha a reivindicação do teu anúncio do princípio ao fim",
  "changelog.entries.follow-your-listing-claim.body":
    "Se reivindicaste um anúncio de negócio, passa a haver uma página para isso. Mostra em que ponto está cada pedido, há quanto tempo espera e a data em que dissemos que decidiríamos. O formulário diz-te esse mesmo prazo antes de submeteres, e também que provas tornam um pedido simples de aprovar. Não te é enviado nenhum email: voltas aqui para ver.",
  "changelog.entries.the-accessibility-statement-is-published.title":
    "A declaração de acessibilidade está publicada",
  "changelog.entries.the-accessibility-statement-is-published.body":
    "Passa a existir uma declaração de acessibilidade publicada, com ligação no rodapé e na navegação principal. Diz o que a plataforma faz por quem usa leitor de ecrã, teclado ou movimento reduzido, e é direta sobre o que ainda não foi auditado, em vez de reclamar um selo que ninguém verificou. Também expõe onde está mesmo a lei portuguesa: o Decreto-Lei 82/2022 muito provavelmente não alcança uma plataforma como esta, por isso publicamos a declaração por escolha nossa, e se a nossa resposta não te chegar ela diz-te exatamente onde seguir.",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.title":
    "A política de privacidade diz o que guarda, e por quanto tempo",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.body":
    "A secção de retenção eram três frases. Passa a ser um calendário completo: cada tipo de dados e o momento em que deixa de ser guardado. Estão nomeados dez fornecedores de serviços. Desapareceu um subcontratante que estava listado mas nunca chegou a ser usado. Cada direito que a política enumera aponta agora para uma página onde o podes exercer, em vez de apontar para um endereço.",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.title":
    "O que dissemos que apagávamos passa a ser apagado",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.body":
    "As necessidades de acesso e as notas alimentares que dás a quem organiza são apagadas 30 dias depois do encontro, juntamente com o registo de que fizeste check-in. A tua confirmação de presença fica, para um encontro passado manter a contagem. Depois de os check-ins desaparecerem, quem organiza vê “já não é guardado” onde antes estava o número de chegadas, para que um encontro já limpo nunca seja lido como um encontro a que ninguém foi, e o ecrã da porta deixa de registar novas chegadas num encontro com essa idade. As ligações de exportação de dados passam a expirar ao fim dos sete dias prometidos na política, em vez de continuarem a funcionar durante trinta.",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.title":
    "As denúncias dizem porque te estão a travar",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.body":
    "Fazer várias denúncias seguidas devolvia um erro genérico, que se lê exatamente como ser mandade embora. Agora diz com clareza que te está a travar por uns instantes, e porquê, para que um limite de ritmo nunca pareça uma denúncia rejeitada. Foi corrigida também uma falha que mostrava uma mensagem técnica em bruto em vez de uma frase.",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.title":
    "As decisões em lote sobre pedidos de convite passam a pedir confirmação",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.body":
    "Aprovar ou pôr em lista de espera um lote de pedidos de convite acontecia logo ao primeiro clique, sem confirmação e sem volta atrás. Agora pergunta primeiro. Quando parte do lote falha, quem modera vê que pedido falhou e porquê, e esses pedidos ficam selecionados para só esses serem tentados de novo. Chegou com isto o selecionar tudo, e o limite de quantos podem ser selecionados está à vista em vez de ser aplicado em silêncio.",
  "changelog.entries.decision-sampling-sits-with-the-queue.title":
    "A amostragem de decisões passou para a fila que analisa",
  "changelog.entries.decision-sampling-sits-with-the-queue.body":
    "A amostra de decisões recentes sobre convites, a verificação de que quem revê está a decidir de forma coerente entre si, vivia numa página só de administração. Quem modera, cujo trabalho ela analisa, não conseguia abri-la. Passa a estar na própria fila de pedidos de convite, onde quem faz a revisão a pode ler.",
  "changelog.entries.every-moderation-queue-reports-its-health.title":
    "Cada fila de moderação dá conta do seu estado",
  "changelog.entries.every-moderation-queue-reports-its-health.body":
    "Um painel novo mostra de uma vez tudo o que está à espera na moderação: a dimensão de cada fila, há quanto tempo espera o item mais antigo, quanto já passou um prazo que publicámos e quanto é que ainda ninguém pegou. Quando uma fila passa um limite, quem modera recebe um aviso dentro da aplicação, e outro quando a fila desanuvia. Não vai nada para o telemóvel de ninguém.",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.title":
    "Arrumação: o serviço de email e dois becos sem saída",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.body":
    "O serviço de envio de email que existiu por pouco tempo no backend desapareceu, o que volta a pôr o código de acordo com a decisão de que a QueerPulse não envia email. Foi-se com ele a página do protótipo de evento já retirada: a ligação leva-te agora ao quadro de convívios. Foi também removido um endpoint de terminar sessão que não era usado.",

  "changelog.entries.the-about-page-shows-its-work-in-place.title":
    "A página Sobre mostra o seu trabalho ali mesmo",
  "changelog.entries.the-about-page-shows-its-work-in-place.body":
    "Todos os links de referência da página Sobre te levavam para fora dela a meio do argumento, por isso ir confirmar o que sustentava uma posição significava perder o teu lugar. Esses links passam a abrir um diálogo por cima da página: um resumo da cláusula das diretrizes, do guia de saúde, da secção de interseccionalidade ou do registo de governação para onde apontam, escrito para a afirmação que o levantou, com um botão para a página completa se quiseres tudo. Os dois links “lê as diretrizes” da secção Onde nos posicionamos abrem agora resumos diferentes, porque um chega-te a partir da posição sobre as vidas trans e o outro a partir da Palestina, e a cláusula responde a uma pergunta diferente em cada sítio.",
  "changelog.entries.perks-that-grant-something-real.title":
    "Vantagens que dão algo real",
  "changelog.entries.perks-that-grant-something-real.body":
    "A escada de reconhecimento dava um número e não mudava nada. As vantagens ao teu alcance passam a poder ser reclamadas, e uma vantagem de convites reclamada aumenta mesmo a tua quota mensal. As vantagens que a plataforma não conseguia cumprir saíram da página.",
  "changelog.entries.renew-your-card-before-it-runs-out.title":
    "Renova o teu cartão antes de expirar",
  "changelog.entries.renew-your-card-before-it-runs-out.body":
    "Quando a tua comunidade o permite, podes renovar um cartão de membro a partir da tua conta, sem esperar que a organização volte a emitir a lista toda. Recebes também um aviso na aplicação trinta dias antes de o cartão terminar.",
  "changelog.entries.volunteering-that-counts.title": "Voluntariado que conta",
  "changelog.entries.volunteering-that-counts.body":
    "Quem publicou a oportunidade pode agora confirmar que apareceste e registar as horas. As sessões confirmadas dão pontos de reconhecimento, e o teu total fica na página de voluntariado. Organizar um encontro e publicar na revista também contam.",
  "changelog.entries.support-offers-a-community-receives.title":
    "Ofertas de apoio que a comunidade recebe",
  "changelog.entries.support-offers-a-community-receives.body":
    "Quando a equipa oferece ajuda a uma comunidade em dificuldade, ela chega agora ao destino. A moderação recebe uma notificação e vê o que foi oferecido nas Ferramentas de moderação, onde pode responder sim ou agora não.",
  "changelog.entries.see-how-often-your-cards-are-checked.title":
    "Vê quantas vezes os cartões são verificados",
  "changelog.entries.see-how-often-your-cards-are-checked.body":
    "Se a tua comunidade emite cartões de membro, as Ferramentas de moderação mostram agora quantas vezes foram verificados, e cada cartão tem a sua própria contagem. Não fica registado quem verificou nem onde, e o registo é mantido durante noventa dias.",
  "changelog.entries.check-what-happened-to-your-invite-request.title":
    "Podes saber o que aconteceu ao teu pedido de convite",
  "changelog.entries.check-what-happened-to-your-invite-request.body":
    "Pedir para entrar acabava em silêncio. Agora, quando envias um pedido, ficas com um código de referência. Introduz esse código quando quiseres e a página de estado diz-te com clareza como está: ainda em leitura, aprovado ou recusado. Se for sim, o teu convite está lá à tua espera, por isso uma aprovação já não se pode perder pelo caminho.",
  "changelog.entries.an-invite-you-can-address-to-a-person.title":
    "Um convite que podes dirigir a uma pessoa",
  "changelog.entries.an-invite-you-can-address-to-a-person.body":
    "Ao criares um convite podes agora indicar o email da pessoa a quem se destina. É opcional. Se o preencheres, só quem iniciar sessão com esse endereço consegue usar o link, por isso um convite reencaminhado ou fotografado não deixa entrar mais ninguém. Isto conta, porque quem usa o teu convite chega com o teu nome como quem responde por essa pessoa. Se deixares em branco, o link continua a funcionar para qualquer pessoa que o tenha. Em qualquer dos casos não enviamos nada para esse endereço: o link passas tu.",
  "changelog.entries.your-invites-are-where-you-can-find-them.title":
    "Os teus convites estão onde os irias procurar",
  "changelog.entries.your-invites-are-where-you-can-find-them.body":
    'Convidar alguém estava escondido atrás de um único botão na página de ligações, e por isso os convites por usar expiravam sem ninguém dar conta. Passa a haver uma linha "Convidar alguém" no menu da conta, com a contagem do que te resta este mês, e um pequeno cartão no teu perfil a dizer quando o limite renova. Os convites enviados mostram também a quem se destinavam, com um botão para copiar cada link ainda válido.',
  "changelog.entries.account-security-has-a-real-home.title":
    "A segurança da conta tem finalmente uma página sua",
  "changelog.entries.account-security-has-a-real-home.body":
    'Carregar em "segurança" nas definições abria a nossa política de divulgação de vulnerabilidades para investigadores, que não é o que ninguém andava à procura. Essa política mudou para a secção de políticas, onde faz sentido. No lugar dela está agora uma página sobre a tua conta: como inicias sessão, quantas sessões estão abertas, que dispositivos recebem notificações e onde transferir ou apagar os teus dados. Onde ainda não existe alguma coisa, a página diz isso mesmo em vez de fingir.',
  "changelog.entries.your-photos-come-with-your-export.title":
    "As tuas fotografias vão com a exportação de dados",
  "changelog.entries.your-photos-come-with-your-export.body":
    "A exportação descrevia as tuas imagens sem as incluir, e os links deixavam de funcionar assim que a conta desaparecia. Todos os ficheiros que carregaste vão agora dentro do arquivo, com um índice a dizer o que é cada um. Os teus textos e rascunhos da revista, as comunidades de que és dono e as publicações que lá escreveste, o teu voluntariado, os teus votos de governança e as tuas avaliações vão também. Escolhe o formato CSV ou Ambos para receberes os ficheiros.",
  "changelog.entries.every-page-announces-itself.title":
    "Cada página anuncia-se a um leitor de ecrã",
  "changelog.entries.every-page-announces-itself.body":
    "Mudar de página era silencioso para quem usa um leitor de ecrã, o que tornava a aplicação difícil de acompanhar. Cada página diz agora o seu nome ao abrir e coloca-te no início do conteúdo. Os ecrãs de administração e de início de sessão ganharam uma ligação para saltar para o conteúdo e uma zona principal em condições, e os editores de governança podem ser reordenados com botões, por isso arrumar uma lista já não obriga a arrastar com o rato.",
  "changelog.entries.the-contact-form-reaches-a-person.title":
    "O formulário de contacto chega a uma pessoa",
  "changelog.entries.the-contact-form-reaches-a-person.body":
    "As mensagens enviadas pelos formulários de contacto e de parcerias ficavam guardadas onde ninguém as podia ler, e o mesmo acontecia com onze dos doze formulários de candidatura e sugestão espalhados pelo site. Candidaturas a apoios, sugestões de correção, ofertas para acolher encontros sem álcool, inscrições em painéis e as submissões da Cultura chegam agora todas a uma consola que a equipa percorre, com registo de quem tratou de cada uma e quando.",
  "changelog.entries.an-approved-invite-can-be-found-again.title":
    "Um convite aprovado volta a poder ser encontrado",
  "changelog.entries.an-approved-invite-can-be-found-again.body":
    "Quando alguém da equipa aceitava uma pessoa, o link do convite aparecia uma vez e desaparecia no refrescar seguinte, deixando quem esperava sem nada. Os pedidos já decididos passam a ter o seu próprio separador, com o link guardado ao lado, a validade à vista e uma forma de emitir de novo o que expirou. Qualquer moderador o pode fazer, quando antes só conseguia quem tinha tomado a decisão original.",
  "changelog.entries.no-stock-photo-on-a-real-application.title":
    "Nenhuma fotografia de arquivo numa candidatura real",
  "changelog.entries.no-stock-photo-on-a-real-application.body":
    "Os ecrãs de administração associavam pessoas pelo nome a um conjunto de fotografias de exemplo usadas na nossa demonstração, o que significa que uma candidata real podia aparecer a quem a avaliava com a cara de um estranho. Onde há pessoas reais em lista passa a usar-se a fotografia delas, ou as iniciais quando não têm nenhuma.",

  "changelog.entries.the-transparency-report-is-published.title":
    "O relatório de transparência foi publicado",
  "changelog.entries.the-transparency-report-is-published.body":
    "A nossa constituição sempre falou de um relatório de transparência. Agora existe. Todos os trimestres publica o que foi denunciado e porquê, quanto tempo demoraram as decisões, que medidas foram tomadas e quantos recursos foram aceites. Só números, contados a partir do registo de moderação. Os valores muito baixos ficam reservados para que nenhum número possa ser ligado a uma pessoa.",
  "changelog.entries.a-permanent-ban-needs-two-moderators.title":
    "Uma remoção definitiva passa a precisar de um segundo moderador",
  "changelog.entries.a-permanent-ban-needs-two-moderators.body":
    "O artigo VIII dizia que uma remoção tem de ser ratificada por outro moderador. Agora o software cumpre isso. Quando um moderador bane alguém de forma definitiva, o conteúdo nocivo é retirado de imediato e a decisão sobre a conta fica à espera da confirmação de um segundo moderador. Se ninguém confirmar em 72 horas, a suspensão caduca sozinha.",
  "changelog.entries.appeals-have-a-deadline.title":
    "Os recursos passam a ter um prazo que é medido",
  "changelog.entries.appeals-have-a-deadline.body":
    "O código de conduta dá-te 14 dias para recorrer e promete uma decisão em 7. Os dois prazos ficam agora registados em cada recurso, e a fila de revisão está ordenada pelo que vence primeiro, para que nenhum recurso fique esquecido. Também podes recorrer de uma expulsão de uma comunidade e de uma restrição, o que antes era impossível.",
  "changelog.entries.a-community-ban-can-end.title":
    "Uma expulsão de uma comunidade pode ter data de fim",
  "changelog.entries.a-community-ban-can-end.body":
    "Sair de uma comunidade a pedido da moderação era definitivo e sem explicação. A moderação pode agora definir uma data de fim, e passas a saber o que aconteceu: o motivo, a regra da casa em que se baseia e o dia em que termina. Uma semana difícil deixa de significar perder um espaço para sempre.",
  "changelog.entries.a-warning-now-reaches-you.title":
    "Um aviso passa mesmo a chegar-te",
  "changelog.entries.a-warning-now-reaches-you.body":
    "Se uma publicação, uma resposta, uma mensagem ou um comentário teu recebia um aviso, ninguém te dizia nada. A denúncia era fechada, o registo dizia que tinhas sido avisado e tu nunca soubeste. Os avisos passam a chegar a quem escreveu, com o motivo incluído.",
  "changelog.entries.community-mods-can-read-what-was-reported.title":
    "A moderação de uma comunidade passa a ver o que foi denunciado",
  "changelog.entries.community-mods-can-read-what-was-reported.body":
    "Ao abrir uma denúncia, a moderação via um motivo e uma data e tinha de decidir se removia algo que não conseguia ler. As denúncias passam a incluir a publicação, quem a escreveu, o grau de urgência e o prazo. As denúncias urgentes sobre exposição ou dados pessoais seguem para a equipa com formação.",

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
};
