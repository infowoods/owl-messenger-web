import React from 'react'

export const CurrentLoginContext = React.createContext({})

export const LoginData = {
  token: null,
  user: null,
  group: null,
}

export function loginDataReducer(preState, action) {
  const { type } = action
  switch (type) {
    case 'token':
      return {
        ...preState,
        token: action.token,
      }
    case 'user':
      return {
        ...preState,
        user: action.user,
      }
    case 'group':
      return {
        ...preState,
        group: action.group,
      }
    default:
      return preState
  }
}
