import http from '../http/infowoods'

// ==============================================
// AUTH
// ==============================================

/**
 * @param {app} String App name
 * @param {mixin_access_token} String
 * @param {conversation_id} String 标识群组
 * @returns
 * 登录 InfoWoods 获取令牌和用户信息
 */
export function signIn_withMixin({ app, mixin_access_token, conversation_id }) {
  let data = {
    app,
    mixin_access_token,
    conversation_id,
  }
  return http.post('/oauth/mixin', { data })
}

/**
 *
 * @param {app} String App name
 * @param {conversation_id}
 * @returns
 * check if is group
 */
export function checkGroup({ app, conversation_id }) {
  const data = {
    app,
    conversation_id,
  }
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
// CHANNELS
// ==============================================

/**
 * Get fee of create channel
 *
 */
export function getFees_Channels() {
  return http.get('/channels/fees')
}

export function createChannel({ title, description }) {
  let data = {
    title,
    description,
  }
  return http.post('/channels', { data })
}

/**
 * Parse Source URI
 *
 * @param {uri} String
 * @returns
 */
export function parseSourceUri({ uri }) {
  let data = { uri }
  return http.post('/channels/parse', { data })
}

/**
 * Source Search
 *
 * @param {sourceType} String
 * @param {text} String
 * @param {limit} Number optional
 * @param {continuous_key} String optional
 * @returns
 */
export function sourceSearch({ sourceType, searchVal, limit, continuous_key }) {
  let data = { source: sourceType, text: searchVal }
  return http.post('/channels/search', { data })
}

/**
 * Get Owned Channels
 *
 */
export function getChannels() {
  return http.get('/channels')
}

/**
 * Read Channel Profile
 *
 * @param {channel_id} String
 * @returns
 */
export function readChannel({ channel_id }) {
  return http.get(`/channels/${channel_id}`)
}

/**
 * Modify Channel Profile
 *
 * @param {channel_id} String
 * @returns
 */
export function modifyChannel({
  channel_id,
  title,
  description,
  price_per_info,
  searchable,
}) {
  let data = {
    title,
    description,
    price_per_info,
    searchable,
  }

  return http.put(`/channels/${channel_id}`, { data })
}

// ----------------------------------------
// Publish Infos

/**
 * Get fees of infos
 *
 */
export function getFees_Infos({ channel_id }) {
  return http.get(`/channels/${channel_id}/infos/fees`)
}

/**
 * Publish a text info to a channel
 *
 * @param {text} String
 */
export function publishTextInfo({ channel_id, text, title, source }) {
  let info = { content_type: 'text', content_value: text }
  if (title) info.title = title
  if (source) info.source = source
  let data = { infos: [info] }
  return http.post(`/channels/${channel_id}/infos`, { data })
}

/**
 * Publish a markdown info to a channel
 *
 * @param {text} String
 */
export function publishMarkdownInfo({ channel_id, text, title, source }) {
  let info = { content_type: 'markdown', content_value: text }
  if (title) info.title = title
  if (source) info.source = source
  let data = { infos: [info] }
  return http.post(`/channels/${channel_id}/infos`, { data })
}

// ==============================================
// COLLECTIONS
// ==============================================

/**
 * Get collection
 *
 * @param {collection_id} String optional
 * @returns
 */
export function getCollection(collection_id) {
  if (!collection_id) {
    throw 'collection_id is empty'
  }
  return http.get(`/collections/${collection_id}`)
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
// ORDERS
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
 * @param {app} String App name
 * @returns pay links
 */
export function createOrder(app, goods_id) {
  let data = {
    app: app,
    goods_id: goods_id,
  }
  return http.post('/orders/create', { data })
}

/**
 * 查询订单状态
 * @param {app} String App name
 */
export function checkOrder({ app, mm_trace_id, mixpay_trace_id }) {
  let data = {
    app: app,
    mm_trace_id,
    mixpay_trace_id,
  }
  return http.post('/orders/payment', { data })
}
