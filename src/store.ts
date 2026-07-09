import { create } from 'zustand'

export type Phase = 'gate' | 'black' | 'lights' | 'orbit' | 'title' | 'invite' | 'free' | 'flying' | 'seated' | 'fulltable'

export type PositionId = 'UTG' | 'UTG1' | 'MP' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export interface PositionData {
  id: PositionId
  label: string
  fullName: string
  tagline: string
  mindset: string[]
}

export const POSITIONS: PositionData[] = [
  {
    id: 'UTG', label: 'UTG', fullName: 'Under the Gun',
    tagline: 'O primeiro jogador a agir após os blinds.',
    mindset: [
      'Ainda existem muitos jogadores para agir.',
      'Você possui pouca informação.',
      'Seu range precisa sobreviver às ações dos adversários.',
    ],
  },
  {
    id: 'UTG1', label: 'UTG+1', fullName: 'Under the Gun +1',
    tagline: 'Ainda cedo demais para relaxar.',
    mindset: [
      'Apenas um jogador agiu antes de você.',
      'Sua situação é quase tão delicada quanto a do UTG.',
      'Disciplina continua sendo sua maior arma.',
    ],
  },
  {
    id: 'MP', label: 'MP', fullName: 'Middle Position',
    tagline: 'O meio do caminho entre cautela e agressão.',
    mindset: [
      'Metade da mesa já revelou intenções.',
      'Seu range pode começar a respirar.',
      'Mas os jogadores de posição final ainda espreitam.',
    ],
  },
  {
    id: 'HJ', label: 'HJ', fullName: 'Hijack',
    tagline: 'Onde o roubo de blinds começa.',
    mindset: [
      'Você começa a atacar os blinds.',
      'Apenas três jogadores agem depois de você.',
      'A iniciativa passa a valer mais que as cartas.',
    ],
  },
  {
    id: 'CO', label: 'CO', fullName: 'Cutoff',
    tagline: 'A segunda melhor cadeira da mesa.',
    mindset: [
      'Só o botão ameaça sua posição.',
      'Abra seu leque e pressione.',
      'Se o botão foldar, você joga a mão em posição.',
    ],
  },
  {
    id: 'BTN', label: 'BTN', fullName: 'Button',
    tagline: 'A melhor posição do poker.',
    mindset: [
      'Você age por último em todas as streets pós-flop.',
      'Informação máxima, pressão máxima.',
      'Aqui, quase toda mão tem preço.',
    ],
  },
  {
    id: 'SB', label: 'SB', fullName: 'Small Blind',
    tagline: 'Dinheiro no pote, pior posição pós-flop.',
    mindset: [
      'Você já pagou para ver — mas será o primeiro a agir depois.',
      'Desconto não é desculpa para mãos fracas.',
      'Jogue simples: 3-bet ou fold na maioria dos spots.',
    ],
  },
  {
    id: 'BB', label: 'BB', fullName: 'Big Blind',
    tagline: 'O defensor obrigatório.',
    mindset: [
      'Você fecha a ação pré-flop com desconto.',
      'Defenda amplo, mas saiba largar no flop.',
      'Sua missão é não sangrar fichas.',
    ],
  },
]

interface Store {
  phase: Phase
  seated: PositionId | null
  completed: PositionId[]
  step: number | null // index into STEPS, null = plaque view
  hoverHand: { label: string; inRange: boolean } | null
  beat: number // full-table documentary beat index (-1 = not started)
  preview: PositionId | null // position currently framed by arrows/tour
  touring: boolean // auto cinematic tour running
  setPhase: (p: Phase) => void
  setSeated: (p: PositionId | null) => void
  setStep: (s: number | null) => void
  setBeat: (b: number) => void
  setHoverHand: (h: { label: string; inRange: boolean } | null) => void
  setPreview: (p: PositionId | null) => void
  setTouring: (t: boolean) => void
  complete: (p: PositionId) => void
}

export const useStore = create<Store>((set) => ({
  phase: 'gate',
  seated: null,
  completed: JSON.parse(localStorage.getItem('lp-completed') ?? '[]'),
  step: null,
  hoverHand: null,
  setPhase: (phase) => set({ phase }),
  setSeated: (seated) => set({ seated, step: null, hoverHand: null }),
  setStep: (step) => set({ step, hoverHand: null }),
  beat: -1,
  setBeat: (beat) => set({ beat }),
  preview: null,
  touring: false,
  setPreview: (preview) => set({ preview }),
  setTouring: (touring) => set({ touring }),
  setHoverHand: (hoverHand) => set({ hoverHand }),
  complete: (p) =>
    set((s) => {
      const completed = s.completed.includes(p) ? s.completed : [...s.completed, p]
      localStorage.setItem('lp-completed', JSON.stringify(completed))
      return { completed }
    }),
}))

if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__store = useStore

// Seat layout: ellipse around the table, gap at the "top" (dealer side).
const A = 4.6 // x radius
const B = 3.1 // z radius
export const SEAT_ANGLES: Record<PositionId, number> = {
  UTG: 202.5, UTG1: 237.5, MP: 272.5, HJ: 307.5,
  CO: 342.5, BTN: 17.5, SB: 52.5, BB: 87.5,
}
export function seatPosition(id: PositionId): [number, number, number] {
  const a = (SEAT_ANGLES[id] * Math.PI) / 180
  return [Math.cos(a) * A, 0, Math.sin(a) * B]
}
