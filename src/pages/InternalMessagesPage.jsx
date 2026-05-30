import { useState, useEffect, useRef } from 'react'
import { isSupabaseEnabled, supabase } from '../lib/supabase'

const KEY = 'bayraq_messages_internal'
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]') } catch { return [] } }
const saveLocal = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

export default function InternalMessagesPage({ currentUser, users }) {
  const [messages, setMessages] = useState(loadLocal)
  const [text, setText] = useState('')
  const [toUser, setToUser] = useState('all')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim()) return
    const msg = {
      id: Date.now(),
      from: currentUser?.username,
      fromName: currentUser?.name,
      to: toUser,
      text: text.trim(),
      time: new Date().toISOString(),
      read: false,
    }
    const updated = [...messages, msg]
    setMessages(updated)
    saveLocal(updated)
    setText('')

    if (isSupabaseEnabled && supabase) {
      try {
        await supabase.from('internal_messages').insert([{
          from_user: msg.from,
          from_name: msg.fromName,
          to_user: msg.to,
          message: msg.text,
          created_at: msg.time,
        }])
      } catch {}
    }
  }

  const visibleMessages = messages.filter(m =>
    m.to === 'all' ||
    m.from === currentUser?.username ||
    m.to === currentUser?.username
  )

  const otherUsers = users.filter(u => u.username !== currentUser?.username && u.active !== false)

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('ar-TN', {hour:'2-digit', minute:'2-digit'})
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'اليوم'
    return d.toLocaleDateString('ar-TN', {day:'numeric', month:'short'})
  }

  const ROLE_COLORS = {
    super_admin:'text-yellow-400', admin:'text-amber-400',
    finance:'text-emerald-400', staff:'text-blue-400', observer:'text-gray-400'
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{height:'calc(100vh - 120px)'}}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-0.5">💬 الرسائل الداخلية</h1>
        <p className="text-gray-400 text-sm">تواصل مع فريق العمل</p>
      </div>

      {/* الرسائل */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl border border-white/5 p-4 space-y-3 mb-4">
        {visibleMessages.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-2">
            <div className="text-4xl">💬</div>
            <div className="text-sm">لا توجد رسائل بعد — ابدأ المحادثة!</div>
          </div>
        ) : visibleMessages.map((msg, i) => {
          const isMe = msg.from === currentUser?.username
          const prevMsg = visibleMessages[i-1]
          const showDate = !prevMsg || formatDate(msg.time) !== formatDate(prevMsg.time)

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">{formatDate(msg.time)}</span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-start' : 'justify-end'} gap-2`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0 mt-1">
                    {msg.fromName?.split(' ')[0]?.[0]}
                  </div>
                )}
                <div className={`max-w-[75%] space-y-1 ${isMe?'items-start':'items-end'} flex flex-col`}>
                  {!isMe && (
                    <span className={`text-xs font-semibold ${ROLE_COLORS[users.find(u=>u.username===msg.from)?.role]||'text-gray-400'}`}>
                      {msg.fromName}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${isMe
                      ? 'rounded-br-sm text-white'
                      : 'rounded-bl-sm text-gray-100'}`}
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg, var(--accent,#0e90e0), var(--btn-to,#0560a8))'
                        : 'rgba(255,255,255,0.08)',
                    }}>
                    {msg.to !== 'all' && !isMe && (
                      <div className="text-xs opacity-60 mb-1">→ خاص</div>
                    )}
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-600">{formatTime(msg.time)}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* إرسال رسالة */}
      <div className="glass rounded-2xl p-3 border border-white/5 space-y-2">
        <div className="flex gap-2">
          <select value={toUser} onChange={e=>setToUser(e.target.value)}
            className="input-dark px-3 py-2 rounded-xl text-xs flex-shrink-0">
            <option value="all">📢 للكل</option>
            {otherUsers.map(u => (
              <option key={u.username} value={u.username}>→ {u.name}</option>
            ))}
          </select>
          <input value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
            placeholder="اكتب رسالتك... (Enter للإرسال)"
            className="input-dark flex-1 px-4 py-2 rounded-xl text-sm" />
          <button onClick={send} disabled={!text.trim()}
            className="btn-primary px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-40 flex-shrink-0">
            ↑
          </button>
        </div>
        <div className="text-xs text-gray-600 px-1">
          {toUser === 'all' ? '📢 سترسل للجميع' : `→ رسالة خاصة لـ ${users.find(u=>u.username===toUser)?.name}`}
        </div>
      </div>
    </div>
  )
}
