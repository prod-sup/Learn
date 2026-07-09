import * as THREE from 'three'

// Procedural textures generated once on a canvas — no network, tiny memory.

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat = 1): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  draw(ctx)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 8
  return tex
}

/** Fine fabric-fiber noise for the felt bump map. */
export function makeFeltBump(): THREE.CanvasTexture {
  return canvasTexture(512, (ctx) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 512, 512)
    const img = ctx.getImageData(0, 0, 512, 512)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = 128 + (Math.random() - 0.5) * 70
      d[i] = d[i + 1] = d[i + 2] = n
    }
    ctx.putImageData(img, 0, 0)
    // directional brushing: faint horizontal streaks
    ctx.globalAlpha = 0.08
    for (let y = 0; y < 512; y += 2) {
      ctx.fillStyle = Math.random() > 0.5 ? '#9a9a9a' : '#666666'
      ctx.fillRect(0, y, 512, 1)
    }
  }, 6)
}

/** Dark walnut grain for the rail and table body. */
export function makeWoodMap(): THREE.CanvasTexture {
  return canvasTexture(512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 512, 0)
    g.addColorStop(0, '#3a2a1e')
    g.addColorStop(0.5, '#42301f')
    g.addColorStop(1, '#33241a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
    // grain streaks
    for (let i = 0; i < 260; i++) {
      const y = Math.random() * 512
      const w = 40 + Math.random() * 300
      const x = Math.random() * 512 - 100
      const dark = Math.random() > 0.5
      ctx.strokeStyle = dark ? 'rgba(24,15,9,0.20)' : 'rgba(94,68,42,0.14)'
      ctx.lineWidth = 0.6 + Math.random() * 1.6
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.bezierCurveTo(x + w * 0.3, y + (Math.random() - 0.5) * 6, x + w * 0.7, y + (Math.random() - 0.5) * 6, x + w, y)
      ctx.stroke()
    }
  }, 2)
}

/** Suprema Poker logo, stamped on the felt (transparent background). */
export function makeSupremaStamp(): THREE.CanvasTexture {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = S; c.height = S
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, S, S)
  const cx = S / 2
  const orange = '#E8933D'

  // wordmark only — "SUPREMA POKER"
  ctx.textAlign = 'center'
  ctx.fillStyle = '#efe6d4'
  ctx.font = '900 150px "Arial Narrow", Impact, sans-serif'
  ctx.letterSpacing = '20px'
  ctx.fillText('SUPREMA', cx + 10, S * 0.50)
  ctx.fillStyle = orange
  ctx.font = '700 74px "Arial Narrow", Impact, sans-serif'
  ctx.letterSpacing = '38px'
  ctx.fillText('POKER', cx + 19, S * 0.60)

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  return tex
}

/** Subtle dark carpet for the floor. */
export function makeCarpetMap(): THREE.CanvasTexture {
  return canvasTexture(256, (ctx) => {
    ctx.fillStyle = '#141109'
    ctx.fillRect(0, 0, 256, 256)
    const img = ctx.getImageData(0, 0, 256, 256)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 14
      d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.7
    }
    ctx.putImageData(img, 0, 0)
  }, 24)
}
