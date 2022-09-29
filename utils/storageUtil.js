'use strict'

const storageUtil = {
  set: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: function (key) {
    const value = localStorage.getItem(key)
    if (!value) return
    if (value === 'undefined') return
    return JSON.parse(value)
  },
  del: function (key) {
    localStorage.removeItem(key)
  },
}

export default storageUtil
