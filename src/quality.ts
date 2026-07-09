// One-time GPU/CPU tier detection so the experience runs on weak hardware.
// 'low' → no depth-of-field, capped DPR, smaller shadows, fewer particles.

export type Tier = 'low' | 'high'

function detect(): Tier {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    let renderer = ''
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
    }
    // integrated / software / low-end mobile GPUs
    const weakGPU = /(SwiftShader|llvmpipe|Software|Microsoft Basic|Intel(?!.*Iris)|Mali-[T4]|Adreno \(TM\) [34]|PowerVR)/i.test(renderer)
    const cores = navigator.hardwareConcurrency || 4
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
    const coarse = window.matchMedia?.('(pointer: coarse)').matches // touch → often mobile
    if (weakGPU || cores <= 4 || mem <= 4 || (coarse && cores <= 6)) return 'low'
    return 'high'
  } catch {
    return 'low'
  }
}

function resolveTier(): Tier {
  const override = (typeof localStorage !== 'undefined' && localStorage.getItem('lp-quality')) as Tier | null
  if (override === 'low' || override === 'high') return override
  return detect()
}

export const TIER: Tier = resolveTier()
export const LOW = TIER === 'low'

/** Persist a manual quality choice and reload so the Canvas re-inits. */
export function setQuality(tier: Tier) {
  localStorage.setItem('lp-quality', tier)
  location.reload()
}

// Derived budgets
export const Q = {
  dpr: (LOW ? 1 : Math.min(2, window.devicePixelRatio || 1)) as number,
  shadowMap: LOW ? 1024 : 2048,
  shadows: !LOW,
  dof: !LOW,
  post: !LOW, // EffectComposer entirely off on low — vignette comes from a CSS overlay
  dust: LOW ? 50 : 220,
  aa: !LOW,
  physical: !LOW, // MeshPhysical (sheen/clearcoat) vs plain MeshStandard
  rim: !LOW, // skip the rim light on low (one less per-fragment light)
  env: !LOW, // skip PMREM environment reflections on low
  /** geometry segment multiplier (fewer polygons on low) */
  seg: (n: number) => (LOW ? Math.max(8, Math.round(n * 0.5)) : n),
}
