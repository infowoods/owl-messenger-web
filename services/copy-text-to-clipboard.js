/*
    Copy text to clipboard (in the browser)
    Updated: 2022-10-14
    Source: https://gist.github.com/NodeWee/a4df091ed6e4dc0e526e609daeb34cfd
*/

async function copyTextToClipboard(text) {
  // Reference: https://stackoverflow.com/a/30810322/1293256
  if (navigator.clipboard) {
    // console.log('copy by navigator')
    return await navigator.clipboard.writeText(text).then(
      (onfulfilled) => {
        return true
      },
      (onrejected) => {
        throw onrejected
      }
    )
    //   .catch((err) => {})
  } else if (window.clipboardData) {
    // console.log('copy by window')
    if (indow.clipboardData.setData('Text', text)) {
      return
    } else {
      throw 'Failed'
    }
  } else if (document.execCommand) {
    // console.log('copy by exeCommand')
    if (copyByExecCommand(text)) {
      return
    } else {
      throw 'Failed'
    }
  } else {
    throw 'Failed'
  }
}

function copyByExecCommand(input, { target = document.body } = {}) {
  // Source: https://github.com/sindresorhus/copy-text-to-clipboard/blob/main/index.js
  const element = document.createElement('textarea')
  const previouslyFocusedElement = document.activeElement

  element.value = input

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '')

  element.style.contain = 'strict'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.fontSize = '12pt' // Prevent zooming on iOS

  const selection = document.getSelection()
  const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0)

  target.append(element)
  element.select()

  // Explicit selection workaround for iOS
  element.selectionStart = 0
  element.selectionEnd = input.length

  let isSuccess = false
  try {
    isSuccess = document.execCommand('copy')
  } catch {}

  element.remove()

  if (originalRange) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus()
  }

  return isSuccess
}

export { copyTextToClipboard }
