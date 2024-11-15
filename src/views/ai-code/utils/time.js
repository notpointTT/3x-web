/**
 * 格式化时间
 * @param {string|number} time 时间字符串或时间戳
 * @param {string} format 格式化模板,默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return ''

  const date = new Date(time)

  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', time)
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const formatMap = {
    'YYYY': year,
    'MM': month,
    'DD': day,
    'HH': hours,
    'mm': minutes,
    'ss': seconds
  }

  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
    const value = formatMap[match]
    return value < 10 ? `0${value}` : `${value}`
  })
}

/**
 * 获取相对时间
 * @param {string|number} time 时间字符串或时间戳
 * @returns {string} 相对时间字符串
 */
export function getRelativeTime(time) {
  if (!time) return ''

  const date = new Date(time)

  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', time)
    return ''
  }

  const now = new Date().getTime()
  const diff = now - date.getTime()

  // 转换为秒
  const seconds = Math.floor(diff / 1000)

  // 小于1分钟
  if (seconds < 60) {
    return '刚刚'
  }

  // 转换为分钟
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟前`
  }

  // 转换为小时
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }

  // 转换为天
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}天前`
  }

  // 转换为月
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}个月前`
  }

  // 转换为年
  const years = Math.floor(months / 12)
  return `${years}年前`
}

/**
 * 判断是否为今天
 * @param {string|number} time 时间字符串或时间戳
 * @returns {boolean}
 */
export function isToday(time) {
  const date = new Date(time)
  const today = new Date()

  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

/**
 * 获取友好的时间显示
 * @param {string|number} time 时间字符串或时间戳
 * @returns {string} 友好的时间字符串
 */
export function getFriendlyTime(time) {
  if (!time) return ''

  if (isToday(time)) {
    const date = new Date(time)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `今天 ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
  }

  const relativeTime = getRelativeTime(time)
  if (relativeTime.includes('天前') && parseInt(relativeTime) <= 7) {
    return relativeTime
  }

  return formatTime(time, 'MM-DD HH:mm')
}

/**
 * 格式化持续时间
 * @param {number} duration 持续时间(秒)
 * @returns {string} 格式化后的持续时间字符串
 */
export function formatDuration(duration) {
  if (duration < 0) return '0秒'

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  const parts = []

  if (hours > 0) {
    parts.push(`${hours}小时`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}分钟`)
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}秒`)
  }

  return parts.join('')
}

export default {
  formatTime,
  getRelativeTime,
  isToday,
  getFriendlyTime,
  formatDuration
}
