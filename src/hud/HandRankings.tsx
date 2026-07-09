import { HAND_RANKINGS } from '../content/handRankings'
import { sfxClick } from '../audio'

function MiniCard({ card }: { card: string }) {
  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  const red = suit === '♥' || suit === '♦'
  return (
    <span className={`mini-card ${red ? 'red' : ''}`}>
      <span className="mc-rank">{rank}</span>
      <span className="mc-suit">{suit}</span>
    </span>
  )
}

export function HandRankings({ onClose }: { onClose: () => void }) {
  return (
    <div className="rankings-overlay" onClick={onClose}>
      <div className="rankings glass" onClick={(e) => e.stopPropagation()}>
        <div className="rankings-head">
          <div>
            <span className="label">REFERÊNCIA</span>
            <h2>Melhores mãos do poker</h2>
            <p className="rankings-sub">Da mais forte para a mais fraca — as combinações que decidem o pote.</p>
          </div>
          <button className="btn" onClick={() => { sfxClick(); onClose() }}>Fechar ✕</button>
        </div>
        <ol className="rankings-list">
          {HAND_RANKINGS.map((h) => (
            <li key={h.n} className="rank-row">
              <span className="rank-n">{h.n}</span>
              <div className="rank-info">
                <div className="rank-title">
                  <strong>{h.name}</strong>
                  <span className="rank-en">{h.en}</span>
                </div>
                <p className="rank-desc">{h.desc}</p>
              </div>
              <div className="rank-cards">
                {h.cards.map((c, i) => <MiniCard key={i} card={c} />)}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
