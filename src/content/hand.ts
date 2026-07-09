import type { PositionId } from '../store'

export type BeatAction = 'fold' | 'raise' | 'call' | 'check' | 'bet' | 'street' | 'win'

export interface HandBeat {
  seat?: PositionId          // who acts (absent for street/win beats)
  action: BeatAction
  label: string              // short HUD label, e.g. "HJ abre 2.3 BB"
  reason: string             // the player's thinking, narrated
  street?: 'flop' | 'turn' | 'river'
  cards?: string[]           // community cards revealed on a street beat
  bet?: number               // chips (in BB) placed by this beat
  clearsBets?: boolean       // street beats sweep bets into the pot
}

/** Hole cards shown at showdown (winner + caller). */
export const REVEALED: Partial<Record<PositionId, [string, string]>> = {
  HJ: ['K♠', 'Q♠'],
  BTN: ['J♦', 'T♦'],
}

export const HAND: HandBeat[] = [
  { seat: 'UTG', action: 'fold', label: 'UTG folda A♦ 9♣', reason: 'A9 offsuit parece bonita, mas no UTG ela é dominada pelos ranges que ainda vão falar. Sete jogadores atrás de mim — disciplina.' },
  { seat: 'UTG1', action: 'fold', label: 'UTG+1 folda 6♠ 5♠', reason: 'Suited connector charmoso, posição errada. Se eu pagar aqui, jogo o resto da mão adivinhando. Fold sem remorso.' },
  { seat: 'MP', action: 'fold', label: 'MP folda K♣ 9♥', reason: 'K9o do MP é queimar fichas: quando sou pago, estou quase sempre dominado. As posições finais fariam melhor uso dela.' },
  { seat: 'HJ', action: 'raise', label: 'HJ abre 2.3 BB com K♠ Q♠', reason: 'KQs no Hijack é abertura padrão: bloqueio broadways, jogo bem pós-flop e só três jogadores agem depois de mim. Iniciativa é minha.', bet: 2.3 },
  { seat: 'CO', action: 'fold', label: 'CO folda A♣ 4♦', reason: 'A4o contra abertura do HJ não realiza equity: fora de posição relativa ao BTN e dominado com frequência. O ás sozinho não paga a conta.' },
  { seat: 'BTN', action: 'call', label: 'BTN paga com J♦ T♦', reason: 'JTs em posição absoluta: pago para jogar todas as streets por último. 3-bet também é opção, mas o call mantém os blinds sanduichados.', bet: 2.3 },
  { seat: 'SB', action: 'fold', label: 'SB folda 9♦ 2♣', reason: 'Nem o desconto salva 92o. No SB minha regra é simples: 3-bet ou fold — e isso aqui não é 3-bet.' },
  { seat: 'BB', action: 'fold', label: 'BB folda 8♣ 3♥', reason: 'Mesmo fechando a ação com desconto, 83o não conecta com flop nenhum contra dois ranges fortes. Guardo minhas fichas.' },
  { action: 'street', street: 'flop', cards: ['Q♥', '7♦', '2♠'], label: 'Flop: Q♥ 7♦ 2♠', reason: 'Pote: 6.1 BB. Flop seco, sem flush draw. Favorece quem abriu — o range do HJ tem todas as QQ+ e broadways.', clearsBets: true },
  { seat: 'HJ', action: 'bet', label: 'HJ aposta 2 BB (c-bet)', reason: 'Top pair com kicker rei num flop seco. Aposto pequeno: extraio de queens piores e draws de gutshot, e nego equity de overcards do BTN.', bet: 2 },
  { seat: 'BTN', action: 'call', label: 'BTN paga com gutshot + overcards', reason: 'J T no flop Q72: gutshot para o nove, duas overcards ao sete... e posição. Pago uma vez — se vier a carta certa, ninguém me vê chegando.', bet: 2 },
  { action: 'street', street: 'turn', cards: ['9♣'], label: 'Turn: 9♣', reason: 'Pote: 10.1 BB. O nove completa exatamente o gutshot do BTN — K8 e JT agora têm sequência. O HJ não sabe disso.', clearsBets: true },
  { seat: 'HJ', action: 'check', label: 'HJ dá check', reason: 'O nove conecta com o range de call do BTN: JT, T9, 98 melhoraram. Meu top pair virou mão de controle de pote. Check para avaliar.' },
  { seat: 'BTN', action: 'bet', label: 'BTN aposta 7 BB', reason: 'Fiz a sequência. Aposto forte agora: o HJ tem muitas queens que pagam, e a mesa ainda parece inofensiva para ele.', bet: 7 },
  { seat: 'HJ', action: 'call', label: 'HJ paga, desconfiado', reason: 'O tamanho grita força, mas o BTN também apostaria draws e queens piores assim. Top pair bom demais para foldar, fraco demais para raise. Call.', bet: 7 },
  { action: 'street', street: 'river', cards: ['4♠'], label: 'River: 4♠', reason: 'Pote: 24.1 BB. Carta em branco — nada muda. A pergunta agora é apenas: quanto vale a sequência do BTN?', clearsBets: true },
  { seat: 'HJ', action: 'check', label: 'HJ dá check no river', reason: 'Contra a linha call-flop, bet-turn, minha queen é praticamente um bluff catcher. Check e decido contra a aposta dele.' },
  { seat: 'BTN', action: 'bet', label: 'BTN aposta 14 BB por valor', reason: 'Sequência do nuts efetivo. Dois terços do pote: o número exato que uma queen paga com dor. Maior que isso, ele folda; menor, deixo dinheiro na mesa.', bet: 14 },
  { seat: 'HJ', action: 'call', label: 'HJ paga o bluff catcher', reason: 'Matemática fria: preciso vencer 1 em 4. O BTN chega aqui com draws perdidos suficientes para justificar. Pago — e pago para aprender.', bet: 14 },
  { action: 'win', label: 'BTN vence com a sequência: J♦ T♦', reason: 'A mão inteira contada em uma linha: posição. O BTN pagou o flop barato porque jogava por último — e transformou uma carta do turn em 26 BB. Master every position.', clearsBets: true },
]

/** Pot size (BB) accumulated up to and including beat i. */
export function potAt(i: number): number {
  let pot = 1.5 // blinds
  for (let b = 0; b <= i && b < HAND.length; b++) {
    const beat = HAND[b]
    if (beat.bet) pot += beat.bet
  }
  return pot
}
