export function formatNum(val, decimal = 8) {
  return Number(val)
    .toFixed(decimal)
    .replace(/\.?0+$/, '')
}

export function formatAdd(a, b, decimal = 8) {
  return formatNum(Number(a) + Number(b), decimal)
}
