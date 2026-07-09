import { useEffect, useRef } from 'react'
import { MODALITIES } from '../content/modalities'
import { HAND_RANKINGS } from '../content/handRankings'
import { POSITIONS } from '../store'
import { HUB_URL } from '../App'

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Adds .in when the element scrolls into view (reveal animation). */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (REDUCED) { el.classList.add('in'); return }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

/** Thin scroll-progress bar — a quiet invitation to keep going. */
function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div className="scroll-progress" ref={bar} aria-hidden="true" />
}

/** Giant ghost suit — parallax is driven by the GSAP scrub layer (motion.ts). */
function GhostSuit({ suit, speed, className }: { suit: string; speed: number; className?: string }) {
  return (
    <span className={`ghost-suit ${className ?? ''}`} data-speed={speed} aria-hidden="true">
      {suit}
    </span>
  )
}

/** Big-number strip — poker in four numbers, counting up on reveal. */
function Stats() {
  const ref = useReveal<HTMLElement>()
  const stats: [string, string, string][] = [
    ['52', 'cartas no baralho', '52'],
    ['169', 'mãos iniciais distintas', '169'],
    ['1326', 'combinações possíveis', '1.326'],
    ['8', 'posições para dominar', '8'],
  ]
  return (
    <section className="l-stats rv" ref={ref}>
      <div className="l-wrap l-stats-wrap stagger">
        {stats.map(([n, label, fallback], i) => (
          <div className="stat" key={label} style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <span className="stat-n" data-n={n}>{fallback}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Infinite typographic marquee — the classic motion-site pulse. */
function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items] // duplicated for a seamless loop
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span className="marquee-item" key={i}>
            {t} <span className="marquee-dot">♠</span>
          </span>
        ))}
      </div>
    </div>
  )
}

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

function Section({ id, n, eyebrow, title, lead, ghost, ghostSpeed = 1, children }: {
  id?: string
  n: string
  eyebrow: string
  title: string
  lead?: string
  ghost?: string
  ghostSpeed?: number
  children: React.ReactNode
}) {
  const ref = useReveal<HTMLElement>()
  return (
    <section id={id} className="l-section rv" ref={ref}>
      {ghost && <GhostSuit suit={ghost} speed={ghostSpeed} />}
      <span className="l-num" aria-hidden="true">{n}</span>
      <div className="l-wrap">
        <span className="l-eyebrow">{eyebrow}</span>
        <h2 className="l-title">{title}</h2>
        {lead && <p className="l-lead">{lead}</p>}
        {children}
      </div>
    </section>
  )
}

