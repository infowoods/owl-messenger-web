'use strict'

const storageUtil = {
  set: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: function (key) {
    const value = localStorage.getItem(key)
    if (!value) return
    if (value === 'undefined') return
    try {
      return JSON.parse(value)
    } catch {
      return
    }
  },
  del: function (key) {
    localStorage.removeItem(key)
  },
}

export default storageUtil
