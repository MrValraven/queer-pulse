import type { Catalog } from "../../types";

/**
 * Resources — pt-PT inclusivo. Mesmas chaves que `en/resources.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members" → *pessoas*, nunca *Membros*.
 * - Nomes próprios do mundo real (organizações, linhas de apoio, estatutos —
 *   ACT, SNS, ILGA Portugal, SOS Voz Amiga) NÃO são traduzidos.
 * - Conteúdo fictício (bios de terapeutas/advogados mock) fica em inglês —
 *   ver os catálogos dessas secções mais abaixo — porque em modo live vem da
 *   API como texto de quem o escreveu.
 * - Este ficheiro cobre informação de segurança/saúde/legal real para a
 *   comunidade queer em Lisboa — a fidelidade ao significado tem prioridade
 *   sobre a fluidez; ver relatório para pontos que merecem revisão nativa.
 */
export const resources: Catalog = {
  // ── Partilhado: ResourceModal ───────────────────────────────────────────
  "modal.closeAriaLabel": "Fechar",
  "modal.resultAriaLabel": "Confirmação",
  "modal.doneCta": "Concluído",

  // ── Partilhado: CrisisStrip ──────────────────────────────────────────────
  "crisis.ariaLabel": "Crise e apoio de emergência",
  "crisis.title": "Em crise <em>agora mesmo?</em>",
  "crisis.body":
    "Se estás em perigo imediato, liga para o <strong>112</strong>. Estas linhas são gratuitas e confidenciais. Toca para ligar, ou copia o número.",
  "crisis.jumpCta": "Todos os recursos de crise",
  // crisisStrip.data.ts — nomes reais de linhas de apoio mantidos como estão;
  // só a parte descritiva e o horário são traduzidos. Assinalar para revisão
  // nativa: exatidão das linhas de crise.
  "crisis.line.emergency.name": "Emergência (polícia · ambulância)",
  "crisis.line.emergency.hours": "Sempre · gratuito",
  "crisis.line.sosVozAmiga.name": "SOS Voz Amiga",
  "crisis.line.sosVozAmiga.hours": "Diariamente 16h a 24h",
  "crisis.line.ilga.name": "ILGA Portugal · Linha de apoio LGBTQ+",
  "crisis.line.ilga.hours": "Qui a Sex, 20h a 23h",

  // ── Partilhado: SuggestEditModal + SuggestEditTrigger (CNT-12: alargado
  // para além do Glossário, para Direito, Saúde Trans, Redução de Danos,
  // Saúde Mental e a grade da Biblioteca — o mesmo `POST /intakes/suggest_edit`
  // genérico). ───────────────────────────────────────────────────────────
  "suggestEdit.modalTitle": "Sugerir uma alteração",
  "suggestEdit.pageTriggerCta": "Sugerir uma alteração",
  "suggestEdit.success.title": "Sugestão <em>recebida.</em>",
  "suggestEdit.success.sub":
    "A equipa editorial analisa as sugestões todas as semanas e discute as alterações maiores na assembleia mensal. Este documento está vivo precisamente graças a sugestões como a tua.",
  "suggestEdit.body.intro":
    "Editado pela comunidade. Se uma definição parecer incompleta ou incorreta, diz-nos qual o termo e o que mudarias.",
  "suggestEdit.body.introSubject":
    "Há algo nesta página desatualizado ou errado? Diz-nos o que devemos corrigir.",
  "suggestEdit.body.introPicker":
    "Diz-nos que guia precisa de ser atualizado e o que mudarias.",
  // PRD-264: ver a nota no catálogo EN.
  "suggestEdit.newTerm.modalTitle": "Sugerir um termo",
  "suggestEdit.body.introNewTerm":
    "Falta uma palavra que ouves a toda a hora? Diz-nos o termo e o que significa para ti, e a equipa editorial trata do resto.",
  "suggestEdit.form.newTermNameLabel": "O termo",
  "suggestEdit.form.newTermNamePlaceholder":
    "A palavra ou expressão, tal como as pessoas a dizem",
  "suggestEdit.form.newTermDefinitionLabel": "O que significa",
  "suggestEdit.form.newTermDefinitionPlaceholder":
    "Como o explicarias a alguém que o ouve pela primeira vez. Também ajuda dizeres onde o ouviste.",
  "suggestEdit.form.termLabel": "Que termo",
  "suggestEdit.form.subjectLabel": "De que se trata?",
  "suggestEdit.form.subjectFixedLabel": "A sugerir uma alteração para",
  "suggestEdit.form.selectPlaceholder": "Seleciona um termo…",
  "suggestEdit.form.selectPlaceholderGeneric": "Escolhe do que se trata…",
  "suggestEdit.form.newTermOption": "Um termo que falta",
  "suggestEdit.form.otherOption": "Outra coisa",
  "suggestEdit.form.changeLabel": "Alteração sugerida",
  "suggestEdit.form.changePlaceholder":
    "O que está mal e como o escreverias. Podes juntar fontes, se as tiveres.",
  "suggestEdit.cancelCta": "Cancelar",
  "suggestEdit.sendingLabel": "A enviar…",
  "suggestEdit.sendCta": "Enviar sugestão",

  // ── LegalPage ───────────────────────────────────────────────────────────
  // Informação legal/de segurança — assinalar para revisão nativa.
  "legal.meta.title":
    "Direitos legais LGBTQ+ em Portugal: trabalho, habitação e saúde",
  "legal.meta.description":
    "Conhece os teus direitos no trabalho, na habitação e na saúde como pessoa LGBTQ+ em Portugal, e encontra um diretório de advocacia queer-friendly em Lisboa, verificado pela comunidade.",
  "legal.hero.eyebrow": "Apoio Jurídico",
  "legal.hero.title":
    "Conhece os teus direitos. <em>Guarda os comprovativos.</em>",
  "legal.hero.lead":
    "Guias jurídicos, advocacia queer-friendly e recursos sobre discriminação para pessoas LGBTQ+ em Portugal, porque conhecer os teus direitos é o primeiro passo para os defenderes.",
  "legal.hero.anchor.workplace": "Direitos no trabalho",
  "legal.hero.anchor.housing": "Direitos na habitação",
  "legal.hero.anchor.healthcare": "Direitos na saúde",
  "legal.hero.anchor.lawyers": "Diretório de advocacia",
  "legal.hero.backLink": "Guia de Segurança",

  "legal.badge.protected": "Direito protegido",
  "legal.badge.know": "Fica a saber",
  "legal.badge.practical": "Prático",

  "legal.workplace.title": "Direitos no <em>trabalho</em>",
  "legal.workplace.lead":
    "O Código do Trabalho português proíbe a discriminação com base na orientação sexual e na identidade de género. Eis o que isso significa na prática.",
  "legal.workplace.dismissal.title": "Proteção contra despedimento",
  "legal.workplace.dismissal.body":
    "A tua orientação sexual ou identidade de género não pode ser motivo legal de despedimento. O despedimento indireto (tornar as condições intoleráveis) também é proibido. Guarda registo de tudo.",
  "legal.workplace.harassment.title": "Assédio no trabalho",
  "legal.workplace.harassment.body":
    "O assédio com base na orientação sexual ou identidade de género é ilegal. A tua entidade empregadora tem o dever legal de investigar queixas. A falta de ação torna-a responsável. Documenta cada incidente com datas.",
  "legal.workplace.pronouns.title": "Pronomes e nome no trabalho",
  "legal.workplace.pronouns.body":
    "Insistir em tratar alguém pelo género errado depois de uma correção pode constituir assédio. Pessoas trans têm o direito de usar no trabalho o nome que preferem, antes de qualquer alteração legal do nome.",
  "legal.workplace.complaint.title": "Fazer uma queixa",
  "legal.workplace.complaint.body":
    "A ACT (Autoridade para as Condições do Trabalho) trata das queixas de discriminação no trabalho. Podes denunciar de forma anónima. Temos um guia passo a passo e um modelo de carta de queixa.",

  "legal.link.readGuide": "Ler o guia completo",
  "legal.link.getTemplate": "Obter o modelo",
  "legal.link.findSupport": "Encontrar apoio",
  "legal.link.transHubGuide": "Guia do Trans Hub",
  "legal.link.reportRefusal": "Denunciar uma recusa",
  "legal.link.prepGuide": "Guia de acesso à PrEP",

  "legal.housing.title": "Direitos na <em>habitação</em>",
  "legal.housing.lead":
    "A discriminação no arrendamento é ilegal em Portugal. Na prática, ainda acontece: eis como reagir.",
  "legal.housing.rental.title": "Discriminação no arrendamento",
  "legal.housing.rental.body":
    "Se uma pessoa senhoria se recusar a arrendar-te casa por causa da tua orientação sexual ou identidade de género, está a agir ilegalmente. Documenta qualquer prova: capturas de ecrã, gravações com consentimento, recusas por escrito.",
  "legal.housing.samesex.title": "Casais do mesmo sexo e arrendamento",
  "legal.housing.samesex.body":
    "Casais do mesmo sexo têm direitos iguais nos contratos de arrendamento. As duas pessoas podem constar do contrato. Existem proteções contra a perda da casa se uma delas sair ou falecer.",
  "legal.housing.eviction.title": "Proteções contra despejo",
  "legal.housing.eviction.body":
    "Há proteções adicionais contra o despejo por motivos discriminatórios. Se corres o risco de perder a casa numa zona em gentrificação, há quem se organize na comunidade para ajudar: contacta a Catarina Vaz através da QueerPulse.",

  "legal.healthcare.title": "Direitos na <em>saúde</em>",
  "legal.healthcare.lead":
    "As pessoas LGBTQ+ em Portugal têm pleno direito de acesso à saúde pública. O acesso específico para pessoas trans melhorou significativamente desde 2018.",
  "legal.healthcare.sns.title": "Saúde trans através do SNS",
  "legal.healthcare.sns.body":
    "Desde 2018, os cuidados de saúde trans, incluindo terapia hormonal e procedimentos cirúrgicos, estão disponíveis através do SNS. Existem listas de espera, e temos um guia para te orientares nelas.",
  "legal.healthcare.refusal.title": "Recusa de tratamento",
  "legal.healthcare.refusal.body":
    "A lei proíbe os serviços e profissionais de saúde de recusar tratamento com base na orientação sexual ou identidade de género. Se isto acontecer, documenta tudo e contacta de imediato a ILGA Portugal.",
  "legal.healthcare.prep.title": "Acesso à PrEP",
  "legal.healthcare.prep.body":
    "A PrEP está disponível através do SNS sem custos se cumprires os critérios de elegibilidade. O nosso guia explica o processo passo a passo, incluindo as clínicas mais acolhedoras em Lisboa.",

  "legal.lawyers.title": "Advocacia <em>queer-friendly</em>",
  "legal.lawyers.lead":
    "Experiência específica em casos LGBTQ+ em Portugal, com verificação feita por pessoas da comunidade. A primeira consulta é gratuita para quem faz parte da QueerPulse.",
  "legal.lawyers.requestConsultationCta": "Pedir consulta",

  "legal.outro.title": "Tens <em>direitos.</em>",
  "legal.outro.sub":
    "O conhecimento é a primeira linha de defesa. Partilha estes recursos com quem precisar deles.",
  "legal.outro.requestInviteCta": "Pedir um convite",

  // ── CommunityPrivacyPage ────────────────────────────────────────────────
  "communityPrivacy.meta.title":
    "Privacidade na QueerPulse: o que é visível e para quem",
  "communityPrivacy.meta.description":
    "O que uma comunidade privada esconde de quem está fora dela, o que as pessoas que lá estão conseguem ver e o que fica fora do teu perfil.",
  "communityPrivacy.hero.eyebrow": "Comunidades · Privacidade",
  "communityPrivacy.hero.title": "Privacidade nas <em>comunidades.</em>",
  "communityPrivacy.hero.lead":
    "Uma comunidade privada fica escondida de quem não faz parte dela. Aqui está o que aparece no teu perfil, dentro de uma comunidade e para quem está de fora, para decidires onde entrar e o que partilhar.",
  "communityPrivacy.hero.anchor.tiers": "O que aparece onde",
  "communityPrivacy.hero.anchor.controls": "Os teus controlos",

  "communityPrivacy.tiers.title": "O que aparece <em>onde</em>",
  "communityPrivacy.tiers.lead":
    "Três sítios onde olhar: o teu perfil, o interior de uma comunidade e o exterior.",
  "communityPrivacy.tier.public.title": "No teu perfil",
  "communityPrivacy.tier.public.body":
    "O teu perfil mostra apenas as comunidades que escolheres fixar, e uma comunidade privada não pode ser fixada. Entrar ou publicar numa comunidade que não seja pública não acrescenta nada à atividade do teu perfil.",
  "communityPrivacy.tier.community.title": "Dentro de uma comunidade",
  "communityPrivacy.tier.community.body":
    "Quem faz parte de uma comunidade vê quem mais lá está, e as publicações de uma comunidade que não seja pública só podem ser lidas por quem pertence a ela. Nada impede alguém de repetir o que leu, por isso partilha apenas o que te deixa confortável.",
  "communityPrivacy.tier.outside.title": "Fora de uma comunidade",
  "communityPrivacy.tier.outside.body":
    "Uma comunidade privada não aparece na exploração nem na pesquisa para quem está fora dela, e só se entra por convite. As outras comunidades aparecem na exploração com o seu nível de acesso, e o resto fica fechado até entrares. Se pedires para entrar numa comunidade que analisa pedidos, as pessoas responsáveis e a moderação veem o teu pedido.",

  "communityPrivacy.controls.title": "Os teus <em>controlos</em>",
  "communityPrivacy.howTo.decline":
    "Se recusares o convite para uma comunidade, ninguém recebe nenhuma notificação. Se um convite for retirado, também não recebes nenhuma.",
  "communityPrivacy.howTo.pins":
    "Escolhes quais as comunidades que aparecem no teu perfil ao fixá-las, e podes deixar de fixar uma a qualquer momento.",
  "communityPrivacy.howTo.leaving":
    "Sair de uma comunidade não envia nenhuma notificação, e a comunidade deixa de aparecer no teu perfil.",

  "communityPrivacy.outro.title": "Partilha o que <em>te parecer certo.</em>",
  "communityPrivacy.outro.sub":
    "O resto das tuas escolhas de privacidade está nas definições da conta.",
  "communityPrivacy.outro.cta": "Abrir definições de privacidade",

  // ── SafetyPage ──────────────────────────────────────────────────────────
  "safety.meta.title":
    "Como a QueerPulse protege a tua privacidade e segurança",
  "safety.meta.description":
    "Como funcionam os níveis de visibilidade, o sistema de votos de confiança e a proteção de dados na QueerPulse, e como denunciar uma preocupação ou sair da rede.",
  "safety.hero.cat": "Segurança e privacidade",
  "safety.hero.title": "A tua visibilidade. <em>A tua escolha.</em>",
  "safety.hero.intro":
    "A QueerPulse é um espaço onde ter saído do armário, não ter saído ou estar algures pelo meio só a ti diz respeito. Eis como protegemos isso.",

  "safety.visibility.title": "Como funciona a <em>visibilidade</em>",
  "safety.visibility.body":
    "Cada pessoa escolhe o seu próprio nível de visibilidade. É uma parte central de como existes na rede, e funciona como um regulador gradual que podes ajustar quando quiseres.",
  "safety.visibility.open.title": "Disponível para conexões",
  "safety.visibility.open.body":
    "O teu perfil é visível a todas as pessoas da comunidade. Qualquer pessoa na rede pode contactar-te diretamente. Podes mudar isto a qualquer momento, sem qualquer penalização por dares um passo atrás.",
  "safety.visibility.network.title": "Só a rede",
  "safety.visibility.network.body":
    "O teu perfil é visível às pessoas da comunidade, mas o contacto direto exige uma conexão em comum. És contactável, mas com uma camada extra de conforto.",
  "safety.visibility.private.title": "Privado",
  "safety.visibility.private.body":
    "O teu perfil só é visível à equipa e a quem te deu um voto de confiança. Apareces na contagem da rede mas não na navegação. A definição certa se saíste do armário há pouco tempo, estás numa situação sensível, ou simplesmente ainda não é o momento. Não é preciso dar explicações. Nunca partilhamos fora da QueerPulse que fazes parte dela sem o teu consentimento explícito.",

  "safety.vouching.title": "O modelo de <em>voto de confiança</em>",
  "safety.vouching.body1":
    "A maior parte das pessoas chega com o voto de confiança de alguém que já está na rede; algumas são aprovadas diretamente pela nossa equipa. Seja como for, ninguém entra sem que alguém saiba quem é. É este mecanismo que dá confiança à comunidade. Quando alguém te dá um voto de confiança, está a dizer: <b>conheço esta pessoa e acho que pertence aqui.</b>",
  "safety.vouching.body2":
    "Quem dá um voto de confiança presta contas de forma real, mesmo que a responsabilidade por cada comportamento seja sempre de cada pessoa. Se uma pessoa com voto de confiança tiver um comportamento prejudicial, quem lhe deu esse voto faz parte da conversa sobre o que acontece a seguir.",

  "safety.dataUse.title": "O que <em>não fazemos</em> com os teus dados",
  "safety.dataUse.body1":
    "Não os vendemos. Não treinamos modelos com eles. Não os partilhamos com terceiros. Não fazemos publicidade. Somos uma rede pequena, financiada por quem faz parte dela, e os teus dados nunca são o produto.",
  "safety.dataUse.body2":
    "O que guardamos: o teu nome, email, conteúdo do perfil e definição de visibilidade. O que não guardamos: a tua localização para além do bairro que escolhes partilhar, o teu comportamento de navegação, ou o que dizes em mensagens privadas.",
  "safety.dataUse.body3":
    "Podes pedir-nos, a qualquer momento, tudo o que temos sobre ti ou que eliminemos a tua conta. Envia um email para <b>hello@queerpulse.com</b>.",

  "safety.report.title": "Se algo <em>não parecer bem</em>",
  "safety.report.body1":
    "Levamos as preocupações de segurança a sério, e quem lhes responde é sempre uma pessoa da nossa equipa. Se alguém fez com que te sentisses em risco, se uma mensagem passou dos limites, se algo não te parece bem, diz-nos.",
  "safety.report.body2":
    "Tratamos cada denúncia com discrição. A pessoa que denuncias só fica a saber quem és se assim o escolheres. Vamos dar seguimento.",
  "safety.report.boxTitle": "Denunciar uma preocupação",
  "safety.report.boxBody":
    "Usa o formulário de denúncia: chega diretamente à equipa de moderação, e cada denúncia é lida por uma pessoa da moderação.",
  "safety.report.formCta": "Abrir o formulário de denúncia",
  "safety.report.trackCta": "As tuas denúncias",

  "safety.leaving.title": "Sair da <em>rede</em>",
  "safety.leaving.body1":
    "Podes sair a qualquer momento. Quando o fazes, o teu perfil é removido do diretório de imediato. Quaisquer mensagens que tenhas enviado permanecem com quem as recebeu, fora do nosso alcance. As publicações no quadro são removidas. Os teus dados são eliminados no prazo de 30 dias, a menos que peças para os mantermos por um motivo específico.",
  "safety.leaving.body2":
    'Não há aqui nenhum padrão enganoso. Sem ciclo de confirmação "tens a certeza?". Sem período de reflexão de 30 dias antes da eliminação. Sais, a conta desaparece, e desejamos-te tudo de bom.',

  "safety.outro.title": "A segurança vem <em>em primeiro lugar.</em>",
  "safety.outro.sub": "Tens dúvidas sobre como funciona a rede? Escreve-nos.",
  // PRD-272: ver a nota no catálogo EN.
  "safety.outro.contactCta": "Escreve-nos",

  "safety.subpageIndex.eyebrow": "Segurança",
  "safety.subpageIndex.title": "Denúncias e direitos",
  "safety.subpage.report.label": "Denúncias e Segurança",
  "safety.subpage.report.blurb":
    "Denuncia assédio ou um espaço inseguro, e vê o que acontece a seguir.",
  "safety.subpage.hateCrime.label": "Guia de Crimes de Ódio",
  "safety.subpage.hateCrime.blurb":
    "O que conta como crime de ódio em Portugal, e como o denunciar.",
  "safety.subpage.legal.label": "Apoio Jurídico",
  "safety.subpage.legal.blurb":
    "Conhece os teus direitos e encontra apoio jurídico quando precisares.",

  // ── Queer101Page (Queer101Sections.tsx + queer101.data.ts) ─────────────
  "queer101.meta.title": "Queer 101: um guia introdutório LGBTQ+, sem pressão",
  "queer101.meta.description":
    "Para quem está a começar a explorar a sua identidade: respostas a perguntas frequentes, termos explicados e formas tranquilas de falar com alguém, sem precisar de conta.",
  "queer101.hero.backLink": "Biblioteca de Recursos",
  "queer101.hero.label": "Queer 101",
  "queer101.hero.title": "Começa aqui, seja qual for o teu <em>aqui</em>.",
  "queer101.hero.lead":
    "Para quem está a explorar a sua identidade pela primeira vez, ou só à procura das palavras certas para si. Não precisas de ter nada resolvido. Isto não é um teste.",
  "queer101.hero.reassure.noAccount":
    "Não precisas de conta para ler nada disto",
  "queer101.hero.reassure.private":
    "Nada do que lês aqui é partilhado com ninguém",
  "queer101.hero.reassure.leaveReturn":
    "Podes sair e voltar sempre que quiseres",

  "queer101.faq.title": "Perguntas <em>frequentes.</em>",
  "queer101.faq.sub":
    "Respostas honestas, sem presumir onde estás neste momento.",
  "queer101.faq.q1": "Como sei se sou queer?",
  "queer101.faq.a1":
    'Não há teste nem limite a atingir. Algumas pessoas sentem-se seguras cedo; outras demoram anos a perceber, ou nunca chegam a fixar um rótulo, e tudo isso está bem. Uma pergunta mais útil do que "sou queer?" é "o que é que me parece verdade agora?" Não deves uma resposta a ninguém, nem sequer a ti.',
  "queer101.faq.q2": "Preciso de um rótulo?",
  "queer101.faq.a2":
    'Não. Os rótulos podem ser úteis: dão-te linguagem, comunidade, e uma forma de te explicares quando quiseres. Mas também podem parecer uma jaula se não encaixarem bem. Muitas pessoas usam "queer" como um termo-guarda-chuva amplo e flexível. Outras preferem termos mais específicos. Outras não usam nenhum. Tudo isso é válido, e pode mudar.',
  "queer101.faq.q3":
    "Qual é a diferença entre identidade de género e orientação sexual?",
  "queer101.faq.a3":
    "A identidade de género tem a ver com quem és: a forma como te sentes por dentro, como homem, mulher, pessoa não binária ou outra coisa. A orientação sexual tem a ver com quem te atrai, a nível romântico, sexual ou ambos. São independentes: uma mulher trans pode ser heterossexual, lésbica, bissexual, ou qualquer outra coisa. Uma coisa não determina a outra.",
  "queer101.faq.q4":
    "Só tive relações com um género. Isso faz de mim uma pessoa heterossexual?",
  "queer101.faq.a4":
    "Não necessariamente. Identidade e experiência não são a mesma coisa. Muitas pessoas bissexuais e queer só namoraram com um género durante longos períodos das suas vidas: circunstâncias, preferência ou acaso têm todos um papel. O que importa é o que sentes agora.",
  "queer101.faq.q5":
    "Faz mal estar a questionar-me? E se nunca tiver a certeza?",
  "queer101.faq.a5":
    '"Em questionamento" é uma identidade válida por si só, com o seu próprio lugar. Algumas pessoas encontram clareza; outras percebem que a própria pergunta deixa de importar com o tempo. Não há prazo. Não saber não quer dizer que haja algo de errado contigo.',
  "queer101.faq.q6":
    "Mudei-me para Lisboa já em idade adulta e só agora estou a explorar isto. É invulgar?",
  "queer101.faq.a6":
    "De todo. Muitas pessoas descobrem que mudar-se para um sítio novo, uma cidade com vida queer visível, ou longe do ambiente onde cresceram, cria o espaço para explorar coisas que antes pareciam impossíveis. Não há idade certa. Algumas das pessoas mais vibrantes desta comunidade encontraram-se aos 40, 50 anos, ou mais tarde.",
  "queer101.faq.q7": "E se explorar e decidir que afinal não sou queer?",
  "queer101.faq.a7":
    "Também está bem. Explorar não é um compromisso. Vale a pena conhecer-te melhor, seja qual for a conclusão. Há lugar para ti aqui em qualquer fase do processo, incluindo se saíres e voltares, se ficares como pessoa aliada ou se nunca chegares a perceber.",

  "queer101.glossary.title": "Linguagem e <em>terminologia.</em>",
  "queer101.glossary.sub":
    "Um documento vivo. Editado pela comunidade: se uma definição parecer incompleta ou incorreta, assinala-a.",
  "queer101.glossary.suggestEditCta": "Sugerir uma alteração",
  "queer101.glossary.searchPlaceholder": "Pesquisar termos…",
  "queer101.glossary.notice":
    "Este glossário é um ponto de partida, aberto a contestação. A linguagem evolui, as pessoas discordam, e definições que parecem certas para uma pessoa podem parecer erradas para outra.",

  // Termos do glossário — nota: "não-binárie" e "aromântique" seguem a forma
  // neutra em -e do glossário pt-PT; "aromântique" é cunhado por analogia
  // (sinalizado no relatório para revisão nativa).
  "queer101.glossary.term.queer": "Queer",
  "queer101.glossary.def.queer":
    "Termo-guarda-chuva para identidades sexuais e de género que não são heterossexuais nem cisgénero. Reapropriado de um insulto; algumas pessoas mais velhas ainda podem achá-lo doloroso, por isso o contexto importa.",
  "queer101.glossary.term.lgbtq": "LGBTQ+",
  "queer101.glossary.def.lgbtq":
    "Lésbicas, Gays, Bissexuais, Trans, Queer/Em questionamento, e muitas outras identidades. A sigla continua a expandir-se, e o + é um atalho intencional para todas as pessoas que não aparecem na lista.",
  "queer101.glossary.term.genderIdentity": "Identidade de género",
  "queer101.glossary.def.genderIdentity":
    "O sentido interno que uma pessoa tem do seu próprio género: homem, mulher, pessoa não binária, genderfluid, ou outra coisa. Distingue-se do sexo biológico, que se refere a características físicas.",
  "queer101.glossary.term.sexualOrientation": "Orientação sexual",
  "queer101.glossary.def.sexualOrientation":
    "O padrão de atração de alguém, romântica, sexual, ou ambas. Inclui heterossexual, gay, lésbica, bissexual, pansexual, assexual, e outras.",
  "queer101.glossary.term.nonBinary": "Não-binárie",
  "queer101.glossary.def.nonBinary":
    'Uma identidade de género que não se encaixa exclusivamente em "homem" ou "mulher". É um termo-guarda-chuva que inclui genderqueer, genderfluid, agénero, e outras identidades. Muitas pessoas não binárias usam pronomes neutros, como elu/delu.',
  "queer101.glossary.term.trans": "Trans / Transgénero",
  "queer101.glossary.def.trans":
    "Uma pessoa cuja identidade de género é diferente do sexo que lhe foi atribuído à nascença. Ser trans é independente da orientação sexual: pessoas trans podem ser heterossexuais, gays, bissexuais, ou qualquer outra orientação.",
  "queer101.glossary.term.bisexual": "Bissexual",
  "queer101.glossary.def.bisexual":
    'Atração por mais do que um género. A maioria das definições abrange pessoas de géneros semelhantes e diferentes, para lá de apenas dois. Muitas vezes abreviado para "bi".',
  "queer101.glossary.term.pansexual": "Pansexual",
  "queer101.glossary.def.pansexual":
    "Atração por pessoas independentemente do género. Por vezes usado de forma intercambiável com bissexual; algumas pessoas preferem pansexual para sublinhar que o género não é um fator na sua atração.",
  "queer101.glossary.term.asexualAromantic": "Assexual / Aromântique",
  "queer101.glossary.def.asexualAromantic":
    "Assexual (ace): sente pouca ou nenhuma atração sexual. Aromântique (aro): sente pouca ou nenhuma atração romântica. As duas coisas são distintas e podem existir em qualquer combinação. Pessoas assexuais e arromânticas fazem parte da comunidade queer.",
  "queer101.glossary.term.intersex": "Intersexo",
  "queer101.glossary.def.intersex":
    "Nascer com características sexuais físicas (cromossomas, hormonas, anatomia) que não se encaixam nas definições típicas de masculino ou feminino. Cerca de 1,7% das pessoas são intersexo. Ser intersexo descreve uma realidade biológica.",
  "queer101.glossary.term.pronouns": "Pronomes",
  "queer101.glossary.def.pronouns":
    "As palavras usadas para nos referirmos a alguém quando não usamos o seu nome. Ela/dela, ele/dele, elu/delu, e outras. Usar os pronomes corretos de alguém é respeito básico; vale a pena perguntar quando há dúvida.",
  "queer101.glossary.term.comingOut": "Sair do armário",
  "queer101.glossary.def.comingOut":
    "O processo de revelar a tua identidade a outras pessoas. A maioria das pessoas queer sai do armário repetidamente ao longo da vida, para pessoas diferentes e em contextos diferentes. Não há obrigação de sair do armário para ninguém.",

  "queer101.resources.title": "Recursos <em>selecionados.</em>",
  "queer101.resources.sub":
    "Livros, filmes e guias escolhidos por pessoas da comunidade. Atualizado regularmente.",
  "queer101.resType.book": "Livro",
  "queer101.resType.film": "Filme",
  "queer101.resType.podcast": "Podcast",
  "queer101.resType.guide": "Guia",
  "queer101.resource.genderQueer.desc":
    "Memórias em banda desenhada sobre identidade de género e sexualidade, e uma das portas de entrada mais acessíveis para quem está a questionar a própria identidade.",
  "queer101.resource.stoneButchBlues.desc":
    "Um romance fundador sobre não-conformidade de género na classe trabalhadora. Disponível gratuitamente em PDF, cedido pelo espólio de Leslie Feinberg.",
  "queer101.resource.moonlight.desc":
    "Um retrato silenciosamente devastador de um homem negro queer a crescer em Miami. Sobre identidade, ternura, e o peso das expectativas das outras pessoas.",
  "queer101.resource.kidsAreAllRight.desc":
    "Um retrato caloroso e divertido de uma família lésbica a lidar com a mudança. Normalizador no melhor sentido da palavra.",
  "queer101.resource.queery.desc":
    "Entrevistas longas com pessoas queer de todos os percursos de vida. Especialmente bom para ouvir como outras pessoas viveram a exploração e a identidade.",
  "queer101.resource.comingOutHandbook.desc":
    "Um guia prático e compassivo sobre sair do armário, incluindo quando não o fazer, como te preparares, e como cuidares de ti ao longo do processo.",

  "queer101.talk.title": "Queres falar com <em>alguém?</em>",
  "queer101.talk.body":
    "Explorar a tua identidade pode ser alegre, confuso, ou as duas coisas ao mesmo tempo. Por vezes ajuda falar com alguém que já passou por algo semelhante, sem conselhos e sem pressão.",
  "queer101.talk.therapy.title": "Terapia afirmativa queer",
  "queer101.talk.therapy.desc":
    "Um diretório de terapeutas em Lisboa com perfil na QueerPulse, com as suas línguas e especialidades.",
  "queer101.talk.therapy.cta": "Encontrar terapeuta",
  "queer101.talk.askAnon.title": "Pergunta de forma anónima",
  "queer101.talk.askAnon.desc":
    "Publica uma pergunta no Fórum da comunidade sem o teu nome. Outras pessoas da comunidade podem responder.",
  "queer101.talk.askAnon.cta": "Perguntar no fórum",

  "queer101.outro.title": "Há lugar para ti <em>aqui.</em>",
  "queer101.outro.sub":
    "Onde quer que estejas no processo. Por mais tempo que demore. Esta comunidade não vai a lado nenhum.",
  "queer101.outro.joinCta": "Junta-te à QueerPulse",
  "queer101.outro.exploreCta": "Explorar comunidades",

  // ── GlossaryPage ────────────────────────────────────────────────────────
  // PRD-267: ver a nota no catálogo EN.
  "glossary.category.essential": "Essencial",
  "glossary.category.healthcare": "Saúde",
  "glossary.category.identity": "Identidade",
  "glossary.category.identityContested": "Identidade · em debate",
  "glossary.category.lisbon": "Lisboa",
  "glossary.category.performance": "Performance",
  "glossary.category.portugueseInCommunity": "Português · na comunidade",
  "glossary.category.queerpulsePlatform": "QueerPulse · plataforma",
  "glossary.meta.title": "Glossário LGBTQ+: termos queer explicados (EN/PT)",
  "glossary.meta.description":
    "Um glossário vivo de termos LGBTQ+ (identidade, saúde e palavras específicas de Lisboa) em inglês e português, atualizado e aberto a sugestões da comunidade.",
  // Nota: a GlossaryPage tem o seu PRÓPRIO alternador EN/PT para os termos
  // (`GLOSSARY_COPY`, `BLOCKS` em glossary.data.tsx). A partir do PRD-267 esse
  // alternador COMEÇA no idioma do site e só fica independente dele depois de
  // a pessoa o mudar à mão. A parte fixa continua a usar o catálogo.
  "glossary.backLink": "Biblioteca de Recursos",
  "glossary.hero.title": "Um <em>glossário</em> em construção.",
  "glossary.hero.dek":
    "Palavras usadas aqui: em toda a plataforma, na revista, nos eventos. <b>As definições são rascunhos de trabalho.</b> Onde um termo é contestado, dizemo-lo. Onde é específico de Lisboa, assinalamo-lo. <em>Sugere alterações no fundo da página; a equipa editorial analisa-as todas as semanas.</em>",
  "glossary.foot.body":
    "Este é um documento de trabalho. As sugestões são lidas pela equipa editorial semanalmente e discutidas na assembleia mensal. <em>Vamos errar; preferimos errar publicamente e corrigir.</em>",

  // ── PronounsGuidePage (+ PronounsGuideSections.tsx + pronounsGuide.data.tsx) ──
  // Conteúdo específico para pessoas trans — assinalar para revisão nativa.
  "pronounsGuide.meta.title":
    "Pronomes e nome escolhido na QueerPulse: guia prático",
  "pronounsGuide.meta.description":
    "Como a QueerPulse trata nomes escolhidos e pronomes em toda a plataforma, com respostas sobre nome morto, mudança de nome, privacidade e dados de nome legal.",

  "pronounsGuide.hero.eyebrow": "Para pessoas trans e não binárias",
  "pronounsGuide.hero.title": "Nomes, pronomes, <em>como deve ser.</em>",
  "pronounsGuide.hero.sub":
    "Como a QueerPulse trata nomes escolhidos e pronomes, e o que fazer quando o teu nome ou género muda na plataforma.",

  "pronounsGuide.basics.eyebrow": "O básico",
  "pronounsGuide.basics.title": "Nome escolhido vs. <em>nome legal.</em>",
  "pronounsGuide.basics.body1":
    "A QueerPulse usa o teu <strong>nome escolhido</strong> em todo o lado. O teu nome legal só é guardado se o tiveres fornecido em separado, por exemplo, se pediste bilhetes para um evento que o exigia. Em todos os outros contextos, usamos o nome de exibição ou o nome escolhido que puseste nas definições.",
  "pronounsGuide.basics.body2":
    "Se estás a mudar o teu nome legal e queres que a QueerPulse mostre o novo nome antes de a papelada estar concluída, podes atualizar o teu nome de exibição a qualquer momento, sem teres de apresentar documentos.",

  "pronounsGuide.whenUpdate.eyebrow": "Quando atualizas o teu nome",
  "pronounsGuide.whenUpdate.title": "O que muda, <em>e quando.</em>",
  "pronounsGuide.whenUpdate.body":
    "Atualizar o teu nome de exibição é imediato na maior parte da plataforma. Algumas coisas propagam-se um pouco mais tarde: eis o que esperar.",

  "pronounsGuide.pronouns.eyebrow": "Pronomes",
  "pronounsGuide.pronouns.title": "Definir e <em>mudar pronomes.</em>",
  "pronounsGuide.pronouns.body1":
    "Os teus pronomes aparecem na tua página de perfil, junto ao teu nome nas conversas de mensagens, e no diretório de pessoas se tiveres tornado essa secção visível. Não aparecem em URLs, notificações push, ou excertos de resultados de pesquisa.",
  "pronounsGuide.pronouns.body2":
    "Podes definir vários conjuntos de pronomes (ex.: ela/elu) e adicionar um texto personalizado se nenhuma das opções predefinidas encaixar. As alterações têm efeito imediato e podes atualizá-las as vezes que quiseres.",
  "pronounsGuide.pronouns.body3":
    "Se outra pessoa usar os pronomes errados para ti no fórum ou nas mensagens, podes denunciar através da função de denúncia em qualquer publicação ou mensagem. A nossa equipa de moderação trata o uso repetido de pronomes errados como uma violação do Código de Conduta.",

  "pronounsGuide.faq.eyebrow": "Perguntas frequentes",
  "pronounsGuide.faq.title": "Coisas que nos <em>perguntam.</em>",

  "pronounsGuide.sidebar.updateName.title":
    "Atualiza o teu <em>nome agora</em>",
  "pronounsGuide.sidebar.updateName.body":
    "Faz alterações ao teu nome de exibição, nome escolhido e pronomes nas definições do teu perfil.",
  "pronounsGuide.sidebar.updateName.cta": "Editar perfil",
  "pronounsGuide.sidebar.commitment.title": "O nosso compromisso",
  "pronounsGuide.sidebar.commitment.body":
    "A QueerPulse nunca vai exigir documentação para mudares o teu nome ou pronomes. Sem verificação de nome legal. Sem uso do nome morto pela equipa. Se algo na plataforma te tratar pelo género errado, <a>diz-nos</a> e corrigimos.",
  "pronounsGuide.sidebar.wrong.title": "Algo <em>errado?</em>",
  "pronounsGuide.sidebar.wrong.body":
    "Se encontraste o teu nome morto algures na plataforma, ou se algo não está a atualizar bem, contacta-nos diretamente.",
  "pronounsGuide.sidebar.wrong.cta": "Contacta-nos",

  "pronounsGuide.outro.title":
    "Perguntas sobre as <em>tuas definições de identidade?</em>",
  "pronounsGuide.outro.sub":
    "Escreve-nos. Respondemos no prazo de dois dias úteis.",
  "pronounsGuide.outro.cta": "Contacta-nos",

  "pronounsGuide.table.head.field": "Campo",
  "pronounsGuide.table.head.use": "Para que serve",
  "pronounsGuide.table.head.who": "Quem o vê",
  "pronounsGuide.table.displayName.field": "Nome de exibição",
  "pronounsGuide.table.displayName.use":
    "O teu nome em publicações, perfil, mensagens",
  "pronounsGuide.table.displayName.who": "Todas as pessoas",
  "pronounsGuide.table.chosenName.field": "Nome escolhido",
  "pronounsGuide.table.chosenName.use":
    "Notificações da QueerPulse, comunicações internas",
  "pronounsGuide.table.chosenName.who": "Só tu",
  "pronounsGuide.table.username.field": "Nome de utilizador",
  "pronounsGuide.table.username.use":
    "Identificador do URL (queerpulse.com/@nomedeutilizador)",
  "pronounsGuide.table.username.who": "Alterável uma vez por ano",
  "pronounsGuide.table.legalName.field": "Nome legal",
  "pronounsGuide.table.legalName.use":
    "Só se o tiveres fornecido para bilhética",
  "pronounsGuide.table.legalName.who": "Só administração + tu",

  "pronounsGuide.where.profile.title": "O teu perfil",
  "pronounsGuide.where.profile.text":
    "Atualiza-se instantaneamente. O teu novo nome aparece na tua página de perfil assim que guardas.",
  "pronounsGuide.where.profile.timing": "Imediato",
  "pronounsGuide.where.messages.title": "Mensagens",
  "pronounsGuide.where.messages.text":
    "As novas mensagens usam o teu novo nome. Os cabeçalhos de mensagens existentes atualizam-se dentro de alguns minutos.",
  "pronounsGuide.where.messages.timing": "Minutos",
  "pronounsGuide.where.forum.title": "Publicações no fórum",
  "pronounsGuide.where.forum.text":
    "Todas as tuas publicações passadas e futuras mostram o teu novo nome de exibição. Os índices de pesquisa atualizam-se durante a noite.",
  "pronounsGuide.where.forum.timing": "Até 24h para a pesquisa",
  "pronounsGuide.where.magazine.title": "Assinaturas na revista",
  "pronounsGuide.where.magazine.text":
    "Se já escreveste para a revista, envia-nos um email e atualizamos a tua assinatura em todas as edições publicadas.",
  "pronounsGuide.where.magazine.timing": "Manual · envia-nos um email",

  "pronounsGuide.faq.q1": "Posso mudar o meu nome de utilizador?",
  "pronounsGuide.faq.a1":
    "Sim, uma vez por ano. As alterações de nome de utilizador atualizam o URL do teu perfil, e os links antigos redirecionam durante 90 dias. Vai a Editar Perfil e depois a Identidade para o alterar.",
  "pronounsGuide.faq.q2": "E se o meu nome morto aparecer nalgum lugar?",
  "pronounsGuide.faq.a2":
    "Contacta-nos imediatamente através de <a>hello@queerpulse.com</a> e removemos ou atualizamos o nome com prioridade. Isto inclui assinaturas na revista, publicações antigas do fórum atribuídas ao teu nome anterior, e quaisquer arquivos de email que guardemos.",
  "pronounsGuide.faq.q3": "Mudar o meu nome afeta o meu histórico de convites?",
  "pronounsGuide.faq.a3":
    "Não. As tuas relações de convite (quem te convidou, quem convidaste) são mantidas internamente por ID de conta, por isso as mudanças de nome não têm qualquer efeito nelas.",
  "pronounsGuide.faq.q4": "Posso tornar os meus pronomes privados?",
  "pronounsGuide.faq.a4":
    "Sim, vai a Editar Perfil, depois a Visibilidade de Campos, e define Pronomes como 'Oculto'. Não vão aparecer no teu perfil nem na pesquisa de pessoas. Continuam a ser usados pela equipa em comunicações diretas.",
  "pronounsGuide.faq.q5": "E se eu não quiser especificar pronomes?",
  "pronounsGuide.faq.a5":
    "Basta deixares o campo de pronomes em branco ou por selecionar. Nenhum campo é obrigatório. Não te vamos pedir para o preencheres.",
  "pronounsGuide.faq.q6":
    "Como é que a plataforma trata os dados de nome legal?",
  "pronounsGuide.faq.a6":
    "Os dados de nome legal só são guardados se os tiveres fornecido explicitamente para um propósito que o exigisse (ex.: certas candidaturas a bolsas feitas através da plataforma). Nunca são usados como o teu nome de exibição e são guardados em separado, com controlos de acesso mais rígidos. Podes pedir a sua eliminação a qualquer momento através de <a>Exportação de Dados</a>.",

  // ── MentalHealthPage (+ MentalHealthSections.tsx + mentalHealth.data.ts) ──
  "mentalHealth.meta.title":
    "Apoio em saúde mental afirmativo para pessoas queer em Lisboa",
  "mentalHealth.meta.description":
    "Terapia afirmativa queer em Lisboa, linhas de crise para apoio imediato, e um guia prático para aceder a cuidados de saúde mental através do SNS.",
  "mentalHealth.hero.cat": "Saúde Mental",
  "mentalHealth.hero.title": "Não precisas de estar <em>bem.</em>",
  "mentalHealth.hero.sub":
    "Terapia afirmativa queer, informação honesta sobre como aceder a apoio de saúde mental em Lisboa, recursos de crise, e uma comunidade que compreende o que estás a carregar, porque nós também carregamos.",

  "mentalHealth.outro.title": "Pedir ajuda <em>conta muito.</em>",
  "mentalHealth.outro.sub":
    "É uma das coisas mais difíceis de fazer. A comunidade está aqui.",
  "mentalHealth.outro.cta": "Fala com alguém",

  "mentalHealth.therapists.title":
    "Terapia afirmativa queer <em>em Lisboa</em>",
  "mentalHealth.therapists.lead":
    "Terapeutas em Lisboa com perfil na QueerPulse. Cada perfil indica as línguas em que trabalham, as suas especialidades e se estão a aceitar novas pessoas.",
  "mentalHealth.therapists.filterLabel": "Filtrar",
  "mentalHealth.therapists.allLanguages": "Todas as línguas",
  "mentalHealth.therapists.accepting": "A aceitar",
  "mentalHealth.therapists.notTaking": "Sem vagas para novas pessoas",
  "mentalHealth.therapists.waitlist": "Lista de espera",
  "mentalHealth.therapists.viewProfileAriaLabel": "Ver o perfil de {name}",
  "mentalHealth.therapists.viewProfileCta": "Ver perfil",
  "mentalHealth.therapists.comingSoon.title":
    "Ainda não há <em>perfis de terapeutas.</em>",
  "mentalHealth.therapists.comingSoon.body":
    "Ainda não há terapeutas com perfil na QueerPulse. Ativa <b>{toggleName}</b> para explorares a demonstração.",

  "mentalHealth.experiences.title":
    "Coisas que a comunidade <em>já sentiu</em>",
  "mentalHealth.experiences.lead":
    "Ser uma pessoa queer expatriada em Lisboa traz pressões específicas. Nomeá-las é o começo de as enfrentar.",
  "mentalHealth.experience.newCommunity.title":
    "Recomeçar numa comunidade nova",
  "mentalHealth.experience.newCommunity.text":
    "Perder a tua rede social queer quando te mudas é um luto genuíno. Construir uma nova demora tempo e parece pouco natural no início. Quem cá está há mais tempo lembra-se disso: fica mesmo mais fácil, mas os primeiros meses são difíceis e não há problema em dizê-lo.",
  "mentalHealth.experience.visibility.title":
    "Navegar a visibilidade numa cultura nova",
  "mentalHealth.experience.visibility.text":
    "Lisboa é, em geral, segura, mas a visibilidade queer funciona de forma diferente aqui. Algumas pessoas sentem-se mais visíveis do que na sua terra; outras sentem-se menos. Ler situações sociais numa segunda língua ou cultura é exaustivo e desorientador de formas difíceis de explicar a quem não passou por isso.",
  "mentalHealth.experience.admin.title": "O desgaste burocrático",
  "mentalHealth.experience.admin.text":
    "Vistos, NIF, AIMA, inscrição na saúde, contas bancárias que não abrem. O peso burocrático de construir uma vida num país novo é uma fonte documentada de stress crónico. É simplesmente muita coisa. Nomear isto como fator de saúde mental é válido.",
  "mentalHealth.experience.transNonbinary.title":
    "Vivências trans e não binárias num sistema novo",
  "mentalHealth.experience.transNonbinary.text":
    "Lidar com a saúde, os documentos legais e as situações sociais como pessoa trans ou não binária em Portugal acrescenta uma camada específica de stress e trabalho. O enquadramento legal português é progressista, mas a realidade administrativa varia. O Trans Hub tem recursos específicos.",
  "mentalHealth.experience.distance.title": "Distância da família de origem",
  "mentalHealth.experience.distance.text":
    "Mudar de país costuma significar distância física da família, escolhida ou biológica. Para pessoas queer cujas relações familiares são complicadas ou condicionais, esta distância pode ser simultaneamente um alívio e o seu próprio tipo de luto. As duas coisas são reais ao mesmo tempo.",
  "mentalHealth.experience.financial.title": "Ansiedade financeira",
  "mentalHealth.experience.financial.text":
    "O custo de vida crescente em Lisboa afeta intensamente as pessoas queer expatriadas. Insegurança habitacional, custos de visto, e a pressão de corresponder a um certo estilo de vida queer expatriado são todos fatores de stress reais. Podes perguntar sobre dinheiro no Fórum.",

  "mentalHealth.sns.title": "Aceder à saúde mental <em>através do SNS</em>",
  "mentalHealth.sns.lead":
    "O sistema público de saúde português cobre a saúde mental, incluindo terapia e psiquiatria, mas o acesso é desigual. Eis o que esperar realisticamente.",
  "mentalHealth.sns.step1.title": "Primeiro, inscreve-te no centro de saúde",
  "mentalHealth.sns.step1.text":
    "Só podes aceder aos serviços de saúde mental do SNS depois de te inscreveres num Centro de Saúde. Inscreve-te com o teu cartão de residência ou certificado de registo da UE e número de NISS. Nalgumas zonas há lista de espera para ter médico de família.",
  "mentalHealth.sns.step2.title":
    "Referenciação do médico de família para psicologia",
  "mentalHealth.sns.step2.text":
    "O teu médico de família pode referenciar-te para consulta de psicologia ou psiquiatria através do SNS. Os tempos de espera para a primeira consulta são tipicamente de 3 a 6 meses. Para necessidades urgentes, explica claramente a gravidade: isso pode acelerar a referenciação.",
  "mentalHealth.sns.step3.title": "A língua importa",
  "mentalHealth.sns.step3.text":
    "No SNS, as consultas de terapia e psiquiatria são normalmente em português. Se o teu português for limitado, a terapia privada em inglês é mais prática para a maioria das pessoas expatriadas. Plataformas online (BetterHelp, Zenklub) oferecem terapia em inglês a preços mais baixos do que os consultórios privados em Lisboa.",
  "mentalHealth.sns.step4.title": "Tarifas privadas em Lisboa",
  "mentalHealth.sns.step4.text":
    "A terapia privada custa entre 50 e 120 € por sessão. Há terapeutas com preços ajustados ao rendimento, por isso vale sempre a pena perguntar.",
  "mentalHealth.sns.peer.title":
    "Falar com <em>outras pessoas da comunidade</em>",
  "mentalHealth.sns.peer.body":
    "Às vezes o que ajuda é alguém que já passou pelo que estás a passar. No Fórum podes fazer uma pergunta ou responder a outra pessoa, e um tópico pode ser publicado de forma anónima. É uma conversa entre pessoas da comunidade e não tem facilitação profissional.",
  "mentalHealth.sns.peer.joinCta": "Abrir o Fórum",

  // ── WellbeingPage (+ WellbeingSections.tsx + wellbeing.data.ts) ──────────
  "wellbeing.meta.title":
    "Bem-estar LGBTQ+ em Lisboa: terapeutas, pares e apoio em crise",
  "wellbeing.meta.description":
    "Recursos de bem-estar para a comunidade: diretório de terapeutas, o Fórum, contactos de emergência e redução de danos, tudo num só lugar.",

  "wellbeing.hero.eyebrow": "Bem-estar",
  "wellbeing.hero.title": "Um espaço que <em>cuida de ti.</em>",
  "wellbeing.hero.lead":
    "Recursos construídos por e para a comunidade: terapeutas, apoio entre pares, ajuda em crise, e redução de danos. É assim que é uma rede profissional quando leva o cuidado a sério.",
  "wellbeing.hero.anchor.therapists": "Diretório de terapeutas",
  "wellbeing.hero.anchor.peerSupport": "Apoio entre pares",
  "wellbeing.hero.anchor.crisis": "Recursos de crise",
  "wellbeing.hero.anchor.harmReduction": "Redução de danos",

  "wellbeing.outro.title": "Pertences <em>aqui.</em>",
  "wellbeing.outro.sub":
    "Se ainda não fazes parte da comunidade, pede um convite. Se já fazes, tudo o que está acima está na área reservada, sem precisares de outro início de sessão.",
  "wellbeing.outro.cta": "Pedir um convite",
  "wellbeing.subpageIndex.title": "Mais apoio de bem-estar",
  "wellbeing.subpage.harmReduction.label": "Redução de Danos",
  "wellbeing.subpage.harmReduction.blurb":
    "Consumir com mais segurança: orientação prática e sem julgamentos.",
  "wellbeing.subpage.sober.label": "Sobriedade",
  "wellbeing.subpage.sober.blurb":
    "Sobriedade e vida social: contexto e apoio para uma vida sem álcool.",

  "wellbeing.therapists.title": "Terapia afirmativa queer <em>em Lisboa</em>",
  "wellbeing.therapists.lead":
    "Terapeutas com perfil na QueerPulse, com as línguas em que trabalham e se estão a aceitar novas pessoas. Queres adicionar alguém? <a>Contacta-nos.</a>",
  "wellbeing.therapists.applyPrompt": "Fazes terapia afirmativa queer?",
  "wellbeing.therapists.applyCta": "Candidata-te a entrar na lista",

  "wellbeing.peer.title": "Não precisas de <em>carregar isto a solo.</em>",
  "wellbeing.peer.body":
    "O Fórum é onde as pessoas da comunidade escrevem umas às outras, também quando as coisas estão difíceis. Podes fazer uma pergunta ou responder a alguém, e um tópico pode ser publicado de forma anónima.",
  "wellbeing.peer.joinCta": "Abrir o Fórum",
  "wellbeing.peer.crisisCta": "Em crise agora mesmo?",

  "wellbeing.crisisSection.title": "Crise e <em>recursos de emergência</em>",
  "wellbeing.crisisSection.lead":
    "Se estás em perigo imediato, liga para o <strong>112</strong>. Estes recursos são específicos para situações LGBTQ+ em Portugal.",
  "wellbeing.crisis.sosVozAmiga.desc":
    "Apoio emocional anónimo e aconselhamento em crise. Sem julgamentos. Disponível em português e inglês.",
  "wellbeing.crisis.sosVozAmiga.hours": "Diariamente 16h a 24h",
  "wellbeing.crisis.ilga.desc":
    "Apoio específico LGBTQ+, orientação jurídica, e encaminhamento para serviços afirmativos por todo o país.",
  "wellbeing.crisis.ilga.hours": "Dias úteis 10h a 18h",
  "wellbeing.crisis.redeExAequo.desc":
    "Apoio para pessoas LGBTQ+ com menos de 30 anos. Chat online e telefone: seguro, confidencial, liderado por pares.",
  "wellbeing.crisis.redeExAequo.hours": "Online · Dias úteis 18h a 22h",

  "wellbeing.harm.title": "Redução de <em>danos</em>",
  "wellbeing.harm.lead":
    "Informação sem julgamentos para uma comunidade que vive no mundo real. É cuidado prático, e ninguém aqui te vai dizer como viver.",
  "wellbeing.harm.nightlife.title": "Segurança básica na vida noturna",
  "wellbeing.harm.nightlife.desc":
    "O que saber antes de saíres, o que fazer se algo parecer errado, e como cuidar de quem está contigo e do teu próprio corpo.",
  "wellbeing.harm.drugsAlcohol.title": "Drogas e álcool",
  "wellbeing.harm.drugsAlcohol.desc":
    "Informação honesta sobre substâncias comuns na vida noturna queer: interações, riscos, e como pedir ajuda sem vergonha.",
  "wellbeing.harm.sexualHealth.title": "Saúde sexual em Lisboa",
  "wellbeing.harm.sexualHealth.desc":
    "Acesso à PrEP, testes de IST, e serviços de saúde sexual afirmativos onde podes ser quem és sem julgamentos.",
  "wellbeing.harm.chemsex.title": "Apoio em chemsex",
  "wellbeing.harm.chemsex.desc":
    "Recursos confidenciais e sem julgamentos para quem está a lidar com o chemsex, ligados a serviços reais e a pessoas que já passaram por isso.",

  // ── TransHubPage ─────────────────────────────────────────────────────────
  "transHub.meta.title":
    "Hub trans e não binário: saúde, questões legais e comunidade",
  "transHub.meta.description":
    "Um hub para pessoas trans e não binárias: orientação em saúde, guias jurídicos e administrativos, e uma forma de encontrar apoio entre pares no Fórum.",

  "transHub.hero.eyebrow": "Hub Trans e Não Binário",
  "transHub.hero.title": "Um espaço dedicado, <em>feito com cuidado.</em>",
  "transHub.hero.lead":
    "Orientação em saúde, guias jurídicos e apoio entre pares, escritos para pessoas trans e não binárias. Não tens de resolver isto a solo.",
  "transHub.hero.anchor.healthcare": "Saúde",
  "transHub.hero.anchor.legal": "Jurídico e administrativo",
  "transHub.hero.anchor.resources": "Recursos",
  "transHub.hero.anchor.community": "Comunidade",

  "transHub.healthcare.title": "Orientação em <em>saúde</em>",
  "transHub.healthcare.lead":
    "A saúde trans em Portugal melhorou significativamente desde 2018. O SNS cobre agora terapia hormonal e cirurgias de afirmação de género. Mas o percurso continua complexo: eis como funciona.",
  "transHub.healthcare.step1.title": "Começa pelo teu médico de família",
  "transHub.healthcare.step1.body":
    "Pede uma referenciação para endocrinologia ou para a clínica de género mais próxima. O teu médico de família pode não estar familiarizado com o processo, por isso pode ajudar levares um resumo escrito do que estás a pedir. As referenciações do SNS demoram tipicamente 6 a 18 meses.",
  "transHub.healthcare.step2.title": "Clínicas de género em Lisboa",
  "transHub.healthcare.step2.body":
    "O Hospital de Santa Maria e o Hospital Curry Cabral têm ambos unidades de medicina de género. As opções privadas incluem a Clínica de Identidade de Género para acesso mais rápido.",
  "transHub.healthcare.step3.title": "Acesso a hormonoterapia",
  "transHub.healthcare.step3.body":
    "A terapia hormonal está disponível através do SNS assim que tiveres uma referenciação de endocrinologia. Muitas pessoas da comunidade usam o modelo de consentimento informado em clínicas privadas como primeiro passo mais rápido, e depois passam para o SNS para cuidados continuados.",
  "transHub.healthcare.step4.title": "Procedimentos cirúrgicos",
  "transHub.healthcare.step4.body":
    "As cirurgias de afirmação de género cobertas pelo SNS incluem vaginoplastia, faloplastia, mastectomia, entre outras. As listas de espera são longas (1 a mais de 3 anos).",
  "transHub.healthcare.step5.title": "Se estás a enfrentar barreiras",
  "transHub.healthcare.step5.body":
    "Se um serviço de saúde recusar tratamento ou tornar o processo hostil, documenta tudo. Contacta <a>os nossos recursos jurídicos</a> ou a ILGA Portugal. Tens direitos, e a ILGA Portugal pode ajudar-te a fazê-los valer.",

  "transHub.legal.title": "Jurídico e <em>administrativo</em>",
  "transHub.legal.lead":
    "Como mudar o nome legal e a menção de sexo em Portugal. A Lei da Identidade de Género de 2018 (Lei 38/2018) simplificou significativamente o processo.",
  "transHub.legal.step1.title": "Mudança de nome legal e género",
  "transHub.legal.step1.body":
    "Desde 2018, podes mudar o teu nome legal e a menção de sexo em qualquer conservatória do registo civil sem documentação médica. Basta uma declaração, sem avaliação psiquiátrica. A taxa é de aproximadamente 200 €.",
  "transHub.legal.step2.title": "Atualizar os teus documentos",
  "transHub.legal.step2.body":
    "Depois de atualizado o teu Cartão de Cidadão, os outros documentos seguem-se. A tua entidade empregadora, o banco e os registos de saúde podem todos ser atualizados com o novo documento.",
  "transHub.legal.step3.title": "Reconhecimento legal de pessoas não binárias",
  "transHub.legal.step3.body":
    "Portugal não tem atualmente uma opção de terceiro género nos documentos oficiais. Esta é uma área de ativismo em curso: a ILGA Portugal e a Rede ex aequo estão a trabalhar nisso.",

  "transHub.resources.title": "Recursos e <em>guias</em>",
  "transHub.resources.lead":
    "Guias na QueerPulse para pessoas trans e não binárias em Portugal.",
  "transHub.resources.openCta": "Abrir",
  "transHub.resources.cat.guide": "Guia",
  "transHub.resources.cat.peerSupport": "Apoio entre pares",
  "transHub.resource.snsGuide.title": "Saúde trans, passo a passo",
  "transHub.resource.snsGuide.desc":
    "Um percurso pelas vias pública e privada para hormonas e cirurgia em Portugal, com os tempos de espera e os custos habituais de cada etapa.",
  "transHub.resource.peerCircle.title": "Apoio entre pares no Fórum",
  "transHub.resource.peerCircle.desc":
    "Como pedir apoio a outras pessoas da comunidade, como continuar a conversa em mensagens diretas e como responder à pergunta de alguém.",

  "transHub.community.title": "Uma comunidade que <em>te apoia.</em>",
  "transHub.community.body":
    "O Hub Trans e Não-Binárie é feito tanto de pessoas como de recursos. No Fórum podes fazer perguntas a outras pessoas da comunidade e juntar-te a comunidades que te façam sentido.",
  "transHub.community.joinCta": "Explorar comunidades",

  "transHub.outro.title": "Vemos-te <em>aqui.</em>",
  "transHub.outro.sub":
    "Cada pessoa na QueerPulse entrou com o voto de confiança de alguém da comunidade. Se alguém em quem confias já cá está, pede-lhe que te dê um voto de confiança.",
  "transHub.outro.cta": "Pedir um convite",

  // ── TransHealthcarePage ──────────────────────────────────────────────────
  // Varrido por completo (DES-150). Tempos, custos, citações legais e nomes de
  // clínicas preservados exatamente como em EN. Nomes próprios (SNS, ILGA
  // Portugal, APAV, Conservatória do Registo Civil, Loja do Cidadão, Cartão de
  // Cidadão, NIF, NISS, Synlab, Germano de Sousa) não são traduzidos.
  // Vários termos clínicos e jurídicos estão sinalizados para revisão nativa —
  // ver o handoff DES-150.
  "transHealthcare.meta.title":
    "Saúde trans em Lisboa: clínicas, mudança de nome e por onde começar",
  "transHealthcare.meta.description":
    "Um guia prático de saúde trans em Portugal: hormonoterapia no SNS e no privado, mudança legal de nome e de menção de sexo, e equipas clínicas trans-afirmativas em Lisboa.",

  "transHealthcare.hero.eyebrow": "Saúde Trans · Portugal",
  "transHealthcare.hero.titleLine1": "A tua jornada,",
  "transHealthcare.hero.titleLine2": "passo a passo.",
  "transHealthcare.hero.sub":
    "Como aceder a cuidados de saúde de afirmação de género em Portugal, através do SNS ou em privado. Mudança de nome legal. O que levar, a quem ligar, o que esperar.",
  "transHealthcare.hero.disclaimer":
    "Este guia reflete o sistema em vigor em junho de 2026. Confirma sempre os tempos de espera e os procedimentos atuais com a ILGA Portugal ou com o teu médico de família. É conhecimento partilhado pela comunidade e não substitui aconselhamento jurídico ou médico.",

  "transHealthcare.path.hrtSns.label": "Hormonoterapia via SNS",
  "transHealthcare.path.hrtPrivate.label": "Hormonoterapia em privado",
  "transHealthcare.path.legalName.label": "Mudança de nome legal",
  "transHealthcare.path.genderMarker.label": "Menção de sexo",
  "transHealthcare.path.surgery.label": "Acesso a cirurgia",

  "transHealthcare.section.gettingIntoSystem": "Entrar no sistema",
  "transHealthcare.section.genderClinic": "Clínica de género",
  "transHealthcare.section.ongoingCare": "Cuidados continuados",
  "transHealthcare.section.findingPrivateProvider":
    "Encontrar um prestador privado",
  "transHealthcare.section.ongoing": "Continuado",
  "transHealthcare.section.legalProcess": "O processo (Lei n.º 38/2018)",
  "transHealthcare.section.genderMarkerChange": "Mudar a menção de sexo",
  "transHealthcare.section.surgeryInPortugal":
    "Cirurgia de afirmação de género em Portugal",

  "transHealthcare.sidebar.keyContacts": "Contactos importantes",
  "transHealthcare.sidebar.communityTip": "Dica da comunidade",
  "transHealthcare.sidebar.communityTipBody":
    "A ILGA Portugal oferece acompanhamento jurídico gratuito a pessoas trans que precisam de se orientar no SNS. Não tens de fazer isto sem apoio: liga-lhes antes da tua primeira consulta.",
  "transHealthcare.sidebar.relatedTitle": "Relacionado na QueerPulse",
  "transHealthcare.sidebar.solidarityCta": "Registo de Tarifas Solidárias",
  "transHealthcare.sidebar.solidarityRole":
    "Medicina geral e psiquiatria trans-afirmativas",
  "transHealthcare.sidebar.legalCta": "Recursos Jurídicos",
  "transHealthcare.sidebar.legalRole": "Documentos de mudança de nome",
  "transHealthcare.sidebar.mentalHealthCta": "Saúde Mental",
  "transHealthcare.sidebar.mentalHealthRole": "Apoio ao longo do processo",

  "transHealthcare.outro.title": "Mereces <em>bons cuidados.</em>",
  "transHealthcare.outro.sub":
    "Na comunidade da QueerPulse há profissionais de medicina familiar, terapia e direito que apoiam pessoas trans. Não tens de passar por isto sem companhia.",
  "transHealthcare.outro.cta": "Encontrar tarifas solidárias",

  // Etapas do percurso — hormonoterapia via SNS
  "transHealthcare.hrtSns.step1.title": "Inscreve-te num centro de saúde",
  "transHealthcare.hrtSns.step1.description":
    "Tens de ter inscrição num centro de saúde em Lisboa. Se ainda não tiveres, liga para o SNS 24 (808 24 24 24) ou vai ao centro de saúde mais próximo com o teu NIF, comprovativo de residência e documento de identificação.",
  "transHealthcare.hrtSns.step1.time": "No próprio dia",
  "transHealthcare.hrtSns.step1.cost": "Gratuito",
  "transHealthcare.hrtSns.step1.tip":
    "Se não tiveres inscrição ou médico de família atribuído, a ILGA Portugal pode ajudar-te com o processo de inscrição.",

  "transHealthcare.hrtSns.step2.title":
    "Marca uma consulta com o teu médico de família",
  "transHealthcare.hrtSns.step2.description":
    'Pede especificamente uma referenciação para avaliação de disforia de género. Não precisas de usar o termo "disforia de género": podes dizer que queres uma referenciação para apoio especializado em identidade de género.',
  "transHealthcare.hrtSns.step2.time": "Dias a semanas",
  "transHealthcare.hrtSns.step2.cost": "Gratuito",
  "transHealthcare.hrtSns.step2.tip":
    "Se o teu médico de família não ajudar ou não tiveres um atribuído, pede a mudança de médico ou recorre ao serviço de acompanhamento da ILGA.",

  "transHealthcare.hrtSns.step3.title":
    "O médico de família referencia-te para psiquiatria ou psicologia",
  "transHealthcare.hrtSns.step3.description":
    "O percurso do SNS exige normalmente uma avaliação psiquiátrica ou psicológica antes da hormonoterapia. O teu médico de família emite uma referenciação para a equipa de saúde mental do hospital da tua área ou para a consulta de identidade de género do CHULN, no Hospital de Santa Maria.",
  "transHealthcare.hrtSns.step3.time": "2 a 8 semanas",
  "transHealthcare.hrtSns.step3.cost": "Gratuito",

  "transHealthcare.hrtSns.step4.title": "Primeira consulta de avaliação",
  "transHealthcare.hrtSns.step4.description":
    "No Hospital de Santa Maria (CHULN) ou no hospital de referência. A primeira consulta é uma sessão de informação. Ninguém está a avaliar se mereces isto. Leva a carta de referenciação do teu médico de família, um documento de identificação e o historial de saúde mental que for relevante.",
  "transHealthcare.hrtSns.step4.time": "4 a 18 meses de espera",
  "transHealthcare.hrtSns.step4.cost": "Gratuito (SNS)",
  "transHealthcare.hrtSns.step4.tip":
    "A lista de espera é longa. Inscreve-te cedo, mesmo que ainda tenhas dúvidas. Podes desistir a qualquer momento.",

  "transHealthcare.hrtSns.step5.title":
    "Acompanhamento psiquiátrico ou psicológico continuado",
  "transHealthcare.hrtSns.step5.description":
    "Normalmente 2 a 4 consultas ao longo de 3 a 6 meses. São consultas de acompanhamento, e ninguém te está a pedir que proves a tua identidade. Fazer terapia no privado em paralelo pode ajudar.",
  "transHealthcare.hrtSns.step5.time": "3 a 6 meses",
  "transHealthcare.hrtSns.step5.cost": "Gratuito (SNS)",

  "transHealthcare.hrtSns.step6.title": "Prescrição de hormonoterapia",
  "transHealthcare.hrtSns.step6.description":
    "Assim que a equipa apoiar a hormonoterapia, a consulta de endocrinologia ou o teu médico de família prescreve as hormonas. A receita é válida em qualquer farmácia. Alguns medicamentos são comparticipados pelo SNS.",
  "transHealthcare.hrtSns.step6.time": "Depois da aprovação",
  "transHealthcare.hrtSns.step6.cost": "10 a 40 €/mês (comparticipado)",
  "transHealthcare.hrtSns.step6.tip":
    "Guarda todos os recibos. Alguns custos podem ser parcialmente reembolsados. Pergunta ao teu médico de família sobre a comparticipação.",

  "transHealthcare.hrtSns.step7.title":
    "Análises de sangue regulares e seguimento",
  "transHealthcare.hrtSns.step7.description":
    "Normalmente de 3 em 3 meses no primeiro ano e depois de 6 em 6 meses. As análises são feitas no hospital ou no teu centro de saúde. Quem te prescreve as hormonas avalia os resultados.",
  "transHealthcare.hrtSns.step7.time": "Contínuo",
  "transHealthcare.hrtSns.step7.cost": "Gratuito (SNS)",
  "transHealthcare.hrtSns.step7.tip":
    "Pede sempre uma cópia das tuas análises. Tens direito a elas e são úteis se algum dia mudares de prestador.",

  "transHealthcare.hrtSns.step8.title": "Monitorização e ajustes de dose",
  "transHealthcare.hrtSns.step8.description":
    "Os níveis hormonais vão sendo ajustados ao longo do tempo. É um processo feito em conjunto. Conta a quem te acompanha o que estás a sentir. Muitas pessoas trans em Lisboa complementam o acompanhamento do SNS com endocrinologia no privado, para ajustes mais rápidos.",
  "transHealthcare.hrtSns.step8.time": "Contínuo",
  "transHealthcare.hrtSns.step8.cost": "Gratuito (SNS)",

  // Etapas do percurso — hormonoterapia em privado
  "transHealthcare.hrtPrivate.step1.title":
    "Encontra uma consulta privada de endocrinologia ou medicina geral trans-afirmativa",
  "transHealthcare.hrtPrivate.step1.description":
    "O Registo de Tarifas Solidárias da QueerPulse reúne consultas de medicina geral trans-afirmativas com preços ajustados ao rendimento. A ILGA Portugal também mantém uma lista de prestadores recomendados.",
  "transHealthcare.hrtPrivate.step1.time": "Dias",
  "transHealthcare.hrtPrivate.step1.cost": "50 a 150 € na primeira consulta",
  "transHealthcare.hrtPrivate.step1.tip":
    "Antes de marcares, pergunta explicitamente se têm experiência a prescrever hormonoterapia a pessoas trans.",

  "transHealthcare.hrtPrivate.step2.title": "Primeira consulta",
  "transHealthcare.hrtPrivate.step2.description":
    "Leva os documentos clínicos anteriores que forem relevantes (avaliações de saúde mental, análises, receitas anteriores). Os prestadores privados podem prescrever hormonoterapia sem avaliação psiquiátrica. Pergunta quando marcares.",
  "transHealthcare.hrtPrivate.step2.time": "Pode ser em poucos dias",
  "transHealthcare.hrtPrivate.step2.cost": "60 a 150 €",
  "transHealthcare.hrtPrivate.step2.tip":
    "Modelo de consentimento informado: muitos prestadores privados em Lisboa já trabalham assim. Não precisas de um diagnóstico psiquiátrico.",

  "transHealthcare.hrtPrivate.step3.title": "Receita e farmácia",
  "transHealthcare.hrtPrivate.step3.description":
    "Recebes uma receita particular, válida em qualquer farmácia. Alguns medicamentos não são comparticipados com receita particular. Pergunta a quem te passou a receita que alternativas existem.",
  "transHealthcare.hrtPrivate.step3.time": "No próprio dia",
  "transHealthcare.hrtPrivate.step3.cost": "20 a 80 €/mês",

  "transHealthcare.hrtPrivate.step4.title": "Análises de sangue",
  "transHealthcare.hrtPrivate.step4.description":
    "Podem ser feitas em laboratórios privados (Synlab, Germano de Sousa) ou por convenção com o SNS. Os resultados chegam normalmente em 24 a 48 horas.",
  "transHealthcare.hrtPrivate.step4.time": "De 3 em 3 ou de 6 em 6 meses",
  "transHealthcare.hrtPrivate.step4.cost": "30 a 80 € por painel",

  "transHealthcare.hrtPrivate.step5.title": "Consultas de seguimento",
  "transHealthcare.hrtPrivate.step5.description":
    "A frequência varia. A maioria dos prestadores quer ver-te aos 3 meses, e depois de 6 em 6 meses quando estiveres estável.",
  "transHealthcare.hrtPrivate.step5.time": "Contínuo",
  "transHealthcare.hrtPrivate.step5.cost": "50 a 120 €/consulta",
  "transHealthcare.hrtPrivate.step5.tip":
    "Quando estiveres estável, pondera passar a monitorização para o SNS, para reduzir custos. É possível e é comum.",

  // Etapas do percurso — mudança de nome legal
  "transHealthcare.legalName.step1.title": "Conhece os teus direitos",
  "transHealthcare.legalName.step1.description":
    "Ao abrigo da Lei n.º 38/2018 (em vigor desde 2018), qualquer pessoa maior de 18 anos pode mudar o nome próprio e a menção de sexo nos documentos civis por autodeterminação. Não é exigida prova médica, cirurgia ou relatório psiquiátrico. Jovens de 16 e 17 anos podem requerer com autorização dos representantes legais.",
  "transHealthcare.legalName.step1.time": "Lê primeiro",
  "transHealthcare.legalName.step1.cost": "Gratuito",
  "transHealthcare.legalName.step1.tip":
    "A ILGA Portugal tem um guia detalhado e gratuito em português e inglês. Descarrega-o antes de começares.",

  "transHealthcare.legalName.step2.title":
    "Marca um atendimento na Conservatória do Registo Civil",
  "transHealthcare.legalName.step2.description":
    'Podes fazê-lo online em agendamento.mj.pt ou por telefone. A Conservatória em Lisboa fica na Rua Rodrigo da Fonseca 226. Pede um atendimento para "alteração de nome e sexo ao abrigo da Lei n.º 38/2018".',
  "transHealthcare.legalName.step2.time": "1 a 4 semanas até ao atendimento",
  "transHealthcare.legalName.step2.cost": "Gratuito",

  "transHealthcare.legalName.step3.title": "O atendimento",
  "transHealthcare.legalName.step3.description":
    "Compareces presencialmente e fazes uma declaração. Vais precisar do teu Bilhete de Identidade ou Cartão de Cidadão, do NIF e do NISS. Declaras o nome e a menção de sexo que escolheste. Não são exigidos documentos comprovativos.",
  "transHealthcare.legalName.step3.time": "30 a 60 minutos",
  "transHealthcare.legalName.step3.cost": "Gratuito",

  "transHealthcare.legalName.step4.title": "Período de espera",
  "transHealthcare.legalName.step4.description":
    "Há um período de espera de um mês após a declaração, durante o qual podes desistir. Passado esse mês, a alteração é registada automaticamente. A Conservatória notifica-te.",
  "transHealthcare.legalName.step4.time": "1 mês",
  "transHealthcare.legalName.step4.cost": "Gratuito",
  "transHealthcare.legalName.step4.tip":
    "A ILGA Portugal recomenda aproveitar este período para avisar a entidade empregadora, as equipas de saúde e a pessoa senhoria, para que tudo seja atualizado ao mesmo tempo.",

  "transHealthcare.legalName.step5.title": "Documentos novos",
  "transHealthcare.legalName.step5.description":
    "Depois do registo: pede um novo Cartão de Cidadão em qualquer Loja do Cidadão ou no IRN. Atualiza também: NIF, NISS, registos do SNS, passaporte (se precisares), contas bancárias e os registos de recursos humanos da entidade empregadora.",
  "transHealthcare.legalName.step5.time": "1 a 4 semanas para o novo CC",
  "transHealthcare.legalName.step5.cost": "15 € pelo Cartão de Cidadão",
  "transHealthcare.legalName.step5.tip":
    "Leva a certidão de alteração de nome a cada atualização. Pede várias certidões na Conservatória no momento do registo.",

  // Etapas do percurso — menção de sexo
  "transHealthcare.genderMarker.step1.title":
    "Incluído no processo da Lei n.º 38/2018",
  "transHealthcare.genderMarker.step1.description":
    "Em Portugal, a alteração da menção de sexo (M/F) nos documentos civis é feita no mesmo atendimento que a mudança de nome legal. São um único processo. Não precisas de fazer requerimentos separados.",
  "transHealthcare.genderMarker.step1.time": "Igual à mudança de nome",
  "transHealthcare.genderMarker.step1.cost": "Gratuito",
  "transHealthcare.genderMarker.step1.tip":
    "A Conservatória atualiza o teu registo de nascimento com a menção de sexo que escolheste. A partir daí, a alteração propaga-se a todos os outros documentos.",

  "transHealthcare.genderMarker.step2.title":
    "Depois da alteração: atualizar registos",
  "transHealthcare.genderMarker.step2.description":
    "Registos do SNS: contacta o teu centro de saúde com o Cartão de Cidadão atualizado. Autoridade Tributária (AT): atualiza no Portal das Finanças ou presencialmente. Segurança Social (NISS): atualiza na Segurança Social Direta ou presencialmente.",
  "transHealthcare.genderMarker.step2.time": "Dias a semanas",
  "transHealthcare.genderMarker.step2.cost": "Gratuito",

  "transHealthcare.genderMarker.step3.title":
    "Passaporte e documentos de viagem",
  "transHealthcare.genderMarker.step3.description":
    "Pede um novo passaporte depois de o teu Cartão de Cidadão estar atualizado. Entrega o pedido em qualquer Loja do Cidadão ou no Serviço de Passaportes, com o CC novo e a taxa de 65 €. O passaporte urgente custa 100 €.",
  "transHealthcare.genderMarker.step3.time": "1 a 4 semanas",
  "transHealthcare.genderMarker.step3.cost": "65 a 100 €",
  "transHealthcare.genderMarker.step3.tip":
    "Se viajas com frequência, pede o passaporte novo assim que o CC chegar. Não esperes.",

  "transHealthcare.genderMarker.step4.title":
    "Menção não binária ou fora de M/F",
  "transHealthcare.genderMarker.step4.description":
    "A lei portuguesa prevê atualmente apenas as menções M e F nos documentos civis. A luta por uma menção X ou não binária continua. A ILGA Portugal é a melhor fonte sobre a situação atual.",
  "transHealthcare.genderMarker.step4.time": "Luta em curso",
  "transHealthcare.genderMarker.step4.cost": "N/A",

  // Etapas do percurso — acesso a cirurgia
  "transHealthcare.surgery.step1.title":
    "Percurso do SNS: pela consulta de identidade de género",
  "transHealthcare.surgery.step1.description":
    "As cirurgias de afirmação de género estão disponíveis no SNS, no CHULN (Hospital de Santa Maria), seguindo o percurso da consulta de identidade de género. Tens de estar no percurso do SNS e ter feito hormonoterapia durante um período mínimo (normalmente 12 meses para a maioria das cirurgias).",
  "transHealthcare.surgery.step1.time": "2 a 5+ anos desde a referenciação",
  "transHealthcare.surgery.step1.cost": "Gratuito (SNS)",
  "transHealthcare.surgery.step1.tip":
    "As listas de espera para cirurgia são muito longas. Entra no percurso do SNS o mais cedo possível, mesmo que a cirurgia não seja já o teu objetivo.",

  "transHealthcare.surgery.step2.title": "Carta de apoio psiquiátrico",
  "transHealthcare.surgery.step2.description":
    "Para cirurgia através do SNS, é normalmente exigida uma carta de quem te acompanha em psiquiatria ou psicologia. É documentação, e é a equipa da consulta de identidade de género que a emite.",
  "transHealthcare.surgery.step2.time": "Incluído no percurso",
  "transHealthcare.surgery.step2.cost": "Gratuito (SNS)",

  "transHealthcare.surgery.step3.title": "Cirurgia no privado em Portugal",
  "transHealthcare.surgery.step3.description":
    "Há cirurgia de afirmação de género no privado em Portugal, feita por especialistas em cirurgia plástica e urologia. Os custos variam muito. Pede à ILGA Portugal recomendações atuais de especialistas e preços transparentes.",
  "transHealthcare.surgery.step3.time": "Mais rápido do que no SNS",
  "transHealthcare.surgery.step3.cost":
    "4.000 a 20.000 €+ conforme o procedimento",
  "transHealthcare.surgery.step3.tip":
    "Algumas seguradoras em Portugal cobrem cirurgia de afirmação de género. Verifica a tua apólice. A ILGA Portugal tem experiência em recursos junto de seguradoras.",

  "transHealthcare.surgery.step4.title": "Cirurgia no estrangeiro",
  "transHealthcare.surgery.step4.description":
    "Muitas pessoas da comunidade fazem cirurgia em Espanha (Barcelona, Madrid), na Tailândia e na Alemanha. A ILGA Portugal pode aconselhar sobre prestadores de confiança. Pode haver apoio para viagem e recuperação através de ajuda mútua.",
  "transHealthcare.surgery.step4.time": "Variável",
  "transHealthcare.surgery.step4.cost": "Varia consoante o país",
  "transHealthcare.surgery.step4.tip":
    "A comunidade da QueerPulse tem pessoas com experiência direta de cirurgia no estrangeiro. Publica no fórum ou fala connosco para te pormos em contacto com elas.",

  // Contactos da barra lateral. Os valores `.contact` são números de telefone
  // e endereços web: repetidos byte a byte a partir de EN, de propósito.
  // Só `chlc.contact` é prosa.
  "transHealthcare.contact.ilga.role":
    "Apoio jurídico, encaminhamento, ativismo",
  "transHealthcare.contact.ilga.contact": "ilga-portugal.pt · 213 887 615",
  "transHealthcare.contact.redeExAequo.role":
    "Apoio a jovens LGBTQ+ (até aos 30)",
  "transHealthcare.contact.redeExAequo.contact": "rea.pt · apoio@rea.pt",
  "transHealthcare.contact.apav.role": "Apoio a vítimas, crimes de ódio",
  "transHealthcare.contact.apav.contact": "apav.pt · 116 006",
  "transHealthcare.contact.sns24.role":
    "Encaminhamento de saúde, atribuição de médico de família",
  "transHealthcare.contact.sns24.contact": "808 24 24 24",
  "transHealthcare.contact.chuln.role": "Hospital de Santa Maria, Lisboa",
  "transHealthcare.contact.chuln.contact": "Necessária referenciação do SNS",

  // ── HarmReductionPage (+ HarmReductionSections.tsx + harmReduction.data.tsx) ──
  "harmReduction.meta.title":
    "Redução de danos em Lisboa: sair com mais segurança e sem julgamentos",
  "harmReduction.meta.description":
    "Informação sem julgamento sobre redução de danos para noites em Lisboa: naloxona e resposta a overdose, consumo mais seguro, quebras, chemsex e onde fazer testes.",
  // Overdose response / substance-safety guidance — highest-stakes copy in
  // this namespace. Numbers, timings, drug names, phone numbers and org
  // names preserved exactly. Flag for the closest native review.
  "harmReduction.emergency.emergencyLabel": "Emergência:",
  "harmReduction.emergency.snsLabel": "SNS 24 (não urgente):",
  "harmReduction.emergency.mentalHealthLabel": "Linha de Apoio (saúde mental):",

  "harmReduction.hero.backLink": "Hub de Bem-estar",
  "harmReduction.hero.eyebrow": "Redução de Danos · Guia da comunidade",
  "harmReduction.hero.titleLine1": "Sem julgamento.",
  "harmReduction.hero.titleLine2": "Só informação.",
  "harmReduction.hero.sub":
    "Se vais consumir substâncias, seja numa discoteca, numa festa ou em casa, este guia é para ti. Existe para te ajudar a manteres-te em segurança.",
  "harmReduction.hero.sos":
    "<strong>Se alguém parar de respirar:</strong> liga imediatamente para o 112. Portugal tem uma lei do bom samaritano, por isso pedir ajuda não dá lugar a processo contra ti.",

  "harmReduction.naloxone.title": "A naloxona <em>salva vidas.</em>",
  "harmReduction.naloxone.body1":
    "A naloxona (Narcan) reverte uma overdose de opioides em minutos. Está disponível gratuitamente em Portugal através dos serviços de redução de danos e de algumas farmácias. É segura, fácil de usar e não exige receita médica. Anda sempre com ela se tu ou alguém à tua volta consumir opioides, incluindo fentanilo, heroína ou analgésicos fortes sujeitos a receita.",
  "harmReduction.naloxone.body2":
    "Em Lisboa: o GAT Lisboa, a APDES e a equipa de redução de danos Ares do Pinhal distribuem naloxona gratuitamente. Pergunta no serviço de redução de danos mais próximo ou contacta diretamente o GAT.",
  "harmReduction.naloxone.stepsLabel": "Se alguém tiver uma overdose",
  "harmReduction.naloxone.step1":
    '<strong>Liga para o 112</strong>: diz "uma pessoa não reage e não está a respirar normalmente"',
  "harmReduction.naloxone.step2":
    "<strong>Administra naloxona</strong>: spray nasal, um jato numa narina. Injeção: segue as instruções do kit.",
  "harmReduction.naloxone.step3":
    "<strong>Posição lateral de segurança</strong>: vira a pessoa de lado, inclina a cabeça para trás para abrir as vias respiratórias",
  "harmReduction.naloxone.step4":
    "<strong>Se não houver resposta em 2 a 3 minutos</strong>: dá uma segunda dose se tiveres. Continua até chegar ajuda.",
  "harmReduction.naloxone.step5":
    "<strong>Fica com a pessoa</strong>: a naloxona deixa de fazer efeito antes de muitos opioides, por isso é preciso vigiá-la.",

  "harmReduction.section.beforeNight.label": "Antes da noite",
  "harmReduction.section.beforeNight.title": "Fica a saber antes de saíres",
  "harmReduction.section.beforeNight.item.eat.title": "Come antes",
  "harmReduction.section.beforeNight.item.eat.body":
    "O álcool e o MDMA fazem-se sentir com mais força com o estômago vazio. Faz uma refeição a sério e acaba de comer 2 a 3 horas antes de saíres.",
  "harmReduction.section.beforeNight.item.test.title":
    "Testa as tuas substâncias",
  "harmReduction.section.beforeNight.item.test.body":
    "Há serviços de análise de substâncias em Lisboa: a KOSMICARE em festivais e o serviço apoiado pela DICAD. Os kits de reagentes são legais em Portugal e estão disponíveis online. Nunca assumas que um comprimido é o que te disseram que é.",
  "harmReduction.section.beforeNight.item.meds.title":
    "Conhece a tua medicação",
  "harmReduction.section.beforeNight.item.meds.body":
    "ISRS, IMAO, antirretrovirais e muitos outros medicamentos interagem perigosamente com MDMA, estimulantes e alguns psicadélicos. Verifica as interações no TripSit ou no DrugsData antes de saíres.",
  "harmReduction.section.beforeNight.item.tellSomeone.title":
    "Diz a alguém onde estás",
  "harmReduction.section.beforeNight.item.tellSomeone.body":
    "Partilha a tua localização com alguém de confiança que não vá sair. Combina uma hora para dar notícias. Faz parte de cuidares de ti.",
  "harmReduction.section.beforeNight.item.budget.title":
    "Planeia as tuas doses",
  "harmReduction.section.beforeNight.item.budget.body":
    "Decide o que vais tomar antes de saíres. Às 3 da manhã, no meio do barulho, é muito mais difícil tomar boas decisões. Se ajudar, aponta num papel.",

  "harmReduction.section.duringNight.label": "Na festa",
  "harmReduction.section.duringNight.title": "Durante a noite",
  "harmReduction.section.duringNight.alert.head":
    "Água: beber a menos e beber a mais são ambos perigosos",
  "harmReduction.section.duringNight.alert.body":
    "O MDMA pode causar tanto desidratação como hiponatremia (excesso de água). Se estiveres a dançar muito: cerca de 500 ml por hora. Se não estiveres a dançar: cerca de 250 ml por hora. Bebidas isotónicas ajudam com o sal.",
  "harmReduction.section.duringNight.item.startLow.title":
    "Começa com pouco, espera mais do que pensas ser preciso",
  "harmReduction.section.duringNight.item.startLow.body":
    "O MDMA demora 45 a 90 minutos a atingir o pico de efeito. O efeito da cocaína é mais curto. Muitas hospitalizações acontecem porque alguém tomou mais antes de a primeira dose atingir o pico. Espera pelo menos 90 minutos.",
  "harmReduction.section.duringNight.item.breaks.title": "Faz pausas na dança",
  "harmReduction.section.duringNight.item.breaks.body":
    "O sobreaquecimento é um risco real. Sai, senta-te, arrefece regularmente. Se sentires muito calor e deixares de suar, pede ajuda imediatamente.",
  "harmReduction.section.duringNight.item.mixing.title": "Misturar substâncias",
  "harmReduction.section.duringNight.item.mixing.body":
    "Álcool + MDMA: mais pesado para o corpo, aumenta a desidratação. MDMA + cocaína: stress cardíaco significativo. MDMA + cetamina: imprevisível. Nunca mistures com opioides, a não ser que tenhas naloxona à mão.",
  "harmReduction.section.duringNight.item.lookAfter.title":
    "Cuidem-se mutuamente",
  "harmReduction.section.duringNight.item.lookAfter.body":
    "Se a pessoa ao teu lado parecer confusa, com calor excessivo ou sem reagir à tua voz, tira-a da multidão, dá-lhe água e, se não melhorar em 5 minutos, liga para o 112.",

  "harmReduction.section.after.label": "No dia seguinte",
  "harmReduction.section.after.title": "Recuperação",
  "harmReduction.section.after.item.comedown.title": "A quebra do MDMA é real",
  "harmReduction.section.after.item.comedown.body":
    "O MDMA esgota temporariamente a serotonina. Os dias 2 a 4 depois do consumo podem trazer humor em baixo, ansiedade e fadiga. É neurológico: é a tua química cerebral a causar a sensação. Passa. Comer, dormir e fazer atividade física ligeira ajudam.",
  "harmReduction.section.after.item.sleepFood.title": "Dormir e comer primeiro",
  "harmReduction.section.after.item.sleepFood.body":
    "Antes de mais nada. O teu corpo trabalhou muito. Ceder à vontade de tomar mais para recuperar a sensação boa quase sempre piora a quebra.",
  "harmReduction.section.after.item.worried.title":
    "Se o teu consumo te preocupa",
  "harmReduction.section.after.item.worried.body":
    "O CAT (Centro de Atendimento a Toxicodependentes) oferece apoio gratuito e confidencial, sem julgamento e sem obrigação. Podes pedir apoio mesmo sem uma dependência. Liga para o 800 20 40 60.",
  "harmReduction.section.after.item.chemsex.title":
    "Chemsex e testes de seguimento",
  "harmReduction.section.after.item.chemsex.body":
    "Se tiveste relações sexuais enquanto consumias substâncias, considera fazer um teste de IST dentro de 72 horas se quiseres PEP (profilaxia pós-exposição ao VIH). O Checkpoint e o GAT fazem testes rápidos, sem marcação.",

  "harmReduction.section.sober.label": "Sem consumir",
  "harmReduction.section.sober.title": "Sobriedade na festa",
  "harmReduction.section.sober.item.belong.title": "Também pertences ali",
  "harmReduction.section.sober.item.belong.body":
    "A vida noturna queer pode parecer centrada em substâncias. Tens o direito de lá estar sem beber ou consumir, e não deves nenhuma explicação a ninguém.",
  "harmReduction.section.sober.item.nonAlcoholic.title": "Opções sem álcool",
  "harmReduction.section.sober.item.nonAlcoholic.body":
    "A maioria dos locais em Lisboa serve água e refrigerantes. Pede água com gás e lima se preferires que a tua bebida passe despercebida. O que tens no copo só a ti diz respeito.",
  "harmReduction.section.sober.item.qpCommunity.title":
    "Página Sóbrie da QueerPulse",
  "harmReduction.section.sober.item.qpCommunity.body":
    "A página Sóbrie reúne contexto e opções de apoio para fazeres parte da noite sem as substâncias. Há mais pessoas a fazer este caminho.",
  "harmReduction.section.sober.linkCta": "Visitar a página Sóbrie",

  "harmReduction.section.services.label": "Apoio e serviços",
  "harmReduction.section.services.title": "Onde ir",
  "harmReduction.section.services.item.gat.title": "GAT Lisboa",
  "harmReduction.section.services.item.gat.body":
    "Testes gratuitos de VIH/IST, naloxona, preservativos, apoio em redução de danos. Rua de São Lázaro 58 · gat.org.pt",
  "harmReduction.section.services.item.checkpoint.title": "Checkpoint Lisboa",
  "harmReduction.section.services.item.checkpoint.body":
    "Testes rápidos de VIH e IST, apoio à PrEP, sem necessidade de marcação. Rua do Crucifixo 100 · checkpointlx.com",
  "harmReduction.section.services.item.cat.title":
    "CAT (apoio em dependências)",
  "harmReduction.section.services.item.cat.body":
    "Apoio gratuito e confidencial para quem tiver preocupações sobre o seu consumo de substâncias. 800 20 40 60 · sem necessidade de marcação.",
  "harmReduction.section.services.item.kosmicare.title": "KOSMICARE",
  "harmReduction.section.services.item.kosmicare.body":
    "Apoio em crises psicadélicas e integração. Presente no Boom Festival e disponível para consultas todo o ano. kosmicare.org",
  "harmReduction.section.services.item.tripsit.title": "TripSit e DrugsData",
  "harmReduction.section.services.item.tripsit.body":
    "Verificador de interações entre substâncias, guias de dosagem e informação sobre substâncias. tripsit.me · drugsdata.org",

  "harmReduction.outro.title": "Cuidem-se <em>mutuamente.</em>",
  "harmReduction.outro.sub":
    "A redução de danos é uma prática comunitária. Quanto mais gente souber isto, mais seguras são as nossas noites.",
  "harmReduction.outro.cta": "Recursos de saúde sexual",

  // ── SoberPage (+ SoberSections.tsx + soberPage.data.ts) ─────────────────
  "sober.hero.backLink": "Hub de Bem-estar",
  "sober.meta.title":
    "Sobriedade queer em Lisboa: eventos e espaços sem álcool",
  "sober.meta.description":
    "Uma vida social queer plena sem álcool: eventos sóbrios e sem álcool em Lisboa, espaços onde o bar não é o centro e apoio entre pares para quem está em recuperação ou a explorar a sobriedade.",
  "sober.meta.descriptionLive":
    "Uma vida social queer plena sem álcool: contexto sobre o álcool nas comunidades queer e indicações de apoio para quem está em recuperação ou a explorar a sobriedade.",
  "sober.meta.titleLive":
    "Sobriedade queer em Lisboa: vida social sem álcool e apoio na recuperação",

  "sober.hero.eyebrow": "Sóbrie e social",
  "sober.hero.title": "Uma vida social plena, sem <em>álcool.</em>",
  "sober.hero.lead":
    "Quer estejas em recuperação, a explorar a sobriedade ou a tomar medicação, quer simplesmente não bebas, não devias ter de te justificar. Existe um mundo social queer vibrante para lá do bar.",
  "sober.reason.recovery": "Em recuperação",
  "sober.reason.soberCurious": "A explorar a sobriedade",
  "sober.reason.medication": "Medicação",
  "sober.reason.health": "Motivos de saúde",
  "sober.reason.religious": "Prática religiosa",
  "sober.reason.preference": "Preferência pessoal",
  "sober.reason.justDont": "Simplesmente não me apetece",

  "sober.honest.title": "A cena queer e o <em>álcool.</em>",
  "sober.honest.p1":
    "A vida social queer há muito que se organiza à volta de bares, em parte por razões históricas (os bares eram onde era seguro ser visível), em parte porque a vida noturna é genuinamente importante para a cultura queer. Isso é real e vale a pena preservar.",
  "sober.honest.p2":
    "As pessoas queer também têm taxas de consumo problemático de substâncias significativamente mais altas do que a população em geral, e isso está ligado ao stress de minoria, à falta de espaços sociais seguros e a uma cultura que por vezes faz da sobriedade uma forma de ficar de fora.",
  "sober.honest.p3":
    "Este espaço é para quem quer comunidade e alegria sem o álcool no centro, por qualquer motivo, sem necessidade de explicação.",
  "sober.stat.rate.n": "2 a 3×",
  "sober.stat.fewSpaces.n": "Muito poucos",
  "sober.stat.changes.n": "Isto muda",
  "sober.stat.rate.label":
    "As pessoas LGBTQ+ têm 2 a 3 vezes mais probabilidade de ter dependência de álcool do que a população em geral (Public Health England, 2017)",
  "sober.stat.fewSpaces.label":
    "espaços sociais queer são sem álcool ou acolhem ativamente quem escolhe a sobriedade, apesar da necessidade",
  "sober.stat.changes.label":
    "quando os espaços comunitários incluem deliberadamente opções sem álcool e quem escolhe a sobriedade não tem de ser invisível",

  "sober.gatherings.title": "Eventos <em>sóbrios.</em>",
  "sober.gatherings.lead":
    "Eventos sem álcool, ou eventos onde há álcool sem ser o centro da noite. Na QueerPulse, todos os eventos sem álcool estão assinalados.",
  "sober.gatherings.hostCta": "Organizar um evento ou ir a uma reunião",
  "sober.gatherings.leadLive":
    "Ainda não há eventos publicados na QueerPulse. Se queres organizar um evento sem álcool, fala com a equipa, que vai analisar o teu pedido.",
  "sober.gatherings.hostCtaLive": "Organizar um evento",
  "sober.type.alcoholFree": "Sem álcool",
  "sober.type.supportGroup": "Grupo de apoio",
  "sober.rsvp.going": "Vou",
  "sober.rsvp.cta": "Confirmar presença",

  "sober.venues.title": "Espaços <em>amigos da sobriedade.</em>",
  "sober.venues.lead":
    "Sítios onde podes divertir-te a sério sem álcool e onde ninguém da equipa vai fazer disso um caso. Todos constam também da lista verificada de Espaços Seguros.",
  "sober.venues.seeAllCta": "Ver todos os espaços seguros verificados",

  "sober.voices.title": "Nas <em>próprias palavras.</em>",
  "sober.voices.lead":
    "Pessoas da comunidade sobre como é realmente a vida social queer sóbria.",

  "sober.recovery.title":
    "Se estás a fazer um percurso de <em>recuperação.</em>",
  "sober.recovery.body":
    "Isto vai além de uma questão de estilo de vida. Se estás em recuperação do álcool, de substâncias ou de qualquer outra coisa, há aqui pessoas que compreendem. Conselhos só quando pedires.",
  "sober.recovery.peerGroup.title": "Grupo de pares Sóbrie e Queer",
  "sober.recovery.peerGroup.desc":
    "Um espaço privado e moderado dentro da QueerPulse para pessoas em recuperação. Reunião semanal online, canal de texto e eventos presenciais ocasionais. Todas as abordagens são bem-vindas, sem programa específico.",
  "sober.recovery.peerGroup.linkLabel": "Entrar no grupo",
  "sober.recovery.oneToOne.title": "Individual: fala com um par",
  "sober.recovery.oneToOne.desc":
    "Pede uma conversa com uma pessoa da comunidade que se ofereceu para falar com quem está a lidar com a sobriedade. Do outro lado está alguém que já passou por algo semelhante.",
  "sober.recovery.oneToOne.linkLabel": "Encontrar um par",
  "sober.recovery.therapists.title": "Terapia afirmativa para pessoas queer",
  "sober.recovery.therapists.desc":
    "O diretório de bem-estar inclui terapeutas com especialização em dependências e identidade queer, porque as duas coisas andam juntas.",
  "sober.recovery.therapists.linkLabel": "Encontrar terapia",
  "sober.recovery.external.title": "Recursos externos",
  "sober.recovery.external.desc":
    "APDES (redução de danos), AAPT (AA Portugal), SMART Recovery Portugal: para quando o apoio da comunidade precisa de reforço.",
  "sober.recovery.external.linkLabel": "Ver recursos",

  "sober.outro.title": "Pertences <em>aqui.</em>",
  "sober.outro.sub":
    "Em sobriedade, com curiosidade ou algures pelo meio. A comunidade é suficientemente grande para tudo isso.",
  "sober.outro.findSpacesCta": "Encontrar espaços seguros",
  "sober.outro.browseCommunitiesCta": "Explorar comunidades",

  "sober.host.modalTitle": "Eventos sóbrios",
  "sober.host.success.hostTitle": "Evento <em>submetido.</em>",
  "sober.host.success.attendTitle": "Pedido <em>enviado.</em>",
  "sober.host.success.hostSub":
    "O teu pedido chegou à equipa da QueerPulse. Ela analisa-o e responde-te na QueerPulse.",
  "sober.host.success.attendSub":
    "O teu pedido chegou à equipa da QueerPulse. Ela analisa-o e responde-te na QueerPulse. Nada é partilhado publicamente.",
  "sober.host.intro":
    "Organiza um evento sem álcool ou junta-te a uma reunião de pares já existente. Em qualquer dos casos, és tu que decides quanto te queres mostrar.",
  "sober.host.modeLabel": "O que gostarias de fazer?",
  "sober.host.mode.host.name": "Organizar um evento",
  "sober.host.mode.host.desc": "Propõe um novo evento sem álcool.",
  "sober.host.mode.attend.name": "Participar numa reunião",
  "sober.host.mode.attend.desc":
    "Pede para te juntares a uma reunião de apoio entre pares.",
  "sober.host.nameLabel.host": "O teu nome",
  "sober.host.nameLabel.attend": "Como te devemos tratar",
  "sober.host.namePlaceholder.host": "ex.: Mariana L.",
  "sober.host.namePlaceholder.attend": "Primeiro nome ou nome escolhido",
  "sober.host.detailLabel.host": "O quê e onde",
  "sober.host.detailLabel.attend": "Que reunião (e o que quiseres assinalar)",
  "sober.host.detailPlaceholder.host":
    "Uma caminhada matinal, um clube de leitura tranquilo, um círculo de apoio entre pares… local, dia, hora aproximada.",
  "sober.host.detailPlaceholder.attend":
    "ex.: a reunião semanal Sóbrie e Queer de apoio entre pares, e se gostavas que alguém te esperasse lá.",
  "sober.host.cancelCta": "Cancelar",
  "sober.host.submitCta.host": "Submeter evento",
  "sober.host.submitCta.attend": "Pedir para participar",
  "sober.host.submitCta.hostLive": "Enviar pedido",
  "sober.host.introLive":
    "Conta à equipa que evento sem álcool gostavas de organizar. Tu decides quanto partilhas.",
  "sober.host.modalTitleLive": "Organizar um evento sóbrio",

  // ── Grade da biblioteca de guias — partilhada por marketing/ResourceLibraryPage
  // (a página real "/resources", ligada à navegação, consolidada pela CNT-11)
  // e o seu cromado de pesquisa/filtro/cartão. ────────────────────────────
  "library.category.all": "Todos os guias",
  "library.category.housing": "Habitação",
  "library.category.health": "Saúde",
  "library.category.legal": "Direito",
  "library.category.finance": "Finanças",
  "library.category.trans": "Vida trans",
  "library.category.safety": "Segurança e privacidade",
  "library.category.community": "Vida em comunidade",
  "library.category.culture": "Cultura e arquivo",
  "library.readGuideCta": "Ler o guia",
  "library.loadingMore": "A carregar mais guias…",
  "library.loadMoreCta": "Carregar mais guias",
  // Sinal de atualidade da CNT-13, mostrado em cada cartão de guia.
  "library.card.verifiedOn": "Verificado a {date}",
  "library.card.notYetVerified": "Ainda não verificado",
  "library.loadMoreError": "Não conseguimos carregar mais guias.",

  // ── SexualHealthPage (+ SexualHealthTabs.tsx + sexualHealth.data.ts) ────
  // Assinalado para revisão nativa: informação sobre saúde sexual/VIH/PrEP.
  // Desde 6 de outubro de 2026 (DES-421), TESTING_INFO, PREP_STEPS, PREP_FAQ,
  // HIV_INFO e GUIDES estão traduzidos abaixo, tal como o diretório CLINICS,
  // só de demonstração (sexualHealth.testing.clinic.*).
  "sexualHealth.meta.title":
    "Saúde sexual em Lisboa: testes, PrEP e recursos sobre VIH",
  "sexualHealth.meta.description":
    "Um guia prático de saúde sexual em Lisboa: onde fazer testes, como aceder à PrEP pelo SNS e recursos sobre VIH, incluindo I=I.",

  "sexualHealth.hero.cat": "Saúde sexual",
  "sexualHealth.hero.title": "A tua saúde, <em>nos teus termos.</em>",
  "sexualHealth.hero.lead":
    "Direto, específico para pessoas queer, sem julgamentos. Onde fazer testes, como funciona a PrEP e recursos sobre VIH, tudo num só lugar.",
  "sexualHealth.outro.title": "A tua saúde <em>importa.</em>",
  "sexualHealth.outro.sub":
    "Perguntas, preocupações, ou simplesmente não sabes por onde começar: a comunidade está aqui.",
  "sexualHealth.outro.wellbeingCta": "Recursos de bem-estar",
  "sexualHealth.outro.peerSupportCta": "Encontrar apoio entre pares",

  "sexualHealth.tab.testing": "Testes e rastreio",
  "sexualHealth.tab.prep": "PrEP em Portugal",
  "sexualHealth.tab.hiv": "Recursos sobre VIH",
  "sexualHealth.tab.guides": "Guias e perguntas",

  "sexualHealth.testing.title": "Onde fazer o <em>teste</em> em Lisboa.",
  "sexualHealth.testing.lead":
    "Clínicas e serviços de testes de saúde sexual em Lisboa. Os horários mudam, por isso confirma no site de cada serviço antes de ires.",
  "sexualHealth.testing.filter.all": "Todas",
  "sexualHealth.testing.filter.public": "Grátis / SNS",
  "sexualHealth.testing.filter.ngo": "ONG",
  "sexualHealth.testing.filter.pharmacy": "Farmácia",
  "sexualHealth.testing.filter.private": "Privado",
  "sexualHealth.testing.filterAria": "Filtrar clínicas por tipo",
  "sexualHealth.testing.empty.title":
    "Ainda não há clínicas desse tipo na lista",
  "sexualHealth.testing.empty.description":
    "Há ainda muitos espaços acolhedores para fazer o teste. Limpa o filtro para ver todas as opções avaliadas pela comunidade.",
  "sexualHealth.testing.empty.clearCta": "Limpar filtros",
  "sexualHealth.testing.clinicCard.verifiedBadge": "Verificado pela comunidade",
  "sexualHealth.testing.clinicCard.viewDetailsCta": "Ver detalhes",
  "sexualHealth.testing.clinicCard.hideDetailsCta": "Ocultar detalhes",
  "sexualHealth.testing.clinicCard.testsLabel": "O que testam",
  "sexualHealth.testing.clinicCard.bringLabel": "O que levar",
  "sexualHealth.testing.clinicCard.accessLabel": "Acesso",
  "sexualHealth.testing.clinicCard.noteLabel": "Convém saber",
  "sexualHealth.testing.clinicCard.review_one":
    "{rating} · {count} avaliação da comunidade",
  "sexualHealth.testing.clinicCard.review_other":
    "{rating} · {count} avaliações da comunidade",
  "sexualHealth.testing.nominate.doneTitle":
    "Agradecemos. <em>Está anotado.</em>",
  "sexualHealth.testing.nominate.doneBody":
    "Vamos verificá-lo e revê-lo com a comunidade antes de o publicarmos. O quadro é fiável porque pessoas como tu o mantêm atualizado.",
  "sexualHealth.testing.nominate.anotherCta": "Sugerir outro",
  "sexualHealth.testing.nominate.title":
    "Conheces um serviço que devíamos adicionar?",
  "sexualHealth.testing.nominate.body":
    "Sugere uma clínica ou serviço para avaliação da comunidade. Verificamos cada entrada antes de a publicarmos.",
  "sexualHealth.testing.nominate.placeholder":
    "Nome da clínica, localização e porque a recomendas…",
  "sexualHealth.testing.nominate.submitCta": "Enviar sugestão",

  "sexualHealth.prep.title": "PrEP em <em>Portugal.</em>",
  "sexualHealth.prep.lead":
    "A PrEP (profilaxia pré-exposição) está disponível gratuitamente através do SNS para quem cumpre os critérios. Tomada corretamente, tem uma eficácia superior a 99% na prevenção do VIH. Eis como lhe aceder.",
  "sexualHealth.prep.tip":
    "<strong>Portugal foi um dos primeiros países europeus a tornar a PrEP gratuita.</strong> Não precisas de seguro privado. O processo envolve uma verificação simples de elegibilidade, análises ao sangue e uma prescrição, e todo o percurso demora cerca de 4 a 6 semanas da primeira vez.",
  "sexualHealth.prep.faqTitle": "Perguntas <em>frequentes.</em>",
  "sexualHealth.prep.step1.title":
    "Marca uma consulta num CAD ou numa clínica de saúde sexual",
  "sexualHealth.prep.step1.description":
    "Diz que tens interesse na PrEP. O CheckpointLx e o GAT podem ajudar-te com o encaminhamento se não souberes por onde começar.",
  "sexualHealth.prep.step1.note":
    "O CheckpointLx faz aconselhamento sobre PrEP. Os horários mudam, por isso confirma o horário atual no site da própria clínica antes de ires.",
  "sexualHealth.prep.step2.title":
    "Avaliação inicial de elegibilidade e análises ao sangue",
  "sexualHealth.prep.step2.description":
    "A equipa de aconselhamento fala contigo sobre a tua situação e pede análises ao sangue: VIH, hepatite B, creatinina (função renal) e um painel de IST. Os resultados chegam em 5 a 10 dias.",
  "sexualHealth.prep.step2.note":
    "Para começares a PrEP, o teu teste de VIH tem de ser negativo.",
  "sexualHealth.prep.step3.title": "Receita emitida: levanta a medicação",
  "sexualHealth.prep.step3.description":
    "Se fores elegível, recebes uma receita de tenofovir/emtricitabina. Com receita de uma consulta hospitalar do SNS, levantas a medicação gratuitamente na farmácia do hospital. Com receita do teu médico de família, de uma organização comunitária ou de uma clínica privada, podes levantá-la numa farmácia comunitária, em que o SNS paga a maior parte do preço e tu pagas o resto.",
  "sexualHealth.prep.step3.note":
    "Não tens número de utente do SNS? O GAT Lisboa pode aconselhar-te sobre alternativas.",
  "sexualHealth.prep.step4.title": "Consultas de acompanhamento trimestrais",
  "sexualHealth.prep.step4.description":
    "De 3 em 3 meses: teste de VIH, rastreio de IST e avaliação da função renal. É também aqui que recebes a receita seguinte. As consultas duram 20 a 30 minutos.",
  "sexualHealth.prep.faq.snsNumber.question":
    "Preciso de número de utente do SNS?",
  "sexualHealth.prep.faq.snsNumber.answer":
    "Com cidadania da UE, podes aceder aos serviços do SNS com o Cartão Europeu de Seguro de Doença. Sem cidadania da UE, deves inscrever-te no SNS: tens direito a isso se residires legalmente em Portugal. Se a tua situação for mais complexa, o GAT Lisboa é especializado em apoiar pessoas com situações documentais menos simples.",
  "sexualHealth.prep.faq.onDemand.question":
    "Posso tomar a PrEP só quando preciso (toma a pedido)?",
  "sexualHealth.prep.faq.onDemand.answer":
    "Sim, para sexo anal. O esquema 2-1-1 (dois comprimidos 2 a 24 horas antes do sexo, depois um comprimido 24 horas após a primeira toma e outro 48 horas após a primeira toma) é aceite em Portugal. Para sexo vaginal ou frontal, e para mulheres trans que fazem estrogénio, a toma diária é a opção recomendada. Fala com a tua equipa clínica sobre o esquema mais indicado para ti.",
  "sexualHealth.prep.faq.otherStis.question":
    "A PrEP protege contra outras IST?",
  "sexualHealth.prep.faq.otherStis.answer":
    "A PrEP só previne o VIH. Não protege contra sífilis, gonorreia, clamídia, herpes, HPV nem hepatite C. O preservativo continua a ser útil para prevenir IST, e é por isso que os testes regulares de 3 em 3 meses fazem parte do programa de PrEP.",
  "sexualHealth.prep.faq.transHormones.question":
    "Sou uma pessoa trans e faço terapia hormonal. Isso afeta a PrEP?",
  "sexualHealth.prep.faq.transHormones.answer":
    "Em mulheres trans a fazer estrogénio, alguns estudos sugerem níveis do medicamento ligeiramente mais baixos, por isso a toma diária é a opção recomendada. Em geral, a PrEP e a terapia hormonal podem ser tomadas em conjunto com segurança. Fala com profissionais de saúde com experiência com pessoas trans; o CheckpointLx tem uma equipa com essa experiência.",

  "sexualHealth.hiv.title": "VIH: o que precisas de <em>saber.</em>",
  "sexualHealth.hiv.lead":
    "Informação honesta e atual. O VIH é uma condição controlável. Com tratamento, as pessoas com VIH vivem vidas longas e plenas e não transmitem o vírus.",
  "sexualHealth.hiv.uu.title": "Indetetável = <em>Intransmissível.</em>",
  "sexualHealth.hiv.uu.body":
    "I=I é um dos factos mais importantes na saúde sexual. As pessoas que vivem com VIH, em tratamento eficaz e com carga viral indetetável, não conseguem transmitir sexualmente o VIH às suas parcerias. Isto está cientificamente estabelecido e é reconhecido por todas as principais autoridades de saúde.",
  "sexualHealth.hiv.uu.stat.uu.label":
    "Indetetável = Intransmissível. Confirmado pelo CDC, pela OMS e por mais de 400 organizações de saúde em todo o mundo.",
  "sexualHealth.hiv.uu.stat.rate.label":
    "das pessoas em tratamento em Portugal atingem uma carga viral indetetável em 6 meses.",
  "sexualHealth.hiv.uu.stat.free.value": "Grátis",
  "sexualHealth.hiv.uu.stat.free.label":
    "O tratamento do VIH (antirretrovirais) é gratuito para todas as pessoas residentes através do SNS.",
  "sexualHealth.hiv.findServicesCta": "Explorar comunidades",
  "sexualHealth.hiv.info.positive.title":
    "Acabaste de ter um resultado positivo?",
  "sexualHealth.hiv.info.positive.body":
    "Respira fundo. O tratamento atual do VIH é eficaz e simples. O CAD ou o teu médico de família podem encaminhar-te de imediato para uma consulta de doenças infeciosas. O tratamento costuma começar poucos dias após o diagnóstico.",
  "sexualHealth.hiv.info.positive.link": "SNS 24: 808 24 24 24",
  "sexualHealth.hiv.info.pep.title": "PEP: depois de uma possível exposição",
  "sexualHealth.hiv.info.pep.body":
    "A profilaxia pós-exposição tem de começar nas primeiras 72 horas (idealmente nas primeiras 24). Vai às urgências de qualquer hospital e pede PEP. Não esperes. É gratuita pelo SNS e muito eficaz quando tomada a tempo.",
  "sexualHealth.hiv.info.peerSupport.title": "Apoio entre pares na comunidade",
  "sexualHealth.hiv.info.peerSupport.body":
    "Falar com quem já passou pelo mesmo ajuda. Organizações como o GAT e a Abraço têm apoio de pessoas que vivem com VIH, e podes explorar as comunidades da QueerPulse para encontrares uma que te faça sentido.",
  "sexualHealth.hiv.info.peerSupport.link": "Explorar comunidades",
  "sexualHealth.hiv.info.rights.title":
    "Direitos e revelação do estado serológico",
  "sexualHealth.hiv.info.rights.body":
    "A lei portuguesa sobre a criminalização do VIH tem nuances. Não tens obrigação legal de revelar o teu estado serológico a todas as pessoas parceiras em todas as situações. A realidade jurídica é complexa. Fala com o GAT ou procura aconselhamento jurídico se tiveres dúvidas.",
  "sexualHealth.hiv.info.rights.link": "Recursos jurídicos",

  "sexualHealth.guides.title": "Guias e <em>perguntas.</em>",
  "sexualHealth.guides.lead":
    "Guias curtos sobre vacinação, IST, conversas com as pessoas parceiras, consumo de substâncias e muito mais.",
  "sexualHealth.guides.ask.doneTitle": "A tua pergunta foi <em>enviada.</em>",
  "sexualHealth.guides.ask.doneBody":
    "Uma pessoa com experiência relevante vai responder, sem nome, sem conta e sem nada associado a ti. Volta aqui dentro de um dia ou dois.",
  "sexualHealth.guides.ask.anotherCta": "Fazer outra pergunta",
  "sexualHealth.guides.ask.title": "Pergunta o que quiseres, de forma anónima.",
  "sexualHealth.guides.ask.body":
    "Envia uma pergunta à comunidade e quem tiver conhecimento sobre o tema responde. Nada é partilhado nem associado à tua conta.",
  "sexualHealth.guides.ask.placeholder":
    "A tua pergunta. Nenhum detalhe é demasiado pequeno ou embaraçoso…",
  "sexualHealth.guides.ask.anonymousNote":
    "Totalmente anónimo. Não precisas de conta.",
  "sexualHealth.guides.ask.submitCta": "Enviar pergunta",

  // ── MicroGrantsPage (+ MicroGrantsSections.tsx + microGrants.data.ts) ───
  // Nomes/descrições de CURRENT/PAST e do painel (PANEL) ficam em inglês,
  // como conteúdo (precedente THERAPISTS); o processo da bolsa em si está
  // traduzido abaixo.
  "microGrants.hero.backLink": "Financiamento e apoios",
  "microGrants.hero.eyebrow": "Fundo comunitário",
  "microGrants.hero.title.line1": "Pouco dinheiro.",
  "microGrants.hero.title.line2": "<em>Impacto real.</em>",
  "microGrants.hero.lead":
    "Microbolsas de 200 a 2000 € para projetos comunitários queer em Lisboa. Financiadas pela comunidade, atribuídas pela comunidade, com prestação de contas à comunidade. Sem gatekeepers.",
  "microGrants.hero.stat.awarded.label": "atribuído até agora",
  "microGrants.hero.stat.projects.label": "projetos financiados",
  "microGrants.hero.stat.pot.label": "no fundo deste trimestre",
  "microGrants.hero.fundBar.roundLabel":
    "Ronda de financiamento do 2.º trimestre de 2026",
  "microGrants.hero.fundBar.goalLabel": "meta",

  "microGrants.how.01.title": "A comunidade contribui",
  "microGrants.how.01.body":
    "Quem pode contribuir junta ao fundo trimestral o valor que quiser, a partir de 5 €. Sem pressão, sem mínimo.",
  "microGrants.how.02.title": "Os projetos candidatam-se",
  "microGrants.how.02.body":
    "Qualquer pessoa da QueerPulse pode candidatar-se a uma bolsa. Uma página: o que é o projeto, de quanto precisas, o que vai fazer.",
  "microGrants.how.03.title": "A comunidade decide",
  "microGrants.how.03.body":
    "Um painel rotativo de 5 pessoas avalia as candidaturas. As decisões são publicadas na íntegra com justificação. Não há recurso das decisões. A próxima ronda está sempre aberta.",
  "microGrants.how.04.title": "Os projetos prestam contas",
  "microGrants.how.04.body":
    "As pessoas contempladas partilham uma atualização breve aos 3 meses. O que aconteceu, o que mudou, o que gastaram. Tudo publicado na revista.",

  "microGrants.round.statusLabel":
    "Candidaturas abertas · 2.º trimestre de 2026",
  "microGrants.round.title": "Esta ronda: <em>fazer coisas em conjunto.</em>",
  "microGrants.round.desc":
    "Este trimestre damos prioridade a projetos que criem algo (eventos, publicações, espaços, ferramentas) acessível a toda a comunidade queer de Lisboa e que a beneficie. Projetos a solo e colaborações são igualmente bem-vindos.",
  "microGrants.round.meta.amountLabel": "por projeto",
  "microGrants.round.meta.deadlineLabel": "prazo de candidatura",
  "microGrants.round.meta.decisionLabel": "até à decisão",
  "microGrants.round.meta.deadlineValue": "30 de junho de 2026",
  "microGrants.round.meta.decisionValue": "3 a 4 semanas",
  "microGrants.round.criteriaTitle": "Critérios",
  "microGrants.criteria.member":
    "Fazes parte da QueerPulse e estás em situação regular",
  "microGrants.criteria.benefit":
    "O projeto beneficia a comunidade queer em Lisboa para lá de ti pessoalmente",
  "microGrants.criteria.timeline":
    "Consegues concretizá-lo até 3 meses depois de receberes a bolsa",
  "microGrants.criteria.update":
    "Estás disponível para partilhar uma atualização pública breve sobre o que aconteceu",
  "microGrants.criteria.impact":
    "O dinheiro vai mudar genuinamente o que é possível, para lá de acelerar o que já ias fazer",
  "microGrants.round.applyCta": "Candidata-te a esta ronda",
  "microGrants.live.applyTitle": "Candidata-te ao <em>fundo comunitário</em>",
  "microGrants.live.applyBody":
    "Conta-nos o que queres fazer e quanto custaria. Pessoas da comunidade leem todas as candidaturas.",
  "microGrants.live.applyCta": "Começar uma candidatura",
  "microGrants.apply.modalTitleLive": "Candidatura ao fundo comunitário",

  "microGrants.section.currentTitle": "Projetos <em>apoiados</em> atualmente",
  "microGrants.section.pastTitle": "Projetos <em>anteriores</em>",

  "microGrants.sidebar.rulesTitle": "Regras da bolsa",
  "microGrants.rule.oneGrant.title": "Uma bolsa por pessoa",
  "microGrants.rule.oneGrant.body":
    "Por ano civil. Projetos colaborativos podem candidatar-se em grupo.",
  "microGrants.rule.maximum.title": "Máximo de 2000 €",
  "microGrants.rule.maximum.body":
    "Para projetos maiores, sugerimos que te candidates em várias rondas ou que combines a bolsa com a Troca.",
  "microGrants.rule.benefit.title": "Benefício comunitário obrigatório",
  "microGrants.rule.benefit.body":
    "Tem de beneficiar pessoas queer em Lisboa para além de quem se candidata. Projetos pessoais não são elegíveis.",
  "microGrants.rule.reporting.title": "Prestação de contas pública",
  "microGrants.rule.reporting.body":
    "Uma atualização breve aos 3 meses, publicada aqui e na revista. Não tens de devolver o dinheiro. Pedimos só que prestes contas, porque isso importa.",
  "microGrants.rule.noPolitics.title": "Sem campanhas políticas",
  "microGrants.rule.noPolitics.body":
    "Financiamos projetos comunitários. A atividade eleitoral e partidária fica fora do fundo.",
  "microGrants.sidebar.panelTitle":
    "Painel de avaliação: 2.º trimestre de 2026",
  "microGrants.sidebar.joinPanelCta": "Juntar-te ao painel de avaliação",

  "microGrants.contribute.title": "Contribui para o <em>fundo.</em>",
  "microGrants.contribute.body":
    "O fundo é sustentado por quem contribui com o que pode. Não há mínimo. Cada valor torna a próxima ronda possível.",
  "microGrants.contribute.otherAmount": "Outro",
  "microGrants.contribute.cta": "Contribuir para o fundo",
  "microGrants.contribute.note":
    "As contribuições são voluntárias. Apenas para a comunidade QueerPulse. Não dedutíveis em sede fiscal ao abrigo da lei portuguesa atual.",

  "microGrants.outro.title": "A comunidade <em>autofinancia-se.</em>",
  "microGrants.outro.sub":
    "Cada projeto daqui só foi possível porque pessoas da comunidade contribuíram com o que podiam. O fundo cresce com a rede.",
  "microGrants.outro.joinCta": "Juntar-te à rede",

  // ── Grant application wizard (GrantApplicationModal + step components) ──
  "microGrants.apply.category.creative.name": "Criação e arte",
  "microGrants.apply.category.creative.sub":
    "Exposições, gravuras, performances",
  "microGrants.apply.category.education.name": "Educação e conhecimento",
  "microGrants.apply.category.education.sub": "Workshops, guias, recursos",
  "microGrants.apply.category.health.name": "Saúde e bem-estar",
  "microGrants.apply.category.health.sub": "Saúde mental, redução de danos",
  "microGrants.apply.category.legal.name": "Direito e ativismo",
  "microGrants.apply.category.legal.sub": "Direitos, acompanhamento",
  "microGrants.apply.category.community.name": "Comunidade e espaço",
  "microGrants.apply.category.community.sub": "Eventos, entreajuda",
  "microGrants.apply.category.other.name": "Outro",
  "microGrants.apply.category.other.sub":
    "Algo que não encaixa bem noutra categoria",

  "microGrants.apply.commitment.update":
    "Vou partilhar uma atualização pública breve aos 3 meses: o que aconteceu, o que foi gasto, o que mudou.",
  "microGrants.apply.commitment.benefit":
    "Este projeto beneficia genuinamente a comunidade queer em Lisboa, para lá de mim pessoalmente.",
  "microGrants.apply.commitment.timeline":
    "Consigo concretizar isto até 3 meses depois de receber a bolsa.",

  "microGrants.apply.stepLabel.category": "Escolher uma categoria",
  "microGrants.apply.stepLabel.project": "Detalhes do projeto",
  "microGrants.apply.stepLabel.budget": "Orçamento detalhado",
  "microGrants.apply.stepLabel.about": "Sobre ti",
  "microGrants.apply.stepLabel.review": "Rever e submeter",

  "microGrants.apply.modalAriaLabel":
    "Candidatura: ronda do 2.º trimestre de 2026",
  "microGrants.apply.modalTitle": "Candidatura: ronda do 2.º trimestre de 2026",
  "microGrants.apply.stepIndicator": "Passo {step} de {total}: {stepLabel}",
  "microGrants.apply.cancelCta": "Cancelar",
  "microGrants.apply.backCta": "Voltar",
  "microGrants.apply.continueCta": "Continuar",
  "microGrants.apply.submitCta": "Submeter candidatura",
  "microGrants.apply.success.title": "Candidatura <em>submetida.</em>",
  "microGrants.apply.success.sub":
    "A tua candidatura fica registada e segue para o painel de avaliação, que reúne em meados de julho. O painel decide esta ronda antes de 31 de julho e responde por mensagem na QueerPulse, seja qual for o resultado.",
  "microGrants.apply.success.closeCta": "Fechar",

  "microGrants.apply.category.stepTitle": "Que tipo de <em>projeto?</em>",
  "microGrants.apply.category.stepSub":
    "Escolhe a categoria que melhor descreve o teu projeto. Assim o painel de avaliação consegue ler lado a lado as candidaturas da mesma área.",

  "microGrants.apply.project.stepTitle": "Fala-nos <em>do projeto.</em>",
  "microGrants.apply.project.stepSub":
    "Explica com clareza e honestidade. O painel de avaliação lê tudo. Uma linguagem simples resulta sempre melhor do que uma linguagem formal.",
  "microGrants.apply.project.nameLabel": "Nome do projeto",
  "microGrants.apply.project.namePlaceholder": "Um título curto e claro",
  "microGrants.apply.project.whatLabel": "O que vais criar ou fazer?",
  "microGrants.apply.project.charCounter": "{current} / {max}",
  "microGrants.apply.project.whatPlaceholder":
    "Descreve o projeto em termos simples. O que vai existir ou acontecer que não existe agora?",
  "microGrants.apply.project.beneficiaryLabel": "Quem beneficia, e como?",
  "microGrants.apply.project.beneficiaryPlaceholder":
    "A quem chega isto, dentro da comunidade queer? Que diferença vai fazer na vida dessas pessoas?",
  "microGrants.apply.project.timelineLabel": "Calendário",
  "microGrants.apply.project.timelinePlaceholder":
    "ex.: agosto a outubro de 2026",
  "microGrants.apply.project.stageLabel": "Fase do projeto",
  "microGrants.apply.project.stage.select": "Selecionar…",
  "microGrants.apply.project.stage.idea": "Ideia: ainda não começou",
  "microGrants.apply.project.stage.development": "Em desenvolvimento",
  "microGrants.apply.project.stage.ready":
    "Pronto a arrancar: só precisa de financiamento",
  "microGrants.apply.project.stage.ongoing":
    "Em curso: a bolsa permitiria alargá-lo",

  "microGrants.apply.budget.stepTitle": "Como vais <em>gastar o dinheiro?</em>",
  "microGrants.apply.budget.stepSub":
    "Divide o teu orçamento em rubricas. Sê realista: o painel prefere estimativas honestas a otimistas. Máximo de 2000 € nesta ronda.",
  "microGrants.apply.budget.itemPlaceholder":
    "Rubrica (ex.: custos de impressão)",
  "microGrants.apply.budget.amountLabel": "Montante em euros",
  "microGrants.apply.budget.addItemCta": "+ Adicionar rubrica",
  "microGrants.apply.budget.totalLabel": "Total pedido",
  "microGrants.apply.budget.hint":
    "Se também estás a contribuir com o teu tempo ou dinheiro, menciona-o abaixo: isso reforça a candidatura.",
  "microGrants.apply.budget.otherContributionsLabel":
    "Outras contribuições (opcional)",
  "microGrants.apply.budget.otherContributionsPlaceholder":
    "ex.: 20 horas do meu tempo, uso do estúdio de uma pessoa amiga",

  "microGrants.apply.about.stepTitle": "Sobre <em>ti.</em>",
  "microGrants.apply.about.stepSub":
    "Já sabemos quem és na comunidade, mas conta-nos um pouco sobre a tua relação com este projeto e com a comunidade a que serve.",
  "microGrants.apply.about.nameLabel":
    "O teu nome (como queres que apareça no registo da bolsa)",
  "microGrants.apply.about.namePlaceholder":
    "Nome escolhido ou nome completo, tu decides",
  "microGrants.apply.about.connectionLabel": "A tua ligação a este projeto",
  "microGrants.apply.about.connectionPlaceholder":
    "Porque és a pessoa certa para isto? Qual é a tua relação com a comunidade a que serve?",
  "microGrants.apply.about.priorGrantLabel":
    "Já recebeste uma bolsa da QueerPulse antes?",
  "microGrants.apply.about.priorGrant.select": "Selecionar…",
  "microGrants.apply.about.priorGrant.first":
    "Não, esta é a minha primeira candidatura",
  "microGrants.apply.about.priorGrant.reported":
    "Sim, e entreguei um relatório",
  "microGrants.apply.about.priorGrant.pending":
    "Sim, o relatório está pendente (dentro de 3 meses)",
  "microGrants.apply.about.commitmentsLabel": "Compromissos",

  "microGrants.apply.review.stepTitle": "Revê a tua <em>candidatura.</em>",
  "microGrants.apply.review.stepSub":
    "Confirma que está tudo certo. Podes voltar atrás para editar qualquer secção.",
  "microGrants.apply.review.categoryLabel": "Categoria",
  "microGrants.apply.review.projectLabel": "Projeto",
  "microGrants.apply.review.whatLabel": "O que vais criar / fazer",
  "microGrants.apply.review.budgetLabel": "Orçamento pedido",
  "microGrants.apply.review.applicantLabel": "Pessoa candidata",
  "microGrants.apply.review.deadlineLabel": "Prazo",
  "microGrants.apply.review.deadlineValue":
    "<strong>30 de junho de 2026</strong>, decisão em 3 a 4 semanas",

  // ── PanelSignupModal ─────────────────────────────────────────────────────
  "microGrants.panel.modalTitle": "Juntar-te ao painel de avaliação",
  "microGrants.panel.success.title": "Estás na <em>lista.</em>",
  "microGrants.panel.success.sub":
    "Agradecemos. A coordenação do painel avalia as novas pessoas voluntárias antes de cada trimestre e contacta-te antes de a ronda do 3.º trimestre abrir. Os painéis rodam para que o trabalho fique repartido.",
  "microGrants.panel.intro":
    "O painel lê as candidaturas e decide as bolsas em conjunto. Mantemo-lo pequeno, rotativo e deliberadamente diverso, sem gatekeepers profissionais.",
  "microGrants.panel.nameLabel": "Nome",
  "microGrants.panel.namePlaceholder": "O teu nome",
  "microGrants.panel.emailLabel": "Email",
  "microGrants.panel.emailPlaceholder": "tu@exemplo.com",
  "microGrants.panel.whyLabel": "Porque gostarias de ajudar a avaliar",
  "microGrants.panel.whyPlaceholder":
    "Uma frase ou duas: experiência vivida, o tipo de projetos que te importam, o tempo que podes dar.",
  "microGrants.panel.cancelCta": "Cancelar",
  "microGrants.panel.submitCta": "Adicionar-me ao painel",

  // ── PeerSupportPage (+ peerSupport.data.ts) ─────────────────────────────
  "peerSupport.meta.title":
    "Apoio entre pares para pessoas trans em Lisboa: como funciona",
  "peerSupport.meta.description":
    "Apoio entre pares no Trans Hub da QueerPulse: alguém que já passou pelo que estás a viver. Como pedir apoio ou passar tu a dar apoio.",

  "peerSupport.hero.eyebrow": "Trans Hub · Apoio entre pares",
  "peerSupport.hero.title": "Alguém que <em>percebe.</em>",
  "peerSupport.hero.lead":
    "Apoio entre pares no Hub, em termos simples: o que é, o que não é, como pedi-lo e como passar tu a dar apoio quando chegar a altura.",
  "peerSupport.hero.anchor.what": "O que é",
  "peerSupport.hero.anchor.how": "Como funciona",
  "peerSupport.what.title": "O que <em>é</em> o apoio entre pares",
  "peerSupport.what.p1":
    "Apoio entre pares é estar com alguém que já passou pelo que estás a passar e que não precisa que lhe expliques tudo. Sem notas clínicas, sem diagnóstico, sem objetivo que tenhas de atingir no fim.",
  "peerSupport.what.p2":
    "Na QueerPulse, o apoio entre pares acontece entre pessoas da comunidade: no fórum, onde se partilha o que resultou, e em mensagens diretas com pessoas com quem tens conexão. Tu escolhes quanto partilhas, e podes afastar-te quando quiseres.",
  "peerSupport.how.title": "Como <em>funciona</em>",
  "peerSupport.how.lead":
    "Três passos, nenhum deles vinculativo. Manténs o controlo em todos eles.",
  "peerSupport.step.01.title": "Pergunta no fórum",
  "peerSupport.step.01.body":
    "Escreve o que procuras. Podes entrar em pormenores ou ficar pelo vago, como preferires: 'Comecei agora as hormonas e quero alguém que perceba' já chega. Os tópicos do fórum ficam visíveis para toda a gente no fórum, com o teu nome. Nas categorias Saúde e Bem-estar, Habitação, Trans e Não-binárie, Legal e Migração, Amor e Relações e Financiamento e Apoios, podes publicar sem o teu nome.",
  "peerSupport.step.02.title": "Continua onde te souber bem",
  "peerSupport.step.02.body":
    "Outras pessoas podem responder no tópico. Se as palavras de alguém te tocarem, podes criar uma conexão com essa pessoa e continuar a falar por mensagem direta. Não há compromisso mínimo, e parar não tem nada de estranho.",
  "peerSupport.step.03.title": "Responde também a outra pessoa",
  "peerSupport.step.03.body":
    "Quando for o teu momento, responde a alguém que está onde tu já estiveste. Umas quantas frases honestas, vindas da tua experiência, são o que dá corpo ao apoio entre pares.",
  "peerSupport.outro.title":
    "Não tens de carregar isto <em>sem companhia.</em>",
  "peerSupport.outro.sub":
    "O Hub está aqui, e o fórum mais alargado da comunidade também.",
  "peerSupport.outro.hubCta": "Ir para o Trans Hub",
  "peerSupport.outro.forumCta": "Abrir o fórum",

  // ── AccessibleLisbonPage (+ accessibleLisbon.data.ts) ───────────────────
  "accessibleLisbon.meta.title":
    "Lisboa acessível: percursos sem degraus e espaços calmos",
  "accessibleLisbon.meta.description":
    "Lisboa acessível verificada pela comunidade: percursos sem degraus, bares e cafés de baixo estímulo sensorial, e parques para famílias, testados por quem lá esteve.",
  "accessibleLisbon.hero.eyebrow": "Lisboa Acessível",
  "accessibleLisbon.hero.title": "Lisboa, <em>verdadeiramente acessível.</em>",
  "accessibleLisbon.hero.lead":
    "Percursos sem degraus, espaços de baixo estímulo sensorial e locais para famílias, cada entrada verificada por alguém da comunidade que lá esteve. Se está na lista, alguém verificou pessoalmente.",
  "accessibleLisbon.verifiedTag": "Verificado por pares",

  "accessibleLisbon.group.routes.label": "Percursos de corrida sem degraus",
  "accessibleLisbon.group.routes.intro":
    "Circuitos que o grupo de corrida já percorreu a pé: piso plano e uniforme, sem escadas nem lancis para transpor.",
  "accessibleLisbon.group.venues.label": "Espaços sociais",
  "accessibleLisbon.group.venues.intro":
    "Cafés e restaurantes onde pessoas da comunidade já estiveram pessoalmente. Só entram na lista sítios que alguém verificou de facto.",
  "accessibleLisbon.group.family.label": "Locais para famílias",
  "accessibleLisbon.group.family.intro":
    "Parques e espaços que funcionam com carrinhos de bebé, crianças pequenas e uma ou outra birra, escolhidos pelo grupo de famílias.",

  "accessibleLisbon.place.parqueNacoes.detail":
    "7 km, completamente plano, piso de alcatrão largo em todo o percurso. O circuito mais fácil para começar, sem degraus a partir do elevador nascente.",
  "accessibleLisbon.place.belemAlges.detail":
    "5 km de ida e volta ao longo do rio. Piso regular, espaço aberto, e podes voltar para trás onde quiseres.",
  "accessibleLisbon.place.alamedaGulbenkian.detail":
    "4 km por jardins e passeios largos. Uma subida ligeira, o resto é nivelado.",
  "accessibleLisbon.place.arquivo.detail":
    "Café-biblioteca, genuinamente sossegado, entrada nivelada a partir da praça. Bom para eventos com pouco barulho.",
  "accessibleLisbon.place.mariaCaxuxa.detail":
    "Entrada sem degraus, aro magnético auditivo, casa de banho acessível, e equipa que sabe o que faz.",
  "accessibleLisbon.place.heim.detail":
    "Com lugares sentados, música baixa, bom café. Um pequeno degrau à entrada, e a equipa traz uma rampa se pedires.",
  "accessibleLisbon.place.trindade.detail":
    "Acessível pela entrada do Chiado; a sala de trás, mais sossegada, tem excelente acústica para um grupo.",
  "accessibleLisbon.place.jardimEstrela.detail":
    "Parque infantil vedado, percursos sem degraus, café e casas de banho no local. O relvado de piquenique junto ao chafariz pode ser reservado.",
  "accessibleLisbon.place.eduardoVii.detail":
    "Relvados largos e planos na parte de baixo, acesso fácil com carrinho a partir do Marquês. Evita a subida íngreme no verão.",
  "accessibleLisbon.place.gulbenkianGardens.detail":
    "Sombra, lagos, patos e caminhos de piso regular por todo o lado. Calmo e raramente cheio nas manhãs de semana.",

  "accessibleLisbon.flag.7km": "7 km",
  "accessibleLisbon.flag.tarmac": "Alcatrão",
  "accessibleLisbon.flag.stepFree": "Sem degraus",
  "accessibleLisbon.flag.5km": "5 km",
  "accessibleLisbon.flag.flat": "Plano",
  "accessibleLisbon.flag.turnBackAnywhere": "Regresso em qualquer ponto",
  "accessibleLisbon.flag.4km": "4 km",
  "accessibleLisbon.flag.mostlyLevel": "Quase sempre plano",
  "accessibleLisbon.flag.lowNoise": "Baixo ruído",
  "accessibleLisbon.flag.seated": "Lugares sentados",
  "accessibleLisbon.flag.hearingLoop": "Aro magnético auditivo",
  "accessibleLisbon.flag.accessibleWc": "Casa de banho acessível",
  "accessibleLisbon.flag.rampOnRequest": "Rampa a pedido",
  "accessibleLisbon.flag.lowMusic": "Música baixa",
  "accessibleLisbon.flag.stepFreeEntrance": "Entrada sem degraus",
  "accessibleLisbon.flag.quietBackRoom": "Sala de trás sossegada",
  "accessibleLisbon.flag.playground": "Parque infantil",
  "accessibleLisbon.flag.toilets": "Casas de banho",
  "accessibleLisbon.flag.buggyFriendly": "Acesso com carrinho de bebé",
  "accessibleLisbon.flag.openSpace": "Espaço aberto",
  "accessibleLisbon.flag.shaded": "Com sombra",
  "accessibleLisbon.flag.smoothPaths": "Piso regular",
  "accessibleLisbon.flag.calm": "Calmo",

  "accessibleLisbon.outro.title":
    "Estiveste nalgum sítio <em>que funciona?</em>",
  "accessibleLisbon.outro.sub":
    "A lista só se mantém honesta porque continuamos a acrescentar-lhe coisas. Traz um local verificado para o quadro de recursos da tua comunidade.",
  "accessibleLisbon.outro.cta": "Encontrar um evento",

  // ── ArtCritGuidePage (+ artCritGuide.data.ts) ───────────────────────────
  "artCritGuide.meta.title": "Como funcionam as críticas de arte em grupo",
  "artCritGuide.meta.description":
    "Um método prático para críticas de grupo: feedback honesto, gentil e específico, os quatro passos de uma sessão e exemplos de comentários úteis e inúteis.",
  "artCritGuide.hero.eyebrow": "Críticas de arte",
  "artCritGuide.hero.title": "Como funciona uma <em>boa crítica.</em>",
  "artCritGuide.hero.lead":
    "Honesto, gentil, específico, por esta ordem. Aqui está um método que podes usar quer leves trabalho a uma crítica, quer a organizes.",
  "artCritGuide.hero.anchor.principle": "O princípio",
  "artCritGuide.hero.anchor.flow": "Como decorre uma sessão",
  "artCritGuide.hero.anchor.examples": "O que dizer",

  "artCritGuide.principle.title": "O <em>princípio</em>",
  "artCritGuide.principle.body":
    "Honesto, gentil, específico, por esta ordem. Elogio vago não ajuda ninguém, e crueldade disfarçada de honestidade continua a ser crueldade. Critica o trabalho que tens à frente: o que faz, o que pergunta, o que deixa em aberto.",

  "artCritGuide.flow.title": "Como decorre <em>uma sessão</em>",
  "artCritGuide.flow.lead":
    "Da chegada ao último comentário, em quatro momentos.",
  "artCritGuide.flow.step1.title": "Chegar e instalar-te",
  "artCritGuide.flow.step1.body":
    "Começa com uma bebida e uns minutos para assentar, para que ninguém critique antes de tirar o casaco. Cada pessoa traz um trabalho, acabado ou não.",
  "artCritGuide.flow.step2.title": "Quem fez enquadra o trabalho",
  "artCritGuide.flow.step2.body":
    "Quem fez tem dois minutos para dizer o que é o trabalho e, se quiser, onde está a ter dificuldades. Também pode não dizer nada e deixar o trabalho falar. Ambas as opções servem.",
  "artCritGuide.flow.step3.title": "O grupo responde",
  "artCritGuide.flow.step3.body":
    "Vão dando a volta ao grupo. Primeiro observações específicas, depois perguntas, depois sugestões se quem fez as convidar. Falem do que está na parede, nos termos do próprio trabalho.",
  "artCritGuide.flow.step4.title": "Quem fez fica com o que serve",
  "artCritGuide.flow.step4.body":
    "Quem fez não tem de concordar. Fica com o que é útil, deixa o resto, e passa-se ao trabalho seguinte.",

  "artCritGuide.examples.title": "O que <em>dizer</em>",
  "artCritGuide.examples.lead":
    "A especificidade vale mais do que a simpatia. Na prática, a diferença é esta.",
  "artCritGuide.examples.tryThis": "Experimenta isto",
  "artCritGuide.examples.avoid": "Evita",
  "artCritGuide.example1.good":
    '"O coral funciona como ponto focal, mas o olhar está sempre a fugir para o canto inferior esquerdo. É intencional?"',
  "artCritGuide.example1.avoid":
    '"Adoro!" (gentil, mas nada específico: não dá à pessoa nada com que trabalhar.)',
  "artCritGuide.example2.good":
    '"O bordo por acabar parece vivo; terminá-lo pode matar a tensão que aqui tens."',
  "artCritGuide.example2.avoid":
    '"Eu teria usado uma paleta diferente." (isto é sobre o trabalho que terias feito. Responde ao que está à tua frente.)',
  "artCritGuide.example3.good":
    '"O que estavas a tentar fazer com o espaço negativo? Pode estar a fazer mais do que pensas."',
  "artCritGuide.example3.avoid":
    '"Isto não está mesmo a funcionar." (um veredito sem porta de saída.)',

  "artCritGuide.outro.title": "Traz <em>um trabalho.</em>",
  "artCritGuide.outro.sub":
    "Acabado ou não: uma crítica serve precisamente para trabalhos a meio. Procura um evento perto de ti no calendário de eventos.",
  "artCritGuide.outro.cta": "Explorar eventos",

  // ── ComingOutAtWorkPage (+ comingOutAtWork.data.ts) ─────────────────────
  "comingOutAtWork.meta.title":
    "Sair do armário no trabalho: o momento, as palavras e os teus direitos",
  "comingOutAtWork.meta.description":
    "Um guia prático para sair do armário no trabalho em Portugal: como ler o ambiente, exemplos do que dizer a colegas e o que fazer se correr mal.",
  // VOICES stay English: invented demo-only quotes (they never render in live).
  "comingOutAtWork.hero.eyebrow": "Saída do Armário · No Trabalho",
  "comingOutAtWork.hero.title": "Sair do armário <em>no trabalho.</em>",
  "comingOutAtWork.hero.lead":
    "Não há uma única forma certa nem um prazo. Este é um guia prático para leres o teu local de trabalho, teres a conversa nos teus termos, e conheceres os teus direitos se correr mal.",
  "comingOutAtWork.hero.anchor.timing": "Há um momento certo?",
  "comingOutAtWork.hero.anchor.signals": "Ler o teu local de trabalho",
  "comingOutAtWork.hero.anchor.scripts": "A conversa",
  "comingOutAtWork.hero.anchor.bad": "Se correr mal",

  "comingOutAtWork.timing.title": "Há um <em>momento certo?</em>",
  "comingOutAtWork.timing.lead": "Resposta curta: só o teu.",
  "comingOutAtWork.timing1.title": "Não há um momento certo universal",
  "comingOutAtWork.timing1.body":
    "Quem te disser que há um momento correto está a vender-te alguma coisa. O momento certo é o que for certo para a tua segurança, as tuas finanças, e a tua paz de espírito, por esta ordem.",
  "comingOutAtWork.timing2.title": "Segurança primeiro",
  "comingOutAtWork.timing2.body":
    "Se sair do armário puder pôr em risco o teu emprego, visto, ou habitação, esse cálculo pode vir primeiro. Proteger-te não é o mesmo que esconder-te.",
  "comingOutAtWork.timing3.title": "Podes fazê-lo em graus",
  "comingOutAtWork.timing3.body":
    "Assumires-te só a uma pessoa de confiança no trabalho é uma escolha completa e válida. Não tens de anunciar nada ao escritório inteiro, em momento nenhum.",

  "comingOutAtWork.signals.title": "Ler o teu <em>local de trabalho</em>",
  "comingOutAtWork.signals.lead":
    "Nenhum destes é decisivo por si só, mas juntos dizem-te muito.",
  "comingOutAtWork.signals.goodBadge": "Sinal verde",
  "comingOutAtWork.signals.cautionBadge": "Cuidado",
  "comingOutAtWork.signal1.text":
    "Colegas LGBTQ+ visíveis, fora do armário e que parecem bem",
  "comingOutAtWork.signal2.text":
    "Uma política escrita de não discriminação que inclua explicitamente a orientação sexual e a identidade de género",
  "comingOutAtWork.signal3.text":
    "Linguagem inclusiva na conversa do dia a dia: perguntas abertas sobre com quem estás",
  "comingOutAtWork.signal4.text":
    "Piadas que ficam por contestar, inclusive por parte de chefias",
  "comingOutAtWork.signal5.text":
    "Uma cultura em que a vida pessoal é policiada ou motivo de fofoca",
  "comingOutAtWork.signal6.text":
    "Sem RH, ou um RH que responde diretamente à pessoa a quem estarias a revelar-te",

  "comingOutAtWork.scripts.title": "Ter a <em>conversa</em>",
  "comingOutAtWork.scripts.lead":
    "Palavras que podes pedir emprestadas. Ajusta-as até soarem como tu.",
  "comingOutAtWork.script1.context": "Com discrição, a uma só pessoa",
  "comingOutAtWork.script1.line":
    '"A minha namorada, a Ana, e eu fomos a Sintra no fim de semana." Dito de passagem, resolve tudo sem precisar de uma conversa marcada.',
  "comingOutAtWork.script2.context": "Se quiseres fazê-lo de forma intencional",
  "comingOutAtWork.script2.line":
    '"Queria mencionar, já que trabalhamos de perto: sou gay. Não é grande coisa para mim no dia a dia, só não queria continuar a medir as palavras contigo."',
  "comingOutAtWork.script3.context": "A definir um limite ao mesmo tempo",
  "comingOutAtWork.script3.line":
    '"Tenho todo o gosto em responder a perguntas, mas prefiro que isto não passe a ser tema. Agradeço que continue tudo normal."',

  "comingOutAtWork.bad.title": "Se correr <em>mal</em>",
  "comingOutAtWork.bad1.title": "Documenta tudo",
  "comingOutAtWork.bad1.body":
    "Datas, palavras, testemunhas. A discriminação com base na orientação sexual ou identidade de género é ilegal em Portugal, e um registo é o que transforma uma experiência num caso.",
  "comingOutAtWork.bad2.title": "Tens direitos",
  "comingOutAtWork.bad2.body":
    "A lei não permite que te despeçam nem que te assediem por seres queer. A ACT trata queixas de discriminação no trabalho, e podes apresentar queixa de forma anónima. A nossa página de apoio jurídico tem os modelos.",
  "comingOutAtWork.bad3.title": "Tens quem te acompanhe nisto",
  "comingOutAtWork.bad3.body":
    "Não tens de passar por isto sem companhia. Traz o assunto ao fórum, onde podes falar dele com pessoas que também já enfrentaram uma chefia difícil.",

  "comingOutAtWork.outro.title": "O teu ritmo é <em>teu.</em>",
  "comingOutAtWork.outro.sub":
    "Conhece os teus direitos antes de precisares deles, e apoia-te em quem já passou por isto.",
  "comingOutAtWork.outro.rightsCta": "Conhecer os teus direitos no trabalho",
  "comingOutAtWork.outro.talkCta": "Falar sobre isto",

  // ── DisabilityHealthcarePage (+ disabilityHealthcare.data.ts) ───────────
  "disabilityHealthcare.meta.title":
    "Deficiência e doença crónica: saúde em Portugal",
  "disabilityHealthcare.meta.description":
    "Um guia prático para te orientares no sistema de saúde português com deficiência ou doença crónica: adaptações, referenciações, médicos de família atentos à acessibilidade e seguros.",
  // STEPS are administrative/navigational guidance — translated. TIPS stay
  // English: invented demo-only quotes (they never render in live).
  "disabilityHealthcare.hero.eyebrow": "Disabled Queers",
  "disabilityHealthcare.hero.title": "O sistema, <em>decifrado.</em>",
  "disabilityHealthcare.hero.lead":
    "Como lidar com o sistema de saúde português quando tens uma deficiência ou doença crónica: adaptações, referenciações, médicos de família atentos à acessibilidade e o labirinto dos seguros, sem que a consulta passe a ser sobre a tua identidade.",
  "disabilityHealthcare.hero.anchor.steps": "Passo a passo",
  "disabilityHealthcare.hero.anchor.tips": "Dicas entre pares",

  "disabilityHealthcare.steps.title": "Passo a <em>passo</em>",
  "disabilityHealthcare.steps.lead":
    "Nunca perguntes a alguém aqui qual é o seu diagnóstico, e espera o mesmo cuidado por parte do sistema.",
  "disabilityHealthcare.step1.title": "Regista as tuas adaptações",
  "disabilityHealthcare.step1.body":
    "Pede ao teu Centro de Saúde para registar no teu processo as tuas necessidades de acesso, de mobilidade, sensoriais ou de comunicação. Uma vez no sistema, deixas de ter de as explicar outra vez em cada consulta, e as consultas podem ser marcadas a contar com elas.",
  "disabilityHealthcare.step2.title": "Pede referenciações sem rodeios",
  "disabilityHealthcare.step2.body":
    "Tens direito a uma referenciação para especialista sem que isso se torne uma consulta sobre a tua identidade. Um pequeno resumo escrito do teu historial, entregue no início, mantém a consulta focada no motivo que te levou lá.",
  "disabilityHealthcare.step3.title":
    "Escolhe médicos de família atentos à acessibilidade",
  "disabilityHealthcare.step3.body":
    "Algumas clínicas em Lisboa são visivelmente melhores: sem degraus, sem pressa, dispostas a pôr as coisas por escrito. Pede recomendações atualizadas no fórum.",
  "disabilityHealthcare.step4.title": "Trata da papelada dos seguros",
  "disabilityHealthcare.step4.body":
    "A papelada de reembolsos e do atestado de incapacidade é um labirinto à parte. Guarda cópias de tudo, pede decisões por escrito, e pergunta no fórum quando um formulário te bloquear.",

  "disabilityHealthcare.tips.title": "Dicas <em>entre pares</em>",

  "disabilityHealthcare.outro.title": "Tu defines os <em>termos.</em>",
  "disabilityHealthcare.outro.sub":
    "Conhece os teus direitos e lembra-te de que não tens de enfrentar isto sem apoio. A página jurídica e o fórum estão ambos aqui.",
  "disabilityHealthcare.outro.rightsCta": "Conhecer os teus direitos",
  "disabilityHealthcare.outro.askCta": "Perguntar no fórum",

  // ── FirstMeetupGuidePage (+ firstMeetupGuide.data.ts) ───────────────────
  "firstMeetupGuide.meta.title":
    "O teu primeiro evento da comunidade: o que esperar",
  "firstMeetupGuide.meta.description":
    "O que costuma acontecer num primeiro evento presencial, como aliviar o nervosismo e respostas sinceras às perguntas que quem chega pela primeira vez não se atreve a fazer.",
  "firstMeetupGuide.hero.eyebrow": "Queer Social",
  "firstMeetupGuide.hero.title": "O teu primeiro evento, <em>sem pressão.</em>",
  "firstMeetupGuide.hero.lead":
    "O que esperar de um primeiro evento, e respostas ao que te custa perguntar por causa dos nervos. Vir sem companhia e vir com ansiedade são coisas completamente normais.",
  "firstMeetupGuide.hero.anchor.expect": "O que esperar",
  "firstMeetupGuide.hero.anchor.values": "Regras de convivência",
  "firstMeetupGuide.hero.anchor.faq": "Perguntas que dão nervos",

  "firstMeetupGuide.expect.title": "O que <em>esperar</em>",
  "firstMeetupGuide.expect.lead":
    "Cada evento tem o seu formato, por isso aqui fica o que ajuda na maioria deles.",
  "firstMeetupGuide.expect1.title": "Vê primeiro o formato",
  "firstMeetupGuide.expect1.body":
    "Lê a página do evento antes de ires: a hora, o local, quem organiza e se há um plano para a noite. Conhecer o formato tira a maior parte das surpresas.",
  "firstMeetupGuide.expect2.title": "Ocupa as mãos",
  "firstMeetupGuide.expect2.body":
    "Uma bebida, um livro ou uma pequena tarefa, como ajudar a montar, pode facilitar os primeiros dez minutos. Ter algo nas mãos torna mais fácil começar uma conversa.",
  "firstMeetupGuide.expect3.title": "Vem sem companhia ou traz alguém",
  "firstMeetupGuide.expect3.body":
    "Muitas pessoas vêm sozinhas da primeira vez. Se te ajudar trazer uma pessoa amiga, traz. As duas opções são completamente normais.",

  "firstMeetupGuide.values.title": "Boas <em>regras de convivência</em>",
  "firstMeetupGuide.values.lead":
    "Quatro regras que ajudam qualquer evento a ser tranquilo para toda a gente.",
  "firstMeetupGuide.value1":
    "Ninguém precisa de estar fora do armário, ou fora de uma forma específica, para estar lá.",
  "firstMeetupGuide.value2":
    "Pede sempre autorização antes de tirar fotos a qualquer pessoa.",
  "firstMeetupGuide.value3":
    "Presta atenção a quem vem pela primeira vez; toda a gente já passou por isso.",
  "firstMeetupGuide.value4":
    "O que se partilha ao vivo fica entre quem lá esteve.",

  "firstMeetupGuide.faq.title": "As perguntas <em>que dão nervos</em>",
  "firstMeetupGuide.faq1.q": "E se eu não conhecer ninguém?",
  "firstMeetupGuide.faq1.a":
    "Da primeira vez, ninguém conhece. Diz que é a tua primeira vez: é a frase mais fácil de dizer e costuma começar uma conversa.",
  "firstMeetupGuide.faq2.q": "E se os nervos forem muitos?",
  "firstMeetupGuide.faq2.a":
    "Muitas pessoas ficam assim, e muitas quase dão meia-volta à porta. Chegar um pouco mais cedo, quando há menos gente, pode ajudar. Rapidamente fica mais fácil.",
  "firstMeetupGuide.faq3.q": "Como vou encontrar o grupo?",
  "firstMeetupGuide.faq3.a":
    "Vê a página do evento e as mensagens de quem organiza, que pode indicar onde vai estar (por exemplo, numa entrada específica) e a que horas. Se não encontrares o grupo, envia uma mensagem a quem organiza.",
  "firstMeetupGuide.faq4.q": "Tenho de ficar o tempo todo?",
  "firstMeetupGuide.faq4.a":
    "Não. Sai quando quiseres, sem precisares de explicar. Ficar vinte minutos também conta como teres vindo.",

  "firstMeetupGuide.outro.title": "Basta <em>aparecer.</em>",
  "firstMeetupGuide.outro.sub":
    "É esse o único requisito de entrada. Explora o calendário de eventos e encontra algo perto de ti.",
  "firstMeetupGuide.outro.cta": "Explorar eventos",

  // ── GroupShowArchivePage (+ groupShowArchive.data.ts) ───────────────────
  "groupShowArchive.meta.title":
    "Arquivo de exposições de grupo: um registo de mostras de arte",
  "groupShowArchive.meta.description":
    "Um lugar para guardar o registo de exposições de arte em grupo: o título, quando e onde esteve patente, e quem fez o trabalho.",
  // SHOWS (title/when/venue/blurb) are demo-only mock data and render in demo
  // mode alone. Live mode shows the empty state below until real shows exist.
  "groupShowArchive.hero.eyebrow": "Arte · Arquivo",
  "groupShowArchive.hero.title": "Exposições que <em>merecem ficar.</em>",
  "groupShowArchive.hero.lead":
    "Um lugar para guardar o registo de exposições de arte em grupo: o título, quando e onde esteve patente, e quem fez o trabalho.",
  "groupShowArchive.hero.anchor.shows": "As exposições",

  "groupShowArchive.shows.title": "As <em>exposições</em>",
  "groupShowArchive.shows.lead": "Mais recentes primeiro.",
  "groupShowArchive.live.title": "Ainda não há exposições arquivadas",
  "groupShowArchive.live.body":
    "As exposições de grupo vão ser listadas aqui assim que forem registadas, com datas, locais e créditos.",

  "groupShowArchive.outro.title": "Dá crédito a <em>todo o trabalho.</em>",
  "groupShowArchive.outro.sub":
    "O registo de uma exposição nomeia todas as pessoas que fizeram algo para ela.",
  "groupShowArchive.outro.cta": "Explorar eventos",

  // ── IngredientsMapPage (+ ingredientsMap.data.ts) ───────────────────────
  "ingredientsMap.meta.title": "Onde encontrar ingredientes de casa em Lisboa",
  // The spots, their finds/origin/hours and the neighbourhood anchors are
  // demo-only mock data and render in demo mode alone. Live mode shows the
  // empty state below until real shops exist.
  "ingredientsMap.meta.description":
    "Um guia, bairro a bairro, para encontrar ingredientes de casa nas mercearias, mercados e bancas de Lisboa.",
  "ingredientsMap.hero.eyebrow": "Queer POC",
  "ingredientsMap.hero.title": "Ingredientes de <em>casa.</em>",
  "ingredientsMap.hero.lead":
    "Um mapa de onde encontrar os sabores de casa em Lisboa, organizado por bairro. Casa é em parte um sabor, e encontrá-lo numa cidade nova é uma forma própria de pertença.",

  "ingredientsMap.intro":
    "Este mapa existe porque casa é em parte um sabor, e encontrá-lo numa cidade nova é uma forma própria de pertença. Conheces uma loja, mercado ou banca que deva estar aqui? Vais poder sugeri-la assim que as sugestões abrirem.",
  "ingredientsMap.live.title": "Ainda não há lojas no mapa",
  "ingredientsMap.live.body":
    "As mercearias, os mercados e as bancas vão ser listados aqui, bairro a bairro, assim que forem acrescentados.",

  "ingredientsMap.hood.mourariaIntendente": "Mouraria e Intendente",
  "ingredientsMap.hood.anjosArroios": "Anjos e Arroios",
  "ingredientsMap.hood.marvilaBeato": "Marvila e Beato",

  "ingredientsMap.spot.mercearia.finds":
    "Produtos essenciais cabo-verdianos: milho para cachupa, coentros frescos, óleo de palma.",
  "ingredientsMap.spot.mercearia.origin": "Cabo Verde",
  "ingredientsMap.spot.mercearia.hours": "Seg a Sáb, melhor de manhã",
  "ingredientsMap.spot.lojaBengali.finds":
    "Especiarias do sul da Ásia a peso, dals, óleo de mostarda, paneer fresco aos fins de semana.",
  "ingredientsMap.spot.lojaBengali.origin": "Bangladeche · Índia",
  "ingredientsMap.spot.lojaBengali.hours": "Diariamente até tarde",
  "ingredientsMap.spot.tropical.finds":
    "Banana-pão, inhame, malagueta scotch bonnet, peixe seco, para várias cozinhas da África Ocidental.",
  "ingredientsMap.spot.tropical.origin": "Nigéria · Gana",
  "ingredientsMap.spot.tropical.hours": "Seg a Sáb",
  "ingredientsMap.spot.padaria.finds":
    "Padaria cabo-verdiana, aberta aos sábados de manhã, esgota depressa.",
  "ingredientsMap.spot.padaria.origin": "Cabo Verde",
  "ingredientsMap.spot.padaria.hours": "Sáb de manhã",
  "ingredientsMap.spot.mercado.finds":
    "Produtos brasileiros: mandioca, açaí, guaraná, fruta tropical fresca.",
  "ingredientsMap.spot.mercado.origin": "Brasil",
  "ingredientsMap.spot.mercado.hours": "Ter a Dom",
  "ingredientsMap.spot.asiaMarket.finds":
    "Do leste e sudeste asiático: farinhas de arroz, ervas frescas, tofu, kimchi.",
  "ingredientsMap.spot.asiaMarket.origin": "Vietname · Coreia · China",
  "ingredientsMap.spot.asiaMarket.hours": "Diariamente",

  "ingredientsMap.missing.prompt": "Conheces um sítio que deva estar no mapa?",
  "ingredientsMap.missing.cta": "Adicionar o teu sítio",
  "ingredientsMap.missing.toast":
    "Já está na fila. A moderação vai pô-lo no mapa. Agradecemos!",

  "ingredientsMap.outro.title":
    "A alegria é tão <em>política</em> quanto a solidariedade.",
  "ingredientsMap.outro.sub":
    "Encontrar o sabor de casa faz parte de assentar numa cidade nova. Traz o teu para a conversa.",
  "ingredientsMap.outro.cta": "Juntar-te à conversa",

  // ── LgbtqAgingGuidePage (+ lgbtqAgingGuide.data.ts) ─────────────────────
  "lgbtqAgingGuide.meta.title":
    "Envelhecer LGBTQ+ em Portugal: saúde a partir dos 50",
  "lgbtqAgingGuide.meta.description":
    "Como te orientares no sistema de saúde português como pessoa LGBTQ+ com mais de 50 anos: encontrar médicos e hospitais afirmativos, opções de cuidados e apoio em saúde mental.",
  "lgbtqAgingGuide.hero.eyebrow": "Queer Elders",
  "lgbtqAgingGuide.hero.title": "Envelhecer <em>à tua maneira.</em>",
  "lgbtqAgingGuide.hero.lead":
    "Como te orientares no sistema de saúde português como pessoa LGBTQ+ com mais de 50 anos: médicos de família, hospitais, cuidados e saúde mental, tendo em conta, à partida, a história que trazes contigo.",
  "lgbtqAgingGuide.hero.anchor.topics": "O essencial",
  "lgbtqAgingGuide.hero.anchor.links": "Ligações úteis",

  "lgbtqAgingGuide.topics.title": "O <em>essencial</em>",
  "lgbtqAgingGuide.topics.lead":
    "Orientações simples e práticas para te orientares nos cuidados de saúde a partir dos 50 anos.",
  "lgbtqAgingGuide.topic1.title":
    "Encontrar um médico de família que não torne tudo constrangedor",
  "lgbtqAgingGuide.topic1.body":
    "Podes pedir a um Centro de Saúde que registe os teus pronomes e a tua parceria, e mudar de médico de família se te tratarem com desdém. Traz um resumo escrito do teu historial para não teres de explicar a tua vida do zero em cada consulta.",
  "lgbtqAgingGuide.topic2.title":
    "Hospitais e referenciações para especialistas",
  "lgbtqAgingGuide.topic2.body":
    "Nos hospitais, a ideia de quem conta como família ainda complica a vida a casais do mesmo sexo. Um documento simples e assinado que indique a tua parceria como contacto e com poder de decisão evita a maioria dos problemas à partida.",
  "lgbtqAgingGuide.topic3.title": "Cuidados na velhice e habitação",
  "lgbtqAgingGuide.topic3.body":
    "Pergunta diretamente a qualquer instituição de cuidados sobre a experiência que têm com residentes LGBTQ+ e casais do mesmo sexo. As boas respondem sem rodeios; a própria resposta diz-te quase tudo o que precisas de saber.",
  "lgbtqAgingGuide.topic4.title": "Saúde mental em idade avançada",
  "lgbtqAgingGuide.topic4.body":
    "O isolamento e toda uma vida de cautela cobram o seu preço. Existe terapia afirmativa em qualquer idade: antes de marcares, pergunta diretamente a quem te vai acompanhar que experiência tem com pessoas LGBTQ+ mais velhas.",

  "lgbtqAgingGuide.links.title": "Ligações <em>úteis</em>",
  "lgbtqAgingGuide.link.ilga.label": "ILGA Portugal: serviços",
  "lgbtqAgingGuide.link.ilga.note":
    "Apoio, ajuda jurídica, e programas comunitários, incluindo para pessoas LGBTQ+ mais velhas.",
  "lgbtqAgingGuide.link.sns24.label": "Linha de saúde SNS 24",
  "lgbtqAgingGuide.link.sns24.note":
    "808 24 24 24 · linha nacional de saúde 24h para triagem e aconselhamento.",

  "lgbtqAgingGuide.outro.title": "A vida mais tarde, <em>bem acompanhada.</em>",
  "lgbtqAgingGuide.outro.sub":
    "Se precisas de falar com alguém, o diretório de saúde mental é afirmativo em qualquer idade.",
  "lgbtqAgingGuide.outro.cta": "Encontrar apoio afirmativo",

  // ── OralHistoryProjectPage (+ oralHistoryProject.data.ts) ───────────────
  // VOICES stay English: invented demo-only quotes (they never render in live).
  "oralHistoryProject.meta.title":
    "Projeto de histórias orais LGBTQ+ em Lisboa: participa",
  "oralHistoryProject.meta.description":
    "A QueerPulse está a preparar um projeto de história oral com pessoas LGBTQ+ mais velhas em Lisboa: só voz, se preferires, sem mostrar a cara, inteiramente nos teus termos. As inscrições ainda não estão abertas.",

  "oralHistoryProject.hero.eyebrow": "Queer Elders · História Oral",
  "oralHistoryProject.hero.title":
    "A tua história <em>merece ficar guardada.</em>",
  "oralHistoryProject.hero.lead":
    "Estamos a preparar um projeto de história oral com pessoas LGBTQ+ mais velhas em Lisboa: só voz, se preferires, sem mostrar a cara, inteiramente nos teus termos. As inscrições ainda não estão abertas. Fica a saber como imaginamos a participação.",
  "oralHistoryProject.hero.anchor.about": "Sobre o projeto",
  "oralHistoryProject.hero.anchor.how": "Como participar",
  "oralHistoryProject.hero.anchor.voices": "Nas palavras delas",

  "oralHistoryProject.about.title": "Sobre o <em>projeto</em>",
  "oralHistoryProject.about.body":
    "Queremos registar a vida de pessoas LGBTQ+ mais velhas em Lisboa antes que essas histórias se percam, sobretudo as do dia a dia. A tua história não precisa de ser dramática para merecer ser guardada.",

  "oralHistoryProject.how.title": "Como <em>participar</em>",
  "oralHistoryProject.how.lead":
    "Quatro passos previstos, e manténs o controlo em todos eles.",
  "oralHistoryProject.step1.title": "Diz que tens interesse",
  "oralHistoryProject.step1.body":
    "Quando as inscrições abrirem, dizes à nossa equipa que tens interesse. Nesta fase não há compromisso, só uma conversa para perceber se faz sentido para ti.",
  "oralHistoryProject.step2.title": "Escolhe como apareces",
  "oralHistoryProject.step2.body":
    "Podes participar só com a voz, sem problema nenhum. Mostrar a cara nunca é obrigatório. Tu decides o que é gravado, o que fica em off e a que partes fica associado o teu nome.",
  "oralHistoryProject.step3.title": "Grava ao teu ritmo",
  "oralHistoryProject.step3.body":
    "As entrevistas acontecem ao teu ritmo, em quantas sessões quiseres. Podes fazer pausas, voltar atrás ou parar de vez a qualquer momento, e nada é usado sem o teu sim final.",
  "oralHistoryProject.step4.title": "Decide como é usado",
  "oralHistoryProject.step4.body":
    "Só para arquivo ou partilhada com a comunidade: escolhes tu, e podes mudar de ideias mais tarde. Manténs o direito de retirar a tua gravação.",
  "oralHistoryProject.participateCta": "Gostava de participar",
  "oralHistoryProject.participateToast":
    "Agradecemos. A nossa equipa vai contactar-te, com cuidado, para falarem sobre isto. Sem compromisso.",

  "oralHistoryProject.voices.title": "Na <em>primeira pessoa</em>",
  "oralHistoryProject.voices.live.body":
    "Ainda não há gravações. As pessoas participantes decidem se e como as suas palavras são partilhadas, e nada aparece aqui antes de estarem prontas.",

  "oralHistoryProject.outro.title": "História, <em>contada com verdade.</em>",
  "oralHistoryProject.outro.sub":
    "As inscrições ainda não estão abertas. Se tens uma pergunta ou queres ajudar, escreve à nossa equipa.",
  "oralHistoryProject.outro.cta": "Contactar a nossa equipa",

  // ── QtipocArchivePage (+ qtipocArchive.data.ts) ─────────────────────────
  // PIECES (title/kind/year/blurb) are demo-only mock data and render in demo
  // mode alone. Live mode shows the empty state below until real pieces exist.
  "qtipocArchive.meta.title":
    "Arquivo QTIPOC: um registo da vida em Lisboa, mantido pela comunidade",
  "qtipocArchive.meta.description":
    "A ideia de um arquivo da vida QTIPOC em Lisboa, mantido pela comunidade: ensaios fotográficos, escrita, gravações e documentos, cedidos por quem os criou e com o devido crédito.",

  "qtipocArchive.hero.eyebrow": "Queer POC · Arquivo",
  "qtipocArchive.hero.title": "Guardado por nós, <em>para nós.</em>",
  "qtipocArchive.hero.lead":
    "Os princípios de um arquivo da vida QTIPOC em Lisboa, mantido pela comunidade: ensaios fotográficos, escrita, gravações, documentos, tudo cedido, creditado e guardado com cuidado. Creditar todo o trabalho, sobretudo o emocional.",
  "qtipocArchive.hero.anchor.about": "Sobre o arquivo",
  "qtipocArchive.hero.anchor.collection": "A coleção",

  "qtipocArchive.about.title": "Sobre o <em>arquivo</em>",
  "qtipocArchive.about.body":
    "A ideia é um arquivo da vida QTIPOC em Lisboa, mantido pela comunidade: ensaios fotográficos, textos, gravações e documentos. Tudo o que lá está é cedido, creditado e guardado com cuidado, nos termos de quem o fez.",

  "qtipocArchive.collection.title": "A <em>coleção</em>",
  "qtipocArchive.collection.lead": "Mais recentes primeiro.",
  "qtipocArchive.live.title": "Ainda não há itens arquivados",
  "qtipocArchive.live.body":
    "As contribuições vão aparecer aqui, cada uma creditada a quem a fez.",
  "qtipocArchive.contribute.prompt":
    "Tens algo para acrescentar, uma foto, uma peça, uma gravação?",
  "qtipocArchive.contribute.cta": "Contribuir para o arquivo",
  "qtipocArchive.contribute.toast":
    "Agradecemos. Uma pessoa moderadora vai contactar-te para o acrescentar, com crédito total e nos teus termos.",

  "qtipocArchive.outro.title": "Nada será <em>extraído.</em>",
  "qtipocArchive.outro.sub":
    "Tudo é dado, nos termos de quem contribui. Traz o teu quando as contribuições abrirem.",
  "qtipocArchive.outro.cta": "Falar com o grupo",

  // ── QtipocOrganisationsPage (+ qtipocOrganisations.data.ts) ─────────────
  // Varrido por completo (DES-150). O nome próprio e o `href` de cada
  // organização ficam literais no ficheiro de dados; a missão, a linha de
  // oferta e as etiquetas são traduzidas. As chaves de etiqueta são partilhadas.
  "qtipocOrganisations.org.casaT.mission":
    "Habitação e apoio a pessoas trans e de género diverso, com atenção particular a pessoas migrantes e racializadas.",
  "qtipocOrganisations.org.casaT.offers":
    "Alojamento de emergência, apoio entre pares, encaminhamento.",
  "qtipocOrganisations.org.djass.mission":
    "Associação que defende os direitos e a visibilidade das pessoas afrodescendentes em Portugal.",
  "qtipocOrganisations.org.djass.offers":
    "Defesa de direitos, programação cultural, eventos comunitários.",
  "qtipocOrganisations.org.redeExAequo.mission":
    "Associação nacional de jovens LGBTQ+, com grupos de trabalho interseccionais por todo o país.",
  "qtipocOrganisations.org.redeExAequo.offers":
    "Grupos de jovens, apoio nas escolas, redes de pares.",
  "qtipocOrganisations.org.ilga.mission":
    "A organização LGBTQ+ mais antiga do país, com serviços de apoio jurídico e social.",
  "qtipocOrganisations.org.ilga.offers":
    "Linha de apoio jurídico, grupos de apoio, ajuda com documentação.",

  "qtipocOrganisations.tag.housing": "Habitação",
  "qtipocOrganisations.tag.trans": "Trans",
  "qtipocOrganisations.tag.migrant": "Migrante",
  "qtipocOrganisations.tag.afrodescendant": "Afrodescendente",
  "qtipocOrganisations.tag.advocacy": "Ativismo",
  "qtipocOrganisations.tag.youth": "Juventude",
  "qtipocOrganisations.tag.national": "Nacional",
  "qtipocOrganisations.tag.legal": "Jurídico",
  "qtipocOrganisations.tag.support": "Apoio",

  "qtipocOrganisations.meta.title":
    "Organizações QTIPOC em Portugal e como contactá-las",
  "qtipocOrganisations.meta.description":
    "Um diretório de organizações em Portugal que trabalham onde raça e identidade queer se cruzam: habitação, apoio jurídico, grupos de jovens e defesa de direitos, com o que oferecem e como as contactar.",

  "qtipocOrganisations.hero.eyebrow": "Queer POC",
  "qtipocOrganisations.hero.title":
    "Organizações que <em>acolhem tudo isto.</em>",
  "qtipocOrganisations.hero.lead":
    "Grupos de todo o país que trabalham onde raça e identidade queer se cruzam, dando o mesmo peso às duas. O que fazem, o que oferecem e como os contactar.",
  "qtipocOrganisations.hero.anchor.orgs": "As organizações",
  "qtipocOrganisations.hero.anchor.verify": "Antes de te envolveres",

  "qtipocOrganisations.orgs.title": "As <em>organizações</em>",

  "qtipocOrganisations.verify.title": "Antes de te <em>envolveres</em>",
  "qtipocOrganisations.verify.body":
    "Antes de te envolveres com qualquer organização, vê se os canais dela têm atividade recente e pergunta ao grupo se alguém já lidou diretamente com ela. A experiência vivida da comunidade é a melhor verificação que existe, por isso, se a tens, partilha-a.",

  "qtipocOrganisations.outro.title":
    "Conheces alguma que nos <em>escapou?</em>",
  "qtipocOrganisations.outro.sub":
    "Este diretório cresce de boca em boca. Traz as que te ajudaram.",
  "qtipocOrganisations.outro.cta": "Adicionar uma organização",

  // ── QueerPaediatriciansPage (+ queerPaediatricians.data.ts) ─────────────
  // PROVIDERS are a peer-reviewed directory record, akin to therapist bios —
  // kept English. HOW_IT_WORKS is chrome, translated.
  "queerPaediatricians.meta.title":
    "Pediatras queer-friendly em Lisboa: lista verificada por famílias",
  "queerPaediatricians.meta.description":
    "Uma lista de pediatras em Lisboa, verificada entre pares, em quem as famílias LGBTQ+ confiam a sério: profissionais à vontade com formulários para duas mães ou dois pais e com casais do mesmo sexo, com data e avaliações honestas.",

  "queerPaediatricians.hero.eyebrow": "Queer Parents",
  "queerPaediatricians.hero.title": "Pediatras que <em>nem pestanejam.</em>",
  "queerPaediatricians.hero.lead":
    "Pediatras em Lisboa em quem as famílias da rede confiam a sério: profissionais que não hesitam perante duas mães na ficha de inscrição e que falam com as duas por igual. Lista verificada entre pares, com data e sem rodeios.",
  "queerPaediatricians.hero.anchor.list": "A lista",
  "queerPaediatricians.hero.anchor.how": "Como funciona",

  "queerPaediatricians.list.title": "A <em>lista</em>",
  "queerPaediatricians.list.lead":
    "Cada entrada foi acrescentada por uma família que lá vai às consultas. As datas mostram a última verificação entre pares.",
  "queerPaediatricians.suggest.prompt":
    "Conheces pediatras que deviam estar nesta lista?",
  "queerPaediatricians.suggest.cta": "Sugerir pediatra",
  "queerPaediatricians.suggest.toast":
    "Agradecemos. Uma pessoa moderadora da rede de pais vai dar seguimento para acrescentar e verificar a sugestão.",

  "queerPaediatricians.how.title": "Como funciona a <em>lista</em>",
  "queerPaediatricians.how1":
    "Mantida e verificada entre pares: só as famílias da rede acrescentam nomes, e só de pediatras que consultam de facto. Voltamos a verificar as entradas com regularidade e pomos-lhes data para saberes até que ponto estão atuais.",
  "queerPaediatricians.how2":
    "Um nome aqui significa que uma família da comunidade confia nessa pessoa. A lista não avalia o percurso clínico de ninguém. Usa sempre o teu próprio critério e diz-nos se a tua experiência for diferente, para a lista se manter honesta.",

  "queerPaediatricians.outro.title": "Pergunta à <em>rede.</em>",
  "queerPaediatricians.outro.sub":
    "Procuras algo específico, dentista ou terapia para adolescentes? O fórum de pais é a forma mais rápida de chegar a um nome de confiança.",
  "queerPaediatricians.outro.cta": "Perguntar no fórum",

  // ── RunningGuidePage (+ runningGuide.data.ts) ───────────────────────────
  "runningGuide.meta.title":
    "Entrar numa corrida em grupo: ritmos e o que trazer",
  "runningGuide.meta.description":
    "Orientações práticas para quem quer juntar-se a uma corrida em grupo ou organizar uma: como costumam funcionar os grupos de ritmo, o que trazer para a primeira corrida e porque é que ninguém deve correr sem companhia.",

  "runningGuide.hero.eyebrow": "Corridas em grupo",
  "runningGuide.hero.title":
    "A tua primeira corrida, <em>com honestidade.</em>",
  "runningGuide.hero.lead":
    "Como costumam funcionar os grupos de ritmo, o que trazer, e a coisa mais importante de todas: ninguém corre sem companhia e ninguém fica para trás.",
  "runningGuide.hero.anchor.pace": "Grupos de ritmo",
  "runningGuide.hero.anchor.bring": "O que trazer",

  "runningGuide.pace.title": "Que ritmo é <em>o teu</em>",
  "runningGuide.pace.lead":
    "Muitas corridas em grupo dividem-se em grupos de ritmo no início. Escolhe o ritmo em que ainda consegues conversar e, na próxima vez, sobe de grupo se te pareceu fácil. Numa corrida em grupo há lugar para todos os ritmos.",
  "runningGuide.pace1.name": "Lento e Social",
  "runningGuide.pace1.pace": "7:00 a 8:00 min/km · corrida-caminhada bem-vinda",
  "runningGuide.pace1.who":
    "Quem vem pela primeira vez, quem está a voltar de uma pausa, e quem quer conversar o percurso todo. Quem corre mais devagar dita o ritmo e ninguém fica para trás.",
  "runningGuide.pace2.name": "Meio-Termo",
  "runningGuide.pace2.pace": "5:30 a 6:30 min/km · constante",
  "runningGuide.pace2.who":
    "Consegues correr 5 km sem parar e queres companhia a um ritmo confortável e sustentável.",
  "runningGuide.pace3.name": "Rápido e Focado",
  "runningGuide.pace3.pace": "4:30 a 5:15 min/km · treino",
  "runningGuide.pace3.who":
    "Para quem está a preparar uma prova ou a tentar bater um recorde pessoal. Um bom grupo volta a juntar-se em cada viragem para que ninguém fique sem companhia no percurso.",

  "runningGuide.bring.title": "O que <em>trazer</em>",
  "runningGuide.bring.lead":
    "Versão curta: menos do que pensas. Aqui está a lista completa.",
  "runningGuide.bring1.title": "Ténis com que já tenhas corrido",
  "runningGuide.bring1.note":
    "O que já tens serve para a primeira vez, sem precisares de comprar nada especial. Se a calçada começar a magoar-te os tornozelos, vale a pena experimentar um par com mais amortecimento.",
  "runningGuide.bring2.title": "Camadas que possas tirar",
  "runningGuide.bring2.note":
    "As manhãs podem começar frescas e aquecer depressa. Algo que possas atar à cintura é melhor do que uma única peça grossa.",
  "runningGuide.bring3.title": "Água",
  "runningGuide.bring3.note":
    "Uma garrafa pequena chega para um percurso de cerca de 5 km. Leva mais em percursos longos ou em dias de calor.",
  "runningGuide.bring4.title": "Nada a provar",
  "runningGuide.bring4.note":
    "Não precisas de experiência de corrida, de um certo tipo de corpo nem de um objetivo. Aparecer é o único requisito. Se a versão de hoje é caminhar, faz o percurso a andar.",

  "runningGuide.outro.title": "Vemo-nos na <em>linha de partida.</em>",
  "runningGuide.outro.sub":
    "À procura de companhia na estrada? Explora o calendário de eventos e encontra corridas perto de ti.",
  "runningGuide.outro.cta": "Explorar eventos",

  // ── SchoolFormsGuidePage (+ schoolFormsGuide.data.ts) ───────────────────
  // Official form terms ("encarregado de educação", "mãe / pai") kept
  // byte-identical to the EN source — they are the real Portuguese terms.
  // VOICES stay English: invented demo-only quotes (they never render in live).
  "schoolFormsGuide.meta.title":
    "Formulários de matrícula escolar para famílias queer em Lisboa",
  "schoolFormsGuide.meta.description":
    "Como lidar com os formulários de matrícula numa família queer ou com duas mães ou dois pais em Lisboa: o que esperar em cada campo, como pedir que constem os vossos dois nomes e quais são os teus direitos.",

  "schoolFormsGuide.hero.eyebrow": "Queer Parents",
  "schoolFormsGuide.hero.title":
    "Duas mães, dois pais, <em>um só formulário.</em>",
  "schoolFormsGuide.hero.lead":
    "Os formulários de matrícula, passo a passo: o que esperar em cada campo, como pedir que os vossos dois nomes apareçam em todo o lado e quais são os teus direitos quando um formulário ainda não acompanhou a tua família.",
  "schoolFormsGuide.hero.anchor.forms": "Sobre os formulários",
  "schoolFormsGuide.hero.anchor.rights": "Os teus direitos",
  "schoolFormsGuide.hero.anchor.voices": "O que outras pessoas fizeram",

  "schoolFormsGuide.forms.title": "Sobre os <em>formulários</em>",
  "schoolFormsGuide.forms.lead":
    "Três passos que resolvem a maior parte disto.",
  "schoolFormsGuide.form1.title": "Lê primeiro os campos dos pais",
  "schoolFormsGuide.form1.body":
    'Muitas escolas em Lisboa já usam dois campos de "encarregado de educação" sem indicação de género, por isso podes pôr logo os vossos dois nomes. Onde um formulário ainda diz "mãe / pai", tens o direito de riscar e escrever o que é verdade.',
  "schoolFormsGuide.form2.title": "Pergunta antes de pensares o pior",
  "schoolFormsGuide.form2.body":
    "A maioria do pessoal administrativo diz que sim sem hesitar quando lhe pedes que use os vossos dois nomes em todo o lado. Pergunta cedo, pergunta por escrito, e o mais provável é descobrires que o formulário é a única coisa antiquada na escola.",
  "schoolFormsGuide.form3.title":
    "Pede a confirmação dos dois nomes por escrito",
  "schoolFormsGuide.form3.body":
    "Um email curto a confirmar que as duas pessoas ficam registadas e são contactadas por igual poupa-te a explicar tudo outra vez sempre que vais buscar a criança, em cada autorização para visitas de estudo e em cada reunião de pais, durante anos.",

  "schoolFormsGuide.rights.title": "Os teus <em>direitos</em>",
  "schoolFormsGuide.rights.lead":
    "Resumo em linguagem simples. Para o panorama jurídico completo, a página de apoio jurídico aprofunda mais.",
  "schoolFormsGuide.badge.protected": "Direito protegido",
  "schoolFormsGuide.badge.know": "Fica a saber",
  "schoolFormsGuide.badge.practical": "Prático",
  "schoolFormsGuide.right1.title": "Igualdade de reconhecimento",
  "schoolFormsGuide.right1.body":
    'Em Portugal, casais do mesmo sexo têm plena igualdade legal na parentalidade. Uma escola não pode, por lei, reconhecer apenas uma das pessoas, e ambas podem ser o "encarregado de educação" oficial.',
  "schoolFormsGuide.right2.title": "O nome da criança",
  "schoolFormsGuide.right2.body":
    "As crianças de casais do mesmo sexo podem ter os apelidos das duas mães ou dos dois pais. As escolas têm de usar o nome que consta nos documentos da criança, incluindo um nome escolhido onde os registos já tenham sido atualizados.",
  "schoolFormsGuide.right3.title": "Se uma escola resistir",
  "schoolFormsGuide.right3.body":
    "É raro, mas se acontecer, regista o que se passou e leva a questão por escrito à direção da escola. A ILGA Portugal e a rede de pais podem ajudar-te a levar o assunto mais longe, com calma.",

  "schoolFormsGuide.voices.title": "O que outras pessoas <em>fizeram</em>",

  "schoolFormsGuide.outro.title":
    "Não tens de <em>explicar a tua família.</em>",
  "schoolFormsGuide.outro.sub":
    "Conhece os teus direitos, e depois apoia-te na rede. A página de apoio jurídico tem os modelos.",
  "schoolFormsGuide.outro.legalCta": "Ler o guia jurídico",
  "schoolFormsGuide.outro.forumCta": "Perguntar ao fórum de pais",

  // ── SharedEquipmentPage (+ sharedEquipment.data.ts) ─────────────────────
  "sharedEquipment.meta.title":
    "Partilhar equipamento de atelier: reservas e cuidados",
  "sharedEquipment.meta.description":
    "Orientações práticas para quem partilha equipamento de atelier, como um risógrafo, um forno de cerâmica, um projetor ou um kit de encadernação: como reservar, limpar, registar e repartir os custos.",

  "sharedEquipment.hero.eyebrow": "Atelier partilhado",
  "sharedEquipment.hero.title":
    "Material partilhado, <em>cuidado partilhado.</em>",
  "sharedEquipment.hero.lead":
    "Orientações práticas para partilhar um risógrafo, um forno de cerâmica, um projetor ou um kit de encadernação com outras pessoas. Um hábito simples cobre quase tudo: reserva, limpa, regista.",
  "sharedEquipment.hero.anchor.kit": "O material",
  "sharedEquipment.hero.anchor.care": "Cuidar do material partilhado",

  "sharedEquipment.kit.title": "O <em>material</em>",
  "sharedEquipment.kit.lead":
    'Está tudo no atelier. Toca em "Pedir horário" e uma pessoa moderadora confirma a marcação.',
  "sharedEquipment.item1.name": "Risógrafo a duas cores",
  "sharedEquipment.item1.specs":
    "RZ recondicionado, A3, neste momento carregado com coral + preto. Fica no atelier para uso coletivo.",
  "sharedEquipment.item1.status": "Livre esta semana",
  "sharedEquipment.item2.name": "Forno elétrico de cerâmica",
  "sharedEquipment.item2.specs":
    "Modelo de carregamento superior, tamanho médio, cone 6. As cozeduras são agendadas: junta a tua à folha partilhada com uma semana de antecedência.",
  "sharedEquipment.item2.status": "Próxima cozedura no domingo",
  "sharedEquipment.item3.name": "Projetor + suporte",
  "sharedEquipment.item3.specs":
    "1080p, alcance longo, bom para decalque e trabalho de projeção. Portátil, com bolsa protetora.",
  "sharedEquipment.item3.status": "Emprestado até sexta",
  "sharedEquipment.item4.name": "Kit de encadernação",
  "sharedEquipment.item4.specs":
    "Sovelas, dobradores de osso, linha encerada, guilhotina de cartão. Para zines e edições pequenas.",
  "sharedEquipment.item4.status": "Livre esta semana",
  "sharedEquipment.requestSlotCta": "Pedir horário",
  "sharedEquipment.onLoanCta": "Emprestado",
  "sharedEquipment.requestToast":
    "Pedido enviado para {name}. Uma pessoa moderadora vai confirmar o teu horário.",

  "sharedEquipment.care.title": "Cuidar do <em>material partilhado</em>",
  "sharedEquipment.care1":
    "Reserva, limpa, regista: três hábitos que mantêm o material ao dispor de toda a gente.",
  "sharedEquipment.care2":
    "Deixa-o melhor do que o encontraste. Se algo se partir, avisa logo o grupo para que fique arranjado antes de alguém voltar a precisar dele.",
  "sharedEquipment.care3":
    "Combinem os consumíveis (tinta, linha, cartão, vidrado) logo de início: quem os compra e como contribuem as pessoas que usam muito.",
  "sharedEquipment.care4":
    "Escrevam quem pode usar cada máquina e quem pode mostrar a uma pessoa principiante como funciona.",

  "sharedEquipment.outro.title": "Faz <em>alguma coisa.</em>",
  "sharedEquipment.outro.sub":
    "O material partilhado existe para que o trabalho aconteça. Explora o calendário de eventos e encontra oficinas e ateliers abertos perto de ti.",
  "sharedEquipment.outro.cta": "Explorar eventos",

  // ── SpoonTheoryPage (+ spoonTheory.data.ts) ─────────────────────────────
  // FLAGGED for native review — see en/resources.ts comment above this block.
  "spoonTheory.meta.title":
    "Teoria das colheres: como a usamos nesta comunidade queer",
  "spoonTheory.meta.description":
    "O que é a teoria das colheres e como a usar na QueerPulse se tens doença crónica ou deficiência: detalhes de acessibilidade nos eventos, eventos online, e um campo para indicares as tuas necessidades de acesso ao confirmares presença.",

  "spoonTheory.hero.eyebrow": "Pessoas Queer com Deficiência",
  "spoonTheory.hero.title": "O que queremos dizer com <em>colheres.</em>",
  "spoonTheory.hero.lead":
    'Uma forma partilhada de falar sobre energia limitada: o que é a teoria das colheres, como esta comunidade funciona com ela e como a usar quando confirmas presença. Não precisas de escrever um ensaio: aqui, "hoje estou com poucas colheres" já é uma frase completa.',
  "spoonTheory.hero.anchor.what": "O que é",
  "spoonTheory.hero.anchor.uses": "Como a usamos",
  "spoonTheory.hero.anchor.rsvp": "Ao confirmar presença",

  "spoonTheory.what.title": "O que <em>é</em>",
  "spoonTheory.what.spoonsCaption":
    "Restam quatro colheres de seis: uma tarde normal.",
  "spoonTheory.what.p1":
    "A teoria das colheres é uma forma simples de falar sobre energia limitada. Começas o dia com um número certo de colheres, e cada tarefa (tomar banho, deslocar-te, uma conversa difícil) custa uma ou mais. Quando acabam, acabam, e o dia seguinte nem sempre as repõe.",
  "spoonTheory.what.p2":
    "É uma forma de pessoas com doença crónica, deficiência e dor crónica tornarem visível um limite invisível, para si próprias e umas para as outras, sem terem de escrever um ensaio sobre isso.",

  "spoonTheory.uses.title": "Como a <em>usamos</em>",
  "spoonTheory.use1.title": "Detalhes de acessibilidade e eventos online",
  "spoonTheory.use1.body":
    "Quem organiza pode indicar detalhes de acessibilidade num evento: entrada sem degraus, interior acessível a cadeira de rodas, casa de banho acessível, casa de banho neutra, horas de silêncio, e se animais de assistência são bem-vindos. Alguns eventos são online, o que pode ajudar num dia de poucas colheres.",
  "spoonTheory.use2.title": "Podes mudar de ideias",
  "spoonTheory.use2.body":
    "Podes alterar a tua confirmação de presença quando a tua energia mudar. As colheres que poupas ao ficar em casa são tuas, e cabe-te a ti protegê-las.",
  "spoonTheory.use3.title":
    '"Hoje estou com poucas colheres" já é uma frase completa',
  "spoonTheory.use3.body":
    "Não deves justificações a ninguém. Podes dizê-lo ao confirmares presença, quando chegas, ou quando precisas de sair mais cedo.",

  "spoonTheory.rsvp.title": "Ao <em>confirmar presença</em>",
  "spoonTheory.rsvpTip1":
    "Diz a quem organiza quantas colheres tens, se isso ajudar a planear: lugares sentados, cantos calmos, uma saída fácil perto da porta.",
  "spoonTheory.rsvpTip2":
    "O formulário de confirmação de presença tem um campo para as tuas necessidades de acesso. Preenche-o para quem organiza o ver.",
  "spoonTheory.rsvpTip3":
    "Consulta os detalhes de acessibilidade na página do evento antes de ires, e pergunta a quem organiza se faltar algo de que precisas.",

  "spoonTheory.outro.title": "Vem como <em>estiveres.</em>",
  "spoonTheory.outro.sub":
    "Ninguém está a contar as tuas colheres. Os eventos indicam os seus detalhes de acessibilidade para planeares de acordo com a tua energia.",
  "spoonTheory.outro.cta": "Encontrar eventos",

  // ── IntersectionalityPage (+ IntersectionalityCards.tsx +
  //    IntersectionalityFooter.tsx + intersectionality.data.ts) ───────────
  "intersectionality.meta.title":
    "Raça, fé e classe na comunidade queer de Lisboa",
  "intersectionality.meta.description":
    "Como raça, fé, classe e deficiência se cruzam com a identidade queer em Lisboa: contexto e recursos para quem vive mais do que uma identidade ao mesmo tempo.",
  "intersectionality.hero.backLabel": "Biblioteca de Recursos",
  "intersectionality.hero.cat": "Interseccionalidade",
  "intersectionality.hero.title":
    "Mais do que uma coisa <em>ao mesmo tempo.</em>",
  "intersectionality.hero.sub":
    "Ser queer e uma pessoa racializada, queer e religiosa, queer e de classe trabalhadora, queer e com deficiência: estas identidades não se somam de forma arrumada. Esta página existe para quem vive várias camadas ao mesmo tempo, e para uma comunidade empenhada em acolhê-las todas.",
  "intersectionality.opening.strong": "Esta página é para todas as pessoas.",
  "intersectionality.opening.text":
    "É um recurso para quem vive estas experiências, e um compromisso visível da QueerPulse de que ser queer abrange muitos tipos de pessoa.",

  "intersectionality.nav.race": "Raça e etnia",
  "intersectionality.nav.faith": "Fé e religião",
  "intersectionality.nav.class": "Classe e economia",
  "intersectionality.nav.community": "Dentro da própria comunidade",
  "intersectionality.nav.orgs": "Organizações e recursos",

  "intersectionality.race.heading": "Raça e <em>etnia</em>",
  "intersectionality.race.intro":
    "Ser uma pessoa queer racializada em Lisboa significa navegar duas coisas ao mesmo tempo que os espaços dominantes raramente pensam em conjunto. A história colonial de Portugal molda esta cidade de formas visíveis para quem as vive, e invisíveis para quem não as vive.",
  "intersectionality.race.info1.eyebrow": "Navegar espaços queer",
  "intersectionality.race.info1.title": "Quando ser queer não chega",
  "intersectionality.race.info1.body":
    "Os espaços queer em Lisboa, como na maioria das cidades, podem reproduzir as dinâmicas raciais do mundo em geral. A fetichização, a exclusão e as microagressões não desaparecem só porque um espaço é queer. As diretrizes da comunidade abordam isto explicitamente, e o fórum é um lugar para discutir situações concretas.",
  "intersectionality.race.info1.link": "Diretrizes da comunidade",
  "intersectionality.race.info2.eyebrow": "A história colonial de Portugal",
  "intersectionality.race.info2.title": "O que é bom saber ao chegar aqui",
  "intersectionality.race.info2.body":
    "Portugal tem uma relação específica e muitas vezes por processar com a sua história colonial. As comunidades afro-portuguesa, brasileira, cabo-verdiana e angolana são significativas e complexas. Chegar como pessoa racializada vinda de fora desta história significa aprender um novo conjunto de dinâmicas. Isto leva tempo e a comunidade pode ajudar.",
  "intersectionality.race.info3.eyebrow": "Grupos da comunidade",
  "intersectionality.race.info3.title": "Encontrar comunidade QTIPOC",
  "intersectionality.race.info3.body":
    "Procura na página de Comunidades espaços para pessoas QTIPOC (queer, trans e intersexo racializadas), ou começa a conversa no fórum.",
  "intersectionality.race.info3.link": "Explorar comunidades",

  "intersectionality.faith.heading": "Fé e <em>religião</em>",
  "intersectionality.faith.intro":
    "Ser queer e ter fé é perfeitamente possível, por muito que haja quem tente fazer-te sentir o contrário. Portugal é predominantemente católico, e a relação entre a Igreja e as pessoas LGBTQ+ é complicada, está em evolução e é profundamente pessoal.",
  "intersectionality.faith.info1.eyebrow": "O contexto católico",
  "intersectionality.faith.info1.title": "Uma igreja em mudança",
  "intersectionality.faith.info1.body":
    "A Igreja Católica portuguesa é institucionalmente conservadora mas cada vez mais diversa na prática. Algumas paróquias são ativamente acolhedoras; outras não. Alguns padres em Lisboa são conhecidos por serem afirmativos, e podes perguntar por eles no fórum.",
  "intersectionality.faith.info2.eyebrow": "Outras tradições",
  "intersectionality.faith.info2.title":
    "Islão, judaísmo, igrejas evangélicas e outras",
  "intersectionality.faith.info2.body":
    "Lisboa tem comunidades muçulmana e judaica em crescimento, e uma variedade de igrejas protestantes e evangélicas. A relação entre cada comunidade e as pessoas LGBTQ+ que dela fazem parte varia imenso. O fórum está aberto a questões de fé em qualquer um destes contextos.",
  "intersectionality.faith.info2.link": "Ir para o fórum",
  "intersectionality.faith.info3.eyebrow": "Sem religião",
  "intersectionality.faith.info3.title": "O secularismo também é válido",
  "intersectionality.faith.info3.body":
    "Portugal é cada vez mais secular, sobretudo entre as gerações mais novas. Se a tua relação com a religião é complicada, hostil ou inexistente, isso também é completamente válido aqui. A comunidade não exige nem presume qualquer relação específica com a fé.",

  "intersectionality.class.heading": "Classe e <em>economia</em>",
  "intersectionality.class.intro":
    "A comunidade queer tem muitas vezes um carácter de classe não dito: certos bares, eventos, estéticas e códigos sociais assinalam pertença de formas que excluem quem não pode ou não participa. Dar-lhe nome é o primeiro passo para mudar isto.",
  "intersectionality.class.note.strong": "A posição da QueerPulse:",
  "intersectionality.class.note.text":
    "Tentamos tornar a participação na comunidade acessível independentemente do rendimento. A QueerPulse não cobra nada a quem faz parte, e o fórum é gratuito. Quem organiza um evento pode indicar quanto custa: gratuito, paga o que puderes ou um preço fixo. Se o custo for uma barreira para qualquer coisa aqui, fala diretamente com a nossa equipa.",
  "intersectionality.class.info1.eyebrow":
    "A subida do custo de vida em Lisboa",
  "intersectionality.class.info1.title": "O que a gentrificação significa aqui",
  "intersectionality.class.info1.body":
    "Lisboa tornou-se muito mais cara na última década, em parte por causa da migração internacional, incluindo a comunidade queer expatriada. Vale a pena assumir isto com honestidade: a comunidade queer faz parte de um padrão que afastou residentes locais da classe trabalhadora. Esta tensão é real e a comunidade tenta encará-la de frente.",
  "intersectionality.class.info2.eyebrow": "Vida social queer",
  "intersectionality.class.info2.title": "O custo de pertencer",
  "intersectionality.class.info2.body":
    "A cultura de bares e discotecas como forma social queer por defeito exclui quem não bebe, não pode pagar entradas, ou tem dificuldade com ambientes noturnos. A QueerPulse organiza deliberadamente eventos sociais gratuitos ou de baixo custo, durante o dia ou início da noite, e com álcool opcional.",
  "intersectionality.class.info2.link": "Comunidade sóbria",
  "intersectionality.class.info3.eyebrow": "Apoio económico",
  "intersectionality.class.info3.title": "Recursos da comunidade",
  "intersectionality.class.info3.body":
    "A página da Economia tem recursos sobre apoio financeiro de emergência, ajuda com prestações sociais e entreajuda comunitária. A Troca de Competências é uma ferramenta comunitária não monetária. Ambas estão disponíveis para todas as pessoas da comunidade.",
  "intersectionality.class.info3.link": "Recursos da Economia",

  "intersectionality.community.heading":
    "Navegar <em>a própria comunidade</em>",
  "intersectionality.community.intro":
    "Os espaços queer não são automaticamente seguros para todas as pessoas queer. O racismo, o classismo, a transfobia, o capacitismo e outras dinâmicas existem dentro das comunidades LGBTQ+. Nomeá-las é o que permite mudá-las.",
  "intersectionality.community.info1.eyebrow": "Denúncia e responsabilização",
  "intersectionality.community.info1.title":
    "Se algo acontecer num espaço da comunidade",
  "intersectionality.community.info1.body":
    "A QueerPulse tem uma função de denúncia para comportamentos que violem as diretrizes da comunidade, incluindo racismo, discriminação e assédio. As denúncias são tratadas pela equipa de moderação. Se não tiveres a certeza se algo é denunciável, podes falar diretamente com a equipa através da página de Contacto.",
  "intersectionality.community.info1.link": "Denunciar algo",
  "intersectionality.community.info2.eyebrow": "Grupos da comunidade",
  "intersectionality.community.info2.title":
    "Encontrar a tua comunidade específica",
  "intersectionality.community.info2.body":
    "Para além da comunidade principal, explora a página de Comunidades para encontrares um espaço que te faça sentido, seja à volta de raça, deficiência, parentalidade, sobriedade ou outra coisa.",
  "intersectionality.community.info2.link": "Explorar comunidades",
  "intersectionality.community.info3.eyebrow": "O fórum",
  "intersectionality.community.info3.title":
    "Onde acontecem as conversas mais difíceis",
  "intersectionality.community.info3.body":
    "O fórum está aberto a conversas interseccionais: levantar experiências específicas, partilhar recursos, desafiar-se e apoiar-se mutuamente. É moderado, e as conversas honestas são bem-vindas.",
  "intersectionality.community.info3.link": "Ir para o fórum",

  "intersectionality.commit.heading":
    "Aquilo com que a QueerPulse <em>se compromete.</em>",
  "intersectionality.commit.sub":
    "Estas são coisas concretas e verificáveis. Somos responsáveis por elas, e se não as estivermos a cumprir, diz-nos.",
  "intersectionality.commit.governanceCta": "Como funciona a nossa governação",
  "intersectionality.commit.accountableCta": "Responsabiliza-nos",
  "intersectionality.commitment1.title": "Moderação ativa",
  "intersectionality.commitment1.text":
    "A moderação da plataforma atua ativamente contra o racismo, a transfobia, o classismo e o capacitismo, a par da homofobia. As denúncias são levadas a sério e têm seguimento.",
  "intersectionality.commitment2.title": "Comunidades abertas a tudo o que és",
  "intersectionality.commitment2.text":
    "Qualquer pessoa da comunidade pode explorar a página de Comunidades para encontrar um espaço que lhe faça sentido, e a moderação aplica os mesmos padrões em todos.",
  "intersectionality.commitment3.title": "Acessibilidade económica",
  "intersectionality.commitment3.text":
    "A própria QueerPulse não cobra nada a quem faz parte da comunidade. Quem organiza cada evento pode marcá-lo como gratuito, paga o que puderes ou preço fixo.",
  "intersectionality.commitment4.title": "Muitas vozes",
  "intersectionality.commitment4.text":
    "A QueerPulse não fala a uma só voz sobre questões políticas. A comunidade contém multidões. O fórum é um lugar para ter os debates, e é a comunidade que os trabalha.",

  "intersectionality.orgs.heading": "Organizações e <em>recursos</em>",
  "intersectionality.orgs.intro":
    "Organizações externas relevantes para as interseções específicas desta página.",
  "intersectionality.org1.focus": "QTIPOC",
  "intersectionality.org1.text":
    "Organização portuguesa que trabalha em direitos LGBTQ+ com um foco explícito na interseção entre raça, migração e ser queer em Portugal.",
  "intersectionality.org1.link": "Conversar no fórum",
  "intersectionality.org2.focus": "Fé",
  "intersectionality.org2.text":
    "Comunidade cristã afirmativa de pessoas queer, sediada em Lisboa. Aberta a todas as denominações e tradições, focada em reconciliar fé e identidade queer.",
  "intersectionality.org2.link": "Conversar no fórum",
  "intersectionality.org3.focus": "Raça e migração",
  "intersectionality.org3.text":
    "A principal organização de direitos LGBTQ+ de Portugal. Trabalha explicitamente na interseção entre direitos LGBTQ+ e migração/raça. Apoio jurídico e defesa de direitos.",
  "intersectionality.org3.link": "Recursos jurídicos",

  "intersectionality.outro.title": "Tudo o que és <em>pertence aqui.</em>",
  "intersectionality.outro.sub":
    "Cada parte de ti, incluindo as mais difíceis de acolher.",
  "intersectionality.outro.findCta": "Encontrar a tua comunidade",
  "intersectionality.outro.forumCta": "Fórum",

  // ── Section J: honestidade em modo live — sem prestadores "verificados"
  //    fabricados nem submissões falsas na API real (o demo mantém o mock) ──
  "therapistProfilePage.live.title":
    "Este diretório ainda está a ser construído.",
  "therapistProfilePage.live.body":
    "Estamos a verificar terapeutas com prática afirmativa para pessoas queer em Lisboa antes de qualquer perfil ficar visível aqui, para que possas confiar em cada perfil. Ainda não há nada para marcar.",
  "therapistProfilePage.live.cta": "Voltar à saúde mental",

  "queerPaediatricians.live.title":
    "A lista verificada de pediatras está para breve.",
  "queerPaediatricians.live.body":
    "Ainda estamos a confirmar que consultórios pediátricos são genuinamente afirmativos para pessoas queer e trans antes de os listarmos. Só vamos mostrar nomes verificados, por isso esperamos até podermos confiar em cada perfil.",
  "queerPaediatricians.live.cta": "Perguntar à comunidade",

  "legal.lawyers.live.title": "O diretório jurídico está para breve.",
  "legal.lawyers.live.body":
    "Estamos a validar profissionais de direito com prática afirmativa para pessoas LGBTQ+ antes de entrarem na lista, para não te encaminharmos para alguém por quem não possamos responder. Entretanto, podes denunciar discriminação e ajudamos-te a encontrar apoio.",

  "sexualHealth.testing.live.title": "O diretório de clínicas está para breve.",
  "sexualHealth.testing.live.body":
    "Estamos a verificar que serviços de rastreio são genuinamente acolhedores para pessoas queer e trans antes de os listarmos aqui, para que cada clínica seja de confiança.",
  "sexualHealth.guides.ask.liveBody":
    "As perguntas anónimas ainda não estão abertas. Estamos a preparar uma forma segura de quem faz voluntariado de saúde na comunidade lhes responder. Volta em breve.",
  "sexualHealth.guides.card.vaccination.title":
    "Vacinação contra o HPV e a hepatite B",
  "sexualHealth.guides.card.vaccination.body":
    "Ambas são gratuitas pelo SNS para certos grupos e fortemente recomendadas. A vacina contra o HPV está agora disponível até aos 45 anos em algumas clínicas. Pergunta ao teu médico de família ou ao CheckpointLx.",
  "sexualHealth.guides.card.mpox.title": "Mpox: o que precisas de saber",
  "sexualHealth.guides.card.mpox.body":
    "A mpox pode afetar qualquer pessoa, mas algumas redes queer têm maior exposição. A vacinação está disponível pelo SNS para contactos próximos e pessoas com risco mais elevado. O CheckpointLx mantém um guia atualizado.",
  "sexualHealth.guides.card.bacterialStis.title":
    "IST bacterianas: sífilis, gonorreia, clamídia",
  "sexualHealth.guides.card.bacterialStis.body":
    "Todas têm cura com antibióticos e todas estão a aumentar na Europa. Muitas não dão sintomas. Se tens vida sexual ativa, fazer testes de 3 em 3 meses é a forma mais fiável de as detetar cedo.",
  "sexualHealth.guides.card.talkingToPartners.title":
    "Falar sobre testes com as pessoas parceiras",
  "sexualHealth.guides.card.talkingToPartners.body":
    "Perguntar a uma pessoa parceira sobre testes pode parecer estranho. Mantém a conversa simples e prática: quando fizeste o último teste, que testes fizeste e o que querem fazer a seguir.",
  "sexualHealth.guides.card.substanceUse.title":
    "Saúde sexual e consumo de substâncias",
  "sexualHealth.guides.card.substanceUse.body":
    "Redução de riscos prática para quem consome substâncias em contextos sexuais: chemsex, MDMA, álcool. Sem julgamentos, com informação prática para reduzir riscos.",
  "sexualHealth.guides.card.substanceUse.link": "Ler o guia",
  "sexualHealth.guides.card.transNonbinary.title":
    "Saúde sexual para pessoas trans e não binárias",
  "sexualHealth.guides.card.transNonbinary.body":
    "Os corpos variam, as práticas variam, e a maior parte da informação sobre saúde sexual é escrita para pessoas cisgénero. Um guia escrito pela comunidade para navegar o sistema e encontrar profissionais de saúde que compreendem.",
  "sexualHealth.guides.card.transNonbinary.link": "Trans Hub",

  // ── Painéis de falha de carregamento dos diretórios (DES-22 / DES-24) ───
  // Renderizados através do `LoadErrorState` partilhado. Ficam separados do
  // texto de "está para breve" acima de propósito: um pedido que falhou e um
  // diretório que ainda não foi preenchido são factos diferentes.
  "sexualHealth.testing.loadError.title":
    "Não conseguimos carregar o <em>diretório de clínicas.</em>",
  "sexualHealth.testing.loadError.body":
    "A lista de serviços de rastreio não chegou. A falha é nossa e as clínicas continuam lá. Tenta novamente dentro de instantes e usa as linhas de crise no topo desta página se precisares de ajuda agora.",
  "sexualHealth.testing.info.frequency.title": "Com que frequência?",
  "sexualHealth.testing.info.frequency.body":
    "Se tens várias pessoas parceiras: de 3 em 3 meses. Se tens uma só pessoa parceira e ambas já fizeram o teste: com menos frequência. O teste rápido de VIH nas farmácias aderentes demora 15 minutos.",
  "sexualHealth.testing.info.confidential.title": "Confidencial",
  "sexualHealth.testing.info.confidential.body":
    "Todos os serviços públicos de saúde sexual do SNS são confidenciais. Nenhum resultado é partilhado sem o teu consentimento, incluindo com o teu médico de família.",
  "sexualHealth.testing.info.cost.title": "Custo",
  "sexualHealth.testing.info.cost.body":
    "Os CAD do SNS são gratuitos. Os testes rápidos de VIH nas farmácias custam 15 a 25 €. Os serviços das ONG (CheckpointLx, GAT) são gratuitos e anónimos.",
  "sexualHealth.testing.clinic.typeLabel.ngoFree": "ONG · Gratuito",
  "sexualHealth.testing.clinic.typeLabel.snsFree": "SNS · Gratuito",
  "sexualHealth.testing.clinic.typeLabel.pharmacyPaid": "Farmácia · 15 a 25 €",
  "sexualHealth.testing.clinic.typeLabel.privatePaid": "Privado · Pago",
  "sexualHealth.testing.clinic.checkpointLx.description":
    "O principal serviço de saúde sexual de Lisboa pensado para pessoas queer. Testes gratuitos e anónimos ao VIH, sífilis, hepatites B e C e gonorreia. Aconselhamento sobre PrEP. A equipa tem experiência com pessoas queer e trans. Nos dias de atendimento livre não precisas de marcação.",
  "sexualHealth.testing.clinic.checkpointLx.location":
    "Rua de São Lázaro, Intendente",
  "sexualHealth.testing.clinic.checkpointLx.hours":
    "Ter. e qui. 18:00 a 21:00, sáb. 14:00 a 18:00",
  "sexualHealth.testing.clinic.checkpointLx.details.tests":
    "VIH, sífilis, hepatites B e C, gonorreia. Resultados rápidos na mesma noite.",
  "sexualHealth.testing.clinic.checkpointLx.details.bring":
    "Não precisas de nada: nos dias de atendimento livre podes vir sem identificação, sem número de utente do SNS e sem marcação.",
  "sexualHealth.testing.clinic.checkpointLx.details.access":
    "Entrada no rés-do-chão, sem degraus. Equipa com experiência com pessoas trans. Atendimento em PT e EN.",
  "sexualHealth.testing.clinic.checkpointLx.details.note":
    "A primeira hora é a mais movimentada. Se chegares mais tarde, costumas esperar menos.",
  "sexualHealth.testing.clinic.gatLisboa.description":
    "Redução de riscos e saúde sexual de base comunitária. Testes rápidos ao VIH gratuitos, aconselhamento entre pares, apoio no acesso à PrEP e um serviço anónimo de encaminhamento para IST. Com um trabalho particularmente forte junto de pessoas migrantes e de pessoas que fazem trabalho sexual.",
  "sexualHealth.testing.clinic.gatLisboa.location":
    "Rua do Século, Bairro Alto",
  "sexualHealth.testing.clinic.gatLisboa.hours": "Seg. a sex. 10:00 a 18:00",
  "sexualHealth.testing.clinic.gatLisboa.details.tests":
    "Teste rápido ao VIH no local; encaminhamento para o painel completo de IST. Apoio no acesso à PrEP.",
  "sexualHealth.testing.clinic.gatLisboa.details.bring":
    "Para um teste rápido não precisas de nada. Para encaminhamentos, o número de utente do SNS ajuda, mas a equipa pode aconselhar-te sem ele.",
  "sexualHealth.testing.clinic.gatLisboa.details.access":
    "Aconselhamento entre pares em PT, EN e FR. Com especial experiência junto de pessoas migrantes e de pessoas que fazem trabalho sexual.",
  "sexualHealth.testing.clinic.gatLisboa.details.note":
    "Para testes rápidos basta apareceres; para o apoio à PrEP, o melhor é marcar primeiro por telefone.",
  "sexualHealth.testing.clinic.cad.description":
    "O serviço público do SNS de teste e aconselhamento para o VIH. Gratuito, confidencial e com aconselhamento presencial. Também faz vacinação contra a hepatite B e encaminhamento para PrEP. Precisas de inscrição no SNS, mas não precisas de seguro.",
  "sexualHealth.testing.clinic.cad.location": "Vários locais em Lisboa",
  "sexualHealth.testing.clinic.cad.hours": "Com marcação",
  "sexualHealth.testing.clinic.cad.details.tests":
    "Teste ao VIH com aconselhamento, vacinação contra a hepatite B e encaminhamento para PrEP.",
  "sexualHealth.testing.clinic.cad.details.bring":
    "O teu número de utente do SNS. Não precisas de seguro privado; quem tem cidadania da UE pode usar o Cartão Europeu de Seguro de Doença.",
  "sexualHealth.testing.clinic.cad.details.access":
    "Vários locais do SNS pela cidade. Quando marcares, escolhe o mais perto de ti.",
  "sexualHealth.testing.clinic.cad.details.note":
    "Confidencial: os resultados só são partilhados com o teu consentimento, e isto inclui o teu médico de família.",
  "sexualHealth.testing.clinic.pharmacyRapidTest.description":
    "À venda sem receita na maioria das farmácias. Resultado em 15 minutos. Deteta o VIH a partir de 3 meses após uma possível exposição. Pede um teste rápido de VIH. Não precisas de receita e não fica registo.",
  "sexualHealth.testing.clinic.pharmacyRapidTest.location": "Qualquer farmácia",
  "sexualHealth.testing.clinic.pharmacyRapidTest.hours":
    "Basta ires durante o horário de abertura",
  "sexualHealth.testing.clinic.pharmacyRapidTest.details.tests":
    "Teste rápido ao VIH com uma picada no dedo, resultado em cerca de 15 minutos.",
  "sexualHealth.testing.clinic.pharmacyRapidTest.details.bring":
    "15 a 25 € em dinheiro ou cartão. Não precisas de receita nem de identificação, e não fica registo.",
  "sexualHealth.testing.clinic.pharmacyRapidTest.details.access":
    "Disponível na maioria das farmácias. É mais provável encontrá-lo nas maiores.",
  "sexualHealth.testing.clinic.pharmacyRapidTest.details.note":
    "Deteta o VIH a partir de cerca de 3 meses após uma possível exposição; se foi há menos tempo, volta a fazer o teste mais tarde.",
  "sexualHealth.testing.clinic.clinicaDaTravessa.description":
    "Clínica privada com uma equipa que acolhe pessoas queer. Painel completo de IST (VIH, sífilis, gonorreia, clamídia, HSV, hepatites B e C, HPV). Resultados em 48 horas. Passa receitas de PrEP fora do circuito do SNS para quem preferir.",
  "sexualHealth.testing.clinic.clinicaDaTravessa.location": "Príncipe Real",
  "sexualHealth.testing.clinic.clinicaDaTravessa.hours":
    "Seg. a sáb., com marcação",
  "sexualHealth.testing.clinic.clinicaDaTravessa.details.tests":
    "Painel completo de IST: VIH, sífilis, gonorreia, clamídia, HSV, hepatites B e C, HPV. Resultados em 48 horas.",
  "sexualHealth.testing.clinic.clinicaDaTravessa.details.bring":
    "Uma marcação e um meio de pagamento. Receitas de PrEP disponíveis fora do circuito do SNS.",
  "sexualHealth.testing.clinic.clinicaDaTravessa.details.access":
    "Equipa que acolhe pessoas queer; espaço privado e discreto. Consultas em PT e EN.",
  "sexualHealth.testing.clinic.clinicaDaTravessa.details.note":
    "Serviço pago, útil quando queres um painel rápido e completo sem a espera do SNS.",

  "legal.lawyers.loadError.title":
    "Não conseguimos carregar o <em>diretório jurídico.</em>",
  "legal.lawyers.loadError.body":
    "A lista de contactos jurídicos validados não chegou. A falha é nossa. Tenta novamente dentro de instantes.",

  "therapists.loadError.title":
    "Não conseguimos carregar o <em>diretório de terapeutas.</em>",
  "therapists.loadError.body":
    "A lista de terapeutas não chegou. A falha é nossa e o diretório continua lá. Tenta novamente dentro de instantes e usa as linhas de crise no topo desta página se precisares de ajuda agora.",

  "glossary.loadError.title": "Não conseguimos carregar o <em>glossário.</em>",
  "glossary.loadError.body":
    "Os termos não chegaram. A falha é nossa. Tenta novamente dentro de instantes.",

  "guideIndex.loadError.title":
    "Não conseguimos carregar o <em>índice de guias.</em>",
  "guideIndex.loadError.body":
    "A lista de guias não chegou. A falha é nossa e todos os guias continuam publicados. Tenta novamente dentro de instantes.",

  "accessibleLisbon.live.title":
    "Os espaços acessíveis verificados estão para breve.",
  "accessibleLisbon.live.body":
    "Estamos a confirmar acesso sem degraus, casas de banho acessíveis e formação do pessoal com cada espaço antes de o listarmos, para que cada lugar aqui tenha sido verificado por pessoas da comunidade.",
  "accessibleLisbon.live.cta": "Encontrar eventos",

  "ingredientsMap.missing.liveToast":
    "As sugestões da comunidade ainda não estão abertas. Este mapa ainda está a ser construído.",
  "oralHistoryProject.participateLiveToast":
    "As inscrições ainda não estão abertas. O projeto de história oral ainda está a ser preparado.",
  "qtipocArchive.contribute.liveToast":
    "As contribuições ainda não estão abertas. O arquivo ainda está a ser construído.",

  // ── GuideRatingWidget (CNT-18) ───────────────────────────────────────────
  "rating.prompt": "Foi útil?",
  "rating.helpfulCta": "Sim",
  "rating.notHelpfulCta": "Não",
  "rating.thanks": "Agradecemos o teu feedback.",
  "rating.changeCta": "Alterar a tua resposta",

  // ── CNT-14: diretório real de recursos + via de sugestão ────────────────
  "directory.contactCta": "Contactar",

  "suggest.cta": "Sugerir um recurso",
  "suggest.modalTitle": "Sugerir um recurso",
  "suggest.intro":
    "Conheces uma clínica de apoio jurídico ou um serviço de rastreio que devia estar aqui? Diz-nos: a nossa equipa verifica todas as sugestões antes de as publicar.",
  "suggest.form.nameLabel": "Nome da organização",
  "suggest.form.namePlaceholder": "ex.: Clínica Jurídica Queer do Porto",
  "suggest.form.descriptionLabel": "O que oferecem?",
  "suggest.form.descriptionPlaceholder":
    "ex.: Consultas gratuitas para discriminação no trabalho, atendimento às quartas-feiras.",
  "suggest.form.phoneLabel": "Telefone (opcional)",
  "suggest.form.phonePlaceholder": "+351 ...",
  "suggest.form.emailLabel": "E-mail (opcional)",
  "suggest.form.emailPlaceholder": "contacto@exemplo.org",
  "suggest.form.websiteLabel": "Site (opcional)",
  "suggest.form.websitePlaceholder": "exemplo.org",
  "suggest.cancelCta": "Cancelar",
  "suggest.submitCta": "Enviar sugestão",
  "suggest.sendingLabel": "A enviar…",
  "suggest.errorToast":
    "Não foi possível enviar a tua sugestão. Tenta novamente dentro de instantes.",
  "suggest.success.title": "Agradecemos. <em>Tratamos do resto.</em>",
  "suggest.success.sub":
    "A nossa equipa verifica todas as sugestões antes de as publicar, para nunca enviar ninguém para um número errado ou uma clínica encerrada.",

  // ── Índice de guias + guias geridos na base de dados ────────────────────
  "guideIndex.meta.title": "Todos os guias da QueerPulse num só sítio",
  "guideIndex.meta.description":
    "O índice completo dos guias da QueerPulse: saúde, vida trans, questões legais, segurança, comunidade e cultura. Tudo o que escrevemos, agrupado e com ligação.",
  "guideIndex.hero.eyebrow": "Índice de guias",
  "guideIndex.hero.title": "Tudo o que já <em>escrevemos.</em>",
  "guideIndex.hero.lead":
    "Todos os guias da QueerPulse, agrupados por aquilo para que servem. Alguns eram difíceis de encontrar antes de esta página existir.",
  "guideIndex.empty":
    "Ainda nenhum guia passou pela revisão editorial. Um guia aparece nesta lista assim que alguém da edição o ler de ponta a ponta e confirmar que está correto.",
  "guideIndex.card.reviewedOn": "Revisto a {date}",
  "guideIndex.card.notReviewed": "Ainda sem revisão",
  "guideIndex.linkCta": "Ver todos os guias",

  "guide.managedEyebrow": "Guia",
  "guide.review.ariaLabel": "Estado da revisão editorial",
  "guide.review.reviewedOn": "Revisto a {date}",
  "guide.review.reviewedOnBy": "Revisto a {date} por {reviewer}",
  "guide.review.never": "Ainda ninguém reviu este guia.",
  "guide.review.due": "Próxima revisão a {date}",
  "guide.review.overdue": "Revisão em atraso desde {date}",
  "guide.missing.title": "Ainda <em>sem página.</em>",
  "guide.missing.sub":
    "Este guia está listado mas ainda não tem nada escrito. O índice reúne todos os que já têm conteúdo.",
  "guide.missing.indexCta": "Ver todos os guias",

  // O controlo de revisão editorial. Um guia só chega a quem lê depois de uma
  // editora o ler de ponta a ponta, por isso uma página que ainda não passou
  // pela revisão diz isso mesmo, por cima das linhas de apoio.
  "guide.underReview.meta.title": "Este guia está a ser verificado",
  "guide.underReview.meta.description":
    "Este guia está em revisão editorial. Volta ao ar assim que alguém o ler de ponta a ponta e confirmar que está correto.",
  "guide.underReview.title": "A edição está a <em>ler este guia.</em>",
  "guide.underReview.sub":
    "Só te mostramos um guia depois de alguém o ler de ponta a ponta e confirmar cada número de telefone, prazo e informação sobre clínicas que contém. Este ainda está à espera disso, por isso preferimos não te mostrar nada a mostrar-te algo que não verificámos. Volta assim que for aprovado.",
  "guide.underReview.indexCta": "Ver o que já foi verificado",
  "guide.underReview.libraryCta": "Ver a biblioteca",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-45 — PRD-45 - one new key, appended to the existing 'suggest a resource' success panel (SuggestResourceModal.tsx renders it right after the existing suggest.success.sub, inside the same paragraph). It is the only copy change: a suggestion now really does report back, on /account/submissions and in the bell. It must never promise a personal reply or an email, because QueerPulse sends no email.
  "suggest.success.tracked":
    "A tua página de submissões mostra em que ponto está, e a decisão chega às tuas notificações.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-45 — PRD-45 - one new key, appended to the existing 'suggest a resource' success panel (SuggestResourceModal.tsx renders it right after the existing suggest.success.sub, inside the same paragraph). It is the only copy change: a suggestion now really does report back, on /account/submissions and in the bell. It must never promise a personal reply or an email, because QueerPulse sends no email.
};
