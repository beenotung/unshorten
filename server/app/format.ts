import { format_byte } from '@beenotung/tslib/format.js'

let n_decimal = 1

export function formatSize(size: number) {
  return format_byte(size, n_decimal)
}
