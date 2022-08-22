import http from '../../services/http/owl'

/**
 *
 * @param {code} code 授权机器人后mixin返回的code
 * @param {conversation_id} 标识群组
 * @returns
 * 登录获取owl令牌和用户信息
 */
export function owlSignIn(data) {
  return http.post('/oauth/mixin', { data })
}

// 获取用户订阅列表
export function getFollows(data) {
  return http.get('/subscriptions', { data })
}

/**
 *
 * @param {channel_id} String
 * @returns
 * 取消关注Feed
 */
export function unfollowFeeds(data) {
  return http.post('/subscriptions', { data })
}

/**
 *
 * @param {uri} String
 * @returns
 * 解析RSS地址
 */
export function parseFeed(data) {
  return http.post('/channels/parse', { data })
}

/**
 *
 * @param {uri} String optional
 * @param {channel_id} String optional
 * @returns
 * 解析Channel地址
 */
export function parseTopic(channel_id) {
  return http.get(`/channels/${channel_id}`)
}

/**
 *
 * @param {channel_id} String
 * @returns
 * 申请关注
 */
export function subscribeTopic(channel_id) {
  return http.post(`subscriptions/${channel_id}`)
}

// 获取用户设置
export function getUserSettings(data) {
  return http.get('/users/me?settings', { data })
}

/**
 *
 * @param {data}
 * @returns
 * 更改用户设置
 */
export function updateUserSettings(data) {
  return http.put('/user/me', { settings: { data } })
}

/**
 *
 * @param {app_id} String
 * @param {trace_id} String
 * @returns
 * 查询订单状态
 */
export function checkOrder(data) {
  return http.post('/orders/payment', { data })
}
