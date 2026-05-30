import { useState, useRef, useEffect } from 'react'

const TYPE_STYLE = {
  success: { bg:'bg-emerald-500/15', border:'border-emerald-500/30', text:'text-emerald-300', dot:'bg-emerald-400', icon:'✅' },
  warning: { bg:'bg-amber-500/15',   border:'border-amber-500/30',   text:'text-amber-300',   dot:'bg-amber-400',   icon:'⚠️' },
  info:    { bg:'bg-blue-500/15',    border:'border-blue-500/30',    text:'text-blue-300',    dot:'bg-blue-400',    icon:'ℹ️' },
  error:   { bg:'bg-red-500/15',     border:'border-red-500/30',     text:'text-red-300',     dot:'bg-red-400',     icon:'❌' },
}

export default function NotificationsPanel({ notifications, unreadCount, onMarkRead, onMarkAllRead, onDelete, onClear, setTab }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // إغلاق بـ Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* زر الإشعارات */}
      <button onClick={() => setOpen(!open)}
        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all
          ${open ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'}`}>
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold px-1 animate-bounce shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* لوحة الإشعارات */}
      {open && (
        <>
          {/* overlay للهاتف */}
          <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => setOpen(false)} />

          <div className="fixed md:absolute z-50
            inset-x-2 bottom-16 md:bottom-auto md:inset-x-auto
            md:left-0 md:top-10
            w-auto md:w-80
            rounded-2xl overflow-hidden
            animate-scale-in"
            style={{
              background:'rgba(8,12,25,0.98)',
              border:'1px solid rgba(255,255,255,0.1)',
              backdropFilter:'blur(20px)',
              boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              maxHeight:'70vh',
              display:'flex',
              flexDirection:'column',
            }}>

            {/* الرأس */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-sm font-bold text-white">الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all">
                    قراءة الكل
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={onClear}
                    className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all">
                    مسح
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-300 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all text-lg">
                  ×
                </button>
              </div>
            </div>

            {/* قائمة الإشعارات */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="text-3xl">🔔</div>
                  <div className="text-sm text-gray-500">لا توجد إشعارات</div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {notifications.map(n => {
                    const style = TYPE_STYLE[n.type] || TYPE_STYLE.info
                    return (
                      <div key={n.id}
                        onClick={() => { onMarkRead(n.id); if(n.tab && setTab) { setTab(n.tab); setOpen(false) } }}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-white/[0.04]
                          ${!n.read ? 'bg-white/[0.02]' : ''}`}>

                        {/* نقطة الحالة */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${!n.read ? style.dot : 'bg-gray-700'}`}></div>
                        </div>

                        {/* المحتوى */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                              {style.icon} {n.title}
                            </div>
                            <button onClick={e => { e.stopPropagation(); onDelete(n.id) }}
                              className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 text-sm leading-none">
                              ×
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</div>
                          <div className="text-xs text-gray-700 mt-1">
                            {new Date(n.time).toLocaleTimeString('ar-TN', {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
