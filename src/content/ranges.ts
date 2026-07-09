// 13×13 hand-matrix utilities. Rank order: A high → 2 low.
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const

/** Cell (row, col): row < col → suited; row > col → offsuit; diagonal → pair. */
export function cellLabel(row: number, col: number): string {
  if (row === col) return RANKS[row] + RANKS[col]
  if (row < col) return RANKS[row] + RANKS[col] + 's'
  return RANKS[col] + RANKS[row] + 'o'
}

const idx = (r: string) => RANKS.indexOf(r as (typeof RANKS)[number])

/**
 * Expand compact range tokens ("77+", "AJs+", "T8s+", "KQo", "98s")
 * into a Set of matrix labels.
 */
export function expandRange(tokens: string[]): Set<string> {
  const out = new Set<string>()
  for (const t of tokens) {
    const plus = t.endsWith('+')
    const core = plus ? t.slice(0, -1) : t
    if (core.length === 2 && core[0] === core[1]) {
      // pair, e.g. 77+
      const from = idx(core[0])
      if (plus) for (let i = from; i >= 0; i--) out.add(RANKS[i] + RANKS[i])
      else out.add(core)
    } else {
      const hi = core[0]
      const lo = core[1]
      const suf = core[2] // 's' | 'o'
      const hiI = idx(hi)
      const loI = idx(lo)
      const add = (l: number) => out.add(hi + RANKS[l] + suf)
      if (plus) for (let l = loI; l > hiI; l--) add(l)
      else add(loI)
    }
  }
  return out
}
