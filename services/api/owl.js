import http from '../../services/http/owl'

/**
 *
 * @param {mixin_access_token} String
 * @param {conversation_id} 标识群组
 * @returns
 * 登录获取owl令牌和用户信息
 */
export function owlSignIn(data) {
  return http.post('/oauth/mixin', { data })
}

// 获取用户订阅列表
export function getFollows(data) {
  return http.get('/subscriptions?enabled=true', { data })
}

// 获取用户退订列表
export function getUnFollows(data) {
  return http.get('/subscriptions?enabled=false', { data })
}

/**
 *
 * @param {channel_id} String
 * @returns
 * 取消关注Feed
 */
export function unfollowFeeds(channel_id, data = { enabled: false }) {
  return http.put(`/subscriptions/${channel_id}`, { data })
}

/**
 *
 * @param {channel_id} String
 * @returns
 * 取消关注Feed
 */
export function refollowFeeds(channel_id, data = { enabled: true }) {
  return http.put(`/subscriptions/${channel_id}`, { data })
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
 * @param {source} String
 * @param {text} String
 * @param {limit} Number optional
 * @param {continuous_key} String optional
 * @returns
 * 搜索源
 */
export function searchSource(data) {
  return http.post('/channels/search', { data })
}

/**
 *
 * @param {channel_id} String
 * @returns
 * 申请关注
 */
export function subscribeTopic(data) {
  return http.post('subscriptions', { data })
}

// 获取用户设置
export function getUserSettings(data) {
  return http.get('/users/me?settings', { data })
}

// 获取用户信息
export function getUserBalance() {
  return http.get('/users/me?wallets')
}

/**
 *
 * @param {data}
 * @returns
 * 更改用户设置
 */
export function updateUserSettings(data) {
  return http.put('/users/me', { data })
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
