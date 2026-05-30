import { useState, useEffect } from 'react'

const KEY = 'bayraq_notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(notifications)) } catch {}
  }, [notifications])

  const addNotification = (type, title, message, link = '') => {
    const n = {
      id: Date.now(),
      type, // success | warning | info | error
      title,
      message,
      link,
      read: false,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('ar-TN', { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString('ar-TN'),
    }
    setNotifications(p => [n, ...p].slice(0, 50))
  }

  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? {...n, read: true} : n))
  const markAllRead = () => setNotifications(p => p.map(n => ({...n, read: true})))
  const deleteNotif = (id) => setNotifications(p => p.filter(n => n.id !== id))
  const clearAll = () => setNotifications([])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, addNotification, markRead, markAllRead, deleteNotif, clearAll }
}
