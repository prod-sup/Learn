import { lazy, Suspense, useState } from 'react'
import { startAmbient, sfxClick } from './audio'

// The heavy WebGL bundle (three / r3f / gsap) only downloads after the user
// enters the room — the Learn page that embeds this stays instant.
const Experience = lazy(() => import('./Experience'))

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <div className="stage">
      {!entered ? (
        <div className="hud">
          <button className="gate" onClick={() => { startAmbient(); sfxClick(); setEntered(true) }}>
            <span className="gate-mark">♠</span>
            <span className="gate-text">TOQUE PARA ENTRAR NA SALA</span>
          </button>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="hud">
              <div className="loading-gate">
                <span className="gate-mark pulse">♠</span>
                <span className="gate-text">PREPARANDO A MESA…</span>
              </div>
            </div>
          }
        >
          <Experience />
        </Suspense>
      )}
    </div>
  )
}
