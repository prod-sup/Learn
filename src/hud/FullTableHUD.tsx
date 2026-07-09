import { useEffect, useState } from 'react'
import { HAND, potAt } from '../content/hand'
import { POSITIONS, useStore } from '../store'
import { nextBeat, prevBeat, setAutoPlay, exitFullTable } from '../cinema/CameraDirector'

const STREET_LABEL: Record<string, string> = { flop: 'FLOP', turn: 'TURN', river: 'RIVER' }

function seatName(id: string): string {
  if (id === 'UTG1') return 'UTG+1'
  return POSITIONS.find((p) => p.id === id)?.id ?? id
}

export function FullTableHUD() {
  const beat = useStore((s) => s.beat)
  const [auto, setAuto] = useState(true)

  useEffect(() => { setAutoPlay(auto) }, [auto])

  if (beat < 0) return null
  const b = HAND[beat]
  if (!b) return null

  const isStreet = b.action === 'street'
  const isWin = b.action === 'win'
  const pot = potAt(beat)
  const speaker = b.seat ? seatName(b.seat) : b.street ? STREET_LABEL[b.street] : 'MÃO'

  return (
    <>
      <div className="glass ft-top">
        <span className="label">MESA COMPLETA · DOCUMENTÁRIO</span>
        <span className="ft-pot">POTE <b>{pot.toFixed(1)} BB</b></span>
        <span className="ft-count">{beat + 1}/{HAND.length}</span>
      </div>

      <div className={`glass ft-caption ${isWin ? 'win' : ''}`} key={beat}>
        <div className="ft-speaker">
          <span className={`ft-badge ${isStreet ? 'street' : isWin ? 'win' : 'act'}`}>{speaker}</span>
          <span className="ft-action">{b.label}</span>
        </div>
        <p className="ft-reason">{isStreet || isWin ? b.reason : `“${b.reason}”`}</p>

        <div className="ft-controls">
          <button className="btn" onClick={prevBeat} disabled={beat === 0}>←</button>
          <button className="btn" onClick={() => setAuto((a) => !a)}>{auto ? '❙❙ Pausar' : '▶ Continuar'}</button>
          <button className="btn" onClick={nextBeat} disabled={beat >= HAND.length - 1}>→</button>
          <button className="btn gold" onClick={exitFullTable}>Sair da mesa</button>
        </div>
      </div>
    </>
  )
}
