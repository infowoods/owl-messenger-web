export function getMixinContext() {
  let ctx = {}
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.MixinContext
  ) {
    ctx = JSON.parse(prompt('MixinContext.getContext()'))
    ctx.platform = ctx.platform || 'iOS'
  } else if (
    window.MixinContext &&
    typeof window.MixinContext.getContext === 'function'
  ) {
    ctx = JSON.parse(window.MixinContext.getContext())
    ctx.platform = ctx.platform || 'Android'
  }

  ctx.conversation_id = ctx.conversation_id || ''

  return ctx
}

export function reloadTheme() {
  switch (getMixinContext().platform) {
    case 'iOS':
      window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.reloadTheme &&
        window.webkit.messageHandlers.reloadTheme.postMessage('')
      return
    case 'Android':
    // case 'Desktop':
    default:
      window.MixinContext &&
        typeof window.MixinContext.reloadTheme === 'function' &&
        window.MixinContext.reloadTheme()
      return
  }
}
