import http from '../../services/http/owl'

// ==============================================
// AUTH
// ==============================================

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

/**
 *
 * @param {app} String
 * @param {conversation_id}
 * @returns
 * check if is group
 */
export function checkGroup(data) {
  return http.post('/oauth/mixin/is_group', { data })
}

// ==============================================
// SUBSCRIPTIONS
// ==============================================

// 获取用户订阅列表
export function getSubscriptions() {
  return http.get('/subscriptions?enabled=true')
}

// 获取用户退订列表
export function getSubscriptionHistory() {
  return http.get('/subscriptions?enabled=false')
}

/** 订阅频道
 * @param {channel_id} String
 * @returns
 */
export function subscribeChannel(channel_id) {
  let data = { channel_id }
  return http.post('subscriptions', { data })
}

/** 退订频道
 * @param {channel_id} String
 * @returns
 */
export function unsubscribeChannel(channel_id) {
  let data = { channel_id }
  return http.delete('subscriptions', { data })
}

/** （旧版）订阅列表
 */
export function oldVer_GetFollows() {
  const data = {
    action: 'list_follows',
  }
  return http.post('v1', { data })
}

/** （旧版）退订
 * @param {topic_id} String
 */
export function oldVer_Unfollow(topic_id) {
  const data = {
    action: 'unfollow',
    topic_id: topic_id,
  }
  return http.post('v1', { data })
}

// ==============================================
// CHANNELS & COLLECTIONS
// ==============================================

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
 * @param {collection_id} String optional
 * @returns
 * get collection
 */
export function getCollection(collection_id) {
  if (!collection_id) {
    throw 'collection_id is empty'
  }
  return http.get(`/collections/${collection_id}`)
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
export function searchSource(searchType, searchVal) {
  let data = { source: searchType, text: searchVal }
  return http.post('/channels/search', { data })
}

// ==============================================
// USERS
// ==============================================

// 获取用户设置
export function getUserSettings(data) {
  return http.get('/users/me?settings', { data })
}

// 获取用户信息
export function getUserWallets() {
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

// ==============================================
// TOP-UP
// ==============================================

/**
 *
 * Read Goods List
 */
export function listGoods() {
  return http.get('/orders/goods')
}

/**
 *
 * Create order
 * @returns pay links
 */
export function createOrder(goods_id) {
  let data = {
    app: 'owl',
    goods_id: goods_id,
  }
  return http.post('/orders/create', { data })
}

/**
 * 查询订单状态
 */
export function checkOrder({ mm_trace_id, mixpay_trace_id }) {
  let data = {
    app: 'owl',
    mm_trace_id,
    mixpay_trace_id,
  }
  return http.post('/orders/payment', { data })
}
