import { MODALITIES } from '../content/modalities'
import { sfxClick } from '../audio'

export function Modalities({ onClose }: { onClose: () => void }) {
  const games = MODALITIES.filter((m) => m.kind === 'jogo')
  const formats = MODALITIES.filter((m) => m.kind === 'formato')

  const section = (title: string, items: typeof MODALITIES) => (
    <>
      <h3 className="mod-section">{title}</h3>
      {items.map((m) => (
        <div key={m.tag} className="mod-row">
          <span className="mod-tag">{m.tag}</span>
          <div>
            <div className="mod-title">
              <strong>{m.name}</strong>
              <span className="mod-hook">{m.highlight}</span>
            </div>
            <p className="mod-desc">{m.desc}</p>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className="rankings-overlay" onClick={onClose}>
      <div className="rankings glass" onClick={(e) => e.stopPropagation()}>
        <div className="rankings-head">
          <div>
            <span className="label">REFERÊNCIA</span>
            <h2>Modalidades de poker</h2>
            <p className="rankings-sub">Os jogos e formatos que você vai encontrar — e onde a estratégia de posição se aplica.</p>
          </div>
          <button className="btn" onClick={() => { sfxClick(); onClose() }}>Fechar ✕</button>
        </div>
        {section('Jogos', games)}
        {section('Formatos', formats)}
      </div>
    </div>
  )
}
