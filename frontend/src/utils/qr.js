export function parseQRParams() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('t')
  const type = params.get('type')
  if (type === 'takeout') return { orderType: 'takeout', token: null }
  if (token) return { orderType: 'dine_in', token }
  return { orderType: 'dine_in', token: null }
}
