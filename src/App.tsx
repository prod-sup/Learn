import { lazy, Suspense, useState } from 'react'
import { startAmbient, sfxClick } from './audio'
import { Landing } from './landing/Landing'

// The heavy WebGL bundle (three / r3f / gsap) only downloads after the user
// enters the room — the page itself stays instant.
const Experience = lazy(() => import('./Experience'))

/** Where the hub lives depends on where this build is hosted. */
export const HUB_URL =
  typeof location !== 'undefined' && location.pathname.toLowerCase().startsWith('/learn/')
    ? '/painelpoker/hub.html'
    : '../../hub.html'

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <div className="page">
      {/* ── HERO: the 3D table ── */}
      <section className="hero" id="mesa">
        <a className="hub-btn glass" href={HUB_URL} title="Voltar para a hub">← Hub</a>

        {!entered ? (
          <>
            {/* rendered frame of the 3D table — instant hero, zero WebGL cost */}
            <div className="hero-poster" aria-hidden="true">
              <img src="./poster.jpg" alt="" fetchPriority="high" />
            </div>
            <div className="hud">
              <div className="gate-hero">
                <h1 className="gate-title">LEARN POKER</h1>
                <p className="gate-sub">Master Every Position.</p>
                <button className="gate" onClick={() => { startAmbient(); sfxClick(); setEntered(true) }}>
                  <span className="gate-mark">♠</span>
                  <span className="gate-text">TOQUE PARA ENTRAR NA SALA</span>
                </button>
              </div>
            </div>
          </>
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

        <a className="scroll-cue" href="#conteudo" aria-label="Rolar para o conteúdo">
          <span className="scroll-cue-text">EXPLORE O POKER</span>
          <span className="scroll-cue-arrow">↓</span>
        </a>
      </section>

      {/* ── LANDING: editorial content below the table ── */}
      <Landing />
    </div>
  )
}
