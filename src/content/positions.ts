import type { PositionId } from '../store'

export interface Advantage { label: string; value: number }
export interface QuizQ { q: string; options: string[]; correct: number }
export interface ExampleHand {
  cards: [string, string] // e.g. ['A♠','J♠']
  question: string
  correct: 'fold' | 'call' | 'raise'
  explain: string
}
export interface Lesson {
  why: string
  objective: string[]
  advantages: Advantage[]
  disadvantages: string[]
  range: string[] // compact tokens, open-raise
  rangeNote: string
  example: ExampleHand
  quiz: QuizQ[]
}

export const STEPS = [
  'flow', 'why', 'mindset', 'objective', 'advantages',
  'disadvantages', 'range', 'example', 'mission',
] as const
export type StepId = (typeof STEPS)[number]

export const STEP_TITLES: Record<StepId, string> = {
  flow: 'A ordem das ações',
  why: 'Por que ela existe',
  mindset: 'Como pensar aqui',
  objective: 'Seu objetivo',
  advantages: 'Vantagens',
  disadvantages: 'Desvantagens',
  range: 'Seu range de abertura',
  example: 'Exemplo real',
  mission: 'Missão',
}

export const LESSONS: Record<PositionId, Lesson> = {
  UTG: {
    why: 'O UTG existe para equilibrar a mesa: alguém precisa agir primeiro depois dos blinds. Esse peso define toda a estratégia — quem abre daqui anuncia força, porque ainda enfrentará sete decisões desconhecidas.',
    objective: ['Sobreviver.', 'Entrar apenas com mãos fortes.', 'Evitar spots marginais.', 'Controlar a variância.'],
    advantages: [
      { label: 'Informação', value: 10 }, { label: 'Pressão', value: 65 },
      { label: 'Controle', value: 30 }, { label: 'Iniciativa', value: 55 }, { label: 'Posição', value: 5 },
    ],
    disadvantages: ['Pouquíssima informação.', 'Maior risco de enfrentar mãos premium.', 'Alta frequência de 3-bet contra você.', 'Quase sempre fora de posição pós-flop.'],
    range: ['77+', 'ATs+', 'KQs', 'AQo+'],
    rangeNote: 'Aproximadamente 10% das mãos. Estreito, forte, honesto.',
    example: {
      cards: ['A♠', 'J♠'],
      question: 'Você recebe A♠ J♠ no UTG. O que você faz?',
      correct: 'raise',
      explain: 'AJs está na borda do range de UTG, mas é suited, joga bem pós-flop e domina broadways piores. Abrir com raise é padrão; limp nunca é opção.',
    },
    quiz: [
      { q: 'Quantos jogadores ainda vão agir depois da sua abertura no UTG?', options: ['Três', 'Cinco', 'Sete'], correct: 2 },
      { q: 'Por que o range do UTG precisa ser forte?', options: ['Porque os blinds são caros', 'Porque muitos adversários ainda podem acordar com mãos premium', 'Porque o dealer age por último'], correct: 1 },
    ],
  },
  UTG1: {
    why: 'O UTG+1 herda quase todo o peso do UTG: apenas um jogador revelou intenção. A posição existe como degrau — a cada cadeira, um adversário a menos e um pouco mais de liberdade.',
    objective: ['Manter disciplina.', 'Abrir pouco mais que o UTG.', 'Respeitar aberturas à sua frente.', 'Não pagar para ver flops fora de posição.'],
    advantages: [
      { label: 'Informação', value: 18 }, { label: 'Pressão', value: 62 },
      { label: 'Controle', value: 34 }, { label: 'Iniciativa', value: 55 }, { label: 'Posição', value: 12 },
    ],
    disadvantages: ['Situação quase tão delicada quanto o UTG.', 'Seis jogadores ainda por agir.', 'Range visto como forte: difícil ser pago por mãos piores.'],
    range: ['66+', 'A9s+', 'KJs+', 'QJs', 'AJo+', 'KQo'],
    rangeNote: 'Cerca de 12% das mãos. Um degrau acima do UTG.',
    example: {
      cards: ['K♥', 'J♥'],
      question: 'K♥ J♥ no UTG+1, mesa foldou até você. O que faz?',
      correct: 'fold',
      explain: 'KJs parece bonita, mas é dominada pelos ranges que continuam atrás de você. No UTG+1 ela ainda é fold padrão — vira abertura a partir do MP/HJ.',
    },
    quiz: [
      { q: 'O range do UTG+1 deve ser…', options: ['Bem mais largo que o do UTG', 'Apenas um degrau acima do UTG', 'Igual ao do botão'], correct: 1 },
      { q: 'Se o UTG abrir com raise, sua melhor postura é…', options: ['Pagar com qualquer suited', 'Apertar ainda mais o range', 'Aumentar sempre para isolar'], correct: 1 },
    ],
  },
  MP: {
    why: 'A posição do meio marca a transição: metade da mesa já falou. Ela existe como ponto de equilíbrio entre a cautela do início e a agressão do final — seu range começa a respirar.',
    objective: ['Ampliar o range com critério.', 'Atacar mesas passivas.', 'Continuar respeitando as posições finais.', 'Preparar-se para jogar fora de posição contra CO/BTN.'],
    advantages: [
      { label: 'Informação', value: 40 }, { label: 'Pressão', value: 58 },
      { label: 'Controle', value: 45 }, { label: 'Iniciativa', value: 60 }, { label: 'Posição', value: 35 },
    ],
    disadvantages: ['CO e BTN ainda espreitam com posição sobre você.', 'Range intermediário: nem forte, nem largo.', '3-bets das posições finais são frequentes.'],
    range: ['55+', 'A7s+', 'KTs+', 'QTs+', 'JTs', 'ATo+', 'KQo'],
    rangeNote: 'Cerca de 15–16% das mãos.',
    example: {
      cards: ['7♦', '7♣'],
      question: 'Par de setes no MP, todos foldaram. O que faz?',
      correct: 'raise',
      explain: 'Pares médios abrem tranquilamente do MP: têm valor de showdown, flopam sets e o raise ainda leva os blinds com boa frequência.',
    },
    quiz: [
      { q: 'O que muda do UTG para o MP?', options: ['Nada relevante', 'Menos adversários por agir, range mais largo', 'Você passa a ter posição garantida'], correct: 1 },
      { q: 'Quem são as maiores ameaças à sua abertura no MP?', options: ['Os blinds', 'UTG e UTG+1', 'CO e BTN'], correct: 2 },
    ],
  },
  HJ: {
    why: 'O Hijack ganhou o nome roubando: é onde os jogadores começam a "sequestrar" a vez do CO e do BTN de atacar os blinds. Aqui começa o poker de posição de verdade.',
    objective: ['Começar a atacar os blinds.', 'Abrir mais largo com iniciativa.', 'Pressionar mesas apertadas.', 'Isolar limpers.'],
    advantages: [
      { label: 'Informação', value: 55 }, { label: 'Pressão', value: 65 },
      { label: 'Controle', value: 55 }, { label: 'Iniciativa', value: 70 }, { label: 'Posição', value: 55 },
    ],
    disadvantages: ['CO e BTN ainda agem depois — e sabem que seu range alargou.', '3-bets leves contra você aumentam.', 'Mãos médias fora de posição contra call do BTN.'],
    range: ['44+', 'A5s+', 'K9s+', 'Q9s+', 'J9s+', 'T9s', '98s', 'ATo+', 'KJo+', 'QJo'],
    rangeNote: 'Cerca de 20% das mãos.',
    example: {
      cards: ['9♠', '8♠'],
      question: '9♠ 8♠ no HJ, pasta limpa até você. O que faz?',
      correct: 'raise',
      explain: 'Suited connectors médios entram no range do HJ: jogam bem multiway, acertam flops disfarçados e sua abertura ainda gera fold equity.',
    },
    quiz: [
      { q: 'De onde vem o nome "Hijack"?', options: ['De um torneio famoso', 'De roubar a vez do CO/BTN de atacar os blinds', 'Do dealer'], correct: 1 },
      { q: 'O que passa a valer mais que as cartas a partir do HJ?', options: ['A iniciativa', 'O tamanho do stack', 'A sorte'], correct: 0 },
    ],
  },
  CO: {
    why: 'O Cutoff é a segunda melhor cadeira: só o botão age depois de você. O nome vem de "cortar" o baralho — e de cortar o privilégio do botão, abrindo antes dele.',
    objective: ['Abrir largo e pressionar.', 'Atacar blinds e limpers.', 'Fazer o botão foldar para herdar a posição.', 'Jogar potes com iniciativa.'],
    advantages: [
      { label: 'Informação', value: 75 }, { label: 'Pressão', value: 80 },
      { label: 'Controle', value: 70 }, { label: 'Iniciativa', value: 80 }, { label: 'Posição', value: 78 },
    ],
    disadvantages: ['O botão ainda paira sobre você.', '3-bet do BTN em posição é o pior cenário.', 'Range largo = mais mãos difíceis pós-flop.'],
    range: ['22+', 'A2s+', 'K7s+', 'Q8s+', 'J8s+', 'T8s+', '97s+', '87s', '76s', 'A9o+', 'KTo+', 'QTo+', 'JTo'],
    rangeNote: 'Cerca de 27% das mãos.',
    example: {
      cards: ['A♣', '4♣'],
      question: 'A♣ 4♣ no CO, todos foldaram. O que faz?',
      correct: 'raise',
      explain: 'Qualquer ás suited abre do CO: bloqueia ases dos blinds, faz nut flush e gera pressão. Foldar isso aqui é deixar dinheiro na mesa.',
    },
    quiz: [
      { q: 'Qual é o principal objetivo de abrir do CO?', options: ['Ver flops baratos', 'Pressionar blinds e fazer o BTN foldar', 'Proteger o UTG'], correct: 1 },
      { q: 'Quem é o único jogador com posição sobre o CO?', options: ['O Big Blind', 'O Hijack', 'O Button'], correct: 2 },
    ],
  },
  BTN: {
    why: 'O botão marca quem "distribui" — e por herança, quem age por último em todas as streets pós-flop. É a posição mais lucrativa do poker: informação máxima antes de cada decisão.',
    objective: ['Abrir o range máximo.', 'Ver cada adversário agir antes de você.', 'Controlar o tamanho do pote.', 'Transformar posição em fichas.'],
    advantages: [
      { label: 'Informação', value: 100 }, { label: 'Pressão', value: 90 },
      { label: 'Controle', value: 95 }, { label: 'Iniciativa', value: 85 }, { label: 'Posição', value: 100 },
    ],
    disadvantages: ['Todos sabem que seu range é largo.', 'Blinds defendem mais leve contra você.', 'Excesso de confiança custa caro.'],
    range: ['22+', 'A2s+', 'K2s+', 'Q5s+', 'J7s+', 'T7s+', '96s+', '86s+', '75s+', '65s', '54s', 'A2o+', 'K9o+', 'Q9o+', 'J9o+', 'T9o', '98o'],
    rangeNote: 'Cerca de 45% das mãos. O range mais largo da mesa.',
    example: {
      cards: ['T♦', '7♦'],
      question: 'T♦ 7♦ no BTN, foldaram até você. O que faz?',
      correct: 'raise',
      explain: 'No botão, T7s é abertura padrão: você joga toda a mão em posição, com duas cartas que fazem flushes e straights disfarçados.',
    },
    quiz: [
      { q: 'O que torna o botão a melhor posição?', options: ['Recebe cartas melhores', 'Age por último em todas as streets pós-flop', 'Paga menos blinds'], correct: 1 },
      { q: 'Qual o maior perigo de jogar no BTN?', options: ['Excesso de confiança com mãos fracas', 'Falta de informação', 'Agir primeiro no flop'], correct: 0 },
    ],
  },
  SB: {
    why: 'O Small Blind paga metade da aposta obrigatória para manter o jogo em movimento. Em troca, recebe o pior assento pós-flop: primeiro a agir em todas as streets.',
    objective: ['Não defender o desconto por orgulho.', 'Simplificar: 3-bet ou fold na maioria dos spots.', 'Roubar o BB quando todos foldarem.', 'Minimizar decisões fora de posição.'],
    advantages: [
      { label: 'Informação', value: 85 }, { label: 'Pressão', value: 55 },
      { label: 'Controle', value: 30 }, { label: 'Iniciativa', value: 50 }, { label: 'Posição', value: 8 },
    ],
    disadvantages: ['Primeiro a agir em todas as streets pós-flop.', 'Metade do blind já investida tenta seduzir você a jogar demais.', 'Sanduíche entre o agressor e o BB.'],
    range: ['22+', 'A2s+', 'K5s+', 'Q8s+', 'J8s+', 'T8s+', '97s+', '87s', '76s', 'A7o+', 'KTo+', 'QTo+', 'JTo'],
    rangeNote: 'Contra fold geral: abra largo para roubar o BB. Contra abertura: 3-bet ou fold.',
    example: {
      cards: ['K♣', '9♦'],
      question: 'K♣ 9♦ no SB, o CO abriu com raise. O que faz?',
      correct: 'fold',
      explain: 'K9o fora de posição contra range de CO é queimar fichas: dominada com frequência e sem posição para se defender. O desconto do SB não muda isso.',
    },
    quiz: [
      { q: 'Qual a estratégia mais simples e lucrativa no SB contra uma abertura?', options: ['Call com tudo que tem desconto', '3-bet ou fold', 'Limp atrás'], correct: 1 },
      { q: 'Por que o SB é a pior posição pós-flop?', options: ['Paga o blind inteiro', 'Age primeiro em todas as streets', 'Não pode dar raise'], correct: 1 },
    ],
  },
  BB: {
    why: 'O Big Blind paga a aposta cheia que cria o pote — sem ele não existiria ação. Como compensação, fecha a ação pré-flop e paga qualquer raise com desconto.',
    objective: ['Defender amplo contra roubos.', 'Fechar a ação com informação total pré-flop.', 'Saber largar no flop sem remorso.', 'Não sangrar fichas: cada rodada você paga para jogar.'],
    advantages: [
      { label: 'Informação', value: 95 }, { label: 'Pressão', value: 40 },
      { label: 'Controle', value: 35 }, { label: 'Iniciativa', value: 30 }, { label: 'Posição', value: 15 },
    ],
    disadvantages: ['Investimento obrigatório toda rodada.', 'Quase sempre fora de posição pós-flop.', 'Range de defesa largo = muitos flops errados.'],
    range: ['22+', 'A2s+', 'K2s+', 'Q2s+', 'J4s+', 'T6s+', '96s+', '85s+', '75s+', '64s+', '54s', 'A2o+', 'K7o+', 'Q8o+', 'J8o+', 'T8o+', '98o'],
    rangeNote: 'Defesa contra abertura padrão: o range mais largo de call do poker — você já pagou metade.',
    example: {
      cards: ['8♥', '6♥'],
      question: '8♥ 6♥ no BB, o BTN abriu 2.2x. O que faz?',
      correct: 'call',
      explain: 'Com desconto e fechando a ação, 86s defende com lucro contra abertura pequena do botão: acerta flops disfarçados e realiza bem sua equity.',
    },
    quiz: [
      { q: 'Por que o BB pode defender um range tão largo?', options: ['Porque tem posição', 'Porque já investiu o blind e fecha a ação com desconto', 'Porque o BTN sempre blefa'], correct: 1 },
      { q: 'Qual é a missão número um do BB?', options: ['Ganhar potes gigantes', 'Não sangrar fichas', 'Proteger o SB'], correct: 1 },
    ],
  },
}

/** Action order pré-flop, para o passo "flow". */
export const ACTION_ORDER: PositionId[] = ['UTG', 'UTG1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']
