// تشفير بسيط للمتصفح (لا يوجد bcrypt في browser بدون node)
export function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `hashed_${Math.abs(hash).toString(36)}_${password.length}`
}

export function verifyPassword(password, hashed) {
  if (!hashed.startsWith('hashed_')) return password === hashed
  return hashPassword(password) === hashed
}

// سجل النشاط
const KEY_LOG = 'bayraq_activity_log'

export function logActivity(user, action, details = '') {
  try {
    const logs = JSON.parse(localStorage.getItem(KEY_LOG) || '[]')
    logs.unshift({
      id: Date.now(),
      user: user?.name || 'مجهول',
      username: user?.username || '',
      role: user?.role || '',
      action,
      details,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('ar-TN'),
      time: new Date().toLocaleTimeString('ar-TN'),
    })
    // احتفظ بآخر 500 سجل فقط
    localStorage.setItem(KEY_LOG, JSON.stringify(logs.slice(0, 500)))
  } catch (e) {}
}

export function getActivityLog() {
  try { return JSON.parse(localStorage.getItem(KEY_LOG) || '[]') } catch { return [] }
}

export function clearActivityLog() {
  localStorage.removeItem(KEY_LOG)
}
