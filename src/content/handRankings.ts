// Poker hand rankings, strongest → weakest. Cards use suit glyphs ♠♥♦♣.
export interface HandRank {
  n: number
  name: string      // Portuguese
  en: string        // English term
  cards: string[]   // 5-card example
  desc: string
}

export const HAND_RANKINGS: HandRank[] = [
  {
    n: 1, name: 'Royal Flush', en: 'Royal Flush',
    cards: ['A♠', 'K♠', 'Q♠', 'J♠', 'T♠'],
    desc: 'A sequência A-K-Q-J-10, toda do mesmo naipe. A mão perfeita — imbatível.',
  },
  {
    n: 2, name: 'Straight Flush', en: 'Straight Flush',
    cards: ['9♥', '8♥', '7♥', '6♥', '5♥'],
    desc: 'Cinco cartas em sequência, todas do mesmo naipe.',
  },
  {
    n: 3, name: 'Quadra', en: 'Four of a Kind',
    cards: ['Q♠', 'Q♥', 'Q♦', 'Q♣', '7♠'],
    desc: 'Quatro cartas de mesmo valor. Quase sempre a melhor mão da mesa.',
  },
  {
    n: 4, name: 'Full House', en: 'Full House',
    cards: ['K♠', 'K♥', 'K♦', '9♣', '9♠'],
    desc: 'Uma trinca somada a um par. Força enorme em quase todo pote.',
  },
  {
    n: 5, name: 'Flush', en: 'Flush',
    cards: ['A♦', 'J♦', '8♦', '5♦', '2♦'],
    desc: 'Cinco cartas do mesmo naipe, sem sequência. Vence pela carta mais alta.',
  },
  {
    n: 6, name: 'Sequência', en: 'Straight',
    cards: ['T♠', '9♥', '8♦', '7♣', '6♠'],
    desc: 'Cinco cartas em ordem, de naipes variados.',
  },
  {
    n: 7, name: 'Trinca', en: 'Three of a Kind',
    cards: ['J♠', 'J♥', 'J♦', 'A♣', '4♠'],
    desc: 'Três cartas de mesmo valor. Mão forte, sobretudo pré-flop.',
  },
  {
    n: 8, name: 'Dois Pares', en: 'Two Pair',
    cards: ['A♠', 'A♥', '9♦', '9♣', 'K♠'],
    desc: 'Dois pares diferentes. Desempate pelo par mais alto e pelo kicker.',
  },
  {
    n: 9, name: 'Par', en: 'One Pair',
    cards: ['T♠', 'T♥', 'A♦', '7♣', '3♠'],
    desc: 'Duas cartas de mesmo valor. A mão feita mais comum.',
  },
  {
    n: 10, name: 'Carta Alta', en: 'High Card',
    cards: ['A♠', 'Q♥', '9♦', '6♣', '3♠'],
    desc: 'Nenhuma combinação: vale a carta mais alta. A mão mais fraca.',
  },
]
