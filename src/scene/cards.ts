import * as THREE from 'three'

// High-resolution playing-card textures, cached by card string.
const faceCache = new Map<string, THREE.CanvasTexture>()
let backTex: THREE.CanvasTexture | null = null

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function suitColor(s: string): string {
  return s === '♥' || s === '♦' ? '#b23a33' : '#211e19'
}

/** Crisp card face: corner indices + large centre pip. */
export function makeCardFace(card: string): THREE.CanvasTexture {
  const cached = faceCache.get(card)
  if (cached) return cached

  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  const W = 420, H = 588 // 5:7, high-res
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // face — parchment kept just under the bloom threshold so it never blows out
  ctx.fillStyle = '#dcd3bd'
  roundRect(ctx, 0, 0, W, H, 34); ctx.fill()
  ctx.strokeStyle = 'rgba(20,16,10,0.10)'
  ctx.lineWidth = 5
  roundRect(ctx, 8, 8, W - 16, H - 16, 28); ctx.stroke()

  const col = suitColor(suit)
  ctx.fillStyle = col
  ctx.textAlign = 'center'

  const corner = (x: number, y: number, rot: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.textBaseline = 'alphabetic'
    ctx.font = '700 96px Georgia, serif'
    ctx.fillText(rank, 0, 0)
    ctx.font = '72px Georgia, serif'
    ctx.fillText(suit, 0, 74)
    ctx.restore()
  }
  corner(64, 96, 0)
  corner(W - 64, H - 96, Math.PI)

  // centre pip
  ctx.textBaseline = 'middle'
  ctx.font = '272px Georgia, serif'
  ctx.fillText(suit, W / 2, H / 2 + 14)

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 16
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  faceCache.set(card, tex)
  return tex
}

/** Card back: "SUPREMA POKER" wordmark on charcoal. */
export function makeCardBack(): THREE.CanvasTexture {
  if (backTex) return backTex
  const W = 420, H = 588
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#191510'
  roundRect(ctx, 0, 0, W, H, 34); ctx.fill()
  ctx.strokeStyle = '#E8933D'
  ctx.lineWidth = 6
  roundRect(ctx, 26, 26, W - 52, H - 52, 24); ctx.stroke()

  // wordmark, stacked and rotated to read along the card
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#efe6d4'
  ctx.font = '900 92px "Arial Narrow", Impact, sans-serif'
  ctx.letterSpacing = '10px'
  ctx.fillText('SUPREMA', 6, -6)
  ctx.fillStyle = '#E8933D'
  ctx.font = '700 48px "Arial Narrow", Impact, sans-serif'
  ctx.letterSpacing = '18px'
  ctx.fillText('POKER', 11, 48)
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 16
  backTex = tex
  return tex
}
