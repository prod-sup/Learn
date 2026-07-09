// Motion-site layer for the landing — GSAP + ScrollTrigger, loaded on demand.
// On weak machines (LOW tier) or prefers-reduced-motion this module never
// loads: the landing falls back to the pure-CSS reveals, costing nothing.
import { LOW } from '../quality'

let started = false

export async function initLandingMotion() {
  if (started || LOW) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  started = true

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)

  // ── 1. Section titles rise word by word (wipe reveal) ──
  document.querySelectorAll<HTMLElement>('.l-title').forEach((h) => {
    if (h.childElementCount > 0) return // skip titles with <br> etc.
    const text = h.textContent ?? ''
    h.setAttribute('aria-label', text)
    h.innerHTML = text
      .split(' ')
      .map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`)
      .join(' ')
    gsap.from(h.querySelectorAll('.wi'), {
      yPercent: 115,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: h, start: 'top 88%' },
    })
  })

  // ── 2. Ghost suits: buttery scrub parallax tied to scroll ──
  document.querySelectorAll<HTMLElement>('.ghost-suit').forEach((g) => {
    const speed = parseFloat(g.dataset.speed || '1')
    gsap.fromTo(
      g,
      { y: -70 * speed, rotation: -4 * speed },
      {
        y: 70 * speed,
        rotation: 4 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: g.parentElement ?? g,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      }
    )
  })

  // ── 3. Stat counters count up when they enter ──
  document.querySelectorAll<HTMLElement>('.stat-n').forEach((el) => {
    const target = parseFloat(el.dataset.n ?? '0')
    const obj = { v: 0 }
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate() {
        el.textContent = Math.round(obj.v).toLocaleString('pt-BR')
      },
    })
  })

  // ── 4. Marquees speed up with scroll velocity ──
  const tracks = document.querySelectorAll<HTMLElement>('.marquee-track')
  if (tracks.length) {
    const tweens: gsap.core.Tween[] = []
    tracks.forEach((t) => {
      t.closest('.marquee')?.classList.add('js-marquee') // disables the CSS keyframes
      tweens.push(gsap.to(t, { xPercent: -50, ease: 'none', duration: 32, repeat: -1 }))
    })
    ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: 'max',
      onUpdate(self) {
        const boost = gsap.utils.clamp(1, 4.5, 1 + Math.abs(self.getVelocity()) / 800)
        tweens.forEach((tw) => gsap.to(tw, { timeScale: boost, duration: 0.5, overwrite: true }))
      },
    })
  }

  // ── 5. Magnetic CTA buttons (cursor-follow) ──
  document.querySelectorAll<HTMLElement>('.l-btn').forEach((b) => {
    const qx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' })
    const qy = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' })
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect()
      qx((e.clientX - r.left - r.width / 2) * 0.28)
      qy((e.clientY - r.top - r.height / 2) * 0.4)
    })
    b.addEventListener('pointerleave', () => { qx(0); qy(0) })
  })
}