export function Landing() {
  const ctaRef = useReveal<HTMLElement>()

  // motion-site layer (GSAP) loads lazily — never on weak machines
  useEffect(() => {
    void import('./motion').then((m) => m.initLandingMotion())
  }, [])

  return (
    <div className="landing" id="conteudo">
      <ScrollProgress />

      <Marquee items={['POSIÇÃO', 'RANGES', 'EQUITY', 'DISCIPLINA', 'POT ODDS', 'INICIATIVA']} />

      <Section
        n="01"
        eyebrow="O JOGO"
        title="Poker é um jogo de decisões, não de sorte."
        lead="Toda mão é um problema de informação incompleta: o que você sabe, o que seus adversários mostram e o que a matemática diz. Quem decide melhor, mais vezes, vence no longo prazo — e é isso que esta experiência ensina."
        ghost="♠"
        ghostSpeed={1}
      >
        <div className="l-pillars stagger">
          {[
            ['♠', 'Posição', 'Agir depois dos adversários vale mais que cartas boas. A cadeira em que você senta define o leque de mãos que pode jogar — por isso a mesa 3D acima ensina posição por posição.'],
            ['♥', 'Ranges', 'Profissionais não pensam em uma mão, pensam em conjuntos de mãos. Você aprende o range de abertura de cada posição — do UTG apertado ao botão agressivo.'],
            ['♦', 'Matemática', 'Pot odds, equity, valor esperado. Nenhuma decisão é adivinhação: cada call, fold ou raise tem um número por trás — e ele aparece nas lições da mesa.'],
            ['♣', 'Disciplina', 'A habilidade mais subestimada: foldar. Sobreviver aos spots ruins e apostar forte nos bons é o que separa jogadores vencedores de sortudos temporários.'],
          ].map(([mark, title, text], i) => (
            <div className="l-card" key={title} style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="l-card-mark">{mark}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Stats />

      <Section
        n="02"
        eyebrow="MODALIDADES"
        title="Os jogos e formatos do poker."
        lead="O poker é uma família de jogos. As regras mudam, mas a lógica de posição, ranges e matemática que você treina na mesa acima vale em todos."
        ghost="♥"
        ghostSpeed={-1.2}
      >
        <div className="l-mods stagger">
          {MODALITIES.map((m, i) => (
            <div className="l-mod" key={m.tag} style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
              <div className="l-mod-head">
                <span className="l-tag">{m.tag}</span>
                <span className={`l-kind ${m.kind}`}>{m.kind === 'jogo' ? 'JOGO' : 'FORMATO'}</span>
              </div>
              <h3>{m.name}</h3>
              <p className="l-hook">{m.highlight}</p>
              <p className="l-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Marquee items={['ROYAL FLUSH', 'QUADRA', 'FULL HOUSE', 'FLUSH', 'SEQUÊNCIA', 'TRINCA']} />

      <Section
        n="03"
        eyebrow="REFERÊNCIA"
        title="O ranking de mãos."
        lead="Da mais forte para a mais fraca: as dez combinações que decidem todo pote de poker. Memorize — é o alfabeto do jogo."
        ghost="♦"
        ghostSpeed={1.4}
      >
        <ol className="l-ranks stagger">
          {HAND_RANKINGS.map((h, i) => (
            <li className="l-rank" key={h.n} style={{ '--d': `${i * 50}ms` } as React.CSSProperties}>
              <span className="l-rank-n">{String(h.n).padStart(2, '0')}</span>
              <div className="l-rank-info">
                <div className="l-rank-title">
                  <strong>{h.name}</strong>
                  <span className="l-rank-en">{h.en}</span>
                </div>
                <p>{h.desc}</p>
              </div>
              <div className="l-rank-cards">
                {h.cards.map((c, j) => <MiniCard key={j} card={c} />)}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        n="04"
        eyebrow="A MESA"
        title="Oito cadeiras, oito jeitos de pensar."
        lead="Cada posição da mesa exige um jogo diferente. Na experiência 3D, você senta em todas — e ganha uma ficha por posição dominada."
        ghost="♣"
        ghostSpeed={-1}
      >
        <div className="l-positions stagger">
          {POSITIONS.map((p, i) => (
            <div className="l-pos" key={p.id} style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
              <span className="l-pos-tag">{p.label}</span>
              <h3>{p.fullName}</h3>
              <p>{p.tagline}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="l-cta rv" ref={ctaRef}>
        <GhostSuit suit="♠" speed={0.7} className="cta-suit" />
        <div className="l-wrap l-cta-wrap">
          <span className="l-eyebrow">PRONTO?</span>
          <h2 className="l-title l-cta-title">A mesa está<br />esperando.</h2>
          <p className="l-lead">Volte ao topo, toque para entrar na sala e sente-se na primeira cadeira. Master every position.</p>
          <div className="l-cta-actions">
            <a className="btn gold l-btn" href="#mesa">♠ Sentar à mesa</a>
            <a className="btn l-btn" href={HUB_URL}>← Voltar para a hub</a>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <span className="l-footer-brand">SUPREMA <em>POKER</em></span>
        <span className="l-footer-note">Learn Poker · Experiência de treinamento imersivo</span>
      </footer>
    </div>
  )
}
