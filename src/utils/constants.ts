export const modes = ['legacy', 'minimal', 'unified'] as const

export type Mode = (typeof modes)[number]

export const defaultMode: Mode = 'minimal'

export function isMode(mode: string): mode is Mode {
  return modes.includes(mode as Mode)
}
