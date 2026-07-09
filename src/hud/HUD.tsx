import { useState } from 'react'
import { POSITIONS, useStore } from '../store'
import { LESSONS } from '../content/positions'
import {
  standUp, goToStep,
  stepPosition, clearPreview, flyToSeat, startTour, stopTour,
} from '../cinema/CameraDirector'
import { sfxClick } from '../audio'
import { TIER, setQuality } from '../quality'
import { Lesson } from './Lesson'
import { HandRankings } from './HandRankings'
import { Modalities } from './Modalities'

type Panel = 'rankings' | 'modalities' | null

export function HUD() {
  const phase = useStore((s) => s.phase)
  const seated = useStore((s) => s.seated)
  const step = useStore((s) => s.step)
  const completed = useStore((s) => s.completed)
  const preview = useStore((s) => s.preview)
  const touring = useStore((s) => s.touring)
  const data = seated ? POSITIONS.find((p) => p.id === seated)! : null
  const previewData = preview ? POSITIONS.find((p) => p.id === preview)! : null
  // only one reference panel can be open at a time; it hides everything else
  const [panel, setPanel] = useState<Panel>(null)

  const showTopBar = (phase === 'free' || phase === 'seated') && !touring

  if (panel) {
    return (
      <div className="hud">
        {panel === 'rankings' && <HandRankings onClose={() => setPanel(null)} />}
        {panel === 'modalities' && <Modalities onClose={() => setPanel(null)} />}
      </div>
    )
  }

  return (
    <div className="hud">
      {showTopBar && (
        <>
          <button className="rankings-btn glass" onClick={() => { sfxClick(); setPanel('rankings') }}>
            <span className="rk-suit">♠</span> Ranking de mãos
          </button>
          <button className="modalities-btn glass" onClick={() => { sfxClick(); setPanel('modalities') }}>
            <span className="rk-suit">♦</span> Modalidades
          </button>
          <button
            className="quality-btn glass"
            title="Qualidade gráfica"
            onClick={() => setQuality(TIER === 'high' ? 'low' : 'high')}
          >
            {TIER === 'high' ? 'Gráficos: Alto' : 'Gráficos: Baixo'}
          </button>
        </>
      )}

      {(phase === 'title' || phase === 'invite' || phase === 'free') && !seated && !preview && !touring && (
        <div className={`title-block ${phase !== 'title' ? 'title-settled' : ''}`}>
          <h1>LEARN POKER</h1>
          <p>Master Every Position.</p>
        </div>
      )}

      {(phase === 'invite' || phase === 'free') && !seated && !preview && !touring && (
        <div className="invite">Use as <em>setas</em> para percorrer as posições — ou clique numa cadeira.</div>
      )}

      {/* free-mode: cinematic tour launcher + position stepper */}
      {phase === 'free' && !seated && !touring && (
        <>
          <div className="pos-nav">
            <button className="orbit-btn" aria-label="Posição anterior" onClick={() => stepPosition(-1)}>‹</button>
            <span className="orbit-hint">posições</span>
            <button className="orbit-btn" aria-label="Próxima posição" onClick={() => stepPosition(1)}>›</button>
          </div>
          {!preview && (
            <button className="tour-btn glass" onClick={() => { sfxClick(); startTour() }}>
              ▷ Tour cinematográfico
            </button>
          )}
        </>
      )}

      {/* previewed position card (arrow selection) */}
      {phase === 'free' && !seated && !touring && previewData && (
        <div className="glass preview-card">
          <span className="label">{previewData.label}</span>
          <h2>{previewData.fullName}</h2>
          <p className="tagline">{previewData.tagline}</p>
          <p className="preview-why">{LESSONS[previewData.id].why}</p>
          <div className="plaque-actions">
            <button className="btn gold" onClick={() => flyToSeat(previewData.id)}>Sentar nesta posição</button>
            <button className="btn" onClick={() => { sfxClick(); clearPreview() }}>Ver a mesa</button>
          </div>
        </div>
      )}

      {/* cinematic tour caption */}
      {touring && previewData && (
        <>
          <div className="glass tour-caption" key={previewData.id}>
            <span className="tour-badge">{previewData.label}</span>
            <h2>{previewData.fullName}</h2>
            <p className="tagline">{previewData.tagline}</p>
            <p className="preview-why">{LESSONS[previewData.id].why}</p>
            <div className="tour-progress">
              {POSITIONS.map((p) => (
                <span key={p.id} className={`tour-dot ${p.id === preview ? 'on' : ''}`} />
              ))}
            </div>
          </div>
          <button className="tour-exit glass" onClick={() => { sfxClick(); stopTour() }}>Encerrar tour ✕</button>
        </>
      )}

      {(phase === 'free' || phase === 'seated') && !touring && (
        <div className="glass progress">
          <span className="label">PROGRESSO</span>
          <span className="value">{completed.length} / 8 fichas</span>
        </div>
      )}

      {phase === 'seated' && data && step === null && (
        <div className="glass plaque">
          <span className="label">{data.label}</span>
          <h2>{data.fullName}</h2>
          <p className="tagline">{data.tagline}</p>
          <div className="plaque-actions">
            <button className="btn gold" onClick={() => goToStep(0)}>
              {completed.includes(data.id) ? 'Rever lição' : 'Iniciar lição'}
            </button>
            <button className="btn" onClick={standUp}>Levantar da mesa</button>
          </div>
        </div>
      )}

      {phase === 'seated' && seated && step !== null && <Lesson seated={seated} />}
    </div>
  )
}
