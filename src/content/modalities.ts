// Poker game types & formats — reference content for the Learn page.
export interface Modality {
  name: string
  tag: string       // short chip label, e.g. "NLHE"
  kind: 'jogo' | 'formato'
  desc: string
  highlight: string // one-line hook
}

export const MODALITIES: Modality[] = [
  {
    name: 'Texas Hold’em No-Limit', tag: 'NLHE', kind: 'jogo',
    highlight: 'A modalidade mais jogada do mundo.',
    desc: 'Cada jogador recebe 2 cartas próprias e combina com 5 comunitárias. "No-Limit" significa que você pode apostar todas as suas fichas a qualquer momento. É o jogo desta experiência — e o padrão dos maiores torneios do planeta.',
  },
  {
    name: 'Omaha (PLO)', tag: 'PLO', kind: 'jogo',
    highlight: 'Quatro cartas, ação em dobro.',
    desc: 'Você recebe 4 cartas e deve usar exatamente 2 delas + 3 do bordo. Com mais combinações, as mãos médias valem menos e os potes explodem. "Pot-Limit": a aposta máxima é o tamanho do pote.',
  },
  {
    name: 'Omaha Hi-Lo', tag: 'O8', kind: 'jogo',
    highlight: 'O pote dividido entre a maior e a menor mão.',
    desc: 'Variante do Omaha em que o pote é dividido: metade para a melhor mão alta, metade para a melhor mão baixa (5 cartas de 8 para baixo, sem par). Exige ler o bordo em duas direções ao mesmo tempo.',
  },
  {
    name: 'Short Deck (6+)', tag: '6+', kind: 'jogo',
    highlight: 'Baralho de 36 cartas, mãos gigantes o tempo todo.',
    desc: 'Removem-se as cartas de 2 a 5. Com o baralho curto, flush passa a vencer full house e as sequências chegam com muito mais frequência. Favorito das mesas high-stakes da Ásia.',
  },
  {
    name: 'Cash Game', tag: 'CASH', kind: 'formato',
    highlight: 'Fichas valem dinheiro real, entra e sai quando quiser.',
    desc: 'Os blinds são fixos e cada ficha vale seu valor em dinheiro. Você pode recomprar, levantar e voltar. É onde a estratégia por posição — o que você aprende nesta mesa — rende de forma mais pura.',
  },
  {
    name: 'Torneio (MTT)', tag: 'MTT', kind: 'formato',
    highlight: 'Milhares de jogadores, uma coroa.',
    desc: 'Todos começam com o mesmo stack e os blinds sobem em níveis. Eliminado = fora; os últimos sobreviventes dividem a premiação. Exige adaptar o range à fase do torneio e ao tamanho do stack (ICM).',
  },
  {
    name: 'Sit & Go', tag: 'SNG', kind: 'formato',
    highlight: 'Um torneio de mesa única que começa quando ela enche.',
    desc: 'Formato compacto: 6 a 9 jogadores, sem hora marcada. Ótimo laboratório para treinar jogo de blinds altos e mesas curtas antes de encarar torneios grandes.',
  },
  {
    name: 'Spin (Expresso)', tag: 'SPIN', kind: 'formato',
    highlight: 'Três jogadores e um prêmio sorteado — poker relâmpago.',
    desc: 'Mesas de 3 jogadores, stacks curtos e um multiplicador de prêmio sorteado antes de começar (até milhares de vezes o buy-in). Decisões rápidas, ranges largos, adrenalina pura.',
  },
]
